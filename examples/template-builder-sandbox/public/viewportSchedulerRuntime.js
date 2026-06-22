import { createViewportSchedulerApplyRequest, VIEWPORT_SCHEDULER_APPLY_MODE, VIEWPORT_SCHEDULER_APPLY_SOURCE } from "./viewportSchedulerApply.js"
import { createViewportSchedulerCandidate, VIEWPORT_SCHEDULER_CANDIDATE_SOURCE } from "./viewportSchedulerCandidate.js"

export const VIEWPORT_SCHEDULER_RUNTIME_SOURCE = "flowdoc-viewport-scheduler-runtime"
export const VIEWPORT_SCHEDULER_RUNTIME_MODE = "bounded-section-window-scheduler"
export const VIEWPORT_SCHEDULER_RUNTIME_VERSION = 1

const RUNTIME_STATUSES = new Set(["idle", "pending", "ready", "applied", "blocked", "stable", "stale"])

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(Number(value)))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function numberOrNull(value) {
  return Number.isFinite(value) ? Number(value) : null
}

function sameRevision(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return true
  return Number(left) === Number(right)
}

function normalizeStatus(status) {
  return RUNTIME_STATUSES.has(status) ? status : "idle"
}

function uniqueStrings(values) {
  return [...new Set((values || []).filter((value) => typeof value === "string" && value.length > 0))]
}

function candidateSignature(candidate) {
  if (!candidate) return "missing"
  const request = candidate.request || {}
  const budget = request.budget || {}
  return [
    candidate.anchorSectionId || "none",
    uniqueStrings(candidate.candidateSectionIds).join(",") || "none",
    uniqueStrings(candidate.currentSectionIds).join(",") || "none",
    request.reason || candidate.requestReason || "none",
    budget.mode || "none",
    budget.maxNodes ?? "all",
    candidate.overscanSectionsBefore ?? 0,
    candidate.overscanSectionsAfter ?? 0,
  ].join("|")
}

function requestIdForCandidate(candidate, sequence) {
  return `viewport-scheduler:${sequence}:${candidateSignature(candidate)}`
}

function statusForCandidate(candidate) {
  if (!candidate) return "idle"
  if (candidate.applyState === "ready") return "ready"
  if (candidate.applyState === "stable") return "stable"
  if (candidate.applyState === "blocked") return "blocked"
  return "pending"
}

function decorateCandidate(candidate, sequence, input = {}) {
  const signature = candidateSignature(candidate)

  return {
    ...candidate,
    schedulerDocumentRevision: numberOrNull(input.documentRevision),
    schedulerRequestId: requestIdForCandidate(candidate, sequence),
    schedulerRuntimeRevision: numberOrNull(input.runtimeRevision),
    schedulerSequence: sequence,
    schedulerSignature: signature,
    schedulerSource: VIEWPORT_SCHEDULER_RUNTIME_SOURCE,
  }
}

function blockedApplyRequest(candidate, reason, trigger) {
  return {
    anchorSectionId: candidate?.anchorSectionId || null,
    applyReady: false,
    applyState: reason === "render-window-stable" ? "stable" : "blocked",
    blockedReason: reason,
    candidateApplyState: candidate?.applyState || "missing",
    candidateSectionIds: candidate?.candidateSectionIds || [],
    mode: VIEWPORT_SCHEDULER_APPLY_MODE,
    request: null,
    requestReason: null,
    source: VIEWPORT_SCHEDULER_APPLY_SOURCE,
    trigger: stringOrNull(trigger) || "manual",
    version: 1,
  }
}

function runtimeBlockedReason(runtime, candidate, input = {}) {
  if (!candidate) return "candidate-missing"
  if (candidate.source !== VIEWPORT_SCHEDULER_CANDIDATE_SOURCE) return "candidate-source-mismatch"

  const candidateRequestId = stringOrNull(candidate.schedulerRequestId)
  if (
    candidate.schedulerSource !== VIEWPORT_SCHEDULER_RUNTIME_SOURCE
    || !candidateRequestId
    || !Number.isFinite(candidate.schedulerSequence)
  ) {
    return "stale-candidate"
  }

  const expectedRequestId = stringOrNull(input.expectedRequestId)
    || stringOrNull(runtime.pendingRequestId)
    || stringOrNull(runtime.lastCandidateRequestId)

  if (expectedRequestId && expectedRequestId !== candidateRequestId) {
    return "stale-candidate"
  }

  if (Number.isFinite(candidate.schedulerSequence) && candidate.schedulerSequence < runtime.sequence) {
    return "stale-candidate"
  }

  if (!sameRevision(candidate.schedulerDocumentRevision, input.documentRevision)) {
    return "stale-candidate"
  }

  if (!sameRevision(candidate.schedulerRuntimeRevision, input.runtimeRevision)) {
    return "stale-candidate"
  }

  return null
}

function statusForApply(applyRequest, runtimeReason) {
  if (runtimeReason === "stale-candidate") return "stale"
  if (applyRequest.applyReady) return "applied"
  if (applyRequest.applyState === "stable") return "stable"
  return "blocked"
}

export function createViewportSchedulerRuntimeState(input = {}) {
  return {
    appliedCount: nonNegativeInteger(input.appliedCount),
    apply: input.apply || null,
    blockedCount: nonNegativeInteger(input.blockedCount),
    candidate: input.candidate || null,
    documentRevision: numberOrNull(input.documentRevision),
    lastAppliedRequestId: stringOrNull(input.lastAppliedRequestId),
    lastBlockedReason: stringOrNull(input.lastBlockedReason),
    lastCandidateRequestId: stringOrNull(input.lastCandidateRequestId),
    mode: VIEWPORT_SCHEDULER_RUNTIME_MODE,
    pendingRequestId: stringOrNull(input.pendingRequestId),
    readyCount: nonNegativeInteger(input.readyCount),
    runtimeRevision: numberOrNull(input.runtimeRevision),
    sequence: nonNegativeInteger(input.sequence),
    source: VIEWPORT_SCHEDULER_RUNTIME_SOURCE,
    staleDroppedCount: nonNegativeInteger(input.staleDroppedCount),
    status: normalizeStatus(input.status),
    version: VIEWPORT_SCHEDULER_RUNTIME_VERSION,
  }
}

export function planViewportSchedulerRuntimeCandidate(previousRuntime, input = {}) {
  const runtime = createViewportSchedulerRuntimeState(previousRuntime)
  const sequence = runtime.sequence + 1
  const candidate = decorateCandidate(createViewportSchedulerCandidate(input), sequence, input)
  const status = statusForCandidate(candidate)
  const blockedReason = candidate.blockedReason
    || (status === "stable" ? "render-window-stable" : null)

  return {
    ...runtime,
    apply: null,
    candidate,
    documentRevision: numberOrNull(input.documentRevision) ?? runtime.documentRevision,
    lastBlockedReason: status === "blocked" || status === "stable" ? blockedReason : null,
    lastCandidateRequestId: candidate.schedulerRequestId,
    pendingRequestId: candidate.schedulerRequestId,
    readyCount: runtime.readyCount + (status === "ready" ? 1 : 0),
    runtimeRevision: numberOrNull(input.runtimeRevision) ?? runtime.runtimeRevision,
    sequence,
    status,
  }
}

export function applyViewportSchedulerRuntimeCandidate(previousRuntime, input = {}) {
  const runtime = createViewportSchedulerRuntimeState(previousRuntime)
  const candidate = input.candidate || runtime.candidate
  const runtimeReason = runtimeBlockedReason(runtime, candidate, input)
  const applyRequest = runtimeReason
    ? blockedApplyRequest(candidate, runtimeReason, input.trigger)
    : createViewportSchedulerApplyRequest({
      ...input,
      candidate,
    })
  const status = statusForApply(applyRequest, runtimeReason)
  const applied = applyRequest.applyReady
  const blocked = !applied && status === "blocked"

  return {
    ...runtime,
    appliedCount: runtime.appliedCount + (applied ? 1 : 0),
    apply: applyRequest,
    blockedCount: runtime.blockedCount + (blocked ? 1 : 0),
    candidate,
    documentRevision: numberOrNull(input.documentRevision) ?? runtime.documentRevision,
    lastAppliedRequestId: applied
      ? stringOrNull(candidate?.schedulerRequestId) || runtime.lastCandidateRequestId
      : runtime.lastAppliedRequestId,
    lastBlockedReason: applyRequest.blockedReason,
    pendingRequestId: applied ? null : runtime.pendingRequestId,
    runtimeRevision: numberOrNull(input.runtimeRevision) ?? runtime.runtimeRevision,
    staleDroppedCount: runtime.staleDroppedCount + (runtimeReason === "stale-candidate" ? 1 : 0),
    status,
  }
}
