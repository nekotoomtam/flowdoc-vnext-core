export const VISIBLE_RANGE_REQUEST_SOURCE = "flowdoc-visible-range-request"
export const VISIBLE_RANGE_REQUEST_VERSION = 1
export const VISIBLE_RANGE_REQUEST_KIND = "section-window"

export const VISIBLE_RANGE_REQUEST_REASONS = Object.freeze({
  BOOT: "boot",
  DEBUG: "debug",
  DRAFT: "draft",
  MANUAL: "manual",
  PACKET_APPLY: "packet-apply",
  REFRESH: "refresh",
  SELECTION: "selection",
  SELECTION_PRESERVED: "selection-preserved",
  VIEWPORT: "viewport",
  VIEWPORT_PRESERVED: "viewport-preserved",
})

const DEFAULT_BUDGET = Object.freeze({
  maxNodes: null,
  mode: "interactive",
})

function optionalPositiveInteger(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(value))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeKind(kind) {
  return kind === "all-nodes" ? "all-nodes" : VISIBLE_RANGE_REQUEST_KIND
}

function normalizeReason(reason, fallback = VISIBLE_RANGE_REQUEST_REASONS.MANUAL) {
  return typeof reason === "string" && reason.length > 0 ? reason : fallback
}

function normalizeBudget(inputBudget = {}, fallbackBudget = DEFAULT_BUDGET) {
  const maxNodes = optionalPositiveInteger(
    inputBudget.maxNodes,
    optionalPositiveInteger(fallbackBudget?.maxNodes, DEFAULT_BUDGET.maxNodes),
  )
  const mode = typeof inputBudget.mode === "string" && inputBudget.mode.length > 0
    ? inputBudget.mode
    : fallbackBudget?.mode || DEFAULT_BUDGET.mode

  return { maxNodes, mode }
}

function requestFrom(input) {
  return input && typeof input === "object" ? input : {}
}

export function createVisibleRangeRequest(input = {}, fallback = {}) {
  const requestInput = requestFrom(input)
  const fallbackInput = requestFrom(fallback)
  const budgetInput = requestFrom(requestInput.budget)
  const fallbackBudget = requestFrom(fallbackInput.budget)
  const budget = normalizeBudget({
    ...budgetInput,
    maxNodes: requestInput.maxNodes ?? budgetInput.maxNodes,
  }, fallbackBudget)

  return {
    anchorNodeId: stringOrNull(requestInput.anchorNodeId ?? fallbackInput.anchorNodeId),
    anchorSectionId: stringOrNull(requestInput.anchorSectionId ?? fallbackInput.anchorSectionId),
    budget,
    kind: normalizeKind(requestInput.kind ?? fallbackInput.kind),
    maxNodes: budget.maxNodes,
    overscanSectionsAfter: nonNegativeInteger(
      requestInput.overscanSectionsAfter,
      nonNegativeInteger(fallbackInput.overscanSectionsAfter),
    ),
    overscanSectionsBefore: nonNegativeInteger(
      requestInput.overscanSectionsBefore,
      nonNegativeInteger(fallbackInput.overscanSectionsBefore),
    ),
    preserveDuringDraft: Boolean(requestInput.preserveDuringDraft ?? fallbackInput.preserveDuringDraft),
    preservedFromReason: stringOrNull(requestInput.preservedFromReason),
    reason: normalizeReason(requestInput.reason ?? fallbackInput.reason),
    source: VISIBLE_RANGE_REQUEST_SOURCE,
    version: VISIBLE_RANGE_REQUEST_VERSION,
  }
}

export function createBootVisibleRangeRequest(sectionId = null, options = {}) {
  return createVisibleRangeRequest({
    ...options,
    anchorSectionId: sectionId,
    reason: VISIBLE_RANGE_REQUEST_REASONS.BOOT,
  })
}

export function createSelectionVisibleRangeRequest(anchorNodeId, previousRequest = null, options = {}) {
  const previous = previousRequest ? createVisibleRangeRequest(previousRequest) : null

  if (options.draftActive && previous?.preserveDuringDraft) {
    return preserveVisibleRangeRequest(previous, {
      reason: VISIBLE_RANGE_REQUEST_REASONS.SELECTION_PRESERVED,
    })
  }

  return createVisibleRangeRequest({
    anchorNodeId,
    budget: options.budget || previous?.budget,
    overscanSectionsAfter: options.overscanSectionsAfter ?? previous?.overscanSectionsAfter,
    overscanSectionsBefore: options.overscanSectionsBefore ?? previous?.overscanSectionsBefore,
    reason: VISIBLE_RANGE_REQUEST_REASONS.SELECTION,
  })
}

export function createDraftVisibleRangeRequest(anchorNodeId, previousRequest = null, options = {}) {
  const previous = previousRequest ? createVisibleRangeRequest(previousRequest) : null

  return createVisibleRangeRequest({
    anchorNodeId,
    budget: options.budget || previous?.budget,
    overscanSectionsAfter: options.overscanSectionsAfter ?? previous?.overscanSectionsAfter,
    overscanSectionsBefore: options.overscanSectionsBefore ?? previous?.overscanSectionsBefore,
    preserveDuringDraft: true,
    reason: VISIBLE_RANGE_REQUEST_REASONS.DRAFT,
  })
}

export function preserveVisibleRangeRequest(previousRequest, options = {}) {
  const previous = createVisibleRangeRequest(previousRequest)

  return createVisibleRangeRequest({
    ...previous,
    preservedFromReason: previous.reason,
    reason: options.reason || VISIBLE_RANGE_REQUEST_REASONS.PACKET_APPLY,
  })
}
