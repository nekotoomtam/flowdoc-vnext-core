import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("TOC v4 pagination lane architecture lock", () => {
  it("locks cursor, placement, keep, forced overflow, and resume boundaries", () => {
    const doc = read("../docs/TOC_V4_PAGINATION_LANE_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("measurementFingerprint")
    expect(doc).toContain("title-keep-with-first-unsatisfied")
    expect(doc).toContain("force-placed once")
    expect(doc).toContain("`partial` with a committed cursor")
    expect(doc).toContain("no cursor progress")
    expect(doc).toContain("## PASS Criteria")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps the phase discoverable", () => {
    expect(read("../README.md")).toContain("Phase 347 locks the TOC v4 pagination lane")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 347 locks TOC v4 pagination")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 347 TOC V4 Pagination Lane Architecture Lock")
  })
})
