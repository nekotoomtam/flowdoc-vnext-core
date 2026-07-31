import type {
  VNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceContractV2.js"
import type {
  VNextTextBlockIncrementalFlowTreeV1,
} from "./textBlockIncrementalFlowTreeContractV1.js"
import type {
  VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockPersistentLayoutLineTreeV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import type {
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import type {
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type {
  VNextTextBlockUnifiedSpatialStateV1,
} from "./textBlockUnifiedSpatialStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE =
  "vnext-text-block-unified-layout-root-v2" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION = 2 as const

export interface VNextTextBlockAuthoredBoxSummaryV2 {
  readonly source: "vnext-text-block-authored-box-summary-v2"
  readonly contractVersion: 2
  readonly authoredBoxPlanFingerprint: string
  readonly contentLeftLayoutUnit: number
  readonly contentWidthLayoutUnit: number
  readonly outerWidthLayoutUnit: number
  readonly outerHeightLayoutUnit: number
  readonly lineCount: number
  readonly authoredGeometryFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedFlowRegionProviderAuthorityV2 {
  readonly source: "vnext-text-block-flow-region-provider-authority-v2"
  readonly contractVersion: 2
  readonly spatialStateFingerprint: string
  readonly layoutContextFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutRootBuildInputV2 {
  readonly inputAuthority: "core-synthetic-qa-only"
  readonly initialFlow: VNextTextBlockInitialFlowV1
  readonly evidence: VNextTextBlockFlowEvidenceV2
  readonly spatialEntries:
    readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  readonly bindProductionLayout?: boolean
}

export type VNextTextBlockUnifiedLayoutRootConstructionKindV2 =
  | "complete-bootstrap"
  | "incremental"
  | "complete-fallback"

export interface VNextTextBlockUnifiedLayoutRootV2 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE
  readonly contractVersion:
    typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION
  readonly inputAuthority: "core-synthetic-qa-only"
  readonly documentId: string
  readonly instanceRevision: number
  readonly sectionId: string
  readonly textBlockId: string
  readonly layoutId: string
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly flowRegionProviderAuthority:
    VNextTextBlockUnifiedFlowRegionProviderAuthorityV2
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly authoredBoxSummary: VNextTextBlockAuthoredBoxSummaryV2
  readonly persistentScene: VNextTextBlockPersistentSceneV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly semanticDependencyFingerprints: {
    readonly sourceState: string
    readonly flowTree: string
    readonly spatialState: string
    readonly flowRegionProviderAuthority: string
    readonly lineTree: string
    readonly authoredBoxSummary: string
    readonly persistentScene: string
  }
  readonly dependencyFingerprints: {
    readonly sourceState: string
    readonly flowTree: string
    readonly spatialState: string
    readonly flowRegionProviderAuthority: string
    readonly lineTree: string
    readonly authoredBoxSummary: string
    readonly persistentScene: string
    readonly workPolicy: string
  }
  readonly constructionKind:
    VNextTextBlockUnifiedLayoutRootConstructionKindV2
  readonly constructionFingerprint: string
  readonly semanticFingerprint: string
  readonly contracts: {
    readonly unifiedTextBlockAuthority: true
    readonly processLocalImmutableRoot: true
    readonly persistentIncrementalTransition: true
    readonly completeNextInputOnHotPath: false
    readonly stagedEditorApply: false
    readonly mayPublishLayout: false
    readonly productionBinding: false
  }
  readonly stagedEditorApply: false
  readonly mayPublishLayout: false
  readonly productionBinding: false
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutCompleteBuildWorkV2 {
  readonly completeRootV2BuildCount: number
  readonly completeSourceItemVisitCount: number
  readonly completeFlowAtomVisitCount: number
  readonly completeSpatialEntryVisitCount: number
  readonly completeLineVisitCount: number
  readonly completeFragmentVisitCount: number
  readonly completeSceneNodeVisitCount: number
  readonly completeSceneProjectionCount: number
  readonly completeChildGraphTraversalCount: number
  readonly completeChildRehashCount: number
}

export type VNextTextBlockUnifiedLayoutRootResultV2 =
  | {
      readonly status: "accepted"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly completeBuildWork:
        VNextTextBlockUnifiedLayoutCompleteBuildWorkV2
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly completeBuildWork:
        VNextTextBlockUnifiedLayoutCompleteBuildWorkV2
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2 =
  | {
      readonly status: "prepared"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly completeBuildWork:
        VNextTextBlockUnifiedLayoutCompleteBuildWorkV2
      readonly issues: readonly []
    }
  | Extract<
      VNextTextBlockUnifiedLayoutRootResultV2,
      { status: "blocked" }
    >

export type VNextTextBlockUnifiedLayoutRootInspectionV2 =
  | {
      readonly status: "valid"
      readonly fingerprint: string
      readonly semanticFingerprint: string
      readonly persistentSceneFingerprint: string
      readonly persistentScenePayloadObservationFingerprint: string
      readonly constructionKind:
        VNextTextBlockUnifiedLayoutRootConstructionKindV2
      readonly work: {
        readonly topLevelDependencyCount: 8
        readonly completeChildGraphTraversalCount: 0
        readonly completeChildRehashCount: 0
        readonly rootWrapperInspectionCount: 1
      }
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "root-authority-mismatch"
        | "root-shell-mismatch"
        | "root-dependency-mismatch"
        | "root-fingerprint-mismatch"
      readonly message: string
    }
