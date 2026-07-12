import { describe, expect, it } from "vitest"
import {
  paginateVNextTableRowsV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
} from "../src/index.js"

function cell(id: string, heights: number[]): VNextTablePreparedCellV1 {
  let total = 0
  const prefixHeightsPt = [0]
  const candidates = heights.map((heightPt, candidateIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      candidateId: `${id}:line-${candidateIndex}`, nodeId: `${id}-text`, candidateIndex,
      kind: "text-line" as const, atomic: false as const, heightPt, breakAfter: true as const,
      sourceStart: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex, resolvedOffset: candidateIndex, affinity: "forward" as const },
      sourceEnd: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex + 1, resolvedOffset: candidateIndex + 1, affinity: "backward" as const },
    }
  })
  return {
    sourceCellId: id, cellIdentity: { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 200, contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [], candidates,
    prefixHeightsPt, contentHeightPt: total, outerHeightPt: total,
    completeWhenEmpty: heights.length === 0, fingerprint: JSON.stringify([id, heights]),
  }
}

function prepared(rows: number[][]): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const preparedRows = rows.map((heights, rowIndex) => ({
    kind: "prepared-materialized-row" as const,
    rowIndex,
    rowInstanceId: `rowi_${rowIndex}`,
    rowSourceId: "items-source",
    rowTemplateId: "item-template",
    itemKey: `item-${rowIndex}`,
    breakPolicy: "allow" as const,
    minimumFirstFragmentHeightPt: 0,
    cells: [cell(`cell-${rowIndex}`, heights)],
    maximumCellOuterHeightPt: heights.reduce((sum, height) => sum + height, 0),
    fingerprint: `row-${rowIndex}`,
  }))
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "instance-1", instanceRevision: 1, tableId: "table-1",
    tableDefinitionId: "definition-1", geometryFingerprint: "geometry-1",
    rows: preparedRows, fingerprint: JSON.stringify(preparedRows.map((row) => row.fingerprint)),
    work: { rowCount: rows.length, authoredRowCount: 0, materializedRowCount: rows.length, cellCount: rows.length, candidateCount: rows.flat().length },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

describe("Table multi-row pagination v1", () => {
  it("packs completed rows and continues a split row on the next page", () => {
    const input = prepared([[30], [40], [60, 60]])
    const before = JSON.stringify(input)
    const result = paginateVNextTableRowsV1({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
    })
    expect(result).toMatchObject({
      status: "paginated",
      pages: [
        { pageIndex: 0, usedHeightPt: 70, rows: [{ rowIndex: 0 }, { rowIndex: 1 }] },
        { pageIndex: 1, usedHeightPt: 60, rows: [{ rowIndex: 2, complete: false }] },
        { pageIndex: 2, usedHeightPt: 60, rows: [{ rowIndex: 2, complete: true }] },
      ],
      summary: { pageCount: 3, rowFragmentCount: 4, completedRowCount: 3, splitRowCount: 1, maximumUsedPageHeightPt: 70 },
      work: { pageAttemptCount: 3, rowPlanCount: 5, consumedCandidateCount: 4, freshPageAdvanceCount: 1 },
      contracts: { measurementExecution: false, preparedInputMutation: false, repeatedHeaders: "not-run" },
      cursorAfter: { rowIndex: 3, activeRow: null, complete: true },
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("advances once from a partial first-page remainder for prefer-keep", () => {
    const input = prepared([[30, 30]])
    input.rows[0].breakPolicy = "prefer-keep"
    expect(paginateVNextTableRowsV1({
      prepared: input, firstPageAvailableHeightPt: 50, pageBodyHeightPt: 100,
      maximumPageCount: 5, maximumRowPlanCount: 5,
    })).toMatchObject({
      status: "paginated",
      pages: [
        { availableHeightPt: 50, usedHeightPt: 0, rows: [] },
        { availableHeightPt: 100, usedHeightPt: 60, rows: [{ complete: true }] },
      ],
      work: { freshPageAdvanceCount: 1 },
    })
  })

  it("bounds page and row-plan attempts and validates cursors", () => {
    expect(paginateVNextTableRowsV1({
      prepared: prepared([[60, 60, 60]]), pageBodyHeightPt: 100,
      maximumPageCount: 2, maximumRowPlanCount: 10,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "table-page-limit-exceeded" })] })
    expect(paginateVNextTableRowsV1({
      prepared: prepared([[20], [20]]), pageBodyHeightPt: 100,
      maximumPageCount: 10, maximumRowPlanCount: 1,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "table-row-plan-limit-exceeded" })] })
    expect(paginateVNextTableRowsV1({
      prepared: prepared([[20]]), pageBodyHeightPt: 100,
      maximumPageCount: 10, maximumRowPlanCount: 10,
      cursor: { contractVersion: 1, kind: "table-pagination-cursor", tableId: "other", rowIndex: 0, activeRow: null, complete: false },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "table-pagination-cursor-identity-mismatch" })] })
  })
})
