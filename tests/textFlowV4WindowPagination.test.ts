import { describe, expect, it } from "vitest"
import {
  paginateVNextTextFlowV4,
  type VNextTextBlockV4MeasuredLinesResult,
} from "../src/index.js"

type Accepted = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

function accepted(heights: number[]): Accepted {
  let offset = 0
  const lines = heights.map((heightPt, index) => {
    const startOffset = offset
    offset += 1
    return {
      index,
      startOffset,
      endOffset: offset,
      text: String(index % 10),
      widthPt: 20,
      heightPt,
      sourceStart: {
        textBlockId: "text-1",
        inlineId: "run-1",
        authoredOffset: startOffset,
        resolvedOffset: startOffset,
        affinity: "forward" as const,
      },
      sourceEnd: {
        textBlockId: "text-1",
        inlineId: "run-1",
        authoredOffset: offset,
        resolvedOffset: offset,
        affinity: "backward" as const,
      },
    }
  })
  return {
    source: "vnext-text-block-v4-measurement",
    version: 1,
    status: "accepted",
    textBlockId: "text-1",
    lines,
    issues: [],
    summary: {
      lineCount: lines.length,
      renderedLength: offset,
      totalHeightPt: heights.reduce((total, height) => total + height, 0),
    },
  }
}

describe("Text-flow v4 bounded remainder and cursor pagination", () => {
  it("uses the exact first remainder and resumes to one-shot-equivalent pages", () => {
    const measurement = accepted([30, 30, 30, 30])
    const before = JSON.stringify(measurement)
    const oneShot = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      firstPageAvailableHeightPt: 30,
      maximumPageCount: 10,
    })
    expect(oneShot).toMatchObject({
      status: "complete",
      pages: [
        { familyPageIndex: 0, availableHeightPt: 30, usedHeightPt: 30, fragment: { lineStartIndex: 0, lineEndIndexExclusive: 1 } },
        { familyPageIndex: 1, availableHeightPt: 60, usedHeightPt: 60, fragment: { lineStartIndex: 1, lineEndIndexExclusive: 3 } },
        { familyPageIndex: 2, availableHeightPt: 60, usedHeightPt: 30, fragment: { lineStartIndex: 3, lineEndIndexExclusive: 4 } },
      ],
      cursorAfter: { nextLineIndex: 4, nextPageIndex: 3, complete: true },
      work: { pageAttemptCount: 3, cursorCommitCount: 3 },
    })

    const first = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      firstPageAvailableHeightPt: 30,
      maximumPageCount: 1,
    })
    if (first.status === "blocked" || first.status === "fresh-page-required") throw new Error("first window blocked")
    expect(first.status).toBe("partial")
    const resumed = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 10,
      cursor: first.cursorAfter,
    })
    if (resumed.status === "blocked" || resumed.status === "fresh-page-required" || oneShot.status === "blocked" || oneShot.status === "fresh-page-required") {
      throw new Error("resume fixture blocked")
    }
    expect([...first.pages, ...resumed.pages]).toEqual(oneShot.pages)
    expect(resumed.cursorAfter).toEqual(oneShot.cursorAfter)
    expect(JSON.stringify(measurement)).toBe(before)
  })

  it("requests one fresh page without cursor drift when the first line cannot use the remainder", () => {
    const measurement = accepted([30, 20])
    const first = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      firstPageAvailableHeightPt: 20,
      maximumPageCount: 10,
    })
    expect(first).toMatchObject({
      status: "fresh-page-required",
      pages: [],
      cursorBefore: { nextLineIndex: 0, nextPageIndex: 0 },
      work: { pageAttemptCount: 0, lineVisitCount: 0, cursorCommitCount: 0 },
    })
    if (first.status !== "fresh-page-required") throw new Error("expected fresh page")
    expect(first.cursorAfter).toEqual(first.cursorBefore)
    expect(paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 10,
      cursor: first.cursorAfter,
    })).toMatchObject({ status: "complete", summary: { lineCount: 2, pageCount: 1 } })
  })

  it("blocks stale cursors, already-complete cursors, and oversized measured lines", () => {
    const measurement = accepted([30])
    const complete = paginateVNextTextFlowV4({ accepted: measurement, pageBodyHeightPt: 60, maximumPageCount: 2 })
    if (complete.status === "blocked" || complete.status === "fresh-page-required") throw new Error("fixture blocked")
    const stale = { ...complete.cursorBefore, measurementFingerprint: `sha256:${"9".repeat(64)}` }

    expect(paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
      cursor: stale,
    })).toMatchObject({
      status: "blocked",
      pages: null,
      cursorAfter: null,
      issues: [expect.objectContaining({ code: "text-flow-cursor-owner-mismatch" })],
    })
    const impossibleProgress = { ...complete.cursorBefore, nextLineIndex: 1, nextPageIndex: 2, complete: true }
    expect(paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
      cursor: impossibleProgress,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "text-flow-cursor-progress-invalid" }),
      ]),
    })
    expect(paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
      cursor: complete.cursorAfter,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "text-flow-cursor-already-complete" })],
    })
    expect(paginateVNextTextFlowV4({
      accepted: accepted([61]),
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "line-exceeds-page-body", lineIndex: 0 })],
    })
  })

  it("bounds partial output without losing the exact continuation cursor", () => {
    const result = paginateVNextTextFlowV4({
      accepted: accepted([40, 40, 40]),
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
    })
    expect(result).toMatchObject({
      status: "partial",
      pages: [{ familyPageIndex: 0 }, { familyPageIndex: 1 }],
      cursorAfter: { nextLineIndex: 2, nextPageIndex: 2, complete: false },
      summary: { pageCount: 2, fragmentCount: 2, lineCount: 2, splitAcrossPages: true },
    })
    expect(result.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)

    expect(paginateVNextTextFlowV4({
      accepted: accepted([20, 20, 20]),
      pageBodyHeightPt: 60,
      maximumPageCount: 2,
      maximumLineCount: 2,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "text-flow-line-limit-exceeded" })],
    })
  })

  it("keeps 6,000 measured lines linear and compact across 250 pages", () => {
    const measurement = accepted(Array.from({ length: 6_000 }, () => 24))
    const result = paginateVNextTextFlowV4({
      accepted: measurement,
      pageBodyHeightPt: 576,
      maximumPageCount: 250,
    })
    expect(result).toMatchObject({
      status: "complete",
      cursorAfter: { nextLineIndex: 6_000, nextPageIndex: 250, complete: true },
      summary: { pageCount: 250, fragmentCount: 250, lineCount: 6_000, splitAcrossPages: true },
      work: { pageAttemptCount: 250, cursorCommitCount: 250 },
    })
    expect(result.work.lineVisitCount).toBeLessThanOrEqual(6_250)
    expect(result.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })
})
