import { createHash } from "node:crypto"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextPdfMeasuredDrawContractV1,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  createVNextTextFlowV4MeasurementFingerprint,
  parseVNextDocumentCompositionPagePlanV1,
  type VNextPdfDrawCommand,
  type VNextPdfFontAssetV1,
  type VNextPdfGlyphFactV1,
  type VNextPdfGlyphRunPaintCommandV1,
  type VNextPdfMeasuredDrawContractResultV1,
  type VNextPdfPaintBoundsV1,
  type VNextPdfPageBoxV1,
  type VNextPdfRendererAdapterPlan,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextEngineAdapterEvidence,
  type VNextTextEngineAdapterRequest,
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
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "./canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "./canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "./canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "./canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"
import { FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1 } from "./canonicalReportTemplateResolution.js"

export const FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID =
  "ocr-benchmark-report-static-zone-handoff-v1" as const

const ACCEPTED_PROJECTION_FINGERPRINT = "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193"
const ACCEPTED_NATIVE_SHAPING_FINGERPRINT = "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8"
const ACCEPTED_LINE_BREAKING_FINGERPRINT = "e1a9612766a6342ab3c36bbd0475f170bd4ef64d706161513bdf2f4a64b634a4"
const ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT = "a80b13c98aee27c949d2a80bc4b73b8c619ef3f9fa1678792fdb64a28b20127a"
const ACCEPTED_PAGINATION_INPUTS_FINGERPRINT = "73e19092ffa8b203e2aa0fb73463bcb882dcc9b83c652969aad7ed0ef39eb724"
const ACCEPTED_PAGINATION_EXECUTION_FINGERPRINT = "f22854d8cb99e451f9c8b29c977f822a9e44fc8afd345d50087a77a0c94a83d0"
const ACCEPTED_FONT_MANIFEST_FINGERPRINT = "ba811589b50375b3f70b66689c14645d7d0328f95802b9cfac7f31d096d79077"
const STATIC_ZONE_STYLE_KEY = "report-caption"
const STATIC_ZONE_COLOR = "4B5563"
const RENDERER_PROFILE_ID = "pdf-pilot-08b-r2c-k-static-zones-v1"

type AcceptedMeasuredLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

export interface FlowDocCanonicalReportStaticZoneHandoffSourceV1 {
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  nativeShaping: FlowDocCanonicalReportNativeShapingBundleV1
  lineBreaking: FlowDocCanonicalReportLineBreakingBundleV1
  measuredComposition: FlowDocCanonicalReportMeasuredCompositionBundleV1
  paginationInputs: FlowDocCanonicalReportPaginationInputsBundleV1
  paginationExecution: FlowDocCanonicalReportPaginationExecutionBundleV1
  fontManifest: FlowDocCanonicalReportNativeShapingFontManifestV1
}

export interface FlowDocCanonicalReportActualFooterPlanV1 {
  pageIndex: number
  pageNumber: number
  sourcePageFingerprint: string
  sourceStaticZoneEvidenceFingerprint: string
  generationOwnerFingerprint: string
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
    renderedText: string
    adapterRequest: VNextTextEngineAdapterRequest
  }
  planFingerprint: string
}

export interface FlowDocCanonicalReportStaticZoneHandoffPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_VERSION
  kind: "canonical-report-static-zone-handoff-plan"
  handoffId: typeof FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  sourcePaginationInputsFingerprint: string
  sourcePaginationExecutionFingerprint: string
  sourcePagePlanFingerprint: string
  sourceFontManifestFingerprint: string
  measurementProfileId: string
  placementPolicy: {
    policyId: "canonical-report-static-zone-placement-v1"
    headerHorizontalAlignment: "start"
    footerHorizontalAlignment: "end"
    verticalAlignmentWithinReservation: "start"
    baselinePolicy: "line-height-minus-half-leading"
    baselineFormula: "lineHeightPt - (lineHeightPt - fontSizePt) / 2"
    geometrySource: "core-page-plan-body-geometry-plus-authored-reservations"
    alignmentSource: "canonical-report-renderer-profile"
    sourceDocumentMutation: false
  }
  actualFooters: FlowDocCanonicalReportActualFooterPlanV1[]
  planFingerprint: string
}

export interface FlowDocCanonicalReportStaticZoneRawEvidenceV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_VERSION
  kind: "canonical-report-static-zone-raw-evidence"
  phaseId: "PDF-PILOT-08B-R2C-K"
  sourcePlanFingerprint: string
  executions: Array<{
    pageIndex: number
    pageNumber: number
    shapeRequestId: string
    shapeOutput: FlowDocRustybuzzRawSmokeOutput
    segmentRequestId: string
    segmentOutput: FlowDocIcu4xNativeLineSegmentOutputV1
  }>
  rawEvidenceFingerprint: string
}

export interface FlowDocCanonicalReportStaticZoneTextInstanceV1 {
  role: "header" | "footer"
  pageIndex: number
  pageNumber: number
  sourcePageFingerprint: string
  sourceSectionId: string
  zoneId: string
  textBlockId: string
  renderedText: string
  measurementRequest: VNextTextBlockV4MeasurementRequest
  accepted: AcceptedMeasuredLines
  acceptedMeasurementFingerprint: string
  reservationBounds: VNextPdfPaintBoundsV1
  paintBounds: VNextPdfPaintBoundsV1
  alignment: "start" | "end"
  fontId: string
  fontSizePt: number
  lineHeightPt: number
  baselineOffsetPt: number
  color: typeof STATIC_ZONE_COLOR
  glyphs: VNextPdfGlyphFactV1[]
  nativeEvidence: {
    source: "accepted-r2c-d" | "actual-r2c-k-native-execution"
    evidenceFingerprint: string
    glyphCount: number
    missingGlyphCount: number
    breakOpportunityCount: number
    totalAdvancePt: number
  }
  drawCommand: VNextPdfDrawCommand
  paintCommand: VNextPdfGlyphRunPaintCommandV1
  instanceFingerprint: string
}

export interface FlowDocCanonicalReportStaticZonePageV1 {
  pageIndex: number
  pageNumber: number
  sourcePageFingerprint: string
  pageBox: VNextPdfPageBoxV1
  header: FlowDocCanonicalReportStaticZoneTextInstanceV1
  footer: FlowDocCanonicalReportStaticZoneTextInstanceV1
  pageFingerprint: string
}

export interface FlowDocCanonicalReportStaticZoneHandoffBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_VERSION
  kind: "canonical-report-static-zone-handoff-bundle"
  phaseId: "PDF-PILOT-08B-R2C-K"
  handoffId: typeof FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  sourcePaginationInputsFingerprint: string
  sourcePaginationExecutionFingerprint: string
  sourcePagePlanFingerprint: string
  sourceFontManifestFingerprint: string
  sourceRawEvidenceFingerprint: string
  planFingerprint: string
  placementPolicy: FlowDocCanonicalReportStaticZoneHandoffPlanV1["placementPolicy"]
  pages: FlowDocCanonicalReportStaticZonePageV1[]
  rendererHandoff: {
    scope: "page-specific-static-zones-only"
    mergeTarget: "full-document-measured-draw-contract"
    bodyDisplayList: "pending-r2c-l"
    adapterPlan: VNextPdfRendererAdapterPlan
    measuredDrawContract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>
  }
  downstreamBlockers: Array<{
    code:
      | "body-display-list-pending"
      | "pdf-rendering-not-run"
      | "visual-fidelity-validation-pending"
      | "twelve-page-layout-calibration-open"
    blocks: "full-renderer-handoff" | "pdf-bytes" | "report-acceptance" | "twelve-page-fidelity-target"
    message: string
  }>
  ownership: {
    staticZoneHandoffOwns: [
      "actual-page-number-expansion",
      "page-specific-header-instances",
      "page-specific-footer-instances",
      "static-zone-placement-policy",
      "static-zone-glyph-paint-commands",
      "static-zone-measured-draw-contract",
    ]
    staticZoneHandoffMustNotOwn: [
      "body-display-list",
      "full-document-measured-draw-contract",
      "pdf-bytes",
      "visual-fidelity-acceptance",
      "twelve-page-layout-calibration",
    ]
  }
  execution: {
    pageAssignment: "consumed-final"
    actualPageNumberExpansion: "executed"
    footerNativeShaping: "executed-per-page"
    footerNativeSegmentation: "executed-per-page"
    headerEvidence: "reused-accepted-r2c-d-e-f"
    staticZonePlacement: "executed"
    staticZoneMeasuredDrawContract: "consumable"
    bodyDisplayList: "not-run"
    fullDocumentMeasuredDrawContract: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    pageCount: number
    actualFooterCount: number
    staticZoneInstanceCount: number
    headerInstanceCount: number
    footerInstanceCount: number
    drawCommandCount: number
    paintCommandCount: number
    glyphCount: number
    missingGlyphCount: number
    maximumFooterWidthPt: number
    footerCapacityWidthPt: number
    footerCapacityHeld: boolean
    rendererHandoffConsumable: boolean
    actualPageNumbersExpanded: boolean
    bodyDisplayListBuilt: boolean
    pdfRendered: boolean
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportStaticZoneHandoffIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportStaticZoneHandoffValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportStaticZoneHandoffBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportStaticZoneHandoffIssueV1[]; summary: null }

const PLACEMENT_POLICY: FlowDocCanonicalReportStaticZoneHandoffPlanV1["placementPolicy"] = {
  policyId: "canonical-report-static-zone-placement-v1",
  headerHorizontalAlignment: "start",
  footerHorizontalAlignment: "end",
  verticalAlignmentWithinReservation: "start",
  baselinePolicy: "line-height-minus-half-leading",
  baselineFormula: "lineHeightPt - (lineHeightPt - fontSizePt) / 2",
  geometrySource: "core-page-plan-body-geometry-plus-authored-reservations",
  alignmentSource: "canonical-report-renderer-profile",
  sourceDocumentMutation: false,
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportStaticZoneHandoffBundleV1["downstreamBlockers"] = [
  {
    code: "body-display-list-pending",
    blocks: "full-renderer-handoff",
    message: "Static zones are renderer-consumable, but body placements have not been decomposed into measured draw commands.",
  },
  {
    code: "pdf-rendering-not-run",
    blocks: "pdf-bytes",
    message: "The static-zone handoff is not a complete document display list and has not been rendered to PDF bytes.",
  },
  {
    code: "visual-fidelity-validation-pending",
    blocks: "report-acceptance",
    message: "No complete rendered PDF exists for region-aware comparison with the canonical report.",
  },
  {
    code: "twelve-page-layout-calibration-open",
    blocks: "twelve-page-fidelity-target",
    message: "The authoritative page plan remains thirteen pages; static-zone generation must not conceal the extra body page.",
  },
]

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportStaticZoneHandoffBundleV1["ownership"] = {
  staticZoneHandoffOwns: [
    "actual-page-number-expansion",
    "page-specific-header-instances",
    "page-specific-footer-instances",
    "static-zone-placement-policy",
    "static-zone-glyph-paint-commands",
    "static-zone-measured-draw-contract",
  ],
  staticZoneHandoffMustNotOwn: [
    "body-display-list",
    "full-document-measured-draw-contract",
    "pdf-bytes",
    "visual-fidelity-acceptance",
    "twelve-page-layout-calibration",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportStaticZoneHandoffBundleV1["execution"] = {
  pageAssignment: "consumed-final",
  actualPageNumberExpansion: "executed",
  footerNativeShaping: "executed-per-page",
  footerNativeSegmentation: "executed-per-page",
  headerEvidence: "reused-accepted-r2c-d-e-f",
  staticZonePlacement: "executed",
  staticZoneMeasuredDrawContract: "consumable",
  bodyDisplayList: "not-run",
  fullDocumentMeasuredDrawContract: "not-run",
  pdfRendering: "not-run",
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function compact(value: unknown): string {
  return `sha256:${sha256(typeof value === "string" ? value : JSON.stringify(value))}`
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

function issue(code: string, path: string, message: string): FlowDocCanonicalReportStaticZoneHandoffIssueV1 {
  return { code, path, message, severity: "error" }
}

function validBundleFingerprint(value: { bundleFingerprint: string }): boolean {
  return value.bundleFingerprint === sha256(JSON.stringify(withoutFingerprint(value, "bundleFingerprint")))
}

function validateSources(input: FlowDocCanonicalReportStaticZoneHandoffSourceV1): string[] {
  const errors: string[] = []
  if (input.projection.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.nativeShaping.bundleFingerprint !== ACCEPTED_NATIVE_SHAPING_FINGERPRINT) errors.push("R2C-D native shaping fingerprint drifted")
  if (input.lineBreaking.bundleFingerprint !== ACCEPTED_LINE_BREAKING_FINGERPRINT) errors.push("R2C-E line-breaking fingerprint drifted")
  if (input.measuredComposition.bundleFingerprint !== ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT) errors.push("R2C-F measured composition fingerprint drifted")
  if (input.paginationInputs.bundleFingerprint !== ACCEPTED_PAGINATION_INPUTS_FINGERPRINT) errors.push("R2C-I pagination inputs fingerprint drifted")
  if (input.paginationExecution.bundleFingerprint !== ACCEPTED_PAGINATION_EXECUTION_FINGERPRINT) errors.push("R2C-J pagination execution fingerprint drifted")
  if (input.paginationInputs.sourceFontManifestFingerprint !== ACCEPTED_FONT_MANIFEST_FINGERPRINT) errors.push("font manifest fingerprint drifted")
  if (!validBundleFingerprint(input.projection)) errors.push("R2C-C projection content fingerprint is invalid")
  if (!validBundleFingerprint(input.nativeShaping)) errors.push("R2C-D native shaping content fingerprint is invalid")
  if (!validBundleFingerprint(input.lineBreaking)) errors.push("R2C-E line-breaking content fingerprint is invalid")
  if (!validBundleFingerprint(input.measuredComposition)) errors.push("R2C-F measured composition content fingerprint is invalid")
  if (!validBundleFingerprint(input.paginationInputs)) errors.push("R2C-I pagination inputs content fingerprint is invalid")
  if (!validBundleFingerprint(input.paginationExecution)) errors.push("R2C-J pagination execution content fingerprint is invalid")
  if (sha256(JSON.stringify(input.fontManifest)) !== ACCEPTED_FONT_MANIFEST_FINGERPRINT) errors.push("font manifest content fingerprint is invalid")
  if (input.nativeShaping.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("native shaping projection source drifted")
  if (input.lineBreaking.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("line-breaking native source drifted")
  if (input.measuredComposition.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("measured composition projection source drifted")
  if (input.measuredComposition.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("measured composition native source drifted")
  if (input.measuredComposition.sourceLineBreakingFingerprint !== input.lineBreaking.bundleFingerprint) errors.push("measured composition line-breaking source drifted")
  if (input.paginationInputs.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("pagination inputs projection source drifted")
  if (input.paginationInputs.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("pagination inputs native source drifted")
  if (input.paginationInputs.sourceLineBreakingFingerprint !== input.lineBreaking.bundleFingerprint) errors.push("pagination inputs line-breaking source drifted")
  if (input.paginationInputs.sourceMeasuredCompositionFingerprint !== input.measuredComposition.bundleFingerprint) errors.push("pagination inputs measured-composition source drifted")
  if (input.paginationExecution.sourcePaginationInputsFingerprint !== input.paginationInputs.bundleFingerprint) errors.push("pagination execution input source drifted")
  if (input.paginationExecution.sourceMeasuredCompositionFingerprint !== input.measuredComposition.bundleFingerprint) errors.push("pagination execution measured-composition source drifted")
  if (input.nativeShaping.measurementProfileId !== input.lineBreaking.measurementProfileId) errors.push("native and line measurement profiles differ")
  if (input.paginationExecution.summary.actualPageCount !== 13) errors.push("authoritative page count drifted")
  if (input.paginationExecution.summary.actualPageNumberExpansionExecuted) errors.push("R2C-J unexpectedly expanded page numbers")
  if (input.paginationExecution.corePagePlan.pages.length !== input.paginationExecution.summary.actualPageCount) errors.push("page plan count differs from summary")
  if (parseVNextDocumentCompositionPagePlanV1(input.paginationExecution.corePagePlan).status !== "ready") errors.push("R2C-J Core page plan is invalid")
  return errors
}

function canonicalFooterSource(input: FlowDocCanonicalReportStaticZoneHandoffSourceV1) {
  const footer = input.paginationInputs.generatedFooterMeasurement
  const resolved = input.projection.scopedResolution.resolvedDocument
  const section = resolved.document.document.sections.find((candidate) => candidate.id === footer.sourceSectionId)
  requireFact(section != null, "canonical footer source section is missing")
  const zone = section.nodes[footer.zoneId]
  requireFact(zone?.type === "zone" && zone.role === "footer" && zone.childIds.length === 1, "canonical footer zone is invalid")
  const textBlock = section.nodes[footer.textBlockId]
  requireFact(textBlock?.type === "text-block" && zone.childIds[0] === textBlock.id, "canonical footer text block is invalid")
  const style = resolved.bindings.styles.find((binding) => binding.textBlockId === textBlock.id)
  requireFact(style?.styleKey === STATIC_ZONE_STYLE_KEY, "canonical footer style binding drifted")
  requireFact(style.runStyle.textColor === STATIC_ZONE_COLOR, "canonical footer color drifted")
  return { resolved, section, zone, textBlock, style }
}

function regularFont(input: FlowDocCanonicalReportStaticZoneHandoffSourceV1) {
  const binding = input.nativeShaping.styleBindings.find((candidate) => candidate.styleKey === STATIC_ZONE_STYLE_KEY)
  requireFact(binding != null, "report-caption native style binding is missing")
  const lineHeight = input.lineBreaking.lineHeightBindings.find((candidate) => candidate.styleKey === STATIC_ZONE_STYLE_KEY)
  requireFact(lineHeight != null && lineHeight.fontSizePt === binding.fontSizePt, "report-caption line-height binding drifted")
  const matches = [...input.fontManifest.fontAssets, ...input.fontManifest.candidateFontAssets].filter((candidate) => (
    candidate.fontId === binding.primaryFontId && candidate.sha256 === binding.primaryFontSha256
  ))
  requireFact(matches.length === 1 && matches[0].target?.path != null, "report-caption font is not uniquely registered")
  return { binding, lineHeight, manifest: matches[0] }
}

function actualFooterPlans(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
): FlowDocCanonicalReportActualFooterPlanV1[] {
  const source = canonicalFooterSource(input)
  const font = regularFont(input)
  const capacity = input.paginationInputs.generatedFooterMeasurement
  return input.paginationExecution.corePagePlan.pages.map((page) => {
    const staticZone = page.staticZones.find((candidate) => candidate.role === "footer")
    requireFact(staticZone?.zoneId === capacity.zoneId, `footer static-zone identity drifted on page ${page.pageNumber}`)
    requireFact(
      staticZone.evidenceFingerprint === capacity.evidenceFingerprint,
      `footer static-zone capacity evidence drifted on page ${page.pageNumber}`,
    )
    const generationOwnerFingerprint = compact({
      policy: "actual-page-number-instance-owner-v1",
      sourceGenerationOwnerFingerprint: capacity.pageNumberPolicy.generationOwnerFingerprint,
      sourcePagePlanFingerprint: input.paginationExecution.corePagePlan.fingerprint,
      sourcePageFingerprint: page.fingerprint,
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      pageNumberInlineId: capacity.pageNumberInlineId,
    })
    const requestResult = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
      documentId: source.resolved.instanceId,
      instanceRevision: source.resolved.instanceRevision,
      sectionId: source.section.id,
      textBlock: source.textBlock,
      availableWidthPt: page.pageGeometry.bodyWidthPt,
      measurementProfileId: input.lineBreaking.measurementProfileId,
      styleKey: STATIC_ZONE_STYLE_KEY,
      resolvedTextByInlineId: Object.fromEntries(source.resolved.bindings.fields.map((binding) => [
        binding.inlineId,
        { fieldKey: binding.fieldKey, value: binding.value },
      ])),
      resolvedImageByPlacementId: Object.fromEntries(source.resolved.bindings.images.map((binding) => [
        binding.placementId,
        { assetId: binding.assetId },
      ])),
      generatedTextByInlineId: {
        [capacity.pageNumberInlineId]: {
          kind: "page-number",
          value: String(page.pageNumber),
          ownerFingerprint: generationOwnerFingerprint,
        },
      },
    })
    requireFact(requestResult.status === "ready", `actual footer measurement request blocked on page ${page.pageNumber}`)
    const measurementRequest = requestResult.request
    const measurementId = `report-static-footer-measure:${sha256(JSON.stringify(measurementRequest)).slice(0, 32)}`
    const shapeRequestId = `report-static-footer-shape:${sha256(JSON.stringify([
      font.manifest.fontId,
      font.manifest.sha256,
      font.binding.fontSizePt,
      measurementRequest.renderedText,
    ])).slice(0, 32)}`
    const segmentRequestId = `report-static-footer-segment:${sha256(measurementRequest.renderedText).slice(0, 32)}`
    const adapterRequest: VNextTextEngineAdapterRequest = {
      requestId: measurementId,
      smokeCaseId: `canonical-report-r2c-k-footer-page-${page.pageNumber}`,
      sampleId: measurementId,
      measurementProfileId: measurementRequest.measurementProfileId,
      text: measurementRequest.renderedText,
      locale: "th",
      fontId: font.manifest.fontId,
      styleKey: STATIC_ZONE_STYLE_KEY,
      availableWidthPt: measurementRequest.availableWidthPt,
      outputShapeVersion: "glyph-line-box-v1",
      requestedFacts: ["glyph-id", "glyph-advance", "glyph-offset", "cluster-map", "text-range", "line-box"],
    }
    const nativeExecution = {
      measurementId,
      shapeRequestId,
      segmentRequestId,
      fontId: font.manifest.fontId,
      fontSha256: font.manifest.sha256,
      fontAssetPath: font.manifest.target!.path,
      fontSizePt: font.binding.fontSizePt,
      lineHeightPt: font.lineHeight.lineHeightPt,
      renderedText: measurementRequest.renderedText,
      adapterRequest,
    }
    const facts: Omit<FlowDocCanonicalReportActualFooterPlanV1, "planFingerprint"> = {
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      sourcePageFingerprint: page.fingerprint,
      sourceStaticZoneEvidenceFingerprint: staticZone.evidenceFingerprint,
      generationOwnerFingerprint,
      measurementRequest,
      nativeExecution,
    }
    return { ...facts, planFingerprint: compact(facts) }
  })
}

function createPlan(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
): FlowDocCanonicalReportStaticZoneHandoffPlanV1 {
  const unsigned: Omit<FlowDocCanonicalReportStaticZoneHandoffPlanV1, "planFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-static-zone-handoff-plan",
    handoffId: FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    sourcePaginationInputsFingerprint: input.paginationInputs.bundleFingerprint,
    sourcePaginationExecutionFingerprint: input.paginationExecution.bundleFingerprint,
    sourcePagePlanFingerprint: input.paginationExecution.corePagePlan.fingerprint,
    sourceFontManifestFingerprint: input.paginationInputs.sourceFontManifestFingerprint,
    measurementProfileId: input.nativeShaping.measurementProfileId,
    placementPolicy: clone(PLACEMENT_POLICY),
    actualFooters: actualFooterPlans(input),
  }
  return { ...unsigned, planFingerprint: compact(unsigned) }
}

export function createFlowDocCanonicalReportStaticZoneHandoffPlanV1(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
): FlowDocCanonicalReportStaticZoneHandoffPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

export function createFlowDocCanonicalReportStaticZoneRawEvidenceV1(
  plan: FlowDocCanonicalReportStaticZoneHandoffPlanV1,
  executions: FlowDocCanonicalReportStaticZoneRawEvidenceV1["executions"],
): FlowDocCanonicalReportStaticZoneRawEvidenceV1 {
  requireFact(executions.length === plan.actualFooters.length, "actual footer raw execution count drifted")
  executions.forEach((execution, index) => {
    const footer = plan.actualFooters[index]
    requireFact(execution.pageIndex === footer.pageIndex && execution.pageNumber === footer.pageNumber, `actual footer raw page order drifted at ${index}`)
    requireFact(execution.shapeRequestId === footer.nativeExecution.shapeRequestId, `actual footer shape request drifted at ${index}`)
    requireFact(execution.segmentRequestId === footer.nativeExecution.segmentRequestId, `actual footer segment request drifted at ${index}`)
    requireFact(execution.shapeOutput.text === footer.nativeExecution.renderedText, `actual footer shape text drifted at ${index}`)
    requireFact(execution.shapeOutput.fontId === footer.nativeExecution.fontId, `actual footer shape font drifted at ${index}`)
    requireFact(execution.shapeOutput.source === "flowdoc-rustybuzz-native-smoke", `actual footer shape source drifted at ${index}`)
    requireFact(execution.segmentOutput.text === footer.nativeExecution.renderedText, `actual footer segment text drifted at ${index}`)
    requireFact(execution.segmentOutput.source === "flowdoc-icu4x-native-line-segmenter", `actual footer segment source drifted at ${index}`)
  })
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-static-zone-raw-evidence" as const,
    phaseId: "PDF-PILOT-08B-R2C-K" as const,
    sourcePlanFingerprint: plan.planFingerprint,
    executions: executions.map(clone),
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
    requireFact(offset != null, `ICU4X break is not on a Unicode scalar boundary: ${byteOffset}`)
    return { offset, kind: classifyBreak(text, offset) }
  })
}

function validateRaw(
  plan: FlowDocCanonicalReportStaticZoneHandoffPlanV1,
  raw: FlowDocCanonicalReportStaticZoneRawEvidenceV1,
): string[] {
  const errors: string[] = []
  if (raw.contractVersion !== 1 || raw.kind !== "canonical-report-static-zone-raw-evidence") errors.push("raw static-zone evidence shape is invalid")
  if (raw.phaseId !== "PDF-PILOT-08B-R2C-K") errors.push("raw static-zone phase identity drifted")
  if (raw.sourcePlanFingerprint !== plan.planFingerprint) errors.push("raw static-zone plan fingerprint drifted")
  if (raw.rawEvidenceFingerprint !== sha256(JSON.stringify(withoutFingerprint(raw, "rawEvidenceFingerprint")))) errors.push("raw static-zone fingerprint does not match content")
  if (raw.executions.length !== plan.actualFooters.length) errors.push("raw static-zone execution count drifted")
  raw.executions.forEach((execution, index) => {
    const footer = plan.actualFooters[index]
    if (execution.pageIndex !== footer?.pageIndex || execution.pageNumber !== footer?.pageNumber) errors.push(`raw static-zone page order drifted at ${index}`)
    if (execution.shapeRequestId !== footer?.nativeExecution.shapeRequestId) errors.push(`raw static-zone shape request drifted at ${index}`)
    if (execution.segmentRequestId !== footer?.nativeExecution.segmentRequestId) errors.push(`raw static-zone segment request drifted at ${index}`)
    if (execution.shapeOutput.fontPath !== footer?.nativeExecution.fontAssetPath) errors.push(`raw static-zone font path drifted at ${index}`)
    if (execution.shapeOutput.source !== "flowdoc-rustybuzz-native-smoke") errors.push(`raw static-zone shaper source drifted at ${index}`)
    if (execution.shapeOutput.shaperRevision !== "rustybuzz-0.20.1") errors.push(`raw static-zone shaper revision drifted at ${index}`)
    if (execution.shapeOutput.text !== footer?.nativeExecution.renderedText) errors.push(`raw static-zone shape text drifted at ${index}`)
    if (execution.shapeOutput.textByteLength !== Buffer.byteLength(execution.shapeOutput.text, "utf8")) errors.push(`raw static-zone shape byte length drifted at ${index}`)
    if (execution.segmentOutput.source !== "flowdoc-icu4x-native-line-segmenter") errors.push(`raw static-zone segmenter source drifted at ${index}`)
    if (execution.segmentOutput.segmenterRevision !== "icu_segmenter-2.2.0") errors.push(`raw static-zone segmenter revision drifted at ${index}`)
    if (execution.segmentOutput.dataRevision !== "icu_segmenter_data-2.2.0") errors.push(`raw static-zone segmenter data drifted at ${index}`)
    if (execution.segmentOutput.text !== footer?.nativeExecution.renderedText) errors.push(`raw static-zone segment text drifted at ${index}`)
    if (execution.segmentOutput.textByteLength !== Buffer.byteLength(execution.segmentOutput.text, "utf8")) errors.push(`raw static-zone segment byte length drifted at ${index}`)
  })
  return errors
}

function glyphFacts(glyphs: VNextTextEngineAdapterEvidence["glyphs"]): VNextPdfGlyphFactV1[] {
  return glyphs.map((glyph, glyphIndex) => ({
    glyphIndex,
    glyphId: glyph.glyphId,
    advancePt: roundPt(glyph.advancePt),
    offsetXPt: roundPt(glyph.offsetXPt),
    offsetYPt: roundPt(glyph.offsetYPt),
    clusterStartOffset: glyph.clusterStartOffset,
    clusterEndOffset: glyph.clusterEndOffset,
  }))
}

function baselineOffset(fontSizePt: number, lineHeightPt: number): number {
  return roundPt(lineHeightPt - (lineHeightPt - fontSizePt) / 2)
}

function reservationBounds(
  page: FlowDocCanonicalReportStaticZoneHandoffSourceV1["paginationExecution"]["corePagePlan"]["pages"][number],
  role: "header" | "footer",
  reservedHeightPt: number,
): VNextPdfPaintBoundsV1 {
  return {
    xPt: page.pageGeometry.bodyOriginXPt,
    yPt: role === "header"
      ? roundPt(page.pageGeometry.bodyOriginYPt - reservedHeightPt)
      : roundPt(page.pageGeometry.bodyOriginYPt + page.pageGeometry.bodyHeightPt),
    widthPt: page.pageGeometry.bodyWidthPt,
    heightPt: reservedHeightPt,
  }
}

function paintBounds(
  reservation: VNextPdfPaintBoundsV1,
  alignment: "start" | "end",
  widthPt: number,
  lineHeightPt: number,
): VNextPdfPaintBoundsV1 {
  return {
    xPt: alignment === "start" ? reservation.xPt : roundPt(reservation.xPt + reservation.widthPt - widthPt),
    yPt: reservation.yPt,
    widthPt: roundPt(widthPt),
    heightPt: lineHeightPt,
  }
}

interface StaticTextFacts {
  role: "header" | "footer"
  pageIndex: number
  pageNumber: number
  sourcePageFingerprint: string
  sourceSectionId: string
  zoneId: string
  textBlockId: string
  measurementRequest: VNextTextBlockV4MeasurementRequest
  accepted: AcceptedMeasuredLines
  acceptedMeasurementFingerprint: string
  reservationBounds: VNextPdfPaintBoundsV1
  alignment: "start" | "end"
  fontId: string
  fontSizePt: number
  lineHeightPt: number
  glyphs: VNextPdfGlyphFactV1[]
  nativeEvidence: FlowDocCanonicalReportStaticZoneTextInstanceV1["nativeEvidence"]
}

function staticTextInstance(facts: StaticTextFacts): FlowDocCanonicalReportStaticZoneTextInstanceV1 {
  requireFact(facts.accepted.lines.length === 1, `${facts.role} must be exactly one measured line`)
  const line = facts.accepted.lines[0]
  const bounds = paintBounds(facts.reservationBounds, facts.alignment, line.widthPt, facts.lineHeightPt)
  const drawCommand: VNextPdfDrawCommand = {
    id: `pdf:canonical-static:p${facts.pageNumber}:${facts.role}`,
    sourceCommandId: `canonical-static:p${facts.pageNumber}:${facts.role}`,
    fragmentId: `fragment:canonical-static:p${facts.pageNumber}:${facts.role}`,
    pageIndex: facts.pageIndex,
    pageNumber: facts.pageNumber,
    operation: "draw-text",
    nodeId: facts.textBlockId,
    nodeType: "text-block",
    bounds,
    text: facts.measurementRequest.renderedText,
    table: null,
  }
  const paintCommand: VNextPdfGlyphRunPaintCommandV1 = {
    id: `paint:canonical-static:p${facts.pageNumber}:${facts.role}`,
    sourceCommandId: drawCommand.id,
    pageIndex: facts.pageIndex,
    paintOrder: facts.role === "header" ? 0 : 1,
    bounds,
    kind: "glyph-run",
    measurementRequestId: compact(facts.measurementRequest),
    measurementProfileId: facts.measurementRequest.measurementProfileId,
    text: facts.measurementRequest.renderedText,
    fontId: facts.fontId,
    fontSizePt: facts.fontSizePt,
    lineHeightPt: facts.lineHeightPt,
    baselineOffsetPt: baselineOffset(facts.fontSizePt, facts.lineHeightPt),
    color: STATIC_ZONE_COLOR,
    opacity: 1,
    glyphs: facts.glyphs.map(clone),
  }
  const unsigned: Omit<FlowDocCanonicalReportStaticZoneTextInstanceV1, "instanceFingerprint"> = {
    role: facts.role,
    pageIndex: facts.pageIndex,
    pageNumber: facts.pageNumber,
    sourcePageFingerprint: facts.sourcePageFingerprint,
    sourceSectionId: facts.sourceSectionId,
    zoneId: facts.zoneId,
    textBlockId: facts.textBlockId,
    renderedText: facts.measurementRequest.renderedText,
    measurementRequest: clone(facts.measurementRequest),
    accepted: clone(facts.accepted),
    acceptedMeasurementFingerprint: facts.acceptedMeasurementFingerprint,
    reservationBounds: clone(facts.reservationBounds),
    paintBounds: clone(bounds),
    alignment: facts.alignment,
    fontId: facts.fontId,
    fontSizePt: facts.fontSizePt,
    lineHeightPt: facts.lineHeightPt,
    baselineOffsetPt: paintCommand.baselineOffsetPt,
    color: STATIC_ZONE_COLOR,
    glyphs: facts.glyphs.map(clone),
    nativeEvidence: clone(facts.nativeEvidence),
    drawCommand,
    paintCommand,
  }
  return { ...unsigned, instanceFingerprint: compact(unsigned) }
}

function headerFacts(input: FlowDocCanonicalReportStaticZoneHandoffSourceV1) {
  const header = input.measuredComposition.documentBlocks.find((candidate) => (
    candidate.sectionId === "section-cover"
    && candidate.zoneRole === "header"
    && candidate.textBlockId === "cover-header-text"
  ))
  requireFact(header != null, "canonical measured header is missing")
  const variant = input.nativeShaping.measurementVariants.find((candidate) => candidate.measurementVariantId === header.measurementVariantId)
  const lineMeasurement = input.lineBreaking.measurements.find((candidate) => candidate.measurementVariantId === header.measurementVariantId)
  requireFact(variant != null && lineMeasurement != null, "canonical header native evidence is missing")
  requireFact(variant.shapeRuns.length === 1 && variant.shapeRuns[0].shapeRequestId != null, "canonical header requires one shape run")
  const shape = input.nativeShaping.shapeExecutions.find((candidate) => (
    candidate.shapeRequest.shapeRequestId === variant.shapeRuns[0].shapeRequestId
  ))
  requireFact(shape != null && shape.summary.missingGlyphCount === 0, "canonical header glyph evidence is invalid")
  requireFact(lineMeasurement.lineBoxes.length === 1 && lineMeasurement.summary.overflowLineCount === 0, "canonical header line evidence is invalid")
  requireFact(lineMeasurement.lineBoxes[0].widthPt === header.measured.lines[0]?.widthPt, "canonical header measured width drifted")
  const font = regularFont(input)
  requireFact(shape.shapeRequest.fontId === font.manifest.fontId, "canonical header font drifted")
  const sourceSection = input.projection.scopedResolution.resolvedDocument.document.document.sections.find((section) => (
    section.id === header.sectionId
  ))
  requireFact(sourceSection != null, "canonical header source section is missing")
  const zone = sourceSection.zoneIds
    .map((zoneId) => sourceSection.nodes[zoneId])
    .find((candidate) => candidate?.type === "zone" && candidate.role === "header")
  requireFact(zone?.type === "zone" && zone.childIds.includes(header.textBlockId), "canonical header zone is invalid")
  return { header, variant, lineMeasurement, shape, font, zone }
}

function actualFooterInstance(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
  plan: FlowDocCanonicalReportActualFooterPlanV1,
  execution: FlowDocCanonicalReportStaticZoneRawEvidenceV1["executions"][number],
): {
  accepted: AcceptedMeasuredLines
  glyphs: VNextPdfGlyphFactV1[]
  widthPt: number
  nativeEvidence: FlowDocCanonicalReportStaticZoneTextInstanceV1["nativeEvidence"]
} {
  const native = plan.nativeExecution
  const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
    request: native.adapterRequest,
    rawOutput: execution.shapeOutput,
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
  requireFact(mapping.status === "ready" && mapping.evidence != null, `actual footer glyph mapping blocked on page ${plan.pageNumber}`)
  const breaks = mapBreaks(native.renderedText, execution.segmentOutput)
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
      evidenceId: `report-static-footer-breaks:${sha256(JSON.stringify(breaks)).slice(0, 32)}`,
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
      breaks,
    },
    availableWidthPt: plan.measurementRequest.availableWidthPt,
  })
  requireFact(wrapped.status === "ready" && wrapped.evidence != null, `actual footer wrapping blocked on page ${plan.pageNumber}`)
  requireFact(wrapped.evidence.lineBoxes.length === 1 && wrapped.coverage.overflowLineCount === 0, `actual footer must fit one line on page ${plan.pageNumber}`)
  const accepted = acceptVNextTextBlockV4MeasuredLines(plan.measurementRequest, wrapped.evidence.lineBoxes.map((line) => ({
    index: line.lineIndex,
    startOffset: line.startOffset,
    endOffset: line.endOffset,
    text: plan.measurementRequest.renderedText.slice(line.startOffset, line.endOffset),
    widthPt: line.widthPt,
    heightPt: line.heightPt,
  })))
  requireFact(accepted.status === "accepted", `Core rejected actual footer evidence on page ${plan.pageNumber}`)
  const missingGlyphCount = mapping.evidence.glyphs.filter((glyph) => glyph.glyphId === 0).length
  requireFact(missingGlyphCount === 0, `actual footer contains missing glyphs on page ${plan.pageNumber}`)
  return {
    accepted,
    glyphs: glyphFacts(mapping.evidence.glyphs),
    widthPt: wrapped.evidence.lineBoxes[0].widthPt,
    nativeEvidence: {
      source: "actual-r2c-k-native-execution",
      evidenceFingerprint: compact({
        shapeOutput: execution.shapeOutput,
        segmentOutput: execution.segmentOutput,
        lineBoxes: wrapped.evidence.lineBoxes,
      }),
      glyphCount: mapping.evidence.glyphs.length,
      missingGlyphCount,
      breakOpportunityCount: breaks.length,
      totalAdvancePt: mapping.evidence.totalAdvancePt,
    },
  }
}

function fontAsset(input: FlowDocCanonicalReportStaticZoneHandoffSourceV1): VNextPdfFontAssetV1 {
  const { manifest } = regularFont(input)
  return {
    fontId: manifest.fontId,
    family: manifest.family,
    style: manifest.style,
    weight: manifest.weight,
    format: "ttf",
    sha256: manifest.sha256,
    sourceKind: "package-font-asset",
    licenseId: "OFL-1.1",
    embedding: "subset",
    toUnicodeMap: true,
  }
}

function adapterPlan(pages: FlowDocCanonicalReportStaticZonePageV1[]): VNextPdfRendererAdapterPlan {
  const drawCommands = pages.flatMap((page) => [page.header.drawCommand, page.footer.drawCommand])
  return {
    source: "vnext-pdf-renderer-adapter",
    mode: "measured-render-command-adapter",
    status: "ready",
    rendererContract: {
      consumes: "measured-render-commands",
      mayRelayout: false,
      requiresAuthoredDocumentForLayout: false,
      output: "pdf",
    },
    artifact: { kind: "pdf", status: "not-rendered", contentType: "application/pdf", bytes: null, storageId: null },
    pageCount: pages.length,
    drawCommands,
    blockingIssues: [],
    warningIssues: [],
    summary: {
      inputCommandCount: drawCommands.length,
      drawCommandCount: drawCommands.length,
      textCommandCount: drawCommands.length,
      boxCommandCount: 0,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    },
  }
}

function buildBundle(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
  raw: FlowDocCanonicalReportStaticZoneRawEvidenceV1,
): FlowDocCanonicalReportStaticZoneHandoffBundleV1 {
  const plan = createPlan(input)
  const rawErrors = validateRaw(plan, raw)
  requireFact(rawErrors.length === 0, rawErrors.join("; "))
  const header = headerFacts(input)
  const footerSource = input.paginationInputs.generatedFooterMeasurement
  const headerReservedPt = input.projection.scopedResolution.resolvedDocument.document.document.sections[0].page.headerReserved ?? 0
  const footerReservedPt = input.projection.scopedResolution.resolvedDocument.document.document.sections[0].page.footerReserved ?? 0
  requireFact(
    headerReservedPt === FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.headerReservedPt
      && footerReservedPt === FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.footerReservedPt,
    "canonical static-zone reservations drifted from the measured page calibration",
  )
  const canonicalHeaderStaticFingerprint = input.paginationExecution.corePagePlan.pages[0].staticZones.find((zone) => (
    zone.role === "header"
  ))?.evidenceFingerprint
  requireFact(canonicalHeaderStaticFingerprint != null, "canonical header static-zone evidence is missing")
  const pages = input.paginationExecution.corePagePlan.pages.map((page, pageIndex) => {
    const footerPlan = plan.actualFooters[pageIndex]
    const rawExecution = raw.executions[pageIndex]
    requireFact(footerPlan.pageIndex === page.pageIndex && rawExecution.pageIndex === page.pageIndex, `static-zone page order drifted at ${pageIndex}`)
    const sourceHeaderZone = page.staticZones.find((candidate) => candidate.role === "header")
    requireFact(sourceHeaderZone?.zoneId === header.zone.id, `header static-zone identity drifted on page ${page.pageNumber}`)
    requireFact(
      sourceHeaderZone.evidenceFingerprint === canonicalHeaderStaticFingerprint,
      `header static-zone evidence drifted on page ${page.pageNumber}`,
    )
    const headerReservation = reservationBounds(page, "header", headerReservedPt)
    const footerReservation = reservationBounds(page, "footer", footerReservedPt)
    const headerInstance = staticTextInstance({
      role: "header",
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      sourcePageFingerprint: page.fingerprint,
      sourceSectionId: header.header.sectionId,
      zoneId: header.zone.id,
      textBlockId: header.header.textBlockId,
      measurementRequest: header.header.request,
      accepted: header.header.measured,
      acceptedMeasurementFingerprint: createVNextTextFlowV4MeasurementFingerprint(header.header.measured),
      reservationBounds: headerReservation,
      alignment: "start",
      fontId: header.font.manifest.fontId,
      fontSizePt: header.font.binding.fontSizePt,
      lineHeightPt: header.font.lineHeight.lineHeightPt,
      glyphs: glyphFacts(header.shape.evidence.glyphs),
      nativeEvidence: {
        source: "accepted-r2c-d",
        evidenceFingerprint: compact({
          rawOutputFingerprint: header.shape.rawOutputFingerprint,
          lineMeasurement: header.lineMeasurement,
        }),
        glyphCount: header.shape.summary.glyphCount,
        missingGlyphCount: header.shape.summary.missingGlyphCount,
        breakOpportunityCount: header.lineMeasurement.breakOpportunities.length,
        totalAdvancePt: header.shape.evidence.totalAdvancePt,
      },
    })
    const measuredFooter = actualFooterInstance(input, footerPlan, rawExecution)
    requireFact(measuredFooter.accepted.summary.totalHeightPt <= footerReservedPt, `footer exceeds reservation on page ${page.pageNumber}`)
    requireFact(measuredFooter.widthPt <= footerSource.lineBoxes[0].widthPt, `footer exceeds four-digit capacity proof on page ${page.pageNumber}`)
    const footerInstance = staticTextInstance({
      role: "footer",
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      sourcePageFingerprint: page.fingerprint,
      sourceSectionId: footerPlan.measurementRequest.sectionId,
      zoneId: footerSource.zoneId,
      textBlockId: footerSource.textBlockId,
      measurementRequest: footerPlan.measurementRequest,
      accepted: measuredFooter.accepted,
      acceptedMeasurementFingerprint: createVNextTextFlowV4MeasurementFingerprint(measuredFooter.accepted),
      reservationBounds: footerReservation,
      alignment: "end",
      fontId: footerPlan.nativeExecution.fontId,
      fontSizePt: footerPlan.nativeExecution.fontSizePt,
      lineHeightPt: footerPlan.nativeExecution.lineHeightPt,
      glyphs: measuredFooter.glyphs,
      nativeEvidence: measuredFooter.nativeEvidence,
    })
    const facts: Omit<FlowDocCanonicalReportStaticZonePageV1, "pageFingerprint"> = {
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      sourcePageFingerprint: page.fingerprint,
      pageBox: {
        pageIndex: page.pageIndex,
        pageNumber: page.pageNumber,
        widthPt: page.pageGeometry.pageWidthPt,
        heightPt: page.pageGeometry.pageHeightPt,
        backgroundColor: "FFFFFF",
      },
      header: headerInstance,
      footer: footerInstance,
    }
    return { ...facts, pageFingerprint: compact(facts) }
  })
  const planForRenderer = adapterPlan(pages)
  const measuredDrawContract = createVNextPdfMeasuredDrawContractV1({
    contractVersion: 1,
    kind: "pdf-measured-draw-contract-request",
    pilotId: FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID,
    rendererProfileId: RENDERER_PROFILE_ID,
    measurementProfileId: plan.measurementProfileId,
    plan: planForRenderer,
    pageBoxes: pages.map((page) => page.pageBox),
    fontAssets: [fontAsset(input)],
    imageAssets: [],
    paintCommands: pages.flatMap((page) => [page.header.paintCommand, page.footer.paintCommand]),
    bindProductionRenderer: false,
  })
  requireFact(measuredDrawContract.status === "consumable", `Core rejected static-zone renderer handoff: ${measuredDrawContract.issues.map((item) => item.code).join(",")}`)
  const glyphCount = pages.reduce((total, page) => total + page.header.glyphs.length + page.footer.glyphs.length, 0)
  const missingGlyphCount = pages.reduce((total, page) => (
    total + page.header.nativeEvidence.missingGlyphCount + page.footer.nativeEvidence.missingGlyphCount
  ), 0)
  const maximumFooterWidthPt = roundPt(Math.max(...pages.map((page) => page.footer.paintBounds.widthPt)))
  const footerCapacityWidthPt = footerSource.lineBoxes[0].widthPt
  const summary: FlowDocCanonicalReportStaticZoneHandoffBundleV1["summary"] = {
    pageCount: pages.length,
    actualFooterCount: pages.length,
    staticZoneInstanceCount: pages.length * 2,
    headerInstanceCount: pages.length,
    footerInstanceCount: pages.length,
    drawCommandCount: measuredDrawContract.summary.sourceCommandCount,
    paintCommandCount: measuredDrawContract.summary.paintCommandCount,
    glyphCount,
    missingGlyphCount,
    maximumFooterWidthPt,
    footerCapacityWidthPt,
    footerCapacityHeld: maximumFooterWidthPt <= footerCapacityWidthPt,
    rendererHandoffConsumable: true,
    actualPageNumbersExpanded: true,
    bodyDisplayListBuilt: false,
    pdfRendered: false,
  }
  requireFact(summary.pageCount === 13 && summary.actualFooterCount === 13, "actual page-number coverage drifted")
  requireFact(summary.staticZoneInstanceCount === 26 && summary.paintCommandCount === 26, "static-zone command coverage drifted")
  requireFact(summary.missingGlyphCount === 0 && summary.footerCapacityHeld, "static-zone glyph or capacity proof failed")
  const unsigned: Omit<FlowDocCanonicalReportStaticZoneHandoffBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-static-zone-handoff-bundle",
    phaseId: "PDF-PILOT-08B-R2C-K",
    handoffId: FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: input.measuredComposition.bundleFingerprint,
    sourcePaginationInputsFingerprint: input.paginationInputs.bundleFingerprint,
    sourcePaginationExecutionFingerprint: input.paginationExecution.bundleFingerprint,
    sourcePagePlanFingerprint: input.paginationExecution.corePagePlan.fingerprint,
    sourceFontManifestFingerprint: input.paginationInputs.sourceFontManifestFingerprint,
    sourceRawEvidenceFingerprint: raw.rawEvidenceFingerprint,
    planFingerprint: plan.planFingerprint,
    placementPolicy: clone(PLACEMENT_POLICY),
    pages,
    rendererHandoff: {
      scope: "page-specific-static-zones-only",
      mergeTarget: "full-document-measured-draw-contract",
      bodyDisplayList: "pending-r2c-l",
      adapterPlan: planForRenderer,
      measuredDrawContract,
    },
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary,
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportStaticZoneHandoffBundleV1(
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
  raw: FlowDocCanonicalReportStaticZoneRawEvidenceV1,
): FlowDocCanonicalReportStaticZoneHandoffBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input, raw)
}

export function validateFlowDocCanonicalReportStaticZoneHandoffBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportStaticZoneHandoffSourceV1,
  raw: FlowDocCanonicalReportStaticZoneRawEvidenceV1,
): FlowDocCanonicalReportStaticZoneHandoffValidationV1 {
  const issues: FlowDocCanonicalReportStaticZoneHandoffIssueV1[] = []
  const sourceErrors = validateSources(input)
  sourceErrors.forEach((message) => issues.push(issue("invalid-source", "source", message)))
  if (!isRecord(value)) return { status: "blocked", issues: [issue("bundle-shape", "bundle", "static-zone handoff bundle must be an object")], summary: null }
  const bundle = value as unknown as FlowDocCanonicalReportStaticZoneHandoffBundleV1
  if (bundle.contractVersion !== 1 || bundle.kind !== "canonical-report-static-zone-handoff-bundle") issues.push(issue("bundle-shape", "bundle", "unexpected bundle contract shape"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-K" || bundle.handoffId !== FLOWDOC_CANONICAL_REPORT_STATIC_ZONE_HANDOFF_ID) issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceRawEvidenceFingerprint !== raw.rawEvidenceFingerprint) issues.push(issue("source-raw", "sourceRawEvidenceFingerprint", "raw evidence fingerprint differs"))
  if (JSON.stringify(bundle.placementPolicy) !== JSON.stringify(PLACEMENT_POLICY)) issues.push(issue("placement-policy", "placementPolicy", "static-zone placement policy drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-boundary", "downstreamBlockers", "downstream blockers drifted"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "ownership boundary drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "execution boundary drifted"))
  let expected: FlowDocCanonicalReportStaticZoneHandoffBundleV1
  try {
    expected = buildBundle(input, raw)
  } catch (error) {
    issues.push(issue("rebuild-failed", "bundle", error instanceof Error ? error.message : String(error)))
    return { status: "blocked", issues, summary: null }
  }
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")))) issues.push(issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"))
  if (bundle.bundleFingerprint !== expected.bundleFingerprint) issues.push(issue("expected-bundle", "bundleFingerprint", "bundle differs from deterministic rebuild"))
  if (JSON.stringify(bundle) !== JSON.stringify(expected)) issues.push(issue("bundle-content", "bundle", "bundle content differs from deterministic rebuild"))
  return issues.length > 0 ? { status: "blocked", issues, summary: null } : { status: "valid", issues: [], summary: bundle.summary }
}
