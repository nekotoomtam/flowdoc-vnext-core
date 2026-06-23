import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("vNext WYSIWYG execution re-baseline audit", () => {
  it("records the post-120 browser-local execution boundary without claiming canonical commits", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md")

    expect(audit).toContain("Status: Phase 121 post-120 re-baseline audit.")
    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("Phase 117 maps bounded contenteditable-like segment facts")
    expect(audit).toContain("Phase 118 consumes mapped ranges and style intent")
    expect(audit).toContain("Phase 119 routes visible draft toolbar style controls")
    expect(audit).toContain("Phase 120 records browser-local atomic field-chip facts")
    expect(audit).toContain("No runtime behavior changed")
    expect(audit).toContain("No canonical rich inline commit or field-ref insertion")
  })

  it("links Phase 117-120 evidence and keeps package truth deferred", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md")
    const rangeDoc = readText("docs/TEMPLATE_BUILDER_CONTENTEDITABLE_RANGE_MAPPING_BOUNDARY.md")
    const richDoc = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_PATCH_EXECUTION_BOUNDARY.md")
    const toolbarDoc = readText("docs/TEMPLATE_BUILDER_TOOLBAR_COMMAND_DISPATCH_BOUNDARY.md")
    const fieldDoc = readText("docs/TEMPLATE_BUILDER_FIELD_CHIP_INSERT_EXECUTION_BOUNDARY.md")
    const sandboxTests = readText("tests/templateBuilderSandboxBoundary.test.ts")

    expect(rangeDoc).toContain("Phase 117")
    expect(richDoc).toContain("Phase 118")
    expect(toolbarDoc).toContain("Phase 119")
    expect(fieldDoc).toContain("Phase 120")
    expect(audit).toContain("tests/templateBuilderSandboxBoundary.test.ts")
    expect(audit).toContain("package mutation, core transactions, durable")
    expect(audit).toContain("text-engine/WASM execution deferred or off")
    expect(sandboxTests).toContain("maps contenteditable segment facts to draft UTF-16 ranges")
    expect(sandboxTests).toContain("executes rich inline style patches into browser-local styled-run facts")
    expect(sandboxTests).toContain("dispatches toolbar style commands through rich inline execution")
    expect(sandboxTests).toContain("executes field chip inserts into browser-local atomic chip facts")
  })

  it("defines managed phase cards for the next execution pass", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md")

    expect(audit).toContain("### Phase 122 Browser-local Rich Inline State Boundary")
    expect(audit).toContain("### Phase 123 Production Contenteditable Segment Capture Boundary")
    expect(audit).toContain("### Phase 124 Canonical Rich Inline Commit Planning Boundary")
    expect(audit).toContain("### Phase 125 Rich Inline Commit Bridge Boundary")
    expect(audit).toContain("### Phase 126 WYSIWYG Execution Close Audit")
    expect(audit).toContain("blocks overlapping/ambiguous runs explicitly")
    expect(audit).toContain("emits the Phase 117 segment contract")
    expect(audit).toContain("maps browser-local style runs and atomic chips to vNext terms")
    expect(audit).toContain("produces package mutation and history-ready records through vNext-native")
  })

  it("keeps the phase trail visible in README, ledger, and roadmap", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("WYSIWYG execution re-baseline audit")
    expect(readme).toContain("docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md")
    expect(ledger).toContain("| 121 | WYSIWYG execution re-baseline audit | done |")
    expect(roadmap).toContain("## Phase 121: WYSIWYG Execution Re-baseline Audit")
  })
})
