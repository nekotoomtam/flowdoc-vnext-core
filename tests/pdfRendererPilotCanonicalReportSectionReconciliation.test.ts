import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parseVNextDocumentCompositionManifestV1 } from "../src/index.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"
import {
  createFlowDocCanonicalReportSectionReconciliationBundleV1,
  createFlowDocCanonicalReportSectionReconciliationPlanV1,
  validateFlowDocCanonicalReportSectionReconciliationBundleV1,
  type FlowDocCanonicalReportSectionReconciliationBundleV1,
  type FlowDocCanonicalReportSectionReconciliationSourceInputV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportVerticalCapacityBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportVerticalCapacity.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT: FlowDocCanonicalReportSectionReconciliationSourceInputV1 = {
  projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
  ),
  verticalCapacity: readJson<FlowDocCanonicalReportVerticalCapacityBundleV1>(
    "fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json",
  ),
}
const BUNDLE = readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(
  "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json",
)

function validate(
  value: unknown,
  input: FlowDocCanonicalReportSectionReconciliationSourceInputV1 = INPUT,
) {
  return validateFlowDocCanonicalReportSectionReconciliationBundleV1(value, input)
}

describe("PDF-PILOT-08B-R2C-H canonical report section reconciliation", () => {
  it("pins the accepted reconciliation strategy and pagination-sensitive capacity", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-H",
      sourceProjectionFingerprint: "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850",
      sourceVerticalCapacityFingerprint: "4d89a4f8bf9b99fbaf7d75825319153021b915cf24cd5f4b15ff467af1a0e2fb",
      planFingerprint: "6498b2892fcc034ded86eeb0b8e536b98340cccf243b98da0aff27e01c5ee580",
      bundleFingerprint: "06159f79a648efce2c78aa4fcde6f17032a31b383c3e4e8a28a741f968789553",
      reconciledResolvedProjectionFingerprint: "sha256:f7a4345025a1c6c125445baed8b1eb21e5d7c2e06d918d4ec12e21e3f2826c3d",
      coreCompositionManifest: {
        fingerprint: "sha256:a29c0159b6fedc22359cdfb80f980fcae816701f0596cbeda1050f0f839297ec",
      },
      summary: {
        semanticSectionCount: 12,
        compositionSectionCount: 1,
        removedForcedSectionBoundaryCount: 11,
        bodyItemCount: 185,
        sourcePositiveSpacingBindingCount: 173,
        reconciledPositiveSpacingBindingCount: 184,
        semanticSectionStartBindingCount: 11,
        sourcePreservedSpacingPt: 898,
        semanticSectionStartSpacingPt: 121,
        reconciledGrossSpacingPt: 1019,
        naturalBodyHeightPt: 7106.047243,
        reconciledGrossDemandPt: 8125.047243,
        pageBodyHeightPt: 699.19,
        previousNaturalSectionCapacityFloorCount: 16,
        previousPreservedSpacingSectionCapacityCount: 18,
        reconciledNaturalGlobalCapacityCount: 11,
        reconciledGrossSpacingCapacityCount: 12,
        targetPageCount: 12,
        grossTargetPageDelta: 0,
        grossCapacityDeltaPt: -265.232757,
        grossOverflowAboveTargetPt: 0,
        grossSlackBelowTargetPt: 265.232757,
        maximumTheoreticalPageTopSuppressionPt: 156,
        maximumTheoreticalPaginationOverheadBudgetPt: 421.232757,
        equivalentPageProfileCount: 12,
        equivalentHeaderCount: 12,
        equivalentFooterCount: 12,
      },
    })
  }, 60_000)

  it("proves repeating page, header, and footer content is equivalent", () => {
    expect(BUNDLE.staticZoneEquivalence).toMatchObject({
      status: "equivalent-repeating-static-zones",
      canonicalSourceSectionIndex: 0,
      canonicalSourceSectionId: "section-cover",
      canonicalHeaderZoneId: "cover-header-zone",
      canonicalFooterZoneId: "cover-footer-zone",
      pageNumberPolicy: {
        start: 1,
        startOwner: "first-source-section",
        continuation: "continuous-generated-page-number",
      },
    })
    expect(BUNDLE.staticZoneEquivalence.sections).toHaveLength(12)
    expect(new Set(BUNDLE.staticZoneEquivalence.sections.map((item) => item.pageProfileFingerprint))).toEqual(
      new Set([BUNDLE.staticZoneEquivalence.normalizedPageProfileFingerprint]),
    )
    expect(new Set(BUNDLE.staticZoneEquivalence.sections.map((item) => item.headerContentFingerprint))).toEqual(
      new Set([BUNDLE.staticZoneEquivalence.normalizedHeaderContentFingerprint]),
    )
    expect(new Set(BUNDLE.staticZoneEquivalence.sections.map((item) => item.footerContentFingerprint))).toEqual(
      new Set([BUNDLE.staticZoneEquivalence.normalizedFooterContentFingerprint]),
    )
    expect(BUNDLE.staticZoneEquivalence.sections.map((item) => item.pageNumberStart)).toEqual([
      1, null, null, null, null, null, null, null, null, null, null, null,
    ])
  })

  it("finalizes one continuous Core section while retaining all semantic lineage and roots", () => {
    expect(parseVNextDocumentCompositionManifestV1(BUNDLE.coreCompositionManifest)).toEqual({
      status: "ready",
      manifest: BUNDLE.coreCompositionManifest,
      issues: [],
    })
    expect(BUNDLE.coreCompositionManifest.sections).toEqual([expect.objectContaining({
      sectionIndex: 0,
      sectionId: "composition-section-ocr-benchmark-report",
      staticZones: INPUT.verticalCapacity.coreCompositionManifest.sections[0].staticZones,
    })])
    expect(BUNDLE.coreCompositionManifest.bodyItems).toHaveLength(185)
    expect(BUNDLE.coreCompositionManifest.bodyItems.map((item) => item.rootNodeId)).toEqual(
      INPUT.verticalCapacity.coreCompositionManifest.bodyItems.map((item) => item.rootNodeId),
    )
    expect(BUNDLE.coreCompositionManifest.bodyItems.every((item) => (
      item.sectionIndex === 0
      && item.sectionId === "composition-section-ocr-benchmark-report"
      && item.ownerPins.resolvedProjection === BUNDLE.reconciledResolvedProjectionFingerprint
      && item.initialCursor.ownerFingerprint === item.ownerPins.measurement
    ))).toBe(true)
    expect(BUNDLE.semanticSectionBindings.map((item) => ({
      sourceSectionIndex: item.sourceSectionIndex,
      compositionZoneOrder: item.compositionZoneOrder,
      itemCount: item.itemCount,
    }))).toEqual(INPUT.verticalCapacity.sectionCapacities.map((section) => ({
      sourceSectionIndex: section.sectionIndex,
      compositionZoneOrder: section.sectionIndex,
      itemCount: section.bodyItemCount,
    })))
  })

  it("binds every root to the Core demand/window spacing bridge without utility spacer roots", () => {
    expect(BUNDLE.spacingBridgeContract).toEqual({
      source: "vnext-document-composition-spacing-bridge",
      contractVersion: 1,
      pageTopPolicy: "suppress-before-first-fragment",
      demandAdjustment: "subtract-gap-before-family-pagination",
      freshPageRetry: "return-fresh-page-required-then-suppress-gap",
      windowProjection: "first-page-no-paint-offset",
    })
    expect(BUNDLE.semanticSectionStartSpacingRule).toEqual({
      ruleId: "semantic-section-start",
      currentCategory: "section-heading",
      basisStyleKey: "section-heading",
      basisLineHeightPt: 22,
      multiplier: 0.5,
      gapBeforePt: 11,
      provenance: "accepted-r2c-e-line-height-ratio",
    })
    expect(BUNDLE.spacingBridgeBindings).toHaveLength(185)
    expect(BUNDLE.spacingBridgeBindings.reduce((total, item) => total + item.gapBeforePt, 0)).toBe(1019)
    expect(BUNDLE.spacingBridgeBindings[0]).toMatchObject({
      rootNodeId: "cover-title",
      reconciledSpacingRuleId: "zone-start",
      gapBeforePt: 0,
    })
    const semanticStarts = BUNDLE.spacingBridgeBindings.filter((item) => item.reconciledSpacingRuleId === "semantic-section-start")
    expect(semanticStarts).toHaveLength(11)
    expect(semanticStarts.every((item) => (
      item.category === "section-heading"
      && item.sourceSpacingRuleId === "zone-start"
      && item.gapBeforePt === 11
      && item.previousCategory != null
    ))).toBe(true)
    expect(BUNDLE.coreCompositionManifest.bodyItems.some((item) => item.rootNodeType === "spacer")).toBe(false)
  })

  it("retains the historical twelve-page diagnostic superseded by R2C-N", () => {
    expect(BUNDLE.fidelityGate).toEqual({
      status: "pagination-required-twelve-page-capacity-diagnostic",
      targetPageCount: 12,
      previousNaturalSectionCapacityFloorCount: 16,
      previousPreservedSpacingSectionCapacityCount: 18,
      reconciledNaturalGlobalCapacityCount: 11,
      reconciledGrossSpacingCapacityCount: 12,
      grossDemandPt: 8125.047243,
      targetCapacityPt: 8390.28,
      grossCapacityDeltaPt: -265.232757,
      grossOverflowAboveTargetPt: 0,
      grossSlackBelowTargetPt: 265.232757,
      maximumTheoreticalPageTopSuppressionPt: 156,
      maximumTheoreticalPaginationOverheadBudgetPt: 421.232757,
      reason: "gross-capacity-does-not-decide-actual-page-count",
    })
    expect(BUNDLE.rejectedAlternatives.map((item) => item.alternative)).toEqual([
      "retain-twelve-fresh-core-sections",
      "preserve-zero-semantic-section-start-gap",
      "insert-standalone-utility-spacer-roots",
      "remove-report-content-to-hit-page-count",
    ])
    expect(BUNDLE.downstreamBlockers.map((item) => item.code)).toEqual([
      "family-pagination-inputs-not-bound",
      "generated-page-number-not-measured",
      "twelve-page-pagination-sensitive",
      "pagination-not-executed",
    ])
    expect("pages" in BUNDLE).toBe(false)
    expect("pageAssignments" in BUNDLE).toBe(false)
  })

  it("rebuilds deterministically without mutating accepted source evidence", () => {
    const input = clone(INPUT)
    const before = JSON.stringify(input)
    expect(createFlowDocCanonicalReportSectionReconciliationPlanV1(input).planFingerprint).toBe(
      BUNDLE.planFingerprint,
    )
    expect(createFlowDocCanonicalReportSectionReconciliationBundleV1(input)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(before)
  }, 90_000)

  it("fails closed on source, execution, downstream, and reconciliation drift", () => {
    const sourceDrift = clone(INPUT)
    sourceDrift.verticalCapacity.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).documentCompositionTransition = "executed"
    const executionResult = validate(executionDrift)
    expect(executionResult.status).toBe("blocked")
    if (executionResult.status !== "blocked") throw new Error("execution drift must block")
    expect(executionResult.issues.map((item) => item.code)).toContain("execution-boundary")

    const downstreamResult = validate({ ...clone(BUNDLE), pages: [] })
    expect(downstreamResult.status).toBe("blocked")
    if (downstreamResult.status !== "blocked") throw new Error("downstream facts must block")
    expect(downstreamResult.issues.map((item) => item.code)).toContain("downstream-fact")

    const reconciliationDrift = clone(BUNDLE)
    reconciliationDrift.spacingBridgeBindings[10].gapBeforePt = 0
    reconciliationDrift.bundleFingerprint = "0".repeat(64)
    const reconciliationResult = validate(reconciliationDrift)
    expect(reconciliationResult.status).toBe("blocked")
    if (reconciliationResult.status !== "blocked") throw new Error("reconciliation drift must block")
    expect(reconciliationResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))
    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 90_000)

  it("retains QA, package, and phase evidence without claiming pagination", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-section-reconciliation-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_SECTION_RECONCILIATION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-H",
      status: "accepted-reconciliation-strategy-twelve-page-pagination-blocked",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      coreCompositionManifestFingerprint: BUNDLE.coreCompositionManifest.fingerprint,
      summary: BUNDLE.summary,
      fidelityGate: BUNDLE.fidelityGate,
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
      },
      boundary: {
        semanticSectionReconciliation: "projected",
        coreCompositionManifest: "finalized",
        coreSpacingBridge: "contract-bound-not-run",
        pageAssignment: "not-run",
      },
      nextPhase: "PDF-PILOT-08B-R2C-I family pagination input binding and generated footer measurement",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-H reconciliation accepted; twelve-page pagination remains blocked.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-H Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-H Section Reconciliation")
    expect(readme).toContain("PDF canonical report section reconciliation")
    expect(packageReadme).toContain("Section Reconciliation Evidence")
    expect(packageJson.scripts["build:report-section-reconciliation"]).toBe(
      "node scripts/build-canonical-report-section-reconciliation.mjs",
    )
  })
})
