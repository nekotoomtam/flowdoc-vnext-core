import { createHash } from "node:crypto"
import {
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextDocumentInstanceIdentityV1Schema,
  VNextPublishedCollectionItemContractV1Schema,
  VNextPublishedFieldContractV1Schema,
  VNextTableCollectionSnapshotV1Schema,
  type DataSnapshotV2Value,
  type FieldDefinitionV1V3,
  type ImageAssetDefinition,
  type VNextCollectionItemFieldDefinitionV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextInstanceDataSnapshotV1,
  type VNextInstanceMediaSnapshotV1,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedStructureVersionRefV1,
  type VNextTableCollectionItemV1,
  type VNextTableCollectionSnapshotV1,
} from "@flowdoc/vnext-core"

export const FLOWDOC_CANONICAL_REPORT_DATA_BUNDLE_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_DATA_ADAPTER_ID = "pdf-pilot-ocr-benchmark-report-data-adapter-v1" as const

export type FlowDocCanonicalReportDataDerivation = "copy" | "aggregate" | "comparison" | "media-identity"

export interface FlowDocCanonicalReportSourceFileIdentity {
  sourceId: string
  fileName: string
  mediaType: string
  role: string
  bytes: number
  sha256: string
}

export interface FlowDocCanonicalReportMediaInput {
  fieldKey: string
  assetId: string
  fileName: string
  mediaType: "image/png" | "image/jpeg"
  byteLength: number
  sha256: string
  widthPx: number
  heightPx: number
}

export interface FlowDocCanonicalReportSourceModel {
  metrics: any
  spec: any
  truth: any
}

export interface FlowDocCanonicalReportDataAdapterInput {
  sourceFiles: FlowDocCanonicalReportSourceFileIdentity[]
  sourceSnapshotSha256: string
  sourceModel: FlowDocCanonicalReportSourceModel
  media: FlowDocCanonicalReportMediaInput[]
}

export interface FlowDocCanonicalReportScalarProvenance {
  fieldKey: string
  sourcePointers: string[]
  derivation: FlowDocCanonicalReportDataDerivation
}

export interface FlowDocCanonicalReportCollectionItemProvenance {
  itemKey: string
  sourcePointers: string[]
  derivation: FlowDocCanonicalReportDataDerivation
}

export interface FlowDocCanonicalReportCollectionProvenance {
  collectionFieldKey: string
  items: Record<string, FlowDocCanonicalReportCollectionItemProvenance>
}

export interface FlowDocCanonicalReportMediaProvenance {
  fieldKey: string
  assetId: string
  sourcePointer: string
  derivation: "media-identity"
}

export interface FlowDocCanonicalReportDataBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_DATA_BUNDLE_VERSION
  kind: "canonical-report-data-bundle"
  adapterId: typeof FLOWDOC_CANONICAL_REPORT_DATA_ADAPTER_ID
  benchmarkId: string
  sourceSet: {
    sourceSetId: string
    sourceSnapshotSha256: string
    dataFiles: FlowDocCanonicalReportSourceFileIdentity[]
    mediaFiles: Array<Omit<FlowDocCanonicalReportMediaInput, "fieldKey">>
  }
  structureVersion: VNextPublishedStructureVersionRefV1
  instance: VNextDocumentInstanceIdentityV1
  fieldContract: VNextPublishedFieldContractV1
  collectionItemContract: VNextPublishedCollectionItemContractV1
  dataSnapshot: VNextInstanceDataSnapshotV1
  collectionSnapshot: VNextTableCollectionSnapshotV1
  mediaSnapshot: VNextInstanceMediaSnapshotV1
  provenance: {
    contractVersion: 1
    kind: "canonical-report-data-provenance"
    sourceSetId: string
    scalars: Record<string, FlowDocCanonicalReportScalarProvenance>
    collections: Record<string, FlowDocCanonicalReportCollectionProvenance>
    media: Record<string, FlowDocCanonicalReportMediaProvenance>
  }
  ownership: {
    adapterOwns: ["typed-source-facts", "stable-field-keys", "stable-collection-items", "source-provenance"]
    adapterMustNotOwn: [
      "template-prose",
      "display-formatting",
      "authored-visual-lines",
      "layout-coordinates",
      "glyph-shaping",
      "page-breaking",
      "pdf-bytes",
    ]
  }
  execution: {
    templateResolution: "not-run"
    textMeasurement: "not-run"
    lineBreaking: "not-run"
    layout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    fieldCount: number
    scalarValueCount: number
    collectionCount: number
    collectionItemCount: number
    mediaAssetCount: number
    dataSourceFileCount: number
    mediaSourceFileCount: number
    scalarProvenanceCount: number
    collectionProvenanceItemCount: number
    mediaProvenanceCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportDataBundleIssue {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportDataBundleValidation =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportDataBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportDataBundleIssue[]; summary: null }

interface CollectionItemInput {
  itemKey: string
  values: Record<string, DataSnapshotV2Value>
  sourcePointers: string[]
  derivation?: FlowDocCanonicalReportDataDerivation
}

interface CollectionInput {
  fieldKey: string
  label: string
  itemFields: VNextCollectionItemFieldDefinitionV1[]
  items: CollectionItemInput[]
}

const OCR_ENGINES = ["google_vision", "azure_document_intelligence"] as const
const NATIVE_ENGINES = ["google_document_ai_native", "azure_document_intelligence_native"] as const
const ALL_ENGINES = [...OCR_ENGINES, ...NATIVE_ENGINES] as const
const REPORT_COLLECTION_KEYS = [
  "report.runs",
  "report.ocr_runs",
  "report.native_runs",
  "report.native_missing_concepts",
  "report.mapping_fields",
  "report.gdim_expected_fields",
] as const
const EXPECTED_OWNERSHIP: FlowDocCanonicalReportDataBundleV1["ownership"] = {
  adapterOwns: ["typed-source-facts", "stable-field-keys", "stable-collection-items", "source-provenance"],
  adapterMustNotOwn: [
    "template-prose",
    "display-formatting",
    "authored-visual-lines",
    "layout-coordinates",
    "glyph-shaping",
    "page-breaking",
    "pdf-bytes",
  ],
}
const EXPECTED_EXECUTION: FlowDocCanonicalReportDataBundleV1["execution"] = {
  templateResolution: "not-run",
  textMeasurement: "not-run",
  lineBreaking: "not-run",
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

function issue(code: string, path: string, message: string): FlowDocCanonicalReportDataBundleIssue {
  return { code, path, message, severity: "error" }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/u.test(value)
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Canonical report data adapter failed: ${message}`)
}

function summary(metrics: any, engine: string, metric: string, stat = "median"): number {
  const value = metrics.engines?.[engine]?.summary?.[metric]?.[stat]
  requireFact(typeof value === "number" && Number.isFinite(value), `missing ${engine}/${metric}/${stat}`)
  return value
}

function stableRunValue(metrics: any, engine: string, key: string): any {
  const runs = metrics.engines?.[engine]?.runs
  requireFact(Array.isArray(runs) && runs.length > 0, `missing runs for ${engine}`)
  const first = JSON.stringify(runs[0][key])
  requireFact(runs.every((run: any) => JSON.stringify(run[key]) === first), `${engine}/${key} changes across runs`)
  return clone(runs[0][key])
}

function stableMapping(metrics: any, engine: string): any {
  const records = metrics.forcedGdim?.filter((record: any) => record.engine === engine)
  requireFact(Array.isArray(records) && records.length > 0, `missing forced GDIM records for ${engine}`)
  const comparable = (record: any) => JSON.stringify({
    totalSchemaFields: record.totalSchemaFields,
    mappedFields: record.mappedFields,
    requiredFields: record.requiredFields,
    mappedRequiredFields: record.mappedRequiredFields,
    expectedDerivableFields: record.expectedDerivableFields,
    correctMappedFields: record.correctMappedFields,
    mappingPrecision: record.mappingPrecision,
    mappingRecall: record.mappingRecall,
    wrongMappings: record.wrongMappings,
    mapped: record.mapped,
  })
  const first = comparable(records[0])
  requireFact(records.every((record: any) => comparable(record) === first), `${engine} mapping changes across runs`)
  return records[0]
}

function structureVersion(): VNextPublishedStructureVersionRefV1 {
  return {
    structureId: "structure-ocr-benchmark-report",
    structureVersionId: "structure-ocr-benchmark-report-v1",
    versionOrdinal: 1,
  }
}

function instanceIdentity(benchmarkId: string): VNextDocumentInstanceIdentityV1 {
  return {
    contractVersion: 1,
    kind: "document-instance",
    instanceId: `instance-ocr-benchmark-${benchmarkId.toLowerCase()}`,
    revision: 1,
    structureVersion: structureVersion(),
  }
}

function field(key: string, label: string, type: FieldDefinitionV1V3["type"]): FieldDefinitionV1V3 {
  return { key, label, type }
}

function itemField(
  key: string,
  label: string,
  type: VNextCollectionItemFieldDefinitionV1["type"],
): VNextCollectionItemFieldDefinitionV1 {
  return { key, label, type, required: true }
}

function valueMatches(type: FieldDefinitionV1V3["type"] | VNextCollectionItemFieldDefinitionV1["type"], value: DataSnapshotV2Value): boolean {
  if (value === null) return true
  if (type === "number") return typeof value === "number" && Number.isFinite(value)
  if (type === "boolean") return typeof value === "boolean"
  if (type === "image") return typeof value === "object" && value.kind === "image-asset-ref"
  if (type === "collection") return false
  return typeof value === "string"
}

function pathString(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => (
    typeof segment === "number"
      ? `${current}[${segment}]`
      : current === "" ? String(segment) : `${current}.${String(segment)}`
  ), "")
}

function addSchemaIssues(
  issues: FlowDocCanonicalReportDataBundleIssue[],
  prefix: string,
  result: { success: boolean; error?: { issues: Array<{ code: string; path: PropertyKey[]; message: string }> } },
): void {
  if (result.success) return
  for (const item of result.error?.issues ?? []) {
    const suffix = pathString(item.path)
    issues.push(issue(item.code, suffix === "" ? prefix : `${prefix}.${suffix}`, item.message))
  }
}

function sameInstance(left: VNextDocumentInstanceIdentityV1, right: VNextDocumentInstanceIdentityV1): boolean {
  return left.instanceId === right.instanceId
    && left.revision === right.revision
    && JSON.stringify(left.structureVersion) === JSON.stringify(right.structureVersion)
}

function sameStringSet(left: string[], right: string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
}

function countCollectionItems(snapshot: VNextTableCollectionSnapshotV1): number {
  return Object.values(snapshot.collections).reduce((total, collection) => total + collection.items.length, 0)
}

function countCollectionProvenanceItems(bundle: FlowDocCanonicalReportDataBundleV1): number {
  return Object.values(bundle.provenance.collections).reduce(
    (total, collection) => total + Object.keys(collection.items).length,
    0,
  )
}

function withoutFingerprint(bundle: FlowDocCanonicalReportDataBundleV1): Omit<FlowDocCanonicalReportDataBundleV1, "bundleFingerprint"> {
  const { bundleFingerprint: _fingerprint, ...unsigned } = bundle
  return unsigned
}

function bundleFingerprint(bundle: Omit<FlowDocCanonicalReportDataBundleV1, "bundleFingerprint">): string {
  return sha256(JSON.stringify(bundle))
}

function validateNoLayoutFacts(value: unknown, path = "", issues: FlowDocCanonicalReportDataBundleIssue[] = []): FlowDocCanonicalReportDataBundleIssue[] {
  const forbidden = new Set([
    "lines",
    "xPt",
    "yPt",
    "widthPt",
    "heightPt",
    "glyphs",
    "paintCommands",
    "pageBoxes",
    "fontSizePt",
    "measurementRequestId",
  ])
  if (Array.isArray(value)) value.forEach((item, index) => validateNoLayoutFacts(item, `${path}[${index}]`, issues))
  else if (typeof value === "object" && value != null) {
    for (const [key, child] of Object.entries(value)) {
      const childPath = path === "" ? key : `${path}.${key}`
      if (forbidden.has(key)) issues.push(issue("layout-fact-forbidden", childPath, `${key} is outside the report data adapter boundary`))
      validateNoLayoutFacts(child, childPath, issues)
    }
  }
  return issues
}

export function validateFlowDocCanonicalReportDataBundleV1(
  value: unknown,
): FlowDocCanonicalReportDataBundleValidation {
  if (typeof value !== "object" || value == null) {
    return { status: "blocked", issues: [issue("invalid-bundle", "", "bundle must be an object")], summary: null }
  }
  const bundle = value as FlowDocCanonicalReportDataBundleV1
  const issues: FlowDocCanonicalReportDataBundleIssue[] = []
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-data-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.adapterId !== FLOWDOC_CANONICAL_REPORT_DATA_ADAPTER_ID) issues.push(issue("adapter-id", "adapterId", "unexpected adapter identity"))

  if (!isRecord(bundle.sourceSet)
    || !Array.isArray(bundle.sourceSet.dataFiles)
    || !Array.isArray(bundle.sourceSet.mediaFiles)) {
    issues.push(issue("source-set-shape", "sourceSet", "source set and file identity arrays are required"))
  }
  if (!isRecord(bundle.provenance)
    || !isRecord(bundle.provenance.scalars)
    || !isRecord(bundle.provenance.collections)
    || !isRecord(bundle.provenance.media)) {
    issues.push(issue("provenance-shape", "provenance", "scalar, collection, and media provenance maps are required"))
  }
  if (!isRecord(bundle.ownership) || !isRecord(bundle.execution) || !isRecord(bundle.summary)) {
    issues.push(issue("bundle-boundary-shape", "", "ownership, execution, and summary records are required"))
  }
  if (issues.some((item) => item.code.endsWith("-shape"))) {
    return { status: "blocked", issues, summary: null }
  }

  addSchemaIssues(issues, "instance", VNextDocumentInstanceIdentityV1Schema.safeParse(bundle.instance))
  addSchemaIssues(issues, "fieldContract", VNextPublishedFieldContractV1Schema.safeParse(bundle.fieldContract))
  addSchemaIssues(issues, "collectionItemContract", VNextPublishedCollectionItemContractV1Schema.safeParse(bundle.collectionItemContract))
  addSchemaIssues(issues, "dataSnapshot", VNextInstanceDataSnapshotV1Schema.safeParse(bundle.dataSnapshot))
  addSchemaIssues(issues, "collectionSnapshot", VNextTableCollectionSnapshotV1Schema.safeParse(bundle.collectionSnapshot))
  addSchemaIssues(issues, "mediaSnapshot", VNextInstanceMediaSnapshotV1Schema.safeParse(bundle.mediaSnapshot))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }

  const invalidDataFile = bundle.sourceSet.dataFiles.find((file) => (
    !isRecord(file)
    || typeof file.sourceId !== "string"
    || typeof file.fileName !== "string"
    || typeof file.mediaType !== "string"
    || typeof file.role !== "string"
    || !Number.isSafeInteger(file.bytes)
    || file.bytes < 0
    || !isSha256(file.sha256)
  ))
  const invalidMediaFile = bundle.sourceSet.mediaFiles.find((file) => (
    !isRecord(file)
    || typeof file.assetId !== "string"
    || typeof file.fileName !== "string"
    || (file.mediaType !== "image/png" && file.mediaType !== "image/jpeg")
    || !Number.isSafeInteger(file.byteLength)
    || file.byteLength < 0
    || !isSha256(file.sha256)
    || !Number.isSafeInteger(file.widthPx)
    || file.widthPx <= 0
    || !Number.isSafeInteger(file.heightPx)
    || file.heightPx <= 0
  ))
  if (invalidDataFile != null) issues.push(issue("data-file-identity", "sourceSet.dataFiles", "data source identities must be complete and hash pinned"))
  if (invalidMediaFile != null) issues.push(issue("media-file-identity", "sourceSet.mediaFiles", "media source identities must be complete and hash pinned"))
  if (invalidDataFile != null || invalidMediaFile != null) {
    return { status: "blocked", issues, summary: null }
  }
  if (!isSha256(bundle.sourceSet.sourceSnapshotSha256)) {
    issues.push(issue("source-snapshot-hash", "sourceSet.sourceSnapshotSha256", "source snapshot SHA-256 is required"))
  }
  const dataSourceIds = bundle.sourceSet.dataFiles.map((file) => file.sourceId)
  const mediaSourceIds = bundle.sourceSet.mediaFiles.map((file) => file.assetId)
  if (new Set(dataSourceIds).size !== dataSourceIds.length) {
    issues.push(issue("duplicate-data-source", "sourceSet.dataFiles", "data source IDs must be unique"))
  }
  if (new Set(mediaSourceIds).size !== mediaSourceIds.length) {
    issues.push(issue("duplicate-media-source", "sourceSet.mediaFiles", "media asset IDs must be unique"))
  }
  const expectedSourceSetId = `source-set-${sha256(JSON.stringify({
    data: bundle.sourceSet.dataFiles.map((file) => [file.sourceId, file.sha256]),
    media: bundle.sourceSet.mediaFiles.map((file) => [file.assetId, file.sha256]),
  })).slice(0, 24)}`
  if (bundle.sourceSet.sourceSetId !== expectedSourceSetId) {
    issues.push(issue("source-set-id", "sourceSet.sourceSetId", "source set ID does not match pinned file hashes"))
  }
  if (bundle.provenance.sourceSetId !== bundle.sourceSet.sourceSetId) {
    issues.push(issue("provenance-source-set", "provenance.sourceSetId", "provenance must pin the source set"))
  }
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) {
    issues.push(issue("ownership-boundary", "ownership", "adapter ownership boundary differs from version 1"))
  }
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) {
    issues.push(issue("execution-boundary", "execution", "R2A must not claim downstream execution"))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }

  if (JSON.stringify(bundle.fieldContract.owner) !== JSON.stringify(bundle.structureVersion)) {
    issues.push(issue("field-owner", "fieldContract.owner", "field contract must pin the bundle structure version"))
  }
  if (JSON.stringify(bundle.collectionItemContract.owner) !== JSON.stringify(bundle.structureVersion)) {
    issues.push(issue("collection-owner", "collectionItemContract.owner", "collection contract must pin the bundle structure version"))
  }
  if (bundle.collectionItemContract.publishedFieldContractId !== bundle.fieldContract.fieldContractId) {
    issues.push(issue("field-contract-id", "collectionItemContract.publishedFieldContractId", "collection contract must pin the field contract"))
  }
  for (const [path, candidate] of [
    ["dataSnapshot.instance", bundle.dataSnapshot.instance],
    ["collectionSnapshot.instance", bundle.collectionSnapshot.instance],
    ["mediaSnapshot.instance", bundle.mediaSnapshot.instance],
  ] as const) {
    if (!sameInstance(candidate, bundle.instance)) issues.push(issue("instance-pin", path, "snapshot must pin the exact bundle instance revision"))
  }

  const definitions = bundle.fieldContract.registry.fields
  const values = bundle.dataSnapshot.data.values
  const collectionDefinitions = Object.values(definitions).filter((definition) => definition.type === "collection")
  const scalarDefinitions = Object.values(definitions).filter((definition) => definition.type !== "collection")
  if (!sameStringSet(Object.keys(values), scalarDefinitions.map((definition) => definition.key))) {
    issues.push(issue("scalar-key-set", "dataSnapshot.data.values", "scalar/image values must exactly cover non-collection fields"))
  }
  for (const [key, scalarValue] of Object.entries(values)) {
    const definition = definitions[key]
    if (definition == null || !valueMatches(definition.type, scalarValue)) {
      issues.push(issue("scalar-value-type", `dataSnapshot.data.values.${key}`, "value is incompatible with its field definition"))
    }
    if (definition?.type === "image" && scalarValue != null && typeof scalarValue === "object") {
      if (bundle.mediaSnapshot.registry.images[scalarValue.assetId] == null) {
        issues.push(issue("missing-instance-media", `dataSnapshot.data.values.${key}`, `image asset ${scalarValue.assetId} is missing`))
      }
    }
  }

  const collectionKeys = collectionDefinitions.map((definition) => definition.key)
  if (!sameStringSet(Object.keys(bundle.collectionSnapshot.collections), collectionKeys)) {
    issues.push(issue("collection-key-set", "collectionSnapshot.collections", "collection snapshot must exactly cover collection fields"))
  }
  if (!sameStringSet(collectionKeys, [...REPORT_COLLECTION_KEYS])) {
    issues.push(issue("canonical-collection-key-set", "collectionSnapshot.collections", "canonical report collection fields differ from version 1"))
  }
  if (!sameStringSet(Object.keys(bundle.collectionItemContract.collections), collectionKeys)) {
    issues.push(issue("collection-contract-key-set", "collectionItemContract.collections", "collection item contract must exactly cover collection fields"))
  }
  for (const [collectionKey, collection] of Object.entries(bundle.collectionSnapshot.collections)) {
    const shape = bundle.collectionItemContract.collections[collectionKey]
    if (shape == null) continue
    for (const [itemIndex, item] of collection.items.entries()) {
      if (!sameStringSet(Object.keys(item.values), Object.keys(shape.fields))) {
        issues.push(issue("collection-item-key-set", `collectionSnapshot.collections.${collectionKey}.items[${itemIndex}].values`, "item values must exactly cover its locked item shape"))
      }
      for (const [itemFieldKey, itemValue] of Object.entries(item.values)) {
        const itemDefinition = shape.fields[itemFieldKey]
        if (itemDefinition == null || !valueMatches(itemDefinition.type, itemValue)) {
          issues.push(issue("collection-item-value-type", `collectionSnapshot.collections.${collectionKey}.items[${itemIndex}].values.${itemFieldKey}`, "item value is incompatible with its field definition"))
        }
      }
    }
  }

  if (!sameStringSet(Object.keys(bundle.provenance.scalars), Object.keys(values))) {
    issues.push(issue("scalar-provenance", "provenance.scalars", "scalar provenance must exactly cover snapshot values"))
  }
  for (const [fieldKey, provenance] of Object.entries(bundle.provenance.scalars)) {
    if (!isRecord(provenance)
      || provenance.fieldKey !== fieldKey
      || !Array.isArray(provenance.sourcePointers)
      || provenance.sourcePointers.length === 0
      || provenance.sourcePointers.some((pointer) => typeof pointer !== "string" || pointer.length === 0)) {
      issues.push(issue("scalar-provenance-entry", `provenance.scalars.${fieldKey}`, "scalar provenance must name its field and at least one source pointer"))
    }
  }
  if (!sameStringSet(Object.keys(bundle.provenance.collections), collectionKeys)) {
    issues.push(issue("collection-provenance", "provenance.collections", "collection provenance must exactly cover snapshot collections"))
  }
  for (const [collectionKey, collection] of Object.entries(bundle.collectionSnapshot.collections)) {
    const provenance = bundle.provenance.collections[collectionKey]
    if (provenance == null || provenance.collectionFieldKey !== collectionKey || !isRecord(provenance.items)) {
      issues.push(issue("collection-provenance-entry", `provenance.collections.${collectionKey}`, "collection provenance must name its collection and retain an item map"))
      continue
    }
    if (provenance != null && !sameStringSet(
      Object.keys(provenance.items),
      collection.items.map((item) => item.itemKey),
    )) issues.push(issue("collection-item-provenance", `provenance.collections.${collectionKey}.items`, "item provenance must exactly cover collection items"))
    for (const [itemKey, itemProvenance] of Object.entries(provenance.items)) {
      if (!isRecord(itemProvenance)
        || itemProvenance.itemKey !== itemKey
        || !Array.isArray(itemProvenance.sourcePointers)
        || itemProvenance.sourcePointers.length === 0
        || itemProvenance.sourcePointers.some((pointer) => typeof pointer !== "string" || pointer.length === 0)) {
        issues.push(issue("collection-item-provenance-entry", `provenance.collections.${collectionKey}.items.${itemKey}`, "collection item provenance must name its item and at least one source pointer"))
      }
    }
  }
  const imageFields = Object.values(definitions).filter((definition) => definition.type === "image").map((definition) => definition.key)
  if (!sameStringSet(Object.keys(bundle.provenance.media), imageFields)) {
    issues.push(issue("media-provenance", "provenance.media", "media provenance must exactly cover image fields"))
  }
  if (!sameStringSet(mediaSourceIds, Object.keys(bundle.mediaSnapshot.registry.images))) {
    issues.push(issue("media-source-key-set", "sourceSet.mediaFiles", "media sources must exactly cover the instance media registry"))
  }
  for (const mediaFile of bundle.sourceSet.mediaFiles) {
    const image = bundle.mediaSnapshot.registry.images[mediaFile.assetId]
    if (image == null
      || image.mediaType !== mediaFile.mediaType
      || image.byteLength !== mediaFile.byteLength
      || image.digest.algorithm !== "sha256"
      || image.digest.value !== mediaFile.sha256
      || image.intrinsic.widthPx !== mediaFile.widthPx
      || image.intrinsic.heightPx !== mediaFile.heightPx) {
      issues.push(issue("media-identity-pin", `mediaSnapshot.registry.images.${mediaFile.assetId}`, "instance media identity differs from its pinned source"))
    }
  }
  for (const fieldKey of imageFields) {
    const fieldValue = values[fieldKey]
    const provenance = bundle.provenance.media[fieldKey]
    if (fieldValue == null || typeof fieldValue !== "object"
      || !isRecord(provenance)
      || provenance.fieldKey !== fieldKey
      || provenance.assetId !== fieldValue.assetId
      || provenance.derivation !== "media-identity"
      || typeof provenance.sourcePointer !== "string"
      || provenance.sourcePointer.length === 0) {
      issues.push(issue("media-provenance-entry", `provenance.media.${fieldKey}`, "media provenance must bind the image field to its exact asset"))
    }
  }
  issues.push(...validateNoLayoutFacts(bundle))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }

  const expectedSummary: FlowDocCanonicalReportDataBundleV1["summary"] = {
    fieldCount: Object.keys(definitions).length,
    scalarValueCount: Object.keys(values).length,
    collectionCount: Object.keys(bundle.collectionSnapshot.collections).length,
    collectionItemCount: countCollectionItems(bundle.collectionSnapshot),
    mediaAssetCount: Object.keys(bundle.mediaSnapshot.registry.images).length,
    dataSourceFileCount: bundle.sourceSet.dataFiles.length,
    mediaSourceFileCount: bundle.sourceSet.mediaFiles.length,
    scalarProvenanceCount: Object.keys(bundle.provenance.scalars).length,
    collectionProvenanceItemCount: countCollectionProvenanceItems(bundle),
    mediaProvenanceCount: Object.keys(bundle.provenance.media).length,
  }
  if (JSON.stringify(bundle.summary) !== JSON.stringify(expectedSummary)) {
    issues.push(issue("summary", "summary", "bundle summary does not match retained contracts"))
  }
  if (bundle.bundleFingerprint !== bundleFingerprint(withoutFingerprint(bundle))) {
    issues.push(issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"))
  }
  return issues.length === 0
    ? { status: "valid", issues: [], summary: expectedSummary }
    : { status: "blocked", issues, summary: null }
}

export function createFlowDocCanonicalReportDataBundleV1(
  input: FlowDocCanonicalReportDataAdapterInput,
): FlowDocCanonicalReportDataBundleV1 {
  const { metrics, spec, truth } = input.sourceModel
  requireFact(metrics.benchmarkId === spec.benchmarkId, "metrics/spec benchmark mismatch")
  requireFact(truth.criticalValues?.length === 29, "expected 29 critical values")
  requireFact(truth.nativeConcepts?.length === 25, "expected 25 native concepts")
  requireFact(truth.gdimFields?.length === 32, "expected 32 derivable GDIM fields")
  for (const flag of ["allRunsCompleted", "allSourceHashesMatch", "allRunsHaveTwoPagesPerEngine", "noErrors"]) {
    requireFact(metrics.validation?.[flag] === true, `metrics validation ${flag} is not true`)
  }
  requireFact(spec.runs?.length === metrics.validation.runs?.length, "spec/validation run count mismatch")

  const owner = structureVersion()
  const instance = instanceIdentity(spec.benchmarkId)
  const fields: Record<string, FieldDefinitionV1V3> = {}
  const values: Record<string, DataSnapshotV2Value> = {}
  const scalarProvenance: Record<string, FlowDocCanonicalReportScalarProvenance> = {}
  const collectionShapes: VNextPublishedCollectionItemContractV1["collections"] = {}
  const snapshotCollections: VNextTableCollectionSnapshotV1["collections"] = {}
  const collectionProvenance: Record<string, FlowDocCanonicalReportCollectionProvenance> = {}
  const mediaImages: Record<string, ImageAssetDefinition> = {}
  const mediaProvenance: Record<string, FlowDocCanonicalReportMediaProvenance> = {}

  const addValue = (
    key: string,
    label: string,
    type: FieldDefinitionV1V3["type"],
    value: DataSnapshotV2Value,
    sourcePointers: string[],
    derivation: FlowDocCanonicalReportDataDerivation = "copy",
  ): void => {
    requireFact(fields[key] == null, `duplicate field ${key}`)
    requireFact(type !== "collection", `scalar helper cannot add collection ${key}`)
    requireFact(valueMatches(type, value), `value type mismatch for ${key}`)
    fields[key] = field(key, label, type)
    values[key] = clone(value)
    scalarProvenance[key] = { fieldKey: key, sourcePointers: [...sourcePointers], derivation }
  }

  const addCollection = (collection: CollectionInput): void => {
    requireFact(fields[collection.fieldKey] == null, `duplicate collection field ${collection.fieldKey}`)
    fields[collection.fieldKey] = field(collection.fieldKey, collection.label, "collection")
    collectionShapes[collection.fieldKey] = {
      collectionFieldKey: collection.fieldKey,
      fields: Object.fromEntries(collection.itemFields.map((definition) => [definition.key, clone(definition)])),
    }
    snapshotCollections[collection.fieldKey] = {
      collectionFieldKey: collection.fieldKey,
      items: collection.items.map((item): VNextTableCollectionItemV1 => ({
        itemKey: item.itemKey,
        values: clone(item.values),
      })),
    }
    collectionProvenance[collection.fieldKey] = {
      collectionFieldKey: collection.fieldKey,
      items: Object.fromEntries(collection.items.map((item) => [item.itemKey, {
        itemKey: item.itemKey,
        sourcePointers: [...item.sourcePointers],
        derivation: item.derivation ?? "copy",
      }])),
    }
  }

  const sourceDate = spec.benchmarkId.match(/(\d{4}-\d{2}-\d{2})$/u)?.[1]
  requireFact(sourceDate != null, "benchmark ID must end with an ISO date")
  addValue("report.benchmark_id", "Benchmark ID", "text", spec.benchmarkId, ["benchmark-spec.json#/benchmarkId"])
  addValue("report.version", "Report version", "text", "1.0", ["build_report.py#/build_document"], "copy")
  addValue("report.test_date", "Test date", "date", sourceDate, ["benchmark-spec.json#/benchmarkId"])
  addValue("report.metrics_generated_at", "Metrics generated at", "date", metrics.generatedAt, ["metrics.json#/generatedAt"])
  addValue("report.truth_method", "Ground-truth method", "text", truth.method, ["ground-truth.json#/method"])
  addValue("report.scope_warning", "Scope warning", "text", truth.scopeWarning, ["ground-truth.json#/scopeWarning"])
  addValue("report.source.file_name", "Source file name", "text", spec.source.fileName, ["benchmark-spec.json#/source/fileName"])
  addValue("report.source.sha256", "Source SHA-256", "text", spec.source.sha256, ["benchmark-spec.json#/source/sha256"])
  addValue("report.source.page_count", "Source page count", "number", spec.source.pages, ["benchmark-spec.json#/source/pages"])
  addValue("report.source.size_bytes", "Source byte length", "number", spec.source.sizeBytes, ["benchmark-spec.json#/source/sizeBytes"])
  for (const [key, label, type, value, sourceKey] of [
    ["report.settings.processing_scope", "Processing scope", "enum", spec.settings.processingScope, "processingScope"],
    ["report.settings.submit_mode", "Submit mode", "enum", spec.settings.submitMode, "submitMode"],
    ["report.settings.max_pages", "Maximum pages", "number", spec.settings.maxPages, "maxPages"],
    ["report.settings.max_estimated_cost_usd_per_run", "Maximum estimated cost USD per run", "number", spec.settings.maxEstimatedCostUsdPerRun, "maxEstimatedCostUsdPerRun"],
    ["report.settings.usd_to_thb_rate", "USD to THB rate", "number", spec.settings.usdToThbRate, "usdToThbRate"],
    ["report.settings.low_confidence_threshold", "Low-confidence threshold", "number", spec.settings.lowConfidenceThreshold, "lowConfidenceThreshold"],
  ] as const) addValue(key, label, type, value, [`benchmark-spec.json#/settings/${sourceKey}`])
  for (const [key, label, value, sourceKey] of [
    ["report.validation.all_runs_completed", "All runs completed", metrics.validation.allRunsCompleted, "allRunsCompleted"],
    ["report.validation.all_source_hashes_match", "All source hashes match", metrics.validation.allSourceHashesMatch, "allSourceHashesMatch"],
    ["report.validation.all_runs_have_expected_pages", "All runs have expected pages", metrics.validation.allRunsHaveTwoPagesPerEngine, "allRunsHaveTwoPagesPerEngine"],
    ["report.validation.no_errors", "No run errors", metrics.validation.noErrors, "noErrors"],
  ] as const) addValue(key, label, "boolean", value, [`metrics.json#/validation/${sourceKey}`])
  addValue("report.total_cost.usd", "Total estimated cost USD", "number", metrics.totalEstimatedCost.usd, ["metrics.json#/totalEstimatedCost/usd"], "aggregate")
  addValue("report.total_cost.thb", "Total estimated cost THB", "number", metrics.totalEstimatedCost.thb, ["metrics.json#/totalEstimatedCost/thb"], "aggregate")
  addValue("report.truth.critical_value_count", "Critical value count", "number", truth.criticalValues.length, ["ground-truth.json#/criticalValues"], "aggregate")
  addValue("report.truth.native_concept_count", "Native concept count", "number", truth.nativeConcepts.length, ["ground-truth.json#/nativeConcepts"], "aggregate")
  addValue("report.truth.gdim_derivable_field_count", "Derivable GDIM field count", "number", truth.gdimFields.length, ["ground-truth.json#/gdimFields"], "aggregate")

  truth.criticalValues.forEach((item: any, index: number) => addValue(
    `report.truth.critical.${item.id}`,
    `Critical value ${item.id}`,
    "text",
    String(item.value),
    [`ground-truth.json#/criticalValues/${index}/value`],
  ))

  for (const engine of ALL_ENGINES) {
    const prefix = `report.engine.${engine}`
    const source = `metrics.json#/engines/${engine}`
    for (const [suffix, label, metric, stat] of [
      ["words", "Median word count", "words", "median"],
      ["low_confidence_words", "Median low-confidence words", "lowConfidenceWords", "median"],
      ["bbox_coverage", "Median bounding-box coverage", "bboxCoverage", "median"],
      ["latency_ms.min", "Minimum latency ms", "latencyMs", "min"],
      ["latency_ms.median", "Median latency ms", "latencyMs", "median"],
      ["latency_ms.max", "Maximum latency ms", "latencyMs", "max"],
      ["response_bytes", "Median response bytes", "responseBytes", "median"],
      ["cost_usd", "Median estimated cost USD", "costUsd", "median"],
      ["cost_thb", "Median estimated cost THB", "costThb", "median"],
    ] as const) addValue(`${prefix}.${suffix}`, `${engine} ${label}`, "number", summary(metrics, engine, metric, stat), [`${source}/summary/${metric}/${stat}`], "aggregate")
    for (const [suffix, label, sourceKey] of [
      ["repeatability.exact_text", "Exact text across runs", "exactTextAcrossRuns"],
      ["repeatability.exact_key_values", "Exact key-values across runs", "exactKeyValuesAcrossRuns"],
      ["repeatability.exact_tables", "Exact tables across runs", "exactTablesAcrossRuns"],
    ] as const) addValue(`${prefix}.${suffix}`, `${engine} ${label}`, "boolean", metrics.engines[engine].repeatability[sourceKey], [`${source}/repeatability/${sourceKey}`], "aggregate")
  }

  for (const engine of OCR_ENGINES) {
    const prefix = `report.engine.${engine}`
    const source = `metrics.json#/engines/${engine}`
    addValue(`${prefix}.character_accuracy`, `${engine} character accuracy`, "number", summary(metrics, engine, "characterAccuracy"), [`${source}/summary/characterAccuracy/median`], "aggregate")
    addValue(`${prefix}.word_accuracy`, `${engine} word accuracy`, "number", summary(metrics, engine, "wordAccuracy"), [`${source}/summary/wordAccuracy/median`], "aggregate")
    addValue(`${prefix}.critical_values_found`, `${engine} critical values found`, "number", stableRunValue(metrics, engine, "criticalValuesFound"), [`${source}/runs/*/criticalValuesFound`], "aggregate")
    addValue(`${prefix}.critical_values_total`, `${engine} critical values total`, "number", stableRunValue(metrics, engine, "criticalValuesTotal"), [`${source}/runs/*/criticalValuesTotal`], "aggregate")
  }

  const mappingByEngine: Record<string, any> = {}
  for (const engine of NATIVE_ENGINES) {
    const prefix = `report.engine.${engine}`
    const source = `metrics.json#/engines/${engine}`
    addValue(`${prefix}.non_empty_key_values`, `${engine} non-empty key-values`, "number", summary(metrics, engine, "nonEmptyKeyValues"), [`${source}/summary/nonEmptyKeyValues/median`], "aggregate")
    addValue(`${prefix}.table_count`, `${engine} table count`, "number", summary(metrics, engine, "tables"), [`${source}/summary/tables/median`], "aggregate")
    addValue(`${prefix}.table_cell_count`, `${engine} table cell count`, "number", summary(metrics, engine, "tableCells"), [`${source}/summary/tableCells/median`], "aggregate")
    addValue(`${prefix}.structured_concepts_found`, `${engine} structured concepts found`, "number", stableRunValue(metrics, engine, "structuredConceptsFound"), [`${source}/runs/*/structuredConceptsFound`], "aggregate")
    addValue(`${prefix}.structured_concepts_total`, `${engine} structured concepts total`, "number", stableRunValue(metrics, engine, "structuredConceptsTotal"), [`${source}/runs/*/structuredConceptsTotal`], "aggregate")
    addValue(`${prefix}.structured_concept_coverage`, `${engine} structured concept coverage`, "number", summary(metrics, engine, "structuredConceptCoverage"), [`${source}/summary/structuredConceptCoverage/median`], "aggregate")
    const mapping = stableMapping(metrics, engine)
    mappingByEngine[engine] = mapping
    for (const [suffix, label, sourceKey] of [
      ["mapping.total_schema_fields", "Total schema fields", "totalSchemaFields"],
      ["mapping.required_fields", "Required fields", "requiredFields"],
      ["mapping.mapped_fields", "Mapped fields", "mappedFields"],
      ["mapping.mapped_required_fields", "Mapped required fields", "mappedRequiredFields"],
      ["mapping.expected_derivable_fields", "Expected derivable fields", "expectedDerivableFields"],
      ["mapping.correct_mapped_fields", "Correct mapped fields", "correctMappedFields"],
      ["mapping.precision", "Mapping precision", "mappingPrecision"],
      ["mapping.recall", "Mapping recall", "mappingRecall"],
    ] as const) addValue(`${prefix}.${suffix}`, `${engine} ${label}`, "number", mapping[sourceKey], [`metrics.json#/forcedGdim/*/${sourceKey}`], "aggregate")
  }

  const googleOcrLatency = summary(metrics, "google_vision", "latencyMs")
  const azureOcrLatency = summary(metrics, "azure_document_intelligence", "latencyMs")
  const googleNativeCoverage = summary(metrics, "google_document_ai_native", "structuredConceptCoverage")
  const azureNativeCoverage = summary(metrics, "azure_document_intelligence_native", "structuredConceptCoverage")
  const googleNativeCost = summary(metrics, "google_document_ai_native", "costThb")
  const azureNativeCost = summary(metrics, "azure_document_intelligence_native", "costThb")
  addValue("report.decision.ocr_faster_engine", "Faster OCR engine", "enum", googleOcrLatency <= azureOcrLatency ? "google_vision" : "azure_document_intelligence", ["metrics.json#/engines/*/summary/latencyMs/median"], "comparison")
  addValue("report.decision.ocr_latency_delta_ms", "OCR latency delta ms", "number", Math.abs(googleOcrLatency - azureOcrLatency), ["metrics.json#/engines/*/summary/latencyMs/median"], "comparison")
  addValue("report.decision.native_higher_coverage_engine", "Higher native coverage engine", "enum", googleNativeCoverage >= azureNativeCoverage ? "google_document_ai_native" : "azure_document_intelligence_native", ["metrics.json#/engines/*/summary/structuredConceptCoverage/median"], "comparison")
  addValue("report.decision.native_lower_cost_engine", "Lower native cost engine", "enum", googleNativeCost <= azureNativeCost ? "google_document_ai_native" : "azure_document_intelligence_native", ["metrics.json#/engines/*/summary/costThb/median"], "comparison")
  addValue("report.decision.native_cost_ratio", "Native cost ratio high to low", "number", Math.max(googleNativeCost, azureNativeCost) / Math.min(googleNativeCost, azureNativeCost), ["metrics.json#/engines/*/summary/costThb/median"], "comparison")

  input.media.forEach((media) => {
    addValue(media.fieldKey, `Report media ${media.assetId}`, "image", { kind: "image-asset-ref", assetId: media.assetId }, [`external-report://INV_9437125258/assets/${media.fileName}`], "media-identity")
    mediaImages[media.assetId] = {
      id: media.assetId,
      kind: "image",
      mediaType: media.mediaType,
      byteLength: media.byteLength,
      digest: { algorithm: "sha256", value: media.sha256 },
      intrinsic: { widthPx: media.widthPx, heightPx: media.heightPx },
    }
    mediaProvenance[media.fieldKey] = {
      fieldKey: media.fieldKey,
      assetId: media.assetId,
      sourcePointer: `external-report://INV_9437125258/assets/${media.fileName}`,
      derivation: "media-identity",
    }
  })

  const runValidationById = new Map(metrics.validation.runs.map((run: any) => [run.runId, run]))
  addCollection({
    fieldKey: "report.runs",
    label: "Benchmark runs",
    itemFields: [
      itemField("round", "Round", "number"), itemField("order", "Order", "number"),
      itemField("provider", "Provider", "enum"), itemField("run_id", "Run ID", "text"),
      itemField("status", "Status", "enum"), itemField("source_hash_matches", "Source hash matches", "boolean"),
      itemField("ocr_engine", "OCR engine", "enum"), itemField("native_engine", "Native engine", "enum"),
      itemField("ocr_pages", "OCR pages", "number"), itemField("native_pages", "Native pages", "number"),
      itemField("error_count", "Error count", "number"),
    ],
    items: spec.runs.map((run: any, index: number) => {
      const validated: any = runValidationById.get(run.runId)
      requireFact(validated != null, `missing validation for ${run.runId}`)
      const [ocrEngine, nativeEngine] = run.provider === "google"
        ? ["google_vision", "google_document_ai_native"]
        : ["azure_document_intelligence", "azure_document_intelligence_native"]
      return {
        itemKey: run.runId,
        values: {
          round: run.round, order: run.order, provider: run.provider, run_id: run.runId,
          status: validated.status, source_hash_matches: validated.sourceHashMatches,
          ocr_engine: ocrEngine, native_engine: nativeEngine,
          ocr_pages: validated.pagesPerEngine[ocrEngine], native_pages: validated.pagesPerEngine[nativeEngine],
          error_count: validated.errors.length,
        },
        sourcePointers: [`benchmark-spec.json#/runs/${index}`, `metrics.json#/validation/runs/${index}`],
      }
    }),
  })

  const ocrRunFields = [
    itemField("engine", "Engine", "enum"), itemField("provider", "Provider", "enum"),
    itemField("run_id", "Run ID", "text"), itemField("round", "Round", "number"),
    itemField("order", "Order", "number"), itemField("pages", "Pages", "number"),
    itemField("words", "Words", "number"), itemField("average_confidence", "Average confidence", "number"),
    itemField("minimum_confidence", "Minimum confidence", "number"), itemField("low_confidence_words", "Low-confidence words", "number"),
    itemField("bbox_coverage", "Bounding-box coverage", "number"), itemField("latency_ms", "Latency ms", "number"),
    itemField("response_bytes", "Response bytes", "number"), itemField("cost_usd", "Cost USD", "number"),
    itemField("cost_thb", "Cost THB", "number"), itemField("character_accuracy", "Character accuracy", "number"),
    itemField("word_accuracy", "Word accuracy", "number"), itemField("critical_values_found", "Critical values found", "number"),
    itemField("critical_values_total", "Critical values total", "number"),
  ]
  addCollection({
    fieldKey: "report.ocr_runs",
    label: "OCR engine runs",
    itemFields: ocrRunFields,
    items: OCR_ENGINES.flatMap((engine) => metrics.engines[engine].runs.map((run: any, index: number) => ({
      itemKey: `${engine}:${run.runId}`,
      values: {
        engine, provider: engine.startsWith("google") ? "google" : "azure", run_id: run.runId,
        round: run.round, order: run.order, pages: run.pages, words: run.words,
        average_confidence: run.averageConfidence, minimum_confidence: run.minimumConfidence,
        low_confidence_words: run.lowConfidenceWords, bbox_coverage: run.bboxCoverage,
        latency_ms: run.latencyMs, response_bytes: run.responseBytes, cost_usd: run.costUsd, cost_thb: run.costThb,
        character_accuracy: run.characterAccuracy, word_accuracy: run.wordAccuracy,
        critical_values_found: run.criticalValuesFound, critical_values_total: run.criticalValuesTotal,
      },
      sourcePointers: [`metrics.json#/engines/${engine}/runs/${index}`],
    }))),
  })

  addCollection({
    fieldKey: "report.native_runs",
    label: "Native extraction runs",
    itemFields: [
      itemField("engine", "Engine", "enum"), itemField("provider", "Provider", "enum"),
      itemField("run_id", "Run ID", "text"), itemField("round", "Round", "number"),
      itemField("order", "Order", "number"), itemField("pages", "Pages", "number"),
      itemField("words", "Words", "number"), itemField("average_confidence", "Average confidence", "number"),
      itemField("minimum_confidence", "Minimum confidence", "number"), itemField("low_confidence_words", "Low-confidence words", "number"),
      itemField("bbox_coverage", "Bounding-box coverage", "number"), itemField("non_empty_key_values", "Non-empty key-values", "number"),
      itemField("table_count", "Table count", "number"), itemField("table_cell_count", "Table cell count", "number"),
      itemField("latency_ms", "Latency ms", "number"), itemField("response_bytes", "Response bytes", "number"),
      itemField("cost_usd", "Cost USD", "number"), itemField("cost_thb", "Cost THB", "number"),
      itemField("structured_concepts_found", "Structured concepts found", "number"),
      itemField("structured_concepts_total", "Structured concepts total", "number"),
      itemField("structured_concept_coverage", "Structured concept coverage", "number"),
    ],
    items: NATIVE_ENGINES.flatMap((engine) => metrics.engines[engine].runs.map((run: any, index: number) => ({
      itemKey: `${engine}:${run.runId}`,
      values: {
        engine, provider: engine.startsWith("google") ? "google" : "azure", run_id: run.runId,
        round: run.round, order: run.order, pages: run.pages, words: run.words,
        average_confidence: run.averageConfidence, minimum_confidence: run.minimumConfidence,
        low_confidence_words: run.lowConfidenceWords, bbox_coverage: run.bboxCoverage,
        non_empty_key_values: run.nonEmptyKeyValues, table_count: run.tables, table_cell_count: run.tableCells,
        latency_ms: run.latencyMs, response_bytes: run.responseBytes, cost_usd: run.costUsd, cost_thb: run.costThb,
        structured_concepts_found: run.structuredConceptsFound,
        structured_concepts_total: run.structuredConceptsTotal,
        structured_concept_coverage: run.structuredConceptCoverage,
      },
      sourcePointers: [`metrics.json#/engines/${engine}/runs/${index}`],
    }))),
  })

  addCollection({
    fieldKey: "report.native_missing_concepts",
    label: "Missing native concepts",
    itemFields: [itemField("engine", "Engine", "enum"), itemField("concept_id", "Concept ID", "text")],
    items: NATIVE_ENGINES.flatMap((engine) => (
      (stableRunValue(metrics, engine, "missingStructuredConcepts") as string[]).map((conceptId) => ({
        itemKey: `${engine}:${conceptId}`,
        values: { engine, concept_id: conceptId },
        sourcePointers: [`metrics.json#/engines/${engine}/runs/*/missingStructuredConcepts`],
        derivation: "aggregate" as const,
      }))
    )),
  })

  addCollection({
    fieldKey: "report.mapping_fields",
    label: "Mapped GDIM fields",
    itemFields: [
      itemField("engine", "Engine", "enum"), itemField("schema_path", "Schema path", "text"),
      itemField("value_text", "Mapped value", "text"), itemField("expected_value_text", "Expected value", "text"),
      itemField("source_label", "Source label", "text"), itemField("confidence", "Confidence", "number"),
      itemField("page", "Page", "number"), itemField("correct", "Correct", "boolean"),
    ],
    items: NATIVE_ENGINES.flatMap((engine) => {
      const mapping = mappingByEngine[engine]
      const expected = new Map(truth.gdimFields.map((item: any) => [item.path, String(item.value)]))
      const wrongPaths = new Set(mapping.wrongMappings.map((item: any) => item.path))
      return mapping.mapped.map((item: any) => ({
        itemKey: `${engine}:${item.path}`,
        values: {
          engine,
          schema_path: item.path,
          value_text: String(item.value),
          expected_value_text: expected.get(item.path) ?? "",
          source_label: item.sourceLabel,
          confidence: item.confidence,
          page: item.page,
          correct: !wrongPaths.has(item.path),
        },
        sourcePointers: ["metrics.json#/forcedGdim/*/mapped", "ground-truth.json#/gdimFields"],
        derivation: "comparison" as const,
      }))
    }),
  })

  addCollection({
    fieldKey: "report.gdim_expected_fields",
    label: "Expected derivable GDIM fields",
    itemFields: [itemField("schema_path", "Schema path", "text"), itemField("expected_value_text", "Expected value", "text")],
    items: truth.gdimFields.map((item: any, index: number) => ({
      itemKey: item.path,
      values: { schema_path: item.path, expected_value_text: String(item.value) },
      sourcePointers: [`ground-truth.json#/gdimFields/${index}`],
    })),
  })

  const sourceSetId = `source-set-${sha256(JSON.stringify({
    data: input.sourceFiles.map((file) => [file.sourceId, file.sha256]),
    media: input.media.map((file) => [file.assetId, file.sha256]),
  })).slice(0, 24)}`
  const fieldContract: VNextPublishedFieldContractV1 = {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "fields-ocr-benchmark-report-v1",
    owner,
    registry: { version: 1, fields },
  }
  const collectionItemContract: VNextPublishedCollectionItemContractV1 = {
    contractVersion: 1,
    kind: "published-collection-item-contract",
    collectionItemContractId: "collection-items-ocr-benchmark-report-v1",
    publishedFieldContractId: fieldContract.fieldContractId,
    owner,
    collections: collectionShapes,
  }
  const dataSnapshot: VNextInstanceDataSnapshotV1 = {
    contractVersion: 1,
    kind: "instance-data-snapshot",
    dataSnapshotId: `data-${spec.benchmarkId.toLowerCase()}-r1`,
    instance: clone(instance),
    data: { version: 2, values },
  }
  const collectionSnapshot: VNextTableCollectionSnapshotV1 = {
    contractVersion: 1,
    kind: "table-collection-snapshot",
    collectionSnapshotId: `collections-${spec.benchmarkId.toLowerCase()}-r1`,
    snapshotRevision: 1,
    instance: clone(instance),
    collections: snapshotCollections,
  }
  const mediaSnapshot: VNextInstanceMediaSnapshotV1 = {
    contractVersion: 1,
    kind: "instance-media-snapshot",
    mediaSnapshotId: `media-${spec.benchmarkId.toLowerCase()}-r1`,
    instance: clone(instance),
    registry: { version: 1, images: mediaImages },
  }
  const unsigned: Omit<FlowDocCanonicalReportDataBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-data-bundle",
    adapterId: FLOWDOC_CANONICAL_REPORT_DATA_ADAPTER_ID,
    benchmarkId: spec.benchmarkId,
    sourceSet: {
      sourceSetId,
      sourceSnapshotSha256: input.sourceSnapshotSha256,
      dataFiles: clone(input.sourceFiles),
      mediaFiles: input.media.map(({ fieldKey: _fieldKey, ...media }) => clone(media)),
    },
    structureVersion: owner,
    instance,
    fieldContract,
    collectionItemContract,
    dataSnapshot,
    collectionSnapshot,
    mediaSnapshot,
    provenance: {
      contractVersion: 1,
      kind: "canonical-report-data-provenance",
      sourceSetId,
      scalars: scalarProvenance,
      collections: collectionProvenance,
      media: mediaProvenance,
    },
    ownership: {
      adapterOwns: ["typed-source-facts", "stable-field-keys", "stable-collection-items", "source-provenance"],
      adapterMustNotOwn: [
        "template-prose",
        "display-formatting",
        "authored-visual-lines",
        "layout-coordinates",
        "glyph-shaping",
        "page-breaking",
        "pdf-bytes",
      ],
    },
    execution: {
      templateResolution: "not-run",
      textMeasurement: "not-run",
      lineBreaking: "not-run",
      layout: "not-run",
      pagination: "not-run",
      pdfRendering: "not-run",
    },
    summary: {
      fieldCount: Object.keys(fields).length,
      scalarValueCount: Object.keys(values).length,
      collectionCount: Object.keys(snapshotCollections).length,
      collectionItemCount: Object.values(snapshotCollections).reduce((total, collection) => total + collection.items.length, 0),
      mediaAssetCount: Object.keys(mediaImages).length,
      dataSourceFileCount: input.sourceFiles.length,
      mediaSourceFileCount: input.media.length,
      scalarProvenanceCount: Object.keys(scalarProvenance).length,
      collectionProvenanceItemCount: Object.values(collectionProvenance).reduce((total, collection) => total + Object.keys(collection.items).length, 0),
      mediaProvenanceCount: Object.keys(mediaProvenance).length,
    },
  }
  const bundle: FlowDocCanonicalReportDataBundleV1 = {
    ...unsigned,
    bundleFingerprint: bundleFingerprint(unsigned),
  }
  const validation = validateFlowDocCanonicalReportDataBundleV1(bundle)
  if (validation.status !== "valid") {
    throw new Error(`Canonical report data bundle validation failed:\n${validation.issues.map((item) => `- ${item.path}: ${item.message}`).join("\n")}`)
  }
  return bundle
}
