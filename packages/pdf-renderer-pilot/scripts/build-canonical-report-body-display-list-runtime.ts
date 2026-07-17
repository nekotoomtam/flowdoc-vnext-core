import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  createFlowDocCanonicalReportBodyDisplayListBundleV1,
  validateFlowDocCanonicalReportBodyDisplayListBundleV1,
  type FlowDocCanonicalReportBodyDisplayListBundleV1,
  type FlowDocCanonicalReportBodyDisplayListSourceV1,
} from "../src/canonicalReportBodyDisplayList.js"
import type { FlowDocCanonicalReportDataBundleV1 } from "../src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../src/canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "../src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportStaticZoneHandoffBundleV1 } from "../src/canonicalReportStaticZoneHandoff.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function source(repoRoot: string): FlowDocCanonicalReportBodyDisplayListSourceV1 {
  return {
    data: readJson<FlowDocCanonicalReportDataBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json")),
    projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json")),
    nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json")),
    lineBreaking: readJson<FlowDocCanonicalReportLineBreakingBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json")),
    measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json")),
    paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json")),
    sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json")),
    paginationExecution: readJson<FlowDocCanonicalReportPaginationExecutionBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json")),
    staticZones: readJson<FlowDocCanonicalReportStaticZoneHandoffBundleV1>(resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-static-zone-handoff.v1.json")),
    fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(resolve(repoRoot, "assets/fonts/font-assets.v1.json")),
  }
}

function qa(bundle: FlowDocCanonicalReportBodyDisplayListBundleV1) {
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-l-canonical-report-body-display-list-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-full-core-measured-draw-contract-pdf-rendering-pending",
    sourceFingerprints: bundle.sourceFingerprints,
    bundleFingerprint: bundle.bundleFingerprint,
    bodyDisplayListFingerprint: bundle.bodyDisplayList.fingerprint,
    measuredDrawContractFingerprint: bundle.rendererHandoff.measuredDrawContract.fingerprint,
    tableRenderPolicy: bundle.tableRenderPolicy,
    summary: bundle.summary,
    tableReplays: bundle.tableReplays,
    pages: bundle.rendererHandoff.measuredDrawContract.pages.map((page) => ({
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      commandCount: page.commands.length,
      glyphRunCount: page.commands.filter((command) => command.kind === "glyph-run").length,
      imageCount: page.commands.filter((command) => command.kind === "image").length,
      fillRectCount: page.commands.filter((command) => command.kind === "fill-rect").length,
      strokeLineCount: page.commands.filter((command) => command.kind === "stroke-line").length,
    })),
    executionGate: {
      status: "full-measured-draw-contract-consumable-pdf-bytes-pending",
      sourceBodyPlacementsCovered: bundle.summary.sourceBodyPlacementCount === 178,
      bodyEntriesCovered: bundle.summary.bodyEntryCount === 173,
      tableReplaysCovered: bundle.summary.tableReplayCount === 15,
      tableReplayPagesCovered: bundle.summary.tableReplayPageCount === 20,
      imageAssetsCovered: bundle.summary.imageAssetCount === 5,
      emptyTextHandledWithoutFakeGlyphs: bundle.summary.emptyTextReceiptCount === 1,
      missingGlyphCount: bundle.summary.missingGlyphCount,
      fullRendererHandoffConsumable: bundle.summary.fullRendererHandoffConsumable,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-M execute full renderer and verify PDF structure",
  }
}

export function buildCanonicalReportBodyDisplayList(): { bundlePath: string; qaPath: string } {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = source(repoRoot)
  const bundle = createFlowDocCanonicalReportBodyDisplayListBundleV1(input)
  const rebuilt = createFlowDocCanonicalReportBodyDisplayListBundleV1(input)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) throw new Error("Canonical body display list is not deterministic.")
  const validation = validateFlowDocCanonicalReportBodyDisplayListBundleV1(bundle, input)
  if (validation.status !== "valid") throw new Error(`Generated body display list is invalid: ${JSON.stringify(validation.issues)}`)
  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json")
  const qaPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/canonical-report-body-display-list-qa.v1.json")
  for (const path of [bundlePath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(qa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
