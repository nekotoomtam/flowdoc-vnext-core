import type { VNextAuthoredBoxPlanV1 } from "../renderer/authoredBoxContractV1.js"
import type { ImageFrameV4Target } from "../schema/documentV4ImageTarget.js"
import type { TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type {
  VNextTextBlockInitialFlowFontFaceV1,
  VNextTextBlockInitialFlowResolvedGeometryStyleV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockMultiRunParagraphStyleV1,
} from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE =
  "vnext-text-block-unified-layout-source-state-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedLayoutSourceStatePolicyV1 {
  readonly policyVersion: 1
  readonly maximumLeafItems: 8
  readonly maximumBranchChildren: 8
  readonly splitOverflowLeftCount: 4
  readonly splitOverflowRightCount: 5
  readonly underflowBorrowOrder: readonly ["left", "right"]
  readonly underflowMergeOrder: readonly ["left", "right"]
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceStyleV1 {
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
  readonly fontFamilyKey: string
  readonly fontFaceId: string
  readonly fontSizeLayoutUnit: number
  readonly textColor: string
  readonly fontWeight: number
  readonly fontStyle: VNextTextBlockInitialFlowResolvedGeometryStyleV1["fontStyle"]
  readonly textDecoration: "none" | "underline"
  readonly strikethrough: boolean
  readonly authoredLocalStyle: TextRunStyleV4Target | null
}

interface VNextTextBlockUnifiedLayoutSourceItemBaseV1 {
  readonly lineageId: string
  readonly inlineId: string
  readonly renderedText: string
  readonly renderedUtf16Length: number
  readonly semanticFingerprint: string
  readonly contentFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly layoutDependencyFingerprint: string
  readonly boundaryFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutSourceItemV1 =
  | (VNextTextBlockUnifiedLayoutSourceItemBaseV1 & {
      readonly kind: "text"
      readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
    })
  | (VNextTextBlockUnifiedLayoutSourceItemBaseV1 & {
      readonly kind: "resolved-field"
      readonly fieldKey: string
      readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
    })
  | (VNextTextBlockUnifiedLayoutSourceItemBaseV1 & {
      readonly kind: "generated-page-number"
      readonly generatedOwnerFingerprint: string
      readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
    })
  | (VNextTextBlockUnifiedLayoutSourceItemBaseV1 & {
      readonly kind: "hard-break"
    })
  | (VNextTextBlockUnifiedLayoutSourceItemBaseV1 & {
      readonly kind: "inline-image"
      readonly assetId: string
      readonly authoredFrame: ImageFrameV4Target
      readonly verticalAlign: "baseline" | "middle" | "text-bottom"
    })

export interface VNextTextBlockUnifiedLayoutSourceSummaryV1 {
  readonly renderedUtf16Length: number
  readonly itemCount: number
  readonly leafCount: number
  readonly nodeCount: number
  readonly textBearingItemCount: number
  readonly hardBreakItemCount: number
  readonly inlineImageItemCount: number
  readonly semanticFingerprint: string
  readonly contentFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly layoutDependencyFingerprint: string
  readonly boundaryFingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceLeafV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly summary: VNextTextBlockUnifiedLayoutSourceSummaryV1
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceBranchV1 {
  readonly nodeKind: "branch"
  readonly height: number
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[]
  readonly summary: VNextTextBlockUnifiedLayoutSourceSummaryV1
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutSourceNodeV1 =
  | VNextTextBlockUnifiedLayoutSourceLeafV1
  | VNextTextBlockUnifiedLayoutSourceBranchV1

export interface VNextTextBlockUnifiedLayoutProducerRequirementsV1 {
  readonly layoutId: string
  readonly layoutUnitPolicyFingerprint: string
  readonly availableWidthLayoutUnit: number
  readonly declaredLineHeightLayoutUnit: number
  readonly paragraphFontFamilyKey: string
  readonly paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  readonly fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
}

export type VNextTextBlockUnifiedLayoutSourceStateWorkV1 =
  | {
      readonly constructionKind: "complete"
      readonly completeBuildCount: 1
      readonly visitedInitialFlowAtomCount: number
      readonly visitedSummaryNodeCount: 0
      readonly createdItemCount: number
      readonly createdLeafCount: number
      readonly createdNodeCount: number
      readonly reusedItemCount: 0
      readonly reusedNodeCount: 0
      readonly completeSuffixTraversalCount: 0
    }
  | {
      readonly constructionKind: "image-paint-path-copy"
      readonly completeBuildCount: 0
      readonly visitedInitialFlowAtomCount: 0
      readonly visitedSummaryNodeCount: number
      readonly createdItemCount: 1
      readonly createdLeafCount: 1
      readonly createdNodeCount: number
      readonly reusedItemCount: number
      readonly reusedNodeCount: number
      readonly completeSuffixTraversalCount: 0
    }
  | {
      readonly constructionKind: "text-style-path-copy"
      readonly completeBuildCount: 0
      readonly visitedInitialFlowAtomCount: 0
      readonly visitedSummaryNodeCount: number
      readonly createdItemCount: number
      readonly createdLeafCount: number
      readonly createdNodeCount: number
      readonly reusedItemCount: number
      readonly reusedNodeCount: number
      readonly completeSuffixTraversalCount: 0
    }

export interface VNextTextBlockUnifiedLayoutSourceStateV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly instanceRevision: number
  readonly initialFlowFingerprint: string
  readonly flowEvidenceFingerprint: string
  readonly authoredBoxPlan: VNextAuthoredBoxPlanV1
  readonly producerRequirements: VNextTextBlockUnifiedLayoutProducerRequirementsV1
  readonly policy: VNextTextBlockUnifiedLayoutSourceStatePolicyV1
  readonly root: VNextTextBlockUnifiedLayoutSourceNodeV1
  readonly summary: VNextTextBlockUnifiedLayoutSourceSummaryV1
  readonly work: VNextTextBlockUnifiedLayoutSourceStateWorkV1
  readonly contracts: {
    readonly offsetIndependentItems: true
    readonly sourceAndPaintSeparatedFromLayoutFlow: true
    readonly summaryGuidedRenderedOffsetLookup: true
    readonly canonicalLocalPacking: true
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

export type VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1 =
  | "invalid-input"
  | "initial-flow-authority-mismatch"
  | "flow-evidence-authority-mismatch"
  | "flow-evidence-binding-mismatch"
  | "invalid-source-topology"
  | "unresolved-inline-image"
  | "unsafe-source-summary"

export interface VNextTextBlockUnifiedLayoutSourceStateIssueV1 {
  readonly code: VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1
  readonly message: string
}

export type VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 =
  | {
      readonly status: "prepared"
      readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly work: VNextTextBlockUnifiedLayoutSourceStateWorkV1
      readonly registeredAuthority: false
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly sourceState: null
      readonly work: null
      readonly registeredAuthority: false
      readonly issues: readonly VNextTextBlockUnifiedLayoutSourceStateIssueV1[]
    }

export type VNextTextBlockUnifiedLayoutSourceStateInspectionV1 =
  | {
      readonly status: "prepared-unregistered"
      readonly fingerprint: string
      readonly registeredAuthority: false
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "source-state-authority-mismatch"
        | "source-state-not-deeply-frozen"
        | "source-state-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockUnifiedLayoutSourceLookupResultV1 =
  | {
      readonly status: "found"
      readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
      readonly absoluteStartRenderedUtf16: number
      readonly absoluteEndRenderedUtf16: number
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "not-found"
      readonly item: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "blocked"
      readonly item: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly work: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutSourceStateIssueV1[]
    }
