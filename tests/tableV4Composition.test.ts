import { describe, expect, it } from "vitest"
import {
  createVNextTableCompositionWindowV1,
  paginateVNextTableFlowV4,
  parseVNextCompositionFragmentWindowV1,
  type VNextTableCompositionWindowContextV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
} from "../src/index.js"

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function cell(id: string, heights: number[]): VNextTablePreparedCellV1 {
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
    sourceCellId: id, cellIdentity: { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 200, contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [], candidates, verticalAlign: "top",
    prefixHeightsPt, contentHeightPt: total, outerHeightPt: total, completeWhenEmpty: heights.length === 0,
    fingerprint: JSON.stringify([id, heights]),
  }
}

function prepared(rows: number[][]): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const preparedRows = rows.map((heights, rowIndex) => {
    const preparedCell = cell(`cell-${rowIndex}`, heights)
    return {
      kind: "prepared-materialized-row" as const, rowIndex, rowInstanceId: `rowi_${rowIndex}`,
      rowSourceId: "items", rowTemplateId: "body-template", itemKey: `item-${rowIndex}`, role: "body" as const,
      breakPolicy: "allow" as const, minimumFirstFragmentHeightPt: 0, cells: [preparedCell],
      maximumCellOuterHeightPt: preparedCell.outerHeightPt, fingerprint: `row-${rowIndex}`,
    }
  })
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready", documentId: "instance-1",
    instanceRevision: 1, tableId: "table-1", tableDefinitionId: "definition-1", geometryFingerprint: "geometry-1",
    rows: preparedRows, fingerprint: JSON.stringify(preparedRows.map((row) => row.fingerprint)),
    work: { rowCount: rows.length, authoredRowCount: 0, materializedRowCount: rows.length, cellCount: rows.length, candidateCount: rows.flat().length },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

function context(): VNextTableCompositionWindowContextV1 {
  return {
    documentId: "document-1", sectionId: "section-main", zoneId: "body-1", sourceOrder: 3,
    documentStructureFingerprint: pin("a"), resolvedProjectionFingerprint: pin("b"), familySourceFingerprint: pin("c"),
  }
}

describe("Table v4 common Composition adapter", () => {
  it("projects one positive Table placement per retained family page", () => {
    const pagination = paginateVNextTableFlowV4({
      prepared: prepared([[60], [60]]), pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    expect(pagination.status).toBe("partial")
    const result = createVNextTableCompositionWindowV1({ pagination, context: context() })
    expect(result).toMatchObject({
      status: "ready",
      window: {
        status: "partial", family: "table-flow", rootNodeType: "table",
        pages: [{ fragments: [{ fragmentIndex: 0, sourceNodeId: "table-1", blockExtentPt: 60, continuation: { fromPrevious: false, toNext: true } }] }],
        work: { pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 },
      },
    })
    if (result.status === "blocked") throw new Error("Table adapter blocked")
    expect(parseVNextCompositionFragmentWindowV1(result.window)).toEqual(result)
  })

  it("normalizes fresh demand with an exact unchanged common cursor", () => {
    const input = prepared([[30, 30]])
    input.rows[0].breakPolicy = "prefer-keep"
    const pagination = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, firstPageAvailableHeightPt: 50,
      maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    const result = createVNextTableCompositionWindowV1({ pagination, context: context() })
    expect(result).toMatchObject({
      status: "ready", window: { status: "fresh-page-required", pages: [], work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 } },
    })
    if (result.status === "blocked") throw new Error("fresh adapter blocked")
    expect(result.window.cursorAfter).toEqual(result.window.cursorBefore)
  })

  it("retains family blockers as a valid common blocked window", () => {
    const pagination = paginateVNextTableFlowV4({
      prepared: prepared([]), pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    const result = createVNextTableCompositionWindowV1({ pagination, context: context() })
    expect(result).toMatchObject({
      status: "ready", window: { status: "blocked", pages: null, cursorAfter: null, issues: [expect.objectContaining({ code: "table-flow-empty-source-unsupported" })] },
    })
  })

  it("blocks zero extent and tampered pagination evidence", () => {
    const zero = paginateVNextTableFlowV4({
      prepared: prepared([[]]), pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    expect(createVNextTableCompositionWindowV1({ pagination: zero, context: context() })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "table-composition-zero-extent-unsupported" })],
    })

    const pagination = paginateVNextTableFlowV4({
      prepared: prepared([[20], [20]]), pageBodyHeightPt: 20, maximumPageCount: 1, maximumRowPlanCount: 10,
    })
    if (pagination.status !== "partial") throw new Error("tamper fixture failed")
    const tampered = structuredClone(pagination)
    tampered.pages[0].page.usedHeightPt += 1
    expect(createVNextTableCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "table-composition-pagination-fingerprint-mismatch" })],
    })
  })
})
