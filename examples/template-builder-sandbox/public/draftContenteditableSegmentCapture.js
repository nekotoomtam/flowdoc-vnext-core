export const DRAFT_CONTENTEDITABLE_SEGMENT_CAPTURE_SOURCE = "flowdoc-template-builder-draft-contenteditable-segment-capture"
export const DRAFT_CONTENTEDITABLE_SEGMENT_CAPTURE_MODE = "browser-local-contenteditable-segment-capture-boundary"

const TEXT_NODE = 3
const ELEMENT_NODE = 1
const TEXT_SEGMENT_KINDS = new Set(["plain-text", "text", "styled-run", "styled-text"])
const ATOMIC_SEGMENT_KINDS = new Set(["field-chip", "atomic-inline", "inline-field"])
const SUPPORTED_SEGMENT_KINDS = new Set([...TEXT_SEGMENT_KINDS, ...ATOMIC_SEGMENT_KINDS])

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

function datasetOf(node) {
  return node?.dataset && typeof node.dataset === "object" ? node.dataset : {}
}

function attr(node, name) {
  if (typeof node?.getAttribute === "function") return stringOrNull(node.getAttribute(name))
  const dataset = datasetOf(node)
  const key = name.replace(/^data-/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  return stringOrNull(dataset[key])
}

function boolAttr(value) {
  return value === true || value === "true" || value === ""
}

function nodeIsContenteditable(surface) {
  if (!surface) return false
  if (boolAttr(surface.contentEditable) || boolAttr(surface.isContentEditable) || boolAttr(surface.contenteditable)) return true
  return boolAttr(attr(surface, "contenteditable"))
}

function nodeChildren(node) {
  if (Array.isArray(node?.childNodes)) return node.childNodes
  if (Array.isArray(node?.children)) return node.children
  if (node?.childNodes && typeof node.childNodes.length === "number") return Array.from(node.childNodes)
  if (node?.children && typeof node.children.length === "number") return Array.from(node.children)
  return []
}

function normalizeKind(value) {
  const kind = stringOrNull(value) || "plain-text"
  return kind === "text" ? "plain-text" : kind
}

function segmentKindFromNode(node) {
  if (node?.nodeType === TEXT_NODE) return "plain-text"

  const dataset = datasetOf(node)
  return normalizeKind(
    dataset.contenteditableSegmentKind
      || dataset.segmentKind
      || dataset.kind
      || attr(node, "data-contenteditable-segment-kind")
      || attr(node, "data-segment-kind")
      || node?.kind,
  )
}

function segmentTextFromNode(node, kind) {
  const dataset = datasetOf(node)
  const explicit = dataset.contenteditableSegmentText
    ?? dataset.segmentText
    ?? node?.segmentText
  if (typeof explicit === "string") return explicit
  if (ATOMIC_SEGMENT_KINDS.has(kind)) return ""
  return typeof node?.textContent === "string" ? node.textContent : ""
}

function styleMarksFrom(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.length > 0)
  if (typeof value === "string") {
    return value.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function segmentFromNode(node, fallbackId) {
  const dataset = datasetOf(node)
  const kind = segmentKindFromNode(node)
  const text = segmentTextFromNode(node, kind)

  return {
    fieldKey: stringOrNull(dataset.fieldKey || node?.fieldKey),
    kind,
    placeholder: stringOrNull(dataset.placeholder || node?.placeholder),
    segmentId: stringOrNull(
      dataset.contenteditableSegmentId
        || dataset.segmentId
        || attr(node, "data-contenteditable-segment-id")
        || node?.segmentId,
    ) || fallbackId,
    styleMarks: styleMarksFrom(dataset.styleMarks || node?.styleMarks),
    text,
  }
}

function collectNodeSegments(node, segments, path = "segment") {
  if (!node) return

  if (node.nodeType === TEXT_NODE) {
    const text = typeof node.textContent === "string" ? node.textContent : ""
    if (text.length > 0) {
      segments.push({
        kind: "plain-text",
        segmentId: `${path}-${segments.length}`,
        text,
      })
    }
    return
  }

  if (node.nodeType === ELEMENT_NODE || node.kind || node.segmentId || datasetOf(node).contenteditableSegmentKind) {
    const hasExplicitSegment = Boolean(
      node.kind
        || node.segmentId
        || datasetOf(node).contenteditableSegmentKind
        || datasetOf(node).segmentKind
        || attr(node, "data-contenteditable-segment-kind"),
    )
    if (hasExplicitSegment) {
      segments.push(segmentFromNode(node, `${path}-${segments.length}`))
      return
    }
  }

  for (const child of nodeChildren(node)) {
    collectNodeSegments(child, segments, path)
  }
}

function segmentsFromSurface(surface) {
  if (!surface) return []
  if (Array.isArray(surface.segments)) return surface.segments

  const segments = []
  collectNodeSegments(surface, segments, "dom-segment")
  return segments
}

function normalizeSegments(rawSegments) {
  let nextStart = 0
  return arrayOrEmpty(rawSegments).map((segment, index) => {
    const kind = normalizeKind(segment?.kind)
    const text = typeof segment?.text === "string" ? segment.text : ""
    const start = integerOrNull(segment?.draftStart) ?? nextStart
    const end = integerOrNull(segment?.draftEnd) ?? start + text.length
    nextStart = end

    return {
      draftEnd: end,
      draftStart: start,
      fieldKey: stringOrNull(segment?.fieldKey),
      kind,
      placeholder: stringOrNull(segment?.placeholder),
      segmentId: stringOrNull(segment?.segmentId) || `segment-${index}`,
      styleMarks: styleMarksFrom(segment?.styleMarks),
      text,
    }
  })
}

function textContribution(segment) {
  return ATOMIC_SEGMENT_KINDS.has(segment.kind) ? "" : segment.text
}

function capturedPlainText(segments) {
  return segments.map(textContribution).join("")
}

function validateSegments(draft, surface, segments) {
  if (!surface) return "surface-missing"
  if (!nodeIsContenteditable(surface)) return "contenteditable-root-missing"
  if (segments.length === 0) return "missing-segments"

  const target = stringOrNull(surface.targetTextBlockId || datasetOf(surface).textBlockId)
  if (target && activeDraft(draft) && target !== draft.textBlockId) return "target-mismatch"

  for (const segment of segments) {
    if (!SUPPORTED_SEGMENT_KINDS.has(segment.kind)) return "unsupported-segment-kind"
    if (segment.draftStart < 0 || segment.draftEnd < segment.draftStart) return "segment-range-invalid"
    if (!ATOMIC_SEGMENT_KINDS.has(segment.kind) && segment.draftEnd - segment.draftStart !== segment.text.length) {
      return "segment-range-mismatch"
    }
    if (ATOMIC_SEGMENT_KINDS.has(segment.kind) && segment.fieldKey == null) return "atomic-field-key-missing"
  }

  const draftText = typeof draft?.text === "string" ? draft.text : ""
  if (capturedPlainText(segments) !== draftText) return "text-mismatch"
  return null
}

function segmentForOffset(segments, offset) {
  const textSegments = segments.filter((segment) => !ATOMIC_SEGMENT_KINDS.has(segment.kind))
  const exactStart = textSegments.find((segment) => offset === segment.draftStart)
  if (exactStart) return exactStart

  return textSegments.find((segment) => offset >= segment.draftStart && offset <= segment.draftEnd)
    || textSegments[textSegments.length - 1]
    || segments[0]
    || null
}

function draftSelection(draft, segments) {
  if (!activeDraft(draft)) return null
  const start = integerOrNull(draft.selectionStart) ?? draft.text.length
  const end = integerOrNull(draft.selectionEnd) ?? start
  const backward = draft.selectionDirection === "backward"
  const anchorValue = backward ? end : start
  const focusValue = backward ? start : end
  const anchorSegment = segmentForOffset(segments, anchorValue)
  const focusSegment = segmentForOffset(segments, focusValue)
  if (!anchorSegment || !focusSegment) return null

  return {
    anchorOffset: Math.max(0, anchorValue - anchorSegment.draftStart),
    anchorSegmentId: anchorSegment.segmentId,
    direction: draft.selectionDirection || "none",
    focusOffset: Math.max(0, focusValue - focusSegment.draftStart),
    focusSegmentId: focusSegment.segmentId,
    source: draft.selectionSource || "contenteditable-capture",
  }
}

function selectionIssue(selection, segments) {
  if (!selection) return "selection-missing"
  const segmentById = new Map(segments.map((segment) => [segment.segmentId, segment]))

  for (const endpoint of ["anchor", "focus"]) {
    const segmentId = stringOrNull(selection[`${endpoint}SegmentId`])
    if (!segmentId) return "selection-segment-missing"
    const segment = segmentById.get(segmentId)
    if (!segment) return "selection-segment-missing"
    const offset = integerOrNull(selection[`${endpoint}Offset`])
    if (offset == null || offset < 0 || offset > Math.max(0, segment.draftEnd - segment.draftStart)) {
      return "selection-offset-out-of-range"
    }
  }

  return null
}

function segmentFacts(segments) {
  return segments.map((segment) => ({
    draftEnd: segment.draftEnd,
    draftStart: segment.draftStart,
    fieldKey: segment.fieldKey,
    kind: segment.kind,
    placeholder: segment.placeholder,
    segmentId: segment.segmentId,
    styleMarks: segment.styleMarks,
    text: segment.text,
    textLength: segment.text.length,
  }))
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
  return facts.issue || "contenteditable-segments-captured"
}

export function createDraftContenteditableSegmentCapture(draft, input = {}) {
  const active = activeDraft(draft)
  const surface = input.surface || null
  const segments = normalizeSegments(segmentsFromSurface(surface))
  const selection = input.selection || draftSelection(draft, segments)
  const issue = active
    ? validateSegments(draft, surface, segments) || selectionIssue(selection, segments)
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
      status: "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    canCaptureSegments: status === "ready",
    contenteditable: {
      contentEditable: Boolean(surface && nodeIsContenteditable(surface)),
      rootId: stringOrNull(surface?.rootId || datasetOf(surface).rootId) || null,
      source: surface?.childNodes || surface?.children ? "browser-owned-dom-inspection" : "bounded-surface-facts",
      status: status === "ready" ? "captured" : "not-captured",
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
    mode: DRAFT_CONTENTEDITABLE_SEGMENT_CAPTURE_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    plainText: capturedPlainText(segments),
    reason,
    segmentCount: status === "ready" ? segments.length : 0,
    segments: status === "ready" ? segmentFacts(segments) : [],
    selection: status === "ready" ? selection : null,
    source: DRAFT_CONTENTEDITABLE_SEGMENT_CAPTURE_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    textEngine: {
      rangeUnit: "utf16-code-unit-offset",
      status: "not-executed",
    },
    version: 1,
  }
}

export function draftContenteditableSegmentCaptureLabel(summary) {
  if (!summary?.active) return "Segment capture: idle"
  if (summary.status === "composing") return "Segment capture: composing"
  if (summary.status === "ready") return `Segment capture: ${summary.segmentCount} captured`
  if (summary.reason === "contenteditable-root-missing") return "Segment capture: root blocked"
  if (summary.reason === "text-mismatch") return "Segment capture: text mismatch"
  if (summary.reason === "selection-offset-out-of-range") return "Segment capture: selection blocked"
  return "Segment capture: blocked"
}
