import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 content materialization readiness close audit", () => {
  it("ties PASS to contracts, provenance, materialization, and scale evidence", () => {
    const doc = read("../docs/TABLE_V4_CONTENT_MATERIALIZATION_READINESS_CLOSE_AUDIT.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("src/table/tableContentMaterializationContractV1.ts")
    expect(doc).toContain("src/table/tableContentProvenanceV1.ts")
    expect(doc).toContain("src/table/tableContentValuePolicyV1.ts")
    expect(doc).toContain("Public callers should submit collection values without `itemKey`")
    expect(doc).toContain("Reordering collection records retains identity")
    expect(doc).toContain("1,000-row fixture")
    expect(doc).toContain("## FAIL / BLOCKER\n\nNone")
    expect(doc).toContain("200-300 page pagination performance")
    expect(doc).toContain("prepared Table cell fragments")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 306 closes resolved Table content materialization",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 306 closes resolved Table content materialization",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 306 Table V4 Content Materialization Readiness Close Audit",
    )
  })
})
