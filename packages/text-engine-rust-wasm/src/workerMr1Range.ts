import initFlowDocTextEngineMr1RangeWasm, {
  flowdoc_text_engine_mr1_range_wasm_boundary_version as mr1RangeWasmBoundaryVersion,
  flowdoc_text_engine_wasm_readiness_marker as wasmReadinessMarker,
  flowdoc_text_engine_wasm_segment_json as wasmSegmentJson,
  flowdoc_text_engine_wasm_segment_range_json as wasmSegmentRangeJson,
  flowdoc_text_engine_wasm_shape_json as wasmShapeJson,
  flowdoc_text_engine_wasm_shape_range_json as wasmShapeRangeJson,
} from "../pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range.js"
import type { FlowDocTextEngineMultiRunFontFaceV1 } from "./multiRunLayoutContract.js"
import type { FlowDocTextEngineLiveDraftRawSegmentationV1 } from "./runtimeCommon.js"
import {
  normalizeFlowDocTextEngineMr1SegmentationV1,
  normalizeFlowDocTextEngineMr1ShapeV1,
  type FlowDocTextEngineMr1SegmentationFactsV1,
  type FlowDocTextEngineMr1ShapeFactsV1,
  type FlowDocTextEngineMr1RawShapeV1,
} from "./runtimeMr1.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
  flowDocUtf16RangeToUtf8BytesV1,
  normalizeFlowDocTextEngineMr1RangeSegmentationV1,
  normalizeFlowDocTextEngineMr1RangeShapeV1,
  type FlowDocTextEngineMr1RangeSegmentationFactsV1,
  type FlowDocTextEngineMr1RangeShapeFactsV1,
  type FlowDocTextEngineMr1RawRangeSegmentationV1,
  type FlowDocTextEngineMr1RawRangeShapeV1,
} from "./runtimeMr1Range.js"

export interface FlowDocTextEngineMr1RangeWorkerFontV1 {
  face: FlowDocTextEngineMultiRunFontFaceV1
  bytes: ArrayBuffer
}

export interface FlowDocTextEngineMr1RangeWorkerInitializationV1 {
  measurementProfileId: string
  wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256
  wasmBytes: ArrayBuffer
  fonts: readonly FlowDocTextEngineMr1RangeWorkerFontV1[]
}

export interface FlowDocTextEngineMr1RangeWorkerRuntimeV1 {
  identity: {
    runtime: "browser-worker-wasm-mr1-range"
    measurementProfileId: string
    wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256
    boundaryVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION
    fontSha256ById: Readonly<Record<string, string>>
    importsWasm: true
    executesRustybuzz: true
    executesIcu4x: true
    productionBinding: false
  }
  shapeFull(input: { text: string; fontFaceId: string }): FlowDocTextEngineMr1ShapeFactsV1
  segmentFull(text: string): FlowDocTextEngineMr1SegmentationFactsV1
  shapeRange(input: {
    text: string
    fontFaceId: string
    rangeStartUtf16: number
    rangeEndUtf16: number
    contextStartUtf16: number
    contextEndUtf16: number
  }): FlowDocTextEngineMr1RangeShapeFactsV1
  segmentRange(input: {
    text: string
    targetStartUtf16: number
    targetEndUtf16: number
    contextStartUtf16: number
    contextEndUtf16: number
  }): FlowDocTextEngineMr1RangeSegmentationFactsV1
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export async function createFlowDocTextEngineMr1RangeWorkerRuntimeV1(
  input: FlowDocTextEngineMr1RangeWorkerInitializationV1,
): Promise<FlowDocTextEngineMr1RangeWorkerRuntimeV1> {
  requireFact(input.measurementProfileId.trim().length > 0, "MR1 range measurement profile id is required")
  requireFact(input.wasmSha256 === await sha256(input.wasmBytes), "MR1 range WASM digest mismatch")
  requireFact(input.fonts.length > 0, "MR1 range runtime requires at least one pinned font face")

  const fontBytesById = new Map<string, Uint8Array>()
  const fontSha256ById: Record<string, string> = {}
  for (const font of input.fonts) {
    const face = structuredClone(font.face)
    requireFact(
      face.fontFaceId.trim().length > 0 && !fontBytesById.has(face.fontFaceId),
      "MR1 range font face is missing or duplicated",
    )
    requireFact(face.fontSha256 === await sha256(font.bytes), `MR1 range font digest mismatch: ${face.fontFaceId}`)
    fontBytesById.set(face.fontFaceId, new Uint8Array(font.bytes))
    fontSha256ById[face.fontFaceId] = face.fontSha256
  }

  await initFlowDocTextEngineMr1RangeWasm({ module_or_path: new Uint8Array(input.wasmBytes) })
  requireFact(wasmReadinessMarker() === 2, "MR1 range WASM engine readiness marker mismatch")
  requireFact(
    mr1RangeWasmBoundaryVersion() === FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
    "MR1 range WASM boundary version mismatch",
  )

  return {
    identity: {
      runtime: "browser-worker-wasm-mr1-range",
      measurementProfileId: input.measurementProfileId,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
      boundaryVersion: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
      fontSha256ById,
      importsWasm: true,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    },
    shapeFull({ text, fontFaceId }) {
      const fontBytes = fontBytesById.get(fontFaceId)
      requireFact(fontBytes != null, `MR1 range font bytes unavailable: ${fontFaceId}`)
      const raw = JSON.parse(wasmShapeJson(fontBytes, text, fontFaceId)) as FlowDocTextEngineMr1RawShapeV1
      return normalizeFlowDocTextEngineMr1ShapeV1(raw)
    },
    segmentFull(text) {
      const raw = JSON.parse(wasmSegmentJson(text)) as FlowDocTextEngineLiveDraftRawSegmentationV1
      return normalizeFlowDocTextEngineMr1SegmentationV1(raw)
    },
    shapeRange(rangeInput) {
      const fontBytes = fontBytesById.get(rangeInput.fontFaceId)
      requireFact(fontBytes != null, `MR1 range font bytes unavailable: ${rangeInput.fontFaceId}`)
      const range = flowDocUtf16RangeToUtf8BytesV1({
        text: rangeInput.text,
        startUtf16: rangeInput.rangeStartUtf16,
        endUtf16: rangeInput.rangeEndUtf16,
      })
      const context = flowDocUtf16RangeToUtf8BytesV1({
        text: rangeInput.text,
        startUtf16: rangeInput.contextStartUtf16,
        endUtf16: rangeInput.contextEndUtf16,
      })
      const raw = JSON.parse(wasmShapeRangeJson(
        fontBytes,
        rangeInput.text,
        rangeInput.fontFaceId,
        range.startByte,
        range.endByte,
        context.startByte,
        context.endByte,
      )) as FlowDocTextEngineMr1RawRangeShapeV1
      return normalizeFlowDocTextEngineMr1RangeShapeV1({ raw, fullText: rangeInput.text })
    },
    segmentRange(rangeInput) {
      const target = flowDocUtf16RangeToUtf8BytesV1({
        text: rangeInput.text,
        startUtf16: rangeInput.targetStartUtf16,
        endUtf16: rangeInput.targetEndUtf16,
      })
      const context = flowDocUtf16RangeToUtf8BytesV1({
        text: rangeInput.text,
        startUtf16: rangeInput.contextStartUtf16,
        endUtf16: rangeInput.contextEndUtf16,
      })
      const raw = JSON.parse(wasmSegmentRangeJson(
        rangeInput.text,
        target.startByte,
        target.endByte,
        context.startByte,
        context.endByte,
      )) as FlowDocTextEngineMr1RawRangeSegmentationV1
      return normalizeFlowDocTextEngineMr1RangeSegmentationV1({ raw, fullText: rangeInput.text })
    },
  }
}
