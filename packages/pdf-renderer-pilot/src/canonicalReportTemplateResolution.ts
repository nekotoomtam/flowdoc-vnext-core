import { createHash } from "node:crypto"
import {
  DocumentNodeV4TargetSchema,
  VNextPublishedStaticMediaV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextPublishedStyleCatalogV1Schema,
  VNextTableDefinitionV1Schema,
  VNextPublishedTableContentBindingContractV1Schema,
  createVNextDerivedIdentityProvenanceV1,
  createVNextTableContentSourcePlanV1,
  materializeVNextTableContentV1,
  resolveVNextScopedDocumentV1,
  resolveVNextTableRowsV1,
  validateVNextDocumentV4Structure,
  type AuthoredNodeV4Target,
  type DocumentNodeV4Target,
  type VNextAllocatedIdentityKindV1,
  type VNextAllocatedIdentityV1,
  type VNextDerivedIdentityOriginV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedStaticMediaV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
  type VNextPublishedStyleCatalogV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextResolvedProjectionInputV1,
  type VNextResolvedTableRowsReadyV1,
  type VNextTableCollectionIdentityAssignmentV1,
  type VNextTableContentIdentityAssignmentsV1,
  type VNextTableDefinitionV1,
} from "@flowdoc/vnext-core"
import type { FlowDocCanonicalReportDataBundleV1 } from "./canonicalReportDataAdapter.js"

export const FLOWDOC_CANONICAL_REPORT_TEMPLATE_RESOLUTION_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_TEMPLATE_ID = "ocr-benchmark-canonical-report-template-v1" as const
export const FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1 = {
  source: "reference-pdf-envelope-plus-measured-font-offsets-v1",
  marginPt: { top: 20.65, right: 72.03, bottom: 15.94, left: 72.02 },
  headerReservedPt: 32.22,
  footerReservedPt: 24,
  expectedBodyGeometryPt: {
    originX: 72.02,
    originY: 52.87,
    width: 467.95,
    height: 699.19,
  },
} as const
const ACCEPTED_SOURCE_DATA_BUNDLE_FINGERPRINT = "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d"

const SECTION_SPECS = [
  ["cover", "รายงานเปรียบเทียบ OCR และการจัดโครงสร้างเอกสาร", "Google Cloud Vision / Document AI เทียบกับ Azure Document Intelligence"],
  ["executive-summary", "สรุปสำหรับผู้ตัดสินใจ", "ไม่มี provider หนึ่งชนะทุกด้าน ผลทดสอบแสดง trade-off ที่แตกต่างกัน"],
  ["method", "วิธีทดสอบที่ใช้", "ทั้งสองเจ้าได้รับข้อมูลเดียวกัน ลำดับถูกสลับในแต่ละรอบ และเก็บผลแยกตาม Run ID"],
  ["ocr-accuracy", "ช่วงที่ 1 อ่านข้อความได้ถูกต้องแค่ไหน", "คะแนนรวมข้อความและ reading order หลัง normalize ช่องว่างและวรรคตอน"],
  ["source-evidence", "หลักฐานจากข้อความจริง", "ข้อมูลสำคัญยังอยู่ครบ แม้ reading order และการแบ่งคำจะแตกต่างกัน"],
  ["native-extraction", "ช่วงที่ 2 เข้าใจและจัดข้อมูลได้แค่ไหน", "Coverage วัดจากข้อมูลสำคัญที่ควรจัดเป็นโครงสร้างได้"],
  ["latency-cost-size", "เวลา ราคา และขนาดผลลัพธ์", "รายงานใช้ค่ากลางพร้อมช่วงต่ำสุดและสูงสุดเพื่อไม่ให้ outlier บิดภาพ"],
  ["mapping", "ช่วงที่ 3 นำข้อมูลมาใส่รูปแบบของเราได้แค่ไหน", "ผล Mapping ต้องอ่านร่วมกับข้อจำกัดของตารางและ semantic aliases"],
  ["decision-view", "มุมมองเพื่อการตัดสินใจ", "ควรปรับ Mapper แล้วรันทดสอบชุดเดิมอีกครั้งก่อนเลือก provider"],
  ["limitations", "ข้อจำกัดของรายงาน", "ผลจากเอกสารหลักหนึ่งชุดและสามรอบยังไม่ใช่สถิติระดับ production"],
  ["appendix-runs", "ภาคผนวก A Run ID และหลักฐาน", "ทุก run ต้องใช้ source hash เดียวกัน ประมวลผลครบ และไม่มี error"],
  ["appendix-evidence", "ภาคผนวก B ข้อมูลอ้างอิง", "ข้อมูลชุดนี้เก็บไว้ตรวจสอบย้อนกลับ ไม่ใช่การจัดอันดับผู้ชนะรายเดียว"],
] as const

const TABLE_SECTION: Record<string, string> = {
  "report.runs": "appendix-runs",
  "report.ocr_runs": "ocr-accuracy",
  "report.native_runs": "native-extraction",
  "report.native_missing_concepts": "limitations",
  "report.mapping_fields": "mapping",
  "report.gdim_expected_fields": "appendix-evidence",
}
const REPORT_COLLECTION_KEYS = Object.keys(TABLE_SECTION)
const EXPECTED_OWNERSHIP: FlowDocCanonicalReportTemplateResolutionBundleV1["ownership"] = {
  templateOwns: ["report-prose", "semantic-section-order", "field-placement", "style-selection", "collection-table-shape"],
  templateMustNotOwn: ["source-fact-values", "locale-display-formatting", "line-breaking", "layout-coordinates", "pagination", "pdf-bytes"],
}
const EXPECTED_EXECUTION: FlowDocCanonicalReportTemplateResolutionBundleV1["execution"] = {
  instanceMaterialization: "not-run-existing-revision",
  scalarImageResolution: "resolved",
  collectionRowResolution: "resolved",
  collectionContentMaterialization: "materialized",
  localeDisplayFormatting: "not-run",
  textMeasurement: "not-run",
  lineBreaking: "not-run",
  layout: "not-run",
  pagination: "not-run",
  pdfRendering: "not-run",
}

type ResolvedRows = Extract<ReturnType<typeof resolveVNextTableRowsV1>, { status: "resolved" }>
type MaterializedTable = Extract<ReturnType<typeof materializeVNextTableContentV1>, { status: "materialized" }>

export interface FlowDocCanonicalReportResolvedTableV1 {
  collectionFieldKey: string
  definition: VNextTableDefinitionV1
  bindingContract: VNextPublishedTableContentBindingContractV1
  resolvedRows: ResolvedRows
  materializedContent: MaterializedTable
}

export interface FlowDocCanonicalReportTemplateResolutionBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_TEMPLATE_RESOLUTION_VERSION
  kind: "canonical-report-template-resolution-bundle"
  phaseId: "PDF-PILOT-08B-R2B"
  templateId: typeof FLOWDOC_CANONICAL_REPORT_TEMPLATE_ID
  sourceDataBundleFingerprint: string
  resolutionInputFingerprint: string
  publishedStructure: VNextPublishedStructureVersionIdentityV1
  styleCatalog: VNextPublishedStyleCatalogV1
  staticMedia: VNextPublishedStaticMediaV1
  starterTemplate: DocumentNodeV4Target
  instanceDocument: DocumentNodeV4Target
  scopedResolution: Extract<ReturnType<typeof resolveVNextScopedDocumentV1>, { status: "resolved" }>
  collectionTables: FlowDocCanonicalReportResolvedTableV1[]
  coverage: {
    presentationFieldKeys: string[]
    evidenceOnlyFieldKeys: string[]
    scalarPlacementCount: number
    imagePlacementCount: number
    collectionPlacementCount: number
    collectionItemBindingCount: number
  }
  ownership: {
    templateOwns: ["report-prose", "semantic-section-order", "field-placement", "style-selection", "collection-table-shape"]
    templateMustNotOwn: ["source-fact-values", "locale-display-formatting", "line-breaking", "layout-coordinates", "pagination", "pdf-bytes"]
  }
  execution: {
    instanceMaterialization: "not-run-existing-revision"
    scalarImageResolution: "resolved"
    collectionRowResolution: "resolved"
    collectionContentMaterialization: "materialized"
    localeDisplayFormatting: "not-run"
    textMeasurement: "not-run"
    lineBreaking: "not-run"
    layout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    semanticSectionCount: number
    templateNodeCount: number
    scalarBindingCount: number
    imageBindingCount: number
    styleBindingCount: number
    collectionTableCount: number
    collectionRowCount: number
    collectionCellCount: number
    collectionItemBindingCount: number
    evidenceOnlyFieldCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportTemplateResolutionIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportTemplateResolutionValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportTemplateResolutionBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportTemplateResolutionIssueV1[]; summary: null }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

function slug(value: string): string {
  return value.replace(/^report\./u, "").replace(/[^A-Za-z0-9]+/gu, "-").replace(/^-|-$/gu, "").toLowerCase()
}

function mm(value: number): { value: number; unit: "mm" } {
  return { value, unit: "mm" }
}

function pt(value: number): { value: number; unit: "pt" } {
  return { value, unit: "pt" }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Canonical report template resolution failed: ${message}`)
}

function issue(
  code: string,
  path: string,
  message: string,
): FlowDocCanonicalReportTemplateResolutionIssueV1 {
  return { code, path, message, severity: "error" }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function sameStructureRef(
  left: { structureId: string; structureVersionId: string; versionOrdinal: number },
  right: { structureId: string; structureVersionId: string; versionOrdinal: number },
): boolean {
  return left.structureId === right.structureId
    && left.structureVersionId === right.structureVersionId
    && left.versionOrdinal === right.versionOrdinal
}

function sameStringSet(left: string[], right: string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
}

export function createFlowDocCanonicalReportResolutionInputFingerprintV1(
  sourceDataBundleFingerprint: string,
  template: DocumentNodeV4Target,
  styles: VNextPublishedStyleCatalogV1,
  tables: Array<Pick<FlowDocCanonicalReportResolvedTableV1, "collectionFieldKey" | "definition" | "bindingContract">>,
): string {
  return `report-resolution-${sha256(JSON.stringify({
    sourceDataBundleFingerprint,
    template,
    styleCatalog: styles,
    tables: tables.map((table) => ({
      collectionFieldKey: table.collectionFieldKey,
      definition: table.definition,
      bindingContract: table.bindingContract,
    })),
  })).slice(0, 24)}`
}

function publishedStructure(
  bundle: FlowDocCanonicalReportDataBundleV1,
): VNextPublishedStructureVersionIdentityV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-version",
    ...clone(bundle.structureVersion),
    sourceDraft: {
      structureId: bundle.structureVersion.structureId,
      draftId: "draft-ocr-benchmark-report",
      revision: 1,
    },
  }
}

function styleCatalog(
  bundle: FlowDocCanonicalReportDataBundleV1,
): VNextPublishedStyleCatalogV1 {
  const fontFamilyKey = "ibm-plex-sans-thai"
  const styles = {
    "report-title": { key: "report-title", runStyle: { fontFamilyKey, fontSize: { value: 24, unit: "pt" as const }, fontWeight: "bold" as const, textColor: "1D4ED8" } },
    "section-heading": { key: "section-heading", runStyle: { fontFamilyKey, fontSize: { value: 16, unit: "pt" as const }, fontWeight: "bold" as const, textColor: "2563EB" } },
    "report-body": { key: "report-body", runStyle: { fontFamilyKey, fontSize: { value: 10.5, unit: "pt" as const }, textColor: "111827" } },
    "report-caption": { key: "report-caption", runStyle: { fontFamilyKey, fontSize: { value: 9, unit: "pt" as const }, textColor: "4B5563" } },
    "table-header": { key: "table-header", runStyle: { fontFamilyKey, fontSize: { value: 9.3, unit: "pt" as const }, fontWeight: "bold" as const, textColor: "111827" } },
    "table-body": { key: "table-body", runStyle: { fontFamilyKey, fontSize: { value: 9.1, unit: "pt" as const }, textColor: "111827" } },
  }
  return {
    contractVersion: 1,
    kind: "published-style-catalog",
    catalogId: "styles-ocr-benchmark-report-v1",
    owner: clone(bundle.structureVersion),
    styles,
  }
}

function staticMedia(bundle: FlowDocCanonicalReportDataBundleV1): VNextPublishedStaticMediaV1 {
  return {
    contractVersion: 1,
    kind: "published-static-media",
    mediaRegistryId: "static-media-ocr-benchmark-report-v1",
    owner: clone(bundle.structureVersion),
    registry: { version: 1, images: {} },
  }
}

function sectionForField(key: string): string | null {
  if (key.startsWith("report.truth.critical.")) return null
  if (key === "report.benchmark_id" || key === "report.version" || key === "report.test_date" || key.startsWith("report.source.")) return "cover"
  if (key === "report.metrics_generated_at") return "appendix-runs"
  if (key === "report.truth_method" || key.startsWith("report.settings.") || /^report\.truth\.(?:critical_value_count|native_concept_count|gdim_derivable_field_count)$/u.test(key)) return "method"
  if (key === "report.scope_warning" || key.startsWith("report.validation.")) return "limitations"
  if (key.startsWith("report.total_cost.") || key.startsWith("report.decision.")) return "executive-summary"
  if (key.startsWith("report.media.")) {
    if (key.endsWith("source_evidence")) return "cover"
    if (key.endsWith("ocr_accuracy_chart")) return "ocr-accuracy"
    if (key.endsWith("native_extraction_chart")) return "native-extraction"
    if (key.endsWith("mapping_gap_chart")) return "mapping"
    if (key.endsWith("latency_rounds_chart")) return "latency-cost-size"
  }
  if (TABLE_SECTION[key] != null) return TABLE_SECTION[key]
  if (key.startsWith("report.engine.")) {
    if (key.includes(".mapping.")) return "mapping"
    if (/\.(?:latency_ms\.|response_bytes|cost_usd|cost_thb)/u.test(key)) return "latency-cost-size"
    if (key.includes(".repeatability.")) return "source-evidence"
    if (key.includes("google_vision") || key.includes("azure_document_intelligence.")) {
      return /\.(?:words|low_confidence_words|bbox_coverage)$/u.test(key) ? "source-evidence" : "ocr-accuracy"
    }
    return "native-extraction"
  }
  return null
}

function addNode(
  nodes: Record<string, AuthoredNodeV4Target>,
  node: AuthoredNodeV4Target,
): string {
  requireFact(nodes[node.id] == null, `duplicate template node ${node.id}`)
  nodes[node.id] = node
  return node.id
}

function textBlock(
  id: string,
  text: string,
  styleKey: string,
  role: "paragraph" | "heading" | "caption" | "note" | "label" = "paragraph",
): Extract<AuthoredNodeV4Target, { type: "text-block" }> {
  return {
    id,
    type: "text-block",
    role: role === "heading" ? { role: "heading", level: 1 } : { role },
    props: { textStyleId: styleKey },
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function fieldBlock(
  id: string,
  key: string,
  label: string,
): Extract<AuthoredNodeV4Target, { type: "text-block" }> {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: { textStyleId: "report-body" },
    children: [
      { id: `${id}-label`, type: "text", text: `${label}: ` },
      { id: `${id}-value`, type: "field-ref", key, label },
    ],
  }
}

type NarrativePart =
  | { kind: "text"; text: string }
  | { kind: "field"; key: string }

function narrativeBlock(
  id: string,
  parts: NarrativePart[],
  bundle: FlowDocCanonicalReportDataBundleV1,
): Extract<AuthoredNodeV4Target, { type: "text-block" }> {
  return {
    id,
    type: "text-block",
    role: { role: "note" },
    props: { textStyleId: "report-body" },
    children: parts.map((part, index) => {
      if (part.kind === "text") {
        return { id: `${id}-part-${index}`, type: "text" as const, text: part.text }
      }
      const definition = bundle.fieldContract.registry.fields[part.key]
      requireFact(definition != null && definition.type !== "collection" && definition.type !== "image", `narrative field is not scalar: ${part.key}`)
      return {
        id: `${id}-part-${index}`,
        type: "field-ref" as const,
        key: part.key,
        label: definition.label,
      }
    }),
  }
}

function narrativeLabelBlock(
  id: string,
  text: string,
): Extract<AuthoredNodeV4Target, { type: "text-block" }> {
  return {
    id,
    type: "text-block",
    role: { role: "label" },
    props: { textStyleId: "report-body" },
    children: [{ id: `${id}-text`, type: "text", text, style: { fontWeight: "bold" } }],
  }
}

function readerNarrative(
  sectionId: string,
  bundle: FlowDocCanonicalReportDataBundleV1,
): AuthoredNodeV4Target[] {
  if (sectionId === "executive-summary") {
    return [
      narrativeLabelBlock("executive-summary-reader-label", "ข้อสรุปจากข้อมูลจริง"),
      narrativeBlock("executive-summary-critical-values", [
        { kind: "text", text: "ทั้ง Google Vision และ Azure OCR อ่านค่าธุรกิจสำคัญครบ " },
        { kind: "field", key: "report.engine.google_vision.critical_values_found" },
        { kind: "text", text: " จาก " },
        { kind: "field", key: "report.engine.google_vision.critical_values_total" },
        { kind: "text", text: " ค่า จึงยังไม่มีข้อมูลธุรกิจหลักตกหล่นจาก OCR ทั้งสองเจ้า" },
      ], bundle),
      narrativeBlock("executive-summary-ocr-speed", [
        { kind: "text", text: "Google Vision ใช้เวลากลาง " },
        { kind: "field", key: "report.engine.google_vision.latency_ms.median" },
        { kind: "text", text: " เทียบกับ Azure OCR " },
        { kind: "field", key: "report.engine.azure_document_intelligence.latency_ms.median" },
        { kind: "text", text: " โดยต่างกัน " },
        { kind: "field", key: "report.decision.ocr_latency_delta_ms" },
      ], bundle),
      narrativeBlock("executive-summary-native-coverage", [
        { kind: "text", text: "Google Document AI จัดข้อมูลสำคัญเป็นโครงสร้างได้ " },
        { kind: "field", key: "report.engine.google_document_ai_native.structured_concept_coverage" },
        { kind: "text", text: " ขณะที่ Azure Native ได้ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.structured_concept_coverage" },
      ], bundle),
      narrativeBlock("executive-summary-native-cost", [
        { kind: "text", text: "Azure Native มีต้นทุนประมาณ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.cost_thb" },
        { kind: "text", text: " ต่อเอกสาร เทียบกับ Google Document AI " },
        { kind: "field", key: "report.engine.google_document_ai_native.cost_thb" },
        { kind: "text", text: " หรือต่ำกว่าประมาณ " },
        { kind: "field", key: "report.decision.native_cost_ratio" },
      ], bundle),
      narrativeBlock("executive-summary-mapping-limit", [
        { kind: "text", text: "Mapper ปัจจุบันนำข้อมูลที่ควรอนุมานได้มาใช้ถูกต้องเพียง " },
        { kind: "field", key: "report.engine.google_document_ai_native.mapping.recall" },
        { kind: "text", text: " จาก Google และ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.mapping.recall" },
        { kind: "text", text: " จาก Azure จึงยังไม่ควรตัดสิน provider จากผล GDIM" },
      ], bundle),
    ]
  }
  if (sectionId === "decision-view") {
    return [
      narrativeLabelBlock("decision-view-reader-label", "แนวทางเลือกตามโจทย์"),
      narrativeBlock("decision-view-ocr-speed", [
        { kind: "text", text: "ถ้าเน้นอ่านข้อความเร็ว ให้เริ่มจาก Google Vision ที่ค่ากลาง " },
        { kind: "field", key: "report.engine.google_vision.latency_ms.median" },
        { kind: "text", text: " เทียบ Azure OCR " },
        { kind: "field", key: "report.engine.azure_document_intelligence.latency_ms.median" },
      ], bundle),
      narrativeBlock("decision-view-native-detail", [
        { kind: "text", text: "ถ้าเน้นตารางและรายการสินค้า Google Document AI ครอบคลุม concept " },
        { kind: "field", key: "report.engine.google_document_ai_native.structured_concept_coverage" },
        { kind: "text", text: " และตรวจพบ " },
        { kind: "field", key: "report.engine.google_document_ai_native.table_count" },
        { kind: "text", text: " ตาราง" },
      ], bundle),
      narrativeBlock("decision-view-native-cost", [
        { kind: "text", text: "ถ้าเน้นต้นทุน Native ให้พิจารณา Azure ที่ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.cost_thb" },
        { kind: "text", text: " เทียบกับ Google " },
        { kind: "field", key: "report.engine.google_document_ai_native.cost_thb" },
      ], bundle),
      narrativeBlock("decision-view-response-size", [
        { kind: "text", text: "ถ้าต้องลดขนาดข้อมูลตอบกลับ Azure Native อยู่ที่ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.response_bytes" },
        { kind: "text", text: " เทียบกับ Google Document AI " },
        { kind: "field", key: "report.engine.google_document_ai_native.response_bytes" },
      ], bundle),
      narrativeBlock("decision-view-mapping-gate", [
        { kind: "text", text: "งาน GDIM ยังต้องแก้ Mapper ก่อน เพราะ recall อยู่ที่ " },
        { kind: "field", key: "report.engine.google_document_ai_native.mapping.recall" },
        { kind: "text", text: " และ " },
        { kind: "field", key: "report.engine.azure_document_intelligence_native.mapping.recall" },
        { kind: "text", text: " เท่านั้น" },
      ], bundle),
    ]
  }
  return []
}

function tableGraph(
  collectionFieldKey: string,
  itemShape: FlowDocCanonicalReportDataBundleV1["collectionItemContract"]["collections"][string],
  owner: VNextPublishedStructureVersionRefV1,
): {
  nodes: Record<string, AuthoredNodeV4Target>
  tableId: string
  definition: VNextTableDefinitionV1
  bindingContract: VNextPublishedTableContentBindingContractV1
} {
  const tableSlug = slug(collectionFieldKey)
  const tableId = `table-${tableSlug}`
  const headerRowId = `${tableId}-header-row`
  const bodyRowId = `${tableId}-body-row-template`
  const itemFields = Object.values(itemShape.fields)
  const nodes: Record<string, AuthoredNodeV4Target> = {}
  const headerCellIds: string[] = []
  const bodyCellIds: string[] = []
  const placements: VNextPublishedTableContentBindingContractV1["rowTemplates"][string]["placements"] = {}

  itemFields.forEach((field) => {
    const fieldSlug = slug(field.key)
    const headerCellId = `${tableId}-header-cell-${fieldSlug}`
    const bodyCellId = `${tableId}-body-cell-${fieldSlug}`
    const headerTextId = `${headerCellId}-text`
    const bodyTextId = `${bodyCellId}-text`
    const valueId = `${bodyTextId}-value`
    headerCellIds.push(headerCellId)
    bodyCellIds.push(bodyCellId)
    addNode(nodes, {
      id: headerCellId, type: "table-cell", props: { verticalAlign: "middle" }, childIds: [headerTextId],
    })
    addNode(nodes, textBlock(headerTextId, field.label, "table-header", "label"))
    addNode(nodes, {
      id: bodyCellId, type: "table-cell", props: { verticalAlign: "top" }, childIds: [bodyTextId],
    })
    addNode(nodes, {
      id: bodyTextId,
      type: "text-block",
      role: { role: "paragraph" },
      props: { textStyleId: "table-body" },
      children: [{ id: valueId, type: "field-ref", key: field.key, label: field.label }],
    })
    placements[valueId] = {
      sourcePlacementId: valueId,
      placementKind: "text-field-ref",
      binding: { scope: "collection-item-field", collectionFieldKey, itemFieldKey: field.key },
    }
  })
  addNode(nodes, { id: headerRowId, type: "table-row", props: { allowBreak: false }, cellIds: headerCellIds })
  addNode(nodes, { id: bodyRowId, type: "table-row", props: { allowBreak: true }, cellIds: bodyCellIds })
  addNode(nodes, {
    id: tableId,
    type: "table",
    props: { headerRowCount: 1, repeatHeaderRows: true, align: "left" },
    columns: itemFields.map(() => ({
      width: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.expectedBodyGeometryPt.width / itemFields.length),
    })),
    rowIds: [headerRowId, bodyRowId],
  })

  const headerTemplateId = `${tableId}-header-template`
  const bodyTemplateId = `${tableId}-body-template`
  const definition: VNextTableDefinitionV1 = {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: `${tableId}-definition-v1`,
    owner: { kind: "published-structure-version", ref: clone(owner) },
    tableId,
    headerPolicy: "repeat-leading-headers",
    columns: itemFields.map((field) => ({ columnId: `${tableId}-column-${slug(field.key)}`, widthShare: 100 / itemFields.length })),
    rowSources: [
      { kind: "static-row", rowSourceId: `${tableId}-header-source`, rowTemplateId: headerTemplateId, role: "header" },
      {
        kind: "collection-rows",
        rowSourceId: `${tableId}-body-source`,
        collectionFieldKey,
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
  }
  const bindingContract: VNextPublishedTableContentBindingContractV1 = {
    contractVersion: 1,
    kind: "published-table-content-binding-contract",
    tableContentBindingContractId: `${tableId}-content-bindings-v1`,
    owner: clone(owner),
    tableDefinitionId: definition.tableDefinitionId,
    tableId,
    rowTemplates: {
      [bodyTemplateId]: { rowTemplateId: bodyTemplateId, placements },
    },
  }
  return { nodes, tableId, definition, bindingContract }
}

function buildTemplate(bundle: FlowDocCanonicalReportDataBundleV1): {
  document: DocumentNodeV4Target
  tables: Array<{
    collectionFieldKey: string
    definition: VNextTableDefinitionV1
    bindingContract: VNextPublishedTableContentBindingContractV1
  }>
  presentationFieldKeys: string[]
  evidenceOnlyFieldKeys: string[]
} {
  const fieldsBySection = new Map<string, string[]>(SECTION_SPECS.map(([id]) => [id, []]))
  const presentationFieldKeys: string[] = []
  const evidenceOnlyFieldKeys: string[] = []
  Object.keys(bundle.fieldContract.registry.fields).forEach((key) => {
    const sectionId = sectionForField(key)
    if (sectionId == null) evidenceOnlyFieldKeys.push(key)
    else {
      requireFact(fieldsBySection.has(sectionId), `unknown section ${sectionId} for ${key}`)
      fieldsBySection.get(sectionId)?.push(key)
      presentationFieldKeys.push(key)
    }
  })
  requireFact(evidenceOnlyFieldKeys.length === 29, "expected 29 evidence-only critical values")

  const tableContracts: Array<{
    collectionFieldKey: string
    definition: VNextTableDefinitionV1
    bindingContract: VNextPublishedTableContentBindingContractV1
  }> = []
  const sections = SECTION_SPECS.map(([sectionId, title, intro], sectionIndex) => {
    const nodes: Record<string, AuthoredNodeV4Target> = {}
    const bodyZoneId = `${sectionId}-body-zone`
    const headerZoneId = `${sectionId}-header-zone`
    const footerZoneId = `${sectionId}-footer-zone`
    const bodyChildIds: string[] = []
    const headingId = `${sectionId}-title`
    const introId = `${sectionId}-intro`
    bodyChildIds.push(addNode(nodes, textBlock(
      headingId,
      title,
      sectionId === "cover" ? "report-title" : "section-heading",
      "heading",
    )))
    bodyChildIds.push(addNode(nodes, textBlock(introId, intro, "report-body")))

    readerNarrative(sectionId, bundle).forEach((node) => {
      bodyChildIds.push(addNode(nodes, node))
    })

    for (const key of fieldsBySection.get(sectionId) ?? []) {
      const definition = bundle.fieldContract.registry.fields[key]
      if (definition.type === "collection") {
        const graph = tableGraph(key, bundle.collectionItemContract.collections[key], bundle.structureVersion)
        Object.values(graph.nodes).forEach((node) => addNode(nodes, node))
        bodyChildIds.push(graph.tableId)
        tableContracts.push({ collectionFieldKey: key, definition: graph.definition, bindingContract: graph.bindingContract })
      } else if (definition.type === "image") {
        bodyChildIds.push(addNode(nodes, {
          id: `${sectionId}-image-${slug(key)}`,
          type: "image",
          source: { kind: "image-field-ref", fieldKey: key },
          accessibility: { kind: "described", altText: definition.label },
          props: {
            frame: {
              width: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.expectedBodyGeometryPt.width),
              height: mm(key.endsWith("source_evidence") ? 105 : 78),
              fit: "contain",
            },
            align: "center",
          },
        }))
      } else {
        bodyChildIds.push(addNode(nodes, fieldBlock(`${sectionId}-field-${slug(key)}`, key, definition.label)))
      }
    }

    const headerTextId = `${sectionId}-header-text`
    const footerTextId = `${sectionId}-footer-text`
    addNode(nodes, textBlock(headerTextId, "OCR BENCHMARK | INV_9437125258", "report-caption", "caption"))
    addNode(nodes, {
      id: footerTextId,
      type: "text-block",
      role: { role: "caption" },
      props: { textStyleId: "report-caption" },
      children: [
        { id: `${footerTextId}-label`, type: "text", text: "รายงานผลการทดสอบ | หน้า " },
        { id: `${footerTextId}-page`, type: "page-number" },
      ],
    })
    addNode(nodes, { id: bodyZoneId, type: "zone", role: "body", childIds: bodyChildIds })
    addNode(nodes, { id: headerZoneId, type: "zone", role: "header", childIds: [headerTextId] })
    addNode(nodes, { id: footerZoneId, type: "zone", role: "footer", childIds: [footerTextId] })
    return {
      id: `section-${sectionId}`,
      type: "section" as const,
      page: {
        size: "Letter" as const,
        orientation: "portrait" as const,
        margin: {
          top: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.marginPt.top),
          right: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.marginPt.right),
          bottom: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.marginPt.bottom),
          left: pt(FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.marginPt.left),
        },
        headerReserved: FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.headerReservedPt,
        footerReserved: FLOWDOC_CANONICAL_REPORT_PAGE_CALIBRATION_V1.footerReservedPt,
        headerFooterHorizontalMode: "body" as const,
        ...(sectionIndex === 0 ? { pageNumberStart: 1 } : {}),
      },
      zoneIds: [bodyZoneId, headerZoneId, footerZoneId],
      nodes,
    }
  })
  return {
    document: {
      version: 4,
      document: {
        id: FLOWDOC_CANONICAL_REPORT_TEMPLATE_ID,
        meta: { title: "OCR Benchmark INV_9437125258" },
        sections,
      },
    },
    tables: tableContracts,
    presentationFieldKeys,
    evidenceOnlyFieldKeys,
  }
}

function allocatedIdentity(
  identityKind: Extract<VNextAllocatedIdentityKindV1, "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline">,
  seed: string,
  instance: VNextDocumentInstanceIdentityV1,
  resolutionInputFingerprint: string,
): VNextAllocatedIdentityV1 {
  const prefixes = { "resolved-row": "rowi", "resolved-cell": "celli", "resolved-node": "nodei", "resolved-inline": "inli" } as const
  return {
    contractVersion: 1,
    kind: "allocated-identity",
    identityKind,
    identityClass: "resolved-entity",
    id: `${prefixes[identityKind]}_${sha256(seed).slice(0, 24)}`,
    allocationOwner: "resolution-orchestrator",
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: instance.instanceId,
      instanceRevision: instance.revision,
      resolutionInputFingerprint,
    },
  }
}

function revisionPins(
  instance: VNextDocumentInstanceIdentityV1,
  collectionSnapshotRevision: number,
): Record<string, number> {
  return {
    structureVersionOrdinal: instance.structureVersion.versionOrdinal,
    instanceRevision: instance.revision,
    collectionSnapshotRevision,
  }
}

function rowAssignments(
  definition: VNextTableDefinitionV1,
  bundle: FlowDocCanonicalReportDataBundleV1,
  resolutionInputFingerprint: string,
): VNextTableCollectionIdentityAssignmentV1[] {
  const source = definition.rowSources.find((candidate) => candidate.kind === "collection-rows")
  requireFact(source?.kind === "collection-rows", `missing collection source for ${definition.tableId}`)
  const template = definition.rowTemplates[source.rowTemplateId]
  const collection = bundle.collectionSnapshot.collections[source.collectionFieldKey]
  const pins = revisionPins(bundle.instance, bundle.collectionSnapshot.snapshotRevision)
  return collection.items.map((item) => {
    const rowRefs = {
      tableId: definition.tableId,
      rowSourceId: source.rowSourceId,
      rowTemplateId: source.rowTemplateId,
      sourceRowId: template.sourceRowId,
      collectionFieldKey: source.collectionFieldKey,
      itemKey: item.itemKey,
    }
    const rowIdentity = allocatedIdentity(
      "resolved-row",
      `${resolutionInputFingerprint}|${definition.tableId}|${item.itemKey}|row`,
      bundle.instance,
      resolutionInputFingerprint,
    )
    const row = createVNextDerivedIdentityProvenanceV1(rowIdentity, {
      kind: "collection-row",
      refs: rowRefs,
      revisionPins: pins,
    })
    return {
      rowSourceId: source.rowSourceId,
      itemKey: item.itemKey,
      row,
      cells: Object.fromEntries(template.cells.map((cell) => [
        cell.cellId,
        createVNextDerivedIdentityProvenanceV1(
          allocatedIdentity(
            "resolved-cell",
            `${resolutionInputFingerprint}|${definition.tableId}|${item.itemKey}|${cell.cellId}`,
            bundle.instance,
            resolutionInputFingerprint,
          ),
          {
            kind: "resolved-cell",
            refs: { ...rowRefs, sourceCellId: cell.cellId, rowInstanceId: rowIdentity.id },
            revisionPins: pins,
          },
        ),
      ])),
    }
  })
}

function contentAssignments(
  resolvedRows: VNextResolvedTableRowsReadyV1,
  document: DocumentNodeV4Target,
  definition: VNextTableDefinitionV1,
  bundle: FlowDocCanonicalReportDataBundleV1,
  bindingContract: VNextPublishedTableContentBindingContractV1,
): VNextTableContentIdentityAssignmentsV1 {
  const plan = createVNextTableContentSourcePlanV1({
    document,
    definition,
    fieldContract: bundle.fieldContract,
    itemContract: bundle.collectionItemContract,
    bindingContract,
  })
  requireFact(plan.status === "ready", `source plan blocked for ${definition.tableId}`)
  const templateById = new Map(plan.templates.map((template) => [template.rowTemplateId, template]))
  const pins = revisionPins(bundle.instance, bundle.collectionSnapshot.snapshotRevision)
  return {
    contractVersion: 1,
    kind: "table-content-identity-assignments",
    rows: resolvedRows.rows.flatMap((row) => {
      if (row.source.kind !== "collection-row" || row.identity.kind !== "allocated-row") return []
      const sourceTemplate = templateById.get(row.source.rowTemplateId)
      requireFact(sourceTemplate != null, `missing content template ${row.source.rowTemplateId}`)
      const rowInstanceId = row.identity.provenance.identity.id
      const itemKey = row.source.itemKey
      const rowRefs = {
        tableId: definition.tableId,
        rowSourceId: row.source.rowSourceId,
        rowTemplateId: row.source.rowTemplateId,
        sourceRowId: row.source.sourceRowId,
        collectionFieldKey: row.source.collectionFieldKey,
        itemKey: row.source.itemKey,
        rowInstanceId,
      }
      return [{
        rowInstanceId,
        cells: Object.fromEntries(sourceTemplate.cells.map((sourceCell) => {
          const resolvedCell = row.cells.find((cell) => cell.sourceCellId === sourceCell.sourceCellId)
          requireFact(resolvedCell?.identity.kind === "allocated-cell", `missing allocated cell ${sourceCell.sourceCellId}`)
          const cellInstanceId = resolvedCell.identity.provenance.identity.id
          return [sourceCell.sourceCellId, {
            sourceCellId: sourceCell.sourceCellId,
            nodes: Object.fromEntries(sourceCell.sourceNodes.map((sourceNode) => {
              const nodeSeed = `${resolvedRows.resolutionInputFingerprint}|${definition.tableId}|${itemKey}|${sourceNode.sourceNodeId}`
              const nodeIdentity = allocatedIdentity("resolved-node", nodeSeed, bundle.instance, resolvedRows.resolutionInputFingerprint)
              const nodeRefs = { ...rowRefs, sourceCellId: sourceCell.sourceCellId, cellInstanceId, sourceNodeId: sourceNode.sourceNodeId }
              const node = createVNextDerivedIdentityProvenanceV1(nodeIdentity, {
                kind: "resolved-node", refs: nodeRefs, revisionPins: pins,
              })
              return [sourceNode.sourceNodeId, {
                sourceNodeId: sourceNode.sourceNodeId,
                node,
                inlines: Object.fromEntries(sourceNode.sourceInlineIds.map((sourceInlineId) => [
                  sourceInlineId,
                  createVNextDerivedIdentityProvenanceV1(
                    allocatedIdentity("resolved-inline", `${nodeSeed}|${sourceInlineId}`, bundle.instance, resolvedRows.resolutionInputFingerprint),
                    {
                      kind: "resolved-inline",
                      refs: {
                        ...nodeRefs,
                        sourceTextBlockId: sourceNode.sourceNodeId,
                        sourceInlineId,
                        resolvedNodeId: nodeIdentity.id,
                      },
                      revisionPins: pins,
                    },
                  ),
                ])),
              }]
            })),
          }]
        })),
      }]
    }),
  }
}

export function resolveFlowDocCanonicalReportCollectionsV1(
  document: DocumentNodeV4Target,
  tableContracts: Array<{
    collectionFieldKey: string
    definition: VNextTableDefinitionV1
    bindingContract: VNextPublishedTableContentBindingContractV1
  }>,
  bundle: FlowDocCanonicalReportDataBundleV1,
  resolutionInputFingerprint: string,
): FlowDocCanonicalReportResolvedTableV1[] {
  return tableContracts.map((table) => {
    const resolvedRows = resolveVNextTableRowsV1({
      contractVersion: 1,
      kind: "resolved-table-rows-request",
      instance: bundle.instance,
      resolutionInputFingerprint,
      definition: table.definition,
      fieldContract: bundle.fieldContract,
      collectionSnapshot: bundle.collectionSnapshot,
      identityAssignments: rowAssignments(table.definition, bundle, resolutionInputFingerprint),
    })
    requireFact(resolvedRows.status === "resolved", `row resolution blocked for ${table.collectionFieldKey}`)
    const materializedContent = materializeVNextTableContentV1({
      contractVersion: 1,
      kind: "table-content-materialization-request",
      document,
      definition: table.definition,
      fieldContract: bundle.fieldContract,
      itemContract: bundle.collectionItemContract,
      bindingContract: table.bindingContract,
      resolvedRows,
      identityAssignments: contentAssignments(resolvedRows, document, table.definition, bundle, table.bindingContract),
      globalBindings: {
        contractVersion: 1,
        kind: "table-global-resolved-bindings",
        instanceId: bundle.instance.instanceId,
        instanceRevision: bundle.instance.revision,
        resolutionInputFingerprint,
        text: {},
        images: {},
      },
    })
    requireFact(materializedContent.status === "materialized", `content materialization blocked for ${table.collectionFieldKey}`)
    return { ...table, resolvedRows, materializedContent }
  })
}

function withoutFingerprint(
  bundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
): Omit<FlowDocCanonicalReportTemplateResolutionBundleV1, "bundleFingerprint"> {
  const { bundleFingerprint: _fingerprint, ...unsigned } = bundle
  return unsigned
}

function countNodes(document: DocumentNodeV4Target): number {
  return document.document.sections.reduce((total, section) => total + Object.keys(section.nodes).length, 0)
}

function countMaterializedBindings(tables: FlowDocCanonicalReportResolvedTableV1[]): number {
  return tables.reduce(
    (total, table) => total + table.materializedContent.bindings.text.length + table.materializedContent.bindings.images.length,
    0,
  )
}

function validateFlowDocCanonicalReportTemplateResolutionBundleInternalV1(
  value: unknown,
): FlowDocCanonicalReportTemplateResolutionValidationV1 {
  if (typeof value !== "object" || value == null) {
    return { status: "blocked", issues: [issue("invalid-bundle", "", "bundle must be an object")], summary: null }
  }
  const bundle = value as FlowDocCanonicalReportTemplateResolutionBundleV1
  const issues: FlowDocCanonicalReportTemplateResolutionIssueV1[] = []
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-template-resolution-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2B") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (!isRecord(bundle.publishedStructure)
    || !isRecord(bundle.styleCatalog)
    || !isRecord(bundle.staticMedia)
    || !isRecord(bundle.starterTemplate)
    || !isRecord(bundle.instanceDocument)
    || !isRecord(bundle.scopedResolution)
    || !Array.isArray(bundle.collectionTables)
    || !isRecord(bundle.coverage)
    || !Array.isArray(bundle.coverage.presentationFieldKeys)
    || !Array.isArray(bundle.coverage.evidenceOnlyFieldKeys)
    || !isRecord(bundle.ownership)
    || !isRecord(bundle.execution)
    || !isRecord(bundle.summary)) {
    issues.push(issue("bundle-shape", "", "R2B bundle records and arrays are incomplete"))
    return { status: "blocked", issues, summary: null }
  }
  if (VNextPublishedStructureVersionIdentityV1Schema.safeParse(bundle.publishedStructure).success !== true) issues.push(issue("published-structure-schema", "publishedStructure", "published structure identity is invalid"))
  if (DocumentNodeV4TargetSchema.safeParse(bundle.starterTemplate).success !== true) issues.push(issue("starter-template-schema", "starterTemplate", "starter template must be valid Document v4"))
  if (DocumentNodeV4TargetSchema.safeParse(bundle.instanceDocument).success !== true) issues.push(issue("instance-document-schema", "instanceDocument", "instance document must be valid Document v4"))
  if (VNextPublishedStyleCatalogV1Schema.safeParse(bundle.styleCatalog).success !== true) issues.push(issue("style-catalog-schema", "styleCatalog", "style catalog is invalid"))
  if (VNextPublishedStaticMediaV1Schema.safeParse(bundle.staticMedia).success !== true) issues.push(issue("static-media-schema", "staticMedia", "static media contract is invalid"))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  const structure = validateVNextDocumentV4Structure(bundle.instanceDocument)
  if (structure.status !== "valid") issues.push(issue("instance-document-structure", "instanceDocument", "instance document structure is invalid"))
  if (bundle.starterTemplate.document.id !== FLOWDOC_CANONICAL_REPORT_TEMPLATE_ID) issues.push(issue("template-id", "starterTemplate.document.id", "starter template identity differs"))
  if (bundle.scopedResolution.status !== "resolved" || !isRecord(bundle.scopedResolution.resolvedDocument)) {
    issues.push(issue("scoped-resolution", "scopedResolution", "scoped document must resolve"))
    return { status: "blocked", issues, summary: null }
  }
  if (bundle.instanceDocument.document.id !== bundle.scopedResolution.resolvedDocument.instanceId) issues.push(issue("instance-id", "instanceDocument.document.id", "resolved instance ID differs"))
  if (JSON.stringify(bundle.instanceDocument) !== JSON.stringify(bundle.scopedResolution.resolvedDocument.document)) issues.push(issue("resolved-document-graph", "scopedResolution.resolvedDocument.document", "resolved document must preserve the exact instance graph"))
  const expectedInstanceDocument = clone(bundle.starterTemplate)
  expectedInstanceDocument.document.id = bundle.instanceDocument.document.id
  if (JSON.stringify(expectedInstanceDocument) !== JSON.stringify(bundle.instanceDocument)) issues.push(issue("instance-document-template-drift", "instanceDocument", "instance document may differ from the starter template only by document ID"))
  const ownerRef = {
    structureId: bundle.publishedStructure.structureId,
    structureVersionId: bundle.publishedStructure.structureVersionId,
    versionOrdinal: bundle.publishedStructure.versionOrdinal,
  }
  if (!sameStructureRef(bundle.styleCatalog.owner, ownerRef)) issues.push(issue("style-owner", "styleCatalog.owner", "style catalog owner differs from the published structure"))
  if (!sameStructureRef(bundle.staticMedia.owner, ownerRef)) issues.push(issue("static-media-owner", "staticMedia.owner", "static media owner differs from the published structure"))
  if (bundle.sourceDataBundleFingerprint !== ACCEPTED_SOURCE_DATA_BUNDLE_FINGERPRINT) issues.push(issue("source-data-fingerprint", "sourceDataBundleFingerprint", "source data bundle fingerprint differs from accepted R2A evidence"))
  if (!bundle.instanceDocument.document.sections.every((section) => section.page.size === "Letter")) issues.push(issue("page-size", "instanceDocument.document.sections", "all canonical report sections must retain Letter page size"))
  if (bundle.collectionTables.length !== REPORT_COLLECTION_KEYS.length) issues.push(issue("collection-table-count", "collectionTables", "all six collection tables are required"))
  if (!sameStringSet(bundle.collectionTables.map((table) => table.collectionFieldKey), REPORT_COLLECTION_KEYS)) issues.push(issue("collection-table-key-set", "collectionTables", "canonical collection table keys differ"))
  for (const [index, table] of bundle.collectionTables.entries()) {
    if (VNextTableDefinitionV1Schema.safeParse(table.definition).success !== true) issues.push(issue("table-definition", `collectionTables[${index}].definition`, "table definition is invalid"))
    if (VNextPublishedTableContentBindingContractV1Schema.safeParse(table.bindingContract).success !== true) issues.push(issue("table-binding", `collectionTables[${index}].bindingContract`, "table binding contract is invalid"))
    if (table.resolvedRows.status !== "resolved") issues.push(issue("table-rows", `collectionTables[${index}].resolvedRows`, "table rows must resolve"))
    if (table.materializedContent.status !== "materialized") issues.push(issue("table-content", `collectionTables[${index}].materializedContent`, "table content must materialize"))
    if (table.definition.owner.kind !== "published-structure-version" || !sameStructureRef(table.definition.owner.ref, ownerRef)) issues.push(issue("table-definition-owner", `collectionTables[${index}].definition.owner`, "table definition owner differs from the published structure"))
    if (!sameStructureRef(table.bindingContract.owner, ownerRef)) issues.push(issue("table-binding-owner", `collectionTables[${index}].bindingContract.owner`, "table binding owner differs from the published structure"))
    const collectionSources = table.definition.rowSources.filter((source) => source.kind === "collection-rows")
    if (collectionSources.length !== 1 || collectionSources[0].collectionFieldKey !== table.collectionFieldKey) issues.push(issue("table-collection-source", `collectionTables[${index}].definition.rowSources`, "table must resolve exactly its named collection"))
    if (table.resolvedRows.resolutionInputFingerprint !== bundle.resolutionInputFingerprint
      || table.materializedContent.resolutionInputFingerprint !== bundle.resolutionInputFingerprint) {
      issues.push(issue("table-resolution-pin", `collectionTables[${index}]`, "table outputs differ from the bundle resolution fingerprint"))
    }
    const itemBindings = [
      ...table.materializedContent.bindings.text,
      ...table.materializedContent.bindings.images,
    ]
    if (itemBindings.some((binding) => binding.scope !== "collection-item-field" || binding.collectionFieldKey !== table.collectionFieldKey)) {
      issues.push(issue("table-binding-scope", `collectionTables[${index}].materializedContent.bindings`, "canonical table bindings must remain item-scoped to their named collection"))
    }
  }
  const expectedResolutionInputFingerprint = createFlowDocCanonicalReportResolutionInputFingerprintV1(
    bundle.sourceDataBundleFingerprint,
    bundle.starterTemplate,
    bundle.styleCatalog,
    bundle.collectionTables,
  )
  if (bundle.resolutionInputFingerprint !== expectedResolutionInputFingerprint) issues.push(issue("resolution-input-fingerprint", "resolutionInputFingerprint", "resolution input fingerprint does not match template, style, and table contracts"))
  const allFields = [...bundle.coverage.presentationFieldKeys, ...bundle.coverage.evidenceOnlyFieldKeys]
  if (allFields.length !== 154 || new Set(allFields).size !== allFields.length) issues.push(issue("coverage-overlap", "coverage", "all 154 fields must be classified once without overlap"))
  if (bundle.coverage.evidenceOnlyFieldKeys.length !== 29 || !bundle.coverage.evidenceOnlyFieldKeys.every((key) => key.startsWith("report.truth.critical."))) {
    issues.push(issue("evidence-only-field-set", "coverage.evidenceOnlyFieldKeys", "only the 29 critical-value evidence fields may remain non-presentational"))
  }
  const globalFieldKeys = bundle.scopedResolution.resolvedDocument.bindings.fields.map((binding) => binding.fieldKey)
  const globalImageKeys = bundle.scopedResolution.resolvedDocument.bindings.images.flatMap((binding) => binding.fieldKey == null ? [] : [binding.fieldKey])
  const collectionKeys = bundle.collectionTables.map((table) => table.collectionFieldKey)
  if (!sameStringSet(bundle.coverage.presentationFieldKeys, [...new Set([...globalFieldKeys, ...globalImageKeys, ...collectionKeys])])) {
    issues.push(issue("presentation-coverage", "coverage.presentationFieldKeys", "presentation coverage differs from resolved scalar/image/table bindings"))
  }
  if (!sameStringSet(bundle.scopedResolution.tablePlans.map((plan) => plan.tableId), bundle.collectionTables.map((table) => table.definition.tableId))) {
    issues.push(issue("scoped-table-plan-set", "scopedResolution.tablePlans", "scoped table plans differ from materialized tables"))
  }
  if (!sameStringSet(
    [...new Set(bundle.scopedResolution.deferredCollectionItemPlacements.map((placement) => placement.collectionFieldKey))],
    REPORT_COLLECTION_KEYS,
  )) issues.push(issue("deferred-collection-set", "scopedResolution.deferredCollectionItemPlacements", "deferred item placements do not cover all collection tables"))
  const forbidden = /"(?:lines|xPt|yPt|glyphs|paintCommands|pageBoxes|measurementRequestId)"/u
  if (forbidden.test(JSON.stringify(bundle))) issues.push(issue("downstream-fact", "", "R2B must not retain measurement, layout, pagination, or paint facts"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "template ownership differs from R2B"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "R2B execution boundary differs"))
  const expectedSummary: FlowDocCanonicalReportTemplateResolutionBundleV1["summary"] = {
    semanticSectionCount: bundle.instanceDocument.document.sections.length,
    templateNodeCount: countNodes(bundle.instanceDocument),
    scalarBindingCount: bundle.scopedResolution.resolvedDocument.bindings.fields.length,
    imageBindingCount: bundle.scopedResolution.resolvedDocument.bindings.images.length,
    styleBindingCount: bundle.scopedResolution.resolvedDocument.bindings.styles.length,
    collectionTableCount: bundle.collectionTables.length,
    collectionRowCount: bundle.collectionTables.reduce((total, table) => total + table.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").length, 0),
    collectionCellCount: bundle.collectionTables.reduce((total, table) => total + table.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").reduce((rowTotal, row) => rowTotal + row.cells.length, 0), 0),
    collectionItemBindingCount: countMaterializedBindings(bundle.collectionTables),
    evidenceOnlyFieldCount: bundle.coverage.evidenceOnlyFieldKeys.length,
  }
  if (JSON.stringify(bundle.summary) !== JSON.stringify(expectedSummary)) issues.push(issue("summary", "summary", "summary does not match resolved artifacts"))
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle)))) issues.push(issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"))
  return issues.length === 0
    ? { status: "valid", issues: [], summary: expectedSummary }
    : { status: "blocked", issues, summary: null }
}

export function validateFlowDocCanonicalReportTemplateResolutionBundleV1(
  value: unknown,
): FlowDocCanonicalReportTemplateResolutionValidationV1 {
  try {
    return validateFlowDocCanonicalReportTemplateResolutionBundleInternalV1(value)
  } catch {
    return {
      status: "blocked",
      issues: [issue("invalid-bundle-shape", "", "R2B bundle contains malformed nested content")],
      summary: null,
    }
  }
}

export function createFlowDocCanonicalReportTemplateResolutionBundleV1(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
): FlowDocCanonicalReportTemplateResolutionBundleV1 {
  const built = buildTemplate(dataBundle)
  const starterTemplate = DocumentNodeV4TargetSchema.parse(built.document)
  const instanceDocument = clone(starterTemplate)
  instanceDocument.document.id = dataBundle.instance.instanceId
  const styles = VNextPublishedStyleCatalogV1Schema.parse(styleCatalog(dataBundle))
  const staticAssets = VNextPublishedStaticMediaV1Schema.parse(staticMedia(dataBundle))
  const published = publishedStructure(dataBundle)
  requireFact(
    dataBundle.bundleFingerprint === ACCEPTED_SOURCE_DATA_BUNDLE_FINGERPRINT,
    "canonical report template requires the accepted R2A data bundle",
  )
  const resolutionInputFingerprint = createFlowDocCanonicalReportResolutionInputFingerprintV1(
    dataBundle.bundleFingerprint,
    starterTemplate,
    styles,
    built.tables,
  )
  const projection: VNextResolvedProjectionInputV1 = {
    contractVersion: 1,
    kind: "resolved-projection-input",
    instance: clone(dataBundle.instance),
    document: instanceDocument,
    published: {
      contractVersion: 1,
      kind: "published-resolution-bundle",
      publishedStructure: published,
      fieldContract: clone(dataBundle.fieldContract),
      styleCatalog: styles,
      staticMedia: staticAssets,
    },
    dataSnapshot: clone(dataBundle.dataSnapshot),
    instanceMedia: clone(dataBundle.mediaSnapshot),
  }
  const scopedResolution = resolveVNextScopedDocumentV1({
    contractVersion: 1,
    kind: "scoped-resolved-projection-input",
    projection,
    tables: built.tables.map((table) => ({
      definition: table.definition,
      itemContract: dataBundle.collectionItemContract,
      bindingContract: table.bindingContract,
    })),
  })
  requireFact(scopedResolution.status === "resolved", `scoped resolution blocked: ${scopedResolution.status === "blocked" ? scopedResolution.issues.map((item) => item.message).join("; ") : "unknown"}`)
  const collectionTables = resolveFlowDocCanonicalReportCollectionsV1(
    instanceDocument,
    built.tables,
    dataBundle,
    resolutionInputFingerprint,
  )
  const collectionItemBindingCount = countMaterializedBindings(collectionTables)
  const unsigned: Omit<FlowDocCanonicalReportTemplateResolutionBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-template-resolution-bundle",
    phaseId: "PDF-PILOT-08B-R2B",
    templateId: FLOWDOC_CANONICAL_REPORT_TEMPLATE_ID,
    sourceDataBundleFingerprint: dataBundle.bundleFingerprint,
    resolutionInputFingerprint,
    publishedStructure: published,
    styleCatalog: styles,
    staticMedia: staticAssets,
    starterTemplate,
    instanceDocument,
    scopedResolution,
    collectionTables,
    coverage: {
      presentationFieldKeys: built.presentationFieldKeys,
      evidenceOnlyFieldKeys: built.evidenceOnlyFieldKeys,
      scalarPlacementCount: scopedResolution.resolvedDocument.bindings.fields.length,
      imagePlacementCount: scopedResolution.resolvedDocument.bindings.images.length,
      collectionPlacementCount: collectionTables.length,
      collectionItemBindingCount,
    },
    ownership: {
      templateOwns: ["report-prose", "semantic-section-order", "field-placement", "style-selection", "collection-table-shape"],
      templateMustNotOwn: ["source-fact-values", "locale-display-formatting", "line-breaking", "layout-coordinates", "pagination", "pdf-bytes"],
    },
    execution: {
      instanceMaterialization: "not-run-existing-revision",
      scalarImageResolution: "resolved",
      collectionRowResolution: "resolved",
      collectionContentMaterialization: "materialized",
      localeDisplayFormatting: "not-run",
      textMeasurement: "not-run",
      lineBreaking: "not-run",
      layout: "not-run",
      pagination: "not-run",
      pdfRendering: "not-run",
    },
    summary: {
      semanticSectionCount: instanceDocument.document.sections.length,
      templateNodeCount: countNodes(instanceDocument),
      scalarBindingCount: scopedResolution.resolvedDocument.bindings.fields.length,
      imageBindingCount: scopedResolution.resolvedDocument.bindings.images.length,
      styleBindingCount: scopedResolution.resolvedDocument.bindings.styles.length,
      collectionTableCount: collectionTables.length,
      collectionRowCount: collectionTables.reduce((total, table) => total + table.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").length, 0),
      collectionCellCount: collectionTables.reduce((total, table) => total + table.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").reduce((rowTotal, row) => rowTotal + row.cells.length, 0), 0),
      collectionItemBindingCount,
      evidenceOnlyFieldCount: built.evidenceOnlyFieldKeys.length,
    },
  }
  const bundle: FlowDocCanonicalReportTemplateResolutionBundleV1 = {
    ...unsigned,
    bundleFingerprint: sha256(JSON.stringify(unsigned)),
  }
  const validation = validateFlowDocCanonicalReportTemplateResolutionBundleV1(bundle)
  requireFact(validation.status === "valid", `generated bundle is invalid: ${validation.status === "blocked" ? validation.issues.map((item) => item.message).join("; ") : "unknown"}`)
  return bundle
}
