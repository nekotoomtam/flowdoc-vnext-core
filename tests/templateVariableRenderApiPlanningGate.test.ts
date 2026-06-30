import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type AcceptedManifest = {
  manifestStatus: "accepted"
  manifestScope: "minimal-accepted-subset-only"
  fullV1MatrixStatus: "partial-not-accepted"
  productionBinding: boolean
  productionReady: boolean
  defaultMeasurerReplacement: boolean
  fixtures: Array<{
    fixtureId: string
    status: "accepted"
  }>
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

const acceptedManifest = readJson<AcceptedManifest>(
  "../fixtures/measurement-evidence-summary-manifest.accepted.v1.json",
)

describe("template variable render API planning gate", () => {
  it("confirms the measurement close-audit carry-forward blockers", () => {
    const closeAudit = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")

    expect(closeAudit).toContain("Decision: sufficient for mini infrastructure checkpoint.")
    expect(closeAudit).toContain("It is not enough for full v1 measurement production readiness.")
    expect(acceptedManifest.manifestStatus).toBe("accepted")
    expect(acceptedManifest.manifestScope).toBe("minimal-accepted-subset-only")
    expect(acceptedManifest.fullV1MatrixStatus).toBe("partial-not-accepted")
    expect(acceptedManifest.productionBinding).toBe(false)
    expect(acceptedManifest.productionReady).toBe(false)
    expect(acceptedManifest.defaultMeasurerReplacement).toBe(false)
    expect(acceptedManifest.fixtures.map((fixture) => fixture.fixtureId).sort()).toEqual([
      "v1-measure-latin-product-paragraphs",
      "v1-measure-thai-line-break-core",
    ])
    expect(planningGate).toContain("full v1 measurement matrix remains `partial-not-accepted`")
    expect(planningGate).toContain("production measurement binding remains blocked")
    expect(planningGate).toContain("default-measurer replacement remains blocked")
  })

  it("ranks Template Publish first and defers Variable Schema plus Render API", () => {
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")

    expect(planningGate).toContain(
      "| 1 | Template Publish / Version Boundary | selected first |",
    )
    expect(planningGate).toContain("| 2 | Variable Schema / Data Contract | deferred |")
    expect(planningGate).toContain("| 3 | Render API Contract | deferred |")
    expect(planningGate).toContain(
      "Selected first implementation lane: Template Publish / Version Boundary.",
    )
    expect(planningGate).toContain(
      "Variable Schema / Data Contract is deferred until a template publish/version",
    )
    expect(planningGate).toContain(
      "Render API Contract is deferred until both template version identity",
    )
  })

  it("defines evidence required for the Template Publish / Version Boundary Gate", () => {
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")

    expect(planningGate).toContain("publishable template candidate source is canonical package v2/document v3")
    expect(planningGate).toContain("draft template identity remains separate from published template version")
    expect(planningGate).toContain("published version ids are stable and immutable once accepted")
    expect(planningGate).toContain("version metadata is JSON-safe")
    expect(planningGate).toContain("publish validation reports package parse")
    expect(planningGate).toContain("retention pointers identify the source package/template snapshot")
    expect(planningGate).toContain("rollback, deprecation, or superseding-version policy")
    expect(planningGate).toContain("Template Publish / Version Boundary Gate.")
  })

  it("keeps the planning gate from changing runtime behavior or production readiness", () => {
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(planningGate).toContain("No `measureVNextText(...)` replacement happens.")
    expect(planningGate).toContain("No full measurement production readiness is claimed.")
    expect(planningGate).toContain("No package/document schema change is made in this planning gate.")
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("template-publish")
    expect(rootScripts).not.toContain("render-api")
    expect(coreIndex).not.toContain("template-variable-render-api-planning")
    expect(coreMeasurement).not.toContain("template-variable-render-api-planning")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("updates current status, next pointer, ledger, roadmap, and README", () => {
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(planningGate).toContain(
      "Status: Template Publish / Variable Schema / Render API Planning Gate complete.",
    )
    expect(planningGate).toContain("## PASS")
    expect(planningGate).toContain("## FAIL-BLOCKER")
    expect(planningGate).toContain("## RISK")
    expect(planningGate).toContain("## UNKNOWN")
    expect(currentStatus).toContain(
      "Status: updated after Template Publish Validation Evidence Gate.",
    )
    expect(currentStatus).toContain("Template Publish / Version Boundary Gate.")
    expect(nextPointer).toContain(
      "Status: current after Template Publish Validation Evidence Gate.",
    )
    expect(nextPointer).toContain("Template Publish / Version Boundary Gate.")
    expect(nextPointer).toContain("No package/document schema change in the planning gate.")
    expect(ledger).toContain("| 204 | Template variable render API planning gate | done |")
    expect(ledger).toContain("## Phase 204 Template Variable Render API Planning Gate")
    expect(roadmap).toContain("## Phase 204: Template Publish / Variable Schema / Render API Planning Gate")
    expect(roadmap).toContain("Current next step after Phase 204:")
    expect(roadmap).toContain("Template Publish / Version Boundary Gate")
    expect(roadmap).toContain("Historical Phase 203 Handoff")
    expect(readme).toContain("Template Publish / Variable Schema / Render API planning gate")
    expect(readme).toContain("docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")
  })
})
