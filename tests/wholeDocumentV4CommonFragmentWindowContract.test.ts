import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 common fragment-window contract publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_COMMON_FRAGMENT_WINDOW_CONTRACT.md")

  it("publishes the retained contract and honest closed lanes", () => {
    for (const section of [
      "## Public API",
      "## Family And Root Compatibility",
      "## Compact Ownership",
      "## Capacity",
      "## Cursor Checkpoints",
      "## Page And Placement Geometry",
      "## Heading Identity",
      "## Window States",
      "## Exact Work",
      "## Finalize And Parse",
      "## Failure Contract",
      "## Responsibility Boundary",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Every committed family page retains its own cursor-before and cursor-after")
    expect(doc).toContain("10,000 pages and 100,000 fragments")
    expect(doc).toMatch(/Malformed, stale, or tampered envelopes are parser failures/)
    expect(doc).toContain("No family adapter emits this contract yet")
  })

  it("keeps Phase 367 and the next text-flow slice discoverable", () => {
    expect(read("../src/index.ts")).toContain('export * from "./composition/fragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 367 implements the common v4 Composition fragment-window contract")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 367 adds the common Composition fragment-window contract")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 367 Whole-Document V4 Common Fragment-Window Contract")
    expect(doc).toContain("Implement the Text-flow V4 Remainder And Cursor Contract")
  })
})
