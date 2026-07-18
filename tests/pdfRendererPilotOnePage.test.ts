import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
  type VNextPdfPaintCommandV1,
} from "../src/index.js"
import {
  FLOWDOC_PDF_RENDERER_PILOT_MODE,
  FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
  renderFlowDocThaiOnePagePdfPilot,
  type FlowDocPdfRendererPilotFontResource,
} from "../packages/pdf-renderer-pilot/src/full.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string; sha256: string; bytes: number }
  subset: {
    path: string
    sha256: string
    bytes: number
    sfntGlyphCount: number
    retainedGlyphIds: number[]
    retainGlyphIds: boolean
  }
  license: { path: string; reservedNameRemovedFromDerivative: boolean }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function request(path = "fixtures/pdf-pilot-thai-one-page-request.v1.json"): VNextPdfMeasuredDrawContractRequestV1 {
  return readJson<VNextPdfMeasuredDrawContractRequestV1>(path)
}

function manifest(): SubsetManifest {
  return readJson<SubsetManifest>("packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json")
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const value = manifest()
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

describe("PDF-PILOT-03 Thai embedded-font one-page renderer proof", () => {
  it("renders deterministic Type0 PDF bytes from actual measured glyph facts", () => {
    const contract = createVNextPdfMeasuredDrawContractV1(request())
    const first = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-03-thai-one-page",
      contract,
      fontResources: [fontResource()],
    })
    const second = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-03-thai-one-page",
      contract,
      fontResources: [fontResource()],
    })

    expect(first).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
      mode: FLOWDOC_PDF_RENDERER_PILOT_MODE,
      status: "rendered",
      proofId: "pdf-pilot-03-thai-one-page",
      renderContract: {
        consumes: "vnext-pdf-measured-draw-contract-v1",
        usesProvidedGlyphFacts: true,
        embeddedFontSubset: true,
        toUnicode: true,
        imagesSupported: false,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 1,
        paintCommandCount: 4,
        glyphRunCount: 2,
        glyphCount: 54,
        embeddedFontCount: 1,
        imageCount: 0,
      },
      issues: [],
    })
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("proof must render")
    const pdf = Buffer.from(first.bytes)
    expect(pdf.subarray(0, 8).toString("ascii")).toBe("%PDF-1.7")
    expect(pdf.toString("latin1")).toContain("/Subtype /Type0")
    expect(pdf.toString("latin1")).toContain("/Subtype /CIDFontType2")
    expect(pdf.toString("latin1")).toContain("/ToUnicode")
    expect(pdf.toString("latin1")).toContain("/CIDToGIDMap")
    expect(pdf.toString("latin1")).toContain("/ActualText")
    expect(pdf.toString("latin1")).toContain("FDPLTA+FlowDocThaiPilotSubset-Regular")
    expect(extractMappedRuns(first.bytes)).toEqual([
      "สรุปผล OCR ภาษาไทย 100%",
      "ค้นหา เลือก และคัดลอกข้อความได้",
    ])
    expect(first.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
    expect(first.artifact).toMatchObject({
      storageStatus: "not-stored",
      localOnly: true,
      sourceContractFingerprint: contract.status === "consumable" ? contract.fingerprint : "",
      embeddedFonts: [{
        fontId: "ibm-plex-sans-thai-regular",
        fontFormat: "Type0/CIDFontType2",
        toUnicode: true,
      }],
      embeddedImages: [],
    })
    expect(second.bytes).toEqual(first.bytes)
    expect(second.artifact.sha256).toBe(first.artifact.sha256)
  })

  it("writes axis-aligned stroke-line commands as PDF path operators", () => {
    const fixture = request()
    const bounds = { xPt: 60, yPt: 184, widthPt: 492, heightPt: 0 }
    fixture.plan.drawCommands.push({
      id: "pdf:pilot:panel-rule",
      sourceCommandId: "render:pilot:panel-rule",
      fragmentId: "fragment:pilot:panel-rule",
      pageIndex: 0,
      pageNumber: 1,
      operation: "draw-fragment-box",
      nodeId: "pilot-panel-rule",
      nodeType: "zone",
      bounds,
      text: null,
      table: null,
    })
    fixture.plan.summary.inputCommandCount += 1
    fixture.plan.summary.drawCommandCount += 1
    fixture.plan.summary.boxCommandCount += 1
    const paintCommands = fixture.paintCommands as VNextPdfPaintCommandV1[]
    paintCommands.push({
      id: "paint:pilot:panel-rule",
      sourceCommandId: "pdf:pilot:panel-rule",
      pageIndex: 0,
      paintOrder: 4,
      bounds,
      kind: "stroke-line",
      color: "A7BAC8",
      opacity: 1,
      widthPt: 0.75,
      style: "solid",
    })

    const contract = createVNextPdfMeasuredDrawContractV1(fixture)
    const result = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-stroke-line",
      contract,
      fontResources: [fontResource()],
    })

    expect(contract).toMatchObject({
      status: "consumable",
      summary: { paintCommandCount: 5, strokeLineCount: 1 },
    })
    expect(result).toMatchObject({
      status: "rendered",
      summary: { pageCount: 1, paintCommandCount: 5 },
    })
    if (result.status !== "rendered") throw new Error("stroke-line proof must render")
    expect(Buffer.from(result.bytes).toString("latin1")).toContain("60 608 m 552 608 l S")
  })

  it("tolerates sub-micro-point accumulation but still blocks real glyph overflow", () => {
    const withinTolerance = request()
    const withinPaint = withinTolerance.paintCommands as VNextPdfPaintCommandV1[]
    const withinRun = withinPaint.find((command) => command.kind === "glyph-run")
    if (withinRun?.kind !== "glyph-run") throw new Error("glyph run fixture is missing")
    const withinAdvance = withinRun.glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)
    withinRun.glyphs[0].advancePt += withinRun.bounds.widthPt - withinAdvance + 0.0000005
    const withinResult = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-geometry-epsilon",
      contract: createVNextPdfMeasuredDrawContractV1(withinTolerance),
      fontResources: [fontResource()],
    })
    expect(withinResult.status).toBe("rendered")

    const overflow = request()
    const overflowPaint = overflow.paintCommands as VNextPdfPaintCommandV1[]
    const overflowRun = overflowPaint.find((command) => command.kind === "glyph-run")
    if (overflowRun?.kind !== "glyph-run") throw new Error("glyph run fixture is missing")
    const overflowAdvance = overflowRun.glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)
    overflowRun.glyphs[0].advancePt += overflowRun.bounds.widthPt - overflowAdvance + 0.001
    const overflowResult = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-real-overflow",
      contract: createVNextPdfMeasuredDrawContractV1(overflow),
      fontResources: [fontResource()],
    })
    expect(overflowResult).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(overflowResult.issues.map((candidate) => candidate.code)).toContain("glyph-run-overflow")
  })

  it("pins a smaller GID-retaining derivative without the reserved font name", () => {
    const value = manifest()
    const source = readFileSync(resolve(process.cwd(), value.source.path))
    const subset = readFileSync(resolve(process.cwd(), value.subset.path))
    const fixture = request()
    const usedGlyphIds = [...new Set((fixture.paintCommands as any[])
      .filter((command) => command.kind === "glyph-run")
      .flatMap((command) => command.glyphs.map((glyph: any) => glyph.glyphId)))].sort((a, b) => a - b)

    expect(createHash("sha256").update(source).digest("hex")).toBe(value.source.sha256)
    expect(createHash("sha256").update(subset).digest("hex")).toBe(value.subset.sha256)
    expect(subset.byteLength).toBe(value.subset.bytes)
    expect(subset.byteLength).toBeLessThan(source.byteLength)
    expect(value.subset.retainGlyphIds).toBe(true)
    expect(value.subset.sfntGlyphCount).toBeGreaterThan(Math.max(...usedGlyphIds))
    expect(value.subset.retainedGlyphIds).toEqual([0, ...usedGlyphIds])
    expect(subset.toString("latin1")).not.toContain("Plex")
    expect(value.license.reservedNameRemovedFromDerivative).toBe(true)
    expect(readFileSync(resolve(process.cwd(), value.license.path), "utf8")).toContain('Reserved Font Name "Plex"')
  })

  it("blocks tampered resources and production binding without partial bytes", () => {
    const resource = fontResource()
    resource.sourceBytes = Buffer.from(resource.sourceBytes)
    resource.sourceBytes[0] ^= 0xff
    resource.subsetBytes = Buffer.from(resource.subsetBytes)
    resource.subsetBytes[resource.subsetBytes.length - 1] ^= 0xff
    const result = renderFlowDocThaiOnePagePdfPilot({
      proofId: " ",
      contract: createVNextPdfMeasuredDrawContractV1(request()),
      fontResources: [resource],
      bindProductionRenderer: true,
    })

    expect(result).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "missing-proof-id",
      "production-binding",
      "source-font-hash-mismatch",
      "subset-font-hash-mismatch",
    ]))
  })

  it("keeps image execution and blocked core contracts outside the one-page proof", () => {
    const imageContract = createVNextPdfMeasuredDrawContractV1(
      request("fixtures/pdf-pilot-measured-draw-contract.v1.json"),
    )
    const imageResult = renderFlowDocThaiOnePagePdfPilot({
      proofId: "image-outside-scope",
      contract: imageContract,
      fontResources: [fontResource()],
    })
    const blockedRequest = request()
    blockedRequest.bindProductionRenderer = true
    const blockedResult = renderFlowDocThaiOnePagePdfPilot({
      proofId: "blocked-contract",
      contract: createVNextPdfMeasuredDrawContractV1(blockedRequest),
      fontResources: [fontResource()],
    })

    expect(imageResult.status).toBe("blocked")
    expect(imageResult.issues.map((item) => item.code)).toContain("unsupported-image")
    expect(blockedResult.status).toBe("blocked")
    expect(blockedResult.issues.map((item) => item.code)).toContain("contract-blocked")
  })

  it("keeps the renderer isolated from files, shaping, storage, and production packages", () => {
    const source = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/src/index.ts"), "utf8")
    const rootPackage = readFileSync(resolve(process.cwd(), "package.json"), "utf8")

    expect(source).toContain('import type {')
    expect(source).toContain('from "@flowdoc/vnext-core"')
    expect(source).not.toMatch(/readFile|writeFile|node:fs|fetch\(|\/api\//u)
    expect(source).not.toMatch(/rustybuzz|harfbuzz|fontkit|pdfkit|pdf-lib|jspdf|reportlab|canvas|puppeteer|playwright/u)
    expect(rootPackage).not.toMatch(/fontkit|pdfkit|pdf-lib|jspdf/u)
  })

  it("retains exact renderer, extraction, raster, and phase evidence", () => {
    const contract = createVNextPdfMeasuredDrawContractV1(request())
    const result = renderFlowDocThaiOnePagePdfPilot({
      proofId: "pdf-pilot-03-thai-one-page",
      contract,
      fontResources: [fontResource()],
    })
    const summary = readJson<any>("packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json")
    const qa = readJson<any>("packages/pdf-renderer-pilot/fixtures/one-page-proof-qa.v1.json")
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_THAI_ONE_PAGE_RENDERER_PROOF.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")

    if (result.status !== "rendered") throw new Error("proof must render")
    expect(summary.artifact).toEqual(result.artifact)
    expect(summary.summary).toEqual(result.summary)
    expect(qa).toMatchObject({
      status: "accepted",
      artifact: {
        sha256: result.artifact.sha256,
        bytes: result.bytes.byteLength,
        pageCount: 1,
        pageSizePt: [612, 792],
      },
      fontInspection: {
        type: "CID TrueType",
        encoding: "Identity-H",
        embedded: true,
        subset: true,
        unicodeMap: true,
      },
      textExtraction: {
        expectedLines: summary.expectedExtractedLines,
        poppler: { exactMatch: true },
        pypdf: { exactMatch: true },
      },
      rasterInspection: {
        pixelWidth: 1275,
        pixelHeight: 1650,
        visualReview: "accepted",
        missingGlyphs: 0,
        clippedGlyphs: 0,
        overlaps: 0,
      },
      productionBinding: false,
    })
    expect(doc).toContain("Status: PDF-PILOT-03 Thai embedded-font one-page renderer proof accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-04` digest-bound image and complete one-page paint proof.")
    expect(pilot).toContain("## PDF-PILOT-03 Scope")
    expect(readme).toContain("PDF Thai one-page renderer proof")
    expect(ledger).toContain("## PDF-PILOT-03 Thai Embedded-Font One-Page Renderer Proof")
  })
})
