import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("TOC v4 measurement lane readiness close audit", () => {
  it("closes measurement readiness without overstating pagination or visual exactness", () => {
    const doc = read("../docs/TOC_V4_MEASUREMENT_LANE_READINESS_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for the bounded TOC v4 generated measurement profile")
    expect(doc).toContain("Geometry and fit fingerprints are separate")
    expect(doc).toContain("16,020pt total height")
    expect(doc).toContain("approximate measurer")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Move to the TOC v4 pagination lane")
  })

  it("keeps architecture and close phases discoverable", () => {
    expect(read("../README.md")).toContain("Phase 346 closes TOC v4 measurement readiness")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 346 closes TOC v4 measurement readiness",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 346 TOC V4 Measurement Lane Readiness Close Audit",
    )
  })
})
