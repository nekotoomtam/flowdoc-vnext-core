import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../src/index.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from
  "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import type { FlowDocTextEngineFlowEvidenceInputV2 } from
  "../packages/text-engine-rust-wasm/src/multiRunFlowEvidenceContractV2.js"
import { runFlowDocTextEngineNodeFlowEvidenceV2 } from
  "../packages/text-engine-rust-wasm/src/node.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
} from "../packages/text-engine-rust-wasm/src/runtimeMr1.js"
import { createFlowDocTextEngineMr1WorkerRuntimeV1 } from
  "../packages/text-engine-rust-wasm/src/workerMr1.js"

const PARITY_ROWS = [
  "\uFFFC",
  "A\uFFFCB",
  "ภาษา\uFFFCไทย",
  "A\uFFFC\uFFFCB",
  "\uFFFC\n\uFFFC",
] as const

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function measurementRuns(text: string): VNextTextBlockV4MeasurementRun[] {
  const runs: VNextTextBlockV4MeasurementRun[] = []
  let textStart = 0
  let offset = 0
  const flushText = (endOffset: number) => {
    if (endOffset === textStart) return
    runs.push({
      inlineId: `text-${textStart}-${endOffset}`,
      kind: "text",
      renderStartOffset: textStart,
      renderEndOffset: endOffset,
      renderedText: text.slice(textStart, endOffset),
      styleKey: "paragraph-body",
    })
  }
  for (const scalar of text) {
    const endOffset = offset + scalar.length
    if (scalar === "\uFFFC" || scalar === "\n") {
      flushText(offset)
      runs.push(scalar === "\uFFFC"
        ? {
            inlineId: `image-${offset}`,
            kind: "inline-image",
            renderStartOffset: offset,
            renderEndOffset: endOffset,
            renderedText: scalar,
            assetId: `asset-${offset}`,
            frame: {
              width: { value: 10, unit: "pt" },
              height: { value: 12, unit: "pt" },
              fit: "contain",
            },
          }
        : {
            inlineId: `break-${offset}`,
            kind: "hard-break",
            renderStartOffset: offset,
            renderEndOffset: endOffset,
            renderedText: scalar,
          })
      textStart = endOffset
    }
    offset = endOffset
  }
  flushText(text.length)
  return runs
}

function measurementFixture(text: string): VNextTextBlockV4MeasurementRequest {
  return {
    documentId: "document-flow-evidence-real-v2",
    instanceRevision: 22,
    sectionId: "section-main",
    textBlockId: `text-block-flow-${text.length}`,
    availableWidthPt: 100,
    measurementProfileId: "measurement-profile-flow-evidence-real-v2",
    styleKey: "paragraph-body",
    renderedText: text,
    runs: measurementRuns(text),
  }
}

function inputFixture(text: string): FlowDocTextEngineFlowEvidenceInputV2 {
  return {
    initialFlowFingerprint: `sha256:${"b".repeat(64)}`,
    layoutId: `flow-evidence-real-${text.length}`,
    measurement: measurementFixture(text),
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

describe("Flow Evidence V2 real Node/WASM parity", () => {
  it("rejects invalid width before reading font runtime facts", () => {
    const layout = inputFixture("A\uFFFCB")
    layout.measurement.availableWidthPt = 0
    let fontPathReadCount = 0
    Object.defineProperty(layout.fontFaces[0]!, "fontAssetPath", {
      enumerable: true,
      configurable: true,
      get: () => {
        fontPathReadCount += 1
        throw new Error("font runtime construction reached")
      },
    })

    let node: ReturnType<typeof runFlowDocTextEngineNodeFlowEvidenceV2> | undefined
    expect(() => {
      node = runFlowDocTextEngineNodeFlowEvidenceV2({
        layout,
        wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      })
    }).not.toThrow()
    expect(node?.result).toMatchObject({
      status: "blocked",
      evidenceInput: null,
      fingerprint: null,
      issues: [expect.objectContaining({ code: "invalid-layout-input" })],
    })
    expect(fontPathReadCount).toBe(0)
  })

  it("keeps U+FFFC and hard breaks outside shaping with identical Core evidence", async () => {
    const packageRoot = resolve(process.cwd(), "packages/text-engine-rust-wasm")
    const mr1WasmPath = resolve(
      packageRoot,
      "pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm",
    )
    expect(sha256(mr1WasmPath)).toBe(FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256)
    const firstInput = inputFixture(PARITY_ROWS[0])
    const worker = await createFlowDocTextEngineMr1WorkerRuntimeV1({
      measurementProfileId: firstInput.measurement.measurementProfileId,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      wasmBytes: arrayBuffer(readFileSync(mr1WasmPath)),
      fonts: firstInput.fontFaces.map((face) => ({
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

    for (const text of PARITY_ROWS) {
      const layout = inputFixture(text)
      const node = runFlowDocTextEngineNodeFlowEvidenceV2({
        layout: clone(layout),
        wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      })
      expect(node.identity).toMatchObject({
        runtime: "node-native-mr1",
        wasmExecution: false,
        executesRustybuzz: true,
        executesIcu4x: true,
        productionBinding: false,
      })
      expect(node.result.status, JSON.stringify({ text, issues: node.result.issues })).toBe(
        "accepted",
      )
      if (node.result.status !== "accepted") throw new Error("Node V2 evidence blocked")

      const { fontFaces: _fontFaces, ...workerInput } = clone(layout)
      const wasm = worker.flowEvidence(workerInput)
      expect(wasm.status, JSON.stringify({ text, issues: wasm.issues })).toBe("accepted")
      if (wasm.status !== "accepted") throw new Error("WASM V2 evidence blocked")

      expect(wasm.evidenceInput).toEqual(node.result.evidenceInput)
      expect(wasm.evidenceInput.breakOffsets).toEqual(
        node.result.evidenceInput.breakOffsets,
      )
      expect(wasm.evidenceInput.shapingRuns.every((run) => (
        !run.text.includes("\uFFFC") && !run.text.includes("\n")
      ))).toBe(true)
    }
  }, 30_000)
})
