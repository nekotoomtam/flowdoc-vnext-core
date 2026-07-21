import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { VNextTextBlockV4MeasurementRequest } from "../src/index.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import type { FlowDocTextEngineMultiRunLayoutInputV1 } from "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"
import { runFlowDocTextEngineNodeMultiRunLayoutV1 } from "../packages/text-engine-rust-wasm/src/node.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
} from "../packages/text-engine-rust-wasm/src/runtimeMr1.js"
import { createFlowDocTextEngineMr1WorkerRuntimeV1 } from "../packages/text-engine-rust-wasm/src/workerMr1.js"

const XR1_WASM_SHA256 = "60d24ed4b5546e580a8fa5dd05d774e7d8b7078958f7d327cf8f66ffcb5b3a85"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function measurementFixture(): VNextTextBlockV4MeasurementRequest {
  return {
    documentId: "document-mr1-real-engine",
    instanceRevision: 12,
    sectionId: "section-main",
    textBlockId: "text-block-real-mixed",
    availableWidthPt: 100,
    measurementProfileId: "measurement-profile-mr1-real-engine",
    styleKey: "paragraph-body",
    renderedText: "ABC",
    runs: [
      {
        inlineId: "regular-a",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
        localStyle: { fontSize: { value: 10, unit: "pt" } },
      },
      {
        inlineId: "bold-b",
        kind: "text",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "B",
        localStyle: { fontSize: { value: 24, unit: "pt" }, fontWeight: "bold" },
      },
      {
        inlineId: "field-c",
        kind: "resolved-field",
        fieldKey: "customer.initial",
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "C",
      },
    ],
  }
}

function inputFixture(): FlowDocTextEngineMultiRunLayoutInputV1 {
  return {
    layoutId: "real-engine-layout-mixed-001",
    measurement: measurementFixture(),
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: {
      styleKey: "paragraph-body",
      runStyle: {
        fontFamilyKey: "sarabun",
        fontSize: { value: 12, unit: "pt" },
        textColor: "202020",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
    },
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => clone(face)),
  }
}

describe("MR1 real Node/WASM multi-run facts", () => {
  it("retains the historical XR1 artifact and matches a separately pinned MR1 WASM artifact", async () => {
    const packageRoot = resolve(process.cwd(), "packages/text-engine-rust-wasm")
    const xr1WasmPath = resolve(packageRoot, "pkg-live-draft/flowdoc_text_engine_bg.wasm")
    const mr1WasmPath = resolve(packageRoot, "pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm")
    expect(sha256(xr1WasmPath)).toBe(XR1_WASM_SHA256)
    expect(sha256(mr1WasmPath)).toBe(FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256)

    const layoutInput = inputFixture()
    const node = runFlowDocTextEngineNodeMultiRunLayoutV1({
      layout: clone(layoutInput),
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
    })
    expect(node.identity).toMatchObject({
      runtime: "node-native-mr1",
      wasmExecution: false,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    })
    expect(node.result.status).toBe("accepted")
    if (node.result.status !== "accepted") throw new Error(node.result.issues.map((item) => item.message).join("\n"))

    const worker = await createFlowDocTextEngineMr1WorkerRuntimeV1({
      measurementProfileId: layoutInput.measurement.measurementProfileId,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      wasmBytes: arrayBuffer(readFileSync(mr1WasmPath)),
      fonts: layoutInput.fontFaces.map((face) => ({
        face: clone(face),
        bytes: arrayBuffer(readFileSync(resolve(process.cwd(), face.fontAssetPath))),
      })),
    })
    expect(worker.identity).toMatchObject({
      runtime: "browser-worker-wasm-mr1",
      boundaryVersion: FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      importsWasm: true,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    })
    const { fontFaces: _fontFaces, ...workerLayoutInput } = clone(layoutInput)
    const wasm = worker.layout(workerLayoutInput)
    expect(wasm.status).toBe("accepted")
    if (wasm.status !== "accepted") throw new Error(wasm.issues.map((item) => item.message).join("\n"))

    expect(wasm.request).toEqual(node.result.request)
    expect(wasm.layout).toEqual(node.result.layout)
    expect(wasm.request.fontFaces).toEqual([
      expect.objectContaining({
        fontFaceId: "sarabun-bold",
        unitsPerEm: 1_000,
        ascentFontUnit: 1_068,
        descentFontUnit: -232,
        lineGapFontUnit: 0,
      }),
      expect.objectContaining({
        fontFaceId: "sarabun-regular",
        unitsPerEm: 1_000,
        ascentFontUnit: 1_068,
        descentFontUnit: -232,
        lineGapFontUnit: 0,
      }),
    ])
    expect(wasm.layout.lines[0]).toMatchObject({
      naturalAscentLayoutUnit: 25_632_000,
      naturalDescentLayoutUnit: 5_568_000,
      naturalHeightLayoutUnit: 31_200_000,
      baselineOffsetLayoutUnit: 25_632_000,
      heightLayoutUnit: 31_200_000,
    })
    expect(wasm.layout.lines[0]!.fragments.map((fragment) => fragment.fontFaceId)).toEqual([
      "sarabun-regular",
      "sarabun-bold",
      "sarabun-regular",
    ])
  }, 30_000)

  it("keeps the MR1 runtime split external to Core and documents the paint blocker", () => {
    const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const coreIndex = read("src/index.ts")
    const sharedAdapter = read("packages/text-engine-rust-wasm/src/multiRunLayout.ts")
    const workerAdapter = read("packages/text-engine-rust-wasm/src/workerMr1.ts")
    const nodeAdapter = read("packages/text-engine-rust-wasm/src/node.ts")
    const generatedDeclaration = read(
      "packages/text-engine-rust-wasm/pkg-live-draft-mr1/flowdoc_text_engine_mr1.d.ts",
    )
    const packageJson = JSON.parse(read("packages/text-engine-rust-wasm/package.json")) as {
      scripts: Record<string, string>
    }
    const doc = read("docs/LIVE_DRAFT_MR1_ENGINE_FACTS.md")
    const handoff = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")

    expect(coreIndex).not.toContain("@flowdoc/text-engine-rust-wasm")
    expect(sharedAdapter).toContain("acceptVNextTextBlockMultiRunLayoutV1")
    expect(sharedAdapter).not.toMatch(/node:fs|node:crypto|WebAssembly|document\.|window\./u)
    expect(workerAdapter).toContain("pkg-live-draft-mr1")
    expect(workerAdapter).not.toMatch(/node:fs|node:crypto|node:child_process/u)
    expect(nodeAdapter).toContain("node:child_process")
    expect(generatedDeclaration).toContain("flowdoc_text_engine_mr1_wasm_boundary_version")
    expect(packageJson.scripts["wasm:build:live-draft"]).toBeUndefined()
    expect(packageJson.scripts["wasm:build:live-draft-mr1"]).toContain("pkg-live-draft-mr1")
    expect(packageJson.scripts["wasm:verify:live-draft-artifacts"]).toContain("verify-live-draft-artifacts")
    expect(doc).toContain("bounded real Chrome Worker parity slices accepted")
    expect(doc).toContain("per-fragment display-list and separate Editor QA Canvas slices are accepted")
    expect(handoff).toContain("External Engine Facts And Itemization")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Real Browser Worker Parity")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Core Per-Fragment Display List")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Editor QA Canvas Paint")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Multi-Line Multi-Glyph Canvas")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Rapid-Edit Lifecycle")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Multi-Block Scheduling And Frame Gate")
    expect(handoff).toMatch(/Product-bound multi-block scheduling[\s\S]{0,180}not\s+implemented/u)
  })
})
