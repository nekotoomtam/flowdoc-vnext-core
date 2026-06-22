export const STRUCTURAL_COMMAND_POLICY_SOURCE = "flowdoc-structural-command-policy"
export const STRUCTURAL_COMMAND_POLICY_MODE = "structural-command-policy"

const INSERT_CONTAINER_TYPES = new Set(["zone", "column", "table-cell"])

function mapGet(mapLike, key) {
  if (!key || !mapLike) return null
  if (typeof mapLike.get === "function") return mapLike.get(key) || null
  return mapLike[key] || null
}

function childIdsFor(childrenById, nodeId) {
  const childIds = mapGet(childrenById, nodeId)
  return Array.isArray(childIds) ? childIds : []
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

export function nodeCanContainStructuralTextBlock(node) {
  return Boolean(node && INSERT_CONTAINER_TYPES.has(node.type))
}

export function structuralInsertTargetForNode(input = {}) {
  const node = input.node || null
  const mode = input.mode === "inside" ? "inside" : "after"
  const nodeById = input.nodeById
  const childrenById = input.childrenById

  if (!node) return null

  if (mode === "inside") {
    if (!nodeCanContainStructuralTextBlock(node)) return null
    return {
      index: childIdsFor(childrenById, node.id).length,
      parentNodeId: node.id,
      selectAfterNodeId: null,
    }
  }

  const parentNode = mapGet(nodeById, node.parentId)
  if (!nodeCanContainStructuralTextBlock(parentNode)) return null
  const siblings = childIdsFor(childrenById, node.parentId)
  const currentIndex = siblings.indexOf(node.id)
  if (currentIndex < 0) return null

  return {
    index: currentIndex + 1,
    parentNodeId: parentNode.id,
    selectAfterNodeId: node.id,
  }
}

export function structuralMoveTargetForNode(input = {}) {
  const node = input.node || null
  const direction = input.direction === "up" ? "up" : "down"
  if (!node?.canBeReordered) return null

  const siblings = childIdsFor(input.childrenById, node.parentId)
  const currentIndex = siblings.indexOf(node.id)
  if (currentIndex < 0) return null
  const toIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
  if (toIndex < 0 || toIndex >= siblings.length) return null

  return { toIndex }
}

function actionState(action, enabled, reason, target = null) {
  return {
    action,
    enabled: Boolean(enabled),
    reason,
    target,
  }
}

export function createStructuralCommandPolicy(input = {}) {
  const node = input.node || null
  const baseContext = {
    childrenById: input.childrenById,
    node,
    nodeById: input.nodeById,
  }
  const draftActive = Boolean(input.draftActive)
  const bridgeBusy = Boolean(input.bridgeBusy)
  const canUseStructuralCommands = Boolean(node && !draftActive)
  const baseBlockReason = draftActive
    ? "draft-active"
    : node
      ? bridgeBusy ? "bridge-busy" : "ready"
      : "missing-selection"
  const insertInsideTarget = structuralInsertTargetForNode({ ...baseContext, mode: "inside" })
  const insertAfterTarget = structuralInsertTargetForNode({ ...baseContext, mode: "after" })
  const moveUpTarget = structuralMoveTargetForNode({ ...baseContext, direction: "up" })
  const moveDownTarget = structuralMoveTargetForNode({ ...baseContext, direction: "down" })

  return {
    actions: {
      delete: actionState(
        "delete",
        node?.canBeDeleted && canUseStructuralCommands && !bridgeBusy,
        node?.canBeDeleted ? baseBlockReason : "not-deletable",
      ),
      "insert-after": actionState(
        "insert-after",
        insertAfterTarget && canUseStructuralCommands && !bridgeBusy,
        insertAfterTarget ? baseBlockReason : "invalid-insert-target",
        insertAfterTarget,
      ),
      "insert-inside": actionState(
        "insert-inside",
        insertInsideTarget && canUseStructuralCommands && !bridgeBusy,
        insertInsideTarget ? baseBlockReason : "invalid-insert-target",
        insertInsideTarget,
      ),
      "move-down": actionState(
        "move-down",
        moveDownTarget && canUseStructuralCommands && !bridgeBusy,
        moveDownTarget ? baseBlockReason : "cannot-move-down",
        moveDownTarget,
      ),
      "move-up": actionState(
        "move-up",
        moveUpTarget && canUseStructuralCommands && !bridgeBusy,
        moveUpTarget ? baseBlockReason : "cannot-move-up",
        moveUpTarget,
      ),
    },
    canUseStructuralCommands,
    mode: STRUCTURAL_COMMAND_POLICY_MODE,
    nodeId: stringOrNull(node?.id),
    source: STRUCTURAL_COMMAND_POLICY_SOURCE,
    structuralText: stringOrNull(input.structuralText) || "",
    version: 1,
  }
}

export function routeForStructuralAction(action) {
  if (action === "delete") return "./api/actions/delete-node?response=packet"
  if (action === "move-up" || action === "move-down") return "./api/actions/reorder-node?response=packet"
  return "./api/actions/insert-text-block?response=packet"
}

export function structuralActionRequest(input = {}) {
  const action = input.action
  const node = input.node || null
  if (!node) return null

  if (action === "delete") {
    if (!node.canBeDeleted) return null
    return {
      body: { nodeId: node.id },
      reason: "ready",
      selectNodeId: node.parentId || null,
    }
  }

  if (action === "move-up" || action === "move-down") {
    const target = structuralMoveTargetForNode({
      childrenById: input.childrenById,
      direction: action === "move-up" ? "up" : "down",
      node,
    })
    if (!target) return null
    return {
      body: { nodeId: node.id, toIndex: target.toIndex },
      reason: "ready",
      selectNodeId: node.id,
    }
  }

  const target = structuralInsertTargetForNode({
    childrenById: input.childrenById,
    mode: action === "insert-inside" ? "inside" : "after",
    node,
    nodeById: input.nodeById,
  })
  if (!target) return null

  return {
    body: {
      index: target.index,
      parentNodeId: target.parentNodeId,
      text: stringOrNull(input.structuralText) || "",
    },
    reason: "ready",
    selectNodeId: null,
  }
}

export function structuralSelectionAfterResult(result, fallbackNodeId) {
  if (!result?.ok || !result.packet) return fallbackNodeId
  if (result.packet.action === "text-block.insert") {
    return result.packet.nodesAdded?.[0]?.id || fallbackNodeId
  }
  if (result.packet.action === "node.delete") {
    const patch = result.packet.parentListPatches?.[0]
    return patch?.parentKind === "section" ? null : patch?.parentId || fallbackNodeId
  }
  return fallbackNodeId
}
