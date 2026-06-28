import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import {
  VNEXT_STORAGE_ADAPTER_SCHEMA_VERSION,
  createVNextStorageReadResult,
  evaluateVNextStorageWriteRequest,
} from "@flowdoc/vnext-core"
import type {
  VNextArtifactJobRecord,
  VNextArtifactManifestRecord,
  VNextDurableHistorySnapshot,
  VNextRichInlineSessionPersistenceRecord,
  VNextSessionStorageRecord,
  VNextStorageOperationIssue,
  VNextStorageReadRequest,
  VNextStorageRecordEnvelope,
  VNextStorageRecordKind,
  VNextStorageWriteRequest,
} from "@flowdoc/vnext-core"

export const FLOWDOC_FILE_JSON_STORAGE_SOURCE = "flowdoc-file-json-storage-adapter"
export const FLOWDOC_FILE_JSON_STORAGE_MODE = "external-file-backed-json-record-storage"
export const FLOWDOC_FILE_JSON_STORAGE_PACKAGE = "@flowdoc/storage-file-json"

export type FlowDocFileJsonStorageWriteStatus =
  | "written"
  | "idempotent-replay"
  | "conflict"
  | "invalid-request"
  | "io-error"

export type FlowDocFileJsonStorageReadStatus =
  | "found"
  | "not-found"
  | "invalid-request"
  | "io-error"

export interface FlowDocFileJsonStorageAdapterContracts {
  externalPackage: true
  importsCoreAsPublicPackage: true
  consumesCoreStorageContracts: true
  concreteBackend: "file-backed-json"
  filesystemWrites: true
  databaseWrites: false
  objectStorageWrites: false
  browserStorageWrites: false
  networkCalls: false
  authzExecution: false
  schemaMigration: false
  artifactByteWrites: false
  multiRecordTransactions: false
  productionStorageReady: false
}

export interface FlowDocFileJsonStorageCollectionPlan {
  kind: VNextStorageRecordKind
  directoryName: string
  stores: "json-record-envelope"
  artifactBytes: false
}

export interface FlowDocFileJsonStorageAdapterPlan {
  source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
  mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
  status: "internal-alpha-record-adapter"
  adapterPackageName: typeof FLOWDOC_FILE_JSON_STORAGE_PACKAGE
  corePackageName: "@flowdoc/vnext-core"
  rootDirectory: string
  collections: {
    packageSessions: FlowDocFileJsonStorageCollectionPlan
    durableHistories: FlowDocFileJsonStorageCollectionPlan
    richInlineSessions: FlowDocFileJsonStorageCollectionPlan
    artifactManifests: FlowDocFileJsonStorageCollectionPlan
    artifactJobs: FlowDocFileJsonStorageCollectionPlan
  }
  concurrency: {
    expectedRevision: "null-for-create-or-exact-number-for-update"
    idempotencyKey: "replays-the-same-accepted-write-for-one-record"
    revision: "increments-on-accepted-update"
  }
  contracts: FlowDocFileJsonStorageAdapterContracts
}

export type FlowDocFileJsonStorageWriteResult<TRecord> =
  | {
      ok: true
      source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
      mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
      status: "written" | "idempotent-replay"
      record: VNextStorageRecordEnvelope<TRecord>
      conflict: null
      issues: []
      storageKey: string
      filePath: string
      contracts: FlowDocFileJsonStorageAdapterContracts
    }
  | {
      ok: false
      source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
      mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
      status: "conflict" | "invalid-request" | "io-error"
      record: null
      conflict: {
        expectedRevision: number | null
        actualRevision: number | null
      } | null
      issues: VNextStorageOperationIssue[]
      storageKey: string | null
      filePath: string | null
      contracts: FlowDocFileJsonStorageAdapterContracts
    }

export type FlowDocFileJsonStorageReadResult<TRecord> =
  | {
      ok: true
      source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
      mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
      status: "found"
      record: VNextStorageRecordEnvelope<TRecord>
      issues: []
      storageKey: string
      filePath: string
      contracts: FlowDocFileJsonStorageAdapterContracts
    }
  | {
      ok: false
      source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
      mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
      status: "not-found" | "invalid-request" | "io-error"
      record: null
      issues: VNextStorageOperationIssue[]
      storageKey: string | null
      filePath: string | null
      contracts: FlowDocFileJsonStorageAdapterContracts
    }

export interface FlowDocFileJsonStorageAdapter {
  source: typeof FLOWDOC_FILE_JSON_STORAGE_SOURCE
  mode: typeof FLOWDOC_FILE_JSON_STORAGE_MODE
  rootDirectory: string
  contracts: FlowDocFileJsonStorageAdapterContracts
  packageSessions: FlowDocFileJsonStorageCollection<VNextSessionStorageRecord>
  durableHistories: FlowDocFileJsonStorageCollection<VNextDurableHistorySnapshot>
  richInlineSessions: FlowDocFileJsonStorageCollection<VNextRichInlineSessionPersistenceRecord>
  artifactManifests: FlowDocFileJsonStorageCollection<VNextArtifactManifestRecord>
  artifactJobs: FlowDocFileJsonStorageCollection<VNextArtifactJobRecord>
  plan(): FlowDocFileJsonStorageAdapterPlan
}

export interface FlowDocFileJsonStorageAdapterInput {
  rootDirectory: string
}

function contracts(): FlowDocFileJsonStorageAdapterContracts {
  return {
    externalPackage: true,
    importsCoreAsPublicPackage: true,
    consumesCoreStorageContracts: true,
    concreteBackend: "file-backed-json",
    filesystemWrites: true,
    databaseWrites: false,
    objectStorageWrites: false,
    browserStorageWrites: false,
    networkCalls: false,
    authzExecution: false,
    schemaMigration: false,
    artifactByteWrites: false,
    multiRecordTransactions: false,
    productionStorageReady: false,
  }
}

function collectionPlan(kind: VNextStorageRecordKind, directoryName: string): FlowDocFileJsonStorageCollectionPlan {
  return {
    kind,
    directoryName,
    stores: "json-record-envelope",
    artifactBytes: false,
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

function storageKeyFor(key: string): string {
  return Buffer.from(key, "utf8").toString("base64url")
}

function isNoEntryError(error: unknown): boolean {
  return typeof error === "object" && error != null && "code" in error && error.code === "ENOENT"
}

function issueFromError(code: string, path: string, message: string, error: unknown): VNextStorageOperationIssue {
  const reason = error instanceof Error ? error.message : String(error)
  return issue(code, path, `${message}: ${reason}`)
}

function validateStoredEnvelope<TRecord>(
  value: unknown,
  kind: VNextStorageRecordKind,
  key: string,
): VNextStorageRecordEnvelope<TRecord> | VNextStorageOperationIssue[] {
  const issues: VNextStorageOperationIssue[] = []

  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    return [issue("invalid-json-record", "record", "stored record envelope must be a JSON object")]
  }

  const envelope = value as Partial<VNextStorageRecordEnvelope<TRecord>>

  if (envelope.schemaVersion !== VNEXT_STORAGE_ADAPTER_SCHEMA_VERSION) {
    issues.push(issue("invalid-schema-version", "schemaVersion", "stored record envelope has an unsupported schema version"))
  }

  if (envelope.kind !== kind) {
    issues.push(issue("kind-mismatch", "kind", "stored record envelope kind does not match the collection"))
  }

  if (envelope.key !== key) {
    issues.push(issue("key-mismatch", "key", "stored record envelope key does not match the requested key"))
  }

  if (typeof envelope.revision !== "number" || !Number.isInteger(envelope.revision) || envelope.revision < 0) {
    issues.push(issue("invalid-revision", "revision", "stored record revision must be a non-negative integer"))
  }

  if (typeof envelope.metadata !== "object" || envelope.metadata == null) {
    issues.push(issue("invalid-metadata", "metadata", "stored record metadata must be a JSON object"))
  }

  if (issues.length > 0) return issues

  return cloneJson(envelope as VNextStorageRecordEnvelope<TRecord>)
}

function writeResult<TRecord>(
  status: "written" | "idempotent-replay",
  record: VNextStorageRecordEnvelope<TRecord>,
  storageKey: string,
  filePath: string,
): FlowDocFileJsonStorageWriteResult<TRecord> {
  return {
    ok: true,
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    status,
    record: cloneJson(record),
    conflict: null,
    issues: [],
    storageKey,
    filePath,
    contracts: contracts(),
  }
}

function blockedWriteResult<TRecord>(
  status: "conflict" | "invalid-request" | "io-error",
  issues: VNextStorageOperationIssue[],
  storageKey: string | null,
  filePath: string | null,
  conflict: { expectedRevision: number | null; actualRevision: number | null } | null,
): FlowDocFileJsonStorageWriteResult<TRecord> {
  return {
    ok: false,
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    status,
    record: null,
    conflict,
    issues,
    storageKey,
    filePath,
    contracts: contracts(),
  }
}

function readResult<TRecord>(
  record: VNextStorageRecordEnvelope<TRecord>,
  storageKey: string,
  filePath: string,
): FlowDocFileJsonStorageReadResult<TRecord> {
  return {
    ok: true,
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    status: "found",
    record: cloneJson(record),
    issues: [],
    storageKey,
    filePath,
    contracts: contracts(),
  }
}

function blockedReadResult<TRecord>(
  status: "not-found" | "invalid-request" | "io-error",
  issues: VNextStorageOperationIssue[],
  storageKey: string | null,
  filePath: string | null,
): FlowDocFileJsonStorageReadResult<TRecord> {
  return {
    ok: false,
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    status,
    record: null,
    issues,
    storageKey,
    filePath,
    contracts: contracts(),
  }
}

export class FlowDocFileJsonStorageCollection<TRecord> {
  readonly kind: VNextStorageRecordKind
  readonly directoryName: string

  private readonly rootDirectory: string

  constructor(rootDirectory: string, kind: VNextStorageRecordKind, directoryName: string) {
    this.rootDirectory = rootDirectory
    this.kind = kind
    this.directoryName = directoryName
  }

  async read(request: VNextStorageReadRequest): Promise<FlowDocFileJsonStorageReadResult<TRecord>> {
    const location = this.locationForRequest(request)

    if (location == null) {
      return blockedReadResult("invalid-request", [
        issue("kind-mismatch", "kind", "request kind must match the selected storage collection"),
      ], null, null)
    }

    const existing = await this.readEnvelope(location.storageKey, location.filePath, request.key)

    if (Array.isArray(existing)) {
      return blockedReadResult("io-error", existing, location.storageKey, location.filePath)
    }

    const coreResult = createVNextStorageReadResult(existing, request)

    if (coreResult.ok) {
      return readResult(coreResult.record, location.storageKey, location.filePath)
    }

    return blockedReadResult(coreResult.status, coreResult.issues, location.storageKey, location.filePath)
  }

  async write(request: VNextStorageWriteRequest<TRecord>): Promise<FlowDocFileJsonStorageWriteResult<TRecord>> {
    const location = this.locationForRequest(request)

    if (location == null) {
      return blockedWriteResult("invalid-request", [
        issue("kind-mismatch", "kind", "request kind must match the selected storage collection"),
      ], null, null, null)
    }

    const existing = await this.readEnvelope(location.storageKey, location.filePath, request.key)

    if (Array.isArray(existing)) {
      return blockedWriteResult("io-error", existing, location.storageKey, location.filePath, null)
    }

    const coreResult = evaluateVNextStorageWriteRequest(existing, request)

    if (!coreResult.ok) {
      return blockedWriteResult(coreResult.status, coreResult.issues, location.storageKey, location.filePath, coreResult.conflict)
    }

    if (coreResult.status === "written") {
      try {
        await mkdir(join(this.rootDirectory, this.directoryName), { recursive: true })
        await writeFile(location.filePath, `${JSON.stringify(coreResult.record, null, 2)}\n`, "utf8")
      } catch (error) {
        return blockedWriteResult("io-error", [
          issueFromError("storage-write-failed", "filePath", "failed to write storage record", error),
        ], location.storageKey, location.filePath, null)
      }
    }

    return writeResult(coreResult.status, coreResult.record, location.storageKey, location.filePath)
  }

  private locationForRequest(request: VNextStorageReadRequest | VNextStorageWriteRequest<TRecord>): {
    storageKey: string
    filePath: string
  } | null {
    if (request.kind !== this.kind) return null

    const storageKey = storageKeyFor(request.key)

    return {
      storageKey,
      filePath: join(this.rootDirectory, this.directoryName, `${storageKey}.json`),
    }
  }

  private async readEnvelope(
    storageKey: string,
    filePath: string,
    key: string,
  ): Promise<VNextStorageRecordEnvelope<TRecord> | null | VNextStorageOperationIssue[]> {
    try {
      const content = await readFile(filePath, "utf8")
      const parsed = JSON.parse(content) as unknown
      const envelope = validateStoredEnvelope<TRecord>(parsed, this.kind, key)

      return envelope
    } catch (error) {
      if (isNoEntryError(error)) return null

      if (error instanceof SyntaxError) {
        return [issueFromError("invalid-json-record", "filePath", "stored record is not parseable JSON", error)]
      }

      return [issueFromError("storage-read-failed", "filePath", "failed to read storage record", error)]
    }
  }
}

export function createFlowDocFileJsonStorageAdapterPlan(rootDirectory: string): FlowDocFileJsonStorageAdapterPlan {
  return {
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    status: "internal-alpha-record-adapter",
    adapterPackageName: FLOWDOC_FILE_JSON_STORAGE_PACKAGE,
    corePackageName: "@flowdoc/vnext-core",
    rootDirectory: resolve(rootDirectory),
    collections: {
      packageSessions: collectionPlan("package-session", "package-session"),
      durableHistories: collectionPlan("durable-history", "durable-history"),
      richInlineSessions: collectionPlan("rich-inline-session", "rich-inline-session"),
      artifactManifests: collectionPlan("artifact-manifest", "artifact-manifest"),
      artifactJobs: collectionPlan("artifact-job", "artifact-job"),
    },
    concurrency: {
      expectedRevision: "null-for-create-or-exact-number-for-update",
      idempotencyKey: "replays-the-same-accepted-write-for-one-record",
      revision: "increments-on-accepted-update",
    },
    contracts: contracts(),
  }
}

export function createFlowDocFileJsonStorageAdapter(
  input: FlowDocFileJsonStorageAdapterInput,
): FlowDocFileJsonStorageAdapter {
  const rootDirectory = resolve(input.rootDirectory)

  return {
    source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
    mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
    rootDirectory,
    contracts: contracts(),
    packageSessions: new FlowDocFileJsonStorageCollection(rootDirectory, "package-session", "package-session"),
    durableHistories: new FlowDocFileJsonStorageCollection(rootDirectory, "durable-history", "durable-history"),
    richInlineSessions: new FlowDocFileJsonStorageCollection(rootDirectory, "rich-inline-session", "rich-inline-session"),
    artifactManifests: new FlowDocFileJsonStorageCollection(rootDirectory, "artifact-manifest", "artifact-manifest"),
    artifactJobs: new FlowDocFileJsonStorageCollection(rootDirectory, "artifact-job", "artifact-job"),
    plan: () => createFlowDocFileJsonStorageAdapterPlan(rootDirectory),
  }
}
