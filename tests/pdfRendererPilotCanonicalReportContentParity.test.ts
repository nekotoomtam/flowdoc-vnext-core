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
  subset: { path: string; sha256: string; bytes: number; retainedGlyphIds: number[] }
}

function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function syntheticRequest(): VNextPdfMeasuredDrawContractRequestV1 {
  const request = readJson<any>(
    "fixtures/pdf-pilot-canonical-report-content-parity-twelve-page-request.v1.json",
  )
  request.imageAssets.forEach((asset: any, index: number) => {
    asset.sha256 = SYNTHETIC_IMAGES[index][1]
    asset.pixelWidth = 2
    asset.pixelHeight = 1
  })
  return request as VNextPdfMeasuredDrawContractRequestV1
}

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-font-subset-manifest.v1.json",
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

function withoutWhitespace(value: string): string {
  return value.replace(/\s+/gu, "")
}

describe("PDF-PILOT-08A canonical report content parity", () => {
  it("materializes a fail-closed semantic content contract over the Phase 07 fixture", () => {
    const base = readJson("fixtures/pdf-pilot-canonical-report-composition.v1.json")
    const manifest = readJson("fixtures/pdf-pilot-canonical-report-content-parity.v1.json")
    const result = materializeCanonicalReportContentParity(base, manifest)

    expect(result.composition).toMatchObject({
      compositionVersion: 2,
      compositionId: "pdf-pilot-canonical-report-content-parity-composition-v1",
      contentParityManifestId: manifest.manifestId,
    })
    expect(result.evidence).toEqual({
      manifestId: "pdf-pilot-08a-canonical-report-decision-content-parity-v1",
      parityLevel: "decision-relevant-semantic-content",
      verbatimSentenceParity: false,
      visualParity: false,
      requiredElementCount: 12,
      requiredTableCount: 10,
      requiredExactItemCount: 8,
      requiredPageTextCount: 19,
      referenceNonWhitespaceCharacters: 10619,
      compositionNonWhitespaceCharacters: 9743,
      referenceCoverageRatio: 0.917506,
    })

    const factualDrift = structuredClone(manifest)
    const ocrPatch = factualDrift.pagePatches.find((page: any) => page.pageId === "ocr-accuracy")
    const table = ocrPatch.operations.find((operation: any) => operation.element.id === "ocr-table").element
    table.rows.find((row: string[]) => row[0] === "ขนาด Raw JSON")[2] = "0.20 MB"
    expect(() => materializeCanonicalReportContentParity(base, factualDrift))
      .toThrow(/required exact content is missing/u)

    const omittedContent = structuredClone(manifest)
    const nativePatch = omittedContent.pagePatches.find((page: any) => page.pageId === "native-extraction")
    const fields = nativePatch.operations.find(
      (operation: any) => operation.element.id === "unstructured-fields",
    ).element
    fields.lines = fields.lines.map((line: string) => line.replace("AEO number", ""))
    expect(() => materializeCanonicalReportContentParity(base, omittedContent))
      .toThrow(/required page content is missing/u)
  })

  it("renders every retained content run with the canonical measured profile", () => {
    const request = syntheticRequest()
    const manifest = readJson("fixtures/pdf-pilot-canonical-report-content-parity.v1.json")
    const result = renderFlowDocCanonicalTwelvePageReportPdfPilot({
      proofId: "pdf-pilot-08a-synthetic-content-parity",
      contract: createVNextPdfMeasuredDrawContractV1(request),
      fontResources: [fontResource()],
      imageResources: imageResources(),
    })

    expect(result).toMatchObject({
      mode: FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
      status: "rendered",
      summary: {
        pageCount: 12,
        paintCommandCount: 562,
        glyphRunCount: 391,
        glyphCount: 10574,
        embeddedFontCount: 1,
        imageCount: 5,
      },
      issues: [],
    })
    if (result.status !== "rendered") throw new Error("content parity report must render")
    expect(result.artifact.sha256).toBe(createHash("sha256").update(result.bytes).digest("hex"))

    const actualTexts = extractActualTexts(result.bytes)
    expect(actualTexts).toHaveLength(391)
    const normalized = withoutWhitespace(actualTexts.join("\n"))
    for (const requirement of manifest.requiredPageText) {
      expect(normalized).toContain(withoutWhitespace(requirement.text))
    }
  }, 15_000)

  it("retains source identity, generated evidence, and the Phase 07 byte regression", () => {
    const request = readJson<any>(
      "fixtures/pdf-pilot-canonical-report-content-parity-twelve-page-request.v1.json",
    )
    const subset = readJson<SubsetManifest>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-font-subset-manifest.v1.json",
    )
    const summary = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-summary.v1.json",
    )
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-qa.v1.json",
    )
    const phase07 = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json",
    )
    const doc = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_CONTENT_PARITY_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-canonical-report-request.mjs",
    ), "utf8")

    expect(request.plan.summary).toMatchObject({
      drawCommandCount: 543,
      textCommandCount: 391,
      boxCommandCount: 152,
    })
    expect(request.paintCommands).toHaveLength(562)
    expect(subset).toMatchObject({
      subsetId: "pdf-pilot-08a-ibm-plex-regular-content-parity-report",
      postScriptName: "FlowDocThaiCanonicalReportContentParitySubset-Regular",
      subset: {
        sha256: qa.resourceInspection.fontSubsetSha256,
        bytes: 37596,
      },
    })
    expect(subset.subset.retainedGlyphIds).toHaveLength(138)
    expect(summary).toMatchObject({
      proofId: "pdf-pilot-08a-canonical-report-content-parity",
      artifact: {
        sha256: qa.artifact.sha256,
        byteLength: qa.artifact.bytes,
      },
      summary: {
        pageCount: 12,
        paintCommandCount: 562,
        glyphRunCount: 391,
        glyphCount: 10574,
      },
      contentParity: {
        manifestId: "pdf-pilot-08a-canonical-report-decision-content-parity-v1",
        renderedNonWhitespaceCharacters: 9743,
        referenceCoverageRatio: 0.917506,
      },
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      contentContract: {
        allRequiredContentPresent: true,
        azureRawJsonCorrectedFromMb: 0.2,
        azureRawJsonCorrectedToMb: 0.1,
      },
      textExtraction: {
        expectedGlyphRuns: 391,
        popplerExactRunPresence: 391,
        pypdfWhitespaceNormalizedRunPresence: 391,
      },
      geometryInspection: {
        textBoundsOverlapCount: 0,
        contentFooterCollision: false,
      },
      deterministicRebuild: { unchanged: true },
      priorPhase07Regression: { unchanged: true },
      typographyCalibrationDeferredTo: "PDF-PILOT-08B",
    })
    expect(phase07.artifact.sha256).toBe(
      "39d8191ff58c2da0f03d7319dd5f3818b7f89642d01885f78cae092634ca1819",
    )
    expect(existsSync(resolve(process.cwd(), subset.subset.path))).toBe(true)
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/build_report.py",
    ))).toBe(false)
    expect(builder).toContain("--content-parity-manifest")
    expect(builder).toContain("External content parity source does not match the pinned identity.")
    expect(doc).toContain("Status: PDF-PILOT-08A decision-content parity proof accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-08B` typography and layout calibration.")
    expect(pilot).toContain("## PDF-PILOT-08A Scope")
    expect(readme).toContain("PDF canonical report decision-content parity")
    expect(ledger).toContain("## PDF-PILOT-08A Canonical Report Decision-Content Parity")
  })
})
