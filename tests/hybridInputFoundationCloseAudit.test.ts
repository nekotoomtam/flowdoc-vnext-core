import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("hybrid input foundation close audit", () => {
  it("closes Phases 154-161 without production input readiness claims", () => {
    const audit = readText("../docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md")

    expect(audit).toContain("Status: Phase 162 hybrid input foundation close audit.")
    expect(audit).toContain("This close audit does not claim production input readiness.")
    expect(audit).toContain("Phase 154 provides a browser-local input runtime ownership classifier")
    expect(audit).toContain("Phase 155 provides a DOM-free active text-block island lifecycle")
    expect(audit).toContain("Phase 156 provides a DOM-free command policy matrix")
    expect(audit).toContain("Phase 157 provides JSON-safe active text-block DOM binding smoke facts")
    expect(audit).toContain("Phase 158 proves accepted island capture facts can route")
    expect(audit).toContain("Phase 159 provides pure field-chip command contracts")
    expect(audit).toContain("Phase 160 provides paste/delete preflight classification")
    expect(audit).toContain("Phase 161 provides renderer segment and hit-test evidence facts")
    expect(audit).toContain("Not production input ready.")
    expect(audit).not.toContain("production input readiness is achieved")
    expect(audit).not.toContain("production-ready input")
  })

  it("keeps production blockers, risks, and unknowns visible", () => {
    const audit = readText("../docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md")

    expect(audit).toContain("No production contenteditable implementation.")
    expect(audit).toContain("No full-document contenteditable.")
    expect(audit).toContain("No browser-driver QA over real selection, caret, IME, paste, or delete.")
    expect(audit).toContain("No DOM Range/Selection parity claim.")
    expect(audit).toContain("No renderer execution or renderer/browser caret parity.")
    expect(audit).toContain("No collaboration/offline behavior.")
    expect(audit).toContain("No storage/backend route.")
    expect(audit).toContain("No PDF/DOCX renderer work.")
    expect(audit).toContain("No package/document schema change.")
    expect(audit).toContain("No legacy editor runtime copy.")
    expect(audit).toContain("The commit bridge still relies on v1 full rich inline child replacement.")
    expect(audit).toContain("Production browser compatibility for selection, caret, composition, and paste")
    expect(audit).toContain("Final renderer segment protocol and hit-test confidence thresholds are")
  })

  it("recommends browser QA as the next guarded lane", () => {
    const audit = readText("../docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md")

    expect(audit).toContain("Proceed to Phase 163: Hybrid Input Browser QA Boundary.")
    expect(audit).toContain("the next safety question is whether those contracts survive real browser")
    expect(audit).toContain("Phase 163 should remain a QA/evidence boundary")
    expect(audit).toContain("production measurement rollout and drift policy")
    expect(audit).toContain("storage/backend concrete route and durability strategy")
    expect(audit).toContain("production PDF/DOCX renderer fidelity")
    expect(audit).toContain("rich inline operation granularity beyond v1 full replacement")
  })

  it("documents Phase 162 in the phase trail and advances the roadmap", () => {
    const audit = readText("../docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("## Files Changed")
    expect(audit).toContain("## Behavior Changed")
    expect(audit).toContain("## Tests Run")
    expect(audit).toContain("## Risks Left")
    expect(audit).toContain("## Intentionally Not Changed")
    expect(readme).toContain("Hybrid input foundation close audit")
    expect(readme).toContain("docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md")
    expect(ledger).toContain("| 162 | Hybrid input foundation close audit | done |")
    expect(roadmap).toContain("## Phase 162: Hybrid Input Close Audit")
    expect(roadmap).toContain("## Phase 163: Hybrid Input Browser QA Boundary")
    expect(roadmap).toContain("## Phase 164: Optional Browser Driver Smoke Boundary")
    expect(roadmap).toContain("## Phase 165: Hybrid Input Browser Evidence Close Audit")
    expect(roadmap).toContain("## Phase 166: Hybrid Input Hardening Threshold Plan")
    expect(roadmap).toContain("Current next step after Phase 166:")
    expect(roadmap).toContain("Phase 167: Browser Matrix Decision")
  })
})
