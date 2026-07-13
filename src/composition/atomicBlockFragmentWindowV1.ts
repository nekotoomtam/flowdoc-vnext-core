import {
  finalizeVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
} from "./fragmentWindowV1.js"
import {
  createVNextAtomicBlockV4CursorFingerprint,
  hasValidVNextAtomicBlockV4PaginationFingerprint,
  VNEXT_ATOMIC_BLOCK_V4_PAGINATION_SOURCE,
  VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION,
  type VNextAtomicBlockV4PaginationCursor,
  type VNextAtomicBlockV4PaginationResult,
} from "../pagination/atomicBlockV4Pagination.js"

export interface VNextAtomicBlockCompositionWindowContextV1 {
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

function cursorRef(
  cursor: VNextAtomicBlockV4PaginationCursor,
  pagination: VNextAtomicBlockV4PaginationResult,
): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: 1,
    kind: "composition-family-cursor-ref",
    family: pagination.family,
    rootNodeId: pagination.nodeId,
    ownerFingerprint: pagination.evidenceFingerprint,
    stateFingerprint: createVNextAtomicBlockV4CursorFingerprint(cursor),
    complete: cursor.complete,
  }
}

export function createVNextAtomicBlockCompositionWindowV1(input: {
  pagination: VNextAtomicBlockV4PaginationResult
  context: VNextAtomicBlockCompositionWindowContextV1
}): VNextCompositionFragmentWindowResultV1 {
  const { pagination, context } = input
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (!hasValidVNextAtomicBlockV4PaginationFingerprint(pagination)) issues.push(issue(
    "atomic-pagination-fingerprint-mismatch",
    "pagination.fingerprint",
    "atomic pagination facts do not match their retained fingerprint",
  ))
  if (pagination.source !== VNEXT_ATOMIC_BLOCK_V4_PAGINATION_SOURCE
    || pagination.contractVersion !== VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION) issues.push(issue(
    "atomic-pagination-contract-mismatch",
    "pagination",
    "atomic adapter requires the exact v1 pagination contract",
  ))
  if (pagination.cursorBefore.nodeId !== pagination.nodeId
    || pagination.cursorBefore.evidenceFingerprint !== pagination.evidenceFingerprint) issues.push(issue(
    "atomic-pagination-cursor-owner-mismatch",
    "pagination.cursorBefore",
    "atomic cursor-before must pin the exact node and evidence",
  ))
  if (pagination.cursorAfter != null
    && (pagination.cursorAfter.nodeId !== pagination.nodeId
      || pagination.cursorAfter.evidenceFingerprint !== pagination.evidenceFingerprint)) issues.push(issue(
    "atomic-pagination-final-cursor-owner-mismatch",
    "pagination.cursorAfter",
    "atomic cursor-after must pin the exact node and evidence",
  ))
  if (issues.length > 0) return blocked(issues)

  const cursorBefore = cursorRef(pagination.cursorBefore, pagination)
  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: pagination.family,
    documentId: context.documentId,
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    rootNodeId: pagination.nodeId,
    rootNodeType: pagination.nodeType,
    sourceOrder: context.sourceOrder,
    ownerPins: {
      documentStructure: context.documentStructureFingerprint,
      resolvedProjection: context.resolvedProjectionFingerprint,
      familySource: context.familySourceFingerprint,
      measurement: pagination.evidenceFingerprint,
      pagination: pagination.fingerprint,
    },
    capacity: {
      pageBodyHeightPt: pagination.pageBodyHeightPt,
      firstPageAvailableHeightPt: pagination.firstPageAvailableHeightPt,
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
    issues: pagination.issues.map((item) => ({
      code: item.code,
      severity: "error" as const,
      path: item.path,
      message: item.message,
    })),
  })

  const cursorAfter = cursorRef(pagination.cursorAfter, pagination)
  if (pagination.status === "fresh-page-required") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "fresh-page-required",
    cursorAfter,
    pages: [],
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: [],
  })

  const page = pagination.pages[0]
  const fragments = page.fragment == null ? [] : [{
    fragmentId: page.fragment.fragmentId,
    fragmentIndex: page.fragment.fragmentIndex,
    sourceNodeId: pagination.nodeId,
    blockOffsetPt: 0,
    blockExtentPt: page.fragment.extentPt,
    continuation: { fromPrevious: false, toNext: false },
    familyEvidenceFingerprint: page.fragment.fingerprint,
    heading: null,
  }]
  return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "complete",
    cursorAfter,
    pages: [{
      windowPageIndex: 0,
      flowEffect: page.flowEffect,
      availableHeightPt: page.availableHeightPt,
      usedHeightPt: page.usedHeightPt,
      remainingHeightPt: page.remainingHeightPt,
      cursorBefore: cursorRef(page.cursorBefore, pagination),
      cursorAfter: cursorRef(page.cursorAfter, pagination),
      fragments,
    }],
    work: { pageCount: 1, fragmentCount: fragments.length, cursorCommitCount: 1 },
    issues: [],
  })
}
