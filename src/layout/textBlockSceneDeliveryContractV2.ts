import type {
  VNextTextBlockPersistentSceneChunkV2,
  VNextTextBlockPersistentScenePayloadObservationV2,
  VNextTextBlockPersistentSceneSummaryV2,
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

export const VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE =
  "vnext-text-block-scene-delivery-plan-v2" as const
export const VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION = 2 as const

export interface VNextTextBlockSceneDeliveryRangeV2 {
  readonly start: number
  readonly end: number
}

export type VNextTextBlockSceneDeliveryOperationV2 =
  | {
      readonly kind: "retain-range"
      readonly previousRange: VNextTextBlockSceneDeliveryRangeV2
      readonly nextRange: VNextTextBlockSceneDeliveryRangeV2
      readonly retainedSubtrees: readonly {
        readonly previousPath: readonly number[]
        readonly fingerprint: string
        readonly payloadObservationFingerprint: string
        readonly chunkCount: number
      }[]
    }
  | {
      readonly kind: "splice-range"
      readonly previousRange: VNextTextBlockSceneDeliveryRangeV2
      readonly nextRange: VNextTextBlockSceneDeliveryRangeV2
      readonly replacementChunks:
        readonly VNextTextBlockPersistentSceneChunkV2[]
    }

export type VNextTextBlockSceneDeliveryOperationDraftV2 = {
  readonly kind: VNextTextBlockSceneDeliveryOperationV2["kind"]
  readonly previousRange: VNextTextBlockSceneDeliveryRangeV2
  readonly nextRange: VNextTextBlockSceneDeliveryRangeV2
}

export interface VNextTextBlockSceneDeliveryPlanV2 {
  readonly source: typeof VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE
  readonly contractVersion:
    typeof VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION
  readonly status: "accepted"
  readonly previousSceneFingerprint: string
  readonly nextSceneFingerprint: string
  readonly previousPayloadObservationFingerprint: string
  readonly nextPayloadObservationFingerprint: string
  readonly previousTreePolicyFingerprint: string
  readonly nextTreePolicyFingerprint: string
  readonly previousChunkCount: number
  readonly nextChunkCount: number
  readonly operations: readonly VNextTextBlockSceneDeliveryOperationV2[]
  readonly summary: {
    readonly retainOperationCount: number
    readonly spliceOperationCount: number
    readonly retainedSubtreeCount: number
    readonly replacementChunkCount: number
  }
  readonly observations: {
    readonly estimatedCanonicalPayloadByteCount: number
    readonly payloadObservationFingerprint: string
  }
  readonly work: {
    readonly visitedOperationCount: number
    readonly visitedRetainCoverNodeCount: number
    readonly visitedReplacementChunkCount: number
    readonly completePreviousSceneTraversalCount: 0
    readonly completeNextSceneTraversalCount: 0
  }
  readonly fingerprint: string
}

export type VNextTextBlockSceneDeliveryPlanIssueCodeV2 =
  | "invalid-input"
  | "delivery-scene-authority-mismatch"
  | "delivery-plan-source-mismatch"
  | "delivery-plan-scene-binding-mismatch"
  | "delivery-plan-range-gap"
  | "delivery-plan-range-overlap"
  | "delivery-plan-range-nonexhaustive"
  | "delivery-plan-empty-operation"
  | "delivery-plan-retain-length-mismatch"
  | "delivery-plan-retain-payload-mismatch"
  | "delivery-plan-nonmaximal-operation"
  | "delivery-plan-retain-cover-mismatch"
  | "delivery-plan-replacement-mismatch"
  | "delivery-plan-summary-mismatch"
  | "delivery-plan-observations-mismatch"
  | "delivery-plan-work-mismatch"
  | "delivery-plan-fingerprint-mismatch"
  | "delivery-plan-unsafe-count"

export interface VNextTextBlockSceneDeliveryPlanIssueV2 {
  readonly code: VNextTextBlockSceneDeliveryPlanIssueCodeV2
  readonly message: string
}

export interface VNextTextBlockSceneDeliveryPlanBuildWorkV2 {
  readonly constructionSceneTreeVisitCount: number
  readonly verificationSceneTreeVisitCount: number
  readonly deliveryOperationCount: number
  readonly retainCoverNodeCount: number
}

export interface VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2 {
  readonly __sceneDeliveryRetainProofFailureAuthorityOpaque: never
}

export type VNextTextBlockSceneDeliveryPlanBuildResultV2 =
  | {
      readonly status: "prepared"
      readonly plan: VNextTextBlockSceneDeliveryPlanV2
      readonly work: VNextTextBlockSceneDeliveryPlanBuildWorkV2
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly plan: null
      readonly work: VNextTextBlockSceneDeliveryPlanBuildWorkV2
      readonly proofUnavailableAuthority:
        VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2 | null
      readonly issues: readonly VNextTextBlockSceneDeliveryPlanIssueV2[]
    }

export type VNextTextBlockSceneDeliveryPlanInspectionV2 =
  | {
      readonly status: "valid"
      readonly fingerprint: string
      readonly payloadObservationFingerprint: string
      readonly previousCoverageCount: number
      readonly nextCoverageCount: number
      readonly visitedOperationCount: number
      readonly visitedRetainCoverNodeCount: number
      readonly visitedReplacementChunkCount: number
      readonly visitedSceneTreeNodeCount: number
      readonly completePreviousSceneTraversalCount: 0
      readonly completeNextSceneTraversalCount: 0
    }
  | {
      readonly status: "invalid"
      readonly code: VNextTextBlockSceneDeliveryPlanIssueCodeV2
      readonly message: string
      readonly visitedSceneTreeNodeCount: number
    }

export interface VNextTextBlockCompleteSceneDeliveryV2 {
  readonly source: "vnext-text-block-complete-scene-delivery-v2"
  readonly contractVersion: 2
  readonly rootFingerprint: string
  readonly rootSemanticFingerprint: string
  readonly persistentSceneFingerprint: string
  readonly persistentScenePayloadObservationFingerprint: string
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly observations: VNextTextBlockPersistentScenePayloadObservationV2
  readonly work: {
    readonly completeDeliveryCount: 1
    readonly visitedSceneNodeCount: number
    readonly emittedChunkCount: number
  }
  readonly stagedEditorApply: false
  readonly mayPublishLayout: false
  readonly productionBinding: false
  readonly fingerprint: string
}

export type VNextTextBlockCompleteSceneDeliveryResultV2 =
  | {
      readonly status: "accepted"
      readonly delivery: VNextTextBlockCompleteSceneDeliveryV2
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly delivery: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockCompleteSceneDeliveryInspectionV2 =
  | {
      readonly status: "valid"
      readonly fingerprint: string
      readonly rootFingerprint: string
      readonly rootSemanticFingerprint: string
      readonly persistentSceneFingerprint: string
      readonly persistentScenePayloadObservationFingerprint: string
      readonly emittedChunkCount: number
      readonly estimatedCanonicalPayloadByteCount: number
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "complete-delivery-data-mismatch"
        | "complete-delivery-fingerprint-mismatch"
        | "complete-delivery-unsafe-count"
      readonly message: string
    }

export interface VNextTextBlockSceneDeliveryPlanCandidateInputV2 {
  readonly previousScene: VNextTextBlockPersistentSceneV2
  readonly nextScene: VNextTextBlockPersistentSceneV2
  readonly operations:
    readonly VNextTextBlockSceneDeliveryOperationDraftV2[]
}
