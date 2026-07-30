import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type {
  TextBlockNodeV4Target,
  VNextTextBlockInitialFlowV1,
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../src/index.js"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextAuthoredBoxPlanV1,
  createVNextLayoutUnitPolicyV1,
  createVNextTextBlockInitialFlowV1,
  createVNextTextBlockInitialFlowParentRegionV1,
} from "../src/index.js"
import { createVNextTextBlockUnifiedLayoutRootV1 } from
  "../src/layout/textBlockUnifiedLayoutRootV1.js"
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
    availableWidthPt: 90,
    measurementProfileId: "measurement-profile-flow-evidence-real-v2",
    styleKey: "paragraph-body",
    renderedText: text,
    runs: measurementRuns(text),
  }
}

function inputFixture(
  text: string,
  initialFlowFingerprint = `sha256:${"b".repeat(64)}`,
): FlowDocTextEngineFlowEvidenceInputV2 {
  return {
    initialFlowFingerprint,
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

function initialFlowFixture(text: string): VNextTextBlockInitialFlowV1 {
  const measurement = measurementFixture(text)
  const children: TextBlockNodeV4Target["children"] = measurement.runs.map((run) => {
    if (run.kind === "text") return {
      id: run.inlineId,
      type: "text" as const,
      text: run.renderedText,
    }
    if (run.kind === "hard-break") return { id: run.inlineId, type: "line-break" as const }
    if (run.kind === "inline-image") return {
      id: run.inlineId,
      type: "inline-image" as const,
      source: run.assetId == null
        ? { kind: "image-field-ref" as const, fieldKey: `field-${run.inlineId}` }
        : { kind: "asset-ref" as const, assetId: run.assetId },
      accessibility: { kind: "decorative" as const },
      frame: run.frame!,
      verticalAlign: "middle" as const,
    }
    throw new Error(`unsupported producer run: ${run.kind}`)
  })
  const textBlock: TextBlockNodeV4Target = {
    id: measurement.textBlockId,
    type: "text-block",
    role: { role: "paragraph" },
    props: {
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children,
  }
  const authoredBox = createVNextAuthoredBoxPlanV1({ ownerNode: textBlock, availableWidthPt: 100 })
  if (authoredBox.status !== "ready") throw new Error("producer authored box blocked")
  const parent = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: "body",
    ownerId: "body-zone",
    xLayoutUnit: 0,
    yLayoutUnit: 0,
    widthLayoutUnit: 100_000_000,
    availableHeightLayoutUnit: null,
  })
  if (parent.status !== "accepted") throw new Error("producer parent region blocked")
  const initial = createVNextTextBlockInitialFlowV1({
    textBlock,
    measurement,
    authoredBoxPlan: authoredBox.plan,
    parentRegion: parent.region,
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphFontFamilyKey: "sarabun",
    paragraphStyle: {
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
    },
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map(({
      fontAssetPath: _fontAssetPath,
      ...face
    }) => ({ ...face })),
  })
  if (initial.status !== "classified") throw new Error(`producer Initial Flow blocked: ${JSON.stringify(initial.issues)}`)
  return initial.flow
}

function normalizeRoot(root: unknown): unknown {
  // This producer parity test already compares source-neutral Core evidence.
  // Keep every retained root fact, including semantic and provenance facts.
  return root
}

describe("Flow Evidence V2 real Node/WASM parity", () => {
  it("rejects an own __proto__ data property before constructing the Node runtime", () => {
    const layout = inputFixture("A\uFFFCB")
    layout.fontFaces[0]!.fontAssetPath =
      "tests/fixtures/flow-evidence-runtime-construction-must-not-run.ttf"
    let inheritedGetterReadCount = 0
    const injectedPrototype = {}
    Object.defineProperty(injectedPrototype, "bindProductionLayout", {
      configurable: true,
      get: () => {
        inheritedGetterReadCount += 1
        return undefined
      },
    })
    Object.defineProperty(layout, "__proto__", {
      value: injectedPrototype,
      enumerable: true,
      configurable: true,
      writable: true,
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
    expect(inheritedGetterReadCount).toBe(0)
  })

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
      const initialFlow = initialFlowFixture(text)
      const layout = inputFixture(text, initialFlow.fingerprint)
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

      const nodeEvidence = acceptVNextTextBlockFlowEvidenceV2({
        initialFlow,
        evidenceInput: node.result.evidenceInput,
      })
      const wasmEvidence = acceptVNextTextBlockFlowEvidenceV2({
        initialFlow,
        evidenceInput: wasm.evidenceInput,
      })
      if (nodeEvidence.status !== "accepted" || wasmEvidence.status !== "accepted") {
        throw new Error("real producer evidence did not enter the Core acceptance boundary")
      }
      const nodeRoot = createVNextTextBlockUnifiedLayoutRootV1({
        inputAuthority: "core-synthetic-qa-only",
        initialFlow,
        evidence: nodeEvidence.evidence,
        spatialEntries: [],
      })
      const wasmRoot = createVNextTextBlockUnifiedLayoutRootV1({
        inputAuthority: "core-synthetic-qa-only",
        initialFlow,
        evidence: wasmEvidence.evidence,
        spatialEntries: [],
      })
      if (nodeRoot.status !== "accepted" || wasmRoot.status !== "accepted") {
        throw new Error("real producer evidence did not build the complete root")
      }
      expect(normalizeRoot(nodeRoot.root)).toEqual(normalizeRoot(wasmRoot.root))
      expect(nodeRoot.root.scene.fingerprint).toBe(wasmRoot.root.scene.fingerprint)
      expect(nodeRoot.root.fingerprint).toBe(wasmRoot.root.fingerprint)
    }
  }, 30_000)
})
