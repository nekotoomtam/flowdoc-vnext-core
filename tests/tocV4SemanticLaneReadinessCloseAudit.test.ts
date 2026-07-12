import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("TOC v4 semantic lane readiness close audit", () => {
  it("closes semantic readiness without overstating layout or authoring", () => {
    const doc = read("../docs/TOC_V4_SEMANTIC_LANE_READINESS_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for the bounded document-wide, body-flow TOC v4 semantic profile")
    expect(doc).toContain("{ tocNodeId, headingNodeId }")
    expect(doc).toContain("1,002 node visits and 1,000 entry")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Move to the TOC v4 measurement lane")
  })

  it("keeps architecture, implementation, and close phases discoverable", () => {
    expect(read("../README.md")).toContain("Phase 341 closes TOC v4 semantic readiness")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 341 closes TOC v4 semantic readiness",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 341 TOC V4 Semantic Lane Readiness Close Audit",
    )
    expect(read("../docs/TOC_V4_SEMANTIC_LANE_ARCHITECTURE_LOCK.md")).toContain(
      "contract must reserve a fixed-width page-number column",
    )
  })
})
