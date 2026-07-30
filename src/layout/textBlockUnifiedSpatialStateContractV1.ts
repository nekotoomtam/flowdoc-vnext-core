import type {
  VNextTextBlockSpatialIndexEntryV1,
  VNextTextBlockSpatialIndexIssueCodeV1,
  VNextTextBlockSpatialIndexNodeV1,
  VNextTextBlockSpatialIndexSummaryV1,
} from "./textBlockSpatialIndexContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_SOURCE =
  "vnext-text-block-unified-spatial-state-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedSpatialStateWorkV1 {
  readonly completeBuildCount: 1
  readonly visitedInputEntryCount: number
  readonly normalizedEntryCount: number
  readonly createdTreapNodeCount: number
  readonly reusedTreapNodeCount: 0
  readonly completeIndexRebuildCount: 1
  readonly completeSourceTraversalCount: 0
  readonly completeEvidenceTraversalCount: 0
  readonly completeFlowTreeTraversalCount: 0
}

export interface VNextTextBlockUnifiedSpatialStateV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_VERSION
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly instanceRevision: number
  readonly contentLeftLayoutUnit: 0
  readonly contentRightLayoutUnit: number
  readonly layoutUnitPolicyFingerprint: string
  readonly contentContextFingerprint: string
  readonly geometryOwnerFactsFingerprint: string
  readonly entrySetFingerprint: string
  readonly entryRootFingerprint: string
  readonly root: VNextTextBlockSpatialIndexNodeV1 | null
  readonly summary: VNextTextBlockSpatialIndexSummaryV1
  readonly work: VNextTextBlockUnifiedSpatialStateWorkV1
  readonly contracts: {
    readonly taskSpecificExclusionTreap: true
    readonly canonicalPositionedObjectSchema: false
    readonly authoredPositionedObjectBinding: false
    readonly sourceWrapperIndependent: true
    readonly flowWrapperIndependent: true
    readonly subtreeMaximumBottomQuery: true
    readonly preparedGraphCandidate: true
    readonly registeredAuthority: false
    readonly stagedEditorApply: false
    readonly mayPublishLayout: false
    readonly productionBinding: false
  }
  readonly mayPublishLayout: false
  readonly productionBinding: false
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedSpatialStateIssueCodeV1 =
  | "invalid-input"
  | "source-state-authority-mismatch"
  | "spatial-state-authority-mismatch"
  | "spatial-state-not-deeply-frozen"
  | "spatial-state-canonical-facts-mismatch"
  | VNextTextBlockSpatialIndexIssueCodeV1

export interface VNextTextBlockUnifiedSpatialStateIssueV1 {
  readonly code: VNextTextBlockUnifiedSpatialStateIssueCodeV1
  readonly severity: "error"
  readonly path: string
  readonly message: string
  readonly objectId?: string
}

export type VNextTextBlockUnifiedSpatialStateBuildResultV1 =
  | {
      readonly status: "prepared"
      readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
      readonly work: VNextTextBlockUnifiedSpatialStateWorkV1
      readonly registeredAuthority: false
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly spatialState: null
      readonly work: null
      readonly registeredAuthority: false
      readonly issues: readonly VNextTextBlockUnifiedSpatialStateIssueV1[]
    }

export type VNextTextBlockUnifiedSpatialStateInspectionV1 =
  | {
      readonly status: "valid-candidate"
      readonly fingerprint: string
      readonly entrySetFingerprint: string
      readonly entryRootFingerprint: string
      readonly registeredAuthority: false
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "spatial-state-authority-mismatch"
        | "spatial-state-not-deeply-frozen"
        | "spatial-state-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockUnifiedSpatialStateQueryResultV1 =
  | {
      readonly status: "accepted"
      readonly entries: readonly VNextTextBlockSpatialIndexEntryV1[]
      readonly work: {
        readonly visitedNodeCount: number
        readonly matchedEntryCount: number
        readonly completeIndexScanCount: 0
      }
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly entries: null
      readonly work: null
      readonly issues: readonly VNextTextBlockUnifiedSpatialStateIssueV1[]
    }
