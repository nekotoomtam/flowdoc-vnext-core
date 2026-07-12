import { describe, expect, it } from "vitest"
import { createVNextDerivedIdentityProvenanceV1 } from "../src/identity/identityAllocationInputV1.js"
import type { VNextAllocatedIdentityV1 } from "../src/identity/identityStandardV1.js"
import { VNextTableContentIdentityAssignmentsV1Schema } from "../src/table/tableContentIdentityAssignmentsV1.js"

function identity(kind: "resolved-node" | "resolved-inline", id: string): VNextAllocatedIdentityV1 {
  return {
    contractVersion: 1,
    kind: "allocated-identity",
    identityKind: kind,
    identityClass: "resolved-entity",
    id,
    allocationOwner: "resolution-orchestrator",
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: "order-instance",
      instanceRevision: 4,
      resolutionInputFingerprint: "resolution-1",
    },
  }
}

function assignments() {
  const node = createVNextDerivedIdentityProvenanceV1(
    identity("resolved-node", "nodei_000000000001"),
    {
      kind: "resolved-node",
      refs: { sourceNodeId: "item-text", rowInstanceId: "rowi_000000000001" },
      revisionPins: { instanceRevision: 4 },
    },
  )
  const inline = createVNextDerivedIdentityProvenanceV1(
    identity("resolved-inline", "inli_000000000001"),
    {
      kind: "resolved-inline",
      refs: {
        sourceNodeId: "item-text",
        sourceInlineId: "inline-description",
        rowInstanceId: "rowi_000000000001",
      },
      revisionPins: { instanceRevision: 4 },
    },
  )
  return {
    contractVersion: 1,
    kind: "table-content-identity-assignments",
    rows: [{
      rowInstanceId: "rowi_000000000001",
      cells: {
        "description-cell": {
          sourceCellId: "description-cell",
          nodes: {
            "item-text": {
              sourceNodeId: "item-text",
              node,
              inlines: { "inline-description": inline },
            },
          },
        },
      },
    }],
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("table content identity assignments v1", () => {
  it("accepts strict row/cell/node/inline source-keyed assignments", () => {
    const input = assignments()
    expect(VNextTableContentIdentityAssignmentsV1Schema.parse(input)).toEqual(input)
    expect(JSON.parse(JSON.stringify(input))).toEqual(input)
  })

  it("blocks row, cell, node, and inline source-key drift", () => {
    const input = clone(assignments())
    const row = input.rows[0]
    row.cells["description-cell"].sourceCellId = "wrong-cell"
    row.cells["description-cell"].nodes["item-text"].sourceNodeId = "wrong-node"
    row.cells["description-cell"].nodes["item-text"].inlines["inline-description"].origin.refs.sourceInlineId = "wrong-inline"
    const result = VNextTableContentIdentityAssignmentsV1Schema.safeParse(input)

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.map((item) => item.path.join("."))).toEqual(expect.arrayContaining([
      "rows.0.cells.description-cell.sourceCellId",
      "rows.0.cells.description-cell.nodes.item-text.sourceNodeId",
      "rows.0.cells.description-cell.nodes.item-text.inlines.inline-description.origin.refs.sourceInlineId",
    ]))
  })

  it("blocks duplicate row assignment ids and unknown metadata", () => {
    const input = assignments()
    input.rows.push(clone(input.rows[0]))
    expect(VNextTableContentIdentityAssignmentsV1Schema.safeParse(input).success).toBe(false)
    expect(VNextTableContentIdentityAssignmentsV1Schema.safeParse({
      ...assignments(),
      allocatedByCore: true,
    }).success).toBe(false)
  })
})
