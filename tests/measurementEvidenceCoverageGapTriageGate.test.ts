import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type FixtureSummary = {
  fixtureId: string
  gateType: "release-gating" | "exploratory"
  requiredFacts: string[]
  factCoverage: Record<string, string>
  digestIdentity: { status: string; wasmArtifact: { digestStatus: string } }
  nativeWasmParity: { status: string }
  rendererBackedDrift: { status: string }
  status: string
  replacementBlockers: string[]
}

type StubManifest = {
  rawEvidenceIncluded: boolean
  manifestStatus: string
  fixtures: FixtureSummary[]
  replacementBlockers: string[]
  defaultMeasurerReplacement: boolean
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readManifest(): StubManifest {
  return JSON.parse(
    readText("../fixtures/measurement-evidence-summary-manifest.stub.v1.json"),
  ) as StubManifest
}

const releaseGatingRowsInFillOrder = [
  "v1-measure-digest-parity-summary",
  "v1-measure-thai-line-break-core",
  "v1-measure-styled-inline-font-map",
  "v1-measure-mixed-latin-thai-title",
  "v1-measure-width-narrow-wide-pair",
  "v1-measure-multiline-forced-break",
  "v1-measure-table-cell-constrained",
  "v1-measure-repeated-header-table-lines",
  "v1-measure-field-chip-adjacency",
  "v1-measure-latin-product-paragraphs",
  "v1-measure-large-document-long-block",
  "v1-measure-renderer-backed-drift-summary",
]

describe("measurement evidence coverage gap triage gate", () => {
  it("uses the Phase 186 stub manifest as the source of truth", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")
    const manifest = readManifest()
    const releaseRows = manifest.fixtures.filter((row) => row.gateType === "release-gating")

    expect(doc).toContain("Status: Phase 187 measurement evidence coverage gap triage gate.")
    expect(doc).toContain("fixtures/measurement-evidence-summary-manifest.stub.v1.json")
    expect(doc).toContain("12 release-gating fixture rows")
    expect(doc).toContain("4 exploratory fixture rows")
    expect(manifest.rawEvidenceIncluded).toBe(false)
    expect(manifest.manifestStatus).toBe("unknown")
    expect(releaseRows).toHaveLength(12)
    expect(releaseRows.every((row) => row.status === "unknown")).toBe(true)
    expect(releaseRows.every((row) => row.digestIdentity.status === "pending")).toBe(true)
    expect(releaseRows.every((row) => row.nativeWasmParity.status === "not-run")).toBe(true)
    expect(releaseRows.every((row) => row.rendererBackedDrift.status === "unknown")).toBe(true)
    expect(manifest.defaultMeasurerReplacement).toBe(false)
  })

  it("ranks missing evidence across release-gating rows", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    expect(doc).toContain("## Ranked Missing Evidence")
    expect(doc).toContain("| 1 | Digest/runtime identity is pending")
    expect(doc).toContain("| 2 | Fixture/corpus source descriptors")
    expect(doc).toContain("| 3 | Native evidence is missing")
    expect(doc).toContain("| 4 | WASM evidence is missing")
    expect(doc).toContain("| 5 | Native/WASM parity summaries are not run")
    expect(doc).toContain("| 6 | Renderer-backed drift summaries are unknown")
    expect(doc).toContain("| 7 | Numeric drift thresholds are policy-pending")
    expect(doc).toContain("| 8 | Accepted root summary manifest is absent")
    expect(doc).toContain("| 9 | PDF/DOCX renderer implications remain exploratory")
  })

  it("groups gaps by owner and keeps raw evidence outside root summaries", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    expect(doc).toContain("## Owner Grouping")
    expect(doc).toContain("Text-engine package owns:")
    expect(doc).toContain("runtime identity revision fields")
    expect(doc).toContain("native evidence production outside core")
    expect(doc).toContain("Renderer-backed provider owns:")
    expect(doc).toContain("renderer-backed drift summary production outside production binding")
    expect(doc).toContain("Fixture/corpus owner owns:")
    expect(doc).toContain("stable corpus id and policy revision alignment")
    expect(doc).toContain("Root JSON-safe summary owner owns:")
    expect(doc).toContain("raw-evidence exclusion from root docs/tests")
    expect(doc).toContain("Future PDF/DOCX renderer owner owns:")
    expect(doc).toContain("renderer-fidelity fixture expansion")
  })

  it("defines prerequisite order from digest through accepted manifest", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    expect(doc).toContain("1. Digest/runtime identity")
    expect(doc).toContain("2. Native evidence")
    expect(doc).toContain("3. WASM evidence")
    expect(doc).toContain("4. Parity summaries")
    expect(doc).toContain("5. Renderer-backed drift summaries")
    expect(doc).toContain("6. Numeric drift thresholds")
    expect(doc).toContain("7. Accepted summary manifest")
  })

  it("selects the first fixture rows to fill before renderer-backed drift", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    for (const fixtureId of releaseGatingRowsInFillOrder) {
      expect(doc).toContain(fixtureId)
    }

    expect(doc.indexOf("v1-measure-digest-parity-summary")).toBeLessThan(
      doc.indexOf("v1-measure-thai-line-break-core"),
    )
    expect(doc.indexOf("v1-measure-thai-line-break-core")).toBeLessThan(
      doc.indexOf("v1-measure-renderer-backed-drift-summary"),
    )
    expect(doc).toContain("Exploratory rows remain outside release-gating acceptance")
  })

  it("recommends the digest evidence builder phase and blocks default replacement", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    expect(doc).toContain("Proceed to Phase 188: Text Engine Runtime Identity Digest Evidence Builder")
    expect(doc).toContain("Gate.")
    expect(doc).toContain("digest/runtime identity is the first prerequisite")
    expect(doc).toContain("`measureVNextText(...)` replacement remains blocked.")
    expect(doc).toContain("later binding phase that explicitly accepts default-measurer replacement")
  })

  it("keeps production measurement, renderer, backend, schema, and collaboration work out of scope", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreIndex = readText("../src/index.ts")

    expect(doc).toContain("No real native/WASM evidence is produced.")
    expect(doc).toContain("No rustybuzz/WASM/ICU4X execution in core.")
    expect(doc).toContain("No renderer-backed measurement is run as production truth.")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No raw evidence in root tests/docs.")
    expect(doc).toContain("No production PDF/DOCX renderer.")
    expect(doc).toContain("No backend route/server/storage/auth/authz behavior.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No legacy editor runtime copy.")
    expect(coreMeasurement).not.toContain("MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
  })

  it("advances current pointers, README, roadmap, and ledger to Phase 188", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(currentStatus).toContain("Status: updated after Text Engine WASM Toolchain Rust Upgrade Execution Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Text Engine WASM Toolchain Rust Upgrade Execution Gate.")
    expect(nextPointer).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(nextPointer).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(readme).toContain("Measurement evidence coverage gap triage gate")
    expect(readme).toContain("docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")
    expect(ledger).toContain("| 187 | Measurement evidence coverage gap triage gate | done |")
    expect(ledger).toContain("## Phase 187 Measurement Evidence Coverage Gap Triage Gate")
    expect(roadmap).toContain("## Phase 187: Measurement Evidence Coverage Gap Triage Gate")
    expect(roadmap).toContain("Current next step after Phase 195D:")
    expect(roadmap).toContain("Historical Phase 189 Handoff")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
  })
})
