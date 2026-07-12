import { describe, expect, it } from "vitest"
import {
  createVNextTableArtifactAdapterPlanV1,
  createVNextTableSvgEvidenceV1,
  type VNextTableRendererProjectionResultV1,
} from "../src/index.js"

function projection(): Extract<VNextTableRendererProjectionResultV1, { status: "consumable" }> {
  const base = { pageIndex: 0, sectionId: "main", zoneId: "body", tableId: "table-1" }
  const commands: Extract<VNextTableRendererProjectionResultV1, { status: "consumable" }>["commands"] = [
    {
      ...base, id: "page-0", kind: "page", bounds: { xPt: 10, yPt: 20, widthPt: 200, heightPt: 300 },
      bodyHeightPt: 300, availableHeightPt: 300,
    },
    {
      ...base, id: "segment-0", kind: "table-segment", parentId: "page-0",
      bounds: { xPt: 10, yPt: 20, widthPt: 200, heightPt: 80 },
      styleProfileId: "style-1", continuesFromPreviousPage: false, continuesOnNextPage: true,
    },
    {
      ...base, id: "background-0", kind: "cell-background", parentId: "segment-0",
      rowFragmentId: "row-fragment-0", sourceCellId: "cell-0", color: "F8FAFC",
      bounds: { xPt: 10, yPt: 20, widthPt: 200, heightPt: 80 },
    },
    {
      ...base, id: "text-0", kind: "text-line", parentId: "cell-0",
      rowFragmentId: "row-fragment-0", sourceCellId: "cell-0", candidateId: "line-0",
      nodeId: "text-0", candidateIndex: 0, text: "A < B & C", color: "0F172A",
      bounds: { xPt: 15, yPt: 25, widthPt: 60, heightPt: 12 },
      sourceStart: { textBlockId: "text-0", inlineId: "inline-0", authoredOffset: 0, resolvedOffset: 0, affinity: "forward" },
      sourceEnd: { textBlockId: "text-0", inlineId: "inline-0", authoredOffset: 9, resolvedOffset: 9, affinity: "backward" },
    },
    {
      ...base, id: "image-0", kind: "image", parentId: "cell-0",
      rowFragmentId: "row-fragment-0", sourceCellId: "cell-0", candidateId: "image-0",
      nodeId: "image-0", candidateIndex: 1, assetId: null, assetOwner: "none",
      align: "right", placeholder: true, bounds: { xPt: 160, yPt: 40, widthPt: 40, heightPt: 30 },
    },
    {
      ...base, id: "spacer-0", kind: "spacer", parentId: "cell-0",
      rowFragmentId: "row-fragment-0", sourceCellId: "cell-0", candidateId: "spacer-0",
      nodeId: "spacer-0", candidateIndex: 2, bounds: { xPt: 15, yPt: 70, widthPt: 190, heightPt: 10 },
    },
    {
      ...base, id: "border-0", kind: "border", parentId: "segment-0", ownerKind: "table-segment",
      semanticRole: "continuation", edge: "bottom", bounds: { xPt: 10, yPt: 100, widthPt: 200, heightPt: 0 },
      style: { style: "dashed", widthPt: 1, color: "334155" },
    },
  ]
  return {
    source: "vnext-table-renderer-consumption", contractVersion: 1, status: "consumable",
    tableId: "table-1", sectionId: "main", zoneId: "body", styleProfileId: "style-1",
    paginationFingerprint: "pagination-1", commands, fingerprint: "renderer-1",
    summary: { pageCount: 1, segmentCount: 1, rowFragmentCount: 1, cellFragmentCount: 1, candidateCount: 3, borderCount: 1, commandCount: commands.length },
    work: { pageVisitCount: 1, rowVisitCount: 1, cellVisitCount: 1, candidateVisitCount: 3, borderEmitCount: 1 },
    contracts: { authoredDocumentInput: false, measurementExecution: false, paginationExecution: false, relayout: false },
    issues: [],
  }
}

describe("Table renderer adapters v1", () => {
  it("emits deterministic bounded SVG geometry evidence without fetching media", () => {
    const input = projection()
    const before = JSON.stringify(input)
    const first = createVNextTableSvgEvidenceV1(input)
    const second = createVNextTableSvgEvidenceV1(input)
    expect(first.status).toBe("ready")
    if (first.status !== "ready") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(first.pages).toHaveLength(1)
    expect(first.pages[0]).toMatchObject({ pageIndex: 0, commandCount: 7, widthPt: 200, heightPt: 300 })
    expect(first.pages[0].markup).toContain('viewBox="10 20 200 300"')
    expect(first.pages[0].markup).toContain("A &lt; B &amp; C")
    expect(first.pages[0].markup).toContain('data-asset-id="missing" data-placeholder="true"')
    expect(first.pages[0].markup).toContain('data-no-paint="true"')
    expect(first.pages[0].markup).toContain('stroke-dasharray="4 2"')
    expect(first.contracts).toEqual({ relayout: false, mediaFetch: false, artifactBytes: false })
    expect(JSON.stringify(input)).toBe(before)
  })

  it("maps PDF and DOCX plans with explicit no-paint and fallback capabilities", () => {
    const pdf = createVNextTableArtifactAdapterPlanV1({ projection: projection(), target: "pdf" })
    const docx = createVNextTableArtifactAdapterPlanV1({ projection: projection(), target: "docx" })
    expect(pdf).toMatchObject({
      status: "ready", target: "pdf",
      summary: { operationCount: 7, nativeCount: 5, noPaintCount: 1, fallbackCount: 1 },
      warnings: [expect.objectContaining({ commandId: "image-0" })],
      contracts: { relayout: false, authoredDocumentInput: false, artifactBytes: false },
    })
    expect(docx).toMatchObject({
      status: "ready", target: "docx",
      summary: { operationCount: 7, nativeCount: 4, noPaintCount: 1, fallbackCount: 2 },
      warnings: expect.arrayContaining([
        expect.objectContaining({ commandId: "image-0" }),
        expect.objectContaining({ commandId: "border-0" }),
      ]),
    })
  })

  it("blocks every adapter when renderer projection is not consumable", () => {
    const blocked: VNextTableRendererProjectionResultV1 = {
      source: "vnext-table-renderer-consumption", contractVersion: 1, status: "blocked",
      tableId: "table-1", commands: null,
      issues: [{ code: "missing-image-asset", path: "commands", message: "missing", severity: "error" }],
    }
    expect(createVNextTableSvgEvidenceV1(blocked)).toMatchObject({
      status: "blocked", pages: null,
      issues: [expect.objectContaining({ code: "renderer-projection-not-consumable" })],
    })
    expect(createVNextTableArtifactAdapterPlanV1({ projection: blocked, target: "pdf" })).toMatchObject({
      status: "blocked", operations: null,
    })
  })
})
