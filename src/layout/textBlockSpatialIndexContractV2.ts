import type { VNextTextBlockFlowRegionIssueCodeV1, VNextTextBlockFlowRegionWorkV1 } from "./textBlockFlowRegionProviderV1.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import type {
  VNextTextBlockSpatialBandV1,
  VNextTextBlockSpatialIndexEntryV1,
  VNextTextBlockSpatialIndexIssueCodeV1,
  VNextTextBlockSpatialIndexNodeV1,
  VNextTextBlockSpatialIndexSummaryV1,
  VNextTextBlockSpatialIndexUpdateWorkV1,
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"

export const VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_SOURCE = "vnext-text-block-spatial-index-v2" as const
export const VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_VERSION = 2 as const

export interface VNextTextBlockSpatialIndexV2 {
  source: typeof VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_VERSION
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  layoutContextFingerprint: string
  initialFlowFingerprint: string
  flowEvidenceFingerprint: string
  persistentFlowTreeFingerprint: string
  contentLeftLayoutUnit: 0
  contentRightLayoutUnit: number
  root: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexSummaryV1
  contracts: {
    canonicalPositionedObjectSchema: false
    authoredPositionedObjectBinding: false
    sharedPersistentTreap: true
    processLocalImmutableIndex: true
    mayPublishLayout: false
    productionBinding: false
  }
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}

export interface VNextTextBlockSpatialIssueV2 {
  code: "invalid-input" | "input-authority-mismatch" | "layout-authority-mismatch"
    | "spatial-index-provenance-mismatch" | "spatial-index-binding-mismatch"
    | VNextTextBlockSpatialIndexIssueCodeV1 | VNextTextBlockFlowRegionIssueCodeV1
  severity: "error"
  path: string
  message: string
  objectId?: string
}

export type VNextTextBlockSpatialIndexBuildResultV2 =
  | { status: "accepted"; index: VNextTextBlockSpatialIndexV2; issues: [] }
  | { status: "blocked"; index: null; issues: readonly VNextTextBlockSpatialIssueV2[] }

export type VNextTextBlockSpatialIndexInspectionV2 =
  | { status: "valid"; fingerprint: string }
  | { status: "invalid"; code: "spatial-index-provenance-mismatch" | "spatial-index-not-deeply-frozen"; message: string }

export interface VNextTextBlockSpatialIndexBuildInputV2 {
  inputAuthority: "core-synthetic-qa-only"
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

export type VNextTextBlockSpatialIndexUpdateResultV2 =
  | {
      status: "accepted"
      update: {
        source: "vnext-text-block-spatial-index-update-v2"
        contractVersion: 2
        previousIndexFingerprint: string
        nextIndexFingerprint: string
        geometryOwnerFingerprint: string
        affectedBands: readonly VNextTextBlockSpatialBandV1[]
        work: VNextTextBlockSpatialIndexUpdateWorkV1
        mayPublishLayout: false
        productionBinding: false
        fingerprint: string
      }
      nextIndex: VNextTextBlockSpatialIndexV2
      issues: []
    }
  | { status: "blocked"; update: null; nextIndex: null; issues: readonly VNextTextBlockSpatialIssueV2[] }

export type VNextTextBlockSpatialIndexUpdateInspectionV2 =
  | { status: "valid"; fingerprint: string }
  | { status: "invalid"; code: "spatial-update-provenance-mismatch" | "spatial-update-binding-mismatch"; message: string }

export interface VNextTextBlockFlowIntervalV2 { startLayoutUnit: number; endLayoutUnit: number }

export type VNextTextBlockFlowRegionResultV2 =
  | {
      status: "accepted"
      source: "vnext-text-block-flow-region-v2"
      contractVersion: 2
      intervals: readonly VNextTextBlockFlowIntervalV2[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: VNextTextBlockFlowRegionWorkV1
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      source: "vnext-text-block-flow-region-v2"
      contractVersion: 2
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly VNextTextBlockSpatialIssueV2[]
    }

export type { VNextTextBlockSpatialBandV1, VNextTextBlockSpatialIndexEntryV1, VNextTextBlockSyntheticPositionedObjectInputV1 }
