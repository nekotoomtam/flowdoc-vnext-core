import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextTocV4MeasurementResult } from "./tocV4Measurement.js"
import type {
  VNextTocV4PageFragment,
  VNextTocV4PaginationCursor,
  VNextTocV4PaginationResult,
} from "./tocV4Pagination.js"

export const VNEXT_TOC_V4_PAGINATION_MANIFEST_SOURCE = "vnext-toc-v4-pagination-manifest"
export const VNEXT_DOCUMENT_V4_HEADING_PAGE_MAP_SOURCE = "vnext-document-v4-heading-page-map"
export const VNEXT_TOC_V4_RESOLUTION_INPUT_VERSION = 1 as const

type MeasuredToc = Extract<VNextTocV4MeasurementResult, { status: "measured" }>
type AcceptedWindow = Extract<VNextTocV4PaginationResult, { status: "complete" | "partial" }>

export interface VNextTocV4PaginationManifest {
  source: typeof VNEXT_TOC_V4_PAGINATION_MANIFEST_SOURCE
  contractVersion: 1
  kind: "toc-pagination-manifest"
  tocNodeId: string
  measurementFingerprint: string
  cursorBefore: VNextTocV4PaginationCursor
  cursorAfter: VNextTocV4PaginationCursor
  pages: VNextTocV4PageFragment[]
  summary: { windowCount: number; pageCount: number; rowCount: number; warningCount: number }
  fingerprint: string
}

export type VNextTocV4PaginationManifestResult =
  | { status: "ready"; manifest: VNextTocV4PaginationManifest; issues: [] }
  | { status: "blocked"; manifest: null; issues: Array<{ code: string; severity: "error"; path: string; message: string }> }

const HeadingPageEntrySchema = z.object({
  headingNodeId: z.string().min(1),
  sectionId: z.string().min(1),
  sourceFragmentId: z.string().min(1),
  pageIndex: z.number().int().nonnegative(),
  pageNumber: z.number().int().positive(),
}).strict()

const HeadingPageMapInputSchema = z.object({
  source: z.literal(VNEXT_DOCUMENT_V4_HEADING_PAGE_MAP_SOURCE),
  contractVersion: z.literal(VNEXT_TOC_V4_RESOLUTION_INPUT_VERSION),
  kind: z.literal("document-v4-heading-page-map"),
  documentId: z.string().min(1),
  documentPaginationFingerprint: z.string().min(1),
  status: z.literal("complete"),
  pageCount: z.number().int().positive(),
  entries: z.array(HeadingPageEntrySchema),
}).strict()

export type VNextDocumentV4HeadingPageMapInput = z.infer<typeof HeadingPageMapInputSchema>
export type VNextDocumentV4HeadingPageMap = VNextDocumentV4HeadingPageMapInput & { fingerprint: string }
export type VNextDocumentV4HeadingPageMapResult =
  | { status: "ready"; map: VNextDocumentV4HeadingPageMap; issues: [] }
  | { status: "blocked"; map: null; issues: Array<{ code: string; severity: "error"; path: string; message: string }> }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function issue(code: string, path: string, message: string) {
  return { code, severity: "error" as const, path, message }
}

export function finalizeVNextTocV4PaginationWindows(input: {
  measurement: VNextTocV4MeasurementResult
  windows: readonly VNextTocV4PaginationResult[]
}): VNextTocV4PaginationManifestResult {
  const issues: ReturnType<typeof issue>[] = []
  if (input.measurement.status !== "measured") issues.push(issue(
    "measurement-blocked", "measurement", "pagination manifest requires a measured TOC",
  ))
  if (input.windows.length === 0) issues.push(issue(
    "pagination-windows-empty", "windows", "pagination manifest requires at least one window",
  ))
  input.windows.forEach((window, index) => {
    if (window.status === "blocked") issues.push(issue(
      "pagination-window-blocked", `windows[${index}]`, "blocked pagination windows cannot enter a manifest",
    ))
  })
  if (issues.length > 0 || input.measurement.status !== "measured") return { status: "blocked", manifest: null, issues }
  const measurement: MeasuredToc = input.measurement
  const windows = input.windows as readonly AcceptedWindow[]
  const first = windows[0]
  const expectedInitial: Pick<VNextTocV4PaginationCursor, "titlePlaced" | "nextRowIndex" | "complete"> = {
    titlePlaced: measurement.title == null,
    nextRowIndex: 0,
    complete: measurement.title == null && measurement.rows.length === 0,
  }
  if (first.tocNodeId !== measurement.tocNodeId
    || first.measurementFingerprint !== measurement.fingerprint
    || first.cursorBefore.tocNodeId !== measurement.tocNodeId
    || first.cursorBefore.measurementFingerprint !== measurement.fingerprint) issues.push(issue(
    "manifest-owner-mismatch", "windows[0]", "first window must pin the exact measured TOC",
  ))
  if (first.cursorBefore.titlePlaced !== expectedInitial.titlePlaced
    || first.cursorBefore.nextRowIndex !== 0
    || first.cursorBefore.complete !== expectedInitial.complete) issues.push(issue(
    "manifest-start-cursor-invalid", "windows[0].cursorBefore", "manifest must start before the first measured title/row",
  ))
  windows.forEach((window, index) => {
    if (window.tocNodeId !== measurement.tocNodeId || window.measurementFingerprint !== measurement.fingerprint) issues.push(issue(
      "manifest-window-owner-mismatch", `windows[${index}]`, "all windows must pin the same measured TOC",
    ))
    if (index > 0 && !exact(windows[index - 1].cursorAfter, window.cursorBefore)) issues.push(issue(
      "manifest-cursor-chain-broken", `windows[${index}].cursorBefore`, "window cursor chain must be exact and contiguous",
    ))
    if (index < windows.length - 1 && window.status !== "partial") issues.push(issue(
      "manifest-premature-complete-window", `windows[${index}].status`, "only the final window may be complete",
    ))
  })
  const finalWindow = windows.at(-1)!
  if (finalWindow.status !== "complete" || !finalWindow.cursorAfter.complete) issues.push(issue(
    "manifest-final-window-incomplete", `windows[${windows.length - 1}]`, "final pagination window and cursor must be complete",
  ))
  const pages = windows.flatMap((window) => clone(window.pages))
  let expectedPageIndex = first.cursorBefore.nextPageIndex
  pages.forEach((page, index) => {
    if (page.pageIndex !== expectedPageIndex) issues.push(issue(
      "manifest-page-order-invalid", `pages[${index}].pageIndex`, `expected contiguous page index ${expectedPageIndex}`,
    ))
    expectedPageIndex += 1
  })
  const rowPlacements = pages.flatMap((page) => page.rows)
  rowPlacements.forEach((placement, index) => {
    const expectedRow = measurement.rows[index]
    if (placement.rowIndex !== index || expectedRow == null || !exact(placement.identity, expectedRow.identity)) issues.push(issue(
      "manifest-row-coverage-invalid", `rowPlacements[${index}]`, "row placements must cover measured rows exactly once in order",
    ))
  })
  if (rowPlacements.length !== measurement.rows.length) issues.push(issue(
    "manifest-row-count-mismatch", "pages", `manifest placed ${rowPlacements.length} of ${measurement.rows.length} measured rows`,
  ))
  const titlePlacementCount = pages.filter((page) => page.title != null).length
  if (titlePlacementCount !== (measurement.title == null ? 0 : 1)) issues.push(issue(
    "manifest-title-coverage-invalid", "pages", "manifest must place the measured title exactly once when present",
  ))
  if (issues.length > 0) return { status: "blocked", manifest: null, issues }
  const facts: Omit<VNextTocV4PaginationManifest, "fingerprint"> = {
    source: VNEXT_TOC_V4_PAGINATION_MANIFEST_SOURCE,
    contractVersion: VNEXT_TOC_V4_RESOLUTION_INPUT_VERSION,
    kind: "toc-pagination-manifest" as const,
    tocNodeId: measurement.tocNodeId,
    measurementFingerprint: measurement.fingerprint,
    cursorBefore: clone(first.cursorBefore), cursorAfter: clone(finalWindow.cursorAfter), pages,
    summary: {
      windowCount: windows.length, pageCount: pages.length, rowCount: rowPlacements.length,
      warningCount: pages.reduce((total, page) => total + page.warnings.length, 0),
    },
  }
  return { status: "ready", manifest: { ...facts, fingerprint: JSON.stringify(facts) }, issues: [] }
}

export function parseVNextDocumentV4HeadingPageMap(value: unknown): VNextDocumentV4HeadingPageMapResult {
  const parsed = HeadingPageMapInputSchema.safeParse(value)
  if (!parsed.success) return {
    status: "blocked", map: null,
    issues: parsed.error.issues.map((item) => issue(
      "invalid-heading-page-map", item.path.map(String).join("."), item.message,
    )),
  }
  const facts = parsed.data
  const issues: ReturnType<typeof issue>[] = []
  const headingIds = new Set<string>()
  facts.entries.forEach((entry, index) => {
    if (headingIds.has(entry.headingNodeId)) issues.push(issue(
      "duplicate-heading-page-entry", `entries[${index}].headingNodeId`, `heading "${entry.headingNodeId}" appears more than once`,
    ))
    headingIds.add(entry.headingNodeId)
    if (entry.pageIndex >= facts.pageCount) issues.push(issue(
      "heading-page-index-out-of-range", `entries[${index}].pageIndex`, `page index must be below pageCount ${facts.pageCount}`,
    ))
  })
  if (issues.length > 0) return { status: "blocked", map: null, issues }
  return {
    status: "ready",
    map: { ...clone(facts), fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}
