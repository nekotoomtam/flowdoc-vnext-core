import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const CALIBRATION = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-static-section-calibration.v1.json",
)
const CAPACITY = readJson<any>(
  "fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json",
)
const BODY = readJson<any>("fixtures/pdf-pilot-canonical-report-body-display-list.v1.json")

describe("PDF-PILOT-08B-R2C-P canonical static and section calibration", () => {
  it("pins R2C-O as the baseline and preserves the historical Phase P artifact", () => {
    expect(CALIBRATION).toMatchObject({
      comparisonVersion: 1,
      comparisonId:
        "pdf-pilot-08b-r2c-p-canonical-full-document-static-section-calibration-v1",
      phaseId: "PDF-PILOT-08B-R2C-P",
      status: "accepted-static-section-calibration-visual-fidelity-still-rejected",
      baseline: {
        comparisonId: "pdf-pilot-08b-r2c-o-canonical-full-document-reader-hierarchy-v1",
        phaseId: "PDF-PILOT-08B-R2C-O",
        candidateSha256: "91787999d2e2711293d4adc1bafcceba610201b934212f0d7b22cc96ea703041",
      },
      inputs: {
        reference: {
          sha256: "56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8",
          bytes: 714952,
          pageCount: 12,
        },
        candidate: {
          sha256: "1e78e3b4a4e9d78b0e7b02fd535bd486db1d3fbab9c37228e6082e00d0c1f36a",
          bytes: 1212504,
          pageCount: 13,
          sourceBundleFingerprint: "18f4e7a322e6af1d4073dd4de277a3fb4d9d64905eac50c160c3cb7faebfa084",
        },
      },
    })
    expect(JSON.stringify(CALIBRATION)).not.toMatch(/[A-Z]:\\Users\\/u)
  })

  it("accepts measured static geometry without accepting document parity", () => {
    expect(CALIBRATION.calibration).toMatchObject({
      pageFramePt: {
        margin: { top: 20.65, right: 72.03, bottom: 15.94, left: 72.02 },
        headerReservedPt: 32.22,
        footerReservedPt: 24,
        body: {
          bodyOriginXPt: 72.02,
          bodyOriginYPt: 52.87,
          bodyWidthPt: 467.95,
          bodyHeightPt: 699.19,
        },
      },
      staticEnvelopeGapsPt: {
        top: { before: 30.37, after: 0 },
        bottom: { before: 34.7, after: 0.39 },
      },
      observedBodyGapsPt: {
        left: { before: 15.33, after: 0 },
        top: { before: 22.15, after: 1.54 },
      },
      bodyCommandEnvelopePt: {
        left: 72.02,
        right: 539.97,
        calibratedLeft: 72.02,
        calibratedRight: 539.97,
        horizontalOverflowPt: 0,
      },
      acceptance: {
        referenceIdentityPreserved: true,
        baselineHierarchyAccepted: true,
        candidateStructuralIdentityAligned: true,
        pageCountRemainsContentDriven: true,
        extractedDensityNonDecreasing: true,
        staticTopGapImproved: true,
        staticTopWithinOnePoint: true,
        staticBottomGapImproved: true,
        staticBottomWithinOnePoint: true,
        bodyLeftGapImproved: true,
        bodyLeftWithinOneTenthPoint: true,
        bodyTopGapImproved: true,
        bodyTopWithinTwoPoints: true,
        bodyCommandsStayInsideCalibratedWidth: true,
        readerRoleBindingsPresent: true,
        semanticSpacingRulesPresent: true,
        visualFidelityAccepted: false,
      },
    })
    expect(CALIBRATION.decision).toMatchObject({
      comparisonEvidenceAccepted: true,
      measuredStaticZoneCalibrationAccepted: true,
      semanticSectionCompositionAccepted: true,
      bodyWidthBoundaryAccepted: true,
      informationHierarchyAccepted: true,
      visualFidelityAccepted: false,
      authoritativeCandidatePageCount: 13,
      pageCountPolicy: "content-driven-not-reference-fixed",
      productionBinding: false,
    })
  })

  it("binds reader summaries to explicit measured adjacency rules", () => {
    expect(CAPACITY.spacingProfile.profileId).toBe("ocr-benchmark-report-flow-spacing-v2")
    expect(CALIBRATION.calibration.semanticComposition).toMatchObject({
      readerLabelCount: 2,
      readerSummaryCount: 10,
    })
    expect(CALIBRATION.calibration.semanticComposition.rules.map((rule: any) => ({
      ruleId: rule.ruleId,
      gapBeforePt: rule.gapBeforePt,
    }))).toEqual([
      { ruleId: "body-to-reader-label", gapBeforePt: 12 },
      { ruleId: "reader-label-to-summary", gapBeforePt: 6 },
      { ruleId: "reader-summary-stack", gapBeforePt: 3 },
      { ruleId: "reader-summary-to-body", gapBeforePt: 12 },
    ])
    expect(BODY.summary).toMatchObject({
      pageCount: 13,
      bodyEntryCount: 185,
      sourceBodyPlacementCount: 189,
      missingGlyphCount: 0,
      fullRendererHandoffConsumable: true,
    })
  })

  it("publishes the boundary and leaves callout treatment downstream", () => {
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_STATIC_SECTION_CALIBRATION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(
      resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"),
      "utf8",
    )
    const inspector = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py",
    ), "utf8")

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-P static and section calibration accepted")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-P Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-P Static and Section Calibration")
    expect(readme).toContain("PDF canonical static and section calibration")
    expect(packageReadme).toContain("Static and Section Calibration")
    expect(inspector).toContain('"bodyCommandsStayInsideCalibratedWidth"')
    expect(inspector).toContain('"measuredStaticZoneCalibrationAccepted": True')
    expect(CALIBRATION.nextPhase).toBe(
      "PDF-PILOT-08B-R2C-Q measured callout treatment and region-aware visual thresholds",
    )
  })
})
