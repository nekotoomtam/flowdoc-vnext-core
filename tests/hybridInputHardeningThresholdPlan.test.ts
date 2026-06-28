import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("hybrid input hardening threshold plan", () => {
  it("defines PASS WARNING BLOCKED UNKNOWN policy without implementation claims", () => {
    const doc = readText("../docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md")

    expect(doc).toContain("Status: Phase 166 hybrid input hardening threshold plan.")
    expect(doc).toContain("This is a plan boundary only.")
    expect(doc).toContain("PASS: evidence satisfies the accepted threshold")
    expect(doc).toContain("WARNING: evidence is incomplete or narrow")
    expect(doc).toContain("BLOCKED: evidence is missing or unsafe")
    expect(doc).toContain("UNKNOWN: evidence has not been collected")
    expect(doc).toContain("UNKNOWN cannot be silently treated as PASS.")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production-ready input")
  })

  it("sets thresholds for every hybrid input hardening area", () => {
    const doc = readText("../docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md")

    expect(doc).toContain("Selection/caret:")
    expect(doc).toContain("IME composition:")
    expect(doc).toContain("Paste/delete:")
    expect(doc).toContain("Field-chip atomicity:")
    expect(doc).toContain("Active island commit:")
    expect(doc).toContain("Fallback behavior:")
    expect(doc).toContain("JSON-safe report completeness:")
    expect(doc).toContain("selection and caret facts are UTF-16 offsets")
    expect(doc).toContain("commit can run while composition is active")
    expect(doc).toContain("arbitrary DOM HTML becomes package truth")
    expect(doc).toContain("field chips stay atomic")
    expect(doc).toContain("existing `text-block.rich-inline.replace` bridge")
    expect(doc).toContain("unsupported or ineligible blocks reject or route to explicit textarea")
    expect(doc).toContain("reports include source, mode, version, status")
  })

  it("separates v1 blockers from warnings", () => {
    const doc = readText("../docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md")

    expect(doc).toContain("## v1 Blockers")
    expect(doc).toContain("Cross-block or DOM-object selection/caret facts.")
    expect(doc).toContain("Commit while IME composition is active.")
    expect(doc).toContain("Arbitrary DOM HTML becoming package truth.")
    expect(doc).toContain("Field-chip internals editable as plain text.")
    expect(doc).toContain("Unsafe capture producing a commit bridge request.")
    expect(doc).toContain("Multiple active text-block islands committing.")
    expect(doc).toContain("## v1 Warnings")
    expect(doc).toContain("Sandbox-local IME evidence before broader driver coverage.")
    expect(doc).toContain("Plain-text fallback for unsupported rich paste.")
    expect(doc).toContain("v1 full rich inline child replacement")
  })

  it("documents Phase 166 in the phase trail and advances the roadmap", () => {
    const doc = readText("../docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md")
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
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 167: Browser Matrix Decision.")
    expect(readme).toContain("Hybrid input hardening threshold plan")
    expect(readme).toContain("docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md")
    expect(ledger).toContain("| 166 | Hybrid input hardening threshold plan | done |")
    expect(roadmap).toContain("## Phase 166: Hybrid Input Hardening Threshold Plan")
    expect(roadmap).toContain("## Phase 167: Browser Matrix Decision")
    expect(roadmap).toContain("## Phase 168: Guarded Input Integration Plan")
    expect(roadmap).toContain("Current next step after Phase 168:")
    expect(roadmap).toContain("Phase 169: Guarded Input Runtime Slice 1")
  })
})
