import { sameVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE,
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
  type VNextTextBlockPersistentFlowBuildInputV1,
  type VNextTextBlockPersistentFlowBuildResultV1,
  type VNextTextBlockPersistentFlowIssueCodeV1,
  type VNextTextBlockPersistentFlowNodeV1,
  type VNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowContractV1.js"
import {
  buildVNextTextBlockPersistentFlowRootInternalV1,
  compactPersistentFlowFactsV1,
  createVNextTextBlockPersistentFlowLeafInternalV1,
  deepFreezePersistentFlowV1,
  deeplyFrozenPersistentFlowV1,
  hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1,
  partitionPersistentFlowValuesV1,
  projectVNextTextBlockPersistentFlowItemsForRangeV1,
  registerVNextTextBlockPersistentFlowTreeInternalV1,
} from "./textBlockPersistentFlowTreeInternalsV1.js"

function blocked(
  code: VNextTextBlockPersistentFlowIssueCodeV1,
  message: string,
): VNextTextBlockPersistentFlowBuildResultV1 {
  return { status: "blocked", tree: null, issues: [{ code, message }] }
}

export function createVNextTextBlockPersistentFlowTreeV1(
  input: VNextTextBlockPersistentFlowBuildInputV1,
): VNextTextBlockPersistentFlowBuildResultV1 {
  if (input.request.bindProductionLayout === true) return blocked(
    "production-binding-forbidden",
    "persistent flow foundation cannot bind production layout",
  )
  const reproduced = acceptVNextTextBlockMultiRunLayoutV1(input.request)
  if (reproduced.status !== "accepted" || !sameVNextCanonicalJson(reproduced, input.acceptedLayout)) {
    return blocked("complete-layout-mismatch", "tree creation requires the exact accepted MR1 layout")
  }
  const projected = projectVNextTextBlockPersistentFlowItemsForRangeV1({
    request: input.request,
    renderStartOffset: 0,
    renderEndOffset: input.request.measurement.renderedText.length,
  })
  if (projected.status === "blocked") return blocked(projected.code, projected.message)
  try {
    const leaves = partitionPersistentFlowValuesV1(
      projected.items,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems,
    ).map(createVNextTextBlockPersistentFlowLeafInternalV1)
    const root = buildVNextTextBlockPersistentFlowRootInternalV1(leaves)
    const layoutContextFingerprint = compactPersistentFlowFactsV1({
      layoutId: input.request.layoutId,
      documentId: input.request.measurement.documentId,
      sectionId: input.request.measurement.sectionId,
      textBlockId: input.request.measurement.textBlockId,
      measurementProfileId: input.request.measurement.measurementProfileId,
      layoutUnitPolicyFingerprint: input.request.layoutUnitPolicyFingerprint,
      availableWidthLayoutUnit: input.request.availableWidthLayoutUnit,
      declaredLineHeightLayoutUnit: input.request.declaredLineHeightLayoutUnit,
      paragraphStyle: input.request.paragraphStyle,
      fontFaces: input.request.fontFaces,
    })
    const facts = {
      source: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
      documentId: input.request.measurement.documentId,
      sectionId: input.request.measurement.sectionId,
      textBlockId: input.request.measurement.textBlockId,
      instanceRevision: input.request.measurement.instanceRevision,
      layoutContextFingerprint,
      policy: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
      root,
      summary: root.summary,
      itemsByKind: projected.itemsByKind,
      contracts: {
        offsetIndependentItems: true as const,
        balancedLeafDepth: true as const,
        coreOwnedMerkleFingerprints: true as const,
        processLocalImmutableTree: true as const,
        stagedCoverageCompatible: true as const,
        stagedEditorApply: false as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
    }
    const tree = deepFreezePersistentFlowV1({
      ...facts,
      fingerprint: compactPersistentFlowFactsV1(facts),
    })
    registerVNextTextBlockPersistentFlowTreeInternalV1(tree)
    return { status: "accepted", tree, issues: [] }
  } catch {
    return blocked("unsafe-tree-summary", "persistent flow tree summary exceeded safe integer arithmetic")
  }
}

export function inspectVNextTextBlockPersistentFlowTreeV1(
  tree: unknown,
): { status: "valid"; fingerprint: string } | {
  status: "invalid"
  code: "tree-provenance-mismatch" | "tree-not-deeply-frozen"
  message: string
} {
  if (
    tree == null
    || typeof tree !== "object"
    || !hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(tree)
  ) return {
    status: "invalid",
    code: "tree-provenance-mismatch",
    message: "tree is not the exact process-local object created by Core",
  }
  if (!deeplyFrozenPersistentFlowV1(tree)) return {
    status: "invalid",
    code: "tree-not-deeply-frozen",
    message: "registered persistent flow tree must remain recursively frozen",
  }
  return { status: "valid", fingerprint: (tree as VNextTextBlockPersistentFlowTreeV1).fingerprint }
}

export function collectVNextTextBlockPersistentFlowNodesForQaV1(
  tree: VNextTextBlockPersistentFlowTreeV1,
): VNextTextBlockPersistentFlowNodeV1[] {
  const nodes: VNextTextBlockPersistentFlowNodeV1[] = []
  const visit = (node: VNextTextBlockPersistentFlowNodeV1): void => {
    nodes.push(node)
    if (node.nodeKind === "branch") node.children.forEach(visit)
  }
  visit(tree.root)
  return nodes
}
