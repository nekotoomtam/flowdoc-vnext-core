import type { VNextDurableHistorySnapshot } from "../authoring/durableHistory.js"
import type { VNextRichInlineSessionPersistenceRecord } from "../authoring/richInlineSessionPersistence.js"
import type { VNextSessionStorageRecord } from "../authoring/sessionStorage.js"
import type { VNextArtifactJobRecord } from "../generation/artifactJob.js"
import type { VNextArtifactManifestRecord } from "../generation/artifactManifest.js"

export const VNEXT_STORAGE_ADAPTER_SOURCE = "vnext-storage-adapter"
export const VNEXT_STORAGE_ADAPTER_MODE = "interface-only-storage-contract"
export const VNEXT_STORAGE_ADAPTER_SCHEMA_VERSION = 1

export type VNextStorageRecordKind =
  | "package-session"
  | "durable-history"
  | "rich-inline-session"
  | "artifact-manifest"
  | "artifact-job"

export type VNextStorageWriteStatus =
  | "written"
  | "idempotent-replay"
  | "conflict"
  | "invalid-request"

export type VNextStorageReadStatus = "found" | "not-found" | "invalid-request"

export type VNextStorageMaybePromise<T> = T | Promise<T>

export interface VNextStorageAdapterContracts {
  interfaceOnly: true
  concreteBackend: null
  filesystemWrites: false
  databaseWrites: false
  objectStorageWrites: false
  browserStorageWrites: false
  networkCalls: false
  authzExecution: false
  schemaMigration: false
}

export interface VNextStorageOperationIssue {
  severity: "blocking"
  code: string
  path: string
  message: string
}

export interface VNextStorageRecordEnvelope<TRecord> {
  schemaVersion: typeof VNEXT_STORAGE_ADAPTER_SCHEMA_VERSION
  kind: VNextStorageRecordKind
  key: string
  revision: number
  value: TRecord
  metadata: {
    idempotencyKey: string
    writeToken: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface VNextStorageWriteRequest<TRecord> {
  kind: VNextStorageRecordKind
  key: string
  value: TRecord
  expectedRevision: number | null
  idempotencyKey: string
  writeToken?: string | null
  now: string
}

export interface VNextStorageReadRequest {
  kind: VNextStorageRecordKind
  key: string
}

export type VNextStorageWriteResult<TRecord> =
  | {
      ok: true
      source: typeof VNEXT_STORAGE_ADAPTER_SOURCE
      mode: typeof VNEXT_STORAGE_ADAPTER_MODE
      status: "written" | "idempotent-replay"
      record: VNextStorageRecordEnvelope<TRecord>
      conflict: null
      issues: []
      contracts: VNextStorageAdapterContracts
    }
  | {
      ok: false
      source: typeof VNEXT_STORAGE_ADAPTER_SOURCE
      mode: typeof VNEXT_STORAGE_ADAPTER_MODE
      status: "conflict" | "invalid-request"
      record: null
      conflict: {
        expectedRevision: number | null
        actualRevision: number | null
      } | null
      issues: VNextStorageOperationIssue[]
      contracts: VNextStorageAdapterContracts
    }

export type VNextStorageReadResult<TRecord> =
  | {
      ok: true
      source: typeof VNEXT_STORAGE_ADAPTER_SOURCE
      mode: typeof VNEXT_STORAGE_ADAPTER_MODE
      status: "found"
      record: VNextStorageRecordEnvelope<TRecord>
      issues: []
      contracts: VNextStorageAdapterContracts
    }
  | {
      ok: false
      source: typeof VNEXT_STORAGE_ADAPTER_SOURCE
      mode: typeof VNEXT_STORAGE_ADAPTER_MODE
      status: "not-found" | "invalid-request"
      record: null
      issues: VNextStorageOperationIssue[]
      contracts: VNextStorageAdapterContracts
    }

export interface VNextStorageCollection<TRecord> {
  read(request: VNextStorageReadRequest): VNextStorageMaybePromise<VNextStorageReadResult<TRecord>>
  write(request: VNextStorageWriteRequest<TRecord>): VNextStorageMaybePromise<VNextStorageWriteResult<TRecord>>
}

export interface VNextStorageAdapter {
  packageSessions: VNextStorageCollection<VNextSessionStorageRecord>
  durableHistories: VNextStorageCollection<VNextDurableHistorySnapshot>
  richInlineSessions: VNextStorageCollection<VNextRichInlineSessionPersistenceRecord>
  artifactManifests: VNextStorageCollection<VNextArtifactManifestRecord>
  artifactJobs: VNextStorageCollection<VNextArtifactJobRecord>
}

export interface VNextStorageAdapterContractPlan {
  source: typeof VNEXT_STORAGE_ADAPTER_SOURCE
  mode: typeof VNEXT_STORAGE_ADAPTER_MODE
  status: "interface-only"
  collections: {
    packageSessions: "package-session"
    durableHistories: "durable-history"
    richInlineSessions: "rich-inline-session"
    artifactManifests: "artifact-manifest"
    artifactJobs: "artifact-job"
  }
  concurrency: {
    expectedRevision: "required-null-for-create-or-exact-number-for-update"
    idempotencyKey: "required"
    writeToken: "optional"
  }
  contracts: VNextStorageAdapterContracts
}

function contracts(): VNextStorageAdapterContracts {
  return {
    interfaceOnly: true,
    concreteBackend: null,
    filesystemWrites: false,
    databaseWrites: false,
    objectStorageWrites: false,
    browserStorageWrites: false,
    networkCalls: false,
    authzExecution: false,
    schemaMigration: false,
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string): VNextStorageOperationIssue {
  return {
    severity: "blocking",
    code,
    path,
    message,
  }
}

function nonEmptyString(value: unknown, path: string, issues: VNextStorageOperationIssue[]): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue("invalid-string", path, `${path} must be a non-empty string`))
  return null
}

function revision(value: unknown, path: string, issues: VNextStorageOperationIssue[]): number | null {
  if (value === null) return null
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value

  issues.push(issue("invalid-revision", path, `${path} must be null or a non-negative integer`))
  return null
}

function dateString(value: unknown, path: string, issues: VNextStorageOperationIssue[]): string | null {
  if (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value))) return value

  issues.push(issue("invalid-date", path, `${path} must be a parseable ISO date string`))
  return null
}

function writeResult<TRecord>(
  status: "written" | "idempotent-replay",
  record: VNextStorageRecordEnvelope<TRecord>,
): VNextStorageWriteResult<TRecord> {
  return {
    ok: true,
    source: VNEXT_STORAGE_ADAPTER_SOURCE,
    mode: VNEXT_STORAGE_ADAPTER_MODE,
    status,
    record: cloneJson(record),
    conflict: null,
    issues: [],
    contracts: contracts(),
  }
}

function blockedWriteResult<TRecord>(
  status: "conflict" | "invalid-request",
  issues: VNextStorageOperationIssue[],
  conflict: {
    expectedRevision: number | null
    actualRevision: number | null
  } | null,
): VNextStorageWriteResult<TRecord> {
  return {
    ok: false,
    source: VNEXT_STORAGE_ADAPTER_SOURCE,
    mode: VNEXT_STORAGE_ADAPTER_MODE,
    status,
    record: null,
    conflict,
    issues,
    contracts: contracts(),
  }
}

export function createVNextStorageAdapterContractPlan(): VNextStorageAdapterContractPlan {
  return {
    source: VNEXT_STORAGE_ADAPTER_SOURCE,
    mode: VNEXT_STORAGE_ADAPTER_MODE,
    status: "interface-only",
    collections: {
      packageSessions: "package-session",
      durableHistories: "durable-history",
      richInlineSessions: "rich-inline-session",
      artifactManifests: "artifact-manifest",
      artifactJobs: "artifact-job",
    },
    concurrency: {
      expectedRevision: "required-null-for-create-or-exact-number-for-update",
      idempotencyKey: "required",
      writeToken: "optional",
    },
    contracts: contracts(),
  }
}

export function evaluateVNextStorageWriteRequest<TRecord>(
  existing: VNextStorageRecordEnvelope<TRecord> | null,
  request: VNextStorageWriteRequest<TRecord>,
): VNextStorageWriteResult<TRecord> {
  const issues: VNextStorageOperationIssue[] = []
  const key = nonEmptyString(request.key, "key", issues)
  const idempotencyKey = nonEmptyString(request.idempotencyKey, "idempotencyKey", issues)
  const now = dateString(request.now, "now", issues)
  const expectedRevision = revision(request.expectedRevision, "expectedRevision", issues)
  const writeToken = request.writeToken == null ? null : nonEmptyString(request.writeToken, "writeToken", issues)

  if (issues.length > 0 || key == null || idempotencyKey == null || now == null || (request.writeToken != null && writeToken == null)) {
    return blockedWriteResult("invalid-request", issues, null)
  }

  if (existing != null && existing.metadata.idempotencyKey === idempotencyKey) {
    return writeResult("idempotent-replay", existing)
  }

  const actualRevision = existing?.revision ?? null
  const expectedMatches = existing == null
    ? expectedRevision == null
    : expectedRevision === existing.revision

  if (!expectedMatches) {
    return blockedWriteResult("conflict", [
      issue("revision-conflict", "expectedRevision", "expectedRevision does not match the stored revision"),
    ], {
      expectedRevision,
      actualRevision,
    })
  }

  const record: VNextStorageRecordEnvelope<TRecord> = {
    schemaVersion: VNEXT_STORAGE_ADAPTER_SCHEMA_VERSION,
    kind: request.kind,
    key,
    revision: existing == null ? 0 : existing.revision + 1,
    value: cloneJson(request.value),
    metadata: {
      idempotencyKey,
      writeToken,
      createdAt: existing?.metadata.createdAt ?? now,
      updatedAt: now,
    },
  }

  return writeResult("written", record)
}

export function createVNextStorageReadResult<TRecord>(
  existing: VNextStorageRecordEnvelope<TRecord> | null,
  request: VNextStorageReadRequest,
): VNextStorageReadResult<TRecord> {
  const issues: VNextStorageOperationIssue[] = []
  const key = nonEmptyString(request.key, "key", issues)

  if (issues.length > 0 || key == null) {
    return {
      ok: false,
      source: VNEXT_STORAGE_ADAPTER_SOURCE,
      mode: VNEXT_STORAGE_ADAPTER_MODE,
      status: "invalid-request",
      record: null,
      issues,
      contracts: contracts(),
    }
  }

  if (existing == null || existing.kind !== request.kind || existing.key !== key) {
    return {
      ok: false,
      source: VNEXT_STORAGE_ADAPTER_SOURCE,
      mode: VNEXT_STORAGE_ADAPTER_MODE,
      status: "not-found",
      record: null,
      issues: [],
      contracts: contracts(),
    }
  }

  return {
    ok: true,
    source: VNEXT_STORAGE_ADAPTER_SOURCE,
    mode: VNEXT_STORAGE_ADAPTER_MODE,
    status: "found",
    record: cloneJson(existing),
    issues: [],
    contracts: contracts(),
  }
}
