export const DRAFT_TOOLBAR_STATE_SOURCE = "flowdoc-template-builder-draft-toolbar-state"
export const DRAFT_TOOLBAR_STATE_MODE = "browser-local-toolbar-state-boundary"

const STYLE_MARKS = ["bold", "italic", "underline", "strikethrough"]

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function clampOffset(draft, value) {
  const textLength = typeof draft?.text === "string" ? draft.text.length : 0
  const numeric = Number.isFinite(value) ? Math.trunc(value) : 0
  return Math.max(0, Math.min(textLength, numeric))
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.collapsed) return "guarded"
  return "ready"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (facts.collapsed) return "collapsed-selection"
  return "selected-range"
}

function styleControls(status, reason) {
  return STYLE_MARKS.map((mark) => ({
    active: false,
    activeState: "unknown-until-rich-inline-mapping",
    command: "inline.style.patch",
    enabled: status === "ready",
    mark,
    reason,
    status,
  }))
}

export function createDraftToolbarState(draft) {
  const active = activeDraft(draft)
  const start = active ? clampOffset(draft, draft.selectionStart) : null
  const end = active ? clampOffset(draft, draft.selectionEnd) : null
  const rangeStart = active ? Math.min(start, end) : null
  const rangeEnd = active ? Math.max(start, end) : null
  const rangeLength = active ? rangeEnd - rangeStart : 0
  const facts = {
    active,
    collapsed: !active || rangeLength === 0,
    composing: active && Boolean(draft.isComposing),
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)
  const controls = styleControls(status, reason)

  return {
    active,
    activeControlCount: controls.filter((control) => control.active).length,
    commandDispatch: {
      status: "not-wired",
    },
    controls,
    coreTransaction: {
      status: "not-run",
    },
    enabledControlCount: controls.filter((control) => control.enabled).length,
    exactGeneration: {
      status: "deferred-until-commit",
    },
    history: {
      status: "not-recorded",
    },
    mode: DRAFT_TOOLBAR_STATE_MODE,
    range: active
      ? {
        end: rangeEnd,
        length: rangeLength,
        start: rangeStart,
      }
      : null,
    reason,
    source: DRAFT_TOOLBAR_STATE_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftToolbarStateLabel(toolbarState) {
  if (!toolbarState?.active) return "Toolbar: idle"
  if (toolbarState.status === "composing") return "Toolbar: composing"
  if (toolbarState.status === "guarded") return "Toolbar: select text"
  if (toolbarState.status === "ready") {
    return `Toolbar: ${toolbarState.enabledControlCount} style controls ready`
  }
  return "Toolbar: idle"
}
