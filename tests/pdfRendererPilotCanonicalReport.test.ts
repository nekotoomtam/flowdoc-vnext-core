import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
  FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
  renderFlowDocCanonicalTwelvePageReportPdfPilot,
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
const IMAGE_BINDINGS = [
  { pageNumber: 1, assetId: IMAGE_IDS[0] },
  { pageNumber: 4, assetId: IMAGE_IDS[1] },
  { pageNumber: 5, assetId: IMAGE_IDS[0] },
  { pageNumber: 6, assetId: IMAGE_IDS[2] },
  { pageNumber: 7, assetId: IMAGE_IDS[4] },
  { pageNumber: 8, assetId: IMAGE_IDS[3] },
] as const
const SYNTHETIC_IMAGES = [
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGN4pmEkef0sAAnBAv4SDvbbAAAAAElFTkSuQmCC", "d41a637ff9cc4ba508d9b7a61baebf0f2070c3785ee301e05a7ce7ff51cb81cd"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGMQWRX1OnQpAAlJAv7fwr67AAAAAElFTkSuQmCC", "6bbf29b5c4d2616588a774fdbe7b23bc1718351a3d9385c8645e7990d50492d3"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQi7rzcKkyAAn9Av4acLDDAAAAAElFTkSuQmCC", "9ff65b17043f58cb49bd2415b87f9030c8d10231328d4561788e22b10b397247"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGO4s0pEOfQ1AArPAv72ImlIAAAAAElFTkSuQmCC", "919cae5a9b2ba9a4b220f3d4fdc3bec4d280a4ea925073e6eaa32921a43bd4ec"],
  ["iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOoMNrXftYRAAo5Av5whIo7AAAAAElFTkSuQmCC", "016ca6c345b0a40a2f954f471a6870eeb96ad0c643e41827fd4431d5b4453b96"],
] as const

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string }
  subset: { path: string; sha256: string }
}

interface CompositionFixture {
  pages: Array<{ pageNumber: number; pageId: string; marker: string }>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function syntheticRequest(): VNextPdfMeasuredDrawContractRequestV1 {
  const request = readJson<any>("fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json")
  request.imageAssets.forEach((asset: any, index: number) => {
    asset.sha256 = SYNTHETIC_IMAGES[index][1]
    asset.pixelWidth = 2
    asset.pixelHeight = 1
  })
  return request as VNextPdfMeasuredDrawContractRequestV1
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json",
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

function imageResources(): FlowDocPdfRendererPilotImageResource[] {
  return IMAGE_IDS.map((assetId, index) => ({
    assetId,
    bytes: Buffer.from(SYNTHETIC_IMAGES[index][0], "base64"),
  }))
}

function render(request = syntheticRequest()) {
  return renderFlowDocCanonicalTwelvePageReportPdfPilot({
    proofId: "pdf-pilot-07-synthetic-canonical-report",
    contract: createVNextPdfMeasuredDrawContractV1(request),
    fontResources: [fontResource()],
    imageResources: imageResources(),
  })
}

function decodeUtf16Be(hex: string): string {
  let output = ""
  for (let offset = 0; offset < hex.length; offset += 4) {
    output += String.fromCharCode(Number.parseInt(hex.slice(offset, offset + 4), 16))
  }
  return output
}

function extractActualTexts(bytes: Uint8Array): string[] {
  const pdf = Buffer.from(bytes).toString("latin1")
  return [...pdf.matchAll(/\/ActualText <FEFF([0-9A-F]+)>/gu)]
    .map((match) => decodeUtf16Be(match[1]))
}

describe("PDF-PILOT-07 canonical twelve-page report composition", () => {
  it("renders the canonical page markers, tables, shared resources, and measured Thai offsets", () => {
    const composition = readJson<CompositionFixture>("fixtures/pdf-pilot-canonical-report-composition.v1.json")
    const first = render()

    expect(first).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
      mode: FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
      status: "rendered",
      renderContract: {
        output: "multi-page-pdf-bytes",
        imagesSupported: true,
        sharedResourceObjects: true,
        canonicalPageComposition: true,
        requiredPageCount: 12,
        measuredVerticalGlyphOffsets: true,
        clusterActualTextFallback: true,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 12,
        paintCommandCount: 528,
        glyphRunCount: 357,
        glyphCount: 8549,
        embeddedFontCount: 1,
        imageCount: 5,
        fontResourceReferenceCount: 12,
        imageResourceReferenceCount: 6,
      },
      issues: [],
    })
    if (first.status !== "rendered") throw new Error("canonical report must render")
    expect(first.artifact.resourceReuse).toEqual({
      pageCount: 12,
      uniqueFontObjectCount: 1,
      uniqueImageObjectCount: 5,
      fontResourceReferenceCount: 12,
      imageResourceReferenceCount: 6,
    })
    expect(first.artifact.reportComposition).toEqual({
      requiredPageCount: 12,
      requiredImageAssetCount: 5,
      imagePaintCount: 6,
      pageMarkers: composition.pages.map((page) => page.marker),
      pageBindings: IMAGE_BINDINGS,
    })

    const pdf = Buffer.from(first.bytes).toString("latin1")
    const fontObjectReferences = [...pdf.matchAll(/\/F1 (\d+) 0 R/gu)].map((match) => match[1])
    expect((pdf.match(/\/Subtype \/Type0/gu) ?? [])).toHaveLength(1)
    expect((pdf.match(/\/Subtype \/Image/gu) ?? [])).toHaveLength(5)
    expect(fontObjectReferences).toHaveLength(12)
    expect(new Set(fontObjectReferences).size).toBe(1)
    expect([...pdf.matchAll(/\/Im1 (\d+) 0 R/gu)]).toHaveLength(2)
    expect((pdf.match(/\/Im1 Do/gu) ?? [])).toHaveLength(2)
    for (let index = 2; index <= 5; index += 1) {
      expect([...pdf.matchAll(new RegExp(`/Im${index} (\\d+) 0 R`, "gu"))]).toHaveLength(1)
      expect((pdf.match(new RegExp(`/Im${index} Do`, "gu")) ?? [])).toHaveLength(1)
    }
    expect((pdf.match(/\/Artifact BMC/gu) ?? []).length).toBeGreaterThan(0)
    expect((pdf.match(/<[0-9A-F]{4}> <>/gu) ?? []).length).toBeGreaterThan(0)
    const actualTexts = extractActualTexts(first.bytes)
    composition.pages.forEach((page) => expect(actualTexts).toContain(page.marker))
    expect(first.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
  }, 15_000)

  it("fails closed when profile, page count, page marker, or image binding drifts", () => {
    const request = syntheticRequest() as any
    request.rendererProfileId = "pdf-pilot-wrong-profile"

    const marker = "สรุปสำหรับผู้ตัดสินใจ"
    const markerPaint = request.paintCommands.find((command: any) => (
      command.pageIndex === 1 && command.kind === "glyph-run" && command.text === marker
    ))
    request.paintCommands = request.paintCommands.filter((command: any) => command.id !== markerPaint.id)
    request.plan.drawCommands = request.plan.drawCommands.filter((command: any) => (
      command.id !== markerPaint.sourceCommandId && command.pageIndex < 11
    ))
    request.paintCommands = request.paintCommands.filter((command: any) => command.pageIndex < 11)
    request.pageBoxes = request.pageBoxes.filter((page: any) => page.pageIndex < 11)
    request.plan.pageCount = 11
    request.plan.summary = {
      ...request.plan.summary,
      inputCommandCount: request.plan.drawCommands.length,
      drawCommandCount: request.plan.drawCommands.length,
      textCommandCount: request.plan.drawCommands.filter((command: any) => command.operation === "draw-text").length,
      boxCommandCount: request.plan.drawCommands.filter((command: any) => command.operation !== "draw-text").length,
    }
    const page5Image = request.paintCommands.find((command: any) => (
      command.pageIndex === 4 && command.kind === "image"
    ))
    page5Image.assetId = IMAGE_IDS[1]

    const result = render(request as VNextPdfMeasuredDrawContractRequestV1)
    expect(result).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "report-composition-profile",
      "report-composition-page-count",
      "report-composition-page-marker",
      "report-composition-image-binding",
    ]))
  })

  it("retains canonical composition, extraction, raster, and phase evidence", () => {
    const composition = readJson<any>("fixtures/pdf-pilot-canonical-report-composition.v1.json")
    const request = readJson<any>("fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json")
    const manifest = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json",
    )
    const summary = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json",
    )
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-qa.v1.json",
    )
    const doc = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_COMPOSITION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-canonical-report-request.mjs",
    ), "utf8")

    expect(composition).toMatchObject({
      compositionVersion: 1,
      referenceArtifact: {
        sha256: qa.referenceArtifact.sha256,
        bytes: qa.referenceArtifact.bytes,
        pageCount: 12,
      },
    })
    expect(composition.pages).toHaveLength(12)
    expect(request.plan).toMatchObject({
      pageCount: 12,
      summary: {
        drawCommandCount: 509,
        textCommandCount: 357,
        boxCommandCount: 152,
      },
    })
    expect(request.paintCommands).toHaveLength(528)
    expect(request.imageAssets).toHaveLength(5)
    expect(manifest).toMatchObject({
      subsetId: "pdf-pilot-07-ibm-plex-regular-canonical-report",
      subset: {
        sha256: qa.resourceInspection.font.subsetSha256,
        bytes: 37164,
        retainedGlyphIds: expect.any(Array),
      },
    })
    expect(manifest.subset.retainedGlyphIds).toHaveLength(138)
    expect(summary).toMatchObject({
      status: "rendered",
      referenceArtifact: composition.referenceArtifact,
      artifact: {
        sha256: qa.artifact.sha256,
        byteLength: qa.artifact.bytes,
        resourceReuse: {
          pageCount: 12,
          uniqueFontObjectCount: 1,
          uniqueImageObjectCount: 5,
          fontResourceReferenceCount: 12,
          imageResourceReferenceCount: 6,
        },
        reportComposition: {
          requiredPageCount: 12,
          requiredImageAssetCount: 5,
          imagePaintCount: 6,
        },
      },
      renderContract: {
        canonicalPageComposition: true,
        measuredVerticalGlyphOffsets: true,
        clusterActualTextFallback: true,
      },
      summary: {
        pageCount: 12,
        paintCommandCount: 528,
        glyphRunCount: 357,
        glyphCount: 8549,
      },
      externalReferenceBytesRetained: false,
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      composition: {
        drawCommandCount: 509,
        paintCommandCount: 528,
        textCommandCount: 357,
        boxCommandCount: 152,
        glyphCount: 8549,
      },
      clusterExecution: {
        runsWithMeasuredVerticalOffsets: 20,
        glyphsWithMeasuredVerticalOffsets: 21,
        continuationGlyphsPaintedAsArtifacts: true,
        actualTextRetainedPerRun: true,
      },
      textExtraction: {
        expectedGlyphRuns: 357,
        popplerExactRunPresence: 357,
        pypdfRawExactRunPresence: 311,
        pypdfThaiWhitespaceNormalizedRunPresence: 357,
      },
      rasterInspection: {
        pdftoppmAccepted: true,
        pdftocairoAccepted: true,
        allPagesNonBlank: true,
        allPageMarkersVisible: true,
        missingGlyphs: 0,
        clippedContent: 0,
        overlaps: 0,
      },
      referenceComparison: { pixelEquivalentClaim: false },
      deterministicRebuild: { unchanged: true },
      priorArtifactIdentityRegression: { unchanged: true },
      externalReferenceBytesRetained: false,
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(existsSync(resolve(process.cwd(), manifest.subset.path))).toBe(true)
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/OCR_Benchmark_INV_9437125258_TH_final.pdf",
    ))).toBe(false)
    IMAGE_IDS.forEach((assetId) => {
      expect(existsSync(resolve(
        process.cwd(),
        `packages/pdf-renderer-pilot/fixtures/images/${assetId}.png`,
      ))).toBe(false)
    })
    expect(builder).toContain("FLOWDOC_PDF_PILOT_REPORT_ROOT")
    expect(builder).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(doc).toContain("Status: PDF-PILOT-07 canonical twelve-page report composition proof accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-08` report-wide visual-diff calibration")
    expect(pilot).toContain("## PDF-PILOT-07 Scope")
    expect(readme).toContain("PDF canonical report composition")
    expect(ledger).toContain("## PDF-PILOT-07 Canonical Twelve-Page Report Composition")
  })
})
