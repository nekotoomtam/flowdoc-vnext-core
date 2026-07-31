import type { ImageFrameV4Target } from "../schema/documentV4ImageTarget.js"
import type {
  VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1,
  VNextTextBlockPersistentLayoutContentLocalGeometryV1,
  VNextTextBlockPersistentLayoutLineInternalsV1,
  VNextTextBlockPersistentLayoutLineTreeV1,
  VNextTextBlockPersistentLayoutLocalSourceSpanV1,
  VNextTextBlockPersistentLayoutSourceMappingV1,
  VNextTextBlockPersistentLayoutSourceRangeV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"

export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE =
  "vnext-text-block-persistent-scene-v2" as const
export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION = 2 as const

export interface VNextTextBlockPersistentScenePolicyV2 {
  readonly policyVersion: 1
  readonly maximumBranchChildren: 8
  readonly splitOverflowLeftCount: 4
  readonly splitOverflowRightCount: 5
  readonly underflowBorrowOrder: readonly ["left", "right"]
  readonly underflowMergeOrder: readonly ["left", "right"]
  readonly collapseUnaryRoot: true
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentScenePayloadPolicyV2 {
  readonly payloadPolicyVersion: 1
  readonly canonicalEncoding: "utf8-canonical-json"
  readonly fieldAllowlistFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentScenePayloadObservationV2 {
  readonly estimatedCanonicalPayloadByteCount: number
  readonly payloadObservationFingerprint: string
}

export interface VNextTextBlockPersistentSceneTextPaintRunV2 {
  readonly sourceSpan: VNextTextBlockPersistentLayoutLocalSourceSpanV1
  readonly textColor: string
  readonly textDecoration: "none" | "underline"
  readonly strikethrough: boolean
  readonly authoredTextColor: string | null
  readonly paintFingerprint: string
}

export type VNextTextBlockPersistentSceneFragmentV2 =
  | {
      readonly kind: "text"
      readonly lineageId: string
      readonly sourceSpans:
        readonly VNextTextBlockPersistentLayoutLocalSourceSpanV1[]
      readonly paintRuns:
        readonly VNextTextBlockPersistentSceneTextPaintRunV2[]
      readonly paintFingerprint: string
      readonly fingerprint: string
    }
  | {
      readonly kind: "inline-image"
      readonly lineageId: string
      readonly sourceSpans:
        readonly VNextTextBlockPersistentLayoutLocalSourceSpanV1[]
      readonly assetId: string
      readonly authoredFrame: ImageFrameV4Target
      readonly paintFingerprint: string
      readonly fingerprint: string
    }

export interface VNextTextBlockPersistentSceneChunkV2 {
  readonly lineLineageId: string
  readonly sourceMapping:
    readonly VNextTextBlockPersistentLayoutSourceMappingV1[]
  readonly lineInternals: VNextTextBlockPersistentLayoutLineInternalsV1
  readonly contentLocalGeometry:
    VNextTextBlockPersistentLayoutContentLocalGeometryV1
  readonly authoredBoxGeometry:
    VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1
  readonly fragments: readonly VNextTextBlockPersistentSceneFragmentV2[]
  readonly lineInternalsFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly boundarySpatialContextFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentSceneSummaryV2 {
  readonly chunkCount: number
  readonly lineCount: number
  readonly textFragmentCount: number
  readonly inlineImageFragmentCount: number
  readonly leafCount: number
  readonly nodeCount: number
  readonly sourceRange: VNextTextBlockPersistentLayoutSourceRangeV1
  readonly authoredTopLayoutUnit: number | null
  readonly authoredBottomLayoutUnit: number | null
  readonly lineInternalsFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly boundarySpatialContextFingerprint: string
}

export interface VNextTextBlockPersistentSceneEmptyRootV2 {
  readonly nodeKind: "empty"
  readonly height: 0
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentSceneLeafV2 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly chunk: VNextTextBlockPersistentSceneChunkV2
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentSceneBranchV2 {
  readonly nodeKind: "branch"
  readonly height: number
  readonly children: readonly VNextTextBlockPersistentSceneNodeV2[]
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly fingerprint: string
}

export type VNextTextBlockPersistentSceneNodeV2 =
  | VNextTextBlockPersistentSceneLeafV2
  | VNextTextBlockPersistentSceneBranchV2

export type VNextTextBlockPersistentSceneRootV2 =
  | VNextTextBlockPersistentSceneEmptyRootV2
  | VNextTextBlockPersistentSceneNodeV2

export type VNextTextBlockPersistentSceneWorkV2 =
  | {
      readonly completeSceneProjectionCount: 1
      readonly visitedLineCount: number
      readonly visitedFragmentCount: number
      readonly visitedSourceItemCount: number
      readonly emittedChunkCount: number
      readonly createdLeafCount: number
      readonly createdNodeCount: number
      readonly reusedChunkCount: 0
      readonly reusedSceneNodeCount: 0
      readonly incrementalCopiedNodeCount: 0
      readonly completeLineTreeTraversalCount: 1
      readonly completeSceneTraversalCount: 0
    }
  | {
      readonly completeSceneProjectionCount: 0
      readonly visitedLineCount: number
      readonly visitedFragmentCount: number
      readonly visitedSourceItemCount: number
      readonly emittedChunkCount: number
      readonly createdLeafCount: number
      readonly createdNodeCount: number
      readonly reusedChunkCount: number
      readonly reusedSceneNodeCount: number
      readonly incrementalCopiedNodeCount: number
      readonly completeLineTreeTraversalCount: 0
      readonly completeSceneTraversalCount: 0
    }

export interface VNextTextBlockPersistentSceneV2 {
  readonly source: typeof VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE
  readonly contractVersion:
    typeof VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly instanceRevision: number
  readonly layoutId: string
  readonly lineTreeFingerprint: string
  readonly lineTreeSemanticFingerprint: string
  readonly sourceStateSourceFingerprint: string
  readonly sourceStateProvenanceFingerprint: string
  readonly sourceStatePaintFingerprint: string
  readonly policy: VNextTextBlockPersistentScenePolicyV2
  readonly payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2
  readonly root: VNextTextBlockPersistentSceneRootV2
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly work: VNextTextBlockPersistentSceneWorkV2
  readonly contracts: {
    readonly rendererConsumptionOnly: true
    readonly oneTextBlockOnly: true
    readonly oneRendererChunkPerLeaf: true
    readonly stableLocalSourceCoordinates: true
    readonly absoluteChunkOrdinalsExcluded: true
    readonly absoluteLineOrdinalsExcluded: true
    readonly absoluteRenderedOffsetsExcluded: true
    readonly structuredCloneSafe: true
    readonly genericSequence: false
    readonly documentGraph: false
    readonly scheduler: false
    readonly history: false
    readonly assetStore: false
    readonly randomAccessMutation: false
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

export type VNextTextBlockPersistentSceneIssueCodeV2 =
  | "invalid-input"
  | "line-tree-authority-mismatch"
  | "source-state-authority-mismatch"
  | "scene-dependency-binding-mismatch"
  | "scene-source-lineage-mismatch"
  | "scene-fragment-lineage-mismatch"
  | "scene-invalid-topology"
  | "scene-unsafe-summary"

export interface VNextTextBlockPersistentSceneIssueV2 {
  readonly code: VNextTextBlockPersistentSceneIssueCodeV2
  readonly message: string
  readonly chunkOrdinal?: number
}

export type VNextTextBlockPersistentSceneBuildResultV2 =
  | {
      readonly status: "prepared"
      readonly scene: VNextTextBlockPersistentSceneV2
      readonly work: VNextTextBlockPersistentSceneWorkV2
      readonly registeredAuthority: false
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly scene: null
      readonly work: null
      readonly registeredAuthority: false
      readonly issues: readonly VNextTextBlockPersistentSceneIssueV2[]
    }

export type VNextTextBlockPersistentSceneCandidateInspectionV2 =
  | {
      readonly status: "valid-candidate"
      readonly fingerprint: string
      readonly payloadObservationFingerprint: string
      readonly registeredAuthority: false
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "scene-candidate-authority-mismatch"
        | "scene-candidate-not-deeply-frozen"
        | "scene-candidate-dependency-mismatch"
        | "scene-candidate-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockPersistentSceneInspectionV2 =
  | {
      readonly status: "valid"
      readonly fingerprint: string
      readonly payloadObservationFingerprint: string
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "scene-authority-mismatch"
        | "scene-not-deeply-frozen"
        | "scene-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockPersistentSceneChunkLookupResultV2 =
  | {
      readonly status: "found"
      readonly chunkOrdinal: number
      readonly leaf: VNextTextBlockPersistentSceneLeafV2
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeSceneTraversalCount: 0
      }
    }
  | {
      readonly status: "not-found"
      readonly chunkOrdinal: null
      readonly leaf: null
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeSceneTraversalCount: 0
      }
    }
  | {
      readonly status: "blocked"
      readonly chunkOrdinal: null
      readonly leaf: null
      readonly work: null
      readonly issues: readonly VNextTextBlockPersistentSceneIssueV2[]
    }

export interface VNextTextBlockPersistentSceneSiblingReferenceV2 {
  readonly node: VNextTextBlockPersistentSceneRootV2
  readonly fingerprint: string
  readonly payloadObservationFingerprint: string
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
}

export interface VNextTextBlockPersistentSceneIncrementalFragmentInputV2 {
  readonly scene: VNextTextBlockPersistentSceneV2
  readonly copiedPathNodes: readonly VNextTextBlockPersistentSceneRootV2[]
  readonly replacementNodes: readonly VNextTextBlockPersistentSceneRootV2[]
  readonly siblingReferences:
    readonly VNextTextBlockPersistentSceneSiblingReferenceV2[]
  readonly completePreviousSceneTraversal: false
  readonly completeNextSceneTraversal: false
}

export type VNextTextBlockPersistentSceneIncrementalFragmentInspectionV2 =
  | {
      readonly status: "valid-fragment"
      readonly work: {
        readonly inspectedCopiedPathNodeCount: number
        readonly inspectedReplacementNodeCount: number
        readonly inspectedSiblingReferenceCount: number
        readonly completePreviousSceneTraversalCount: 0
        readonly completeNextSceneTraversalCount: 0
      }
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "scene-incremental-fragment-invalid"
        | "scene-complete-traversal-forbidden"
        | "scene-incremental-node-authority-mismatch"
        | "scene-incremental-sibling-reference-mismatch"
      readonly message: string
    }

export interface VNextTextBlockPersistentSceneCompleteBuildInputV2 {
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}
