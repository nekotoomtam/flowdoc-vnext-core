import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  measureVNextTocV4,
  paginateVNextTocV4,
  type DocumentNodeV4Target,
  type VNextTextMeasurer,
  type VNextTocV4MeasurementResult,
  type VNextTocV4MeasurementSpec,
} from "../src/index.js"

function measured(rowCount = 4): Extract<VNextTocV4MeasurementResult, { status: "measured" }> {
  const nodes: Record<string, any> = {
    body: { id: "body", type: "zone", role: "body", childIds: ["toc", ...Array.from({ length: rowCount }, (_, index) => `h-${index}`)] },
    toc: { id: "toc", type: "toc", props: { title: "Contents" } },
  }
  for (let index = 0; index < rowCount; index += 1) nodes[`h-${index}`] = {
    id: `h-${index}`, type: "text-block", role: { role: "heading", level: 1 }, props: {},
    children: [{ id: `h-${index}-text`, type: "text", text: `Heading ${index}` }],
  }
  const margin = { value: 40, unit: "pt" as const }
  const document: DocumentNodeV4Target = {
    version: 4, document: { id: "toc-pages", sections: [{
      id: "main", type: "section",
      page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
      zoneIds: ["body"], nodes,
    }] },
  }
  const semantic = collectVNextTocV4Semantics(document)
  const spec: VNextTocV4MeasurementSpec = {
    availableWidthPt: 300, availableHeightPt: 70, measurementProfileId: "pages",
    titleStyleKey: "title", pageNumberStyleKey: "page",
    entryStyleKeyByLevel: { "1": "l1", "2": "l2", "3": "l3", "4": "l4", "5": "l5", "6": "l6" },
    indentPtByLevel: { "1": 0, "2": 10, "3": 20, "4": 30, "5": 40, "6": 50 },
    pageNumberColumnWidthPt: 30, pageNumberCapacityDigits: 3,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 10, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 0, rowGapPt: 0, maximumEntryCount: 10, maximumMeasuredLineCount: 20,
  }
  const textMeasurer: VNextTextMeasurer = {
    measure(input) {
      return {
        lines: [input.text], lineHeightPt: 30, widthPt: Math.min(input.availableWidthPt, input.text.length * 5), heightPt: 30,
        lineBoxes: [{ index: 0, text: input.text, startOffset: 0, endOffset: input.text.length, widthPt: Math.min(input.availableWidthPt, input.text.length * 5), heightPt: 30, yOffsetPt: 0 }],
      }
    },
  }
  const result = measureVNextTocV4({ semantic, tocNodeId: "toc", spec, textMeasurer })
  if (result.status !== "measured") throw new Error("measurement fixture blocked")
  return result
}

describe("TOC v4 pagination", () => {
  it("moves title with first row to a fresh page and resumes to one-shot equivalent placement", () => {
    const measurement = measured()
    const before = JSON.stringify(measurement)
    const first = paginateVNextTocV4({
      measurement, pageBodyHeightPt: 70, firstPageAvailableHeightPt: 40,
      startPageIndex: 0, maximumPageCount: 2,
    })
    expect(first).toMatchObject({
      status: "partial",
      pages: [
        { pageIndex: 0, usedHeightPt: 0, freshPageAdvance: true, title: null, rows: [] },
        { pageIndex: 1, usedHeightPt: 60, title: { yPt: 0, heightPt: 30 }, rows: [{ rowIndex: 0, yPt: 30 }] },
      ],
      cursorAfter: { titlePlaced: true, nextRowIndex: 1, nextPageIndex: 2, complete: false },
      summary: { freshPageAdvanceCount: 1, placedRowCount: 1 },
    })
    if (first.status === "blocked") throw new Error("first window blocked")
    const resumed = paginateVNextTocV4({
      measurement, pageBodyHeightPt: 70, maximumPageCount: 10, cursor: first.cursorAfter,
    })
    expect(resumed).toMatchObject({
      status: "complete", cursorAfter: { nextRowIndex: 4, nextPageIndex: 4, complete: true },
      pages: [
        { pageIndex: 2, rows: [{ rowIndex: 1 }, { rowIndex: 2 }] },
        { pageIndex: 3, rows: [{ rowIndex: 3 }], complete: true },
      ],
    })
    const oneShot = paginateVNextTocV4({
      measurement, pageBodyHeightPt: 70, firstPageAvailableHeightPt: 40,
      startPageIndex: 0, maximumPageCount: 10,
    })
    if (resumed.status === "blocked" || oneShot.status === "blocked") throw new Error("resume fixture blocked")
    expect([...first.pages, ...resumed.pages]).toEqual(oneShot.pages)
    expect(resumed.cursorAfter).toEqual(oneShot.cursorAfter)
    expect(JSON.stringify(measurement)).toBe(before)
  })

  it("forces oversized rows once, reports impossible title keep, and blocks cursor drift", () => {
    const measurement = measured(1)
    measurement.rows[0].heightPt = 90
    measurement.rows[0].label.heightPt = 90
    measurement.fingerprint = "forced-measurement"
    const result = paginateVNextTocV4({ measurement, pageBodyHeightPt: 70, maximumPageCount: 10 })
    expect(result).toMatchObject({
      status: "complete",
      pages: [
        { pageIndex: 0, title: { heightPt: 30 }, rows: [], warnings: [{ code: "title-keep-with-first-unsatisfied" }] },
        { pageIndex: 1, usedHeightPt: 90, remainingHeightPt: -20, rows: [{ rowIndex: 0, forcedOverflow: true }], warnings: [{ code: "forced-row-overflow", headingNodeId: "h-0" }] },
      ],
      summary: { forcedOverflowCount: 1 },
    })
    if (result.status === "blocked") throw new Error("forced fixture blocked")
    const drifted = { ...result.cursorAfter, measurementFingerprint: "stale", complete: false, nextRowIndex: 0 }
    expect(paginateVNextTocV4({
      measurement, pageBodyHeightPt: 70, maximumPageCount: 1, cursor: drifted,
    })).toMatchObject({ status: "blocked", cursorAfter: null, pages: null, issues: [expect.objectContaining({ code: "cursor-owner-mismatch" })] })
  })

  it("applies row gaps only between rows placed on the same page", () => {
    const measurement = measured(3)
    measurement.spec.rowGapPt = 5
    measurement.fingerprint = "row-gap-measurement"
    const result = paginateVNextTocV4({ measurement, pageBodyHeightPt: 70, maximumPageCount: 10 })
    expect(result).toMatchObject({
      status: "complete",
      pages: [
        { pageIndex: 0, usedHeightPt: 60, rows: [{ rowIndex: 0, yPt: 30 }] },
        { pageIndex: 1, usedHeightPt: 65, rows: [{ rowIndex: 1, yPt: 0 }, { rowIndex: 2, yPt: 35 }] },
      ],
    })
  })

  it("blocks impossible cursor contract and title progress states atomically", () => {
    const measurement = measured(2)
    const complete = paginateVNextTocV4({ measurement, pageBodyHeightPt: 70, maximumPageCount: 10 })
    if (complete.status === "blocked") throw new Error("cursor fixture blocked")
    const invalid = {
      ...complete.cursorAfter,
      contractVersion: 2 as any,
      kind: "wrong" as any,
      titlePlaced: false,
      nextRowIndex: 1,
      complete: false,
    }
    expect(paginateVNextTocV4({
      measurement, pageBodyHeightPt: 70, maximumPageCount: 1, cursor: invalid,
    })).toMatchObject({
      status: "blocked", cursorAfter: null, pages: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "cursor-contract-invalid" }),
        expect.objectContaining({ code: "cursor-title-row-order-invalid" }),
      ]),
    })
  })
})
