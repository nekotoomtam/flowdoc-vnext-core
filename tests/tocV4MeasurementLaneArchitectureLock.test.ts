import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("TOC v4 measurement lane architecture lock", () => {
  it("locks row geometry, fixed number capacity, overflow, and ownership", () => {
    const doc = read("../docs/TOC_V4_MEASUREMENT_LANE_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("VNextTextMeasurer")
    expect(doc).toContain("fixed page-number column")
    expect(doc).toContain("pageNumberCapacityDigits")
    expect(doc).toContain("keep-with-first-entry")
    expect(doc).toContain("Every entry row is `keep-together`")
    expect(doc).toContain("`split-required`")
    expect(doc).toContain("`forced-row-overflow`")
    expect(doc).toContain("maximumEntryCount")
    expect(doc).toContain("maximumMeasuredLineCount")
    expect(doc).toContain("## PASS Criteria")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps the phase discoverable from the repository trail", () => {
    expect(read("../README.md")).toContain("Phase 342 locks the TOC v4 measurement lane")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 342 locks TOC v4 measurement",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 342 TOC V4 Measurement Lane Architecture Lock",
    )
  })
})
