import { createHash } from "node:crypto"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterRequest,
} from "@flowdoc/vnext-core"
import {
  createFlowDocRustybuzzRawEvidenceMappingPlan,
  type FlowDocRustybuzzRawSmokeOutput,
} from "../../text-engine-rust-wasm/src/index.js"
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
  validateFlowDocCanonicalReportTableProjectionBundleV1,
  type FlowDocCanonicalReportTableProjectionBundleV1,
} from "./canonicalReportTableProjection.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "./canonicalReportTemplateResolution.js"

export const FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_ID = "ocr-benchmark-report-native-shaping-v1" as const

const ACCEPTED_PROJECTION_FINGERPRINT = "f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c"
const RAW_SHAPER_SOURCE = "flowdoc-rustybuzz-native-smoke"
const RAW_SHAPER_REVISION = "rustybuzz-0.20.1"
const REQUIRED_SHAPING_FACTS = [
  "glyph-id",
  "glyph-advance",
  "glyph-offset",
  "cluster-map",
  "text-range",
] as const

type ReportStyleCatalog = FlowDocCanonicalReportTemplateResolutionBundleV1["styleCatalog"]
type ReportStyleKey = keyof ReportStyleCatalog["styles"] & string

interface FlowDocCanonicalReportNativeShapingFontManifestEntryV1 {
  fontId: string
  family: string
  style: "normal" | "italic"
  weight: number
  sha256: string
  target?: {
    kind: string
    path: string
  }
}

export interface FlowDocCanonicalReportNativeShapingFontManifestV1 extends FlowDocFontAssetManifestV1 {
  fontAssets: FlowDocCanonicalReportNativeShapingFontManifestEntryV1[]
  candidateFontAssets: FlowDocCanonicalReportNativeShapingFontManifestEntryV1[]
}

export interface FlowDocCanonicalReportNativeStyleBindingV1 {
  styleKey: string
  fontSizePt: number
  primaryFontId: string
  primaryFontSha256: string
  boldOverrideFontId: string
  boldOverrideFontSha256: string
  lineHeightBinding: "deferred-until-line-break-phase"
}

export interface FlowDocCanonicalReportNativeShapeRequestV1 {
  shapeRequestId: string
  shapeCacheFingerprint: string
  fontId: string
  fontSha256: string
  fontAssetPath: string
  fontSizePt: number
  text: string
  representativeAdapterRequest: VNextTextEngineAdapterRequest
  widthPolicy: "representative-width-ignored-by-native-shaping"
}

export interface FlowDocCanonicalReportNativeMeasurementVariantV1 {
  measurementVariantId: string
  measurementCacheFingerprint: string
  measurementProfileId: string
  styleKey: string
  availableWidthPt: number
  renderedText: string
  shapeRuns: Array<{
    renderStartOffset: number
    renderEndOffset: number
    shapeRequestId: string | null
  }>
}

export type FlowDocCanonicalReportNativeShapingConsumerSourceV1 =
  | {
      lane: "projected-document-text"
      sectionId: string
      zoneRole: string
      textBlockId: string
      projectionTitle: boolean
    }
  | {
      lane: "projected-table-authored-text" | "projected-table-materialized-text"
      projectionId: string
      collectionFieldKey: string
      sectionId: string
      tableId: string
      textBlockId: string
      sourceCellId: string
      rowIndex: number
    }

export interface FlowDocCanonicalReportNativeShapingConsumerV1 {
  consumerId: string
  source: FlowDocCanonicalReportNativeShapingConsumerSourceV1
  sourceRequestFingerprint: string
  measurementVariantId: string
  runBindings: Array<{
    inlineId: string
    kind: string
    renderStartOffset: number
    renderEndOffset: number
    shapeRequestId: string | null
    localBoldOverride: boolean
  }>
}

export interface FlowDocCanonicalReportNativeShapingPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_VERSION
  kind: "canonical-report-native-shaping-plan"
  shapingId: typeof FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_ID
  sourceProjectionFingerprint: string
  measurementProfileId: string
  styleBindings: FlowDocCanonicalReportNativeStyleBindingV1[]
  shapeRequests: FlowDocCanonicalReportNativeShapeRequestV1[]
  measurementVariants: FlowDocCanonicalReportNativeMeasurementVariantV1[]
  consumers: FlowDocCanonicalReportNativeShapingConsumerV1[]
  planFingerprint: string
}

export interface FlowDocCanonicalReportNativeRawExecutionV1 {
  shapeRequestId: string
  rawOutput: FlowDocRustybuzzRawSmokeOutput
}

export interface FlowDocCanonicalReportNativeRawEvidenceBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_VERSION
  kind: "canonical-report-native-raw-shaping-evidence"
  phaseId: "PDF-PILOT-08B-R2C-D"
  sourceProjectionFingerprint: string
  sourcePlanFingerprint: string
  shaper: {
    source: typeof RAW_SHAPER_SOURCE
    revision: typeof RAW_SHAPER_REVISION
    runtime: "node-native"
  }
  executions: FlowDocCanonicalReportNativeRawExecutionV1[]
  rawEvidenceFingerprint: string
}

export interface FlowDocCanonicalReportNativeShapeExecutionV1 {
  shapeRequest: FlowDocCanonicalReportNativeShapeRequestV1
  rawOutputFingerprint: string
  evidence: {
    requestId: string
    measurementProfileId: string
    fontId: string
    fontSizePt: number
    glyphs: VNextTextEngineAdapterGlyphFact[]
    totalAdvancePt: number
  }
  summary: {
    glyphCount: number
    missingGlyphCount: number
    zeroAdvanceGlyphCount: number
    repeatedClusterGlyphCount: number
  }
}

export interface FlowDocCanonicalReportNativeShapingBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_VERSION
  kind: "canonical-report-native-shaping-bundle"
  phaseId: "PDF-PILOT-08B-R2C-D"
  sourceDataBundleFingerprint: string
  sourceTemplateBundleFingerprint: string
  sourceFormattingBundleFingerprint: string
  sourceMeasurementHandoffFingerprint: string
  sourceProjectionFingerprint: string
  sourceRawEvidenceFingerprint: string
  planFingerprint: string
  measurementProfileId: string
  profileBinding: {
    status: "bound-native-shaping-only"
    shaperEngine: "rustybuzz"
    profileShaperRevision: "0.20.1"
    nativeShaperRevision: typeof RAW_SHAPER_REVISION
    revisionCompatibility: "matched-normalized"
    segmenterEngine: "icu4x"
    segmenterRevision: "icu4x-planned"
    segmenterDataRevision: "icu4x-data-planned"
    outputShapeVersion: "glyph-line-box-v1"
    productionBinding: false
  }
  styleBindings: FlowDocCanonicalReportNativeStyleBindingV1[]
  measurementVariants: FlowDocCanonicalReportNativeMeasurementVariantV1[]
  consumers: FlowDocCanonicalReportNativeShapingConsumerV1[]
  shapeExecutions: FlowDocCanonicalReportNativeShapeExecutionV1[]
  downstreamBlockers: Array<{
    code: "icu4x-runtime-not-concrete" | "line-height-not-bound" | "wasm-shaping-export-not-qualified"
    blocks: "line-breaking" | "line-boxes" | "browser-worker-shaping"
    message: string
  }>
  ownership: {
    shapingOwns: ["style-font-binding", "run-segmentation", "native-rustybuzz-execution", "glyph-evidence", "utf16-cluster-mapping"]
    shapingMustNotOwn: ["source-values", "display-formatting", "break-opportunities", "line-boxes", "layout", "pagination", "pdf-bytes"]
  }
  execution: {
    tableProjection: "consumed"
    measurementProfileBinding: "bound-native-shaping-only"
    fontAssets: "hash-verified"
    nativeRustybuzzShaping: "executed"
    glyphEvidence: "mapped"
    lineBreakSegmentation: "blocked-planned-icu4x-runtime"
    lineBoxes: "not-run"
    wasmShaping: "not-run"
    layout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    sourceBlockRequestCount: number
    sourceRunCount: number
    emptyRunCount: number
    nativeShapeRunCount: number
    localBoldOverrideRunCount: number
    uniqueMeasurementVariantCount: number
    uniqueShapeExecutionCount: number
    deduplicatedShapeRunCount: number
    styleBindingCount: number
    fontAssetCount: number
    glyphCount: number
    missingGlyphCount: number
    zeroAdvanceGlyphCount: number
    repeatedClusterGlyphCount: number
    generatedInlineDeferredBlockCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportNativeShapingIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportNativeShapingValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportNativeShapingBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportNativeShapingIssueV1[]; summary: null }

export interface FlowDocCanonicalReportNativeShapingSourceInputV1 {
  dataBundle: FlowDocCanonicalReportDataBundleV1
  templateBundle: FlowDocCanonicalReportTemplateResolutionBundleV1
  formattingBundle: FlowDocCanonicalReportDisplayFormattingBundleV1
  measurementHandoff: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1
  projectionBundle: FlowDocCanonicalReportTableProjectionBundleV1
  fontManifest: FlowDocCanonicalReportNativeShapingFontManifestV1
}

interface SourceRequestEntry {
  request: VNextTextBlockV4MeasurementRequest
  source: FlowDocCanonicalReportNativeShapingConsumerSourceV1
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportNativeShapingBundleV1["ownership"] = {
  shapingOwns: ["style-font-binding", "run-segmentation", "native-rustybuzz-execution", "glyph-evidence", "utf16-cluster-mapping"],
  shapingMustNotOwn: ["source-values", "display-formatting", "break-opportunities", "line-boxes", "layout", "pagination", "pdf-bytes"],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportNativeShapingBundleV1["execution"] = {
  tableProjection: "consumed",
  measurementProfileBinding: "bound-native-shaping-only",
  fontAssets: "hash-verified",
  nativeRustybuzzShaping: "executed",
  glyphEvidence: "mapped",
  lineBreakSegmentation: "blocked-planned-icu4x-runtime",
  lineBoxes: "not-run",
  wasmShaping: "not-run",
  layout: "not-run",
  pagination: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportNativeShapingBundleV1["downstreamBlockers"] = [
  {
    code: "icu4x-runtime-not-concrete",
    blocks: "line-breaking",
    message: "The accepted profile still names planned ICU4X code and data revisions; no concrete segmenter execution is available.",
  },
  {
    code: "line-height-not-bound",
    blocks: "line-boxes",
    message: "The R2B style catalog pins font sizes but does not yet bind report-native line-height values.",
  },
  {
    code: "wasm-shaping-export-not-qualified",
    blocks: "browser-worker-shaping",
    message: "The pinned WASM artifact exposes readiness identity only and has not qualified a shaping export for this report profile.",
  },
]

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportNativeShapingIssueV1 {
  return { code, path, message, severity: "error" }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const output = { ...value }
  delete output[key]
  return output
}

function manifestFont(
  manifest: FlowDocCanonicalReportNativeShapingFontManifestV1,
  fontId: string,
): FlowDocCanonicalReportNativeShapingFontManifestEntryV1 {
  const entry = [...manifest.fontAssets, ...manifest.candidateFontAssets].find((font) => font.fontId === fontId)
  requireFact(entry != null, `registered font is missing: ${fontId}`)
  requireFact(entry.target?.path != null && entry.target.path.length > 0, `registered font target path is missing: ${fontId}`)
  return entry
}

function styleBindings(input: FlowDocCanonicalReportNativeShapingSourceInputV1): FlowDocCanonicalReportNativeStyleBindingV1[] {
  const mappings = input.measurementHandoff.measurementProfile.ingredients.styleMappings
  const bold = manifestFont(input.fontManifest, "ibm-plex-sans-thai-bold")
  return Object.values(input.templateBundle.styleCatalog.styles).map((style) => {
    const fontSize = style.runStyle.fontSize
    requireFact(fontSize?.unit === "pt", `report style ${style.key} must use point font sizes`)
    const mapping = mappings.find((item) => item.styleKey === style.key)
    requireFact(mapping != null, `measurement profile style mapping is missing: ${style.key}`)
    const primary = manifestFont(input.fontManifest, mapping.primaryFontId)
    requireFact(input.measurementHandoff.measurementProfile.ingredients.fontAssets.some((font) => (
      font.fontId === primary.fontId && font.sha256 === `sha256-${primary.sha256}`
    )), `measurement profile font hash drifted: ${primary.fontId}`)
    return {
      styleKey: style.key,
      fontSizePt: fontSize.value,
      primaryFontId: primary.fontId,
      primaryFontSha256: primary.sha256,
      boldOverrideFontId: bold.fontId,
      boldOverrideFontSha256: bold.sha256,
      lineHeightBinding: "deferred-until-line-break-phase",
    }
  })
}

function sourceRequests(projection: FlowDocCanonicalReportTableProjectionBundleV1): SourceRequestEntry[] {
  const entries: SourceRequestEntry[] = projection.documentRequests.map((item) => ({
    request: item.request,
    source: {
      lane: "projected-document-text",
      sectionId: item.sectionId,
      zoneRole: item.zoneRole,
      textBlockId: item.textBlockId,
      projectionTitle: item.projectionTitle,
    },
  }))
  projection.tableMeasurements.forEach((table) => {
    Object.values(table.authoredPreparation.requestsByTextBlockId).forEach((item) => {
      entries.push({
        request: item.request,
        source: {
          lane: "projected-table-authored-text",
          projectionId: table.projectionId,
          collectionFieldKey: table.collectionFieldKey,
          sectionId: table.sectionId,
          tableId: table.tableId,
          textBlockId: item.textBlockId,
          sourceCellId: item.sourceCellId,
          rowIndex: item.rowIndex,
        },
      })
    })
    Object.values(table.materializedPreparation.requestsByTextBlockId).forEach((item) => {
      entries.push({
        request: item.request,
        source: {
          lane: "projected-table-materialized-text",
          projectionId: table.projectionId,
          collectionFieldKey: table.collectionFieldKey,
          sectionId: table.sectionId,
          tableId: table.tableId,
          textBlockId: item.textBlockId,
          sourceCellId: item.sourceCellId,
          rowIndex: item.rowIndex,
        },
      })
    })
  })
  return entries
}

function effectiveFont(
  run: VNextTextBlockV4MeasurementRequest["runs"][number],
  binding: FlowDocCanonicalReportNativeStyleBindingV1,
  manifest: FlowDocCanonicalReportNativeShapingFontManifestV1,
) {
  const localStyle = run.localStyle
  if (localStyle != null) {
    const keys = Object.keys(localStyle)
    requireFact(keys.length === 1 && localStyle.fontWeight === "bold", `unsupported local shaping override on ${run.inlineId}`)
  }
  const fontId = localStyle?.fontWeight === "bold" ? binding.boldOverrideFontId : binding.primaryFontId
  return manifestFont(manifest, fontId)
}

function createPlan(input: FlowDocCanonicalReportNativeShapingSourceInputV1): FlowDocCanonicalReportNativeShapingPlanV1 {
  const bindings = styleBindings(input)
  const bindingByStyle = new Map(bindings.map((binding) => [binding.styleKey, binding]))
  const shapeByKey = new Map<string, FlowDocCanonicalReportNativeShapeRequestV1>()
  const measurementByKey = new Map<string, FlowDocCanonicalReportNativeMeasurementVariantV1>()
  const consumers: FlowDocCanonicalReportNativeShapingConsumerV1[] = []

  sourceRequests(input.projectionBundle).forEach((entry) => {
    const style = bindingByStyle.get(entry.request.styleKey)
    requireFact(style != null, `native style binding is missing: ${entry.request.styleKey}`)
    let reconstructed = ""
    const runBindings = entry.request.runs.map((run) => {
      requireFact(run.kind === "text" || run.kind === "resolved-field", `unsupported native shaping run kind: ${run.kind}`)
      requireFact(run.renderStartOffset === reconstructed.length, `native shaping run gap: ${run.inlineId}`)
      reconstructed += run.renderedText
      requireFact(run.renderEndOffset === reconstructed.length, `native shaping run range drifted: ${run.inlineId}`)
      if (run.renderedText.length === 0) return {
        inlineId: run.inlineId,
        kind: run.kind,
        renderStartOffset: run.renderStartOffset,
        renderEndOffset: run.renderEndOffset,
        shapeRequestId: null,
        localBoldOverride: run.localStyle?.fontWeight === "bold",
      }
      const font = effectiveFont(run, style, input.fontManifest)
      const shapeKey = JSON.stringify({
        measurementProfileId: entry.request.measurementProfileId,
        fontId: font.fontId,
        fontSha256: font.sha256,
        fontSizePt: style.fontSizePt,
        text: run.renderedText,
        features: ["kern", "liga", "complex-clusters"],
      })
      let shapeRequest = shapeByKey.get(shapeKey)
      if (shapeRequest == null) {
        const fingerprint = sha256(shapeKey)
        const shapeRequestId = `report-shape:${fingerprint.slice(0, 32)}`
        shapeRequest = {
          shapeRequestId,
          shapeCacheFingerprint: fingerprint,
          fontId: font.fontId,
          fontSha256: font.sha256,
          fontAssetPath: font.target!.path,
          fontSizePt: style.fontSizePt,
          text: run.renderedText,
          representativeAdapterRequest: {
            requestId: shapeRequestId,
            smokeCaseId: `canonical-report:${shapeRequestId}`,
            sampleId: `canonical-report-sample:${fingerprint.slice(0, 24)}`,
            measurementProfileId: entry.request.measurementProfileId,
            text: run.renderedText,
            locale: "th",
            fontId: font.fontId,
            styleKey: entry.request.styleKey,
            availableWidthPt: entry.request.availableWidthPt,
            outputShapeVersion: "glyph-line-box-v1",
            requestedFacts: [...REQUIRED_SHAPING_FACTS],
          },
          widthPolicy: "representative-width-ignored-by-native-shaping",
        }
        shapeByKey.set(shapeKey, shapeRequest)
      }
      return {
        inlineId: run.inlineId,
        kind: run.kind,
        renderStartOffset: run.renderStartOffset,
        renderEndOffset: run.renderEndOffset,
        shapeRequestId: shapeRequest.shapeRequestId,
        localBoldOverride: run.localStyle?.fontWeight === "bold",
      }
    })
    requireFact(reconstructed === entry.request.renderedText, `native shaping text reconstruction drifted: ${entry.request.textBlockId}`)
    const measurementKey = JSON.stringify({
      measurementProfileId: entry.request.measurementProfileId,
      styleKey: entry.request.styleKey,
      availableWidthPt: entry.request.availableWidthPt,
      renderedText: entry.request.renderedText,
      shapeRuns: runBindings.map((run) => ({
        renderStartOffset: run.renderStartOffset,
        renderEndOffset: run.renderEndOffset,
        shapeRequestId: run.shapeRequestId,
      })),
    })
    let measurement = measurementByKey.get(measurementKey)
    if (measurement == null) {
      const fingerprint = sha256(measurementKey)
      measurement = {
        measurementVariantId: `report-measure:${fingerprint.slice(0, 32)}`,
        measurementCacheFingerprint: fingerprint,
        measurementProfileId: entry.request.measurementProfileId,
        styleKey: entry.request.styleKey,
        availableWidthPt: entry.request.availableWidthPt,
        renderedText: entry.request.renderedText,
        shapeRuns: runBindings.map((run) => ({
          renderStartOffset: run.renderStartOffset,
          renderEndOffset: run.renderEndOffset,
          shapeRequestId: run.shapeRequestId,
        })),
      }
      measurementByKey.set(measurementKey, measurement)
    }
    const sourceRequestFingerprint = sha256(JSON.stringify(entry.request))
    consumers.push({
      consumerId: `report-consumer:${sha256(JSON.stringify({ source: entry.source, sourceRequestFingerprint })).slice(0, 32)}`,
      source: clone(entry.source),
      sourceRequestFingerprint,
      measurementVariantId: measurement.measurementVariantId,
      runBindings,
    })
  })

  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-native-shaping-plan" as const,
    shapingId: FLOWDOC_CANONICAL_REPORT_NATIVE_SHAPING_ID,
    sourceProjectionFingerprint: input.projectionBundle.bundleFingerprint,
    measurementProfileId: input.measurementHandoff.measurementProfile.measurementProfileId,
    styleBindings: bindings,
    shapeRequests: [...shapeByKey.values()],
    measurementVariants: [...measurementByKey.values()],
    consumers,
  }
  return { ...unsigned, planFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportNativeShapingPlanV1(
  input: FlowDocCanonicalReportNativeShapingSourceInputV1,
): FlowDocCanonicalReportNativeShapingPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

export function createFlowDocCanonicalReportNativeRawEvidenceBundleV1(
  plan: FlowDocCanonicalReportNativeShapingPlanV1,
  executions: readonly FlowDocCanonicalReportNativeRawExecutionV1[],
): FlowDocCanonicalReportNativeRawEvidenceBundleV1 {
  requireFact(executions.length === plan.shapeRequests.length, "raw native execution count must match the shaping plan")
  executions.forEach((execution, index) => {
    const request = plan.shapeRequests[index]
    requireFact(execution.shapeRequestId === request.shapeRequestId, `raw native execution order drifted at ${index}`)
    requireFact(execution.rawOutput.source === RAW_SHAPER_SOURCE, `raw native source drifted: ${execution.shapeRequestId}`)
    requireFact(execution.rawOutput.shaperRevision === RAW_SHAPER_REVISION, `raw native revision drifted: ${execution.shapeRequestId}`)
    requireFact(execution.rawOutput.fontId === request.fontId, `raw native font drifted: ${execution.shapeRequestId}`)
    requireFact(execution.rawOutput.text === request.text, `raw native text drifted: ${execution.shapeRequestId}`)
    requireFact(execution.rawOutput.fontPath === request.fontAssetPath, `raw native font path must be repository-relative: ${execution.shapeRequestId}`)
  })
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-native-raw-shaping-evidence" as const,
    phaseId: "PDF-PILOT-08B-R2C-D" as const,
    sourceProjectionFingerprint: plan.sourceProjectionFingerprint,
    sourcePlanFingerprint: plan.planFingerprint,
    shaper: {
      source: RAW_SHAPER_SOURCE as typeof RAW_SHAPER_SOURCE,
      revision: RAW_SHAPER_REVISION as typeof RAW_SHAPER_REVISION,
      runtime: "node-native" as const,
    },
    executions: executions.map(clone),
  }
  return { ...unsigned, rawEvidenceFingerprint: sha256(JSON.stringify(unsigned)) }
}

function mapExecutions(
  plan: FlowDocCanonicalReportNativeShapingPlanV1,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1,
): FlowDocCanonicalReportNativeShapeExecutionV1[] {
  const rawById = new Map(raw.executions.map((execution) => [execution.shapeRequestId, execution.rawOutput]))
  return plan.shapeRequests.map((shapeRequest) => {
    const rawOutput = rawById.get(shapeRequest.shapeRequestId)
    requireFact(rawOutput != null, `raw native evidence is missing: ${shapeRequest.shapeRequestId}`)
    const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
      request: shapeRequest.representativeAdapterRequest,
      rawOutput,
      engine: {
        shaper: "rustybuzz",
        shaperRevision: RAW_SHAPER_REVISION,
        segmenter: "icu4x",
        segmenterRevision: "icu4x-planned",
        segmenterDataRevision: "icu4x-data-planned",
        deterministic: true,
      },
      fontSizePt: shapeRequest.fontSizePt,
      lineHeightPt: shapeRequest.fontSizePt,
    })
    requireFact(mapping.status === "ready" && mapping.evidence != null, `native glyph mapping blocked: ${shapeRequest.shapeRequestId}`)
    return {
      shapeRequest: clone(shapeRequest),
      rawOutputFingerprint: sha256(JSON.stringify(rawOutput)),
      evidence: {
        requestId: shapeRequest.shapeRequestId,
        measurementProfileId: shapeRequest.representativeAdapterRequest.measurementProfileId,
        fontId: shapeRequest.fontId,
        fontSizePt: shapeRequest.fontSizePt,
        glyphs: mapping.evidence.glyphs.map(clone),
        totalAdvancePt: mapping.evidence.totalAdvancePt,
      },
      summary: {
        glyphCount: mapping.summary.glyphCount,
        missingGlyphCount: mapping.evidence.glyphs.filter((glyph) => glyph.glyphId === 0).length,
        zeroAdvanceGlyphCount: mapping.summary.zeroAdvanceGlyphCount,
        repeatedClusterGlyphCount: mapping.summary.repeatedClusterGlyphCount,
      },
    }
  })
}

function validateRawBundle(
  plan: FlowDocCanonicalReportNativeShapingPlanV1,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1,
): string[] {
  const errors: string[] = []
  if (raw.contractVersion !== 1 || raw.kind !== "canonical-report-native-raw-shaping-evidence") errors.push("raw native bundle shape is invalid")
  if (raw.phaseId !== "PDF-PILOT-08B-R2C-D") errors.push("raw native phase identity drifted")
  if (raw.sourceProjectionFingerprint !== plan.sourceProjectionFingerprint) errors.push("raw native projection fingerprint drifted")
  if (raw.sourcePlanFingerprint !== plan.planFingerprint) errors.push("raw native plan fingerprint drifted")
  if (raw.rawEvidenceFingerprint !== sha256(JSON.stringify(withoutFingerprint(raw, "rawEvidenceFingerprint")))) errors.push("raw native fingerprint does not match content")
  if (raw.executions.length !== plan.shapeRequests.length) errors.push("raw native execution count drifted")
  raw.executions.forEach((execution, index) => {
    const request = plan.shapeRequests[index]
    if (request == null || execution.shapeRequestId !== request.shapeRequestId) errors.push(`raw native execution identity drifted at ${index}`)
    if (execution.rawOutput.fontPath !== request?.fontAssetPath) errors.push(`raw native font path drifted at ${index}`)
  })
  return errors
}

function buildBundle(
  input: FlowDocCanonicalReportNativeShapingSourceInputV1,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1,
): FlowDocCanonicalReportNativeShapingBundleV1 {
  const plan = createPlan(input)
  const rawErrors = validateRawBundle(plan, raw)
  requireFact(rawErrors.length === 0, rawErrors.join("; "))
  const executions = mapExecutions(plan, raw)
  const summaries = executions.map((execution) => execution.summary)
  const sourceRunCount = plan.consumers.reduce((total, consumer) => total + consumer.runBindings.length, 0)
  const emptyRunCount = plan.consumers.reduce(
    (total, consumer) => total + consumer.runBindings.filter((run) => run.shapeRequestId == null).length,
    0,
  )
  const nativeShapeRunCount = sourceRunCount - emptyRunCount
  const unsigned: Omit<FlowDocCanonicalReportNativeShapingBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-native-shaping-bundle",
    phaseId: "PDF-PILOT-08B-R2C-D",
    sourceDataBundleFingerprint: input.dataBundle.bundleFingerprint,
    sourceTemplateBundleFingerprint: input.templateBundle.bundleFingerprint,
    sourceFormattingBundleFingerprint: input.formattingBundle.bundleFingerprint,
    sourceMeasurementHandoffFingerprint: input.measurementHandoff.bundleFingerprint,
    sourceProjectionFingerprint: input.projectionBundle.bundleFingerprint,
    sourceRawEvidenceFingerprint: raw.rawEvidenceFingerprint,
    planFingerprint: plan.planFingerprint,
    measurementProfileId: plan.measurementProfileId,
    profileBinding: {
      status: "bound-native-shaping-only",
      shaperEngine: "rustybuzz",
      profileShaperRevision: "0.20.1",
      nativeShaperRevision: RAW_SHAPER_REVISION,
      revisionCompatibility: "matched-normalized",
      segmenterEngine: "icu4x",
      segmenterRevision: "icu4x-planned",
      segmenterDataRevision: "icu4x-data-planned",
      outputShapeVersion: "glyph-line-box-v1",
      productionBinding: false,
    },
    styleBindings: plan.styleBindings,
    measurementVariants: plan.measurementVariants,
    consumers: plan.consumers,
    shapeExecutions: executions,
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      sourceBlockRequestCount: plan.consumers.length,
      sourceRunCount,
      emptyRunCount,
      nativeShapeRunCount,
      localBoldOverrideRunCount: plan.consumers.reduce(
        (total, consumer) => total + consumer.runBindings.filter((run) => run.localBoldOverride).length,
        0,
      ),
      uniqueMeasurementVariantCount: plan.measurementVariants.length,
      uniqueShapeExecutionCount: executions.length,
      deduplicatedShapeRunCount: nativeShapeRunCount - executions.length,
      styleBindingCount: plan.styleBindings.length,
      fontAssetCount: new Set(plan.shapeRequests.map((request) => request.fontId)).size,
      glyphCount: summaries.reduce((total, summary) => total + summary.glyphCount, 0),
      missingGlyphCount: summaries.reduce((total, summary) => total + summary.missingGlyphCount, 0),
      zeroAdvanceGlyphCount: summaries.reduce((total, summary) => total + summary.zeroAdvanceGlyphCount, 0),
      repeatedClusterGlyphCount: summaries.reduce((total, summary) => total + summary.repeatedClusterGlyphCount, 0),
      generatedInlineDeferredBlockCount: input.projectionBundle.generatedInlineDeferrals.length,
    },
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

function validateSources(input: FlowDocCanonicalReportNativeShapingSourceInputV1): string[] {
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
  if (validateFlowDocCanonicalReportTableProjectionBundleV1(
    input.projectionBundle,
    input.dataBundle,
    input.templateBundle,
    input.formattingBundle,
    input.measurementHandoff,
    input.fontManifest,
  ).status !== "valid") errors.push("R2C-C table projection is invalid")
  if (input.projectionBundle.bundleFingerprint !== ACCEPTED_PROJECTION_FINGERPRINT) errors.push("R2C-C projection fingerprint drifted")
  if (input.measurementHandoff.measurementProfile.status !== "stable") errors.push("report measurement profile is not stable")
  if (input.measurementHandoff.measurementProfile.ingredients.shaper.revision !== "0.20.1") errors.push("report rustybuzz revision drifted")
  if (input.measurementHandoff.measurementProfile.ingredients.segmenter.revision !== "icu4x-planned") errors.push("report ICU4X revision drifted")
  return errors
}

export function createFlowDocCanonicalReportNativeShapingBundleV1(
  input: FlowDocCanonicalReportNativeShapingSourceInputV1,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1,
): FlowDocCanonicalReportNativeShapingBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  const bundle = buildBundle(input, raw)
  requireFact(bundle.summary.missingGlyphCount === 0, "native report shaping produced missing glyphs")
  return bundle
}

export function validateFlowDocCanonicalReportNativeShapingBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportNativeShapingSourceInputV1,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1,
): FlowDocCanonicalReportNativeShapingValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportNativeShapingBundleV1
  const issues: FlowDocCanonicalReportNativeShapingIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-native-shaping-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-D") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceProjectionFingerprint !== input.projectionBundle.bundleFingerprint) issues.push(issue("source-projection-fingerprint", "sourceProjectionFingerprint", "R2C-C source fingerprint differs"))
  if (bundle.sourceRawEvidenceFingerprint !== raw.rawEvidenceFingerprint) issues.push(issue("source-raw-fingerprint", "sourceRawEvidenceFingerprint", "raw evidence fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "native shaping ownership boundary drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "native shaping execution boundary drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "native shaping downstream blockers drifted"))
  for (const forbidden of ["breakOpportunities", "lineBoxes", "layout", "pages", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `native shaping bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportNativeShapingBundleV1
  try {
    expected = buildBundle(input, raw)
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
    issue("canonical-bundle-drift", "", "native shaping bundle differs from deterministic source and raw evidence"),
  )
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
