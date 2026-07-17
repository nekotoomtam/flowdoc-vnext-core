import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfMeasuredDrawContractV1,
  VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE,
  VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function fixture(): VNextPdfMeasuredDrawContractRequestV1 {
  return readJson<VNextPdfMeasuredDrawContractRequestV1>("fixtures/pdf-pilot-measured-draw-contract.v1.json")
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("PDF measured draw contract v1", () => {
  it("accepts explicit font, glyph, paint, image, page, and source geometry facts", () => {
    const first = createVNextPdfMeasuredDrawContractV1(fixture())
    const second = createVNextPdfMeasuredDrawContractV1(fixture())

    expect(first).toMatchObject({
      source: VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE,
      contractVersion: VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION,
      status: "consumable",
      pilotId: "PDF-PILOT-INV-9437125258",
      rendererProfileId: "pdf-pilot-draw-contract-v1",
      measurementProfileId: "pdf-pilot-measurement-profile-v1",
      artifact: {
        kind: "pdf",
        status: "not-rendered",
        bytes: null,
        storageId: null,
      },
      contracts: {
        geometrySource: "measured-render-command-bounds",
        paintOrderSource: "explicit-per-page-order",
        fontEmbedding: "subset-required",
        textExtraction: "to-unicode-required",
        mayRelayout: false,
      },
      execution: {
        coreReadsFontFiles: false,
        coreReadsImageBytes: false,
        coreExecutesShaping: false,
        coreWritesPdfBytes: false,
        rendererRequired: true,
        productionBinding: false,
      },
      summary: {
        pageCount: 1,
        sourceCommandCount: 3,
        paintCommandCount: 4,
        glyphRunCount: 1,
        fillRectCount: 1,
        strokeRectCount: 1,
        imageCount: 1,
        fontAssetCount: 1,
        imageAssetCount: 1,
      },
      issues: [],
    })
    if (first.status !== "consumable" || second.status !== "consumable") throw new Error("fixture must be consumable")
    expect(first.pages[0].commands.map((command) => command.paintOrder)).toEqual([0, 1, 2, 3])
    expect(first.pages[0].commands[3]).toMatchObject({
      kind: "glyph-run",
      fontId: "ibm-plex-sans-thai-regular",
      text: "สรุปผล OCR",
      glyphs: expect.arrayContaining([
        expect.objectContaining({ advancePt: 0, clusterStartOffset: 1, clusterEndOffset: 3 }),
      ]),
    })
    expect(first.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(second.fingerprint).toBe(first.fingerprint)
    expect(JSON.parse(JSON.stringify(first))).toEqual(first)
  })

  it("binds fixture font and image digests to retained pilot evidence", () => {
    const request = fixture()
    const manifest = readJson<any>("assets/fonts/font-assets.v1.json")
    const corpus = readJson<any>("fixtures/pdf-report-font-bakeoff-corpus.v1.json")
    const font = [...manifest.fontAssets, ...manifest.candidateFontAssets].find(
      (asset: any) => asset.fontId === "ibm-plex-sans-thai-regular",
    )
    const image = corpus.referenceArtifacts.find((artifact: any) => artifact.artifactId === "ocr-accuracy-image")

    expect(request.fontAssets).toEqual([expect.objectContaining({ fontId: font.fontId, sha256: font.sha256 })])
    expect(request.imageAssets).toEqual([expect.objectContaining({ assetId: image.artifactId, sha256: image.sha256 })])
  })

  it("accepts axis-aligned measured stroke lines without inflating them into rectangles", () => {
    const request = fixture()
    const plan = clone(request.plan)
    const paintCommands = clone(request.paintCommands) as any[]
    plan.drawCommands.push({
      id: "pdf:render:table-border",
      sourceCommandId: "render:table-border",
      fragmentId: "fragment:table-border",
      pageIndex: 0,
      pageNumber: 1,
      operation: "draw-fragment-box",
      nodeId: "table-border",
      nodeType: "table",
      bounds: { xPt: 48, yPt: 120, widthPt: 200, heightPt: 0 },
      text: null,
      table: null,
    })
    plan.summary.inputCommandCount += 1
    plan.summary.drawCommandCount += 1
    plan.summary.boxCommandCount += 1
    paintCommands.push({
      id: "paint:table-border",
      sourceCommandId: "pdf:render:table-border",
      pageIndex: 0,
      paintOrder: 4,
      bounds: { xPt: 48, yPt: 120, widthPt: 200, heightPt: 0 },
      kind: "stroke-line",
      color: "D9E1E8",
      opacity: 1,
      widthPt: 0.5,
      style: "solid",
    })

    const result = createVNextPdfMeasuredDrawContractV1({ ...request, plan, paintCommands })

    expect(result).toMatchObject({
      status: "consumable",
      summary: { sourceCommandCount: 4, paintCommandCount: 5, strokeLineCount: 1 },
    })
    if (result.status !== "consumable") throw new Error("stroke-line fixture must be consumable")
    expect(result.pages[0].commands.at(-1)).toMatchObject({
      kind: "stroke-line",
      bounds: { widthPt: 200, heightPt: 0 },
      widthPt: 0.5,
    })
  })

  it("blocks missing cluster coverage, geometry drift, and unknown image assets without partial pages", () => {
    const request = fixture()
    const paintCommands = clone(request.paintCommands) as any[]
    const glyphRun = paintCommands.find((command) => command.kind === "glyph-run")
    glyphRun.glyphs = glyphRun.glyphs.slice(1)
    glyphRun.bounds.widthPt += 1
    const image = paintCommands.find((command) => command.kind === "image")
    image.assetId = "missing-image"

    const result = createVNextPdfMeasuredDrawContractV1({ ...request, paintCommands })

    expect(result).toMatchObject({
      status: "blocked",
      pages: null,
      fontAssets: null,
      imageAssets: null,
      fingerprint: null,
      summary: null,
      artifact: { status: "not-rendered", bytes: null },
    })
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "source-bounds-mismatch",
      "glyph-index-mismatch",
      "missing-text-cluster-coverage",
      "unknown-image-asset",
    ]))
  })

  it("blocks duplicate paint order, missing source coverage, and production binding", () => {
    const request = fixture()
    const paintCommands = (clone(request.paintCommands) as any[])
      .filter((command) => command.sourceCommandId !== "pdf:render:summary-box")
    paintCommands[1].paintOrder = paintCommands[0].paintOrder

    const result = createVNextPdfMeasuredDrawContractV1({
      ...request,
      paintCommands,
      bindProductionRenderer: true,
    })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "production-binding",
      "duplicate-paint-order",
      "missing-source-command-paint",
    ]))
  })

  it("strictly rejects invalid paint facts and blocked adapter plans", () => {
    const request = fixture()
    const paintCommands = clone(request.paintCommands) as any[]
    paintCommands[0].unexpected = true
    const plan = clone(request.plan)
    plan.status = "blocked"

    const result = createVNextPdfMeasuredDrawContractV1({ ...request, plan, paintCommands })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "pdf-plan-blocked",
      "invalid-draw-input",
    ]))
  })

  it("keeps core independent from concrete PDF, font-file, image-byte, and shaping execution", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/pdfMeasuredDrawContractV1.ts"), "utf8")

    expect(source).toContain("createVNextPdfMeasuredDrawContractV1")
    expect(source).toContain("createVNextCompactFingerprint")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|fontkit|canvas|puppeteer|playwright/)
    expect(source).not.toMatch(/rustybuzz|harfbuzz|icu4x|wasm-bindgen/)
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("writeFile")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("/api/")
  })

  it("documents the dedicated pilot phase without moving the main phase pointer", () => {
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_MEASURED_DRAW_CONTRACT_V1.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")

    expect(doc).toContain("Status: PDF-PILOT-02 measured draw contract accepted.")
    expect(doc).toContain("It does not render PDF bytes.")
    expect(pilot).toContain("PDF-PILOT-02")
    expect(readme).toContain("PDF measured draw contract v1")
    expect(ledger).toContain("## PDF-PILOT-02 Measured PDF Draw Contract")
  })
})
