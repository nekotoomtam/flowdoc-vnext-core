import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type OptionalReadinessSmokeSummary = {
  smokeSummaryId: string
  sourceAcquisitionSummaryId: string
  sourceDiagnosticSummaryId: string
  acceptedArtifactPath: string
  acceptedBuildPath: "wasm-pack"
  smoke: {
    packageScript: "wasm:readiness-smoke"
    command: string
    workingDirectory: string
    wrapsPackageScript: "wasm:check-toolchain"
    diagnosticScriptPath: string
    exitPolicy: "always-zero"
    lastObservedExitCode: number
    status: "completed-blocked"
    jsonSafe: boolean
    rawEvidenceIncluded: boolean
    rootCheckRequiresSmoke: boolean
  }
  availability: {
    cargoAvailable: boolean
    rustupAvailable: boolean
    wasmPackAvailable: boolean
    wasmPackVersion: string | null
    wasmPackVersionPolicyStatus: "pending-until-installed"
    wasmBindgenCliAvailable: boolean
    installedRustTargets: string[]
    wasm32UnknownUnknownInstalled: boolean
    toolchainReady: boolean
    availabilityStatus: "unavailable-blocked"
  }
  rootCheck: {
    requiresWasmPack: boolean
    requiresWasm32UnknownUnknown: boolean
    requiresReadinessSmoke: boolean
    requiresArtifact: boolean
  }
  artifactPolicy: {
    canProduceArtifactNow: boolean
    artifactProduced: boolean
    artifactPointer: string | null
    artifactProductionStatus: string
    fakeArtifactAllowed: boolean
    phase195PolicyIfUnavailable: string
  }
  digestPolicy: {
    digestStatus: "pending"
    sha256: string | null
    pinningStatus: string
    fakeSha256Allowed: boolean
    doNotProceedToDigestPinning: boolean
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
    wasmToolchainDiagnosticPointer: string
    readinessSmokeSummaryPointer: string
    wasmArtifactPointer: string | null
    digestStatus: "pending"
    sha256: string | null
    rawEvidenceIncluded: boolean
  }
  nextRecommendedPhase: string
}

type AcquisitionSummary = {
  acquisitionSummaryId: string
  diagnostic: {
    summaryId: string
    packageScript: "wasm:check-toolchain"
    scriptPath: string
    exitPolicy: "always-zero"
    rootCheckRequiresDiagnostic: boolean
  }
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

function repoPathExists(path: string): boolean {
  return existsSync(new URL(`../${path}`, import.meta.url))
}

const smokeSummary = readJson<OptionalReadinessSmokeSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json",
)

const acquisitionSummary = readJson<AcquisitionSummary>(
  "../packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json",
)

describe("text engine WASM toolchain optional readiness smoke", () => {
  it("records the Phase 194 smoke summary from the Phase 193 acquisition source", () => {
    expect(smokeSummary.smokeSummaryId).toBe(
      "text-engine-wasm-toolchain-optional-readiness-smoke-v1",
    )
    expect(smokeSummary.sourceAcquisitionSummaryId).toBe(
      acquisitionSummary.acquisitionSummaryId,
    )
    expect(smokeSummary.sourceDiagnosticSummaryId).toBe(
      acquisitionSummary.diagnostic.summaryId,
    )
    expect(smokeSummary.acceptedArtifactPath).toBe(acquisitionSummary.acceptedArtifactPath)
    expect(smokeSummary.acceptedBuildPath).toBe(acquisitionSummary.acceptedBuildPath)
    expect(smokeSummary.nextRecommendedPhase).toBe(
      "Phase 195: Text Engine WASM Artifact Production Gate",
    )
  })

  it("adds a package-local smoke wrapper without making root checks run it", () => {
    const packageJson = readJson<PackageJson>("../packages/text-engine-rust-wasm/package.json")
    const diagnosticSource = readText(
      "../packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs",
    )

    expect(packageJson.scripts["wasm:check-toolchain"]).toBe("node scripts/check-wasm-toolchain.mjs")
    expect(packageJson.scripts["wasm:readiness-smoke"]).toBe("npm run wasm:check-toolchain")
    expect(smokeSummary.smoke).toMatchObject({
      packageScript: "wasm:readiness-smoke",
      command: "npm run wasm:readiness-smoke",
      workingDirectory: "packages/text-engine-rust-wasm",
      wrapsPackageScript: "wasm:check-toolchain",
      diagnosticScriptPath: acquisitionSummary.diagnostic.scriptPath,
      exitPolicy: "always-zero",
      lastObservedExitCode: 0,
      status: "completed-blocked",
      jsonSafe: true,
      rawEvidenceIncluded: false,
      rootCheckRequiresSmoke: false,
    })
    expect(repoPathExists(smokeSummary.smoke.diagnosticScriptPath)).toBe(true)
    expect(diagnosticSource).toContain("diagnosticExitPolicy")
    expect(diagnosticSource).toContain("process.exitCode = 0")
  })

  it("records unavailable toolchain status as JSON-safe smoke metadata", () => {
    expect(smokeSummary.availability).toEqual({
      cargoAvailable: true,
      rustupAvailable: true,
      wasmPackAvailable: false,
      wasmPackVersion: null,
      wasmPackVersionPolicyStatus: "pending-until-installed",
      wasmBindgenCliAvailable: false,
      installedRustTargets: ["x86_64-pc-windows-msvc"],
      wasm32UnknownUnknownInstalled: false,
      toolchainReady: false,
      availabilityStatus: "unavailable-blocked",
    })
    expect(smokeSummary.blockers).toEqual([
      "wasm-pack-not-available",
      "wasm-pack-version-unpinned",
      "wasm32-unknown-unknown-target-not-installed",
      "accepted-artifact-path-not-produced",
      "sha256-not-computed",
    ])
  })

  it("keeps root checks independent from wasm-pack, the WASM target, the smoke, and artifacts", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")

    expect(smokeSummary.rootCheck).toEqual({
      requiresWasmPack: false,
      requiresWasm32UnknownUnknown: false,
      requiresReadinessSmoke: false,
      requiresArtifact: false,
    })
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(rootScripts).not.toContain("wasm:readiness-smoke")
    expect(repoPathExists(smokeSummary.acceptedArtifactPath)).toBe(false)
  })

  it("blocks artifact production and digest pinning until a real artifact exists", () => {
    expect(smokeSummary.artifactPolicy).toEqual({
      canProduceArtifactNow: false,
      artifactProduced: false,
      artifactPointer: null,
      artifactProductionStatus: "blocked-until-toolchain-available",
      fakeArtifactAllowed: false,
      phase195PolicyIfUnavailable: "record-blocker-or-propose-dedicated-provisioning-bootstrap",
    })
    expect(smokeSummary.digestPolicy).toEqual({
      digestStatus: "pending",
      sha256: null,
      pinningStatus: "blocked-until-real-artifact-exists",
      fakeSha256Allowed: false,
      doNotProceedToDigestPinning: true,
    })
    expect(smokeSummary.rawEvidenceIncluded).toBe(false)
    expect(smokeSummary.productionReady).toBe(false)
    expect(smokeSummary.defaultMeasurerReplacement).toBe(false)
  })

  it("keeps downstream measurement evidence lanes blocked and root summaries JSON-safe", () => {
    expect(smokeSummary.nativeEvidenceStatus).toBe("blocked")
    expect(smokeSummary.wasmEvidenceStatus).toBe("blocked")
    expect(smokeSummary.nativeWasmParityStatus).toBe("not-run")
    expect(smokeSummary.rendererBackedDriftStatus).toBe("unknown")
    expect(smokeSummary.numericDriftThresholdStatus).toBe("blocked")
    expect(smokeSummary.acceptedManifestStatus).toBe("blocked")
    expect(smokeSummary.jsonSafeRootSummary).toEqual({
      matrixId: "v1-measurement-fixture-evidence-matrix-v1",
      corpusId: "v1-measurement-evidence-corpus-v1",
      policyRevision: "v1-measurement-evidence-policy-v1",
      runtimeIdentityManifestId: "text-engine-runtime-identity-v1",
      runtimeIdentityPointer: "packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json",
      wasmToolchainDiagnosticPointer: "packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs",
      readinessSmokeSummaryPointer:
        "packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json",
      wasmArtifactPointer: null,
      digestStatus: "pending",
      sha256: null,
      rawEvidenceIncluded: false,
    })

    const serialized = JSON.stringify(smokeSummary)
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
    expect(coreIndex).not.toContain("wasm-toolchain-optional-readiness-smoke")
    expect(coreMeasurement).not.toContain("wasm-toolchain-optional-readiness-smoke")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents Phase 194 and advances current pointers to Phase 195", () => {
    const doc = readText("../docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain(
      "Status: Phase 194 text engine WASM toolchain optional readiness smoke.",
    )
    expect(doc).toContain("npm run wasm:readiness-smoke")
    expect(doc).toContain("availability.availabilityStatus=\"unavailable-blocked\"")
    expect(doc).toContain("Proceed to Phase 195: Text Engine WASM Artifact Production Gate.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")

    expect(currentStatus).toContain("Status: updated after Text Engine WASM Toolchain Rust Upgrade Execution Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Status: current after Text Engine WASM Toolchain Rust Upgrade Execution Gate.")
    expect(nextPointer).toContain("Text Engine WASM Artifact Production Retry Gate.")
    expect(readme).toContain("Text engine WASM toolchain optional readiness smoke")
    expect(readme).toContain("docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md")
    expect(ledger).toContain("| 194 | Text engine WASM toolchain optional readiness smoke | done |")
    expect(ledger).toContain(
      "## Phase 194 Text Engine WASM Toolchain Optional Readiness Smoke",
    )
    expect(roadmap).toContain(
      "## Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke",
    )
    expect(roadmap).toContain("Current next step after Phase 195D:")
    expect(roadmap).toContain("Historical Phase 195 Handoff")
  })
})
