export const VIEWPORT_VIRTUAL_STACK_SOURCE = "flowdoc-viewport-virtual-stack"
export const VIEWPORT_VIRTUAL_STACK_MODE = "section-shell-virtual-stack"
export const DEFAULT_VIRTUAL_SECTION_HEIGHT = 720
const DEFAULT_SECTION_GAP = 18

function positiveNumber(value, fallback = DEFAULT_VIRTUAL_SECTION_HEIGHT) {
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

function offsetFactsBySectionId(offsetIndex) {
  return new Map((offsetIndex?.sections || []).map((section) => [section.sectionId, section]))
}

function sectionHeight(section, offsets, defaultHeight) {
  const sectionId = stringOrNull(section?.id)
  const offset = offsets.get(sectionId)
  if (offset) return positiveNumber(offset.bottom - offset.top, defaultHeight)
  return positiveNumber(section?.height, defaultHeight)
}

function hiddenRangeHeight(sections, offsets, defaultHeight) {
  if (sections.length === 0) return 0

  const firstOffset = offsets.get(sections[0].id)
  const lastOffset = offsets.get(sections[sections.length - 1].id)
  if (firstOffset && lastOffset) {
    return nonNegativeNumber(lastOffset.bottom - firstOffset.top)
  }

  const gap = nonNegativeNumber(sections.length - 1, 0) * DEFAULT_SECTION_GAP
  return sections.reduce((total, section) => total + sectionHeight(section, offsets, defaultHeight), gap)
}

function createSpacerItem(hiddenSections, offsets, defaultHeight, position) {
  const sectionIds = hiddenSections.map((section) => section.id).filter(Boolean)
  const height = hiddenRangeHeight(hiddenSections, offsets, defaultHeight)

  return {
    height,
    id: `virtual-spacer:${position}:${sectionIds[0] || "none"}:${sectionIds.at(-1) || "none"}`,
    position,
    sectionCount: sectionIds.length,
    sectionIds,
    source: VIEWPORT_VIRTUAL_STACK_SOURCE,
    type: "spacer",
  }
}

function createSectionItem(section) {
  return {
    id: section.id,
    section,
    source: VIEWPORT_VIRTUAL_STACK_SOURCE,
    type: "section",
  }
}

function fallbackStack(sections, reason) {
  return {
    bottomSpacerHeight: 0,
    items: sections.map(createSectionItem),
    mode: VIEWPORT_VIRTUAL_STACK_MODE,
    mountedSectionCount: sections.length,
    mountedSectionIds: sections.map((section) => section.id).filter(Boolean),
    reason,
    sectionCount: sections.length,
    source: VIEWPORT_VIRTUAL_STACK_SOURCE,
    spacerCount: 0,
    spacerHeight: 0,
    topSpacerHeight: 0,
    version: 1,
    virtualized: false,
  }
}

export function createViewportVirtualStack(input = {}) {
  const renderShell = input.renderShell || null
  const sections = renderShell?.sections || input.sections || []
  const offsets = offsetFactsBySectionId(input.offsetIndex)
  const defaultHeight = positiveNumber(input.defaultSectionHeight)

  if (sections.length === 0) return fallbackStack([], "section-missing")
  if (offsets.size === 0) return fallbackStack(sections, "offset-index-missing")

  const items = []
  const mountedSectionIds = []
  let hiddenSections = []

  for (const section of sections) {
    if (section.rendered) {
      if (hiddenSections.length > 0) {
        items.push(createSpacerItem(hiddenSections, offsets, defaultHeight, items.length === 0 ? "top" : "middle"))
        hiddenSections = []
      }
      items.push(createSectionItem(section))
      mountedSectionIds.push(section.id)
    } else {
      hiddenSections.push(section)
    }
  }

  if (hiddenSections.length > 0) {
    items.push(createSpacerItem(hiddenSections, offsets, defaultHeight, "bottom"))
  }

  const spacerItems = items.filter((item) => item.type === "spacer")
  const topSpacerHeight = items[0]?.type === "spacer" ? items[0].height : 0
  const bottomSpacerHeight = items.at(-1)?.type === "spacer" ? items.at(-1).height : 0

  return {
    bottomSpacerHeight,
    items,
    mode: VIEWPORT_VIRTUAL_STACK_MODE,
    mountedSectionCount: mountedSectionIds.length,
    mountedSectionIds,
    offsetIndexMode: input.offsetIndex?.mode || null,
    reason: spacerItems.length > 0 ? "virtualized-section-shell" : "all-sections-mounted",
    renderShellMode: renderShell?.mode || null,
    sectionCount: sections.length,
    source: VIEWPORT_VIRTUAL_STACK_SOURCE,
    spacerCount: spacerItems.length,
    spacerHeight: spacerItems.reduce((total, item) => total + item.height, 0),
    topSpacerHeight,
    version: 1,
    virtualized: spacerItems.length > 0,
  }
}
