import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("hybrid managed card input implementation plan", () => {
  it("defines Phase 153 as a plan-only boundary from the Phase 143 input decision", () => {
    const doc = readText("../docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")

    expect(doc).toContain("Status: Phase 153 hybrid managed card input implementation plan.")
    expect(doc).toContain("This is a plan boundary only.")
    expect(doc).toContain("Phase 143 selected hybrid managed cards with a hardened contenteditable")
    expect(doc).toContain("Phase 152 recommends this plan as the next lane")
    expect(doc).toContain("No runtime behavior changed.")
    expect(doc).not.toContain("production input readiness is achieved")
    expect(doc).not.toContain("production-ready input")
  })

  it("keeps the Phase 144 rich inline policy bounded to v1 single-user claims", () => {
    const doc = readText("../docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")

    expect(doc).toContain("Phase 144 accepts `text-block.rich-inline.replace` for the v1 single-user")
    expect(doc).toContain("For v1 rich inline commits, routes through `text-block.rich-inline.replace`.")
    expect(doc).toContain("Does not claim collaboration/offline merge safety.")
    expect(doc).toContain("granular rich inline operation upgrade before collaboration/offline claims")
  })

  it("sets ownership, browser-local, core-commit, guard, and fallback policies", () => {
    const doc = readText("../docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")

    expect(doc).toContain("Managed Card Runtime")
    expect(doc).toContain("Active Text-Block Island Runtime")
    expect(doc).toContain("Command Policy")
    expect(doc).toContain("Commit Bridge")
    expect(doc).toContain("Fallback Textarea Path")
    expect(doc).toContain("App-Shell Integration")
    expect(doc).toContain("Browser-local:")
    expect(doc).toContain("Commits into vNext core:")
    expect(doc).toContain("Styled runs:")
    expect(doc).toContain("Atomic inline field chips:")
    expect(doc).toContain("IME composition:")
    expect(doc).toContain("Selection and caret:")
    expect(doc).toContain("Paste/delete:")
    expect(doc).toContain("Unsupported blocks:")
    expect(doc).toContain("Use textarea/plain-text editing")
  })

  it("documents the follow-up phase sequence and explicit non-work", () => {
    const doc = readText("../docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")

    expect(doc).toContain("Input runtime ownership boundary.")
    expect(doc).toContain("Active text block island boundary.")
    expect(doc).toContain("DOM binding smoke.")
    expect(doc).toContain("Commit bridge smoke.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No full-document contenteditable.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No storage/backend route.")
    expect(doc).toContain("No PDF/DOCX renderer work.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No legacy editor runtime copy.")
  })

  it("documents Phase 153 in the phase trail", () => {
    const boundaryDoc = readText("../docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("## PASS")
    expect(boundaryDoc).toContain("## FAIL / BLOCKER")
    expect(boundaryDoc).toContain("## RISK")
    expect(boundaryDoc).toContain("## UNKNOWN")
    expect(boundaryDoc).toContain("## Files Changed")
    expect(boundaryDoc).toContain("## Behavior Changed")
    expect(boundaryDoc).toContain("## Tests Run")
    expect(boundaryDoc).toContain("## Risks Left")
    expect(boundaryDoc).toContain("## Intentionally Not Changed")
    expect(readme).toContain("Hybrid managed card input implementation plan")
    expect(readme).toContain("docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md")
    expect(ledger).toContain("| 153 | Hybrid managed card input implementation plan | done |")
    expect(roadmap).toContain("## Phase 153: Hybrid Managed Card Input Implementation Plan")
  })

  it("keeps the roadmap next step current after the Phase 153 plan lane starts moving", () => {
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(roadmap).toContain("## Current Next Recommended Phase")
    expect(roadmap).toContain("## Phase 154: Input Runtime Ownership Boundary")
    expect(roadmap).toContain("## Phase 155: Active Text-Block Island Boundary")
    expect(roadmap).toContain("## Phase 156: Hybrid Command Policy Boundary")
    expect(roadmap).toContain("## Phase 157: DOM Binding Smoke Boundary")
    expect(roadmap).toContain("## Phase 158: Active Island Commit Bridge Smoke")
    expect(roadmap).toContain("## Phase 159: Field Chip Delete / Copy / Paste Command Boundary")
    expect(roadmap).toContain("## Phase 160: Paste / Delete Preflight Boundary")
    expect(roadmap).toContain("## Phase 161: Renderer Segment / Hit-Test Evidence Boundary")
    expect(roadmap).toContain("## Phase 162: Hybrid Input Close Audit")
    expect(roadmap).toContain("## Phase 163: Hybrid Input Browser QA Boundary")
    expect(roadmap).toContain("## Phase 164: Optional Browser Driver Smoke Boundary")
    expect(roadmap).toContain("Current next step after Phase 164:")
    expect(roadmap).toContain("Phase 165: Hybrid Input Browser Evidence Close Audit")
    expect(roadmap).toContain("## Historical Phase 18 First Implementation Recommendation")
    expect(roadmap).toContain("historical first implementation recommendation from the Phase 18")
    expect(roadmap).toContain("not the current next step after Phase 153")
    expect(roadmap).not.toContain("## First Recommended Implementation Phase")
    expect(roadmap).not.toContain("Start with Phase 19 or Phase 20.")
    expect(roadmap).toContain("- production contenteditable implementation;")
    expect(roadmap).toContain("- full-document contenteditable;")
    expect(roadmap).toContain("- collaboration/offline behavior;")
    expect(roadmap).toContain("- storage/backend route;")
    expect(roadmap).toContain("- PDF/DOCX renderer work;")
    expect(roadmap).toContain("- package/document schema change;")
    expect(roadmap).toContain("- legacy editor runtime copy;")
  })
})
