import { z } from "zod"
import type { FieldRegistry } from "../persistence/package.js"
import type { ImageAssetRegistryV1 } from "./imageAssetRegistry.js"
import {
  TextBlockPropsSchema,
  TextBlockRoleSchema,
  TextRunStyleSchema,
  UnitValueSchema,
} from "./document.js"

export const VNEXT_DOCUMENT_V4_IMAGE_TARGET_SOURCE = "vnext-document-v4-image-target"
export const VNEXT_DOCUMENT_V4_IMAGE_TARGET_VERSION = 1 as const

export const ImageAssetSourceV4TargetSchema = z.object({
  kind: z.literal("asset-ref"),
  assetId: z.string().min(1),
}).strict()

export const ImageFieldSourceV4TargetSchema = z.object({
  kind: z.literal("image-field-ref"),
  fieldKey: z.string().min(1),
  fallbackAssetId: z.string().min(1).optional(),
}).strict()

export const ImageSourceV4TargetSchema = z.discriminatedUnion("kind", [
  ImageAssetSourceV4TargetSchema,
  ImageFieldSourceV4TargetSchema,
])

export const ImageAccessibilityV4TargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("described"),
    altText: z.string().min(1).refine((text) => text.trim().length > 0, {
      message: "described images require non-whitespace alt text",
    }),
  }).strict(),
  z.object({
    kind: z.literal("decorative"),
  }).strict(),
])

export const ImageCropV4TargetSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
}).strict().superRefine((crop, ctx) => {
  if (crop.x + crop.width > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["width"],
      message: "image crop x + width must not exceed 1",
    })
  }
  if (crop.y + crop.height > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["height"],
      message: "image crop y + height must not exceed 1",
    })
  }
})

const PositiveImageUnitValueV4TargetSchema = UnitValueSchema.strict().refine((value) => value.value > 0, {
  message: "image frame dimensions must be positive",
})

export const ImageFrameV4TargetSchema = z.object({
  width: PositiveImageUnitValueV4TargetSchema,
  height: PositiveImageUnitValueV4TargetSchema,
  fit: z.enum(["contain", "cover"]),
  crop: ImageCropV4TargetSchema.optional(),
}).strict()

export const InlineImageV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("inline-image"),
  source: ImageSourceV4TargetSchema,
  accessibility: ImageAccessibilityV4TargetSchema,
  frame: ImageFrameV4TargetSchema,
  verticalAlign: z.enum(["baseline", "middle", "text-bottom"]),
}).strict()

const TextInlineV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("text"),
  text: z.string().min(1).refine((text) => !/[\r\n]/.test(text), {
    message: "document v4 text leaves must use line-break atomics instead of CR/LF",
  }),
  style: TextRunStyleSchema.strict().optional(),
}).strict()

const FieldRefInlineV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("field-ref"),
  key: z.string().min(1),
  label: z.string().optional(),
  fallback: z.string().optional(),
}).strict()

const PageNumberInlineV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("page-number"),
}).strict()

const LineBreakInlineV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("line-break"),
}).strict()

export const InlineNodeV4TargetSchema = z.discriminatedUnion("type", [
  TextInlineV4TargetSchema,
  FieldRefInlineV4TargetSchema,
  PageNumberInlineV4TargetSchema,
  LineBreakInlineV4TargetSchema,
  InlineImageV4TargetSchema,
])

export const TextBlockNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("text-block"),
  role: TextBlockRoleSchema,
  props: TextBlockPropsSchema.strict().default({}),
  children: z.array(InlineNodeV4TargetSchema),
}).strict()

export const BlockImageNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  source: ImageSourceV4TargetSchema,
  accessibility: ImageAccessibilityV4TargetSchema,
  props: z.object({
    frame: ImageFrameV4TargetSchema,
    align: z.enum(["left", "center", "right"]),
  }).strict(),
}).strict()

export const ImagePlacementV4TargetSchema = z.discriminatedUnion("type", [
  InlineImageV4TargetSchema,
  BlockImageNodeV4TargetSchema,
])

export type ImageSourceV4Target = z.infer<typeof ImageSourceV4TargetSchema>
export type ImageAccessibilityV4Target = z.infer<typeof ImageAccessibilityV4TargetSchema>
export type ImageCropV4Target = z.infer<typeof ImageCropV4TargetSchema>
export type ImageFrameV4Target = z.infer<typeof ImageFrameV4TargetSchema>
export type InlineImageV4Target = z.infer<typeof InlineImageV4TargetSchema>
export type InlineNodeV4Target = z.infer<typeof InlineNodeV4TargetSchema>
export type TextBlockNodeV4Target = z.infer<typeof TextBlockNodeV4TargetSchema>
export type BlockImageNodeV4Target = z.infer<typeof BlockImageNodeV4TargetSchema>
export type ImagePlacementV4Target = z.infer<typeof ImagePlacementV4TargetSchema>

export type VNextDocumentV4ImageTargetIssueCode =
  | "missing-image-asset"
  | "missing-image-field"
  | "image-field-type-mismatch"
  | "missing-fallback-image-asset"

export interface VNextDocumentV4ImageTargetIssue {
  code: VNextDocumentV4ImageTargetIssueCode
  severity: "error"
  path: string
  placementId: string
  message: string
  assetId?: string
  fieldKey?: string
}

export interface VNextDocumentV4ImageTargetValidation {
  source: typeof VNEXT_DOCUMENT_V4_IMAGE_TARGET_SOURCE
  version: typeof VNEXT_DOCUMENT_V4_IMAGE_TARGET_VERSION
  status: "valid" | "blocked"
  issues: VNextDocumentV4ImageTargetIssue[]
  summary: {
    placementCount: number
    inlineImageCount: number
    blockImageCount: number
    assetSourceCount: number
    fieldSourceCount: number
    errorCount: number
  }
}

function issue(
  code: VNextDocumentV4ImageTargetIssueCode,
  path: string,
  placementId: string,
  message: string,
  facts: { assetId?: string; fieldKey?: string } = {},
): VNextDocumentV4ImageTargetIssue {
  return {
    code,
    severity: "error",
    path,
    placementId,
    message,
    ...(facts.assetId == null ? {} : { assetId: facts.assetId }),
    ...(facts.fieldKey == null ? {} : { fieldKey: facts.fieldKey }),
  }
}

export function validateVNextDocumentV4ImageTarget(
  placements: readonly ImagePlacementV4Target[],
  assets: ImageAssetRegistryV1,
  fields: FieldRegistry,
): VNextDocumentV4ImageTargetValidation {
  const issues: VNextDocumentV4ImageTargetIssue[] = []

  placements.forEach((placement, index) => {
    const path = `placements[${index}].source`
    if (placement.source.kind === "asset-ref") {
      if (assets.images[placement.source.assetId] == null) {
        issues.push(issue(
          "missing-image-asset",
          `${path}.assetId`,
          placement.id,
          `image placement "${placement.id}" references missing asset "${placement.source.assetId}"`,
          { assetId: placement.source.assetId },
        ))
      }
      return
    }

    const definition = fields.fields[placement.source.fieldKey]
    if (definition == null) {
      issues.push(issue(
        "missing-image-field",
        `${path}.fieldKey`,
        placement.id,
        `image placement "${placement.id}" references missing field "${placement.source.fieldKey}"`,
        { fieldKey: placement.source.fieldKey },
      ))
    } else if (definition.type !== "image") {
      issues.push(issue(
        "image-field-type-mismatch",
        `${path}.fieldKey`,
        placement.id,
        `image placement "${placement.id}" requires an image field; "${placement.source.fieldKey}" is ${definition.type}`,
        { fieldKey: placement.source.fieldKey },
      ))
    }

    const fallbackAssetId = placement.source.fallbackAssetId
    if (fallbackAssetId != null && assets.images[fallbackAssetId] == null) {
      issues.push(issue(
        "missing-fallback-image-asset",
        `${path}.fallbackAssetId`,
        placement.id,
        `image placement "${placement.id}" references missing fallback asset "${fallbackAssetId}"`,
        { assetId: fallbackAssetId, fieldKey: placement.source.fieldKey },
      ))
    }
  })

  return {
    source: VNEXT_DOCUMENT_V4_IMAGE_TARGET_SOURCE,
    version: VNEXT_DOCUMENT_V4_IMAGE_TARGET_VERSION,
    status: issues.length === 0 ? "valid" : "blocked",
    issues,
    summary: {
      placementCount: placements.length,
      inlineImageCount: placements.filter((placement) => placement.type === "inline-image").length,
      blockImageCount: placements.filter((placement) => placement.type === "image").length,
      assetSourceCount: placements.filter((placement) => placement.source.kind === "asset-ref").length,
      fieldSourceCount: placements.filter((placement) => placement.source.kind === "image-field-ref").length,
      errorCount: issues.length,
    },
  }
}
