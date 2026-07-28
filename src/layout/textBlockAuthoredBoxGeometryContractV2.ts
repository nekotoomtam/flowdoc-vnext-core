import type { VNextTextBlockMultiRunSourceSegmentV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockAuthoredBoxGeometryIssueV1,
  VNextTextBlockAuthoredBoxInsetsLayoutUnitV1,
  VNextTextBlockAuthoredBoxIntervalPlacementV1,
  VNextTextBlockAuthoredBoxIntervalV1,
} from "./textBlockAuthoredBoxGeometryContractV1.js"
import type {
  VNextTextBlockSpatialInlineImageFragmentV2,
  VNextTextBlockSpatialTextFragmentV2,
} from "./textBlockSpatialWrappingLayoutContractV2.js"

export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE =
  "vnext-text-block-authored-box-geometry-v2" as const
export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION = 2 as const

export interface VNextTextBlockAuthoredBoxTextFragmentV2
  extends Omit<VNextTextBlockSpatialTextFragmentV2, "xLayoutUnit" | "fingerprint"> {
  contentXLayoutUnit: number
  xLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxInlineImageFragmentV2
  extends Omit<
    VNextTextBlockSpatialInlineImageFragmentV2,
    "xLayoutUnit" | "yLayoutUnit" | "fingerprint"
  > {
  contentXLayoutUnit: number
  contentYLayoutUnit: number
  xLayoutUnit: number
  yLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxFragmentV2 =
  | VNextTextBlockAuthoredBoxTextFragmentV2
  | VNextTextBlockAuthoredBoxInlineImageFragmentV2

export interface VNextTextBlockAuthoredBoxLineV2 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockAuthoredBoxIntervalV1[]
  intervalPlacements: readonly VNextTextBlockAuthoredBoxIntervalPlacementV1[]
  fragments: readonly VNextTextBlockAuthoredBoxFragmentV2[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxGeometryResultV2 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      initialFlowFingerprint: string
      flowEvidenceFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      contentSpatialLayoutFingerprint: string
      alignmentPolicyFingerprint: string
      authoredBoxPlanFingerprint: string
      parentRegionFingerprint: string
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
      lines: readonly VNextTextBlockAuthoredBoxLineV2[]
      summary: {
        lineCount: number
        textFragmentCount: number
        inlineImageFragmentCount: number
        outerHeightLayoutUnit: number
      }
      contracts: {
        sharedAuthoredBoxKernel: true
        autoHeightIncludesSpatialExtent: true
        fixedHeightPolicy: false
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
      source: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION
      geometry: null
      lines: null
      summary: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }

export type VNextTextBlockAuthoredBoxGeometryInspectionV2 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code:
        | "authored-box-geometry-provenance-mismatch"
        | "authored-box-geometry-not-deeply-frozen"
        | "authored-box-geometry-fingerprint-mismatch"
      message: string
    }
