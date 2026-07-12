import type { DocumentNodeV4Target } from "../schema/documentV4Target.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import { assessVNextTableAuthoringBundleV1 } from "./tableAuthoringBundleV1.js"
import {
  VNEXT_TABLE_AUTHORING_VERSION,
  type VNextTableAuthoringBundleV1,
  type VNextTableAuthoringCommandV1,
  type VNextTableAuthoringCommitV1,
  type VNextTableAuthoringIssueV1,
  type VNextTableAuthoringRequestV1,
  type VNextTableAuthoringResultV1,
} from "./tableAuthoringContractV1.js"
import { runVNextTableAuthoringV1 } from "./tableAuthoringV1.js"

export const VNEXT_TABLE_AUTHORING_HISTORY_VERSION = 1 as const
export const VNEXT_TABLE_AUTHORING_HISTORY_SOURCE = "vnext-table-authoring-history"

export interface VNextTableAuthoringHistoryRecordV1 {
  schemaVersion: typeof VNEXT_TABLE_AUTHORING_HISTORY_VERSION
  status: "committed" | "rejected"
  artifact: VNextTableAuthoringRequestV1["artifact"]
  command: VNextTableAuthoringCommandV1
  operation: VNextTableAuthoringCommitV1 | null
  failureReason?: Extract<VNextTableAuthoringResultV1, { status: "blocked" }>["reason"]
  issues: VNextTableAuthoringIssueV1[]
}

export type VNextTableAuthoringHistoryReplayResultV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_HISTORY_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_HISTORY_VERSION
      status: "replayed"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      replayedCount: number
      skippedRejectedCount: number
      fingerprint: string
      contracts: { persistence: "not-run"; editorStateMutation: false }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_HISTORY_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_HISTORY_VERSION
      status: "blocked"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      replayedCount: number
      skippedRejectedCount: number
      failedRecordIndex: number
      failedResult: VNextTableAuthoringResultV1 | null
      issues: VNextTableAuthoringIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameArtifact(
  left: VNextTableAuthoringRequestV1["artifact"],
  right: VNextTableAuthoringRequestV1["artifact"],
): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function issue(code: string, path: string, message: string): VNextTableAuthoringIssueV1 {
  return { code, path, message, severity: "error" }
}

export function createVNextTableAuthoringHistoryRecordV1(
  request: VNextTableAuthoringRequestV1,
  result: VNextTableAuthoringResultV1,
): VNextTableAuthoringHistoryRecordV1 {
  return result.status === "committed"
    ? {
        schemaVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
        status: "committed",
        artifact: clone(request.artifact),
        command: clone(request.command),
        operation: clone(result.operation),
        issues: [],
      }
    : {
        schemaVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
        status: "rejected",
        artifact: clone(request.artifact),
        command: clone(request.command),
        operation: null,
        failureReason: result.reason,
        issues: clone(result.issues),
      }
}

export function replayVNextTableAuthoringHistoryV1(input: {
  bundle: VNextTableAuthoringBundleV1
  records: readonly VNextTableAuthoringHistoryRecordV1[]
}): VNextTableAuthoringHistoryReplayResultV1 {
  let document = clone(input.bundle.document)
  let definition = clone(input.bundle.definition)
  let replayedCount = 0
  let skippedRejectedCount = 0
  for (let index = 0; index < input.records.length; index += 1) {
    const record = input.records[index]
    if (record.status === "rejected") {
      skippedRejectedCount += 1
      continue
    }
    if (!sameArtifact(record.artifact, input.bundle.artifact) || record.operation == null) return {
      source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
      contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
      status: "blocked", document, definition, replayedCount, skippedRejectedCount,
      failedRecordIndex: index, failedResult: null,
      issues: [issue(
        "history-artifact-mismatch", `records[${index}].artifact`,
        "history record must belong to the exact replay Structure Draft revision",
      )],
    }
    const currentAssessment = assessVNextTableAuthoringBundleV1({
      ...input.bundle, document, definition,
    })
    if (currentAssessment.status !== "ready") return {
      source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
      contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
      status: "blocked", document, definition, replayedCount, skippedRejectedCount,
      failedRecordIndex: index, failedResult: null, issues: currentAssessment.issues,
    }
    if (record.operation.fingerprints.bundleBefore !== currentAssessment.bundle.fingerprint) return {
      source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
      contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
      status: "blocked", document, definition, replayedCount, skippedRejectedCount,
      failedRecordIndex: index, failedResult: null,
      issues: [issue(
        "history-before-fingerprint-mismatch", `records[${index}].operation.fingerprints.bundleBefore`,
        "history record before fingerprint does not match current replay bundle",
      )],
    }
    const request: VNextTableAuthoringRequestV1 = {
      contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
      kind: "table-authoring-request",
      artifact: clone(input.bundle.artifact),
      document,
      definition,
      policySet: clone(input.bundle.policySet),
      sessionAllowedActions: clone(input.bundle.sessionAllowedActions),
      command: clone(record.command),
    }
    const result = runVNextTableAuthoringV1(request)
    if (result.status !== "committed") return {
      source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
      contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
      status: "blocked", document, definition, replayedCount, skippedRejectedCount,
      failedRecordIndex: index, failedResult: result, issues: result.issues,
    }
    if (result.operation.fingerprints.bundleAfter !== record.operation.fingerprints.bundleAfter) return {
      source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
      contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
      status: "blocked", document, definition, replayedCount, skippedRejectedCount,
      failedRecordIndex: index, failedResult: result,
      issues: [issue(
        "history-after-fingerprint-mismatch", `records[${index}].operation.fingerprints.bundleAfter`,
        "replayed command output does not match retained history fingerprint",
      )],
    }
    document = clone(result.document)
    definition = clone(result.definition)
    replayedCount += 1
  }
  return {
    source: VNEXT_TABLE_AUTHORING_HISTORY_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_HISTORY_VERSION,
    status: "replayed", document, definition, replayedCount, skippedRejectedCount,
    fingerprint: JSON.stringify([input.bundle.artifact, document, definition, replayedCount, skippedRejectedCount]),
    contracts: { persistence: "not-run", editorStateMutation: false },
    issues: [],
  }
}
