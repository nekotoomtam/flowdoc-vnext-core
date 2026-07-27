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

const implementationBaseline = "d39d61f8c16b46b4fb709d045890ab9ee8677fbd"
const evidencePath = "docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md"
const deferredNoGo =
  "List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."
const phase4bGate =
  "`Phase 4B: Inline Image Line-Box Geometry` requires a separately reviewed and explicitly approved design before implementation."
const focusedTotals = "focused Phase 4A gate passed 8 files / 131 tests"
const fullTotals = "full `npm run check` passed 420 files / 2,114 tests"

describe("Live Draft MR1 authored box geometry 4A handoff", () => {
  it("pins the Phase 4A evidence sections, capability matrix, and authority limits", () => {
    const handoff = read(evidencePath)
    const headings = handoff.split(/\r?\n/gu).filter((line) => line.startsWith("## "))

    expect(headings).toEqual([
      "## Status",
      "## Outcome",
      "## Capability Matrix",
      "## Authored Box Width Evidence",
      "## Box-Local Projection Evidence",
      "## Auto-Height And Spatial Evidence",
      "## Identity And Failure Evidence",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ])

    const status = normalize(sectionAtPeerHeading(handoff, "## Status"))
    const capabilities = normalize(sectionAtPeerHeading(handoff, "## Capability Matrix"))
    const width = normalize(sectionAtPeerHeading(handoff, "## Authored Box Width Evidence"))
    const projection = normalize(sectionAtPeerHeading(handoff, "## Box-Local Projection Evidence"))
    const autoHeight = normalize(sectionAtPeerHeading(handoff, "## Auto-Height And Spatial Evidence"))
    const identity = normalize(sectionAtPeerHeading(handoff, "## Identity And Failure Evidence"))
    const next = normalize(sectionAtPeerHeading(handoff, "## Next Checkpoint"))

    for (const pin of [
      "`mayPublishLayout: false`",
      "`productionBinding: false`",
      "`stagedEditorApply: false`",
      "`core-synthetic-qa-only`",
      deferredNoGo,
    ]) expect(status).toContain(pin)

    for (const row of [
      "| authored box width | Core Phase 4A accepted |",
      "| vertical content insets | Core Phase 4A accepted |",
      "| box-local line and fragment geometry | Core Phase 4A accepted |",
      "| synthetic spatial wrapping | retained Phase 3A |",
      "| inline images | NO-GO |",
      "| list decoration | NO-GO |",
      "| empty blocks | NO-GO |",
      "| authored positioned objects | NO-GO |",
      "| Columns/Table | NO-GO |",
      "| Editor/Backend binding | NO-GO |",
      "| publication/production | NO-GO |",
    ]) expect(capabilities).toContain(row)

    expect(width).toContain("content-local Phase 3 behavior unchanged")
    expect(projection).toContain("box-local Phase 4A projection")
    expect(autoHeight).toContain("exact top/bottom inset ownership")
    expect(autoHeight).toContain("`maximumBottomLayoutUnit`")
    expect(autoHeight).toContain("zero-query fast path")
    expect(identity).toContain("no spatial-line reuse/reconvergence claim")
    expect(next).toContain("Stop after Phase 4A.")
    expect(next).toContain(phase4bGate)
  })

  it("advances only active historical pointers to the Phase 4B design-review gate", () => {
    const phase3 = read("docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md")
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    const design = read(
      "docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md",
    )
    const phase3Next = normalize(sectionAtPeerHeading(phase3, "## Next Checkpoint"))
    const crossHeader = normalize(crossRuntime.slice(0, crossRuntime.indexOf("## Objective")))
    const crossBaseline = normalize(sectionAtPeerHeading(crossRuntime, "## Current Baseline"))
    const currentTask = normalize(sectionAtPeerHeading(crossRuntime, "## First Task For The Next Thread"))
    const requiredReading = sectionAtPeerHeading(crossRuntime, "## Required Reading")
    const activePrompt = normalize(sectionAtPeerHeading(crossRuntime, "## Handoff Prompt"))
    const crossPhase4a = normalize(
      sectionAtPeerHeading(crossRuntime, "## Phase 4A Initial TextBlock Authored Box Geometry"),
    )
    const ledgerPhase4a = normalize(
      sectionAtPeerHeading(ledger, "## Phase 4A Initial TextBlock Authored Box Geometry"),
    )

    expect(phase3Next).toContain(
      "Historical pointer status on 2026-07-27: fulfilled by `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`.",
    )
    expect(crossRuntime.split(/\r?\n/u, 1)[0]).toContain("Phase 4A")
    expect(crossHeader).toContain("updated through `Phase 4A: Authored Box Geometry` on 2026-07-27")
    expect(crossBaseline).toContain(`Current Phase 4A Core implementation baseline: \`${implementationBaseline}\`.`)
    expect(requiredReading.match(/^- `[^`]+`/mu)?.[0]).toBe(`- \`${evidencePath}\``)

    for (const active of [currentTask, activePrompt]) {
      expect(active).toContain("Stop after Phase 4A.")
      expect(active).toContain(phase4bGate)
      expect(active).toContain("historical evidence and is not an active instruction")
      expect(active.indexOf("Stop after Phase 4A.")).toBeLessThan(
        active.indexOf("Proceed only to `Phase 4: Initial TextBlock Geometry`."),
      )
    }
    for (const record of [crossPhase4a, ledgerPhase4a]) {
      expect(record).toContain(implementationBaseline)
      expect(record).toContain("`mayPublishLayout: false`")
      expect(record).toContain("`productionBinding: false`")
      expect(record).toContain("`stagedEditorApply: false`")
      expect(record).toContain(deferredNoGo)
      expect(record).toContain(phase4bGate)
    }
    expect(design).toContain(
      "Status: implemented and accepted as the bounded Phase 4A Core checkpoint.",
    )
  })

  it("records numeric focused and full verification totals in every active Phase 4A record", () => {
    const evidence = normalize(read(evidencePath))
    const crossRuntime = normalize(
      sectionAtPeerHeading(
        read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"),
        "## Phase 4A Initial TextBlock Authored Box Geometry",
      ),
    )
    const ledger = normalize(
      sectionAtPeerHeading(
        read("docs/PHASE_LEDGER.md"),
        "## Phase 4A Initial TextBlock Authored Box Geometry",
      ),
    )

    for (const record of [evidence, crossRuntime, ledger]) {
      expect(record).toContain(focusedTotals)
      expect(record).toContain(fullTotals)
    }
  })

  it("guards the required public Phase 4A exports", () => {
    const publicIndexLines = read("src/index.ts").split(/\r?\n/gu)

    for (const statement of [
      'export * from "./layout/textBlockInitialFlowRequestBindingV1.js"',
      'export * from "./layout/textBlockAuthoredBoxGeometryContractV1.js"',
      'export * from "./layout/textBlockAuthoredBoxGeometryV1.js"',
    ]) expect(publicIndexLines).toContain(statement)
  })
})
