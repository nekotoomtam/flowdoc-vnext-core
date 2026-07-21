import type {
  TextRunStyleV4Target,
  UnitValueV4Target,
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import type {
  FlowDocTextEngineMr1SegmentationFactsV1,
  FlowDocTextEngineMr1ShapeFactsV1,
} from "./runtimeMr1.js"

export const FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_SOURCE =
  "flowdoc-text-engine-multi-run-layout-v1" as const
export const FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_VERSION = 1 as const

export type FlowDocTextEngineMultiRunRuntimeKindV1 =
  | "node-native-mr1"
  | "browser-worker-wasm-mr1"
  | "test-mr1"

export interface FlowDocTextEngineMultiRunFontFaceV1 extends VNextTextBlockMultiRunFontFaceV1 {
  fontFamilyKey: string
  fontAssetPath: string
}

export interface FlowDocTextEngineMultiRunParagraphStyleV1 {
  styleKey: string
  runStyle: {
    fontFamilyKey: string
    fontSize: UnitValueV4Target
    textColor: string
    fontWeight: "normal" | "bold"
    fontStyle: "normal" | "italic"
    textDecoration: "none"
    strikethrough: false
  }
}

export interface FlowDocTextEngineMultiRunRuntimeV1 {
  runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1
  shape(input: {
    text: string
    fontFace: FlowDocTextEngineMultiRunFontFaceV1
  }): FlowDocTextEngineMr1ShapeFactsV1
  segment(text: string): FlowDocTextEngineMr1SegmentationFactsV1
}

export interface FlowDocTextEngineMultiRunLayoutInputV1 {
  layoutId: string
  measurement: VNextTextBlockV4MeasurementRequest
  declaredLineHeightLayoutUnit: number
  paragraphStyle: FlowDocTextEngineMultiRunParagraphStyleV1
  fontFaces: FlowDocTextEngineMultiRunFontFaceV1[]
  bindProductionLayout?: boolean
}

export type FlowDocTextEngineMultiRunLayoutIssueCodeV1 =
  | "production-binding-forbidden"
  | "invalid-layout-input"
  | "invalid-paragraph-style"
  | "invalid-font-face"
  | "duplicate-font-face"
  | "font-face-unavailable"
  | "inline-image-unsupported"
  | "direction-unsupported"
  | "decoration-unsupported"
  | "font-size-conversion-blocked"
  | "runtime-shape-blocked"
  | "runtime-segmentation-blocked"
  | "runtime-font-mismatch"
  | "runtime-font-metrics-mismatch"
  | "runtime-missing-glyph"
  | "invalid-runtime-cluster"
  | "unsafe-cluster-advance"
  | "break-opportunity-mismatch"
  | "core-layout-blocked"

export interface FlowDocTextEngineMultiRunLayoutIssueV1 {
  code: FlowDocTextEngineMultiRunLayoutIssueCodeV1
  severity: "error"
  path: string
  message: string
  inlineId?: string
  fontFaceId?: string
  shapingRunId?: string
}

interface FlowDocTextEngineMultiRunLayoutFactsV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_VERSION
  layoutId: string
  textBlockId: string
  instanceRevision: number
  measurementProfileId: string
  runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1
  productionBinding: false
}

export type FlowDocTextEngineMultiRunLayoutResultV1 =
  | (FlowDocTextEngineMultiRunLayoutFactsV1 & {
      status: "accepted"
      request: VNextTextBlockMultiRunLayoutRequestV1
      layout: Extract<VNextTextBlockMultiRunLayoutResultV1, { status: "accepted" }>
      issues: []
      fingerprint: string
      summary: {
        sourceRunCount: number
        effectiveRunCount: number
        shapingRunCount: number
        clusterCount: number
        lineCount: number
        fontFaceCount: number
        runtimeShapeCallCount: number
        runtimeSegmentationCallCount: 1
      }
    })
  | (FlowDocTextEngineMultiRunLayoutFactsV1 & {
      status: "blocked"
      request: null
      layout: null
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
      fingerprint: null
      summary: null
    })

export type FlowDocTextEngineMultiRunLocalStyleV1 = Pick<
  TextRunStyleV4Target,
  | "fontFamilyKey"
  | "fontSize"
  | "textColor"
  | "fontWeight"
  | "fontStyle"
  | "textDecoration"
  | "strikethrough"
>
