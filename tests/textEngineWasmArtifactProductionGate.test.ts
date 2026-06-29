import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

type ArtifactProductionSummary = {
  productionSummaryId: string
  sourceReadinessSmokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  acceptedBuild: {
    workingDirectory: string
    packageScript: "wasm:build"
    command: string
    underlyingCommand: string
    outputDirectory: string
    outputArtifactPath: string
    runStatus: "not-run-toolchain-unavailable"
    rootCheckRequiresBuild: boolean
  }
  readinessSource: {
    smokeStatus: "completed-blocked"
    smokeExitPolicy: "always-zero"
    lastObservedSmokeExitCode: number
    availabilityStatus: "unavailable-blocked"
    cargoAvailable: boolean
    rustupAvailable: boolean
    wasmPackAvailable: boolean
    wasmPackVersion: string | null
    wasmPackVersionPolicyStatus: "pending-until-installed"
    wasmBindgenCliAvailable: boolean
    installedRustTargets: string[]
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    canProduceArtifactNow: boolean
    readinessSmokeBlockers: string[]
    currentDiagnosticBlockedReasons: string[]
  }
  artifact: {
    artifactProduced: boolean
    artifactExists: boolean
    artifactPointer: string | null
    retentionPointer: string | null
    fileSizeBytes: number | null
    rawArtifactIncluded: boolean
    producedOnlyUnderAcceptedPackageLocalPkgPath: boolean
    fakeArtifactAllowed: boolean
    artifactProductionStatus: "blocked-not-produced"
  }
  digest: {
    digestStatus: "pending"
    sha256: string | null
    sha256Pinned: boolean
    fakeSha256Allowed: boolean
    pinningStatus: string
    phase196ArtifactDigestPinningExecution: "blocked"
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresReadinessSmoke: boolean
    requiresArtifact: boolean
    requiresWasmBuild: boolean
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
    matrixId: string
    corpusId: string
    policyRevision: string
    runtimeIdentityManifestId: string
    runtimeIdentityPointer: string
    readinessSmokeSummaryPointer: string
    artifactProductionSummaryPointer: string
    wasmArtifactPointer: string | null
    artifactProduced: boolean
    fileSizeBytes: number | null
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedWork: string
  phase196Rule: string
}

type ReadinessSmokeSummary = {
  smokeSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  availability: {
    wasmPackAvailable: boolean
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
  }
  blockers: string[]
}

type PackageJson = {
  scripts: Record<string, string>
}

type DiagnosticOutput = {
  summaryId: string
  diagnosticExitPolicy: "always-zero"
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

function parseJsonFromNpmOutput(stdout: string): DiagnosticOutput {
  const start = stdout.indexOf("{")
  const end = stdout.lastIndexOf("}")
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return JSON.parse(stdout.slice(start, end + 1)) as DiagnosticOutput
}

const productionSummary = readJson<ArtifactProductionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json",
)

const readinessSmokeSummary = readJson<ReadinessSmokeSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json",
)

describe("text engine WASM artifact production gate", () => {
  it("uses Phase 194 readiness as the production gate source of truth", () => {
    expect(productionSummary.productionSummaryId).toBe(
      "text-engine-wasm-artifact-production-v1",
    )
    expect(productionSummary.sourceReadinessSmokeSummaryId).toBe(
      readinessSmokeSummary.smokeSummaryId,
    )
    expect(productionSummary.sourceDiagnosticSummaryId).toBe(
      readinessSmokeSummary.sourceDiagnosticSummaryId,
    )
    expect(productionSummary.acceptedArtifactPath).toBe(
      readinessSmokeSummary.acceptedArtifactPath,
    )
    expect(productionSummary.acceptedBuildPath).toBe(readinessSmokeSummary.acceptedBuildPath)
    expect(productionSummary.readinessSource.readinessSmokeBlockers).toEqual(
      readinessSmokeSummary.blockers,
    )
  })

  it("does not run artifact production while the package-local toolchain is unavailable", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")

    expect(packageJson.scripts["wasm:build"]).toBe(
      productionSummary.acceptedBuild.underlyingCommand,
    )
    expect(productionSummary.acceptedBuild).toEqual({
      workingDirectory: "packages/text-engine-rust-wasm",
      packageScript: "wasm:build",
      command: "npm run wasm:build",
      underlyingCommand:
        "wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine",
      outputDirectory: "packages/text-engine-rust-wasm/pkg",
      outputArtifactPath: productionSummary.acceptedArtifactPath,
      runStatus: "not-run-toolchain-unavailable",
      rootCheckRequiresBuild: false,
    })
    expect(productionSummary.readinessSource).toMatchObject({
      smokeStatus: "completed-blocked",
      smokeExitPolicy: "always-zero",
      lastObservedSmokeExitCode: 0,
      availabilityStatus: "unavailable-blocked",
      wasmPackAvailable: false,
      wasmPackVersion: null,
      wasmPackVersionPolicyStatus: "pending-until-installed",
      wasm32UnknownUnknownInstalled: false,
      toolchainReady: false,
      canProduceArtifactNow: false,
    })
    expect(productionSummary.readinessSource.currentDiagnosticBlockedReasons).toEqual([
      "wasm-pack-not-available",
      "wasm32-unknown-unknown-target-not-installed",
    ])
  })

  it("records absent artifact facts without creating a fake artifact", () => {
    expect(productionSummary.artifact).toEqual({
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
    expect(productionSummary.digest).toEqual({
      digestStatus: "pending",
      sha256: null,
      sha256Pinned: false,
      fakeSha256Allowed: false,
      pinningStatus: "blocked-until-real-artifact-exists",
      phase196ArtifactDigestPinningExecution: "blocked",
    })
    expect(productionSummary.phase196Rule).toBe("blocked-until-real-artifact-exists")
    expect(productionSummary.nextRecommendedWork).toBe(
      "Text Engine WASM Toolchain Provisioning Bootstrap Gate",
    )
  })

  it("keeps root checks independent from wasm-pack, the WASM target, readiness smoke, build, and artifact", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(productionSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
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

  it("keeps downstream measurement evidence lanes blocked and root summaries JSON-safe", () => {
    expect(productionSummary.rawEvidenceIncluded).toBe(false)
    expect(productionSummary.productionReady).toBe(false)
    expect(productionSummary.defaultMeasurerReplacement).toBe(false)
    expect(productionSummary.nativeEvidenceStatus).toBe("blocked")
    expect(productionSummary.wasmEvidenceStatus).toBe("blocked")
    expect(productionSummary.nativeWasmParityStatus).toBe("not-run")
    expect(productionSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(productionSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(productionSummary.acceptedManifestStatus).toBe("blocked")
    expect(productionSummary.blockers).toEqual([
      "wasm-pack-not-available",
      "wasm-pack-version-unpinned",
      "wasm32-unknown-unknown-target-not-installed",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
    expect(productionSummary.jsonSafeRootSummary).toEqual({
      matrixId: "v1-measurement-fixture-evidence-matrix-v1",
      corpusId: "v1-measurement-evidence-corpus-v1",
      policyRevision: "v1-measurement-evidence-policy-v1",
      runtimeIdentityManifestId: "text-engine-runtime-identity-v1",
      runtimeIdentityPointer: "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
      readinessSmokeSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json",
      artifactProductionSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json",
      wasmArtifactPointer: null,
      artifactProduced: false,
      fileSizeBytes: null,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })

    const serialized = JSON.stringify(productionSummary)
    expect(serialized).not.toContain("rawEvidenceBytes")
    expect(serialized).not.toContain("nativeOutput")
    expect(serialized).not.toContain("wasmOutput")
    expect(serialized).not.toContain("rendererOutput")
    expect(serialized).not.toContain("pdfBytes")
    expect(serialized).not.toContain("JVBERi0")
  })

  it("can rerun the package-local diagnostic without requiring artifact production", () => {
    const result = spawnSync(
      process.execPath,
      ["packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs"],
      {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
      },
    )

    expect(result.status).toBe(0)
    const diagnostic = parseJsonFromNpmOutput(result.stdout)
    expect(diagnostic.summaryId).toBe(productionSummary.sourceDiagnosticSummaryId)
    expect(diagnostic.diagnosticExitPolicy).toBe("always-zero")
    expect(diagnostic.acceptedArtifactPath).toBe(productionSummary.acceptedArtifactPath)
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
    expect(productionSummary.readinessSource.currentDiagnosticBlockedReasons).toEqual([
      "wasm-pack-not-available",
      "wasm32-unknown-unknown-target-not-installed",
    ])
  })

  it("does not execute external engines in core or replace measurement", () => {
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(coreIndex).not.toContain("text-engine-rust-wasm")
    expect(coreIndex).not.toContain("wasm-artifact-production")
    expect(coreMeasurement).not.toContain("wasm-artifact-production")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 195 and blocks digest pinning until provisioning and artifact production", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 195 text engine WASM artifact production gate.")
    expect(doc).toContain("Decision: `blocked-not-produced`.")
    expect(doc).toContain("Do not proceed to Phase 196.")
    expect(doc).toContain("Text Engine WASM Toolchain Provisioning Bootstrap Gate")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Renderer-backed Drift Summary Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Renderer-backed Drift Summary Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("Artifact Digest Pinning Execution.")
    expect(readme).toContain("Text engine WASM artifact production gate")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md")
    expect(ledger).toContain("| 195 | Text engine WASM artifact production gate | done |")
    expect(ledger).toContain("## Phase 195 Text Engine WASM Artifact Production Gate")
    expect(roadmap).toContain("## Phase 195: Text Engine WASM Artifact Production Gate")
    expect(roadmap).toContain("Current next step after Phase 195G:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
