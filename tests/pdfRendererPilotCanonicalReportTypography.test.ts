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
  subset: { path: string; sha256: string; bytes: number; retainedGlyphIds: number[] }
}

function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
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
    subsetResource(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json",
    ),
    subsetResource(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json",
    ),
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
    "fixtures/pdf-pilot-canonical-report-typography-calibrated-twelve-page-request.v1.json",
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

function withoutWhitespace(value: string): string {
  return value.replace(/\s+/gu, "")
}

describe("PDF-PILOT-08B canonical report typography calibration", () => {
  it("calibrates readable Regular/Bold styles while retaining the 08A content contract", () => {
    const base = readJson("fixtures/pdf-pilot-canonical-report-composition.v1.json")
    const contentManifest = readJson("fixtures/pdf-pilot-canonical-report-content-parity.v1.json")
    const typographyManifest = readJson(
      "fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json",
    )
    const content = materializeCanonicalReportContentParity(base, contentManifest)
    const result = materializeCanonicalReportTypographyCalibration(
      content.composition,
      typographyManifest,
      contentManifest,
    )

    expect(result.composition).toMatchObject({
      compositionVersion: 3,
      compositionId: "pdf-pilot-canonical-report-typography-calibrated-composition-v1",
      measurementProfileId: "pdf-pilot-rustybuzz-0.20.1-ibm-plex-regular-bold-v1",
      typographyManifestId: typographyManifest.manifestId,
      fontIds: ["ibm-plex-sans-thai-regular", "ibm-plex-sans-thai-bold"],
    })
    expect(result.contentEvidence).toEqual(content.evidence)
    expect(result.evidence).toEqual({
      manifestId: "pdf-pilot-08b-canonical-report-typography-calibration-v1",
      fontIds: ["ibm-plex-sans-thai-regular", "ibm-plex-sans-thai-bold"],
      requiredStyleCount: 13,
      calibratedTableCount: 10,
      minimumBodyFontSizePt: 10.5,
      minimumTableBodyFontSizePt: 9,
      minimumTableHeaderFontSizePt: 9.2,
      boldTextElementCount: 27,
    })

    const undersized = structuredClone(typographyManifest)
    undersized.stylePatches.body.fontSizePt = 9.2
    expect(() => materializeCanonicalReportTypographyCalibration(
      content.composition,
      undersized,
      contentManifest,
    )).toThrow(/body font size is below 10.5 pt/u)

    const wrongWeight = structuredClone(typographyManifest)
    wrongWeight.pagePatches
      .flatMap((page: any) => page.operations)
      .find((operation: any) => operation.element.id === "decision-table")
      .element.headerFontId = "ibm-plex-sans-thai-regular"
    expect(() => materializeCanonicalReportTypographyCalibration(
      content.composition,
      wrongWeight,
      contentManifest,
    )).toThrow(/must use the calibrated header font/u)
  })

  it("renders two embedded weights and every calibrated text run", () => {
    const request = syntheticRequest()
    const contentManifest = readJson("fixtures/pdf-pilot-canonical-report-content-parity.v1.json")
    const resources = fontResources()
    const result = renderFlowDocCanonicalTwelvePageReportPdfPilot({
      proofId: "pdf-pilot-08b-synthetic-typography",
      contract: createVNextPdfMeasuredDrawContractV1(request),
      fontResources: resources,
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
        fontResourceReferenceCount: 24,
      },
      issues: [],
    })
    if (result.status !== "rendered") throw new Error("typography report must render")
    expect(result.artifact.resourceReuse).toMatchObject({
      uniqueFontObjectCount: 2,
      fontResourceReferenceCount: 24,
    })
    expect(result.artifact.sha256).toBe(createHash("sha256").update(result.bytes).digest("hex"))
    const pdf = Buffer.from(result.bytes).toString("latin1")
    expect((pdf.match(/\/Subtype \/Type0/gu) ?? [])).toHaveLength(2)

    const actualTexts = extractActualTexts(result.bytes)
    expect(actualTexts).toHaveLength(413)
    const normalized = withoutWhitespace(actualTexts.join("\n"))
    for (const requirement of contentManifest.requiredPageText) {
      expect(normalized).toContain(withoutWhitespace(requirement.text))
    }
    expect((request as any).paintCommands.filter((command: any) => (
      command.kind === "glyph-run" && command.fontId === "ibm-plex-sans-thai-bold"
    ))).toHaveLength(73)

    const missingBold = renderFlowDocCanonicalTwelvePageReportPdfPilot({
      proofId: "pdf-pilot-08b-missing-bold",
      contract: createVNextPdfMeasuredDrawContractV1(request),
      fontResources: [resources[0]],
      imageResources: imageResources(),
    })
    expect(missingBold).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(missingBold.issues.map((issue) => issue.code)).toContain("missing-font-resource")
  }, 15_000)

  it("retains typography evidence and prior artifact byte identities", () => {
    const request = readJson<any>(
      "fixtures/pdf-pilot-canonical-report-typography-calibrated-twelve-page-request.v1.json",
    )
    const regular = readJson<SubsetManifest>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json",
    )
    const bold = readJson<SubsetManifest>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json",
    )
    const summary = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-summary.v1.json",
    )
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-qa.v1.json",
    )
    const phase07 = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json",
    )
    const phase08a = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-summary.v1.json",
    )
    const doc = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_TYPOGRAPHY_CALIBRATION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")

    expect(request).toMatchObject({
      measurementProfileId: "pdf-pilot-rustybuzz-0.20.1-ibm-plex-regular-bold-v1",
      plan: { summary: { drawCommandCount: 565, textCommandCount: 413, boxCommandCount: 152 } },
    })
    expect(request.fontAssets.map((asset: any) => asset.fontId)).toEqual([
      "ibm-plex-sans-thai-regular",
      "ibm-plex-sans-thai-bold",
    ])
    expect(regular).toMatchObject({
      subsetId: "pdf-pilot-08b-ibm-plex-regular-typography-report",
      subset: { sha256: qa.resourceInspection.regularSubsetSha256, bytes: 37512 },
    })
    expect(bold).toMatchObject({
      subsetId: "pdf-pilot-08b-ibm-plex-bold-typography-report",
      subset: { sha256: qa.resourceInspection.boldSubsetSha256, bytes: 37628 },
    })
    expect(summary).toMatchObject({
      proofId: "pdf-pilot-08b-canonical-report-typography-calibration",
      artifact: { sha256: qa.artifact.sha256, byteLength: qa.artifact.bytes },
      summary: {
        pageCount: 12,
        paintCommandCount: 584,
        glyphRunCount: 413,
        glyphCount: 10562,
        embeddedFontCount: 2,
      },
      contentParity: { referenceCoverageRatio: 0.917506 },
      typographyCalibration: {
        manifestId: "pdf-pilot-08b-canonical-report-typography-calibration-v1",
        bodyStyleMinimumFontSizePt: 10.5,
        minimumBodyFontSizePt: 9,
        minimumHeaderFontSizePt: 9.2,
      },
      productionBinding: false,
    })
    expect(qa).toMatchObject({
      status: "accepted",
      typographyContract: {
        bodyFontSizePt: 10.5,
        tableBodyFontSizePt: 9.1,
        tableHeaderFontSizePt: 9.3,
        regularGlyphRunCount: 340,
        boldGlyphRunCount: 73,
      },
      textExtraction: {
        expectedGlyphRuns: 413,
        popplerExactRunPresence: 413,
        pypdfWhitespaceNormalizedRunPresence: 413,
      },
      geometryInspection: { textBoundsOverlapCount: 0, contentFooterCollision: false },
      referenceComparison: {
        typographyScaleAccepted: true,
        boldHierarchyAccepted: true,
        visualThresholdCalibrationDeferredTo: "PDF-PILOT-08C",
      },
      deterministicRebuild: { unchanged: true },
      priorArtifactIdentityRegression: { unchanged: true },
    })
    expect(phase07.artifact.sha256).toBe(
      "39d8191ff58c2da0f03d7319dd5f3818b7f89642d01885f78cae092634ca1819",
    )
    expect(phase08a.artifact.sha256).toBe(
      "2b22eda73f9124e5bcb8c3d582f458cec78a8a230bebc6409909ad74c319f338",
    )
    expect(existsSync(resolve(process.cwd(), regular.subset.path))).toBe(true)
    expect(existsSync(resolve(process.cwd(), bold.subset.path))).toBe(true)
    expect(doc).toContain("Status: PDF-PILOT-08B typography and layout calibration accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-08C` visual acceptance thresholds.")
    expect(pilot).toContain("## PDF-PILOT-08B Scope")
    expect(readme).toContain("PDF canonical report typography calibration")
    expect(ledger).toContain("## PDF-PILOT-08B Canonical Report Typography And Layout Calibration")
  })
})
