import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockV4MeasurementRun } from "../pagination/textBlockV4Measurement.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE =
  "vnext-text-block-persistent-flow-tree-v1" as const
export const VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION = 1 as const

export interface VNextTextBlockPersistentFlowPolicyV1 {
  policyVersion: 1
  maximumItemRenderedUtf16Length: 256
  maximumLeafItems: 8
  maximumBranchChildren: 8
  fingerprint: string
}

const policyFacts = {
  policyVersion: 1 as const,
  maximumItemRenderedUtf16Length: 256 as const,
  maximumLeafItems: 8 as const,
  maximumBranchChildren: 8 as const,
}

export const VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1: VNextTextBlockPersistentFlowPolicyV1 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson(policyFacts)),
})

export type VNextTextBlockPersistentFlowItemKindV1 = Exclude<
  VNextTextBlockV4MeasurementRun["kind"],
  "inline-image"
>

export interface VNextTextBlockPersistentFlowClusterV1 {
  startUtf16: number
  endUtf16: number
  advanceLayoutUnit: number
  styleKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
  direction: "ltr"
  baselineShiftLayoutUnit: 0
  features: readonly string[]
}

export interface VNextTextBlockPersistentFlowItemV1 {
  kind: VNextTextBlockPersistentFlowItemKindV1
  inlineId: string
  fieldKey?: string
  generatedOwnerFingerprint?: string
  styleKey?: string
  localStyle?: VNextTextBlockV4MeasurementRun["localStyle"]
  renderedText: string
  authoredUtf16Length: number
  beginsSourceRun: boolean
  endsSourceRun: boolean
  atomicSourceContribution: 0 | 1
  mandatoryBreakContribution: 0 | 1
  clusters: readonly VNextTextBlockPersistentFlowClusterV1[]
  dependencyFingerprint: string
  semanticFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowSummaryV1 {
  renderedUtf16Length: number
  authoredUtf16Length: number
  itemCount: number
  leafCount: number
  nodeCount: number
  sourceRunCount: number
  atomicSourceCount: number
  mandatoryBreakCount: number
  semanticFingerprint: string
}

export interface VNextTextBlockPersistentFlowLeafV1 {
  nodeKind: "leaf"
  height: 0
  items: readonly VNextTextBlockPersistentFlowItemV1[]
  summary: VNextTextBlockPersistentFlowSummaryV1
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowBranchV1 {
  nodeKind: "branch"
  height: number
  children: readonly VNextTextBlockPersistentFlowNodeV1[]
  summary: VNextTextBlockPersistentFlowSummaryV1
  fingerprint: string
}

export type VNextTextBlockPersistentFlowNodeV1 =
  | VNextTextBlockPersistentFlowLeafV1
  | VNextTextBlockPersistentFlowBranchV1

export interface VNextTextBlockPersistentFlowTreeV1 {
  source: typeof VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutContextFingerprint: string
  policy: VNextTextBlockPersistentFlowPolicyV1
  root: VNextTextBlockPersistentFlowNodeV1
  summary: VNextTextBlockPersistentFlowSummaryV1
  itemsByKind: Readonly<Record<VNextTextBlockPersistentFlowItemKindV1, number>>
  contracts: {
    offsetIndependentItems: true
    balancedLeafDepth: true
    coreOwnedMerkleFingerprints: true
    processLocalImmutableTree: true
    stagedCoverageCompatible: true
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockPersistentFlowIssueCodeV1 =
  | "production-binding-forbidden"
  | "complete-layout-mismatch"
  | "unsupported-flow-run"
  | "invalid-source-ranges"
  | "invalid-cluster-coverage"
  | "unsafe-tree-summary"

export type VNextTextBlockPersistentFlowBuildResultV1 =
  | { status: "accepted"; tree: VNextTextBlockPersistentFlowTreeV1; issues: [] }
  | {
      status: "blocked"
      tree: null
      issues: Array<{ code: VNextTextBlockPersistentFlowIssueCodeV1; message: string }>
    }

export type VNextTextBlockPersistentFlowBuildInputV1 = {
  request: VNextTextBlockMultiRunLayoutRequestV1
  acceptedLayout: import("./textBlockMultiRunIncrementalContractV1.js")
    .VNextTextBlockAcceptedMultiRunLayoutV1
}

export type VNextTextBlockPersistentFlowUpdateIssueCodeV1 =
  | "tree-provenance-mismatch"
  | "invalid-next-request"
  | "layout-context-mismatch"
  | "invalid-revision"
  | "invalid-edit"
  | "invalid-window"
  | "source-topology-mismatch"
  | "range-projection-failed"
  | "unsafe-tree-summary"

export interface VNextTextBlockPersistentFlowUpdateV1 {
  source: "vnext-text-block-persistent-flow-update-v1"
  contractVersion: 1
  previousTreeFingerprint: string
  nextTree: VNextTextBlockPersistentFlowTreeV1
  previousRange: { startUtf16: number; endUtf16: number }
  nextRange: { startUtf16: number; endUtf16: number }
  work: {
    previousNodeCount: number
    nextNodeCount: number
    reusedNodeCount: number
    createdNodeCount: number
    createdNodeCanonicalByteCount: number
    rangeLookupVisitedNodeCount: number
    pathCopyVisitedNodeCount: number
    previousSuffixCheckpointFoldLineCount: number
    replacedLeafCount: number
    replacedPreviousRenderedUtf16Length: number
    projectedNextRenderedUtf16Length: number
    completeTreeRebuildCount: 0
    completeSemanticPassCount: 0
  }
  contracts: {
    pathCopyUpdate: true
    summaryGuidedRangeLookup: true
    inPathIdentityAccounting: true
    shallowCreatedNodeCanonicalBytes: true
    prefixSuffixStructuralSharing: true
    offsetIndependentSuffixReuse: true
    processLocalProofBinding: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockPersistentFlowUpdateResultV1 =
  | { status: "accepted"; update: VNextTextBlockPersistentFlowUpdateV1; nextTree: VNextTextBlockPersistentFlowTreeV1; work: VNextTextBlockPersistentFlowUpdateV1["work"]; issues: [] }
  | { status: "blocked"; update: null; nextTree: null; work: null; issues: Array<{ code: VNextTextBlockPersistentFlowUpdateIssueCodeV1; message: string }> }
