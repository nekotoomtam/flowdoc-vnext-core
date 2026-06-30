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

type PinningSummary = {
  pinningSummaryId: string
  measurementProfileId: string
  acceptedArtifactPath: string
  digestStatus: "pinned"
  sha256: string
  runtimeIdentityContextMatches: boolean
  rawEvidenceIncluded: boolean
}

type ParityFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  parityStatus: "matching-summary-metadata"
  parityAcceptedForDriftPrerequisite: boolean
  parityAcceptedForProduction: boolean
}

type ParitySummary = {
  nativeWasmParitySummaryId: string
  sourceNativeEvidenceSummaryId: string
  sourceWasmEvidenceSummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  subsetId: "native-wasm-parity-summary-minimal-v1"
  nativeWasmParityStatus: "matching-summary-metadata"
  parityAcceptedForDriftPrerequisite: boolean
  parityAcceptedForProduction: boolean
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  fixtures: ParityFixture[]
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
  parityFixtureStatus: "matching-summary-metadata"
  artifactDigestContext: "matched"
  scenarioIdsMatch: boolean
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
  sourceNativeEvidenceSummaryId: string
  sourceWasmEvidenceSummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rendererBackedProviderOwner: "external-renderer-provider"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityPointer: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  summaryMode: "json-safe-renderer-backed-drift-metadata-only"
  sourceParitySubsetId: "native-wasm-parity-summary-minimal-v1"
  subsetId: "renderer-backed-drift-summary-minimal-v1"
  subsetStatus: "summary-metadata-present"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  rawRendererEvidenceIncluded: boolean
  nativeWasmParitySummaryExists: boolean
  nativeWasmParityStatus: "matching-summary-metadata"
  nativeEvidenceStatus: "summary-metadata-present"
  wasmEvidenceStatus: "summary-metadata-present"
  rendererBackedDriftStatus: "summary-metadata-present"
  rendererBackedDriftSummaryExists: boolean
  rendererBackedDriftScope: "summary-metadata-only"
  rendererBackedProviderBinding: "not-production-bound"
  driftAcceptedForThresholdDecision: boolean
  driftAcceptedForProduction: boolean
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  contextComparison: Record<string, "matched">
  driftMetadataCoverage: DriftMetadataCoverage
  fixtures: DriftFixture[]
  retention: {
    sourceParitySummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json"
      includedInRoot: false
    }
    sourceNativeSummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json"
      includedInRoot: false
    }
    sourceWasmSummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json"
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
  nextRecommendedWork: "Numeric Drift Threshold Decision"
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

describe("renderer-backed drift summary gate", () => {
  it("attaches the drift summary to parity and the pinned digest context", () => {
    expect(driftSummary.rendererBackedDriftSummaryId).toBe(
      "text-engine-renderer-backed-drift-summary-v1",
    )
    expect(driftSummary.sourceNativeWasmParitySummaryId).toBe(paritySummary.nativeWasmParitySummaryId)
    expect(driftSummary.sourceNativeEvidenceSummaryId).toBe(paritySummary.sourceNativeEvidenceSummaryId)
    expect(driftSummary.sourceWasmEvidenceSummaryId).toBe(paritySummary.sourceWasmEvidenceSummaryId)
    expect(driftSummary.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(driftSummary.sourceRuntimeIdentityManifestId).toBe(runtimeIdentityManifest.manifestId)
    expect(driftSummary.matrixId).toBe(paritySummary.matrixId)
    expect(driftSummary.corpusId).toBe(paritySummary.corpusId)
    expect(driftSummary.policyRevision).toBe(paritySummary.policyRevision)
    expect(driftSummary.outputShapeVersion).toBe(paritySummary.outputShapeVersion)
    expect(driftSummary.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(driftSummary.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(driftSummary.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(driftSummary.digestIdentity).toEqual(paritySummary.digestIdentity)
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
      rawEvidenceIncluded: false,
    })
  })

  it("requires matching parity summary metadata for the same subset", () => {
    expect(driftSummary.summaryMode).toBe("json-safe-renderer-backed-drift-metadata-only")
    expect(driftSummary.sourceParitySubsetId).toBe(paritySummary.subsetId)
    expect(driftSummary.subsetId).toBe("renderer-backed-drift-summary-minimal-v1")
    expect(driftSummary.subsetStatus).toBe("summary-metadata-present")
    expect(driftSummary.nativeWasmParitySummaryExists).toBe(true)
    expect(driftSummary.nativeWasmParityStatus).toBe("matching-summary-metadata")
    expect(paritySummary.nativeWasmParityStatus).toBe("matching-summary-metadata")
    expect(paritySummary.parityAcceptedForDriftPrerequisite).toBe(true)
    expect(paritySummary.parityAcceptedForProduction).toBe(false)
    expect(driftSummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      paritySummary.fixtures.map((fixture) => fixture.fixtureId),
    )

    for (const [index, fixture] of driftSummary.fixtures.entries()) {
      const parityFixture = paritySummary.fixtures[index]
      expect(fixture.fixtureId).toBe(parityFixture.fixtureId)
      expect(fixture.scenarioIds).toEqual(parityFixture.scenarioIds)
      expect(fixture.gateType).toBe(parityFixture.gateType)
      expect(fixture.subsetPriority).toBe(parityFixture.subsetPriority)
      expect(fixture.coverageCategory).toBe(parityFixture.coverageCategory)
      expect(fixture.measurementProfileId).toBe(parityFixture.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
      expect(fixture.parityFixtureStatus).toBe("matching-summary-metadata")
      expect(fixture.artifactDigestContext).toBe("matched")
      expect(fixture.scenarioIdsMatch).toBe(true)
    }
  })

  it("records JSON-safe renderer-backed drift metadata and excludes raw evidence", () => {
    const expectedDriftCoverage: DriftMetadataCoverage = {
      "approximate-summary": "metadata-present",
      "renderer-backed-summary": "metadata-present",
      "width-drift": "metadata-present-unthresholded",
      "height-drift": "metadata-present-unthresholded",
      "line-count-drift": "metadata-present-unthresholded",
    }

    expect(driftSummary.rawEvidenceIncluded).toBe(false)
    expect(driftSummary.rawNativeEvidenceIncluded).toBe(false)
    expect(driftSummary.rawWasmEvidenceIncluded).toBe(false)
    expect(driftSummary.rawRendererEvidenceIncluded).toBe(false)
    expect(driftSummary.contextComparison).toEqual({
      artifactDigestContext: "matched",
      matrixId: "matched",
      corpusId: "matched",
      policyRevision: "matched",
      measurementProfileId: "matched",
      outputShapeVersion: "matched",
      fixtureIds: "matched",
      scenarioIds: "matched",
      parityStatus: "matched",
    })
    expect(driftSummary.driftMetadataCoverage).toEqual(expectedDriftCoverage)

    for (const fixture of driftSummary.fixtures) {
      expect(fixture.driftSummaryStatus).toBe("summary-metadata-present")
      expect(fixture.driftMetadataCoverage).toEqual(expectedDriftCoverage)
      expect(fixture.numericDriftThresholdStatus).toBe("blocked")
      expect(fixture.driftAcceptedForThresholdDecision).toBe(true)
      expect(fixture.driftAcceptedForProduction).toBe(false)
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawRendererEvidenceIncludedInRoot).toBe(false)
    }

    const serialized = JSON.stringify(driftSummary)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps thresholds, accepted manifest, production binding, and default measurer blocked", () => {
    expect(driftSummary.nativeEvidenceStatus).toBe("summary-metadata-present")
    expect(driftSummary.wasmEvidenceStatus).toBe("summary-metadata-present")
    expect(driftSummary.rendererBackedDriftStatus).toBe("summary-metadata-present")
    expect(driftSummary.rendererBackedDriftSummaryExists).toBe(true)
    expect(driftSummary.rendererBackedDriftScope).toBe("summary-metadata-only")
    expect(driftSummary.rendererBackedProviderBinding).toBe("not-production-bound")
    expect(driftSummary.driftAcceptedForThresholdDecision).toBe(true)
    expect(driftSummary.driftAcceptedForProduction).toBe(false)
    expect(driftSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(driftSummary.acceptedManifestStatus).toBe("blocked")
    expect(driftSummary.productionReady).toBe(false)
    expect(driftSummary.defaultMeasurerReplacement).toBe(false)
    expect(driftSummary.blockedUntilLater).toEqual({
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(driftSummary.replacementBlockers).toEqual([
      "numeric-drift-thresholds-blocked",
      "accepted-manifest-blocked",
      "later-binding-phase-not-run",
    ])
    expect(driftSummary.nextRecommendedWork).toBe("Numeric Drift Threshold Decision")
    expect(driftSummary.phaseRule).toBe(
      "proceed-to-numeric-drift-threshold-decision-only-if-renderer-drift-summary-matches-parity-context",
    )
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
    expect(rootScripts).not.toContain("renderer-backed-drift-summary")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("renderer-backed-drift-summary")
    expect(coreMeasurement).not.toContain("renderer-backed-drift-summary")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to numeric drift threshold decision", () => {
    const doc = readText("../docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Renderer-backed Drift Summary Gate complete.")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json")
    expect(doc).toContain("Numeric Drift Threshold Decision.")
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

    expect(currentStatus).toContain("Status: updated after Template Publish Validation Evidence Gate.")
    expect(currentStatus).toContain("Renderer-backed Drift Summary Gate.")
    expect(currentStatus).toContain("Numeric Drift Threshold Decision.")
    expect(nextPointer).toContain("Status: current after Template Publish Validation Evidence Gate.")
    expect(nextPointer).toContain("Numeric Drift Threshold Decision.")
    expect(nextPointer).toContain("No raw renderer evidence in root docs/tests.")
    expect(readme).toContain("Renderer-backed drift summary gate")
    expect(readme).toContain("docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain("| 200 | Renderer-backed drift summary gate | done |")
    expect(ledger).toContain("## Phase 200 Renderer-backed Drift Summary Gate")
    expect(roadmap).toContain("## Phase 200: Renderer-backed Drift Summary Gate")
    expect(roadmap).toContain("Current next step after Phase 200:")
    expect(roadmap).toContain("Numeric Drift Threshold Decision")
    expect(roadmap).toContain("Historical Phase 199 Handoff")
  })
})
