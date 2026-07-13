import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 ordered scheduling", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_ORDERED_SCHEDULING.md")

  it("locks the complete-window scheduling evidence and boundaries", () => {
    for (const section of [
      "## Public API", "## Initialization", "## Exact Window Acceptance",
      "## Content Projection", "## Canonical Root And Section Order", "## Page Break",
      "## Closed Prefix And Cursor Commit", "## Output Bounds And Resume",
      "## Active States", "## PASS", "## FAIL / BLOCKER", "## RISK", "## UNKNOWN",
      "## Files Changed", "## Behavior Changed", "## Tests Run", "## Risks Left",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("accepts at most one matching complete common window")
    expect(doc).toContain("Consecutive page-break roots therefore retain consecutive\nintentional blank pages")
    expect(doc).toContain("without replaying the accepted window")
    expect(doc).toContain("never weakens the Phase 380 invariant")
  })

  it("keeps Phase 381 and recovery next discoverable", () => {
    expect(read("../README.md")).toContain("Phase 381 implements ordered bounded sequential scheduling")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 381 adds pure ordered bounded scheduling")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 381 Sequential Whole-Document V4 Ordered Scheduling")
    expect(doc).toContain("Implement Phase 382 fresh, partial, blocked, and retry behavior")
  })
})
