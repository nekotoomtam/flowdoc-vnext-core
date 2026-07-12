import type {
  VNextTablePreparedAuthoredRowV1,
  VNextTablePreparedRowV1,
  VNextTablePreparedRowsResultV1,
} from "./tablePreparedCellContractV1.js"
import { createInitialVNextTableRowCursorV1, planVNextTableRowV1 } from "./tableRowPaginationV1.js"
import {
  VNEXT_TABLE_PAGINATION_SOURCE,
  VNEXT_TABLE_PAGINATION_VERSION,
  VNextTablePaginationCursorV1Schema,
  type VNextTablePageRowFragmentV1,
  type VNextTablePageV1,
  type VNextTablePaginationCursorV1,
  type VNextTablePaginationIssueV1,
  type VNextTablePaginationResultV1,
} from "./tablePaginationContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string, tableId: string, rowIndex?: number): VNextTablePaginationIssueV1 {
  return { code, path, message, severity: "error", tableId, ...(rowIndex == null ? {} : { rowIndex }) }
}

function rowKey(row: VNextTablePreparedRowV1): string {
  return row.kind === "prepared-materialized-row" ? row.rowInstanceId : row.sourceRowId
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

  let rowIndex = cursorBefore.rowIndex
  let activeRow = clone(cursorBefore.activeRow)
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
  const leadingHeaders: VNextTablePreparedAuthoredRowV1[] = []
  for (const row of prepared.rows) {
    if (row.kind !== "prepared-authored-row" || row.role !== "header") break
    leadingHeaders.push(row)
  }
  if (headerPolicy === "repeat-leading-headers" && leadingHeaders.length === 0) return blocked(tableId, cursorBefore, [issue(
    "repeated-header-source-missing", "headerPolicy", "repeat-leading-headers requires leading authored header rows", tableId,
  )])

  while (rowIndex < prepared.rows.length) {
    if (pageAttemptCount >= input.maximumPageCount) return blocked(tableId, cursorBefore, [issue(
      "table-page-limit-exceeded", "maximumPageCount", `Table pagination exceeded ${input.maximumPageCount} pages`, tableId, rowIndex,
    )])
    const availableHeightPt = pageAttemptCount === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    let usedHeightPt = 0
    const rowFragments: VNextTablePageRowFragmentV1[] = []
    pageAttemptCount += 1
    const continuationPage = pageAttemptCount > 1
      || startPageIndex > 0
      || cursorBefore.rowIndex > 0
      || cursorBefore.activeRow != null
    const shouldRepeatHeaders = headerPolicy === "repeat-leading-headers"
      && continuationPage
      && rowIndex >= leadingHeaders.length
    if (shouldRepeatHeaders) {
      for (let headerIndex = 0; headerIndex < leadingHeaders.length; headerIndex += 1) {
        if (rowPlanCount >= input.maximumRowPlanCount) return blocked(tableId, cursorBefore, [issue(
          "table-row-plan-limit-exceeded", "maximumRowPlanCount",
          `Table pagination exceeded ${input.maximumRowPlanCount} row plans`, tableId, rowIndex,
        )])
        const header = clone(leadingHeaders[headerIndex])
        header.breakPolicy = "strict-keep"
        const plan = planVNextTableRowV1({
          row: header,
          availableHeightPt: roundPt(availableHeightPt - usedHeightPt),
          pageBodyHeightPt: input.pageBodyHeightPt,
        })
        rowPlanCount += 1
        repeatedHeaderRowPlanCount += 1
        if (plan.status === "blocked" || !plan.complete || !plan.progressed || plan.needsFreshPage) return blocked(
          tableId,
          cursorBefore,
          [issue(
            "repeated-header-does-not-fit",
            `headers[${headerIndex}]`,
            plan.status === "blocked" ? plan.issues.map((item) => item.message).join("; ") : "repeated header must complete on the continuation page",
            tableId,
            header.rowIndex,
          )],
        )
        cellPlanCount += plan.work.cellPlanCount
        checkpointLookupCount += plan.work.checkpointLookupCount
        consumedCandidateCount += plan.work.consumedCandidateCount
        rowFragments.push({
          fragmentId: JSON.stringify([tableId, "repeated-header", header.rowIndex, startPageIndex + pages.length]),
          rowIndex: header.rowIndex,
          rowFragmentIndex: 0,
          rowKind: "authored",
          rowKey: header.sourceRowId,
          repeatedHeader: true,
          yOffsetPt: usedHeightPt,
          heightPt: plan.usedHeightPt,
          complete: true,
          cells: clone(plan.cells),
        })
        repeatedHeaderFragmentCount += 1
        usedHeightPt = roundPt(usedHeightPt + plan.usedHeightPt)
      }
    }
    const bodyFragmentStartCount = rowFragments.length

    while (rowIndex < prepared.rows.length && usedHeightPt <= availableHeightPt) {
      if (rowPlanCount >= input.maximumRowPlanCount) return blocked(tableId, cursorBefore, [issue(
        "table-row-plan-limit-exceeded", "maximumRowPlanCount",
        `Table pagination exceeded ${input.maximumRowPlanCount} row plans`, tableId, rowIndex,
      )])
      const row = prepared.rows[rowIndex]
      const rowCursor = activeRow ?? createInitialVNextTableRowCursorV1(row)
      const plan = planVNextTableRowV1({
        row,
        availableHeightPt: roundPt(availableHeightPt - usedHeightPt),
        pageBodyHeightPt: input.pageBodyHeightPt,
        cursor: rowCursor,
      })
      rowPlanCount += 1
      if (plan.status === "blocked") return blocked(tableId, cursorBefore, plan.issues.map((item) => issue(
        item.code, item.path, item.message, tableId, item.rowIndex,
      )))
      cellPlanCount += plan.work.cellPlanCount
      checkpointLookupCount += plan.work.checkpointLookupCount
      consumedCandidateCount += plan.work.consumedCandidateCount
      if (!plan.progressed && plan.needsFreshPage) {
        if (shouldRepeatHeaders && rowFragments.length === bodyFragmentStartCount) return blocked(tableId, cursorBefore, [issue(
          "repeated-header-prevents-body-progress",
          "headerPolicy",
          "repeated headers leave no legal body-row progress on a fresh continuation page",
          tableId,
          rowIndex,
        )])
        if (usedHeightPt === 0 && availableHeightPt >= input.pageBodyHeightPt) return blocked(tableId, cursorBefore, [issue(
          "table-pagination-no-progress", "cursor", "row requested another fresh page from a fresh page", tableId, rowIndex,
        )])
        freshPageAdvanceCount += 1
        break
      }
      if (!plan.progressed && !plan.complete) return blocked(tableId, cursorBefore, [issue(
        "table-pagination-no-progress", "cursor", "row planning neither progressed nor completed", tableId, rowIndex,
      )])
      const fragmentIndex = plan.cursorBefore.fragmentIndex
      rowFragments.push({
        fragmentId: JSON.stringify([tableId, rowIndex, fragmentIndex, startPageIndex + pages.length]),
        rowIndex,
        rowFragmentIndex: fragmentIndex,
        rowKind: row.kind === "prepared-authored-row" ? "authored" : "materialized",
        rowKey: rowKey(row),
        repeatedHeader: false,
        yOffsetPt: usedHeightPt,
        heightPt: plan.usedHeightPt,
        complete: plan.complete,
        cells: clone(plan.cells),
      })
      usedHeightPt = roundPt(usedHeightPt + plan.usedHeightPt)
      if (plan.complete) {
        rowIndex += 1
        activeRow = null
        completedRowCount += 1
      } else {
        activeRow = clone(plan.cursorAfter)
        splitRows.add(rowIndex)
        break
      }
      if (usedHeightPt >= availableHeightPt) break
    }
    pages.push({
      pageIndex: startPageIndex + pages.length,
      bodyHeightPt: input.pageBodyHeightPt,
      availableHeightPt,
      usedHeightPt,
      remainingHeightPt: roundPt(availableHeightPt - usedHeightPt),
      rows: rowFragments,
    })
    if (shouldRepeatHeaders && rowFragments.length === bodyFragmentStartCount && rowIndex < prepared.rows.length) {
      return blocked(tableId, cursorBefore, [issue(
        "repeated-header-prevents-body-progress",
        "headerPolicy",
        "repeated headers produced a header-only continuation page",
        tableId,
        rowIndex,
      )])
    }
  }

  const cursorAfter: VNextTablePaginationCursorV1 = {
    contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
    kind: "table-pagination-cursor",
    tableId,
    rowIndex,
    activeRow,
    complete: rowIndex >= prepared.rows.length && activeRow == null,
  }
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
