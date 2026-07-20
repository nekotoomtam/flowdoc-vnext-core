import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { DataSnapshotV2Value } from "../persistence/packageV3ImageTarget.js"
import { isVNextTableItemValueCompatibleV1 } from "../table/tableContentValuePolicyV1.js"
import {
  VNextPublishedStructureCanonicalSnapshotInputV1Schema,
  VNextPublishedStructureGenerationInputRequestV1Schema,
  VNextPublishedStructureMappingExecutionV1Schema,
  planVNextPublishedStructureGenerationInputV1,
  type VNextPublishedStructureAdaptedPayloadInputV1,
  type VNextPublishedStructureCanonicalSnapshotInputV1,
  type VNextPublishedStructureGenerationDataContractV1,
  type VNextPublishedStructureGenerationInputPlanV1,
  type VNextPublishedStructureGenerationInputRequestV1,
  type VNextPublishedStructureMappingExecutionV1,
  type VNextPublishedStructureMappingProfileV1,
} from "./publishedStructureGenerationInputV1.js"
import type { VNextDocumentInstanceIdentityV1 } from "../lifecycle/structureIdentity.js"

export const VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE = (
  "vnext-published-structure-generation-runtime"
) as const
export const VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/u)
const MappingDiagnosticCodeSchema = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,127}$/u)
const MappingDiagnosticPathSchema = z.string().max(512).refine(
  (value) => !/[\u0000-\u001f\u007f]/u.test(value),
  { message: "mapping diagnostic path must not contain control characters" },
)

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

function canonicalClone<T>(value: T): T {
  return clone(canonicalValue(value)) as T
}

export function createVNextPublishedStructureCanonicalContentFingerprintV1(
  input: VNextPublishedStructureCanonicalSnapshotInputV1,
): string {
  const collections = input.collectionSnapshots
    .flatMap((snapshot) => Object.entries(snapshot.collections).map(([fieldKey, value]) => ({
      fieldKey,
      value,
    })))
    .sort((left, right) => left.fieldKey.localeCompare(right.fieldKey))
  return fingerprint({
    contractVersion: 1,
    kind: "published-structure-canonical-content",
    data: input.dataSnapshot.data,
    collections,
    media: input.mediaSnapshot.registry,
  })
}

export type VNextPublishedStructureJsonPayloadDescriptorV1 = (
  VNextPublishedStructureAdaptedPayloadInputV1["payload"]
)

export function createVNextPublishedStructureJsonPayloadDescriptorV1(
  payloadId: string,
  payloadText: string,
): VNextPublishedStructureJsonPayloadDescriptorV1 {
  return z.object({
    payloadId: NonBlankIdSchema,
    mediaType: z.literal("application/json"),
    byteLength: z.number().int().positive(),
    byteSha256: Sha256HexSchema,
  }).strict().parse({
    payloadId,
    mediaType: "application/json",
    byteLength: new TextEncoder().encode(payloadText).byteLength,
    byteSha256: createVNextCompactFingerprint(payloadText).slice("sha256:".length),
  })
}

export const VNextPublishedStructureMappingDiagnosticRefV1Schema = z.object({
  code: MappingDiagnosticCodeSchema,
  path: MappingDiagnosticPathSchema,
}).strict()

export const VNextPublishedStructureMappingOutputV1Schema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("mapped"),
    canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1Schema,
    warnings: z.array(VNextPublishedStructureMappingDiagnosticRefV1Schema),
  }).strict(),
  z.object({
    status: z.literal("blocked"),
    canonicalInput: z.null(),
    issues: z.array(VNextPublishedStructureMappingDiagnosticRefV1Schema).min(1),
  }).strict(),
])

export type VNextPublishedStructureMappingDiagnosticRefV1 = z.infer<
  typeof VNextPublishedStructureMappingDiagnosticRefV1Schema
>
export type VNextPublishedStructureMappingOutputV1 = z.infer<
  typeof VNextPublishedStructureMappingOutputV1Schema
>

export interface VNextPublishedStructureMappingContextV1 {
  instance: VNextDocumentInstanceIdentityV1
  dataContract: VNextPublishedStructureGenerationDataContractV1
  mappingProfile: VNextPublishedStructureMappingProfileV1
}

export interface VNextPublishedStructureMappingRuntimeV1 {
  execution: VNextPublishedStructureMappingExecutionV1
  map: (
    payload: unknown,
    context: VNextPublishedStructureMappingContextV1,
  ) => unknown
}

export interface VNextPublishedStructureAdaptedRuntimeInputV1 {
  payloadText: string
  mapper: VNextPublishedStructureMappingRuntimeV1
}

export interface VNextPublishedStructureGenerationRuntimeOptionsV1 {
  adaptedInput?: VNextPublishedStructureAdaptedRuntimeInputV1
}

export type VNextPublishedStructureGenerationRuntimeIssueSourceV1 =
  | "planning"
  | "payload"
  | "mapping"
  | "validation"

export type VNextPublishedStructureGenerationRuntimeIssueCodeV1 =
  | "generation-input-blocked"
  | "unexpected-adapted-runtime"
  | "missing-adapted-runtime"
  | "payload-byte-length-mismatch"
  | "payload-fingerprint-mismatch"
  | "invalid-json-payload"
  | "mapping-execution-identity-mismatch"
  | "mapping-execution-failed"
  | "invalid-mapping-result"
  | "mapping-rejected"
  | "invalid-canonical-input"
  | "invalid-scalar-value-type"
  | "missing-instance-media"
  | "missing-required-collection-item-field"
  | "required-collection-item-value-null"
  | "invalid-collection-item-value-type"
  | "unsupported-published-image-default"

export interface VNextPublishedStructureGenerationRuntimeIssueV1 {
  source: VNextPublishedStructureGenerationRuntimeIssueSourceV1
  severity: "error"
  code: VNextPublishedStructureGenerationRuntimeIssueCodeV1
  path: string
  message: string
  detailCode?: string
}

export interface VNextPublishedStructureGenerationRuntimeWarningV1 {
  source: "mapping" | "validation"
  severity: "warning"
  code: "mapping-warning" | "collection-item-default-applied"
  path: string
  message: string
  detailCode?: string
}

export interface VNextPublishedStructureGenerationRuntimeDiagnosticsV1 {
  contentFree: true
  issues: VNextPublishedStructureGenerationRuntimeIssueV1[]
  warnings: VNextPublishedStructureGenerationRuntimeWarningV1[]
  summary: {
    errorCount: number
    warningCount: number
    scalarValueCount: number
    collectionSnapshotCount: number
    collectionItemCount: number
    mediaAssetCount: number
    defaultAppliedCount: number
  }
  diagnosticsFingerprint: string
}

export type VNextPublishedStructureGenerationMappingStatusV1 =
  | "not-required"
  | "not-run"
  | "executed"
  | "blocked"
  | "failed"

interface RuntimeExecutionV1 {
  mapping: VNextPublishedStructureGenerationMappingStatusV1
  runtimeValidation: "not-run" | "run-valid" | "run-blocked"
  materialization: "not-run"
  resolution: "not-run"
  measurement: "not-run"
  pagination: "not-run"
  artifact: "not-run"
}

export interface VNextPublishedStructureGenerationRuntimeReadyV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_CONTRACT_VERSION
  status: "ready" | "ready-with-warnings"
  lane: "direct" | "adapted"
  planFingerprint: string
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1
  canonicalInputFingerprint: string
  canonicalContentFingerprint: string
  mappingProfile: {
    mappingProfileId: string
    mappingProfileVersion: number
    profileFingerprint: string
  } | null
  diagnostics: VNextPublishedStructureGenerationRuntimeDiagnosticsV1
  nextStep: "materialization"
  execution: RuntimeExecutionV1
  contracts: {
    sameValidatorForDirectAndAdapted: true
    rawPayloadRetained: false
    diagnosticsContainBusinessValues: false
    scalarFieldDefinitionFallbackApplied: false
    productionBinding: false
  }
  receiptFingerprint: string
}

export interface VNextPublishedStructureGenerationRuntimeBlockedV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_CONTRACT_VERSION
  status: "blocked"
  lane: "direct" | "adapted" | null
  planFingerprint: string | null
  canonicalInput: null
  canonicalInputFingerprint: null
  canonicalContentFingerprint: null
  mappingProfile: {
    mappingProfileId: string
    mappingProfileVersion: number
    profileFingerprint: string
  } | null
  diagnostics: VNextPublishedStructureGenerationRuntimeDiagnosticsV1
  nextStep: null
  execution: RuntimeExecutionV1
  contracts: {
    sameValidatorForDirectAndAdapted: true
    rawPayloadRetained: false
    diagnosticsContainBusinessValues: false
    scalarFieldDefinitionFallbackApplied: false
    productionBinding: false
  }
  receiptFingerprint: string
}

export type VNextPublishedStructureGenerationRuntimeResultV1 =
  | VNextPublishedStructureGenerationRuntimeReadyV1
  | VNextPublishedStructureGenerationRuntimeBlockedV1

const contracts = {
  sameValidatorForDirectAndAdapted: true as const,
  rawPayloadRetained: false as const,
  diagnosticsContainBusinessValues: false as const,
  scalarFieldDefinitionFallbackApplied: false as const,
  productionBinding: false as const,
}

function issue(
  source: VNextPublishedStructureGenerationRuntimeIssueSourceV1,
  code: VNextPublishedStructureGenerationRuntimeIssueCodeV1,
  path: string,
  message: string,
  detailCode?: string,
): VNextPublishedStructureGenerationRuntimeIssueV1 {
  return { source, severity: "error", code, path, message, ...(detailCode == null ? {} : { detailCode }) }
}

function diagnostics(
  issues: VNextPublishedStructureGenerationRuntimeIssueV1[],
  warnings: VNextPublishedStructureGenerationRuntimeWarningV1[] = [],
  counts: Partial<VNextPublishedStructureGenerationRuntimeDiagnosticsV1["summary"]> = {},
): VNextPublishedStructureGenerationRuntimeDiagnosticsV1 {
  const summary = {
    errorCount: issues.length,
    warningCount: warnings.length,
    scalarValueCount: 0,
    collectionSnapshotCount: 0,
    collectionItemCount: 0,
    mediaAssetCount: 0,
    defaultAppliedCount: 0,
    ...counts,
  }
  const facts = { contentFree: true as const, issues, warnings, summary }
  return { ...facts, diagnosticsFingerprint: fingerprint(facts) }
}

function mappingProfileSummary(
  request: VNextPublishedStructureGenerationInputRequestV1,
): VNextPublishedStructureGenerationRuntimeReadyV1["mappingProfile"] {
  if (request.input.kind !== "adapted-payload-input") return null
  return {
    mappingProfileId: request.input.mappingProfile.mappingProfileId,
    mappingProfileVersion: request.input.mappingProfile.mappingProfileVersion,
    profileFingerprint: request.input.mappingProfile.profileFingerprint,
  }
}

function execution(
  mapping: VNextPublishedStructureGenerationMappingStatusV1,
  runtimeValidation: RuntimeExecutionV1["runtimeValidation"],
): RuntimeExecutionV1 {
  return {
    mapping,
    runtimeValidation,
    materialization: "not-run",
    resolution: "not-run",
    measurement: "not-run",
    pagination: "not-run",
    artifact: "not-run",
  }
}

function blocked(
  lane: VNextPublishedStructureGenerationRuntimeBlockedV1["lane"],
  planFingerprint: string | null,
  mappingProfile: VNextPublishedStructureGenerationRuntimeBlockedV1["mappingProfile"],
  mappingStatus: VNextPublishedStructureGenerationMappingStatusV1,
  runtimeValidation: RuntimeExecutionV1["runtimeValidation"],
  runtimeDiagnostics: VNextPublishedStructureGenerationRuntimeDiagnosticsV1,
): VNextPublishedStructureGenerationRuntimeBlockedV1 {
  const facts = {
    source: VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_CONTRACT_VERSION,
    status: "blocked" as const,
    lane,
    planFingerprint,
    canonicalInput: null,
    canonicalInputFingerprint: null,
    canonicalContentFingerprint: null,
    mappingProfile,
    diagnostics: runtimeDiagnostics,
    nextStep: null,
    execution: execution(mappingStatus, runtimeValidation),
    contracts,
  }
  return { ...facts, receiptFingerprint: fingerprint(facts) }
}

function isImageValue(value: DataSnapshotV2Value): value is { kind: "image-asset-ref"; assetId: string } {
  return typeof value === "object" && value != null && value.kind === "image-asset-ref"
}

function scalarValueCompatible(type: string, value: DataSnapshotV2Value): boolean {
  if (value === null) return true
  if (type === "number") return typeof value === "number" && Number.isFinite(value)
  if (type === "boolean") return typeof value === "boolean"
  if (type === "image") return isImageValue(value)
  if (type === "collection") return false
  return typeof value === "string"
}

interface CanonicalValidationV1 {
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1 | null
  issues: VNextPublishedStructureGenerationRuntimeIssueV1[]
  warnings: VNextPublishedStructureGenerationRuntimeWarningV1[]
  counts: Omit<VNextPublishedStructureGenerationRuntimeDiagnosticsV1["summary"], "errorCount" | "warningCount">
}

function validateCanonicalInput(
  request: VNextPublishedStructureGenerationInputRequestV1,
  input: VNextPublishedStructureCanonicalSnapshotInputV1,
): CanonicalValidationV1 {
  const directRequest: VNextPublishedStructureGenerationInputRequestV1 = {
    contractVersion: request.contractVersion,
    kind: request.kind,
    dataContract: clone(request.dataContract),
    instance: clone(request.instance),
    input: clone(input),
  }
  const planned = planVNextPublishedStructureGenerationInputV1(directRequest)
  if (planned.status === "blocked") return {
    canonicalInput: null,
    issues: planned.issues.map((item) => issue(
      "validation",
      "invalid-canonical-input",
      item.path,
      "canonical snapshot input failed the retained E.1 contract",
      item.code,
    )),
    warnings: [],
    counts: {
      scalarValueCount: 0,
      collectionSnapshotCount: 0,
      collectionItemCount: 0,
      mediaAssetCount: 0,
      defaultAppliedCount: 0,
    },
  }

  const normalized = canonicalClone(input)
  const issues: VNextPublishedStructureGenerationRuntimeIssueV1[] = []
  const warnings: VNextPublishedStructureGenerationRuntimeWarningV1[] = []
  const fields = request.dataContract.fieldContract.registry.fields
  const media = normalized.mediaSnapshot.registry.images

  Object.keys(normalized.dataSnapshot.data.values).sort().forEach((fieldKey) => {
    const value = normalized.dataSnapshot.data.values[fieldKey]!
    const definition = fields[fieldKey]!
    const path = `input.dataSnapshot.data.values.${fieldKey}`
    if (!scalarValueCompatible(definition.type, value)) issues.push(issue(
      "validation", "invalid-scalar-value-type", path,
      `field "${fieldKey}" has a value incompatible with its Published Field Contract type`,
    ))
    else if (isImageValue(value) && media[value.assetId] == null) issues.push(issue(
      "validation", "missing-instance-media", path,
      `image field "${fieldKey}" references media absent from the instance media snapshot`,
    ))
  })

  let collectionItemCount = 0
  let defaultAppliedCount = 0
  normalized.collectionSnapshots
    .sort((left, right) => left.collectionSnapshotId.localeCompare(right.collectionSnapshotId))
    .forEach((snapshot, snapshotIndex) => {
      Object.keys(snapshot.collections).sort().forEach((collectionFieldKey) => {
        const collection = snapshot.collections[collectionFieldKey]!
        const shape = request.dataContract.collectionItemContract!.collections[collectionFieldKey]!
        collection.items.forEach((item, itemIndex) => {
          collectionItemCount += 1
          Object.keys(shape.fields).sort().forEach((itemFieldKey) => {
            const definition = shape.fields[itemFieldKey]!
            const path = (
              `input.collectionSnapshots[${snapshotIndex}].collections.${collectionFieldKey}`
              + `.items[${itemIndex}].values.${itemFieldKey}`
            )
            const present = Object.prototype.hasOwnProperty.call(item.values, itemFieldKey)
            if (!present) {
              if (definition.required) issues.push(issue(
                "validation", "missing-required-collection-item-field", path,
                `required collection item field "${itemFieldKey}" is missing`,
              ))
              else if (definition.fallback != null) {
                if (typeof definition.fallback === "object") issues.push(issue(
                  "validation", "unsupported-published-image-default", path,
                  `image default for collection item field "${itemFieldKey}" requires a later static-media binding`,
                ))
                else {
                  item.values[itemFieldKey] = definition.fallback
                  defaultAppliedCount += 1
                  warnings.push({
                    source: "validation",
                    severity: "warning",
                    code: "collection-item-default-applied",
                    path,
                    message: `typed default applied for optional collection item field "${itemFieldKey}"`,
                  })
                }
              }
              return
            }

            const value = item.values[itemFieldKey]!
            if (definition.required && value === null) issues.push(issue(
              "validation", "required-collection-item-value-null", path,
              `required collection item field "${itemFieldKey}" cannot be null`,
            ))
            else if (!isVNextTableItemValueCompatibleV1(definition.type, value)) issues.push(issue(
              "validation", "invalid-collection-item-value-type", path,
              `collection item field "${itemFieldKey}" has an incompatible value type`,
            ))
            else if (isImageValue(value) && media[value.assetId] == null) issues.push(issue(
              "validation", "missing-instance-media", path,
              `image collection item field "${itemFieldKey}" references absent instance media`,
            ))
          })
        })
      })
    })

  return {
    canonicalInput: issues.length === 0 ? canonicalClone(normalized) : null,
    issues,
    warnings,
    counts: {
      scalarValueCount: Object.keys(normalized.dataSnapshot.data.values).length,
      collectionSnapshotCount: normalized.collectionSnapshots.length,
      collectionItemCount,
      mediaAssetCount: Object.keys(media).length,
      defaultAppliedCount,
    },
  }
}

function runMapping(
  request: VNextPublishedStructureGenerationInputRequestV1,
  runtime: VNextPublishedStructureAdaptedRuntimeInputV1 | undefined,
): {
  status: VNextPublishedStructureGenerationMappingStatusV1
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1 | null
  issues: VNextPublishedStructureGenerationRuntimeIssueV1[]
  warnings: VNextPublishedStructureGenerationRuntimeWarningV1[]
} {
  if (request.input.kind !== "adapted-payload-input") throw new Error("adapted mapping requires adapted input")
  if (runtime == null) return {
    status: "not-run", canonicalInput: null, warnings: [],
    issues: [issue(
      "mapping", "missing-adapted-runtime", "runtime.adaptedInput",
      "adapted input requires an identity-pinned mapping runtime",
    )],
  }

  const actualByteLength = new TextEncoder().encode(runtime.payloadText).byteLength
  if (actualByteLength !== request.input.payload.byteLength) return {
    status: "not-run", canonicalInput: null, warnings: [],
    issues: [issue(
      "payload", "payload-byte-length-mismatch", "runtime.adaptedInput.payloadText",
      "adapted payload byte length does not match the admitted descriptor",
    )],
  }
  const actualSha256 = createVNextCompactFingerprint(runtime.payloadText).slice("sha256:".length)
  if (actualSha256 !== request.input.payload.byteSha256) return {
    status: "not-run", canonicalInput: null, warnings: [],
    issues: [issue(
      "payload", "payload-fingerprint-mismatch", "runtime.adaptedInput.payloadText",
      "adapted payload fingerprint does not match the admitted descriptor",
    )],
  }

  let payload: unknown
  try {
    payload = JSON.parse(runtime.payloadText) as unknown
  } catch {
    return {
      status: "not-run", canonicalInput: null, warnings: [],
      issues: [issue(
        "payload", "invalid-json-payload", "runtime.adaptedInput.payloadText",
        "adapted payload is not valid JSON",
      )],
    }
  }

  const runtimeIdentity = VNextPublishedStructureMappingExecutionV1Schema.safeParse(runtime.mapper.execution)
  if (
    !runtimeIdentity.success
    || fingerprint(runtimeIdentity.data) !== fingerprint(request.input.mappingProfile.execution)
  ) return {
    status: "not-run", canonicalInput: null, warnings: [],
    issues: [issue(
      "mapping", "mapping-execution-identity-mismatch", "runtime.adaptedInput.mapper.execution",
      "mapping runtime identity does not match the admitted mapping profile",
    )],
  }

  let rawResult: unknown
  try {
    rawResult = runtime.mapper.map(payload, {
      instance: clone(request.instance),
      dataContract: clone(request.dataContract),
      mappingProfile: clone(request.input.mappingProfile),
    })
  } catch {
    return {
      status: "failed", canonicalInput: null, warnings: [],
      issues: [issue(
        "mapping", "mapping-execution-failed", "runtime.adaptedInput.mapper",
        "mapping runtime failed without exposing its exception content",
      )],
    }
  }

  const mapped = VNextPublishedStructureMappingOutputV1Schema.safeParse(rawResult)
  if (!mapped.success) return {
    status: "failed", canonicalInput: null, warnings: [],
    issues: [issue(
      "mapping", "invalid-mapping-result", "runtime.adaptedInput.mapper",
      "mapping runtime returned an invalid canonical-output envelope",
    )],
  }
  if (mapped.data.status === "blocked") return {
    status: "blocked",
    canonicalInput: null,
    warnings: [],
    issues: mapped.data.issues.map((item) => issue(
      "mapping", "mapping-rejected", item.path,
      "mapping runtime rejected the payload at a content-free source path",
      item.code,
    )),
  }
  return {
    status: "executed",
    canonicalInput: clone(mapped.data.canonicalInput),
    issues: [],
    warnings: mapped.data.warnings.map((item) => ({
      source: "mapping",
      severity: "warning",
      code: "mapping-warning",
      path: item.path,
      message: "mapping runtime reported a content-free warning",
      detailCode: item.code,
    })),
  }
}

function ready(
  lane: "direct" | "adapted",
  plan: VNextPublishedStructureGenerationInputPlanV1,
  request: VNextPublishedStructureGenerationInputRequestV1,
  mappingStatus: VNextPublishedStructureGenerationMappingStatusV1,
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1,
  runtimeDiagnostics: VNextPublishedStructureGenerationRuntimeDiagnosticsV1,
): VNextPublishedStructureGenerationRuntimeReadyV1 {
  const facts = {
    source: VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_CONTRACT_VERSION,
    status: runtimeDiagnostics.warnings.length === 0 ? "ready" as const : "ready-with-warnings" as const,
    lane,
    planFingerprint: plan.planFingerprint,
    canonicalInput: canonicalClone(canonicalInput),
    canonicalInputFingerprint: fingerprint(canonicalInput),
    canonicalContentFingerprint: createVNextPublishedStructureCanonicalContentFingerprintV1(canonicalInput),
    mappingProfile: mappingProfileSummary(request),
    diagnostics: runtimeDiagnostics,
    nextStep: "materialization" as const,
    execution: execution(mappingStatus, "run-valid"),
    contracts,
  }
  return { ...facts, receiptFingerprint: fingerprint(facts) }
}

export function runVNextPublishedStructureGenerationRuntimeV1(
  value: unknown,
  options: VNextPublishedStructureGenerationRuntimeOptionsV1 = {},
): VNextPublishedStructureGenerationRuntimeResultV1 {
  const planned = planVNextPublishedStructureGenerationInputV1(value)
  if (planned.status === "blocked") {
    const runtimeDiagnostics = diagnostics(planned.issues.map((item) => issue(
      "planning", "generation-input-blocked", item.path,
      "generation input failed the retained E.1 planning contract",
      item.code,
    )))
    return blocked(null, null, null, "not-run", "not-run", runtimeDiagnostics)
  }

  const request = VNextPublishedStructureGenerationInputRequestV1Schema.parse(value)
  const lane = request.input.kind === "canonical-snapshot-input" ? "direct" as const : "adapted" as const
  const profile = mappingProfileSummary(request)
  if (lane === "direct" && options.adaptedInput != null) {
    const runtimeDiagnostics = diagnostics([issue(
      "mapping", "unexpected-adapted-runtime", "runtime.adaptedInput",
      "direct canonical input must not receive an adapted mapping runtime",
    )])
    return blocked(lane, planned.planFingerprint, profile, "not-run", "not-run", runtimeDiagnostics)
  }

  const mapping = lane === "direct"
    ? {
        status: "not-required" as const,
        canonicalInput: clone(request.input as VNextPublishedStructureCanonicalSnapshotInputV1),
        issues: [],
        warnings: [],
      }
    : runMapping(request, options.adaptedInput)
  if (mapping.canonicalInput == null) {
    const runtimeDiagnostics = diagnostics(mapping.issues, mapping.warnings)
    return blocked(lane, planned.planFingerprint, profile, mapping.status, "not-run", runtimeDiagnostics)
  }

  const validation = validateCanonicalInput(request, mapping.canonicalInput)
  const runtimeDiagnostics = diagnostics(
    validation.issues,
    [...mapping.warnings, ...validation.warnings],
    validation.counts,
  )
  if (validation.canonicalInput == null) return blocked(
    lane,
    planned.planFingerprint,
    profile,
    mapping.status,
    "run-blocked",
    runtimeDiagnostics,
  )
  return ready(
    lane,
    planned,
    request,
    mapping.status,
    validation.canonicalInput,
    runtimeDiagnostics,
  )
}
