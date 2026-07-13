import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNEXT_TOC_V4_PAGINATION_SOURCE,
  VNEXT_TOC_V4_PAGINATION_VERSION,
  type VNextTocV4PageFragment,
  type VNextTocV4PaginationCursor,
  type VNextTocV4PaginationResult,
} from "../toc/tocV4Pagination.js"
import {
  finalizeVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
} from "./fragmentWindowV1.js"

export const VNEXT_TOC_COMPOSITION_WINDOW_SOURCE = "vnext-toc-composition-window"
export const VNEXT_TOC_COMPOSITION_WINDOW_VERSION = 1 as const

export interface VNextTocCompositionWindowContextV1 {
  documentId: string
  sectionId: string
  zoneId: string
  sourceOrder: number
  documentStructureFingerprint: string
  resolvedProjectionFingerprint: string
  familySourceFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
}

type AcceptedPagination = Extract<VNextTocV4PaginationResult, { status: "complete" | "partial" }>

function issue(code: string, path: string, message: string): VNextCompositionFragmentWindowIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(issues: VNextCompositionFragmentWindowIssueV1[]): VNextCompositionFragmentWindowResultV1 {
  return { status: "blocked", window: null, issues }
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(typeof value === "string" ? value : JSON.stringify(value))
}

export function createVNextTocV4CursorFingerprint(cursor: VNextTocV4PaginationCursor): string {
  return compact(cursor)
}

function acceptedPaginationFingerprint(pagination: AcceptedPagination): string {
  return JSON.stringify({
    tocNodeId: pagination.tocNodeId,
    measurementFingerprint: pagination.measurementFingerprint,
    cursorBefore: pagination.cursorBefore,
    cursorAfter: pagination.cursorAfter,
    pages: pagination.pages,
    summary: pagination.summary,
    work: pagination.work,
    contracts: pagination.contracts,
  })
}

export function hasValidVNextTocV4PaginationFingerprint(
  pagination: VNextTocV4PaginationResult,
): boolean {
  return pagination.status === "blocked" || pagination.fingerprint === acceptedPaginationFingerprint(pagination)
}

function cursorRef(
  cursor: VNextTocV4PaginationCursor,
  tocNodeId: string,
  measurementOwnerFingerprint: string,
): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: VNEXT_TOC_COMPOSITION_WINDOW_VERSION,
    kind: "composition-family-cursor-ref",
    family: "generated-flow",
    rootNodeId: tocNodeId,
    ownerFingerprint: measurementOwnerFingerprint,
    stateFingerprint: createVNextTocV4CursorFingerprint(cursor),
    complete: cursor.complete,
  }
}

function validatePageGeometry(
  page: VNextTocV4PageFragment,
  context: VNextTocCompositionWindowContextV1,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  if (!near(page.availableHeightPt, context.firstPageAvailableHeightPt)) issues.push(issue(
    "toc-composition-page-capacity-mismatch",
    "pagination.pages[0].availableHeightPt",
    "TOC page available height must equal the requested first-page remainder",
  ))
  if (!Number.isFinite(page.usedHeightPt)
    || !Number.isFinite(page.remainingHeightPt)
    || !near(page.usedHeightPt + page.remainingHeightPt, page.availableHeightPt)) issues.push(issue(
    "toc-composition-page-height-drift",
    "pagination.pages[0]",
    "TOC used and remaining height must equal available height",
  ))
}

function validateCursorProgress(
  pagination: AcceptedPagination,
  page: VNextTocV4PageFragment,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  const before = pagination.cursorBefore
  const after = pagination.cursorAfter
  if (page.pageIndex !== before.nextPageIndex || after.nextPageIndex !== before.nextPageIndex + 1) issues.push(issue(
    "toc-composition-page-cursor-index-drift",
    "pagination.pages[0].pageIndex",
    "one-page TOC evidence must advance exactly one family page index",
  ))
  const expectedRows = Array.from({ length: page.rows.length }, (_, index) => before.nextRowIndex + index)
  if (!exact(page.rows.map((row) => row.rowIndex), expectedRows)
    || after.nextRowIndex !== before.nextRowIndex + page.rows.length) issues.push(issue(
    "toc-composition-row-cursor-drift",
    "pagination.pages[0].rows",
    "TOC rows must be contiguous and match cursor row progress",
  ))
  const expectedTitlePlaced = before.titlePlaced || page.title != null
  if (after.titlePlaced !== expectedTitlePlaced) issues.push(issue(
    "toc-composition-title-cursor-drift",
    "pagination.cursorAfter.titlePlaced",
    "TOC title progress must match the retained page title",
  ))
  if (page.complete !== after.complete
    || (pagination.status === "complete") !== after.complete) issues.push(issue(
    "toc-composition-completion-drift",
    "pagination.status",
    "TOC page, result, and cursor completion must agree",
  ))
}

function validateContentGeometry(
  page: VNextTocV4PageFragment,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  if (page.usedHeightPt <= 0) issues.push(issue(
    "toc-composition-zero-content",
    "pagination.pages[0].usedHeightPt",
    "accepted TOC content requires positive extent",
  ))
  if (page.remainingHeightPt < 0
    || page.title?.forcedOverflow === true
    || page.rows.some((row) => row.forcedOverflow)
    || page.warnings.some((warning) => warning.code === "forced-title-overflow" || warning.code === "forced-row-overflow")) {
    issues.push(issue(
      "toc-composition-forced-overflow-unsupported",
      "pagination.pages[0]",
      "forced TOC overflow cannot be represented by the common non-overflow page contract",
    ))
  }
  const boxes = [
    ...(page.title == null ? [] : [{ yPt: page.title.yPt, heightPt: page.title.heightPt }]),
    ...page.rows.map((row) => ({ yPt: row.yPt, heightPt: row.heightPt })),
  ]
  if (boxes.some((box) => !Number.isFinite(box.yPt)
    || !Number.isFinite(box.heightPt)
    || box.yPt < 0
    || box.heightPt <= 0
    || box.yPt + box.heightPt > page.usedHeightPt + 0.01)) issues.push(issue(
    "toc-composition-content-geometry-invalid",
    "pagination.pages[0]",
    "TOC title and rows must have positive in-page geometry",
  ))
}

export function createVNextTocCompositionWindowV1(input: {
  pagination: VNextTocV4PaginationResult
  context: VNextTocCompositionWindowContextV1
}): VNextCompositionFragmentWindowResultV1 {
  const { pagination, context } = input
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (pagination.source !== VNEXT_TOC_V4_PAGINATION_SOURCE
    || pagination.contractVersion !== VNEXT_TOC_V4_PAGINATION_VERSION) issues.push(issue(
    "toc-composition-pagination-contract-mismatch",
    "pagination",
    "TOC adapter requires the exact v1 pagination contract",
  ))
  if (pagination.cursorBefore.tocNodeId !== pagination.tocNodeId) issues.push(issue(
    "toc-composition-cursor-owner-mismatch",
    "pagination.cursorBefore.tocNodeId",
    "TOC cursor-before must pin the exact root node",
  ))
  if (pagination.status !== "blocked") {
    if (!hasValidVNextTocV4PaginationFingerprint(pagination)) issues.push(issue(
      "toc-composition-pagination-fingerprint-mismatch",
      "pagination.fingerprint",
      "TOC pagination facts do not match their retained fingerprint",
    ))
    if (pagination.measurementFingerprint !== pagination.cursorBefore.measurementFingerprint
      || pagination.measurementFingerprint !== pagination.cursorAfter.measurementFingerprint
      || pagination.cursorAfter.tocNodeId !== pagination.tocNodeId) issues.push(issue(
      "toc-composition-measurement-owner-mismatch",
      "pagination.cursorAfter",
      "TOC result and both cursors must pin the exact measurement and root",
    ))
    if (pagination.pages.length !== 1) issues.push(issue(
      pagination.pages.length === 0 ? "toc-composition-empty-window-unsupported" : "toc-composition-multiple-pages-unsupported",
      "pagination.pages",
      "TOC common adaptation requires exactly one retained family page",
    ))
  }
  if (issues.length > 0) return blocked(issues)

  const measurementFingerprint = pagination.status === "blocked"
    ? pagination.cursorBefore.measurementFingerprint
    : pagination.measurementFingerprint
  const measurementOwnerFingerprint = compact(measurementFingerprint)
  const paginationOwnerFingerprint = compact(
    pagination.status === "blocked" ? pagination : pagination.fingerprint,
  )
  const cursorBefore = cursorRef(pagination.cursorBefore, pagination.tocNodeId, measurementOwnerFingerprint)
  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: "generated-flow" as const,
    documentId: context.documentId,
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    rootNodeId: pagination.tocNodeId,
    rootNodeType: "toc" as const,
    sourceOrder: context.sourceOrder,
    ownerPins: {
      documentStructure: context.documentStructureFingerprint,
      resolvedProjection: context.resolvedProjectionFingerprint,
      familySource: context.familySourceFingerprint,
      measurement: measurementOwnerFingerprint,
      pagination: paginationOwnerFingerprint,
    },
    capacity: {
      pageBodyHeightPt: context.pageBodyHeightPt,
      firstPageAvailableHeightPt: context.firstPageAvailableHeightPt,
      maximumPageCount: 1,
      maximumFragmentCount: 1,
    },
    cursorBefore,
  }

  if (pagination.status === "blocked") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "blocked",
    cursorAfter: null,
    pages: null,
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: pagination.issues,
  })

  const page = pagination.pages[0]
  const semanticIssues: VNextCompositionFragmentWindowIssueV1[] = []
  if (page.tocNodeId !== pagination.tocNodeId) semanticIssues.push(issue(
    "toc-composition-page-owner-mismatch",
    "pagination.pages[0].tocNodeId",
    "TOC page must belong to the pagination root",
  ))
  validatePageGeometry(page, context, semanticIssues)
  validateCursorProgress(pagination, page, semanticIssues)

  if (page.freshPageAdvance) {
    const expectedAfter = { ...pagination.cursorBefore, nextPageIndex: pagination.cursorBefore.nextPageIndex + 1 }
    if (page.usedHeightPt !== 0
      || page.title != null
      || page.rows.length !== 0
      || page.warnings.length !== 0
      || !exact(pagination.cursorAfter, expectedAfter)) semanticIssues.push(issue(
      "toc-composition-fresh-page-evidence-invalid",
      "pagination.pages[0]",
      "fresh-page TOC evidence must retain zero content and only advance its family page index",
    ))
    if (semanticIssues.length > 0) return blocked(semanticIssues)
    return finalizeVNextCompositionFragmentWindowV1({
      ...base,
      status: "fresh-page-required",
      cursorAfter: cursorBefore,
      pages: [],
      work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
      issues: [],
    })
  }

  validateContentGeometry(page, semanticIssues)
  if (semanticIssues.length > 0) return blocked(semanticIssues)
  const cursorAfter = cursorRef(pagination.cursorAfter, pagination.tocNodeId, measurementOwnerFingerprint)
  const pageEvidenceFingerprint = compact(page)
  return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: pagination.status,
    cursorAfter,
    pages: [{
      windowPageIndex: 0,
      flowEffect: "place-content",
      availableHeightPt: page.availableHeightPt,
      usedHeightPt: page.usedHeightPt,
      remainingHeightPt: page.remainingHeightPt,
      cursorBefore,
      cursorAfter,
      fragments: [{
        fragmentId: page.fragmentId,
        fragmentIndex: page.pageIndex,
        sourceNodeId: pagination.tocNodeId,
        blockOffsetPt: 0,
        blockExtentPt: page.usedHeightPt,
        continuation: {
          fromPrevious: pagination.cursorBefore.titlePlaced || pagination.cursorBefore.nextRowIndex > 0,
          toNext: !pagination.cursorAfter.complete,
        },
        familyEvidenceFingerprint: pageEvidenceFingerprint,
        heading: null,
      }],
    }],
    work: { pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 },
    issues: [],
  })
}
