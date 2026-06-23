export const DRAFT_FIELD_CHIP_INSERT_EXECUTION_SOURCE = "flowdoc-template-builder-draft-field-chip-insert-execution"
export const DRAFT_FIELD_CHIP_INSERT_EXECUTION_MODE = "browser-local-field-chip-insert-execution-boundary"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function rangeFromMapping(rangeMapping) {
  if (rangeMapping?.status !== "ready" || !rangeMapping?.canMapRange || !rangeMapping.range) return null
  return rangeMapping.range
}

function selectedChip(fieldChipInline) {
  const selectedKey = stringOrNull(fieldChipInline?.selectedFieldKey)
  if (!selectedKey) return null
  return fieldChipInline.chips?.find((chip) => chip.key === selectedKey) || null
}

function supportedInlineState(input) {
  const status = input.browserInlineState?.status
    || input.richInlinePatchExecution?.browserInlineState?.status
    || "not-created"
  return status === "not-created" || status === "patched"
}

function styledRuns(input) {
  return input.browserInlineState?.styledRuns
    || input.richInlinePatchExecution?.browserInlineState?.styledRuns
    || []
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.blocked) return "blocked"
  if (facts.guarded) return "guarded"
  return "inserted"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (facts.blocked) return facts.blocked
  if (facts.guarded) return facts.guarded
  return "browser-local-field-chip-inserted"
}

function chipId(draft, chip, position) {
  return `${draft.textBlockId}:field:${chip.key}:${position}`
}

function buildAtomicChip(draft, chip, position) {
  return {
    chipId: chipId(draft, chip, position),
    fieldKey: chip.key,
    hasData: Boolean(chip.hasData),
    label: chip.label || chip.key,
    placeholder: `{{${chip.key}}}`,
    position,
    sourceCommand: "inline.fieldRef.insert",
    type: chip.type || "unknown",
    usageCount: Number.isFinite(chip.usageCount) ? chip.usageCount : 0,
  }
}

function browserInlineState(draft, status, atomicChip, input) {
  const active = activeDraft(draft)
  const chips = atomicChip ? [atomicChip] : []
  return {
    atomicChipCount: chips.length,
    atomicChips: chips,
    plainText: active ? draft.text : "",
    plainTextPreserved: true,
    status: status === "inserted" ? "patched" : "not-created",
    styledRuns: styledRuns(input),
  }
}

export function createDraftFieldChipInsertExecution(draft, input = {}) {
  const active = activeDraft(draft)
  const range = rangeFromMapping(input.rangeMapping)
  const chip = selectedChip(input.fieldChipInline)
  const insertion = input.fieldChipInline?.insertion
  const guarded = !active
    ? null
    : !range
      ? "range-mapping-not-ready"
      : !range.collapsed
        ? "range-not-collapsed"
        : input.fieldChipInline?.status !== "ready" || !input.fieldChipInline?.canRequestInsert
          ? input.fieldChipInline?.reason || "field-chip-intent-not-ready"
          : insertion?.position !== range.start
            ? "caret-mismatch"
            : null
  const blocked = !active || guarded
    ? null
    : !chip
      ? "no-selected-field"
      : !supportedInlineState(input)
        ? "unsupported-rich-inline-state"
        : null
  const facts = {
    active,
    blocked,
    composing: active && Boolean(draft.isComposing),
    guarded,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)
  const atomicChip = status === "inserted" ? buildAtomicChip(draft, chip, range.start) : null

  return {
    active,
    application: {
      status: status === "inserted" ? "applied-to-browser-local-inline-state" : "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    browserInlineState: browserInlineState(draft, status, atomicChip, input),
    canInsertChip: status === "inserted",
    command: "inline.fieldRef.insert",
    coreTransaction: {
      status: "not-run",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    history: {
      status: "not-recorded",
    },
    keyMigration: {
      status: "deferred-until-commit",
    },
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_FIELD_CHIP_INSERT_EXECUTION_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    reason,
    source: DRAFT_FIELD_CHIP_INSERT_EXECUTION_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftFieldChipInsertExecutionLabel(summary) {
  if (!summary?.active) return "Field insert: idle"
  if (summary.status === "composing") return "Field insert: composing"
  if (summary.status === "inserted") {
    return `Field insert: ${summary.browserInlineState.atomicChips[0].fieldKey} local`
  }
  if (summary.reason === "range-mapping-not-ready" || summary.reason === "range-not-collapsed") {
    return "Field insert: range blocked"
  }
  if (summary.reason === "no-field-catalog") return "Field insert: no fields"
  if (summary.reason === "unsupported-rich-inline-state") return "Field insert: rich inline blocked"
  return "Field insert: guarded"
}
