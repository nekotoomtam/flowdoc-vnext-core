import type { VNextTablePreparedRowV1 } from "./tablePreparedCellContractV1.js"
import { createInitialVNextTableCellCursorV1, planVNextTableCellV1 } from "./tableCellPaginationV1.js"
import {
  VNEXT_TABLE_ROW_PAGINATION_SOURCE,
  VNEXT_TABLE_ROW_PAGINATION_VERSION,
  VNextTableRowCursorV1Schema,
  type VNextTableRowCursorIdentityV1,
  type VNextTableRowCursorV1,
  type VNextTableRowPaginationIssueV1,
  type VNextTableRowPlanResultV1,
} from "./tableRowPaginationContractV1.js"

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
  rowIndex: number,
  sourceCellId?: string,
): VNextTableRowPaginationIssueV1 {
  return { code, path, message, severity: "error", rowIndex, ...(sourceCellId == null ? {} : { sourceCellId }) }
}

function rowIdentity(row: VNextTablePreparedRowV1): VNextTableRowCursorIdentityV1 {
  return row.kind === "prepared-materialized-row"
    ? { kind: "resolved-row", rowInstanceId: row.rowInstanceId }
    : { kind: "authored-row", sourceRowId: row.sourceRowId }
}

function sameRowIdentity(left: VNextTableRowCursorIdentityV1, right: VNextTableRowCursorIdentityV1): boolean {
  if (left.kind !== right.kind) return false
  return left.kind === "resolved-row"
    ? left.rowInstanceId === (right as Extract<VNextTableRowCursorIdentityV1, { kind: "resolved-row" }>).rowInstanceId
    : left.sourceRowId === (right as Extract<VNextTableRowCursorIdentityV1, { kind: "authored-row" }>).sourceRowId
}

function cursorProgressed(before: VNextTableRowCursorV1, after: VNextTableRowCursorV1): boolean {
  return before.cells.some((cell, index) => {
    const next = after.cells[index]
    return next == null || cell.complete !== next.complete || cell.candidateIndex !== next.candidateIndex
  })
}

export function createInitialVNextTableRowCursorV1(row: VNextTablePreparedRowV1): VNextTableRowCursorV1 {
  return {
    contractVersion: VNEXT_TABLE_ROW_PAGINATION_VERSION,
    kind: "table-row-cursor",
    rowIndex: row.rowIndex,
    rowIdentity: rowIdentity(row),
    fragmentIndex: 0,
    complete: false,
    cells: row.cells.map(createInitialVNextTableCellCursorV1),
  }
}

function blocked(
  row: VNextTablePreparedRowV1,
  cursorBefore: VNextTableRowCursorV1,
  issues: VNextTableRowPaginationIssueV1[],
): VNextTableRowPlanResultV1 {
  return {
    source: VNEXT_TABLE_ROW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_ROW_PAGINATION_VERSION,
    status: "blocked",
    rowIndex: row.rowIndex,
    cursorBefore,
    cursorAfter: null,
    cells: null,
    issues,
  }
}

function moved(
  row: VNextTablePreparedRowV1,
  cursorBefore: VNextTableRowCursorV1,
  availableHeightPt: number,
  reason: "keep-move-whole" | "minimum-height-move" | "fresh-page-required",
): Extract<VNextTableRowPlanResultV1, { status: "planned" }> {
  return {
    source: VNEXT_TABLE_ROW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_ROW_PAGINATION_VERSION,
    status: "planned",
    rowIndex: row.rowIndex,
    cursorBefore,
    cursorAfter: clone(cursorBefore),
    cells: [],
    usedHeightPt: 0,
    remainingHeightPt: roundPt(availableHeightPt),
    complete: false,
    progressed: false,
    needsFreshPage: true,
    continuationReason: reason,
    work: { cellPlanCount: 0, checkpointLookupCount: 0, consumedCandidateCount: 0 },
    contracts: { cellCursorCommit: "atomic", measurementExecution: false },
    issues: [],
  }
}

export function planVNextTableRowV1(input: {
  row: VNextTablePreparedRowV1
  availableHeightPt: number
  pageBodyHeightPt: number
  cursor?: VNextTableRowCursorV1
}): VNextTableRowPlanResultV1 {
  const cursorBefore = clone(input.cursor ?? createInitialVNextTableRowCursorV1(input.row))
  const issues: VNextTableRowPaginationIssueV1[] = []
  if (!Number.isFinite(input.availableHeightPt) || input.availableHeightPt < 0) issues.push(issue(
    "invalid-available-height", "availableHeightPt", "available height must be finite and non-negative", input.row.rowIndex,
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be finite and positive", input.row.rowIndex,
  ))
  if (input.availableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "available-height-exceeds-page-body", "availableHeightPt", "available height cannot exceed page body height", input.row.rowIndex,
  ))
  if (!VNextTableRowCursorV1Schema.safeParse(cursorBefore).success) issues.push(issue(
    "invalid-row-cursor", "cursor", "row cursor does not satisfy the strict v1 contract", input.row.rowIndex,
  ))
  if (cursorBefore.rowIndex !== input.row.rowIndex || !sameRowIdentity(cursorBefore.rowIdentity, rowIdentity(input.row))) {
    issues.push(issue("row-cursor-identity-mismatch", "cursor", "row cursor identity does not match prepared row", input.row.rowIndex))
  }
  if (cursorBefore.cells.length !== input.row.cells.length) issues.push(issue(
    "row-cursor-cell-count-mismatch", "cursor.cells", "row cursor and prepared row must have equal cell counts", input.row.rowIndex,
  ))
  input.row.cells.forEach((cell, index) => {
    if (cursorBefore.cells[index]?.sourceCellId !== cell.sourceCellId) issues.push(issue(
      "row-cursor-cell-order-mismatch", `cursor.cells[${index}]`,
      `row cursor cell order must match source cell "${cell.sourceCellId}"`, input.row.rowIndex, cell.sourceCellId,
    ))
  })
  if (cursorBefore.complete && !cursorBefore.cells.every((cell) => cell.complete)) issues.push(issue(
    "complete-row-cursor-cell-mismatch", "cursor.complete", "complete row cursor requires every cell complete", input.row.rowIndex,
  ))
  const recomputedMaximum = input.row.cells.reduce((maximum, cell) => Math.max(maximum, cell.outerHeightPt), 0)
  if (Math.abs(recomputedMaximum - input.row.maximumCellOuterHeightPt) > 1e-6) issues.push(issue(
    "prepared-row-height-drift", "row.maximumCellOuterHeightPt", "prepared maximum cell height does not match cells", input.row.rowIndex,
  ))
  if (input.row.minimumFirstFragmentHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "minimum-row-height-exceeds-page-body",
    "row.minimumFirstFragmentHeightPt",
    "row minimum first-fragment height exceeds page body height",
    input.row.rowIndex,
  ))
  if (issues.length > 0) return blocked(input.row, cursorBefore, issues)

  if (cursorBefore.complete) return {
    source: VNEXT_TABLE_ROW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_ROW_PAGINATION_VERSION,
    status: "planned",
    rowIndex: input.row.rowIndex,
    cursorBefore,
    cursorAfter: clone(cursorBefore),
    cells: [],
    usedHeightPt: 0,
    remainingHeightPt: roundPt(input.availableHeightPt),
    complete: true,
    progressed: false,
    needsFreshPage: false,
    continuationReason: "already-complete",
    work: { cellPlanCount: 0, checkpointLookupCount: 0, consumedCandidateCount: 0 },
    contracts: { cellCursorCommit: "atomic", measurementExecution: false },
    issues: [],
  }

  const firstFragment = cursorBefore.fragmentIndex === 0
  const requiredWholeHeightPt = Math.max(input.row.maximumCellOuterHeightPt, input.row.minimumFirstFragmentHeightPt)
  if (firstFragment && input.row.breakPolicy === "strict-keep" && requiredWholeHeightPt > input.pageBodyHeightPt) {
    return blocked(input.row, cursorBefore, [issue(
      "strict-keep-row-exceeds-page-body", "row.breakPolicy",
      `strict-keep row requires ${requiredWholeHeightPt}pt but page body is ${input.pageBodyHeightPt}pt`, input.row.rowIndex,
    )])
  }
  if (firstFragment && input.row.minimumFirstFragmentHeightPt > input.availableHeightPt) {
    return moved(input.row, cursorBefore, input.availableHeightPt, "minimum-height-move")
  }
  if (firstFragment
    && (input.row.breakPolicy === "strict-keep" || input.row.breakPolicy === "prefer-keep")
    && requiredWholeHeightPt <= input.pageBodyHeightPt
    && requiredWholeHeightPt > input.availableHeightPt) {
    return moved(input.row, cursorBefore, input.availableHeightPt, "keep-move-whole")
  }

  const plans = input.row.cells.map((cell, index) => planVNextTableCellV1({
    cell,
    availableHeightPt: input.availableHeightPt,
    pageBodyHeightPt: input.pageBodyHeightPt,
    cursor: cursorBefore.cells[index],
  }))
  const blockedCell = plans.find((plan) => plan.status === "blocked")
  if (blockedCell?.status === "blocked") return blocked(input.row, cursorBefore, blockedCell.issues.map((item) => issue(
    item.code, item.path, item.message, input.row.rowIndex, item.sourceCellId,
  )))
  const accepted = plans.map((plan) => {
    if (plan.status !== "planned") throw new Error("blocked cell escaped row reconciliation")
    return plan
  })
  if (input.row.breakPolicy === "strict-keep" && firstFragment && accepted.some((plan) => !plan.complete)) {
    return blocked(input.row, cursorBefore, [issue(
      "strict-keep-row-did-not-complete", "row.breakPolicy",
      "strict-keep row planner must complete every cell in one fragment", input.row.rowIndex,
    )])
  }
  const nextCells = accepted.map((plan) => clone(plan.cursorAfter))
  const cellProgress = accepted.some((plan) => plan.progressed)
  const complete = nextCells.every((cell) => cell.complete)
  if (!cellProgress && !complete) {
    if (input.availableHeightPt < input.pageBodyHeightPt && accepted.some((plan) => plan.needsFreshPage)) {
      const result = moved(input.row, cursorBefore, input.availableHeightPt, "fresh-page-required")
      result.work = {
        cellPlanCount: accepted.length,
        checkpointLookupCount: accepted.reduce((sum, plan) => sum + plan.work.checkpointLookupCount, 0),
        consumedCandidateCount: 0,
      }
      return result
    }
    return blocked(input.row, cursorBefore, [issue(
      "row-pagination-no-progress", "cursor", "synchronized row planning made no progress", input.row.rowIndex,
    )])
  }
  const cursorAfter: VNextTableRowCursorV1 = {
    ...clone(cursorBefore),
    fragmentIndex: cursorBefore.fragmentIndex + 1,
    complete,
    cells: nextCells,
  }
  const progressed = cursorProgressed(cursorBefore, cursorAfter)
  const rawUsedHeightPt = Math.max(0, ...accepted.map((plan) => plan.usedHeightPt))
  const usedHeightPt = roundPt(Math.max(firstFragment ? input.row.minimumFirstFragmentHeightPt : 0, rawUsedHeightPt))
  return {
    source: VNEXT_TABLE_ROW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_ROW_PAGINATION_VERSION,
    status: "planned",
    rowIndex: input.row.rowIndex,
    cursorBefore,
    cursorAfter,
    cells: accepted.map((plan, index) => ({
      sourceCellId: input.row.cells[index].sourceCellId,
      cellIndex: index,
      xOffsetPt: input.row.cells[index].xOffsetPt,
      outerWidthPt: input.row.cells[index].outerWidthPt,
      contentWidthPt: input.row.cells[index].contentWidthPt,
      insetsPt: clone(input.row.cells[index].insetsPt),
      verticalAlign: input.row.cells[index].verticalAlign,
      usedHeightPt: plan.usedHeightPt,
      complete: plan.complete,
      placements: clone(plan.placements),
    })),
    usedHeightPt,
    remainingHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
    complete,
    progressed,
    needsFreshPage: false,
    continuationReason: complete ? "complete" : "page-full",
    work: {
      cellPlanCount: accepted.length,
      checkpointLookupCount: accepted.reduce((sum, plan) => sum + plan.work.checkpointLookupCount, 0),
      consumedCandidateCount: accepted.reduce((sum, plan) => sum + plan.work.consumedCandidateCount, 0),
    },
    contracts: { cellCursorCommit: "atomic", measurementExecution: false },
    issues: [],
  }
}
