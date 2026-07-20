import initFlowDocTextEngineWasm, {
  flowdoc_text_engine_wasm_boundary_version as wasmBoundaryVersion,
  flowdoc_text_engine_wasm_readiness_marker as wasmReadinessMarker,
  flowdoc_text_engine_wasm_segment_json as wasmSegmentJson,
  flowdoc_text_engine_wasm_shape_json as wasmShapeJson,
} from "../pkg-live-draft/flowdoc_text_engine.js"
import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION,
  normalizeFlowDocTextEngineLiveDraftResultV1,
  type FlowDocTextEngineLiveDraftNormalizedResultV1,
  type FlowDocTextEngineLiveDraftRawSegmentationV1,
  type FlowDocTextEngineLiveDraftRawShapeV1,
} from "./runtimeCommon.js"

export type { FlowDocTextEngineLiveDraftNormalizedResultV1 } from "./runtimeCommon.js"
export { createFlowDocTextEngineLiveDraftMeasurementV1 } from "./liveDraftLayout.js"

export interface FlowDocTextEngineWorkerFontV1 {
  fontId: string
  sha256: string
  bytes: ArrayBuffer
}

export interface FlowDocTextEngineWorkerInitializationV1 {
  measurementProfileId: string
  wasmSha256: string
  wasmBytes: ArrayBuffer
  fonts: readonly FlowDocTextEngineWorkerFontV1[]
}

export interface FlowDocTextEngineWorkerIdentityV1 {
  runtime: "browser-worker-wasm"
  measurementProfileId: string
  wasmSha256: string
  boundaryVersion: typeof FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION
  fontSha256ById: Readonly<Record<string, string>>
  importsWasm: true
  executesRustybuzz: true
  executesIcu4x: true
}

export interface FlowDocTextEngineWorkerRuntimeV1 {
  identity: FlowDocTextEngineWorkerIdentityV1
  measure(input: {
    text: string
    fontId: string
    fontSha256: string
  }): FlowDocTextEngineLiveDraftNormalizedResultV1
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export async function createFlowDocTextEngineWorkerRuntimeV1(
  input: FlowDocTextEngineWorkerInitializationV1,
): Promise<FlowDocTextEngineWorkerRuntimeV1> {
  requireFact(input.measurementProfileId.length > 0, "measurement profile id is required")
  requireFact(input.wasmSha256 === await sha256(input.wasmBytes), "WASM digest mismatch")
  requireFact(input.fonts.length > 0, "at least one font is required")
  const fontBytesById = new Map<string, Uint8Array>()
  const fontSha256ById: Record<string, string> = {}
  for (const font of input.fonts) {
    requireFact(font.fontId.length > 0 && !fontBytesById.has(font.fontId), "font identity is missing or duplicated")
    requireFact(font.sha256 === await sha256(font.bytes), `font digest mismatch: ${font.fontId}`)
    fontBytesById.set(font.fontId, new Uint8Array(font.bytes))
    fontSha256ById[font.fontId] = font.sha256
  }
  await initFlowDocTextEngineWasm({ module_or_path: new Uint8Array(input.wasmBytes) })
  requireFact(wasmReadinessMarker() === 2, "WASM engine readiness marker mismatch")
  requireFact(wasmBoundaryVersion() === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION, "WASM boundary version mismatch")

  return {
    identity: {
      runtime: "browser-worker-wasm",
      measurementProfileId: input.measurementProfileId,
      wasmSha256: input.wasmSha256,
      boundaryVersion: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION,
      fontSha256ById,
      importsWasm: true,
      executesRustybuzz: true,
      executesIcu4x: true,
    },
    measure(request) {
      const fontBytes = fontBytesById.get(request.fontId)
      requireFact(fontBytes != null, `font bytes are unavailable: ${request.fontId}`)
      requireFact(fontSha256ById[request.fontId] === request.fontSha256, `font request digest mismatch: ${request.fontId}`)
      const shape = JSON.parse(wasmShapeJson(fontBytes, request.text, request.fontId)) as FlowDocTextEngineLiveDraftRawShapeV1
      const segmentation = JSON.parse(wasmSegmentJson(request.text)) as FlowDocTextEngineLiveDraftRawSegmentationV1
      return normalizeFlowDocTextEngineLiveDraftResultV1({ shape, segmentation })
    },
  }
}
