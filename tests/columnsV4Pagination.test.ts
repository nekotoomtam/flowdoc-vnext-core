import { describe, expect, it } from "vitest"
import {
  paginateVNextColumnsV4,
  type VNextColumnsV4ChildFragmentSource,
  type VNextColumnsV4Geometry,
} from "../src/index.js"

function source(
  nodeId: string,
  heights: number[],
  keepPolicy: "allow-split" | "prefer-together" = "allow-split",
): VNextColumnsV4ChildFragmentSource {
  let total = 0
  const prefixHeightsPt = [0]
  const point = (offset: number) => ({
    textBlockId: nodeId,
    inlineId: `${nodeId}-run`,
    authoredOffset: offset,
    resolvedOffset: offset,
    affinity: "forward" as const,
  })
  const candidates = heights.map((heightPt, fragmentIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      fragmentId: `${nodeId}:line-${fragmentIndex}`,
      nodeId,
      fragmentIndex,
      sourceKind: "text-line" as const,
      heightPt,
      breakAfter: true as const,
      sourceStart: point(fragmentIndex),
      sourceEnd: point(fragmentIndex + 1),
    }
  })
  return {
    source: "vnext-columns-v4-fragments",
    version: 1,
    kind: "text-block-lines",
    nodeId,
    keepPolicy,
    candidates,
    prefixHeightsPt,
    totalHeightPt: total,
    fingerprint: `${nodeId}:${keepPolicy}:${heights.join(",")}`,
  }
}

function geometry(): VNextColumnsV4Geometry {
  return {
    columnsId: "columns-main",
    sectionId: "section-main",
    availableWidthPt: 500,
    gapPt: 20,
    contentWidthPt: 480,
    tracks: [
      { columnId: "left", columnIndex: 0, widthShare: 50, xOffsetPt: 0, widthPt: 240 },
      { columnId: "right", columnIndex: 1, widthShare: 50, xOffsetPt: 260, widthPt: 240 },
    ],
    fingerprint: "columns-main:500:20:left:50:240:right:50:240",
  }
}

describe("columns v4 parallel pagination", () => {
  it("continues until the longest lane completes and leaves completed lanes empty", () => {
    const input = {
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [source("left-text", [40, 40, 40])] },
        { columnId: "right", sources: [source("right-text", [30])] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    }
    const before = JSON.stringify(input)
    const result = paginateVNextColumnsV4(input)

    expect(result).toMatchObject({
      status: "paginated",
      summary: { pageCount: 2, splitAcrossPages: true, maximumFragmentHeightPt: 80 },
      pages: [
        {
          pageIndex: 0,
          usedHeightPt: 80,
          complete: false,
          columns: [
            { columnId: "left", usedHeightPt: 80, complete: false },
            { columnId: "right", usedHeightPt: 30, complete: true },
          ],
        },
        {
          pageIndex: 1,
          usedHeightPt: 40,
          complete: true,
          columns: [
            { columnId: "left", usedHeightPt: 40, complete: true },
            { columnId: "right", usedHeightPt: 0, complete: true, placements: [] },
          ],
        },
      ],
      contracts: { measurementExecution: false, laneCursorCommit: "atomic" },
      workFacts: { pageAttemptCount: 2, lanePlanCount: 4, consumedFragmentCount: 4 },
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("advances to a full page when prefer-together content cannot use the first remainder", () => {
    const result = paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [source("left-card", [30, 30], "prefer-together")] },
        { columnId: "right", sources: [] },
      ],
      firstPageAvailableHeightPt: 50,
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })

    expect(result).toMatchObject({
      status: "paginated",
      pages: [
        { availableHeightPt: 50, usedHeightPt: 0, complete: false },
        { availableHeightPt: 100, usedHeightPt: 60, complete: true },
      ],
      workFacts: { zeroProgressPageAdvanceCount: 1 },
    })
  })

  it("uses minimum height for an all-empty Columns container", () => {
    const result = paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [] },
        { columnId: "right", sources: [] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 2,
      minimumHeightPt: 24,
    })

    expect(result).toMatchObject({
      status: "paginated",
      pages: [{ usedHeightPt: 24, complete: true }],
      summary: { pageCount: 1, maximumFragmentHeightPt: 24 },
    })

    expect(paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [] },
        { columnId: "right", sources: [] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 2,
      minimumHeightPt: 101,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "minimum-height-exceeds-page-body" }),
      ]),
    })
  })

  it("blocks atomically when any lane is invalid", () => {
    const result = paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [source("oversized", [120])] },
        { columnId: "right", sources: [source("right-text", [20])] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })

    expect(result).toMatchObject({
      status: "blocked",
      cursorAfter: null,
      pages: null,
      issues: [expect.objectContaining({ code: "fragment-exceeds-page-body", columnId: "left" })],
      cursorBefore: {
        columns: [
          { columnId: "left", child: { fragmentIndex: 0 } },
          { columnId: "right", child: { fragmentIndex: 0 } },
        ],
      },
    })
  })

  it("bounds page attempts and validates geometry/lane order", () => {
    const limited = paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "left", sources: [source("long", [60, 60, 60])] },
        { columnId: "right", sources: [] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 2,
    })
    const wrongOrder = paginateVNextColumnsV4({
      geometry: geometry(),
      lanes: [
        { columnId: "right", sources: [] },
        { columnId: "left", sources: [] },
      ],
      pageBodyHeightPt: 100,
      maximumPageCount: 2,
    })

    expect(limited).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "columns-page-limit-exceeded" })],
    })
    expect(wrongOrder).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "columns-lane-order-mismatch" }),
      ]),
    })
  })
})
