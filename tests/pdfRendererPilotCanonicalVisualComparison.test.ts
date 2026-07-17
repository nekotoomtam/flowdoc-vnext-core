import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const COMPARISON = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-visual-comparison.v1.json",
)

describe("PDF-PILOT-08B-R2C-N canonical full-document visual comparison", () => {
  it("pins the exact reference and source-backed candidate artifacts without retaining their bytes", () => {
    expect(COMPARISON).toMatchObject({
      comparisonVersion: 1,
      phaseId: "PDF-PILOT-08B-R2C-N",
      status: "accepted-comparison-visual-fidelity-rejected-thirteen-page-authoritative",
      inputs: {
        reference: {
          sha256: "56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8",
          bytes: 714952,
          pageCount: 12,
        },
        candidate: {
          sha256: "014b313690041ba312b10dc0bcbf65a3131580258d80e2f8b07465d8e107ed0f",
          bytes: 1194703,
          pageCount: 13,
          sourceBundleFingerprint: "32d067a3b17e1c6598711445067877e29f0c609fe0c1d288d2d0e57871f95990",
        },
        externalPdfBytesRetained: false,
        rasterBytesRetained: false,
      },
      method: {
        geometryAndTextEngine: "pdfplumber",
        rasterRenderer: "pdftoppm",
        rasterDpi: 96,
      },
    })
    expect(JSON.stringify(COMPARISON)).not.toMatch(/[A-Z]:\\Users\\/u)
  })

  it("quantifies typography, semantic density, anchor drift, and terminal continuation", () => {
    expect(COMPARISON.reference).toMatchObject({
      pageCount: 12,
      allLetter612x792Pt: true,
      extractedNonWhitespaceCharacterCount: 10619,
      dominantFontSizePt: 10.6,
      boldCharacterShare: 0.158866,
      imagePageNumbers: [1, 4, 5, 6, 7, 8],
      raster: {
        pageCount: 12,
        allPages816x1056Px: true,
      },
    })
    expect(COMPARISON.candidate).toMatchObject({
      pageCount: 13,
      allLetter612x792Pt: true,
      extractedNonWhitespaceCharacterCount: 13866,
      dominantFontSizePt: 10.5,
      boldCharacterShare: 0.417496,
      imagePageNumbers: [1, 3, 5, 8, 9],
      raster: {
        pageCount: 13,
        allPages816x1056Px: true,
      },
    })
    expect(COMPARISON.comparison).toMatchObject({
      pageCountDelta: 1,
      extractedNonWhitespaceCharacterDelta: 3247,
      candidateToReferenceExtractedCharacterRatio: 1.3058,
      dominantFontSizeDeltaPt: -0.1,
      boldCharacterShareDelta: 0.25863,
      observedBodyWidthDeltaPt: 20.54,
      anchorPageDeltasAreNonUniform: true,
      terminalContinuation: {
        pageNumber: 13,
        bodyCommandCount: 62,
        spanPt: 328,
      },
    })
    expect(COMPARISON.comparison.anchors.map((anchor: any) => anchor.pageDelta)).toEqual([
      0, -1, -1, -2, -1, -1, 0, 0, 1, 0, 0, 0,
    ])

    const sections = Object.fromEntries(
      COMPARISON.comparison.sections.map((section: any) => [section.sectionId, section]),
    )
    expect(sections["native-extraction"]).toMatchObject({
      referenceCharacterCount: 740,
      candidateCharacterCount: 2371,
      candidateToReferenceRatio: 3.2041,
    })
    expect(sections.mapping).toMatchObject({
      referenceCharacterCount: 1039,
      candidateCharacterCount: 2416,
      candidateToReferenceRatio: 2.3253,
    })
    expect(sections["decision-view"]).toMatchObject({
      referenceCharacterCount: 1202,
      candidateCharacterCount: 74,
      candidateToReferenceRatio: 0.0616,
    })
  })

  it("rejects a geometry-only twelve-page claim and keeps the source-backed page count authoritative", () => {
    expect(COMPARISON.comparison.verticalReclamationHypothesis).toEqual({
      referenceObservedBodyEnvelopeHeightPt: 669.45,
      candidateContractBodyFrameHeightPt: 641.952756,
      theoreticalGainPerPagePt: 27.497244,
      theoreticalGainAcrossTwelvePagesPt: 329.966928,
      terminalContinuationSpanPt: 328,
      theoreticalHeadroomPt: 1.966928,
      capacityProof: false,
      classification: "numerically-close-but-fragmentation-and-content-policy-unproven",
    })
    expect(COMPARISON.decision).toMatchObject({
      comparisonEvidenceAccepted: true,
      visualFidelityAccepted: false,
      pixelParityApplicable: false,
      twelvePageHardGateAccepted: false,
      sourceBackedPageCountAccepted: true,
      authoritativeCandidatePageCount: 13,
      pageCountPolicy: "content-driven-not-reference-fixed",
      productionBinding: false,
    })
    expect(COMPARISON.decision.reasonCodes).toEqual(expect.arrayContaining([
      "source-backed-content-exceeds-reference",
      "semantic-section-balance-differs",
      "anchor-drift-is-non-uniform",
      "margin-reclamation-is-not-capacity-proof",
      "terminal-table-content-must-be-retained",
    ]))
  })

  it("publishes reproducible evidence and leaves all PDF and raster bytes local", () => {
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_FULL_DOCUMENT_VISUAL_COMPARISON.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const inspector = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py",
    ), "utf8")

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-N comparison evidence accepted")
    expect(proof).toContain("1.966928pt")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-N Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-N Visual Comparison and Page-Count Decision")
    expect(readme).toContain("PDF canonical visual comparison")
    expect(packageReadme).toContain("Visual Comparison and Page-Count Decision")
    expect(inspector).toContain('"capacityProof": False')
    expect(inspector).toContain('"pageCountPolicy": "content-driven-not-reference-fixed"')
    expect(inspector).not.toMatch(/[A-Z]:\\Users\\/u)
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/OCR_Benchmark_INV_9437125258_TH_final.pdf",
    ))).toBe(false)
    expect(existsSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/fixtures/paired-contact-sheet.png",
    ))).toBe(false)
  })
})
