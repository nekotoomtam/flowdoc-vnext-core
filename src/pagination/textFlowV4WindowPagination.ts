import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type {
  VNextTextBlockV4MeasuredLine,
  VNextTextBlockV4MeasuredLinesResult,
  VNextTextBlockV4MeasurementIssue,
  VNextTextBlockV4MeasurementSourcePoint,
} from "./textBlockV4Measurement.js"

export const VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_SOURCE = "vnext-text-flow-v4-window-pagination"
export const VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION = 1 as const
export const VNEXT_TEXT_FLOW_V4_WINDOW_MAX_PAGES = 10_000
export const VNEXT_TEXT_FLOW_V4_WINDOW_MAX_LINES = 100_000

type AcceptedLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

const NonBlankIdSchema = z.string().min(1).max(256).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const CompactFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)

export const VNextTextFlowV4PaginationCursorSchema = z.object({
  contractVersion: z.literal(VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION),
  kind: z.literal("text-flow-pagination-cursor"),
  textBlockId: NonBlankIdSchema,
  measurementFingerprint: CompactFingerprintSchema,
  nextLineIndex: z.number().int().nonnegative(),
  nextPageIndex: z.number().int().nonnegative(),
  complete: z.boolean(),
}).strict()

export type VNextTextFlowV4PaginationCursor = z.infer<typeof VNextTextFlowV4PaginationCursorSchema>

export interface VNextTextFlowV4PageLine extends VNextTextBlockV4MeasuredLine {
  pageLineIndex: number
  yOffsetPt: number
}

export interface VNextTextFlowV4PageFragment {
  fragmentId: string
  textBlockId: string
  fragmentIndex: number
  familyPageIndex: number
  lineStartIndex: number
  lineEndIndexExclusive: number
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
  heightPt: number
  lines: VNextTextFlowV4PageLine[]
  fingerprint: string
}

export interface VNextTextFlowV4Page {
  familyPageIndex: number
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  cursorBefore: VNextTextFlowV4PaginationCursor
  cursorAfter: VNextTextFlowV4PaginationCursor
  fragment: VNextTextFlowV4PageFragment
}

export interface VNextTextFlowV4PaginationIssue extends VNextTextBlockV4MeasurementIssue {
  lineIndex?: number
}

interface VNextTextFlowV4PaginationFacts {
  source: typeof VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_SOURCE
  contractVersion: typeof VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION
  textBlockId: string
  measurementFingerprint: string
  pageBodyHeightPt: number
  firstPageAvailableHeightPt: number
  maximumPageCount: number
  maximumLineCount: number
  cursorBefore: VNextTextFlowV4PaginationCursor
  work: { pageAttemptCount: number; lineVisitCount: number; cursorCommitCount: number }
}

export type VNextTextFlowV4PaginationResult =
  | (VNextTextFlowV4PaginationFacts & {
      status: "complete" | "partial"
      cursorAfter: VNextTextFlowV4PaginationCursor
      pages: VNextTextFlowV4Page[]
      summary: { pageCount: number; fragmentCount: number; lineCount: number; splitAcrossPages: boolean }
      fingerprint: string
      issues: []
    })
  | (VNextTextFlowV4PaginationFacts & {
      status: "fresh-page-required"
      cursorAfter: VNextTextFlowV4PaginationCursor
      pages: []
      summary: { pageCount: 0; fragmentCount: 0; lineCount: 0; splitAcrossPages: false }
      fingerprint: string
      issues: []
    })
  | (VNextTextFlowV4PaginationFacts & {
      status: "blocked"
      cursorAfter: null
      pages: null
      summary: null
      fingerprint: string
      issues: VNextTextFlowV4PaginationIssue[]
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(2))
}

function issue(code: string, path: string, message: string, lineIndex?: number): VNextTextFlowV4PaginationIssue {
  return { code, severity: "error", path, message, ...(lineIndex == null ? {} : { lineIndex }) }
}

export function createVNextTextFlowV4MeasurementFingerprint(accepted: AcceptedLines): string {
  return createVNextCompactFingerprint(JSON.stringify({
    source: accepted.source,
    version: accepted.version,
    textBlockId: accepted.textBlockId,
    lines: accepted.lines,
    summary: accepted.summary,
  }))
}

export function createInitialVNextTextFlowV4PaginationCursor(
  accepted: AcceptedLines,
): VNextTextFlowV4PaginationCursor {
  return {
    contractVersion: VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION,
    kind: "text-flow-pagination-cursor",
    textBlockId: accepted.textBlockId,
    measurementFingerprint: createVNextTextFlowV4MeasurementFingerprint(accepted),
    nextLineIndex: 0,
    nextPageIndex: 0,
    complete: accepted.lines.length === 0,
  }
}

export function createVNextTextFlowV4CursorFingerprint(cursor: VNextTextFlowV4PaginationCursor): string {
  return createVNextCompactFingerprint(JSON.stringify(cursor))
}

function resultFingerprint(value: Omit<VNextTextFlowV4PaginationResult, "fingerprint">): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

export function hasValidVNextTextFlowV4PaginationFingerprint(
  value: VNextTextFlowV4PaginationResult,
): boolean {
  try {
    const { fingerprint, ...facts } = value
    return fingerprint === resultFingerprint(facts)
  } catch {
    return false
  }
}

function blocked(
  facts: VNextTextFlowV4PaginationFacts,
  issues: VNextTextFlowV4PaginationIssue[],
): VNextTextFlowV4PaginationResult {
  const result: Omit<Extract<VNextTextFlowV4PaginationResult, { status: "blocked" }>, "fingerprint"> = {
    ...facts,
    status: "blocked",
    cursorAfter: null,
    pages: null,
    summary: null,
    issues,
  }
  return { ...result, fingerprint: resultFingerprint(result) }
}

export function paginateVNextTextFlowV4(input: {
  accepted: AcceptedLines
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  maximumPageCount: number
  maximumLineCount?: number
  cursor?: VNextTextFlowV4PaginationCursor
}): VNextTextFlowV4PaginationResult {
  const measurementFingerprint = createVNextTextFlowV4MeasurementFingerprint(input.accepted)
  const initialCursor = createInitialVNextTextFlowV4PaginationCursor(input.accepted)
  const parsedCursor = input.cursor == null
    ? { success: true as const, data: initialCursor }
    : VNextTextFlowV4PaginationCursorSchema.safeParse(input.cursor)
  const cursorBefore = clone(parsedCursor.success ? parsedCursor.data : initialCursor)
  const firstPageAvailableHeightPt = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  const maximumLineCount = input.maximumLineCount ?? VNEXT_TEXT_FLOW_V4_WINDOW_MAX_LINES
  const baseFacts: VNextTextFlowV4PaginationFacts = {
    source: VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_SOURCE,
    contractVersion: VNEXT_TEXT_FLOW_V4_WINDOW_PAGINATION_VERSION,
    textBlockId: input.accepted.textBlockId,
    measurementFingerprint,
    pageBodyHeightPt: input.pageBodyHeightPt,
    firstPageAvailableHeightPt,
    maximumPageCount: input.maximumPageCount,
    maximumLineCount,
    cursorBefore,
    work: { pageAttemptCount: 0, lineVisitCount: 0, cursorCommitCount: 0 },
  }
  const issues: VNextTextFlowV4PaginationIssue[] = []
  if (!parsedCursor.success) issues.push(issue(
    "text-flow-cursor-invalid",
    "cursor",
    "Text-flow cursor does not satisfy the strict v1 contract",
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height",
    "pageBodyHeightPt",
    "page body height must be a positive finite point value",
  ))
  if (!Number.isFinite(firstPageAvailableHeightPt)
    || firstPageAvailableHeightPt < 0
    || firstPageAvailableHeightPt > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height",
    "firstPageAvailableHeightPt",
    "first-page available height must be between zero and page-body height",
  ))
  if (!Number.isInteger(input.maximumPageCount)
    || input.maximumPageCount <= 0
    || input.maximumPageCount > VNEXT_TEXT_FLOW_V4_WINDOW_MAX_PAGES) issues.push(issue(
    "invalid-maximum-page-count",
    "maximumPageCount",
    `maximum page count must be between 1 and ${VNEXT_TEXT_FLOW_V4_WINDOW_MAX_PAGES}`,
  ))
  if (!Number.isInteger(maximumLineCount)
    || maximumLineCount <= 0
    || maximumLineCount > VNEXT_TEXT_FLOW_V4_WINDOW_MAX_LINES) issues.push(issue(
    "invalid-maximum-line-count",
    "maximumLineCount",
    `maximum line count must be between 1 and ${VNEXT_TEXT_FLOW_V4_WINDOW_MAX_LINES}`,
  ))
  if (Number.isInteger(maximumLineCount)
    && maximumLineCount > 0
    && input.accepted.lines.length > maximumLineCount) issues.push(issue(
    "text-flow-line-limit-exceeded",
    "accepted.lines",
    `accepted measured lines exceed the pinned maximum of ${maximumLineCount}`,
  ))
  if (parsedCursor.success) {
    if (cursorBefore.textBlockId !== input.accepted.textBlockId
      || cursorBefore.measurementFingerprint !== measurementFingerprint) issues.push(issue(
      "text-flow-cursor-owner-mismatch",
      "cursor",
      "Text-flow cursor must pin the exact accepted measured lines",
    ))
    if (cursorBefore.nextLineIndex > input.accepted.lines.length) issues.push(issue(
      "text-flow-cursor-line-out-of-range",
      "cursor.nextLineIndex",
      "Text-flow cursor line index exceeds accepted measured lines",
    ))
    if (cursorBefore.nextPageIndex > cursorBefore.nextLineIndex
      || (cursorBefore.nextLineIndex === 0 && cursorBefore.nextPageIndex !== 0)
      || (cursorBefore.nextLineIndex > 0 && cursorBefore.nextPageIndex === 0)) issues.push(issue(
      "text-flow-cursor-progress-invalid",
      "cursor",
      "Text-flow cursor page progress must be non-zero and cannot exceed consumed lines",
    ))
    const expectedComplete = cursorBefore.nextLineIndex === input.accepted.lines.length
    if (cursorBefore.complete !== expectedComplete) issues.push(issue(
      "text-flow-cursor-complete-mismatch",
      "cursor.complete",
      "Text-flow cursor complete state must match its line position",
    ))
    if (cursorBefore.complete) issues.push(issue(
      "text-flow-cursor-already-complete",
      "cursor.complete",
      "Text-flow pagination cannot start from an already complete cursor",
    ))
  }
  input.accepted.lines.forEach((line, index) => {
    if (!Number.isFinite(line.heightPt) || line.heightPt <= 0) issues.push(issue(
      "invalid-line-height",
      `accepted.lines[${index}].heightPt`,
      "accepted line height must remain positive and finite",
      index,
    ))
    if (Number.isFinite(input.pageBodyHeightPt) && input.pageBodyHeightPt > 0 && line.heightPt > input.pageBodyHeightPt) issues.push(issue(
      "line-exceeds-page-body",
      `accepted.lines[${index}].heightPt`,
      `measured line ${index} exceeds the fresh page body height`,
      index,
    ))
  })
  if (issues.length > 0) return blocked(baseFacts, issues)

  const firstLine = input.accepted.lines[cursorBefore.nextLineIndex]
  if (firstLine != null
    && firstLine.heightPt > firstPageAvailableHeightPt
    && firstPageAvailableHeightPt < input.pageBodyHeightPt) {
    const result: Omit<Extract<VNextTextFlowV4PaginationResult, { status: "fresh-page-required" }>, "fingerprint"> = {
      ...baseFacts,
      status: "fresh-page-required",
      cursorAfter: clone(cursorBefore),
      pages: [],
      summary: { pageCount: 0, fragmentCount: 0, lineCount: 0, splitAcrossPages: false },
      issues: [],
    }
    return { ...result, fingerprint: resultFingerprint(result) }
  }

  let cursor = clone(cursorBefore)
  const pages: VNextTextFlowV4Page[] = []
  let lineVisitCount = 0
  while (!cursor.complete && pages.length < input.maximumPageCount) {
    const availableHeightPt = pages.length === 0 ? firstPageAvailableHeightPt : input.pageBodyHeightPt
    const pageCursorBefore = clone(cursor)
    const lines: VNextTextBlockV4MeasuredLine[] = []
    let usedHeightPt = 0
    while (cursor.nextLineIndex < input.accepted.lines.length) {
      const line = input.accepted.lines[cursor.nextLineIndex]
      lineVisitCount += 1
      if (usedHeightPt + line.heightPt > availableHeightPt) break
      lines.push(line)
      usedHeightPt = roundPt(usedHeightPt + line.heightPt)
      cursor.nextLineIndex += 1
    }
    if (lines.length === 0) return blocked({
      ...baseFacts,
      work: { pageAttemptCount: pages.length + 1, lineVisitCount, cursorCommitCount: pages.length },
    }, [issue(
      "text-flow-pagination-no-progress",
      "cursor",
      "Text-flow pagination could not consume a measured line on the current page",
      cursor.nextLineIndex,
    )])

    cursor.nextPageIndex += 1
    cursor.complete = cursor.nextLineIndex === input.accepted.lines.length
    const pageCursorAfter = clone(cursor)
    let yOffsetPt = 0
    const pageLines = lines.map((line, pageLineIndex): VNextTextFlowV4PageLine => {
      const pageLine = { ...clone(line), pageLineIndex, yOffsetPt }
      yOffsetPt = roundPt(yOffsetPt + line.heightPt)
      return pageLine
    })
    const fragmentIndex = pageCursorBefore.nextPageIndex
    const fragmentFacts: Omit<VNextTextFlowV4PageFragment, "fingerprint"> = {
      fragmentId: `${input.accepted.textBlockId}:text-flow-fragment-${fragmentIndex}:lines-${lines[0].index}-${lines.at(-1)!.index}`,
      textBlockId: input.accepted.textBlockId,
      fragmentIndex,
      familyPageIndex: pageCursorBefore.nextPageIndex,
      lineStartIndex: lines[0].index,
      lineEndIndexExclusive: lines.at(-1)!.index + 1,
      sourceStart: clone(lines[0].sourceStart),
      sourceEnd: clone(lines.at(-1)!.sourceEnd),
      heightPt: yOffsetPt,
      lines: pageLines,
    }
    const fragment = {
      ...fragmentFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(fragmentFacts)),
    }
    pages.push({
      familyPageIndex: pageCursorBefore.nextPageIndex,
      availableHeightPt,
      usedHeightPt: yOffsetPt,
      remainingHeightPt: roundPt(availableHeightPt - yOffsetPt),
      cursorBefore: pageCursorBefore,
      cursorAfter: pageCursorAfter,
      fragment,
    })
  }

  const status = cursor.complete ? "complete" as const : "partial" as const
  const facts: Omit<Extract<VNextTextFlowV4PaginationResult, { status: "complete" | "partial" }>, "fingerprint"> = {
    ...baseFacts,
    status,
    cursorAfter: cursor,
    pages,
    summary: {
      pageCount: pages.length,
      fragmentCount: pages.length,
      lineCount: cursor.nextLineIndex - cursorBefore.nextLineIndex,
      splitAcrossPages: pages.length > 1 || cursorBefore.nextPageIndex > 0 || !cursor.complete,
    },
    work: { pageAttemptCount: pages.length, lineVisitCount, cursorCommitCount: pages.length },
    issues: [],
  }
  return { ...facts, fingerprint: resultFingerprint(facts) }
}
