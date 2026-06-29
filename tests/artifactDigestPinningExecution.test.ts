import { existsSync, readFileSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan,
  createFlowDocTextEngineRuntimeIdentityPlan,
  type FlowDocTextEngineRuntimeIdentityDigestRootSummary,
  type FlowDocTextEngineRuntimeIdentityManifest,
} from "../packages/text-engine-rust-wasm/src/index.js"

const ACCEPTED_ARTIFACT_PATH = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const PINNED_SHA256 = "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44"

type CandidatePathCheck = {
  path: string
  packageLocal: boolean
  exists: boolean
  selectedForFutureBuild: boolean
  selectedForPinning: boolean
}

type BuilderFixture = {
  builderId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string | null
  wasmArtifactPointer: string | null
  expectedMeasurementProfileId: string
  expectedOutputShapeVersion: "glyph-line-box-v1"
  rawEvidenceIncluded: boolean
}

type PopulationSummary = {
  populationSummaryId: string
  sourceBuilderId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string
  wasmArtifactPointer: string
  artifactDiscovery: {
    artifactKind: "wasm"
    candidatePathsChecked: string[]
    artifactFound: boolean
    artifactPointer: string
    fileSizeBytes: number
    sha256: string
  }
  decision: "pinned-after-artifact-digest-pinning-execution"
  canPinDigestNow: boolean
  digestStatus: "pinned"
  sha256: string
  rawEvidenceIncluded: boolean
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  nativeEvidenceStatus: "blocked"
  wasmEvidenceStatus: "blocked"
  nativeWasmParityStatus: "not-run"
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  reasons: string[]
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

type PinningExecutionSummary = {
  pinningSummaryId: string
  sourcePopulationSummaryId: string
  sourceProductionRetrySummaryId: string
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  acceptedArtifactPath: string
  acceptedArtifactPathStatus: "present-package-local"
  candidatePathsChecked: CandidatePathCheck[]
  artifactFound: boolean
  artifactFileSizeBytes: number
  canPinDigestNow: boolean
  pinningDecision: "pinned-real-artifact-context-matched"
  digestStatus: "pinned"
  sha256: string
  sha256ComputedFromRealArtifact: boolean
  wasmArtifactPointer: string
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
  pinningRequirementsSatisfied: string[]
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

type ProductionRetrySummary = {
  productionRetrySummaryId: string
  acceptedArtifactPath: string
  artifact: {
    artifactProduced: boolean
    artifactExists: boolean
    artifactPointer: string
    fileSizeBytes: number
    rawArtifactBytesIncludedInSummary: boolean
  }
  digestPolicy: {
    digestStatus: "pending"
    sha256: string | null
    sha256ComputedThisPhase: boolean
  }
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

function repoPath(path: string): URL {
  return new URL(`../${path}`, import.meta.url)
}

function isPackageLocal(path: string): boolean {
  return path.startsWith("packages/text-engine-rust-wasm/")
}

function isLowercaseSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function createDigestPlan() {
  return createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan({
    matrixId: builderFixture.matrixId,
    corpusId: builderFixture.corpusId,
    policyRevision: builderFixture.policyRevision,
    expectedMeasurementProfileId: builderFixture.expectedMeasurementProfileId,
    expectedOutputShapeVersion: builderFixture.expectedOutputShapeVersion,
    runtimeIdentityManifest,
    runtimeIdentityPointer: builderFixture.runtimeIdentityPointer,
    wasmArtifactPointer: builderFixture.wasmArtifactPointer,
    rawEvidenceIncluded: builderFixture.rawEvidenceIncluded,
  })
}

const pinningSummary = readJson<PinningExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

const productionRetrySummary = readJson<ProductionRetrySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json",
)

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

const builderFixture = readJson<BuilderFixture>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json",
)

const populationSummary = readJson<PopulationSummary>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json",
)

describe("artifact digest pinning execution", () => {
  it("pins only the accepted package-local artifact after the retry produced it", () => {
    const artifactStat = statSync(repoPath(ACCEPTED_ARTIFACT_PATH))

    expect(productionRetrySummary.productionRetrySummaryId).toBe(
      pinningSummary.sourceProductionRetrySummaryId,
    )
    expect(productionRetrySummary.acceptedArtifactPath).toBe(ACCEPTED_ARTIFACT_PATH)
    expect(productionRetrySummary.artifact.artifactProduced).toBe(true)
    expect(productionRetrySummary.artifact.artifactExists).toBe(true)
    expect(productionRetrySummary.artifact.rawArtifactBytesIncludedInSummary).toBe(false)
    expect(productionRetrySummary.digestPolicy).toEqual({
      digestPinningBlocked: false,
      digestStatus: "pending",
      sha256: null,
      sha256ComputedThisPhase: false,
      pinningStatus: "ready-for-artifact-digest-pinning-execution",
      fakeSha256Allowed: false,
    })

    expect(existsSync(repoPath(ACCEPTED_ARTIFACT_PATH))).toBe(true)
    expect(artifactStat.size).toBe(13782)
    expect(pinningSummary.acceptedArtifactPath).toBe(ACCEPTED_ARTIFACT_PATH)
    expect(pinningSummary.acceptedArtifactPathStatus).toBe("present-package-local")
    expect(pinningSummary.artifactFound).toBe(true)
    expect(pinningSummary.artifactFileSizeBytes).toBe(artifactStat.size)
    expect(pinningSummary.canPinDigestNow).toBe(true)
    expect(pinningSummary.pinningDecision).toBe("pinned-real-artifact-context-matched")
    expect(pinningSummary.wasmArtifactPointer).toBe(ACCEPTED_ARTIFACT_PATH)
  })

  it("records a lowercase sha256 only when the runtime identity context matches", () => {
    expect(pinningSummary.sha256).toBe(PINNED_SHA256)
    expect(isLowercaseSha256(pinningSummary.sha256)).toBe(true)
    expect(pinningSummary.sha256ComputedFromRealArtifact).toBe(true)
    expect(pinningSummary.digestStatus).toBe("pinned")
    expect(pinningSummary.runtimeIdentityContextMatches).toBe(true)
    expect(pinningSummary.matrixId).toBe("v1-measurement-fixture-evidence-matrix-v1")
    expect(pinningSummary.corpusId).toBe("v1-measurement-evidence-corpus-v1")
    expect(pinningSummary.policyRevision).toBe("v1-measurement-evidence-policy-v1")
    expect(pinningSummary.outputShapeVersion).toBe("glyph-line-box-v1")
    expect(pinningSummary.measurementProfileId).toBe(runtimeIdentityManifest.measurementProfileId)
    expect(pinningSummary.outputShapeVersion).toBe(runtimeIdentityManifest.outputShapeVersion)
    expect(pinningSummary.pinningRequirementsSatisfied).toEqual([
      "accepted-artifact-path-exists",
      "artifact-path-package-local",
      "lowercase-64-character-sha256",
      "runtime-identity-context-matches",
      "raw-evidence-remains-outside-root-tests-docs",
    ])
  })

  it("updates package-local runtime identity, builder, and population summaries", () => {
    const selectedCandidate = pinningSummary.candidatePathsChecked.find(
      (candidate) => candidate.path === ACCEPTED_ARTIFACT_PATH,
    )

    expect(selectedCandidate).toEqual({
      path: ACCEPTED_ARTIFACT_PATH,
      packageLocal: true,
      exists: true,
      selectedForFutureBuild: true,
      selectedForPinning: true,
    })
    for (const candidate of pinningSummary.candidatePathsChecked) {
      expect(candidate.packageLocal).toBe(true)
      expect(isPackageLocal(candidate.path)).toBe(true)
    }

    expect(runtimeIdentityManifest.runtime.wasmArtifact).toEqual({
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
    })
    expect(runtimeIdentityManifest.parityStatus).toBe("identity-only")
    expect(runtimeIdentityManifest.parityComparison.status).toBe("not-run")
    expect(runtimeIdentityManifest.warnings).toEqual(["native-wasm-comparison-not-run"])
    expect(builderFixture.wasmArtifactPointer).toBe(ACCEPTED_ARTIFACT_PATH)
    expect(populationSummary.sourceBuilderId).toBe(builderFixture.builderId)
    expect(populationSummary.wasmArtifactPointer).toBe(ACCEPTED_ARTIFACT_PATH)
    expect(populationSummary.artifactDiscovery).toMatchObject({
      artifactKind: "wasm",
      artifactFound: true,
      artifactPointer: ACCEPTED_ARTIFACT_PATH,
      fileSizeBytes: 13782,
      sha256: PINNED_SHA256,
    })
    expect(populationSummary.decision).toBe("pinned-after-artifact-digest-pinning-execution")
    expect(populationSummary.digestStatus).toBe("pinned")
    expect(populationSummary.sha256).toBe(PINNED_SHA256)
  })

  it("keeps root summaries JSON-safe and downstream lanes blocked", () => {
    expect(pinningSummary.rootSummary).toEqual(populationSummary.rootSummary)
    expect(pinningSummary.rootSummary.digestStatus).toBe("pinned")
    expect(pinningSummary.rootSummary.wasmArtifact).toEqual({
      digestStatus: "pinned",
      sha256: PINNED_SHA256,
    })
    expect(pinningSummary.rootSummary.retention.rawRuntimeIdentityEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
      includedInRoot: false,
    })
    expect(pinningSummary.rootSummary.retention.wasmArtifactEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: ACCEPTED_ARTIFACT_PATH,
      includedInRoot: false,
    })
    expect(pinningSummary.rawEvidenceIncluded).toBe(false)
    expect(pinningSummary.productionReady).toBe(false)
    expect(pinningSummary.defaultMeasurerReplacement).toBe(false)
    expect(pinningSummary.nativeEvidenceStatus).toBe("blocked")
    expect(pinningSummary.wasmEvidenceStatus).toBe("blocked")
    expect(pinningSummary.nativeWasmParityStatus).toBe("not-run")
    expect(pinningSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(pinningSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(pinningSummary.acceptedManifestStatus).toBe("blocked")
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

  it("lets the package-local digest builder report pinned without parity-ready claims", () => {
    const digestPlan = createDigestPlan()
    const identityPlan = createFlowDocTextEngineRuntimeIdentityPlan({
      manifest: runtimeIdentityManifest,
    })

    expect(digestPlan.status).toBe("ready")
    expect(digestPlan.digestStatus).toBe("pinned")
    expect(digestPlan.blockingIssues).toEqual([])
    expect(digestPlan.warningIssues).toEqual([])
    expect(digestPlan.rootSummary).toEqual(pinningSummary.rootSummary)
    expect(digestPlan.executionContract).toEqual({
      importsWasm: false,
      loadsWasm: false,
      executesRustybuzz: false,
      executesIcu4x: false,
      executesNativeShaping: false,
      comparesRuntimeOutput: false,
      bindsProductionMeasurement: false,
      mutatesPagination: false,
      writesArtifacts: false,
    })
    expect(identityPlan.status).toBe("identity-ready")
    expect(identityPlan.parityStatus).toBe("identity-only")
    expect(identityPlan.warningIssues).toEqual([])
    expect(identityPlan.executionContract.loadsWasm).toBe(false)
    expect(identityPlan.executionContract.bindsProductionMeasurement).toBe(false)
  })

  it("keeps root checks independent and core measurement unchanged", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("artifact-digest-pinning")
    expect(coreMeasurement).not.toContain("artifact-digest-pinning")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 196 and advances pointers to native evidence", () => {
    const doc = readText("../docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Artifact Digest Pinning Execution complete.")
    expect(doc).toContain(PINNED_SHA256)
    expect(doc).toContain("Native Evidence Summary Gate.")
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

    expect(currentStatus).toContain("Status: updated after Artifact Digest Pinning Execution.")
    expect(currentStatus).toContain("Artifact Digest Pinning Execution.")
    expect(currentStatus).toContain(PINNED_SHA256)
    expect(currentStatus).toContain("Native Evidence Summary Gate.")
    expect(nextPointer).toContain("Status: current after Artifact Digest Pinning Execution.")
    expect(nextPointer).toContain("Native Evidence Summary Gate.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(readme).toContain("Artifact digest pinning execution")
    expect(readme).toContain("docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md")
    expect(packageReadme).toContain("Status: WASM artifact digest pinned package.")
    expect(ledger).toContain("| 196 | Artifact digest pinning execution | done |")
    expect(ledger).toContain("## Phase 196 Artifact Digest Pinning Execution")
    expect(roadmap).toContain("## Phase 196: Artifact Digest Pinning Execution")
    expect(roadmap).toContain("Current next step after Phase 196:")
    expect(roadmap).toContain("Native Evidence Summary Gate")
    expect(roadmap).toContain("Historical Phase 195G Handoff")
  })
})
