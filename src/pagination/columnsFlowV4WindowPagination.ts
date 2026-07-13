import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH } from "../schema/documentV4Structure.js"
import type { VNextColumnsV4Cursor, VNextColumnsV4Issue } from "./columnsV4Contract.js"
import {
  planVNextColumnsV4NestedPage,
  type VNextColumnsV4NestedInput,
  type VNextColumnsV4NestedPageFragment,
  type VNextColumnsV4NestedWorkFacts,
} from "./columnsV4NestedPagination.js"

export const VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE = "vnext-columns-flow-v4-window-pagination"
export const VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION = 1 as const

export interface VNextColumnsFlowV4PaginationCursor {
  contractVersion: 1
  kind: "columns-flow-pagination-cursor"
  columnsId: string
  sourceFingerprint: string
  nextPageIndex: number
  nextFragmentIndex: number
  terminalFragmentCommitted: boolean
  complete: boolean
  state: VNextColumnsV4Cursor
}

export interface VNextColumnsFlowV4PageCheckpoint {
  cursorBefore: VNextColumnsFlowV4PaginationCursor
  cursorAfter: VNextColumnsFlowV4PaginationCursor
  page: VNextColumnsV4NestedPageFragment
  fingerprint: string
}

interface VNextColumnsFlowV4WindowBase {
  source: typeof VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE
  contractVersion: typeof VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION
  columnsId: string
  sourceFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  maximumPageCount: number
  cursorBefore: VNextColumnsFlowV4PaginationCursor
  work: VNextColumnsV4NestedWorkFacts
  contracts: {
    authoredNodeMutation: false
    authoredIdentityAllocation: false
    measurementExecution: false
    maximumNestingDepth: typeof VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH
    cursorCommit: "atomic-per-page"
  }
}

export type VNextColumnsFlowV4WindowPaginationResult =
  | (VNextColumnsFlowV4WindowBase & {
      status: "complete" | "partial"
      cursorAfter: VNextColumnsFlowV4PaginationCursor
      pages: VNextColumnsFlowV4PageCheckpoint[]
      issues: []
      fingerprint: string
    })
  | (VNextColumnsFlowV4WindowBase & {
      status: "fresh-page-required"
      cursorAfter: VNextColumnsFlowV4PaginationCursor
      pages: []
      issues: []
      fingerprint: string
    })
  | (VNextColumnsFlowV4WindowBase & {
      status: "blocked"
      cursorAfter: null
      pages: null
      issues: VNextColumnsV4Issue[]
      fingerprint: string
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string, columnsId: string): VNextColumnsV4Issue {
  return { code, path, message, severity: "error", columnsId }
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(typeof value === "string" ? value : JSON.stringify(value))
}

function sourceIdentity(input: VNextColumnsV4NestedInput): string {
  return [
    input.geometry.fingerprint,
    input.minimumHeightPt ?? 0,
    ...input.lanes.flatMap((lane) => [
      lane.columnId,
      ...lane.items.map((item) => item.kind === "fragments"
        ? `${item.nodeId}:${item.source.fingerprint}`
        : `${item.nodeId}:{${sourceIdentity(item.columns)}}`),
    ]),
  ].join(":")
}

export function createVNextColumnsFlowV4SourceFingerprint(input: VNextColumnsV4NestedInput): string {
  return compact(sourceIdentity(input))
}

export function createVNextColumnsFlowV4CursorFingerprint(cursor: VNextColumnsFlowV4PaginationCursor): string {
  return compact(cursor)
}

function initialState(input: VNextColumnsV4NestedInput): VNextColumnsV4Cursor {
  return {
    columnsId: input.geometry.columnsId,
    columnsDepth: 1,
    columns: input.lanes.map((lane) => ({
      columnId: lane.columnId,
      complete: lane.items.length === 0,
      child: {
        childIndex: 0,
        childNodeId: lane.items[0]?.nodeId ?? null,
        fragmentIndex: 0,
      },
    })),
  }
}

function initialCursor(
  input: VNextColumnsV4NestedInput,
  sourceFingerprint: string,
  startPageIndex: number,
): VNextColumnsFlowV4PaginationCursor {
  return {
    contractVersion: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION,
    kind: "columns-flow-pagination-cursor",
    columnsId: input.geometry.columnsId,
    sourceFingerprint,
    nextPageIndex: startPageIndex,
    nextFragmentIndex: 0,
    terminalFragmentCommitted: false,
    complete: false,
    state: initialState(input),
  }
}

function createWork(): VNextColumnsV4NestedWorkFacts {
  return {
    pageAttemptCount: 0,
    lanePlanCount: 0,
    nestedPlanCount: 0,
    checkpointLookupCount: 0,
    consumedFragmentCount: 0,
    zeroProgressPageAdvanceCount: 0,
    maximumObservedDepth: 1,
  }
}

function contracts() {
  return {
    authoredNodeMutation: false as const,
    authoredIdentityAllocation: false as const,
    measurementExecution: false as const,
    maximumNestingDepth: VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH,
    cursorCommit: "atomic-per-page" as const,
  }
}

function finalize<T extends object>(facts: T): T & { fingerprint: string } {
  return { ...facts, fingerprint: compact(facts) }
}

export function hasValidVNextColumnsFlowV4WindowPaginationFingerprint(
  result: VNextColumnsFlowV4WindowPaginationResult,
): boolean {
  const { fingerprint, ...facts } = result
  return fingerprint === compact(facts)
}

function blocked(input: {
  columnsId: string
  sourceFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  maximumPageCount: number
  cursorBefore: VNextColumnsFlowV4PaginationCursor
  work: VNextColumnsV4NestedWorkFacts
  issues: VNextColumnsV4Issue[]
}): VNextColumnsFlowV4WindowPaginationResult {
  return finalize({
    source: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE,
    contractVersion: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION,
    status: "blocked" as const,
    columnsId: input.columnsId,
    sourceFingerprint: input.sourceFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt: input.firstPageAvailableHeightPt,
    maximumPageCount: input.maximumPageCount,
    cursorBefore: input.cursorBefore,
    cursorAfter: null,
    pages: null,
    work: input.work,
    contracts: contracts(),
    issues: input.issues,
  })
}

function validateCursor(
  cursor: VNextColumnsFlowV4PaginationCursor,
  columnsId: string,
  sourceFingerprint: string,
): VNextColumnsV4Issue[] {
  const issues: VNextColumnsV4Issue[] = []
  if (cursor.contractVersion !== VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION
    || cursor.kind !== "columns-flow-pagination-cursor") issues.push(issue(
    "columns-flow-cursor-contract-invalid",
    "cursor",
    "Columns-flow cursor contract version and kind must match v1",
    columnsId,
  ))
  if (cursor.columnsId !== columnsId
    || cursor.sourceFingerprint !== sourceFingerprint
    || cursor.state.columnsId !== columnsId
    || cursor.state.columnsDepth !== 1) issues.push(issue(
    "columns-flow-cursor-owner-mismatch",
    "cursor",
    "Columns-flow cursor must pin the exact root, source, and top-level state",
    columnsId,
  ))
  if (!Number.isInteger(cursor.nextPageIndex) || cursor.nextPageIndex < 0
    || !Number.isInteger(cursor.nextFragmentIndex) || cursor.nextFragmentIndex < 0) issues.push(issue(
    "columns-flow-cursor-index-invalid",
    "cursor",
    "Columns-flow page and fragment indexes must be non-negative integers",
    columnsId,
  ))
  const stateComplete = cursor.state.columns.every((column) => column.complete)
  const expectedComplete = stateComplete && cursor.terminalFragmentCommitted
  if (cursor.complete !== expectedComplete
    || (cursor.terminalFragmentCommitted && !stateComplete)) issues.push(issue(
    "columns-flow-cursor-completion-mismatch",
    "cursor.complete",
    "Columns-flow completion must match lane and terminal-fragment state",
    columnsId,
  ))
  if (stateComplete
    && !cursor.terminalFragmentCommitted
    && cursor.nextFragmentIndex !== 0) issues.push(issue(
    "columns-flow-cursor-terminal-replay-invalid",
    "cursor.nextFragmentIndex",
    "only an initial empty Columns state may await its terminal fragment",
    columnsId,
  ))
  if (cursor.terminalFragmentCommitted && cursor.nextFragmentIndex === 0) issues.push(issue(
    "columns-flow-cursor-terminal-index-invalid",
    "cursor.nextFragmentIndex",
    "a committed terminal fragment requires at least one committed fragment index",
    columnsId,
  ))
  return issues
}

export function paginateVNextColumnsFlowV4(input: {
  columns: VNextColumnsV4NestedInput
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  maximumPageCount: number
  cursor?: VNextColumnsFlowV4PaginationCursor
}): VNextColumnsFlowV4WindowPaginationResult {
  const columnsId = input.columns.geometry.columnsId
  const sourceFingerprint = createVNextColumnsFlowV4SourceFingerprint(input.columns)
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const startPageIndex = input.startPageIndex ?? 0
  const cursorBefore = clone(input.cursor ?? initialCursor(input.columns, sourceFingerprint, startPageIndex))
  const work = createWork()
  const issues: VNextColumnsV4Issue[] = []
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "columns-flow-page-body-height-invalid",
    "pageBodyHeightPt",
    "Columns-flow page body height must be positive and finite",
    columnsId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt)
    || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "columns-flow-first-page-height-invalid",
    "firstPageAvailableHeightPt",
    "Columns-flow first-page height must fit the page body",
    columnsId,
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "columns-flow-start-page-index-invalid",
    "startPageIndex",
    "Columns-flow start page index must be non-negative",
    columnsId,
  ))
  if (!Number.isInteger(input.maximumPageCount)
    || input.maximumPageCount <= 0
    || input.maximumPageCount > 10_000) issues.push(issue(
    "columns-flow-page-limit-invalid",
    "maximumPageCount",
    "Columns-flow maximum page count must be between 1 and 10,000",
    columnsId,
  ))
  issues.push(...validateCursor(cursorBefore, columnsId, sourceFingerprint))
  if (cursorBefore.complete) issues.push(issue(
    "columns-flow-cursor-already-complete",
    "cursor.complete",
    "Columns-flow cannot paginate after its terminal fragment is committed",
    columnsId,
  ))
  if (issues.length > 0) return blocked({
    columnsId,
    sourceFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    maximumPageCount: input.maximumPageCount,
    cursorBefore,
    work,
    issues,
  })

  let cursor = clone(cursorBefore)
  const pages: VNextColumnsFlowV4PageCheckpoint[] = []
  while (!cursor.complete && pages.length < input.maximumPageCount) {
    const availableHeightPt = pages.length === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    const plan = planVNextColumnsV4NestedPage({
      input: input.columns,
      cursor: cursor.state,
      availableHeightPt,
      pageBodyHeightPt: input.pageBodyHeightPt,
      pageIndex: cursor.nextPageIndex,
      depth: 1,
      work,
    })
    work.pageAttemptCount += 1
    if (plan.status === "blocked") return blocked({
      columnsId,
      sourceFingerprint,
      pageBodyHeightPt: input.pageBodyHeightPt,
      firstPageAvailableHeightPt,
      maximumPageCount: input.maximumPageCount,
      cursorBefore,
      work,
      issues: plan.issues,
    })

    const stateProgressed = !exact(cursor.state, plan.cursorAfter)
    if (!stateProgressed && !plan.page.complete) {
      work.zeroProgressPageAdvanceCount += 1
      if (pages.length === 0
        && plan.needsFreshPage
        && firstPageAvailableHeightPt < input.pageBodyHeightPt) return finalize({
        source: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE,
        contractVersion: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION,
        status: "fresh-page-required" as const,
        columnsId,
        sourceFingerprint,
        pageBodyHeightPt: input.pageBodyHeightPt,
        firstPageAvailableHeightPt,
        maximumPageCount: input.maximumPageCount,
        cursorBefore,
        cursorAfter: clone(cursorBefore),
        pages: [] as [],
        work,
        contracts: contracts(),
        issues: [] as [],
      })
      return blocked({
        columnsId,
        sourceFingerprint,
        pageBodyHeightPt: input.pageBodyHeightPt,
        firstPageAvailableHeightPt,
        maximumPageCount: input.maximumPageCount,
        cursorBefore,
        work,
        issues: [issue(
          "columns-flow-window-no-progress",
          "cursor",
          "Columns-flow page planning made no committable progress",
          columnsId,
        )],
      })
    }

    const nextCursor: VNextColumnsFlowV4PaginationCursor = {
      ...clone(cursor),
      nextPageIndex: cursor.nextPageIndex + 1,
      nextFragmentIndex: cursor.nextFragmentIndex + 1,
      terminalFragmentCommitted: plan.page.complete,
      complete: plan.page.complete,
      state: clone(plan.cursorAfter),
    }
    const checkpointFacts = {
      cursorBefore: clone(cursor),
      cursorAfter: clone(nextCursor),
      page: clone(plan.page),
    }
    pages.push({ ...checkpointFacts, fingerprint: compact(checkpointFacts) })
    cursor = nextCursor
  }

  return finalize({
    source: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE,
    contractVersion: VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION,
    status: cursor.complete ? "complete" as const : "partial" as const,
    columnsId,
    sourceFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    maximumPageCount: input.maximumPageCount,
    cursorBefore,
    cursorAfter: cursor,
    pages,
    work,
    contracts: contracts(),
    issues: [] as [],
  })
}
