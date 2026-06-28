import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("guarded input integration close audit", () => {
  it("closes Phase 166 through Phase 170 as an audit boundary only", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")

    expect(doc).toContain("Status: Phase 171 guarded input integration close audit.")
    expect(doc).toContain("Phases\n166-170")
    expect(doc).toContain("This is an audit and decision boundary only.")
    expect(doc).toContain("Phase 166 defines PASS/WARNING/BLOCKED/UNKNOWN")
    expect(doc).toContain("Phase 167 selects the v1 Windows Chromium/Edge")
    expect(doc).toContain("Phase 168 defines guarded ownership")
    expect(doc).toContain("Phase 169 implements the first sandbox-local guarded runtime slice")
    expect(doc).toContain("Phase 170 implements sandbox-local paste/delete/field-chip")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production browser readiness is achieved")
  })

  it("summarizes proven input cases without production claims", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")

    expect(doc).toContain("## Proven")
    expect(doc).toContain("Selection/caret facts are represented as UTF-16 offsets")
    expect(doc).toContain("One active text-block island can produce a safe planned bridge request.")
    expect(doc).toContain("Composition-active commit and paste/delete actions are blocked.")
    expect(doc).toContain("Plain paste and normalized paste decisions are JSON-safe.")
    expect(doc).toContain("Unsafe rich paste and arbitrary DOM HTML are blocked.")
    expect(doc).toContain("Delete/backspace near field chips transforms")
    expect(doc).toContain("Field-chip copy and replace-with-text remain atomic")
    expect(doc).toContain("Unsupported blocks and ineligible text blocks")
  })

  it("keeps production blockers and risks visible", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")

    expect(doc).toContain("## Production Blockers")
    expect(doc).toContain("No production DOM/contenteditable binding exists.")
    expect(doc).toContain("No production clipboard binding exists.")
    expect(doc).toContain("Thai IME behavior still needs selected-matrix browser evidence")
    expect(doc).toContain("full rich inline replacement")
    expect(doc).toContain("Field-chip rich inline intents are planned evidence only")
    expect(doc).toContain("Product-shell mount, packet refresh implementation, and fallback UX")
  })

  it("records the decision as internal-alpha sandbox evidence only", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")

    expect(doc).toContain("## Decision")
    expect(doc).toContain("Accepted for internal-alpha sandbox evidence:")
    expect(doc).toContain("Blocked for production readiness:")
    expect(doc).toContain("Production contenteditable readiness is not claimed.")
    expect(doc).toContain("Production browser readiness is not claimed.")
    expect(doc).toContain("Collaboration/offline readiness is not claimed.")
  })

  it("documents Phase 171 in the phase trail and advances the roadmap", () => {
    const doc = readText("../docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const riskRegister = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 172: Concrete Storage Choice Gate.")
    expect(doc).toContain("docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")
    expect(readme).toContain("Guarded input integration close audit")
    expect(readme).toContain("docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md")
    expect(readme).toContain("docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")
    expect(ledger).toContain("| 171 | Guarded input integration close audit | done |")
    expect(ledger).toContain("Pre-Phase 172 Risk / Unknown Register")
    expect(roadmap).toContain("## Phase 171: Input Integration Close Audit")
    expect(roadmap).toContain("## Pre-Phase 172 Risk / Unknown Register")
    expect(roadmap).toContain("Current next step after Phase 171:")
    expect(roadmap).toContain("Phase 172: Concrete Storage Choice Gate")
    expect(riskRegister).toContain("storage candidates must label input/browser readiness as a dependency risk")
  })
})
