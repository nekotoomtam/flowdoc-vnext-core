import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 semantic architecture lock", () => {
  it("locks semantic row sources, occupancy, resolution, and pagination boundaries", () => {
    const doc = read("../docs/TABLE_V4_SEMANTIC_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("ordered row sources resolve to")
    expect(doc).toContain("row is the\nsynchronization boundary")
    expect(doc).toContain("Array index is never row identity")
    expect(doc).toContain("`header-only`")
    expect(doc).toContain("`empty-row`")
    expect(doc).toContain("`hide-table`")
    expect(doc).toContain("non-overlapping, gap-free")
    expect(doc).toContain("`rowSpan` is present in the vocabulary with v1 value exactly `1`")
    expect(doc).toContain("`prefer-keep`")
    expect(doc).toContain("minimum row height applies to the row's first fragment only")
    expect(doc).toContain("Measurement never executes inside the pagination loop")
    expect(doc).toContain("active document v3 deep split")
  })

  it("keeps roadmap and repository routing aligned", () => {
    expect(read("../README.md")).toContain("Phase 294 locks Table v4")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 294 locks Table v4")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 294 Table V4 Semantic Architecture Lock")
  })
})
