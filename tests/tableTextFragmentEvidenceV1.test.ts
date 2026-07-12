import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextTableTextFragmentEvidenceV1,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  type VNextTableTextMeasurementPreparationResultV1,
} from "../src/index.js"

function preparation(): Extract<VNextTableTextMeasurementPreparationResultV1, { status: "ready" }> {
  const request = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
    documentId: "instance-1",
    instanceRevision: 7,
    sectionId: "main",
    textBlock: {
      id: "nodei_000000000001",
      type: "text-block",
      role: { role: "paragraph" },
      props: {},
      children: [{ id: "inli_000000000001", type: "text", text: "Keyboard" }],
    },
    availableWidthPt: 184,
    measurementProfileId: "thai-primary-v1",
    styleKey: "default",
    resolvedTextByInlineId: {},
    resolvedImageByPlacementId: {},
  })
  if (request.status !== "ready") throw new Error("fixture request blocked")
  return {
    source: "vnext-table-text-measurement-preparation",
    contractVersion: 1,
    status: "ready",
    documentId: "instance-1",
    instanceRevision: 7,
    tableId: "orders-table",
    tableDefinitionId: "orders-definition",
    geometryFingerprint: "geometry-1",
    measurementProfileId: "thai-primary-v1",
    requestsByTextBlockId: {
      "nodei_000000000001": {
        rowIndex: 0,
        rowIdentity: { kind: "resolved-row", rowInstanceId: "rowi_000000000001" },
        rowTemplateId: "item-template",
        sourceCellId: "item-cell",
        cellIdentity: { kind: "resolved-cell", cellInstanceId: "celli_000000000001" },
        textBlockId: "nodei_000000000001",
        request: request.request,
      },
    },
    work: {
      rowCount: 1, materializedRowCount: 1, authoredReferenceRowCount: 0,
      cellCount: 1, visitedNodeCount: 1, textMeasurementRequestCount: 1,
    },
    execution: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

function evidence(plan = preparation()) {
  const request = plan.requestsByTextBlockId["nodei_000000000001"].request
  const measured = acceptVNextTextBlockV4MeasuredLines(request, [
    { index: 0, startOffset: 0, endOffset: 4, text: "Keyb", widthPt: 32, heightPt: 12 },
    { index: 1, startOffset: 4, endOffset: 8, text: "oard", widthPt: 34, heightPt: 14 },
  ])
  if (measured.status !== "accepted") throw new Error("fixture measurement blocked")
  return { request: { ...request }, measured }
}

describe("table text fragment evidence v1", () => {
  it("re-accepts paired evidence and creates deterministic line candidates", () => {
    const plan = preparation()
    const measured = evidence(plan)
    const before = JSON.stringify(measured)
    const result = createVNextTableTextFragmentEvidenceV1({
      preparation: plan,
      evidenceByTextBlockId: { "nodei_000000000001": measured },
    })

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.fragmentSourcesByTextBlockId["nodei_000000000001"]).toMatchObject({
      availableWidthPt: 184,
      measurementProfileId: "thai-primary-v1",
      prefixHeightsPt: [0, 12, 26],
      totalHeightPt: 26,
      candidates: [
        { candidateId: "nodei_000000000001:table-line-0", candidateIndex: 0, heightPt: 12 },
        { candidateId: "nodei_000000000001:table-line-1", candidateIndex: 1, heightPt: 14 },
      ],
    })
    expect(result.work).toEqual({ requestCount: 1, measuredLineCount: 2, candidateCount: 2 })
    expect(result.execution.pagination).toBe("not-run")
    expect(JSON.stringify(measured)).toBe(before)
  })

  it("blocks missing, extra, and width-drifted evidence", () => {
    const plan = preparation()
    const valid = evidence(plan)
    const drifted = evidence(plan)
    drifted.request.availableWidthPt = 200

    expect(createVNextTableTextFragmentEvidenceV1({
      preparation: plan, evidenceByTextBlockId: {},
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "missing-text-measurement-evidence" })] })
    expect(createVNextTableTextFragmentEvidenceV1({
      preparation: plan,
      evidenceByTextBlockId: { "nodei_000000000001": valid, extra: valid },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "unexpected-text-measurement-evidence" })] })
    expect(createVNextTableTextFragmentEvidenceV1({
      preparation: plan,
      evidenceByTextBlockId: { "nodei_000000000001": drifted },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "measurement-request-drift" })] })
  })

  it("blocks measured source-range or summary drift after re-acceptance", () => {
    const plan = preparation()
    const drifted = evidence(plan)
    drifted.measured.summary.totalHeightPt = 999

    expect(createVNextTableTextFragmentEvidenceV1({
      preparation: plan,
      evidenceByTextBlockId: { "nodei_000000000001": drifted },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "measurement-result-drift" })] })
  })
})
