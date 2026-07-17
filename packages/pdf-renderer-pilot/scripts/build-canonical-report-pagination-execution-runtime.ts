import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../src/canonicalReportMeasuredComposition.js"
import {
  createFlowDocCanonicalReportPaginationExecutionBundleV1,
  validateFlowDocCanonicalReportPaginationExecutionBundleV1,
  type FlowDocCanonicalReportPaginationExecutionBundleV1,
} from "../src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../src/canonicalReportSectionReconciliation.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function createQa(bundle: FlowDocCanonicalReportPaginationExecutionBundleV1) {
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-j-canonical-report-pagination-execution-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-bounded-pagination-and-authoritative-page-plan-rendering-not-run",
    sourceFingerprints: {
      paginationInputs: bundle.sourcePaginationInputsFingerprint,
      measuredComposition: bundle.sourceMeasuredCompositionFingerprint,
      sectionReconciliation: bundle.sourceSectionReconciliationFingerprint,
      coreCompositionManifest: bundle.sourceCoreCompositionManifestFingerprint,
    },
    bundleFingerprint: bundle.bundleFingerprint,
    pagePlanFingerprint: bundle.corePagePlan.fingerprint,
    compositionFingerprint: bundle.corePagePlan.compositionFingerprint,
    terminalCheckpointFingerprint: bundle.terminalCheckpoint.fingerprint,
    summary: bundle.summary,
    pages: bundle.corePagePlan.pages.map((page) => ({
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      sectionPageIndex: page.sectionPageIndex,
      usedHeightPt: page.usedHeightPt,
      remainingHeightPt: page.remainingHeightPt,
      placementCount: page.placements.length,
      closeReason: page.closeReason,
      firstRootNodeId: page.placements[0]?.rootNodeId ?? null,
      lastRootNodeId: page.placements.at(-1)?.rootNodeId ?? null,
      staticZoneCount: page.staticZones.length,
      pageFingerprint: page.fingerprint,
    })),
    executionGate: {
      status: "authoritative-page-plan-ready-renderer-handoff-blocked",
      everyBodyRootPlaced: bundle.summary.placedRootCount === bundle.summary.bodyItemCount,
      boundedOnePageFamilyWindows: bundle.limits.coreTransition.maximumFamilyPageCount === 1,
      boundedOnePlacementTransitions: bundle.limits.coreTransition.maximumPlacementCount === 1,
      resumableSlicesRetained: bundle.sliceReceipts.length > 0,
      familyPaginationExecuted: true,
      spacingBridgeExecuted: true,
      pageAssignmentFinalized: true,
      actualPageNumbersExpanded: false,
      staticZonePaintPlanned: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-K generated static-zone instances and renderer handoff",
  }
}

export function buildCanonicalReportPaginationExecution(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const source = {
    paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json"),
    ),
    measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json"),
    ),
    sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json"),
    ),
  }
  const bundle = createFlowDocCanonicalReportPaginationExecutionBundleV1(source)
  const rebuilt = createFlowDocCanonicalReportPaginationExecutionBundleV1(source)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report pagination execution is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportPaginationExecutionBundleV1(bundle, source)
  if (validation.status !== "valid") {
    throw new Error(`Generated pagination execution bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-execution-qa.v1.json",
  )
  for (const path of [bundlePath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
