import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type RetentionPointer = {
  owner: string
  pointer: string | null
  includedInRoot: boolean
}

type FixtureSummary = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating" | "exploratory"
  measurementProfileId: string
  requiredFacts: string[]
  factCoverage: Record<string, string>
  digestIdentity: {
    status: string
    wasmArtifact: {
      digestStatus: string
      sha256: string | null
    }
  }
  nativeWasmParity: {
    status: string
    issueCount: number
    issues: string[]
  }
  rendererBackedDrift: {
    status: string
    approximateSummary: unknown
    rendererBackedSummary: unknown
    drift: unknown
  }
  missingEvidence: Array<{ code: string; status: string }>
  status: string
  retention: Record<string, RetentionPointer>
  replacementBlockers: string[]
}

type StubManifest = {
  manifestVersion: number
  manifestId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: string
  rawEvidenceIncluded: boolean
  manifestStatus: string
  fixtures: FixtureSummary[]
  replacementBlockers: string[]
  retention: Record<string, RetentionPointer>
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  paginationMutation: boolean
  productionRendererBackedBinding: boolean
  externalTextEngineExecutionInCore: boolean
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readManifest(): StubManifest {
  return JSON.parse(
    readText("../fixtures/measurement-evidence-summary-manifest.stub.v1.json"),
  ) as StubManifest
}

const releaseGatingFixtureIds = [
  "v1-measure-latin-product-paragraphs",
  "v1-measure-thai-line-break-core",
  "v1-measure-mixed-latin-thai-title",
  "v1-measure-styled-inline-font-map",
  "v1-measure-field-chip-adjacency",
  "v1-measure-table-cell-constrained",
  "v1-measure-repeated-header-table-lines",
  "v1-measure-width-narrow-wide-pair",
  "v1-measure-multiline-forced-break",
  "v1-measure-large-document-long-block",
  "v1-measure-renderer-backed-drift-summary",
  "v1-measure-digest-parity-summary",
]

const exploratoryFixtureIds = [
  "v1-explore-page-summary-label",
  "v1-explore-thai-currency-number",
  "v1-explore-browser-worker-wasm-targets",
  "v1-explore-pdf-fidelity-probe",
]

describe("measurement evidence summary manifest fixture stub gate", () => {
  it("adds a JSON-safe stub manifest with production replacement disabled", () => {
    const manifest = readManifest()

    expect(manifest.manifestVersion).toBe(1)
    expect(manifest.manifestId).toBe("measurement-evidence-summary-manifest-stub-v1")
    expect(manifest.matrixId).toBe("v1-measurement-fixture-evidence-matrix-v1")
    expect(manifest.corpusId).toBe("v1-measurement-evidence-corpus-v1")
    expect(manifest.policyRevision).toBe("v1-measurement-evidence-policy-v1")
    expect(manifest.measurementProfileId).toBe(
      "measurement-profile-v1:thai-rustybuzz-icu4x-v1",
    )
    expect(manifest.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(manifest.rawEvidenceIncluded).toBe(false)
    expect(manifest.manifestStatus).toBe("unknown")
    expect(manifest.productionReady).toBe(false)
    expect(manifest.defaultMeasurerReplacement).toBe(false)
    expect(manifest.paginationMutation).toBe(false)
    expect(manifest.productionRendererBackedBinding).toBe(false)
    expect(manifest.externalTextEngineExecutionInCore).toBe(false)
    expect(manifest.replacementBlockers).toEqual([
      "release-gating-summaries-missing",
      "digest-pending",
      "native-wasm-parity-not-run",
      "renderer-backed-drift-unknown",
      "numeric-drift-thresholds-pending",
      "later-binding-phase-not-run",
    ])
  })

  it("includes all release-gating rows from the Phase 184 matrix", () => {
    const manifest = readManifest()
    const releaseRows = manifest.fixtures.filter((row) => row.gateType === "release-gating")

    expect(releaseRows).toHaveLength(releaseGatingFixtureIds.length)
    expect(releaseRows.map((row) => row.fixtureId)).toEqual(releaseGatingFixtureIds)

    for (const row of releaseRows) {
      expect(row.measurementProfileId).toBe(manifest.measurementProfileId)
      expect(row.scenarioIds.length).toBeGreaterThan(0)
      expect(row.status).toBe("unknown")
      expect(row.status).not.toBe("accepted")
      expect(row.replacementBlockers.length).toBeGreaterThan(0)
      expect(row.missingEvidence.length).toBeGreaterThan(0)
    }
  })

  it("keeps exploratory rows separate from release-gating acceptance", () => {
    const manifest = readManifest()
    const exploratoryRows = manifest.fixtures.filter((row) => row.gateType === "exploratory")

    expect(exploratoryRows).toHaveLength(exploratoryFixtureIds.length)
    expect(exploratoryRows.map((row) => row.fixtureId)).toEqual(exploratoryFixtureIds)

    for (const row of exploratoryRows) {
      expect(row.status).toBe("unknown")
      expect(row.digestIdentity.status).toBe("missing")
      expect(row.nativeWasmParity.status).toBe("missing")
      expect(row.rendererBackedDrift.status).toBe("unknown")
      expect(row.replacementBlockers).toEqual(["exploratory-not-release-gating"])
    }
  })

  it("marks release-gating facts and evidence as missing, pending, not-run, or unknown", () => {
    const manifest = readManifest()
    const releaseRows = manifest.fixtures.filter((row) => row.gateType === "release-gating")

    for (const row of releaseRows) {
      for (const fact of row.requiredFacts) {
        expect(row.factCoverage[fact]).toBe("missing")
      }

      expect(row.digestIdentity.status).toBe("pending")
      expect(row.digestIdentity.wasmArtifact.digestStatus).toBe("pending")
      expect(row.digestIdentity.wasmArtifact.sha256).toBeNull()
      expect(row.nativeWasmParity.status).toBe("not-run")
      expect(row.nativeWasmParity.issueCount).toBeGreaterThan(0)
      expect(row.nativeWasmParity.issues).toContain("stub-parity-not-run")
      expect(row.rendererBackedDrift.status).toBe("unknown")
      expect(row.rendererBackedDrift.approximateSummary).toBeNull()
      expect(row.rendererBackedDrift.rendererBackedSummary).toBeNull()
      expect(row.rendererBackedDrift.drift).toBeNull()
    }
  })

  it("keeps raw evidence outside root docs/tests and uses null retention pointers", () => {
    const manifest = readManifest()
    const serialized = JSON.stringify(manifest)

    expect(manifest.rawEvidenceIncluded).toBe(false)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")

    for (const pointer of Object.values(manifest.retention)) {
      expect(pointer.pointer).toBeNull()
      expect(pointer.includedInRoot).toBe(false)
    }

    for (const row of manifest.fixtures) {
      for (const pointer of Object.values(row.retention)) {
        expect(pointer.pointer).toBeNull()
        expect(pointer.includedInRoot).toBe(false)
      }
    }
  })

  it("cannot be mistaken for accepted evidence", () => {
    const manifest = readManifest()

    expect(manifest.manifestStatus).toBe("unknown")
    expect(manifest.productionReady).toBe(false)
    expect(manifest.defaultMeasurerReplacement).toBe(false)
    expect(manifest.replacementBlockers).toContain("release-gating-summaries-missing")
    expect(manifest.fixtures.some((row) => row.status === "accepted")).toBe(false)
    expect(
      manifest.fixtures.some((row) => row.digestIdentity.status === "pinned"),
    ).toBe(false)
    expect(
      manifest.fixtures.some((row) => row.nativeWasmParity.status === "matching"),
    ).toBe(false)
    expect(
      manifest.fixtures.some((row) => row.rendererBackedDrift.status === "accepted"),
    ).toBe(false)
  })

  it("documents Phase 186 and advances pointers to the coverage gap triage gate", () => {
    const doc = readText(
      "../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md",
    )
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: Phase 186 measurement evidence summary manifest fixture stub gate.",
    )
    expect(doc).toContain("fixtures/measurement-evidence-summary-manifest.stub.v1.json")
    expect(doc).toContain("Cannot Be Mistaken For Accepted Evidence")
    expect(currentStatus).toContain("Status: updated after Text Engine WASM Toolchain Provisioning Bootstrap Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Provisioning Bootstrap Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Provisioning Execution Gate.")
    expect(nextPointer).toContain("Status: current after Text Engine WASM Toolchain Provisioning Bootstrap Gate.")
    expect(nextPointer).toContain("Text Engine WASM Toolchain Provisioning Execution Gate.")
    expect(nextPointer).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(readme).toContain("Measurement evidence summary manifest fixture stub gate")
    expect(readme).toContain(
      "docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md",
    )
    expect(ledger).toContain(
      "| 186 | Measurement evidence summary manifest fixture stub gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 186 Measurement Evidence Summary Manifest Fixture Stub Gate",
    )
    expect(roadmap).toContain(
      "## Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate",
    )
    expect(roadmap).toContain("Historical Phase 186 Handoff")
    expect(roadmap).toContain("Historical Phase 185 Handoff")
  })

  it("keeps production measurement, renderers, backend, schema, and collaboration out of scope", () => {
    const doc = readText(
      "../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md",
    )
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreIndex = readText("../src/index.ts")

    expect(doc).toContain("This is a fixture-stub gate only.")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurement binding.")
    expect(doc).toContain("No external text-engine execution in core.")
    expect(doc).toContain("No raw evidence in root tests/docs.")
    expect(doc).toContain("No production PDF/DOCX renderer.")
    expect(doc).toContain("No backend route/server/storage/auth/authz behavior.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No legacy editor runtime copy.")
    expect(coreMeasurement).not.toContain(
      "MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE",
    )
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText(
      "../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md",
    )

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
