import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"
import {
  createFlowDocCanonicalReportSectionReconciliationBundleV1,
  createFlowDocCanonicalReportSectionReconciliationPlanV1,
  validateFlowDocCanonicalReportSectionReconciliationBundleV1,
  type FlowDocCanonicalReportSectionReconciliationBundleV1,
} from "../src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportVerticalCapacityBundleV1 } from "../src/canonicalReportVerticalCapacity.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function createQa(bundle: FlowDocCanonicalReportSectionReconciliationBundleV1) {
  const spacingByRule = [...new Set(bundle.spacingBridgeBindings.map((item) => item.reconciledSpacingRuleId))]
    .map((ruleId) => {
      const bindings = bundle.spacingBridgeBindings.filter((item) => item.reconciledSpacingRuleId === ruleId)
      return {
        ruleId,
        appliedCount: bindings.length,
        positiveCount: bindings.filter((item) => item.gapBeforePt > 0).length,
        totalGapPt: Number(bindings.reduce((total, item) => total + item.gapBeforePt, 0).toFixed(6)),
      }
    })
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-h-canonical-report-section-reconciliation-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-reconciliation-strategy-twelve-page-pagination-blocked",
    sourceFingerprints: {
      projection: bundle.sourceProjectionFingerprint,
      verticalCapacity: bundle.sourceVerticalCapacityFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    reconciledResolvedProjectionFingerprint: bundle.reconciledResolvedProjectionFingerprint,
    coreCompositionManifestFingerprint: bundle.coreCompositionManifest.fingerprint,
    reconciliationPolicy: bundle.reconciliationPolicy,
    staticZoneEquivalence: bundle.staticZoneEquivalence,
    semanticSectionStartSpacingRule: bundle.semanticSectionStartSpacingRule,
    semanticSections: bundle.semanticSectionBindings,
    spacingBridgeContract: bundle.spacingBridgeContract,
    spacingByRule,
    fidelityGate: bundle.fidelityGate,
    rejectedAlternatives: bundle.rejectedAlternatives,
    summary: bundle.summary,
    executionGate: {
      status: "reconciliation-ready-pagination-blocked",
      allSemanticSectionsRetained: true,
      allBodyRootsRetained: true,
      staticZonesEquivalent: true,
      continuousCompositionSectionFinalized: true,
      semanticSectionStartGapBound: true,
      coreSpacingBridgeContractBound: true,
      standaloneSpacerRootsInserted: false,
      sourceDocumentMutated: false,
      familyPaginationInputsBound: false,
      generatedFooterMeasured: false,
      documentCompositionTransitionExecuted: false,
      paginationExecuted: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-I family pagination input binding and generated footer measurement",
  }
}

export function buildCanonicalReportSectionReconciliation(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = {
    projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json"),
    ),
    verticalCapacity: readJson<FlowDocCanonicalReportVerticalCapacityBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportSectionReconciliationPlanV1(input)
  const bundle = createFlowDocCanonicalReportSectionReconciliationBundleV1(input)
  const rebuilt = createFlowDocCanonicalReportSectionReconciliationBundleV1(input)
  if (bundle.planFingerprint !== plan.planFingerprint) {
    throw new Error("Canonical report section-reconciliation plan identity drifted.")
  }
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report section-reconciliation bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportSectionReconciliationBundleV1(bundle, input)
  if (validation.status !== "valid") {
    throw new Error(`Generated canonical report section-reconciliation bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-section-reconciliation-qa.v1.json",
  )
  for (const path of [bundlePath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
