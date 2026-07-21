import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
  type FlowDocTextEngineLiveDraftGlyphV1,
  type FlowDocTextEngineLiveDraftRawSegmentationV1,
  type FlowDocTextEngineLiveDraftRawShapeV1,
} from "./runtimeCommon.js"

export const FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION =
  "flowdoc-text-engine-wasm-live-draft-mr1-v1" as const
export const FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256 =
  "cc130a7f8cef2694f8518cecb93b518eac2496fa8f4141f62ca284e6f34b0857" as const
export const FLOWDOC_TEXT_ENGINE_MR1_SHAPE_FACTS_VERSION =
  "flowdoc-text-engine-mr1-shape-facts-v1" as const
export const FLOWDOC_TEXT_ENGINE_MR1_SEGMENTATION_FACTS_VERSION =
  "flowdoc-text-engine-mr1-segmentation-facts-v1" as const

export interface FlowDocTextEngineMr1RawShapeV1 extends FlowDocTextEngineLiveDraftRawShapeV1 {
  ascentFontUnit: number
  descentFontUnit: number
  lineGapFontUnit: number
}

export interface FlowDocTextEngineMr1ShapeFactsV1 {
  contractVersion: 1
  outputShapeVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_SHAPE_FACTS_VERSION
  text: string
  fontFaceId: string
  textByteLength: number
  textScalarCount: number
  unitsPerEm: number
  ascentFontUnit: number
  descentFontUnit: number
  lineGapFontUnit: number
  glyphs: FlowDocTextEngineLiveDraftGlyphV1[]
  summary: {
    glyphCount: number
    missingGlyphCount: number
    totalAdvanceFontUnits: number
  }
}

export interface FlowDocTextEngineMr1SegmentationFactsV1 {
  contractVersion: 1
  outputShapeVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_SEGMENTATION_FACTS_VERSION
  text: string
  textByteLength: number
  textScalarCount: number
  breakByteOffsets: number[]
  breakUtf16Offsets: number[]
  summary: { breakCount: number }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function utf8ByteLength(text: string): number {
  let length = 0
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    length += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
  }
  return length
}

function createUtf8ByteToUtf16OffsetMap(text: string): Map<number, number> {
  const offsets = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    byteOffset += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16Offset += scalar.length
    offsets.set(byteOffset, utf16Offset)
  }
  return offsets
}

function validateTextFacts(input: {
  text: string
  textByteLength: number
  textScalarCount: number
}): void {
  requireFact(input.text.length > 0, "MR1 engine facts require non-empty text")
  requireFact(input.textByteLength === utf8ByteLength(input.text), "MR1 text byte length mismatch")
  requireFact(input.textScalarCount === [...input.text].length, "MR1 text scalar count mismatch")
}

export function normalizeFlowDocTextEngineMr1ShapeV1(
  raw: FlowDocTextEngineMr1RawShapeV1,
): FlowDocTextEngineMr1ShapeFactsV1 {
  validateTextFacts(raw)
  requireFact(raw.shaperRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION, "MR1 shaper revision mismatch")
  requireFact(raw.fontId.trim().length > 0, "MR1 font face id is required")
  requireFact(Number.isSafeInteger(raw.unitsPerEm) && raw.unitsPerEm > 0, "MR1 units per em must be positive")
  requireFact(Number.isSafeInteger(raw.ascentFontUnit) && raw.ascentFontUnit > 0, "MR1 ascent must be positive")
  requireFact(Number.isSafeInteger(raw.descentFontUnit) && raw.descentFontUnit <= 0, "MR1 descent must be non-positive")
  requireFact(Number.isSafeInteger(raw.lineGapFontUnit) && raw.lineGapFontUnit >= 0, "MR1 line gap must be non-negative")
  requireFact(raw.glyphCount === raw.glyphs.length && raw.glyphCount > 0, "MR1 glyph count mismatch")

  const utf16OffsetByUtf8Byte = createUtf8ByteToUtf16OffsetMap(raw.text)
  raw.glyphs.forEach((glyph, index) => {
    requireFact(glyph.index === index, "MR1 glyph indexes must be contiguous")
    requireFact(Number.isSafeInteger(glyph.glyphId) && glyph.glyphId >= 0, "MR1 glyph id is invalid")
    requireFact(
      Number.isSafeInteger(glyph.cluster)
        && glyph.cluster >= 0
        && glyph.cluster < raw.textByteLength
        && utf16OffsetByUtf8Byte.has(glyph.cluster),
      "MR1 glyph cluster is not a safe UTF-8 boundary",
    )
    requireFact(
      [glyph.xAdvance, glyph.yAdvance, glyph.xOffset, glyph.yOffset].every(Number.isSafeInteger),
      "MR1 glyph geometry must use safe font-unit integers",
    )
  })

  return {
    contractVersion: 1,
    outputShapeVersion: FLOWDOC_TEXT_ENGINE_MR1_SHAPE_FACTS_VERSION,
    text: raw.text,
    fontFaceId: raw.fontId,
    textByteLength: raw.textByteLength,
    textScalarCount: raw.textScalarCount,
    unitsPerEm: raw.unitsPerEm,
    ascentFontUnit: raw.ascentFontUnit,
    descentFontUnit: raw.descentFontUnit,
    lineGapFontUnit: raw.lineGapFontUnit,
    glyphs: structuredClone(raw.glyphs),
    summary: {
      glyphCount: raw.glyphCount,
      missingGlyphCount: raw.glyphs.filter((glyph) => glyph.glyphId === 0).length,
      totalAdvanceFontUnits: raw.glyphs.reduce((total, glyph) => total + glyph.xAdvance, 0),
    },
  }
}

export function normalizeFlowDocTextEngineMr1SegmentationV1(
  raw: FlowDocTextEngineLiveDraftRawSegmentationV1,
): FlowDocTextEngineMr1SegmentationFactsV1 {
  validateTextFacts(raw)
  requireFact(
    raw.segmenterRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
    "MR1 segmenter revision mismatch",
  )
  requireFact(
    raw.dataRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
    "MR1 segmenter data revision mismatch",
  )
  requireFact(
    raw.breakByteOffsets[0] === 0 && raw.breakByteOffsets.at(-1) === raw.textByteLength,
    "MR1 segmentation must include start and terminal offsets",
  )
  requireFact(
    raw.breakByteOffsets.every((offset, index, offsets) => (
      Number.isSafeInteger(offset)
        && offset >= 0
        && offset <= raw.textByteLength
        && (index === 0 || offset > offsets[index - 1]!)
    )),
    "MR1 segmentation offsets must be safe and strictly increasing",
  )
  const utf16OffsetByUtf8Byte = createUtf8ByteToUtf16OffsetMap(raw.text)
  const breakUtf16Offsets = raw.breakByteOffsets.map((offset) => {
    const utf16Offset = utf16OffsetByUtf8Byte.get(offset)
    requireFact(utf16Offset != null, "MR1 line break is not on a UTF-8 scalar boundary")
    return utf16Offset
  })
  return {
    contractVersion: 1,
    outputShapeVersion: FLOWDOC_TEXT_ENGINE_MR1_SEGMENTATION_FACTS_VERSION,
    text: raw.text,
    textByteLength: raw.textByteLength,
    textScalarCount: raw.textScalarCount,
    breakByteOffsets: [...raw.breakByteOffsets],
    breakUtf16Offsets,
    summary: { breakCount: raw.breakByteOffsets.length },
  }
}
