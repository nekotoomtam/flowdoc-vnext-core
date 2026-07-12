import { z } from "zod"

export const VNEXT_IDENTITY_STANDARD_VERSION = 1 as const
export const VNEXT_OPAQUE_ID_MAX_LENGTH = 80 as const

export const VNextAllocatedIdentityKindV1Schema = z.enum([
  "structure",
  "structure-draft",
  "published-structure-version",
  "document-instance",
  "resolved-row",
  "resolved-cell",
  "resolved-group",
  "layout-fragment",
  "request",
  "job",
  "artifact",
])

export const VNextAllocatedIdentityClassV1Schema = z.enum([
  "lifecycle-artifact",
  "resolved-entity",
  "layout-fragment",
  "request",
  "job",
  "artifact",
])

export const VNextIdentityAllocationOwnerV1Schema = z.enum([
  "backend-lifecycle-service",
  "resolution-orchestrator",
  "layout-engine",
  "boundary-owner",
  "backend-job-service",
  "backend-artifact-service",
])

export const VNextIdentityAllocationStrategyV1Schema = z.enum([
  "random",
  "deterministic",
])

const NonBlankStringSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "value must not be whitespace",
})
const RevisionSchema = z.number().int().nonnegative()

export const VNextIdentityScopeV1Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("global"),
  }).strict(),
  z.object({
    kind: z.literal("document-resolution"),
    documentInstanceId: NonBlankStringSchema,
    instanceRevision: RevisionSchema,
    resolutionInputFingerprint: NonBlankStringSchema,
  }).strict(),
  z.object({
    kind: z.literal("layout-input"),
    documentId: NonBlankStringSchema,
    layoutInputFingerprint: NonBlankStringSchema,
  }).strict(),
])

export type VNextAllocatedIdentityKindV1 = z.infer<typeof VNextAllocatedIdentityKindV1Schema>
export type VNextAllocatedIdentityClassV1 = z.infer<typeof VNextAllocatedIdentityClassV1Schema>
export type VNextIdentityAllocationOwnerV1 = z.infer<typeof VNextIdentityAllocationOwnerV1Schema>
export type VNextIdentityScopeV1 = z.infer<typeof VNextIdentityScopeV1Schema>

export interface VNextIdentityProfileV1 {
  identityClass: VNextAllocatedIdentityClassV1
  prefix: string
  allocationOwner: VNextIdentityAllocationOwnerV1
  scopeKind: VNextIdentityScopeV1["kind"]
}

export const VNEXT_IDENTITY_PROFILES_V1 = {
  structure: {
    identityClass: "lifecycle-artifact",
    prefix: "strc",
    allocationOwner: "backend-lifecycle-service",
    scopeKind: "global",
  },
  "structure-draft": {
    identityClass: "lifecycle-artifact",
    prefix: "drft",
    allocationOwner: "backend-lifecycle-service",
    scopeKind: "global",
  },
  "published-structure-version": {
    identityClass: "lifecycle-artifact",
    prefix: "strv",
    allocationOwner: "backend-lifecycle-service",
    scopeKind: "global",
  },
  "document-instance": {
    identityClass: "lifecycle-artifact",
    prefix: "doci",
    allocationOwner: "backend-lifecycle-service",
    scopeKind: "global",
  },
  "resolved-row": {
    identityClass: "resolved-entity",
    prefix: "rowi",
    allocationOwner: "resolution-orchestrator",
    scopeKind: "document-resolution",
  },
  "resolved-cell": {
    identityClass: "resolved-entity",
    prefix: "celli",
    allocationOwner: "resolution-orchestrator",
    scopeKind: "document-resolution",
  },
  "resolved-group": {
    identityClass: "resolved-entity",
    prefix: "grpi",
    allocationOwner: "resolution-orchestrator",
    scopeKind: "document-resolution",
  },
  "layout-fragment": {
    identityClass: "layout-fragment",
    prefix: "frag",
    allocationOwner: "layout-engine",
    scopeKind: "layout-input",
  },
  request: {
    identityClass: "request",
    prefix: "req",
    allocationOwner: "boundary-owner",
    scopeKind: "global",
  },
  job: {
    identityClass: "job",
    prefix: "job",
    allocationOwner: "backend-job-service",
    scopeKind: "global",
  },
  artifact: {
    identityClass: "artifact",
    prefix: "artf",
    allocationOwner: "backend-artifact-service",
    scopeKind: "global",
  },
} as const satisfies Record<VNextAllocatedIdentityKindV1, VNextIdentityProfileV1>

const OpaqueIdSchema = z.string().min(1).max(VNEXT_OPAQUE_ID_MAX_LENGTH).regex(
  /^[a-z]+_[A-Za-z0-9_-]{12,64}$/,
  "id must contain a registered lowercase prefix and a 12-64 character opaque payload",
)

export const VNextAllocatedIdentityV1Schema = z.object({
  contractVersion: z.literal(VNEXT_IDENTITY_STANDARD_VERSION),
  kind: z.literal("allocated-identity"),
  identityKind: VNextAllocatedIdentityKindV1Schema,
  identityClass: VNextAllocatedIdentityClassV1Schema,
  id: OpaqueIdSchema,
  allocationOwner: VNextIdentityAllocationOwnerV1Schema,
  allocationStrategy: VNextIdentityAllocationStrategyV1Schema,
  scope: VNextIdentityScopeV1Schema,
}).strict().superRefine((identity, ctx) => {
  const profile = VNEXT_IDENTITY_PROFILES_V1[identity.identityKind]
  if (identity.identityClass !== profile.identityClass) {
    ctx.addIssue({
      code: "custom",
      path: ["identityClass"],
      message: `${identity.identityKind} requires identity class ${profile.identityClass}`,
    })
  }
  if (!identity.id.startsWith(`${profile.prefix}_`)) {
    ctx.addIssue({
      code: "custom",
      path: ["id"],
      message: `${identity.identityKind} requires id prefix ${profile.prefix}_`,
    })
  }
  if (identity.allocationOwner !== profile.allocationOwner) {
    ctx.addIssue({
      code: "custom",
      path: ["allocationOwner"],
      message: `${identity.identityKind} requires allocation owner ${profile.allocationOwner}`,
    })
  }
  if (identity.scope.kind !== profile.scopeKind) {
    ctx.addIssue({
      code: "custom",
      path: ["scope", "kind"],
      message: `${identity.identityKind} requires scope ${profile.scopeKind}`,
    })
  }
})

export const VNextDerivedIdentityOriginKindV1Schema = z.enum([
  "materialization",
  "collection-row",
  "static-row",
  "resolved-cell",
  "resolved-group",
  "layout-fragment",
  "external-request",
  "job",
  "artifact",
])

const OriginRefsSchema = z.record(z.string().min(1), NonBlankStringSchema).refine(
  (refs) => Object.keys(refs).length > 0 && Object.keys(refs).length <= 32,
  "origin refs must contain 1-32 named references",
)
const RevisionPinsSchema = z.record(z.string().min(1), RevisionSchema).refine(
  (pins) => Object.keys(pins).length <= 32,
  "revision pins must contain at most 32 named pins",
)

export const VNextDerivedIdentityOriginV1Schema = z.object({
  kind: VNextDerivedIdentityOriginKindV1Schema,
  refs: OriginRefsSchema,
  revisionPins: RevisionPinsSchema,
}).strict()

export const VNextDerivedIdentityProvenanceV1Schema = z.object({
  contractVersion: z.literal(VNEXT_IDENTITY_STANDARD_VERSION),
  kind: z.literal("derived-identity-provenance"),
  identity: VNextAllocatedIdentityV1Schema,
  origin: VNextDerivedIdentityOriginV1Schema,
  allocationInputKey: NonBlankStringSchema,
}).strict()

export type VNextAllocatedIdentityV1 = z.infer<typeof VNextAllocatedIdentityV1Schema>
export type VNextDerivedIdentityOriginV1 = z.infer<typeof VNextDerivedIdentityOriginV1Schema>
export type VNextDerivedIdentityProvenanceV1 = z.infer<typeof VNextDerivedIdentityProvenanceV1Schema>

export interface VNextIdentityStandardIssue {
  code: string
  message: string
  path: string
  severity: "error"
}

export type VNextAllocatedIdentityParseResult =
  | { ok: true; identity: VNextAllocatedIdentityV1; issues: [] }
  | { ok: false; reason: "invalid-allocated-identity"; issues: VNextIdentityStandardIssue[] }

export type VNextDerivedIdentityProvenanceParseResult =
  | { ok: true; provenance: VNextDerivedIdentityProvenanceV1; issues: [] }
  | { ok: false; reason: "invalid-derived-identity-provenance"; issues: VNextIdentityStandardIssue[] }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function parseIssues(issues: z.core.$ZodIssue[]): VNextIdentityStandardIssue[] {
  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: formatIssuePath(issue.path),
    severity: "error",
  }))
}

export function safeParseVNextAllocatedIdentityV1(value: unknown): VNextAllocatedIdentityParseResult {
  const result = VNextAllocatedIdentityV1Schema.safeParse(value)
  if (!result.success) {
    return {
      ok: false,
      reason: "invalid-allocated-identity",
      issues: parseIssues(result.error.issues),
    }
  }
  return { ok: true, identity: result.data, issues: [] }
}

export function safeParseVNextDerivedIdentityProvenanceV1(
  value: unknown,
): VNextDerivedIdentityProvenanceParseResult {
  const result = VNextDerivedIdentityProvenanceV1Schema.safeParse(value)
  if (!result.success) {
    return {
      ok: false,
      reason: "invalid-derived-identity-provenance",
      issues: parseIssues(result.error.issues),
    }
  }
  return { ok: true, provenance: result.data, issues: [] }
}
