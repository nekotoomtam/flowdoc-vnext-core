import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 synchronized row pagination readiness close audit", () => {
  it("ties PASS to cell, row, page, header, and 250-page evidence", () => {
    const doc = read("../docs/TABLE_V4_SYNCHRONIZED_ROW_PAGINATION_READINESS_CLOSE_AUDIT.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("src/table/tableCellPaginationV1.ts")
    expect(doc).toContain("src/table/tableRowPaginationV1.ts")
    expect(doc).toContain("src/table/tablePaginationV1.ts")
    expect(doc).toContain("commits all cursor results together or none")
    expect(doc).toContain("Only contiguous leading authored rows")
    expect(doc).toContain("exactly 250 full pages")
    expect(doc).toContain("1,250 row fragments/plans/cell")
    expect(doc).toContain("## FAIL / BLOCKER\n\nNone")
    expect(doc).toContain("Future rowSpan")
    expect(doc).toContain("Table renderer-consumption facts")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 322 closes synchronized Table row pagination",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 322 closes synchronized Table row pagination",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 322 Table V4 Synchronized Row Pagination Readiness Close Audit",
    )
  })
})
