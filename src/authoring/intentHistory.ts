import type { NodeId } from "../graph/relationshipGraph.js"
import type { InlineNode } from "../schema/document.js"
import type { VNextEditableSelection } from "./editableSession.js"
import type {
  VNextTextTransactionCommand,
  VNextTextTransactionDirtyScope,
  VNextTextTransactionFailureReason,
  VNextTextTransactionIssue,
  VNextTextTransactionResult,
  VNextTextTransactionSource,
} from "./textTransactions.js"

export type VNextAuthoringIntentInputKind =
  | "typing"
  | "paste"
  | "ime"
  | "command"

export type VNextAuthoringIntentStatus =
  | "committed"
  | "rejected"
  | "non-durable"

export type VNextAuthoringHistoryAction =
  | "undoable"
  | "diagnostic-only"
  | "non-durable"

export type VNextAuthoringIntentCommandKind =
  | VNextTextTransactionCommand["kind"]
  | "text-block.rich-inline.replace"
  | "selection.change"

export type VNextAuthoringIntentCommand =
  | VNextTextTransactionCommand
  | {
      kind: "text-block.rich-inline.replace"
      source?: VNextTextTransactionSource
      textBlockId: NodeId
      children: readonly InlineNode[]
    }

export type VNextAuthoringCoalescingPolicy =
  | { kind: "typing-session"; mergeKey: string }
  | { kind: "single-entry"; mergeKey: string | null }
  | { kind: "none"; mergeKey: null }

export interface VNextAuthoringIntentHistoryRecord {
  schemaVersion: 1
  status: VNextAuthoringIntentStatus
  historyAction: VNextAuthoringHistoryAction
  groupId: string | null
  sequence: number | null
  source: VNextTextTransactionSource
  inputKind: VNextAuthoringIntentInputKind
  commandKind: VNextAuthoringIntentCommandKind
  command: VNextAuthoringIntentCommand | null
  targetTextBlockId: NodeId | null
  dirtyScopes: VNextTextTransactionDirtyScope[]
  mergeKey: string | null
  coalescing: VNextAuthoringCoalescingPolicy
  summary: string
  failureReason?: VNextTextTransactionFailureReason
  issues: VNextTextTransactionIssue[]
  selection?: {
    before: VNextEditableSelection | null
    after: VNextEditableSelection
  }
}

export interface VNextAuthoringIntentHistoryOptions {
  groupId?: string
  inputKind?: VNextAuthoringIntentInputKind
}

export interface VNextAuthoringSelectionHistoryInput {
  source?: VNextTextTransactionSource
  before?: VNextEditableSelection
  after: VNextEditableSelection
}

export interface VNextAuthoringIntentHistoryGroup {
  groupId: string
  status: "committed" | "rejected"
  historyAction: "undoable" | "diagnostic-only"
  inputKind: VNextAuthoringIntentInputKind
  commandKinds: VNextAuthoringIntentCommandKind[]
  targetTextBlockIds: NodeId[]
  recordCount: number
  summary: string
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function commandTextBlockId(command: VNextTextTransactionCommand): NodeId {
  if (command.kind === "text.insert" || command.kind === "inline.field-ref.insert") {
    return command.position.textBlockId
  }

  return command.range.textBlockId
}

function defaultInputKind(command: VNextTextTransactionCommand): VNextAuthoringIntentInputKind {
  return command.kind === "text.insert" ? "typing" : "command"
}

function coalescingForCommitted(
  result: Extract<VNextTextTransactionResult, { ok: true }>,
  inputKind: VNextAuthoringIntentInputKind,
): VNextAuthoringCoalescingPolicy {
  const mergeKey = result.transaction.historyIntent.mergeKey

  if (result.transaction.historyIntent.coalesce === "typing-session" && inputKind === "typing") {
    return { kind: "typing-session", mergeKey }
  }

  return { kind: "single-entry", mergeKey }
}

function summaryForCommitted(
  result: Extract<VNextTextTransactionResult, { ok: true }>,
  inputKind: VNextAuthoringIntentInputKind,
): string {
  if (inputKind === "paste") return `paste text into ${result.transaction.targetTextBlockId}`
  if (inputKind === "ime") return `commit IME text into ${result.transaction.targetTextBlockId}`
  return result.transaction.historyIntent.summary
}

export function createVNextAuthoringIntentHistoryRecord(
  result: VNextTextTransactionResult,
  options: VNextAuthoringIntentHistoryOptions = {},
): VNextAuthoringIntentHistoryRecord {
  const inputKind = options.inputKind ?? defaultInputKind(result.command)

  if (result.ok) {
    const coalescing = coalescingForCommitted(result, inputKind)

    return {
      schemaVersion: 1,
      status: "committed",
      historyAction: "undoable",
      groupId: options.groupId ?? null,
      sequence: null,
      source: result.transaction.source,
      inputKind,
      commandKind: result.command.kind,
      command: cloneJson(result.command),
      targetTextBlockId: result.transaction.targetTextBlockId,
      dirtyScopes: [cloneJson(result.transaction.dirtyScope)],
      mergeKey: result.transaction.historyIntent.mergeKey,
      coalescing,
      summary: summaryForCommitted(result, inputKind),
      issues: [],
    }
  }

  return {
    schemaVersion: 1,
    status: "rejected",
    historyAction: "diagnostic-only",
    groupId: options.groupId ?? null,
    sequence: null,
    source: result.command.source ?? "user",
    inputKind,
    commandKind: result.command.kind,
    command: cloneJson(result.command),
    targetTextBlockId: commandTextBlockId(result.command),
    dirtyScopes: [],
    mergeKey: null,
    coalescing: { kind: "none", mergeKey: null },
    summary: `rejected ${result.command.kind}`,
    failureReason: result.reason,
    issues: cloneJson(result.issues),
  }
}

export function createVNextSelectionOnlyAuthoringHistoryRecord(
  input: VNextAuthoringSelectionHistoryInput,
): VNextAuthoringIntentHistoryRecord {
  return {
    schemaVersion: 1,
    status: "non-durable",
    historyAction: "non-durable",
    groupId: null,
    sequence: null,
    source: input.source ?? "user",
    inputKind: "command",
    commandKind: "selection.change",
    command: null,
    targetTextBlockId: input.after.kind === "text" ? input.after.textBlockId : null,
    dirtyScopes: [],
    mergeKey: null,
    coalescing: { kind: "none", mergeKey: null },
    summary: "selection change",
    issues: [],
    selection: {
      before: input.before == null ? null : cloneJson(input.before),
      after: cloneJson(input.after),
    },
  }
}

function canCoalesce(
  previous: VNextAuthoringIntentHistoryRecord,
  next: VNextAuthoringIntentHistoryRecord,
): boolean {
  return (
    previous.status === "committed"
    && next.status === "committed"
    && previous.historyAction === "undoable"
    && next.historyAction === "undoable"
    && previous.coalescing.kind === "typing-session"
    && next.coalescing.kind === "typing-session"
    && previous.mergeKey === next.mergeKey
    && previous.source === next.source
    && previous.inputKind === next.inputKind
  )
}

function nextGroupId(records: readonly VNextAuthoringIntentHistoryRecord[]): string {
  return `authoring-group-${records.length + 1}`
}

export function appendVNextAuthoringIntentHistoryRecord(
  records: readonly VNextAuthoringIntentHistoryRecord[],
  record: VNextAuthoringIntentHistoryRecord,
): VNextAuthoringIntentHistoryRecord[] {
  if (record.status === "non-durable") {
    return records.map((item) => cloneJson(item))
  }

  const nextRecords = records.map((item) => cloneJson(item))
  const previous = nextRecords.at(-1)
  const nextRecord = cloneJson(record)
  nextRecord.sequence = nextRecords.length + 1

  if (previous != null && canCoalesce(previous, nextRecord)) {
    nextRecord.groupId = previous.groupId ?? nextGroupId(nextRecords)
  } else {
    nextRecord.groupId = nextRecord.groupId ?? nextGroupId(nextRecords)
  }

  nextRecords.push(nextRecord)
  return nextRecords
}

export function appendVNextAuthoringIntentHistoryResult(
  records: readonly VNextAuthoringIntentHistoryRecord[],
  result: VNextTextTransactionResult,
  options: VNextAuthoringIntentHistoryOptions = {},
): VNextAuthoringIntentHistoryRecord[] {
  return appendVNextAuthoringIntentHistoryRecord(
    records,
    createVNextAuthoringIntentHistoryRecord(result, options),
  )
}

export function groupVNextAuthoringIntentHistory(
  records: readonly VNextAuthoringIntentHistoryRecord[],
): VNextAuthoringIntentHistoryGroup[] {
  const groups = new Map<string, VNextAuthoringIntentHistoryGroup>()

  records.forEach((record) => {
    if (record.groupId == null || record.status === "non-durable") return

    const existing = groups.get(record.groupId)
    if (existing == null) {
      groups.set(record.groupId, {
        groupId: record.groupId,
        status: record.status,
        historyAction: record.historyAction === "undoable" ? "undoable" : "diagnostic-only",
        inputKind: record.inputKind,
        commandKinds: [record.commandKind],
        targetTextBlockIds: record.targetTextBlockId == null ? [] : [record.targetTextBlockId],
        recordCount: 1,
        summary: record.summary,
      })
      return
    }

    existing.recordCount += 1
    if (!existing.commandKinds.includes(record.commandKind)) {
      existing.commandKinds.push(record.commandKind)
    }
    if (record.targetTextBlockId != null && !existing.targetTextBlockIds.includes(record.targetTextBlockId)) {
      existing.targetTextBlockIds.push(record.targetTextBlockId)
    }
  })

  return [...groups.values()]
}
