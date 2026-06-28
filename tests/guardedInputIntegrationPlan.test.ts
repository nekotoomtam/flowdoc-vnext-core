import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("guarded input integration plan", () => {
  it("keeps Phase 168 as a plan boundary after threshold and matrix decisions", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")

    expect(doc).toContain("Status: Phase 168 guarded input integration plan.")
    expect(doc).toContain("after the Phase 166 hardening thresholds")
    expect(doc).toContain("Phase 167 browser")
    expect(doc).toContain("This is a plan boundary only.")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production browser readiness is achieved")
    expect(doc).not.toContain("production-ready input")
  })

  it("defines ownership boundaries for the guarded integration", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")

    expect(doc).toContain("Managed card runtime:")
    expect(doc).toContain("Active text-block island runtime:")
    expect(doc).toContain("Command policy:")
    expect(doc).toContain("Commit bridge:")
    expect(doc).toContain("Fallback textarea path:")
    expect(doc).toContain("App-shell integration:")
    expect(doc).toContain("mounts only for one eligible active text block")
    expect(doc).toContain("must close or route to fallback before another island opens")
  })

  it("separates browser-local state from vNext core truth", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")

    expect(doc).toContain("## Browser-Local Versus Core Truth")
    expect(doc).toContain("Browser-local only:")
    expect(doc).toContain("Commits into vNext core:")
    expect(doc).toContain("Never commits into vNext core:")
    expect(doc).toContain("live DOM selection or Range objects")
    expect(doc).toContain("accepted `text-block.rich-inline.replace` command input")
    expect(doc).toContain("arbitrary DOM HTML")
    expect(doc).toContain("unsupported block edits")
  })

  it("keeps guards visible for rich text, chips, IME, selection, paste/delete, and fallback", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")

    expect(doc).toContain("Styled runs:")
    expect(doc).toContain("Atomic inline field chips:")
    expect(doc).toContain("IME composition:")
    expect(doc).toContain("Selection and caret:")
    expect(doc).toContain("Paste and delete:")
    expect(doc).toContain("Unsupported blocks:")
    expect(doc).toContain("composition is active")
    expect(doc).toContain("selection/caret facts are UTF-16 offsets")
    expect(doc).toContain("unsafe rich paste and arbitrary DOM HTML are blocked")
    expect(doc).toContain("fallback textarea")
  })

  it("defines packet refresh and next guarded runtime sequence", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")

    expect(doc).toContain("## Packet Refresh")
    expect(doc).toContain("Commit bridge rejects stale revision or active block mismatch.")
    expect(doc).toContain("App shell refreshes the packet from canonical package state")
    expect(doc).toContain("Phase 169: Guarded Input Runtime Slice 1.")
    expect(doc).toContain("Phase 170: Paste/Delete/Field-chip Input Slice.")
    expect(doc).toContain("Phase 171: Input Integration Close Audit.")
  })

  it("documents Phase 168 in the phase trail and advances the roadmap", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_PLAN.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 169: Guarded Input Runtime Slice 1.")
    expect(readme).toContain("Guarded input integration plan")
    expect(readme).toContain("docs/GUARDED_INPUT_INTEGRATION_PLAN.md")
    expect(ledger).toContain("| 168 | Guarded input integration plan | done |")
    expect(roadmap).toContain("## Phase 168: Guarded Input Integration Plan")
    expect(roadmap).toContain("## Phase 169: Guarded Input Runtime Slice 1")
    expect(roadmap).toContain("## Phase 170: Paste/Delete/Field-chip Input Slice")
    expect(roadmap).toContain("## Phase 171: Input Integration Close Audit")
    expect(roadmap).toContain("Current next step after Phase 171:")
    expect(roadmap).toContain("Phase 172: Concrete Storage Choice Gate")
  })
})
