import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  renderFlowDocThaiOnePagePdfPilot,
  renderFlowDocThaiOnePagePdfPilotControlled,
  renderFlowDocLocalMeasuredDocumentPdf,
  renderFlowDocLocalMeasuredDocumentPdfControlled,
  type FlowDocPdfRendererPilotFontResource,
} from "../packages/pdf-renderer-pilot/src/full.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string }
  subset: { path: string; sha256: string }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json",
  )
  return {
    fontId: manifest.fontId,
    subsetId: manifest.subsetId,
    subsetPrefix: manifest.subsetPrefix,
    postScriptName: manifest.postScriptName,
    subsetSha256: manifest.subset.sha256,
    sourceBytes: readFileSync(resolve(process.cwd(), manifest.source.path)),
    subsetBytes: readFileSync(resolve(process.cwd(), manifest.subset.path)),
  }
}

function input() {
  return {
    proofId: "pdf-export-local-b-controlled-one-page",
    artifactId: "artifact:pdf-export-local-b-controlled-one-page",
    contract: createVNextPdfMeasuredDrawContractV1(
      readJson<VNextPdfMeasuredDrawContractRequestV1>(
        "fixtures/pdf-pilot-thai-one-page-request.v1.json",
      ),
    ),
    fontResources: [fontResource()],
  }
}

function localMeasuredInput() {
  const request = readJson<VNextPdfMeasuredDrawContractRequestV1>(
    "fixtures/pdf-pilot-thai-one-page-request.v1.json",
  )
  const contract = createVNextPdfMeasuredDrawContractV1({
    ...request,
    pilotId: "pdf-export-realdoc-d-generic-profile",
    rendererProfileId: "flowdoc-local-measured-document-v1",
  })
  return {
    proofId: "pdf-export-realdoc-d-generic-profile",
    artifactId: "artifact:pdf-export-realdoc-d-generic-profile",
    contract,
    fontResources: [fontResource()],
  }
}

describe("PDF-EXPORT-LOCAL-B controlled renderer execution", () => {
  it("retains exact synchronous bytes while checkpointing real paint-command serialization", async () => {
    const renderInput = input()
    const synchronous = renderFlowDocThaiOnePagePdfPilot(renderInput)
    const checkpoints: number[] = []
    const controlled = await renderFlowDocThaiOnePagePdfPilotControlled(renderInput, {
      checkpointEveryPaintCommands: 2,
      control: {
        async checkpoint(checkpoint) {
          checkpoints.push(checkpoint.paintCommandIndex)
          expect(checkpoint.totalPaintCommandCount).toBe(4)
          return { status: "continue" }
        },
      },
    })

    expect(synchronous.status).toBe("rendered")
    expect(controlled.status).toBe("rendered")
    if (synchronous.status !== "rendered" || controlled.status !== "rendered") {
      throw new Error("both renderer paths must produce bytes")
    }
    expect(checkpoints).toEqual([0, 2, 4])
    expect(controlled.bytes).toEqual(synchronous.bytes)
    expect(controlled.artifact).toEqual(synchronous.artifact)
    expect(controlled.summary).toEqual(synchronous.summary)
  })

  it("cooperatively cancels during paint-command serialization without returning partial bytes", async () => {
    const checkpoints: number[] = []
    const result = await renderFlowDocThaiOnePagePdfPilotControlled(input(), {
      checkpointEveryPaintCommands: 2,
      control: {
        async checkpoint(checkpoint) {
          checkpoints.push(checkpoint.paintCommandIndex)
          return checkpoint.paintCommandIndex >= 2 ? { status: "cancel" } : { status: "continue" }
        },
      },
    })

    expect(checkpoints).toEqual([0, 2])
    expect(result).toMatchObject({
      status: "cancelled",
      artifact: null,
      bytes: null,
      checkpoint: { paintCommandIndex: 2, totalPaintCommandCount: 4 },
      contracts: {
        cooperativeCancellation: true,
        fileWrites: false,
        storageWrites: false,
        productionBinding: false,
      },
    })
  })

  it("rejects an unbounded checkpoint interval before invoking renderer control", async () => {
    let checkpointCount = 0
    const result = await renderFlowDocThaiOnePagePdfPilotControlled(input(), {
      checkpointEveryPaintCommands: 10_001,
      control: {
        async checkpoint() {
          checkpointCount += 1
          return { status: "continue" }
        },
      },
    })

    expect(checkpointCount).toBe(0)
    expect(result).toMatchObject({
      status: "blocked",
      artifact: null,
      bytes: null,
      issues: [expect.objectContaining({ code: "checkpoint-interval-invalid" })],
    })
  })

  it("renders and cancels the bounded local measured-document profile without canonical fingerprint locks", async () => {
    const renderInput = localMeasuredInput()
    const first = renderFlowDocLocalMeasuredDocumentPdf(renderInput)
    const second = renderFlowDocLocalMeasuredDocumentPdf(renderInput)
    const cancelled = await renderFlowDocLocalMeasuredDocumentPdfControlled(renderInput, {
      checkpointEveryPaintCommands: 1,
      control: { async checkpoint() { return { status: "cancel" } } },
    })

    expect(first.status).toBe("rendered")
    expect(second.status).toBe("rendered")
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("local measured profile must render")
    expect(first.mode).toBe("local-measured-document")
    expect(second.bytes).toEqual(first.bytes)
    expect(first.artifact.rendererProfileId).toBe("flowdoc-local-measured-document-v1")
    expect(first.renderContract).toMatchObject({
      usesProvidedGlyphFacts: true,
      measuredVerticalGlyphOffsets: true,
      clusterActualTextFallback: true,
      productionFidelity: false,
      storageWrites: false,
    })
    expect(cancelled).toMatchObject({ status: "cancelled", bytes: null, artifact: null })
  })
})
