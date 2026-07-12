import { describe, expect, it } from "vitest"
import {
  createVNextTextFlowCompositionWindowV1,
  paginateVNextTextFlowV4,
  parseVNextCompositionFragmentWindowV1,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextFlowCompositionWindowContextV1,
} from "../src/index.js"

type Accepted = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function accepted(heights: number[]): Accepted {
  const lines = heights.map((heightPt, index) => ({
    index,
    startOffset: index,
    endOffset: index + 1,
    text: String(index),
    widthPt: 20,
    heightPt,
    sourceStart: { textBlockId: "heading-1", inlineId: "run-1", authoredOffset: index, resolvedOffset: index, affinity: "forward" as const },
    sourceEnd: { textBlockId: "heading-1", inlineId: "run-1", authoredOffset: index + 1, resolvedOffset: index + 1, affinity: "backward" as const },
  }))
  return {
    source: "vnext-text-block-v4-measurement",
    version: 1,
    status: "accepted",
    textBlockId: "heading-1",
    lines,
    issues: [],
    summary: { lineCount: lines.length, renderedLength: lines.length, totalHeightPt: heights.reduce((sum, value) => sum + value, 0) },
  }
}

function context(): VNextTextFlowCompositionWindowContextV1 {
  return {
    documentId: "document-1",
    sectionId: "section-1",
    zoneId: "body-1",
    sourceOrder: 2,
    documentStructureFingerprint: pin("a"),
    resolvedProjectionFingerprint: pin("b"),
    familySourceFingerprint: pin("c"),
    maximumFragmentCount: 10,
    headingLevel: 2,
  }
}

describe("Text-flow v4 common fragment-window adapter", () => {
  it("projects complete Text-flow pages and the first heading fragment without relayout", () => {
    const measurement = accepted([30, 30, 30])
    const pagination = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      firstPageAvailableHeightPt: 30,
      maximumPageCount: 10,
    })
    const before = JSON.stringify({ pagination, measurement })
    const result = createVNextTextFlowCompositionWindowV1({ pagination, context: context() })

    expect(result).toMatchObject({
      status: "ready",
      window: {
        status: "complete",
        family: "text-flow",
        rootNodeId: "heading-1",
        ownerPins: {
          measurement: pagination.measurementFingerprint,
          pagination: pagination.fingerprint,
        },
        pages: [
          { windowPageIndex: 0, availableHeightPt: 30, fragments: [{ fragmentIndex: 0, heading: { headingNodeId: "heading-1", level: 2 } }] },
          { windowPageIndex: 1, availableHeightPt: 60, fragments: [{ fragmentIndex: 1, heading: null }] },
        ],
        work: { pageCount: 2, fragmentCount: 2, cursorCommitCount: 2 },
      },
    })
    expect(JSON.stringify({ pagination, measurement })).toBe(before)
    if (result.status === "blocked") throw new Error("adapter blocked")
    expect(parseVNextCompositionFragmentWindowV1(result.window)).toEqual(result)
  })

  it("retains partial per-page checkpoints and resumes into a separate exact window", () => {
    const measurement = accepted([40, 40, 40])
    const first = paginateVNextTextFlowV4({ accepted: measurement, pageBodyHeightPt: 60, maximumPageCount: 2 })
    if (first.status === "blocked" || first.status === "fresh-page-required") throw new Error("first blocked")
    const firstWindow = createVNextTextFlowCompositionWindowV1({ pagination: first, context: context() })
    expect(firstWindow).toMatchObject({
      status: "ready",
      window: {
        status: "partial",
        pages: [
          { cursorBefore: { complete: false }, cursorAfter: { complete: false } },
          { cursorBefore: { complete: false }, cursorAfter: { complete: false } },
        ],
      },
    })

    const resumed = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
      cursor: first.cursorAfter,
    })
    const resumedWindow = createVNextTextFlowCompositionWindowV1({ pagination: resumed, context: context() })
    expect(resumedWindow).toMatchObject({
      status: "ready",
      window: {
        status: "complete",
        pages: [{ fragments: [{ fragmentIndex: 2, heading: null }] }],
      },
    })
    if (firstWindow.status === "blocked"
      || resumedWindow.status === "blocked"
      || firstWindow.window.status === "blocked"
      || resumedWindow.window.status === "blocked") throw new Error("window blocked")
    expect(resumedWindow.window.cursorBefore.stateFingerprint).toBe(firstWindow.window.cursorAfter.stateFingerprint)
  })

  it("projects fresh-page and honest family-blocked states distinctly", () => {
    const measurement = accepted([30])
    const fresh = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      firstPageAvailableHeightPt: 20,
      maximumPageCount: 2,
    })
    expect(createVNextTextFlowCompositionWindowV1({ pagination: fresh, context: context() })).toMatchObject({
      status: "ready",
      window: { status: "fresh-page-required", pages: [] },
    })

    const oversized = paginateVNextTextFlowV4({ accepted: accepted([61]), pageBodyHeightPt: 60, maximumPageCount: 2 })
    expect(createVNextTextFlowCompositionWindowV1({ pagination: oversized, context: context() })).toMatchObject({
      status: "ready",
      window: {
        status: "blocked",
        pages: null,
        issues: [expect.objectContaining({ code: "line-exceeds-page-body" })],
      },
    })
  })

  it("rejects stale pagination ownership and invalid compact context pins", () => {
    const pagination = paginateVNextTextFlowV4({ accepted: accepted([30]), pageBodyHeightPt: 60, maximumPageCount: 2 })
    const stale = JSON.parse(JSON.stringify(pagination))
    stale.cursorBefore.measurementFingerprint = pin("9")
    expect(createVNextTextFlowCompositionWindowV1({ pagination: stale, context: context() })).toMatchObject({
      status: "blocked",
      window: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "text-flow-pagination-fingerprint-mismatch" }),
        expect.objectContaining({ code: "text-flow-pagination-cursor-owner-mismatch" }),
      ]),
    })

    const tampered = JSON.parse(JSON.stringify(pagination))
    if (tampered.pages != null) tampered.pages[0].usedHeightPt += 1
    expect(createVNextTextFlowCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked",
      window: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "text-flow-pagination-fingerprint-mismatch" }),
      ]),
    })

    const invalidContext = context()
    invalidContext.familySourceFingerprint = "content-sized-owner"
    expect(createVNextTextFlowCompositionWindowV1({ pagination, context: invalidContext })).toMatchObject({
      status: "blocked",
      window: null,
      issues: [expect.objectContaining({ code: "invalid-fragment-window" })],
    })
  })

  it("projects 6,000 lines across 250 pages without retaining measured lines in the common window", () => {
    const pagination = paginateVNextTextFlowV4({
      accepted: accepted(Array.from({ length: 6_000 }, () => 24)),
      pageBodyHeightPt: 576,
      maximumPageCount: 250,
    })
    const scaleContext = context()
    scaleContext.maximumFragmentCount = 250
    delete scaleContext.headingLevel
    const result = createVNextTextFlowCompositionWindowV1({ pagination, context: scaleContext })

    expect(result).toMatchObject({
      status: "ready",
      window: {
        status: "complete",
        pages: expect.arrayContaining([
          expect.objectContaining({ windowPageIndex: 0 }),
          expect.objectContaining({ windowPageIndex: 249 }),
        ]),
        work: { pageCount: 250, fragmentCount: 250, cursorCommitCount: 250 },
      },
    })
    if (result.status === "blocked") throw new Error("scale adapter blocked")
    expect(result.window.pages).toHaveLength(250)
    expect(JSON.stringify(result.window).length).toBeLessThan(500_000)
  })
})
