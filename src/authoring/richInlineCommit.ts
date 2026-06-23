import type { DocumentNode, DocumentSection, InlineNode, TextBlockNode } from "../schema/document.js"
import { InlineNodeSchema } from "../schema/document.js"
import {
  buildRelationshipGraph,
  type NodeId,
  type ParentRef,
  type RelationshipGraph,
  type SectionId,
} from "../graph/relationshipGraph.js"
import {
  projectVNextTextBlockInlines,
  type VNextTextBlockProjection,
  type VNextTextTransactionDirtyScope,
  type VNextTextTransactionHistoryIntent,
  type VNextTextTransactionIssue,
  type VNextTextTransactionSource,
} from "./textTransactions.js"
import type { VNextAuthoringIntentHistoryRecord, VNextAuthoringIntentInputKind } from "./intentHistory.js"

export type VNextRichInlineCommitCommand = {
  kind: "text-block.rich-inline.replace"
  source?: VNextTextTransactionSource
  textBlockId: NodeId
  children: readonly InlineNode[]
}

export type VNextRichInlineCommitFailureReason =
  | "invalid-document"
  | "target-not-found"
  | "unsupported-target"
  | "invalid-command"
  | "validation-failed"

export interface VNextRichInlineCommitRecord {
  kind: VNextRichInlineCommitCommand["kind"]
  source: VNextTextTransactionSource
  targetTextBlockId: NodeId
  dirtyScope: VNextTextTransactionDirtyScope
  historyIntent: VNextTextTransactionHistoryIntent
  keyHistory: {
    fieldKeys: string[]
    status: "field-ref-usage-recorded" | "not-required"
  }
  projection: VNextTextBlockProjection
  renderInvalidation: {
    exactGenerationStale: true
    lane: "text-content"
  }
}

export type VNextRichInlineCommitResult =
  | {
      ok: true
      command: VNextRichInlineCommitCommand
      document: DocumentNode
      transaction: VNextRichInlineCommitRecord
      issues: []
    }
  | {
      ok: false
      command: VNextRichInlineCommitCommand
      document: DocumentNode
      reason: VNextRichInlineCommitFailureReason
      issues: VNextTextTransactionIssue[]
    }

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: string,
  message: string,
  options: {
    inlineId?: NodeId
    path?: string
    severity?: VNextTextTransactionIssue["severity"]
    textBlockId?: NodeId
  } = {},
): VNextTextTransactionIssue {
  return {
    severity: options.severity ?? "error",
    code,
    path: options.path ?? "",
    message,
    textBlockId: options.textBlockId,
    inlineId: options.inlineId,
  }
}

function issuesFromUnknownError(error: unknown): VNextTextTransactionIssue[] {
  if (error instanceof Error) return [issue("unexpected-error", error.message)]
  return [issue("unexpected-error", "unknown rich inline commit error")]
}

function graphOrFailure(command: VNextRichInlineCommitCommand, document: DocumentNode): RelationshipGraph | VNextRichInlineCommitResult {
  try {
    return buildRelationshipGraph(document)
  } catch (error) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-document",
      issues: issuesFromUnknownError(error),
    }
  }
}

function parentNodeId(parent: ParentRef): NodeId | null {
  if (parent.kind === "section") return null
  if (parent.kind === "zone") return parent.zoneId
  if (parent.kind === "columns") return parent.columnsId
  if (parent.kind === "column") return parent.columnId
  if (parent.kind === "table") return parent.tableId
  if (parent.kind === "table-row") return parent.rowId
  return parent.cellId
}

function targetTextBlock(
  command: VNextRichInlineCommitCommand,
  document: DocumentNode,
  graph: RelationshipGraph,
): TextBlockNode | VNextRichInlineCommitResult {
  const node = graph.nodesById.get(command.textBlockId)

  if (node == null) {
    return {
      ok: false,
      command,
      document,
      reason: "target-not-found",
      issues: [issue("target-not-found", `text-block "${command.textBlockId}" was not found`, {
        textBlockId: command.textBlockId,
      })],
    }
  }

  if (node.type !== "text-block") {
    return {
      ok: false,
      command,
      document,
      reason: "unsupported-target",
      issues: [issue("not-text-block", `rich inline commit requires a text-block target; got ${node.type}`, {
        textBlockId: command.textBlockId,
      })],
    }
  }

  return node
}

function validateChildren(command: VNextRichInlineCommitCommand): VNextTextTransactionIssue[] {
  const issues: VNextTextTransactionIssue[] = []
  const ids = new Set<string>()

  command.children.forEach((child, index) => {
    const parsed = InlineNodeSchema.safeParse(child)
    if (!parsed.success) {
      issues.push(issue("invalid-inline-child", "rich inline commit child must match the vNext inline schema", {
        inlineId: typeof child?.id === "string" ? child.id : undefined,
        path: `children[${index}]`,
        textBlockId: command.textBlockId,
      }))
      return
    }

    if (child.type !== "text" && child.type !== "field-ref") {
      issues.push(issue("unsupported-inline-child", "rich inline commit currently accepts text and field-ref children only", {
        inlineId: child.id,
        path: `children[${index}]`,
        textBlockId: command.textBlockId,
      }))
    }

    if (ids.has(child.id)) {
      issues.push(issue("duplicate-inline-id", `inline id "${child.id}" is duplicated`, {
        inlineId: child.id,
        path: `children[${index}].id`,
        textBlockId: command.textBlockId,
      }))
    }
    ids.add(child.id)
  })

  return issues
}

function sectionForNode(document: DocumentNode, graph: RelationshipGraph, nodeId: NodeId): DocumentSection | null {
  const sectionId = graph.sectionByNodeId.get(nodeId)
  if (sectionId == null) return null
  return document.document.sections.find((section) => section.id === sectionId) ?? null
}

function replaceTextBlockChildren(
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlock: TextBlockNode,
  children: readonly InlineNode[],
): DocumentNode {
  const section = sectionForNode(document, graph, textBlock.id)
  if (section == null) return document

  return {
    ...cloneJson(document),
    document: {
      ...cloneJson(document.document),
      sections: document.document.sections.map((candidate) => {
        if (candidate.id !== section.id) return cloneJson(candidate)
        return {
          ...cloneJson(candidate),
          nodes: {
            ...cloneJson(candidate.nodes),
            [textBlock.id]: {
              ...cloneJson(textBlock),
              children: children.map((child) => cloneJson(child)),
            },
          },
        }
      }),
    },
  }
}

function dirtyScopeForTextBlock(graph: RelationshipGraph, textBlockId: NodeId): VNextTextTransactionDirtyScope {
  const sectionId = graph.sectionByNodeId.get(textBlockId) ?? ""
  const zoneId = graph.zoneByNodeId.get(textBlockId) ?? ""
  const parent = graph.parentByNodeId.get(textBlockId)
  const parentId = parent == null ? null : parentNodeId(parent)

  return {
    kind: "text-block",
    sectionId: sectionId as SectionId,
    zoneId,
    textBlockId,
    parentNodeIds: parentId == null ? [] : [parentId],
  }
}

function historyIntentFor(textBlockId: NodeId): VNextTextTransactionHistoryIntent {
  return {
    kind: "text-edit",
    durableIntent: "content",
    mergeKey: `rich-inline:${textBlockId}`,
    coalesce: "single-entry",
    summary: `commit rich inline replacement in ${textBlockId}`,
  }
}

function fieldKeysFor(children: readonly InlineNode[]): string[] {
  return [...new Set(children.flatMap((child) => child.type === "field-ref" ? [child.key] : []))].sort()
}

function successfulCommit(
  command: VNextRichInlineCommitCommand,
  originalDocument: DocumentNode,
  mutatedDocument: DocumentNode,
  originalGraph: RelationshipGraph,
  textBlockId: NodeId,
): VNextRichInlineCommitResult {
  try {
    buildRelationshipGraph(mutatedDocument)
  } catch (error) {
    return {
      ok: false,
      command,
      document: originalDocument,
      reason: "validation-failed",
      issues: issuesFromUnknownError(error),
    }
  }

  const node = buildRelationshipGraph(mutatedDocument).nodesById.get(textBlockId)
  if (node?.type !== "text-block") {
    return {
      ok: false,
      command,
      document: originalDocument,
      reason: "validation-failed",
      issues: [issue("missing-text-block", `text-block "${textBlockId}" could not be resolved after rich inline commit`, {
        textBlockId,
      })],
    }
  }

  const fieldKeys = fieldKeysFor(command.children)

  return {
    ok: true,
    command: cloneJson(command),
    document: mutatedDocument,
    transaction: {
      kind: "text-block.rich-inline.replace",
      source: command.source ?? "user",
      targetTextBlockId: textBlockId,
      dirtyScope: dirtyScopeForTextBlock(originalGraph, textBlockId),
      historyIntent: historyIntentFor(textBlockId),
      keyHistory: {
        fieldKeys,
        status: fieldKeys.length > 0 ? "field-ref-usage-recorded" : "not-required",
      },
      projection: projectVNextTextBlockInlines(node),
      renderInvalidation: {
        exactGenerationStale: true,
        lane: "text-content",
      },
    },
    issues: [],
  }
}

export function runVNextRichInlineCommit(
  document: DocumentNode,
  command: VNextRichInlineCommitCommand,
): VNextRichInlineCommitResult {
  const graph = graphOrFailure(command, document)
  if ("ok" in graph) return graph

  const textBlock = targetTextBlock(command, document, graph)
  if ("ok" in textBlock) return textBlock

  const childIssues = validateChildren(command)
  if (childIssues.length > 0) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-command",
      issues: childIssues,
    }
  }

  const mutatedDocument = replaceTextBlockChildren(document, graph, textBlock, command.children)
  return successfulCommit(command, document, mutatedDocument, graph, textBlock.id)
}

export function createVNextRichInlineCommitHistoryRecord(
  result: VNextRichInlineCommitResult,
  options: { groupId?: string; inputKind?: VNextAuthoringIntentInputKind } = {},
): VNextAuthoringIntentHistoryRecord {
  const inputKind = options.inputKind ?? "command"

  if (result.ok) {
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
      coalescing: { kind: "single-entry", mergeKey: result.transaction.historyIntent.mergeKey },
      summary: result.transaction.historyIntent.summary,
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
    targetTextBlockId: result.command.textBlockId,
    dirtyScopes: [],
    mergeKey: null,
    coalescing: { kind: "none", mergeKey: null },
    summary: `rejected ${result.command.kind}`,
    failureReason: result.reason,
    issues: cloneJson(result.issues),
  }
}
