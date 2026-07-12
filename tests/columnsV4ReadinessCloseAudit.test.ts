import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("columns v4 readiness close audit", () => {
  it("separates accepted text-backed flow from remaining product blockers", () => {
    const doc = read("../docs/COLUMNS_V4_READINESS_CLOSE_AUDIT.md")
    for (const section of [
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Files And Evidence",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("text-backed independent-flow")
    expect(doc).toContain("6,000 prepared text fragments into 250 pages")
    expect(doc).toContain("unsupported child families block")
    expect(doc).toContain("does not make Columns or document v4 fully product-ready")
    expect(doc).toContain("Define table row/cell fragment planning")
  })

  it("keeps readme, map, ledger, and readiness matrix aligned", () => {
    expect(read("../README.md")).toContain("Phase 289 close-audits Columns v4")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 289 closes the text-backed Columns v4 core slice")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 289 Columns V4 Readiness Close Audit")
    const matrix = read("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")
    expect(matrix).toContain("PARTIAL: text/nested parallel flow")
    expect(matrix).toContain("PARTIAL: 6k fragments/250 pages/depth 3")
  })
})
