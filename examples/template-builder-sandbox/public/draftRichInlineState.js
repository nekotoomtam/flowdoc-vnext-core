export const DRAFT_RICH_INLINE_STATE_SOURCE = "flowdoc-template-builder-draft-rich-inline-state"
export const DRAFT_RICH_INLINE_STATE_MODE = "browser-local-rich-inline-state-boundary"

const STYLE_MARKS = new Set(["bold", "italic", "underline", "strikethrough"])
const RANGE_UNIT = "utf16-code-unit-offset"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : []
}

function inputInlineStates(input) {
  return [
    input.browserInlineState,
    input.richInlinePatchExecution?.browserInlineState,
    input.toolbarCommandDispatch?.patchResult?.browserInlineState,
    input.fieldChipInsertExecution?.browserInlineState,
  ].filter(Boolean)
}

function inputTargets(input) {
  return [
    input.richInlinePatchExecution?.targetTextBlockId,
    input.toolbarCommandDispatch?.targetTextBlockId,
    input.fieldChipInsertExecution?.targetTextBlockId,
  ].filter(Boolean)
}

function collectStyledRuns(input) {
  const states = inputInlineStates(input)
  const runs = states.flatMap((state) => arrayOrEmpty(state.styledRuns))

  const byRunId = new Map()
  for (const run of runs) {
    const runId = stringOrNull(run?.runId) || `${run?.mark || "style"}:${run?.range?.start}-${run?.range?.end}`
    if (!byRunId.has(runId)) byRunId.set(runId, run)
  }

  return [...byRunId.values()]
}

function collectAtomicChips(input) {
  const states = inputInlineStates(input)
  const chips = states.flatMap((state) => arrayOrEmpty(state.atomicChips))

  const byChipId = new Map()
  for (const chip of chips) {
    const chipId = stringOrNull(chip?.chipId) || `${chip?.fieldKey || "field"}:${chip?.position}`
    if (!byChipId.has(chipId)) byChipId.set(chipId, chip)
  }

  return [...byChipId.values()]
}

function plainTextForState(draft, input) {
  if (activeDraft(draft) && typeof draft.text === "string") return draft.text

  const state = inputInlineStates(input).find((candidate) => typeof candidate.plainText === "string")
  return typeof state?.plainText === "string" ? state.plainText : ""
}

function unsupportedInlineState(input) {
  const unsupported = inputInlineStates(input).find((state) => {
    const status = state?.status || "not-created"
    return status !== "not-created" && status !== "patched" && status !== "normalized"
  })
  return unsupported ? "unsupported-inline-state" : null
}

function plainTextIssue(draft, input, plainText) {
  const state = inputInlineStates(input).find((candidate) => {
    if (candidate?.plainTextPreserved === false) return true
    if (typeof candidate?.plainText === "string" && candidate.plainText !== plainText) return true
    return false
  })
  if (!state) return null
  if (state.plainTextPreserved === false) return "plain-text-not-preserved"
  return "plain-text-mismatch"
}

function normalizeStyledRun(run, index, plainText) {
  const mark = STYLE_MARKS.has(run?.mark) ? run.mark : null
  const start = integerOrNull(run?.range?.start)
  const end = integerOrNull(run?.range?.end)
  const unit = stringOrNull(run?.range?.unit) || RANGE_UNIT

  if (!mark) return { issue: "unsupported-style-mark" }
  if (start == null || end == null || start < 0 || end <= start || end > plainText.length) {
    return { issue: "invalid-style-run-range" }
  }

  return {
    issue: null,
    run: {
      enabled: run.enabled !== false,
      mark,
      order: index,
      range: {
        end,
        length: end - start,
        start,
        unit,
      },
      runId: stringOrNull(run.runId) || `${mark}:${start}-${end}`,
      selectedText: typeof run.selectedText === "string" ? run.selectedText : plainText.slice(start, end),
      sourceCommand: stringOrNull(run.sourceCommand) || "inline.style.patch",
    },
  }
}

function normalizeAtomicChip(chip, index, plainText) {
  const position = integerOrNull(chip?.position)
  const fieldKey = stringOrNull(chip?.fieldKey)

  if (!fieldKey) return { issue: "missing-field-key" }
  if (position == null || position < 0 || position > plainText.length) {
    return { issue: "invalid-chip-position" }
  }

  return {
    chip: {
      chipId: stringOrNull(chip.chipId) || `field:${fieldKey}:${position}`,
      fieldKey,
      hasData: Boolean(chip.hasData),
      label: stringOrNull(chip.label) || fieldKey,
      order: index,
      placeholder: stringOrNull(chip.placeholder) || `{{${fieldKey}}}`,
      position,
      sourceCommand: stringOrNull(chip.sourceCommand) || "inline.fieldRef.insert",
      type: stringOrNull(chip.type) || "unknown",
      usageCount: Number.isFinite(chip.usageCount) ? chip.usageCount : 0,
    },
    issue: null,
  }
}

function sortRuns(runs) {
  return [...runs].sort((left, right) => (
    left.range.start - right.range.start
    || left.range.end - right.range.end
    || left.mark.localeCompare(right.mark)
    || left.runId.localeCompare(right.runId)
  ))
}

function sortChips(chips) {
  return [...chips].sort((left, right) => (
    left.position - right.position
    || left.fieldKey.localeCompare(right.fieldKey)
    || left.chipId.localeCompare(right.chipId)
  ))
}

function validateRunOrdering(styledRuns) {
  const runIds = new Set()

  for (const run of styledRuns) {
    if (runIds.has(run.runId)) return "duplicate-style-run"
    runIds.add(run.runId)
  }

  for (let index = 1; index < styledRuns.length; index += 1) {
    const previous = styledRuns[index - 1]
    const current = styledRuns[index]
    if (current.range.start < previous.range.end) return "overlapping-style-runs"
  }

  return null
}

function validateChipOrdering(atomicChips) {
  const chipIds = new Set()
  const chipPositions = new Set()

  for (const chip of atomicChips) {
    if (chipIds.has(chip.chipId)) return "duplicate-atomic-chip"
    if (chipPositions.has(chip.position)) return "ambiguous-chip-position"
    chipIds.add(chip.chipId)
    chipPositions.add(chip.position)
  }

  return null
}

function validateChipStyleBoundaries(styledRuns, atomicChips) {
  for (const chip of atomicChips) {
    const containingRun = styledRuns.find((run) => chip.position > run.range.start && chip.position < run.range.end)
    if (containingRun) return "atomic-chip-inside-style-run"
  }
  return null
}

function validateTarget(draft, input) {
  const target = activeDraft(draft) ? draft.textBlockId : null
  if (!target) return null
  return inputTargets(input).some((candidate) => candidate !== target) ? "target-mismatch" : null
}

function normalizeStyledRuns(input, plainText) {
  const normalized = collectStyledRuns(input).map((run, index) => normalizeStyledRun(run, index, plainText))
  const issue = normalized.find((result) => result.issue)?.issue || null
  return {
    issue,
    runs: issue ? [] : sortRuns(normalized.map((result) => result.run)),
  }
}

function normalizeAtomicChips(input, plainText) {
  const normalized = collectAtomicChips(input).map((chip, index) => normalizeAtomicChip(chip, index, plainText))
  const issue = normalized.find((result) => result.issue)?.issue || null
  return {
    chips: issue ? [] : sortChips(normalized.map((result) => result.chip)),
    issue,
  }
}

function createSegments(plainText, styledRuns, atomicChips) {
  const boundaries = new Set([0, plainText.length])
  styledRuns.forEach((run) => {
    boundaries.add(run.range.start)
    boundaries.add(run.range.end)
  })
  atomicChips.forEach((chip) => boundaries.add(chip.position))

  const orderedBoundaries = [...boundaries].sort((left, right) => left - right)
  const chipsByPosition = new Map()
  for (const chip of atomicChips) {
    const chips = chipsByPosition.get(chip.position) || []
    chips.push(chip)
    chipsByPosition.set(chip.position, chips)
  }

  const segments = []
  for (let index = 0; index < orderedBoundaries.length; index += 1) {
    const position = orderedBoundaries[index]
    for (const chip of chipsByPosition.get(position) || []) {
      segments.push({
        chipId: chip.chipId,
        fieldKey: chip.fieldKey,
        kind: "atomic-chip",
        label: chip.label,
        placeholder: chip.placeholder,
        position,
      })
    }

    const next = orderedBoundaries[index + 1]
    if (next == null || next <= position) continue

    const activeRuns = styledRuns.filter((run) => run.enabled && run.range.start <= position && run.range.end >= next)
    segments.push({
      end: next,
      kind: "text",
      start: position,
      styleMarks: activeRuns.map((run) => run.mark),
      styleRunIds: activeRuns.map((run) => run.runId),
      text: plainText.slice(position, next),
    })
  }

  return segments
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.issue) return "blocked"
  return "ready"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  return facts.issue || "browser-local-rich-inline-state-normalized"
}

function richInlineState(status, draft, plainText, styledRuns, atomicChips) {
  const ready = status === "ready"
  const segments = ready ? createSegments(plainText, styledRuns, atomicChips) : []

  return {
    atomicChipCount: ready ? atomicChips.length : 0,
    atomicChips: ready ? atomicChips : [],
    ordering: "utf16-position-then-kind",
    plainText,
    plainTextPreserved: true,
    segmentCount: segments.length,
    segments,
    status: ready ? "normalized" : "not-created",
    styledRunCount: ready ? styledRuns.length : 0,
    styledRuns: ready ? styledRuns : [],
    targetTextBlockId: activeDraft(draft) ? draft.textBlockId : null,
    textLength: plainText.length,
  }
}

export function createDraftRichInlineState(draft, input = {}) {
  const active = activeDraft(draft)
  const plainText = plainTextForState(draft, input)
  const styledRunResult = normalizeStyledRuns(input, plainText)
  const chipResult = normalizeAtomicChips(input, plainText)
  const issue = active
    ? unsupportedInlineState(input)
      || plainTextIssue(draft, input, plainText)
      || validateTarget(draft, input)
      || styledRunResult.issue
      || chipResult.issue
      || validateRunOrdering(styledRunResult.runs)
      || validateChipOrdering(chipResult.chips)
      || validateChipStyleBoundaries(styledRunResult.runs, chipResult.chips)
    : null
  const facts = {
    active,
    composing: active && Boolean(draft.isComposing),
    issue,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)

  return {
    active,
    application: {
      status: status === "ready" ? "browser-local-state-normalized" : "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    browserRichInlineState: richInlineState(status, draft, plainText, styledRunResult.runs, chipResult.chips),
    canNormalizeState: status === "ready",
    commandReadiness: {
      canonicalCommit: status === "ready" ? "planned-next-phase" : "blocked",
    },
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
    mode: DRAFT_RICH_INLINE_STATE_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    reason,
    source: DRAFT_RICH_INLINE_STATE_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    textEngine: {
      rangeUnit: RANGE_UNIT,
      status: "not-executed",
    },
    version: 1,
  }
}

export function draftRichInlineStateLabel(summary) {
  if (!summary?.active) return "Rich state: idle"
  if (summary.status === "composing") return "Rich state: composing"
  if (summary.status === "ready") {
    const state = summary.browserRichInlineState
    if (state.styledRunCount === 0 && state.atomicChipCount === 0) return "Rich state: text only"
    return `Rich state: ${state.styledRunCount} styles/${state.atomicChipCount} chips`
  }
  if (summary.reason === "overlapping-style-runs") return "Rich state: overlap blocked"
  if (summary.reason === "atomic-chip-inside-style-run") return "Rich state: chip/style blocked"
  if (summary.reason === "ambiguous-chip-position") return "Rich state: chip position blocked"
  if (summary.reason === "plain-text-mismatch") return "Rich state: text mismatch"
  if (summary.reason === "target-mismatch") return "Rich state: target mismatch"
  return "Rich state: blocked"
}
