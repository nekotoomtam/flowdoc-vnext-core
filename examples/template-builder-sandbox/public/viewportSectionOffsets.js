import { DEFAULT_SECTION_SPACER_HEIGHT, resolveViewportSectionSpacer } from "./viewportSectionSpacers.js"

export const VIEWPORT_SECTION_OFFSET_SOURCE = "flowdoc-section-offset-index"
export const VIEWPORT_SECTION_OFFSET_MODE = "section-spacer-offset-index"
export const VIEWPORT_SECTION_PREDICTION_MODE = "section-offset-viewport-prediction"
export const DEFAULT_SECTION_OFFSET_GAP = 18

function positiveNumber(value, fallback = DEFAULT_SECTION_SPACER_HEIGHT) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Number(value))
}

function nonNegativeNumber(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Number(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function comparePredictedSections(left, right, viewportCenter) {
  if (left.coveragePx !== right.coveragePx) return right.coveragePx - left.coveragePx
  const leftDistance = Math.abs(left.center - viewportCenter)
  const rightDistance = Math.abs(right.center - viewportCenter)
  if (leftDistance !== rightDistance) return leftDistance - rightDistance
  return left.index - right.index
}

export function createViewportSectionOffsetIndex(input = {}) {
  const spacerMap = input.spacerMap || null
  const sectionGap = nonNegativeNumber(input.sectionGap, DEFAULT_SECTION_OFFSET_GAP)
  const originTop = nonNegativeNumber(input.originTop, 0)
  let nextTop = originTop

  const sourceSections = (spacerMap?.sections || [])
    .filter((section) => stringOrNull(section.sectionId) != null)

  const sections = sourceSections.map((section, index) => {
    const sectionId = stringOrNull(section.sectionId)
    const spacer = resolveViewportSectionSpacer(spacerMap, sectionId, {
      defaultSectionHeight: spacerMap?.defaultSectionHeight,
    })
    const height = positiveNumber(spacer.height, spacerMap?.defaultSectionHeight)
    const top = nextTop
    const bottom = top + height
    nextTop = bottom + sectionGap

    return {
      bottom,
      center: top + height / 2,
      gapAfter: sectionGap,
      height,
      index,
      reason: spacer.reason,
      sectionId,
      spacerSource: spacer.source,
      top,
    }
  })

  const totalHeight = sections.length === 0 ? 0 : sections[sections.length - 1].bottom - originTop

  return {
    defaultSectionHeight: positiveNumber(spacerMap?.defaultSectionHeight),
    estimatedSectionCount: spacerMap?.estimatedSectionCount ?? 0,
    measuredAtRevision: spacerMap?.measuredAtRevision ?? null,
    measuredSectionCount: spacerMap?.measuredSectionCount ?? 0,
    mode: VIEWPORT_SECTION_OFFSET_MODE,
    originTop,
    sectionCount: sections.length,
    sectionGap,
    sections,
    source: VIEWPORT_SECTION_OFFSET_SOURCE,
    totalHeight,
    version: 1,
  }
}

export function resolveViewportSectionOffset(offsetIndex, sectionId) {
  return (offsetIndex?.sections || []).find((section) => section.sectionId === sectionId) || null
}

export function predictViewportFromSectionOffsets(input = {}) {
  const offsetIndex = input.offsetIndex?.source === VIEWPORT_SECTION_OFFSET_SOURCE
    ? input.offsetIndex
    : createViewportSectionOffsetIndex(input)
  const scrollTop = nonNegativeNumber(input.scrollTop, 0)
  const viewportHeight = positiveNumber(input.viewportHeight, 1)
  const viewportBottom = scrollTop + viewportHeight
  const viewportCenter = scrollTop + viewportHeight / 2
  const visibleSections = offsetIndex.sections
    .map((section) => {
      const visibleTop = Math.max(section.top, scrollTop)
      const visibleBottom = Math.min(section.bottom, viewportBottom)
      const coveragePx = Math.max(0, visibleBottom - visibleTop)
      const offsetInSection = clamp(scrollTop - section.top, 0, section.height)

      return {
        ...section,
        coveragePx,
        coverageRatio: section.height > 0 ? coveragePx / section.height : 0,
        offsetInSection,
        visible: coveragePx > 0,
        visibleBottom,
        visibleTop,
        viewportCoverageRatio: coveragePx / viewportHeight,
      }
    })
    .filter((section) => section.visible)

  const anchorSection = visibleSections
    .slice()
    .sort((left, right) => comparePredictedSections(left, right, viewportCenter))[0] || null

  return {
    anchorOffsetInSection: anchorSection?.offsetInSection ?? null,
    anchorSectionId: anchorSection?.sectionId ?? null,
    mode: VIEWPORT_SECTION_PREDICTION_MODE,
    offsetIndexMode: offsetIndex.mode,
    predictedSectionIds: visibleSections.map((section) => section.sectionId),
    scrollTop,
    source: VIEWPORT_SECTION_OFFSET_SOURCE,
    version: 1,
    viewportBottom,
    viewportHeight,
    visibleSectionCount: visibleSections.length,
    visibleSections,
  }
}
