import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"
const FULL_PROFILE_PREFIX = "measurement-profile-v1:thai-rustybuzz-icu4x-v1"

type EvidenceDigestIdentity = {
  status: "pinned"
  artifactPath: string
  sha256: string
  runtimeIdentityContextMatches: boolean
}

type ThresholdFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  thresholdPolicyStatus: "accepted-policy"
  acceptedForManifestPrerequisite: boolean
  acceptedForProduction: boolean
  rawNativeEvidenceIncludedInRoot: boolean
  rawWasmEvidenceIncludedInRoot: boolean
  rawRendererEvidenceIncludedInRoot: boolean
}

type NumericDriftThresholdDecision = {
  numericDriftThresholdDecisionId: string
  sourceRendererBackedDriftSummaryId: string
  sourceNativeWasmParitySummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  thresholdPolicyRevision: "numeric-drift-threshold-policy-v1"
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  subsetId: "numeric-drift-threshold-decision-minimal-v1"
  thresholdPolicyDecisionStatus: "accepted-policy"
  thresholdsAcceptedForSubsetContext: boolean
  driftValuesAcceptedForProduction: boolean
  fixtures: ThresholdFixture[]
}

type RendererBackedDriftSummary = {
  rendererBackedDriftSummaryId: string
  sourceNativeWasmParitySummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  subsetId: "renderer-backed-drift-summary-minimal-v1"
  nativeWasmParityStatus: "matching-summary-metadata"
  rendererBackedDriftStatus: "summary-metadata-present"
  rendererBackedDriftSummaryExists: boolean
}

type ParitySummary = {
  nativeWasmParitySummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  nativeWasmParityStatus: "matching-summary-metadata"
}

type PinningSummary = {
  pinningSummaryId: string
  acceptedArtifactPath: string
  digestStatus: "pinned"
  sha256: string
  runtimeIdentityContextMatches: boolean
}

type AcceptedManifestFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  acceptanceScope: "minimal-accepted-subset-only"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  requiredFacts: string[]
  factCoverage: Record<string, "present">
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
  retention: {
    rawNativeEvidence: { includedInRoot: false }
    rawWasmEvidence: { includedInRoot: false }
    rawRendererEvidence: { includedInRoot: false }
  }
  replacementBlockers: string[]
}

type AcceptedManifest = {
  manifestVersion: 1
  manifestId: "measurement-evidence-summary-manifest-accepted-minimal-v1"
  sourceStubManifestId: "measurement-evidence-summary-manifest-stub-v1"
  sourceNumericDriftThresholdDecisionId: string
  sourceRendererBackedDriftSummaryId: string
  sourceNativeWasmParitySummaryId: string
  sourceNativeEvidenceSummaryId: string
  sourceWasmEvidenceSummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  thresholdPolicyRevision: "numeric-drift-threshold-policy-v1"
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  summaryOwner: "@flowdoc/vnext-core-docs"
  rawEvidenceOwner: "@flowdoc/text-engine-rust-wasm"
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
  contextComparison: Record<string, "matched">
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
  retention: {
    sourceNativeSummary: { pointer: string; includedInRoot: false }
    sourceWasmSummary: { pointer: string; includedInRoot: false }
    sourceParitySummary: { pointer: string; includedInRoot: false }
    sourceRendererBackedDriftSummary: { pointer: string; includedInRoot: false }
    sourceNumericThresholdDecision: { pointer: string; includedInRoot: false }
    rawNativeEvidence: { pointerKind: "external-placeholder"; includedInRoot: false }
    rawWasmEvidence: { pointerKind: "external-placeholder"; includedInRoot: false }
    rawRendererEvidence: { pointerKind: "external-placeholder"; includedInRoot: false }
  }
  blockedUntilLater: Record<string, boolean>
  replacementBlockers: string[]
  nextRecommendedWork: "Measurement Hardening Close Audit"
  phaseRule: string
}

type StubManifest = {
  manifestId: "measurement-evidence-summary-manifest-stub-v1"
  manifestStatus: "unknown"
  rawEvidenceIncluded: boolean
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

const thresholdDecision = readJson<NumericDriftThresholdDecision>(
  "../packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json",
)

const driftSummary = readJson<RendererBackedDriftSummary>(
  "../packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json",
)

const paritySummary = readJson<ParitySummary>(
  "../packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json",
)

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

describe("accepted summary manifest population", () => {
  it("populates a new accepted manifest from threshold, drift, parity, and digest context", () => {
    expect(acceptedManifest.manifestVersion).toBe(1)
    expect(acceptedManifest.manifestId).toBe("measurement-evidence-summary-manifest-accepted-minimal-v1")
    expect(acceptedManifest.sourceStubManifestId).toBe(stubManifest.manifestId)
    expect(stubManifest.manifestStatus).toBe("unknown")
    expect(stubManifest.rawEvidenceIncluded).toBe(false)
    expect(acceptedManifest.sourceNumericDriftThresholdDecisionId).toBe(
      thresholdDecision.numericDriftThresholdDecisionId,
    )
    expect(acceptedManifest.sourceRendererBackedDriftSummaryId).toBe(
      driftSummary.rendererBackedDriftSummaryId,
    )
    expect(acceptedManifest.sourceNativeWasmParitySummaryId).toBe(paritySummary.nativeWasmParitySummaryId)
    expect(acceptedManifest.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(acceptedManifest.matrixId).toBe(thresholdDecision.matrixId)
    expect(acceptedManifest.corpusId).toBe(thresholdDecision.corpusId)
    expect(acceptedManifest.policyRevision).toBe(thresholdDecision.policyRevision)
    expect(acceptedManifest.thresholdPolicyRevision).toBe(thresholdDecision.thresholdPolicyRevision)
    expect(acceptedManifest.measurementProfileId).toBe(thresholdDecision.measurementProfileId)
    expect(acceptedManifest.outputShapeVersion).toBe(thresholdDecision.outputShapeVersion)
    expect(acceptedManifest.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(acceptedManifest.digestIdentity).toEqual(thresholdDecision.digestIdentity)
    expect(acceptedManifest.digestIdentity).toEqual(driftSummary.digestIdentity)
    expect(acceptedManifest.digestIdentity).toEqual(paritySummary.digestIdentity)
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
  })

  it("accepts only the same Thai and Latin minimal subset entries", () => {
    expect(acceptedManifest.manifestScope).toBe("minimal-accepted-subset-only")
    expect(acceptedManifest.manifestStatus).toBe("accepted")
    expect(acceptedManifest.fullV1MatrixStatus).toBe("partial-not-accepted")
    expect(acceptedManifest.acceptedManifestEntriesPopulated).toBe(true)
    expect(acceptedManifest.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      thresholdDecision.fixtures.map((fixture) => fixture.fixtureId),
    )

    for (const [index, fixture] of acceptedManifest.fixtures.entries()) {
      const thresholdFixture = thresholdDecision.fixtures[index]
      expect(fixture.fixtureId).toBe(thresholdFixture.fixtureId)
      expect(fixture.scenarioIds).toEqual(thresholdFixture.scenarioIds)
      expect(fixture.gateType).toBe("release-gating")
      expect(fixture.acceptanceScope).toBe("minimal-accepted-subset-only")
      expect(fixture.measurementProfileId).toBe(thresholdFixture.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
      expect(fixture.status).toBe("accepted")
      expect(fixture.requiredFacts).toEqual([
        "glyph-facts",
        "cluster-map",
        "text-range",
        "line-boxes",
        "total-size",
        "line-count",
        "drift-summary",
        "parity-summary",
        "threshold-policy",
      ])
      expect(Object.values(fixture.factCoverage)).toEqual(fixture.requiredFacts.map(() => "present"))
    }
  })

  it("carries JSON-safe status only and keeps raw evidence outside root docs/tests", () => {
    expect(acceptedManifest.statusSummary).toEqual({
      digestIdentity: "pinned",
      nativeEvidence: "summary-metadata-present",
      wasmEvidence: "summary-metadata-present",
      nativeWasmParity: "matching-summary-metadata",
      rendererBackedDrift: "summary-metadata-present",
      numericThresholdPolicy: "accepted-policy",
      retentionPointers: "present",
    })
    expect(acceptedManifest.contextComparison).toEqual({
      numericDriftThresholdDecision: "matched",
      rendererBackedDriftSummary: "matched",
      nativeWasmParitySummary: "matched",
      artifactDigestContext: "matched",
      matrixId: "matched",
      corpusId: "matched",
      policyRevision: "matched",
      thresholdPolicyRevision: "matched",
      measurementProfileId: "matched",
      outputShapeVersion: "matched",
      fixtureIds: "matched",
      scenarioIds: "matched",
    })
    expect(acceptedManifest.rawEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawNativeEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawWasmEvidenceIncluded).toBe(false)
    expect(acceptedManifest.rawRendererEvidenceIncluded).toBe(false)
    expect(acceptedManifest.retention.sourceNativeSummary.pointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json",
    )
    expect(acceptedManifest.retention.sourceWasmSummary.pointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json",
    )
    expect(acceptedManifest.retention.sourceParitySummary.pointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json",
    )
    expect(acceptedManifest.retention.sourceRendererBackedDriftSummary.pointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json",
    )
    expect(acceptedManifest.retention.sourceNumericThresholdDecision.pointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json",
    )
    expect(acceptedManifest.retention.rawNativeEvidence.includedInRoot).toBe(false)
    expect(acceptedManifest.retention.rawWasmEvidence.includedInRoot).toBe(false)
    expect(acceptedManifest.retention.rawRendererEvidence.includedInRoot).toBe(false)

    for (const fixture of acceptedManifest.fixtures) {
      expect(fixture.digestIdentityStatus).toBe("pinned")
      expect(fixture.nativeEvidenceStatus).toBe("summary-metadata-present")
      expect(fixture.wasmEvidenceStatus).toBe("summary-metadata-present")
      expect(fixture.nativeWasmParityStatus).toBe("matching-summary-metadata")
      expect(fixture.rendererBackedDriftStatus).toBe("summary-metadata-present")
      expect(fixture.numericThresholdPolicyStatus).toBe("accepted-policy")
      expect(fixture.retentionPointerStatus).toBe("present")
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawRendererEvidenceIncludedInRoot).toBe(false)
      expect(fixture.retention.rawNativeEvidence.includedInRoot).toBe(false)
      expect(fixture.retention.rawWasmEvidence.includedInRoot).toBe(false)
      expect(fixture.retention.rawRendererEvidence.includedInRoot).toBe(false)
    }

    const serialized = JSON.stringify(acceptedManifest)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps production binding, default measurer replacement, and core behavior blocked", () => {
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
    expect(acceptedManifest.nextRecommendedWork).toBe("Measurement Hardening Close Audit")
    expect(acceptedManifest.phaseRule).toBe(
      "proceed-to-measurement-hardening-close-audit-only-if-accepted-manifest-entries-match-threshold-context",
    )

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("accepted-summary-manifest")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("accepted-summary-manifest")
    expect(coreMeasurement).not.toContain("accepted-summary-manifest")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the population and advances pointers to measurement hardening close audit", () => {
    const doc = readText("../docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Accepted Summary Manifest Population complete.")
    expect(doc).toContain("fixtures/measurement-evidence-summary-manifest.accepted.v1.json")
    expect(doc).toContain("Measurement Hardening Close Audit.")
    expect(doc).toContain("## Explicit Non-Work")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Template Publish Close Audit.")
    expect(currentStatus).toContain("Accepted Summary Manifest Population.")
    expect(currentStatus).toContain("Measurement Hardening Close Audit.")
    expect(nextPointer).toContain("Status: current after Template Publish Close Audit.")
    expect(nextPointer).toContain("Measurement Hardening Close Audit.")
    expect(nextPointer).toContain("No raw renderer evidence in root docs/tests.")
    expect(readme).toContain("Accepted summary manifest population")
    expect(readme).toContain("docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain("| 202 | Accepted summary manifest population | done |")
    expect(ledger).toContain("## Phase 202 Accepted Summary Manifest Population")
    expect(roadmap).toContain("## Phase 202: Accepted Summary Manifest Population")
    expect(roadmap).toContain("Current next step after Phase 202:")
    expect(roadmap).toContain("Measurement Hardening Close Audit")
    expect(roadmap).toContain("Historical Phase 201 Handoff")
  })
})
