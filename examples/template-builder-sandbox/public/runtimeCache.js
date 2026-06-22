import { createEditorView } from "./editorView.js"
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
    visibleRangeRequest: visibleRangeRequest || undefined,
  })
  const packetApplied = Boolean(options.packetApplied)
  const previousPacketCount = previousCache?.packetsApplied || 0
  const fallbackSnapshotCount = options.fallbackSnapshotCount ?? previousCache?.fallbackSnapshotCount ?? 0

  return {
    bootRevision: previousCache?.bootRevision ?? snapshot.session.documentRevision,
    changedNodeCount: editorView.changedNodeIds.size,
    childrenById: editorView.childrenById,
    documentRevision: snapshot.session.documentRevision,
    dirtyNodeCount: editorView.dirtyNodeIds.size,
    editorView,
    fallbackSnapshotCount,
    lastPacketRevision: options.packet?.nextRevision ?? previousCache?.lastPacketRevision ?? null,
    mode: options.mode || (packetApplied ? "packet-cache" : "snapshot-boot"),
    nodeById: editorView.nodeById,
    nodeCount: editorView.nodeOrder.length,
    nodeOrder: editorView.nodeOrder,
    packetsApplied: packetApplied ? previousPacketCount + 1 : previousPacketCount,
    parentById: editorView.parentById,
    sectionById: editorView.sectionById,
    source: RUNTIME_CACHE_SOURCE,
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
    zoneById: editorView.zoneById,
  }
}

export function createVisibleRangeRuntimeState(snapshot, previousCache, visibleRangeRequest) {
  return {
    runtimeCache: createRuntimeCache(snapshot, {
      mode: previousCache?.mode || "visible-range",
      previousCache,
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
      sections,
      session: {
        ...snapshot.session,
        dirtyScopeCount: packet.dirtyScopes.length,
        documentRevision: packet.nextRevision,
      },
    },
  }
}

export function applyChangePacketToRuntime(snapshot, previousCache, packet) {
  const packetResult = applyChangePacketToSnapshot(snapshot, packet)
  if (!packetResult.ok) return packetResult

  return {
    ok: true,
    packet,
    runtimeCache: createRuntimeCache(packetResult.snapshot, {
      packet,
      packetApplied: true,
      previousCache,
    }),
    snapshot: packetResult.snapshot,
  }
}
