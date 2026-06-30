import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocTextEngineRuntimeIdentityManifest } from "../packages/text-engine-rust-wasm/src/index.js"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"
const FULL_PROFILE_PREFIX = "measurement-profile-v1:thai-rustybuzz-icu4x-v1"

type EvidenceDigestIdentity = {
  status: "pinned"
  artifactPath: string
  sha256: string
  runtimeIdentityContextMatches: boolean
}

type DriftMetadataCoverage = {
  "approximate-summary": "metadata-present"
  "renderer-backed-summary": "metadata-present"
  "width-drift": "metadata-present-unthresholded"
  "height-drift": "metadata-present-unthresholded"
  "line-count-drift": "metadata-present-unthresholded"
}

type DriftFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  driftSummaryStatus: "summary-metadata-present"
  driftMetadataCoverage: DriftMetadataCoverage
  numericDriftThresholdStatus: "blocked"
  driftAcceptedForThresholdDecision: boolean
  driftAcceptedForProduction: boolean
  rawNativeEvidenceIncludedInRoot: boolean
  rawWasmEvidenceIncludedInRoot: boolean
  rawRendererEvidenceIncludedInRoot: boolean
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
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  rawRendererEvidenceIncluded: boolean
  nativeWasmParityStatus: "matching-summary-metadata"
  rendererBackedDriftStatus: "summary-metadata-present"
  rendererBackedDriftSummaryExists: boolean
  driftAcceptedForThresholdDecision: boolean
  driftAcceptedForProduction: boolean
  fixtures: DriftFixture[]
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
  measurementProfileId: string
  acceptedArtifactPath: string
  digestStatus: "pinned"
  sha256: string
  runtimeIdentityContextMatches: boolean
  rawEvidenceIncluded: boolean
}

type ThresholdRules = {
  "accepted-pass": string
  warning: string
  "blocked-fail": string
}

type DimensionThreshold = {
  unit: "pt"
  basis: "absolute-renderer-backed-minus-approximate"
  acceptedPassMaxAbsPt: number
  warningMaxAbsPt: number
  blockedFailAboveAbsPt: number
  statusRules: ThresholdRules
}

type LineCountThreshold = {
  unit: "line"
  basis: "renderer-backed-line-count-minus-approximate-line-count"
  acceptedPassMaxAbsLines: 0
  warningAllowedForReleaseGating: boolean
  blockedFailNonZero: boolean
  statusRules: ThresholdRules
}

type ThresholdFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  rendererBackedDriftStatus: "summary-metadata-present"
  contextStatus: "matched"
  thresholdPolicyStatus: "accepted-policy"
  thresholdEvaluationStatus: "not-evaluated-no-raw-values-in-root"
  requiredThresholds: ["width-drift", "height-drift", "line-count-drift"]
  lineCountDriftRequirement: "zero-required"
  warningAllowedForLineCount: boolean
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
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  matrixId: string
  corpusId: string
  policyRevision: string
  thresholdPolicyRevision: "numeric-drift-threshold-policy-v1"
  runtimeIdentityPointer: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  summaryMode: "json-safe-numeric-drift-threshold-policy-only"
  sourceDriftSubsetId: "renderer-backed-drift-summary-minimal-v1"
  subsetId: "numeric-drift-threshold-decision-minimal-v1"
  subsetStatus: "threshold-policy-accepted"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  rawRendererEvidenceIncluded: boolean
  rendererBackedDriftSummaryExists: boolean
  rendererBackedDriftStatus: "summary-metadata-present"
  nativeWasmParityStatus: "matching-summary-metadata"
  thresholdPolicyDecisionStatus: "accepted-policy"
  thresholdEvaluationStatus: "not-evaluated-no-raw-values-in-root"
  thresholdsAcceptedForSubsetContext: boolean
  driftValuesAcceptedForProduction: boolean
  acceptedManifestStatus: "blocked"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  contextComparison: Record<string, "matched">
  thresholdPolicy: {
    widthDrift: DimensionThreshold
    heightDrift: DimensionThreshold
    lineCountDrift: LineCountThreshold
  }
  statusVocabulary: Record<"accepted-pass" | "warning" | "blocked-fail", string>
  fixtures: ThresholdFixture[]
  retention: {
    sourceRendererBackedDriftSummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json"
      includedInRoot: false
    }
    sourceParitySummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json"
      includedInRoot: false
    }
    rawNativeEvidence: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointerKind: "external-placeholder"
      includedInRoot: false
    }
    rawWasmEvidence: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointerKind: "external-placeholder"
      includedInRoot: false
    }
    rawRendererEvidence: {
      owner: "external-renderer-provider"
      pointerKind: "external-placeholder"
      includedInRoot: false
    }
  }
  blockedUntilLater: Record<string, boolean>
  replacementBlockers: string[]
  nextRecommendedWork: "Accepted Summary Manifest Population"
  phaseRule: string
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

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

describe("numeric drift threshold decision", () => {
  it("attaches threshold policy to renderer drift, parity, and pinned digest context", () => {
    expect(thresholdDecision.numericDriftThresholdDecisionId).toBe(
      "text-engine-numeric-drift-threshold-decision-v1",
    )
    expect(thresholdDecision.sourceRendererBackedDriftSummaryId).toBe(
      driftSummary.rendererBackedDriftSummaryId,
    )
    expect(thresholdDecision.sourceNativeWasmParitySummaryId).toBe(paritySummary.nativeWasmParitySummaryId)
    expect(thresholdDecision.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(thresholdDecision.sourceRuntimeIdentityManifestId).toBe(runtimeIdentityManifest.manifestId)
    expect(thresholdDecision.matrixId).toBe(driftSummary.matrixId)
    expect(thresholdDecision.corpusId).toBe(driftSummary.corpusId)
    expect(thresholdDecision.policyRevision).toBe(driftSummary.policyRevision)
    expect(thresholdDecision.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(thresholdDecision.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(thresholdDecision.outputShapeVersion).toBe(driftSummary.outputShapeVersion)
    expect(thresholdDecision.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(thresholdDecision.digestIdentity).toEqual(driftSummary.digestIdentity)
    expect(thresholdDecision.digestIdentity).toEqual(paritySummary.digestIdentity)
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
      rawEvidenceIncluded: false,
    })
  })

  it("requires the same renderer-backed drift subset and matching fixture/scenario ids", () => {
    expect(thresholdDecision.summaryMode).toBe("json-safe-numeric-drift-threshold-policy-only")
    expect(thresholdDecision.sourceDriftSubsetId).toBe(driftSummary.subsetId)
    expect(thresholdDecision.subsetId).toBe("numeric-drift-threshold-decision-minimal-v1")
    expect(thresholdDecision.subsetStatus).toBe("threshold-policy-accepted")
    expect(thresholdDecision.rendererBackedDriftSummaryExists).toBe(true)
    expect(thresholdDecision.rendererBackedDriftStatus).toBe("summary-metadata-present")
    expect(driftSummary.rendererBackedDriftSummaryExists).toBe(true)
    expect(driftSummary.rendererBackedDriftStatus).toBe("summary-metadata-present")
    expect(thresholdDecision.nativeWasmParityStatus).toBe("matching-summary-metadata")
    expect(thresholdDecision.contextComparison).toEqual({
      rendererBackedDriftSummary: "matched",
      nativeWasmParitySummary: "matched",
      artifactDigestContext: "matched",
      matrixId: "matched",
      corpusId: "matched",
      policyRevision: "matched",
      measurementProfileId: "matched",
      outputShapeVersion: "matched",
      fixtureIds: "matched",
      scenarioIds: "matched",
    })
    expect(thresholdDecision.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      driftSummary.fixtures.map((fixture) => fixture.fixtureId),
    )

    for (const [index, fixture] of thresholdDecision.fixtures.entries()) {
      const driftFixture = driftSummary.fixtures[index]
      expect(fixture.fixtureId).toBe(driftFixture.fixtureId)
      expect(fixture.scenarioIds).toEqual(driftFixture.scenarioIds)
      expect(fixture.gateType).toBe(driftFixture.gateType)
      expect(fixture.subsetPriority).toBe(driftFixture.subsetPriority)
      expect(fixture.coverageCategory).toBe(driftFixture.coverageCategory)
      expect(fixture.measurementProfileId).toBe(driftFixture.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
      expect(fixture.rendererBackedDriftStatus).toBe("summary-metadata-present")
      expect(fixture.contextStatus).toBe("matched")
    }
  })

  it("defines numeric width, height, and line-count threshold status policy", () => {
    expect(thresholdDecision.thresholdPolicyRevision).toBe("numeric-drift-threshold-policy-v1")
    expect(thresholdDecision.thresholdPolicyDecisionStatus).toBe("accepted-policy")
    expect(thresholdDecision.thresholdEvaluationStatus).toBe("not-evaluated-no-raw-values-in-root")
    expect(thresholdDecision.thresholdsAcceptedForSubsetContext).toBe(true)

    expect(thresholdDecision.thresholdPolicy.widthDrift).toMatchObject({
      unit: "pt",
      basis: "absolute-renderer-backed-minus-approximate",
      acceptedPassMaxAbsPt: 0.5,
      warningMaxAbsPt: 1,
      blockedFailAboveAbsPt: 1,
    })
    expect(thresholdDecision.thresholdPolicy.heightDrift).toMatchObject({
      unit: "pt",
      basis: "absolute-renderer-backed-minus-approximate",
      acceptedPassMaxAbsPt: 0.5,
      warningMaxAbsPt: 1,
      blockedFailAboveAbsPt: 1,
    })
    expect(thresholdDecision.thresholdPolicy.lineCountDrift).toMatchObject({
      unit: "line",
      basis: "renderer-backed-line-count-minus-approximate-line-count",
      acceptedPassMaxAbsLines: 0,
      warningAllowedForReleaseGating: false,
      blockedFailNonZero: true,
    })

    expect(thresholdDecision.thresholdPolicy.widthDrift.statusRules["accepted-pass"]).toContain("<= 0.5")
    expect(thresholdDecision.thresholdPolicy.widthDrift.statusRules.warning).toContain("<= 1.0")
    expect(thresholdDecision.thresholdPolicy.widthDrift.statusRules["blocked-fail"]).toContain("> 1.0")
    expect(thresholdDecision.thresholdPolicy.heightDrift.statusRules["accepted-pass"]).toContain("<= 0.5")
    expect(thresholdDecision.thresholdPolicy.heightDrift.statusRules.warning).toContain("<= 1.0")
    expect(thresholdDecision.thresholdPolicy.heightDrift.statusRules["blocked-fail"]).toContain("> 1.0")
    expect(thresholdDecision.thresholdPolicy.lineCountDrift.statusRules["accepted-pass"]).toContain("= 0")
    expect(thresholdDecision.thresholdPolicy.lineCountDrift.statusRules.warning).toContain(
      "not allowed for release-gating fixtures",
    )
    expect(thresholdDecision.thresholdPolicy.lineCountDrift.statusRules["blocked-fail"]).toContain("> 0")
    expect(Object.keys(thresholdDecision.statusVocabulary)).toEqual([
      "accepted-pass",
      "warning",
      "blocked-fail",
    ])
  })

  it("keeps the policy JSON-safe and prevents it being mistaken for production evidence", () => {
    expect(thresholdDecision.rawEvidenceIncluded).toBe(false)
    expect(thresholdDecision.rawNativeEvidenceIncluded).toBe(false)
    expect(thresholdDecision.rawWasmEvidenceIncluded).toBe(false)
    expect(thresholdDecision.rawRendererEvidenceIncluded).toBe(false)
    expect(thresholdDecision.driftValuesAcceptedForProduction).toBe(false)
    expect(thresholdDecision.acceptedManifestStatus).toBe("blocked")
    expect(thresholdDecision.productionReady).toBe(false)
    expect(thresholdDecision.defaultMeasurerReplacement).toBe(false)
    expect(thresholdDecision.blockedUntilLater).toEqual({
      acceptedSummaryManifest: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(thresholdDecision.replacementBlockers).toEqual([
      "accepted-manifest-blocked",
      "later-binding-phase-not-run",
    ])

    for (const fixture of thresholdDecision.fixtures) {
      expect(fixture.thresholdPolicyStatus).toBe("accepted-policy")
      expect(fixture.thresholdEvaluationStatus).toBe("not-evaluated-no-raw-values-in-root")
      expect(fixture.requiredThresholds).toEqual(["width-drift", "height-drift", "line-count-drift"])
      expect(fixture.lineCountDriftRequirement).toBe("zero-required")
      expect(fixture.warningAllowedForLineCount).toBe(false)
      expect(fixture.acceptedForManifestPrerequisite).toBe(true)
      expect(fixture.acceptedForProduction).toBe(false)
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawRendererEvidenceIncludedInRoot).toBe(false)
    }

    const serialized = JSON.stringify(thresholdDecision)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("approximateSummary")
    expect(serialized).not.toContain("rendererBackedSummary")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps root checks independent and measureVNextText unchanged", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("rustybuzz:smoke")
    expect(rootScripts).not.toContain("numeric-drift-threshold")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("numeric-drift-threshold")
    expect(coreMeasurement).not.toContain("numeric-drift-threshold")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the decision and advances pointers to accepted manifest population", () => {
    const doc = readText("../docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Numeric Drift Threshold Decision complete.")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json")
    expect(doc).toContain("Accepted Summary Manifest Population.")
    expect(doc).toContain("`width-drift`")
    expect(doc).toContain("`height-drift`")
    expect(doc).toContain("`line-count-drift`")
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

    expect(currentStatus).toContain("Status: updated after Template Publish Accepted Version Metadata Gate.")
    expect(currentStatus).toContain("Numeric Drift Threshold Decision.")
    expect(currentStatus).toContain("Accepted Summary Manifest Population.")
    expect(nextPointer).toContain("Status: current after Template Publish Accepted Version Metadata Gate.")
    expect(nextPointer).toContain("Accepted Summary Manifest Population.")
    expect(nextPointer).toContain("No raw renderer evidence in root docs/tests.")
    expect(readme).toContain("Numeric drift threshold decision")
    expect(readme).toContain("docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain("| 201 | Numeric drift threshold decision | done |")
    expect(ledger).toContain("## Phase 201 Numeric Drift Threshold Decision")
    expect(roadmap).toContain("## Phase 201: Numeric Drift Threshold Decision")
    expect(roadmap).toContain("Current next step after Phase 201:")
    expect(roadmap).toContain("Accepted Summary Manifest Population")
    expect(roadmap).toContain("Historical Phase 200 Handoff")
  })
})
