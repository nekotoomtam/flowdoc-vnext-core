import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan,
  type FlowDocTextEngineRuntimeIdentityDigestRootSummary,
  type FlowDocTextEngineRuntimeIdentityManifest,
} from "../packages/text-engine-rust-wasm/src/index.js"

type BuilderFixture = {
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityPointer: string | null
  wasmArtifactPointer: string | null
  expectedMeasurementProfileId: string
  expectedOutputShapeVersion: "glyph-line-box-v1"
  rawEvidenceIncluded: boolean
}

type RetentionPointer = {
  owner: "@flowdoc/text-engine-rust-wasm"
  pointer: string | null
  includedInRoot: false
}

type PopulationSummary = {
  populationSummaryId: string
  sourceBuilderId: string
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string
  wasmArtifactPointer: string | null
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
  digestStatus: "pending" | "pinned" | "missing" | "stale"
  sha256: string | null
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
  pinningRequirements: string[]
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

function cloneRuntimeIdentity(): FlowDocTextEngineRuntimeIdentityManifest {
  return JSON.parse(JSON.stringify(runtimeIdentityManifest)) as FlowDocTextEngineRuntimeIdentityManifest
}

function createPlan(input?: {
  manifest?: FlowDocTextEngineRuntimeIdentityManifest
  expectedMeasurementProfileId?: string
  wasmArtifactPointer?: string | null
}) {
  return createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan({
    matrixId: builderFixture.matrixId,
    corpusId: builderFixture.corpusId,
    policyRevision: builderFixture.policyRevision,
    expectedMeasurementProfileId: input?.expectedMeasurementProfileId ?? builderFixture.expectedMeasurementProfileId,
    expectedOutputShapeVersion: builderFixture.expectedOutputShapeVersion,
    runtimeIdentityManifest: input?.manifest ?? cloneRuntimeIdentity(),
    runtimeIdentityPointer: builderFixture.runtimeIdentityPointer,
    wasmArtifactPointer: input?.wasmArtifactPointer ?? builderFixture.wasmArtifactPointer,
    rawEvidenceIncluded: builderFixture.rawEvidenceIncluded,
  })
}

const builderFixture = readJson<BuilderFixture>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json",
)

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

const populationSummary = readJson<PopulationSummary>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json",
)

describe("text engine runtime identity digest evidence population gate", () => {
  it("records the package-local digest as pinned after the artifact exists", () => {
    expect(populationSummary.populationSummaryId).toBe(
      "text-engine-runtime-identity-digest-evidence-population-v1",
    )
    expect(populationSummary.decision).toBe("pinned-after-artifact-digest-pinning-execution")
    expect(populationSummary.canPinDigestNow).toBe(true)
    expect(populationSummary.digestStatus).toBe("pinned")
    expect(populationSummary.sha256).toMatch(/^[a-f0-9]{64}$/u)
    expect(populationSummary.artifactDiscovery.artifactKind).toBe("wasm")
    expect(populationSummary.artifactDiscovery.artifactFound).toBe(true)
    expect(populationSummary.artifactDiscovery.artifactPointer).toBe(
      "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    )
    expect(populationSummary.artifactDiscovery.fileSizeBytes).toBe(13782)
    expect(populationSummary.artifactDiscovery.sha256).toBe(populationSummary.sha256)
    expect(populationSummary.reasons).toEqual([
      "accepted-package-local-wasm-artifact-present",
      "runtime-identity-manifest-wasm-digest-pinned",
      "runtime-identity-manifest-sha256-lowercase-64-hex",
      "native-wasm-parity-not-run",
      "phase-196-does-not-execute-wasm-or-text-engine",
    ])
    expect(runtimeIdentityManifest.runtime.wasmArtifact).toEqual({
      digestStatus: "pinned",
      sha256: populationSummary.sha256,
    })
    expect(runtimeIdentityManifest.parityStatus).toBe("identity-only")
    expect(runtimeIdentityManifest.parityComparison.status).toBe("not-run")

    for (const candidatePath of populationSummary.artifactDiscovery.candidatePathsChecked) {
      expect(candidatePath.startsWith("packages/text-engine-rust-wasm/")).toBe(true)
    }
  })

  it("matches the Phase 188 builder JSON-safe root summary handoff", () => {
    const plan = createPlan()

    expect(plan.status).toBe("ready")
    expect(plan.digestStatus).toBe("pinned")
    expect(plan.warningIssues).toEqual([])
    expect(plan.rootSummary).toEqual(populationSummary.rootSummary)
    expect(populationSummary.rootSummary.rawEvidenceIncluded).toBe(false)
    expect(populationSummary.rootSummary.retention.rawRuntimeIdentityEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
      includedInRoot: false,
    } satisfies RetentionPointer)
    expect(populationSummary.rootSummary.retention.wasmArtifactEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
      includedInRoot: false,
    } satisfies RetentionPointer)
  })

  it("cannot be mistaken for production-ready digest evidence", () => {
    expect(populationSummary.rawEvidenceIncluded).toBe(false)
    expect(populationSummary.productionReady).toBe(false)
    expect(populationSummary.defaultMeasurerReplacement).toBe(false)
    expect(populationSummary.nativeEvidenceStatus).toBe("blocked")
    expect(populationSummary.wasmEvidenceStatus).toBe("blocked")
    expect(populationSummary.nativeWasmParityStatus).toBe("not-run")
    expect(populationSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(populationSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(populationSummary.acceptedManifestStatus).toBe("blocked")
    expect(populationSummary.rootSummary.blockedUntilLater).toEqual({
      nativeEvidence: true,
      wasmEvidence: true,
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
    })

    const serialized = JSON.stringify(populationSummary)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")
  })

  it("only allows pinned digest status when sha256 is valid and context matches", () => {
    const pinnedManifest = cloneRuntimeIdentity()
    pinnedManifest.runtime.wasmArtifact = {
      digestStatus: "pinned",
      sha256: "a".repeat(64),
    }

    const pinnedPlan = createPlan({
      manifest: pinnedManifest,
      wasmArtifactPointer: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    })

    expect(pinnedPlan.status).toBe("ready")
    expect(pinnedPlan.digestStatus).toBe("pinned")
    expect(pinnedPlan.rootSummary.wasmArtifact.sha256).toBe("a".repeat(64))
    expect(pinnedPlan.blockingIssues).toEqual([])

    const invalidManifest = cloneRuntimeIdentity()
    invalidManifest.runtime.wasmArtifact = {
      digestStatus: "pinned",
      sha256: "not-a-valid-sha",
    }

    const invalidPlan = createPlan({ manifest: invalidManifest })
    expect(invalidPlan.status).toBe("blocked")
    expect(invalidPlan.digestStatus).toBe("missing")
    expect(invalidPlan.blockingIssues.map((issue) => issue.code)).toContain("digest-missing")

    const stalePlan = createPlan({
      expectedMeasurementProfileId: "measurement-profile-v1:wrong-context",
    })
    expect(stalePlan.status).toBe("blocked")
    expect(stalePlan.digestStatus).toBe("stale")
    expect(stalePlan.blockingIssues.map((issue) => issue.code)).toContain("digest-stale")
  })

  it("documents the Phase 189 retained-pending decision and required audit sections", () => {
    const doc = readText("../docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md")

    expect(doc).toContain("Status: Phase 189 text engine runtime identity digest evidence population gate.")
    expect(doc).toContain("Decision: `retained-pending`.")
    expect(doc).toContain("no `.wasm` artifact is present")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json")
    expect(doc).toContain("## Production-Ready Guard")
    expect(doc).toContain("Proceed to Phase 190: Text Engine WASM Artifact Digest Pinning Gate.")
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
    const doc = readText("../docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(doc).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(doc).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurement binding.")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("runtime-identity-digest-evidence-population")
    expect(coreMeasurement).not.toContain("runtime-identity-digest-evidence-population")
  })

  it("keeps Phase 189 evidence while current pointers advance to Phase 196", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(currentStatus).toContain("Status: updated after Native Evidence Summary Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Native Evidence Summary Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(readme).toContain("Text engine runtime identity digest evidence population gate")
    expect(readme).toContain("docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md")
    expect(ledger).toContain("| 189 | Text engine runtime identity digest evidence population gate | done |")
    expect(ledger).toContain(
      "## Phase 189 Text Engine Runtime Identity Digest Evidence Population Gate",
    )
    expect(roadmap).toContain(
      "## Phase 189: Text Engine Runtime Identity Digest Evidence Population Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 189 Handoff")
  })
})
