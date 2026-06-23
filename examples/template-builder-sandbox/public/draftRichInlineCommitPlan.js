export const DRAFT_RICH_INLINE_COMMIT_PLAN_SOURCE = "flowdoc-template-builder-draft-rich-inline-commit-plan"
export const DRAFT_RICH_INLINE_COMMIT_PLAN_MODE = "browser-local-rich-inline-commit-planning-boundary"

const RANGE_UNIT = "utf16-code-unit-offset"
const SUPPORTED_STYLE_MARKS = new Set(["bold", "italic", "underline", "strikethrough"])
const TEXT_SEGMENT_KIND = "text"
const ATOMIC_SEGMENT_KIND = "atomic-chip"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function finiteIntegerOrNull(value) {
  return Number.isFinite(value) ? Math.trunc(value) : null
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : []
}

function richInlineSummary(input) {
  return input.richInlineState || input.draftRichInlineState || null
}

function richInlineState(input) {
  return input.browserRichInlineState || richInlineSummary(input)?.browserRichInlineState || null
}

function documentRevision(input) {
  return finiteIntegerOrNull(input.documentRevision)
}

function normalizedRevision(draft) {
  return finiteIntegerOrNull(draft?.baseRevision)
}

function revisionIssue(draft, input) {
  const baseRevision = normalizedRevision(draft)
  const currentRevision = documentRevision(input)
  if (baseRevision == null || currentRevision == null) return null
  return baseRevision === currentRevision ? null : "stale-draft-revision"
}

function richInlineReadinessIssue(input, state) {
  const summary = richInlineSummary(input)
  if (!state) return "missing-rich-inline-state"
  if (summary && summary.status !== "ready") return "rich-inline-state-not-ready"
  if (state.status !== "normalized") return "rich-inline-state-not-ready"
  return null
}

function targetIssue(draft, state) {
  const target = activeDraft(draft) ? draft.textBlockId : null
  if (!target || !state?.targetTextBlockId) return null
  return state.targetTextBlockId === target ? null : "target-mismatch"
}

function textIssue(draft, state) {
  const draftText = typeof draft?.text === "string" ? draft.text : ""
  if (typeof state?.plainText !== "string") return "text-mismatch"
  if (state.plainText !== draftText) return "text-mismatch"
  if (Number.isInteger(state.textLength) && state.textLength !== draftText.length) return "text-mismatch"
  return null
}

function styleMarksFrom(value) {
  return arrayOrEmpty(value).filter((mark) => typeof mark === "string" && mark.length > 0)
}

function styleRunIssue(state) {
  const runs = arrayOrEmpty(state?.styledRuns)
    .map((run) => ({
      end: integerOrNull(run?.range?.end),
      mark: stringOrNull(run?.mark),
      start: integerOrNull(run?.range?.start),
    }))
    .sort((left, right) => (left.start ?? 0) - (right.start ?? 0) || (left.end ?? 0) - (right.end ?? 0))

  let previousEnd = 0
  for (const run of runs) {
    if (!run.mark || !SUPPORTED_STYLE_MARKS.has(run.mark)) return "unsupported-style-mark"
    if (run.start == null || run.end == null || run.start < 0 || run.end <= run.start) {
      return "invalid-style-run-range"
    }
    if (run.start < previousEnd) return "unsupported-overlap"
    previousEnd = run.end
  }

  return null
}

function atomicChipIssue(state) {
  const chips = arrayOrEmpty(state?.atomicChips)
  return chips.some((chip) => !stringOrNull(chip?.fieldKey)) ? "missing-field-key" : null
}

function styleForMarks(marks) {
  const style = {}
  if (marks.includes("bold")) style.fontWeight = "bold"
  if (marks.includes("italic")) style.fontStyle = "italic"
  if (marks.includes("underline")) style.textDecoration = "underline"
  if (marks.includes("strikethrough")) style.strikethrough = true
  return Object.keys(style).length > 0 ? style : null
}

function idToken(value) {
  const token = String(value || "inline")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
  return token || "inline"
}

function textInlineId(targetTextBlockId, index) {
  return `${targetTextBlockId}-commit-text-${index + 1}`
}

function fieldInlineId(targetTextBlockId, fieldKey, index) {
  return `${targetTextBlockId}-commit-field-${idToken(fieldKey)}-${index + 1}`
}

function textInline(segment, targetTextBlockId, index) {
  const marks = styleMarksFrom(segment.styleMarks)
  const style = styleForMarks(marks)
  return {
    id: textInlineId(targetTextBlockId, index),
    text: segment.text,
    type: "text",
    ...(style == null ? {} : { style }),
  }
}

function fieldRefInline(segment, targetTextBlockId, index) {
  return {
    id: fieldInlineId(targetTextBlockId, segment.fieldKey, index),
    key: segment.fieldKey,
    type: "field-ref",
    ...(stringOrNull(segment.label) == null ? {} : { label: segment.label }),
    ...(stringOrNull(segment.placeholder) == null ? {} : { fallback: segment.placeholder }),
  }
}

function segmentIssue(state, draft) {
  const segments = arrayOrEmpty(state?.segments)
  const plainText = typeof state?.plainText === "string" ? state.plainText : ""
  if (segments.length === 0 && plainText.length > 0) return "missing-rich-inline-segments"

  let capturedText = ""
  for (const segment of segments) {
    if (segment?.kind === TEXT_SEGMENT_KIND) {
      const start = integerOrNull(segment.start)
      const end = integerOrNull(segment.end)
      if (start == null || end == null || start < 0 || end < start) return "invalid-segment-range"
      if (typeof segment.text !== "string" || segment.text.length !== end - start) return "segment-text-mismatch"
      if (plainText.slice(start, end) !== segment.text) return "segment-text-mismatch"
      if (styleMarksFrom(segment.styleMarks).some((mark) => !SUPPORTED_STYLE_MARKS.has(mark))) {
        return "unsupported-style-mark"
      }
      capturedText += segment.text
      continue
    }

    if (segment?.kind === ATOMIC_SEGMENT_KIND) {
      if (!stringOrNull(segment.fieldKey)) return "missing-field-key"
      const position = integerOrNull(segment.position)
      if (position == null || position < 0 || position > plainText.length) return "invalid-segment-range"
      continue
    }

    return "unsupported-segment-kind"
  }

  const draftText = typeof draft?.text === "string" ? draft.text : ""
  return capturedText === draftText ? null : "text-mismatch"
}

function plannedInlineChildren(state, targetTextBlockId) {
  return arrayOrEmpty(state?.segments).flatMap((segment, index) => {
    if (segment.kind === TEXT_SEGMENT_KIND) {
      if (!segment.text) return []
      return [textInline(segment, targetTextBlockId, index)]
    }
    if (segment.kind === ATOMIC_SEGMENT_KIND) return [fieldRefInline(segment, targetTextBlockId, index)]
    return []
  })
}

function uniqueFieldKeys(children) {
  return [...new Set(children.filter((child) => child.type === "field-ref").map((child) => child.key))].sort()
}

function planIdFor(draft, currentRevision) {
  const revision = currentRevision ?? normalizedRevision(draft) ?? "unknown"
  return `${draft.textBlockId}:rich-inline-commit:${revision}`
}

function createCommitPlan(status, draft, input, state) {
  if (status !== "planned") {
    return {
      status: "not-created",
    }
  }

  const targetTextBlockId = draft.textBlockId
  const currentRevision = documentRevision(input)
  const children = plannedInlineChildren(state, targetTextBlockId)
  const fieldKeys = uniqueFieldKeys(children)

  return {
    baseRevision: normalizedRevision(draft),
    dirtyScope: {
      kind: "text-block",
      parentNodeIds: "resolved-by-core-graph-at-commit",
      status: "planned-at-commit",
      textBlockId: targetTextBlockId,
    },
    documentRevision: currentRevision,
    fieldKeys,
    historyIntent: {
      coalesce: "single-entry",
      durableIntent: "content",
      kind: "text-edit",
      mergeKey: `rich-inline:${targetTextBlockId}`,
      status: "planned-not-recorded",
      summary: `commit rich inline draft for ${targetTextBlockId}`,
    },
    inlineChildCount: children.length,
    keyHistory: {
      fieldKeys,
      status: fieldKeys.length > 0 ? "field-ref-usage-check-planned" : "not-required",
    },
    operationKind: "text-block.rich-inline.replace",
    planId: planIdFor(draft, currentRevision),
    plannedInlineChildren: children,
    rendererInvalidation: {
      scopes: ["text-measurement", "pagination", "exact-output"],
      status: "planned-after-commit",
    },
    sourceState: {
      atomicChipCount: state.atomicChipCount || 0,
      plainTextPreserved: state.plainTextPreserved === true,
      segmentCount: arrayOrEmpty(state.segments).length,
      styledRunCount: state.styledRunCount || 0,
      textLength: state.textLength ?? draft.text.length,
    },
    status: "planned",
    targetTextBlockId,
    transaction: {
      kind: "rich-inline-replace",
      operationKind: "text-block.rich-inline.replace",
      status: "planned-not-run",
    },
  }
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.issue) return "blocked"
  return "planned"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  return facts.issue || "canonical-rich-inline-commit-planned"
}

export function createDraftRichInlineCommitPlan(draft, input = {}) {
  const active = activeDraft(draft)
  const state = richInlineState(input)
  const issue = active
    ? richInlineReadinessIssue(input, state)
      || revisionIssue(draft, input)
      || targetIssue(draft, state)
      || textIssue(draft, state)
      || styleRunIssue(state)
      || atomicChipIssue(state)
      || segmentIssue(state, draft)
    : null
  const facts = {
    active,
    composing: active && Boolean(draft.isComposing),
    issue,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)
  const commitPlan = createCommitPlan(status, draft, input, state)

  return {
    active,
    application: {
      status: "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    canPlanCommit: status === "planned",
    canonicalCommit: commitPlan,
    coreTransaction: {
      status: status === "planned" ? "planned-not-run" : "not-run",
    },
    durableHistory: {
      status: "not-written",
    },
    exactGeneration: {
      status: status === "planned" ? "stale-after-commit" : "deferred-until-commit",
    },
    history: {
      status: status === "planned" ? "planned-not-recorded" : "not-recorded",
    },
    keyHistory: commitPlan.keyHistory || {
      fieldKeys: [],
      status: "not-required",
    },
    liveLayout: {
      status: status === "planned" ? "invalidation-planned" : "not-requested",
    },
    mode: DRAFT_RICH_INLINE_COMMIT_PLAN_MODE,
    packageMutation: {
      status: status === "planned" ? "planned-not-applied" : "deferred-until-commit",
    },
    persistence: {
      status: "not-written",
    },
    reason,
    source: DRAFT_RICH_INLINE_COMMIT_PLAN_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    textEngine: {
      rangeUnit: RANGE_UNIT,
      status: "not-executed",
    },
    version: 1,
  }
}

export function draftRichInlineCommitPlanLabel(summary) {
  if (!summary?.active) return "Commit plan: idle"
  if (summary.status === "composing") return "Commit plan: composing"
  if (summary.status === "planned") {
    return `Commit plan: ${summary.canonicalCommit.inlineChildCount} inline children`
  }
  if (summary.reason === "stale-draft-revision") return "Commit plan: stale draft"
  if (summary.reason === "rich-inline-state-not-ready") return "Commit plan: rich state blocked"
  if (summary.reason === "text-mismatch") return "Commit plan: text mismatch"
  if (summary.reason === "missing-field-key") return "Commit plan: field key blocked"
  if (summary.reason === "unsupported-overlap") return "Commit plan: overlap blocked"
  if (summary.reason === "target-mismatch") return "Commit plan: target mismatch"
  return "Commit plan: blocked"
}
