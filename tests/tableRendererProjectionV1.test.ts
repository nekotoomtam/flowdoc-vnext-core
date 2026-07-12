import { describe, expect, it } from "vitest"
import {
  paginateVNextTableRowsV1,
  projectVNextTableRendererCommandsV1,
  type VNextTablePreparedCellCandidateV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
  type VNextTableRendererStyleProfileV1,
} from "../src/index.js"

function sourcePoint(nodeId: string, offset: number, affinity: "forward" | "backward") {
  return {
    textBlockId: nodeId, inlineId: `${nodeId}-inline`, authoredOffset: offset,
    resolvedOffset: offset, affinity,
  }
}

function textCandidate(nodeId: string, index: number, heightPt: number): VNextTablePreparedCellCandidateV1 {
  return {
    candidateId: `${nodeId}:line-${index}`, nodeId, candidateIndex: index,
    kind: "text-line", atomic: false, text: `${nodeId}-${index}`, widthPt: 50,
    heightPt, breakAfter: true,
    sourceStart: sourcePoint(nodeId, index, "forward"),
    sourceEnd: sourcePoint(nodeId, index + 1, "backward"),
  }
}

function cell(input: {
  id: string
  columnStart: number
  authored: boolean
  verticalAlign?: "top" | "middle" | "bottom"
  candidates: VNextTablePreparedCellCandidateV1[]
}): VNextTablePreparedCellV1 {
  let contentHeightPt = 0
  const prefixHeightsPt = [0]
  input.candidates.forEach((candidate) => {
    contentHeightPt += candidate.heightPt
    prefixHeightsPt.push(contentHeightPt)
  })
  return {
    sourceCellId: input.id,
    cellIdentity: input.authored
      ? { kind: "authored-cell", sourceCellId: input.id }
      : { kind: "resolved-cell", cellInstanceId: `celli_${input.id}` },
    columnStart: input.columnStart, colSpan: 1, xOffsetPt: input.columnStart * 100,
    outerWidthPt: 100, contentWidthPt: 90,
    insetsPt: { top: 5, right: 5, bottom: 5, left: 5 },
    verticalAlign: input.verticalAlign ?? "top",
    children: [], candidates: input.candidates, prefixHeightsPt,
    contentHeightPt, outerHeightPt: contentHeightPt + 10,
    completeWhenEmpty: input.candidates.length === 0,
    fingerprint: JSON.stringify([input.id, input.verticalAlign, input.candidates]),
  }
}

function prepared(missingImage = false): Extract<VNextTablePreparedRowsResultV1, { status: "ready" }> {
  const headerCells = [
    cell({ id: "header-left", columnStart: 0, authored: true, candidates: [textCandidate("header-left-text", 0, 10)] }),
    cell({ id: "header-right", columnStart: 1, authored: true, candidates: [textCandidate("header-right-text", 0, 10)] }),
  ]
  const image: VNextTablePreparedCellCandidateV1 = {
    candidateId: "body-image:atomic", nodeId: "body-image", candidateIndex: 0,
    kind: "image", atomic: true, widthPt: 30, heightPt: 30, align: "right",
    assetId: missingImage ? null : "asset-1", assetOwner: missingImage ? "none" : "instance-media",
    breakAfter: true,
  }
  const bodyCells = [
    cell({
      id: "body-left", columnStart: 0, authored: false,
      candidates: [textCandidate("body-left-text", 0, 60), textCandidate("body-left-text", 1, 60)],
    }),
    cell({ id: "body-right", columnStart: 1, authored: false, verticalAlign: "bottom", candidates: [image] }),
  ]
  const rows = [
    {
      kind: "prepared-authored-row" as const, rowIndex: 0, sourceRowId: "header-row",
      rowSourceId: "header-source", rowTemplateId: "header-template", role: "header" as const,
      breakPolicy: "strict-keep" as const, minimumFirstFragmentHeightPt: 0,
      cells: headerCells, maximumCellOuterHeightPt: 20, fingerprint: "header-row-fingerprint",
    },
    {
      kind: "prepared-materialized-row" as const, rowIndex: 1, rowInstanceId: "rowi_body",
      rowSourceId: "body-source", rowTemplateId: "body-template", itemKey: "item-1", role: "body" as const,
      breakPolicy: "allow" as const, minimumFirstFragmentHeightPt: 0,
      cells: bodyCells, maximumCellOuterHeightPt: 130, fingerprint: "body-row-fingerprint",
    },
  ]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "instance-1", instanceRevision: 1, tableId: "table-1",
    tableDefinitionId: "definition-1", geometryFingerprint: "geometry-1",
    rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: { rowCount: 2, authoredRowCount: 1, materializedRowCount: 1, cellCount: 4, candidateCount: 5 },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

function style(missingMediaPolicy: "block" | "draw-placeholder" = "block"): VNextTableRendererStyleProfileV1 {
  return {
    contractVersion: 1, kind: "table-render-style-profile", profileId: "report-style-v1",
    outerBorder: { style: "solid", widthPt: 1, color: "111827" },
    internalRowBorder: { style: "solid", widthPt: 0.5, color: "94A3B8" },
    internalColumnBorder: { style: "solid", widthPt: 0.5, color: "CBD5E1" },
    defaultCellBackground: null,
    rowBackgrounds: {
      header: "E2E8F0", body: null, footer: null, "empty-state": null, "repeated-header": "F1F5F9",
    },
    textColorFallback: "0F172A", missingMediaPolicy,
  }
}

function pagination(missingImage = false) {
  const result = paginateVNextTableRowsV1({
    prepared: prepared(missingImage), headerPolicy: "repeat-leading-headers",
    pageBodyHeightPt: 100, maximumPageCount: 5, maximumRowPlanCount: 10,
  })
  if (result.status !== "paginated") throw new Error(result.issues.map((item) => item.message).join("\n"))
  return result
}

function project(missingImage = false, missingMediaPolicy: "block" | "draw-placeholder" = "block") {
  const pages = pagination(missingImage)
  return projectVNextTableRendererCommandsV1({
    contractVersion: 1, kind: "table-renderer-projection-request",
    sectionId: "main", zoneId: "body", expectedPaginationFingerprint: pages.fingerprint,
    pagination: pages,
    pageOrigins: pages.pages.map((page) => ({ pageIndex: page.pageIndex, xPt: 20, yPt: 30 })),
    styleProfile: style(missingMediaPolicy),
  })
}

describe("Table renderer command projection v1", () => {
  it("projects split rows, repeated headers, alignment, candidates, and single-owner borders", () => {
    const result = project()
    expect(result.status).toBe("consumable")
    if (result.status !== "consumable") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.summary).toEqual({
      pageCount: 2, segmentCount: 2, rowFragmentCount: 4, cellFragmentCount: 8,
      candidateCount: 7, borderCount: 14, commandCount: 41,
    })
    expect(result.work).toEqual({
      pageVisitCount: 2, rowVisitCount: 4, cellVisitCount: 8,
      candidateVisitCount: 7, borderEmitCount: 14,
    })
    expect(result.contracts).toEqual({
      authoredDocumentInput: false, measurementExecution: false, paginationExecution: false, relayout: false,
    })
    expect(result.commands.filter((command) => command.kind === "table-segment")).toMatchObject([
      { continuesFromPreviousPage: false, continuesOnNextPage: true },
      { continuesFromPreviousPage: true, continuesOnNextPage: false },
    ])
    expect(result.commands).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "cell-fragment", sourceCellId: "body-right", verticalAlign: "bottom", contentOffsetYPt: 25,
      }),
      expect.objectContaining({
        kind: "image", sourceCellId: "body-right", align: "right", placeholder: false,
        bounds: { xPt: 185, yPt: 80, widthPt: 30, heightPt: 30 },
      }),
      expect.objectContaining({ kind: "border", semanticRole: "continuation", edge: "bottom" }),
      expect.objectContaining({ kind: "cell-background", color: "F1F5F9" }),
    ]))
    const firstRowIndex = result.commands.findIndex(
      (command) => command.pageIndex === 0 && command.kind === "row-fragment",
    )
    const lastBackgroundIndex = result.commands.reduce(
      (last, command, index) => command.pageIndex === 0 && command.kind === "cell-background" ? index : last, -1,
    )
    expect(lastBackgroundIndex).toBeLessThan(firstRowIndex)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks missing media or emits an explicit placeholder according to profile policy", () => {
    expect(project(true, "block")).toMatchObject({
      status: "blocked", commands: null,
      issues: [expect.objectContaining({ code: "missing-image-asset", candidateId: "body-image:atomic" })],
    })
    expect(project(true, "draw-placeholder")).toMatchObject({
      status: "consumable",
      commands: expect.arrayContaining([
        expect.objectContaining({ kind: "image", assetId: null, placeholder: true }),
      ]),
    })
  })

  it("blocks fingerprint, page-origin, geometry, and strict style drift without partial commands", () => {
    const pages = pagination()
    const base = {
      contractVersion: 1 as const, kind: "table-renderer-projection-request" as const,
      sectionId: "main", zoneId: "body", expectedPaginationFingerprint: pages.fingerprint,
      pagination: pages, pageOrigins: pages.pages.map((page) => ({ pageIndex: page.pageIndex, xPt: 0, yPt: 0 })),
      styleProfile: style(),
    }
    expect(projectVNextTableRendererCommandsV1({ ...base, expectedPaginationFingerprint: "stale" })).toMatchObject({
      status: "blocked", commands: null,
      issues: [expect.objectContaining({ code: "pagination-fingerprint-mismatch" })],
    })
    expect(projectVNextTableRendererCommandsV1({ ...base, pageOrigins: [{ pageIndex: 0, xPt: 0, yPt: 0 }] })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "missing-page-origin", pageIndex: 1 })],
    })
    const drifted = JSON.parse(JSON.stringify(pages)) as typeof pages
    drifted.pages[0].rows[1].cells[1].contentWidthPt = 91
    expect(projectVNextTableRendererCommandsV1({ ...base, pagination: drifted })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "invalid-cell-fragment-geometry" })],
    })
    expect(projectVNextTableRendererCommandsV1({
      ...base, styleProfile: { ...style(), extra: true },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "invalid-renderer-input" })] })
  })
})
