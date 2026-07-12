import { describe, expect, it } from "vitest"
import {
  createVNextTableContentSourcePlanV1,
  type DocumentNodeV4Target,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextTableDefinitionV1,
} from "../src/index.js"

const owner = {
  structureId: "order-report",
  structureVersionId: "order-report-v3",
  versionOrdinal: 3,
}

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
          size: "A4",
          orientation: "portrait",
          margin: { top: mm(20), right: mm(20), bottom: mm(20), left: mm(20) },
        },
        zoneIds: ["body"],
        nodes: {
          body: { id: "body", type: "zone", role: "body", childIds: ["orders-table"] },
          "orders-table": {
            id: "orders-table",
            type: "table",
            props: {},
            columns: [{ width: mm(100) }, { width: mm(50) }],
            rowIds: ["item-row"],
          },
          "item-row": {
            id: "item-row", type: "table-row", props: {}, cellIds: ["description-cell", "photo-cell"],
          },
          "description-cell": {
            id: "description-cell", type: "table-cell", props: {}, childIds: ["item-text"],
          },
          "photo-cell": {
            id: "photo-cell", type: "table-cell", props: {}, childIds: ["image-logo"],
          },
          "item-text": {
            id: "item-text",
            type: "text-block",
            role: { role: "paragraph" },
            props: {},
            children: [
              { id: "label", type: "text", text: "Item " },
              { id: "inline-description", type: "field-ref", key: "description" },
              { id: "inline-customer", type: "field-ref", key: "customer.name" },
              {
                id: "image-photo",
                type: "inline-image",
                source: { kind: "image-field-ref", fieldKey: "photo" },
                accessibility: { kind: "decorative" },
                frame: { width: mm(12), height: mm(6), fit: "contain" },
                verticalAlign: "baseline",
              },
            ],
          },
          "image-logo": {
            id: "image-logo",
            type: "image",
            source: { kind: "image-field-ref", fieldKey: "company.logo" },
            accessibility: { kind: "described", altText: "Company logo" },
            props: { frame: { width: mm(20), height: mm(10), fit: "contain" }, align: "center" },
          },
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
    headerPolicy: "no-repeat",
    columns: [
      { columnId: "description", widthShare: 70 },
      { columnId: "photo", widthShare: 30 },
    ],
    rowSources: [{
      kind: "collection-rows",
      rowSourceId: "items-source",
      collectionFieldKey: "orders.items",
      rowTemplateId: "item-template",
      role: "body",
      emptyPolicy: { kind: "header-only" },
    }],
    rowTemplates: {
      "item-template": {
        rowTemplateId: "item-template",
        sourceRowId: "item-row",
        breakPolicy: "prefer-keep",
        cells: [
          { cellId: "description-cell", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "photo-cell", columnStart: 1, colSpan: 1, rowSpan: 1 },
        ],
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
          photo: { key: "photo", label: "Photo", type: "image", required: false },
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
      "item-template": {
        rowTemplateId: "item-template",
        placements: {
          "inline-description": {
            sourcePlacementId: "inline-description",
            placementKind: "text-field-ref",
            binding: {
              scope: "collection-item-field",
              collectionFieldKey: "orders.items",
              itemFieldKey: "description",
            },
          },
          "inline-customer": {
            sourcePlacementId: "inline-customer",
            placementKind: "text-field-ref",
            binding: { scope: "document-field", fieldKey: "customer.name" },
          },
          "image-photo": {
            sourcePlacementId: "image-photo",
            placementKind: "image-field-ref",
            binding: {
              scope: "collection-item-field",
              collectionFieldKey: "orders.items",
              itemFieldKey: "photo",
            },
          },
          "image-logo": {
            sourcePlacementId: "image-logo",
            placementKind: "image-field-ref",
            binding: { scope: "document-field", fieldKey: "company.logo" },
          },
        },
      },
    },
  }
}

function request() {
  return {
    document: document(),
    definition: definition(),
    fieldContract: fieldContract(),
    itemContract: itemContract(),
    bindingContract: bindingContract(),
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("table content source plan v1", () => {
  it("indexes supported source nodes and exact field-bearing placements once", () => {
    const input = request()
    const before = JSON.stringify(input)
    const result = createVNextTableContentSourcePlanV1(input)

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error("expected ready source plan")
    expect(result.templates).toHaveLength(1)
    expect(result.templates[0].cells.map((cell) => cell.sourceCellId)).toEqual([
      "description-cell",
      "photo-cell",
    ])
    expect(result.templates[0].fieldPlacements.map((placement) => placement.sourcePlacementId)).toEqual([
      "inline-description",
      "inline-customer",
      "image-photo",
      "image-logo",
    ])
    expect(result.work).toEqual({
      templateCount: 1,
      cellCount: 2,
      nodeCount: 2,
      inlineCount: 4,
      fieldPlacementCount: 4,
      documentRootScans: 1,
    })
    expect(result.execution).toEqual({
      identityAllocation: "not-run",
      cloning: "not-run",
      valueBinding: "not-run",
      measurement: "not-run",
      pagination: "not-run",
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks missing and unreachable placement bindings", () => {
    const input = request()
    const placements = input.bindingContract.rowTemplates["item-template"].placements
    delete placements["inline-description"]
    placements.ghost = {
      sourcePlacementId: "ghost",
      placementKind: "text-field-ref",
      binding: { scope: "document-field", fieldKey: "customer.name" },
    }
    const result = createVNextTableContentSourcePlanV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "missing-placement-binding",
      "unreachable-placement-binding",
    ]))
  })

  it("blocks source placement kind and embedded field-key drift", () => {
    const input = request()
    const placement = input.bindingContract.rowTemplates["item-template"].placements["inline-description"]
    placement.placementKind = "image-field-ref"
    if (placement.binding.scope !== "collection-item-field") throw new Error("fixture shape")
    placement.binding.itemFieldKey = "photo"
    const result = createVNextTableContentSourcePlanV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "placement-kind-source-mismatch",
      "embedded-field-key-mismatch",
    ]))
  })

  it("blocks generated TOC content inside a collection row cell", () => {
    const input = request()
    const section = input.document.document.sections[0]
    section.nodes["collection-toc"] = { id: "collection-toc", type: "toc", props: {} }
    const cell = section.nodes["description-cell"]
    if (cell.type !== "table-cell") throw new Error("fixture shape")
    cell.childIds.push("collection-toc")
    const result = createVNextTableContentSourcePlanV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toContain("unsupported-generated-content")
  })

  it("blocks semantic colSpan mapping until the authored row adapter exists", () => {
    const input = request()
    input.definition.rowTemplates["item-template"].cells = [
      { cellId: "description-cell", columnStart: 0, colSpan: 2, rowSpan: 1 },
    ]
    const result = createVNextTableContentSourcePlanV1(input)

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toContain("source-row-cell-map-mismatch")
  })

  it("blocks malformed source graphs without mutating them", () => {
    const input = clone(request())
    input.definition.tableId = "missing-table"
    const before = JSON.stringify(input)
    const result = createVNextTableContentSourcePlanV1(input)
    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toContain("missing-source-table")
    expect(JSON.stringify(input)).toBe(before)
  })
})
