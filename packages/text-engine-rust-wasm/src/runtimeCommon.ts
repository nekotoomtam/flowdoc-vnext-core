export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION =
  "flowdoc-text-engine-wasm-live-draft-xr1-v1" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_WASM_SHA256 =
  "60d24ed4b5546e580a8fa5dd05d774e7d8b7078958f7d327cf8f66ffcb5b3a85" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION = "rustybuzz-0.20.1" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION = "icu_segmenter-2.2.0" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION = "icu_segmenter_data-2.2.0" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_LINE_BREAK_POLICY = "icu4x-uax14-thai-v1" as const

export interface FlowDocTextEngineLiveDraftGlyphV1 {
  index: number
  glyphId: number
  cluster: number
  xAdvance: number
  yAdvance: number
  xOffset: number
  yOffset: number
}

export interface FlowDocTextEngineLiveDraftRawShapeV1 {
  source: string
  shaperRevision: string
  fontId: string
  fontPath: string
  text: string
  textByteLength: number
  textScalarCount: number
  unitsPerEm: number
  glyphCount: number
  glyphs: FlowDocTextEngineLiveDraftGlyphV1[]
}

export interface FlowDocTextEngineLiveDraftRawSegmentationV1 {
  source: string
  segmenterRevision: string
  dataRevision: string
  text: string
  textByteLength: number
  textScalarCount: number
  breakByteOffsets: number[]
}

export interface FlowDocTextEngineLiveDraftNormalizedResultV1 {
  contractVersion: 1
  outputShapeVersion: "glyph-break-smoke-v1"
  text: string
  fontId: string
  textByteLength: number
  textScalarCount: number
  unitsPerEm: number
  glyphs: FlowDocTextEngineLiveDraftGlyphV1[]
  breakByteOffsets: number[]
  breakUtf16Offsets: number[]
  summary: {
    glyphCount: number
    missingGlyphCount: number
    totalAdvanceFontUnits: number
    breakCount: number
  }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
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

export function normalizeFlowDocTextEngineLiveDraftResultV1(input: {
  shape: FlowDocTextEngineLiveDraftRawShapeV1
  segmentation: FlowDocTextEngineLiveDraftRawSegmentationV1
}): FlowDocTextEngineLiveDraftNormalizedResultV1 {
  const { shape, segmentation } = input
  requireFact(shape.shaperRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION, "shaper revision mismatch")
  requireFact(
    segmentation.segmenterRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
    "segmenter revision mismatch",
  )
  requireFact(
    segmentation.dataRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
    "segmenter data revision mismatch",
  )
  requireFact(shape.text === segmentation.text, "shape and segmentation text mismatch")
  requireFact(shape.textByteLength === segmentation.textByteLength, "text byte length mismatch")
  requireFact(shape.textScalarCount === segmentation.textScalarCount, "text scalar count mismatch")
  requireFact(shape.glyphCount === shape.glyphs.length, "glyph count mismatch")
  requireFact(shape.glyphs.length > 0, "shape result has no glyphs")
  requireFact(
    segmentation.breakByteOffsets.at(0) === 0
      && segmentation.breakByteOffsets.at(-1) === shape.textByteLength,
    "segmentation must include start and terminal byte offsets",
  )
  requireFact(
    segmentation.breakByteOffsets.every((offset, index, offsets) => index === 0 || offset > offsets[index - 1]!),
    "segmentation offsets must be strictly increasing",
  )
  const utf16OffsetByUtf8Byte = createUtf8ByteToUtf16OffsetMap(shape.text)
  return {
    contractVersion: 1,
    outputShapeVersion: "glyph-break-smoke-v1",
    text: shape.text,
    fontId: shape.fontId,
    textByteLength: shape.textByteLength,
    textScalarCount: shape.textScalarCount,
    unitsPerEm: shape.unitsPerEm,
    glyphs: structuredClone(shape.glyphs),
    breakByteOffsets: [...segmentation.breakByteOffsets],
    breakUtf16Offsets: segmentation.breakByteOffsets.map((offset) => {
      const utf16Offset = utf16OffsetByUtf8Byte.get(offset)
      requireFact(utf16Offset != null, "line break is not on a UTF-8 scalar boundary or exceeds the text")
      return utf16Offset
    }),
    summary: {
      glyphCount: shape.glyphCount,
      missingGlyphCount: shape.glyphs.filter((glyph) => glyph.glyphId === 0).length,
      totalAdvanceFontUnits: shape.glyphs.reduce((total, glyph) => total + glyph.xAdvance, 0),
      breakCount: segmentation.breakByteOffsets.length,
    },
  }
}
