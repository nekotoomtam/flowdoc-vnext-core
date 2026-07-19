import { createHash } from "node:crypto"

export const FLOWDOC_IMPORTED_TEXT_NORMALIZATION_VERSION = 1 as const
export const FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID = (
  "flowdoc-imported-soft-wrap-list-v1"
) as const

export type FlowDocImportedTextBlockKindV1 = "paragraph" | "list-item"

export interface FlowDocImportedTextBlockV1 {
  blockIndex: number
  kind: FlowDocImportedTextBlockKindV1
  marker: string | null
  text: string
  sourceLineStart: number
  sourceLineEnd: number
  softWrapJoinCount: number
}

export interface FlowDocImportedTextNormalizationSummaryV1 {
  sourceCharacterCount: number
  renderedCharacterCount: number
  sourceLineCount: number
  blockCount: number
  paragraphBlockCount: number
  listItemBlockCount: number
  softWrapJoinCount: number
  preservedBreakCount: number
  blankLineBoundaryCount: number
  changed: boolean
}

export interface FlowDocImportedTextNormalizationResultV1 {
  contractVersion: typeof FLOWDOC_IMPORTED_TEXT_NORMALIZATION_VERSION
  kind: "imported-text-normalization"
  profileId: typeof FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID
  sourceTextFingerprint: string
  renderedTextFingerprint: string
  renderedText: string
  blocks: FlowDocImportedTextBlockV1[]
  summary: FlowDocImportedTextNormalizationSummaryV1
  normalizationFingerprint: string
}

export interface FlowDocImportedTextBlockEvidenceV1 {
  blockIndex: number
  kind: FlowDocImportedTextBlockKindV1
  marker: string | null
  sourceLineStart: number
  sourceLineEnd: number
  softWrapJoinCount: number
  characterCount: number
  textFingerprint: string
}

export interface FlowDocImportedTextNormalizationEvidenceV1 {
  contractVersion: typeof FLOWDOC_IMPORTED_TEXT_NORMALIZATION_VERSION
  kind: "imported-text-normalization-evidence"
  profileId: typeof FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID
  sourceTextFingerprint: string
  renderedTextFingerprint: string
  blocks: FlowDocImportedTextBlockEvidenceV1[]
  summary: FlowDocImportedTextNormalizationSummaryV1
  normalizationFingerprint: string
}

interface MutableBlock {
  kind: FlowDocImportedTextBlockKindV1
  marker: string | null
  text: string
  sourceLineStart: number
  sourceLineEnd: number
  softWrapJoinCount: number
}

const UNORDERED_LIST_LINE = /^([-*\u2022\u2023\u25AA\u25E6])(?:[\t ]+|$)(.*)$/u
const ORDERED_LIST_LINE = /^(\d{1,4}[.)])(?:[\t ]+|$)(.*)$/u
const NO_SPACE_SCRIPT_CHARACTER = /[\u0E00-\u0EFF\u1000-\u109F\u1780-\u17FF\u3040-\u30FF\u3400-\u9FFF]/u
const OPENING_PUNCTUATION = /[(\[{<"'\u2018\u201C\u00AB]/u
const CLOSING_PUNCTUATION = /[)\]}>.,;:!?%\u00BB]/u
const DASH_CHARACTER = /[-\u2010-\u2015]/u

function fingerprint(value: unknown): string {
  const payload = typeof value === "string" ? value : JSON.stringify(value)
  return `sha256:${createHash("sha256").update(payload, "utf8").digest("hex")}`
}

function firstCharacter(value: string): string {
  return Array.from(value)[0] ?? ""
}

function lastCharacter(value: string): string {
  return Array.from(value).at(-1) ?? ""
}

function softWrapSeparator(leftSource: string, rightSource: string): string {
  if (/[^\S\r\n]$/u.test(leftSource) || /^[^\S\r\n]/u.test(rightSource)) return " "
  const left = leftSource.trimEnd()
  const right = rightSource.trimStart()
  const previous = lastCharacter(left)
  const next = firstCharacter(right)
  if (previous === "" || next === "") return ""
  if (DASH_CHARACTER.test(previous)) return ""
  if (OPENING_PUNCTUATION.test(previous) || CLOSING_PUNCTUATION.test(next)) return ""
  if (NO_SPACE_SCRIPT_CHARACTER.test(previous) && NO_SPACE_SCRIPT_CHARACTER.test(next)) return ""
  return " "
}

function listLine(line: string): { marker: string; text: string } | null {
  const trimmed = line.trim()
  const match = UNORDERED_LIST_LINE.exec(trimmed) ?? ORDERED_LIST_LINE.exec(trimmed)
  return match == null ? null : { marker: match[1], text: match[2].trim() }
}

export function normalizeFlowDocImportedTextV1(
  sourceText: string,
): FlowDocImportedTextNormalizationResultV1 {
  const canonicalText = sourceText.replace(/\r\n?/gu, "\n")
  const sourceLines = canonicalText.split("\n")
  const mutableBlocks: MutableBlock[] = []
  let current: MutableBlock | null = null
  let blankLineBoundaryCount = 0

  const flush = () => {
    if (current == null) return
    current.text = current.text.trim()
    if (current.text !== "" || current.kind === "list-item") mutableBlocks.push(current)
    current = null
  }

  sourceLines.forEach((sourceLine, sourceLineIndex) => {
    if (sourceLine.trim() === "") {
      if (current != null) {
        flush()
        blankLineBoundaryCount += 1
      }
      return
    }

    const list = listLine(sourceLine)
    if (list != null) {
      flush()
      current = {
        kind: "list-item",
        marker: list.marker,
        text: list.text,
        sourceLineStart: sourceLineIndex,
        sourceLineEnd: sourceLineIndex,
        softWrapJoinCount: 0,
      }
      return
    }

    const trimmed = sourceLine.trim()
    if (current == null) {
      current = {
        kind: "paragraph",
        marker: null,
        text: trimmed,
        sourceLineStart: sourceLineIndex,
        sourceLineEnd: sourceLineIndex,
        softWrapJoinCount: 0,
      }
      return
    }

    const separator = softWrapSeparator(current.text, sourceLine)
    current.text = `${current.text.trimEnd()}${separator}${trimmed}`
    current.sourceLineEnd = sourceLineIndex
    current.softWrapJoinCount += 1
  })
  flush()

  const blocks: FlowDocImportedTextBlockV1[] = mutableBlocks.map((block, blockIndex) => ({
    blockIndex,
    ...block,
  }))
  const renderedText = blocks.map((block) => (
    block.kind === "list-item" ? `${block.marker} ${block.text}`.trimEnd() : block.text
  )).join("\n")
  const summary: FlowDocImportedTextNormalizationSummaryV1 = {
    sourceCharacterCount: sourceText.length,
    renderedCharacterCount: renderedText.length,
    sourceLineCount: sourceLines.length,
    blockCount: blocks.length,
    paragraphBlockCount: blocks.filter((block) => block.kind === "paragraph").length,
    listItemBlockCount: blocks.filter((block) => block.kind === "list-item").length,
    softWrapJoinCount: blocks.reduce((sum, block) => sum + block.softWrapJoinCount, 0),
    preservedBreakCount: Math.max(0, blocks.length - 1),
    blankLineBoundaryCount,
    changed: renderedText !== sourceText,
  }
  const unsigned = {
    contractVersion: FLOWDOC_IMPORTED_TEXT_NORMALIZATION_VERSION,
    kind: "imported-text-normalization" as const,
    profileId: FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID,
    sourceTextFingerprint: fingerprint(sourceText),
    renderedTextFingerprint: fingerprint(renderedText),
    renderedText,
    blocks,
    summary,
  }
  return { ...unsigned, normalizationFingerprint: fingerprint(unsigned) }
}

export function createFlowDocImportedTextNormalizationEvidenceV1(
  result: FlowDocImportedTextNormalizationResultV1,
): FlowDocImportedTextNormalizationEvidenceV1 {
  return {
    contractVersion: result.contractVersion,
    kind: "imported-text-normalization-evidence",
    profileId: result.profileId,
    sourceTextFingerprint: result.sourceTextFingerprint,
    renderedTextFingerprint: result.renderedTextFingerprint,
    blocks: result.blocks.map((block) => ({
      blockIndex: block.blockIndex,
      kind: block.kind,
      marker: block.marker,
      sourceLineStart: block.sourceLineStart,
      sourceLineEnd: block.sourceLineEnd,
      softWrapJoinCount: block.softWrapJoinCount,
      characterCount: block.text.length,
      textFingerprint: fingerprint(block.text),
    })),
    summary: { ...result.summary },
    normalizationFingerprint: result.normalizationFingerprint,
  }
}
