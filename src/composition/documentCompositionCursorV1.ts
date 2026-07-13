import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { VNextCompositionFamilyCursorRefV1Schema, VNextCompositionNodeFamilyV1Schema } from "./fragmentWindowV1.js"
import {
  VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION,
  VNextDocumentCompositionCompactFingerprintV1Schema,
  parseVNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionContractIssueV1,
  type VNextDocumentCompositionManifestV1,
} from "./documentCompositionManifestV1.js"
import {
  parseVNextDocumentCompositionOpenPageV1,
  type VNextDocumentCompositionOpenPageV1,
} from "./documentCompositionPageV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_CURSOR_V1_SOURCE = "vnext-document-composition-cursor"

const NonBlankIdSchema = z.string().trim().min(1).max(512)
const PointSchema = z.number().finite().nonnegative()

const ActiveRootSchema = z.object({
  itemIndex: z.number().int().nonnegative(),
  rootNodeId: NonBlankIdSchema,
  family: VNextCompositionNodeFamilyV1Schema,
  familyCursor: VNextCompositionFamilyCursorRefV1Schema,
}).strict()

const CurrentPageSchema = z.object({
  pageIndex: z.number().int().nonnegative(),
  sectionPageIndex: z.number().int().nonnegative(),
  usedHeightPt: PointSchema,
  remainingHeightPt: PointSchema,
}).strict()

export const VNextDocumentCompositionCursorInputV1Schema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_CURSOR_V1_SOURCE),
  contractVersion: z.literal(VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION),
  kind: z.literal("document-composition-cursor"),
  documentId: NonBlankIdSchema,
  manifestFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  sectionIndex: z.number().int().nonnegative(),
  bodyItemIndex: z.number().int().nonnegative(),
  activeRoot: ActiveRootSchema.nullable(),
  nextPageIndex: z.number().int().nonnegative(),
  currentPage: CurrentPageSchema.nullable(),
  openPageFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema.nullable(),
  closedPrefix: z.object({
    fingerprint: VNextDocumentCompositionCompactFingerprintV1Schema.nullable(),
    pageCount: z.number().int().nonnegative(),
    placementCount: z.number().int().nonnegative(),
    headingCount: z.number().int().nonnegative(),
  }).strict(),
  cumulativeWork: z.object({
    windowsAccepted: z.number().int().nonnegative(),
    familyPagesConsumed: z.number().int().nonnegative(),
    placementsAccepted: z.number().int().nonnegative(),
    bodyItemsCompleted: z.number().int().nonnegative(),
    pageAdvances: z.number().int().nonnegative(),
    cursorCommits: z.number().int().nonnegative(),
  }).strict(),
  complete: z.boolean(),
}).strict()

export type VNextDocumentCompositionCursorInputV1 = z.infer<typeof VNextDocumentCompositionCursorInputV1Schema>
export type VNextDocumentCompositionCursorV1 = VNextDocumentCompositionCursorInputV1 & { fingerprint: string }

export type VNextDocumentCompositionCursorResultV1 =
  | { status: "ready"; cursor: VNextDocumentCompositionCursorV1; issues: [] }
  | { status: "blocked"; cursor: null; issues: VNextDocumentCompositionContractIssueV1[] }

export type VNextDocumentCompositionStateResultV1 =
  | {
      status: "ready"
      manifest: VNextDocumentCompositionManifestV1
      cursor: VNextDocumentCompositionCursorV1
      openPage: VNextDocumentCompositionOpenPageV1 | null
      issues: []
    }
  | {
      status: "blocked"
      manifest: null
      cursor: null
      openPage: null
      issues: VNextDocumentCompositionContractIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function issue(code: string, path: string, message: string): VNextDocumentCompositionContractIssueV1 {
  return { code, severity: "error", path, message }
}

function schemaIssues(error: z.ZodError): VNextDocumentCompositionContractIssueV1[] {
  return error.issues.map((item) => issue(
    "invalid-document-composition-cursor",
    item.path.map(String).join("."),
    item.message,
  ))
}

function cursorSemanticIssues(facts: VNextDocumentCompositionCursorInputV1): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if ((facts.closedPrefix.pageCount === 0) !== (facts.closedPrefix.fingerprint == null)) issues.push(issue(
    "composition-cursor-prefix-invalid",
    "closedPrefix",
    "only an empty closed-page prefix may have a null fingerprint",
  ))
  if (facts.cumulativeWork.bodyItemsCompleted !== facts.bodyItemIndex) issues.push(issue(
    "composition-cursor-body-work-mismatch",
    "cumulativeWork.bodyItemsCompleted",
    "completed body-item work must equal the next/active body-item index",
  ))
  if (facts.activeRoot != null && (
    facts.activeRoot.itemIndex !== facts.bodyItemIndex
    || facts.activeRoot.familyCursor.family !== facts.activeRoot.family
    || facts.activeRoot.familyCursor.rootNodeId !== facts.activeRoot.rootNodeId
    || facts.activeRoot.familyCursor.complete
  )) issues.push(issue(
    "composition-cursor-active-root-invalid",
    "activeRoot",
    "active root must own the current item and an incomplete exact family cursor",
  ))

  if (facts.complete) {
    if (facts.activeRoot != null || facts.currentPage != null || facts.openPageFingerprint != null) issues.push(issue(
      "composition-cursor-terminal-state-invalid",
      "complete",
      "complete cursor cannot retain an active root or open page",
    ))
    if (facts.closedPrefix.pageCount !== facts.nextPageIndex) issues.push(issue(
      "composition-cursor-terminal-page-count-mismatch",
      "nextPageIndex",
      "terminal next-page index must equal closed-page count",
    ))
  } else {
    if (facts.currentPage == null || facts.openPageFingerprint == null) issues.push(issue(
      "composition-cursor-open-page-missing",
      "currentPage",
      "incomplete cursor requires one open-page checkpoint",
    ))
    if (facts.currentPage != null) {
      if (facts.nextPageIndex !== facts.currentPage.pageIndex + 1
        || facts.closedPrefix.pageCount !== facts.currentPage.pageIndex) issues.push(issue(
        "composition-cursor-page-position-invalid",
        "currentPage.pageIndex",
        "open page must follow the exact closed prefix and reserve the next page index",
      ))
    }
  }
  return issues
}

export function finalizeVNextDocumentCompositionCursorV1(value: unknown): VNextDocumentCompositionCursorResultV1 {
  const parsed = VNextDocumentCompositionCursorInputV1Schema.safeParse(value)
  if (!parsed.success) return { status: "blocked", cursor: null, issues: schemaIssues(parsed.error) }
  const issues = cursorSemanticIssues(parsed.data)
  if (issues.length > 0) return { status: "blocked", cursor: null, issues }
  const facts = clone(parsed.data)
  return {
    status: "ready",
    cursor: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextDocumentCompositionCursorV1(value: unknown): VNextDocumentCompositionCursorResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked", cursor: null,
    issues: [issue("invalid-document-composition-cursor-envelope", "", "cursor must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  delete record.fingerprint
  if (typeof fingerprint !== "string" || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(fingerprint).success) return {
    status: "blocked", cursor: null,
    issues: [issue("invalid-document-composition-cursor-fingerprint", "fingerprint", "cursor requires a compact sha256 fingerprint")],
  }
  const finalized = finalizeVNextDocumentCompositionCursorV1(record)
  if (finalized.status === "blocked") return finalized
  if (finalized.cursor.fingerprint !== fingerprint) return {
    status: "blocked", cursor: null,
    issues: [issue("document-composition-cursor-fingerprint-mismatch", "fingerprint", "cursor facts do not match their fingerprint")],
  }
  return finalized
}

export function parseVNextDocumentCompositionStateV1(input: {
  manifest: unknown
  cursor: unknown
  openPage: unknown | null
}): VNextDocumentCompositionStateResultV1 {
  const manifestResult = parseVNextDocumentCompositionManifestV1(input.manifest)
  const cursorResult = parseVNextDocumentCompositionCursorV1(input.cursor)
  const openPageResult = input.openPage == null ? null : parseVNextDocumentCompositionOpenPageV1(input.openPage)
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (manifestResult.status === "blocked") issues.push(...manifestResult.issues)
  if (cursorResult.status === "blocked") issues.push(...cursorResult.issues)
  if (openPageResult?.status === "blocked") issues.push(...openPageResult.issues)
  if (issues.length > 0 || manifestResult.status === "blocked" || cursorResult.status === "blocked"
    || openPageResult?.status === "blocked") return {
    status: "blocked", manifest: null, cursor: null, openPage: null, issues,
  }

  const manifest = manifestResult.manifest
  const cursor = cursorResult.cursor
  const openPage = openPageResult?.page ?? null
  if (cursor.documentId !== manifest.documentId || cursor.manifestFingerprint !== manifest.fingerprint) issues.push(issue(
    "composition-state-owner-mismatch",
    "cursor",
    "cursor must pin the exact document composition manifest",
  ))
  if (cursor.bodyItemIndex > manifest.bodyItems.length || cursor.sectionIndex > manifest.sections.length) issues.push(issue(
    "composition-state-index-out-of-range",
    "cursor",
    "cursor section and body-item indexes must remain inside the manifest",
  ))
  if (cursor.nextPageIndex > manifest.limits.maximumDocumentPageCount
    || cursor.closedPrefix.placementCount > manifest.limits.maximumDocumentPlacementCount) issues.push(issue(
    "composition-state-document-limit-exceeded",
    "cursor",
    "cursor page and placement counts must remain inside manifest limits",
  ))
  if (cursor.complete) {
    if (cursor.bodyItemIndex !== manifest.bodyItems.length || cursor.sectionIndex !== manifest.sections.length) issues.push(issue(
      "composition-state-terminal-coverage-invalid",
      "cursor.complete",
      "complete cursor must cover every body item and section",
    ))
    if (openPage != null) issues.push(issue(
      "composition-state-terminal-open-page",
      "openPage",
      "complete state cannot retain an open page",
    ))
  } else if (openPage == null) issues.push(issue(
    "composition-state-open-page-missing",
    "openPage",
    "incomplete state requires the exact open page",
  ))

  if (openPage != null) {
    const section = manifest.sections[cursor.sectionIndex]
    if (section == null
      || openPage.documentId !== manifest.documentId
      || openPage.manifestFingerprint !== manifest.fingerprint
      || openPage.sectionIndex !== cursor.sectionIndex
      || openPage.sectionId !== section.sectionId
      || !exact(openPage.pageGeometry, section.pageGeometry)
      || !exact(openPage.staticZones, section.staticZones)) issues.push(issue(
      "composition-state-open-page-owner-mismatch",
      "openPage",
      "open page must pin the current manifest section geometry and static zones",
    ))
    if (cursor.openPageFingerprint !== openPage.fingerprint
      || cursor.currentPage == null
      || cursor.currentPage.pageIndex !== openPage.pageIndex
      || cursor.currentPage.sectionPageIndex !== openPage.sectionPageIndex
      || !near(cursor.currentPage.usedHeightPt, openPage.usedHeightPt)
      || !near(cursor.currentPage.remainingHeightPt, openPage.remainingHeightPt)) issues.push(issue(
      "composition-state-open-page-cursor-mismatch",
      "cursor.currentPage",
      "cursor must pin the exact open-page checkpoint and geometry",
    ))
    if (openPage.previousClosedPagePrefixFingerprint !== cursor.closedPrefix.fingerprint
      || openPage.closedPageCountBefore !== cursor.closedPrefix.pageCount
      || openPage.closedPlacementCountBefore !== cursor.closedPrefix.placementCount
      || openPage.closedHeadingCountBefore !== cursor.closedPrefix.headingCount) issues.push(issue(
      "composition-state-closed-prefix-mismatch",
      "openPage.previousClosedPagePrefixFingerprint",
      "open page must continue the exact cursor closed-page prefix",
    ))
    if (cursor.cumulativeWork.placementsAccepted
      !== cursor.closedPrefix.placementCount + openPage.placements.length) issues.push(issue(
      "composition-state-placement-work-mismatch",
      "cursor.cumulativeWork.placementsAccepted",
      "accepted placement work must equal closed plus open placements",
    ))
    if (openPage.placements.length > manifest.limits.maximumOpenPagePlacementCount
      || cursor.cumulativeWork.placementsAccepted > manifest.limits.maximumDocumentPlacementCount) issues.push(issue(
      "composition-state-placement-limit-exceeded",
      "openPage.placements",
      "open-page and cumulative placements must remain inside manifest limits",
    ))
  }

  const item = manifest.bodyItems[cursor.bodyItemIndex]
  if (cursor.activeRoot != null && (item == null
    || cursor.activeRoot.itemIndex !== item.itemIndex
    || cursor.activeRoot.rootNodeId !== item.rootNodeId
    || cursor.activeRoot.family !== item.family
    || cursor.activeRoot.familyCursor.ownerFingerprint !== item.ownerPins.measurement)) issues.push(issue(
    "composition-state-active-root-mismatch",
    "cursor.activeRoot",
    "active root must match the current manifest body item and measurement owner",
  ))

  return issues.length > 0
    ? { status: "blocked", manifest: null, cursor: null, openPage: null, issues }
    : { status: "ready", manifest, cursor, openPage, issues: [] }
}
