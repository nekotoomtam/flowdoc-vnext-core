export const DRAFT_CONTENTEDITABLE_RANGE_MAPPING_SOURCE = "flowdoc-template-builder-draft-contenteditable-range-mapping"
export const DRAFT_CONTENTEDITABLE_RANGE_MAPPING_MODE = "browser-local-contenteditable-range-mapping-boundary"
export const DRAFT_CONTENTEDITABLE_RANGE_UNIT = "utf16-code-unit-offset"

const SAFE_SEGMENT_KINDS = new Set(["plain-text", "text"])
const ATOMIC_SEGMENT_KINDS = new Set(["atomic-inline", "field-chip", "inline-field"])
const STYLED_SEGMENT_KINDS = new Set(["styled-text", "styled-run"])

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function finiteInteger(value) {
  return Number.isFinite(value) ? Math.trunc(value) : null
}

function normalizeKind(kind) {
  return stringOrNull(kind) || "plain-text"
}

function normalizeSegments(segments) {
  if (!Array.isArray(segments)) return []

  let nextStart = 0
  return segments.map((segment, index) => {
    const text = typeof segment?.text === "string" ? segment.text : ""
    const explicitStart = finiteInteger(segment?.draftStart)
    const start = explicitStart == null ? nextStart : explicitStart
    const explicitEnd = finiteInteger(segment?.draftEnd)
    const end = explicitEnd == null ? start + text.length : explicitEnd
    nextStart = end

    return {
      draftEnd: end,
      draftStart: start,
      kind: normalizeKind(segment?.kind),
      segmentId: stringOrNull(segment?.segmentId) || `segment-${index}`,
      text,
    }
  })
}

function segmentFacts(segments) {
  return segments.map((segment) => ({
    draftEnd: segment.draftEnd,
    draftStart: segment.draftStart,
    kind: segment.kind,
    segmentId: segment.segmentId,
    textLength: segment.text.length,
  }))
}

function segmentIssue(draftText, segments) {
  if (segments.length === 0) return "missing-segments"

  const sorted = [...segments].sort((left, right) => left.draftStart - right.draftStart)
  let expectedStart = 0
  for (const segment of sorted) {
    if (STYLED_SEGMENT_KINDS.has(segment.kind)) return "styled-run-needs-rich-inline-mapping"
    if (ATOMIC_SEGMENT_KINDS.has(segment.kind)) return "atomic-inline-needs-inline-node-mapping"
    if (!SAFE_SEGMENT_KINDS.has(segment.kind)) return "unsupported-segment-kind"
    if (segment.draftStart < 0 || segment.draftEnd < segment.draftStart) return "segment-range-invalid"
    if (segment.draftEnd - segment.draftStart !== segment.text.length) return "segment-range-mismatch"
    if (segment.draftStart !== expectedStart) return "segment-coverage-mismatch"
    if (draftText.slice(segment.draftStart, segment.draftEnd) !== segment.text) return "text-mismatch"
    expectedStart = segment.draftEnd
  }

  if (expectedStart !== draftText.length) return "segment-coverage-mismatch"
  return null
}

function segmentById(segments) {
  return new Map(segments.map((segment) => [segment.segmentId, segment]))
}

function draftSelectionForSegments(draft, segments) {
  if (!activeDraft(draft) || segments.length === 0) return null
  const first = segments[0]
  const start = Number.isInteger(draft.selectionStart) ? draft.selectionStart : draft.text.length
  const end = Number.isInteger(draft.selectionEnd) ? draft.selectionEnd : start
  const backward = draft.selectionDirection === "backward"
  return {
    anchorOffset: backward ? end : start,
    anchorSegmentId: first.segmentId,
    direction: draft.selectionDirection || "none",
    focusOffset: backward ? start : end,
    focusSegmentId: first.segmentId,
    source: draft.selectionSource || "draft-selection",
  }
}

function endpointInput(selection, endpoint) {
  if (!selection) return null
  const nested = selection[endpoint]
  if (nested && typeof nested === "object") {
    return {
      offset: nested.offset,
      segmentId: nested.segmentId,
    }
  }
  const prefix = endpoint === "anchor" ? "anchor" : "focus"
  return {
    offset: selection[`${prefix}Offset`],
    segmentId: selection[`${prefix}SegmentId`],
  }
}

function resolveEndpoint(selection, endpoint, segmentsById) {
  const input = endpointInput(selection, endpoint)
  const segmentId = stringOrNull(input?.segmentId)
  if (!segmentId) return { issue: "selection-segment-missing" }

  const segment = segmentsById.get(segmentId)
  if (!segment) return { issue: "selection-segment-missing" }

  const offset = finiteInteger(input.offset)
  if (offset == null || offset < 0 || offset > segment.text.length) {
    return { issue: "selection-offset-out-of-range" }
  }

  return {
    offset,
    segmentId,
    value: segment.draftStart + offset,
  }
}

function directionForSelection(selection, anchorValue, focusValue) {
  if (selection?.direction === "backward") return "backward"
  if (selection?.direction === "forward") return "forward"
  if (anchorValue > focusValue) return "backward"
  if (anchorValue < focusValue) return "forward"
  return "none"
}

function buildRange(selection, segments) {
  const segmentsById = segmentById(segments)
  const anchor = resolveEndpoint(selection, "anchor", segmentsById)
  if (anchor.issue) return { issue: anchor.issue, range: null }

  const focus = resolveEndpoint(selection, "focus", segmentsById)
  if (focus.issue) return { issue: focus.issue, range: null }

  const start = Math.min(anchor.value, focus.value)
  const end = Math.max(anchor.value, focus.value)
  return {
    issue: null,
    range: {
      anchor: {
        offset: anchor.offset,
        segmentId: anchor.segmentId,
        value: anchor.value,
      },
      collapsed: start === end,
      direction: directionForSelection(selection, anchor.value, focus.value),
      end,
      focus: {
        offset: focus.offset,
        segmentId: focus.segmentId,
        value: focus.value,
      },
      length: end - start,
      source: stringOrNull(selection?.source) || "contenteditable-selection",
      start,
      unit: DRAFT_CONTENTEDITABLE_RANGE_UNIT,
    },
  }
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
  return facts.issue || "contenteditable-range-mapped"
}

export function createDraftContenteditableRangeMapping(draft, input = {}) {
  const active = activeDraft(draft)
  const segments = normalizeSegments(input.segments)
  const text = active && typeof draft.text === "string" ? draft.text : ""
  const segmentProblem = active ? segmentIssue(text, segments) : null
  const selection = input.selection || draftSelectionForSegments(draft, segments)
  const rangeResult = active && !segmentProblem
    ? buildRange(selection, segments)
    : { issue: segmentProblem, range: null }
  const facts = {
    active,
    composing: active && Boolean(draft.isComposing),
    issue: segmentProblem || rangeResult.issue,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)

  return {
    active,
    application: {
      status: "not-applied",
    },
    canMapRange: status === "ready",
    contenteditable: {
      source: "bounded-segment-facts",
      status: "not-bound",
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
    mode: DRAFT_CONTENTEDITABLE_RANGE_MAPPING_MODE,
    range: status === "ready" ? rangeResult.range : null,
    reason,
    segmentCount: segments.length,
    segments: segmentFacts(segments),
    source: DRAFT_CONTENTEDITABLE_RANGE_MAPPING_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    textEngine: {
      rangeUnit: DRAFT_CONTENTEDITABLE_RANGE_UNIT,
      status: "not-executed",
    },
    version: 1,
  }
}

export function draftContenteditableRangeMappingLabel(summary) {
  if (!summary?.active) return "Contenteditable range: idle"
  if (summary.status === "composing") return "Contenteditable range: composing"
  if (summary.status === "ready" && summary.range?.collapsed) {
    return `Contenteditable range: cursor ${summary.range.start} mapped`
  }
  if (summary.status === "ready" && summary.range) {
    return `Contenteditable range: ${summary.range.start}-${summary.range.end} mapped`
  }
  if (summary.reason === "styled-run-needs-rich-inline-mapping") {
    return "Contenteditable range: styled run blocked"
  }
  if (summary.reason === "atomic-inline-needs-inline-node-mapping") {
    return "Contenteditable range: atomic inline blocked"
  }
  if (summary.reason === "text-mismatch") return "Contenteditable range: text mismatch"
  return "Contenteditable range: blocked"
}
