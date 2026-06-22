export const RENDER_SHELL_SOURCE = "flowdoc-render-shell"
export const RENDER_SHELL_MODE = "render-window-shell"

function sectionIds(sections) {
  return sections.map((section) => section.id).filter(Boolean)
}

export function createRenderShell({ sections = [], renderWindow = null } = {}) {
  const renderedSectionIds = renderWindow?.sectionIds?.length
    ? renderWindow.sectionIds.filter((sectionId) => sectionIds(sections).includes(sectionId))
    : sectionIds(sections)
  const renderedSectionIdSet = new Set(renderedSectionIds)
  const shellSections = sections.map((section, index) => {
    const rendered = renderedSectionIdSet.has(section.id)

    return {
      ...section,
      index,
      placeholder: !rendered,
      placeholderReason: rendered ? null : "outside-render-window",
      rendered,
      shellMode: RENDER_SHELL_MODE,
    }
  })
  const placeholderSectionIds = shellSections
    .filter((section) => section.placeholder)
    .map((section) => section.id)

  return {
    mode: RENDER_SHELL_MODE,
    placeholderSectionCount: placeholderSectionIds.length,
    placeholderSectionIds,
    renderedSectionCount: renderedSectionIds.length,
    renderedSectionIds,
    renderWindowMode: renderWindow?.mode || null,
    renderWindowNodeCount: renderWindow?.nodeCount ?? 0,
    sectionCount: shellSections.length,
    sections: shellSections,
    source: RENDER_SHELL_SOURCE,
    totalNodeCount: renderWindow?.totalNodeCount ?? 0,
    version: 1,
    windowed: Boolean(renderWindow?.windowed),
  }
}

export function getRenderShellSections(renderShell) {
  return renderShell?.sections || []
}

export function isRenderShellSectionRendered(renderShell, sectionId) {
  if (!renderShell || !sectionId) return false
  return renderShell.renderedSectionIds.includes(sectionId)
}
