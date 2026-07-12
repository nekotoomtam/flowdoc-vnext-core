import { describe, expect, it } from "vitest"
import { createVNextTablePreparedCellImpactV1 } from "../src/index.js"

describe("prepared Table cell impact v1", () => {
  it("keeps item changes row-scoped and invalidates measurement through render", () => {
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table",
      changeKind: "item-value",
      affectedRows: [{ rowKey: "item-1", sourceCellIds: ["description-cell"] }],
    })).toEqual({
      source: "vnext-table-prepared-cell-impact",
      contractVersion: 1,
      status: "ready",
      tableId: "orders-table",
      changeKind: "item-value",
      scope: "rows",
      affectedRows: [{ rowKey: "item-1", sourceCellIds: ["description-cell"] }],
      earliestAffectedRowIndex: null,
      invalidationLanes: ["measurement", "preparation", "pagination", "render"],
      retainedFacts: {
        authoredIdentity: true, resolvedIdentity: true,
        preparedFingerprint: false, measurementEvidence: false,
      },
      issues: [],
    })
  })

  it("makes width/profile changes table-wide and row order pagination-tail only", () => {
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table", changeKind: "table-width",
    })).toMatchObject({
      status: "ready", scope: "table",
      invalidationLanes: ["measurement", "preparation", "pagination", "render"],
    })
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table", changeKind: "row-order", earliestAffectedRowIndex: 20,
    })).toMatchObject({
      status: "ready", scope: "row-order-tail", earliestAffectedRowIndex: 20,
      invalidationLanes: ["pagination", "render"],
      retainedFacts: { preparedFingerprint: true, measurementEvidence: true },
    })
  })

  it("requires explicit local rows, earliest reorder index, and unique facts", () => {
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table", changeKind: "text-style",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "missing-affected-rows" })] })
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table", changeKind: "row-order",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "missing-earliest-affected-row" })] })
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "orders-table", changeKind: "source-content",
      affectedRows: [
        { rowKey: "item-1", sourceCellIds: ["cell-1", "cell-1"] },
        { rowKey: "item-1", sourceCellIds: ["cell-2"] },
      ],
    })).toMatchObject({ status: "blocked", issues: expect.arrayContaining([
      expect.objectContaining({ code: "duplicate-affected-row" }),
      expect.objectContaining({ code: "duplicate-affected-cell" }),
    ]) })
  })
})
