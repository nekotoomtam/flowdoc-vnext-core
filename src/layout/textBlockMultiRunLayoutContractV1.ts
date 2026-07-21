import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE = "vnext-text-block-multi-run-layout-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION = 1 as const

export type VNextTextBlockMultiRunLayoutIssueCodeV1 =
  | "production-binding-forbidden"
  | "invalid-layout-id"
  | "layout-unit-policy-mismatch"
  | "invalid-measurement-request"
  | "empty-text-unsupported"
  | "inline-image-unsupported"
  | "available-width-mismatch"
  | "invalid-line-height"
  | "invalid-font-face"
  | "duplicate-font-face"
  | "invalid-paragraph-style"
  | "invalid-shaping-run"
  | "duplicate-shaping-run"
  | "invalid-cluster"
  | "shaping-coverage-mismatch"
  | "invalid-break-offsets"
  | "mandatory-break-crossed"
  | "invalid-line-range"
  | "line-coverage-mismatch"
  | "line-boundary-inside-cluster"
  | "unsafe-layout-arithmetic"
  | "line-width-overflow"

export interface VNextTextBlockMultiRunLayoutIssueV1 {
  code: VNextTextBlockMultiRunLayoutIssueCodeV1
  severity: "error"
  path: string
  message: string
  shapingRunId?: string
  lineIndex?: number
}

export interface VNextTextBlockMultiRunFontFaceV1 {
  fontFaceId: string
  fontFamily: string
  fontSha256: string
  weight: number
  style: "normal" | "italic"
  unitsPerEm: number
  ascentFontUnit: number
  descentFontUnit: number
  lineGapFontUnit: number
}

export interface VNextTextBlockMultiRunParagraphStyleV1 {
  styleKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
}

export interface VNextTextBlockShapingClusterV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  advanceLayoutUnit: number
}

export interface VNextTextBlockResolvedShapingRunV1 {
  shapingRunId: string
  renderStartOffset: number
  renderEndOffset: number
  text: string
  styleKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
  direction: "ltr"
  baselineShiftLayoutUnit: 0
  features: string[]
  clusters: VNextTextBlockShapingClusterV1[]
}

export interface VNextTextBlockMultiRunLineInputV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
}

export interface VNextTextBlockMultiRunSourceSegmentV1 {
  inlineId: string
  kind: VNextTextBlockV4MeasurementRun["kind"]
  fieldKey?: string
  generatedOwnerFingerprint?: string
  styleKey?: string
  localStyle?: VNextTextBlockV4MeasurementRun["localStyle"]
  renderStartOffset: number
  renderEndOffset: number
  sourceStartOffset: number
  sourceEndOffset: number
  renderedText: string
}

export interface VNextTextBlockAcceptedShapingRunV1 extends VNextTextBlockResolvedShapingRunV1 {
  fontFamily: string
  fontSha256: string
  fontWeight: number
  fontStyle: VNextTextBlockMultiRunFontFaceV1["style"]
  ascentLayoutUnit: number
  descentLayoutUnit: number
  lineGapLayoutUnit: number
  advanceLayoutUnit: number
  fingerprint: string
}

export interface VNextTextBlockPositionedFragmentV1 {
  fragmentId: string
  shapingRunId: string
  renderStartOffset: number
  renderEndOffset: number
  text: string
  xLayoutUnit: number
  advanceLayoutUnit: number
  baselineShiftLayoutUnit: 0
  styleKey: string
  fontFaceId: string
  fontFamily: string
  fontSha256: string
  fontWeight: number
  fontStyle: VNextTextBlockMultiRunFontFaceV1["style"]
  fontSizeLayoutUnit: number
  textColor: string
  ascentLayoutUnit: number
  descentLayoutUnit: number
  lineGapLayoutUnit: number
  sourceSegments: VNextTextBlockMultiRunSourceSegmentV1[]
  fingerprint: string
}

export interface VNextTextBlockPositionedLineV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  text: string
  yOffsetLayoutUnit: number
  widthLayoutUnit: number
  naturalAscentLayoutUnit: number
  naturalDescentLayoutUnit: number
  naturalHeightLayoutUnit: number
  leadingBeforeLayoutUnit: number
  leadingAfterLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  fragments: VNextTextBlockPositionedFragmentV1[]
  sourceSegments: VNextTextBlockMultiRunSourceSegmentV1[]
  fingerprint: string
}

export interface VNextTextBlockMultiRunLayoutRequestV1 {
  layoutId: string
  measurement: VNextTextBlockV4MeasurementRequest
  layoutUnitPolicyFingerprint: string
  availableWidthLayoutUnit: number
  declaredLineHeightLayoutUnit: number
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  shapingRuns: VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: number[]
  lines: VNextTextBlockMultiRunLineInputV1[]
  bindProductionLayout?: boolean
}

export interface VNextTextBlockMultiRunLayoutFactsV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION
  layoutId: string
  textBlockId: string
  instanceRevision: number
  measurementProfileId: string
  layoutUnitPolicyFingerprint: string
  contracts: {
    consumes: "vnext-text-block-v4-measurement"
    geometryUnit: "micro-point-integer"
    lineBreaks: "external-evidence-core-validated"
    fragmentPositioning: "core-derived-from-cluster-advances"
    rendererMayMeasureText: false
    rendererMayRelayout: false
    coreLoadsFontBytes: false
    coreExecutesShaping: false
    artifactBytes: false
    productionBinding: false
  }
}

export type VNextTextBlockMultiRunLayoutResultV1 =
  | (VNextTextBlockMultiRunLayoutFactsV1 & {
      status: "accepted"
      fontFaces: VNextTextBlockMultiRunFontFaceV1[]
      shapingRuns: VNextTextBlockAcceptedShapingRunV1[]
      lines: VNextTextBlockPositionedLineV1[]
      fingerprint: string
      issues: []
      summary: {
        shapingRunCount: number
        clusterCount: number
        lineCount: number
        fragmentCount: number
        sourceSegmentCount: number
        widthLayoutUnit: number
        heightLayoutUnit: number
      }
    })
  | (VNextTextBlockMultiRunLayoutFactsV1 & {
      status: "blocked"
      fontFaces: null
      shapingRuns: null
      lines: null
      fingerprint: null
      issues: VNextTextBlockMultiRunLayoutIssueV1[]
      summary: null
    })
