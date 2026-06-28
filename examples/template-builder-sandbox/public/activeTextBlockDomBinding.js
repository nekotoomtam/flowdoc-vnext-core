export const ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE = "flowdoc-active-text-block-dom-binding-smoke"
export const ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE = "browser-local-active-text-block-dom-binding-smoke"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function boolAttr(value) {
  return value === true || value === "true" || value === ""
}

function datasetOf(node) {
  return node?.dataset && typeof node.dataset === "object" ? node.dataset : {}
}

function attr(node, name) {
  if (typeof node?.getAttribute === "function") return stringOrNull(node.getAttribute(name))
  const key = name.replace(/^data-/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  return stringOrNull(datasetOf(node)[key])
}

function textContentOf(surface) {
  if (typeof surface?.textContent === "string") return surface.textContent
  if (typeof surface?.innerText === "string") return surface.innerText
  if (typeof surface?.value === "string") return surface.value
  return ""
}

function textBlockIdOf(surface, input) {
  return stringOrNull(input.textBlockId)
    || stringOrNull(surface?.textBlockId)
    || stringOrNull(datasetOf(surface).textBlockId)
    || attr(surface, "data-text-block-id")
}

function activeNodeIdOf(surface, input) {
  return stringOrNull(input.activeNodeId)
    || stringOrNull(surface?.activeNodeId)
    || stringOrNull(datasetOf(surface).activeNodeId)
    || attr(surface, "data-active-node-id")
    || textBlockIdOf(surface, input)
}

function surfaceIsContenteditable(surface) {
  return Boolean(
    boolAttr(surface?.contentEditable)
      || boolAttr(surface?.isContentEditable)
      || boolAttr(surface?.contenteditable)
      || boolAttr(attr(surface, "contenteditable")),
  )
}

function selectionHasDomObjects(selection) {
  return Boolean(selection?.anchorNode || selection?.focusNode || selection?.range || selection?.domRange)
}

function normalizeSelection(selection, textLength) {
  if (!selection) return { issue: "selection-missing" }
  if (selectionHasDomObjects(selection)) return { issue: "dom-range-object-not-supported" }
  const start = integerOrNull(selection.start)
  const end = integerOrNull(selection.end)
  if (start == null || end == null) return { issue: "selection-offset-missing" }
  if (start < 0 || end < start || end > textLength) return { issue: "selection-offset-out-of-range" }
  return {
    selection: {
      collapsed: start === end,
      direction: stringOrNull(selection.direction) || "none",
      end,
      source: stringOrNull(selection.source) || "bounded-selection-facts",
      start,
      unit: "utf16-code-unit-offset",
    },
  }
}

function unsafe(reason, island, input = {}) {
  return {
    activeNodeId: stringOrNull(input.activeNodeId) || stringOrNull(island?.textBlockId),
    capture: null,
    contenteditable: {
      reason,
      status: "not-bound",
    },
    coreCommit: {
      reason: "Phase 157 DOM smoke does not commit",
      status: "not-run",
    },
    diagnostics: [reason],
    mode: ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE,
    packageMutation: {
      reason: "DOM binding smoke remains browser-local",
      status: "not-mutated",
    },
    reason,
    safe: false,
    source: ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE,
    status: "unsafe",
    version: 1,
  }
}

export function createActiveTextBlockDomBindingSmoke(island, input = {}) {
  if (!island?.textBlockId || ["inactive", "closed", "rejected"].includes(island.status)) {
    return unsafe("no-active-text-block-island", island, input)
  }

  const surface = input.surface || null
  if (!surface) return unsafe("contenteditable-surface-missing", island, input)
  if (!surfaceIsContenteditable(surface)) return unsafe("contenteditable-root-missing", island, input)

  const textBlockId = textBlockIdOf(surface, input)
  if (textBlockId !== island.textBlockId) return unsafe("target-text-block-mismatch", island, input)

  const textSnapshot = textContentOf(surface)
  if (textSnapshot !== island.draftText) return unsafe("text-snapshot-mismatch", island, input)

  const selection = normalizeSelection(input.selection || surface.selection, textSnapshot.length)
  if (selection.issue) return unsafe(selection.issue, island, input)

  const activeNodeId = activeNodeIdOf(surface, input)
  return {
    activeNodeId,
    capture: {
      activeNodeId,
      compositionActive: Boolean(island.composition?.active),
      selection: selection.selection,
      textBlockId,
      textSnapshot,
      textLength: textSnapshot.length,
    },
    contenteditable: {
      reason: "bounded-contenteditable-smoke-captured",
      source: "browser-local-smoke-facts",
      status: "bound",
    },
    coreCommit: {
      reason: "Phase 157 DOM smoke stops before commit bridge",
      status: "not-run",
    },
    diagnostics: [],
    mode: ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE,
    packageMutation: {
      reason: "DOM binding smoke remains browser-local",
      status: "not-mutated",
    },
    reason: "bounded-contenteditable-smoke-captured",
    safe: true,
    source: ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE,
    status: "captured",
    version: 1,
  }
}

export function activeTextBlockDomBindingSmokeLabel(summary) {
  if (!summary || summary.status === "unsafe") return `DOM binding smoke: unsafe ${summary?.reason || "missing"}`
  return `DOM binding smoke: captured ${summary.capture.textBlockId} ${summary.capture.selection.start}-${summary.capture.selection.end}`
}
