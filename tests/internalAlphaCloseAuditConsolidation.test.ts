import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("internal alpha close audit and documentation consolidation gate", () => {
  it("closes Phases 172-180 without claiming production readiness", () => {
    const audit = readText("../docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md")

    expect(audit).toContain("Status: Phase 181 internal alpha close audit and documentation consolidation gate.")
    expect(audit).toContain("This is an audit and documentation consolidation boundary only. It does not")
    expect(audit).toContain("claim production readiness.")
    expect(audit).toContain("Phase 172 selects the first concrete internal-alpha storage direction")
    expect(audit).toContain("Phase 180 runs the bounded internal-alpha path")
    expect(audit).toContain("One canonical package v2/document v3 fixture can open")
    expect(audit).toContain("PDF generation can consume the reloaded package/session snapshot.")
    expect(audit).toContain("productionReady: false")
    expect(audit).toContain("No production contenteditable binding.")
    expect(audit).toContain("No backend server route.")
    expect(audit).toContain("No production PDF renderer or DOCX renderer.")
    expect(audit).toContain("No default measurement replacement.")
    expect(audit).toContain("No collaboration/offline semantics.")
  })

  it("adds compact current-state documentation without deleting the audit trail", () => {
    const audit = readText("../docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")

    expect(audit).toContain("docs/CURRENT_STATUS.md")
    expect(audit).toContain("docs/NEXT_PHASE_POINTER.md")
    expect(audit).toContain("Phase-specific docs remain evidence records and are not deleted or moved.")
    expect(currentStatus).toContain("Status: updated after Render API Request Envelope Contract Gate.")
    expect(currentStatus).toContain("Use this file first when orienting current work.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Proven Internal-Alpha Path")
    expect(currentStatus).toContain("Do not claim production readiness from internal-alpha evidence.")
    expect(nextPointer).toContain("Status: current after Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
  })

  it("recommends Phase 182 as a triage gate, not a production binding jump", () => {
    const audit = readText("../docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(audit).toContain("Proceed to Phase 182: V1 Hardening Backlog Triage Gate.")
    expect(audit).toContain("rank the blockers and choose the first production")
    expect(roadmap).toContain("Historical Phase 181 Handoff")
    expect(roadmap).toContain("Phase 182: V1 Hardening Backlog Triage Gate")
    expect(roadmap).toContain("Phase 182 is now complete")
  })

  it("documents Phase 181 in the README, roadmap, and ledger", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const phase180Test = readText("./internalAlphaVerticalSlice.test.ts")

    expect(readme).toContain("Internal alpha close audit and documentation consolidation gate")
    expect(readme).toContain("docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md")
    expect(readme).toContain("docs/CURRENT_STATUS.md")
    expect(readme).toContain("docs/NEXT_PHASE_POINTER.md")
    expect(ledger).toContain("| 181 | Internal alpha close audit and documentation consolidation gate | done |")
    expect(roadmap).toContain("## Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate")
    expect(roadmap).toContain("Historical Phase 181 Handoff")
    expect(roadmap).toContain("Phase 182: V1 Hardening Backlog Triage Gate")
    expect(phase180Test).toContain("historical Phase 181 handoff")
  })

  it("keeps required audit report sections visible", () => {
    const audit = readText("../docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md")

    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL-BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("## Files Changed")
    expect(audit).toContain("## Behavior Changed")
    expect(audit).toContain("## Tests Run")
    expect(audit).toContain("## Risks Left")
    expect(audit).toContain("## Intentionally Not Changed")
  })
})
