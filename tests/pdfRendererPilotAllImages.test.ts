import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE,
  FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
  renderFlowDocAllFiveImageMatrixPdfPilot,
  type FlowDocPdfRendererPilotFontResource,
  type FlowDocPdfRendererPilotImageResource,
} from "../packages/pdf-renderer-pilot/src/index.js"

const IMAGE_IDS = [
  "source-evidence-image",
  "ocr-accuracy-image",
  "native-extraction-image",
  "mapping-gap-image",
  "latency-rounds-image",
] as const
const SYNTHETIC_IMAGES = [
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGN4pmEkef0sAAnBAv4SDvbbAAAAAElFTkSuQmCC", "d41a637ff9cc4ba508d9b7a61baebf0f2070c3785ee301e05a7ce7ff51cb81cd"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGMQWRX1OnQpAAlJAv7fwr67AAAAAElFTkSuQmCC", "6bbf29b5c4d2616588a774fdbe7b23bc1718351a3d9385c8645e7990d50492d3"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQi7rzcKkyAAn9Av4acLDDAAAAAElFTkSuQmCC", "9ff65b17043f58cb49bd2415b87f9030c8d10231328d4561788e22b10b397247"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGO4s0pEOfQ1AArPAv72ImlIAAAAAElFTkSuQmCC", "919cae5a9b2ba9a4b220f3d4fdc3bec4d280a4ea925073e6eaa32921a43bd4ec"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOoMNrXftYRAAo5Av5whIo7AAAAAElFTkSuQmCC", "016ca6c345b0a40a2f954f471a6870eeb96ad0c643e41827fd4431d5b4453b96"],
] as const
const EXPECTED_LINES = [
  "สรุปผล OCR ภาษาไทย 100%",
  "ค้นหา เลือก และคัดลอกข้อความได้",
]

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

function syntheticRequest(): VNextPdfMeasuredDrawContractRequestV1 {
  const request = readJson<any>("fixtures/pdf-pilot-all-five-images-five-page-request.v1.json")
  request.imageAssets.forEach((asset: any, index: number) => {
    asset.sha256 = SYNTHETIC_IMAGES[index][1]
    asset.pixelWidth = 2
    asset.pixelHeight = 1
  })
  return request as VNextPdfMeasuredDrawContractRequestV1
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>("packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json")
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

function imageResources(): FlowDocPdfRendererPilotImageResource[] {
  return IMAGE_IDS.map((assetId, index) => ({
    assetId,
    bytes: Buffer.from(SYNTHETIC_IMAGES[index][0], "base64"),
  }))
}

function decodeUtf16Be(hex: string): string {
  let output = ""
  for (let offset = 0; offset < hex.length; offset += 4) {
    output += String.fromCharCode(Number.parseInt(hex.slice(offset, offset + 4), 16))
  }
  return output
}

function extractMappedRuns(bytes: Uint8Array): string[] {
  const pdf = Buffer.from(bytes).toString("latin1")
  const mappings = new Map<string, string>()
  for (const match of pdf.matchAll(/<([0-9A-F]{4})> <([0-9A-F]{4,})>/gu)) {
    if (match[1] !== "0000") mappings.set(match[1], decodeUtf16Be(match[2]))
  }
  return [...pdf.matchAll(/\[([^\x5D]+)\] TJ/gu)].map((match) => (
    [...match[1].matchAll(/<([0-9A-F]{4})>/gu)]
      .map((cid) => mappings.get(cid[1]) ?? "")
      .join("")
  ))
}

function render(
  request = syntheticRequest(),
  resources = imageResources(),
) {
  return renderFlowDocAllFiveImageMatrixPdfPilot({
    proofId: "pdf-pilot-06-synthetic-all-images",
    contract: createVNextPdfMeasuredDrawContractV1(request),
    fontResources: [fontResource()],
    imageResources: resources,
  })
}

describe("PDF-PILOT-06 all-five-image multi-page resource matrix", () => {
  it("renders five pages with one shared font and five distinct image objects", () => {
    const first = render()
    const second = render()

    expect(first).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
      mode: FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE,
      status: "rendered",
      renderContract: {
        output: "multi-page-pdf-bytes",
        imagesSupported: true,
        sharedResourceObjects: true,
        requiredImageAssetCount: 5,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 5,
        paintCommandCount: 25,
        glyphRunCount: 10,
        glyphCount: 270,
        embeddedFontCount: 1,
        imageCount: 5,
        fontResourceReferenceCount: 5,
        imageResourceReferenceCount: 5,
      },
      issues: [],
    })
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("all-images proof must render")
    expect(first.artifact.resourceReuse).toEqual({
      pageCount: 5,
      uniqueFontObjectCount: 1,
      uniqueImageObjectCount: 5,
      fontResourceReferenceCount: 5,
      imageResourceReferenceCount: 5,
    })
    expect(first.artifact.imageMatrix).toEqual({
      requiredAssetCount: 5,
      uniqueImageDigestCount: 5,
      assetIds: IMAGE_IDS,
      pageBindings: IMAGE_IDS.map((assetId, pageIndex) => ({ pageNumber: pageIndex + 1, assetId })),
    })

    const pdf = Buffer.from(first.bytes).toString("latin1")
    const fontObjectReferences = [...pdf.matchAll(/\/F1 (\d+) 0 R/gu)].map((match) => match[1])
    expect((pdf.match(/\/Subtype \/Type0/gu) ?? [])).toHaveLength(1)
    expect((pdf.match(/\/Subtype \/Image/gu) ?? [])).toHaveLength(5)
    expect(fontObjectReferences).toHaveLength(5)
    expect(new Set(fontObjectReferences).size).toBe(1)
    IMAGE_IDS.forEach((_, index) => {
      const resourceName = `Im${index + 1}`
      const references = [...pdf.matchAll(new RegExp(`/${resourceName} (\\d+) 0 R`, "gu"))]
      expect(references).toHaveLength(1)
      expect((pdf.match(new RegExp(`/${resourceName} Do`, "gu")) ?? [])).toHaveLength(1)
    })
    expect(extractMappedRuns(first.bytes)).toEqual(Array.from({ length: 5 }, () => EXPECTED_LINES).flat())
    expect(first.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
    expect(second.bytes).toEqual(first.bytes)
  })

  it("fails closed unless all five image identities are distinct and covered exactly once", () => {
    const wrongCountRequest = readJson<any>("fixtures/pdf-pilot-shared-resources-three-page-request.v1.json")
    wrongCountRequest.imageAssets[0].sha256 = SYNTHETIC_IMAGES[0][1]
    wrongCountRequest.imageAssets[0].pixelWidth = 2
    wrongCountRequest.imageAssets[0].pixelHeight = 1
    const wrongCount = render(
      wrongCountRequest as VNextPdfMeasuredDrawContractRequestV1,
      [{ assetId: "ocr-accuracy-image", bytes: Buffer.from(SYNTHETIC_IMAGES[0][0], "base64") }],
    )

    const duplicateDigestRequest = syntheticRequest() as any
    duplicateDigestRequest.imageAssets[4].sha256 = duplicateDigestRequest.imageAssets[3].sha256
    const duplicateDigestResources = imageResources()
    duplicateDigestResources[4] = {
      assetId: IMAGE_IDS[4],
      bytes: duplicateDigestResources[3].bytes,
    }
    const duplicateDigest = render(duplicateDigestRequest, duplicateDigestResources)

    const incompleteCoverageRequest = syntheticRequest() as any
    const lastImagePaint = incompleteCoverageRequest.paintCommands.find((command: any) => (
      command.kind === "image" && command.pageIndex === 4
    ))
    lastImagePaint.assetId = IMAGE_IDS[3]
    const incompleteCoverage = render(incompleteCoverageRequest)

    expect(wrongCount).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(wrongCount.issues.map((item) => item.code)).toContain("image-matrix-count")
    expect(wrongCount.issues.map((item) => item.code)).toContain("page-count")
    expect(duplicateDigest).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(duplicateDigest.issues.map((item) => item.code)).toContain("image-matrix-duplicate-digest")
    expect(incompleteCoverage).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(incompleteCoverage.issues.map((item) => item.code)).toContain("image-matrix-asset-coverage")
  })

  it("retains actual matrix, extraction, pixel, raster, and phase evidence", () => {
    const request = readJson<any>("fixtures/pdf-pilot-all-five-images-five-page-request.v1.json")
    const summary = readJson<any>("packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-summary.v1.json")
    const qa = readJson<any>("packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-qa.v1.json")
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_ALL_IMAGES_RESOURCE_MATRIX.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-all-images-multi-page-proof-runtime.ts",
    ), "utf8")

    expect(request.plan).toMatchObject({
      pageCount: 5,
      summary: { drawCommandCount: 20, textCommandCount: 10, boxCommandCount: 10 },
    })
    expect(request.imageAssets.map((asset: any) => asset.assetId)).toEqual(IMAGE_IDS)
    expect(request.pageBoxes).toHaveLength(5)
    expect(request.paintCommands).toHaveLength(25)
    expect(summary).toMatchObject({
      status: "rendered",
      artifact: {
        sha256: qa.artifact.sha256,
        byteLength: qa.artifact.bytes,
        resourceReuse: {
          pageCount: 5,
          uniqueFontObjectCount: 1,
          uniqueImageObjectCount: 5,
          fontResourceReferenceCount: 5,
          imageResourceReferenceCount: 5,
        },
        imageMatrix: {
          requiredAssetCount: 5,
          uniqueImageDigestCount: 5,
          assetIds: IMAGE_IDS,
        },
      },
      renderContract: {
        output: "multi-page-pdf-bytes",
        sharedResourceObjects: true,
        requiredImageAssetCount: 5,
      },
      summary: {
        pageCount: 5,
        imageCount: 5,
        fontResourceReferenceCount: 5,
        imageResourceReferenceCount: 5,
      },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      resourceInspection: {
        font: { uniqueObjectCount: 1, pageReferences: [1, 2, 3, 4, 5] },
        images: { uniqueObjectCount: 5, pageImageCounts: [1, 1, 1, 1, 1] },
      },
      textExtraction: {
        popplerExactMatchOnAllPages: true,
        pypdfExactMatchOnAllPages: true,
      },
      rasterInspection: {
        pdftoppmAccepted: true,
        pdftocairoAccepted: true,
        portraitAndLandscapeImagesVisible: true,
        missingGlyphs: 0,
        clippedContent: 0,
        overlaps: 0,
      },
      deterministicRebuild: { unchanged: true },
      priorArtifactIdentityRegression: { unchanged: true },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    IMAGE_IDS.forEach((assetId) => {
      expect(existsSync(resolve(
        process.cwd(),
        `packages/pdf-renderer-pilot/fixtures/images/${assetId}.png`,
      ))).toBe(false)
    })
    expect(builder).toContain("FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT")
    expect(builder).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(doc).toContain("Status: PDF-PILOT-06 all-five-image multi-page resource matrix accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-07` canonical 12-page report composition fixture.")
    expect(pilot).toContain("## PDF-PILOT-06 Scope")
    expect(readme).toContain("PDF all-images resource matrix")
    expect(ledger).toContain("## PDF-PILOT-06 All-Five-Image Multi-Page Resource Matrix")
  })
})
