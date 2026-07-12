import { z } from "zod"
import { VNextDocumentInstanceIdentityV1Schema } from "../lifecycle/structureIdentity.js"
import { DataSnapshotV2ValueSchema } from "../persistence/packageV3ImageTarget.js"

export const VNEXT_TABLE_COLLECTION_SNAPSHOT_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const RevisionSchema = z.number().int().nonnegative()

export const VNextTableCollectionItemV1Schema = z.object({
  itemKey: NonBlankIdSchema,
  values: z.record(NonBlankIdSchema, DataSnapshotV2ValueSchema),
}).strict()

export const VNextTableCollectionValueV1Schema = z.object({
  collectionFieldKey: NonBlankIdSchema,
  items: z.array(VNextTableCollectionItemV1Schema),
}).strict().superRefine((collection, ctx) => {
  const keys = new Set<string>()
  collection.items.forEach((item, index) => {
    if (keys.has(item.itemKey)) ctx.addIssue({
      code: "custom",
      path: ["items", index, "itemKey"],
      message: `duplicate collection item key "${item.itemKey}"`,
    })
    keys.add(item.itemKey)
  })
})

export const VNextTableCollectionSnapshotV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_COLLECTION_SNAPSHOT_CONTRACT_VERSION),
  kind: z.literal("table-collection-snapshot"),
  collectionSnapshotId: NonBlankIdSchema,
  snapshotRevision: RevisionSchema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  collections: z.record(NonBlankIdSchema, VNextTableCollectionValueV1Schema),
}).strict().superRefine((snapshot, ctx) => {
  Object.entries(snapshot.collections).forEach(([key, collection]) => {
    if (key !== collection.collectionFieldKey) ctx.addIssue({
      code: "custom",
      path: ["collections", key, "collectionFieldKey"],
      message: "collection record key must equal collectionFieldKey",
    })
  })
})

export type VNextTableCollectionItemV1 = z.infer<typeof VNextTableCollectionItemV1Schema>
export type VNextTableCollectionValueV1 = z.infer<typeof VNextTableCollectionValueV1Schema>
export type VNextTableCollectionSnapshotV1 = z.infer<typeof VNextTableCollectionSnapshotV1Schema>

export interface VNextTableCollectionSnapshotIssue {
  code: string
  message: string
  path: string
  severity: "error"
}

export type VNextTableCollectionSnapshotParseResult =
  | { ok: true; snapshot: VNextTableCollectionSnapshotV1; issues: [] }
  | { ok: false; reason: "invalid-table-collection-snapshot"; issues: VNextTableCollectionSnapshotIssue[] }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

export function safeParseVNextTableCollectionSnapshotV1(
  value: unknown,
): VNextTableCollectionSnapshotParseResult {
  const result = VNextTableCollectionSnapshotV1Schema.safeParse(value)
  if (!result.success) return {
    ok: false,
    reason: "invalid-table-collection-snapshot",
    issues: result.error.issues.map((item) => ({
      code: item.code,
      message: item.message,
      path: formatIssuePath(item.path),
      severity: "error",
    })),
  }
  return { ok: true, snapshot: result.data, issues: [] }
}
