import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("hybrid input browser matrix decision", () => {
  it("chooses a narrow v1 browser OS IME matrix", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")

    expect(doc).toContain("Status: Phase 167 browser matrix decision.")
    expect(doc).toContain("This is a decision boundary only.")
    expect(doc).toContain("Chromium-family browser on Windows.")
    expect(doc).toContain("Microsoft Edge on Windows as the named product browser target.")
    expect(doc).toContain("English keyboard input path.")
    expect(doc).toContain("Thai keyboard/IME input path.")
    expect(doc).toContain("IME composition lifecycle evidence")
    expect(doc).not.toContain("production browser readiness is achieved")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
  })

  it("defers broad browser scope for v1", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")

    expect(doc).toContain("## Deferred")
    expect(doc).toContain("Firefox.")
    expect(doc).toContain("Safari.")
    expect(doc).toContain("Mobile browsers.")
    expect(doc).toContain("Complex CJK IME matrices.")
    expect(doc).toContain("Linux and macOS browser acceptance.")
    expect(doc).toContain("Cross-browser visual caret parity.")
  })

  it("maps Phase 166 thresholds into the accepted matrix", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")

    expect(doc).toContain("## Matrix Threshold Mapping")
    expect(doc).toContain("Selection/caret: must PASS Phase 166 thresholds")
    expect(doc).toContain("IME composition: must PASS for Thai and English")
    expect(doc).toContain("plain paste and unsafe paste blocking must PASS")
    expect(doc).toContain("Field-chip atomicity: must PASS")
    expect(doc).toContain("Active island commit: must PASS")
    expect(doc).toContain("JSON-safe reports: must PASS")
    expect(doc).toContain("blocked/no-driver reports are accepted only as")
  })

  it("keeps v1 blockers and hard limits visible", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")

    expect(doc).toContain("## v1 Blockers")
    expect(doc).toContain("Thai input path lacks IME composition lifecycle evidence.")
    expect(doc).toContain("Unsafe paste is not blocked.")
    expect(doc).toContain("Field-chip atomics are editable as plain text.")
    expect(doc).toContain("Active island commit accepts unsafe capture or stale revision.")
    expect(doc).toContain("Browser evidence requires adding Playwright/Puppeteer")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No browser automation dependency added to core.")
    expect(doc).toContain("No browser driver requirement in core check.")
  })

  it("documents Phase 167 in the phase trail and advances the roadmap", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("Next recommended phase: Phase 168: Guarded Input Integration Plan.")
    expect(readme).toContain("Browser matrix decision")
    expect(readme).toContain("docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md")
    expect(ledger).toContain("| 167 | Browser matrix decision | done |")
    expect(roadmap).toContain("## Phase 167: Browser Matrix Decision")
    expect(roadmap).toContain("Current next step after Phase 167:")
    expect(roadmap).toContain("Phase 168: Guarded Input Integration Plan")
  })
})
