import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("WYSIWYG primary input decision gate", () => {
  it("recommends a bounded first production input path without implementing it", () => {
    const doc = readText("../docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md")

    expect(doc).toContain("Status: Phase 143 WYSIWYG primary input decision gate.")
    expect(doc).toContain("Recommend: Hybrid managed cards with a hardened contenteditable island")
    expect(doc).toContain("Do not make full-document contenteditable the primary production input in v1.")
    expect(doc).toContain("Full-document contenteditable primary")
    expect(doc).toContain("Textarea draft island")
    expect(doc).toContain("Renderer-owned segment stream primary")
    expect(doc).toContain("Hybrid managed cards + hardened contenteditable island")
    expect(doc).toContain("Thai IME")
    expect(doc).toContain("Caret/range mapping")
    expect(doc).toContain("Field chips")
    expect(doc).toContain("Rich inline style")
    expect(doc).toContain("Copy/paste/delete")
    expect(doc).toContain("Undo/redo")
    expect(doc).toContain("Exact renderer parity")
    expect(doc).toContain("Collaboration readiness")
    expect(doc).toContain("Implementation risk")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No package/document schema change.")
  })

  it("cites the required WYSIWYG and UX evidence", () => {
    const doc = readText("../docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md")

    expect(doc).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md")
    expect(doc).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")
    expect(doc).toContain("docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md")
    expect(doc).toContain("docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md")
    expect(doc).toContain("docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md")
    expect(doc).toContain("docs/EDITOR_UX_NORTH_STAR.md")
  })

  it("documents Phase 143 in the phase trail", () => {
    const boundaryDoc = readText("../docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("## PASS")
    expect(boundaryDoc).toContain("## RISK")
    expect(boundaryDoc).toContain("## UNKNOWN")
    expect(readme).toContain("WYSIWYG primary input decision gate")
    expect(readme).toContain("docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md")
    expect(ledger).toContain("| 143 | WYSIWYG primary input decision gate | done |")
    expect(roadmap).toContain("## Phase 143: WYSIWYG Primary Input Decision Gate")
  })
})
