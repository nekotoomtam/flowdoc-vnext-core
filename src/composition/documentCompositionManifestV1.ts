import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS,
  VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES,
  VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1,
  VNextCompositionFamilyCursorRefV1Schema,
  VNextCompositionNodeFamilyV1Schema,
  VNextCompositionRootNodeTypeV1Schema,
} from "./fragmentWindowV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_MANIFEST_V1_SOURCE = "vnext-document-composition-manifest"
export const VNEXT_DOCUMENT_COMPOSITION_DEMAND_V1_SOURCE = "vnext-document-composition-demand"
export const VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION = 1 as const
export const VNEXT_DOCUMENT_COMPOSITION_MAX_SECTIONS = 10_000
export const VNEXT_DOCUMENT_COMPOSITION_MAX_BODY_ITEMS = 100_000
export const VNEXT_DOCUMENT_COMPOSITION_MAX_STATIC_ZONES_PER_SECTION = 4

const NonBlankIdSchema = z.string().trim().min(1).max(512)
export const VNextDocumentCompositionCompactFingerprintV1Schema = z.string()
  .regex(/^sha256:[a-f0-9]{64}$/u)
const PointSchema = z.number().finite().nonnegative()

export const VNextDocumentCompositionPageGeometryV1Schema = z.object({
  pageWidthPt: z.number().finite().positive(),
  pageHeightPt: z.number().finite().positive(),
  bodyOriginXPt: PointSchema,
  bodyOriginYPt: PointSchema,
  bodyWidthPt: z.number().finite().positive(),
  bodyHeightPt: z.number().finite().positive(),
}).strict()

export const VNextDocumentCompositionStaticZoneRefV1Schema = z.object({
  role: z.enum(["header", "footer", "first-page-header", "first-page-footer"]),
  zoneId: NonBlankIdSchema,
  evidenceFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
}).strict()

export const VNextDocumentCompositionStableOwnerPinsV1Schema = z.object({
  documentStructure: VNextDocumentCompositionCompactFingerprintV1Schema,
  resolvedProjection: VNextDocumentCompositionCompactFingerprintV1Schema,
  familySource: VNextDocumentCompositionCompactFingerprintV1Schema,
  measurement: VNextDocumentCompositionCompactFingerprintV1Schema,
}).strict()

export const VNextDocumentCompositionSectionV1Schema = z.object({
  sectionIndex: z.number().int().nonnegative(),
  sectionId: NonBlankIdSchema,
  pageGeometry: VNextDocumentCompositionPageGeometryV1Schema,
  staticZones: z.array(VNextDocumentCompositionStaticZoneRefV1Schema)
    .max(VNEXT_DOCUMENT_COMPOSITION_MAX_STATIC_ZONES_PER_SECTION),
}).strict()

export const VNextDocumentCompositionBodyItemV1Schema = z.object({
  itemIndex: z.number().int().nonnegative(),
  sectionIndex: z.number().int().nonnegative(),
  sectionId: NonBlankIdSchema,
  zoneOrder: z.number().int().nonnegative(),
  zoneId: NonBlankIdSchema,
  sourceOrder: z.number().int().nonnegative(),
  rootNodeId: NonBlankIdSchema,
  rootNodeType: VNextCompositionRootNodeTypeV1Schema,
  family: VNextCompositionNodeFamilyV1Schema,
  headingLevel: z.union([
    z.literal(1), z.literal(2), z.literal(3),
    z.literal(4), z.literal(5), z.literal(6),
  ]).nullable(),
  ownerPins: VNextDocumentCompositionStableOwnerPinsV1Schema,
  initialCursor: VNextCompositionFamilyCursorRefV1Schema,
}).strict()

export const VNextDocumentCompositionManifestInputV1Schema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_MANIFEST_V1_SOURCE),
  contractVersion: z.literal(VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION),
  kind: z.literal("document-composition-manifest"),
  documentId: NonBlankIdSchema,
  documentStructureFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  resolvedProjectionFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  sections: z.array(VNextDocumentCompositionSectionV1Schema)
    .min(1)
    .max(VNEXT_DOCUMENT_COMPOSITION_MAX_SECTIONS),
  bodyItems: z.array(VNextDocumentCompositionBodyItemV1Schema)
    .max(VNEXT_DOCUMENT_COMPOSITION_MAX_BODY_ITEMS),
  limits: z.object({
    maximumDocumentPageCount: z.number().int().positive().max(1_000_000),
    maximumDocumentPlacementCount: z.number().int().positive().max(10_000_000),
    maximumOpenPagePlacementCount: z.number().int().positive().max(100_000),
  }).strict(),
}).strict()

export const VNextDocumentCompositionDemandInputV1Schema = z.object({
  source: z.literal(VNEXT_DOCUMENT_COMPOSITION_DEMAND_V1_SOURCE),
  contractVersion: z.literal(VNEXT_DOCUMENT_COMPOSITION_CONTRACT_VERSION),
  kind: z.literal("document-composition-demand"),
  documentId: NonBlankIdSchema,
  manifestFingerprint: VNextDocumentCompositionCompactFingerprintV1Schema,
  itemIndex: z.number().int().nonnegative(),
  sectionIndex: z.number().int().nonnegative(),
  sectionId: NonBlankIdSchema,
  zoneId: NonBlankIdSchema,
  sourceOrder: z.number().int().nonnegative(),
  rootNodeId: NonBlankIdSchema,
  rootNodeType: VNextCompositionRootNodeTypeV1Schema,
  family: VNextCompositionNodeFamilyV1Schema,
  ownerPins: VNextDocumentCompositionStableOwnerPinsV1Schema,
  cursorBefore: VNextCompositionFamilyCursorRefV1Schema,
  capacity: z.object({
    pageBodyHeightPt: z.number().finite().positive(),
    firstPageAvailableHeightPt: PointSchema,
    maximumPageCount: z.number().int().positive().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES),
    maximumFragmentCount: z.number().int().positive().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS),
  }).strict(),
}).strict()

export type VNextDocumentCompositionPageGeometryV1 = z.infer<typeof VNextDocumentCompositionPageGeometryV1Schema>
export type VNextDocumentCompositionStaticZoneRefV1 = z.infer<typeof VNextDocumentCompositionStaticZoneRefV1Schema>
export type VNextDocumentCompositionStableOwnerPinsV1 = z.infer<typeof VNextDocumentCompositionStableOwnerPinsV1Schema>
export type VNextDocumentCompositionSectionV1 = z.infer<typeof VNextDocumentCompositionSectionV1Schema>
export type VNextDocumentCompositionBodyItemV1 = z.infer<typeof VNextDocumentCompositionBodyItemV1Schema>
export type VNextDocumentCompositionManifestInputV1 = z.infer<typeof VNextDocumentCompositionManifestInputV1Schema>
export type VNextDocumentCompositionManifestV1 = VNextDocumentCompositionManifestInputV1 & { fingerprint: string }
export type VNextDocumentCompositionDemandInputV1 = z.infer<typeof VNextDocumentCompositionDemandInputV1Schema>
export type VNextDocumentCompositionDemandV1 = VNextDocumentCompositionDemandInputV1 & { fingerprint: string }

export interface VNextDocumentCompositionContractIssueV1 {
  code: string
  severity: "error"
  path: string
  message: string
}

export type VNextDocumentCompositionManifestResultV1 =
  | { status: "ready"; manifest: VNextDocumentCompositionManifestV1; issues: [] }
  | { status: "blocked"; manifest: null; issues: VNextDocumentCompositionContractIssueV1[] }

export type VNextDocumentCompositionDemandResultV1 =
  | { status: "ready"; demand: VNextDocumentCompositionDemandV1; issues: [] }
  | { status: "blocked"; demand: null; issues: VNextDocumentCompositionContractIssueV1[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string): VNextDocumentCompositionContractIssueV1 {
  return { code, severity: "error", path, message }
}

function schemaIssues(error: z.ZodError): VNextDocumentCompositionContractIssueV1[] {
  return error.issues.map((item) => issue(
    "invalid-document-composition-contract",
    item.path.map(String).join("."),
    item.message,
  ))
}

function pageGeometryIssues(
  geometry: VNextDocumentCompositionPageGeometryV1,
  path: string,
): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (geometry.bodyOriginXPt + geometry.bodyWidthPt > geometry.pageWidthPt + 0.01) issues.push(issue(
    "composition-body-width-out-of-page",
    `${path}.bodyWidthPt`,
    "body horizontal geometry must fit inside the page",
  ))
  if (geometry.bodyOriginYPt + geometry.bodyHeightPt > geometry.pageHeightPt + 0.01) issues.push(issue(
    "composition-body-height-out-of-page",
    `${path}.bodyHeightPt`,
    "body vertical geometry must fit inside the page",
  ))
  return issues
}

function manifestSemanticIssues(facts: VNextDocumentCompositionManifestInputV1): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (facts.limits.maximumOpenPagePlacementCount > facts.limits.maximumDocumentPlacementCount) issues.push(issue(
    "composition-open-page-limit-invalid",
    "limits.maximumOpenPagePlacementCount",
    "open-page placement limit cannot exceed the whole-document placement limit",
  ))
  const sectionIds = new Set<string>()
  facts.sections.forEach((section, index) => {
    if (section.sectionIndex !== index) issues.push(issue(
      "composition-section-order-invalid",
      `sections[${index}].sectionIndex`,
      `expected contiguous section index ${index}`,
    ))
    if (sectionIds.has(section.sectionId)) issues.push(issue(
      "composition-section-duplicate",
      `sections[${index}].sectionId`,
      `section ${section.sectionId} appears more than once`,
    ))
    sectionIds.add(section.sectionId)
    issues.push(...pageGeometryIssues(section.pageGeometry, `sections[${index}].pageGeometry`))
    const roles = new Set<string>()
    const zoneIds = new Set<string>()
    section.staticZones.forEach((zone, zoneIndex) => {
      if (roles.has(zone.role)) issues.push(issue(
        "composition-static-zone-role-duplicate",
        `sections[${index}].staticZones[${zoneIndex}].role`,
        `static role ${zone.role} appears more than once in a section`,
      ))
      if (zoneIds.has(zone.zoneId)) issues.push(issue(
        "composition-static-zone-id-duplicate",
        `sections[${index}].staticZones[${zoneIndex}].zoneId`,
        `static zone ${zone.zoneId} appears more than once in a section`,
      ))
      roles.add(zone.role)
      zoneIds.add(zone.zoneId)
    })
  })

  const rootIds = new Set<string>()
  let previousOrder: readonly [number, number, number] | null = null
  facts.bodyItems.forEach((item, index) => {
    if (item.itemIndex !== index) issues.push(issue(
      "composition-body-item-order-invalid",
      `bodyItems[${index}].itemIndex`,
      `expected contiguous body-item index ${index}`,
    ))
    const section = facts.sections[item.sectionIndex]
    if (section == null || section.sectionId !== item.sectionId) issues.push(issue(
      "composition-body-item-section-mismatch",
      `bodyItems[${index}].sectionId`,
      "body item must reference its exact manifest section",
    ))
    const order = [item.sectionIndex, item.zoneOrder, item.sourceOrder] as const
    if (previousOrder != null && (
      order[0] < previousOrder[0]
      || (order[0] === previousOrder[0] && order[1] < previousOrder[1])
      || (order[0] === previousOrder[0] && order[1] === previousOrder[1] && order[2] <= previousOrder[2])
    )) issues.push(issue(
      "composition-body-item-canonical-order-invalid",
      `bodyItems[${index}]`,
      "body items must increase by section, zone, and source order",
    ))
    previousOrder = order
    if (rootIds.has(item.rootNodeId)) issues.push(issue(
      "composition-root-duplicate",
      `bodyItems[${index}].rootNodeId`,
      `root ${item.rootNodeId} appears more than once`,
    ))
    rootIds.add(item.rootNodeId)
    if (!(VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1[item.family] as readonly string[]).includes(item.rootNodeType)) issues.push(issue(
      "composition-family-root-mismatch",
      `bodyItems[${index}].rootNodeType`,
      `${item.family} cannot own root node type ${item.rootNodeType}`,
    ))
    if (item.headingLevel != null && (item.family !== "text-flow" || item.rootNodeType !== "text-block")) issues.push(issue(
      "composition-heading-root-invalid",
      `bodyItems[${index}].headingLevel`,
      "only a text-flow text-block root may declare heading level",
    ))
    if (item.ownerPins.documentStructure !== facts.documentStructureFingerprint
      || item.ownerPins.resolvedProjection !== facts.resolvedProjectionFingerprint) issues.push(issue(
      "composition-body-item-owner-mismatch",
      `bodyItems[${index}].ownerPins`,
      "body item must pin the manifest document structure and resolved projection",
    ))
    if (item.initialCursor.family !== item.family
      || item.initialCursor.rootNodeId !== item.rootNodeId
      || item.initialCursor.ownerFingerprint !== item.ownerPins.measurement
      || item.initialCursor.complete) issues.push(issue(
      "composition-initial-family-cursor-invalid",
      `bodyItems[${index}].initialCursor`,
      "initial family cursor must be incomplete and pin the exact item family, root, and measurement",
    ))
  })
  return issues
}

function demandSemanticIssues(facts: VNextDocumentCompositionDemandInputV1): VNextDocumentCompositionContractIssueV1[] {
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (!(VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1[facts.family] as readonly string[]).includes(facts.rootNodeType)) issues.push(issue(
    "composition-demand-family-root-mismatch",
    "rootNodeType",
    `${facts.family} cannot own root node type ${facts.rootNodeType}`,
  ))
  if (facts.cursorBefore.family !== facts.family
    || facts.cursorBefore.rootNodeId !== facts.rootNodeId
    || facts.cursorBefore.ownerFingerprint !== facts.ownerPins.measurement
    || facts.cursorBefore.complete) issues.push(issue(
    "composition-demand-cursor-invalid",
    "cursorBefore",
    "demand cursor must be incomplete and pin the exact family, root, and measurement",
  ))
  if (facts.capacity.firstPageAvailableHeightPt > facts.capacity.pageBodyHeightPt) issues.push(issue(
    "composition-demand-first-capacity-invalid",
    "capacity.firstPageAvailableHeightPt",
    "first-page available height must not exceed page-body height",
  ))
  return issues
}

function retainedFingerprintResult<T>(
  value: unknown,
  finalize: (facts: unknown) => { status: "ready"; value: T & { fingerprint: string } } | { status: "blocked"; issues: VNextDocumentCompositionContractIssueV1[] },
): { status: "ready"; value: T & { fingerprint: string } } | { status: "blocked"; issues: VNextDocumentCompositionContractIssueV1[] } {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked",
    issues: [issue("invalid-document-composition-envelope", "", "retained contract must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  delete record.fingerprint
  if (typeof fingerprint !== "string" || !VNextDocumentCompositionCompactFingerprintV1Schema.safeParse(fingerprint).success) return {
    status: "blocked",
    issues: [issue("invalid-document-composition-fingerprint", "fingerprint", "retained contract requires a compact sha256 fingerprint")],
  }
  const result = finalize(record)
  if (result.status === "blocked") return result
  if (result.value.fingerprint !== fingerprint) return {
    status: "blocked",
    issues: [issue("document-composition-fingerprint-mismatch", "fingerprint", "retained facts do not match their fingerprint")],
  }
  return result
}

export function finalizeVNextDocumentCompositionManifestV1(value: unknown): VNextDocumentCompositionManifestResultV1 {
  const parsed = VNextDocumentCompositionManifestInputV1Schema.safeParse(value)
  if (!parsed.success) return { status: "blocked", manifest: null, issues: schemaIssues(parsed.error) }
  const issues = manifestSemanticIssues(parsed.data)
  if (issues.length > 0) return { status: "blocked", manifest: null, issues }
  const facts = clone(parsed.data)
  return {
    status: "ready",
    manifest: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextDocumentCompositionManifestV1(value: unknown): VNextDocumentCompositionManifestResultV1 {
  const result = retainedFingerprintResult<VNextDocumentCompositionManifestInputV1>(value, (facts) => {
    const finalized = finalizeVNextDocumentCompositionManifestV1(facts)
    return finalized.status === "ready"
      ? { status: "ready", value: finalized.manifest }
      : { status: "blocked", issues: finalized.issues }
  })
  return result.status === "ready"
    ? { status: "ready", manifest: result.value, issues: [] }
    : { status: "blocked", manifest: null, issues: result.issues }
}

export function finalizeVNextDocumentCompositionDemandV1(value: unknown): VNextDocumentCompositionDemandResultV1 {
  const parsed = VNextDocumentCompositionDemandInputV1Schema.safeParse(value)
  if (!parsed.success) return { status: "blocked", demand: null, issues: schemaIssues(parsed.error) }
  const issues = demandSemanticIssues(parsed.data)
  if (issues.length > 0) return { status: "blocked", demand: null, issues }
  const facts = clone(parsed.data)
  return {
    status: "ready",
    demand: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextDocumentCompositionDemandV1(value: unknown): VNextDocumentCompositionDemandResultV1 {
  const result = retainedFingerprintResult<VNextDocumentCompositionDemandInputV1>(value, (facts) => {
    const finalized = finalizeVNextDocumentCompositionDemandV1(facts)
    return finalized.status === "ready"
      ? { status: "ready", value: finalized.demand }
      : { status: "blocked", issues: finalized.issues }
  })
  return result.status === "ready"
    ? { status: "ready", demand: result.value, issues: [] }
    : { status: "blocked", demand: null, issues: result.issues }
}
