export const DRAFT_INLINE_STYLE_PATCH_SOURCE = "flowdoc-template-builder-draft-inline-style-patch"
export const DRAFT_INLINE_STYLE_PATCH_MODE = "browser-local-inline-style-patch-boundary"

const STYLE_MARKS = new Set(["bold", "italic", "underline", "strikethrough"])

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function clampOffset(draft, value) {
  const textLength = typeof draft?.text === "string" ? draft.text.length : 0
  const numeric = Number.isFinite(value) ? Math.trunc(value) : 0
  return Math.max(0, Math.min(textLength, numeric))
}

function styleMark(input) {
  return STYLE_MARKS.has(input?.styleMark) ? input.styleMark : "bold"
}

function selectedTextPreview(draft, start, end) {
  const text = typeof draft?.text === "string" ? draft.text : ""
  const selected = text.slice(start, end).replaceAll(/\s+/g, " ")
  if (!selected) return "none"
  return selected.length > 24 ? `${selected.slice(0, 21)}...` : selected
}

function patchReason(input) {
  if (!input.active) return "no-active-draft"
  if (input.composing) return "composition-active"
  if (input.collapsed) return "collapsed-selection"
  return "selected-range"
}

function patchStatus(input) {
  if (!input.active) return "idle"
  if (input.composing) return "composing"
  if (input.collapsed) return "guarded"
  return "ready"
}

export function createDraftInlineStylePatch(draft, input = {}) {
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
  const status = patchStatus(facts)
  const reason = patchReason(facts)
  const mark = styleMark(input)

  return {
    active,
    application: {
      status: "not-applied",
    },
    canRequestPatch: status === "ready",
    command: "inline.style.patch",
    coreTransaction: {
      status: "not-run",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    history: {
      status: "not-recorded",
    },
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_INLINE_STYLE_PATCH_MODE,
    patch: {
      enabled: input.enabled !== false,
      mark,
    },
    range: active
      ? {
        end: rangeEnd,
        length: rangeLength,
        start: rangeStart,
      }
      : null,
    reason,
    selectedTextPreview: active ? selectedTextPreview(draft, rangeStart, rangeEnd) : "none",
    source: DRAFT_INLINE_STYLE_PATCH_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftInlineStylePatchLabel(summary) {
  if (!summary?.active) return "Style patch: idle"
  if (summary.status === "composing") return "Style patch: composing"
  if (summary.status === "guarded") return "Style patch: select text"
  if (summary.status === "ready") {
    return `Style patch: ${summary.patch.mark} ${summary.range.length} chars ready`
  }
  return "Style patch: idle"
}
