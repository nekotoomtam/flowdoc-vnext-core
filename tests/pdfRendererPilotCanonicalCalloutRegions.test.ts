import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const COMPARISON = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-callout-regions.v1.json",
)
const TEMPLATE = readJson<any>("fixtures/pdf-pilot-canonical-report-template-resolution.v1.json")
const HANDOFF = readJson<any>("fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json")
const PROJECTION = readJson<any>("fixtures/pdf-pilot-canonical-report-table-projection.v1.json")
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

describe("PDF-PILOT-08B-R2C-Q measured callouts and region thresholds", () => {
  it("pins R2C-P as the historical baseline and the current rendered artifact", () => {
    expect(COMPARISON).toMatchObject({
      comparisonVersion: 1,
      comparisonId: "pdf-pilot-08b-r2c-q-canonical-full-document-callout-regions-v1",
      phaseId: "PDF-PILOT-08B-R2C-Q",
      status: "accepted-callout-region-thresholds-visual-fidelity-still-rejected",
      baseline: {
        comparisonId:
          "pdf-pilot-08b-r2c-p-canonical-full-document-static-section-calibration-v1",
        phaseId: "PDF-PILOT-08B-R2C-P",
      },
      inputs: {
        reference: { pageCount: 12 },
        candidate: {
          sha256: SUMMARY.artifact.sha256,
          bytes: SUMMARY.artifact.byteLength,
          pageCount: 13,
          sourceBundleFingerprint: BODY.bundleFingerprint,
        },
      },
    })
    expect(JSON.stringify(COMPARISON)).not.toMatch(/[A-Z]:\\Users\\/u)
  })

  it("carries authored box padding through both measurement request boundaries", () => {
    const authoredNodes = TEMPLATE.instanceDocument.document.sections.flatMap(
      (section: any) => CALLOUT_NODE_IDS.map((nodeId) => section.nodes[nodeId]).filter(Boolean),
    )
    expect(authoredNodes).toHaveLength(12)
    authoredNodes.forEach((node: any) => {
      expect(node.props.box).toEqual({
        fill: "EAF1FF",
        padding: {
          top: { value: 7, unit: "pt" },
          right: { value: 9, unit: "pt" },
          bottom: { value: 7, unit: "pt" },
          left: { value: 9, unit: "pt" },
        },
      })
    })

    const handoffWidths = HANDOFF.documentRequests
      .filter((request: any) => CALLOUT_NODE_IDS.includes(request.textBlockId))
      .map((request: any) => request.request.availableWidthPt)
    const projectedWidths = PROJECTION.documentRequests
      .filter((request: any) => CALLOUT_NODE_IDS.includes(request.textBlockId))
      .map((request: any) => request.request.availableWidthPt)
    expect(handoffWidths).toEqual(Array(12).fill(449.95))
    expect(projectedWidths).toEqual(handoffWidths)
  })

  it("projects two semantic groups into three measured page fragments without losing fields", () => {
    expect(BODY.calloutRenderPolicy).toEqual({
      styleSource: "authored-text-block-box",
      groupingSource: "consecutive-label-and-note-semantics",
      geometrySource: "measured-page-placements",
      pageSplitPolicy: "paint-continuation-fragment-per-page",
    })
    expect(BODY.summary).toMatchObject({
      pageCount: 13,
      calloutGroupCount: 2,
      calloutFragmentCount: 3,
      calloutFillRectCount: 3,
      calloutSourceFieldBindingCount: 22,
      missingGlyphCount: 0,
    })
    expect(BODY.calloutGroups.map((group: any) => ({
      labelNodeId: group.labelNodeId,
      fieldCount: group.sourceFieldBindingInlineIds.length,
      pages: group.fragments.map((fragment: any) => fragment.pageNumber),
    }))).toEqual([
      {
        labelNodeId: "executive-summary-reader-label",
        fieldCount: 12,
        pages: [1, 2],
      },
      {
        labelNodeId: "decision-view-reader-label",
        fieldCount: 10,
        pages: [10],
      },
    ])

    const commands = BODY.rendererHandoff.measuredDrawContract.pages.flatMap(
      (page: any) => page.commands,
    ).filter((command: any) => command.sourceCommandId.includes("canonical-body"))
    expect(Math.min(...commands.map((command: any) => command.bounds.xPt))).toBe(72.02)
    expect(Math.max(...commands.map(
      (command: any) => command.bounds.xPt + command.bounds.widthPt,
    ))).toBe(539.97)
  })

  it("accepts every regional threshold while retaining the non-parity decision", () => {
    expect(COMPARISON.calibration.calloutTreatment).toMatchObject({
      referenceSemanticGroupProxyCount: 2,
      candidateSemanticGroupCount: 2,
      candidateRenderedFragmentCount: 3,
      candidateSourceFieldBindingCount: 22,
      outerWidthGapPt: 0.12,
      leftEdgeGapPt: 2.996,
      rightEdgeGapPt: 2.876,
      maximumTextInsetGapPt: 0,
      renderedGeometryMatchesMeasuredContract: true,
    })
    expect(COMPARISON.calibration.regionThresholdContract).toMatchObject({
      contractId: "pdf-pilot-08b-r2c-q-region-aware-visual-thresholds-v1",
      comparisonModel: "region-aware-non-pixel-parity",
      allRegionThresholdsAccepted: true,
    })
    expect(COMPARISON.calibration.regionThresholdContract.regions.map((region: any) => (
      [region.region, region.accepted]
    ))).toEqual([
      ["page-box", true],
      ["static-zones", true],
      ["body-frame", true],
      ["typography", true],
      ["callout-treatment", true],
      ["source-density", true],
    ])
    expect(COMPARISON.decision).toMatchObject({
      measuredCalloutTreatmentAccepted: true,
      regionAwareVisualThresholdsAccepted: true,
      sourceFieldLineagePreserved: true,
      visualFidelityAccepted: false,
      pixelParityApplicable: false,
      authoritativeCandidatePageCount: 13,
      pageCountPolicy: "content-driven-not-reference-fixed",
      productionBinding: false,
    })
  })

  it("publishes the Q proof and keeps generic box compatibility downstream", () => {
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_CALLOUT_REGION_THRESHOLDS_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(
      resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"),
      "utf8",
    )

    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-Q measured callout treatment accepted")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-Q Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-Q Callout and Region Thresholds")
    expect(readme).toContain("PDF canonical callout and region thresholds")
    expect(packageReadme).toContain("Callout and Region Threshold Evidence")
    expect(COMPARISON.nextPhase).toBe(
      "PDF-PILOT-08B-R2C-R generic box-boundary and cross-reader compatibility audit",
    )
  })
})
