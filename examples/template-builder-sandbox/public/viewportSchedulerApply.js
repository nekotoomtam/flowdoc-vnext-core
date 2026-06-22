export const VIEWPORT_SCHEDULER_APPLY_SOURCE = "flowdoc-viewport-scheduler-apply"
export const VIEWPORT_SCHEDULER_APPLY_MODE = "manual-candidate-apply"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function sameRevision(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return true
  return Number(left) === Number(right)
}

function blockedReason(input = {}) {
  const candidate = input.candidate

  if (!candidate) return "candidate-missing"
  if (candidate.source !== "flowdoc-viewport-scheduler-candidate") return "candidate-source-mismatch"
  if (input.draftActive) return "draft-active"
  if (input.isComposing) return "composition-active"
  if (!sameRevision(input.documentRevision, input.runtimeRevision)) return "revision-mismatch"
  if (candidate.blockedReason) return candidate.blockedReason
  if (!candidate.applyReady) return candidate.applyState === "stable" ? "render-window-stable" : "candidate-not-ready"
  if (!candidate.request) return "request-missing"

  return null
}

function applyState(reason) {
  if (!reason) return "ready"
  if (reason === "render-window-stable") return "stable"
  return "blocked"
}

export function createViewportSchedulerApplyRequest(input = {}) {
  const candidate = input.candidate || null
  const reason = blockedReason(input)
  const trigger = stringOrNull(input.trigger) || "manual"
  const state = applyState(reason)

  return {
    anchorSectionId: candidate?.anchorSectionId || null,
    applyReady: state === "ready",
    applyState: state,
    blockedReason: reason,
    candidateApplyState: candidate?.applyState || "missing",
    candidateSectionIds: candidate?.candidateSectionIds || [],
    mode: VIEWPORT_SCHEDULER_APPLY_MODE,
    request: state === "ready" ? candidate.request : null,
    requestReason: state === "ready" ? candidate.request.reason : null,
    source: VIEWPORT_SCHEDULER_APPLY_SOURCE,
    trigger,
    version: 1,
  }
}
