import type { ImageFrameV4Target } from "../schema/documentV4ImageTarget.js"
import type { VNextTextBlockPersistentFlowPolicyV1 } from "./textBlockPersistentFlowContractV1.js"

export type VNextTextBlockPersistentFlowAtomV2 =
  | {
      kind: "text-cluster"
      inlineId: string
      sourceKind: "text" | "resolved-field" | "generated-page-number"
      fieldKey?: string
      generatedOwnerFingerprint?: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: string
      shapingRunId: string
      styleKey: string
      fontFaceId: string
      fontSizeLayoutUnit: number
      textColor: string
      advanceLayoutUnit: number
      ascentLayoutUnit: number
      descentLayoutUnit: number
      lineGapLayoutUnit: number
      dependencyFingerprint: string
      fingerprint: string
    }
  | {
      kind: "hard-break"
      inlineId: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: "\n" | "\r" | "\r\n"
      fingerprint: string
    }
  | {
      kind: "inline-image"
      inlineId: string
      assetId: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: "\uFFFC"
      widthLayoutUnit: number
      heightLayoutUnit: number
      authoredFrame: ImageFrameV4Target
      verticalAlign: "baseline" | "middle" | "text-bottom"
      alignmentPolicyFingerprint: string
      dependencyFingerprint: string
      fingerprint: string
    }

export interface VNextTextBlockPersistentFlowSummaryV2 {
  renderedUtf16Length: number
  atomCount: number
  leafCount: number
  nodeCount: number
  textClusterCount: number
  hardBreakCount: number
  inlineImageCount: number
  semanticFingerprint: string
}

export interface VNextTextBlockPersistentFlowLeafV2 {
  nodeKind: "leaf"
  height: 0
  atoms: readonly VNextTextBlockPersistentFlowAtomV2[]
  summary: VNextTextBlockPersistentFlowSummaryV2
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowBranchV2 {
  nodeKind: "branch"
  height: number
  children: readonly VNextTextBlockPersistentFlowNodeV2[]
  summary: VNextTextBlockPersistentFlowSummaryV2
  fingerprint: string
}

export type VNextTextBlockPersistentFlowNodeV2 =
  | VNextTextBlockPersistentFlowLeafV2
  | VNextTextBlockPersistentFlowBranchV2

export interface VNextTextBlockPersistentFlowTreeV2 {
  source: "vnext-text-block-persistent-flow-tree-v2"
  contractVersion: 2
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  layoutContextFingerprint: string
  initialFlowFingerprint: string
  flowEvidenceFingerprint: string
  policy: VNextTextBlockPersistentFlowPolicyV1
  root: VNextTextBlockPersistentFlowNodeV2
  summary: VNextTextBlockPersistentFlowSummaryV2
  itemsByKind: Readonly<{
    "text-cluster": number
    "hard-break": number
    "inline-image": number
  }>
  contracts: {
    closedFlowAtomUnion: true
    balancedLeafDepth: true
    sharedPersistentRopeKernel: true
    processLocalImmutableTree: true
    suffixReuseClaim: false
    reconvergenceClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockPersistentFlowBuildIssueCodeV2 =
  | "invalid-input"
  | "production-binding-forbidden"
  | "initial-flow-provenance-mismatch"
  | "flow-evidence-provenance-mismatch"
  | "flow-evidence-binding-mismatch"
  | "invalid-source-topology"
  | "unresolved-inline-image"
  | "unsafe-layout-arithmetic"

export type VNextTextBlockPersistentFlowBuildResultV2 =
  | { status: "accepted"; tree: VNextTextBlockPersistentFlowTreeV2; issues: [] }
  | {
      status: "blocked"
      tree: null
      issues: ReadonlyArray<{
        code: VNextTextBlockPersistentFlowBuildIssueCodeV2
        message: string
      }>
    }
