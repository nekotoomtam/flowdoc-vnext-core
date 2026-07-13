import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 TOC common adapter publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TOC_COMMON_ADAPTER.md")

  it("publishes the one-page contract and honest special states", () => {
    for (const section of [
      "## Public API",
      "## Compact Measurement Ownership",
      "## One-Page Acceptance",
      "## Content Projection",
      "## Fresh-Page Normalization",
      "## Overflow And Empty Policy",
      "## Fingerprint And Cursor Validation",
      "## Resume And Scale",
      "## Generated Index Extension Mark",
      "## Responsibility Boundary",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("`generated-flow` window")
    expect(doc).toMatch(/emits common\s+`fresh-page-required`/)
    expect(doc).toContain("toc-composition-forced-overflow-unsupported")
    expect(doc).toContain("toc-composition-empty-window-unsupported")
    expect(doc).toContain("1,000 generated entries adapt through 167 deterministic one-page common")
  })

  it("keeps compact ownership, public export, and next Columns work discoverable", () => {
    expect(read("../src/index.ts")).toContain('export * from "./composition/tocFragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 371 makes TOC a common generated-flow window producer")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 371 adds the TOC one-page common adapter")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 371 TOC V4 Common Composition Adapter")
    expect(doc).toContain("Implement the Columns composition-oriented bounded paginator")
  })
})
