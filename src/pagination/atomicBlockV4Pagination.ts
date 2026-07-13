import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  hasValidVNextAtomicBlockV4EvidenceFingerprint,
  type VNextAtomicBlockV4Evidence,
} from "./atomicBlockV4Evidence.js"

export const VNEXT_ATOMIC_BLOCK_V4_PAGINATION_SOURCE = "vnext-atomic-block-v4-pagination"
export const VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).max(256).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const CompactFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)

export const VNextAtomicBlockV4PaginationCursorSchema = z.object({
  contractVersion: z.literal(VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION),
  kind: z.literal("atomic-block-pagination-cursor"),
  nodeId: NonBlankIdSchema,
  evidenceFingerprint: CompactFingerprintSchema,
  complete: z.boolean(),
}).strict()

export type VNextAtomicBlockV4PaginationCursor = z.infer<typeof VNextAtomicBlockV4PaginationCursorSchema>

export interface VNextAtomicBlockV4PageFragment {
  fragmentId: string
  fragmentIndex: 0
  nodeId: string
  extentPt: number
  evidenceFingerprint: string
  fingerprint: string
}

export interface VNextAtomicBlockV4Page {
  familyPageIndex: 0
  flowEffect: "place-content" | "force-page-advance"
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  cursorBefore: VNextAtomicBlockV4PaginationCursor
  cursorAfter: VNextAtomicBlockV4PaginationCursor
  fragment: VNextAtomicBlockV4PageFragment | null
}

export interface VNextAtomicBlockV4PaginationIssue {
  code: string
  severity: "error"
  path: string
  message: string
  nodeId: string
}

interface PaginationFacts {
  source: typeof VNEXT_ATOMIC_BLOCK_V4_PAGINATION_SOURCE
  contractVersion: typeof VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION
  nodeId: string
  nodeType: VNextAtomicBlockV4Evidence["nodeType"]
  family: VNextAtomicBlockV4Evidence["family"]
  evidenceFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  maximumPageCount: 1
  cursorBefore: VNextAtomicBlockV4PaginationCursor
  work: { pageAttemptCount: number; fragmentCount: number; cursorCommitCount: number }
}

export type VNextAtomicBlockV4PaginationResult =
  | (PaginationFacts & {
      status: "complete"
      cursorAfter: VNextAtomicBlockV4PaginationCursor
      pages: [VNextAtomicBlockV4Page]
      fingerprint: string
      issues: []
    })
  | (PaginationFacts & {
      status: "fresh-page-required"
      cursorAfter: VNextAtomicBlockV4PaginationCursor
      pages: []
      fingerprint: string
      issues: []
    })
  | (PaginationFacts & {
      status: "blocked"
      cursorAfter: null
      pages: null
      fingerprint: string
      issues: VNextAtomicBlockV4PaginationIssue[]
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string, nodeId: string): VNextAtomicBlockV4PaginationIssue {
  return { code, severity: "error", path, message, nodeId }
}

export function createInitialVNextAtomicBlockV4PaginationCursor(
  evidence: VNextAtomicBlockV4Evidence,
): VNextAtomicBlockV4PaginationCursor {
  return {
    contractVersion: VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION,
    kind: "atomic-block-pagination-cursor",
    nodeId: evidence.nodeId,
    evidenceFingerprint: evidence.fingerprint,
    complete: false,
  }
}

export function createVNextAtomicBlockV4CursorFingerprint(
  cursor: VNextAtomicBlockV4PaginationCursor,
): string {
  return createVNextCompactFingerprint(JSON.stringify(cursor))
}

function resultFingerprint(value: Omit<VNextAtomicBlockV4PaginationResult, "fingerprint">): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

export function hasValidVNextAtomicBlockV4PaginationFingerprint(
  value: VNextAtomicBlockV4PaginationResult,
): boolean {
  try {
    const { fingerprint, ...facts } = value
    return fingerprint === resultFingerprint(facts)
  } catch {
    return false
  }
}

function blocked(facts: PaginationFacts, issues: VNextAtomicBlockV4PaginationIssue[]): VNextAtomicBlockV4PaginationResult {
  const value: Omit<Extract<VNextAtomicBlockV4PaginationResult, { status: "blocked" }>, "fingerprint"> = {
    ...facts,
    status: "blocked",
    cursorAfter: null,
    pages: null,
    issues,
  }
  return { ...value, fingerprint: resultFingerprint(value) }
}

export function paginateVNextAtomicBlockV4(input: {
  evidence: VNextAtomicBlockV4Evidence
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  cursor?: VNextAtomicBlockV4PaginationCursor
}): VNextAtomicBlockV4PaginationResult {
  const parsedCursor = input.cursor == null
    ? { success: true as const, data: createInitialVNextAtomicBlockV4PaginationCursor(input.evidence) }
    : VNextAtomicBlockV4PaginationCursorSchema.safeParse(input.cursor)
  const cursorBefore = clone(parsedCursor.success
    ? parsedCursor.data
    : createInitialVNextAtomicBlockV4PaginationCursor(input.evidence))
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const base: PaginationFacts = {
    source: VNEXT_ATOMIC_BLOCK_V4_PAGINATION_SOURCE,
    contractVersion: VNEXT_ATOMIC_BLOCK_V4_PAGINATION_VERSION,
    nodeId: input.evidence.nodeId,
    nodeType: input.evidence.nodeType,
    family: input.evidence.family,
    evidenceFingerprint: input.evidence.fingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    maximumPageCount: 1,
    cursorBefore,
    work: { pageAttemptCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
  }
  const issues: VNextAtomicBlockV4PaginationIssue[] = []
  if (!hasValidVNextAtomicBlockV4EvidenceFingerprint(input.evidence)) issues.push(issue(
    "atomic-evidence-fingerprint-mismatch",
    "evidence.fingerprint",
    "atomic evidence facts do not match their retained fingerprint",
    input.evidence.nodeId,
  ))
  if (!parsedCursor.success) issues.push(issue(
    "atomic-cursor-invalid",
    "cursor",
    "atomic cursor does not satisfy the strict v1 contract",
    input.evidence.nodeId,
  ))
  if (parsedCursor.success) {
    if (cursorBefore.nodeId !== input.evidence.nodeId
      || cursorBefore.evidenceFingerprint !== input.evidence.fingerprint) issues.push(issue(
      "atomic-cursor-owner-mismatch",
      "cursor",
      "atomic cursor must pin the exact node and evidence",
      input.evidence.nodeId,
    ))
    if (cursorBefore.complete) issues.push(issue(
      "atomic-cursor-already-complete",
      "cursor.complete",
      "atomic pagination cannot start from an already complete cursor",
      input.evidence.nodeId,
    ))
  }
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height",
    "pageBodyHeightPt",
    "page body height must be positive and finite",
    input.evidence.nodeId,
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt)
    || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height",
    "firstPageAvailableHeightPt",
    "first-page available height must be between zero and page-body height",
    input.evidence.nodeId,
  ))
  if (issues.length > 0) return blocked(base, issues)

  if (input.evidence.flowEffect === "place-content" && input.evidence.extentPt > input.pageBodyHeightPt) return blocked(base, [issue(
    "atomic-block-exceeds-page-body",
    "evidence.extentPt",
    `${input.evidence.nodeType} extent ${input.evidence.extentPt} exceeds fresh page body ${input.pageBodyHeightPt}; atomic pagination does not scale or split`,
    input.evidence.nodeId,
  )])
  if (input.evidence.flowEffect === "place-content" && input.evidence.extentPt > firstPageAvailableHeightPt) {
    const value: Omit<Extract<VNextAtomicBlockV4PaginationResult, { status: "fresh-page-required" }>, "fingerprint"> = {
      ...base,
      status: "fresh-page-required",
      cursorAfter: clone(cursorBefore),
      pages: [],
      issues: [],
    }
    return { ...value, fingerprint: resultFingerprint(value) }
  }

  const cursorAfter: VNextAtomicBlockV4PaginationCursor = { ...clone(cursorBefore), complete: true }
  const fragmentFacts: Omit<VNextAtomicBlockV4PageFragment, "fingerprint"> | null = input.evidence.flowEffect === "place-content"
    ? {
        fragmentId: `${input.evidence.nodeId}:atomic-fragment-0`,
        fragmentIndex: 0,
        nodeId: input.evidence.nodeId,
        extentPt: input.evidence.extentPt,
        evidenceFingerprint: input.evidence.fingerprint,
      }
    : null
  const fragment = fragmentFacts == null ? null : {
    ...fragmentFacts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(fragmentFacts)),
  }
  const usedHeightPt = fragment?.extentPt ?? 0
  const page: VNextAtomicBlockV4Page = {
    familyPageIndex: 0,
    flowEffect: input.evidence.flowEffect,
    availableHeightPt: firstPageAvailableHeightPt,
    usedHeightPt,
    remainingHeightPt: roundPt(firstPageAvailableHeightPt - usedHeightPt),
    cursorBefore,
    cursorAfter,
    fragment,
  }
  const value: Omit<Extract<VNextAtomicBlockV4PaginationResult, { status: "complete" }>, "fingerprint"> = {
    ...base,
    status: "complete",
    cursorAfter,
    pages: [page],
    work: { pageAttemptCount: 1, fragmentCount: fragment == null ? 0 : 1, cursorCommitCount: 1 },
    issues: [],
  }
  return { ...value, fingerprint: resultFingerprint(value) }
}
