import { posix } from "node:path"
import * as ts from "typescript"

export type TypeScriptModuleSourceLoader = (modulePath: string) => string

export interface TypeScriptRootExportResolution {
  rootModulePaths: ReadonlySet<string>
  rootLocalSymbols: ReadonlySet<string>
  resolvedSymbolsByRootModule: ReadonlyMap<string, ReadonlySet<string>>
  traversedModulePaths: ReadonlySet<string>
}

interface NamedReExport {
  modulePath: string
  importedName: string
  exportedName: string
}

interface ModuleExports {
  localExports: Set<string>
  namedReExports: NamedReExport[]
  wildcardReExports: string[]
  dependencyPaths: Set<string>
}

interface ParsedExportDeclaration {
  modulePath: string
  kind: "named" | "namespace" | "wildcard"
  importedName?: string
  exportedName?: string
}

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind): boolean =>
  ts.canHaveModifiers(node)
  && (ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) ?? false)

const collectBindingNames = (name: ts.BindingName, output: Set<string>): void => {
  if (ts.isIdentifier(name)) {
    output.add(name.text)
    return
  }
  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) collectBindingNames(element.name, output)
  }
}

const moduleSpecifierText = (
  moduleSpecifier: ts.Expression | undefined,
): string | null => moduleSpecifier != null && ts.isStringLiteralLike(moduleSpecifier)
  ? moduleSpecifier.text
  : null

const canonicalModulePath = (fromModulePath: string | null, specifier: string): string => {
  if (!specifier.startsWith(".")) return specifier
  const baseDirectory = fromModulePath == null ? "." : posix.dirname(fromModulePath)
  const joined = posix.normalize(posix.join(baseDirectory, specifier))
  return joined.startsWith(".") ? joined : `./${joined}`
}

const parseImportedBindings = (
  sourceFile: ts.SourceFile,
  fromModulePath: string,
): Map<string, { modulePath: string; importedName: string | null }> => {
  const bindings = new Map<string, { modulePath: string; importedName: string | null }>()
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = moduleSpecifierText(statement.moduleSpecifier)
    if (specifier == null || statement.importClause == null) continue
    const modulePath = canonicalModulePath(fromModulePath, specifier)
    if (statement.importClause.name != null) {
      bindings.set(statement.importClause.name.text, {
        modulePath,
        importedName: "default",
      })
    }
    const namedBindings = statement.importClause.namedBindings
    if (namedBindings == null) continue
    if (ts.isNamespaceImport(namedBindings)) {
      bindings.set(namedBindings.name.text, { modulePath, importedName: null })
      continue
    }
    for (const element of namedBindings.elements) {
      bindings.set(element.name.text, {
        modulePath,
        importedName: element.propertyName?.text ?? element.name.text,
      })
    }
  }
  return bindings
}

const collectDirectExportSymbols = (
  statement: ts.Statement,
  output: Set<string>,
): void => {
  if (ts.isExportAssignment(statement)) {
    output.add(statement.isExportEquals ? "export=" : "default")
    return
  }
  if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) return
  if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) {
    output.add("default")
    return
  }
  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) {
      collectBindingNames(declaration.name, output)
    }
    return
  }
  if (
    ts.isFunctionDeclaration(statement)
    || ts.isClassDeclaration(statement)
    || ts.isInterfaceDeclaration(statement)
    || ts.isTypeAliasDeclaration(statement)
    || ts.isEnumDeclaration(statement)
    || ts.isModuleDeclaration(statement)
  ) {
    if (statement.name != null) output.add(statement.name.text)
  }
}

const parseRootExports = (
  sourceFile: ts.SourceFile,
): {
  declarations: ParsedExportDeclaration[]
  localExports: Set<string>
} => {
  const declarations: ParsedExportDeclaration[] = []
  const localExports = new Set<string>()
  const importedBindings = parseImportedBindings(sourceFile, "./index.ts")
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) {
      collectDirectExportSymbols(statement, localExports)
      continue
    }
    const specifier = moduleSpecifierText(statement.moduleSpecifier)
    const modulePath = specifier == null
      ? null
      : canonicalModulePath(null, specifier)
    if (statement.exportClause == null) {
      if (modulePath != null) declarations.push({ modulePath, kind: "wildcard" })
      continue
    }
    if (ts.isNamespaceExport(statement.exportClause)) {
      if (modulePath != null) {
        declarations.push({
          modulePath,
          kind: "namespace",
          exportedName: statement.exportClause.name.text,
        })
      }
      continue
    }
    for (const element of statement.exportClause.elements) {
      const importedName = element.propertyName?.text ?? element.name.text
      const exportedName = element.name.text
      if (modulePath == null) {
        const binding = importedBindings.get(importedName)
        if (binding == null) {
          localExports.add(exportedName)
          continue
        }
        declarations.push(binding.importedName == null
          ? {
              modulePath: binding.modulePath,
              kind: "namespace",
              exportedName,
            }
          : {
              modulePath: binding.modulePath,
              kind: "named",
              importedName: binding.importedName,
              exportedName,
            })
        continue
      }
      declarations.push({
        modulePath,
        kind: "named",
        importedName,
        exportedName,
      })
    }
  }
  return { declarations, localExports }
}

const parseModuleExports = (
  modulePath: string,
  source: string,
): ModuleExports => {
  const sourceFile = ts.createSourceFile(
    modulePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const importedBindings = parseImportedBindings(sourceFile, modulePath)
  const localExports = new Set<string>()
  const namedReExports: NamedReExport[] = []
  const wildcardReExports: string[] = []
  const dependencyPaths = new Set<string>()

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      const specifier = moduleSpecifierText(statement.moduleSpecifier)
      const targetPath = specifier == null
        ? null
        : canonicalModulePath(modulePath, specifier)
      if (statement.exportClause == null) {
        if (targetPath != null) {
          wildcardReExports.push(targetPath)
          dependencyPaths.add(targetPath)
        }
        continue
      }
      if (ts.isNamespaceExport(statement.exportClause)) {
        localExports.add(statement.exportClause.name.text)
        if (targetPath != null) dependencyPaths.add(targetPath)
        continue
      }
      for (const element of statement.exportClause.elements) {
        const importedName = element.propertyName?.text ?? element.name.text
        const exportedName = element.name.text
        if (targetPath != null) {
          namedReExports.push({ modulePath: targetPath, importedName, exportedName })
          dependencyPaths.add(targetPath)
          continue
        }
        const importedBinding = importedBindings.get(importedName)
        if (importedBinding == null) {
          localExports.add(exportedName)
          continue
        }
        dependencyPaths.add(importedBinding.modulePath)
        if (importedBinding.importedName == null) {
          localExports.add(exportedName)
          continue
        }
        namedReExports.push({
          modulePath: importedBinding.modulePath,
          importedName: importedBinding.importedName,
          exportedName,
        })
      }
      continue
    }
    collectDirectExportSymbols(statement, localExports)
  }

  return { localExports, namedReExports, wildcardReExports, dependencyPaths }
}

const loadExportGraph = (
  rootModulePaths: readonly string[],
  loadModuleSource: TypeScriptModuleSourceLoader,
): Map<string, ModuleExports> => {
  const graph = new Map<string, ModuleExports>()
  const visit = (modulePath: string): void => {
    if (graph.has(modulePath)) return
    const parsed = parseModuleExports(modulePath, loadModuleSource(modulePath))
    graph.set(modulePath, parsed)
    for (const dependencyPath of parsed.dependencyPaths) visit(dependencyPath)
  }
  for (const modulePath of rootModulePaths) visit(modulePath)
  return graph
}

const resolveModuleSymbolSets = (
  graph: ReadonlyMap<string, ModuleExports>,
): Map<string, Set<string>> => {
  const resolved = new Map(
    [...graph].map(([modulePath, exports]) => [
      modulePath,
      new Set(exports.localExports),
    ]),
  )
  let changed = true
  while (changed) {
    changed = false
    for (const [modulePath, exports] of graph) {
      const moduleSymbols = resolved.get(modulePath)!
      for (const reExport of exports.namedReExports) {
        if (
          resolved.get(reExport.modulePath)?.has(reExport.importedName) === true
          && !moduleSymbols.has(reExport.exportedName)
        ) {
          moduleSymbols.add(reExport.exportedName)
          changed = true
        }
      }
      for (const targetPath of exports.wildcardReExports) {
        for (const symbol of resolved.get(targetPath) ?? []) {
          if (symbol === "default" || moduleSymbols.has(symbol)) continue
          moduleSymbols.add(symbol)
          changed = true
        }
      }
    }
  }
  for (const exports of graph.values()) {
    for (const reExport of exports.namedReExports) {
      if (resolved.get(reExport.modulePath)?.has(reExport.importedName) !== true) {
        throw new Error(
          `Cannot resolve re-exported symbol ${reExport.importedName} from ${reExport.modulePath}`,
        )
      }
    }
  }
  return resolved
}

export const resolveTypeScriptRootExports = (
  rootSource: string,
  loadModuleSource: TypeScriptModuleSourceLoader,
  includeRootModule: (modulePath: string) => boolean = () => true,
): TypeScriptRootExportResolution => {
  const rootFile = ts.createSourceFile(
    "index.ts",
    rootSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const {
    declarations: rootDeclarations,
    localExports: rootLocalSymbols,
  } = parseRootExports(rootFile)
  const rootModulePaths = new Set(rootDeclarations.map(({ modulePath }) => modulePath))
  const selectedDeclarations = rootDeclarations.filter(({ modulePath }) =>
    includeRootModule(modulePath))
  const selectedRootModulePaths = [...new Set(
    selectedDeclarations.map(({ modulePath }) => modulePath),
  )]
  const graph = loadExportGraph(selectedRootModulePaths, loadModuleSource)
  const resolvedModules = resolveModuleSymbolSets(graph)
  const resolvedSymbolsByRootModule = new Map<string, Set<string>>()

  for (const declaration of selectedDeclarations) {
    const rootSymbols = resolvedSymbolsByRootModule.get(declaration.modulePath)
      ?? new Set<string>()
    resolvedSymbolsByRootModule.set(declaration.modulePath, rootSymbols)
    if (declaration.kind === "namespace") {
      rootSymbols.add(declaration.exportedName!)
      continue
    }
    const targetSymbols = resolvedModules.get(declaration.modulePath)!
    if (declaration.kind === "wildcard") {
      for (const symbol of targetSymbols) {
        if (symbol !== "default") rootSymbols.add(symbol)
      }
      continue
    }
    if (!targetSymbols.has(declaration.importedName!)) {
      throw new Error(
        `Cannot resolve root re-export ${declaration.importedName} from ${declaration.modulePath}`,
      )
    }
    rootSymbols.add(declaration.exportedName!)
  }

  return {
    rootModulePaths,
    rootLocalSymbols,
    resolvedSymbolsByRootModule,
    traversedModulePaths: new Set(graph.keys()),
  }
}
