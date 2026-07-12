import type { VNextTablePreparedCellV1 } from "./tablePreparedCellContractV1.js"
import {
  VNEXT_TABLE_CELL_PAGINATION_SOURCE,
  VNEXT_TABLE_CELL_PAGINATION_VERSION,
  VNextTableCellCursorV1Schema,
  type VNextTableCellCandidatePlacementV1,
  type VNextTableCellCursorIdentityV1,
  type VNextTableCellCursorV1,
  type VNextTableCellPaginationIssueV1,
  type VNextTableCellPlanResultV1,
} from "./tableCellPaginationContractV1.js"

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
  sourceCellId: string,
  candidateId?: string,
): VNextTableCellPaginationIssueV1 {
  return { code, path, message, severity: "error", sourceCellId, ...(candidateId == null ? {} : { candidateId }) }
}

function sameIdentity(left: VNextTableCellCursorIdentityV1, right: VNextTableCellCursorIdentityV1): boolean {
  if (left.kind !== right.kind) return false
  return left.kind === "resolved-cell"
    ? left.cellInstanceId === (right as Extract<VNextTableCellCursorIdentityV1, { kind: "resolved-cell" }>).cellInstanceId
    : left.sourceCellId === (right as Extract<VNextTableCellCursorIdentityV1, { kind: "authored-cell" }>).sourceCellId
}

export function createInitialVNextTableCellCursorV1(cell: VNextTablePreparedCellV1): VNextTableCellCursorV1 {
  return {
    contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
    kind: "table-cell-cursor",
    sourceCellId: cell.sourceCellId,
    cellIdentity: clone(cell.cellIdentity),
    candidateIndex: 0,
    complete: false,
  }
}

function blocked(
  cell: VNextTablePreparedCellV1,
  cursorBefore: VNextTableCellCursorV1,
  issues: VNextTableCellPaginationIssueV1[],
): VNextTableCellPlanResultV1 {
  return {
    source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
    status: "blocked",
    sourceCellId: cell.sourceCellId,
    cursorBefore,
    cursorAfter: null,
    placements: null,
    issues,
  }
}

function maxContentEndIndex(
  cell: VNextTablePreparedCellV1,
  startIndex: number,
  availableContentHeightPt: number,
): number {
  const baseHeight = cell.prefixHeightsPt[startIndex]
  const limit = baseHeight + availableContentHeightPt + 1e-6
  let low = startIndex
  let high = cell.candidates.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (cell.prefixHeightsPt[middle] <= limit) low = middle
    else high = middle - 1
  }
  return low
}

export function planVNextTableCellV1(input: {
  cell: VNextTablePreparedCellV1
  availableHeightPt: number
  pageBodyHeightPt: number
  cursor?: VNextTableCellCursorV1
}): VNextTableCellPlanResultV1 {
  const cursorBefore = clone(input.cursor ?? createInitialVNextTableCellCursorV1(input.cell))
  const issues: VNextTableCellPaginationIssueV1[] = []
  if (!Number.isFinite(input.availableHeightPt) || input.availableHeightPt < 0) issues.push(issue(
    "invalid-available-height", "availableHeightPt", "available height must be finite and non-negative", input.cell.sourceCellId,
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be finite and positive", input.cell.sourceCellId,
  ))
  if (input.availableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "available-height-exceeds-page-body", "availableHeightPt", "available height cannot exceed page body height", input.cell.sourceCellId,
  ))
  const parsedCursor = VNextTableCellCursorV1Schema.safeParse(cursorBefore)
  if (!parsedCursor.success) issues.push(issue(
    "invalid-cell-cursor", "cursor", "cell cursor does not satisfy the strict v1 contract", input.cell.sourceCellId,
  ))
  if (
    cursorBefore.sourceCellId !== input.cell.sourceCellId
    || !sameIdentity(cursorBefore.cellIdentity, input.cell.cellIdentity)
  ) issues.push(issue(
    "cell-cursor-identity-mismatch", "cursor", "cell cursor identity does not match prepared cell", input.cell.sourceCellId,
  ))
  if (cursorBefore.candidateIndex > input.cell.candidates.length) issues.push(issue(
    "cell-cursor-out-of-bounds", "cursor.candidateIndex", "cell cursor candidate index exceeds prepared candidates", input.cell.sourceCellId,
  ))
  if (cursorBefore.complete && cursorBefore.candidateIndex !== input.cell.candidates.length) issues.push(issue(
    "complete-cell-cursor-index-mismatch", "cursor.complete", "complete cell cursor must point after the final candidate", input.cell.sourceCellId,
  ))
  if (!cursorBefore.complete && input.cell.candidates.length > 0
    && cursorBefore.candidateIndex === input.cell.candidates.length) issues.push(issue(
    "incomplete-cell-cursor-index-mismatch", "cursor.complete", "non-empty cell cursor at final boundary must be complete", input.cell.sourceCellId,
  ))
  if (issues.length > 0) return blocked(input.cell, cursorBefore, issues)

  if (cursorBefore.complete) return {
    source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
    status: "planned",
    sourceCellId: input.cell.sourceCellId,
    cursorBefore,
    cursorAfter: clone(cursorBefore),
    placements: [],
    usedHeightPt: 0,
    remainingHeightPt: roundPt(input.availableHeightPt),
    complete: true,
    progressed: false,
    needsFreshPage: false,
    continuationReason: "already-complete",
    work: { checkpointLookupCount: 0, consumedCandidateCount: 0 },
    issues: [],
  }

  const startIndex = cursorBefore.candidateIndex
  const topInsetPt = startIndex === 0 ? input.cell.insetsPt.top : 0
  if (input.cell.candidates.length === 0) {
    const requiredHeightPt = roundPt(topInsetPt + input.cell.insetsPt.bottom)
    if (requiredHeightPt > input.pageBodyHeightPt) return blocked(input.cell, cursorBefore, [issue(
      "empty-cell-insets-exceed-page-body",
      "cell.insetsPt",
      `empty cell boundary insets ${requiredHeightPt} exceed page body height`,
      input.cell.sourceCellId,
    )])
    if (requiredHeightPt > input.availableHeightPt) return {
      source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
      contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
      status: "planned",
      sourceCellId: input.cell.sourceCellId,
      cursorBefore,
      cursorAfter: clone(cursorBefore),
      placements: [],
      usedHeightPt: 0,
      remainingHeightPt: roundPt(input.availableHeightPt),
      complete: false,
      progressed: false,
      needsFreshPage: true,
      continuationReason: "fresh-page-required",
      work: { checkpointLookupCount: 0, consumedCandidateCount: 0 },
      issues: [],
    }
    const cursorAfter = { ...clone(cursorBefore), complete: true }
    return {
      source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
      contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
      status: "planned",
      sourceCellId: input.cell.sourceCellId,
      cursorBefore,
      cursorAfter,
      placements: [],
      usedHeightPt: requiredHeightPt,
      remainingHeightPt: roundPt(input.availableHeightPt - requiredHeightPt),
      complete: true,
      progressed: true,
      needsFreshPage: false,
      continuationReason: "complete",
      work: { checkpointLookupCount: 0, consumedCandidateCount: 0 },
      issues: [],
    }
  }

  const availableContentHeightPt = Math.max(0, input.availableHeightPt - topInsetPt)
  let endIndex = maxContentEndIndex(input.cell, startIndex, availableContentHeightPt)
  if (endIndex === input.cell.candidates.length) {
    const completeHeightPt = roundPt(
      topInsetPt
      + input.cell.prefixHeightsPt[endIndex]
      - input.cell.prefixHeightsPt[startIndex]
      + input.cell.insetsPt.bottom,
    )
    if (completeHeightPt > input.availableHeightPt) endIndex -= 1
  }
  if (endIndex === startIndex) {
    const candidate = input.cell.candidates[startIndex]
    const requiredFreshHeightPt = roundPt(
      topInsetPt
      + candidate.heightPt
      + (startIndex === input.cell.candidates.length - 1 ? input.cell.insetsPt.bottom : 0),
    )
    if (requiredFreshHeightPt > input.pageBodyHeightPt) return blocked(input.cell, cursorBefore, [issue(
      "cell-candidate-exceeds-page-body",
      `cell.candidates[${startIndex}]`,
      `candidate "${candidate.candidateId}" with required insets exceeds page body height`,
      input.cell.sourceCellId,
      candidate.candidateId,
    )])
    return {
      source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
      contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
      status: "planned",
      sourceCellId: input.cell.sourceCellId,
      cursorBefore,
      cursorAfter: clone(cursorBefore),
      placements: [],
      usedHeightPt: 0,
      remainingHeightPt: roundPt(input.availableHeightPt),
      complete: false,
      progressed: false,
      needsFreshPage: true,
      continuationReason: "fresh-page-required",
      work: { checkpointLookupCount: 1, consumedCandidateCount: 0 },
      issues: [],
    }
  }

  let yOffsetPt = topInsetPt
  const placements: VNextTableCellCandidatePlacementV1[] = []
  for (let index = startIndex; index < endIndex; index += 1) {
    const candidate = input.cell.candidates[index]
    placements.push({ candidate: clone(candidate), yOffsetPt })
    yOffsetPt = roundPt(yOffsetPt + candidate.heightPt)
  }
  const complete = endIndex === input.cell.candidates.length
  const usedHeightPt = roundPt(yOffsetPt + (complete ? input.cell.insetsPt.bottom : 0))
  const cursorAfter: VNextTableCellCursorV1 = {
    ...clone(cursorBefore),
    candidateIndex: endIndex,
    complete,
  }
  return {
    source: VNEXT_TABLE_CELL_PAGINATION_SOURCE,
    contractVersion: VNEXT_TABLE_CELL_PAGINATION_VERSION,
    status: "planned",
    sourceCellId: input.cell.sourceCellId,
    cursorBefore,
    cursorAfter,
    placements,
    usedHeightPt,
    remainingHeightPt: roundPt(input.availableHeightPt - usedHeightPt),
    complete,
    progressed: true,
    needsFreshPage: false,
    continuationReason: complete ? "complete" : "page-full",
    work: { checkpointLookupCount: 1, consumedCandidateCount: endIndex - startIndex },
    issues: [],
  }
}
