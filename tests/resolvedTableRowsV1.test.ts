import { describe, expect, it } from "vitest"
import { createVNextDerivedIdentityProvenanceV1 } from "../src/identity/identityAllocationInputV1.js"
import type {
  VNextAllocatedIdentityKindV1,
  VNextAllocatedIdentityV1,
  VNextDerivedIdentityOriginV1,
} from "../src/identity/identityStandardV1.js"
import {
  resolveVNextTableRowsV1,
  type VNextResolvedTableRowsRequestV1,
  type VNextTableCollectionIdentityAssignmentV1,
} from "../src/table/resolvedTableRowsV1.js"
import type { VNextTableDefinitionV1 } from "../src/table/tableDefinitionV1.js"
import type { VNextTableCollectionSnapshotV1 } from "../src/table/tableCollectionSnapshotV1.js"

const fingerprint = "table-resolution-input-1"

function instance() {
  return {
    contractVersion: 1 as const,
    kind: "document-instance" as const,
    instanceId: "order-report-instance",
    revision: 4,
    structureVersion: {
      structureId: "order-report",
      structureVersionId: "order-report-v3",
      versionOrdinal: 3,
    },
  }
}

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "orders-definition",
    owner: { kind: "published-structure-version", ref: instance().structureVersion },
    tableId: "orders-table",
    headerPolicy: "repeat-leading-headers",
    columns: [
      { columnId: "description", widthShare: 70 },
      { columnId: "amount", widthShare: 30 },
    ],
    rowSources: [
      { kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header", role: "header" },
      {
        kind: "collection-rows",
        rowSourceId: "items-source",
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
        cells: [{ cellId: "header-cell", columnStart: 0, colSpan: 2, rowSpan: 1 }],
      },
      item: {
        rowTemplateId: "item",
        sourceRowId: "item-row-template",
        breakPolicy: "prefer-keep",
        minHeightPt: 18,
        cells: [
          { cellId: "item-description", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "item-amount", columnStart: 1, colSpan: 1, rowSpan: 1 },
        ],
      },
      empty: {
        rowTemplateId: "empty",
        sourceRowId: "empty-row",
        breakPolicy: "strict-keep",
        cells: [{ cellId: "empty-cell", columnStart: 0, colSpan: 2, rowSpan: 1 }],
      },
      footer: {
        rowTemplateId: "footer",
        sourceRowId: "footer-row",
        breakPolicy: "strict-keep",
        cells: [{ cellId: "footer-cell", columnStart: 0, colSpan: 2, rowSpan: 1 }],
      },
    },
  }
}

function snapshot(items = [
  { itemKey: "item-b", values: { description: "B", amount: 20 } },
  { itemKey: "item-a", values: { description: "A", amount: 10 } },
]): VNextTableCollectionSnapshotV1 {
  return {
    contractVersion: 1,
    kind: "table-collection-snapshot",
    collectionSnapshotId: "orders-snapshot",
    snapshotRevision: 8,
    instance: instance(),
    collections: {
      "orders.items": { collectionFieldKey: "orders.items", items },
    },
  }
}

function allocatedIdentity(
  identityKind: "resolved-row" | "resolved-cell",
  id: string,
): VNextAllocatedIdentityV1 {
  const facts: Record<VNextAllocatedIdentityKindV1, Pick<VNextAllocatedIdentityV1, "identityClass" | "allocationOwner">> = {
    structure: { identityClass: "lifecycle-artifact", allocationOwner: "backend-lifecycle-service" },
    "structure-draft": { identityClass: "lifecycle-artifact", allocationOwner: "backend-lifecycle-service" },
    "published-structure-version": { identityClass: "lifecycle-artifact", allocationOwner: "backend-lifecycle-service" },
    "document-instance": { identityClass: "lifecycle-artifact", allocationOwner: "backend-lifecycle-service" },
    "resolved-row": { identityClass: "resolved-entity", allocationOwner: "resolution-orchestrator" },
    "resolved-cell": { identityClass: "resolved-entity", allocationOwner: "resolution-orchestrator" },
    "resolved-group": { identityClass: "resolved-entity", allocationOwner: "resolution-orchestrator" },
    "resolved-node": { identityClass: "resolved-entity", allocationOwner: "resolution-orchestrator" },
    "resolved-inline": { identityClass: "resolved-entity", allocationOwner: "resolution-orchestrator" },
    "layout-fragment": { identityClass: "layout-fragment", allocationOwner: "layout-engine" },
    request: { identityClass: "request", allocationOwner: "boundary-owner" },
    job: { identityClass: "job", allocationOwner: "backend-job-service" },
    artifact: { identityClass: "artifact", allocationOwner: "backend-artifact-service" },
  }
  return {
    contractVersion: 1,
    kind: "allocated-identity",
    identityKind,
    ...facts[identityKind],
    id,
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: instance().instanceId,
      instanceRevision: instance().revision,
      resolutionInputFingerprint: fingerprint,
    },
  }
}

function origin(itemKey: string, cellId?: string, rowInstanceId?: string): VNextDerivedIdentityOriginV1 {
  const refs = {
    tableId: "orders-table",
    rowSourceId: "items-source",
    rowTemplateId: "item",
    sourceRowId: "item-row-template",
    collectionFieldKey: "orders.items",
    itemKey,
    ...(cellId == null ? {} : { sourceCellId: cellId, rowInstanceId: rowInstanceId ?? "" }),
  }
  return {
    kind: cellId == null ? "collection-row" : "resolved-cell",
    refs,
    revisionPins: {
      structureVersionOrdinal: 3,
      instanceRevision: 4,
      collectionSnapshotRevision: 8,
    },
  }
}

function assignment(itemKey: string, ordinal: number): VNextTableCollectionIdentityAssignmentV1 {
  const rowId = `rowi_${String(ordinal).padStart(12, "0")}`
  const row = createVNextDerivedIdentityProvenanceV1(
    allocatedIdentity("resolved-row", rowId),
    origin(itemKey),
  )
  return {
    rowSourceId: "items-source",
    itemKey,
    row,
    cells: {
      "item-description": createVNextDerivedIdentityProvenanceV1(
        allocatedIdentity("resolved-cell", `celli_${String(ordinal * 10 + 1).padStart(12, "0")}`),
        origin(itemKey, "item-description", rowId),
      ),
      "item-amount": createVNextDerivedIdentityProvenanceV1(
        allocatedIdentity("resolved-cell", `celli_${String(ordinal * 10 + 2).padStart(12, "0")}`),
        origin(itemKey, "item-amount", rowId),
      ),
    },
  }
}

function request(): VNextResolvedTableRowsRequestV1 {
  return {
    contractVersion: 1,
    kind: "resolved-table-rows-request",
    instance: instance(),
    resolutionInputFingerprint: fingerprint,
    definition: definition(),
    fieldContract: {
      contractVersion: 1,
      kind: "published-field-contract",
      fieldContractId: "order-report-fields",
      owner: instance().structureVersion,
      registry: {
        version: 1,
        fields: {
          "orders.items": { key: "orders.items", label: "Order items", type: "collection" },
        },
      },
    },
    collectionSnapshot: snapshot(),
    identityAssignments: [assignment("item-b", 1), assignment("item-a", 2)],
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("resolved table rows v1", () => {
  it("resolves static and collection rows in snapshot order with retained identity provenance", () => {
    const input = request()
    const before = JSON.stringify(input)
    const result = resolveVNextTableRowsV1(input)

    expect(result.status).toBe("resolved")
    if (result.status !== "resolved") throw new Error("expected resolved table")
    expect(result.rows.map((row) => [row.role, row.source.kind])).toEqual([
      ["header", "static-row"],
      ["body", "collection-row"],
      ["body", "collection-row"],
      ["footer", "static-row"],
    ])
    expect(result.rows.slice(1, 3).map((row) => row.source.kind === "collection-row" && row.source.itemKey)).toEqual([
      "item-b",
      "item-a",
    ])
    expect(result.rows[1].identity).toMatchObject({
      kind: "allocated-row",
      provenance: { identity: { id: "rowi_000000000001" } },
    })
    expect(result.rows[1].cells.map((cell) => cell.identity.kind)).toEqual(["allocated-cell", "allocated-cell"])
    expect(result.rows[1].itemValues).toEqual({ description: "B", amount: 20 })
    expect(result.leadingHeaderRowCount).toBe(1)
    expect(result.execution).toEqual({
      inputFetch: "not-run",
      authoredGraphMutation: false,
      contentMaterialization: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("applies header-only and empty-row policies without allocating collection identities", () => {
    const emptyRowRequest = request()
    emptyRowRequest.collectionSnapshot = snapshot([])
    emptyRowRequest.identityAssignments = []
    const emptyRow = resolveVNextTableRowsV1(emptyRowRequest)
    expect(emptyRow.status).toBe("resolved")
    if (emptyRow.status === "resolved") expect(emptyRow.rows.map((row) => row.role)).toEqual([
      "header",
      "empty-state",
      "footer",
    ])

    const headerOnlyRequest = clone(emptyRowRequest)
    const source = headerOnlyRequest.definition.rowSources[1]
    if (source.kind !== "collection-rows") throw new Error("fixture shape")
    source.emptyPolicy = { kind: "header-only" }
    const headerOnly = resolveVNextTableRowsV1(headerOnlyRequest)
    expect(headerOnly.status).toBe("resolved")
    if (headerOnly.status === "resolved") expect(headerOnly.rows.map((row) => row.role)).toEqual(["header", "footer"])
  })

  it("resolves a static-only table without a collection snapshot", () => {
    const input = request()
    input.definition.rowSources = [input.definition.rowSources[0], input.definition.rowSources[2]]
    delete input.collectionSnapshot
    input.identityAssignments = []

    const result = resolveVNextTableRowsV1(input)
    expect(result.status).toBe("resolved")
    if (result.status === "resolved") {
      expect(result.collectionSnapshotId).toBeNull()
      expect(result.rows.map((row) => row.source.kind)).toEqual(["static-row", "static-row"])
      expect(result.rows.map((row) => row.identity.kind)).toEqual(["authored-row", "authored-row"])
    }
  })

  it("suppresses the whole table for hide-table and rejects unused allocations", () => {
    const input = request()
    input.collectionSnapshot = snapshot([])
    const source = input.definition.rowSources[1]
    if (source.kind !== "collection-rows") throw new Error("fixture shape")
    source.emptyPolicy = { kind: "hide-table" }
    input.identityAssignments = []
    expect(resolveVNextTableRowsV1(input)).toMatchObject({
      status: "suppressed",
      reason: "empty-collection-hide-table",
      rows: [],
    })

    input.identityAssignments = [assignment("item-b", 1)]
    const blocked = resolveVNextTableRowsV1(input)
    expect(blocked.status).toBe("blocked")
    expect(blocked.issues.map((issue) => issue.code)).toContain("suppressed-table-has-identity-assignments")
  })

  it("blocks missing and unexpected identity assignments", () => {
    const missing = request()
    missing.identityAssignments.pop()
    const missingResult = resolveVNextTableRowsV1(missing)
    expect(missingResult.status).toBe("blocked")
    expect(missingResult.issues.map((issue) => issue.code)).toContain("missing-identity-assignment")

    const extra = request()
    extra.identityAssignments.push(assignment("not-in-snapshot", 3))
    const extraResult = resolveVNextTableRowsV1(extra)
    expect(extraResult.status).toBe("blocked")
    expect(extraResult.issues.map((issue) => issue.code)).toContain("unexpected-identity-assignment")
  })

  it("blocks provenance drift and allocation-input key mismatch", () => {
    const input = request()
    input.identityAssignments[0].row.origin.refs.itemKey = "wrong-item"
    const result = resolveVNextTableRowsV1(input)
    expect(result.status).toBe("blocked")
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "identity-origin-refs-mismatch",
      "allocation-input-key-mismatch",
    ]))
  })

  it("blocks field capability and exact snapshot instance drift", () => {
    const input = request()
    input.fieldContract.registry.fields["orders.items"].type = "text"
    if (input.collectionSnapshot == null) throw new Error("fixture shape")
    input.collectionSnapshot.instance.revision += 1
    const result = resolveVNextTableRowsV1(input)
    expect(result.status).toBe("blocked")
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "collection-field-type-mismatch",
      "collection-snapshot-instance-mismatch",
    ]))
  })

  it("blocks duplicate allocated identities across row occurrences", () => {
    const input = request()
    input.identityAssignments[1].row = clone(input.identityAssignments[0].row)
    const result = resolveVNextTableRowsV1(input)
    expect(result.status).toBe("blocked")
    expect(result.issues.map((issue) => issue.code)).toContain("duplicate-identity")
  })
})
