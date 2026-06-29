import { existsSync, readFileSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"

type ArtifactProductionRetrySummary = {
  productionRetrySummaryId: string
  sourceBindgenExportDependencySummaryId: string
  sourceRustUpgradeExecutionSummaryId: string
  sourceCompatibilitySummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  readinessBeforeBuild: {
    command: string
    workingDirectory: string
    lastObservedExitCode: number
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
    status: "succeeded"
    compileStepReached: boolean
    wasmPackPostCompileCheckFailed: boolean
    failureSummary: string | null
    rawOutputIncluded: boolean
  }
  artifact: {
    artifactProduced: boolean
    artifactExists: boolean
    artifactPointer: string
    retentionPointer: string
    fileSizeBytes: number
    rawArtifactBytesIncludedInSummary: boolean
    producedOnlyUnderAcceptedPackageLocalPkgPath: boolean
    fakeArtifactAllowed: boolean
    artifactProductionStatus: string
  }
  generatedPackageMetadataShape: {
    status: "generated"
    outputDirectory: string
    acceptedWasmFile: string
    acceptedWasmExists: boolean
    jsGlueExists: boolean
    packageJsonExists: boolean
    typescriptDeclarationExists: boolean
    wasmBindgenDeclarationExists: boolean
    observedFiles: Array<{
      name: string
      fileSizeBytes: number
    }>
    generatedPackageJson: {
      name: string
      type: "module"
      version: string
      main: string
      types: string
      files: string[]
    }
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
  resolvedBlockers: string[]
  jsonSafeRootSummary: {
    artifactProductionRetrySummaryPointer: string
    bindgenExportDependencySummaryPointer: string
    wasmArtifactPointer: string
    artifactProduced: boolean
    fileSizeBytes: number
    generatedPackageMetadataShape: "generated"
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

type BindgenExportDependencySummary = {
  bindgenExportDependencySummaryId: string
  acceptedArtifactPath: string
  artifactPolicy: {
    canRetryArtifactProduction: boolean
  }
  resolvedBlockers: string[]
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

function repoPathExists(path: string): boolean {
  return existsSync(repoPath(path))
}

const retrySummary = readJson<ArtifactProductionRetrySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json",
)

const rustUpgradeSummary = readJson<RustUpgradeExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json",
)

const bindgenSummary = readJson<BindgenExportDependencySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json",
)

describe("text engine WASM artifact production retry gate", () => {
  it("links the retry attempt to bindgen dependency and Rust readiness sources", () => {
    expect(retrySummary.productionRetrySummaryId).toBe(
      "text-engine-wasm-artifact-production-retry-v1",
    )
    expect(retrySummary.sourceBindgenExportDependencySummaryId).toBe(
      bindgenSummary.bindgenExportDependencySummaryId,
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
    expect(retrySummary.acceptedArtifactPath).toBe(bindgenSummary.acceptedArtifactPath)
    expect(retrySummary.acceptedBuildPath).toBe(rustUpgradeSummary.acceptedBuildPath)
    expect(bindgenSummary.artifactPolicy.canRetryArtifactProduction).toBe(true)
    expect(bindgenSummary.resolvedBlockers).toContain(
      "wasm-bindgen-dependency-missing-from-rust-shaper-cargo-toml",
    )
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

  it("records the successful package-local build attempt", () => {
    expect(retrySummary.buildAttempt).toMatchObject({
      workingDirectory: "packages/text-engine-rust-wasm",
      packageScript: "wasm:build",
      command: "npm run wasm:build",
      underlyingCommand:
        "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
      attempted: true,
      exitCode: 0,
      status: "succeeded",
      compileStepReached: true,
      wasmPackPostCompileCheckFailed: false,
      failureSummary: null,
      rawOutputIncluded: false,
    })
  })

  it("records the accepted artifact and generated package metadata shape", () => {
    const artifactStat = statSync(repoPath(retrySummary.acceptedArtifactPath))

    expect(repoPathExists(retrySummary.acceptedArtifactPath)).toBe(true)
    expect(artifactStat.size).toBe(retrySummary.artifact.fileSizeBytes)
    expect(retrySummary.artifact).toEqual({
      artifactProduced: true,
      artifactExists: true,
      artifactPointer: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
      retentionPointer: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
      fileSizeBytes: 13782,
      rawArtifactBytesIncludedInSummary: false,
      producedOnlyUnderAcceptedPackageLocalPkgPath: true,
      fakeArtifactAllowed: false,
      artifactProductionStatus: "produced-package-local",
    })
    expect(retrySummary.generatedPackageMetadataShape).toMatchObject({
      status: "generated",
      outputDirectory: "packages/text-engine-rust-wasm/pkg",
      acceptedWasmFile: "flowdoc_text_engine_bg.wasm",
      acceptedWasmExists: true,
      jsGlueExists: true,
      packageJsonExists: true,
      typescriptDeclarationExists: true,
      wasmBindgenDeclarationExists: true,
    })
    expect(retrySummary.generatedPackageMetadataShape.observedFiles).toEqual([
      { name: ".gitignore", fileSizeBytes: 1 },
      { name: "flowdoc_text_engine.d.ts", fileSizeBytes: 1529 },
      { name: "flowdoc_text_engine.js", fileSizeBytes: 5258 },
      { name: "flowdoc_text_engine_bg.wasm", fileSizeBytes: 13782 },
      { name: "flowdoc_text_engine_bg.wasm.d.ts", fileSizeBytes: 404 },
      { name: "package.json", fileSizeBytes: 314 },
    ])
    expect(retrySummary.generatedPackageMetadataShape.generatedPackageJson).toEqual({
      name: "flowdoc-rustybuzz-smoke",
      type: "module",
      version: "0.0.0",
      main: "flowdoc_text_engine.js",
      types: "flowdoc_text_engine.d.ts",
      files: [
        "flowdoc_text_engine_bg.wasm",
        "flowdoc_text_engine.js",
        "flowdoc_text_engine.d.ts",
      ],
    })
  })

  it("keeps root checks independent and leaves digest pinning to the next phase", () => {
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
      digestPinningBlocked: false,
      digestStatus: "pending",
      sha256: null,
      sha256ComputedThisPhase: false,
      pinningStatus: "ready-for-artifact-digest-pinning-execution",
      fakeSha256Allowed: false,
    })
    expect(retrySummary.blockers).toEqual([
      "sha256-not-computed",
      "native-evidence-blocked",
      "wasm-evidence-blocked",
      "native-wasm-parity-not-run",
      "renderer-backed-drift-unknown",
      "numeric-drift-thresholds-blocked",
      "accepted-manifest-blocked",
    ])
    expect(retrySummary.resolvedBlockers).toEqual([
      "wasm-bindgen-dependency-missing-from-rust-shaper-cargo-toml",
      "artifact-production-retry-not-yet-run-after-bindgen",
      "accepted-artifact-path-not-produced",
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
      bindgenExportDependencySummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json",
      wasmArtifactPointer:
        "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
      artifactProduced: true,
      fileSizeBytes: 13782,
      generatedPackageMetadataShape: "generated",
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
    expect(retrySummary.nextRecommendedWork).toBe("Artifact Digest Pinning Execution")
    expect(retrySummary.artifactProductionRetryRule).toBe(
      "completed-after-bindgen-export-dependency-gate",
    )
    expect(retrySummary.phase196Rule).toBe("ready-after-real-artifact-exists")
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

  it("documents the retry gate and points next to artifact digest pinning", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM artifact production retry gate after bindgen export",
    )
    expect(doc).toContain("buildAttempt.status=\"succeeded\"")
    expect(doc).toContain("fileSizeBytes=13782")
    expect(doc).toContain("Artifact Digest Pinning Execution")
    expect(doc).toContain("No sha256 compute or pinning")
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
      "Status: updated after Artifact Digest Pinning Execution.",
    )
    expect(currentStatus).toContain("Artifact Digest Pinning Execution.")
    expect(currentStatus).toContain("fileSizeBytes=13782")
    expect(nextPointer).toContain(
      "Status: current after Artifact Digest Pinning Execution.",
    )
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(nextPointer).toContain("sha256ComputedThisPhase=false")
    expect(readme).toContain("Text engine WASM artifact production retry gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md")
    expect(packageReadme).toContain("Status: WASM artifact digest pinned package.")
    expect(ledger).toContain(
      "| 195G | Text engine WASM artifact production retry after bindgen gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195G Text Engine WASM Artifact Production Retry After Bindgen Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195G: Text Engine WASM Artifact Production Retry After Bindgen Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195F Handoff")
  })
})
