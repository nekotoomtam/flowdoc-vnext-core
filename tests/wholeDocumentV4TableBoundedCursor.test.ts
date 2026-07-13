import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table bounded cursor publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_BOUNDED_CURSOR.md")

  it("publishes compact ownership, cumulative work, checkpoints, and honest gaps", () => {
    for (const section of [
      "## Public API", "## Compact Ownership", "## Bounded Cursor", "## Page Checkpoints",
      "## Cumulative Work", "## Fresh Page", "## Failure Contract", "## Parity Evidence",
      "## Responsibility Boundary", "## PASS", "## FAIL / BLOCKER", "## RISK", "## UNKNOWN",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toContain("maximumRowPlanCount")
    expect(doc).toMatch(/exact unchanged cursor/)
    expect(doc).toContain("1,000-row/250-page bounded scale matrix remains Phase 377")
    expect(doc).toContain("No common `table-flow` fragment-window adapter exists yet")
  })

  it("keeps exports and phase trail discoverable", () => {
    expect(read("../src/index.ts")).toContain('export * from "./table/tableFlowV4WindowPagination.js"')
    expect(read("../README.md")).toContain("Phase 374 adds compact source/profile ownership")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 374 adds bounded Table-flow cursors")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 374 Table V4 Bounded Cursor")
  })
})
