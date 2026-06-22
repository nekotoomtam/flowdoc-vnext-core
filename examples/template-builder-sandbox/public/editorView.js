export const EDITOR_VIEW_SOURCE = "flowdoc-normalized-editor-view"
export const EDITOR_VIEW_MODE = "normalized-editor-view"

function mapValuesById(ids, map) {
  return ids.map((id) => map.get(id)).filter(Boolean)
}

function addDirtyScopeIds(dirtyNodeIds, scope) {
  if (!scope) return
  if (scope.textBlockId) dirtyNodeIds.add(scope.textBlockId)
  if (scope.nodeId) dirtyNodeIds.add(scope.nodeId)
  ;(scope.parentNodeIds || []).forEach((nodeId) => dirtyNodeIds.add(nodeId))
}

function collectPacketIds(packet) {
  const changedNodeIds = new Set(packet?.changedNodeIds || [])
  const changedSubtreeIds = new Set([
    ...(packet?.changedNodeIds || []),
    ...(packet?.affectedParentNodeIds || []),
  ])
  const dirtyNodeIds = new Set()

  ;(packet?.dirtyScopes || []).forEach((scope) => addDirtyScopeIds(dirtyNodeIds, scope))

  return { changedNodeIds, changedSubtreeIds, dirtyNodeIds }
}

export function createEditorView(snapshot, options = {}) {
  const nodeById = new Map()
  const parentById = new Map()
  const childrenById = new Map()
  const sectionById = new Map()
  const zoneById = new Map()
  const sectionIdByNodeId = new Map()
  const zoneIdByNodeId = new Map()
  const rootZoneIdsBySectionId = new Map()
  const nodeOrder = []
  const visibleNodeIds = []
  const sectionIds = []

  for (const section of snapshot.sections) {
    sectionById.set(section.id, section)
    sectionIds.push(section.id)
    rootZoneIdsBySectionId.set(section.id, section.zones.map((zone) => zone.id))

    const stack = section.zones
      .slice()
      .reverse()
      .map((zone) => ({
        node: zone,
        parentId: section.id,
      }))

    while (stack.length > 0) {
      const { node, parentId } = stack.pop()
      const childIds = (node.children || []).map((child) => child.id)

      nodeById.set(node.id, node)
      parentById.set(node.id, parentId ?? node.parentId ?? null)
      childrenById.set(node.id, childIds)
      sectionIdByNodeId.set(node.id, node.sectionId || section.id)
      zoneIdByNodeId.set(node.id, node.zoneId || node.id)
      nodeOrder.push(node.id)
      visibleNodeIds.push(node.id)

      if (node.type === "zone") {
        zoneById.set(node.id, node)
      }

      for (let index = (node.children || []).length - 1; index >= 0; index -= 1) {
        const child = node.children[index]
        stack.push({
          node: child,
          parentId: node.id,
        })
      }
    }
  }

  const packetIds = collectPacketIds(options.packet)
  const previousView = options.previousView || null

  return {
    changedNodeIds: packetIds.changedNodeIds,
    changedSubtreeIds: packetIds.changedSubtreeIds,
    childrenById,
    dirtyNodeIds: packetIds.dirtyNodeIds,
    documentRevision: snapshot.session.documentRevision,
    mode: EDITOR_VIEW_MODE,
    nodeById,
    nodeOrder,
    parentById,
    previousRevision: previousView?.documentRevision ?? null,
    rootZoneIdsBySectionId,
    sectionById,
    sectionIdByNodeId,
    sectionIds,
    source: EDITOR_VIEW_SOURCE,
    version: 1,
    visibleNodeIds,
    visibleRange: {
      kind: "all-nodes",
      nodeCount: visibleNodeIds.length,
      nodeIds: visibleNodeIds.slice(),
      sectionIds: sectionIds.slice(),
    },
    zoneById,
    zoneIdByNodeId,
  }
}

export function getEditorViewNode(view, nodeId) {
  if (!view || !nodeId) return null
  return view.nodeById.get(nodeId) || null
}

export function getEditorViewParent(view, nodeId) {
  if (!view || !nodeId) return null
  return getEditorViewNode(view, view.parentById.get(nodeId))
}

export function getEditorViewChildren(view, nodeId) {
  if (!view || !nodeId) return []
  return mapValuesById(view.childrenById.get(nodeId) || [], view.nodeById)
}

export function getEditorViewSectionRootNodes(view, sectionId) {
  if (!view || !sectionId) return []
  return mapValuesById(view.rootZoneIdsBySectionId.get(sectionId) || [], view.nodeById)
}
