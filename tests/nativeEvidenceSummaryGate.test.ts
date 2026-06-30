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
  requiredNativeFacts: string[]
  nativeSummaryCoverage: Record<string, "metadata-present">
  nonNativeCoverage: {
    "drift-summary": "blocked"
    "parity-summary": "not-run"
  }
  status: "summary-metadata-present"
  accepted: boolean
  rawFactValuesIncluded: boolean
  rawNativeEvidencePointer: string
  rawNativeEvidenceIncludedInRoot: boolean
}

type NativeEvidenceSummary = {
  nativeEvidenceSummaryId: string
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
  summaryMode: "json-safe-native-evidence-metadata-only"
  subsetId: string
  subsetStatus: "summary-metadata-present"
  rawEvidenceIncluded: boolean
  rawNativeEvidenceIncluded: boolean
  rawNativeOutputIncluded: boolean
  nativeEvidenceStatus: "summary-metadata-present"
  nativeEvidenceSummaryExists: boolean
  nativeEngineExecutionInCore: boolean
  wasmEvidenceStatus: "blocked"
  nativeWasmParityStatus: "not-run"
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  fixtures: NativeEvidenceFixtureSummary[]
  retention: {
    rawNativeEvidence: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointerKind: "external-placeholder"
      pointers: string[]
      includedInRoot: false
    }
    rawWasmEvidence: {
      owner: "@flowdoc/text-engine-rust-wasm"
      pointer: null
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
  nextRecommendedWork: "WASM Evidence Summary Gate"
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

const nativeSummary = readJson<NativeEvidenceSummary>(
  "../packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json",
)

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

describe("native evidence summary gate", () => {
  it("attaches the native summary to the pinned digest identity context", () => {
    expect(nativeSummary.nativeEvidenceSummaryId).toBe("text-engine-native-evidence-summary-v1")
    expect(nativeSummary.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(nativeSummary.sourceRuntimeIdentityManifestId).toBe(runtimeIdentityManifest.manifestId)
    expect(nativeSummary.matrixId).toBe("v1-measurement-fixture-evidence-matrix-v1")
    expect(nativeSummary.corpusId).toBe("v1-measurement-evidence-corpus-v1")
    expect(nativeSummary.policyRevision).toBe("v1-measurement-evidence-policy-v1")
    expect(nativeSummary.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(nativeSummary.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(nativeSummary.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(nativeSummary.digestIdentity).toEqual({
      status: "pinned",
      artifactPath: ACCEPTED_ARTIFACT_PATH,
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
    })
    expect(pinningSummary).toMatchObject({
      acceptedArtifactPath: ACCEPTED_ARTIFACT_PATH,
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
      runtimeIdentityContextMatches: true,
      rawEvidenceIncluded: false,
    })
    expect(runtimeIdentityManifest.runtime.wasmArtifact).toEqual({
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
    })
  })

  it("defines the smallest native evidence summary subset", () => {
    expect(nativeSummary.summaryMode).toBe("json-safe-native-evidence-metadata-only")
    expect(nativeSummary.subsetId).toBe("native-evidence-summary-minimal-v1")
    expect(nativeSummary.subsetStatus).toBe("summary-metadata-present")
    expect(nativeSummary.nativeEvidenceSummaryExists).toBe(true)
    expect(nativeSummary.fixtures.map((fixture) => fixture.fixtureId)).toEqual([
      "v1-measure-thai-line-break-core",
      "v1-measure-latin-product-paragraphs",
    ])

    const thai = nativeSummary.fixtures[0]
    const latin = nativeSummary.fixtures[1]

    expect(thai).toMatchObject({
      fixtureId: "v1-measure-thai-line-break-core",
      scenarioIds: ["thai-greeting-no-space", "thai-combining-marks"],
      gateType: "release-gating",
      subsetPriority: 1,
      coverageCategory: "thai-line-break-core",
      status: "summary-metadata-present",
      accepted: false,
    })
    expect(thai.sourceCorpusPointers).toEqual([
      "fixtures/thai-measurement-corpus.v1.json",
      "fixtures/thai-line-break-evidence.v1.json",
    ])
    expect(latin).toMatchObject({
      fixtureId: "v1-measure-latin-product-paragraphs",
      scenarioIds: ["product-report-vnext", "product-report-vnext-minimal"],
      gateType: "release-gating",
      subsetPriority: 2,
      coverageCategory: "canonical-latin-product-paragraph",
      status: "summary-metadata-present",
      accepted: false,
    })
    expect(latin.sourceCorpusPointers).toEqual([
      "fixtures/product-report-vnext.flowdoc.json",
      "fixtures/product-report-vnext-minimal.flowdoc.json",
    ])
  })

  it("keeps only JSON-safe native metadata and excludes raw native evidence", () => {
    const requiredNativeFacts = [
      "glyph-facts",
      "cluster-map",
      "text-range",
      "line-boxes",
      "total-size",
      "line-count",
    ]

    expect(nativeSummary.rawEvidenceIncluded).toBe(false)
    expect(nativeSummary.rawNativeEvidenceIncluded).toBe(false)
    expect(nativeSummary.rawNativeOutputIncluded).toBe(false)
    expect(nativeSummary.nativeEngineExecutionInCore).toBe(false)

    for (const fixture of nativeSummary.fixtures) {
      expect(fixture.measurementProfileId).toBe(nativeSummary.measurementProfileId)
      expect(fixture.measurementProfileId.startsWith(FULL_PROFILE_PREFIX)).toBe(true)
      expect(fixture.requiredNativeFacts).toEqual(requiredNativeFacts)
      expect(fixture.nativeSummaryCoverage).toEqual({
        "glyph-facts": "metadata-present",
        "cluster-map": "metadata-present",
        "text-range": "metadata-present",
        "line-boxes": "metadata-present",
        "total-size": "metadata-present",
        "line-count": "metadata-present",
      })
      expect(fixture.nonNativeCoverage).toEqual({
        "drift-summary": "blocked",
        "parity-summary": "not-run",
      })
      expect(fixture.rawFactValuesIncluded).toBe(false)
      expect(fixture.rawNativeEvidenceIncludedInRoot).toBe(false)
      expect(fixture.rawNativeEvidencePointer).toMatch(/^external-native-evidence:\/\//u)
    }

    const serialized = JSON.stringify(nativeSummary)
    expect(serialized).not.toContain("rawGlyphs")
    expect(serialized).not.toContain("rawClusters")
    expect(serialized).not.toContain("rawLineBoxes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("stdout")
    expect(serialized).not.toContain("stderr")
  })

  it("keeps downstream evidence and production binding blocked", () => {
    expect(nativeSummary.nativeEvidenceStatus).toBe("summary-metadata-present")
    expect(nativeSummary.wasmEvidenceStatus).toBe("blocked")
    expect(nativeSummary.nativeWasmParityStatus).toBe("not-run")
    expect(nativeSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(nativeSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(nativeSummary.acceptedManifestStatus).toBe("blocked")
    expect(nativeSummary.productionReady).toBe(false)
    expect(nativeSummary.defaultMeasurerReplacement).toBe(false)
    expect(nativeSummary.blockedUntilLater).toEqual({
      wasmEvidence: true,
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
      productionBinding: true,
      defaultMeasurerReplacement: true,
    })
    expect(nativeSummary.replacementBlockers).toEqual([
      "wasm-evidence-blocked",
      "native-wasm-parity-not-run",
      "renderer-backed-drift-unknown",
      "numeric-drift-thresholds-blocked",
      "accepted-manifest-blocked",
      "later-binding-phase-not-run",
    ])
    expect(nativeSummary.nextRecommendedWork).toBe("WASM Evidence Summary Gate")
    expect(nativeSummary.phaseRule).toBe(
      "proceed-to-wasm-evidence-only-if-native-summary-context-matches-pinned-digest",
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
    expect(rootScripts).not.toContain("native-evidence-summary")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("native-evidence-summary")
    expect(coreMeasurement).not.toContain("native-evidence-summary")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to WASM evidence summary", () => {
    const doc = readText("../docs/NATIVE_EVIDENCE_SUMMARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Native Evidence Summary Gate complete.")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json")
    expect(doc).toContain("WASM Evidence Summary Gate.")
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

    expect(currentStatus).toContain("Status: updated after Variable Schema / Data Contract Planning Gate.")
    expect(currentStatus).toContain("Native Evidence Summary Gate.")
    expect(currentStatus).toContain("WASM Evidence Summary Gate.")
    expect(nextPointer).toContain("Status: current after Variable Schema / Data Contract Planning Gate.")
    expect(nextPointer).toContain("WASM Evidence Summary Gate.")
    expect(nextPointer).toContain("No raw native evidence in root docs/tests.")
    expect(readme).toContain("Native evidence summary gate")
    expect(readme).toContain("docs/NATIVE_EVIDENCE_SUMMARY_GATE.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain("| 197 | Native evidence summary gate | done |")
    expect(ledger).toContain("## Phase 197 Native Evidence Summary Gate")
    expect(roadmap).toContain("## Phase 197: Native Evidence Summary Gate")
    expect(roadmap).toContain("Current next step after Phase 197:")
    expect(roadmap).toContain("WASM Evidence Summary Gate")
    expect(roadmap).toContain("Historical Phase 196 Handoff")
  })
})
