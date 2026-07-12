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
      rowSources: [{
        kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header-template", role: "header",
      }],
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
    sessionAllowedActions: [...actions],
    command,
  }
}

function insertCommand(suffix: string, index = 1): Extract<VNextTableAuthoringCommandV1, { kind: "table.row.insert.static" }> {
  return {
    kind: "table.row.insert.static", tableId: "detail-table", index,
    rowId: `body-row-${suffix}`, rowSourceId: `body-source-${suffix}`,
    rowTemplateId: `body-template-${suffix}`,
    cellIds: [`body-cell-${suffix}-a`, `body-cell-${suffix}-b`],
    role: "body", breakPolicy: "allow", minHeightPt: 18,
  }
}

function nextRequest(prior: any, command: VNextTableAuthoringCommandV1): any {
  const base = request(command)
  base.document = prior.document
  base.definition = prior.definition
  return base
}

describe("Table v4 authored row commands", () => {
  it("inserts one empty static row into document and definition atomically", () => {
    const input = request(insertCommand("1"))
    const before = JSON.stringify(input)
    const first = runVNextTableAuthoringV1(input)
    const second = runVNextTableAuthoringV1(input)

    expect(first.status).toBe("committed")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "committed") throw new Error(first.issues.map((item) => item.message).join("\n"))
    const section = first.document.document.sections[0]
    expect(section.nodes["detail-table"]).toMatchObject({
      rowIds: ["detail-header-row", "body-row-1"],
      props: { headerRowCount: 1, repeatHeaderRows: true },
    })
    expect(section.nodes["body-row-1"]).toEqual({
      id: "body-row-1", type: "table-row",
      props: { minHeight: { value: 18, unit: "pt" }, allowBreak: true },
      cellIds: ["body-cell-1-a", "body-cell-1-b"],
    })
    expect(section.nodes["body-cell-1-a"]).toEqual({
      id: "body-cell-1-a", type: "table-cell", props: {}, childIds: [],
    })
    expect(first.definition).toMatchObject({
      rowSources: [
        { rowSourceId: "header-source" },
        { kind: "static-row", rowSourceId: "body-source-1", rowTemplateId: "body-template-1", role: "body" },
      ],
      rowTemplates: {
        "body-template-1": {
          sourceRowId: "body-row-1", breakPolicy: "allow", minHeightPt: 18,
          cells: [
            { cellId: "body-cell-1-a", columnStart: 0, colSpan: 1, rowSpan: 1 },
            { cellId: "body-cell-1-b", columnStart: 1, colSpan: 1, rowSpan: 1 },
          ],
        },
      },
    })
    expect(first.operation).toMatchObject({
      kind: "table.row.insert.static", action: "table.row.insert", policyKey: "default",
      identity: { addedNodeIds: ["body-row-1", "body-cell-1-a", "body-cell-1-b"] },
      selectionAfter: { kind: "table-row", rowSourceId: "body-source-1", rowId: "body-row-1" },
      historyPolicy: { durableIntent: "structure", kind: "single-entry", collaborationSafe: false },
      invalidation: { lane: "table-row-order", definition: true, measurement: false, pagination: true, renderer: true },
      contracts: { persistence: "not-run", editorSelectionMutation: false, measurement: "not-run" },
    })
    expect(first.operation.fingerprints.bundleBefore).not.toBe(first.operation.fingerprints.bundleAfter)
    expect(JSON.stringify(input)).toBe(before)
  })

  it("deletes a static row subtree and recommends the preceding row", () => {
    const inserted = runVNextTableAuthoringV1(request(insertCommand("1")))
    if (inserted.status !== "committed") throw new Error("insert fixture blocked")
    const deletion = runVNextTableAuthoringV1(nextRequest(inserted, {
      kind: "table.row.delete.static", tableId: "detail-table", rowSourceId: "body-source-1",
    }))

    expect(deletion.status).toBe("committed")
    if (deletion.status !== "committed") throw new Error(deletion.issues.map((item) => item.message).join("\n"))
    const nodes = deletion.document.document.sections[0].nodes
    expect(nodes["body-row-1"]).toBeUndefined()
    expect(nodes["body-cell-1-a"]).toBeUndefined()
    expect(deletion.definition.rowTemplates["body-template-1"]).toBeUndefined()
    expect(deletion.definition.rowSources.map((source) => source.rowSourceId)).toEqual(["header-source"])
    expect(deletion.operation).toMatchObject({
      action: "table.row.delete",
      identity: { removedNodeIds: ["body-row-1", "body-cell-1-a", "body-cell-1-b"] },
      selectionAfter: { kind: "table-row", rowSourceId: "header-source", rowId: "detail-header-row" },
      work: { rowTemplateVisitCount: 1, cellVisitCount: 2, subtreeNodeVisitCount: 3 },
    })
  })

  it("reorders a row source and authored row together while retaining identity", () => {
    const first = runVNextTableAuthoringV1(request(insertCommand("1")))
    if (first.status !== "committed") throw new Error("first insert blocked")
    const second = runVNextTableAuthoringV1(nextRequest(first, insertCommand("2", 2)))
    if (second.status !== "committed") throw new Error("second insert blocked")
    const reordered = runVNextTableAuthoringV1(nextRequest(second, {
      kind: "table.row.reorder", tableId: "detail-table", rowSourceId: "body-source-2", toIndex: 1,
    }))

    expect(reordered.status).toBe("committed")
    if (reordered.status !== "committed") throw new Error(reordered.issues.map((item) => item.message).join("\n"))
    expect(reordered.definition.rowSources.map((source) => source.rowSourceId)).toEqual([
      "header-source", "body-source-2", "body-source-1",
    ])
    const table = reordered.document.document.sections[0].nodes["detail-table"]
    expect(table).toMatchObject({ rowIds: ["detail-header-row", "body-row-2", "body-row-1"] })
    expect(reordered.operation).toMatchObject({
      identity: { addedNodeIds: [], removedNodeIds: [], reorderedIds: ["body-source-2", "body-row-2"] },
      selectionAfter: { rowSourceId: "body-source-2", rowId: "body-row-2" },
    })
  })

  it("blocks no-op/header-invalid moves, identity conflicts, last-row deletion, and collection deletion", () => {
    expect(runVNextTableAuthoringV1(request({
      kind: "table.row.reorder", tableId: "detail-table", rowSourceId: "header-source", toIndex: 0,
    }))).toMatchObject({ status: "blocked", reason: "no-op", issues: [expect.objectContaining({ code: "no-op-index" })] })

    const inserted = runVNextTableAuthoringV1(request(insertCommand("1")))
    if (inserted.status !== "committed") throw new Error("insert blocked")
    expect(runVNextTableAuthoringV1(nextRequest(inserted, {
      kind: "table.row.reorder", tableId: "detail-table", rowSourceId: "header-source", toIndex: 1,
    }))).toMatchObject({
      status: "blocked", reason: "validation-failed",
      issues: expect.arrayContaining([expect.objectContaining({ path: expect.stringContaining("role") })]),
    })

    const conflict = insertCommand("1")
    conflict.rowId = "detail-header-row"
    expect(runVNextTableAuthoringV1(request(conflict))).toMatchObject({
      status: "blocked", reason: "invalid-command", issues: [expect.objectContaining({ code: "identity-conflict" })],
    })
    expect(runVNextTableAuthoringV1(request({
      kind: "table.row.delete.static", tableId: "detail-table", rowSourceId: "header-source",
    }))).toMatchObject({
      status: "blocked", reason: "invalid-command", issues: [expect.objectContaining({ code: "cannot-delete-last-row" })],
    })

    const collection = request({
      kind: "table.row.delete.static", tableId: "detail-table", rowSourceId: "header-source",
    })
    collection.definition.headerPolicy = "no-repeat"
    collection.definition.rowSources[0] = {
      kind: "collection-rows", rowSourceId: "header-source", collectionFieldKey: "items",
      rowTemplateId: "header-template", role: "body", emptyPolicy: { kind: "header-only" },
    }
    const table = collection.document.document.sections[0].nodes["detail-table"]
    table.props.headerRowCount = 0
    table.props.repeatHeaderRows = false
    expect(runVNextTableAuthoringV1(collection)).toMatchObject({
      status: "blocked", reason: "unsupported-capability",
      issues: [expect.objectContaining({ code: "collection-source-delete-unsupported" })],
    })
  })

  it("enforces dedicated structure and session capability before mutation", () => {
    const input = request(insertCommand("1"))
    input.policySet.policies.default.nodeActions = []
    input.sessionAllowedActions = []
    expect(runVNextTableAuthoringV1(input)).toMatchObject({
      status: "blocked", reason: "capability-denied",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "structure-policy-denied", action: "table.row.insert" }),
        expect.objectContaining({ code: "session-permission-denied", action: "table.row.insert" }),
      ]),
    })
  })
})
