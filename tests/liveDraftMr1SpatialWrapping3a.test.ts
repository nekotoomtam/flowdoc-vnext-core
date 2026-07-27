import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const normalize = (value: string): string => value.replace(/\s+/gu, " ").trim()
const sectionAtPeerHeading = (document: string, heading: string): string => {
  const startIndex = document.indexOf(heading)
  expect(startIndex).toBeGreaterThanOrEqual(0)
  const nextHeadingIndex = document.indexOf("\n## ", startIndex + heading.length)
  return document.slice(startIndex, nextHeadingIndex < 0 ? document.length : nextHeadingIndex)
}

const phase4Pointer = "Proceed only to `Phase 4: Initial TextBlock Geometry`."
const deferredNoGo =
  "List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."

describe("Live Draft MR1 spatial wrapping 3A handoff", () => {
  it("pins the Phase 3 evidence sections, capability matrix, and authority limits", () => {
    const handoff = read("docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md")
    const headings = handoff.split(/\r?\n/gu).filter((line) => line.startsWith("## "))
    expect(headings).toEqual([
      "## Status",
      "## Outcome",
      "## Capability Matrix",
      "## Spatial Index Evidence",
      "## Flow Region And Wrapping Evidence",
      "## Move And Resize Evidence",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ])

    const status = normalize(sectionAtPeerHeading(handoff, "## Status"))
    const capabilities = normalize(sectionAtPeerHeading(handoff, "## Capability Matrix"))
    const spatialIndex = normalize(sectionAtPeerHeading(handoff, "## Spatial Index Evidence"))
    const regions = normalize(sectionAtPeerHeading(handoff, "## Flow Region And Wrapping Evidence"))
    const updates = normalize(sectionAtPeerHeading(handoff, "## Move And Resize Evidence"))
    const blockers = normalize(sectionAtPeerHeading(handoff, "## FAIL / BLOCKER"))
    const verification = normalize(sectionAtPeerHeading(handoff, "## Verification"))
    const next = normalize(sectionAtPeerHeading(handoff, "## Next Checkpoint"))

    for (const pin of [
      "`mayPublishLayout: false`",
      "`productionBinding: false`",
      "`stagedEditorApply: false`",
      "Core synthetic 3A accepted",
      deferredNoGo,
    ]) expect(status).toContain(pin)
    for (const row of [
      "| spatial wrapping | Core synthetic 3A accepted |",
      "| authored positioned objects | NO-GO |",
      "| inline images | NO-GO |",
      "| list decoration | NO-GO |",
      "| empty blocks | NO-GO |",
      "| Columns/Table | NO-GO |",
      "| Table auto-fit | NO-GO |",
      "| Editor/Backend binding | NO-GO |",
      "| publication/production | NO-GO |",
    ]) expect(capabilities).toContain(row)
    expect(spatialIndex).toContain("persistent interval treap")
    expect(spatialIndex).toContain("subtree maximum-bottom pruning")
    expect(spatialIndex).toContain("`core-synthetic-qa-only`")
    expect(spatialIndex).toContain("1,024")
    expect(regions).toContain("left, right, middle, and multiple rectangular exclusions")
    expect(regions).toContain("top/bottom barriers")
    expect(regions).toContain("overlay")
    expect(regions).toContain("zero-space advancement")
    expect(regions).toContain("expanded-band stabilization")
    expect(updates).toContain("path-copy")
    expect(updates).toContain("exact old/new affected-band union")
    expect(updates).toContain("completeIndexRebuildCount: 0")
    expect(blockers).toContain(deferredNoGo)
    expect(verification).toMatch(/Focused Phase 3 result: \d+ test files passed \/ \d+ tests passed\./u)
    expect(verification).toMatch(
      /Final full `npm run check`: [\d,]+ test files passed \/ [\d,]+ tests passed/u,
    )
    expect(verification).not.toMatch(/timing budget|heap budget|frame budget/iu)
    expect(next).toContain(phase4Pointer)
    expect(next).toContain(deferredNoGo)
  })

  it("pins public exports and advances only the active cross-runtime and ledger pointers", () => {
    const publicIndexLines = read("src/index.ts").split(/\r?\n/gu)
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    const requiredReading = normalize(sectionAtPeerHeading(crossRuntime, "## Required Reading"))
    const phase3 = normalize(sectionAtPeerHeading(crossRuntime, "## Phase 3 Core Spatial Wrapping 3A"))
    const currentTask = normalize(sectionAtPeerHeading(crossRuntime, "## First Task For The Next Thread"))
    const activePrompt = normalize(sectionAtPeerHeading(crossRuntime, "## Handoff Prompt"))
    const ledgerPhase3 = normalize(sectionAtPeerHeading(ledger, "## Phase 3 Core Spatial Wrapping 3A"))

    for (const statement of [
      'export * from "./layout/textBlockSpatialIndexContractV1.js"',
      'export * from "./layout/textBlockSpatialIndexV1.js"',
      'export * from "./layout/textBlockSpatialIndexUpdateV1.js"',
      'export * from "./layout/textBlockFlowRegionProviderV1.js"',
      'export * from "./layout/textBlockSpatialWrappingLayoutContractV1.js"',
      'export * from "./layout/textBlockSpatialWrappingLayoutV1.js"',
    ]) expect(publicIndexLines).toContain(statement)

    expect(requiredReading).toContain("`docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`")
    for (const active of [phase3, ledgerPhase3]) {
      expect(active).toContain("Phase 3: Core Spatial Wrapping 3A")
      expect(active).toContain("`mayPublishLayout: false`")
      expect(active).toContain("`productionBinding: false`")
      expect(active).toContain("`stagedEditorApply: false`")
      expect(active).toContain(deferredNoGo)
    }
    for (const active of [currentTask, activePrompt]) {
      expect(active).toContain(phase4Pointer)
      expect(active).toContain(deferredNoGo)
      expect(active).not.toContain("Proceed only to `Phase 3")
    }
  })
})
