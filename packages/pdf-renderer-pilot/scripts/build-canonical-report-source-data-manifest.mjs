import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  canonicalReportSourceSnapshotSha256,
  deriveCanonicalReportSourceSnapshot,
} from "./canonical-report-source-data.mjs"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, "../../..")
const reportRoot = resolve(
  process.argv[2]
    ?? process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT
    ?? resolve(repoRoot, "../ocr-benchmark-skeleton/reports/INV_9437125258"),
)
const outputPath = resolve(
  repoRoot,
  process.argv[3] ?? "fixtures/pdf-pilot-canonical-report-source-data.v1.json",
)

const definitions = [
  ["reportBuilder", "build_report.py", "text/x-python", "authoritative report formatting and prose assembly"],
  ["metrics", "metrics.json", "application/json", "computed benchmark metrics"],
  ["truth", "ground-truth.json", "application/json", "human-reviewed reference values"],
  ["spec", "benchmark-spec.json", "application/json", "benchmark conditions and Run IDs"],
  ["analyzer", "analyze.ts", "text/typescript", "raw-result metric derivation"],
]

const files = Object.fromEntries(definitions.map(([sourceId, fileName]) => (
  [sourceId, readFileSync(resolve(reportRoot, fileName))]
)))
const sourceSnapshot = deriveCanonicalReportSourceSnapshot({
  metrics: JSON.parse(files.metrics.toString("utf8")),
  spec: JSON.parse(files.spec.toString("utf8")),
  truth: JSON.parse(files.truth.toString("utf8")),
  analyzerText: files.analyzer.toString("utf8"),
  reportBuilderText: files.reportBuilder.toString("utf8"),
})
const sourceScalarValueCount = sourceSnapshot.bindings.reduce((total, binding) => {
  const visit = (value) => {
    if (typeof value === "string") return 1
    if (Array.isArray(value)) return value.reduce((count, item) => count + visit(item), 0)
    return 0
  }
  return total + visit(binding.value)
}, 0)

const manifest = {
  manifestVersion: 1,
  manifestId: "pdf-pilot-08b-r1-canonical-report-source-data-v1",
  baseCompositionId: "pdf-pilot-canonical-report-typography-calibrated-composition-v1",
  outputComposition: {
    version: 4,
    compositionId: "pdf-pilot-canonical-report-source-backed-typography-composition-v1",
  },
  claim: {
    parityLevel: "source-derived decision data",
    sourceBoundFacts: true,
    verbatimSentenceParity: false,
    visualParity: false,
  },
  sourceFiles: definitions.map(([sourceId, fileName, mediaType, role]) => ({
    sourceId,
    fileName,
    mediaType,
    role,
    bytes: files[sourceId].byteLength,
    sha256: createHash("sha256").update(files[sourceId]).digest("hex"),
  })),
  sourceSnapshotSha256: canonicalReportSourceSnapshotSha256(sourceSnapshot),
  sourceSnapshot,
  acceptance: {
    expectedBindingCount: sourceSnapshot.bindings.length,
    expectedSourceScalarValueCount: sourceScalarValueCount,
    expectedFactualCorrectionCount: 7,
    analyzerReproduction: "metrics equal after excluding generatedAt",
    supersedesFactualClaimsFrom: [
      "pdf-pilot-08a-canonical-report-decision-content-parity-v1",
      "pdf-pilot-08b-canonical-report-typography-calibration-v1",
    ],
  },
  nextPhase: "PDF-PILOT-08C visual acceptance thresholds",
}

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
