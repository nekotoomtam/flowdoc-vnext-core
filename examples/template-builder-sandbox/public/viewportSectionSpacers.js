export const VIEWPORT_SECTION_SPACER_SOURCE = "flowdoc-section-spacer"
export const VIEWPORT_SECTION_SPACER_MODE = "measured-section-spacer"
export const DEFAULT_SECTION_SPACER_HEIGHT = 720

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

function previousSectionById(previousSpacers) {
  const entries = previousSpacers?.sections || []
  return new Map(entries.map((section) => [section.sectionId, section]))
}

function normalizeSpacerHeight(value, defaultHeight) {
  return Math.max(positiveNumber(defaultHeight), positiveNumber(value, defaultHeight))
}

function createSectionSpacer(section, previousSection, input) {
  const defaultHeight = positiveNumber(input.defaultSectionHeight)
  const sectionId = stringOrNull(section?.id)
  const measuredHeight = normalizeSpacerHeight(section?.height, defaultHeight)
  const rendered = Boolean(section?.rendered)

  if (rendered || !previousSection) {
    return {
      bottom: nonNegativeNumber(section?.bottom, nonNegativeNumber(section?.top) + measuredHeight),
      height: measuredHeight,
      measuredAtRevision: input.measuredAtRevision ?? null,
      reason: rendered ? "rendered-measurement" : "placeholder-estimate",
      rendered,
      sectionId,
      shellState: stringOrNull(section?.shellState) || (rendered ? "rendered" : "placeholder"),
      top: nonNegativeNumber(section?.top),
    }
  }

  return {
    ...previousSection,
    bottom: nonNegativeNumber(section?.bottom, previousSection.bottom),
    rendered: false,
    shellState: stringOrNull(section?.shellState) || "placeholder",
    top: nonNegativeNumber(section?.top, previousSection.top),
  }
}

export function createViewportSectionSpacerMap(input = {}) {
  const previousSpacers = input.previousSpacers || null
  const defaultSectionHeight = positiveNumber(
    input.defaultSectionHeight ?? previousSpacers?.defaultSectionHeight,
  )
  const previousById = previousSectionById(previousSpacers)
  const measurement = input.measurement || null
  const sections = []
  const seenSectionIds = new Set()

  for (const section of measurement?.sections || []) {
    const sectionId = stringOrNull(section?.id)
    if (!sectionId) continue
    seenSectionIds.add(sectionId)
    sections.push(createSectionSpacer(section, previousById.get(sectionId), {
      defaultSectionHeight,
      measuredAtRevision: measurement?.measuredAtRevision ?? input.measuredAtRevision ?? null,
    }))
  }

  for (const previousSection of previousById.values()) {
    if (!seenSectionIds.has(previousSection.sectionId)) {
      sections.push(previousSection)
    }
  }

  const measuredSectionCount = sections
    .filter((section) => section.reason === "rendered-measurement")
    .length

  return {
    defaultSectionHeight,
    estimatedSectionCount: sections.length - measuredSectionCount,
    measuredAtRevision: measurement?.measuredAtRevision ?? input.measuredAtRevision ?? previousSpacers?.measuredAtRevision ?? null,
    measuredSectionCount,
    mode: VIEWPORT_SECTION_SPACER_MODE,
    sectionCount: sections.length,
    sections,
    source: VIEWPORT_SECTION_SPACER_SOURCE,
    version: 1,
  }
}

export function resolveViewportSectionSpacer(spacerMap, sectionId, input = {}) {
  const defaultHeight = positiveNumber(input.defaultSectionHeight ?? spacerMap?.defaultSectionHeight)
  const section = (spacerMap?.sections || []).find((entry) => entry.sectionId === sectionId)

  if (!section) {
    return {
      height: defaultHeight,
      reason: "default",
      sectionId,
      source: VIEWPORT_SECTION_SPACER_SOURCE,
    }
  }

  return {
    height: normalizeSpacerHeight(section.height, defaultHeight),
    reason: section.reason === "rendered-measurement" ? "measured" : "estimated",
    sectionId,
    source: VIEWPORT_SECTION_SPACER_SOURCE,
  }
}
