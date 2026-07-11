import { z } from "zod"
import { DocumentNodeV4TargetSchema } from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import { ImageAssetRegistryV1Schema } from "../schema/imageAssetRegistry.js"
import { DataSnapshotV2Schema } from "./packageV3ImageTarget.js"
import { validateVNextPackageV3DocumentV4References } from "./packageV3References.js"

const FieldValueTypeV3Schema = z.enum(["text", "number", "date", "boolean", "enum", "image", "collection"])

export const FieldDefinitionV1V3Schema = z.object({
  key: z.string().min(1).refine((key) => key.trim().length > 0, { message: "field key must not be whitespace" }),
  label: z.string().min(1).refine((label) => label.trim().length > 0, { message: "field label must not be whitespace" }),
  type: FieldValueTypeV3Schema,
  fallback: z.string().optional(),
}).strict().superRefine((field, ctx) => {
  if ((field.type === "image" || field.type === "collection") && field.fallback != null) {
    ctx.addIssue({
      code: "custom",
      path: ["fallback"],
      message: `${field.type} fields cannot use scalar fallback text`,
    })
  }
})

export const FieldRegistryV1V3Schema = z.object({
  version: z.literal(1),
  fields: z.record(z.string().min(1), FieldDefinitionV1V3Schema),
}).strict().superRefine((registry, ctx) => {
  Object.entries(registry.fields).forEach(([key, field]) => {
    if (key !== field.key) {
      ctx.addIssue({
        code: "custom",
        path: ["fields", key, "key"],
        message: `field registry key "${key}" must equal field key "${field.key}"`,
      })
    }
  })
})

export const FlowDocPackageV3DocumentV4Schema = z.object({
  packageVersion: z.literal(3),
  kind: z.literal("document"),
  id: z.string().min(1),
  meta: z.object({
    title: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }).strict(),
  document: DocumentNodeV4TargetSchema,
  assets: ImageAssetRegistryV1Schema,
  fields: FieldRegistryV1V3Schema,
  data: DataSnapshotV2Schema.optional(),
}).strict().superRefine((pack, ctx) => {
  if (pack.id !== pack.document.document.id) {
    ctx.addIssue({
      code: "custom",
      path: ["id"],
      message: "package id must equal document id",
    })
  }
})

export type FieldDefinitionV1V3 = z.infer<typeof FieldDefinitionV1V3Schema>
export type FieldRegistryV1V3 = z.infer<typeof FieldRegistryV1V3Schema>
export type FlowDocPackageV3DocumentV4 = z.infer<typeof FlowDocPackageV3DocumentV4Schema>

export type FlowDocPackageV3ParseReason =
  | "unsupported-version"
  | "invalid-package"
  | "invalid-structure"
  | "invalid-references"

export interface FlowDocPackageV3ParseIssue {
  source: "schema" | "structure" | "references"
  severity: "error"
  code: string
  path: string
  message: string
}

export type FlowDocPackageV3ParseResult =
  | { ok: true; package: FlowDocPackageV3DocumentV4; issues: FlowDocPackageV3ParseIssue[] }
  | { ok: false; reason: FlowDocPackageV3ParseReason; issues: FlowDocPackageV3ParseIssue[] }

export class FlowDocPackageV3ParseError extends Error {
  constructor(
    public readonly reason: FlowDocPackageV3ParseReason,
    public readonly issues: FlowDocPackageV3ParseIssue[],
  ) {
    super(issues.map((item) => `[${item.path}] ${item.message}`).join("\n"))
    this.name = "FlowDocPackageV3ParseError"
  }
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function schemaIssue(item: z.core.$ZodIssue): FlowDocPackageV3ParseIssue {
  return {
    source: "schema",
    severity: "error",
    code: item.code,
    path: formatIssuePath(item.path),
    message: item.message,
  }
}

function classifySchemaReason(issues: readonly FlowDocPackageV3ParseIssue[]): FlowDocPackageV3ParseReason {
  return issues.some((item) => item.path === "packageVersion" || item.path === "document.version")
    ? "unsupported-version"
    : "invalid-package"
}

export function safeParseFlowDocPackageV3DocumentV4(value: unknown): FlowDocPackageV3ParseResult {
  const schemaResult = FlowDocPackageV3DocumentV4Schema.safeParse(value)
  if (!schemaResult.success) {
    const issues = schemaResult.error.issues.map(schemaIssue)
    return { ok: false, reason: classifySchemaReason(issues), issues }
  }

  const structure = validateVNextDocumentV4Structure(schemaResult.data.document)
  const structureIssues: FlowDocPackageV3ParseIssue[] = structure.issues.map((item) => ({
    source: "structure",
    severity: "error",
    code: item.code,
    path: `document.${item.path}`,
    message: item.message,
  }))
  const references = validateVNextPackageV3DocumentV4References(schemaResult.data)
  const issues = [...structureIssues, ...references.issues]
  if (issues.length > 0) {
    return {
      ok: false,
      reason: structureIssues.length > 0 ? "invalid-structure" : "invalid-references",
      issues,
    }
  }

  return { ok: true, package: schemaResult.data, issues: [] }
}

export function parseFlowDocPackageV3DocumentV4(value: unknown): FlowDocPackageV3DocumentV4 {
  const result = safeParseFlowDocPackageV3DocumentV4(value)
  if (!result.ok) throw new FlowDocPackageV3ParseError(result.reason, result.issues)
  return result.package
}

export function serializeFlowDocPackageV3DocumentV4(
  value: FlowDocPackageV3DocumentV4,
): FlowDocPackageV3DocumentV4 {
  const parsed = parseFlowDocPackageV3DocumentV4(value)
  return JSON.parse(JSON.stringify(parsed)) as FlowDocPackageV3DocumentV4
}
