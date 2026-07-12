import type {
  VNextColumnsV4Cursor,
  VNextColumnsV4Geometry,
  VNextColumnsV4Issue,
} from "./columnsV4Contract.js"
import type { VNextColumnsV4ChildFragmentSource } from "./columnsV4Fragments.js"
import {
  planVNextColumnsV4Lane,
  type VNextColumnsV4LanePlacement,
  type VNextColumnsV4LaneWorkFacts,
} from "./columnsV4LanePlanner.js"

export const VNEXT_COLUMNS_V4_PAGINATION_SOURCE = "vnext-columns-v4-pagination"
export const VNEXT_COLUMNS_V4_PAGINATION_VERSION = 1 as const

export interface VNextColumnsV4LaneInput {
  columnId: string
  sources: VNextColumnsV4ChildFragmentSource[]
}

export interface VNextColumnsV4ColumnPageFragment {
  columnId: string
  columnIndex: number
  xOffsetPt: number
  widthPt: number
  usedHeightPt: number
  complete: boolean
  placements: VNextColumnsV4LanePlacement[]
}

export interface VNextColumnsV4PageFragment {
  fragmentId: string
  columnsId: string
  pageIndex: number
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  complete: boolean
  columns: VNextColumnsV4ColumnPageFragment[]
}

export interface VNextColumnsV4PaginationWorkFacts extends VNextColumnsV4LaneWorkFacts {
  pageAttemptCount: number
  lanePlanCount: number
  zeroProgressPageAdvanceCount: number
}

export type VNextColumnsV4PaginationResult =
  | {
      source: typeof VNEXT_COLUMNS_V4_PAGINATION_SOURCE
      version: typeof VNEXT_COLUMNS_V4_PAGINATION_VERSION
      status: "paginated"
      columnsId: string
      cursorBefore: VNextColumnsV4Cursor
      cursorAfter: VNextColumnsV4Cursor
      pages: VNextColumnsV4PageFragment[]
      fragments: VNextColumnsV4PageFragment[]
      fingerprint: string
      issues: []
      summary: {
        pageCount: number
        splitAcrossPages: boolean
        maximumFragmentHeightPt: number
      }
      workFacts: VNextColumnsV4PaginationWorkFacts
      contracts: {
        authoredNodeMutation: false
        authoredIdentityAllocation: false
        measurementExecution: false
        laneCursorCommit: "atomic"
      }
    }
  | {
      source: typeof VNEXT_COLUMNS_V4_PAGINATION_SOURCE
      version: typeof VNEXT_COLUMNS_V4_PAGINATION_VERSION
      status: "blocked"
      columnsId: string
      cursorBefore: VNextColumnsV4Cursor
      cursorAfter: null
      pages: null
      fragments: null
      issues: VNextColumnsV4Issue[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string, columnsId: string): VNextColumnsV4Issue {
  return { code, path, message, severity: "error", columnsId }
}

function initialCursor(
  columnsId: string,
  lanes: readonly VNextColumnsV4LaneInput[],
): VNextColumnsV4Cursor {
  return {
    columnsId,
    columnsDepth: 1,
    columns: lanes.map((lane) => ({
      columnId: lane.columnId,
      complete: lane.sources.length === 0,
      child: {
        childIndex: 0,
        childNodeId: lane.sources[0]?.nodeId ?? null,
        fragmentIndex: 0,
      },
    })),
  }
}

function blocked(
  columnsId: string,
  cursorBefore: VNextColumnsV4Cursor,
  issues: VNextColumnsV4Issue[],
): VNextColumnsV4PaginationResult {
  return {
    source: VNEXT_COLUMNS_V4_PAGINATION_SOURCE,
    version: VNEXT_COLUMNS_V4_PAGINATION_VERSION,
    status: "blocked",
    columnsId,
    cursorBefore,
    cursorAfter: null,
    pages: null,
    fragments: null,
    issues,
  }
}

function cursorProgressed(before: VNextColumnsV4Cursor, after: VNextColumnsV4Cursor): boolean {
  return before.columns.some((column, index) => {
    const next = after.columns[index]
    return next == null
      || column.complete !== next.complete
      || column.child.childIndex !== next.child.childIndex
      || column.child.fragmentIndex !== next.child.fragmentIndex
  })
}

export function paginateVNextColumnsV4(input: {
  geometry: VNextColumnsV4Geometry
  lanes: readonly VNextColumnsV4LaneInput[]
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  maximumPageCount: number
  minimumHeightPt?: number
  cursor?: VNextColumnsV4Cursor
}): VNextColumnsV4PaginationResult {
  const columnsId = input.geometry.columnsId
  const cursorBefore = clone(input.cursor ?? initialCursor(columnsId, input.lanes))
  const issues: VNextColumnsV4Issue[] = []
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const startPageIndex = input.startPageIndex ?? 0
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be positive and finite", columnsId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt) || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height", "firstPageAvailableHeightPt", "first page height must fit the page body", columnsId,
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "invalid-start-page-index", "startPageIndex", "start page index must be non-negative", columnsId,
  ))
  if (!Number.isInteger(input.maximumPageCount) || input.maximumPageCount <= 0) issues.push(issue(
    "invalid-maximum-page-count", "maximumPageCount", "maximum page count must be a positive integer", columnsId,
  ))
  if (input.minimumHeightPt != null && (!Number.isFinite(input.minimumHeightPt) || input.minimumHeightPt < 0)) {
    issues.push(issue("invalid-minimum-height", "minimumHeightPt", "minimum height must be finite and non-negative", columnsId))
  }
  if (input.minimumHeightPt != null && input.minimumHeightPt > input.pageBodyHeightPt) {
    issues.push(issue(
      "minimum-height-exceeds-page-body",
      "minimumHeightPt",
      "Columns minimum height cannot exceed the full page body height",
      columnsId,
    ))
  }
  if (cursorBefore.columnsId !== columnsId) issues.push(issue(
    "cursor-columns-mismatch", "cursor.columnsId", "cursor columns id does not match geometry", columnsId,
  ))
  if (cursorBefore.columns.length !== input.geometry.tracks.length
    || input.lanes.length !== input.geometry.tracks.length) issues.push(issue(
    "columns-lane-count-mismatch", "lanes", "geometry, lanes, and cursor must have equal track counts", columnsId,
  ))
  input.geometry.tracks.forEach((track, index) => {
    if (input.lanes[index]?.columnId !== track.columnId
      || cursorBefore.columns[index]?.columnId !== track.columnId) issues.push(issue(
      "columns-lane-order-mismatch",
      `lanes[${index}]`,
      `lane and cursor order must match geometry column "${track.columnId}"`,
      columnsId,
    ))
  })
  if (issues.length > 0) return blocked(columnsId, cursorBefore, issues)

  let cursor = clone(cursorBefore)
  let pageAttemptCount = 0
  let lanePlanCount = 0
  let zeroProgressPageAdvanceCount = 0
  let sourceCount = 0
  let checkpointLookupCount = 0
  let consumedFragmentCount = 0
  let consumedNodeCount = 0
  const pages: VNextColumnsV4PageFragment[] = []

  while (!cursor.columns.every((column) => column.complete)) {
    if (pageAttemptCount >= input.maximumPageCount) return blocked(columnsId, cursorBefore, [issue(
      "columns-page-limit-exceeded",
      "maximumPageCount",
      `columns pagination exceeded ${input.maximumPageCount} page attempts`,
      columnsId,
    )])
    const availableHeightPt = pageAttemptCount === 0
      ? firstPageAvailableHeightPt
      : input.pageBodyHeightPt
    const snapshot = clone(cursor)
    const lanePlans = input.lanes.map((lane, index) => planVNextColumnsV4Lane({
      columnId: lane.columnId,
      sources: lane.sources,
      availableHeightPt,
      pageBodyHeightPt: input.pageBodyHeightPt,
      cursor: snapshot.columns[index],
    }))
    pageAttemptCount += 1
    lanePlanCount += lanePlans.length
    const blockedLane = lanePlans.find((plan) => plan.status === "blocked")
    if (blockedLane?.status === "blocked") return blocked(columnsId, cursorBefore, blockedLane.issues)
    const accepted = lanePlans.map((plan) => {
      if (plan.status !== "planned") throw new Error("blocked lane escaped reconciliation")
      sourceCount += plan.workFacts.sourceCount
      checkpointLookupCount += plan.workFacts.checkpointLookupCount
      consumedFragmentCount += plan.workFacts.consumedFragmentCount
      consumedNodeCount += plan.workFacts.consumedNodeCount
      return plan
    })
    const nextCursor: VNextColumnsV4Cursor = {
      columnsId,
      columnsDepth: cursor.columnsDepth,
      columns: accepted.map((plan) => clone(plan.cursorAfter)),
    }
    const progressed = cursorProgressed(snapshot, nextCursor)
    const complete = nextCursor.columns.every((column) => column.complete)
    if (!progressed && !complete) {
      if (availableHeightPt < input.pageBodyHeightPt && accepted.some((plan) => plan.needsFreshPage)) {
        zeroProgressPageAdvanceCount += 1
      } else {
        return blocked(columnsId, cursorBefore, [issue(
          "pagination-no-progress", "cursor", "parallel Columns reconciliation made no progress", columnsId,
        )])
      }
    }
    const usedHeightPt = Math.max(
      complete && pages.length === 0 ? input.minimumHeightPt ?? 0 : 0,
      ...accepted.map((plan) => plan.usedHeightPt),
    )
    const pageIndex = startPageIndex + pages.length
    const columns = accepted.map((plan, index): VNextColumnsV4ColumnPageFragment => ({
      columnId: plan.columnId,
      columnIndex: index,
      xOffsetPt: input.geometry.tracks[index].xOffsetPt,
      widthPt: input.geometry.tracks[index].widthPt,
      usedHeightPt: plan.usedHeightPt,
      complete: plan.complete,
      placements: clone(plan.placements),
    }))
    pages.push({
      fragmentId: `${columnsId}:page-${pageIndex}`,
      columnsId,
      pageIndex,
      availableHeightPt,
      usedHeightPt: roundPt(usedHeightPt),
      remainingHeightPt: roundPt(availableHeightPt - usedHeightPt),
      complete,
      columns,
    })
    cursor = nextCursor
  }

  if (pages.length === 0) {
    const usedHeightPt = input.minimumHeightPt ?? 0
    pages.push({
      fragmentId: `${columnsId}:page-${startPageIndex}`,
      columnsId,
      pageIndex: startPageIndex,
      availableHeightPt: firstPageAvailableHeightPt,
      usedHeightPt,
      remainingHeightPt: roundPt(firstPageAvailableHeightPt - usedHeightPt),
      complete: true,
      columns: input.geometry.tracks.map((track, index) => ({
        columnId: track.columnId,
        columnIndex: index,
        xOffsetPt: track.xOffsetPt,
        widthPt: track.widthPt,
        usedHeightPt: 0,
        complete: true,
        placements: [],
      })),
    })
  }

  const fingerprint = [
    input.geometry.fingerprint,
    input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    input.minimumHeightPt ?? 0,
    ...input.lanes.flatMap((lane) => [lane.columnId, ...lane.sources.map((source) => source.fingerprint)]),
  ].join(":")
  return {
    source: VNEXT_COLUMNS_V4_PAGINATION_SOURCE,
    version: VNEXT_COLUMNS_V4_PAGINATION_VERSION,
    status: "paginated",
    columnsId,
    cursorBefore,
    cursorAfter: cursor,
    pages,
    fragments: clone(pages),
    fingerprint,
    issues: [],
    summary: {
      pageCount: pages.length,
      splitAcrossPages: pages.length > 1,
      maximumFragmentHeightPt: Math.max(...pages.map((page) => page.usedHeightPt)),
    },
    workFacts: {
      pageAttemptCount,
      lanePlanCount,
      zeroProgressPageAdvanceCount,
      sourceCount,
      checkpointLookupCount,
      consumedFragmentCount,
      consumedNodeCount,
    },
    contracts: {
      authoredNodeMutation: false,
      authoredIdentityAllocation: false,
      measurementExecution: false,
      laneCursorCommit: "atomic",
    },
  }
}
