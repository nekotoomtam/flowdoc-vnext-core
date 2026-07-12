import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  createApproximateVNextTextMeasurer,
  measureVNextTocV4,
  paginateVNextTocV4,
  type DocumentNodeV4Target,
  type VNextTocV4MeasurementSpec,
  type VNextTocV4PageFragment,
  type VNextTocV4PaginationCursor,
} from "../src/index.js"

const ROW_COUNT = 1_000

function measurement() {
  const nodes: Record<string, any> = {
    body: { id: "body", type: "zone", role: "body", childIds: ["toc", ...Array.from({ length: ROW_COUNT }, (_, index) => `h-${index}`)] },
    toc: { id: "toc", type: "toc", props: { title: "Contents" } },
  }
  for (let index = 0; index < ROW_COUNT; index += 1) nodes[`h-${index}`] = {
    id: `h-${index}`, type: "text-block", role: { role: "heading", level: 1 }, props: {},
    children: [{ id: `h-${index}-text`, type: "text", text: `Heading ${index}` }],
  }
  const margin = { value: 40, unit: "pt" as const }
  const document: DocumentNodeV4Target = {
    version: 4, document: { id: "toc-pagination-scale", sections: [{
      id: "main", type: "section",
      page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
      zoneIds: ["body"], nodes,
    }] },
  }
  const semantic = collectVNextTocV4Semantics(document)
  const spec: VNextTocV4MeasurementSpec = {
    availableWidthPt: 480, availableHeightPt: 100, measurementProfileId: "pagination-scale",
    titleStyleKey: "title", pageNumberStyleKey: "page",
    entryStyleKeyByLevel: { "1": "l1", "2": "l2", "3": "l3", "4": "l4", "5": "l5", "6": "l6" },
    indentPtByLevel: { "1": 0, "2": 10, "3": 20, "4": 30, "5": 40, "6": 50 },
    pageNumberColumnWidthPt: 30, pageNumberCapacityDigits: 4,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 12, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 8, rowGapPt: 2, maximumEntryCount: ROW_COUNT, maximumMeasuredLineCount: ROW_COUNT + 2,
  }
  const result = measureVNextTocV4({
    semantic, tocNodeId: "toc", spec,
    textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
  })
  if (result.status !== "measured") throw new Error("scale measurement blocked")
  return result
}

describe("TOC v4 pagination scale", () => {
  it("resumes 1,000 rows in seven-page windows equivalent to one-shot pagination", () => {
    const measured = measurement()
    const oneShot = paginateVNextTocV4({ measurement: measured, pageBodyHeightPt: 100, maximumPageCount: 1_000 })
    expect(oneShot.status).toBe("complete")
    if (oneShot.status === "blocked") throw new Error("one-shot blocked")
    expect(oneShot).toMatchObject({
      summary: { pageCount: 167, placedRowCount: ROW_COUNT, forcedOverflowCount: 0, freshPageAdvanceCount: 0 },
      cursorAfter: { nextRowIndex: ROW_COUNT, nextPageIndex: 167, complete: true },
    })

    const pages: VNextTocV4PageFragment[] = []
    let cursor: VNextTocV4PaginationCursor | undefined
    let callCount = 0
    do {
      const window = paginateVNextTocV4({
        measurement: measured, pageBodyHeightPt: 100, maximumPageCount: 7,
        ...(cursor == null ? {} : { cursor }),
      })
      if (window.status === "blocked") throw new Error(window.issues.map((item) => item.message).join("\n"))
      expect(window.pages.length).toBeLessThanOrEqual(7)
      pages.push(...window.pages)
      cursor = window.cursorAfter
      callCount += 1
    } while (!cursor.complete)

    expect(callCount).toBe(24)
    expect(pages).toEqual(oneShot.pages)
    expect(cursor).toEqual(oneShot.cursorAfter)
    expect(pages.flatMap((page) => page.rows.map((row) => row.rowIndex))).toEqual(
      Array.from({ length: ROW_COUNT }, (_, index) => index),
    )
  }, 30_000)

  it("returns a bounded partial cursor instead of dropping work", () => {
    const result = paginateVNextTocV4({ measurement: measurement(), pageBodyHeightPt: 100, maximumPageCount: 1 })
    expect(result).toMatchObject({
      status: "partial", pages: [{ pageIndex: 0 }],
      cursorAfter: { nextRowIndex: 5, nextPageIndex: 1, complete: false },
      summary: { pageCount: 1, placedRowCount: 5 },
      contracts: { measurementExecution: false, finalPageResolution: "not-run", rendering: "not-run", cursorCommit: "atomic-per-page" },
    })
  }, 30_000)
})
