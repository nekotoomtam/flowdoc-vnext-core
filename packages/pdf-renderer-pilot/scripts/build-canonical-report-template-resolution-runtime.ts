import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "../src/canonicalReportDataAdapter.js"
import {
  createFlowDocCanonicalReportTemplateResolutionBundleV1,
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
} from "../src/canonicalReportTemplateResolution.js"

export function buildCanonicalReportTemplateResolution(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const sourcePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json")
  const dataBundle = JSON.parse(readFileSync(sourcePath, "utf8")) as FlowDocCanonicalReportDataBundleV1
  const sourceValidation = validateFlowDocCanonicalReportDataBundleV1(dataBundle)
  if (sourceValidation.status !== "valid") {
    throw new Error("Pinned R2A canonical report data bundle is invalid.")
  }

  const bundle = createFlowDocCanonicalReportTemplateResolutionBundleV1(dataBundle)
  const rebuilt = createFlowDocCanonicalReportTemplateResolutionBundleV1(dataBundle)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report template resolution bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportTemplateResolutionBundleV1(bundle)
  if (validation.status !== "valid") {
    throw new Error("Generated canonical report template resolution bundle is invalid.")
  }

  const bundlePath = resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
  )
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-template-resolution-qa.v1.json",
  )
  mkdirSync(dirname(bundlePath), { recursive: true })
  mkdirSync(dirname(qaPath), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify({
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2b-canonical-report-template-resolution-qa-v1",
    phaseId: "PDF-PILOT-08B-R2B",
    status: "accepted",
    templateId: bundle.templateId,
    sourceDataBundleFingerprint: bundle.sourceDataBundleFingerprint,
    resolutionInputFingerprint: bundle.resolutionInputFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    pageContract: {
      size: "Letter",
      semanticSectionCount: bundle.summary.semanticSectionCount,
      fixedPageCountClaimed: false,
    },
    coverage: {
      presentationFieldCount: bundle.coverage.presentationFieldKeys.length,
      evidenceOnlyFieldCount: bundle.coverage.evidenceOnlyFieldKeys.length,
      scalarPlacementCount: bundle.coverage.scalarPlacementCount,
      imagePlacementCount: bundle.coverage.imagePlacementCount,
      collectionPlacementCount: bundle.coverage.collectionPlacementCount,
      collectionItemBindingCount: bundle.coverage.collectionItemBindingCount,
      allFieldsClassified: true,
    },
    resolution: {
      scopedDocumentStatus: bundle.scopedResolution.status,
      validatedTableScopeCount: bundle.scopedResolution.tablePlans.length,
      deferredItemPlacementCount: bundle.scopedResolution.deferredCollectionItemPlacements.length,
      collectionRowCount: bundle.summary.collectionRowCount,
      collectionCellCount: bundle.summary.collectionCellCount,
      deterministicRebuild: true,
    },
    boundary: {
      initialInstanceMaterialization: bundle.execution.instanceMaterialization,
      localeDisplayFormatting: bundle.execution.localeDisplayFormatting,
      textMeasurement: bundle.execution.textMeasurement,
      lineBreaking: bundle.execution.lineBreaking,
      layout: bundle.execution.layout,
      pagination: bundle.execution.pagination,
      pdfRendering: bundle.execution.pdfRendering,
      fixedPageCountClaimed: false,
      productionPdfClaimed: false,
    },
    nextPhase: "PDF-PILOT-08B-R2C locale formatting and text-engine/layout integration",
  }, null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
