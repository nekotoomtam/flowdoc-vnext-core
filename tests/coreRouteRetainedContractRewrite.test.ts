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

describe("core route retained-contract test rewrite", () => {
  it("removes route-helper test ownership from core test suites", () => {
    const generationRuntimeTest = readText("tests/generationRuntimeRetainedContract.test.ts")
    const artifactRetainedTest = readText("tests/artifactRetainedContract.test.ts")

    expect(existsSync(join(repoRoot, "tests/generationApiRoute.test.ts"))).toBe(false)
    expect(existsSync(join(repoRoot, "tests/artifactApiRoute.test.ts"))).toBe(false)
    expect(generationRuntimeTest).toContain("assessVNextGenerationReadiness")
    expect(generationRuntimeTest).toContain("safeParseVNextGenerationRequest")
    expectNoNamedImport(generationRuntimeTest, "createVNextGenerationApiRouteResponse")
    expect(artifactRetainedTest).toContain("createVNextArtifactManifestPlan")
    expect(artifactRetainedTest).toContain("createVNextArtifactJobPlan")
    expect(artifactRetainedTest).toContain("advanceVNextArtifactJob")
    expectNoNamedImport(artifactRetainedTest, "createVNextArtifactGenerationApiRouteResponse")
    expectNoNamedImport(artifactRetainedTest, "createVNextArtifactStatusApiRouteResponse")
    expectNoNamedImport(artifactRetainedTest, "createVNextSessionArtifactListApiRouteResponse")
    expectNoNamedImport(artifactRetainedTest, "createVNextArtifactDownloadMetadataApiRouteResponse")
  })

  it("keeps deprecated public route exports in place until the Window C removal patch", () => {
    const index = readText("src/index.ts")
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")

    expect(index).toContain("./generation/apiRoute.js")
    expect(index).toContain("./generation/artifactApiRoute.js")
    expect(generationRoute).toContain("@deprecated Window B compatibility export")
    expect(artifactRoute).toContain("@deprecated Window B compatibility export")
  })

  it("publishes retained-contract rewrite evidence in route docs and phase pointers", () => {
    const doc = readText("docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md")
    const deexportPlan = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const deprecationWindow = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(doc).toContain("tests/generationRuntimeRetainedContract.test.ts")
    expect(doc).toContain("tests/artifactRetainedContract.test.ts")
    expect(doc).toContain("No public export removed")
    expect(deexportPlan).toContain("retained-contract test rewrite is complete")
    expect(deprecationWindow).toContain("retained-contract tests have replaced")
    expect(consumerMap).toContain("route tests now become pure retained-contract tests")
    expect(readme).toContain("Core Route Retained-Contract Test Rewrite")
    expect(readme).toContain("docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md")
    expect(ledger).toContain("| 230 | Core route retained-contract test rewrite | done |")
    expect(ledger).toContain("## Phase 230 Core Route Retained-Contract Test Rewrite")
  })
})
