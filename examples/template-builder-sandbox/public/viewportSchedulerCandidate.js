import {
  createVisibleRangeRequest,
  VISIBLE_RANGE_REQUEST_REASONS,
} from "./visibleRangeRequest.js"

export const VIEWPORT_SCHEDULER_CANDIDATE_SOURCE = "flowdoc-viewport-scheduler-candidate"
export const VIEWPORT_SCHEDULER_CANDIDATE_MODE = "observe-only-section-window-candidate"
export const DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS = 1

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(Number(value)))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter((value) => typeof value === "string" && value.length > 0))]
}

function sectionOrder(input = {}) {
  const offsetSections = input.offsetIndex?.sections || []
  const orderedIds = offsetSections.map((section) => section.sectionId)
  const predictionIds = input.prediction?.predictedSectionIds || []
  const currentIds = input.renderWindow?.sectionIds || []
  return uniqueStrings([...orderedIds, ...predictionIds, ...currentIds])
}

function sectionFactsById(offsetIndex) {
  return new Map((offsetIndex?.sections || []).map((section) => [section.sectionId, section]))
}

function candidateReason(input = {}) {
  const explicitReason = stringOrNull(input.reason)
  if (explicitReason) return explicitReason
  if (input.scrollController?.pending) return "scroll-pending"
  if (input.scrollController?.status === "applied") return "scroll-settled"
  if (input.scrollController?.status === "skipped") return "scroll-skipped"
  return "observe"
}

function candidateAnchor(input, orderedSectionIds, predictedSectionIds) {
  return stringOrNull(input.prediction?.anchorSectionId)
    || stringOrNull(predictedSectionIds[0])
    || stringOrNull(input.previousRequest?.anchorSectionId)
    || stringOrNull(input.renderWindow?.anchorSectionId)
    || stringOrNull(orderedSectionIds[0])
}

function expandCandidateSectionIds(orderedSectionIds, predictedSectionIds, anchorSectionId, overscanBefore, overscanAfter) {
  if (orderedSectionIds.length === 0) return []
  const seedIds = uniqueStrings(predictedSectionIds.length > 0 ? predictedSectionIds : [anchorSectionId])
  const seedIndexes = seedIds
    .map((sectionId) => orderedSectionIds.indexOf(sectionId))
    .filter((index) => index >= 0)

  if (seedIndexes.length === 0) {
    const fallbackIndex = orderedSectionIds.indexOf(anchorSectionId)
    if (fallbackIndex < 0) return []
    seedIndexes.push(fallbackIndex)
  }

  const startIndex = Math.max(0, Math.min(...seedIndexes) - overscanBefore)
  const endIndex = Math.min(orderedSectionIds.length - 1, Math.max(...seedIndexes) + overscanAfter)
  return orderedSectionIds.slice(startIndex, endIndex + 1)
}

function confidenceForSections(candidateSectionIds, offsetIndex) {
  if (candidateSectionIds.length === 0) return "missing"
  const factsById = sectionFactsById(offsetIndex)
  let measuredCount = 0
  let estimatedCount = 0

  for (const sectionId of candidateSectionIds) {
    const reason = factsById.get(sectionId)?.reason
    if (reason === "measured") {
      measuredCount += 1
    } else {
      estimatedCount += 1
    }
  }

  if (measuredCount > 0 && estimatedCount > 0) return "mixed"
  if (measuredCount > 0) return "measured"
  return "estimated"
}

function sectionDelta(candidateSectionIds, renderWindow) {
  const currentSectionIds = uniqueStrings(renderWindow?.sectionIds)
  const currentSet = new Set(currentSectionIds)
  const candidateSet = new Set(candidateSectionIds)

  return {
    currentSectionIds,
    extraSectionIds: currentSectionIds.filter((sectionId) => !candidateSet.has(sectionId)),
    missingSectionIds: candidateSectionIds.filter((sectionId) => !currentSet.has(sectionId)),
  }
}

function applyState({ blockedReason, hasWindowDelta, observeOnly }) {
  if (blockedReason) return "blocked"
  if (observeOnly) return "observe-only"
  return hasWindowDelta ? "ready" : "stable"
}

export function createViewportSchedulerCandidate(input = {}) {
  const orderedSectionIds = sectionOrder(input)
  const predictedSectionIds = uniqueStrings(input.prediction?.predictedSectionIds)
  const overscanSectionsBefore = nonNegativeInteger(
    input.overscanSectionsBefore,
    DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS,
  )
  const overscanSectionsAfter = nonNegativeInteger(
    input.overscanSectionsAfter,
    DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS,
  )
  const anchorSectionId = candidateAnchor(input, orderedSectionIds, predictedSectionIds)
  const candidateSectionIds = expandCandidateSectionIds(
    orderedSectionIds,
    predictedSectionIds,
    anchorSectionId,
    overscanSectionsBefore,
    overscanSectionsAfter,
  )
  const delta = sectionDelta(candidateSectionIds, input.renderWindow)
  const blockedReason = candidateSectionIds.length === 0 ? "section-candidate-missing" : null
  const observeOnly = input.observeOnly !== false
  const hasWindowDelta = delta.missingSectionIds.length > 0 || delta.extraSectionIds.length > 0
  const request = createVisibleRangeRequest({
    anchorSectionId,
    budget: input.budget || input.previousRequest?.budget,
    kind: "section-window",
    overscanSectionsAfter,
    overscanSectionsBefore,
    reason: input.requestReason || VISIBLE_RANGE_REQUEST_REASONS.VIEWPORT,
  }, input.previousRequest || {})

  return {
    anchorSectionId,
    applyReady: !observeOnly && !blockedReason && hasWindowDelta,
    applyState: applyState({ blockedReason, hasWindowDelta, observeOnly }),
    blockedReason,
    candidateReason: candidateReason(input),
    candidateSectionCount: candidateSectionIds.length,
    candidateSectionIds,
    confidence: confidenceForSections(candidateSectionIds, input.offsetIndex),
    currentSectionIds: delta.currentSectionIds,
    extraSectionIds: delta.extraSectionIds,
    hasWindowDelta,
    missingSectionIds: delta.missingSectionIds,
    mode: VIEWPORT_SCHEDULER_CANDIDATE_MODE,
    observeOnly,
    orderedSectionCount: orderedSectionIds.length,
    orderedSectionIds,
    overscanSectionsAfter,
    overscanSectionsBefore,
    predictedSectionCount: predictedSectionIds.length,
    predictedSectionIds,
    request,
    requestReason: request.reason,
    source: VIEWPORT_SCHEDULER_CANDIDATE_SOURCE,
    version: 1,
    visibleSectionCount: nonNegativeInteger(input.prediction?.visibleSectionCount, predictedSectionIds.length),
  }
}
