export const RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE = "flowdoc-renderer-segment-hit-test-evidence" as const
export const RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE = "renderer-segment-hit-test-evidence-boundary" as const

export type HitTestAffinity = "before" | "inside" | "after" | "atomic-boundary" | "unknown"
export type HitTestConfidence = "exact" | "nearest" | "low" | "none"

export interface RendererSegmentRange {
  start: number
  end: number
}

export interface RendererSegmentBox {
  height: number
  width: number
  x: number
  y: number
}

export interface RendererSegmentFact {
  atomic: boolean
  box: RendererSegmentBox
  fieldChip: boolean
  glyphRange: RendererSegmentRange
  inlineChildId: string
  lineIndex: number
  segmentId: string
  styleFacts?: Record<string, string | number | boolean>
  textBlockId: string
  utf16Range: RendererSegmentRange
}

export interface RendererHitTestRequest {
  point: {
    x: number
    y: number
  }
  textBlockId?: string
}

export interface RendererSegmentEvidenceIssue {
  code:
    | "missing-segment-id"
    | "missing-text-block-id"
    | "invalid-utf16-range"
    | "invalid-glyph-range"
    | "invalid-line-index"
    | "invalid-box"
    | "field-chip-must-be-atomic"
    | "overlapping-utf16-range"
  path: string
}

export interface RendererSegmentEvidenceResult {
  issues: RendererSegmentEvidenceIssue[]
  mode: typeof RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE
  segmentCount: number
  source: typeof RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE
  status: "ready" | "blocked"
  version: 1
}

export interface RendererHitTestEvidenceResult extends RendererSegmentEvidenceResult {
  hit: {
    affinity: HitTestAffinity
    confidence: HitTestConfidence
    nearestOffset: number | null
    segmentId: string | null
  }
  request: RendererHitTestRequest
}

function issue(code: RendererSegmentEvidenceIssue["code"], path: string): RendererSegmentEvidenceIssue {
  return { code, path }
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function validRange(range: RendererSegmentRange | undefined, allowCollapsed = false): boolean {
  if (!range) return false
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) return false
  if (range.start < 0 || range.end < 0) return false
  return allowCollapsed ? range.end >= range.start : range.end > range.start
}

function validBox(box: RendererSegmentBox | undefined): boolean {
  return Boolean(box && finite(box.x) && finite(box.y) && finite(box.width) && finite(box.height) && box.width >= 0 && box.height >= 0)
}

function pointInside(box: RendererSegmentBox, point: RendererHitTestRequest["point"]): boolean {
  return point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height
}

function centerDistance(box: RendererSegmentBox, point: RendererHitTestRequest["point"]): number {
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  return Math.hypot(point.x - centerX, point.y - centerY)
}

function offsetFor(segment: RendererSegmentFact, point: RendererHitTestRequest["point"]): number {
  if (segment.atomic) return segment.utf16Range.start
  if (segment.box.width <= 0) return segment.utf16Range.start
  const ratio = Math.max(0, Math.min(1, (point.x - segment.box.x) / segment.box.width))
  const span = segment.utf16Range.end - segment.utf16Range.start
  return segment.utf16Range.start + Math.round(span * ratio)
}

function affinityFor(segment: RendererSegmentFact, offset: number, exact: boolean): HitTestAffinity {
  if (segment.atomic) return "atomic-boundary"
  if (!exact) return "unknown"
  if (offset <= segment.utf16Range.start) return "before"
  if (offset >= segment.utf16Range.end) return "after"
  return "inside"
}

export function validateRendererSegmentEvidence(segments: RendererSegmentFact[]): RendererSegmentEvidenceResult {
  const issues: RendererSegmentEvidenceIssue[] = []
  const sorted = [...segments].sort((left, right) => (
    left.textBlockId.localeCompare(right.textBlockId)
    || left.utf16Range.start - right.utf16Range.start
    || left.utf16Range.end - right.utf16Range.end
  ))

  sorted.forEach((segment, index) => {
    const path = `segments.${index}`
    if (!segment.segmentId) issues.push(issue("missing-segment-id", `${path}.segmentId`))
    if (!segment.textBlockId) issues.push(issue("missing-text-block-id", `${path}.textBlockId`))
    if (!validRange(segment.utf16Range)) issues.push(issue("invalid-utf16-range", `${path}.utf16Range`))
    if (!validRange(segment.glyphRange, true)) issues.push(issue("invalid-glyph-range", `${path}.glyphRange`))
    if (!Number.isInteger(segment.lineIndex) || segment.lineIndex < 0) issues.push(issue("invalid-line-index", `${path}.lineIndex`))
    if (!validBox(segment.box)) issues.push(issue("invalid-box", `${path}.box`))
    if (segment.fieldChip && !segment.atomic) issues.push(issue("field-chip-must-be-atomic", `${path}.atomic`))
  })

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1]
    const current = sorted[index]
    if (
      previous.textBlockId === current.textBlockId
      && validRange(previous.utf16Range)
      && validRange(current.utf16Range)
      && current.utf16Range.start < previous.utf16Range.end
    ) {
      issues.push(issue("overlapping-utf16-range", `segments.${index}.utf16Range`))
    }
  }

  return {
    issues,
    mode: RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE,
    segmentCount: segments.length,
    source: RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE,
    status: issues.length === 0 ? "ready" : "blocked",
    version: 1,
  }
}

export function createRendererHitTestEvidence(
  segments: RendererSegmentFact[],
  request: RendererHitTestRequest,
): RendererHitTestEvidenceResult {
  const validation = validateRendererSegmentEvidence(segments)
  const candidates = request.textBlockId
    ? segments.filter((segment) => segment.textBlockId === request.textBlockId)
    : segments
  const exact = candidates.find((segment) => pointInside(segment.box, request.point)) ?? null
  const nearest = exact ?? candidates
    .map((segment) => ({ distance: centerDistance(segment.box, request.point), segment }))
    .sort((left, right) => left.distance - right.distance)[0]?.segment ?? null

  if (validation.status === "blocked" || !nearest) {
    return {
      ...validation,
      hit: {
        affinity: "unknown",
        confidence: validation.status === "blocked" ? "none" : "low",
        nearestOffset: null,
        segmentId: null,
      },
      request,
    }
  }

  const nearestOffset = offsetFor(nearest, request.point)
  return {
    ...validation,
    hit: {
      affinity: affinityFor(nearest, nearestOffset, Boolean(exact)),
      confidence: exact ? "exact" : "nearest",
      nearestOffset,
      segmentId: nearest.segmentId,
    },
    request,
  }
}
