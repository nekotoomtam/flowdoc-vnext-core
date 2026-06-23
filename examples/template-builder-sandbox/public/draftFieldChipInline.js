export const DRAFT_FIELD_CHIP_INLINE_SOURCE = "flowdoc-template-builder-draft-field-chip-inline"
export const DRAFT_FIELD_CHIP_INLINE_MODE = "browser-local-field-chip-inline-boundary"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function clampOffset(draft, value) {
  const textLength = typeof draft?.text === "string" ? draft.text.length : 0
  const numeric = Number.isFinite(value) ? Math.trunc(value) : 0
  return Math.max(0, Math.min(textLength, numeric))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeField(field) {
  const key = stringOrNull(field?.key)
  if (!key) return null
  return {
    hasData: Boolean(field.hasData),
    key,
    label: stringOrNull(field.label) || key,
    type: stringOrNull(field.type) || "unknown",
    usageCount: Number.isFinite(field.usageCount) ? Math.max(0, Math.trunc(field.usageCount)) : 0,
  }
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return []
  return fields.map(normalizeField).filter(Boolean).slice(0, 12)
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (!facts.hasFields) return "guarded"
  if (!facts.collapsed) return "guarded"
  return "ready"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (!facts.hasFields) return "no-field-catalog"
  if (!facts.collapsed) return "range-selection-needs-inline-mapping"
  return "caret-insertion-ready"
}

export function createDraftFieldChipInline(draft, input = {}) {
  const active = activeDraft(draft)
  const fields = normalizeFields(input.fields)
  const start = active ? clampOffset(draft, draft.selectionStart) : null
  const end = active ? clampOffset(draft, draft.selectionEnd) : null
  const rangeStart = active ? Math.min(start, end) : null
  const rangeEnd = active ? Math.max(start, end) : null
  const rangeLength = active ? rangeEnd - rangeStart : 0
  const selectedFieldKey = stringOrNull(input.selectedFieldKey) || fields[0]?.key || null
  const facts = {
    active,
    collapsed: !active || rangeLength === 0,
    composing: active && Boolean(draft.isComposing),
    hasFields: fields.length > 0,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)

  return {
    active,
    canRequestInsert: status === "ready",
    chips: fields.map((field) => ({
      ...field,
      selected: field.key === selectedFieldKey,
    })),
    command: "inline.fieldRef.insert",
    coreTransaction: {
      status: "not-run",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    fieldCount: fields.length,
    history: {
      status: "not-recorded",
    },
    insertion: active
      ? {
        position: rangeStart,
        status: "not-applied",
      }
      : null,
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_FIELD_CHIP_INLINE_MODE,
    range: active
      ? {
        end: rangeEnd,
        length: rangeLength,
        start: rangeStart,
      }
      : null,
    reason,
    selectedFieldKey,
    source: DRAFT_FIELD_CHIP_INLINE_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftFieldChipInlineLabel(summary) {
  if (!summary?.active) return "Field chips: idle"
  if (summary.status === "composing") return "Field chips: composing"
  if (summary.reason === "no-field-catalog") return "Field chips: no fields"
  if (summary.reason === "range-selection-needs-inline-mapping") return "Field chips: cursor only"
  if (summary.status === "ready") return `Field chips: ${summary.fieldCount} ready`
  return "Field chips: guarded"
}
