import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")
const normalize = (value: string): string => value.replace(/\s+/g, " ").trim()

describe("Live Draft MR1-P complete geometry boundary", () => {
  it("records capability truth, retained dependencies, and the reviewed baseline", () => {
    const boundary = read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("../docs/PHASE_LEDGER.md")

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
    expect(boundary).toContain("blocked-empty-layout-contract")
    expect(boundary).toContain("mayPublishLayout: false")
    expect(boundary).toContain("Persistent Flow Tree Foundation")
    expect(handoff).toContain("LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(handoff).toContain("| `flowdoc-vnext-core` | `59e89ad` |")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
  })

  it("limits adapter exclusivity to the new Initial Flow handoff path", () => {
    const boundary = normalize(read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md"))
    const handoff = normalize(read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"))

    for (const document of [boundary, handoff]) {
      expect(document).toContain(
        "The new Initial Flow handoff path invokes legacy MR1 only through the explicit adapter.",
      )
      expect(document).toContain(
        "For accepted text-subset-ready rows, the adapter reproduces exact legacy MR1 layout parity.",
      )
      expect(document).toContain(
        "Unsupported capability rows fail closed before the adapter invokes legacy layout.",
      )
    }

    expect(handoff).not.toContain("The existing MR1 layout is now reachable only")
    expect(boundary).not.toContain("Only a classified `text-subset-ready` input may enter it")
  })

  it("retains the non-production gate and every Phase 2 exclusion", () => {
    const boundary = normalize(read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md"))
    const handoff = normalize(read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"))
    const exclusions =
      "Do not start spatial wrapping, list decoration, inline-image geometry, empty-block geometry, Editor, Backend, table auto-fit, publication, or production activation in this checkpoint."

    for (const document of [boundary, handoff]) {
      expect(document).toContain(
        "The Initial Flow handoff remains non-production and non-publishable",
      )
      expect(document).toContain("publication and production activation remain NO-GO")
      expect(document).toContain("mayPublishLayout: false")
      expect(document).toContain(exclusions)
    }
  })

  it("guards the public Initial Flow exports", () => {
    const index = read("../src/index.ts")

    expect(index).toContain('export * from "./layout/textBlockInitialFlowParentRegionV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowInputV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowTextOnlyAdapterV1.js"')
  })
})
