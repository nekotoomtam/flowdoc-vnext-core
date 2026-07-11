import type { FieldRegistry } from "../persistence/package.js"
import {
  InlineNodeSchema,
  type InlineNode,
  type TextBlockNode,
  type ZoneRole,
} from "../schema/document.js"
import { isVNextSafeUtf16TextOffset } from "./utf16Offsets.js"

export const VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE = "vnext-text-block-v1-grammar"
export const VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE = "target-grammar-validation-and-normalization"
export const VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION = 1

export type VNextTextBlockV1GrammarStatus = "blocked" | "normalization-required" | "valid"

export type VNextTextBlockV1GrammarIssueCode =
  | "duplicate-inline-id"
  | "empty-text"
  | "field-type-not-inline-compatible"
  | "invalid-inline-child"
  | "missing-field-definition"
  | "page-number-zone-invalid"
  | "raw-line-break"
  | "unpaired-surrogate"

export interface VNextTextBlockV1GrammarIssue {
  code: VNextTextBlockV1GrammarIssueCode
  inlineId?: string
  message: string
  path: string
  severity: "error" | "warning"
}

export interface VNextTextBlockV1GrammarContext {
  fieldRegistry?: FieldRegistry
  zoneRole: ZoneRole
}

export interface VNextTextBlockV1GrammarSummary {
  errorCount: number
  fieldReferenceCount: number
  inlineCount: number
  normalizationCount: number
  pageNumberCount: number
  warningCount: number
}

export interface VNextTextBlockV1GrammarValidation {
  source: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE
  mode: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE
  grammarVersion: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION
  textBlockId: string
  zoneRole: ZoneRole
  status: VNextTextBlockV1GrammarStatus
  issues: VNextTextBlockV1GrammarIssue[]
  summary: VNextTextBlockV1GrammarSummary
}

export interface VNextTextBlockV1NormalizationChange {
  kind: "remove-empty-text" | "split-raw-line-break"
  producedInlineIds: string[]
  sourceInlineId: string
}

export interface VNextTextBlockV1NormalizationPlan {
  source: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE
  mode: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE
  grammarVersion: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION
  status: "blocked" | "not-required" | "ready"
  textBlockId: string
  validation: VNextTextBlockV1GrammarValidation
  changes: VNextTextBlockV1NormalizationChange[]
  normalizedTextBlock: TextBlockNode | null
  contracts: {
    deterministicIds: true
    packageMutation: false
    sourceMutation: false
    storageWrites: false
  }
}

export interface VNextTextBlockV1NormalizationApplyResult {
  source: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE
  mode: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE
  grammarVersion: typeof VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION
  status: "applied" | "blocked" | "not-required"
  textBlockId: string
  changes: VNextTextBlockV1NormalizationChange[]
  issues: VNextTextBlockV1GrammarIssue[]
  textBlock: TextBlockNode | null
}

const STATIC_PAGE_NUMBER_ZONE_ROLES = new Set<ZoneRole>([
  "footer",
  "first-page-footer",
  "first-page-header",
  "header",
])

const INLINE_TEXT_FIELD_TYPES = new Set([
  "boolean",
  "date",
  "enum",
  "number",
  "text",
])

const RAW_LINE_BREAK_PATTERN = /\r\n|\r|\n/gu

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: VNextTextBlockV1GrammarIssueCode,
  message: string,
  path: string,
  options: { inlineId?: string; severity?: VNextTextBlockV1GrammarIssue["severity"] } = {},
): VNextTextBlockV1GrammarIssue {
  return {
    code,
    inlineId: options.inlineId,
    message,
    path,
    severity: options.severity ?? "error",
  }
}

function rawLineBreakCount(text: string): number {
  return [...text.matchAll(RAW_LINE_BREAK_PATTERN)].length
}

function hasUnpairedSurrogate(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const current = text.charCodeAt(index)

    if (current >= 0xD800 && current <= 0xDBFF) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true
      index += 1
      continue
    }

    if (current >= 0xDC00 && current <= 0xDFFF) return true
  }

  return false
}

export function isVNextTextBlockV1SafeTextOffset(text: string, offset: number): boolean {
  return isVNextSafeUtf16TextOffset(text, offset)
}

function grammarStatus(issues: readonly VNextTextBlockV1GrammarIssue[]): VNextTextBlockV1GrammarStatus {
  if (issues.some((candidate) => candidate.severity === "error")) return "blocked"
  if (issues.length > 0) return "normalization-required"
  return "valid"
}

export function validateVNextTextBlockV1Grammar(
  textBlock: TextBlockNode,
  context: VNextTextBlockV1GrammarContext,
): VNextTextBlockV1GrammarValidation {
  const issues: VNextTextBlockV1GrammarIssue[] = []
  const ids = new Set<string>()
  let fieldReferenceCount = 0
  let normalizationCount = 0
  let pageNumberCount = 0

  ;(textBlock.children as readonly unknown[]).forEach((candidate, index) => {
    const path = `children[${index}]`
    const parsed = InlineNodeSchema.safeParse(candidate)
    if (!parsed.success) {
      issues.push(issue(
        "invalid-inline-child",
        "inline child must match the current canonical inline schema before v1 target validation",
        path,
        {
          inlineId: typeof candidate === "object"
            && candidate !== null
            && "id" in candidate
            && typeof candidate.id === "string"
            ? candidate.id
            : undefined,
        },
      ))
      return
    }

    const child = parsed.data
    if (ids.has(child.id)) {
      issues.push(issue(
        "duplicate-inline-id",
        `inline id "${child.id}" is duplicated within text-block "${textBlock.id}"`,
        `${path}.id`,
        { inlineId: child.id },
      ))
    }
    ids.add(child.id)

    if (child.type === "text") {
      if (child.text.length === 0) {
        normalizationCount += 1
        issues.push(issue(
          "empty-text",
          "target Text-block v1 grammar removes empty text leaves",
          `${path}.text`,
          { inlineId: child.id, severity: "warning" },
        ))
      }

      const breakCount = rawLineBreakCount(child.text)
      if (breakCount > 0) {
        normalizationCount += 1
        issues.push(issue(
          "raw-line-break",
          "target Text-block v1 grammar represents CR/LF as explicit line-break children",
          `${path}.text`,
          { inlineId: child.id, severity: "warning" },
        ))
      }

      if (hasUnpairedSurrogate(child.text)) {
        issues.push(issue(
          "unpaired-surrogate",
          "text leaf contains an unpaired UTF-16 surrogate and cannot be normalized safely",
          `${path}.text`,
          { inlineId: child.id },
        ))
      }
      return
    }

    if (child.type === "field-ref") {
      fieldReferenceCount += 1
      if (context.fieldRegistry) {
        const field = context.fieldRegistry.fields[child.key]
        if (field == null) {
          issues.push(issue(
            "missing-field-definition",
            `field-ref key "${child.key}" is missing from the provided field registry`,
            `${path}.key`,
            { inlineId: child.id },
          ))
        } else if (!INLINE_TEXT_FIELD_TYPES.has(field.type)) {
          issues.push(issue(
            "field-type-not-inline-compatible",
            `field-ref key "${child.key}" has ${field.type} type and cannot use inline text placement`,
            `${path}.key`,
            { inlineId: child.id },
          ))
        }
      }
      return
    }

    if (child.type === "page-number") {
      pageNumberCount += 1
      if (!STATIC_PAGE_NUMBER_ZONE_ROLES.has(context.zoneRole)) {
        issues.push(issue(
          "page-number-zone-invalid",
          `page-number is not allowed in ${context.zoneRole} zones by the target Text-block v1 grammar`,
          path,
          { inlineId: child.id },
        ))
      }
    }
  })

  const status = grammarStatus(issues)
  return {
    source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
    mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
    grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
    textBlockId: textBlock.id,
    zoneRole: context.zoneRole,
    status,
    issues,
    summary: {
      errorCount: issues.filter((candidate) => candidate.severity === "error").length,
      fieldReferenceCount,
      inlineCount: textBlock.children.length,
      normalizationCount,
      pageNumberCount,
      warningCount: issues.filter((candidate) => candidate.severity === "warning").length,
    },
  }
}

function uniqueInlineId(baseId: string, usedIds: Set<string>): string {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId)
    return baseId
  }

  let suffix = 2
  while (usedIds.has(`${baseId}-${suffix}`)) suffix += 1
  const id = `${baseId}-${suffix}`
  usedIds.add(id)
  return id
}

function normalizedTextChildren(
  child: Extract<InlineNode, { type: "text" }>,
  usedIds: Set<string>,
): { children: InlineNode[]; change: VNextTextBlockV1NormalizationChange | null } {
  if (child.text.length === 0) {
    return {
      children: [],
      change: {
        kind: "remove-empty-text",
        producedInlineIds: [],
        sourceInlineId: child.id,
      },
    }
  }

  const matches = [...child.text.matchAll(RAW_LINE_BREAK_PATTERN)]
  if (matches.length === 0) {
    return { children: [cloneJson(child)], change: null }
  }

  const children: InlineNode[] = []
  let cursor = 0
  let firstTextRetained = false
  let textPartIndex = 0

  const appendText = (text: string): void => {
    if (text.length === 0) return
    textPartIndex += 1
    const id = firstTextRetained
      ? uniqueInlineId(`${child.id}-after-${textPartIndex - 1}`, usedIds)
      : child.id
    firstTextRetained = true
    children.push({
      ...cloneJson(child),
      id,
      text,
    })
  }

  matches.forEach((match, breakIndex) => {
    const matchIndex = match.index ?? cursor
    appendText(child.text.slice(cursor, matchIndex))
    children.push({
      id: uniqueInlineId(`${child.id}-break-${breakIndex + 1}`, usedIds),
      type: "line-break",
    })
    cursor = matchIndex + match[0].length
  })
  appendText(child.text.slice(cursor))

  return {
    children,
    change: {
      kind: "split-raw-line-break",
      producedInlineIds: children.map((candidate) => candidate.id),
      sourceInlineId: child.id,
    },
  }
}

export function planVNextTextBlockV1Normalization(
  textBlock: TextBlockNode,
  context: VNextTextBlockV1GrammarContext,
): VNextTextBlockV1NormalizationPlan {
  const validation = validateVNextTextBlockV1Grammar(textBlock, context)
  const contracts = {
    deterministicIds: true as const,
    packageMutation: false as const,
    sourceMutation: false as const,
    storageWrites: false as const,
  }

  if (validation.status === "blocked") {
    return {
      source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
      mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
      grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
      status: "blocked",
      textBlockId: textBlock.id,
      validation,
      changes: [],
      normalizedTextBlock: null,
      contracts,
    }
  }

  if (validation.status === "valid") {
    return {
      source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
      mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
      grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
      status: "not-required",
      textBlockId: textBlock.id,
      validation,
      changes: [],
      normalizedTextBlock: cloneJson(textBlock),
      contracts,
    }
  }

  const usedIds = new Set(textBlock.children.map((child) => child.id))
  const changes: VNextTextBlockV1NormalizationChange[] = []
  const children = textBlock.children.flatMap((child): InlineNode[] => {
    if (child.type !== "text") return [cloneJson(child)]
    const normalized = normalizedTextChildren(child, usedIds)
    if (normalized.change) changes.push(normalized.change)
    return normalized.children
  })

  return {
    source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
    mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
    grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
    status: "ready",
    textBlockId: textBlock.id,
    validation,
    changes,
    normalizedTextBlock: {
      ...cloneJson(textBlock),
      children,
    },
    contracts,
  }
}

export function applyVNextTextBlockV1Normalization(
  plan: VNextTextBlockV1NormalizationPlan,
): VNextTextBlockV1NormalizationApplyResult {
  if (plan.status === "blocked" || plan.normalizedTextBlock == null) {
    return {
      source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
      mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
      grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
      status: "blocked",
      textBlockId: plan.textBlockId,
      changes: [],
      issues: cloneJson(plan.validation.issues),
      textBlock: null,
    }
  }

  return {
    source: VNEXT_TEXT_BLOCK_V1_GRAMMAR_SOURCE,
    mode: VNEXT_TEXT_BLOCK_V1_GRAMMAR_MODE,
    grammarVersion: VNEXT_TEXT_BLOCK_V1_GRAMMAR_VERSION,
    status: plan.status === "ready" ? "applied" : "not-required",
    textBlockId: plan.textBlockId,
    changes: cloneJson(plan.changes),
    issues: cloneJson(plan.validation.issues),
    textBlock: cloneJson(plan.normalizedTextBlock),
  }
}
