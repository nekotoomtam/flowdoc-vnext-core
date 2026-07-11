import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("text-block v4 readiness close audit", () => {
  it("separates retained core PASS facts from product blockers", () => {
    const doc = read("../docs/TEXT_BLOCK_V4_READINESS_CLOSE_AUDIT.md")
    for (const section of [
      "## PASS",
      "## What This Unblocks",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Files And Evidence",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("enough retained core semantics for columns and table split")
    expect(doc).toContain("does not mean text-block is fully product-ready")
    expect(doc).toContain("6,000-line/250-page text-block")
    expect(doc).toContain("No backend route persists")
    expect(doc).toContain("No editor draft/DOM/IME/clipboard adapter")
    expect(doc).toContain("No concrete v4 text engine")
    expect(doc).toContain("No mixed-node page composer")
  })

  it("keeps next routing aligned across readme, map, ledger, and readiness matrix", () => {
    const doc = read("../docs/TEXT_BLOCK_V4_READINESS_CLOSE_AUDIT.md")
    const readme = read("../README.md")
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const matrix = read("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")

    expect(readme).toContain("Phase 280 close-audits text-block v4")
    expect(map).toContain("Core Phase 280 closes the text-block v4 core-contract slice")
    expect(ledger).toContain("## Phase 280 Text-block V4 Readiness Close Audit")
    expect(matrix).toContain("PARTIAL: policy-aware rich replace/history")
    expect(doc).toContain("Integrate the lifecycle-aware rich replacement through backend revision")
  })
})
