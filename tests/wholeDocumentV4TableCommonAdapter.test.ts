import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table common adapter publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_COMMON_ADAPTER.md")

  it("publishes strict projection, evidence ownership, and honest remaining gates", () => {
    for (const section of [
      "## Public API", "## Cursor And Checkpoint Validation", "## Geometry", "## Family Evidence",
      "## Status Mapping", "## Failure Contract", "## Responsibility Boundary", "## PASS",
      "## FAIL / BLOCKER", "## RISK", "## UNKNOWN", "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toMatch(/one positive `table-flow`\s+placement/)
    expect(doc).toMatch(/does not paginate, measure, reconcile\s+cells, repeat headers, or infer cursors/)
    expect(doc).toContain("1,000-row/250-page bounded common scale gate remains Phase 377")
  })

  it("keeps exports and the phase trail discoverable", () => {
    expect(read("../src/index.ts")).toContain('export * from "./composition/tableFragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 375 makes Table a strict common `table-flow` window producer")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 375 adds the strict Table common adapter")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 375 Table V4 Common Composition Adapter")
  })
})
