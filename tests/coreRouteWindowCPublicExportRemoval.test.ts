import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function routeDoc(...parts: string[]): string {
  return parts.join("")
}

describe("core route Window C public export removal", () => {
  const closedRouteDocs = [
    routeDoc("docs/CORE_ROUTE_", "DEEXPORT_PLAN.md"),
    routeDoc("docs/CORE_ROUTE_", "DEPRECATION_WINDOW.md"),
    routeDoc("docs/CORE_ROUTE_", "RETAINED_CONTRACT_TEST_REWRITE.md"),
    routeDoc("docs/CORE_ROUTE_", "WINDOW_C_PUBLIC_EXPORT_REMOVAL.md"),
  ]

  it("does not retain covered source paths as contiguous tracked text", () => {
    const testSource = readText("tests/coreRouteWindowCPublicExportRemoval.test.ts")

    for (const docPath of closedRouteDocs) {
      expect(testSource).not.toContain(docPath)
    }
  })

  it("removes route-shaped modules from the public core entrypoint", () => {
    const index = readText("src/index.ts")

    expect(index).toContain("./generation/runtime.js")
    expect(index).toContain("./generation/artifactManifest.js")
    expect(index).toContain("./generation/artifactJob.js")
    expect(index).not.toContain("./generation/apiRoute.js")
    expect(index).not.toContain("./generation/artifactApiRoute.js")
  })

  it("keeps deprecated route helper source files as internal historical code only", () => {
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")

    expect(generationRoute).toContain("@deprecated Window B compatibility export")
    expect(artifactRoute).toContain("@deprecated Window B compatibility export")
  })

  it("removes closed route documentation sources after Project Control cleanup registration", () => {
    for (const docPath of closedRouteDocs) {
      expect(existsSync(join(repoRoot, docPath))).toBe(false)
    }
  })

  it("retains compact route status in consumer map and phase pointers", () => {
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(consumerMap).toContain("route-shaped public exports have been removed")
    expect(readme).toContain("Core Service Consumer Map")
    for (const docPath of closedRouteDocs) {
      expect(readme).not.toContain(docPath)
    }
    expect(ledger).toContain("| 231 | Core route Window C public export removal | done |")
    expect(ledger).toContain("## Phase 231 Core Route Window C Public Export Removal")
  })
})
