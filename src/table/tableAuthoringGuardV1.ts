import type { DocumentNodeV4Target } from "../schema/documentV4Target.js"
import {
  createVNextTableAuthoringReversibleChangeSetV1,
  type VNextTableAuthoringReversibleChangeSetV1,
} from "./tableAuthoringChangeSetV1.js"
import type {
  VNextTableAuthoringIssueV1,
  VNextTableAuthoringRequestV1,
  VNextTableAuthoringResultV1,
} from "./tableAuthoringContractV1.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import { runVNextTableAuthoringV1 } from "./tableAuthoringV1.js"

export const VNEXT_TABLE_AUTHORING_GUARD_VERSION = 1 as const
export const VNEXT_TABLE_AUTHORING_GUARD_SOURCE = "vnext-table-authoring-guard"

export interface VNextTableAuthoringExecutionBudgetsV1 {
  maximumRowTemplateVisits: number
  maximumAffectedNodeCount: number
  maximumRemovedSubtreeNodeCount: number
}

export interface VNextTableAuthoringImpactPreviewV1 {
  destructive: boolean
  identity: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]["identity"]
  scope: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]["scope"]
  invalidation: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]["invalidation"]
  work: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]["work"]
  uniqueAffectedNodeCount: number
  removedSubtreeNodeCount: number
  fingerprints: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]["fingerprints"]
  fingerprint: string
}

export interface VNextTableAuthoringConfirmationV1 {
  contractVersion: typeof VNEXT_TABLE_AUTHORING_GUARD_VERSION
  kind: "table-authoring-destructive-confirmation"
  artifact: VNextTableAuthoringRequestV1["artifact"]
  command: VNextTableAuthoringRequestV1["command"]
  budgets: VNextTableAuthoringExecutionBudgetsV1
  bundleBeforeFingerprint: string
  proposedBundleFingerprint: string
  impactFingerprint: string
  changeSetFingerprint: string
}

export type VNextTableAuthoringPreviewResultV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_GUARD_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_GUARD_VERSION
      status: "ready"
      impact: VNextTableAuthoringImpactPreviewV1
      changeSetSummary: VNextTableAuthoringReversibleChangeSetV1["summary"]
      changeSetFingerprint: string
      confirmationRequired: boolean
      confirmation: VNextTableAuthoringConfirmationV1 | null
      previewFingerprint: string
      contracts: {
        kernelExecuted: true
        commitApplied: false
        persistence: "not-run"
        editorStateMutation: false
        measurement: "not-run"
        pagination: "not-run"
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_GUARD_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_GUARD_VERSION
      status: "blocked"
      reason: "invalid-budget" | "execution-budget-exceeded" | "kernel-blocked"
      impact: null
      confirmation: null
      issues: VNextTableAuthoringIssueV1[]
    }

export type VNextTableAuthoringGuardedCommitResultV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_GUARD_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_GUARD_VERSION
      status: "committed"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      operation: Extract<VNextTableAuthoringResultV1, { status: "committed" }>["operation"]
      changeSet: VNextTableAuthoringReversibleChangeSetV1
      confirmationConsumed: boolean
      previewFingerprint: string
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_GUARD_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_GUARD_VERSION
      status: "blocked"
      reason:
        | "invalid-budget"
        | "execution-budget-exceeded"
        | "kernel-blocked"
        | "confirmation-required"
        | "stale-confirmation"
        | "unexpected-confirmation"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      operation: null
      changeSet: null
      issues: VNextTableAuthoringIssueV1[]
    }

type GuardPlan =
  | {
      status: "ready"
      result: Extract<VNextTableAuthoringResultV1, { status: "committed" }>
      impact: VNextTableAuthoringImpactPreviewV1
      changeSet: VNextTableAuthoringReversibleChangeSetV1
      confirmation: VNextTableAuthoringConfirmationV1 | null
      previewFingerprint: string
    }
  | {
      status: "blocked"
      reason: "invalid-budget" | "execution-budget-exceeded" | "kernel-blocked"
      issues: VNextTableAuthoringIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string): VNextTableAuthoringIssueV1 {
  return { code, path, message, severity: "error" }
}

function validBudgets(budgets: VNextTableAuthoringExecutionBudgetsV1): boolean {
  return [
    budgets.maximumRowTemplateVisits,
    budgets.maximumAffectedNodeCount,
    budgets.maximumRemovedSubtreeNodeCount,
  ].every((value) => Number.isInteger(value) && value > 0)
}

function expectedRowTemplateVisits(request: VNextTableAuthoringRequestV1): number {
  return request.command.kind.startsWith("table.column.")
    ? Object.keys(request.definition.rowTemplates).length
    : 1
}

function destructive(request: VNextTableAuthoringRequestV1): boolean {
  return request.command.kind === "table.row.delete.static"
    || request.command.kind === "table.column.delete"
}

function affectedNodeCount(result: Extract<VNextTableAuthoringResultV1, { status: "committed" }>): number {
  const operation = result.operation
  return new Set([
    ...operation.scope.tableIds,
    ...operation.scope.rowIds,
    ...operation.scope.cellIds,
    ...operation.scope.textBlockIds,
    ...operation.identity.addedNodeIds,
    ...operation.identity.removedNodeIds,
    ...operation.identity.retainedNodeIds,
  ]).size
}

function plan(input: {
  request: VNextTableAuthoringRequestV1
  budgets: VNextTableAuthoringExecutionBudgetsV1
}): GuardPlan {
  if (!validBudgets(input.budgets)) return {
    status: "blocked", reason: "invalid-budget",
    issues: [issue(
      "invalid-execution-budget", "budgets",
      "Table authoring execution budgets must be positive integers",
    )],
  }
  const expectedTemplates = expectedRowTemplateVisits(input.request)
  if (expectedTemplates > input.budgets.maximumRowTemplateVisits) return {
    status: "blocked", reason: "execution-budget-exceeded",
    issues: [issue(
      "row-template-visit-budget-exceeded", "budgets.maximumRowTemplateVisits",
      `command requires ${expectedTemplates} row-template visits but budget is ${input.budgets.maximumRowTemplateVisits}`,
    )],
  }
  const result = runVNextTableAuthoringV1(input.request)
  if (result.status !== "committed") return {
    status: "blocked", reason: "kernel-blocked", issues: clone(result.issues),
  }
  const uniqueAffectedNodeCount = affectedNodeCount(result)
  const removedSubtreeNodeCount = result.operation.identity.removedNodeIds.length
  const budgetIssues: VNextTableAuthoringIssueV1[] = []
  if (result.operation.work.rowTemplateVisitCount > input.budgets.maximumRowTemplateVisits) budgetIssues.push(issue(
    "row-template-visit-budget-exceeded", "budgets.maximumRowTemplateVisits",
    `planned work ${result.operation.work.rowTemplateVisitCount} exceeds budget ${input.budgets.maximumRowTemplateVisits}`,
  ))
  if (uniqueAffectedNodeCount > input.budgets.maximumAffectedNodeCount) budgetIssues.push(issue(
    "affected-node-budget-exceeded", "budgets.maximumAffectedNodeCount",
    `planned impact ${uniqueAffectedNodeCount} nodes exceeds budget ${input.budgets.maximumAffectedNodeCount}`,
  ))
  if (removedSubtreeNodeCount > input.budgets.maximumRemovedSubtreeNodeCount) budgetIssues.push(issue(
    "removed-subtree-budget-exceeded", "budgets.maximumRemovedSubtreeNodeCount",
    `planned removal ${removedSubtreeNodeCount} nodes exceeds budget ${input.budgets.maximumRemovedSubtreeNodeCount}`,
  ))
  if (budgetIssues.length > 0) return {
    status: "blocked", reason: "execution-budget-exceeded", issues: budgetIssues,
  }
  const changeSet = createVNextTableAuthoringReversibleChangeSetV1({ request: input.request, result })
  const impactFacts = {
    destructive: destructive(input.request),
    identity: clone(result.operation.identity),
    scope: clone(result.operation.scope),
    invalidation: clone(result.operation.invalidation),
    work: clone(result.operation.work),
    uniqueAffectedNodeCount,
    removedSubtreeNodeCount,
    fingerprints: clone(result.operation.fingerprints),
  }
  const impact: VNextTableAuthoringImpactPreviewV1 = {
    ...impactFacts,
    fingerprint: JSON.stringify(impactFacts),
  }
  const confirmation: VNextTableAuthoringConfirmationV1 | null = impact.destructive ? {
    contractVersion: VNEXT_TABLE_AUTHORING_GUARD_VERSION,
    kind: "table-authoring-destructive-confirmation",
    artifact: clone(input.request.artifact),
    command: clone(input.request.command),
    budgets: clone(input.budgets),
    bundleBeforeFingerprint: result.operation.fingerprints.bundleBefore,
    proposedBundleFingerprint: result.operation.fingerprints.bundleAfter,
    impactFingerprint: impact.fingerprint,
    changeSetFingerprint: changeSet.fingerprint,
  } : null
  const previewFacts = {
    impact, changeSetSummary: changeSet.summary, changeSetFingerprint: changeSet.fingerprint,
    confirmationRequired: confirmation != null, confirmation,
  }
  return {
    status: "ready", result, impact, changeSet, confirmation,
    previewFingerprint: JSON.stringify(previewFacts),
  }
}

export function previewVNextTableAuthoringV1(input: {
  request: VNextTableAuthoringRequestV1
  budgets: VNextTableAuthoringExecutionBudgetsV1
}): VNextTableAuthoringPreviewResultV1 {
  const planned = plan(input)
  if (planned.status === "blocked") return {
    source: VNEXT_TABLE_AUTHORING_GUARD_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_GUARD_VERSION,
    status: "blocked", reason: planned.reason, impact: null, confirmation: null,
    issues: planned.issues,
  }
  return {
    source: VNEXT_TABLE_AUTHORING_GUARD_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_GUARD_VERSION,
    status: "ready",
    impact: clone(planned.impact),
    changeSetSummary: clone(planned.changeSet.summary),
    changeSetFingerprint: planned.changeSet.fingerprint,
    confirmationRequired: planned.confirmation != null,
    confirmation: clone(planned.confirmation),
    previewFingerprint: planned.previewFingerprint,
    contracts: {
      kernelExecuted: true, commitApplied: false, persistence: "not-run",
      editorStateMutation: false, measurement: "not-run", pagination: "not-run",
    },
    issues: [],
  }
}

function commitBlocked(
  input: { request: VNextTableAuthoringRequestV1 },
  reason: Extract<VNextTableAuthoringGuardedCommitResultV1, { status: "blocked" }>["reason"],
  issues: VNextTableAuthoringIssueV1[],
): VNextTableAuthoringGuardedCommitResultV1 {
  return {
    source: VNEXT_TABLE_AUTHORING_GUARD_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_GUARD_VERSION,
    status: "blocked", reason,
    document: clone(input.request.document), definition: clone(input.request.definition),
    operation: null, changeSet: null, issues,
  }
}

export function commitGuardedVNextTableAuthoringV1(input: {
  request: VNextTableAuthoringRequestV1
  budgets: VNextTableAuthoringExecutionBudgetsV1
  confirmation?: VNextTableAuthoringConfirmationV1
}): VNextTableAuthoringGuardedCommitResultV1 {
  const planned = plan(input)
  if (planned.status === "blocked") return commitBlocked(input, planned.reason, planned.issues)
  if (planned.confirmation != null && input.confirmation == null) return commitBlocked(
    input, "confirmation-required", [issue(
      "destructive-confirmation-required", "confirmation",
      "destructive Table authoring commit requires the exact preview confirmation packet",
    )],
  )
  if (planned.confirmation == null && input.confirmation != null) return commitBlocked(
    input, "unexpected-confirmation", [issue(
      "unexpected-destructive-confirmation", "confirmation",
      "non-destructive Table authoring commit does not accept a destructive confirmation packet",
    )],
  )
  if (planned.confirmation != null && JSON.stringify(planned.confirmation) !== JSON.stringify(input.confirmation)) {
    return commitBlocked(input, "stale-confirmation", [issue(
      "stale-destructive-confirmation", "confirmation",
      "confirmation packet no longer matches the exact current preview",
    )])
  }
  return {
    source: VNEXT_TABLE_AUTHORING_GUARD_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_GUARD_VERSION,
    status: "committed",
    document: clone(planned.result.document), definition: clone(planned.result.definition),
    operation: clone(planned.result.operation), changeSet: clone(planned.changeSet),
    confirmationConsumed: planned.confirmation != null,
    previewFingerprint: planned.previewFingerprint,
    issues: [],
  }
}
