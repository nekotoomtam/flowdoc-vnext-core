import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type ReadinessSummary = {
  readinessSummaryId: string
  sourceBuildOutputSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildDecision: {
    acceptedPath: "wasm-pack"
    decisionStatus: "accepted-blocked-by-toolchain"
    workingDirectory: string
    command: string
    directCargoWasmBindgen: {
      status: "deferred-alternate"
      blocker: string
    }
  }
  toolchainChecks: {
    cargo: {
      available: boolean
      observedCommand: string
    }
    wasmPack: {
      available: boolean
      observedCommand: string
      blocker: string
    }
    wasmBindgenCli: {
      available: boolean
      observedCommand: string
      status: string
    }
    rustTargets: {
      installed: string[]
      wasm32UnknownUnknownInstalled: boolean
      blocker: string
    }
    rootCheckRequiresWasmPack: boolean
    rootCheckRequiresWasmTarget: boolean
  }
  crateTargetReadiness: {
    cratePath: string
    hasCargoToml: boolean
    hasMainRs: boolean
    hasLibRs: boolean
    nativeMainSmokePathIntact: boolean
    libName: string
    crateTypes: string[]
    minimalBoundaryExports: string[]
    rustybuzzExecutionInLib: boolean
    wasmBindgenDependencyAdded: boolean
    targetShapeStatus: "minimal-ready"
    remainingCrateBlockers: string[]
  }
  packageScripts: {
    rustybuzzBuild: string
    wasmBuild: string
    wasmBuildStatus: "package-local-metadata-only"
    rootCheckRequiresWasmBuild: boolean
  }
  toolchainReady: boolean
  crateTargetShapeReady: boolean
  canProduceArtifactNow: boolean
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
  artifactBlockers: string[]
  jsonSafeRootSummary: {
    runtimeIdentityPointer: string
    wasmArtifactPointer: string | null
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedPhase: string
}

type BuildOutputSummary = {
  buildOutputSummaryId: string
  acceptedArtifactPath: string
  acceptedBuild: {
    command: string
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

const readinessSummary = readJson<ReadinessSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json",
)

const buildOutputSummary = readJson<BuildOutputSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json",
)

describe("text engine WASM build toolchain readiness gate", () => {
  it("accepts wasm-pack for the package-local pkg output while deferring direct cargo plus wasm-bindgen", () => {
    expect(readinessSummary.readinessSummaryId).toBe(
      "text-engine-wasm-build-toolchain-readiness-v1",
    )
    expect(readinessSummary.sourceBuildOutputSummaryId).toBe(
      buildOutputSummary.buildOutputSummaryId,
    )
    expect(readinessSummary.acceptedArtifactPath).toBe(buildOutputSummary.acceptedArtifactPath)
    expect(readinessSummary.acceptedBuildDecision).toMatchObject({
      acceptedPath: "wasm-pack",
      decisionStatus: "accepted-blocked-by-toolchain",
      workingDirectory: "packages/text-engine-rust-wasm",
      command: buildOutputSummary.acceptedBuild.command,
    })
    expect(readinessSummary.acceptedBuildDecision.directCargoWasmBindgen).toEqual({
      status: "deferred-alternate",
      blocker: "wasm-bindgen-cli-not-available",
      reason:
        "direct cargo plus wasm-bindgen would require separate CLI/package metadata sequencing and does not replace the accepted pkg output path in this gate",
    })
  })

  it("records toolchain blockers without making root checks depend on WASM tooling", () => {
    const rootPackage = readJson<PackageJson>("../package.json")

    expect(readinessSummary.toolchainChecks.cargo).toEqual({
      available: true,
      observedCommand: "cargo",
    })
    expect(readinessSummary.toolchainChecks.wasmPack).toEqual({
      available: false,
      observedCommand: "wasm-pack",
      blocker: "wasm-pack-not-available",
    })
    expect(readinessSummary.toolchainChecks.wasmBindgenCli).toEqual({
      available: false,
      observedCommand: "wasm-bindgen",
      status: "alternate-path-unavailable",
    })
    expect(readinessSummary.toolchainChecks.rustTargets).toEqual({
      installed: ["x86_64-pc-windows-msvc"],
      wasm32UnknownUnknownInstalled: false,
      blocker: "wasm32-unknown-unknown-target-not-installed",
    })
    expect(readinessSummary.toolchainChecks.rootCheckRequiresWasmPack).toBe(false)
    expect(readinessSummary.toolchainChecks.rootCheckRequiresWasmTarget).toBe(false)
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(Object.values(rootPackage.scripts).join(" ")).not.toContain("wasm-pack")
    expect(Object.values(rootPackage.scripts).join(" ")).not.toContain("wasm32-unknown-unknown")
  })

  it("adds only a minimal WASM-ready crate target shape while keeping native smoke intact", () => {
    const cargoToml = readText("../packages/text-engine-rust-wasm/rust-shaper/Cargo.toml")
    const libSource = readText("../packages/text-engine-rust-wasm/rust-shaper/src/lib.rs")
    const mainSource = readText("../packages/text-engine-rust-wasm/rust-shaper/src/main.rs")

    expect(readinessSummary.crateTargetReadiness).toMatchObject({
      cratePath: "packages/text-engine-rust-wasm/rust-shaper",
      hasCargoToml: true,
      hasMainRs: true,
      hasLibRs: true,
      nativeMainSmokePathIntact: true,
      libName: "flowdoc_text_engine",
      crateTypes: ["cdylib", "rlib"],
      rustybuzzExecutionInLib: false,
      wasmBindgenDependencyAdded: false,
      targetShapeStatus: "minimal-ready",
      remainingCrateBlockers: [],
    })
    expect(cargoToml).toContain("[lib]")
    expect(cargoToml).toContain('name = "flowdoc_text_engine"')
    expect(cargoToml).toContain('crate-type = ["cdylib", "rlib"]')
    expect(cargoToml).toContain('path = "src/lib.rs"')
    expect(libSource).toContain("FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION")
    expect(libSource).toContain("flowdoc_text_engine_wasm_readiness_marker")
    expect(libSource).toContain("flowdoc_text_engine_wasm_boundary_version")
    expect(libSource).not.toContain("rustybuzz::")
    expect(libSource).toContain("wasm_bindgen")
    expect(mainSource).toContain("rustybuzz::shape(&face, &[], buffer)")
    expect(repoPathExists("packages/text-engine-rust-wasm/rust-shaper/src/lib.rs")).toBe(true)
  })

  it("adds package-local build script metadata without producing or pinning an artifact", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")

    expect(packageJson.scripts["rustybuzz:build"]).toBe(
      "cargo build --manifest-path rust-shaper/Cargo.toml",
    )
    expect(packageJson.scripts["wasm:build"]).toBe(
      "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
    )
    expect(readinessSummary.packageScripts).toEqual({
      rustybuzzBuild: "cargo build --manifest-path rust-shaper/Cargo.toml",
      wasmBuild: "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
      wasmBuildStatus: "package-local-metadata-only",
      rootCheckRequiresWasmBuild: false,
    })
    expect(readinessSummary.toolchainReady).toBe(false)
    expect(readinessSummary.crateTargetShapeReady).toBe(true)
    expect(readinessSummary.canProduceArtifactNow).toBe(false)
    expect(readinessSummary.artifactProduced).toBe(false)
    expect(readinessSummary.artifactPointer).toBeNull()
    expect(readinessSummary.digestStatus).toBe("pending")
    expect(readinessSummary.sha256).toBeNull()
    expect(readinessSummary.artifactProduced).toBe(false)
  })

  it("keeps root summaries JSON-safe and downstream evidence lanes blocked", () => {
    expect(readinessSummary.rawEvidenceIncluded).toBe(false)
    expect(readinessSummary.productionReady).toBe(false)
    expect(readinessSummary.defaultMeasurerReplacement).toBe(false)
    expect(readinessSummary.nativeEvidenceStatus).toBe("blocked")
    expect(readinessSummary.wasmEvidenceStatus).toBe("blocked")
    expect(readinessSummary.nativeWasmParityStatus).toBe("not-run")
    expect(readinessSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(readinessSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(readinessSummary.acceptedManifestStatus).toBe("blocked")
    expect(readinessSummary.artifactBlockers).toEqual([
      "wasm-pack-not-available",
      "wasm32-unknown-unknown-target-not-installed",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(readinessSummary.jsonSafeRootSummary).toMatchObject({
      runtimeIdentityPointer: "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
      wasmArtifactPointer: null,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })

    const serialized = JSON.stringify(readinessSummary)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-build-toolchain-readiness")
    expect(coreMeasurement).not.toContain("wasm-build-toolchain-readiness")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 192 and advances current pointers to Phase 193", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 192 text engine WASM build toolchain readiness gate.")
    expect(doc).toContain("Decision: `wasm-pack` is the accepted path.")
    expect(doc).toContain("Crate target shape status: `minimal-ready`.")
    expect(doc).toContain("Proceed to Phase 193: Text Engine WASM Toolchain Acquisition Gate.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Measurement Hardening Close Audit.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Measurement Hardening Close Audit.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(readme).toContain("Text engine WASM build toolchain readiness gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md")
    expect(ledger).toContain("| 192 | Text engine WASM build toolchain readiness gate | done |")
    expect(ledger).toContain("## Phase 192 Text Engine WASM Build Toolchain Readiness Gate")
    expect(roadmap).toContain("## Phase 192: Text Engine WASM Build Toolchain Readiness Gate")
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
