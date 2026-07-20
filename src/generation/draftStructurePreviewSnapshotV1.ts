import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { VNextStructureDefinitionDraftIdentityV1Schema } from "../lifecycle/structureIdentity.js"

export const VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_SOURCE = (
  "vnext-draft-structure-preview-snapshot"
) as const
export const VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const RevisionSchema = z.number().int().nonnegative()
const FingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]),
  )
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(canonicalValue(value)))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const DraftStructurePreviewSnapshotFactsV1Schema = z.object({
  source: z.literal(VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_SOURCE),
  contractVersion: z.literal(VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_CONTRACT_VERSION),
  kind: z.literal("draft-structure-preview-snapshot"),
  snapshotId: NonBlankIdSchema,
  draft: VNextStructureDefinitionDraftIdentityV1Schema,
  authoring: z.object({
    documentId: NonBlankIdSchema,
    documentRevision: RevisionSchema,
  }).strict(),
  sourcePackage: z.object({
    packageId: NonBlankIdSchema,
    packageVersion: z.number().int().positive(),
    documentVersion: z.number().int().positive(),
    packageFingerprint: FingerprintSchema,
  }).strict(),
  contracts: z.object({
    immutableSnapshot: z.literal(true),
    exactDraftRevision: z.literal(true),
    localPreviewOnly: z.literal(true),
    publishedStructureVersion: z.literal(false),
    publishedApiParity: z.literal(false),
    businessValuesIncluded: z.literal(false),
    productionBinding: z.literal(false),
  }).strict(),
}).strict().superRefine((snapshot, ctx) => {
  if (snapshot.authoring.documentRevision !== snapshot.draft.revision) ctx.addIssue({
    code: "custom",
    path: ["authoring", "documentRevision"],
    message: "authoring document revision must match the exact draft revision",
  })
})

function snapshotFacts(
  value: z.infer<typeof DraftStructurePreviewSnapshotFactsV1Schema> & { snapshotFingerprint?: string },
): z.infer<typeof DraftStructurePreviewSnapshotFactsV1Schema> {
  return {
    source: value.source,
    contractVersion: value.contractVersion,
    kind: value.kind,
    snapshotId: value.snapshotId,
    draft: value.draft,
    authoring: value.authoring,
    sourcePackage: value.sourcePackage,
    contracts: value.contracts,
  }
}

export const VNextDraftStructurePreviewSnapshotV1Schema = (
  DraftStructurePreviewSnapshotFactsV1Schema.extend({
    snapshotFingerprint: FingerprintSchema,
  }).strict().superRefine((snapshot, ctx) => {
    const expected = fingerprint(snapshotFacts(snapshot))
    if (snapshot.snapshotFingerprint !== expected) ctx.addIssue({
      code: "custom",
      path: ["snapshotFingerprint"],
      message: "draft preview snapshot fingerprint does not match its canonical facts",
    })
  })
)

export type VNextDraftStructurePreviewSnapshotV1 = z.infer<
  typeof VNextDraftStructurePreviewSnapshotV1Schema
>

export interface VNextDraftStructurePreviewSnapshotCreateInputV1 {
  snapshotId: string
  draft: z.input<typeof VNextStructureDefinitionDraftIdentityV1Schema>
  authoring: {
    documentId: string
    documentRevision: number
  }
  sourcePackage: {
    packageId: string
    packageVersion: number
    documentVersion: number
    packageFingerprint: string
  }
}

export function createVNextDraftStructurePreviewSnapshotV1(
  input: VNextDraftStructurePreviewSnapshotCreateInputV1,
): VNextDraftStructurePreviewSnapshotV1 {
  const facts = DraftStructurePreviewSnapshotFactsV1Schema.parse({
    source: VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_SOURCE,
    contractVersion: VNEXT_DRAFT_STRUCTURE_PREVIEW_SNAPSHOT_CONTRACT_VERSION,
    kind: "draft-structure-preview-snapshot",
    ...clone(input),
    contracts: {
      immutableSnapshot: true,
      exactDraftRevision: true,
      localPreviewOnly: true,
      publishedStructureVersion: false,
      publishedApiParity: false,
      businessValuesIncluded: false,
      productionBinding: false,
    },
  })
  return VNextDraftStructurePreviewSnapshotV1Schema.parse({
    ...facts,
    snapshotFingerprint: fingerprint(facts),
  })
}
