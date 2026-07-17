import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  FLOWDOC_PDF_FULL_DOCUMENT_PILOT_MODE,
  renderFlowDocCanonicalFullDocumentPdfPilot,
  type FlowDocCanonicalReportBodyDisplayListBundleV1,
} from "../packages/pdf-renderer-pilot/src/index.js"

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
    retainedGlyphIds: number[]
    retainGlyphIds: boolean
  }
  license: { reservedNameRemovedFromDerivative: boolean }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const BUNDLE = readJson<FlowDocCanonicalReportBodyDisplayListBundleV1>(
  "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
)
const SUMMARY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)
const QA = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json",
)
const MANIFESTS = [
  readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/canonical-full-document-regular-font-subset-manifest.v1.json",
  ),
  readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/canonical-full-document-bold-font-subset-manifest.v1.json",
  ),
]

describe("PDF-PILOT-08B-R2C-M canonical full-document renderer execution", () => {
  it("retains deterministic 13-page PDF bytes from the exact R2C-L contract", () => {
    expect(SUMMARY).toMatchObject({
      summaryVersion: 1,
      phaseId: "PDF-PILOT-08B-R2C-M",
      status: "rendered",
      sourceBundleFingerprint: BUNDLE.bundleFingerprint,
      artifact: {
        byteLength: 1212504,
        sha256: "1e78e3b4a4e9d78b0e7b02fd535bd486db1d3fbab9c37228e6082e00d0c1f36a",
        sourceContractFingerprint: BUNDLE.rendererHandoff.measuredDrawContract.fingerprint,
        rendererProfileId: "pdf-pilot-08b-r2c-l-full-document-v1",
        resourceReuse: {
          pageCount: 13,
          uniqueFontObjectCount: 2,
          uniqueImageObjectCount: 5,
          fontResourceReferenceCount: 26,
          imageResourceReferenceCount: 5,
        },
        fullDocumentHandoff: {
          requiredPageCount: 13,
          requiredFontAssetCount: 2,
          requiredImageAssetCount: 5,
          imagePaintCount: 5,
          strokeLineCount: 688,
          sourceContractContentSha256: "311ac48149c2b146c8f325b1201c3c8557693e4a97326e2546ab82b6b71c0fbc",
        },
      },
      renderContract: {
        fullDocumentHandoff: true,
        axisAlignedStrokeLines: true,
        requiredPageCount: 13,
        measuredVerticalGlyphOffsets: true,
        clusterActualTextFallback: true,
        productionFidelity: false,
        storageWrites: false,
      },
      summary: {
        pageCount: 13,
        paintCommandCount: 1811,
        glyphRunCount: 1031,
        glyphCount: 15732,
        embeddedFontCount: 2,
        imageCount: 5,
        byteLength: 1212504,
      },
      deterministicRebuild: {
        unchanged: true,
        sha256: "1e78e3b4a4e9d78b0e7b02fd535bd486db1d3fbab9c37228e6082e00d0c1f36a",
      },
      externalImageBytesRetained: false,
      productionBinding: false,
      visualFidelityAccepted: false,
    })
    expect(SUMMARY.pageImageBindings).toEqual([
      { pageNumber: 1, assetId: "source-evidence-image" },
      { pageNumber: 3, assetId: "ocr-accuracy-image" },
      { pageNumber: 5, assetId: "native-extraction-image" },
      { pageNumber: 8, assetId: "latency-rounds-image" },
      { pageNumber: 9, assetId: "mapping-gap-image" },
    ])
  })

  it("verifies page tree, embedded resources, text extraction, and line paths with an external parser", () => {
    expect(QA).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-M",
      status: "accepted-pdf-structural-proof-visual-fidelity-pending",
      artifact: {
        sha256: SUMMARY.artifact.sha256,
        bytes: SUMMARY.artifact.byteLength,
        pageCount: 13,
        pdfVersion: "%PDF-1.7",
        strictParserAccepted: true,
        trailerRootPresent: true,
      },
      pageTree: { pageCount: 13, allLetter612x792Pt: true },
      resourceInspection: {
        uniqueFontObjectCount: 2,
        uniqueImageObjectCount: 5,
        imageDimensionsMatchContract: true,
      },
      contentStreamInspection: {
        operatorCounts: {
          BDC: 1031,
          TJ: 1031,
          Do: 5,
          RG: 688,
          w: 688,
          d: 688,
          m: 688,
          l: 688,
          S: 688,
        },
        expectedGlyphRunCount: 1031,
        expectedStrokeLineCount: 688,
        expectedImagePaintCount: 5,
      },
      textExtraction: {
        engine: "pypdf",
        expectedGlyphRuns: 1031,
        whitespaceNormalizedRunPresence: 1031,
        allExpectedRunsPresent: true,
      },
      popplerInspection: {
        pdfinfoAccepted: true,
        reportedPageCount: 13,
        reportedPageSize: "612 x 792 pts (letter)",
      },
      rasterSmoke: {
        renderer: "pdftoppm",
        dpi: 96,
        pageCount: 13,
        allPagesNonBlank: true,
        visualFidelityAccepted: false,
      },
      acceptance: {
        rendererArtifactMatches: true,
        pageTreeValid: true,
        fontEmbeddingValid: true,
        imageResourcesValid: true,
        glyphRunOperatorsComplete: true,
        strokeLineOperatorsComplete: true,
        imagePaintOperatorsComplete: true,
        textExtractionComplete: true,
        allRasterPagesNonBlank: true,
        pdfRendered: true,
        visualFidelityAccepted: false,
        productionBinding: false,
      },
    })
    expect(QA.pageTree.pages).toHaveLength(13)
    expect(QA.rasterSmoke.pages).toHaveLength(13)
    expect(QA.resourceInspection.fonts.every((font: any) => (
      font.subtype === "/Type0"
      && font.encoding === "/Identity-H"
      && font.descendantSubtype === "/CIDFontType2"
      && font.embeddedFontBytes > 0
      && font.toUnicodeBytes > 0
      && font.cidToGidMap
    ))).toBe(true)
  })

  it("builds GID-retaining subsets with exact per-font glyph coverage", () => {
    const contract = BUNDLE.rendererHandoff.measuredDrawContract
    MANIFESTS.forEach((manifest) => {
      const asset = contract.fontAssets.find((candidate) => candidate.fontId === manifest.fontId)
      const glyphIds = [...new Set([0, ...contract.pages.flatMap((page) => page.commands.flatMap((command) => (
        command.kind === "glyph-run" && command.fontId === manifest.fontId
          ? command.glyphs.map((glyph) => glyph.glyphId)
          : []
      )))])].sort((left, right) => left - right)
      expect(asset).toMatchObject({ sha256: manifest.source.sha256 })
      expect(manifest.subset.retainedGlyphIds).toEqual(glyphIds)
      expect(manifest.subset.retainGlyphIds).toBe(true)
      expect(manifest.subset.bytes).toBeLessThan(manifest.source.bytes)
      expect(existsSync(resolve(process.cwd(), manifest.subset.path))).toBe(true)
      expect(readFileSync(resolve(process.cwd(), manifest.subset.path)).toString("latin1")).not.toContain("Plex")
      expect(manifest.license.reservedNameRemovedFromDerivative).toBe(true)
    })
  })

  it("fails closed on profile, fingerprint, page-count, and in-memory content drift", () => {
    const accepted = renderFlowDocCanonicalFullDocumentPdfPilot({
      proofId: "full-document-missing-resources",
      contract: clone(BUNDLE.rendererHandoff.measuredDrawContract),
      fontResources: [],
      imageResources: [],
    })
    expect(accepted).toMatchObject({ status: "blocked", mode: FLOWDOC_PDF_FULL_DOCUMENT_PILOT_MODE })
    expect(accepted.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "missing-font-resource",
      "missing-image-resource",
    ]))
    expect(accepted.issues.map((candidate) => candidate.code)).not.toContain("full-document-contract-content")

    const identityDrift = clone(BUNDLE.rendererHandoff.measuredDrawContract)
    identityDrift.rendererProfileId = "wrong-profile"
    identityDrift.fingerprint = `sha256:${"0".repeat(64)}`
    identityDrift.pages.pop()
    const identityResult = renderFlowDocCanonicalFullDocumentPdfPilot({
      proofId: "full-document-identity-drift",
      contract: identityDrift,
      fontResources: [],
    })
    expect(identityResult).toMatchObject({ status: "blocked", bytes: null, artifact: null })
    expect(identityResult.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "full-document-profile",
      "full-document-contract-fingerprint",
      "full-document-contract-content",
      "full-document-page-count",
    ]))

    const contentDrift = clone(BUNDLE.rendererHandoff.measuredDrawContract)
    contentDrift.pages[0].commands[0].paintOrder = 99
    const contentResult = renderFlowDocCanonicalFullDocumentPdfPilot({
      proofId: "full-document-content-drift",
      contract: contentDrift,
      fontResources: [],
    })
    expect(contentResult).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "full-document-contract-content" })],
    })
  })

  it("publishes reproducible structural evidence without retaining external bytes or claiming visual fidelity", () => {
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_FULL_DOCUMENT_RENDERER_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    const builder = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/build-canonical-full-document-proof-runtime.ts",
    ), "utf8")
    const inspector = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-proof.py",
    ), "utf8")

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-M deterministic thirteen-page PDF execution and")
    expect(proof).toContain("visual fidelity remains pending")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-M Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-M Full-Document Renderer Execution")
    expect(readme).toContain("PDF canonical full-document execution")
    expect(packageReadme).toContain("Full-Document Renderer Execution")
    expect(packageJson.scripts).toMatchObject({
      "build:full-document-subsets": "npm run build:full-document-regular-subset && npm run build:full-document-bold-subset",
      "build:full-document-proof": "node scripts/build-canonical-full-document-proof.mjs",
    })
    expect(builder).toContain("FLOWDOC_PDF_PILOT_REPORT_ROOT")
    expect(builder).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(inspector).toContain("PdfReader(str(pdf_path), strict=True)")
    expect(inspector).toContain('"visualFidelityAccepted": False')
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf",
    ))).toBe(false)
    for (const assetId of BUNDLE.rendererHandoff.measuredDrawContract.imageAssets.map((asset) => asset.assetId)) {
      expect(existsSync(resolve(
        process.cwd(),
        `packages/pdf-renderer-pilot/fixtures/images/${assetId}.png`,
      ))).toBe(false)
    }
  })
})
