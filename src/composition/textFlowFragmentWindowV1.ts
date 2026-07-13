import {
  finalizeVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
} from "./fragmentWindowV1.js"
import {
  createVNextTextFlowV4CursorFingerprint,
  hasValidVNextTextFlowV4PaginationFingerprint,
  VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_SOURCE,
  VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION,
  type VNextTextFlowV4PaginationCursor,
  type VNextTextFlowV4PaginationResult,
} from "../pagination/textFlowV4WindowPagination.js"

export const VNEXT_TEXT_FLOW_COMPOSITION_WINDOW_SOURCE = "vnext-text-flow-composition-window"
export const VNEXT_TEXT_FLOW_COMPOSITION_WINDOW_VERSION = 1 as const

export interface VNextTextFlowCompositionWindowContextV1 {
  documentId: string
  sectionId: string
  zoneId: string
  sourceOrder: number
  documentStructureFingerprint: string
  resolvedProjectionFingerprint: string
  familySourceFingerprint: string
  maximumFragmentCount: number
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

function issue(code: string, path: string, message: string): VNextCompositionFragmentWindowIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(issues: VNextCompositionFragmentWindowIssueV1[]): VNextCompositionFragmentWindowResultV1 {
  return { status: "blocked", window: null, issues }
}

function cursorRef(
  cursor: VNextTextFlowV4PaginationCursor,
  measurementFingerprint: string,
): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: VNEXT_TEXT_FLOW_COMPOSITION_WINDOW_VERSION,
    kind: "composition-family-cursor-ref",
    family: "text-flow",
    rootNodeId: cursor.textBlockId,
    ownerFingerprint: measurementFingerprint,
    stateFingerprint: createVNextTextFlowV4CursorFingerprint(cursor),
    complete: cursor.complete,
  }
}

export function createVNextTextFlowCompositionWindowV1(input: {
  pagination: VNextTextFlowV4PaginationResult
  context: VNextTextFlowCompositionWindowContextV1
}): VNextCompositionFragmentWindowResultV1 {
  const { pagination, context } = input
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (!hasValidVNextTextFlowV4PaginationFingerprint(pagination)) issues.push(issue(
    "text-flow-pagination-fingerprint-mismatch",
    "pagination.fingerprint",
    "Text-flow pagination facts do not match their retained fingerprint",
  ))
  if (pagination.source !== VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_SOURCE
    || pagination.contractVersion !== VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION) issues.push(issue(
    "text-flow-pagination-contract-mismatch",
    "pagination",
    "Text-flow adapter requires the exact v1 window pagination contract",
  ))
  if (pagination.cursorBefore.textBlockId !== pagination.textBlockId
    || pagination.cursorBefore.measurementFingerprint !== pagination.measurementFingerprint) issues.push(issue(
    "text-flow-pagination-cursor-owner-mismatch",
    "pagination.cursorBefore",
    "Text-flow pagination cursor-before must pin its exact root and measurement",
  ))
  if (pagination.cursorAfter != null
    && (pagination.cursorAfter.textBlockId !== pagination.textBlockId
      || pagination.cursorAfter.measurementFingerprint !== pagination.measurementFingerprint)) issues.push(issue(
    "text-flow-pagination-final-cursor-owner-mismatch",
    "pagination.cursorAfter",
    "Text-flow pagination cursor-after must pin its exact root and measurement",
  ))
  if (issues.length > 0) return blocked(issues)

  const cursorBefore = cursorRef(pagination.cursorBefore, pagination.measurementFingerprint)
  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: "text-flow" as const,
    documentId: context.documentId,
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    rootNodeId: pagination.textBlockId,
    rootNodeType: "text-block" as const,
    sourceOrder: context.sourceOrder,
    ownerPins: {
      documentStructure: context.documentStructureFingerprint,
      resolvedProjection: context.resolvedProjectionFingerprint,
      familySource: context.familySourceFingerprint,
      measurement: pagination.measurementFingerprint,
      pagination: pagination.fingerprint,
    },
    capacity: {
      pageBodyHeightPt: pagination.pageBodyHeightPt,
      firstPageAvailableHeightPt: pagination.firstPageAvailableHeightPt,
      maximumPageCount: pagination.maximumPageCount,
      maximumFragmentCount: context.maximumFragmentCount,
    },
    cursorBefore,
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

  const cursorAfter = cursorRef(pagination.cursorAfter, pagination.measurementFingerprint)
  if (pagination.status === "fresh-page-required") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "fresh-page-required",
    cursorAfter,
    pages: [],
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: [],
  })

  const pages = pagination.pages.map((page, windowPageIndex) => ({
    windowPageIndex,
    flowEffect: "place-content" as const,
    availableHeightPt: page.availableHeightPt,
    usedHeightPt: page.usedHeightPt,
    remainingHeightPt: page.remainingHeightPt,
    cursorBefore: cursorRef(page.cursorBefore, pagination.measurementFingerprint),
    cursorAfter: cursorRef(page.cursorAfter, pagination.measurementFingerprint),
    fragments: [{
      fragmentId: page.fragment.fragmentId,
      fragmentIndex: page.fragment.fragmentIndex,
      sourceNodeId: pagination.textBlockId,
      blockOffsetPt: 0,
      blockExtentPt: page.fragment.heightPt,
      continuation: {
        fromPrevious: page.fragment.fragmentIndex > 0,
        toNext: !page.cursorAfter.complete,
      },
      familyEvidenceFingerprint: page.fragment.fingerprint,
      heading: context.headingLevel == null || page.fragment.fragmentIndex !== 0
        ? null
        : { headingNodeId: pagination.textBlockId, level: context.headingLevel },
    }],
  }))
  return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: pagination.status,
    cursorAfter,
    pages,
    work: {
      pageCount: pages.length,
      fragmentCount: pages.length,
      cursorCommitCount: pages.length,
    },
    issues: [],
  })
}
