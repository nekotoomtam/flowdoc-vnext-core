import { createViewportMeasurementApplyRequest } from "./viewportMeasurement.js"

export const VIEWPORT_SCROLL_CONTROLLER_SOURCE = "flowdoc-viewport-scroll-controller"
export const VIEWPORT_SCROLL_CONTROLLER_MODE = "debounced-measurement-apply"
export const DEFAULT_VIEWPORT_SCROLL_DEBOUNCE_MS = 160

function positiveInteger(value, fallback) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.round(Number(value)))
}

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.round(Number(value)))
}

function numberOrNull(value) {
  return Number.isFinite(value) ? Number(value) : null
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function measurementAnchor(measurement) {
  return stringOrNull(measurement?.anchorSectionId)
}

function measurementScrollTop(measurement, fallback) {
  return numberOrNull(measurement?.scrollTop) ?? numberOrNull(fallback)
}

export function createViewportScrollControllerState(input = {}) {
  return {
    appliedCount: nonNegativeInteger(input.appliedCount),
    debounceMs: positiveInteger(input.debounceMs, DEFAULT_VIEWPORT_SCROLL_DEBOUNCE_MS),
    eventCount: nonNegativeInteger(input.eventCount),
    lastAppliedAnchorSectionId: stringOrNull(input.lastAppliedAnchorSectionId),
    lastAppliedRequestReason: stringOrNull(input.lastAppliedRequestReason),
    lastMeasuredAnchorSectionId: stringOrNull(input.lastMeasuredAnchorSectionId),
    lastScrollTop: numberOrNull(input.lastScrollTop),
    lastSettledEventCount: nonNegativeInteger(input.lastSettledEventCount),
    lastSkippedReason: stringOrNull(input.lastSkippedReason),
    mode: VIEWPORT_SCROLL_CONTROLLER_MODE,
    pending: Boolean(input.pending),
    skippedCount: nonNegativeInteger(input.skippedCount),
    source: VIEWPORT_SCROLL_CONTROLLER_SOURCE,
    status: typeof input.status === "string" ? input.status : "idle",
    version: 1,
  }
}

export function recordViewportScroll(controllerState, input = {}) {
  const controller = createViewportScrollControllerState(controllerState)
  const measurement = input.measurement
  const nextEventCount = controller.eventCount + 1

  return {
    ...controller,
    eventCount: nextEventCount,
    lastMeasuredAnchorSectionId: measurementAnchor(measurement) ?? controller.lastMeasuredAnchorSectionId,
    lastScrollTop: measurementScrollTop(measurement, input.scrollTop) ?? controller.lastScrollTop,
    lastSkippedReason: null,
    pending: true,
    status: "pending",
  }
}

function skipViewportScroll(controller, reason) {
  return {
    scrollController: {
      ...controller,
      lastSettledEventCount: controller.eventCount,
      lastSkippedReason: reason,
      pending: false,
      skippedCount: controller.skippedCount + 1,
      status: "skipped",
    },
    applyRequest: null,
  }
}

export function settleViewportScroll(controllerState, input = {}) {
  const controller = createViewportScrollControllerState(controllerState)
  const measurement = input.measurement

  if (input.isComposing) return skipViewportScroll(controller, "composition-active")
  if (input.draftActive) return skipViewportScroll(controller, "draft-active")
  if (!measurement) return skipViewportScroll(controller, "measurement-missing")

  const applyRequest = createViewportMeasurementApplyRequest({
    budget: input.budget,
    draftActive: false,
    measurement,
  }, input.previousRequest ?? null)

  return {
    scrollController: {
      ...controller,
      appliedCount: controller.appliedCount + 1,
      lastAppliedAnchorSectionId: applyRequest.anchorSectionId,
      lastAppliedRequestReason: applyRequest.visibleRangeRequest.reason,
      lastMeasuredAnchorSectionId: measurementAnchor(measurement) ?? controller.lastMeasuredAnchorSectionId,
      lastScrollTop: measurementScrollTop(measurement, controller.lastScrollTop),
      lastSettledEventCount: controller.eventCount,
      lastSkippedReason: null,
      pending: false,
      status: "applied",
    },
    applyRequest,
  }
}
