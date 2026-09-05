import initWasm, {
  flowdoc_text_engine_mr1_wasm_boundary_version as boundaryVersion,
  flowdoc_text_engine_wasm_readiness_marker as readiness,
  flowdoc_text_engine_wasm_shape_json as shapeJson,
  flowdoc_text_engine_wasm_segment_json as segmentJson,
} from "../pkg-live-draft-mr1/flowdoc_text_engine_mr1.js"
import { createVNextCreatorPreviewMeasurementEngineV1 } from "@flowdoc/vnext-core"
import { FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION, normalizeFlowDocTextEngineMr1ShapeV1, normalizeFlowDocTextEngineMr1SegmentationV1 } from "./runtimeMr1.js"

function scriptRuns(text: string): { text: string; offset: number }[] {
  const runs: { text: string; offset: number }[] = []
  let start = 0, offset = 0, script = "common"
  for (const scalar of text) {
    const next = /\p{Script=Thai}/u.test(scalar) ? "thai" : /\p{Script=Latin}/u.test(scalar) ? "latin" : "common"
    if (next === "common" && /\p{L}/u.test(scalar)) throw new Error("Creator profile supports only Thai and Latin letters")
    if (next !== "common" && script !== "common" && next !== script) {
      if (/\p{M}/u.test(scalar)) throw new Error("Unsupported combining script boundary")
      runs.push({ text: text.slice(start, offset), offset: start }); start = offset
    }
    if (next !== "common") script = next
    offset += scalar.length
  }
  if (offset > start) runs.push({ text: text.slice(start), offset: start })
  return runs
}

/** Additive product raw-fact consumer authorized by CCR core-creator-preview-raw-facts-01.
 * Does not consume MR1 QA layouts, RootV2, SceneDeliveryV2 or TextFlowDisplayListV1.
 */
export function createFlowDocCreatorTextPreviewRuntimeV1(input: {
  measurementProfileId: string; wasmBytes: ArrayBuffer; fontBytes: ArrayBuffer
}) {
  return createVNextCreatorPreviewMeasurementEngineV1({ ...input, async initialize({ wasmBytes, fontBytes }) {
    await initWasm({ module_or_path: wasmBytes })
    if (readiness() !== 2 || boundaryVersion() !== FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION) throw new Error("Creator WASM ABI mismatch")
    return {
      shape(text) {
        if (text.length === 0) return { text, unitsPerEm: 1000, ascentFontUnit: 1068, descentFontUnit: -232, glyphs: [] }
        const glyphs = scriptRuns(text).flatMap(run => {
          const facts = normalizeFlowDocTextEngineMr1ShapeV1(JSON.parse(shapeJson(fontBytes, run.text, "sarabun-regular")))
          if (facts.fontFaceId !== "sarabun-regular" || facts.unitsPerEm !== 1000 || facts.ascentFontUnit !== 1068 || facts.descentFontUnit !== -232 || facts.summary.missingGlyphCount) throw new Error("Unsupported Creator font facts or missing glyph")
          const utf16ByByte = new Map<number, number>(); let byteOffset = 0, utf16Offset = run.offset
          for (const scalar of run.text) { utf16ByByte.set(byteOffset, utf16Offset); byteOffset += new TextEncoder().encode(scalar).length; utf16Offset += scalar.length }
          return facts.glyphs.map(glyph => ({ glyphId: glyph.glyphId, clusterUtf16: utf16ByByte.get(glyph.cluster)!, xAdvance: glyph.xAdvance, yAdvance: glyph.yAdvance, xOffset: glyph.xOffset, yOffset: glyph.yOffset }))
        })
        return { text, unitsPerEm: 1000, ascentFontUnit: 1068, descentFontUnit: -232, glyphs }
      },
      segment(text) { return text.length ? normalizeFlowDocTextEngineMr1SegmentationV1(JSON.parse(segmentJson(text))).breakUtf16Offsets : [0] },
    }
  } })
}
