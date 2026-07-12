import { describe, expect, it } from "vitest"
import {
  applyVNextTableAuthoringReversibleChangeSetV1,
  commitGuardedVNextTableAuthoringV1,
  previewVNextTableAuthoringV1,
  runVNextTableAuthoringV1,
  type VNextTableAuthoringBundleV1,
} from "../src/index.js"
import {
  createTableAuthoringBundle,
  createTableAuthoringRequest,
} from "./helpers/tableAuthoringV1Fixture.js"

const ROW_COUNT = 1_000

describe("Table v4 authoring scale", () => {
  it("inserts one stable column across 1,000 row templates with exact linear work", () => {
    const bundle = createTableAuthoringBundle(ROW_COUNT)
    const cellIdsByRowTemplateId = Object.fromEntries(Array.from(
      { length: ROW_COUNT }, (_, index) => [`template-${index}`, `cell-${index}-middle`],
    ))
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.column.insert", tableId: "table", index: 1,
      columnId: "middle", widthShare: 20, cellIdsByRowTemplateId,
    })
    const before = JSON.stringify(request)
    const first = runVNextTableAuthoringV1(request)
    const second = runVNextTableAuthoringV1(request)

    expect(first.status).toBe("committed")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "committed") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.operation.work).toEqual({
      rowTemplateVisitCount: ROW_COUNT, cellVisitCount: ROW_COUNT * 3, subtreeNodeVisitCount: 0,
    })
    expect(first.operation.identity.addedNodeIds).toHaveLength(ROW_COUNT)
    expect(first.definition.columns).toEqual([
      { columnId: "left", widthShare: 40 },
      { columnId: "middle", widthShare: 20 },
      { columnId: "right", widthShare: 40 },
    ])
    const table = first.document.document.sections[0].nodes.table
    expect(table).toMatchObject({
      columns: [
        { width: { value: 160, unit: "pt" } },
        { width: { value: 80, unit: "pt" } },
        { width: { value: 160, unit: "pt" } },
      ],
    })
    expect(first.document.document.sections[0].nodes["row-999"]).toMatchObject({
      cellIds: ["cell-999-left", "cell-999-middle", "cell-999-right"],
    })
    expect(JSON.stringify(request)).toBe(before)
  })

  it("previews, commits, undoes, and redoes 1,000-row work within exact budgets", () => {
    const bundle = createTableAuthoringBundle(ROW_COUNT)
    const cellIdsByRowTemplateId = Object.fromEntries(Array.from(
      { length: ROW_COUNT }, (_, index) => [`template-${index}`, `cell-${index}-middle`],
    ))
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.column.insert", tableId: "table", index: 1,
      columnId: "middle", widthShare: 20, cellIdsByRowTemplateId,
    })
    const budgets = {
      maximumRowTemplateVisits: ROW_COUNT,
      maximumAffectedNodeCount: 4_001,
      maximumRemovedSubtreeNodeCount: 1,
    }
    const preview = previewVNextTableAuthoringV1({ request, budgets })
    expect(JSON.stringify(previewVNextTableAuthoringV1({ request, budgets }))).toBe(JSON.stringify(preview))
    expect(preview).toMatchObject({
      status: "ready", confirmationRequired: false,
      impact: {
        uniqueAffectedNodeCount: 4_001,
        removedSubtreeNodeCount: 0,
        work: { rowTemplateVisitCount: ROW_COUNT, cellVisitCount: ROW_COUNT * 3 },
      },
      changeSetSummary: { changedNodeCount: 2_001, changedRowTemplateCount: ROW_COUNT },
    })
    const committed = commitGuardedVNextTableAuthoringV1({ request, budgets })
    expect(JSON.stringify(commitGuardedVNextTableAuthoringV1({ request, budgets }))).toBe(JSON.stringify(committed))
    expect(committed.status).toBe("committed")
    if (committed.status !== "committed") throw new Error(committed.issues.map((item) => item.message).join("\n"))

    const after: VNextTableAuthoringBundleV1 = {
      ...bundle, document: committed.document, definition: committed.definition,
    }
    const undone = applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: after, changeSet: committed.changeSet, direction: "undo",
    })
    expect(undone.status).toBe("applied")
    if (undone.status !== "applied") throw new Error(undone.issues.map((item) => item.message).join("\n"))
    expect(undone).toMatchObject({
      document: bundle.document, definition: bundle.definition,
      work: { nodeChangeCount: 2_001, rowTemplateChangeCount: ROW_COUNT },
    })
    const redone = applyVNextTableAuthoringReversibleChangeSetV1({
      bundle: { ...bundle, document: undone.document, definition: undone.definition },
      changeSet: committed.changeSet, direction: "redo",
    })
    expect(redone).toMatchObject({
      status: "applied", document: committed.document, definition: committed.definition,
    })
  }, 15_000)

  it("blocks one unit below exact row-template and affected-node scale budgets", () => {
    const bundle = createTableAuthoringBundle(ROW_COUNT)
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.column.insert", tableId: "table", index: 1,
      columnId: "middle", widthShare: 20,
      cellIdsByRowTemplateId: Object.fromEntries(Array.from(
        { length: ROW_COUNT }, (_, index) => [`template-${index}`, `cell-${index}-middle`],
      )),
    })
    expect(previewVNextTableAuthoringV1({
      request,
      budgets: {
        maximumRowTemplateVisits: ROW_COUNT - 1,
        maximumAffectedNodeCount: 4_001,
        maximumRemovedSubtreeNodeCount: 1,
      },
    })).toMatchObject({
      status: "blocked", reason: "execution-budget-exceeded",
      issues: [expect.objectContaining({ code: "row-template-visit-budget-exceeded" })],
    })
    expect(previewVNextTableAuthoringV1({
      request,
      budgets: {
        maximumRowTemplateVisits: ROW_COUNT,
        maximumAffectedNodeCount: 4_000,
        maximumRemovedSubtreeNodeCount: 1,
      },
    })).toMatchObject({
      status: "blocked", reason: "execution-budget-exceeded",
      issues: [expect.objectContaining({ code: "affected-node-budget-exceeded" })],
    })
  })
})
