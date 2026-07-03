import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  FLOWDOC_FILE_JSON_STORAGE_MODE,
  FLOWDOC_FILE_JSON_STORAGE_PACKAGE,
  FLOWDOC_FILE_JSON_STORAGE_SOURCE,
  createFlowDocFileJsonStorageAdapter,
  createFlowDocFileJsonStorageAdapterPlan,
} from "../packages/storage-file-json/src/index.js"
import type {
  VNextArtifactJobRecord,
  VNextArtifactManifestRecord,
  VNextDurableHistorySnapshot,
} from "../src/index.js"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function tempStorageRoot(): string {
  return mkdtempSync(join(tmpdir(), "flowdoc-storage-file-json-"))
}

function jsonRecord<T>(value: T): T {
  return value
}

describe("external file-backed JSON storage adapter", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function createTempAdapter() {
    const root = tempStorageRoot()
    tempRoots.push(root)

    return {
      root,
      adapter: createFlowDocFileJsonStorageAdapter({ rootDirectory: root }),
    }
  }

  it("writes package session records, replays idempotency, detects conflicts, and reads after write", async () => {
    const { adapter } = createTempAdapter()
    const now = "2026-06-29T00:00:00.000Z"
    const updatedNow = "2026-06-29T00:01:00.000Z"

    const created = await adapter.packageSessions.write({
      kind: "package-session",
      key: "session:alpha",
      value: jsonRecord({ sessionId: "alpha", title: "first" }),
      expectedRevision: null,
      idempotencyKey: "idem-create",
      now,
    })

    expect(created.ok).toBe(true)
    if (!created.ok) throw new Error("expected initial package session write to succeed")
    expect(created.status).toBe("written")
    expect(created.record.revision).toBe(0)
    expect(created.source).toBe(FLOWDOC_FILE_JSON_STORAGE_SOURCE)
    expect(created.mode).toBe(FLOWDOC_FILE_JSON_STORAGE_MODE)
    expect(created.contracts.filesystemWrites).toBe(true)
    expect(created.contracts.productionStorageReady).toBe(false)
    expect(created.contracts.multiRecordTransactions).toBe(false)
    expect(created.contracts.artifactByteWrites).toBe(false)
    expect(existsSync(created.filePath)).toBe(true)

    const replay = await adapter.packageSessions.write({
      kind: "package-session",
      key: "session:alpha",
      value: jsonRecord({ sessionId: "alpha", title: "ignored replay payload" }),
      expectedRevision: null,
      idempotencyKey: "idem-create",
      now: updatedNow,
    })

    expect(replay.ok).toBe(true)
    if (!replay.ok) throw new Error("expected idempotent package session replay to succeed")
    expect(replay.status).toBe("idempotent-replay")
    expect(replay.record.revision).toBe(0)
    expect(replay.record.value).toEqual(created.record.value)
    expect(replay.record.metadata.updatedAt).toBe(now)

    const updated = await adapter.packageSessions.write({
      kind: "package-session",
      key: "session:alpha",
      value: jsonRecord({ sessionId: "alpha", title: "second" }),
      expectedRevision: 0,
      idempotencyKey: "idem-update",
      now: updatedNow,
    })

    expect(updated.ok).toBe(true)
    if (!updated.ok) throw new Error("expected package session update to succeed")
    expect(updated.status).toBe("written")
    expect(updated.record.revision).toBe(1)
    expect(updated.record.metadata.createdAt).toBe(now)
    expect(updated.record.metadata.updatedAt).toBe(updatedNow)

    const conflict = await adapter.packageSessions.write({
      kind: "package-session",
      key: "session:alpha",
      value: jsonRecord({ sessionId: "alpha", title: "stale" }),
      expectedRevision: 0,
      idempotencyKey: "idem-stale",
      now: "2026-06-29T00:02:00.000Z",
    })

    expect(conflict.ok).toBe(false)
    expect(conflict.status).toBe("conflict")
    expect(conflict.conflict).toEqual({ expectedRevision: 0, actualRevision: 1 })
    expect(conflict.issues[0]?.code).toBe("revision-conflict")

    const readBack = await adapter.packageSessions.read({
      kind: "package-session",
      key: "session:alpha",
    })

    expect(readBack.ok).toBe(true)
    if (!readBack.ok) throw new Error("expected package session read to succeed")
    expect(readBack.status).toBe("found")
    expect(readBack.record.revision).toBe(1)
    expect(readBack.record.value).toEqual(updated.record.value)
  })

  it("stores all Phase 173 record kinds as JSON envelopes without artifact bytes", async () => {
    const { root, adapter } = createTempAdapter()
    const now = "2026-06-29T01:00:00.000Z"

    const durable = await adapter.durableHistories.write({
      kind: "durable-history",
      key: "history:alpha",
      value: jsonRecord({ entries: [{ op: "text-block.rich-inline.replace" }] }) as unknown as VNextDurableHistorySnapshot,
      expectedRevision: null,
      idempotencyKey: "idem-history",
      now,
    })
    const richInline = await adapter.richInlineSessions.write({
      kind: "rich-inline-session",
      key: "rich-inline:alpha",
      value: jsonRecord({ activeTextBlockId: "block-1", draft: "hello" }),
      expectedRevision: null,
      idempotencyKey: "idem-rich-inline",
      now,
    })
    const manifest = await adapter.artifactManifests.write({
      kind: "artifact-manifest",
      key: "artifact-manifest:alpha",
      value: jsonRecord({
        artifactId: "artifact-alpha",
        format: "pdf",
        storageStatus: "record-only",
        byteLength: null,
        sha256: null,
      }) as unknown as VNextArtifactManifestRecord,
      expectedRevision: null,
      idempotencyKey: "idem-manifest",
      now,
    })
    const job = await adapter.artifactJobs.write({
      kind: "artifact-job",
      key: "artifact-job:alpha",
      value: jsonRecord({
        jobId: "job-alpha",
        artifactId: "artifact-alpha",
        status: "queued",
      }) as unknown as VNextArtifactJobRecord,
      expectedRevision: null,
      idempotencyKey: "idem-job",
      now,
    })

    expect(durable.ok).toBe(true)
    expect(richInline.ok).toBe(true)
    expect(manifest.ok).toBe(true)
    expect(job.ok).toBe(true)

    await expect(adapter.durableHistories.read({ kind: "durable-history", key: "history:alpha" }))
      .resolves.toMatchObject({ ok: true, status: "found" })
    await expect(adapter.richInlineSessions.read({ kind: "rich-inline-session", key: "rich-inline:alpha" }))
      .resolves.toMatchObject({ ok: true, status: "found" })
    await expect(adapter.artifactManifests.read({ kind: "artifact-manifest", key: "artifact-manifest:alpha" }))
      .resolves.toMatchObject({ ok: true, status: "found" })
    await expect(adapter.artifactJobs.read({ kind: "artifact-job", key: "artifact-job:alpha" }))
      .resolves.toMatchObject({ ok: true, status: "found" })

    const storedEntries = readdirSync(root, { recursive: true }).map(String)

    expect(storedEntries.some((entry) => entry.endsWith(".json"))).toBe(true)
    expect(storedEntries.some((entry) => entry.endsWith(".pdf"))).toBe(false)
    expect(storedEntries.some((entry) => entry.includes("bytes"))).toBe(false)
    expect(adapter.contracts.artifactByteWrites).toBe(false)
  })

  it("returns bounded adapter-owned results for not-found, invalid, and kind-mismatch cases", async () => {
    const { adapter } = createTempAdapter()

    const missing = await adapter.packageSessions.read({
      kind: "package-session",
      key: "session:missing",
    })

    expect(missing.ok).toBe(false)
    expect(missing.status).toBe("not-found")
    expect(missing.source).toBe(FLOWDOC_FILE_JSON_STORAGE_SOURCE)
    expect(missing.filePath).toContain("package-session")

    const invalid = await adapter.packageSessions.write({
      kind: "package-session",
      key: "",
      value: jsonRecord({ sessionId: "invalid" }),
      expectedRevision: null,
      idempotencyKey: "",
      now: "not-a-date",
    })

    expect(invalid.ok).toBe(false)
    expect(invalid.status).toBe("invalid-request")
    expect(invalid.issues.map((entry) => entry.code)).toEqual([
      "invalid-string",
      "invalid-string",
      "invalid-date",
    ])

    const wrongCollection = await adapter.packageSessions.read({
      kind: "artifact-job",
      key: "job:wrong-collection",
    })

    expect(wrongCollection.ok).toBe(false)
    if (wrongCollection.ok) throw new Error("expected wrong collection read to fail")
    expect(wrongCollection.status).toBe("invalid-request")
    expect(wrongCollection.issues[0]?.code).toBe("kind-mismatch")
  })

  it("documents the external package boundary and the historical Phase 174 handoff", () => {
    const packageJson = readText("../packages/storage-file-json/package.json")
    const source = readText("../packages/storage-file-json/src/index.ts")
    const coreStorageSource = readText("../src/persistence/storageAdapter.ts")
    const doc = readText("../docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(packageJson).toContain(`"name": "${FLOWDOC_FILE_JSON_STORAGE_PACKAGE}"`)
    expect(packageJson).toContain(`"@flowdoc/vnext-core": "file:../.."`)
    expect(source).toContain(`from "@flowdoc/vnext-core"`)
    expect(source).toContain(`node:fs/promises`)
    expect(source).not.toMatch(/better-sqlite3|sqlite3|postgres|pg|express|playwright|puppeteer/u)
    expect(coreStorageSource).not.toMatch(/node:fs\/promises|writeFile|readFile|sqlite|postgres|better-sqlite3/u)

    expect(doc).toContain("Status: Phase 173 external file-backed storage adapter slice.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 174: Artifact Byte Store Slice.")
    expect(doc).not.toContain("production storage readiness is achieved")
    expect(readme).toContain("External file-backed storage adapter slice")
    expect(readme).toContain("docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md")
    expect(ledger).toContain("| 173 | External file-backed storage adapter slice | done |")
    expect(roadmap).toContain("## Phase 173: External File-Backed Storage Adapter Slice")
    expect(roadmap).toContain("## Historical Phase 173 Handoff")
    expect(roadmap).toContain("Current next step after Phase 173:")
    expect(roadmap).toContain("Phase 174: Artifact Byte Store Slice")
    expect(roadmap).toContain("Current next step after Phase 174:")
    expect(roadmap).toContain("Phase 175: Storage-backed RC Roundtrip Smoke")
  })

  it("exposes a JSON-safe adapter plan that keeps core dependency and production claims bounded", () => {
    const plan = createFlowDocFileJsonStorageAdapterPlan("tmp/storage")

    expect(plan).toEqual({
      source: FLOWDOC_FILE_JSON_STORAGE_SOURCE,
      mode: FLOWDOC_FILE_JSON_STORAGE_MODE,
      status: "internal-alpha-record-adapter",
      adapterPackageName: FLOWDOC_FILE_JSON_STORAGE_PACKAGE,
      corePackageName: "@flowdoc/vnext-core",
      rootDirectory: expect.stringContaining(join("tmp", "storage")),
      collections: {
        packageSessions: {
          kind: "package-session",
          directoryName: "package-session",
          stores: "json-record-envelope",
          artifactBytes: false,
        },
        durableHistories: {
          kind: "durable-history",
          directoryName: "durable-history",
          stores: "json-record-envelope",
          artifactBytes: false,
        },
        richInlineSessions: {
          kind: "rich-inline-session",
          directoryName: "rich-inline-session",
          stores: "json-record-envelope",
          artifactBytes: false,
        },
        artifactManifests: {
          kind: "artifact-manifest",
          directoryName: "artifact-manifest",
          stores: "json-record-envelope",
          artifactBytes: false,
        },
        artifactJobs: {
          kind: "artifact-job",
          directoryName: "artifact-job",
          stores: "json-record-envelope",
          artifactBytes: false,
        },
      },
      concurrency: {
        expectedRevision: "null-for-create-or-exact-number-for-update",
        idempotencyKey: "replays-the-same-accepted-write-for-one-record",
        revision: "increments-on-accepted-update",
      },
      contracts: {
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
      },
    })
  })
})
