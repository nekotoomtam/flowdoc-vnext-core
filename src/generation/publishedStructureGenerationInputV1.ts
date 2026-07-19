import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNextDocumentInstanceIdentityV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextPublishedStructureVersionRefV1Schema,
  sameVNextPublishedStructureVersionRefV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"
import {
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextPublishedFieldContractV1Schema,
  type VNextInstanceDataSnapshotV1,
  type VNextInstanceMediaSnapshotV1,
  type VNextPublishedFieldContractV1,
} from "../resolution/resolutionInputPins.js"
import {
  VNextPublishedCollectionItemContractV1Schema,
  type VNextPublishedCollectionItemContractV1,
} from "../table/collectionItemContractV1.js"
import {
  VNextTableCollectionSnapshotV1Schema,
  type VNextTableCollectionSnapshotV1,
} from "../table/tableCollectionSnapshotV1.js"

export const VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_SOURCE = (
  "vnext-published-structure-generation-input"
) as const
export const VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const FingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)
const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/u)

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

function publishedRef(
  identity: VNextPublishedStructureVersionIdentityV1,
): VNextPublishedStructureVersionRefV1 {
  return VNextPublishedStructureVersionRefV1Schema.parse({
    structureId: identity.structureId,
    structureVersionId: identity.structureVersionId,
    versionOrdinal: identity.versionOrdinal,
  })
}

const PublishedGenerationDataContractBaseV1Schema = z.object({
  contractVersion: z.literal(VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION),
  kind: z.literal("published-structure-generation-data-contract"),
  dataContractId: NonBlankIdSchema,
  publishedStructure: VNextPublishedStructureVersionIdentityV1Schema,
  publishedStructureFingerprint: FingerprintSchema,
  fieldContract: VNextPublishedFieldContractV1Schema,
  collectionItemContract: VNextPublishedCollectionItemContractV1Schema.nullable(),
  snapshotContracts: z.object({
    dataSnapshot: z.literal("instance-data-snapshot-v1"),
    collectionSnapshot: z.literal("table-collection-snapshot-v1"),
    mediaSnapshot: z.literal("instance-media-snapshot-v1"),
  }).strict(),
}).strict()

function dataContractFacts(
  value: z.infer<typeof PublishedGenerationDataContractBaseV1Schema> & { dataContractFingerprint?: string },
): z.infer<typeof PublishedGenerationDataContractBaseV1Schema> {
  return {
    contractVersion: value.contractVersion,
    kind: value.kind,
    dataContractId: value.dataContractId,
    publishedStructure: value.publishedStructure,
    publishedStructureFingerprint: value.publishedStructureFingerprint,
    fieldContract: value.fieldContract,
    collectionItemContract: value.collectionItemContract,
    snapshotContracts: value.snapshotContracts,
  }
}

export const VNextPublishedStructureGenerationDataContractV1Schema = (
  PublishedGenerationDataContractBaseV1Schema.extend({
    dataContractFingerprint: FingerprintSchema,
  }).strict().superRefine((contract, ctx) => {
    const owner = publishedRef(contract.publishedStructure)
    if (!sameVNextPublishedStructureVersionRefV1(contract.fieldContract.owner, owner)) ctx.addIssue({
      code: "custom",
      path: ["fieldContract", "owner"],
      message: "published field contract must belong to the exact Published Structure Version",
    })

    const itemContract = contract.collectionItemContract
    if (itemContract != null) {
      if (!sameVNextPublishedStructureVersionRefV1(itemContract.owner, owner)) ctx.addIssue({
        code: "custom",
        path: ["collectionItemContract", "owner"],
        message: "collection item contract must belong to the exact Published Structure Version",
      })
      if (itemContract.publishedFieldContractId !== contract.fieldContract.fieldContractId) ctx.addIssue({
        code: "custom",
        path: ["collectionItemContract", "publishedFieldContractId"],
        message: "collection item contract must refine the published field contract",
      })
      Object.keys(itemContract.collections).forEach((fieldKey) => {
        if (contract.fieldContract.registry.fields[fieldKey]?.type !== "collection") ctx.addIssue({
          code: "custom",
          path: ["collectionItemContract", "collections", fieldKey],
          message: `collection item shape requires collection field "${fieldKey}" in the published field contract`,
        })
      })
    }

    const expected = fingerprint(dataContractFacts(contract))
    if (contract.dataContractFingerprint !== expected) ctx.addIssue({
      code: "custom",
      path: ["dataContractFingerprint"],
      message: "generation data contract fingerprint does not match its canonical facts",
    })
  })
)

export type VNextPublishedStructureGenerationDataContractV1 = z.infer<
  typeof VNextPublishedStructureGenerationDataContractV1Schema
>

export interface VNextPublishedStructureGenerationDataContractCreateInputV1 {
  dataContractId: string
  publishedStructure: VNextPublishedStructureVersionIdentityV1
  publishedStructureFingerprint: string
  fieldContract: VNextPublishedFieldContractV1
  collectionItemContract: VNextPublishedCollectionItemContractV1 | null
}

export function createVNextPublishedStructureGenerationDataContractV1(
  input: VNextPublishedStructureGenerationDataContractCreateInputV1,
): VNextPublishedStructureGenerationDataContractV1 {
  const facts = PublishedGenerationDataContractBaseV1Schema.parse({
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION,
    kind: "published-structure-generation-data-contract",
    ...input,
    snapshotContracts: {
      dataSnapshot: "instance-data-snapshot-v1",
      collectionSnapshot: "table-collection-snapshot-v1",
      mediaSnapshot: "instance-media-snapshot-v1",
    },
  })
  return VNextPublishedStructureGenerationDataContractV1Schema.parse({
    ...facts,
    dataContractFingerprint: fingerprint(facts),
  })
}

export const VNextPublishedStructureMappingExecutionV1Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("named-adapter"),
    adapterId: NonBlankIdSchema,
    adapterVersion: z.number().int().positive(),
    implementationFingerprint: FingerprintSchema,
  }).strict(),
  z.object({
    kind: z.literal("declarative-mapping"),
    mappingLanguageId: NonBlankIdSchema,
    mappingLanguageVersion: z.number().int().positive(),
    definitionFingerprint: FingerprintSchema,
    executorFingerprint: FingerprintSchema,
  }).strict(),
])

const PublishedStructureMappingProfileBaseV1Schema = z.object({
  contractVersion: z.literal(VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION),
  kind: z.literal("published-structure-mapping-profile"),
  mappingProfileId: NonBlankIdSchema,
  mappingProfileVersion: z.number().int().positive(),
  owner: VNextPublishedStructureVersionRefV1Schema,
  sourceContract: z.object({
    sourceContractId: NonBlankIdSchema,
    sourceContractVersion: z.number().int().positive(),
    schemaFingerprint: FingerprintSchema,
  }).strict(),
  target: z.object({
    dataContractId: NonBlankIdSchema,
    dataContractFingerprint: FingerprintSchema,
  }).strict(),
  execution: VNextPublishedStructureMappingExecutionV1Schema,
  policies: z.object({
    sourceSpecific: z.literal(true),
    canonicalSnapshotOutputOnly: z.literal(true),
    layoutFactsAccepted: z.literal(false),
    rendererFactsAccepted: z.literal(false),
    browserExecutionAuthoritative: z.literal(false),
  }).strict(),
}).strict()

function mappingProfileFacts(
  value: z.infer<typeof PublishedStructureMappingProfileBaseV1Schema> & { profileFingerprint?: string },
): z.infer<typeof PublishedStructureMappingProfileBaseV1Schema> {
  return {
    contractVersion: value.contractVersion,
    kind: value.kind,
    mappingProfileId: value.mappingProfileId,
    mappingProfileVersion: value.mappingProfileVersion,
    owner: value.owner,
    sourceContract: value.sourceContract,
    target: value.target,
    execution: value.execution,
    policies: value.policies,
  }
}

export const VNextPublishedStructureMappingProfileV1Schema = (
  PublishedStructureMappingProfileBaseV1Schema.extend({
    profileFingerprint: FingerprintSchema,
  }).strict().superRefine((profile, ctx) => {
    const expected = fingerprint(mappingProfileFacts(profile))
    if (profile.profileFingerprint !== expected) ctx.addIssue({
      code: "custom",
      path: ["profileFingerprint"],
      message: "mapping profile fingerprint does not match its canonical facts",
    })
  })
)

export type VNextPublishedStructureMappingExecutionV1 = z.infer<
  typeof VNextPublishedStructureMappingExecutionV1Schema
>
export type VNextPublishedStructureMappingProfileV1 = z.infer<
  typeof VNextPublishedStructureMappingProfileV1Schema
>

export interface VNextPublishedStructureMappingProfileCreateInputV1 {
  mappingProfileId: string
  mappingProfileVersion: number
  owner: VNextPublishedStructureVersionRefV1
  sourceContract: {
    sourceContractId: string
    sourceContractVersion: number
    schemaFingerprint: string
  }
  target: {
    dataContractId: string
    dataContractFingerprint: string
  }
  execution: VNextPublishedStructureMappingExecutionV1
}

export function createVNextPublishedStructureMappingProfileV1(
  input: VNextPublishedStructureMappingProfileCreateInputV1,
): VNextPublishedStructureMappingProfileV1 {
  const facts = PublishedStructureMappingProfileBaseV1Schema.parse({
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION,
    kind: "published-structure-mapping-profile",
    ...input,
    policies: {
      sourceSpecific: true,
      canonicalSnapshotOutputOnly: true,
      layoutFactsAccepted: false,
      rendererFactsAccepted: false,
      browserExecutionAuthoritative: false,
    },
  })
  return VNextPublishedStructureMappingProfileV1Schema.parse({
    ...facts,
    profileFingerprint: fingerprint(facts),
  })
}

export const VNextPublishedStructureCanonicalSnapshotInputV1Schema = z.object({
  kind: z.literal("canonical-snapshot-input"),
  dataSnapshot: VNextInstanceDataSnapshotV1Schema,
  collectionSnapshots: z.array(VNextTableCollectionSnapshotV1Schema),
  mediaSnapshot: VNextInstanceMediaSnapshotV1Schema,
}).strict()

export const VNextPublishedStructureAdaptedPayloadInputV1Schema = z.object({
  kind: z.literal("adapted-payload-input"),
  payload: z.object({
    payloadId: NonBlankIdSchema,
    mediaType: z.literal("application/json"),
    byteLength: z.number().int().positive(),
    byteSha256: Sha256HexSchema,
  }).strict(),
  mappingProfile: VNextPublishedStructureMappingProfileV1Schema,
}).strict()

export const VNextPublishedStructureGenerationInputRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION),
  kind: z.literal("published-structure-generation-input-request"),
  dataContract: VNextPublishedStructureGenerationDataContractV1Schema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  input: z.discriminatedUnion("kind", [
    VNextPublishedStructureCanonicalSnapshotInputV1Schema,
    VNextPublishedStructureAdaptedPayloadInputV1Schema,
  ]),
}).strict()

export type VNextPublishedStructureCanonicalSnapshotInputV1 = z.infer<
  typeof VNextPublishedStructureCanonicalSnapshotInputV1Schema
>
export type VNextPublishedStructureAdaptedPayloadInputV1 = z.infer<
  typeof VNextPublishedStructureAdaptedPayloadInputV1Schema
>
export type VNextPublishedStructureGenerationInputRequestV1 = z.infer<
  typeof VNextPublishedStructureGenerationInputRequestV1Schema
>

export type VNextPublishedStructureGenerationInputIssueCode =
  | "invalid-request"
  | "instance-structure-version-mismatch"
  | "snapshot-instance-mismatch"
  | "collection-snapshot-revision-mismatch"
  | "duplicate-collection-snapshot-id"
  | "duplicate-collection-field-key"
  | "unknown-data-field"
  | "collection-field-in-scalar-data"
  | "unknown-collection-field"
  | "unknown-collection-item-field"
  | "mapping-owner-version-mismatch"
  | "mapping-target-contract-mismatch"

export interface VNextPublishedStructureGenerationInputIssueV1 {
  source: "schema" | "identity" | "snapshot" | "contract" | "mapping"
  severity: "error"
  code: VNextPublishedStructureGenerationInputIssueCode
  path: string
  message: string
}

export interface VNextPublishedStructureGenerationDataContractSummaryV1 {
  dataContractId: string
  dataContractFingerprint: string
  publishedStructureFingerprint: string
  fieldContractId: string
  fieldContractFingerprint: string
  collectionItemContractId: string | null
  collectionItemContractFingerprint: string | null
  collectionFieldKeys: string[]
}

export interface VNextPublishedStructureDirectInputSummaryV1 {
  kind: "canonical-snapshot-input"
  status: "runtime-validation-required"
  dataSnapshot: { dataSnapshotId: string; fingerprint: string; valueCount: number }
  collectionSnapshots: Array<{
    collectionSnapshotId: string
    fingerprint: string
    collectionFieldKeys: string[]
    itemCount: number
  }>
  mediaSnapshot: { mediaSnapshotId: string; fingerprint: string; assetCount: number }
  inputFingerprint: string
}

export interface VNextPublishedStructureAdaptedInputSummaryV1 {
  kind: "adapted-payload-input"
  status: "mapping-required"
  payload: {
    payloadId: string
    mediaType: "application/json"
    byteLength: number
    byteSha256: string
  }
  mappingProfile: {
    mappingProfileId: string
    mappingProfileVersion: number
    profileFingerprint: string
    sourceContractId: string
    sourceContractVersion: number
    executionKind: "named-adapter" | "declarative-mapping"
  }
  inputFingerprint: string
}

export interface VNextPublishedStructureGenerationInputPlanV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION
  kind: "published-structure-generation-input-plan"
  status: "planned"
  publishedStructure: VNextPublishedStructureVersionRefV1
  instance: VNextDocumentInstanceIdentityV1
  dataContract: VNextPublishedStructureGenerationDataContractSummaryV1
  input: VNextPublishedStructureDirectInputSummaryV1 | VNextPublishedStructureAdaptedInputSummaryV1
  nextStep: "runtime-validation" | "mapping"
  execution: {
    mapping: "not-required" | "required-not-run"
    runtimeValidation: "not-run"
    materialization: "not-run"
    resolution: "not-run"
    measurement: "not-run"
    pagination: "not-run"
    artifact: "not-run"
  }
  contracts: {
    flowDocOwnedStructure: true
    callerOwnedData: true
    fieldPresentationSeparated: true
    rawPayloadRetainedInPlan: false
    layoutFactsAcceptedFromCaller: false
    rendererFactsAcceptedFromCaller: false
    browserMappingAuthoritative: false
    productionBinding: false
  }
  planFingerprint: string
  issues: []
}

export interface VNextPublishedStructureGenerationInputBlockedV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION
  status: "blocked"
  plan: null
  issues: VNextPublishedStructureGenerationInputIssueV1[]
}

export type VNextPublishedStructureGenerationInputResultV1 =
  | VNextPublishedStructureGenerationInputPlanV1
  | VNextPublishedStructureGenerationInputBlockedV1

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function blocked(
  issues: VNextPublishedStructureGenerationInputIssueV1[],
): VNextPublishedStructureGenerationInputBlockedV1 {
  return {
    source: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION,
    status: "blocked",
    plan: null,
    issues,
  }
}

function sameInstance(
  left: VNextDocumentInstanceIdentityV1,
  right: VNextDocumentInstanceIdentityV1,
): boolean {
  return left.instanceId === right.instanceId
    && left.revision === right.revision
    && sameVNextPublishedStructureVersionRefV1(left.structureVersion, right.structureVersion)
}

function semanticIssues(
  request: VNextPublishedStructureGenerationInputRequestV1,
): VNextPublishedStructureGenerationInputIssueV1[] {
  const issues: VNextPublishedStructureGenerationInputIssueV1[] = []
  const structure = publishedRef(request.dataContract.publishedStructure)
  const push = (
    source: VNextPublishedStructureGenerationInputIssueV1["source"],
    code: VNextPublishedStructureGenerationInputIssueCode,
    path: string,
    message: string,
  ): void => { issues.push({ source, severity: "error", code, path, message }) }

  if (!sameVNextPublishedStructureVersionRefV1(request.instance.structureVersion, structure)) push(
    "identity",
    "instance-structure-version-mismatch",
    "instance.structureVersion",
    "generation instance must pin the exact Published Structure Version",
  )

  if (request.input.kind === "adapted-payload-input") {
    const profile = request.input.mappingProfile
    if (!sameVNextPublishedStructureVersionRefV1(profile.owner, structure)) push(
      "mapping",
      "mapping-owner-version-mismatch",
      "input.mappingProfile.owner",
      "mapping profile must belong to the exact Published Structure Version",
    )
    if (
      profile.target.dataContractId !== request.dataContract.dataContractId
      || profile.target.dataContractFingerprint !== request.dataContract.dataContractFingerprint
    ) push(
      "mapping",
      "mapping-target-contract-mismatch",
      "input.mappingProfile.target",
      "mapping profile must target the exact generation data contract",
    )
    return issues
  }

  const direct = request.input
  const exactSnapshots = [direct.dataSnapshot.instance, direct.mediaSnapshot.instance]
  exactSnapshots.forEach((instance, index) => {
    if (!sameInstance(instance, request.instance)) push(
      "snapshot",
      "snapshot-instance-mismatch",
      index === 0 ? "input.dataSnapshot.instance" : "input.mediaSnapshot.instance",
      "canonical snapshot must pin the exact generation instance revision",
    )
  })

  const fieldDefinitions = request.dataContract.fieldContract.registry.fields
  Object.keys(direct.dataSnapshot.data.values).forEach((fieldKey) => {
    const field = fieldDefinitions[fieldKey]
    if (field == null) push(
      "contract", "unknown-data-field", `input.dataSnapshot.data.values.${fieldKey}`,
      `canonical Data Snapshot contains unknown field "${fieldKey}"`,
    )
    else if (field.type === "collection") push(
      "contract", "collection-field-in-scalar-data", `input.dataSnapshot.data.values.${fieldKey}`,
      `collection field "${fieldKey}" must use a collection snapshot`,
    )
  })

  const collectionShapes = request.dataContract.collectionItemContract?.collections ?? {}
  const snapshotIds = new Set<string>()
  const collectionKeys = new Set<string>()
  direct.collectionSnapshots.forEach((snapshot, snapshotIndex) => {
    const path = `input.collectionSnapshots[${snapshotIndex}]`
    if (!sameInstance(snapshot.instance, request.instance)) push(
      "snapshot", "snapshot-instance-mismatch", `${path}.instance`,
      "collection snapshot must pin the exact generation instance revision",
    )
    if (snapshot.snapshotRevision !== request.instance.revision) push(
      "snapshot", "collection-snapshot-revision-mismatch", `${path}.snapshotRevision`,
      "collection snapshot revision must equal the generation instance revision",
    )
    if (snapshotIds.has(snapshot.collectionSnapshotId)) push(
      "snapshot", "duplicate-collection-snapshot-id", `${path}.collectionSnapshotId`,
      `duplicate collection snapshot id "${snapshot.collectionSnapshotId}"`,
    )
    snapshotIds.add(snapshot.collectionSnapshotId)

    Object.entries(snapshot.collections).forEach(([collectionFieldKey, collection]) => {
      const collectionPath = `${path}.collections.${collectionFieldKey}`
      if (collectionKeys.has(collectionFieldKey)) push(
        "snapshot", "duplicate-collection-field-key", collectionPath,
        `collection field "${collectionFieldKey}" appears in more than one snapshot`,
      )
      collectionKeys.add(collectionFieldKey)
      const shape = collectionShapes[collectionFieldKey]
      if (shape == null) push(
        "contract", "unknown-collection-field", collectionPath,
        `collection snapshot contains unknown collection field "${collectionFieldKey}"`,
      )
      else collection.items.forEach((item, itemIndex) => {
        Object.keys(item.values).forEach((itemFieldKey) => {
          if (shape.fields[itemFieldKey] == null) push(
            "contract", "unknown-collection-item-field",
            `${collectionPath}.items[${itemIndex}].values.${itemFieldKey}`,
            `collection item contains unknown field "${itemFieldKey}"`,
          )
        })
      })
    })
  })

  return issues
}

function dataContractSummary(
  contract: VNextPublishedStructureGenerationDataContractV1,
): VNextPublishedStructureGenerationDataContractSummaryV1 {
  return {
    dataContractId: contract.dataContractId,
    dataContractFingerprint: contract.dataContractFingerprint,
    publishedStructureFingerprint: contract.publishedStructureFingerprint,
    fieldContractId: contract.fieldContract.fieldContractId,
    fieldContractFingerprint: fingerprint(contract.fieldContract),
    collectionItemContractId: contract.collectionItemContract?.collectionItemContractId ?? null,
    collectionItemContractFingerprint: contract.collectionItemContract == null
      ? null
      : fingerprint(contract.collectionItemContract),
    collectionFieldKeys: Object.keys(contract.collectionItemContract?.collections ?? {}).sort(),
  }
}

function directSummary(
  input: VNextPublishedStructureCanonicalSnapshotInputV1,
): VNextPublishedStructureDirectInputSummaryV1 {
  const facts = {
    kind: "canonical-snapshot-input" as const,
    status: "runtime-validation-required" as const,
    dataSnapshot: {
      dataSnapshotId: input.dataSnapshot.dataSnapshotId,
      fingerprint: fingerprint(input.dataSnapshot),
      valueCount: Object.keys(input.dataSnapshot.data.values).length,
    },
    collectionSnapshots: input.collectionSnapshots.map((snapshot) => ({
      collectionSnapshotId: snapshot.collectionSnapshotId,
      fingerprint: fingerprint(snapshot),
      collectionFieldKeys: Object.keys(snapshot.collections).sort(),
      itemCount: Object.values(snapshot.collections).reduce(
        (count, collection) => count + collection.items.length,
        0,
      ),
    })).sort((left, right) => left.collectionSnapshotId.localeCompare(right.collectionSnapshotId)),
    mediaSnapshot: {
      mediaSnapshotId: input.mediaSnapshot.mediaSnapshotId,
      fingerprint: fingerprint(input.mediaSnapshot),
      assetCount: Object.keys(input.mediaSnapshot.registry.images).length,
    },
  }
  return { ...facts, inputFingerprint: fingerprint(facts) }
}

function adaptedSummary(
  input: VNextPublishedStructureAdaptedPayloadInputV1,
): VNextPublishedStructureAdaptedInputSummaryV1 {
  const profile = input.mappingProfile
  const facts = {
    kind: "adapted-payload-input" as const,
    status: "mapping-required" as const,
    payload: clone(input.payload),
    mappingProfile: {
      mappingProfileId: profile.mappingProfileId,
      mappingProfileVersion: profile.mappingProfileVersion,
      profileFingerprint: profile.profileFingerprint,
      sourceContractId: profile.sourceContract.sourceContractId,
      sourceContractVersion: profile.sourceContract.sourceContractVersion,
      executionKind: profile.execution.kind,
    },
  }
  return { ...facts, inputFingerprint: fingerprint(facts) }
}

export function planVNextPublishedStructureGenerationInputV1(
  value: unknown,
): VNextPublishedStructureGenerationInputResultV1 {
  const parsed = VNextPublishedStructureGenerationInputRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => ({
    source: "schema",
    severity: "error",
    code: "invalid-request",
    path: formatIssuePath(item.path),
    message: item.message,
  })))

  const request = parsed.data
  const issues = semanticIssues(request)
  if (issues.length > 0) return blocked(issues)

  const input = request.input.kind === "canonical-snapshot-input"
    ? directSummary(request.input)
    : adaptedSummary(request.input)
  const nextStep = input.kind === "canonical-snapshot-input" ? "runtime-validation" as const : "mapping" as const
  const facts = {
    source: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_INPUT_CONTRACT_VERSION,
    kind: "published-structure-generation-input-plan" as const,
    status: "planned" as const,
    publishedStructure: publishedRef(request.dataContract.publishedStructure),
    instance: clone(request.instance),
    dataContract: dataContractSummary(request.dataContract),
    input,
    nextStep,
    execution: {
      mapping: input.kind === "canonical-snapshot-input" ? "not-required" as const : "required-not-run" as const,
      runtimeValidation: "not-run" as const,
      materialization: "not-run" as const,
      resolution: "not-run" as const,
      measurement: "not-run" as const,
      pagination: "not-run" as const,
      artifact: "not-run" as const,
    },
    contracts: {
      flowDocOwnedStructure: true as const,
      callerOwnedData: true as const,
      fieldPresentationSeparated: true as const,
      rawPayloadRetainedInPlan: false as const,
      layoutFactsAcceptedFromCaller: false as const,
      rendererFactsAcceptedFromCaller: false as const,
      browserMappingAuthoritative: false as const,
      productionBinding: false as const,
    },
  }

  return {
    ...facts,
    planFingerprint: fingerprint(facts),
    issues: [],
  }
}
