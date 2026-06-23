export const DRAFT_CONTENTEDITABLE_SURFACE_HARDENING_SOURCE = "flowdoc-template-builder-draft-contenteditable-surface-hardening"
export const DRAFT_CONTENTEDITABLE_SURFACE_HARDENING_MODE = "browser-local-production-contenteditable-surface-hardening-boundary"

const TEXT_NODE = 3
const ELEMENT_NODE = 1
const ATOMIC_SEGMENT_KINDS = new Set(["atomic-inline", "field-chip", "inline-field"])

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function datasetOf(node) {
  return node?.dataset && typeof node.dataset === "object" ? node.dataset : {}
}

function attr(node, name) {
  if (typeof node?.getAttribute === "function") return stringOrNull(node.getAttribute(name))
  const dataset = datasetOf(node)
  const key = name.replace(/^data-/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  return stringOrNull(dataset[key])
}

function boolAttr(value) {
  return value === true || value === "true" || value === ""
}

function nodeIsContenteditable(surface) {
  if (!surface) return false
  if (boolAttr(surface.contentEditable) || boolAttr(surface.isContentEditable) || boolAttr(surface.contenteditable)) return true
  return boolAttr(attr(surface, "contenteditable"))
}

function nodeChildren(node) {
  if (Array.isArray(node?.childNodes)) return node.childNodes
  if (Array.isArray(node?.children)) return node.children
  if (node?.childNodes && typeof node.childNodes.length === "number") return Array.from(node.childNodes)
  if (node?.children && typeof node.children.length === "number") return Array.from(node.children)
  return []
}

function segmentIdFromNode(node) {
  const dataset = datasetOf(node)
  return stringOrNull(
    dataset.contenteditableSegmentId
      || dataset.segmentId
      || attr(node, "data-contenteditable-segment-id")
      || attr(node, "data-segment-id")
      || node?.segmentId,
  )
}

function segmentKindFromNode(node) {
  const dataset = datasetOf(node)
  return stringOrNull(
    dataset.contenteditableSegmentKind
      || dataset.segmentKind
      || attr(node, "data-contenteditable-segment-kind")
      || attr(node, "data-segment-kind")
      || node?.kind,
  )
}

function nodeText(node) {
  if (typeof node?.textContent === "string") return node.textContent
  if (typeof node?.nodeValue === "string") return node.nodeValue
  return ""
}

function rootIdFor(surface) {
  return stringOrNull(surface?.rootId || datasetOf(surface).rootId || attr(surface, "data-root-id"))
}

function targetTextBlockIdFor(surface) {
  return stringOrNull(surface?.targetTextBlockId || datasetOf(surface).textBlockId || attr(surface, "data-text-block-id"))
}

function normalizeSegmentFacts(segmentCapture, surface) {
  if (Array.isArray(segmentCapture?.segments) && segmentCapture.segments.length > 0) return segmentCapture.segments
  if (Array.isArray(surface?.segments)) return surface.segments
  return []
}

function nearestSegmentNode(node, surface) {
  let current = node
  while (current) {
    if (segmentIdFromNode(current)) return current
    if (current === surface) return null
    current = current.parentNode || current.parentElement || current.host || null
  }
  return null
}

function textLengthBeforeChild(parent, childIndex) {
  return nodeChildren(parent)
    .slice(0, Math.max(0, childIndex))
    .reduce((sum, child) => sum + nodeText(child).length, 0)
}

function offsetWithinSegment(segmentNode, targetNode, targetOffset) {
  const wantedOffset = Math.max(0, integerOrNull(targetOffset) ?? 0)
  if (!segmentNode) return { issue: "selection-segment-missing" }

  if (targetNode === segmentNode) {
    if (targetNode?.nodeType === ELEMENT_NODE) {
      return { offset: Math.min(textLengthBeforeChild(segmentNode, wantedOffset), nodeText(segmentNode).length) }
    }
    return { offset: Math.min(wantedOffset, nodeText(segmentNode).length) }
  }

  let offset = 0
  let found = false

  function visit(node) {
    if (!node || found) return
    if (node === targetNode) {
      found = true
      if (node.nodeType === ELEMENT_NODE) {
        offset += textLengthBeforeChild(node, wantedOffset)
      } else {
        offset += Math.min(wantedOffset, nodeText(node).length)
      }
      return
    }

    if (node.nodeType === TEXT_NODE) {
      offset += nodeText(node).length
      return
    }

    for (const child of nodeChildren(node)) {
      visit(child)
      if (found) return
    }
  }

  visit(segmentNode)
  if (!found) return { issue: "selection-node-outside-segment" }
  return { offset: Math.min(offset, nodeText(segmentNode).length) }
}

function fallbackEndpoint(selection, endpoint) {
  const nested = selection?.[endpoint]
  if (nested && typeof nested === "object") {
    return {
      offset: nested.offset,
      segmentId: nested.segmentId,
    }
  }

  return {
    offset: selection?.[`${endpoint}Offset`],
    segmentId: selection?.[`${endpoint}SegmentId`],
  }
}

function domEndpoint(selection, endpoint) {
  if (!selection) return null
  const prefix = endpoint === "anchor" ? "anchor" : "focus"
  const node = selection[`${prefix}Node`] || selection[endpoint]?.node || null
  if (!node) return null

  return {
    node,
    offset: selection[`${prefix}Offset`] ?? selection[endpoint]?.offset,
  }
}

function segmentTextLength(segment) {
  return Number.isInteger(segment?.textLength)
    ? segment.textLength
    : typeof segment?.text === "string"
      ? segment.text.length
      : Math.max(0, (integerOrNull(segment?.draftEnd) ?? 0) - (integerOrNull(segment?.draftStart) ?? 0))
}

function affinityFor(segment, offset) {
  if (ATOMIC_SEGMENT_KINDS.has(segment?.kind)) return "atomic-boundary"
  const length = segmentTextLength(segment)
  if (offset <= 0) return "before"
  if (offset >= length) return "after"
  return "inside"
}

function resolveEndpoint(selection, endpoint, surface, segmentMap) {
  const direct = fallbackEndpoint(selection, endpoint)
  const directSegmentId = stringOrNull(direct.segmentId)
  if (directSegmentId) {
    const segment = segmentMap.get(directSegmentId)
    if (!segment) return { issue: "selection-segment-missing" }
    const offset = integerOrNull(direct.offset)
    const maxOffset = segmentTextLength(segment)
    if (offset == null || offset < 0 || offset > maxOffset) return { issue: "selection-offset-out-of-range" }
    return {
      affinity: affinityFor(segment, offset),
      offset,
      segmentId: directSegmentId,
      source: "bounded-selection-facts",
      value: (integerOrNull(segment.draftStart) ?? 0) + offset,
    }
  }

  const dom = domEndpoint(selection, endpoint)
  if (!dom) return { issue: "selection-missing" }

  const segmentNode = nearestSegmentNode(dom.node, surface)
  const segmentId = segmentIdFromNode(segmentNode)
  if (!segmentId) return { issue: "selection-segment-missing" }

  const segment = segmentMap.get(segmentId)
  if (!segment) return { issue: "selection-segment-missing" }

  const resolved = offsetWithinSegment(segmentNode, dom.node, dom.offset)
  if (resolved.issue) return resolved

  const maxOffset = segmentTextLength(segment)
  const offset = resolved.offset
  if (offset < 0 || offset > maxOffset) return { issue: "selection-offset-out-of-range" }

  return {
    affinity: affinityFor(segment, offset),
    offset,
    segmentId,
    source: "browser-dom-selection",
    value: (integerOrNull(segment.draftStart) ?? 0) + offset,
  }
}

function directionFor(selection, anchorValue, focusValue) {
  if (selection?.direction === "backward") return "backward"
  if (selection?.direction === "forward") return "forward"
  if (anchorValue > focusValue) return "backward"
  if (anchorValue < focusValue) return "forward"
  return "none"
}

function resolveSelection(selection, surface, segments) {
  if (!selection) return { issue: "selection-missing", selection: null }
  const segmentMap = new Map(segments.map((segment) => [segment.segmentId, segment]))
  const anchor = resolveEndpoint(selection, "anchor", surface, segmentMap)
  if (anchor.issue) return { issue: anchor.issue, selection: null }
  const focus = resolveEndpoint(selection, "focus", surface, segmentMap)
  if (focus.issue) return { issue: focus.issue, selection: null }

  const start = Math.min(anchor.value, focus.value)
  const end = Math.max(anchor.value, focus.value)
  return {
    issue: null,
    selection: {
      anchor,
      collapsed: start === end,
      direction: directionFor(selection, anchor.value, focus.value),
      end,
      focus,
      length: end - start,
      source: anchor.source === "browser-dom-selection" || focus.source === "browser-dom-selection"
        ? "browser-dom-selection"
        : stringOrNull(selection.source) || "bounded-selection-facts",
      start,
      unit: "utf16-code-unit-offset",
    },
  }
}

function countManagedSegmentNodes(node) {
  if (!node) return 0
  const current = segmentIdFromNode(node) ? 1 : 0
  return current + nodeChildren(node).reduce((sum, child) => sum + countManagedSegmentNodes(child), 0)
}

function nestedInlineDepth(node, depth = 0) {
  if (!node) return 0
  const nextDepth = segmentKindFromNode(node) ? depth + 1 : depth
  return Math.max(nextDepth, 0, ...nodeChildren(node).map((child) => nestedInlineDepth(child, nextDepth)))
}

function issueFor(input) {
  if (!input.active) return null
  if (input.composing) return "composition-active"
  if (!input.surface) return "production-surface-missing"
  if (!input.contentEditable) return "contenteditable-root-missing"
  if (input.rootId && input.expectedRootId && input.rootId !== input.expectedRootId) return "root-id-mismatch"
  if (input.surfaceTarget && input.surfaceTarget !== input.draftTarget) return "target-mismatch"
  if (input.segmentCapture?.status !== "ready") return input.segmentCapture?.reason || "segment-capture-not-ready"
  if (input.plainText !== input.draftText) return "text-mismatch"
  return input.selectionIssue
}

function statusFor(active, composing, issue) {
  if (!active) return "idle"
  if (composing) return "composing"
  if (issue) return "blocked"
  return "ready"
}

export function createDraftContenteditableSurfaceHardening(draft, input = {}) {
  const active = activeDraft(draft)
  const surface = input.surface || null
  const segmentCapture = input.segmentCapture || null
  const rangeMapping = input.rangeMapping || null
  const segments = normalizeSegmentFacts(segmentCapture, surface)
  const selectionInput = input.selection || segmentCapture?.selection || null
  const selectionResult = active && segmentCapture?.status === "ready"
    ? resolveSelection(selectionInput, surface, segments)
    : { issue: null, selection: null }
  const expectedRootId = active ? `${draft.textBlockId}:contenteditable-surface` : null
  const rootId = rootIdFor(surface)
  const surfaceTarget = targetTextBlockIdFor(surface)
  const contentEditable = Boolean(surface && nodeIsContenteditable(surface))
  const plainText = typeof segmentCapture?.plainText === "string" ? segmentCapture.plainText : ""
  const draftText = typeof draft?.text === "string" ? draft.text : ""
  const composing = active && Boolean(draft.isComposing)
  const issue = issueFor({
    active,
    composing,
    contentEditable,
    draftTarget: draft?.textBlockId,
    draftText,
    expectedRootId,
    plainText,
    rootId,
    segmentCapture,
    selectionIssue: selectionResult.issue,
    surface,
    surfaceTarget,
  })
  const status = statusFor(active, composing, issue)

  return {
    active,
    backendApi: {
      status: "not-called",
    },
    canUseProductionSurface: status === "ready",
    contenteditable: {
      expectedRootId,
      managedSegmentCount: surface ? countManagedSegmentNodes(surface) || segments.length : 0,
      nestedInlineDepth: surface ? nestedInlineDepth(surface) : 0,
      rootId: rootId || null,
      source: surface?.childNodes || surface?.children ? "browser-owned-dom-inspection" : "bounded-surface-facts",
      status: contentEditable ? "bound" : "not-bound",
      targetTextBlockId: surfaceTarget,
      textDrift: plainText === draftText ? "none" : "mismatch",
    },
    coreTransaction: {
      status: "not-run",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    guards: {
      bidiCaretAffinity: "pending-renderer-measurement",
      ime: composing ? "active" : "idle",
      nestedInline: surface && nestedInlineDepth(surface) > 1 ? "observed" : "flat",
      rangeMapping: rangeMapping?.status || "not-bound",
      segmentCapture: segmentCapture?.status || "not-run",
      selection: status === "ready" ? "resolved" : selectionResult.issue || "not-resolved",
      target: surfaceTarget == null || surfaceTarget === draft?.textBlockId ? "matched" : "mismatch",
      text: plainText === draftText ? "matched" : "mismatch",
    },
    history: {
      status: "not-recorded",
    },
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_CONTENTEDITABLE_SURFACE_HARDENING_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    rangeMapping: {
      reason: rangeMapping?.reason || "not-run",
      status: rangeMapping?.status || "not-run",
    },
    reason: !active ? "no-active-draft" : composing ? "composition-active" : issue || "contenteditable-surface-hardened",
    segmentCapture: {
      reason: segmentCapture?.reason || "not-run",
      segmentCount: segmentCapture?.segmentCount || 0,
      status: segmentCapture?.status || "not-run",
    },
    selection: status === "ready" ? selectionResult.selection : null,
    source: DRAFT_CONTENTEDITABLE_SURFACE_HARDENING_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    textEngine: {
      rangeUnit: "utf16-code-unit-offset",
      status: "not-executed",
    },
    version: 1,
  }
}

export function draftContenteditableSurfaceHardeningLabel(summary) {
  if (!summary?.active) return "Surface hardening: idle"
  if (summary.status === "composing") return "Surface hardening: composing"
  if (summary.status === "ready") return "Surface hardening: ready"
  if (summary.reason === "selection-node-outside-segment") return "Surface hardening: selection drift"
  if (summary.reason === "selection-offset-out-of-range") return "Surface hardening: selection blocked"
  if (summary.reason === "text-mismatch") return "Surface hardening: text drift"
  if (summary.reason === "root-id-mismatch") return "Surface hardening: root drift"
  if (summary.reason === "target-mismatch") return "Surface hardening: target drift"
  return "Surface hardening: blocked"
}
