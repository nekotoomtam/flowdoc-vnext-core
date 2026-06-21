import {
  createVNextEditableSession,
  projectVNextTextBlockInlines,
  runVNextTextTransaction,
  serializeFlowDocPackageV2DocumentVNext,
  type FlowDocPackageV2DocumentVNext,
  type TextBlockNode,
  type VNextTextTransactionDirtyScope,
} from "@flowdoc/vnext-core"
import {
  createTemplateBuilderSnapshot,
  type TemplateBuilderSnapshot,
  type TemplateBuilderSnapshotLastMutation,
  type TemplateBuilderSnapshotNode,
  type TemplateBuilderSnapshotOptions,
} from "./coreBoundary.js"

export interface TemplateBuilderReplaceTextRequest {
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
  action: "sandbox.replacePlainTextBlock"
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
  status: TemplateBuilderSnapshotLastMutation["status"],
  targetTextBlockId: string | null,
  summary: string,
  issueCount: number,
): TemplateBuilderSnapshotLastMutation {
  return {
    action: "sandbox.replacePlainTextBlock",
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
    action: "sandbox.replacePlainTextBlock",
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
    snapshotRequired: false,
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

  function bridgeSnapshot(): TemplateBuilderSnapshot {
    return createTemplateBuilderSnapshot(workingPackage, {
      ...options,
      runtime: {
        mode: "in-memory-bridge",
        documentRevision,
        dirtyScopeCount,
        mutationCount,
        lastMutation,
      },
    })
  }

  function rejected(
    textBlockId: string | null,
    summary: string,
    issues: TemplateBuilderMutationIssue[],
    responseOptions?: TemplateBuilderMutationResponseOptions,
  ): TemplateBuilderMutationResponse {
    const baseRevision = documentRevision
    lastMutation = bridgeMutation("rejected", textBlockId, summary, issues.length)
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

  return {
    snapshot: bridgeSnapshot,
    replaceText(request, responseOptions) {
      const text = normalizeText(request.text)
      if (text == null) {
        return rejected(request.textBlockId ?? null, "replacement text was rejected", [
          issue("invalid-text", "replacement text must be a non-empty string up to 240 characters", "text"),
        ], responseOptions)
      }

      const textBlock = textBlockFromPackage(workingPackage, request.textBlockId)
      if (textBlock == null) {
        return rejected(request.textBlockId, "target was rejected", [
          issue("target-not-text-block", `target "${request.textBlockId}" is not a text-block`, "textBlockId"),
        ], responseOptions)
      }

      const projection = projectVNextTextBlockInlines(textBlock)
      if (projection.textLength === 0 || projection.segments.some((segment) => !segment.editable)) {
        return rejected(textBlock.id, "target contains atomic inline content", [
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
        return rejected(textBlock.id, "core text transaction was rejected", transaction.issues.map((item) => ({
          severity: item.severity,
          code: item.code,
          message: item.message,
          path: item.path,
        })), responseOptions)
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
      lastMutation = bridgeMutation(
        "applied",
        textBlock.id,
        transaction.transaction.historyIntent.summary,
        0,
      )

      return mutationResponse({
        ok: true,
        snapshot: bridgeSnapshot(),
        mutation: lastMutation,
        issues: [],
        baseRevision,
        nextRevision: documentRevision,
        changedNodeIds: [textBlock.id],
        dirtyScopes: [transaction.transaction.dirtyScope],
        responseOptions,
      })
    },
  }
}
