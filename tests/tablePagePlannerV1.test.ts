import { describe, expect, it } from "vitest"
import {
  createInitialVNextTablePaginationCursorV1,
  paginateVNextTableRowsV1,
  planVNextTablePageV1,
  type VNextTablePageV1,
  type VNextTablePaginationCursorV1,
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
      candidateId: `${id}:line-${candidateIndex}`,
      nodeId: `${id}-text`,
      candidateIndex,
      kind: "text-line" as const,
      atomic: false as const,
      text: `${id}-${candidateIndex}`,
      widthPt: 20,
      heightPt,
      breakAfter: true as const,
      sourceStart: {
        textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex,
        resolvedOffset: candidateIndex, affinity: "forward" as const,
      },
      sourceEnd: {
        textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: candidateIndex + 1,
        resolvedOffset: candidateIndex + 1, affinity: "backward" as const,
      },
    }
  })
  return {
    sourceCellId: id,
    cellIdentity: authored
      ? { kind: "authored-cell", sourceCellId: id }
      : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0,
    colSpan: 1,
    xOffsetPt: 0,
    outerWidthPt: 200,
    contentWidthPt: 200,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 },
    children: [],
    candidates,
    verticalAlign: "top",
    prefixHeightsPt,
    contentHeightPt: total,
    outerHeightPt: total,
    completeWhenEmpty: heights.length === 0,
    fingerprint: JSON.stringify([id, heights]),
  }
}

function prepared(input: {
  bodyRows: number[][]
  headerHeightPt?: number
}): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const rows: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>["rows"] = []
  if (input.headerHeightPt != null) {
    const headerCell = cell("header-cell", [input.headerHeightPt], true)
    rows.push({
      kind: "prepared-authored-row",
      rowIndex: 0,
      sourceRowId: "header-row",
      rowSourceId: "header-source",
      rowTemplateId: "header-template",
      role: "header",
      breakPolicy: "strict-keep",
      minimumFirstFragmentHeightPt: 0,
      cells: [headerCell],
      maximumCellOuterHeightPt: input.headerHeightPt,
      fingerprint: "header-fingerprint",
    })
  }
  const bodyOffset = rows.length
  input.bodyRows.forEach((heights, bodyIndex) => {
    const rowIndex = bodyOffset + bodyIndex
    const bodyCell = cell(`body-cell-${bodyIndex}`, heights)
    rows.push({
      kind: "prepared-materialized-row",
      rowIndex,
      rowInstanceId: `rowi_${String(bodyIndex).padStart(12, "0")}`,
      rowSourceId: "items-source",
      rowTemplateId: "body-template",
      itemKey: `item-${bodyIndex}`,
      role: "body",
      breakPolicy: "allow",
      minimumFirstFragmentHeightPt: 0,
      cells: [bodyCell],
      maximumCellOuterHeightPt: heights.reduce((total, height) => total + height, 0),
      fingerprint: `body-${bodyIndex}`,
    })
  })
  return {
    source: "vnext-table-prepared-cell",
    contractVersion: 1,
    status: "ready",
    documentId: "planner-instance",
    instanceRevision: 1,
    tableId: "planner-table",
    tableDefinitionId: "planner-definition",
    geometryFingerprint: "planner-geometry",
    rows,
    fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: {
      rowCount: rows.length,
      authoredRowCount: input.headerHeightPt == null ? 0 : 1,
      materializedRowCount: input.bodyRows.length,
      cellCount: rows.length,
      candidateCount: rows.reduce((total, row) => total + row.cells[0].candidates.length, 0),
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

function planAll(input: {
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  maximumRowPlanCount: number
  headerPolicy?: "no-repeat" | "repeat-leading-headers"
}) {
  const cursorBefore = createInitialVNextTablePaginationCursorV1(input.prepared)
  let cursor: VNextTablePaginationCursorV1 = JSON.parse(JSON.stringify(cursorBefore))
  const pages: VNextTablePageV1[] = []
  const splitRows = new Set<number>()
  let completedRowCount = 0
  let rowPlanCount = 0
  let cellPlanCount = 0
  let checkpointLookupCount = 0
  let consumedCandidateCount = 0
  let freshPageAdvanceCount = 0
  let repeatedHeaderRowPlanCount = 0
  let repeatedHeaderFragmentCount = 0
  while (!cursor.complete) {
    const page = planVNextTablePageV1({
      prepared: input.prepared,
      cursor,
      pageBodyHeightPt: input.pageBodyHeightPt,
      availableHeightPt: pages.length === 0
        ? input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
        : input.pageBodyHeightPt,
      pageIndex: pages.length,
      headerPolicy: input.headerPolicy ?? "no-repeat",
      maximumRowPlanCount: input.maximumRowPlanCount,
      rowPlanCountBefore: rowPlanCount,
    })
    if (page.status === "blocked") throw new Error(page.issues.map((item) => item.message).join("\n"))
    pages.push(page.page)
    cursor = page.cursorAfter
    completedRowCount += page.completedRowCount
    rowPlanCount += page.work.rowPlanCount
    cellPlanCount += page.work.cellPlanCount
    checkpointLookupCount += page.work.checkpointLookupCount
    consumedCandidateCount += page.work.consumedCandidateCount
    freshPageAdvanceCount += page.freshPageAdvanceCount
    repeatedHeaderRowPlanCount += page.work.repeatedHeaderRowPlanCount
    repeatedHeaderFragmentCount += page.repeatedHeaderFragmentCount
    if (page.splitRowIndex != null) splitRows.add(page.splitRowIndex)
  }
  return {
    pages,
    cursorAfter: cursor,
    summary: {
      pageCount: pages.length,
      rowFragmentCount: pages.reduce((total, page) => total + page.rows.length, 0),
      completedRowCount,
      splitRowCount: splitRows.size,
      repeatedHeaderFragmentCount,
      maximumUsedPageHeightPt: Math.max(0, ...pages.map((page) => page.usedHeightPt)),
    },
    work: {
      pageAttemptCount: pages.length,
      rowPlanCount,
      cellPlanCount,
      checkpointLookupCount,
      consumedCandidateCount,
      freshPageAdvanceCount,
      repeatedHeaderRowPlanCount,
    },
  }
}

function expectPlannerParity(input: Parameters<typeof planAll>[0]) {
  const complete = paginateVNextTableRowsV1({
    ...input,
    maximumPageCount: 500,
  })
  expect(complete.status).toBe("paginated")
  if (complete.status !== "paginated") throw new Error(complete.issues.map((item) => item.message).join("\n"))
  const direct = planAll(input)
  expect(direct.pages).toEqual(complete.pages)
  expect(direct.cursorAfter).toEqual(complete.cursorAfter)
  expect(direct.summary).toEqual(complete.summary)
  expect(direct.work).toEqual(complete.work)
}

describe("Table shared one-page planner v1", () => {
  it("matches complete pagination for packed rows, a fresh advance, and a split row", () => {
    expectPlannerParity({
      prepared: prepared({ bodyRows: [[30], [40], [60, 60]] }),
      pageBodyHeightPt: 100,
      maximumRowPlanCount: 20,
    })
  })

  it("matches a short first-page prefer-keep fresh advance", () => {
    const input = prepared({ bodyRows: [[30, 30]] })
    input.rows[0].breakPolicy = "prefer-keep"
    expectPlannerParity({
      prepared: input,
      pageBodyHeightPt: 100,
      firstPageAvailableHeightPt: 50,
      maximumRowPlanCount: 5,
    })
  })

  it("matches 1,000 body rows and repeated headers across 250 pages", () => {
    expectPlannerParity({
      prepared: prepared({ bodyRows: Array.from({ length: 1_000 }, () => [20]), headerHeightPt: 20 }),
      pageBodyHeightPt: 100,
      maximumRowPlanCount: 2_000,
      headerPolicy: "repeat-leading-headers",
    })
  })

  it("retains the cumulative row-plan limit across page calls", () => {
    const input = prepared({ bodyRows: [[20], [20]] })
    const first = planVNextTablePageV1({
      prepared: input,
      cursor: createInitialVNextTablePaginationCursorV1(input),
      pageBodyHeightPt: 20,
      availableHeightPt: 20,
      pageIndex: 0,
      headerPolicy: "no-repeat",
      maximumRowPlanCount: 1,
      rowPlanCountBefore: 0,
    })
    expect(first.status).toBe("planned")
    if (first.status !== "planned") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(planVNextTablePageV1({
      prepared: input,
      cursor: first.cursorAfter,
      pageBodyHeightPt: 20,
      availableHeightPt: 20,
      pageIndex: 1,
      headerPolicy: "no-repeat",
      maximumRowPlanCount: 1,
      rowPlanCountBefore: first.work.rowPlanCount,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "table-row-plan-limit-exceeded" })],
    })
  })
})
