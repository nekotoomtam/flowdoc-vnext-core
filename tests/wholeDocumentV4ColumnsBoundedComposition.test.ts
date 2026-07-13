import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Columns bounded Composition publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_COLUMNS_BOUNDED_COMPOSITION.md")

  it("publishes shared planning, bounded checkpoints, and honest special states", () => {
    for (const section of [
      "## Public API",
      "## Shared Page Planner",
      "## Bounded Cursor",
      "## Page Checkpoints",
      "## Fresh-Page Normalization",
      "## Terminal Minimum Height",
      "## Common Adapter",
      "## Parity And Scale",
      "## Failure Contract",
      "## Responsibility Boundary",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/same lane and\s+nested page planner/)
    expect(doc).toContain("terminal-fragment committed state")
    expect(doc).toMatch(/6,000 prepared text fragments traverse depth three into 250 one-page common/)
    expect(doc).toContain("columns-composition-zero-extent-unsupported")
  })

  it("keeps public exports, phase trail, and next Table work discoverable", () => {
    const index = read("../src/index.ts")
    expect(index).toContain('export * from "./pagination/columnsFlowV4WindowPagination.js"')
    expect(index).toContain('export * from "./composition/columnsFragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 372 makes Columns a bounded common window producer")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 372 adds bounded Columns-flow windows")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 372 Columns V4 Bounded Composition")
    expect(doc).toContain("Implement the Table composition-oriented bounded paginator")
  })
})
