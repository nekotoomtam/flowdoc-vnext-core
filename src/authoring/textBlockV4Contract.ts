import type { FieldRegistryV1V3 } from "../persistence/packageV3.js"
import type { ZoneRoleV4Target } from "../schema/documentV4Foundation.js"
import {
  TextBlockNodeV4TargetSchema,
  type InlineNodeV4Target,
  type TextBlockNodeV4Target,
} from "../schema/documentV4ImageTarget.js"
import { isVNextSafeUtf16TextOffset } from "./utf16Offsets.js"

export const VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE = "vnext-text-block-v4-authoring-contract"
export const VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION = 1 as const
export const VNEXT_TEXT_BLOCK_V4_ATOMIC_INLINE_TEXT = "\uFFFC"

export type VNextTextBlockV4Affinity = "backward" | "forward"

export interface VNextTextBlockV4Anchor {
  textBlockId: string
  inlineId: string | null
  offset: number
  affinity: VNextTextBlockV4Affinity
}

export interface VNextTextBlockV4Selection {
  textBlockId: string
  anchor: VNextTextBlockV4Anchor
  focus: VNextTextBlockV4Anchor
  collapsed: boolean
}

export interface VNextTextBlockV4ProjectionSegment {
  inlineId: string
  inlineIndex: number
  inlineType: InlineNodeV4Target["type"]
  startOffset: number
  endOffset: number
  length: number
  editable: boolean
}

export interface VNextTextBlockV4Projection {
  textBlockId: string
  text: string
  textLength: number
  segments: VNextTextBlockV4ProjectionSegment[]
}

export type VNextTextBlockV4ContractIssueCode =
  | "invalid-text-block"
  | "duplicate-inline-id"
  | "missing-field-definition"
  | "field-type-not-inline-compatible"
  | "page-number-zone-invalid"
  | "selection-text-block-mismatch"
  | "empty-block-anchor-invalid"
  | "missing-inline"
  | "text-offset-invalid"
  | "atomic-offset-invalid"
  | "block-offset-invalid"

export interface VNextTextBlockV4ContractIssue {
  code: VNextTextBlockV4ContractIssueCode
  severity: "error"
  path: string
  message: string
  inlineId?: string
}

export interface VNextTextBlockV4GrammarValidation {
  source: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION
  status: "valid" | "blocked"
  textBlock: TextBlockNodeV4Target | null
  issues: VNextTextBlockV4ContractIssue[]
  summary: {
    inlineCount: number
    textCount: number
    atomicCount: number
    fieldRefCount: number
    inlineImageCount: number
    emptyBlock: boolean
    errorCount: number
  }
}

export type VNextTextBlockV4SelectionResult =
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION
      status: "valid"
      selection: VNextTextBlockV4Selection
      issues: []
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION
      status: "blocked"
      selection: null
      issues: VNextTextBlockV4ContractIssue[]
    }

const STATIC_PAGE_NUMBER_ZONE_ROLES = new Set<ZoneRoleV4Target>([
  "footer",
  "first-page-footer",
  "first-page-header",
  "header",
])

const INLINE_TEXT_FIELD_TYPES = new Set(["boolean", "date", "enum", "number", "text"])

function issue(
  code: VNextTextBlockV4ContractIssueCode,
  path: string,
  message: string,
  inlineId?: string,
): VNextTextBlockV4ContractIssue {
  return { code, severity: "error", path, message, ...(inlineId == null ? {} : { inlineId }) }
}

function inlineProjectionText(inline: InlineNodeV4Target): string {
  if (inline.type === "text") return inline.text
  if (inline.type === "line-break") return "\n"
  return VNEXT_TEXT_BLOCK_V4_ATOMIC_INLINE_TEXT
}

function inlineLength(inline: InlineNodeV4Target): number {
  return inlineProjectionText(inline).length
}

export function projectVNextTextBlockV4Inlines(textBlock: TextBlockNodeV4Target): VNextTextBlockV4Projection {
  let offset = 0
  let text = ""
  const segments = textBlock.children.map((inline, inlineIndex): VNextTextBlockV4ProjectionSegment => {
    const projected = inlineProjectionText(inline)
    const startOffset = offset
    offset += projected.length
    text += projected
    return {
      inlineId: inline.id,
      inlineIndex,
      inlineType: inline.type,
      startOffset,
      endOffset: offset,
      length: projected.length,
      editable: inline.type === "text",
    }
  })
  return { textBlockId: textBlock.id, text, textLength: offset, segments }
}

export function validateVNextTextBlockV4Grammar(
  value: unknown,
  context: { fieldContract: FieldRegistryV1V3; zoneRole: ZoneRoleV4Target },
): VNextTextBlockV4GrammarValidation {
  const parsed = TextBlockNodeV4TargetSchema.safeParse(value)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((item) => issue(
      "invalid-text-block",
      item.path.reduce<string>((path, segment) => path === "" ? String(segment) : `${path}.${String(segment)}`, ""),
      item.message,
    ))
    return {
      source: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION,
      status: "blocked",
      textBlock: null,
      issues,
      summary: {
        inlineCount: 0, textCount: 0, atomicCount: 0, fieldRefCount: 0,
        inlineImageCount: 0, emptyBlock: false, errorCount: issues.length,
      },
    }
  }

  const textBlock = parsed.data
  const issues: VNextTextBlockV4ContractIssue[] = []
  const ids = new Set<string>()
  let textCount = 0
  let fieldRefCount = 0
  let inlineImageCount = 0

  textBlock.children.forEach((inline, index) => {
    const path = `children[${index}]`
    if (ids.has(inline.id)) issues.push(issue(
      "duplicate-inline-id",
      `${path}.id`,
      `inline id "${inline.id}" is duplicated within text-block "${textBlock.id}"`,
      inline.id,
    ))
    ids.add(inline.id)
    if (inline.type === "text") textCount += 1
    if (inline.type === "inline-image") inlineImageCount += 1
    if (inline.type === "field-ref") {
      fieldRefCount += 1
      const field = context.fieldContract.fields[inline.key]
      if (field == null) issues.push(issue(
        "missing-field-definition",
        `${path}.key`,
        `field-ref key "${inline.key}" is missing from the published field contract`,
        inline.id,
      ))
      else if (!INLINE_TEXT_FIELD_TYPES.has(field.type)) issues.push(issue(
        "field-type-not-inline-compatible",
        `${path}.key`,
        `field-ref key "${inline.key}" has ${field.type} type and cannot use inline text placement`,
        inline.id,
      ))
    }
    if (inline.type === "page-number" && !STATIC_PAGE_NUMBER_ZONE_ROLES.has(context.zoneRole)) {
      issues.push(issue(
        "page-number-zone-invalid",
        path,
        `page-number is not allowed in ${context.zoneRole} zones`,
        inline.id,
      ))
    }
  })

  const atomicCount = textBlock.children.length - textCount
  return {
    source: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION,
    status: issues.length === 0 ? "valid" : "blocked",
    textBlock,
    issues,
    summary: {
      inlineCount: textBlock.children.length,
      textCount,
      atomicCount,
      fieldRefCount,
      inlineImageCount,
      emptyBlock: textBlock.children.length === 0,
      errorCount: issues.length,
    },
  }
}

function validateAnchor(
  textBlock: TextBlockNodeV4Target,
  anchor: VNextTextBlockV4Anchor,
  path: "anchor" | "focus",
): VNextTextBlockV4ContractIssue[] {
  if (anchor.textBlockId !== textBlock.id) return [issue(
    "selection-text-block-mismatch", `${path}.textBlockId`,
    `selection ${path} must target text-block "${textBlock.id}"`,
  )]
  if (textBlock.children.length === 0) {
    return anchor.inlineId === null && anchor.offset === 0
      ? []
      : [issue(
          "empty-block-anchor-invalid", path,
          "an empty text-block anchor requires inlineId null and offset 0",
        )]
  }
  if (anchor.inlineId == null) return [issue(
    "missing-inline", `${path}.inlineId`, "a non-empty text-block anchor requires an inline id",
  )]
  const inline = textBlock.children.find((candidate) => candidate.id === anchor.inlineId)
  if (inline == null) return [issue(
    "missing-inline", `${path}.inlineId`, `selection references missing inline "${anchor.inlineId}"`, anchor.inlineId,
  )]
  if (inline.type === "text") {
    return isVNextSafeUtf16TextOffset(inline.text, anchor.offset)
      ? []
      : [issue(
          "text-offset-invalid", `${path}.offset`,
          `text offset must be a safe UTF-16 boundary from 0 to ${inline.text.length}`,
          inline.id,
        )]
  }
  return anchor.offset === 0 || anchor.offset === 1
    ? []
    : [issue(
        "atomic-offset-invalid", `${path}.offset`,
        "atomic inline offset must be 0 (before) or 1 (after)", inline.id,
      )]
}

export function validateVNextTextBlockV4Selection(
  textBlock: TextBlockNodeV4Target,
  anchor: VNextTextBlockV4Anchor,
  focus: VNextTextBlockV4Anchor = anchor,
): VNextTextBlockV4SelectionResult {
  const samePosition = anchor.textBlockId === focus.textBlockId
    && anchor.inlineId === focus.inlineId
    && anchor.offset === focus.offset
  const issues = [
    ...validateAnchor(textBlock, anchor, "anchor"),
    ...(samePosition ? [] : validateAnchor(textBlock, focus, "focus")),
  ]
  if (issues.length > 0) return {
    source: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION,
    status: "blocked",
    selection: null,
    issues,
  }
  return {
    source: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_V4_AUTHORING_CONTRACT_VERSION,
    status: "valid",
    selection: {
      textBlockId: textBlock.id,
      anchor: { ...anchor },
      focus: { ...focus },
      collapsed: anchor.inlineId === focus.inlineId && anchor.offset === focus.offset,
    },
    issues: [],
  }
}

export function vNextTextBlockV4AnchorFromBlockOffset(
  textBlock: TextBlockNodeV4Target,
  blockOffset: number,
  affinity: VNextTextBlockV4Affinity,
): VNextTextBlockV4Anchor | null {
  const projection = projectVNextTextBlockV4Inlines(textBlock)
  if (!Number.isInteger(blockOffset) || blockOffset < 0 || blockOffset > projection.textLength) return null
  if (textBlock.children.length === 0) return blockOffset === 0
    ? { textBlockId: textBlock.id, inlineId: null, offset: 0, affinity }
    : null

  if (blockOffset === projection.textLength) {
    const inline = textBlock.children[textBlock.children.length - 1]
    return { textBlockId: textBlock.id, inlineId: inline.id, offset: inlineLength(inline), affinity }
  }

  const segmentIndex = projection.segments.findIndex((segment) => blockOffset < segment.endOffset)
  if (segmentIndex < 0) return null
  const segment = projection.segments[segmentIndex]
  if (blockOffset === segment.startOffset && segmentIndex > 0 && affinity === "backward") {
    const previous = textBlock.children[segmentIndex - 1]
    return { textBlockId: textBlock.id, inlineId: previous.id, offset: inlineLength(previous), affinity }
  }
  const inline = textBlock.children[segmentIndex]
  const localOffset = blockOffset - segment.startOffset
  if (inline.type === "text" && !isVNextSafeUtf16TextOffset(inline.text, localOffset)) return null
  return { textBlockId: textBlock.id, inlineId: inline.id, offset: localOffset, affinity }
}
