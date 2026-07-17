import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "../src/canonicalReportDataAdapter.js"
import {
  validateFlowDocCanonicalReportDisplayFormattingBundleV1,
  type FlowDocCanonicalReportDisplayFormattingBundleV1,
} from "../src/canonicalReportDisplayFormatting.js"
import {
  createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocFontAssetManifestV1,
} from "../src/canonicalReportMeasurementRequestHandoff.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "../src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

export function buildCanonicalReportMeasurementHandoff(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const dataBundle = readJson<FlowDocCanonicalReportDataBundleV1>(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json"),
  )
  const templateBundle = readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json"),
  )
  const formattingBundle = readJson<FlowDocCanonicalReportDisplayFormattingBundleV1>(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json"),
  )
  const fontManifest = readJson<FlowDocFontAssetManifestV1>(
    resolve(repoRoot, "assets/fonts/font-assets.v1.json"),
  )
  if (validateFlowDocCanonicalReportDataBundleV1(dataBundle).status !== "valid") {
    throw new Error("Pinned R2A canonical report data bundle is invalid.")
  }
  if (validateFlowDocCanonicalReportTemplateResolutionBundleV1(templateBundle).status !== "valid") {
    throw new Error("Pinned R2B canonical report template bundle is invalid.")
  }
  if (validateFlowDocCanonicalReportDisplayFormattingBundleV1(
    formattingBundle,
    dataBundle,
    templateBundle,
  ).status !== "valid") {
    throw new Error("Pinned R2C-A canonical report display formatting bundle is invalid.")
  }

  const bundle = createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    dataBundle,
    templateBundle,
    formattingBundle,
    fontManifest,
  )
  const rebuilt = createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    dataBundle,
    templateBundle,
    formattingBundle,
    fontManifest,
  )
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report measurement handoff is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    bundle,
    dataBundle,
    templateBundle,
    formattingBundle,
    fontManifest,
  )
  if (validation.status !== "valid") {
    throw new Error("Generated canonical report measurement handoff is invalid.")
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-measurement-handoff-qa.v1.json",
  )
  mkdirSync(dirname(bundlePath), { recursive: true })
  mkdirSync(dirname(qaPath), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}

function createQa(bundle: FlowDocCanonicalReportMeasurementRequestHandoffBundleV1) {
  const tableWidths = bundle.collectionTables.map((table) => ({
    collectionFieldKey: table.collectionFieldKey,
    tableId: table.tableId,
    tableContentWidthPt: table.tableContentWidthPt,
    columnCount: table.geometry.work.columnCount,
    authoredRequestCount: table.authoredPreparation.work.textMeasurementRequestCount,
    materializedRequestCount: table.materializedPreparation.work.textMeasurementRequestCount,
    minimumCellContentWidthPt: Math.min(...Object.values(table.geometry.geometry.rowTemplates)
      .flatMap((template) => template.cells.map((cell) => cell.contentWidthPt))),
  }))
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-b-canonical-report-measurement-handoff-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted",
    sourceDataBundleFingerprint: bundle.sourceDataBundleFingerprint,
    sourceTemplateBundleFingerprint: bundle.sourceTemplateBundleFingerprint,
    sourceFormattingBundleFingerprint: bundle.sourceFormattingBundleFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    measurementProfile: {
      status: bundle.measurementProfile.status,
      measurementProfileId: bundle.measurementProfile.measurementProfileId,
      fontAssetIds: bundle.measurementProfile.ingredients.fontAssets.map((asset) => asset.fontId),
      styleMappingCount: bundle.measurementProfile.summary.styleMappingCount,
      shaperRevision: bundle.measurementProfile.ingredients.shaper.revision,
      segmenterRevision: bundle.measurementProfile.ingredients.segmenter.revision,
      productionBinding: false,
    },
    pageGeometry: {
      pageSize: bundle.pageGeometry.pageSize,
      widthPt: bundle.pageGeometry.widthPt,
      heightPt: bundle.pageGeometry.heightPt,
      bodyWidthPt: bundle.pageGeometry.sections[0]?.bodyWidthPt,
      tableLayoutProfile: bundle.tableLayoutProfile,
    },
    tableWidths,
    summary: bundle.summary,
    generatedInlineDeferrals: bundle.generatedInlineDeferrals.map((item) => ({
      sectionId: item.sectionId,
      textBlockId: item.textBlockId,
      reason: item.reason,
    })),
    executionGate: {
      status: "table-template-revision-required-before-report-wide-measurement",
      reason: "The exhaustive equal-width OCR and Native tables expose 19 and 21 columns with 18.108579pt and 15.622047pt minimum content widths at 9.1-9.3pt table styles.",
      handoffAccepted: true,
      textEngineExecuted: false,
    },
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-C report table projection and geometry correction",
  }
}
