import {
  createSelectionVisibleRangeRequest,
} from "./visibleRangeRequest.js"

export const STRUCTURAL_OUTLINE_NAVIGATION_SOURCE = "flowdoc-structural-outline-navigation"
export const STRUCTURAL_OUTLINE_NAVIGATION_MODE = "structural-outline-jump"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeRevision(value) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : null
}

export function createStructuralOutlineJumpRequest(input = {}) {
  const nodeId = stringOrNull(input.nodeId)
  const node = input.node && typeof input.node === "object" ? input.node : null
  const canJump = Boolean(nodeId && node?.id === nodeId)
  const visibleRangeRequest = canJump
    ? createSelectionVisibleRangeRequest(nodeId, input.previousVisibleRangeRequest, {
      draftActive: Boolean(input.draftActive),
    })
    : null

  return {
    anchorMode: "node-aware-selection",
    mode: STRUCTURAL_OUTLINE_NAVIGATION_MODE,
    nodeId,
    nodeType: stringOrNull(node?.type),
    ok: canJump,
    reason: canJump ? "outline-node" : "missing-node",
    requestedAtRevision: normalizeRevision(input.documentRevision),
    selectionSource: "outline",
    source: STRUCTURAL_OUTLINE_NAVIGATION_SOURCE,
    version: 1,
    visibleRangeRequest,
  }
}
