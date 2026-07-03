import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createVNextRichInlineSessionPersistenceRecord } from "../src/authoring/richInlineSessionPersistence.js"
import { createVNextSessionStorageRecord } from "../src/authoring/sessionStorage.js"
import {
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextStorageAdapterContractPlan,
  createVNextStorageReadResult,
  evaluateVNextStorageWriteRequest,
  VNEXT_STORAGE_ADAPTER_MODE,
  VNEXT_STORAGE_ADAPTER_SOURCE,
  type VNextStorageAdapter,
  type VNextStorageCollection,
  type VNextStorageReadRequest,
  type VNextStorageReadResult,
  type VNextStorageRecordEnvelope,
  type VNextStorageRecordKind,
  type VNextStorageWriteRequest,
  type VNextStorageWriteResult,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

class MockStorageCollection<TRecord> implements VNextStorageCollection<TRecord> {
  private records = new Map<string, VNextStorageRecordEnvelope<TRecord>>()

  constructor(private readonly kind: VNextStorageRecordKind) {}

  read(request: VNextStorageReadRequest): VNextStorageReadResult<TRecord> {
    return createVNextStorageReadResult(this.records.get(request.key) ?? null, request)
  }

  write(request: VNextStorageWriteRequest<TRecord>): VNextStorageWriteResult<TRecord> {
    expect(request.kind).toBe(this.kind)
    const result = evaluateVNextStorageWriteRequest(this.records.get(request.key) ?? null, request)
    if (result.ok && result.status === "written") this.records.set(result.record.key, result.record)
    return result
  }
}

class MockStorageAdapter implements VNextStorageAdapter {
  packageSessions = new MockStorageCollection<unknown>("package-session")
  durableHistories = new MockStorageCollection<ReturnType<typeof createVNextDurableHistorySnapshot>>("durable-history")
  richInlineSessions = new MockStorageCollection<unknown>("rich-inline-session")
  artifactManifests = new MockStorageCollection<NonNullable<ReturnType<typeof createVNextArtifactManifestPlan>["record"]>>("artifact-manifest")
  artifactJobs = new MockStorageCollection<NonNullable<ReturnType<typeof createVNextArtifactJobPlan>["job"]>>("artifact-job")
}

function sessionRecord() {
  const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
  return createVNextSessionStorageRecord(session, {
    reason: "phase-140-storage-adapter-test",
    storageKey: "sessions/product-report",
  })
}

function session() {
  return createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
}

function artifactManifest() {
  const plan = createVNextArtifactManifestPlan({
    artifactId: "artifact:phase-140",
    sourcePackageId: "package:product-report",
    sessionId: "session:phase-140",
    jobId: "job:phase-140",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: null,
    sha256: null,
    storageKey: null,
    createdAt: "2026-06-23T03:00:00.000Z",
    status: "planned",
    error: null,
  })
  if (plan.record == null) throw new Error("artifact manifest did not validate")
  return plan.record
}

function artifactJob() {
  const plan = createVNextArtifactJobPlan({
    jobId: "job:phase-140",
    artifactId: "artifact:phase-140",
    sourcePackageId: "package:product-report",
    sessionId: "session:phase-140",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-23T03:00:00.000Z",
  })
  if (plan.job == null) throw new Error("artifact job did not validate")
  return plan.job
}

describe("vNext storage adapter interface boundary", () => {
  it("declares interface-only collections and concurrency contracts", () => {
    const plan = createVNextStorageAdapterContractPlan()

    expect(plan).toEqual({
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
      contracts: {
        interfaceOnly: true,
        concreteBackend: null,
        filesystemWrites: false,
        databaseWrites: false,
        objectStorageWrites: false,
        browserStorageWrites: false,
        networkCalls: false,
        authzExecution: false,
        schemaMigration: false,
      },
    })
  })

  it("lets a mock adapter prove expected revision and idempotency behavior", () => {
    const adapter = new MockStorageAdapter()
    const firstValue = sessionRecord()
    const first = adapter.packageSessions.write({
      kind: "package-session",
      key: "session:product-report",
      value: firstValue,
      expectedRevision: null,
      idempotencyKey: "idem-session-create",
      now: "2026-06-23T03:00:00.000Z",
    })
    const replay = adapter.packageSessions.write({
      kind: "package-session",
      key: "session:product-report",
      value: firstValue,
      expectedRevision: null,
      idempotencyKey: "idem-session-create",
      now: "2026-06-23T03:01:00.000Z",
    })
    const second = adapter.packageSessions.write({
      kind: "package-session",
      key: "session:product-report",
      value: {
        ...firstValue,
        manifest: {
          ...firstValue.manifest,
          reason: "phase-140-update",
        },
      },
      expectedRevision: 0,
      idempotencyKey: "idem-session-update",
      writeToken: "write-token-1",
      now: "2026-06-23T03:02:00.000Z",
    })
    const conflict = adapter.packageSessions.write({
      kind: "package-session",
      key: "session:product-report",
      value: firstValue,
      expectedRevision: 0,
      idempotencyKey: "idem-session-stale",
      now: "2026-06-23T03:03:00.000Z",
    })
    const read = adapter.packageSessions.read({
      kind: "package-session",
      key: "session:product-report",
    })

    expect(first).toMatchObject({
      ok: true,
      status: "written",
      record: {
        kind: "package-session",
        key: "session:product-report",
        revision: 0,
        metadata: {
          idempotencyKey: "idem-session-create",
          writeToken: null,
          createdAt: "2026-06-23T03:00:00.000Z",
          updatedAt: "2026-06-23T03:00:00.000Z",
        },
      },
    })
    expect(replay).toMatchObject({
      ok: true,
      status: "idempotent-replay",
      record: {
        revision: 0,
        metadata: {
          idempotencyKey: "idem-session-create",
        },
      },
    })
    expect(second).toMatchObject({
      ok: true,
      status: "written",
      record: {
        revision: 1,
        metadata: {
          idempotencyKey: "idem-session-update",
          writeToken: "write-token-1",
          createdAt: "2026-06-23T03:00:00.000Z",
          updatedAt: "2026-06-23T03:02:00.000Z",
        },
      },
    })
    expect(conflict).toMatchObject({
      ok: false,
      status: "conflict",
      conflict: {
        expectedRevision: 0,
        actualRevision: 1,
      },
      issues: [expect.objectContaining({ code: "revision-conflict" })],
    })
    expect(read).toMatchObject({
      ok: true,
      status: "found",
      record: {
        revision: 1,
        value: {
          manifest: {
            reason: "phase-140-update",
          },
        },
      },
    })
    expect(JSON.parse(JSON.stringify(read))).toEqual(read)
  })

  it("covers history, rich-inline, artifact manifest, and artifact job collection shapes", () => {
    const adapter = new MockStorageAdapter()
    const editableSession = session()
    const history = createVNextDurableHistorySnapshot([], {
      documentRevision: editableSession.revisions.document,
      historyKey: "history:phase-140",
      reason: "storage-adapter-test",
    })
    const richInline = createVNextRichInlineSessionPersistenceRecord(editableSession, {
      historyKey: "history:phase-140",
      reason: "storage-adapter-test",
      storageKey: "rich-inline:phase-140",
    })
    const manifest = artifactManifest()
    const job = artifactJob()

    const historyWrite = adapter.durableHistories.write({
      kind: "durable-history",
      key: "history:phase-140",
      value: history,
      expectedRevision: null,
      idempotencyKey: "idem-history",
      now: "2026-06-23T03:10:00.000Z",
    })
    const richWrite = adapter.richInlineSessions.write({
      kind: "rich-inline-session",
      key: "rich-inline:phase-140",
      value: richInline,
      expectedRevision: null,
      idempotencyKey: "idem-rich-inline",
      now: "2026-06-23T03:11:00.000Z",
    })
    const manifestWrite = adapter.artifactManifests.write({
      kind: "artifact-manifest",
      key: "artifact:phase-140",
      value: manifest,
      expectedRevision: null,
      idempotencyKey: "idem-artifact-manifest",
      now: "2026-06-23T03:12:00.000Z",
    })
    const jobWrite = adapter.artifactJobs.write({
      kind: "artifact-job",
      key: "job:phase-140",
      value: job,
      expectedRevision: null,
      idempotencyKey: "idem-artifact-job",
      now: "2026-06-23T03:13:00.000Z",
    })

    expect(historyWrite).toMatchObject({ ok: true, record: { kind: "durable-history", revision: 0 } })
    expect(richWrite).toMatchObject({ ok: true, record: { kind: "rich-inline-session", revision: 0 } })
    expect(manifestWrite).toMatchObject({
      ok: true,
      record: {
        kind: "artifact-manifest",
        value: {
          status: "planned",
          storageStatus: "not-written",
        },
      },
    })
    expect(jobWrite).toMatchObject({
      ok: true,
      record: {
        kind: "artifact-job",
        value: {
          status: "queued",
          execution: {
            worker: false,
            renderer: false,
            storageWrites: false,
          },
        },
      },
    })
  })

  it("blocks invalid write/read request metadata before an adapter writes", () => {
    const invalidWrite = evaluateVNextStorageWriteRequest(null, {
      kind: "artifact-job",
      key: "",
      value: artifactJob(),
      expectedRevision: -1,
      idempotencyKey: "",
      now: "not-a-date",
    })
    const invalidRead = createVNextStorageReadResult(null, {
      kind: "artifact-job",
      key: "",
    })

    expect(invalidWrite).toMatchObject({
      ok: false,
      status: "invalid-request",
      record: null,
      conflict: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid-string", path: "key" }),
        expect.objectContaining({ code: "invalid-string", path: "idempotencyKey" }),
        expect.objectContaining({ code: "invalid-date", path: "now" }),
        expect.objectContaining({ code: "invalid-revision", path: "expectedRevision" }),
      ]),
    })
    expect(invalidRead).toMatchObject({
      ok: false,
      status: "invalid-request",
      record: null,
      issues: [expect.objectContaining({ code: "invalid-string", path: "key" })],
    })
  })

  it("keeps storage adapter contracts independent from concrete storage, auth, routes, and backend clients", () => {
    const source = readFileSync(new URL("../src/persistence/storageAdapter.ts", import.meta.url), "utf8")

    expect(source).toContain("packageSessions: VNextStorageCollection<unknown>")
    expect(source).toContain("richInlineSessions: VNextStorageCollection<unknown>")
    expect(source).not.toContain("VNextSessionStorageRecord")
    expect(source).not.toContain("VNextRichInlineSessionPersistenceRecord")
    expect(source).toContain("interfaceOnly: true")
    expect(source).toContain("concreteBackend: null")
    expect(source).toContain("filesystemWrites: false")
    expect(source).toContain("databaseWrites: false")
    expect(source).toContain("objectStorageWrites: false")
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pg|postgres|mysql|sqlite|mongodb|redis|s3|aws-sdk|@aws-sdk|firebase|supabase/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toMatch(/(?:window|globalThis)\.(?:localStorage|sessionStorage|indexedDB)/)
    expect(source).not.toContain("new Map")
    expect(source).not.toContain("/api/")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
  })

  it("documents Phase 140 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/STORAGE_ADAPTER_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 140 storage adapter interface boundary.")
    expect(boundaryDoc).toContain("src/persistence/storageAdapter.ts")
    expect(boundaryDoc).toContain("This is an interface boundary, not a concrete storage adapter")
    expect(readme).toContain("Storage adapter interface boundary")
    expect(readme).toContain("docs/STORAGE_ADAPTER_BOUNDARY.md")
    expect(ledger).toContain("| 140 | Storage adapter interface boundary | done |")
    expect(roadmap).toContain("## Phase 140: Storage Adapter Interface Boundary")
  })
})
