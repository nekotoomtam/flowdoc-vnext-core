import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_MODE,
  FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_SOURCE,
  createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan,
  type FlowDocTextEngineRuntimeIdentityManifest,
} from "../packages/text-engine-rust-wasm/src/index.js"

type BuilderFixture = {
  builderId: string
  builderOwner: string
  rootSummaryOwner: string
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityManifestId: string
  runtimeIdentityPointer: string | null
  wasmArtifactPointer: string | null
  expectedMeasurementProfileId: string
  expectedOutputShapeVersion: "glyph-line-box-v1"
  rawEvidenceIncluded: boolean
  blockedUntilLater: string[]
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
  expectedOutputShapeVersion?: "glyph-line-box-v1"
  runtimeIdentityPointer?: string | null
  wasmArtifactPointer?: string | null
  rawEvidenceIncluded?: boolean
}) {
  return createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan({
    matrixId: builderFixture.matrixId,
    corpusId: builderFixture.corpusId,
    policyRevision: builderFixture.policyRevision,
    expectedMeasurementProfileId: input?.expectedMeasurementProfileId ?? builderFixture.expectedMeasurementProfileId,
    expectedOutputShapeVersion: input?.expectedOutputShapeVersion ?? builderFixture.expectedOutputShapeVersion,
    runtimeIdentityManifest: input?.manifest ?? cloneRuntimeIdentity(),
    runtimeIdentityPointer: input?.runtimeIdentityPointer ?? builderFixture.runtimeIdentityPointer,
    wasmArtifactPointer: input?.wasmArtifactPointer ?? builderFixture.wasmArtifactPointer,
    rawEvidenceIncluded: input?.rawEvidenceIncluded ?? builderFixture.rawEvidenceIncluded,
  })
}

const runtimeIdentityManifest = readJson<FlowDocTextEngineRuntimeIdentityManifest>(
  "../packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
)

const builderFixture = readJson<BuilderFixture>(
  "../packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json",
)

describe("text engine runtime identity digest evidence builder gate", () => {
  it("creates a JSON-safe pinned root summary from the package-local runtime identity manifest", () => {
    const plan = createPlan()

    expect(plan.source).toBe(FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_SOURCE)
    expect(plan.mode).toBe(FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_MODE)
    expect(plan.status).toBe("ready")
    expect(plan.digestStatus).toBe("pinned")
    expect(plan.blockingIssues).toEqual([])
    expect(plan.warningIssues).toEqual([])
    expect(plan.rootSummary).toMatchObject({
      summaryId: "text-engine-runtime-identity-digest-root-summary-v1",
      matrixId: builderFixture.matrixId,
      corpusId: builderFixture.corpusId,
      policyRevision: builderFixture.policyRevision,
      runtimeIdentityPolicyRevision: runtimeIdentityManifest.policyRevision,
      measurementProfileId: runtimeIdentityManifest.measurementProfileId,
      outputShapeVersion: "glyph-line-box-v1",
      runtimeIdentityManifestId: builderFixture.runtimeIdentityManifestId,
      adapterPackageName: "@flowdoc/text-engine-rust-wasm",
      digestStatus: "pinned",
      rawEvidenceIncluded: false,
      evidenceOwner: "@flowdoc/text-engine-rust-wasm",
      rootSummaryOwner: "@flowdoc/vnext-core-docs",
    })
    expect(plan.rootSummary.runtime).toEqual({
      rustybuzzRevision: runtimeIdentityManifest.runtime.rustybuzzRevision,
      icu4xRevision: runtimeIdentityManifest.runtime.icu4xRevision,
      icu4xDataRevision: runtimeIdentityManifest.runtime.icu4xDataRevision,
    })
    expect(plan.rootSummary.wasmArtifact).toEqual(runtimeIdentityManifest.runtime.wasmArtifact)
    expect(plan.rootSummary.fontAssetHashes).toEqual(runtimeIdentityManifest.fontAssets)
    expect(plan.rootSummary.fontAssetHashes).not.toBe(runtimeIdentityManifest.fontAssets)
    expect(plan.rootSummary.retention).toEqual({
      rawRuntimeIdentityEvidence: {
        owner: "@flowdoc/text-engine-rust-wasm",
        pointer: builderFixture.runtimeIdentityPointer,
        includedInRoot: false,
      },
      wasmArtifactEvidence: {
        owner: "@flowdoc/text-engine-rust-wasm",
        pointer: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
        includedInRoot: false,
      },
    })
    expect(plan.rootSummary.blockedUntilLater).toEqual({
      nativeEvidence: true,
      wasmEvidence: true,
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
    })
    expect(plan.executionContract).toEqual({
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
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("defines pinned, missing, stale, and raw-evidence blocking policy", () => {
    const pinnedManifest = cloneRuntimeIdentity()
    pinnedManifest.runtime.wasmArtifact = {
      digestStatus: "pinned",
      sha256: "a".repeat(64),
    }

    const pinned = createPlan({
      manifest: pinnedManifest,
      wasmArtifactPointer: "packages/text-engine-rust-wasm/dist/flowdoc_text_engine_bg.wasm",
    })
    expect(pinned.status).toBe("ready")
    expect(pinned.digestStatus).toBe("pinned")
    expect(pinned.rootSummary.wasmArtifact.sha256).toBe("a".repeat(64))
    expect(pinned.warningIssues).toEqual([])
    expect(pinned.blockingIssues).toEqual([])

    const missingManifest = cloneRuntimeIdentity()
    missingManifest.runtime.wasmArtifact = {
      digestStatus: "pinned",
      sha256: null,
    }

    const missing = createPlan({ manifest: missingManifest })
    expect(missing.status).toBe("blocked")
    expect(missing.digestStatus).toBe("missing")
    expect(missing.blockingIssues.map((issue) => issue.code)).toContain("digest-missing")

    const stale = createPlan({
      expectedMeasurementProfileId: "measurement-profile-v1:stale-profile",
    })
    expect(stale.status).toBe("blocked")
    expect(stale.digestStatus).toBe("stale")
    expect(stale.warningIssues.map((issue) => issue.code)).toContain("measurement-profile-mismatch")
    expect(stale.blockingIssues.map((issue) => issue.code)).toContain("digest-stale")

    const rawEvidence = createPlan({ rawEvidenceIncluded: true })
    expect(rawEvidence.status).toBe("blocked")
    expect(rawEvidence.blockingIssues.map((issue) => issue.code)).toContain("raw-evidence-in-root")
    expect(rawEvidence.rootSummary.rawEvidenceIncluded).toBe(false)
  })

  it("keeps the builder fixture package-local and explicitly blocks downstream evidence lanes", () => {
    expect(builderFixture.builderId).toBe("text-engine-runtime-identity-digest-evidence-builder-v1")
    expect(builderFixture.builderOwner).toBe("@flowdoc/text-engine-rust-wasm")
    expect(builderFixture.rootSummaryOwner).toBe("@flowdoc/vnext-core-docs")
    expect(builderFixture.rawEvidenceIncluded).toBe(false)
    expect(builderFixture.runtimeIdentityPointer).toBe(
      "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
    )
    expect(builderFixture.wasmArtifactPointer).toBe(
      "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    )
    expect(builderFixture.blockedUntilLater).toEqual([
      "native-evidence",
      "wasm-evidence",
      "native-wasm-parity-summary",
      "renderer-backed-drift-summary",
      "numeric-drift-thresholds",
      "accepted-summary-manifest",
    ])
  })

  it("documents the Phase 188 gate, status policies, and required audit sections", () => {
    const doc = readText("../docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md")

    expect(doc).toContain("Status: Phase 188 text engine runtime identity digest evidence builder gate.")
    expect(doc).toContain("packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts")
    expect(doc).toContain("packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json")
    expect(doc).toContain("## Digest Status Policy")
    expect(doc).toContain("`pinned`: runtime identity matches")
    expect(doc).toContain("`pending`: runtime identity is present")
    expect(doc).toContain("`missing`: a pinned digest claim")
    expect(doc).toContain("`stale`: runtime identity, measurement profile, output shape")
    expect(doc).toContain("## Retention Pointer Policy")
    expect(doc).toContain("## Downstream Blockers")
    expect(doc).toContain("Proceed to Phase 189: Text Engine Runtime Identity Digest Evidence Population")
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

  it("does not execute external engines in core, bind production measurement, or change core exports", () => {
    const builderSource = readText(
      "../packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts",
    )
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(builderSource).not.toContain("node:fs")
    expect(builderSource).not.toContain("WebAssembly")
    expect(builderSource).not.toContain("measureVNextText(")
    expect(builderSource).not.toContain("paginateVNextDocument")
    expect(builderSource).not.toContain("from \"@flowdoc/vnext-core\"")
    expect(coreIndex).not.toContain("runtimeIdentityDigestEvidenceBuilder")
    expect(coreIndex).not.toContain("@flowdoc/text-engine-rust-wasm")
    expect(coreMeasurement).not.toContain("runtimeIdentityDigestEvidenceBuilder")
  })

  it("keeps Phase 188 evidence while current pointers advance to Phase 196", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(currentStatus).toContain("Status: updated after Render-Readiness Validation Policy Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
    expect(readme).toContain("Text engine runtime identity digest evidence builder gate")
    expect(readme).toContain("docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md")
    expect(ledger).toContain("| 188 | Text engine runtime identity digest evidence builder gate | done |")
    expect(ledger).toContain(
      "## Phase 188 Text Engine Runtime Identity Digest Evidence Builder Gate",
    )
    expect(roadmap).toContain(
      "## Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 189 Handoff")
  })
})
