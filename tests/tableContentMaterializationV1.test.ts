import { describe, expect, it } from "vitest"
import {
  createVNextDerivedIdentityProvenanceV1,
  materializeVNextTableContentV1,
  resolveVNextTableRowsV1,
  type DocumentNodeV4Target,
  type VNextAllocatedIdentityV1,
  type VNextDerivedIdentityOriginV1,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextResolvedTableRowsReadyV1,
  type VNextTableCollectionIdentityAssignmentV1,
  type VNextTableContentIdentityAssignmentsV1,
  type VNextTableContentMaterializationRequestV1,
  type VNextTableDefinitionV1,
} from "../src/index.js"

const owner = {
  structureId: "order-report",
  structureVersionId: "order-report-v3",
  versionOrdinal: 3,
}
const fingerprint = "table-materialization-input-1"

function mm(value: number) {
  return { value, unit: "mm" as const }
}

function document(): DocumentNodeV4Target {
  return {
    version: 4,
    document: {
      id: "order-instance",
      meta: { title: "Order report" },
      sections: [{
        id: "main",
        type: "section",
        page: {
          size: "A4", orientation: "portrait",
          margin: { top: mm(20), right: mm(20), bottom: mm(20), left: mm(20) },
        },
        zoneIds: ["body"],
        nodes: {
          body: { id: "body", type: "zone", role: "body", childIds: ["orders-table"] },
          "orders-table": {
            id: "orders-table", type: "table", props: { headerRowCount: 1 },
            columns: [{ width: mm(150) }], rowIds: ["header-row", "item-row"],
          },
          "header-row": { id: "header-row", type: "table-row", props: {}, cellIds: ["header-cell"] },
          "header-cell": { id: "header-cell", type: "table-cell", props: {}, childIds: ["header-text"] },
          "header-text": {
            id: "header-text", type: "text-block", role: { role: "paragraph" }, props: {},
            children: [{ id: "header-label", type: "text", text: "Items" }],
          },
          "item-row": { id: "item-row", type: "table-row", props: {}, cellIds: ["item-cell"] },
          "item-cell": {
            id: "item-cell", type: "table-cell", props: {},
            childIds: ["item-text", "image-logo", "item-divider", "item-spacer"],
          },
          "item-text": {
            id: "item-text", type: "text-block", role: { role: "paragraph" }, props: {},
            children: [
              { id: "label", type: "text", text: "Item " },
              { id: "inline-description", type: "field-ref", key: "description" },
              { id: "inline-customer", type: "field-ref", key: "customer.name" },
              {
                id: "image-photo", type: "inline-image",
                source: { kind: "image-field-ref", fieldKey: "photo", fallbackAssetId: "source-placeholder" },
                accessibility: { kind: "decorative" },
                frame: { width: mm(12), height: mm(6), fit: "contain" },
                verticalAlign: "baseline",
              },
            ],
          },
          "image-logo": {
            id: "image-logo", type: "image",
            source: { kind: "image-field-ref", fieldKey: "company.logo" },
            accessibility: { kind: "described", altText: "Company logo" },
            props: { frame: { width: mm(20), height: mm(10), fit: "contain" }, align: "center" },
          },
          "item-divider": {
            id: "item-divider", type: "divider",
            props: {
              color: "CBD5E1", thickness: { value: 1, unit: "pt" },
              marginBefore: { value: 2, unit: "pt" }, marginAfter: { value: 2, unit: "pt" }, style: "solid",
            },
          },
          "item-spacer": { id: "item-spacer", type: "spacer", props: { height: 4 } },
        },
      }],
    },
  }
}

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "orders-definition",
    owner: { kind: "published-structure-version", ref: { ...owner } },
    tableId: "orders-table",
    headerPolicy: "repeat-leading-headers",
    columns: [{ columnId: "content", widthShare: 100 }],
    rowSources: [
      { kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header", role: "header" },
      {
        kind: "collection-rows", rowSourceId: "items-source", collectionFieldKey: "orders.items",
        rowTemplateId: "item", role: "body", emptyPolicy: { kind: "header-only" },
      },
    ],
    rowTemplates: {
      header: {
        rowTemplateId: "header", sourceRowId: "header-row", breakPolicy: "strict-keep",
        cells: [{ cellId: "header-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
      item: {
        rowTemplateId: "item", sourceRowId: "item-row", breakPolicy: "prefer-keep",
        cells: [{ cellId: "item-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
    },
  }
}

function fieldContract(): VNextPublishedFieldContractV1 {
  return {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "order-fields",
    owner: { ...owner },
    registry: {
      version: 1,
      fields: {
        "orders.items": { key: "orders.items", label: "Items", type: "collection" },
        "customer.name": { key: "customer.name", label: "Customer", type: "text" },
        "company.logo": { key: "company.logo", label: "Logo", type: "image" },
      },
    },
  }
}

function itemContract(): VNextPublishedCollectionItemContractV1 {
  return {
    contractVersion: 1,
    kind: "published-collection-item-contract",
    collectionItemContractId: "item-fields",
    publishedFieldContractId: "order-fields",
    owner: { ...owner },
    collections: {
      "orders.items": {
        collectionFieldKey: "orders.items",
        fields: {
          description: { key: "description", label: "Description", type: "text", required: true },
          photo: {
            key: "photo", label: "Photo", type: "image", required: false,
            fallback: { kind: "published-asset-ref", assetId: "item-placeholder" },
          },
        },
      },
    },
  }
}

function bindingContract(): VNextPublishedTableContentBindingContractV1 {
  return {
    contractVersion: 1,
    kind: "published-table-content-binding-contract",
    tableContentBindingContractId: "content-bindings",
    owner: { ...owner },
    tableDefinitionId: "orders-definition",
    tableId: "orders-table",
    rowTemplates: {
      item: {
        rowTemplateId: "item",
        placements: {
          "inline-description": {
            sourcePlacementId: "inline-description", placementKind: "text-field-ref",
            binding: {
              scope: "collection-item-field", collectionFieldKey: "orders.items", itemFieldKey: "description",
            },
          },
          "inline-customer": {
            sourcePlacementId: "inline-customer", placementKind: "text-field-ref",
            binding: { scope: "document-field", fieldKey: "customer.name" },
          },
          "image-photo": {
            sourcePlacementId: "image-photo", placementKind: "image-field-ref",
            binding: {
              scope: "collection-item-field", collectionFieldKey: "orders.items", itemFieldKey: "photo",
            },
          },
          "image-logo": {
            sourcePlacementId: "image-logo", placementKind: "image-field-ref",
            binding: { scope: "document-field", fieldKey: "company.logo" },
          },
        },
      },
    },
  }
}

function allocatedIdentity(
  kind: "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline",
  id: string,
): VNextAllocatedIdentityV1 {
  return {
    contractVersion: 1, kind: "allocated-identity", identityKind: kind,
    identityClass: "resolved-entity", id,
    allocationOwner: "resolution-orchestrator", allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution", documentInstanceId: "order-instance",
      instanceRevision: 4, resolutionInputFingerprint: fingerprint,
    },
  }
}

function rowAssignment(itemKey: string, ordinal: number): VNextTableCollectionIdentityAssignmentV1 {
  const rowId = `rowi_${String(ordinal).padStart(12, "0")}`
  const rowOrigin: VNextDerivedIdentityOriginV1 = {
    kind: "collection-row",
    refs: {
      tableId: "orders-table", rowSourceId: "items-source", rowTemplateId: "item",
      sourceRowId: "item-row", collectionFieldKey: "orders.items", itemKey,
    },
    revisionPins: { structureVersionOrdinal: 3, instanceRevision: 4, collectionSnapshotRevision: 8 },
  }
  const row = createVNextDerivedIdentityProvenanceV1(allocatedIdentity("resolved-row", rowId), rowOrigin)
  return {
    rowSourceId: "items-source",
    itemKey,
    row,
    cells: {
      "item-cell": createVNextDerivedIdentityProvenanceV1(
        allocatedIdentity("resolved-cell", `celli_${String(ordinal).padStart(12, "0")}`),
        {
          kind: "resolved-cell",
          refs: { ...rowOrigin.refs, sourceCellId: "item-cell", rowInstanceId: rowId },
          revisionPins: rowOrigin.revisionPins,
        },
      ),
    },
  }
}

function resolvedRows(): VNextResolvedTableRowsReadyV1 {
  const result = resolveVNextTableRowsV1({
    contractVersion: 1,
    kind: "resolved-table-rows-request",
    instance: {
      contractVersion: 1, kind: "document-instance", instanceId: "order-instance", revision: 4,
      structureVersion: { ...owner },
    },
    resolutionInputFingerprint: fingerprint,
    definition: definition(),
    fieldContract: fieldContract(),
    collectionSnapshot: {
      contractVersion: 1, kind: "table-collection-snapshot",
      collectionSnapshotId: "items-snapshot", snapshotRevision: 8,
      instance: {
        contractVersion: 1, kind: "document-instance", instanceId: "order-instance", revision: 4,
        structureVersion: { ...owner },
      },
      collections: {
        "orders.items": {
          collectionFieldKey: "orders.items",
          items: [
            { itemKey: "item-a", values: { description: "Alpha", photo: { kind: "image-asset-ref", assetId: "photo-a" } } },
            { itemKey: "item-b", values: { description: "Beta" } },
          ],
        },
      },
    },
    identityAssignments: [rowAssignment("item-a", 1), rowAssignment("item-b", 2)],
  })
  if (result.status !== "resolved") throw new Error("resolved rows fixture failed")
  return result
}

function contentAssignments(rows: VNextResolvedTableRowsReadyV1): VNextTableContentIdentityAssignmentsV1 {
  const sourceNodeIds = ["item-text", "image-logo", "item-divider", "item-spacer"]
  const sourceInlineIds = ["label", "inline-description", "inline-customer", "image-photo"]
  return {
    contractVersion: 1,
    kind: "table-content-identity-assignments",
    rows: rows.rows.flatMap((row, rowIndex) => {
      if (row.source.kind !== "collection-row" || row.identity.kind !== "allocated-row") return []
      const rowOrdinal = rowIndex
      const rowInstanceId = row.identity.provenance.identity.id
      const cell = row.cells[0]
      if (cell.identity.kind !== "allocated-cell") throw new Error("cell fixture")
      const cellInstanceId = cell.identity.provenance.identity.id
      const rowRefs = {
        tableId: "orders-table", rowSourceId: "items-source", rowTemplateId: "item",
        sourceRowId: "item-row", collectionFieldKey: "orders.items", itemKey: row.source.itemKey,
        rowInstanceId,
      }
      const revisionPins = { structureVersionOrdinal: 3, instanceRevision: 4, collectionSnapshotRevision: 8 }
      const nodes = Object.fromEntries(sourceNodeIds.map((sourceNodeId, nodeIndex) => {
        const nodeId = `nodei_${String(rowOrdinal * 10 + nodeIndex + 1).padStart(12, "0")}`
        const nodeRefs = { ...rowRefs, sourceCellId: "item-cell", cellInstanceId, sourceNodeId }
        const node = createVNextDerivedIdentityProvenanceV1(
          allocatedIdentity("resolved-node", nodeId),
          { kind: "resolved-node", refs: nodeRefs, revisionPins },
        )
        const inlines = sourceNodeId === "item-text"
          ? Object.fromEntries(sourceInlineIds.map((sourceInlineId, inlineIndex) => [
              sourceInlineId,
              createVNextDerivedIdentityProvenanceV1(
                allocatedIdentity(
                  "resolved-inline",
                  `inli_${String(rowOrdinal * 10 + inlineIndex + 1).padStart(12, "0")}`,
                ),
                {
                  kind: "resolved-inline",
                  refs: {
                    ...nodeRefs, sourceTextBlockId: "item-text", sourceInlineId, resolvedNodeId: nodeId,
                  },
                  revisionPins,
                },
              ),
            ]))
          : {}
        return [sourceNodeId, { sourceNodeId, node, inlines }]
      }))
      return [{
        rowInstanceId,
        cells: { "item-cell": { sourceCellId: "item-cell", nodes } },
      }]
    }),
  }
}

function request(): VNextTableContentMaterializationRequestV1 {
  const rows = resolvedRows()
  return {
    contractVersion: 1,
    kind: "table-content-materialization-request",
    document: document(),
    definition: definition(),
    fieldContract: fieldContract(),
    itemContract: itemContract(),
    bindingContract: bindingContract(),
    resolvedRows: rows,
    identityAssignments: contentAssignments(rows),
    globalBindings: {
      contractVersion: 1,
      kind: "table-global-resolved-bindings",
      instanceId: "order-instance",
      instanceRevision: 4,
      resolutionInputFingerprint: fingerprint,
      text: {
        "inline-customer": {
          sourcePlacementId: "inline-customer", fieldKey: "customer.name",
          value: "Example Customer", valueSource: "data-snapshot",
        },
      },
      images: {
        "image-logo": {
          sourcePlacementId: "image-logo", fieldKey: "company.logo", assetId: "logo-asset",
          assetOwner: "instance-media", valueSource: "data-snapshot",
        },
      },
    },
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("table content materialization v1", () => {
  it("clones collection content and emits separate item/global bindings", () => {
    const input = request()
    const before = JSON.stringify(input)
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("materialized")
    if (result.status !== "materialized") throw new Error("expected materialized result")
    expect(result.rows.map((row) => row.kind)).toEqual([
      "authored-content-reference",
      "materialized-content",
      "materialized-content",
    ])
    const materialized = result.rows.filter((row) => row.kind === "materialized-content")
    expect(materialized[0].cells[0].childIds).toHaveLength(4)
    expect(Object.values(materialized[0].cells[0].nodes).map((node) => node.type)).toEqual([
      "text-block", "image", "divider", "spacer",
    ])
    const textNode = Object.values(materialized[0].cells[0].nodes).find((node) => node.type === "text-block")
    if (textNode?.type !== "text-block") throw new Error("missing cloned text")
    expect(textNode.id).toMatch(/^nodei_/)
    expect(textNode.children.map((inline) => inline.id).every((id) => id.startsWith("inli_"))).toBe(true)
    expect(textNode.children.find((inline) => inline.type === "field-ref")).toMatchObject({
      type: "field-ref", key: "description",
    })
    expect(result.bindings.text.map((binding) => [binding.scope, binding.value])).toEqual([
      ["collection-item-field", "Alpha"],
      ["document-field", "Example Customer"],
      ["collection-item-field", "Beta"],
      ["document-field", "Example Customer"],
    ])
    expect(result.bindings.images.map((binding) => [binding.scope, binding.assetId, binding.valueSource])).toEqual([
      ["collection-item-field", "photo-a", "item-snapshot"],
      ["document-field", "logo-asset", "resolved-document"],
      ["collection-item-field", "item-placeholder", "item-contract-fallback"],
      ["document-field", "logo-asset", "resolved-document"],
    ])
    expect(result.provenance).toHaveLength(16)
    expect(result.work).toEqual({
      rowCount: 3,
      materializedRowCount: 2,
      authoredReferenceRowCount: 1,
      cellCount: 3,
      clonedNodeCount: 8,
      clonedInlineCount: 8,
      textBindingCount: 4,
      imageBindingCount: 4,
      sourcePlanDocumentRootScans: 1,
      materializationDocumentRootScans: 1,
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks missing global and inline identity assignments without partial output", () => {
    const input = request()
    delete input.globalBindings.text["inline-customer"]
    const firstRow = input.identityAssignments.rows[0]
    delete firstRow.cells["item-cell"].nodes["item-text"].inlines["inline-description"]
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("blocked")
    expect(result.rows).toBeNull()
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "missing-global-text-binding",
      "missing-inline-content-assignment",
    ]))
  })

  it("blocks content provenance drift and duplicate allocated ids", () => {
    const input = request()
    const first = input.identityAssignments.rows[0].cells["item-cell"].nodes["item-text"]
    first.node.origin.refs.sourceNodeId = "wrong-node"
    input.identityAssignments.rows[1].cells["item-cell"].nodes["item-text"].node = clone(first.node)
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "content-origin-refs-mismatch",
      "allocation-input-key-mismatch",
      "duplicate-identity",
    ]))
  })

  it("re-audits resolved row provenance at the materialization boundary", () => {
    const input = request()
    const collectionRow = input.resolvedRows.rows.find((row) => row.source.kind === "collection-row")
    if (collectionRow?.identity.kind !== "allocated-row") throw new Error("row fixture")
    collectionRow.identity.provenance.origin.refs.itemKey = "wrong-item"
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "content-origin-refs-mismatch",
      "allocation-input-key-mismatch",
    ]))
  })

  it("distinguishes explicit null, item-contract fallback, and authored placement fallback", () => {
    const explicitNull = request()
    const explicitNullRows = explicitNull.resolvedRows.rows.filter((row) => row.source.kind === "collection-row")
    explicitNullRows[1].itemValues = { description: "Beta", photo: null }
    const nullResult = materializeVNextTableContentV1(explicitNull)
    expect(nullResult.status).toBe("materialized")
    if (nullResult.status === "materialized") {
      expect(nullResult.bindings.images.filter((binding) => binding.scope === "collection-item-field")[1]).toMatchObject({
        assetId: null,
        assetOwner: "none",
        valueSource: "explicit-null",
      })
    }

    const authoredFallback = request()
    delete authoredFallback.itemContract.collections["orders.items"].fields.photo.fallback
    const fallbackResult = materializeVNextTableContentV1(authoredFallback)
    expect(fallbackResult.status).toBe("materialized")
    if (fallbackResult.status === "materialized") {
      expect(fallbackResult.bindings.images.filter((binding) => binding.scope === "collection-item-field")[1]).toMatchObject({
        assetId: "source-placeholder",
        assetOwner: "published-static-media",
        valueSource: "authored-placement-fallback",
      })
    }
  })

  it("reorders collection rows without changing item-derived row/content identities", () => {
    const originalInput = request()
    const original = materializeVNextTableContentV1(originalInput)
    const reorderedInput = clone(originalInput)
    const header = reorderedInput.resolvedRows.rows[0]
    reorderedInput.resolvedRows.rows = [
      header,
      ...reorderedInput.resolvedRows.rows.slice(1).reverse(),
    ]
    const reordered = materializeVNextTableContentV1(reorderedInput)
    expect(original.status).toBe("materialized")
    expect(reordered.status).toBe("materialized")
    if (original.status !== "materialized" || reordered.status !== "materialized") return
    const identityByItem = (rows: typeof original.rows) => Object.fromEntries(
      rows.flatMap((row) => row.kind === "materialized-content" ? [[row.itemKey, row.rowInstanceId]] : []),
    )
    expect(identityByItem(reordered.rows)).toEqual(identityByItem(original.rows))
    expect(reordered.rows.filter((row) => row.kind === "materialized-content").map((row) => row.itemKey)).toEqual([
      "item-b",
      "item-a",
    ])
  })

  it("blocks missing required, unknown, and type-invalid item values", () => {
    const input = request()
    const rows = input.resolvedRows.rows.filter((row) => row.source.kind === "collection-row")
    rows[0].itemValues = { unknown: "value" }
    rows[1].itemValues = { description: 42 }
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "unknown-item-field",
      "missing-required-item-field",
      "item-field-type-mismatch",
    ]))
  })

  it("blocks document, row stream, and global binding scope drift", () => {
    const input = request()
    input.document.document.id = "other-instance"
    input.globalBindings.instanceRevision = 5
    input.resolvedRows.tableDefinitionId = "other-definition"
    const result = materializeVNextTableContentV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "document-instance-id-mismatch",
      "resolved-row-table-mismatch",
      "global-binding-scope-mismatch",
    ]))
  })
})
