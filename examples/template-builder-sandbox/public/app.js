import {
  createStoreBackedRenderModel,
  getStoreBackedRenderChildren,
  getStoreBackedRenderNode,
  getStoreBackedRenderSectionRootNodes,
  getStoreBackedRenderWindowChildren,
  getStoreBackedRenderWindowSectionRootNodes,
  getStoreBackedRenderShellSections,
  isStoreBackedRenderShellSectionRendered,
} from "./renderModel.js"
import {
  applyChangePacketToRuntime,
  createBootRuntimeState,
  createRefreshRuntimeState,
  createVisibleRangeRuntimeState,
} from "./runtimeCache.js"
import {
  createDraftVisibleRangeRequest,
  createSelectionVisibleRangeRequest,
} from "./visibleRangeRequest.js"
import {
  createViewportSectionAnchor,
  resolveViewportSectionAnchorScrollTop,
} from "./viewportAnchor.js"
import {
  createViewportMeasurementApplyRequest,
  createViewportMeasurement,
} from "./viewportMeasurement.js"
import {
  createViewportScrollControllerState,
  recordViewportScroll,
  settleViewportScroll,
} from "./viewportScrollController.js"
import {
  createViewportSectionSpacerMap,
  resolveViewportSectionSpacer,
} from "./viewportSectionSpacers.js"
import {
  createViewportSectionOffsetIndex,
  predictViewportFromSectionOffsets,
  resolveViewportSectionOffset,
} from "./viewportSectionOffsets.js"
import {
  createViewportSchedulerAutomationState,
  runViewportSchedulerAutomation,
} from "./viewportSchedulerAutomation.js"
import {
  createViewportSchedulerRuntimeState,
  planViewportSchedulerRuntimeCandidate,
} from "./viewportSchedulerRuntime.js"

const app = document.querySelector("#app")

const state = {
  bridgeBusy: false,
  bridgeMessage: "",
  draft: {
    baseRevision: null,
    compositionData: "",
    compositionEventCount: 0,
    compositionSource: "idle",
    message: "",
    originalText: "",
    isComposing: false,
    selectionDirection: "none",
    selectionEnd: null,
    selectionSource: "idle",
    selectionStart: null,
    status: "idle",
    text: "",
    textBlockId: null,
  },
  draftCommandText: "",
  lastPacket: null,
  lastViewportApply: null,
  mutationText: "Edited through the mutation bridge",
  renderModel: null,
  runtimeCache: null,
  selectedId: null,
  selectionSource: "boot",
  snapshot: null,
  viewportAnchor: null,
  viewportAnchorRestore: null,
  viewportMeasurement: null,
  viewportSectionOffsetIndex: null,
  viewportSectionPrediction: null,
  viewportSectionSpacers: createViewportSectionSpacerMap(),
  viewportSchedulerApply: null,
  viewportSchedulerAutomation: createViewportSchedulerAutomationState(),
  viewportSchedulerCandidate: null,
  viewportSchedulerRuntime: createViewportSchedulerRuntimeState(),
  viewportScrollController: createViewportScrollControllerState(),
  viewportScrollRestoring: false,
  viewportScrollTimerId: null,
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function setSnapshotFromBoot(snapshot) {
  const runtimeState = createBootRuntimeState(snapshot)
  state.snapshot = runtimeState.snapshot
  state.runtimeCache = runtimeState.runtimeCache
}

function setSnapshotFromRefresh(snapshot) {
  const runtimeState = createRefreshRuntimeState(snapshot, state.runtimeCache)
  state.snapshot = runtimeState.snapshot
  state.runtimeCache = runtimeState.runtimeCache
}

function setVisibleRangeRequest(request) {
  if (!state.snapshot) return
  const runtimeState = createVisibleRangeRuntimeState(state.snapshot, state.runtimeCache, request)
  state.runtimeCache = runtimeState.runtimeCache
}

function selectedNode() {
  if (!state.snapshot || !state.selectedId) return null
  return getStoreBackedRenderNode(state.renderModel, state.selectedId)
    || state.runtimeCache?.nodeById.get(state.selectedId)
    || null
}

function nodeById(nodeId) {
  if (!state.snapshot || !nodeId) return null
  return getStoreBackedRenderNode(state.renderModel, nodeId)
    || state.runtimeCache?.nodeById.get(nodeId)
    || null
}

function nodeChildren(node) {
  return getStoreBackedRenderChildren(state.renderModel, node?.id)
}

function sectionRootZones(section) {
  return getStoreBackedRenderSectionRootNodes(state.renderModel, section?.id)
}

function renderWindowNodeChildren(node) {
  return getStoreBackedRenderWindowChildren(state.renderModel, node?.id)
}

function renderWindowSectionRootZones(section) {
  return getStoreBackedRenderWindowSectionRootNodes(state.renderModel, section?.id)
}

function renderShellSectionRendered(section) {
  return isStoreBackedRenderShellSectionRendered(state.renderModel, section?.id)
}

function readCanvasViewportMeasurement(renderModel) {
  const canvas = app.querySelector(".canvas-wrap")
  if (!canvas || !renderModel) return null
  const canvasRect = canvas.getBoundingClientRect()
  const pageElements = [...canvas.querySelectorAll(".page[data-section-id]")]
  const sections = pageElements.map((pageElement, index) => {
    const pageRect = pageElement.getBoundingClientRect()
    const top = pageRect.top - canvasRect.top + canvas.scrollTop
    const height = pageRect.height

    return {
      bottom: top + height,
      height,
      id: pageElement.dataset.sectionId,
      index,
      rendered: pageElement.dataset.renderShellState === "rendered",
      shellState: pageElement.dataset.renderShellState,
      top,
    }
  })

  return createViewportMeasurement({
    measuredAtRevision: renderModel.documentRevision,
    scrollHeight: canvas.scrollHeight,
    scrollTop: canvas.scrollTop,
    sections,
    viewportHeight: canvas.clientHeight || canvasRect.height,
  })
}

function viewportMeasurementLabel() {
  const measurement = state.viewportMeasurement
  if (!measurement) return "Measurement: pending"
  return `Measurement: ${measurement.mode} ${measurement.anchorSectionId || "none"} ${measurement.visibleSectionCount}/${measurement.sectionCount} visible`
}

function syncViewportMeasurementStatus() {
  app.querySelectorAll("[data-viewport-measurement-status]").forEach((target) => {
    target.textContent = viewportMeasurementLabel()
  })
}

function viewportAnchorLabel() {
  const anchor = state.viewportAnchor
  if (!anchor) return "Viewport anchor: none"
  const restored = state.viewportAnchorRestore?.restored ? " restored" : ""
  return `Viewport anchor: ${anchor.kind} ${anchor.sectionId || "none"} +${Math.round(anchor.offsetInSection)}${restored}`
}

function syncViewportAnchorStatus() {
  app.querySelectorAll("[data-viewport-anchor-status]").forEach((target) => {
    target.textContent = viewportAnchorLabel()
  })
}

function updateViewportSectionSpacers(measurement) {
  if (!measurement) return
  state.viewportSectionSpacers = createViewportSectionSpacerMap({
    measurement,
    previousSpacers: state.viewportSectionSpacers,
  })
  updateViewportSectionOffsets(measurement)
}

function viewportSectionSpacerLabel() {
  const spacers = state.viewportSectionSpacers
  return `Section spacers: ${spacers.measuredSectionCount}/${spacers.sectionCount} measured ${spacers.estimatedSectionCount} estimated`
}

function syncViewportSectionSpacerStatus() {
  app.querySelectorAll("[data-section-spacer-status]").forEach((target) => {
    target.textContent = viewportSectionSpacerLabel()
  })
}

function updateViewportSectionOffsets(measurement) {
  state.viewportSectionOffsetIndex = createViewportSectionOffsetIndex({
    spacerMap: state.viewportSectionSpacers,
  })
  state.viewportSectionPrediction = predictViewportFromSectionOffsets({
    offsetIndex: state.viewportSectionOffsetIndex,
    scrollTop: measurement?.scrollTop,
    viewportHeight: measurement?.viewportHeight,
  })
  updateViewportSchedulerCandidate({
    reason: "measurement",
  })
}

function viewportSectionOffsetLabel() {
  const offsetIndex = state.viewportSectionOffsetIndex
  const prediction = state.viewportSectionPrediction
  if (!offsetIndex || !prediction) return "Section offsets: pending"
  const offset = Number.isFinite(prediction.anchorOffsetInSection)
    ? Math.round(prediction.anchorOffsetInSection)
    : "none"
  return `Section offsets: ${offsetIndex.sectionCount} sections ${prediction.anchorSectionId || "none"} +${offset} ${prediction.visibleSectionCount} visible`
}

function syncViewportSectionOffsetStatus() {
  app.querySelectorAll("[data-section-offset-status]").forEach((target) => {
    target.textContent = viewportSectionOffsetLabel()
  })
}

function viewportSchedulerCandidateInput(input = {}) {
  return {
    budget: viewportRequestBudget(),
    observeOnly: input.observeOnly,
    offsetIndex: state.viewportSectionOffsetIndex,
    prediction: state.viewportSectionPrediction,
    previousRequest: state.runtimeCache?.visibleRangeRequest,
    reason: input.reason,
    renderWindow: state.renderModel?.renderWindow,
    scrollController: state.viewportScrollController,
  }
}

function updateViewportSchedulerCandidate(input = {}) {
  state.viewportSchedulerRuntime = planViewportSchedulerRuntimeCandidate(state.viewportSchedulerRuntime, {
    ...viewportSchedulerCandidateInput(input),
    documentRevision: state.snapshot?.session?.documentRevision,
    runtimeRevision: state.runtimeCache?.documentRevision,
  })
  state.viewportSchedulerCandidate = state.viewportSchedulerRuntime.candidate
  state.viewportSchedulerApply = state.viewportSchedulerRuntime.apply
}

function viewportSchedulerCandidateLabel() {
  const candidate = state.viewportSchedulerCandidate
  if (!candidate) return "Viewport candidate: pending"
  const sectionIds = candidate.candidateSectionIds.length > 0
    ? candidate.candidateSectionIds.join(",")
    : "none"
  return `Viewport candidate: ${candidate.applyState} ${candidate.anchorSectionId || "none"} ${sectionIds} ${candidate.confidence}`
}

function syncViewportSchedulerCandidateStatus() {
  app.querySelectorAll("[data-viewport-scheduler-candidate-status]").forEach((target) => {
    target.textContent = viewportSchedulerCandidateLabel()
  })
}

function viewportSchedulerApplyLabel() {
  const apply = state.viewportSchedulerApply
  if (!apply) return "Scheduler apply: none"
  const sectionIds = apply.candidateSectionIds.length > 0
    ? apply.candidateSectionIds.join(",")
    : "none"
  const detail = apply.blockedReason || apply.requestReason || "ready"
  return `Scheduler apply: ${apply.applyState} ${apply.anchorSectionId || "none"} ${sectionIds} ${detail}`
}

function syncViewportSchedulerApplyStatus() {
  app.querySelectorAll("[data-viewport-scheduler-apply-status]").forEach((target) => {
    target.textContent = viewportSchedulerApplyLabel()
  })
}

function viewportSchedulerRuntimeLabel() {
  const runtime = state.viewportSchedulerRuntime
  if (!runtime) return "Scheduler runtime: idle"
  const detail = runtime.lastBlockedReason
    || runtime.lastAppliedRequestId
    || runtime.pendingRequestId
    || "none"
  return `Scheduler runtime: ${runtime.status} #${runtime.sequence} ${detail}`
}

function syncViewportSchedulerRuntimeStatus() {
  app.querySelectorAll("[data-viewport-scheduler-runtime-status]").forEach((target) => {
    target.textContent = viewportSchedulerRuntimeLabel()
  })
}

function viewportSchedulerAutomationLabel() {
  const automation = state.viewportSchedulerAutomation
  if (!automation) return "Scheduler auto: idle"
  const budget = automation.budget
    ? `${automation.budget.mode}/${automation.budget.maxNodes} ${automation.budget.source || "input"}`
    : "no-budget"
  const detail = automation.lastSkippedReason
    || automation.lastBlockedReason
    || automation.lastRequestReason
    || automation.lastAppliedRequestId
    || "none"
  return `Scheduler auto: ${automation.status} #${automation.attemptedCount} ${budget} ${detail}`
}

function syncViewportSchedulerAutomationStatus() {
  app.querySelectorAll("[data-viewport-scheduler-automation-status]").forEach((target) => {
    target.textContent = viewportSchedulerAutomationLabel()
  })
}

function runViewportSchedulerAutomationStep(input = {}) {
  if (!state.snapshot || !state.runtimeCache) return null

  const automation = runViewportSchedulerAutomation(state.viewportSchedulerAutomation, state.viewportSchedulerRuntime, {
    ...viewportSchedulerCandidateInput({
      observeOnly: false,
      reason: input.reason,
    }),
    autoApplyEnabled: input.autoApplyEnabled,
    documentRevision: state.snapshot.session.documentRevision,
    draftActive: draftIsActive(),
    isComposing: state.draft.isComposing,
    runtimeRevision: state.runtimeCache.documentRevision,
    trigger: input.trigger,
  })

  state.viewportSchedulerAutomation = automation
  state.viewportSchedulerRuntime = automation.runtime
  state.viewportSchedulerCandidate = automation.runtime.candidate
  state.viewportSchedulerApply = automation.runtime.apply
  return automation
}

function applyViewportSchedulerCandidate() {
  const automation = runViewportSchedulerAutomationStep({
    reason: "scheduler-apply",
    trigger: "manual",
  })
  const applyRequest = automation?.apply

  if (!applyRequest?.applyReady) {
    syncViewportSchedulerCandidateStatus()
    syncViewportSchedulerApplyStatus()
    syncViewportSchedulerRuntimeStatus()
    syncViewportSchedulerAutomationStatus()
    return
  }

  const measurement = readCanvasViewportMeasurement(state.renderModel) || state.viewportMeasurement
  const viewportAnchor = measurement ? setViewportAnchorFromMeasurement(measurement) : state.viewportAnchor
  recordViewportApplyResult(applyRequest, measurement)
  state.selectionSource = "viewport-scheduler"
  setVisibleRangeRequest(applyRequest.request)
  render({
    fallbackCanvasScrollTop: measurement?.scrollTop,
    restoreViewportAnchor: viewportAnchor,
  })
}

function setViewportAnchorFromMeasurement(measurement) {
  if (!measurement) return null
  const anchor = createViewportSectionAnchor({ measurement })
  state.viewportAnchor = anchor
  state.viewportAnchorRestore = null
  return anchor
}

function viewportApplyLabel() {
  const apply = state.lastViewportApply
  if (!apply) return "Viewport apply: none"
  return `Viewport apply: ${apply.requestReason} ${apply.anchorSectionId || "none"}${apply.preserved ? " preserved" : ""}`
}

function viewportScrollControllerLabel() {
  const controller = state.viewportScrollController
  const anchor = controller.status === "applied"
    ? controller.lastAppliedAnchorSectionId
    : controller.lastMeasuredAnchorSectionId
  const skipped = controller.lastSkippedReason ? ` ${controller.lastSkippedReason}` : ""
  return `Scroll controller: ${controller.status} ${anchor || "none"} e${controller.eventCount}/a${controller.appliedCount}/s${controller.skippedCount}${skipped}`
}

function syncViewportScrollControllerStatus() {
  app.querySelectorAll("[data-viewport-scroll-status]").forEach((target) => {
    target.textContent = viewportScrollControllerLabel()
  })
}

function viewportRequestBudget() {
  return {
    maxNodes: state.runtimeCache?.visibleRangeRequest?.budget?.maxNodes,
    mode: "viewport",
  }
}

function recordViewportApplyResult(applyRequest, measurement) {
  const visibleRangeRequest = applyRequest.visibleRangeRequest || applyRequest.request || null
  state.lastViewportApply = {
    anchorSectionId: applyRequest.anchorSectionId,
    mode: applyRequest.mode,
    preserved: Boolean(applyRequest.preserved),
    requestReason: visibleRangeRequest?.reason || applyRequest.requestReason || "none",
    scrollTop: measurement?.scrollTop ?? null,
  }
}

function applyViewportMeasurement() {
  if (!state.snapshot || !state.runtimeCache) return
  const measurement = readCanvasViewportMeasurement(state.renderModel) || state.viewportMeasurement
  if (!measurement) return

  const applyRequest = createViewportMeasurementApplyRequest({
    budget: viewportRequestBudget(),
    draftActive: draftIsActive(),
    measurement,
  }, state.runtimeCache.visibleRangeRequest)

  recordViewportApplyResult(applyRequest, measurement)
  const viewportAnchor = setViewportAnchorFromMeasurement(measurement)
  state.selectionSource = "viewport-apply"
  setVisibleRangeRequest(applyRequest.visibleRangeRequest)
  render({
    fallbackCanvasScrollTop: measurement.scrollTop,
    restoreViewportAnchor: viewportAnchor,
  })
}

function applySettledViewportScroll() {
  state.viewportScrollTimerId = null
  if (!state.snapshot || !state.runtimeCache) return

  const measurement = readCanvasViewportMeasurement(state.renderModel) || state.viewportMeasurement
  const settled = settleViewportScroll(state.viewportScrollController, {
    budget: viewportRequestBudget(),
    draftActive: draftIsActive(),
    isComposing: state.draft.isComposing,
    measurement,
    previousRequest: state.runtimeCache.visibleRangeRequest,
  })

  state.viewportScrollController = settled.scrollController
  if (!settled.applyRequest) {
    updateViewportSchedulerCandidate({
      reason: settled.scrollController.lastSkippedReason || "scroll-skipped",
    })
    syncViewportSchedulerCandidateStatus()
    syncViewportSchedulerApplyStatus()
    syncViewportSchedulerRuntimeStatus()
    syncViewportSchedulerAutomationStatus()
    syncViewportScrollControllerStatus()
    return
  }

  const automation = runViewportSchedulerAutomationStep({
    reason: "scroll-settled",
    trigger: "auto",
  })
  const applyRequest = automation?.apply
  if (!applyRequest?.applyReady) {
    syncViewportSchedulerCandidateStatus()
    syncViewportSchedulerApplyStatus()
    syncViewportSchedulerRuntimeStatus()
    syncViewportSchedulerAutomationStatus()
    syncViewportScrollControllerStatus()
    return
  }

  recordViewportApplyResult(applyRequest, measurement)
  const viewportAnchor = setViewportAnchorFromMeasurement(measurement)
  state.selectionSource = "viewport-scheduler-auto"
  setVisibleRangeRequest(applyRequest.request)
  render({
    fallbackCanvasScrollTop: measurement.scrollTop,
    restoreViewportAnchor: viewportAnchor,
  })
}

function scheduleViewportScrollApply() {
  if (!state.snapshot || !state.runtimeCache || state.viewportScrollRestoring) return

  const measurement = readCanvasViewportMeasurement(state.renderModel)
  if (!measurement) return

  state.viewportMeasurement = measurement
  updateViewportSectionSpacers(measurement)
  setViewportAnchorFromMeasurement(measurement)
  state.viewportScrollController = recordViewportScroll(state.viewportScrollController, {
    measurement,
    scrollTop: measurement.scrollTop,
  })
  updateViewportSchedulerCandidate({
    reason: "scroll-pending",
  })
  syncViewportMeasurementStatus()
  syncViewportSectionSpacerStatus()
  syncViewportSectionOffsetStatus()
  syncViewportSchedulerCandidateStatus()
  syncViewportSchedulerApplyStatus()
  syncViewportSchedulerRuntimeStatus()
  syncViewportSchedulerAutomationStatus()
  syncViewportAnchorStatus()
  syncViewportScrollControllerStatus()

  if (state.viewportScrollTimerId != null) {
    window.clearTimeout(state.viewportScrollTimerId)
  }

  state.viewportScrollTimerId = window.setTimeout(
    applySettledViewportScroll,
    state.viewportScrollController.debounceMs,
  )
}

function applyChangePacket(packet) {
  const packetResult = applyChangePacketToRuntime(state.snapshot, state.runtimeCache, packet)
  if (!packetResult.ok) return packetResult

  state.snapshot = packetResult.snapshot
  state.lastPacket = packet
  state.runtimeCache = packetResult.runtimeCache

  if (
    draftIsActive()
    && packet.status === "applied"
    && packet.nextRevision !== state.draft.baseRevision
    && packet.changedNodeIds.includes(state.draft.textBlockId)
  ) {
    state.draft = {
      ...state.draft,
      message: "Draft target changed in the committed document; cancel or restart the draft.",
      status: "conflicted",
    }
  }

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

function selectedNodeCanUseWysiwygDraft(node) {
  return Boolean(node && node.type === "text-block" && node.canUseWysiwygDraft)
}

function draftIsActive() {
  return Boolean(state.draft.textBlockId)
}

function draftIsDirty() {
  return draftIsActive() && state.draft.text !== state.draft.originalText
}

function draftTargetNode() {
  return nodeById(state.draft.textBlockId)
}

function draftGuardReason(node) {
  if (!node) return "Select a text block before starting a draft."
  if (selectedNodeCanUseWysiwygDraft(node)) return null
  return node.wysiwygDraftGuardReason || "This node cannot be edited as a safe WYSIWYG draft yet."
}

function draftTextForNode(node) {
  return node?.plainText ?? node?.textPreview ?? ""
}

function draftCanCommit() {
  return draftIsActive()
    && draftIsDirty()
    && !state.bridgeBusy
    && !state.draft.isComposing
    && state.draft.status !== "committing"
}

function draftStatusLabel() {
  if (!draftIsActive()) return state.draft.status || "idle"
  if (state.draft.isComposing) return "composing"
  if (state.draft.status === "committing") return "committing"
  if (state.draft.status === "conflicted") return "conflicted"
  if (state.draft.status === "rejected") return "rejected"
  return draftIsDirty() ? "dirty" : "editing"
}

function normalizedDraftSelection() {
  if (!draftIsActive()) {
    return {
      collapsed: true,
      direction: "none",
      end: null,
      length: 0,
      source: state.draft.selectionSource || "idle",
      start: null,
    }
  }

  const textLength = state.draft.text.length
  const start = Number.isInteger(state.draft.selectionStart)
    ? Math.max(0, Math.min(state.draft.selectionStart, textLength))
    : textLength
  const end = Number.isInteger(state.draft.selectionEnd)
    ? Math.max(0, Math.min(state.draft.selectionEnd, textLength))
    : start
  const rangeStart = Math.min(start, end)
  const rangeEnd = Math.max(start, end)

  return {
    collapsed: rangeStart === rangeEnd,
    direction: state.draft.selectionDirection || "none",
    end: rangeEnd,
    length: rangeEnd - rangeStart,
    source: state.draft.selectionSource || "unknown",
    start: rangeStart,
  }
}

function draftSelectionLabel() {
  const selection = normalizedDraftSelection()
  if (!draftIsActive() || selection.start == null || selection.end == null) return "none"
  if (selection.collapsed) return `cursor ${selection.start}`
  return `${selection.start}-${selection.end} (${selection.length})`
}

function draftCompositionLabel() {
  if (!draftIsActive()) return "idle"
  if (!state.draft.isComposing) return state.draft.compositionSource || "idle"
  const data = previewText(state.draft.compositionData, "pending")
  return `${state.draft.compositionSource || "composition"} ${state.draft.compositionEventCount}: ${data}`
}

function clampDraftOffset(value) {
  const textLength = draftIsActive() ? state.draft.text.length : 0
  if (!Number.isFinite(value)) return textLength
  return Math.max(0, Math.min(Math.round(value), textLength))
}

function setDraftSelectionRange(start, end, options = {}) {
  if (!draftIsActive()) return
  if (state.draft.isComposing) {
    state.draft = {
      ...state.draft,
      message: "Finish IME composition before changing the draft range.",
    }
    syncDraftDomState()
    return
  }

  const selectionStart = clampDraftOffset(start)
  const selectionEnd = clampDraftOffset(end)
  const direction = options.direction || "none"
  const source = options.source || "range-control"
  const rangeStart = Math.min(selectionStart, selectionEnd)
  const rangeEnd = Math.max(selectionStart, selectionEnd)
  const targetTextBlockId = state.draft.textBlockId

  const editor = app.querySelector("[data-draft-editor]")
  if (editor && editor.dataset.draftNodeId === targetTextBlockId) {
    editor.setSelectionRange(rangeStart, rangeEnd, direction === "backward" ? "backward" : "forward")
    if (options.focus) {
      editor.focus()
    }
  }

  state.draft = {
    ...state.draft,
    message: options.message ?? state.draft.message,
    selectionDirection: direction,
    selectionEnd: rangeEnd,
    selectionSource: source,
    selectionStart: rangeStart,
  }

  syncDraftDomState()
}

function applyDraftSelectionAction(action) {
  if (!draftIsActive()) return
  if (state.draft.isComposing) {
    state.draft = {
      ...state.draft,
      message: "Finish IME composition before using range controls.",
    }
    syncDraftDomState()
    return
  }

  const textLength = state.draft.text.length
  if (action === "cursor-start") {
    setDraftSelectionRange(0, 0, {
      focus: true,
      message: "Draft cursor moved to start.",
      source: "range-action",
    })
    return
  }

  if (action === "cursor-end") {
    setDraftSelectionRange(textLength, textLength, {
      focus: true,
      message: "Draft cursor moved to end.",
      source: "range-action",
    })
    return
  }

  if (action === "select-all") {
    setDraftSelectionRange(0, textLength, {
      direction: "forward",
      focus: true,
      message: "Draft range selected.",
      source: "range-action",
    })
  }
}

function updateDraftSelectionControl(part, value) {
  if (!draftIsActive()) return
  if (state.draft.isComposing) {
    state.draft = {
      ...state.draft,
      message: "Finish IME composition before editing range inputs.",
    }
    syncDraftDomState()
    return
  }
  const selection = normalizedDraftSelection()
  const nextValue = Number.parseInt(value, 10)
  if (!Number.isFinite(nextValue)) return
  const nextStart = part === "start" ? nextValue : selection.start ?? 0
  const nextEnd = part === "end" ? nextValue : selection.end ?? nextStart

  setDraftSelectionRange(nextStart, nextEnd, {
    direction: "forward",
    message: "Draft range updated.",
    source: "range-input",
  })
}

function previewText(value, emptyLabel = "empty") {
  if (!value) return emptyLabel
  const compact = value.replaceAll(/\s+/g, " ")
  return compact.length > 28 ? `${compact.slice(0, 25)}...` : compact
}

function draftCommandReadiness(context) {
  if (!context.active) {
    return [
      {
        command: "text.insert",
        label: "Insert text",
        status: "blocked",
        reason: "no active browser draft",
      },
      {
        command: "text.replaceSelection",
        label: "Replace selection",
        status: "blocked",
        reason: "no active browser draft",
      },
      {
        command: "inline.fieldRef.insert",
        label: "Insert key",
        status: "planned",
        reason: "requires atomic inline draft command support",
      },
      {
        command: "inline.style.patch",
        label: "Style range",
        status: "planned",
        reason: "requires rich inline range mapping",
      },
    ]
  }

  if (state.draft.isComposing) {
    return [
      {
        command: "text.insert",
        label: "Insert text",
        status: "blocked",
        reason: "IME composition is active; finish composition before applying draft commands",
      },
      {
        command: "text.replaceSelection",
        label: "Replace selection",
        status: "blocked",
        reason: "IME composition is active; finish composition before replacing selection",
      },
      {
        command: "inline.fieldRef.insert",
        label: "Insert key",
        status: "planned",
        reason: "key insertion waits for atomic inline draft support",
      },
      {
        command: "inline.style.patch",
        label: "Style range",
        status: "planned",
        reason: "rich style commands wait for inline range mapping",
      },
    ]
  }

  return [
    {
      command: "text.insert",
      label: "Insert text",
      status: "ready",
      reason: context.collapsed
        ? "cursor can accept plain text insertion in the active browser draft"
        : "selected range can be replaced by inserted plain text in the active browser draft",
    },
    {
      command: "text.replaceSelection",
      label: "Replace selection",
      status: context.collapsed ? "guarded" : "ready",
      reason: context.collapsed
        ? "selection is collapsed; replace needs a non-empty range"
        : "selected range can be replaced in the active browser draft",
    },
    {
      command: "inline.fieldRef.insert",
      label: "Insert key",
      status: "planned",
      reason: "key insertion waits for atomic inline draft support",
    },
    {
      command: "inline.style.patch",
      label: "Style range",
      status: "planned",
      reason: "rich style commands wait for inline range mapping",
    },
  ]
}

function deriveDraftCommandContext() {
  const selection = normalizedDraftSelection()
  const active = draftIsActive() && selection.start != null && selection.end != null

  if (!active) {
    const context = {
      active: false,
      afterTextPreview: "none",
      baseRevision: null,
      beforeTextPreview: "none",
      collapsed: true,
      commandSurface: "none",
      readiness: [],
      selectedTextPreview: "none",
      selectionDirection: "none",
      selectionEnd: null,
      selectionLength: 0,
      selectionSource: selection.source,
      selectionStart: null,
      targetTextBlockId: null,
    }
    return {
      ...context,
      readiness: draftCommandReadiness(context),
    }
  }

  const text = state.draft.text
  const beforeText = text.slice(Math.max(0, selection.start - 28), selection.start)
  const selectedText = text.slice(selection.start, selection.end)
  const afterText = text.slice(selection.end, selection.end + 28)
  const context = {
    active: true,
    afterTextPreview: previewText(afterText, "none"),
    baseRevision: state.draft.baseRevision,
    beforeTextPreview: previewText(beforeText, "none"),
    collapsed: selection.collapsed,
    commandSurface: "browser-draft",
    readiness: [],
    selectedTextPreview: previewText(selectedText, selection.collapsed ? "cursor" : "empty selection"),
    selectionDirection: selection.direction,
    selectionEnd: selection.end,
    selectionLength: selection.length,
    selectionSource: selection.source,
    selectionStart: selection.start,
    targetTextBlockId: state.draft.textBlockId,
  }

  return {
    ...context,
    readiness: draftCommandReadiness(context),
  }
}

function draftCommandSummary() {
  const context = deriveDraftCommandContext()
  if (!context.active) return "none"

  const insert = context.readiness.find((item) => item.command === "text.insert")
  const replace = context.readiness.find((item) => item.command === "text.replaceSelection")
  return `${insert?.status || "blocked"} insert / ${replace?.status || "blocked"} replace`
}

function draftCommandTextValue() {
  return state.draftCommandText || ""
}

function draftCommandActionCanRun(action, context = deriveDraftCommandContext()) {
  if (!context.active || state.bridgeBusy || state.draft.isComposing || draftCommandTextValue().length === 0) return false
  if (action === "insert-text") return true
  if (action === "replace-selection") return !context.collapsed
  return false
}

function setDraftCommandMessage(message, status = state.draft.status || "editing") {
  if (!draftIsActive()) return
  state.draft = {
    ...state.draft,
    message,
    status,
  }
  syncDraftDomState()
}

function setDraftTextFromCommand(nextText, selectionStart, selectionEnd, message) {
  const textLength = nextText.length
  const start = Math.max(0, Math.min(selectionStart, textLength))
  const end = Math.max(0, Math.min(selectionEnd, textLength))

  state.draft = {
    ...state.draft,
    message,
    selectionDirection: "none",
    selectionEnd: end,
    selectionSource: "command",
    selectionStart: start,
    status: "editing",
    text: nextText,
  }

  const editor = app.querySelector("[data-draft-editor]")
  if (editor && editor.dataset.draftNodeId === state.draft.textBlockId) {
    editor.value = nextText
    editor.setSelectionRange(start, end, "none")
  }

  syncDraftDomState()
  focusDraftEditor()
}

function applyDraftTextCommand(action) {
  const context = deriveDraftCommandContext()

  if (!context.active) {
    return
  }

  if (state.draft.isComposing) {
    setDraftCommandMessage("Finish IME composition before applying a browser-local draft command.")
    return
  }

  const commandText = draftCommandTextValue()
  if (commandText.length === 0) {
    setDraftCommandMessage("Type command text before applying a browser-local draft command.")
    return
  }

  if (action === "replace-selection" && context.collapsed) {
    setDraftCommandMessage("Select a non-empty draft range before replacing selection.")
    return
  }

  if (action !== "insert-text" && action !== "replace-selection") {
    return
  }

  const rangeStart = context.selectionStart ?? state.draft.text.length
  const rangeEnd = context.selectionEnd ?? rangeStart
  const nextText = `${state.draft.text.slice(0, rangeStart)}${commandText}${state.draft.text.slice(rangeEnd)}`
  const nextCursor = rangeStart + commandText.length
  const actionLabel = action === "replace-selection" ? "replace selection" : "insert text"
  setDraftTextFromCommand(
    nextText,
    nextCursor,
    nextCursor,
    `Applied browser-local ${actionLabel}; commit the draft to persist it.`,
  )
}

function commandStatusVariant(status) {
  if (status === "ready") return "good"
  if (status === "guarded" || status === "blocked") return "warn"
  return "neutral"
}

function renderDraftCommandReadiness(context = deriveDraftCommandContext()) {
  return `
    <ul class="command-list">
      ${context.readiness.map((item) => `
        <li data-draft-command-row="${escapeHtml(item.command)}" data-state="${escapeHtml(item.status)}">
          <span>${escapeHtml(item.label)}</span>
          ${renderBadge(item.status, commandStatusVariant(item.status))}
          <em data-draft-command-reason>${escapeHtml(item.reason)}</em>
        </li>
      `).join("")}
    </ul>
  `
}

function resetDraft(status = "idle", message = "") {
  state.draft = {
    baseRevision: null,
    compositionData: "",
    compositionEventCount: 0,
    compositionSource: "idle",
    message,
    originalText: "",
    isComposing: false,
    selectionDirection: "none",
    selectionEnd: null,
    selectionSource: "idle",
    selectionStart: null,
    status,
    text: "",
    textBlockId: null,
  }
}

function updateDraftCompositionFromEditor(editor, phase, eventData = "") {
  if (!draftIsActive()) return
  if (editor.dataset.draftNodeId !== state.draft.textBlockId) return

  updateDraftSelectionFromEditor(editor, phase)

  if (phase === "compositionend") {
    state.draft = {
      ...state.draft,
      compositionData: "",
      compositionEventCount: state.draft.compositionEventCount + 1,
      compositionSource: "compositionend",
      isComposing: false,
      message: "IME composition finished. Draft changes are waiting for commit.",
      status: "editing",
    }
    syncDraftDomState()
    return
  }

  state.draft = {
    ...state.draft,
    compositionData: eventData || "",
    compositionEventCount: state.draft.compositionEventCount + 1,
    compositionSource: phase,
    isComposing: true,
    message: "IME composition is active. Finish composition before commands or commit.",
    status: "editing",
  }
  syncDraftDomState()
}

function focusDraftEditor() {
  window.setTimeout(() => {
    const editor = app.querySelector("[data-draft-editor]")
    if (!editor) return
    const selection = normalizedDraftSelection()
    const start = selection.start ?? editor.value.length
    const end = selection.end ?? start
    editor.focus()
    editor.setSelectionRange(start, end, selection.direction === "backward" ? "backward" : "forward")
    updateDraftSelectionFromEditor(editor, "focus")
    syncDraftDomState()
  }, 0)
}

function updateDraftSelectionFromEditor(editor, selectionSource) {
  if (!draftIsActive()) return
  if (editor.dataset.draftNodeId !== state.draft.textBlockId) return

  const value = editor.value
  const selectionStart = Number.isInteger(editor.selectionStart) ? editor.selectionStart : value.length
  const selectionEnd = Number.isInteger(editor.selectionEnd) ? editor.selectionEnd : selectionStart
  state.draft = {
    ...state.draft,
    selectionDirection: editor.selectionDirection || "none",
    selectionEnd,
    selectionSource,
    selectionStart,
    text: value,
  }
}

function syncDraftDomState() {
  const status = draftStatusLabel()
  const selection = normalizedDraftSelection()
  const commandContext = deriveDraftCommandContext()
  const message = state.draft.message || (
    draftIsActive()
      ? draftIsDirty()
        ? "Local draft changes are waiting for commit."
        : "Draft is open with no local changes."
      : "No browser draft is active."
  )

  app.querySelectorAll("[data-draft-status]").forEach((target) => {
    target.textContent = status
    target.dataset.state = status
  })
  app.querySelectorAll("[data-draft-message]").forEach((target) => {
    target.textContent = message
  })
  app.querySelectorAll("[data-draft-selection]").forEach((target) => {
    target.textContent = draftSelectionLabel()
  })
  app.querySelectorAll("[data-draft-selection-source]").forEach((target) => {
    target.textContent = selection.source
  })
  app.querySelectorAll("[data-draft-composition]").forEach((target) => {
    target.textContent = draftCompositionLabel()
    target.dataset.state = state.draft.isComposing ? "active" : "idle"
  })
  app.querySelectorAll("[data-draft-command-summary]").forEach((target) => {
    target.textContent = draftCommandSummary()
  })
  app.querySelectorAll("[data-draft-command-target]").forEach((target) => {
    target.textContent = commandContext.targetTextBlockId || "none"
  })
  app.querySelectorAll("[data-draft-command-surface]").forEach((target) => {
    target.textContent = commandContext.commandSurface
  })
  app.querySelectorAll("[data-draft-command-selected]").forEach((target) => {
    target.textContent = commandContext.selectedTextPreview
  })
  app.querySelectorAll("[data-draft-command-before]").forEach((target) => {
    target.textContent = commandContext.beforeTextPreview
  })
  app.querySelectorAll("[data-draft-command-after]").forEach((target) => {
    target.textContent = commandContext.afterTextPreview
  })
  commandContext.readiness.forEach((item) => {
    app.querySelectorAll(`[data-draft-command-row="${item.command}"]`).forEach((target) => {
      target.dataset.state = item.status
      const badge = target.querySelector(".badge")
      if (badge) {
        badge.className = `badge badge-${commandStatusVariant(item.status)}`
        badge.textContent = item.status
      }
      const reason = target.querySelector("[data-draft-command-reason]")
      if (reason) reason.textContent = item.reason
    })
  })
  app.querySelectorAll("[data-draft-command-text]").forEach((target) => {
    target.disabled = !draftIsActive() || state.bridgeBusy || state.draft.isComposing
    if (target !== document.activeElement) {
      target.value = draftCommandTextValue()
    }
  })
  app.querySelectorAll("[data-draft-command-action]").forEach((target) => {
    target.disabled = !draftCommandActionCanRun(target.dataset.draftCommandAction, commandContext)
  })
  app.querySelectorAll("[data-draft-selection-input]").forEach((target) => {
    const part = target.dataset.draftSelectionInput
    target.disabled = !draftIsActive() || state.bridgeBusy || state.draft.isComposing
    target.max = String(draftIsActive() ? state.draft.text.length : 0)
    target.min = "0"
    if (target !== document.activeElement) {
      target.value = String(part === "end" ? selection.end ?? 0 : selection.start ?? 0)
    }
  })
  app.querySelectorAll("[data-draft-selection-action]").forEach((target) => {
    target.disabled = !draftIsActive() || state.bridgeBusy || state.draft.isComposing
  })
  app.querySelectorAll("[data-draft-statusbar]").forEach((target) => {
    target.textContent = `Draft: ${status}`
  })
  app.querySelectorAll("[data-draft-selectionbar]").forEach((target) => {
    target.textContent = `Draft selection: ${draftSelectionLabel()}`
  })
  app.querySelectorAll("[data-draft-commandbar]").forEach((target) => {
    target.textContent = `Command: ${draftCommandSummary()}`
  })
  app.querySelectorAll("[data-draft-compositionbar]").forEach((target) => {
    target.textContent = `IME: ${draftCompositionLabel()}`
  })
  app.querySelectorAll("[data-draft-action='commit']").forEach((target) => {
    target.disabled = !draftCanCommit()
  })
}

function startDraftForNode(nodeId, selectionSource = "draft") {
  const node = nodeById(nodeId)
  if (!node) return

  if (draftIsActive()) {
    state.draft = {
      ...state.draft,
      message: state.draft.textBlockId === node.id
        ? "Draft is already open on this text block."
        : "Commit or cancel the active browser draft before starting another one.",
    }
    render()
    focusDraftEditor()
    return
  }

  state.selectedId = node.id
  state.selectionSource = selectionSource
  setVisibleRangeRequest(createSelectionVisibleRangeRequest(node.id, state.runtimeCache?.visibleRangeRequest, {
    draftActive: draftIsActive(),
  }))

  const guardReason = draftGuardReason(node)
  if (guardReason) {
    resetDraft("blocked", guardReason)
    state.bridgeMessage = guardReason
    render()
    return
  }

  setVisibleRangeRequest(createDraftVisibleRangeRequest(node.id, state.runtimeCache?.visibleRangeRequest))

  const text = draftTextForNode(node)
  state.draft = {
    baseRevision: state.snapshot.session.documentRevision,
    compositionData: "",
    compositionEventCount: 0,
    compositionSource: "idle",
    message: "Draft is open on the canvas.",
    originalText: text,
    isComposing: false,
    selectionDirection: "none",
    selectionEnd: text.length,
    selectionSource: "start",
    selectionStart: text.length,
    status: "editing",
    text,
    textBlockId: node.id,
  }
  render()
  focusDraftEditor()
}

function cancelDraft() {
  if (!draftIsActive()) return
  resetDraft("cancelled", "Browser draft was cancelled before commit.")
  state.selectionSource = "draft-cancel"
  render()
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
  const children = nodeChildren(node)
  const childTree = children.length > 0
    ? `<ol>${children.map((child) => renderTreeNode(child, depth + 1)).join("")}</ol>`
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
      ${childTree}
    </li>
  `
}

function renderNodeTree(renderModel) {
  return `
    <aside class="panel node-tree">
      <div class="panel-heading">
        <h2>Nodes</h2>
        ${renderBadge(`${renderModel.nodeCount} total`, "neutral")}
      </div>
      <div class="tree-scroll">
        ${renderModel.sections.map((section) => `
          <section class="section-tree">
            <div class="section-label">${escapeHtml(section.id)} <span>${escapeHtml(section.page)}</span></div>
            <ol>${sectionRootZones(section).map((zone) => renderTreeNode(zone)).join("")}</ol>
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
        ${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}
      </section>
    `
  }

  if (node.type === "text-block") {
    const isDraftTarget = state.draft.textBlockId === node.id
    const canDraft = selectedNodeCanUseWysiwygDraft(node)
    const draftClass = isDraftTarget ? ` is-drafting is-draft-${state.draft.status}` : canDraft ? " can-draft" : ""
    const draftStarter = node.id === state.selectedId && canDraft && !draftIsActive()
      ? `
        <button
          type="button"
          class="canvas-draft-start"
          data-draft-action="start"
          data-draft-node-id="${escapeHtml(node.id)}"
          title="Edit this text block on the canvas"
        >
          Edit
        </button>
      `
      : ""

    if (isDraftTarget && draftIsActive()) {
      return `
        <div class="canvas-text${selectedClass}${draftClass}" ${nodeDomAttributes(node)}>
          <textarea
            class="canvas-draft-editor"
            data-draft-editor
            data-draft-node-id="${escapeHtml(node.id)}"
            aria-label="Draft text"
            rows="2"
          >${escapeHtml(state.draft.text)}</textarea>
          <div class="canvas-draft-footer">
            <span data-draft-status data-state="${escapeHtml(draftStatusLabel())}">${escapeHtml(draftStatusLabel())}</span>
            <span data-draft-selection>${escapeHtml(draftSelectionLabel())}</span>
            <span data-draft-composition data-state="${state.draft.isComposing ? "active" : "idle"}">${escapeHtml(draftCompositionLabel())}</span>
            <span data-draft-command-summary>${escapeHtml(draftCommandSummary())}</span>
            <div class="canvas-draft-actions">
              <button
                type="button"
                data-draft-action="commit"
                ${draftCanCommit() ? "" : "disabled"}
              >
                Commit
              </button>
              <button type="button" data-draft-action="cancel">Cancel</button>
            </div>
          </div>
          <small data-draft-message>${escapeHtml(state.draft.message || "Browser draft is local until commit.")}</small>
        </div>
      `
    }

    return `
      <div class="canvas-text${selectedClass}${draftClass}" ${nodeDomAttributes(node)}>
        <div class="canvas-text-body">${renderTextPreview(node)}</div>
        ${draftStarter}
      </div>
    `
  }

  if (node.type === "columns") {
    return `
      <div class="canvas-columns${selectedClass}" ${nodeDomAttributes(node)}>
        ${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "column") {
    return `
      <div class="canvas-column${selectedClass}" ${nodeDomAttributes(node)}>
        ${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table") {
    return `
      <div class="canvas-table${selectedClass}" ${nodeDomAttributes(node)}>
        ${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}
      </div>
    `
  }

  if (node.type === "table-row") {
    return `<div class="canvas-table-row${selectedClass}" ${nodeDomAttributes(node)}>${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}</div>`
  }

  if (node.type === "table-cell") {
    return `<div class="canvas-table-cell${selectedClass}" ${nodeDomAttributes(node)}>${renderWindowNodeChildren(node).map(renderCanvasNode).join("")}</div>`
  }

  return `
    <div class="canvas-utility${selectedClass}" ${nodeDomAttributes(node)}>
      ${escapeHtml(node.type)}
    </div>
  `
}

function renderCanvas(snapshot, renderModel) {
  const renderSections = getStoreBackedRenderShellSections(renderModel)

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
          <span>${renderModel.renderShellRenderedSectionCount}/${renderModel.renderShellSectionCount} rendered</span>
          <span>${renderModel.renderShellPlaceholderSectionCount} placeholders</span>
          <button
            type="button"
            class="metric-action"
            data-viewport-apply
            title="Apply the current measured section shell to the visible range"
          >
            Apply viewport
          </button>
          <button
            type="button"
            class="metric-action"
            data-viewport-scheduler-apply
            title="Apply the current scheduler candidate through the guarded visible-range path"
          >
            Apply candidate
          </button>
        </div>
      </div>
      <div class="page-stack">
        ${renderSections.map((section) => {
          const rendered = renderShellSectionRendered(section)
          const spacer = resolveViewportSectionSpacer(state.viewportSectionSpacers, section.id)
          const sectionOffset = resolveViewportSectionOffset(state.viewportSectionOffsetIndex, section.id)

          return `
          <article
            class="page${rendered ? "" : " is-placeholder"}"
            data-render-shell-state="${rendered ? "rendered" : "placeholder"}"
            data-section-offset-bottom="${escapeHtml(Math.round(sectionOffset?.bottom ?? 0))}"
            data-section-offset-top="${escapeHtml(Math.round(sectionOffset?.top ?? 0))}"
            data-section-spacer-height="${escapeHtml(Math.round(spacer.height))}"
            data-section-spacer-reason="${escapeHtml(spacer.reason)}"
            data-section-id="${escapeHtml(section.id)}"
            style="--section-spacer-height:${escapeHtml(Math.round(spacer.height))}px"
          >
            <header class="page-heading">
              <strong>${escapeHtml(section.id)}</strong>
              <span>${escapeHtml(section.page)}</span>
            </header>
            ${rendered
              ? renderWindowSectionRootZones(section).map(renderCanvasNode).join("")
              : renderCanvasPlaceholder(section)}
          </article>
        `
        }).join("")}
      </div>
    </main>
  `
}

function renderCanvasPlaceholder(section) {
  return `
    <div class="canvas-placeholder" data-render-shell-placeholder="${escapeHtml(section.id)}">
      <strong>${escapeHtml(section.id)}</strong>
      <span>${escapeHtml(section.placeholderReason || "placeholder")}</span>
    </div>
  `
}

function renderInspector(snapshot) {
  const node = selectedNode()
  const parentNode = nodeById(node?.parentId)
  const activeDraftNode = draftTargetNode()
  const commandContext = deriveDraftCommandContext()
  const canStartDraft = Boolean(node && selectedNodeCanUseWysiwygDraft(node) && !draftIsActive())
  const canUseBridge = selectedNodeCanUseBridge(node) && !draftIsActive()
  const draftGuard = node ? draftGuardReason(node) : "Select a text block before starting a draft."
  const draftTargetLabel = activeDraftNode
    ? `${activeDraftNode.type} ${shortId(activeDraftNode.id)}`
    : "none"
  const draftPanelMessage = draftIsActive()
    ? state.draft.message || "Browser draft is active."
    : draftGuard || state.draft.message || "No browser draft is active."
  const draftCommandInputDisabled = !draftIsActive() || state.bridgeBusy || state.draft.isComposing
  const canInsertDraftCommand = draftCommandActionCanRun("insert-text", commandContext)
  const canReplaceDraftCommand = draftCommandActionCanRun("replace-selection", commandContext)
  const draftSelection = normalizedDraftSelection()
  const draftSelectionMax = draftIsActive() ? state.draft.text.length : 0
  const draftSelectionControlDisabled = !draftIsActive() || state.bridgeBusy || state.draft.isComposing
  const childNodes = node ? nodeChildren(node) : []
  const fieldRows = snapshot.fields.map((field) => `
    <li>
      <span>${escapeHtml(field.label)}</span>
      <strong>${escapeHtml(field.key)}</strong>
      <em>${escapeHtml(field.type)} / ${field.usageCount} refs</em>
    </li>
  `).join("")
  const childRows = childNodes.length
    ? childNodes.map((child) => `
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
    canUndo: false,
    canRedo: false,
    undoDepth: 0,
    redoDepth: 0,
    nextUndoGroupId: null,
    nextRedoGroupId: null,
    latestGroup: null,
  }
  const latestHistory = history.latestGroup
  const liveLayout = snapshot.liveLayout || {
    mode: "static-snapshot",
    requestCount: 0,
    exactGenerationStale: false,
    lastResult: null,
  }
  const liveLayoutResult = liveLayout.lastResult
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
            <dt>Draft</dt><dd>${node.canUseWysiwygDraft ? renderBadge("safe", "good") : renderBadge("guarded", "warn")}</dd>
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
        <h3>Draft</h3>
        <div class="draft-control">
          <dl class="detail-list">
            <dt>Status</dt><dd><span data-draft-status data-state="${escapeHtml(draftStatusLabel())}">${escapeHtml(draftStatusLabel())}</span></dd>
            <dt>Target</dt><dd data-draft-command-target>${escapeHtml(commandContext.targetTextBlockId || draftTargetLabel)}</dd>
            <dt>Base</dt><dd>${state.draft.baseRevision == null ? "none" : state.draft.baseRevision}</dd>
            <dt>Dirty</dt><dd>${draftIsDirty() ? "yes" : "no"}</dd>
            <dt>Range</dt><dd data-draft-selection>${escapeHtml(draftSelectionLabel())}</dd>
            <dt>Input</dt><dd data-draft-selection-source>${escapeHtml(normalizedDraftSelection().source)}</dd>
            <dt>IME</dt><dd><span data-draft-composition data-state="${state.draft.isComposing ? "active" : "idle"}">${escapeHtml(draftCompositionLabel())}</span></dd>
            <dt>Command</dt><dd data-draft-command-summary>${escapeHtml(draftCommandSummary())}</dd>
            <dt>Surface</dt><dd data-draft-command-surface>${escapeHtml(commandContext.commandSurface)}</dd>
            <dt>Selected</dt><dd data-draft-command-selected>${escapeHtml(commandContext.selectedTextPreview)}</dd>
            <dt>Before</dt><dd data-draft-command-before>${escapeHtml(commandContext.beforeTextPreview)}</dd>
            <dt>After</dt><dd data-draft-command-after>${escapeHtml(commandContext.afterTextPreview)}</dd>
          </dl>
          <div class="draft-selection-control">
            <label>
              <span>Start</span>
              <input
                type="number"
                min="0"
                max="${draftSelectionMax}"
                data-draft-selection-input="start"
                value="${draftSelection.start ?? 0}"
                aria-label="Draft selection start"
                ${draftSelectionControlDisabled ? "disabled" : ""}
              >
            </label>
            <label>
              <span>End</span>
              <input
                type="number"
                min="0"
                max="${draftSelectionMax}"
                data-draft-selection-input="end"
                value="${draftSelection.end ?? 0}"
                aria-label="Draft selection end"
                ${draftSelectionControlDisabled ? "disabled" : ""}
              >
            </label>
            <div class="draft-selection-actions">
              <button
                type="button"
                data-draft-selection-action="cursor-start"
                ${draftSelectionControlDisabled ? "disabled" : ""}
              >
                Cursor start
              </button>
              <button
                type="button"
                data-draft-selection-action="cursor-end"
                ${draftSelectionControlDisabled ? "disabled" : ""}
              >
                Cursor end
              </button>
              <button
                type="button"
                data-draft-selection-action="select-all"
                ${draftSelectionControlDisabled ? "disabled" : ""}
              >
                Select all
              </button>
            </div>
          </div>
          ${renderDraftCommandReadiness(commandContext)}
          <div class="draft-command-control">
            <input
              type="text"
              data-draft-command-text
              value="${escapeHtml(draftCommandTextValue())}"
              aria-label="Draft command text"
              ${draftCommandInputDisabled ? "disabled" : ""}
            >
            <div class="draft-command-actions">
              <button
                type="button"
                data-draft-command-action="insert-text"
                ${canInsertDraftCommand ? "" : "disabled"}
              >
                Insert text
              </button>
              <button
                type="button"
                data-draft-command-action="replace-selection"
                ${canReplaceDraftCommand ? "" : "disabled"}
              >
                Replace selection
              </button>
            </div>
          </div>
          <div class="draft-actions">
            <button
              type="button"
              data-draft-action="start"
              data-draft-node-id="${escapeHtml(node?.id || "")}"
              ${canStartDraft ? "" : "disabled"}
            >
              Start draft
            </button>
            <button
              type="button"
              data-draft-action="commit"
              ${draftCanCommit() ? "" : "disabled"}
            >
              Commit
            </button>
            <button
              type="button"
              data-draft-action="cancel"
              ${draftIsActive() && !state.bridgeBusy ? "" : "disabled"}
            >
              Cancel
            </button>
          </div>
          <p data-draft-message>${escapeHtml(draftPanelMessage)}</p>
        </div>
      </section>
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
          ${canUseBridge ? "" : `<small>${draftIsActive() ? "Finish the active browser draft before using direct bridge actions." : "Select a plain text-block without field refs, page numbers, or line breaks."}</small>`}
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
          <dt>Undo</dt><dd>${history.undoDepth}</dd>
          <dt>Redo</dt><dd>${history.redoDepth}</dd>
          <dt>Latest</dt><dd>${latestHistory ? escapeHtml(`${latestHistory.groupId}: ${latestHistory.summary}`) : "none"}</dd>
        </dl>
        <div class="history-actions">
          <button
            type="button"
            data-history-action="undo"
            ${history.canUndo && !state.bridgeBusy && !draftIsActive() ? "" : "disabled"}
          >
            ${state.bridgeBusy ? "Applying" : "Undo"}
          </button>
          <button
            type="button"
            data-history-action="redo"
            ${history.canRedo && !state.bridgeBusy && !draftIsActive() ? "" : "disabled"}
          >
            ${state.bridgeBusy ? "Applying" : "Redo"}
          </button>
        </div>
        <small>${draftIsActive() ? "Finish the active browser draft before undo or redo." : "Undo and redo replay only sandbox text patches kept in memory."}</small>
      </section>
      <section class="inspector-section">
        <h3>Live Layout</h3>
        <dl class="detail-list">
          <dt>Mode</dt><dd>${escapeHtml(liveLayout.mode)}</dd>
          <dt>Requests</dt><dd>${liveLayout.requestCount}</dd>
          <dt>Last</dt><dd>${liveLayoutResult ? escapeHtml(`${liveLayoutResult.kind}: ${liveLayoutResult.reason}`) : "none"}</dd>
          <dt>Dirty scopes</dt><dd>${liveLayoutResult?.dirtyScopeCount || 0}</dd>
          <dt>Text blocks</dt><dd>${liveLayoutResult?.affected.textBlockIds.length || 0}</dd>
          <dt>Parents</dt><dd>${liveLayoutResult?.affected.parentNodeIds.length || 0}</dd>
          <dt>Exact</dt><dd>${renderBadge(liveLayout.exactGenerationStale ? "stale" : "unchanged", liveLayout.exactGenerationStale ? "warn" : "good")}</dd>
        </dl>
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

function renderStatus(snapshot, renderModel) {
  const node = selectedNode()
  const packetLabel = state.lastPacket
    ? `Packet: ${state.lastPacket.changedNodeIds.length} changed ${state.lastPacket.baseRevision}->${state.lastPacket.nextRevision}`
    : "Packet: none"
  const cacheLabel = state.runtimeCache
    ? `Cache: ${state.runtimeCache.mode} ${state.runtimeCache.nodeCount} nodes ${state.runtimeCache.visibleNodeCount} visible ${state.runtimeCache.packetsApplied} packets`
    : "Cache: none"
  const range = state.runtimeCache?.visibleRange
  const rangeRequest = state.runtimeCache?.visibleRangeRequest
  const visibleRangeLabel = range
    ? `Range: ${range.kind} ${range.nodeCount}/${range.totalNodeCount} nodes ${range.sectionIds.join(",")}`
    : "Range: none"
  const visibleRangeRequestLabel = rangeRequest
    ? `Range request: ${rangeRequest.reason} ${rangeRequest.anchorNodeId || rangeRequest.anchorSectionId || "auto"} ${rangeRequest.budget.mode}`
    : "Range request: none"
  const editorViewLabel = state.runtimeCache
    ? `View: ${state.runtimeCache.viewMode} ${state.runtimeCache.childrenById.size} child indexes ${state.runtimeCache.dirtyNodeCount} dirty`
    : "View: none"
  const renderModelLabel = renderModel
    ? `Render: ${renderModel.mode} ${renderModel.sectionCount} sections ${renderModel.nodeCount} nodes`
    : "Render: none"
  const renderWindow = renderModel?.renderWindow
  const renderWindowLabel = renderWindow
    ? `Render window: ${renderWindow.mode} ${renderWindow.nodeCount}/${renderWindow.totalNodeCount} nodes ${renderWindow.sectionIds.join(",")}`
    : "Render window: none"
  const renderShell = renderModel?.renderShell
  const renderShellLabel = renderShell
    ? `Render shell: ${renderShell.mode} ${renderShell.renderedSectionCount}/${renderShell.sectionCount} rendered ${renderShell.placeholderSectionCount} placeholders`
    : "Render shell: none"
  const storeLabel = state.runtimeCache
    ? `Store: ${state.runtimeCache.storeMode} ${state.runtimeCache.nodeCount} nodes ${state.runtimeCache.runtimeStore.sectionCount} sections`
    : "Store: none"
  const storeApplyLabel = state.runtimeCache?.runtimeStoreApplyMode
    ? `Store apply: ${state.runtimeCache.runtimeStoreApplyMode}`
    : "Store apply: none"
  const historyLabel = snapshot.authoringHistory
    ? `History: ${snapshot.authoringHistory.recordCount} records ${snapshot.authoringHistory.groupCount} groups`
    : "History: none"
  const liveLayout = snapshot.liveLayout
  const liveLayoutLabel = liveLayout?.lastResult
    ? `Live layout: ${liveLayout.requestCount} ${liveLayout.lastResult.reason} exact ${liveLayout.lastResult.freshness.exactGeneration.status}`
    : `Live layout: ${liveLayout?.requestCount || 0} requests`

  return `
    <footer class="statusbar">
      <span>Selection: ${escapeHtml(node?.id || snapshot.session.selectionKind)}</span>
      <span>Source: ${escapeHtml(state.selectionSource)}</span>
      <span>Surface: ${escapeHtml(node?.surface || "none")}</span>
      <span>${escapeHtml(storeLabel)}</span>
      <span>${escapeHtml(storeApplyLabel)}</span>
      <span>${escapeHtml(renderModelLabel)}</span>
      <span>${escapeHtml(renderWindowLabel)}</span>
      <span>${escapeHtml(renderShellLabel)}</span>
      <span data-viewport-measurement-status>${escapeHtml(viewportMeasurementLabel())}</span>
      <span data-section-spacer-status>${escapeHtml(viewportSectionSpacerLabel())}</span>
      <span data-section-offset-status>${escapeHtml(viewportSectionOffsetLabel())}</span>
      <span data-viewport-scheduler-candidate-status>${escapeHtml(viewportSchedulerCandidateLabel())}</span>
      <span data-viewport-scheduler-apply-status>${escapeHtml(viewportSchedulerApplyLabel())}</span>
      <span data-viewport-scheduler-runtime-status>${escapeHtml(viewportSchedulerRuntimeLabel())}</span>
      <span data-viewport-scheduler-automation-status>${escapeHtml(viewportSchedulerAutomationLabel())}</span>
      <span data-viewport-anchor-status>${escapeHtml(viewportAnchorLabel())}</span>
      <span>${escapeHtml(viewportApplyLabel())}</span>
      <span data-viewport-scroll-status>${escapeHtml(viewportScrollControllerLabel())}</span>
      <span>${escapeHtml(editorViewLabel)}</span>
      <span>${escapeHtml(visibleRangeRequestLabel)}</span>
      <span>${escapeHtml(visibleRangeLabel)}</span>
      <span>Doc rev: ${snapshot.session.documentRevision}</span>
      <span data-draft-statusbar>Draft: ${escapeHtml(draftStatusLabel())}</span>
      <span data-draft-selectionbar>Draft selection: ${escapeHtml(draftSelectionLabel())}</span>
      <span data-draft-compositionbar>IME: ${escapeHtml(draftCompositionLabel())}</span>
      <span data-draft-commandbar>Command: ${escapeHtml(draftCommandSummary())}</span>
      <span>Bridge: ${escapeHtml(snapshot.mutationBridge.mode)}</span>
      <span>Mutations: ${snapshot.mutationBridge.mutationCount}</span>
      <span>${escapeHtml(packetLabel)}</span>
      <span>${escapeHtml(cacheLabel)}</span>
      <span>${escapeHtml(historyLabel)}</span>
      <span>${escapeHtml(liveLayoutLabel)}</span>
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
  setVisibleRangeRequest(createSelectionVisibleRangeRequest(nodeId, state.runtimeCache?.visibleRangeRequest, {
    draftActive: draftIsActive(),
  }))
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
    const viewportApplyTarget = event.target.closest("[data-viewport-apply]")
    if (viewportApplyTarget && canvas.contains(viewportApplyTarget)) {
      event.stopPropagation()
      applyViewportMeasurement()
      return
    }

    const viewportSchedulerApplyTarget = event.target.closest("[data-viewport-scheduler-apply]")
    if (viewportSchedulerApplyTarget && canvas.contains(viewportSchedulerApplyTarget)) {
      event.stopPropagation()
      applyViewportSchedulerCandidate()
      return
    }

    const draftActionTarget = event.target.closest("[data-draft-action]")
    if (draftActionTarget && canvas.contains(draftActionTarget)) {
      event.stopPropagation()
      applyDraftAction(draftActionTarget.dataset.draftAction, draftActionTarget.dataset.draftNodeId)
      return
    }

    if (event.target.closest("[data-draft-editor]")) {
      event.stopPropagation()
      return
    }

    const target = event.target.closest("[data-node-id]")
    if (!target || !canvas.contains(target)) return
    event.stopPropagation()
    selectNode(target.dataset.nodeId, "canvas")
  })

  canvas?.addEventListener("scroll", () => {
    scheduleViewportScrollApply()
  })

  canvas?.addEventListener("dblclick", (event) => {
    if (event.target.closest("[data-draft-editor], [data-draft-action]")) return
    const target = event.target.closest(".canvas-text[data-node-id]")
    if (!target || !canvas.contains(target)) return
    event.stopPropagation()
    startDraftForNode(target.dataset.nodeId, "canvas-draft")
  })

  const draftEditor = canvas?.querySelector("[data-draft-editor]")

  draftEditor?.addEventListener("input", (event) => {
    updateDraftSelectionFromEditor(event.target, "input")
    if (state.draft.isComposing || event.isComposing) {
      state.draft = {
        ...state.draft,
        compositionSource: state.draft.compositionSource === "idle" ? "input-composing" : state.draft.compositionSource,
        isComposing: true,
        message: "IME composition is active. Finish composition before commands or commit.",
        status: "editing",
      }
      syncDraftDomState()
      return
    }

    state.draft = {
      ...state.draft,
      message: "Local draft changes are waiting for commit.",
      status: "editing",
    }
    syncDraftDomState()
  })

  draftEditor?.addEventListener("compositionstart", (event) => {
    updateDraftCompositionFromEditor(event.target, "compositionstart", event.data)
  })

  draftEditor?.addEventListener("compositionupdate", (event) => {
    updateDraftCompositionFromEditor(event.target, "compositionupdate", event.data)
  })

  draftEditor?.addEventListener("compositionend", (event) => {
    updateDraftCompositionFromEditor(event.target, "compositionend", event.data)
  })

  ;["click", "focus", "keyup", "mouseup", "select"].forEach((eventName) => {
    draftEditor?.addEventListener(eventName, (event) => {
      updateDraftSelectionFromEditor(event.target, eventName)
      syncDraftDomState()
    })
  })

  inspector?.addEventListener("click", (event) => {
    const draftSelectionTarget = event.target.closest("[data-draft-selection-action]")
    if (draftSelectionTarget && inspector.contains(draftSelectionTarget)) {
      event.stopPropagation()
      applyDraftSelectionAction(draftSelectionTarget.dataset.draftSelectionAction)
      return
    }

    const draftCommandTarget = event.target.closest("[data-draft-command-action]")
    if (draftCommandTarget && inspector.contains(draftCommandTarget)) {
      event.stopPropagation()
      applyDraftTextCommand(draftCommandTarget.dataset.draftCommandAction)
      return
    }

    const draftActionTarget = event.target.closest("[data-draft-action]")
    if (draftActionTarget && inspector.contains(draftActionTarget)) {
      event.stopPropagation()
      applyDraftAction(draftActionTarget.dataset.draftAction, draftActionTarget.dataset.draftNodeId)
      return
    }

    const actionTarget = event.target.closest("[data-mutation-action]")
    if (actionTarget && inspector.contains(actionTarget)) {
      event.stopPropagation()
      applyBridgeTextAction(actionTarget.dataset.mutationAction)
      return
    }

    const historyTarget = event.target.closest("[data-history-action]")
    if (historyTarget && inspector.contains(historyTarget)) {
      event.stopPropagation()
      applyHistoryAction(historyTarget.dataset.historyAction)
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

  inspector?.querySelector("[data-draft-command-text]")?.addEventListener("input", (event) => {
    state.draftCommandText = event.target.value
    syncDraftDomState()
  })

  inspector?.querySelectorAll("[data-draft-selection-input]").forEach((target) => {
    target.addEventListener("input", (event) => {
      updateDraftSelectionControl(event.target.dataset.draftSelectionInput, event.target.value)
    })
  })
}

function applyDraftAction(action, nodeId) {
  if (action === "start") {
    startDraftForNode(nodeId || state.selectedId, "draft")
    return
  }

  if (action === "cancel") {
    cancelDraft()
    return
  }

  if (action === "commit") {
    commitDraft()
  }
}

async function commitDraft() {
  if (!draftIsActive() || state.bridgeBusy) return

  const draft = { ...state.draft }
  const node = draftTargetNode()
  const guardReason = draftGuardReason(node)

  if (draft.isComposing) {
    state.draft = {
      ...state.draft,
      message: "Finish IME composition before committing the draft.",
      status: "editing",
    }
    syncDraftDomState()
    focusDraftEditor()
    return
  }

  if (guardReason) {
    state.draft = {
      ...state.draft,
      message: guardReason,
      status: "blocked",
    }
    render()
    focusDraftEditor()
    return
  }

  if (!draftIsDirty()) {
    state.draft = {
      ...state.draft,
      message: "Draft has no local changes to commit.",
      status: "editing",
    }
    syncDraftDomState()
    return
  }

  if (draft.baseRevision !== state.snapshot.session.documentRevision) {
    state.draft = {
      ...state.draft,
      message: `Draft base ${draft.baseRevision} does not match document revision ${state.snapshot.session.documentRevision}.`,
      status: "conflicted",
    }
    render()
    focusDraftEditor()
    return
  }

  state.bridgeBusy = true
  state.bridgeMessage = "Committing browser draft through sandbox bridge..."
  state.draft = {
    ...state.draft,
    message: "Committing browser draft through sandbox bridge...",
    status: "committing",
  }
  render()

  try {
    const response = await fetch(routeForBridgeTextAction("replace-text"), {
      body: JSON.stringify({
        text: draft.text,
        textBlockId: draft.textBlockId,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    const result = await response.json()
    const fallbackReason = await applyMutationResult(result)
    if (result.ok) {
      resetDraft("committed", `Committed browser draft through bridge.${fallbackReason}`)
      state.selectedId = draft.textBlockId
      state.selectionSource = "wysiwyg-draft"
      state.bridgeMessage = `draft committed: ${result.mutation.summary}${fallbackReason}`
    } else {
      const issueMessage = (result.issues || []).map((issue) => issue.message).join("; ") || "bridge rejected draft"
      state.draft = {
        ...draft,
        message: `${issueMessage}${fallbackReason}`,
        status: "rejected",
      }
      state.bridgeMessage = `draft rejected: ${issueMessage}${fallbackReason}`
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "draft commit failed"
    state.draft = {
      ...draft,
      message,
      status: "rejected",
    }
    state.bridgeMessage = message
  } finally {
    state.bridgeBusy = false
    render()
    if (draftIsActive()) focusDraftEditor()
  }
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

function routeForHistoryAction(action) {
  if (action === "redo") return "./api/actions/redo?response=packet"
  return "./api/actions/undo?response=packet"
}

async function applyMutationResult(result) {
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

  return fallbackReason
}

async function applyBridgeTextAction(action) {
  if (draftIsActive()) {
    state.bridgeMessage = "Finish the active browser draft before using direct bridge actions."
    render()
    return
  }

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
    const fallbackReason = await applyMutationResult(result)
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

async function applyHistoryAction(action) {
  if (draftIsActive()) {
    state.bridgeMessage = "Finish the active browser draft before undo or redo."
    render()
    return
  }

  const history = state.snapshot?.authoringHistory
  if (!history) return
  if (action === "undo" && !history.canUndo) return
  if (action === "redo" && !history.canRedo) return

  state.bridgeBusy = true
  state.bridgeMessage = `Sending ${action} to sandbox bridge...`
  render()

  try {
    const response = await fetch(routeForHistoryAction(action), {
      body: "{}",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    const result = await response.json()
    const fallbackReason = await applyMutationResult(result)
    state.bridgeMessage = result.ok
      ? `${action}: ${result.mutation.summary}${fallbackReason}`
      : `rejected: ${(result.issues || []).map((issue) => issue.message).join("; ")}${fallbackReason}`
    state.selectionSource = action
  } catch (error) {
    state.bridgeMessage = error instanceof Error ? error.message : `${action} request failed`
  } finally {
    state.bridgeBusy = false
    render()
  }
}

function render(options = {}) {
  const snapshot = state.snapshot
  if (!snapshot) {
    state.renderModel = null
    app.innerHTML = `<div class="loading">Loading sandbox...</div>`
    return
  }

  const renderModel = createStoreBackedRenderModel(snapshot, state.runtimeCache)
  state.renderModel = renderModel

  app.innerHTML = `
    ${renderToolbar(snapshot)}
    <div class="workspace">
      ${renderNodeTree(renderModel)}
      ${renderCanvas(snapshot, renderModel)}
      ${renderInspector(snapshot)}
    </div>
    ${renderStatus(snapshot, renderModel)}
  `

  bindSelectionHandlers()
  const canvas = app.querySelector(".canvas-wrap")
  let viewportMeasurement = readCanvasViewportMeasurement(renderModel)
  const restoreAnchor = options.restoreViewportAnchor
  const fallbackScrollTop = options.fallbackCanvasScrollTop ?? options.restoreCanvasScrollTop
  if (canvas && restoreAnchor) {
    const anchorRestore = resolveViewportSectionAnchorScrollTop({
      anchor: restoreAnchor,
      fallbackScrollTop,
      measurement: viewportMeasurement,
    })
    state.viewportAnchorRestore = anchorRestore
    state.viewportAnchor = anchorRestore.anchor
    state.viewportScrollRestoring = true
    canvas.scrollTop = anchorRestore.scrollTop
    window.setTimeout(() => {
      state.viewportScrollRestoring = false
    }, 0)
    viewportMeasurement = readCanvasViewportMeasurement(renderModel)
  } else if (canvas && Number.isFinite(fallbackScrollTop)) {
    state.viewportScrollRestoring = true
    canvas.scrollTop = fallbackScrollTop
    window.setTimeout(() => {
      state.viewportScrollRestoring = false
    }, 0)
    viewportMeasurement = readCanvasViewportMeasurement(renderModel)
  }
  state.viewportMeasurement = viewportMeasurement
  updateViewportSectionSpacers(viewportMeasurement)
  syncViewportMeasurementStatus()
  syncViewportSectionSpacerStatus()
  syncViewportSectionOffsetStatus()
  syncViewportSchedulerCandidateStatus()
  syncViewportSchedulerApplyStatus()
  syncViewportSchedulerRuntimeStatus()
  syncViewportSchedulerAutomationStatus()
  syncViewportAnchorStatus()
  syncViewportScrollControllerStatus()
}

async function boot() {
  render()
  setSnapshotFromBoot(await fetchSnapshot())
  const bootNodes = state.runtimeCache.visibleNodeIds
    .map((nodeId) => state.runtimeCache.nodeById.get(nodeId))
    .filter(Boolean)
  const firstTextBlock = bootNodes.find((node) => node.type === "text-block")
  state.selectedId = firstTextBlock?.id || bootNodes[0]?.id || null
  state.selectionSource = "boot"
  render()
}

boot().catch((error) => {
  app.innerHTML = `<pre class="error">${escapeHtml(error.stack || error.message || error)}</pre>`
})
