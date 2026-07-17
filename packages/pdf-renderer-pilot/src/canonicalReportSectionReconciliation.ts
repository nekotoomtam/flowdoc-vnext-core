import { createHash } from "node:crypto"
import {
  finalizeVNextDocumentCompositionManifestV1,
  parseVNextDocumentCompositionManifestV1,
  VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE,
  VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION,
  type DocumentSectionV4Target,
  type VNextDocumentCompositionManifestInputV1,
  type VNextDocumentCompositionManifestV1,
} from "@flowdoc/vnext-core"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"
import type {
  FlowDocCanonicalReportSpacingCategoryV1,
  FlowDocCanonicalReportVerticalCapacityBundleV1,
} from "./canonicalReportVerticalCapacity.js"

export const FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_ID =
  "ocr-benchmark-report-section-reconciliation-v1" as const

const ACCEPTED_PROJECTION_FINGERPRINT = "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850"
const ACCEPTED_VERTICAL_CAPACITY_FINGERPRINT = "4d89a4f8bf9b99fbaf7d75825319153021b915cf24cd5f4b15ff467af1a0e2fb"
const COMPOSITION_SECTION_ID = "composition-section-ocr-benchmark-report"

export interface FlowDocCanonicalReportSectionReconciliationSourceInputV1 {
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  verticalCapacity: FlowDocCanonicalReportVerticalCapacityBundleV1
}

export interface FlowDocCanonicalReportStaticZoneEquivalenceV1 {
  status: "equivalent-repeating-static-zones"
  normalizedPageProfileFingerprint: string
  normalizedHeaderContentFingerprint: string
  normalizedFooterContentFingerprint: string
  canonicalSourceSectionIndex: 0
  canonicalSourceSectionId: "section-cover"
  canonicalHeaderZoneId: string
  canonicalFooterZoneId: string
  pageNumberPolicy: {
    start: 1
    startOwner: "first-source-section"
    continuation: "continuous-generated-page-number"
  }
  sections: Array<{
    sourceSectionIndex: number
    sourceSectionId: string
    pageProfileFingerprint: string
    headerContentFingerprint: string
    footerContentFingerprint: string
    headerEvidenceFingerprint: string
    footerEvidenceFingerprint: string
    pageNumberStart: number | null
  }>
}

export interface FlowDocCanonicalReportSemanticSectionBindingV1 {
  sourceSectionIndex: number
  sourceSectionId: string
  sourceBodyZoneId: string
  compositionSectionIndex: 0
  compositionSectionId: typeof COMPOSITION_SECTION_ID
  compositionZoneOrder: number
  firstItemIndex: number
  itemCount: number
  naturalBodyHeightPt: number
  sourcePreservedSpacingHeightPt: number
  sourcePreservedSpacingDemandPt: number
}

export interface FlowDocCanonicalReportSpacingBridgeBindingV1 {
  itemIndex: number
  rootNodeId: string
  sourceSectionIndex: number
  sourceSectionId: string
  compositionSectionIndex: 0
  compositionSectionId: typeof COMPOSITION_SECTION_ID
  compositionZoneOrder: number
  category: FlowDocCanonicalReportSpacingCategoryV1
  previousCategory: FlowDocCanonicalReportSpacingCategoryV1 | null
  sourceSpacingRuleId: string
  reconciledSpacingRuleId: string
  gapBeforePt: number
  pageTopPolicy: "suppress-before-first-fragment"
  measurementFingerprint: string
  bindingFingerprint: string
}

export interface FlowDocCanonicalReportSectionReconciliationPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_VERSION
  kind: "canonical-report-section-reconciliation-plan"
  reconciliationId: typeof FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_ID
  sourceProjectionFingerprint: string
  sourceVerticalCapacityFingerprint: string
  reconciliationPolicy: {
    policyId: "continuous-semantic-sections-single-composition-section-v1"
    semanticSectionTreatment: "retain-lineage-order-and-body-zone"
    compositionSectionTreatment: "single-continuous-section"
    sourceDocumentMutation: false
    contentRemoval: false
    standaloneSpacerRoots: false
  }
  semanticSectionStartSpacingRule: {
    ruleId: "semantic-section-start"
    currentCategory: "section-heading"
    basisStyleKey: "section-heading"
    basisLineHeightPt: number
    multiplier: 0.5
    gapBeforePt: number
    provenance: "accepted-r2c-e-line-height-ratio"
  }
  staticZoneEquivalence: FlowDocCanonicalReportStaticZoneEquivalenceV1
  semanticSectionBindings: FlowDocCanonicalReportSemanticSectionBindingV1[]
  spacingBridgeContract: {
    source: typeof VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE
    contractVersion: typeof VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION
    pageTopPolicy: "suppress-before-first-fragment"
    demandAdjustment: "subtract-gap-before-family-pagination"
    freshPageRetry: "return-fresh-page-required-then-suppress-gap"
    windowProjection: "first-page-no-paint-offset"
  }
  spacingBridgeBindings: FlowDocCanonicalReportSpacingBridgeBindingV1[]
  reconciledResolvedProjectionFingerprint: string
  planFingerprint: string
}

export interface FlowDocCanonicalReportSectionReconciliationBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_VERSION
  kind: "canonical-report-section-reconciliation-bundle"
  phaseId: "PDF-PILOT-08B-R2C-H"
  sourceProjectionFingerprint: string
  sourceVerticalCapacityFingerprint: string
  planFingerprint: string
  reconciliationPolicy: FlowDocCanonicalReportSectionReconciliationPlanV1["reconciliationPolicy"]
  semanticSectionStartSpacingRule: FlowDocCanonicalReportSectionReconciliationPlanV1["semanticSectionStartSpacingRule"]
  staticZoneEquivalence: FlowDocCanonicalReportStaticZoneEquivalenceV1
  semanticSectionBindings: FlowDocCanonicalReportSemanticSectionBindingV1[]
  spacingBridgeContract: FlowDocCanonicalReportSectionReconciliationPlanV1["spacingBridgeContract"]
  spacingBridgeBindings: FlowDocCanonicalReportSpacingBridgeBindingV1[]
  reconciledResolvedProjectionFingerprint: string
  coreCompositionManifest: VNextDocumentCompositionManifestV1
  fidelityGate: {
    status: "pagination-required-twelve-page-capacity-diagnostic"
    targetPageCount: number
    previousNaturalSectionCapacityFloorCount: number
    previousPreservedSpacingSectionCapacityCount: number
    reconciledNaturalGlobalCapacityCount: number
    reconciledGrossSpacingCapacityCount: number
    grossDemandPt: number
    targetCapacityPt: number
    grossCapacityDeltaPt: number
    grossOverflowAboveTargetPt: number
    grossSlackBelowTargetPt: number
    maximumTheoreticalPageTopSuppressionPt: number
    maximumTheoreticalPaginationOverheadBudgetPt: number
    reason: "gross-capacity-does-not-decide-actual-page-count"
  }
  rejectedAlternatives: Array<{
    alternative:
      | "retain-twelve-fresh-core-sections"
      | "preserve-zero-semantic-section-start-gap"
      | "insert-standalone-utility-spacer-roots"
      | "remove-report-content-to-hit-page-count"
    reason: string
  }>
  downstreamBlockers: Array<{
    code:
      | "family-pagination-inputs-not-bound"
      | "generated-page-number-not-measured"
      | "twelve-page-pagination-sensitive"
      | "pagination-not-executed"
    blocks: "document-composition-transition" | "final-footer-placement" | "twelve-page-fidelity" | "page-assignment"
    message: string
  }>
  ownership: {
    reconciliationOwns: [
      "static-zone-content-equivalence",
      "continuous-composition-section-projection",
      "semantic-section-lineage-map",
      "semantic-section-start-spacing",
      "core-spacing-bridge-bindings",
      "reconciled-core-composition-manifest",
      "pagination-sensitive-twelve-page-gate",
    ]
    reconciliationMustNotOwn: [
      "source-document-section-mutation",
      "content-removal",
      "family-pagination-input-materialization",
      "generated-page-number-measurement",
      "table-row-splitting",
      "header-row-repetition",
      "page-assignment",
      "pdf-bytes",
    ]
  }
  execution: {
    verticalCapacity: "consumed"
    staticZoneEquivalence: "checked"
    semanticSectionReconciliation: "projected"
    semanticSectionStartSpacing: "bound"
    coreCompositionManifest: "finalized"
    coreSpacingBridge: "contract-bound-not-run"
    familyPaginationInputs: "not-bound"
    generatedFooterMeasurement: "not-run"
    documentCompositionTransition: "not-run"
    pageAssignment: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    semanticSectionCount: number
    compositionSectionCount: number
    removedForcedSectionBoundaryCount: number
    bodyItemCount: number
    sourcePositiveSpacingBindingCount: number
    reconciledPositiveSpacingBindingCount: number
    semanticSectionStartBindingCount: number
    sourcePreservedSpacingPt: number
    semanticSectionStartSpacingPt: number
    reconciledGrossSpacingPt: number
    naturalBodyHeightPt: number
    reconciledGrossDemandPt: number
    pageBodyHeightPt: number
    previousNaturalSectionCapacityFloorCount: number
    previousPreservedSpacingSectionCapacityCount: number
    reconciledNaturalGlobalCapacityCount: number
    reconciledGrossSpacingCapacityCount: number
    targetPageCount: number
    grossTargetPageDelta: number
    grossCapacityDeltaPt: number
    grossOverflowAboveTargetPt: number
    grossSlackBelowTargetPt: number
    maximumTheoreticalPageTopSuppressionPt: number
    maximumTheoreticalPaginationOverheadBudgetPt: number
    equivalentPageProfileCount: number
    equivalentHeaderCount: number
    equivalentFooterCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportSectionReconciliationIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportSectionReconciliationValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportSectionReconciliationBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportSectionReconciliationIssueV1[]; summary: null }

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportSectionReconciliationBundleV1["ownership"] = {
  reconciliationOwns: [
    "static-zone-content-equivalence",
    "continuous-composition-section-projection",
    "semantic-section-lineage-map",
    "semantic-section-start-spacing",
    "core-spacing-bridge-bindings",
    "reconciled-core-composition-manifest",
    "pagination-sensitive-twelve-page-gate",
  ],
  reconciliationMustNotOwn: [
    "source-document-section-mutation",
    "content-removal",
    "family-pagination-input-materialization",
    "generated-page-number-measurement",
    "table-row-splitting",
    "header-row-repetition",
    "page-assignment",
    "pdf-bytes",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportSectionReconciliationBundleV1["execution"] = {
  verticalCapacity: "consumed",
  staticZoneEquivalence: "checked",
  semanticSectionReconciliation: "projected",
  semanticSectionStartSpacing: "bound",
  coreCompositionManifest: "finalized",
  coreSpacingBridge: "contract-bound-not-run",
  familyPaginationInputs: "not-bound",
  generatedFooterMeasurement: "not-run",
  documentCompositionTransition: "not-run",
  pageAssignment: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportSectionReconciliationBundleV1["downstreamBlockers"] = [
  {
    code: "family-pagination-inputs-not-bound",
    blocks: "document-composition-transition",
    message: "Each reconciled manifest item still needs its exact family initial cursor and bounded pagination input.",
  },
  {
    code: "generated-page-number-not-measured",
    blocks: "final-footer-placement",
    message: "The repeating footer is structurally equivalent, but generated page-number text still lacks final measurement.",
  },
  {
    code: "twelve-page-pagination-sensitive",
    blocks: "twelve-page-fidelity",
    message: "Gross capacity cannot decide twelve-page fidelity; Core must execute page-top suppression, table splitting, and continuation overhead.",
  },
  {
    code: "pagination-not-executed",
    blocks: "page-assignment",
    message: "The reconciled manifest and spacing bindings are ready, but no family window or document transition has executed.",
  },
]

const REJECTED_ALTERNATIVES: FlowDocCanonicalReportSectionReconciliationBundleV1["rejectedAlternatives"] = [
  {
    alternative: "retain-twelve-fresh-core-sections",
    reason: "Core closes every section boundary, retaining the proven seventeen-page natural and eighteen-page spaced floors.",
  },
  {
    alternative: "preserve-zero-semantic-section-start-gap",
    reason: "Zone-start zero spacing was valid only at a fresh page; continuous semantic headings require an explicit leading gap.",
  },
  {
    alternative: "insert-standalone-utility-spacer-roots",
    reason: "An atomic spacer can move to a fresh page independently and violate suppress-before-first-fragment semantics.",
  },
  {
    alternative: "remove-report-content-to-hit-page-count",
    reason: "Page-count reconciliation must not discard source-backed report evidence or mutate the authored document.",
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
  return Number(value.toFixed(6))
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

function issue(code: string, path: string, message: string): FlowDocCanonicalReportSectionReconciliationIssueV1 {
  return { code, path, message, severity: "error" }
}

function validateSources(input: FlowDocCanonicalReportSectionReconciliationSourceInputV1): string[] {
  const errors: string[] = []
  if (input.projection.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.verticalCapacity.bundleFingerprint !== ACCEPTED_VERTICAL_CAPACITY_FINGERPRINT) errors.push("R2C-G vertical-capacity fingerprint drifted")
  if (input.projection.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.projection, "bundleFingerprint")))) errors.push("R2C-C projection fingerprint does not match content")
  if (input.verticalCapacity.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.verticalCapacity, "bundleFingerprint")))) errors.push("R2C-G vertical-capacity fingerprint does not match content")
  if (input.verticalCapacity.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("R2C-G does not consume the accepted R2C-C projection")
  if (input.verticalCapacity.summary.sectionCount !== 12) errors.push("R2C-G semantic section coverage drifted")
  if (input.verticalCapacity.summary.bodyItemCount !== 185) errors.push("R2C-G body-root coverage drifted")
  if (parseVNextDocumentCompositionManifestV1(input.verticalCapacity.coreCompositionManifest).status !== "ready") errors.push("R2C-G Core composition manifest is invalid")
  return errors
}

function normalizedValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizedValue)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.keys(value)
    .filter((key) => key !== "id")
    .sort()
    .map((key) => [key, normalizedValue(value[key])]))
}

function normalizedPageProfile(section: DocumentSectionV4Target): unknown {
  const profile = clone(section.page) as Record<string, unknown>
  delete profile.pageNumberStart
  return normalizedValue(profile)
}

function zoneContentFingerprint(section: DocumentSectionV4Target, role: "header" | "footer"): {
  zoneId: string
  fingerprint: string
} {
  const zone = section.zoneIds
    .map((zoneId) => section.nodes[zoneId])
    .find((node) => node?.type === "zone" && node.role === role)
  requireFact(zone?.type === "zone", `${role} zone is missing: ${section.id}`)
  const roots = zone.childIds.map((nodeId) => {
    const node = section.nodes[nodeId]
    requireFact(node != null, `${role} root is missing: ${section.id}/${nodeId}`)
    return normalizedValue(node)
  })
  return {
    zoneId: zone.id,
    fingerprint: compact(JSON.stringify({ role, roots })),
  }
}

function staticZoneEquivalence(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportStaticZoneEquivalenceV1 {
  const sections = input.projection.projectedInstanceDocument.document.sections.map((section, sourceSectionIndex) => {
    const capacity = input.verticalCapacity.sectionCapacities[sourceSectionIndex]
    requireFact(capacity?.sectionId === section.id, `capacity section order drifted: ${section.id}`)
    const header = zoneContentFingerprint(section, "header")
    const footer = zoneContentFingerprint(section, "footer")
    requireFact(header.zoneId === capacity.staticZones.header.zoneId, `header identity drifted: ${section.id}`)
    requireFact(footer.zoneId === capacity.staticZones.footer.zoneId, `footer identity drifted: ${section.id}`)
    return {
      sourceSectionIndex,
      sourceSectionId: section.id,
      pageProfileFingerprint: compact(JSON.stringify(normalizedPageProfile(section))),
      headerContentFingerprint: header.fingerprint,
      footerContentFingerprint: footer.fingerprint,
      headerEvidenceFingerprint: capacity.staticZones.header.evidenceFingerprint,
      footerEvidenceFingerprint: capacity.staticZones.footer.evidenceFingerprint,
      pageNumberStart: section.page.pageNumberStart ?? null,
    }
  })
  requireFact(new Set(sections.map((item) => item.pageProfileFingerprint)).size === 1, "page profiles are not equivalent")
  requireFact(new Set(sections.map((item) => item.headerContentFingerprint)).size === 1, "header content is not equivalent")
  requireFact(new Set(sections.map((item) => item.footerContentFingerprint)).size === 1, "footer content is not equivalent")
  requireFact(sections[0]?.sourceSectionId === "section-cover", "canonical static-zone section drifted")
  requireFact(sections[0]?.pageNumberStart === 1, "first section must start generated page numbering at one")
  requireFact(sections.slice(1).every((item) => item.pageNumberStart == null), "later semantic sections must continue page numbering")
  const canonical = input.verticalCapacity.sectionCapacities[0]
  return {
    status: "equivalent-repeating-static-zones",
    normalizedPageProfileFingerprint: sections[0].pageProfileFingerprint,
    normalizedHeaderContentFingerprint: sections[0].headerContentFingerprint,
    normalizedFooterContentFingerprint: sections[0].footerContentFingerprint,
    canonicalSourceSectionIndex: 0,
    canonicalSourceSectionId: "section-cover",
    canonicalHeaderZoneId: canonical.staticZones.header.zoneId,
    canonicalFooterZoneId: canonical.staticZones.footer.zoneId,
    pageNumberPolicy: {
      start: 1,
      startOwner: "first-source-section",
      continuation: "continuous-generated-page-number",
    },
    sections,
  }
}

function semanticSectionBindings(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSemanticSectionBindingV1[] {
  return input.verticalCapacity.sectionCapacities.map((capacity) => {
    const items = input.verticalCapacity.spacedBodyItems.filter((item) => item.sectionIndex === capacity.sectionIndex)
    requireFact(items.length === capacity.bodyItemCount && items.length > 0, `body coverage drifted: ${capacity.sectionId}`)
    requireFact(new Set(items.map((item) => item.zoneId)).size === 1, `body zone is not unique: ${capacity.sectionId}`)
    return {
      sourceSectionIndex: capacity.sectionIndex,
      sourceSectionId: capacity.sectionId,
      sourceBodyZoneId: items[0].zoneId,
      compositionSectionIndex: 0,
      compositionSectionId: COMPOSITION_SECTION_ID as typeof COMPOSITION_SECTION_ID,
      compositionZoneOrder: capacity.sectionIndex,
      firstItemIndex: items[0].itemIndex,
      itemCount: items.length,
      naturalBodyHeightPt: capacity.naturalBodyHeightPt,
      sourcePreservedSpacingHeightPt: capacity.preservedSpacingHeightPt,
      sourcePreservedSpacingDemandPt: capacity.preservedSpacingDemandPt,
    }
  })
}

function semanticSectionStartRule(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationPlanV1["semanticSectionStartSpacingRule"] {
  const binding = input.verticalCapacity.spacingProfile.lineHeightBindings.find((item) => item.styleKey === "section-heading")
  requireFact(binding != null, "section-heading line-height evidence is missing")
  return {
    ruleId: "semantic-section-start",
    currentCategory: "section-heading",
    basisStyleKey: "section-heading",
    basisLineHeightPt: binding.lineHeightPt,
    multiplier: 0.5,
    gapBeforePt: roundPt(binding.lineHeightPt * 0.5),
    provenance: "accepted-r2c-e-line-height-ratio",
  }
}

function spacingBridgeBindings(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
  rule: FlowDocCanonicalReportSectionReconciliationPlanV1["semanticSectionStartSpacingRule"],
): FlowDocCanonicalReportSpacingBridgeBindingV1[] {
  return input.verticalCapacity.spacedBodyItems.map((item, itemIndex) => {
    requireFact(item.itemIndex === itemIndex, `spacing item order drifted: ${item.rootNodeId}`)
    const sectionStart = itemIndex > 0
      && input.verticalCapacity.spacedBodyItems[itemIndex - 1].sectionIndex !== item.sectionIndex
    const previousCategory = itemIndex === 0
      ? null
      : input.verticalCapacity.spacedBodyItems[itemIndex - 1].category
    if (sectionStart) requireFact(item.category === "section-heading", `semantic section does not start with a heading: ${item.sectionId}`)
    const facts = {
      itemIndex,
      rootNodeId: item.rootNodeId,
      sourceSectionIndex: item.sectionIndex,
      sourceSectionId: item.sectionId,
      compositionSectionIndex: 0 as const,
      compositionSectionId: COMPOSITION_SECTION_ID as typeof COMPOSITION_SECTION_ID,
      compositionZoneOrder: item.sectionIndex,
      category: item.category,
      previousCategory,
      sourceSpacingRuleId: item.spacingRuleId,
      reconciledSpacingRuleId: sectionStart ? rule.ruleId : item.spacingRuleId,
      gapBeforePt: sectionStart ? rule.gapBeforePt : item.spacingBeforePt,
      pageTopPolicy: "suppress-before-first-fragment" as const,
      measurementFingerprint: item.measurementFingerprint,
    }
    return { ...facts, bindingFingerprint: compact(JSON.stringify(facts)) }
  })
}

function createPlan(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationPlanV1 {
  const staticZones = staticZoneEquivalence(input)
  const sectionBindings = semanticSectionBindings(input)
  const startRule = semanticSectionStartRule(input)
  const bridgeBindings = spacingBridgeBindings(input, startRule)
  const reconciliationPolicy: FlowDocCanonicalReportSectionReconciliationPlanV1["reconciliationPolicy"] = {
    policyId: "continuous-semantic-sections-single-composition-section-v1",
    semanticSectionTreatment: "retain-lineage-order-and-body-zone",
    compositionSectionTreatment: "single-continuous-section",
    sourceDocumentMutation: false,
    contentRemoval: false,
    standaloneSpacerRoots: false,
  }
  const reconciledResolvedProjectionFingerprint = compact(JSON.stringify({
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceVerticalCapacityFingerprint: input.verticalCapacity.bundleFingerprint,
    reconciliationPolicy,
    normalizedPageProfileFingerprint: staticZones.normalizedPageProfileFingerprint,
    normalizedHeaderContentFingerprint: staticZones.normalizedHeaderContentFingerprint,
    normalizedFooterContentFingerprint: staticZones.normalizedFooterContentFingerprint,
    semanticSections: sectionBindings.map((item) => ({
      sourceSectionIndex: item.sourceSectionIndex,
      sourceSectionId: item.sourceSectionId,
      sourceBodyZoneId: item.sourceBodyZoneId,
      compositionZoneOrder: item.compositionZoneOrder,
    })),
    spacingBindings: bridgeBindings.map((item) => item.bindingFingerprint),
  }))
  const facts: Omit<FlowDocCanonicalReportSectionReconciliationPlanV1, "planFingerprint"> = {
    contractVersion: FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_VERSION,
    kind: "canonical-report-section-reconciliation-plan",
    reconciliationId: FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceVerticalCapacityFingerprint: input.verticalCapacity.bundleFingerprint,
    reconciliationPolicy,
    semanticSectionStartSpacingRule: startRule,
    staticZoneEquivalence: staticZones,
    semanticSectionBindings: sectionBindings,
    spacingBridgeContract: {
      source: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE,
      contractVersion: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION,
      pageTopPolicy: "suppress-before-first-fragment",
      demandAdjustment: "subtract-gap-before-family-pagination",
      freshPageRetry: "return-fresh-page-required-then-suppress-gap",
      windowProjection: "first-page-no-paint-offset",
    },
    spacingBridgeBindings: bridgeBindings,
    reconciledResolvedProjectionFingerprint,
  }
  return { ...facts, planFingerprint: sha256(JSON.stringify(facts)) }
}

function coreManifest(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
  plan: FlowDocCanonicalReportSectionReconciliationPlanV1,
): VNextDocumentCompositionManifestV1 {
  const source = input.verticalCapacity.coreCompositionManifest
  const canonicalSection = source.sections[plan.staticZoneEquivalence.canonicalSourceSectionIndex]
  const facts: VNextDocumentCompositionManifestInputV1 = {
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: source.documentId,
    documentStructureFingerprint: source.documentStructureFingerprint,
    resolvedProjectionFingerprint: plan.reconciledResolvedProjectionFingerprint,
    sections: [{
      sectionIndex: 0,
      sectionId: COMPOSITION_SECTION_ID,
      pageGeometry: clone(canonicalSection.pageGeometry),
      staticZones: clone(canonicalSection.staticZones),
    }],
    bodyItems: source.bodyItems.map((item, itemIndex) => {
      const binding = plan.spacingBridgeBindings[itemIndex]
      requireFact(binding?.rootNodeId === item.rootNodeId, `reconciled manifest order drifted: ${item.rootNodeId}`)
      return {
        ...clone(item),
        itemIndex,
        sectionIndex: 0,
        sectionId: COMPOSITION_SECTION_ID,
        zoneOrder: binding.compositionZoneOrder,
        ownerPins: {
          ...clone(item.ownerPins),
          resolvedProjection: plan.reconciledResolvedProjectionFingerprint,
        },
      }
    }),
    limits: clone(source.limits),
  }
  const result = finalizeVNextDocumentCompositionManifestV1(facts)
  requireFact(result.status === "ready", `reconciled Core manifest blocked: ${result.issues.map((item) => item.code).join(",")}`)
  return result.manifest
}

function buildBundle(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationBundleV1 {
  const plan = createPlan(input)
  const manifest = coreManifest(input, plan)
  const sourceSummary = input.verticalCapacity.summary
  const semanticSectionStartBindingCount = plan.spacingBridgeBindings.filter((item) => item.reconciledSpacingRuleId === "semantic-section-start").length
  const semanticSectionStartSpacingPt = roundPt(semanticSectionStartBindingCount * plan.semanticSectionStartSpacingRule.gapBeforePt)
  const reconciledGrossSpacingPt = roundPt(plan.spacingBridgeBindings.reduce((total, item) => total + item.gapBeforePt, 0))
  const reconciledGrossDemandPt = roundPt(sourceSummary.naturalBodyHeightPt + reconciledGrossSpacingPt)
  const targetCapacityPt = roundPt(sourceSummary.targetPageCount * sourceSummary.pageBodyHeightPt)
  const grossCapacityDeltaPt = roundPt(reconciledGrossDemandPt - targetCapacityPt)
  const grossOverflowAboveTargetPt = Math.max(0, grossCapacityDeltaPt)
  const grossSlackBelowTargetPt = Math.max(0, -grossCapacityDeltaPt)
  const pageTopCount = sourceSummary.targetPageCount - 1
  const maximumTheoreticalPageTopSuppressionPt = roundPt(plan.spacingBridgeBindings
    .map((item) => item.gapBeforePt)
    .sort((left, right) => right - left)
    .slice(0, pageTopCount)
    .reduce((total, gap) => total + gap, 0))
  const maximumTheoreticalPaginationOverheadBudgetPt = roundPt(
    maximumTheoreticalPageTopSuppressionPt - grossCapacityDeltaPt,
  )
  const summary: FlowDocCanonicalReportSectionReconciliationBundleV1["summary"] = {
    semanticSectionCount: plan.semanticSectionBindings.length,
    compositionSectionCount: manifest.sections.length,
    removedForcedSectionBoundaryCount: plan.semanticSectionBindings.length - manifest.sections.length,
    bodyItemCount: manifest.bodyItems.length,
    sourcePositiveSpacingBindingCount: input.verticalCapacity.spacedBodyItems.filter((item) => item.spacingBeforePt > 0).length,
    reconciledPositiveSpacingBindingCount: plan.spacingBridgeBindings.filter((item) => item.gapBeforePt > 0).length,
    semanticSectionStartBindingCount,
    sourcePreservedSpacingPt: sourceSummary.totalPreservedSpacingPt,
    semanticSectionStartSpacingPt,
    reconciledGrossSpacingPt,
    naturalBodyHeightPt: sourceSummary.naturalBodyHeightPt,
    reconciledGrossDemandPt,
    pageBodyHeightPt: sourceSummary.pageBodyHeightPt,
    previousNaturalSectionCapacityFloorCount: sourceSummary.naturalSectionCapacityFloorCount,
    previousPreservedSpacingSectionCapacityCount: sourceSummary.preservedSpacingSectionCapacityCount,
    reconciledNaturalGlobalCapacityCount: Math.ceil(sourceSummary.naturalBodyHeightPt / sourceSummary.pageBodyHeightPt),
    reconciledGrossSpacingCapacityCount: Math.ceil(reconciledGrossDemandPt / sourceSummary.pageBodyHeightPt),
    targetPageCount: sourceSummary.targetPageCount,
    grossTargetPageDelta: Math.ceil(reconciledGrossDemandPt / sourceSummary.pageBodyHeightPt) - sourceSummary.targetPageCount,
    grossCapacityDeltaPt,
    grossOverflowAboveTargetPt,
    grossSlackBelowTargetPt,
    maximumTheoreticalPageTopSuppressionPt,
    maximumTheoreticalPaginationOverheadBudgetPt,
    equivalentPageProfileCount: plan.staticZoneEquivalence.sections.length,
    equivalentHeaderCount: plan.staticZoneEquivalence.sections.length,
    equivalentFooterCount: plan.staticZoneEquivalence.sections.length,
  }
  requireFact(summary.semanticSectionStartBindingCount === 11, "semantic section-start coverage drifted")
  requireFact(summary.bodyItemCount === sourceSummary.bodyItemCount, "reconciled manifest lost body roots")
  requireFact(
    summary.reconciledGrossSpacingCapacityCount >= summary.reconciledNaturalGlobalCapacityCount,
    "gross spacing capacity fell below natural capacity",
  )
  requireFact(
    Number.isFinite(summary.maximumTheoreticalPaginationOverheadBudgetPt),
    "reference-page diagnostic budget is not finite",
  )
  const fidelityGate: FlowDocCanonicalReportSectionReconciliationBundleV1["fidelityGate"] = {
    status: "pagination-required-twelve-page-capacity-diagnostic",
    targetPageCount: summary.targetPageCount,
    previousNaturalSectionCapacityFloorCount: summary.previousNaturalSectionCapacityFloorCount,
    previousPreservedSpacingSectionCapacityCount: summary.previousPreservedSpacingSectionCapacityCount,
    reconciledNaturalGlobalCapacityCount: summary.reconciledNaturalGlobalCapacityCount,
    reconciledGrossSpacingCapacityCount: summary.reconciledGrossSpacingCapacityCount,
    grossDemandPt: summary.reconciledGrossDemandPt,
    targetCapacityPt,
    grossCapacityDeltaPt,
    grossOverflowAboveTargetPt,
    grossSlackBelowTargetPt,
    maximumTheoreticalPageTopSuppressionPt,
    maximumTheoreticalPaginationOverheadBudgetPt,
    reason: "gross-capacity-does-not-decide-actual-page-count",
  }
  const unsigned: Omit<FlowDocCanonicalReportSectionReconciliationBundleV1, "bundleFingerprint"> = {
    contractVersion: FLOWDOC_CANONICAL_REPORT_SECTION_RECONCILIATION_VERSION,
    kind: "canonical-report-section-reconciliation-bundle",
    phaseId: "PDF-PILOT-08B-R2C-H",
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceVerticalCapacityFingerprint: input.verticalCapacity.bundleFingerprint,
    planFingerprint: plan.planFingerprint,
    reconciliationPolicy: plan.reconciliationPolicy,
    semanticSectionStartSpacingRule: plan.semanticSectionStartSpacingRule,
    staticZoneEquivalence: plan.staticZoneEquivalence,
    semanticSectionBindings: plan.semanticSectionBindings,
    spacingBridgeContract: plan.spacingBridgeContract,
    spacingBridgeBindings: plan.spacingBridgeBindings,
    reconciledResolvedProjectionFingerprint: plan.reconciledResolvedProjectionFingerprint,
    coreCompositionManifest: manifest,
    fidelityGate,
    rejectedAlternatives: clone(REJECTED_ALTERNATIVES),
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary,
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportSectionReconciliationPlanV1(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

export function createFlowDocCanonicalReportSectionReconciliationBundleV1(
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input)
}

export function validateFlowDocCanonicalReportSectionReconciliationBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1,
): FlowDocCanonicalReportSectionReconciliationValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportSectionReconciliationBundleV1
  const issues: FlowDocCanonicalReportSectionReconciliationIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-section-reconciliation-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-H") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceProjectionFingerprint !== input.projection.bundleFingerprint) issues.push(issue("source-projection-fingerprint", "sourceProjectionFingerprint", "R2C-C source fingerprint differs"))
  if (bundle.sourceVerticalCapacityFingerprint !== input.verticalCapacity.bundleFingerprint) issues.push(issue("source-capacity-fingerprint", "sourceVerticalCapacityFingerprint", "R2C-G source fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "section reconciliation ownership drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "section reconciliation execution drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "section reconciliation blockers drifted"))
  if (JSON.stringify(bundle.rejectedAlternatives) !== JSON.stringify(REJECTED_ALTERNATIVES)) issues.push(issue("rejected-alternatives", "rejectedAlternatives", "rejected reconciliation alternatives drifted"))
  for (const forbidden of ["pages", "pageAssignments", "rootPlacements", "pagination", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `section reconciliation bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportSectionReconciliationBundleV1
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
    issue("canonical-bundle-drift", "", "section reconciliation bundle differs from deterministic source evidence"),
  )
  if (parseVNextDocumentCompositionManifestV1(bundle.coreCompositionManifest).status !== "ready") issues.push(
    issue("core-manifest-invalid", "coreCompositionManifest", "reconciled Core composition manifest is invalid"),
  )
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
