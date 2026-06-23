import {
  appendVNextAuthoringIntentHistoryResult,
  appendVNextAuthoringIntentHistoryRecord,
  createStructuralChangePacket,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  groupVNextAuthoringIntentHistory,
  projectVNextTextBlockInlines,
  resolveVNextLiveLayoutBoundary,
  runVNextOperation,
  runVNextRichInlineCommit,
  runVNextTextTransaction,
  serializeFlowDocPackageV2DocumentVNext,
  type StructuralChangePacket,
  type FlowDocPackageV2DocumentVNext,
  type InlineNode,
  type TextBlockNode,
  type VNextAuthoringIntentHistoryRecord,
  type VNextLiveLayoutDirtyScope,
  type VNextLiveLayoutBoundaryResult,
  type VNextOperationCommand,
  type VNextOperationScope,
  type VNextRichInlineCommitResult,
  type VNextTextTransactionDirtyScope,
  type VNextTextTransactionResult,
} from "@flowdoc/vnext-core"
import {
  createTemplateBuilderLiveLayoutSnapshot,
  createTemplateBuilderSnapshot,
  type TemplateBuilderAuthoringHistorySnapshot,
  type TemplateBuilderLiveLayoutSnapshot,
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

export interface TemplateBuilderInsertTextBlockRequest {
  parentNodeId: string
  index: number
  text: string
  nodeId?: string
}

export interface TemplateBuilderDeleteNodeRequest {
  nodeId: string
}

export interface TemplateBuilderReorderNodeRequest {
  nodeId: string
  toIndex: number
}

export interface TemplateBuilderRichInlineCommitRequest {
  plan: unknown
}

export interface TemplateBuilderMutationIssue {
  severity: "error" | "warning" | "info"
  code: string
  message: string
  path?: string
  nodeId?: string
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
  liveLayout: TemplateBuilderLiveLayoutSnapshot
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

export interface TemplateBuilderStructuralMutationResponse {
  ok: boolean
  snapshot?: TemplateBuilderSnapshot
  packet: StructuralChangePacket
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
}

export interface TemplateBuilderMutationBridge {
  snapshot(): TemplateBuilderSnapshot
  deleteNode(
    request: TemplateBuilderDeleteNodeRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderStructuralMutationResponse
  insertTextBlock(
    request: TemplateBuilderInsertTextBlockRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderStructuralMutationResponse
  insertTextAtEnd(
    request: TemplateBuilderInsertTextAtEndRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse
  commitRichInline(
    request: TemplateBuilderRichInlineCommitRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse
  replaceText(
    request: TemplateBuilderReplaceTextRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse
  reorderNode(
    request: TemplateBuilderReorderNodeRequest,
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderStructuralMutationResponse
  redo(responseOptions?: TemplateBuilderMutationResponseOptions): TemplateBuilderMutationResponse
  undo(responseOptions?: TemplateBuilderMutationResponseOptions): TemplateBuilderMutationResponse
}

interface TemplateBuilderTextUndoPatch {
  kind: "plain-text"
  groupId: string
  sourceAction: string
  targetTextBlockId: string
  beforeText: string
  afterText: string
}

interface TemplateBuilderRichInlineUndoPatch {
  kind: "rich-inline"
  groupId: string
  sourceAction: string
  targetTextBlockId: string
  beforeChildren: InlineNode[]
  afterChildren: InlineNode[]
}

type TemplateBuilderUndoPatch = TemplateBuilderTextUndoPatch | TemplateBuilderRichInlineUndoPatch

interface TemplateBuilderRichInlineCommitPlan {
  status: "planned"
  operationKind: "text-block.rich-inline.replace"
  targetTextBlockId: string
  baseRevision: number | null
  documentRevision: number | null
  plannedInlineChildren: InlineNode[]
}

function issue(code: string, message: string, path = ""): TemplateBuilderMutationIssue {
  return { severity: "error", code, message, path }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function cloneInlineChildren(children: readonly InlineNode[]): InlineNode[] {
  return children.map((child) => cloneJson(child))
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

function normalizeNodeId(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > 120) return null
  if (!/^[A-Za-z0-9._:-]+$/.test(trimmed)) return null
  return trimmed
}

function normalizeRichInlineCommitPlan(value: unknown): TemplateBuilderRichInlineCommitPlan | null {
  if (value == null || typeof value !== "object") return null
  const candidate = value as {
    baseRevision?: unknown
    documentRevision?: unknown
    operationKind?: unknown
    plannedInlineChildren?: unknown
    status?: unknown
    targetTextBlockId?: unknown
  }
  const targetTextBlockId = normalizeNodeId(candidate.targetTextBlockId)
  const baseRevision = typeof candidate.baseRevision === "number" && Number.isInteger(candidate.baseRevision)
    ? candidate.baseRevision
    : null
  const documentRevision = typeof candidate.documentRevision === "number" && Number.isInteger(candidate.documentRevision)
    ? candidate.documentRevision
    : null
  if (
    candidate.status !== "planned"
    || candidate.operationKind !== "text-block.rich-inline.replace"
    || targetTextBlockId == null
    || !Array.isArray(candidate.plannedInlineChildren)
  ) {
    return null
  }

  return {
    status: "planned",
    operationKind: "text-block.rich-inline.replace",
    targetTextBlockId,
    baseRevision,
    documentRevision,
    plannedInlineChildren: candidate.plannedInlineChildren as InlineNode[],
  }
}

function textBlockNode(id: string, text: string): TextBlockNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-inline-1`, type: "text", text }],
  }
}

function allPackageNodeIds(pack: FlowDocPackageV2DocumentVNext): Set<string> {
  return new Set(pack.document.document.sections.flatMap((section) => Object.keys(section.nodes)))
}

function uniqueStructuralNodeId(pack: FlowDocPackageV2DocumentVNext, preferredId: string | null, parentNodeId: string): string {
  const usedIds = allPackageNodeIds(pack)
  const base = preferredId ?? `${parentNodeId}-text-block`
  if (!usedIds.has(base)) return base

  for (let index = 1; index < 10_000; index += 1) {
    const candidate = `${base}-${index}`
    if (!usedIds.has(candidate)) return candidate
  }

  return `${base}-${Date.now()}`
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
    liveLayout: cloneJson(input.snapshot.liveLayout),
    snapshotRequired: false,
  }
}

function mutationIssuesFromStructuralPacket(packet: StructuralChangePacket): TemplateBuilderMutationIssue[] {
  return packet.issues.map((item) => ({
    severity: item.severity,
    code: item.code,
    message: item.message,
    nodeId: item.nodeId,
    path: item.path,
  }))
}

function operationScopeToLiveLayoutDirtyScopes(scope: VNextOperationScope): VNextLiveLayoutDirtyScope[] {
  if (scope.nodeIds.length === 0) {
    return scope.sectionIds.length > 0
      ? [{ kind: "document", sectionIds: scope.sectionIds }]
      : []
  }

  const sectionId = scope.sectionIds[0]
  const zoneId = scope.zoneIds[0]
  if (sectionId == null || zoneId == null) {
    return [{ kind: "document", sectionIds: scope.sectionIds }]
  }

  return scope.nodeIds.map((nodeId) => ({
    kind: "node",
    nodeId,
    parentNodeIds: scope.parentNodeIds,
    sectionId,
    zoneId,
  }))
}

function operationScopesToLiveLayoutDirtyScopes(scopes: readonly VNextOperationScope[]): VNextLiveLayoutDirtyScope[] {
  return scopes.flatMap((scope) => operationScopeToLiveLayoutDirtyScopes(scope))
}

function summarizeAuthoringHistory(
  records: readonly VNextAuthoringIntentHistoryRecord[],
  mode: TemplateBuilderAuthoringHistorySnapshot["mode"],
  undoStack: readonly TemplateBuilderUndoPatch[],
  redoStack: readonly TemplateBuilderUndoPatch[],
): TemplateBuilderAuthoringHistorySnapshot {
  const groups = groupVNextAuthoringIntentHistory(records)

  return {
    mode,
    recordCount: records.length,
    undoableRecordCount: records.filter((record) => record.historyAction === "undoable").length,
    rejectedRecordCount: records.filter((record) => record.status === "rejected").length,
    groupCount: groups.length,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoDepth: undoStack.length,
    redoDepth: redoStack.length,
    nextUndoGroupId: undoStack.at(-1)?.groupId ?? null,
    nextRedoGroupId: redoStack.at(-1)?.groupId ?? null,
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

function structuralMutationResponse(input: {
  ok: boolean
  snapshot: TemplateBuilderSnapshot
  packet: StructuralChangePacket
  mutation: TemplateBuilderSnapshotLastMutation
  issues: TemplateBuilderMutationIssue[]
  responseOptions?: TemplateBuilderMutationResponseOptions
}): TemplateBuilderStructuralMutationResponse {
  const response: TemplateBuilderStructuralMutationResponse = {
    ok: input.ok,
    packet: input.packet,
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
  let undoStack: TemplateBuilderUndoPatch[] = []
  let redoStack: TemplateBuilderUndoPatch[] = []
  let liveLayoutRequestCount = options.runtime?.liveLayout?.requestCount ?? 0
  let lastLiveLayoutResult: VNextLiveLayoutBoundaryResult | null = null

  function bridgeSnapshot(): TemplateBuilderSnapshot {
    return createTemplateBuilderSnapshot(workingPackage, {
      ...options,
      runtime: {
        mode: "in-memory-bridge",
        documentRevision,
        dirtyScopeCount,
        authoringHistory: summarizeAuthoringHistory(authoringHistory, "in-memory", undoStack, redoStack),
        liveLayout: createTemplateBuilderLiveLayoutSnapshot({
          mode: "in-memory-bridge",
          requestCount: liveLayoutRequestCount,
          result: lastLiveLayoutResult,
        }),
        mutationCount,
        lastMutation,
      },
    })
  }

  function appendHistory(result: VNextTextTransactionResult): VNextAuthoringIntentHistoryRecord | null {
    authoringHistory = appendVNextAuthoringIntentHistoryResult(authoringHistory, result, {
      inputKind: "command",
    })
    return authoringHistory.at(-1) ?? null
  }

  function appendRichInlineHistory(result: VNextRichInlineCommitResult): VNextAuthoringIntentHistoryRecord | null {
    authoringHistory = appendVNextAuthoringIntentHistoryRecord(
      authoringHistory,
      createVNextRichInlineCommitHistoryRecord(result, { inputKind: "command" }),
    )
    return authoringHistory.at(-1) ?? null
  }

  function rememberLiveLayoutBoundary(dirtyScopes: readonly VNextTextTransactionDirtyScope[]): void {
    const result = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes,
    })

    if (result.kind === "layout-request") {
      liveLayoutRequestCount += 1
    }
    lastLiveLayoutResult = result
  }

  function rememberStructuralLiveLayoutBoundary(operationScopes: readonly VNextOperationScope[]): void {
    const dirtyScopes = operationScopesToLiveLayoutDirtyScopes(operationScopes)
    const result = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes,
    })

    if (result.kind === "layout-request") {
      liveLayoutRequestCount += 1
    }
    lastLiveLayoutResult = result
  }

  function rememberUndoPatch(input: {
    action: string
    historyRecord: VNextAuthoringIntentHistoryRecord | null
    targetTextBlockId: string
    beforeText: string
    afterText: string
  }): void {
    if (input.historyRecord?.historyAction !== "undoable") return

    undoStack = [
      ...undoStack,
      {
        kind: "plain-text",
        groupId: input.historyRecord.groupId ?? `authoring-group-${undoStack.length + 1}`,
        sourceAction: input.action,
        targetTextBlockId: input.targetTextBlockId,
        beforeText: input.beforeText,
        afterText: input.afterText,
      },
    ]
    redoStack = []
  }

  function rememberRichInlineUndoPatch(input: {
    action: string
    historyRecord: VNextAuthoringIntentHistoryRecord | null
    targetTextBlockId: string
    beforeChildren: readonly InlineNode[]
    afterChildren: readonly InlineNode[]
  }): void {
    if (input.historyRecord?.historyAction !== "undoable") return

    undoStack = [
      ...undoStack,
      {
        kind: "rich-inline",
        groupId: input.historyRecord.groupId ?? `authoring-group-${undoStack.length + 1}`,
        sourceAction: input.action,
        targetTextBlockId: input.targetTextBlockId,
        beforeChildren: cloneInlineChildren(input.beforeChildren),
        afterChildren: cloneInlineChildren(input.afterChildren),
      },
    ]
    redoStack = []
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
    beforeText: string
    afterText: string
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
    const historyRecord = appendHistory(input.transactionResult)
    rememberUndoPatch({
      action: input.action,
      historyRecord,
      targetTextBlockId: input.targetTextBlockId,
      beforeText: input.beforeText,
      afterText: input.afterText,
    })
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      input.targetTextBlockId,
      input.summary,
      0,
    )
    rememberLiveLayoutBoundary([input.dirtyScope])

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

  function applyCommittedRichInline(input: {
    action: string
    baseRevision: number
    beforeChildren: readonly InlineNode[]
    result: Extract<VNextRichInlineCommitResult, { ok: true }>
    responseOptions?: TemplateBuilderMutationResponseOptions
  }): TemplateBuilderMutationResponse {
    workingPackage = serializeFlowDocPackageV2DocumentVNext({
      ...workingPackage,
      document: input.result.document,
      meta: {
        ...workingPackage.meta,
        updatedAt: "sandbox-memory",
      },
    })
    documentRevision += 1
    mutationCount += 1
    dirtyScopeCount = 1
    const historyRecord = appendRichInlineHistory(input.result)
    rememberRichInlineUndoPatch({
      action: input.action,
      historyRecord,
      targetTextBlockId: input.result.transaction.targetTextBlockId,
      beforeChildren: input.beforeChildren,
      afterChildren: input.result.command.children,
    })
    rememberLiveLayoutBoundary([input.result.transaction.dirtyScope])
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      input.result.transaction.targetTextBlockId,
      input.result.transaction.historyIntent.summary,
      0,
    )

    return mutationResponse({
      ok: true,
      snapshot: bridgeSnapshot(),
      mutation: lastMutation,
      issues: [],
      baseRevision: input.baseRevision,
      nextRevision: documentRevision,
      changedNodeIds: [input.result.transaction.targetTextBlockId],
      dirtyScopes: [input.result.transaction.dirtyScope],
      responseOptions: input.responseOptions,
    })
  }

  function applyHistoryPatch(input: {
    action: "sandbox.undo" | "sandbox.redo"
    direction: "undo" | "redo"
    patch: TemplateBuilderUndoPatch
    summary: string
    responseOptions?: TemplateBuilderMutationResponseOptions
    onCommitted: () => void
  }): TemplateBuilderMutationResponse {
    if (input.patch.kind === "rich-inline") {
      return applyRichInlineHistoryPatch({
        action: input.action,
        patch: input.patch,
        targetChildren: input.direction === "undo" ? input.patch.beforeChildren : input.patch.afterChildren,
        summary: input.summary,
        responseOptions: input.responseOptions,
        onCommitted: input.onCommitted,
      })
    }

    return applyPlainTextHistoryPatch({
      action: input.action,
      patch: input.patch,
      targetText: input.direction === "undo" ? input.patch.beforeText : input.patch.afterText,
      summary: input.summary,
      responseOptions: input.responseOptions,
      onCommitted: input.onCommitted,
    })
  }

  function applyPlainTextHistoryPatch(input: {
    action: "sandbox.undo" | "sandbox.redo"
    patch: TemplateBuilderTextUndoPatch
    targetText: string
    summary: string
    responseOptions?: TemplateBuilderMutationResponseOptions
    onCommitted: () => void
  }): TemplateBuilderMutationResponse {
    const textBlock = textBlockFromPackage(workingPackage, input.patch.targetTextBlockId)
    if (textBlock == null) {
      return rejected(input.action, input.patch.targetTextBlockId, `${input.action} was rejected`, [
        issue("target-not-text-block", `target "${input.patch.targetTextBlockId}" is not a text-block`, "textBlockId"),
      ], input.responseOptions)
    }

    const projection = projectVNextTextBlockInlines(textBlock)
    if (projection.segments.some((segment) => !segment.editable)) {
      return rejected(input.action, textBlock.id, "target contains atomic inline content", [
        issue(
          "non-plain-text-block",
          "Phase 34 undo/redo only restores plain text-block patches without field refs, page numbers, or line breaks",
          "textBlockId",
        ),
      ], input.responseOptions)
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
      text: input.targetText,
      inlineId: `${textBlock.id}-bridge-${input.action.split(".").at(-1)}-${mutationCount + 1}`,
    })

    if (!transaction.ok) {
      return rejected(input.action, textBlock.id, "core text transaction was rejected", transaction.issues.map((item) => ({
        severity: item.severity,
        code: item.code,
        message: item.message,
        path: item.path,
      })), input.responseOptions)
    }

    workingPackage = serializeFlowDocPackageV2DocumentVNext({
      ...workingPackage,
      document: transaction.document,
      meta: {
        ...workingPackage.meta,
        updatedAt: "sandbox-memory",
      },
    })
    documentRevision += 1
    mutationCount += 1
    dirtyScopeCount = 1
    input.onCommitted()
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      textBlock.id,
      input.summary,
      0,
    )
    rememberLiveLayoutBoundary([transaction.transaction.dirtyScope])

    return mutationResponse({
      ok: true,
      snapshot: bridgeSnapshot(),
      mutation: lastMutation,
      issues: [],
      baseRevision,
      nextRevision: documentRevision,
      changedNodeIds: [textBlock.id],
      dirtyScopes: [transaction.transaction.dirtyScope],
      responseOptions: input.responseOptions,
    })
  }

  function applyRichInlineHistoryPatch(input: {
    action: "sandbox.undo" | "sandbox.redo"
    patch: TemplateBuilderRichInlineUndoPatch
    targetChildren: readonly InlineNode[]
    summary: string
    responseOptions?: TemplateBuilderMutationResponseOptions
    onCommitted: () => void
  }): TemplateBuilderMutationResponse {
    const textBlock = textBlockFromPackage(workingPackage, input.patch.targetTextBlockId)
    if (textBlock == null) {
      return rejected(input.action, input.patch.targetTextBlockId, `${input.action} was rejected`, [
        issue("target-not-text-block", `target "${input.patch.targetTextBlockId}" is not a text-block`, "textBlockId"),
      ], input.responseOptions)
    }

    const baseRevision = documentRevision
    const result = runVNextRichInlineCommit(workingPackage.document, {
      kind: "text-block.rich-inline.replace",
      source: "user",
      textBlockId: textBlock.id,
      children: cloneInlineChildren(input.targetChildren),
    })

    if (!result.ok) {
      return rejected(input.action, textBlock.id, "core rich inline replay was rejected", result.issues.map((item) => ({
        severity: item.severity,
        code: item.code,
        message: item.message,
        path: item.path,
      })), input.responseOptions)
    }

    workingPackage = serializeFlowDocPackageV2DocumentVNext({
      ...workingPackage,
      document: result.document,
      meta: {
        ...workingPackage.meta,
        updatedAt: "sandbox-memory",
      },
    })
    documentRevision += 1
    mutationCount += 1
    dirtyScopeCount = 1
    input.onCommitted()
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      textBlock.id,
      input.summary,
      0,
    )
    rememberLiveLayoutBoundary([result.transaction.dirtyScope])

    return mutationResponse({
      ok: true,
      snapshot: bridgeSnapshot(),
      mutation: lastMutation,
      issues: [],
      baseRevision,
      nextRevision: documentRevision,
      changedNodeIds: [textBlock.id],
      dirtyScopes: [result.transaction.dirtyScope],
      responseOptions: input.responseOptions,
    })
  }

  function applyStructuralOperation(input: {
    action: string
    command: VNextOperationCommand
    summary: string
    responseOptions?: TemplateBuilderMutationResponseOptions
  }): TemplateBuilderStructuralMutationResponse {
    const baseRevision = documentRevision
    const beforeDocument = workingPackage.document
    const result = runVNextOperation(beforeDocument, input.command)
    const packet = createStructuralChangePacket({
      baseRevision,
      beforeDocument,
      nextRevision: result.ok ? baseRevision + 1 : baseRevision,
      result,
    })
    const issues = mutationIssuesFromStructuralPacket(packet)

    if (!result.ok) {
      lastMutation = bridgeMutation(input.action, "rejected", null, input.summary, issues.length)
      return structuralMutationResponse({
        ok: false,
        snapshot: bridgeSnapshot(),
        packet,
        mutation: lastMutation,
        issues,
        responseOptions: input.responseOptions,
      })
    }

    workingPackage = serializeFlowDocPackageV2DocumentVNext({
      ...workingPackage,
      document: result.document,
      meta: {
        ...workingPackage.meta,
        updatedAt: "sandbox-memory",
      },
    })
    documentRevision = packet.nextRevision
    mutationCount += 1
    dirtyScopeCount = packet.dirtyScopes.length
    lastMutation = bridgeMutation(
      input.action,
      "applied",
      null,
      result.operation.historyPolicy.summary,
      0,
    )
    rememberStructuralLiveLayoutBoundary(packet.dirtyScopes)

    return structuralMutationResponse({
      ok: true,
      snapshot: bridgeSnapshot(),
      packet,
      mutation: lastMutation,
      issues,
      responseOptions: input.responseOptions,
    })
  }

  return {
    deleteNode(request, responseOptions) {
      const nodeId = normalizeNodeId(request.nodeId)
      const action = "sandbox.deleteStructuralNode"
      return applyStructuralOperation({
        action,
        command: { kind: "node.delete", nodeId: nodeId ?? "", source: "user" },
        responseOptions,
        summary: nodeId == null ? "delete node was rejected" : `delete node ${nodeId}`,
      })
    },
    insertTextBlock(request, responseOptions) {
      const action = "sandbox.insertStructuralTextBlock"
      const parentNodeId = normalizeNodeId(request.parentNodeId)
      const text = normalizeInsertText(request.text)
      const requestedNodeId = normalizeNodeId(request.nodeId)
      const nodeId = uniqueStructuralNodeId(workingPackage, requestedNodeId, parentNodeId ?? "structural-text-block")
      const index = parentNodeId == null || text == null
        ? -1
        : Number.isInteger(request.index)
          ? request.index
          : -1

      return applyStructuralOperation({
        action,
        command: {
          kind: "text-block.insert",
          index,
          node: textBlockNode(nodeId, text ?? ""),
          parentNodeId: parentNodeId ?? "",
          source: "user",
        },
        responseOptions,
        summary: parentNodeId == null || text == null
          ? "insert text-block was rejected"
          : `insert text-block ${nodeId}`,
      })
    },
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
        beforeText: projection.text,
        afterText: `${projection.text}${text}`,
        summary: transaction.transaction.historyIntent.summary,
        responseOptions,
      })
    },
    commitRichInline(request, responseOptions) {
      const action = "sandbox.commitRichInline"
      const plan = normalizeRichInlineCommitPlan(request.plan)
      if (plan == null) {
        return rejected(action, null, "rich inline commit was rejected", [
          issue("invalid-rich-inline-plan", "commit-rich-inline requires a planned Phase 124 rich inline commit plan", "plan"),
        ], responseOptions)
      }

      if (
        (plan.documentRevision != null && plan.documentRevision !== documentRevision)
        || (plan.baseRevision != null && plan.baseRevision !== documentRevision)
      ) {
        return rejected(action, plan.targetTextBlockId, "rich inline commit was rejected", [
          issue(
            "stale-rich-inline-plan",
            `rich inline plan revision does not match document revision ${documentRevision}`,
            "plan.documentRevision",
          ),
        ], responseOptions)
      }

      const baseRevision = documentRevision
      const beforeTextBlock = textBlockFromPackage(workingPackage, plan.targetTextBlockId)
      const result = runVNextRichInlineCommit(workingPackage.document, {
        kind: "text-block.rich-inline.replace",
        source: "user",
        textBlockId: plan.targetTextBlockId,
        children: plan.plannedInlineChildren,
      })

      if (!result.ok) {
        appendRichInlineHistory(result)
        return rejected(action, plan.targetTextBlockId, "core rich inline commit was rejected", result.issues.map((item) => ({
          severity: item.severity,
          code: item.code,
          message: item.message,
          path: item.path,
        })), responseOptions)
      }

      if (beforeTextBlock == null) {
        return rejected(action, plan.targetTextBlockId, "rich inline commit was rejected", [
          issue("target-not-text-block", `target "${plan.targetTextBlockId}" is not a text-block`, "textBlockId"),
        ], responseOptions)
      }

      return applyCommittedRichInline({
        action,
        baseRevision,
        beforeChildren: beforeTextBlock.children,
        result,
        responseOptions,
      })
    },
    redo(responseOptions) {
      const action = "sandbox.redo" as const
      const patch = redoStack.at(-1)
      if (patch == null) {
        return rejected(action, null, "redo was rejected", [
          issue("nothing-to-redo", "there is no sandbox text patch available to redo", "history"),
        ], responseOptions)
      }

      return applyHistoryPatch({
        action,
        patch,
        direction: "redo",
        summary: `redo ${patch.groupId}`,
        responseOptions,
        onCommitted: () => {
          redoStack = redoStack.slice(0, -1)
          undoStack = [...undoStack, patch]
        },
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
        beforeText: projection.text,
        afterText: text,
        summary: transaction.transaction.historyIntent.summary,
        responseOptions,
      })
    },
    reorderNode(request, responseOptions) {
      const nodeId = normalizeNodeId(request.nodeId)
      const action = "sandbox.reorderStructuralNode"
      return applyStructuralOperation({
        action,
        command: {
          kind: "node.reorder",
          nodeId: nodeId ?? "",
          source: "user",
          toIndex: Number.isInteger(request.toIndex) ? request.toIndex : -1,
        },
        responseOptions,
        summary: nodeId == null ? "reorder node was rejected" : `reorder node ${nodeId}`,
      })
    },
    undo(responseOptions) {
      const action = "sandbox.undo" as const
      const patch = undoStack.at(-1)
      if (patch == null) {
        return rejected(action, null, "undo was rejected", [
          issue("nothing-to-undo", "there is no sandbox text patch available to undo", "history"),
        ], responseOptions)
      }

      return applyHistoryPatch({
        action,
        patch,
        direction: "undo",
        summary: `undo ${patch.groupId}`,
        responseOptions,
        onCommitted: () => {
          undoStack = undoStack.slice(0, -1)
          redoStack = [...redoStack, patch]
        },
      })
    },
  }
}
