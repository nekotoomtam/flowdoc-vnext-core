import { createHash } from "node:crypto"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextTableAuthoredTextMeasurementPreparationV1,
  createVNextTableCellGeometryV1,
  createVNextTableTextMeasurementPreparationV1,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  type AuthoredNodeV4Target,
  type UnitValueV4Target,
  type VNextMeasurementProfileIdentityPlan,
  type VNextPublishedStyleCatalogV1,
  type VNextTableCellGeometryResultV1,
  type VNextTableCellLayoutProfileV1,
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
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "./canonicalReportTemplateResolution.js"

export const FLOWDOC_CANONICAL_REPORT_MEASUREMENT_HANDOFF_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_TABLE_LAYOUT_PROFILE_ID = "ocr-benchmark-report-table-layout-v1" as const

const ACCEPTED_DATA_BUNDLE_FINGERPRINT = "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d"
const ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT = "a64f2f945a23ecbc75d7210512d96a594a0b84b50dc03a1089bfc5b90ecadcdb"
const ACCEPTED_FORMATTING_BUNDLE_FINGERPRINT = "41877d47ea365f01790faf3041a610629489931ad1fe1aa6d88e2389ed8a5d0d"
const IBM_PLEX_REGULAR_HASH = "bdf527758ba47d68d42c104b9167cb15660e88a16b40136504a7ea8c56792b57"
const IBM_PLEX_BOLD_HASH = "ba5e62ecf0d5f19338b6d34360bce097d29fe56142eec5f612f2d7dd91c6bf21"
const LETTER_PORTRAIT_PT = { width: 612, height: 792 } as const

interface FlowDocFontAssetManifestEntryV1 {
  fontId: string
  family: string
  style: "normal" | "italic"
  weight: number
  sha256: string
}

export interface FlowDocFontAssetManifestV1 {
  manifestVersion: number
  fontAssets: FlowDocFontAssetManifestEntryV1[]
  candidateFontAssets: FlowDocFontAssetManifestEntryV1[]
}

export interface FlowDocCanonicalReportDocumentMeasurementRequestV1 {
  lane: "resolved-document-text"
  sectionId: string
  zoneRole: ZoneRoleV4Target
  textBlockId: string
  displayBindingInlineIds: string[]
  request: VNextTextBlockV4MeasurementRequest
}

export interface FlowDocCanonicalReportGeneratedInlineDeferralV1 {
  lane: "generated-inline-deferred"
  sectionId: string
  zoneRole: ZoneRoleV4Target
  textBlockId: string
  inlineIds: string[]
  reason: "page-number-requires-generated-expansion"
  measurement: "not-run"
}

type ReadyTableGeometry = Extract<VNextTableCellGeometryResultV1, { status: "ready" }>
type ReadyTablePreparation = Extract<VNextTableTextMeasurementPreparationResultV1, { status: "ready" }>

export interface FlowDocCanonicalReportTableMeasurementHandoffV1 {
  collectionFieldKey: string
  sectionId: string
  tableId: string
  tableDefinitionId: string
  tableContentWidthPt: number
  rawMaterializationFingerprint: string
  displayMaterializationFingerprint: string
  formattedBindingCount: number
  geometry: ReadyTableGeometry
  authoredPreparation: ReadyTablePreparation
  materializedPreparation: ReadyTablePreparation
}

export interface FlowDocCanonicalReportMeasurementRequestHandoffBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_MEASUREMENT_HANDOFF_VERSION
  kind: "canonical-report-measurement-request-handoff-bundle"
  phaseId: "PDF-PILOT-08B-R2C-B"
  sourceDataBundleFingerprint: string
  sourceTemplateBundleFingerprint: string
  sourceFormattingBundleFingerprint: string
  resolutionInputFingerprint: string
  styleCatalog: VNextPublishedStyleCatalogV1
  measurementProfile: VNextMeasurementProfileIdentityPlan
  tableLayoutProfile: VNextTableCellLayoutProfileV1
  pageGeometry: {
    pageSize: "Letter"
    orientation: "portrait"
    widthPt: number
    heightPt: number
    unitConversion: "pt-or-mm-times-72-over-25.4"
    sections: Array<{
      sectionId: string
      bodyWidthPt: number
      tableWidthsPt: Record<string, number>
    }>
  }
  documentRequests: FlowDocCanonicalReportDocumentMeasurementRequestV1[]
  generatedInlineDeferrals: FlowDocCanonicalReportGeneratedInlineDeferralV1[]
  collectionTables: FlowDocCanonicalReportTableMeasurementHandoffV1[]
  ownership: {
    handoffOwns: ["measurement-profile-identity", "available-widths", "table-cell-geometry", "display-text-request-projection"]
    handoffMustNotOwn: ["source-values", "authored-graph", "shaping", "line-breaking", "line-boxes", "layout", "pagination", "pdf-bytes"]
  }
  execution: {
    localeDisplayFormatting: "consumed"
    measurementProfileIdentity: "stable"
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
    semanticSectionCount: number
    tableCount: number
    tableCellGeometryCount: number
    documentRequestCount: number
    authoredTableRequestCount: number
    materializedTableRequestCount: number
    totalReadyRequestCount: number
    generatedInlineDeferredBlockCount: number
    formattedDocumentBindingCount: number
    formattedCollectionBindingCount: number
    measurementProfileFontCount: number
    measurementProfileStyleMappingCount: number
    minimumCellContentWidthPt: number
    maximumCellContentWidthPt: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportMeasurementRequestHandoffIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportMeasurementRequestHandoffValidationV1 =
  | {
      status: "valid"
      issues: []
      summary: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1["summary"]
    }
  | {
      status: "blocked"
      issues: FlowDocCanonicalReportMeasurementRequestHandoffIssueV1[]
      summary: null
    }

const TABLE_LAYOUT_PROFILE: VNextTableCellLayoutProfileV1 = {
  contractVersion: 1,
  kind: "table-cell-layout-profile",
  layoutProfileId: FLOWDOC_CANONICAL_REPORT_TABLE_LAYOUT_PROFILE_ID,
  defaultInsetsPt: { top: 4, right: 4, bottom: 4, left: 4 },
  insetsByRowTemplate: {},
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1["ownership"] = {
  handoffOwns: ["measurement-profile-identity", "available-widths", "table-cell-geometry", "display-text-request-projection"],
  handoffMustNotOwn: ["source-values", "authored-graph", "shaping", "line-breaking", "line-boxes", "layout", "pagination", "pdf-bytes"],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1["execution"] = {
  localeDisplayFormatting: "consumed",
  measurementProfileIdentity: "stable",
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

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: UnitValueV4Target): number {
  return value.unit === "pt" ? value.value : (value.value * 72) / 25.4
}

function issue(
  code: string,
  path: string,
  message: string,
): FlowDocCanonicalReportMeasurementRequestHandoffIssueV1 {
  return { code, path, message, severity: "error" }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function createMeasurementProfile(
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  fontManifest: FlowDocFontAssetManifestV1,
): VNextMeasurementProfileIdentityPlan {
  const assets = [...fontManifest.fontAssets, ...fontManifest.candidateFontAssets]
  const regular = assets.find((asset) => asset.fontId === "ibm-plex-sans-thai-regular")
  const bold = assets.find((asset) => asset.fontId === "ibm-plex-sans-thai-bold")
  requireFact(regular?.sha256 === IBM_PLEX_REGULAR_HASH, "IBM Plex Sans Thai Regular identity drifted")
  requireFact(bold?.sha256 === IBM_PLEX_BOLD_HASH, "IBM Plex Sans Thai Bold identity drifted")

  const plan = createVNextMeasurementProfileIdentityPlan({
    profileKey: "ocr-benchmark-ibm-plex-thai-v1",
    policyRevision: "pdf-pilot-r2c-b-v1",
    fontAssets: [regular, bold].map((asset) => ({
      fontId: asset.fontId,
      family: asset.family,
      weight: asset.weight,
      style: asset.style,
      sha256: asset.sha256,
    })),
    styleMappings: Object.values(templateBundle.styleCatalog.styles).map((style) => ({
      styleKey: style.key,
      primaryFontId: style.runStyle.fontWeight === "bold"
        ? "ibm-plex-sans-thai-bold"
        : "ibm-plex-sans-thai-regular",
      fallbackFontIds: [],
    })),
    shaper: {
      shaperId: "rustybuzz-wasm",
      engine: "rustybuzz",
      revision: "0.20.1",
      deterministic: true,
      packageBoundary: "external-adapter",
      features: { kerning: true, ligatures: true, complexText: true, clusterMapping: true },
    },
    segmenter: {
      segmenterId: "icu4x-segmenter",
      engine: "icu4x",
      revision: "icu4x-planned",
      dataRevision: "icu4x-data-planned",
      deterministic: true,
      runtimeDependent: false,
      packageBoundary: "external-adapter",
      lineBreakPolicy: "icu4x-uax14-thai-v1",
    },
    fallbackPolicy: "explicit-font-list-v1",
    outputShapeVersion: "glyph-line-box-v1",
  })
  requireFact(plan.status === "stable", "canonical report measurement profile is blocked")
  return plan
}

function nodeChildIds(node: AuthoredNodeV4Target): string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function tableWidthPt(
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  sectionId: string,
  tableId: string,
): number {
  const section = templateBundle.instanceDocument.document.sections.find((candidate) => candidate.id === sectionId)
  const table = section?.nodes[tableId]
  requireFact(table?.type === "table", `table ${tableId} is missing from ${sectionId}`)
  return roundPt(table.columns.reduce((total, column) => total + unitToPt(column.width), 0))
}

function sectionBodyWidthPt(
  section: FlowDocCanonicalReportTemplateResolutionBundleV1["instanceDocument"]["document"]["sections"][number],
): number {
  requireFact(section.page.size === "Letter", `section ${section.id} must use Letter pages`)
  requireFact(section.page.orientation === "portrait", `section ${section.id} must use portrait pages`)
  return roundPt(LETTER_PORTRAIT_PT.width - unitToPt(section.page.margin.left) - unitToPt(section.page.margin.right))
}

function sectionForTable(
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  tableId: string,
): string {
  const sections = templateBundle.instanceDocument.document.sections.filter(
    (section) => section.nodes[tableId]?.type === "table",
  )
  requireFact(sections.length === 1, `table ${tableId} must belong to exactly one section`)
  return sections[0].id
}

function displayResolvedDocument(
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
) {
  const resolved = clone(templateBundle.scopedResolution.resolvedDocument)
  const formattedByInlineId = new Map(formattingBundle.documentBindings.map((binding) => [
    binding.inlineId,
    binding,
  ]))
  resolved.bindings.fields.forEach((binding) => {
    const formatted = formattedByInlineId.get(binding.inlineId)
    requireFact(formatted != null, `missing display binding ${binding.inlineId}`)
    requireFact(
      formatted.textBlockId === binding.textBlockId
      && formatted.fieldKey === binding.fieldKey
      && formatted.rawResolvedValue === binding.value,
      `display binding lineage drifted for ${binding.inlineId}`,
    )
    binding.value = formatted.displayText
  })
  return resolved
}

function createDocumentRequests(input: {
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  measurementProfileId: string
}) {
  const resolved = displayResolvedDocument(input.templateBundle, input.formattingBundle)
  const textBindings = Object.fromEntries(resolved.bindings.fields.map((binding) => [
    binding.inlineId,
    { fieldKey: binding.fieldKey, value: binding.value },
  ]))
  const imageBindings = Object.fromEntries(resolved.bindings.images.map((binding) => [
    binding.placementId,
    { assetId: binding.assetId },
  ]))
  const styles = new Map(resolved.bindings.styles.map((binding) => [binding.textBlockId, binding.styleKey]))
  const formattedInlineIds = new Set(input.formattingBundle.documentBindings.map((binding) => binding.inlineId))
  const documentRequests: FlowDocCanonicalReportDocumentMeasurementRequestV1[] = []
  const generatedInlineDeferrals: FlowDocCanonicalReportGeneratedInlineDeferralV1[] = []

  resolved.document.document.sections.forEach((section) => {
    const bodyWidthPt = sectionBodyWidthPt(section)
    const visited = new Set<string>()
    const visit = (nodeId: string, zoneRole: ZoneRoleV4Target, availableWidthPt: number): void => {
      const node = section.nodes[nodeId]
      requireFact(node != null, `node ${nodeId} is missing from ${section.id}`)
      if (node.type === "table") return
      if (node.type !== "text-block") {
        nodeChildIds(node).forEach((childId) => visit(childId, zoneRole, availableWidthPt))
        return
      }
      requireFact(!visited.has(node.id), `text block ${node.id} occurs more than once in ${section.id}`)
      visited.add(node.id)
      const generatedInlineIds = node.children.filter((inline) => inline.type === "page-number").map((inline) => inline.id)
      if (generatedInlineIds.length > 0) {
        generatedInlineDeferrals.push({
          lane: "generated-inline-deferred",
          sectionId: section.id,
          zoneRole,
          textBlockId: node.id,
          inlineIds: generatedInlineIds,
          reason: "page-number-requires-generated-expansion",
          measurement: "not-run",
        })
        return
      }
      const styleKey = styles.get(node.id)
      requireFact(styleKey != null, `resolved style is missing for ${node.id}`)
      const prepared = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
        documentId: resolved.instanceId,
        instanceRevision: resolved.instanceRevision,
        sectionId: section.id,
        textBlock: node,
        availableWidthPt,
        measurementProfileId: input.measurementProfileId,
        styleKey,
        resolvedTextByInlineId: textBindings,
        resolvedImageByPlacementId: imageBindings,
      })
      requireFact(prepared.status === "ready", `document measurement request blocked for ${node.id}`)
      documentRequests.push({
        lane: "resolved-document-text",
        sectionId: section.id,
        zoneRole,
        textBlockId: node.id,
        displayBindingInlineIds: prepared.request.runs
          .filter((run) => run.kind === "resolved-field" && formattedInlineIds.has(run.inlineId))
          .map((run) => run.inlineId),
        request: prepared.request,
      })
    }

    section.zoneIds.forEach((zoneId) => {
      const zone = section.nodes[zoneId]
      requireFact(zone?.type === "zone", `zone ${zoneId} is missing from ${section.id}`)
      const availableWidthPt = zone.role === "body" || section.page.headerFooterHorizontalMode !== "full"
        ? bodyWidthPt
        : LETTER_PORTRAIT_PT.width
      zone.childIds.forEach((childId) => visit(childId, zone.role, availableWidthPt))
    })
  })
  return { resolved, documentRequests, generatedInlineDeferrals }
}

function createTableHandoffs(input: {
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  displayResolved: ReturnType<typeof displayResolvedDocument>
  measurementProfileId: string
}): FlowDocCanonicalReportTableMeasurementHandoffV1[] {
  return input.templateBundle.collectionTables.map((table) => {
    const sectionId = sectionForTable(input.templateBundle, table.definition.tableId)
    const tableContentWidthPt = tableWidthPt(input.templateBundle, sectionId, table.definition.tableId)
    const geometry = createVNextTableCellGeometryV1({
      contractVersion: 1,
      kind: "table-cell-geometry-request",
      definition: table.definition,
      tableContentWidthPt,
      layoutProfile: TABLE_LAYOUT_PROFILE,
    })
    requireFact(geometry.status === "ready", `table geometry blocked for ${table.collectionFieldKey}`)

    const formattedTable = input.formattingBundle.collectionTables.find(
      (candidate) => candidate.collectionFieldKey === table.collectionFieldKey,
    )
    requireFact(formattedTable?.tableId === table.definition.tableId, `formatted table lineage drifted for ${table.collectionFieldKey}`)
    const formattedByPlacement = new Map(formattedTable.bindings.map((binding) => [
      binding.resolvedPlacementId,
      binding,
    ]))
    const displayMaterialization = clone(table.materializedContent)
    displayMaterialization.bindings.text.forEach((binding) => {
      const formatted = formattedByPlacement.get(binding.resolvedPlacementId)
      requireFact(formatted != null, `missing formatted table binding ${binding.resolvedPlacementId}`)
      requireFact(
        formatted.sourcePlacementId === binding.sourcePlacementId
        && formatted.fieldKey === binding.fieldKey
        && formatted.rawResolvedValue === binding.value,
        `formatted table binding lineage drifted for ${binding.resolvedPlacementId}`,
      )
      binding.value = formatted.displayText
    })
    requireFact(
      displayMaterialization.bindings.text.length === formattedTable.bindings.length,
      `formatted binding coverage drifted for ${table.collectionFieldKey}`,
    )

    const authoredPreparation = createVNextTableAuthoredTextMeasurementPreparationV1({
      definition: table.definition,
      materialization: displayMaterialization,
      geometry,
      resolvedDocument: input.displayResolved,
      measurementProfileId: input.measurementProfileId,
    })
    requireFact(authoredPreparation.status === "ready", `authored table request preparation blocked for ${table.collectionFieldKey}`)
    const materializedPreparation = createVNextTableTextMeasurementPreparationV1({
      definition: table.definition,
      materialization: displayMaterialization,
      geometry,
      styleCatalog: input.templateBundle.styleCatalog,
      sectionId,
      measurementProfileId: input.measurementProfileId,
    })
    requireFact(materializedPreparation.status === "ready", `materialized table request preparation blocked for ${table.collectionFieldKey}`)

    return {
      collectionFieldKey: table.collectionFieldKey,
      sectionId,
      tableId: table.definition.tableId,
      tableDefinitionId: table.definition.tableDefinitionId,
      tableContentWidthPt,
      rawMaterializationFingerprint: sha256(JSON.stringify(table.materializedContent)),
      displayMaterializationFingerprint: sha256(JSON.stringify(displayMaterialization)),
      formattedBindingCount: formattedTable.bindings.length,
      geometry,
      authoredPreparation,
      materializedPreparation,
    }
  })
}

function withoutFingerprint(
  bundle: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
): Omit<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1, "bundleFingerprint"> {
  const { bundleFingerprint: _fingerprint, ...unsigned } = bundle
  return unsigned
}

function buildBundle(input: {
  dataBundle: FlowDocCanonicalReportDataBundleV1
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  fontManifest: FlowDocFontAssetManifestV1
}): FlowDocCanonicalReportMeasurementRequestHandoffBundleV1 {
  const measurementProfile = createMeasurementProfile(input.templateBundle, input.fontManifest)
  const document = createDocumentRequests({
    templateBundle: input.templateBundle,
    formattingBundle: input.formattingBundle,
    measurementProfileId: measurementProfile.measurementProfileId,
  })
  const collectionTables = createTableHandoffs({
    templateBundle: input.templateBundle,
    formattingBundle: input.formattingBundle,
    displayResolved: document.resolved,
    measurementProfileId: measurementProfile.measurementProfileId,
  })
  const cellWidths = collectionTables.flatMap((table) => Object.values(table.geometry.geometry.rowTemplates)
    .flatMap((template) => template.cells.map((cell) => cell.contentWidthPt)))
  const authoredTableRequestCount = collectionTables.reduce(
    (total, table) => total + table.authoredPreparation.work.textMeasurementRequestCount,
    0,
  )
  const materializedTableRequestCount = collectionTables.reduce(
    (total, table) => total + table.materializedPreparation.work.textMeasurementRequestCount,
    0,
  )
  const formattedCollectionBindingCount = input.formattingBundle.collectionTables.reduce(
    (total, table) => total + table.bindings.length,
    0,
  )
  const unsigned: Omit<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-measurement-request-handoff-bundle",
    phaseId: "PDF-PILOT-08B-R2C-B",
    sourceDataBundleFingerprint: input.dataBundle.bundleFingerprint,
    sourceTemplateBundleFingerprint: input.templateBundle.bundleFingerprint,
    sourceFormattingBundleFingerprint: input.formattingBundle.bundleFingerprint,
    resolutionInputFingerprint: input.templateBundle.resolutionInputFingerprint,
    styleCatalog: clone(input.templateBundle.styleCatalog),
    measurementProfile,
    tableLayoutProfile: clone(TABLE_LAYOUT_PROFILE),
    pageGeometry: {
      pageSize: "Letter",
      orientation: "portrait",
      widthPt: LETTER_PORTRAIT_PT.width,
      heightPt: LETTER_PORTRAIT_PT.height,
      unitConversion: "pt-or-mm-times-72-over-25.4",
      sections: input.templateBundle.instanceDocument.document.sections.map((section) => ({
        sectionId: section.id,
        bodyWidthPt: sectionBodyWidthPt(section),
        tableWidthsPt: Object.fromEntries(Object.values(section.nodes)
          .filter((node): node is Extract<AuthoredNodeV4Target, { type: "table" }> => node.type === "table")
          .map((table) => [table.id, tableWidthPt(input.templateBundle, section.id, table.id)])),
      })),
    },
    documentRequests: document.documentRequests,
    generatedInlineDeferrals: document.generatedInlineDeferrals,
    collectionTables,
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      semanticSectionCount: input.templateBundle.instanceDocument.document.sections.length,
      tableCount: collectionTables.length,
      tableCellGeometryCount: cellWidths.length,
      documentRequestCount: document.documentRequests.length,
      authoredTableRequestCount,
      materializedTableRequestCount,
      totalReadyRequestCount: document.documentRequests.length + authoredTableRequestCount + materializedTableRequestCount,
      generatedInlineDeferredBlockCount: document.generatedInlineDeferrals.length,
      formattedDocumentBindingCount: input.formattingBundle.documentBindings.length,
      formattedCollectionBindingCount,
      measurementProfileFontCount: measurementProfile.summary.fontAssetCount,
      measurementProfileStyleMappingCount: measurementProfile.summary.styleMappingCount,
      minimumCellContentWidthPt: Math.min(...cellWidths),
      maximumCellContentWidthPt: Math.max(...cellWidths),
    },
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

function validateSources(input: {
  dataBundle: FlowDocCanonicalReportDataBundleV1
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
}): string[] {
  const errors: string[] = []
  if (validateFlowDocCanonicalReportDataBundleV1(input.dataBundle).status !== "valid") errors.push("R2A data bundle is invalid")
  if (validateFlowDocCanonicalReportTemplateResolutionBundleV1(input.templateBundle).status !== "valid") errors.push("R2B template bundle is invalid")
  if (validateFlowDocCanonicalReportDisplayFormattingBundleV1(
    input.formattingBundle,
    input.dataBundle,
    input.templateBundle,
  ).status !== "valid") errors.push("R2C-A formatting bundle is invalid")
  if (input.dataBundle.bundleFingerprint !== ACCEPTED_DATA_BUNDLE_FINGERPRINT) errors.push("R2A data fingerprint drifted")
  if (input.templateBundle.bundleFingerprint !== ACCEPTED_TEMPLATE_BUNDLE_FINGERPRINT) errors.push("R2B template fingerprint drifted")
  if (input.formattingBundle.bundleFingerprint !== ACCEPTED_FORMATTING_BUNDLE_FINGERPRINT) errors.push("R2C-A formatting fingerprint drifted")
  return errors
}

export function validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
  value: unknown,
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
  fontManifest: FlowDocFontAssetManifestV1,
): FlowDocCanonicalReportMeasurementRequestHandoffValidationV1 {
  const issues: FlowDocCanonicalReportMeasurementRequestHandoffIssueV1[] = []
  if (!isRecord(value)) {
    return { status: "blocked", issues: [issue("invalid-bundle-shape", "", "bundle must be an object")], summary: null }
  }
  const bundle = value as unknown as FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
  validateSources({ dataBundle, templateBundle, formattingBundle }).forEach((message) => {
    issues.push(issue("invalid-source", "sources", message))
  })
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-measurement-request-handoff-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-B") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceDataBundleFingerprint !== dataBundle.bundleFingerprint) issues.push(issue("source-data-fingerprint", "sourceDataBundleFingerprint", "R2A source fingerprint differs"))
  if (bundle.sourceTemplateBundleFingerprint !== templateBundle.bundleFingerprint) issues.push(issue("source-template-fingerprint", "sourceTemplateBundleFingerprint", "R2B source fingerprint differs"))
  if (bundle.sourceFormattingBundleFingerprint !== formattingBundle.bundleFingerprint) issues.push(issue("source-formatting-fingerprint", "sourceFormattingBundleFingerprint", "R2C-A source fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "handoff ownership boundary drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "handoff execution boundary drifted"))
  for (const forbidden of ["pages", "lines", "glyphs", "lineBoxes", "layout", "pdfBytes", "xPt", "yPt"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `handoff must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }

  let expected: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
  try {
    expected = buildBundle({ dataBundle, templateBundle, formattingBundle, fontManifest })
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
    "canonical-bundle-drift", "", "handoff differs from deterministic source projection",
  ))
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}

export function createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
  dataBundle: FlowDocCanonicalReportDataBundleV1,
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1,
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1,
  fontManifest: FlowDocFontAssetManifestV1,
): FlowDocCanonicalReportMeasurementRequestHandoffBundleV1 {
  const sourceErrors = validateSources({ dataBundle, templateBundle, formattingBundle })
  requireFact(sourceErrors.length === 0, sourceErrors.join("; "))
  const bundle = buildBundle({ dataBundle, templateBundle, formattingBundle, fontManifest })
  const validation = validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    bundle,
    dataBundle,
    templateBundle,
    formattingBundle,
    fontManifest,
  )
  requireFact(validation.status === "valid", `generated R2C-B handoff is invalid: ${validation.status === "blocked" ? validation.issues.map((item) => item.message).join("; ") : "unknown"}`)
  return bundle
}
