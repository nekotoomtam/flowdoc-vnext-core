import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"

const sandboxRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = path.resolve(sandboxRoot, "..", "..")
const coreEntryPath = path.join(repoRoot, "src", "index.ts")
const fixtureRoot = path.join(repoRoot, "fixtures")

function fileUrl(filePath) {
  return pathToFileURL(filePath).href
}

function resolveLocalTs(specifier, parentUrl) {
  if (!parentUrl || !parentUrl.startsWith("file:")) return null

  const parentDir = path.dirname(fileURLToPath(parentUrl))
  const resolvedPath = path.resolve(parentDir, specifier)

  if (specifier.endsWith(".js")) {
    const tsPath = `${resolvedPath.slice(0, -3)}.ts`
    if (existsSync(tsPath)) return fileUrl(tsPath)
  }

  if (existsSync(resolvedPath)) return fileUrl(resolvedPath)
  if (existsSync(`${resolvedPath}.ts`)) return fileUrl(`${resolvedPath}.ts`)

  return null
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "@flowdoc/vnext-core") {
    return { url: fileUrl(coreEntryPath), shortCircuit: true }
  }

  if (specifier.startsWith("@flowdoc/vnext-core/fixtures/")) {
    const fixturePath = specifier.slice("@flowdoc/vnext-core/fixtures/".length)
    return { url: fileUrl(path.join(fixtureRoot, fixturePath)), shortCircuit: true }
  }

  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    const localUrl = resolveLocalTs(specifier, context.parentURL)
    if (localUrl != null) return { url: localUrl, shortCircuit: true }
  }

  return defaultResolve(specifier, context, defaultResolve)
}

export async function load(url, context, defaultLoad) {
  if (!url.endsWith(".ts")) return defaultLoad(url, context, defaultLoad)

  const source = await readFile(fileURLToPath(url), "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: fileURLToPath(url),
  })

  return {
    format: "module",
    shortCircuit: true,
    source: output.outputText,
  }
}
