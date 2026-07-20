import { describe, expect, it } from "vitest"
import { createFlowDocTextEngineLiveDraftMeasurementV1 } from "../packages/text-engine-rust-wasm/src/liveDraftLayout.js"
import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
  normalizeFlowDocTextEngineLiveDraftResultV1,
  type FlowDocTextEngineLiveDraftNormalizedResultV1,
} from "../packages/text-engine-rust-wasm/src/runtimeCommon.js"

function measurement(overrides: Partial<FlowDocTextEngineLiveDraftNormalizedResultV1> = {}): FlowDocTextEngineLiveDraftNormalizedResultV1 {
  return {
    contractVersion: 1,
    outputShapeVersion: "glyph-break-smoke-v1",
    text: "aa bb",
    fontId: "fixture-font",
    textByteLength: 5,
    textScalarCount: 5,
    unitsPerEm: 1_000,
    glyphs: [0, 1, 2, 3, 4].map((cluster, index) => ({
      index,
      glyphId: index + 1,
      cluster,
      xAdvance: 500,
      yAdvance: 0,
      xOffset: 0,
      yOffset: 0,
    })),
    breakByteOffsets: [0, 3, 5],
    breakUtf16Offsets: [0, 3, 5],
    summary: {
      glyphCount: 5,
      missingGlyphCount: 0,
      totalAdvanceFontUnits: 2_500,
      breakCount: 3,
    },
    ...overrides,
  }
}

describe("LIVE-DRAFT-XR-2 measurement draft adapter", () => {
  it("wraps pinned glyph advances only at ICU4X opportunities", () => {
    expect(createFlowDocTextEngineLiveDraftMeasurementV1({
      measurement: measurement(),
      availableWidthPt: 16,
      fontSizePt: 10,
      lineHeightPt: 14,
    })).toEqual({
      lines: ["aa ", "bb"],
      lineHeightPt: 14,
      widthPt: 15,
      heightPt: 28,
      lineBoxes: [{
        index: 0,
        text: "aa ",
        startOffset: 0,
        endOffset: 3,
        widthPt: 15,
        heightPt: 14,
        yOffsetPt: 0,
      }, {
        index: 1,
        text: "bb",
        startOffset: 3,
        endOffset: 5,
        widthPt: 10,
        heightPt: 14,
        yOffsetPt: 14,
      }],
    })
  })

  it("maps UTF-8 Rustybuzz clusters onto UTF-16 Core offsets", () => {
    const thai = measurement({
      text: "กข",
      textByteLength: 6,
      textScalarCount: 2,
      glyphs: [0, 3].map((cluster, index) => ({
        index,
        glyphId: index + 1,
        cluster,
        xAdvance: 500,
        yAdvance: 0,
        xOffset: 0,
        yOffset: 0,
      })),
      breakByteOffsets: [0, 3, 6],
      breakUtf16Offsets: [0, 1, 2],
      summary: { glyphCount: 2, missingGlyphCount: 0, totalAdvanceFontUnits: 1_000, breakCount: 3 },
    })
    const result = createFlowDocTextEngineLiveDraftMeasurementV1({
      measurement: thai,
      availableWidthPt: 5,
      fontSizePt: 10,
      lineHeightPt: 14,
    })

    expect(result.lines).toEqual(["ก", "ข"])
    expect(result.lineBoxes.map((line) => [line.startOffset, line.endOffset])).toEqual([[0, 1], [1, 2]])
  })

  it("treats newline opportunities as mandatory even when following text fits", () => {
    const forced = measurement({
      text: "a\nb",
      textByteLength: 3,
      textScalarCount: 3,
      glyphs: [0, 1, 2].map((cluster, index) => ({
        index,
        glyphId: index + 1,
        cluster,
        xAdvance: index === 1 ? 0 : 500,
        yAdvance: 0,
        xOffset: 0,
        yOffset: 0,
      })),
      breakByteOffsets: [0, 2, 3],
      breakUtf16Offsets: [0, 2, 3],
      summary: { glyphCount: 3, missingGlyphCount: 0, totalAdvanceFontUnits: 1_000, breakCount: 3 },
    })
    const result = createFlowDocTextEngineLiveDraftMeasurementV1({
      measurement: forced,
      availableWidthPt: 100,
      fontSizePt: 10,
      lineHeightPt: 14,
    })

    expect(result.lines).toEqual(["a\n", "b"])
    expect(result.lineBoxes.map((line) => [line.startOffset, line.endOffset])).toEqual([[0, 2], [2, 3]])
  })

  it("builds UTF-16 break offsets in one pass across surrogate pairs", () => {
    const result = normalizeFlowDocTextEngineLiveDraftResultV1({
      shape: {
        source: "test",
        shaperRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
        fontId: "fixture-font",
        fontPath: "fixture.ttf",
        text: "😀a",
        textByteLength: 5,
        textScalarCount: 2,
        unitsPerEm: 1_000,
        glyphCount: 2,
        glyphs: [0, 4].map((cluster, index) => ({
          index, glyphId: index + 1, cluster, xAdvance: 500,
          yAdvance: 0, xOffset: 0, yOffset: 0,
        })),
      },
      segmentation: {
        source: "test",
        segmenterRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
        dataRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
        text: "😀a",
        textByteLength: 5,
        textScalarCount: 2,
        breakByteOffsets: [0, 4, 5],
      },
    })

    expect(result.breakUtf16Offsets).toEqual([0, 2, 3])
  })
})
