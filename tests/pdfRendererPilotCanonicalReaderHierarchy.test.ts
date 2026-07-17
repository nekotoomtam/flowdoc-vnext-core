import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const HIERARCHY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-reader-hierarchy.v1.json",
)
const TEMPLATE = readJson<any>("fixtures/pdf-pilot-canonical-report-template-resolution.v1.json")
const NATIVE = readJson<any>("fixtures/pdf-pilot-canonical-report-native-shaping.v1.json")
const BODY = readJson<any>("fixtures/pdf-pilot-canonical-report-body-display-list.v1.json")
const SUMMARY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)
const QA = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json",
)

describe("PDF-PILOT-08B-R2C-O canonical reader hierarchy", () => {
  it("pins the accepted R2C-N baseline and exact recalibrated candidate", () => {
    expect(HIERARCHY).toMatchObject({
      comparisonVersion: 1,
      comparisonId: "pdf-pilot-08b-r2c-o-canonical-full-document-reader-hierarchy-v1",
      phaseId: "PDF-PILOT-08B-R2C-O",
      status: "accepted-reader-hierarchy-visual-fidelity-still-rejected",
      baseline: {
        comparisonId: "pdf-pilot-08b-r2c-n-canonical-full-document-visual-comparison-v1",
        phaseId: "PDF-PILOT-08B-R2C-N",
        sha256: "32f5dd674c1c54a3c76e784a22bcadfc89b26af5dc10b3ca6fffda6ae111d3d9",
        candidateSha256: "014b313690041ba312b10dc0bcbf65a3131580258d80e2f8b07465d8e107ed0f",
      },
      inputs: {
        reference: {
          sha256: "56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8",
          bytes: 714952,
          pageCount: 12,
        },
        candidate: {
          sha256: "91787999d2e2711293d4adc1bafcceba610201b934212f0d7b22cc96ea703041",
          bytes: 1223440,
          pageCount: 13,
          sourceBundleFingerprint: BODY.bundleFingerprint,
        },
        externalPdfBytesRetained: false,
        rasterBytesRetained: false,
      },
    })
    expect(SUMMARY.artifact.sha256).toBe(HIERARCHY.inputs.candidate.sha256)
    expect(QA.artifact.sha256).toBe(HIERARCHY.inputs.candidate.sha256)
    expect(JSON.stringify(HIERARCHY)).not.toMatch(/[A-Z]:\\Users\\/u)
  })

  it("accepts the measured hierarchy improvement without accepting visual fidelity", () => {
    expect(HIERARCHY.calibration).toMatchObject({
      boldCharacterShare: {
        reference: 0.158866,
        before: 0.417496,
        after: 0.091591,
        absoluteGapBefore: 0.25863,
        absoluteGapAfter: 0.067275,
        absoluteGapImprovement: 0.191355,
      },
      extractedNonWhitespaceCharacterCount: { before: 13866, after: 14663, delta: 797 },
      executiveSummaryCharacterCount: { reference: 1143, before: 290, after: 810 },
      decisionViewCharacterCount: { reference: 1202, before: 74, after: 468 },
      sourceBackedBody: {
        pageCount: 13,
        bodyEntryCount: 185,
        textEntryCount: 165,
        tableEntryCount: 15,
        missingGlyphCount: 0,
      },
      acceptance: {
        referenceIdentityPreserved: true,
        candidateStructuralIdentityAligned: true,
        pageCountRemainsContentDriven: true,
        extractedDensityNonDecreasing: true,
        executiveNarrativeExpanded: true,
        decisionNarrativeExpanded: true,
        roleWeightGapImproved: true,
        roleWeightWithinEightPercentagePoints: true,
        visualFidelityAccepted: false,
      },
    })
    expect(HIERARCHY.decision).toMatchObject({
      comparisonEvidenceAccepted: true,
      informationHierarchyAccepted: true,
      roleLevelWeightCalibrationAccepted: true,
      sourceBackedNarrativeAccepted: true,
      visualFidelityAccepted: false,
      twelvePageHardGateAccepted: false,
      sourceBackedPageCountAccepted: true,
      authoritativeCandidatePageCount: 13,
      pageCountPolicy: "content-driven-not-reference-fixed",
      productionBinding: false,
    })
  })

  it("binds narrative through real fields and limits local Bold to reader labels", () => {
    expect(TEMPLATE.summary).toMatchObject({
      templateNodeCount: 485,
      scalarBindingCount: 136,
      styleBindingCount: 300,
    })
    const narrativeBlockIds = new Set([
      "executive-summary-critical-values",
      "executive-summary-ocr-speed",
      "executive-summary-native-coverage",
      "executive-summary-native-cost",
      "executive-summary-mapping-limit",
      "decision-view-ocr-speed",
      "decision-view-native-detail",
      "decision-view-native-cost",
      "decision-view-response-size",
      "decision-view-mapping-gate",
    ])
    const narrativeBindings = TEMPLATE.scopedResolution.resolvedDocument.bindings.fields.filter(
      (binding: any) => narrativeBlockIds.has(binding.textBlockId),
    )
    expect(narrativeBindings).toHaveLength(22)
    const narrativeFieldKeys = new Set(
      narrativeBindings.map((binding: any) => binding.fieldKey),
    )
    expect([...narrativeFieldKeys]).toEqual(expect.arrayContaining([
      "report.decision.ocr_latency_delta_ms",
      "report.decision.native_cost_ratio",
      "report.engine.google_document_ai_native.structured_concept_coverage",
      "report.engine.azure_document_intelligence_native.cost_thb",
      "report.engine.google_document_ai_native.mapping.recall",
    ]))

    const boldOverrides = NATIVE.consumers.flatMap((consumer: any) => (
      consumer.runBindings
        .filter((run: any) => run.localBoldOverride)
        .map((run: any) => [consumer.source.textBlockId, run.inlineId])
    ))
    expect(NATIVE.summary.localBoldOverrideRunCount).toBe(2)
    expect(boldOverrides).toEqual([
      ["executive-summary-reader-label", "executive-summary-reader-label-text"],
      ["decision-view-reader-label", "decision-view-reader-label-text"],
    ])
    expect(BODY.summary).toMatchObject({
      pageCount: 13,
      bodyEntryCount: 185,
      sourceBodyPlacementCount: 187,
      missingGlyphCount: 0,
      fullRendererHandoffConsumable: true,
    })
  })

  it("publishes the decision while leaving static-zone and composition parity downstream", () => {
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_READER_HIERARCHY_PROOF.md",
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

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-O reader hierarchy accepted")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-O Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-O Reader Hierarchy Calibration")
    expect(readme).toContain("PDF canonical reader hierarchy")
    expect(packageReadme).toContain("Reader Hierarchy Calibration")
    expect(inspector).toContain('"roleWeightGapImproved": current_bold_gap < baseline_bold_gap')
    expect(inspector).toContain('"informationHierarchyAccepted": True')
    expect(HIERARCHY.nextPhase).toBe(
      "PDF-PILOT-08B-R2C-P measured static-zone and section-composition calibration",
    )
  })
})
