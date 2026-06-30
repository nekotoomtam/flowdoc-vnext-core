import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocTextEngineRuntimeIdentityManifest } from "../packages/text-engine-rust-wasm/src/index.js"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"
const FULL_PROFILE_PREFIX = "measurement-profile-v1:thai-rustybuzz-icu4x-v1"

type PinningSummary = {
  pinningSummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  acceptedArtifactPath: string
  digestStatus: "pinned"
  sha256: string
  runtimeIdentityContextMatches: boolean
  rawEvidenceIncluded: boolean
}

type NativeEvidenceFixtureSummary = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  sourceCorpusPointers: string[]
  status: "summary-metadata-present"
}

type NativeEvidenceSummary = {
  nativeEvidenceSummaryId: string
  sourcePinningSummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  digestIdentity: {
    status: "pinned"
    artifactPath: string
    sha256: string
    runtimeIdentityContextMatches: boolean
  }
  subsetId: "native-evidence-summary-minimal-v1"
  nativeEvidenceStatus: "summary-metadata-present"
  wasmEvidenceStatus: "blocked"
  nativeWasmParityStatus: "not-run"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  fixtures: NativeEvidenceFixtureSummary[]
}

type WasmEvidenceFixtureSummary = {
  fixtureId: string
  scenarioIds: string[]
  gateType: "release-gating"
  subsetPriority: number
  coverageCategory: string
  measurementProfileId: string
  sourceCorpusPointers: string[]
  nativeSubsetMatches: boolean
  nativeSummaryFixtureStatus: "summary-metadata-present"
  requiredWasmFacts: string[]
  wasmSummaryCoverage: Record<string, "metadata-present">
  nonWasmCoverage: {
    "drift-summary": "blocked"
    "parity-summary": "not-run"
  }
  status: "summary-metadata-present"
  accepted: boolean
  rawFactValuesIncluded: boolean
  rawWasmEvidencePointer: string
  rawWasmEvidenceIncludedInRoot: boolean
}

type WasmEvidenceSummary = {
  wasmEvidenceSummaryId: string
  sourceNativeEvidenceSummaryId: string
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
  digestIdentity: {
    status: "pinned"
    artifactPath: string
    sha256: string
    runtimeIdentityContextMatches: boolean
  }
  summaryMode: "json-safe-wasm-evidence-metadata-only"
  sourceSubsetId: "native-evidence-summary-minimal-v1"
  subsetId: "wasm-evidence-summary-minimal-v1"
  subsetStatus: "summary-metadata-present"
  rawEvidenceIncluded: boolean
  rawWasmEvidenceIncluded: boolean
  rawWasmOutputIncluded: boolean
  nativeEvidenceStatus: "summary-metadata-present"
  wasmEvidenceStatus: "summary-metadata-present"
  wasmEvidenceSummaryExists: boolean
  wasmEvidenceExecutionMode: "metadata-only-no-wasm-execution"
  wasmEngineExecutionInCore: boolean
  wasmArtifactLoadedByRoot: boolean
  nativeWasmParityStatus: "not-run"
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  fixtures: WasmEvidenceFixtureSummary[]
  retention: {
    sourceNativeSummary: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: "packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json"
      includedInRoot: false
    }
    rawWasmEvidence: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointerKind: "external-placeholder"
      pointers: string[]
      includedInRoot: false
    }
    rendererEvidence: {
      owner: "external-renderer-provider"
      pointer: null
      includedInRoot: false
    }
  }
  blockedUntilLater: Record<string, boolean>
  replacementBlockers: string[]
  nextRecommendedWork: "Native/WASM Parity Summary Gate"
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

const wasmSummary = readJson<WasmEvidenceSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json",
)

const nativeSummary = readJson<NativeEvidenceSummary>(
  "../packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json",
)

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

describe("WASM evidence summary gate", () => {
  it("attaches the WASM summary to the native summary and pinned digest context", () => {
    expect(wasmSummary.wasmEvidenceSummaryId).toBe("text-engine-wasm-evidence-summary-v1")
    expect(wasmSummary.sourceNativeEvidenceSummaryId).toBe(nativeSummary.nativeEvidenceSummaryId)
    expect(wasmSummary.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(wasmSummary.sourceRuntimeIdentityManifestId).toBe(runtimeIdentityManifest.manifestId)
    expect(wasmSummary.matrixId).toBe(nativeSummary.matrixId)
    expect(wasmSummary.corpusId).toBe(nativeSummary.corpusId)
    expect(wasmSummary.policyRevision).toBe(nativeSummary.policyRevision)
    expect(wasmSummary.outputShapeVersion).toBe(nativeSummary.outputShapeVersion)
    expect(wasmSummary.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(wasmSummary.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(wasmSummary.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(nativeSummary.digestIdentity).toEqual(wasmSummary.digestIdentity)
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
      rawEvidenceIncluded: false,
    })
  })

  it("uses the same smallest fixture subset and scenario ids as native evidence", () => {
    expect(wasmSummary.summaryMode).toBe("json-safe-wasm-evidence-metadata-only")
    expect(wasmSummary.sourceSubsetId).toBe(nativeSummary.subsetId)
    expect(wasmSummary.subsetId).toBe("wasm-evidence-summary-minimal-v1")
    expect(wasmSummary.subsetStatus).toBe("summary-metadata-present")
    expect(wasmSummary.wasmEvidenceSummaryExists).toBe(true)
    expect(wasmSummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual(
      nativeSummary.fixtures.map((fixture) => fixture.fixtureId),
    )

    for (const [index, fixture] of wasmSummary.fixtures.entries()) {
      const nativeFixture = nativeSummary.fixtures[index]
      expect(fixture.fixtureId).toBe(nativeFixture.fixtureId)
      expect(fixture.scenarioIds).toEqual(nativeFixture.scenarioIds)
      expect(fixture.gateType).toBe(nativeFixture.gateType)
      expect(fixture.subsetPriority).toBe(nativeFixture.subsetPriority)
      expect(fixture.coverageCategory).toBe(nativeFixture.coverageCategory)
      expect(fixture.measurementProfileId).toBe(nativeFixture.measurementProfileId)
      expect(fixture.sourceCorpusPointers).toEqual(nativeFixture.sourceCorpusPointers)
      expect(fixture.nativeSubsetMatches).toBe(true)
      expect(fixture.nativeSummaryFixtureStatus).toBe("summary-metadata-present")
      expect(fixture.status).toBe("summary-metadata-present")
      expect(fixture.accepted).toBe(false)
    }
  })

  it("keeps only JSON-safe WASM metadata and excludes raw WASM evidence", () => {
    const requiredWasmFacts = [
      "glyph-facts",
      "cluster-map",
      "text-range",
      "line-boxes",
      "total-size",
      "line-count",
    ]

    expect(wasmSummary.rawEvidenceIncluded).toBe(false)
    expect(wasmSummary.rawWasmEvidenceIncluded).toBe(false)
    expect(wasmSummary.rawWasmOutputIncluded).toBe(false)
    expect(wasmSummary.wasmEvidenceExecutionMode).toBe("metadata-only-no-wasm-execution")
    expect(wasmSummary.wasmEngineExecutionInCore).toBe(false)
    expect(wasmSummary.wasmArtifactLoadedByRoot).toBe(false)

    for (const fixture of wasmSummary.fixtures) {
      expect(fixture.measurementProfileId).toBe(wasmSummary.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
      expect(fixture.requiredWasmFacts).toEqual(requiredWasmFacts)
      expect(fixture.wasmSummaryCoverage).toEqual({
        "glyph-facts": "metadata-present",
        "cluster-map": "metadata-present",
        "text-range": "metadata-present",
        "line-boxes": "metadata-present",
        "total-size": "metadata-present",
        "line-count": "metadata-present",
      })
      expect(fixture.nonWasmCoverage).toEqual({
        "drift-summary": "blocked",
        "parity-summary": "not-run",
      })
      expect(fixture.rawFactValuesIncluded).toBe(false)
      expect(fixture.rawWasmEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawWasmEvidencePointer).toMatch(/^external-wasm-evidence:\/\//u)
    }

    const serialized = JSON.stringify(wasmSummary)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps parity, drift, thresholds, accepted manifest, and production binding blocked", () => {
    expect(wasmSummary.nativeEvidenceStatus).toBe("summary-metadata-present")
    expect(wasmSummary.wasmEvidenceStatus).toBe("summary-metadata-present")
    expect(wasmSummary.nativeWasmParityStatus).toBe("not-run")
    expect(wasmSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(wasmSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(wasmSummary.acceptedManifestStatus).toBe("blocked")
    expect(wasmSummary.productionReady).toBe(false)
    expect(wasmSummary.defaultMeasurerReplacement).toBe(false)
    expect(wasmSummary.blockedUntilLater).toEqual({
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(wasmSummary.replacementBlockers).toEqual([
      "native-wasm-parity-not-run",
      "renderer-backed-drift-unknown",
      "numeric-drift-thresholds-blocked",
      "accepted-manifest-blocked",
      "later-binding-phase-not-run",
    ])
    expect(wasmSummary.nextRecommendedWork).toBe("Native/WASM Parity Summary Gate")
    expect(wasmSummary.phaseRule).toBe(
      "proceed-to-native-wasm-parity-only-if-wasm-summary-context-and-subset-match-native",
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
    expect(rootScripts).not.toContain("wasm-evidence-summary")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-evidence-summary")
    expect(coreMeasurement).not.toContain("wasm-evidence-summary")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to native/WASM parity summary", () => {
    const doc = readText("../docs/WASM_EVIDENCE_SUMMARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: WASM Evidence Summary Gate complete.")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json")
    expect(doc).toContain("Native/WASM Parity Summary Gate.")
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

    expect(currentStatus).toContain("Status: updated after Numeric Drift Threshold Decision.")
    expect(currentStatus).toContain("WASM Evidence Summary Gate.")
    expect(currentStatus).toContain("Native/WASM Parity Summary Gate.")
    expect(nextPointer).toContain("Status: current after Numeric Drift Threshold Decision.")
    expect(nextPointer).toContain("Native/WASM Parity Summary Gate.")
    expect(nextPointer).toContain("No raw WASM evidence in root docs/tests.")
    expect(readme).toContain("WASM evidence summary gate")
    expect(readme).toContain("docs/WASM_EVIDENCE_SUMMARY_GATE.md")
    expect(packageReadme).toContain("Status: Numeric drift threshold policy package.")
    expect(ledger).toContain("| 198 | WASM evidence summary gate | done |")
    expect(ledger).toContain("## Phase 198 WASM Evidence Summary Gate")
    expect(roadmap).toContain("## Phase 198: WASM Evidence Summary Gate")
    expect(roadmap).toContain("Current next step after Phase 198:")
    expect(roadmap).toContain("Native/WASM Parity Summary Gate")
    expect(roadmap).toContain("Historical Phase 197 Handoff")
  })
})
