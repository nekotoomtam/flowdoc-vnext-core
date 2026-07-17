import { createHash } from "node:crypto"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createInitialVNextAtomicBlockV4PaginationCursor,
  createInitialVNextTableFlowV4PaginationCursor,
  createInitialVNextTextFlowV4PaginationCursor,
  createVNextAtomicBlockV4CursorFingerprint,
  createVNextAtomicBlockV4Evidence,
  createVNextTableFlowV4CursorFingerprint,
  createVNextTableFlowV4SourceFingerprint,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  createVNextTextFlowV4CursorFingerprint,
  createVNextTextFlowV4MeasurementFingerprint,
  finalizeVNextDocumentCompositionManifestV1,
  parseVNextDocumentCompositionManifestV1,
  type VNextAtomicBlockV4Evidence,
  type VNextAtomicBlockV4PaginationCursor,
  type VNextCompositionFamilyCursorRefV1,
  type VNextDocumentCompositionManifestInputV1,
  type VNextDocumentCompositionManifestV1,
  type VNextTableFlowV4PaginationCursor,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextEngineAdapterEvidence,
  type VNextTextEngineAdapterRequest,
  type VNextTextFlowV4PaginationCursor,
  type VNextThaiLineBreakKind,
  type VNextThaiLineBreakOpportunity,
} from "@flowdoc/vnext-core"
import { createFlowDocTextEngineLineWrapEvidencePlan } from "../../text-engine-rust-wasm/src/lineWrapEvidence.js"
import {
  createFlowDocRustybuzzRawEvidenceMappingPlan,
  type FlowDocRustybuzzRawSmokeOutput,
} from "../../text-engine-rust-wasm/src/index.js"
import type {
  FlowDocCanonicalReportLineBreakingBundleV1,
  FlowDocIcu4xNativeLineSegmentOutputV1,
} from "./canonicalReportLineBreaking.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "./canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "./canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "./canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"

export const FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_ID =
  "ocr-benchmark-report-pagination-inputs-v1" as const

const ACCEPTED_PROJECTION_FINGERPRINT = "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193"
const ACCEPTED_NATIVE_SHAPING_FINGERPRINT = "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8"
const ACCEPTED_LINE_BREAKING_FINGERPRINT = "e1a9612766a6342ab3c36bbd0475f170bd4ef64d706161513bdf2f4a64b634a4"
const ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT = "a80b13c98aee27c949d2a80bc4b73b8c619ef3f9fa1678792fdb64a28b20127a"
const ACCEPTED_SECTION_RECONCILIATION_FINGERPRINT = "8c805719625c7c071568db8f90f9fad1b67c66f519ba880c16183314447c8364"
const FOOTER_STYLE_KEY = "report-caption"
const FOOTER_CAPACITY_DIGITS = 4
const FOOTER_CAPACITY_SAMPLE = "8".repeat(FOOTER_CAPACITY_DIGITS)

type AcceptedMeasuredLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

export interface FlowDocCanonicalReportPaginationInputsSourceV1 {
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  nativeShaping: FlowDocCanonicalReportNativeShapingBundleV1
  lineBreaking: FlowDocCanonicalReportLineBreakingBundleV1
  measuredComposition: FlowDocCanonicalReportMeasuredCompositionBundleV1
  sectionReconciliation: FlowDocCanonicalReportSectionReconciliationBundleV1
  fontManifest: FlowDocCanonicalReportNativeShapingFontManifestV1
}

interface FamilyPaginationInputBaseV1 {
  itemIndex: number
  sourceSectionIndex: number
  sourceSectionId: string
  compositionSectionId: string
  zoneId: string
  sourceOrder: number
  rootNodeId: string
  familySourceFingerprint: string
  measurementOwnerFingerprint: string
  initialCursorRef: VNextCompositionFamilyCursorRefV1
  inputFingerprint: string
}

export type FlowDocCanonicalReportFamilyPaginationInputV1 =
  | (FamilyPaginationInputBaseV1 & {
      family: "text-flow"
      source: {
        kind: "measured-document-block"
        measuredCompositionFingerprint: string
        documentBlockIndex: number
        consumerId: string
        acceptedMeasurementFingerprint: string
      }
      pagination: {
        pageBodyHeightPt: number
        maximumPageCount: number
        maximumLineCount: number
      }
      initialCursor: VNextTextFlowV4PaginationCursor
    })
  | (FamilyPaginationInputBaseV1 & {
      family: "table-flow"
      source: {
        kind: "prepared-table-row-stream"
        measuredCompositionFingerprint: string
        preparedTableIndex: number
        projectionId: string
        preparedRowsFingerprintSha256: string
      }
      pagination: {
        pageBodyHeightPt: number
        maximumPageCount: number
        maximumRowPlanCount: number
        headerPolicy: "repeat-leading-headers"
      }
      initialCursor: VNextTableFlowV4PaginationCursor
    })
  | (FamilyPaginationInputBaseV1 & {
      family: "media-flow"
      source: {
        kind: "resolved-atomic-image-evidence"
        projectionFingerprint: string
        fixedImageBlockIndex: number
        assetId: string
      }
      pagination: {
        pageBodyHeightPt: number
        maximumPageCount: 1
      }
      evidence: VNextAtomicBlockV4Evidence
      initialCursor: VNextAtomicBlockV4PaginationCursor
    })

export interface FlowDocCanonicalReportGeneratedFooterPlanV1 {
  sourceSectionId: string
  zoneId: string
  textBlockId: string
  pageNumberInlineId: string
  styleKey: typeof FOOTER_STYLE_KEY
  pageNumberPolicy: {
    start: 1
    continuation: "continuous-generated-page-number"
    maximumPageNumber: number
    capacityDigits: typeof FOOTER_CAPACITY_DIGITS
    capacitySample: typeof FOOTER_CAPACITY_SAMPLE
    generationOwnerFingerprint: string
  }
  measurementRequest: VNextTextBlockV4MeasurementRequest
  nativeExecution: {
    measurementId: string
    shapeRequestId: string
    segmentRequestId: string
    fontId: string
    fontSha256: string
    fontAssetPath: string
    fontSizePt: number
    lineHeightPt: number
    availableWidthPt: number
    renderedText: string
    adapterRequest: VNextTextEngineAdapterRequest
  }
  reservedHeightPt: number
  planFingerprint: string
}

export interface FlowDocCanonicalReportPaginationInputsPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_VERSION
  kind: "canonical-report-pagination-inputs-plan"
  paginationInputsId: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_ID
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  sourceSectionReconciliationFingerprint: string
  sourceFontManifestFingerprint: string
  familyPaginationInputs: FlowDocCanonicalReportFamilyPaginationInputV1[]
  generatedFooter: FlowDocCanonicalReportGeneratedFooterPlanV1
  planFingerprint: string
}

export interface FlowDocCanonicalReportPaginationInputsRawEvidenceV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_VERSION
  kind: "canonical-report-pagination-inputs-raw-evidence"
  phaseId: "PDF-PILOT-08B-R2C-I"
  sourcePlanFingerprint: string
  shapeExecution: {
    shapeRequestId: string
    rawOutput: FlowDocRustybuzzRawSmokeOutput
  }
  segmentExecution: {
    segmentRequestId: string
    rawOutput: FlowDocIcu4xNativeLineSegmentOutputV1
  }
  rawEvidenceFingerprint: string
}

export interface FlowDocCanonicalReportGeneratedFooterMeasurementV1 {
  sourceSectionId: string
  zoneId: string
  textBlockId: string
  pageNumberInlineId: string
  pageNumberPolicy: FlowDocCanonicalReportGeneratedFooterPlanV1["pageNumberPolicy"]
  measurementRequest: VNextTextBlockV4MeasurementRequest
  accepted: AcceptedMeasuredLines
  acceptedMeasurementFingerprint: string
  lineBoxes: Array<{
    lineIndex: number
    startOffset: number
    endOffset: number
    widthPt: number
    heightPt: number
    yOffsetPt: number
    glyphStartIndex: number
    glyphEndIndex: number
  }>
  nativeEvidence: {
    rawEvidenceFingerprint: string
    glyphCount: number
    missingGlyphCount: number
    coveredGlyphCount: number
    breakOpportunityCount: number
    totalAdvancePt: number
  }
  reservedHeightPt: number
  reservedSlackPt: number
  status: "capacity-sample-measured-fits-reservation"
  evidenceFingerprint: string
}

export interface FlowDocCanonicalReportPaginationInputsBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_VERSION
  kind: "canonical-report-pagination-inputs-bundle"
  phaseId: "PDF-PILOT-08B-R2C-I"
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  sourceSectionReconciliationFingerprint: string
  sourceFontManifestFingerprint: string
  sourceRawEvidenceFingerprint: string
  planFingerprint: string
  familyPaginationInputs: FlowDocCanonicalReportFamilyPaginationInputV1[]
  generatedFooterMeasurement: FlowDocCanonicalReportGeneratedFooterMeasurementV1
  coreCompositionManifest: VNextDocumentCompositionManifestV1
  downstreamBlockers: Array<{
    code:
      | "document-pagination-not-executed"
      | "actual-page-number-expansion-pending"
      | "twelve-page-pagination-sensitive"
      | "page-assignment-not-executed"
    blocks: "page-assignment" | "final-footer-paint" | "twelve-page-fidelity" | "pdf-rendering"
    message: string
  }>
  ownership: {
    paginationInputsOwns: [
      "family-source-locators",
      "bounded-family-pagination-config",
      "exact-family-initial-cursors",
      "generated-page-number-capacity-measurement",
      "pagination-ready-core-composition-manifest",
    ]
    paginationInputsMustNotOwn: [
      "family-pagination-execution",
      "document-composition-transition",
      "actual-page-number-expansion",
      "page-assignment",
      "pdf-bytes",
    ]
  }
  execution: {
    measuredComposition: "consumed-by-reference"
    sectionReconciliation: "consumed"
    familyPaginationInputs: "bound"
    familyInitialCursors: "created"
    generatedFooterCapacityMeasurement: "executed"
    coreCompositionManifest: "refinalized"
    familyPagination: "not-run"
    documentCompositionTransition: "not-run"
    actualPageNumberExpansion: "not-run"
    pageAssignment: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    bodyItemCount: number
    familyInputCount: number
    textFlowInputCount: number
    tableFlowInputCount: number
    mediaFlowInputCount: number
    measurementOwnerReplacementCount: number
    sourceLocatorCount: number
    initialCursorCount: number
    generatedFooterCapacityDigits: number
    generatedFooterMaximumPageNumber: number
    generatedFooterLineCount: number
    generatedFooterHeightPt: number
    generatedFooterReservedHeightPt: number
    generatedFooterReservedSlackPt: number
    paginationExecuted: false
    pageAssignmentExecuted: false
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportPaginationInputsIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportPaginationInputsValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportPaginationInputsBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportPaginationInputsIssueV1[]; summary: null }

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportPaginationInputsBundleV1["ownership"] = {
  paginationInputsOwns: [
    "family-source-locators",
    "bounded-family-pagination-config",
    "exact-family-initial-cursors",
    "generated-page-number-capacity-measurement",
    "pagination-ready-core-composition-manifest",
  ],
  paginationInputsMustNotOwn: [
    "family-pagination-execution",
    "document-composition-transition",
    "actual-page-number-expansion",
    "page-assignment",
    "pdf-bytes",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportPaginationInputsBundleV1["execution"] = {
  measuredComposition: "consumed-by-reference",
  sectionReconciliation: "consumed",
  familyPaginationInputs: "bound",
  familyInitialCursors: "created",
  generatedFooterCapacityMeasurement: "executed",
  coreCompositionManifest: "refinalized",
  familyPagination: "not-run",
  documentCompositionTransition: "not-run",
  actualPageNumberExpansion: "not-run",
  pageAssignment: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportPaginationInputsBundleV1["downstreamBlockers"] = [
  {
    code: "document-pagination-not-executed",
    blocks: "page-assignment",
    message: "All family inputs and initial cursors are bound, but no family window or document transition has executed.",
  },
  {
    code: "actual-page-number-expansion-pending",
    blocks: "final-footer-paint",
    message: "The four-digit capacity sample is measured, but actual page-number glyphs require final page assignment.",
  },
  {
    code: "twelve-page-pagination-sensitive",
    blocks: "twelve-page-fidelity",
    message: "The twelve-page target still depends on actual page-top spacing suppression and family fragmentation overhead.",
  },
  {
    code: "page-assignment-not-executed",
    blocks: "pdf-rendering",
    message: "No body fragment, static zone, or generated footer has a final page assignment.",
  },
]

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function compact(value: unknown): string {
  const source = typeof value === "string" ? value : JSON.stringify(value)
  return `sha256:${sha256(source)}`
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
  const copy = clone(value)
  delete copy[key]
  return copy
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportPaginationInputsIssueV1 {
  return { code, path, message, severity: "error" }
}

function validateSources(input: FlowDocCanonicalReportPaginationInputsSourceV1): string[] {
  const errors: string[] = []
  if (input.projection.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.nativeShaping.bundleFingerprint !== ACCEPTED_NATIVE_SHAPING_FINGERPRINT) errors.push("R2C-D native shaping fingerprint drifted")
  if (input.lineBreaking.bundleFingerprint !== ACCEPTED_LINE_BREAKING_FINGERPRINT) errors.push("R2C-E line-breaking fingerprint drifted")
  if (input.measuredComposition.bundleFingerprint !== ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT) errors.push("R2C-F measured composition fingerprint drifted")
  if (input.sectionReconciliation.bundleFingerprint !== ACCEPTED_SECTION_RECONCILIATION_FINGERPRINT) errors.push("R2C-H section reconciliation fingerprint drifted")
  if (input.nativeShaping.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("native shaping projection source drifted")
  if (input.lineBreaking.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("line-breaking native source drifted")
  if (input.measuredComposition.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("measured composition projection source drifted")
  if (input.measuredComposition.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("measured composition native source drifted")
  if (input.measuredComposition.sourceLineBreakingFingerprint !== input.lineBreaking.bundleFingerprint) errors.push("measured composition line-breaking source drifted")
  if (input.sectionReconciliation.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("section reconciliation projection source drifted")
  if (parseVNextDocumentCompositionManifestV1(input.sectionReconciliation.coreCompositionManifest).status !== "ready") errors.push("R2C-H Core composition manifest is invalid")
  if (input.sectionReconciliation.summary.bodyItemCount !== input.measuredComposition.summary.bodyReadyFlowNodeCount) errors.push("body root coverage drifted between R2C-F and R2C-H")
  return errors
}

function cursorRef(input:
  | { family: "text-flow"; cursor: VNextTextFlowV4PaginationCursor; ownerFingerprint: string }
  | { family: "table-flow"; cursor: VNextTableFlowV4PaginationCursor; ownerFingerprint: string }
  | { family: "media-flow"; cursor: VNextAtomicBlockV4PaginationCursor; ownerFingerprint: string }
): VNextCompositionFamilyCursorRefV1 {
  const stateFingerprint = input.family === "text-flow"
    ? createVNextTextFlowV4CursorFingerprint(input.cursor)
    : input.family === "table-flow"
      ? createVNextTableFlowV4CursorFingerprint(input.cursor)
      : createVNextAtomicBlockV4CursorFingerprint(input.cursor)
  if (input.family === "table-flow") requireFact(
    stateFingerprint === input.cursor.fingerprint,
    `table cursor retained fingerprint drifted: ${input.cursor.tableId}`,
  )
  return {
    contractVersion: 1,
    kind: "composition-family-cursor-ref",
    family: input.family,
    rootNodeId: input.family === "text-flow"
      ? input.cursor.textBlockId
      : input.family === "table-flow" ? input.cursor.tableId : input.cursor.nodeId,
    ownerFingerprint: input.ownerFingerprint,
    stateFingerprint,
    complete: input.cursor.complete,
  }
}

function familyPaginationInputs(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
): FlowDocCanonicalReportFamilyPaginationInputV1[] {
  const manifest = input.sectionReconciliation.coreCompositionManifest
  const pageBodyHeightPt = manifest.sections[0].pageGeometry.bodyHeightPt
  const maximumPageCount = manifest.limits.maximumDocumentPageCount
  const maximumLineCount = 100_000
  const maximumRowPlanCount = manifest.limits.maximumDocumentPlacementCount
  const bindingByItem = new Map(input.sectionReconciliation.spacingBridgeBindings.map((binding) => (
    [binding.itemIndex, binding]
  )))
  const imageBindingById = new Map(input.projection.scopedResolution.resolvedDocument.bindings.images.map((binding) => (
    [binding.placementId, binding]
  )))

  return manifest.bodyItems.map((item): FlowDocCanonicalReportFamilyPaginationInputV1 => {
    const lineage = bindingByItem.get(item.itemIndex)
    requireFact(lineage?.rootNodeId === item.rootNodeId, `source lineage is missing: ${item.rootNodeId}`)
    const base = {
      itemIndex: item.itemIndex,
      sourceSectionIndex: lineage.sourceSectionIndex,
      sourceSectionId: lineage.sourceSectionId,
      compositionSectionId: item.sectionId,
      zoneId: item.zoneId,
      sourceOrder: item.sourceOrder,
      rootNodeId: item.rootNodeId,
      familySourceFingerprint: item.ownerPins.familySource,
    }

    if (item.family === "text-flow") {
      const documentBlockIndex = input.measuredComposition.documentBlocks.findIndex((block) => (
        block.sectionId === lineage.sourceSectionId && block.textBlockId === item.rootNodeId
      ))
      const block = input.measuredComposition.documentBlocks[documentBlockIndex]
      requireFact(block != null, `text pagination source is missing: ${item.rootNodeId}`)
      const measurementOwnerFingerprint = createVNextTextFlowV4MeasurementFingerprint(block.measured)
      const initialCursor = createInitialVNextTextFlowV4PaginationCursor(block.measured)
      requireFact(!initialCursor.complete, `canonical text input is unexpectedly empty: ${item.rootNodeId}`)
      const initialCursorRef = cursorRef({ family: "text-flow", cursor: initialCursor, ownerFingerprint: measurementOwnerFingerprint })
      const source = {
        kind: "measured-document-block" as const,
        measuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
        documentBlockIndex,
        consumerId: block.consumerId,
        acceptedMeasurementFingerprint: measurementOwnerFingerprint,
      }
      const pagination = { pageBodyHeightPt, maximumPageCount, maximumLineCount }
      const facts = { ...base, family: "text-flow" as const, source, pagination, initialCursor, initialCursorRef, measurementOwnerFingerprint }
      return { ...facts, inputFingerprint: compact(facts) }
    }

    if (item.family === "table-flow") {
      const preparedTableIndex = input.measuredComposition.preparedTables.findIndex((table) => (
        table.sectionId === lineage.sourceSectionId && table.tableId === item.rootNodeId
      ))
      const table = input.measuredComposition.preparedTables[preparedTableIndex]
      requireFact(table != null, `table pagination source is missing: ${item.rootNodeId}`)
      const measurementOwnerFingerprint = createVNextTableFlowV4SourceFingerprint(table.preparedRows)
      const pagination = {
        pageBodyHeightPt,
        maximumPageCount,
        maximumRowPlanCount,
        headerPolicy: "repeat-leading-headers" as const,
      }
      const initialCursor = createInitialVNextTableFlowV4PaginationCursor({
        prepared: table.preparedRows,
        pageBodyHeightPt,
        headerPolicy: pagination.headerPolicy,
        maximumRowPlanCount,
      })
      const initialCursorRef = cursorRef({ family: "table-flow", cursor: initialCursor, ownerFingerprint: measurementOwnerFingerprint })
      const source = {
        kind: "prepared-table-row-stream" as const,
        measuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
        preparedTableIndex,
        projectionId: table.projectionId,
        preparedRowsFingerprintSha256: sha256(table.preparedRows.fingerprint),
      }
      const facts = { ...base, family: "table-flow" as const, source, pagination, initialCursor, initialCursorRef, measurementOwnerFingerprint }
      return { ...facts, inputFingerprint: compact(facts) }
    }

    requireFact(item.family === "media-flow", `unsupported canonical family: ${item.family}`)
    const sourceSection = input.projection.projectedInstanceDocument.document.sections[lineage.sourceSectionIndex]
    requireFact(sourceSection?.id === lineage.sourceSectionId, `media source section drifted: ${item.rootNodeId}`)
    const node = sourceSection.nodes[item.rootNodeId]
    requireFact(node?.type === "image", `media source node is missing: ${item.rootNodeId}`)
    const evidenceResult = createVNextAtomicBlockV4Evidence({
      node,
      availableWidthPt: manifest.sections[0].pageGeometry.bodyWidthPt,
      imageBinding: imageBindingById.get(item.rootNodeId),
    })
    requireFact(evidenceResult.status === "ready", `atomic image evidence blocked: ${item.rootNodeId}`)
    const evidence = evidenceResult.evidence
    requireFact(evidence.nodeType === "image", `atomic media evidence type drifted: ${item.rootNodeId}`)
    const measurementOwnerFingerprint = evidence.fingerprint
    const initialCursor = createInitialVNextAtomicBlockV4PaginationCursor(evidence)
    const initialCursorRef = cursorRef({ family: "media-flow", cursor: initialCursor, ownerFingerprint: measurementOwnerFingerprint })
    const fixedImageBlockIndex = input.measuredComposition.fixedImageBlocks.findIndex((image) => (
      image.sectionId === lineage.sourceSectionId && image.imageId === item.rootNodeId
    ))
    const image = input.measuredComposition.fixedImageBlocks[fixedImageBlockIndex]
    requireFact(image?.assetId === evidence.details.assetId, `fixed image evidence drifted: ${item.rootNodeId}`)
    const source = {
      kind: "resolved-atomic-image-evidence" as const,
      projectionFingerprint: input.projection.bundleFingerprint,
      fixedImageBlockIndex,
      assetId: image.assetId,
    }
    const pagination = { pageBodyHeightPt, maximumPageCount: 1 as const }
    const facts = { ...base, family: "media-flow" as const, source, pagination, evidence, initialCursor, initialCursorRef, measurementOwnerFingerprint }
    return { ...facts, inputFingerprint: compact(facts) }
  })
}

function generatedFooterPlan(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
): FlowDocCanonicalReportGeneratedFooterPlanV1 {
  const reconciliation = input.sectionReconciliation
  const sourceSectionId = reconciliation.staticZoneEquivalence.canonicalSourceSectionId
  const zoneId = reconciliation.staticZoneEquivalence.canonicalFooterZoneId
  const resolved = input.projection.scopedResolution.resolvedDocument
  const section = resolved.document.document.sections.find((candidate) => candidate.id === sourceSectionId)
  requireFact(section != null, "canonical footer source section is missing")
  const zone = section.nodes[zoneId]
  requireFact(zone?.type === "zone" && zone.role === "footer" && zone.childIds.length === 1, "canonical footer zone is invalid")
  const textBlock = section.nodes[zone.childIds[0]]
  requireFact(textBlock?.type === "text-block", "canonical footer text block is missing")
  const pageNumberInlines = textBlock.children.filter((inline) => inline.type === "page-number")
  requireFact(pageNumberInlines.length === 1, "canonical footer requires one generated page number")
  const pageNumberInlineId = pageNumberInlines[0].id
  const maximumPageNumber = reconciliation.coreCompositionManifest.limits.maximumDocumentPageCount
  requireFact(String(maximumPageNumber).length === FOOTER_CAPACITY_DIGITS, "footer capacity digits no longer cover the manifest page limit")
  const generationFacts = {
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceSectionReconciliationFingerprint: reconciliation.bundleFingerprint,
    sourceSectionId,
    zoneId,
    textBlockId: textBlock.id,
    pageNumberInlineId,
    start: reconciliation.staticZoneEquivalence.pageNumberPolicy.start,
    continuation: reconciliation.staticZoneEquivalence.pageNumberPolicy.continuation,
    maximumPageNumber,
    capacityDigits: FOOTER_CAPACITY_DIGITS,
    capacitySample: FOOTER_CAPACITY_SAMPLE,
    samplePolicy: "repeat-eight-digit-capacity-proof-v1",
  }
  const generationOwnerFingerprint = compact(generationFacts)
  const style = resolved.bindings.styles.find((binding) => binding.textBlockId === textBlock.id)
  requireFact(style?.styleKey === FOOTER_STYLE_KEY, "canonical footer style binding drifted")
  const pageGeometry = reconciliation.coreCompositionManifest.sections[0].pageGeometry
  const requestResult = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
    documentId: resolved.instanceId,
    instanceRevision: resolved.instanceRevision,
    sectionId: section.id,
    textBlock,
    availableWidthPt: pageGeometry.bodyWidthPt,
    measurementProfileId: input.lineBreaking.measurementProfileId,
    styleKey: style.styleKey,
    resolvedTextByInlineId: Object.fromEntries(resolved.bindings.fields.map((binding) => [
      binding.inlineId,
      { fieldKey: binding.fieldKey, value: binding.value },
    ])),
    resolvedImageByPlacementId: Object.fromEntries(resolved.bindings.images.map((binding) => [
      binding.placementId,
      { assetId: binding.assetId },
    ])),
    generatedTextByInlineId: {
      [pageNumberInlineId]: {
        kind: "page-number",
        value: FOOTER_CAPACITY_SAMPLE,
        ownerFingerprint: generationOwnerFingerprint,
      },
    },
  })
  requireFact(requestResult.status === "ready", "generated footer measurement request is blocked")
  const measurementRequest = requestResult.request
  const styleBinding = input.nativeShaping.styleBindings.find((binding) => binding.styleKey === FOOTER_STYLE_KEY)
  const lineHeight = input.lineBreaking.lineHeightBindings.find((binding) => binding.styleKey === FOOTER_STYLE_KEY)
  requireFact(styleBinding != null && lineHeight != null, "generated footer typography binding is missing")
  requireFact(styleBinding.fontSizePt === lineHeight.fontSizePt, "generated footer font-size binding drifted")
  const fontMatches = [...input.fontManifest.fontAssets, ...input.fontManifest.candidateFontAssets].filter((font) => (
    font.fontId === styleBinding.primaryFontId && font.sha256 === styleBinding.primaryFontSha256
  ))
  requireFact(fontMatches.length === 1 && fontMatches[0].target?.path != null, "generated footer font asset is not uniquely registered")
  const font = fontMatches[0]
  const measurementId = `report-footer-measure:${sha256(JSON.stringify(measurementRequest)).slice(0, 32)}`
  const shapeRequestId = `report-footer-shape:${sha256(JSON.stringify([
    font.fontId,
    font.sha256,
    styleBinding.fontSizePt,
    measurementRequest.renderedText,
  ])).slice(0, 32)}`
  const segmentRequestId = `report-footer-segment:${sha256(measurementRequest.renderedText).slice(0, 32)}`
  const adapterRequest: VNextTextEngineAdapterRequest = {
    requestId: measurementId,
    smokeCaseId: "canonical-report-r2c-i-generated-footer",
    sampleId: measurementId,
    measurementProfileId: measurementRequest.measurementProfileId,
    text: measurementRequest.renderedText,
    locale: "th",
    fontId: font.fontId,
    styleKey: FOOTER_STYLE_KEY,
    availableWidthPt: measurementRequest.availableWidthPt,
    outputShapeVersion: "glyph-line-box-v1",
    requestedFacts: ["glyph-id", "glyph-advance", "glyph-offset", "cluster-map", "text-range", "line-box"],
  }
  const nativeExecution = {
    measurementId,
    shapeRequestId,
    segmentRequestId,
    fontId: font.fontId,
    fontSha256: font.sha256,
    fontAssetPath: font.target!.path,
    fontSizePt: styleBinding.fontSizePt,
    lineHeightPt: lineHeight.lineHeightPt,
    availableWidthPt: measurementRequest.availableWidthPt,
    renderedText: measurementRequest.renderedText,
    adapterRequest,
  }
  const reservedHeightPt = section.page.footerReserved ?? 0
  const pageNumberPolicy: FlowDocCanonicalReportGeneratedFooterPlanV1["pageNumberPolicy"] = {
    start: 1 as const,
    continuation: "continuous-generated-page-number" as const,
    maximumPageNumber,
    capacityDigits: FOOTER_CAPACITY_DIGITS,
    capacitySample: FOOTER_CAPACITY_SAMPLE,
    generationOwnerFingerprint,
  }
  const facts: Omit<FlowDocCanonicalReportGeneratedFooterPlanV1, "planFingerprint"> = {
    sourceSectionId,
    zoneId,
    textBlockId: textBlock.id,
    pageNumberInlineId,
    styleKey: FOOTER_STYLE_KEY,
    pageNumberPolicy,
    measurementRequest,
    nativeExecution,
    reservedHeightPt,
  }
  return { ...facts, planFingerprint: sha256(JSON.stringify(facts)) }
}

function buildPlan(input: FlowDocCanonicalReportPaginationInputsSourceV1): FlowDocCanonicalReportPaginationInputsPlanV1 {
  const unsigned: Omit<FlowDocCanonicalReportPaginationInputsPlanV1, "planFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-pagination-inputs-plan",
    paginationInputsId: FLOWDOC_CANONICAL_REPORT_PAGINATION_INPUTS_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    sourceSectionReconciliationFingerprint: input.sectionReconciliation.bundleFingerprint,
    sourceFontManifestFingerprint: sha256(JSON.stringify(input.fontManifest)),
    familyPaginationInputs: familyPaginationInputs(input),
    generatedFooter: generatedFooterPlan(input),
  }
  return { ...unsigned, planFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportPaginationInputsPlanV1(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
): FlowDocCanonicalReportPaginationInputsPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildPlan(input)
}

export function createFlowDocCanonicalReportPaginationInputsRawEvidenceV1(
  plan: FlowDocCanonicalReportPaginationInputsPlanV1,
  execution: {
    shapeOutput: FlowDocRustybuzzRawSmokeOutput
    segmentOutput: FlowDocIcu4xNativeLineSegmentOutputV1
  },
): FlowDocCanonicalReportPaginationInputsRawEvidenceV1 {
  const native = plan.generatedFooter.nativeExecution
  requireFact(execution.shapeOutput.text === native.renderedText, "generated footer raw shape text drifted")
  requireFact(execution.shapeOutput.fontId === native.fontId, "generated footer raw shape font drifted")
  requireFact(execution.segmentOutput.text === native.renderedText, "generated footer raw segment text drifted")
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-pagination-inputs-raw-evidence" as const,
    phaseId: "PDF-PILOT-08B-R2C-I" as const,
    sourcePlanFingerprint: plan.planFingerprint,
    shapeExecution: { shapeRequestId: native.shapeRequestId, rawOutput: clone(execution.shapeOutput) },
    segmentExecution: { segmentRequestId: native.segmentRequestId, rawOutput: clone(execution.segmentOutput) },
  }
  return { ...unsigned, rawEvidenceFingerprint: sha256(JSON.stringify(unsigned)) }
}

function utf8ByteToUtf16Map(text: string): Map<number, number> {
  const offsets = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    byteOffset += Buffer.byteLength(scalar, "utf8")
    utf16Offset += scalar.length
    offsets.set(byteOffset, utf16Offset)
  }
  return offsets
}

function classifyBreak(text: string, offset: number): VNextThaiLineBreakKind {
  if (offset === text.length) return "mandatory"
  const preceding = Array.from(text.slice(0, offset)).at(-1) ?? ""
  if (/^[\r\n\u0085\u2028\u2029]$/u.test(preceding)) return "mandatory"
  if (/^\s$/u.test(preceding)) return "space"
  if (/^[\p{P}\p{S}]$/u.test(preceding)) return "punctuation"
  return "word"
}

function mapBreaks(text: string, raw: FlowDocIcu4xNativeLineSegmentOutputV1): VNextThaiLineBreakOpportunity[] {
  const byteToUtf16 = utf8ByteToUtf16Map(text)
  return raw.breakByteOffsets.slice(1).map((byteOffset) => {
    const offset = byteToUtf16.get(byteOffset)
    requireFact(offset != null, `generated footer break is not a UTF-8 scalar boundary: ${byteOffset}`)
    return { offset, kind: classifyBreak(text, offset) }
  })
}

function validateRaw(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  plan: FlowDocCanonicalReportPaginationInputsPlanV1,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
): string[] {
  const errors: string[] = []
  const native = plan.generatedFooter.nativeExecution
  const segment = raw.segmentExecution.rawOutput
  if (raw.contractVersion !== 1 || raw.kind !== "canonical-report-pagination-inputs-raw-evidence") errors.push("raw R2C-I evidence shape is invalid")
  if (raw.phaseId !== "PDF-PILOT-08B-R2C-I") errors.push("raw R2C-I phase identity drifted")
  if (raw.sourcePlanFingerprint !== plan.planFingerprint) errors.push("raw R2C-I plan source drifted")
  if (raw.rawEvidenceFingerprint !== sha256(JSON.stringify(withoutFingerprint(raw, "rawEvidenceFingerprint")))) errors.push("raw R2C-I fingerprint does not match content")
  if (raw.shapeExecution.shapeRequestId !== native.shapeRequestId) errors.push("generated footer shape request identity drifted")
  if (raw.shapeExecution.rawOutput.text !== native.renderedText || raw.shapeExecution.rawOutput.fontId !== native.fontId) errors.push("generated footer raw shape source drifted")
  if (raw.segmentExecution.segmentRequestId !== native.segmentRequestId) errors.push("generated footer segment request identity drifted")
  if (segment.source !== "flowdoc-icu4x-native-line-segmenter") errors.push("generated footer segmenter source drifted")
  if (segment.segmenterRevision !== input.lineBreaking.profileBinding.nativeSegmenterRevision) errors.push("generated footer segmenter revision drifted")
  if (segment.dataRevision !== input.lineBreaking.profileBinding.nativeSegmenterDataRevision) errors.push("generated footer segmenter data revision drifted")
  if (segment.text !== native.renderedText || segment.textByteLength !== Buffer.byteLength(native.renderedText, "utf8")) errors.push("generated footer raw segment text drifted")
  if (segment.breakByteOffsets[0] !== 0 || segment.breakByteOffsets.at(-1) !== segment.textByteLength) errors.push("generated footer break coverage is incomplete")
  return errors
}

function generatedFooterMeasurement(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  plan: FlowDocCanonicalReportPaginationInputsPlanV1,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
): FlowDocCanonicalReportGeneratedFooterMeasurementV1 {
  const footer = plan.generatedFooter
  const native = footer.nativeExecution
  const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
    request: native.adapterRequest,
    rawOutput: raw.shapeExecution.rawOutput,
    engine: {
      shaper: "rustybuzz",
      shaperRevision: input.nativeShaping.profileBinding.nativeShaperRevision,
      segmenter: "icu4x",
      segmenterRevision: input.lineBreaking.profileBinding.nativeSegmenterRevision,
      segmenterDataRevision: input.lineBreaking.profileBinding.nativeSegmenterDataRevision,
      deterministic: true,
    },
    fontSizePt: native.fontSizePt,
    lineHeightPt: native.lineHeightPt,
  })
  requireFact(mapping.status === "ready" && mapping.evidence != null, "generated footer native glyph mapping is blocked")
  const breakOpportunities = mapBreaks(native.renderedText, raw.segmentExecution.rawOutput)
  const glyphEvidence: VNextTextEngineAdapterEvidence = {
    requestId: native.adapterRequest.requestId,
    measurementProfileId: native.adapterRequest.measurementProfileId,
    outputShapeVersion: native.adapterRequest.outputShapeVersion,
    engine: clone(mapping.evidence.engine),
    glyphs: mapping.evidence.glyphs.map(clone),
    lineBoxes: [],
    totalAdvancePt: mapping.evidence.totalAdvancePt,
    lineHeightPt: native.lineHeightPt,
  }
  const wrapped = createFlowDocTextEngineLineWrapEvidencePlan({
    request: native.adapterRequest,
    glyphEvidence,
    breakEvidence: {
      evidenceId: `report-footer-breaks:${sha256(JSON.stringify(breakOpportunities)).slice(0, 32)}`,
      sampleId: native.adapterRequest.sampleId,
      locale: "th",
      candidate: {
        candidateId: "icu4x-native-2.2.0",
        engine: "icu4x",
        role: "primary-deterministic",
        runtimeDependent: false,
        engineRevision: input.lineBreaking.profileBinding.nativeSegmenterRevision,
        dataRevision: input.lineBreaking.profileBinding.nativeSegmenterDataRevision,
        lineBreakPolicy: input.lineBreaking.profileBinding.lineBreakPolicy,
      },
      breaks: breakOpportunities,
    },
    availableWidthPt: native.availableWidthPt,
  })
  requireFact(
    wrapped.status === "ready" && wrapped.evidence != null,
    `generated footer line wrapping blocked: ${wrapped.blockingIssues.map((item) => item.code).join(",")}`,
  )
  requireFact(wrapped.evidence.lineBoxes.length === 1, "generated footer capacity sample must remain one line")
  requireFact(wrapped.coverage.overflowLineCount === 0, "generated footer capacity sample overflows")
  const accepted = acceptVNextTextBlockV4MeasuredLines(footer.measurementRequest, wrapped.evidence.lineBoxes.map((line) => ({
    index: line.lineIndex,
    startOffset: line.startOffset,
    endOffset: line.endOffset,
    text: footer.measurementRequest.renderedText.slice(line.startOffset, line.endOffset),
    widthPt: line.widthPt,
    heightPt: line.heightPt,
  })))
  requireFact(accepted.status === "accepted", "Core rejected generated footer line evidence")
  requireFact(accepted.summary.totalHeightPt <= footer.reservedHeightPt, "generated footer exceeds its reserved height")
  const acceptedMeasurementFingerprint = createVNextTextFlowV4MeasurementFingerprint(accepted)
  const nativeEvidence = {
    rawEvidenceFingerprint: raw.rawEvidenceFingerprint,
    glyphCount: mapping.evidence.glyphs.length,
    missingGlyphCount: mapping.evidence.glyphs.filter((glyph) => glyph.glyphId === 0).length,
    coveredGlyphCount: wrapped.coverage.coveredGlyphCount,
    breakOpportunityCount: breakOpportunities.length,
    totalAdvancePt: mapping.evidence.totalAdvancePt,
  }
  requireFact(nativeEvidence.missingGlyphCount === 0, "generated footer shaping contains missing glyphs")
  const facts = {
    sourceSectionId: footer.sourceSectionId,
    zoneId: footer.zoneId,
    textBlockId: footer.textBlockId,
    pageNumberInlineId: footer.pageNumberInlineId,
    pageNumberPolicy: clone(footer.pageNumberPolicy),
    measurementRequest: clone(footer.measurementRequest),
    accepted,
    acceptedMeasurementFingerprint,
    lineBoxes: wrapped.evidence.lineBoxes.map(clone),
    nativeEvidence,
    reservedHeightPt: footer.reservedHeightPt,
    reservedSlackPt: roundPt(footer.reservedHeightPt - accepted.summary.totalHeightPt),
    status: "capacity-sample-measured-fits-reservation" as const,
  }
  return { ...facts, evidenceFingerprint: compact(facts) }
}

function finalizedManifest(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  plan: FlowDocCanonicalReportPaginationInputsPlanV1,
  footer: FlowDocCanonicalReportGeneratedFooterMeasurementV1,
): VNextDocumentCompositionManifestV1 {
  const source = input.sectionReconciliation.coreCompositionManifest
  const familyByItem = new Map(plan.familyPaginationInputs.map((item) => [item.itemIndex, item]))
  const facts: VNextDocumentCompositionManifestInputV1 = {
    source: source.source,
    contractVersion: source.contractVersion,
    kind: source.kind,
    documentId: source.documentId,
    documentStructureFingerprint: source.documentStructureFingerprint,
    resolvedProjectionFingerprint: source.resolvedProjectionFingerprint,
    sections: source.sections.map((section) => ({
      ...clone(section),
      staticZones: section.staticZones.map((zone) => zone.role === "footer"
        ? { ...clone(zone), evidenceFingerprint: footer.evidenceFingerprint }
        : clone(zone)),
    })),
    bodyItems: source.bodyItems.map((item) => {
      const family = familyByItem.get(item.itemIndex)
      requireFact(family?.rootNodeId === item.rootNodeId, `family input is missing from manifest: ${item.rootNodeId}`)
      return {
        ...clone(item),
        ownerPins: {
          ...clone(item.ownerPins),
          measurement: family.measurementOwnerFingerprint,
        },
        initialCursor: clone(family.initialCursorRef),
      }
    }),
    limits: clone(source.limits),
  }
  const result = finalizeVNextDocumentCompositionManifestV1(facts)
  requireFact(result.status === "ready", `pagination-ready Core manifest blocked: ${result.issues.map((item) => item.code).join(",")}`)
  return result.manifest
}

function buildBundle(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
): FlowDocCanonicalReportPaginationInputsBundleV1 {
  const plan = buildPlan(input)
  const rawErrors = validateRaw(input, plan, raw)
  requireFact(rawErrors.length === 0, rawErrors.join("; "))
  const footer = generatedFooterMeasurement(input, plan, raw)
  const manifest = finalizedManifest(input, plan, footer)
  const previousItems = input.sectionReconciliation.coreCompositionManifest.bodyItems
  const familyInputs = plan.familyPaginationInputs
  const summary: FlowDocCanonicalReportPaginationInputsBundleV1["summary"] = {
    bodyItemCount: manifest.bodyItems.length,
    familyInputCount: familyInputs.length,
    textFlowInputCount: familyInputs.filter((item) => item.family === "text-flow").length,
    tableFlowInputCount: familyInputs.filter((item) => item.family === "table-flow").length,
    mediaFlowInputCount: familyInputs.filter((item) => item.family === "media-flow").length,
    measurementOwnerReplacementCount: familyInputs.filter((item) => (
      previousItems[item.itemIndex]?.ownerPins.measurement !== item.measurementOwnerFingerprint
    )).length,
    sourceLocatorCount: familyInputs.length,
    initialCursorCount: familyInputs.length,
    generatedFooterCapacityDigits: footer.pageNumberPolicy.capacityDigits,
    generatedFooterMaximumPageNumber: footer.pageNumberPolicy.maximumPageNumber,
    generatedFooterLineCount: footer.accepted.summary.lineCount,
    generatedFooterHeightPt: footer.accepted.summary.totalHeightPt,
    generatedFooterReservedHeightPt: footer.reservedHeightPt,
    generatedFooterReservedSlackPt: footer.reservedSlackPt,
    paginationExecuted: false,
    pageAssignmentExecuted: false,
  }
  requireFact(summary.familyInputCount === summary.bodyItemCount, "family input coverage is incomplete")
  requireFact(summary.textFlowInputCount === 165 && summary.tableFlowInputCount === 15 && summary.mediaFlowInputCount === 5, "canonical family counts drifted")
  requireFact(summary.measurementOwnerReplacementCount === summary.bodyItemCount, "placeholder manifest owners were not fully replaced")
  requireFact(summary.generatedFooterLineCount === 1, "generated footer capacity proof is not one line")
  const unsigned: Omit<FlowDocCanonicalReportPaginationInputsBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-pagination-inputs-bundle",
    phaseId: "PDF-PILOT-08B-R2C-I",
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    sourceSectionReconciliationFingerprint: input.sectionReconciliation.bundleFingerprint,
    sourceFontManifestFingerprint: sha256(JSON.stringify(input.fontManifest)),
    sourceRawEvidenceFingerprint: raw.rawEvidenceFingerprint,
    planFingerprint: plan.planFingerprint,
    familyPaginationInputs: familyInputs,
    generatedFooterMeasurement: footer,
    coreCompositionManifest: manifest,
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary,
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportPaginationInputsBundleV1(
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
): FlowDocCanonicalReportPaginationInputsBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input, raw)
}

export function validateFlowDocCanonicalReportPaginationInputsBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportPaginationInputsSourceV1,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
): FlowDocCanonicalReportPaginationInputsValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportPaginationInputsBundleV1
  const issues: FlowDocCanonicalReportPaginationInputsIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-pagination-inputs-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-I") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceProjectionFingerprint !== input.projection.bundleFingerprint) issues.push(issue("source-projection", "sourceProjectionFingerprint", "R2C-C source fingerprint differs"))
  if (bundle.sourceMeasuredCompositionFingerprint !== input.measuredComposition.bundleFingerprint) issues.push(issue("source-composition", "sourceMeasuredCompositionFingerprint", "R2C-F source fingerprint differs"))
  if (bundle.sourceSectionReconciliationFingerprint !== input.sectionReconciliation.bundleFingerprint) issues.push(issue("source-reconciliation", "sourceSectionReconciliationFingerprint", "R2C-H source fingerprint differs"))
  if (bundle.sourceRawEvidenceFingerprint !== raw.rawEvidenceFingerprint) issues.push(issue("source-raw", "sourceRawEvidenceFingerprint", "raw footer evidence fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "pagination-input ownership drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "pagination-input execution boundary drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "pagination-input blockers drifted"))
  for (const forbidden of ["pages", "pageAssignments", "rootPlacements", "pagination", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `pagination-input bundle must not contain ${forbidden}`))
  }
  if (parseVNextDocumentCompositionManifestV1(bundle.coreCompositionManifest).status !== "ready") issues.push(issue("core-manifest", "coreCompositionManifest", "pagination-ready Core manifest is invalid"))
  if (issues.length === 0) {
    try {
      const plan = buildPlan(input)
      validateRaw(input, plan, raw).forEach((message) => issues.push(issue("invalid-raw", "raw", message)))
    } catch (error) {
      issues.push(issue("invalid-raw", "raw", error instanceof Error ? error.message : "raw evidence validation failed"))
    }
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportPaginationInputsBundleV1
  try {
    expected = buildBundle(input, raw)
  } catch (error) {
    return {
      status: "blocked",
      issues: [issue("expected-bundle-build", "", error instanceof Error ? error.message : "expected bundle build failed")],
      summary: null,
    }
  }
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")))) issues.push(issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"))
  if (JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")) !== JSON.stringify(withoutFingerprint(expected, "bundleFingerprint"))) issues.push(issue("canonical-bundle-drift", "", "pagination-input bundle differs from deterministic source and raw evidence"))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
