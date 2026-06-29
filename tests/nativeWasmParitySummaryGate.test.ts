import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocTextEngineRuntimeIdentityManifest } from "../packages/text-engine-rust-wasm/src/index.js"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"
const FULL_PROFILE_PREFIX = "measurement-profile-v1:thai-rustybuzz-icu4x-v1"

type PinningSummary = {
  pinningSummaryId: string
  measurementProfileId: string
  acceptedArtifactPath: string
  digestStatus: "pinned"
  sha256: string
  runtimeIdentityContextMatches: boolean
  rawEvidenceIncluded: boolean
}

type EvidenceDigestIdentity = {
  status: "pinned"
  artifactPath: string
  sha256: string
  runtimeIdentityContextMatches: boolean
}

type NativeFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  nativeSummaryCoverage: Record<string, "metadata-present">
  status: "summary-metadata-present"
}

type WasmFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  wasmSummaryCoverage: Record<string, "metadata-present">
  status: "summary-metadata-present"
}

type NativeEvidenceSummary = {
  nativeEvidenceSummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  subsetId: "native-evidence-summary-minimal-v1"
  nativeEvidenceSummaryExists: boolean
  nativeEvidenceStatus: "summary-metadata-present"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  fixtures: NativeFixture[]
}

type WasmEvidenceSummary = {
  wasmEvidenceSummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  subsetId: "wasm-evidence-summary-minimal-v1"
  wasmEvidenceSummaryExists: boolean
  wasmEvidenceStatus: "summary-metadata-present"
  rawEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  fixtures: WasmFixture[]
}

type ParityFixture = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  nativeFixtureStatus: "summary-metadata-present"
  wasmFixtureStatus: "summary-metadata-present"
  artifactDigestContext: "matched"
  scenarioIdsMatch: boolean
  factCoverageMatches: boolean
  comparedFacts: string[]
  parityStatus: "matching-summary-metadata"
  parityAcceptedForDriftPrerequisite: boolean
  parityAcceptedForProduction: boolean
  rawNativeEvidenceIncludedInRoot: boolean
  rawWasmEvidenceIncludedInRoot: boolean
}

type ParitySummary = {
  nativeWasmParitySummaryId: string
  sourceNativeEvidenceSummaryId: string
  sourceWasmEvidenceSummaryId: string
  sourcePinningSummaryId: string
  sourceRuntimeIdentityManifestId: string
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityPointer: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: EvidenceDigestIdentity
  summaryMode: "json-safe-native-wasm-parity-metadata-only"
  sourceNativeSubsetId: "native-evidence-summary-minimal-v1"
  sourceWasmSubsetId: "wasm-evidence-summary-minimal-v1"
  subsetId: "native-wasm-parity-summary-minimal-v1"
  subsetStatus: "matching-summary-metadata"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  nativeEvidenceSummaryExists: boolean
  wasmEvidenceSummaryExists: boolean
  nativeEvidenceStatus: "summary-metadata-present"
  wasmEvidenceStatus: "summary-metadata-present"
  nativeWasmParityStatus: "matching-summary-metadata"
  parityScope: "summary-metadata-only"
  parityAcceptedForDriftPrerequisite: boolean
  parityAcceptedForProduction: boolean
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  contextComparison: Record<string, "matched">
  factCoverageComparison: Record<
    string,
    {
      nativeCoverage: "metadata-present"
      wasmCoverage: "metadata-present"
      status: "matched"
    }
  >
  fixtures: ParityFixture[]
  retention: {
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
    rendererEvidence: {
      owner: "external-renderer-provider"
      pointer: null
      includedInRoot: false
    }
  }
  mismatchPolicy: Record<string, "blocked" | "mismatched">
  blockedUntilLater: Record<string, boolean>
  replacementBlockers: string[]
  nextRecommendedWork: "Renderer-backed Drift Summary Gate"
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

const paritySummary = readJson<ParitySummary>(
  "../packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json",
)

const nativeSummary = readJson<NativeEvidenceSummary>(
  "../packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json",
)

const wasmSummary = readJson<WasmEvidenceSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json",
)

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

describe("native/WASM parity summary gate", () => {
  it("attaches the parity summary to native, WASM, runtime identity, and pinned digest context", () => {
    expect(paritySummary.nativeWasmParitySummaryId).toBe("text-engine-native-wasm-parity-summary-v1")
    expect(paritySummary.sourceNativeEvidenceSummaryId).toBe(nativeSummary.nativeEvidenceSummaryId)
    expect(paritySummary.sourceWasmEvidenceSummaryId).toBe(wasmSummary.wasmEvidenceSummaryId)
    expect(paritySummary.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(paritySummary.sourceRuntimeIdentityManifestId).toBe(runtimeIdentityManifest.manifestId)
    expect(paritySummary.matrixId).toBe(nativeSummary.matrixId)
    expect(paritySummary.matrixId).toBe(wasmSummary.matrixId)
    expect(paritySummary.corpusId).toBe(nativeSummary.corpusId)
    expect(paritySummary.corpusId).toBe(wasmSummary.corpusId)
    expect(paritySummary.policyRevision).toBe(nativeSummary.policyRevision)
    expect(paritySummary.policyRevision).toBe(wasmSummary.policyRevision)
    expect(paritySummary.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(paritySummary.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(paritySummary.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(paritySummary.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(paritySummary.digestIdentity).toEqual(nativeSummary.digestIdentity)
    expect(paritySummary.digestIdentity).toEqual(wasmSummary.digestIdentity)
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
      rawEvidenceIncluded: false,
    })
  })

  it("confirms native and WASM summaries exist for the same subset", () => {
    expect(paritySummary.summaryMode).toBe("json-safe-native-wasm-parity-metadata-only")
    expect(paritySummary.sourceNativeSubsetId).toBe(nativeSummary.subsetId)
    expect(paritySummary.sourceWasmSubsetId).toBe(wasmSummary.subsetId)
    expect(paritySummary.subsetId).toBe("native-wasm-parity-summary-minimal-v1")
    expect(paritySummary.subsetStatus).toBe("matching-summary-metadata")
    expect(paritySummary.nativeEvidenceSummaryExists).toBe(true)
    expect(paritySummary.wasmEvidenceSummaryExists).toBe(true)
    expect(nativeSummary.nativeEvidenceSummaryExists).toBe(true)
    expect(wasmSummary.wasmEvidenceSummaryExists).toBe(true)
    expect(paritySummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual([
      "v1-measure-thai-line-break-core",
      "v1-measure-latin-product-paragraphs",
    ])
    expect(paritySummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      nativeSummary.fixtures.map((fixture) => fixture.fixtureId),
    )
    expect(paritySummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      wasmSummary.fixtures.map((fixture) => fixture.fixtureId),
    )

    for (const [index, fixture] of paritySummary.fixtures.entries()) {
      const nativeFixture = nativeSummary.fixtures[index]
      const wasmFixture = wasmSummary.fixtures[index]
      expect(fixture.scenarioIds).toEqual(nativeFixture.scenarioIds)
      expect(fixture.scenarioIds).toEqual(wasmFixture.scenarioIds)
      expect(fixture.gateType).toBe(nativeFixture.gateType)
      expect(fixture.gateType).toBe(wasmFixture.gateType)
      expect(fixture.subsetPriority).toBe(nativeFixture.subsetPriority)
      expect(fixture.subsetPriority).toBe(wasmFixture.subsetPriority)
      expect(fixture.coverageCategory).toBe(nativeFixture.coverageCategory)
      expect(fixture.coverageCategory).toBe(wasmFixture.coverageCategory)
      expect(fixture.measurementProfileId).toBe(nativeFixture.measurementProfileId)
      expect(fixture.measurementProfileId).toBe(wasmFixture.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
    }
  })

  it("records matched context and coverage facts without raw evidence", () => {
    const comparedFacts = [
      "glyph-facts",
      "cluster-map",
      "text-range",
      "line-boxes",
      "total-size",
      "line-count",
    ]

    expect(paritySummary.rawEvidenceIncluded).toBe(false)
    expect(paritySummary.rawNativeEvidenceIncluded).toBe(false)
    expect(paritySummary.rawWasmEvidenceIncluded).toBe(false)
    expect(paritySummary.contextComparison).toEqual({
      artifactDigestContext: "matched",
      matrixId: "matched",
      corpusId: "matched",
      policyRevision: "matched",
      measurementProfileId: "matched",
      outputShapeVersion: "matched",
      fixtureIds: "matched",
      scenarioIds: "matched",
    })

    expect(Object.keys(paritySummary.factCoverageComparison)).toEqual(comparedFacts)
    for (const fact of comparedFacts) {
      expect(paritySummary.factCoverageComparison[fact]).toEqual({
        nativeCoverage: "metadata-present",
        wasmCoverage: "metadata-present",
        status: "matched",
      })
    }

    for (const fixture of paritySummary.fixtures) {
      const nativeFixture = nativeSummary.fixtures.find((candidate) => candidate.fixtureId === fixture.fixtureId)
      const wasmFixture = wasmSummary.fixtures.find((candidate) => candidate.fixtureId === fixture.fixtureId)

      expect(nativeFixture).toBeDefined()
      expect(wasmFixture).toBeDefined()
      expect(fixture.nativeFixtureStatus).toBe("summary-metadata-present")
      expect(fixture.wasmFixtureStatus).toBe("summary-metadata-present")
      expect(fixture.artifactDigestContext).toBe("matched")
      expect(fixture.scenarioIdsMatch).toBe(true)
      expect(fixture.factCoverageMatches).toBe(true)
      expect(fixture.comparedFacts).toEqual(comparedFacts)
      expect(fixture.parityStatus).toBe("matching-summary-metadata")
      expect(fixture.parityAcceptedForDriftPrerequisite).toBe(true)
      expect(fixture.parityAcceptedForProduction).toBe(false)
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
    }

    const serialized = JSON.stringify(paritySummary)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps downstream drift, thresholds, accepted manifest, and production binding blocked", () => {
    expect(paritySummary.nativeEvidenceStatus).toBe("summary-metadata-present")
    expect(paritySummary.wasmEvidenceStatus).toBe("summary-metadata-present")
    expect(paritySummary.nativeWasmParityStatus).toBe("matching-summary-metadata")
    expect(paritySummary.parityScope).toBe("summary-metadata-only")
    expect(paritySummary.parityAcceptedForDriftPrerequisite).toBe(true)
    expect(paritySummary.parityAcceptedForProduction).toBe(false)
    expect(paritySummary.rendererBackedDriftStatus).toBe("unknown")
    expect(paritySummary.numericDriftThresholdStatus).toBe("blocked")
    expect(paritySummary.acceptedManifestStatus).toBe("blocked")
    expect(paritySummary.productionReady).toBe(false)
    expect(paritySummary.defaultMeasurerReplacement).toBe(false)
    expect(paritySummary.blockedUntilLater).toEqual({
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(paritySummary.replacementBlockers).toEqual([
      "renderer-backed-drift-unknown",
      "numeric-drift-thresholds-blocked",
      "accepted-manifest-blocked",
      "later-binding-phase-not-run",
    ])
    expect(paritySummary.mismatchPolicy).toEqual({
      staleDigest: "blocked",
      matrixMismatch: "blocked",
      corpusMismatch: "blocked",
      policyMismatch: "blocked",
      measurementProfileMismatch: "blocked",
      outputShapeMismatch: "blocked",
      fixtureIdMismatch: "mismatched",
      scenarioIdMismatch: "mismatched",
      factCoverageMismatch: "mismatched",
    })
    expect(paritySummary.nextRecommendedWork).toBe("Renderer-backed Drift Summary Gate")
    expect(paritySummary.phaseRule).toBe(
      "proceed-to-renderer-backed-drift-only-if-parity-summary-remains-matching",
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
    expect(rootScripts).not.toContain("native-wasm-parity-summary")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("native-wasm-parity-summary")
    expect(coreMeasurement).not.toContain("native-wasm-parity-summary")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to renderer-backed drift summary", () => {
    const doc = readText("../docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Native/WASM Parity Summary Gate complete.")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json")
    expect(doc).toContain("Renderer-backed Drift Summary Gate.")
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

    expect(currentStatus).toContain("Status: updated after Native/WASM Parity Summary Gate.")
    expect(currentStatus).toContain("Native/WASM Parity Summary Gate.")
    expect(currentStatus).toContain("Renderer-backed Drift Summary Gate.")
    expect(nextPointer).toContain("Status: current after Native/WASM Parity Summary Gate.")
    expect(nextPointer).toContain("Renderer-backed Drift Summary Gate.")
    expect(nextPointer).toContain("No raw native/WASM evidence in root docs/tests.")
    expect(readme).toContain("Native/WASM parity summary gate")
    expect(readme).toContain("docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md")
    expect(packageReadme).toContain("Status: Native/WASM parity summary metadata package.")
    expect(ledger).toContain("| 199 | Native/WASM parity summary gate | done |")
    expect(ledger).toContain("## Phase 199 Native/WASM Parity Summary Gate")
    expect(roadmap).toContain("## Phase 199: Native/WASM Parity Summary Gate")
    expect(roadmap).toContain("Current next step after Phase 199:")
    expect(roadmap).toContain("Renderer-backed Drift Summary Gate")
    expect(roadmap).toContain("Historical Phase 198 Handoff")
  })
})
