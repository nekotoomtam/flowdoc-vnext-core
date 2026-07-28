import * as ts from "typescript"
import {
  createTypeScriptCompilerContext,
  normalizeModulePath,
  rootPublicPath,
  type TypeScriptModuleSourceLoader,
} from "./typescriptCompilerProgram.js"

export type { TypeScriptModuleSourceLoader } from "./typescriptCompilerProgram.js"

export interface TypeScriptRootExportResolution {
  rootModulePaths: ReadonlySet<string>
  rootLocalSymbols: ReadonlySet<string>
  resolvedSymbolsByRootModule: ReadonlyMap<string, ReadonlySet<string>>
  traversedModulePaths: ReadonlySet<string>
}

interface RootContribution {
  exportedName: string
  kind: "explicit" | "wildcard"
  modulePath: string
  symbol: ts.Symbol
  targetModule: ts.Symbol
}

const moduleSpecifierText = (
  moduleSpecifier: ts.Expression | undefined,
): string | null => moduleSpecifier != null && ts.isStringLiteralLike(moduleSpecifier)
  ? moduleSpecifier.text
  : null

const moduleExportNameText = (name: ts.ModuleExportName): string => name.text

const resolveAlias = (
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): ts.Symbol => {
  let resolved = symbol
  const visited = new Set<ts.Symbol>()
  while (
    (resolved.flags & ts.SymbolFlags.Alias) !== 0
    && !visited.has(resolved)
  ) {
    visited.add(resolved)
    const next = checker.getAliasedSymbol(resolved)
    if (next === resolved) break
    resolved = next
  }
  return resolved
}

const symbolsAreEquivalent = (
  checker: ts.TypeChecker,
  left: ts.Symbol,
  right: ts.Symbol,
): boolean => resolveAlias(checker, left) === resolveAlias(checker, right)

const symbolHasTypeMeaning = (
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): boolean => (
  resolveAlias(checker, symbol).flags
  & (ts.SymbolFlags.Type | ts.SymbolFlags.Namespace)
) !== 0

const sourceFileForModule = (
  checker: ts.TypeChecker,
  moduleSymbol: ts.Symbol,
): ts.SourceFile | null => {
  const resolved = resolveAlias(checker, moduleSymbol)
  return resolved.declarations?.find(ts.isSourceFile) ?? null
}

const targetModuleAtSpecifier = (
  checker: ts.TypeChecker,
  moduleSpecifier: ts.Expression,
): ts.Symbol => {
  const symbol = checker.getSymbolAtLocation(moduleSpecifier)
  const specifier = moduleSpecifierText(moduleSpecifier) ?? "<non-literal>"
  if (symbol == null) throw new Error(`Cannot resolve module ${specifier}`)
  return resolveAlias(checker, symbol)
}

const importedModuleForSymbol = (
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): { modulePath: string; targetModule: ts.Symbol } | null => {
  for (const declaration of symbol.declarations ?? []) {
    const importDeclaration = ts.findAncestor(
      declaration,
      ts.isImportDeclaration,
    )
    if (importDeclaration == null) continue
    const modulePath = moduleSpecifierText(importDeclaration.moduleSpecifier)
    if (modulePath == null) continue
    return {
      modulePath,
      targetModule: targetModuleAtSpecifier(
        checker,
        importDeclaration.moduleSpecifier,
      ),
    }
  }
  return null
}

const createEffectiveExportResolver = (
  checker: ts.TypeChecker,
): ((moduleSymbol: ts.Symbol) => ReadonlyMap<string, ts.Symbol>) => {
  // The public checker returns the first star collision while reporting TS2308,
  // and returns value symbols behind `export type *`. Keep its resolved symbols
  // and aliases, but omit precisely those two non-exportable cases.
  const cache = new Map<ts.Symbol, ReadonlyMap<string, ts.Symbol>>()
  const resolving = new Set<ts.Symbol>()

  const rawExports = (moduleSymbol: ts.Symbol): Map<string, ts.Symbol> =>
    new Map(
      checker.getExportsOfModule(moduleSymbol)
        .map((symbol) => [symbol.getName(), symbol]),
    )

  const resolveEffectiveExports = (
    unresolvedModuleSymbol: ts.Symbol,
  ): ReadonlyMap<string, ts.Symbol> => {
    const moduleSymbol = resolveAlias(checker, unresolvedModuleSymbol)
    const cached = cache.get(moduleSymbol)
    if (cached != null) return cached
    const raw = rawExports(moduleSymbol)
    if (resolving.has(moduleSymbol)) return raw
    const sourceFile = sourceFileForModule(checker, moduleSymbol)
    if (sourceFile == null) {
      cache.set(moduleSymbol, raw)
      return raw
    }

    const wildcardDeclarations = sourceFile.statements.filter(
      (statement): statement is ts.ExportDeclaration =>
        ts.isExportDeclaration(statement)
        && statement.exportClause == null
        && statement.moduleSpecifier != null,
    )
    if (wildcardDeclarations.length === 0) {
      cache.set(moduleSymbol, raw)
      return raw
    }

    resolving.add(moduleSymbol)
    try {
      const explicitNames = new Set<string>()
      for (const symbol of moduleSymbol.exports?.values() ?? []) {
        if (symbol.getName() !== "__export") explicitNames.add(symbol.getName())
      }
      const wildcardSymbols = new Map<string, ts.Symbol[]>()
      for (const declaration of wildcardDeclarations) {
        const targetModule = targetModuleAtSpecifier(
          checker,
          declaration.moduleSpecifier!,
        )
        for (const [name, symbol] of resolveEffectiveExports(targetModule)) {
          if (
            name === "default"
            || declaration.isTypeOnly && !symbolHasTypeMeaning(checker, symbol)
          ) {
            continue
          }
          const symbols = wildcardSymbols.get(name) ?? []
          symbols.push(symbol)
          wildcardSymbols.set(name, symbols)
        }
      }

      const effective = new Map<string, ts.Symbol>()
      for (const name of explicitNames) {
        const symbol = raw.get(name)
        if (symbol != null) effective.set(name, symbol)
      }
      for (const [name, symbols] of wildcardSymbols) {
        if (explicitNames.has(name)) continue
        const distinctSymbols: ts.Symbol[] = []
        for (const symbol of symbols) {
          if (
            !distinctSymbols.some((candidate) =>
              symbolsAreEquivalent(checker, candidate, symbol))
          ) {
            distinctSymbols.push(symbol)
          }
        }
        if (distinctSymbols.length !== 1) continue
        const rawSymbol = raw.get(name)
        effective.set(name, rawSymbol ?? distinctSymbols[0]!)
      }
      cache.set(moduleSymbol, effective)
      return effective
    } finally {
      resolving.delete(moduleSymbol)
    }
  }

  return resolveEffectiveExports
}

const collectRootContributions = (
  rootFile: ts.SourceFile,
  checker: ts.TypeChecker,
  effectiveExports: (moduleSymbol: ts.Symbol) => ReadonlyMap<string, ts.Symbol>,
): {
  contributions: RootContribution[]
  rootModulePaths: Set<string>
  rootModuleTargets: Array<{ modulePath: string; targetModule: ts.Symbol }>
} => {
  const contributions: RootContribution[] = []
  const rootModulePaths = new Set<string>()
  const rootModuleTargets: Array<{ modulePath: string; targetModule: ts.Symbol }> = []

  for (const statement of rootFile.statements) {
    if (
      !ts.isExportDeclaration(statement)
      || statement.exportClause == null && statement.moduleSpecifier == null
    ) {
      continue
    }
    const directModulePath = moduleSpecifierText(statement.moduleSpecifier)
    if (directModulePath != null) {
      rootModulePaths.add(directModulePath)
      const targetModule = targetModuleAtSpecifier(
        checker,
        statement.moduleSpecifier!,
      )
      rootModuleTargets.push({ modulePath: directModulePath, targetModule })
      if (statement.exportClause == null) {
        for (const [exportedName, symbol] of effectiveExports(targetModule)) {
          if (
            exportedName === "default"
            || statement.isTypeOnly && !symbolHasTypeMeaning(checker, symbol)
          ) {
            continue
          }
          contributions.push({
            exportedName,
            kind: "wildcard",
            modulePath: directModulePath,
            symbol,
            targetModule,
          })
        }
        continue
      }
      if (ts.isNamespaceExport(statement.exportClause)) {
        contributions.push({
          exportedName: statement.exportClause.name.text,
          kind: "explicit",
          modulePath: directModulePath,
          symbol: targetModule,
          targetModule,
        })
        continue
      }
      const targetExports = effectiveExports(targetModule)
      for (const element of statement.exportClause.elements) {
        const importedName = moduleExportNameText(
          element.propertyName ?? element.name,
        )
        const symbol = targetExports.get(importedName)
        if (symbol == null) {
          throw new Error(
            `Cannot resolve re-exported symbol ${importedName} from ${directModulePath}`,
          )
        }
        if (
          (statement.isTypeOnly || element.isTypeOnly)
          && !symbolHasTypeMeaning(checker, symbol)
        ) {
          continue
        }
        contributions.push({
          exportedName: moduleExportNameText(element.name),
          kind: "explicit",
          modulePath: directModulePath,
          symbol,
          targetModule,
        })
      }
      continue
    }
    const exportClause = statement.exportClause
    if (exportClause == null || !ts.isNamedExports(exportClause)) continue
    for (const element of exportClause.elements) {
      const localTarget = checker.getExportSpecifierLocalTargetSymbol(element)
      if (localTarget == null) continue
      const imported = importedModuleForSymbol(checker, localTarget)
      if (imported == null) continue
      rootModulePaths.add(imported.modulePath)
      rootModuleTargets.push(imported)
      const symbol = resolveAlias(checker, localTarget)
      if (
        (statement.isTypeOnly || element.isTypeOnly)
        && !symbolHasTypeMeaning(checker, symbol)
      ) {
        continue
      }
      contributions.push({
        exportedName: moduleExportNameText(element.name),
        kind: "explicit",
        modulePath: imported.modulePath,
        symbol,
        targetModule: imported.targetModule,
      })
    }
  }
  return { contributions, rootModulePaths, rootModuleTargets }
}

const collectTraversedReExportModules = (
  rootModules: readonly ts.Symbol[],
  checker: ts.TypeChecker,
  publicPathForSourceFile: (sourceFile: ts.SourceFile) => string | null,
): Set<string> => {
  const traversed = new Set<string>()
  const visited = new Set<ts.Symbol>()

  const visit = (unresolvedModule: ts.Symbol, fallbackPath?: string): void => {
    const moduleSymbol = resolveAlias(checker, unresolvedModule)
    const sourceFile = sourceFileForModule(checker, moduleSymbol)
    const publicPath = sourceFile == null
      ? fallbackPath ?? null
      : publicPathForSourceFile(sourceFile) ?? fallbackPath ?? null
    if (publicPath != null) traversed.add(publicPath)
    if (visited.has(moduleSymbol) || sourceFile == null) return
    visited.add(moduleSymbol)

    for (const statement of sourceFile.statements) {
      if (!ts.isExportDeclaration(statement)) continue
      if (statement.moduleSpecifier != null) {
        const modulePath = moduleSpecifierText(statement.moduleSpecifier)
        visit(
          targetModuleAtSpecifier(checker, statement.moduleSpecifier),
          modulePath == null
            ? undefined
            : normalizeModulePath(publicPath ?? rootPublicPath, modulePath),
        )
        continue
      }
      const exportClause = statement.exportClause
      if (exportClause == null || !ts.isNamedExports(exportClause)) continue
      for (const element of exportClause.elements) {
        const localTarget = checker.getExportSpecifierLocalTargetSymbol(element)
        if (localTarget == null) continue
        const imported = importedModuleForSymbol(checker, localTarget)
        if (imported == null) continue
        visit(
          imported.targetModule,
          normalizeModulePath(
            publicPath ?? rootPublicPath,
            imported.modulePath,
          ),
        )
      }
    }
  }

  for (const moduleSymbol of rootModules) visit(moduleSymbol)
  return traversed
}

export const resolveTypeScriptRootExports = (
  rootSource: string,
  loadModuleSource: TypeScriptModuleSourceLoader,
  includeRootModule: (modulePath: string) => boolean = () => true,
): TypeScriptRootExportResolution => {
  const {
    checker,
    program,
    publicPathForSourceFile,
  } = createTypeScriptCompilerContext(rootSource, loadModuleSource)
  const rootFile = program.getSourceFiles().find((sourceFile) =>
    publicPathForSourceFile(sourceFile) === rootPublicPath)
  if (rootFile == null) throw new Error("Cannot load synthetic root module")
  const rootSymbol = checker.getSymbolAtLocation(rootFile)
  if (rootSymbol == null) throw new Error("Synthetic root is not a module")
  const effectiveExports = createEffectiveExportResolver(checker)
  const rootExports = effectiveExports(rootSymbol)
  const {
    contributions,
    rootModulePaths,
    rootModuleTargets,
  } = collectRootContributions(
    rootFile,
    checker,
    effectiveExports,
  )
  const selectedContributions = contributions.filter(({ modulePath }) =>
    includeRootModule(modulePath))
  const selectedRootModuleTargets = rootModuleTargets.filter(({ modulePath }) =>
    includeRootModule(modulePath))
  const resolvedSymbolsByRootModule = new Map<string, Set<string>>()
  for (const { modulePath } of selectedRootModuleTargets) {
    if (!resolvedSymbolsByRootModule.has(modulePath)) {
      resolvedSymbolsByRootModule.set(modulePath, new Set())
    }
  }
  for (const contribution of selectedContributions) {
    const rootExport = rootExports.get(contribution.exportedName)
    if (
      rootExport != null
      && symbolsAreEquivalent(checker, rootExport, contribution.symbol)
    ) {
      resolvedSymbolsByRootModule.get(contribution.modulePath)!
        .add(contribution.exportedName)
    }
  }

  const rootLocalSymbols = new Set<string>()
  for (const [name, symbol] of rootExports) {
    const resolved = resolveAlias(checker, symbol)
    if (
      resolved.declarations?.some((declaration) =>
        declaration.getSourceFile() === rootFile)
    ) {
      rootLocalSymbols.add(name)
    }
  }

  const selectedRootModules = [...new Set(
    selectedRootModuleTargets.map(({ targetModule }) => targetModule),
  )]
  return {
    rootModulePaths,
    rootLocalSymbols,
    resolvedSymbolsByRootModule,
    traversedModulePaths: collectTraversedReExportModules(
      selectedRootModules,
      checker,
      publicPathForSourceFile,
    ),
  }
}
