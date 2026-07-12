import { describe, expect, it } from "vitest"
import {
  createVNextDerivedIdentityProvenanceV1,
  materializeVNextTableContentV1,
  type VNextAllocatedIdentityV1,
  type VNextDerivedIdentityOriginV1,
  type VNextResolvedTableRowsReadyV1,
  type VNextTableContentIdentityAssignmentsV1,
  type VNextTableContentMaterializationRequestV1,
} from "../src/index.js"

const ROW_COUNT = 1_000
const fingerprint = "table-content-scale-v1"
const owner = { structureId: "scale", structureVersionId: "scale-v1", versionOrdinal: 1 }

function allocatedIdentity(
  kind: "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline",
  id: string,
): VNextAllocatedIdentityV1 {
  return {
    contractVersion: 1, kind: "allocated-identity", identityKind: kind,
    identityClass: "resolved-entity", id,
    allocationOwner: "resolution-orchestrator", allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution", documentInstanceId: "scale-instance",
      instanceRevision: 1, resolutionInputFingerprint: fingerprint,
    },
  }
}

function input(): VNextTableContentMaterializationRequestV1 {
  const document: VNextTableContentMaterializationRequestV1["document"] = {
    version: 4,
    document: {
      id: "scale-instance",
      meta: { title: "Scale" },
      sections: [{
        id: "main",
        type: "section",
        page: {
          size: "A4", orientation: "portrait",
          margin: {
            top: { value: 20, unit: "mm" }, right: { value: 20, unit: "mm" },
            bottom: { value: 20, unit: "mm" }, left: { value: 20, unit: "mm" },
          },
        },
        zoneIds: ["body"],
        nodes: {
          body: { id: "body", type: "zone", role: "body", childIds: ["scale-table"] },
          "scale-table": {
            id: "scale-table", type: "table", props: {},
            columns: [{ width: { value: 150, unit: "mm" } }], rowIds: ["item-row"],
          },
          "item-row": { id: "item-row", type: "table-row", props: {}, cellIds: ["item-cell"] },
          "item-cell": { id: "item-cell", type: "table-cell", props: {}, childIds: ["item-text"] },
          "item-text": {
            id: "item-text", type: "text-block", role: { role: "paragraph" }, props: {},
            children: [{ id: "description-field", type: "field-ref", key: "description" }],
          },
        },
      }],
    },
  }
  const definition: VNextTableContentMaterializationRequestV1["definition"] = {
    contractVersion: 1, kind: "table-definition", tableDefinitionId: "scale-definition",
    owner: { kind: "published-structure-version", ref: { ...owner } },
    tableId: "scale-table", headerPolicy: "no-repeat",
    columns: [{ columnId: "content", widthShare: 100 }],
    rowSources: [{
      kind: "collection-rows", rowSourceId: "items-source", collectionFieldKey: "items",
      rowTemplateId: "item", role: "body", emptyPolicy: { kind: "header-only" },
    }],
    rowTemplates: {
      item: {
        rowTemplateId: "item", sourceRowId: "item-row", breakPolicy: "prefer-keep",
        cells: [{ cellId: "item-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
    },
  }
  const fieldContract: VNextTableContentMaterializationRequestV1["fieldContract"] = {
    contractVersion: 1, kind: "published-field-contract", fieldContractId: "scale-fields",
    owner: { ...owner },
    registry: { version: 1, fields: { items: { key: "items", label: "Items", type: "collection" } } },
  }
  const itemContract: VNextTableContentMaterializationRequestV1["itemContract"] = {
    contractVersion: 1, kind: "published-collection-item-contract",
    collectionItemContractId: "scale-item-fields", publishedFieldContractId: "scale-fields",
    owner: { ...owner },
    collections: {
      items: {
        collectionFieldKey: "items",
        fields: { description: { key: "description", label: "Description", type: "text", required: true } },
      },
    },
  }
  const bindingContract: VNextTableContentMaterializationRequestV1["bindingContract"] = {
    contractVersion: 1, kind: "published-table-content-binding-contract",
    tableContentBindingContractId: "scale-bindings", owner: { ...owner },
    tableDefinitionId: "scale-definition", tableId: "scale-table",
    rowTemplates: {
      item: {
        rowTemplateId: "item",
        placements: {
          "description-field": {
            sourcePlacementId: "description-field", placementKind: "text-field-ref",
            binding: { scope: "collection-item-field", collectionFieldKey: "items", itemFieldKey: "description" },
          },
        },
      },
    },
  }

  const rows: VNextResolvedTableRowsReadyV1["rows"] = []
  const contentRows: VNextTableContentIdentityAssignmentsV1["rows"] = []
  for (let index = 0; index < ROW_COUNT; index += 1) {
    const ordinal = index + 1
    const itemKey = `item-${String(ordinal).padStart(6, "0")}`
    const rowId = `rowi_${String(ordinal).padStart(12, "0")}`
    const cellId = `celli_${String(ordinal).padStart(12, "0")}`
    const nodeId = `nodei_${String(ordinal).padStart(12, "0")}`
    const inlineId = `inli_${String(ordinal).padStart(12, "0")}`
    const revisionPins = { structureVersionOrdinal: 1, instanceRevision: 1, collectionSnapshotRevision: 1 }
    const baseRefs = {
      tableId: "scale-table", rowSourceId: "items-source", rowTemplateId: "item",
      sourceRowId: "item-row", collectionFieldKey: "items", itemKey,
    }
    const row = createVNextDerivedIdentityProvenanceV1(
      allocatedIdentity("resolved-row", rowId),
      { kind: "collection-row", refs: baseRefs, revisionPins },
    )
    const cell = createVNextDerivedIdentityProvenanceV1(
      allocatedIdentity("resolved-cell", cellId),
      { kind: "resolved-cell", refs: { ...baseRefs, sourceCellId: "item-cell", rowInstanceId: rowId }, revisionPins },
    )
    rows.push({
      identity: { kind: "allocated-row", provenance: row },
      source: {
        kind: "collection-row", rowSourceId: "items-source", rowTemplateId: "item",
        sourceRowId: "item-row", collectionFieldKey: "items", itemKey,
      },
      role: "body", breakPolicy: "prefer-keep",
      itemValues: { description: `Description ${ordinal}` },
      cells: [{
        cellId: "item-cell", columnStart: 0, colSpan: 1, rowSpan: 1,
        identity: { kind: "allocated-cell", provenance: cell }, sourceCellId: "item-cell",
      }],
    })
    const nodeRefs = {
      ...baseRefs, rowInstanceId: rowId, sourceCellId: "item-cell",
      cellInstanceId: cellId, sourceNodeId: "item-text",
    }
    const node = createVNextDerivedIdentityProvenanceV1(
      allocatedIdentity("resolved-node", nodeId),
      { kind: "resolved-node", refs: nodeRefs, revisionPins },
    )
    const inline = createVNextDerivedIdentityProvenanceV1(
      allocatedIdentity("resolved-inline", inlineId),
      {
        kind: "resolved-inline",
        refs: {
          ...nodeRefs, sourceTextBlockId: "item-text", sourceInlineId: "description-field", resolvedNodeId: nodeId,
        },
        revisionPins,
      },
    )
    contentRows.push({
      rowInstanceId: rowId,
      cells: {
        "item-cell": {
          sourceCellId: "item-cell",
          nodes: {
            "item-text": {
              sourceNodeId: "item-text", node,
              inlines: { "description-field": inline },
            },
          },
        },
      },
    })
  }

  return {
    contractVersion: 1,
    kind: "table-content-materialization-request",
    document,
    definition,
    fieldContract,
    itemContract,
    bindingContract,
    resolvedRows: {
      source: "vnext-resolved-table-rows", contractVersion: 1, status: "resolved",
      tableId: "scale-table", tableDefinitionId: "scale-definition",
      instanceId: "scale-instance", instanceRevision: 1, resolutionInputFingerprint: fingerprint,
      collectionSnapshotId: "scale-snapshot", collectionSnapshotRevision: 1,
      columns: [{ columnId: "content", widthShare: 100 }], headerPolicy: "no-repeat",
      leadingHeaderRowCount: 0, rows,
      execution: {
        inputFetch: "not-run", authoredGraphMutation: false, contentMaterialization: "not-run",
        measurement: "not-run", pagination: "not-run", rendering: "not-run",
      },
      issues: [],
    },
    identityAssignments: {
      contractVersion: 1, kind: "table-content-identity-assignments", rows: contentRows,
    },
    globalBindings: {
      contractVersion: 1, kind: "table-global-resolved-bindings",
      instanceId: "scale-instance", instanceRevision: 1, resolutionInputFingerprint: fingerprint,
      text: {}, images: {},
    },
  }
}

describe("table content materialization v1 scale", () => {
  it("materializes 1,000 rows deterministically with bounded factual work", () => {
    const request = input()
    const before = JSON.stringify(request)
    const startedAt = performance.now()
    const first = materializeVNextTableContentV1(request)
    const durationMs = performance.now() - startedAt
    const second = materializeVNextTableContentV1(request)

    expect(first.status).toBe("materialized")
    expect(second.status).toBe("materialized")
    if (first.status !== "materialized" || second.status !== "materialized") {
      throw new Error("scale materialization blocked")
    }
    expect(first.rows).toHaveLength(ROW_COUNT)
    expect(first.bindings.text).toHaveLength(ROW_COUNT)
    expect(first.provenance).toHaveLength(ROW_COUNT * 2)
    expect(first.work).toEqual({
      rowCount: ROW_COUNT,
      materializedRowCount: ROW_COUNT,
      authoredReferenceRowCount: 0,
      cellCount: ROW_COUNT,
      clonedNodeCount: ROW_COUNT,
      clonedInlineCount: ROW_COUNT,
      textBindingCount: ROW_COUNT,
      imageBindingCount: 0,
      sourcePlanDocumentRootScans: 1,
      materializationDocumentRootScans: 1,
    })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(JSON.stringify(request)).toBe(before)
    expect(durationMs).toBeLessThan(5_000)
  }, 15_000)
})
