import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

type AcquisitionSummary = {
  acquisitionSummaryId: string
  sourceReadinessSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  wasmPackAcquisition: {
    availabilityPath: "developer-or-ci-bootstrap"
    provisioningScope: "package-local-toolchain-only"
    recommendedProvisioningCommand: string
    rootCheckDependency: boolean
    currentStatus: "unavailable"
    currentVersion: string | null
    versionPolicy: {
      status: "pending-until-installed"
      pinExactVersionBeforeArtifactProduction: boolean
      versionCaptureCommand: string
      versionSource: string
      acceptedVersionRange: string | null
      unknownVersionBlocksArtifactProduction: boolean
    }
  }
  rustupTargetProvisioning: {
    target: "wasm32-unknown-unknown"
    availabilityPath: "developer-or-ci-bootstrap"
    provisioningScope: "package-local-toolchain-only"
    provisioningCommand: string
    rootCheckDependency: boolean
    currentStatus: "missing"
    installedTargets: string[]
    targetRequiredBeforeArtifactProduction: boolean
  }
  diagnostic: {
    scriptPath: string
    packageScript: "wasm:check-toolchain"
    command: string
    workingDirectory: string
    summaryId: string
    exitPolicy: "always-zero"
    reportsUnavailableWithoutFailure: boolean
    jsonSafe: boolean
    rawEvidenceIncluded: boolean
    rootCheckRequiresDiagnostic: boolean
  }
  currentObservedToolchain: {
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
    requiresDiagnostic: boolean
    requiresArtifact: boolean
  }
  artifactPolicy: {
    canProduceArtifactNow: boolean
    artifactProduced: boolean
    artifactPointer: string | null
    artifactProductionStatus: string
    fakeArtifactAllowed: boolean
  }
  digestPolicy: {
    digestStatus: "pending"
    sha256: string | null
    pinningStatus: string
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
    wasmToolchainDiagnosticPointer: string
    wasmArtifactPointer: string | null
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedPhase: string
}

type ReadinessSummary = {
  readinessSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath?: string
}

type PackageJson = {
  scripts: Record<string, string>
}

type DiagnosticOutput = {
  summaryId: string
  diagnosticExitPolicy: "always-zero"
  rootCheckRequiresWasmPack: boolean
  rootCheckRequiresWasmTarget: boolean
  acceptedBuildPath: "wasm-pack"
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

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

function repoPathExists(path: string): boolean {
  return existsSync(new URL(`../${path}`, import.meta.url))
}

const acquisitionSummary = readJson<AcquisitionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json",
)

const readinessSummary = readJson<ReadinessSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json",
)

describe("text engine WASM toolchain acquisition gate", () => {
  it("defines wasm-pack acquisition and version policy outside root checks", () => {
    expect(acquisitionSummary.acquisitionSummaryId).toBe(
      "text-engine-wasm-toolchain-acquisition-v1",
    )
    expect(acquisitionSummary.sourceReadinessSummaryId).toBe(
      readinessSummary.readinessSummaryId,
    )
    expect(acquisitionSummary.acceptedArtifactPath).toBe(readinessSummary.acceptedArtifactPath)
    expect(acquisitionSummary.acceptedBuildPath).toBe("wasm-pack")
    expect(acquisitionSummary.wasmPackAcquisition).toMatchObject({
      availabilityPath: "developer-or-ci-bootstrap",
      provisioningScope: "package-local-toolchain-only",
      recommendedProvisioningCommand: "cargo install wasm-pack --locked",
      rootCheckDependency: false,
      currentStatus: "unavailable",
      currentVersion: null,
    })
    expect(acquisitionSummary.wasmPackAcquisition.versionPolicy).toEqual({
      status: "pending-until-installed",
      pinExactVersionBeforeArtifactProduction: true,
      versionCaptureCommand: "wasm-pack --version",
      versionSource: "package-local diagnostic summary",
      acceptedVersionRange: null,
      unknownVersionBlocksArtifactProduction: true,
    })
  })

  it("defines rustup target provisioning without making root checks install it", () => {
    expect(acquisitionSummary.rustupTargetProvisioning).toEqual({
      target: "wasm32-unknown-unknown",
      availabilityPath: "developer-or-ci-bootstrap",
      provisioningScope: "package-local-toolchain-only",
      provisioningCommand: "rustup target add wasm32-unknown-unknown",
      rootCheckDependency: false,
      currentStatus: "missing",
      installedTargets: ["x86_64-pc-windows-msvc"],
      targetRequiredBeforeArtifactProduction: true,
    })
    expect(acquisitionSummary.currentObservedToolchain).toEqual({
      cargoAvailable: true,
      rustupAvailable: true,
      wasmPackAvailable: false,
      wasmBindgenCliAvailable: false,
      wasm32UnknownUnknownInstalled: false,
      toolchainReady: false,
    })
  })

  it("adds a package-local diagnostic script that reports unavailable tooling without failing", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")
    const scriptSource = readText("../packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs")

    expect(acquisitionSummary.diagnostic).toMatchObject({
      scriptPath: "packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs",
      packageScript: "wasm:check-toolchain",
      command: "npm run wasm:check-toolchain",
      workingDirectory: "packages/text-engine-rust-wasm",
      summaryId: "text-engine-wasm-toolchain-diagnostic-v1",
      exitPolicy: "always-zero",
      reportsUnavailableWithoutFailure: true,
      jsonSafe: true,
      rawEvidenceIncluded: false,
      rootCheckRequiresDiagnostic: false,
    })
    expect(packageJson.scripts["wasm:check-toolchain"]).toBe("node scripts/check-wasm-toolchain.mjs")
    expect(repoPathExists(acquisitionSummary.diagnostic.scriptPath)).toBe(true)
    expect(scriptSource).toContain("process.exitCode = 0")
    expect(scriptSource).toContain("wasm-pack")
    expect(scriptSource).toContain("wasm32-unknown-unknown")

    const result = spawnSync(process.execPath, [acquisitionSummary.diagnostic.scriptPath], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    })
    expect(result.status).toBe(0)
    const diagnostic = JSON.parse(result.stdout) as DiagnosticOutput
    expect(diagnostic.summaryId).toBe(acquisitionSummary.diagnostic.summaryId)
    expect(diagnostic.diagnosticExitPolicy).toBe("always-zero")
    expect(diagnostic.rootCheckRequiresWasmPack).toBe(false)
    expect(diagnostic.rootCheckRequiresWasmTarget).toBe(false)
    expect(diagnostic.acceptedBuildPath).toBe("wasm-pack")
    expect(diagnostic.acceptedArtifactPath).toBe(acquisitionSummary.acceptedArtifactPath)
    expect(diagnostic.rawEvidenceIncluded).toBe(false)
    expect(diagnostic.artifactProduced).toBe(false)
    expect(diagnostic.digestStatus).toBe("pending")
    expect(diagnostic.sha256).toBeNull()
    expect(typeof diagnostic.wasmPackAvailable).toBe("boolean")
    expect(typeof diagnostic.wasm32UnknownUnknownInstalled).toBe("boolean")
    expect(typeof diagnostic.toolchainReady).toBe("boolean")
    if (diagnostic.wasmPackAvailable && diagnostic.wasm32UnknownUnknownInstalled) {
      expect(diagnostic.toolchainReady).toBe(true)
      expect(diagnostic.blockedReasons).toEqual([])
    } else {
      expect(diagnostic.toolchainReady).toBe(false)
      expect(diagnostic.blockedReasons.length).toBeGreaterThan(0)
    }
  })

  it("keeps root checks independent from wasm-pack, target provisioning, diagnostics, and artifacts", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(acquisitionSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresDiagnostic: false,
      requiresArtifact: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:check-toolchain")
    expect(acquisitionSummary.artifactPolicy.artifactProduced).toBe(false)
  })

  it("keeps artifact production, digest pinning, evidence, and default measurement blocked", () => {
    expect(acquisitionSummary.artifactPolicy).toEqual({
      canProduceArtifactNow: false,
      artifactProduced: false,
      artifactPointer: null,
      artifactProductionStatus: "blocked-until-toolchain-available",
      fakeArtifactAllowed: false,
    })
    expect(acquisitionSummary.digestPolicy).toEqual({
      digestStatus: "pending",
      sha256: null,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
    expect(acquisitionSummary.rawEvidenceIncluded).toBe(false)
    expect(acquisitionSummary.productionReady).toBe(false)
    expect(acquisitionSummary.defaultMeasurerReplacement).toBe(false)
    expect(acquisitionSummary.nativeEvidenceStatus).toBe("blocked")
    expect(acquisitionSummary.wasmEvidenceStatus).toBe("blocked")
    expect(acquisitionSummary.nativeWasmParityStatus).toBe("not-run")
    expect(acquisitionSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(acquisitionSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(acquisitionSummary.acceptedManifestStatus).toBe("blocked")
    expect(acquisitionSummary.blockers).toEqual([
      "wasm-pack-not-available",
      "wasm-pack-version-unpinned",
      "wasm32-unknown-unknown-target-not-installed",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(acquisitionSummary.jsonSafeRootSummary).toMatchObject({
      wasmToolchainDiagnosticPointer: "packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs",
      wasmArtifactPointer: null,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-toolchain-acquisition")
    expect(coreMeasurement).not.toContain("wasm-toolchain-acquisition")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 193 and advances current pointers to Phase 194", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 193 text engine WASM toolchain acquisition gate.")
    expect(doc).toContain("cargo install wasm-pack --locked")
    expect(doc).toContain("rustup target add wasm32-unknown-unknown")
    expect(doc).toContain("Proceed to Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Template Publish Accepted Version Metadata Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Template Publish Accepted Version Metadata Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(readme).toContain("Text engine WASM toolchain acquisition gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md")
    expect(ledger).toContain("| 193 | Text engine WASM toolchain acquisition gate | done |")
    expect(ledger).toContain("## Phase 193 Text Engine WASM Toolchain Acquisition Gate")
    expect(roadmap).toContain("## Phase 193: Text Engine WASM Toolchain Acquisition Gate")
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
