export const RUNTIME_STORE_SOURCE = "flowdoc-structural-runtime-store"
export const RUNTIME_STORE_MODE = "structural-runtime-store"

function mapValuesById(ids, map) {
  return ids.map((id) => map.get(id)).filter(Boolean)
}

export function createRuntimeStore(snapshot, options = {}) {
  const previousStore = options.previousStore || null
  const nodeById = new Map()
  const parentById = new Map()
  const childrenById = new Map()
  const sectionById = new Map()
  const zoneById = new Map()
  const sectionIdByNodeId = new Map()
  const zoneIdByNodeId = new Map()
  const rootZoneIdsBySectionId = new Map()
  const nodeOrder = []
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

  return {
    childrenById,
    documentRevision: snapshot.session.documentRevision,
    mode: RUNTIME_STORE_MODE,
    nodeById,
    nodeCount: nodeOrder.length,
    nodeOrder,
    parentById,
    previousRevision: previousStore?.documentRevision ?? null,
    rootZoneIdsBySectionId,
    sectionById,
    sectionCount: sectionIds.length,
    sectionIdByNodeId,
    sectionIds,
    source: RUNTIME_STORE_SOURCE,
    version: 1,
    zoneById,
    zoneIdByNodeId,
  }
}

export function getRuntimeStoreNode(store, nodeId) {
  if (!store || !nodeId) return null
  return store.nodeById.get(nodeId) || null
}

export function getRuntimeStoreParent(store, nodeId) {
  if (!store || !nodeId) return null
  return getRuntimeStoreNode(store, store.parentById.get(nodeId))
}

export function getRuntimeStoreChildren(store, nodeId) {
  if (!store || !nodeId) return []
  return mapValuesById(store.childrenById.get(nodeId) || [], store.nodeById)
}

export function getRuntimeStoreSectionRootNodes(store, sectionId) {
  if (!store || !sectionId) return []
  return mapValuesById(store.rootZoneIdsBySectionId.get(sectionId) || [], store.nodeById)
}
