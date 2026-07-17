import { describe, expect, it } from "vitest"
import {
  createInitialVNextTableFlowV4PaginationCursor,
  hasValidVNextTableFlowV4CursorFingerprint,
  hasValidVNextTableFlowV4PageCheckpointFingerprint,
  hasValidVNextTableFlowV4WindowPaginationFingerprint,
  paginateVNextTableFlowV4,
  paginateVNextTableRowsV1,
  type VNextTableFlowV4PaginationCursor,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
} from "../src/index.js"

function cell(id: string, heights: number[], authored = false): VNextTablePreparedCellV1 {
  let total = 0
  const prefixHeightsPt = [0]
  const candidates = heights.map((heightPt, candidateIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      candidateId: `${id}:${candidateIndex}`, nodeId: `${id}-text`, candidateIndex,
      kind: "text-line" as const, atomic: false as const, text: id, widthPt: 20, heightPt, breakAfter: true as const,
      sourceStart: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex, resolvedOffset: candidateIndex, affinity: "forward" as const },
      sourceEnd: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex + 1, resolvedOffset: candidateIndex + 1, affinity: "backward" as const },
    }
  })
  return {
    sourceCellId: id,
    cellIdentity: authored ? { kind: "authored-cell", sourceCellId: id } : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 200, contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [], candidates, verticalAlign: "top",
    prefixHeightsPt, contentHeightPt: total, outerHeightPt: total, completeWhenEmpty: heights.length === 0,
    fingerprint: JSON.stringify([id, heights]),
  }
}

function prepared(bodyRows: number[][], headerHeightPt?: number): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const rows: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>["rows"] = []
  if (headerHeightPt != null) {
    const headerCell = cell("header-cell", [headerHeightPt], true)
    rows.push({
      kind: "prepared-authored-row", rowIndex: 0, sourceRowId: "header-row", rowSourceId: "header-source",
      rowTemplateId: "header-template", role: "header", breakPolicy: "strict-keep", minimumFirstFragmentHeightPt: 0,
      cells: [headerCell], maximumCellOuterHeightPt: headerHeightPt, fingerprint: "header-fingerprint",
    })
  }
  const offset = rows.length
  bodyRows.forEach((heights, index) => {
    const bodyCell = cell(`body-${index}`, heights)
    rows.push({
      kind: "prepared-materialized-row", rowIndex: offset + index, rowInstanceId: `rowi_${index}`,
      rowSourceId: "items", rowTemplateId: "body-template", itemKey: `item-${index}`, role: "body",
      breakPolicy: "allow", minimumFirstFragmentHeightPt: 0, cells: [bodyCell],
      maximumCellOuterHeightPt: heights.reduce((sum, height) => sum + height, 0), fingerprint: `row-${index}`,
    })
  })
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready", documentId: "instance-1",
    instanceRevision: 1, tableId: "table-1", tableDefinitionId: "definition-1", geometryFingerprint: "geometry-1",
    rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: { rowCount: rows.length, authoredRowCount: headerHeightPt == null ? 0 : 1, materializedRowCount: bodyRows.length, cellCount: rows.length, candidateCount: rows.reduce((sum, row) => sum + row.cells[0].candidates.length, 0) },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

describe("Table-flow v4 bounded window pagination", () => {
  it("creates the same initial cursor owned by the paginator source and profile", () => {
    const input = prepared([[50], [60, 60]], 20)
    const cursor = createInitialVNextTableFlowV4PaginationCursor({
      prepared: input,
      pageBodyHeightPt: 100,
      headerPolicy: "repeat-leading-headers",
      maximumRowPlanCount: 20,
    })
    const pagination = paginateVNextTableFlowV4({
      prepared: input,
      pageBodyHeightPt: 100,
      headerPolicy: "repeat-leading-headers",
      maximumPageCount: 1,
      maximumRowPlanCount: 20,
    })

    expect(cursor).toEqual(pagination.cursorBefore)
    expect(cursor).toMatchObject({
      nextPageIndex: 0,
      nextFragmentIndex: 0,
      terminalFragmentCommitted: false,
      complete: false,
      cumulativeWork: { pageAttemptCount: 0, rowPlanCount: 0 },
    })
    expect(hasValidVNextTableFlowV4CursorFingerprint(cursor)).toBe(true)
  })

  it("resumes one-page checkpoints to exact complete pages and final Table cursor", () => {
    const input = prepared([[50], [60, 60]], 20)
    const baseline = paginateVNextTableRowsV1({
      prepared: input, pageBodyHeightPt: 100, headerPolicy: "repeat-leading-headers",
      maximumPageCount: 10, maximumRowPlanCount: 20,
    })
    if (baseline.status !== "paginated") throw new Error("baseline blocked")
    const pages = []
    let cursor: VNextTableFlowV4PaginationCursor | undefined
    const totalWork = { rowPlanCount: 0, pageAttemptCount: 0 }
    do {
      const window = paginateVNextTableFlowV4({
        prepared: input, pageBodyHeightPt: 100, headerPolicy: "repeat-leading-headers",
        maximumPageCount: 1, maximumRowPlanCount: 20, ...(cursor == null ? {} : { cursor }),
      })
      if (window.status === "blocked" || window.status === "fresh-page-required") throw new Error("window blocked")
      expect(hasValidVNextTableFlowV4WindowPaginationFingerprint(window)).toBe(true)
      expect(hasValidVNextTableFlowV4CursorFingerprint(window.cursorAfter)).toBe(true)
      expect(window.pages.every(hasValidVNextTableFlowV4PageCheckpointFingerprint)).toBe(true)
      pages.push(...window.pages.map((checkpoint) => checkpoint.page))
      totalWork.rowPlanCount += window.work.rowPlanCount
      totalWork.pageAttemptCount += window.work.pageAttemptCount
      cursor = window.cursorAfter
    } while (!cursor.complete)

    expect(pages).toEqual(baseline.pages)
    expect(cursor.state).toEqual(baseline.cursorAfter)
    expect(cursor.nextFragmentIndex).toBe(baseline.pages.length)
    expect(cursor.cumulativeWork.rowPlanCount).toBe(totalWork.rowPlanCount)
    expect(cursor.cumulativeWork.pageAttemptCount).toBe(totalWork.pageAttemptCount)
    expect(cursor.cumulativeWork).toEqual(baseline.work)
  })

  it("returns fresh-page demand without cursor or checkpoint progress", () => {
    const input = prepared([[30, 30]])
    input.rows[0].breakPolicy = "prefer-keep"
    const fresh = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, firstPageAvailableHeightPt: 50,
      maximumPageCount: 1, maximumRowPlanCount: 5,
    })
    expect(fresh).toMatchObject({
      status: "fresh-page-required", pages: [], work: { pageAttemptCount: 1, rowPlanCount: 1, freshPageAdvanceCount: 1 },
    })
    if (fresh.status !== "fresh-page-required") throw new Error("fresh fixture failed")
    expect(fresh.cursorAfter).toEqual(fresh.cursorBefore)
    const retry = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 5, cursor: fresh.cursorBefore,
    })
    expect(retry).toMatchObject({ status: "complete", pages: [{ page: { usedHeightPt: 60 } }] })
  })

  it("retains cumulative row-plan bounds across successful windows", () => {
    const input = prepared([[20], [20]])
    const first = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 20, maximumPageCount: 1, maximumRowPlanCount: 1,
    })
    expect(first).toMatchObject({ status: "partial", cursorAfter: { cumulativeWork: { rowPlanCount: 1 } } })
    if (first.status !== "partial") throw new Error("first budget window failed")
    expect(paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 20, maximumPageCount: 1, maximumRowPlanCount: 1, cursor: first.cursorAfter,
    })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "table-row-plan-limit-exceeded" })],
    })
  })

  it("blocks stale source/profile cursors, cursor tampering, result tampering, and empty input", () => {
    const input = prepared([[20], [20]])
    const first = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 20, maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    if (first.status !== "partial") throw new Error("tamper fixture failed")
    const cursorTamper = structuredClone(first.cursorAfter)
    cursorTamper.cumulativeWork.rowPlanCount = 0
    const cursorTamperResult = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 20, maximumPageCount: 1, maximumRowPlanCount: 10, cursor: cursorTamper,
    })
    expect(cursorTamperResult.status).toBe("blocked")
    expect(cursorTamperResult.issues.some((item) => item.code === "table-flow-cursor-fingerprint-mismatch")).toBe(true)

    expect(paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 30, maximumPageCount: 1, maximumRowPlanCount: 10, cursor: first.cursorAfter,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "table-flow-cursor-owner-mismatch" })] })

    const resultTamper = structuredClone(first)
    resultTamper.pages[0].page.usedHeightPt += 1
    expect(hasValidVNextTableFlowV4WindowPaginationFingerprint(resultTamper)).toBe(false)

    expect(paginateVNextTableFlowV4({
      prepared: prepared([]), pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 10,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "table-flow-empty-source-unsupported" })] })
  })
})
