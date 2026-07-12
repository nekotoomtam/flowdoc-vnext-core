import { z } from "zod"
import { sameVNextPublishedStructureVersionRefV1 } from "../lifecycle/structureIdentity.js"
import {
  VNextPublishedFieldContractV1Schema,
  type VNextPublishedFieldContractV1,
} from "../resolution/resolutionInputPins.js"
import {
  VNextTableDefinitionV1Schema,
  type VNextTableDefinitionV1,
} from "./tableDefinitionV1.js"
import {
  VNextPublishedCollectionItemContractV1Schema,
  type VNextCollectionItemFieldDefinitionV1,
  type VNextPublishedCollectionItemContractV1,
} from "./collectionItemContractV1.js"

export const VNEXT_TABLE_CONTENT_BINDING_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableContentFieldBindingV1Schema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("document-field"),
    fieldKey: NonBlankIdSchema,
  }).strict(),
  z.object({
    scope: z.literal("collection-item-field"),
    collectionFieldKey: NonBlankIdSchema,
    itemFieldKey: NonBlankIdSchema,
  }).strict(),
])

export const VNextTableContentPlacementBindingV1Schema = z.object({
  sourcePlacementId: NonBlankIdSchema,
  placementKind: z.enum(["text-field-ref", "image-field-ref"]),
  binding: VNextTableContentFieldBindingV1Schema,
}).strict()

export const VNextTableRowTemplateContentBindingsV1Schema = z.object({
  rowTemplateId: NonBlankIdSchema,
  placements: z.record(NonBlankIdSchema, VNextTableContentPlacementBindingV1Schema),
}).strict().superRefine((bindings, ctx) => {
  Object.entries(bindings.placements).forEach(([key, placement]) => {
    if (key !== placement.sourcePlacementId) ctx.addIssue({
      code: "custom",
      path: ["placements", key, "sourcePlacementId"],
      message: "placement record key must equal sourcePlacementId",
    })
  })
})

export const VNextPublishedTableContentBindingContractV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CONTENT_BINDING_CONTRACT_VERSION),
  kind: z.literal("published-table-content-binding-contract"),
  tableContentBindingContractId: NonBlankIdSchema,
  owner: VNextPublishedCollectionItemContractV1Schema.shape.owner,
  tableDefinitionId: NonBlankIdSchema,
  tableId: NonBlankIdSchema,
  rowTemplates: z.record(NonBlankIdSchema, VNextTableRowTemplateContentBindingsV1Schema),
}).strict().superRefine((contract, ctx) => {
  Object.entries(contract.rowTemplates).forEach(([key, bindings]) => {
    if (key !== bindings.rowTemplateId) ctx.addIssue({
      code: "custom",
      path: ["rowTemplates", key, "rowTemplateId"],
      message: "row template binding record key must equal rowTemplateId",
    })
  })
})

export type VNextTableContentFieldBindingV1 = z.infer<typeof VNextTableContentFieldBindingV1Schema>
export type VNextTableContentPlacementBindingV1 = z.infer<typeof VNextTableContentPlacementBindingV1Schema>
export type VNextTableRowTemplateContentBindingsV1 = z.infer<
  typeof VNextTableRowTemplateContentBindingsV1Schema
>
export type VNextPublishedTableContentBindingContractV1 = z.infer<
  typeof VNextPublishedTableContentBindingContractV1Schema
>

export interface VNextTableContentContractIssue {
  source: "schema" | "ownership" | "definition" | "field" | "binding"
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextTableContentContractValidation =
  | {
      status: "ready"
      definition: VNextTableDefinitionV1
      fieldContract: VNextPublishedFieldContractV1
      itemContract: VNextPublishedCollectionItemContractV1
      bindingContract: VNextPublishedTableContentBindingContractV1
      issues: []
    }
  | {
      status: "blocked"
      definition: null
      fieldContract: null
      itemContract: null
      bindingContract: null
      issues: VNextTableContentContractIssue[]
    }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function issue(
  issues: VNextTableContentContractIssue[],
  source: VNextTableContentContractIssue["source"],
  code: string,
  path: string,
  message: string,
): void {
  issues.push({ source, code, path, message, severity: "error" })
}

function placementAccepts(
  placementKind: VNextTableContentPlacementBindingV1["placementKind"],
  type: VNextCollectionItemFieldDefinitionV1["type"] | string,
): boolean {
  return placementKind === "image-field-ref" ? type === "image" : type !== "image" && type !== "collection"
}

export function validateVNextTableContentContractsV1(value: {
  definition: unknown
  fieldContract: unknown
  itemContract: unknown
  bindingContract: unknown
}): VNextTableContentContractValidation {
  const parsed = z.object({
    definition: VNextTableDefinitionV1Schema,
    fieldContract: VNextPublishedFieldContractV1Schema,
    itemContract: VNextPublishedCollectionItemContractV1Schema,
    bindingContract: VNextPublishedTableContentBindingContractV1Schema,
  }).strict().safeParse(value)
  if (!parsed.success) return {
    status: "blocked",
    definition: null,
    fieldContract: null,
    itemContract: null,
    bindingContract: null,
    issues: parsed.error.issues.map((item) => ({
      source: "schema",
      code: item.code,
      path: formatIssuePath(item.path),
      message: item.message,
      severity: "error",
    })),
  }

  const { definition, fieldContract, itemContract, bindingContract } = parsed.data
  const issues: VNextTableContentContractIssue[] = []
  if (definition.owner.kind !== "published-structure-version") issue(
    issues, "ownership", "definition-owner-not-published", "definition.owner.kind",
    "table content materialization requires a Published Structure Version-owned definition",
  )
  const owner = definition.owner.kind === "published-structure-version" ? definition.owner.ref : null
  if (owner != null) {
    const ownedContracts = [
      { path: "fieldContract.owner", candidate: fieldContract.owner },
      { path: "itemContract.owner", candidate: itemContract.owner },
      { path: "bindingContract.owner", candidate: bindingContract.owner },
    ]
    ownedContracts.forEach(({ path, candidate }) => {
      if (!sameVNextPublishedStructureVersionRefV1(owner, candidate)) issue(
        issues, "ownership", "published-owner-mismatch", path,
        "table content contracts must share the definition's exact Published Structure Version",
      )
    })
  }
  if (itemContract.publishedFieldContractId !== fieldContract.fieldContractId) issue(
    issues, "field", "parent-field-contract-mismatch", "itemContract.publishedFieldContractId",
    "collection item contract must refine the supplied Published Field Contract",
  )
  if (bindingContract.tableDefinitionId !== definition.tableDefinitionId) issue(
    issues, "definition", "table-definition-id-mismatch", "bindingContract.tableDefinitionId",
    "binding contract must target the supplied table definition",
  )
  if (bindingContract.tableId !== definition.tableId) issue(
    issues, "definition", "table-id-mismatch", "bindingContract.tableId",
    "binding contract must target the supplied authored table",
  )

  Object.entries(itemContract.collections).forEach(([collectionFieldKey]) => {
    const parentField = fieldContract.registry.fields[collectionFieldKey]
    if (parentField == null) issue(
      issues, "field", "missing-parent-collection-field",
      `itemContract.collections.${collectionFieldKey}`,
      `item contract references missing parent field "${collectionFieldKey}"`,
    )
    else if (parentField.type !== "collection") issue(
      issues, "field", "parent-field-not-collection",
      `itemContract.collections.${collectionFieldKey}`,
      `item contract requires collection parent field; got ${parentField.type}`,
    )
  })

  const collectionFieldsByTemplate = new Map<string, Set<string>>()
  definition.rowSources.forEach((source) => {
    if (source.kind !== "collection-rows") return
    const fields = collectionFieldsByTemplate.get(source.rowTemplateId) ?? new Set<string>()
    fields.add(source.collectionFieldKey)
    collectionFieldsByTemplate.set(source.rowTemplateId, fields)
  })

  collectionFieldsByTemplate.forEach((collectionFields, rowTemplateId) => {
    if (collectionFields.size <= 1) return
    const bindings = bindingContract.rowTemplates[rowTemplateId]
    const hasItemBinding = bindings != null && Object.values(bindings.placements).some(
      (placement) => placement.binding.scope === "collection-item-field",
    )
    if (hasItemBinding) issue(
      issues, "binding", "ambiguous-item-binding-template",
      `bindingContract.rowTemplates.${rowTemplateId}`,
      "a row template with item-scoped placements cannot serve multiple collection fields",
    )
  })

  Object.entries(bindingContract.rowTemplates).forEach(([rowTemplateId, templateBindings]) => {
    if (definition.rowTemplates[rowTemplateId] == null) issue(
      issues, "definition", "missing-row-template",
      `bindingContract.rowTemplates.${rowTemplateId}`,
      `binding contract references missing row template "${rowTemplateId}"`,
    )
    templateBindings && Object.entries(templateBindings.placements).forEach(([placementId, placement]) => {
      const path = `bindingContract.rowTemplates.${rowTemplateId}.placements.${placementId}`
      if (placement.binding.scope === "document-field") {
        const field = fieldContract.registry.fields[placement.binding.fieldKey]
        if (field == null) issue(
          issues, "field", "missing-document-field", `${path}.binding.fieldKey`,
          `binding references missing document field "${placement.binding.fieldKey}"`,
        )
        else if (!placementAccepts(placement.placementKind, field.type)) issue(
          issues, "binding", "placement-field-type-mismatch", `${path}.placementKind`,
          `${placement.placementKind} cannot bind document field type ${field.type}`,
        )
        return
      }

      const allowedCollections = collectionFieldsByTemplate.get(rowTemplateId)
      if (allowedCollections == null || !allowedCollections.has(placement.binding.collectionFieldKey)) issue(
        issues, "binding", "item-binding-row-source-mismatch", `${path}.binding.collectionFieldKey`,
        "item binding must match a collection row source using this row template",
      )
      const itemShape = itemContract.collections[placement.binding.collectionFieldKey]
      const itemField = itemShape?.fields[placement.binding.itemFieldKey]
      if (itemShape == null) issue(
        issues, "field", "missing-item-collection", `${path}.binding.collectionFieldKey`,
        `item binding references missing collection contract "${placement.binding.collectionFieldKey}"`,
      )
      else if (itemField == null) issue(
        issues, "field", "missing-item-field", `${path}.binding.itemFieldKey`,
        `item binding references missing item field "${placement.binding.itemFieldKey}"`,
      )
      else if (!placementAccepts(placement.placementKind, itemField.type)) issue(
        issues, "binding", "placement-field-type-mismatch", `${path}.placementKind`,
        `${placement.placementKind} cannot bind item field type ${itemField.type}`,
      )
    })
  })

  if (issues.length > 0) return {
    status: "blocked",
    definition: null,
    fieldContract: null,
    itemContract: null,
    bindingContract: null,
    issues,
  }
  return { status: "ready", definition, fieldContract, itemContract, bindingContract, issues: [] }
}
