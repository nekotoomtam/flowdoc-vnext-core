import { describe, expect, it } from "vitest"
import {
  createVNextTableCellGeometryV1,
  type VNextTableCellGeometryRequestV1,
} from "../src/index.js"

function request(): VNextTableCellGeometryRequestV1 {
  return {
    contractVersion: 1,
    kind: "table-cell-geometry-request",
    tableContentWidthPt: 500,
    layoutProfile: {
      contractVersion: 1,
      kind: "table-cell-layout-profile",
      layoutProfileId: "table-layout-v1",
      defaultInsetsPt: { top: 4, right: 6, bottom: 4, left: 6 },
      insetsByRowTemplate: {},
    },
    definition: {
      contractVersion: 1,
      kind: "table-definition",
      tableDefinitionId: "orders-table-v1",
      owner: {
        kind: "published-structure-version",
        ref: { structureId: "orders", structureVersionId: "orders-v1", versionOrdinal: 1 },
      },
      tableId: "orders-table",
      headerPolicy: "no-repeat",
      columns: [
        { columnId: "description", widthShare: 33.333333 },
        { columnId: "quantity", widthShare: 33.333333 },
        { columnId: "amount", widthShare: 33.333334 },
      ],
      rowSources: [{
        kind: "static-row",
        rowSourceId: "body-source",
        rowTemplateId: "body-template",
        role: "body",
      }],
      rowTemplates: {
        "body-template": {
          rowTemplateId: "body-template",
          sourceRowId: "body-row",
          breakPolicy: "allow",
          cells: [
            { cellId: "description-cell", columnStart: 0, colSpan: 2, rowSpan: 1 },
            { cellId: "amount-cell", columnStart: 2, colSpan: 1, rowSpan: 1 },
          ],
        },
      },
    },
  }
}

describe("table cell geometry v1", () => {
  it("computes deterministic columns and colSpan-aware cell content widths", () => {
    const input = request()
    const before = JSON.stringify(input)
    const result = createVNextTableCellGeometryV1(input)

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.geometry.columns).toEqual([
      { columnId: "description", columnIndex: 0, widthShare: 33.333333, xOffsetPt: 0, widthPt: 166.666665 },
      { columnId: "quantity", columnIndex: 1, widthShare: 33.333333, xOffsetPt: 166.666665, widthPt: 166.666665 },
      { columnId: "amount", columnIndex: 2, widthShare: 33.333334, xOffsetPt: 333.33333, widthPt: 166.66667 },
    ])
    expect(result.geometry.rowTemplates["body-template"].cells).toMatchObject([
      { sourceCellId: "description-cell", colSpan: 2, outerWidthPt: 333.33333, contentWidthPt: 321.33333 },
      { sourceCellId: "amount-cell", colSpan: 1, outerWidthPt: 166.66667, contentWidthPt: 154.66667 },
    ])
    expect(result.work).toEqual({ columnCount: 3, rowTemplateCount: 1, cellCount: 2 })
    expect(result.execution.measurement).toBe("not-run")
    expect(JSON.stringify(input)).toBe(before)
  })

  it("uses exact per-template inset overrides and stable fingerprints", () => {
    const input = request()
    input.layoutProfile.insetsByRowTemplate = {
      "body-template": {
        "amount-cell": { top: 1, right: 2, bottom: 3, left: 4 },
      },
    }
    const first = createVNextTableCellGeometryV1(input)
    const second = createVNextTableCellGeometryV1(input)

    expect(first.status === "ready" && first.geometry.rowTemplates["body-template"].cells[1]).toMatchObject({
      insetsPt: { top: 1, right: 2, bottom: 3, left: 4 },
      contentWidthPt: 160.66667,
    })
    expect(first.status === "ready" && second.status === "ready" && first.geometry.fingerprint)
      .toBe(second.status === "ready" ? second.geometry.fingerprint : "")
  })

  it("blocks unknown overrides and non-positive content width", () => {
    const unknown = request()
    unknown.layoutProfile.insetsByRowTemplate = {
      "body-template": { missing: { top: 0, right: 0, bottom: 0, left: 0 } },
    }
    const narrow = request()
    narrow.tableContentWidthPt = 10

    expect(createVNextTableCellGeometryV1(unknown)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unknown-inset-cell" })],
    })
    expect(createVNextTableCellGeometryV1(narrow)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "non-positive-cell-content-width" })]),
    })
  })

  it("rejects malformed definitions and layout profiles through strict schemas", () => {
    expect(createVNextTableCellGeometryV1({ ...request(), extra: true })).toMatchObject({ status: "blocked" })
    expect(createVNextTableCellGeometryV1({ ...request(), tableContentWidthPt: 0 })).toMatchObject({ status: "blocked" })
  })
})
