import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 synchronized row pagination architecture lock", () => {
  it("locks cursor, inset, atomic row, break, header, and scale semantics", () => {
    const doc = read("../docs/TABLE_V4_SYNCHRONIZED_ROW_PAGINATION_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("plans each active cell at\nmost once")
    expect(doc).toContain("Top inset applies only")
    expect(doc).toContain("Bottom inset applies only")
    expect(doc).toContain("commits every cell cursor together or none")
    expect(doc).toContain("`prefer-keep`")
    expect(doc).toContain("`strict-keep`")
    expect(doc).toContain("same prepared authored\n  rows")
    expect(doc).toContain("header-progress diagnostic")
    expect(doc).toContain("200-300 page scale")
    expect(doc).toContain("no measurement, mutation, rendering, backend, or editor execution")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 316 locks synchronized Table row pagination",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 316 locks synchronized Table row pagination",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 316 Table V4 Synchronized Row Pagination Architecture Lock",
    )
  })
})
