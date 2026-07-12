import { describe, expect, it } from "vitest"
import {
  createInitialVNextTableCellCursorV1,
  planVNextTableCellV1,
  type VNextTablePreparedCellV1,
} from "../src/index.js"

function cell(heights: number[], insets = { top: 5, right: 0, bottom: 5, left: 0 }): VNextTablePreparedCellV1 {
  let total = 0
  const prefixHeightsPt = [0]
  const candidates = heights.map((heightPt, candidateIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      candidateId: `text-1:line-${candidateIndex}`,
      nodeId: "text-1",
      candidateIndex,
      kind: "text-line" as const,
      atomic: false as const,
      heightPt,
      breakAfter: true as const,
      sourceStart: {
        textBlockId: "text-1", inlineId: "inline-1", authoredOffset: candidateIndex,
        resolvedOffset: candidateIndex, affinity: "forward" as const,
      },
      sourceEnd: {
        textBlockId: "text-1", inlineId: "inline-1", authoredOffset: candidateIndex + 1,
        resolvedOffset: candidateIndex + 1, affinity: "backward" as const,
      },
    }
  })
  return {
    sourceCellId: "cell-1",
    cellIdentity: { kind: "resolved-cell", cellInstanceId: "celli_000000000001" },
    columnStart: 0,
    colSpan: 1,
    xOffsetPt: 0,
    outerWidthPt: 200,
    contentWidthPt: 200,
    insetsPt: insets,
    children: [],
    candidates,
    prefixHeightsPt,
    contentHeightPt: total,
    outerHeightPt: insets.top + total + insets.bottom,
    completeWhenEmpty: heights.length === 0,
    fingerprint: JSON.stringify(["cell-1", heights]),
  }
}

describe("Table cell pagination v1", () => {
  it("uses top inset once, bottom inset on completion, and monotonic cursors", () => {
    const prepared = cell([30, 30, 30])
    const before = JSON.stringify(prepared)
    const first = planVNextTableCellV1({ cell: prepared, availableHeightPt: 70, pageBodyHeightPt: 100 })

    expect(first).toMatchObject({
      status: "planned",
      usedHeightPt: 65,
      complete: false,
      progressed: true,
      placements: [{ yOffsetPt: 5 }, { yOffsetPt: 35 }],
      cursorAfter: { candidateIndex: 2, complete: false },
      work: { checkpointLookupCount: 1, consumedCandidateCount: 2 },
    })
    if (first.status !== "planned") throw new Error("first cell plan blocked")
    const second = planVNextTableCellV1({
      cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: first.cursorAfter,
    })
    expect(second).toMatchObject({
      status: "planned",
      usedHeightPt: 35,
      complete: true,
      placements: [{ yOffsetPt: 0 }],
      cursorBefore: { candidateIndex: 2 },
      cursorAfter: { candidateIndex: 3, complete: true },
    })
    expect(JSON.stringify(prepared)).toBe(before)
  })

  it("commits empty-cell insets once and leaves completed continuations empty", () => {
    const prepared = cell([])
    const first = planVNextTableCellV1({ cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100 })
    expect(first).toMatchObject({
      status: "planned", usedHeightPt: 10, complete: true, progressed: true,
      placements: [], cursorAfter: { candidateIndex: 0, complete: true },
    })
    if (first.status !== "planned") throw new Error("empty cell plan blocked")
    expect(planVNextTableCellV1({
      cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: first.cursorAfter,
    })).toMatchObject({
      status: "planned", usedHeightPt: 0, complete: true, progressed: false,
      continuationReason: "already-complete",
    })
  })

  it("requests a fresh page without cursor progress when the next boundary can fit there", () => {
    const prepared = cell([40])
    expect(planVNextTableCellV1({
      cell: prepared, availableHeightPt: 30, pageBodyHeightPt: 100,
    })).toMatchObject({
      status: "planned",
      usedHeightPt: 0,
      complete: false,
      progressed: false,
      needsFreshPage: true,
      continuationReason: "fresh-page-required",
      cursorBefore: { candidateIndex: 0 },
      cursorAfter: { candidateIndex: 0 },
    })
  })

  it("blocks candidates or empty insets that cannot fit a fresh page", () => {
    expect(planVNextTableCellV1({
      cell: cell([96], { top: 2, right: 0, bottom: 3, left: 0 }),
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
    })).toMatchObject({
      status: "blocked",
      cursorAfter: null,
      issues: [expect.objectContaining({ code: "cell-candidate-exceeds-page-body" })],
    })
    expect(planVNextTableCellV1({
      cell: cell([], { top: 60, right: 0, bottom: 50, left: 0 }),
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "empty-cell-insets-exceed-page-body" })],
    })
  })

  it("blocks cursor identity, bounds, and completion drift", () => {
    const prepared = cell([20])
    const wrongIdentity = createInitialVNextTableCellCursorV1(prepared)
    wrongIdentity.sourceCellId = "other-cell"
    const outOfBounds = createInitialVNextTableCellCursorV1(prepared)
    outOfBounds.candidateIndex = 2
    const falseComplete = createInitialVNextTableCellCursorV1(prepared)
    falseComplete.complete = true

    expect(planVNextTableCellV1({
      cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: wrongIdentity,
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "cell-cursor-identity-mismatch" }),
    ]) })
    expect(planVNextTableCellV1({
      cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: outOfBounds,
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "cell-cursor-out-of-bounds" }),
    ]) })
    expect(planVNextTableCellV1({
      cell: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: falseComplete,
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "complete-cell-cursor-index-mismatch" }),
    ]) })
  })
})
