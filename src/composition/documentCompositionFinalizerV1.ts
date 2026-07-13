import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  parseVNextDocumentV4HeadingPageMap,
  type VNextDocumentV4HeadingPageMap,
} from "../toc/tocV4ResolutionInputs.js"
import {
  VNextDocumentCompositionCompactFingerprintV1Schema,
  parseVNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionContractIssueV1,
  type VNextDocumentCompositionManifestV1,
} from "./documentCompositionManifestV1.js"
import {
  parseVNextDocumentCompositionClosedPageV1,
  type VNextDocumentCompositionClosedPageV1,
} from "./documentCompositionPageV1.js"
import {
  parseVNextDocumentCompositionCursorV1,
  parseVNextDocumentCompositionStateV1,
  type VNextDocumentCompositionCursorV1,
} from "./documentCompositionCursorV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_SOURCE = "vnext-document-composition-page-plan"
export const VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_VERSION = 1 as const

const NonBlankIdSchema = z.string().trim().min(1).max(512)

const PagePlanInputSchema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_SOURCE),
  contractVersion: z.literal(VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_VERSION),
  kind: z.literal("document-composition-page-plan"),
  documentId: NonBlankIdSchema,
  manifestFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  terminalCursorFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  finalClosedPagePrefixFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  compositionFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  status: z.literal("complete"),
  pages: z.array(z.unknown()).min(1).max(1_000_000),
  summary: z.object({
    pageCount: z.number().int().positive(),
    placementCount: z.number().int().nonnegative(),
    headingCount: z.number().int().nonnegative(),
    intentionalBlankPageCount: z.number().int().nonnegative(),
    sectionCount: z.number().int().positive(),
  }).strict(),
}).strict()

type PagePlanInput = Omit<z.infer<typeof PagePlanInputSchema>, "pages"> & {
  pages: VNextDocumentCompositionClosedPageV1[]
}

export type VNextDocumentCompositionPagePlanV1 = PagePlanInput & { fingerprint: string }

export type VNextDocumentCompositionPagePlanResultV1 =
  | { status: "ready"; plan: VNextDocumentCompositionPagePlanV1; issues: [] }
  | { status: "blocked"; plan: null; issues: VNextDocumentCompositionContractIssueV1[] }

export type VNextDocumentCompositionFinalizationResultV1 =
  | {
      status: "ready"
      plan: VNextDocumentCompositionPagePlanV1
      headingPageMap: VNextDocumentV4HeadingPageMap
      issues: []
    }
  | {
      status: "blocked"
      plan: null
      headingPageMap: null
      issues: VNextDocumentCompositionContractIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function issue(code: string, path: string, message: string): VNextDocumentCompositionContractIssueV1 {
  return { code, severity: "error", path, message }
}

function compositionOwner(input: {
  manifestFingerprint: string
  terminalCursorFingerprint: string
  finalClosedPagePrefixFingerprint: string
  pageCount: number
  placementCount: number
  headingCount: number
}): string {
  return createVNextCompactFingerprint(JSON.stringify(input))
}

function parseClosedPages(values: readonly unknown[]): {
  pages: VNextDocumentCompositionClosedPageV1[]
  issues: VNextDocumentCompositionContractIssueV1[]
} {
  const pages: VNextDocumentCompositionClosedPageV1[] = []
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  values.forEach((value, index) => {
    const parsed = parseVNextDocumentCompositionClosedPageV1(value)
    if (parsed.status === "blocked") issues.push(...parsed.issues.map((item) => ({
      ...item,
      path: `pages[${index}]${item.path.length === 0 ? "" : `.${item.path}`}`,
    })))
    else pages.push(parsed.page)
  })
  return { pages, issues }
}

function pageChainIssues(
  pages: readonly VNextDocumentCompositionClosedPageV1[],
  manifest?: VNextDocumentCompositionManifestV1,
  terminalCursor?: VNextDocumentCompositionCursorV1,
): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  let placementCount = 0
  let headingCount = 0
  let previousPrefix: string | null = null
  let previousSectionIndex = -1
  let expectedSectionPageIndex = 0
  const fragmentIdentities = new Set<string>()
  const headingIds = new Set<string>()
  let previousItemIndex = -1

  pages.forEach((page, index) => {
    if (page.pageIndex !== index || page.pageNumber !== index + 1) issues.push(issue(
      "composition-plan-page-order-invalid",
      `pages[${index}]`,
      `expected document page ${index}`,
    ))
    if (page.previousClosedPagePrefixFingerprint !== previousPrefix) issues.push(issue(
      "composition-plan-prefix-chain-broken",
      `pages[${index}].previousClosedPagePrefixFingerprint`,
      "closed page must continue the exact prior prefix",
    ))
    if (page.closedPageCountBefore !== index
      || page.closedPlacementCountBefore !== placementCount
      || page.closedHeadingCountBefore !== headingCount) issues.push(issue(
      "composition-plan-cumulative-count-mismatch",
      `pages[${index}]`,
      "closed page cumulative counts must equal the exact accepted prefix",
    ))
    if (page.sectionIndex !== previousSectionIndex) {
      if (page.sectionIndex !== previousSectionIndex + 1) issues.push(issue(
        "composition-plan-section-order-invalid",
        `pages[${index}].sectionIndex`,
        `expected next section index ${previousSectionIndex + 1}`,
      ))
      expectedSectionPageIndex = 0
      previousSectionIndex = page.sectionIndex
    }
    if (page.sectionPageIndex !== expectedSectionPageIndex) issues.push(issue(
      "composition-plan-section-page-order-invalid",
      `pages[${index}].sectionPageIndex`,
      `expected section page index ${expectedSectionPageIndex}`,
    ))
    expectedSectionPageIndex += 1
    const section = manifest?.sections[page.sectionIndex]
    if (manifest != null && (page.documentId !== manifest.documentId
      || page.manifestFingerprint !== manifest.fingerprint
      || section == null
      || page.sectionId !== section.sectionId
      || !exact(page.pageGeometry, section.pageGeometry)
      || !exact(page.staticZones, section.staticZones))) issues.push(issue(
      "composition-plan-page-owner-mismatch",
      `pages[${index}]`,
      "page must pin its exact manifest section geometry and static zones",
    ))
    page.placements.forEach((placement, placementIndex) => {
      const item = manifest?.bodyItems[placement.itemIndex]
      if (manifest != null && (item == null
        || placement.sectionId !== item.sectionId
        || placement.zoneId !== item.zoneId
        || placement.sourceOrder !== item.sourceOrder
        || placement.rootNodeId !== item.rootNodeId
        || placement.rootNodeType !== item.rootNodeType
        || placement.family !== item.family)) issues.push(issue(
        "composition-plan-placement-owner-mismatch",
        `pages[${index}].placements[${placementIndex}]`,
        "placement must match its exact manifest body item",
      ))
      if (placement.itemIndex < previousItemIndex) issues.push(issue(
        "composition-plan-placement-order-invalid",
        `pages[${index}].placements[${placementIndex}].itemIndex`,
        "document placements must not move backward in canonical body-item order",
      ))
      previousItemIndex = placement.itemIndex
      const fragmentIdentity = `${placement.rootNodeId}\u0000${placement.fragmentId}`
      if (fragmentIdentities.has(fragmentIdentity)) issues.push(issue(
        "composition-plan-fragment-duplicate",
        `pages[${index}].placements[${placementIndex}].fragmentId`,
        `fragment ${placement.fragmentId} repeats for root ${placement.rootNodeId}`,
      ))
      fragmentIdentities.add(fragmentIdentity)
      if (placement.heading != null) {
        const expectedLevel = item?.headingLevel
        if (manifest != null && (expectedLevel == null || placement.heading.level !== expectedLevel)) issues.push(issue(
          "composition-plan-heading-level-mismatch",
          `pages[${index}].placements[${placementIndex}].heading`,
          `heading level ${placement.heading.level} must match manifest level ${String(expectedLevel)}`,
        ))
        if (headingIds.has(placement.heading.headingNodeId)) issues.push(issue(
          "composition-plan-heading-duplicate",
          `pages[${index}].placements[${placementIndex}].heading.headingNodeId`,
          `heading ${placement.heading.headingNodeId} appears more than once`,
        ))
        headingIds.add(placement.heading.headingNodeId)
        headingCount += 1
      }
    })
    placementCount += page.placements.length
    previousPrefix = page.closedPagePrefixFingerprint
  })

  if (manifest != null) {
    const expectedHeadings = manifest.bodyItems.filter((item) => item.headingLevel != null)
    const observedHeadings = pages.flatMap((page) => page.placements.flatMap((placement) => (
      placement.heading == null ? [] : [{ itemIndex: placement.itemIndex, headingNodeId: placement.heading.headingNodeId }]
    )))
    if (observedHeadings.length !== expectedHeadings.length
      || expectedHeadings.some((item, index) => observedHeadings[index]?.itemIndex !== item.itemIndex
        || observedHeadings[index]?.headingNodeId !== item.rootNodeId)) issues.push(issue(
      "composition-plan-heading-coverage-invalid",
      "pages",
      "heading first fragments must cover every manifest heading exactly once in canonical order",
    ))
  }
  if (terminalCursor != null && (
    pages.length !== terminalCursor.closedPrefix.pageCount
    || placementCount !== terminalCursor.closedPrefix.placementCount
    || headingCount !== terminalCursor.closedPrefix.headingCount
    || previousPrefix !== terminalCursor.closedPrefix.fingerprint
    || terminalCursor.cumulativeWork.placementsAccepted !== placementCount
    || terminalCursor.cumulativeWork.pageAdvances !== pages.length
  )) issues.push(issue(
    "composition-plan-terminal-prefix-mismatch",
    "terminalCursor",
    "terminal cursor must equal the complete closed-page prefix and semantic work",
  ))
  return issues
}

function planFacts(input: {
  documentId: string
  manifestFingerprint: string
  terminalCursorFingerprint: string
  finalClosedPagePrefixFingerprint: string
  pages: VNextDocumentCompositionClosedPageV1[]
  sectionCount: number
}): PagePlanInput {
  const placementCount = input.pages.reduce((count, page) => count + page.placements.length, 0)
  const headingCount = input.pages.reduce((count, page) => (
    count + page.placements.reduce((pageCount, placement) => pageCount + (placement.heading == null ? 0 : 1), 0)
  ), 0)
  const owner = compositionOwner({
    manifestFingerprint: input.manifestFingerprint,
    terminalCursorFingerprint: input.terminalCursorFingerprint,
    finalClosedPagePrefixFingerprint: input.finalClosedPagePrefixFingerprint,
    pageCount: input.pages.length,
    placementCount,
    headingCount,
  })
  return {
    source: VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_SOURCE,
    contractVersion: VNEXT_DOCUMENT_COMPOSITION_PAGE_PLAN_V1_VERSION,
    kind: "document-composition-page-plan",
    documentId: input.documentId,
    manifestFingerprint: input.manifestFingerprint,
    terminalCursorFingerprint: input.terminalCursorFingerprint,
    finalClosedPagePrefixFingerprint: input.finalClosedPagePrefixFingerprint,
    compositionFingerprint: owner,
    status: "complete",
    pages: clone(input.pages),
    summary: {
      pageCount: input.pages.length,
      placementCount,
      headingCount,
      intentionalBlankPageCount: input.pages.filter((page) => page.intentionalBlank).length,
      sectionCount: input.sectionCount,
    },
  }
}

export function parseVNextDocumentCompositionPagePlanV1(value: unknown): VNextDocumentCompositionPagePlanResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked", plan: null,
    issues: [issue("invalid-composition-page-plan", "", "page plan must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  delete record.fingerprint
  const parsed = PagePlanInputSchema.safeParse(record)
  if (!parsed.success) return {
    status: "blocked", plan: null,
    issues: parsed.error.issues.map((item) => issue(
      "invalid-composition-page-plan",
      item.path.map(String).join("."),
      item.message,
    )),
  }
  if (typeof fingerprint !== "string" || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(fingerprint).success) return {
    status: "blocked", plan: null,
    issues: [issue("invalid-composition-page-plan-fingerprint", "fingerprint", "page plan requires a compact sha256 fingerprint")],
  }
  const pageResult = parseClosedPages(parsed.data.pages)
  const pages = pageResult.pages
  const issues = [...pageResult.issues, ...pageChainIssues(pages)]
  if (pages.at(-1)?.closedPagePrefixFingerprint !== parsed.data.finalClosedPagePrefixFingerprint) issues.push(issue(
    "composition-page-plan-final-prefix-mismatch",
    "finalClosedPagePrefixFingerprint",
    "page plan final prefix must equal its final retained closed page",
  ))
  const expectedSummary = {
    pageCount: pages.length,
    placementCount: pages.reduce((count, page) => count + page.placements.length, 0),
    headingCount: pages.reduce((count, page) => count + page.placements.filter((placement) => placement.heading != null).length, 0),
    intentionalBlankPageCount: pages.filter((page) => page.intentionalBlank).length,
    sectionCount: new Set(pages.map((page) => page.sectionIndex)).size,
  }
  if (!exact(expectedSummary, parsed.data.summary)) issues.push(issue(
    "composition-page-plan-summary-mismatch",
    "summary",
    "page-plan summary must exactly match retained pages",
  ))
  const expectedOwner = compositionOwner({
    manifestFingerprint: parsed.data.manifestFingerprint,
    terminalCursorFingerprint: parsed.data.terminalCursorFingerprint,
    finalClosedPagePrefixFingerprint: parsed.data.finalClosedPagePrefixFingerprint,
    pageCount: expectedSummary.pageCount,
    placementCount: expectedSummary.placementCount,
    headingCount: expectedSummary.headingCount,
  })
  if (expectedOwner !== parsed.data.compositionFingerprint) issues.push(issue(
    "composition-page-plan-owner-mismatch",
    "compositionFingerprint",
    "composition owner does not match retained terminal page facts",
  ))
  const facts = { ...clone(parsed.data), pages }
  const expectedFingerprint = createVNextCompactFingerprint(JSON.stringify(facts))
  if (expectedFingerprint !== fingerprint) issues.push(issue(
    "composition-page-plan-fingerprint-mismatch",
    "fingerprint",
    "page-plan facts do not match retained fingerprint",
  ))
  return issues.length > 0
    ? { status: "blocked", plan: null, issues }
    : { status: "ready", plan: { ...facts, fingerprint }, issues: [] }
}

export function finalizeVNextDocumentCompositionV1(input: {
  manifest: unknown
  terminalCursor: unknown
  closedPages: readonly unknown[]
}): VNextDocumentCompositionFinalizationResultV1 {
  const manifestResult = parseVNextDocumentCompositionManifestV1(input.manifest)
  const cursorResult = parseVNextDocumentCompositionCursorV1(input.terminalCursor)
  const stateResult = parseVNextDocumentCompositionStateV1({
    manifest: input.manifest,
    cursor: input.terminalCursor,
    openPage: null,
  })
  const pageResult = parseClosedPages(input.closedPages)
  const issues: VNextDocumentCompositionContractIssueV1[] = [...pageResult.issues]
  if (manifestResult.status === "blocked") issues.push(...manifestResult.issues)
  if (cursorResult.status === "blocked") issues.push(...cursorResult.issues)
  if (stateResult.status === "blocked") issues.push(...stateResult.issues)
  if (issues.length > 0 || manifestResult.status === "blocked" || cursorResult.status === "blocked"
    || stateResult.status === "blocked") return { status: "blocked", plan: null, headingPageMap: null, issues }

  const manifest = manifestResult.manifest
  const terminalCursor = cursorResult.cursor
  const pages = pageResult.pages
  issues.push(...pageChainIssues(pages, manifest, terminalCursor))
  if (!terminalCursor.complete) issues.push(issue(
    "composition-finalizer-cursor-incomplete",
    "terminalCursor.complete",
    "authoritative finalization requires a complete cursor",
  ))
  if (pages.length > manifest.limits.maximumDocumentPageCount) issues.push(issue(
    "composition-finalizer-page-limit-exceeded",
    "closedPages",
    "closed pages exceed the manifest page limit",
  ))
  if (issues.length > 0 || terminalCursor.closedPrefix.fingerprint == null) return {
    status: "blocked", plan: null, headingPageMap: null, issues,
  }

  const facts = planFacts({
    documentId: manifest.documentId,
    manifestFingerprint: manifest.fingerprint,
    terminalCursorFingerprint: terminalCursor.fingerprint,
    finalClosedPagePrefixFingerprint: terminalCursor.closedPrefix.fingerprint,
    pages,
    sectionCount: manifest.sections.length,
  })
  const plan: VNextDocumentCompositionPagePlanV1 = {
    ...facts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  }
  const parsedPlan = parseVNextDocumentCompositionPagePlanV1(plan)
  if (parsedPlan.status === "blocked") return {
    status: "blocked", plan: null, headingPageMap: null, issues: parsedPlan.issues,
  }

  const headingEntries = pages.flatMap((page) => page.placements.flatMap((placement) => (
    placement.heading == null ? [] : [{
      headingNodeId: placement.heading.headingNodeId,
      sectionId: page.sectionId,
      sourceFragmentId: placement.fragmentId,
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
    }]
  )))
  const headingMapResult = parseVNextDocumentV4HeadingPageMap({
    source: "vnext-document-v4-heading-page-map",
    contractVersion: 1,
    kind: "document-v4-heading-page-map",
    documentId: manifest.documentId,
    documentPaginationFingerprint: plan.compositionFingerprint,
    status: "complete",
    pageCount: plan.summary.pageCount,
    entries: headingEntries,
  })
  if (headingMapResult.status === "blocked") return {
    status: "blocked", plan: null, headingPageMap: null, issues: headingMapResult.issues,
  }
  return { status: "ready", plan, headingPageMap: headingMapResult.map, issues: [] }
}
