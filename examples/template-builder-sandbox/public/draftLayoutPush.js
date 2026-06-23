export const DRAFT_LAYOUT_PUSH_SOURCE = "flowdoc-template-builder-draft-layout-push"
export const DRAFT_LAYOUT_PUSH_MODE = "browser-local-draft-layout-preview"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function previewText(value, emptyLabel = "empty") {
  if (!value) return emptyLabel
  const compact = String(value).replaceAll(/\s+/g, " ")
  return compact.length > 40 ? `${compact.slice(0, 37)}...` : compact
}

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function textDelta(draft) {
  return draft.text.length - draft.originalText.length
}

function pushStatus(draft) {
  if (!activeDraft(draft)) return "idle"
  if (draft.isComposing) return "composing"
  if (draft.text !== draft.originalText) return "preview"
  return "stable"
}

function pushReason(draft) {
  if (!activeDraft(draft)) return "no-active-draft"
  if (draft.isComposing) return "composition-active"
  if (draft.text !== draft.originalText) return "local-draft-preview"
  return "no-local-change"
}

export function createDraftLayoutPush(draft, input = {}) {
  const status = pushStatus(draft)
  const reason = pushReason(draft)
  const active = activeDraft(draft)
  const dirty = active && draft.text !== draft.originalText
  const delta = active ? textDelta(draft) : 0
  const targetTextBlockId = active ? draft.textBlockId : null
  const documentRevision = Number.isFinite(input.documentRevision) ? input.documentRevision : null
  const baseRevision = Number.isFinite(draft?.baseRevision) ? draft.baseRevision : null

  return {
    active,
    baseRevision,
    dirty,
    documentRevision,
    exactGeneration: {
      finalTruth: "commit-owned-exact-generation",
      status: "not-run",
    },
    liveLayout: {
      request: null,
      status: "not-requested",
    },
    localPreviewOnly: true,
    mode: DRAFT_LAYOUT_PUSH_MODE,
    originalTextLength: active ? draft.originalText.length : 0,
    previewText: active ? previewText(draft.text) : null,
    reason,
    selectionEnd: active ? draft.selectionEnd : null,
    selectionStart: active ? draft.selectionStart : null,
    source: DRAFT_LAYOUT_PUSH_SOURCE,
    status,
    targetTextBlockId,
    textLength: active ? draft.text.length : 0,
    textLengthDelta: delta,
    version: 1,
  }
}

export function draftLayoutPushLabel(push) {
  if (!push?.active) return "Draft layout: idle"
  const delta = push.textLengthDelta === 0
    ? "same length"
    : push.textLengthDelta > 0
      ? `+${push.textLengthDelta} chars`
      : `${push.textLengthDelta} chars`
  return `Draft layout: ${push.status} ${delta} ${push.reason}`
}
