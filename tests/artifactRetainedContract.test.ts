import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  advanceVNextArtifactJob,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
} from "../src/index.js"

const SHA256 = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"

function artifactInput(overrides: Record<string, unknown> = {}) {
  return {
    artifactId: "artifact:retained-contract",
    sourcePackageId: "package:product-report",
    sessionId: "session:retained-contract",
    jobId: "job:retained-contract",
    rendererProfileId: "pdf-renderer-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-07-03T01:00:00.000Z",
    ...overrides,
  }
}

function readyJob(): VNextArtifactJobRecord {
  const plan = createVNextArtifactJobPlan({
    jobId: "job:retained-contract",
    artifactId: "artifact:retained-contract",
    sourcePackageId: "package:product-report",
    sessionId: "session:retained-contract",
    layoutProfileId: "a4-layout-profile",
    measurementProfileId: "text-engine-profile-v1",
    rendererProfileId: "pdf-renderer-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-07-03T01:00:00.000Z",
  })

  if (plan.job == null) throw new Error("artifact job plan did not validate")
  return plan.job
}

function renderedManifest(): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    ...artifactInput(),
    byteLength: 4096,
    sha256: SHA256,
    storageKey: "artifacts/session-retained-contract/report.pdf",
    status: "rendered",
    error: null,
  })

  if (plan.record == null) throw new Error("rendered manifest did not validate")
  return plan.record
}

describe("vNext artifact retained contract", () => {
  it("plans artifact manifests as JSON-safe storage records without writes", () => {
    const plan = createVNextArtifactManifestPlan({
      ...artifactInput(),
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "planned",
      error: null,
    })

    expect(plan).toMatchObject({
      source: "vnext-artifact-manifest",
      mode: "artifact-storage-record-boundary",
      status: "ready",
      record: {
        manifestVersion: 1,
        artifactId: "artifact:retained-contract",
        sourcePackageId: "package:product-report",
        sessionId: "session:retained-contract",
        jobId: "job:retained-contract",
        rendererProfileId: "pdf-renderer-profile-v1",
        measurementProfileId: "text-engine-profile-v1",
        format: "pdf",
        mediaType: "application/pdf",
        byteLength: null,
        sha256: null,
        storageKey: null,
        storageStatus: "not-written",
        status: "planned",
        error: null,
      },
      issues: [],
      contracts: {
        jsonSerializable: true,
        fileWrites: false,
        storageWrites: false,
        databaseWrites: false,
        rendererExecution: false,
        backendRoute: false,
      },
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks impossible artifact manifest lifecycle states before storage writes exist", () => {
    const plan = createVNextArtifactManifestPlan({
      ...artifactInput(),
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "rendered",
      error: null,
    })

    expect(plan.status).toBe("blocked")
    expect(plan.record).toBeNull()
    expect(plan.contracts).toMatchObject({
      storageWrites: false,
      rendererExecution: false,
      backendRoute: false,
    })
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-rendered-byte-length", path: "byteLength" }),
      expect.objectContaining({ code: "missing-rendered-sha256", path: "sha256" }),
      expect.objectContaining({ code: "missing-rendered-storage-key", path: "storageKey" }),
    ]))
  })

  it("creates and advances durable artifact job records without executing workers", () => {
    const job = readyJob()

    expect(job).toMatchObject({
      source: "vnext-artifact-job",
      mode: "durable-layout-artifact-job-boundary",
      status: "queued",
      progress: {
        stage: "queued",
        completedStepCount: 0,
        totalStepCount: null,
        percent: 0,
      },
      artifactManifest: {
        status: "planned",
        storageStatus: "not-written",
      },
      execution: {
        worker: false,
        layout: false,
        renderer: false,
        storageWrites: false,
      },
    })

    const layoutRunning = advanceVNextArtifactJob(job, {
      action: "start-layout",
      updatedAt: "2026-07-03T01:01:00.000Z",
    })
    const progress = advanceVNextArtifactJob(layoutRunning.job, {
      action: "record-layout-progress",
      updatedAt: "2026-07-03T01:02:00.000Z",
      cursor: {
        layoutJobOffset: 2,
        completedSourceItemIds: ["title", "detail-table"],
      },
      completedStepCount: 2,
      totalStepCount: 4,
    })
    const layoutComplete = advanceVNextArtifactJob(progress.job, {
      action: "complete-layout",
      updatedAt: "2026-07-03T01:03:00.000Z",
      completedStepCount: 4,
      totalStepCount: 4,
    })
    const rendering = advanceVNextArtifactJob(layoutComplete.job, {
      action: "start-rendering",
      updatedAt: "2026-07-03T01:04:00.000Z",
    })
    const rendered = advanceVNextArtifactJob(rendering.job, {
      action: "complete-render",
      updatedAt: "2026-07-03T01:05:00.000Z",
      artifactManifest: renderedManifest(),
    })

    expect(layoutRunning).toMatchObject({
      status: "advanced",
      action: "start-layout",
      previousStatus: "queued",
      nextStatus: "layout-running",
      contracts: {
        workerExecution: false,
        layoutExecution: false,
        rendererExecution: false,
        storageWrites: false,
        queueWrites: false,
        backendRoute: false,
      },
    })
    expect(progress.job).toMatchObject({
      status: "layout-running",
      cursor: {
        layoutJobOffset: 2,
        completedSourceItemIds: ["title", "detail-table"],
      },
      progress: {
        stage: "layout",
        completedStepCount: 2,
        totalStepCount: 4,
        percent: 50,
      },
    })
    expect(layoutComplete).toMatchObject({
      status: "advanced",
      nextStatus: "layout-complete",
      job: {
        status: "layout-complete",
        progress: {
          percent: 100,
        },
      },
    })
    expect(rendering).toMatchObject({
      status: "advanced",
      nextStatus: "rendering",
      job: {
        status: "rendering",
        artifactManifest: {
          status: "rendering",
          byteLength: null,
          sha256: null,
        },
      },
    })
    expect(rendered).toMatchObject({
      status: "advanced",
      nextStatus: "rendered",
      job: {
        status: "rendered",
        progress: {
          stage: "complete",
          percent: 100,
        },
        artifactManifest: {
          status: "rendered",
          byteLength: 4096,
          sha256: SHA256,
          storageKey: "artifacts/session-retained-contract/report.pdf",
        },
        execution: {
          worker: false,
          layout: false,
          renderer: false,
          storageWrites: false,
        },
      },
    })
  })

  it("blocks out-of-order job transitions inside the retained state machine", () => {
    const job = readyJob()
    const blocked = advanceVNextArtifactJob(job, {
      action: "complete-render",
      updatedAt: "2026-07-03T01:05:00.000Z",
      artifactManifest: renderedManifest(),
    })

    expect(blocked).toMatchObject({
      status: "blocked",
      action: "complete-render",
      previousStatus: "queued",
      nextStatus: "queued",
      job: {
        status: "queued",
      },
      contracts: {
        workerExecution: false,
        layoutExecution: false,
        rendererExecution: false,
        storageWrites: false,
        queueWrites: false,
        backendRoute: false,
      },
    })
    expect(blocked.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-transition", path: "status" }),
    ]))
  })

  it("keeps retained artifact contracts independent from routes, storage, renderers, and streaming", () => {
    const manifestSource = readFileSync(new URL("../src/generation/artifactManifest.ts", import.meta.url), "utf8")
    const jobSource = readFileSync(new URL("../src/generation/artifactJob.ts", import.meta.url), "utf8")
    const source = `${manifestSource}\n${jobSource}`

    expect(source).toContain("createVNextArtifactManifestPlan")
    expect(source).toContain("createVNextArtifactJobPlan")
    expect(source).toContain("advanceVNextArtifactJob")
    expect(source).toContain("storageWrites: false")
    expect(source).toContain("rendererExecution: false")
    expect(source).not.toContain("createVNextArtifactGenerationApiRouteResponse")
    expect(source).not.toContain("createVNextArtifactStatusApiRouteResponse")
    expect(source).not.toContain("createVNextSessionArtifactListApiRouteResponse")
    expect(source).not.toContain("createVNextArtifactDownloadMetadataApiRouteResponse")
    expect(source).not.toMatch(/node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/node:fs|writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("flowdoc-vnext-backend")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("ReadableStream")
    expect(source).not.toContain("createVNextPdfRendererAdapterPlan")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
  })
})
