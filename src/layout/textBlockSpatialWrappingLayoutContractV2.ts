import type { ImageFrameV4Target } from "../schema/documentV4ImageTarget.js"
import type {
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockFlowIntervalV1 } from "./textBlockFlowRegionProviderV1.js"
import type {
  VNextTextBlockSpatialIntervalPlacementV1,
  VNextTextBlockSpatialWrappingWorkV1,
} from "./textBlockSpatialWrappingLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE =
  "vnext-text-block-spatial-wrapping-layout-v2" as const
export const VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION = 2 as const

export interface VNextTextBlockSpatialTextFragmentV2
  extends VNextTextBlockPositionedFragmentV1 {
  kind: "text"
}

export interface VNextTextBlockSpatialInlineImageFragmentV2 {
  kind: "inline-image"
  fragmentId: string
  inlineId: string
  assetId: string
  renderStartOffset: number
  renderEndOffset: number
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  heightLayoutUnit: number
  verticalAlign: "baseline" | "middle" | "text-bottom"
  authoredFrame: ImageFrameV4Target
  alignmentPolicyFingerprint: string
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  fingerprint: string
}

export type VNextTextBlockSpatialFragmentV2 =
  | VNextTextBlockSpatialTextFragmentV2
  | VNextTextBlockSpatialInlineImageFragmentV2

export interface VNextTextBlockSpatialWrappedLineV2 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockFlowIntervalV1[]
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
  fragments: readonly VNextTextBlockSpatialFragmentV2[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  regionFingerprint: string
  fingerprint: string
}

export type VNextTextBlockSpatialWrappingIssueCodeV2 =
  | "invalid-input"
  | "production-binding-forbidden"
  | "layout-authority-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-flow-tree-projection"
  | "unsafe-layout-arithmetic"
  | "unbreakable-flow-item-overflow"
  | "no-vertical-progress"
  | "line-band-did-not-stabilize"

export interface VNextTextBlockSpatialWrappingIssueV2 {
  code: VNextTextBlockSpatialWrappingIssueCodeV2
  severity: "error"
  path: string
  message: string
  lineIndex?: number
}

export type VNextTextBlockSpatialWrappingLayoutResultV2 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      initialFlowFingerprint: string
      flowEvidenceFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      alignmentPolicyFingerprint: string
      lines: readonly VNextTextBlockSpatialWrappedLineV2[]
      summary: {
        lineCount: number
        textFragmentCount: number
        inlineImageFragmentCount: number
        intervalPlacementCount: number
        heightLayoutUnit: number
      }
      work: VNextTextBlockSpatialWrappingWorkV1
      contracts: {
        sharedSpatialPlacementKernel: true
        multiIntervalRectangularWrapping: true
        topBottomBarrierAdvancement: true
        overlayRemovesFlowSpace: false
        coreOwnsInlineImageGeometry: true
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
      source: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly VNextTextBlockSpatialWrappingIssueV2[]
    }

export type VNextTextBlockSpatialWrappingLayoutInspectionV2 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code:
        | "spatial-layout-provenance-mismatch"
        | "spatial-layout-not-deeply-frozen"
        | "spatial-layout-fingerprint-mismatch"
      message: string
    }
