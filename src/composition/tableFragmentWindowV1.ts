import {
  hasValidVNextTableFlowV4CursorFingerprint,
  hasValidVNextTableFlowV4PageCheckpointFingerprint,
  hasValidVNextTableFlowV4WindowPaginationFingerprint,
  VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE,
  VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION,
  type VNextTableFlowV4CumulativeWork,
  type VNextTableFlowV4PageCheckpoint,
  type VNextTableFlowV4PaginationCursor,
  type VNextTableFlowV4WindowPaginationResult,
} from "../table/tableFlowV4WindowPagination.js"
import {
  finalizeVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
} from "./fragmentWindowV1.js"

export const VNEXT_TABLE_COMPOSITION_WINDOW_SOURCE = "vnext-table-composition-window"
export const VNEXT_TABLE_COMPOSITION_WINDOW_VERSION = 1 as const

export interface VNextTableCompositionWindowContextV1 {
  documentId: string
  sectionId: string
  zoneId: string
  sourceOrder: number
  documentStructureFingerprint: string
  resolvedProjectionFingerprint: string
  familySourceFingerprint: string
}

function issue(code: string, path: string, message: string): VNextCompositionFragmentWindowIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(issues: VNextCompositionFragmentWindowIssueV1[]): VNextCompositionFragmentWindowResultV1 {
  return { status: "blocked", window: null, issues }
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function cursorRef(cursor: VNextTableFlowV4PaginationCursor): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: VNEXT_TABLE_COMPOSITION_WINDOW_VERSION,
    kind: "composition-family-cursor-ref",
    family: "table-flow",
    rootNodeId: cursor.tableId,
    ownerFingerprint: cursor.sourceFingerprint,
    stateFingerprint: cursor.fingerprint,
    complete: cursor.complete,
  }
}

function validateCursor(
  cursor: VNextTableFlowV4PaginationCursor,
  pagination: VNextTableFlowV4WindowPaginationResult,
  path: string,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  if (cursor.contractVersion !== VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION
    || cursor.kind !== "table-flow-pagination-cursor"
    || cursor.tableId !== pagination.tableId
    || cursor.sourceFingerprint !== pagination.sourceFingerprint
    || cursor.profileFingerprint !== pagination.profileFingerprint
    || cursor.state.tableId !== pagination.tableId) issues.push(issue(
    "table-composition-cursor-owner-mismatch",
    path,
    "Table composition cursor must pin the exact v1 root, source, profile, and state",
  ))
  if (!hasValidVNextTableFlowV4CursorFingerprint(cursor)) issues.push(issue(
    "table-composition-cursor-fingerprint-mismatch",
    `${path}.fingerprint`,
    "Table composition cursor facts do not match their retained fingerprint",
  ))
  if (!Number.isInteger(cursor.nextPageIndex) || cursor.nextPageIndex < 0
    || !Number.isInteger(cursor.nextFragmentIndex) || cursor.nextFragmentIndex < 0
    || cursor.nextPageIndex < cursor.nextFragmentIndex) issues.push(issue(
    "table-composition-cursor-index-invalid",
    path,
    "Table composition page and fragment indexes must be ordered non-negative integers",
  ))
  if (cursor.complete !== (cursor.state.complete && cursor.terminalFragmentCommitted)
    || (cursor.terminalFragmentCommitted && cursor.nextFragmentIndex === 0)) issues.push(issue(
    "table-composition-cursor-completion-mismatch",
    `${path}.complete`,
    "Table composition completion must match Table state and terminal fragment truth",
  ))
}

function checkpointDelta(checkpoint: VNextTableFlowV4PageCheckpoint): VNextTableFlowV4CumulativeWork {
  return {
    pageAttemptCount: 1,
    rowPlanCount: checkpoint.work.rowPlanCount,
    cellPlanCount: checkpoint.work.cellPlanCount,
    checkpointLookupCount: checkpoint.work.checkpointLookupCount,
    consumedCandidateCount: checkpoint.work.consumedCandidateCount,
    freshPageAdvanceCount: checkpoint.work.freshPageAdvanceCount,
    repeatedHeaderRowPlanCount: checkpoint.work.repeatedHeaderRowPlanCount,
  }
}

function addWork(left: VNextTableFlowV4CumulativeWork, right: VNextTableFlowV4CumulativeWork): VNextTableFlowV4CumulativeWork {
  return Object.fromEntries(Object.keys(left).map((key) => [
    key,
    left[key as keyof VNextTableFlowV4CumulativeWork] + right[key as keyof VNextTableFlowV4CumulativeWork],
  ])) as unknown as VNextTableFlowV4CumulativeWork
}

function sumCheckpointWork(pages: VNextTableFlowV4PageCheckpoint[]): VNextTableFlowV4CumulativeWork {
  return pages.reduce((total, checkpoint) => addWork(total, checkpointDelta(checkpoint)), {
    pageAttemptCount: 0,
    rowPlanCount: 0,
    cellPlanCount: 0,
    checkpointLookupCount: 0,
    consumedCandidateCount: 0,
    freshPageAdvanceCount: 0,
    repeatedHeaderRowPlanCount: 0,
  })
}

function validatePageRows(
  checkpoint: VNextTableFlowV4PageCheckpoint,
  path: string,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  const rows = checkpoint.page.rows
  let expectedY = 0
  let bodyStarted = false
  let expectedRowIndex = checkpoint.cursorBefore.state.rowIndex
  let expectedFragmentIndex = checkpoint.cursorBefore.state.activeRow?.fragmentIndex ?? 0
  let incompleteRowIndex: number | null = null
  let completedRowCount = 0
  let repeatedHeaderCount = 0
  const fragmentIds = new Set<string>()
  for (const [rowPosition, row] of rows.entries()) {
    if (fragmentIds.has(row.fragmentId)) issues.push(issue(
      "table-composition-row-fragment-duplicate",
      `${path}.page.rows[${rowPosition}].fragmentId`,
      "Table page row fragment ids must be unique",
    ))
    fragmentIds.add(row.fragmentId)
    if (!near(row.yOffsetPt, expectedY)) issues.push(issue(
      "table-composition-row-stack-drift",
      `${path}.page.rows[${rowPosition}].yOffsetPt`,
      "Table row fragments must form one contiguous vertical stack",
    ))
    expectedY += row.heightPt
    if (row.repeatedHeader) {
      repeatedHeaderCount += 1
      if (bodyStarted
        || row.rowKind !== "authored"
        || row.rowRole !== "header"
        || !row.complete
        || row.rowFragmentIndex !== 0) issues.push(issue(
        "table-composition-repeated-header-invalid",
        `${path}.page.rows[${rowPosition}]`,
        "repeated headers must be complete authored header fragments at the start of a page",
      ))
      continue
    }
    bodyStarted = true
    if (incompleteRowIndex != null) issues.push(issue(
      "table-composition-row-after-split-invalid",
      `${path}.page.rows[${rowPosition}]`,
      "an incomplete split row must be the final body fragment on its page",
    ))
    if (row.rowIndex !== expectedRowIndex || row.rowFragmentIndex !== expectedFragmentIndex) issues.push(issue(
      "table-composition-row-cursor-drift",
      `${path}.page.rows[${rowPosition}]`,
      "Table body row and fragment indexes must follow the cursor-before state",
    ))
    if (row.complete) {
      completedRowCount += 1
      expectedRowIndex += 1
      expectedFragmentIndex = 0
    } else {
      incompleteRowIndex = row.rowIndex
      expectedFragmentIndex = row.rowFragmentIndex + 1
    }
  }
  if (!near(expectedY, checkpoint.page.usedHeightPt)) issues.push(issue(
    "table-composition-row-stack-height-drift",
    `${path}.page.usedHeightPt`,
    "Table used page height must equal the retained row stack height",
  ))
  if (expectedRowIndex !== checkpoint.cursorAfter.state.rowIndex) issues.push(issue(
    "table-composition-row-cursor-after-drift",
    `${path}.cursorAfter.state.rowIndex`,
    "Table cursor-after row index must equal retained body-row progress",
  ))
  const activeAfter = checkpoint.cursorAfter.state.activeRow
  if ((incompleteRowIndex == null && activeAfter != null)
    || (incompleteRowIndex != null && (activeAfter == null
      || activeAfter.rowIndex !== incompleteRowIndex
      || activeAfter.fragmentIndex !== expectedFragmentIndex))) issues.push(issue(
    "table-composition-split-cursor-after-drift",
    `${path}.cursorAfter.state.activeRow`,
    "Table active row cursor must match the final incomplete row fragment",
  ))
  if (checkpoint.work.completedRowCount !== completedRowCount
    || checkpoint.work.splitRowIndex !== incompleteRowIndex
    || checkpoint.work.repeatedHeaderFragmentCount !== repeatedHeaderCount
    || checkpoint.work.repeatedHeaderRowPlanCount !== repeatedHeaderCount
    || checkpoint.work.rowPlanCount !== rows.length + checkpoint.work.freshPageAdvanceCount) issues.push(issue(
    "table-composition-row-work-drift",
    `${path}.work`,
    "Table row, split, repeated-header, fresh, and row-plan work must agree",
  ))
  const retainedCellPlanCount = rows.reduce((total, row) => total + row.cells.length, 0)
  if (checkpoint.work.cellPlanCount < retainedCellPlanCount) issues.push(issue(
    "table-composition-cell-work-drift",
    `${path}.work.cellPlanCount`,
    "Table cell-plan work must cover every retained row cell fragment",
  ))
}

function validateCheckpoint(
  checkpoint: VNextTableFlowV4PageCheckpoint,
  index: number,
  expectedBefore: VNextTableFlowV4PaginationCursor,
  expectedAvailableHeightPt: number,
  pagination: VNextTableFlowV4WindowPaginationResult,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  const path = `pagination.pages[${index}]`
  if (!hasValidVNextTableFlowV4PageCheckpointFingerprint(checkpoint)) issues.push(issue(
    "table-composition-page-fingerprint-mismatch",
    `${path}.fingerprint`,
    "Table page checkpoint facts do not match their retained fingerprint",
  ))
  validateCursor(checkpoint.cursorBefore, pagination, `${path}.cursorBefore`, issues)
  validateCursor(checkpoint.cursorAfter, pagination, `${path}.cursorAfter`, issues)
  if (!exact(checkpoint.cursorBefore, expectedBefore)
    || checkpoint.page.pageIndex !== checkpoint.cursorBefore.nextPageIndex
    || checkpoint.cursorAfter.nextPageIndex !== checkpoint.cursorBefore.nextPageIndex + 1
    || checkpoint.cursorAfter.nextFragmentIndex !== checkpoint.cursorBefore.nextFragmentIndex + 1) issues.push(issue(
    "table-composition-page-cursor-chain-broken",
    path,
    "Table checkpoints must form one exact progressing page and fragment cursor chain",
  ))
  if (!exact(checkpoint.cursorAfter.cumulativeWork, addWork(checkpoint.cursorBefore.cumulativeWork, checkpointDelta(checkpoint)))) issues.push(issue(
    "table-composition-page-work-drift",
    `${path}.work`,
    "Table checkpoint work must equal the exact cumulative cursor delta",
  ))
  if (!near(checkpoint.page.bodyHeightPt, pagination.pageBodyHeightPt)
    || !near(checkpoint.page.availableHeightPt, expectedAvailableHeightPt)
    || !near(checkpoint.page.usedHeightPt + checkpoint.page.remainingHeightPt, expectedAvailableHeightPt)
    || checkpoint.page.remainingHeightPt < 0) issues.push(issue(
    "table-composition-page-height-drift",
    `${path}.page`,
    "Table page body, available, used, and remaining heights must agree",
  ))
  if (checkpoint.page.usedHeightPt <= 0 || checkpoint.page.rows.length === 0) issues.push(issue(
    "table-composition-zero-extent-unsupported",
    `${path}.page`,
    "Table common placement requires positive extent and retained row fragments",
  ))
  if (checkpoint.page.rows.some((row) => !Number.isFinite(row.yOffsetPt)
    || !Number.isFinite(row.heightPt)
    || row.yOffsetPt < 0
    || row.heightPt < 0
    || row.yOffsetPt + row.heightPt > checkpoint.page.usedHeightPt + 0.01)) issues.push(issue(
    "table-composition-row-geometry-invalid",
    `${path}.page.rows`,
    "Table row fragments must remain within positive page geometry",
  ))
  validatePageRows(checkpoint, path, issues)
  if (checkpoint.cursorAfter.state.complete !== checkpoint.cursorAfter.complete
    || checkpoint.cursorAfter.terminalFragmentCommitted !== checkpoint.cursorAfter.complete) issues.push(issue(
    "table-composition-page-completion-drift",
    path,
    "Table page checkpoint and terminal cursor completion must agree",
  ))
}

function validateAccepted(
  pagination: Extract<VNextTableFlowV4WindowPaginationResult, { status: "complete" | "partial" }>,
): VNextCompositionFragmentWindowIssueV1[] {
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (pagination.pages.length === 0) issues.push(issue(
    "table-composition-empty-window-unsupported",
    "pagination.pages",
    "accepted Table composition requires at least one page checkpoint",
  ))
  pagination.pages.forEach((checkpoint, index) => validateCheckpoint(
    checkpoint,
    index,
    index === 0 ? pagination.cursorBefore : pagination.pages[index - 1].cursorAfter,
    index === 0 ? pagination.firstPageAvailableHeightPt : pagination.pageBodyHeightPt,
    pagination,
    issues,
  ))
  if (!exact(pagination.pages.at(-1)?.cursorAfter, pagination.cursorAfter)) issues.push(issue(
    "table-composition-final-cursor-mismatch",
    "pagination.cursorAfter",
    "Table final cursor must equal the final page checkpoint cursor",
  ))
  if (!exact(sumCheckpointWork(pagination.pages), pagination.work)) issues.push(issue(
    "table-composition-window-work-drift",
    "pagination.work",
    "Table window work must equal the sum of retained page checkpoint work",
  ))
  if ((pagination.status === "complete") !== pagination.cursorAfter.complete) issues.push(issue(
    "table-composition-status-completion-mismatch",
    "pagination.status",
    "Table result status and final cursor completion must agree",
  ))
  return issues
}

export function createVNextTableCompositionWindowV1(input: {
  pagination: VNextTableFlowV4WindowPaginationResult
  context: VNextTableCompositionWindowContextV1
}): VNextCompositionFragmentWindowResultV1 {
  const { pagination, context } = input
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (pagination.source !== VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_SOURCE
    || pagination.contractVersion !== VNEXT_TABLE_FLOW_V4_WINDOW_PAGINATION_VERSION) issues.push(issue(
    "table-composition-pagination-contract-mismatch",
    "pagination",
    "Table adapter requires the exact v1 bounded pagination contract",
  ))
  if (!hasValidVNextTableFlowV4WindowPaginationFingerprint(pagination)) issues.push(issue(
    "table-composition-pagination-fingerprint-mismatch",
    "pagination.fingerprint",
    "Table pagination facts do not match their retained fingerprint",
  ))
  validateCursor(pagination.cursorBefore, pagination, "pagination.cursorBefore", issues)
  if (pagination.cursorAfter != null) validateCursor(pagination.cursorAfter, pagination, "pagination.cursorAfter", issues)
  if (issues.length > 0) return blocked(issues)

  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: "table-flow" as const,
    documentId: context.documentId,
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    rootNodeId: pagination.tableId,
    rootNodeType: "table" as const,
    sourceOrder: context.sourceOrder,
    ownerPins: {
      documentStructure: context.documentStructureFingerprint,
      resolvedProjection: context.resolvedProjectionFingerprint,
      familySource: context.familySourceFingerprint,
      measurement: pagination.sourceFingerprint,
      pagination: pagination.fingerprint,
    },
    capacity: {
      pageBodyHeightPt: pagination.pageBodyHeightPt,
      firstPageAvailableHeightPt: pagination.firstPageAvailableHeightPt,
      maximumPageCount: pagination.maximumPageCount,
      maximumFragmentCount: pagination.maximumPageCount,
    },
    cursorBefore: cursorRef(pagination.cursorBefore),
  }

  if (pagination.status === "blocked") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "blocked",
    cursorAfter: null,
    pages: null,
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: pagination.issues.map((item) => ({ code: item.code, severity: "error" as const, path: item.path, message: item.message })),
  })
  if (pagination.status === "fresh-page-required") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "fresh-page-required",
    cursorAfter: cursorRef(pagination.cursorAfter),
    pages: [],
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: [],
  })

  const acceptedIssues = validateAccepted(pagination)
  if (acceptedIssues.length > 0) return blocked(acceptedIssues)
  const pages = pagination.pages.map((checkpoint, windowPageIndex) => ({
    windowPageIndex,
    flowEffect: "place-content" as const,
    availableHeightPt: checkpoint.page.availableHeightPt,
    usedHeightPt: checkpoint.page.usedHeightPt,
    remainingHeightPt: checkpoint.page.remainingHeightPt,
    cursorBefore: cursorRef(checkpoint.cursorBefore),
    cursorAfter: cursorRef(checkpoint.cursorAfter),
    fragments: [{
      fragmentId: JSON.stringify([pagination.tableId, "page", checkpoint.page.pageIndex]),
      fragmentIndex: checkpoint.cursorBefore.nextFragmentIndex,
      sourceNodeId: pagination.tableId,
      blockOffsetPt: 0,
      blockExtentPt: checkpoint.page.usedHeightPt,
      continuation: {
        fromPrevious: checkpoint.cursorBefore.nextFragmentIndex > 0,
        toNext: !checkpoint.cursorAfter.complete,
      },
      familyEvidenceFingerprint: checkpoint.fingerprint,
      heading: null,
    }],
  }))
  return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: pagination.status,
    cursorAfter: cursorRef(pagination.cursorAfter),
    pages,
    work: { pageCount: pages.length, fragmentCount: pages.length, cursorCommitCount: pages.length },
    issues: [],
  })
}
