import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type CompatibilitySummary = {
  compatibilitySummaryId: string
  sourceProvisioningExecutionSummaryId: string
  sourceProvisioningBootstrapSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  sourceFailure: {
    downloadedCandidateVersion: string
    dependency: string
    dependencyRequiresRustc: string
    currentRustc: string
    currentCargo: string
    wasmPackAvailable: boolean
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
  }
  strategyComparison: Array<{
    id: string
    rank: number
    status: string
    rootCheckDependency: boolean
    artifactRetryAllowedBeforeReadiness: boolean
  }>
  acceptedImmediateStrategy: {
    id: "upgrade-rust-toolchain-to-1.91-plus"
    minimumRustc: "1.91"
    executionGateRequired: boolean
    acceptedExecutionPath: "developer-or-ci-bootstrap"
    candidateCommands: string[]
    postExecutionRequiredCommands: string[]
    acceptanceCriteria: string[]
  }
  acceptedLongTermStrategy: {
    id: "pinned-ci-image"
    canonicalArtifactProducer: string
    requiredPinnedFacts: string[]
    rootCheckDependency: boolean
  }
  currentReadiness: {
    wasmPackAvailable: boolean
    wasmPackVersion: string | null
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    canRetryArtifactProduction: boolean
    artifactProductionBlocked: boolean
    digestPinningBlocked: boolean
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresCompatibilityStrategy: boolean
    requiresReadinessSmoke: boolean
    requiresArtifact: boolean
    requiresWasmBuild: boolean
  }
  artifactPolicy: {
    artifactProductionBlocked: boolean
    canRetryArtifactProduction: boolean
    artifactProduced: boolean
    artifactPointer: string | null
    fakeArtifactAllowed: boolean
  }
  digestPolicy: {
    digestPinningBlocked: boolean
    digestStatus: "pending"
    sha256: string | null
    fakeSha256Allowed: boolean
  }
  rawEvidenceIncluded: boolean
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  nativeEvidenceStatus: "blocked"
  wasmEvidenceStatus: "blocked"
  nativeWasmParityStatus: "not-run"
  rendererBackedDriftStatus: "unknown"
  numericDriftThresholdStatus: "blocked"
  acceptedManifestStatus: "blocked"
  blockers: string[]
  jsonSafeRootSummary: {
    provisioningExecutionSummaryPointer: string
    versionCompatibilitySummaryPointer: string
    wasmArtifactPointer: string | null
    artifactProduced: boolean
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedWork: string
  artifactProductionRetryRule: string
  phase196Rule: string
}

type ProvisioningExecutionSummary = {
  executionSummaryId: string
  sourceProvisioningBootstrapSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
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

const compatibilitySummary = readJson<CompatibilitySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json",
)

const executionSummary = readJson<ProvisioningExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json",
)

describe("text engine WASM toolchain version compatibility gate", () => {
  it("links compatibility decisions to the provisioning execution source of truth", () => {
    expect(compatibilitySummary.compatibilitySummaryId).toBe(
      "text-engine-wasm-toolchain-version-compatibility-v1",
    )
    expect(compatibilitySummary.sourceProvisioningExecutionSummaryId).toBe(
      executionSummary.executionSummaryId,
    )
    expect(compatibilitySummary.sourceProvisioningBootstrapSummaryId).toBe(
      executionSummary.sourceProvisioningBootstrapSummaryId,
    )
    expect(compatibilitySummary.sourceArtifactProductionSummaryId).toBe(
      executionSummary.sourceArtifactProductionSummaryId,
    )
    expect(compatibilitySummary.sourceDiagnosticSummaryId).toBe(
      executionSummary.sourceDiagnosticSummaryId,
    )
    expect(compatibilitySummary.acceptedArtifactPath).toBe(
      executionSummary.acceptedArtifactPath,
    )
    expect(compatibilitySummary.acceptedBuildPath).toBe(executionSummary.acceptedBuildPath)
  })

  it("records the observed rustc/wasm-pack compatibility failure", () => {
    expect(compatibilitySummary.sourceFailure).toEqual({
      failedCommand: "cargo install wasm-pack --locked",
      downloadedCandidateVersion: "wasm-pack v0.15.0",
      failureCategory: "rustc-version-too-old",
      dependency: "cargo-platform@0.3.3",
      dependencyRequiresRustc: "1.91",
      currentRustc: "rustc 1.88.0 (6b00bc388 2025-06-23)",
      currentCargo: "cargo 1.88.0 (873a06493 2025-05-10)",
      wasmPackAvailable: false,
      wasmPackVersion: null,
      wasm32UnknownUnknownInstalled: true,
      toolchainReady: false,
    })
  })

  it("compares all five requested compatibility strategies", () => {
    expect(compatibilitySummary.strategyComparison.map((strategy) => strategy.id)).toEqual([
      "upgrade-rust-toolchain-to-1.91-plus",
      "pinned-ci-image",
      "pin-older-compatible-wasm-pack",
      "internal-tool-cache",
      "preinstalled-developer-toolchain",
    ])
    expect(compatibilitySummary.strategyComparison.map((strategy) => strategy.rank)).toEqual([
      1, 2, 3, 4, 5,
    ])
    expect(
      compatibilitySummary.strategyComparison.every(
        (strategy) =>
          strategy.rootCheckDependency === false &&
          strategy.artifactRetryAllowedBeforeReadiness === false,
      ),
    ).toBe(true)
    expect(compatibilitySummary.strategyComparison[0]).toMatchObject({
      id: "upgrade-rust-toolchain-to-1.91-plus",
      status: "accepted-immediate",
    })
    expect(compatibilitySummary.strategyComparison[1]).toMatchObject({
      id: "pinned-ci-image",
      status: "accepted-long-term-reproducible",
    })
    expect(compatibilitySummary.strategyComparison[2]).toMatchObject({
      id: "pin-older-compatible-wasm-pack",
      status: "deferred-risk",
    })
  })

  it("selects Rust 1.91+ upgrade as immediate and pinned CI image as reproducible", () => {
    expect(compatibilitySummary.acceptedImmediateStrategy).toMatchObject({
      id: "upgrade-rust-toolchain-to-1.91-plus",
      minimumRustc: "1.91",
      executionGateRequired: true,
      acceptedExecutionPath: "developer-or-ci-bootstrap",
    })
    expect(compatibilitySummary.acceptedImmediateStrategy.candidateCommands).toEqual([
      "rustup update stable",
      "rustup toolchain install 1.91.0",
    ])
    expect(compatibilitySummary.acceptedImmediateStrategy.postExecutionRequiredCommands).toEqual([
      "rustc --version",
      "cargo --version",
      "cargo install wasm-pack --locked",
      "wasm-pack --version",
      "npm run wasm:readiness-smoke",
    ])
    expect(compatibilitySummary.acceptedImmediateStrategy.acceptanceCriteria).toContain(
      "npm run wasm:readiness-smoke reports toolchainReady=true",
    )
    expect(compatibilitySummary.acceptedLongTermStrategy).toMatchObject({
      id: "pinned-ci-image",
      canonicalArtifactProducer: "ci-pinned-image-after-toolchain-readiness",
      rootCheckDependency: false,
    })
    expect(compatibilitySummary.acceptedLongTermStrategy.requiredPinnedFacts).toContain(
      "image digest or immutable runner id",
    )
    expect(compatibilitySummary.nextRecommendedWork).toBe(
      "Text Engine WASM Toolchain Rust Upgrade Execution Gate",
    )
  })

  it("keeps readiness blocked and root checks independent from WASM tooling", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(compatibilitySummary.currentReadiness).toEqual({
      wasmPackAvailable: false,
      wasmPackVersion: null,
      wasm32UnknownUnknownInstalled: true,
      toolchainReady: false,
      canRetryArtifactProduction: false,
      artifactProductionBlocked: true,
      digestPinningBlocked: true,
    })
    expect(compatibilitySummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresCompatibilityStrategy: false,
      requiresReadinessSmoke: false,
      requiresArtifact: false,
      requiresWasmBuild: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
    expect(compatibilitySummary.artifactPolicy.artifactProduced).toBe(false)
  })

  it("blocks artifacts, digest pinning, production readiness, and evidence lanes", () => {
    expect(compatibilitySummary.artifactPolicy).toMatchObject({
      artifactProductionBlocked: true,
      canRetryArtifactProduction: false,
      artifactProduced: false,
      artifactPointer: null,
      fakeArtifactAllowed: false,
    })
    expect(compatibilitySummary.digestPolicy).toEqual({
      digestPinningBlocked: true,
      digestStatus: "pending",
      sha256: null,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
    expect(compatibilitySummary.rawEvidenceIncluded).toBe(false)
    expect(compatibilitySummary.productionReady).toBe(false)
    expect(compatibilitySummary.defaultMeasurerReplacement).toBe(false)
    expect(compatibilitySummary.nativeEvidenceStatus).toBe("blocked")
    expect(compatibilitySummary.wasmEvidenceStatus).toBe("blocked")
    expect(compatibilitySummary.nativeWasmParityStatus).toBe("not-run")
    expect(compatibilitySummary.rendererBackedDriftStatus).toBe("unknown")
    expect(compatibilitySummary.numericDriftThresholdStatus).toBe("blocked")
    expect(compatibilitySummary.acceptedManifestStatus).toBe("blocked")
    expect(compatibilitySummary.blockers).toEqual([
      "rust-toolchain-upgrade-execution-not-run",
      "wasm-pack-not-available",
      "wasm-pack-version-unpinned",
      "toolchainReady-false",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(compatibilitySummary.jsonSafeRootSummary).toMatchObject({
      provisioningExecutionSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json",
      versionCompatibilitySummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json",
      wasmArtifactPointer: null,
      artifactProduced: false,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
    expect(compatibilitySummary.artifactProductionRetryRule).toBe(
      "retry-only-after-wasm-pack-available-and-toolchainReady-true",
    )
    expect(compatibilitySummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-toolchain-version-compatibility")
    expect(coreMeasurement).not.toContain("wasm-toolchain-version-compatibility")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the compatibility gate and points next to Rust upgrade execution", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM toolchain version compatibility gate.",
    )
    expect(doc).toContain("upgrade-rust-toolchain-to-1.91-plus")
    expect(doc).toContain("pinned-ci-image")
    expect(doc).toContain("Text Engine WASM Toolchain Rust Upgrade Execution Gate")
    expect(doc).toContain("Artifact Digest Pinning Execution remains blocked")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain(
      "Status: updated after Variable Schema Metadata Shape Gate.",
    )
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(nextPointer).toContain(
      "Status: current after Variable Schema Metadata Shape Gate.",
    )
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(readme).toContain("Text engine WASM toolchain version compatibility gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain(
      "| 195C | Text engine WASM toolchain version compatibility gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195C Text Engine WASM Toolchain Version Compatibility Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195C: Text Engine WASM Toolchain Version Compatibility Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195B Handoff")
  })
})
