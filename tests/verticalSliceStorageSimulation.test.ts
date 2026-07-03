import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createVNextRichInlineSessionPersistenceRecord } from "../src/authoring/richInlineSessionPersistence.js"
import { createVNextSessionStorageRecord } from "../src/authoring/sessionStorage.js"
import {
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextStorageReadResult,
  evaluateVNextStorageWriteRequest,
  summarizeVNextVerticalSliceStorageSimulation,
  VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_MODE,
  VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_SOURCE,
  type VNextStorageCollection,
  type VNextStorageReadRequest,
  type VNextStorageReadResult,
  type VNextStorageRecordEnvelope,
  type VNextStorageRecordKind,
  type VNextStorageWriteRequest,
  type VNextStorageWriteResult,
} from "../src/index.js"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

class MockCollection<TRecord> implements VNextStorageCollection<TRecord> {
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

function rcRecords() {
  const session = createVNextEditableSession(fixture("vertical-slice-rc-report.v1.flowdoc.json"))
  const sessionRecord = createVNextSessionStorageRecord(session, {
    reason: "vertical-slice-rc-storage-simulation",
    storageKey: "session:vertical-slice-report-v1",
  })
  const history = createVNextDurableHistorySnapshot([], {
    documentRevision: session.revisions.document,
    historyKey: "history:vertical-slice-report-v1",
    reason: "vertical-slice-rc-storage-simulation",
  })
  const richInline = createVNextRichInlineSessionPersistenceRecord(session, {
    historyKey: "history:vertical-slice-report-v1",
    reason: "vertical-slice-rc-storage-simulation",
    storageKey: "rich-inline:vertical-slice-report-v1",
  })
  const artifactManifestPlan = createVNextArtifactManifestPlan({
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:vertical-slice-report-v1",
    jobId: "job:vertical-slice-report-v1",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: null,
    sha256: null,
    storageKey: null,
    createdAt: "2026-06-24T02:00:00.000Z",
    status: "planned",
    error: null,
  })
  const artifactJobPlan = createVNextArtifactJobPlan({
    jobId: "job:vertical-slice-report-v1",
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:vertical-slice-report-v1",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-24T02:00:00.000Z",
  })
  if (artifactManifestPlan.record == null || artifactJobPlan.job == null) throw new Error("artifact records did not validate")

  return {
    sessionRecord,
    history,
    richInline,
    artifactManifest: artifactManifestPlan.record,
    artifactJob: artifactJobPlan.job,
  }
}

describe("vertical slice storage simulation", () => {
  it("summarizes package/session, history, rich inline, artifact manifest, and artifact job storage results", () => {
    const records = rcRecords()
    const packageSessions = new MockCollection<typeof records.sessionRecord>("package-session")
    const histories = new MockCollection<typeof records.history>("durable-history")
    const richInline = new MockCollection<typeof records.richInline>("rich-inline-session")
    const manifests = new MockCollection<typeof records.artifactManifest>("artifact-manifest")
    const jobs = new MockCollection<typeof records.artifactJob>("artifact-job")

    const writes = [
      {
        kind: "package-session" as const,
        key: "session:vertical-slice-report-v1",
        result: packageSessions.write({
          kind: "package-session",
          key: "session:vertical-slice-report-v1",
          value: records.sessionRecord,
          expectedRevision: null,
          idempotencyKey: "idem-session",
          now: "2026-06-24T02:01:00.000Z",
        }) as VNextStorageWriteResult<unknown>,
      },
      {
        kind: "durable-history" as const,
        key: "history:vertical-slice-report-v1",
        result: histories.write({
          kind: "durable-history",
          key: "history:vertical-slice-report-v1",
          value: records.history,
          expectedRevision: null,
          idempotencyKey: "idem-history",
          now: "2026-06-24T02:01:00.000Z",
        }) as VNextStorageWriteResult<unknown>,
      },
      {
        kind: "rich-inline-session" as const,
        key: "rich-inline:vertical-slice-report-v1",
        result: richInline.write({
          kind: "rich-inline-session",
          key: "rich-inline:vertical-slice-report-v1",
          value: records.richInline,
          expectedRevision: null,
          idempotencyKey: "idem-rich-inline",
          now: "2026-06-24T02:01:00.000Z",
        }) as VNextStorageWriteResult<unknown>,
      },
      {
        kind: "artifact-manifest" as const,
        key: "artifact:vertical-slice-report-v1:pdf",
        result: manifests.write({
          kind: "artifact-manifest",
          key: "artifact:vertical-slice-report-v1:pdf",
          value: records.artifactManifest,
          expectedRevision: null,
          idempotencyKey: "idem-artifact-manifest",
          now: "2026-06-24T02:01:00.000Z",
        }) as VNextStorageWriteResult<unknown>,
      },
      {
        kind: "artifact-job" as const,
        key: "job:vertical-slice-report-v1",
        result: jobs.write({
          kind: "artifact-job",
          key: "job:vertical-slice-report-v1",
          value: records.artifactJob,
          expectedRevision: null,
          idempotencyKey: "idem-artifact-job",
          now: "2026-06-24T02:01:00.000Z",
        }) as VNextStorageWriteResult<unknown>,
      },
    ]

    const result = summarizeVNextVerticalSliceStorageSimulation({
      expectedCollections: ["package-session", "durable-history", "rich-inline-session", "artifact-manifest", "artifact-job"],
      writes,
    })

    expect(result).toMatchObject({
      source: VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_SOURCE,
      mode: VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_MODE,
      status: "accepted",
      summary: {
        status: "accepted",
        collections: [
          { kind: "package-session", status: "accepted", key: "session:vertical-slice-report-v1", revision: 0, writeStatus: "written" },
          { kind: "durable-history", status: "accepted", key: "history:vertical-slice-report-v1", revision: 0, writeStatus: "written" },
          { kind: "rich-inline-session", status: "accepted", key: "rich-inline:vertical-slice-report-v1", revision: 0, writeStatus: "written" },
          { kind: "artifact-manifest", status: "accepted", key: "artifact:vertical-slice-report-v1:pdf", revision: 0, writeStatus: "written" },
          { kind: "artifact-job", status: "accepted", key: "job:vertical-slice-report-v1", revision: 0, writeStatus: "written" },
        ],
      },
      issues: [],
      contracts: {
        summaryOnly: true,
        usesStorageAdapterResults: true,
        testLocalMockOnly: true,
        concreteBackend: null,
        storageWrites: false,
        authzExecution: false,
        serverRoute: false,
        packageSchemaChange: false,
      },
    })
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("represents idempotent replay and expected revision conflict", () => {
    const records = rcRecords()
    const packageSessions = new MockCollection<typeof records.sessionRecord>("package-session")
    const first = packageSessions.write({
      kind: "package-session",
      key: "session:vertical-slice-report-v1",
      value: records.sessionRecord,
      expectedRevision: null,
      idempotencyKey: "idem-session",
      now: "2026-06-24T02:01:00.000Z",
    })
    const replay = packageSessions.write({
      kind: "package-session",
      key: "session:vertical-slice-report-v1",
      value: records.sessionRecord,
      expectedRevision: null,
      idempotencyKey: "idem-session",
      now: "2026-06-24T02:02:00.000Z",
    })
    const conflict = packageSessions.write({
      kind: "package-session",
      key: "session:vertical-slice-report-v1",
      value: records.sessionRecord,
      expectedRevision: null,
      idempotencyKey: "idem-session-conflict",
      now: "2026-06-24T02:03:00.000Z",
    })

    expect(first.status).toBe("written")
    expect(replay.status).toBe("idempotent-replay")
    expect(conflict.status).toBe("conflict")

    const replaySummary = summarizeVNextVerticalSliceStorageSimulation({
      expectedCollections: ["package-session"],
      writes: [{ kind: "package-session", key: "session:vertical-slice-report-v1", result: replay as VNextStorageWriteResult<unknown> }],
    })
    const conflictSummary = summarizeVNextVerticalSliceStorageSimulation({
      expectedCollections: ["package-session"],
      writes: [{ kind: "package-session", key: "session:vertical-slice-report-v1", result: conflict as VNextStorageWriteResult<unknown> }],
    })

    expect(replaySummary.status).toBe("accepted")
    expect(replaySummary.summary.collections[0]).toMatchObject({
      status: "accepted",
      writeStatus: "idempotent-replay",
      revision: 0,
    })
    expect(conflictSummary.status).toBe("conflict")
    expect(conflictSummary.summary.collections[0]).toMatchObject({
      status: "conflict",
      writeStatus: "conflict",
      revision: null,
    })
  })

  it("blocks missing expected collections and invalid write requests", () => {
    const invalid = evaluateVNextStorageWriteRequest(null, {
      kind: "artifact-job",
      key: "",
      value: { invalid: true },
      expectedRevision: null,
      idempotencyKey: "",
      now: "2026-06-24T02:01:00.000Z",
    })
    const result = summarizeVNextVerticalSliceStorageSimulation({
      expectedCollections: ["package-session", "artifact-job"],
      writes: [{ kind: "artifact-job", key: "", result: invalid as VNextStorageWriteResult<unknown> }],
    })

    expect(result.status).toBe("blocked")
    expect(result.summary.status).toBe("blocked")
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-expected-collection" }),
      expect.objectContaining({ code: "invalid-string" }),
    ]))
  })

  it("keeps storage simulation independent from concrete backends, auth, routes, and writes", () => {
    const source = readFileSync(new URL("../src/generation/verticalSliceStorageSimulation.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain("summaryOnly: true")
    expect(source).toContain("testLocalMockOnly: true")
    expect(source).toContain("storageWrites: false")
    expect(source).not.toMatch(/postgres|sqlite|s3|redis|indexedDB|localStorage|sessionStorage/i)
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(index).toContain("./generation/verticalSliceStorageSimulation.js")
  })

  it("documents Phase 150 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_STORAGE_SIMULATION_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 150 RC storage simulation boundary.")
    expect(boundaryDoc).toContain("test-local mock")
    expect(readme).toContain("Vertical slice storage simulation")
    expect(readme).toContain("docs/VERTICAL_SLICE_STORAGE_SIMULATION_BOUNDARY.md")
    expect(ledger).toContain("| 150 | RC storage simulation boundary | done |")
    expect(roadmap).toContain("## Phase 150: RC Storage Simulation Boundary")
  })
})
