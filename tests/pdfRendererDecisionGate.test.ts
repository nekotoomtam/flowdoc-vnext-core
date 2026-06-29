import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("PDF renderer decision gate", () => {
  it("chooses the minimal PDF spike for internal-alpha only and defers production renderer selection", () => {
    const doc = readText("../docs/PDF_RENDERER_DECISION_GATE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const rootPackage = readText("../package.json")
    const runnerPackage = readText("../packages/internal-alpha-runner/package.json")
    const artifactJobTest = readText("./artifactJobExecutionSlice.test.ts")

    expect(doc).toContain("Status: Phase 178 PDF renderer decision gate.")
    expect(doc).toContain("Continue using the existing dependency-free minimal PDF spike for internal-alpha")
    expect(doc).toContain("Do not choose or add a production PDF renderer package in Phase 178.")
    expect(doc).toContain("Phase 136")
    expect(doc).toContain("Phase 177")
    expect(doc).toContain("Phase 179")
    expect(doc).toContain("Production PDF renderer readiness remains blocked.")
    expect(doc).toContain("Next recommended phase: Phase 179: Measurement Rollout Gate.")
    expect(readme).toContain("PDF renderer decision gate")
    expect(readme).toContain("docs/PDF_RENDERER_DECISION_GATE.md")
    expect(ledger).toContain("| 178 | PDF renderer decision gate | done |")
    expect(roadmap).toContain("## Phase 178: PDF Renderer Decision Gate")
    expect(roadmap).toContain("## Historical Phase 178 Handoff")
    expect(roadmap).toContain("Current next step after Phase 178:")
    expect(roadmap).toContain("Phase 179: Measurement Rollout Gate")
    expect(roadmap).toContain("Phase 179 is now complete")
    expect(artifactJobTest).toContain("historical Phase 178 handoff")
    expect(rootPackage).not.toMatch(/pdfkit|pdf-lib|jspdf|playwright|puppeteer/u)
    expect(runnerPackage).not.toMatch(/pdfkit|pdf-lib|jspdf|playwright|puppeteer/u)
  })

  it("keeps the decision report and non-work explicit", () => {
    const doc = readText("../docs/PDF_RENDERER_DECISION_GATE.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("No production PDF renderer package was added.")
    expect(doc).toContain("No DOCX work was introduced.")
    expect(doc).toContain("No backend route, worker, queue, auth, or authz behavior was implemented.")
    expect(doc).toContain("No package/document schema changed.")
    expect(doc).toContain("No production contenteditable or browser input readiness was claimed.")
  })
})
