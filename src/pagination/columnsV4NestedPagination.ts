import {
  VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH,
} from "../schema/documentV4Structure.js"
import type {
  VNextColumnsV4ColumnCursor,
  VNextColumnsV4Cursor,
  VNextColumnsV4Geometry,
  VNextColumnsV4Issue,
} from "./columnsV4Contract.js"
import type {
  VNextColumnsV4ChildFragmentSource,
  VNextColumnsV4FragmentCandidate,
} from "./columnsV4Fragments.js"
import { planVNextColumnsV4Lane } from "./columnsV4LanePlanner.js"

export const VNEXT_COLUMNS_V4_NESTED_PAGINATION_SOURCE = "vnext-columns-v4-nested-pagination"
export const VNEXT_COLUMNS_V4_NESTED_PAGINATION_VERSION = 1 as const

export type VNextColumnsV4FlowItem =
  | {
      kind: "fragments"
      nodeId: string
      source: VNextColumnsV4ChildFragmentSource
    }
  | {
      kind: "columns"
      nodeId: string
      columns: VNextColumnsV4NestedInput
    }

export interface VNextColumnsV4NestedLaneInput {
  columnId: string
  items: VNextColumnsV4FlowItem[]
}

export interface VNextColumnsV4NestedInput {
  geometry: VNextColumnsV4Geometry
  lanes: VNextColumnsV4NestedLaneInput[]
  minimumHeightPt?: number
}

export type VNextColumnsV4NestedPlacement =
  | {
      kind: "fragment"
      childIndex: number
      yOffsetPt: number
      fragment: VNextColumnsV4FragmentCandidate
    }
  | {
      kind: "columns-fragment"
      childIndex: number
      yOffsetPt: number
      columnsId: string
      fragment: VNextColumnsV4NestedPageFragment
    }

export interface VNextColumnsV4NestedColumnFragment {
  columnId: string
  columnIndex: number
  xOffsetPt: number
  widthPt: number
  usedHeightPt: number
  complete: boolean
  placements: VNextColumnsV4NestedPlacement[]
}

export interface VNextColumnsV4NestedPageFragment {
  fragmentId: string
  signature: string
  columnsId: string
  columnsDepth: number
  pageIndex: number
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  complete: boolean
  columns: VNextColumnsV4NestedColumnFragment[]
}

export interface VNextColumnsV4NestedWorkFacts {
  pageAttemptCount: number
  lanePlanCount: number
  nestedPlanCount: number
  checkpointLookupCount: number
  consumedFragmentCount: number
  zeroProgressPageAdvanceCount: number
  maximumObservedDepth: number
}

export type VNextColumnsV4NestedPaginationResult =
  | {
      source: typeof VNEXT_COLUMNS_V4_NESTED_PAGINATION_SOURCE
      version: typeof VNEXT_COLUMNS_V4_NESTED_PAGINATION_VERSION
      status: "paginated"
      columnsId: string
      cursorBefore: VNextColumnsV4Cursor
      cursorAfter: VNextColumnsV4Cursor
      pages: VNextColumnsV4NestedPageFragment[]
      issues: []
      fingerprint: string
      workFacts: VNextColumnsV4NestedWorkFacts
      contracts: {
        authoredNodeMutation: false
        authoredIdentityAllocation: false
        measurementExecution: false
        maximumNestingDepth: typeof VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH
      }
    }
  | {
      source: typeof VNEXT_COLUMNS_V4_NESTED_PAGINATION_SOURCE
      version: typeof VNEXT_COLUMNS_V4_NESTED_PAGINATION_VERSION
      status: "blocked"
      columnsId: string
      cursorBefore: VNextColumnsV4Cursor
      cursorAfter: null
      pages: null
      issues: VNextColumnsV4Issue[]
    }

interface MutableWorkFacts extends VNextColumnsV4NestedWorkFacts {}

type LanePagePlan =
  | {
      status: "planned"
      cursorAfter: VNextColumnsV4ColumnCursor
      usedHeightPt: number
      complete: boolean
      needsFreshPage: boolean
      placements: VNextColumnsV4NestedPlacement[]
    }
  | { status: "blocked"; issues: VNextColumnsV4Issue[] }

export type VNextColumnsV4NestedPagePlan =
  | {
      status: "planned"
      cursorAfter: VNextColumnsV4Cursor
      page: VNextColumnsV4NestedPageFragment
      needsFreshPage: boolean
    }
  | { status: "blocked"; issues: VNextColumnsV4Issue[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string, columnsId: string): VNextColumnsV4Issue {
  return { code, path, message, severity: "error", columnsId }
}

function childNodeId(items: readonly VNextColumnsV4FlowItem[], index: number): string | null {
  return items[index]?.nodeId ?? null
}

function initialCursor(input: VNextColumnsV4NestedInput, depth: number): VNextColumnsV4Cursor {
  return {
    columnsId: input.geometry.columnsId,
    columnsDepth: depth,
    columns: input.lanes.map((lane) => ({
      columnId: lane.columnId,
      complete: lane.items.length === 0,
      child: {
        childIndex: 0,
        childNodeId: childNodeId(lane.items, 0),
        fragmentIndex: 0,
      },
    })),
  }
}

function sameCursor(left: VNextColumnsV4Cursor, right: VNextColumnsV4Cursor): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function validateInput(
  input: VNextColumnsV4NestedInput,
  cursor: VNextColumnsV4Cursor,
  depth: number,
): VNextColumnsV4Issue[] {
  const columnsId = input.geometry.columnsId
  const issues: VNextColumnsV4Issue[] = []
  if (depth > VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH) issues.push(issue(
    "columns-nesting-depth-exceeded",
    "columnsDepth",
    `columns "${columnsId}" exceeds nesting depth ${VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH}`,
    columnsId,
  ))
  if (cursor.columnsId !== columnsId || cursor.columnsDepth !== depth) issues.push(issue(
    "nested-cursor-owner-mismatch", "cursor", "nested cursor owner/depth does not match input", columnsId,
  ))
  if (input.lanes.length !== input.geometry.tracks.length || cursor.columns.length !== input.lanes.length) {
    issues.push(issue("nested-lane-count-mismatch", "lanes", "nested geometry, lanes, and cursor counts differ", columnsId))
  }
  input.geometry.tracks.forEach((track, index) => {
    if (input.lanes[index]?.columnId !== track.columnId || cursor.columns[index]?.columnId !== track.columnId) {
      issues.push(issue("nested-lane-order-mismatch", `lanes[${index}]`, "nested lane order must match geometry", columnsId))
    }
  })
  return issues
}

function planLanePage(input: {
  lane: VNextColumnsV4NestedLaneInput
  cursor: VNextColumnsV4ColumnCursor
  availableHeightPt: number
  pageBodyHeightPt: number
  pageIndex: number
  depth: number
  laneWidthPt: number
  work: MutableWorkFacts
}): LanePagePlan {
  const cursorBefore = clone(input.cursor)
  const cursorIssues: VNextColumnsV4Issue[] = []
  if (cursorBefore.columnId !== input.lane.columnId) cursorIssues.push(issue(
    "nested-lane-cursor-mismatch", "cursor.columnId", "nested lane cursor does not match lane", input.lane.columnId,
  ))
  if (!Number.isInteger(cursorBefore.child.childIndex) || cursorBefore.child.childIndex < 0
    || cursorBefore.child.childIndex > input.lane.items.length) cursorIssues.push(issue(
    "invalid-nested-child-cursor", "cursor.child.childIndex", "nested child cursor is outside item bounds", input.lane.columnId,
  ))
  const cursorItem = input.lane.items[cursorBefore.child.childIndex]
  if (cursorItem && cursorBefore.child.childNodeId !== cursorItem.nodeId) cursorIssues.push(issue(
    "nested-cursor-child-mismatch", "cursor.child.childNodeId", "nested cursor child id does not match item order", input.lane.columnId,
  ))
  if (cursorItem?.kind === "fragments"
    && (!Number.isInteger(cursorBefore.child.fragmentIndex) || cursorBefore.child.fragmentIndex < 0
      || cursorBefore.child.fragmentIndex > cursorItem.source.candidates.length)) cursorIssues.push(issue(
    "invalid-nested-fragment-cursor", "cursor.child.fragmentIndex", "nested fragment cursor is outside source bounds", input.lane.columnId,
  ))
  if (cursorItem?.kind === "fragments" && cursorBefore.child.nestedColumnsCursor != null) cursorIssues.push(issue(
    "unexpected-nested-cursor", "cursor.child.nestedColumnsCursor", "fragment item cannot retain a nested Columns cursor", input.lane.columnId,
  ))
  if (cursorIssues.length > 0) return { status: "blocked", issues: cursorIssues }
  let itemIndex = cursorBefore.child.childIndex
  let fragmentIndex = cursorBefore.child.fragmentIndex
  let nestedCursor = cursorBefore.child.nestedColumnsCursor == null
    ? undefined
    : clone(cursorBefore.child.nestedColumnsCursor)
  let usedHeightPt = 0
  let needsFreshPage = false
  const placements: VNextColumnsV4NestedPlacement[] = []

  while (itemIndex < input.lane.items.length) {
    const item = input.lane.items[itemIndex]
    const remainingHeightPt = roundPt(input.availableHeightPt - usedHeightPt)
    if (item.kind === "fragments") {
      const lanePlan = planVNextColumnsV4Lane({
        columnId: input.lane.columnId,
        sources: [item.source],
        availableHeightPt: remainingHeightPt,
        pageBodyHeightPt: input.pageBodyHeightPt,
        cursor: {
          columnId: input.lane.columnId,
          complete: false,
          child: { childIndex: 0, childNodeId: item.nodeId, fragmentIndex },
        },
      })
      if (lanePlan.status === "blocked") return { status: "blocked", issues: lanePlan.issues }
      input.work.checkpointLookupCount += lanePlan.workFacts.checkpointLookupCount
      input.work.consumedFragmentCount += lanePlan.workFacts.consumedFragmentCount
      lanePlan.placements.forEach((placement) => placements.push({
        kind: "fragment",
        childIndex: itemIndex,
        yOffsetPt: roundPt(usedHeightPt + placement.yOffsetPt),
        fragment: clone(placement),
      }))
      usedHeightPt = roundPt(usedHeightPt + lanePlan.usedHeightPt)
      if (lanePlan.complete) {
        itemIndex += 1
        fragmentIndex = 0
        nestedCursor = undefined
        continue
      }
      fragmentIndex = lanePlan.cursorAfter.child.fragmentIndex
      needsFreshPage = lanePlan.needsFreshPage
      break
    }

    input.work.nestedPlanCount += 1
    input.work.maximumObservedDepth = Math.max(input.work.maximumObservedDepth, input.depth + 1)
    if (Math.abs(item.columns.geometry.availableWidthPt - input.laneWidthPt) > 1e-6) {
      return { status: "blocked", issues: [issue(
        "nested-columns-width-mismatch",
        `items[${itemIndex}].columns.geometry.availableWidthPt`,
        `nested columns width ${item.columns.geometry.availableWidthPt} must equal parent track width ${input.laneWidthPt}`,
        item.columns.geometry.columnsId,
      )] }
    }
    const nestedBefore = nestedCursor ?? initialCursor(item.columns, input.depth + 1)
    const nested = planVNextColumnsV4NestedPage({
      input: item.columns,
      cursor: nestedBefore,
      availableHeightPt: remainingHeightPt,
      pageBodyHeightPt: input.pageBodyHeightPt,
      pageIndex: input.pageIndex,
      depth: input.depth + 1,
      work: input.work,
    })
    if (nested.status === "blocked") return nested
    if (nested.page.usedHeightPt > 0 || nested.page.complete) placements.push({
      kind: "columns-fragment",
      childIndex: itemIndex,
      yOffsetPt: usedHeightPt,
      columnsId: item.columns.geometry.columnsId,
      fragment: clone(nested.page),
    })
    usedHeightPt = roundPt(usedHeightPt + nested.page.usedHeightPt)
    if (nested.page.complete) {
      itemIndex += 1
      fragmentIndex = 0
      nestedCursor = undefined
      continue
    }
    nestedCursor = clone(nested.cursorAfter)
    needsFreshPage = true
    break
  }

  const complete = itemIndex >= input.lane.items.length
  return {
    status: "planned",
    cursorAfter: {
      columnId: input.lane.columnId,
      complete,
      child: {
        childIndex: itemIndex,
        childNodeId: childNodeId(input.lane.items, itemIndex),
        fragmentIndex,
        ...(nestedCursor == null ? {} : { nestedColumnsCursor: nestedCursor }),
      },
    },
    usedHeightPt,
    complete,
    needsFreshPage: complete ? false : needsFreshPage,
    placements,
  }
}

export function planVNextColumnsV4NestedPage(input: {
  input: VNextColumnsV4NestedInput
  cursor: VNextColumnsV4Cursor
  availableHeightPt: number
  pageBodyHeightPt: number
  pageIndex: number
  depth: number
  work: MutableWorkFacts
}): VNextColumnsV4NestedPagePlan {
  const columnsId = input.input.geometry.columnsId
  const validationIssues = validateInput(input.input, input.cursor, input.depth)
  if (validationIssues.length > 0) return { status: "blocked", issues: validationIssues }
  const snapshot = clone(input.cursor)
  input.work.lanePlanCount += input.input.lanes.length
  const lanePlans = input.input.lanes.map((lane, index) => planLanePage({
    lane,
    cursor: snapshot.columns[index],
    availableHeightPt: input.availableHeightPt,
    pageBodyHeightPt: input.pageBodyHeightPt,
    pageIndex: input.pageIndex,
    depth: input.depth,
    laneWidthPt: input.input.geometry.tracks[index].widthPt,
    work: input.work,
  }))
  const blockedLane = lanePlans.find((plan) => plan.status === "blocked")
  if (blockedLane?.status === "blocked") return blockedLane
  const accepted = lanePlans.map((plan) => {
    if (plan.status !== "planned") throw new Error("blocked nested lane escaped reconciliation")
    return plan
  })
  const cursorAfter: VNextColumnsV4Cursor = {
    columnsId,
    columnsDepth: input.depth,
    columns: accepted.map((plan) => clone(plan.cursorAfter)),
  }
  const complete = cursorAfter.columns.every((column) => column.complete)
  const usedHeightPt = Math.max(
    complete ? input.input.minimumHeightPt ?? 0 : 0,
    ...accepted.map((plan) => plan.usedHeightPt),
  )
  if (usedHeightPt > input.availableHeightPt) return { status: "blocked", issues: [issue(
    "nested-columns-height-exceeds-available",
    "minimumHeightPt",
    `nested columns "${columnsId}" requires ${usedHeightPt}pt but only ${input.availableHeightPt}pt is available`,
    columnsId,
  )] }
  const progressed = !sameCursor(snapshot, cursorAfter)
  const needsFreshPage = !complete && accepted.some((plan) => plan.needsFreshPage)
  if (!progressed && !complete && !(input.availableHeightPt < input.pageBodyHeightPt && needsFreshPage)) {
    return { status: "blocked", issues: [issue(
      "pagination-no-progress", "cursor", `nested columns "${columnsId}" made no progress`, columnsId,
    )] }
  }
  const columns = accepted.map((plan, index): VNextColumnsV4NestedColumnFragment => ({
    columnId: plan.cursorAfter.columnId,
    columnIndex: index,
    xOffsetPt: input.input.geometry.tracks[index].xOffsetPt,
    widthPt: input.input.geometry.tracks[index].widthPt,
    usedHeightPt: plan.usedHeightPt,
    complete: plan.complete,
    placements: clone(plan.placements),
  }))
  const signature = [
    columnsId,
    input.depth,
    input.availableHeightPt,
    usedHeightPt,
    complete,
    ...columns.flatMap((column) => [
      column.columnId,
      column.usedHeightPt,
      column.complete,
      ...column.placements.map((placement) => placement.kind === "fragment"
        ? `fragment:${placement.fragment.fragmentId}:${placement.yOffsetPt}`
        : `columns:${placement.columnsId}:${placement.yOffsetPt}:${placement.fragment.signature}`),
    ]),
  ].join(":")
  return {
    status: "planned",
    cursorAfter,
    needsFreshPage,
    page: {
      fragmentId: `${columnsId}:page-${input.pageIndex}:depth-${input.depth}`,
      signature,
      columnsId,
      columnsDepth: input.depth,
      pageIndex: input.pageIndex,
      availableHeightPt: input.availableHeightPt,
      usedHeightPt,
      remainingHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
      complete,
      columns,
    },
  }
}

function blocked(
  columnsId: string,
  cursorBefore: VNextColumnsV4Cursor,
  issues: VNextColumnsV4Issue[],
): VNextColumnsV4NestedPaginationResult {
  return {
    source: VNEXT_COLUMNS_V4_NESTED_PAGINATION_SOURCE,
    version: VNEXT_COLUMNS_V4_NESTED_PAGINATION_VERSION,
    status: "blocked",
    columnsId,
    cursorBefore,
    cursorAfter: null,
    pages: null,
    issues,
  }
}

function inputFingerprint(input: VNextColumnsV4NestedInput): string {
  return [
    input.geometry.fingerprint,
    input.minimumHeightPt ?? 0,
    ...input.lanes.flatMap((lane) => [
      lane.columnId,
      ...lane.items.map((item) => item.kind === "fragments"
        ? `${item.nodeId}:${item.source.fingerprint}`
        : `${item.nodeId}:{${inputFingerprint(item.columns)}}`),
    ]),
  ].join(":")
}

export function paginateVNextNestedColumnsV4(input: {
  columns: VNextColumnsV4NestedInput
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  maximumPageCount: number
  cursor?: VNextColumnsV4Cursor
}): VNextColumnsV4NestedPaginationResult {
  const columnsId = input.columns.geometry.columnsId
  const cursorBefore = clone(input.cursor ?? initialCursor(input.columns, 1))
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const startPageIndex = input.startPageIndex ?? 0
  const issues: VNextColumnsV4Issue[] = []
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be positive and finite", columnsId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt) || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height", "firstPageAvailableHeightPt", "first page height must fit page body", columnsId,
  ))
  if (!Number.isInteger(input.maximumPageCount) || input.maximumPageCount <= 0) issues.push(issue(
    "invalid-maximum-page-count", "maximumPageCount", "maximum page count must be positive", columnsId,
  ))
  issues.push(...validateInput(input.columns, cursorBefore, 1))
  if (issues.length > 0) return blocked(columnsId, cursorBefore, issues)

  const work: MutableWorkFacts = {
    pageAttemptCount: 0,
    lanePlanCount: 0,
    nestedPlanCount: 0,
    checkpointLookupCount: 0,
    consumedFragmentCount: 0,
    zeroProgressPageAdvanceCount: 0,
    maximumObservedDepth: 1,
  }
  let cursor = clone(cursorBefore)
  const pages: VNextColumnsV4NestedPageFragment[] = []
  while (!cursor.columns.every((column) => column.complete)) {
    if (work.pageAttemptCount >= input.maximumPageCount) return blocked(columnsId, cursorBefore, [issue(
      "columns-page-limit-exceeded", "maximumPageCount", "nested Columns exceeded maximum page attempts", columnsId,
    )])
    const availableHeightPt = work.pageAttemptCount === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    const page = planVNextColumnsV4NestedPage({
      input: input.columns,
      cursor,
      availableHeightPt,
      pageBodyHeightPt: input.pageBodyHeightPt,
      pageIndex: startPageIndex + pages.length,
      depth: 1,
      work,
    })
    work.pageAttemptCount += 1
    if (page.status === "blocked") return blocked(columnsId, cursorBefore, page.issues)
    if (sameCursor(cursor, page.cursorAfter) && !page.page.complete) work.zeroProgressPageAdvanceCount += 1
    pages.push(page.page)
    cursor = page.cursorAfter
  }
  if (pages.length === 0) {
    const page = planVNextColumnsV4NestedPage({
      input: input.columns,
      cursor,
      availableHeightPt: firstPageAvailableHeightPt,
      pageBodyHeightPt: input.pageBodyHeightPt,
      pageIndex: startPageIndex,
      depth: 1,
      work,
    })
    if (page.status === "blocked") return blocked(columnsId, cursorBefore, page.issues)
    pages.push(page.page)
  }
  return {
    source: VNEXT_COLUMNS_V4_NESTED_PAGINATION_SOURCE,
    version: VNEXT_COLUMNS_V4_NESTED_PAGINATION_VERSION,
    status: "paginated",
    columnsId,
    cursorBefore,
    cursorAfter: cursor,
    pages,
    issues: [],
    fingerprint: [inputFingerprint(input.columns), input.pageBodyHeightPt, firstPageAvailableHeightPt].join(":"),
    workFacts: work,
    contracts: {
      authoredNodeMutation: false,
      authoredIdentityAllocation: false,
      measurementExecution: false,
      maximumNestingDepth: VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH,
    },
  }
}
