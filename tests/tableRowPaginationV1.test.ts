import { describe, expect, it } from "vitest"
import {
  createInitialVNextTableRowCursorV1,
  planVNextTableRowV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedMaterializedRowV1,
} from "../src/index.js"

function preparedCell(sourceCellId: string, heights: number[]): VNextTablePreparedCellV1 {
  let total = 0
  const prefixHeightsPt = [0]
  const candidates = heights.map((heightPt, candidateIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      candidateId: `${sourceCellId}:line-${candidateIndex}`,
      nodeId: `${sourceCellId}-text`, candidateIndex, kind: "text-line" as const,
      atomic: false as const, text: `${sourceCellId}-${candidateIndex}`,
      widthPt: 20, heightPt, breakAfter: true as const,
      sourceStart: {
        textBlockId: `${sourceCellId}-text`, inlineId: `${sourceCellId}-inline`,
        authoredOffset: candidateIndex, resolvedOffset: candidateIndex, affinity: "forward" as const,
      },
      sourceEnd: {
        textBlockId: `${sourceCellId}-text`, inlineId: `${sourceCellId}-inline`,
        authoredOffset: candidateIndex + 1, resolvedOffset: candidateIndex + 1, affinity: "backward" as const,
      },
    }
  })
  return {
    sourceCellId,
    cellIdentity: { kind: "resolved-cell", cellInstanceId: `celli_${sourceCellId}` },
    columnStart: sourceCellId === "left" ? 0 : 1,
    colSpan: 1,
    xOffsetPt: sourceCellId === "left" ? 0 : 200,
    outerWidthPt: 200,
    contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 },
    verticalAlign: sourceCellId === "left" ? "middle" : "bottom",
    children: [], candidates, prefixHeightsPt, contentHeightPt: total, outerHeightPt: total,
    completeWhenEmpty: heights.length === 0,
    fingerprint: JSON.stringify([sourceCellId, heights]),
  }
}

function row(
  left: number[],
  right: number[],
  breakPolicy: "allow" | "prefer-keep" | "strict-keep" = "allow",
  minimumFirstFragmentHeightPt = 0,
): VNextTablePreparedMaterializedRowV1 {
  const cells = [preparedCell("left", left), preparedCell("right", right)]
  return {
    kind: "prepared-materialized-row",
    rowIndex: 0,
    rowInstanceId: "rowi_000000000001",
    rowSourceId: "items-source",
    rowTemplateId: "item-template",
    itemKey: "item-1",
    role: "body",
    breakPolicy,
    minimumFirstFragmentHeightPt,
    cells,
    maximumCellOuterHeightPt: Math.max(...cells.map((cell) => cell.outerHeightPt)),
    fingerprint: "row-1",
  }
}

describe("synchronized Table row pagination v1", () => {
  it("reconciles unequal cells by maximum height and leaves completed cells empty later", () => {
    const prepared = row([40, 40, 40], [30])
    const before = JSON.stringify(prepared)
    const first = planVNextTableRowV1({ row: prepared, availableHeightPt: 100, pageBodyHeightPt: 100 })
    expect(first).toMatchObject({
      status: "planned",
      usedHeightPt: 80,
      complete: false,
      progressed: true,
      cells: [
        {
          sourceCellId: "left", contentWidthPt: 200, verticalAlign: "middle",
          insetsPt: { top: 0, right: 0, bottom: 0, left: 0 },
          usedHeightPt: 80, complete: false, placements: [{}, {}],
        },
        {
          sourceCellId: "right", contentWidthPt: 200, verticalAlign: "bottom",
          insetsPt: { top: 0, right: 0, bottom: 0, left: 0 },
          usedHeightPt: 30, complete: true, placements: [{}],
        },
      ],
      cursorAfter: { fragmentIndex: 1, complete: false },
      contracts: { cellCursorCommit: "atomic", measurementExecution: false },
    })
    if (first.status !== "planned") throw new Error("first row plan blocked")
    const second = planVNextTableRowV1({
      row: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: first.cursorAfter,
    })
    expect(second).toMatchObject({
      status: "planned", usedHeightPt: 40, complete: true,
      cells: [
        { sourceCellId: "left", usedHeightPt: 40, complete: true, placements: [{}] },
        { sourceCellId: "right", usedHeightPt: 0, complete: true, placements: [] },
      ],
      cursorAfter: { fragmentIndex: 2, complete: true },
    })
    expect(JSON.stringify(prepared)).toBe(before)
  })

  it("moves prefer-keep whole, then falls back to splitting when taller than a fresh page", () => {
    expect(planVNextTableRowV1({
      row: row([30, 30], [], "prefer-keep"), availableHeightPt: 50, pageBodyHeightPt: 100,
    })).toMatchObject({
      status: "planned", usedHeightPt: 0, progressed: false, needsFreshPage: true,
      continuationReason: "keep-move-whole", work: { cellPlanCount: 0 },
    })
    expect(planVNextTableRowV1({
      row: row([60, 60], [], "prefer-keep"), availableHeightPt: 100, pageBodyHeightPt: 100,
    })).toMatchObject({
      status: "planned", usedHeightPt: 60, complete: false,
      cursorAfter: { fragmentIndex: 1 },
    })
  })

  it("enforces strict-keep and first-fragment minimum height", () => {
    const strict = row([30, 30], [20], "strict-keep")
    expect(planVNextTableRowV1({ row: strict, availableHeightPt: 50, pageBodyHeightPt: 100 })).toMatchObject({
      status: "planned", needsFreshPage: true, continuationReason: "keep-move-whole",
    })
    expect(planVNextTableRowV1({ row: strict, availableHeightPt: 100, pageBodyHeightPt: 100 })).toMatchObject({
      status: "planned", complete: true, usedHeightPt: 60,
    })
    expect(planVNextTableRowV1({
      row: row([60, 60], [], "strict-keep"), availableHeightPt: 100, pageBodyHeightPt: 100,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "strict-keep-row-exceeds-page-body" })] })

    const minimum = row([20], [], "allow", 80)
    expect(planVNextTableRowV1({ row: minimum, availableHeightPt: 70, pageBodyHeightPt: 100 })).toMatchObject({
      status: "planned", needsFreshPage: true, continuationReason: "minimum-height-move",
    })
    expect(planVNextTableRowV1({ row: minimum, availableHeightPt: 100, pageBodyHeightPt: 100 })).toMatchObject({
      status: "planned", complete: true, usedHeightPt: 80,
    })
  })

  it("blocks the whole row without committing sibling progress when one cell is oversized", () => {
    const prepared = row([20], [120])
    const cursor = createInitialVNextTableRowCursorV1(prepared)
    const result = planVNextTableRowV1({
      row: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor,
    })
    expect(result).toMatchObject({
      status: "blocked",
      cursorBefore: cursor,
      cursorAfter: null,
      cells: null,
      issues: [expect.objectContaining({ code: "cell-candidate-exceeds-page-body", sourceCellId: "right" })],
    })
  })

  it("blocks cursor identity/order and prepared height drift", () => {
    const prepared = row([20], [20])
    const wrongIdentity = createInitialVNextTableRowCursorV1(prepared)
    wrongIdentity.rowIndex = 1
    const wrongOrder = createInitialVNextTableRowCursorV1(prepared)
    wrongOrder.cells.reverse()
    const drifted = row([20], [20])
    drifted.maximumCellOuterHeightPt = 99

    expect(planVNextTableRowV1({
      row: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: wrongIdentity,
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "row-cursor-identity-mismatch" }),
    ]) })
    expect(planVNextTableRowV1({
      row: prepared, availableHeightPt: 100, pageBodyHeightPt: 100, cursor: wrongOrder,
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "row-cursor-cell-order-mismatch" }),
    ]) })
    expect(planVNextTableRowV1({
      row: drifted, availableHeightPt: 100, pageBodyHeightPt: 100,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "prepared-row-height-drift" })] })
  })
})
