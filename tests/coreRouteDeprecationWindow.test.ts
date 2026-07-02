import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function expectNoNamedImport(source: string, symbol: string): void {
  expect(source).not.toMatch(new RegExp(`import\\s*\\{[^}]*${symbol}`))
}

describe("core route deprecation window", () => {
  it("marks route-shaped source exports as deprecated compatibility exports", () => {
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")

    expect(generationRoute).toContain("@deprecated Window B compatibility export")
    expect(generationRoute).toContain("flowdoc-vnext-backend/src/routes/generationRoute.ts")
    expect(generationRoute).toContain("assessVNextGenerationReadiness")
    expect(generationRoute).toContain("createVNextGenerationApiRouteResponse")
    expect(artifactRoute).toContain("@deprecated Window B compatibility export")
    expect(artifactRoute).toContain("flowdoc-vnext-backend/src/routes/artifactRoute.ts")
    expect(artifactRoute).toContain("createVNextArtifactManifestPlan")
    expect(artifactRoute).toContain("createVNextArtifactGenerationApiRouteResponse")
    expect(artifactRoute).toContain("createVNextArtifactStatusApiRouteResponse")
    expect(artifactRoute).toContain("createVNextSessionArtifactListApiRouteResponse")
    expect(artifactRoute).toContain("createVNextArtifactDownloadMetadataApiRouteResponse")
  })

  it("records that Window C removed public route exports after the compatibility window", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")

    expect(index).not.toContain("./generation/apiRoute.js")
    expect(index).not.toContain("./generation/artifactApiRoute.js")
    expect(doc).toContain("Window C removed public route exports.")
    expect(doc).toContain("Public route exports are no longer available from `src/index.ts`.")
  })

  it("records the retained-contract test rewrite that follows the compatibility markers", () => {
    const generationRuntimeTest = readText("tests/generationRuntimeRetainedContract.test.ts")
    const artifactRetainedTest = readText("tests/artifactRetainedContract.test.ts")
    const doc = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")

    expect(existsSync(join(repoRoot, "tests/generationApiRoute.test.ts"))).toBe(false)
    expect(existsSync(join(repoRoot, "tests/artifactApiRoute.test.ts"))).toBe(false)
    expect(generationRuntimeTest).toContain("assessVNextGenerationReadiness")
    expect(generationRuntimeTest).toContain("safeParseVNextGenerationRequest")
    expectNoNamedImport(generationRuntimeTest, "createVNextGenerationApiRouteResponse")
    expect(artifactRetainedTest).toContain("createVNextArtifactManifestPlan")
    expect(artifactRetainedTest).toContain("createVNextArtifactJobPlan")
    expect(artifactRetainedTest).toContain("advanceVNextArtifactJob")
    expectNoNamedImport(artifactRetainedTest, "createVNextArtifactGenerationApiRouteResponse")
    expect(doc).toContain("tests/generationRuntimeRetainedContract.test.ts")
    expect(doc).toContain("tests/artifactRetainedContract.test.ts")
    expect(doc).toContain("retained-contract tests have replaced")
    expect(doc).toContain("route-helper ownership assertions")
  })

  it("keeps backend ownership and retained core owners explicit", () => {
    const doc = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")
    const plan = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")

    expect(doc).toContain("flowdoc-vnext-backend/src/routes/generationRoute.ts")
    expect(doc).toContain("flowdoc-vnext-backend/src/routes/artifactRoute.ts")
    expect(doc).toContain("src/generation/runtime.ts")
    expect(doc).toContain("src/generation/artifactManifest.ts")
    expect(doc).toContain("src/generation/artifactJob.ts")
    expect(doc).toContain("src/persistence/storageAdapter.ts")
    expect(doc).toContain("assessVNextGenerationReadiness")
    expect(doc).toContain("safeParseVNextGenerationRequest")
    expect(doc).toContain("createVNextArtifactManifestPlan")
    expect(doc).toContain("createVNextArtifactJobPlan")
    expect(doc).toContain("advanceVNextArtifactJob")
    expect(plan).toContain("Window B / complete")
  })

  it("publishes the deprecation window in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Route Deprecation Window")
    expect(readme).toContain("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")
    expect(ledger).toContain("| 229 | Core route deprecation window | done |")
    expect(ledger).toContain("## Phase 229 Core Route Deprecation Window")
    expect(ledger).toContain("Window B compatibility marker")
    expect(ledger).toContain("| 230 | Core route retained-contract test rewrite | done |")
    expect(ledger).toContain("| 231 | Core route Window C public export removal | done |")
  })
})
