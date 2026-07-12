import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("final TOC v4 page-reference resolution readiness close audit", () => {
  it("closes the bounded resolver without overstating production output", () => {
    const doc = read("../docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_READINESS_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for the bounded final TOC v4 page-reference resolution contract")
    expect(doc).toContain("exactly 1,000 entry resolutions")
    expect(doc).toContain("Production final TOC output remains blocked")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Lock the whole-document v4 pagination composition lane")
  })

  it("keeps the close phase and production blocker discoverable", () => {
    expect(read("../README.md")).toContain("Phase 358 closes the bounded final TOC v4 page-reference resolution contract")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 358 closes the core-owned final TOC v4 resolution contract")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 358 Final TOC V4 Page-Reference Resolution Readiness Close Audit")
  })
})
