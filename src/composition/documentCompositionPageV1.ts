import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1,
  VNextCompositionNodeFamilyV1Schema,
  VNextCompositionRootNodeTypeV1Schema,
} from "./fragmentWindowV1.js"
import {
  VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION,
  VNextDocumentCompositionCompactFingerprintV1Schema,
  VNextDocumentCompositionPageGeometryV1Schema,
  VNextDocumentCompositionStaticZoneRefV1Schema,
  type VNextDocumentCompositionContractIssueV1,
} from "./documentCompositionManifestV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_OPEN_PAGE_V1_SOURCE = "vnext-document-composition-open-page"
export const VNEXT_DOCUMENT_COMPOSITION_CLOSED_PAGE_V1_SOURCE = "vnext-document-composition-closed-page"
export const VNEXT_DOCUMENT_COMPOSITION_MAX_PAGE_PLACEMENTS = 100_000

const NonBlankIdSchema = z.string().trim().min(1).max(512)
const PointSchema = z.number().finite().nonnegative()
const HeadingSchema = z.object({
  headingNodeId: NonBlankIdSchema,
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
}).strict()

export const VNextDocumentCompositionPlacementV1Schema = z.object({
  placementIndex: z.number().int().nonnegative(),
  itemIndex: z.number().int().nonnegative(),
  sectionId: NonBlankIdSchema,
  zoneId: NonBlankIdSchema,
  sourceOrder: z.number().int().nonnegative(),
  rootNodeId: NonBlankIdSchema,
  rootNodeType: VNextCompositionRootNodeTypeV1Schema,
  family: VNextCompositionNodeFamilyV1Schema,
  fragmentId: NonBlankIdSchema,
  fragmentIndex: z.number().int().nonnegative(),
  sourceNodeId: NonBlankIdSchema,
  blockOffsetPt: PointSchema,
  blockExtentPt: z.number().finite().positive(),
  continuation: z.object({
    fromPrevious: z.boolean(),
    toNext: z.boolean(),
  }).strict(),
  familyEvidenceFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  familyWindowFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  heading: HeadingSchema.nullable(),
}).strict()

const PageFactsShape = {
  contractVersion: z.literal(VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION),
  documentId: NonBlankIdSchema,
  manifestFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  pageIndex: z.number().int().nonnegative(),
  pageNumber: z.number().int().positive(),
  sectionIndex: z.number().int().nonnegative(),
  sectionId: NonBlankIdSchema,
  sectionPageIndex: z.number().int().nonnegative(),
  pageGeometry: VNextDocumentCompositionPageGeometryV1Schema,
  staticZones: z.array(VNextDocumentCompositionStaticZoneRefV1Schema).max(4),
  placements: z.array(VNextDocumentCompositionPlacementV1Schema)
    .max(VNEXT_DOCUMENT_COMPOSITION_MAX_PAGE_PLACEMENTS),
  usedHeightPt: PointSchema,
  remainingHeightPt: PointSchema,
  intentionalBlank: z.boolean(),
  previousClosedPagePrefixFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema.nullable(),
  closedPageCountBefore: z.number().int().nonnegative(),
  closedPlacementCountBefore: z.number().int().nonnegative(),
  closedHeadingCountBefore: z.number().int().nonnegative(),
} as const

export const VNextDocumentCompositionOpenPageInputV1Schema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_OPEN_PAGE_V1_SOURCE),
  kind: z.literal("document-composition-open-page"),
  ...PageFactsShape,
}).strict()

export const VNextDocumentCompositionClosedPageInputV1Schema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_CLOSED_PAGE_V1_SOURCE),
  kind: z.literal("document-composition-closed-page"),
  ...PageFactsShape,
  closeReason: z.enum([
    "family-page-boundary",
    "family-continuation",
    "fresh-page-required",
    "page-break",
    "section-boundary",
    "document-complete",
  ]),
}).strict()

export type VNextDocumentCompositionPlacementV1 = z.infer<typeof VNextDocumentCompositionPlacementV1Schema>
export type VNextDocumentCompositionOpenPageInputV1 = z.infer<typeof VNextDocumentCompositionOpenPageInputV1Schema>
export type VNextDocumentCompositionOpenPageV1 = VNextDocumentCompositionOpenPageInputV1 & { fingerprint: string }
export type VNextDocumentCompositionClosedPageInputV1 = z.infer<typeof VNextDocumentCompositionClosedPageInputV1Schema>
export type VNextDocumentCompositionClosedPageV1 = VNextDocumentCompositionClosedPageInputV1 & {
  fingerprint: string
  closedPagePrefixFingerprint: string
}

export type VNextDocumentCompositionOpenPageResultV1 =
  | { status: "ready"; page: VNextDocumentCompositionOpenPageV1; issues: [] }
  | { status: "blocked"; page: null; issues: VNextDocumentCompositionContractIssueV1[] }

export type VNextDocumentCompositionClosedPageResultV1 =
  | { status: "ready"; page: VNextDocumentCompositionClosedPageV1; issues: [] }
  | { status: "blocked"; page: null; issues: VNextDocumentCompositionContractIssueV1[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function issue(code: string, path: string, message: string): VNextDocumentCompositionContractIssueV1 {
  return { code, severity: "error", path, message }
}

function schemaIssues(error: z.ZodError): VNextDocumentCompositionContractIssueV1[] {
  return error.issues.map((item) => issue(
    "invalid-document-composition-page",
    item.path.map(String).join("."),
    item.message,
  ))
}

function pageSemanticIssues(
  facts: VNextDocumentCompositionOpenPageInputV1 | VNextDocumentCompositionClosedPageInputV1,
): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (facts.pageNumber !== facts.pageIndex + 1) issues.push(issue(
    "composition-page-number-mismatch",
    "pageNumber",
    "pageNumber must equal pageIndex + 1",
  ))
  if (!near(facts.usedHeightPt + facts.remainingHeightPt, facts.pageGeometry.bodyHeightPt)) issues.push(issue(
    "composition-page-height-drift",
    "usedHeightPt",
    "used and remaining height must equal the section body height",
  ))
  if (facts.pageGeometry.bodyOriginXPt + facts.pageGeometry.bodyWidthPt > facts.pageGeometry.pageWidthPt + 0.01
    || facts.pageGeometry.bodyOriginYPt + facts.pageGeometry.bodyHeightPt > facts.pageGeometry.pageHeightPt + 0.01) issues.push(issue(
    "composition-page-body-out-of-page",
    "pageGeometry",
    "body geometry must fit inside page geometry",
  ))
  if (facts.closedPageCountBefore !== facts.pageIndex) issues.push(issue(
    "composition-page-prefix-count-mismatch",
    "closedPageCountBefore",
    "closed-page prefix count must equal the page index",
  ))
  if ((facts.pageIndex === 0) !== (facts.previousClosedPagePrefixFingerprint == null)) issues.push(issue(
    "composition-page-prefix-owner-invalid",
    "previousClosedPagePrefixFingerprint",
    "only page zero may start without a previous closed-page prefix",
  ))
  const staticRoles = new Set<string>()
  const staticIds = new Set<string>()
  facts.staticZones.forEach((zone, index) => {
    if (staticRoles.has(zone.role) || staticIds.has(zone.zoneId)) issues.push(issue(
      "composition-page-static-zone-duplicate",
      `staticZones[${index}]`,
      "static zone roles and ids must be unique on a page",
    ))
    staticRoles.add(zone.role)
    staticIds.add(zone.zoneId)
  })

  const fragmentIds = new Set<string>()
  const headingIds = new Set<string>()
  let previousEnd = 0
  facts.placements.forEach((placement, index) => {
    if (placement.placementIndex !== index) issues.push(issue(
      "composition-placement-order-invalid",
      `placements[${index}].placementIndex`,
      `expected contiguous placement index ${index}`,
    ))
    if (placement.sectionId !== facts.sectionId) issues.push(issue(
      "composition-placement-section-mismatch",
      `placements[${index}].sectionId`,
      "placement must belong to the page section",
    ))
    if (!(VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1[placement.family] as readonly string[]).includes(placement.rootNodeType)) issues.push(issue(
      "composition-placement-family-root-mismatch",
      `placements[${index}].rootNodeType`,
      `${placement.family} cannot own root node type ${placement.rootNodeType}`,
    ))
    if (placement.blockOffsetPt + 0.01 < previousEnd) issues.push(issue(
      "composition-placement-overlap",
      `placements[${index}].blockOffsetPt`,
      "ordered document placements must not overlap",
    ))
    const end = placement.blockOffsetPt + placement.blockExtentPt
    if (end > facts.usedHeightPt + 0.01) issues.push(issue(
      "composition-placement-out-of-page",
      `placements[${index}]`,
      "placement extent must fit inside committed page height",
    ))
    previousEnd = end
    if (fragmentIds.has(placement.fragmentId)) issues.push(issue(
      "composition-page-fragment-duplicate",
      `placements[${index}].fragmentId`,
      `fragment ${placement.fragmentId} appears more than once on the page`,
    ))
    fragmentIds.add(placement.fragmentId)
    if (placement.heading != null) {
      if (placement.family !== "text-flow"
        || placement.heading.headingNodeId !== placement.rootNodeId
        || placement.sourceNodeId !== placement.rootNodeId
        || placement.fragmentIndex !== 0
        || placement.continuation.fromPrevious) issues.push(issue(
        "composition-page-heading-first-fragment-invalid",
        `placements[${index}].heading`,
        "heading identity belongs only to the first non-continuation text-flow root fragment",
      ))
      if (headingIds.has(placement.heading.headingNodeId)) issues.push(issue(
        "composition-page-heading-duplicate",
        `placements[${index}].heading.headingNodeId`,
        `heading ${placement.heading.headingNodeId} appears more than once on the page`,
      ))
      headingIds.add(placement.heading.headingNodeId)
    }
  })
  if (facts.intentionalBlank && (facts.placements.length > 0 || !near(facts.usedHeightPt, 0))) issues.push(issue(
    "composition-intentional-blank-geometry-invalid",
    "intentionalBlank",
    "an intentional blank page cannot retain content placements or used height",
  ))
  if ("closeReason" in facts && facts.intentionalBlank && facts.closeReason !== "page-break") issues.push(issue(
    "composition-intentional-blank-reason-invalid",
    "closeReason",
    "only page-break may close an intentional blank page",
  ))
  return issues
}

export function finalizeVNextDocumentCompositionOpenPageV1(value: unknown): VNextDocumentCompositionOpenPageResultV1 {
  const parsed = VNextDocumentCompositionOpenPageInputV1Schema.safeParse(value)
  if (!parsed.success) return { status: "blocked", page: null, issues: schemaIssues(parsed.error) }
  const issues = pageSemanticIssues(parsed.data)
  if (issues.length > 0) return { status: "blocked", page: null, issues }
  const facts = clone(parsed.data)
  return {
    status: "ready",
    page: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextDocumentCompositionOpenPageV1(value: unknown): VNextDocumentCompositionOpenPageResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked", page: null,
    issues: [issue("invalid-document-composition-open-page", "", "open page must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  delete record.fingerprint
  if (typeof fingerprint !== "string" || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(fingerprint).success) return {
    status: "blocked", page: null,
    issues: [issue("invalid-document-composition-page-fingerprint", "fingerprint", "open page requires a compact sha256 fingerprint")],
  }
  const finalized = finalizeVNextDocumentCompositionOpenPageV1(record)
  if (finalized.status === "blocked") return finalized
  if (finalized.page.fingerprint !== fingerprint) return {
    status: "blocked", page: null,
    issues: [issue("document-composition-page-fingerprint-mismatch", "fingerprint", "open-page facts do not match their fingerprint")],
  }
  return finalized
}

export function finalizeVNextDocumentCompositionClosedPageV1(value: unknown): VNextDocumentCompositionClosedPageResultV1 {
  const parsed = VNextDocumentCompositionClosedPageInputV1Schema.safeParse(value)
  if (!parsed.success) return { status: "blocked", page: null, issues: schemaIssues(parsed.error) }
  const issues = pageSemanticIssues(parsed.data)
  if (issues.length > 0) return { status: "blocked", page: null, issues }
  const facts = clone(parsed.data)
  const fingerprint = createVNextCompactFingerprint(JSON.stringify(facts))
  const closedPagePrefixFingerprint = createVNextCompactFingerprint(JSON.stringify({
    previous: facts.previousClosedPagePrefixFingerprint,
    page: fingerprint,
  }))
  return {
    status: "ready",
    page: { ...facts, fingerprint, closedPagePrefixFingerprint },
    issues: [],
  }
}

export function parseVNextDocumentCompositionClosedPageV1(value: unknown): VNextDocumentCompositionClosedPageResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked", page: null,
    issues: [issue("invalid-document-composition-closed-page", "", "closed page must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  const prefix = record.closedPagePrefixFingerprint
  delete record.fingerprint
  delete record.closedPagePrefixFingerprint
  if (typeof fingerprint !== "string" || typeof prefix !== "string"
    || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(fingerprint).success
    || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(prefix).success) return {
    status: "blocked", page: null,
    issues: [issue("invalid-document-composition-closed-page-fingerprint", "fingerprint", "closed page requires compact page and prefix fingerprints")],
  }
  const finalized = finalizeVNextDocumentCompositionClosedPageV1(record)
  if (finalized.status === "blocked") return finalized
  if (finalized.page.fingerprint !== fingerprint || finalized.page.closedPagePrefixFingerprint !== prefix) return {
    status: "blocked", page: null,
    issues: [issue("document-composition-closed-page-fingerprint-mismatch", "fingerprint", "closed-page facts or prefix do not match retained fingerprints")],
  }
  return finalized
}
