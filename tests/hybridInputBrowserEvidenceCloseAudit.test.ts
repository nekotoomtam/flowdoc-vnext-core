import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("hybrid input browser evidence close audit", () => {
  it("closes Phase 163 and Phase 164 as an audit-only evidence lane", () => {
    const audit = readText("../docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")

    expect(audit).toContain("Status: Phase 165 hybrid input browser evidence close audit.")
    expect(audit).toContain("audit and decision boundary only.")
    expect(audit).toContain("This audit does not claim production browser readiness")
    expect(audit).toContain("Phase 163 proves sandbox-local JSON-safe browser QA evidence:")
    expect(audit).toContain("Phase 164 proves optional browser-driver evidence intake:")
    expect(audit).toContain("browser-driver execution remains optional and sandbox-local.")
    expect(audit).not.toContain("production browser readiness is achieved")
    expect(audit).not.toContain("production contenteditable readiness is achieved")
  })

  it("summarizes the proven browser evidence cases", () => {
    const audit = readText("../docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")

    expect(audit).toContain("selection start/end is represented as UTF-16 offsets")
    expect(audit).toContain("caret movement is represented as a collapsed UTF-16 selection")
    expect(audit).toContain("IME composition lifecycle blocks commit while composition is active")
    expect(audit).toContain("plain text paste is normalized before package mutation")
    expect(audit).toContain("unsafe rich paste is explicitly blocked and does not become package truth")
    expect(audit).toContain("delete/backspace near a field chip transforms into a guarded field-chip")
    expect(audit).toContain("active island commit is represented through the existing")
    expect(audit).toContain("textarea fallback behavior is explicit")
    expect(audit).toContain("one active text-block island ownership remains guarded")
  })

  it("keeps production blockers, risks, and unknowns visible", () => {
    const audit = readText("../docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")

    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL-BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("Not production browser ready.")
    expect(audit).toContain("Not production contenteditable ready.")
    expect(audit).toContain("No production contenteditable binding.")
    expect(audit).toContain("No required browser-driver execution in core check.")
    expect(audit).toContain("No browser matrix acceptance.")
    expect(audit).toContain("No production DOM Range/Selection parity.")
    expect(audit).toContain("No production IME or clipboard interoperability proof.")
    expect(audit).toContain("Phase 164 validates externally supplied driver facts")
    expect(audit).toContain("Production hardening thresholds are unknown.")
  })

  it("chooses the next guarded lane before production binding", () => {
    const audit = readText("../docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")

    expect(audit).toContain("Next recommended phase: Phase 166: Hybrid Input Hardening Threshold Plan.")
    expect(audit).toContain("Before choosing a browser driver matrix or production contenteditable binding")
    expect(audit).toContain("A browser driver matrix plan can follow once those thresholds exist.")
    expect(audit).toContain("A production contenteditable binding plan should wait")
  })

  it("documents Phase 165 in README, ledger, and roadmap", () => {
    const audit = readText("../docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(audit).toContain("## Files Changed")
    expect(audit).toContain("## Behavior Changed")
    expect(audit).toContain("## Tests Run")
    expect(audit).toContain("## Intentionally Not Changed")
    expect(readme).toContain("Hybrid input browser evidence close audit")
    expect(readme).toContain("docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md")
    expect(ledger).toContain("| 165 | Hybrid input browser evidence close audit | done |")
    expect(roadmap).toContain("## Phase 165: Hybrid Input Browser Evidence Close Audit")
    expect(roadmap).toContain("## Phase 166: Hybrid Input Hardening Threshold Plan")
    expect(roadmap).toContain("## Phase 167: Browser Matrix Decision")
    expect(roadmap).toContain("## Phase 168: Guarded Input Integration Plan")
    expect(roadmap).toContain("## Phase 169: Guarded Input Runtime Slice 1")
    expect(roadmap).toContain("## Phase 170: Paste/Delete/Field-chip Input Slice")
    expect(roadmap).toContain("Current next step after Phase 170:")
    expect(roadmap).toContain("Phase 171: Input Integration Close Audit")
  })
})
