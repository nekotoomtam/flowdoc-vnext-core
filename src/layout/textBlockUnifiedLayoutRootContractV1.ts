import type { VNextTextBlockAuthoredBoxGeometryResultV2 } from "./textBlockAuthoredBoxGeometryContractV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import type { VNextTextBlockSpatialIndexV2 } from "./textBlockSpatialIndexContractV2.js"
import type { VNextTextBlockSpatialWrappingLayoutResultV2 } from "./textBlockSpatialWrappingLayoutContractV2.js"
import type { VNextTextBlockUnifiedLayoutSceneV1 } from "./textBlockUnifiedLayoutSceneContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE =
  "vnext-text-block-unified-layout-root-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedFlowRegionProviderAuthorityV1 {
  source: "vnext-text-block-flow-region-v2"
  contractVersion: 2
  spatialIndexFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutRootWorkV1 {
  topLevelDependencyCount: 8
  completeChildGraphTraversalCount: 0
  completeChildRehashCount: 0
  rootWrapperAllocationCount: 1
}

export interface VNextTextBlockUnifiedLayoutRootV1 {
  source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  flowRegionProviderAuthority: VNextTextBlockUnifiedFlowRegionProviderAuthorityV1
  spatialLayout: Extract<VNextTextBlockSpatialWrappingLayoutResultV2, { status: "accepted" }>
  authoredBoxGeometry: Extract<VNextTextBlockAuthoredBoxGeometryResultV2, { status: "accepted" }>
  scene: VNextTextBlockUnifiedLayoutSceneV1
  dependencyFingerprints: {
    initialFlow: string
    evidence: string
    persistentFlowTree: string
    spatialIndex: string
    flowRegionProviderAuthority: string
    spatialLayout: string
    authoredBoxGeometry: string
    scene: string
  }
  work: VNextTextBlockUnifiedLayoutRootWorkV1
  contracts: {
    unifiedTextBlockAuthority: true
    textAndInlineImageV2: true
    processLocalImmutableRoot: true
    compositionalRootFingerprint: true
    incrementalTransitionClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}

export type VNextTextBlockUnifiedLayoutRootIssueCodeV1 =
  | "invalid-input"
  | "input-authority-mismatch"
  | "production-binding-forbidden"
  | "initial-flow-provenance-mismatch"
  | "flow-evidence-provenance-mismatch"
  | "persistent-flow-tree-blocked"
  | "spatial-index-blocked"
  | "spatial-layout-blocked"
  | "authored-box-geometry-blocked"
  | "unified-layout-scene-blocked"
  | "unified-layout-dependency-mismatch"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockUnifiedLayoutRootIssueV1 {
  code: VNextTextBlockUnifiedLayoutRootIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockUnifiedLayoutRootResultV1 =
  | { status: "accepted"; root: VNextTextBlockUnifiedLayoutRootV1; issues: [] }
  | {
      status: "blocked"
      root: null
      scene: null
      issues: readonly VNextTextBlockUnifiedLayoutRootIssueV1[]
    }

export type VNextTextBlockUnifiedLayoutRootInspectionV1 =
  | {
      status: "valid"
      fingerprint: string
      work: VNextTextBlockUnifiedLayoutRootWorkV1
    }
  | {
      status: "invalid"
      code: VNextTextBlockUnifiedLayoutRootIssueCodeV1
      message: string
    }
