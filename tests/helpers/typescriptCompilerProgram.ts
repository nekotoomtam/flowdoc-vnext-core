import { dirname, posix, resolve } from "node:path"
import * as ts from "typescript"

export type TypeScriptModuleSourceLoader = (modulePath: string) => string

export interface TypeScriptCompilerContext {
  checker: ts.TypeChecker
  program: ts.Program
  publicPathForSourceFile: (sourceFile: ts.SourceFile) => string | null
}

interface LoadedVirtualModule {
  publicPath: string
  source: string
}

export const rootPublicPath = "./index.ts"

const diagnosticText = (diagnostic: ts.Diagnostic): string =>
  ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")

const readRepoCompilerOptions = (): ts.CompilerOptions => {
  const configPath = ts.findConfigFile(
    ts.sys.getCurrentDirectory(),
    ts.sys.fileExists,
    "tsconfig.json",
  )
  if (configPath == null) throw new Error("Cannot find repository tsconfig.json")
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  if (config.error != null) throw new Error(diagnosticText(config.error))
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    dirname(configPath),
    undefined,
    configPath,
  )
  if (parsed.errors.length > 0) throw new Error(diagnosticText(parsed.errors[0]!))
  return { ...parsed.options, noEmit: true }
}

const compilerOptions = readRepoCompilerOptions()
const normalizeFileName = (fileName: string): string =>
  fileName.replaceAll("\\", "/")

// This maps a literal to a loader key only; ts.resolveModuleName below remains
// the sole authority that chooses extensions, package metadata, or index files.
export const normalizeModulePath = (
  containingPublicPath: string,
  specifier: string,
): string => {
  if (!specifier.startsWith(".")) return specifier
  const normalized = posix.normalize(
    posix.join(posix.dirname(containingPublicPath), specifier),
  )
  return normalized.startsWith(".") ? normalized : `./${normalized}`
}

export const createTypeScriptCompilerContext = (
  rootSource: string,
  loadModuleSource: TypeScriptModuleSourceLoader,
): TypeScriptCompilerContext => {
  const virtualDirectory = normalizeFileName(resolve(".typescript-export-resolver"))
  const rootFileName = `${virtualDirectory}/index.ts`
  const host = ts.createCompilerHost(compilerOptions, true)
  const defaultDirectoryExists = host.directoryExists?.bind(host)
  const defaultFileExists = host.fileExists.bind(host)
  const defaultGetSourceFile = host.getSourceFile.bind(host)
  const defaultReadFile = host.readFile.bind(host)
  const defaultRealpath = host.realpath?.bind(host)
  const canonicalFileName = (fileName: string): string =>
    host.getCanonicalFileName(normalizeFileName(fileName))
  const canonicalVirtualDirectory = canonicalFileName(virtualDirectory)
  const loadedModules = new Map<string, LoadedVirtualModule>([
    [
      canonicalFileName(rootFileName),
      { publicPath: rootPublicPath, source: rootSource },
    ],
  ])
  const missingLoaderPaths = new Set<string>()
  let requestedPublicPath: string | null = null

  const publicPathForVirtualFile = (fileName: string): string | null => {
    const normalized = normalizeFileName(fileName)
    const canonical = canonicalFileName(normalized)
    if (
      canonical !== canonicalVirtualDirectory
      && !canonical.startsWith(`${canonicalVirtualDirectory}/`)
    ) {
      return null
    }
    const relative = normalized.slice(virtualDirectory.length).replace(/^\/+/u, "")
    return relative.length === 0 ? "." : `./${relative}`
  }

  const loadVirtualFile = (fileName: string): LoadedVirtualModule | null => {
    const canonical = canonicalFileName(fileName)
    const cached = loadedModules.get(canonical)
    if (cached != null) return cached
    const candidatePublicPath = publicPathForVirtualFile(fileName)
    if (candidatePublicPath == null) return null
    const loaderPaths = [...new Set(
      [requestedPublicPath, candidatePublicPath]
        .filter((path): path is string => path != null && path.startsWith(".")),
    )]
    for (const loaderPath of loaderPaths) {
      if (missingLoaderPaths.has(loaderPath)) continue
      try {
        const loaded = {
          publicPath: loaderPath,
          source: loadModuleSource(loaderPath),
        }
        loadedModules.set(canonical, loaded)
        return loaded
      } catch {
        missingLoaderPaths.add(loaderPath)
      }
    }
    return null
  }

  host.directoryExists = (directoryName) => {
    const canonical = canonicalFileName(directoryName)
    if (
      canonical === canonicalVirtualDirectory
      || canonical.startsWith(`${canonicalVirtualDirectory}/`)
    ) {
      return true
    }
    return defaultDirectoryExists?.(directoryName) ?? false
  }
  host.fileExists = (fileName) =>
    loadVirtualFile(fileName) != null || defaultFileExists(fileName)
  host.readFile = (fileName) =>
    loadVirtualFile(fileName)?.source ?? defaultReadFile(fileName)
  host.realpath = (fileName) =>
    publicPathForVirtualFile(fileName) == null
      ? defaultRealpath?.(fileName) ?? fileName
      : normalizeFileName(fileName)
  host.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const loaded = loadVirtualFile(fileName)
    return loaded == null
      ? defaultGetSourceFile(
          fileName,
          languageVersionOrOptions,
          onError,
          shouldCreateNewSourceFile,
        )
      : ts.createSourceFile(
          fileName,
          loaded.source,
          languageVersionOrOptions,
          true,
        )
  }

  const resolutionCache = ts.createModuleResolutionCache(
    ts.sys.getCurrentDirectory(),
    host.getCanonicalFileName,
    compilerOptions,
  )
  host.resolveModuleNameLiterals = (
    moduleLiterals,
    containingFile,
    redirectedReference,
    options,
    containingSourceFile,
  ) => moduleLiterals.map((moduleLiteral) => {
    const containingPublicPath = loadedModules
      .get(canonicalFileName(containingFile))?.publicPath
      ?? publicPathForVirtualFile(containingFile)
      ?? rootPublicPath
    requestedPublicPath = normalizeModulePath(
      containingPublicPath,
      moduleLiteral.text,
    )
    try {
      return ts.resolveModuleName(
        moduleLiteral.text,
        containingFile,
        options,
        host,
        resolutionCache,
        redirectedReference,
        ts.getModeForUsageLocation(
          containingSourceFile,
          moduleLiteral,
          options,
        ),
      )
    } finally {
      requestedPublicPath = null
    }
  })

  const program = ts.createProgram([rootFileName], compilerOptions, host)
  return {
    checker: program.getTypeChecker(),
    program,
    publicPathForSourceFile: (sourceFile) =>
      loadedModules.get(canonicalFileName(sourceFile.fileName))?.publicPath
      ?? publicPathForVirtualFile(sourceFile.fileName),
  }
}
