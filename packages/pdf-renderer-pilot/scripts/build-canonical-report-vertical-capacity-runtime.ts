import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../src/canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"
import {
  createFlowDocCanonicalReportVerticalCapacityBundleV1,
  createFlowDocCanonicalReportVerticalCapacityPlanV1,
  validateFlowDocCanonicalReportVerticalCapacityBundleV1,
  type FlowDocCanonicalReportVerticalCapacityBundleV1,
} from "../src/canonicalReportVerticalCapacity.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function createQa(bundle: FlowDocCanonicalReportVerticalCapacityBundleV1) {
  const appliedByRule = bundle.spacingProfile.rules.map((rule) => ({
    ruleId: rule.ruleId,
    adjacency: `${rule.previousCategory}->${rule.currentCategory}`,
    basisStyleKey: rule.basisStyleKey,
    basisLineHeightPt: rule.basisLineHeightPt,
    multiplier: rule.multiplier,
    gapBeforePt: rule.gapBeforePt,
    appliedCount: bundle.spacedBodyItems.filter((item) => item.spacingRuleId === rule.ruleId).length,
  }))
  const bySection = bundle.sectionCapacities.map((section) => ({
    sectionIndex: section.sectionIndex,
    sectionId: section.sectionId,
    bodyItemCount: section.bodyItemCount,
    pageBodyHeightPt: section.pageGeometry.bodyHeightPt,
    naturalBodyHeightPt: section.naturalBodyHeightPt,
    preservedSpacingHeightPt: section.preservedSpacingHeightPt,
    preservedSpacingDemandPt: section.preservedSpacingDemandPt,
    naturalCapacityFloorCount: section.naturalCapacityFloorCount,
    preservedSpacingCapacityCount: section.preservedSpacingCapacityCount,
    naturalSinglePageFit: section.naturalSinglePageFit,
    preservedSpacingSinglePageFit: section.preservedSpacingSinglePageFit,
    header: section.staticZones.header,
    footer: section.staticZones.footer,
  }))
  const wholeTableOverflows = bundle.spacedBodyItems
    .filter((item) => item.family === "table-flow" && !item.wholeRootFitsFreshBody)
    .map((item) => ({
      sectionId: item.sectionId,
      rootNodeId: item.rootNodeId,
      naturalHeightPt: item.naturalHeightPt,
      pageBodyHeightPt: bundle.sectionCapacities[item.sectionIndex].pageGeometry.bodyHeightPt,
      samePageMinimumProgressHeightPt: item.samePageMinimumProgressHeightPt,
      freshPageMinimumProgressHeightPt: item.freshPageMinimumProgressHeightPt,
      capacityMode: item.capacityMode,
    }))
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-g-canonical-report-vertical-capacity-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-capacity-evidence-target-page-count-blocked",
    sourceFingerprints: {
      projection: bundle.sourceProjectionFingerprint,
      measuredComposition: bundle.sourceMeasuredCompositionFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    coreCompositionManifestFingerprint: bundle.coreCompositionManifest.fingerprint,
    spacingProfile: bundle.spacingProfile,
    appliedByRule,
    bySection,
    wholeTableOverflows,
    summary: bundle.summary,
    fidelityGate: bundle.fidelityGate,
    executionGate: {
      status: "capacity-ready-composition-transition-blocked",
      exactAdjacencySpacingBound: true,
      pageRegionGeometryBound: true,
      staticHeaderReservationsFit: true,
      staticFooterHeightReserved: true,
      generatedFooterMeasured: false,
      coreCompositionManifestFinalized: true,
      everyRootCanMakeFreshPageProgress: true,
      coreSpacingBridgeExecuted: false,
      paginationExecuted: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-H section-capacity reconciliation and Core spacing transition bridge",
  }
}

export function buildCanonicalReportVerticalCapacity(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = {
    projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json"),
    ),
    measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportVerticalCapacityPlanV1(input)
  const bundle = createFlowDocCanonicalReportVerticalCapacityBundleV1(input)
  const rebuilt = createFlowDocCanonicalReportVerticalCapacityBundleV1(input)
  if (bundle.planFingerprint !== plan.planFingerprint) {
    throw new Error("Canonical report vertical-capacity plan identity drifted.")
  }
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report vertical-capacity bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportVerticalCapacityBundleV1(bundle, input)
  if (validation.status !== "valid") {
    throw new Error(`Generated canonical report vertical-capacity bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-vertical-capacity-qa.v1.json",
  )
  for (const path of [bundlePath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
