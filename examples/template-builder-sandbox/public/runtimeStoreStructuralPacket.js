export const RUNTIME_STORE_STRUCTURAL_PACKET_APPLY_MODE = "structural-packet-direct"

const STRUCTURAL_PACKET_SOURCE = "flowdoc-structural-packet"
const STRUCTURAL_PACKET_VERSION = 1
const STRUCTURAL_PACKET_STAGE = "foundation-bridge"

const INLINE_NODE_TYPES = new Set(["text", "field-ref", "page-number", "line-break"])

const NODE_CAPABILITIES = {
  zone: {
    canBeDeleted: false,
    canBeDuplicated: false,
    canBeReordered: false,
    canContainText: false,
    canSplitAcrossPages: false,
    operationSurface: "zone",
  },
  "text-block": {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: true,
    canSplitAcrossPages: true,
    operationSurface: "text-block",
  },
  columns: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "columns",
  },
  column: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "columns",
  },
  table: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "table",
  },
  "table-row": {
    canBeDeleted: false,
    canBeDuplicated: false,
    canBeReordered: false,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "table",
  },
  "table-cell": {
    canBeDeleted: false,
    canBeDuplicated: false,
    canBeReordered: false,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "table",
  },
  toc: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: true,
    operationSurface: "generated",
  },
  "page-break": {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: false,
    operationSurface: "utility",
  },
  divider: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: false,
    operationSurface: "utility",
  },
  spacer: {
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeReordered: true,
    canContainText: false,
    canSplitAcrossPages: false,
    operationSurface: "utility",
  },
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value))
}

function sameOrderedIds(left = [], right = []) {
  if (left.length !== right.length) return false
  return left.every((id, index) => id === right[index])
}

function structuralChildIdsForNode(node) {
  if (node?.type === "zone" || node?.type === "column" || node?.type === "table-cell") {
    return [...(node.childIds || [])]
  }
  if (node?.type === "columns") return [...(node.columnIds || [])]
  if (node?.type === "table") return [...(node.rowIds || [])]
  if (node?.type === "table-row") return [...(node.cellIds || [])]
  return []
}

export function isStructuralChangePacket(packet) {
  return packet?.source === STRUCTURAL_PACKET_SOURCE
    && packet.packetVersion === STRUCTURAL_PACKET_VERSION
    && packet.stage === STRUCTURAL_PACKET_STAGE
}

function copyStoreMaps(store) {
  return {
    childrenById: new Map(store.childrenById),
    nodeById: new Map(store.nodeById),
    parentById: new Map(store.parentById),
    rootZoneIdsBySectionId: new Map(store.rootZoneIdsBySectionId),
    sectionById: new Map(store.sectionById),
    sectionIdByNodeId: new Map(store.sectionIdByNodeId),
    zoneById: new Map(store.zoneById),
    zoneIdByNodeId: new Map(store.zoneIdByNodeId),
  }
}

function inlineText(inline) {
  if (inline.type === "text") return inline.text
  if (inline.type === "field-ref") return `{${inline.key}}`
  if (inline.type === "page-number") return "{page}"
  return "{line-break}"
}

function nodeRole(node) {
  if (node.type === "zone") return node.role || null
  if (node.type !== "text-block") return null

  if (typeof node.role === "string") return node.role
  if (node.role?.role === "heading") return `heading-${node.role.level}`
  if (node.role?.role === "list-item") return `list-item-${node.role.list?.level ?? 0}`
  return node.role?.role || null
}

function structuralInlineChildren(node) {
  if (node?.type !== "text-block" || !Array.isArray(node.children)) return null
  if (
    node.children.length === 0
    && (
      Object.prototype.hasOwnProperty.call(node, "plainText")
      || Object.prototype.hasOwnProperty.call(node, "textPreview")
      || Object.prototype.hasOwnProperty.call(node, "canReplacePlainText")
    )
  ) {
    return null
  }
  if (!node.children.every((child) => INLINE_NODE_TYPES.has(child?.type))) return null
  return node.children
}

function textFacts(node) {
  const inlineChildren = structuralInlineChildren(node)
  if (node?.type !== "text-block") {
    return {
      canReplacePlainText: false,
      canUseWysiwygDraft: false,
      fieldRefs: [],
      hasAtomicInline: false,
      hasStyledText: false,
      plainText: null,
      textLength: 0,
      textPreview: null,
      wysiwygDraftGuardReason: "target is not a text-block",
    }
  }

  if (inlineChildren == null) {
    return {
      canReplacePlainText: Boolean(node.canReplacePlainText),
      canUseWysiwygDraft: Boolean(node.canUseWysiwygDraft),
      fieldRefs: [...(node.fieldRefs || [])],
      hasAtomicInline: Boolean(node.hasAtomicInline),
      hasStyledText: Boolean(node.hasStyledText),
      plainText: node.plainText ?? null,
      textLength: Number.isFinite(node.textLength) ? node.textLength : 0,
      textPreview: node.textPreview ?? null,
      wysiwygDraftGuardReason: node.wysiwygDraftGuardReason ?? null,
    }
  }

  const preview = inlineChildren.map(inlineText).join("")
  const hasAtomicInline = inlineChildren.some((inline) => inline.type !== "text")
  const hasStyledText = inlineChildren.some((inline) => inline.type === "text" && inline.style != null)
  const canReplacePlainText = preview.length > 0 && !hasAtomicInline
  const canUseWysiwygDraft = canReplacePlainText && !hasStyledText
  const wysiwygDraftGuardReason = canUseWysiwygDraft
    ? null
    : preview.length === 0
      ? "empty text-blocks cannot start a browser draft yet"
      : hasAtomicInline
        ? "text-block contains atomic inline content"
        : hasStyledText
          ? "text-block contains styled text runs"
          : "text-block cannot be represented as a safe plain-text draft"

  return {
    canReplacePlainText,
    canUseWysiwygDraft,
    fieldRefs: inlineChildren.flatMap((inline) => inline.type === "field-ref" ? [inline.key] : []),
    hasAtomicInline,
    hasStyledText,
    plainText: canReplacePlainText ? preview : null,
    textLength: preview.length,
    textPreview: preview.length > 120 ? `${preview.slice(0, 117)}...` : preview,
    wysiwygDraftGuardReason,
  }
}

function normalizeRuntimeNode(node, context = {}) {
  const capabilities = NODE_CAPABILITIES[node.type] || {
    canBeDeleted: false,
    canBeDuplicated: false,
    canBeReordered: false,
    canContainText: false,
    canSplitAcrossPages: false,
    operationSurface: "unknown",
  }
  const text = textFacts(node)
  const childCount = context.childCount ?? structuralChildIdsForNode(node).length

  return {
    ...clonePlain(node),
    canBeDeleted: typeof node.canBeDeleted === "boolean" ? node.canBeDeleted : capabilities.canBeDeleted,
    canBeDuplicated: typeof node.canBeDuplicated === "boolean" ? node.canBeDuplicated : capabilities.canBeDuplicated,
    canBeReordered: typeof node.canBeReordered === "boolean" ? node.canBeReordered : capabilities.canBeReordered,
    canContainText: typeof node.canContainText === "boolean" ? node.canContainText : capabilities.canContainText,
    canReplacePlainText: text.canReplacePlainText,
    canSplitAcrossPages: typeof node.canSplitAcrossPages === "boolean"
      ? node.canSplitAcrossPages
      : capabilities.canSplitAcrossPages,
    canUseWysiwygDraft: text.canUseWysiwygDraft,
    childCount,
    children: [],
    depth: context.depth ?? node.depth ?? 0,
    fieldRefs: text.fieldRefs,
    hasAtomicInline: text.hasAtomicInline,
    hasStyledText: text.hasStyledText,
    id: node.id,
    parentId: context.parentId ?? node.parentId ?? null,
    parentKind: context.parentKind ?? node.parentKind ?? null,
    path: context.path ?? node.path ?? [node.id],
    plainText: text.plainText,
    role: nodeRole(node),
    sectionId: context.sectionId ?? node.sectionId ?? null,
    surface: node.surface || capabilities.operationSurface,
    textLength: text.textLength,
    textPreview: text.textPreview,
    type: node.type,
    wysiwygDraftGuardReason: text.wysiwygDraftGuardReason,
    zoneId: context.zoneId ?? node.zoneId ?? null,
  }
}

function parentKindForNode(maps, parentId, sectionId) {
  if (parentId == null) return null
  if (parentId === sectionId) return "section"
  return maps.nodeById.get(parentId)?.type ?? null
}

function rebuildStoreIndexes(store, maps) {
  const nodeById = new Map()
  const parentById = new Map()
  const sectionIdByNodeId = new Map()
  const zoneById = new Map()
  const zoneIdByNodeId = new Map()
  const nodeOrder = []
  const visited = new Set()
  const visiting = new Set()
  const sectionIds = [...(store.sectionIds || maps.sectionById.keys())]

  function visit(nodeId, sectionId, parentId, zoneId, depth, path) {
    if (visiting.has(nodeId)) {
      return { ok: false, reason: `structural packet created a cycle at ${nodeId}` }
    }
    if (visited.has(nodeId)) {
      return { ok: false, reason: `structural packet referenced node ${nodeId} more than once` }
    }

    const node = maps.nodeById.get(nodeId)
    if (!node) {
      return { ok: false, reason: `structural packet referenced missing node ${nodeId}` }
    }

    visiting.add(nodeId)
    const childIds = maps.childrenById.get(nodeId) || structuralChildIdsForNode(node)
    const currentZoneId = node.type === "zone" ? node.id : zoneId
    const currentPath = [...path, nodeId]
    const normalized = normalizeRuntimeNode(node, {
      childCount: childIds.length,
      depth,
      parentId,
      parentKind: parentKindForNode(maps, parentId, sectionId),
      path: currentPath,
      sectionId,
      zoneId: currentZoneId,
    })

    nodeById.set(nodeId, normalized)
    parentById.set(nodeId, parentId ?? null)
    sectionIdByNodeId.set(nodeId, sectionId)
    zoneIdByNodeId.set(nodeId, currentZoneId)
    nodeOrder.push(nodeId)
    if (normalized.type === "zone") zoneById.set(nodeId, normalized)

    for (const childId of childIds) {
      const result = visit(childId, sectionId, nodeId, currentZoneId, depth + 1, currentPath)
      if (!result.ok) return result
    }

    visiting.delete(nodeId)
    visited.add(nodeId)
    return { ok: true }
  }

  for (const sectionId of sectionIds) {
    if (!maps.sectionById.has(sectionId)) {
      return { ok: false, reason: `structural packet referenced missing section ${sectionId}` }
    }

    for (const rootId of maps.rootZoneIdsBySectionId.get(sectionId) || []) {
      const result = visit(rootId, sectionId, sectionId, rootId, 0, [])
      if (!result.ok) return result
    }
  }

  for (const nodeId of maps.nodeById.keys()) {
    if (!visited.has(nodeId)) {
      return { ok: false, reason: `structural packet left orphan node ${nodeId}` }
    }
  }

  return {
    ok: true,
    maps: {
      ...maps,
      nodeById,
      nodeOrder,
      parentById,
      sectionIdByNodeId,
      sectionIds,
      zoneById,
      zoneIdByNodeId,
    },
  }
}

function parentListForPatch(store, patch) {
  if (patch.parentKind === "section") {
    return store.rootZoneIdsBySectionId.get(patch.parentId) || []
  }
  return store.childrenById.get(patch.parentId) || []
}

function validateStructuralPacketForStore(store, packet) {
  if (!store) return { ok: false, reason: "missing runtime store" }
  if (!isStructuralChangePacket(packet)) return { ok: false, reason: "invalid structural packet" }
  if (packet.status !== "applied") return { ok: false, reason: `structural packet status ${packet.status} cannot be applied` }
  if (!Number.isFinite(packet.baseRevision) || !Number.isFinite(packet.nextRevision)) {
    return { ok: false, reason: "structural packet revisions must be finite numbers" }
  }
  if (packet.baseRevision !== store.documentRevision) {
    return {
      ok: false,
      reason: `structural packet base ${packet.baseRevision} did not match runtime store revision ${store.documentRevision}`,
    }
  }
  if (packet.nextRevision <= packet.baseRevision) {
    return { ok: false, reason: "applied structural packet must advance revision" }
  }

  const nodesAdded = packet.nodesAdded || []
  const nodesUpdated = packet.nodesUpdated || []
  const nodeIdsRemoved = packet.nodeIdsRemoved || []
  const parentListPatches = packet.parentListPatches || []
  if (
    !Array.isArray(nodesAdded)
    || !Array.isArray(nodesUpdated)
    || !Array.isArray(nodeIdsRemoved)
    || !Array.isArray(parentListPatches)
  ) {
    return { ok: false, reason: "structural packet change lists must be arrays" }
  }

  const addedIds = new Set(nodesAdded.map((node) => node.id))
  const removedIds = new Set(nodeIdsRemoved)
  const updatedIds = new Set(nodesUpdated.map((node) => node.id))

  for (const node of nodesAdded) {
    if (!node?.id || !node.type) return { ok: false, reason: "structural packet added node was malformed" }
    if (store.nodeById.has(node.id) && !removedIds.has(node.id)) {
      return { ok: false, reason: `structural packet added existing node ${node.id}` }
    }
  }

  for (const nodeId of nodeIdsRemoved) {
    if (!store.nodeById.has(nodeId)) {
      return { ok: false, reason: `structural packet removed missing node ${nodeId}` }
    }
  }

  for (const node of nodesUpdated) {
    if (!node?.id || !node.type) return { ok: false, reason: "structural packet updated node was malformed" }
    if (!store.nodeById.has(node.id) && !addedIds.has(node.id)) {
      return { ok: false, reason: `structural packet updated missing node ${node.id}` }
    }
  }

  for (const patch of parentListPatches) {
    if (!patch?.parentId || !Array.isArray(patch.before) || !Array.isArray(patch.after)) {
      return { ok: false, reason: "structural packet parent-list patch was malformed" }
    }
    if (patch.parentKind === "section") {
      if (!store.sectionById.has(patch.parentId)) {
        return { ok: false, reason: `structural packet patch referenced missing section ${patch.parentId}` }
      }
    } else if (!store.nodeById.has(patch.parentId) && !updatedIds.has(patch.parentId) && !addedIds.has(patch.parentId)) {
      return { ok: false, reason: `structural packet patch referenced missing parent ${patch.parentId}` }
    }

    const currentBefore = parentListForPatch(store, patch)
    if (!sameOrderedIds(currentBefore, patch.before)) {
      return { ok: false, reason: `structural packet parent list for ${patch.parentId} was stale` }
    }

    for (const childId of patch.after) {
      if (removedIds.has(childId)) {
        return { ok: false, reason: `structural packet parent list kept removed node ${childId}` }
      }
      if (!store.nodeById.has(childId) && !addedIds.has(childId) && !updatedIds.has(childId)) {
        return { ok: false, reason: `structural packet parent list referenced missing child ${childId}` }
      }
    }
  }

  return { ok: true }
}

export function applyStructuralChangePacketToRuntimeStore(store, packet) {
  const validation = validateStructuralPacketForStore(store, packet)
  if (!validation.ok) return validation

  const maps = copyStoreMaps(store)

  for (const nodeId of packet.nodeIdsRemoved || []) {
    maps.childrenById.delete(nodeId)
    maps.nodeById.delete(nodeId)
    maps.parentById.delete(nodeId)
    maps.sectionIdByNodeId.delete(nodeId)
    maps.zoneById.delete(nodeId)
    maps.zoneIdByNodeId.delete(nodeId)
  }

  for (const node of packet.nodesAdded || []) {
    maps.nodeById.set(node.id, normalizeRuntimeNode(node, {
      childCount: structuralChildIdsForNode(node).length,
    }))
    maps.childrenById.set(node.id, structuralChildIdsForNode(node))
  }

  for (const node of packet.nodesUpdated || []) {
    maps.nodeById.set(node.id, normalizeRuntimeNode(node, {
      childCount: structuralChildIdsForNode(node).length,
    }))
    maps.childrenById.set(node.id, structuralChildIdsForNode(node))
  }

  for (const patch of packet.parentListPatches || []) {
    if (patch.parentKind === "section") {
      maps.rootZoneIdsBySectionId.set(patch.parentId, [...patch.after])
    } else {
      maps.childrenById.set(patch.parentId, [...patch.after])
    }
  }

  const rebuilt = rebuildStoreIndexes(store, maps)
  if (!rebuilt.ok) return rebuilt

  return {
    ok: true,
    applyMode: RUNTIME_STORE_STRUCTURAL_PACKET_APPLY_MODE,
    runtimeStore: {
      ...store,
      ...rebuilt.maps,
      documentRevision: packet.nextRevision,
      lastAppliedPacketRevision: packet.nextRevision,
      lastAppliedStructuralPacketAction: packet.action,
      lastApplyMode: RUNTIME_STORE_STRUCTURAL_PACKET_APPLY_MODE,
      nodeCount: rebuilt.maps.nodeOrder.length,
      previousRevision: store.documentRevision,
      sectionCount: rebuilt.maps.sectionIds.length,
    },
  }
}
