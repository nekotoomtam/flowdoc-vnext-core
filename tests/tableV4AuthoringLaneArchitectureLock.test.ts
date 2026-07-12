import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("Table v4 authoring lane architecture lock", () => {
  it("locks atomic draft authoring, bounded commands, and capability blocks", () => {
    const doc = read("../docs/TABLE_V4_AUTHORING_LANE_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("authored document plus draft-owned Table Definition")
    expect(doc).toContain("span-one authoring profile")
    expect(doc).toContain("table.row.insert.static")
    expect(doc).toContain("table.column.resize")
    expect(doc).toContain("table.cell.vertical-align.patch")
    expect(doc).toContain("cell merge/split requires canonical colSpan occupancy integration")
    expect(doc).toContain("preceding surviving row")
    expect(doc).toContain("1,000 span-one row templates")
    expect(doc).toContain("no persistence, network, DOM, editor state, measurement, or pagination")
  })

  it("keeps phase summaries discoverable", () => {
    expect(read("../README.md")).toContain("Phase 328 locks the Table v4 authoring lane")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 328 locks the Table v4 authoring lane",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 328 Table V4 Authoring Lane Architecture Lock",
    )
  })
})
