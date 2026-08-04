import type { VNextTextBlockInitialFlowFontFaceV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockResolvedShapingRunV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

export interface VNextTextBlockTransitionProducerLaneRangesV2 {
  readonly changedSourceRange: VNextTextBlockSourceRangeV1
  readonly evidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapeVerificationRange: VNextTextBlockSourceRangeV1
  readonly coverageRange: VNextTextBlockSourceRangeV1
}

export interface VNextTextBlockBoundedSourceDeltaSpanInternalV2 {
  readonly kind:
    | "text"
    | "resolved-field"
    | "generated-page-number"
    | "hard-break"
    | "inline-image-boundary"
  readonly renderedText: string
  readonly renderedUtf16Length: number
  readonly logicalInlineId: string
  readonly semanticFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly layoutDependencyFingerprint: string
  readonly boundaryFingerprint: string
}

export interface VNextTextBlockBoundedSourceDeltaFactsInternalV2 {
  readonly previous: readonly VNextTextBlockBoundedSourceDeltaSpanInternalV2[]
  readonly next: readonly VNextTextBlockBoundedSourceDeltaSpanInternalV2[]
  readonly renderedContentEqual: boolean
  readonly semanticIdentityChanged: boolean
  readonly paintEqual: boolean
  readonly layoutEqual: boolean
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerResolvedStyleV2 {
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
  readonly paragraphStyleKey: string
  readonly fontFamilyKey: string
  readonly fontFaceId: string
  readonly fontSizeLayoutUnit: number
  readonly textColor: string
  readonly fontWeight: number
  readonly fontStyle: "normal" | "italic"
  readonly textDecoration: "none" | "underline"
  readonly strikethrough: boolean
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionEvidenceRequestV2 {
  readonly source: "vnext-text-block-transition-evidence-request-v2"
  readonly contractVersion: 2
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly previous: VNextTextBlockTransitionProducerLaneRangesV2
  readonly next: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextSegmentationContextRanges: readonly VNextTextBlockSourceRangeV1[]
  readonly requiredStableSegmentationExpansionCount: number
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly layoutUnitPolicyFingerprint: string
  readonly workPolicyFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceAtomBaseV2 {
  readonly relativeStartRenderedUtf16: number
  readonly relativeEndRenderedUtf16: number
  readonly renderedText: string
  readonly inlineId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockTransitionProducerSourceAtomV2 =
  VNextTextBlockTransitionProducerSourceAtomBaseV2 & (
    | { readonly kind: "text"; readonly resolvedStyle: VNextTextBlockTransitionProducerResolvedStyleV2 }
    | { readonly kind: "resolved-field"; readonly fieldKey: string; readonly resolvedStyle: VNextTextBlockTransitionProducerResolvedStyleV2 }
    | { readonly kind: "generated-page-number"; readonly generatedOwnerFingerprint: string; readonly resolvedStyle: VNextTextBlockTransitionProducerResolvedStyleV2 }
    | { readonly kind: "hard-break"; readonly boundaryFingerprint: string }
    | { readonly kind: "inline-image-boundary"; readonly boundaryFingerprint: string }
  )

export interface VNextTextBlockTransitionProducerLaneMaterialV2 {
  readonly ranges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[]
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceMaterialV2 {
  readonly source: "vnext-text-block-transition-producer-source-material-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly previous: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly next: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly paragraphStyleKey: string
  readonly fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  readonly layoutUnitPolicyFingerprint: string
  readonly sourceTopologyFingerprint: string
  readonly producerWorkCeilings: {
    readonly maximumVisitedEvidenceNodeCount: number
    readonly maximumRequestedAtomCount: number
    readonly maximumRequestedClusterCount: number
  }
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerRuntimeIdentityV2 {
  readonly source: "vnext-text-block-transition-producer-runtime-v2"
  readonly contractVersion: 2
  readonly runtime:
    | "node-native-mr1-range"
    | "browser-worker-wasm-mr1-range"
  readonly engineBuildFingerprint: string
  readonly fontBackendFingerprint: string
  readonly unitPolicyFingerprint: string
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockTransitionProducerOwnedWorkUnitV2 =
  | "evidence-producer-descriptors"
  | "evidence-runtime-invocations"
  | "evidence-runtime-input-scalars"
  | "evidence-glyphs"
  | "evidence-clusters"
  | "evidence-breaks"
  | "evidence-guards"
  | "evidence-proof-facts"
  | "evidence-response-facts"

export type VNextTextBlockTransitionProducerChargeResultV2 =
  | {
      readonly status: "charged"
      readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
      readonly completedWork: number
      readonly effectiveLimit: number
    }
  | {
      readonly status: "limit-exceeded"
      readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
      readonly attemptedWork: number
      readonly completedWork: number
      readonly effectiveLimit: number
    }
  | {
      readonly status: "invalid-state"
      readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
    }

export interface VNextTextBlockTransitionProducerInvocationAuthorityV2 {
  readonly source: "vnext-text-block-transition-producer-invocation-authority-v2"
  readonly contractVersion: 2
  readonly begin: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    request: VNextTextBlockTransitionEvidenceRequestV2,
    sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2,
  ) => { readonly status: "started" | "rejected" }
  readonly charge: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  ) => VNextTextBlockTransitionProducerChargeResultV2
  readonly bindRuntimeIdentity: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    identity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
  ) => { readonly status: "bound" | "rejected" }
  readonly close: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    outcome: "producer-response" | "producer-failure" | "producer-blocked",
  ) => {
    readonly status: "closed" | "rejected"
    readonly visitedEvidenceNodeCount: number
  }
}

export interface VNextTextBlockTransitionProducerWorkV2 {
  readonly requestedAtomCount: number
  readonly requestedClusterCount: number
  readonly consumedAtomCount: number
  readonly consumedClusterCount: number
  readonly unusedCoverageRenderedUtf16Length: number
  readonly visitedEvidenceNodeCount: number
  readonly completeNextInputTraversalCount: 0
  readonly completeNextInputComparisonCount: 0
}

export interface VNextTextBlockTransitionProducerContractsV2 {
  readonly producerSelectsDirtyRange: false
  readonly producerSelectsLinesOrBands: false
  readonly producerSelectsReconvergenceOrReuse: false
  readonly producerSelectsFallback: false
  readonly stagedEditorApply: false
  readonly mayPublishLayout: false
  readonly productionBinding: false
}

export interface VNextTextBlockTransitionShapingBoundaryProofV2 {
  readonly targetRange: VNextTextBlockSourceRangeV1
  readonly verificationRange: VNextTextBlockSourceRangeV1
  readonly leftBoundary:
    | "safe-first-target-glyph"
    | "exact-style-or-block-start"
  readonly rightBoundary:
    | "safe-first-right-guard-glyph"
    | "exact-style-or-block-end"
  readonly guardGlyphCount: number
  readonly inspectedGlyphCount: number
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionSegmentationBoundaryProofV2 {
  readonly contextRange: VNextTextBlockSourceRangeV1
  readonly contextBreakCount: number
  readonly targetBreakOffsets: readonly number[]
  readonly inspectedOffsetCount: number
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerResponseV2 {
  readonly source: "vnext-text-block-transition-producer-response-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly nextEvidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly shapingBoundaryProofs:
    readonly VNextTextBlockTransitionShapingBoundaryProofV2[]
  readonly segmentationBoundaryProofs:
    readonly VNextTextBlockTransitionSegmentationBoundaryProofV2[]
  readonly sourceTopologyFingerprint: string
  readonly work: VNextTextBlockTransitionProducerWorkV2
  readonly contracts: VNextTextBlockTransitionProducerContractsV2
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionEvidenceV2 {
  readonly source: "vnext-text-block-transition-evidence-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly runtimeIdentityFingerprint: string
  readonly nextEvidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly shapingBoundaryProofs:
    readonly VNextTextBlockTransitionShapingBoundaryProofV2[]
  readonly segmentationBoundaryProofs:
    readonly VNextTextBlockTransitionSegmentationBoundaryProofV2[]
  readonly sourceTopologyFingerprint: string
  readonly work: VNextTextBlockTransitionProducerWorkV2
  readonly fingerprint: string
}

export type VNextTextBlockTransitionProducerFailureCodeV2 =
  | "invalid-request-scoped-material"
  | "pinned-font-unavailable"
  | "pinned-font-mismatch"
  | "unsafe-shaping-boundary"
  | "segmentation-not-stable"
  | "missing-glyph"
  | "unsafe-runtime-arithmetic"
  | "work-ceiling-before-visit"

export interface VNextTextBlockTransitionProducerFailureV2 {
  readonly source: "vnext-text-block-transition-producer-failure-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly code: VNextTextBlockTransitionProducerFailureCodeV2
  readonly completedWork: VNextTextBlockTransitionProducerWorkV2
  readonly contracts: VNextTextBlockTransitionProducerContractsV2
  readonly fingerprint: string
}

export type VNextTextBlockTransitionEvidenceAcceptanceResultV2 =
  | {
      readonly status: "accepted"
      readonly evidence: VNextTextBlockTransitionEvidenceV2
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "fallback-required"
      readonly evidence: null
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly evidence: null
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionProducerFailureAcceptanceResultV2 =
  | {
      readonly status: "fallback-required"
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly evaluatorOrProofAuthority: null
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionEvidenceRequestResultV2 =
  | { readonly status: "required"; readonly request: VNextTextBlockTransitionEvidenceRequestV2; readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2; readonly producerInvocationAuthority: VNextTextBlockTransitionProducerInvocationAuthorityV2; readonly evaluatorOrProofAuthority: null; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "not-required"; readonly request: null; readonly sourceMaterial: null; readonly producerInvocationAuthority: null; readonly evaluatorOrProofAuthority: null; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "fallback-required"; readonly request: null; readonly sourceMaterial: null; readonly producerInvocationAuthority: null; readonly evaluatorOrProofAuthority: object; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "blocked"; readonly request: null; readonly sourceMaterial: null; readonly producerInvocationAuthority: null; readonly evaluatorOrProofAuthority: null; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[] }
