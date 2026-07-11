import type { FieldRegistryV1V3 } from "../persistence/packageV3.js"
import type { ZoneRoleV4Target } from "../schema/documentV4Foundation.js"
import type {
  InlineNodeV4Target,
  TextBlockNodeV4Target,
} from "../schema/documentV4ImageTarget.js"
import {
  validateVNextTextBlockV4Grammar,
  validateVNextTextBlockV4Selection,
  type VNextTextBlockV4Anchor,
} from "./textBlockV4Contract.js"

export const VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_SOURCE = "vnext-text-block-v4-inline-command"
export const VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_VERSION = 1 as const

type FieldRefInlineV4 = Extract<InlineNodeV4Target, { type: "field-ref" }>
type LineBreakInlineV4 = Extract<InlineNodeV4Target, { type: "line-break" }>
type PageNumberInlineV4 = Extract<InlineNodeV4Target, { type: "page-number" }>
type InlineImageV4 = Extract<InlineNodeV4Target, { type: "inline-image" }>

export type VNextTextBlockV4InlineInsertCommand =
  | { kind: "field-ref.insert"; inline: FieldRefInlineV4; anchor: VNextTextBlockV4Anchor; splitRightInlineId?: string }
  | { kind: "line-break.insert"; inline: LineBreakInlineV4; anchor: VNextTextBlockV4Anchor; splitRightInlineId?: string }
  | { kind: "page-number.insert"; inline: PageNumberInlineV4; anchor: VNextTextBlockV4Anchor; splitRightInlineId?: string }
  | { kind: "inline-image.insert"; inline: InlineImageV4; anchor: VNextTextBlockV4Anchor; splitRightInlineId?: string }

export type VNextTextBlockV4InlineCommand =
  | VNextTextBlockV4InlineInsertCommand
  | { kind: "atomic.remove"; inlineId: string }

export interface VNextTextBlockV4InlineCommandIssue {
  code: string
  severity: "error"
  path: string
  message: string
  inlineId?: string
}

export interface VNextTextBlockV4InlineCommandPlan {
  source: typeof VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_SOURCE
  version: typeof VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_VERSION
  status: "planned"
  command: VNextTextBlockV4InlineCommand
  textBlockId: string
  children: InlineNodeV4Target[]
  selectionAfter: VNextTextBlockV4Anchor
  identity: {
    addedInlineIds: string[]
    removedInlineIds: string[]
    retainedInlineIds: string[]
    split: null | {
      sourceInlineId: string
      leftInlineId: string
      rightInlineId: string
    }
  }
  commitBoundary: {
    operationKind: "text-block.rich-inline.replace"
    policyPreflightRequired: true
    historyCreated: false
    documentMutation: false
  }
  issues: []
}

export interface VNextTextBlockV4InlineCommandBlocked {
  source: typeof VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_SOURCE
  version: typeof VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_VERSION
  status: "blocked"
  command: VNextTextBlockV4InlineCommand
  textBlockId: string
  children: null
  selectionAfter: null
  identity: null
  issues: VNextTextBlockV4InlineCommandIssue[]
}

export type VNextTextBlockV4InlineCommandResult =
  | VNextTextBlockV4InlineCommandPlan
  | VNextTextBlockV4InlineCommandBlocked

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function blocked(
  textBlock: TextBlockNodeV4Target,
  command: VNextTextBlockV4InlineCommand,
  issues: VNextTextBlockV4InlineCommandIssue[],
): VNextTextBlockV4InlineCommandBlocked {
  return {
    source: VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_VERSION,
    status: "blocked",
    command: clone(command),
    textBlockId: textBlock.id,
    children: null,
    selectionAfter: null,
    identity: null,
    issues,
  }
}

function issue(code: string, path: string, message: string, inlineId?: string): VNextTextBlockV4InlineCommandIssue {
  return { code, severity: "error", path, message, ...(inlineId == null ? {} : { inlineId }) }
}

function identityFacts(
  before: readonly InlineNodeV4Target[],
  after: readonly InlineNodeV4Target[],
): Pick<VNextTextBlockV4InlineCommandPlan["identity"], "addedInlineIds" | "removedInlineIds" | "retainedInlineIds"> {
  const beforeIds = new Set(before.map((inline) => inline.id))
  const afterIds = new Set(after.map((inline) => inline.id))
  return {
    addedInlineIds: after.filter((inline) => !beforeIds.has(inline.id)).map((inline) => inline.id),
    removedInlineIds: before.filter((inline) => !afterIds.has(inline.id)).map((inline) => inline.id),
    retainedInlineIds: after.filter((inline) => beforeIds.has(inline.id)).map((inline) => inline.id),
  }
}

function finalPlan(
  textBlock: TextBlockNodeV4Target,
  command: VNextTextBlockV4InlineCommand,
  children: InlineNodeV4Target[],
  selectionAfter: VNextTextBlockV4Anchor,
  split: VNextTextBlockV4InlineCommandPlan["identity"]["split"],
): VNextTextBlockV4InlineCommandPlan {
  return {
    source: VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_INLINE_COMMAND_VERSION,
    status: "planned",
    command: clone(command),
    textBlockId: textBlock.id,
    children,
    selectionAfter,
    identity: { ...identityFacts(textBlock.children, children), split },
    commitBoundary: {
      operationKind: "text-block.rich-inline.replace",
      policyPreflightRequired: true,
      historyCreated: false,
      documentMutation: false,
    },
    issues: [],
  }
}

function planInsert(
  textBlock: TextBlockNodeV4Target,
  command: VNextTextBlockV4InlineInsertCommand,
): VNextTextBlockV4InlineCommandResult {
  const selection = validateVNextTextBlockV4Selection(textBlock, command.anchor)
  if (selection.status !== "valid") return blocked(textBlock, command, selection.issues)

  const usedIds = new Set(textBlock.children.map((inline) => inline.id))
  if (usedIds.has(command.inline.id)) return blocked(textBlock, command, [issue(
    "duplicate-inline-id", "command.inline.id",
    `inline id "${command.inline.id}" already exists in text-block "${textBlock.id}"`, command.inline.id,
  )])

  const children = clone(textBlock.children)
  let insertIndex = 0
  let split: VNextTextBlockV4InlineCommandPlan["identity"]["split"] = null
  if (command.anchor.inlineId != null) {
    const index = children.findIndex((inline) => inline.id === command.anchor.inlineId)
    if (index < 0) return blocked(textBlock, command, [issue(
      "missing-inline", "command.anchor.inlineId",
      `anchor inline "${command.anchor.inlineId}" was not found`, command.anchor.inlineId,
    )])
    const target = children[index]
    if (target.type !== "text") {
      insertIndex = index + command.anchor.offset
    } else if (command.anchor.offset === 0) {
      insertIndex = index
    } else if (command.anchor.offset === target.text.length) {
      insertIndex = index + 1
    } else {
      const rightInlineId = command.splitRightInlineId
      if (rightInlineId == null || rightInlineId.trim().length === 0) return blocked(textBlock, command, [issue(
        "split-right-id-required", "command.splitRightInlineId",
        "inserting inside a text leaf requires an explicit right inline id",
        target.id,
      )])
      if (rightInlineId === command.inline.id || usedIds.has(rightInlineId)) return blocked(textBlock, command, [issue(
        "duplicate-inline-id", "command.splitRightInlineId",
        `split right inline id "${rightInlineId}" is not unique in the destination text-block`, rightInlineId,
      )])
      const left = { ...target, text: target.text.slice(0, command.anchor.offset) }
      const right = { ...target, id: rightInlineId, text: target.text.slice(command.anchor.offset) }
      children.splice(index, 1, left, right)
      insertIndex = index + 1
      split = { sourceInlineId: target.id, leftInlineId: target.id, rightInlineId }
    }
  }
  children.splice(insertIndex, 0, clone(command.inline))
  return finalPlan(
    textBlock,
    command,
    children,
    { textBlockId: textBlock.id, inlineId: command.inline.id, offset: 1, affinity: "forward" },
    split,
  )
}

function planRemove(
  textBlock: TextBlockNodeV4Target,
  command: Extract<VNextTextBlockV4InlineCommand, { kind: "atomic.remove" }>,
): VNextTextBlockV4InlineCommandResult {
  const children = clone(textBlock.children)
  const index = children.findIndex((inline) => inline.id === command.inlineId)
  if (index < 0) return blocked(textBlock, command, [issue(
    "missing-inline", "command.inlineId", `inline "${command.inlineId}" was not found`, command.inlineId,
  )])
  if (children[index].type === "text") return blocked(textBlock, command, [issue(
    "text-inline-not-atomic", "command.inlineId",
    "atomic.remove cannot remove a text leaf; text edits use the rich-inline draft transaction",
    command.inlineId,
  )])
  children.splice(index, 1)
  let selectionAfter: VNextTextBlockV4Anchor
  if (children.length === 0) {
    selectionAfter = { textBlockId: textBlock.id, inlineId: null, offset: 0, affinity: "forward" }
  } else if (index > 0) {
    const previous = children[index - 1]
    selectionAfter = {
      textBlockId: textBlock.id,
      inlineId: previous.id,
      offset: previous.type === "text" ? previous.text.length : 1,
      affinity: "backward",
    }
  } else {
    selectionAfter = { textBlockId: textBlock.id, inlineId: children[0].id, offset: 0, affinity: "forward" }
  }
  return finalPlan(textBlock, command, children, selectionAfter, null)
}

export function planVNextTextBlockV4InlineCommand(
  textBlock: TextBlockNodeV4Target,
  command: VNextTextBlockV4InlineCommand,
  context: { fieldContract: FieldRegistryV1V3; zoneRole: ZoneRoleV4Target },
): VNextTextBlockV4InlineCommandResult {
  const current = validateVNextTextBlockV4Grammar(textBlock, context)
  if (current.status !== "valid") return blocked(textBlock, command, current.issues)

  const planned = command.kind === "atomic.remove"
    ? planRemove(textBlock, command)
    : planInsert(textBlock, command)
  if (planned.status !== "planned") return planned

  const validation = validateVNextTextBlockV4Grammar({ ...textBlock, children: planned.children }, context)
  if (validation.status !== "valid") return blocked(textBlock, command, validation.issues)
  return planned
}
