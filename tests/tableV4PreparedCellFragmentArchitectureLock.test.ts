import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 prepared cell fragment architecture lock", () => {
  it("locks geometry, evidence, child policy, and pagination boundaries", () => {
    const doc = read("../docs/TABLE_V4_PREPARED_CELL_FRAGMENT_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("measurement-complete,\npagination-free sources")
    expect(doc).toContain("`columnStart` through `colSpan`")
    expect(doc).toContain("both:\n\n- the exact v4 text measurement request")
    expect(doc).toContain("one splittable candidate per accepted measured line")
    expect(doc).toContain("one atomic candidate")
    expect(doc).toContain("commits all cell\ncursors together or none")
    expect(doc).toContain("Candidate ids are deterministic layout keys")
    expect(doc).toContain("Wall-clock timing alone is not complexity evidence")
    expect(doc).toContain("no pagination, rendering, media fetch, DOM, backend, or editor execution")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 307 locks prepared Table cell fragments",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 307 locks prepared Table cell fragments",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 307 Table V4 Prepared Cell Fragment Architecture Lock",
    )
  })
})
