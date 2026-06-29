import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("measurement rollout gate", () => {
  it("allows measurement evidence only for the guarded internal-alpha slice", () => {
    const doc = readText("../docs/MEASUREMENT_ROLLOUT_GATE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const pdfDecisionTest = readText("./pdfRendererDecisionGate.test.ts")

    expect(doc).toContain("Status: Phase 179 measurement rollout gate.")
    expect(doc).toContain("Allow guarded internal-alpha measurement evidence")
    expect(doc).toContain("Do not replace `measureVNextText(...)` defaults.")
    expect(doc).toContain("Do not promote renderer-backed measurement to production readiness.")
    expect(doc).toContain("Phase 135")
    expect(doc).toContain("Phase 148")
    expect(doc).toContain("Phase 175")
    expect(doc).toContain("Phase 177")
    expect(doc).toContain("Phase 178")
    expect(doc).toContain("Phase 180 can use the existing measurement gate as internal-alpha evidence")
    expect(doc).toContain("Production measurement rollout remains blocked.")
    expect(doc).toContain("Next recommended phase: Phase 180: Internal Alpha Vertical Slice.")
    expect(readme).toContain("Measurement rollout gate")
    expect(readme).toContain("docs/MEASUREMENT_ROLLOUT_GATE.md")
    expect(ledger).toContain("| 179 | Measurement rollout gate | done |")
    expect(roadmap).toContain("## Phase 179: Measurement Rollout Gate")
    expect(roadmap).toContain("Current next step after Phase 179:")
    expect(roadmap).toContain("Phase 180: Internal Alpha Vertical Slice")
    expect(pdfDecisionTest).toContain("historical Phase 178 handoff")
  })

  it("keeps production rollout blockers and non-work explicit", () => {
    const doc = readText("../docs/MEASUREMENT_ROLLOUT_GATE.md")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreGate = readText("../src/generation/verticalSliceMeasurementGate.ts")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Production:")
    expect(doc).toContain("blocked until digest is present")
    expect(doc).toContain("blocked until native/WASM parity is matched")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurer binding.")
    expect(doc).toContain("No package/document schema change.")
    expect(coreGate).toContain("defaultMeasurementReplacement: false")
    expect(coreGate).toContain("productionBinding: false")
    expect(coreGate).toContain("paginationMutation: false")
    expect(coreMeasurement).not.toContain("MEASUREMENT_ROLLOUT_GATE")
  })
})
