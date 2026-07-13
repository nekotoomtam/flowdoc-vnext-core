import type {
  VNextTablePreparedRowsResultV1,
} from "./tablePreparedCellContractV1.js"
import { planVNextTablePageV1 } from "./tablePagePlannerV1.js"
import {
  VNEXT_TABLE_PAGINATION_SOURCE,
  VNEXT_TABLE_PAGINATION_VERSION,
  VNextTablePaginationCursorV1Schema,
  type VNextTablePageV1,
  type VNextTablePaginationCursorV1,
  type VNextTablePaginationIssueV1,
  type VNextTablePaginationResultV1,
} from "./tablePaginationContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string, tableId: string, rowIndex?: number): VNextTablePaginationIssueV1 {
  return { code, path, message, severity: "error", tableId, ...(rowIndex == null ? {} : { rowIndex }) }
}

export function createInitialVNextTablePaginationCursorV1(
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>,
): VNextTablePaginationCursorV1 {
  return {
    contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
    kind: "table-pagination-cursor",
    tableId: prepared.tableId,
    rowIndex: 0,
    activeRow: null,
    complete: prepared.rows.length === 0,
  }
}

function blocked(
  tableId: string,
  cursorBefore: VNextTablePaginationCursorV1,
  issues: VNextTablePaginationIssueV1[],
): VNextTablePaginationResultV1 {
  return {
    source: VNEXT_TABLE_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
    status: "blocked",
    tableId,
    cursorBefore,
    cursorAfter: null,
    pages: null,
    issues,
  }
}

export function paginateVNextTableRowsV1(input: {
  prepared: VNextTablePreparedRowsResultV1
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  maximumPageCount: number
  maximumRowPlanCount: number
  headerPolicy?: "no-repeat" | "repeat-leading-headers"
  cursor?: VNextTablePaginationCursorV1
}): VNextTablePaginationResultV1 {
  const tableId = input.prepared.status === "ready" ? input.prepared.tableId : "unknown-table"
  const fallbackCursor: VNextTablePaginationCursorV1 = {
    contractVersion: 1, kind: "table-pagination-cursor", tableId, rowIndex: 0, activeRow: null, complete: false,
  }
  if (input.prepared.status !== "ready") return blocked(tableId, fallbackCursor, [issue(
    "prepared-rows-not-ready", "prepared.status", "prepared Table rows must be ready before pagination", tableId,
  )])
  const prepared = input.prepared
  const cursorBefore = clone(input.cursor ?? createInitialVNextTablePaginationCursorV1(prepared))
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const startPageIndex = input.startPageIndex ?? 0
  const issues: VNextTablePaginationIssueV1[] = []
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be finite and positive", tableId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt) || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height", "firstPageAvailableHeightPt", "first page height must fit page body", tableId,
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "invalid-start-page-index", "startPageIndex", "start page index must be non-negative", tableId,
  ))
  if (!Number.isInteger(input.maximumPageCount) || input.maximumPageCount <= 0) issues.push(issue(
    "invalid-maximum-page-count", "maximumPageCount", "maximum page count must be a positive integer", tableId,
  ))
  if (!Number.isInteger(input.maximumRowPlanCount) || input.maximumRowPlanCount <= 0) issues.push(issue(
    "invalid-maximum-row-plan-count", "maximumRowPlanCount", "maximum row plan count must be a positive integer", tableId,
  ))
  if (!VNextTablePaginationCursorV1Schema.safeParse(cursorBefore).success) issues.push(issue(
    "invalid-table-pagination-cursor", "cursor", "table pagination cursor does not satisfy strict v1 contract", tableId,
  ))
  if (cursorBefore.tableId !== tableId) issues.push(issue(
    "table-pagination-cursor-identity-mismatch", "cursor.tableId", "cursor Table id does not match prepared rows", tableId,
  ))
  if (cursorBefore.rowIndex > prepared.rows.length) issues.push(issue(
    "table-pagination-cursor-row-out-of-bounds", "cursor.rowIndex", "cursor row index exceeds prepared rows", tableId,
  ))
  if (cursorBefore.complete && (cursorBefore.rowIndex !== prepared.rows.length || cursorBefore.activeRow != null)) issues.push(issue(
    "complete-table-cursor-mismatch", "cursor.complete", "complete Table cursor must point after final row with no active row", tableId,
  ))
  if (cursorBefore.activeRow != null && cursorBefore.activeRow.rowIndex !== cursorBefore.rowIndex) issues.push(issue(
    "active-row-cursor-index-mismatch", "cursor.activeRow.rowIndex", "active row cursor must match Table cursor row index", tableId,
  ))
  if (issues.length > 0) return blocked(tableId, cursorBefore, issues)
  if (cursorBefore.complete) return {
    source: VNEXT_TABLE_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
    status: "paginated",
    tableId,
    cursorBefore,
    cursorAfter: clone(cursorBefore),
    pages: [],
    fingerprint: JSON.stringify([tableId, cursorBefore, []]),
    summary: { pageCount: 0, rowFragmentCount: 0, completedRowCount: 0, splitRowCount: 0, repeatedHeaderFragmentCount: 0, maximumUsedPageHeightPt: 0 },
    work: { pageAttemptCount: 0, rowPlanCount: 0, cellPlanCount: 0, checkpointLookupCount: 0, consumedCandidateCount: 0, freshPageAdvanceCount: 0, repeatedHeaderRowPlanCount: 0 },
    contracts: { measurementExecution: false, preparedInputMutation: false, rowCursorCommit: "atomic", repeatedHeaders: "not-run" },
    issues: [],
  }

  let cursor = clone(cursorBefore)
  let pageAttemptCount = 0
  let rowPlanCount = 0
  let cellPlanCount = 0
  let checkpointLookupCount = 0
  let consumedCandidateCount = 0
  let freshPageAdvanceCount = 0
  let completedRowCount = 0
  let repeatedHeaderRowPlanCount = 0
  let repeatedHeaderFragmentCount = 0
  const splitRows = new Set<number>()
  const pages: VNextTablePageV1[] = []
  const headerPolicy = input.headerPolicy ?? "no-repeat"

  while (!cursor.complete) {
    if (pageAttemptCount >= input.maximumPageCount) return blocked(tableId, cursorBefore, [issue(
      "table-page-limit-exceeded", "maximumPageCount", `Table pagination exceeded ${input.maximumPageCount} pages`, tableId, cursor.rowIndex,
    )])
    const availableHeightPt = pageAttemptCount === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    const plan = planVNextTablePageV1({
      prepared,
      cursor,
      pageBodyHeightPt: input.pageBodyHeightPt,
      availableHeightPt,
      pageIndex: startPageIndex + pages.length,
      headerPolicy,
      maximumRowPlanCount: input.maximumRowPlanCount,
      rowPlanCountBefore: rowPlanCount,
    })
    pageAttemptCount += 1
    if (plan.status === "blocked") return blocked(tableId, cursorBefore, plan.issues)
    pages.push(plan.page)
    cursor = clone(plan.cursorAfter)
    rowPlanCount += plan.work.rowPlanCount
    cellPlanCount += plan.work.cellPlanCount
    checkpointLookupCount += plan.work.checkpointLookupCount
    consumedCandidateCount += plan.work.consumedCandidateCount
    repeatedHeaderRowPlanCount += plan.work.repeatedHeaderRowPlanCount
    freshPageAdvanceCount += plan.freshPageAdvanceCount
    completedRowCount += plan.completedRowCount
    repeatedHeaderFragmentCount += plan.repeatedHeaderFragmentCount
    if (plan.splitRowIndex != null) splitRows.add(plan.splitRowIndex)
  }

  const cursorAfter = clone(cursor)
  const rowFragmentCount = pages.reduce((total, page) => total + page.rows.length, 0)
  return {
    source: VNEXT_TABLE_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
    status: "paginated",
    tableId,
    cursorBefore,
    cursorAfter,
    pages,
    fingerprint: JSON.stringify([prepared.fingerprint, cursorBefore, cursorAfter, pages]),
    summary: {
      pageCount: pages.length,
      rowFragmentCount,
      completedRowCount,
      splitRowCount: splitRows.size,
      repeatedHeaderFragmentCount,
      maximumUsedPageHeightPt: Math.max(0, ...pages.map((page) => page.usedHeightPt)),
    },
    work: { pageAttemptCount, rowPlanCount, cellPlanCount, checkpointLookupCount, consumedCandidateCount, freshPageAdvanceCount, repeatedHeaderRowPlanCount },
    contracts: {
      measurementExecution: false,
      preparedInputMutation: false,
      rowCursorCommit: "atomic",
      repeatedHeaders: headerPolicy === "repeat-leading-headers" ? "applied" : "not-run",
    },
    issues: [],
  }
}
