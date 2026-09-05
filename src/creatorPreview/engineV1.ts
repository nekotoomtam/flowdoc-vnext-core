import { fingerprintVNextCreatorPreviewV1 } from "./contentV1.js"

export const VNEXT_CREATOR_PREVIEW_WASM_SHA256_V1 = "cc130a7f8cef2694f8518cecb93b518eac2496fa8f4141f62ca284e6f34b0857"
export const VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1 = "b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d"
export const VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1 = Object.freeze({
  pageWidthPt: 210 * 72 / 25.4, pageHeightPt: 297 * 72 / 25.4, marginPt: 36,
  fontSizePt: 12, lineHeightPt: 18, color: "000000", direction: "ltr", maxPages: 100,
})
export interface VNextCreatorPreviewEngineIdentityV1 {
  pipelineVersion: "creator-text-preview/1"; measurementProfileId: string; wasmSha256: string
  fontId: "sarabun-regular"; fontSha256: string; layoutProfileFingerprint: string
}
export interface VNextCreatorPreviewGlyphFactV1 {
  glyphId: number; clusterUtf16: number; xAdvance: number; yAdvance: number; xOffset: number; yOffset: number
}
export interface VNextCreatorPreviewShapeFactsV1 {
  text: string; unitsPerEm: number; ascentFontUnit: number; descentFontUnit: number
  glyphs: VNextCreatorPreviewGlyphFactV1[]
}
export interface VNextCreatorPreviewMeasurementEngineV1 { readonly identity: Readonly<VNextCreatorPreviewEngineIdentityV1> }
export interface VNextCreatorPreviewRawMeasurementProviderV1 {
  shape(text: string): VNextCreatorPreviewShapeFactsV1
  segment(text: string): number[]
}
const engines = new WeakMap<object, VNextCreatorPreviewRawMeasurementProviderV1>()
export function creatorPreviewEngineProviderV1(engine: unknown): VNextCreatorPreviewRawMeasurementProviderV1 | undefined {
  return engine != null && typeof engine === "object" ? engines.get(engine) : undefined
}
async function digest(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("")
}
/** Trusted executable adapter boundary, never a wire-data API. The initializer must bind
 * the supplied owned assets to its engine. A hostile host executable is outside this boundary.
 * Core verifies asset pins; the adapter verifies engine ABI and normalizes raw facts.
 * Ordinary layout callers cannot fabricate an engine by echoing a serialized identity.
 */
export async function createVNextCreatorPreviewMeasurementEngineV1(input: {
  measurementProfileId: string; wasmBytes: ArrayBuffer; fontBytes: ArrayBuffer
  initialize(assets: { wasmBytes: Uint8Array<ArrayBuffer>; fontBytes: Uint8Array<ArrayBuffer> }): Promise<VNextCreatorPreviewRawMeasurementProviderV1>
}): Promise<VNextCreatorPreviewMeasurementEngineV1> {
  const wasmBytes = new Uint8Array(input.wasmBytes.slice(0)), fontBytes = new Uint8Array(input.fontBytes.slice(0))
  const profileId = input.measurementProfileId, initialize = input.initialize
  if (typeof profileId !== "string" || profileId.length === 0 || profileId.length > 512) throw new Error("Invalid measurement profile")
  if (await digest(wasmBytes) !== VNEXT_CREATOR_PREVIEW_WASM_SHA256_V1) throw new Error("Creator WASM digest mismatch")
  if (await digest(fontBytes) !== VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1) throw new Error("Creator font digest mismatch")
  const provider = await initialize({ wasmBytes, fontBytes })
  const engine = Object.freeze({ identity: Object.freeze({ pipelineVersion: "creator-text-preview/1" as const, measurementProfileId: profileId,
    wasmSha256: VNEXT_CREATOR_PREVIEW_WASM_SHA256_V1, fontId: "sarabun-regular" as const, fontSha256: VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1,
    layoutProfileFingerprint: fingerprintVNextCreatorPreviewV1(VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1),
  }) })
  engines.set(engine, { shape: provider.shape.bind(provider), segment: provider.segment.bind(provider) })
  return engine
}
