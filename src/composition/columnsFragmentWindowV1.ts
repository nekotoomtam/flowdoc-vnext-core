import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextColumnsFlowV4CursorFingerprint,
  hasValidVNextColumnsFlowV4WindowPaginationFingerprint,
  VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE,
  VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION,
  type VNextColumnsFlowV4PageCheckpoint,
  type VNextColumnsFlowV4PaginationCursor,
  type VNextColumnsFlowV4WindowPaginationResult,
} from "../pagination/columnsFlowV4WindowPagination.js"
import {
  finalizeVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
} from "./fragmentWindowV1.js"

export const VNEXT_COLUMNS_COMPOSITION_WINDOW_SOURCE = "vnext-columns-composition-window"
export const VNEXT_COLUMNS_COMPOSITION_WINDOW_VERSION = 1 as const

export interface VNextColumnsCompositionWindowContextV1 {
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

function compact(value: unknown): string {
  return createVNextCompactFingerprint(typeof value === "string" ? value : JSON.stringify(value))
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function cursorRef(cursor: VNextColumnsFlowV4PaginationCursor): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: VNEXT_COLUMNS_COMPOSITION_WINDOW_VERSION,
    kind: "composition-family-cursor-ref",
    family: "columns-flow",
    rootNodeId: cursor.columnsId,
    ownerFingerprint: cursor.sourceFingerprint,
    stateFingerprint: createVNextColumnsFlowV4CursorFingerprint(cursor),
    complete: cursor.complete,
  }
}

function hasValidCheckpointFingerprint(checkpoint: VNextColumnsFlowV4PageCheckpoint): boolean {
  const { fingerprint, ...facts } = checkpoint
  return fingerprint === compact(facts)
}

function validateCursor(
  cursor: VNextColumnsFlowV4PaginationCursor,
  pagination: VNextColumnsFlowV4WindowPaginationResult,
  path: string,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  if (cursor.contractVersion !== VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION
    || cursor.kind !== "columns-flow-pagination-cursor"
    || cursor.columnsId !== pagination.columnsId
    || cursor.sourceFingerprint !== pagination.sourceFingerprint
    || cursor.state.columnsId !== pagination.columnsId
    || cursor.state.columnsDepth !== 1) issues.push(issue(
    "columns-composition-cursor-owner-mismatch",
    path,
    "Columns composition cursor must pin the exact v1 root and source",
  ))
  const stateComplete = cursor.state.columns.every((column) => column.complete)
  if (cursor.complete !== (stateComplete && cursor.terminalFragmentCommitted)) issues.push(issue(
    "columns-composition-cursor-completion-mismatch",
    `${path}.complete`,
    "Columns composition cursor completion must match lane and terminal state",
  ))
  if ((stateComplete && !cursor.terminalFragmentCommitted && cursor.nextFragmentIndex !== 0)
    || (cursor.terminalFragmentCommitted && cursor.nextFragmentIndex === 0)) issues.push(issue(
    "columns-composition-cursor-terminal-index-invalid",
    `${path}.nextFragmentIndex`,
    "Columns terminal state and committed fragment index are inconsistent",
  ))
}

function validateAccepted(
  pagination: Extract<VNextColumnsFlowV4WindowPaginationResult, { status: "complete" | "partial" }>,
): VNextCompositionFragmentWindowIssueV1[] {
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (pagination.pages.length === 0) issues.push(issue(
    "columns-composition-empty-window-unsupported",
    "pagination.pages",
    "accepted Columns composition requires at least one positive page fragment",
  ))
  validateCursor(pagination.cursorBefore, pagination, "pagination.cursorBefore", issues)
  validateCursor(pagination.cursorAfter, pagination, "pagination.cursorAfter", issues)
  pagination.pages.forEach((checkpoint, index) => {
    const expectedBefore = index === 0 ? pagination.cursorBefore : pagination.pages[index - 1].cursorAfter
    const expectedAvailable = index === 0
      ? pagination.firstPageAvailableHeightPt
      : pagination.pageBodyHeightPt
    if (!hasValidCheckpointFingerprint(checkpoint)) issues.push(issue(
      "columns-composition-page-fingerprint-mismatch",
      `pagination.pages[${index}].fingerprint`,
      "Columns page checkpoint facts do not match their retained fingerprint",
    ))
    validateCursor(checkpoint.cursorBefore, pagination, `pagination.pages[${index}].cursorBefore`, issues)
    validateCursor(checkpoint.cursorAfter, pagination, `pagination.pages[${index}].cursorAfter`, issues)
    if (!exact(checkpoint.cursorBefore, expectedBefore)
      || checkpoint.page.pageIndex !== checkpoint.cursorBefore.nextPageIndex
      || checkpoint.cursorAfter.nextPageIndex !== checkpoint.cursorBefore.nextPageIndex + 1
      || checkpoint.cursorAfter.nextFragmentIndex !== checkpoint.cursorBefore.nextFragmentIndex + 1) issues.push(issue(
      "columns-composition-page-cursor-chain-broken",
      `pagination.pages[${index}]`,
      "Columns page checkpoints must form an exact progressing cursor chain",
    ))
    if (checkpoint.page.columnsId !== pagination.columnsId
      || checkpoint.page.columnsDepth !== 1) issues.push(issue(
      "columns-composition-page-owner-mismatch",
      `pagination.pages[${index}].page`,
      "Columns page must belong to the top-level pagination root",
    ))
    if (!near(checkpoint.page.availableHeightPt, expectedAvailable)
      || !near(checkpoint.page.usedHeightPt + checkpoint.page.remainingHeightPt, expectedAvailable)) issues.push(issue(
      "columns-composition-page-height-drift",
      `pagination.pages[${index}].page`,
      "Columns page capacity, used height, and remainder must agree",
    ))
    if (checkpoint.page.usedHeightPt <= 0) issues.push(issue(
      "columns-composition-zero-extent-unsupported",
      `pagination.pages[${index}].page.usedHeightPt`,
      "Columns common placement requires positive page extent",
    ))
    if (checkpoint.page.complete !== checkpoint.cursorAfter.complete
      || checkpoint.cursorAfter.terminalFragmentCommitted !== checkpoint.page.complete) issues.push(issue(
      "columns-composition-page-completion-drift",
      `pagination.pages[${index}]`,
      "Columns page and cursor terminal completion must agree",
    ))
  })
  if (!exact(pagination.pages.at(-1)?.cursorAfter, pagination.cursorAfter)) issues.push(issue(
    "columns-composition-final-cursor-mismatch",
    "pagination.cursorAfter",
    "Columns final cursor must equal the final page checkpoint",
  ))
  if ((pagination.status === "complete") !== pagination.cursorAfter.complete) issues.push(issue(
    "columns-composition-status-completion-mismatch",
    "pagination.status",
    "Columns result status and final cursor completion must agree",
  ))
  return issues
}

export function createVNextColumnsCompositionWindowV1(input: {
  pagination: VNextColumnsFlowV4WindowPaginationResult
  context: VNextColumnsCompositionWindowContextV1
}): VNextCompositionFragmentWindowResultV1 {
  const { pagination, context } = input
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (pagination.source !== VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_SOURCE
    || pagination.contractVersion !== VNEXT_COLUMNS_FLOW_V4_WINDOW_PAGINATION_VERSION) issues.push(issue(
    "columns-composition-pagination-contract-mismatch",
    "pagination",
    "Columns adapter requires the exact v1 bounded pagination contract",
  ))
  if (!hasValidVNextColumnsFlowV4WindowPaginationFingerprint(pagination)) issues.push(issue(
    "columns-composition-pagination-fingerprint-mismatch",
    "pagination.fingerprint",
    "Columns pagination facts do not match their retained fingerprint",
  ))
  validateCursor(pagination.cursorBefore, pagination, "pagination.cursorBefore", issues)
  if (pagination.cursorAfter != null) validateCursor(
    pagination.cursorAfter,
    pagination,
    "pagination.cursorAfter",
    issues,
  )
  if (issues.length > 0) return blocked(issues)

  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: "columns-flow" as const,
    documentId: context.documentId,
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    rootNodeId: pagination.columnsId,
    rootNodeType: "columns" as const,
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
    issues: pagination.issues.map((item) => ({
      code: item.code,
      severity: "error" as const,
      path: item.path,
      message: item.message,
    })),
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
      fragmentId: checkpoint.page.fragmentId,
      fragmentIndex: checkpoint.cursorBefore.nextFragmentIndex,
      sourceNodeId: pagination.columnsId,
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
    work: {
      pageCount: pages.length,
      fragmentCount: pages.length,
      cursorCommitCount: pages.length,
    },
    issues: [],
  })
}
