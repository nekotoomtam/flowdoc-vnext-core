import type {
  VNextColumnsV4ChildCursor,
  VNextColumnsV4ColumnCursor,
  VNextColumnsV4Issue,
  VNextColumnsV4LegalCheckpoint,
} from "./columnsV4Contract.js"
import type {
  VNextColumnsV4ChildFragmentSource,
  VNextColumnsV4FragmentCandidate,
} from "./columnsV4Fragments.js"

export const VNEXT_COLUMNS_V4_LANE_PLANNER_SOURCE = "vnext-columns-v4-lane-planner"
export const VNEXT_COLUMNS_V4_LANE_PLANNER_VERSION = 1 as const

export interface VNextColumnsV4LanePlacement extends VNextColumnsV4FragmentCandidate {
  childIndex: number
  yOffsetPt: number
}

export interface VNextColumnsV4LaneWorkFacts {
  sourceCount: number
  checkpointLookupCount: number
  consumedFragmentCount: number
  consumedNodeCount: number
}

export type VNextColumnsV4LanePlanResult =
  | {
      source: typeof VNEXT_COLUMNS_V4_LANE_PLANNER_SOURCE
      version: typeof VNEXT_COLUMNS_V4_LANE_PLANNER_VERSION
      status: "planned"
      columnId: string
      cursorBefore: VNextColumnsV4ColumnCursor
      cursorAfter: VNextColumnsV4ColumnCursor
      placements: VNextColumnsV4LanePlacement[]
      checkpoints: VNextColumnsV4LegalCheckpoint[]
      usedHeightPt: number
      remainingHeightPt: number
      complete: boolean
      needsFreshPage: boolean
      continuationReason: "complete" | "keep-move-whole" | "page-full"
      issues: []
      workFacts: VNextColumnsV4LaneWorkFacts
    }
  | {
      source: typeof VNEXT_COLUMNS_V4_LANE_PLANNER_SOURCE
      version: typeof VNEXT_COLUMNS_V4_LANE_PLANNER_VERSION
      status: "blocked"
      columnId: string
      cursorBefore: VNextColumnsV4ColumnCursor
      cursorAfter: null
      placements: null
      checkpoints: null
      issues: VNextColumnsV4Issue[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string, columnId: string): VNextColumnsV4Issue {
  return { code, path, message, severity: "error", columnId }
}

function childCursor(
  sources: readonly VNextColumnsV4ChildFragmentSource[],
  childIndex: number,
  fragmentIndex: number,
): VNextColumnsV4ChildCursor {
  return {
    childIndex,
    childNodeId: sources[childIndex]?.nodeId ?? null,
    fragmentIndex,
  }
}

function initialCursor(
  columnId: string,
  sources: readonly VNextColumnsV4ChildFragmentSource[],
): VNextColumnsV4ColumnCursor {
  return {
    columnId,
    complete: sources.length === 0,
    child: childCursor(sources, 0, 0),
  }
}

function maxEndIndexForHeight(
  source: VNextColumnsV4ChildFragmentSource,
  startIndex: number,
  availableHeightPt: number,
): number {
  const baseHeight = source.prefixHeightsPt[startIndex]
  const limit = baseHeight + availableHeightPt + 1e-6
  let low = startIndex
  let high = source.candidates.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (source.prefixHeightsPt[middle] <= limit) low = middle
    else high = middle - 1
  }
  return low
}

function blocked(
  columnId: string,
  cursorBefore: VNextColumnsV4ColumnCursor,
  issues: VNextColumnsV4Issue[],
): VNextColumnsV4LanePlanResult {
  return {
    source: VNEXT_COLUMNS_V4_LANE_PLANNER_SOURCE,
    version: VNEXT_COLUMNS_V4_LANE_PLANNER_VERSION,
    status: "blocked",
    columnId,
    cursorBefore,
    cursorAfter: null,
    placements: null,
    checkpoints: null,
    issues,
  }
}

export function planVNextColumnsV4Lane(input: {
  columnId: string
  sources: readonly VNextColumnsV4ChildFragmentSource[]
  availableHeightPt: number
  pageBodyHeightPt: number
  cursor?: VNextColumnsV4ColumnCursor
}): VNextColumnsV4LanePlanResult {
  const cursorBefore = clone(input.cursor ?? initialCursor(input.columnId, input.sources))
  const issues: VNextColumnsV4Issue[] = []
  if (!Number.isFinite(input.availableHeightPt) || input.availableHeightPt < 0) issues.push(issue(
    "invalid-available-height", "availableHeightPt", "available height must be finite and non-negative", input.columnId,
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be finite and positive", input.columnId,
  ))
  if (input.availableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "available-height-exceeds-page-body", "availableHeightPt", "available height cannot exceed page body height", input.columnId,
  ))
  if (cursorBefore.columnId !== input.columnId) issues.push(issue(
    "cursor-column-mismatch", "cursor.columnId", "cursor column id does not match lane column id", input.columnId,
  ))
  const { childIndex, fragmentIndex } = cursorBefore.child
  if (!Number.isInteger(childIndex) || childIndex < 0 || childIndex > input.sources.length) issues.push(issue(
    "invalid-child-cursor", "cursor.child.childIndex", "child cursor index is outside source bounds", input.columnId,
  ))
  const activeSource = input.sources[childIndex]
  if (!Number.isInteger(fragmentIndex) || fragmentIndex < 0
    || (activeSource != null && fragmentIndex > activeSource.candidates.length)) issues.push(issue(
    "invalid-fragment-cursor", "cursor.child.fragmentIndex", "fragment cursor index is outside source bounds", input.columnId,
  ))
  if (activeSource && cursorBefore.child.childNodeId !== activeSource.nodeId) issues.push(issue(
    "cursor-child-mismatch", "cursor.child.childNodeId", "cursor child id does not match source order", input.columnId,
  ))
  if (issues.length > 0) return blocked(input.columnId, cursorBefore, issues)

  let nextChildIndex = childIndex
  let nextFragmentIndex = fragmentIndex
  let usedHeightPt = 0
  let consumedFragmentCount = 0
  let consumedNodeCount = 0
  let checkpointLookupCount = 0
  let continuationReason: "complete" | "keep-move-whole" | "page-full" = "complete"
  let needsFreshPage = false
  const placements: VNextColumnsV4LanePlacement[] = []
  const checkpoints: VNextColumnsV4LegalCheckpoint[] = [{
    checkpointIndex: 0,
    usedHeightPt: 0,
    cursor: childCursor(input.sources, nextChildIndex, nextFragmentIndex),
  }]

  while (nextChildIndex < input.sources.length) {
    const source = input.sources[nextChildIndex]
    if (nextFragmentIndex >= source.candidates.length) {
      nextChildIndex += 1
      nextFragmentIndex = 0
      consumedNodeCount += 1
      checkpoints.push({
        checkpointIndex: checkpoints.length,
        usedHeightPt,
        cursor: childCursor(input.sources, nextChildIndex, nextFragmentIndex),
      })
      continue
    }

    const remainingHeightPt = roundPt(input.availableHeightPt - usedHeightPt)
    const remainingSourceHeightPt = roundPt(
      source.totalHeightPt - source.prefixHeightsPt[nextFragmentIndex],
    )
    if (source.keepPolicy === "prefer-together" && nextFragmentIndex === 0
      && remainingSourceHeightPt <= input.pageBodyHeightPt
      && remainingSourceHeightPt > remainingHeightPt) {
      continuationReason = "keep-move-whole"
      needsFreshPage = true
      break
    }

    checkpointLookupCount += 1
    const endIndex = maxEndIndexForHeight(source, nextFragmentIndex, remainingHeightPt)
    if (endIndex === nextFragmentIndex) {
      const next = source.candidates[nextFragmentIndex]
      if (next.heightPt > input.pageBodyHeightPt) return blocked(input.columnId, cursorBefore, [issue(
        "fragment-exceeds-page-body",
        `sources[${nextChildIndex}].candidates[${nextFragmentIndex}].heightPt`,
        `fragment "${next.fragmentId}" exceeds page body height`,
        input.columnId,
      )])
      continuationReason = "page-full"
      needsFreshPage = true
      break
    }

    for (let index = nextFragmentIndex; index < endIndex; index += 1) {
      const candidate = source.candidates[index]
      placements.push({ ...clone(candidate), childIndex: nextChildIndex, yOffsetPt: usedHeightPt })
      usedHeightPt = roundPt(usedHeightPt + candidate.heightPt)
      consumedFragmentCount += 1
      nextFragmentIndex = index + 1
      checkpoints.push({
        checkpointIndex: checkpoints.length,
        usedHeightPt,
        cursor: childCursor(input.sources, nextChildIndex, nextFragmentIndex),
      })
    }

    if (nextFragmentIndex < source.candidates.length) {
      continuationReason = "page-full"
      break
    }
  }

  while (nextChildIndex < input.sources.length
    && nextFragmentIndex >= input.sources[nextChildIndex].candidates.length) {
    nextChildIndex += 1
    nextFragmentIndex = 0
    consumedNodeCount += 1
    checkpoints.push({
      checkpointIndex: checkpoints.length,
      usedHeightPt,
      cursor: childCursor(input.sources, nextChildIndex, nextFragmentIndex),
    })
  }
  const complete = nextChildIndex >= input.sources.length
  if (complete) {
    continuationReason = "complete"
    needsFreshPage = false
  }
  const cursorAfter: VNextColumnsV4ColumnCursor = {
    columnId: input.columnId,
    complete,
    child: childCursor(input.sources, nextChildIndex, nextFragmentIndex),
  }
  if (!complete && consumedFragmentCount === 0 && consumedNodeCount === 0 && !needsFreshPage) {
    return blocked(input.columnId, cursorBefore, [issue(
      "pagination-no-progress", "cursor", "lane planning made no progress", input.columnId,
    )])
  }

  return {
    source: VNEXT_COLUMNS_V4_LANE_PLANNER_SOURCE,
    version: VNEXT_COLUMNS_V4_LANE_PLANNER_VERSION,
    status: "planned",
    columnId: input.columnId,
    cursorBefore,
    cursorAfter,
    placements,
    checkpoints,
    usedHeightPt,
    remainingHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
    complete,
    needsFreshPage,
    continuationReason,
    issues: [],
    workFacts: {
      sourceCount: input.sources.length,
      checkpointLookupCount,
      consumedFragmentCount,
      consumedNodeCount,
    },
  }
}
