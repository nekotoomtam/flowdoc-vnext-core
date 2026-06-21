import {
  appendVNextAuthoringIntentHistoryResult,
  createVNextEditableSession,
  groupVNextAuthoringIntentHistory,
  projectVNextTextBlockInlines,
  runVNextTextTransaction,
  serializeFlowDocPackageV2DocumentVNext,
  type FlowDocPackageV2DocumentVNext,
  type TextBlockNode,
  type VNextAuthoringIntentHistoryRecord,
  type VNextTextTransactionDirtyScope,
  type VNextTextTransactionResult,
} from "@flowdoc/vnext-core"
import {
  createTemplateBuilderSnapshot,
  type TemplateBuilderAuthoringHistorySnapshot,
  type TemplateBuilderSnapshot,
  type TemplateBuilderSnapshotLastMutation,
  type TemplateBuilderSnapshotNode,
  type TemplateBuilderSnapshotOptions,
} from "./coreBoundary.js"

export interface TemplateBuilderReplaceTextRequest {
  textBlockId: string
  text: string
}

export interface TemplateBuilderInsertTextAtEndRequest {
  textBlockId: string
  text: string
}

export interface TemplateBuilderMutationIssue {
  severity: "error" | "warning"
  code: string
  message: string
  path?: string
}

export interface TemplateBuilderChangePacket {
  source: "flowdoc-template-builder-change-packet"
  packetVersion: 1
  action: string
  status: TemplateBuilderSnapshotLastMutation["status"]
  baseRevision: number
  nextRevision: number
  mutationCount: number
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
  changedNodeIds: string[]
  changedNodes: TemplateBuilderSnapshotNode[]
  affectedParentNodeIds: string[]
  dirtyScopes: VNextTextTransactionDirtyScope[]
  diagnostics: TemplateBuilderSnapshot["diagnostics"]
  authoringHistory: TemplateBuilderAuthoringHistorySnapshot
  snapshotRequired: boolean
}

export interface TemplateBuilderMutationResponseOptions {
  includeSnapshot?: boolean
}

export interface TemplateBuilderMutationResponse {
  ok: boolean
  snapshot?: TemplateBuilderSnapshot
  packet: TemplateBuilderChangePacket
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
}

export interface TemplateBuilderMutationBridge {
  snapshot(): TemplateBuilderSnapshot
  insertTextAtEnd(
    request: TemplateBuilderInsertTextAtEndRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse
  replaceText(
    request: TemplateBuilderReplaceTextRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse
}

function issue(code: string, message: string, path = ""): TemplateBuilderMutationIssue {
  return { severity: "error", code, message, path }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function bridgeMutation(
  action: string,
  status: TemplateBuilderSnapshotLastMutation["status"],
  targetTextBlockId: string | null,
  summary: string,
  issueCount: number,
): TemplateBuilderSnapshotLastMutation {
  return {
    action,
    status,
    targetTextBlockId,
    summary,
    issueCount,
  }
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > 240) return trimmed.slice(0, 240)
  return trimmed
}

function normalizeInsertText(value: unknown): string | null {
  if (typeof value !== "string") return null
  if (value.length === 0 || value.trim().length === 0) return null
  if (/[\r\n]/.test(value)) return null
  if (value.length > 120) return value.slice(0, 120)
  return value
}

function textBlockFromPackage(pack: FlowDocPackageV2DocumentVNext, textBlockId: string): TextBlockNode | null {
  const session = createVNextEditableSession(pack, { source: "canonical-vnext-package" })
  const node = session.graph.nodesById.get(textBlockId)
  return node?.type === "text-block" ? node : null
}

function flattenSnapshotNodes(nodes: readonly TemplateBuilderSnapshotNode[], output: TemplateBuilderSnapshotNode[] = []) {
  for (const node of nodes) {
    output.push(node)
    flattenSnapshotNodes(node.children, output)
  }
  return output
}

function allSnapshotNodes(snapshot: TemplateBuilderSnapshot): TemplateBuilderSnapshotNode[] {
  return snapshot.sections.flatMap((section) => flattenSnapshotNodes(section.zones))
}

function uniqueIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids.filter((id) => id.length > 0)))
}

function createChangePacket(input: {
  snapshot: TemplateBuilderSnapshot
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
  baseRevision: number
  nextRevision: number
  changedNodeIds: readonly string[]
  dirtyScopes: readonly VNextTextTransactionDirtyScope[]
}): TemplateBuilderChangePacket {
  const changedNodeIds = uniqueIds(input.changedNodeIds)
  const changedNodeIdSet = new Set(changedNodeIds)
  const dirtyScopes = input.dirtyScopes.map((scope) => cloneJson(scope))
  const affectedParentNodeIds = uniqueIds(dirtyScopes.flatMap((scope) => [...scope.parentNodeIds]))

  return {
    source: "flowdoc-template-builder-change-packet",
    packetVersion: 1,
    action: input.mutation.action,
    status: input.mutation.status,
    baseRevision: input.baseRevision,
    nextRevision: input.nextRevision,
    mutationCount: input.snapshot.mutationBridge.mutationCount,
    mutation: cloneJson(input.mutation),
    issues: input.issues.map((item) => cloneJson(item)),
    changedNodeIds,
    changedNodes: allSnapshotNodes(input.snapshot)
      .filter((node) => changedNodeIdSet.has(node.id))
      .map((node) => cloneJson(node)),
    affectedParentNodeIds,
    dirtyScopes,
    diagnostics: cloneJson(input.snapshot.diagnostics),
    authoringHistory: cloneJson(input.snapshot.authoringHistory),
    snapshotRequired: false,
  }
}

function summarizeAuthoringHistory(
  records: readonly VNextAuthoringIntentHistoryRecord[],
  mode: TemplateBuilderAuthoringHistorySnapshot["mode"],
): TemplateBuilderAuthoringHistorySnapshot {
  const groups = groupVNextAuthoringIntentHistory(records)

  return {
    mode,
    recordCount: records.length,
    undoableRecordCount: records.filter((record) => record.historyAction === "undoable").length,
    rejectedRecordCount: records.filter((record) => record.status === "rejected").length,
    groupCount: groups.length,
    latestGroup: groups.at(-1) ?? null,
  }
}

function mutationResponse(input: {
  ok: boolean
  snapshot: TemplateBuilderSnapshot
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
  baseRevision: number
  nextRevision: number
  changedNodeIds: readonly string[]
  dirtyScopes: readonly VNextTextTransactionDirtyScope[]
  responseOptions?: TemplateBuilderMutationResponseOptions
}): TemplateBuilderMutationResponse {
  const response: TemplateBuilderMutationResponse = {
    ok: input.ok,
    packet: createChangePacket(input),
    mutation: input.mutation,
    issues: input.issues,
  }

  if (input.responseOptions?.includeSnapshot !== false) {
    response.snapshot = input.snapshot
  }

  return response
}

export function createTemplateBuilderMutationBridge(
  value: unknown,
  options: TemplateBuilderSnapshotOptions,
): TemplateBuilderMutationBridge {
  let workingPackage = createVNextEditableSession(value, { source: "fixture" }).package
  let documentRevision = options.runtime?.documentRevision ?? 0
  let mutationCount = options.runtime?.mutationCount ?? 0
  let dirtyScopeCount = options.runtime?.dirtyScopeCount ?? 0
  let lastMutation: TemplateBuilderSnapshotLastMutation | null = options.runtime?.lastMutation ?? null
  let authoringHistory: VNextAuthoringIntentHistoryRecord[] = []

  function bridgeSnapshot(): TemplateBuilderSnapshot {
    return createTemplateBuilderSnapshot(workingPackage, {
      ...options,
      runtime: {
        mode: "in-memory-bridge",
        documentRevision,
        dirtyScopeCount,
        authoringHistory: summarizeAuthoringHistory(authoringHistory, "in-memory"),
        mutationCount,
        lastMutation,
      },
    })
  }

  function appendHistory(result: VNextTextTransactionResult): void {
    authoringHistory = appendVNextAuthoringIntentHistoryResult(authoringHistory, result, {
      inputKind: "command",
    })
  }

  function rejected(
    action: string,
    textBlockId: string | null,
    summary: string,
    issues: TemplateBuilderMutationIssue[],
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse {
    const baseRevision = documentRevision
    lastMutation = bridgeMutation(action, "rejected", textBlockId, summary, issues.length)
    const snapshot = bridgeSnapshot()

    return mutationResponse({
      ok: false,
      snapshot,
      mutation: lastMutation,
      issues,
      baseRevision,
      nextRevision: documentRevision,
      changedNodeIds: [],
      dirtyScopes: [],
      responseOptions,
    })
  }

  function applyCommittedTransaction(input: {
    action: string
    targetTextBlockId: string
    baseRevision: number
    document: FlowDocPackageV2DocumentVNext["document"]
    dirtyScope: VNextTextTransactionDirtyScope
    transactionResult: Extract<VNextTextTransactionResult, { ok: true }>
    summary: string
    responseOptions?: TemplateBuilderMutationResponseOptions
  }): TemplateBuilderMutationResponse {
    workingPackage = serializeFlowDocPackageV2DocumentVNext({
      ...workingPackage,
      document: input.document,
      meta: {
        ...workingPackage.meta,
        updatedAt: "sandbox-memory",
      },
    })
    documentRevision += 1
    mutationCount += 1
    dirtyScopeCount = 1
    appendHistory(input.transactionResult)
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      input.targetTextBlockId,
      input.summary,
      0,
    )

    return mutationResponse({
      ok: true,
      snapshot: bridgeSnapshot(),
      mutation: lastMutation,
      issues: [],
      baseRevision: input.baseRevision,
      nextRevision: documentRevision,
      changedNodeIds: [input.targetTextBlockId],
      dirtyScopes: [input.dirtyScope],
      responseOptions: input.responseOptions,
    })
  }

  return {
    snapshot: bridgeSnapshot,
    insertTextAtEnd(request, responseOptions) {
      const action = "sandbox.insertPlainTextAtEnd"
      const text = normalizeInsertText(request.text)
      if (text == null) {
        return rejected(action, request.textBlockId ?? null, "insert text was rejected", [
          issue("invalid-text", "insert text must be a non-empty single-line string up to 120 characters", "text"),
        ], responseOptions)
      }

      const textBlock = textBlockFromPackage(workingPackage, request.textBlockId)
      if (textBlock == null) {
        return rejected(action, request.textBlockId, "target was rejected", [
          issue("target-not-text-block", `target "${request.textBlockId}" is not a text-block`, "textBlockId"),
        ], responseOptions)
      }

      const projection = projectVNextTextBlockInlines(textBlock)
      if (projection.segments.some((segment) => !segment.editable)) {
        return rejected(action, textBlock.id, "target contains atomic inline content", [
          issue(
            "non-plain-text-block",
            "Phase 32 text insert only supports plain text-blocks without field refs, page numbers, or line breaks",
            "textBlockId",
          ),
        ], responseOptions)
      }

      const baseRevision = documentRevision
      const transaction = runVNextTextTransaction(workingPackage.document, {
        kind: "text.insert",
        source: "user",
        position: {
          textBlockId: textBlock.id,
          offset: projection.textLength,
        },
        text,
        inlineId: `${textBlock.id}-bridge-insert-${mutationCount + 1}`,
      })

      if (!transaction.ok) {
        appendHistory(transaction)
        return rejected(action, textBlock.id, "core text transaction was rejected", transaction.issues.map((item) => ({
          severity: item.severity,
          code: item.code,
          message: item.message,
          path: item.path,
        })), responseOptions)
      }

      return applyCommittedTransaction({
        action,
        targetTextBlockId: textBlock.id,
        baseRevision,
        document: transaction.document,
        dirtyScope: transaction.transaction.dirtyScope,
        transactionResult: transaction,
        summary: transaction.transaction.historyIntent.summary,
        responseOptions,
      })
    },
    replaceText(request, responseOptions) {
      const action = "sandbox.replacePlainTextBlock"
      const text = normalizeText(request.text)
      if (text == null) {
        return rejected(action, request.textBlockId ?? null, "replacement text was rejected", [
          issue("invalid-text", "replacement text must be a non-empty string up to 240 characters", "text"),
        ], responseOptions)
      }

      const textBlock = textBlockFromPackage(workingPackage, request.textBlockId)
      if (textBlock == null) {
        return rejected(action, request.textBlockId, "target was rejected", [
          issue("target-not-text-block", `target "${request.textBlockId}" is not a text-block`, "textBlockId"),
        ], responseOptions)
      }

      const projection = projectVNextTextBlockInlines(textBlock)
      if (projection.textLength === 0 || projection.segments.some((segment) => !segment.editable)) {
        return rejected(action, textBlock.id, "target contains atomic inline content", [
          issue(
            "non-plain-text-block",
            "Phase 29 bridge replacement only supports plain text-blocks without field refs, page numbers, or line breaks",
            "textBlockId",
          ),
        ], responseOptions)
      }

      const baseRevision = documentRevision
      const transaction = runVNextTextTransaction(workingPackage.document, {
        kind: "text.range.replace",
        source: "user",
        range: {
          textBlockId: textBlock.id,
          anchorOffset: 0,
          focusOffset: projection.textLength,
        },
        text,
        inlineId: `${textBlock.id}-bridge-replace-${mutationCount + 1}`,
      })

      if (!transaction.ok) {
        appendHistory(transaction)
        return rejected(action, textBlock.id, "core text transaction was rejected", transaction.issues.map((item) => ({
          severity: item.severity,
          code: item.code,
          message: item.message,
          path: item.path,
        })), responseOptions)
      }

      return applyCommittedTransaction({
        action,
        targetTextBlockId: textBlock.id,
        baseRevision,
        document: transaction.document,
        dirtyScope: transaction.transaction.dirtyScope,
        transactionResult: transaction,
        summary: transaction.transaction.historyIntent.summary,
        responseOptions,
      })
    },
  }
}
