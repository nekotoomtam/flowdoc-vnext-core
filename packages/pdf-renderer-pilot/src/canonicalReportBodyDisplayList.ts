import { createHash } from "node:crypto"
import {
  createVNextDocumentCompositionSpacingBridgePlanV1,
  createVNextPdfMeasuredDrawContractV1,
  paginateVNextTableFlowV4,
  paginateVNextTableRowsV1,
  projectVNextTableRendererCommandsV1,
  type VNextPdfDrawCommand,
  type VNextPdfFillRectPaintCommandV1,
  type VNextPdfFontAssetV1,
  type VNextPdfGlyphFactV1,
  type VNextPdfGlyphRunPaintCommandV1,
  type VNextPdfImageAssetV1,
  type VNextPdfImagePaintCommandV1,
  type VNextPdfMeasuredDrawContractResultV1,
  type VNextPdfPaintBoundsV1,
  type VNextPdfPaintCommandV1,
  type VNextPdfRendererAdapterPlan,
  type VNextPdfStrokeLinePaintCommandV1,
  type VNextTableRenderCommandV1,
  type VNextTableRendererStyleProfileV1,
} from "@flowdoc/vnext-core"
import type { FlowDocCanonicalReportDataBundleV1 } from "./canonicalReportDataAdapter.js"
import type {
  FlowDocCanonicalReportLineBreakingBundleV1,
  FlowDocCanonicalReportLineMeasurementV1,
} from "./canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "./canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeMeasurementVariantV1,
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "./canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "./canonicalReportPaginationExecution.js"
import {
  executeFlowDocCanonicalReportPaginationExecutionSliceV1,
  initializeFlowDocCanonicalReportPaginationExecutionV1,
} from "./canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "./canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "./canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportStaticZoneHandoffBundleV1 } from "./canonicalReportStaticZoneHandoff.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"

export const FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_ID =
  "ocr-benchmark-report-body-display-list-v1" as const

const ACCEPTED = {
  data: "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d",
  projection: "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193",
  native: "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8",
  lineBreaking: "e1a9612766a6342ab3c36bbd0475f170bd4ef64d706161513bdf2f4a64b634a4",
  measured: "a80b13c98aee27c949d2a80bc4b73b8c619ef3f9fa1678792fdb64a28b20127a",
  paginationInputs: "73e19092ffa8b203e2aa0fb73463bcb882dcc9b83c652969aad7ed0ef39eb724",
  sectionReconciliation: "8c805719625c7c071568db8f90f9fad1b67c66f519ba880c16183314447c8364",
  pagination: "f22854d8cb99e451f9c8b29c977f822a9e44fc8afd345d50087a77a0c94a83d0",
  staticZones: "3a24b5807bd744392292789b4f11e1a330279cc4fa49b7516659b746365d4b91",
} as const

const RENDERER_PROFILE_ID = "pdf-pilot-08b-r2c-l-full-document-v1"

const TABLE_STYLE: VNextTableRendererStyleProfileV1 = {
  contractVersion: 1,
  kind: "table-render-style-profile",
  profileId: "canonical-report-table-render-policy-v1",
  outerBorder: { style: "solid", widthPt: 0.6, color: "D9E1E8" },
  internalRowBorder: { style: "solid", widthPt: 0.5, color: "D9E1E8" },
  internalColumnBorder: { style: "solid", widthPt: 0.5, color: "D9E1E8" },
  defaultCellBackground: null,
  rowBackgrounds: {
    header: "F3F6FA",
    body: null,
    footer: null,
    "empty-state": null,
    "repeated-header": "F3F6FA",
  },
  textColorFallback: "111827",
  missingMediaPolicy: "block",
}

export interface FlowDocCanonicalReportBodyDisplayListSourceV1 {
  data: FlowDocCanonicalReportDataBundleV1
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  nativeShaping: FlowDocCanonicalReportNativeShapingBundleV1
  lineBreaking: FlowDocCanonicalReportLineBreakingBundleV1
  measuredComposition: FlowDocCanonicalReportMeasuredCompositionBundleV1
  paginationInputs: FlowDocCanonicalReportPaginationInputsBundleV1
  sectionReconciliation: FlowDocCanonicalReportSectionReconciliationBundleV1
  paginationExecution: FlowDocCanonicalReportPaginationExecutionBundleV1
  staticZones: FlowDocCanonicalReportStaticZoneHandoffBundleV1
  fontManifest: FlowDocCanonicalReportNativeShapingFontManifestV1
}

export interface FlowDocCanonicalReportBodyDisplayEntryV1 {
  kind: "measured-text" | "fixed-image" | "prepared-table"
  itemIndex: number
  rootNodeId: string
  sourcePlacementCount: number
  sourcePlacementFingerprints: string[]
  sourceEvidenceFingerprints: string[]
  drawCommandIds: string[]
  paintCommandIds: string[]
  structuralReceiptCount: number
  noPaintReceiptCount: number
  entryFingerprint: string
}

export interface FlowDocCanonicalReportTableReplayV1 {
  itemIndex: number
  tableId: string
  projectionId: string
  firstDocumentPageIndex: number
  documentPageIndexes: number[]
  sourcePlacementFingerprints: string[]
  sourceFamilyEvidenceFingerprints: string[]
  v4PaginationFingerprint: string
  v1PaginationFingerprint: string
  rendererProjectionFingerprint: string
  pageCount: number
  rendererCommandCount: number
  structuralCommandCount: number
  cellBackgroundCommandCount: number
  textLineCommandCount: number
  emptyTextLineReceiptCount: number
  borderCommandCount: number
  replayFingerprint: string
}

export interface FlowDocCanonicalReportBodyDisplayListBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_VERSION
  kind: "canonical-report-body-display-list-bundle"
  phaseId: "PDF-PILOT-08B-R2C-L"
  displayListId: typeof FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_ID
  sourceFingerprints: {
    data: string
    projection: string
    nativeShaping: string
    lineBreaking: string
    measuredComposition: string
    paginationInputs: string
    sectionReconciliation: string
    paginationExecution: string
    pagePlan: string
    staticZones: string
    fontManifest: string
  }
  tableRenderPolicy: {
    styleProfile: VNextTableRendererStyleProfileV1
    styleSource: "canonical-report-renderer-policy"
    geometrySource: "core-table-pagination-and-renderer-projection"
    zebraStriping: "not-authored-not-applied"
  }
  entries: FlowDocCanonicalReportBodyDisplayEntryV1[]
  tableReplays: FlowDocCanonicalReportTableReplayV1[]
  bodyDisplayList: {
    drawCommandIds: string[]
    paintCommandIds: string[]
    structuralReceipts: Array<{
      tableId: string
      sourceCommandId: string
      kind: string
      reason: "renderer-structure-no-direct-paint" | "empty-measured-text-no-glyph-paint" | "spacer-no-direct-paint"
    }>
    fingerprint: string
  }
  rendererHandoff: {
    scope: "full-document-body-plus-static-zones"
    adapterPlan: VNextPdfRendererAdapterPlan
    measuredDrawContract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>
  }
  downstreamBlockers: Array<{
    code: "pdf-rendering-not-run" | "visual-fidelity-validation-pending" | "twelve-page-layout-calibration-open"
    blocks: "pdf-bytes" | "report-acceptance" | "twelve-page-fidelity-target"
    message: string
  }>
  ownership: {
    bodyDisplayListOwns: [
      "measured-body-text-paint-commands",
      "fixed-image-paint-commands",
      "table-pagination-replay",
      "table-renderer-projection",
      "table-background-text-border-paint-commands",
      "full-document-measured-draw-contract",
    ]
    bodyDisplayListMustNotOwn: [
      "pdf-bytes",
      "visual-fidelity-acceptance",
      "twelve-page-layout-calibration",
      "authored-document-mutation",
    ]
  }
  execution: {
    pageAssignment: "consumed-final"
    bodyTextProjection: "executed"
    mediaProjection: "executed"
    tablePaginationReplay: "executed"
    tableRendererProjection: "executed"
    bodyDisplayList: "executed"
    staticZoneMerge: "executed"
    fullDocumentMeasuredDrawContract: "consumable"
    pdfRendering: "not-run"
  }
  summary: {
    pageCount: number
    bodyEntryCount: number
    textEntryCount: number
    mediaEntryCount: number
    tableEntryCount: number
    sourceBodyPlacementCount: number
    bodyDrawCommandCount: number
    bodyPaintCommandCount: number
    bodyGlyphRunCount: number
    bodyImageCount: number
    bodyFillRectCount: number
    bodyStrokeLineCount: number
    structuralReceiptCount: number
    emptyTextReceiptCount: number
    fullDrawCommandCount: number
    fullPaintCommandCount: number
    fullGlyphRunCount: number
    fullImageCount: number
    fullFillRectCount: number
    fullStrokeLineCount: number
    fontAssetCount: number
    imageAssetCount: number
    missingGlyphCount: number
    tableReplayCount: number
    tableReplayPageCount: number
    fullRendererHandoffConsumable: boolean
    pdfRendered: false
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportBodyDisplayListIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportBodyDisplayListValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportBodyDisplayListBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportBodyDisplayListIssueV1[]; summary: null }

type Page = FlowDocCanonicalReportPaginationExecutionBundleV1["corePagePlan"]["pages"][number]
type Placement = Page["placements"][number]

interface PendingPaint {
  draw: VNextPdfDrawCommand
  paint: VNextPdfPaintCommandV1
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function compact(value: unknown): string {
  return `sha256:${sha256(typeof value === "string" ? value : JSON.stringify(value))}`
}

function token(value: unknown): string {
  return sha256(JSON.stringify(value)).slice(0, 24)
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const output = clone(value)
  delete output[key]
  return output
}

function validBundleFingerprint(value: { bundleFingerprint: string }): boolean {
  return value.bundleFingerprint === sha256(JSON.stringify(withoutFingerprint(value, "bundleFingerprint")))
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportBodyDisplayListIssueV1 {
  return { code, path, message, severity: "error" }
}

function sourceErrors(input: FlowDocCanonicalReportBodyDisplayListSourceV1): string[] {
  const pairs = [
    ["data", input.data.bundleFingerprint, ACCEPTED.data],
    ["projection", input.projection.bundleFingerprint, ACCEPTED.projection],
    ["native shaping", input.nativeShaping.bundleFingerprint, ACCEPTED.native],
    ["line breaking", input.lineBreaking.bundleFingerprint, ACCEPTED.lineBreaking],
    ["measured composition", input.measuredComposition.bundleFingerprint, ACCEPTED.measured],
    ["pagination inputs", input.paginationInputs.bundleFingerprint, ACCEPTED.paginationInputs],
    ["section reconciliation", input.sectionReconciliation.bundleFingerprint, ACCEPTED.sectionReconciliation],
    ["pagination execution", input.paginationExecution.bundleFingerprint, ACCEPTED.pagination],
    ["static zones", input.staticZones.bundleFingerprint, ACCEPTED.staticZones],
  ] as const
  const errors = pairs.filter(([, actual, expected]) => actual !== expected).map(([name]) => `${name} fingerprint drifted`)
  const bundles = [input.data, input.projection, input.nativeShaping, input.lineBreaking, input.measuredComposition,
    input.paginationInputs, input.sectionReconciliation, input.paginationExecution, input.staticZones]
  if (bundles.some((bundle) => !validBundleFingerprint(bundle))) errors.push("accepted source content fingerprint is invalid")
  if (input.staticZones.sourcePagePlanFingerprint !== input.paginationExecution.corePagePlan.fingerprint) {
    errors.push("static-zone page-plan source drifted")
  }
  if (input.staticZones.summary.pageCount !== input.paginationExecution.corePagePlan.pages.length) {
    errors.push("static-zone page coverage drifted")
  }
  if (sha256(JSON.stringify(input.fontManifest)) !== input.staticZones.sourceFontManifestFingerprint) {
    errors.push("font manifest content fingerprint is invalid")
  }
  return errors
}

function placements(input: FlowDocCanonicalReportBodyDisplayListSourceV1): Array<Placement & { page: Page }> {
  return input.paginationExecution.corePagePlan.pages.flatMap((page) => (
    page.placements.map((placement) => ({ ...clone(placement), page }))
  ))
}

function colorByStyle(input: FlowDocCanonicalReportBodyDisplayListSourceV1): Map<string, string> {
  const colors = new Map<string, string>()
  input.projection.scopedResolution.resolvedDocument.bindings.styles.forEach((binding) => {
    const color = binding.runStyle.textColor
    requireFact(typeof color === "string", `resolved text color is missing: ${binding.styleKey}`)
    const previous = colors.get(binding.styleKey)
    requireFact(previous == null || previous === color, `resolved text color drifted within style: ${binding.styleKey}`)
    colors.set(binding.styleKey, color)
  })
  return colors
}

function variantFacts(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  measurementVariantId: string,
): { variant: FlowDocCanonicalReportNativeMeasurementVariantV1; measurement: FlowDocCanonicalReportLineMeasurementV1 } {
  const variant = input.nativeShaping.measurementVariants.find((candidate) => candidate.measurementVariantId === measurementVariantId)
  const measurement = input.lineBreaking.measurements.find((candidate) => candidate.measurementVariantId === measurementVariantId)
  requireFact(variant != null && measurement != null, `native measurement evidence is missing: ${measurementVariantId}`)
  requireFact(variant.renderedText === measurement.renderedText && exact(variant.shapeRuns, measurement.shapeRuns), `native line evidence drifted: ${measurementVariantId}`)
  return { variant, measurement }
}

function baselineOffset(fontSizePt: number, lineHeightPt: number): number {
  return roundPt(lineHeightPt - (lineHeightPt - fontSizePt) / 2)
}

function glyphSegments(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  facts: { variant: FlowDocCanonicalReportNativeMeasurementVariantV1; measurement: FlowDocCanonicalReportLineMeasurementV1 },
  startOffset: number,
  endOffset: number,
  bounds: VNextPdfPaintBoundsV1,
  color: string,
  identity: object,
  page: Page,
  nodeId: string,
  table: VNextPdfDrawCommand["table"],
): PendingPaint[] {
  const lineText = facts.variant.renderedText.slice(startOffset, endOffset)
  requireFact(lineText.length > 0, `empty text must not enter glyph projection: ${nodeId}`)
  let cursorX = bounds.xPt
  const output: PendingPaint[] = []
  facts.variant.shapeRuns.forEach((run, runIndex) => {
    const segmentStart = Math.max(startOffset, run.renderStartOffset)
    const segmentEnd = Math.min(endOffset, run.renderEndOffset)
    if (segmentStart >= segmentEnd) return
    requireFact(run.shapeRequestId != null, `non-empty measured run has no shape request: ${nodeId}`)
    const execution = input.nativeShaping.shapeExecutions.find((candidate) => candidate.shapeRequest.shapeRequestId === run.shapeRequestId)
    requireFact(execution != null && execution.summary.missingGlyphCount === 0, `shape execution is missing or incomplete: ${run.shapeRequestId}`)
    const text = facts.variant.renderedText.slice(segmentStart, segmentEnd)
    const selected = execution.evidence.glyphs.filter((glyph) => {
      const glyphStart = run.renderStartOffset + glyph.clusterStartOffset
      const glyphEnd = run.renderStartOffset + glyph.clusterEndOffset
      return glyphStart >= segmentStart && glyphEnd <= segmentEnd
    })
    requireFact(selected.length > 0, `measured run segment has no glyphs: ${nodeId}:${segmentStart}-${segmentEnd}`)
    const glyphs: VNextPdfGlyphFactV1[] = selected.map((glyph, glyphIndex) => ({
      glyphIndex,
      glyphId: glyph.glyphId,
      advancePt: roundPt(glyph.advancePt),
      offsetXPt: roundPt(glyph.offsetXPt),
      offsetYPt: roundPt(glyph.offsetYPt),
      clusterStartOffset: run.renderStartOffset + glyph.clusterStartOffset - segmentStart,
      clusterEndOffset: run.renderStartOffset + glyph.clusterEndOffset - segmentStart,
    }))
    const widthPt = roundPt(glyphs.reduce((sum, glyph) => sum + glyph.advancePt, 0))
    requireFact(widthPt > 0, `glyph segment has no horizontal extent: ${nodeId}:${segmentStart}-${segmentEnd}`)
    const commandBounds = { xPt: roundPt(cursorX), yPt: bounds.yPt, widthPt, heightPt: bounds.heightPt }
    const commandToken = token({ identity, runIndex, segmentStart, segmentEnd, execution: run.shapeRequestId })
    const draw: VNextPdfDrawCommand = {
      id: `pdf:canonical-body:text:${commandToken}`,
      sourceCommandId: `canonical-body:text:${commandToken}`,
      fragmentId: `canonical-body:text-fragment:${commandToken}`,
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      operation: "draw-text",
      nodeId,
      nodeType: "text-block",
      bounds: commandBounds,
      text,
      table,
    }
    const paint: VNextPdfGlyphRunPaintCommandV1 = {
      id: `paint:canonical-body:text:${commandToken}`,
      sourceCommandId: draw.id,
      pageIndex: page.pageIndex,
      paintOrder: 0,
      bounds: commandBounds,
      kind: "glyph-run",
      measurementRequestId: compact({ measurementVariantId: facts.variant.measurementVariantId, segmentStart, segmentEnd }),
      measurementProfileId: facts.variant.measurementProfileId,
      text,
      fontId: execution.shapeRequest.fontId,
      fontSizePt: execution.shapeRequest.fontSizePt,
      lineHeightPt: facts.measurement.lineHeightPt,
      baselineOffsetPt: baselineOffset(execution.shapeRequest.fontSizePt, facts.measurement.lineHeightPt),
      color,
      opacity: 1,
      glyphs,
    }
    output.push({ draw, paint })
    cursorX = roundPt(cursorX + widthPt)
  })
  requireFact(output.length > 0, `measured line produced no glyph commands: ${nodeId}`)
  requireFact(Math.abs(roundPt(cursorX - bounds.xPt) - bounds.widthPt) <= 1e-6, `measured line width drifted: ${nodeId}`)
  requireFact(output.map((entry) => (entry.paint as VNextPdfGlyphRunPaintCommandV1).text).join("") === lineText, `measured line text coverage drifted: ${nodeId}`)
  return output
}

function lineRange(fragmentId: string): { start: number; end: number } {
  const match = /:lines-(\d+)-(\d+)$/.exec(fragmentId)
  requireFact(match != null, `text placement line range is invalid: ${fragmentId}`)
  return { start: Number(match[1]), end: Number(match[2]) }
}

function textEntry(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  placement: Placement & { page: Page },
  colors: Map<string, string>,
): { entry: FlowDocCanonicalReportBodyDisplayEntryV1; paints: PendingPaint[] } {
  const block = input.measuredComposition.documentBlocks.find((candidate) => candidate.textBlockId === placement.rootNodeId && candidate.zoneRole === "body")
  requireFact(block != null, `measured body block is missing: ${placement.rootNodeId}`)
  const facts = variantFacts(input, block.measurementVariantId)
  const range = lineRange(placement.fragmentId)
  const lines = facts.measurement.lineBoxes.slice(range.start, range.end + 1)
  requireFact(lines.length === range.end - range.start + 1, `measured line range is incomplete: ${placement.fragmentId}`)
  requireFact(roundPt(lines.reduce((sum, line) => sum + line.heightPt, 0)) === roundPt(placement.blockExtentPt), `text placement height drifted: ${placement.rootNodeId}`)
  const color = colors.get(facts.measurement.styleKey)
  requireFact(color != null, `resolved style color is missing: ${facts.measurement.styleKey}`)
  const paints = lines.flatMap((line) => glyphSegments(input, facts, line.startOffset, line.endOffset, {
    xPt: placement.page.pageGeometry.bodyOriginXPt,
    yPt: roundPt(placement.page.pageGeometry.bodyOriginYPt + placement.blockOffsetPt + line.yOffsetPt - lines[0].yOffsetPt),
    widthPt: line.widthPt,
    heightPt: line.heightPt,
  }, color, { placement: placement.fragmentId, line: line.lineIndex }, placement.page, placement.rootNodeId, null))
  const unsigned: Omit<FlowDocCanonicalReportBodyDisplayEntryV1, "entryFingerprint"> = {
    kind: "measured-text",
    itemIndex: placement.itemIndex,
    rootNodeId: placement.rootNodeId,
    sourcePlacementCount: 1,
    sourcePlacementFingerprints: [compact(placement)],
    sourceEvidenceFingerprints: [placement.familyEvidenceFingerprint, block.consumerId, block.measurementVariantId],
    drawCommandIds: paints.map((entry) => entry.draw.id),
    paintCommandIds: paints.map((entry) => entry.paint.id),
    structuralReceiptCount: 0,
    noPaintReceiptCount: 0,
  }
  return { entry: { ...unsigned, entryFingerprint: compact(unsigned) }, paints }
}

function imageNode(input: FlowDocCanonicalReportBodyDisplayListSourceV1, imageId: string) {
  for (const section of input.projection.scopedResolution.resolvedDocument.document.document.sections) {
    const node = section.nodes[imageId]
    if (node != null) return node
  }
  throw new Error(`resolved image node is missing: ${imageId}`)
}

function imageAssets(input: FlowDocCanonicalReportBodyDisplayListSourceV1): VNextPdfImageAssetV1[] {
  return input.measuredComposition.fixedImageBlocks.map((block) => {
    const media = input.data.mediaSnapshot.registry.images[block.assetId]
    const node = imageNode(input, block.imageId)
    requireFact(media != null && node.type === "image", `resolved image media is missing: ${block.assetId}`)
    requireFact(node.accessibility.kind === "described", `canonical image requires described accessibility: ${block.imageId}`)
    return {
      assetId: media.id,
      mediaType: media.mediaType,
      sha256: media.digest.value,
      pixelWidth: media.intrinsic.widthPx,
      pixelHeight: media.intrinsic.heightPx,
      bytesOwner: "backend",
      accessibility: { decorative: false, altText: node.accessibility.altText },
    }
  })
}

function mediaEntry(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  placement: Placement & { page: Page },
): { entry: FlowDocCanonicalReportBodyDisplayEntryV1; paints: PendingPaint[] } {
  const block = input.measuredComposition.fixedImageBlocks.find((candidate) => candidate.imageId === placement.rootNodeId)
  requireFact(block != null && block.naturalHeightPt === placement.blockExtentPt, `fixed image placement drifted: ${placement.rootNodeId}`)
  requireFact(block.fit !== "stretch", `canonical renderer does not accept stretch image fit: ${placement.rootNodeId}`)
  const xPt = block.align === "center"
    ? placement.page.pageGeometry.bodyOriginXPt + (placement.page.pageGeometry.bodyWidthPt - block.widthPt) / 2
    : block.align === "right"
      ? placement.page.pageGeometry.bodyOriginXPt + placement.page.pageGeometry.bodyWidthPt - block.widthPt
      : placement.page.pageGeometry.bodyOriginXPt
  const bounds = {
    xPt: roundPt(xPt),
    yPt: roundPt(placement.page.pageGeometry.bodyOriginYPt + placement.blockOffsetPt),
    widthPt: block.widthPt,
    heightPt: block.heightPt,
  }
  const commandToken = token({ placement: placement.fragmentId, assetId: block.assetId })
  const draw: VNextPdfDrawCommand = {
    id: `pdf:canonical-body:image:${commandToken}`,
    sourceCommandId: `canonical-body:image:${commandToken}`,
    fragmentId: placement.fragmentId,
    pageIndex: placement.page.pageIndex,
    pageNumber: placement.page.pageNumber,
    operation: "draw-fragment-box",
    nodeId: block.imageId,
    nodeType: "image",
    bounds,
    text: null,
    table: null,
  }
  const paint: VNextPdfImagePaintCommandV1 = {
    id: `paint:canonical-body:image:${commandToken}`,
    sourceCommandId: draw.id,
    pageIndex: placement.page.pageIndex,
    paintOrder: 0,
    bounds,
    kind: "image",
    assetId: block.assetId,
    fit: block.fit,
    crop: null,
    opacity: 1,
  }
  const unsigned: Omit<FlowDocCanonicalReportBodyDisplayEntryV1, "entryFingerprint"> = {
    kind: "fixed-image",
    itemIndex: placement.itemIndex,
    rootNodeId: placement.rootNodeId,
    sourcePlacementCount: 1,
    sourcePlacementFingerprints: [compact(placement)],
    sourceEvidenceFingerprints: [placement.familyEvidenceFingerprint, block.assetId],
    drawCommandIds: [draw.id],
    paintCommandIds: [paint.id],
    structuralReceiptCount: 0,
    noPaintReceiptCount: 0,
  }
  return { entry: { ...unsigned, entryFingerprint: compact(unsigned) }, paints: [{ draw, paint }] }
}

function tableTextFacts(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  command: Extract<VNextTableRenderCommandV1, { kind: "text-line" }>,
) {
  const consumer = input.nativeShaping.consumers.find((candidate) => (
    candidate.source.lane !== "projected-document-text"
      && candidate.source.tableId === command.tableId
      && candidate.source.textBlockId === command.nodeId
      && candidate.source.sourceCellId === command.sourceCellId
  ))
  requireFact(consumer != null, `table text consumer is missing: ${command.tableId}:${command.nodeId}`)
  const facts = variantFacts(input, consumer.measurementVariantId)
  requireFact(command.text === facts.variant.renderedText.slice(command.sourceStart.resolvedOffset, command.sourceEnd.resolvedOffset), `table renderer text drifted: ${command.id}`)
  const line = facts.measurement.lineBoxes.find((candidate) => (
    candidate.startOffset === command.sourceStart.resolvedOffset
      && candidate.endOffset === command.sourceEnd.resolvedOffset
  ))
  requireFact(line != null && line.widthPt === command.bounds.widthPt && line.heightPt === command.bounds.heightPt, `table renderer line geometry drifted: ${command.id}`)
  return { facts, line }
}

function tableMetadata(command: VNextTableRenderCommandV1): VNextPdfDrawCommand["table"] {
  return {
    tableId: command.tableId,
    ...(command.kind === "row-fragment" || command.kind === "cell-fragment" || command.kind === "text-line"
      || command.kind === "image" || command.kind === "divider" || command.kind === "spacer"
      ? { rowId: command.rowFragmentId }
      : {}),
    ...(command.kind === "cell-fragment" || command.kind === "text-line" || command.kind === "image"
      || command.kind === "divider" || command.kind === "spacer"
      ? { cellId: command.sourceCellId }
      : {}),
  }
}

function tableBoxPaint(
  command: Extract<VNextTableRenderCommandV1, { kind: "cell-background" | "divider" }>,
  page: Page,
  identity: object,
): PendingPaint {
  const commandToken = token(identity)
  const draw: VNextPdfDrawCommand = {
    id: `pdf:canonical-body:table-box:${commandToken}`,
    sourceCommandId: command.id,
    fragmentId: command.id,
    pageIndex: page.pageIndex,
    pageNumber: page.pageNumber,
    operation: "draw-fragment-box",
    nodeId: command.tableId,
    nodeType: "table",
    bounds: clone(command.bounds),
    text: null,
    table: tableMetadata(command),
  }
  const paint: VNextPdfFillRectPaintCommandV1 = {
    id: `paint:canonical-body:table-box:${commandToken}`,
    sourceCommandId: draw.id,
    pageIndex: page.pageIndex,
    paintOrder: 0,
    bounds: clone(command.bounds),
    kind: "fill-rect",
    color: command.color,
    opacity: 1,
  }
  return { draw, paint }
}

function tableBorderPaint(
  command: Extract<VNextTableRenderCommandV1, { kind: "border" }>,
  page: Page,
  identity: object,
): PendingPaint | null {
  if (command.style.style === "none") return null
  const commandToken = token(identity)
  const draw: VNextPdfDrawCommand = {
    id: `pdf:canonical-body:table-border:${commandToken}`,
    sourceCommandId: command.id,
    fragmentId: command.id,
    pageIndex: page.pageIndex,
    pageNumber: page.pageNumber,
    operation: "draw-fragment-box",
    nodeId: command.tableId,
    nodeType: "table",
    bounds: clone(command.bounds),
    text: null,
    table: tableMetadata(command),
  }
  const paint: VNextPdfStrokeLinePaintCommandV1 = {
    id: `paint:canonical-body:table-border:${commandToken}`,
    sourceCommandId: draw.id,
    pageIndex: page.pageIndex,
    paintOrder: 0,
    bounds: clone(command.bounds),
    kind: "stroke-line",
    color: command.style.color,
    opacity: 1,
    widthPt: command.style.widthPt,
    style: command.style.style,
  }
  return { draw, paint }
}

function tableEntry(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
  tablePlacements: Array<Placement & { page: Page }>,
  colors: Map<string, string>,
  capturedWindows: Array<Exclude<ReturnType<typeof paginateVNextTableFlowV4>, { status: "blocked" }>>,
): {
  entry: FlowDocCanonicalReportBodyDisplayEntryV1
  replay: FlowDocCanonicalReportTableReplayV1
  paints: PendingPaint[]
  receipts: FlowDocCanonicalReportBodyDisplayListBundleV1["bodyDisplayList"]["structuralReceipts"]
} {
  const first = tablePlacements[0]
  const familyInput = input.paginationInputs.familyPaginationInputs[first.itemIndex]
  requireFact(familyInput?.family === "table-flow" && familyInput.rootNodeId === first.rootNodeId, `table family input is missing: ${first.rootNodeId}`)
  const table = input.measuredComposition.preparedTables[familyInput.source.preparedTableIndex]
  requireFact(table?.tableId === first.rootNodeId, `prepared table is missing: ${first.rootNodeId}`)
  const v4Windows = capturedWindows
  const acceptedV4Windows = v4Windows.filter((window): window is Exclude<typeof window, { status: "fresh-page-required" }> => (
    window.status === "partial" || window.status === "complete"
  ))
  const v4Pages = acceptedV4Windows.flatMap((window) => window.pages)
  requireFact(v4Pages.length === tablePlacements.length, `table replay page count drifted: ${first.rootNodeId}`)
  v4Pages.forEach((checkpoint, pageIndex) => {
    const placement = tablePlacements[pageIndex]
    requireFact(placement.fragmentId === JSON.stringify([table.tableId, "page", checkpoint.page.pageIndex]), `table fragment identity drifted: ${table.tableId}:${pageIndex}`)
    requireFact(
      placement.familyEvidenceFingerprint === checkpoint.fingerprint,
      `table checkpoint evidence drifted: ${table.tableId}:${pageIndex}:expected=${placement.familyEvidenceFingerprint}:actual=${checkpoint.fingerprint}`,
    )
    requireFact(placement.blockExtentPt === checkpoint.page.usedHeightPt, `table placement height drifted: ${table.tableId}:${pageIndex}`)
  })
  const v1 = paginateVNextTableRowsV1({
    prepared: table.preparedRows,
    pageBodyHeightPt: familyInput.pagination.pageBodyHeightPt,
    firstPageAvailableHeightPt: v4Pages[0].page.availableHeightPt,
    startPageIndex: 0,
    maximumPageCount: familyInput.pagination.maximumPageCount,
    maximumRowPlanCount: familyInput.pagination.maximumRowPlanCount,
    headerPolicy: familyInput.pagination.headerPolicy,
  })
  requireFact(v1.status === "paginated" && exact(v1.pages, v4Pages.map((checkpoint) => checkpoint.page)), `table v1/v4 replay drifted: ${table.tableId}`)
  const projected = projectVNextTableRendererCommandsV1({
    contractVersion: 1,
    kind: "table-renderer-projection-request",
    sectionId: table.sectionId,
    zoneId: first.zoneId,
    pagination: v1,
    expectedPaginationFingerprint: v1.fingerprint,
    pageOrigins: v1.pages.map((page, index) => ({
      pageIndex: page.pageIndex,
      xPt: tablePlacements[index].page.pageGeometry.bodyOriginXPt,
      yPt: roundPt(tablePlacements[index].page.pageGeometry.bodyOriginYPt + tablePlacements[index].blockOffsetPt),
    })),
    styleProfile: TABLE_STYLE,
  })
  requireFact(projected.status === "consumable", `table renderer projection blocked: ${table.tableId}`)
  const placementByLocalPage = new Map(v1.pages.map((page, index) => [page.pageIndex, tablePlacements[index]]))
  const paints: PendingPaint[] = []
  const receipts: FlowDocCanonicalReportBodyDisplayListBundleV1["bodyDisplayList"]["structuralReceipts"] = []
  let emptyTextLineReceiptCount = 0
  let structuralCommandCount = 0
  projected.commands.forEach((command) => {
    const placement = placementByLocalPage.get(command.pageIndex)
    requireFact(placement != null, `table renderer page mapping is missing: ${table.tableId}:${command.pageIndex}`)
    const actualPage = placement.page
    if (command.kind === "cell-background" || command.kind === "divider") {
      paints.push(tableBoxPaint(command, actualPage, { tableId: table.tableId, command: command.id }))
    } else if (command.kind === "border") {
      const border = tableBorderPaint(command, actualPage, { tableId: table.tableId, command: command.id })
      if (border != null) paints.push(border)
      else receipts.push({ tableId: table.tableId, sourceCommandId: command.id, kind: command.kind, reason: "renderer-structure-no-direct-paint" })
    } else if (command.kind === "text-line") {
      if (command.text.length === 0) {
        emptyTextLineReceiptCount += 1
        receipts.push({ tableId: table.tableId, sourceCommandId: command.id, kind: command.kind, reason: "empty-measured-text-no-glyph-paint" })
      } else {
        const { facts, line } = tableTextFacts(input, command)
        const color = colors.get(facts.measurement.styleKey) ?? TABLE_STYLE.textColorFallback
        paints.push(...glyphSegments(input, facts, line.startOffset, line.endOffset, clone(command.bounds), color,
          { tableId: table.tableId, command: command.id }, actualPage, command.nodeId, tableMetadata(command)))
      }
    } else {
      structuralCommandCount += 1
      receipts.push({
        tableId: table.tableId,
        sourceCommandId: command.id,
        kind: command.kind,
        reason: command.kind === "spacer" ? "spacer-no-direct-paint" : "renderer-structure-no-direct-paint",
      })
    }
  })
  const replayFacts: Omit<FlowDocCanonicalReportTableReplayV1, "replayFingerprint"> = {
    itemIndex: first.itemIndex,
    tableId: table.tableId,
    projectionId: table.projectionId,
    firstDocumentPageIndex: first.page.pageIndex,
    documentPageIndexes: tablePlacements.map((placement) => placement.page.pageIndex),
    sourcePlacementFingerprints: tablePlacements.map((placement) => compact(placement)),
    sourceFamilyEvidenceFingerprints: tablePlacements.map((placement) => placement.familyEvidenceFingerprint),
    v4PaginationFingerprint: compact(v4Windows.map((window) => window.fingerprint)),
    v1PaginationFingerprint: compact(v1.fingerprint),
    rendererProjectionFingerprint: compact(projected.fingerprint),
    pageCount: v1.pages.length,
    rendererCommandCount: projected.commands.length,
    structuralCommandCount,
    cellBackgroundCommandCount: projected.commands.filter((command) => command.kind === "cell-background").length,
    textLineCommandCount: projected.commands.filter((command) => command.kind === "text-line").length,
    emptyTextLineReceiptCount,
    borderCommandCount: projected.commands.filter((command) => command.kind === "border").length,
  }
  const unsigned: Omit<FlowDocCanonicalReportBodyDisplayEntryV1, "entryFingerprint"> = {
    kind: "prepared-table",
    itemIndex: first.itemIndex,
    rootNodeId: first.rootNodeId,
    sourcePlacementCount: tablePlacements.length,
    sourcePlacementFingerprints: tablePlacements.map((placement) => compact(placement)),
    sourceEvidenceFingerprints: tablePlacements.map((placement) => placement.familyEvidenceFingerprint),
    drawCommandIds: paints.map((entry) => entry.draw.id),
    paintCommandIds: paints.map((entry) => entry.paint.id),
    structuralReceiptCount: structuralCommandCount,
    noPaintReceiptCount: receipts.length,
  }
  return {
    entry: { ...unsigned, entryFingerprint: compact(unsigned) },
    replay: { ...replayFacts, replayFingerprint: compact(replayFacts) },
    paints,
    receipts,
  }
}

type CapturedTableWindow = Exclude<ReturnType<typeof paginateVNextTableFlowV4>, { status: "blocked" }>

function captureTableWindows(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
): Map<number, CapturedTableWindow[]> {
  const executionSource = {
    paginationInputs: input.paginationInputs,
    measuredComposition: input.measuredComposition,
    sectionReconciliation: input.sectionReconciliation,
  }
  const windows = new Map<number, CapturedTableWindow[]>()
  let checkpoint = initializeFlowDocCanonicalReportPaginationExecutionV1(executionSource, input.paginationExecution.limits)
  while (!checkpoint.complete) {
    const demand = checkpoint.demand
    const active = checkpoint.activeFamilyCursor
    if (demand?.family === "table-flow") {
      requireFact(active?.family === "table-flow" && active.itemIndex === demand.itemIndex, `table replay active cursor drifted: ${demand.rootNodeId}`)
      const familyInput = input.paginationInputs.familyPaginationInputs[demand.itemIndex]
      requireFact(familyInput?.family === "table-flow", `table replay family input is missing: ${demand.rootNodeId}`)
      const table = input.measuredComposition.preparedTables[familyInput.source.preparedTableIndex]
      const spacing = input.sectionReconciliation.spacingBridgeBindings[demand.itemIndex]
      requireFact(table?.tableId === demand.rootNodeId && spacing?.rootNodeId === demand.rootNodeId, `table replay source binding drifted: ${demand.rootNodeId}`)
      const plan = createVNextDocumentCompositionSpacingBridgePlanV1({ demand, gapBeforePt: spacing.gapBeforePt })
      requireFact(plan.status === "ready", `table replay spacing plan blocked: ${demand.rootNodeId}`)
      const familyDemand = plan.plan.familyDemand
      const window = paginateVNextTableFlowV4({
        prepared: table.preparedRows,
        pageBodyHeightPt: familyDemand.capacity.pageBodyHeightPt,
        firstPageAvailableHeightPt: familyDemand.capacity.firstPageAvailableHeightPt,
        headerPolicy: familyInput.pagination.headerPolicy,
        maximumPageCount: familyDemand.capacity.maximumPageCount,
        maximumRowPlanCount: familyInput.pagination.maximumRowPlanCount,
        cursor: active.cursor,
      })
      requireFact(window.status !== "blocked", `captured table replay blocked: ${demand.rootNodeId}:${window.issues[0]?.code}`)
      const itemWindows = windows.get(demand.itemIndex) ?? []
      itemWindows.push(window)
      windows.set(demand.itemIndex, itemWindows)
    }
    const slice = executeFlowDocCanonicalReportPaginationExecutionSliceV1({
      source: executionSource,
      checkpoint,
      limits: input.paginationExecution.limits,
      maximumTransitionCount: 1,
    })
    requireFact(slice.traces.length === 1, `table replay document transition made no progress: ${checkpoint.transitionCount}`)
    const acceptedTrace = input.paginationExecution.transitionTraces[checkpoint.transitionCount]
    requireFact(exact(slice.traces[0], acceptedTrace), `table replay transition trace drifted: ${checkpoint.transitionCount + 1}`)
    checkpoint = slice.checkpointAfter
  }
  requireFact(exact(checkpoint, input.paginationExecution.terminalCheckpoint), "table replay terminal checkpoint drifted")
  return windows
}

function fontAssets(input: FlowDocCanonicalReportBodyDisplayListSourceV1): VNextPdfFontAssetV1[] {
  const ids = new Set(input.nativeShaping.shapeExecutions.map((execution) => execution.shapeRequest.fontId))
  const manifest = [...input.fontManifest.fontAssets, ...input.fontManifest.candidateFontAssets]
  return [...ids].sort().map((fontId) => {
    const asset = manifest.find((candidate) => candidate.fontId === fontId)
    requireFact(asset?.target?.kind === "package-font-asset", `renderer font asset is not registered: ${fontId}`)
    return {
      fontId: asset.fontId,
      family: asset.family,
      style: asset.style,
      weight: asset.weight,
      format: "ttf",
      sha256: asset.sha256,
      sourceKind: "package-font-asset",
      licenseId: "OFL-1.1",
      embedding: "subset",
      toUnicodeMap: true,
    }
  })
}

function adapterPlan(pageCount: number, drawCommands: VNextPdfDrawCommand[]): VNextPdfRendererAdapterPlan {
  const textCommandCount = drawCommands.filter((command) => command.operation === "draw-text").length
  return {
    source: "vnext-pdf-renderer-adapter",
    mode: "measured-render-command-adapter",
    status: "ready",
    rendererContract: { consumes: "measured-render-commands", mayRelayout: false, requiresAuthoredDocumentForLayout: false, output: "pdf" },
    artifact: { kind: "pdf", status: "not-rendered", contentType: "application/pdf", bytes: null, storageId: null },
    pageCount,
    drawCommands,
    blockingIssues: [],
    warningIssues: [],
    summary: {
      inputCommandCount: drawCommands.length,
      drawCommandCount: drawCommands.length,
      textCommandCount,
      boxCommandCount: drawCommands.length - textCommandCount,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    },
  }
}

function buildBundle(input: FlowDocCanonicalReportBodyDisplayListSourceV1): FlowDocCanonicalReportBodyDisplayListBundleV1 {
  const errors = sourceErrors(input)
  requireFact(errors.length === 0, errors.join("; "))
  const allPlacements = placements(input)
  const bodyPlacements = allPlacements.filter((placement) => placement.family === "text-flow" || placement.family === "media-flow" || placement.family === "table-flow")
  const colors = colorByStyle(input)
  const entries: FlowDocCanonicalReportBodyDisplayEntryV1[] = []
  const tableReplays: FlowDocCanonicalReportTableReplayV1[] = []
  const pending: PendingPaint[] = []
  const receipts: FlowDocCanonicalReportBodyDisplayListBundleV1["bodyDisplayList"]["structuralReceipts"] = []
  const tableWindows = captureTableWindows(input)
  const handledItems = new Set<number>()
  bodyPlacements.forEach((placement) => {
    if (handledItems.has(placement.itemIndex)) return
    handledItems.add(placement.itemIndex)
    if (placement.family === "text-flow") {
      const result = textEntry(input, placement, colors)
      entries.push(result.entry)
      pending.push(...result.paints)
    } else if (placement.family === "media-flow") {
      const result = mediaEntry(input, placement)
      entries.push(result.entry)
      pending.push(...result.paints)
    } else {
      const captured = tableWindows.get(placement.itemIndex)
      requireFact(captured != null, `captured table windows are missing: ${placement.rootNodeId}`)
      const result = tableEntry(input, bodyPlacements.filter((candidate) => candidate.itemIndex === placement.itemIndex), colors, captured)
      entries.push(result.entry)
      tableReplays.push(result.replay)
      pending.push(...result.paints)
      receipts.push(...result.receipts)
    }
  })
  requireFact(entries.length === input.paginationInputs.coreCompositionManifest.bodyItems.length, "body display entry coverage drifted")
  requireFact(entries.reduce((sum, entry) => sum + entry.sourcePlacementCount, 0) === bodyPlacements.length, "body placement coverage drifted")
  const bodyPaintCommands: VNextPdfPaintCommandV1[] = []
  const bodyDrawCommands: VNextPdfDrawCommand[] = []
  const byPage = new Map<number, PendingPaint[]>()
  pending.forEach((entry) => {
    const pageEntries = byPage.get(entry.paint.pageIndex) ?? []
    pageEntries.push(entry)
    byPage.set(entry.paint.pageIndex, pageEntries)
  })
  for (const page of input.paginationExecution.corePagePlan.pages) {
    const pageEntries = byPage.get(page.pageIndex) ?? []
    pageEntries.forEach((entry, index) => {
      entry.paint.paintOrder = index + 2
      bodyDrawCommands.push(entry.draw)
      bodyPaintCommands.push(entry.paint)
    })
  }
  const bodyCommandFacts = {
    drawCommands: bodyDrawCommands,
    paintCommands: bodyPaintCommands,
    structuralReceipts: receipts,
  }
  const bodyDisplayList = {
    drawCommandIds: bodyDrawCommands.map((command) => command.id),
    paintCommandIds: bodyPaintCommands.map((command) => command.id),
    structuralReceipts: receipts,
    fingerprint: compact(bodyCommandFacts),
  }
  const staticDraw = input.staticZones.pages.flatMap((page) => [page.header.drawCommand, page.footer.drawCommand])
  const staticPaint = input.staticZones.pages.flatMap((page) => [page.header.paintCommand, page.footer.paintCommand])
  const fullDraw = [...staticDraw, ...bodyDrawCommands]
  const fullPaint = [...staticPaint, ...bodyPaintCommands]
  const plan = adapterPlan(input.staticZones.pages.length, fullDraw)
  const fonts = fontAssets(input)
  const images = imageAssets(input)
  const measuredDrawContract = createVNextPdfMeasuredDrawContractV1({
    contractVersion: 1,
    kind: "pdf-measured-draw-contract-request",
    pilotId: FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_ID,
    rendererProfileId: RENDERER_PROFILE_ID,
    measurementProfileId: input.nativeShaping.measurementProfileId,
    plan,
    pageBoxes: input.staticZones.pages.map((page) => page.pageBox),
    fontAssets: fonts,
    imageAssets: images,
    paintCommands: fullPaint,
    bindProductionRenderer: false,
  })
  requireFact(measuredDrawContract.status === "consumable", `Core rejected full measured draw contract: ${measuredDrawContract.issues.map((candidate) => candidate.code).join(",")}`)
  const bodyGlyphs = bodyPaintCommands.filter((command) => command.kind === "glyph-run")
  const missingGlyphCount = input.staticZones.summary.missingGlyphCount
    + bodyGlyphs.reduce((sum, command) => sum + command.glyphs.filter((glyph) => glyph.glyphId === 0).length, 0)
  const summary: FlowDocCanonicalReportBodyDisplayListBundleV1["summary"] = {
    pageCount: input.staticZones.pages.length,
    bodyEntryCount: entries.length,
    textEntryCount: entries.filter((entry) => entry.kind === "measured-text").length,
    mediaEntryCount: entries.filter((entry) => entry.kind === "fixed-image").length,
    tableEntryCount: entries.filter((entry) => entry.kind === "prepared-table").length,
    sourceBodyPlacementCount: bodyPlacements.length,
    bodyDrawCommandCount: bodyDrawCommands.length,
    bodyPaintCommandCount: bodyPaintCommands.length,
    bodyGlyphRunCount: bodyGlyphs.length,
    bodyImageCount: bodyPaintCommands.filter((command) => command.kind === "image").length,
    bodyFillRectCount: bodyPaintCommands.filter((command) => command.kind === "fill-rect").length,
    bodyStrokeLineCount: bodyPaintCommands.filter((command) => command.kind === "stroke-line").length,
    structuralReceiptCount: receipts.length,
    emptyTextReceiptCount: receipts.filter((receipt) => receipt.reason === "empty-measured-text-no-glyph-paint").length,
    fullDrawCommandCount: measuredDrawContract.summary.sourceCommandCount,
    fullPaintCommandCount: measuredDrawContract.summary.paintCommandCount,
    fullGlyphRunCount: measuredDrawContract.summary.glyphRunCount,
    fullImageCount: measuredDrawContract.summary.imageCount,
    fullFillRectCount: measuredDrawContract.summary.fillRectCount,
    fullStrokeLineCount: measuredDrawContract.summary.strokeLineCount ?? 0,
    fontAssetCount: measuredDrawContract.summary.fontAssetCount,
    imageAssetCount: measuredDrawContract.summary.imageAssetCount,
    missingGlyphCount,
    tableReplayCount: tableReplays.length,
    tableReplayPageCount: tableReplays.reduce((sum, replay) => sum + replay.pageCount, 0),
    fullRendererHandoffConsumable: true,
    pdfRendered: false,
  }
  const unsigned: Omit<FlowDocCanonicalReportBodyDisplayListBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-body-display-list-bundle",
    phaseId: "PDF-PILOT-08B-R2C-L",
    displayListId: FLOWDOC_CANONICAL_REPORT_BODY_DISPLAY_LIST_ID,
    sourceFingerprints: {
      data: input.data.bundleFingerprint,
      projection: input.projection.bundleFingerprint,
      nativeShaping: input.nativeShaping.bundleFingerprint,
      lineBreaking: input.lineBreaking.bundleFingerprint,
      measuredComposition: input.measuredComposition.bundleFingerprint,
      paginationInputs: input.paginationInputs.bundleFingerprint,
      sectionReconciliation: input.sectionReconciliation.bundleFingerprint,
      paginationExecution: input.paginationExecution.bundleFingerprint,
      pagePlan: input.paginationExecution.corePagePlan.fingerprint,
      staticZones: input.staticZones.bundleFingerprint,
      fontManifest: input.staticZones.sourceFontManifestFingerprint,
    },
    tableRenderPolicy: {
      styleProfile: clone(TABLE_STYLE),
      styleSource: "canonical-report-renderer-policy",
      geometrySource: "core-table-pagination-and-renderer-projection",
      zebraStriping: "not-authored-not-applied",
    },
    entries,
    tableReplays,
    bodyDisplayList,
    rendererHandoff: {
      scope: "full-document-body-plus-static-zones",
      adapterPlan: plan,
      measuredDrawContract,
    },
    downstreamBlockers: [
      { code: "pdf-rendering-not-run", blocks: "pdf-bytes", message: "The full measured draw contract is consumable, but no renderer execution has produced PDF bytes." },
      { code: "visual-fidelity-validation-pending", blocks: "report-acceptance", message: "The full document requires rendered structural and visual verification before report acceptance." },
      { code: "twelve-page-layout-calibration-open", blocks: "twelve-page-fidelity-target", message: "The authoritative Core plan remains thirteen pages; renderer handoff must retain that result." },
    ],
    ownership: {
      bodyDisplayListOwns: [
        "measured-body-text-paint-commands",
        "fixed-image-paint-commands",
        "table-pagination-replay",
        "table-renderer-projection",
        "table-background-text-border-paint-commands",
        "full-document-measured-draw-contract",
      ],
      bodyDisplayListMustNotOwn: ["pdf-bytes", "visual-fidelity-acceptance", "twelve-page-layout-calibration", "authored-document-mutation"],
    },
    execution: {
      pageAssignment: "consumed-final",
      bodyTextProjection: "executed",
      mediaProjection: "executed",
      tablePaginationReplay: "executed",
      tableRendererProjection: "executed",
      bodyDisplayList: "executed",
      staticZoneMerge: "executed",
      fullDocumentMeasuredDrawContract: "consumable",
      pdfRendering: "not-run",
    },
    summary,
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportBodyDisplayListBundleV1(
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
): FlowDocCanonicalReportBodyDisplayListBundleV1 {
  return buildBundle(input)
}

export function validateFlowDocCanonicalReportBodyDisplayListBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportBodyDisplayListSourceV1,
): FlowDocCanonicalReportBodyDisplayListValidationV1 {
  const issues: FlowDocCanonicalReportBodyDisplayListIssueV1[] = []
  const errors = sourceErrors(input)
  if (errors.length > 0) issues.push(issue("invalid-source", "source", errors.join("; ")))
  let expected: FlowDocCanonicalReportBodyDisplayListBundleV1 | null = null
  if (issues.length === 0) {
    try {
      expected = buildBundle(input)
    } catch (error) {
      issues.push(issue("rebuild-failed", "bundle", error instanceof Error ? error.message : String(error)))
    }
  }
  if (expected != null && !exact(value, expected)) issues.push(issue("bundle-content", "bundle", "body display list does not match deterministic measured source reconstruction"))
  if (issues.length > 0 || expected == null) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: expected.summary }
}
