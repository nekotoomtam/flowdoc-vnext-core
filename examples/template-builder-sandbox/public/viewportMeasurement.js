import { resolveViewportRangeRequest } from "./viewportController.js"

export const VIEWPORT_MEASUREMENT_SOURCE = "flowdoc-viewport-measurement"
export const VIEWPORT_MEASUREMENT_MODE = "section-shell-measurement"
export const VIEWPORT_MEASUREMENT_APPLY_MODE = "manual-measurement-apply"

function nonNegativeNumber(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Number(value))
}

function positiveNumber(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Number(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeSectionBox(section, index, viewport) {
  const top = nonNegativeNumber(section?.top, 0)
  const measuredBottom = Number.isFinite(section?.bottom) ? Number(section.bottom) : null
  const measuredHeight = positiveNumber(section?.height, null)
  const bottom = measuredBottom == null
    ? top + (measuredHeight ?? 1)
    : Math.max(top, measuredBottom)
  const height = positiveNumber(measuredHeight ?? bottom - top, 1)
  const visibleTop = Math.max(top, viewport.top)
  const visibleBottom = Math.min(bottom, viewport.bottom)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)
  const viewportCoverage = viewport.height > 0 ? visibleHeight / viewport.height : 0
  const sectionCoverage = height > 0 ? visibleHeight / height : 0
  const sectionCenter = top + height / 2
  const distanceFromViewportCenter = Math.abs(sectionCenter - viewport.center)

  return {
    bottom,
    distanceFromViewportCenter,
    height,
    id: stringOrNull(section?.id),
    index,
    rendered: Boolean(section?.rendered),
    sectionCoverage,
    shellState: stringOrNull(section?.shellState) || (section?.rendered ? "rendered" : "placeholder"),
    top,
    visible: visibleHeight > 0,
    visibleBottom,
    visibleHeight,
    visibleTop,
    viewportCoverage,
  }
}

function compareAnchorSections(left, right) {
  if (left.visibleHeight !== right.visibleHeight) return right.visibleHeight - left.visibleHeight
  if (left.sectionCoverage !== right.sectionCoverage) return right.sectionCoverage - left.sectionCoverage
  if (left.distanceFromViewportCenter !== right.distanceFromViewportCenter) {
    return left.distanceFromViewportCenter - right.distanceFromViewportCenter
  }
  return left.index - right.index
}

export function createViewportMeasurement(input = {}) {
  const viewportTop = nonNegativeNumber(input.scrollTop ?? input.viewportTop, 0)
  const viewportHeight = positiveNumber(input.viewportHeight, 1)
  const scrollHeight = positiveNumber(input.scrollHeight, viewportTop + viewportHeight)
  const viewport = {
    bottom: viewportTop + viewportHeight,
    center: viewportTop + viewportHeight / 2,
    height: viewportHeight,
    top: viewportTop,
  }
  const sections = (input.sections || [])
    .map((section, index) => normalizeSectionBox(section, index, viewport))
    .filter((section) => section.id != null)
  const visibleSections = sections.filter((section) => section.visible)
  const anchorSection = (visibleSections.length > 0 ? visibleSections : sections)
    .slice()
    .sort(compareAnchorSections)[0] || null

  return {
    anchorSectionId: anchorSection?.id || null,
    measuredAtRevision: input.measuredAtRevision ?? null,
    mode: VIEWPORT_MEASUREMENT_MODE,
    scrollHeight,
    scrollTop: viewportTop,
    sectionCount: sections.length,
    sections,
    source: VIEWPORT_MEASUREMENT_SOURCE,
    version: 1,
    viewportBottom: viewport.bottom,
    viewportHeight,
    viewportTop,
    visibleSectionCount: visibleSections.length,
    visibleSectionIds: visibleSections.map((section) => section.id),
  }
}

export function createViewportFactsFromMeasurement(input = {}) {
  const measurement = input.measurement?.source === VIEWPORT_MEASUREMENT_SOURCE
    ? input.measurement
    : createViewportMeasurement(input)

  return {
    anchorSectionId: measurement.anchorSectionId,
    budget: input.budget,
    measurementMode: measurement.mode,
    measurementSource: measurement.source,
    overscanSectionsAfter: input.overscanSectionsAfter,
    overscanSectionsBefore: input.overscanSectionsBefore,
    scrollHeight: measurement.scrollHeight,
    scrollTop: measurement.scrollTop,
    viewportHeight: measurement.viewportHeight,
  }
}

export function resolveMeasuredViewportRangeRequest(input = {}, previousRequest = null) {
  const measurement = input.measurement?.source === VIEWPORT_MEASUREMENT_SOURCE
    ? input.measurement
    : createViewportMeasurement(input)
  const viewportFacts = createViewportFactsFromMeasurement({
    ...input,
    measurement,
  })
  const viewportResult = resolveViewportRangeRequest({
    ...viewportFacts,
    draftActive: input.draftActive,
  }, previousRequest)

  return {
    measurement,
    mode: VIEWPORT_MEASUREMENT_MODE,
    source: VIEWPORT_MEASUREMENT_SOURCE,
    version: 1,
    viewportFacts,
    viewportResult,
  }
}

export function createViewportMeasurementApplyRequest(input = {}, previousRequest = null) {
  const measuredRequest = resolveMeasuredViewportRangeRequest(input, previousRequest)
  const visibleRangeRequest = measuredRequest.viewportResult.visibleRangeRequest

  return {
    anchorSectionId: measuredRequest.measurement.anchorSectionId,
    measurement: measuredRequest.measurement,
    mode: VIEWPORT_MEASUREMENT_APPLY_MODE,
    preserved: measuredRequest.viewportResult.preserved,
    source: VIEWPORT_MEASUREMENT_SOURCE,
    version: 1,
    viewportFacts: measuredRequest.viewportFacts,
    viewportResult: measuredRequest.viewportResult,
    visibleRangeRequest,
  }
}
