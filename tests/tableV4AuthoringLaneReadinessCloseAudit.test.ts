import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("Table v4 authoring lane readiness close audit", () => {
  it("closes the bounded draft authoring profile without overstating integration", () => {
    const doc = read("../docs/TABLE_V4_AUTHORING_LANE_READINESS_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for the bounded span-one Structure Draft authoring profile")
    expect(doc).toContain("preceding surviving row")
    expect(doc).toContain("every affected cell and descendant text block")
    expect(doc).toContain("1,000-row-template column insert")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Move to the TOC node semantic lane")
  })

  it("keeps architecture and phase summaries discoverable", () => {
    expect(read("../README.md")).toContain("Phase 333 closes the bounded Table v4 authoring lane")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 333 closes the bounded Table v4 authoring lane",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 333 Table V4 Authoring Lane Readiness Close Audit",
    )
    expect(read("../docs/TABLE_V4_AUTHORING_LANE_ARCHITECTURE_LOCK.md")).toContain(
      "Table v4 authoring edits one Structure Definition Draft",
    )
  })
})
