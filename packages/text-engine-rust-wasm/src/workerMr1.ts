import initFlowDocTextEngineMr1Wasm, {
  flowdoc_text_engine_mr1_wasm_boundary_version as mr1WasmBoundaryVersion,
  flowdoc_text_engine_wasm_readiness_marker as wasmReadinessMarker,
  flowdoc_text_engine_wasm_segment_json as wasmSegmentJson,
  flowdoc_text_engine_wasm_shape_json as wasmShapeJson,
} from "../pkg-live-draft-mr1/flowdoc_text_engine_mr1.js"
import { createFlowDocTextEngineMultiRunLayoutV1 } from "./multiRunLayout.js"
import type {
  FlowDocTextEngineMultiRunFontFaceV1,
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunLayoutResultV1,
} from "./multiRunLayoutContract.js"
import type { FlowDocTextEngineLiveDraftRawSegmentationV1 } from "./runtimeCommon.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
  normalizeFlowDocTextEngineMr1SegmentationV1,
  normalizeFlowDocTextEngineMr1ShapeV1,
  type FlowDocTextEngineMr1RawShapeV1,
} from "./runtimeMr1.js"

export interface FlowDocTextEngineMr1WorkerFontV1 {
  face: FlowDocTextEngineMultiRunFontFaceV1
  bytes: ArrayBuffer
}

export interface FlowDocTextEngineMr1WorkerInitializationV1 {
  measurementProfileId: string
  wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256
  wasmBytes: ArrayBuffer
  fonts: readonly FlowDocTextEngineMr1WorkerFontV1[]
}

export interface FlowDocTextEngineMr1WorkerIdentityV1 {
  runtime: "browser-worker-wasm-mr1"
  measurementProfileId: string
  wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256
  boundaryVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION
  fontSha256ById: Readonly<Record<string, string>>
  importsWasm: true
  executesRustybuzz: true
  executesIcu4x: true
  productionBinding: false
}

export interface FlowDocTextEngineMr1WorkerRuntimeV1 {
  identity: FlowDocTextEngineMr1WorkerIdentityV1
  layout(
    input: Omit<FlowDocTextEngineMultiRunLayoutInputV1, "fontFaces">,
  ): FlowDocTextEngineMultiRunLayoutResultV1
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export async function createFlowDocTextEngineMr1WorkerRuntimeV1(
  input: FlowDocTextEngineMr1WorkerInitializationV1,
): Promise<FlowDocTextEngineMr1WorkerRuntimeV1> {
  requireFact(input.measurementProfileId.trim().length > 0, "MR1 measurement profile id is required")
  requireFact(input.wasmSha256 === await sha256(input.wasmBytes), "MR1 WASM digest mismatch")
  requireFact(input.fonts.length > 0, "MR1 requires at least one pinned font face")
  const fontBytesById = new Map<string, Uint8Array>()
  const faceById = new Map<string, FlowDocTextEngineMultiRunFontFaceV1>()
  const fontSha256ById: Record<string, string> = {}
  for (const font of input.fonts) {
    const face = structuredClone(font.face)
    requireFact(face.fontFaceId.trim().length > 0 && !fontBytesById.has(face.fontFaceId), "MR1 font face is missing or duplicated")
    requireFact(face.fontSha256 === await sha256(font.bytes), `MR1 font digest mismatch: ${face.fontFaceId}`)
    fontBytesById.set(face.fontFaceId, new Uint8Array(font.bytes))
    faceById.set(face.fontFaceId, face)
    fontSha256ById[face.fontFaceId] = face.fontSha256
  }

  await initFlowDocTextEngineMr1Wasm({ module_or_path: new Uint8Array(input.wasmBytes) })
  requireFact(wasmReadinessMarker() === 2, "MR1 WASM engine readiness marker mismatch")
  requireFact(
    mr1WasmBoundaryVersion() === FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
    "MR1 WASM boundary version mismatch",
  )

  return {
    identity: {
      runtime: "browser-worker-wasm-mr1",
      measurementProfileId: input.measurementProfileId,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      boundaryVersion: FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
      fontSha256ById,
      importsWasm: true,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    },
    layout(layoutInput) {
      requireFact(
        layoutInput.measurement.measurementProfileId === input.measurementProfileId,
        "MR1 layout profile does not match the initialized Worker runtime",
      )
      return createFlowDocTextEngineMultiRunLayoutV1({
        ...structuredClone(layoutInput),
        fontFaces: [...faceById.values()].map((face) => structuredClone(face)),
      }, {
        runtimeKind: "browser-worker-wasm-mr1",
        shape({ text, fontFace }) {
          const fontBytes = fontBytesById.get(fontFace.fontFaceId)
          const initializedFace = faceById.get(fontFace.fontFaceId)
          requireFact(fontBytes != null && initializedFace != null, `MR1 font bytes unavailable: ${fontFace.fontFaceId}`)
          requireFact(
            initializedFace.fontSha256 === fontFace.fontSha256,
            `MR1 font request digest mismatch: ${fontFace.fontFaceId}`,
          )
          const raw = JSON.parse(wasmShapeJson(fontBytes, text, fontFace.fontFaceId)) as FlowDocTextEngineMr1RawShapeV1
          return normalizeFlowDocTextEngineMr1ShapeV1(raw)
        },
        segment(text) {
          const raw = JSON.parse(wasmSegmentJson(text)) as FlowDocTextEngineLiveDraftRawSegmentationV1
          return normalizeFlowDocTextEngineMr1SegmentationV1(raw)
        },
      })
    },
  }
}
