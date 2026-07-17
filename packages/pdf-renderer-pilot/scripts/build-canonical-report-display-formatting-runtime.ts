import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "../src/canonicalReportDataAdapter.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "../src/canonicalReportTemplateResolution.js"
import {
  createFlowDocCanonicalReportDisplayFormattingBundleV1,
  validateFlowDocCanonicalReportDisplayFormattingBundleV1,
} from "../src/canonicalReportDisplayFormatting.js"

export function buildCanonicalReportDisplayFormatting(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const dataBundle = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json"),
    "utf8",
  )) as FlowDocCanonicalReportDataBundleV1
  const templateBundle = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json"),
    "utf8",
  )) as FlowDocCanonicalReportTemplateResolutionBundleV1
  if (validateFlowDocCanonicalReportDataBundleV1(dataBundle).status !== "valid") {
    throw new Error("Pinned R2A canonical report data bundle is invalid.")
  }
  if (validateFlowDocCanonicalReportTemplateResolutionBundleV1(templateBundle).status !== "valid") {
    throw new Error("Pinned R2B canonical report template bundle is invalid.")
  }

  const bundle = createFlowDocCanonicalReportDisplayFormattingBundleV1(dataBundle, templateBundle)
  const rebuilt = createFlowDocCanonicalReportDisplayFormattingBundleV1(dataBundle, templateBundle)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report display formatting bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportDisplayFormattingBundleV1(
    bundle,
    dataBundle,
    templateBundle,
  )
  if (validation.status !== "valid") {
    throw new Error("Generated canonical report display formatting bundle is invalid.")
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-display-formatting-qa.v1.json",
  )
  mkdirSync(dirname(bundlePath), { recursive: true })
  mkdirSync(dirname(qaPath), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify({
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-a-canonical-report-display-formatting-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted",
    sourceDataBundleFingerprint: bundle.sourceDataBundleFingerprint,
    sourceTemplateBundleFingerprint: bundle.sourceTemplateBundleFingerprint,
    resolutionInputFingerprint: bundle.resolutionInputFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    locale: bundle.formatContract.locale,
    determinism: {
      ...bundle.formatContract.determinism,
      deterministicRebuild: true,
    },
    summary: bundle.summary,
    examples: {
      testDate: bundle.documentBindings.find((binding) => binding.fieldKey === "report.test_date")?.displayText,
      azureOcrMaxLatency: bundle.documentBindings.find(
        (binding) => binding.fieldKey === "report.engine.azure_document_intelligence.latency_ms.max",
      )?.displayText,
      totalCostThb: bundle.documentBindings.find((binding) => binding.fieldKey === "report.total_cost.thb")?.displayText,
      googleCharacterAccuracy: bundle.documentBindings.find(
        (binding) => binding.fieldKey === "report.engine.google_vision.character_accuracy",
      )?.displayText,
    },
    measurementHandoff: bundle.measurementHandoff,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-B measurement-request and table-geometry handoff",
  }, null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
