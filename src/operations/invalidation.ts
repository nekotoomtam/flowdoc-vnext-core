import type { RelationshipGraph, NodeId, SectionId } from "../graph/relationshipGraph.js"
import type { VNextOperationRenderInvalidation, VNextOperationScope } from "./results.js"

export function createVNextOperationScopeFromNodes(
  graph: RelationshipGraph,
  nodeIds: NodeId[],
  parentIds: NodeId[] = [],
): VNextOperationScope {
  const sectionIds = new Set<SectionId>()
  const zoneIds = new Set<NodeId>()
  const tableIds = new Set<NodeId>()
  const textBlockIds = new Set<NodeId>()

  nodeIds.forEach((nodeId) => {
    const sectionId = graph.sectionByNodeId.get(nodeId)
    const nearest = graph.nearestByNodeId.get(nodeId)
    if (sectionId != null) sectionIds.add(sectionId)
    if (nearest?.zoneId != null) zoneIds.add(nearest.zoneId)
    if (nearest?.tableId != null) tableIds.add(nearest.tableId)
    if (nearest?.textBlockId != null) textBlockIds.add(nearest.textBlockId)
  })

  return {
    sectionIds: [...sectionIds],
    zoneIds: [...zoneIds],
    nodeIds: [...new Set(nodeIds)],
    parentNodeIds: [...new Set(parentIds)],
    tableIds: [...tableIds],
    textBlockIds: [...textBlockIds],
  }
}

export function createVNextOperationRenderInvalidation(
  lane: VNextOperationRenderInvalidation["lane"],
  scope: VNextOperationScope,
): VNextOperationRenderInvalidation {
  return {
    lane,
    affectedNodeIds: scope.nodeIds,
    affectedSectionIds: scope.sectionIds,
    pageScope: { kind: "unknown", reason: "pagination-not-integrated" },
  }
}

