import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
  type FlowDocTextEngineLiveDraftGlyphV1,
} from "./runtimeCommon.js"
import type {
  FlowDocTextEngineMr1SegmentationFactsV1,
  FlowDocTextEngineMr1ShapeFactsV1,
} from "./runtimeMr1.js"

export const FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION =
  "flowdoc-text-engine-wasm-live-draft-mr1-range-v1" as const
export const FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256 =
  "90bbb751ad3d5613175d689a2b07f95320b856a5e9420118b259d5738b7dabe7" as const
export const FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION =
  "flowdoc-text-engine-mr1-range-shape-facts-v1" as const
export const FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION =
  "flowdoc-text-engine-mr1-range-segmentation-facts-v1" as const

export interface FlowDocTextEngineMr1RangeGlyphV1 extends FlowDocTextEngineLiveDraftGlyphV1 {
  unsafeToBreak: boolean
}

export interface FlowDocTextEngineMr1RawRangeShapeV1 {
  source: string
  shaperRevision: string
  fontId: string
  fontPath: string
  fullTextByteLength: number
  fullTextScalarCount: number
  rangeStartByte: number
  rangeEndByte: number
  contextStartByte: number
  contextEndByte: number
  rangeText: string
  preContextText: string
  postContextText: string
  unitsPerEm: number
  ascentFontUnit: number
  descentFontUnit: number
  lineGapFontUnit: number
  glyphCount: number
  glyphs: FlowDocTextEngineMr1RangeGlyphV1[]
}

export interface FlowDocTextEngineMr1RangeShapeFactsV1 {
  contractVersion: 1
  outputShapeVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION
  fullText: string
  fontFaceId: string
  fullTextByteLength: number
  fullTextScalarCount: number
  rangeStartByte: number
  rangeEndByte: number
  rangeStartUtf16: number
  rangeEndUtf16: number
  contextStartByte: number
  contextEndByte: number
  contextStartUtf16: number
  contextEndUtf16: number
  rangeText: string
  preContextText: string
  postContextText: string
  unitsPerEm: number
  ascentFontUnit: number
  descentFontUnit: number
  lineGapFontUnit: number
  glyphs: FlowDocTextEngineMr1RangeGlyphV1[]
  summary: {
    glyphCount: number
    missingGlyphCount: number
    totalAdvanceFontUnits: number
    unsafeToBreakGlyphCount: number
  }
}

export interface FlowDocTextEngineMr1RawRangeSegmentationV1 {
  source: string
  segmenterRevision: string
  dataRevision: string
  fullTextByteLength: number
  fullTextScalarCount: number
  targetStartByte: number
  targetEndByte: number
  contextStartByte: number
  contextEndByte: number
  contextText: string
  contextBreakByteOffsets: number[]
}

export interface FlowDocTextEngineMr1RangeSegmentationFactsV1 {
  contractVersion: 1
  outputShapeVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION
  fullText: string
  fullTextByteLength: number
  fullTextScalarCount: number
  targetStartByte: number
  targetEndByte: number
  targetStartUtf16: number
  targetEndUtf16: number
  contextStartByte: number
  contextEndByte: number
  contextStartUtf16: number
  contextEndUtf16: number
  contextText: string
  contextBreakByteOffsets: number[]
  contextBreakUtf16Offsets: number[]
  targetBreakByteOffsets: number[]
  targetBreakUtf16Offsets: number[]
  summary: {
    contextBreakCount: number
    targetBreakCount: number
    artificialContextBoundaryBreakCount: number
  }
}

export interface FlowDocTextEngineMr1RangeOracleProofV1 {
  status: "exact" | "fallback-required"
  reasonCode:
    | null
    | "font-face-mismatch"
    | "full-text-mismatch"
    | "unsafe-cluster-boundary"
    | "glyph-facts-mismatch"
    | "break-facts-mismatch"
  comparedFactCount: number
  mayPublishLayout: boolean
}

export interface FlowDocTextEngineMr1RangeSegmentationRuntimeV1 {
  segmentRange(input: {
    text: string
    targetStartUtf16: number
    targetEndUtf16: number
    contextStartUtf16: number
    contextEndUtf16: number
  }): FlowDocTextEngineMr1RangeSegmentationFactsV1
}

export interface FlowDocTextEngineMr1BoundedSegmentationV1 {
  status: "bounded-stable" | "fallback-required"
  reasonCode: null | "full-context-required" | "context-limit-reached"
  facts: FlowDocTextEngineMr1RangeSegmentationFactsV1
  attempts: Array<{
    contextStartUtf16: number
    contextEndUtf16: number
    targetBreakUtf16Offsets: number[]
  }>
  stableExpansionCount: number
  oracleVerified: false
  mayPublishLayout: false
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function utf8ScalarLength(scalar: string): number {
  const codePoint = scalar.codePointAt(0)!
  return codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
}

export function flowDocUtf8ByteLengthV1(text: string): number {
  let length = 0
  for (const scalar of text) length += utf8ScalarLength(scalar)
  return length
}

function createOffsetMaps(text: string): {
  utf16ByByte: Map<number, number>
  byteByUtf16: Map<number, number>
} {
  const utf16ByByte = new Map<number, number>([[0, 0]])
  const byteByUtf16 = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    byteOffset += utf8ScalarLength(scalar)
    utf16Offset += scalar.length
    utf16ByByte.set(byteOffset, utf16Offset)
    byteByUtf16.set(utf16Offset, byteOffset)
  }
  return { utf16ByByte, byteByUtf16 }
}

function byteOffset(offsets: ReturnType<typeof createOffsetMaps>, utf16Offset: number, label: string): number {
  const result = offsets.byteByUtf16.get(utf16Offset)
  requireFact(result != null, `${label} must be a safe UTF-16 scalar boundary`)
  return result
}

function utf16Offset(offsets: ReturnType<typeof createOffsetMaps>, byteOffsetValue: number, label: string): number {
  const result = offsets.utf16ByByte.get(byteOffsetValue)
  requireFact(result != null, `${label} must be a safe UTF-8 scalar boundary`)
  return result
}

function sliceByByteRange(
  text: string,
  offsets: ReturnType<typeof createOffsetMaps>,
  startByte: number,
  endByte: number,
  label: string,
): string {
  const start = utf16Offset(offsets, startByte, `${label} start`)
  const end = utf16Offset(offsets, endByte, `${label} end`)
  requireFact(start <= end, `${label} offsets must be ordered`)
  return text.slice(start, end)
}

function validateFullTextMetadata(input: {
  fullText: string
  fullTextByteLength: number
  fullTextScalarCount: number
}): ReturnType<typeof createOffsetMaps> {
  requireFact(input.fullText.length > 0, "MR1 range facts require non-empty full text")
  requireFact(input.fullTextByteLength === flowDocUtf8ByteLengthV1(input.fullText), "MR1 range full-text byte length mismatch")
  requireFact(input.fullTextScalarCount === [...input.fullText].length, "MR1 range full-text scalar count mismatch")
  return createOffsetMaps(input.fullText)
}

function equalNumbers(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function normalizeFlowDocTextEngineMr1RangeShapeV1(input: {
  raw: FlowDocTextEngineMr1RawRangeShapeV1
  fullText: string
}): FlowDocTextEngineMr1RangeShapeFactsV1 {
  const { raw, fullText } = input
  const offsets = validateFullTextMetadata({
    fullText,
    fullTextByteLength: raw.fullTextByteLength,
    fullTextScalarCount: raw.fullTextScalarCount,
  })
  requireFact(raw.shaperRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION, "MR1 range shaper revision mismatch")
  requireFact(raw.fontId.trim().length > 0, "MR1 range font face id is required")
  requireFact(
    raw.contextStartByte <= raw.rangeStartByte
      && raw.rangeStartByte < raw.rangeEndByte
      && raw.rangeEndByte <= raw.contextEndByte
      && raw.contextEndByte <= raw.fullTextByteLength,
    "MR1 shape range and context offsets are invalid",
  )
  const rangeStartUtf16 = utf16Offset(offsets, raw.rangeStartByte, "MR1 shape range start")
  const rangeEndUtf16 = utf16Offset(offsets, raw.rangeEndByte, "MR1 shape range end")
  const contextStartUtf16 = utf16Offset(offsets, raw.contextStartByte, "MR1 shape context start")
  const contextEndUtf16 = utf16Offset(offsets, raw.contextEndByte, "MR1 shape context end")
  requireFact(raw.rangeText === sliceByByteRange(fullText, offsets, raw.rangeStartByte, raw.rangeEndByte, "MR1 shape range"), "MR1 shape range text mismatch")
  requireFact(raw.preContextText === sliceByByteRange(fullText, offsets, raw.contextStartByte, raw.rangeStartByte, "MR1 shape pre-context"), "MR1 shape pre-context text mismatch")
  requireFact(raw.postContextText === sliceByByteRange(fullText, offsets, raw.rangeEndByte, raw.contextEndByte, "MR1 shape post-context"), "MR1 shape post-context text mismatch")
  requireFact(Number.isSafeInteger(raw.unitsPerEm) && raw.unitsPerEm > 0, "MR1 range units per em must be positive")
  requireFact(Number.isSafeInteger(raw.ascentFontUnit) && raw.ascentFontUnit > 0, "MR1 range ascent must be positive")
  requireFact(Number.isSafeInteger(raw.descentFontUnit) && raw.descentFontUnit <= 0, "MR1 range descent must be non-positive")
  requireFact(Number.isSafeInteger(raw.lineGapFontUnit) && raw.lineGapFontUnit >= 0, "MR1 range line gap must be non-negative")
  requireFact(raw.glyphCount === raw.glyphs.length && raw.glyphCount > 0, "MR1 range glyph count mismatch")
  raw.glyphs.forEach((glyph, index) => {
    requireFact(glyph.index === index, "MR1 range glyph indexes must be contiguous")
    requireFact(Number.isSafeInteger(glyph.glyphId) && glyph.glyphId >= 0, "MR1 range glyph id is invalid")
    requireFact(
      Number.isSafeInteger(glyph.cluster)
        && glyph.cluster >= raw.rangeStartByte
        && glyph.cluster < raw.rangeEndByte
        && offsets.utf16ByByte.has(glyph.cluster),
      "MR1 range glyph cluster is not a safe global UTF-8 boundary",
    )
    requireFact(
      [glyph.xAdvance, glyph.yAdvance, glyph.xOffset, glyph.yOffset].every(Number.isSafeInteger),
      "MR1 range glyph geometry must use safe font-unit integers",
    )
    requireFact(typeof glyph.unsafeToBreak === "boolean", "MR1 range glyph unsafe-to-break flag is invalid")
  })

  return {
    contractVersion: 1,
    outputShapeVersion: FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION,
    fullText,
    fontFaceId: raw.fontId,
    fullTextByteLength: raw.fullTextByteLength,
    fullTextScalarCount: raw.fullTextScalarCount,
    rangeStartByte: raw.rangeStartByte,
    rangeEndByte: raw.rangeEndByte,
    rangeStartUtf16,
    rangeEndUtf16,
    contextStartByte: raw.contextStartByte,
    contextEndByte: raw.contextEndByte,
    contextStartUtf16,
    contextEndUtf16,
    rangeText: raw.rangeText,
    preContextText: raw.preContextText,
    postContextText: raw.postContextText,
    unitsPerEm: raw.unitsPerEm,
    ascentFontUnit: raw.ascentFontUnit,
    descentFontUnit: raw.descentFontUnit,
    lineGapFontUnit: raw.lineGapFontUnit,
    glyphs: structuredClone(raw.glyphs),
    summary: {
      glyphCount: raw.glyphCount,
      missingGlyphCount: raw.glyphs.filter((glyph) => glyph.glyphId === 0).length,
      totalAdvanceFontUnits: raw.glyphs.reduce((total, glyph) => total + glyph.xAdvance, 0),
      unsafeToBreakGlyphCount: raw.glyphs.filter((glyph) => glyph.unsafeToBreak).length,
    },
  }
}

export function normalizeFlowDocTextEngineMr1RangeSegmentationV1(input: {
  raw: FlowDocTextEngineMr1RawRangeSegmentationV1
  fullText: string
}): FlowDocTextEngineMr1RangeSegmentationFactsV1 {
  const { raw, fullText } = input
  const offsets = validateFullTextMetadata({
    fullText,
    fullTextByteLength: raw.fullTextByteLength,
    fullTextScalarCount: raw.fullTextScalarCount,
  })
  requireFact(raw.segmenterRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION, "MR1 range segmenter revision mismatch")
  requireFact(raw.dataRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION, "MR1 range segmenter data revision mismatch")
  requireFact(
    raw.contextStartByte <= raw.targetStartByte
      && raw.targetStartByte < raw.targetEndByte
      && raw.targetEndByte <= raw.contextEndByte
      && raw.contextEndByte <= raw.fullTextByteLength,
    "MR1 segmentation target and context offsets are invalid",
  )
  const targetStartUtf16 = utf16Offset(offsets, raw.targetStartByte, "MR1 segmentation target start")
  const targetEndUtf16 = utf16Offset(offsets, raw.targetEndByte, "MR1 segmentation target end")
  const contextStartUtf16 = utf16Offset(offsets, raw.contextStartByte, "MR1 segmentation context start")
  const contextEndUtf16 = utf16Offset(offsets, raw.contextEndByte, "MR1 segmentation context end")
  requireFact(raw.contextText === sliceByByteRange(fullText, offsets, raw.contextStartByte, raw.contextEndByte, "MR1 segmentation context"), "MR1 segmentation context text mismatch")
  requireFact(
    raw.contextBreakByteOffsets.length > 0
      && raw.contextBreakByteOffsets.every((offset, index, all) => (
        Number.isSafeInteger(offset)
          && offset >= raw.contextStartByte
          && offset <= raw.contextEndByte
          && offsets.utf16ByByte.has(offset)
          && (index === 0 || offset > all[index - 1]!)
      )),
    "MR1 range segmentation offsets must be safe and strictly increasing",
  )
  requireFact(
    raw.contextBreakByteOffsets[0] === raw.contextStartByte
      && raw.contextBreakByteOffsets.at(-1) === raw.contextEndByte,
    "MR1 range segmentation must expose context endpoints",
  )

  let artificialContextBoundaryBreakCount = 0
  const trustedContextBreakByteOffsets = raw.contextBreakByteOffsets.filter((offset) => {
    if (offset === raw.contextStartByte && raw.contextStartByte !== 0) {
      artificialContextBoundaryBreakCount += 1
      return false
    }
    if (offset === raw.contextEndByte && raw.contextEndByte !== raw.fullTextByteLength) {
      artificialContextBoundaryBreakCount += 1
      return false
    }
    return true
  })
  const contextBreakUtf16Offsets = trustedContextBreakByteOffsets.map((offset) => (
    utf16Offset(offsets, offset, "MR1 segmentation context break")
  ))
  const targetBreakByteOffsets = trustedContextBreakByteOffsets.filter((offset) => (
    offset >= raw.targetStartByte && offset <= raw.targetEndByte
  ))
  const targetBreakUtf16Offsets = targetBreakByteOffsets.map((offset) => (
    utf16Offset(offsets, offset, "MR1 segmentation target break")
  ))

  return {
    contractVersion: 1,
    outputShapeVersion: FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION,
    fullText,
    fullTextByteLength: raw.fullTextByteLength,
    fullTextScalarCount: raw.fullTextScalarCount,
    targetStartByte: raw.targetStartByte,
    targetEndByte: raw.targetEndByte,
    targetStartUtf16,
    targetEndUtf16,
    contextStartByte: raw.contextStartByte,
    contextEndByte: raw.contextEndByte,
    contextStartUtf16,
    contextEndUtf16,
    contextText: raw.contextText,
    contextBreakByteOffsets: trustedContextBreakByteOffsets,
    contextBreakUtf16Offsets,
    targetBreakByteOffsets,
    targetBreakUtf16Offsets,
    summary: {
      contextBreakCount: trustedContextBreakByteOffsets.length,
      targetBreakCount: targetBreakByteOffsets.length,
      artificialContextBoundaryBreakCount,
    },
  }
}

export function compareFlowDocTextEngineMr1RangeShapeToFullOracleV1(input: {
  range: FlowDocTextEngineMr1RangeShapeFactsV1
  full: FlowDocTextEngineMr1ShapeFactsV1
}): FlowDocTextEngineMr1RangeOracleProofV1 {
  const { range, full } = input
  if (range.fullText !== full.text) {
    return { status: "fallback-required", reasonCode: "full-text-mismatch", comparedFactCount: 0, mayPublishLayout: false }
  }
  if (range.fontFaceId !== full.fontFaceId) {
    return { status: "fallback-required", reasonCode: "font-face-mismatch", comparedFactCount: 0, mayPublishLayout: false }
  }
  const clusterBoundaries = new Set<number>([0, full.textByteLength, ...full.glyphs.map((glyph) => glyph.cluster)])
  if (!clusterBoundaries.has(range.rangeStartByte) || !clusterBoundaries.has(range.rangeEndByte)) {
    return { status: "fallback-required", reasonCode: "unsafe-cluster-boundary", comparedFactCount: 0, mayPublishLayout: false }
  }
  const expectedGlyphs = full.glyphs.filter((glyph) => (
    glyph.cluster >= range.rangeStartByte && glyph.cluster < range.rangeEndByte
  ))
  const exact = expectedGlyphs.length === range.glyphs.length && expectedGlyphs.every((expected, index) => {
    const actual = range.glyphs[index]
    return actual != null
      && actual.glyphId === expected.glyphId
      && actual.cluster === expected.cluster
      && actual.xAdvance === expected.xAdvance
      && actual.yAdvance === expected.yAdvance
      && actual.xOffset === expected.xOffset
      && actual.yOffset === expected.yOffset
  })
  return exact
    ? { status: "exact", reasonCode: null, comparedFactCount: expectedGlyphs.length, mayPublishLayout: true }
    : { status: "fallback-required", reasonCode: "glyph-facts-mismatch", comparedFactCount: expectedGlyphs.length, mayPublishLayout: false }
}

export function compareFlowDocTextEngineMr1RangeSegmentationToFullOracleV1(input: {
  range: FlowDocTextEngineMr1RangeSegmentationFactsV1
  full: FlowDocTextEngineMr1SegmentationFactsV1
}): FlowDocTextEngineMr1RangeOracleProofV1 {
  const { range, full } = input
  if (range.fullText !== full.text) {
    return { status: "fallback-required", reasonCode: "full-text-mismatch", comparedFactCount: 0, mayPublishLayout: false }
  }
  const expected = full.breakByteOffsets.filter((offset) => (
    offset >= range.targetStartByte && offset <= range.targetEndByte
  ))
  return equalNumbers(range.targetBreakByteOffsets, expected)
    ? { status: "exact", reasonCode: null, comparedFactCount: expected.length, mayPublishLayout: true }
    : { status: "fallback-required", reasonCode: "break-facts-mismatch", comparedFactCount: expected.length, mayPublishLayout: false }
}

function isSafeUtf16Boundary(text: string, offset: number): boolean {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > text.length) return false
  if (offset === 0 || offset === text.length) return true
  const before = text.charCodeAt(offset - 1)
  const after = text.charCodeAt(offset)
  return !(before >= 0xd800 && before <= 0xdbff && after >= 0xdc00 && after <= 0xdfff)
}

function expandStartToSafeBoundary(text: string, offset: number): number {
  return isSafeUtf16Boundary(text, offset) ? offset : offset - 1
}

function expandEndToSafeBoundary(text: string, offset: number): number {
  return isSafeUtf16Boundary(text, offset) ? offset : offset + 1
}

export function createFlowDocTextEngineMr1BoundedSegmentationV1(input: {
  text: string
  targetStartUtf16: number
  targetEndUtf16: number
  initialContextUtf16?: number
  maxContextUtf16?: number
  requiredStableExpansionCount?: number
  runtime: FlowDocTextEngineMr1RangeSegmentationRuntimeV1
}): FlowDocTextEngineMr1BoundedSegmentationV1 {
  requireFact(input.text.length > 0, "MR1 bounded segmentation requires non-empty text")
  requireFact(
    isSafeUtf16Boundary(input.text, input.targetStartUtf16)
      && isSafeUtf16Boundary(input.text, input.targetEndUtf16)
      && input.targetStartUtf16 < input.targetEndUtf16,
    "MR1 bounded segmentation target must use ordered UTF-16 scalar boundaries",
  )
  const initialContextUtf16 = input.initialContextUtf16 ?? 32
  const maxContextUtf16 = input.maxContextUtf16 ?? 2_048
  const requiredStableExpansionCount = input.requiredStableExpansionCount ?? 2
  requireFact(Number.isSafeInteger(initialContextUtf16) && initialContextUtf16 > 0, "MR1 initial context must be a positive integer")
  requireFact(Number.isSafeInteger(maxContextUtf16) && maxContextUtf16 >= initialContextUtf16, "MR1 max context must cover the initial context")
  requireFact(Number.isSafeInteger(requiredStableExpansionCount) && requiredStableExpansionCount > 0, "MR1 stable expansion count must be positive")

  const attempts: FlowDocTextEngineMr1BoundedSegmentationV1["attempts"] = []
  let previousBreaks: number[] | null = null
  let stableExpansionCount = 0
  let contextSize = initialContextUtf16
  let latest: FlowDocTextEngineMr1RangeSegmentationFactsV1 | null = null

  while (true) {
    const contextStartUtf16 = expandStartToSafeBoundary(
      input.text,
      Math.max(0, input.targetStartUtf16 - contextSize),
    )
    const contextEndUtf16 = expandEndToSafeBoundary(
      input.text,
      Math.min(input.text.length, input.targetEndUtf16 + contextSize),
    )
    latest = input.runtime.segmentRange({
      text: input.text,
      targetStartUtf16: input.targetStartUtf16,
      targetEndUtf16: input.targetEndUtf16,
      contextStartUtf16,
      contextEndUtf16,
    })
    requireFact(
      latest.contextStartUtf16 === contextStartUtf16
        && latest.contextEndUtf16 === contextEndUtf16
        && latest.targetStartUtf16 === input.targetStartUtf16
        && latest.targetEndUtf16 === input.targetEndUtf16,
      "MR1 bounded segmentation runtime returned a different range",
    )
    const currentBreaks = [...latest.targetBreakUtf16Offsets]
    attempts.push({ contextStartUtf16, contextEndUtf16, targetBreakUtf16Offsets: currentBreaks })
    stableExpansionCount = previousBreaks != null && equalNumbers(previousBreaks, currentBreaks)
      ? stableExpansionCount + 1
      : 0
    if (stableExpansionCount >= requiredStableExpansionCount) {
      return {
        status: "bounded-stable",
        reasonCode: null,
        facts: latest,
        attempts,
        stableExpansionCount,
        oracleVerified: false,
        mayPublishLayout: false,
      }
    }
    const usedFullContext = contextStartUtf16 === 0 && contextEndUtf16 === input.text.length
    if (usedFullContext) {
      return {
        status: "fallback-required",
        reasonCode: "full-context-required",
        facts: latest,
        attempts,
        stableExpansionCount,
        oracleVerified: false,
        mayPublishLayout: false,
      }
    }
    if (contextSize >= maxContextUtf16) {
      return {
        status: "fallback-required",
        reasonCode: "context-limit-reached",
        facts: latest,
        attempts,
        stableExpansionCount,
        oracleVerified: false,
        mayPublishLayout: false,
      }
    }
    previousBreaks = currentBreaks
    contextSize = Math.min(maxContextUtf16, contextSize * 2)
  }
}

export function flowDocUtf16RangeToUtf8BytesV1(input: {
  text: string
  startUtf16: number
  endUtf16: number
}): { startByte: number; endByte: number } {
  const offsets = createOffsetMaps(input.text)
  return {
    startByte: byteOffset(offsets, input.startUtf16, "range start"),
    endByte: byteOffset(offsets, input.endUtf16, "range end"),
  }
}
