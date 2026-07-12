import { describe, expect, it } from "vitest"
import {
  safeParseVNextTableDefinitionV1,
  tableRowBreakPolicyFromAuthoredAllowBreakV1,
  type VNextTableDefinitionV1,
} from "../src/table/tableDefinitionV1.js"

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "orders-table-definition",
    owner: {
      kind: "published-structure-version",
      ref: { structureId: "orders", structureVersionId: "orders-v3", versionOrdinal: 3 },
    },
    tableId: "orders-table",
    headerPolicy: "repeat-leading-headers",
    columns: [
      { columnId: "description", widthShare: 60 },
      { columnId: "quantity", widthShare: 15 },
      { columnId: "amount", widthShare: 25 },
    ],
    rowSources: [
      { kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header", role: "header" },
      {
        kind: "collection-rows",
        rowSourceId: "orders-source",
        collectionFieldKey: "orders.items",
        rowTemplateId: "item",
        role: "body",
        emptyPolicy: { kind: "empty-row", rowTemplateId: "empty" },
      },
      { kind: "static-row", rowSourceId: "footer-source", rowTemplateId: "footer", role: "footer" },
    ],
    rowTemplates: {
      header: {
        rowTemplateId: "header",
        sourceRowId: "header-row",
        breakPolicy: "strict-keep",
        cells: [
          { cellId: "header-description", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "header-rest", columnStart: 1, colSpan: 2, rowSpan: 1 },
        ],
      },
      item: {
        rowTemplateId: "item",
        sourceRowId: "item-row-template",
        breakPolicy: "prefer-keep",
        minHeightPt: 18,
        cells: [
          { cellId: "item-description", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "item-quantity", columnStart: 1, colSpan: 1, rowSpan: 1 },
          { cellId: "item-amount", columnStart: 2, colSpan: 1, rowSpan: 1 },
        ],
      },
      empty: {
        rowTemplateId: "empty",
        sourceRowId: "empty-row",
        breakPolicy: "strict-keep",
        cells: [{ cellId: "empty-message", columnStart: 0, colSpan: 3, rowSpan: 1 }],
      },
      footer: {
        rowTemplateId: "footer",
        sourceRowId: "footer-row",
        breakPolicy: "strict-keep",
        cells: [
          { cellId: "footer-label", columnStart: 0, colSpan: 2, rowSpan: 1 },
          { cellId: "footer-total", columnStart: 2, colSpan: 1, rowSpan: 1 },
        ],
      },
    },
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("table definition v1", () => {
  it("accepts mixed static and collection row sources with colSpan occupancy", () => {
    const input = definition()
    const before = JSON.stringify(input)
    const result = safeParseVNextTableDefinitionV1(input)

    expect(result).toEqual({ ok: true, definition: input, issues: [] })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it.each([
    [true, "allow"],
    [false, "strict-keep"],
    [undefined, "prefer-keep"],
  ])("maps authored allowBreak %s to %s", (value, expected) => {
    expect(tableRowBreakPolicyFromAuthoredAllowBreakV1(value)).toBe(expected)
  })

  it("blocks width totals and duplicate stable ids", () => {
    const input = clone(definition())
    input.columns[2].widthShare = 20
    input.columns[1].columnId = input.columns[0].columnId
    input.rowSources[1].rowSourceId = input.rowSources[0].rowSourceId
    const result = safeParseVNextTableDefinitionV1(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.map((item) => item.path)).toEqual(expect.arrayContaining([
        "columns",
        "columns[1].columnId",
        "rowSources[1].rowSourceId",
      ]))
    }
  })

  it("blocks occupancy gaps, overlap, and incomplete rows", () => {
    const gap = clone(definition())
    gap.rowTemplates.item.cells[1].columnStart = 2
    const gapResult = safeParseVNextTableDefinitionV1(gap)
    expect(gapResult.ok).toBe(false)
    if (!gapResult.ok) expect(gapResult.issues.some((item) => item.message.includes("occupancy gap"))).toBe(true)

    const overlap = clone(definition())
    overlap.rowTemplates.item.cells[1].columnStart = 0
    const overlapResult = safeParseVNextTableDefinitionV1(overlap)
    expect(overlapResult.ok).toBe(false)
    if (!overlapResult.ok) expect(overlapResult.issues.some((item) => item.message.includes("overlaps occupied"))).toBe(true)

    const incomplete = clone(definition())
    incomplete.rowTemplates.item.cells.pop()
    const incompleteResult = safeParseVNextTableDefinitionV1(incomplete)
    expect(incompleteResult.ok).toBe(false)
    if (!incompleteResult.ok) expect(incompleteResult.issues.some((item) => item.message.includes("must end at column count"))).toBe(true)
  })

  it("reserves rowSpan while blocking values above one", () => {
    const input = clone(definition())
    input.rowTemplates.item.cells[0].rowSpan = 2
    const result = safeParseVNextTableDefinitionV1(input)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues).toContainEqual(expect.objectContaining({
      path: "rowTemplates.item.cells[0].rowSpan",
    }))
  })

  it("blocks missing templates, invalid empty-state references, and late headers", () => {
    const input = clone(definition())
    input.rowSources[1].rowTemplateId = "missing"
    const collection = input.rowSources[1]
    if (collection.kind !== "collection-rows") throw new Error("fixture shape")
    collection.emptyPolicy = { kind: "empty-row", rowTemplateId: "missing-empty" }
    input.rowSources[2] = {
      kind: "static-row",
      rowSourceId: "late-header",
      rowTemplateId: "footer",
      role: "header",
    }
    const result = safeParseVNextTableDefinitionV1(input)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.map((item) => item.path)).toEqual(expect.arrayContaining([
      "rowSources[1].rowTemplateId",
      "rowSources[1].emptyPolicy.rowTemplateId",
      "rowSources[2].role",
    ]))
  })

  it("requires a leading header when repeat policy is enabled", () => {
    const input = clone(definition())
    input.rowSources = input.rowSources.slice(1)
    const result = safeParseVNextTableDefinitionV1(input)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues).toContainEqual(expect.objectContaining({ path: "headerPolicy" }))
  })
})
