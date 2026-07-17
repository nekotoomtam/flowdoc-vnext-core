import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextAuthoredBoxPlanV1,
  projectVNextAuthoredBoxFragmentsV1,
  type AuthoredNodeV4Target,
} from "../src/index.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const TEMPLATE = readJson<any>("fixtures/pdf-pilot-canonical-report-template-resolution.v1.json")
const HANDOFF = readJson<any>("fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json")
const PAGINATION = readJson<any>("fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json")
const BODY = readJson<any>("fixtures/pdf-pilot-canonical-report-body-display-list.v1.json")
const SUMMARY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)

const CALLOUT_NODE_IDS = [
  "executive-summary-reader-label",
  "executive-summary-critical-values",
  "executive-summary-ocr-speed",
  "executive-summary-native-coverage",
  "executive-summary-native-cost",
  "executive-summary-mapping-limit",
  "decision-view-reader-label",
  "decision-view-ocr-speed",
  "decision-view-native-detail",
  "decision-view-native-cost",
  "decision-view-response-size",
  "decision-view-mapping-gate",
]

function authoredNode(nodeId: string): AuthoredNodeV4Target {
  const matches = TEMPLATE.instanceDocument.document.sections
    .map((section: any) => section.nodes[nodeId])
    .filter(Boolean)
  expect(matches).toHaveLength(1)
  return matches[0] as AuthoredNodeV4Target
}

describe("PDF-PILOT-08B-R2C-S reusable authored box contract", () => {
  it("owns normalized style and content width for every canonical authored box", () => {
    const plans = CALLOUT_NODE_IDS.map((nodeId) => {
      const result = createVNextAuthoredBoxPlanV1({
        ownerNode: authoredNode(nodeId),
        availableWidthPt: 467.95,
      })
      if (result.status !== "ready") throw new Error(JSON.stringify(result.issues))
      return result.plan
    })

    expect(plans).toHaveLength(12)
    expect(new Set(plans.map((plan) => plan.styleFingerprint))).toHaveLength(1)
    plans.forEach((plan) => expect(plan).toMatchObject({
      source: "vnext-authored-box-contract",
      contractVersion: 1,
      hasAuthoredBox: true,
      fillColor: "EAF1FF",
      paddingPt: { top: 7, right: 9, bottom: 7, left: 9 },
      contentInsetPt: { top: 7, right: 9, bottom: 7, left: 9 },
      outerWidthPt: 467.95,
      contentWidthPt: 449.95,
      pageSplitPolicy: "open-continuation-edges",
    }))

    const handoffWidths = HANDOFF.documentRequests
      .filter((request: any) => CALLOUT_NODE_IDS.includes(request.textBlockId))
      .map((request: any) => request.request.availableWidthPt)
    expect(handoffWidths).toEqual(plans.map((plan) => plan.contentWidthPt))
  })

  it("reproduces the exact three canonical fragments from authoritative placements", () => {
    const pages = PAGINATION.corePagePlan.pages
    const projections = BODY.calloutGroups.map((group: any) => {
      const planResult = createVNextAuthoredBoxPlanV1({
        ownerNode: authoredNode(group.labelNodeId),
        availableWidthPt: 467.95,
      })
      if (planResult.status !== "ready") throw new Error(JSON.stringify(planResult.issues))

      const sourcePlacements = pages.flatMap((page: any) => page.placements
        .filter((placement: any) => group.itemIndexes.includes(placement.itemIndex))
        .map((placement: any) => ({ placement, page })))
      const firstItemIndex = group.itemIndexes[0]
      const lastItemIndex = group.itemIndexes[group.itemIndexes.length - 1]
      const result = projectVNextAuthoredBoxFragmentsV1({
        boxId: group.groupId,
        plan: planResult.plan,
        placements: sourcePlacements.map(({ placement, page }: any) => ({
          placementId: placement.fragmentId,
          pageIndex: page.pageIndex,
          pageNumber: page.pageNumber,
          containerBounds: {
            xPt: page.pageGeometry.bodyOriginXPt,
            yPt: page.pageGeometry.bodyOriginYPt,
            widthPt: page.pageGeometry.bodyWidthPt,
            heightPt: page.pageGeometry.bodyHeightPt,
          },
          blockOffsetPt: placement.blockOffsetPt,
          blockExtentPt: placement.blockExtentPt,
          startsBox: placement.itemIndex === firstItemIndex && !placement.continuation.fromPrevious,
          endsBox: placement.itemIndex === lastItemIndex && !placement.continuation.toNext,
        })),
      })
      if (result.status !== "consumable") throw new Error(JSON.stringify(result.issues))

      expect(result.fragments.map((fragment) => ({
        fragmentId: fragment.fragmentId,
        pageIndex: fragment.pageIndex,
        pageNumber: fragment.pageNumber,
        continuesFromPreviousPage: fragment.continuesFromPreviousPage,
        continuesOnNextPage: fragment.continuesOnNextPage,
        bounds: fragment.bounds,
      }))).toEqual(group.fragments.map((fragment: any) => ({
        fragmentId: fragment.fragmentId,
        pageIndex: fragment.pageIndex,
        pageNumber: fragment.pageNumber,
        continuesFromPreviousPage: fragment.continuesFromPreviousPage,
        continuesOnNextPage: fragment.continuesOnNextPage,
        bounds: fragment.bounds,
      })))
      result.fragments.forEach((fragment) => {
        expect(fragment.contentXPt).toBe(81.02)
        expect(fragment.contentWidthPt).toBe(449.95)
        expect(fragment.paintIntents).toEqual([
          expect.objectContaining({ kind: "fill-rect", bounds: fragment.bounds, color: "EAF1FF" }),
        ])
      })
      return result
    })

    expect(projections.map((projection: any) => projection.summary)).toEqual([
      { placementCount: 6, pageCount: 2, fragmentCount: 2, fillIntentCount: 2, borderIntentCount: 0 },
      { placementCount: 6, pageCount: 1, fragmentCount: 1, fillIntentCount: 1, borderIntentCount: 0 },
    ])
    expect(BODY.bundleFingerprint).toBe(
      "96c48b7287fc0c5532059cf8ad4ff135df5f07fb63bfe6bf6054e150775a8b67",
    )
    expect(SUMMARY.artifact).toMatchObject({
      sha256: "c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b",
      byteLength: 1_212_656,
      resourceReuse: { pageCount: 13 },
    })
  })

  it("keeps semantic grouping in the report adapter and generic geometry in Core", () => {
    const contract = readFileSync(resolve(process.cwd(), "src/renderer/authoredBoxContractV1.ts"), "utf8")
    const measurementAdapter = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.ts",
    ), "utf8")
    const bodyAdapter = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/src/canonicalReportBodyDisplayList.ts",
    ), "utf8")
    const index = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8")

    expect(contract).not.toMatch(/callout|reader-label|reader-summary/)
    expect(index).toContain('export * from "./renderer/authoredBoxContractV1.js"')
    expect(measurementAdapter).toContain("createVNextAuthoredBoxPlanV1")
    expect(measurementAdapter).not.toContain("function textBlockContentWidthPt")
    expect(bodyAdapter).toContain("projectVNextAuthoredBoxFragmentsV1")
    expect(bodyAdapter).toContain("function calloutProjection")
    expect(bodyAdapter).not.toContain("function boxPaddingPt")
  })

  it("publishes the reusable boundary and leaves export binding downstream", () => {
    const proof = readFileSync(resolve(process.cwd(), "docs/PDF_REUSABLE_AUTHORED_BOX_CONTRACT.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/README.md",
    ), "utf8")

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-S reusable authored box contract accepted")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-S Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-S Reusable Authored Box Contract")
    expect(readme).toContain("PDF reusable authored box contract")
    expect(packageReadme).toContain("Reusable Authored Box Contract")
    expect(proof).toContain("PDF-PILOT-08B-R2C-T real export handoff")
  })
})
