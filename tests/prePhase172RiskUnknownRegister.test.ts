import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("pre Phase 172 risk unknown register", () => {
  it("keeps the register as documentation only before storage choice", () => {
    const doc = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")

    expect(doc).toContain("Status: pre-Phase 172 risk and unknown sharpening.")
    expect(doc).toContain("documentation and guard boundary only")
    expect(doc).toContain("does not implement storage")
    expect(doc).toContain("production input")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production browser readiness is achieved")
  })

  it("prevents Phase 172 from inheriting input readiness claims", () => {
    const doc = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")

    expect(doc).toContain("## Storage Gate Rule")
    expect(doc).toContain("internal-alpha sandbox evidence, not production input truth")
    expect(doc).toContain("production contenteditable readiness")
    expect(doc).toContain("production browser readiness")
    expect(doc).toContain("production clipboard readiness")
    expect(doc).toContain("collaboration/offline replay readiness")
    expect(doc).toContain("durable packet refresh semantics")
  })

  it("sharpens risk buckets for input, commit, app shell, and storage coupling", () => {
    const doc = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")

    expect(doc).toContain("Input/browser evidence:")
    expect(doc).toContain("Thai IME evidence is bounded")
    expect(doc).toContain("Browser-driver evidence is optional/sandbox-local")
    expect(doc).toContain("Commit and rich-inline semantics:")
    expect(doc).toContain("full `text-block.rich-inline.replace`")
    expect(doc).toContain("Field-chip delete, paste, copy, and replace-with-text")
    expect(doc).toContain("App-shell and fallback ownership:")
    expect(doc).toContain("Product-shell mount, packet refresh, stale capture handling")
    expect(doc).toContain("Storage coupling:")
    expect(doc).toContain("must not imply production input")
  })

  it("keeps unknowns explicit before storage work starts", () => {
    const doc = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")

    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("Exact production contenteditable binding strategy.")
    expect(doc).toContain("Browser-driver matrix, artifact retention policy")
    expect(doc).toContain("Thai IME acceptance threshold for beta.")
    expect(doc).toContain("Granular rich-inline operation strategy")
    expect(doc).toContain("Concrete storage durability target")
  })

  it("updates the project trail without changing the next phase", () => {
    const doc = readText("../docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const closeAuditTest = readText("./guardedInputIntegrationCloseAudit.test.ts")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase remains: Phase 172: Concrete Storage Choice Gate.")
    expect(readme).toContain("Pre-Phase 172 risk / unknown register")
    expect(readme).toContain("docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")
    expect(ledger).toContain("Pre-Phase 172 Risk / Unknown Register")
    expect(roadmap).toContain("Pre-Phase 172 Risk / Unknown Register")
    expect(roadmap).toContain("## Phase 172: Concrete Storage Choice Gate")
    expect(roadmap).toContain("Current next step after Phase 172:")
    expect(roadmap).toContain("Phase 173: External File-Backed Storage Adapter Slice")
    expect(closeAuditTest).toContain("docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md")
  })
})
