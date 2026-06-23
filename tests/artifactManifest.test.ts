import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextArtifactManifestPlan,
  VNEXT_ARTIFACT_MANIFEST_MODE,
  VNEXT_ARTIFACT_MANIFEST_SOURCE,
} from "../src/index.js"

const SHA256 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

function baseRecord() {
  return {
    artifactId: "artifact:pdf:phase-137",
    sourcePackageId: "package:product-report",
    sessionId: null,
    jobId: "job:phase-137",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: 2048,
    sha256: SHA256,
    storageKey: "artifacts/package-product-report/phase-137.pdf",
    createdAt: "2026-06-23T00:00:00.000Z",
    status: "rendered",
    error: null,
  }
}

describe("vNext artifact manifest boundary", () => {
  it("creates a rendered artifact manifest record without writing storage", () => {
    const plan = createVNextArtifactManifestPlan(baseRecord())

    expect(plan).toMatchObject({
      source: VNEXT_ARTIFACT_MANIFEST_SOURCE,
      mode: VNEXT_ARTIFACT_MANIFEST_MODE,
      status: "ready",
      issues: [],
      contracts: {
        jsonSerializable: true,
        fileWrites: false,
        storageWrites: false,
        databaseWrites: false,
        rendererExecution: false,
        backendRoute: false,
      },
      record: {
        manifestVersion: 1,
        artifactId: "artifact:pdf:phase-137",
        sourcePackageId: "package:product-report",
        sessionId: null,
        jobId: "job:phase-137",
        rendererProfileId: "pdf-spike-profile-v1",
        measurementProfileId: "text-engine-profile-v1",
        format: "pdf",
        mediaType: "application/pdf",
        byteLength: 2048,
        sha256: SHA256,
        storageKey: "artifacts/package-product-report/phase-137.pdf",
        storageStatus: "not-written",
        createdAt: "2026-06-23T00:00:00.000Z",
        status: "rendered",
        error: null,
      },
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("keeps planned and rendering states explicit before bytes or hashes exist", () => {
    const planned = createVNextArtifactManifestPlan({
      ...baseRecord(),
      artifactId: "artifact:pdf:planned",
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "planned",
    })
    const rendering = createVNextArtifactManifestPlan({
      ...baseRecord(),
      artifactId: "artifact:pdf:rendering",
      byteLength: null,
      sha256: null,
      storageKey: "artifacts/package-product-report/rendering.pdf",
      status: "rendering",
    })

    expect(planned.status).toBe("ready")
    expect(planned.record).toMatchObject({
      status: "planned",
      byteLength: null,
      sha256: null,
      storageKey: null,
      storageStatus: "not-written",
    })
    expect(rendering.status).toBe("ready")
    expect(rendering.record).toMatchObject({
      status: "rendering",
      byteLength: null,
      sha256: null,
      storageKey: "artifacts/package-product-report/rendering.pdf",
      storageStatus: "not-written",
    })
  })

  it("requires rendered records to carry byte length, sha256, and a storage key record", () => {
    const plan = createVNextArtifactManifestPlan({
      ...baseRecord(),
      byteLength: 0,
      sha256: null,
      storageKey: null,
    })

    expect(plan.status).toBe("blocked")
    expect(plan.record).toBeNull()
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-rendered-byte-length", path: "byteLength" }),
      expect.objectContaining({ code: "missing-rendered-sha256", path: "sha256" }),
      expect.objectContaining({ code: "missing-rendered-storage-key", path: "storageKey" }),
    ]))
  })

  it("requires failed records to carry bounded error data", () => {
    const ready = createVNextArtifactManifestPlan({
      ...baseRecord(),
      artifactId: "artifact:pdf:failed",
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "failed",
      error: {
        code: "renderer-timeout",
        message: "renderer exceeded the phase spike budget",
        retryable: true,
        stack: "this extra field must not be copied",
      },
    })
    const unbounded = createVNextArtifactManifestPlan({
      ...baseRecord(),
      artifactId: "artifact:pdf:failed-long",
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "failed",
      error: {
        code: "renderer-timeout",
        message: "x".repeat(241),
      },
    })

    expect(ready.status).toBe("ready")
    expect(ready.record?.error).toEqual({
      code: "renderer-timeout",
      message: "renderer exceeded the phase spike budget",
      retryable: true,
    })
    expect(JSON.stringify(ready.record?.error)).not.toContain("stack")
    expect(unbounded.status).toBe("blocked")
    expect(unbounded.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "error-message-too-long", path: "error.message" }),
      expect.objectContaining({ code: "missing-failed-error", path: "error" }),
    ]))
  })

  it("blocks missing identity and unknown lifecycle fields with explicit issues", () => {
    const plan = createVNextArtifactManifestPlan({
      ...baseRecord(),
      artifactId: "",
      sourcePackageId: null,
      sessionId: null,
      format: "spreadsheet",
      status: "uploaded",
      createdAt: "not-a-date",
      sha256: "not-a-digest",
      error: null,
    })

    expect(plan.status).toBe("blocked")
    expect(plan.record).toBeNull()
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-string", path: "artifactId" }),
      expect.objectContaining({ code: "invalid-format", path: "format" }),
      expect.objectContaining({ code: "invalid-status", path: "status" }),
      expect.objectContaining({ code: "invalid-created-at", path: "createdAt" }),
      expect.objectContaining({ code: "invalid-sha256", path: "sha256" }),
    ]))
  })

  it("reports intentionally absent fields as explicit null requirements", () => {
    const { artifactId: _artifactId, storageKey: _storageKey, ...partial } = baseRecord()
    const plan = createVNextArtifactManifestPlan(partial)

    expect(plan.status).toBe("blocked")
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-field", path: "artifactId" }),
      expect.objectContaining({ code: "missing-field", path: "storageKey" }),
    ]))
  })

  it("keeps the artifact manifest boundary independent from storage, routes, renderers, and packages", () => {
    const source = readFileSync(new URL("../src/generation/artifactManifest.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain('storageWrites: false')
    expect(source).toContain('storageStatus: "not-written"')
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toContain("createVNextPdfRendererAdapterPlan")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(index).toContain("./generation/artifactManifest.js")
  })

  it("documents Phase 137 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/ARTIFACT_MANIFEST_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 137 artifact manifest and storage boundary.")
    expect(boundaryDoc).toContain("src/generation/artifactManifest.ts")
    expect(boundaryDoc).toContain("storageStatus = `not-written`")
    expect(readme).toContain("Artifact manifest boundary")
    expect(readme).toContain("docs/ARTIFACT_MANIFEST_BOUNDARY.md")
    expect(ledger).toContain("| 137 | Artifact manifest and storage boundary | done |")
    expect(roadmap).toContain("## Phase 137: Artifact Manifest And Storage Boundary")
  })
})
