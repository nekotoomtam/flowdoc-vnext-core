export const DRAFT_RICH_INLINE_PATCH_EXECUTION_SOURCE = "flowdoc-template-builder-draft-rich-inline-patch-execution"
export const DRAFT_RICH_INLINE_PATCH_EXECUTION_MODE = "browser-local-rich-inline-patch-execution-boundary"

const STYLE_MARKS = new Set(["bold", "italic", "underline", "strikethrough"])

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function supportedStyleMark(mark) {
  return STYLE_MARKS.has(mark) ? mark : null
}

function rangeFromMapping(rangeMapping) {
  if (rangeMapping?.status !== "ready" || !rangeMapping?.canMapRange || !rangeMapping.range) return null
  return rangeMapping.range
}

function patchMark(inlineStylePatch) {
  return supportedStyleMark(inlineStylePatch?.patch?.mark)
}

function targetMismatch(draft, rangeMapping, inlineStylePatch) {
  const target = draft?.textBlockId
  if (!target) return false
  if (rangeMapping?.targetTextBlockId && rangeMapping.targetTextBlockId !== target) return true
  if (inlineStylePatch?.targetTextBlockId && inlineStylePatch.targetTextBlockId !== target) return true
  return false
}

function rangeIsValid(draft, range) {
  const textLength = typeof draft?.text === "string" ? draft.text.length : 0
  return Number.isInteger(range?.start)
    && Number.isInteger(range?.end)
    && range.start >= 0
    && range.end >= range.start
    && range.end <= textLength
}

function selectedText(draft, range) {
  if (!rangeIsValid(draft, range)) return ""
  return draft.text.slice(range.start, range.end)
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.blocked) return "blocked"
  if (facts.guarded) return "guarded"
  return "applied"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (facts.blocked) return facts.blocked
  if (facts.guarded) return facts.guarded
  return "browser-local-style-run-recorded"
}

function styleRunId(draft, mark, range) {
  return `${draft.textBlockId}:${mark}:${range.start}-${range.end}`
}

function buildStyledRun(draft, mark, enabled, range) {
  return {
    enabled,
    mark,
    range: {
      collapsed: false,
      end: range.end,
      length: range.length,
      start: range.start,
      unit: range.unit,
    },
    runId: styleRunId(draft, mark, range),
    selectedText: selectedText(draft, range),
    sourceCommand: "inline.style.patch",
  }
}

function browserInlineState(draft, status, styledRun) {
  const active = activeDraft(draft)
  return {
    plainText: active ? draft.text : "",
    plainTextPreserved: true,
    status: status === "applied" ? "patched" : "not-created",
    styledRunCount: styledRun ? 1 : 0,
    styledRuns: styledRun ? [styledRun] : [],
  }
}

export function createDraftRichInlinePatchExecution(draft, input = {}) {
  const active = activeDraft(draft)
  const range = rangeFromMapping(input.rangeMapping)
  const mark = patchMark(input.inlineStylePatch)
  const enabled = input.inlineStylePatch?.patch?.enabled !== false
  const guarded = !active
    ? null
    : input.inlineStylePatch?.status !== "ready" || !input.inlineStylePatch?.canRequestPatch
      ? "style-patch-not-ready"
      : !range
        ? "range-mapping-not-ready"
        : range.collapsed
          ? "collapsed-range"
          : null
  const blocked = !active || guarded
    ? null
    : targetMismatch(draft, input.rangeMapping, input.inlineStylePatch)
      ? "target-mismatch"
      : !mark
        ? "unsupported-style-mark"
        : !rangeIsValid(draft, range)
          ? "invalid-range"
          : null
  const facts = {
    active,
    blocked,
    composing: active && Boolean(draft.isComposing),
    guarded,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)
  const styledRun = status === "applied"
    ? buildStyledRun(draft, mark, enabled, range)
    : null

  return {
    active,
    application: {
      status: status === "applied" ? "applied-to-browser-local-inline-state" : "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    browserInlineState: browserInlineState(draft, status, styledRun),
    canApplyPatch: status === "applied",
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
    mode: DRAFT_RICH_INLINE_PATCH_EXECUTION_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    patch: {
      enabled,
      mark,
      range: range
        ? {
          collapsed: range.collapsed,
          end: range.end,
          length: range.length,
          source: range.source,
          start: range.start,
          unit: range.unit,
        }
        : null,
    },
    reason,
    source: DRAFT_RICH_INLINE_PATCH_EXECUTION_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftRichInlinePatchExecutionLabel(summary) {
  if (!summary?.active) return "Rich inline: idle"
  if (summary.status === "composing") return "Rich inline: composing"
  if (summary.status === "applied") {
    return `Rich inline: ${summary.patch.mark} ${summary.patch.range.length} chars local`
  }
  if (summary.reason === "range-mapping-not-ready") return "Rich inline: range blocked"
  if (summary.reason === "style-patch-not-ready") return "Rich inline: style blocked"
  if (summary.reason === "target-mismatch") return "Rich inline: target mismatch"
  if (summary.reason === "unsupported-style-mark") return "Rich inline: unsupported style"
  return "Rich inline: guarded"
}
