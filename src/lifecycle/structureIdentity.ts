import { z } from "zod"

export const VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

const RevisionSchema = z.number().int().nonnegative()
const VersionOrdinalSchema = z.number().int().positive()

export const VNextPublishedStructureVersionRefV1Schema = z.object({
  structureId: NonBlankIdSchema,
  structureVersionId: NonBlankIdSchema,
  versionOrdinal: VersionOrdinalSchema,
}).strict()

export const VNextStructureDefinitionDraftRefV1Schema = z.object({
  structureId: NonBlankIdSchema,
  draftId: NonBlankIdSchema,
  revision: RevisionSchema,
}).strict()

export const VNextStructureDefinitionDraftIdentityV1Schema = z.object({
  contractVersion: z.literal(VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION),
  kind: z.literal("structure-definition-draft"),
  structureId: NonBlankIdSchema,
  draftId: NonBlankIdSchema,
  revision: RevisionSchema,
  baseVersion: VNextPublishedStructureVersionRefV1Schema.optional(),
}).strict().superRefine((identity, ctx) => {
  if (identity.baseVersion != null && identity.baseVersion.structureId !== identity.structureId) {
    ctx.addIssue({
      code: "custom",
      path: ["baseVersion", "structureId"],
      message: "draft base version must belong to the same structure lineage",
    })
  }
})

export const VNextPublishedStructureVersionIdentityV1Schema = z.object({
  contractVersion: z.literal(VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION),
  kind: z.literal("published-structure-version"),
  structureId: NonBlankIdSchema,
  structureVersionId: NonBlankIdSchema,
  versionOrdinal: VersionOrdinalSchema,
  sourceDraft: VNextStructureDefinitionDraftRefV1Schema,
}).strict().superRefine((identity, ctx) => {
  if (identity.sourceDraft.structureId !== identity.structureId) {
    ctx.addIssue({
      code: "custom",
      path: ["sourceDraft", "structureId"],
      message: "published version source draft must belong to the same structure lineage",
    })
  }
})

export const VNextDocumentInstanceIdentityV1Schema = z.object({
  contractVersion: z.literal(VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION),
  kind: z.literal("document-instance"),
  instanceId: NonBlankIdSchema,
  revision: RevisionSchema,
  structureVersion: VNextPublishedStructureVersionRefV1Schema,
}).strict()

export const VNextStructureLifecycleIdentityV1Schema = z.union([
  VNextStructureDefinitionDraftIdentityV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextDocumentInstanceIdentityV1Schema,
])

export type VNextPublishedStructureVersionRefV1 = z.infer<typeof VNextPublishedStructureVersionRefV1Schema>
export type VNextStructureDefinitionDraftRefV1 = z.infer<typeof VNextStructureDefinitionDraftRefV1Schema>
export type VNextStructureDefinitionDraftIdentityV1 = z.infer<typeof VNextStructureDefinitionDraftIdentityV1Schema>
export type VNextPublishedStructureVersionIdentityV1 = z.infer<typeof VNextPublishedStructureVersionIdentityV1Schema>
export type VNextDocumentInstanceIdentityV1 = z.infer<typeof VNextDocumentInstanceIdentityV1Schema>
export type VNextStructureLifecycleIdentityV1 = z.infer<typeof VNextStructureLifecycleIdentityV1Schema>

export interface VNextStructureLifecycleIdentityIssue {
  code: string
  message: string
  path: string
  severity: "error"
}

export type VNextStructureLifecycleIdentityParseResult =
  | { ok: true; identity: VNextStructureLifecycleIdentityV1; issues: [] }
  | { ok: false; reason: "invalid-identity"; issues: VNextStructureLifecycleIdentityIssue[] }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function parseIssue(issue: z.core.$ZodIssue): VNextStructureLifecycleIdentityIssue {
  return {
    code: issue.code,
    message: issue.message,
    path: formatIssuePath(issue.path),
    severity: "error",
  }
}

export function safeParseVNextStructureLifecycleIdentityV1(
  value: unknown,
): VNextStructureLifecycleIdentityParseResult {
  const result = VNextStructureLifecycleIdentityV1Schema.safeParse(value)
  if (!result.success) {
    return {
      ok: false,
      reason: "invalid-identity",
      issues: result.error.issues.map(parseIssue),
    }
  }
  return { ok: true, identity: result.data, issues: [] }
}

export class VNextStructureLifecycleIdentityParseError extends Error {
  constructor(public readonly issues: VNextStructureLifecycleIdentityIssue[]) {
    super(issues.map((issue) => `[${issue.path}] ${issue.message}`).join("\n"))
    this.name = "VNextStructureLifecycleIdentityParseError"
  }
}

export function parseVNextStructureLifecycleIdentityV1(
  value: unknown,
): VNextStructureLifecycleIdentityV1 {
  const result = safeParseVNextStructureLifecycleIdentityV1(value)
  if (!result.ok) throw new VNextStructureLifecycleIdentityParseError(result.issues)
  return result.identity
}

export function serializeVNextStructureLifecycleIdentityV1<T extends VNextStructureLifecycleIdentityV1>(
  value: T,
): T {
  return JSON.parse(JSON.stringify(parseVNextStructureLifecycleIdentityV1(value))) as T
}

export function sameVNextPublishedStructureVersionRefV1(
  left: VNextPublishedStructureVersionRefV1,
  right: VNextPublishedStructureVersionRefV1,
): boolean {
  return left.structureId === right.structureId
    && left.structureVersionId === right.structureVersionId
    && left.versionOrdinal === right.versionOrdinal
}
