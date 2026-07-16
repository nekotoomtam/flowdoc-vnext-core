import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
  FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE,
  renderFlowDocDigestBoundImageOnePagePdfPilot,
  renderFlowDocSharedResourcesMultiPagePdfPilot,
  type FlowDocPdfRendererPilotFontResource,
} from "../packages/pdf-renderer-pilot/src/index.js"

const SYNTHETIC_RGB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR42mP4z8DA0PAfAAgAAn8lPvwJAAAAAElFTkSuQmCC",
  "base64",
)
const SYNTHETIC_RGB_PNG_SHA256 = "d757a1d20084c463a0adae0b451d43199a67b18f8e2848b482c9dd7a2033cab4"
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

function syntheticRequest(path = "fixtures/pdf-pilot-shared-resources-three-page-request.v1.json"):
VNextPdfMeasuredDrawContractRequestV1 {
  const request = readJson<any>(path)
  request.imageAssets[0] = {
    ...request.imageAssets[0],
    sha256: SYNTHETIC_RGB_PNG_SHA256,
    pixelWidth: 2,
    pixelHeight: 1,
  }
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

function render(request = syntheticRequest()) {
  return renderFlowDocSharedResourcesMultiPagePdfPilot({
    proofId: "pdf-pilot-05-synthetic-shared-resources",
    contract: createVNextPdfMeasuredDrawContractV1(request),
    fontResources: [fontResource()],
    imageResources: [{ assetId: "ocr-accuracy-image", bytes: SYNTHETIC_RGB_PNG }],
  })
}

describe("PDF-PILOT-05 multi-page shared font/image resources", () => {
  it("renders three pages with one font object and one image object", () => {
    const first = render()
    const second = render()

    expect(first).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
      mode: FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE,
      status: "rendered",
      renderContract: {
        output: "multi-page-pdf-bytes",
        imagesSupported: true,
        sharedResourceObjects: true,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 3,
        paintCommandCount: 14,
        glyphRunCount: 6,
        glyphCount: 162,
        embeddedFontCount: 1,
        imageCount: 1,
        fontResourceReferenceCount: 3,
        imageResourceReferenceCount: 2,
      },
      issues: [],
    })
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("multi-page proof must render")
    expect(first.artifact.resourceReuse).toEqual({
      pageCount: 3,
      uniqueFontObjectCount: 1,
      uniqueImageObjectCount: 1,
      fontResourceReferenceCount: 3,
      imageResourceReferenceCount: 2,
    })

    const pdf = Buffer.from(first.bytes).toString("latin1")
    const fontObjectReferences = [...pdf.matchAll(/\/F1 (\d+) 0 R/gu)].map((match) => match[1])
    const imageObjectReferences = [...pdf.matchAll(/\/Im1 (\d+) 0 R/gu)].map((match) => match[1])
    expect((pdf.match(/\/Subtype \/Type0/gu) ?? [])).toHaveLength(1)
    expect((pdf.match(/\/Subtype \/Image/gu) ?? [])).toHaveLength(1)
    expect(fontObjectReferences).toHaveLength(3)
    expect(new Set(fontObjectReferences).size).toBe(1)
    expect(imageObjectReferences).toHaveLength(2)
    expect(new Set(imageObjectReferences).size).toBe(1)
    expect((pdf.match(/\/Im1 Do/gu) ?? [])).toHaveLength(2)
    expect(extractMappedRuns(first.bytes)).toEqual([...EXPECTED_LINES, ...EXPECTED_LINES, ...EXPECTED_LINES])
    expect(first.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
    expect(second.bytes).toEqual(first.bytes)
  })

  it("keeps one-page and multi-page profiles mutually fail-closed", () => {
    const onePageRequest = syntheticRequest("fixtures/pdf-pilot-image-one-page-request.v1.json")
    const onePageContract = createVNextPdfMeasuredDrawContractV1(onePageRequest)
    const oneAsMulti = renderFlowDocSharedResourcesMultiPagePdfPilot({
      proofId: "one-as-multi",
      contract: onePageContract,
      fontResources: [fontResource()],
      imageResources: [{ assetId: "ocr-accuracy-image", bytes: SYNTHETIC_RGB_PNG }],
    })
    const multiContract = createVNextPdfMeasuredDrawContractV1(syntheticRequest())
    const multiAsOne = renderFlowDocDigestBoundImageOnePagePdfPilot({
      proofId: "multi-as-one",
      contract: multiContract,
      fontResources: [fontResource()],
      imageResources: [{ assetId: "ocr-accuracy-image", bytes: SYNTHETIC_RGB_PNG }],
    })

    expect(oneAsMulti).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(oneAsMulti.issues.map((item) => item.code)).toContain("page-count")
    expect(multiAsOne).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(multiAsOne.issues.map((item) => item.code)).toContain("page-count")
  })

  it("retains actual object-reuse, extraction, raster, and phase evidence", () => {
    const request = readJson<any>("fixtures/pdf-pilot-shared-resources-three-page-request.v1.json")
    const summary = readJson<any>("packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-summary.v1.json")
    const qa = readJson<any>("packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-qa.v1.json")
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_MULTI_PAGE_RESOURCE_REUSE_PROOF.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-shared-resources-multi-page-proof-runtime.ts",
    ), "utf8")

    expect(request.plan).toMatchObject({
      pageCount: 3,
      summary: { drawCommandCount: 11, textCommandCount: 6, boxCommandCount: 5 },
    })
    expect(request.pageBoxes).toHaveLength(3)
    expect(request.paintCommands).toHaveLength(14)
    expect(summary).toMatchObject({
      status: "rendered",
      artifact: {
        sha256: qa.artifact.sha256,
        byteLength: qa.artifact.bytes,
        resourceReuse: {
          pageCount: 3,
          uniqueFontObjectCount: 1,
          uniqueImageObjectCount: 1,
          fontResourceReferenceCount: 3,
          imageResourceReferenceCount: 2,
        },
      },
      renderContract: { output: "multi-page-pdf-bytes", sharedResourceObjects: true },
      summary: {
        pageCount: 3,
        fontResourceReferenceCount: 3,
        imageResourceReferenceCount: 2,
      },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      resourceInspection: {
        font: { uniqueObjectCount: 1, pageReferences: [1, 2, 3] },
        image: { uniqueObjectCount: 1, pageReferences: [1, 2], absentFromPages: [3] },
      },
      textExtraction: {
        popplerExactMatchOnAllPages: true,
        pypdfExactMatchOnAllPages: true,
      },
      rasterInspection: {
        pdftoppmAccepted: true,
        pdftocairoAccepted: true,
        page1AndPage2PixelIdentical: true,
        page3HasNoImage: true,
        missingGlyphs: 0,
        clippedContent: 0,
        overlaps: 0,
      },
      singlePageIdentityRegression: { unchanged: true },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/images/ocr_accuracy.png",
    ))).toBe(false)
    expect(builder).toContain("FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE")
    expect(builder).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(doc).toContain("Status: PDF-PILOT-05 multi-page font/image resource reuse proof accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-06` all-five-image multi-page resource matrix.")
    expect(pilot).toContain("## PDF-PILOT-05 Scope")
    expect(readme).toContain("PDF multi-page resource reuse proof")
    expect(ledger).toContain("## PDF-PILOT-05 Multi-Page Font/Image Resource Reuse Proof")
  })
})
