import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Text-flow remainder and cursor publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TEXT_FLOW_REMAINDER_CURSOR.md")

  it("publishes bounded Text-flow pagination and the honest common adapter", () => {
    for (const section of [
      "## Compatibility",
      "## Accepted Measurement Ownership",
      "## Cursor",
      "## Remainder And Fresh Page",
      "## Page Commit",
      "## Bounded Partial And Resume",
      "## Exact Work",
      "## Common Fragment-Window Adapter",
      "## Heading First Fragment",
      "## Failure And Recovery",
      "## Scale Evidence",
      "## Responsibility Boundary",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("`paginateVNextTextBlockV4Lines(...)` from Phase 279 remains unchanged")
    expect(doc).toMatch(/byte-identical concatenated family pages and the same final cursor/)
    expect(doc).toContain("6,000 accepted lines")
    expect(doc).toContain("below 500 KB")
    expect(doc).toContain("Text-flow is the first honest Common Fragment-Window producer")
  })

  it("keeps Phase 368 and the utility/media direction discoverable", () => {
    const index = read("../src/index.ts")
    expect(index).toContain('export * from "./pagination/textFlowV4WindowPagination.js"')
    expect(index).toContain('export * from "./composition/textFlowFragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 368 makes Text-flow the first common Composition window producer")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 368 adds bounded Text-flow remainder/cursor pagination")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 368 Text-flow V4 Remainder And Cursor Contract")
    expect(doc).toContain("Implement Utility And Media V4 Atomic Fragment Contracts")
  })
})
