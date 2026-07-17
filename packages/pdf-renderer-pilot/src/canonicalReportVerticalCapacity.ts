import { createHash } from "node:crypto"
import {
  finalizeVNextDocumentCompositionManifestV1,
  type VNextCompositionNodeFamilyV1,
  type VNextCompositionRootNodeTypeV1,
  type VNextDocumentCompositionManifestInputV1,
  type VNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionPageGeometryV1,
} from "@flowdoc/vnext-core"
import type {
  FlowDocCanonicalReportMeasuredCompositionBundleV1,
  FlowDocCanonicalReportFlowEntryV1,
} from "./canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"

export const FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_ID = "ocr-benchmark-report-vertical-capacity-v1" as const
export const FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT = 12 as const

const ACCEPTED_PROJECTION_FINGERPRINT = "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193"
const ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT = "a80b13c98aee27c949d2a80bc4b73b8c619ef3f9fa1678792fdb64a28b20127a"
const LETTER_PORTRAIT_PT = { width: 612, height: 792 } as const

export type FlowDocCanonicalReportSpacingCategoryV1 =
  | "report-title"
  | "section-heading"
  | "report-body"
  | "reader-label"
  | "reader-summary"
  | "table-label"
  | "prepared-table"
  | "fixed-image"

export interface FlowDocCanonicalReportVerticalCapacitySourceInputV1 {
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  measuredComposition: FlowDocCanonicalReportMeasuredCompositionBundleV1
}

export interface FlowDocCanonicalReportSpacingRuleV1 {
  ruleId: string
  previousCategory: FlowDocCanonicalReportSpacingCategoryV1
  currentCategory: FlowDocCanonicalReportSpacingCategoryV1
  basisStyleKey: "report-body" | "section-heading" | "report-caption" | "table-header"
  basisLineHeightPt: number
  multiplier: number
  gapBeforePt: number
  provenance: "accepted-r2c-p-semantic-role-and-line-height-ratio"
}

export interface FlowDocCanonicalReportSpacingProfileV1 {
  profileId: "ocr-benchmark-report-flow-spacing-v2"
  collapsePolicy: "exact-adjacency-rule-no-margin-collapse"
  pageTopPolicy: "suppress-before-first-fragment"
  lineHeightBindings: Array<{
    styleKey: "report-title" | "section-heading" | "report-body" | "report-caption" | "table-header"
    lineHeightPt: number
    acceptedBlockCount: number
  }>
  rules: FlowDocCanonicalReportSpacingRuleV1[]
}

export interface FlowDocCanonicalReportVerticalCapacityPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_VERSION
  kind: "canonical-report-vertical-capacity-plan"
  capacityId: typeof FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_ID
  sourceProjectionFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  targetPageCount: typeof FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT
  spacingProfile: FlowDocCanonicalReportSpacingProfileV1
  sectionBindings: Array<{
    sectionIndex: number
    sectionId: string
    bodyZoneId: string
    headerZoneId: string
    footerZoneId: string
    bodyNodeIds: string[]
  }>
  bodyBindings: Array<{
    itemIndex: number
    sectionIndex: number
    sectionId: string
    sourceOrder: number
    rootNodeId: string
    category: FlowDocCanonicalReportSpacingCategoryV1
    spacingRuleId: string
    spacingBeforePt: number
  }>
  planFingerprint: string
}

export interface FlowDocCanonicalReportSpacedBodyItemV1 {
  itemIndex: number
  sectionIndex: number
  sectionId: string
  zoneId: string
  sourceOrder: number
  rootNodeId: string
  rootNodeType: VNextCompositionRootNodeTypeV1
  family: VNextCompositionNodeFamilyV1
  category: FlowDocCanonicalReportSpacingCategoryV1
  previousCategory: FlowDocCanonicalReportSpacingCategoryV1 | null
  spacingRuleId: string
  spacingBeforePt: number
  naturalHeightPt: number
  preservedSpacingOuterHeightPt: number
  capacityMode: "line-fragment-flow" | "splittable-table-row-stream" | "atomic-media"
  samePageMinimumProgressHeightPt: number
  freshPageMinimumProgressHeightPt: number
  wholeRootFitsFreshBody: boolean
  progressFitsFreshBody: true
  familySourceFingerprint: string
  measurementFingerprint: string
}

export interface FlowDocCanonicalReportSectionCapacityV1 {
  sectionIndex: number
  sectionId: string
  pageGeometry: VNextDocumentCompositionPageGeometryV1
  marginPt: { top: number; right: number; bottom: number; left: number }
  headerReservedPt: number
  footerReservedPt: number
  sectionBoundaryPolicy: "fresh-page"
  bodyItemCount: number
  naturalBodyHeightPt: number
  preservedSpacingHeightPt: number
  preservedSpacingDemandPt: number
  naturalCapacityFloorCount: number
  preservedSpacingCapacityCount: number
  naturalSinglePageFit: boolean
  preservedSpacingSinglePageFit: boolean
  staticZones: {
    header: {
      zoneId: string
      measuredHeightPt: number
      reservedHeightPt: number
      reservedSlackPt: number
      status: "measured-fits-reservation"
      evidenceFingerprint: string
    }
    footer: {
      zoneId: string
      expectedSingleLineHeightPt: number
      reservedHeightPt: number
      reservedSlackPt: number
      status: "generated-inline-reserved-unmeasured"
      evidenceFingerprint: string
    }
  }
}

export interface FlowDocCanonicalReportVerticalCapacityBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_VERSION
  kind: "canonical-report-vertical-capacity-bundle"
  phaseId: "PDF-PILOT-08B-R2C-G"
  sourceProjectionFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  planFingerprint: string
  targetPageCount: typeof FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT
  spacingProfile: FlowDocCanonicalReportSpacingProfileV1
  coreCompositionManifest: VNextDocumentCompositionManifestV1
  spacedBodyItems: FlowDocCanonicalReportSpacedBodyItemV1[]
  sectionCapacities: FlowDocCanonicalReportSectionCapacityV1[]
  fidelityGate: {
    status: "blocked-target-page-count-capacity-floor"
    targetPageCount: typeof FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT
    naturalSectionCapacityFloorCount: number
    minimumPageCountDelta: number
    reason: "section-boundary-natural-height-floor-exceeds-target"
  }
  downstreamBlockers: Array<{
    code:
      | "core-spacing-bridge-not-executed"
      | "target-page-count-capacity-floor-exceeded"
      | "generated-page-number-not-measured"
      | "pagination-not-executed"
    blocks: "document-composition-transition" | "twelve-page-fidelity" | "final-footer-placement" | "page-assignment"
    message: string
  }>
  ownership: {
    capacityOwns: [
      "accepted-line-height-ratio-spacing-profile",
      "exact-root-adjacency-spacing",
      "letter-page-region-geometry",
      "static-zone-reservation-checks",
      "core-document-composition-manifest",
      "root-progress-capacity-checks",
      "section-capacity-floor",
    ]
    capacityMustNotOwn: [
      "source-document-spacing-mutation",
      "core-spacing-transition-bridge",
      "generated-page-number-expansion",
      "x-y-root-placement",
      "page-assignment",
      "table-row-splitting",
      "header-row-repetition",
      "pagination",
      "pdf-bytes",
    ]
  }
  execution: {
    measuredComposition: "consumed"
    spacingProfile: "bound-evidence-only"
    pageGeometry: "bound"
    staticHeaderCapacity: "checked"
    staticFooterCapacity: "reserved-unmeasured"
    coreCompositionManifest: "finalized"
    rootProgressCapacity: "checked"
    coreSpacingBridge: "not-run"
    documentCompositionTransition: "not-run"
    tablePagination: "not-run"
    pageAssignment: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    sectionCount: number
    bodyItemCount: number
    textFlowItemCount: number
    tableFlowItemCount: number
    mediaFlowItemCount: number
    spacingRuleCount: number
    appliedSpacingCount: number
    totalPreservedSpacingPt: number
    naturalBodyHeightPt: number
    preservedSpacingBodyDemandPt: number
    pageBodyHeightPt: number
    measuredHeaderFitCount: number
    generatedFooterReservationCount: number
    progressCapacityFitCount: number
    wholeTableRootOverflowCount: number
    naturalGlobalCapacityFloorCount: number
    preservedSpacingGlobalCapacityCount: number
    naturalSectionCapacityFloorCount: number
    preservedSpacingSectionCapacityCount: number
    naturalSinglePageSectionCount: number
    preservedSpacingSinglePageSectionCount: number
    targetPageCount: number
    minimumTargetPageDelta: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportVerticalCapacityIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportVerticalCapacityValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportVerticalCapacityBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportVerticalCapacityIssueV1[]; summary: null }

interface BodySourceItem {
  itemIndex: number
  sectionIndex: number
  sectionId: string
  zoneId: string
  zoneOrder: number
  sourceOrder: number
  entry: FlowDocCanonicalReportFlowEntryV1
  rootNodeId: string
  rootNodeType: VNextCompositionRootNodeTypeV1
  family: VNextCompositionNodeFamilyV1
  category: FlowDocCanonicalReportSpacingCategoryV1
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | null
}

const SPACING_RULE_DEFINITIONS: Array<{
  ruleId: string
  previousCategory: FlowDocCanonicalReportSpacingCategoryV1
  currentCategory: FlowDocCanonicalReportSpacingCategoryV1
  basisStyleKey: FlowDocCanonicalReportSpacingRuleV1["basisStyleKey"]
  multiplier: number
}> = [
  { ruleId: "report-title-to-body", previousCategory: "report-title", currentCategory: "report-body", basisStyleKey: "report-body", multiplier: 1 },
  { ruleId: "section-heading-to-body", previousCategory: "section-heading", currentCategory: "report-body", basisStyleKey: "section-heading", multiplier: 0.5 },
  { ruleId: "body-stack", previousCategory: "report-body", currentCategory: "report-body", basisStyleKey: "report-body", multiplier: 0.2 },
  { ruleId: "body-to-reader-label", previousCategory: "report-body", currentCategory: "reader-label", basisStyleKey: "report-body", multiplier: 0.8 },
  { ruleId: "reader-label-to-summary", previousCategory: "reader-label", currentCategory: "reader-summary", basisStyleKey: "report-body", multiplier: 0.4 },
  { ruleId: "reader-summary-stack", previousCategory: "reader-summary", currentCategory: "reader-summary", basisStyleKey: "report-body", multiplier: 0.2 },
  { ruleId: "reader-summary-to-body", previousCategory: "reader-summary", currentCategory: "report-body", basisStyleKey: "report-body", multiplier: 0.8 },
  { ruleId: "body-to-image", previousCategory: "report-body", currentCategory: "fixed-image", basisStyleKey: "report-caption", multiplier: 1 },
  { ruleId: "image-to-table-label", previousCategory: "fixed-image", currentCategory: "table-label", basisStyleKey: "table-header", multiplier: 1 },
  { ruleId: "body-to-table-label", previousCategory: "report-body", currentCategory: "table-label", basisStyleKey: "table-header", multiplier: 1 },
  { ruleId: "table-label-to-table", previousCategory: "table-label", currentCategory: "prepared-table", basisStyleKey: "table-header", multiplier: 0.5 },
  { ruleId: "table-to-table-label", previousCategory: "prepared-table", currentCategory: "table-label", basisStyleKey: "table-header", multiplier: 1 },
]

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportVerticalCapacityBundleV1["ownership"] = {
  capacityOwns: [
    "accepted-line-height-ratio-spacing-profile",
    "exact-root-adjacency-spacing",
    "letter-page-region-geometry",
    "static-zone-reservation-checks",
    "core-document-composition-manifest",
    "root-progress-capacity-checks",
    "section-capacity-floor",
  ],
  capacityMustNotOwn: [
    "source-document-spacing-mutation",
    "core-spacing-transition-bridge",
    "generated-page-number-expansion",
    "x-y-root-placement",
    "page-assignment",
    "table-row-splitting",
    "header-row-repetition",
    "pagination",
    "pdf-bytes",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportVerticalCapacityBundleV1["execution"] = {
  measuredComposition: "consumed",
  spacingProfile: "bound-evidence-only",
  pageGeometry: "bound",
  staticHeaderCapacity: "checked",
  staticFooterCapacity: "reserved-unmeasured",
  coreCompositionManifest: "finalized",
  rootProgressCapacity: "checked",
  coreSpacingBridge: "not-run",
  documentCompositionTransition: "not-run",
  tablePagination: "not-run",
  pageAssignment: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportVerticalCapacityBundleV1["downstreamBlockers"] = [
  {
    code: "core-spacing-bridge-not-executed",
    blocks: "document-composition-transition",
    message: "The accepted spacing profile is evidence-only; Core document composition does not yet consume inter-root gaps.",
  },
  {
    code: "target-page-count-capacity-floor-exceeded",
    blocks: "twelve-page-fidelity",
    message: "Fresh section boundaries and natural body heights require at least 17 pages before spacing or repeated headers, exceeding the 12-page target.",
  },
  {
    code: "generated-page-number-not-measured",
    blocks: "final-footer-placement",
    message: "Footer height is reserved, but generated page-number text still lacks final line measurement.",
  },
  {
    code: "pagination-not-executed",
    blocks: "page-assignment",
    message: "Capacity inputs are ready, but root placement, table row splitting, repeated headers, and page assignment have not run.",
  },
]

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function compact(value: string): string {
  return `sha256:${sha256(value)}`
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function roundPt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function unitToPt(value: { value: number; unit: "pt" | "mm" }): number {
  return value.unit === "pt" ? value.value : (value.value * 72) / 25.4
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]
  return copy
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportVerticalCapacityIssueV1 {
  return { code, path, message, severity: "error" }
}

function validateSources(input: FlowDocCanonicalReportVerticalCapacitySourceInputV1): string[] {
  const errors: string[] = []
  if (input.projection.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.measuredComposition.bundleFingerprint !== ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT) errors.push("R2C-F measured-composition fingerprint drifted")
  if (input.projection.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.projection, "bundleFingerprint")))) errors.push("R2C-C projection fingerprint does not match content")
  if (input.measuredComposition.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.measuredComposition, "bundleFingerprint")))) errors.push("R2C-F measured-composition fingerprint does not match content")
  if (input.measuredComposition.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("R2C-F does not consume the accepted R2C-C projection")
  if (input.measuredComposition.summary.readyFlowNodeCount !== 197) errors.push("R2C-F ready-flow coverage drifted")
  if (input.measuredComposition.summary.footerDeferredFlowNodeCount !== 12) errors.push("R2C-F footer deferral coverage drifted")
  return errors
}

function spacingProfile(
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportSpacingProfileV1 {
  const requiredStyles: FlowDocCanonicalReportSpacingProfileV1["lineHeightBindings"][number]["styleKey"][] = [
    "report-title", "section-heading", "report-body", "report-caption", "table-header",
  ]
  const lineHeightBindings = requiredStyles.map((styleKey) => {
    const blocks = input.measuredComposition.documentBlocks.filter((block) => block.request.styleKey === styleKey)
    requireFact(blocks.length > 0, `accepted line-height evidence is missing: ${styleKey}`)
    const heights = new Set(blocks.flatMap((block) => block.measured.lines.map((line) => line.heightPt)))
    requireFact(heights.size === 1, `accepted line height is not unique: ${styleKey}`)
    return { styleKey, lineHeightPt: [...heights][0], acceptedBlockCount: blocks.length }
  })
  const heightByStyle = new Map(lineHeightBindings.map((binding) => [binding.styleKey, binding.lineHeightPt]))
  const rules = SPACING_RULE_DEFINITIONS.map((definition): FlowDocCanonicalReportSpacingRuleV1 => {
    const basisLineHeightPt = heightByStyle.get(definition.basisStyleKey)
    requireFact(basisLineHeightPt != null, `spacing line-height basis is missing: ${definition.basisStyleKey}`)
    return {
      ...definition,
      basisLineHeightPt,
      gapBeforePt: roundPt(basisLineHeightPt * definition.multiplier),
      provenance: "accepted-r2c-p-semantic-role-and-line-height-ratio",
    }
  })
  return {
    profileId: "ocr-benchmark-report-flow-spacing-v2",
    collapsePolicy: "exact-adjacency-rule-no-margin-collapse",
    pageTopPolicy: "suppress-before-first-fragment",
    lineHeightBindings,
    rules,
  }
}

function categoryFor(
  entry: FlowDocCanonicalReportFlowEntryV1,
  node: FlowDocCanonicalReportTableProjectionBundleV1["projectedInstanceDocument"]["document"]["sections"][number]["nodes"][string],
): FlowDocCanonicalReportSpacingCategoryV1 {
  if (entry.kind === "prepared-table") {
    requireFact(node?.type === "table", `prepared table root type drifted: ${entry.nodeId}`)
    return "prepared-table"
  }
  if (entry.kind === "fixed-image") {
    requireFact(node?.type === "image", `fixed image root type drifted: ${entry.nodeId}`)
    return "fixed-image"
  }
  requireFact(entry.kind === "measured-text-block" && node?.type === "text-block", `unsupported ready body root: ${entry.nodeId}`)
  if (node.props.textStyleId === "report-title") return "report-title"
  if (node.props.textStyleId === "section-heading") return "section-heading"
  if (node.props.textStyleId === "report-body" && node.role.role === "label") return "reader-label"
  if (node.props.textStyleId === "report-body" && node.role.role === "note") return "reader-summary"
  if (node.props.textStyleId === "report-body") return "report-body"
  if (node.props.textStyleId === "table-header" && node.role.role === "label") return "table-label"
  throw new Error(`unsupported body text category: ${entry.nodeId}:${node.props.textStyleId ?? "none"}`)
}

function familyFor(category: FlowDocCanonicalReportSpacingCategoryV1): {
  family: VNextCompositionNodeFamilyV1
  rootNodeType: VNextCompositionRootNodeTypeV1
} {
  if (category === "prepared-table") return { family: "table-flow", rootNodeType: "table" }
  if (category === "fixed-image") return { family: "media-flow", rootNodeType: "image" }
  return { family: "text-flow", rootNodeType: "text-block" }
}

function bodySourceItems(input: FlowDocCanonicalReportVerticalCapacitySourceInputV1): BodySourceItem[] {
  const result: BodySourceItem[] = []
  input.projection.projectedInstanceDocument.document.sections.forEach((section, sectionIndex) => {
    const flow = input.measuredComposition.zoneFlows.find((item) => (
      item.sectionId === section.id && item.zoneRole === "body"
    ))
    requireFact(flow != null, `body flow is missing: ${section.id}`)
    const zoneOrder = section.zoneIds.indexOf(flow.zoneId)
    requireFact(zoneOrder >= 0, `body zone order is missing: ${section.id}`)
    flow.entries.forEach((entry) => {
      requireFact(entry.status === "ready", `body entry is not ready: ${section.id}:${entry.nodeId}`)
      const node = section.nodes[entry.nodeId]
      requireFact(node != null, `body root node is missing: ${section.id}:${entry.nodeId}`)
      const category = categoryFor(entry, node)
      const family = familyFor(category)
      result.push({
        itemIndex: result.length,
        sectionIndex,
        sectionId: section.id,
        zoneId: flow.zoneId,
        zoneOrder,
        sourceOrder: entry.nodeIndex,
        entry,
        rootNodeId: entry.nodeId,
        rootNodeType: family.rootNodeType,
        family: family.family,
        category,
        headingLevel: node.type === "text-block" && node.role.role === "heading" ? node.role.level : null,
      })
    })
  })
  return result
}

function spacingFor(
  profile: FlowDocCanonicalReportSpacingProfileV1,
  previous: BodySourceItem | null,
  current: BodySourceItem,
): { spacingRuleId: string; spacingBeforePt: number } {
  if (previous == null || previous.sectionId !== current.sectionId) return {
    spacingRuleId: "zone-start",
    spacingBeforePt: 0,
  }
  const matches = profile.rules.filter((rule) => (
    rule.previousCategory === previous.category && rule.currentCategory === current.category
  ))
  requireFact(matches.length === 1, `spacing adjacency is not uniquely bound: ${previous.category}->${current.category}`)
  return { spacingRuleId: matches[0].ruleId, spacingBeforePt: matches[0].gapBeforePt }
}

function createPlan(
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportVerticalCapacityPlanV1 {
  const profile = spacingProfile(input)
  const sources = bodySourceItems(input)
  const sectionBindings = input.projection.projectedInstanceDocument.document.sections.map((section, sectionIndex) => {
    const body = input.measuredComposition.zoneFlows.find((flow) => flow.sectionId === section.id && flow.zoneRole === "body")
    const header = input.measuredComposition.zoneFlows.find((flow) => flow.sectionId === section.id && flow.zoneRole === "header")
    const footer = input.measuredComposition.zoneFlows.find((flow) => flow.sectionId === section.id && flow.zoneRole === "footer")
    requireFact(body != null && header != null && footer != null, `section zone evidence is incomplete: ${section.id}`)
    return {
      sectionIndex,
      sectionId: section.id,
      bodyZoneId: body.zoneId,
      headerZoneId: header.zoneId,
      footerZoneId: footer.zoneId,
      bodyNodeIds: body.entries.map((entry) => entry.nodeId),
    }
  })
  let previous: BodySourceItem | null = null
  const bodyBindings = sources.map((source) => {
    const spacing = spacingFor(profile, previous, source)
    previous = source
    return {
      itemIndex: source.itemIndex,
      sectionIndex: source.sectionIndex,
      sectionId: source.sectionId,
      sourceOrder: source.sourceOrder,
      rootNodeId: source.rootNodeId,
      category: source.category,
      ...spacing,
    }
  })
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-vertical-capacity-plan" as const,
    capacityId: FLOWDOC_CANONICAL_REPORT_VERTICAL_CAPACITY_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    targetPageCount: FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
    spacingProfile: profile,
    sectionBindings,
    bodyBindings,
  }
  return { ...unsigned, planFingerprint: sha256(JSON.stringify(unsigned)) }
}

function pageFacts(
  section: FlowDocCanonicalReportTableProjectionBundleV1["projectedInstanceDocument"]["document"]["sections"][number],
): {
  pageGeometry: VNextDocumentCompositionPageGeometryV1
  marginPt: FlowDocCanonicalReportSectionCapacityV1["marginPt"]
  headerReservedPt: number
  footerReservedPt: number
} {
  requireFact(section.page.size === "Letter" && section.page.orientation === "portrait", `unsupported page geometry: ${section.id}`)
  const marginRaw = {
    top: unitToPt(section.page.margin.top),
    right: unitToPt(section.page.margin.right),
    bottom: unitToPt(section.page.margin.bottom),
    left: unitToPt(section.page.margin.left),
  }
  const headerReservedPt = section.page.headerReserved ?? 0
  const footerReservedPt = section.page.footerReserved ?? 0
  const pageGeometry = {
    pageWidthPt: LETTER_PORTRAIT_PT.width,
    pageHeightPt: LETTER_PORTRAIT_PT.height,
    bodyOriginXPt: roundPt(marginRaw.left),
    bodyOriginYPt: roundPt(marginRaw.top + headerReservedPt),
    bodyWidthPt: roundPt(LETTER_PORTRAIT_PT.width - marginRaw.left - marginRaw.right),
    bodyHeightPt: roundPt(LETTER_PORTRAIT_PT.height - marginRaw.top - marginRaw.bottom - headerReservedPt - footerReservedPt),
  }
  return {
    pageGeometry,
    marginPt: {
      top: roundPt(marginRaw.top), right: roundPt(marginRaw.right),
      bottom: roundPt(marginRaw.bottom), left: roundPt(marginRaw.left),
    },
    headerReservedPt,
    footerReservedPt,
  }
}

function evidencePins(input: {
  source: BodySourceItem
  measured: FlowDocCanonicalReportMeasuredCompositionBundleV1
}): {
  naturalHeightPt: number
  familySourceFingerprint: string
  measurementFingerprint: string
  samePageUnitHeightPt: number
  freshPageUnitHeightPt: number
  wholeRootFitsFreshBody: (bodyHeightPt: number) => boolean
  capacityMode: FlowDocCanonicalReportSpacedBodyItemV1["capacityMode"]
} {
  const source = input.source
  if (source.family === "text-flow") {
    const block = input.measured.documentBlocks.find((item) => (
      item.sectionId === source.sectionId && item.textBlockId === source.rootNodeId
    ))
    requireFact(block != null, `measured text block is missing: ${source.sectionId}:${source.rootNodeId}`)
    const accepted = input.measured.coreAcceptedConsumers.find((item) => item.consumerId === block.consumerId)
    requireFact(accepted != null, `Core acceptance summary is missing: ${block.consumerId}`)
    const firstLineHeightPt = block.measured.lines[0]?.heightPt
    requireFact(firstLineHeightPt != null, `measured text block has no lines: ${source.rootNodeId}`)
    return {
      naturalHeightPt: block.naturalHeightPt,
      familySourceFingerprint: compact(JSON.stringify(block.request)),
      measurementFingerprint: compact(JSON.stringify(block.measured)),
      samePageUnitHeightPt: firstLineHeightPt,
      freshPageUnitHeightPt: firstLineHeightPt,
      wholeRootFitsFreshBody: (bodyHeightPt) => block.naturalHeightPt <= bodyHeightPt,
      capacityMode: "line-fragment-flow",
    }
  }
  if (source.family === "media-flow") {
    const image = input.measured.fixedImageBlocks.find((item) => (
      item.sectionId === source.sectionId && item.imageId === source.rootNodeId
    ))
    requireFact(image != null, `fixed image evidence is missing: ${source.sectionId}:${source.rootNodeId}`)
    return {
      naturalHeightPt: image.naturalHeightPt,
      familySourceFingerprint: compact(JSON.stringify({ fieldKey: image.fieldKey, assetId: image.assetId })),
      measurementFingerprint: compact(JSON.stringify(image)),
      samePageUnitHeightPt: image.naturalHeightPt,
      freshPageUnitHeightPt: image.naturalHeightPt,
      wholeRootFitsFreshBody: (bodyHeightPt) => image.naturalHeightPt <= bodyHeightPt,
      capacityMode: "atomic-media",
    }
  }
  const table = input.measured.preparedTables.find((item) => (
    item.sectionId === source.sectionId && item.tableId === source.rootNodeId
  ))
  requireFact(table != null, `prepared table evidence is missing: ${source.sectionId}:${source.rootNodeId}`)
  const headerHeightPt = roundPt(table.naturalRows
    .filter((row) => row.role === "header")
    .reduce((total, row) => total + row.naturalWholeRowHeightPt, 0))
  const bodyHeights = table.naturalRows.filter((row) => row.role === "body").map((row) => row.naturalWholeRowHeightPt)
  requireFact(headerHeightPt > 0 && bodyHeights.length > 0, `table progress evidence is incomplete: ${table.projectionId}`)
  const progressHeightPt = roundPt(headerHeightPt + Math.max(...bodyHeights))
  return {
    naturalHeightPt: table.summary.naturalTableHeightPt,
    familySourceFingerprint: compact(JSON.stringify({
      geometryFingerprint: table.geometryFingerprint,
      authoredTextEvidenceFingerprint: table.authoredTextEvidenceFingerprint,
      materializedTextEvidenceFingerprint: table.materializedTextEvidenceFingerprint,
    })),
    measurementFingerprint: compact(table.preparedRows.fingerprint),
    samePageUnitHeightPt: progressHeightPt,
    freshPageUnitHeightPt: progressHeightPt,
    wholeRootFitsFreshBody: (bodyHeightPt) => table.summary.naturalTableHeightPt <= bodyHeightPt,
    capacityMode: "splittable-table-row-stream",
  }
}

function createSpacedItems(input: {
  source: FlowDocCanonicalReportVerticalCapacitySourceInputV1
  plan: FlowDocCanonicalReportVerticalCapacityPlanV1
  documentStructureFingerprint: string
  resolvedProjectionFingerprint: string
}): FlowDocCanonicalReportSpacedBodyItemV1[] {
  const sources = bodySourceItems(input.source)
  return sources.map((source, index) => {
    const binding = input.plan.bodyBindings[index]
    requireFact(binding?.rootNodeId === source.rootNodeId, `body plan binding drifted: ${source.rootNodeId}`)
    const page = pageFacts(input.source.projection.projectedInstanceDocument.document.sections[source.sectionIndex])
    const evidence = evidencePins({
      source,
      measured: input.source.measuredComposition,
    })
    const samePageMinimumProgressHeightPt = roundPt(binding.spacingBeforePt + evidence.samePageUnitHeightPt)
    const freshPageMinimumProgressHeightPt = roundPt(evidence.freshPageUnitHeightPt)
    requireFact(samePageMinimumProgressHeightPt <= page.pageGeometry.bodyHeightPt, `same-page progress exceeds body capacity: ${source.rootNodeId}`)
    requireFact(freshPageMinimumProgressHeightPt <= page.pageGeometry.bodyHeightPt, `fresh-page progress exceeds body capacity: ${source.rootNodeId}`)
    const previous = sources[index - 1]
    return {
      itemIndex: source.itemIndex,
      sectionIndex: source.sectionIndex,
      sectionId: source.sectionId,
      zoneId: source.zoneId,
      sourceOrder: source.sourceOrder,
      rootNodeId: source.rootNodeId,
      rootNodeType: source.rootNodeType,
      family: source.family,
      category: source.category,
      previousCategory: previous?.sectionId === source.sectionId ? previous.category : null,
      spacingRuleId: binding.spacingRuleId,
      spacingBeforePt: binding.spacingBeforePt,
      naturalHeightPt: evidence.naturalHeightPt,
      preservedSpacingOuterHeightPt: roundPt(binding.spacingBeforePt + evidence.naturalHeightPt),
      capacityMode: evidence.capacityMode,
      samePageMinimumProgressHeightPt,
      freshPageMinimumProgressHeightPt,
      wholeRootFitsFreshBody: evidence.wholeRootFitsFreshBody(page.pageGeometry.bodyHeightPt),
      progressFitsFreshBody: true,
      familySourceFingerprint: evidence.familySourceFingerprint,
      measurementFingerprint: evidence.measurementFingerprint,
    }
  })
}

function sectionCapacities(input: {
  source: FlowDocCanonicalReportVerticalCapacitySourceInputV1
  plan: FlowDocCanonicalReportVerticalCapacityPlanV1
  items: readonly FlowDocCanonicalReportSpacedBodyItemV1[]
}): FlowDocCanonicalReportSectionCapacityV1[] {
  const captionLineHeight = input.plan.spacingProfile.lineHeightBindings.find((item) => item.styleKey === "report-caption")?.lineHeightPt
  requireFact(captionLineHeight != null, "report-caption line height is missing")
  return input.source.projection.projectedInstanceDocument.document.sections.map((section, sectionIndex) => {
    const page = pageFacts(section)
    const items = input.items.filter((item) => item.sectionIndex === sectionIndex)
    const headerFlow = input.source.measuredComposition.zoneFlows.find((flow) => flow.sectionId === section.id && flow.zoneRole === "header")
    const footerFlow = input.source.measuredComposition.zoneFlows.find((flow) => flow.sectionId === section.id && flow.zoneRole === "footer")
    requireFact(headerFlow != null && headerFlow.entries.length === 1, `header flow is incomplete: ${section.id}`)
    requireFact(footerFlow != null && footerFlow.entries.length === 1, `footer flow is incomplete: ${section.id}`)
    const headerEntry = headerFlow.entries[0]
    const footerEntry = footerFlow.entries[0]
    requireFact(headerEntry.kind === "measured-text-block" && headerEntry.naturalHeightPt != null, `header is not measured: ${section.id}`)
    requireFact(footerEntry.kind === "generated-text-deferred", `footer is not explicitly deferred: ${section.id}`)
    requireFact(headerEntry.naturalHeightPt <= page.headerReservedPt, `header exceeds reservation: ${section.id}`)
    requireFact(captionLineHeight <= page.footerReservedPt, `footer line height exceeds reservation: ${section.id}`)
    const naturalBodyHeightPt = roundPt(items.reduce((total, item) => total + item.naturalHeightPt, 0))
    const preservedSpacingHeightPt = roundPt(items.reduce((total, item) => total + item.spacingBeforePt, 0))
    const preservedSpacingDemandPt = roundPt(naturalBodyHeightPt + preservedSpacingHeightPt)
    return {
      sectionIndex,
      sectionId: section.id,
      pageGeometry: page.pageGeometry,
      marginPt: page.marginPt,
      headerReservedPt: page.headerReservedPt,
      footerReservedPt: page.footerReservedPt,
      sectionBoundaryPolicy: "fresh-page",
      bodyItemCount: items.length,
      naturalBodyHeightPt,
      preservedSpacingHeightPt,
      preservedSpacingDemandPt,
      naturalCapacityFloorCount: Math.ceil(naturalBodyHeightPt / page.pageGeometry.bodyHeightPt),
      preservedSpacingCapacityCount: Math.ceil(preservedSpacingDemandPt / page.pageGeometry.bodyHeightPt),
      naturalSinglePageFit: naturalBodyHeightPt <= page.pageGeometry.bodyHeightPt,
      preservedSpacingSinglePageFit: preservedSpacingDemandPt <= page.pageGeometry.bodyHeightPt,
      staticZones: {
        header: {
          zoneId: headerFlow.zoneId,
          measuredHeightPt: headerEntry.naturalHeightPt,
          reservedHeightPt: page.headerReservedPt,
          reservedSlackPt: roundPt(page.headerReservedPt - headerEntry.naturalHeightPt),
          status: "measured-fits-reservation",
          evidenceFingerprint: compact(JSON.stringify(headerEntry.evidence)),
        },
        footer: {
          zoneId: footerFlow.zoneId,
          expectedSingleLineHeightPt: captionLineHeight,
          reservedHeightPt: page.footerReservedPt,
          reservedSlackPt: roundPt(page.footerReservedPt - captionLineHeight),
          status: "generated-inline-reserved-unmeasured",
          evidenceFingerprint: compact(JSON.stringify(footerEntry.evidence)),
        },
      },
    }
  })
}

function coreManifest(input: {
  source: FlowDocCanonicalReportVerticalCapacitySourceInputV1
  items: readonly FlowDocCanonicalReportSpacedBodyItemV1[]
  capacities: readonly FlowDocCanonicalReportSectionCapacityV1[]
  documentStructureFingerprint: string
  resolvedProjectionFingerprint: string
}): VNextDocumentCompositionManifestV1 {
  const sourceItems = bodySourceItems(input.source)
  const facts: VNextDocumentCompositionManifestInputV1 = {
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: input.source.projection.projectedInstanceDocument.document.id,
    documentStructureFingerprint: input.documentStructureFingerprint,
    resolvedProjectionFingerprint: input.resolvedProjectionFingerprint,
    sections: input.capacities.map((capacity) => ({
      sectionIndex: capacity.sectionIndex,
      sectionId: capacity.sectionId,
      pageGeometry: capacity.pageGeometry,
      staticZones: [
        {
          role: "header" as const,
          zoneId: capacity.staticZones.header.zoneId,
          evidenceFingerprint: capacity.staticZones.header.evidenceFingerprint,
        },
        {
          role: "footer" as const,
          zoneId: capacity.staticZones.footer.zoneId,
          evidenceFingerprint: capacity.staticZones.footer.evidenceFingerprint,
        },
      ],
    })),
    bodyItems: input.items.map((item, index) => {
      const source = sourceItems[index]
      requireFact(source?.rootNodeId === item.rootNodeId, `manifest source order drifted: ${item.rootNodeId}`)
      return {
        itemIndex: item.itemIndex,
        sectionIndex: item.sectionIndex,
        sectionId: item.sectionId,
        zoneOrder: source.zoneOrder,
        zoneId: item.zoneId,
        sourceOrder: item.sourceOrder,
        rootNodeId: item.rootNodeId,
        rootNodeType: item.rootNodeType,
        family: item.family,
        headingLevel: source.headingLevel,
        ownerPins: {
          documentStructure: input.documentStructureFingerprint,
          resolvedProjection: input.resolvedProjectionFingerprint,
          familySource: item.familySourceFingerprint,
          measurement: item.measurementFingerprint,
        },
        initialCursor: {
          contractVersion: 1 as const,
          kind: "composition-family-cursor-ref" as const,
          family: item.family,
          rootNodeId: item.rootNodeId,
          ownerFingerprint: item.measurementFingerprint,
          stateFingerprint: compact(`initial:${item.family}:${item.rootNodeId}:${item.measurementFingerprint}`),
          complete: false,
        },
      }
    }),
    limits: {
      maximumDocumentPageCount: 1_000,
      maximumDocumentPlacementCount: 100_000,
      maximumOpenPagePlacementCount: 10_000,
    },
  }
  const result = finalizeVNextDocumentCompositionManifestV1(facts)
  requireFact(result.status === "ready", `Core composition manifest blocked: ${result.issues.map((item) => item.code).join(",")}`)
  return result.manifest
}

function buildBundle(
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportVerticalCapacityBundleV1 {
  const plan = createPlan(input)
  const documentStructureFingerprint = compact(JSON.stringify(input.projection.projectedInstanceDocument.document))
  const resolvedProjectionFingerprint = compact(`r2c-c:${input.projection.bundleFingerprint}`)
  const items = createSpacedItems({ source: input, plan, documentStructureFingerprint, resolvedProjectionFingerprint })
  const capacities = sectionCapacities({ source: input, plan, items })
  const manifest = coreManifest({
    source: input,
    items,
    capacities,
    documentStructureFingerprint,
    resolvedProjectionFingerprint,
  })
  const naturalBodyHeightPt = roundPt(capacities.reduce((total, item) => total + item.naturalBodyHeightPt, 0))
  const totalPreservedSpacingPt = roundPt(capacities.reduce((total, item) => total + item.preservedSpacingHeightPt, 0))
  const preservedSpacingBodyDemandPt = roundPt(naturalBodyHeightPt + totalPreservedSpacingPt)
  const pageBodyHeights = new Set(capacities.map((item) => item.pageGeometry.bodyHeightPt))
  requireFact(pageBodyHeights.size === 1, "canonical report page body height is not stable")
  const pageBodyHeightPt = [...pageBodyHeights][0]
  const naturalSectionCapacityFloorCount = capacities.reduce((total, item) => total + item.naturalCapacityFloorCount, 0)
  const preservedSpacingSectionCapacityCount = capacities.reduce((total, item) => total + item.preservedSpacingCapacityCount, 0)
  requireFact(naturalSectionCapacityFloorCount > FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT, "capacity floor no longer exceeds the accepted target")
  const unsigned: Omit<FlowDocCanonicalReportVerticalCapacityBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-vertical-capacity-bundle",
    phaseId: "PDF-PILOT-08B-R2C-G",
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    planFingerprint: plan.planFingerprint,
    targetPageCount: FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
    spacingProfile: plan.spacingProfile,
    coreCompositionManifest: manifest,
    spacedBodyItems: items,
    sectionCapacities: capacities,
    fidelityGate: {
      status: "blocked-target-page-count-capacity-floor",
      targetPageCount: FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
      naturalSectionCapacityFloorCount,
      minimumPageCountDelta: naturalSectionCapacityFloorCount - FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
      reason: "section-boundary-natural-height-floor-exceeds-target",
    },
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      sectionCount: capacities.length,
      bodyItemCount: items.length,
      textFlowItemCount: items.filter((item) => item.family === "text-flow").length,
      tableFlowItemCount: items.filter((item) => item.family === "table-flow").length,
      mediaFlowItemCount: items.filter((item) => item.family === "media-flow").length,
      spacingRuleCount: plan.spacingProfile.rules.length,
      appliedSpacingCount: items.filter((item) => item.spacingBeforePt > 0).length,
      totalPreservedSpacingPt,
      naturalBodyHeightPt,
      preservedSpacingBodyDemandPt,
      pageBodyHeightPt,
      measuredHeaderFitCount: capacities.filter((item) => item.staticZones.header.status === "measured-fits-reservation").length,
      generatedFooterReservationCount: capacities.filter((item) => item.staticZones.footer.status === "generated-inline-reserved-unmeasured").length,
      progressCapacityFitCount: items.filter((item) => item.progressFitsFreshBody).length,
      wholeTableRootOverflowCount: items.filter((item) => item.family === "table-flow" && !item.wholeRootFitsFreshBody).length,
      naturalGlobalCapacityFloorCount: Math.ceil(naturalBodyHeightPt / pageBodyHeightPt),
      preservedSpacingGlobalCapacityCount: Math.ceil(preservedSpacingBodyDemandPt / pageBodyHeightPt),
      naturalSectionCapacityFloorCount,
      preservedSpacingSectionCapacityCount,
      naturalSinglePageSectionCount: capacities.filter((item) => item.naturalSinglePageFit).length,
      preservedSpacingSinglePageSectionCount: capacities.filter((item) => item.preservedSpacingSinglePageFit).length,
      targetPageCount: FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
      minimumTargetPageDelta: naturalSectionCapacityFloorCount - FLOWDOC_CANONICAL_REPORT_TARGET_PAGE_COUNT,
    },
  }
  requireFact(unsigned.summary.bodyItemCount === unsigned.coreCompositionManifest.bodyItems.length, "Core manifest body coverage drifted")
  requireFact(unsigned.summary.bodyItemCount === input.measuredComposition.summary.bodyReadyFlowNodeCount, "R2C-F body coverage drifted")
  requireFact(unsigned.summary.progressCapacityFitCount === unsigned.summary.bodyItemCount, "some root cannot make fresh-page progress")
  const naturalHeaderHeightPt = roundPt(input.measuredComposition.zoneFlows
    .filter((flow) => flow.zoneRole === "header")
    .reduce((total, flow) => total + flow.naturalHeightWithoutSpacingPt, 0))
  requireFact(unsigned.summary.naturalBodyHeightPt === roundPt(
    input.measuredComposition.summary.naturalReadyFlowHeightWithoutSpacingPt
      - naturalHeaderHeightPt,
  ), "natural body height does not reconcile R2C-F")
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportVerticalCapacityPlanV1(
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportVerticalCapacityPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

export function createFlowDocCanonicalReportVerticalCapacityBundleV1(
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportVerticalCapacityBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input)
}

export function validateFlowDocCanonicalReportVerticalCapacityBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1,
): FlowDocCanonicalReportVerticalCapacityValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportVerticalCapacityBundleV1
  const issues: FlowDocCanonicalReportVerticalCapacityIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-vertical-capacity-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-G") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceProjectionFingerprint !== input.projection.bundleFingerprint) issues.push(issue("source-projection-fingerprint", "sourceProjectionFingerprint", "R2C-C source fingerprint differs"))
  if (bundle.sourceMeasuredCompositionFingerprint !== input.measuredComposition.bundleFingerprint) issues.push(issue("source-composition-fingerprint", "sourceMeasuredCompositionFingerprint", "R2C-F source fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "vertical capacity ownership drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "vertical capacity execution drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "vertical capacity blockers drifted"))
  for (const forbidden of ["pages", "pageAssignments", "rootPlacements", "pagination", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `vertical capacity bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportVerticalCapacityBundleV1
  try {
    expected = buildBundle(input)
  } catch (error) {
    return {
      status: "blocked",
      issues: [issue("expected-bundle-build", "", error instanceof Error ? error.message : "expected bundle build failed")],
      summary: null,
    }
  }
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")))) issues.push(
    issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"),
  )
  if (JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")) !== JSON.stringify(withoutFingerprint(expected, "bundleFingerprint"))) issues.push(
    issue("canonical-bundle-drift", "", "vertical capacity bundle differs from deterministic source evidence"),
  )
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
