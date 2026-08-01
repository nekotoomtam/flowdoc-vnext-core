import type {
  VNextTextBlockSourceRangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockInitialFlowFontFaceV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockLimitExceededAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

export interface VNextTextBlockTransitionEvidenceRequestV1 {
  readonly source: "vnext-text-block-transition-evidence-request-v1"
  readonly contractVersion: 1
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly previousSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceRange: VNextTextBlockSourceRangeV1
  readonly leftContextRenderedUtf16Length: number
  readonly rightContextRenderedUtf16Length: number
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly layoutUnitPolicyFingerprint: string
  readonly maximumEvidenceCoverageRenderedUtf16Length: number
  readonly workPolicyFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerRuntimeIdentityV1 {
  readonly source: "vnext-text-block-transition-producer-runtime-v1"
  readonly contractVersion: 1
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

export interface VNextTextBlockTransitionProducerSourceAtomV1 {
  readonly kind:
    | "text"
    | "resolved-field"
    | "hard-break"
    | "inline-image-boundary"
  readonly relativeStartRenderedUtf16: number
  readonly relativeEndRenderedUtf16: number
  readonly renderedText: string
  readonly inlineId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly measurementStyleKey: string | null
  readonly effectiveShapingStyleKey: string | null
  readonly boundaryFingerprint: string | null
}

export interface VNextTextBlockTransitionProducerSourceMaterialV1 {
  readonly source: "vnext-text-block-transition-producer-source-material-v1"
  readonly contractVersion: 1
  readonly requestFingerprint: string
  readonly previousCoverage: readonly VNextTextBlockTransitionProducerSourceAtomV1[]
  readonly nextCoverage: readonly VNextTextBlockTransitionProducerSourceAtomV1[]
  readonly fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  readonly layoutUnitPolicyFingerprint: string
  readonly sourceTopologyFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerResponseV1 {
  readonly source: "vnext-text-block-transition-producer-response-v1"
  readonly contractVersion: 1
  readonly requestFingerprint: string
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV1
  readonly previousCoverage: VNextTextBlockSourceRangeV1
  readonly nextCoverage: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly sourceTopologyFingerprint: string
  readonly work: {
    readonly requestedAtomCount: number
    readonly requestedClusterCount: number
    readonly consumedAtomCount: number
    readonly consumedClusterCount: number
    readonly unusedCoverageRenderedUtf16Length: number
    readonly visitedEvidenceNodeCount: number
    readonly completeNextInputTraversalCount: 0
    readonly completeNextInputComparisonCount: 0
  }
  readonly contracts: {
    readonly producerSelectsDirtyRange: false
    readonly producerSelectsLinesOrBands: false
    readonly producerSelectsReconvergenceOrReuse: false
    readonly producerSelectsFallback: false
    readonly stagedEditorApply: false
    readonly mayPublishLayout: false
    readonly productionBinding: false
  }
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionEvidenceV1 {
  readonly source: "vnext-text-block-transition-evidence-v1"
  readonly contractVersion: 1
  readonly requestFingerprint: string
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly runtimeIdentityFingerprint: string
  readonly previousCoverage: VNextTextBlockSourceRangeV1
  readonly nextCoverage: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly sourceTopologyFingerprint: string
  readonly work: VNextTextBlockTransitionProducerResponseV1["work"]
  readonly fingerprint: string
}

export type VNextTextBlockTransitionEvidenceRequestResultV1 =
  | {
      readonly status: "required"
      readonly request: VNextTextBlockTransitionEvidenceRequestV1
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "not-required"
      readonly request: null
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly request: null
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly evaluatorAuthority?:
        VNextTextBlockLimitExceededAuthorityInternalV1
    }

export type VNextTextBlockTransitionEvidenceAcceptanceResultV1 =
  | {
      readonly status: "accepted"
      readonly evidence: VNextTextBlockTransitionEvidenceV1
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly evidence: null
      readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionEvidenceRequestInspectionV1 =
  | {
      readonly status: "valid"
      readonly previousRootFingerprint: string
      readonly changeFingerprint: string
      readonly previousSourceRange: VNextTextBlockSourceRangeV1
      readonly nextSourceRange: VNextTextBlockSourceRangeV1
      readonly fingerprint: string
    }
  | {
      readonly status: "invalid"
      readonly code: "evidence-authority-mismatch"
      readonly message: string
    }

export type VNextTextBlockTransitionEvidenceInspectionV1 =
  | {
      readonly status: "valid"
      readonly requestFingerprint: string
      readonly previousRootFingerprint: string
      readonly changeFingerprint: string
      readonly fingerprint: string
    }
  | {
      readonly status: "invalid"
      readonly code: "evidence-authority-mismatch"
      readonly message: string
    }
