import type { VNextTextBlockInitialFlowFontFaceV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"

export interface VNextTextBlockTransitionProducerLaneRangesV2 {
  readonly changedSourceRange: VNextTextBlockSourceRangeV1
  readonly evidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapeVerificationRange: VNextTextBlockSourceRangeV1
  readonly coverageRange: VNextTextBlockSourceRangeV1
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
