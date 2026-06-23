import {
  assessVNextGenerationReadiness,
  type VNextGenerationReadinessResult,
  type VNextGenerationRuntimeIssue,
} from "./runtime.js"

export const VNEXT_GENERATION_API_ROUTE_SOURCE = "vnext-generation-api-route"
export const VNEXT_GENERATION_API_ROUTE_MODE = "readiness-route"
export const VNEXT_GENERATION_API_ROUTE_ACTION = "generation.assess"

export type VNextGenerationApiRouteMethod = "POST"
export type VNextGenerationApiRouteHttpStatus = 200 | 400 | 405

export interface VNextGenerationApiRouteRequest {
  method?: string
  body?: unknown
}

export interface VNextGenerationApiRouteResponseBody {
  source: typeof VNEXT_GENERATION_API_ROUTE_SOURCE
  mode: typeof VNEXT_GENERATION_API_ROUTE_MODE
  action: typeof VNEXT_GENERATION_API_ROUTE_ACTION
  result: VNextGenerationReadinessResult | null
  artifact: null
  generatedDocument: null
  issues: VNextGenerationRuntimeIssue[]
}

export interface VNextGenerationApiRouteResponse {
  ok: boolean
  source: typeof VNEXT_GENERATION_API_ROUTE_SOURCE
  mode: typeof VNEXT_GENERATION_API_ROUTE_MODE
  action: typeof VNEXT_GENERATION_API_ROUTE_ACTION
  method: string
  allowedMethods: VNextGenerationApiRouteMethod[]
  httpStatus: VNextGenerationApiRouteHttpStatus
  headers: Record<string, string>
  body: VNextGenerationApiRouteResponseBody
}

const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
}

function normalizeMethod(method: string | undefined): string {
  return (method || "POST").trim().toUpperCase()
}

function methodNotAllowedIssue(method: string): VNextGenerationRuntimeIssue {
  return {
    severity: "error",
    category: "request",
    code: "method-not-allowed",
    path: "method",
    message: `generation readiness route accepts POST, received ${method}`,
  }
}

function response(
  input: {
    body: VNextGenerationApiRouteResponseBody
    httpStatus: VNextGenerationApiRouteHttpStatus
    method: string
    ok: boolean
  },
): VNextGenerationApiRouteResponse {
  const allow = "POST"
  return {
    ok: input.ok,
    source: VNEXT_GENERATION_API_ROUTE_SOURCE,
    mode: VNEXT_GENERATION_API_ROUTE_MODE,
    action: VNEXT_GENERATION_API_ROUTE_ACTION,
    method: input.method,
    allowedMethods: ["POST"],
    httpStatus: input.httpStatus,
    headers: {
      ...JSON_HEADERS,
      allow,
    },
    body: input.body,
  }
}

export function createVNextGenerationApiRouteResponse(
  request: VNextGenerationApiRouteRequest,
): VNextGenerationApiRouteResponse {
  const method = normalizeMethod(request.method)

  if (method !== "POST") {
    const issues = [methodNotAllowedIssue(method)]
    return response({
      ok: false,
      method,
      httpStatus: 405,
      body: {
        source: VNEXT_GENERATION_API_ROUTE_SOURCE,
        mode: VNEXT_GENERATION_API_ROUTE_MODE,
        action: VNEXT_GENERATION_API_ROUTE_ACTION,
        result: null,
        artifact: null,
        generatedDocument: null,
        issues,
      },
    })
  }

  const result = assessVNextGenerationReadiness(request.body)
  return response({
    ok: result.ok,
    method,
    httpStatus: result.ok ? 200 : 400,
    body: {
      source: VNEXT_GENERATION_API_ROUTE_SOURCE,
      mode: VNEXT_GENERATION_API_ROUTE_MODE,
      action: VNEXT_GENERATION_API_ROUTE_ACTION,
      result,
      artifact: null,
      generatedDocument: null,
      issues: result.issues,
    },
  })
}
