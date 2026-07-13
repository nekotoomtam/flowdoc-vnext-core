import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import {
  createVNextTableCompositionWindowV1,
  paginateVNextTableFlowV4,
  type VNextTableCompositionWindowContextV1,
  type VNextTableFlowV4PageCheckpoint,
  type VNextTableFlowV4PaginationCursor,
  type VNextTableFlowV4WindowPaginationResult,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
} from "../src/index.js"

const compact = (value: unknown) => createVNextCompactFingerprint(JSON.stringify(value))

function rehashCursor(cursor: VNextTableFlowV4PaginationCursor): void {
  const { fingerprint: _fingerprint, ...facts } = cursor
  cursor.fingerprint = compact(facts)
}

function rehashCheckpoint(checkpoint: VNextTableFlowV4PageCheckpoint): void {
  const { fingerprint: _fingerprint, ...facts } = checkpoint
  checkpoint.fingerprint = compact(facts)
}

function rehashResult(result: VNextTableFlowV4WindowPaginationResult): void {
  const { fingerprint: _fingerprint, ...facts } = result
  result.fingerprint = compact(facts)
}

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
    prefixHeightsPt, contentHeightPt: total, outerHeightPt: total, completeWhenEmpty: false,
    fingerprint: JSON.stringify([id, heights]),
  }
}

function prepared(rows: number[][]): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const preparedRows = rows.map((heights, rowIndex) => {
    const preparedCell = cell(`cell-${rowIndex}`, heights)
    return {
      kind: "prepared-materialized-row" as const, rowIndex, rowInstanceId: `rowi_${rowIndex}`,
      rowSourceId: "items", rowTemplateId: "body", itemKey: `item-${rowIndex}`, role: "body" as const,
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
  const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`
  return {
    documentId: "document-1", sectionId: "section-1", zoneId: "zone-1", sourceOrder: 0,
    documentStructureFingerprint: pin("a"), resolvedProjectionFingerprint: pin("b"), familySourceFingerprint: pin("c"),
  }
}

function accepted(rows = [[20], [20]]) {
  const result = paginateVNextTableFlowV4({
    prepared: prepared(rows), pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 20,
  })
  if (result.status === "blocked" || result.status === "fresh-page-required") throw new Error("accepted fixture blocked")
  return result
}

describe("Table v4 bounded Composition hardening", () => {
  it("blocks a re-fingerprinted active cell cursor outside prepared bounds", () => {
    const input = prepared([[60, 60]])
    const first = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 20,
    })
    if (first.status !== "partial" || first.cursorAfter.state.activeRow == null) throw new Error("split fixture failed")
    const cursor = structuredClone(first.cursorAfter)
    if (cursor.state.activeRow == null) throw new Error("cloned split cursor lost active row")
    cursor.state.activeRow.cells[0].candidateIndex = 99
    rehashCursor(cursor)
    const result = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 20, cursor,
    })
    expect(result.status).toBe("blocked")
    expect(result.issues.some((item) => item.code === "table-flow-active-cell-state-invalid")).toBe(true)
  })

  it("blocks a re-fingerprinted terminal cursor replay", () => {
    const input = prepared([[20]])
    const complete = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 20,
    })
    if (complete.status !== "complete") throw new Error("terminal fixture failed")
    const cursor = structuredClone(complete.cursorAfter)
    cursor.terminalFragmentCommitted = false
    cursor.complete = false
    rehashCursor(cursor)
    const result = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, maximumPageCount: 1, maximumRowPlanCount: 20, cursor,
    })
    expect(result.status).toBe("blocked")
    expect(result.issues.some((item) => item.code === "table-flow-cursor-completion-mismatch")).toBe(true)
  })

  it("blocks re-fingerprinted row stacking, repeated-header order, and row-work drift", () => {
    const stacking = structuredClone(accepted())
    stacking.pages[0].page.rows[1].yOffsetPt = 10
    rehashCheckpoint(stacking.pages[0])
    rehashResult(stacking)
    expect(createVNextTableCompositionWindowV1({ pagination: stacking, context: context() })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "table-composition-row-stack-drift" })],
    })

    const headerOrder = structuredClone(accepted())
    Object.assign(headerOrder.pages[0].page.rows[1], {
      repeatedHeader: true, rowKind: "authored", rowRole: "header", rowFragmentIndex: 0, complete: true,
    })
    rehashCheckpoint(headerOrder.pages[0])
    rehashResult(headerOrder)
    const headerResult = createVNextTableCompositionWindowV1({ pagination: headerOrder, context: context() })
    expect(headerResult.status).toBe("blocked")
    expect(headerResult.issues.some((item) => item.code === "table-composition-repeated-header-invalid")).toBe(true)

    const work = structuredClone(accepted())
    work.pages[0].work.completedRowCount += 1
    rehashCheckpoint(work.pages[0])
    rehashResult(work)
    const workResult = createVNextTableCompositionWindowV1({ pagination: work, context: context() })
    expect(workResult.status).toBe("blocked")
    expect(workResult.issues.some((item) => item.code === "table-composition-row-work-drift")).toBe(true)
  })

  it("blocks re-fingerprinted fresh cursor progress", () => {
    const input = prepared([[30, 30]])
    input.rows[0].breakPolicy = "prefer-keep"
    const fresh = paginateVNextTableFlowV4({
      prepared: input, pageBodyHeightPt: 100, firstPageAvailableHeightPt: 50,
      maximumPageCount: 1, maximumRowPlanCount: 20,
    })
    if (fresh.status !== "fresh-page-required") throw new Error("fresh fixture failed")
    const tampered = structuredClone(fresh)
    tampered.cursorAfter.nextPageIndex += 1
    rehashCursor(tampered.cursorAfter)
    rehashResult(tampered)
    expect(createVNextTableCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "fragment-window-fresh-page-cursor-drift" })],
    })
  })
})
