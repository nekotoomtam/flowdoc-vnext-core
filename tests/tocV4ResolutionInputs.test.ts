import { describe, expect, it } from "vitest"
import {
  finalizeVNextTocV4PaginationWindows,
  parseVNextDocumentV4HeadingPageMap,
  type VNextTocV4MeasurementResult,
  type VNextTocV4PaginationCursor,
  type VNextTocV4PaginationResult,
} from "../src/index.js"

function cursor(nextRowIndex: number, nextPageIndex: number, titlePlaced: boolean, complete: boolean): VNextTocV4PaginationCursor {
  return {
    contractVersion: 1, kind: "toc-pagination-cursor", tocNodeId: "toc",
    measurementFingerprint: "measurement-1", titlePlaced, nextRowIndex, nextPageIndex, complete,
  }
}

function fixtures(): { measurement: VNextTocV4MeasurementResult; windows: VNextTocV4PaginationResult[] } {
  const measurement: VNextTocV4MeasurementResult = {
    status: "measured", tocNodeId: "toc", fingerprint: "measurement-1",
    title: { heightPt: 10 },
    rows: [
      { identity: { tocNodeId: "toc", headingNodeId: "h-0" } },
      { identity: { tocNodeId: "toc", headingNodeId: "h-1" } },
    ],
  } as any
  const c0 = cursor(0, 4, false, false)
  const c1 = cursor(1, 5, true, false)
  const c2 = cursor(2, 6, true, true)
  const base = {
    source: "vnext-toc-v4-pagination", contractVersion: 1,
    tocNodeId: "toc", measurementFingerprint: "measurement-1",
    summary: { pageCount: 1, placedRowCount: 1, forcedOverflowCount: 0, freshPageAdvanceCount: 0 },
    work: { pageAttemptCount: 1, rowVisitCount: 1, cursorCommitCount: 1 },
    contracts: { measurementExecution: false, finalPageResolution: "not-run", rendering: "not-run", cursorCommit: "atomic-per-page" },
    fingerprint: "window", issues: [],
  } as const
  return {
    measurement,
    windows: [{
      ...base, status: "partial", cursorBefore: c0, cursorAfter: c1,
      pages: [{
        fragmentId: "toc:page-4", tocNodeId: "toc", pageIndex: 4,
        availableHeightPt: 100, usedHeightPt: 30, remainingHeightPt: 70,
        complete: false, freshPageAdvance: false, title: { yPt: 0, heightPt: 10, forcedOverflow: false },
        rows: [{ rowIndex: 0, identity: { tocNodeId: "toc", headingNodeId: "h-0" }, headingNodeId: "h-0", yPt: 10, heightPt: 20, forcedOverflow: false }], warnings: [],
      }],
    }, {
      ...base, status: "complete", cursorBefore: c1, cursorAfter: c2,
      pages: [{
        fragmentId: "toc:page-5", tocNodeId: "toc", pageIndex: 5,
        availableHeightPt: 100, usedHeightPt: 20, remainingHeightPt: 80,
        complete: true, freshPageAdvance: false, title: null,
        rows: [{ rowIndex: 1, identity: { tocNodeId: "toc", headingNodeId: "h-1" }, headingNodeId: "h-1", yPt: 0, heightPt: 20, forcedOverflow: false }], warnings: [],
      }],
    }] as unknown as VNextTocV4PaginationResult[],
  }
}

describe("TOC v4 final resolution inputs", () => {
  it("finalizes exact contiguous pagination windows into one complete manifest", () => {
    const input = fixtures()
    const before = JSON.stringify(input)
    const first = finalizeVNextTocV4PaginationWindows(input)
    const second = finalizeVNextTocV4PaginationWindows(input)
    expect(first).toMatchObject({
      status: "ready",
      manifest: {
        tocNodeId: "toc", measurementFingerprint: "measurement-1",
        summary: { windowCount: 2, pageCount: 2, rowCount: 2, warningCount: 0 },
        cursorBefore: { nextPageIndex: 4 }, cursorAfter: { nextPageIndex: 6, complete: true },
      },
    })
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(JSON.stringify(input)).toBe(before)
  })

  it("blocks broken cursor chains and incomplete row coverage", () => {
    const input = fixtures()
    if (input.windows[1].status === "blocked") throw new Error("fixture blocked")
    input.windows[1].cursorBefore = { ...input.windows[1].cursorBefore, nextRowIndex: 0 }
    input.windows[1].pages[0].rows = []
    expect(finalizeVNextTocV4PaginationWindows(input)).toMatchObject({
      status: "blocked", manifest: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "manifest-cursor-chain-broken" }),
        expect.objectContaining({ code: "manifest-row-count-mismatch" }),
      ]),
    })
  })

  it("parses a complete unique heading-page map and rejects duplicates/range drift", () => {
    const value = {
      source: "vnext-document-v4-heading-page-map", contractVersion: 1,
      kind: "document-v4-heading-page-map", documentId: "doc",
      documentPaginationFingerprint: "document-pages-1", status: "complete",
      pageCount: 3,
      entries: [
        { headingNodeId: "h-0", sectionId: "main", sourceFragmentId: "f-0", pageIndex: 0, pageNumber: 1 },
        { headingNodeId: "h-1", sectionId: "main", sourceFragmentId: "f-1", pageIndex: 2, pageNumber: 3 },
      ],
    }
    expect(parseVNextDocumentV4HeadingPageMap(value)).toMatchObject({
      status: "ready", map: {
        documentId: "doc", pageCount: 3,
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
    })
    const invalid = JSON.parse(JSON.stringify(value))
    invalid.entries[1].headingNodeId = "h-0"
    invalid.entries[1].pageIndex = 3
    expect(parseVNextDocumentV4HeadingPageMap(invalid)).toMatchObject({
      status: "blocked", map: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "duplicate-heading-page-entry" }),
        expect.objectContaining({ code: "heading-page-index-out-of-range" }),
      ]),
    })
  })
})
