import type {
  VNextTextBlockAuthoredBoxGeometryResultV2,
  VNextTextBlockAuthoredBoxLineV2,
} from "./textBlockAuthoredBoxGeometryContractV2.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE =
  "vnext-text-block-unified-layout-scene-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedLayoutSceneChunkV1 {
  chunkIndex: number
  lineIndex: number
  line: VNextTextBlockAuthoredBoxLineV2
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSceneWorkV1 {
  visitedLineCount: number
  visitedFragmentCount: number
  emittedChunkCount: number
  estimatedPayloadByteCount: number
  completeSceneProjectionCount: 1
}

export interface VNextTextBlockUnifiedLayoutSceneV1 {
  source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  authoredBoxGeometryFingerprint: string
  chunks: readonly VNextTextBlockUnifiedLayoutSceneChunkV1[]
  chunkFingerprintChain: readonly string[]
  summary: {
    lineCount: number
    textFragmentCount: number
    inlineImageFragmentCount: number
    outerHeightLayoutUnit: number
  }
  work: VNextTextBlockUnifiedLayoutSceneWorkV1
  contracts: {
    rendererConsumptionOnly: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    structuredCloneSafe: true
    incrementalDeliveryClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSceneIssueV1 {
  code: "invalid-input" | "production-binding-forbidden"
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockUnifiedLayoutSceneResultV1 =
  | {
      status: "accepted"
      scene: VNextTextBlockUnifiedLayoutSceneV1
      issues: []
    }
  | {
      status: "blocked"
      scene: null
      issues: readonly VNextTextBlockUnifiedLayoutSceneIssueV1[]
    }

export type VNextTextBlockUnifiedLayoutSceneInputV1 = {
  authoredBoxGeometry: Extract<
    VNextTextBlockAuthoredBoxGeometryResultV2,
    { status: "accepted" }
  >
  bindProductionLayout?: boolean
}

export type VNextTextBlockUnifiedLayoutSceneInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code:
        | "unregistered-unified-layout-scene"
        | "unified-layout-scene-not-deeply-frozen"
        | "unified-layout-scene-fingerprint-mismatch"
      message: string
    }
