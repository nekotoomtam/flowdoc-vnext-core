import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("v1 hardening backlog triage gate", () => {
  it("ranks the production hardening backlog and selects measurement first", () => {
    const doc = readText("../docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md")

    expect(doc).toContain("Status: Phase 182 v1 hardening backlog triage gate.")
    expect(doc).toContain("Phase 182 ranks the remaining production blockers")
    expect(doc).toContain("## Ranked Hardening Backlog")
    expect(doc).toContain("| 1 | Measurement rollout / digest / parity / drift | Select first |")
    expect(doc).toContain("| 2 | Production storage durability / transactions | Defer until measurement gate starts |")
    expect(doc).toContain("| 3 | Backend routes + auth/authz | Defer behind storage durability |")
    expect(doc).toContain("| 4 | PDF renderer fidelity | Defer behind measurement hardening |")
    expect(doc).toContain("| 5 | Production input/contenteditable binding | Defer behind measurement and durable replay assumptions |")
    expect(doc).toContain("| 6 | DOCX renderer | Defer behind PDF/measurement direction |")
    expect(doc).toContain("| 7 | Collaboration/offline | Defer behind durable storage and operation replay |")
    expect(doc).toContain("| 8 | Package/document schema changes if needed | Defer until evidence forces a change |")
    expect(doc).toContain("Select measurement rollout / digest / parity / drift as the first production")
  })

  it("keeps internal-alpha evidence separate from production readiness", () => {
    const doc = readText("../docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md")

    expect(doc).toContain("This is a triage and decision boundary only.")
    expect(doc).toContain("does not implement production")
    expect(doc).toContain("input, backend routes, storage durability")
    expect(doc).toContain("Internal-alpha evidence remains bounded evidence")
    expect(doc).toContain("readiness.")
    expect(doc).toContain("No default measurement replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No backend route/server/auth/authz behavior.")
    expect(doc).toContain("No production PDF/DOCX renderer.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No legacy editor runtime copy.")
  })

  it("explains why non-selected lanes are deferred", () => {
    const doc = readText("../docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md")

    expect(doc).toContain("Input/contenteditable is deferred because the guarded input lane is")
    expect(doc).toContain("Backend routes and auth/authz are deferred because route-shaped helpers are")
    expect(doc).toContain("Production storage is deferred behind the first measurement gate")
    expect(doc).toContain("PDF fidelity is deferred because Phase 178 explicitly delayed production")
    expect(doc).toContain("DOCX is deferred because it shares measurement/output risks")
    expect(doc).toContain("Collaboration/offline is deferred because it depends on durable logs")
    expect(doc).toContain("Schema changes are deferred unless later hardening evidence proves")
  })

  it("advances current pointers to the measurement hardening gate", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")

    expect(currentStatus).toContain("Status: updated after Accepted Summary Manifest Population.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("1. Measurement rollout / digest / parity / drift.")
    expect(currentStatus).toContain("8. Package/document schema changes, if any are required later.")
    expect(currentStatus).toContain("Do not replace the default measurer")

    expect(nextPointer).toContain("Status: current after Accepted Summary Manifest Population.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(nextPointer).toContain("No default measurement replacement.")
    expect(nextPointer).toContain("No pagination mutation.")
  })

  it("documents Phase 182 in the README, roadmap, and ledger", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("V1 hardening backlog triage gate ranks the remaining production blockers")
    expect(readme).toContain("docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md")
    expect(ledger).toContain("| 182 | V1 hardening backlog triage gate | done |")
    expect(ledger).toContain("## Phase 182 V1 Hardening Backlog Triage Gate")
    expect(roadmap).toContain("## Phase 182: V1 Hardening Backlog Triage Gate")
    expect(roadmap).toContain("Historical Phase 182 Handoff")
    expect(roadmap).toContain("Phase 183: Measurement Digest Parity Drift Hardening Gate")
    expect(roadmap).toContain("Historical Phase 181 Handoff")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText("../docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
  })
})
