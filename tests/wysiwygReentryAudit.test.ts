import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("vNext WYSIWYG re-entry audit", () => {
  it("records the production editing gap without claiming runtime behavior", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md")

    expect(audit).toContain("Status: Phase 116 re-entry audit.")
    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("Phase 85 closed the browser-local WYSIWYG foundation")
    expect(audit).toContain("Phase 115 proved native rustybuzz smoke evidence")
    expect(audit).toContain("FlowDoc text offsets, not raw rustybuzz byte")
    expect(audit).toContain("No runtime behavior changed")
    expect(audit).toContain("No contenteditable runtime behavior")
  })

  it("defines managed phase cards through Phase 120", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md")

    expect(audit).toContain("### Phase 117 Contenteditable DOM Range Mapping Boundary")
    expect(audit).toContain("### Phase 118 Rich Inline Range Patch Execution Boundary")
    expect(audit).toContain("### Phase 119 Toolbar Command Dispatch Boundary")
    expect(audit).toContain("### Phase 120 Field Chip Insert Execution Boundary")
    expect(audit).toContain("package truth, history, live layout, exact output")
    expect(audit).toContain("Phase 117 caret mapping")
    expect(audit).toContain("Phase 83 field chip intent")
  })

  it("keeps the phase trail and prior WYSIWYG/text-engine evidence linked", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md")
    const closeAudit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md")
    const smokeCorpus = readText("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(closeAudit).toContain("Status: Phase 85 close audit.")
    expect(smokeCorpus).toContain("Status: Phase 115 rustybuzz smoke corpus boundary.")
    expect(audit).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md")
    expect(audit).toContain("Phases 113-115")
    expect(readme).toContain("WYSIWYG re-entry audit")
    expect(readme).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md")
    expect(ledger).toContain("| 116 | WYSIWYG re-entry audit | done |")
    expect(roadmap).toContain("## Phase 116: WYSIWYG Re-entry Audit")
  })
})
