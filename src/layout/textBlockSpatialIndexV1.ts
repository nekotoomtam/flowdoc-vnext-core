import { inspectVNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowTreeV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY,
  type VNextTextBlockSpatialIndexBuildInputV1,
  type VNextTextBlockSpatialIndexBuildResultV1,
  type VNextTextBlockSpatialIndexInspectionV1,
  type VNextTextBlockSpatialIndexIssueV1,
  type VNextTextBlockSpatialIndexNodeV1,
  type VNextTextBlockSpatialIndexQueryResultV1,
  type VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  createSpatialIndexFromEntriesV1,
  deepFreezeSpatialV1,
  deeplyFrozenSpatialV1,
  hasSpatialIndexBindingV1,
  hasSpatialIndexProvenanceV1,
  parseSpatialEntriesV1,
  querySpatialNodesV1,
  spatialIssueV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import { hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1 } from "./textBlockPersistentFlowTreeInternalsV1.js"

function blocked(
  issues: VNextTextBlockSpatialIndexIssueV1[],
): VNextTextBlockSpatialIndexBuildResultV1 {
  return {
    status: "blocked",
    index: null,
    mayPublishLayout: false,
    productionBinding: false,
    issues,
  }
}

function blockedQuery(
  issues: VNextTextBlockSpatialIndexIssueV1[],
): VNextTextBlockSpatialIndexQueryResultV1 {
  return {
    status: "blocked",
    entries: null,
    work: null,
    issues,
  }
}

export function createVNextTextBlockSpatialIndexV1(
  input: VNextTextBlockSpatialIndexBuildInputV1,
): VNextTextBlockSpatialIndexBuildResultV1 {
  if (input.inputAuthority !== VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY) return blocked([
    spatialIssueV1(
      "input-authority-mismatch",
      "inputAuthority",
      "spatial index accepts strict Core synthetic QA inputs only",
    ),
  ])
  if (input.request.bindProductionLayout === true) return blocked([
    spatialIssueV1(
      "production-binding-forbidden",
      "request.bindProductionLayout",
      "spatial index cannot bind production layout",
    ),
  ])
  const treeInspection = inspectVNextTextBlockPersistentFlowTreeV1(input.persistentFlowTree)
  if (treeInspection.status !== "valid") return blocked([
    spatialIssueV1(
      "flow-tree-provenance-mismatch",
      "persistentFlowTree",
      treeInspection.message,
    ),
  ])
  if (!hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(
    input.persistentFlowTree,
    input.request,
  )) return blocked([
    spatialIssueV1(
      "flow-tree-request-binding-mismatch",
      "request",
      "spatial index requires the exact unchanged MR1 request bound to the persistent flow tree",
    ),
  ])
  const parsed = parseSpatialEntriesV1({
    values: input.entries,
    contentRightLayoutUnit: input.request.availableWidthLayoutUnit,
  })
  if (parsed.issues.length > 0) return blocked(parsed.issues)
  const index = createSpatialIndexFromEntriesV1({
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
    entries: parsed.entries,
  })
  return {
    status: "accepted",
    index,
    mayPublishLayout: false,
    productionBinding: false,
    issues: [],
  }
}

export function inspectVNextTextBlockSpatialIndexV1(
  index: unknown,
): VNextTextBlockSpatialIndexInspectionV1 {
  if (
    index == null
    || typeof index !== "object"
    || !hasSpatialIndexProvenanceV1(index)
  ) return {
    status: "invalid",
    code: "spatial-index-provenance-mismatch",
    message: "spatial index is not the exact process-local object created by Core",
  }
  if (!deeplyFrozenSpatialV1(index)) return {
    status: "invalid",
    code: "spatial-index-not-deeply-frozen",
    message: "registered spatial index must remain recursively frozen",
  }
  return {
    status: "valid",
    fingerprint: (index as VNextTextBlockSpatialIndexV1).fingerprint,
  }
}

export function collectVNextTextBlockSpatialIndexNodesForQaV1(
  index: VNextTextBlockSpatialIndexV1,
): VNextTextBlockSpatialIndexNodeV1[] {
  const nodes: VNextTextBlockSpatialIndexNodeV1[] = []
  const visit = (node: VNextTextBlockSpatialIndexNodeV1 | null): void => {
    if (node == null) return
    nodes.push(node)
    visit(node.left)
    visit(node.right)
  }
  visit(index.root)
  return nodes
}

export function queryVNextTextBlockSpatialIndexV1(input: {
  index: VNextTextBlockSpatialIndexV1
  persistentFlowTree: Parameters<typeof hasSpatialIndexBindingV1>[0]["persistentFlowTree"]
  request: Parameters<typeof hasSpatialIndexBindingV1>[0]["request"]
  band: { topLayoutUnit: number; bottomLayoutUnit: number }
}): VNextTextBlockSpatialIndexQueryResultV1 {
  if (
    !Number.isSafeInteger(input.band.topLayoutUnit)
    || !Number.isSafeInteger(input.band.bottomLayoutUnit)
    || input.band.topLayoutUnit < 0
    || input.band.bottomLayoutUnit <= input.band.topLayoutUnit
  ) return blockedQuery([
    spatialIssueV1(
      "invalid-query-band",
      "band",
      "spatial query requires a non-negative safe half-open band with bottom greater than top",
    ),
  ])
  const inspection = inspectVNextTextBlockSpatialIndexV1(input.index)
  if (inspection.status !== "valid") return blockedQuery([
    spatialIssueV1(
      "spatial-index-provenance-mismatch",
      "index",
      inspection.message,
    ),
  ])
  if (!hasSpatialIndexBindingV1(input)) return blockedQuery([
    spatialIssueV1(
      "spatial-index-stale",
      "index",
      "spatial query requires the exact index, persistent flow tree, and unchanged request",
    ),
  ])
  const query = querySpatialNodesV1({
    root: input.index.root,
    topLayoutUnit: input.band.topLayoutUnit,
    bottomLayoutUnit: input.band.bottomLayoutUnit,
  })
  return deepFreezeSpatialV1({
    status: "accepted",
    entries: query.entries,
    work: {
      visitedNodeCount: query.visitedNodeCount,
      matchedEntryCount: query.entries.length,
      completeIndexScanCount: 0,
    },
    issues: [],
  })
}
