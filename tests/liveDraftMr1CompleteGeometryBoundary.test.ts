import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("Live Draft MR1-P complete geometry boundary", () => {
  it("records capability truth, retained dependencies, and the bounded next checkpoint", () => {
    const boundary = read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const index = read("../src/index.ts")

    for (const section of [
      "## Outcome",
      "## Capability Matrix",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ]) expect(boundary).toContain(section)

    expect(boundary).toContain("Initial TextBlock Flow")
    expect(boundary).toContain("text-subset-ready")
    expect(boundary).toContain("geometry-contract-required")
    expect(boundary).toContain("blocked-line-box-contract")
    expect(boundary).toContain("blocked-decoration-contract")
    expect(boundary).toContain("mayPublishLayout: false")
    expect(boundary).toContain("Persistent Flow Tree Foundation")
    expect(handoff).toContain("LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(index).toContain('export * from "./layout/textBlockInitialFlowParentRegionV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowInputV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowTextOnlyAdapterV1.js"')
  })
})
