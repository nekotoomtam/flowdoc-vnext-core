import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"

type EvidenceDigestIdentity = {
  status: "pinned"
  artifactPath: string
  sha256: string
  runtimeIdentityContextMatches: boolean
}

type AcceptedManifestFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  acceptanceScope: "minimal-accepted-subset-only"
  digestIdentityStatus: "pinned"
  nativeEvidenceStatus: "summary-metadata-present"
  wasmEvidenceStatus: "summary-metadata-present"
  nativeWasmParityStatus: "matching-summary-metadata"
  rendererBackedDriftStatus: "summary-metadata-present"
  numericThresholdPolicyStatus: "accepted-policy"
  retentionPointerStatus: "present"
  status: "accepted"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  rawNativeEvidenceIncludedInRoot: boolean
  rawWasmEvidenceIncludedInRoot: boolean
  rawRendererEvidenceIncludedInRoot: boolean
  replacementBlockers: string[]
}

type AcceptedManifest = {
  manifestId: "measurement-evidence-summary-manifest-accepted-minimal-v1"
  matrixId: "v1-measurement-fixture-evidence-matrix-v1"
  corpusId: "v1-measurement-evidence-corpus-v1"
  policyRevision: "v1-measurement-evidence-policy-v1"
  thresholdPolicyRevision: "numeric-drift-threshold-policy-v1"
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  manifestScope: "minimal-accepted-subset-only"
  manifestStatus: "accepted"
  fullV1MatrixStatus: "partial-not-accepted"
  acceptedManifestEntriesPopulated: boolean
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  rawRendererEvidenceIncluded: boolean
  productionBinding: boolean
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  digestIdentity: EvidenceDigestIdentity
  statusSummary: Record<
    | "digestIdentity"
    | "nativeEvidence"
    | "wasmEvidence"
    | "nativeWasmParity"
    | "rendererBackedDrift"
    | "numericThresholdPolicy"
    | "retentionPointers",
    string
  >
  fixtures: AcceptedManifestFixture[]
  blockedUntilLater: Record<string, boolean>
  replacementBlockers: string[]
}

type StubManifestFixture = {
  fixtureId: string
  gateType: "release-gating" | "exploratory"
}

type StubManifest = {
  manifestId: "measurement-evidence-summary-manifest-stub-v1"
  manifestStatus: "unknown"
  fixtures: StubManifestFixture[]
}

type PackageJson = {
  scripts: Record<string, string>
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

const acceptedManifest = readJson<AcceptedManifest>(
  "../fixtures/measurement-evidence-summary-manifest.accepted.v1.json",
)

const stubManifest = readJson<StubManifest>(
  "../fixtures/measurement-evidence-summary-manifest.stub.v1.json",
)

const acceptedFixtureIds = ["v1-measure-latin-product-paragraphs", "v1-measure-thai-line-break-core"]

const remainingReleaseGatingRows = [
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

describe("measurement hardening close audit", () => {
  it("confirms the accepted minimal manifest and required entry statuses", () => {
    expect(acceptedManifest.manifestId).toBe("measurement-evidence-summary-manifest-accepted-minimal-v1")
    expect(acceptedManifest.manifestScope).toBe("minimal-accepted-subset-only")
    expect(acceptedManifest.manifestStatus).toBe("accepted")
    expect(acceptedManifest.fullV1MatrixStatus).toBe("partial-not-accepted")
    expect(acceptedManifest.acceptedManifestEntriesPopulated).toBe(true)
    expect(acceptedManifest.matrixId).toBe("v1-measurement-fixture-evidence-matrix-v1")
    expect(acceptedManifest.corpusId).toBe("v1-measurement-evidence-corpus-v1")
    expect(acceptedManifest.policyRevision).toBe("v1-measurement-evidence-policy-v1")
    expect(acceptedManifest.thresholdPolicyRevision).toBe("numeric-drift-threshold-policy-v1")
    expect(acceptedManifest.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(acceptedManifest.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })

    expect(acceptedManifest.fixtures.map((fixture) => fixture.fixtureId).sort()).toEqual(
      [...acceptedFixtureIds].sort(),
    )

    for (const fixture of acceptedManifest.fixtures) {
      expect(fixture.gateType).toBe("release-gating")
      expect(fixture.acceptanceScope).toBe("minimal-accepted-subset-only")
      expect(fixture.digestIdentityStatus).toBe("pinned")
      expect(fixture.nativeEvidenceStatus).toBe("summary-metadata-present")
      expect(fixture.wasmEvidenceStatus).toBe("summary-metadata-present")
      expect(fixture.nativeWasmParityStatus).toBe("matching-summary-metadata")
      expect(fixture.rendererBackedDriftStatus).toBe("summary-metadata-present")
      expect(fixture.numericThresholdPolicyStatus).toBe("accepted-policy")
      expect(fixture.retentionPointerStatus).toBe("present")
      expect(fixture.status).toBe("accepted")
      expect(fixture.productionReady).toBe(false)
      expect(fixture.defaultMeasurerReplacement).toBe(false)
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawRendererEvidenceIncludedInRoot).toBe(false)
      expect(fixture.replacementBlockers).toEqual([
        "production-binding-not-run",
        "default-measurer-replacement-not-run",
      ])
    }
  })

  it("treats the subset as sufficient for an infrastructure checkpoint but not production readiness", () => {
    const releaseGatingFixtureIds = stubManifest.fixtures
      .filter((fixture) => fixture.gateType === "release-gating")
      .map((fixture) => fixture.fixtureId)

    expect(stubManifest.manifestStatus).toBe("unknown")
    expect(releaseGatingFixtureIds).toEqual([...acceptedFixtureIds, ...remainingReleaseGatingRows])
    expect(acceptedManifest.fixtures).toHaveLength(2)
    expect(acceptedManifest.productionBinding).toBe(false)
    expect(acceptedManifest.productionReady).toBe(false)
    expect(acceptedManifest.defaultMeasurerReplacement).toBe(false)
    expect(acceptedManifest.blockedUntilLater).toEqual({
      fullV1MatrixAcceptance: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(acceptedManifest.replacementBlockers).toEqual([
      "full-v1-matrix-not-populated",
      "production-binding-not-run",
      "default-measurer-replacement-not-run",
    ])

    const auditDoc = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    expect(auditDoc).toContain("Decision: sufficient for mini infrastructure checkpoint.")
    expect(auditDoc).toContain("It is not enough for full v1 measurement production readiness.")
    expect(auditDoc).toContain("The full v1 matrix remains `partial-not-accepted`.")
    expect(auditDoc).toContain(
      "These release-gating rows are not required before the mini infrastructure",
    )

    for (const row of remainingReleaseGatingRows) {
      expect(auditDoc).toContain(row)
    }
  })

  it("recommends the next planning lane without unblocking production measurement", () => {
    const auditDoc = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")

    expect(auditDoc).toContain(
      "Recommended next lane: Template Publish / Variable Schema / Render API",
    )
    expect(nextPointer).toContain("Status: current after Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("Template Publish / Variable Schema / Render API Planning Gate.")
    expect(nextPointer).toContain("Measurement Hardening Close Audit.")
    expect(nextPointer).toContain("Decision: sufficient for mini infrastructure checkpoint.")
    expect(nextPointer).toContain("No production binding.")
    expect(nextPointer).toContain("No default measurement replacement.")
    expect(currentStatus).toContain("Status: updated after Render API Request Envelope Contract Gate.")
    expect(currentStatus).toContain("Measurement Hardening Close Audit.")
    expect(currentStatus).toContain("Template Publish / Variable Schema / Render API Planning Gate.")
  })

  it("keeps the audit JSON-safe and leaves core measurement behavior unchanged", () => {
    expect(acceptedManifest.rawEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawNativeEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawWasmEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawRendererEvidenceIncluded).toBe(false)
    expect(acceptedManifest.statusSummary).toEqual({
      digestIdentity: "pinned",
      nativeEvidence: "summary-metadata-present",
      wasmEvidence: "summary-metadata-present",
      nativeWasmParity: "matching-summary-metadata",
      rendererBackedDrift: "summary-metadata-present",
      numericThresholdPolicy: "accepted-policy",
      retentionPointers: "present",
    })

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("measurement-hardening-close-audit")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("measurement-hardening-close-audit")
    expect(coreMeasurement).not.toContain("measurement-hardening-close-audit")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the close audit and advances pointers to the next planning gate", () => {
    const auditDoc = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(auditDoc).toContain("Status: Measurement Hardening Close Audit complete.")
    expect(auditDoc).toContain("## Source Of Truth")
    expect(auditDoc).toContain("## Audit Check")
    expect(auditDoc).toContain("## Decision")
    expect(auditDoc).toContain("## Pivot Recommendation")
    expect(auditDoc).toContain("## Remaining Measurement Rows")
    expect(auditDoc).toContain("## Explicit Non-Work")
    expect(auditDoc).toContain("## PASS")
    expect(auditDoc).toContain("## FAIL-BLOCKER")
    expect(auditDoc).toContain("## RISK")
    expect(auditDoc).toContain("## UNKNOWN")
    expect(auditDoc).toContain("## Files Changed")
    expect(auditDoc).toContain("## Behavior Changed")
    expect(auditDoc).toContain("## Tests Run")
    expect(auditDoc).toContain("## Risks Left")
    expect(auditDoc).toContain("## Intentionally Not Changed")

    expect(readme).toContain("Measurement hardening close audit")
    expect(readme).toContain("docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain("| 203 | Measurement hardening close audit | done |")
    expect(ledger).toContain("## Phase 203 Measurement Hardening Close Audit")
    expect(roadmap).toContain("## Phase 203: Measurement Hardening Close Audit")
    expect(roadmap).toContain("Current next step after Phase 203:")
    expect(roadmap).toContain("Template Publish / Variable Schema / Render API Planning Gate")
    expect(roadmap).toContain("Historical Phase 202 Handoff")
  })
})
