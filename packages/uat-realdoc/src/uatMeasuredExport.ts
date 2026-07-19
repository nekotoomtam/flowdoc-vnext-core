import { createHash } from "node:crypto"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextPdfMeasuredDrawContractV1,
  createVNextTableAuthoredTextMeasurementPreparationV1,
  createVNextTableCellGeometryV1,
  createVNextTablePreparedAuthoredCellsV1,
  createVNextTablePreparedMaterializedCellsV1,
  createVNextTablePreparedRowsV1,
  createVNextTableTextFragmentEvidenceV1,
  createVNextTableTextMeasurementPreparationV1,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
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
  type VNextTableCellGeometryResultV1,
  type VNextTablePaginationResultV1,
  type VNextTablePreparedRowsResultV1,
  type VNextTableRendererProjectionResultV1,
  type VNextTableRendererStyleProfileV1,
  type VNextTableTextMeasurementPreparationResultV1,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextEngineAdapterGlyphFact,
  type VNextTextEngineAdapterLineBoxFact,
} from "@flowdoc/vnext-core"
import type { FlowDocUatSectionResolutionBundleV1 } from "./uatSectionResolution.js"
import { createFlowDocUatStructureDefinitionV1 } from "./uatStructureDefinition.js"

export const FLOWDOC_UAT_MEASURED_EXPORT_VERSION = 1 as const
export const FLOWDOC_UAT_MEASUREMENT_PROFILE_ID = "flowdoc-uat-local-measured-v1" as const
export const FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID = "flowdoc-local-measured-document-v1" as const
export const FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT = 32 as const

const MM_TO_PT = 72 / 25.4
const PAGE_WIDTH_PT = roundPt(210 * MM_TO_PT)
const PAGE_HEIGHT_PT = roundPt(297 * MM_TO_PT)
const BODY_X_PT = roundPt(12 * MM_TO_PT)
const BODY_WIDTH_PT = roundPt(186 * MM_TO_PT)
const HEADER_Y_PT = roundPt(20 * MM_TO_PT)
const HEADER_RESERVED_PT = 42
const FOOTER_RESERVED_PT = 24
const BOTTOM_MARGIN_PT = roundPt(16 * MM_TO_PT)
const BODY_Y_PT = roundPt(HEADER_Y_PT + HEADER_RESERVED_PT)
const BODY_END_Y_PT = roundPt(PAGE_HEIGHT_PT - BOTTOM_MARGIN_PT - FOOTER_RESERVED_PT)
const BODY_HEIGHT_PT = roundPt(BODY_END_Y_PT - BODY_Y_PT)
const FOOTER_Y_PT = roundPt(BODY_END_Y_PT + 6)

type ReadyGeometry = Extract<VNextTableCellGeometryResultV1, { status: "ready" }>
type ReadyPreparation = Extract<VNextTableTextMeasurementPreparationResultV1, { status: "ready" }>
type ReadyPreparedRows = Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
type AcceptedMeasuredLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>
type ConsumableContract = Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>

export type FlowDocUatMeasurementLaneV1 =
  | "body-text"
  | "header-text"
  | "footer-text"
  | "table-authored-text"
  | "table-materialized-text"

export interface FlowDocUatMeasurementConsumerV1 {
  consumerId: string
  lane: FlowDocUatMeasurementLaneV1
  nodeId: string
  tableId: string | null
  pageNumber: number | null
  request: VNextTextBlockV4MeasurementRequest
  requestFingerprint: string
  style: {
    styleKey: string
    fontId: "ibm-plex-sans-thai-regular" | "ibm-plex-sans-thai-bold"
    fontSizePt: number
    lineHeightPt: number
    color: string
  }
}

export interface FlowDocUatMeasuredTablePlanV1 {
  tableId: "uat-requirements-table" | "uat-screenshots-table"
  geometry: ReadyGeometry
  authoredPreparation: ReadyPreparation
  materializedPreparation: ReadyPreparation
}

export interface FlowDocUatMeasuredExportPlanV1 {
  contractVersion: typeof FLOWDOC_UAT_MEASURED_EXPORT_VERSION
  kind: "uat-measured-export-plan"
  measurementProfileId: typeof FLOWDOC_UAT_MEASUREMENT_PROFILE_ID
  rendererProfileId: typeof FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID
  sourceResolutionFingerprint: string
  page: {
    widthPt: number
    heightPt: number
    bodyXPt: number
    bodyYPt: number
    bodyWidthPt: number
    bodyHeightPt: number
    bodyEndYPt: number
    maximumPageCount: typeof FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT
  }
  consumers: FlowDocUatMeasurementConsumerV1[]
  tables: {
    requirements: FlowDocUatMeasuredTablePlanV1
    screenshots: FlowDocUatMeasuredTablePlanV1
  }
  resolution: FlowDocUatSectionResolutionBundleV1
  planFingerprint: string
}

export interface FlowDocUatMeasuredTextEvidenceV1 {
  consumerId: string
  requestFingerprint: string
  fontId: FlowDocUatMeasurementConsumerV1["style"]["fontId"]
  fontSizePt: number
  lineHeightPt: number
  color: string
  glyphs: VNextTextEngineAdapterGlyphFact[]
  lineBoxes: VNextTextEngineAdapterLineBoxFact[]
  engine: {
    shaper: "rustybuzz"
    shaperRevision: string
    segmenter: "icu4x"
    segmenterRevision: string
    segmenterDataRevision: string
    deterministic: true
  }
}

export interface FlowDocUatMeasuredExportIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocUatMeasuredExportPlanResultV1 =
  | { status: "ready"; plan: FlowDocUatMeasuredExportPlanV1; issues: [] }
  | { status: "blocked"; plan: null; issues: FlowDocUatMeasuredExportIssueV1[] }

export interface FlowDocUatMeasuredExportBundleV1 {
  contractVersion: typeof FLOWDOC_UAT_MEASURED_EXPORT_VERSION
  kind: "uat-measured-export-bundle"
  phaseId: "PDF-EXPORT-REALDOC-D"
  sourceResolutionFingerprint: string
  sourcePlanFingerprint: string
  measuredDrawContract: ConsumableContract
  tableEvidence: {
    requirements: FlowDocUatTablePaginationEvidenceV1
    screenshots: FlowDocUatTablePaginationEvidenceV1
  }
  resourceEnvelope: {
    pageCount: number
    paintCommandCount: number
    glyphCount: number
    fontAssetCount: number
    imageAssetCount: number
    sourcePixelCount: number
    accepted: true
  }
  summary: {
    measurementConsumerCount: number
    measuredLineCount: number
    pageCount: number
    glyphRunCount: number
    imagePaintCount: number
    repeatedRequirementHeaderCount: number
    splitRequirementRowCount: number
    screenshotRowCount: number
  }
  execution: {
    nativeThaiShaping: "accepted-input"
    nativeThaiSegmentation: "accepted-input"
    tablePreparation: "executed-core"
    tablePagination: "executed-core"
    rendererProjection: "executed-core"
    pdfRendering: "not-run"
    productionBinding: false
  }
  bundleFingerprint: string
}

export type FlowDocUatMeasuredExportResultV1 =
  | { status: "measured"; bundle: FlowDocUatMeasuredExportBundleV1; issues: [] }
  | { status: "blocked"; bundle: null; issues: FlowDocUatMeasuredExportIssueV1[] }

export interface FlowDocUatTablePaginationEvidenceV1 {
  tableId: string
  paginationFingerprint: string
  rendererProjectionFingerprint: string
  pageCount: number
  rowFragmentCount: number
  splitRowCount: number
  repeatedHeaderFragmentCount: number
  imagePaintCount: number
}

interface AcceptedConsumerEvidence {
  consumer: FlowDocUatMeasurementConsumerV1
  evidence: FlowDocUatMeasuredTextEvidenceV1
  measured: AcceptedMeasuredLines
}

interface PreparedTableRuntime {
  plan: FlowDocUatMeasuredTablePlanV1
  prepared: ReadyPreparedRows
}

interface PendingPaint {
  draw: VNextPdfDrawCommand
  paint: VNextPdfPaintCommandV1
}

interface PageState {
  pageIndex: number
  bodyCursorYPt: number
  paints: PendingPaint[]
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: { value: number; unit: "pt" | "mm" }): number {
  return roundPt(value.unit === "pt" ? value.value : value.value * MM_TO_PT)
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function sha256(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`
}

function token(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex").slice(0, 24)
}

function issue(code: string, path: string, message: string): FlowDocUatMeasuredExportIssueV1 {
  return { code, path, message, severity: "error" }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const output = { ...value }
  delete output[key]
  return output
}

function lineHeightForStyle(styleKey: string, fontSizePt: number): number {
  const fixed: Record<string, number> = {
    "uat-header": 14,
    "uat-footer": 12,
    "uat-module-heading": 25,
    "uat-section-heading": 21,
    "uat-body": 18,
    "uat-table-header": 16,
    "uat-table-body": 16,
    "uat-caption": 16,
  }
  return fixed[styleKey] ?? roundPt(fontSizePt * 1.4)
}

function consumerId(input: {
  lane: FlowDocUatMeasurementLaneV1
  nodeId: string
  tableId: string | null
  pageNumber: number | null
  request: VNextTextBlockV4MeasurementRequest
}): string {
  return `uat-measure:${token(input)}`
}

function createConsumer(input: {
  lane: FlowDocUatMeasurementLaneV1
  nodeId: string
  tableId?: string | null
  pageNumber?: number | null
  request: VNextTextBlockV4MeasurementRequest
  styles: ReturnType<typeof createFlowDocUatStructureDefinitionV1>["styleCatalog"]["styles"]
  fontSizePtOverride?: number
}): FlowDocUatMeasurementConsumerV1 {
  const style = input.styles[input.request.styleKey]
  requireFact(style != null, `UAT measurement style is missing: ${input.request.styleKey}`)
  const fontSize = style.runStyle.fontSize
  requireFact(fontSize?.unit === "pt", `UAT measurement style must use point font size: ${input.request.styleKey}`)
  requireFact(style.runStyle.fontStyle !== "italic", `UAT local measured profile does not accept italic style: ${input.request.styleKey}`)
  const fontId = style.runStyle.fontWeight === "bold"
    ? "ibm-plex-sans-thai-bold" as const
    : "ibm-plex-sans-thai-regular" as const
  const fontSizePt = input.fontSizePtOverride ?? fontSize.value
  const tableId = input.tableId ?? null
  const pageNumber = input.pageNumber ?? null
  const identity = {
    lane: input.lane,
    nodeId: input.nodeId,
    tableId,
    pageNumber,
    request: input.request,
  }
  return {
    consumerId: consumerId(identity),
    lane: input.lane,
    nodeId: input.nodeId,
    tableId,
    pageNumber,
    request: clone(input.request),
    requestFingerprint: sha256(input.request),
    style: {
      styleKey: input.request.styleKey,
      fontId,
      fontSizePt,
      lineHeightPt: lineHeightForStyle(input.request.styleKey, fontSizePt),
      color: style.runStyle.textColor ?? "111827",
    },
  }
}

function tablePlan(input: {
  tableId: FlowDocUatMeasuredTablePlanV1["tableId"]
  definition: ReturnType<typeof createFlowDocUatStructureDefinitionV1>["tables"]["requirements"]["definition"]
  materialization: FlowDocUatSectionResolutionBundleV1["tables"]["requirements"]["materializedContent"]
  resolvedDocument: FlowDocUatSectionResolutionBundleV1["scopedResolution"]["resolvedDocument"]
  styleCatalog: ReturnType<typeof createFlowDocUatStructureDefinitionV1>["styleCatalog"]
  insetPt: number
}): FlowDocUatMeasuredTablePlanV1 {
  const geometry = createVNextTableCellGeometryV1({
    contractVersion: 1,
    kind: "table-cell-geometry-request",
    definition: input.definition,
    tableContentWidthPt: BODY_WIDTH_PT,
    layoutProfile: {
      contractVersion: 1,
      kind: "table-cell-layout-profile",
      layoutProfileId: `uat-local-layout:${input.tableId}:v1`,
      defaultInsetsPt: {
        top: input.insetPt,
        right: input.insetPt,
        bottom: input.insetPt,
        left: input.insetPt,
      },
      insetsByRowTemplate: {},
    },
  })
  requireFact(geometry.status === "ready", `UAT Table geometry blocked: ${JSON.stringify(geometry.issues)}`)
  const materializedPreparation = createVNextTableTextMeasurementPreparationV1({
    definition: input.definition,
    materialization: input.materialization,
    geometry,
    styleCatalog: input.styleCatalog,
    sectionId: "uat-main-section",
    measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
  })
  requireFact(
    materializedPreparation.status === "ready",
    `UAT materialized Table measurement preparation blocked: ${JSON.stringify(materializedPreparation.issues)}`,
  )
  const authoredPreparation = createVNextTableAuthoredTextMeasurementPreparationV1({
    definition: input.definition,
    materialization: input.materialization,
    geometry,
    resolvedDocument: input.resolvedDocument,
    measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
  })
  requireFact(
    authoredPreparation.status === "ready",
    `UAT authored Table measurement preparation blocked: ${JSON.stringify(authoredPreparation.issues)}`,
  )
  return { tableId: input.tableId, geometry, authoredPreparation, materializedPreparation }
}

export function createFlowDocUatMeasuredExportPlanV1(input: {
  resolution: FlowDocUatSectionResolutionBundleV1
}): FlowDocUatMeasuredExportPlanResultV1 {
  try {
    const resolution = input.resolution
    requireFact(
      resolution.bundleFingerprint === sha256(withoutFingerprint(resolution, "bundleFingerprint")),
      "UAT resolution bundle fingerprint does not match its content",
    )
    const structure = createFlowDocUatStructureDefinitionV1()
    requireFact(
      structure.structureFingerprint === resolution.structureFingerprint,
      "UAT measured export requires the exact resolved Structure Definition",
    )
    const resolvedDocument = resolution.scopedResolution.resolvedDocument
    const sections = resolvedDocument.document.document.sections.filter((section) => section.id === "uat-main-section")
    requireFact(sections.length === 1, "UAT measured export requires one resolved main section")
    const section = sections[0]
    const fieldBindings = Object.fromEntries(resolvedDocument.bindings.fields.map((binding) => [
      binding.inlineId,
      { fieldKey: binding.fieldKey, value: binding.value },
    ]))
    const imageBindings = Object.fromEntries(resolvedDocument.bindings.images.map((binding) => [
      binding.placementId,
      { assetId: binding.assetId },
    ]))
    const styleByNode = new Map(resolvedDocument.bindings.styles.map((binding) => [
      binding.textBlockId,
      binding.styleKey,
    ]))

    const requestFor = (nodeId: string, availableWidthPt: number, generatedTextByInlineId?: Record<string, {
      kind: "page-number"
      value: string
      ownerFingerprint: string
    }>) => {
      const node = section.nodes[nodeId]
      requireFact(node?.type === "text-block", `UAT measured text node is missing: ${nodeId}`)
      const request = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
        documentId: resolvedDocument.instanceId,
        instanceRevision: resolvedDocument.instanceRevision,
        sectionId: section.id,
        textBlock: node,
        availableWidthPt,
        measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
        styleKey: styleByNode.get(nodeId) ?? node.props.textStyleId ?? "default",
        resolvedTextByInlineId: fieldBindings,
        resolvedImageByPlacementId: imageBindings,
        generatedTextByInlineId,
      })
      requireFact(request.status === "ready", `UAT text measurement request blocked: ${nodeId}:${JSON.stringify(request.issues)}`)
      return request.request
    }

    const consumers: FlowDocUatMeasurementConsumerV1[] = []
    const addBody = (nodeId: string, widthPt = BODY_WIDTH_PT) => consumers.push(createConsumer({
      lane: "body-text",
      nodeId,
      request: requestFor(nodeId, widthPt),
      styles: structure.styleCatalog.styles,
    }))
    addBody("uat-module-heading")
    addBody("uat-section-heading")
    addBody("uat-section-description")
    addBody("uat-screenshots-heading")
    addBody("uat-approval-name", roundPt(BODY_WIDTH_PT / 2 - 8))
    addBody("uat-approval-date", roundPt(BODY_WIDTH_PT / 2 - 8))
    consumers.push(createConsumer({
      lane: "header-text",
      nodeId: "uat-header-title",
      request: requestFor("uat-header-title", BODY_WIDTH_PT),
      styles: structure.styleCatalog.styles,
    }))
    for (let pageNumber = 1; pageNumber <= FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT; pageNumber += 1) {
      consumers.push(createConsumer({
        lane: "footer-text",
        nodeId: "uat-footer-page-number",
        pageNumber,
        request: requestFor("uat-footer-page-number", BODY_WIDTH_PT, {
          "uat-footer-page-value": {
            kind: "page-number",
            value: String(pageNumber),
            ownerFingerprint: sha256({
              sourceResolutionFingerprint: resolution.bundleFingerprint,
              nodeId: "uat-footer-page-number",
              pageNumber,
            }),
          },
        }),
        styles: structure.styleCatalog.styles,
      }))
    }

    const requirements = tablePlan({
      tableId: "uat-requirements-table",
      definition: structure.tables.requirements.definition,
      materialization: resolution.tables.requirements.materializedContent,
      resolvedDocument,
      styleCatalog: structure.styleCatalog,
      insetPt: 4,
    })
    const screenshots = tablePlan({
      tableId: "uat-screenshots-table",
      definition: structure.tables.screenshots.definition,
      materialization: resolution.tables.screenshots.materializedContent,
      resolvedDocument,
      styleCatalog: structure.styleCatalog,
      insetPt: 6,
    })
    for (const table of [requirements, screenshots]) {
      for (const [nodeId, context] of Object.entries(table.authoredPreparation.requestsByTextBlockId)) {
        consumers.push(createConsumer({
          lane: "table-authored-text",
          nodeId,
          tableId: table.tableId,
          request: context.request,
          styles: structure.styleCatalog.styles,
        }))
      }
      for (const [nodeId, context] of Object.entries(table.materializedPreparation.requestsByTextBlockId)) {
        consumers.push(createConsumer({
          lane: "table-materialized-text",
          nodeId,
          tableId: table.tableId,
          request: context.request,
          styles: structure.styleCatalog.styles,
          fontSizePtOverride: table.tableId === "uat-requirements-table"
            && context.sourceCellId === "uat-req-id-cell"
            ? 9.5
            : undefined,
        }))
      }
    }
    requireFact(
      new Set(consumers.map((consumer) => consumer.consumerId)).size === consumers.length,
      "UAT measurement consumer identities must be unique",
    )
    const unsigned: Omit<FlowDocUatMeasuredExportPlanV1, "planFingerprint"> = {
      contractVersion: FLOWDOC_UAT_MEASURED_EXPORT_VERSION,
      kind: "uat-measured-export-plan",
      measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
      rendererProfileId: FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID,
      sourceResolutionFingerprint: resolution.bundleFingerprint,
      page: {
        widthPt: PAGE_WIDTH_PT,
        heightPt: PAGE_HEIGHT_PT,
        bodyXPt: BODY_X_PT,
        bodyYPt: BODY_Y_PT,
        bodyWidthPt: BODY_WIDTH_PT,
        bodyHeightPt: BODY_HEIGHT_PT,
        bodyEndYPt: BODY_END_Y_PT,
        maximumPageCount: FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT,
      },
      consumers,
      tables: { requirements, screenshots },
      resolution: clone(resolution),
    }
    return { status: "ready", plan: { ...unsigned, planFingerprint: sha256(unsigned) }, issues: [] }
  } catch (error) {
    return {
      status: "blocked",
      plan: null,
      issues: [issue(
        "uat-measured-export-plan-blocked",
        "plan",
        error instanceof Error ? error.message : "UAT measured export plan blocked",
      )],
    }
  }
}

function acceptEvidence(
  plan: FlowDocUatMeasuredExportPlanV1,
  evidence: readonly FlowDocUatMeasuredTextEvidenceV1[],
): Map<string, AcceptedConsumerEvidence> {
  requireFact(evidence.length === plan.consumers.length, "UAT measured evidence count must match every plan consumer")
  const evidenceById = new Map<string, FlowDocUatMeasuredTextEvidenceV1>()
  evidence.forEach((item) => {
    requireFact(!evidenceById.has(item.consumerId), `duplicate UAT measured evidence: ${item.consumerId}`)
    evidenceById.set(item.consumerId, item)
  })
  const accepted = new Map<string, AcceptedConsumerEvidence>()
  plan.consumers.forEach((consumer) => {
    const item = evidenceById.get(consumer.consumerId)
    requireFact(item != null, `UAT measured evidence is missing: ${consumer.consumerId}`)
    requireFact(item.requestFingerprint === consumer.requestFingerprint, `UAT measured request drifted: ${consumer.consumerId}`)
    requireFact(
      item.fontId === consumer.style.fontId
      && item.fontSizePt === consumer.style.fontSizePt
      && item.lineHeightPt === consumer.style.lineHeightPt
      && item.color === consumer.style.color,
      `UAT measured style binding drifted: ${consumer.consumerId}`,
    )
    requireFact(item.engine.deterministic, `UAT measured engine must be deterministic: ${consumer.consumerId}`)
    requireFact(item.lineBoxes.length > 0, `UAT measured evidence requires at least one line: ${consumer.consumerId}`)
    let expectedY = 0
    item.lineBoxes.forEach((line, lineIndex) => {
      requireFact(line.lineIndex === lineIndex, `UAT measured line indexes must be contiguous: ${consumer.consumerId}`)
      requireFact(line.startOffset >= 0 && line.endOffset >= line.startOffset
        && line.endOffset <= consumer.request.renderedText.length, `UAT measured line range is invalid: ${consumer.consumerId}`)
      requireFact(line.widthPt >= 0 && line.widthPt <= consumer.request.availableWidthPt + 1e-6
        && line.heightPt === consumer.style.lineHeightPt, `UAT measured line geometry is invalid: ${consumer.consumerId}`)
      requireFact(line.yOffsetPt === roundPt(expectedY), `UAT measured line y offsets must be cumulative: ${consumer.consumerId}`)
      requireFact(line.glyphStartIndex >= 0 && line.glyphEndIndex >= line.glyphStartIndex
        && line.glyphEndIndex <= item.glyphs.length, `UAT measured glyph range is invalid: ${consumer.consumerId}`)
      expectedY = roundPt(expectedY + line.heightPt)
    })
    item.glyphs.forEach((glyph, glyphIndex) => {
      requireFact(glyph.glyphIndex === glyphIndex && glyph.glyphId > 0, `UAT measured glyph identity is invalid: ${consumer.consumerId}`)
      requireFact(glyph.fontId === item.fontId, `UAT measured glyph font drifted: ${consumer.consumerId}`)
      requireFact(glyph.clusterStartOffset >= 0 && glyph.clusterEndOffset > glyph.clusterStartOffset
        && glyph.clusterEndOffset <= consumer.request.renderedText.length, `UAT measured glyph cluster is invalid: ${consumer.consumerId}`)
    })
    const measured = acceptVNextTextBlockV4MeasuredLines(
      consumer.request,
      item.lineBoxes.map((line) => ({
        index: line.lineIndex,
        startOffset: line.startOffset,
        endOffset: line.endOffset,
        text: consumer.request.renderedText.slice(line.startOffset, line.endOffset),
        widthPt: line.widthPt,
        heightPt: line.heightPt,
      })),
    )
    requireFact(measured.status === "accepted", `Core rejected UAT measured lines: ${consumer.consumerId}:${JSON.stringify(measured.issues)}`)
    accepted.set(consumer.consumerId, { consumer, evidence: clone(item), measured })
  })
  return accepted
}

function prepareTable(
  plan: FlowDocUatMeasuredExportPlanV1,
  table: FlowDocUatMeasuredTablePlanV1,
  accepted: Map<string, AcceptedConsumerEvidence>,
): PreparedTableRuntime {
  const measurementEvidence = (preparation: ReadyPreparation) => Object.fromEntries(
    Object.entries(preparation.requestsByTextBlockId).map(([nodeId, context]) => {
      const consumer = plan.consumers.find((candidate) => candidate.tableId === table.tableId && candidate.nodeId === nodeId)
      requireFact(consumer != null, `UAT Table measurement consumer is missing: ${table.tableId}:${nodeId}`)
      const evidence = accepted.get(consumer.consumerId)
      requireFact(evidence != null, `UAT Table measurement evidence is missing: ${table.tableId}:${nodeId}`)
      return [nodeId, { request: context.request, measured: evidence.measured }]
    }),
  )
  const authoredText = createVNextTableTextFragmentEvidenceV1({
    preparation: table.authoredPreparation,
    evidenceByTextBlockId: measurementEvidence(table.authoredPreparation),
  })
  requireFact(authoredText.status === "ready", `UAT authored Table text evidence blocked: ${JSON.stringify(authoredText.issues)}`)
  const materializedText = createVNextTableTextFragmentEvidenceV1({
    preparation: table.materializedPreparation,
    evidenceByTextBlockId: measurementEvidence(table.materializedPreparation),
  })
  requireFact(materializedText.status === "ready", `UAT materialized Table text evidence blocked: ${JSON.stringify(materializedText.issues)}`)
  const source = table.tableId === "uat-requirements-table"
    ? plan.resolution.tables.requirements
    : plan.resolution.tables.screenshots
  const structure = createFlowDocUatStructureDefinitionV1()
  const definition = table.tableId === "uat-requirements-table"
    ? structure.tables.requirements.definition
    : structure.tables.screenshots.definition
  const materializedCells = createVNextTablePreparedMaterializedCellsV1({
    definition,
    materialization: source.materializedContent,
    geometry: table.geometry,
    textEvidence: materializedText,
  })
  requireFact(materializedCells.status === "ready", `UAT materialized Table cells blocked: ${JSON.stringify(materializedCells.issues)}`)
  const authoredCells = createVNextTablePreparedAuthoredCellsV1({
    definition,
    materialization: source.materializedContent,
    geometry: table.geometry,
    resolvedDocument: plan.resolution.scopedResolution.resolvedDocument,
    textEvidence: authoredText,
  })
  requireFact(authoredCells.status === "ready", `UAT authored Table cells blocked: ${JSON.stringify(authoredCells.issues)}`)
  const prepared = createVNextTablePreparedRowsV1({
    materialization: source.materializedContent,
    materializedCells,
    authoredCells,
  })
  requireFact(prepared.status === "ready", `UAT prepared Table rows blocked: ${JSON.stringify(prepared.issues)}`)
  return { plan: table, prepared }
}

const REQUIREMENT_TABLE_STYLE: VNextTableRendererStyleProfileV1 = {
  contractVersion: 1,
  kind: "table-render-style-profile",
  profileId: "uat-requirements-table-render-v1",
  outerBorder: { style: "solid", widthPt: 0.5, color: "64748B" },
  internalRowBorder: { style: "solid", widthPt: 0.5, color: "CBD5E1" },
  internalColumnBorder: { style: "solid", widthPt: 0.5, color: "CBD5E1" },
  defaultCellBackground: null,
  rowBackgrounds: {
    header: "E2E8F0",
    body: null,
    footer: null,
    "empty-state": null,
    "repeated-header": "E2E8F0",
  },
  textColorFallback: "111827",
  missingMediaPolicy: "block",
}

const SCREENSHOT_TABLE_STYLE: VNextTableRendererStyleProfileV1 = {
  contractVersion: 1,
  kind: "table-render-style-profile",
  profileId: "uat-screenshots-table-render-v1",
  outerBorder: { style: "none", widthPt: 0, color: "FFFFFF" },
  internalRowBorder: { style: "none", widthPt: 0, color: "FFFFFF" },
  internalColumnBorder: { style: "none", widthPt: 0, color: "FFFFFF" },
  defaultCellBackground: null,
  rowBackgrounds: { header: null, body: null, footer: null, "empty-state": null, "repeated-header": null },
  textColorFallback: "111827",
  missingMediaPolicy: "block",
}

function fontAssets(): VNextPdfFontAssetV1[] {
  return [
    {
      fontId: "ibm-plex-sans-thai-regular",
      family: "IBM Plex Sans Thai",
      style: "normal",
      weight: 400,
      format: "ttf",
      sha256: "bdf527758ba47d68d42c104b9167cb15660e88a16b40136504a7ea8c56792b57",
      sourceKind: "package-font-asset",
      licenseId: "OFL-1.1",
      embedding: "subset",
      toUnicodeMap: true,
    },
    {
      fontId: "ibm-plex-sans-thai-bold",
      family: "IBM Plex Sans Thai",
      style: "normal",
      weight: 700,
      format: "ttf",
      sha256: "ba5e62ecf0d5f19338b6d34360bce097d29fe56142eec5f612f2d7dd91c6bf21",
      sourceKind: "package-font-asset",
      licenseId: "OFL-1.1",
      embedding: "subset",
      toUnicodeMap: true,
    },
  ]
}

function baselineOffset(fontSizePt: number, lineHeightPt: number): number {
  return roundPt(lineHeightPt - (lineHeightPt - fontSizePt) / 2)
}

function drawPlan(pageCount: number, draws: VNextPdfDrawCommand[]): VNextPdfRendererAdapterPlan {
  const textCommandCount = draws.filter((command) => command.operation === "draw-text").length
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
    pageCount,
    drawCommands: draws,
    blockingIssues: [],
    warningIssues: [],
    summary: {
      inputCommandCount: draws.length,
      drawCommandCount: draws.length,
      textCommandCount,
      boxCommandCount: draws.length - textCommandCount,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    },
  }
}

export function createFlowDocUatMeasuredExportBundleV1(input: {
  plan: FlowDocUatMeasuredExportPlanV1
  textEvidence: readonly FlowDocUatMeasuredTextEvidenceV1[]
  imageAssets: readonly VNextPdfImageAssetV1[]
}): FlowDocUatMeasuredExportResultV1 {
  try {
    const { plan } = input
    requireFact(plan.planFingerprint === sha256(withoutFingerprint(plan, "planFingerprint")), "UAT measured export plan fingerprint drifted")
    const accepted = acceptEvidence(plan, input.textEvidence)
    const requirements = prepareTable(plan, plan.tables.requirements, accepted)
    const screenshots = prepareTable(plan, plan.tables.screenshots, accepted)
    const pages: PageState[] = [{ pageIndex: 0, bodyCursorYPt: BODY_Y_PT, paints: [] }]
    let currentPageIndex = 0

    const page = (pageIndex = currentPageIndex) => {
      while (pages.length <= pageIndex) pages.push({ pageIndex: pages.length, bodyCursorYPt: BODY_Y_PT, paints: [] })
      return pages[pageIndex]
    }
    const freshPage = () => {
      requireFact(pages.length < FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT, "UAT measured export exceeded the local page envelope")
      currentPageIndex = pages.length
      pages.push({ pageIndex: currentPageIndex, bodyCursorYPt: BODY_Y_PT, paints: [] })
      return page()
    }
    const addPending = (targetPageIndex: number, pending: PendingPaint) => {
      page(targetPageIndex).paints.push(pending)
    }
    const makeDraw = (input: {
      identity: unknown
      sourceCommandId: string
      fragmentId: string
      pageIndex: number
      operation: "draw-text" | "draw-fragment-box"
      nodeId: string
      nodeType: VNextPdfDrawCommand["nodeType"]
      bounds: VNextPdfDrawCommand["bounds"]
      text: string | null
      table?: VNextPdfDrawCommand["table"]
    }): VNextPdfDrawCommand => ({
      id: `pdf:uat:${token(input.identity)}`,
      sourceCommandId: input.sourceCommandId,
      fragmentId: input.fragmentId,
      pageIndex: input.pageIndex,
      pageNumber: input.pageIndex + 1,
      operation: input.operation,
      nodeId: input.nodeId,
      nodeType: input.nodeType,
      bounds: clone(input.bounds),
      text: input.text,
      table: input.table ?? null,
    })
    const addGlyphLine = (input: {
      accepted: AcceptedConsumerEvidence
      line: VNextTextEngineAdapterLineBoxFact
      pageIndex: number
      xPt: number
      yPt: number
      identity: unknown
      sourceCommandId: string
      fragmentId: string
      table?: VNextPdfDrawCommand["table"]
    }) => {
      const renderedText = input.accepted.consumer.request.renderedText
      const hardBreak = /^[\r\n\u0085\u2028\u2029]$/u
      let visibleStartOffset = input.line.startOffset
      let visibleEndOffset = input.line.endOffset
      while (visibleStartOffset < visibleEndOffset && hardBreak.test(renderedText[visibleStartOffset] ?? "")) {
        visibleStartOffset += 1
      }
      while (visibleEndOffset > visibleStartOffset && hardBreak.test(renderedText[visibleEndOffset - 1] ?? "")) {
        visibleEndOffset -= 1
      }
      const text = renderedText.slice(visibleStartOffset, visibleEndOffset)
      const selected = input.accepted.evidence.glyphs
        .slice(input.line.glyphStartIndex, input.line.glyphEndIndex)
        .filter((glyph) => (
          glyph.clusterStartOffset >= visibleStartOffset && glyph.clusterEndOffset <= visibleEndOffset
        ))
      if (text.length === 0 || selected.length === 0 || input.line.widthPt <= 0) return
      const glyphs: VNextPdfGlyphFactV1[] = selected.map((glyph, glyphIndex) => ({
        glyphIndex,
        glyphId: glyph.glyphId,
        advancePt: roundPt(glyph.advancePt),
        offsetXPt: roundPt(glyph.offsetXPt),
        offsetYPt: roundPt(glyph.offsetYPt),
        clusterStartOffset: glyph.clusterStartOffset - visibleStartOffset,
        clusterEndOffset: glyph.clusterEndOffset - visibleStartOffset,
      }))
      let coveredUntil = 0
      for (const range of glyphs
        .map((glyph) => ({ start: glyph.clusterStartOffset, end: glyph.clusterEndOffset }))
        .sort((left, right) => left.start - right.start || left.end - right.end)) {
        requireFact(range.start <= coveredUntil,
          `UAT glyph line has a text coverage gap: ${input.accepted.consumer.consumerId}`)
        coveredUntil = Math.max(coveredUntil, range.end)
      }
      requireFact(coveredUntil >= text.length,
        `UAT glyph line does not cover its text: ${input.accepted.consumer.consumerId}`)
      const widthPt = roundPt(glyphs.reduce((sum, glyph) => sum + glyph.advancePt, 0))
      requireFact(Math.abs(widthPt - input.line.widthPt) <= 1e-6, `UAT glyph line width drifted: ${input.accepted.consumer.consumerId}`)
      requireFact(glyphs.every((glyph) => glyph.clusterStartOffset >= 0 && glyph.clusterEndOffset <= text.length),
        `UAT glyph line cluster crossed a measured line: ${input.accepted.consumer.consumerId}`)
      const bounds: VNextPdfPaintBoundsV1 = {
        xPt: roundPt(input.xPt),
        yPt: roundPt(input.yPt),
        widthPt,
        heightPt: input.line.heightPt,
      }
      const draw = makeDraw({
        identity: input.identity,
        sourceCommandId: input.sourceCommandId,
        fragmentId: input.fragmentId,
        pageIndex: input.pageIndex,
        operation: "draw-text",
        nodeId: input.accepted.consumer.nodeId,
        nodeType: "text-block",
        bounds,
        text,
        table: input.table,
      })
      const paint: VNextPdfGlyphRunPaintCommandV1 = {
        id: `paint:uat:${token({ identity: input.identity, kind: "glyph-run" })}`,
        sourceCommandId: draw.id,
        pageIndex: input.pageIndex,
        paintOrder: 0,
        bounds,
        kind: "glyph-run",
        measurementRequestId: input.accepted.consumer.consumerId,
        measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
        text,
        fontId: input.accepted.evidence.fontId,
        fontSizePt: input.accepted.evidence.fontSizePt,
        lineHeightPt: input.accepted.evidence.lineHeightPt,
        baselineOffsetPt: baselineOffset(input.accepted.evidence.fontSizePt, input.accepted.evidence.lineHeightPt),
        color: input.accepted.evidence.color,
        opacity: 1,
        glyphs,
      }
      addPending(input.pageIndex, { draw, paint })
    }
    const bodyConsumer = (nodeId: string) => {
      const consumer = plan.consumers.find((candidate) => candidate.lane === "body-text" && candidate.nodeId === nodeId)
      requireFact(consumer != null, `UAT body measurement consumer is missing: ${nodeId}`)
      const item = accepted.get(consumer.consumerId)
      requireFact(item != null, `UAT body measurement evidence is missing: ${nodeId}`)
      return item
    }
    const placeText = (nodeId: string, options: { keep: boolean; marginAfterPt: number }) => {
      const item = bodyConsumer(nodeId)
      const totalHeightPt = roundPt(item.evidence.lineBoxes.reduce((sum, line) => sum + line.heightPt, 0))
      if (options.keep && page().bodyCursorYPt + totalHeightPt > BODY_END_Y_PT) freshPage()
      item.evidence.lineBoxes.forEach((line) => {
        if (page().bodyCursorYPt + line.heightPt > BODY_END_Y_PT) freshPage()
        addGlyphLine({
          accepted: item,
          line,
          pageIndex: currentPageIndex,
          xPt: BODY_X_PT,
          yPt: page().bodyCursorYPt,
          identity: { lane: "body", nodeId, line: line.lineIndex, pageIndex: currentPageIndex },
          sourceCommandId: `uat-body:${nodeId}:${line.lineIndex}`,
          fragmentId: `uat-body:${nodeId}:line:${line.lineIndex}:page:${currentPageIndex}`,
        })
        page().bodyCursorYPt = roundPt(page().bodyCursorYPt + line.heightPt)
      })
      page().bodyCursorYPt = Math.min(BODY_END_Y_PT, roundPt(page().bodyCursorYPt + options.marginAfterPt))
    }
    const advanceGap = (gapPt: number) => {
      if (page().bodyCursorYPt + gapPt > BODY_END_Y_PT) freshPage()
      else page().bodyCursorYPt = roundPt(page().bodyCursorYPt + gapPt)
    }

    const tableConsumerByNode = new Map(plan.consumers
      .filter((consumer) => consumer.tableId != null)
      .map((consumer) => [consumer.nodeId, accepted.get(consumer.consumerId)!]))
    const paginationEvidence: Partial<Record<"requirements" | "screenshots", FlowDocUatTablePaginationEvidenceV1>> = {}
    const placeTable = (inputTable: {
      key: "requirements" | "screenshots"
      runtime: PreparedTableRuntime
      headerPolicy: "no-repeat" | "repeat-leading-headers"
      style: VNextTableRendererStyleProfileV1
      maximumRowPlanCount: number
    }) => {
      let firstPageAvailableHeightPt = roundPt(BODY_END_Y_PT - page().bodyCursorYPt)
      if (firstPageAvailableHeightPt < 16) {
        freshPage()
        firstPageAvailableHeightPt = BODY_HEIGHT_PT
      }
      let pagination = paginateVNextTableRowsV1({
        prepared: inputTable.runtime.prepared,
        pageBodyHeightPt: BODY_HEIGHT_PT,
        firstPageAvailableHeightPt,
        startPageIndex: currentPageIndex,
        maximumPageCount: FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT,
        maximumRowPlanCount: inputTable.maximumRowPlanCount,
        headerPolicy: inputTable.headerPolicy,
      })
      requireFact(pagination.status === "paginated", `UAT Table pagination blocked: ${inputTable.key}:${JSON.stringify(pagination.issues)}`)
      if (pagination.pages[0]?.rows.length === 0 && pagination.pages.length > 1) {
        freshPage()
        pagination = paginateVNextTableRowsV1({
          prepared: inputTable.runtime.prepared,
          pageBodyHeightPt: BODY_HEIGHT_PT,
          firstPageAvailableHeightPt: BODY_HEIGHT_PT,
          startPageIndex: currentPageIndex,
          maximumPageCount: FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT,
          maximumRowPlanCount: inputTable.maximumRowPlanCount,
          headerPolicy: inputTable.headerPolicy,
        })
        requireFact(pagination.status === "paginated", `UAT fresh-page Table pagination blocked: ${inputTable.key}`)
      }
      const firstOriginY = page().bodyCursorYPt
      const origins = pagination.pages.map((tablePage, index) => ({
        pageIndex: tablePage.pageIndex,
        xPt: BODY_X_PT,
        yPt: index === 0 ? firstOriginY : BODY_Y_PT,
      }))
      const projection = projectVNextTableRendererCommandsV1({
        contractVersion: 1,
        kind: "table-renderer-projection-request",
        sectionId: "uat-main-section",
        zoneId: "uat-body-zone",
        pagination,
        expectedPaginationFingerprint: pagination.fingerprint,
        pageOrigins: origins,
        styleProfile: inputTable.style,
      })
      requireFact(projection.status === "consumable", `UAT Table renderer projection blocked: ${inputTable.key}:${JSON.stringify(projection.issues)}`)
      projection.commands.forEach((command) => {
        if (command.kind === "text-line") {
          const item = tableConsumerByNode.get(command.nodeId)
          requireFact(item != null, `UAT projected Table text has no measurement evidence: ${command.nodeId}`)
          const line = item.evidence.lineBoxes.find((candidate) => (
            candidate.startOffset === command.sourceStart.resolvedOffset
            && candidate.endOffset === command.sourceEnd.resolvedOffset
          ))
          requireFact(line != null && line.widthPt === command.bounds.widthPt && line.heightPt === command.bounds.heightPt,
            `UAT projected Table line drifted: ${command.id}`)
          addGlyphLine({
            accepted: item,
            line,
            pageIndex: command.pageIndex,
            xPt: command.bounds.xPt,
            yPt: command.bounds.yPt,
            identity: { tableId: command.tableId, commandId: command.id },
            sourceCommandId: command.id,
            fragmentId: command.id,
            table: { tableId: command.tableId, rowId: command.rowFragmentId, cellId: command.sourceCellId },
          })
          return
        }
        if (command.kind === "cell-background" || command.kind === "divider") {
          if (command.bounds.widthPt <= 0 || command.bounds.heightPt <= 0) return
          const draw = makeDraw({
            identity: { tableId: command.tableId, commandId: command.id },
            sourceCommandId: command.id,
            fragmentId: command.id,
            pageIndex: command.pageIndex,
            operation: "draw-fragment-box",
            nodeId: command.tableId,
            nodeType: "table",
            bounds: command.bounds,
            text: null,
            table: { tableId: command.tableId },
          })
          const paint: VNextPdfFillRectPaintCommandV1 = {
            id: `paint:uat:${token({ tableId: command.tableId, commandId: command.id })}`,
            sourceCommandId: draw.id,
            pageIndex: command.pageIndex,
            paintOrder: 0,
            bounds: clone(command.bounds) as VNextPdfPaintBoundsV1,
            kind: "fill-rect",
            color: command.color,
            opacity: 1,
          }
          addPending(command.pageIndex, { draw, paint })
          return
        }
        if (command.kind === "border" && command.style.style !== "none") {
          const draw = makeDraw({
            identity: { tableId: command.tableId, commandId: command.id },
            sourceCommandId: command.id,
            fragmentId: command.id,
            pageIndex: command.pageIndex,
            operation: "draw-fragment-box",
            nodeId: command.tableId,
            nodeType: "table",
            bounds: command.bounds,
            text: null,
            table: { tableId: command.tableId },
          })
          const paint: VNextPdfStrokeLinePaintCommandV1 = {
            id: `paint:uat:${token({ tableId: command.tableId, commandId: command.id })}`,
            sourceCommandId: draw.id,
            pageIndex: command.pageIndex,
            paintOrder: 0,
            bounds: clone(command.bounds),
            kind: "stroke-line",
            color: command.style.color,
            opacity: 1,
            widthPt: command.style.widthPt,
            style: command.style.style,
          }
          addPending(command.pageIndex, { draw, paint })
          return
        }
        if (command.kind === "image") {
          requireFact(command.assetId != null && !command.placeholder, `UAT screenshot image is unresolved: ${command.id}`)
          const draw = makeDraw({
            identity: { tableId: command.tableId, commandId: command.id },
            sourceCommandId: command.id,
            fragmentId: command.id,
            pageIndex: command.pageIndex,
            operation: "draw-fragment-box",
            nodeId: command.nodeId,
            nodeType: "image",
            bounds: command.bounds,
            text: null,
            table: { tableId: command.tableId, rowId: command.rowFragmentId, cellId: command.sourceCellId },
          })
          const paint: VNextPdfImagePaintCommandV1 = {
            id: `paint:uat:${token({ tableId: command.tableId, commandId: command.id })}`,
            sourceCommandId: draw.id,
            pageIndex: command.pageIndex,
            paintOrder: 0,
            bounds: clone(command.bounds) as VNextPdfPaintBoundsV1,
            kind: "image",
            assetId: command.assetId,
            fit: "contain",
            crop: null,
            opacity: 1,
          }
          addPending(command.pageIndex, { draw, paint })
        }
      })
      pagination.pages.forEach((tablePage) => page(tablePage.pageIndex))
      const finalTablePage = pagination.pages.at(-1)
      const finalOrigin = origins.at(-1)
      requireFact(finalTablePage != null && finalOrigin != null, `UAT Table pagination returned no pages: ${inputTable.key}`)
      currentPageIndex = finalTablePage.pageIndex
      page().bodyCursorYPt = roundPt(finalOrigin.yPt + finalTablePage.usedHeightPt)
      paginationEvidence[inputTable.key] = {
        tableId: pagination.tableId,
        paginationFingerprint: sha256(pagination.fingerprint),
        rendererProjectionFingerprint: sha256(projection.fingerprint),
        pageCount: pagination.summary.pageCount,
        rowFragmentCount: pagination.summary.rowFragmentCount,
        splitRowCount: pagination.summary.splitRowCount,
        repeatedHeaderFragmentCount: pagination.summary.repeatedHeaderFragmentCount,
        imagePaintCount: projection.commands.filter((command) => command.kind === "image").length,
      }
    }

    placeText("uat-module-heading", { keep: true, marginAfterPt: 6 })
    placeText("uat-section-heading", { keep: true, marginAfterPt: 6 })
    placeText("uat-section-description", { keep: false, marginAfterPt: 0 })
    advanceGap(unitToPt({ value: 3, unit: "mm" }))
    placeTable({
      key: "requirements",
      runtime: requirements,
      headerPolicy: "repeat-leading-headers",
      style: REQUIREMENT_TABLE_STYLE,
      maximumRowPlanCount: 4096,
    })
    page().bodyCursorYPt = Math.min(BODY_END_Y_PT, roundPt(page().bodyCursorYPt + unitToPt({ value: 5, unit: "mm" })))
    const screenshotHeading = bodyConsumer("uat-screenshots-heading")
    const screenshotHeadingHeightPt = screenshotHeading.measured.summary.totalHeightPt
    const firstScreenshotHeightPt = screenshots.prepared.rows[0]?.maximumCellOuterHeightPt ?? 0
    const screenshotHeadingMarginPt = unitToPt({ value: 2, unit: "mm" })
    if (page().bodyCursorYPt + screenshotHeadingHeightPt + screenshotHeadingMarginPt + firstScreenshotHeightPt > BODY_END_Y_PT) {
      freshPage()
    }
    placeText("uat-screenshots-heading", { keep: true, marginAfterPt: screenshotHeadingMarginPt })
    placeTable({
      key: "screenshots",
      runtime: screenshots,
      headerPolicy: "no-repeat",
      style: SCREENSHOT_TABLE_STYLE,
      maximumRowPlanCount: 2048,
    })
    page().bodyCursorYPt = Math.min(BODY_END_Y_PT, roundPt(page().bodyCursorYPt + unitToPt({ value: 5, unit: "mm" })))

    const approvalName = bodyConsumer("uat-approval-name")
    const approvalDate = bodyConsumer("uat-approval-date")
    const approvalHeight = roundPt(Math.max(
      approvalName.measured.summary.totalHeightPt,
      approvalDate.measured.summary.totalHeightPt,
    ) + 16.5)
    if (page().bodyCursorYPt + approvalHeight > BODY_END_Y_PT) freshPage()
    page().bodyCursorYPt = roundPt(page().bodyCursorYPt + 8)
    const dividerBounds = { xPt: BODY_X_PT, yPt: page().bodyCursorYPt, widthPt: BODY_WIDTH_PT, heightPt: 0 }
    const dividerDraw = makeDraw({
      identity: { lane: "approval-divider", pageIndex: currentPageIndex },
      sourceCommandId: "uat-approval-divider",
      fragmentId: `uat-approval-divider:page:${currentPageIndex}`,
      pageIndex: currentPageIndex,
      operation: "draw-fragment-box",
      nodeId: "uat-approval-divider",
      nodeType: "divider",
      bounds: dividerBounds,
      text: null,
    })
    addPending(currentPageIndex, {
      draw: dividerDraw,
      paint: {
        id: `paint:uat:${token({ lane: "approval-divider", pageIndex: currentPageIndex })}`,
        sourceCommandId: dividerDraw.id,
        pageIndex: currentPageIndex,
        paintOrder: 0,
        bounds: dividerBounds,
        kind: "stroke-line",
        color: "64748B",
        opacity: 1,
        widthPt: 0.5,
        style: "solid",
      },
    })
    page().bodyCursorYPt = roundPt(page().bodyCursorYPt + 8.5)
    for (const [columnIndex, item] of [approvalName, approvalDate].entries()) {
      item.evidence.lineBoxes.forEach((line) => addGlyphLine({
        accepted: item,
        line,
        pageIndex: currentPageIndex,
        xPt: roundPt(BODY_X_PT + columnIndex * BODY_WIDTH_PT / 2),
        yPt: roundPt(page().bodyCursorYPt + line.yOffsetPt),
        identity: { lane: "approval", nodeId: item.consumer.nodeId, line: line.lineIndex, pageIndex: currentPageIndex },
        sourceCommandId: `uat-approval:${item.consumer.nodeId}:${line.lineIndex}`,
        fragmentId: `uat-approval:${item.consumer.nodeId}:line:${line.lineIndex}`,
      }))
    }
    page().bodyCursorYPt = roundPt(page().bodyCursorYPt + approvalHeight - 16.5)

    const headerConsumer = plan.consumers.find((consumer) => consumer.lane === "header-text")
    requireFact(headerConsumer != null, "UAT header measurement consumer is missing")
    const header = accepted.get(headerConsumer.consumerId)
    requireFact(header != null, "UAT header measurement evidence is missing")
    pages.forEach((targetPage) => {
      header.evidence.lineBoxes.forEach((line) => {
        requireFact(HEADER_Y_PT + line.yOffsetPt + line.heightPt <= BODY_Y_PT, "UAT header exceeds its reserved region")
        addGlyphLine({
          accepted: header,
          line,
          pageIndex: targetPage.pageIndex,
          xPt: BODY_X_PT,
          yPt: roundPt(HEADER_Y_PT + line.yOffsetPt),
          identity: { lane: "header", line: line.lineIndex, pageIndex: targetPage.pageIndex },
          sourceCommandId: `uat-header:${line.lineIndex}`,
          fragmentId: `uat-header:line:${line.lineIndex}:page:${targetPage.pageIndex}`,
        })
      })
      const footerConsumer = plan.consumers.find((consumer) => (
        consumer.lane === "footer-text" && consumer.pageNumber === targetPage.pageIndex + 1
      ))
      requireFact(footerConsumer != null, `UAT footer measurement consumer is missing: ${targetPage.pageIndex + 1}`)
      const footer = accepted.get(footerConsumer.consumerId)
      requireFact(footer != null && footer.evidence.lineBoxes.length === 1, `UAT footer measurement is invalid: ${targetPage.pageIndex + 1}`)
      const line = footer.evidence.lineBoxes[0]
      addGlyphLine({
        accepted: footer,
        line,
        pageIndex: targetPage.pageIndex,
        xPt: roundPt(BODY_X_PT + BODY_WIDTH_PT - line.widthPt),
        yPt: FOOTER_Y_PT,
        identity: { lane: "footer", pageIndex: targetPage.pageIndex },
        sourceCommandId: `uat-footer:page:${targetPage.pageIndex}`,
        fragmentId: `uat-footer:page:${targetPage.pageIndex}`,
      })
    })

    const pending = pages.flatMap((targetPage) => targetPage.paints.map((entry, paintOrder) => ({
      draw: entry.draw,
      paint: { ...entry.paint, paintOrder },
    })))
    const draws = pending.map((entry) => entry.draw)
    const paints = pending.map((entry) => entry.paint)
    const contract = createVNextPdfMeasuredDrawContractV1({
      contractVersion: 1,
      kind: "pdf-measured-draw-contract-request",
      pilotId: "pdf-export-realdoc-d-uat-section",
      rendererProfileId: FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID,
      measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
      plan: drawPlan(pages.length, draws),
      pageBoxes: pages.map((targetPage) => ({
        pageIndex: targetPage.pageIndex,
        pageNumber: targetPage.pageIndex + 1,
        widthPt: PAGE_WIDTH_PT,
        heightPt: PAGE_HEIGHT_PT,
        backgroundColor: "FFFFFF",
      })),
      fontAssets: fontAssets(),
      imageAssets: clone(input.imageAssets),
      paintCommands: paints,
    })
    requireFact(contract.status === "consumable", `UAT measured draw contract blocked: ${JSON.stringify(contract.issues)}`)
    const sourcePixelCount = input.imageAssets.reduce(
      (sum, asset) => sum + asset.pixelWidth * asset.pixelHeight,
      0,
    )
    const glyphCount = contract.pages.reduce((sum, targetPage) => sum + targetPage.commands.reduce(
      (pageSum, command) => pageSum + (command.kind === "glyph-run" ? command.glyphs.length : 0),
      0,
    ), 0)
    requireFact(
      contract.summary.pageCount <= FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT
      && contract.summary.paintCommandCount <= 50_000
      && glyphCount <= 250_000
      && contract.summary.fontAssetCount <= 8
      && contract.summary.imageAssetCount <= 64
      && sourcePixelCount <= 50_000_000,
      "UAT measured export exceeds the accepted local resource envelope",
    )
    const paintedImageAssetIds = contract.pages.flatMap((targetPage) => targetPage.commands
      .filter((command): command is VNextPdfImagePaintCommandV1 => command.kind === "image")
      .map((command) => command.assetId))
    const expectedImageAssetIds = input.imageAssets.map((asset) => asset.assetId)
    requireFact(
      paintedImageAssetIds.length === expectedImageAssetIds.length
      && new Set(paintedImageAssetIds).size === paintedImageAssetIds.length
      && expectedImageAssetIds.every((assetId) => paintedImageAssetIds.includes(assetId)),
      "every UAT screenshot asset must be painted exactly once",
    )
    requireFact(paginationEvidence.requirements != null && paginationEvidence.screenshots != null, "UAT Table evidence is incomplete")
    const measuredLineCount = input.textEvidence.reduce((sum, item) => sum + item.lineBoxes.length, 0)
    const unsigned: Omit<FlowDocUatMeasuredExportBundleV1, "bundleFingerprint"> = {
      contractVersion: FLOWDOC_UAT_MEASURED_EXPORT_VERSION,
      kind: "uat-measured-export-bundle",
      phaseId: "PDF-EXPORT-REALDOC-D",
      sourceResolutionFingerprint: plan.sourceResolutionFingerprint,
      sourcePlanFingerprint: plan.planFingerprint,
      measuredDrawContract: contract,
      tableEvidence: {
        requirements: paginationEvidence.requirements,
        screenshots: paginationEvidence.screenshots,
      },
      resourceEnvelope: {
        pageCount: contract.summary.pageCount,
        paintCommandCount: contract.summary.paintCommandCount,
        glyphCount,
        fontAssetCount: contract.summary.fontAssetCount,
        imageAssetCount: contract.summary.imageAssetCount,
        sourcePixelCount,
        accepted: true,
      },
      summary: {
        measurementConsumerCount: plan.consumers.length,
        measuredLineCount,
        pageCount: contract.summary.pageCount,
        glyphRunCount: contract.summary.glyphRunCount,
        imagePaintCount: contract.summary.imageCount,
        repeatedRequirementHeaderCount: paginationEvidence.requirements.repeatedHeaderFragmentCount,
        splitRequirementRowCount: paginationEvidence.requirements.splitRowCount,
        screenshotRowCount: plan.resolution.tables.screenshots.materializedContent.work.materializedRowCount,
      },
      execution: {
        nativeThaiShaping: "accepted-input",
        nativeThaiSegmentation: "accepted-input",
        tablePreparation: "executed-core",
        tablePagination: "executed-core",
        rendererProjection: "executed-core",
        pdfRendering: "not-run",
        productionBinding: false,
      },
    }
    return { status: "measured", bundle: { ...unsigned, bundleFingerprint: sha256(unsigned) }, issues: [] }
  } catch (error) {
    return {
      status: "blocked",
      bundle: null,
      issues: [issue(
        "uat-measured-export-blocked",
        "measuredExport",
        error instanceof Error ? error.message : "UAT measured export blocked",
      )],
    }
  }
}
