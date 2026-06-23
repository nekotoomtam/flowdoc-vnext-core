import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("vNext WYSIWYG execution close audit", () => {
  it("closes the Phase 122-125 execution foundation without claiming production WYSIWYG", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")

    expect(audit).toContain("Status: Phase 126 post-125 WYSIWYG execution close audit.")
    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("Phase 122 consolidated browser-local styled-run and atomic field-chip facts")
    expect(audit).toContain("Phase 123 inserted bounded contenteditable segment capture")
    expect(audit).toContain("Phase 124 mapped browser-local rich inline state")
    expect(audit).toContain("Phase 125 executed accepted Phase 124 plans")
    expect(audit).toContain("This is not a production WYSIWYG close")
    expect(audit).toContain("No runtime behavior changed")
  })

  it("links the execution evidence to docs, code, and tests", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")
    const richStateDoc = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_STATE_BOUNDARY.md")
    const segmentDoc = readText("docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md")
    const commitPlanDoc = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md")
    const commitBridgeDoc = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md")
    const richCommitSource = readText("src/authoring/richInlineCommit.ts")
    const sandboxBridgeSource = readText("examples/template-builder-sandbox/src/mutationBridge.ts")
    const sandboxTests = readText("tests/templateBuilderSandboxBoundary.test.ts")
    const richCommitTests = readText("tests/richInlineCommit.test.ts")

    expect(richStateDoc).toContain("Status: Phase 122")
    expect(segmentDoc).toContain("Status: Phase 123")
    expect(commitPlanDoc).toContain("Status: Phase 124")
    expect(commitBridgeDoc).toContain("Status: Phase 125")
    expect(audit).toContain("src/authoring/richInlineCommit.ts")
    expect(audit).toContain("examples/template-builder-sandbox/src/mutationBridge.ts")
    expect(audit).toContain("tests/templateBuilderSandboxBoundary.test.ts")
    expect(audit).toContain("tests/richInlineCommit.test.ts")
    expect(richCommitSource).toContain("runVNextRichInlineCommit")
    expect(richCommitSource).toContain("createVNextRichInlineCommitHistoryRecord")
    expect(sandboxBridgeSource).toContain("commitRichInline")
    expect(sandboxBridgeSource).toContain("stale-rich-inline-plan")
    expect(sandboxTests).toContain("commits Phase 124 rich inline plans through the sandbox bridge")
    expect(richCommitTests).toContain("replaces text-block inline children with history-ready rich inline facts")
  })

  it("keeps unresolved production gaps explicit", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")

    expect(audit).toContain("Rich undo/redo replay is not implemented")
    expect(audit).toContain("full inline-child replacement")
    expect(audit).toContain("Production DOM `Range`")
    expect(audit).toContain("durable key history stores")
    expect(audit).toContain("Live/exact outputs are invalidated, not rendered")
    expect(audit).toContain("Persistence and collaboration")
    expect(audit).toContain("Whether `text-block.rich-inline.replace` remains the long-term canonical")
  })

  it("records next cards and keeps the phase trail visible", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(audit).toContain("Phase 127 Rich Inline Undo/Redo Replay Boundary")
    expect(audit).toContain("Phase 128 Production Contenteditable Surface Hardening Boundary")
    expect(audit).toContain("Phase 129 Rich Inline Persistence/Session Boundary")
    expect(audit).toContain("Phase 130 Rich Inline Live/Exact Parity Audit")
    expect(readme).toContain("WYSIWYG execution close audit")
    expect(readme).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md")
    expect(ledger).toContain("| 126 | WYSIWYG execution close audit | done |")
    expect(roadmap).toContain("## Phase 126: WYSIWYG Execution Close Audit")
  })
})
