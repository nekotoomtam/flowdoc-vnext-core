import { z } from "zod"
import type { FieldRegistry } from "./package.js"
import type { ImageAssetRegistryV1 } from "../schema/imageAssetRegistry.js"

export const VNEXT_PACKAGE_V3_IMAGE_TARGET_SOURCE = "vnext-package-v3-image-target"
export const VNEXT_PACKAGE_V3_IMAGE_TARGET_VERSION = 1 as const

export const ImageAssetDataValueSchema = z.object({
  kind: z.literal("image-asset-ref"),
  assetId: z.string().min(1),
}).strict()

export const DataSnapshotV2ValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  ImageAssetDataValueSchema,
])

export const DataSnapshotV2Schema = z.object({
  version: z.literal(2),
  values: z.record(z.string().min(1), DataSnapshotV2ValueSchema),
}).strict()

export type ImageAssetDataValue = z.infer<typeof ImageAssetDataValueSchema>
export type DataSnapshotV2Value = z.infer<typeof DataSnapshotV2ValueSchema>
export type DataSnapshotV2 = z.infer<typeof DataSnapshotV2Schema>

export type VNextPackageV3ImageTargetIssueCode =
  | "unknown-image-field"
  | "image-value-field-type-mismatch"
  | "image-field-value-invalid"
  | "missing-image-asset"

export interface VNextPackageV3ImageTargetIssue {
  code: VNextPackageV3ImageTargetIssueCode
  severity: "error"
  path: string
  fieldKey: string
  assetId?: string
  message: string
}

export interface VNextPackageV3ImageTargetValidation {
  source: typeof VNEXT_PACKAGE_V3_IMAGE_TARGET_SOURCE
  version: typeof VNEXT_PACKAGE_V3_IMAGE_TARGET_VERSION
  status: "valid" | "blocked"
  issues: VNextPackageV3ImageTargetIssue[]
  summary: {
    assetCount: number
    dataKeyCount: number
    imageFieldCount: number
    imageValueCount: number
    errorCount: number
  }
}

function isImageAssetDataValue(value: DataSnapshotV2Value): value is ImageAssetDataValue {
  return typeof value === "object" && value != null && "kind" in value && value.kind === "image-asset-ref"
}

function issue(
  code: VNextPackageV3ImageTargetIssueCode,
  fieldKey: string,
  message: string,
  assetId?: string,
): VNextPackageV3ImageTargetIssue {
  return {
    code,
    severity: "error",
    path: `data.values.${fieldKey}`,
    fieldKey,
    message,
    ...(assetId == null ? {} : { assetId }),
  }
}

export function validateVNextPackageV3ImageTarget(
  assets: ImageAssetRegistryV1,
  fields: FieldRegistry,
  data?: DataSnapshotV2,
): VNextPackageV3ImageTargetValidation {
  const issues: VNextPackageV3ImageTargetIssue[] = []
  let imageValueCount = 0

  Object.entries(data?.values ?? {}).forEach(([fieldKey, value]) => {
    const definition = fields.fields[fieldKey]
    const imageValue = isImageAssetDataValue(value) ? value : null
    if (imageValue != null) imageValueCount += 1

    if (definition == null) {
      if (imageValue != null) {
        issues.push(issue(
          "unknown-image-field",
          fieldKey,
          `image value references missing field definition "${fieldKey}"`,
          imageValue.assetId,
        ))
      }
      return
    }

    if (imageValue != null && definition.type !== "image") {
      issues.push(issue(
        "image-value-field-type-mismatch",
        fieldKey,
        `image value requires an image field; "${fieldKey}" is ${definition.type}`,
        imageValue.assetId,
      ))
      return
    }

    if (imageValue == null && definition.type === "image" && value !== null) {
      issues.push(issue(
        "image-field-value-invalid",
        fieldKey,
        `image field "${fieldKey}" requires an image-asset-ref value or null`,
      ))
      return
    }

    if (imageValue != null && assets.images[imageValue.assetId] == null) {
      issues.push(issue(
        "missing-image-asset",
        fieldKey,
        `image field "${fieldKey}" references missing asset "${imageValue.assetId}"`,
        imageValue.assetId,
      ))
    }
  })

  return {
    source: VNEXT_PACKAGE_V3_IMAGE_TARGET_SOURCE,
    version: VNEXT_PACKAGE_V3_IMAGE_TARGET_VERSION,
    status: issues.length === 0 ? "valid" : "blocked",
    issues,
    summary: {
      assetCount: Object.keys(assets.images).length,
      dataKeyCount: Object.keys(data?.values ?? {}).length,
      imageFieldCount: Object.values(fields.fields).filter((field) => field.type === "image").length,
      imageValueCount,
      errorCount: issues.length,
    },
  }
}
