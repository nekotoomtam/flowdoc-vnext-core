import {
  createVisibleRangeRequest,
  preserveVisibleRangeRequest,
  VISIBLE_RANGE_REQUEST_REASONS,
} from "./visibleRangeRequest.js"

export const VIEWPORT_CONTROLLER_SOURCE = "flowdoc-viewport-controller"
export const VIEWPORT_RANGE_REQUEST_MODE = "viewport-range-request"

const DEFAULT_VIEWPORT_BUDGET = Object.freeze({
  maxNodes: null,
  mode: "viewport",
})

function optionalPositiveInteger(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

function nonNegativeNumber(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Number(value))
}

function positiveNumber(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Number(value))
}

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function viewportBudget(inputBudget = {}, fallbackBudget = DEFAULT_VIEWPORT_BUDGET) {
  const maxNodes = optionalPositiveInteger(
    inputBudget.maxNodes,
    optionalPositiveInteger(fallbackBudget?.maxNodes, DEFAULT_VIEWPORT_BUDGET.maxNodes),
  )
  const mode = typeof inputBudget.mode === "string" && inputBudget.mode.length > 0
    ? inputBudget.mode
    : fallbackBudget?.mode || DEFAULT_VIEWPORT_BUDGET.mode

  return { maxNodes, mode }
}

export function createViewportFacts(input = {}, previousRequest = null) {
  const previous = previousRequest ? createVisibleRangeRequest(previousRequest) : null

  return {
    anchorNodeId: stringOrNull(input.anchorNodeId ?? previous?.anchorNodeId),
    anchorSectionId: stringOrNull(input.anchorSectionId ?? previous?.anchorSectionId),
    budget: viewportBudget(input.budget || {}, previous?.budget || DEFAULT_VIEWPORT_BUDGET),
    mode: VIEWPORT_RANGE_REQUEST_MODE,
    overscanSectionsAfter: nonNegativeInteger(input.overscanSectionsAfter, previous?.overscanSectionsAfter ?? 0),
    overscanSectionsBefore: nonNegativeInteger(input.overscanSectionsBefore, previous?.overscanSectionsBefore ?? 0),
    reason: VISIBLE_RANGE_REQUEST_REASONS.VIEWPORT,
    scrollHeight: positiveNumber(input.scrollHeight, null),
    scrollTop: nonNegativeNumber(input.scrollTop, 0),
    source: VIEWPORT_CONTROLLER_SOURCE,
    version: 1,
    viewportHeight: positiveNumber(input.viewportHeight, null),
  }
}

export function resolveViewportRangeRequest(input = {}, previousRequest = null) {
  const previous = previousRequest ? createVisibleRangeRequest(previousRequest) : null
  const viewport = createViewportFacts(input, previous)

  if (input.draftActive && previous?.preserveDuringDraft) {
    return {
      mode: VIEWPORT_RANGE_REQUEST_MODE,
      preserved: true,
      source: VIEWPORT_CONTROLLER_SOURCE,
      version: 1,
      viewport,
      visibleRangeRequest: preserveVisibleRangeRequest(previous, {
        reason: VISIBLE_RANGE_REQUEST_REASONS.VIEWPORT_PRESERVED,
      }),
    }
  }

  return {
    mode: VIEWPORT_RANGE_REQUEST_MODE,
    preserved: false,
    source: VIEWPORT_CONTROLLER_SOURCE,
    version: 1,
    viewport,
    visibleRangeRequest: createVisibleRangeRequest({
      anchorNodeId: viewport.anchorNodeId,
      anchorSectionId: viewport.anchorSectionId,
      budget: viewport.budget,
      kind: "section-window",
      overscanSectionsAfter: viewport.overscanSectionsAfter,
      overscanSectionsBefore: viewport.overscanSectionsBefore,
      reason: viewport.reason,
    }, previous || {}),
  }
}
