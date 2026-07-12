import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  runVNextTableAuthoringV1,
  type VNextStructurePolicyNodeAction,
  type VNextTableAuthoringCommandV1,
} from "../src/index.js"

const actions: VNextStructurePolicyNodeAction[] = [
  "table.row.insert", "table.row.delete", "table.row.reorder",
  "table.column.insert", "table.column.delete", "table.column.resize",
  "table.cell.vertical-align.patch",
]

function request(command: VNextTableAuthoringCommandV1): any {
  const pack = JSON.parse(readFileSync(
    new URL("../fixtures/product-report-v4-migrated-minimal.flowdoc.json", import.meta.url), "utf8",
  ))
  const ref = { structureId: "product-report", draftId: "draft-1", revision: 4 }
  return {
    contractVersion: 1, kind: "table-authoring-request",
    artifact: { contractVersion: 1, kind: "structure-definition-draft", ...ref },
    document: pack.document,
    definition: {
      contractVersion: 1, kind: "table-definition", tableDefinitionId: "detail-definition",
      owner: { kind: "structure-draft", ref: { ...ref } },
      tableId: "detail-table", headerPolicy: "repeat-leading-headers",
      columns: [{ columnId: "metric", widthShare: 50 }, { columnId: "value", widthShare: 50 }],
      rowSources: [{ kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header-template", role: "header" }],
      rowTemplates: {
        "header-template": {
          rowTemplateId: "header-template", sourceRowId: "detail-header-row", breakPolicy: "strict-keep",
          cells: [
            { cellId: "detail-cell-a", columnStart: 0, colSpan: 1, rowSpan: 1 },
            { cellId: "detail-cell-b", columnStart: 1, colSpan: 1, rowSpan: 1 },
          ],
        },
      },
    },
    policySet: {
      contractVersion: 1, kind: "structure-policy-set", policySetId: "draft-policy",
      owner: { kind: "structure-definition-draft", ref: { ...ref } },
      defaultPolicyKey: "default", policies: { default: { key: "default", nodeActions: [...actions] } },
      nodeBindings: {},
    },
    sessionAllowedActions: [...actions], command,
  }
}

function nextRequest(prior: any, command: VNextTableAuthoringCommandV1): any {
  const input = request(command)
  input.document = prior.document
  input.definition = prior.definition
  return input
}

function widths(result: any): number[] {
  return result.document.document.sections[0].nodes["detail-table"].columns.map((column: any) => column.width.value)
}

describe("Table v4 grid and cell authoring commands", () => {
  it("inserts one stable column and one empty cell per row template", () => {
    const input = request({
      kind: "table.column.insert", tableId: "detail-table", index: 1,
      columnId: "unit", widthShare: 20,
      cellIdsByRowTemplateId: { "header-template": "detail-cell-unit" },
    })
    const before = JSON.stringify(input)
    const first = runVNextTableAuthoringV1(input)
    const second = runVNextTableAuthoringV1(input)

    expect(first.status).toBe("committed")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "committed") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.definition.columns).toEqual([
      { columnId: "metric", widthShare: 40 },
      { columnId: "unit", widthShare: 20 },
      { columnId: "value", widthShare: 40 },
    ])
    expect(widths(first)).toEqual([96, 48, 96])
    expect(first.definition.rowTemplates["header-template"].cells).toEqual([
      { cellId: "detail-cell-a", columnStart: 0, colSpan: 1, rowSpan: 1 },
      { cellId: "detail-cell-unit", columnStart: 1, colSpan: 1, rowSpan: 1 },
      { cellId: "detail-cell-b", columnStart: 2, colSpan: 1, rowSpan: 1 },
    ])
    const nodes = first.document.document.sections[0].nodes
    expect(nodes["detail-header-row"]).toMatchObject({
      cellIds: ["detail-cell-a", "detail-cell-unit", "detail-cell-b"],
    })
    expect(nodes["detail-cell-unit"]).toEqual({
      id: "detail-cell-unit", type: "table-cell", props: {}, childIds: [],
    })
    expect(first.operation).toMatchObject({
      action: "table.column.insert",
      identity: { addedNodeIds: ["detail-cell-unit"], addedColumnIds: ["unit"] },
      selectionAfter: { kind: "table-column", columnId: "unit" },
      invalidation: { lane: "table-grid", measurement: true, pagination: true, renderer: true },
      work: { rowTemplateVisitCount: 1, cellVisitCount: 1, subtreeNodeVisitCount: 0 },
    })
    expect(JSON.stringify(input)).toBe(before)
  })

  it("deletes a column subtree, normalizes widths, and selects the preceding column", () => {
    const inserted = runVNextTableAuthoringV1(request({
      kind: "table.column.insert", tableId: "detail-table", index: 1,
      columnId: "unit", widthShare: 20,
      cellIdsByRowTemplateId: { "header-template": "detail-cell-unit" },
    }))
    if (inserted.status !== "committed") throw new Error("insert blocked")
    const deleted = runVNextTableAuthoringV1(nextRequest(inserted, {
      kind: "table.column.delete", tableId: "detail-table", columnId: "unit",
    }))

    expect(deleted.status).toBe("committed")
    if (deleted.status !== "committed") throw new Error(deleted.issues.map((item) => item.message).join("\n"))
    expect(deleted.definition.columns).toEqual([
      { columnId: "metric", widthShare: 50 }, { columnId: "value", widthShare: 50 },
    ])
    expect(widths(deleted)).toEqual([120, 120])
    expect(deleted.document.document.sections[0].nodes["detail-cell-unit"]).toBeUndefined()
    expect(deleted.operation).toMatchObject({
      identity: { removedNodeIds: ["detail-cell-unit"], removedColumnIds: ["unit"] },
      selectionAfter: { kind: "table-column", columnId: "metric" },
    })
  })

  it("deletes populated cell descendants and selects the next column when the first is removed", () => {
    const result = runVNextTableAuthoringV1(request({
      kind: "table.column.delete", tableId: "detail-table", columnId: "metric",
    }))
    expect(result.status).toBe("committed")
    if (result.status !== "committed") throw new Error(result.issues.map((item) => item.message).join("\n"))
    const nodes = result.document.document.sections[0].nodes
    expect(nodes["detail-cell-a"]).toBeUndefined()
    expect(nodes["detail-cell-a-text"]).toBeUndefined()
    expect(result.definition.columns).toEqual([{ columnId: "value", widthShare: 100 }])
    expect(widths(result)).toEqual([240])
    expect(result.operation).toMatchObject({
      identity: { removedNodeIds: ["detail-cell-a", "detail-cell-a-text"] },
      scope: { textBlockIds: ["detail-cell-a-text"] },
      selectionAfter: { columnId: "value" },
      work: { subtreeNodeVisitCount: 2 },
    })
  })

  it("resizes stable shares while preserving physical Table width", () => {
    const result = runVNextTableAuthoringV1(request({
      kind: "table.column.resize", tableId: "detail-table", columnId: "metric", widthShare: 60,
    }))
    expect(result.status).toBe("committed")
    if (result.status !== "committed") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.definition.columns).toEqual([
      { columnId: "metric", widthShare: 60 }, { columnId: "value", widthShare: 40 },
    ])
    expect(widths(result)).toEqual([144, 96])
    expect(widths(result).reduce((sum, value) => sum + value, 0)).toBe(240)
    expect(result.operation).toMatchObject({
      historyPolicy: { durableIntent: "layout" },
      invalidation: { lane: "table-width", definition: true, measurement: true, pagination: true, renderer: true },
      selectionAfter: { kind: "table-column", columnId: "metric" },
    })
  })

  it("patches cell vertical alignment without invalidating measurement or pagination", () => {
    const result = runVNextTableAuthoringV1(request({
      kind: "table.cell.vertical-align.patch", tableId: "detail-table",
      cellId: "detail-cell-b", verticalAlign: "bottom",
    }))
    expect(result.status).toBe("committed")
    if (result.status !== "committed") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.document.document.sections[0].nodes["detail-cell-b"]).toMatchObject({
      props: { verticalAlign: "bottom" },
    })
    expect(result.definition).toEqual(request({
      kind: "table.cell.vertical-align.patch", tableId: "detail-table",
      cellId: "detail-cell-b", verticalAlign: "bottom",
    }).definition)
    expect(result.operation).toMatchObject({
      action: "table.cell.vertical-align.patch",
      historyPolicy: { durableIntent: "layout" },
      selectionAfter: { kind: "table-cell", rowId: "detail-header-row", cellId: "detail-cell-b" },
      invalidation: {
        lane: "table-cell-layout", definition: false, measurement: false, pagination: false, renderer: true,
      },
    })
    expect(result.operation.fingerprints.definitionBefore).toBe(result.operation.fingerprints.definitionAfter)
  })

  it("blocks invalid identity maps, missing/last columns, no-op resize/alignment, and capability denial", () => {
    expect(runVNextTableAuthoringV1(request({
      kind: "table.column.insert", tableId: "detail-table", index: 1,
      columnId: "unit", widthShare: 20, cellIdsByRowTemplateId: {},
    }))).toMatchObject({
      status: "blocked", reason: "invalid-command",
      issues: [expect.objectContaining({ code: "inserted-cell-identity-map-invalid" })],
    })
    expect(runVNextTableAuthoringV1(request({
      kind: "table.column.delete", tableId: "detail-table", columnId: "missing",
    }))).toMatchObject({ status: "blocked", reason: "target-not-found" })
    expect(runVNextTableAuthoringV1(request({
      kind: "table.column.resize", tableId: "detail-table", columnId: "metric", widthShare: 50,
    }))).toMatchObject({ status: "blocked", reason: "no-op" })
    expect(runVNextTableAuthoringV1(request({
      kind: "table.cell.vertical-align.patch", tableId: "detail-table",
      cellId: "detail-cell-a", verticalAlign: "top",
    }))).toMatchObject({ status: "blocked", reason: "no-op" })

    const oneColumn = runVNextTableAuthoringV1(request({
      kind: "table.column.delete", tableId: "detail-table", columnId: "metric",
    }))
    if (oneColumn.status !== "committed") throw new Error("one-column fixture blocked")
    expect(runVNextTableAuthoringV1(nextRequest(oneColumn, {
      kind: "table.column.delete", tableId: "detail-table", columnId: "value",
    }))).toMatchObject({
      status: "blocked", reason: "invalid-command",
      issues: [expect.objectContaining({ code: "cannot-delete-last-column" })],
    })

    const denied = request({
      kind: "table.column.resize", tableId: "detail-table", columnId: "metric", widthShare: 60,
    })
    denied.sessionAllowedActions = denied.sessionAllowedActions.filter((action: string) => action !== "table.column.resize")
    expect(runVNextTableAuthoringV1(denied)).toMatchObject({
      status: "blocked", reason: "capability-denied",
      issues: [expect.objectContaining({ code: "session-permission-denied", action: "table.column.resize" })],
    })
  })
})
