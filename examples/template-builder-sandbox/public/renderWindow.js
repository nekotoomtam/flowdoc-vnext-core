export const RENDER_WINDOW_SOURCE = "flowdoc-render-window"
export const RENDER_WINDOW_MODE = "visible-range-render-window"

function uniqueIds(ids) {
  return [...new Set((ids || []).filter((id) => typeof id === "string" && id.length > 0))]
}

function sectionWindowIds(sections, visibleRange) {
  const knownSectionIds = new Set(sections.map((section) => section.id))
  const requestedIds = uniqueIds(visibleRange?.sectionIds)
  if (requestedIds.length === 0) return sections.map((section) => section.id)
  return requestedIds.filter((sectionId) => knownSectionIds.has(sectionId))
}

export function createRenderWindow({ sections = [], visibleRange = null, nodeIds = [] } = {}) {
  const sectionIds = sectionWindowIds(sections, visibleRange)
  const sectionIdSet = new Set(sectionIds)
  const windowNodeIds = uniqueIds(visibleRange?.nodeIds?.length ? visibleRange.nodeIds : nodeIds)
  const nodeIdSet = new Set(windowNodeIds)

  return {
    anchorNodeId: visibleRange?.anchorNodeId || null,
    anchorSectionId: visibleRange?.anchorSectionId || sectionIds[0] || null,
    kind: visibleRange?.kind || "all-sections",
    maxNodes: visibleRange?.maxNodes ?? windowNodeIds.length,
    mode: RENDER_WINDOW_MODE,
    nodeCount: windowNodeIds.length,
    nodeIds: windowNodeIds,
    nodeIdSet,
    reason: visibleRange?.request?.reason || null,
    sectionCount: sectionIds.length,
    sectionIds,
    sectionIdSet,
    sections: sections.filter((section) => sectionIdSet.has(section.id)),
    source: RENDER_WINDOW_SOURCE,
    totalNodeCount: visibleRange?.totalNodeCount ?? windowNodeIds.length,
    totalSectionCount: visibleRange?.totalSectionCount ?? sections.length,
    truncated: Boolean(visibleRange?.truncated),
    version: 1,
    windowed: visibleRange?.windowed ?? sectionIds.length < sections.length,
  }
}

export function getRenderWindowSections(renderWindow) {
  return renderWindow?.sections || []
}

export function isNodeInRenderWindow(renderWindow, nodeId) {
  if (!renderWindow || !nodeId) return false
  return renderWindow.nodeIdSet.has(nodeId)
}

export function isSectionInRenderWindow(renderWindow, sectionId) {
  if (!renderWindow || !sectionId) return false
  return renderWindow.sectionIdSet.has(sectionId)
}
