import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("rich inline operation decision boundary", () => {
  it("accepts full inline-child replacement for v1 while blocking collaboration claims", () => {
    const doc = readText("../docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md")

    expect(doc).toContain("Status: Phase 144 granular rich inline operation decision boundary.")
    expect(doc).toContain("Accept `text-block.rich-inline.replace` as the v1 single-user rich inline")
    expect(doc).toContain("operation for the first vertical slice.")
    expect(doc).toContain("Do not claim this operation is collaboration-safe or offline-merge-safe.")
    expect(doc).toContain("Full inline-child replace")
    expect(doc).toContain("Range style patch operation")
    expect(doc).toContain("Field chip insert/remove operation")
    expect(doc).toContain("Text insert/delete with mark context")
    expect(doc).toContain("Granular rich inline operations become required")
    expect(doc).toContain("No operation schema change.")
    expect(doc).toContain("No package/document schema change.")
  })

  it("guards the current rich inline source shape as replacement-only for v1", () => {
    const source = readText("../src/authoring/richInlineCommit.ts")
    const intentHistory = readText("../src/authoring/intentHistory.ts")

    expect(source).toContain('kind: "text-block.rich-inline.replace"')
    expect(source).toContain("children: readonly InlineNode[]")
    expect(source).toContain("replaceTextBlockChildren")
    expect(intentHistory).toContain('"text-block.rich-inline.replace"')
    expect(source).not.toContain("rich-inline.style.patch")
    expect(source).not.toContain("rich-inline.field-chip.insert")
    expect(source).not.toContain("rich-inline.field-chip.remove")
  })

  it("documents Phase 144 in the phase trail", () => {
    const boundaryDoc = readText("../docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("## PASS")
    expect(boundaryDoc).toContain("## RISK")
    expect(boundaryDoc).toContain("## UNKNOWN")
    expect(readme).toContain("Rich inline operation decision boundary")
    expect(readme).toContain("docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md")
    expect(ledger).toContain("| 144 | Granular rich inline operation decision boundary | done |")
    expect(roadmap).toContain("## Phase 144: Granular Rich Inline Operation Decision Boundary")
  })
})
