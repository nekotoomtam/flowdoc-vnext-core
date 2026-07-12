import type { VNextTocV4MeasurementResult } from "./tocV4Measurement.js"

export const VNEXT_TOC_V4_PAGINATION_SOURCE = "vnext-toc-v4-pagination"
export const VNEXT_TOC_V4_PAGINATION_VERSION = 1 as const

type MeasuredToc = Extract<VNextTocV4MeasurementResult, { status: "measured" }>

export interface VNextTocV4PaginationCursor {
  contractVersion: 1
  kind: "toc-pagination-cursor"
  tocNodeId: string
  measurementFingerprint: string
  titlePlaced: boolean
  nextRowIndex: number
  nextPageIndex: number
  complete: boolean
}

export interface VNextTocV4PageFragment {
  fragmentId: string
  tocNodeId: string
  pageIndex: number
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  complete: boolean
  freshPageAdvance: boolean
  title: null | { yPt: number; heightPt: number; forcedOverflow: boolean }
  rows: Array<{
    rowIndex: number
    identity: MeasuredToc["rows"][number]["identity"]
    headingNodeId: string
    yPt: number
    heightPt: number
    forcedOverflow: boolean
  }>
  warnings: Array<{
    code: "title-keep-with-first-unsatisfied" | "forced-title-overflow" | "forced-row-overflow"
    headingNodeId?: string
  }>
}

export type VNextTocV4PaginationResult =
  | {
      source: typeof VNEXT_TOC_V4_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_PAGINATION_VERSION
      status: "complete" | "partial"
      tocNodeId: string
      measurementFingerprint: string
      cursorBefore: VNextTocV4PaginationCursor
      cursorAfter: VNextTocV4PaginationCursor
      pages: VNextTocV4PageFragment[]
      summary: {
        pageCount: number
        placedRowCount: number
        forcedOverflowCount: number
        freshPageAdvanceCount: number
      }
      work: { pageAttemptCount: number; rowVisitCount: number; cursorCommitCount: number }
      contracts: { measurementExecution: false; finalPageResolution: "not-run"; rendering: "not-run"; cursorCommit: "atomic-per-page" }
      fingerprint: string
      issues: []
    }
  | {
      source: typeof VNEXT_TOC_V4_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_PAGINATION_VERSION
      status: "blocked"
      tocNodeId: string
      cursorBefore: VNextTocV4PaginationCursor
      cursorAfter: null
      pages: null
      issues: Array<{ code: string; severity: "error"; path: string; message: string }>
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function round(value: number): number {
  return Number(value.toFixed(2))
}

function issue(code: string, path: string, message: string) {
  return { code, severity: "error" as const, path, message }
}

function initialCursor(measurement: VNextTocV4MeasurementResult, startPageIndex: number): VNextTocV4PaginationCursor {
  return {
    contractVersion: 1, kind: "toc-pagination-cursor",
    tocNodeId: measurement.status === "measured" ? measurement.tocNodeId : "blocked",
    measurementFingerprint: measurement.status === "measured" ? measurement.fingerprint : "blocked",
    titlePlaced: measurement.status === "measured" && measurement.title == null,
    nextRowIndex: 0, nextPageIndex: startPageIndex,
    complete: measurement.status === "measured" && measurement.title == null && measurement.rows.length === 0,
  }
}

function blocked(
  tocNodeId: string,
  cursorBefore: VNextTocV4PaginationCursor,
  issues: ReturnType<typeof issue>[],
): VNextTocV4PaginationResult {
  return {
    source: VNEXT_TOC_V4_PAGINATION_SOURCE,
    contractVersion: VNEXT_TOC_V4_PAGINATION_VERSION,
    status: "blocked", tocNodeId, cursorBefore, cursorAfter: null, pages: null, issues,
  }
}

export function paginateVNextTocV4(input: {
  measurement: VNextTocV4MeasurementResult
  pageBodyHeightPt: number
  firstPageAvailableHeightPt?: number
  startPageIndex?: number
  maximumPageCount: number
  cursor?: VNextTocV4PaginationCursor
}): VNextTocV4PaginationResult {
  const startPageIndex = input.startPageIndex ?? 0
  const cursorBefore = clone(input.cursor ?? initialCursor(input.measurement, startPageIndex))
  const tocNodeId = input.measurement.status === "measured" ? input.measurement.tocNodeId : cursorBefore.tocNodeId
  const issues: ReturnType<typeof issue>[] = []
  if (input.measurement.status !== "measured") issues.push(issue(
    "measurement-blocked", "measurement", "TOC pagination requires a measured layout",
  ))
  if (!Number.isFinite(input.pageBodyHeightPt) || input.pageBodyHeightPt <= 0) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be positive and finite",
  ))
  const firstHeight = input.firstPageAvailableHeightPt ?? input.pageBodyHeightPt
  if (!Number.isFinite(firstHeight) || firstHeight < 0 || firstHeight > input.pageBodyHeightPt) issues.push(issue(
    "invalid-first-page-height", "firstPageAvailableHeightPt", "first page height must be between zero and full page body height",
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "invalid-start-page-index", "startPageIndex", "start page index must be non-negative",
  ))
  if (!Number.isInteger(input.maximumPageCount) || input.maximumPageCount <= 0) issues.push(issue(
    "invalid-maximum-page-count", "maximumPageCount", "maximum page count must be a positive integer",
  ))
  if (input.measurement.status === "measured") {
    if (cursorBefore.contractVersion !== 1 || cursorBefore.kind !== "toc-pagination-cursor") issues.push(issue(
      "cursor-contract-invalid", "cursor", "cursor contract version and kind must match TOC pagination v1",
    ))
    if (cursorBefore.tocNodeId !== input.measurement.tocNodeId
      || cursorBefore.measurementFingerprint !== input.measurement.fingerprint) issues.push(issue(
      "cursor-owner-mismatch", "cursor", "cursor must pin the exact measured TOC fingerprint",
    ))
    if (!Number.isInteger(cursorBefore.nextRowIndex) || cursorBefore.nextRowIndex < 0
      || cursorBefore.nextRowIndex > input.measurement.rows.length) issues.push(issue(
      "cursor-row-out-of-range", "cursor.nextRowIndex", "cursor row index is outside measured rows",
    ))
    if (!Number.isInteger(cursorBefore.nextPageIndex) || cursorBefore.nextPageIndex < 0) issues.push(issue(
      "cursor-page-invalid", "cursor.nextPageIndex", "cursor page index must be non-negative",
    ))
    if (input.measurement.title == null && !cursorBefore.titlePlaced) issues.push(issue(
      "cursor-title-state-invalid", "cursor.titlePlaced", "a TOC without a measured title must retain titlePlaced true",
    ))
    if (!cursorBefore.titlePlaced && cursorBefore.nextRowIndex !== 0) issues.push(issue(
      "cursor-title-row-order-invalid", "cursor.nextRowIndex", "rows cannot be consumed before the measured title",
    ))
    const expectedComplete = cursorBefore.titlePlaced && cursorBefore.nextRowIndex === input.measurement.rows.length
    if (cursorBefore.complete !== expectedComplete) issues.push(issue(
      "cursor-complete-mismatch", "cursor.complete", "cursor complete flag does not match retained progress",
    ))
  }
  if (issues.length > 0 || input.measurement.status !== "measured") return blocked(tocNodeId, cursorBefore, issues)
  const measurement: MeasuredToc = input.measurement
  let cursor = clone(cursorBefore)
  const pages: VNextTocV4PageFragment[] = []
  let rowVisitCount = 0
  let forcedOverflowCount = 0
  let freshPageAdvanceCount = 0

  while (!cursor.complete && pages.length < input.maximumPageCount) {
    const availableHeightPt = pages.length === 0 ? firstHeight : input.pageBodyHeightPt
    let usedHeightPt = 0
    let title: VNextTocV4PageFragment["title"] = null
    const rows: VNextTocV4PageFragment["rows"] = []
    const warnings: VNextTocV4PageFragment["warnings"] = []
    let freshPageAdvance = false

    if (!cursor.titlePlaced && measurement.title != null) {
      const firstRow = measurement.rows[cursor.nextRowIndex]
      const titleGap = firstRow == null ? 0 : Math.max(0, firstRow.yPt - measurement.title.heightPt)
      const bundleHeight = measurement.title.heightPt + titleGap + (firstRow?.heightPt ?? 0)
      if (firstRow != null && bundleHeight <= input.pageBodyHeightPt && bundleHeight > availableHeightPt) {
        freshPageAdvance = true
      } else if (measurement.title.heightPt > availableHeightPt
        && availableHeightPt < input.pageBodyHeightPt && measurement.title.heightPt <= input.pageBodyHeightPt) {
        freshPageAdvance = true
      } else {
        const forced = measurement.title.heightPt > input.pageBodyHeightPt
        title = { yPt: 0, heightPt: measurement.title.heightPt, forcedOverflow: forced }
        usedHeightPt = measurement.title.heightPt
        cursor.titlePlaced = true
        if (forced) {
          warnings.push({ code: "forced-title-overflow" })
          forcedOverflowCount += 1
        } else if (firstRow != null && bundleHeight > input.pageBodyHeightPt) {
          warnings.push({ code: "title-keep-with-first-unsatisfied" })
        } else if (firstRow != null) {
          usedHeightPt += titleGap
        }
      }
    }

    while (!freshPageAdvance && cursor.nextRowIndex < measurement.rows.length) {
      const row = measurement.rows[cursor.nextRowIndex]
      rowVisitCount += 1
      const rowGapPt = rows.length > 0 ? measurement.spec.rowGapPt : 0
      const remaining = availableHeightPt - usedHeightPt
      if (rowGapPt + row.heightPt <= remaining) {
        rows.push({
          rowIndex: cursor.nextRowIndex, identity: clone(row.identity), headingNodeId: row.headingNodeId,
          yPt: round(usedHeightPt + rowGapPt), heightPt: row.heightPt, forcedOverflow: false,
        })
        usedHeightPt += rowGapPt + row.heightPt
        cursor.nextRowIndex += 1
        continue
      }
      if (usedHeightPt > 0) break
      if (availableHeightPt < input.pageBodyHeightPt && row.heightPt <= input.pageBodyHeightPt) {
        freshPageAdvance = true
        break
      }
      rows.push({
        rowIndex: cursor.nextRowIndex, identity: clone(row.identity), headingNodeId: row.headingNodeId,
        yPt: 0, heightPt: row.heightPt, forcedOverflow: true,
      })
      warnings.push({ code: "forced-row-overflow", headingNodeId: row.headingNodeId })
      usedHeightPt = row.heightPt
      cursor.nextRowIndex += 1
      forcedOverflowCount += 1
      break
    }
    if (freshPageAdvance) freshPageAdvanceCount += 1
    cursor.complete = cursor.titlePlaced && cursor.nextRowIndex === measurement.rows.length
    const pageIndex = cursor.nextPageIndex
    cursor.nextPageIndex += 1
    pages.push({
      fragmentId: `${tocNodeId}:page-${pageIndex}`, tocNodeId, pageIndex,
      availableHeightPt, usedHeightPt: round(usedHeightPt),
      remainingHeightPt: round(availableHeightPt - usedHeightPt), complete: cursor.complete,
      freshPageAdvance, title, rows, warnings,
    })
  }
  const facts = {
    tocNodeId, measurementFingerprint: measurement.fingerprint,
    cursorBefore, cursorAfter: cursor, pages,
    summary: {
      pageCount: pages.length,
      placedRowCount: pages.reduce((total, page) => total + page.rows.length, 0),
      forcedOverflowCount, freshPageAdvanceCount,
    },
    work: { pageAttemptCount: pages.length, rowVisitCount, cursorCommitCount: pages.length },
    contracts: {
      measurementExecution: false as const, finalPageResolution: "not-run" as const,
      rendering: "not-run" as const, cursorCommit: "atomic-per-page" as const,
    },
  }
  return {
    source: VNEXT_TOC_V4_PAGINATION_SOURCE,
    contractVersion: VNEXT_TOC_V4_PAGINATION_VERSION,
    status: cursor.complete ? "complete" : "partial",
    ...facts, fingerprint: JSON.stringify(facts), issues: [],
  }
}
