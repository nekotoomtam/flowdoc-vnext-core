import { z } from "zod"
import { TextRunStyleV4TargetSchema } from "../schema/documentV4Foundation.js"
import { DocumentNodeV4TargetSchema } from "../schema/documentV4Target.js"
import { ImageAssetRegistryV1Schema } from "../schema/imageAssetRegistry.js"
import { DataSnapshotV2Schema } from "../persistence/packageV3ImageTarget.js"
import { FieldRegistryV1V3Schema } from "../persistence/packageV3.js"
import {
  VNextDocumentInstanceIdentityV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextPublishedStructureVersionRefV1Schema,
  VNextStructureDefinitionDraftRefV1Schema,
  sameVNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"

export const VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTextStyleDefinitionV1Schema = z.object({
  key: NonBlankIdSchema,
  runStyle: TextRunStyleV4TargetSchema,
}).strict()

export const VNextPublishedStyleCatalogV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("published-style-catalog"),
  catalogId: NonBlankIdSchema,
  owner: VNextPublishedStructureVersionRefV1Schema,
  styles: z.record(NonBlankIdSchema, VNextTextStyleDefinitionV1Schema),
}).strict().superRefine((catalog, ctx) => {
  Object.entries(catalog.styles).forEach(([key, style]) => {
    if (key !== style.key) ctx.addIssue({
      code: "custom",
      path: ["styles", key, "key"],
      message: "style catalog record key must equal style.key",
    })
  })
})

export const VNextPublishedFieldContractV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("published-field-contract"),
  fieldContractId: NonBlankIdSchema,
  owner: VNextPublishedStructureVersionRefV1Schema,
  registry: FieldRegistryV1V3Schema,
}).strict()

export const VNextDraftFieldContractV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("draft-field-contract"),
  fieldContractId: NonBlankIdSchema,
  owner: VNextStructureDefinitionDraftRefV1Schema,
  registry: FieldRegistryV1V3Schema,
}).strict()

export const VNextPublishedStaticMediaV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("published-static-media"),
  mediaRegistryId: NonBlankIdSchema,
  owner: VNextPublishedStructureVersionRefV1Schema,
  registry: ImageAssetRegistryV1Schema,
}).strict()

export const VNextPublishedResolutionBundleV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("published-resolution-bundle"),
  publishedStructure: VNextPublishedStructureVersionIdentityV1Schema,
  fieldContract: VNextPublishedFieldContractV1Schema,
  styleCatalog: VNextPublishedStyleCatalogV1Schema,
  staticMedia: VNextPublishedStaticMediaV1Schema,
}).strict().superRefine((bundle, ctx) => {
  const owner = VNextPublishedStructureVersionRefV1Schema.parse({
    structureId: bundle.publishedStructure.structureId,
    structureVersionId: bundle.publishedStructure.structureVersionId,
    versionOrdinal: bundle.publishedStructure.versionOrdinal,
  })
  const ownedRegistries = [
    ["fieldContract", bundle.fieldContract.owner],
    ["styleCatalog", bundle.styleCatalog.owner],
    ["staticMedia", bundle.staticMedia.owner],
  ] as const
  ownedRegistries.forEach(([key, ref]) => {
    if (!sameVNextPublishedStructureVersionRefV1(ref, owner)) ctx.addIssue({
      code: "custom",
      path: [key, "owner"],
      message: `${key} must be owned by the exact published structure version`,
    })
  })
})

export const VNextInstanceDataSnapshotV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("instance-data-snapshot"),
  dataSnapshotId: NonBlankIdSchema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  data: DataSnapshotV2Schema,
}).strict()

export const VNextInstanceMediaSnapshotV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("instance-media-snapshot"),
  mediaSnapshotId: NonBlankIdSchema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  registry: ImageAssetRegistryV1Schema,
}).strict()

export const VNextResolvedProjectionInputV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLUTION_INPUT_PINS_CONTRACT_VERSION),
  kind: z.literal("resolved-projection-input"),
  instance: VNextDocumentInstanceIdentityV1Schema,
  document: DocumentNodeV4TargetSchema,
  published: VNextPublishedResolutionBundleV1Schema,
  dataSnapshot: VNextInstanceDataSnapshotV1Schema,
  instanceMedia: VNextInstanceMediaSnapshotV1Schema,
}).strict().superRefine((input, ctx) => {
  const sameInstance = (candidate: z.infer<typeof VNextDocumentInstanceIdentityV1Schema>): boolean =>
    candidate.instanceId === input.instance.instanceId
    && candidate.revision === input.instance.revision
    && sameVNextPublishedStructureVersionRefV1(candidate.structureVersion, input.instance.structureVersion)

  if (input.document.document.id !== input.instance.instanceId) ctx.addIssue({
    code: "custom",
    path: ["document", "document", "id"],
    message: "materialized document id must equal the document instance id",
  })
  if (!sameVNextPublishedStructureVersionRefV1(
    input.instance.structureVersion,
    {
      structureId: input.published.publishedStructure.structureId,
      structureVersionId: input.published.publishedStructure.structureVersionId,
      versionOrdinal: input.published.publishedStructure.versionOrdinal,
    },
  )) ctx.addIssue({
    code: "custom",
    path: ["instance", "structureVersion"],
    message: "document instance must pin the published resolution bundle version",
  })
  if (!sameInstance(input.dataSnapshot.instance)) ctx.addIssue({
    code: "custom",
    path: ["dataSnapshot", "instance"],
    message: "data snapshot must pin the exact document instance revision",
  })
  if (!sameInstance(input.instanceMedia.instance)) ctx.addIssue({
    code: "custom",
    path: ["instanceMedia", "instance"],
    message: "instance media snapshot must pin the exact document instance revision",
  })

  Object.keys(input.published.staticMedia.registry.images).forEach((assetId) => {
    if (input.instanceMedia.registry.images[assetId] != null) ctx.addIssue({
      code: "custom",
      path: ["instanceMedia", "registry", "images", assetId],
      message: `instance media asset "${assetId}" collides with published static media`,
    })
  })
})

export type VNextTextStyleDefinitionV1 = z.infer<typeof VNextTextStyleDefinitionV1Schema>
export type VNextPublishedStyleCatalogV1 = z.infer<typeof VNextPublishedStyleCatalogV1Schema>
export type VNextPublishedFieldContractV1 = z.infer<typeof VNextPublishedFieldContractV1Schema>
export type VNextDraftFieldContractV1 = z.infer<typeof VNextDraftFieldContractV1Schema>
export type VNextPublishedStaticMediaV1 = z.infer<typeof VNextPublishedStaticMediaV1Schema>
export type VNextPublishedResolutionBundleV1 = z.infer<typeof VNextPublishedResolutionBundleV1Schema>
export type VNextInstanceDataSnapshotV1 = z.infer<typeof VNextInstanceDataSnapshotV1Schema>
export type VNextInstanceMediaSnapshotV1 = z.infer<typeof VNextInstanceMediaSnapshotV1Schema>
export type VNextResolvedProjectionInputV1 = z.infer<typeof VNextResolvedProjectionInputV1Schema>

export interface VNextResolutionInputPinIssue {
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextResolutionInputPinParseResult =
  | { ok: true; input: VNextResolvedProjectionInputV1; issues: [] }
  | { ok: false; reason: "invalid-resolution-input"; issues: VNextResolutionInputPinIssue[] }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

export function safeParseVNextResolvedProjectionInputV1(value: unknown): VNextResolutionInputPinParseResult {
  const parsed = VNextResolvedProjectionInputV1Schema.safeParse(value)
  if (!parsed.success) return {
    ok: false,
    reason: "invalid-resolution-input",
    issues: parsed.error.issues.map((item) => ({
      code: item.code,
      path: formatIssuePath(item.path),
      message: item.message,
      severity: "error",
    })),
  }
  return { ok: true, input: parsed.data, issues: [] }
}
