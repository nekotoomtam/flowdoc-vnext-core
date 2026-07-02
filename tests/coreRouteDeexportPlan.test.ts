import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core route de-export plan", () => {
  it("selects a controlled compatibility window before route export removal", () => {
    const doc = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const requiredSections = [
      "## Purpose",
      "## Source Evidence",
      "## Ownership Decision",
      "## Selected Compatibility Window",
      "## Retained Contract Test Rewrite",
      "## De-export Preconditions",
      "## Guardrails",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }

    expect(doc).toContain("deprecate route-shaped exports for one compatibility window")
    expect(doc).toContain("Window A / current patch")
    expect(doc).toContain("Window B / next patch")
    expect(doc).toContain("Window C / removal patch")
    expect(doc).toContain("Do not skip Window B")
  })

  it("keeps current route exports in place while planning de-export", () => {
    const doc = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const index = readText("src/index.ts")

    expect(index).toContain("./generation/apiRoute.js")
    expect(index).toContain("./generation/artifactApiRoute.js")
    expect(doc).toContain("The plan does not remove exports in this patch.")
    expect(doc).toContain("`src/index.ts` still exports the route-shaped modules.")
    expect(doc).toContain("No public export removed.")
  })

  it("requires retained-contract tests before removing route helpers", () => {
    const doc = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const generationRouteTest = readText("tests/generationApiRoute.test.ts")
    const artifactRouteTest = readText("tests/artifactApiRoute.test.ts")
    const runtime = readText("src/generation/runtime.ts")
    const artifactManifest = readText("src/generation/artifactManifest.ts")
    const artifactJob = readText("src/generation/artifactJob.ts")

    expect(generationRouteTest).toContain("createVNextGenerationApiRouteResponse")
    expect(artifactRouteTest).toContain("createVNextArtifactGenerationApiRouteResponse")
    expect(doc).toContain("tests/generationApiRoute.test.ts")
    expect(doc).toContain("tests/artifactApiRoute.test.ts")
    expect(doc).toContain("assessVNextGenerationReadiness")
    expect(doc).toContain("safeParseVNextGenerationRequest")
    expect(doc).toContain("createVNextArtifactManifestPlan")
    expect(doc).toContain("createVNextArtifactJobPlan")
    expect(doc).toContain("advanceVNextArtifactJob")
    expect(runtime).toContain("assessVNextGenerationReadiness")
    expect(runtime).toContain("safeParseVNextGenerationRequest")
    expect(artifactManifest).toContain("createVNextArtifactManifestPlan")
    expect(artifactJob).toContain("createVNextArtifactJobPlan")
    expect(artifactJob).toContain("advanceVNextArtifactJob")
  })

  it("guards backend ownership from leaking back into retained core contracts", () => {
    const doc = readText("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    const coreConsumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")

    expect(coreConsumerMap).toContain("flowdoc-vnext-backend/src/routes/generationRoute.ts")
    expect(coreConsumerMap).toContain("flowdoc-vnext-backend/src/routes/artifactRoute.ts")
    expect(doc).toContain("Do not import `flowdoc-vnext-backend` from core tests or source.")
    expect(doc).toContain("Do not move backend route status/header/permission behavior into retained")
    expect(generationRoute).not.toContain("flowdoc-vnext-backend")
    expect(artifactRoute).not.toContain("flowdoc-vnext-backend")
  })

  it("publishes the route de-export plan in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Route De-export Plan")
    expect(readme).toContain("docs/CORE_ROUTE_DEEXPORT_PLAN.md")
    expect(ledger).toContain("| 228 | Core route de-export plan | done |")
    expect(ledger).toContain("## Phase 228 Core Route De-export Plan")
    expect(ledger).toContain("controlled de-export/deprecation window")
  })
})
