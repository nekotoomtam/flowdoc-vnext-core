import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table Composition scale publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_COMPOSITION_SCALE.md")

  it("publishes exact scale, amplification correction, and size bounds", () => {
    for (const section of [
      "## Source-Pin Amplification", "## Exact Scale Facts", "## Evidence Size", "## Work Bound",
      "## Responsibility Boundary", "## PASS", "## FAIL / BLOCKER", "## RISK", "## UNKNOWN",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toContain("250 one-page bounded/common windows")
    expect(doc).toContain("1,250 row plans and cell plans")
    expect(doc).toContain("family cursor below 2 KB")
    expect(doc).toContain("no longer serializes full candidates per page")
  })

  it("keeps the scale phase discoverable", () => {
    expect(read("../README.md")).toContain("Phase 377 proves 1,000 Table body rows")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 377 proves 1,000 rows")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 377 Table V4 Composition Scale")
  })
})
