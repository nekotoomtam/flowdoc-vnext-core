import { z } from "zod"

const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/)

export const ImageAssetDigestSchema = z.object({
  algorithm: z.literal("sha256"),
  value: Sha256HexSchema,
}).strict()

export const ImageAssetIntrinsicSchema = z.object({
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
}).strict()

export const ImageAssetDefinitionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("image"),
  mediaType: z.enum(["image/png", "image/jpeg"]),
  byteLength: z.number().int().positive(),
  digest: ImageAssetDigestSchema,
  intrinsic: ImageAssetIntrinsicSchema,
}).strict()

export const ImageAssetRegistryV1Schema = z.object({
  version: z.literal(1),
  images: z.record(z.string().min(1), ImageAssetDefinitionSchema),
}).strict().superRefine((registry, ctx) => {
  Object.entries(registry.images).forEach(([key, asset]) => {
    if (key !== asset.id) {
      ctx.addIssue({
        code: "custom",
        path: ["images", key, "id"],
        message: `image asset registry key "${key}" must equal asset id "${asset.id}"`,
      })
    }
  })
})

export type ImageAssetDigest = z.infer<typeof ImageAssetDigestSchema>
export type ImageAssetIntrinsic = z.infer<typeof ImageAssetIntrinsicSchema>
export type ImageAssetDefinition = z.infer<typeof ImageAssetDefinitionSchema>
export type ImageAssetRegistryV1 = z.infer<typeof ImageAssetRegistryV1Schema>
