import { describe, expect, it } from "vitest"
import {
  createVNextTableCompositionWindowV1,
  paginateVNextTableFlowV4,
  paginateVNextTableRowsV1,
  type VNextTableCompositionWindowContextV1,
  type VNextTableFlowV4CumulativeWork,
  type VNextTableFlowV4PaginationCursor,
  type VNextTablePageV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
} from "../src/index.js"

const BODY_ROW_COUNT = 1_000

function cell(id: string, authored: boolean): VNextTablePreparedCellV1 {
  return {
    sourceCellId: id,
    cellIdentity: authored ? { kind: "authored-cell", sourceCellId: id } : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 400, contentWidthPt: 400,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [], verticalAlign: "top",
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
    kind: "prepared-authored-row" as const, rowIndex: 0, sourceRowId: "header-row",
    rowSourceId: "header-source", rowTemplateId: "header-template", role: "header" as const,
    breakPolicy: "strict-keep" as const, minimumFirstFragmentHeightPt: 0,
    cells: [headerCell], maximumCellOuterHeightPt: 20, fingerprint: "header-fingerprint",
  }
  const bodyRows = Array.from({ length: BODY_ROW_COUNT }, (_, index) => {
    const bodyCell = cell(`body-cell-${index}`, false)
    return {
      kind: "prepared-materialized-row" as const, rowIndex: index + 1,
      rowInstanceId: `rowi_${String(index + 1).padStart(12, "0")}`,
      rowSourceId: "items-source", rowTemplateId: "body-template", itemKey: `item-${index + 1}`,
      role: "body" as const, breakPolicy: "allow" as const, minimumFirstFragmentHeightPt: 0,
      cells: [bodyCell], maximumCellOuterHeightPt: 20, fingerprint: `body-${index + 1}`,
    }
  })
  const rows = [header, ...bodyRows]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "scale-instance", instanceRevision: 1, tableId: "scale-table",
    tableDefinitionId: "scale-definition", geometryFingerprint: "scale-geometry",
    rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: { rowCount: rows.length, authoredRowCount: 1, materializedRowCount: BODY_ROW_COUNT, cellCount: rows.length, candidateCount: rows.length },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

function context(): VNextTableCompositionWindowContextV1 {
  const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`
  return {
    documentId: "scale-instance", sectionId: "section-main", zoneId: "body", sourceOrder: 4,
    documentStructureFingerprint: pin("a"), resolvedProjectionFingerprint: pin("b"), familySourceFingerprint: pin("c"),
  }
}

function emptyWork(): VNextTableFlowV4CumulativeWork {
  return { pageAttemptCount: 0, rowPlanCount: 0, cellPlanCount: 0, checkpointLookupCount: 0, consumedCandidateCount: 0, freshPageAdvanceCount: 0, repeatedHeaderRowPlanCount: 0 }
}

describe("Table v4 bounded common Composition scale", () => {
  it("retains 1,000 body rows through 250 exact one-page windows", () => {
    const input = prepared()
    const before = JSON.stringify(input)
    const baseline = paginateVNextTableRowsV1({
      prepared: input, headerPolicy: "repeat-leading-headers", pageBodyHeightPt: 100,
      maximumPageCount: 300, maximumRowPlanCount: 2_000,
    })
    if (baseline.status !== "paginated") throw new Error("scale baseline blocked")
    const pages: VNextTablePageV1[] = []
    const fingerprints = new Set<string>()
    const work = emptyWork()
    let maximumCursorBytes = 0
    let maximumCheckpointBytes = 0
    let maximumCommonWindowBytes = 0
    let cursor: VNextTableFlowV4PaginationCursor | undefined
    do {
      const pagination = paginateVNextTableFlowV4({
        prepared: input, headerPolicy: "repeat-leading-headers", pageBodyHeightPt: 100,
        maximumPageCount: 1, maximumRowPlanCount: 2_000, ...(cursor == null ? {} : { cursor }),
      })
      if (pagination.status === "blocked" || pagination.status === "fresh-page-required") throw new Error("scale window blocked")
      const adapted = createVNextTableCompositionWindowV1({ pagination, context: context() })
      if (adapted.status === "blocked") throw new Error(adapted.issues.map((item) => item.message).join("; "))
      pages.push(pagination.pages[0].page)
      fingerprints.add(adapted.window.fingerprint)
      for (const key of Object.keys(work) as Array<keyof VNextTableFlowV4CumulativeWork>) work[key] += pagination.work[key]
      cursor = pagination.cursorAfter
      maximumCursorBytes = Math.max(maximumCursorBytes, JSON.stringify(cursor).length)
      maximumCheckpointBytes = Math.max(maximumCheckpointBytes, JSON.stringify(pagination.pages[0]).length)
      maximumCommonWindowBytes = Math.max(maximumCommonWindowBytes, JSON.stringify(adapted.window).length)
    } while (!cursor.complete)

    expect(pages).toEqual(baseline.pages)
    expect(pages).toHaveLength(250)
    expect(work).toEqual(baseline.work)
    expect(cursor.state).toEqual(baseline.cursorAfter)
    expect(cursor.cumulativeWork).toEqual(baseline.work)
    expect(cursor.nextFragmentIndex).toBe(250)
    expect(fingerprints.size).toBe(250)
    expect(maximumCursorBytes).toBeLessThan(2_000)
    expect(maximumCheckpointBytes).toBeLessThan(15_000)
    expect(maximumCommonWindowBytes).toBeLessThan(5_000)
    expect(JSON.stringify(input)).toBe(before)
  }, 30_000)
})
