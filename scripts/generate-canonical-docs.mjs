import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { GENERATED_PATHS, loadCanonicalDocumentationModel } from "./documentation/canonical-docs-model.mjs"
import { renderGeneratedFiles } from "./documentation/canonical-docs-render.mjs"

function rootFrom(argv) {
  if (argv.length === 0) return process.cwd()
  if (argv.length === 2 && argv[0] === "--root" && argv[1]) return resolve(argv[1])
  throw new Error("usage: node scripts/generate-canonical-docs.mjs [--root <absolute-or-relative-root>]")
}

export function generateCanonicalDocs(root) {
  const normalizedRoot = resolve(root)
  let release
  try { release = JSON.parse(readFileSync(join(normalizedRoot, "docs/versions/0_1/release.json"), "utf8")) } catch { release = undefined }
  const pending = release?.lifecycle === "planned" && release?.releaseVersion === "unversioned" && release?.releaseReady === false ? release.baselineId : undefined
  const model = loadCanonicalDocumentationModel(normalizedRoot, pending === undefined ? {} : { allowPendingBaselineId: pending })
  const rendered = renderGeneratedFiles(model)
  for (const path of GENERATED_PATHS) {
    const output = rendered[path]
    if (typeof output !== "string") throw new Error(`renderer did not produce ${path}`)
    const destination = join(model.root, path)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, output, "utf8")
  }
  return rendered
}

function main() {
  try {
    generateCanonicalDocs(rootFrom(process.argv.slice(2)))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
