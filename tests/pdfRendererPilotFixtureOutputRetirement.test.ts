import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

const retiredFixtureOutputs = [
  "packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-bold-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-callout-regions.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-reader-hierarchy.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-regular-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-static-section-calibration.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-visual-comparison.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-body-display-list-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-data-bundle-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-display-formatting-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-line-breaking-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-line-segmentation-raw.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-measured-composition-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-measurement-handoff-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-raw.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-execution-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-raw.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-production-baseline.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-real-export-handoff.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-section-reconciliation-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-handoff-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-raw.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-table-projection-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-template-resolution-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-report-vertical-capacity-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalFullDocument-Bold.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalFullDocument-Regular.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalReportContentParitySubset-Regular.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalReportSubset-Regular.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalReportTypography-Bold.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalReportTypography-Regular.ttf",
  "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiPilotSubset-Regular.ttf",
  "packages/pdf-renderer-pilot/fixtures/generic-box-cross-reader-compatibility.v1.json",
  "packages/pdf-renderer-pilot/fixtures/image-one-page-proof-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/image-one-page-proof-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/one-page-proof-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json",
  "packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-qa.v1.json",
  "packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-summary.v1.json",
] as const

const retiredFixtureBoundTests = [
  "tests/pdfExportProductionBaselineV1.test.ts",
  "tests/pdfRendererPilotAllImages.test.ts",
  "tests/pdfRendererPilotCanonicalCalloutRegions.test.ts",
  "tests/pdfRendererPilotCanonicalFullDocument.test.ts",
  "tests/pdfRendererPilotCanonicalReaderHierarchy.test.ts",
  "tests/pdfRendererPilotCanonicalReport.test.ts",
  "tests/pdfRendererPilotCanonicalReportBodyDisplayList.test.ts",
  "tests/pdfRendererPilotCanonicalReportContentParity.test.ts",
  "tests/pdfRendererPilotCanonicalReportDataBundle.test.ts",
  "tests/pdfRendererPilotCanonicalReportDisplayFormatting.test.ts",
  "tests/pdfRendererPilotCanonicalReportLineBreaking.test.ts",
  "tests/pdfRendererPilotCanonicalReportMeasuredComposition.test.ts",
  "tests/pdfRendererPilotCanonicalReportMeasurementHandoff.test.ts",
  "tests/pdfRendererPilotCanonicalReportNativeShaping.test.ts",
  "tests/pdfRendererPilotCanonicalReportPaginationExecution.test.ts",
  "tests/pdfRendererPilotCanonicalReportPaginationInputs.test.ts",
  "tests/pdfRendererPilotCanonicalReportSectionReconciliation.test.ts",
  "tests/pdfRendererPilotCanonicalReportSourceData.test.ts",
  "tests/pdfRendererPilotCanonicalReportStaticZoneHandoff.test.ts",
  "tests/pdfRendererPilotCanonicalReportTableProjection.test.ts",
  "tests/pdfRendererPilotCanonicalReportTemplateResolution.test.ts",
  "tests/pdfRendererPilotCanonicalReportTypography.test.ts",
  "tests/pdfRendererPilotCanonicalReportVerticalCapacity.test.ts",
  "tests/pdfRendererPilotCanonicalStaticSectionCalibration.test.ts",
  "tests/pdfRendererPilotCanonicalVisualComparison.test.ts",
  "tests/pdfRendererPilotControlledExecution.test.ts",
  "tests/pdfRendererPilotGenericBoxCrossReaderCompatibility.test.ts",
  "tests/pdfRendererPilotImageOnePage.test.ts",
  "tests/pdfRendererPilotOnePage.test.ts",
  "tests/pdfRendererPilotRealExportHandoff.test.ts",
  "tests/pdfRendererPilotReusableAuthoredBoxContract.test.ts",
  "tests/pdfRendererPilotSharedResources.test.ts",
] as const

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("PDF renderer pilot fixture output retirement", () => {
  it("removes retired generated fixture outputs from Core source", () => {
    for (const path of retiredFixtureOutputs) {
      expect(existsSync(join(repoRoot, path)), `${path} should be retired from Core`).toBe(false)
    }
  })

  it("removes historical pilot tests that required the retired fixture outputs", () => {
    for (const path of retiredFixtureBoundTests) {
      expect(existsSync(join(repoRoot, path)), `${path} should be retired from Core tests`).toBe(false)
    }
  })

  it("documents the fixture-output boundary while retaining the local renderer helper", () => {
    const packageReadme = readText("packages/pdf-renderer-pilot/README.md")
    const handoffDoc = readText("docs/PDF_REAL_EXPORT_HANDOFF.md")
    const uatLocalRuntime = readText("packages/uat-realdoc/local-runtime/index.ts")

    expect(packageReadme).toContain("tracked generated fixture outputs are retired from Core")
    expect(handoffDoc).toContain("canonical pilot fixture output is retired from Core")
    expect(uatLocalRuntime).toContain("packages/pdf-renderer-pilot/scripts/build-canonical-report-font-subset.py")
  })
})
