const app = document.querySelector("#app")

const state = {
  selectedId: null,
  snapshot: null,
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function flattenNodes(nodes, output = []) {
  for (const node of nodes) {
    output.push(node)
    flattenNodes(node.children, output)
  }
  return output
}

function allNodes(snapshot) {
  return snapshot.sections.flatMap((section) => flattenNodes(section.zones))
}

function selectedNode() {
  if (!state.snapshot || !state.selectedId) return null
  return allNodes(state.snapshot).find((node) => node.id === state.selectedId) || null
}

function shortId(id) {
  return id.length > 30 ? `${id.slice(0, 27)}...` : id
}

function renderBadge(value, variant = "neutral") {
  return `<span class="badge badge-${variant}">${escapeHtml(value)}</span>`
}

function renderToolbar(snapshot) {
  const statusVariant = snapshot.diagnostics.generationStatus === "ready" ? "good" : "warn"

  return `
    <header class="toolbar">
      <div class="toolbar-brand">
        <span class="mark">FD</span>
        <div>
          <strong>${escapeHtml(snapshot.template.title)}</strong>
          <span>${escapeHtml(snapshot.template.id)}</span>
        </div>
      </div>
      <nav class="toolbar-actions" aria-label="Template actions">
        <button type="button" title="Save template" disabled>Save</button>
        <button type="button" title="Undo" disabled>Undo</button>
        <button type="button" title="Redo" disabled>Redo</button>
        <button type="button" title="Insert field reference" disabled>Insert key</button>
        <button type="button" title="Run diagnostics" disabled>Diagnostics</button>
        <button type="button" title="Generate preview" disabled>Preview</button>
      </nav>
      <div class="toolbar-status">
        ${renderBadge(snapshot.diagnostics.generationStatus, statusVariant)}
        ${renderBadge(snapshot.boundary.corePackage, "info")}
      </div>
    </header>
  `
}

function renderTreeNode(node, depth = 0) {
  const isSelected = node.id === state.selectedId
  const children = node.children.length > 0
    ? `<ol>${node.children.map((child) => renderTreeNode(child, depth + 1)).join("")}</ol>`
    : ""

  return `
    <li>
      <button
        type="button"
        class="tree-node ${isSelected ? "is-selected" : ""}"
        data-node-id="${escapeHtml(node.id)}"
        style="--depth:${depth}"
      >
        <span class="node-type">${escapeHtml(node.type)}</span>
        <span class="node-id">${escapeHtml(shortId(node.id))}</span>
      </button>
      ${children}
    </li>
  `
}

function renderNodeTree(snapshot) {
  return `
    <aside class="panel node-tree">
      <div class="panel-heading">
        <h2>Nodes</h2>
        ${renderBadge(`${snapshot.counts.nodes} total`, "neutral")}
      </div>
      <div class="tree-scroll">
        ${snapshot.sections.map((section) => `
          <section class="section-tree">
            <div class="section-label">${escapeHtml(section.id)} <span>${escapeHtml(section.page)}</span></div>
            <ol>${section.zones.map((zone) => renderTreeNode(zone)).join("")}</ol>
          </section>
        `).join("")}
      </div>
    </aside>
  `
}

function renderTextPreview(node) {
  if (!node.textPreview) return ""

  const escaped = escapeHtml(node.textPreview)
  return escaped.replaceAll(/\{([^}]+)\}/g, (_, key) => {
    return `<span class="field-chip">${escapeHtml(key)}</span>`
  })
}

function renderCanvasNode(node) {
  const selectedClass = node.id === state.selectedId ? " is-selected" : ""

  if (node.type === "zone") {
    return `
      <section class="canvas-zone${selectedClass}" data-node-id="${escapeHtml(node.id)}">
        <div class="zone-label">${escapeHtml(node.role || node.type)}</div>
        ${node.children.map(renderCanvasNode).join("")}
      </section>
    `
  }

  if (node.type === "text-block") {
    return `
      <div class="canvas-text${selectedClass}" data-node-id="${escapeHtml(node.id)}">
        ${renderTextPreview(node)}
      </div>
    `
  }

  if (node.type === "columns") {
    return `
      <div class="canvas-columns${selectedClass}" data-node-id="${escapeHtml(node.id)}">
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "column") {
    return `
      <div class="canvas-column${selectedClass}" data-node-id="${escapeHtml(node.id)}">
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table") {
    return `
      <div class="canvas-table${selectedClass}" data-node-id="${escapeHtml(node.id)}">
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table-row") {
    return `<div class="canvas-table-row${selectedClass}" data-node-id="${escapeHtml(node.id)}">${node.children.map(renderCanvasNode).join("")}</div>`
  }

  if (node.type === "table-cell") {
    return `<div class="canvas-table-cell${selectedClass}" data-node-id="${escapeHtml(node.id)}">${node.children.map(renderCanvasNode).join("")}</div>`
  }

  return `
    <div class="canvas-utility${selectedClass}" data-node-id="${escapeHtml(node.id)}">
      ${escapeHtml(node.type)}
    </div>
  `
}

function renderCanvas(snapshot) {
  return `
    <main class="canvas-wrap">
      <div class="canvas-header">
        <div>
          <h1>${escapeHtml(snapshot.template.title)}</h1>
          <span>package v${snapshot.template.packageVersion} / document v${snapshot.template.documentVersion}</span>
        </div>
        <div class="metric-strip">
          <span>${snapshot.counts.sections} sections</span>
          <span>${snapshot.counts.textBlocks} text blocks</span>
          <span>${snapshot.counts.fields} keys</span>
        </div>
      </div>
      <div class="page-stack">
        ${snapshot.sections.map((section) => `
          <article class="page">
            <header class="page-heading">
              <strong>${escapeHtml(section.id)}</strong>
              <span>${escapeHtml(section.page)}</span>
            </header>
            ${section.zones.map(renderCanvasNode).join("")}
          </article>
        `).join("")}
      </div>
    </main>
  `
}

function renderInspector(snapshot) {
  const node = selectedNode()
  const fieldRows = snapshot.fields.map((field) => `
    <li>
      <span>${escapeHtml(field.label)}</span>
      <strong>${escapeHtml(field.key)}</strong>
      <em>${escapeHtml(field.type)} / ${field.usageCount} refs</em>
    </li>
  `).join("")

  return `
    <aside class="panel inspector">
      <div class="panel-heading">
        <h2>Inspector</h2>
        ${renderBadge(node ? node.type : "none", "info")}
      </div>
      <section class="inspector-section">
        <h3>Selected</h3>
        ${node ? `
          <dl class="detail-list">
            <dt>Id</dt><dd>${escapeHtml(node.id)}</dd>
            <dt>Type</dt><dd>${escapeHtml(node.type)}</dd>
            <dt>Role</dt><dd>${escapeHtml(node.role || "none")}</dd>
            <dt>Surface</dt><dd>${escapeHtml(node.surface)}</dd>
            <dt>Children</dt><dd>${node.childCount}</dd>
            <dt>Fields</dt><dd>${node.fieldRefs.length ? node.fieldRefs.map((key) => renderBadge(key, "info")).join("") : "none"}</dd>
          </dl>
        ` : "<p>No node selected.</p>"}
      </section>
      <section class="inspector-section">
        <h3>Keys</h3>
        <ul class="field-list">${fieldRows}</ul>
      </section>
    </aside>
  `
}

function renderStatus(snapshot) {
  return `
    <footer class="statusbar">
      <span>Selection: ${escapeHtml(snapshot.session.selectionKind)}</span>
      <span>Doc rev: ${snapshot.session.documentRevision}</span>
      <span>Dirty scopes: ${snapshot.session.dirtyScopeCount}</span>
      <span>Key data: ${escapeHtml(snapshot.diagnostics.keyDataStatus)}</span>
      <span>Exact layout: ${escapeHtml(snapshot.diagnostics.exactLayoutStatus)}</span>
      <span>Artifact: ${escapeHtml(snapshot.diagnostics.artifactStatus)}</span>
    </footer>
  `
}

function render() {
  const snapshot = state.snapshot
  if (!snapshot) {
    app.innerHTML = `<div class="loading">Loading sandbox...</div>`
    return
  }

  app.innerHTML = `
    ${renderToolbar(snapshot)}
    <div class="workspace">
      ${renderNodeTree(snapshot)}
      ${renderCanvas(snapshot)}
      ${renderInspector(snapshot)}
    </div>
    ${renderStatus(snapshot)}
  `

  app.querySelectorAll("[data-node-id]").forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedId = element.dataset.nodeId
      render()
    })
  })
}

async function boot() {
  render()
  const response = await fetch("./sandbox-snapshot.json", { cache: "no-store" })
  state.snapshot = await response.json()
  const firstTextBlock = allNodes(state.snapshot).find((node) => node.type === "text-block")
  state.selectedId = firstTextBlock?.id || allNodes(state.snapshot)[0]?.id || null
  render()
}

boot().catch((error) => {
  app.innerHTML = `<pre class="error">${escapeHtml(error.stack || error.message || error)}</pre>`
})
