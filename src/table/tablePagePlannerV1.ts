import type {
  VNextTablePreparedAuthoredRowV1,
  VNextTablePreparedRowV1,
  VNextTablePreparedRowsResultV1,
} from "./tablePreparedCellContractV1.js"
import { createInitialVNextTableRowCursorV1, planVNextTableRowV1 } from "./tableRowPaginationV1.js"
import {
  VNEXT_TABLE_PAGINATION_VERSION,
  VNextTablePaginationCursorV1Schema,
  type VNextTablePageRowFragmentV1,
  type VNextTablePageV1,
  type VNextTablePaginationCursorV1,
  type VNextTablePaginationIssueV1,
} from "./tablePaginationContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(
  code: string,
  path: string,
  message: string,
  tableId: string,
  rowIndex?: number,
): VNextTablePaginationIssueV1 {
  return { code, path, message, severity: "error", tableId, ...(rowIndex == null ? {} : { rowIndex }) }
}

function rowKey(row: VNextTablePreparedRowV1): string {
  return row.kind === "prepared-materialized-row" ? row.rowInstanceId : row.sourceRowId
}

export interface VNextTablePagePlannerWorkV1 {
  rowPlanCount: number
  cellPlanCount: number
  checkpointLookupCount: number
  consumedCandidateCount: number
  repeatedHeaderRowPlanCount: number
}

export type VNextTablePagePlanV1 =
  | {
      status: "planned"
      cursorAfter: VNextTablePaginationCursorV1
      page: VNextTablePageV1
      completedRowCount: number
      splitRowIndex: number | null
      repeatedHeaderFragmentCount: number
      freshPageAdvanceCount: number
      work: VNextTablePagePlannerWorkV1
    }
  | {
      status: "blocked"
      issues: VNextTablePaginationIssueV1[]
    }

function leadingHeaders(
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>,
): VNextTablePreparedAuthoredRowV1[] {
  const headers: VNextTablePreparedAuthoredRowV1[] = []
  for (const row of prepared.rows) {
    if (row.kind !== "prepared-authored-row" || row.role !== "header") break
    headers.push(row)
  }
  return headers
}

export function planVNextTablePageV1(input: {
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
  cursor: VNextTablePaginationCursorV1
  pageBodyHeightPt: number
  availableHeightPt: number
  pageIndex: number
  headerPolicy: "no-repeat" | "repeat-leading-headers"
  maximumRowPlanCount: number
  rowPlanCountBefore: number
}): VNextTablePagePlanV1 {
  const tableId = input.prepared.tableId
  const validationIssues: VNextTablePaginationIssueV1[] = []
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) validationIssues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be finite and positive", tableId,
  ))
  if (!Number.isFinite(input.availableHeightPt) || input.availableHeightPt < 0
    || input.availableHeightPt > input.pageBodyHeightPt) validationIssues.push(issue(
    "invalid-available-page-height", "availableHeightPt", "available page height must fit page body", tableId,
  ))
  if (!Number.isInteger(input.pageIndex) || input.pageIndex < 0) validationIssues.push(issue(
    "invalid-page-index", "pageIndex", "page index must be non-negative", tableId,
  ))
  if (!Number.isInteger(input.maximumRowPlanCount) || input.maximumRowPlanCount <= 0) validationIssues.push(issue(
    "invalid-maximum-row-plan-count", "maximumRowPlanCount", "maximum row plan count must be a positive integer", tableId,
  ))
  if (!Number.isInteger(input.rowPlanCountBefore) || input.rowPlanCountBefore < 0) validationIssues.push(issue(
    "invalid-prior-row-plan-count", "rowPlanCountBefore", "prior row plan count must be a non-negative integer", tableId,
  ))
  if (!VNextTablePaginationCursorV1Schema.safeParse(input.cursor).success) validationIssues.push(issue(
    "invalid-table-pagination-cursor", "cursor", "table pagination cursor does not satisfy strict v1 contract", tableId,
  ))
  if (input.cursor.tableId !== tableId) validationIssues.push(issue(
    "table-pagination-cursor-identity-mismatch", "cursor.tableId", "cursor Table id does not match prepared rows", tableId,
  ))
  if (input.cursor.rowIndex > input.prepared.rows.length) validationIssues.push(issue(
    "table-pagination-cursor-row-out-of-bounds", "cursor.rowIndex", "cursor row index exceeds prepared rows", tableId,
  ))
  if (input.cursor.complete) validationIssues.push(issue(
    "table-page-planner-complete-cursor", "cursor.complete", "one-page Table planning requires an incomplete cursor", tableId,
  ))
  if (input.cursor.activeRow != null && input.cursor.activeRow.rowIndex !== input.cursor.rowIndex) validationIssues.push(issue(
    "active-row-cursor-index-mismatch", "cursor.activeRow.rowIndex", "active row cursor must match Table cursor row index", tableId,
  ))
  if (validationIssues.length > 0) return { status: "blocked", issues: validationIssues }

  const headers = leadingHeaders(input.prepared)
  if (input.headerPolicy === "repeat-leading-headers" && headers.length === 0) return {
    status: "blocked",
    issues: [issue(
      "repeated-header-source-missing",
      "headerPolicy",
      "repeat-leading-headers requires leading authored header rows",
      tableId,
    )],
  }

  let rowIndex = input.cursor.rowIndex
  let activeRow = clone(input.cursor.activeRow)
  let usedHeightPt = 0
  let completedRowCount = 0
  let splitRowIndex: number | null = null
  let repeatedHeaderFragmentCount = 0
  let freshPageAdvanceCount = 0
  const rowFragments: VNextTablePageRowFragmentV1[] = []
  const work: VNextTablePagePlannerWorkV1 = {
    rowPlanCount: 0,
    cellPlanCount: 0,
    checkpointLookupCount: 0,
    consumedCandidateCount: 0,
    repeatedHeaderRowPlanCount: 0,
  }
  const hasRowPlanCapacity = () => input.rowPlanCountBefore + work.rowPlanCount < input.maximumRowPlanCount
  const continuationPage = input.pageIndex > 0 || input.cursor.rowIndex > 0 || input.cursor.activeRow != null
  const shouldRepeatHeaders = input.headerPolicy === "repeat-leading-headers"
    && continuationPage
    && rowIndex >= headers.length

  if (shouldRepeatHeaders) {
    for (let headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
      if (!hasRowPlanCapacity()) return {
        status: "blocked",
        issues: [issue(
          "table-row-plan-limit-exceeded",
          "maximumRowPlanCount",
          `Table pagination exceeded ${input.maximumRowPlanCount} row plans`,
          tableId,
          rowIndex,
        )],
      }
      const header = clone(headers[headerIndex])
      header.breakPolicy = "strict-keep"
      const plan = planVNextTableRowV1({
        row: header,
        availableHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
        pageBodyHeightPt: input.pageBodyHeightPt,
      })
      work.rowPlanCount += 1
      work.repeatedHeaderRowPlanCount += 1
      if (plan.status === "blocked" || !plan.complete || !plan.progressed || plan.needsFreshPage) return {
        status: "blocked",
        issues: [issue(
          "repeated-header-does-not-fit",
          `headers[${headerIndex}]`,
          plan.status === "blocked"
            ? plan.issues.map((item) => item.message).join("; ")
            : "repeated header must complete on the continuation page",
          tableId,
          header.rowIndex,
        )],
      }
      work.cellPlanCount += plan.work.cellPlanCount
      work.checkpointLookupCount += plan.work.checkpointLookupCount
      work.consumedCandidateCount += plan.work.consumedCandidateCount
      rowFragments.push({
        fragmentId: JSON.stringify([tableId, "repeated-header", header.rowIndex, input.pageIndex]),
        rowIndex: header.rowIndex,
        rowFragmentIndex: 0,
        rowKind: "authored",
        rowRole: header.role,
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

  while (rowIndex < input.prepared.rows.length && usedHeightPt <= input.availableHeightPt) {
    if (!hasRowPlanCapacity()) return {
      status: "blocked",
      issues: [issue(
        "table-row-plan-limit-exceeded",
        "maximumRowPlanCount",
        `Table pagination exceeded ${input.maximumRowPlanCount} row plans`,
        tableId,
        rowIndex,
      )],
    }
    const row = input.prepared.rows[rowIndex]
    const rowCursor = activeRow ?? createInitialVNextTableRowCursorV1(row)
    const plan = planVNextTableRowV1({
      row,
      availableHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
      pageBodyHeightPt: input.pageBodyHeightPt,
      cursor: rowCursor,
    })
    work.rowPlanCount += 1
    if (plan.status === "blocked") return {
      status: "blocked",
      issues: plan.issues.map((item) => issue(item.code, item.path, item.message, tableId, item.rowIndex)),
    }
    work.cellPlanCount += plan.work.cellPlanCount
    work.checkpointLookupCount += plan.work.checkpointLookupCount
    work.consumedCandidateCount += plan.work.consumedCandidateCount
    if (!plan.progressed && plan.needsFreshPage) {
      if (shouldRepeatHeaders && rowFragments.length === bodyFragmentStartCount) return {
        status: "blocked",
        issues: [issue(
          "repeated-header-prevents-body-progress",
          "headerPolicy",
          "repeated headers leave no legal body-row progress on a fresh continuation page",
          tableId,
          rowIndex,
        )],
      }
      if (usedHeightPt === 0 && input.availableHeightPt >= input.pageBodyHeightPt) return {
        status: "blocked",
        issues: [issue(
          "table-pagination-no-progress",
          "cursor",
          "row requested another fresh page from a fresh page",
          tableId,
          rowIndex,
        )],
      }
      freshPageAdvanceCount += 1
      break
    }
    if (!plan.progressed && !plan.complete) return {
      status: "blocked",
      issues: [issue(
        "table-pagination-no-progress",
        "cursor",
        "row planning neither progressed nor completed",
        tableId,
        rowIndex,
      )],
    }
    const fragmentIndex = plan.cursorBefore.fragmentIndex
    rowFragments.push({
      fragmentId: JSON.stringify([tableId, rowIndex, fragmentIndex, input.pageIndex]),
      rowIndex,
      rowFragmentIndex: fragmentIndex,
      rowKind: row.kind === "prepared-authored-row" ? "authored" : "materialized",
      rowRole: row.role,
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
      splitRowIndex = rowIndex
      break
    }
    if (usedHeightPt >= input.availableHeightPt) break
  }
  if (shouldRepeatHeaders && rowFragments.length === bodyFragmentStartCount && rowIndex < input.prepared.rows.length) return {
    status: "blocked",
    issues: [issue(
      "repeated-header-prevents-body-progress",
      "headerPolicy",
      "repeated headers produced a header-only continuation page",
      tableId,
      rowIndex,
    )],
  }

  return {
    status: "planned",
    cursorAfter: {
      contractVersion: VNEXT_TABLE_PAGINATION_VERSION,
      kind: "table-pagination-cursor",
      tableId,
      rowIndex,
      activeRow,
      complete: rowIndex >= input.prepared.rows.length && activeRow == null,
    },
    page: {
      pageIndex: input.pageIndex,
      bodyHeightPt: input.pageBodyHeightPt,
      availableHeightPt: input.availableHeightPt,
      usedHeightPt,
      remainingHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
      rows: rowFragments,
    },
    completedRowCount,
    splitRowIndex,
    repeatedHeaderFragmentCount,
    freshPageAdvanceCount,
    work,
  }
}
