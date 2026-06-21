const app = document.querySelector("#app")

const state = {
  bridgeBusy: false,
  bridgeMessage: "",
  lastPacket: null,
  mutationText: "Edited through the mutation bridge",
  runtimeCache: null,
  selectedId: null,
  selectionSource: "boot",
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

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value))
}

function createRuntimeCache(snapshot, options = {}) {
  const previousCache = options.previousCache || null
  const nodes = allNodes(snapshot)
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const packetApplied = Boolean(options.packetApplied)
  const previousPacketCount = previousCache?.packetsApplied || 0

  return {
    bootRevision: previousCache?.bootRevision ?? snapshot.session.documentRevision,
    documentRevision: snapshot.session.documentRevision,
    fallbackSnapshotCount: previousCache?.fallbackSnapshotCount || 0,
    lastPacketRevision: options.packet?.nextRevision ?? previousCache?.lastPacketRevision ?? null,
    mode: packetApplied ? "packet-cache" : "snapshot-boot",
    nodeById,
    nodeCount: nodes.length,
    packetsApplied: packetApplied ? previousPacketCount + 1 : previousPacketCount,
  }
}

function setSnapshotFromBoot(snapshot) {
  state.snapshot = snapshot
  state.runtimeCache = createRuntimeCache(snapshot)
}

function setSnapshotFromRefresh(snapshot) {
  const previousCache = state.runtimeCache
  state.snapshot = snapshot
  state.runtimeCache = {
    ...createRuntimeCache(snapshot, { previousCache }),
    fallbackSnapshotCount: (previousCache?.fallbackSnapshotCount || 0) + 1,
    mode: "snapshot-refresh",
  }
}

function selectedNode() {
  if (!state.snapshot || !state.selectedId) return null
  return state.runtimeCache?.nodeById.get(state.selectedId) || null
}

function nodeById(nodeId) {
  if (!state.snapshot || !nodeId) return null
  return state.runtimeCache?.nodeById.get(nodeId) || null
}

function replaceChangedNode(node, changedNodes) {
  const replacement = changedNodes.get(node.id)
  if (replacement) return clonePlain(replacement)

  let childrenChanged = false
  const children = node.children.map((child) => {
    const nextChild = replaceChangedNode(child, changedNodes)
    if (nextChild !== child) childrenChanged = true
    return nextChild
  })

  return childrenChanged ? { ...node, children } : node
}

function isChangePacket(packet) {
  return packet?.source === "flowdoc-template-builder-change-packet" && packet.packetVersion === 1
}

function applyChangePacket(packet) {
  if (!state.snapshot || !isChangePacket(packet)) {
    return { ok: false, reason: "invalid change packet" }
  }

  if (packet.snapshotRequired) {
    return { ok: false, reason: "packet requested snapshot refresh" }
  }

  if (packet.baseRevision !== state.snapshot.session.documentRevision) {
    return {
      ok: false,
      reason: `packet base ${packet.baseRevision} did not match local revision ${state.snapshot.session.documentRevision}`,
    }
  }

  const changedNodes = new Map((packet.changedNodes || []).map((node) => [node.id, node]))
  const sections = state.snapshot.sections.map((section) => ({
    ...section,
    zones: section.zones.map((zone) => replaceChangedNode(zone, changedNodes)),
  }))
  const nextSnapshot = {
    ...state.snapshot,
    diagnostics: packet.diagnostics || state.snapshot.diagnostics,
    authoringHistory: packet.authoringHistory || state.snapshot.authoringHistory,
    mutationBridge: {
      ...state.snapshot.mutationBridge,
      documentRevision: packet.nextRevision,
      lastMutation: packet.mutation,
      mode: "in-memory-bridge",
      mutationCount: packet.mutationCount,
    },
    sections,
    session: {
      ...state.snapshot.session,
      dirtyScopeCount: packet.dirtyScopes.length,
      documentRevision: packet.nextRevision,
    },
  }

  state.snapshot = nextSnapshot
  state.lastPacket = packet
  state.runtimeCache = createRuntimeCache(nextSnapshot, {
    previousCache: state.runtimeCache,
    packet,
    packetApplied: true,
  })

  return { ok: true, reason: "packet applied" }
}

function shortId(id) {
  return id.length > 30 ? `${id.slice(0, 27)}...` : id
}

function renderBadge(value, variant = "neutral") {
  return `<span class="badge badge-${variant}">${escapeHtml(value)}</span>`
}

function statusVariant(status) {
  if (status === "wired") return "good"
  if (status === "blocked") return "warn"
  return "neutral"
}

function selectedNodeCanUseBridge(node) {
  return Boolean(node && node.type === "text-block" && node.canReplacePlainText)
}

function actionLabel(action) {
  return action.label || action.action.split(".").at(-1) || action.action
}

function renderToolbar(snapshot) {
  const statusVariant = snapshot.diagnostics.generationStatus === "ready" ? "good" : "warn"
  const actionButtons = snapshot.actionLanes.map((action) => `
    <button
      type="button"
      title="${escapeHtml(action.reason)}"
      data-action-status="${escapeHtml(action.status)}"
      disabled
    >
      <span>${escapeHtml(actionLabel(action))}</span>
      <em>${escapeHtml(action.status)}</em>
    </button>
  `).join("")

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
        ${actionButtons}
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
        aria-pressed="${isSelected ? "true" : "false"}"
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

function nodeDomAttributes(node) {
  return `data-node-id="${escapeHtml(node.id)}" data-node-type="${escapeHtml(node.type)}"`
}

function renderCanvasNode(node) {
  const selectedClass = node.id === state.selectedId ? " is-selected" : ""

  if (node.type === "zone") {
    return `
      <section class="canvas-zone${selectedClass}" ${nodeDomAttributes(node)}>
        <div class="zone-label">${escapeHtml(node.role || node.type)}</div>
        ${node.children.map(renderCanvasNode).join("")}
      </section>
    `
  }

  if (node.type === "text-block") {
    return `
      <div class="canvas-text${selectedClass}" ${nodeDomAttributes(node)}>
        ${renderTextPreview(node)}
      </div>
    `
  }

  if (node.type === "columns") {
    return `
      <div class="canvas-columns${selectedClass}" ${nodeDomAttributes(node)}>
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "column") {
    return `
      <div class="canvas-column${selectedClass}" ${nodeDomAttributes(node)}>
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table") {
    return `
      <div class="canvas-table${selectedClass}" ${nodeDomAttributes(node)}>
        ${node.children.map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table-row") {
    return `<div class="canvas-table-row${selectedClass}" ${nodeDomAttributes(node)}>${node.children.map(renderCanvasNode).join("")}</div>`
  }

  if (node.type === "table-cell") {
    return `<div class="canvas-table-cell${selectedClass}" ${nodeDomAttributes(node)}>${node.children.map(renderCanvasNode).join("")}</div>`
  }

  return `
    <div class="canvas-utility${selectedClass}" ${nodeDomAttributes(node)}>
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
  const parentNode = nodeById(node?.parentId)
  const canUseBridge = selectedNodeCanUseBridge(node)
  const fieldRows = snapshot.fields.map((field) => `
    <li>
      <span>${escapeHtml(field.label)}</span>
      <strong>${escapeHtml(field.key)}</strong>
      <em>${escapeHtml(field.type)} / ${field.usageCount} refs</em>
    </li>
  `).join("")
  const childRows = node?.children.length
    ? node.children.map((child) => `
      <li>
        <button type="button" class="node-link" data-node-id="${escapeHtml(child.id)}">
          <span>${escapeHtml(child.type)}</span>
          <strong>${escapeHtml(shortId(child.id))}</strong>
        </button>
      </li>
    `).join("")
    : `<li class="empty-row">No direct children</li>`
  const pathRows = node?.path.map((pathId) => {
    const pathNode = nodeById(pathId)
    const label = pathNode ? `${pathNode.type} ${shortId(pathNode.id)}` : shortId(pathId)
    return `<button type="button" class="crumb" data-node-id="${escapeHtml(pathId)}">${escapeHtml(label)}</button>`
  }).join("") || ""
  const actionRows = snapshot.actionLanes.map((action) => `
    <li>
      <span>${escapeHtml(actionLabel(action))}</span>
      ${renderBadge(action.status, statusVariant(action.status))}
      <em>${escapeHtml(action.lane)}</em>
    </li>
  `).join("")
  const lastMutation = snapshot.mutationBridge.lastMutation
  const history = snapshot.authoringHistory || {
    mode: "static-snapshot",
    recordCount: 0,
    undoableRecordCount: 0,
    rejectedRecordCount: 0,
    groupCount: 0,
    latestGroup: null,
  }
  const latestHistory = history.latestGroup
  const bridgeMessage = state.bridgeMessage || (
    lastMutation
      ? `${lastMutation.status}: ${lastMutation.summary}`
      : "No mutation has been applied in this sandbox session."
  )

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
            <dt>Section</dt><dd>${escapeHtml(node.sectionId)}</dd>
            <dt>Zone</dt><dd>${escapeHtml(node.zoneId)}</dd>
            <dt>Parent</dt><dd>${
              parentNode
                ? `<button type="button" class="node-link compact" data-node-id="${escapeHtml(parentNode.id)}">${escapeHtml(parentNode.type)} ${escapeHtml(shortId(parentNode.id))}</button>`
                : escapeHtml(node.parentId || "none")
            }</dd>
            <dt>Children</dt><dd>${node.childCount}</dd>
            <dt>Fields</dt><dd>${node.fieldRefs.length ? node.fieldRefs.map((key) => renderBadge(key, "info")).join("") : "none"}</dd>
          </dl>
        ` : "<p>No node selected.</p>"}
      </section>
      ${node ? `
        <section class="inspector-section">
          <h3>Path</h3>
          <div class="crumb-list">${pathRows}</div>
        </section>
        <section class="inspector-section">
          <h3>Capabilities</h3>
          <div class="capability-grid">
            <span data-state="${node.canContainText}">Contain text</span>
            <span data-state="${node.canSplitAcrossPages}">Split page</span>
            <span data-state="${node.canBeDeleted}">Delete</span>
            <span data-state="${node.canBeDuplicated}">Duplicate</span>
            <span data-state="${node.canBeReordered}">Reorder</span>
          </div>
        </section>
        <section class="inspector-section">
          <h3>Children</h3>
          <ul class="child-list">${childRows}</ul>
        </section>
      ` : ""}
      <section class="inspector-section">
        <h3>Mutation Bridge</h3>
        <div class="bridge-control">
          <input
            type="text"
            data-mutation-text
            value="${escapeHtml(state.mutationText)}"
            aria-label="Mutation text"
            ${canUseBridge ? "" : "disabled"}
          >
          <div class="bridge-actions">
            <button
              type="button"
              data-mutation-action="replace-text"
              ${canUseBridge && !state.bridgeBusy ? "" : "disabled"}
            >
              ${state.bridgeBusy ? "Applying" : "Replace block"}
            </button>
            <button
              type="button"
              data-mutation-action="insert-text-at-end"
              ${canUseBridge && !state.bridgeBusy ? "" : "disabled"}
            >
              ${state.bridgeBusy ? "Applying" : "Append text"}
            </button>
          </div>
          <p data-state="${lastMutation?.status || "idle"}">${escapeHtml(bridgeMessage)}</p>
          ${canUseBridge ? "" : `<small>Select a plain text-block without field refs, page numbers, or line breaks.</small>`}
        </div>
      </section>
      <section class="inspector-section">
        <h3>History</h3>
        <dl class="detail-list">
          <dt>Mode</dt><dd>${escapeHtml(history.mode)}</dd>
          <dt>Records</dt><dd>${history.recordCount}</dd>
          <dt>Groups</dt><dd>${history.groupCount}</dd>
          <dt>Undoable</dt><dd>${history.undoableRecordCount}</dd>
          <dt>Rejected</dt><dd>${history.rejectedRecordCount}</dd>
          <dt>Latest</dt><dd>${latestHistory ? escapeHtml(`${latestHistory.groupId}: ${latestHistory.summary}`) : "none"}</dd>
        </dl>
        <small>Undo and redo execution are planned after the history boundary is stable.</small>
      </section>
      <section class="inspector-section">
        <h3>Actions</h3>
        <ul class="action-list">${actionRows}</ul>
      </section>
      <section class="inspector-section">
        <h3>Keys</h3>
        <ul class="field-list">${fieldRows}</ul>
      </section>
    </aside>
  `
}

function renderStatus(snapshot) {
  const node = selectedNode()
  const packetLabel = state.lastPacket
    ? `Packet: ${state.lastPacket.changedNodeIds.length} changed ${state.lastPacket.baseRevision}->${state.lastPacket.nextRevision}`
    : "Packet: none"
  const cacheLabel = state.runtimeCache
    ? `Cache: ${state.runtimeCache.mode} ${state.runtimeCache.nodeCount} nodes ${state.runtimeCache.packetsApplied} packets`
    : "Cache: none"
  const historyLabel = snapshot.authoringHistory
    ? `History: ${snapshot.authoringHistory.recordCount} records ${snapshot.authoringHistory.groupCount} groups`
    : "History: none"

  return `
    <footer class="statusbar">
      <span>Selection: ${escapeHtml(node?.id || snapshot.session.selectionKind)}</span>
      <span>Source: ${escapeHtml(state.selectionSource)}</span>
      <span>Surface: ${escapeHtml(node?.surface || "none")}</span>
      <span>Doc rev: ${snapshot.session.documentRevision}</span>
      <span>Bridge: ${escapeHtml(snapshot.mutationBridge.mode)}</span>
      <span>Mutations: ${snapshot.mutationBridge.mutationCount}</span>
      <span>${escapeHtml(packetLabel)}</span>
      <span>${escapeHtml(cacheLabel)}</span>
      <span>${escapeHtml(historyLabel)}</span>
      <span>Dirty scopes: ${snapshot.session.dirtyScopeCount}</span>
      <span>Key data: ${escapeHtml(snapshot.diagnostics.keyDataStatus)}</span>
      <span>Exact layout: ${escapeHtml(snapshot.diagnostics.exactLayoutStatus)}</span>
      <span>Artifact: ${escapeHtml(snapshot.diagnostics.artifactStatus)}</span>
    </footer>
  `
}

function selectNode(nodeId, selectionSource) {
  if (!nodeById(nodeId)) return
  state.selectedId = nodeId
  state.selectionSource = selectionSource
  render()
}

function bindSelectionHandlers() {
  const tree = app.querySelector(".node-tree")
  const canvas = app.querySelector(".canvas-wrap")
  const inspector = app.querySelector(".inspector")

  tree?.addEventListener("click", (event) => {
    const target = event.target.closest(".tree-node[data-node-id]")
    if (!target || !tree.contains(target)) return
    event.stopPropagation()
    selectNode(target.dataset.nodeId, "tree")
  })

  canvas?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-node-id]")
    if (!target || !canvas.contains(target)) return
    event.stopPropagation()
    selectNode(target.dataset.nodeId, "canvas")
  })

  inspector?.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-mutation-action]")
    if (actionTarget && inspector.contains(actionTarget)) {
      event.stopPropagation()
      applyBridgeTextAction(actionTarget.dataset.mutationAction)
      return
    }

    const target = event.target.closest("[data-node-id]")
    if (!target || !inspector.contains(target)) return
    event.stopPropagation()
    selectNode(target.dataset.nodeId, "inspector")
  })

  inspector?.querySelector("[data-mutation-text]")?.addEventListener("input", (event) => {
    state.mutationText = event.target.value
  })
}

async function fetchSnapshot() {
  try {
    const apiResponse = await fetch("./api/snapshot", { cache: "no-store" })
    if (apiResponse.ok) return apiResponse.json()
  } catch {
    // Static file fallback keeps the shell inspectable without the mutation bridge.
  }

  const response = await fetch("./sandbox-snapshot.json", { cache: "no-store" })
  return response.json()
}

function routeForBridgeTextAction(action) {
  if (action === "insert-text-at-end") return "./api/actions/insert-text-at-end?response=packet"
  return "./api/actions/replace-text?response=packet"
}

async function applyBridgeTextAction(action) {
  const node = selectedNode()
  if (!selectedNodeCanUseBridge(node)) return

  state.bridgeBusy = true
  state.bridgeMessage = "Sending action to sandbox bridge..."
  render()

  try {
    const response = await fetch(routeForBridgeTextAction(action), {
      body: JSON.stringify({
        text: state.mutationText,
        textBlockId: node.id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    const result = await response.json()
    let fallbackReason = ""

    if (result.packet) {
      const packetResult = applyChangePacket(result.packet)
      if (!packetResult.ok) {
        fallbackReason = ` ${packetResult.reason}; snapshot refreshed.`
        setSnapshotFromRefresh(await fetchSnapshot())
      }
    } else {
      fallbackReason = " missing packet; snapshot refreshed."
      setSnapshotFromRefresh(await fetchSnapshot())
    }
    state.bridgeMessage = result.ok
      ? `applied: ${result.mutation.summary}${fallbackReason}`
      : `rejected: ${(result.issues || []).map((issue) => issue.message).join("; ")}${fallbackReason}`
    state.selectionSource = "bridge"
  } catch (error) {
    state.bridgeMessage = error instanceof Error ? error.message : "bridge request failed"
  } finally {
    state.bridgeBusy = false
    render()
  }
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

  bindSelectionHandlers()
}

async function boot() {
  render()
  setSnapshotFromBoot(await fetchSnapshot())
  const firstTextBlock = allNodes(state.snapshot).find((node) => node.type === "text-block")
  state.selectedId = firstTextBlock?.id || allNodes(state.snapshot)[0]?.id || null
  state.selectionSource = "boot"
  render()
}

boot().catch((error) => {
  app.innerHTML = `<pre class="error">${escapeHtml(error.stack || error.message || error)}</pre>`
})
