import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

type ProvisioningBootstrapSummary = {
  provisioningSummaryId: string
  sourceArtifactProductionSummaryId: string
  sourceReadinessSmokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  bootstrap: {
    packageScript: "wasm:bootstrap-plan"
    command: string
    workingDirectory: string
    scriptPath: string
    mode: "plan-and-check-only"
    exitPolicy: "always-zero"
    lastObservedExitCode: number
    installExecuted: boolean
    scriptInstallsTooling: boolean
    jsonSafe: boolean
    rawEvidenceIncluded: boolean
    rootCheckRequiresBootstrapPlan: boolean
  }
  provisioningDecision: {
    strategy: "developer-or-ci-bootstrap"
    packageLocalOnly: boolean
    rootCheckDependency: boolean
    defaultNetworkCommandRequiresApproval: boolean
    cachedBinaryAllowed: boolean
    pinnedCiImageAllowed: boolean
    preinstalledDeveloperToolchainAllowed: boolean
  }
  acceptedProvisioning: {
    wasmPack: {
      path: "cargo-install-locked"
      command: string
      alternatePaths: string[]
      currentStatus: "missing"
      requiredBeforeArtifactProduction: boolean
    }
    wasm32UnknownUnknown: {
      path: "rustup-target-add"
      command: string
      alternatePaths: string[]
      currentStatus: "missing"
      requiredBeforeArtifactProduction: boolean
    }
  }
  versionPolicy: {
    wasmPack: {
      captureCommand: string
      currentVersion: string | null
      status: "pending-until-installed"
      pinExactVersionBeforeArtifactProduction: boolean
    }
    rustc: {
      captureCommand: string
      currentVersion: string
      status: "observed"
      recordBeforeArtifactProduction: boolean
    }
    cargo: {
      captureCommand: string
      currentVersion: string
      status: "observed"
      recordBeforeArtifactProduction: boolean
    }
    rustTarget: {
      captureCommand: string
      target: "wasm32-unknown-unknown"
      installedTargets: string[]
      status: "missing"
      requiredBeforeArtifactProduction: boolean
    }
  }
  availability: {
    rustcAvailable: boolean
    cargoAvailable: boolean
    rustupAvailable: boolean
    wasmPackAvailable: boolean
    wasmBindgenCliAvailable: boolean
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresBootstrapPlan: boolean
    requiresReadinessSmoke: boolean
    requiresArtifact: boolean
    requiresWasmBuild: boolean
  }
  artifactProductionBlocked: boolean
  digestPinningBlocked: boolean
  artifactProduced: boolean
  artifactPointer: string | null
  digestStatus: "pending"
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
  blockers: string[]
  jsonSafeRootSummary: {
    artifactProductionSummaryPointer: string
    provisioningBootstrapSummaryPointer: string
    bootstrapScriptPointer: string
    wasmArtifactPointer: string | null
    artifactProduced: boolean
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedWork: string
  phase196Rule: string
}

type ArtifactProductionSummary = {
  productionSummaryId: string
  sourceReadinessSmokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
}

type PackageJson = {
  scripts: Record<string, string>
}

type BootstrapOutput = {
  summaryId: string
  bootstrapExitPolicy: "always-zero"
  mode: "plan-and-check-only"
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  provisioningDecision: {
    strategy: "developer-or-ci-bootstrap"
    installExecuted: boolean
    scriptInstallsTooling: boolean
    packageLocalOnly: boolean
    rootCheckDependency: boolean
  }
  acceptedProvisioning: ProvisioningBootstrapSummary["acceptedProvisioning"]
  versionPolicy: ProvisioningBootstrapSummary["versionPolicy"]
  availability: ProvisioningBootstrapSummary["availability"]
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresBootstrapPlan: boolean
    requiresArtifact: boolean
    requiresWasmBuild: boolean
  }
  artifactProductionBlocked: boolean
  digestPinningBlocked: boolean
  artifactProduced: boolean
  digestStatus: "pending"
  sha256: string | null
  rawEvidenceIncluded: boolean
  blockedReasons: string[]
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

const provisioningSummary = readJson<ProvisioningBootstrapSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json",
)

const artifactProductionSummary = readJson<ArtifactProductionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json",
)

describe("text engine WASM toolchain provisioning bootstrap gate", () => {
  it("links the provisioning bootstrap plan to the Phase 195 artifact production blocker", () => {
    expect(provisioningSummary.provisioningSummaryId).toBe(
      "text-engine-wasm-toolchain-provisioning-bootstrap-v1",
    )
    expect(provisioningSummary.sourceArtifactProductionSummaryId).toBe(
      artifactProductionSummary.productionSummaryId,
    )
    expect(provisioningSummary.sourceReadinessSmokeSummaryId).toBe(
      artifactProductionSummary.sourceReadinessSmokeSummaryId,
    )
    expect(provisioningSummary.sourceDiagnosticSummaryId).toBe(
      artifactProductionSummary.sourceDiagnosticSummaryId,
    )
    expect(provisioningSummary.acceptedArtifactPath).toBe(
      artifactProductionSummary.acceptedArtifactPath,
    )
    expect(provisioningSummary.acceptedBuildPath).toBe(
      artifactProductionSummary.acceptedBuildPath,
    )
  })

  it("defines package-local provisioning paths without executing installation", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")
    const scriptSource = readText(
      "../packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs",
    )

    expect(packageJson.scripts["wasm:bootstrap-plan"]).toBe(
      "node scripts/plan-wasm-toolchain-bootstrap.mjs",
    )
    expect(provisioningSummary.bootstrap).toEqual({
      packageScript: "wasm:bootstrap-plan",
      command: "npm run wasm:bootstrap-plan",
      workingDirectory: "packages/text-engine-rust-wasm",
      scriptPath: "packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs",
      mode: "plan-and-check-only",
      exitPolicy: "always-zero",
      lastObservedExitCode: 0,
      installExecuted: false,
      scriptInstallsTooling: false,
      jsonSafe: true,
      rawEvidenceIncluded: false,
      rootCheckRequiresBootstrapPlan: false,
    })
    expect(provisioningSummary.provisioningDecision).toEqual({
      strategy: "developer-or-ci-bootstrap",
      packageLocalOnly: true,
      rootCheckDependency: false,
      defaultNetworkCommandRequiresApproval: true,
      cachedBinaryAllowed: true,
      pinnedCiImageAllowed: true,
      preinstalledDeveloperToolchainAllowed: true,
    })
    expect(provisioningSummary.acceptedProvisioning.wasmPack.command).toBe(
      "cargo install wasm-pack --locked",
    )
    expect(provisioningSummary.acceptedProvisioning.wasm32UnknownUnknown.command).toBe(
      "rustup target add wasm32-unknown-unknown",
    )
    expect(repoPathExists(provisioningSummary.bootstrap.scriptPath)).toBe(true)
    expect(scriptSource).toContain("plan-and-check-only")
    expect(scriptSource).toContain("process.exitCode = 0")
    expect(scriptSource).not.toContain("cargo install wasm-pack --locked\", [])")
    expect(scriptSource).not.toContain("rustup target add wasm32-unknown-unknown\", [])")
  })

  it("records version policy for wasm-pack, rustc, cargo, and the Rust target", () => {
    expect(provisioningSummary.versionPolicy.wasmPack).toEqual({
      captureCommand: "wasm-pack --version",
      currentVersion: null,
      status: "pending-until-installed",
      pinExactVersionBeforeArtifactProduction: true,
    })
    expect(provisioningSummary.versionPolicy.rustc).toMatchObject({
      captureCommand: "rustc --version",
      status: "observed",
      recordBeforeArtifactProduction: true,
    })
    expect(provisioningSummary.versionPolicy.rustc.currentVersion).toContain("rustc 1.88.0")
    expect(provisioningSummary.versionPolicy.cargo).toMatchObject({
      captureCommand: "cargo --version",
      status: "observed",
      recordBeforeArtifactProduction: true,
    })
    expect(provisioningSummary.versionPolicy.cargo.currentVersion).toContain("cargo 1.88.0")
    expect(provisioningSummary.versionPolicy.rustTarget).toEqual({
      captureCommand: "rustup target list --installed",
      target: "wasm32-unknown-unknown",
      installedTargets: ["x86_64-pc-windows-msvc"],
      status: "missing",
      requiredBeforeArtifactProduction: true,
    })
  })

  it("runs the package-local bootstrap plan as JSON-safe availability metadata", () => {
    const result = spawnSync(
      process.execPath,
      ["packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs"],
      {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
      },
    )

    expect(result.status).toBe(0)
    const bootstrap = JSON.parse(result.stdout) as BootstrapOutput
    expect(bootstrap.summaryId).toBe(provisioningSummary.provisioningSummaryId)
    expect(bootstrap.bootstrapExitPolicy).toBe("always-zero")
    expect(bootstrap.mode).toBe("plan-and-check-only")
    expect(bootstrap.acceptedArtifactPath).toBe(provisioningSummary.acceptedArtifactPath)
    expect(bootstrap.provisioningDecision).toMatchObject({
      strategy: "developer-or-ci-bootstrap",
      installExecuted: false,
      scriptInstallsTooling: false,
      packageLocalOnly: true,
      rootCheckDependency: false,
    })
    expect(bootstrap.acceptedProvisioning.wasmPack.command).toBe(
      provisioningSummary.acceptedProvisioning.wasmPack.command,
    )
    expect(bootstrap.acceptedProvisioning.wasm32UnknownUnknown.command).toBe(
      provisioningSummary.acceptedProvisioning.wasm32UnknownUnknown.command,
    )
    expect(typeof bootstrap.availability.wasmPackAvailable).toBe("boolean")
    expect(typeof bootstrap.availability.wasm32UnknownUnknownInstalled).toBe("boolean")
    expect(typeof bootstrap.availability.toolchainReady).toBe("boolean")
    expect(bootstrap.artifactProductionBlocked).toBe(!bootstrap.availability.toolchainReady)
    expect(bootstrap.digestPinningBlocked).toBe(true)
    expect(bootstrap.artifactProduced).toBe(false)
    expect(bootstrap.digestStatus).toBe("pending")
    expect(bootstrap.sha256).toBeNull()
    expect(bootstrap.rawEvidenceIncluded).toBe(false)
    expect(bootstrap.blockedReasons).toContain("accepted-artifact-path-not-produced")
    expect(bootstrap.blockedReasons).toContain("sha256-not-computed")
  })

  it("keeps root checks independent from provisioning and WASM tooling", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(provisioningSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresBootstrapPlan: false,
      requiresReadinessSmoke: false,
      requiresArtifact: false,
      requiresWasmBuild: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:bootstrap-plan")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(rootScripts).not.toContain("wasm:build")
  })

  it("keeps artifact production, digest pinning, and downstream evidence blocked", () => {
    expect(provisioningSummary.artifactProductionBlocked).toBe(true)
    expect(provisioningSummary.digestPinningBlocked).toBe(true)
    expect(provisioningSummary.artifactProduced).toBe(false)
    expect(provisioningSummary.artifactPointer).toBeNull()
    expect(provisioningSummary.digestStatus).toBe("pending")
    expect(provisioningSummary.sha256).toBeNull()
    expect(provisioningSummary.rawEvidenceIncluded).toBe(false)
    expect(provisioningSummary.productionReady).toBe(false)
    expect(provisioningSummary.defaultMeasurerReplacement).toBe(false)
    expect(provisioningSummary.nativeEvidenceStatus).toBe("blocked")
    expect(provisioningSummary.wasmEvidenceStatus).toBe("blocked")
    expect(provisioningSummary.nativeWasmParityStatus).toBe("not-run")
    expect(provisioningSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(provisioningSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(provisioningSummary.acceptedManifestStatus).toBe("blocked")
    expect(provisioningSummary.nextRecommendedWork).toBe(
      "Text Engine WASM Toolchain Provisioning Execution Gate",
    )
    expect(provisioningSummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-toolchain-provisioning-bootstrap")
    expect(coreMeasurement).not.toContain("wasm-toolchain-provisioning-bootstrap")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the provisioning bootstrap gate and keeps digest pinning blocked", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM toolchain provisioning bootstrap gate.",
    )
    expect(doc).toContain("cargo install wasm-pack --locked")
    expect(doc).toContain("rustup target add wasm32-unknown-unknown")
    expect(doc).toContain("Text Engine WASM Toolchain Provisioning Execution Gate")
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
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain(
      "Status: current after Text Engine WASM Artifact Production Retry Gate.",
    )
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Phase 196: Artifact Digest Pinning Execution remains blocked.")
    expect(readme).toContain("Text engine WASM toolchain provisioning bootstrap gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md")
    expect(packageReadme).toContain("Status: WASM artifact production retry package.")
    expect(ledger).toContain(
      "| 195A | Text engine WASM toolchain provisioning bootstrap gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195A Text Engine WASM Toolchain Provisioning Bootstrap Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195A: Text Engine WASM Toolchain Provisioning Bootstrap Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195E:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
