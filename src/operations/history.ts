import type { DocumentNode } from "../schema/document.js"
import type { NodeId } from "../graph/relationshipGraph.js"
import type { VNextOperationCommand, VNextOperationKind, VNextOperationSource } from "./commands.js"
import { vNextOperationCommandTargetNodeIds } from "./commands.js"
import type {
  VNextOperationCommitMetadata,
  VNextOperationFailureReason,
  VNextOperationHistoryPolicy,
  VNextOperationIssue,
  VNextOperationRenderInvalidation,
  VNextOperationResult,
  VNextOperationScope,
} from "./results.js"

export interface VNextOperationHistoryRecord {
  schemaVersion: 1
  status: "committed" | "rejected"
  operationKind: VNextOperationKind
  source: VNextOperationSource
  command: VNextOperationCommand
  targetNodeIds: NodeId[]
  scope: VNextOperationScope | null
  historyIntent: VNextOperationHistoryPolicy["durableIntent"] | null
  validationPolicy: VNextOperationCommitMetadata["validationPolicy"] | null
  renderInvalidation: VNextOperationRenderInvalidation | null
  failureReason?: VNextOperationFailureReason
  issues: VNextOperationIssue[]
}

export type VNextOperationHistoryReplayResult =
  | {
      ok: true
      document: DocumentNode
      replayedCount: number
      skippedRejectedCount: number
      issues: VNextOperationIssue[]
    }
  | {
      ok: false
      document: DocumentNode
      failedRecord: VNextOperationHistoryRecord
      failedResult: VNextOperationResult
      replayedCount: number
      skippedRejectedCount: number
      issues: VNextOperationIssue[]
    }

export type VNextOperationRunner = (
  document: DocumentNode,
  command: VNextOperationCommand,
) => VNextOperationResult

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createVNextOperationHistoryRecord(result: VNextOperationResult): VNextOperationHistoryRecord {
  if (result.ok) {
    return {
      schemaVersion: 1,
      status: "committed",
      operationKind: result.operation.kind,
      source: result.operation.source,
      command: cloneJson(result.command),
      targetNodeIds: result.operation.targetNodeIds,
      scope: result.operation.scope,
      historyIntent: result.operation.historyPolicy.durableIntent,
      validationPolicy: result.operation.validationPolicy,
      renderInvalidation: result.operation.renderInvalidation,
      issues: result.issues,
    }
  }

  return {
    schemaVersion: 1,
    status: "rejected",
    operationKind: result.command.kind,
    source: result.command.source ?? "user",
    command: cloneJson(result.command),
    targetNodeIds: vNextOperationCommandTargetNodeIds(result.command),
    scope: null,
    historyIntent: null,
    validationPolicy: null,
    renderInvalidation: null,
    failureReason: result.reason,
    issues: result.issues,
  }
}

export function appendVNextOperationHistoryRecord(
  records: readonly VNextOperationHistoryRecord[],
  record: VNextOperationHistoryRecord,
): VNextOperationHistoryRecord[] {
  return [...records.map((item) => cloneJson(item)), cloneJson(record)]
}

export function replayVNextOperationHistoryWithRunner(
  initialDocument: DocumentNode,
  records: readonly VNextOperationHistoryRecord[],
  runOperation: VNextOperationRunner,
): VNextOperationHistoryReplayResult {
  let document = cloneJson(initialDocument)
  let replayedCount = 0
  let skippedRejectedCount = 0

  for (const record of records) {
    if (record.status === "rejected") {
      skippedRejectedCount += 1
      continue
    }

    const result = runOperation(document, record.command)
    if (!result.ok) {
      return {
        ok: false,
        document,
        failedRecord: record,
        failedResult: result,
        replayedCount,
        skippedRejectedCount,
        issues: result.issues,
      }
    }

    document = result.document
    replayedCount += 1
  }

  return {
    ok: true,
    document,
    replayedCount,
    skippedRejectedCount,
    issues: [],
  }
}
