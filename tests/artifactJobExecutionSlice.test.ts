import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { createFlowDocFileJsonArtifactByteStore, createFlowDocFileJsonStorageAdapter } from "@flowdoc/storage-file-json"
import {
  FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE,
  FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE,
  runFlowDocArtifactJobExecutionSlice,
} from "@flowdoc/internal-alpha-runner"
import type { AuthoredNode, DocumentNode, VNextArtifactJobCreateInput, VNextPdfRendererAdapterPlan } from "../src/index.js"
import {
  buildVNextMeasuredRendererConsumption,
  createVNextPdfRendererAdapterPlan,
  paginateVNextDocument,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, text: string): AuthoredNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function simpleDoc(): DocumentNode {
  return {
    version: 3,
    document: {
      id: "artifact-job-execution-doc",
      meta: { title: "Artifact Job Execution" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: {
            top: pt(72),
            right: pt(72),
            bottom: pt(72),
            left: pt(72),
          },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: ["body"] },
          body: textBlock("body", "Phase 177 artifact job execution"),
        },
      }],
    },
  }
}

function readyPdfPlan(): VNextPdfRendererAdapterPlan {
  const pagination = paginateVNextDocument(simpleDoc())
  return createVNextPdfRendererAdapterPlan(buildVNextMeasuredRendererConsumption(pagination))
}

function blockedPdfPlan(): VNextPdfRendererAdapterPlan {
  const plan = readyPdfPlan()

  return {
    ...plan,
    status: "blocked",
    drawCommands: [],
    blockingIssues: [{
      severity: "blocking",
      code: "invalid-fragment-geometry",
      sectionId: "section-main",
      nodeId: "body",
      fragmentId: "body-fragment",
      pageIndex: 0,
      message: "blocked for Phase 177 failed-job evidence",
    }],
  }
}

function jobInput(overrides: Partial<VNextArtifactJobCreateInput> = {}): VNextArtifactJobCreateInput {
  return {
    jobId: "job:phase-177",
    artifactId: "artifact:phase-177",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:phase-177",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "measurement-profile-v1:thai-rustybuzz-icu4x-v1:rc",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-29T05:00:00.000Z",
    ...overrides,
  }
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("artifact job execution slice", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function tempRoot(): string {
    const root = mkdtempSync(join(tmpdir(), "flowdoc-artifact-job-execution-"))
    tempRoots.push(root)
    return root
  }

  it("executes a job through PDF spike bytes, byte storage, and rendered records", async () => {
    const rootDirectory = tempRoot()
    const result = await runFlowDocArtifactJobExecutionSlice({
      rootDirectory,
      jobInput: jobInput(),
      pdfPlan: readyPdfPlan(),
      spikeId: "phase-177-rendered",
      now: "2026-06-29T05:00:00.000Z",
    })

    expect(result).toMatchObject({
      source: FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE,
      mode: FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE,
      status: "rendered",
      job: {
        jobId: "job:phase-177",
        status: "rendered",
        revision: 1,
      },
      artifact: {
        artifactId: "artifact:phase-177",
        status: "rendered",
        revision: 2,
      },
      pdfSpike: {
        spikeId: "phase-177-rendered",
        status: "rendered",
        productionFidelity: false,
        storageWrites: false,
      },
      bytes: {
        artifactId: "artifact:phase-177",
        writeStatus: "written",
        readStatus: "found",
        consistencyStatus: "consistent",
      },
      contracts: {
        externalPackage: true,
        usesConcreteFileJsonStorage: true,
        recordStorageWrites: true,
        artifactByteWrites: true,
        pdfSpikeExecution: true,
        workerOrQueue: false,
        backendRoute: false,
        authzExecution: false,
        productionRendererReady: false,
        productionStorageReady: false,
        packageSchemaChange: false,
        documentSchemaChange: false,
        docxRenderer: false,
        browserInputReady: false,
        multiRecordTransactions: false,
      },
      failBlocker: [],
    })
    expect(result.records.map((entry) => [entry.kind, entry.revision, entry.artifactStatus, entry.jobStatus])).toEqual([
      ["artifact-manifest", 0, "planned", null],
      ["artifact-job", 0, null, "queued"],
      ["artifact-manifest", 1, "rendering", null],
      ["artifact-manifest", 2, "rendered", null],
      ["artifact-job", 1, null, "rendered"],
    ])
    expect(result.bytes?.byteLength).toBeGreaterThan(0)
    expect(result.bytes?.sha256).toMatch(/^[a-f0-9]{64}$/u)
    expect(result.artifact?.sha256).toBe(result.bytes?.sha256)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)

    const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory })
    const storedJob = await adapter.artifactJobs.read({ kind: "artifact-job", key: "job:phase-177" })
    const storedManifest = await adapter.artifactManifests.read({ kind: "artifact-manifest", key: "artifact:phase-177" })
    expect(storedJob.ok).toBe(true)
    expect(storedManifest.ok).toBe(true)
    if (!storedJob.ok || !storedManifest.ok || result.artifact?.storageKey == null) throw new Error("stored artifact job evidence missing")
    expect(storedJob.record.value.status).toBe("rendered")
    expect(storedManifest.record.value.status).toBe("rendered")

    const byteStore = createFlowDocFileJsonArtifactByteStore({ rootDirectory })
    const storedBytes = await byteStore.read({ storageKey: result.artifact.storageKey })
    expect(storedBytes.ok).toBe(true)
    if (!storedBytes.ok) throw new Error("stored PDF bytes missing")
    expect(Buffer.from(storedBytes.bytes).toString("utf8", 0, 8)).toBe("%PDF-1.4")
    expect(Buffer.from(storedBytes.bytes).toString("utf8")).toContain("Phase 177 artifact job execution")
  })

  it("persists a failed job and failed manifest when the PDF spike blocks", async () => {
    const rootDirectory = tempRoot()
    const result = await runFlowDocArtifactJobExecutionSlice({
      rootDirectory,
      jobInput: jobInput({
        jobId: "job:phase-177-failed",
        artifactId: "artifact:phase-177-failed",
      }),
      pdfPlan: blockedPdfPlan(),
      spikeId: "phase-177-blocked",
      now: "2026-06-29T05:05:00.000Z",
      bindProductionRenderer: true,
    })

    expect(result).toMatchObject({
      status: "failed",
      job: {
        jobId: "job:phase-177-failed",
        status: "failed",
        revision: 1,
      },
      artifact: {
        artifactId: "artifact:phase-177-failed",
        status: "failed",
        byteLength: null,
        sha256: null,
        storageKey: null,
        revision: 2,
      },
      pdfSpike: {
        spikeId: "phase-177-blocked",
        status: "blocked",
      },
      bytes: null,
    })
    expect(result.failBlocker.join("\n")).toContain("production-binding")
    expect(result.records.map((entry) => [entry.kind, entry.revision, entry.artifactStatus, entry.jobStatus])).toEqual([
      ["artifact-manifest", 0, "planned", null],
      ["artifact-job", 0, null, "queued"],
      ["artifact-manifest", 1, "rendering", null],
      ["artifact-manifest", 2, "failed", null],
      ["artifact-job", 1, null, "failed"],
    ])

    const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory })
    const storedJob = await adapter.artifactJobs.read({ kind: "artifact-job", key: "job:phase-177-failed" })
    const storedManifest = await adapter.artifactManifests.read({ kind: "artifact-manifest", key: "artifact:phase-177-failed" })
    expect(storedJob.ok).toBe(true)
    expect(storedManifest.ok).toBe(true)
    if (!storedJob.ok || !storedManifest.ok) throw new Error("stored failed artifact job evidence missing")
    expect(storedJob.record.value.status).toBe("failed")
    expect(storedManifest.record.value.status).toBe("failed")
  })

  it("documents Phase 177 and advances the current roadmap to Phase 178", () => {
    const source = readText("../packages/internal-alpha-runner/src/artifactJobExecution.ts")
    const packageJson = readText("../packages/internal-alpha-runner/package.json")
    const doc = readText("../docs/ARTIFACT_JOB_EXECUTION_SLICE.md")
    const routeTest = readText("./backendRouteStorageBinding.test.ts")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const coreIndex = readText("../src/index.ts")

    expect(source).toContain("@flowdoc/pdf-renderer-spike")
    expect(source).toContain("@flowdoc/storage-file-json")
    expect(source).toContain("backendRoute: false")
    expect(source).toContain("productionRendererReady: false")
    expect(source).toContain("docxRenderer: false")
    expect(source).not.toMatch(/node:http|node:https|express|fastify|createServer|listen\(|playwright|puppeteer|pdfkit|pdf-lib|jspdf/u)
    expect(packageJson).toContain('"@flowdoc/pdf-renderer-spike"')
    expect(coreIndex).not.toContain("artifactJobExecution")
    expect(coreIndex).not.toContain("@flowdoc/pdf-renderer-spike")
    expect(doc).toContain("Status: Phase 177 artifact job execution slice.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 178: PDF Renderer Decision Gate.")
    expect(readme).toContain("Artifact job execution slice")
    expect(readme).toContain("docs/ARTIFACT_JOB_EXECUTION_SLICE.md")
    expect(ledger).toContain("| 177 | Artifact job execution slice | done |")
    expect(roadmap).toContain("## Phase 177: Artifact Job Execution Slice")
    expect(roadmap).toContain("Current next step after Phase 177:")
    expect(roadmap).toContain("Phase 178: PDF Renderer Decision Gate")
    expect(routeTest).toContain("historical Phase 177 handoff")
  })
})
