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
  renderFlowDocCanonicalTwelvePageReportPdfPilot,
  type FlowDocPdfRendererPilotFontResource,
  type FlowDocPdfRendererPilotImageResource,
} from "../packages/pdf-renderer-pilot/src/full.js"
import { materializeCanonicalReportContentParity } from "../packages/pdf-renderer-pilot/scripts/canonical-report-content-parity.mjs"
import { materializeCanonicalReportSourceData } from "../packages/pdf-renderer-pilot/scripts/canonical-report-source-data.mjs"
import { materializeCanonicalReportTypographyCalibration } from "../packages/pdf-renderer-pilot/scripts/canonical-report-typography-calibration.mjs"

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

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string }
  subset: { path: string; sha256: string }
}

function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function typographyComposition() {
  const base = readJson("fixtures/pdf-pilot-canonical-report-composition.v1.json")
  const content = readJson("fixtures/pdf-pilot-canonical-report-content-parity.v1.json")
  const typography = readJson("fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json")
  return materializeCanonicalReportTypographyCalibration(
    materializeCanonicalReportContentParity(base, content).composition,
    typography,
    content,
  ).composition
}

function subsetResource(path: string): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(path)
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

function fontResources(): FlowDocPdfRendererPilotFontResource[] {
  return [
    subsetResource("packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json"),
    subsetResource("packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json"),
  ]
}

function imageResources(): FlowDocPdfRendererPilotImageResource[] {
  return IMAGE_IDS.map((assetId, index) => ({
    assetId,
    bytes: Buffer.from(SYNTHETIC_IMAGES[index][0], "base64"),
  }))
}

function syntheticRequest(): VNextPdfMeasuredDrawContractRequestV1 {
  const request = readJson<any>(
    "fixtures/pdf-pilot-canonical-report-source-backed-typography-twelve-page-request.v1.json",
  )
  request.imageAssets.forEach((asset: any, index: number) => {
    asset.sha256 = SYNTHETIC_IMAGES[index][1]
    asset.pixelWidth = 2
    asset.pixelHeight = 1
  })
  return request as VNextPdfMeasuredDrawContractRequestV1
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

function element(composition: any, pageId: string, elementId: string) {
  return composition.pages
    .find((page: any) => page.pageId === pageId)
    .elements.find((candidate: any) => candidate.id === elementId)
}

describe("PDF-PILOT-08B-R1 canonical report source-data binding", () => {
  it("replaces only the seven source-proven factual drifts", () => {
    const manifest = readJson<any>("fixtures/pdf-pilot-canonical-report-source-data.v1.json")
    const result = materializeCanonicalReportSourceData(typographyComposition(), manifest)

    expect(result.composition).toMatchObject({
      compositionVersion: 4,
      compositionId: "pdf-pilot-canonical-report-source-backed-typography-composition-v1",
      sourceDataManifestId: manifest.manifestId,
      sourceSnapshotSha256: manifest.sourceSnapshotSha256,
      headerText: "OCR BENCHMARK | INV_9437125258",
    })
    expect(result.evidence).toMatchObject({
      sourceFileCount: 5,
      bindingCount: 16,
      sourceScalarValueCount: 205,
      factualCorrectionCount: 7,
    })
    expect(result.evidence.corrections.map((correction) => [
      correction.before,
      correction.after,
    ])).toEqual([
      ["4.90 วิ", "6.50 วิ"],
      ["9.70 วิ", "9.75 วิ"],
      ["2026-07-16T11-54-39-432Z", "2026-07-16T11-52-39-170Z"],
      ["2026-07-16T11-57-51-612Z", "2026-07-16T11-52-57-651Z"],
      ["2026-07-16T12-00-39-322Z", "2026-07-16T11-53-50-392Z"],
      ["2026-07-16T12-04-06-892Z", "2026-07-16T11-54-06-893Z"],
      ["2026-07-16T12-06-23-394Z", "2026-07-16T11-54-21-384Z"],
    ])
    expect(element(result.composition, "latency-cost-size", "latency-table").rows)
      .toEqual(manifest.sourceSnapshot.bindings.find(
        (binding: any) => binding.elementId === "latency-table",
      ).value)
    expect(element(result.composition, "appendix-runs", "runs-table").rows)
      .toEqual(manifest.sourceSnapshot.bindings.find(
        (binding: any) => binding.elementId === "runs-table",
      ).value)
  })

  it("rejects source snapshot and source file identity drift", () => {
    const manifest = readJson<any>("fixtures/pdf-pilot-canonical-report-source-data.v1.json")
    const changedSnapshot = structuredClone(manifest)
    changedSnapshot.sourceSnapshot.bindings.find(
      (binding: any) => binding.elementId === "latency-table",
    ).value[1][3] = "4.90 วิ"
    expect(() => materializeCanonicalReportSourceData(typographyComposition(), changedSnapshot))
      .toThrow(/source snapshot SHA-256 does not match/u)

    const fakeSources = Object.fromEntries(manifest.sourceFiles.map((source: any) => [
      source.sourceId,
      Buffer.alloc(source.bytes),
    ]))
    expect(() => materializeCanonicalReportSourceData(
      typographyComposition(),
      manifest,
      fakeSources,
    )).toThrow(/SHA-256 differs/u)
  })

  it("renders the corrected facts with the retained typography profile", () => {
    const request = syntheticRequest()
    const result = renderFlowDocCanonicalTwelvePageReportPdfPilot({
      proofId: "pdf-pilot-08b-r1-synthetic-source-data",
      contract: createVNextPdfMeasuredDrawContractV1(request),
      fontResources: fontResources(),
      imageResources: imageResources(),
    })

    expect(result).toMatchObject({
      mode: FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
      status: "rendered",
      summary: {
        pageCount: 12,
        paintCommandCount: 584,
        glyphRunCount: 413,
        glyphCount: 10562,
        embeddedFontCount: 2,
        imageCount: 5,
      },
      issues: [],
    })
    if (result.status !== "rendered") throw new Error("source-backed report must render")
    expect(result.artifact.sha256).toBe(createHash("sha256").update(result.bytes).digest("hex"))
    const actualText = extractActualTexts(result.bytes).join("\n")
    for (const value of [
      "6.50 วิ",
      "9.75 วิ",
      "2026-07-16T11-52-39-170Z",
      "2026-07-16T11-52-57-651Z",
      "2026-07-16T11-53-50-392Z",
      "2026-07-16T11-54-06-893Z",
      "2026-07-16T11-54-21-384Z",
    ]) expect(actualText).toContain(value)
    for (const stale of ["4.90 วิ", "9.70 วิ", "2026-07-16T12-00-39-322Z"]) {
      expect(actualText).not.toContain(stale)
    }
  }, 15_000)

  it("retains the generated proof and supersession record", () => {
    const summary = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-summary.v1.json",
    )
    const manifest = readJson<any>("fixtures/pdf-pilot-canonical-report-source-data.v1.json")
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-qa.v1.json",
    )
    const previous = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-summary.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_SOURCE_DATA_CORRECTION_PROOF.md",
    ), "utf8")
    const contentProof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_CONTENT_PARITY_PROOF.md",
    ), "utf8")
    const typographyProof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_TYPOGRAPHY_CALIBRATION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")

    expect(summary).toMatchObject({
      proofId: "pdf-pilot-08b-r1-canonical-report-source-data",
      artifact: {
        sha256: "78c35020d987fb478ea269fb2cb90181c64444b7f8f59a175276d350b01bfca5",
        byteLength: 941026,
      },
      summary: { pageCount: 12, paintCommandCount: 584, glyphRunCount: 413, glyphCount: 10562 },
      sourceDataBinding: {
        manifestId: manifest.manifestId,
        sourceSnapshotSha256: manifest.sourceSnapshotSha256,
        sourceBindingCount: 16,
        expectedFactualCorrectionCount: 7,
      },
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      artifact: { sha256: summary.artifact.sha256, bytes: summary.artifact.byteLength },
      sourceDataContract: {
        sourceSnapshotSha256: manifest.sourceSnapshotSha256,
        sourceFileCount: 5,
        sourceBindingCount: 16,
        sourceScalarValueCount: 205,
        factualCorrectionCount: 7,
      },
      textExtraction: {
        expectedGlyphRuns: 413,
        actualTextExactOrderRuns: 413,
        popplerWhitespaceNormalizedRunPresence: 413,
        correctedActualTextValueCount: 7,
        staleActualTextValueCount: 0,
      },
      rasterInspection: {
        pdftoppmAccepted: true,
        pdftocairoAccepted: true,
        pagesRenderedByEachTool: 12,
      },
      deterministicRebuild: { unchanged: true },
    })
    expect(previous.artifact.sha256).toBe(
      "45f9969ec01b1e1d168b624fff969b1fc32056f17d0596ced1c00ead58273b92",
    )
    expect(existsSync(resolve(
      process.cwd(),
      "output/pdf/flowdoc-pdf-pilot-canonical-report-source-backed-twelve-page.pdf",
    ))).toBe(true)
    expect(proof).toContain("Status: PDF-PILOT-08B-R1 source-data correction accepted.")
    expect(contentProof).toContain("factual parity claim is superseded")
    expect(typographyProof).toMatch(/factual\s+content claim is superseded/u)
    expect(pilot).toContain("## PDF-PILOT-08B-R1 Scope")
    expect(readme).toContain("PDF canonical report source-data correction")
    expect(ledger).toContain("## PDF-PILOT-08B-R1 Canonical Report Source-Data Correction")
    expect(packageJson.scripts).toMatchObject({
      "build:source-data-manifest": expect.any(String),
      "build:source-data-request": expect.any(String),
      "build:source-data-proof": expect.any(String),
    })
  })
})
