export const VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_SOURCE =
  "vnext-text-block-incremental-flow-tree-v1" as const
export const VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_VERSION = 1 as const

export interface VNextTextBlockIncrementalFlowTreePolicyV1 {
  readonly policyVersion: 1
  readonly maximumLeafItems: 8
  readonly maximumBranchChildren: 8
  readonly splitOverflowLeftCount: 4
  readonly splitOverflowRightCount: 5
  readonly underflowBorrowOrder: readonly ["left", "right"]
  readonly underflowMergeOrder: readonly ["left", "right"]
  readonly fingerprint: string
}

interface VNextTextBlockIncrementalFlowAtomBaseV1 {
  readonly lineageId: string
  readonly inlineId: string
  readonly renderedText: string
  readonly renderedUtf16Length: number
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly lineInternalsDependencyFingerprint: string
  readonly boundaryFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockIncrementalFlowAtomV1 =
  | (VNextTextBlockIncrementalFlowAtomBaseV1 & {
      readonly kind: "text-cluster"
      readonly sourceKind:
        | "text"
        | "resolved-field"
        | "generated-page-number"
      readonly localStartRenderedUtf16: number
      readonly localEndRenderedUtf16: number
      readonly fontFaceId: string
      readonly fontSizeLayoutUnit: number
      readonly advanceLayoutUnit: number
      readonly ascentLayoutUnit: number
      readonly descentLayoutUnit: number
      readonly lineGapLayoutUnit: number
      readonly baselineShiftLayoutUnit: number
      readonly features: readonly string[]
    })
  | (VNextTextBlockIncrementalFlowAtomBaseV1 & {
      readonly kind: "hard-break"
    })
  | (VNextTextBlockIncrementalFlowAtomBaseV1 & {
      readonly kind: "inline-image"
      readonly assetId: string
      readonly widthLayoutUnit: number
      readonly heightLayoutUnit: number
      readonly verticalAlign: "baseline" | "middle" | "text-bottom"
      readonly alignmentPolicyFingerprint: string
    })

export interface VNextTextBlockIncrementalFlowSummaryV1 {
  readonly renderedUtf16Length: number
  readonly atomCount: number
  readonly leafCount: number
  readonly nodeCount: number
  readonly textClusterCount: number
  readonly hardBreakCount: number
  readonly inlineImageCount: number
  readonly lineInternalsDependencyFingerprint: string
  readonly boundaryFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
}

export interface VNextTextBlockIncrementalFlowLeafV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly atoms: readonly VNextTextBlockIncrementalFlowAtomV1[]
  readonly summary: VNextTextBlockIncrementalFlowSummaryV1
  readonly fingerprint: string
}

export interface VNextTextBlockIncrementalFlowBranchV1 {
  readonly nodeKind: "branch"
  readonly height: number
  readonly children: readonly VNextTextBlockIncrementalFlowNodeV1[]
  readonly summary: VNextTextBlockIncrementalFlowSummaryV1
  readonly fingerprint: string
}

export type VNextTextBlockIncrementalFlowNodeV1 =
  | VNextTextBlockIncrementalFlowLeafV1
  | VNextTextBlockIncrementalFlowBranchV1

export interface VNextTextBlockIncrementalFlowTreeWorkV1 {
  readonly completeBuildCount: 1
  readonly visitedSourceItemCount: number
  readonly visitedEvidenceShapingRunCount: number
  readonly visitedEvidenceClusterCount: number
  readonly createdAtomCount: number
  readonly createdLeafCount: number
  readonly createdNodeCount: number
  readonly reusedAtomCount: 0
  readonly reusedNodeCount: 0
  readonly completeTreeRebuildCount: 1
  readonly completeSuffixTraversalCount: 0
}

export interface VNextTextBlockIncrementalFlowTreeV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_VERSION
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly instanceRevision: number
  readonly layoutId: string
  readonly layoutContextFingerprint: string
  readonly sourceStateLayoutDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly policy: VNextTextBlockIncrementalFlowTreePolicyV1
  readonly root: VNextTextBlockIncrementalFlowNodeV1
  readonly summary: VNextTextBlockIncrementalFlowSummaryV1
  readonly work: VNextTextBlockIncrementalFlowTreeWorkV1
  readonly contracts: {
    readonly layoutAffectingAtomsOnly: true
    readonly paintFactsExcluded: true
    readonly offsetIndependentAtoms: true
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

export type VNextTextBlockIncrementalFlowTreeIssueCodeV1 =
  | "invalid-input"
  | "source-state-authority-mismatch"
  | "flow-evidence-authority-mismatch"
  | "source-evidence-binding-mismatch"
  | "invalid-source-topology"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockIncrementalFlowTreeIssueV1 {
  readonly code: VNextTextBlockIncrementalFlowTreeIssueCodeV1
  readonly message: string
}

export type VNextTextBlockIncrementalFlowTreeBuildResultV1 =
  | {
      readonly status: "prepared"
      readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
      readonly work: VNextTextBlockIncrementalFlowTreeWorkV1
      readonly registeredAuthority: false
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly flowTree: null
      readonly work: null
      readonly registeredAuthority: false
      readonly issues: readonly VNextTextBlockIncrementalFlowTreeIssueV1[]
    }

export type VNextTextBlockIncrementalFlowTreeInspectionV1 =
  | {
      readonly status: "prepared-unregistered"
      readonly fingerprint: string
      readonly registeredAuthority: false
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "flow-tree-authority-mismatch"
        | "flow-tree-not-deeply-frozen"
        | "flow-tree-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockIncrementalFlowLookupResultV1 =
  | {
      readonly status: "found"
      readonly atom: VNextTextBlockIncrementalFlowAtomV1
      readonly absoluteStartRenderedUtf16: number
      readonly absoluteEndRenderedUtf16: number
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "not-found"
      readonly atom: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "blocked"
      readonly atom: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly work: null
      readonly issues: readonly VNextTextBlockIncrementalFlowTreeIssueV1[]
    }
