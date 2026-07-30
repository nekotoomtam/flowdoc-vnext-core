import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"

export const VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_SOURCE =
  "vnext-text-block-persistent-layout-line-tree-v1" as const
export const VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_VERSION =
  1 as const

export interface VNextTextBlockPersistentLayoutLineTreePolicyV1 {
  readonly policyVersion: 1
  readonly maximumBranchChildren: 8
  readonly splitOverflowLeftCount: 4
  readonly splitOverflowRightCount: 5
  readonly underflowBorrowOrder: readonly ["left", "right"]
  readonly underflowMergeOrder: readonly ["left", "right"]
  readonly collapseUnaryRoot: true
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutSourcePointV1 {
  readonly lineageId: string
  readonly localRenderedUtf16: number
}

export interface VNextTextBlockPersistentLayoutSourceRangeV1 {
  readonly start: VNextTextBlockPersistentLayoutSourcePointV1 | null
  readonly end: VNextTextBlockPersistentLayoutSourcePointV1 | null
}

export interface VNextTextBlockPersistentLayoutSourceMappingV1 {
  readonly lineageId: string
  readonly inlineId: string
  readonly sourceKind: VNextTextBlockUnifiedLayoutSourceItemV1["kind"]
  readonly localStartRenderedUtf16: number
  readonly localEndRenderedUtf16: number
  readonly sourceStartOffset: number
  readonly sourceEndOffset: number
  readonly renderedText: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly boundaryFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockPersistentLayoutLineFragmentInternalsV1 =
  | {
      readonly kind: "text"
      readonly lineageId: string
      readonly text: string
      readonly xLayoutUnit: number
      readonly advanceLayoutUnit: number
      readonly baselineShiftLayoutUnit: 0
      readonly fontFaceId: string
      readonly fontFamily: string
      readonly fontSha256: string
      readonly fontWeight: number
      readonly fontStyle: "normal" | "italic"
      readonly fontSizeLayoutUnit: number
      readonly ascentLayoutUnit: number
      readonly descentLayoutUnit: number
      readonly lineGapLayoutUnit: number
    }
  | {
      readonly kind: "inline-image"
      readonly lineageId: string
      readonly xLayoutUnit: number
      readonly yLayoutUnit: number
      readonly widthLayoutUnit: number
      readonly heightLayoutUnit: number
      readonly verticalAlign: "baseline" | "middle" | "text-bottom"
      readonly alignmentPolicyFingerprint: string
    }

export interface VNextTextBlockPersistentLayoutLineInternalsV1 {
  readonly lineageId: string
  readonly heightLayoutUnit: number
  readonly baselineOffsetLayoutUnit: number
  readonly fragments:
    readonly VNextTextBlockPersistentLayoutLineFragmentInternalsV1[]
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutContentLocalGeometryV1 {
  readonly yOffsetLayoutUnit: number
  readonly heightLayoutUnit: number
  readonly baselineOffsetLayoutUnit: number
  readonly availableIntervals: readonly {
    readonly leftLayoutUnit: number
    readonly rightLayoutUnit: number
  }[]
  readonly intervalPlacements: readonly {
    readonly localStartRenderedUtf16: number
    readonly localEndRenderedUtf16: number
    readonly intervalOrdinal: number
    readonly leftLayoutUnit: number
    readonly rightLayoutUnit: number
  }[]
  readonly fragments: readonly (
    | {
        readonly kind: "text"
        readonly lineageId: string
        readonly xLayoutUnit: number
        readonly advanceLayoutUnit: number
      }
    | {
        readonly kind: "inline-image"
        readonly lineageId: string
        readonly xLayoutUnit: number
        readonly yLayoutUnit: number
        readonly widthLayoutUnit: number
        readonly heightLayoutUnit: number
      }
  )[]
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1 {
  readonly contentYOffsetLayoutUnit: number
  readonly yOffsetLayoutUnit: number
  readonly heightLayoutUnit: number
  readonly baselineOffsetLayoutUnit: number
  readonly fragments: readonly (
    | {
        readonly kind: "text"
        readonly lineageId: string
        readonly contentXLayoutUnit: number
        readonly xLayoutUnit: number
        readonly advanceLayoutUnit: number
      }
    | {
        readonly kind: "inline-image"
        readonly lineageId: string
        readonly contentXLayoutUnit: number
        readonly contentYLayoutUnit: number
        readonly xLayoutUnit: number
        readonly yLayoutUnit: number
        readonly widthLayoutUnit: number
        readonly heightLayoutUnit: number
      }
  )[]
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutLineV1 {
  readonly lineageId: string
  readonly lineInternals: VNextTextBlockPersistentLayoutLineInternalsV1
  readonly sourceMapping: readonly VNextTextBlockPersistentLayoutSourceMappingV1[]
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly boundarySpatialContextFingerprint: string
  readonly contentLocalGeometry:
    VNextTextBlockPersistentLayoutContentLocalGeometryV1
  readonly authoredBoxGeometry:
    VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1
  readonly translatedGeometryFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutLineSummaryV1 {
  readonly lineCount: number
  readonly fragmentCount: number
  readonly leafCount: number
  readonly nodeCount: number
  readonly sourceRange: VNextTextBlockPersistentLayoutSourceRangeV1
  readonly authoredTopLayoutUnit: number | null
  readonly authoredBottomLayoutUnit: number | null
  readonly lineInternalsFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly boundarySpatialContextFingerprint: string
  readonly contentLocalGeometryFingerprint: string
  readonly authoredBoxGeometryFingerprint: string
  readonly translatedGeometryFingerprint: string
}

export interface VNextTextBlockPersistentLayoutEmptyRootV1 {
  readonly nodeKind: "empty"
  readonly height: 0
  readonly summary: VNextTextBlockPersistentLayoutLineSummaryV1
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutLineLeafV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly line: VNextTextBlockPersistentLayoutLineV1
  readonly summary: VNextTextBlockPersistentLayoutLineSummaryV1
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentLayoutLineBranchV1 {
  readonly nodeKind: "branch"
  readonly height: number
  readonly children: readonly VNextTextBlockPersistentLayoutLineNodeV1[]
  readonly summary: VNextTextBlockPersistentLayoutLineSummaryV1
  readonly fingerprint: string
}

export type VNextTextBlockPersistentLayoutLineNodeV1 =
  | VNextTextBlockPersistentLayoutLineLeafV1
  | VNextTextBlockPersistentLayoutLineBranchV1

export type VNextTextBlockPersistentLayoutLineRootV1 =
  | VNextTextBlockPersistentLayoutEmptyRootV1
  | VNextTextBlockPersistentLayoutLineNodeV1

export interface VNextTextBlockPersistentLayoutLineTreeWorkV1 {
  readonly completeBuildCount: 1
  readonly visitedLineCount: number
  readonly createdLeafCount: number
  readonly createdNodeCount: number
  readonly reusedLeafCount: 0
  readonly reusedNodeCount: 0
  readonly completeSuffixTraversalCount: 0
}

export interface VNextTextBlockPersistentLayoutLineTreeV1 {
  readonly source:
    typeof VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_SOURCE
  readonly contractVersion:
    typeof VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_VERSION
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly instanceRevision: number
  readonly layoutId: string
  readonly layoutContextFingerprint: string
  readonly spatialContextFingerprint: string
  readonly authoredBoxPlanFingerprint: string
  readonly policy: VNextTextBlockPersistentLayoutLineTreePolicyV1
  readonly root: VNextTextBlockPersistentLayoutLineRootV1
  readonly summary: VNextTextBlockPersistentLayoutLineSummaryV1
  readonly work: VNextTextBlockPersistentLayoutLineTreeWorkV1
  readonly contracts: {
    readonly oneLogicalLinePerLeaf: true
    readonly paintFactsExcluded: true
    readonly absoluteLineOrdinalsExcluded: true
    readonly absoluteRenderedOffsetsExcluded: true
    readonly canonicalMaximalDispositionCover: true
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

export type VNextTextBlockPersistentLayoutLineTreeIssueCodeV1 =
  | "invalid-input"
  | "source-state-authority-mismatch"
  | "flow-tree-authority-mismatch"
  | "spatial-state-authority-mismatch"
  | "spatial-layout-authority-mismatch"
  | "authored-box-geometry-authority-mismatch"
  | "dependency-binding-mismatch"
  | "line-geometry-count-mismatch"
  | "line-geometry-binding-mismatch"
  | "source-range-mismatch"
  | "unsafe-line-summary"
  | "invalid-line-topology"

export interface VNextTextBlockPersistentLayoutLineTreeIssueV1 {
  readonly code: VNextTextBlockPersistentLayoutLineTreeIssueCodeV1
  readonly message: string
  readonly lineOrdinal?: number
}

export type VNextTextBlockPersistentLayoutLineTreeBuildResultV1 =
  | {
      readonly status: "prepared"
      readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
      readonly work: VNextTextBlockPersistentLayoutLineTreeWorkV1
      readonly registeredAuthority: false
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly lineTree: null
      readonly work: null
      readonly registeredAuthority: false
      readonly issues:
        readonly VNextTextBlockPersistentLayoutLineTreeIssueV1[]
    }

export type VNextTextBlockPersistentLayoutLineTreeInspectionV1 =
  | {
      readonly status: "valid-candidate"
      readonly fingerprint: string
      readonly registeredAuthority: false
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "line-tree-authority-mismatch"
        | "line-tree-not-deeply-frozen"
        | "line-tree-canonical-facts-mismatch"
      readonly message: string
    }

export type VNextTextBlockPersistentLayoutLineLookupResultV1 =
  | {
      readonly status: "found"
      readonly lineOrdinal: number
      readonly leaf: VNextTextBlockPersistentLayoutLineLeafV1
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "not-found"
      readonly lineOrdinal: null
      readonly leaf: null
      readonly work: {
        readonly visitedNodeCount: number
        readonly completeTreeTraversalCount: 0
      }
    }
  | {
      readonly status: "blocked"
      readonly lineOrdinal: null
      readonly leaf: null
      readonly work: null
      readonly issues:
        readonly VNextTextBlockPersistentLayoutLineTreeIssueV1[]
    }

export interface VNextTextBlockLineOrdinalRangeV1 {
  readonly start: number
  readonly end: number
}

export type VNextTextBlockLineDispositionV1 = "E" | "T" | "R" | "N"

export interface VNextTextBlockLineDispositionSegmentV1 {
  readonly disposition: VNextTextBlockLineDispositionV1
  readonly previousRange: VNextTextBlockLineOrdinalRangeV1 | null
  readonly nextRange: VNextTextBlockLineOrdinalRangeV1
  readonly constantYDeltaLayoutUnit: number | null
}

export interface VNextTextBlockLineDispositionSubtreeCoverV1
  extends VNextTextBlockLineDispositionSegmentV1 {
  readonly subtreeFingerprints: readonly string[]
}

export interface VNextTextBlockLineDispositionCoverV1 {
  readonly source: "vnext-text-block-line-disposition-cover-v1"
  readonly contractVersion: 1
  readonly previousTreeFingerprint: string
  readonly nextTreeFingerprint: string
  readonly covers: readonly VNextTextBlockLineDispositionSubtreeCoverV1[]
  readonly counts: {
    readonly E: number
    readonly T: number
    readonly R: number
    readonly N: number
    readonly removed: number
  }
  readonly work: {
    readonly visitedSegmentCount: number
    readonly selectedSubtreeCount: number
    readonly enumeratedLineCount: 0
  }
  readonly fingerprint: string
}

export type VNextTextBlockLineDispositionIssueCodeV1 =
  | "invalid-input"
  | "line-tree-authority-mismatch"
  | "line-disposition-next-gap"
  | "line-disposition-next-overlap"
  | "line-disposition-next-nonexhaustive"
  | "line-disposition-previous-overlap"
  | "line-disposition-range-mismatch"
  | "line-disposition-nonmaximal-segments"
  | "line-disposition-invalid-translation"
  | "line-disposition-source-mismatch"
  | "line-disposition-provenance-mismatch"
  | "line-disposition-internals-mismatch"
  | "line-disposition-boundary-mismatch"
  | "line-disposition-geometry-mismatch"
  | "line-disposition-not-exact-reuse"
  | "line-disposition-count-overflow"

export interface VNextTextBlockLineDispositionIssueV1 {
  readonly code: VNextTextBlockLineDispositionIssueCodeV1
  readonly message: string
}

export type VNextTextBlockLineDispositionCoverResultV1 =
  | {
      readonly status: "accepted"
      readonly cover: VNextTextBlockLineDispositionCoverV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly cover: null
      readonly issues: readonly VNextTextBlockLineDispositionIssueV1[]
    }

export type VNextTextBlockLineDispositionCoverInspectionV1 =
  | {
      readonly status: "valid"
      readonly fingerprint: string
    }
  | {
      readonly status: "invalid"
      readonly code:
        | "line-disposition-cover-authority-mismatch"
        | "line-disposition-cover-binding-mismatch"
        | "line-disposition-cover-not-deeply-frozen"
        | "line-disposition-cover-canonical-facts-mismatch"
      readonly message: string
    }
