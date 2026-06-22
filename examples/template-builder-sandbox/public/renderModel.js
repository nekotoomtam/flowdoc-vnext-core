export const STORE_BACKED_RENDER_MODEL_SOURCE = "flowdoc-store-backed-render-model"
export const STORE_BACKED_RENDER_MODEL_MODE = "store-backed-render-model"

function mapNodesById(ids, map) {
  return ids.map((id) => map.get(id)).filter(Boolean)
}

function fallbackSectionShells(snapshot) {
  return (snapshot?.sections || []).map((section) => ({
    id: section.id,
    page: section.page,
    rootZoneIds: section.zones.map((zone) => zone.id),
    rootZoneCount: section.zones.length,
    visible: true,
  }))
}

export function createStoreBackedRenderModel(snapshot, runtimeCache) {
  const runtimeStore = runtimeCache?.runtimeStore || null
  const snapshotSectionById = new Map((snapshot?.sections || []).map((section) => [section.id, section]))
  const visibleSectionIds = runtimeCache?.visibleSectionIds || []
  const sectionIds = runtimeStore?.sectionIds || (snapshot?.sections || []).map((section) => section.id)
  const sections = runtimeStore
    ? sectionIds.map((sectionId) => {
      const snapshotSection = snapshotSectionById.get(sectionId)
      const rootZoneIds = runtimeStore.rootZoneIdsBySectionId.get(sectionId) || []

      return {
        id: sectionId,
        page: snapshotSection?.page || "unknown",
        rootZoneIds,
        rootZoneCount: rootZoneIds.length,
        visible: visibleSectionIds.length === 0 || visibleSectionIds.includes(sectionId),
      }
    })
    : fallbackSectionShells(snapshot)

  return {
    childrenById: runtimeStore?.childrenById || new Map(),
    documentRevision: runtimeStore?.documentRevision ?? snapshot?.session?.documentRevision ?? null,
    mode: STORE_BACKED_RENDER_MODEL_MODE,
    nodeById: runtimeStore?.nodeById || new Map(),
    nodeCount: runtimeStore?.nodeCount ?? snapshot?.counts?.nodes ?? 0,
    runtimeStore,
    sectionCount: sections.length,
    sections,
    source: STORE_BACKED_RENDER_MODEL_SOURCE,
    version: 1,
    visibleSectionIds,
  }
}

export function getStoreBackedRenderNode(renderModel, nodeId) {
  if (!renderModel || !nodeId) return null
  return renderModel.nodeById.get(nodeId) || null
}

export function getStoreBackedRenderChildren(renderModel, nodeId) {
  if (!renderModel || !nodeId) return []
  return mapNodesById(renderModel.childrenById.get(nodeId) || [], renderModel.nodeById)
}

export function getStoreBackedRenderSectionRootNodes(renderModel, sectionId) {
  if (!renderModel || !sectionId) return []
  const section = renderModel.sections.find((item) => item.id === sectionId)
  return mapNodesById(section?.rootZoneIds || [], renderModel.nodeById)
}
