import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

type ProvisioningExecutionSummary = {
  executionSummaryId: string
  sourceProvisioningBootstrapSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceReadinessSmokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
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
  preExecutionReadiness: {
    wasmPackAvailable: boolean
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    blockedReasons: string[]
  }
  wasmPackProvisioning: {
    command: string
    attempted: boolean
    exitCode: number
    status: "failed-rustc-version-incompatible"
    downloadedCandidateVersion: string
    installed: boolean
    capturedVersion: string | null
    failureCategory: "rustc-version-too-old"
    failureSummary: string
    rawOutputIncluded: boolean
    acceptedAlternativesStillOpen: string[]
  }
  wasm32TargetProvisioning: {
    command: string
    attempted: boolean
    exitCode: number
    status: "installed"
    target: "wasm32-unknown-unknown"
    installed: boolean
    rawOutputIncluded: boolean
  }
  postExecutionReadiness: {
    wasmPackAvailable: boolean
    wasmPackVersion: string | null
    wasm32UnknownUnknownInstalled: boolean
    installedRustTargets: string[]
    toolchainReady: boolean
    canProduceArtifactNow: boolean
    blockedReasons: string[]
  }
  versionPolicy: {
    wasmPack: {
      currentVersion: string | null
      status: string
      pinExactVersionBeforeArtifactProduction: boolean
    }
    rustc: {
      currentVersion: string
      minimumObservedRequiredByLatestWasmPackDependency: string
      status: string
    }
    cargo: {
      currentVersion: string
      status: string
    }
    rustTarget: {
      installedTargets: string[]
      status: "installed"
    }
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresProvisioningExecution: boolean
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
    provisioningBootstrapSummaryPointer: string
    provisioningExecutionSummaryPointer: string
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

type ProvisioningBootstrapSummary = {
  provisioningSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
}

type ArtifactProductionSummary = {
  productionSummaryId: string
  sourceReadinessSmokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
}

type DiagnosticOutput = {
  summaryId: string
  acceptedArtifactPath: string
  wasmPackAvailable: boolean
  wasm32UnknownUnknownInstalled: boolean
  toolchainReady: boolean
  canProduceArtifactNow: boolean
  artifactProduced: boolean
  digestStatus: "pending"
  sha256: string | null
  rawEvidenceIncluded: boolean
  blockedReasons: string[]
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

const executionSummary = readJson<ProvisioningExecutionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json",
)

const bootstrapSummary = readJson<ProvisioningBootstrapSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json",
)

const productionSummary = readJson<ArtifactProductionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json",
)

describe("text engine WASM toolchain provisioning execution gate", () => {
  it("links execution evidence to the bootstrap and artifact production blockers", () => {
    expect(executionSummary.executionSummaryId).toBe(
      "text-engine-wasm-toolchain-provisioning-execution-v1",
    )
    expect(executionSummary.sourceProvisioningBootstrapSummaryId).toBe(
      bootstrapSummary.provisioningSummaryId,
    )
    expect(executionSummary.sourceArtifactProductionSummaryId).toBe(
      productionSummary.productionSummaryId,
    )
    expect(executionSummary.sourceReadinessSmokeSummaryId).toBe(
      productionSummary.sourceReadinessSmokeSummaryId,
    )
    expect(executionSummary.sourceDiagnosticSummaryId).toBe(
      productionSummary.sourceDiagnosticSummaryId,
    )
    expect(executionSummary.acceptedArtifactPath).toBe(bootstrapSummary.acceptedArtifactPath)
    expect(executionSummary.acceptedBuildPath).toBe(bootstrapSummary.acceptedBuildPath)
  })

  it("records attempted provisioning without storing raw command output", () => {
    expect(executionSummary.execution).toEqual({
      allowedInEnvironment: true,
      executionSkipped: false,
      approvalMode: "sandbox-escalated-command-approval",
      networkAccessObserved: true,
      systemToolchainWriteObserved: true,
      rawCommandOutputIncluded: false,
      jsonSafe: true,
      rawEvidenceIncluded: false,
    })
    expect(executionSummary.preExecutionReadiness).toMatchObject({
      wasmPackAvailable: false,
      wasm32UnknownUnknownInstalled: false,
      toolchainReady: false,
      blockedReasons: [
        "wasm-pack-not-available",
        "wasm32-unknown-unknown-target-not-installed",
      ],
    })
    expect(executionSummary.wasmPackProvisioning.command).toBe(
      "cargo install wasm-pack --locked",
    )
    expect(executionSummary.wasmPackProvisioning).toMatchObject({
      attempted: true,
      exitCode: 1,
      status: "failed-rustc-version-incompatible",
      downloadedCandidateVersion: "wasm-pack v0.15.0",
      installed: false,
      capturedVersion: null,
      failureCategory: "rustc-version-too-old",
      rawOutputIncluded: false,
    })
    expect(executionSummary.wasmPackProvisioning.failureSummary).toContain("rustc 1.91")
    expect(executionSummary.wasmPackProvisioning.failureSummary).toContain("rustc 1.88.0")
    expect(executionSummary.wasmPackProvisioning.acceptedAlternativesStillOpen).toContain(
      "pinned-ci-image",
    )
    expect(executionSummary.wasm32TargetProvisioning).toEqual({
      path: "rustup-target-add",
      command: "rustup target add wasm32-unknown-unknown",
      attempted: true,
      exitCode: 0,
      status: "installed",
      target: "wasm32-unknown-unknown",
      installed: true,
      rawOutputIncluded: false,
    })
  })

  it("records post-execution readiness as target-installed but wasm-pack-blocked", () => {
    expect(executionSummary.postExecutionReadiness).toEqual({
      command: "npm run wasm:readiness-smoke",
      workingDirectory: "packages/text-engine-rust-wasm",
      lastObservedExitCode: 0,
      cargoAvailable: true,
      rustupAvailable: true,
      wasmPackAvailable: false,
      wasmPackVersion: null,
      wasmPackVersionPolicyStatus: "blocked-until-rustc-compatible-or-accepted-alternative",
      wasmBindgenCliAvailable: false,
      installedRustTargets: ["wasm32-unknown-unknown", "x86_64-pc-windows-msvc"],
      wasm32UnknownUnknownInstalled: true,
      toolchainReady: false,
      canProduceArtifactNow: false,
      blockedReasons: ["wasm-pack-not-available"],
    })
    expect(executionSummary.versionPolicy.wasmPack).toMatchObject({
      currentVersion: null,
      status: "blocked-until-rustc-compatible-or-accepted-alternative",
      pinExactVersionBeforeArtifactProduction: true,
    })
    expect(executionSummary.versionPolicy.rustc).toMatchObject({
      currentVersion: "rustc 1.88.0 (6b00bc388 2025-06-23)",
      minimumObservedRequiredByLatestWasmPackDependency: "rustc 1.91",
      status: "too-old-for-wasm-pack-0.15.0",
    })
    expect(executionSummary.versionPolicy.rustTarget.installedTargets).toContain(
      "wasm32-unknown-unknown",
    )
  })

  it("can rerun the package-local readiness diagnostic without producing an artifact", () => {
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
    expect(diagnostic.summaryId).toBe(executionSummary.sourceDiagnosticSummaryId)
    expect(diagnostic.acceptedArtifactPath).toBe(executionSummary.acceptedArtifactPath)
    expect(typeof diagnostic.wasmPackAvailable).toBe("boolean")
    expect(typeof diagnostic.wasm32UnknownUnknownInstalled).toBe("boolean")
    expect(typeof diagnostic.toolchainReady).toBe("boolean")
    expect(typeof diagnostic.canProduceArtifactNow).toBe("boolean")
    expect(diagnostic.artifactProduced).toBe(false)
    expect(diagnostic.digestStatus).toBe("pending")
    expect(diagnostic.sha256).toBeNull()
    expect(diagnostic.rawEvidenceIncluded).toBe(false)
    if (diagnostic.toolchainReady) {
      expect(diagnostic.blockedReasons).toEqual([])
    } else {
      expect(diagnostic.blockedReasons.length).toBeGreaterThan(0)
    }
  })

  it("keeps root checks independent and blocks artifact production plus digest pinning", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(executionSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresProvisioningExecution: false,
      requiresReadinessSmoke: false,
      requiresArtifact: false,
      requiresWasmBuild: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
    expect(executionSummary.artifactPolicy).toMatchObject({
      artifactProductionBlocked: true,
      canRetryArtifactProduction: false,
      artifactProduced: false,
      artifactPointer: null,
      fakeArtifactAllowed: false,
    })
    expect(executionSummary.digestPolicy).toEqual({
      digestPinningBlocked: true,
      digestStatus: "pending",
      sha256: null,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
  })

  it("keeps downstream measurement evidence and production binding blocked", () => {
    expect(executionSummary.rawEvidenceIncluded).toBe(false)
    expect(executionSummary.productionReady).toBe(false)
    expect(executionSummary.defaultMeasurerReplacement).toBe(false)
    expect(executionSummary.nativeEvidenceStatus).toBe("blocked")
    expect(executionSummary.wasmEvidenceStatus).toBe("blocked")
    expect(executionSummary.nativeWasmParityStatus).toBe("not-run")
    expect(executionSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(executionSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(executionSummary.acceptedManifestStatus).toBe("blocked")
    expect(executionSummary.blockers).toEqual([
      "wasm-pack-install-failed-rustc-version-incompatible",
      "rustc-1.88.0-below-wasm-pack-0.15.0-dependency-requirement-1.91",
      "wasm-pack-not-available",
      "wasm-pack-version-unpinned",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(executionSummary.jsonSafeRootSummary).toMatchObject({
      provisioningBootstrapSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json",
      provisioningExecutionSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json",
      wasmArtifactPointer: null,
      artifactProduced: false,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
    expect(executionSummary.nextRecommendedWork).toBe(
      "Text Engine WASM Toolchain Version Compatibility Gate",
    )
    expect(executionSummary.artifactProductionRetryRule).toBe(
      "retry-only-after-toolchainReady-true",
    )
    expect(executionSummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-toolchain-provisioning-execution")
    expect(coreMeasurement).not.toContain("wasm-toolchain-provisioning-execution")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the execution gate and points the next phase to compatibility strategy", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM toolchain provisioning execution gate.",
    )
    expect(doc).toContain("cargo install wasm-pack --locked")
    expect(doc).toContain("rustup target add wasm32-unknown-unknown")
    expect(doc).toContain("failed-rustc-version-incompatible")
    expect(doc).toContain("Text Engine WASM Toolchain Version Compatibility Gate")
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
      "Status: updated after Render API Contract Planning Gate.",
    )
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain(
      "Status: current after Render API Contract Planning Gate.",
    )
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(readme).toContain("Text engine WASM toolchain provisioning execution gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md")
    expect(packageReadme).toContain("Status: Measurement hardening close audit source package.")
    expect(ledger).toContain(
      "| 195B | Text engine WASM toolchain provisioning execution gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195B Text Engine WASM Toolchain Provisioning Execution Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195B: Text Engine WASM Toolchain Provisioning Execution Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195A Handoff")
  })
})
