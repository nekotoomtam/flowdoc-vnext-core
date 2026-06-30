import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

type RustUpgradeExecutionSummary = {
  rustUpgradeExecutionSummaryId: string
  sourceCompatibilitySummaryId: string
  sourceProvisioningExecutionSummaryId: string
  sourceProvisioningBootstrapSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  sourceCompatibility: {
    acceptedImmediateStrategy: "upgrade-rust-toolchain-to-1.91-plus"
    minimumRustc: "1.91"
    acceptedLongTermStrategy: "pinned-ci-image"
    previousRustc: string
    previousCargo: string
    previousWasmPackAvailable: boolean
    previousWasm32UnknownUnknownInstalled: boolean
    previousToolchainReady: boolean
  }
  execution: {
    allowedInEnvironment: boolean
    executionSkipped: boolean
    approvalMode: string
    networkAccessObserved: boolean
    systemToolchainWriteObserved: boolean
    rawCommandOutputIncluded: boolean
    jsonSafe: boolean
    rawEvidenceIncluded: boolean
  }
  rustUpgrade: {
    command: string
    attempted: boolean
    exitCode: number
    status: "succeeded"
    minimumRustc: "1.91"
    capturedRustc: string
    capturedCargo: string
    rustcMeetsMinimum: boolean
    rawOutputIncluded: boolean
  }
  versionAfterUpgrade: {
    rustc: string
    cargo: string
    minimumRustc: "1.91"
    rustcMeetsMinimum: boolean
    installedRustTargets: string[]
    wasm32UnknownUnknownInstalled: boolean
    versionCaptureRequiresRootCheck: boolean
  }
  wasm32Target: {
    verificationCommand: string
    target: "wasm32-unknown-unknown"
    installed: boolean
    reinstalled: boolean
    status: "installed-after-upgrade"
    rawOutputIncluded: boolean
  }
  wasmPackRetry: {
    gatedByRustcMinimum: boolean
    attemptedOnlyAfterRustcMeetsMinimum: boolean
    command: string
    attempted: boolean
    exitCode: number
    status: "installed"
    selectedVersion: string
    capturedVersionCommand: string
    capturedVersion: string
    rawOutputIncluded: boolean
  }
  postExecutionReadiness: {
    lastObservedExitCode: number
    wasmPackAvailable: boolean
    wasmPackVersion: string
    wasmBindgenCliAvailable: boolean
    installedRustTargets: string[]
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    canProduceArtifactNow: boolean
    artifactProductionBlocked: boolean
    blockedReasons: string[]
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresRustUpgradeExecution: boolean
    requiresReadinessSmoke: boolean
    requiresArtifact: boolean
    requiresWasmBuild: boolean
  }
  artifactPolicy: {
    artifactProductionBlocked: boolean
    canRetryArtifactProduction: boolean
    artifactProductionRetryPhaseRequired: boolean
    artifactProduced: boolean
    artifactExists: boolean
    artifactPointer: string | null
    fileSizeBytes: number | null
    fakeArtifactAllowed: boolean
    producedThisPhase: boolean
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
    rustUpgradeExecutionSummaryPointer: string
    wasmArtifactPointer: string | null
    artifactProduced: boolean
    toolchainReady: boolean
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedWork: string
  artifactProductionRetryRule: string
  phase196Rule: string
}

type CompatibilitySummary = {
  compatibilitySummaryId: string
  sourceProvisioningExecutionSummaryId: string
  sourceProvisioningBootstrapSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  acceptedImmediateStrategy: {
    id: "upgrade-rust-toolchain-to-1.91-plus"
    minimumRustc: "1.91"
  }
  acceptedLongTermStrategy: {
    id: "pinned-ci-image"
  }
}

type DiagnosticOutput = {
  summaryId: string
  acceptedArtifactPath: string
  wasmPackAvailable: boolean
  wasmPackVersion: string | null
  wasm32UnknownUnknownInstalled: boolean
  toolchainReady: boolean
  canProduceArtifactNow: boolean
  artifactProduced: boolean
  digestStatus: "pending"
  sha256: string | null
  rawEvidenceIncluded: boolean
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

function parseMinor(version: string): number {
  const match = /rustc 1\.(\d+)\./.exec(version)
  expect(match).not.toBeNull()
  return Number(match?.[1])
}

const upgradeSummary = readJson<RustUpgradeExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json",
)

const compatibilitySummary = readJson<CompatibilitySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json",
)

describe("text engine WASM toolchain Rust upgrade execution gate", () => {
  it("links Rust upgrade execution to the compatibility source of truth", () => {
    expect(upgradeSummary.rustUpgradeExecutionSummaryId).toBe(
      "text-engine-wasm-toolchain-rust-upgrade-execution-v1",
    )
    expect(upgradeSummary.sourceCompatibilitySummaryId).toBe(
      compatibilitySummary.compatibilitySummaryId,
    )
    expect(upgradeSummary.sourceProvisioningExecutionSummaryId).toBe(
      compatibilitySummary.sourceProvisioningExecutionSummaryId,
    )
    expect(upgradeSummary.sourceProvisioningBootstrapSummaryId).toBe(
      compatibilitySummary.sourceProvisioningBootstrapSummaryId,
    )
    expect(upgradeSummary.sourceArtifactProductionSummaryId).toBe(
      compatibilitySummary.sourceArtifactProductionSummaryId,
    )
    expect(upgradeSummary.sourceDiagnosticSummaryId).toBe(
      compatibilitySummary.sourceDiagnosticSummaryId,
    )
    expect(upgradeSummary.acceptedArtifactPath).toBe(
      compatibilitySummary.acceptedArtifactPath,
    )
    expect(upgradeSummary.acceptedBuildPath).toBe(compatibilitySummary.acceptedBuildPath)
    expect(upgradeSummary.sourceCompatibility).toMatchObject({
      acceptedImmediateStrategy: compatibilitySummary.acceptedImmediateStrategy.id,
      minimumRustc: compatibilitySummary.acceptedImmediateStrategy.minimumRustc,
      acceptedLongTermStrategy: compatibilitySummary.acceptedLongTermStrategy.id,
      previousWasmPackAvailable: false,
      previousWasm32UnknownUnknownInstalled: true,
      previousToolchainReady: false,
    })
  })

  it("records the approved Rust upgrade execution without raw output", () => {
    expect(upgradeSummary.execution).toEqual({
      allowedInEnvironment: true,
      executionSkipped: false,
      approvalMode: "sandbox-escalated-command-approval",
      networkAccessObserved: true,
      systemToolchainWriteObserved: true,
      rawCommandOutputIncluded: false,
      jsonSafe: true,
      rawEvidenceIncluded: false,
    })
    expect(upgradeSummary.rustUpgrade).toMatchObject({
      command: "rustup update stable",
      attempted: true,
      exitCode: 0,
      status: "succeeded",
      minimumRustc: "1.91",
      capturedRustc: "rustc 1.96.0 (ac68faa20 2026-05-25)",
      capturedCargo: "cargo 1.96.0 (30a34c682 2026-05-25)",
      rustcMeetsMinimum: true,
      rawOutputIncluded: false,
    })
    expect(parseMinor(upgradeSummary.versionAfterUpgrade.rustc)).toBeGreaterThanOrEqual(91)
    expect(upgradeSummary.versionAfterUpgrade).toMatchObject({
      cargo: "cargo 1.96.0 (30a34c682 2026-05-25)",
      minimumRustc: "1.91",
      rustcMeetsMinimum: true,
      wasm32UnknownUnknownInstalled: true,
      versionCaptureRequiresRootCheck: false,
    })
    expect(upgradeSummary.versionAfterUpgrade.installedRustTargets).toContain(
      "wasm32-unknown-unknown",
    )
  })

  it("retries wasm-pack only after the Rust minimum is satisfied", () => {
    expect(upgradeSummary.wasm32Target).toEqual({
      verificationCommand: "rustup target list --installed",
      target: "wasm32-unknown-unknown",
      installed: true,
      reinstalled: false,
      status: "installed-after-upgrade",
      rawOutputIncluded: false,
    })
    expect(upgradeSummary.wasmPackRetry).toEqual({
      gatedByRustcMinimum: true,
      attemptedOnlyAfterRustcMeetsMinimum: true,
      command: "cargo install wasm-pack --locked",
      attempted: true,
      exitCode: 0,
      status: "installed",
      selectedVersion: "wasm-pack v0.15.0",
      capturedVersionCommand: "wasm-pack --version",
      capturedVersion: "wasm-pack 0.15.0",
      rawOutputIncluded: false,
    })
    expect(upgradeSummary.versionAfterUpgrade.rustcMeetsMinimum).toBe(true)
    expect(upgradeSummary.wasmPackRetry.attemptedOnlyAfterRustcMeetsMinimum).toBe(true)
  })

  it("records package-local readiness as available without making root checks depend on it", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(upgradeSummary.postExecutionReadiness).toMatchObject({
      lastObservedExitCode: 0,
      wasmPackAvailable: true,
      wasmPackVersion: "wasm-pack 0.15.0",
      wasm32UnknownUnknownInstalled: true,
      toolchainReady: true,
      canProduceArtifactNow: true,
      artifactProductionBlocked: false,
      blockedReasons: [],
    })
    expect(upgradeSummary.postExecutionReadiness.installedRustTargets).toContain(
      "wasm32-unknown-unknown",
    )
    expect(upgradeSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresRustUpgradeExecution: false,
      requiresReadinessSmoke: false,
      requiresArtifact: false,
      requiresWasmBuild: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
  })

  it("keeps artifact production and digest pinning out of this phase", () => {
    expect(upgradeSummary.artifactPolicy).toMatchObject({
      artifactProductionBlocked: false,
      canRetryArtifactProduction: true,
      artifactProductionRetryPhaseRequired: true,
      artifactProduced: false,
      artifactExists: false,
      artifactPointer: null,
      fileSizeBytes: null,
      fakeArtifactAllowed: false,
      producedThisPhase: false,
    })
    expect(upgradeSummary.digestPolicy).toEqual({
      digestPinningBlocked: true,
      digestStatus: "pending",
      sha256: null,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
    expect(upgradeSummary.blockers).toEqual([
      "artifact-production-retry-not-yet-run",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(upgradeSummary.jsonSafeRootSummary).toMatchObject({
      rustUpgradeExecutionSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json",
      wasmArtifactPointer: null,
      artifactProduced: false,
      toolchainReady: true,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
  })

  it("can rerun the package-local diagnostic without requiring a root WASM toolchain", () => {
    const result = spawnSync(
      process.execPath,
      ["packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs"],
      {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
      },
    )

    expect(result.status).toBe(0)
    const diagnostic = JSON.parse(result.stdout) as DiagnosticOutput
    expect(diagnostic.summaryId).toBe(upgradeSummary.sourceDiagnosticSummaryId)
    expect(diagnostic.acceptedArtifactPath).toBe(upgradeSummary.acceptedArtifactPath)
    expect(typeof diagnostic.wasmPackAvailable).toBe("boolean")
    expect(typeof diagnostic.wasm32UnknownUnknownInstalled).toBe("boolean")
    expect(typeof diagnostic.toolchainReady).toBe("boolean")
    expect(typeof diagnostic.canProduceArtifactNow).toBe("boolean")
    expect(diagnostic.artifactProduced).toBe(false)
    expect(diagnostic.digestStatus).toBe("pending")
    expect(diagnostic.sha256).toBeNull()
    expect(diagnostic.rawEvidenceIncluded).toBe(false)
  })

  it("keeps downstream measurement evidence and production binding blocked", () => {
    expect(upgradeSummary.rawEvidenceIncluded).toBe(false)
    expect(upgradeSummary.productionReady).toBe(false)
    expect(upgradeSummary.defaultMeasurerReplacement).toBe(false)
    expect(upgradeSummary.nativeEvidenceStatus).toBe("blocked")
    expect(upgradeSummary.wasmEvidenceStatus).toBe("blocked")
    expect(upgradeSummary.nativeWasmParityStatus).toBe("not-run")
    expect(upgradeSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(upgradeSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(upgradeSummary.acceptedManifestStatus).toBe("blocked")
    expect(upgradeSummary.nextRecommendedWork).toBe(
      "Text Engine WASM Artifact Production Retry Gate",
    )
    expect(upgradeSummary.artifactProductionRetryRule).toBe(
      "retry-in-next-phase-only-after-toolchainReady-true",
    )
    expect(upgradeSummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-toolchain-rust-upgrade-execution")
    expect(coreMeasurement).not.toContain("wasm-toolchain-rust-upgrade-execution")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the Rust upgrade execution gate and points next to artifact production retry", () => {
    const doc = readText(
      "../docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md",
    )
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM toolchain Rust upgrade execution gate.",
    )
    expect(doc).toContain("rustup update stable")
    expect(doc).toContain("rustc 1.96.0")
    expect(doc).toContain("wasm-pack 0.15.0")
    expect(doc).toContain("Text Engine WASM Artifact Production Retry Gate")
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
      "Status: updated after Data Contract Validation Policy Gate.",
    )
    expect(currentStatus).toContain(
      "Text Engine WASM Artifact Production Retry Gate.",
    )
    expect(currentStatus).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(nextPointer).toContain(
      "Status: current after Data Contract Validation Policy Gate.",
    )
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(readme).toContain("Text engine WASM toolchain Rust upgrade execution gate")
    expect(readme).toContain(
      "docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md",
    )
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain(
      "| 195D | Text engine WASM toolchain Rust upgrade execution gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195D Text Engine WASM Toolchain Rust Upgrade Execution Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195D: Text Engine WASM Toolchain Rust Upgrade Execution Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195C Handoff")
  })
})
