import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core route Window C public export removal", () => {
  it("removes route-shaped modules from the public core entrypoint", () => {
    const index = readText("src/index.ts")

    expect(index).toContain("./generation/runtime.js")
    expect(index).toContain("./generation/artifactManifest.js")
    expect(index).toContain("./generation/artifactJob.js")
    expect(index).not.toContain("./generation/apiRoute.js")
    expect(index).not.toContain("./generation/artifactApiRoute.js")
  })

  it("leaves deprecated route helper source files as internal historical code only", () => {
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")
    const deexportDoc = readText("docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md")

    expect(generationRoute).toContain("@deprecated Window B compatibility export")
    expect(artifactRoute).toContain("@deprecated Window B compatibility export")
    expect(deexportDoc).toContain("source files still exist")
    expect(deexportDoc).toContain("exported from `src/index.ts`")
  })

  it("publishes Window C status across route docs and phase pointers", () => {
    const deexportDoc = readText("docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md")
    const plan = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const deprecationWindow = readText("docs/CORE_ROUTE_DEPRECATION_WINDOW.md")
    const retainedRewrite = readText("docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(deexportDoc).toContain("Window C export removal is complete")
    expect(plan).toContain("Window C / complete")
    expect(deprecationWindow).toContain("Window C removed public route exports")
    expect(retainedRewrite).toContain("Window C export removal is now complete")
    expect(consumerMap).toContain("route-shaped public exports have been removed")
    expect(readme).toContain("Core Route Window C Public Export Removal")
    expect(readme).toContain("docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md")
    expect(ledger).toContain("| 231 | Core route Window C public export removal | done |")
    expect(ledger).toContain("## Phase 231 Core Route Window C Public Export Removal")
  })
})
