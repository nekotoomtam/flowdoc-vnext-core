import type {
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockPositionedLineV1,
} from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SNAPSHOT_SOURCE =
  "vnext-text-block-multi-run-incremental-snapshot-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_ACCEPTANCE_SOURCE =
  "vnext-text-block-multi-run-incremental-acceptance-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION = 1 as const

export type VNextTextBlockAcceptedMultiRunLayoutV1 = Extract<
  VNextTextBlockMultiRunLayoutResultV1,
  { status: "accepted" }
>

export interface VNextTextBlockMultiRunIncrementalSnapshotV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SNAPSHOT_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION
  request: VNextTextBlockMultiRunLayoutRequestV1
  layout: VNextTextBlockAcceptedMultiRunLayoutV1
  semanticLineFingerprints: readonly string[]
  prefixSemanticFingerprints: readonly string[]
  suffixSemanticFingerprints: readonly string[]
  semanticRangeLineFingerprints: readonly string[]
  prefixSemanticRangeFingerprints: readonly string[]
  suffixSemanticRangeFingerprints: readonly string[]
  contracts: {
    acceptedCompleteLayoutProvenance: true
    processLocalImmutableSnapshot: true
    semanticIdentitySeparateFromPhysicalIds: true
    perEditFullLayoutAcceptance: false
    mayPublishLayout: false
  }
  fingerprint: string
}

export interface VNextTextBlockMultiRunIncrementalEditV1 {
  previousStartOffset: number
  previousEndOffset: number
  nextEndOffset: number
}

export interface VNextTextBlockMultiRunIncrementalWindowProofV1 {
  previousRestartLineIndex: number
  nextRestartLineIndex: number
  previousReconvergenceLineIndex: number
  nextReconvergenceLineIndex: number
  previousReconvergenceOffset: number
  nextReconvergenceOffset: number
  offsetDelta: number
  stableLineCount: number
  previousSuffixSemanticFingerprint: string
  nextSuffixSemanticFingerprint: string
  previousSuffixSemanticRangeFingerprint: string
  nextSuffixSemanticRangeFingerprint: string
}

export type VNextTextBlockMultiRunIncrementalFallbackCodeV1 =
  | "production-binding-forbidden"
  | "snapshot-provenance-mismatch"
  | "layout-context-mismatch"
  | "invalid-revision"
  | "invalid-edit"
  | "invalid-next-measurement"
  | "invalid-next-shaping-facts"
  | "invalid-next-breaks-or-lines"
  | "invalid-window-proof"
  | "prefix-semantic-mismatch"
  | "suffix-semantic-mismatch"
  | "affected-line-derivation-failed"

interface VNextTextBlockMultiRunIncrementalAcceptanceBaseV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_ACCEPTANCE_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION
  layoutId: string
  textBlockId: string
  previousInstanceRevision: number
  nextInstanceRevision: number
  snapshotFingerprint: string
  contracts: {
    coreAcceptsAffectedLineWindow: true
    coreOwnedCompositionalSemanticCheckpoints: true
    completeSemanticRangeHashing: false
    semanticIdentitySeparateFromPhysicalIds: true
    physicalIdsAreRevisionSpecific: true
    completeCoreLayoutOracleRequiredForQa: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    mayPublishLayout: false
    productionBinding: false
  }
}

export type VNextTextBlockMultiRunIncrementalAcceptanceV1 =
  | (VNextTextBlockMultiRunIncrementalAcceptanceBaseV1 & {
      status: "window-accepted"
      edit: VNextTextBlockMultiRunIncrementalEditV1
      references: {
        prefix: {
          previousStartLineIndex: 0
          previousEndLineIndexExclusive: number
          nextStartLineIndex: 0
          nextEndLineIndexExclusive: number
          lineIndexDelta: 0
          offsetDelta: 0
          yOffsetDeltaLayoutUnit: 0
          semanticFingerprint: string
        }
        affected: {
          nextStartLineIndex: number
          nextEndLineIndexExclusive: number
          lines: VNextTextBlockPositionedLineV1[]
          semanticFingerprint: string
        }
        suffix: {
          previousStartLineIndex: number
          previousEndLineIndexExclusive: number
          nextStartLineIndex: number
          nextEndLineIndexExclusive: number
          lineIndexDelta: number
          offsetDelta: number
          yOffsetDeltaLayoutUnit: number
          semanticFingerprint: string
        }
      }
      work: {
        reusedPrefixLineCount: number
        positionedAffectedLineCount: number
        reusedSuffixLineCount: number
        semanticCheckpointProofAccepted: true
        completeSemanticRangeHashCount: 0
      }
      fingerprint: string
      fallback: null
    })
  | (VNextTextBlockMultiRunIncrementalAcceptanceBaseV1 & {
      status: "fallback-required"
      edit: null
      references: null
      work: null
      fingerprint: string
      fallback: {
        code: VNextTextBlockMultiRunIncrementalFallbackCodeV1
        message: string
      }
    })
