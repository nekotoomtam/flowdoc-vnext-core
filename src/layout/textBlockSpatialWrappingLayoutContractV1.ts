import type { VNextTextBlockFlowIntervalV1 } from "./textBlockFlowRegionProviderV1.js"
import type {
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_SOURCE =
  "vnext-text-block-spatial-wrapping-layout-v1" as const
export const VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_VERSION = 1 as const

export interface VNextTextBlockSpatialIntervalPlacementV1 {
  intervalIndex: number
  renderStartOffset: number
  renderEndOffset: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
}

export interface VNextTextBlockSpatialWrappedLineV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockFlowIntervalV1[]
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
  fragments: readonly VNextTextBlockPositionedFragmentV1[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  regionFingerprint: string
  fingerprint: string
}

export type VNextTextBlockSpatialWrappingIssueCodeV1 =
  | "production-binding-forbidden"
  | "flow-tree-provenance-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-start-y"
  | "invalid-flow-tree-projection"
  | "unsafe-layout-arithmetic"
  | "unbreakable-flow-item-overflow"
  | "no-vertical-progress"
  | "line-band-did-not-stabilize"

export interface VNextTextBlockSpatialWrappingIssueV1 {
  code: VNextTextBlockSpatialWrappingIssueCodeV1
  severity: "error"
  path: string
  message: string
  lineIndex?: number
}

export interface VNextTextBlockSpatialWrappingWorkV1 {
  flowRegionFastPathCount: number
  spatialIndexQueryCount: number
  verticalAdvanceCount: number
  lineBandRequeryCount: number
}

export type VNextTextBlockSpatialWrappingLayoutResultV1 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_VERSION
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutContextFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      lines: readonly VNextTextBlockSpatialWrappedLineV1[]
      summary: {
        lineCount: number
        fragmentCount: number
        intervalPlacementCount: number
        heightLayoutUnit: number
      }
      work: VNextTextBlockSpatialWrappingWorkV1
      contracts: {
        multiIntervalRectangularWrapping: true
        topBottomBarrierAdvancement: true
        overlayRemovesFlowSpace: false
        rendererMayMeasureText: false
        rendererMayRelayout: false
        stagedEditorApply: false
        mayPublishLayout: false
        productionBinding: false
      }
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockSpatialWrappingIssueV1[]
    }

export type VNextTextBlockSpatialWrappingLayoutInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "spatial-layout-provenance-mismatch" | "spatial-layout-not-deeply-frozen"
      message: string
    }
