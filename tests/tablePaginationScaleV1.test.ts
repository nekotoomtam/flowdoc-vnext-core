import { describe, expect, it } from "vitest"
import { paginateVNextTableRowsV1, type VNextTablePreparedCellV1, type VNextTablePreparedRowsResultV1 } from "../src/index.js"

const BODY_ROW_COUNT = 1_000

function cell(id: string, authored: boolean): VNextTablePreparedCellV1 {
  return {
    sourceCellId: id,
    cellIdentity: authored ? { kind: "authored-cell", sourceCellId: id } : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 400, contentWidthPt: 400,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [],
    verticalAlign: "top",
    candidates: [{
      candidateId: `${id}:line-0`, nodeId: `${id}-text`, candidateIndex: 0,
      kind: "text-line", atomic: false, text: id, widthPt: 20, heightPt: 20, breakAfter: true,
      sourceStart: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 0, resolvedOffset: 0, affinity: "forward" },
      sourceEnd: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 1, resolvedOffset: 1, affinity: "backward" },
    }],
    prefixHeightsPt: [0, 20], contentHeightPt: 20, outerHeightPt: 20,
    completeWhenEmpty: false, fingerprint: JSON.stringify([id, 20]),
  }
}

function prepared(): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const headerCell = cell("header-cell", true)
  const header = {
    kind: "prepared-authored-row" as const,
    rowIndex: 0, sourceRowId: "header-row", rowSourceId: "header-source", rowTemplateId: "header-template",
    role: "header" as const, breakPolicy: "strict-keep" as const, minimumFirstFragmentHeightPt: 0,
    cells: [headerCell], maximumCellOuterHeightPt: 20, fingerprint: "header-fingerprint",
  }
  const bodyRows = Array.from({ length: BODY_ROW_COUNT }, (_, index) => {
    const bodyCell = cell(`body-cell-${index}`, false)
    return {
      kind: "prepared-materialized-row" as const,
      rowIndex: index + 1,
      rowInstanceId: `rowi_${String(index + 1).padStart(12, "0")}`,
      rowSourceId: "items-source", rowTemplateId: "body-template", itemKey: `item-${index + 1}`,
      role: "body" as const,
      breakPolicy: "allow" as const, minimumFirstFragmentHeightPt: 0,
      cells: [bodyCell], maximumCellOuterHeightPt: 20, fingerprint: `body-${index + 1}`,
    }
  })
  const rows = [header, ...bodyRows]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "scale-instance", instanceRevision: 1, tableId: "scale-table",
    tableDefinitionId: "scale-definition", geometryFingerprint: "scale-geometry",
    rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: {
      rowCount: rows.length, authoredRowCount: 1, materializedRowCount: BODY_ROW_COUNT,
      cellCount: rows.length, candidateCount: rows.length,
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

describe("Table synchronized pagination scale v1", () => {
  it("paginates 1,000 body rows with repeated headers into 250 deterministic pages", () => {
    const input = prepared()
    const before = JSON.stringify(input)
    const options = {
      prepared: input,
      headerPolicy: "repeat-leading-headers" as const,
      pageBodyHeightPt: 100,
      maximumPageCount: 300,
      maximumRowPlanCount: 2_000,
    }
    const first = paginateVNextTableRowsV1(options)
    const second = paginateVNextTableRowsV1(options)

    expect(first.status).toBe("paginated")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "paginated") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.pages).toHaveLength(250)
    expect(first.pages.every((page) => page.usedHeightPt === 100 && page.rows.length === 5)).toBe(true)
    expect(first.pages[0].rows[0]).toMatchObject({ rowIndex: 0, repeatedHeader: false, rowKey: "header-row" })
    expect(first.pages[249].rows[0]).toMatchObject({ rowIndex: 0, repeatedHeader: true, rowKey: "header-row" })
    expect(first.pages[249].rows[4]).toMatchObject({ rowIndex: 1_000, complete: true })
    expect(first.summary).toEqual({
      pageCount: 250,
      rowFragmentCount: 1_250,
      completedRowCount: 1_001,
      splitRowCount: 0,
      repeatedHeaderFragmentCount: 249,
      maximumUsedPageHeightPt: 100,
    })
    expect(first.work).toEqual({
      pageAttemptCount: 250,
      rowPlanCount: 1_250,
      cellPlanCount: 1_250,
      checkpointLookupCount: 1_250,
      consumedCandidateCount: 1_250,
      freshPageAdvanceCount: 0,
      repeatedHeaderRowPlanCount: 249,
    })
    expect(first.cursorAfter).toMatchObject({ rowIndex: 1_001, activeRow: null, complete: true })
    expect(first.contracts).toEqual({
      measurementExecution: false,
      preparedInputMutation: false,
      rowCursorCommit: "atomic",
      repeatedHeaders: "applied",
    })
    expect(JSON.stringify(input)).toBe(before)
  })
})
