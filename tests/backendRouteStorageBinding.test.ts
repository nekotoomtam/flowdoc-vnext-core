import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { createFlowDocFileJsonStorageAdapter } from "@flowdoc/storage-file-json"
import {
  FLOWDOC_STORAGE_ROUTE_BINDING_MODE,
  FLOWDOC_STORAGE_ROUTE_BINDING_SOURCE,
  createFlowDocStorageRouteBinding,
} from "@flowdoc/internal-alpha-runner"
import {
  createVNextEditableSession,
  createVNextSessionStorageRecord,
  parseFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("backend route contract to storage binding", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function createBinding() {
    const root = mkdtempSync(join(tmpdir(), "flowdoc-route-storage-binding-"))
    tempRoots.push(root)
    const storageAdapter = createFlowDocFileJsonStorageAdapter({ rootDirectory: root })

    return createFlowDocStorageRouteBinding({ storageAdapter })
  }

  function sessionRecord() {
    const pack = parseFlowDocPackageV2DocumentVNext(fixture("vertical-slice-rc-report.v1.flowdoc.json"))
    const session = createVNextEditableSession(pack)

    return createVNextSessionStorageRecord(session, {
      reason: "backend-route-storage-binding-test",
      storageKey: "session:route-binding",
    })
  }

  it("saves and loads a session record through route-shaped helpers", async () => {
    const binding = createBinding()
    const record = sessionRecord()
    const saved = await binding.saveSession({
      method: "POST",
      body: {
        requestId: "request:save-session",
        key: "session:route-binding",
        expectedRevision: null,
        idempotencyKey: "idem:save-session",
        now: "2026-06-29T04:00:00.000Z",
        record,
      },
    })
    const loaded = await binding.loadSession({
      method: "GET",
      body: {
        requestId: "request:load-session",
        key: "session:route-binding",
      },
    })

    expect(saved).toMatchObject({
      ok: true,
      source: FLOWDOC_STORAGE_ROUTE_BINDING_SOURCE,
      mode: FLOWDOC_STORAGE_ROUTE_BINDING_MODE,
      action: "session.save",
      method: "POST",
      httpStatus: 201,
      body: {
        bytes: null,
        result: {
          status: "saved",
          storage: {
            adapter: "@flowdoc/storage-file-json",
            reads: false,
            writes: true,
            recordKinds: ["package-session"],
            byteReads: false,
            byteWrites: false,
          },
        },
        session: {
          manifest: {
            packageId: "vertical-slice-rc-report",
          },
        },
      },
      contracts: {
        routeShapeOnly: true,
        serverRoute: false,
        authzExecution: false,
        artifactByteReads: false,
        artifactByteWrites: false,
        productionStorageReady: false,
        multiRecordTransactions: false,
      },
    })
    expect(loaded).toMatchObject({
      ok: true,
      action: "session.load",
      method: "GET",
      httpStatus: 200,
      body: {
        bytes: null,
        result: {
          status: "loaded",
          storage: {
            reads: true,
            writes: false,
            recordKinds: ["package-session"],
          },
        },
        session: {
          manifest: {
            packageId: "vertical-slice-rc-report",
          },
        },
      },
    })
    expect(JSON.parse(JSON.stringify(loaded))).toEqual(loaded)
  })

  it("maps storage conflicts, missing records, and method mismatches to bounded responses", async () => {
    const binding = createBinding()
    const record = sessionRecord()
    await binding.saveSession({
      method: "POST",
      body: {
        key: "session:route-conflict",
        expectedRevision: null,
        idempotencyKey: "idem:first",
        now: "2026-06-29T04:00:00.000Z",
        record,
      },
    })
    const conflict = await binding.saveSession({
      method: "POST",
      body: {
        key: "session:route-conflict",
        expectedRevision: null,
        idempotencyKey: "idem:conflict",
        now: "2026-06-29T04:01:00.000Z",
        record,
      },
    })
    const missing = await binding.loadSession({
      method: "GET",
      body: {
        key: "session:missing",
      },
    })
    const wrongMethod = await binding.loadSession({
      method: "POST",
      body: {
        key: "session:route-conflict",
      },
    })

    expect(conflict).toMatchObject({
      ok: false,
      httpStatus: 409,
      body: {
        result: {
          status: "conflict",
        },
        issues: [expect.objectContaining({ code: "revision-conflict" })],
      },
    })
    expect(missing).toMatchObject({
      ok: false,
      httpStatus: 404,
      body: {
        result: {
          status: "missing",
        },
      },
    })
    expect(wrongMethod).toMatchObject({
      ok: false,
      method: "POST",
      allowedMethods: ["GET"],
      httpStatus: 405,
      body: {
        result: null,
        bytes: null,
        issues: [expect.objectContaining({ code: "method-not-allowed" })],
      },
    })
  })

  it("creates artifact request records and reads status and metadata through storage", async () => {
    const binding = createBinding()
    const jobInput = {
      jobId: "job:route-binding",
      artifactId: "artifact:route-binding",
      sourcePackageId: "vertical-slice-rc-report",
      sessionId: "session:route-binding",
      layoutProfileId: "layout-profile-v1",
      measurementProfileId: "measurement-profile-v1:thai-rustybuzz-icu4x-v1:rc",
      rendererProfileId: "pdf-spike-profile-v1",
      format: "pdf" as const,
      mediaType: "application/pdf",
      createdAt: "2026-06-29T04:10:00.000Z",
    }
    const requested = await binding.requestArtifactGeneration({
      method: "POST",
      body: {
        requestId: "request:artifact-generation",
        idempotencyKey: "idem:artifact-generation",
        now: "2026-06-29T04:10:00.000Z",
        jobInput,
      },
    })
    const status = await binding.getArtifactStatus({
      method: "GET",
      body: {
        requestId: "request:artifact-status",
        jobKey: "job:route-binding",
      },
    })
    const metadata = await binding.getArtifactMetadata({
      method: "GET",
      body: {
        requestId: "request:artifact-metadata",
        artifactId: "artifact:route-binding",
      },
    })

    expect(requested).toMatchObject({
      ok: true,
      action: "artifact.request",
      httpStatus: 202,
      body: {
        bytes: null,
        result: {
          status: "accepted",
          retry: {
            idempotencyKey: "idem:artifact-generation",
            retryAfterMs: 1000,
          },
          storage: {
            reads: false,
            writes: true,
            recordKinds: ["artifact-manifest", "artifact-job"],
            byteReads: false,
            byteWrites: false,
          },
        },
        artifact: {
          artifactId: "artifact:route-binding",
          status: "planned",
          byteLength: null,
          sha256: null,
          storageKey: null,
        },
        job: {
          jobId: "job:route-binding",
          status: "queued",
        },
      },
    })
    expect(status).toMatchObject({
      ok: true,
      action: "artifact.status",
      httpStatus: 200,
      body: {
        bytes: null,
        result: {
          status: "ready",
          retry: {
            retryAfterMs: 1000,
          },
          storage: {
            reads: true,
            writes: false,
            recordKinds: ["artifact-job"],
          },
        },
        job: {
          jobId: "job:route-binding",
          status: "queued",
        },
        artifact: {
          artifactId: "artifact:route-binding",
          status: "planned",
        },
      },
    })
    expect(metadata).toMatchObject({
      ok: true,
      action: "artifact.metadata",
      httpStatus: 200,
      body: {
        bytes: null,
        result: {
          status: "ready",
          storage: {
            reads: true,
            writes: false,
            recordKinds: ["artifact-manifest"],
          },
        },
        artifact: {
          artifactId: "artifact:route-binding",
          status: "planned",
        },
        job: null,
      },
    })
  })

  it("documents Phase 176 and advances the current roadmap to Phase 177", () => {
    const source = readText("../packages/internal-alpha-runner/src/storageRouteBinding.ts")
    const doc = readText("../docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md")
    const phase175Test = readText("./storageBackedRcRoundtripSmoke.test.ts")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const coreArtifactRoute = readText("../src/generation/artifactApiRoute.ts")

    expect(source).toContain("@flowdoc/storage-file-json")
    expect(source).toContain("serverRoute: false")
    expect(source).toContain("artifactByteWrites: false")
    expect(source).not.toMatch(/node:http|node:https|express|fastify|createServer|listen\(|ReadableStream|playwright|puppeteer/u)
    expect(coreArtifactRoute).not.toContain("@flowdoc/storage-file-json")
    expect(doc).toContain("Status: Phase 176 backend route contract to storage binding.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 177: Artifact Job Execution Slice.")
    expect(readme).toContain("Backend route storage binding boundary")
    expect(readme).toContain("docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md")
    expect(ledger).toContain("| 176 | Backend route contract to storage binding | done |")
    expect(roadmap).toContain("## Phase 176: Backend Route Contract To Storage Binding")
    expect(roadmap).toContain("Current next step after Phase 176:")
    expect(roadmap).toContain("Phase 177: Artifact Job Execution Slice")
    expect(phase175Test).toContain("historical Phase 176 handoff")
  })
})
