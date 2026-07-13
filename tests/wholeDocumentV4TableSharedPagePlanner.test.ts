import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table shared page planner publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_SHARED_PAGE_PLANNER.md")

  it("publishes the shared page owner, cumulative bound, and remaining phases", () => {
    for (const section of [
      "## Public API",
      "## Shared Page Ownership",
      "## Cursor And Atomicity",
      "## Cumulative Work Bound",
      "## Parity And Scale",
      "## Fingerprint Finding",
      "## Failure Contract",
      "## Responsibility Boundary",
      "## Remaining Table Phases",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("planVNextTablePageV1(...)")
    expect(doc).toMatch(/Repeated headers are layout progress but never advance source `rowIndex`/)
    expect(doc).toMatch(/1,000 body rows producing the established 250 pages/)
    expect(doc).toContain("rowPlanCountBefore")
    expect(doc).toContain("Phase 378: architecture close audit")
  })

  it("keeps exports, phase trail, and bounded work discoverable", () => {
    expect(read("../src/index.ts")).toContain('export * from "./table/tablePagePlannerV1.js"')
    expect(read("../README.md")).toContain("Phase 373 extracts the shared one-page Table planner")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 373 extracts the shared one-page Table planner")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 373 Table V4 Shared Page Planner")
    expect(doc).toContain("Implement Phase 374 as a separate compact, bounded Table cursor/paginator")
  })
})
