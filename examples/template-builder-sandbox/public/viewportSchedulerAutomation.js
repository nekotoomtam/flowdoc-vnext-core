import {
  applyViewportSchedulerRuntimeCandidate,
  createViewportSchedulerRuntimeState,
  planViewportSchedulerRuntimeCandidate,
} from "./viewportSchedulerRuntime.js"

export const VIEWPORT_SCHEDULER_AUTOMATION_SOURCE = "flowdoc-viewport-scheduler-automation"
export const VIEWPORT_SCHEDULER_AUTOMATION_MODE = "budgeted-runtime-auto-apply"
export const DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES = 80

const AUTOMATION_STATUSES = new Set(["idle", "skipped", "planned", "applied", "blocked", "stable", "stale"])

function nonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.trunc(Number(value)))
}

function optionalPositiveInteger(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(Number(value)))
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeStatus(status) {
  return AUTOMATION_STATUSES.has(status) ? status : "idle"
}

function budgetSource(inputBudget = {}, fallbackBudget = {}) {
  if (Number.isFinite(inputBudget.maxNodes)) return "input"
  if (Number.isFinite(fallbackBudget?.maxNodes)) return "fallback"
  return "default"
}

function schedulerBudget(inputBudget = {}, fallbackBudget = {}) {
  const maxNodes = optionalPositiveInteger(
    inputBudget.maxNodes,
    optionalPositiveInteger(fallbackBudget?.maxNodes, DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES),
  )
  const mode = typeof inputBudget.mode === "string" && inputBudget.mode.length > 0
    ? inputBudget.mode
    : fallbackBudget?.mode || "viewport"

  return {
    maxNodes,
    mode,
    source: budgetSource(inputBudget, fallbackBudget),
  }
}

function automationStatusForRuntime(runtime) {
  if (runtime.status === "applied") return "applied"
  if (runtime.status === "stable") return "stable"
  if (runtime.status === "stale") return "stale"
  if (runtime.status === "blocked") return "blocked"
  return "planned"
}

function skippedAutomationResult(automation, runtime, reason, trigger) {
  return {
    ...automation,
    apply: null,
    budget: automation.budget || null,
    lastBlockedReason: null,
    lastRequestReason: null,
    lastSchedulerRequestId: null,
    lastSkippedReason: reason,
    lastTrigger: trigger,
    request: null,
    runtime,
    skippedCount: automation.skippedCount + 1,
    status: "skipped",
  }
}

export function createViewportSchedulerAutomationState(input = {}) {
  return {
    appliedCount: nonNegativeInteger(input.appliedCount),
    apply: input.apply || null,
    attemptedCount: nonNegativeInteger(input.attemptedCount),
    blockedCount: nonNegativeInteger(input.blockedCount),
    budget: input.budget || null,
    lastAppliedRequestId: stringOrNull(input.lastAppliedRequestId),
    lastBlockedReason: stringOrNull(input.lastBlockedReason),
    lastRequestReason: stringOrNull(input.lastRequestReason),
    lastSchedulerRequestId: stringOrNull(input.lastSchedulerRequestId),
    lastSkippedReason: stringOrNull(input.lastSkippedReason),
    lastTrigger: stringOrNull(input.lastTrigger),
    mode: VIEWPORT_SCHEDULER_AUTOMATION_MODE,
    request: input.request || null,
    skippedCount: nonNegativeInteger(input.skippedCount),
    source: VIEWPORT_SCHEDULER_AUTOMATION_SOURCE,
    status: normalizeStatus(input.status),
    version: 1,
  }
}

export function runViewportSchedulerAutomation(previousAutomation, previousRuntime, input = {}) {
  const automation = createViewportSchedulerAutomationState(previousAutomation)
  const runtime = createViewportSchedulerRuntimeState(previousRuntime)
  const trigger = stringOrNull(input.trigger) || "auto"

  if (input.enabled === false || input.autoApplyEnabled === false) {
    return skippedAutomationResult(automation, runtime, "automation-disabled", trigger)
  }

  const budget = schedulerBudget(input.budget, input.previousRequest?.budget)
  const plannedRuntime = planViewportSchedulerRuntimeCandidate(runtime, {
    ...input,
    budget,
    observeOnly: false,
  })
  const appliedRuntime = applyViewportSchedulerRuntimeCandidate(plannedRuntime, {
    ...input,
    budget,
    trigger,
  })
  const apply = appliedRuntime.apply
  const status = automationStatusForRuntime(appliedRuntime)
  const applied = apply?.applyReady === true
  const blocked = status === "blocked" || status === "stale"

  return {
    ...automation,
    appliedCount: automation.appliedCount + (applied ? 1 : 0),
    apply,
    attemptedCount: automation.attemptedCount + 1,
    blockedCount: automation.blockedCount + (blocked ? 1 : 0),
    budget,
    lastAppliedRequestId: applied
      ? stringOrNull(appliedRuntime.candidate?.schedulerRequestId) || automation.lastAppliedRequestId
      : automation.lastAppliedRequestId,
    lastBlockedReason: applied ? null : stringOrNull(apply?.blockedReason),
    lastRequestReason: apply?.requestReason || appliedRuntime.candidate?.requestReason || null,
    lastSchedulerRequestId: stringOrNull(appliedRuntime.candidate?.schedulerRequestId),
    lastSkippedReason: null,
    lastTrigger: trigger,
    request: applied ? apply.request : null,
    runtime: appliedRuntime,
    status,
  }
}
