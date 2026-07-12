import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 prepared cell fragment readiness close audit", () => {
  it("ties PASS to geometry, evidence, cell, row, invalidation, and scale evidence", () => {
    const doc = read("../docs/TABLE_V4_PREPARED_CELL_FRAGMENT_READINESS_CLOSE_AUDIT.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("src/table/tableCellGeometryV1.ts")
    expect(doc).toContain("src/table/tableTextFragmentEvidenceV1.ts")
    expect(doc).toContain("src/table/tablePreparedCellBuilderV1.ts")
    expect(doc).toContain("src/table/tablePreparedRowsV1.ts")
    expect(doc).toContain("unambiguous JSON-tuple fingerprints")
    expect(doc).toContain("Item values retain stable resolved identity")
    expect(doc).toContain("1,000-row fixture")
    expect(doc).toContain("## FAIL / BLOCKER\n\nNone")
    expect(doc).toContain("200-300 page Table pagination")
    expect(doc).toContain("synchronized Table row pagination")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 315 closes prepared Table cell fragments",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 315 closes prepared Table cell fragments",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 315 Table V4 Prepared Cell Fragment Readiness Close Audit",
    )
  })
})
