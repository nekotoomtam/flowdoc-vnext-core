import { createHash } from "node:crypto"
import {
  VNextPublishedDisplayFormatContractV1Schema,
  formatVNextDisplayValueV1,
  validateVNextPublishedDisplayFormatContractV1,
  type VNextDisplayFormatDefinitionV1,
  type VNextDisplayFormatSpecV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedDisplayFormatContractV1,
} from "@flowdoc/vnext-core"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "./canonicalReportDataAdapter.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "./canonicalReportTemplateResolution.js"

export const FLOWDOC_CANONICAL_REPORT_DISPLAY_FORMATTING_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_DISPLAY_FORMAT_CONTRACT_ID = "ocr-benchmark-report-display-formats-v1" as const

const ACCEPTED_DATA_BUNDLE_FINGERPRINT = "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d"
const ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT = "a64f2f945a23ecbc75d7210512d96a594a0b84b50dc03a1089bfc5b90ecadcdb"
const FORMAT_KEYS = {
  plain: "plain",
  integer: "integer",
  bytesGrouped: "bytes-grouped",
  percent0: "percent-0",
  percent1: "percent-1",
  seconds2: "seconds-2",
  megabytes2: "megabytes-2",
  thb2: "thb-2",
  usd3: "usd-3",
  usdPerRun0: "usd-per-run-0",
  thbRate2: "thb-rate-2",
  ratio0: "ratio-0",
  booleanPass: "boolean-pass",
  booleanMatch: "boolean-match",
  booleanYesNo: "boolean-yes-no",
  enumEngine: "enum-engine",
  enumProvider: "enum-provider",
  enumRunStatus: "enum-run-status",
  enumProcessingScope: "enum-processing-scope",
  enumSubmitMode: "enum-submit-mode",
  thaiDate: "thai-gregorian-date",
  utcInstant: "utc-instant-seconds",
} as const

type ScalarValue = string | number | boolean | null

export interface FlowDocCanonicalReportDocumentDisplayBindingV1 {
  scope: "document-field"
  textBlockId: string
  inlineId: string
  fieldKey: string
  valueType: "text" | "number" | "date" | "boolean" | "enum"
  rawValue: ScalarValue
  rawResolvedValue: string
  rawCanonicalText: string
  formatKey: string
  formatKind: VNextDisplayFormatSpecV1["kind"]
  displayText: string
}

export interface FlowDocCanonicalReportCollectionDisplayBindingV1 {
  scope: "collection-item-field"
  collectionFieldKey: string
  itemKey: string
  resolvedPlacementId: string
  sourcePlacementId: string
  fieldKey: string
  valueType: "text" | "number" | "date" | "boolean" | "enum"
  rawValue: ScalarValue
  rawResolvedValue: string
  rawCanonicalText: string
  formatKey: string
  formatKind: VNextDisplayFormatSpecV1["kind"]
  displayText: string
}

export interface FlowDocCanonicalReportCollectionDisplayBindingsV1 {
  collectionFieldKey: string
  tableId: string
  bindings: FlowDocCanonicalReportCollectionDisplayBindingV1[]
}

export interface FlowDocCanonicalReportDisplayFormattingBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_DISPLAY_FORMATTING_VERSION
  kind: "canonical-report-display-formatting-bundle"
  phaseId: "PDF-PILOT-08B-R2C-A"
  sourceDataBundleFingerprint: string
  sourceTemplateBundleFingerprint: string
  resolutionInputFingerprint: string
  instance: VNextDocumentInstanceIdentityV1
  formatContract: VNextPublishedDisplayFormatContractV1
  documentBindings: FlowDocCanonicalReportDocumentDisplayBindingV1[]
  collectionTables: FlowDocCanonicalReportCollectionDisplayBindingsV1[]
  measurementHandoff: {
    status: "ready-for-measurement-request-preparation"
    consumes: "r2b-resolved-bindings-plus-r2c-display-overlay"
    rawValuesRetained: true
    authoredGraphMutation: false
    documentBindingCount: number
    collectionBindingCount: number
    tableGeometry: "not-run"
    measurementRequests: "not-run"
  }
  ownership: {
    formatContractOwns: ["display-labels", "unit-scaling", "fixed-digits", "date-presentation"]
    formatContractMustNotOwn: ["source-values", "field-types", "template-graph", "measurement", "layout", "pagination", "pdf-bytes"]
  }
  execution: {
    localeDisplayFormatting: "formatted"
    runtimeIntl: false
    textMeasurement: "not-run"
    lineBreaking: "not-run"
    tableGeometry: "not-run"
    layout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    formatCount: number
    fieldFormatAssignmentCount: number
    collectionFormatAssignmentCount: number
    documentBindingCount: number
    collectionBindingCount: number
    totalFormattedBindingCount: number
    changedDisplayTextCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportDisplayFormattingIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportDisplayFormattingValidationV1 =
  | {
      status: "valid"
      issues: []
      summary: FlowDocCanonicalReportDisplayFormattingBundleV1["summary"]
    }
  | {
      status: "blocked"
      issues: FlowDocCanonicalReportDisplayFormattingIssueV1[]
      summary: null
    }

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportDisplayFormattingBundleV1["ownership"] = {
  formatContractOwns: ["display-labels", "unit-scaling", "fixed-digits", "date-presentation"],
  formatContractMustNotOwn: ["source-values", "field-types", "template-graph", "measurement", "layout", "pagination", "pdf-bytes"],
}
const EXPECTED_EXECUTION: FlowDocCanonicalReportDisplayFormattingBundleV1["execution"] = {
  localeDisplayFormatting: "formatted",
  runtimeIntl: false,
  textMeasurement: "not-run",
  lineBreaking: "not-run",
  tableGeometry: "not-run",
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

function issue(
  code: string,
  path: string,
  message: string,
): FlowDocCanonicalReportDisplayFormattingIssueV1 {
  return { code, path, message, severity: "error" }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function numberFormat(
  key: string,
  options: {
    scale?: number
    fractionDigits: number
    grouping?: "none" | "thousands-comma"
    prefix?: string
    suffix?: string
  },
): VNextDisplayFormatDefinitionV1 {
  return {
    key,
    spec: {
      kind: "number",
      scale: options.scale ?? 1,
      fractionDigits: options.fractionDigits,
      grouping: options.grouping ?? "none",
      prefix: options.prefix ?? "",
      suffix: options.suffix ?? "",
      nullText: "-",
    },
  }
}

function reportFormats(): Record<string, VNextDisplayFormatDefinitionV1> {
  const formats = {
    [FORMAT_KEYS.plain]: { key: FORMAT_KEYS.plain, spec: { kind: "plain-text", nullText: "-" } },
    [FORMAT_KEYS.integer]: numberFormat(FORMAT_KEYS.integer, { fractionDigits: 0 }),
    [FORMAT_KEYS.bytesGrouped]: numberFormat(FORMAT_KEYS.bytesGrouped, { fractionDigits: 0, grouping: "thousands-comma", suffix: " bytes" }),
    [FORMAT_KEYS.percent0]: numberFormat(FORMAT_KEYS.percent0, { scale: 100, fractionDigits: 0, suffix: "%" }),
    [FORMAT_KEYS.percent1]: numberFormat(FORMAT_KEYS.percent1, { scale: 100, fractionDigits: 1, suffix: "%" }),
    [FORMAT_KEYS.seconds2]: numberFormat(FORMAT_KEYS.seconds2, { scale: 0.001, fractionDigits: 2, suffix: " วินาที" }),
    [FORMAT_KEYS.megabytes2]: numberFormat(FORMAT_KEYS.megabytes2, { scale: 1 / (1024 * 1024), fractionDigits: 2, suffix: " MB" }),
    [FORMAT_KEYS.thb2]: numberFormat(FORMAT_KEYS.thb2, { fractionDigits: 2, suffix: " บาท" }),
    [FORMAT_KEYS.usd3]: numberFormat(FORMAT_KEYS.usd3, { fractionDigits: 3, suffix: " USD" }),
    [FORMAT_KEYS.usdPerRun0]: numberFormat(FORMAT_KEYS.usdPerRun0, { fractionDigits: 0, suffix: " USD ต่อ run" }),
    [FORMAT_KEYS.thbRate2]: numberFormat(FORMAT_KEYS.thbRate2, { fractionDigits: 2, suffix: " บาท/USD" }),
    [FORMAT_KEYS.ratio0]: numberFormat(FORMAT_KEYS.ratio0, { fractionDigits: 0, suffix: " เท่า" }),
    [FORMAT_KEYS.booleanPass]: { key: FORMAT_KEYS.booleanPass, spec: { kind: "boolean-label", trueText: "ผ่าน", falseText: "ไม่ผ่าน", nullText: "-" } },
    [FORMAT_KEYS.booleanMatch]: { key: FORMAT_KEYS.booleanMatch, spec: { kind: "boolean-label", trueText: "ตรงกัน", falseText: "ไม่ตรงกัน", nullText: "-" } },
    [FORMAT_KEYS.booleanYesNo]: { key: FORMAT_KEYS.booleanYesNo, spec: { kind: "boolean-label", trueText: "ใช่", falseText: "ไม่ใช่", nullText: "-" } },
    [FORMAT_KEYS.enumEngine]: {
      key: FORMAT_KEYS.enumEngine,
      spec: {
        kind: "enum-label",
        labels: {
          google_vision: "Google Vision",
          azure_document_intelligence: "Azure OCR",
          google_document_ai_native: "Google Document AI",
          azure_document_intelligence_native: "Azure Native",
        },
        unknownValue: "block",
        nullText: "-",
      },
    },
    [FORMAT_KEYS.enumProvider]: {
      key: FORMAT_KEYS.enumProvider,
      spec: { kind: "enum-label", labels: { google: "Google", azure: "Azure" }, unknownValue: "block", nullText: "-" },
    },
    [FORMAT_KEYS.enumRunStatus]: {
      key: FORMAT_KEYS.enumRunStatus,
      spec: { kind: "enum-label", labels: { completed: "เสร็จสมบูรณ์" }, unknownValue: "block", nullText: "-" },
    },
    [FORMAT_KEYS.enumProcessingScope]: {
      key: FORMAT_KEYS.enumProcessingScope,
      spec: { kind: "enum-label", labels: { native_extraction: "Native Extraction" }, unknownValue: "block", nullText: "-" },
    },
    [FORMAT_KEYS.enumSubmitMode]: {
      key: FORMAT_KEYS.enumSubmitMode,
      spec: { kind: "enum-label", labels: { page_by_page: "Page by page" }, unknownValue: "block", nullText: "-" },
    },
    [FORMAT_KEYS.thaiDate]: {
      key: FORMAT_KEYS.thaiDate,
      spec: {
        kind: "date",
        input: "iso-date",
        presentation: "day-month-name-year",
        monthNames: [
          "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
        ],
        separator: " ",
        nullText: "-",
      },
    },
    [FORMAT_KEYS.utcInstant]: {
      key: FORMAT_KEYS.utcInstant,
      spec: {
        kind: "date-time",
        input: "iso-instant-utc",
        presentation: "iso-utc-seconds",
        dateTimeSeparator: " ",
        utcSuffix: " UTC",
        nullText: "-",
      },
    },
  }
  return VNextPublishedDisplayFormatContractV1Schema.shape.formats.parse(formats)
}

function numberDocumentFormatKey(fieldKey: string): string {
  if (fieldKey === "report.source.size_bytes") return FORMAT_KEYS.bytesGrouped
  if (fieldKey === "report.settings.max_estimated_cost_usd_per_run") return FORMAT_KEYS.usdPerRun0
  if (fieldKey === "report.settings.usd_to_thb_rate") return FORMAT_KEYS.thbRate2
  if (fieldKey === "report.decision.native_cost_ratio") return FORMAT_KEYS.ratio0
  if (fieldKey.includes("latency_ms") || fieldKey === "report.decision.ocr_latency_delta_ms") return FORMAT_KEYS.seconds2
  if (fieldKey.endsWith("response_bytes")) return FORMAT_KEYS.megabytes2
  if (fieldKey.endsWith("cost_thb") || fieldKey === "report.total_cost.thb") return FORMAT_KEYS.thb2
  if (fieldKey.endsWith("cost_usd") || fieldKey === "report.total_cost.usd") return FORMAT_KEYS.usd3
  if (fieldKey.endsWith("bbox_coverage")
    || fieldKey.endsWith("structured_concept_coverage")
    || fieldKey.endsWith("mapping.precision")) return FORMAT_KEYS.percent0
  if (fieldKey.endsWith("character_accuracy")
    || fieldKey.endsWith("word_accuracy")
    || fieldKey.endsWith("mapping.recall")
    || fieldKey === "report.settings.low_confidence_threshold") return FORMAT_KEYS.percent1
  return FORMAT_KEYS.integer
}

function documentFormatKey(fieldKey: string, fieldType: string): string {
  if (fieldType === "text") return FORMAT_KEYS.plain
  if (fieldType === "number") return numberDocumentFormatKey(fieldKey)
  if (fieldType === "date") return fieldKey === "report.test_date" ? FORMAT_KEYS.thaiDate : FORMAT_KEYS.utcInstant
  if (fieldType === "boolean") return fieldKey.startsWith("report.validation.")
    ? FORMAT_KEYS.booleanPass
    : FORMAT_KEYS.booleanMatch
  if (fieldType === "enum") {
    if (fieldKey.startsWith("report.decision.")) return FORMAT_KEYS.enumEngine
    if (fieldKey === "report.settings.processing_scope") return FORMAT_KEYS.enumProcessingScope
    if (fieldKey === "report.settings.submit_mode") return FORMAT_KEYS.enumSubmitMode
  }
  throw new Error(`No document display format for ${fieldKey} (${fieldType})`)
}

function collectionFormatKey(fieldKey: string, fieldType: string): string {
  if (fieldType === "text") return FORMAT_KEYS.plain
  if (fieldType === "enum") {
    if (fieldKey === "engine" || fieldKey === "ocr_engine" || fieldKey === "native_engine") return FORMAT_KEYS.enumEngine
    if (fieldKey === "provider") return FORMAT_KEYS.enumProvider
    if (fieldKey === "status") return FORMAT_KEYS.enumRunStatus
  }
  if (fieldType === "boolean") return fieldKey === "source_hash_matches"
    ? FORMAT_KEYS.booleanMatch
    : FORMAT_KEYS.booleanYesNo
  if (fieldType === "number") {
    if (["average_confidence", "minimum_confidence", "bbox_coverage", "character_accuracy", "word_accuracy", "structured_concept_coverage", "confidence"].includes(fieldKey)) return FORMAT_KEYS.percent1
    if (fieldKey === "latency_ms") return FORMAT_KEYS.seconds2
    if (fieldKey === "response_bytes") return FORMAT_KEYS.megabytes2
    if (fieldKey === "cost_usd") return FORMAT_KEYS.usd3
    if (fieldKey === "cost_thb") return FORMAT_KEYS.thb2
    return FORMAT_KEYS.integer
  }
  throw new Error(`No collection display format for ${fieldKey} (${fieldType})`)
}

function createFormatContract(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
): VNextPublishedDisplayFormatContractV1 {
  const fieldFormats: Record<string, string> = {}
  Object.entries(dataBundle.fieldContract.registry.fields).forEach(([fieldKey, field]) => {
    if (field.type === "image" || field.type === "collection") return
    fieldFormats[fieldKey] = documentFormatKey(fieldKey, field.type)
  })
  const collectionItemFormats: VNextPublishedDisplayFormatContractV1["collectionItemFormats"] = {}
  Object.entries(dataBundle.collectionItemContract.collections).forEach(([collectionFieldKey, shape]) => {
    collectionItemFormats[collectionFieldKey] = {
      collectionFieldKey,
      fields: Object.fromEntries(Object.entries(shape.fields).map(([fieldKey, field]) => [
        fieldKey,
        collectionFormatKey(fieldKey, field.type),
      ])),
    }
  })
  return VNextPublishedDisplayFormatContractV1Schema.parse({
    contractVersion: 1,
    kind: "published-display-format-contract",
    displayFormatContractId: FLOWDOC_CANONICAL_REPORT_DISPLAY_FORMAT_CONTRACT_ID,
    owner: clone(dataBundle.structureVersion),
    publishedFieldContractId: dataBundle.fieldContract.fieldContractId,
    publishedCollectionItemContractId: dataBundle.collectionItemContract.collectionItemContractId,
    locale: {
      localeId: "th-TH",
      numberSystem: "latn",
      decimalSeparator: ".",
      groupingSeparator: ",",
      calendar: "gregorian",
    },
    determinism: {
      runtimeIntl: false,
      numberAlgorithm: "ecmascript-to-fixed-v1",
      timeZone: "UTC",
    },
    formats: reportFormats(),
    fieldFormats,
    collectionItemFormats,
  })
}

function scalarValue(value: unknown, path: string): ScalarValue {
  requireFact(value === null || typeof value === "string" || typeof value === "boolean"
    || (typeof value === "number" && Number.isFinite(value)), `${path} is not a scalar display value`)
  return value
}

function formatValue(input: {
  valueType: "text" | "number" | "date" | "boolean" | "enum"
  value: ScalarValue
  format: VNextDisplayFormatDefinitionV1
  path: string
}) {
  const result = formatVNextDisplayValueV1({
    contractVersion: 1,
    kind: "display-value-request",
    valueType: input.valueType,
    value: input.value,
    format: input.format,
  })
  requireFact(result.status === "formatted", `display formatting blocked at ${input.path}`)
  return result
}

function formatDocumentBindings(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  contract: VNextPublishedDisplayFormatContractV1,
): FlowDocCanonicalReportDocumentDisplayBindingV1[] {
  return templateBundle.scopedResolution.resolvedDocument.bindings.fields.map((binding) => {
    const definition = dataBundle.fieldContract.registry.fields[binding.fieldKey]
    requireFact(definition != null && definition.type !== "image" && definition.type !== "collection", `missing scalar definition ${binding.fieldKey}`)
    const rawValue = scalarValue(dataBundle.dataSnapshot.data.values[binding.fieldKey], `dataSnapshot.${binding.fieldKey}`)
    const formatKey = contract.fieldFormats[binding.fieldKey]
    const format = contract.formats[formatKey]
    requireFact(format != null, `missing format ${formatKey} for ${binding.fieldKey}`)
    const formatted = formatValue({ valueType: definition.type, value: rawValue, format, path: binding.fieldKey })
    requireFact(formatted.rawCanonicalText === binding.value, `raw document binding drift for ${binding.fieldKey}`)
    return {
      scope: "document-field",
      textBlockId: binding.textBlockId,
      inlineId: binding.inlineId,
      fieldKey: binding.fieldKey,
      valueType: definition.type,
      rawValue,
      rawResolvedValue: binding.value,
      rawCanonicalText: formatted.rawCanonicalText,
      formatKey,
      formatKind: formatted.formatKind,
      displayText: formatted.displayText,
    }
  })
}

function formatCollectionBindings(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  contract: VNextPublishedDisplayFormatContractV1,
): FlowDocCanonicalReportCollectionDisplayBindingsV1[] {
  return templateBundle.collectionTables.map((table) => {
    const shape = dataBundle.collectionItemContract.collections[table.collectionFieldKey]
    const collection = dataBundle.collectionSnapshot.collections[table.collectionFieldKey]
    requireFact(shape != null && collection != null, `missing collection source ${table.collectionFieldKey}`)
    const items = new Map(collection.items.map((item) => [item.itemKey, item]))
    const bindings = table.materializedContent.bindings.text.map((binding) => {
      requireFact(binding.scope === "collection-item-field", `non-item table binding ${binding.resolvedPlacementId}`)
      requireFact(typeof binding.itemKey === "string", `missing item key for ${binding.resolvedPlacementId}`)
      const itemKey = binding.itemKey
      const definition = shape.fields[binding.fieldKey]
      const item = items.get(itemKey)
      requireFact(definition != null && definition.type !== "image", `missing scalar item definition ${table.collectionFieldKey}.${binding.fieldKey}`)
      requireFact(item != null, `missing item ${table.collectionFieldKey}.${itemKey}`)
      const rawValue = scalarValue(item.values[binding.fieldKey], `collectionSnapshot.${table.collectionFieldKey}.${itemKey}.${binding.fieldKey}`)
      const formatKey = contract.collectionItemFormats[table.collectionFieldKey].fields[binding.fieldKey]
      const format = contract.formats[formatKey]
      requireFact(format != null, `missing item format ${formatKey}`)
      const formatted = formatValue({ valueType: definition.type, value: rawValue, format, path: `${table.collectionFieldKey}.${itemKey}.${binding.fieldKey}` })
      requireFact(formatted.rawCanonicalText === binding.value, `raw item binding drift for ${binding.resolvedPlacementId}`)
      return {
        scope: "collection-item-field" as const,
        collectionFieldKey: table.collectionFieldKey,
        itemKey,
        resolvedPlacementId: binding.resolvedPlacementId,
        sourcePlacementId: binding.sourcePlacementId,
        fieldKey: binding.fieldKey,
        valueType: definition.type,
        rawValue,
        rawResolvedValue: binding.value,
        rawCanonicalText: formatted.rawCanonicalText,
        formatKey,
        formatKind: formatted.formatKind,
        displayText: formatted.displayText,
      }
    })
    requireFact(table.materializedContent.bindings.images.length === 0, `R2C-A does not expect collection image bindings in ${table.collectionFieldKey}`)
    return { collectionFieldKey: table.collectionFieldKey, tableId: table.definition.tableId, bindings }
  })
}

function countCollectionBindings(bundle: FlowDocCanonicalReportDisplayFormattingBundleV1): number {
  return bundle.collectionTables.reduce((total, table) => total + table.bindings.length, 0)
}

function allBindings(bundle: FlowDocCanonicalReportDisplayFormattingBundleV1): Array<{
  rawResolvedValue: string
  displayText: string
}> {
  return [
    ...bundle.documentBindings,
    ...bundle.collectionTables.flatMap((table) => table.bindings),
  ]
}

function withoutFingerprint(
  bundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
): Omit<FlowDocCanonicalReportDisplayFormattingBundleV1, "bundleFingerprint"> {
  const { bundleFingerprint: _fingerprint, ...unsigned } = bundle
  return unsigned
}

function validateBundleInternal(
  value: unknown,
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
): FlowDocCanonicalReportDisplayFormattingValidationV1 {
  if (!isRecord(value)) return { status: "blocked", issues: [issue("invalid-bundle", "", "R2C-A bundle must be an object")], summary: null }
  const bundle = value as unknown as FlowDocCanonicalReportDisplayFormattingBundleV1
  const issues: FlowDocCanonicalReportDisplayFormattingIssueV1[] = []
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-display-formatting-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-A") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (!isRecord(bundle.formatContract)
    || !Array.isArray(bundle.documentBindings)
    || !Array.isArray(bundle.collectionTables)
    || !isRecord(bundle.measurementHandoff)
    || !isRecord(bundle.ownership)
    || !isRecord(bundle.execution)
    || !isRecord(bundle.summary)) {
    issues.push(issue("bundle-shape", "", "R2C-A bundle records and arrays are incomplete"))
    return { status: "blocked", issues, summary: null }
  }
  if (bundle.sourceDataBundleFingerprint !== dataBundle.bundleFingerprint
    || bundle.sourceDataBundleFingerprint !== ACCEPTED_DATA_BUNDLE_FINGERPRINT) issues.push(issue(
    "source-data-fingerprint", "sourceDataBundleFingerprint", "R2C-A must pin the accepted R2A data bundle",
  ))
  if (bundle.sourceTemplateBundleFingerprint !== templateBundle.bundleFingerprint
    || bundle.sourceTemplateBundleFingerprint !== ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT) issues.push(issue(
    "source-template-fingerprint", "sourceTemplateBundleFingerprint", "R2C-A must pin the accepted R2B template bundle",
  ))
  if (bundle.resolutionInputFingerprint !== templateBundle.resolutionInputFingerprint) issues.push(issue(
    "resolution-input-fingerprint", "resolutionInputFingerprint", "R2C-A must retain the R2B resolution input pin",
  ))
  if (JSON.stringify(bundle.instance) !== JSON.stringify(dataBundle.instance)) issues.push(issue(
    "instance-pin", "instance", "R2C-A must pin the exact R2A instance revision",
  ))

  const contractValidation = validateVNextPublishedDisplayFormatContractV1({
    contract: bundle.formatContract,
    fieldContract: dataBundle.fieldContract,
    collectionItemContract: dataBundle.collectionItemContract,
  })
  if (contractValidation.status !== "valid") contractValidation.issues.forEach((item) => issues.push(issue(
    `format-contract-${item.code}`, `formatContract.${item.path}`, item.message,
  )))
  const expectedContract = createFormatContract(dataBundle)
  if (JSON.stringify(bundle.formatContract) !== JSON.stringify(expectedContract)) issues.push(issue(
    "format-contract-drift", "formatContract", "canonical report format assignments or specifications differ",
  ))

  const expectedDocumentBindings = formatDocumentBindings(dataBundle, templateBundle, expectedContract)
  const expectedCollectionTables = formatCollectionBindings(dataBundle, templateBundle, expectedContract)
  if (JSON.stringify(bundle.documentBindings) !== JSON.stringify(expectedDocumentBindings)) issues.push(issue(
    "document-binding-drift", "documentBindings", "formatted document bindings differ from R2A/R2B source values",
  ))
  if (JSON.stringify(bundle.collectionTables) !== JSON.stringify(expectedCollectionTables)) issues.push(issue(
    "collection-binding-drift", "collectionTables", "formatted collection bindings differ from R2A/R2B source values",
  ))

  const collectionBindingCount = countCollectionBindings(bundle)
  const bindings = allBindings(bundle)
  const expectedHandoff: FlowDocCanonicalReportDisplayFormattingBundleV1["measurementHandoff"] = {
    status: "ready-for-measurement-request-preparation",
    consumes: "r2b-resolved-bindings-plus-r2c-display-overlay",
    rawValuesRetained: true,
    authoredGraphMutation: false,
    documentBindingCount: bundle.documentBindings.length,
    collectionBindingCount,
    tableGeometry: "not-run",
    measurementRequests: "not-run",
  }
  if (JSON.stringify(bundle.measurementHandoff) !== JSON.stringify(expectedHandoff)) issues.push(issue(
    "measurement-handoff", "measurementHandoff", "formatted binding handoff boundary differs",
  ))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue(
    "ownership-boundary", "ownership", "R2C-A ownership boundary differs",
  ))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue(
    "execution-boundary", "execution", "R2C-A execution boundary differs",
  ))
  const expectedSummary: FlowDocCanonicalReportDisplayFormattingBundleV1["summary"] = {
    formatCount: Object.keys(bundle.formatContract.formats).length,
    fieldFormatAssignmentCount: Object.keys(bundle.formatContract.fieldFormats).length,
    collectionFormatAssignmentCount: Object.values(bundle.formatContract.collectionItemFormats).reduce(
      (total, entry) => total + Object.keys(entry.fields).length,
      0,
    ),
    documentBindingCount: bundle.documentBindings.length,
    collectionBindingCount,
    totalFormattedBindingCount: bindings.length,
    changedDisplayTextCount: bindings.filter((binding) => binding.rawResolvedValue !== binding.displayText).length,
  }
  if (JSON.stringify(bundle.summary) !== JSON.stringify(expectedSummary)) issues.push(issue(
    "summary", "summary", "R2C-A summary differs from formatted bindings",
  ))
  const forbidden = /"(?:lines|xPt|yPt|glyphs|paintCommands|pageBoxes|measurementRequestId)"/u
  if (forbidden.test(JSON.stringify(bundle))) issues.push(issue(
    "downstream-fact", "", "R2C-A must not retain measurement, layout, pagination, or paint facts",
  ))
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle)))) issues.push(issue(
    "bundle-fingerprint", "bundleFingerprint", "R2C-A bundle fingerprint does not match content",
  ))
  return issues.length === 0
    ? { status: "valid", issues: [], summary: expectedSummary }
    : { status: "blocked", issues, summary: null }
}

export function validateFlowDocCanonicalReportDisplayFormattingBundleV1(
  value: unknown,
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
): FlowDocCanonicalReportDisplayFormattingValidationV1 {
  try {
    return validateBundleInternal(value, dataBundle, templateBundle)
  } catch {
    return {
      status: "blocked",
      issues: [issue("invalid-bundle-shape", "", "R2C-A bundle contains malformed nested content")],
      summary: null,
    }
  }
}

export function createFlowDocCanonicalReportDisplayFormattingBundleV1(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
): FlowDocCanonicalReportDisplayFormattingBundleV1 {
  requireFact(validateFlowDocCanonicalReportDataBundleV1(dataBundle).status === "valid", "R2C-A requires an accepted R2A data bundle")
  requireFact(validateFlowDocCanonicalReportTemplateResolutionBundleV1(templateBundle).status === "valid", "R2C-A requires an accepted R2B template bundle")
  requireFact(dataBundle.bundleFingerprint === ACCEPTED_DATA_BUNDLE_FINGERPRINT, "R2C-A data bundle fingerprint differs")
  requireFact(templateBundle.bundleFingerprint === ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT, "R2C-A template bundle fingerprint differs")
  const formatContract = createFormatContract(dataBundle)
  const contractValidation = validateVNextPublishedDisplayFormatContractV1({
    contract: formatContract,
    fieldContract: dataBundle.fieldContract,
    collectionItemContract: dataBundle.collectionItemContract,
  })
  requireFact(contractValidation.status === "valid", "canonical report display format contract is invalid")
  const documentBindings = formatDocumentBindings(dataBundle, templateBundle, formatContract)
  const collectionTables = formatCollectionBindings(dataBundle, templateBundle, formatContract)
  const collectionBindingCount = collectionTables.reduce((total, table) => total + table.bindings.length, 0)
  const all = [...documentBindings, ...collectionTables.flatMap((table) => table.bindings)]
  const unsigned: Omit<FlowDocCanonicalReportDisplayFormattingBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-display-formatting-bundle",
    phaseId: "PDF-PILOT-08B-R2C-A",
    sourceDataBundleFingerprint: dataBundle.bundleFingerprint,
    sourceTemplateBundleFingerprint: templateBundle.bundleFingerprint,
    resolutionInputFingerprint: templateBundle.resolutionInputFingerprint,
    instance: clone(dataBundle.instance),
    formatContract,
    documentBindings,
    collectionTables,
    measurementHandoff: {
      status: "ready-for-measurement-request-preparation",
      consumes: "r2b-resolved-bindings-plus-r2c-display-overlay",
      rawValuesRetained: true,
      authoredGraphMutation: false,
      documentBindingCount: documentBindings.length,
      collectionBindingCount,
      tableGeometry: "not-run",
      measurementRequests: "not-run",
    },
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      formatCount: Object.keys(formatContract.formats).length,
      fieldFormatAssignmentCount: Object.keys(formatContract.fieldFormats).length,
      collectionFormatAssignmentCount: Object.values(formatContract.collectionItemFormats).reduce(
        (total, entry) => total + Object.keys(entry.fields).length,
        0,
      ),
      documentBindingCount: documentBindings.length,
      collectionBindingCount,
      totalFormattedBindingCount: all.length,
      changedDisplayTextCount: all.filter((binding) => binding.rawResolvedValue !== binding.displayText).length,
    },
  }
  const bundle: FlowDocCanonicalReportDisplayFormattingBundleV1 = {
    ...unsigned,
    bundleFingerprint: sha256(JSON.stringify(unsigned)),
  }
  const validation = validateFlowDocCanonicalReportDisplayFormattingBundleV1(bundle, dataBundle, templateBundle)
  requireFact(validation.status === "valid", "generated R2C-A display formatting bundle is invalid")
  return bundle
}
