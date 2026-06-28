export const ACTIVE_TEXT_BLOCK_ISLAND_SOURCE = "flowdoc-active-text-block-island"
export const ACTIVE_TEXT_BLOCK_ISLAND_MODE = "browser-local-active-text-block-island-boundary"

export const ACTIVE_TEXT_BLOCK_ISLAND_STATES = Object.freeze([
  "inactive",
  "opening",
  "active",
  "composing",
  "dirty",
  "committing",
  "rejected",
  "closed",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function textOf(input) {
  if (typeof input.draftText === "string") return input.draftText
  if (typeof input.text === "string") return input.text
  if (typeof input.plainText === "string") return input.plainText
  if (typeof input.node?.plainText === "string") return input.node.plainText
  if (typeof input.node?.textPreview === "string") return input.node.textPreview
  return ""
}

function textBlockIdOf(input) {
  return stringOrNull(input.textBlockId)
    || stringOrNull(input.activeTextBlockId)
    || stringOrNull(input.ownership?.activeTextBlockId)
    || stringOrNull(input.node?.id)
}

function activeState(state) {
  return Boolean(state?.textBlockId && !["inactive", "closed", "rejected"].includes(state.status))
}

function normalizeRichSegmentsSummary(input = {}) {
  const summary = input.richSegmentsSummary || input.richInlineSummary || {}
  return {
    atomicInlineCount: Math.max(0, integerOrNull(summary.atomicInlineCount) ?? integerOrNull(summary.fieldChipCount) ?? 0),
    segmentCount: Math.max(0, integerOrNull(summary.segmentCount) ?? 0),
    status: stringOrNull(summary.status) || "not-inspected",
    styledRunCount: Math.max(0, integerOrNull(summary.styledRunCount) ?? 0),
  }
}

function fallbackEligibility(input = {}) {
  return {
    eligible: input.fallbackEligible !== false,
    reason: stringOrNull(input.fallbackReason) || "fallback-available-if-island-unsafe",
  }
}

function clampOffset(text, value) {
  const max = text.length
  const offset = integerOrNull(value)
  if (offset == null) return max
  return Math.max(0, Math.min(offset, max))
}

function normalizeSelection(textBlockId, text, selection = {}, source = "island-lifecycle") {
  const start = clampOffset(text, selection.start)
  const end = clampOffset(text, selection.end ?? selection.start)
  const rangeStart = Math.min(start, end)
  const rangeEnd = Math.max(start, end)
  return {
    collapsed: rangeStart === rangeEnd,
    direction: stringOrNull(selection.direction) || "none",
    end: rangeEnd,
    source: stringOrNull(selection.source) || source,
    start: rangeStart,
    textBlockId,
    unit: "utf16-code-unit-offset",
  }
}

function transition(state, patch, event) {
  const previousEvents = Array.isArray(state?.events) ? state.events : []
  return {
    ...state,
    ...patch,
    events: [
      ...previousEvents,
      {
        event,
        status: patch.status || state?.status || "inactive",
      },
    ],
  }
}

function baseIslandState(input = {}) {
  return {
    baseText: "",
    canonicalPackageTruth: {
      reason: "browser-local-island-state-only",
      status: "not-mutated",
    },
    closeReason: null,
    commit: {
      reason: "not-requested",
      status: "not-requested",
    },
    composition: {
      active: false,
      data: "",
      eventCount: 0,
      source: "idle",
    },
    coreCommit: {
      reason: "Phase 155 models lifecycle only",
      status: "not-run",
    },
    dirty: false,
    draftText: "",
    events: [],
    fallbackEligibility: fallbackEligibility(input),
    mode: ACTIVE_TEXT_BLOCK_ISLAND_MODE,
    reason: stringOrNull(input.reason) || "inactive",
    richSegmentsSummary: normalizeRichSegmentsSummary(input),
    selection: null,
    source: ACTIVE_TEXT_BLOCK_ISLAND_SOURCE,
    status: "inactive",
    textBlockId: null,
    version: 1,
  }
}

export function createInactiveActiveTextBlockIslandState(input = {}) {
  return baseIslandState(input)
}

function rejectState(state, reason, input = {}) {
  return transition(state || createInactiveActiveTextBlockIslandState(input), {
    closeReason: null,
    commit: {
      reason,
      status: "blocked",
    },
    reason,
    status: "rejected",
  }, "reject")
}

export function openActiveTextBlockIsland(state = createInactiveActiveTextBlockIslandState(), input = {}) {
  const textBlockId = textBlockIdOf(input)
  const current = state || createInactiveActiveTextBlockIslandState(input)
  if (activeState(current) && current.textBlockId !== textBlockId) {
    return rejectState(current, "active-text-block-island-already-open", input)
  }
  if (input.ownership && input.ownership.targetType !== "active-text-block-island") {
    return rejectState(current, "ownership-target-not-active-island", input)
  }
  if (!textBlockId) return rejectState(current, "missing-text-block-id", input)

  const draftText = textOf(input)
  return transition({
    ...baseIslandState(input),
    events: current.events || [],
  }, {
    baseText: draftText,
    closeReason: null,
    dirty: false,
    draftText,
    fallbackEligibility: fallbackEligibility(input),
    reason: "opening",
    richSegmentsSummary: normalizeRichSegmentsSummary(input),
    selection: normalizeSelection(textBlockId, draftText, input.selection, "open"),
    status: "opening",
    textBlockId,
  }, "open")
}

export function activateActiveTextBlockIsland(state, input = {}) {
  if (!activeState(state) || state.status !== "opening") return rejectState(state, "island-not-opening", input)
  return transition(state, {
    reason: "active",
    status: "active",
  }, "activate")
}

export function updateActiveTextBlockIslandSelection(state, selection = {}, input = {}) {
  if (!activeState(state)) return rejectState(state, "no-active-island", input)
  if (state.composition.active) return rejectState(state, "composition-active", input)
  const selectionTextBlockId = stringOrNull(selection.textBlockId) || state.textBlockId
  if (selectionTextBlockId !== state.textBlockId) return rejectState(state, "cross-block-selection", input)
  return transition(state, {
    reason: "selection-updated",
    selection: normalizeSelection(state.textBlockId, state.draftText, selection, "selection-update"),
  }, "update-selection")
}

export function beginActiveTextBlockIslandComposition(state, input = {}) {
  if (!activeState(state)) return rejectState(state, "no-active-island", input)
  return transition(state, {
    composition: {
      active: true,
      data: stringOrNull(input.data) || "",
      eventCount: state.composition.eventCount + 1,
      source: stringOrNull(input.source) || "compositionstart",
    },
    reason: "composition-active",
    status: "composing",
  }, "begin-composition")
}

export function updateActiveTextBlockIslandDraft(state, input = {}) {
  if (!activeState(state)) return rejectState(state, "no-active-island", input)
  const updateTextBlockId = textBlockIdOf(input) || state.textBlockId
  if (updateTextBlockId !== state.textBlockId) return rejectState(state, "cross-block-draft-update", input)
  const draftText = textOf(input)
  const dirty = draftText !== state.baseText
  return transition(state, {
    dirty,
    draftText,
    reason: dirty ? "draft-dirty" : "draft-clean",
    selection: normalizeSelection(state.textBlockId, draftText, input.selection || state.selection || {}, "draft-update"),
    status: state.composition.active ? "composing" : dirty ? "dirty" : "active",
  }, "update-draft")
}

export function endActiveTextBlockIslandComposition(state, input = {}) {
  if (!activeState(state)) return rejectState(state, "no-active-island", input)
  if (!state.composition.active) return rejectState(state, "composition-not-active", input)
  const updated = typeof input.draftText === "string" || typeof input.text === "string" || typeof input.plainText === "string"
    ? updateActiveTextBlockIslandDraft(state, input)
    : state
  return transition(updated, {
    composition: {
      active: false,
      data: stringOrNull(input.data) || "",
      eventCount: updated.composition.eventCount + 1,
      source: stringOrNull(input.source) || "compositionend",
    },
    reason: updated.dirty ? "composition-ended-dirty" : "composition-ended-clean",
    status: updated.dirty ? "dirty" : "active",
  }, "end-composition")
}

export function requestActiveTextBlockIslandCommit(state, input = {}) {
  if (!activeState(state)) return rejectState(state, "no-active-island", input)
  if (state.composition.active) {
    return transition(state, {
      commit: {
        reason: "composition-active",
        status: "blocked",
      },
      reason: "composition-active",
    }, "request-commit-blocked")
  }
  if (!state.dirty) {
    return transition(state, {
      commit: {
        reason: "no-dirty-changes",
        status: "blocked",
      },
      reason: "no-dirty-changes",
    }, "request-commit-blocked")
  }

  return transition(state, {
    commit: {
      request: {
        draftText: state.draftText,
        richSegmentsSummary: state.richSegmentsSummary,
        selection: state.selection,
        textBlockId: state.textBlockId,
      },
      reason: "commit-requested",
      status: "requested",
    },
    coreCommit: {
      reason: "Phase 155 stops before commit bridge execution",
      status: "not-run",
    },
    reason: "commit-requested",
    status: "committing",
  }, "request-commit")
}

export function closeActiveTextBlockIsland(state, input = {}) {
  const current = state || createInactiveActiveTextBlockIslandState(input)
  const closeReason = stringOrNull(input.reason)
    || (current.dirty && current.commit?.status !== "requested" ? "closed-without-commit" : "closed")
  return transition(current, {
    closeReason,
    reason: closeReason,
    status: "closed",
  }, "close")
}

export function rejectActiveTextBlockIsland(state, reason = "rejected", input = {}) {
  return rejectState(state, stringOrNull(reason) || "rejected", input)
}

export function activeTextBlockIslandCanCommit(state) {
  return activeState(state) && state.dirty && !state.composition.active && state.status !== "committing"
}

export function activeTextBlockIslandLabel(state) {
  if (!state || state.status === "inactive") return "Active island: inactive"
  if (state.status === "rejected") return `Active island: rejected ${state.reason}`
  if (state.status === "closed") return `Active island: closed ${state.closeReason || "closed"}`
  if (state.status === "composing") return `Active island: composing ${state.textBlockId}`
  if (state.status === "dirty") return `Active island: dirty ${state.textBlockId}`
  if (state.status === "committing") return `Active island: committing ${state.textBlockId}`
  return `Active island: ${state.status} ${state.textBlockId}`
}
