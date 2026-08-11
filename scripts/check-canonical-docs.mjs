import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { GENERATED_PATHS, loadCanonicalDocumentationModel } from "./documentation/canonical-docs-model.mjs"
import { renderGeneratedFiles } from "./documentation/canonical-docs-render.mjs"

function optionsFrom(argv) {
  let root
  let pendingBaseline
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index]
    const value = argv[index + 1]
    if ((option !== "--root" && option !== "--allow-pending-baseline") || !value) throw new Error("usage: node scripts/check-canonical-docs.mjs [--root <root>] [--allow-pending-baseline <BASELINE-ID>]")
    if (option === "--root") root = resolve(value)
    else pendingBaseline = value
    index += 1
  }
  return { root: root ?? process.cwd(), pendingBaseline }
}

export function checkCanonicalDocs(root, options = {}) {
  const model = loadCanonicalDocumentationModel(root)
  if (options.pendingBaseline !== undefined && options.pendingBaseline !== model.release.baselineId) throw new Error(`pending baseline must exactly match release baseline ${model.release.baselineId}`)
  const rendered = renderGeneratedFiles(model)
  const drift = GENERATED_PATHS.filter((path) => !existsSync(join(model.root, path)) || readFileSync(join(model.root, path), "utf8") !== rendered[path])
  if (drift.length > 0) throw new Error(`generated documentation drift: ${drift.join(", ")}`)
  return rendered
}

function main() {
  try {
    const { root, pendingBaseline } = optionsFrom(process.argv.slice(2))
    checkCanonicalDocs(root, { pendingBaseline })
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
