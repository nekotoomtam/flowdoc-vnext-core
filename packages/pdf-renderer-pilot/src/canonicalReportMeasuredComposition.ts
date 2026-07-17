import { createHash } from "node:crypto"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextTablePreparedAuthoredCellsV1,
  createVNextTablePreparedMaterializedCellsV1,
  createVNextTablePreparedRowsV1,
  createVNextTableTextFragmentEvidenceV1,
  type VNextTablePreparedRowV1,
  type VNextTablePreparedRowsResultV1,
  type VNextTableTextFragmentEvidenceResultV1,
  type VNextTableTextMeasurementPreparationResultV1,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextBlockV4MeasurementRequest,
  type ZoneRoleV4Target,
} from "@flowdoc/vnext-core"
import {
  type FlowDocCanonicalReportLineBreakingBundleV1,
  type FlowDocCanonicalReportLineMeasurementV1,
} from "./canonicalReportLineBreaking.js"
import {
  type FlowDocCanonicalReportNativeShapingBundleV1,
  type FlowDocCanonicalReportNativeShapingConsumerSourceV1,
  type FlowDocCanonicalReportNativeShapingConsumerV1,
} from "./canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "./canonicalReportTableProjection.js"

export const FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_ID = "ocr-benchmark-report-measured-composition-v1" as const

const ACCEPTED_PROJECTION_FINGERPRINT = "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193"
const ACCEPTED_NATIVE_SHAPING_FINGERPRINT = "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8"
const ACCEPTED_LINE_BREAKING_FINGERPRINT = "e1a9612766a6342ab3c36bbd0475f170bd4ef64d706161513bdf2f4a64b634a4"

type AcceptedMeasuredLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>
type ReadyTextFragmentEvidence = Extract<VNextTableTextFragmentEvidenceResultV1, { status: "ready" }>
type ReadyPreparedRows = Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>
type TableConsumerSource = Exclude<FlowDocCanonicalReportNativeShapingConsumerSourceV1, { lane: "projected-document-text" }>

export interface FlowDocCanonicalReportMeasuredCompositionSourceInputV1 {
  projection: FlowDocCanonicalReportTableProjectionBundleV1
  nativeShaping: FlowDocCanonicalReportNativeShapingBundleV1
  lineBreaking: FlowDocCanonicalReportLineBreakingBundleV1
}

export interface FlowDocCanonicalReportMeasuredCompositionPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_VERSION
  kind: "canonical-report-measured-composition-plan"
  compositionId: typeof FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_ID
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  measurementProfileId: string
  consumerBindings: Array<{
    consumerId: string
    sourceRequestFingerprint: string
    measurementVariantId: string
    lane: FlowDocCanonicalReportNativeShapingConsumerSourceV1["lane"]
    textBlockId: string
  }>
  tableBindings: Array<{
    projectionId: string
    tableId: string
    geometryFingerprint: string
    sourceRowCount: number
  }>
  flowBindings: Array<{
    sectionId: string
    zoneRole: ZoneRoleV4Target
    childIds: string[]
  }>
  planFingerprint: string
}

export interface FlowDocCanonicalReportCoreAcceptedConsumerV1 {
  consumerId: string
  source: FlowDocCanonicalReportNativeShapingConsumerSourceV1
  sourceRequestFingerprint: string
  measurementVariantId: string
  lineMeasurementFingerprint: string
  coreAcceptanceFingerprint: string
  lineCount: number
  totalHeightPt: number
  coreStatus: "accepted"
}

export interface FlowDocCanonicalReportMeasuredDocumentBlockV1 {
  consumerId: string
  sectionId: string
  zoneRole: ZoneRoleV4Target
  textBlockId: string
  projectionTitle: boolean
  measurementVariantId: string
  request: VNextTextBlockV4MeasurementRequest
  measured: AcceptedMeasuredLines
  naturalHeightPt: number
}

export interface FlowDocCanonicalReportFixedImageBlockV1 {
  sectionId: string
  zoneRole: "body"
  imageId: string
  fieldKey: string
  assetId: string
  assetOwner: "instance-media"
  widthPt: number
  heightPt: number
  fit: "contain" | "cover" | "stretch"
  align: "left" | "center" | "right"
  naturalHeightPt: number
}

export interface FlowDocCanonicalReportNaturalRowHeightV1 {
  rowIndex: number
  rowIdentity:
    | { kind: "authored-row"; sourceRowId: string }
    | { kind: "resolved-row"; rowInstanceId: string; itemKey: string }
  role: "header" | "body" | "footer" | "empty-state"
  breakPolicy: "allow" | "prefer-keep" | "strict-keep"
  minimumFirstFragmentHeightPt: number
  maximumCellOuterHeightPt: number
  naturalWholeRowHeightPt: number
  cellCount: number
  textLineCandidateCount: number
  multiLineCellCount: number
  emptyLineCellCount: number
  tallestSourceCellIds: string[]
  consumerIds: string[]
  rowFingerprint: string
  heightFingerprint: string
}

export interface FlowDocCanonicalReportPreparedTableV1 {
  projectionId: string
  collectionFieldKey: string
  sectionId: string
  tableId: string
  tableContentWidthPt: number
  geometryFingerprint: string
  authoredTextEvidenceFingerprint: string
  materializedTextEvidenceFingerprint: string
  preparedRows: ReadyPreparedRows
  naturalRows: FlowDocCanonicalReportNaturalRowHeightV1[]
  summary: {
    rowCount: number
    authoredRowCount: number
    materializedRowCount: number
    cellCount: number
    textLineCandidateCount: number
    multiLineCellCount: number
    emptyLineCellCount: number
    naturalTableHeightPt: number
    minimumNaturalRowHeightPt: number
    maximumNaturalRowHeightPt: number
  }
}

export type FlowDocCanonicalReportFlowEntryV1 =
  | {
      nodeIndex: number
      nodeId: string
      kind: "measured-text-block"
      status: "ready"
      naturalHeightPt: number
      evidence: { consumerId: string; measurementVariantId: string }
    }
  | {
      nodeIndex: number
      nodeId: string
      kind: "prepared-table"
      status: "ready"
      naturalHeightPt: number
      evidence: { projectionId: string; preparedRowsFingerprint: string }
    }
  | {
      nodeIndex: number
      nodeId: string
      kind: "fixed-image"
      status: "ready"
      naturalHeightPt: number
      evidence: { assetId: string }
    }
  | {
      nodeIndex: number
      nodeId: string
      kind: "generated-text-deferred"
      status: "deferred"
      naturalHeightPt: null
      evidence: { inlineIds: string[]; reason: "page-number-requires-generated-expansion" }
    }

export interface FlowDocCanonicalReportZoneFlowV1 {
  sectionId: string
  zoneId: string
  zoneRole: ZoneRoleV4Target
  entries: FlowDocCanonicalReportFlowEntryV1[]
  readyNodeCount: number
  deferredNodeCount: number
  naturalHeightWithoutSpacingPt: number
  interBlockSpacing: "not-bound"
  coordinates: "not-assigned"
}

export interface FlowDocCanonicalReportMeasuredCompositionBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_VERSION
  kind: "canonical-report-measured-composition-bundle"
  phaseId: "PDF-PILOT-08B-R2C-F"
  sourceProjectionFingerprint: string
  sourceNativeShapingFingerprint: string
  sourceLineBreakingFingerprint: string
  planFingerprint: string
  measurementProfileId: string
  coreAcceptedConsumers: FlowDocCanonicalReportCoreAcceptedConsumerV1[]
  documentBlocks: FlowDocCanonicalReportMeasuredDocumentBlockV1[]
  fixedImageBlocks: FlowDocCanonicalReportFixedImageBlockV1[]
  preparedTables: FlowDocCanonicalReportPreparedTableV1[]
  zoneFlows: FlowDocCanonicalReportZoneFlowV1[]
  downstreamBlockers: Array<{
    code: "inter-block-spacing-not-bound" | "generated-page-number-not-expanded" | "page-capacity-not-composed"
    blocks: "vertical-placement" | "footer-final-measurement" | "pagination"
    message: string
  }>
  ownership: {
    preparationOwns: [
      "core-measured-line-acceptance",
      "natural-text-block-height",
      "fixed-image-frame-height",
      "table-text-fragment-evidence",
      "prepared-table-cells",
      "prepared-table-rows",
      "natural-whole-row-height",
      "ordered-zone-flow-inventory",
    ]
    preparationMustNotOwn: [
      "inter-block-spacing",
      "x-y-placement",
      "page-assignment",
      "header-row-repetition",
      "row-fragment-splitting",
      "pagination",
      "pdf-bytes",
    ]
  }
  execution: {
    lineBreaking: "consumed"
    coreMeasuredLineAcceptance: "accepted"
    documentBlockHeights: "derived"
    fixedImageFrameHeights: "derived"
    tableTextFragments: "accepted"
    tableCells: "prepared"
    tableRows: "prepared"
    zoneFlowOrder: "inventoried"
    interBlockSpacing: "not-run"
    verticalPlacement: "not-run"
    tablePagination: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    sourceConsumerCount: number
    coreAcceptedConsumerCount: number
    coreAcceptedLineCount: number
    documentBlockCount: number
    documentBlockLineCount: number
    fixedImageBlockCount: number
    preparedTableCount: number
    preparedRowCount: number
    preparedCellCount: number
    tableTextLineCandidateCount: number
    multiLineTableCellCount: number
    emptyLineTableCellCount: number
    flowNodeCount: number
    readyFlowNodeCount: number
    deferredGeneratedFlowNodeCount: number
    bodyReadyFlowNodeCount: number
    headerReadyFlowNodeCount: number
    footerDeferredFlowNodeCount: number
    naturalDocumentBlockHeightPt: number
    naturalFixedImageHeightPt: number
    naturalTableHeightPt: number
    naturalReadyFlowHeightWithoutSpacingPt: number
    minimumNaturalRowHeightPt: number
    maximumNaturalRowHeightPt: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportMeasuredCompositionIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportMeasuredCompositionValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportMeasuredCompositionBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportMeasuredCompositionIssueV1[]; summary: null }

interface AcceptedConsumerInternal {
  consumer: FlowDocCanonicalReportNativeShapingConsumerV1
  request: VNextTextBlockV4MeasurementRequest
  measurement: FlowDocCanonicalReportLineMeasurementV1
  measured: AcceptedMeasuredLines
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportMeasuredCompositionBundleV1["ownership"] = {
  preparationOwns: [
    "core-measured-line-acceptance",
    "natural-text-block-height",
    "fixed-image-frame-height",
    "table-text-fragment-evidence",
    "prepared-table-cells",
    "prepared-table-rows",
    "natural-whole-row-height",
    "ordered-zone-flow-inventory",
  ],
  preparationMustNotOwn: [
    "inter-block-spacing",
    "x-y-placement",
    "page-assignment",
    "header-row-repetition",
    "row-fragment-splitting",
    "pagination",
    "pdf-bytes",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportMeasuredCompositionBundleV1["execution"] = {
  lineBreaking: "consumed",
  coreMeasuredLineAcceptance: "accepted",
  documentBlockHeights: "derived",
  fixedImageFrameHeights: "derived",
  tableTextFragments: "accepted",
  tableCells: "prepared",
  tableRows: "prepared",
  zoneFlowOrder: "inventoried",
  interBlockSpacing: "not-run",
  verticalPlacement: "not-run",
  tablePagination: "not-run",
  pagination: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportMeasuredCompositionBundleV1["downstreamBlockers"] = [
  {
    code: "inter-block-spacing-not-bound",
    blocks: "vertical-placement",
    message: "Natural block and table heights are ready, but section and sibling spacing policy is not bound.",
  },
  {
    code: "generated-page-number-not-expanded",
    blocks: "footer-final-measurement",
    message: "Twelve footer blocks still require generated page-number expansion before final footer measurement.",
  },
  {
    code: "page-capacity-not-composed",
    blocks: "pagination",
    message: "Ordered flow is inventoried without page capacity, y placement, row splitting, or header repetition.",
  },
]

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function roundPt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function unitToPt(value: { value: number; unit: "pt" | "mm" }): number {
  return roundPt(value.unit === "pt" ? value.value : (value.value * 72) / 25.4)
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function requireZoneRole(value: string): ZoneRoleV4Target {
  requireFact(
    value === "body"
      || value === "header"
      || value === "footer"
      || value === "first-page-header"
      || value === "first-page-footer",
    `unsupported zone role: ${value}`,
  )
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportMeasuredCompositionIssueV1 {
  return { code, path, message, severity: "error" }
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]
  return copy
}

function validateSources(input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1): string[] {
  const errors: string[] = []
  if (input.projection.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.nativeShaping.bundleFingerprint !== ACCEPTED_NATIVE_SHAPING_FINGERPRINT) errors.push("R2C-D native shaping fingerprint drifted")
  if (input.lineBreaking.bundleFingerprint !== ACCEPTED_LINE_BREAKING_FINGERPRINT) errors.push("R2C-E line-breaking fingerprint drifted")
  if (input.projection.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.projection, "bundleFingerprint")))) errors.push("R2C-C projection fingerprint does not match content")
  if (input.nativeShaping.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.nativeShaping, "bundleFingerprint")))) errors.push("R2C-D native shaping fingerprint does not match content")
  if (input.lineBreaking.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(input.lineBreaking, "bundleFingerprint")))) errors.push("R2C-E line-breaking fingerprint does not match content")
  if (input.nativeShaping.sourceProjectionFingerprint !== input.projection.bundleFingerprint) errors.push("R2C-D does not consume the accepted projection")
  if (input.lineBreaking.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) errors.push("R2C-E does not consume the accepted native shaping bundle")
  if (input.lineBreaking.measurementProfileId !== input.nativeShaping.measurementProfileId) errors.push("measurement profile identity drifted")
  if (input.lineBreaking.summary.measurementGlyphCount !== input.lineBreaking.summary.coveredGlyphCount) errors.push("R2C-E glyph coverage is incomplete")
  if (input.lineBreaking.summary.overflowLineCount !== 0) errors.push("R2C-E retains overflowing lines")
  if (input.nativeShaping.consumers.length !== input.projection.summary.totalReadyRequestCount) errors.push("consumer/request coverage drifted")
  return errors
}

function createPlan(input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1): FlowDocCanonicalReportMeasuredCompositionPlanV1 {
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-measured-composition-plan" as const,
    compositionId: FLOWDOC_CANONICAL_REPORT_MEASURED_COMPOSITION_ID,
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    measurementProfileId: input.lineBreaking.measurementProfileId,
    consumerBindings: input.nativeShaping.consumers.map((consumer) => ({
      consumerId: consumer.consumerId,
      sourceRequestFingerprint: consumer.sourceRequestFingerprint,
      measurementVariantId: consumer.measurementVariantId,
      lane: consumer.source.lane,
      textBlockId: consumer.source.textBlockId,
    })),
    tableBindings: input.projection.tableMeasurements.map((table) => {
      const projected = input.projection.projectedTables.find((candidate) => candidate.projectionId === table.projectionId)
      requireFact(projected != null, `projected table is missing: ${table.projectionId}`)
      return {
        projectionId: table.projectionId,
        tableId: table.tableId,
        geometryFingerprint: table.geometry.geometry.fingerprint,
        sourceRowCount: projected.resolution.materializedContent.rows.length,
      }
    }),
    flowBindings: input.projection.projectedInstanceDocument.document.sections.flatMap((section) => (
      section.zoneIds.map((zoneId) => {
        const zone = section.nodes[zoneId]
        requireFact(zone?.type === "zone", `zone is missing: ${section.id}:${zoneId}`)
        return { sectionId: section.id, zoneRole: zone.role, childIds: [...zone.childIds] }
      })
    )),
  }
  return { ...unsigned, planFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportMeasuredCompositionPlanV1(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
): FlowDocCanonicalReportMeasuredCompositionPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

function requestForConsumer(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
  consumer: FlowDocCanonicalReportNativeShapingConsumerV1,
): VNextTextBlockV4MeasurementRequest {
  const source = consumer.source
  if (source.lane === "projected-document-text") {
    const matches = input.projection.documentRequests.filter((entry) => (
      entry.sectionId === source.sectionId
      && entry.zoneRole === source.zoneRole
      && entry.textBlockId === source.textBlockId
      && entry.projectionTitle === source.projectionTitle
    ))
    requireFact(matches.length === 1, `document request is not unique: ${consumer.consumerId}`)
    return matches[0].request
  }

  const table = input.projection.tableMeasurements.find((entry) => (
    entry.projectionId === source.projectionId
    && entry.tableId === source.tableId
    && entry.sectionId === source.sectionId
  ))
  requireFact(table != null, `table measurement is missing: ${consumer.consumerId}`)
  const preparation = source.lane === "projected-table-authored-text"
    ? table.authoredPreparation
    : table.materializedPreparation
  const context = preparation.requestsByTextBlockId[source.textBlockId]
  requireFact(context != null, `table request is missing: ${consumer.consumerId}`)
  requireFact(context.rowIndex === source.rowIndex, `table request row drifted: ${consumer.consumerId}`)
  requireFact(context.sourceCellId === source.sourceCellId, `table request cell drifted: ${consumer.consumerId}`)
  return context.request
}

function acceptConsumers(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
): AcceptedConsumerInternal[] {
  const measurementById = new Map(input.lineBreaking.measurements.map((measurement) => (
    [measurement.measurementVariantId, measurement]
  )))
  return input.nativeShaping.consumers.map((consumer) => {
    const request = requestForConsumer(input, consumer)
    const measurement = measurementById.get(consumer.measurementVariantId)
    requireFact(measurement != null, `line measurement is missing: ${consumer.measurementVariantId}`)
    requireFact(request.measurementProfileId === measurement.measurementProfileId, `measurement profile drifted: ${consumer.consumerId}`)
    requireFact(request.styleKey === measurement.styleKey, `measurement style drifted: ${consumer.consumerId}`)
    requireFact(request.availableWidthPt === measurement.availableWidthPt, `measurement width drifted: ${consumer.consumerId}`)
    requireFact(request.renderedText === measurement.renderedText, `measurement text drifted: ${consumer.consumerId}`)
    requireFact(measurement.lineBoxes.every((line) => line.widthPt <= request.availableWidthPt + 0.000001), `line overflow retained: ${consumer.consumerId}`)
    const measured = acceptVNextTextBlockV4MeasuredLines(request, measurement.lineBoxes.map((line) => ({
      index: line.lineIndex,
      startOffset: line.startOffset,
      endOffset: line.endOffset,
      text: request.renderedText.slice(line.startOffset, line.endOffset),
      widthPt: line.widthPt,
      heightPt: line.heightPt,
    })))
    requireFact(measured.status === "accepted", `Core measured-line acceptance blocked: ${consumer.consumerId}`)
    requireFact(measured.summary.totalHeightPt === roundPt(measurement.lineBoxes.reduce((total, line) => total + line.heightPt, 0)), `Core height drifted: ${consumer.consumerId}`)
    return { consumer, request: clone(request), measurement, measured }
  })
}

function textEvidenceFor(
  preparation: VNextTableTextMeasurementPreparationResultV1,
  accepted: readonly AcceptedConsumerInternal[],
  lane: TableConsumerSource["lane"],
  projectionId: string,
): ReadyTextFragmentEvidence {
  requireFact(preparation.status === "ready", `table preparation is blocked: ${projectionId}:${lane}`)
  const byTextBlockId = new Map(accepted
    .filter((item) => item.consumer.source.lane === lane && item.consumer.source.projectionId === projectionId)
    .map((item) => [item.request.textBlockId, item]))
  const evidenceByTextBlockId = Object.fromEntries(Object.keys(preparation.requestsByTextBlockId).map((textBlockId) => {
    const item = byTextBlockId.get(textBlockId)
    requireFact(item != null, `accepted table measurement is missing: ${projectionId}:${textBlockId}`)
    return [textBlockId, { request: clone(item.request), measured: clone(item.measured) }]
  }))
  requireFact(byTextBlockId.size === Object.keys(evidenceByTextBlockId).length, `unexpected table measurement evidence: ${projectionId}:${lane}`)
  const evidence = createVNextTableTextFragmentEvidenceV1({ preparation, evidenceByTextBlockId })
  requireFact(evidence.status === "ready", `Core table text evidence blocked: ${projectionId}:${lane}`)
  return evidence
}

function naturalRowHeight(
  row: VNextTablePreparedRowV1,
  consumerIds: string[],
): FlowDocCanonicalReportNaturalRowHeightV1 {
  const naturalWholeRowHeightPt = roundPt(Math.max(row.minimumFirstFragmentHeightPt, row.maximumCellOuterHeightPt))
  const tallestSourceCellIds = row.cells
    .filter((cell) => Math.abs(cell.outerHeightPt - row.maximumCellOuterHeightPt) <= 0.000001)
    .map((cell) => cell.sourceCellId)
  const textLineCandidateCount = row.cells.reduce(
    (total, cell) => total + cell.candidates.filter((candidate) => candidate.kind === "text-line").length,
    0,
  )
  const multiLineCellCount = row.cells.filter((cell) => (
    cell.candidates.filter((candidate) => candidate.kind === "text-line").length > 1
  )).length
  const emptyLineCellCount = row.cells.filter((cell) => (
    cell.candidates.length === 1
    && cell.candidates[0]?.kind === "text-line"
    && cell.candidates[0].text.length === 0
  )).length
  const rowIdentity = row.kind === "prepared-authored-row"
    ? { kind: "authored-row" as const, sourceRowId: row.sourceRowId }
    : { kind: "resolved-row" as const, rowInstanceId: row.rowInstanceId, itemKey: row.itemKey }
  const unsigned = {
    rowIndex: row.rowIndex,
    rowIdentity,
    role: row.role,
    breakPolicy: row.breakPolicy,
    minimumFirstFragmentHeightPt: row.minimumFirstFragmentHeightPt,
    maximumCellOuterHeightPt: row.maximumCellOuterHeightPt,
    naturalWholeRowHeightPt,
    cellCount: row.cells.length,
    textLineCandidateCount,
    multiLineCellCount,
    emptyLineCellCount,
    tallestSourceCellIds,
    consumerIds,
    rowFingerprint: row.fingerprint,
  }
  return { ...unsigned, heightFingerprint: sha256(JSON.stringify(unsigned)) }
}

function prepareTables(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
  accepted: readonly AcceptedConsumerInternal[],
): FlowDocCanonicalReportPreparedTableV1[] {
  const resolvedDocument = input.projection.scopedResolution.resolvedDocument
  return input.projection.tableMeasurements.map((table) => {
    const projected = input.projection.projectedTables.find((item) => item.projectionId === table.projectionId)
    requireFact(projected != null, `projected table is missing: ${table.projectionId}`)
    const authoredEvidence = textEvidenceFor(
      table.authoredPreparation,
      accepted,
      "projected-table-authored-text",
      table.projectionId,
    )
    const materializedEvidence = textEvidenceFor(
      table.materializedPreparation,
      accepted,
      "projected-table-materialized-text",
      table.projectionId,
    )
    const definition = projected.resolution.definition
    const materialization = projected.resolution.materializedContent
    const authoredCells = createVNextTablePreparedAuthoredCellsV1({
      definition,
      materialization,
      geometry: table.geometry,
      resolvedDocument,
      textEvidence: authoredEvidence,
    })
    requireFact(authoredCells.status === "ready", `authored cells blocked: ${table.projectionId}`)
    const materializedCells = createVNextTablePreparedMaterializedCellsV1({
      definition,
      materialization,
      geometry: table.geometry,
      textEvidence: materializedEvidence,
    })
    requireFact(materializedCells.status === "ready", `materialized cells blocked: ${table.projectionId}`)
    const preparedRows = createVNextTablePreparedRowsV1({ materialization, authoredCells, materializedCells })
    requireFact(preparedRows.status === "ready", `prepared rows blocked: ${table.projectionId}`)
    const tableConsumers = accepted.filter((item) => (
      item.consumer.source.lane !== "projected-document-text"
      && item.consumer.source.projectionId === table.projectionId
    ))
    const naturalRows = preparedRows.rows.map((row) => naturalRowHeight(
      row,
      tableConsumers
        .filter((item) => (item.consumer.source as TableConsumerSource).rowIndex === row.rowIndex)
        .map((item) => item.consumer.consumerId),
    ))
    requireFact(naturalRows.every((row) => row.consumerIds.length === row.cellCount), `row consumer coverage drifted: ${table.projectionId}`)
    const rowHeights = naturalRows.map((row) => row.naturalWholeRowHeightPt)
    return {
      projectionId: table.projectionId,
      collectionFieldKey: table.collectionFieldKey,
      sectionId: table.sectionId,
      tableId: table.tableId,
      tableContentWidthPt: table.tableContentWidthPt,
      geometryFingerprint: table.geometry.geometry.fingerprint,
      authoredTextEvidenceFingerprint: sha256(JSON.stringify(authoredEvidence)),
      materializedTextEvidenceFingerprint: sha256(JSON.stringify(materializedEvidence)),
      preparedRows,
      naturalRows,
      summary: {
        rowCount: naturalRows.length,
        authoredRowCount: preparedRows.work.authoredRowCount,
        materializedRowCount: preparedRows.work.materializedRowCount,
        cellCount: preparedRows.work.cellCount,
        textLineCandidateCount: naturalRows.reduce((total, row) => total + row.textLineCandidateCount, 0),
        multiLineCellCount: naturalRows.reduce((total, row) => total + row.multiLineCellCount, 0),
        emptyLineCellCount: naturalRows.reduce((total, row) => total + row.emptyLineCellCount, 0),
        naturalTableHeightPt: roundPt(rowHeights.reduce((total, height) => total + height, 0)),
        minimumNaturalRowHeightPt: Math.min(...rowHeights),
        maximumNaturalRowHeightPt: Math.max(...rowHeights),
      },
    }
  })
}

function fixedImages(input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1): FlowDocCanonicalReportFixedImageBlockV1[] {
  const bindingByPlacementId = new Map(input.projection.scopedResolution.resolvedDocument.bindings.images.map((binding) => (
    [binding.placementId, binding]
  )))
  return input.projection.projectedInstanceDocument.document.sections.flatMap((section) => (
    Object.values(section.nodes).flatMap((node) => {
      if (node.type !== "image") return []
      requireFact(node.source.kind === "image-field-ref", `canonical image source is unsupported: ${node.id}`)
      const binding = bindingByPlacementId.get(node.id)
      requireFact(binding != null && binding.assetId != null && binding.assetOwner === "instance-media", `canonical image binding is missing: ${node.id}`)
      const widthPt = unitToPt(node.props.frame.width)
      const heightPt = unitToPt(node.props.frame.height)
      return [{
        sectionId: section.id,
        zoneRole: "body" as const,
        imageId: node.id,
        fieldKey: node.source.fieldKey,
        assetId: binding.assetId,
        assetOwner: "instance-media" as const,
        widthPt,
        heightPt,
        fit: node.props.frame.fit,
        align: node.props.align ?? "left",
        naturalHeightPt: heightPt,
      }]
    })
  ))
}

function zoneFlows(input: {
  source: FlowDocCanonicalReportMeasuredCompositionSourceInputV1
  documentBlocks: readonly FlowDocCanonicalReportMeasuredDocumentBlockV1[]
  images: readonly FlowDocCanonicalReportFixedImageBlockV1[]
  tables: readonly FlowDocCanonicalReportPreparedTableV1[]
}): FlowDocCanonicalReportZoneFlowV1[] {
  const documentById = new Map(input.documentBlocks.map((block) => [`${block.sectionId}|${block.textBlockId}`, block]))
  const imageById = new Map(input.images.map((image) => [`${image.sectionId}|${image.imageId}`, image]))
  const tableById = new Map(input.tables.map((table) => [`${table.sectionId}|${table.tableId}`, table]))
  const deferralById = new Map(input.source.projection.generatedInlineDeferrals.map((deferral) => (
    [`${deferral.sectionId}|${deferral.textBlockId}`, deferral]
  )))
  return input.source.projection.projectedInstanceDocument.document.sections.flatMap((section) => (
    section.zoneIds.map((zoneId) => {
      const zone = section.nodes[zoneId]
      requireFact(zone?.type === "zone", `zone is missing: ${section.id}:${zoneId}`)
      const entries = zone.childIds.map((nodeId, nodeIndex): FlowDocCanonicalReportFlowEntryV1 => {
        const node = section.nodes[nodeId]
        requireFact(node != null, `flow node is missing: ${section.id}:${nodeId}`)
        if (node.type === "text-block") {
          const block = documentById.get(`${section.id}|${nodeId}`)
          if (block != null) return {
            nodeIndex,
            nodeId,
            kind: "measured-text-block",
            status: "ready",
            naturalHeightPt: block.naturalHeightPt,
            evidence: { consumerId: block.consumerId, measurementVariantId: block.measurementVariantId },
          }
          const deferral = deferralById.get(`${section.id}|${nodeId}`)
          requireFact(deferral != null, `text flow evidence is missing: ${section.id}:${nodeId}`)
          return {
            nodeIndex,
            nodeId,
            kind: "generated-text-deferred",
            status: "deferred",
            naturalHeightPt: null,
            evidence: { inlineIds: [...deferral.inlineIds], reason: deferral.reason },
          }
        }
        if (node.type === "table") {
          const table = tableById.get(`${section.id}|${nodeId}`)
          requireFact(table != null, `prepared table flow evidence is missing: ${section.id}:${nodeId}`)
          return {
            nodeIndex,
            nodeId,
            kind: "prepared-table",
            status: "ready",
            naturalHeightPt: table.summary.naturalTableHeightPt,
            evidence: { projectionId: table.projectionId, preparedRowsFingerprint: table.preparedRows.fingerprint },
          }
        }
        if (node.type === "image") {
          const image = imageById.get(`${section.id}|${nodeId}`)
          requireFact(image != null, `fixed image flow evidence is missing: ${section.id}:${nodeId}`)
          return {
            nodeIndex,
            nodeId,
            kind: "fixed-image",
            status: "ready",
            naturalHeightPt: image.naturalHeightPt,
            evidence: { assetId: image.assetId },
          }
        }
        throw new Error(`unsupported top-level flow node: ${section.id}:${nodeId}:${node.type}`)
      })
      return {
        sectionId: section.id,
        zoneId,
        zoneRole: zone.role,
        entries,
        readyNodeCount: entries.filter((entry) => entry.status === "ready").length,
        deferredNodeCount: entries.filter((entry) => entry.status === "deferred").length,
        naturalHeightWithoutSpacingPt: roundPt(entries.reduce(
          (total, entry) => total + (entry.naturalHeightPt ?? 0),
          0,
        )),
        interBlockSpacing: "not-bound" as const,
        coordinates: "not-assigned" as const,
      }
    })
  ))
}

function buildBundle(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
): FlowDocCanonicalReportMeasuredCompositionBundleV1 {
  const plan = createPlan(input)
  const accepted = acceptConsumers(input)
  const coreAcceptedConsumers = accepted.map((item): FlowDocCanonicalReportCoreAcceptedConsumerV1 => ({
    consumerId: item.consumer.consumerId,
    source: clone(item.consumer.source),
    sourceRequestFingerprint: item.consumer.sourceRequestFingerprint,
    measurementVariantId: item.consumer.measurementVariantId,
    lineMeasurementFingerprint: sha256(JSON.stringify(item.measurement)),
    coreAcceptanceFingerprint: sha256(JSON.stringify(item.measured)),
    lineCount: item.measured.summary.lineCount,
    totalHeightPt: roundPt(item.measured.summary.totalHeightPt),
    coreStatus: "accepted",
  }))
  const documentBlocks = accepted
    .filter((item) => item.consumer.source.lane === "projected-document-text")
    .map((item): FlowDocCanonicalReportMeasuredDocumentBlockV1 => {
      const source = item.consumer.source as Extract<FlowDocCanonicalReportNativeShapingConsumerSourceV1, { lane: "projected-document-text" }>
      return {
        consumerId: item.consumer.consumerId,
        sectionId: source.sectionId,
        zoneRole: requireZoneRole(source.zoneRole),
        textBlockId: source.textBlockId,
        projectionTitle: source.projectionTitle,
        measurementVariantId: item.consumer.measurementVariantId,
        request: clone(item.request),
        measured: clone(item.measured),
        naturalHeightPt: roundPt(item.measured.summary.totalHeightPt),
      }
    })
  const images = fixedImages(input)
  const tables = prepareTables(input, accepted)
  const flows = zoneFlows({ source: input, documentBlocks, images, tables })
  const tableSummaries = tables.map((table) => table.summary)
  const rowHeights = tables.flatMap((table) => table.naturalRows.map((row) => row.naturalWholeRowHeightPt))
  const flowEntries = flows.flatMap((flow) => flow.entries)
  const unsigned: Omit<FlowDocCanonicalReportMeasuredCompositionBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-measured-composition-bundle",
    phaseId: "PDF-PILOT-08B-R2C-F",
    sourceProjectionFingerprint: input.projection.bundleFingerprint,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceLineBreakingFingerprint: input.lineBreaking.bundleFingerprint,
    planFingerprint: plan.planFingerprint,
    measurementProfileId: input.lineBreaking.measurementProfileId,
    coreAcceptedConsumers,
    documentBlocks,
    fixedImageBlocks: images,
    preparedTables: tables,
    zoneFlows: flows,
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      sourceConsumerCount: input.nativeShaping.consumers.length,
      coreAcceptedConsumerCount: coreAcceptedConsumers.length,
      coreAcceptedLineCount: coreAcceptedConsumers.reduce((total, consumer) => total + consumer.lineCount, 0),
      documentBlockCount: documentBlocks.length,
      documentBlockLineCount: documentBlocks.reduce((total, block) => total + block.measured.summary.lineCount, 0),
      fixedImageBlockCount: images.length,
      preparedTableCount: tables.length,
      preparedRowCount: tableSummaries.reduce((total, summary) => total + summary.rowCount, 0),
      preparedCellCount: tableSummaries.reduce((total, summary) => total + summary.cellCount, 0),
      tableTextLineCandidateCount: tableSummaries.reduce((total, summary) => total + summary.textLineCandidateCount, 0),
      multiLineTableCellCount: tableSummaries.reduce((total, summary) => total + summary.multiLineCellCount, 0),
      emptyLineTableCellCount: tableSummaries.reduce((total, summary) => total + summary.emptyLineCellCount, 0),
      flowNodeCount: flowEntries.length,
      readyFlowNodeCount: flowEntries.filter((entry) => entry.status === "ready").length,
      deferredGeneratedFlowNodeCount: flowEntries.filter((entry) => entry.status === "deferred").length,
      bodyReadyFlowNodeCount: flows.filter((flow) => flow.zoneRole === "body").reduce((total, flow) => total + flow.readyNodeCount, 0),
      headerReadyFlowNodeCount: flows.filter((flow) => flow.zoneRole === "header").reduce((total, flow) => total + flow.readyNodeCount, 0),
      footerDeferredFlowNodeCount: flows.filter((flow) => flow.zoneRole === "footer").reduce((total, flow) => total + flow.deferredNodeCount, 0),
      naturalDocumentBlockHeightPt: roundPt(documentBlocks.reduce((total, block) => total + block.naturalHeightPt, 0)),
      naturalFixedImageHeightPt: roundPt(images.reduce((total, image) => total + image.naturalHeightPt, 0)),
      naturalTableHeightPt: roundPt(tableSummaries.reduce((total, summary) => total + summary.naturalTableHeightPt, 0)),
      naturalReadyFlowHeightWithoutSpacingPt: roundPt(flows.reduce((total, flow) => total + flow.naturalHeightWithoutSpacingPt, 0)),
      minimumNaturalRowHeightPt: Math.min(...rowHeights),
      maximumNaturalRowHeightPt: Math.max(...rowHeights),
    },
  }
  requireFact(unsigned.summary.sourceConsumerCount === unsigned.summary.coreAcceptedConsumerCount, "every source consumer must pass Core measurement acceptance")
  requireFact(unsigned.summary.preparedCellCount === input.projection.summary.authoredTableRequestCount + input.projection.summary.materializedTableRequestCount, "every table request must prepare one cell")
  requireFact(unsigned.summary.readyFlowNodeCount + unsigned.summary.deferredGeneratedFlowNodeCount === unsigned.summary.flowNodeCount, "every top-level flow node must be ready or explicitly deferred")
  requireFact(unsigned.summary.naturalReadyFlowHeightWithoutSpacingPt === roundPt(
    unsigned.summary.naturalDocumentBlockHeightPt
    + unsigned.summary.naturalFixedImageHeightPt
    + unsigned.summary.naturalTableHeightPt,
  ), "natural flow height must reconcile all ready block families")
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportMeasuredCompositionBundleV1(
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
): FlowDocCanonicalReportMeasuredCompositionBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input)
}

export function validateFlowDocCanonicalReportMeasuredCompositionBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
): FlowDocCanonicalReportMeasuredCompositionValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportMeasuredCompositionBundleV1
  const issues: FlowDocCanonicalReportMeasuredCompositionIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-measured-composition-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-F") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceProjectionFingerprint !== input.projection.bundleFingerprint) issues.push(issue("source-projection-fingerprint", "sourceProjectionFingerprint", "R2C-C source fingerprint differs"))
  if (bundle.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) issues.push(issue("source-native-fingerprint", "sourceNativeShapingFingerprint", "R2C-D source fingerprint differs"))
  if (bundle.sourceLineBreakingFingerprint !== input.lineBreaking.bundleFingerprint) issues.push(issue("source-line-breaking-fingerprint", "sourceLineBreakingFingerprint", "R2C-E source fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "measured composition ownership drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "measured composition execution drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "measured composition blockers drifted"))
  for (const forbidden of ["pagePlacements", "pages", "pagination", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `measured composition bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportMeasuredCompositionBundleV1
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
    issue("canonical-bundle-drift", "", "measured composition bundle differs from deterministic source evidence"),
  )
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
