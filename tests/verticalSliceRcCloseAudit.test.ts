import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("vertical slice RC close audit", () => {
  it("closes the RC foundation pass without production readiness claims", () => {
    const audit = readText("../docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md")

    expect(audit).toContain("Status: Phase 152 vertical slice RC close audit.")
    expect(audit).toContain("This close audit does not claim production readiness.")
    expect(audit).toContain("Phase 146 provides an input-driven JSON-safe RC report builder.")
    expect(audit).toContain("Phase 151 proves the scenario, key diagnostics, rich inline commit")
    expect(audit).toContain("Not production launch ready.")
    expect(audit).toContain("No production WYSIWYG input implementation.")
    expect(audit).toContain("No concrete storage backend.")
    expect(audit).toContain("No production PDF fidelity.")
    expect(audit).toContain("No default pagination measurement replacement.")
    expect(audit).toContain("Native/WASM parity and digest pinning remain non-production.")
    expect(audit).toContain("No collaboration/offline conflict semantics.")
    expect(audit).toContain("No package/document schema change.")
  })

  it("keeps risks and unknowns visible after the RC smoke", () => {
    const audit = readText("../docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md")

    expect(audit).toContain("PDF evidence is still spike-grade and text-only.")
    expect(audit).toContain("Storage is a test-local simulation, not durability.")
    expect(audit).toContain("Rich inline v1 still uses full inline-child replacement.")
    expect(audit).toContain("Production PDF renderer library and fidelity target remain unknown.")
    expect(audit).toContain("Concrete database/object storage remains unknown.")
    expect(audit).toContain("Renderer-owned segment/hit-test evidence shape remains future work.")
  })

  it("recommends the next lane without starting implementation", () => {
    const audit = readText("../docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md")

    expect(audit).toContain("Proceed to Phase 153: Hybrid Managed Card Input Implementation Plan.")
    expect(audit).toContain("Phase 153 is still a plan boundary")
    expect(audit).toContain("production measurement drift policy and native/WASM digest pinning")
    expect(audit).toContain("production PDF renderer/fidelity selection")
    expect(audit).toContain("concrete storage/backend route architecture")
  })

  it("documents Phase 152 in the phase trail", () => {
    const audit = readText("../docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(readme).toContain("Vertical slice RC close audit")
    expect(readme).toContain("docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md")
    expect(ledger).toContain("| 152 | RC close audit | done |")
    expect(roadmap).toContain("## Phase 152: RC Close Audit")
  })
})
