import { describe, expect, it } from "vitest"
import {
  VNextPublishedCollectionItemContractV1Schema,
  type VNextPublishedCollectionItemContractV1,
} from "../src/table/collectionItemContractV1.js"
import {
  validateVNextTableContentContractsV1,
  type VNextPublishedTableContentBindingContractV1,
} from "../src/table/tableContentBindingV1.js"
import type { VNextTableDefinitionV1 } from "../src/table/tableDefinitionV1.js"
import type { VNextPublishedFieldContractV1 } from "../src/resolution/resolutionInputPins.js"

const owner = {
  structureId: "order-report",
  structureVersionId: "order-report-v3",
  versionOrdinal: 3,
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
        "orders.items": { key: "orders.items", label: "Order items", type: "collection" },
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
    collectionItemContractId: "order-item-fields",
    publishedFieldContractId: "order-fields",
    owner: { ...owner },
    collections: {
      "orders.items": {
        collectionFieldKey: "orders.items",
        fields: {
          description: { key: "description", label: "Description", type: "text", required: true },
          amount: { key: "amount", label: "Amount", type: "number", required: false, fallback: 0 },
          photo: {
            key: "photo",
            label: "Photo",
            type: "image",
            required: false,
            fallback: { kind: "published-asset-ref", assetId: "asset-placeholder" },
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
    tableContentBindingContractId: "orders-content-bindings",
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("published collection item and table content binding contracts v1", () => {
  it("accepts typed item fields and mixed document/item placement scopes", () => {
    const input = {
      definition: definition(),
      fieldContract: fieldContract(),
      itemContract: itemContract(),
      bindingContract: bindingContract(),
    }
    const before = JSON.stringify(input)
    const result = validateVNextTableContentContractsV1(input)

    expect(result.status).toBe("ready")
    expect(result.issues).toEqual([])
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks required fallbacks and type-incompatible optional fallbacks", () => {
    const requiredFallback = clone(itemContract())
    requiredFallback.collections["orders.items"].fields.description.fallback = "fallback"
    expect(VNextPublishedCollectionItemContractV1Schema.safeParse(requiredFallback).success).toBe(false)

    const wrongType = clone(itemContract())
    wrongType.collections["orders.items"].fields.amount.fallback = "zero"
    expect(VNextPublishedCollectionItemContractV1Schema.safeParse(wrongType).success).toBe(false)
  })

  it("blocks parent collection and exact published owner drift", () => {
    const fields = fieldContract()
    fields.registry.fields["orders.items"].type = "text"
    const bindings = bindingContract()
    bindings.owner.structureVersionId = "other-version"
    const result = validateVNextTableContentContractsV1({
      definition: definition(), fieldContract: fields, itemContract: itemContract(), bindingContract: bindings,
    })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "parent-field-not-collection",
      "published-owner-mismatch",
    ]))
  })

  it("blocks row-template and item-scope drift", () => {
    const bindings = bindingContract()
    const template = bindings.rowTemplates["item-template"]
    delete bindings.rowTemplates["item-template"]
    template.rowTemplateId = "missing-template"
    const placement = template.placements["inline-description"]
    if (placement.binding.scope !== "collection-item-field") throw new Error("fixture shape")
    placement.binding.collectionFieldKey = "other.items"
    bindings.rowTemplates["missing-template"] = template
    const result = validateVNextTableContentContractsV1({
      definition: definition(), fieldContract: fieldContract(), itemContract: itemContract(), bindingContract: bindings,
    })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "missing-row-template",
      "item-binding-row-source-mismatch",
      "missing-item-collection",
    ]))
  })

  it("blocks missing fields and text/image placement type mismatches", () => {
    const bindings = bindingContract()
    const placements = bindings.rowTemplates["item-template"].placements
    const description = placements["inline-description"]
    if (description.binding.scope !== "collection-item-field") throw new Error("fixture shape")
    description.binding.itemFieldKey = "photo"
    const customer = placements["inline-customer"]
    if (customer.binding.scope !== "document-field") throw new Error("fixture shape")
    customer.binding.fieldKey = "missing.field"
    const result = validateVNextTableContentContractsV1({
      definition: definition(), fieldContract: fieldContract(), itemContract: itemContract(), bindingContract: bindings,
    })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "placement-field-type-mismatch",
      "missing-document-field",
    ]))
  })

  it("blocks item-scoped bindings when one template serves different collections", () => {
    const table = definition()
    table.rowSources.push({
      kind: "collection-rows",
      rowSourceId: "other-source",
      collectionFieldKey: "other.items",
      rowTemplateId: "item-template",
      role: "body",
      emptyPolicy: { kind: "header-only" },
    })
    const fields = fieldContract()
    fields.registry.fields["other.items"] = {
      key: "other.items", label: "Other items", type: "collection",
    }
    const items = itemContract()
    items.collections["other.items"] = {
      collectionFieldKey: "other.items",
      fields: { description: { key: "description", label: "Description", type: "text", required: true } },
    }
    const result = validateVNextTableContentContractsV1({
      definition: table, fieldContract: fields, itemContract: items, bindingContract: bindingContract(),
    })

    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toContain("ambiguous-item-binding-template")
  })

  it("blocks unknown metadata instead of widening published contracts", () => {
    expect(VNextPublishedCollectionItemContractV1Schema.safeParse({
      ...itemContract(),
      publicItemKeyRequired: true,
    }).success).toBe(false)
  })
})
