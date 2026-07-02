import {
  createVNextArtifactManifestPlan,
  type VNextArtifactManifestIssue,
  type VNextArtifactManifestRecord,
  type VNextArtifactManifestStatus,
} from "./artifactManifest.js"

// Route de-export Window B: this module is kept as a public compatibility
// export for one window. Backend route ownership now lives in
// flowdoc-vnext-backend/src/routes/artifactRoute.ts.

/**
 * @deprecated Window B compatibility export. Backend owns artifact route
 * transport/status/header/permission envelopes. Core retains
 * `src/generation/artifactManifest.ts` and `src/generation/artifactJob.ts`.
 */
export const VNEXT_ARTIFACT_API_ROUTE_SOURCE = "vnext-artifact-api-route"
/**
 * @deprecated Window B compatibility export. Use backend route parity for
 * route envelopes and retained core artifact manifest/job contracts for
 * durable artifact truth.
 */
export const VNEXT_ARTIFACT_API_ROUTE_MODE = "artifact-route-contract"

export type VNextArtifactApiRouteAction =
  | "artifact.request"
  | "artifact.status"
  | "artifact.listSession"
  | "artifact.downloadMetadata"

export type VNextArtifactApiRouteMethod = "GET" | "POST"
export type VNextArtifactApiRouteHttpStatus = 200 | 202 | 400 | 405
export type VNextArtifactApiPermissionScope =
  | "artifact:generate"
  | "artifact:read"
  | "artifact:list"
  | "artifact:download"

export interface VNextArtifactApiRouteRequest {
  method?: string
  body?: unknown
}

export interface VNextArtifactApiPermissionContext {
  principalId: string
  tenantId: string | null
  scope: VNextArtifactApiPermissionScope
  checked: false
}

export interface VNextArtifactApiRouteIssue {
  severity: "error"
  category: "request" | "permission" | "artifact"
  code: string
  path: string
  message: string
}

export interface VNextArtifactApiRetryPolicy {
  safe: true
  idempotencyKey: string | null
  retryAfterMs: number | null
}

export interface VNextArtifactApiRouteResult {
  action: VNextArtifactApiRouteAction
  status: "accepted" | "ready" | "blocked"
  requestId: string | null
  idempotencyKey: string | null
  permission: {
    required: true
    checked: false
    context: VNextArtifactApiPermissionContext
  }
  retry: VNextArtifactApiRetryPolicy
  artifactStatus: VNextArtifactManifestStatus | "not-created"
  job: {
    status: "not-created"
    reason: "route-contract-only"
  }
  storage: {
    reads: false
    writes: false
    reason: "route-contract-only"
  }
  renderer: {
    execution: false
  }
}

export interface VNextArtifactDownloadMetadata {
  artifactId: string
  format: VNextArtifactManifestRecord["format"]
  mediaType: string
  byteLength: number
  sha256: string
  storageKey: string
  url: null
  bytes: null
  status: "metadata-only"
}

export interface VNextArtifactApiRouteResponseBody {
  source: typeof VNEXT_ARTIFACT_API_ROUTE_SOURCE
  mode: typeof VNEXT_ARTIFACT_API_ROUTE_MODE
  action: VNextArtifactApiRouteAction
  result: VNextArtifactApiRouteResult | null
  artifact: VNextArtifactManifestRecord | null
  artifacts: VNextArtifactManifestRecord[]
  download: VNextArtifactDownloadMetadata | null
  bytes: null
  issues: VNextArtifactApiRouteIssue[]
}

export interface VNextArtifactApiRouteResponse {
  ok: boolean
  source: typeof VNEXT_ARTIFACT_API_ROUTE_SOURCE
  mode: typeof VNEXT_ARTIFACT_API_ROUTE_MODE
  action: VNextArtifactApiRouteAction
  method: string
  allowedMethods: VNextArtifactApiRouteMethod[]
  httpStatus: VNextArtifactApiRouteHttpStatus
  headers: Record<string, string>
  body: VNextArtifactApiRouteResponseBody
}

const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
}

function normalizeMethod(method: string | undefined, fallback: VNextArtifactApiRouteMethod): string {
  return (method || fallback).trim().toUpperCase()
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function issue(
  category: VNextArtifactApiRouteIssue["category"],
  code: string,
  path: string,
  message: string,
): VNextArtifactApiRouteIssue {
  return {
    severity: "error",
    category,
    code,
    path,
    message,
  }
}

function methodNotAllowedIssue(method: string, allowed: readonly VNextArtifactApiRouteMethod[]): VNextArtifactApiRouteIssue {
  return issue("request", "method-not-allowed", "method", `artifact route accepts ${allowed.join(", ")}, received ${method}`)
}

function nonEmptyString(
  input: Record<string, unknown>,
  path: string,
  issues: VNextArtifactApiRouteIssue[],
  category: VNextArtifactApiRouteIssue["category"] = "request",
): string | null {
  const value = input[path]
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue(category, "invalid-string", path, `${path} must be a non-empty string`))
  return null
}

function optionalString(input: Record<string, unknown>, path: string): string | null {
  const value = input[path]
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

function parseBody(value: unknown, issues: VNextArtifactApiRouteIssue[]): Record<string, unknown> | null {
  if (isPlainObject(value)) return value

  issues.push(issue("request", "invalid-body", "body", "request body must be an object"))
  return null
}

function parsePermission(
  body: Record<string, unknown>,
  requiredScope: VNextArtifactApiPermissionScope,
  issues: VNextArtifactApiRouteIssue[],
): VNextArtifactApiPermissionContext | null {
  const value = body.permission
  if (!isPlainObject(value)) {
    issues.push(issue("permission", "missing-permission", "permission", "permission context is required but not executed by core"))
    return null
  }

  const principalId = nonEmptyString(value, "principalId", issues, "permission")
  const tenantId = value.tenantId == null ? null : nonEmptyString(value, "tenantId", issues, "permission")
  const scope = value.scope
  if (scope !== requiredScope) {
    issues.push(issue("permission", "invalid-permission-scope", "permission.scope", `permission scope must be ${requiredScope}`))
  }

  if (principalId == null || (value.tenantId != null && tenantId == null) || scope !== requiredScope) {
    return null
  }

  return {
    principalId,
    tenantId,
    scope: requiredScope,
    checked: false,
  }
}

function routeResponse(input: {
  action: VNextArtifactApiRouteAction
  method: string
  allowedMethods: VNextArtifactApiRouteMethod[]
  httpStatus: VNextArtifactApiRouteHttpStatus
  ok: boolean
  body: VNextArtifactApiRouteResponseBody
}): VNextArtifactApiRouteResponse {
  return {
    ok: input.ok,
    source: VNEXT_ARTIFACT_API_ROUTE_SOURCE,
    mode: VNEXT_ARTIFACT_API_ROUTE_MODE,
    action: input.action,
    method: input.method,
    allowedMethods: input.allowedMethods,
    httpStatus: input.httpStatus,
    headers: {
      ...JSON_HEADERS,
      allow: input.allowedMethods.join(", "),
    },
    body: input.body,
  }
}

function emptyBody(
  action: VNextArtifactApiRouteAction,
  issues: VNextArtifactApiRouteIssue[] = [],
): VNextArtifactApiRouteResponseBody {
  return {
    source: VNEXT_ARTIFACT_API_ROUTE_SOURCE,
    mode: VNEXT_ARTIFACT_API_ROUTE_MODE,
    action,
    result: null,
    artifact: null,
    artifacts: [],
    download: null,
    bytes: null,
    issues,
  }
}

function blockedResponse(
  action: VNextArtifactApiRouteAction,
  method: string,
  allowedMethods: VNextArtifactApiRouteMethod[],
  issues: VNextArtifactApiRouteIssue[],
  httpStatus: VNextArtifactApiRouteHttpStatus = 400,
): VNextArtifactApiRouteResponse {
  return routeResponse({
    action,
    method,
    allowedMethods,
    httpStatus,
    ok: false,
    body: emptyBody(action, issues),
  })
}

function result(input: {
  action: VNextArtifactApiRouteAction
  status: VNextArtifactApiRouteResult["status"]
  requestId: string | null
  idempotencyKey: string | null
  permission: VNextArtifactApiPermissionContext
  artifactStatus: VNextArtifactApiRouteResult["artifactStatus"]
  retryAfterMs: number | null
}): VNextArtifactApiRouteResult {
  return {
    action: input.action,
    status: input.status,
    requestId: input.requestId,
    idempotencyKey: input.idempotencyKey,
    permission: {
      required: true,
      checked: false,
      context: input.permission,
    },
    retry: {
      safe: true,
      idempotencyKey: input.idempotencyKey,
      retryAfterMs: input.retryAfterMs,
    },
    artifactStatus: input.artifactStatus,
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
  }
}

function routeIssuesFromManifest(
  manifestIssues: readonly VNextArtifactManifestIssue[],
  pathPrefix: string,
): VNextArtifactApiRouteIssue[] {
  return manifestIssues.map((manifestIssue) => issue(
    "artifact",
    manifestIssue.code,
    `${pathPrefix}.${manifestIssue.path}`,
    manifestIssue.message,
  ))
}

function parseManifest(
  value: unknown,
  path: string,
  issues: VNextArtifactApiRouteIssue[],
): VNextArtifactManifestRecord | null {
  const plan = createVNextArtifactManifestPlan(value)
  if (plan.status === "ready" && plan.record != null) return plan.record

  issues.push(...routeIssuesFromManifest(plan.issues, path))
  return null
}

function retryAfterForStatus(status: VNextArtifactManifestStatus): number | null {
  return status === "planned" || status === "rendering" ? 1000 : null
}

/**
 * @deprecated Window B compatibility export. Use
 * `flowdoc-vnext-backend/src/routes/artifactRoute.ts` for route responses and
 * `createVNextArtifactManifestPlan(...)` for retained core manifest behavior.
 * This helper remains only until the route de-export removal patch.
 */
export function createVNextArtifactGenerationApiRouteResponse(
  request: VNextArtifactApiRouteRequest,
): VNextArtifactApiRouteResponse {
  const action = "artifact.request"
  const method = normalizeMethod(request.method, "POST")
  const allowedMethods: VNextArtifactApiRouteMethod[] = ["POST"]

  if (method !== "POST") {
    return blockedResponse(action, method, allowedMethods, [methodNotAllowedIssue(method, allowedMethods)], 405)
  }

  const issues: VNextArtifactApiRouteIssue[] = []
  const body = parseBody(request.body, issues)
  if (body == null) return blockedResponse(action, method, allowedMethods, issues)

  const idempotencyKey = nonEmptyString(body, "idempotencyKey", issues)
  const requestId = optionalString(body, "requestId")
  const permission = parsePermission(body, "artifact:generate", issues)
  const artifactInput = isPlainObject(body.artifact) ? body.artifact : null
  if (artifactInput == null) {
    issues.push(issue("artifact", "missing-artifact", "artifact", "artifact request payload is required"))
  }

  const manifest = artifactInput == null ? null : parseManifest({
    ...artifactInput,
    byteLength: null,
    sha256: null,
    storageKey: null,
    status: "planned",
    error: null,
  }, "artifact", issues)

  if (issues.length > 0 || idempotencyKey == null || permission == null || manifest == null) {
    return blockedResponse(action, method, allowedMethods, issues)
  }

  return routeResponse({
    action,
    method,
    allowedMethods,
    httpStatus: 202,
    ok: true,
    body: {
      ...emptyBody(action),
      result: result({
        action,
        status: "accepted",
        requestId,
        idempotencyKey,
        permission,
        artifactStatus: "planned",
        retryAfterMs: 1000,
      }),
      artifact: manifest,
    },
  })
}

/**
 * @deprecated Window B compatibility export. Use backend artifact route parity
 * for route status responses and retained core manifest/job contracts for
 * artifact state truth.
 */
export function createVNextArtifactStatusApiRouteResponse(
  request: VNextArtifactApiRouteRequest,
): VNextArtifactApiRouteResponse {
  const action = "artifact.status"
  const method = normalizeMethod(request.method, "GET")
  const allowedMethods: VNextArtifactApiRouteMethod[] = ["GET"]

  if (method !== "GET") {
    return blockedResponse(action, method, allowedMethods, [methodNotAllowedIssue(method, allowedMethods)], 405)
  }

  const issues: VNextArtifactApiRouteIssue[] = []
  const body = parseBody(request.body, issues)
  if (body == null) return blockedResponse(action, method, allowedMethods, issues)

  const artifactId = nonEmptyString(body, "artifactId", issues)
  const requestId = optionalString(body, "requestId")
  const permission = parsePermission(body, "artifact:read", issues)
  const manifest = parseManifest(body.artifactManifest, "artifactManifest", issues)

  if (manifest != null && artifactId != null && manifest.artifactId !== artifactId) {
    issues.push(issue("artifact", "artifact-id-mismatch", "artifactManifest.artifactId", "artifact manifest id must match artifactId"))
  }

  if (issues.length > 0 || permission == null || manifest == null) {
    return blockedResponse(action, method, allowedMethods, issues)
  }

  return routeResponse({
    action,
    method,
    allowedMethods,
    httpStatus: 200,
    ok: true,
    body: {
      ...emptyBody(action),
      result: result({
        action,
        status: "ready",
        requestId,
        idempotencyKey: null,
        permission,
        artifactStatus: manifest.status,
        retryAfterMs: retryAfterForStatus(manifest.status),
      }),
      artifact: manifest,
    },
  })
}

/**
 * @deprecated Window B compatibility export. Use backend artifact route parity
 * for session artifact listing and retained core manifest contracts for
 * artifact records.
 */
export function createVNextSessionArtifactListApiRouteResponse(
  request: VNextArtifactApiRouteRequest,
): VNextArtifactApiRouteResponse {
  const action = "artifact.listSession"
  const method = normalizeMethod(request.method, "GET")
  const allowedMethods: VNextArtifactApiRouteMethod[] = ["GET"]

  if (method !== "GET") {
    return blockedResponse(action, method, allowedMethods, [methodNotAllowedIssue(method, allowedMethods)], 405)
  }

  const issues: VNextArtifactApiRouteIssue[] = []
  const body = parseBody(request.body, issues)
  if (body == null) return blockedResponse(action, method, allowedMethods, issues)

  const sessionId = nonEmptyString(body, "sessionId", issues)
  const requestId = optionalString(body, "requestId")
  const permission = parsePermission(body, "artifact:list", issues)
  const artifactsValue = body.artifacts
  const artifacts: VNextArtifactManifestRecord[] = []

  if (!Array.isArray(artifactsValue)) {
    issues.push(issue("artifact", "invalid-artifacts", "artifacts", "artifacts must be an array supplied by the caller"))
  } else {
    artifactsValue.forEach((artifact, index) => {
      const manifest = parseManifest(artifact, `artifacts[${index}]`, issues)
      if (manifest != null && manifest.sessionId === sessionId) artifacts.push(manifest)
    })
  }

  if (issues.length > 0 || sessionId == null || permission == null) {
    return blockedResponse(action, method, allowedMethods, issues)
  }

  return routeResponse({
    action,
    method,
    allowedMethods,
    httpStatus: 200,
    ok: true,
    body: {
      ...emptyBody(action),
      result: result({
        action,
        status: "ready",
        requestId,
        idempotencyKey: null,
        permission,
        artifactStatus: artifacts.length === 0 ? "not-created" : artifacts[0].status,
        retryAfterMs: artifacts.some((artifact) => retryAfterForStatus(artifact.status) != null) ? 1000 : null,
      }),
      artifacts,
    },
  })
}

/**
 * @deprecated Window B compatibility export. Use backend artifact route parity
 * for download metadata envelopes and retained core manifest contracts for
 * rendered artifact validation.
 */
export function createVNextArtifactDownloadMetadataApiRouteResponse(
  request: VNextArtifactApiRouteRequest,
): VNextArtifactApiRouteResponse {
  const action = "artifact.downloadMetadata"
  const method = normalizeMethod(request.method, "GET")
  const allowedMethods: VNextArtifactApiRouteMethod[] = ["GET"]

  if (method !== "GET") {
    return blockedResponse(action, method, allowedMethods, [methodNotAllowedIssue(method, allowedMethods)], 405)
  }

  const issues: VNextArtifactApiRouteIssue[] = []
  const body = parseBody(request.body, issues)
  if (body == null) return blockedResponse(action, method, allowedMethods, issues)

  const artifactId = nonEmptyString(body, "artifactId", issues)
  const requestId = optionalString(body, "requestId")
  const permission = parsePermission(body, "artifact:download", issues)
  const manifest = parseManifest(body.artifactManifest, "artifactManifest", issues)

  if (manifest != null && artifactId != null && manifest.artifactId !== artifactId) {
    issues.push(issue("artifact", "artifact-id-mismatch", "artifactManifest.artifactId", "artifact manifest id must match artifactId"))
  }

  if (manifest != null && manifest.status !== "rendered") {
    issues.push(issue("artifact", "artifact-not-rendered", "artifactManifest.status", "download metadata requires a rendered artifact manifest"))
  }

  if (issues.length > 0 || permission == null || manifest == null) {
    return blockedResponse(action, method, allowedMethods, issues)
  }

  return routeResponse({
    action,
    method,
    allowedMethods,
    httpStatus: 200,
    ok: true,
    body: {
      ...emptyBody(action),
      result: result({
        action,
        status: "ready",
        requestId,
        idempotencyKey: null,
        permission,
        artifactStatus: manifest.status,
        retryAfterMs: null,
      }),
      artifact: manifest,
      download: {
        artifactId: manifest.artifactId,
        format: manifest.format,
        mediaType: manifest.mediaType,
        byteLength: manifest.byteLength!,
        sha256: manifest.sha256!,
        storageKey: manifest.storageKey!,
        url: null,
        bytes: null,
        status: "metadata-only",
      },
    },
  })
}
