import type {
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockSpatialWrappingWorkV1,
} from "./textBlockSpatialWrappingLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE =
  "vnext-text-block-authored-box-geometry-v1" as const
export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION = 1 as const

export interface VNextTextBlockAuthoredBoxInsetsLayoutUnitV1 {
  top: number
  right: number
  bottom: number
  left: number
}

export interface VNextTextBlockAuthoredBoxIntervalV1 {
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
  startLayoutUnit: number
  endLayoutUnit: number
  contentLineFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxIntervalPlacementV1 {
  intervalIndex: number
  renderStartOffset: number
  renderEndOffset: number
  contentXStartLayoutUnit: number
  contentXEndLayoutUnit: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
  contentLineFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxFragmentV1
  extends Omit<VNextTextBlockPositionedFragmentV1, "xLayoutUnit" | "fingerprint"> {
  contentXLayoutUnit: number
  xLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxLineV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockAuthoredBoxIntervalV1[]
  intervalPlacements:
    readonly VNextTextBlockAuthoredBoxIntervalPlacementV1[]
  fragments: readonly VNextTextBlockAuthoredBoxFragmentV1[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxGeometryIssueCodeV1 =
  | "invalid-input"
  | "production-binding-forbidden"
  | "initial-flow-request-binding-mismatch"
  | "initial-flow-capability-required"
  | "invalid-authored-box-geometry"
  | "authored-box-width-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "spatial-index-binding-mismatch"
  | "spatial-layout-blocked"
  | "spatial-layout-provenance-mismatch"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockAuthoredBoxGeometryIssueV1 {
  code: VNextTextBlockAuthoredBoxGeometryIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockAuthoredBoxGeometryInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code:
        | "authored-box-geometry-provenance-mismatch"
        | "authored-box-geometry-not-deeply-frozen"
      message: string
    }

export type VNextTextBlockAuthoredBoxGeometryResultV1 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      layoutContextFingerprint: string
      initialFlowFingerprint: string
      parentRegionFingerprint: string
      authoredBoxOwnerNodeId: string
      authoredBoxStyleFingerprint: string
      authoredBoxPlanFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      contentSpatialLayoutFingerprint: string
      geometry: {
        outerWidthLayoutUnit: number
        contentInsetsLayoutUnit: VNextTextBlockAuthoredBoxInsetsLayoutUnitV1
        contentOriginXLayoutUnit: number
        contentOriginYLayoutUnit: number
        contentWidthLayoutUnit: number
        contentFlowHeightLayoutUnit: number
        spatialMaximumBottomLayoutUnit: number
        contentExtentBottomLayoutUnit: number
        outerHeightLayoutUnit: number
      }
      lines: readonly VNextTextBlockAuthoredBoxLineV1[]
      summary: {
        lineCount: number
        fragmentCount: number
        intervalPlacementCount: number
        outerHeightLayoutUnit: number
      }
      work: VNextTextBlockSpatialWrappingWorkV1
      contracts: {
        authoredBoxWidthApplied: true
        verticalInsetsApplied: true
        autoHeightIncludesSpatialExtent: true
        contentLocalSpatialWrapping: true
        boxLocalProjection: true
        canonicalPositionedObjectSchema: false
        authoredPositionedObjectBinding: false
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
      geometry: null
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }
