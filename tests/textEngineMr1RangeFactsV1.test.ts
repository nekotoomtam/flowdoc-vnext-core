import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1FullFactsV1,
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import {
  compareFlowDocTextEngineMr1RangeSegmentationToFullOracleV1,
  compareFlowDocTextEngineMr1RangeShapeToFullOracleV1,
  createFlowDocTextEngineMr1BoundedSegmentationV1,
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
} from "../packages/text-engine-rust-wasm/src/runtimeMr1Range.js"
import {
  createFlowDocTextEngineMr1RangeWorkerRuntimeV1,
  type FlowDocTextEngineMr1RangeWorkerRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/workerMr1Range.js"

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

const regular = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1[0]
const bold = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1[1]
let wasm: FlowDocTextEngineMr1RangeWorkerRuntimeV1

describe("MR1 contextual range shaping and bounded segmentation", () => {
  beforeAll(async () => {
    const wasmPath = resolve(
      process.cwd(),
      "packages/text-engine-rust-wasm/pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range_bg.wasm",
    )
    expect(sha256(wasmPath)).toBe(FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256)
    wasm = await createFlowDocTextEngineMr1RangeWorkerRuntimeV1({
      measurementProfileId: "measurement-profile-mr1-range",
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
      wasmBytes: arrayBuffer(readFileSync(wasmPath)),
      fonts: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => ({
        face: structuredClone(face),
        bytes: arrayBuffer(readFileSync(resolve(process.cwd(), face.fontAssetPath))),
      })),
    })
  }, 30_000)

  it("pins the separate artifact and proves native/WASM range shaping against full-run oracles", () => {
    expect(wasm.identity).toMatchObject({
      runtime: "browser-worker-wasm-mr1-range",
      boundaryVersion: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
      importsWasm: true,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    })

    const fixtures = [
      { text: "นำหน้าสวัสดีครับตูมตามหลัง", selected: "สวัสดีครับตูม", face: regular },
      { text: "prefix office affinity suffix", selected: "office affinity", face: bold },
      { text: "ภาษาไทย ABC office XYZ ภาษาไทย", selected: "ABC office XYZ", face: regular },
    ] as const

    for (const fixture of fixtures) {
      const rangeStartUtf16 = fixture.text.indexOf(fixture.selected)
      const rangeEndUtf16 = rangeStartUtf16 + fixture.selected.length
      const nativeFull = runFlowDocTextEngineNodeMr1FullFactsV1({
        text: fixture.text,
        fontId: fixture.face.fontFaceId,
        fontAssetPath: fixture.face.fontAssetPath,
        fontSha256: fixture.face.fontSha256,
      })
      const wasmFull = {
        shape: wasm.shapeFull({ text: fixture.text, fontFaceId: fixture.face.fontFaceId }),
        segmentation: wasm.segmentFull(fixture.text),
      }
      expect(wasmFull).toEqual(nativeFull)

      const nativeRange = runFlowDocTextEngineNodeMr1RangeShapeV1({
        text: fixture.text,
        fontId: fixture.face.fontFaceId,
        fontAssetPath: fixture.face.fontAssetPath,
        fontSha256: fixture.face.fontSha256,
        rangeStartUtf16,
        rangeEndUtf16,
        contextStartUtf16: 0,
        contextEndUtf16: fixture.text.length,
      })
      const wasmRange = wasm.shapeRange({
        text: fixture.text,
        fontFaceId: fixture.face.fontFaceId,
        rangeStartUtf16,
        rangeEndUtf16,
        contextStartUtf16: 0,
        contextEndUtf16: fixture.text.length,
      })
      expect(wasmRange).toEqual(nativeRange)
      expect(compareFlowDocTextEngineMr1RangeShapeToFullOracleV1({ range: nativeRange, full: nativeFull.shape })).toEqual({
        status: "exact",
        reasonCode: null,
        comparedFactCount: nativeRange.glyphs.length,
        mayPublishLayout: true,
      })
      expect(nativeRange.glyphs.every((glyph) => glyph.cluster >= nativeRange.rangeStartByte)).toBe(true)
      expect(nativeRange.glyphs.every((glyph) => glyph.cluster < nativeRange.rangeEndByte)).toBe(true)
    }
  }, 30_000)

  it("stabilizes bounded ICU4X context and proves the selected breaks against full-text oracles", () => {
    const unit = "ภาษาไทยทดสอบ line-wrap office affinity 12345 สวัสดีครับตูม "
    const text = unit.repeat(80)
    const targetStartUtf16 = unit.length * 35 + "ภาษาไทย".length
    const targetEndUtf16 = unit.length * 38 + "ภาษาไทยทดสอบ".length

    const nativeFull = runFlowDocTextEngineNodeMr1FullFactsV1({
      text,
      fontId: regular.fontFaceId,
      fontAssetPath: regular.fontAssetPath,
      fontSha256: regular.fontSha256,
    })
    const wasmFull = wasm.segmentFull(text)
    expect(wasmFull).toEqual(nativeFull.segmentation)

    const nativeBounded = createFlowDocTextEngineMr1BoundedSegmentationV1({
      text,
      targetStartUtf16,
      targetEndUtf16,
      initialContextUtf16: 32,
      maxContextUtf16: 512,
      requiredStableExpansionCount: 2,
      runtime: { segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1 },
    })
    const wasmBounded = createFlowDocTextEngineMr1BoundedSegmentationV1({
      text,
      targetStartUtf16,
      targetEndUtf16,
      initialContextUtf16: 32,
      maxContextUtf16: 512,
      requiredStableExpansionCount: 2,
      runtime: wasm,
    })
    expect(nativeBounded.status).toBe("bounded-stable")
    expect(nativeBounded.attempts).toHaveLength(3)
    expect(nativeBounded.oracleVerified).toBe(false)
    expect(nativeBounded.mayPublishLayout).toBe(false)
    expect(wasmBounded).toEqual(nativeBounded)
    expect(compareFlowDocTextEngineMr1RangeSegmentationToFullOracleV1({
      range: nativeBounded.facts,
      full: nativeFull.segmentation,
    })).toEqual({
      status: "exact",
      reasonCode: null,
      comparedFactCount: nativeBounded.facts.targetBreakByteOffsets.length,
      mayPublishLayout: true,
    })
    expect(nativeBounded.facts.summary.artificialContextBoundaryBreakCount).toBe(2)
  }, 30_000)

  it("fails closed when bounded segmentation needs the whole text or a range splits a surrogate", () => {
    const text = "สวัสดีครับตูม office affinity"
    const fullContext = createFlowDocTextEngineMr1BoundedSegmentationV1({
      text,
      targetStartUtf16: 1,
      targetEndUtf16: text.length - 1,
      initialContextUtf16: text.length,
      maxContextUtf16: text.length,
      runtime: wasm,
    })
    expect(fullContext).toMatchObject({
      status: "fallback-required",
      reasonCode: "full-context-required",
      oracleVerified: false,
      mayPublishLayout: false,
    })

    expect(() => wasm.shapeRange({
      text: "A😀B",
      fontFaceId: regular.fontFaceId,
      rangeStartUtf16: 1,
      rangeEndUtf16: 2,
      contextStartUtf16: 0,
      contextEndUtf16: 4,
    })).toThrow(/safe UTF-16 scalar boundary/u)
  })
})
