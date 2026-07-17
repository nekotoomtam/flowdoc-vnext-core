import { createHash } from "node:crypto"
import {
  DocumentNodeV4TargetSchema,
  VNextPublishedTableContentBindingContractV1Schema,
  VNextTableDefinitionV1Schema,
  createVNextTableAuthoredTextMeasurementPreparationV1,
  createVNextTableCellGeometryV1,
  createVNextTableTextMeasurementPreparationV1,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  resolveVNextScopedDocumentV1,
  type AuthoredNodeV4Target,
  type DocumentNodeV4Target,
  type VNextPublishedTableContentBindingContractV1,
  type VNextResolvedProjectionInputV1,
  type VNextTableCellGeometryResultV1,
  type VNextTableDefinitionV1,
  type VNextTableTextMeasurementPreparationResultV1,
  type VNextTextBlockV4MeasurementRequest,
  type ZoneRoleV4Target,
} from "@flowdoc/vnext-core"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "./canonicalReportDataAdapter.js"
import {
  validateFlowDocCanonicalReportDisplayFormattingBundleV1,
  type FlowDocCanonicalReportDisplayFormattingBundleV1,
} from "./canonicalReportDisplayFormatting.js"
import {
  validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocFontAssetManifestV1,
} from "./canonicalReportMeasurementRequestHandoff.js"
import {
  createFlowDocCanonicalReportResolutionInputFingerprintV1,
  resolveFlowDocCanonicalReportCollectionsV1,
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportResolvedTableV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "./canonicalReportTemplateResolution.js"

export const FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_ID = "ocr-benchmark-report-table-projection-v1" as const

const ACCEPTED_DATA_BUNDLE_FINGERPRINT = "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d"
const ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT = "a64f2f945a23ecbc75d7210512d96a594a0b84b50dc03a1089bfc5b90ecadcdb"
const ACCEPTED_FORMATTING_BUNDLE_FINGERPRINT = "41877d47ea365f01790faf3041a610629489931ad1fe1aa6d88e2389ed8a5d0d"
const ACCEPTED_MEASUREMENT_HANDOFF_FINGERPRINT = "1a2868d58fb52e62ae6d6a1002460ba81bd019b57b1d328828a89c41ef73a84f"
const TABLE_WIDTH_MM = 175
const MAX_PROJECTED_COLUMNS = 6
const MIN_COLUMN_WIDTH_SHARE = 10

export interface FlowDocCanonicalReportProjectionColumnV1 {
  fieldKey: string
  headerLabel: string
  widthShare: number
  coverageRole: "primary" | "context"
}

export interface FlowDocCanonicalReportProjectionViewV1 {
  projectionId: string
  viewLabel: string
  columns: FlowDocCanonicalReportProjectionColumnV1[]
}

export interface FlowDocCanonicalReportCollectionProjectionV1 {
  collectionFieldKey: string
  sourceTableId: string
  views: FlowDocCanonicalReportProjectionViewV1[]
}

export interface FlowDocCanonicalReportTableProjectionContractV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_VERSION
  kind: "canonical-report-table-projection-contract"
  projectionContractId: typeof FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_ID
  collections: FlowDocCanonicalReportCollectionProjectionV1[]
  requirements: {
    everySourceItemFieldHasExactlyOnePrimaryPlacement: true
    repeatedContextMustAlsoHavePrimaryPlacement: true
    maximumColumnsPerView: typeof MAX_PROJECTED_COLUMNS
    minimumColumnWidthShare: typeof MIN_COLUMN_WIDTH_SHARE
    tableWidthMm: typeof TABLE_WIDTH_MM
    sourceCollectionContractMutation: false
  }
}

export interface FlowDocCanonicalReportProjectedTableV1 {
  projectionId: string
  viewLabel: string
  columns: FlowDocCanonicalReportProjectionColumnV1[]
  resolution: FlowDocCanonicalReportResolvedTableV1
}

type ReadyTableGeometry = Extract<VNextTableCellGeometryResultV1, { status: "ready" }>
type ReadyTablePreparation = Extract<VNextTableTextMeasurementPreparationResultV1, { status: "ready" }>

export interface FlowDocCanonicalReportProjectedTableMeasurementV1 {
  projectionId: string
  collectionFieldKey: string
  sectionId: string
  tableId: string
  tableContentWidthPt: number
  formattedBindingCount: number
  geometry: ReadyTableGeometry
  authoredPreparation: ReadyTablePreparation
  materializedPreparation: ReadyTablePreparation
}

export interface FlowDocCanonicalReportProjectedDocumentMeasurementRequestV1 {
  lane: "projected-document-text"
  sectionId: string
  zoneRole: ZoneRoleV4Target
  textBlockId: string
  projectionTitle: boolean
  displayBindingInlineIds: string[]
  request: VNextTextBlockV4MeasurementRequest
}

export interface FlowDocCanonicalReportProjectedGeneratedDeferralV1 {
  lane: "generated-inline-deferred"
  sectionId: string
  zoneRole: ZoneRoleV4Target
  textBlockId: string
  inlineIds: string[]
  reason: "page-number-requires-generated-expansion"
  measurement: "not-run"
}

type ProjectedScopedResolution = Extract<ReturnType<typeof resolveVNextScopedDocumentV1>, { status: "resolved" }>

export interface FlowDocCanonicalReportTableProjectionBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_VERSION
  kind: "canonical-report-table-projection-bundle"
  phaseId: "PDF-PILOT-08B-R2C-C"
  sourceDataBundleFingerprint: string
  sourceTemplateBundleFingerprint: string
  sourceFormattingBundleFingerprint: string
  sourceMeasurementHandoffFingerprint: string
  projectionContract: FlowDocCanonicalReportTableProjectionContractV1
  projectionContractFingerprint: string
  resolutionInputFingerprint: string
  projectedInstanceDocument: DocumentNodeV4Target
  scopedResolution: ProjectedScopedResolution
  projectedTables: FlowDocCanonicalReportProjectedTableV1[]
  documentRequests: FlowDocCanonicalReportProjectedDocumentMeasurementRequestV1[]
  generatedInlineDeferrals: FlowDocCanonicalReportProjectedGeneratedDeferralV1[]
  tableMeasurements: FlowDocCanonicalReportProjectedTableMeasurementV1[]
  ownership: {
    projectionOwns: ["presentation-table-groups", "view-labels", "column-selection", "column-width-shares", "context-repetition"]
    projectionMustNotOwn: ["source-collection-shapes", "source-values", "display-value-formatting", "text-measurement-results", "layout", "pagination", "pdf-bytes"]
  }
  execution: {
    tableProjection: "projected"
    scalarImageResolution: "resolved"
    collectionContentMaterialization: "materialized"
    localeDisplayFormatting: "consumed"
    tableGeometry: "prepared"
    measurementRequests: "prepared"
    textShaping: "not-run"
    lineBreaking: "not-run"
    lineBoxes: "not-run"
    layout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    sourceCollectionCount: number
    sourceItemFieldCount: number
    sourceCollectionRowCount: number
    projectionTableCount: number
    projectionPrimaryColumnCount: number
    projectionContextColumnCount: number
    projectionColumnCount: number
    maximumProjectedColumnCount: number
    projectedCollectionRowCount: number
    projectedItemBindingCount: number
    tableCellGeometryCount: number
    documentRequestCount: number
    projectionTitleRequestCount: number
    authoredTableRequestCount: number
    materializedTableRequestCount: number
    totalReadyRequestCount: number
    generatedInlineDeferredBlockCount: number
    minimumCellContentWidthPt: number
    maximumCellContentWidthPt: number
    sourceMinimumCellContentWidthPt: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportTableProjectionIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportTableProjectionValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportTableProjectionBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportTableProjectionIssueV1[]; summary: null }

function column(
  fieldKey: string,
  headerLabel: string,
  widthShare: number,
  coverageRole: "primary" | "context" = "primary",
): FlowDocCanonicalReportProjectionColumnV1 {
  return { fieldKey, headerLabel, widthShare, coverageRole }
}

const PROJECTION_CONTRACT: FlowDocCanonicalReportTableProjectionContractV1 = {
  contractVersion: 1,
  kind: "canonical-report-table-projection-contract",
  projectionContractId: FLOWDOC_CANONICAL_REPORT_TABLE_PROJECTION_ID,
  collections: [
    {
      collectionFieldKey: "report.ocr_runs",
      sourceTableId: "table-ocr-runs",
      views: [
        {
          projectionId: "ocr-run-context",
          viewLabel: "ข้อมูลรอบ OCR",
          columns: [
            column("engine", "Engine", 16), column("provider", "Provider", 12),
            column("run_id", "Run ID", 30), column("round", "รอบ", 10),
            column("order", "ลำดับ", 16), column("pages", "หน้า", 16),
          ],
        },
        {
          projectionId: "ocr-confidence",
          viewLabel: "ปริมาณข้อความและ Confidence",
          columns: [
            column("engine", "Engine", 18, "context"), column("words", "จำนวนคำ", 14),
            column("average_confidence", "Conf. เฉลี่ย", 17), column("minimum_confidence", "Conf. ต่ำสุด", 17),
            column("low_confidence_words", "คำ Conf. ต่ำ", 18), column("bbox_coverage", "BBox coverage", 16),
          ],
        },
        {
          projectionId: "ocr-quality",
          viewLabel: "ความแม่นยำและข้อมูลสำคัญ",
          columns: [
            column("engine", "Engine", 20, "context"), column("character_accuracy", "Character", 20),
            column("word_accuracy", "Word", 20), column("critical_values_found", "ค่าที่พบ", 20),
            column("critical_values_total", "ค่าทั้งหมด", 20),
          ],
        },
        {
          projectionId: "ocr-runtime-cost",
          viewLabel: "เวลา ขนาดผลลัพธ์ และต้นทุน OCR",
          columns: [
            column("engine", "Engine", 20, "context"), column("latency_ms", "เวลา", 20),
            column("response_bytes", "ขนาดผลลัพธ์", 22), column("cost_usd", "USD", 19),
            column("cost_thb", "บาท", 19),
          ],
        },
      ],
    },
    {
      collectionFieldKey: "report.native_runs",
      sourceTableId: "table-native-runs",
      views: [
        {
          projectionId: "native-run-context",
          viewLabel: "ข้อมูลรอบ Native Extraction",
          columns: [
            column("engine", "Engine", 16), column("provider", "Provider", 12),
            column("run_id", "Run ID", 30), column("round", "รอบ", 10),
            column("order", "ลำดับ", 16), column("pages", "หน้า", 16),
          ],
        },
        {
          projectionId: "native-confidence",
          viewLabel: "ปริมาณข้อความและ Confidence",
          columns: [
            column("engine", "Engine", 18, "context"), column("words", "จำนวนคำ", 14),
            column("average_confidence", "Conf. เฉลี่ย", 17), column("minimum_confidence", "Conf. ต่ำสุด", 17),
            column("low_confidence_words", "คำ Conf. ต่ำ", 18), column("bbox_coverage", "BBox coverage", 16),
          ],
        },
        {
          projectionId: "native-structure-inventory",
          viewLabel: "โครงสร้างที่ตรวจพบ",
          columns: [
            column("engine", "Engine", 22, "context"), column("non_empty_key_values", "Key-value", 30),
            column("table_count", "ตาราง", 22), column("table_cell_count", "เซลล์ตาราง", 26),
          ],
        },
        {
          projectionId: "native-structure-coverage",
          viewLabel: "Coverage ของข้อมูลเชิงโครงสร้าง",
          columns: [
            column("engine", "Engine", 25, "context"), column("structured_concepts_found", "Concept ที่พบ", 25),
            column("structured_concepts_total", "Concept ทั้งหมด", 25),
            column("structured_concept_coverage", "Coverage", 25),
          ],
        },
        {
          projectionId: "native-runtime-cost",
          viewLabel: "เวลา ขนาดผลลัพธ์ และต้นทุน Native",
          columns: [
            column("engine", "Engine", 20, "context"), column("latency_ms", "เวลา", 20),
            column("response_bytes", "ขนาดผลลัพธ์", 22), column("cost_usd", "USD", 19),
            column("cost_thb", "บาท", 19),
          ],
        },
      ],
    },
    {
      collectionFieldKey: "report.mapping_fields",
      sourceTableId: "table-mapping-fields",
      views: [
        {
          projectionId: "mapping-comparison",
          viewLabel: "ผล Mapping เทียบค่าที่คาดหวัง",
          columns: [
            column("engine", "Engine", 14), column("schema_path", "Schema path", 28),
            column("expected_value_text", "ค่าที่คาดหวัง", 22), column("value_text", "ค่าที่ Mapping", 22),
            column("correct", "ถูกต้อง", 14),
          ],
        },
        {
          projectionId: "mapping-evidence",
          viewLabel: "หลักฐานที่ใช้ Mapping",
          columns: [
            column("engine", "Engine", 15, "context"), column("schema_path", "Schema path", 35, "context"),
            column("source_label", "Source label", 25), column("confidence", "Confidence", 15),
            column("page", "หน้า", 10),
          ],
        },
      ],
    },
    {
      collectionFieldKey: "report.native_missing_concepts",
      sourceTableId: "table-native-missing-concepts",
      views: [{
        projectionId: "native-missing-concepts",
        viewLabel: "Concept ที่ Native Extraction ยังไม่พบ",
        columns: [column("engine", "Engine", 30), column("concept_id", "Concept", 70)],
      }],
    },
    {
      collectionFieldKey: "report.runs",
      sourceTableId: "table-runs",
      views: [
        {
          projectionId: "run-status",
          viewLabel: "สถานะและความถูกต้องของ Run",
          columns: [
            column("round", "รอบ", 10), column("provider", "Provider", 14),
            column("run_id", "Run ID", 30), column("status", "สถานะ", 16),
            column("source_hash_matches", "Source hash", 20), column("error_count", "Error", 10),
          ],
        },
        {
          projectionId: "run-engines-pages",
          viewLabel: "Engine และจำนวนหน้าต่อ Run",
          columns: [
            column("run_id", "Run ID", 30, "context"), column("order", "ลำดับ", 10),
            column("ocr_engine", "OCR engine", 18), column("native_engine", "Native engine", 18),
            column("ocr_pages", "หน้า OCR", 12), column("native_pages", "หน้า Native", 12),
          ],
        },
      ],
    },
    {
      collectionFieldKey: "report.gdim_expected_fields",
      sourceTableId: "table-gdim-expected-fields",
      views: [{
        projectionId: "gdim-expected-fields",
        viewLabel: "ฟิลด์ GDIM ที่คาดหวัง",
        columns: [column("schema_path", "Schema path", 40), column("expected_value_text", "ค่าที่คาดหวัง", 60)],
      }],
    },
  ],
  requirements: {
    everySourceItemFieldHasExactlyOnePrimaryPlacement: true,
    repeatedContextMustAlsoHavePrimaryPlacement: true,
    maximumColumnsPerView: MAX_PROJECTED_COLUMNS,
    minimumColumnWidthShare: MIN_COLUMN_WIDTH_SHARE,
    tableWidthMm: TABLE_WIDTH_MM,
    sourceCollectionContractMutation: false,
  },
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportTableProjectionBundleV1["ownership"] = {
  projectionOwns: ["presentation-table-groups", "view-labels", "column-selection", "column-width-shares", "context-repetition"],
  projectionMustNotOwn: ["source-collection-shapes", "source-values", "display-value-formatting", "text-measurement-results", "layout", "pagination", "pdf-bytes"],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportTableProjectionBundleV1["execution"] = {
  tableProjection: "projected",
  scalarImageResolution: "resolved",
  collectionContentMaterialization: "materialized",
  localeDisplayFormatting: "consumed",
  tableGeometry: "prepared",
  measurementRequests: "prepared",
  textShaping: "not-run",
  lineBreaking: "not-run",
  lineBoxes: "not-run",
  layout: "not-run",
  pagination: "not-run",
  pdfRendering: "not-run",
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

function slug(value: string): string {
  return value.replace(/^report\./, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()
}

function mm(value: number): { value: number; unit: "mm" } {
  return { value, unit: "mm" }
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: { value: number; unit: "pt" | "mm" }): number {
  return value.unit === "pt" ? value.value : (value.value * 72) / 25.4
}

function issue(
  code: string,
  path: string,
  message: string,
): FlowDocCanonicalReportTableProjectionIssueV1 {
  return { code, path, message, severity: "error" }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function sameStringSet(left: string[], right: string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
}

function addNode(nodes: Record<string, AuthoredNodeV4Target>, node: AuthoredNodeV4Target): string {
  requireFact(nodes[node.id] == null, `duplicate projected node ${node.id}`)
  nodes[node.id] = node
  return node.id
}

function textBlock(
  id: string,
  text: string,
  styleKey: string,
  role: "paragraph" | "label" = "paragraph",
): Extract<AuthoredNodeV4Target, { type: "text-block" }> {
  return {
    id,
    type: "text-block",
    role: { role },
    props: { textStyleId: styleKey },
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function validateProjectionContract(
  contract: FlowDocCanonicalReportTableProjectionContractV1,
  dataBundle: FlowDocCanonicalReportDataBundleV1,
): FlowDocCanonicalReportTableProjectionIssueV1[] {
  const issues: FlowDocCanonicalReportTableProjectionIssueV1[] = []
  const sourceCollections = Object.keys(dataBundle.collectionItemContract.collections)
  if (!sameStringSet(contract.collections.map((item) => item.collectionFieldKey), sourceCollections)) issues.push(issue(
    "collection-coverage", "projectionContract.collections", "projection collections differ from the source collection contract",
  ))
  const projectionIds = new Set<string>()
  contract.collections.forEach((collection, collectionIndex) => {
    const shape = dataBundle.collectionItemContract.collections[collection.collectionFieldKey]
    if (shape == null) {
      issues.push(issue("unknown-collection", `projectionContract.collections[${collectionIndex}]`, "projection references an unknown collection"))
      return
    }
    const primaryCounts = new Map<string, number>()
    const contextKeys = new Set<string>()
    collection.views.forEach((view, viewIndex) => {
      if (projectionIds.has(view.projectionId)) issues.push(issue(
        "duplicate-projection-id", `projectionContract.collections[${collectionIndex}].views[${viewIndex}].projectionId`,
        `projection id ${view.projectionId} is duplicated`,
      ))
      projectionIds.add(view.projectionId)
      if (view.viewLabel.trim().length === 0) issues.push(issue(
        "missing-view-label", `projectionContract.collections[${collectionIndex}].views[${viewIndex}].viewLabel`, "view label must not be blank",
      ))
      if (view.columns.length > MAX_PROJECTED_COLUMNS) issues.push(issue(
        "too-many-columns", `projectionContract.collections[${collectionIndex}].views[${viewIndex}].columns`,
        `projected tables support at most ${MAX_PROJECTED_COLUMNS} columns`,
      ))
      const widthTotal = view.columns.reduce((total, item) => total + item.widthShare, 0)
      if (Math.abs(widthTotal - 100) > 0.000001) issues.push(issue(
        "column-width-total", `projectionContract.collections[${collectionIndex}].views[${viewIndex}].columns`,
        `column width shares must total 100; got ${widthTotal}`,
      ))
      const viewFields = new Set<string>()
      view.columns.forEach((item, columnIndex) => {
        const path = `projectionContract.collections[${collectionIndex}].views[${viewIndex}].columns[${columnIndex}]`
        if (shape.fields[item.fieldKey] == null) issues.push(issue("unknown-item-field", `${path}.fieldKey`, `unknown item field ${item.fieldKey}`))
        if (viewFields.has(item.fieldKey)) issues.push(issue("duplicate-view-field", `${path}.fieldKey`, `field ${item.fieldKey} repeats in one view`))
        viewFields.add(item.fieldKey)
        if (item.headerLabel.trim().length === 0) issues.push(issue("missing-header-label", `${path}.headerLabel`, "header label must not be blank"))
        if (item.widthShare < MIN_COLUMN_WIDTH_SHARE) issues.push(issue(
          "column-too-narrow", `${path}.widthShare`, `column width share must be at least ${MIN_COLUMN_WIDTH_SHARE}`,
        ))
        if (item.coverageRole === "primary") primaryCounts.set(item.fieldKey, (primaryCounts.get(item.fieldKey) ?? 0) + 1)
        else contextKeys.add(item.fieldKey)
      })
    })
    Object.keys(shape.fields).forEach((fieldKey) => {
      if (primaryCounts.get(fieldKey) !== 1) issues.push(issue(
        "primary-field-coverage", `projectionContract.collections[${collectionIndex}]`,
        `source field ${fieldKey} must have exactly one primary placement; got ${primaryCounts.get(fieldKey) ?? 0}`,
      ))
    })
    contextKeys.forEach((fieldKey) => {
      if (primaryCounts.get(fieldKey) !== 1) issues.push(issue(
        "context-without-primary", `projectionContract.collections[${collectionIndex}]`,
        `context field ${fieldKey} must also have one primary placement`,
      ))
    })
  })
  return issues
}

function buildProjectedTableGraph(input: {
  collectionFieldKey: string
  view: FlowDocCanonicalReportProjectionViewV1
  owner: FlowDocCanonicalReportDataBundleV1["structureVersion"]
}): {
  titleId: string
  tableId: string
  nodes: Record<string, AuthoredNodeV4Target>
  definition: VNextTableDefinitionV1
  bindingContract: VNextPublishedTableContentBindingContractV1
} {
  const tableId = `table-${slug(input.collectionFieldKey)}-${input.view.projectionId}`
  const titleId = `${tableId}-projection-title`
  const headerRowId = `${tableId}-header-row`
  const bodyRowId = `${tableId}-body-row-template`
  const headerTemplateId = `${tableId}-header-template`
  const bodyTemplateId = `${tableId}-body-template`
  const nodes: Record<string, AuthoredNodeV4Target> = {}
  const headerCellIds: string[] = []
  const bodyCellIds: string[] = []
  const placements: VNextPublishedTableContentBindingContractV1["rowTemplates"][string]["placements"] = {}
  addNode(nodes, textBlock(titleId, input.view.viewLabel, "table-header", "label"))

  input.view.columns.forEach((projectionColumn) => {
    const fieldSlug = slug(projectionColumn.fieldKey)
    const headerCellId = `${tableId}-header-cell-${fieldSlug}`
    const bodyCellId = `${tableId}-body-cell-${fieldSlug}`
    const headerTextId = `${headerCellId}-text`
    const bodyTextId = `${bodyCellId}-text`
    const valueId = `${bodyTextId}-value`
    headerCellIds.push(headerCellId)
    bodyCellIds.push(bodyCellId)
    addNode(nodes, { id: headerCellId, type: "table-cell", props: { verticalAlign: "middle" }, childIds: [headerTextId] })
    addNode(nodes, textBlock(headerTextId, projectionColumn.headerLabel, "table-header", "label"))
    addNode(nodes, { id: bodyCellId, type: "table-cell", props: { verticalAlign: "top" }, childIds: [bodyTextId] })
    addNode(nodes, {
      id: bodyTextId,
      type: "text-block",
      role: { role: "paragraph" },
      props: { textStyleId: "table-body" },
      children: [{ id: valueId, type: "field-ref", key: projectionColumn.fieldKey, label: projectionColumn.headerLabel }],
    })
    placements[valueId] = {
      sourcePlacementId: valueId,
      placementKind: "text-field-ref",
      binding: {
        scope: "collection-item-field",
        collectionFieldKey: input.collectionFieldKey,
        itemFieldKey: projectionColumn.fieldKey,
      },
    }
  })
  addNode(nodes, { id: headerRowId, type: "table-row", props: { allowBreak: false }, cellIds: headerCellIds })
  addNode(nodes, { id: bodyRowId, type: "table-row", props: { allowBreak: true }, cellIds: bodyCellIds })
  addNode(nodes, {
    id: tableId,
    type: "table",
    props: { headerRowCount: 1, repeatHeaderRows: true, align: "left" },
    columns: input.view.columns.map((item) => ({ width: mm(TABLE_WIDTH_MM * item.widthShare / 100) })),
    rowIds: [headerRowId, bodyRowId],
  })

  const definition = VNextTableDefinitionV1Schema.parse({
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: `${tableId}-definition-v1`,
    owner: { kind: "published-structure-version", ref: clone(input.owner) },
    tableId,
    headerPolicy: "repeat-leading-headers",
    columns: input.view.columns.map((item) => ({ columnId: `${tableId}-column-${slug(item.fieldKey)}`, widthShare: item.widthShare })),
    rowSources: [
      { kind: "static-row", rowSourceId: `${tableId}-header-source`, rowTemplateId: headerTemplateId, role: "header" },
      {
        kind: "collection-rows",
        rowSourceId: `${tableId}-body-source`,
        collectionFieldKey: input.collectionFieldKey,
        rowTemplateId: bodyTemplateId,
        role: "body",
        emptyPolicy: { kind: "header-only" },
      },
    ],
    rowTemplates: {
      [headerTemplateId]: {
        rowTemplateId: headerTemplateId,
        sourceRowId: headerRowId,
        breakPolicy: "strict-keep",
        cells: headerCellIds.map((cellId, index) => ({ cellId, columnStart: index, colSpan: 1, rowSpan: 1 })),
      },
      [bodyTemplateId]: {
        rowTemplateId: bodyTemplateId,
        sourceRowId: bodyRowId,
        breakPolicy: "prefer-keep",
        cells: bodyCellIds.map((cellId, index) => ({ cellId, columnStart: index, colSpan: 1, rowSpan: 1 })),
      },
    },
  })
  const bindingContract = VNextPublishedTableContentBindingContractV1Schema.parse({
    contractVersion: 1,
    kind: "published-table-content-binding-contract",
    tableContentBindingContractId: `${tableId}-content-bindings-v1`,
    owner: clone(input.owner),
    tableDefinitionId: definition.tableDefinitionId,
    tableId,
    rowTemplates: { [bodyTemplateId]: { rowTemplateId: bodyTemplateId, placements } },
  })
  return { titleId, tableId, nodes, definition, bindingContract }
}

function childIds(node: AuthoredNodeV4Target): string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function collectSubtreeIds(section: DocumentNodeV4Target["document"]["sections"][number], rootId: string): string[] {
  const ids: string[] = []
  const visit = (nodeId: string): void => {
    const node = section.nodes[nodeId]
    if (node == null) return
    ids.push(nodeId)
    childIds(node).forEach(visit)
  }
  visit(rootId)
  return ids
}

function buildProjectedDocument(input: {
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  dataBundle: FlowDocCanonicalReportDataBundleV1
  contract: FlowDocCanonicalReportTableProjectionContractV1
}) {
  const document = clone(input.templateBundle.instanceDocument)
  const tableContracts: Array<{
    projectionId: string
    viewLabel: string
    columns: FlowDocCanonicalReportProjectionColumnV1[]
    collectionFieldKey: string
    definition: VNextTableDefinitionV1
    bindingContract: VNextPublishedTableContentBindingContractV1
  }> = []
  input.contract.collections.forEach((collection) => {
    const sourceSections = document.document.sections.filter((section) => section.nodes[collection.sourceTableId]?.type === "table")
    requireFact(sourceSections.length === 1, `source table ${collection.sourceTableId} must occur once`)
    const section = sourceSections[0]
    const parentZones = Object.values(section.nodes).filter(
      (node): node is Extract<AuthoredNodeV4Target, { type: "zone" }> => node.type === "zone" && node.childIds.includes(collection.sourceTableId),
    )
    requireFact(parentZones.length === 1, `source table ${collection.sourceTableId} must have one zone parent`)
    const projectedIds: string[] = []
    collection.views.forEach((view) => {
      const graph = buildProjectedTableGraph({ collectionFieldKey: collection.collectionFieldKey, view, owner: input.dataBundle.structureVersion })
      Object.values(graph.nodes).forEach((node) => {
        requireFact(section.nodes[node.id] == null, `projected node ${node.id} collides in ${section.id}`)
        section.nodes[node.id] = node
      })
      projectedIds.push(graph.titleId, graph.tableId)
      tableContracts.push({
        projectionId: view.projectionId,
        viewLabel: view.viewLabel,
        columns: clone(view.columns),
        collectionFieldKey: collection.collectionFieldKey,
        definition: graph.definition,
        bindingContract: graph.bindingContract,
      })
    })
    const parent = parentZones[0]
    parent.childIds = parent.childIds.flatMap((nodeId) => nodeId === collection.sourceTableId ? projectedIds : [nodeId])
    collectSubtreeIds(section, collection.sourceTableId).forEach((nodeId) => delete section.nodes[nodeId])
  })
  return { document: DocumentNodeV4TargetSchema.parse(document), tableContracts }
}

function displayResolvedDocument(input: {
  scopedResolution: ProjectedScopedResolution
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
}) {
  const resolved = clone(input.scopedResolution.resolvedDocument)
  const formattedByInlineId = new Map(input.formattingBundle.documentBindings.map((binding) => [binding.inlineId, binding]))
  resolved.bindings.fields.forEach((binding) => {
    const formatted = formattedByInlineId.get(binding.inlineId)
    requireFact(formatted != null, `missing projected document display binding ${binding.inlineId}`)
    requireFact(formatted.fieldKey === binding.fieldKey && formatted.rawResolvedValue === binding.value, `projected document display lineage drifted for ${binding.inlineId}`)
    binding.value = formatted.displayText
  })
  return resolved
}

function createDocumentRequests(input: {
  scopedResolution: ProjectedScopedResolution
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  sourceMeasurement: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
}) {
  const resolved = displayResolvedDocument({ scopedResolution: input.scopedResolution, formattingBundle: input.formattingBundle })
  const textBindings = Object.fromEntries(resolved.bindings.fields.map((binding) => [
    binding.inlineId,
    { fieldKey: binding.fieldKey, value: binding.value },
  ]))
  const imageBindings = Object.fromEntries(resolved.bindings.images.map((binding) => [
    binding.placementId,
    { assetId: binding.assetId },
  ]))
  const styleByTextBlockId = new Map(resolved.bindings.styles.map((binding) => [binding.textBlockId, binding.styleKey]))
  const bodyWidthBySection = new Map(input.sourceMeasurement.pageGeometry.sections.map((section) => [section.sectionId, section.bodyWidthPt]))
  const formattedInlineIds = new Set(input.formattingBundle.documentBindings.map((binding) => binding.inlineId))
  const documentRequests: FlowDocCanonicalReportProjectedDocumentMeasurementRequestV1[] = []
  const generatedInlineDeferrals: FlowDocCanonicalReportProjectedGeneratedDeferralV1[] = []

  resolved.document.document.sections.forEach((section) => {
    const bodyWidthPt = bodyWidthBySection.get(section.id)
    requireFact(bodyWidthPt != null, `missing source page geometry for ${section.id}`)
    const visited = new Set<string>()
    const visit = (nodeId: string, zoneRole: ZoneRoleV4Target, availableWidthPt: number): void => {
      const node = section.nodes[nodeId]
      requireFact(node != null, `projected document node ${nodeId} is missing`)
      if (node.type === "table") return
      if (node.type !== "text-block") {
        childIds(node).forEach((id) => visit(id, zoneRole, availableWidthPt))
        return
      }
      requireFact(!visited.has(node.id), `projected text block ${node.id} occurs more than once`)
      visited.add(node.id)
      const generatedIds = node.children.filter((inline) => inline.type === "page-number").map((inline) => inline.id)
      if (generatedIds.length > 0) {
        generatedInlineDeferrals.push({
          lane: "generated-inline-deferred",
          sectionId: section.id,
          zoneRole,
          textBlockId: node.id,
          inlineIds: generatedIds,
          reason: "page-number-requires-generated-expansion",
          measurement: "not-run",
        })
        return
      }
      const styleKey = styleByTextBlockId.get(node.id)
      requireFact(styleKey != null, `projected style binding is missing for ${node.id}`)
      const request = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
        documentId: resolved.instanceId,
        instanceRevision: resolved.instanceRevision,
        sectionId: section.id,
        textBlock: node,
        availableWidthPt,
        measurementProfileId: input.sourceMeasurement.measurementProfile.measurementProfileId,
        styleKey,
        resolvedTextByInlineId: textBindings,
        resolvedImageByPlacementId: imageBindings,
      })
      requireFact(request.status === "ready", `projected document request blocked for ${node.id}`)
      documentRequests.push({
        lane: "projected-document-text",
        sectionId: section.id,
        zoneRole,
        textBlockId: node.id,
        projectionTitle: node.id.endsWith("-projection-title"),
        displayBindingInlineIds: request.request.runs
          .filter((run) => run.kind === "resolved-field" && formattedInlineIds.has(run.inlineId))
          .map((run) => run.inlineId),
        request: request.request,
      })
    }
    section.zoneIds.forEach((zoneId) => {
      const zone = section.nodes[zoneId]
      requireFact(zone?.type === "zone", `projected zone ${zoneId} is missing`)
      const widthPt = zone.role === "body" || section.page.headerFooterHorizontalMode !== "full"
        ? bodyWidthPt
        : input.sourceMeasurement.pageGeometry.widthPt
      zone.childIds.forEach((id) => visit(id, zone.role, widthPt))
    })
  })
  return { displayResolved: resolved, documentRequests, generatedInlineDeferrals }
}

function tableSectionId(document: DocumentNodeV4Target, tableId: string): string {
  const sections = document.document.sections.filter((section) => section.nodes[tableId]?.type === "table")
  requireFact(sections.length === 1, `projected table ${tableId} must occur in exactly one section`)
  return sections[0].id
}

function tableContentWidthPt(document: DocumentNodeV4Target, sectionId: string, tableId: string): number {
  const table = document.document.sections.find((section) => section.id === sectionId)?.nodes[tableId]
  requireFact(table?.type === "table", `projected table ${tableId} is missing`)
  return roundPt(table.columns.reduce((total, item) => total + unitToPt(item.width), 0))
}

function collectionDisplayMap(formatting: FlowDocCanonicalReportDisplayFormattingBundleV1) {
  return new Map(formatting.collectionTables.flatMap((table) => table.bindings.map((binding) => [
    `${table.collectionFieldKey}|${binding.itemKey}|${binding.fieldKey}`,
    binding,
  ] as const)))
}

function createTableMeasurements(input: {
  document: DocumentNodeV4Target
  projectedTables: FlowDocCanonicalReportProjectedTableV1[]
  displayResolved: ReturnType<typeof displayResolvedDocument>
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  sourceMeasurement: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
  styleCatalog: FlowDocCanonicalReportTemplateResolutionBundleV1["styleCatalog"]
}): FlowDocCanonicalReportProjectedTableMeasurementV1[] {
  const displayBySource = collectionDisplayMap(input.formattingBundle)
  return input.projectedTables.map((table) => {
    const resolution = table.resolution
    const sectionId = tableSectionId(input.document, resolution.definition.tableId)
    const widthPt = tableContentWidthPt(input.document, sectionId, resolution.definition.tableId)
    const geometry = createVNextTableCellGeometryV1({
      contractVersion: 1,
      kind: "table-cell-geometry-request",
      definition: resolution.definition,
      tableContentWidthPt: widthPt,
      layoutProfile: input.sourceMeasurement.tableLayoutProfile,
    })
    requireFact(geometry.status === "ready", `projected geometry blocked for ${table.projectionId}`)
    const displayMaterialization = clone(resolution.materializedContent)
    displayMaterialization.bindings.text.forEach((binding) => {
      requireFact(typeof binding.itemKey === "string", `projected item key is missing for ${binding.resolvedPlacementId}`)
      const formatted = displayBySource.get(`${resolution.collectionFieldKey}|${binding.itemKey}|${binding.fieldKey}`)
      requireFact(formatted != null, `projected display value is missing for ${resolution.collectionFieldKey}.${binding.itemKey}.${binding.fieldKey}`)
      requireFact(formatted.rawResolvedValue === binding.value, `projected raw value drifted for ${binding.resolvedPlacementId}`)
      binding.value = formatted.displayText
    })
    const authoredPreparation = createVNextTableAuthoredTextMeasurementPreparationV1({
      definition: resolution.definition,
      materialization: displayMaterialization,
      geometry,
      resolvedDocument: input.displayResolved,
      measurementProfileId: input.sourceMeasurement.measurementProfile.measurementProfileId,
    })
    requireFact(authoredPreparation.status === "ready", `projected authored preparation blocked for ${table.projectionId}`)
    const materializedPreparation = createVNextTableTextMeasurementPreparationV1({
      definition: resolution.definition,
      materialization: displayMaterialization,
      geometry,
      styleCatalog: input.styleCatalog,
      sectionId,
      measurementProfileId: input.sourceMeasurement.measurementProfile.measurementProfileId,
    })
    requireFact(materializedPreparation.status === "ready", `projected materialized preparation blocked for ${table.projectionId}`)
    return {
      projectionId: table.projectionId,
      collectionFieldKey: resolution.collectionFieldKey,
      sectionId,
      tableId: resolution.definition.tableId,
      tableContentWidthPt: widthPt,
      formattedBindingCount: displayMaterialization.bindings.text.length,
      geometry,
      authoredPreparation,
      materializedPreparation,
    }
  })
}

function withoutFingerprint(
  bundle: FlowDocCanonicalReportTableProjectionBundleV1,
): Omit<FlowDocCanonicalReportTableProjectionBundleV1, "bundleFingerprint"> {
  const { bundleFingerprint: _fingerprint, ...unsigned } = bundle
  return unsigned
}

function validateSources(input: {
  dataBundle: FlowDocCanonicalReportDataBundleV1
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  measurementHandoff: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
  fontManifest: FlowDocFontAssetManifestV1
}): string[] {
  const errors: string[] = []
  if (validateFlowDocCanonicalReportDataBundleV1(input.dataBundle).status !== "valid") errors.push("R2A data bundle is invalid")
  if (validateFlowDocCanonicalReportTemplateResolutionBundleV1(input.templateBundle).status !== "valid") errors.push("R2B template bundle is invalid")
  if (validateFlowDocCanonicalReportDisplayFormattingBundleV1(input.formattingBundle, input.dataBundle, input.templateBundle).status !== "valid") errors.push("R2C-A formatting bundle is invalid")
  if (validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    input.measurementHandoff,
    input.dataBundle,
    input.templateBundle,
    input.formattingBundle,
    input.fontManifest,
  ).status !== "valid") errors.push("R2C-B measurement handoff is invalid")
  if (input.dataBundle.bundleFingerprint !== ACCEPTED_DATA_BUNDLE_FINGERPRINT) errors.push("R2A data fingerprint drifted")
  if (input.templateBundle.bundleFingerprint !== ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT) errors.push("R2B template fingerprint drifted")
  if (input.formattingBundle.bundleFingerprint !== ACCEPTED_FORMATTING_BUNDLE_FINGERPRINT) errors.push("R2C-A formatting fingerprint drifted")
  if (input.measurementHandoff.bundleFingerprint !== ACCEPTED_MEASUREMENT_HANDOFF_FINGERPRINT) errors.push("R2C-B measurement fingerprint drifted")
  return errors
}

function buildBundle(input: {
  dataBundle: FlowDocCanonicalReportDataBundleV1
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  measurementHandoff: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
}): FlowDocCanonicalReportTableProjectionBundleV1 {
  const contract = clone(PROJECTION_CONTRACT)
  const contractIssues = validateProjectionContract(contract, input.dataBundle)
  requireFact(contractIssues.length === 0, contractIssues.map((item) => item.message).join("; "))
  const projected = buildProjectedDocument({ templateBundle: input.templateBundle, dataBundle: input.dataBundle, contract })
  const resolutionInputFingerprint = createFlowDocCanonicalReportResolutionInputFingerprintV1(
    input.dataBundle.bundleFingerprint,
    projected.document,
    input.templateBundle.styleCatalog,
    projected.tableContracts,
  )
  const projection: VNextResolvedProjectionInputV1 = {
    contractVersion: 1,
    kind: "resolved-projection-input",
    instance: clone(input.dataBundle.instance),
    document: projected.document,
    published: {
      contractVersion: 1,
      kind: "published-resolution-bundle",
      publishedStructure: clone(input.templateBundle.publishedStructure),
      fieldContract: clone(input.dataBundle.fieldContract),
      styleCatalog: clone(input.templateBundle.styleCatalog),
      staticMedia: clone(input.templateBundle.staticMedia),
    },
    dataSnapshot: clone(input.dataBundle.dataSnapshot),
    instanceMedia: clone(input.dataBundle.mediaSnapshot),
  }
  const scopedResolution = resolveVNextScopedDocumentV1({
    contractVersion: 1,
    kind: "scoped-resolved-projection-input",
    projection,
    tables: projected.tableContracts.map((table) => ({
      definition: table.definition,
      itemContract: input.dataBundle.collectionItemContract,
      bindingContract: table.bindingContract,
    })),
  })
  requireFact(scopedResolution.status === "resolved", `projected scoped resolution blocked: ${scopedResolution.status === "blocked" ? scopedResolution.issues.map((item) => item.message).join("; ") : "unknown"}`)
  const resolvedTables = resolveFlowDocCanonicalReportCollectionsV1(
    projected.document,
    projected.tableContracts,
    input.dataBundle,
    resolutionInputFingerprint,
  )
  const projectedTables = projected.tableContracts.map((table, index): FlowDocCanonicalReportProjectedTableV1 => ({
    projectionId: table.projectionId,
    viewLabel: table.viewLabel,
    columns: clone(table.columns),
    resolution: resolvedTables[index],
  }))
  const documentMeasurements = createDocumentRequests({
    scopedResolution,
    formattingBundle: input.formattingBundle,
    sourceMeasurement: input.measurementHandoff,
  })
  const tableMeasurements = createTableMeasurements({
    document: projected.document,
    projectedTables,
    displayResolved: documentMeasurements.displayResolved,
    formattingBundle: input.formattingBundle,
    sourceMeasurement: input.measurementHandoff,
    styleCatalog: input.templateBundle.styleCatalog,
  })
  const cellWidths = tableMeasurements.flatMap((table) => Object.values(table.geometry.geometry.rowTemplates)
    .flatMap((template) => template.cells.map((cell) => cell.contentWidthPt)))
  const projectionColumns = contract.collections.flatMap((collection) => collection.views.flatMap((view) => view.columns))
  const authoredTableRequestCount = tableMeasurements.reduce((total, table) => total + table.authoredPreparation.work.textMeasurementRequestCount, 0)
  const materializedTableRequestCount = tableMeasurements.reduce((total, table) => total + table.materializedPreparation.work.textMeasurementRequestCount, 0)
  const unsigned: Omit<FlowDocCanonicalReportTableProjectionBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-table-projection-bundle",
    phaseId: "PDF-PILOT-08B-R2C-C",
    sourceDataBundleFingerprint: input.dataBundle.bundleFingerprint,
    sourceTemplateBundleFingerprint: input.templateBundle.bundleFingerprint,
    sourceFormattingBundleFingerprint: input.formattingBundle.bundleFingerprint,
    sourceMeasurementHandoffFingerprint: input.measurementHandoff.bundleFingerprint,
    projectionContract: contract,
    projectionContractFingerprint: sha256(JSON.stringify(contract)),
    resolutionInputFingerprint,
    projectedInstanceDocument: projected.document,
    scopedResolution,
    projectedTables,
    documentRequests: documentMeasurements.documentRequests,
    generatedInlineDeferrals: documentMeasurements.generatedInlineDeferrals,
    tableMeasurements,
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      sourceCollectionCount: Object.keys(input.dataBundle.collectionItemContract.collections).length,
      sourceItemFieldCount: Object.values(input.dataBundle.collectionItemContract.collections)
        .reduce((total, shape) => total + Object.keys(shape.fields).length, 0),
      sourceCollectionRowCount: Object.values(input.dataBundle.collectionSnapshot.collections)
        .reduce((total, collection) => total + collection.items.length, 0),
      projectionTableCount: projectedTables.length,
      projectionPrimaryColumnCount: projectionColumns.filter((item) => item.coverageRole === "primary").length,
      projectionContextColumnCount: projectionColumns.filter((item) => item.coverageRole === "context").length,
      projectionColumnCount: projectionColumns.length,
      maximumProjectedColumnCount: Math.max(...contract.collections.flatMap((collection) => collection.views.map((view) => view.columns.length))),
      projectedCollectionRowCount: projectedTables.reduce(
        (total, table) => total + table.resolution.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").length,
        0,
      ),
      projectedItemBindingCount: tableMeasurements.reduce((total, table) => total + table.formattedBindingCount, 0),
      tableCellGeometryCount: cellWidths.length,
      documentRequestCount: documentMeasurements.documentRequests.length,
      projectionTitleRequestCount: documentMeasurements.documentRequests.filter((item) => item.projectionTitle).length,
      authoredTableRequestCount,
      materializedTableRequestCount,
      totalReadyRequestCount: documentMeasurements.documentRequests.length + authoredTableRequestCount + materializedTableRequestCount,
      generatedInlineDeferredBlockCount: documentMeasurements.generatedInlineDeferrals.length,
      minimumCellContentWidthPt: Math.min(...cellWidths),
      maximumCellContentWidthPt: Math.max(...cellWidths),
      sourceMinimumCellContentWidthPt: input.measurementHandoff.summary.minimumCellContentWidthPt,
    },
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function validateFlowDocCanonicalReportTableProjectionBundleV1(
  value: unknown,
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
  measurementHandoff: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  fontManifest: FlowDocFontAssetManifestV1,
): FlowDocCanonicalReportTableProjectionValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportTableProjectionBundleV1
  const issues: FlowDocCanonicalReportTableProjectionIssueV1[] = []
  validateSources({ dataBundle, templateBundle, formattingBundle, measurementHandoff, fontManifest }).forEach((message) => {
    issues.push(issue("invalid-source", "sources", message))
  })
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-table-projection-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-C") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceDataBundleFingerprint !== dataBundle.bundleFingerprint) issues.push(issue("source-data-fingerprint", "sourceDataBundleFingerprint", "R2A source fingerprint differs"))
  if (bundle.sourceTemplateBundleFingerprint !== templateBundle.bundleFingerprint) issues.push(issue("source-template-fingerprint", "sourceTemplateBundleFingerprint", "R2B source fingerprint differs"))
  if (bundle.sourceFormattingBundleFingerprint !== formattingBundle.bundleFingerprint) issues.push(issue("source-formatting-fingerprint", "sourceFormattingBundleFingerprint", "R2C-A source fingerprint differs"))
  if (bundle.sourceMeasurementHandoffFingerprint !== measurementHandoff.bundleFingerprint) issues.push(issue("source-measurement-fingerprint", "sourceMeasurementHandoffFingerprint", "R2C-B source fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "projection ownership boundary drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "projection execution boundary drifted"))
  for (const forbidden of ["pages", "lines", "glyphs", "lineBoxes", "layout", "pdfBytes", "xPt", "yPt"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `projection must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportTableProjectionBundleV1
  try {
    expected = buildBundle({ dataBundle, templateBundle, formattingBundle, measurementHandoff })
  } catch (error) {
    return {
      status: "blocked",
      issues: [issue("expected-bundle-build", "", error instanceof Error ? error.message : "expected bundle build failed")],
      summary: null,
    }
  }
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle)))) issues.push(issue(
    "bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match its content",
  ))
  if (JSON.stringify(withoutFingerprint(bundle)) !== JSON.stringify(withoutFingerprint(expected))) issues.push(issue(
    "canonical-bundle-drift", "", "projection bundle differs from deterministic source projection",
  ))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}

export function createFlowDocCanonicalReportTableProjectionBundleV1(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
  measurementHandoff: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  fontManifest: FlowDocFontAssetManifestV1,
): FlowDocCanonicalReportTableProjectionBundleV1 {
  const sourceErrors = validateSources({ dataBundle, templateBundle, formattingBundle, measurementHandoff, fontManifest })
  requireFact(sourceErrors.length === 0, sourceErrors.join("; "))
  const bundle = buildBundle({ dataBundle, templateBundle, formattingBundle, measurementHandoff })
  const validation = validateFlowDocCanonicalReportTableProjectionBundleV1(
    bundle,
    dataBundle,
    templateBundle,
    formattingBundle,
    measurementHandoff,
    fontManifest,
  )
  requireFact(validation.status === "valid", `generated R2C-C projection is invalid: ${validation.status === "blocked" ? validation.issues.map((item) => item.message).join("; ") : "unknown"}`)
  return bundle
}
