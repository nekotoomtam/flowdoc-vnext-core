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
  validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocFontAssetManifestV1,
} from "../src/canonicalReportMeasurementRequestHandoff.js"
import {
  createFlowDocCanonicalReportTableProjectionBundleV1,
  validateFlowDocCanonicalReportTableProjectionBundleV1,
  type FlowDocCanonicalReportTableProjectionBundleV1,
} from "../src/canonicalReportTableProjection.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "../src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function minimumContentWidth(table: FlowDocCanonicalReportTableProjectionBundleV1["tableMeasurements"][number]): number {
  return Math.min(...Object.values(table.geometry.geometry.rowTemplates)
    .flatMap((template) => template.cells.map((cell) => cell.contentWidthPt)))
}

function createQa(bundle: FlowDocCanonicalReportTableProjectionBundleV1) {
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-c-canonical-report-table-projection-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted",
    sourceFingerprints: {
      data: bundle.sourceDataBundleFingerprint,
      template: bundle.sourceTemplateBundleFingerprint,
      formatting: bundle.sourceFormattingBundleFingerprint,
      measurementHandoff: bundle.sourceMeasurementHandoffFingerprint,
    },
    projectionContractFingerprint: bundle.projectionContractFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    projections: bundle.projectedTables.map((table) => {
      const measurement = bundle.tableMeasurements.find((candidate) => (
        candidate.projectionId === table.projectionId
      ))!
      return {
        collectionFieldKey: table.resolution.collectionFieldKey,
        projectionId: table.projectionId,
        viewLabel: table.viewLabel,
        tableId: table.resolution.definition.tableId,
        tableContentWidthPt: measurement.tableContentWidthPt,
        columns: table.columns.map((column) => ({
          fieldKey: column.fieldKey,
          headerLabel: column.headerLabel,
          coverageRole: column.coverageRole,
          widthShare: column.widthShare,
        })),
        sourceRowCount: table.resolution.resolvedRows.rows.filter((row) => (
          row.source.kind === "collection-row"
        )).length,
        formattedBindingCount: measurement.formattedBindingCount,
        authoredRequestCount: measurement.authoredPreparation.work.textMeasurementRequestCount,
        materializedRequestCount: measurement.materializedPreparation.work.textMeasurementRequestCount,
        minimumCellContentWidthPt: minimumContentWidth(measurement),
      }
    }),
    geometryGate: {
      status: "accepted-ready-for-text-engine-binding",
      sourceTableCount: bundle.summary.sourceCollectionCount,
      projectedTableCount: bundle.summary.projectionTableCount,
      sourceMaximumColumnCount: 21,
      projectedMaximumColumnCount: bundle.summary.maximumProjectedColumnCount,
      sourceMinimumCellContentWidthPt: bundle.summary.sourceMinimumCellContentWidthPt,
      projectedMinimumCellContentWidthPt: bundle.summary.minimumCellContentWidthPt,
      tableWidthPt: bundle.projectionContract.requirements.tableWidthPt,
      minimumColumnWidthShare: bundle.projectionContract.requirements.minimumColumnWidthShare,
      sourceCollectionContractMutation: bundle.projectionContract.requirements.sourceCollectionContractMutation,
    },
    summary: bundle.summary,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-D text-engine profile binding and execution boundary",
  }
}

export function buildCanonicalReportTableProjection(): {
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
  const measurementHandoff = readJson<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1>(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json"),
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
  if (validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    measurementHandoff,
    dataBundle,
    templateBundle,
    formattingBundle,
    fontManifest,
  ).status !== "valid") {
    throw new Error("Pinned R2C-B canonical report measurement handoff is invalid.")
  }

  const bundle = createFlowDocCanonicalReportTableProjectionBundleV1(
    dataBundle,
    templateBundle,
    formattingBundle,
    measurementHandoff,
    fontManifest,
  )
  const rebuilt = createFlowDocCanonicalReportTableProjectionBundleV1(
    dataBundle,
    templateBundle,
    formattingBundle,
    measurementHandoff,
    fontManifest,
  )
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report table projection is not deterministic.")
  }
  if (validateFlowDocCanonicalReportTableProjectionBundleV1(
    bundle,
    dataBundle,
    templateBundle,
    formattingBundle,
    measurementHandoff,
    fontManifest,
  ).status !== "valid") {
    throw new Error("Generated canonical report table projection is invalid.")
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-table-projection-qa.v1.json",
  )
  mkdirSync(dirname(bundlePath), { recursive: true })
  mkdirSync(dirname(qaPath), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
