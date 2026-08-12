import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { STRUCTURED_PATHS, loadCanonicalDocumentationModel, validateDevelopmentBaselineEvolution } from "./documentation/canonical-docs-model.mjs"

const OPTIONS = Object.freeze(["--root", "--baseline-id", "--recorded-at", "--core-commit", "--editor-commit", "--backend-commit"])

function optionsFrom(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index]
    const value = argv[index + 1]
    if (!OPTIONS.includes(option) || !value || values.has(option)) throw new Error("usage: node scripts/publish-development-baseline.mjs --root <root> --baseline-id <BASELINE-ID> --recorded-at <YYYY-MM-DD> --core-commit <40-hex> --editor-commit <40-hex> --backend-commit <40-hex>")
    values.set(option, value)
  }
  for (const option of OPTIONS) if (!values.has(option)) throw new Error("usage: node scripts/publish-development-baseline.mjs --root <root> --baseline-id <BASELINE-ID> --recorded-at <YYYY-MM-DD> --core-commit <40-hex> --editor-commit <40-hex> --backend-commit <40-hex>")
  return {
    root: resolve(values.get("--root")),
    baselineId: values.get("--baseline-id"),
    recordedAt: values.get("--recorded-at"),
    coreCommit: values.get("--core-commit"),
    editorCommit: values.get("--editor-commit"),
    backendCommit: values.get("--backend-commit"),
  }
}

export function publishDevelopmentBaseline({ root, baselineId, recordedAt, coreCommit, editorCommit, backendCommit }) {
  const normalizedRoot = resolve(root)
  loadCanonicalDocumentationModel(normalizedRoot, { allowPendingBaselineId: baselineId })
  const baseline = validateDevelopmentBaselineEvolution(null, {
    baselineSchemaVersion: 1,
    baselineId,
    recordedAt,
    repositories: {
      "REPO-FLOWDOC-CORE": { releaseLine: "0.1", releaseVersion: "unversioned", verifiedCommit: coreCommit },
      "REPO-FLOWDOC-EDITOR": { releaseLine: null, releaseVersion: "unversioned", verifiedCommit: editorCommit },
      "REPO-FLOWDOC-BACKEND": { releaseLine: null, releaseVersion: "unversioned", verifiedCommit: backendCommit },
    },
    verificationSets: [],
    compatibility: { coreEditor: "not-verified", coreBackend: "not-verified", endToEnd: "not-verified" },
    releaseReady: false,
  })
  const destination = join(normalizedRoot, STRUCTURED_PATHS.baseline)
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, `${JSON.stringify(baseline, null, 2)}\n`, "utf8")
  return baseline
}

function main() {
  try {
    publishDevelopmentBaseline(optionsFrom(process.argv.slice(2)))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
