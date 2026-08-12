import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { GENERATED_PATHS, STRUCTURED_PATHS, loadCanonicalDocumentationModel, validateDevelopmentBaselineEvolution } from "./documentation/canonical-docs-model.mjs"
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

function git(root, args, label) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true })
  if (result.error) throw new Error(`Git ${label} failed: ${result.error.message}`)
  if (result.status !== 0) throw new Error(`Git ${label} failed: ${(result.stderr || result.stdout).trim() || `exit ${result.status}`}`)
  return result.stdout
}

function priorDevelopmentBaseline(root) {
  git(root, ["rev-parse", "--verify", "HEAD^{commit}"], "HEAD resolution")
  const listed = git(root, ["ls-tree", "-z", "--name-only", "HEAD", "--", STRUCTURED_PATHS.baseline], "prior baseline path lookup")
  if (listed.length === 0) return null
  if (listed !== `${STRUCTURED_PATHS.baseline}\0`) throw new Error(`Git prior baseline path lookup returned an unexpected path: ${JSON.stringify(listed)}`)
  const source = git(root, ["show", `HEAD:${STRUCTURED_PATHS.baseline}`], "prior baseline read")
  try {
    return JSON.parse(source)
  } catch (error) {
    throw new Error(`prior development baseline has invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export function checkCanonicalDocs(root, options = {}) {
  const loadOptions = options.pendingBaseline === undefined ? {} : { allowPendingBaselineId: options.pendingBaseline }
  const model = loadCanonicalDocumentationModel(root, loadOptions)
  if (model.baseline !== null) validateDevelopmentBaselineEvolution(priorDevelopmentBaseline(model.root), model.baseline)
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
