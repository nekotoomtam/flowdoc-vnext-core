import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 semantic readiness close audit", () => {
  it("ties PASS to implemented definition, snapshot, row, and identity evidence", () => {
    const doc = read("../docs/TABLE_V4_SEMANTIC_READINESS_CLOSE_AUDIT.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("src/table/tableDefinitionV1.ts")
    expect(doc).toContain("src/table/tableCollectionSnapshotV1.ts")
    expect(doc).toContain("src/table/resolvedTableRowsV1.ts")
    expect(doc).toContain("Array index is never used as row identity")
    expect(doc).toContain("accepts static-only tables")
    expect(doc).toContain("## FAIL / BLOCKER\n\nNone")
    expect(doc).toContain("does not yet clone")
    expect(doc).toContain("200-300 page measured")
    expect(doc).toContain("resolved table content materialization identity boundary")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain("Phase 298 closes the Table v4 semantic row-stream slice")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 298 closes the Table v4 semantic row-stream slice",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 298 Table V4 Semantic Readiness Close Audit",
    )
  })
})
