import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE,
  FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
  renderFlowDocDigestBoundImageOnePagePdfPilot,
  type FlowDocPdfRendererPilotFontResource,
} from "../packages/pdf-renderer-pilot/src/index.js"

const SYNTHETIC_RGB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR42mP4z8DA0PAfAAgAAn8lPvwJAAAAAElFTkSuQmCC",
  "base64",
)
const SYNTHETIC_RGB_PNG_SHA256 = "d757a1d20084c463a0adae0b451d43199a67b18f8e2848b482c9dd7a2033cab4"

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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function request(): VNextPdfMeasuredDrawContractRequestV1 {
  const value = readJson<any>("fixtures/pdf-pilot-image-one-page-request.v1.json")
  value.imageAssets[0] = {
    ...value.imageAssets[0],
    sha256: SYNTHETIC_RGB_PNG_SHA256,
    pixelWidth: 2,
    pixelHeight: 1,
  }
  return value as VNextPdfMeasuredDrawContractRequestV1
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const value = readJson<SubsetManifest>("packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json")
  return {
    fontId: value.fontId,
    subsetId: value.subsetId,
    subsetPrefix: value.subsetPrefix,
    postScriptName: value.postScriptName,
    subsetSha256: value.subset.sha256,
    sourceBytes: readFileSync(resolve(process.cwd(), value.source.path)),
    subsetBytes: readFileSync(resolve(process.cwd(), value.subset.path)),
  }
}

function render(input = request()) {
  return renderFlowDocDigestBoundImageOnePagePdfPilot({
    proofId: "pdf-pilot-04-synthetic-image",
    contract: createVNextPdfMeasuredDrawContractV1(input),
    fontResources: [fontResource()],
    imageResources: [{ assetId: "ocr-accuracy-image", bytes: SYNTHETIC_RGB_PNG }],
  })
}

describe("PDF-PILOT-04 digest-bound image and complete one-page paint proof", () => {
  it("embeds deterministic PNG IDAT bytes as a digest-bound PDF image XObject", () => {
    const first = render()
    const second = render()

    expect(first).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
      mode: FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE,
      status: "rendered",
      renderContract: {
        consumes: "vnext-pdf-measured-draw-contract-v1",
        usesProvidedGlyphFacts: true,
        embeddedFontSubset: true,
        toUnicode: true,
        imagesSupported: true,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 1,
        paintCommandCount: 5,
        glyphRunCount: 2,
        glyphCount: 54,
        embeddedFontCount: 1,
        imageCount: 1,
      },
      issues: [],
    })
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("image proof must render")
    const pdf = Buffer.from(first.bytes).toString("latin1")
    expect(pdf).toContain("/Type /XObject /Subtype /Image")
    expect(pdf).toContain("/Width 2 /Height 1 /ColorSpace /DeviceRGB")
    expect(pdf).toContain("/Filter /FlateDecode")
    expect(pdf).toContain("/DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns 2 >>")
    expect(pdf).toContain("/Im1 Do")
    expect(pdf).toContain("456 0 0 228 78 344 cm")
    expect(first.artifact.embeddedImages).toEqual([{
      assetId: "ocr-accuracy-image",
      sha256: SYNTHETIC_RGB_PNG_SHA256,
      byteLength: SYNTHETIC_RGB_PNG.byteLength,
      pixelWidth: 2,
      pixelHeight: 1,
      colorSpace: "DeviceRGB",
      bitsPerComponent: 8,
      sourceFormat: "png",
      accessibility: {
        decorative: false,
        altText: "เปรียบเทียบความถูกต้องของ OCR ระหว่าง Google และ Azure",
      },
    }])
    expect(first.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
    expect(second.bytes).toEqual(first.bytes)
  })

  it("executes explicit cover and normalized crop through a clipped image matrix", () => {
    const value = request()
    const paintCommands = clone(value.paintCommands) as any[]
    const image = paintCommands.find((command) => command.kind === "image")
    image.fit = "cover"
    image.crop = { top: 0, right: 0.25, bottom: 0, left: 0.25 }
    const result = render({ ...value, paintCommands })

    expect(result.status).toBe("rendered")
    if (result.status !== "rendered") throw new Error("cover/crop proof must render")
    const pdf = Buffer.from(result.bytes).toString("latin1")
    expect(pdf).toContain("60 344 492 228 re W n")
    expect(pdf).toContain("60 212 492 492 re W n")
    expect(pdf).toContain("984 0 0 492 -186 212 cm")
  })

  it("blocks duplicate, tampered, malformed, and dimension-drifted image resources", () => {
    const value = request()
    const drifted = clone(value) as any
    drifted.imageAssets[0].pixelWidth = 3
    const tampered = Buffer.from(SYNTHETIC_RGB_PNG)
    tampered[50] ^= 0xff
    const result = renderFlowDocDigestBoundImageOnePagePdfPilot({
      proofId: "invalid-image-proof",
      contract: createVNextPdfMeasuredDrawContractV1(drifted),
      fontResources: [fontResource()],
      imageResources: [
        { assetId: "ocr-accuracy-image", bytes: tampered },
        { assetId: "ocr-accuracy-image", bytes: tampered },
      ],
    })

    expect(result).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "duplicate-image-resource",
      "image-hash-mismatch",
      "invalid-png",
    ]))

    const dimensionResult = render(drifted)
    expect(dimensionResult.status).toBe("blocked")
    expect(dimensionResult.issues.map((item) => item.code)).toContain("image-dimension-mismatch")
  })

  it("blocks unsupported JPEG declarations without attempting to reinterpret PNG bytes", () => {
    const value = request()
    const changed = clone(value) as any
    changed.imageAssets[0].mediaType = "image/jpeg"
    const result = render(changed)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toContain("unsupported-image-media-type")
  })

  it("retains pinned external-image, renderer, QA, and phase evidence without copying source bytes", () => {
    const actualRequest = readJson<any>("fixtures/pdf-pilot-image-one-page-request.v1.json")
    const corpus = readJson<any>("fixtures/pdf-report-font-bakeoff-corpus.v1.json")
    const summary = readJson<any>("packages/pdf-renderer-pilot/fixtures/image-one-page-proof-summary.v1.json")
    const qa = readJson<any>("packages/pdf-renderer-pilot/fixtures/image-one-page-proof-qa.v1.json")
    const pinned = corpus.referenceArtifacts.find((artifact: any) => artifact.artifactId === "ocr-accuracy-image")
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_IMAGE_ONE_PAGE_RENDERER_PROOF.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-image-one-page-proof-runtime.ts",
    ), "utf8")

    expect(actualRequest.imageAssets).toEqual([expect.objectContaining({
      assetId: pinned.artifactId,
      mediaType: pinned.mediaType,
      sha256: pinned.sha256,
      pixelWidth: 1950,
      pixelHeight: 900,
      bytesOwner: "backend",
    })])
    expect(summary).toMatchObject({
      status: "rendered",
      artifact: {
        sha256: qa.artifact.sha256,
        byteLength: qa.artifact.bytes,
        embeddedImages: [{
          assetId: pinned.artifactId,
          sha256: pinned.sha256,
          byteLength: pinned.bytes,
          pixelWidth: 1950,
          pixelHeight: 900,
          sourceFormat: "png",
          accessibility: actualRequest.imageAssets[0].accessibility,
        }],
      },
      renderContract: { imagesSupported: true, productionFidelity: false },
      summary: { imageCount: 1 },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      imageInspection: {
        sourceSha256: pinned.sha256,
        sourceBytes: pinned.bytes,
        pypdfRoundTripSha256: pinned.sha256,
        exactByteIdentity: true,
      },
      textExtraction: { popplerExactMatch: true, pypdfExactMatch: true },
      rasterInspection: {
        visualReview: "accepted",
        imageAspectPreserved: true,
        imageClipped: false,
        imageDistorted: false,
        paintOrderCorrect: true,
        textRegression: false,
      },
      externalImageBytesRetained: false,
      productionBinding: false,
    })
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/images/ocr_accuracy.png",
    ))).toBe(false)
    expect(builder).toContain("FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE")
    expect(builder).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(doc).toContain("Status: PDF-PILOT-04 digest-bound image and complete one-page paint proof accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-05` multi-page font/image resource reuse proof.")
    expect(pilot).toContain("## PDF-PILOT-04 Scope")
    expect(readme).toContain("PDF image one-page renderer proof")
    expect(ledger).toContain("## PDF-PILOT-04 Digest-Bound Image One-Page Paint Proof")
  })
})
