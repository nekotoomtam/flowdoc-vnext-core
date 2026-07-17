import { createHash } from "node:crypto"
import type {
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterRequest,
  VNextThaiLineBreakKind,
  VNextThaiLineBreakOpportunity,
} from "@flowdoc/vnext-core"
import {
  createFlowDocTextEngineLineWrapEvidencePlan,
  type FlowDocTextEngineLineWrapLineSummary,
} from "../../text-engine-rust-wasm/src/lineWrapEvidence.js"
import type {
  FlowDocCanonicalReportNativeMeasurementVariantV1,
  FlowDocCanonicalReportNativeShapingBundleV1,
} from "./canonicalReportNativeShaping.js"

export const FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_ID = "ocr-benchmark-report-line-breaking-v1" as const

const ACCEPTED_NATIVE_SHAPING_FINGERPRINT = "cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f"
const ACCEPTED_TYPOGRAPHY_MANIFEST_ID = "pdf-pilot-08b-canonical-report-typography-calibration-v1"
const RAW_SEGMENTER_SOURCE = "flowdoc-icu4x-native-line-segmenter"
const SEGMENTER_REVISION = "icu_segmenter-2.2.0"
const SEGMENTER_DATA_REVISION = "icu_segmenter_data-2.2.0"
const LINE_BREAK_POLICY = "icu4x-auto-default-uax14-machine-identifier-delimiters-v1"

export interface FlowDocCanonicalReportTypographyCalibrationManifestV1 {
  manifestVersion: number
  manifestId: string
  stylePatches: Record<string, {
    fontSizePt?: number
    lineHeightPt?: number
  }>
  pagePatches: Array<{
    pageId: string
    operations: Array<{
      element?: Record<string, unknown>
    }>
  }>
}

export interface FlowDocCanonicalReportLineHeightBindingV1 {
  styleKey: string
  fontSizePt: number
  lineHeightPt: number
  sourceCalibration: {
    manifestId: string
    path: string
    sourceFontSizePt: number
    sourceLineHeightPt: number
    method: "exact-font-size-role-match" | "accepted-role-line-height-reuse"
  }
}

export interface FlowDocCanonicalReportLineSegmentRequestV1 {
  segmentRequestId: string
  segmentCacheFingerprint: string
  locale: "th"
  text: string
  measurementVariantIds: string[]
}

export interface FlowDocCanonicalReportLineBreakingPlanV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_VERSION
  kind: "canonical-report-line-breaking-plan"
  lineBreakingId: typeof FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_ID
  sourceNativeShapingFingerprint: string
  sourceTypographyCalibrationFingerprint: string
  measurementProfileId: string
  segmenter: {
    source: typeof RAW_SEGMENTER_SOURCE
    revision: typeof SEGMENTER_REVISION
    dataRevision: typeof SEGMENTER_DATA_REVISION
    lineBreakPolicy: typeof LINE_BREAK_POLICY
  }
  lineHeightBindings: FlowDocCanonicalReportLineHeightBindingV1[]
  segmentRequests: FlowDocCanonicalReportLineSegmentRequestV1[]
  planFingerprint: string
}

export interface FlowDocIcu4xNativeLineSegmentOutputV1 {
  source: string
  segmenterRevision: string
  dataRevision: string
  text: string
  textByteLength: number
  textScalarCount: number
  breakByteOffsets: number[]
}

export interface FlowDocCanonicalReportNativeLineSegmentExecutionV1 {
  segmentRequestId: string
  rawOutput: FlowDocIcu4xNativeLineSegmentOutputV1
}

export interface FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_VERSION
  kind: "canonical-report-native-line-segment-evidence"
  phaseId: "PDF-PILOT-08B-R2C-E"
  sourceNativeShapingFingerprint: string
  sourcePlanFingerprint: string
  segmenter: {
    source: typeof RAW_SEGMENTER_SOURCE
    revision: typeof SEGMENTER_REVISION
    dataRevision: typeof SEGMENTER_DATA_REVISION
    runtime: "node-native"
    rawOffsetUnit: "utf8-byte"
  }
  executions: FlowDocCanonicalReportNativeLineSegmentExecutionV1[]
  rawEvidenceFingerprint: string
}

export interface FlowDocCanonicalReportLineMeasurementV1 {
  measurementVariantId: string
  measurementCacheFingerprint: string
  measurementProfileId: string
  styleKey: string
  availableWidthPt: number
  renderedText: string
  lineHeightPt: number
  segmentRequestId: string | null
  shapeRuns: FlowDocCanonicalReportNativeMeasurementVariantV1["shapeRuns"]
  breakOpportunities: VNextThaiLineBreakOpportunity[]
  lineBoxes: VNextTextEngineAdapterLineBoxFact[]
  lineSummaries: FlowDocTextEngineLineWrapLineSummary[]
  summary: {
    glyphCount: number
    coveredGlyphCount: number
    breakOpportunityCount: number
    tailoredBreakOpportunityCount: number
    lineCount: number
    overflowLineCount: number
    totalAdvancePt: number
    emptyTextPolicyApplied: boolean
  }
}

export interface FlowDocCanonicalReportLineBreakingBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_VERSION
  kind: "canonical-report-line-breaking-bundle"
  phaseId: "PDF-PILOT-08B-R2C-E"
  sourceNativeShapingFingerprint: string
  sourceTypographyCalibrationFingerprint: string
  sourceRawSegmentationFingerprint: string
  planFingerprint: string
  measurementProfileId: string
  profileBinding: {
    status: "bound-native-line-breaking-only"
    sourceProfileSegmenterRevision: "icu4x-planned"
    sourceProfileSegmenterDataRevision: "icu4x-data-planned"
    nativeSegmenterRevision: typeof SEGMENTER_REVISION
    nativeSegmenterDataRevision: typeof SEGMENTER_DATA_REVISION
    pilotCompatibility: "concrete-pilot-binding-does-not-mutate-source-profile"
    lineBreakPolicy: typeof LINE_BREAK_POLICY
    outputShapeVersion: "glyph-line-box-v1"
    productionBinding: false
  }
  lineHeightBindings: FlowDocCanonicalReportLineHeightBindingV1[]
  measurements: FlowDocCanonicalReportLineMeasurementV1[]
  downstreamBlockers: Array<{
    code: "source-profile-still-planned" | "wasm-segmentation-not-qualified" | "vertical-layout-not-executed"
    blocks: "production-measurement" | "browser-worker-line-breaking" | "pagination"
    message: string
  }>
  ownership: {
    lineBreakingOwns: [
      "calibrated-line-height-binding",
      "native-icu4x-execution",
      "utf8-to-utf16-break-mapping",
      "glyph-advance-wrapping",
      "line-box-evidence",
    ]
    lineBreakingMustNotOwn: [
      "source-values",
      "display-formatting",
      "measurement-profile-mutation",
      "vertical-layout",
      "pagination",
      "pdf-bytes",
    ]
  }
  execution: {
    nativeShaping: "consumed"
    typographyCalibration: "consumed"
    nativeIcu4xSegmentation: "executed"
    lineHeightBinding: "bound"
    breakOffsetConversion: "utf8-byte-to-utf16-code-unit"
    lineBoxes: "created"
    wasmSegmentation: "not-run"
    productionMeasurementBinding: "not-run"
    verticalLayout: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    sourceConsumerCount: number
    measurementVariantCount: number
    emptyMeasurementVariantCount: number
    nativeSegmentExecutionCount: number
    deduplicatedSegmentExecutionCount: number
    lineHeightBindingCount: number
    measurementGlyphCount: number
    coveredGlyphCount: number
    breakOpportunityCount: number
    tailoredBreakOpportunityCount: number
    lineCount: number
    multiLineMeasurementCount: number
    overflowLineCount: number
    maxLineCount: number
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportLineBreakingIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocCanonicalReportLineBreakingValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportLineBreakingBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportLineBreakingIssueV1[]; summary: null }

export interface FlowDocCanonicalReportLineBreakingSourceInputV1 {
  nativeShaping: FlowDocCanonicalReportNativeShapingBundleV1
  typographyCalibration: FlowDocCanonicalReportTypographyCalibrationManifestV1
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportLineBreakingBundleV1["ownership"] = {
  lineBreakingOwns: [
    "calibrated-line-height-binding",
    "native-icu4x-execution",
    "utf8-to-utf16-break-mapping",
    "glyph-advance-wrapping",
    "line-box-evidence",
  ],
  lineBreakingMustNotOwn: [
    "source-values",
    "display-formatting",
    "measurement-profile-mutation",
    "vertical-layout",
    "pagination",
    "pdf-bytes",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportLineBreakingBundleV1["execution"] = {
  nativeShaping: "consumed",
  typographyCalibration: "consumed",
  nativeIcu4xSegmentation: "executed",
  lineHeightBinding: "bound",
  breakOffsetConversion: "utf8-byte-to-utf16-code-unit",
  lineBoxes: "created",
  wasmSegmentation: "not-run",
  productionMeasurementBinding: "not-run",
  verticalLayout: "not-run",
  pagination: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportLineBreakingBundleV1["downstreamBlockers"] = [
  {
    code: "source-profile-still-planned",
    blocks: "production-measurement",
    message: "The accepted R2B profile still carries planned ICU4X identity; this concrete pilot binding does not mutate it.",
  },
  {
    code: "wasm-segmentation-not-qualified",
    blocks: "browser-worker-line-breaking",
    message: "The native ICU4X result has not yet been compared with the browser-worker WASM artifact.",
  },
  {
    code: "vertical-layout-not-executed",
    blocks: "pagination",
    message: "Line boxes are available, but block spacing, table row heights, and vertical page composition have not run.",
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

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportLineBreakingIssueV1 {
  return { code, path, message, severity: "error" }
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]
  return copy
}

function tableCalibrationValues(
  manifest: FlowDocCanonicalReportTypographyCalibrationManifestV1,
  fontSizeKey: "fontSizePt" | "headerFontSizePt",
  lineHeightKey: "lineHeightPt" | "headerLineHeightPt",
): { fontSizePt: number; lineHeightPt: number } {
  const values = manifest.pagePatches.flatMap((page) => page.operations.flatMap((operation) => {
    const element = operation.element
    const fontSizePt = element?.[fontSizeKey]
    const lineHeightPt = element?.[lineHeightKey]
    return typeof fontSizePt === "number" && typeof lineHeightPt === "number"
      ? [{ fontSizePt, lineHeightPt }]
      : []
  }))
  requireFact(values.length > 0, `typography calibration is missing ${fontSizeKey}/${lineHeightKey}`)
  const unique = new Set(values.map((value) => `${value.fontSizePt}:${value.lineHeightPt}`))
  requireFact(unique.size === 1, `typography calibration has inconsistent ${fontSizeKey}/${lineHeightKey}`)
  return values[0]
}

function styleCalibrationValue(
  manifest: FlowDocCanonicalReportTypographyCalibrationManifestV1,
  styleId: string,
): { fontSizePt: number; lineHeightPt: number } {
  const patch = manifest.stylePatches[styleId]
  requireFact(
    typeof patch?.fontSizePt === "number" && typeof patch.lineHeightPt === "number",
    `typography calibration is missing ${styleId} font size or line height`,
  )
  return { fontSizePt: patch.fontSizePt, lineHeightPt: patch.lineHeightPt }
}

function lineHeightBindings(input: FlowDocCanonicalReportLineBreakingSourceInputV1): FlowDocCanonicalReportLineHeightBindingV1[] {
  const manifest = input.typographyCalibration
  const sourceByStyle = new Map<string, {
    path: string
    values: { fontSizePt: number; lineHeightPt: number }
  }>([
    ["report-title", { path: "stylePatches.coverTitle", values: styleCalibrationValue(manifest, "coverTitle") }],
    ["section-heading", { path: "stylePatches.pageTitle", values: styleCalibrationValue(manifest, "pageTitle") }],
    ["report-body", { path: "stylePatches.body", values: styleCalibrationValue(manifest, "body") }],
    ["report-caption", { path: "stylePatches.caption", values: styleCalibrationValue(manifest, "caption") }],
    ["table-header", {
      path: "pagePatches[*].operations[*].element.headerLineHeightPt",
      values: tableCalibrationValues(manifest, "headerFontSizePt", "headerLineHeightPt"),
    }],
    ["table-body", {
      path: "pagePatches[*].operations[*].element.lineHeightPt",
      values: tableCalibrationValues(manifest, "fontSizePt", "lineHeightPt"),
    }],
  ])

  return input.nativeShaping.styleBindings.map((binding) => {
    const source = sourceByStyle.get(binding.styleKey)
    requireFact(source != null, `line-height calibration is missing for ${binding.styleKey}`)
    return {
      styleKey: binding.styleKey,
      fontSizePt: binding.fontSizePt,
      lineHeightPt: source.values.lineHeightPt,
      sourceCalibration: {
        manifestId: manifest.manifestId,
        path: source.path,
        sourceFontSizePt: source.values.fontSizePt,
        sourceLineHeightPt: source.values.lineHeightPt,
        method: binding.fontSizePt === source.values.fontSizePt
          ? "exact-font-size-role-match"
          : "accepted-role-line-height-reuse",
      },
    }
  })
}

function createPlan(input: FlowDocCanonicalReportLineBreakingSourceInputV1): FlowDocCanonicalReportLineBreakingPlanV1 {
  const segmentByText = new Map<string, FlowDocCanonicalReportLineSegmentRequestV1>()
  input.nativeShaping.measurementVariants.forEach((variant) => {
    if (variant.renderedText.length === 0) return
    const identity = {
      locale: "th",
      text: variant.renderedText,
      segmenterRevision: SEGMENTER_REVISION,
      segmenterDataRevision: SEGMENTER_DATA_REVISION,
      lineBreakPolicy: LINE_BREAK_POLICY,
    }
    const fingerprint = sha256(JSON.stringify(identity))
    const existing = segmentByText.get(variant.renderedText)
    if (existing == null) {
      segmentByText.set(variant.renderedText, {
        segmentRequestId: `report-segment:${fingerprint.slice(0, 32)}`,
        segmentCacheFingerprint: fingerprint,
        locale: "th",
        text: variant.renderedText,
        measurementVariantIds: [variant.measurementVariantId],
      })
    } else {
      existing.measurementVariantIds.push(variant.measurementVariantId)
    }
  })

  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-line-breaking-plan" as const,
    lineBreakingId: FLOWDOC_CANONICAL_REPORT_LINE_BREAKING_ID,
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceTypographyCalibrationFingerprint: sha256(JSON.stringify(input.typographyCalibration)),
    measurementProfileId: input.nativeShaping.measurementProfileId,
    segmenter: {
      source: RAW_SEGMENTER_SOURCE as typeof RAW_SEGMENTER_SOURCE,
      revision: SEGMENTER_REVISION as typeof SEGMENTER_REVISION,
      dataRevision: SEGMENTER_DATA_REVISION as typeof SEGMENTER_DATA_REVISION,
      lineBreakPolicy: LINE_BREAK_POLICY as typeof LINE_BREAK_POLICY,
    },
    lineHeightBindings: lineHeightBindings(input),
    segmentRequests: [...segmentByText.values()],
  }
  return { ...unsigned, planFingerprint: sha256(JSON.stringify(unsigned)) }
}

function validateSources(input: FlowDocCanonicalReportLineBreakingSourceInputV1): string[] {
  const errors: string[] = []
  const native = input.nativeShaping
  if (native.phaseId !== "PDF-PILOT-08B-R2C-D") errors.push("R2C-D native shaping phase identity drifted")
  if (native.bundleFingerprint !== ACCEPTED_NATIVE_SHAPING_FINGERPRINT) errors.push("R2C-D native shaping fingerprint drifted")
  if (native.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(native, "bundleFingerprint")))) errors.push("R2C-D native shaping fingerprint does not match content")
  if (native.execution.nativeRustybuzzShaping !== "executed" || native.execution.glyphEvidence !== "mapped") errors.push("R2C-D native glyph evidence is not accepted")
  if (native.summary.missingGlyphCount !== 0) errors.push("R2C-D native glyph evidence contains missing glyphs")
  if (input.typographyCalibration.manifestId !== ACCEPTED_TYPOGRAPHY_MANIFEST_ID) errors.push("typography calibration identity drifted")
  try {
    const bindings = lineHeightBindings(input)
    if (bindings.length !== 6) errors.push("all six report styles require line-height bindings")
    if (bindings.some((binding) => !(binding.lineHeightPt > binding.fontSizePt))) errors.push("line heights must exceed report font sizes")
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "line-height binding failed")
  }
  return errors
}

export function createFlowDocCanonicalReportLineBreakingPlanV1(
  input: FlowDocCanonicalReportLineBreakingSourceInputV1,
): FlowDocCanonicalReportLineBreakingPlanV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return createPlan(input)
}

export function createFlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1(
  plan: FlowDocCanonicalReportLineBreakingPlanV1,
  executions: readonly FlowDocCanonicalReportNativeLineSegmentExecutionV1[],
): FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1 {
  requireFact(executions.length === plan.segmentRequests.length, "raw segmentation execution count must match the plan")
  executions.forEach((execution, index) => {
    const request = plan.segmentRequests[index]
    const raw = execution.rawOutput
    requireFact(execution.segmentRequestId === request.segmentRequestId, `raw segmentation order drifted at ${index}`)
    requireFact(raw.source === RAW_SEGMENTER_SOURCE, `raw segmenter source drifted: ${execution.segmentRequestId}`)
    requireFact(raw.segmenterRevision === SEGMENTER_REVISION, `raw segmenter revision drifted: ${execution.segmentRequestId}`)
    requireFact(raw.dataRevision === SEGMENTER_DATA_REVISION, `raw segmenter data revision drifted: ${execution.segmentRequestId}`)
    requireFact(raw.text === request.text, `raw segmenter text drifted: ${execution.segmentRequestId}`)
    requireFact(raw.textByteLength === Buffer.byteLength(request.text, "utf8"), `raw segmenter byte length drifted: ${execution.segmentRequestId}`)
    requireFact(raw.breakByteOffsets[0] === 0, `raw segmenter must retain ICU4X boundary zero: ${execution.segmentRequestId}`)
    requireFact(raw.breakByteOffsets.at(-1) === raw.textByteLength, `raw segmenter must end at text byte length: ${execution.segmentRequestId}`)
    requireFact(raw.breakByteOffsets.every((offset, offsetIndex, offsets) => (
      Number.isInteger(offset) && offset >= 0 && (offsetIndex === 0 || offset > offsets[offsetIndex - 1])
    )), `raw segmenter offsets must be ascending integers: ${execution.segmentRequestId}`)
  })
  const unsigned = {
    contractVersion: 1 as const,
    kind: "canonical-report-native-line-segment-evidence" as const,
    phaseId: "PDF-PILOT-08B-R2C-E" as const,
    sourceNativeShapingFingerprint: plan.sourceNativeShapingFingerprint,
    sourcePlanFingerprint: plan.planFingerprint,
    segmenter: {
      source: RAW_SEGMENTER_SOURCE as typeof RAW_SEGMENTER_SOURCE,
      revision: SEGMENTER_REVISION as typeof SEGMENTER_REVISION,
      dataRevision: SEGMENTER_DATA_REVISION as typeof SEGMENTER_DATA_REVISION,
      runtime: "node-native" as const,
      rawOffsetUnit: "utf8-byte" as const,
    },
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

function mapBreakOpportunities(
  request: FlowDocCanonicalReportLineSegmentRequestV1,
  raw: FlowDocIcu4xNativeLineSegmentOutputV1,
): { breaks: VNextThaiLineBreakOpportunity[]; tailoredBreakOpportunityCount: number } {
  const byteToUtf16 = utf8ByteToUtf16Map(request.text)
  const breaksByOffset = new Map(raw.breakByteOffsets.slice(1).map((byteOffset) => {
    const offset = byteToUtf16.get(byteOffset)
    requireFact(offset != null, `ICU4X break is not a UTF-8 scalar boundary: ${request.segmentRequestId}:${byteOffset}`)
    return [offset, { offset, kind: classifyBreak(request.text, offset) }] as const
  }))
  let tailoredBreakOpportunityCount = 0

  if (/^[A-Za-z][A-Za-z0-9_]*(?:[._/-][A-Za-z0-9_]+)+$/u.test(request.text)) {
    let offset = 0
    for (const scalar of request.text) {
      offset += scalar.length
      if (offset < request.text.length && /[._/-]/u.test(scalar) && !breaksByOffset.has(offset)) {
        breaksByOffset.set(offset, { offset, kind: "punctuation" })
        tailoredBreakOpportunityCount += 1
      }
    }
  }

  return {
    breaks: [...breaksByOffset.values()].sort((left, right) => left.offset - right.offset),
    tailoredBreakOpportunityCount,
  }
}

function compositeGlyphs(
  variant: FlowDocCanonicalReportNativeMeasurementVariantV1,
  native: FlowDocCanonicalReportNativeShapingBundleV1,
): VNextTextEngineAdapterGlyphFact[] {
  const executionById = new Map(native.shapeExecutions.map((execution) => [execution.shapeRequest.shapeRequestId, execution]))
  const glyphs: VNextTextEngineAdapterGlyphFact[] = []
  variant.shapeRuns.forEach((run) => {
    if (run.shapeRequestId == null) {
      requireFact(run.renderStartOffset === run.renderEndOffset, `empty shape run has text: ${variant.measurementVariantId}`)
      return
    }
    const execution = executionById.get(run.shapeRequestId)
    requireFact(execution != null, `shape execution is missing: ${run.shapeRequestId}`)
    requireFact(
      execution.shapeRequest.text === variant.renderedText.slice(run.renderStartOffset, run.renderEndOffset),
      `shape execution text differs from measurement run: ${run.shapeRequestId}`,
    )
    execution.evidence.glyphs.forEach((glyph) => {
      glyphs.push({
        ...clone(glyph),
        glyphIndex: glyphs.length,
        clusterStartOffset: run.renderStartOffset + glyph.clusterStartOffset,
        clusterEndOffset: run.renderStartOffset + glyph.clusterEndOffset,
      })
    })
  })
  return glyphs
}

function adapterRequest(variant: FlowDocCanonicalReportNativeMeasurementVariantV1): VNextTextEngineAdapterRequest {
  return {
    requestId: variant.measurementVariantId,
    smokeCaseId: "canonical-report-r2c-e-line-breaking",
    sampleId: variant.measurementVariantId,
    measurementProfileId: variant.measurementProfileId,
    text: variant.renderedText,
    locale: "th",
    fontId: "report-resolved-run-fonts",
    styleKey: variant.styleKey,
    availableWidthPt: variant.availableWidthPt,
    outputShapeVersion: "glyph-line-box-v1",
    requestedFacts: ["glyph-id", "glyph-advance", "glyph-offset", "cluster-map", "text-range", "line-box"],
  }
}

function emptyMeasurement(
  variant: FlowDocCanonicalReportNativeMeasurementVariantV1,
  lineHeightPt: number,
): FlowDocCanonicalReportLineMeasurementV1 {
  requireFact(variant.shapeRuns.every((run) => run.shapeRequestId == null), `empty measurement retained shape work: ${variant.measurementVariantId}`)
  return {
    measurementVariantId: variant.measurementVariantId,
    measurementCacheFingerprint: variant.measurementCacheFingerprint,
    measurementProfileId: variant.measurementProfileId,
    styleKey: variant.styleKey,
    availableWidthPt: variant.availableWidthPt,
    renderedText: variant.renderedText,
    lineHeightPt,
    segmentRequestId: null,
    shapeRuns: clone(variant.shapeRuns),
    breakOpportunities: [],
    lineBoxes: [{
      lineIndex: 0,
      startOffset: 0,
      endOffset: 0,
      widthPt: 0,
      heightPt: lineHeightPt,
      yOffsetPt: 0,
      glyphStartIndex: 0,
      glyphEndIndex: 0,
    }],
    lineSummaries: [],
    summary: {
      glyphCount: 0,
      coveredGlyphCount: 0,
      breakOpportunityCount: 0,
      tailoredBreakOpportunityCount: 0,
      lineCount: 1,
      overflowLineCount: 0,
      totalAdvancePt: 0,
      emptyTextPolicyApplied: true,
    },
  }
}

function buildMeasurement(
  variant: FlowDocCanonicalReportNativeMeasurementVariantV1,
  lineHeightPt: number,
  segmentRequest: FlowDocCanonicalReportLineSegmentRequestV1 | undefined,
  raw: FlowDocIcu4xNativeLineSegmentOutputV1 | undefined,
  native: FlowDocCanonicalReportNativeShapingBundleV1,
): FlowDocCanonicalReportLineMeasurementV1 {
  if (variant.renderedText.length === 0) return emptyMeasurement(variant, lineHeightPt)
  requireFact(segmentRequest != null && raw != null, `segmentation evidence is missing: ${variant.measurementVariantId}`)
  const glyphs = compositeGlyphs(variant, native)
  requireFact(glyphs.length > 0, `non-empty measurement has no glyphs: ${variant.measurementVariantId}`)
  const request = adapterRequest(variant)
  const mappedBreaks = mapBreakOpportunities(segmentRequest, raw)
  const breakOpportunities = mappedBreaks.breaks
  const totalAdvancePt = roundPt(glyphs.reduce((total, glyph) => total + glyph.advancePt, 0))
  const glyphEvidence: VNextTextEngineAdapterEvidence = {
    requestId: request.requestId,
    measurementProfileId: request.measurementProfileId,
    outputShapeVersion: request.outputShapeVersion,
    engine: {
      shaper: "rustybuzz",
      shaperRevision: "rustybuzz-0.20.1",
      segmenter: "icu4x",
      segmenterRevision: SEGMENTER_REVISION,
      segmenterDataRevision: SEGMENTER_DATA_REVISION,
      deterministic: true,
    },
    glyphs,
    lineBoxes: [],
    totalAdvancePt,
    lineHeightPt,
  }
  const wrapped = createFlowDocTextEngineLineWrapEvidencePlan({
    request,
    glyphEvidence,
    breakEvidence: {
      evidenceId: `report-breaks:${segmentRequest.segmentCacheFingerprint.slice(0, 32)}`,
      sampleId: request.sampleId,
      locale: "th",
      candidate: {
        candidateId: "icu4x-native-2.2.0",
        engine: "icu4x",
        role: "primary-deterministic",
        runtimeDependent: false,
        engineRevision: SEGMENTER_REVISION,
        dataRevision: SEGMENTER_DATA_REVISION,
        lineBreakPolicy: LINE_BREAK_POLICY,
      },
      breaks: breakOpportunities,
    },
    availableWidthPt: variant.availableWidthPt,
  })
  requireFact(
    wrapped.status === "ready" && wrapped.evidence != null,
    `line wrapping blocked for ${variant.measurementVariantId}: ${wrapped.blockingIssues.map((item) => item.code).join(", ")}`,
  )
  return {
    measurementVariantId: variant.measurementVariantId,
    measurementCacheFingerprint: variant.measurementCacheFingerprint,
    measurementProfileId: variant.measurementProfileId,
    styleKey: variant.styleKey,
    availableWidthPt: variant.availableWidthPt,
    renderedText: variant.renderedText,
    lineHeightPt,
    segmentRequestId: segmentRequest.segmentRequestId,
    shapeRuns: clone(variant.shapeRuns),
    breakOpportunities: breakOpportunities.map(clone),
    lineBoxes: wrapped.evidence.lineBoxes.map(clone),
    lineSummaries: wrapped.lineSummaries.map(clone),
    summary: {
      glyphCount: glyphs.length,
      coveredGlyphCount: wrapped.coverage.coveredGlyphCount,
      breakOpportunityCount: breakOpportunities.length,
      tailoredBreakOpportunityCount: mappedBreaks.tailoredBreakOpportunityCount,
      lineCount: wrapped.coverage.lineCount,
      overflowLineCount: wrapped.coverage.overflowLineCount,
      totalAdvancePt,
      emptyTextPolicyApplied: false,
    },
  }
}

function validateRaw(
  plan: FlowDocCanonicalReportLineBreakingPlanV1,
  raw: FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
): string[] {
  const errors: string[] = []
  if (raw.contractVersion !== 1 || raw.kind !== "canonical-report-native-line-segment-evidence") errors.push("raw segmentation bundle shape is invalid")
  if (raw.phaseId !== "PDF-PILOT-08B-R2C-E") errors.push("raw segmentation phase identity drifted")
  if (raw.sourceNativeShapingFingerprint !== plan.sourceNativeShapingFingerprint) errors.push("raw segmentation native source fingerprint drifted")
  if (raw.sourcePlanFingerprint !== plan.planFingerprint) errors.push("raw segmentation plan fingerprint drifted")
  if (raw.rawEvidenceFingerprint !== sha256(JSON.stringify(withoutFingerprint(raw, "rawEvidenceFingerprint")))) errors.push("raw segmentation fingerprint does not match content")
  if (raw.executions.length !== plan.segmentRequests.length) errors.push("raw segmentation execution count drifted")
  raw.executions.forEach((execution, index) => {
    if (execution.segmentRequestId !== plan.segmentRequests[index]?.segmentRequestId) errors.push(`raw segmentation execution identity drifted at ${index}`)
  })
  return errors
}

function buildBundle(
  input: FlowDocCanonicalReportLineBreakingSourceInputV1,
  raw: FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
): FlowDocCanonicalReportLineBreakingBundleV1 {
  const plan = createPlan(input)
  const rawErrors = validateRaw(plan, raw)
  requireFact(rawErrors.length === 0, rawErrors.join("; "))
  const bindingByStyle = new Map(plan.lineHeightBindings.map((binding) => [binding.styleKey, binding]))
  const segmentByText = new Map(plan.segmentRequests.map((request) => [request.text, request]))
  const rawById = new Map(raw.executions.map((execution) => [execution.segmentRequestId, execution.rawOutput]))
  const measurements = input.nativeShaping.measurementVariants.map((variant) => {
    const binding = bindingByStyle.get(variant.styleKey)
    requireFact(binding != null, `line-height binding is missing: ${variant.styleKey}`)
    const segmentRequest = segmentByText.get(variant.renderedText)
    return buildMeasurement(
      variant,
      binding.lineHeightPt,
      segmentRequest,
      segmentRequest == null ? undefined : rawById.get(segmentRequest.segmentRequestId),
      input.nativeShaping,
    )
  })
  const totals = measurements.map((measurement) => measurement.summary)
  const unsigned: Omit<FlowDocCanonicalReportLineBreakingBundleV1, "bundleFingerprint"> = {
    contractVersion: 1,
    kind: "canonical-report-line-breaking-bundle",
    phaseId: "PDF-PILOT-08B-R2C-E",
    sourceNativeShapingFingerprint: input.nativeShaping.bundleFingerprint,
    sourceTypographyCalibrationFingerprint: plan.sourceTypographyCalibrationFingerprint,
    sourceRawSegmentationFingerprint: raw.rawEvidenceFingerprint,
    planFingerprint: plan.planFingerprint,
    measurementProfileId: plan.measurementProfileId,
    profileBinding: {
      status: "bound-native-line-breaking-only",
      sourceProfileSegmenterRevision: "icu4x-planned",
      sourceProfileSegmenterDataRevision: "icu4x-data-planned",
      nativeSegmenterRevision: SEGMENTER_REVISION,
      nativeSegmenterDataRevision: SEGMENTER_DATA_REVISION,
      pilotCompatibility: "concrete-pilot-binding-does-not-mutate-source-profile",
      lineBreakPolicy: LINE_BREAK_POLICY,
      outputShapeVersion: "glyph-line-box-v1",
      productionBinding: false,
    },
    lineHeightBindings: plan.lineHeightBindings,
    measurements,
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary: {
      sourceConsumerCount: input.nativeShaping.consumers.length,
      measurementVariantCount: measurements.length,
      emptyMeasurementVariantCount: totals.filter((summary) => summary.emptyTextPolicyApplied).length,
      nativeSegmentExecutionCount: plan.segmentRequests.length,
      deduplicatedSegmentExecutionCount: measurements.length - totals.filter((summary) => summary.emptyTextPolicyApplied).length - plan.segmentRequests.length,
      lineHeightBindingCount: plan.lineHeightBindings.length,
      measurementGlyphCount: totals.reduce((total, summary) => total + summary.glyphCount, 0),
      coveredGlyphCount: totals.reduce((total, summary) => total + summary.coveredGlyphCount, 0),
      breakOpportunityCount: totals.reduce((total, summary) => total + summary.breakOpportunityCount, 0),
      tailoredBreakOpportunityCount: totals.reduce((total, summary) => total + summary.tailoredBreakOpportunityCount, 0),
      lineCount: totals.reduce((total, summary) => total + summary.lineCount, 0),
      multiLineMeasurementCount: totals.filter((summary) => summary.lineCount > 1).length,
      overflowLineCount: totals.reduce((total, summary) => total + summary.overflowLineCount, 0),
      maxLineCount: Math.max(...totals.map((summary) => summary.lineCount)),
    },
  }
  requireFact(unsigned.summary.measurementGlyphCount === unsigned.summary.coveredGlyphCount, "line boxes must cover every measurement glyph exactly once")
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportLineBreakingBundleV1(
  input: FlowDocCanonicalReportLineBreakingSourceInputV1,
  raw: FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
): FlowDocCanonicalReportLineBreakingBundleV1 {
  const errors = validateSources(input)
  requireFact(errors.length === 0, errors.join("; "))
  return buildBundle(input, raw)
}

export function validateFlowDocCanonicalReportLineBreakingBundleV1(
  value: unknown,
  input: FlowDocCanonicalReportLineBreakingSourceInputV1,
  raw: FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
): FlowDocCanonicalReportLineBreakingValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportLineBreakingBundleV1
  const issues: FlowDocCanonicalReportLineBreakingIssueV1[] = []
  validateSources(input).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-line-breaking-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-E") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourceNativeShapingFingerprint !== input.nativeShaping.bundleFingerprint) issues.push(issue("source-native-fingerprint", "sourceNativeShapingFingerprint", "R2C-D source fingerprint differs"))
  if (bundle.sourceRawSegmentationFingerprint !== raw.rawEvidenceFingerprint) issues.push(issue("source-raw-fingerprint", "sourceRawSegmentationFingerprint", "raw segmentation fingerprint differs"))
  if (JSON.stringify(bundle.ownership) !== JSON.stringify(EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "line-breaking ownership boundary drifted"))
  if (JSON.stringify(bundle.execution) !== JSON.stringify(EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "line-breaking execution boundary drifted"))
  if (JSON.stringify(bundle.downstreamBlockers) !== JSON.stringify(EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "line-breaking downstream blockers drifted"))
  for (const forbidden of ["layout", "pages", "pagination", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `line-breaking bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportLineBreakingBundleV1
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
    issue("canonical-bundle-drift", "", "line-breaking bundle differs from deterministic source and raw evidence"),
  )
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
