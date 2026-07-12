import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("final TOC v4 page-reference resolution architecture lock", () => {
  it("locks manifest, page-map, capacity, and missing producer truth", () => {
    const doc = read("../docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("does not yet expose one completed whole-document v4 page plan")
    expect(doc).toContain("TOC Pagination Manifest")
    expect(doc).toContain("document-v4-heading-page-map")
    expect(doc).toContain("pageNumberCapacityDigits")
    expect(doc).toContain("Missing heading destinations produce `partial`")
    expect(doc).toContain("## PASS Criteria")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps the phase discoverable", () => {
    expect(read("../README.md")).toContain("Phase 352 locks final TOC v4 page-reference resolution")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 352 locks final TOC v4 page-reference resolution")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 352 Final TOC V4 Page-Reference Resolution Architecture Lock")
  })
})
