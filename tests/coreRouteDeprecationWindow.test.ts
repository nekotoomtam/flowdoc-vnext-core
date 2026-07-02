import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
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

  it("keeps public route exports stable during the compatibility window", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")

    expect(index).toContain("./generation/apiRoute.js")
    expect(index).toContain("./generation/artifactApiRoute.js")
    expect(doc).toContain("Public route exports remain available.")
    expect(doc).toContain("No public export removed.")
  })

  it("marks legacy route-helper tests as compatibility-window coverage", () => {
    const generationRouteTest = readText("tests/generationApiRoute.test.ts")
    const artifactRouteTest = readText("tests/artifactApiRoute.test.ts")
    const doc = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")

    expect(generationRouteTest).toContain("ROUTE_HELPER_COMPATIBILITY_WINDOW")
    expect(generationRouteTest).toContain("Window B route-helper compatibility test")
    expect(artifactRouteTest).toContain("ROUTE_HELPER_COMPATIBILITY_WINDOW")
    expect(artifactRouteTest).toContain("Window B route-helper compatibility test")
    expect(doc).toContain("tests/generationApiRoute.test.ts")
    expect(doc).toContain("tests/artifactApiRoute.test.ts")
    expect(doc).toContain("They should be rewritten or")
    expect(doc).toContain("removed before `src/index.ts` stops exporting")
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
  })
})
