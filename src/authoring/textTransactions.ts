import type { DocumentNode, DocumentSection, InlineNode, TextBlockNode } from "../schema/document.js"
import type { NodeId, ParentRef, RelationshipGraph, SectionId } from "../graph/relationshipGraph.js"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import { DocumentAssertionError } from "../errors.js"

export const VNEXT_ATOMIC_INLINE_TEXT = "\uFFFC"

export type VNextTextTransactionSource = "user" | "automation" | "system"

export interface VNextTextPosition {
  textBlockId: NodeId
  offset: number
}

export interface VNextTextRange {
  textBlockId: NodeId
  anchorOffset: number
  focusOffset: number
}

export interface VNextNormalizedTextRange {
  textBlockId: NodeId
  startOffset: number
  endOffset: number
  collapsed: boolean
}

export interface VNextInlineProjectionSegment {
  inlineId: NodeId
  inlineIndex: number
  inlineType: InlineNode["type"]
  startOffset: number
  endOffset: number
  length: number
  editable: boolean
}

export interface VNextTextBlockProjection {
  textBlockId: NodeId
  text: string
  textLength: number
  segments: VNextInlineProjectionSegment[]
}

export type VNextFieldRefInline = Extract<InlineNode, { type: "field-ref" }>

export type VNextTextTransactionCommand =
  | { kind: "text.insert"; source?: VNextTextTransactionSource; position: VNextTextPosition; text: string; inlineId?: NodeId }
  | { kind: "text.delete"; source?: VNextTextTransactionSource; range: VNextTextRange }
  | { kind: "text.range.replace"; source?: VNextTextTransactionSource; range: VNextTextRange; text: string; inlineId?: NodeId }
  | { kind: "inline.field-ref.insert"; source?: VNextTextTransactionSource; position: VNextTextPosition; fieldRef: VNextFieldRefInline }

export type VNextTextTransactionFailureReason =
  | "invalid-document"
  | "target-not-found"
  | "unsupported-target"
  | "invalid-command"
  | "validation-failed"

export interface VNextTextTransactionIssue {
  severity: "error" | "warning"
  code: string
  path: string
  message: string
  textBlockId?: NodeId
  inlineId?: NodeId
}

export interface VNextTextTransactionDirtyScope {
  kind: "text-block"
  sectionId: SectionId
  zoneId: NodeId
  textBlockId: NodeId
  parentNodeIds: readonly NodeId[]
}

export interface VNextTextTransactionHistoryIntent {
  kind: "text-edit"
  durableIntent: "content"
  mergeKey: string
  coalesce: "typing-session" | "single-entry"
  summary: string
}

export interface VNextTextTransactionCommit {
  kind: VNextTextTransactionCommand["kind"]
  source: VNextTextTransactionSource
  targetTextBlockId: NodeId
  dirtyScope: VNextTextTransactionDirtyScope
  historyIntent: VNextTextTransactionHistoryIntent
  projection: VNextTextBlockProjection
}

export type VNextTextTransactionResult =
  | {
      ok: true
      command: VNextTextTransactionCommand
      document: DocumentNode
      transaction: VNextTextTransactionCommit
      issues: []
    }
  | {
      ok: false
      command: VNextTextTransactionCommand
      document: DocumentNode
      reason: VNextTextTransactionFailureReason
      issues: VNextTextTransactionIssue[]
    }

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function inlineProjectionText(inline: InlineNode): string {
  if (inline.type === "text") return inline.text
  if (inline.type === "line-break") return "\n"
  return VNEXT_ATOMIC_INLINE_TEXT
}

export function projectVNextTextBlockInlines(textBlock: TextBlockNode): VNextTextBlockProjection {
  let offset = 0
  let text = ""

  const segments = textBlock.children.map((inline, inlineIndex): VNextInlineProjectionSegment => {
    const projected = inlineProjectionText(inline)
    const length = projected.length
    const startOffset = offset
    const endOffset = startOffset + length
    offset = endOffset
    text += projected

    return {
      inlineId: inline.id,
      inlineIndex,
      inlineType: inline.type,
      startOffset,
      endOffset,
      length,
      editable: inline.type === "text",
    }
  })

  return {
    textBlockId: textBlock.id,
    text,
    textLength: offset,
    segments,
  }
}

export function normalizeVNextTextRange(range: VNextTextRange): VNextNormalizedTextRange {
  const startOffset = Math.min(range.anchorOffset, range.focusOffset)
  const endOffset = Math.max(range.anchorOffset, range.focusOffset)

  return {
    textBlockId: range.textBlockId,
    startOffset,
    endOffset,
    collapsed: startOffset === endOffset,
  }
}

function issue(
  code: string,
  message: string,
  options: {
    path?: string
    textBlockId?: NodeId
    inlineId?: NodeId
    severity?: VNextTextTransactionIssue["severity"]
  } = {},
): VNextTextTransactionIssue {
  return {
    severity: options.severity ?? "error",
    code,
    path: options.path ?? "",
    textBlockId: options.textBlockId,
    inlineId: options.inlineId,
    message,
  }
}

function issuesFromUnknownError(error: unknown): VNextTextTransactionIssue[] {
  if (error instanceof DocumentAssertionError) {
    return error.issues.map((documentIssue) => issue("document-invalid", documentIssue.message, {
      path: documentIssue.path,
    }))
  }

  if (error instanceof Error) {
    return [issue("unexpected-error", error.message)]
  }

  return [issue("unexpected-error", "unknown text transaction error")]
}

function graphOrFailure(command: VNextTextTransactionCommand, document: DocumentNode): RelationshipGraph | VNextTextTransactionResult {
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

function sectionForNode(document: DocumentNode, graph: RelationshipGraph, nodeId: NodeId): DocumentSection | null {
  const sectionId = graph.sectionByNodeId.get(nodeId)
  if (sectionId == null) return null
  return document.document.sections.find((section) => section.id === sectionId) ?? null
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

function commandTextBlockId(command: VNextTextTransactionCommand): NodeId {
  if (command.kind === "text.insert" || command.kind === "inline.field-ref.insert") {
    return command.position.textBlockId
  }

  return command.range.textBlockId
}

function targetTextBlock(
  command: VNextTextTransactionCommand,
  document: DocumentNode,
  graph: RelationshipGraph,
): TextBlockNode | VNextTextTransactionResult {
  const textBlockId = commandTextBlockId(command)
  const node = graph.nodesById.get(textBlockId)

  if (node == null) {
    return {
      ok: false,
      command,
      document,
      reason: "target-not-found",
      issues: [issue("target-not-found", `text-block "${textBlockId}" was not found`, { textBlockId })],
    }
  }

  if (node.type !== "text-block") {
    return {
      ok: false,
      command,
      document,
      reason: "unsupported-target",
      issues: [issue("not-text-block", `text transaction requires a text-block target; got ${node.type}`, {
        textBlockId,
      })],
    }
  }

  return node
}

function validateOffset(
  offset: number,
  projection: VNextTextBlockProjection,
  path: string,
): VNextTextTransactionIssue | null {
  if (!Number.isInteger(offset)) {
    return issue("invalid-offset", "text offset must be an integer", { path, textBlockId: projection.textBlockId })
  }

  if (offset < 0 || offset > projection.textLength) {
    return issue(
      "offset-out-of-range",
      `text offset must be between 0 and ${projection.textLength}`,
      { path, textBlockId: projection.textBlockId },
    )
  }

  return null
}

function validateRange(
  range: VNextTextRange,
  projection: VNextTextBlockProjection,
): VNextTextTransactionIssue | null {
  if (range.textBlockId !== projection.textBlockId) {
    return issue("range-target-mismatch", "text range target does not match the resolved text-block", {
      path: "range.textBlockId",
      textBlockId: range.textBlockId,
    })
  }

  return validateOffset(range.anchorOffset, projection, "range.anchorOffset")
    ?? validateOffset(range.focusOffset, projection, "range.focusOffset")
}

function intersectedAtomicSegment(
  range: VNextNormalizedTextRange,
  projection: VNextTextBlockProjection,
): VNextInlineProjectionSegment | null {
  return projection.segments.find((segment) => {
    if (segment.editable) return false
    return range.startOffset < segment.endOffset && range.endOffset > segment.startOffset
  }) ?? null
}

function collectInlineIds(children: readonly InlineNode[]): Set<NodeId> {
  return new Set(children.map((child) => child.id))
}

function uniqueInlineId(baseId: NodeId, usedIds: Set<NodeId>): NodeId {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId)
    return baseId
  }

  let suffix = 2
  while (usedIds.has(`${baseId}-${suffix}`)) {
    suffix += 1
  }

  const id = `${baseId}-${suffix}`
  usedIds.add(id)
  return id
}

function textStyleAtOffset(children: readonly InlineNode[], projection: VNextTextBlockProjection, offset: number) {
  const containing = projection.segments.find((segment) => (
    segment.editable
    && segment.startOffset <= offset
    && segment.endOffset >= offset
    && segment.length > 0
  ))
  if (containing != null) {
    const inline = children[containing.inlineIndex]
    return inline?.type === "text" && inline.style != null ? cloneJson(inline.style) : undefined
  }

  const previous = [...projection.segments].reverse().find((segment) => segment.editable && segment.endOffset <= offset)
  if (previous != null) {
    const inline = children[previous.inlineIndex]
    return inline?.type === "text" && inline.style != null ? cloneJson(inline.style) : undefined
  }

  const next = projection.segments.find((segment) => segment.editable && segment.startOffset >= offset)
  if (next != null) {
    const inline = children[next.inlineIndex]
    return inline?.type === "text" && inline.style != null ? cloneJson(inline.style) : undefined
  }

  return undefined
}

function createTextInline(
  textBlock: TextBlockNode,
  text: string,
  offset: number,
  inlineId?: NodeId,
): InlineNode {
  const usedIds = collectInlineIds(textBlock.children)
  const id = inlineId ?? uniqueInlineId(`${textBlock.id}-inline-${textBlock.children.length + 1}`, usedIds)
  const style = textStyleAtOffset(textBlock.children, projectVNextTextBlockInlines(textBlock), offset)

  return {
    id,
    type: "text",
    text,
    ...(style == null ? {} : { style }),
  }
}

function duplicateInlineIdIssue(
  textBlock: TextBlockNode,
  inlineId: NodeId,
): VNextTextTransactionIssue | null {
  if (!collectInlineIds(textBlock.children).has(inlineId)) return null

  return issue("duplicate-inline-id", `inline id "${inlineId}" already exists in text-block "${textBlock.id}"`, {
    textBlockId: textBlock.id,
    inlineId,
  })
}

function insertInlineAtOffset(
  children: readonly InlineNode[],
  offset: number,
  inline: InlineNode,
): InlineNode[] {
  const projection = projectVNextTextBlockInlines({
    id: "projection",
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: children.map((child) => cloneJson(child)),
  })
  const usedIds = collectInlineIds(children)
  usedIds.add(inline.id)
  const nextChildren: InlineNode[] = []
  let inserted = false

  children.forEach((child, index) => {
    const segment = projection.segments[index]
    if (segment == null) {
      nextChildren.push(cloneJson(child))
      return
    }

    if (!inserted && offset === segment.startOffset) {
      nextChildren.push(cloneJson(inline))
      nextChildren.push(cloneJson(child))
      inserted = true
      return
    }

    if (!inserted && child.type === "text" && offset > segment.startOffset && offset < segment.endOffset) {
      const localOffset = offset - segment.startOffset
      const before = child.text.slice(0, localOffset)
      const after = child.text.slice(localOffset)

      if (before.length > 0) {
        nextChildren.push({ ...cloneJson(child), text: before })
      }

      nextChildren.push(cloneJson(inline))
      inserted = true

      if (after.length > 0) {
        const afterId = before.length > 0 ? uniqueInlineId(`${child.id}-after`, usedIds) : child.id
        nextChildren.push({ ...cloneJson(child), id: afterId, text: after })
      }

      return
    }

    if (!inserted && offset === segment.endOffset) {
      nextChildren.push(cloneJson(child))
      nextChildren.push(cloneJson(inline))
      inserted = true
      return
    }

    nextChildren.push(cloneJson(child))
  })

  if (!inserted) {
    nextChildren.push(cloneJson(inline))
  }

  return nextChildren
}

function deleteTextRange(
  children: readonly InlineNode[],
  range: VNextNormalizedTextRange,
): InlineNode[] {
  const projection = projectVNextTextBlockInlines({
    id: range.textBlockId,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: children.map((child) => cloneJson(child)),
  })
  const usedIds = collectInlineIds(children)
  const nextChildren: InlineNode[] = []

  children.forEach((child, index) => {
    const segment = projection.segments[index]
    if (segment == null) return

    if (child.type !== "text") {
      nextChildren.push(cloneJson(child))
      return
    }

    const overlapStart = Math.max(range.startOffset, segment.startOffset)
    const overlapEnd = Math.min(range.endOffset, segment.endOffset)

    if (overlapStart >= overlapEnd) {
      nextChildren.push(cloneJson(child))
      return
    }

    const localStart = overlapStart - segment.startOffset
    const localEnd = overlapEnd - segment.startOffset
    const before = child.text.slice(0, localStart)
    const after = child.text.slice(localEnd)

    if (before.length > 0) {
      nextChildren.push({ ...cloneJson(child), text: before })
    }

    if (after.length > 0) {
      const afterId = before.length > 0 ? uniqueInlineId(`${child.id}-after`, usedIds) : child.id
      nextChildren.push({ ...cloneJson(child), id: afterId, text: after })
    }
  })

  return nextChildren
}

function mutableTextBlock(
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlockId: NodeId,
): TextBlockNode | null {
  const section = sectionForNode(document, graph, textBlockId)
  const node = section?.nodes[textBlockId]
  return node?.type === "text-block" ? node : null
}

function dirtyScopeForTextBlock(graph: RelationshipGraph, textBlockId: NodeId): VNextTextTransactionDirtyScope {
  const sectionId = graph.sectionByNodeId.get(textBlockId) ?? ""
  const zoneId = graph.zoneByNodeId.get(textBlockId) ?? ""
  const parent = graph.parentByNodeId.get(textBlockId)
  const parentId = parent == null ? null : parentNodeId(parent)

  return {
    kind: "text-block",
    sectionId,
    zoneId,
    textBlockId,
    parentNodeIds: parentId == null ? [] : [parentId],
  }
}

function historyIntentFor(command: VNextTextTransactionCommand, textBlockId: NodeId): VNextTextTransactionHistoryIntent {
  const summary =
    command.kind === "text.insert" ? `insert text into ${textBlockId}` :
    command.kind === "text.delete" ? `delete text from ${textBlockId}` :
    command.kind === "text.range.replace" ? `replace text range in ${textBlockId}` :
    `insert field-ref into ${textBlockId}`

  return {
    kind: "text-edit",
    durableIntent: "content",
    mergeKey: `text-block:${textBlockId}`,
    coalesce: command.kind === "text.insert" ? "typing-session" : "single-entry",
    summary,
  }
}

function success(
  command: VNextTextTransactionCommand,
  originalDocument: DocumentNode,
  mutatedDocument: DocumentNode,
  originalGraph: RelationshipGraph,
  textBlockId: NodeId,
): VNextTextTransactionResult {
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

  const textBlock = mutableTextBlock(mutatedDocument, originalGraph, textBlockId)
  if (textBlock == null) {
    return {
      ok: false,
      command,
      document: originalDocument,
      reason: "validation-failed",
      issues: [issue("missing-text-block", `text-block "${textBlockId}" could not be resolved after mutation`, { textBlockId })],
    }
  }

  return {
    ok: true,
    command,
    document: mutatedDocument,
    transaction: {
      kind: command.kind,
      source: command.source ?? "user",
      targetTextBlockId: textBlockId,
      dirtyScope: dirtyScopeForTextBlock(originalGraph, textBlockId),
      historyIntent: historyIntentFor(command, textBlockId),
      projection: projectVNextTextBlockInlines(textBlock),
    },
    issues: [],
  }
}

function applyTextInsert(
  command: Extract<VNextTextTransactionCommand, { kind: "text.insert" }>,
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlock: TextBlockNode,
  projection: VNextTextBlockProjection,
): VNextTextTransactionResult {
  if (command.text.length === 0) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-command",
      issues: [issue("empty-text", "text.insert requires non-empty text", { textBlockId: textBlock.id })],
    }
  }

  const offsetIssue = validateOffset(command.position.offset, projection, "position.offset")
  if (offsetIssue != null) {
    return { ok: false, command, document, reason: "invalid-command", issues: [offsetIssue] }
  }

  if (command.inlineId != null) {
    const duplicateIssue = duplicateInlineIdIssue(textBlock, command.inlineId)
    if (duplicateIssue != null) {
      return { ok: false, command, document, reason: "invalid-command", issues: [duplicateIssue] }
    }
  }

  const mutated = cloneJson(document)
  const mutatedTextBlock = mutableTextBlock(mutated, graph, textBlock.id)
  if (mutatedTextBlock == null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-document",
      issues: [issue("missing-text-block", `text-block "${textBlock.id}" could not be resolved`, { textBlockId: textBlock.id })],
    }
  }

  const inline = createTextInline(textBlock, command.text, command.position.offset, command.inlineId)
  mutatedTextBlock.children = insertInlineAtOffset(mutatedTextBlock.children, command.position.offset, inline)

  return success(command, document, mutated, graph, textBlock.id)
}

function applyTextDelete(
  command: Extract<VNextTextTransactionCommand, { kind: "text.delete" }>,
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlock: TextBlockNode,
  projection: VNextTextBlockProjection,
): VNextTextTransactionResult {
  const rangeIssue = validateRange(command.range, projection)
  if (rangeIssue != null) {
    return { ok: false, command, document, reason: "invalid-command", issues: [rangeIssue] }
  }

  const range = normalizeVNextTextRange(command.range)
  if (range.collapsed) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-command",
      issues: [issue("empty-range", "text.delete requires a non-empty range", { textBlockId: textBlock.id })],
    }
  }

  const atomic = intersectedAtomicSegment(range, projection)
  if (atomic != null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-command",
      issues: [issue("atomic-inline-range", "plain text deletion cannot edit or remove atomic inline nodes", {
        textBlockId: textBlock.id,
        inlineId: atomic.inlineId,
      })],
    }
  }

  const mutated = cloneJson(document)
  const mutatedTextBlock = mutableTextBlock(mutated, graph, textBlock.id)
  if (mutatedTextBlock == null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-document",
      issues: [issue("missing-text-block", `text-block "${textBlock.id}" could not be resolved`, { textBlockId: textBlock.id })],
    }
  }

  mutatedTextBlock.children = deleteTextRange(mutatedTextBlock.children, range)

  return success(command, document, mutated, graph, textBlock.id)
}

function applyTextRangeReplace(
  command: Extract<VNextTextTransactionCommand, { kind: "text.range.replace" }>,
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlock: TextBlockNode,
  projection: VNextTextBlockProjection,
): VNextTextTransactionResult {
  const rangeIssue = validateRange(command.range, projection)
  if (rangeIssue != null) {
    return { ok: false, command, document, reason: "invalid-command", issues: [rangeIssue] }
  }

  const range = normalizeVNextTextRange(command.range)
  const atomic = intersectedAtomicSegment(range, projection)
  if (atomic != null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-command",
      issues: [issue("atomic-inline-range", "plain text replacement cannot edit or remove atomic inline nodes", {
        textBlockId: textBlock.id,
        inlineId: atomic.inlineId,
      })],
    }
  }

  if (command.inlineId != null) {
    const duplicateIssue = duplicateInlineIdIssue(textBlock, command.inlineId)
    if (duplicateIssue != null) {
      return { ok: false, command, document, reason: "invalid-command", issues: [duplicateIssue] }
    }
  }

  const mutated = cloneJson(document)
  const mutatedTextBlock = mutableTextBlock(mutated, graph, textBlock.id)
  if (mutatedTextBlock == null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-document",
      issues: [issue("missing-text-block", `text-block "${textBlock.id}" could not be resolved`, { textBlockId: textBlock.id })],
    }
  }

  mutatedTextBlock.children = deleteTextRange(mutatedTextBlock.children, range)
  if (command.text.length > 0) {
    const afterDeleteTextBlock = { ...textBlock, children: mutatedTextBlock.children }
    const inline = createTextInline(afterDeleteTextBlock, command.text, range.startOffset, command.inlineId)
    mutatedTextBlock.children = insertInlineAtOffset(mutatedTextBlock.children, range.startOffset, inline)
  }

  return success(command, document, mutated, graph, textBlock.id)
}

function applyFieldRefInsert(
  command: Extract<VNextTextTransactionCommand, { kind: "inline.field-ref.insert" }>,
  document: DocumentNode,
  graph: RelationshipGraph,
  textBlock: TextBlockNode,
  projection: VNextTextBlockProjection,
): VNextTextTransactionResult {
  const offsetIssue = validateOffset(command.position.offset, projection, "position.offset")
  if (offsetIssue != null) {
    return { ok: false, command, document, reason: "invalid-command", issues: [offsetIssue] }
  }

  const duplicateIssue = duplicateInlineIdIssue(textBlock, command.fieldRef.id)
  if (duplicateIssue != null) {
    return { ok: false, command, document, reason: "invalid-command", issues: [duplicateIssue] }
  }

  const mutated = cloneJson(document)
  const mutatedTextBlock = mutableTextBlock(mutated, graph, textBlock.id)
  if (mutatedTextBlock == null) {
    return {
      ok: false,
      command,
      document,
      reason: "invalid-document",
      issues: [issue("missing-text-block", `text-block "${textBlock.id}" could not be resolved`, { textBlockId: textBlock.id })],
    }
  }

  mutatedTextBlock.children = insertInlineAtOffset(
    mutatedTextBlock.children,
    command.position.offset,
    cloneJson(command.fieldRef),
  )

  return success(command, document, mutated, graph, textBlock.id)
}

export function runVNextTextTransaction(
  document: DocumentNode,
  command: VNextTextTransactionCommand,
): VNextTextTransactionResult {
  const graph = graphOrFailure(command, document)
  if ("ok" in graph) return graph

  const textBlock = targetTextBlock(command, document, graph)
  if ("ok" in textBlock) return textBlock

  const projection = projectVNextTextBlockInlines(textBlock)
  if (command.kind === "text.insert") return applyTextInsert(command, document, graph, textBlock, projection)
  if (command.kind === "text.delete") return applyTextDelete(command, document, graph, textBlock, projection)
  if (command.kind === "text.range.replace") return applyTextRangeReplace(command, document, graph, textBlock, projection)
  return applyFieldRefInsert(command, document, graph, textBlock, projection)
}
