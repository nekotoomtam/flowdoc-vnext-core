import { sameVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"
import {
  createVNextTextBlockMultiRunSemanticLineFingerprintV1,
  createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1,
} from "./textBlockMultiRunSemanticV1.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  type VNextTextBlockPersistentFlowBuildInputV1,
  type VNextTextBlockPersistentFlowBuildResultV1,
  type VNextTextBlockPersistentFlowIssueCodeV1,
  type VNextTextBlockPersistentFlowNodeV1,
  type VNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowContractV1.js"
import {
  buildVNextTextBlockPersistentFlowRootInternalV1,
  createVNextTextBlockPersistentFlowLeafInternalV1,
  createVNextTextBlockPersistentFlowTreeFromRootInternalV1,
  deeplyFrozenPersistentFlowV1,
  hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1,
  projectVNextTextBlockPersistentFlowItemsForRangeV1,
} from "./textBlockPersistentFlowTreeInternalsV1.js"
import {
  collectVNextTextBlockPersistentRopeNodesKernelV1,
  partitionVNextTextBlockPersistentValuesKernelV1,
} from "./textBlockPersistentRopeKernelV1.js"

function blocked(
  code: VNextTextBlockPersistentFlowIssueCodeV1,
  message: string,
): VNextTextBlockPersistentFlowBuildResultV1 {
  return { status: "blocked", tree: null, issues: [{ code, message }] }
}

function createSuffixProof(input: VNextTextBlockPersistentFlowBuildInputV1) {
  const semanticLineFingerprints = input.acceptedLayout.lines.map(
    createVNextTextBlockMultiRunSemanticLineFingerprintV1,
  )
  const semanticSuffixFingerprints = Array.from<string>({ length: semanticLineFingerprints.length })
  let suffix = createVNextCompactFingerprint("incremental-line-suffix:end:v1")
  for (let index = semanticLineFingerprints.length - 1; index >= 0; index -= 1) {
    suffix = createVNextCompactFingerprint(JSON.stringify({
      semanticLineFingerprint: semanticLineFingerprints[index],
      nextSuffixFingerprint: suffix,
    }))
    semanticSuffixFingerprints[index] = suffix
  }
  const rangeCheckpoints = createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1({
    measurement: input.request.measurement,
    shapingRuns: input.request.shapingRuns,
    lines: input.request.lines,
  })
  if (rangeCheckpoints == null) throw new RangeError("persistent flow requires safe semantic line checkpoints")
  return {
    semanticLineFingerprints,
    semanticRangeLineFingerprints: rangeCheckpoints.lineFingerprints,
    semanticSuffixFingerprints,
    semanticRangeSuffixFingerprints: rangeCheckpoints.suffixFingerprints,
  }
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
    const leaves = partitionVNextTextBlockPersistentValuesKernelV1(
      projected.items,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems,
    ).map(createVNextTextBlockPersistentFlowLeafInternalV1)
    const root = buildVNextTextBlockPersistentFlowRootInternalV1(leaves)
    const tree = createVNextTextBlockPersistentFlowTreeFromRootInternalV1({
      request: input.request,
      root,
      itemsByKind: projected.itemsByKind,
      suffixProof: createSuffixProof(input),
    })
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
  return [
    ...collectVNextTextBlockPersistentRopeNodesKernelV1({
      root: tree.root,
      children: (node) => node.nodeKind === "branch" ? node.children : [],
    }),
  ]
}
