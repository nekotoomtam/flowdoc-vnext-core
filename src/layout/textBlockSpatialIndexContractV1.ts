import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"

export const VNEXT_TEXT_BLOCK_SPATIAL_INDEX_SOURCE =
  "vnext-text-block-spatial-index-v1" as const
export const VNEXT_TEXT_BLOCK_SPATIAL_INDEX_VERSION = 1 as const
export const VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY =
  "core-synthetic-qa-only" as const

export type VNextTextBlockSpatialWrapPolicyV1 =
  | "rectangular-exclusion"
  | "top-bottom-barrier"
  | "overlay"

export interface VNextTextBlockSpatialClearanceV1 {
  topLayoutUnit: number
  rightLayoutUnit: number
  bottomLayoutUnit: number
  leftLayoutUnit: number
}

export interface VNextTextBlockSyntheticPositionedObjectInputV1 {
  objectId: string
  geometryOwnerFingerprint: string
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  heightLayoutUnit: number
  clearance: VNextTextBlockSpatialClearanceV1
  wrapPolicy: VNextTextBlockSpatialWrapPolicyV1
}

export interface VNextTextBlockSpatialEnvelopeV1 {
  leftLayoutUnit: number
  topLayoutUnit: number
  rightLayoutUnit: number
  bottomLayoutUnit: number
}

export interface VNextTextBlockSpatialIndexEntryV1
  extends VNextTextBlockSyntheticPositionedObjectInputV1 {
  envelope: VNextTextBlockSpatialEnvelopeV1
  fingerprint: string
}

export interface VNextTextBlockSpatialIndexSummaryV1 {
  entryCount: number
  nodeCount: number
  maximumBottomLayoutUnit: number
  flowAffectingEntryCount: number
  barrierEntryCount: number
  overlayEntryCount: number
}

export interface VNextTextBlockSpatialIndexNodeV1 {
  entry: VNextTextBlockSpatialIndexEntryV1
  priorityFingerprint: string
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexSummaryV1
  fingerprint: string
}

export interface VNextTextBlockSpatialIndexV1 {
  source: typeof VNEXT_TEXT_BLOCK_SPATIAL_INDEX_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_SPATIAL_INDEX_VERSION
  inputAuthority: typeof VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutContextFingerprint: string
  persistentFlowTreeFingerprint: string
  contentLeftLayoutUnit: 0
  contentRightLayoutUnit: number
  root: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexSummaryV1
  contracts: {
    canonicalPositionedObjectSchema: false
    authoredPositionedObjectBinding: false
    processLocalImmutableIndex: true
    subtreeMaximumBottomQuery: true
    coreOwnedFingerprints: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockSpatialIndexIssueCodeV1 =
  | "production-binding-forbidden"
  | "input-authority-mismatch"
  | "flow-tree-provenance-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "invalid-spatial-entry"
  | "duplicate-object-id"
  | "unsupported-wrap-policy"
  | "spatial-boundary-violation"
  | "unsafe-spatial-arithmetic"
  | "spatial-index-provenance-mismatch"
  | "spatial-index-stale"
  | "spatial-object-not-found"
  | "spatial-owner-mismatch"
  | "no-spatial-change"
  | "invalid-query-band"

export interface VNextTextBlockSpatialIndexIssueV1 {
  code: VNextTextBlockSpatialIndexIssueCodeV1
  severity: "error"
  path: string
  message: string
  objectId?: string
}

export interface VNextTextBlockSpatialIndexBuildInputV1 {
  inputAuthority: typeof VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

export type VNextTextBlockSpatialIndexBuildResultV1 =
  | {
      status: "accepted"
      index: VNextTextBlockSpatialIndexV1
      mayPublishLayout: false
      productionBinding: false
      issues: []
    }
  | {
      status: "blocked"
      index: null
      mayPublishLayout: false
      productionBinding: false
      issues: VNextTextBlockSpatialIndexIssueV1[]
    }

export type VNextTextBlockSpatialIndexInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "spatial-index-provenance-mismatch" | "spatial-index-not-deeply-frozen"
      message: string
    }

export interface VNextTextBlockSpatialBandV1 {
  topLayoutUnit: number
  bottomLayoutUnit: number
}

export type VNextTextBlockSpatialIndexQueryResultV1 =
  | {
      status: "accepted"
      entries: readonly VNextTextBlockSpatialIndexEntryV1[]
      work: {
        visitedNodeCount: number
        matchedEntryCount: number
        completeIndexScanCount: 0
      }
      issues: []
    }
  | {
      status: "blocked"
      entries: null
      work: null
      issues: VNextTextBlockSpatialIndexIssueV1[]
    }
