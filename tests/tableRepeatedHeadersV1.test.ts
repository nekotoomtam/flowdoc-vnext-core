import { describe, expect, it } from "vitest"
import { paginateVNextTableRowsV1, type VNextTablePreparedCellV1, type VNextTablePreparedRowsResultV1 } from "../src/index.js"

function cell(id: string, heightPt: number, authored: boolean): VNextTablePreparedCellV1 {
  return {
    sourceCellId: id,
    cellIdentity: authored ? { kind: "authored-cell", sourceCellId: id } : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 200, contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [],
    candidates: [{
      candidateId: `${id}:line-0`, nodeId: `${id}-text`, candidateIndex: 0,
      kind: "text-line", atomic: false, heightPt, breakAfter: true,
      sourceStart: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 0, resolvedOffset: 0, affinity: "forward" },
      sourceEnd: { textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 1, resolvedOffset: 1, affinity: "backward" },
    }],
    prefixHeightsPt: [0, heightPt], contentHeightPt: heightPt, outerHeightPt: heightPt,
    completeWhenEmpty: false, fingerprint: JSON.stringify([id, heightPt]),
  }
}

function prepared(headerHeight: number, bodyHeights: number[]): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const headerCell = cell("header-cell", headerHeight, true)
  const header = {
    kind: "prepared-authored-row" as const,
    rowIndex: 0, sourceRowId: "header-row", rowSourceId: "header-source", rowTemplateId: "header-template",
    role: "header" as const, breakPolicy: "strict-keep" as const, minimumFirstFragmentHeightPt: 0,
    cells: [headerCell], maximumCellOuterHeightPt: headerHeight, fingerprint: "header-fingerprint",
  }
  const bodies = bodyHeights.map((height, index) => {
    const bodyCell = cell(`body-cell-${index}`, height, false)
    return {
      kind: "prepared-materialized-row" as const,
      rowIndex: index + 1, rowInstanceId: `rowi_${index}`, rowSourceId: "items-source", rowTemplateId: "body-template",
      itemKey: `item-${index}`, breakPolicy: "allow" as const, minimumFirstFragmentHeightPt: 0,
      cells: [bodyCell], maximumCellOuterHeightPt: height, fingerprint: `body-${index}`,
    }
  })
  const rows = [header, ...bodies]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "instance-1", instanceRevision: 1, tableId: "table-1", tableDefinitionId: "definition-1",
    geometryFingerprint: "geometry-1", rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: { rowCount: rows.length, authoredRowCount: 1, materializedRowCount: bodies.length, cellCount: rows.length, candidateCount: rows.length },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

describe("Table repeated leading headers v1", () => {
  it("repeats authored header references only on continuation pages with body content", () => {
    const input = prepared(20, [50, 50])
    const before = JSON.stringify(input)
    const result = paginateVNextTableRowsV1({
      prepared: input,
      headerPolicy: "repeat-leading-headers",
      pageBodyHeightPt: 100,
      maximumPageCount: 5,
      maximumRowPlanCount: 20,
    })
    expect(result).toMatchObject({
      status: "paginated",
      pages: [
        { usedHeightPt: 70, rows: [
          { rowIndex: 0, repeatedHeader: false, rowKey: "header-row" },
          { rowIndex: 1, repeatedHeader: false },
        ] },
        { usedHeightPt: 70, rows: [
          { rowIndex: 0, repeatedHeader: true, rowKey: "header-row" },
          { rowIndex: 2, repeatedHeader: false },
        ] },
      ],
      summary: { pageCount: 2, repeatedHeaderFragmentCount: 1, completedRowCount: 3 },
      work: { repeatedHeaderRowPlanCount: 1 },
      contracts: { repeatedHeaders: "applied" },
    })
    expect(JSON.stringify(input)).toBe(before)
  })

  it("blocks missing headers and header-only continuation progress", () => {
    const noHeader = prepared(20, [50])
    noHeader.rows = noHeader.rows.slice(1).map((row, index) => ({ ...row, rowIndex: index }))
    expect(paginateVNextTableRowsV1({
      prepared: noHeader, headerPolicy: "repeat-leading-headers", pageBodyHeightPt: 100,
      maximumPageCount: 5, maximumRowPlanCount: 20,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "repeated-header-source-missing" })] })

    expect(paginateVNextTableRowsV1({
      prepared: prepared(80, [30]), headerPolicy: "repeat-leading-headers", pageBodyHeightPt: 100,
      maximumPageCount: 5, maximumRowPlanCount: 20,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "repeated-header-prevents-body-progress" })],
    })
  })
})
