export const VIEWPORT_ANCHOR_SOURCE = "flowdoc-viewport-anchor"
export const VIEWPORT_SECTION_ANCHOR_MODE = "section-shell-anchor"
export const VIEWPORT_SECTION_ANCHOR_RESTORE_MODE = "section-shell-anchor-restore"

function nonNegativeNumber(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Number(value))
}

function positiveNumber(value, fallback = 1) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Number(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function findSection(measurement, sectionId) {
  return (measurement?.sections || []).find((section) => section.id === sectionId) || null
}

function sectionAnchorId(measurement, input) {
  return stringOrNull(input.sectionId)
    || stringOrNull(measurement?.anchorSectionId)
    || stringOrNull(measurement?.visibleSectionIds?.[0])
    || stringOrNull(measurement?.sections?.[0]?.id)
}

export function createViewportSectionAnchor(input = {}) {
  const measurement = input.measurement || null
  const sectionId = sectionAnchorId(measurement, input)
  const section = sectionId ? findSection(measurement, sectionId) : null
  const sectionTop = nonNegativeNumber(section?.top, 0)
  const sectionHeight = positiveNumber(section?.height, 1)
  const measuredScrollTop = nonNegativeNumber(input.scrollTop ?? measurement?.scrollTop, 0)
  const measuredOffset = Number.isFinite(input.offsetInSection)
    ? Number(input.offsetInSection)
    : measuredScrollTop - sectionTop
  const offsetInSection = clamp(nonNegativeNumber(measuredOffset, 0), 0, sectionHeight)

  return {
    kind: "section",
    measuredAtRevision: input.measuredAtRevision ?? measurement?.measuredAtRevision ?? null,
    mode: VIEWPORT_SECTION_ANCHOR_MODE,
    offsetInSection,
    scrollTop: measuredScrollTop,
    sectionHeight,
    sectionId,
    sectionTop,
    source: VIEWPORT_ANCHOR_SOURCE,
    version: 1,
    viewportHeight: positiveNumber(input.viewportHeight ?? measurement?.viewportHeight, 1),
  }
}

export function resolveViewportSectionAnchorScrollTop(input = {}) {
  const anchor = input.anchor?.source === VIEWPORT_ANCHOR_SOURCE
    ? input.anchor
    : createViewportSectionAnchor(input.anchor || input)
  const measurement = input.measurement || null
  const section = anchor.sectionId ? findSection(measurement, anchor.sectionId) : null
  const fallbackScrollTop = nonNegativeNumber(
    input.fallbackScrollTop ?? anchor.scrollTop ?? measurement?.scrollTop,
    0,
  )
  const viewportHeight = positiveNumber(measurement?.viewportHeight ?? anchor.viewportHeight, 1)
  const scrollHeight = positiveNumber(measurement?.scrollHeight, fallbackScrollTop + viewportHeight)
  const maxScrollTop = Math.max(0, scrollHeight - viewportHeight)

  if (!section) {
    return {
      anchor,
      mode: VIEWPORT_SECTION_ANCHOR_RESTORE_MODE,
      reason: "section-missing",
      restored: false,
      scrollTop: clamp(fallbackScrollTop, 0, maxScrollTop),
      source: VIEWPORT_ANCHOR_SOURCE,
      version: 1,
    }
  }

  return {
    anchor,
    mode: VIEWPORT_SECTION_ANCHOR_RESTORE_MODE,
    reason: "section-anchor",
    restored: true,
    scrollTop: clamp(nonNegativeNumber(section.top, 0) + anchor.offsetInSection, 0, maxScrollTop),
    source: VIEWPORT_ANCHOR_SOURCE,
    version: 1,
  }
}
