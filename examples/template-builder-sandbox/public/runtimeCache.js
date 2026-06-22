import { createEditorView } from "./editorView.js"
import { applyTextChangePacketToRuntimeStore } from "./runtimeStore.js"
import {
  createVisibleRangeRequest,
  preserveVisibleRangeRequest,
} from "./visibleRangeRequest.js"

export const RUNTIME_CACHE_SOURCE = "flowdoc-template-builder-runtime-cache"

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value))
}

function replaceChangedNode(node, changedNodes) {
  const replacement = changedNodes.get(node.id)
  if (replacement) return clonePlain(replacement)

  let childrenChanged = false
  const children = node.children.map((child) => {
    const nextChild = replaceChangedNode(child, changedNodes)
    if (nextChild !== child) childrenChanged = true
    return nextChild
  })

  return childrenChanged ? { ...node, children } : node
}

export function isChangePacket(packet) {
  return packet?.source === "flowdoc-template-builder-change-packet" && packet.packetVersion === 1
}

export function createRuntimeCache(snapshot, options = {}) {
  const previousCache = options.previousCache || null
  const runtimeStoreInput = options.runtimeStore || null
  const visibleRangeRequestInput =
    options.visibleRangeRequest
    || options.visibleRange
    || (
      options.packetApplied && previousCache?.visibleRangeRequest
        ? preserveVisibleRangeRequest(previousCache.visibleRangeRequest)
        : previousCache?.visibleRangeRequest
    )
    || previousCache?.visibleRange?.request
  const visibleRangeRequest = visibleRangeRequestInput
    ? createVisibleRangeRequest(visibleRangeRequestInput)
    : null
  const editorView = createEditorView(snapshot, {
    packet: options.packet,
    previousView: previousCache?.editorView,
    runtimeStore: runtimeStoreInput || undefined,
    visibleRangeRequest: visibleRangeRequest || undefined,
  })
  const packetApplied = Boolean(options.packetApplied)
  const previousPacketCount = previousCache?.packetsApplied || 0
  const fallbackSnapshotCount = options.fallbackSnapshotCount ?? previousCache?.fallbackSnapshotCount ?? 0
  const runtimeStore = editorView.runtimeStore

  return {
    bootRevision: previousCache?.bootRevision ?? snapshot.session.documentRevision,
    changedNodeCount: editorView.changedNodeIds.size,
    childrenById: runtimeStore.childrenById,
    documentRevision: snapshot.session.documentRevision,
    dirtyNodeCount: editorView.dirtyNodeIds.size,
    editorView,
    fallbackSnapshotCount,
    lastPacketRevision: options.packet?.nextRevision ?? previousCache?.lastPacketRevision ?? null,
    mode: options.mode || (packetApplied ? "packet-cache" : "snapshot-boot"),
    nodeById: runtimeStore.nodeById,
    nodeCount: runtimeStore.nodeOrder.length,
    nodeOrder: runtimeStore.nodeOrder,
    packetsApplied: packetApplied ? previousPacketCount + 1 : previousPacketCount,
    parentById: runtimeStore.parentById,
    runtimeStore,
    runtimeStoreApplyMode: runtimeStore.lastApplyMode || options.runtimeStoreApplyMode || null,
    runtimeStoreMode: runtimeStore.mode,
    runtimeStoreSource: runtimeStore.source,
    sectionById: runtimeStore.sectionById,
    source: RUNTIME_CACHE_SOURCE,
    storeMode: runtimeStore.mode,
    storeSource: runtimeStore.source,
    viewMode: editorView.mode,
    visibleNodeCount: editorView.visibleNodeIds.length,
    visibleNodeIds: editorView.visibleNodeIds,
    visibleRange: editorView.visibleRange,
    visibleRangeRequest: editorView.visibleRangeRequest,
    visibleRangeRequestReason: editorView.visibleRangeRequest.reason,
    visibleRangeRequestSource: editorView.visibleRangeRequest.source,
    visibleRangeKind: editorView.visibleRange.kind,
    visibleRangeSource: editorView.visibleRange.source,
    visibleRangeWindowed: editorView.visibleRange.windowed,
    visibleSectionIds: editorView.visibleRange.sectionIds,
    zoneById: runtimeStore.zoneById,
  }
}

export function createVisibleRangeRuntimeState(snapshot, previousCache, visibleRangeRequest) {
  const runtimeStore = previousCache?.runtimeStore?.documentRevision === snapshot.session.documentRevision
    ? previousCache.runtimeStore
    : null

  return {
    runtimeCache: createRuntimeCache(snapshot, {
      mode: previousCache?.mode || "visible-range",
      previousCache,
      runtimeStore,
      visibleRangeRequest,
    }),
    snapshot,
  }
}

export function createBootRuntimeState(snapshot) {
  return {
    runtimeCache: createRuntimeCache(snapshot),
    snapshot,
  }
}

export function createRefreshRuntimeState(snapshot, previousCache) {
  const fallbackSnapshotCount = (previousCache?.fallbackSnapshotCount || 0) + 1

  return {
    runtimeCache: createRuntimeCache(snapshot, {
      fallbackSnapshotCount,
      mode: "snapshot-refresh",
      previousCache,
    }),
    snapshot,
  }
}

export function applyChangePacketMetadataToSnapshot(snapshot, packet) {
  return {
    ...snapshot,
    diagnostics: packet.diagnostics || snapshot.diagnostics,
    authoringHistory: packet.authoringHistory || snapshot.authoringHistory,
    liveLayout: packet.liveLayout || snapshot.liveLayout,
    mutationBridge: {
      ...snapshot.mutationBridge,
      documentRevision: packet.nextRevision,
      mode: "in-memory-bridge",
      mutationCount: packet.mutationCount,
      lastMutation: packet.mutation,
    },
    session: {
      ...snapshot.session,
      dirtyScopeCount: (packet.dirtyScopes || []).length,
      documentRevision: packet.nextRevision,
    },
  }
}

export function applyChangePacketToSnapshot(snapshot, packet) {
  if (!snapshot || !isChangePacket(packet)) {
    return { ok: false, reason: "invalid change packet" }
  }

  if (packet.snapshotRequired) {
    return { ok: false, reason: "packet requested snapshot refresh" }
  }

  if (packet.baseRevision !== snapshot.session.documentRevision) {
    return {
      ok: false,
      reason: `packet base ${packet.baseRevision} did not match local revision ${snapshot.session.documentRevision}`,
    }
  }

  const changedNodes = new Map((packet.changedNodes || []).map((node) => [node.id, node]))
  const sections = snapshot.sections.map((section) => ({
    ...section,
    zones: section.zones.map((zone) => replaceChangedNode(zone, changedNodes)),
  }))

  return {
    ok: true,
    snapshot: {
      ...applyChangePacketMetadataToSnapshot(snapshot, packet),
      sections,
    },
  }
}

export function applyChangePacketToRuntime(snapshot, previousCache, packet) {
  if (!snapshot || !isChangePacket(packet)) {
    return { ok: false, reason: "invalid change packet" }
  }

  if (packet.snapshotRequired) {
    return { ok: false, reason: "packet requested snapshot refresh" }
  }

  const localRevision = previousCache?.runtimeStore?.documentRevision
    ?? previousCache?.documentRevision
    ?? snapshot.session.documentRevision

  if (packet.baseRevision !== localRevision) {
    return {
      ok: false,
      reason: `packet base ${packet.baseRevision} did not match local revision ${localRevision}`,
    }
  }

  const storeResult = applyTextChangePacketToRuntimeStore(previousCache?.runtimeStore, packet)
  if (!storeResult.ok) {
    if (!previousCache?.runtimeStore) {
      const snapshotResult = applyChangePacketToSnapshot(snapshot, packet)
      if (!snapshotResult.ok) return snapshotResult

      return {
        ok: true,
        packet,
        runtimeCache: createRuntimeCache(snapshotResult.snapshot, {
          packet,
          packetApplied: true,
          previousCache,
        }),
        snapshot: snapshotResult.snapshot,
      }
    }

    return {
      ok: false,
      reason: `runtime store direct apply rejected: ${storeResult.reason}`,
    }
  }

  const packetSnapshot = applyChangePacketMetadataToSnapshot(snapshot, packet)

  return {
    ok: true,
    packet,
    runtimeCache: createRuntimeCache(packetSnapshot, {
      packet,
      packetApplied: true,
      previousCache,
      runtimeStore: storeResult.runtimeStore,
      runtimeStoreApplyMode: storeResult.applyMode,
    }),
    runtimeStoreApplyMode: storeResult.applyMode,
    snapshot: packetSnapshot,
  }
}
