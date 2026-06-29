import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type BindgenExportDependencySummary = {
  bindgenExportDependencySummaryId: string
  sourceArtifactProductionRetrySummaryId: string
  sourceRustUpgradeExecutionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  dependencyDecision: {
    dependencyName: "wasm-bindgen"
    requestedVersion: "0.2"
    resolvedVersion: string
    manifestPath: string
    lockfilePath: string
    status: "added-package-local"
    rootCheckDependency: boolean
    productionBinding: boolean
  }
  exportBoundary: {
    sourcePath: string
    status: "minimal-non-production"
    exports: Array<{
      name: string
      kind: "wasm-bindgen-function"
      returns: string
      executesRustybuzz: boolean
      executesIcu4x: boolean
    }>
    boundaryVersion: string
    noShapingExecution: boolean
    noProductionMeasurementBinding: boolean
  }
  nativeSmokePath: {
    sourcePath: string
    status: "intact"
    stillOwnsRustybuzzSmokeExecution: boolean
    wasmLibDoesNotCallNativeMain: boolean
  }
  verification: {
    wasmTargetCheckCommand: string
    wasmTargetCheckExitCode: number
    nativeCheckCommand: string
    nativeCheckExitCode: number
    wasmBuildRetriedThisPhase: boolean
    artifactExists: boolean
    rawOutputIncluded: boolean
  }
  rootCheck: {
    requiresWasmBindgen: boolean
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresReadinessSmoke: boolean
    requiresWasmBuild: boolean
    requiresArtifact: boolean
    requiresBindgenExportDependencyGate: boolean
  }
  artifactPolicy: {
    artifactProductionBlocked: boolean
    canRetryArtifactProduction: boolean
    retryPhaseRequired: boolean
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
    bindgenExportDependencySummaryPointer: string
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

type ArtifactProductionRetrySummary = {
  productionRetrySummaryId: string
  sourceRustUpgradeExecutionSummaryId: string
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

const bindgenSummary = readJson<BindgenExportDependencySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json",
)

const retrySummary = readJson<ArtifactProductionRetrySummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json",
)

describe("text engine WASM bindgen export dependency gate", () => {
  it("links the bindgen decision to the artifact production retry source", () => {
    expect(bindgenSummary.bindgenExportDependencySummaryId).toBe(
      "text-engine-wasm-bindgen-export-dependency-v1",
    )
    expect(bindgenSummary.sourceArtifactProductionRetrySummaryId).toBe(
      retrySummary.productionRetrySummaryId,
    )
    expect(bindgenSummary.sourceRustUpgradeExecutionSummaryId).toBe(
      retrySummary.sourceRustUpgradeExecutionSummaryId,
    )
    expect(bindgenSummary.sourceDiagnosticSummaryId).toBe(
      retrySummary.sourceDiagnosticSummaryId,
    )
    expect(bindgenSummary.acceptedArtifactPath).toBe(retrySummary.acceptedArtifactPath)
    expect(bindgenSummary.acceptedBuildPath).toBe(retrySummary.acceptedBuildPath)
  })

  it("adds wasm-bindgen package-locally and records the lockfile version", () => {
    const cargoToml = readText("../packages/text-engine-rust-wasm/rust-shaper/Cargo.toml")
    const cargoLock = readText("../packages/text-engine-rust-wasm/rust-shaper/Cargo.lock")
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(bindgenSummary.dependencyDecision).toMatchObject({
      dependencyName: "wasm-bindgen",
      requestedVersion: "0.2",
      resolvedVersion: "0.2.126",
      manifestPath: "packages/text-engine-rust-wasm/rust-shaper/Cargo.toml",
      lockfilePath: "packages/text-engine-rust-wasm/rust-shaper/Cargo.lock",
      status: "added-package-local",
      rootCheckDependency: false,
      productionBinding: false,
    })
    expect(cargoToml).toContain('wasm-bindgen = "0.2"')
    expect(cargoLock).toContain('name = "wasm-bindgen"')
    expect(cargoLock).toContain('version = "0.2.126"')
    expect(rootScripts).not.toContain("wasm-bindgen")
    expect(rootScripts).not.toContain("wasm-pack")
  })

  it("defines only the minimal non-production wasm-bindgen exports", () => {
    const libSource = readText("../packages/text-engine-rust-wasm/rust-shaper/src/lib.rs")

    expect(bindgenSummary.exportBoundary).toMatchObject({
      sourcePath: "packages/text-engine-rust-wasm/rust-shaper/src/lib.rs",
      status: "minimal-non-production",
      boundaryVersion: "flowdoc-text-engine-wasm-boundary-v1",
      noShapingExecution: true,
      noProductionMeasurementBinding: true,
    })
    expect(bindgenSummary.exportBoundary.exports.map((entry) => entry.name)).toEqual([
      "flowdoc_text_engine_wasm_readiness_marker",
      "flowdoc_text_engine_wasm_boundary_version",
    ])
    expect(
      bindgenSummary.exportBoundary.exports.every(
        (entry) =>
          entry.kind === "wasm-bindgen-function" &&
          entry.executesRustybuzz === false &&
          entry.executesIcu4x === false,
      ),
    ).toBe(true)
    expect(libSource).toContain("use wasm_bindgen::prelude::wasm_bindgen")
    expect(libSource.match(/#\[wasm_bindgen\]/g)?.length).toBe(2)
    expect(libSource).toContain("flowdoc_text_engine_wasm_readiness_marker")
    expect(libSource).toContain("flowdoc_text_engine_wasm_boundary_version")
    expect(libSource).toContain("flowdoc-text-engine-wasm-boundary-v1")
    expect(libSource).not.toContain("rustybuzz::shape")
    expect(libSource).not.toContain("UnicodeBuffer")
  })

  it("keeps the native rustybuzz smoke path intact", () => {
    const mainSource = readText("../packages/text-engine-rust-wasm/rust-shaper/src/main.rs")

    expect(bindgenSummary.nativeSmokePath).toEqual({
      sourcePath: "packages/text-engine-rust-wasm/rust-shaper/src/main.rs",
      status: "intact",
      stillOwnsRustybuzzSmokeExecution: true,
      wasmLibDoesNotCallNativeMain: true,
    })
    expect(mainSource).toContain("rustybuzz::shape")
    expect(mainSource).toContain("flowdoc-rustybuzz-native-smoke")
  })

  it("records package-local compile checks without retrying artifact production", () => {
    expect(bindgenSummary.verification).toEqual({
      wasmTargetCheckCommand:
        "cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml --target wasm32-unknown-unknown",
      wasmTargetCheckExitCode: 0,
      nativeCheckCommand:
        "cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml",
      nativeCheckExitCode: 0,
      wasmBuildRetriedThisPhase: false,
      artifactExists: false,
      rawOutputIncluded: false,
    })
    expect(bindgenSummary.artifactPolicy.artifactProduced).toBe(false)
  })

  it("keeps root checks independent, artifacts absent, and digest pending", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(bindgenSummary.rootCheck).toEqual({
      requiresWasmBindgen: false,
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresReadinessSmoke: false,
      requiresWasmBuild: false,
      requiresArtifact: false,
      requiresBindgenExportDependencyGate: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-bindgen")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm:build")
    expect(bindgenSummary.artifactPolicy).toMatchObject({
      artifactProductionBlocked: false,
      canRetryArtifactProduction: true,
      retryPhaseRequired: true,
      artifactProduced: false,
      artifactExists: false,
      artifactPointer: null,
      fileSizeBytes: null,
      fakeArtifactAllowed: false,
      producedThisPhase: false,
    })
    expect(bindgenSummary.digestPolicy).toEqual({
      digestPinningBlocked: true,
      digestStatus: "pending",
      sha256: null,
      sha256ComputedThisPhase: false,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
    })
  })

  it("keeps downstream measurement evidence and production binding blocked", () => {
    expect(bindgenSummary.rawEvidenceIncluded).toBe(false)
    expect(bindgenSummary.productionReady).toBe(false)
    expect(bindgenSummary.defaultMeasurerReplacement).toBe(false)
    expect(bindgenSummary.nativeEvidenceStatus).toBe("blocked")
    expect(bindgenSummary.wasmEvidenceStatus).toBe("blocked")
    expect(bindgenSummary.nativeWasmParityStatus).toBe("not-run")
    expect(bindgenSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(bindgenSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(bindgenSummary.acceptedManifestStatus).toBe("blocked")
    expect(bindgenSummary.resolvedBlockers).toEqual([
      "wasm-bindgen-dependency-missing-from-rust-shaper-cargo-toml",
    ])
    expect(bindgenSummary.blockers).toEqual([
      "artifact-production-retry-not-yet-run-after-bindgen",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(bindgenSummary.nextRecommendedWork).toBe(
      "Text Engine WASM Artifact Production Retry Gate",
    )
    expect(bindgenSummary.artifactProductionRetryRule).toBe(
      "retry-after-bindgen-export-dependency-gate",
    )
    expect(bindgenSummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
  })

  it("documents the bindgen gate and points next back to artifact production retry", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const packageReadme = readText("../packages/text-engine-rust-wasm/README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: text engine WASM bindgen export dependency gate.",
    )
    expect(doc).toContain('wasm-bindgen = "0.2"')
    expect(doc).toContain("wasm-bindgen 0.2.126")
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
      "Status: updated after Native Evidence Summary Gate.",
    )
    expect(currentStatus).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(currentStatus).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(nextPointer).toContain(
      "Status: current after Native Evidence Summary Gate.",
    )
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(readme).toContain("Text engine WASM bindgen export dependency gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md")
    expect(packageReadme).toContain("Status: native evidence summary metadata package.")
    expect(ledger).toContain(
      "| 195F | Text engine WASM bindgen export dependency gate | done |",
    )
    expect(ledger).toContain(
      "## Phase 195F Text Engine WASM Bindgen Export Dependency Gate",
    )
    expect(roadmap).toContain(
      "## Phase 195F: Text Engine WASM Bindgen Export Dependency Gate",
    )
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195E Handoff")
  })
})
