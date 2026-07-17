import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parseVNextDocumentCompositionManifestV1 } from "../src/index.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"
import {
  createFlowDocCanonicalReportVerticalCapacityBundleV1,
  createFlowDocCanonicalReportVerticalCapacityPlanV1,
  validateFlowDocCanonicalReportVerticalCapacityBundleV1,
  type FlowDocCanonicalReportVerticalCapacityBundleV1,
  type FlowDocCanonicalReportVerticalCapacitySourceInputV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportVerticalCapacity.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT: FlowDocCanonicalReportVerticalCapacitySourceInputV1 = {
  projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
  ),
  measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json",
  ),
}
const BUNDLE = readJson<FlowDocCanonicalReportVerticalCapacityBundleV1>(
  "fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json",
)

function validate(
  value: unknown,
  input: FlowDocCanonicalReportVerticalCapacitySourceInputV1 = INPUT,
) {
  return validateFlowDocCanonicalReportVerticalCapacityBundleV1(value, input)
}

describe("PDF-PILOT-08B-R2C-G canonical report vertical capacity", () => {
  it("pins complete spacing, page-capacity, and Core manifest evidence", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-G",
      sourceProjectionFingerprint: "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850",
      sourceMeasuredCompositionFingerprint: "1c988eca85984869c8be8b1f5af9a763cc72fa01b66f1da7cb1c046cfb7ad854",
      planFingerprint: "a1a3c07ae9dbb71e904e5d57bb013e7e6ea9d8c0852146e90f81a9bdefa3f9d7",
      bundleFingerprint: "4d89a4f8bf9b99fbaf7d75825319153021b915cf24cd5f4b15ff467af1a0e2fb",
      coreCompositionManifest: {
        fingerprint: "sha256:5e05d9fbcbeaf3c8babde954c2a0382a0834cd9d7b31b2cc28311bea533f015e",
      },
      summary: {
        sectionCount: 12,
        bodyItemCount: 185,
        textFlowItemCount: 165,
        tableFlowItemCount: 15,
        mediaFlowItemCount: 5,
        spacingRuleCount: 12,
        appliedSpacingCount: 173,
        totalPreservedSpacingPt: 898,
        naturalBodyHeightPt: 7106.047243,
        preservedSpacingBodyDemandPt: 8004.047243,
        pageBodyHeightPt: 699.19,
        measuredHeaderFitCount: 12,
        generatedFooterReservationCount: 12,
        progressCapacityFitCount: 185,
        wholeTableRootOverflowCount: 1,
        naturalGlobalCapacityFloorCount: 11,
        preservedSpacingGlobalCapacityCount: 12,
        naturalSectionCapacityFloorCount: 16,
        preservedSpacingSectionCapacityCount: 18,
        naturalSinglePageSectionCount: 8,
        preservedSpacingSinglePageSectionCount: 7,
        targetPageCount: 12,
        minimumTargetPageDelta: 4,
      },
    })
  }, 60_000)

  it("derives all twelve adjacency gaps from accepted line heights", () => {
    expect(BUNDLE.spacingProfile).toMatchObject({
      profileId: "ocr-benchmark-report-flow-spacing-v2",
      collapsePolicy: "exact-adjacency-rule-no-margin-collapse",
      pageTopPolicy: "suppress-before-first-fragment",
      lineHeightBindings: [
        { styleKey: "report-title", lineHeightPt: 31, acceptedBlockCount: 1 },
        { styleKey: "section-heading", lineHeightPt: 22, acceptedBlockCount: 11 },
        { styleKey: "report-body", lineHeightPt: 15, acceptedBlockCount: 138 },
        { styleKey: "report-caption", lineHeightPt: 12, acceptedBlockCount: 12 },
        { styleKey: "table-header", lineHeightPt: 12, acceptedBlockCount: 15 },
      ],
    })
    expect(BUNDLE.spacingProfile.rules.map((rule) => ({
      ruleId: rule.ruleId,
      pair: `${rule.previousCategory}->${rule.currentCategory}`,
      gap: rule.gapBeforePt,
      applied: BUNDLE.spacedBodyItems.filter((item) => item.spacingRuleId === rule.ruleId).length,
    }))).toEqual([
      { ruleId: "report-title-to-body", pair: "report-title->report-body", gap: 15, applied: 1 },
      { ruleId: "section-heading-to-body", pair: "section-heading->report-body", gap: 11, applied: 11 },
      { ruleId: "body-stack", pair: "report-body->report-body", gap: 3, applied: 113 },
      { ruleId: "body-to-reader-label", pair: "report-body->reader-label", gap: 19, applied: 2 },
      { ruleId: "reader-label-to-summary", pair: "reader-label->reader-summary", gap: 6, applied: 2 },
      { ruleId: "reader-summary-stack", pair: "reader-summary->reader-summary", gap: 3, applied: 8 },
      { ruleId: "reader-summary-to-body", pair: "reader-summary->report-body", gap: 19, applied: 1 },
      { ruleId: "body-to-image", pair: "report-body->fixed-image", gap: 12, applied: 5 },
      { ruleId: "image-to-table-label", pair: "fixed-image->table-label", gap: 12, applied: 3 },
      { ruleId: "body-to-table-label", pair: "report-body->table-label", gap: 12, applied: 3 },
      { ruleId: "table-label-to-table", pair: "table-label->prepared-table", gap: 6, applied: 15 },
      { ruleId: "table-to-table-label", pair: "prepared-table->table-label", gap: 12, applied: 9 },
    ])
    expect(BUNDLE.spacedBodyItems.filter((item) => item.spacingRuleId === "zone-start")).toHaveLength(12)
    expect(BUNDLE.spacedBodyItems.reduce((total, item) => total + item.spacingBeforePt, 0)).toBe(898)
  })

  it("binds exact Letter body geometry and reserves static zones without guessing footer text", () => {
    for (const section of BUNDLE.sectionCapacities) {
      expect(section).toMatchObject({
        pageGeometry: {
          pageWidthPt: 612,
          pageHeightPt: 792,
          bodyOriginXPt: 72.02,
          bodyOriginYPt: 52.87,
          bodyWidthPt: 467.95,
          bodyHeightPt: 699.19,
        },
        marginPt: { top: 20.65, right: 72.03, bottom: 15.94, left: 72.02 },
        headerReservedPt: 32.22,
        footerReservedPt: 24,
        sectionBoundaryPolicy: "fresh-page",
        staticZones: {
          header: {
            measuredHeightPt: 12,
            reservedHeightPt: 32.22,
            reservedSlackPt: 20.22,
            status: "measured-fits-reservation",
          },
          footer: {
            expectedSingleLineHeightPt: 12,
            reservedHeightPt: 24,
            reservedSlackPt: 12,
            status: "generated-inline-reserved-unmeasured",
          },
        },
      })
    }
  })

  it("finalizes a Core composition manifest for all 185 authored body roots", () => {
    expect(parseVNextDocumentCompositionManifestV1(BUNDLE.coreCompositionManifest)).toEqual({
      status: "ready",
      manifest: BUNDLE.coreCompositionManifest,
      issues: [],
    })
    expect(BUNDLE.coreCompositionManifest.sections).toHaveLength(12)
    expect(BUNDLE.coreCompositionManifest.bodyItems).toHaveLength(185)
    expect(BUNDLE.coreCompositionManifest.bodyItems.map((item) => item.rootNodeId)).toEqual(
      BUNDLE.spacedBodyItems.map((item) => item.rootNodeId),
    )
    expect(BUNDLE.coreCompositionManifest.bodyItems.every((item) => (
      /^sha256:[a-f0-9]{64}$/u.test(item.ownerPins.documentStructure)
      && /^sha256:[a-f0-9]{64}$/u.test(item.ownerPins.resolvedProjection)
      && /^sha256:[a-f0-9]{64}$/u.test(item.ownerPins.familySource)
      && /^sha256:[a-f0-9]{64}$/u.test(item.ownerPins.measurement)
      && item.initialCursor.ownerFingerprint === item.ownerPins.measurement
      && !item.initialCursor.complete
    ))).toBe(true)
  })

  it("proves every family can progress while retaining the one whole-table overflow", () => {
    expect(BUNDLE.spacedBodyItems.every((item) => (
      item.progressFitsFreshBody
      && item.samePageMinimumProgressHeightPt <= BUNDLE.summary.pageBodyHeightPt
      && item.freshPageMinimumProgressHeightPt <= BUNDLE.summary.pageBodyHeightPt
    ))).toBe(true)
    const overflow = BUNDLE.spacedBodyItems.filter((item) => !item.wholeRootFitsFreshBody)
    expect(overflow).toEqual([expect.objectContaining({
      sectionId: "section-appendix-evidence",
      rootNodeId: "table-gdim-expected-fields-gdim-expected-fields",
      family: "table-flow",
      capacityMode: "splittable-table-row-stream",
      naturalHeightPt: 837,
      samePageMinimumProgressHeightPt: 56,
      freshPageMinimumProgressHeightPt: 50,
    })])
  })

  it("blocks the twelve-page target on natural section capacity before pagination", () => {
    expect(BUNDLE.sectionCapacities.map((section) => ({
      sectionId: section.sectionId,
      natural: section.naturalCapacityFloorCount,
      preservedSpacing: section.preservedSpacingCapacityCount,
    }))).toEqual([
      { sectionId: "section-cover", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-executive-summary", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-method", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-ocr-accuracy", natural: 2, preservedSpacing: 2 },
      { sectionId: "section-source-evidence", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-native-extraction", natural: 2, preservedSpacing: 3 },
      { sectionId: "section-latency-cost-size", natural: 1, preservedSpacing: 2 },
      { sectionId: "section-mapping", natural: 2, preservedSpacing: 2 },
      { sectionId: "section-decision-view", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-limitations", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-appendix-runs", natural: 1, preservedSpacing: 1 },
      { sectionId: "section-appendix-evidence", natural: 2, preservedSpacing: 2 },
    ])
    expect(BUNDLE.fidelityGate).toEqual({
      status: "blocked-target-page-count-capacity-floor",
      targetPageCount: 12,
      naturalSectionCapacityFloorCount: 16,
      minimumPageCountDelta: 4,
      reason: "section-boundary-natural-height-floor-exceeds-target",
    })
    expect(BUNDLE.downstreamBlockers.map((item) => item.code)).toEqual([
      "core-spacing-bridge-not-executed",
      "target-page-count-capacity-floor-exceeded",
      "generated-page-number-not-measured",
      "pagination-not-executed",
    ])
    expect("pages" in BUNDLE).toBe(false)
    expect("pageAssignments" in BUNDLE).toBe(false)
  })

  it("rebuilds deterministically without mutating projection or measured evidence", () => {
    const input = clone(INPUT)
    const before = JSON.stringify(input)
    expect(createFlowDocCanonicalReportVerticalCapacityPlanV1(input).planFingerprint).toBe(
      BUNDLE.planFingerprint,
    )
    expect(createFlowDocCanonicalReportVerticalCapacityBundleV1(input)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(before)
  }, 90_000)

  it("fails closed on source, execution, downstream, and capacity drift", () => {
    const sourceDrift = clone(INPUT)
    sourceDrift.measuredComposition.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).pageAssignment = "executed"
    const executionResult = validate(executionDrift)
    expect(executionResult.status).toBe("blocked")
    if (executionResult.status !== "blocked") throw new Error("execution drift must block")
    expect(executionResult.issues.map((item) => item.code)).toContain("execution-boundary")

    const downstreamResult = validate({ ...clone(BUNDLE), pages: [] })
    expect(downstreamResult.status).toBe("blocked")
    if (downstreamResult.status !== "blocked") throw new Error("downstream facts must block")
    expect(downstreamResult.issues.map((item) => item.code)).toContain("downstream-fact")

    const capacityDrift = clone(BUNDLE)
    capacityDrift.sectionCapacities[0].pageGeometry.bodyHeightPt += 1
    capacityDrift.bundleFingerprint = "0".repeat(64)
    const capacityResult = validate(capacityDrift)
    expect(capacityResult.status).toBe("blocked")
    if (capacityResult.status !== "blocked") throw new Error("capacity drift must block")
    expect(capacityResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))
    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 90_000)

  it("retains QA, package, and phase evidence while blocking composition claims", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-vertical-capacity-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_VERTICAL_CAPACITY_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-G",
      status: "accepted-capacity-evidence-target-page-count-blocked",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      coreCompositionManifestFingerprint: BUNDLE.coreCompositionManifest.fingerprint,
      summary: BUNDLE.summary,
      fidelityGate: BUNDLE.fidelityGate,
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
      },
      boundary: {
        spacingProfile: "bound-evidence-only",
        coreCompositionManifest: "finalized",
        coreSpacingBridge: "not-run",
        pageAssignment: "not-run",
      },
      nextPhase: "PDF-PILOT-08B-R2C-H section-capacity reconciliation and Core spacing transition bridge",
    })
    expect(qa.appliedByRule).toHaveLength(12)
    expect(qa.bySection).toHaveLength(12)
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-G capacity evidence accepted; twelve-page fidelity blocked.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-G Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-G Vertical Capacity")
    expect(readme).toContain("PDF canonical report vertical capacity")
    expect(packageReadme).toContain("Vertical Capacity Evidence")
    expect(packageJson.scripts["build:report-vertical-capacity"]).toBe(
      "node scripts/build-canonical-report-vertical-capacity.mjs",
    )
  })
})
