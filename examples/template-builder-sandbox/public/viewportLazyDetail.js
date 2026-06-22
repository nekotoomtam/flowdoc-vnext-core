export const VIEWPORT_LAZY_DETAIL_SOURCE = "flowdoc-viewport-lazy-detail"
export const VIEWPORT_LAZY_DETAIL_MODE = "heavy-node-detail-plan"
export const DEFAULT_HEAVY_CHILD_COUNT = 4
export const DEFAULT_HEAVY_SUBTREE_NODE_COUNT = 8
export const DEFAULT_HEAVY_TEXT_LENGTH = 320

const HEAVY_NODE_TYPES = new Set(["columns", "table"])

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(Number(value)))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter((value) => typeof value === "string" && value.length > 0))]
}

function childrenForNode(childrenById, nodeId) {
  return childrenById?.get?.(nodeId) || []
}

function subtreeNodeCount(childrenById, nodeId, seen = new Set()) {
  if (!nodeId || seen.has(nodeId)) return 0
  seen.add(nodeId)

  return 1 + childrenForNode(childrenById, nodeId)
    .reduce((total, childId) => total + subtreeNodeCount(childrenById, childId, seen), 0)
}

function textLengthForNode(node) {
  if (Number.isFinite(node?.textLength)) return nonNegativeInteger(node.textLength)
  if (typeof node?.plainText === "string") return node.plainText.length
  if (typeof node?.textPreview === "string") return node.textPreview.length
  return 0
}

function activePathIds(activeNodeIds, parentById) {
  const activeIds = new Set(uniqueStrings(activeNodeIds))

  for (const nodeId of [...activeIds]) {
    let parentId = parentById?.get?.(nodeId)
    while (typeof parentId === "string" && parentId.length > 0 && !activeIds.has(parentId)) {
      activeIds.add(parentId)
      parentId = parentById?.get?.(parentId)
    }
  }

  return activeIds
}

function heavyReason(node, facts, thresholds) {
  if (node?.type === "zone") return null
  if (HEAVY_NODE_TYPES.has(node?.type)) return `${node.type}-detail`
  if (facts.subtreeNodeCount >= thresholds.subtreeNodeCount) return "large-subtree"
  if (facts.childCount >= thresholds.childCount) return "many-children"
  if (facts.textLength >= thresholds.textLength) return "large-text"
  return null
}

function lazyDetailFacts(node, childrenById, thresholds) {
  const childCount = childrenForNode(childrenById, node?.id).length
  const facts = {
    childCount,
    nodeId: stringOrNull(node?.id),
    nodeType: stringOrNull(node?.type),
    subtreeNodeCount: subtreeNodeCount(childrenById, node?.id),
    textLength: textLengthForNode(node),
  }
  const reason = heavyReason(node, facts, thresholds)

  return {
    ...facts,
    heavy: reason != null,
    reason,
  }
}

export function createViewportLazyDetailPlan(input = {}) {
  const nodeById = input.nodeById || new Map()
  const childrenById = input.childrenById || new Map()
  const activeIds = activePathIds(input.activeNodeIds, input.parentById || new Map())
  const expandedIds = new Set(uniqueStrings(input.expandedNodeIds))
  const visibleNodeIds = uniqueStrings(input.visibleNodeIds?.length ? input.visibleNodeIds : [...nodeById.keys()])
  const thresholds = {
    childCount: nonNegativeInteger(input.heavyChildCount, DEFAULT_HEAVY_CHILD_COUNT),
    subtreeNodeCount: nonNegativeInteger(input.heavySubtreeNodeCount, DEFAULT_HEAVY_SUBTREE_NODE_COUNT),
    textLength: nonNegativeInteger(input.heavyTextLength, DEFAULT_HEAVY_TEXT_LENGTH),
  }
  const detailByNodeId = new Map()
  const deferredNodeIds = []
  const heavyNodeIds = []
  const materializedHeavyNodeIds = []

  for (const nodeId of visibleNodeIds) {
    const node = nodeById.get(nodeId)
    if (!node) continue

    const detail = lazyDetailFacts(node, childrenById, thresholds)
    if (!detail.heavy) continue

    const protectedByContext = activeIds.has(nodeId) || expandedIds.has(nodeId)
    const nextDetail = {
      ...detail,
      deferred: !protectedByContext,
      protectedByContext,
      source: VIEWPORT_LAZY_DETAIL_SOURCE,
    }

    detailByNodeId.set(nodeId, nextDetail)
    heavyNodeIds.push(nodeId)
    if (nextDetail.deferred) {
      deferredNodeIds.push(nodeId)
    } else {
      materializedHeavyNodeIds.push(nodeId)
    }
  }

  return {
    deferredCount: deferredNodeIds.length,
    deferredNodeIds,
    detailByNodeId,
    heavyNodeCount: heavyNodeIds.length,
    heavyNodeIds,
    materializedHeavyNodeCount: materializedHeavyNodeIds.length,
    materializedHeavyNodeIds,
    mode: VIEWPORT_LAZY_DETAIL_MODE,
    source: VIEWPORT_LAZY_DETAIL_SOURCE,
    thresholds,
    version: 1,
    visibleNodeCount: visibleNodeIds.length,
  }
}
