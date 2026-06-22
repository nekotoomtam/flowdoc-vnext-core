import {
  createRuntimeStore,
  getRuntimeStoreChildren,
  getRuntimeStoreNode,
  getRuntimeStoreParent,
  getRuntimeStoreSectionRootNodes,
} from "./runtimeStore.js"
import { createVisibleRange } from "./visibleRange.js"
import { createBootVisibleRangeRequest, createVisibleRangeRequest } from "./visibleRangeRequest.js"

export const EDITOR_VIEW_SOURCE = "flowdoc-normalized-editor-view"
export const EDITOR_VIEW_MODE = "normalized-editor-view"

function addDirtyScopeIds(dirtyNodeIds, scope) {
  if (!scope) return
  if (scope.textBlockId) dirtyNodeIds.add(scope.textBlockId)
  if (scope.nodeId) dirtyNodeIds.add(scope.nodeId)
  ;(scope.textBlockIds || []).forEach((nodeId) => dirtyNodeIds.add(nodeId))
  ;(scope.nodeIds || []).forEach((nodeId) => dirtyNodeIds.add(nodeId))
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
  const previousView = options.previousView || null
  const runtimeStore = options.runtimeStore || createRuntimeStore(snapshot, {
    previousStore: previousView?.runtimeStore,
  })
  const visibleRangeRequest = createVisibleRangeRequest(
    options.visibleRangeRequest
      || options.visibleRange
      || previousView?.visibleRangeRequest
      || previousView?.visibleRange?.request
      || createBootVisibleRangeRequest(runtimeStore.sectionIds[0] || null),
  )
  const visibleRange = createVisibleRange({
    nodeOrder: runtimeStore.nodeOrder,
    sectionIdByNodeId: runtimeStore.sectionIdByNodeId,
    sectionIds: runtimeStore.sectionIds,
  }, visibleRangeRequest)
  const visibleNodeIds = visibleRange.nodeIds
  const packetIds = collectPacketIds(options.packet)

  return {
    changedNodeIds: packetIds.changedNodeIds,
    changedSubtreeIds: packetIds.changedSubtreeIds,
    childrenById: runtimeStore.childrenById,
    dirtyNodeIds: packetIds.dirtyNodeIds,
    documentRevision: snapshot.session.documentRevision,
    mode: EDITOR_VIEW_MODE,
    nodeById: runtimeStore.nodeById,
    nodeOrder: runtimeStore.nodeOrder,
    parentById: runtimeStore.parentById,
    previousRevision: previousView?.documentRevision ?? null,
    rootZoneIdsBySectionId: runtimeStore.rootZoneIdsBySectionId,
    runtimeStore,
    sectionById: runtimeStore.sectionById,
    sectionIdByNodeId: runtimeStore.sectionIdByNodeId,
    sectionIds: runtimeStore.sectionIds,
    source: EDITOR_VIEW_SOURCE,
    version: 1,
    visibleNodeIds,
    visibleRange,
    visibleRangeRequest: visibleRange.request,
    zoneById: runtimeStore.zoneById,
    zoneIdByNodeId: runtimeStore.zoneIdByNodeId,
  }
}

export function getEditorViewNode(view, nodeId) {
  return getRuntimeStoreNode(view?.runtimeStore, nodeId)
}

export function getEditorViewParent(view, nodeId) {
  return getRuntimeStoreParent(view?.runtimeStore, nodeId)
}

export function getEditorViewChildren(view, nodeId) {
  return getRuntimeStoreChildren(view?.runtimeStore, nodeId)
}

export function getEditorViewSectionRootNodes(view, sectionId) {
  return getRuntimeStoreSectionRootNodes(view?.runtimeStore, sectionId)
}
