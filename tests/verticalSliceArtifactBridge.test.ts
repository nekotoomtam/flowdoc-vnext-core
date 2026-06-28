import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  advanceVNextArtifactJob,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  createVNextVerticalSliceArtifactBridgeSummary,
  VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_MODE,
  VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_SOURCE,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
  type VNextVerticalSlicePdfSpikeManifestSummary,
} from "../src/index.js"

const SHA256 = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

function spike(overrides: Partial<VNextVerticalSlicePdfSpikeManifestSummary> = {}): VNextVerticalSlicePdfSpikeManifestSummary {
  return {
    status: "rendered",
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: 4096,
    sha256: SHA256,
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    storageStatus: "not-stored",
    localOnly: true,
    ...overrides,
  }
}

function manifest(overrides: Partial<Parameters<typeof createVNextArtifactManifestPlan>[0]> = {}): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:vertical-slice-report-v1",
    jobId: "job:vertical-slice-report-v1",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: 4096,
    sha256: SHA256,
    storageKey: "artifacts/vertical-slice-report-v1.pdf",
    createdAt: "2026-06-24T01:00:00.000Z",
    status: "rendered",
    error: null,
    ...overrides,
  })
  if (plan.record == null) throw new Error(`manifest did not validate: ${JSON.stringify(plan.issues)}`)
  return plan.record
}

function job(finalManifest = manifest()): VNextArtifactJobRecord {
  const plan = createVNextArtifactJobPlan({
    jobId: "job:vertical-slice-report-v1",
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:vertical-slice-report-v1",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-24T01:00:00.000Z",
  })
  if (plan.job == null) throw new Error("job did not validate")
  const layout = advanceVNextArtifactJob(plan.job, { action: "start-layout", updatedAt: "2026-06-24T01:01:00.000Z" })
  if (layout.status !== "advanced") throw new Error("layout did not start")
  const completeLayout = advanceVNextArtifactJob(layout.job, {
    action: "complete-layout",
    updatedAt: "2026-06-24T01:02:00.000Z",
    cursor: { layoutJobOffset: 1, completedSourceItemIds: ["report-summary"] },
    completedStepCount: 1,
    totalStepCount: 1,
  })
  if (completeLayout.status !== "advanced") throw new Error("layout did not complete")
  const rendering = advanceVNextArtifactJob(completeLayout.job, { action: "start-rendering", updatedAt: "2026-06-24T01:03:00.000Z" })
  if (rendering.status !== "advanced") throw new Error("rendering did not start")
  const rendered = advanceVNextArtifactJob(rendering.job, {
    action: "complete-render",
    updatedAt: "2026-06-24T01:04:00.000Z",
    artifactManifest: finalManifest,
  })
  if (rendered.status !== "advanced") throw new Error(`render did not complete: ${JSON.stringify(rendered.issues)}`)
  return rendered.job
}

function failedJob(): VNextArtifactJobRecord {
  const plan = createVNextArtifactJobPlan({
    jobId: "job:vertical-slice-report-v1",
    artifactId: "artifact:vertical-slice-report-v1:pdf",
    sourcePackageId: "vertical-slice-rc-report",
    sessionId: "session:vertical-slice-report-v1",
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: "measurement-profile-v1:rc",
    rendererProfileId: "pdf-spike-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-24T01:00:00.000Z",
  })
  if (plan.job == null) throw new Error("job did not validate")
  const running = advanceVNextArtifactJob(plan.job, { action: "start-layout", updatedAt: "2026-06-24T01:01:00.000Z" })
  if (running.status !== "advanced") throw new Error("layout did not start")
  const failed = advanceVNextArtifactJob(running.job, {
    action: "fail",
    updatedAt: "2026-06-24T01:02:00.000Z",
    error: {
      code: "pdf-spike-blocked",
      message: "spike could not produce bytes",
      retryable: false,
    },
  })
  if (failed.status !== "advanced") throw new Error(`job did not fail: ${JSON.stringify(failed.issues)}`)
  return failed.job
}

describe("vertical slice artifact bridge", () => {
  it("summarizes successful PDF spike, artifact manifest, and artifact job evidence without storage writes", () => {
    const result = createVNextVerticalSliceArtifactBridgeSummary({
      artifactId: "artifact:vertical-slice-report-v1:pdf",
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "measurement-profile-v1:rc",
      pdfSpikeManifest: spike(),
      artifactManifest: manifest(),
      artifactJob: job(),
    })

    expect(result).toMatchObject({
      source: VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_SOURCE,
      mode: VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_MODE,
      status: "ready",
      summary: {
        status: "rendered",
        artifactId: "artifact:vertical-slice-report-v1:pdf",
        format: "pdf",
        mediaType: "application/pdf",
        byteLength: 4096,
        sha256: SHA256,
        digestStatus: "present",
        storageStatus: "not-stored",
        spikeGrade: true,
      },
      jobStatus: "rendered",
      issues: [],
      contracts: {
        summaryOnly: true,
        coreImportsPdfSpike: false,
        fileWrites: false,
        storageWrites: false,
        backendRoute: false,
        rendererExecution: false,
        docxOutput: false,
        productionFidelity: false,
        packageSchemaChange: false,
      },
    })
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("represents failed artifact production without claiming PDF fidelity", () => {
    const failedManifest = manifest({
      status: "failed",
      byteLength: null,
      sha256: null,
      storageKey: null,
      error: {
        code: "pdf-spike-blocked",
        message: "spike could not produce bytes",
        retryable: false,
      },
    })
    const result = createVNextVerticalSliceArtifactBridgeSummary({
      artifactId: "artifact:vertical-slice-report-v1:pdf",
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "measurement-profile-v1:rc",
      pdfSpikeManifest: spike({ status: "blocked", byteLength: null, sha256: null }),
      artifactManifest: failedManifest,
      artifactJob: failedJob(),
    })

    expect(result.status).toBe("failed")
    expect(result.summary).toMatchObject({
      status: "failed",
      byteLength: null,
      digestStatus: "missing",
      spikeGrade: true,
    })
    expect(result.contracts.productionFidelity).toBe(false)
  })

  it("blocks missing byte length, hash, media type, and identity mismatches", () => {
    const result = createVNextVerticalSliceArtifactBridgeSummary({
      artifactId: "artifact:vertical-slice-report-v1:pdf",
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "measurement-profile-v1:rc",
      pdfSpikeManifest: spike({
        artifactId: "other-artifact",
        mediaType: null,
        byteLength: 0,
        sha256: null,
        storageStatus: "written",
      }),
      artifactManifest: manifest({ byteLength: 1234 }),
      artifactJob: job(),
    })

    expect(result.status).toBe("blocked")
    expect(result.summary.status).toBe("blocked")
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: "blocking", code: "spike-artifact-id-mismatch" }),
      expect.objectContaining({ severity: "blocking", code: "missing-byte-length" }),
      expect.objectContaining({ severity: "blocking", code: "missing-sha256" }),
      expect.objectContaining({ severity: "blocking", code: "invalid-media-type" }),
      expect.objectContaining({ severity: "blocking", code: "unexpected-spike-storage-status" }),
      expect.objectContaining({ severity: "blocking", code: "manifest-byte-length-mismatch" }),
    ]))
  })

  it("keeps the artifact bridge independent from external PDF spike imports, storage, routes, and DOCX", () => {
    const source = readFileSync(new URL("../src/generation/verticalSliceArtifactBridge.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain("coreImportsPdfSpike: false")
    expect(source).toContain("storageWrites: false")
    expect(source).toContain("docxOutput: false")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(index).toContain("./generation/verticalSliceArtifactBridge.js")
  })

  it("documents Phase 149 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_ARTIFACT_BRIDGE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 149 RC artifact production bridge.")
    expect(boundaryDoc).toContain("does not import `packages/pdf-renderer-spike`")
    expect(readme).toContain("Vertical slice artifact bridge")
    expect(readme).toContain("docs/VERTICAL_SLICE_ARTIFACT_BRIDGE_BOUNDARY.md")
    expect(ledger).toContain("| 149 | RC artifact production bridge | done |")
    expect(roadmap).toContain("## Phase 149: RC Artifact Production Bridge")
  })
})
