export const VIEWPORT_NODE_ANCHOR_SOURCE = "flowdoc-viewport-node-anchor"
export const VIEWPORT_NODE_ANCHOR_MODE = "node-aware-scroll-anchor"
export const VIEWPORT_NODE_ANCHOR_RESTORE_MODE = "node-aware-anchor-restore"

function nonNegativeNumber(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Number(value))
}

function positiveNumber(value, fallback = 1) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Number(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function findSection(measurement, sectionId) {
  return (measurement?.sections || []).find((section) => section.id === sectionId) || null
}

export function createViewportNodeAnchor(input = {}) {
  const nodeTop = nonNegativeNumber(input.nodeTop, nonNegativeNumber(input.sectionTop, 0))
  const sectionTop = nonNegativeNumber(input.sectionTop, 0)
  const measuredOffset = Number.isFinite(input.offsetInSection)
    ? Number(input.offsetInSection)
    : nodeTop - sectionTop

  return {
    kind: "node",
    measuredAtRevision: input.measuredAtRevision ?? null,
    mode: VIEWPORT_NODE_ANCHOR_MODE,
    nodeHeight: positiveNumber(input.nodeHeight, 1),
    nodeId: stringOrNull(input.nodeId),
    nodeTop,
    nodeType: stringOrNull(input.nodeType),
    offsetInSection: nonNegativeNumber(measuredOffset, 0),
    scrollTop: nonNegativeNumber(input.scrollTop, 0),
    sectionId: stringOrNull(input.sectionId),
    sectionTop,
    source: VIEWPORT_NODE_ANCHOR_SOURCE,
    version: 1,
    viewportHeight: positiveNumber(input.viewportHeight, 1),
  }
}

export function resolveViewportNodeAnchorScrollTop(input = {}) {
  const anchor = input.anchor?.source === VIEWPORT_NODE_ANCHOR_SOURCE
    ? input.anchor
    : createViewportNodeAnchor(input.anchor || input)
  const measurement = input.measurement || null
  const section = anchor.sectionId ? findSection(measurement, anchor.sectionId) : null
  const fallbackScrollTop = nonNegativeNumber(
    input.fallbackScrollTop ?? anchor.scrollTop ?? measurement?.scrollTop,
    0,
  )
  const viewportHeight = positiveNumber(measurement?.viewportHeight ?? anchor.viewportHeight, 1)
  const scrollHeight = positiveNumber(measurement?.scrollHeight, fallbackScrollTop + viewportHeight)
  const maxScrollTop = Math.max(0, scrollHeight - viewportHeight)

  if (!section) {
    return {
      anchor,
      mode: VIEWPORT_NODE_ANCHOR_RESTORE_MODE,
      reason: "section-missing",
      restored: false,
      scrollTop: clamp(fallbackScrollTop, 0, maxScrollTop),
      source: VIEWPORT_NODE_ANCHOR_SOURCE,
      version: 1,
    }
  }

  return {
    anchor,
    mode: VIEWPORT_NODE_ANCHOR_RESTORE_MODE,
    reason: "node-anchor",
    restored: true,
    scrollTop: clamp(nonNegativeNumber(section.top, 0) + anchor.offsetInSection, 0, maxScrollTop),
    source: VIEWPORT_NODE_ANCHOR_SOURCE,
    version: 1,
  }
}
