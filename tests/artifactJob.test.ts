import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  advanceVNextArtifactJob,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  VNEXT_ARTIFACT_JOB_MODE,
  VNEXT_ARTIFACT_JOB_SOURCE,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
} from "../src/index.js"

const SHA256 = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

function createJob(overrides: Partial<Parameters<typeof createVNextArtifactJobPlan>[0]> = {}): VNextArtifactJobRecord {
  const plan = createVNextArtifactJobPlan({
    jobId: "artifact-job:phase-139",
    artifactId: "artifact:phase-139",
    sourcePackageId: "package:product-report",
    sessionId: "session:phase-139",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-23T02:00:00.000Z",
    ...overrides,
  })
  if (plan.job == null) throw new Error("test job did not validate")
  return plan.job
}

function renderedManifest(job: VNextArtifactJobRecord): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    artifactId: job.artifact.artifactId,
    sourcePackageId: job.input.sourcePackageId,
    sessionId: job.input.sessionId,
    jobId: job.jobId,
    rendererProfileId: job.profiles.rendererProfileId,
    measurementProfileId: job.profiles.measurementProfileId,
    format: job.artifact.format,
    mediaType: job.artifact.mediaType,
    byteLength: 8192,
    sha256: SHA256,
    storageKey: "artifacts/session-phase-139/artifact.pdf",
    createdAt: "2026-06-23T02:05:00.000Z",
    status: "rendered",
    error: null,
  })
  if (plan.record == null) throw new Error("test manifest did not validate")
  return plan.record
}

function advance(job: VNextArtifactJobRecord, command: Parameters<typeof advanceVNextArtifactJob>[1]): VNextArtifactJobRecord {
  const plan = advanceVNextArtifactJob(job, command)
  if (plan.status !== "advanced") throw new Error(`transition failed: ${JSON.stringify(plan.issues)}`)
  return plan.job
}

describe("vNext artifact job boundary", () => {
  it("creates a durable artifact job record with a planned manifest reference", () => {
    const plan = createVNextArtifactJobPlan({
      jobId: "artifact-job:phase-139",
      artifactId: "artifact:phase-139",
      sourcePackageId: "package:product-report",
      sessionId: "session:phase-139",
      layoutProfileId: "layout-profile-v1",
      measurementProfileId: "text-engine-profile-v1",
      rendererProfileId: "pdf-spike-profile-v1",
      format: "pdf",
      mediaType: "application/pdf",
      createdAt: "2026-06-23T02:00:00.000Z",
    })

    expect(plan).toMatchObject({
      source: VNEXT_ARTIFACT_JOB_SOURCE,
      mode: VNEXT_ARTIFACT_JOB_MODE,
      status: "ready",
      issues: [],
      contracts: {
        durableRecordOnly: true,
        workerExecution: false,
        layoutExecution: false,
        rendererExecution: false,
        storageWrites: false,
        queueWrites: false,
        backendRoute: false,
      },
      job: {
        status: "queued",
        input: {
          sourcePackageId: "package:product-report",
          sessionId: "session:phase-139",
        },
        profiles: {
          layoutProfileId: "layout-profile-v1",
          measurementProfileId: "text-engine-profile-v1",
          rendererProfileId: "pdf-spike-profile-v1",
        },
        cursor: {
          layoutJobOffset: 0,
          completedSourceItemIds: [],
        },
        progress: {
          stage: "queued",
          completedStepCount: 0,
          totalStepCount: null,
          percent: 0,
        },
        retry: {
          retryCount: 0,
          maxRetryCount: 3,
        },
        artifactManifest: {
          artifactId: "artifact:phase-139",
          status: "planned",
          byteLength: null,
          sha256: null,
          storageKey: null,
          storageStatus: "not-written",
        },
        execution: {
          worker: false,
          layout: false,
          renderer: false,
          storageWrites: false,
        },
      },
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("advances the layout-to-render lifecycle without executing worker, layout, renderer, or storage", () => {
    const job = createJob()
    const layoutRunning = advance(job, {
      action: "start-layout",
      updatedAt: "2026-06-23T02:01:00.000Z",
    })
    const progressed = advance(layoutRunning, {
      action: "record-layout-progress",
      updatedAt: "2026-06-23T02:02:00.000Z",
      cursor: {
        layoutJobOffset: 2,
        completedSourceItemIds: ["section-main:body-zone", "section-main:title"],
      },
      completedStepCount: 2,
      totalStepCount: 4,
    })
    const layoutComplete = advance(progressed, {
      action: "complete-layout",
      updatedAt: "2026-06-23T02:03:00.000Z",
      cursor: {
        layoutJobOffset: 4,
        completedSourceItemIds: ["section-main:body-zone", "section-main:title", "section-main:body", "section-main:summary"],
      },
      completedStepCount: 4,
      totalStepCount: 4,
    })
    const rendering = advance(layoutComplete, {
      action: "start-rendering",
      updatedAt: "2026-06-23T02:04:00.000Z",
    })
    const completed = advanceVNextArtifactJob(rendering, {
      action: "complete-render",
      updatedAt: "2026-06-23T02:06:00.000Z",
      artifactManifest: renderedManifest(rendering),
    })

    expect(progressed).toMatchObject({
      status: "layout-running",
      cursor: {
        layoutJobOffset: 2,
      },
      progress: {
        stage: "layout",
        completedStepCount: 2,
        totalStepCount: 4,
        percent: 50,
      },
      execution: {
        worker: false,
        layout: false,
        renderer: false,
        storageWrites: false,
      },
    })
    expect(rendering).toMatchObject({
      status: "rendering",
      artifactManifest: {
        status: "rendering",
        byteLength: null,
        sha256: null,
      },
    })
    expect(completed).toMatchObject({
      status: "advanced",
      previousStatus: "rendering",
      nextStatus: "rendered",
      job: {
        status: "rendered",
        progress: {
          stage: "complete",
          percent: 100,
        },
        artifactManifest: {
          status: "rendered",
          byteLength: 8192,
          sha256: SHA256,
          storageKey: "artifacts/session-phase-139/artifact.pdf",
        },
      },
      contracts: {
        workerExecution: false,
        layoutExecution: false,
        rendererExecution: false,
        storageWrites: false,
      },
    })
  })

  it("blocks invalid transitions and invalid progress", () => {
    const job = createJob()
    const prematureRender = advanceVNextArtifactJob(job, {
      action: "complete-render",
      updatedAt: "2026-06-23T02:01:00.000Z",
      artifactManifest: renderedManifest(job),
    })
    const running = advance(job, {
      action: "start-layout",
      updatedAt: "2026-06-23T02:01:00.000Z",
    })
    const badProgress = advanceVNextArtifactJob(running, {
      action: "record-layout-progress",
      updatedAt: "2026-06-23T02:02:00.000Z",
      cursor: {
        layoutJobOffset: 4,
        completedSourceItemIds: ["a"],
      },
      completedStepCount: 5,
      totalStepCount: 4,
    })

    expect(prematureRender).toMatchObject({
      status: "blocked",
      previousStatus: "queued",
      nextStatus: "queued",
      issues: [expect.objectContaining({ code: "invalid-transition" })],
    })
    expect(badProgress).toMatchObject({
      status: "blocked",
      previousStatus: "layout-running",
      nextStatus: "layout-running",
      issues: [expect.objectContaining({ code: "progress-over-total" })],
    })
  })

  it("makes fail, retry, retry limit, and cancellation semantics explicit", () => {
    const job = createJob({ maxRetryCount: 1 })
    const running = advance(job, {
      action: "start-layout",
      updatedAt: "2026-06-23T02:01:00.000Z",
    })
    const failed = advanceVNextArtifactJob(running, {
      action: "fail",
      updatedAt: "2026-06-23T02:02:00.000Z",
      error: {
        code: "renderer-timeout",
        message: "renderer timed out before producing bytes",
        retryable: true,
        stack: "not copied",
      },
    })
    const retried = advanceVNextArtifactJob(failed.job, {
      action: "retry",
      updatedAt: "2026-06-23T02:03:00.000Z",
    })
    const secondFailure = advanceVNextArtifactJob(retried.job, {
      action: "fail",
      updatedAt: "2026-06-23T02:04:00.000Z",
      error: {
        code: "renderer-timeout",
        message: "renderer timed out again",
        retryable: false,
      },
    })
    const retryBlocked = advanceVNextArtifactJob(secondFailure.job, {
      action: "retry",
      updatedAt: "2026-06-23T02:05:00.000Z",
    })
    const cancelled = advanceVNextArtifactJob(createJob(), {
      action: "cancel",
      updatedAt: "2026-06-23T02:06:00.000Z",
      reason: "owner-request",
    })

    expect(failed).toMatchObject({
      status: "advanced",
      nextStatus: "failed",
      job: {
        status: "failed",
        error: {
          code: "renderer-timeout",
          message: "renderer timed out before producing bytes",
          retryable: true,
        },
        artifactManifest: {
          status: "failed",
          error: {
            code: "renderer-timeout",
            retryable: true,
          },
        },
      },
    })
    expect(JSON.stringify(failed.job.error)).not.toContain("stack")
    expect(retried).toMatchObject({
      status: "advanced",
      previousStatus: "failed",
      nextStatus: "queued",
      job: {
        status: "queued",
        retry: {
          retryCount: 1,
          maxRetryCount: 1,
        },
        error: null,
        artifactManifest: {
          status: "planned",
          error: null,
        },
      },
    })
    expect(retryBlocked).toMatchObject({
      status: "blocked",
      action: "retry",
      issues: [expect.objectContaining({ code: "retry-limit-exceeded" })],
    })
    expect(cancelled).toMatchObject({
      status: "advanced",
      nextStatus: "cancelled",
      job: {
        status: "cancelled",
        cancellation: {
          requested: true,
          reason: "owner-request",
          cancelledAt: "2026-06-23T02:06:00.000Z",
        },
      },
    })
  })

  it("blocks rendered manifests that do not match the job identity", () => {
    const job = advance(advance(advance(createJob(), {
      action: "start-layout",
      updatedAt: "2026-06-23T02:01:00.000Z",
    }), {
      action: "complete-layout",
      updatedAt: "2026-06-23T02:02:00.000Z",
      completedStepCount: 0,
      totalStepCount: 0,
    }), {
      action: "start-rendering",
      updatedAt: "2026-06-23T02:03:00.000Z",
    })
    const mismatch = createVNextArtifactManifestPlan({
      ...renderedManifest(job),
      artifactId: "artifact:other",
    })
    const result = advanceVNextArtifactJob(job, {
      action: "complete-render",
      updatedAt: "2026-06-23T02:04:00.000Z",
      artifactManifest: mismatch.record,
    })

    expect(result).toMatchObject({
      status: "blocked",
      previousStatus: "rendering",
      nextStatus: "rendering",
      issues: [expect.objectContaining({ code: "artifact-id-mismatch" })],
    })
  })

  it("keeps artifact jobs independent from workers, queues, routes, renderers, storage, and concrete layout", () => {
    const source = readFileSync(new URL("../src/generation/artifactJob.ts", import.meta.url), "utf8")

    expect(source).toContain("durableRecordOnly: true")
    expect(source).toContain("workerExecution: false")
    expect(source).toContain("rendererExecution: false")
    expect(source).toContain("storageWrites: false")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/worker_threads|bullmq|agenda|queueMicrotask/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toContain("runVNextPausableLayoutJobEngineChunk")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("createVNextPdfRendererAdapterPlan")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
  })

  it("documents Phase 139 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/ARTIFACT_JOB_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 139 durable layout and artifact job boundary.")
    expect(boundaryDoc).toContain("src/generation/artifactJob.ts")
    expect(boundaryDoc).toContain("This is not a worker runtime")
    expect(readme).toContain("Artifact job boundary")
    expect(readme).toContain("docs/ARTIFACT_JOB_BOUNDARY.md")
    expect(ledger).toContain("| 139 | Durable layout and artifact job boundary | done |")
    expect(roadmap).toContain("## Phase 139: Durable Layout Job / Artifact Job Boundary")
  })
})
