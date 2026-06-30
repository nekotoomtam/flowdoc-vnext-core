import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocTextEngineRuntimeIdentityDigestRootSummary } from "../packages/text-engine-rust-wasm/src/index.js"

type BuildOutputSummary = {
  buildOutputSummaryId: string
  sourcePinningSummaryId: string
  builderOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  acceptedArtifactPath: string
  acceptedArtifactPathStatus: "defined-not-produced"
  acceptedBuild: {
    workingDirectory: string
    command: string
    commandStatus: "blocked-not-runnable"
    outputPath: string
  }
  environmentChecks: {
    cargo: {
      available: boolean
      observedCommand: string
    }
    wasmPack: {
      available: boolean
      observedCommand: string
      blocker: string
    }
    rustTargets: {
      installed: string[]
      wasm32UnknownUnknownInstalled: boolean
      blocker: string
    }
    crateShape: {
      cratePath: string
      hasCargoToml: boolean
      hasMainRs: boolean
      hasLibRs: boolean
      hasCdylibCrateType: boolean
      wasmReady: boolean
      blockers: string[]
    }
  }
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
  blockers: string[]
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

type PinningSummary = {
  pinningSummaryId: string
  acceptedArtifactPath: string
  artifactFound: boolean
  canPinDigestNow: boolean
  digestStatus: "pending" | "pinned"
  sha256: string | null
  wasmArtifactPointer: string | null
  rawEvidenceIncluded: boolean
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
}

type PackageJson = {
  scripts?: Record<string, string>
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

const buildOutputSummary = readJson<BuildOutputSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json",
)

const pinningSummary = readJson<PinningSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json",
)

describe("text engine WASM artifact build output gate", () => {
  it("defines the accepted package-local WASM output path and command as metadata only", () => {
    expect(buildOutputSummary.buildOutputSummaryId).toBe(
      "text-engine-wasm-artifact-build-output-v1",
    )
    expect(buildOutputSummary.sourcePinningSummaryId).toBe(
      "text-engine-wasm-artifact-digest-pinning-v1",
    )
    expect(buildOutputSummary.acceptedArtifactPath).toBe(
      "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    )
    expect(buildOutputSummary.acceptedArtifactPathStatus).toBe("defined-not-produced")
    expect(buildOutputSummary.acceptedBuild).toEqual({
      workingDirectory: "packages/text-engine-rust-wasm",
      command: "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
      commandStatus: "blocked-not-runnable",
      outputPath: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    })
    expect(buildOutputSummary.artifactProduced).toBe(false)
  })

  it("records the exact environment and crate-shape blockers before artifact output", () => {
    expect(buildOutputSummary.environmentChecks.cargo).toEqual({
      available: true,
      observedCommand: "cargo",
    })
    expect(buildOutputSummary.environmentChecks.wasmPack).toEqual({
      available: false,
      observedCommand: "wasm-pack",
      blocker: "wasm-pack-not-available",
    })
    expect(buildOutputSummary.environmentChecks.rustTargets).toEqual({
      installed: ["x86_64-pc-windows-msvc"],
      wasm32UnknownUnknownInstalled: false,
      blocker: "wasm32-unknown-unknown-target-not-installed",
    })
    expect(buildOutputSummary.environmentChecks.crateShape).toMatchObject({
      cratePath: "packages/text-engine-rust-wasm/rust-shaper",
      hasCargoToml: true,
      hasMainRs: true,
      hasLibRs: false,
      hasCdylibCrateType: false,
      wasmReady: false,
    })
    expect(buildOutputSummary.environmentChecks.crateShape.blockers).toEqual([
      "binary-only-rust-smoke-crate",
      "missing-lib-rs",
      "missing-cdylib-crate-type",
      "missing-wasm-bindgen-export",
    ])
    expect(repoPathExists("packages/text-engine-rust-wasm/rust-shaper/Cargo.toml")).toBe(true)
    expect(repoPathExists("packages/text-engine-rust-wasm/rust-shaper/src/main.rs")).toBe(true)
    expect(buildOutputSummary.environmentChecks.crateShape.hasLibRs).toBe(false)
  })

  it("keeps artifact production and digest pinning blocked until a real artifact exists", () => {
    expect(buildOutputSummary.canProduceArtifactNow).toBe(false)
    expect(buildOutputSummary.artifactProduced).toBe(false)
    expect(buildOutputSummary.artifactPointer).toBeNull()
    expect(buildOutputSummary.digestStatus).toBe("pending")
    expect(buildOutputSummary.sha256).toBeNull()
    expect(buildOutputSummary.rawEvidenceIncluded).toBe(false)
    expect(buildOutputSummary.productionReady).toBe(false)
    expect(buildOutputSummary.defaultMeasurerReplacement).toBe(false)
    expect(buildOutputSummary.blockers).toEqual([
      "wasm-pack-not-available",
      "wasm32-unknown-unknown-target-not-installed",
      "binary-only-rust-smoke-crate",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])

    expect(pinningSummary.artifactFound).toBe(true)
    expect(pinningSummary.canPinDigestNow).toBe(true)
    expect(pinningSummary.digestStatus).toBe("pinned")
    expect(pinningSummary.sha256).toMatch(/^[a-f0-9]{64}$/u)
    expect(pinningSummary.wasmArtifactPointer).toBe(
      "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
    )
  })

  it("links the Phase 191 historical summary back to the pinning policy context", () => {
    expect(buildOutputSummary.sourcePinningSummaryId).toBe(pinningSummary.pinningSummaryId)
    expect(buildOutputSummary.acceptedArtifactPath).toBe(pinningSummary.acceptedArtifactPath)
    expect(buildOutputSummary.rootSummary.matrixId).toBe(pinningSummary.rootSummary.matrixId)
    expect(buildOutputSummary.rootSummary.corpusId).toBe(pinningSummary.rootSummary.corpusId)
    expect(buildOutputSummary.rootSummary.policyRevision).toBe(pinningSummary.rootSummary.policyRevision)
    expect(buildOutputSummary.rootSummary.measurementProfileId).toBe(
      pinningSummary.rootSummary.measurementProfileId,
    )
    expect(buildOutputSummary.rootSummary.outputShapeVersion).toBe(
      pinningSummary.rootSummary.outputShapeVersion,
    )
    expect(buildOutputSummary.rootSummary.digestStatus).toBe("pending")
    expect(buildOutputSummary.rootSummary.wasmArtifact.sha256).toBeNull()
    expect(buildOutputSummary.rootSummary.retention.wasmArtifactEvidence).toEqual({
      owner: "@flowdoc/text-engine-rust-wasm",
      pointer: null,
      includedInRoot: false,
    })
  })

  it("keeps root docs/tests JSON-safe and downstream evidence lanes blocked", () => {
    expect(buildOutputSummary.nativeEvidenceStatus).toBe("blocked")
    expect(buildOutputSummary.wasmEvidenceStatus).toBe("blocked")
    expect(buildOutputSummary.nativeWasmParityStatus).toBe("not-run")
    expect(buildOutputSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(buildOutputSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(buildOutputSummary.acceptedManifestStatus).toBe("blocked")
    expect(buildOutputSummary.rootSummary.rawEvidenceIncluded).toBe(false)
    expect(buildOutputSummary.rootSummary.blockedUntilLater).toEqual({
      nativeEvidence: true,
      wasmEvidence: true,
      paritySummaries: true,
      rendererBackedDriftSummaries: true,
      numericDriftThresholds: true,
      acceptedSummaryManifest: true,
    })

    const serialized = JSON.stringify(buildOutputSummary)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")
  })

  it("does not make root checks require the package-local WASM build script or execute external engines in core", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")
    const rootPackageJson = readJson<PackageJson>("../package.json")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(packageJson.scripts?.["rustybuzz:build"]).toBe(
      "cargo build --manifest-path rust-shaper/Cargo.toml",
    )
    expect(packageJson.scripts?.["wasm:build"]).toBe(
      buildOutputSummary.acceptedBuild.command,
    )
    expect(Object.values(rootPackageJson.scripts ?? {}).join(" ")).not.toContain("wasm-pack")
    expect(Object.values(rootPackageJson.scripts ?? {}).join(" ")).not.toContain("wasm32-unknown-unknown")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-artifact-build-output")
    expect(coreMeasurement).not.toContain("wasm-artifact-build-output")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 191 and advances current pointers to Phase 192", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 191 text engine WASM artifact build output gate.")
    expect(doc).toContain("wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine")
    expect(doc).toContain("Decision: `blocked-not-runnable`.")
    expect(doc).toContain("Proceed to Phase 192: Text Engine WASM Build Toolchain Readiness Gate.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Variable Schema Metadata Shape Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Variable Schema Metadata Shape Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(readme).toContain("Text engine WASM artifact build output gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md")
    expect(ledger).toContain("| 191 | Text engine WASM artifact build output gate | done |")
    expect(ledger).toContain("## Phase 191 Text Engine WASM Artifact Build Output Gate")
    expect(roadmap).toContain("## Phase 191: Text Engine WASM Artifact Build Output Gate")
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
