import { describe, expect, it } from "vitest"
import { runVNextTableAuthoringV1 } from "../src/index.js"
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
})
