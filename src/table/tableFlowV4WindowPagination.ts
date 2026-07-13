import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextTablePreparedRowsResultV1 } from "./tablePreparedCellContractV1.js"
import {
  createInitialVNextTablePaginationCursorV1,
} from "./tablePaginationV1.js"
import {
  VNextTablePaginationCursorV1Schema,
  type VNextTablePageV1,
  type VNextTablePaginationCursorV1,
  type VNextTablePaginationIssueV1,
} from "./tablePaginationContractV1.js"
import {
  planVNextTablePageV1,
  type VNextTablePagePlannerWorkV1,
} from "./tablePagePlannerV1.js"

export const VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE = "vnext-table-flow-v4-window-pagination"
export const VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION = 1 as const

export interface VNextTableFlowV4CumulativeWork {
  pageAttemptCount: number
  rowPlanCount: number
  cellPlanCount: number
  checkpointLookupCount: number
  consumedCandidateCount: number
  freshPageAdvanceCount: number
  repeatedHeaderRowPlanCount: number
}

export interface VNextTableFlowV4PaginationCursor {
  contractVersion: 1
  kind: "table-flow-pagination-cursor"
  tableId: string
  sourceFingerprint: string
  profileFingerprint: string
  nextPageIndex: number
  nextFragmentIndex: number
  terminalFragmentCommitted: boolean
  complete: boolean
  state: VNextTablePaginationCursorV1
  cumulativeWork: VNextTableFlowV4CumulativeWork
  fingerprint: string
}

export interface VNextTableFlowV4PageCheckpoint {
  cursorBefore: VNextTableFlowV4PaginationCursor
  cursorAfter: VNextTableFlowV4PaginationCursor
  page: VNextTablePageV1
  work: VNextTablePagePlannerWorkV1 & {
    completedRowCount: number
    splitRowIndex: number | null
    repeatedHeaderFragmentCount: number
    freshPageAdvanceCount: number
  }
  fingerprint: string
}

export function hasValidVNextTableFlowV4PageCheckpointFingerprint(
  checkpoint: VNextTableFlowV4PageCheckpoint,
): boolean {
  const { fingerprint, ...facts } = checkpoint
  return fingerprint === compact(facts)
}

interface VNextTableFlowV4WindowBase {
  source: typeof VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE
  contractVersion: typeof VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION
  tableId: string
  sourceFingerprint: string
  profileFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  headerPolicy: "no-repeat" | "repeat-leading-headers"
  maximumPageCount: number
  maximumRowPlanCount: number
  cursorBefore: VNextTableFlowV4PaginationCursor
  work: VNextTableFlowV4CumulativeWork
  contracts: {
    preparedInputMutation: false
    measurementExecution: false
    rowCursorCommit: "atomic"
    cursorCommit: "atomic-per-page"
    repeatedHeaders: "not-run" | "applied"
  }
}

export type VNextTableFlowV4WindowPaginationResult =
  | (VNextTableFlowV4WindowBase & {
      status: "complete" | "partial"
      cursorAfter: VNextTableFlowV4PaginationCursor
      pages: VNextTableFlowV4PageCheckpoint[]
      issues: []
      fingerprint: string
    })
  | (VNextTableFlowV4WindowBase & {
      status: "fresh-page-required"
      cursorAfter: VNextTableFlowV4PaginationCursor
      pages: []
      issues: []
      fingerprint: string
    })
  | (VNextTableFlowV4WindowBase & {
      status: "blocked"
      cursorAfter: null
      pages: null
      issues: VNextTablePaginationIssueV1[]
      fingerprint: string
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(typeof value === "string" ? value : JSON.stringify(value))
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

function emptyWork(): VNextTableFlowV4CumulativeWork {
  return {
    pageAttemptCount: 0,
    rowPlanCount: 0,
    cellPlanCount: 0,
    checkpointLookupCount: 0,
    consumedCandidateCount: 0,
    freshPageAdvanceCount: 0,
    repeatedHeaderRowPlanCount: 0,
  }
}

function addWork(
  left: VNextTableFlowV4CumulativeWork,
  right: VNextTableFlowV4CumulativeWork,
): VNextTableFlowV4CumulativeWork {
  return {
    pageAttemptCount: left.pageAttemptCount + right.pageAttemptCount,
    rowPlanCount: left.rowPlanCount + right.rowPlanCount,
    cellPlanCount: left.cellPlanCount + right.cellPlanCount,
    checkpointLookupCount: left.checkpointLookupCount + right.checkpointLookupCount,
    consumedCandidateCount: left.consumedCandidateCount + right.consumedCandidateCount,
    freshPageAdvanceCount: left.freshPageAdvanceCount + right.freshPageAdvanceCount,
    repeatedHeaderRowPlanCount: left.repeatedHeaderRowPlanCount + right.repeatedHeaderRowPlanCount,
  }
}

function plannerWork(input: VNextTablePagePlannerWorkV1, freshPageAdvanceCount: number): VNextTableFlowV4CumulativeWork {
  return {
    pageAttemptCount: 1,
    rowPlanCount: input.rowPlanCount,
    cellPlanCount: input.cellPlanCount,
    checkpointLookupCount: input.checkpointLookupCount,
    consumedCandidateCount: input.consumedCandidateCount,
    freshPageAdvanceCount,
    repeatedHeaderRowPlanCount: input.repeatedHeaderRowPlanCount,
  }
}

export function createVNextTableFlowV4SourceFingerprint(
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>,
): string {
  return compact(prepared)
}

export function createVNextTableFlowV4ProfileFingerprint(input: {
  pageBodyHeightPt: number
  headerPolicy: "no-repeat" | "repeat-leading-headers"
  maximumRowPlanCount: number
}): string {
  return compact([input.pageBodyHeightPt, input.headerPolicy, input.maximumRowPlanCount])
}

function cursorFacts(cursor: VNextTableFlowV4PaginationCursor): Omit<VNextTableFlowV4PaginationCursor, "fingerprint"> {
  const { fingerprint: _fingerprint, ...facts } = cursor
  return facts
}

function finalizeCursor(
  facts: Omit<VNextTableFlowV4PaginationCursor, "fingerprint">,
): VNextTableFlowV4PaginationCursor {
  return { ...facts, fingerprint: compact(facts) }
}

export function hasValidVNextTableFlowV4CursorFingerprint(cursor: VNextTableFlowV4PaginationCursor): boolean {
  const { fingerprint, ...facts } = cursor
  return fingerprint === compact(facts)
}

export function createVNextTableFlowV4CursorFingerprint(cursor: VNextTableFlowV4PaginationCursor): string {
  return compact(cursorFacts(cursor))
}

function initialCursor(input: {
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
  sourceFingerprint: string
  profileFingerprint: string
  startPageIndex: number
}): VNextTableFlowV4PaginationCursor {
  return finalizeCursor({
    contractVersion: VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION,
    kind: "table-flow-pagination-cursor",
    tableId: input.prepared.tableId,
    sourceFingerprint: input.sourceFingerprint,
    profileFingerprint: input.profileFingerprint,
    nextPageIndex: input.startPageIndex,
    nextFragmentIndex: 0,
    terminalFragmentCommitted: false,
    complete: false,
    state: createInitialVNextTablePaginationCursorV1(input.prepared),
    cumulativeWork: emptyWork(),
  })
}

function contracts(headerPolicy: "no-repeat" | "repeat-leading-headers") {
  return {
    preparedInputMutation: false as const,
    measurementExecution: false as const,
    rowCursorCommit: "atomic" as const,
    cursorCommit: "atomic-per-page" as const,
    repeatedHeaders: headerPolicy === "repeat-leading-headers" ? "applied" as const : "not-run" as const,
  }
}

function finalize<T extends object>(facts: T): T & { fingerprint: string } {
  return { ...facts, fingerprint: compact(facts) }
}

export function hasValidVNextTableFlowV4WindowPaginationFingerprint(
  result: VNextTableFlowV4WindowPaginationResult,
): boolean {
  const { fingerprint, ...facts } = result
  return fingerprint === compact(facts)
}

function base(input: {
  tableId: string
  sourceFingerprint: string
  profileFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  headerPolicy: "no-repeat" | "repeat-leading-headers"
  maximumPageCount: number
  maximumRowPlanCount: number
  cursorBefore: VNextTableFlowV4PaginationCursor
  work: VNextTableFlowV4CumulativeWork
}) {
  return {
    source: VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE as typeof VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION,
    tableId: input.tableId,
    sourceFingerprint: input.sourceFingerprint,
    profileFingerprint: input.profileFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt: input.firstPageAvailableHeightPt,
    headerPolicy: input.headerPolicy,
    maximumPageCount: input.maximumPageCount,
    maximumRowPlanCount: input.maximumRowPlanCount,
    cursorBefore: input.cursorBefore,
    work: input.work,
    contracts: contracts(input.headerPolicy),
  }
}

function blocked(
  input: Parameters<typeof base>[0],
  issues: VNextTablePaginationIssueV1[],
): VNextTableFlowV4WindowPaginationResult {
  return finalize({
    ...base(input),
    status: "blocked" as const,
    cursorAfter: null,
    pages: null,
    issues,
  })
}

function validateWork(work: VNextTableFlowV4CumulativeWork, tableId: string): VNextTablePaginationIssueV1[] {
  const issues: VNextTablePaginationIssueV1[] = []
  for (const [key, value] of Object.entries(work)) {
    if (!Number.isInteger(value) || value < 0) issues.push(issue(
      "table-flow-cursor-work-invalid",
      `cursor.cumulativeWork.${key}`,
      "Table-flow cumulative work values must be non-negative integers",
      tableId,
    ))
  }
  return issues
}

function validateCursor(input: {
  cursor: VNextTableFlowV4PaginationCursor
  prepared: Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
  sourceFingerprint: string
  profileFingerprint: string
}): VNextTablePaginationIssueV1[] {
  const { cursor, prepared, sourceFingerprint, profileFingerprint } = input
  const tableId = prepared.tableId
  const issues: VNextTablePaginationIssueV1[] = []
  if (cursor.contractVersion !== VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION
    || cursor.kind !== "table-flow-pagination-cursor") issues.push(issue(
    "table-flow-cursor-contract-invalid",
    "cursor",
    "Table-flow cursor contract version and kind must match v1",
    tableId,
  ))
  if (cursor.tableId !== tableId
    || cursor.sourceFingerprint !== sourceFingerprint
    || cursor.profileFingerprint !== profileFingerprint
    || cursor.state.tableId !== tableId) issues.push(issue(
    "table-flow-cursor-owner-mismatch",
    "cursor",
    "Table-flow cursor must pin the exact Table source, profile, and state owner",
    tableId,
  ))
  if (!hasValidVNextTableFlowV4CursorFingerprint(cursor)) issues.push(issue(
    "table-flow-cursor-fingerprint-mismatch",
    "cursor.fingerprint",
    "Table-flow cursor fingerprint does not match its retained facts",
    tableId,
  ))
  if (!VNextTablePaginationCursorV1Schema.safeParse(cursor.state).success) issues.push(issue(
    "table-flow-state-cursor-invalid",
    "cursor.state",
    "Table-flow state must satisfy the strict Table pagination cursor contract",
    tableId,
  ))
  if (!Number.isInteger(cursor.nextPageIndex) || cursor.nextPageIndex < 0
    || !Number.isInteger(cursor.nextFragmentIndex) || cursor.nextFragmentIndex < 0
    || cursor.nextPageIndex < cursor.nextFragmentIndex) issues.push(issue(
    "table-flow-cursor-index-invalid",
    "cursor",
    "Table-flow page and fragment indexes must be ordered non-negative integers",
    tableId,
  ))
  if (cursor.state.rowIndex > prepared.rows.length
    || (cursor.state.activeRow != null && cursor.state.activeRow.rowIndex !== cursor.state.rowIndex)) issues.push(issue(
    "table-flow-state-cursor-position-invalid",
    "cursor.state",
    "Table-flow state cursor must remain within the prepared row stream",
    tableId,
  ))
  const stateComplete = cursor.state.complete
  if (cursor.complete !== (stateComplete && cursor.terminalFragmentCommitted)
    || (cursor.terminalFragmentCommitted && (!stateComplete || cursor.nextFragmentIndex === 0))) issues.push(issue(
    "table-flow-cursor-completion-mismatch",
    "cursor.complete",
    "Table-flow completion must match Table state and committed terminal fragment",
    tableId,
  ))
  issues.push(...validateWork(cursor.cumulativeWork, tableId))
  if (cursor.cumulativeWork.pageAttemptCount < cursor.nextFragmentIndex
    || cursor.cumulativeWork.rowPlanCount < cursor.nextFragmentIndex) issues.push(issue(
    "table-flow-cursor-work-mismatch",
    "cursor.cumulativeWork",
    "Table-flow committed work must cover every committed fragment",
    tableId,
  ))
  return issues
}

export function paginateVNextTableFlowV4(input: {
  prepared: VNextTablePreparedRowsResultV1
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  headerPolicy?: "no-repeat" | "repeat-leading-headers"
  maximumPageCount: number
  maximumRowPlanCount: number
  cursor?: VNextTableFlowV4PaginationCursor
}): VNextTableFlowV4WindowPaginationResult {
  const tableId = input.prepared.status === "ready" ? input.prepared.tableId : "unknown-table"
  const headerPolicy = input.headerPolicy ?? "no-repeat"
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const startPageIndex = input.startPageIndex ?? 0
  const sourceFingerprint = input.prepared.status === "ready"
    ? createVNextTableFlowV4SourceFingerprint(input.prepared)
    : compact([tableId, "prepared-not-ready"])
  const profileFingerprint = createVNextTableFlowV4ProfileFingerprint({
    pageBodyHeightPt: input.pageBodyHeightPt,
    headerPolicy,
    maximumRowPlanCount: input.maximumRowPlanCount,
  })
  const fallbackState: VNextTablePaginationCursorV1 = {
    contractVersion: 1,
    kind: "table-pagination-cursor",
    tableId,
    rowIndex: 0,
    activeRow: null,
    complete: false,
  }
  const fallbackCursor = finalizeCursor({
    contractVersion: 1,
    kind: "table-flow-pagination-cursor",
    tableId,
    sourceFingerprint,
    profileFingerprint,
    nextPageIndex: Math.max(0, Number.isInteger(startPageIndex) ? startPageIndex : 0),
    nextFragmentIndex: 0,
    terminalFragmentCommitted: false,
    complete: false,
    state: fallbackState,
    cumulativeWork: emptyWork(),
  })
  const cursorBefore = clone(input.cursor ?? (input.prepared.status === "ready"
    ? initialCursor({ prepared: input.prepared, sourceFingerprint, profileFingerprint, startPageIndex })
    : fallbackCursor))
  const work = emptyWork()
  const baseInput = {
    tableId,
    sourceFingerprint,
    profileFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    headerPolicy,
    maximumPageCount: input.maximumPageCount,
    maximumRowPlanCount: input.maximumRowPlanCount,
    cursorBefore,
    work,
  }
  const issues: VNextTablePaginationIssueV1[] = []
  if (input.prepared.status !== "ready") issues.push(issue(
    "table-flow-prepared-rows-not-ready",
    "prepared.status",
    "Table-flow pagination requires ready prepared rows",
    tableId,
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "table-flow-page-body-height-invalid",
    "pageBodyHeightPt",
    "Table-flow page body height must be positive and finite",
    tableId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt)
    || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "table-flow-first-page-height-invalid",
    "firstPageAvailableHeightPt",
    "Table-flow first-page height must fit the page body",
    tableId,
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "table-flow-start-page-index-invalid",
    "startPageIndex",
    "Table-flow start page index must be non-negative",
    tableId,
  ))
  if (!Number.isInteger(input.maximumPageCount)
    || input.maximumPageCount <= 0
    || input.maximumPageCount > 10_000) issues.push(issue(
    "table-flow-page-limit-invalid",
    "maximumPageCount",
    "Table-flow maximum page count must be between 1 and 10,000",
    tableId,
  ))
  if (!Number.isInteger(input.maximumRowPlanCount)
    || input.maximumRowPlanCount <= 0
    || input.maximumRowPlanCount > 1_000_000) issues.push(issue(
    "table-flow-plan-limit-invalid",
    "maximumRowPlanCount",
    "Table-flow maximum row-plan count must be between 1 and 1,000,000",
    tableId,
  ))
  if (input.prepared.status === "ready") {
    issues.push(...validateCursor({ cursor: cursorBefore, prepared: input.prepared, sourceFingerprint, profileFingerprint }))
    if (input.prepared.rows.length === 0) issues.push(issue(
      "table-flow-empty-source-unsupported",
      "prepared.rows",
      "empty Table composition policy is not selected",
      tableId,
    ))
  }
  if (cursorBefore.complete) issues.push(issue(
    "table-flow-cursor-already-complete",
    "cursor.complete",
    "Table-flow cannot paginate after its terminal fragment is committed",
    tableId,
  ))
  if (issues.length > 0 || input.prepared.status !== "ready") return blocked(baseInput, issues)

  let cursor = clone(cursorBefore)
  const pages: VNextTableFlowV4PageCheckpoint[] = []
  while (!cursor.complete && pages.length < input.maximumPageCount) {
    const availableHeightPt = pages.length === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    const page = planVNextTablePageV1({
      prepared: input.prepared,
      cursor: cursor.state,
      pageBodyHeightPt: input.pageBodyHeightPt,
      availableHeightPt,
      pageIndex: cursor.nextPageIndex,
      headerPolicy,
      maximumRowPlanCount: input.maximumRowPlanCount,
      rowPlanCountBefore: cursor.cumulativeWork.rowPlanCount,
    })
    work.pageAttemptCount += 1
    if (page.status === "blocked") return blocked(baseInput, page.issues)
    const delta = plannerWork(page.work, page.freshPageAdvanceCount)
    work.rowPlanCount += delta.rowPlanCount
    work.cellPlanCount += delta.cellPlanCount
    work.checkpointLookupCount += delta.checkpointLookupCount
    work.consumedCandidateCount += delta.consumedCandidateCount
    work.freshPageAdvanceCount += delta.freshPageAdvanceCount
    work.repeatedHeaderRowPlanCount += delta.repeatedHeaderRowPlanCount
    const stateProgressed = !exact(cursor.state, page.cursorAfter)
    if (!stateProgressed && page.freshPageAdvanceCount > 0 && page.page.rows.length === 0) {
      if (pages.length === 0 && firstPageAvailableHeightPt < input.pageBodyHeightPt) return finalize({
        ...base({ ...baseInput, work }),
        status: "fresh-page-required" as const,
        cursorAfter: clone(cursorBefore),
        pages: [] as [],
        issues: [] as [],
      })
      return blocked({ ...baseInput, work }, [issue(
        "table-flow-window-no-progress",
        "cursor",
        "Table-flow page planning made no committable progress",
        tableId,
        cursor.state.rowIndex,
      )])
    }
    if (!stateProgressed) return blocked({ ...baseInput, work }, [issue(
      "table-flow-window-no-progress",
      "cursor",
      "Table-flow page planning made no committable progress",
      tableId,
      cursor.state.rowIndex,
    )])

    const nextCumulativeWork = addWork(cursor.cumulativeWork, delta)
    const nextCursor = finalizeCursor({
      ...cursorFacts(cursor),
      nextPageIndex: cursor.nextPageIndex + 1,
      nextFragmentIndex: cursor.nextFragmentIndex + 1,
      terminalFragmentCommitted: page.cursorAfter.complete,
      complete: page.cursorAfter.complete,
      state: clone(page.cursorAfter),
      cumulativeWork: nextCumulativeWork,
    })
    const checkpointWork = {
      ...clone(page.work),
      completedRowCount: page.completedRowCount,
      splitRowIndex: page.splitRowIndex,
      repeatedHeaderFragmentCount: page.repeatedHeaderFragmentCount,
      freshPageAdvanceCount: page.freshPageAdvanceCount,
    }
    const checkpointFacts = {
      cursorBefore: clone(cursor),
      cursorAfter: clone(nextCursor),
      page: clone(page.page),
      work: checkpointWork,
    }
    pages.push({ ...checkpointFacts, fingerprint: compact(checkpointFacts) })
    cursor = nextCursor
  }

  return finalize({
    ...base({ ...baseInput, work }),
    status: cursor.complete ? "complete" as const : "partial" as const,
    cursorAfter: cursor,
    pages,
    issues: [] as [],
  })
}
