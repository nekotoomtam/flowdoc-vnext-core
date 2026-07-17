import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parseVNextDocumentCompositionPagePlanV1 } from "../src/index.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import {
  createFlowDocCanonicalReportPaginationExecutionBundleV1,
  executeFlowDocCanonicalReportPaginationV1,
  initializeFlowDocCanonicalReportPaginationExecutionV1,
  executeFlowDocCanonicalReportPaginationExecutionSliceV1,
  validateFlowDocCanonicalReportPaginationExecutionBundleV1,
  type FlowDocCanonicalReportPaginationExecutionBundleV1,
  type FlowDocCanonicalReportPaginationExecutionLimitsV1,
  type FlowDocCanonicalReportPaginationExecutionSourceV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportSectionReconciliation.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const SOURCE: FlowDocCanonicalReportPaginationExecutionSourceV1 = {
  paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(
    "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json",
  ),
  measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json",
  ),
  sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(
    "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json",
  ),
}
const BUNDLE = readJson<FlowDocCanonicalReportPaginationExecutionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json",
)
const ONE_TRANSITION_SLICE_LIMITS: FlowDocCanonicalReportPaginationExecutionLimitsV1 = {
  maximumTransitionCount: 10_000,
  maximumTransitionsPerSlice: 1,
  coreTransition: {
    maximumClosedPageCount: 1,
    maximumPlacementCount: 1,
    maximumFamilyPageCount: 1,
    maximumFamilyFragmentCount: 1,
  },
}

function validate(
  value: unknown,
  source: FlowDocCanonicalReportPaginationExecutionSourceV1 = SOURCE,
) {
  return validateFlowDocCanonicalReportPaginationExecutionBundleV1(value, source)
}

describe("PDF-PILOT-08B-R2C-J canonical report pagination execution", () => {
  it("accepts the bounded execution bundle and the evidence-backed thirteen-page result", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-J",
      sourcePaginationInputsFingerprint: "1980d9fd60f684e49213348120c625b889bcad03c1dbab03e4860d347349f0f4",
      sourceMeasuredCompositionFingerprint: "984e95643d5db71ef32d9fc236c4d466b61d33b9d90bcdac2a217dcc71598028",
      sourceSectionReconciliationFingerprint: "b3b22197f8f5668cc5c2a9928f610d7f24e77a321bc899bcefdeff259d7e3ab2",
      sourceCoreCompositionManifestFingerprint: "sha256:ebab78bd6715028948c673c0b24fc682906bebef606bfbfc373b723fff363413",
      bundleFingerprint: "bf6024cef64a0f7a25c6b8acdf442f552642cde3396905efcddcd3d5f5f003c5",
      terminalCheckpoint: {
        complete: true,
        transitionCount: 197,
        fingerprint: "sha256:170b902ccaabbeb14795544381c2a639897ef427c0e4372e05e456abefa0a609",
      },
      corePagePlan: {
        fingerprint: "sha256:90b2678a79b67ad8a7142a94a975ffda538a07c50aa24e4c0179dcd0bf81ddd2",
        compositionFingerprint: "sha256:833d911e462d959ec6d141f1eb15b1989e17c928a2fd6f2a8042a73b416c4a26",
      },
      headingPageMap: {
        fingerprint: "sha256:0d9cea4a4ccb48da66f19dc3b70f8880b181782bc2ec1af293eb24965a0747e2",
      },
      summary: {
        targetPageCount: 12,
        actualPageCount: 13,
        targetComparison: "over-target",
        bodyItemCount: 185,
        placedRootCount: 185,
        placementCount: 187,
        headingCount: 12,
        transitionCount: 197,
        familyWindowTransitionCount: 197,
        structureResumeTransitionCount: 0,
        textFlowTransitionCount: 171,
        tableFlowTransitionCount: 20,
        mediaFlowTransitionCount: 6,
        freshPageRequiredTransitionCount: 10,
        appliedSpacingCount: 174,
        appliedSpacingPt: 917,
        suppressedPageTopSpacingCount: 12,
        suppressedPageTopSpacingPt: 60,
        repeatedHeaderFragmentCount: 2,
        sliceCount: 13,
        paginationExecuted: true,
        pageAssignmentExecuted: true,
        actualPageNumberExpansionExecuted: false,
        pdfRendered: false,
      },
    })
  }, 120_000)

  it("finalizes a consecutive Core page chain that places every canonical root", () => {
    expect(parseVNextDocumentCompositionPagePlanV1(BUNDLE.corePagePlan)).toEqual({
      status: "ready",
      plan: BUNDLE.corePagePlan,
      issues: [],
    })
    expect(BUNDLE.corePagePlan.pages.map((page) => page.pageIndex)).toEqual(
      Array.from({ length: 13 }, (_, index) => index),
    )
    expect(BUNDLE.corePagePlan.pages.map((page) => page.pageNumber)).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 1),
    )
    expect(BUNDLE.corePagePlan.pages.every((page) => (
      page.usedHeightPt <= page.pageGeometry.bodyHeightPt
      && page.remainingHeightPt >= 0
      && page.staticZones.length === 2
    ))).toBe(true)
    const placedItems = new Set(BUNDLE.corePagePlan.pages.flatMap((page) => (
      page.placements.map((placement) => placement.itemIndex)
    )))
    expect([...placedItems].sort((left, right) => left - right)).toEqual(
      Array.from({ length: 185 }, (_, index) => index),
    )
    expect(BUNDLE.corePagePlan.pages.at(-1)).toMatchObject({
      pageIndex: 12,
      pageNumber: 13,
      usedHeightPt: 630,
      remainingHeightPt: 11.952756,
      closeReason: "document-complete",
      placements: [{
        itemIndex: 184,
        rootNodeId: "table-gdim-expected-fields-gdim-expected-fields",
        family: "table-flow",
        fragmentIndex: 1,
        blockOffsetPt: 0,
        blockExtentPt: 630,
        continuation: { fromPrevious: true, toNext: false },
      }],
    })
  })

  it("retains one-page family windows, one-placement transition bounds, and chained slice receipts", () => {
    expect(BUNDLE.transitionTraces).toHaveLength(197)
    BUNDLE.transitionTraces.forEach((trace, index) => {
      expect(trace.transitionIndex).toBe(index + 1)
      expect(trace.traceFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
      expect(trace.transitionWork.closedPageCount).toBeLessThanOrEqual(1)
      expect(trace.transitionWork.placementCount).toBeLessThanOrEqual(1)
      expect(trace.familyExecution).not.toBeNull()
      expect(trace.familyExecution?.paginationPageCount).toBeLessThanOrEqual(1)
      expect(trace.familyExecution?.paginationFragmentCount).toBeLessThanOrEqual(1)
    })
    expect(BUNDLE.sliceReceipts).toHaveLength(13)
    BUNDLE.sliceReceipts.forEach((receipt, index) => {
      expect(receipt.sliceIndex).toBe(index)
      expect(receipt.transitionEndIndex - receipt.transitionStartIndex + 1).toBeLessThanOrEqual(16)
      if (index > 0) {
        expect(receipt.checkpointBeforeFingerprint).toBe(
          BUNDLE.sliceReceipts[index - 1].checkpointAfterFingerprint,
        )
        expect(receipt.transitionStartIndex).toBe(BUNDLE.sliceReceipts[index - 1].transitionEndIndex + 1)
      }
    })
    expect(BUNDLE.sliceReceipts.at(-1)).toMatchObject({
      transitionEndIndex: 197,
      checkpointAfterFingerprint: BUNDLE.terminalCheckpoint.fingerprint,
      status: "complete",
      reason: "document-complete",
    })
  })

  it("records committed spacing, page-top suppression, fresh retries, and repeated headers", () => {
    const family = BUNDLE.transitionTraces.map((trace) => trace.familyExecution!)
    const committedSpacing = family.filter((trace) => (
      trace.paginationStatus !== "fresh-page-required" && trace.appliedGapBeforePt > 0
    ))
    const suppressed = family.filter((trace) => trace.suppressedGapBeforePt > 0)
    const fresh = family.filter((trace) => trace.paginationStatus === "fresh-page-required")
    expect(committedSpacing).toHaveLength(174)
    expect(committedSpacing.reduce((total, trace) => total + trace.appliedGapBeforePt, 0)).toBe(917)
    expect(suppressed).toHaveLength(12)
    expect(suppressed.reduce((total, trace) => total + trace.suppressedGapBeforePt, 0)).toBe(60)
    expect(fresh).toHaveLength(10)
    expect(fresh.every((trace) => trace.paginationPageCount === 0 && trace.paginationFragmentCount === 0)).toBe(true)
    expect(family.reduce((total, trace) => total + trace.repeatedHeaderFragmentCount, 0)).toBe(2)
  })

  it("resumes one transition per slice to the byte-identical page plan and terminal cursor", () => {
    const oneTransition = executeFlowDocCanonicalReportPaginationV1({
      source: SOURCE,
      limits: ONE_TRANSITION_SLICE_LIMITS,
    })
    expect(oneTransition.sliceReceipts).toHaveLength(197)
    expect(oneTransition.traces).toEqual(BUNDLE.transitionTraces)
    expect(oneTransition.pagePlan).toEqual(BUNDLE.corePagePlan)
    expect(oneTransition.headingPageMap).toEqual(BUNDLE.headingPageMap)
    expect(oneTransition.terminalCheckpoint).toEqual(BUNDLE.terminalCheckpoint)

    let checkpoint = initializeFlowDocCanonicalReportPaginationExecutionV1(
      SOURCE,
      ONE_TRANSITION_SLICE_LIMITS,
    )
    const emittedPageIndexes: number[] = []
    while (!checkpoint.complete) {
      const slice = executeFlowDocCanonicalReportPaginationExecutionSliceV1({
        source: SOURCE,
        checkpoint,
        limits: ONE_TRANSITION_SLICE_LIMITS,
        maximumTransitionCount: 1,
      })
      expect(slice.traces).toHaveLength(1)
      emittedPageIndexes.push(...slice.closedPages.map((page) => page.pageIndex))
      checkpoint = slice.checkpointAfter
    }
    expect(emittedPageIndexes).toEqual(Array.from({ length: 13 }, (_, index) => index))
    expect(checkpoint).toEqual(BUNDLE.terminalCheckpoint)
  }, 120_000)

  it("rebuilds deterministically without mutating accepted source evidence", () => {
    const source = clone(SOURCE)
    const before = JSON.stringify(source)
    expect(createFlowDocCanonicalReportPaginationExecutionBundleV1(source)).toEqual(BUNDLE)
    expect(JSON.stringify(source)).toBe(before)
  }, 120_000)

  it("fails closed on source, limits, page-plan, execution, and downstream drift", () => {
    const sourceDrift = clone(SOURCE)
    sourceDrift.paginationInputs.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const limitDrift = clone(BUNDLE)
    limitDrift.limits.coreTransition.maximumFamilyPageCount = 2
    expect(validate(limitDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-limits" })],
    })
    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).pdfRendering = "executed"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })
    const pagePlanDrift = clone(BUNDLE)
    pagePlanDrift.corePagePlan.pages[0].usedHeightPt = 0
    expect(validate(pagePlanDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "core-page-plan" })],
    })
    expect(validate({ ...clone(BUNDLE), pdfBytes: "forbidden" })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })
    expect(validate(null)).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-bundle-shape" }],
    })
  })

  it("publishes QA and phase evidence without claiming footer expansion or PDF rendering", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-execution-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_PAGINATION_EXECUTION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-J",
      status: "accepted-bounded-pagination-and-authoritative-page-plan-rendering-not-run",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      pagePlanFingerprint: BUNDLE.corePagePlan.fingerprint,
      summary: BUNDLE.summary,
      executionGate: {
        status: "authoritative-page-plan-ready-renderer-handoff-blocked",
        everyBodyRootPlaced: true,
        boundedOnePageFamilyWindows: true,
        boundedOnePlacementTransitions: true,
        resumableSlicesRetained: true,
        familyPaginationExecuted: true,
        spacingBridgeExecuted: true,
        pageAssignmentFinalized: true,
        actualPageNumbersExpanded: false,
        staticZonePaintPlanned: false,
        pdfRendered: false,
      },
      nextPhase: "PDF-PILOT-08B-R2C-K generated static-zone instances and renderer handoff",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-J bounded pagination and authoritative thirteen-page plan accepted; rendering remains blocked.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-J Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-J Pagination Execution")
    expect(readme).toContain("PDF canonical report bounded pagination execution")
    expect(packageReadme).toContain("Pagination Execution Evidence")
    expect(packageJson.scripts["build:report-pagination-execution"]).toBe(
      "node scripts/build-canonical-report-pagination-execution.mjs",
    )
  })
})
