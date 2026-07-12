import { describe, expect, it } from "vitest"
import {
  applyVNextTableAuthoringReversibleChangeSetV1,
  createVNextTableAuthoringReversibleChangeSetV1,
  runVNextTableAuthoringV1,
  type VNextTableAuthoringBundleV1,
} from "../src/index.js"
import {
  createTableAuthoringBundle,
  createTableAuthoringRequest,
} from "./helpers/tableAuthoringV1Fixture.js"

function bundleAfter(bundle: VNextTableAuthoringBundleV1, result: any): VNextTableAuthoringBundleV1 {
  return { ...bundle, document: result.document, definition: result.definition }
}

describe("Table v4 authoring reversible change set", () => {
  it("retains only changed nodes and definition slices for exact undo and redo", () => {
    const initial = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(initial, {
      kind: "table.column.resize", tableId: "table", columnId: "left", widthShare: 60,
    })
    const committed = runVNextTableAuthoringV1(request)
    if (committed.status !== "committed") throw new Error("resize fixture blocked")
    const changeSet = createVNextTableAuthoringReversibleChangeSetV1({ request, result: committed })

    expect(changeSet.summary).toEqual({
      changedNodeCount: 1,
      changedRowTemplateCount: 0,
      columnsChanged: true,
      rowSourcesChanged: false,
      headerPolicyChanged: false,
    })
    expect(changeSet.nodeChanges.map((change) => change.nodeId)).toEqual(["table"])
    expect(changeSet.definitionChanges).toMatchObject({
      columns: { before: initial.definition.columns, after: committed.definition.columns },
      rowSources: null, rowTemplates: [], headerPolicy: null,
    })

    const after = bundleAfter(initial, committed)
    const undone = applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: after, changeSet, direction: "undo",
    })
    expect(undone.status).toBe("applied")
    if (undone.status !== "applied") throw new Error("undo blocked")
    expect(undone.document).toEqual(initial.document)
    expect(undone.definition).toEqual(initial.definition)

    const redone = applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: { ...initial, document: undone.document, definition: undone.definition },
      changeSet, direction: "redo",
    })
    expect(redone.status).toBe("applied")
    if (redone.status !== "applied") throw new Error("redo blocked")
    expect(redone.document).toEqual(committed.document)
    expect(redone.definition).toEqual(committed.definition)
  })

  it("restores deleted subtrees and rejects current-state drift immutably", () => {
    const initial = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(initial, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    const committed = runVNextTableAuthoringV1(request)
    if (committed.status !== "committed") throw new Error("delete fixture blocked")
    const changeSet = createVNextTableAuthoringReversibleChangeSetV1({ request, result: committed })
    expect(changeSet.summary).toMatchObject({
      changedNodeCount: 4, changedRowTemplateCount: 1, rowSourcesChanged: true,
    })
    expect(changeSet.nodeChanges.filter((change) => change.after == null)).toHaveLength(3)

    const after = bundleAfter(initial, committed)
    const drifted = JSON.parse(JSON.stringify(after)) as VNextTableAuthoringBundleV1
    const table = drifted.document.document.sections[0].nodes.table
    if (table.type !== "table") throw new Error("table fixture missing")
    table.props.align = "center"
    const before = JSON.stringify(drifted)
    expect(applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: drifted, changeSet, direction: "undo",
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "change-set-current-fingerprint-mismatch" })],
    })
    expect(JSON.stringify(drifted)).toBe(before)

    const undone = applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: after, changeSet, direction: "undo",
    })
    if (undone.status !== "applied") throw new Error(JSON.stringify(undone.issues))
    expect(undone).toMatchObject({ status: "applied", document: initial.document, definition: initial.definition })
  })
})
