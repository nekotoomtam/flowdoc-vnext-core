import { createVisibleRangeRequest } from "./visibleRangeRequest.js"

export const VISIBLE_RANGE_SOURCE = "flowdoc-visible-range"
export const VISIBLE_RANGE_KIND = "section-window"

function positiveInteger(value, fallback) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

function nonNegativeInteger(value, fallback) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(value))
}

function sectionIndex(sectionIds, sectionId) {
  const index = sectionIds.indexOf(sectionId)
  return index >= 0 ? index : 0
}

function nodeIdsForSections(nodeOrder, sectionIdByNodeId, sectionIds) {
  const allowedSectionIds = new Set(sectionIds)
  return nodeOrder.filter((nodeId) => allowedSectionIds.has(sectionIdByNodeId.get(nodeId)))
}

function allNodesRange(indexes, options) {
  const nodeOrder = indexes.nodeOrder || []
  const sectionIds = indexes.sectionIds || []
  const request = createVisibleRangeRequest(options)

  return {
    anchorNodeId: request.anchorNodeId,
    anchorSectionId: request.anchorSectionId || sectionIds[0] || null,
    endSectionIndex: sectionIds.length === 0 ? -1 : sectionIds.length - 1,
    kind: "all-nodes",
    maxNodes: nodeOrder.length,
    nodeCount: nodeOrder.length,
    nodeIds: nodeOrder.slice(),
    request,
    sectionCount: sectionIds.length,
    sectionIds: sectionIds.slice(),
    source: VISIBLE_RANGE_SOURCE,
    startSectionIndex: sectionIds.length === 0 ? -1 : 0,
    totalNodeCount: nodeOrder.length,
    totalSectionCount: sectionIds.length,
    truncated: false,
    version: 1,
    windowed: false,
  }
}

export function createVisibleRange(indexes, options = {}) {
  const request = createVisibleRangeRequest(options)
  const nodeOrder = indexes.nodeOrder || []
  const sectionIds = indexes.sectionIds || []
  const sectionIdByNodeId = indexes.sectionIdByNodeId || new Map()

  if (request.kind === "all-nodes") {
    return allNodesRange(indexes, request)
  }

  const anchorSectionId = request.anchorSectionId
    || sectionIdByNodeId.get(request.anchorNodeId)
    || sectionIds[0]
    || null
  const anchorIndex = anchorSectionId == null ? -1 : sectionIndex(sectionIds, anchorSectionId)
  const overscanSectionsBefore = nonNegativeInteger(request.overscanSectionsBefore, 0)
  const overscanSectionsAfter = nonNegativeInteger(request.overscanSectionsAfter, 0)
  const maxNodes = positiveInteger(request.budget.maxNodes, nodeOrder.length || 1)
  const startSectionIndex = anchorIndex < 0 ? -1 : Math.max(0, anchorIndex - overscanSectionsBefore)
  const endSectionIndex = anchorIndex < 0
    ? -1
    : Math.min(sectionIds.length - 1, anchorIndex + overscanSectionsAfter)
  const windowSectionIds = startSectionIndex < 0
    ? []
    : sectionIds.slice(startSectionIndex, endSectionIndex + 1)
  const rangeNodeIds = nodeIdsForSections(nodeOrder, sectionIdByNodeId, windowSectionIds)
  const nodeIds = rangeNodeIds.slice(0, maxNodes)
  const truncated = rangeNodeIds.length > nodeIds.length

  return {
    anchorNodeId: options.anchorNodeId || null,
    anchorSectionId,
    endSectionIndex,
    kind: VISIBLE_RANGE_KIND,
    maxNodes,
    nodeCount: nodeIds.length,
    nodeIds,
    request: createVisibleRangeRequest({
      ...request,
      anchorSectionId,
      budget: {
        ...request.budget,
        maxNodes: request.budget.maxNodes,
      },
    }),
    sectionCount: windowSectionIds.length,
    sectionIds: windowSectionIds,
    source: VISIBLE_RANGE_SOURCE,
    startSectionIndex,
    totalNodeCount: nodeOrder.length,
    totalSectionCount: sectionIds.length,
    truncated,
    version: 1,
    windowed: nodeIds.length < nodeOrder.length,
  }
}
