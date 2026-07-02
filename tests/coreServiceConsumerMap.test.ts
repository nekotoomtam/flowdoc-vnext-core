import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core service consumer map", () => {
  it("documents cross-repo consumer groups before service de-export", () => {
    const doc = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const requiredSections = [
      "## Evidence Snapshot",
      "## Consumer Groups",
      "## De-export Readiness",
      "## Next Implementation Order",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]
    const requiredEvidence = [
      "src/generation/apiRoute.ts",
      "src/generation/artifactApiRoute.ts",
      "tests/generationRuntimeRetainedContract.test.ts",
      "tests/artifactRetainedContract.test.ts",
      "src/authoring/sessionStorage.ts",
      "src/authoring/richInlineSessionPersistence.ts",
      "src/workflow/submissionState.ts",
      "packages/storage-file-json",
      "packages/internal-alpha-runner",
      "flowdoc-vnext-backend/src/routes/generationRoute.ts",
      "flowdoc-vnext-backend/src/routes/artifactRoute.ts",
      "flowdoc-vnext-backend/src/storage/fileJsonStorage.ts",
      "flowdoc-vnext-backend/src/storage/storageRouteBinding.ts",
      "flowdoc-vnext-backend/src/artifacts/artifactJobExecution.ts",
      "flowdoc-vnext-editor",
      "src/core/coreAdapter.ts",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }
    for (const evidence of requiredEvidence) {
      expect(doc).toContain(evidence)
    }

    expect(doc).toContain("editor -> backend -> core")
    expect(doc).toContain("Backend route parity now exists")
    expect(doc).toContain("codex/backend-route-parity")
    expect(doc).toContain("2ae6570")
    expect(doc).toContain("createFlowDocBackendGenerationRouteResponse")
    expect(doc).toContain("createFlowDocBackendArtifactGenerationRouteResponse")
    expect(doc).toContain("backend tests still use the session storage record shape")
    expect(doc).toContain("no direct service-shaped export consumer was found")
  })

  it("keeps current service-shaped exports marked as blocked from immediate removal", () => {
    const doc = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const index = readText("src/index.ts")
    const blockedExports = [
      "./authoring/sessionStorage.js",
      "./authoring/richInlineSessionPersistence.js",
      "./workflow/submissionState.js",
    ]

    for (const exportedPath of blockedExports) {
      expect(index).toContain(exportedPath)
      expect(doc).toContain(exportedPath)
    }

    expect(index).not.toContain("./generation/apiRoute.js")
    expect(index).not.toContain("./generation/artifactApiRoute.js")
    expect(doc).toContain("Do not remove these remaining exports yet")
    expect(doc).toContain("route-shaped backend parity exists")
    expect(doc).toContain("route-shaped public exports have been removed")
    expect(doc).toContain("retained core contract names")
  })

  it("keeps the consumer map aligned with the retention map", () => {
    const doc = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const audit = readText("docs/CORE_SERVICE_CONCERN_AUDIT.md")

    expect(retention).toContain("## Move + Retain Rule")
    expect(retention).toContain("## De-export Preconditions")
    expect(retention).toContain("route-shaped public exports are removed")
    expect(audit).toContain("## Priority Migration Plan")
    expect(audit).toContain("### P2: Move Route-Shaped Core Modules")
    expect(doc).toContain("Backend P1 migration is treated as evidence for execution ownership")
    expect(doc).toContain("Backend route parity now exists for the generation and artifact API route")
    expect(doc).toContain("The retained core contract has a named owner and direct core tests.")
    expect(doc).toContain("This is now true for generation")
    expect(doc).toContain("route tests now become pure retained-contract tests")
  })

  it("guards retained split-contract owners from accidental service classification", () => {
    const doc = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const storage = readText("src/persistence/storageAdapter.ts")
    const artifactJob = readText("src/generation/artifactJob.ts")
    const artifactManifest = readText("src/generation/artifactManifest.ts")
    const generationRuntime = readText("src/generation/runtime.ts")

    expect(doc).toContain("src/persistence/storageAdapter.ts")
    expect(doc).toContain("src/generation/artifactManifest.ts")
    expect(doc).toContain("src/generation/artifactJob.ts")
    expect(doc).toContain("src/generation/runtime.ts")
    expect(doc).toContain("Keep these as core-owned or split-contract exports")
    expect(storage).toContain("interfaceOnly: true")
    expect(storage).toContain("concreteBackend: null")
    expect(artifactJob).toContain("workerExecution: false")
    expect(artifactManifest).toContain('storageStatus: "not-written"')
    expect(generationRuntime).toContain('mode: "readiness-only"')
  })

  it("publishes the consumer map in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Service Consumer Map")
    expect(readme).toContain("docs/CORE_SERVICE_CONSUMER_MAP.md")
    expect(ledger).toContain("| 226 | Core service consumer map | done |")
    expect(ledger).toContain("| 227 | Backend route parity evidence | done |")
    expect(ledger).toContain("## Phase 226 Core Service Consumer Map")
    expect(ledger).toContain("## Phase 227 Backend Route Parity Evidence")
    expect(ledger).toContain("consumer groups")
  })
})
