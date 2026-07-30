import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockLineDispositionCoverV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import type {
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import type {
  VNextTextBlockSceneDeliveryPlanV2,
} from "./textBlockSceneDeliveryContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_TRANSITION_V1_SOURCE =
  "vnext-text-block-unified-layout-transition-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_TRANSITION_V1_VERSION = 1 as const

export type VNextTextBlockUnifiedLayoutStageV1 =
  | "change-gate"
  | "evidence"
  | "source-flow"
  | "spatial-index"
  | "layout-reconvergence"
  | "geometry"
  | "scene"
  | "delivery-plan"
  | "atomic-acceptance"

export type VNextTextBlockUnifiedLayoutStageUnitV1 =
  | "source-items"
  | "flow-atoms"
  | "flow-tree-nodes"
  | "spatial-index-nodes"
  | "spatial-query-bands"
  | "recomputed-lines"
  | "proof-nodes"
  | "reprojected-lines"
  | "visited-fragments"
  | "copied-scene-nodes"
  | "replacement-chunks"
  | "delivery-operations"
  | "retain-cover-nodes"
  | "estimated-canonical-payload-bytes"

export type VNextTextBlockUnifiedLayoutStageStatusV1 =
  | "accepted"
  | "needs-complete-fallback"
  | "blocked"

export type VNextTextBlockUnifiedLayoutEligibilityV1 =
  | "required"
  | "permitted"
  | "complete-only"

export type VNextTextBlockUnifiedLayoutFallbackModeV1 =
  | "planned-complete"
  | "incremental-proof-failed"
  | "deterministic-work-limit-exceeded"

export type {
  VNextTextBlockLineDispositionCoverV1,
  VNextTextBlockLineDispositionSegmentV1,
  VNextTextBlockLineDispositionV1,
} from "./textBlockPersistentLayoutLineContractV1.js"

export interface VNextTextBlockLayoutSeedRegionV1 {
  readonly previousSourceRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
  readonly nextSourceRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
  readonly previousSpatialBand: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly nextSpatialBand: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly mandatorySpatialUnion: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutIssueCodeV1 =
  | "invalid-change-data"
  | "change-not-deeply-frozen"
  | "unsupported-change-source"
  | "unsupported-change-version"
  | "unsupported-change-kind"
  | "unknown-change-field"
  | "missing-change-field"
  | "caller-authority-forbidden"
  | "blank-change-identity"
  | "invalid-change-range"
  | "invalid-change-value"
  | "unsupported-change-value"
  | "invalid-work-policy"
  | "inactive-work-policy-stage"
  | "prelock-work-policy-stage"
  | "stale-previous-root"
  | "previous-root-authority-mismatch"
  | "change-target-mismatch"
  | "evidence-required"
  | "evidence-not-required"
  | "evidence-authority-mismatch"
  | "evidence-coverage-mismatch"
  | "incremental-proof-unavailable"
  | "deterministic-work-limit-exceeded"
  | "fallback-request-authority-mismatch"
  | "fallback-target-binding-failed"
  | "atomic-acceptance-failed"

export interface VNextTextBlockUnifiedLayoutIssueV1 {
  readonly code: VNextTextBlockUnifiedLayoutIssueCodeV1
  readonly severity: "error"
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly path: string
  readonly message: string
}

export interface VNextTextBlockStageWorkCountV1 {
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
  readonly count: number
}

export interface VNextTextBlockIncrementalCandidateWorkV1 {
  readonly source: "vnext-text-block-incremental-candidate-work-v1"
  readonly contractVersion: 1
  readonly changeGateVisitedFieldCount: number
  readonly evidence: {
    readonly requestCount: number
    readonly requestedAtomCount: number
    readonly requestedClusterCount: number
    readonly consumedAtomCount: number
    readonly consumedClusterCount: number
    readonly unusedCoverageRenderedUtf16Length: number
    readonly visitedEvidenceNodeCount: number
  }
  readonly flow: {
    readonly visitedSourceItemCount: number
    readonly visitedFlowAtomCount: number
    readonly visitedFlowTreeNodeCount: number
    readonly reusedFlowTreeNodeCount: number
    readonly createdFlowTreeNodeCount: number
    readonly createdCanonicalPayloadByteCount: number
    readonly completeTreeRebuildCount: 0
    readonly completeSemanticPassCount: 0
    readonly completeSuffixTraversalCount: 0
  }
  readonly spatial: {
    readonly visitedSpatialIndexNodeCount: number
    readonly createdSpatialIndexNodeCount: number
    readonly spatialQueryBandCount: number
    readonly completeIndexRebuildCount: 0
    readonly completeIndexTraversalCount: 0
  }
  readonly layout: {
    readonly recomputedLineCount: number
    readonly proofNodeCount: number
    readonly completeSuffixTraversalCount: 0
  }
  readonly geometry: {
    readonly reprojectedLineCount: number
    readonly visitedFragmentCount: number
  }
  readonly scene: {
    readonly copiedSceneNodeCount: number
    readonly replacementChunkCount: number
  }
  readonly deliveryPlan: {
    readonly deliveryOperationCount: number
    readonly retainCoverNodeCount: number
    readonly estimatedCanonicalPayloadByteCount: number
  }
  readonly atomicAcceptance: {
    readonly attemptedRegistrationCount: number
    readonly committedRegistrationCount: number
  }
  readonly stageWork: readonly VNextTextBlockStageWorkCountV1[]
  readonly rootWrapperAllocationCount: number
  readonly completeNextInputTraversalCount: 0
  readonly completeNextInputComparisonCount: 0
  readonly completeSceneTraversalCount: 0
}

export interface VNextTextBlockCompleteFallbackWorkV1 {
  readonly source: "vnext-text-block-complete-fallback-work-v1"
  readonly contractVersion: 1
  readonly stageWork: readonly VNextTextBlockStageWorkCountV1[]
  readonly completeRootV2BuildCount: number
  readonly completeSceneV2BuildCount: number
  readonly completeDeliveryCount: number
}

export interface VNextTextBlockCompleteOracleWorkV1 {
  readonly source: "vnext-text-block-complete-oracle-work-v1"
  readonly contractVersion: 1
  readonly stageWork: readonly VNextTextBlockStageWorkCountV1[]
  readonly completeOracleRootBuildCount: number
  readonly completeOracleSceneBuildCount: number
  readonly normalizedComparisonCount: number
}

export interface VNextTextBlockExpectedTargetBindingV1 {
  readonly semanticFingerprint: string
  readonly renderedContentFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly layoutDependencyFingerprint: string
  readonly authoredBoxPlanFingerprint: string
  readonly spatialEntrySetFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockValidatedChangeV1 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: VNextTextBlockUnifiedLayoutEligibilityV1
  readonly producerEvidence: "required" | "not-required"
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly fingerprint: string
}

export interface VNextTextBlockValidatedChangeShapeV1 {
  readonly status: "accepted"
  readonly stage: "change-gate"
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: Exclude<VNextTextBlockUnifiedLayoutEligibilityV1, "complete-only">
  readonly fingerprint: string
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export interface VNextTextBlockUnifiedLayoutBlockedStageV1 {
  readonly status: "blocked"
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly change: null
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
}

export type VNextTextBlockValidatedChangeResultV1 =
  | {
      readonly status: "accepted"
      readonly validatedChange: VNextTextBlockValidatedChangeV1
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | VNextTextBlockUnifiedLayoutBlockedStageV1

export type VNextTextBlockUnifiedLayoutFallbackReasonV1 =
  | {
      readonly code: "allowlisted-whole-block-spatial-impact"
      readonly policyFact: "authored-box-width-or-inset"
    }
  | {
      readonly code: "bounded-reuse-proof-unavailable"
      readonly stage:
        | "source-flow"
        | "spatial-index"
        | "layout-reconvergence"
        | "geometry"
        | "scene"
        | "delivery-plan"
      readonly proof:
        | "source-binding"
        | "flow-path-copy"
        | "spatial-path-copy"
        | "exact"
        | "translated"
        | "retain-cover"
    }
  | {
      readonly code: "stage-unit-limit-exceeded"
      readonly stage: VNextTextBlockUnifiedLayoutStageV1
      readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
      readonly effectiveLimit: number
      readonly attemptedWork: number
    }

export interface VNextTextBlockUnifiedLayoutFallbackRequestV1 {
  readonly source: "vnext-text-block-unified-layout-fallback-request-v1"
  readonly contractVersion: 1
  readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
  readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
  readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
  readonly incrementalWorkAttempted: boolean
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly workPolicyFingerprint: string
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutFallbackRequestInspectionV1 =
  | {
      readonly status: "valid"
      readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
      readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
      readonly previousRootFingerprint: string
      readonly changeFingerprint: string
      readonly fingerprint: string
    }
  | {
      readonly status: "invalid"
      readonly code: "fallback-request-authority-mismatch"
      readonly message: string
    }

export type VNextTextBlockUnifiedLayoutFallbackRequestResultV1 =
  | {
      readonly status: "fallback-required"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly fallbackRequest:
        VNextTextBlockUnifiedLayoutFallbackRequestV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | VNextTextBlockUnifiedLayoutBlockedStageV1

export type VNextTextBlockUnifiedLayoutCompleteFallbackResultV1 =
  | {
      readonly status: "accepted-complete-fallback"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly completeFallbackWork: VNextTextBlockCompleteFallbackWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly completeFallbackWork: VNextTextBlockCompleteFallbackWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }

export type VNextTextBlockUnifiedLayoutTransitionResultV1 =
  | {
      readonly status: "accepted-no-op"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly dispositions: VNextTextBlockLineDispositionCoverV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "accepted-incremental"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: VNextTextBlockSceneDeliveryPlanV2
      readonly dispositions: VNextTextBlockLineDispositionCoverV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "fallback-required"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly fallbackRequest:
        VNextTextBlockUnifiedLayoutFallbackRequestV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly fallbackRequest: null
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }

export type VNextTextBlockUnifiedLayoutTransitionResultInspectionV1 =
  | {
      readonly status: "valid"
      readonly resultStatus:
        | "accepted-no-op"
        | "accepted-incremental"
        | "fallback-required"
        | "blocked"
      readonly rootFingerprint: string | null
      readonly sceneFingerprint: string | null
      readonly fallbackRequestFingerprint: string | null
    }
  | {
      readonly status: "invalid"
      readonly code: "atomic-acceptance-failed"
      readonly message: string
    }
