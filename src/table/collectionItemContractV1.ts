import { z } from "zod"
import { VNextPublishedStructureVersionRefV1Schema } from "../lifecycle/structureIdentity.js"

export const VNEXT_COLLECTION_ITEM_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextCollectionItemFieldTypeV1Schema = z.enum([
  "text",
  "number",
  "date",
  "boolean",
  "enum",
  "image",
])

export const VNextCollectionItemFallbackV1Schema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.object({
    kind: z.literal("published-asset-ref"),
    assetId: NonBlankIdSchema,
  }).strict(),
])

export const VNextCollectionItemFieldDefinitionV1Schema = z.object({
  key: NonBlankIdSchema,
  label: NonBlankIdSchema,
  type: VNextCollectionItemFieldTypeV1Schema,
  required: z.boolean(),
  fallback: VNextCollectionItemFallbackV1Schema.optional(),
}).strict().superRefine((field, ctx) => {
  if (field.required && field.fallback != null) ctx.addIssue({
    code: "custom",
    path: ["fallback"],
    message: "required collection item fields cannot define a missing-value fallback",
  })
  if (field.fallback == null) return
  const compatible = field.type === "number"
    ? typeof field.fallback === "number"
    : field.type === "boolean"
      ? typeof field.fallback === "boolean"
      : field.type === "image"
        ? typeof field.fallback === "object"
        : typeof field.fallback === "string"
  if (!compatible) ctx.addIssue({
    code: "custom",
    path: ["fallback"],
    message: `fallback is incompatible with collection item field type ${field.type}`,
  })
})

export const VNextCollectionItemShapeV1Schema = z.object({
  collectionFieldKey: NonBlankIdSchema,
  fields: z.record(NonBlankIdSchema, VNextCollectionItemFieldDefinitionV1Schema),
}).strict().superRefine((shape, ctx) => {
  Object.entries(shape.fields).forEach(([key, field]) => {
    if (key !== field.key) ctx.addIssue({
      code: "custom",
      path: ["fields", key, "key"],
      message: "collection item field record key must equal field.key",
    })
  })
})

export const VNextPublishedCollectionItemContractV1Schema = z.object({
  contractVersion: z.literal(VNEXT_COLLECTION_ITEM_CONTRACT_VERSION),
  kind: z.literal("published-collection-item-contract"),
  collectionItemContractId: NonBlankIdSchema,
  publishedFieldContractId: NonBlankIdSchema,
  owner: VNextPublishedStructureVersionRefV1Schema,
  collections: z.record(NonBlankIdSchema, VNextCollectionItemShapeV1Schema),
}).strict().superRefine((contract, ctx) => {
  Object.entries(contract.collections).forEach(([key, shape]) => {
    if (key !== shape.collectionFieldKey) ctx.addIssue({
      code: "custom",
      path: ["collections", key, "collectionFieldKey"],
      message: "collection record key must equal collectionFieldKey",
    })
  })
})

export type VNextCollectionItemFieldTypeV1 = z.infer<typeof VNextCollectionItemFieldTypeV1Schema>
export type VNextCollectionItemFallbackV1 = z.infer<typeof VNextCollectionItemFallbackV1Schema>
export type VNextCollectionItemFieldDefinitionV1 = z.infer<typeof VNextCollectionItemFieldDefinitionV1Schema>
export type VNextCollectionItemShapeV1 = z.infer<typeof VNextCollectionItemShapeV1Schema>
export type VNextPublishedCollectionItemContractV1 = z.infer<
  typeof VNextPublishedCollectionItemContractV1Schema
>
