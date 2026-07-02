import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextArtifactDownloadMetadataApiRouteResponse,
  createVNextArtifactGenerationApiRouteResponse,
  createVNextArtifactManifestPlan,
  createVNextArtifactStatusApiRouteResponse,
  createVNextSessionArtifactListApiRouteResponse,
  VNEXT_ARTIFACT_API_ROUTE_MODE,
  VNEXT_ARTIFACT_API_ROUTE_SOURCE,
  type VNextArtifactManifestRecord,
} from "../src/index.js"

const ROUTE_HELPER_COMPATIBILITY_WINDOW = "Window B route-helper compatibility test"
const SHA256 = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"

function permission(scope: string) {
  return {
    principalId: "user:phase-138",
    tenantId: "tenant:flowdoc",
    scope,
  }
}

function artifactInput(overrides: Record<string, unknown> = {}) {
  return {
    artifactId: "artifact:phase-138",
    sourcePackageId: "package:product-report",
    sessionId: "session:phase-138",
    jobId: "job:phase-138",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-23T01:00:00.000Z",
    ...overrides,
  }
}

function manifest(overrides: Record<string, unknown> = {}): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    ...artifactInput(),
    byteLength: 4096,
    sha256: SHA256,
    storageKey: "artifacts/session-phase-138/artifact.pdf",
    status: "rendered",
    error: null,
    ...overrides,
  })
  if (plan.record == null) throw new Error("test manifest did not validate")
  return plan.record
}

describe("vNext artifact API route contract boundary", () => {
  it("marks this route-helper suite as compatibility-window coverage", () => {
    expect(ROUTE_HELPER_COMPATIBILITY_WINDOW).toContain("Window B")
  })

  it("accepts artifact generation requests as route-safe planned manifests", () => {
    const response = createVNextArtifactGenerationApiRouteResponse({
      method: "POST",
      body: {
        requestId: "request-artifact-1",
        idempotencyKey: "idem-artifact-1",
        permission: permission("artifact:generate"),
        artifact: artifactInput(),
      },
    })

    expect(response).toMatchObject({
      ok: true,
      source: VNEXT_ARTIFACT_API_ROUTE_SOURCE,
      mode: VNEXT_ARTIFACT_API_ROUTE_MODE,
      action: "artifact.request",
      method: "POST",
      allowedMethods: ["POST"],
      httpStatus: 202,
      headers: {
        allow: "POST",
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
      body: {
        source: VNEXT_ARTIFACT_API_ROUTE_SOURCE,
        mode: VNEXT_ARTIFACT_API_ROUTE_MODE,
        action: "artifact.request",
        issues: [],
        bytes: null,
        download: null,
        artifacts: [],
        result: {
          status: "accepted",
          requestId: "request-artifact-1",
          idempotencyKey: "idem-artifact-1",
          artifactStatus: "planned",
          permission: {
            required: true,
            checked: false,
            context: {
              principalId: "user:phase-138",
              tenantId: "tenant:flowdoc",
              scope: "artifact:generate",
              checked: false,
            },
          },
          retry: {
            safe: true,
            idempotencyKey: "idem-artifact-1",
            retryAfterMs: 1000,
          },
          job: {
            status: "not-created",
            reason: "route-contract-only",
          },
          storage: {
            reads: false,
            writes: false,
            reason: "route-contract-only",
          },
          renderer: {
            execution: false,
          },
        },
        artifact: {
          artifactId: "artifact:phase-138",
          status: "planned",
          byteLength: null,
          sha256: null,
          storageKey: null,
          storageStatus: "not-written",
        },
      },
    })
    expect(JSON.parse(JSON.stringify(response))).toEqual(response)
  })

  it("maps invalid generation request shapes to bounded 400 responses", () => {
    const response = createVNextArtifactGenerationApiRouteResponse({
      method: "POST",
      body: {
        permission: permission("artifact:read"),
        artifact: artifactInput({ format: "spreadsheet" }),
      },
    })

    expect(response.ok).toBe(false)
    expect(response.httpStatus).toBe(400)
    expect(response.body.result).toBeNull()
    expect(response.body.artifact).toBeNull()
    expect(response.body.bytes).toBeNull()
    expect(response.body.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "request", code: "invalid-string", path: "idempotencyKey" }),
      expect.objectContaining({ category: "permission", code: "invalid-permission-scope", path: "permission.scope" }),
      expect.objectContaining({ category: "artifact", code: "invalid-format", path: "artifact.format" }),
    ]))
  })

  it("reports artifact status with retry-safe polling metadata", () => {
    const rendering = manifest({
      byteLength: null,
      sha256: null,
      storageKey: "artifacts/session-phase-138/rendering.pdf",
      status: "rendering",
    })
    const response = createVNextArtifactStatusApiRouteResponse({
      method: "GET",
      body: {
        requestId: "status-request-1",
        artifactId: rendering.artifactId,
        permission: permission("artifact:read"),
        artifactManifest: rendering,
      },
    })

    expect(response).toMatchObject({
      ok: true,
      httpStatus: 200,
      body: {
        action: "artifact.status",
        download: null,
        bytes: null,
        result: {
          status: "ready",
          requestId: "status-request-1",
          idempotencyKey: null,
          artifactStatus: "rendering",
          retry: {
            safe: true,
            idempotencyKey: null,
            retryAfterMs: 1000,
          },
          storage: {
            reads: false,
            writes: false,
          },
        },
        artifact: {
          artifactId: rendering.artifactId,
          status: "rendering",
        },
      },
    })
  })

  it("lists caller-supplied session artifacts without storage lookup", () => {
    const first = manifest({ artifactId: "artifact:session-match-1", sessionId: "session:phase-138" })
    const second = manifest({ artifactId: "artifact:other-session", sessionId: "session:other" })
    const third = manifest({
      artifactId: "artifact:session-match-2",
      sessionId: "session:phase-138",
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "planned",
    })
    const response = createVNextSessionArtifactListApiRouteResponse({
      method: "GET",
      body: {
        requestId: "list-request-1",
        sessionId: "session:phase-138",
        permission: permission("artifact:list"),
        artifacts: [first, second, third],
      },
    })

    expect(response.ok).toBe(true)
    expect(response.body.artifacts.map((artifact) => artifact.artifactId)).toEqual([
      "artifact:session-match-1",
      "artifact:session-match-2",
    ])
    expect(response.body.result).toMatchObject({
      action: "artifact.listSession",
      status: "ready",
      artifactStatus: "rendered",
      retry: {
        safe: true,
        retryAfterMs: 1000,
      },
      storage: {
        reads: false,
        writes: false,
      },
    })
  })

  it("returns download metadata for rendered artifacts without streaming bytes", () => {
    const rendered = manifest()
    const response = createVNextArtifactDownloadMetadataApiRouteResponse({
      method: "GET",
      body: {
        requestId: "download-request-1",
        artifactId: rendered.artifactId,
        permission: permission("artifact:download"),
        artifactManifest: rendered,
      },
    })

    expect(response).toMatchObject({
      ok: true,
      httpStatus: 200,
      body: {
        action: "artifact.downloadMetadata",
        bytes: null,
        artifacts: [],
        artifact: {
          artifactId: rendered.artifactId,
          status: "rendered",
        },
        download: {
          artifactId: rendered.artifactId,
          format: "pdf",
          mediaType: "application/pdf",
          byteLength: 4096,
          sha256: SHA256,
          storageKey: "artifacts/session-phase-138/artifact.pdf",
          url: null,
          bytes: null,
          status: "metadata-only",
        },
      },
    })
  })

  it("blocks download metadata for non-rendered artifacts and rejects wrong methods", () => {
    const planned = manifest({
      byteLength: null,
      sha256: null,
      storageKey: null,
      status: "planned",
    })
    const blockedDownload = createVNextArtifactDownloadMetadataApiRouteResponse({
      method: "GET",
      body: {
        artifactId: planned.artifactId,
        permission: permission("artifact:download"),
        artifactManifest: planned,
      },
    })
    const methodBlocked = createVNextArtifactStatusApiRouteResponse({
      method: "POST",
      body: {
        artifactId: planned.artifactId,
        permission: permission("artifact:read"),
        artifactManifest: planned,
      },
    })

    expect(blockedDownload.ok).toBe(false)
    expect(blockedDownload.httpStatus).toBe(400)
    expect(blockedDownload.body.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "artifact-not-rendered", path: "artifactManifest.status" }),
    ]))
    expect(methodBlocked).toMatchObject({
      ok: false,
      method: "POST",
      allowedMethods: ["GET"],
      httpStatus: 405,
      body: {
        action: "artifact.status",
        result: null,
        artifact: null,
        bytes: null,
      },
    })
  })

  it("keeps artifact route contracts independent from servers, storage, renderers, auth, and streaming", () => {
    const source = readFileSync(new URL("../src/generation/artifactApiRoute.ts", import.meta.url), "utf8")

    expect(source).toContain("createVNextArtifactManifestPlan")
    expect(source).toContain("checked: false")
    expect(source).toContain("storage: {")
    expect(source).toContain("renderer: {")
    expect(source).not.toMatch(/node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/node:fs|writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toContain("ReadableStream")
    expect(source).not.toContain("createVNextPdfRendererAdapterPlan")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
  })

  it("documents Phase 138 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/ARTIFACT_API_ROUTE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 138 backend artifact route contract boundary.")
    expect(boundaryDoc).toContain("src/generation/artifactApiRoute.ts")
    expect(boundaryDoc).toContain("Permission context is required but not executed")
    expect(readme).toContain("Artifact API route boundary")
    expect(readme).toContain("docs/ARTIFACT_API_ROUTE_BOUNDARY.md")
    expect(ledger).toContain("| 138 | Backend artifact route contract boundary | done |")
    expect(roadmap).toContain("## Phase 138: Backend Artifact Route Contract Boundary")
  })
})
