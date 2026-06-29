import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type ArtifactProductionRetrySummary = {
  productionRetrySummaryId: string
  sourceRustUpgradeExecutionSummaryId: string
  sourceCompatibilitySummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  readinessBeforeBuild: {
    wasmPackAvailable: boolean
    wasmPackVersion: string
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    canProduceArtifactNow: boolean
    artifactProduced: boolean
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
    blockedReasons: string[]
  }
  buildAttempt: {
    packageScript: "wasm:build"
    command: string
    underlyingCommand: string
    attempted: boolean
    exitCode: number
    status: "failed-missing-wasm-bindgen-dependency"
    compileStepReached: boolean
    wasmPackPostCompileCheckFailed: boolean
    failureSummary: string
    rawOutputIncluded: boolean
  }
  artifact: {
    artifactProduced: boolean
    artifactExists: boolean
    artifactPointer: string | null
    retentionPointer: string | null
    fileSizeBytes: number | null
    rawArtifactIncluded: boolean
    fakeArtifactAllowed: boolean
    artifactProductionStatus: string
  }
  generatedPackageMetadataShape: {
    status: "not-generated"
    outputDirectory: string
    acceptedWasmFile: string
    acceptedWasmExists: boolean
    jsGlueExists: boolean
    packageJsonExists: boolean
    typescriptDeclarationExists: boolean
    wasmBindgenDeclarationExists: boolean
    observedPlaceholderFiles: string[]
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresReadinessSmoke: boolean
    requiresWasmBuild: boolean
    requiresArtifact: boolean
    requiresArtifactProductionRetry: boolean
  }
  digestPolicy: {
    digestPinningBlocked: boolean
    digestStatus: "pending"
    sha256: string | null
    sha256ComputedThisPhase: boolean
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
    artifactProductionRetrySummaryPointer: string
    wasmArtifactPointer: string | null
    artifactProduced: boolean
    fileSizeBytes: number | null
    generatedPackageMetadataShape: "not-generated"
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedWork: string
  artifactProductionRetryRule: string
  phase196Rule: string
}

type RustUpgradeExecutionSummary = {
  rustUpgradeExecutionSummaryId: string
  sourceCompatibilitySummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  postExecutionReadiness: {
    wasmPackAvailable: boolean
    wasmPackVersion: string
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    canProduceArtifactNow: boolean
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

function repoPathExists(path: string): boolean {
  return existsSync(new URL(`../${path}`, import.meta.url))
}

const retrySummary = readJson<ArtifactProductionRetrySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json",
)

const rustUpgradeSummary = readJson<RustUpgradeExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json",
)

describe("text engine WASM artifact production retry gate", () => {
  it("links the retry attempt to the Rust upgrade execution source of truth", () => {
    expect(retrySummary.productionRetrySummaryId).toBe(
      "text-engine-wasm-artifact-production-retry-v1",
    )
    expect(retrySummary.sourceRustUpgradeExecutionSummaryId).toBe(
      rustUpgradeSummary.rustUpgradeExecutionSummaryId,
    )
    expect(retrySummary.sourceCompatibilitySummaryId).toBe(
      rustUpgradeSummary.sourceCompatibilitySummaryId,
    )
    expect(retrySummary.sourceArtifactProductionSummaryId).toBe(
      rustUpgradeSummary.sourceArtifactProductionSummaryId,
    )
    expect(retrySummary.sourceDiagnosticSummaryId).toBe(
      rustUpgradeSummary.sourceDiagnosticSummaryId,
    )
    expect(retrySummary.acceptedArtifactPath).toBe(rustUpgradeSummary.acceptedArtifactPath)
    expect(retrySummary.acceptedBuildPath).toBe(rustUpgradeSummary.acceptedBuildPath)
  })

  it("confirms readiness before attempting wasm build", () => {
    expect(retrySummary.readinessBeforeBuild).toEqual({
      command: "npm run wasm:readiness-smoke",
      workingDirectory: "packages/text-engine-rust-wasm",
      lastObservedExitCode: 0,
      wasmPackAvailable: true,
      wasmPackVersion: "wasm-pack 0.15.0",
      wasm32UnknownUnknownInstalled: true,
      toolchainReady: true,
      canProduceArtifactNow: true,
      artifactProduced: false,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
      blockedReasons: [],
    })
    expect(retrySummary.readinessBeforeBuild).toMatchObject({
      wasmPackAvailable: rustUpgradeSummary.postExecutionReadiness.wasmPackAvailable,
      wasmPackVersion: rustUpgradeSummary.postExecutionReadiness.wasmPackVersion,
      wasm32UnknownUnknownInstalled:
        rustUpgradeSummary.postExecutionReadiness.wasm32UnknownUnknownInstalled,
      toolchainReady: rustUpgradeSummary.postExecutionReadiness.toolchainReady,
      canProduceArtifactNow:
        rustUpgradeSummary.postExecutionReadiness.canProduceArtifactNow,
    })
  })

  it("records the package-local build attempt and exact blocker", () => {
    expect(retrySummary.buildAttempt).toMatchObject({
      workingDirectory: "packages/text-engine-rust-wasm",
      packageScript: "wasm:build",
      command: "npm run wasm:build",
      underlyingCommand:
        "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
      attempted: true,
      exitCode: 1,
      status: "failed-missing-wasm-bindgen-dependency",
      compileStepReached: true,
      wasmPackPostCompileCheckFailed: true,
      rawOutputIncluded: false,
    })
    expect(retrySummary.buildAttempt.failureSummary).toContain("wasm-bindgen")
    expect(retrySummary.buildAttempt.failureSummary).toContain("Cargo.toml")
  })

  it("does not produce the accepted artifact or generated package metadata", () => {
    expect(repoPathExists(retrySummary.acceptedArtifactPath)).toBe(false)
    expect(retrySummary.artifact).toEqual({
      artifactProduced: false,
      artifactExists: false,
      artifactPointer: null,
      retentionPointer: null,
      fileSizeBytes: null,
      rawArtifactIncluded: false,
      producedOnlyUnderAcceptedPackageLocalPkgPath: true,
      fakeArtifactAllowed: false,
      artifactProductionStatus: "blocked-not-produced",
    })
    expect(retrySummary.generatedPackageMetadataShape).toEqual({
      status: "not-generated",
      outputDirectory: "packages/text-engine-rust-wasm/pkg",
      acceptedWasmFile: "flowdoc_text_engine_bg.wasm",
      acceptedWasmExists: false,
      jsGlueExists: false,
      packageJsonExists: false,
      typescriptDeclarationExists: false,
      wasmBindgenDeclarationExists: false,
      observedPlaceholderFiles: [".gitignore"],
    })
  })

  it("keeps root checks independent and digest pinning blocked", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(retrySummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresReadinessSmoke: false,
      requiresWasmBuild: false,
      requiresArtifact: false,
      requiresArtifactProductionRetry: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
    expect(retrySummary.digestPolicy).toEqual({
      digestPinningBlocked: true,
      digestStatus: "pending",
      sha256: null,
      sha256ComputedThisPhase: false,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
    expect(retrySummary.blockers).toEqual([
      "wasm-bindgen-dependency-missing-from-rust-shaper-cargo-toml",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
  })

  it("keeps downstream measurement evidence and production binding blocked", () => {
    expect(retrySummary.rawEvidenceIncluded).toBe(false)
    expect(retrySummary.productionReady).toBe(false)
    expect(retrySummary.defaultMeasurerReplacement).toBe(false)
    expect(retrySummary.nativeEvidenceStatus).toBe("blocked")
    expect(retrySummary.wasmEvidenceStatus).toBe("blocked")
    expect(retrySummary.nativeWasmParityStatus).toBe("not-run")
    expect(retrySummary.rendererBackedDriftStatus).toBe("unknown")
    expect(retrySummary.numericDriftThresholdStatus).toBe("blocked")
    expect(retrySummary.acceptedManifestStatus).toBe("blocked")
    expect(retrySummary.jsonSafeRootSummary).toMatchObject({
      artifactProductionRetrySummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json",
      wasmArtifactPointer: null,
      artifactProduced: false,
      fileSizeBytes: null,
      generatedPackageMetadataShape: "not-generated",
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
    expect(retrySummary.nextRecommendedWork).toBe(
      "Text Engine WASM Bindgen Export Dependency Gate",
    )
    expect(retrySummary.artifactProductionRetryRule).toBe(
      "retry-after-package-local-wasm-bindgen-dependency-gate",
    )
    expect(retrySummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-artifact-production-retry")
    expect(coreMeasurement).not.toContain("wasm-artifact-production-retry")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the retry gate and points next to the bindgen dependency gate", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM artifact production retry gate.",
    )
    expect(doc).toContain("failed-missing-wasm-bindgen-dependency")
    expect(doc).toContain("Text Engine WASM Bindgen Export Dependency Gate")
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
      "Status: updated after Text Engine WASM Artifact Production Retry Gate.",
    )
    expect(currentStatus).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(currentStatus).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain(
      "Status: current after Text Engine WASM Artifact Production Retry Gate.",
    )
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Phase 196: Artifact Digest Pinning Execution remains blocked.")
    expect(readme).toContain("Text engine WASM artifact production retry gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md")
    expect(packageReadme).toContain("Status: WASM artifact production retry package.")
    expect(ledger).toContain(
      "| 195E | Text engine WASM artifact production retry gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195E Text Engine WASM Artifact Production Retry Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195E: Text Engine WASM Artifact Production Retry Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195E:")
    expect(roadmap).toContain("Historical Phase 195D Handoff")
  })
})
