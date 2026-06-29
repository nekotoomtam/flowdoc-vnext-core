import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocTextEngineRuntimeIdentityDigestRootSummary } from "../packages/text-engine-rust-wasm/src/index.js"

type CandidatePathCheck = {
  path: string
  packageLocal: boolean
  exists: boolean
  selectedForFutureBuild: boolean
}

type PinningSummary = {
  pinningSummaryId: string
  sourcePopulationSummaryId: string
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  acceptedArtifactPath: string
  acceptedArtifactPathStatus: "defined-not-present"
  candidatePathsChecked: CandidatePathCheck[]
  artifactFound: boolean
  canPinDigestNow: boolean
  pinningDecision: "pending-no-artifact"
  digestStatus: "pending" | "pinned" | "missing" | "stale"
  sha256: string | null
  wasmArtifactPointer: string | null
  runtimeIdentityContextMatches: boolean
  rawEvidenceIncluded: boolean
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  nativeEvidenceStatus: "blocked"
  wasmEvidenceStatus: "blocked"
  nativeWasmParityStatus: "not-run"
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  pinningRequirementsBeforePinned: string[]
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

type PopulationSummary = {
  artifactDiscovery: {
    candidatePathsChecked: string[]
  }
  digestStatus: string
  sha256: string | null
  wasmArtifactPointer: string | null
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

function repoPathExists(path: string): boolean {
  return existsSync(new URL(`../${path}`, import.meta.url))
}

function isPackageLocal(path: string): boolean {
  return path.startsWith("packages/text-engine-rust-wasm/")
}

function isLowercaseSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

const populationSummary = readJson<PopulationSummary>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json",
)

describe("text engine WASM artifact digest pinning gate", () => {
  it("checks every Phase 189 candidate path and keeps digest pending when no artifact exists", () => {
    expect(pinningSummary.pinningSummaryId).toBe("text-engine-wasm-artifact-digest-pinning-v1")
    expect(pinningSummary.sourcePopulationSummaryId).toBe(
      "text-engine-runtime-identity-digest-evidence-population-v1",
    )
    expect(pinningSummary.candidatePathsChecked.map((candidate) => candidate.path)).toEqual(
      populationSummary.artifactDiscovery.candidatePathsChecked,
    )

    for (const candidate of pinningSummary.candidatePathsChecked) {
      expect(candidate.packageLocal).toBe(true)
      expect(isPackageLocal(candidate.path)).toBe(true)
      expect(candidate.exists).toBe(false)
      expect(repoPathExists(candidate.path)).toBe(false)
    }

    expect(pinningSummary.artifactFound).toBe(false)
    expect(pinningSummary.canPinDigestNow).toBe(false)
    expect(pinningSummary.pinningDecision).toBe("pending-no-artifact")
    expect(pinningSummary.digestStatus).toBe("pending")
    expect(pinningSummary.sha256).toBeNull()
    expect(pinningSummary.wasmArtifactPointer).toBeNull()
    expect(populationSummary.digestStatus).toBe("pending")
    expect(populationSummary.sha256).toBeNull()
    expect(populationSummary.wasmArtifactPointer).toBeNull()
  })

  it("defines the accepted package-local future output path without retaining a fake artifact pointer", () => {
    expect(pinningSummary.acceptedArtifactPath).toBe(
      "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    )
    expect(pinningSummary.acceptedArtifactPathStatus).toBe("defined-not-present")
    expect(isPackageLocal(pinningSummary.acceptedArtifactPath)).toBe(true)
    expect(repoPathExists(pinningSummary.acceptedArtifactPath)).toBe(false)
    expect(
      pinningSummary.candidatePathsChecked.find((candidate) => candidate.path === pinningSummary.acceptedArtifactPath),
    ).toMatchObject({
      packageLocal: true,
      exists: false,
      selectedForFutureBuild: true,
    })
    expect(pinningSummary.rootSummary.retention.wasmArtifactEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: null,
      includedInRoot: false,
    })
  })

  it("keeps context aligned while preventing pinned status without a valid sha256", () => {
    expect(pinningSummary.runtimeIdentityContextMatches).toBe(true)
    expect(pinningSummary.matrixId).toBe("v1-measurement-fixture-evidence-matrix-v1")
    expect(pinningSummary.corpusId).toBe("v1-measurement-evidence-corpus-v1")
    expect(pinningSummary.policyRevision).toBe("v1-measurement-evidence-policy-v1")
    expect(pinningSummary.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(pinningSummary.rootSummary.matrixId).toBe(pinningSummary.matrixId)
    expect(pinningSummary.rootSummary.corpusId).toBe(pinningSummary.corpusId)
    expect(pinningSummary.rootSummary.policyRevision).toBe(pinningSummary.policyRevision)
    expect(pinningSummary.rootSummary.measurementProfileId).toBe(pinningSummary.measurementProfileId)
    expect(pinningSummary.rootSummary.outputShapeVersion).toBe(pinningSummary.outputShapeVersion)
    expect(pinningSummary.rootSummary.digestStatus).toBe("pending")
    expect(pinningSummary.rootSummary.wasmArtifact.sha256).toBeNull()
    expect(isLowercaseSha256(pinningSummary.sha256 ?? "")).toBe(false)
    expect(pinningSummary.pinningRequirementsBeforePinned).toEqual([
      "accepted-artifact-path-exists",
      "artifact-path-package-local",
      "lowercase-64-character-sha256",
      "runtime-identity-context-matches",
      "raw-evidence-remains-outside-root-tests-docs",
    ])
  })

  it("keeps root summary JSON-safe and downstream lanes blocked", () => {
    expect(pinningSummary.rawEvidenceIncluded).toBe(false)
    expect(pinningSummary.productionReady).toBe(false)
    expect(pinningSummary.defaultMeasurerReplacement).toBe(false)
    expect(pinningSummary.nativeEvidenceStatus).toBe("blocked")
    expect(pinningSummary.wasmEvidenceStatus).toBe("blocked")
    expect(pinningSummary.nativeWasmParityStatus).toBe("not-run")
    expect(pinningSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(pinningSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(pinningSummary.acceptedManifestStatus).toBe("blocked")
    expect(pinningSummary.rootSummary.rawEvidenceIncluded).toBe(false)
    expect(pinningSummary.rootSummary.blockedUntilLater).toEqual({
      nativeEvidence: true,
      wasmEvidence: true,
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
    })

    const serialized = JSON.stringify(pinningSummary)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")
  })

  it("documents the Phase 190 pinning decision and required audit sections", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md")

    expect(doc).toContain("Status: Phase 190 text engine WASM artifact digest pinning gate.")
    expect(doc).toContain("No candidate artifact exists, so the digest cannot be pinned.")
    expect(doc).toContain("packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json")
    expect(doc).toContain("Proceed to Phase 191: Text Engine WASM Artifact Build Output Gate.")
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

  it("does not execute external engines in core or bind production measurement", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(doc).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(doc).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurement binding.")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-artifact-digest-pinning")
    expect(coreMeasurement).not.toContain("wasm-artifact-digest-pinning")
  })

  it("advances current pointers, README, roadmap, and ledger to Phase 192", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(currentStatus).toContain("Status: updated after Phase 191.")
    expect(currentStatus).toContain("Phase 191: Text Engine WASM Artifact Build Output Gate.")
    expect(currentStatus).toContain("Phase 192: Text Engine WASM Build Toolchain Readiness Gate.")
    expect(nextPointer).toContain("Status: current after Phase 191.")
    expect(nextPointer).toContain("Phase 192: Text Engine WASM Build Toolchain Readiness Gate.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(readme).toContain("Text engine WASM artifact digest pinning gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md")
    expect(ledger).toContain("| 190 | Text engine WASM artifact digest pinning gate | done |")
    expect(ledger).toContain("## Phase 190 Text Engine WASM Artifact Digest Pinning Gate")
    expect(roadmap).toContain("## Phase 190: Text Engine WASM Artifact Digest Pinning Gate")
    expect(roadmap).toContain("Current next step after Phase 191:")
    expect(roadmap).toContain("Historical Phase 189 Handoff")
  })
})
