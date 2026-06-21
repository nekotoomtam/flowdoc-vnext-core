import { z } from "zod"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import {
  DataSnapshotSchema,
  type DataSnapshot,
  type FlowDocPackageParseIssue,
  type FlowDocPackageParseReason,
  type FlowDocPackageV2DocumentVNext,
  safeParseFlowDocPackageV2DocumentVNext,
  serializeFlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import {
  assessVNextKeyDataDiagnostics,
  type VNextKeyDataDiagnostics,
  type VNextKeyDataDiagnosticsStatus,
  type VNextKeyDataIssue,
} from "../binding/keyDataDiagnostics.js"
import { DocumentAssertionError } from "../errors.js"

export type VNextGenerationOutputKind = "diagnostics" | "preview" | "pdf" | "docx"

export type VNextGenerationRuntimeStatus = "ready" | "ready-with-warnings" | "blocked"

export type VNextGenerationRuntimeIssueCategory =
  | "request"
  | "package"
  | "document"
  | "key-data"
  | "layout"
  | "artifact"

export type VNextGenerationRuntimeFailureReason =
  | "invalid-request"
  | FlowDocPackageParseReason
  | "invalid-document"

export interface VNextGenerationRuntimeIssue {
  severity: "error" | "warning"
  category: VNextGenerationRuntimeIssueCategory
  code: string
  path: string
  message: string
}

export interface VNextGenerationOutputRequest {
  kind: VNextGenerationOutputKind
  measurementProfileId?: string
}

export interface VNextGenerationRequest {
  requestId?: string
  idempotencyKey?: string
  template: {
    kind: "inline-package"
    package: FlowDocPackageV2DocumentVNext
  }
  data?: DataSnapshot
  output: VNextGenerationOutputRequest
}

export type VNextGenerationRequestParseResult =
  | { ok: true; request: VNextGenerationRequest; issues: [] }
  | {
      ok: false
      reason: VNextGenerationRuntimeFailureReason
      issues: VNextGenerationRuntimeIssue[]
    }

export interface VNextGenerationTemplateMetadata {
  id: string | null
  packageVersion: 2 | null
  documentVersion: 3 | null
  title: string | null
  fieldCount: number
}

export interface VNextGenerationRequestMetadata {
  requestId?: string
  idempotencyKey?: string
  outputKind: VNextGenerationOutputKind | null
  measurementProfileId?: string
  dataSource: "request" | "package" | "none"
}

export interface VNextGenerationReadinessDiagnostics {
  request: {
    status: VNextGenerationRuntimeStatus
    issues: VNextGenerationRuntimeIssue[]
  }
  package: {
    status: VNextGenerationRuntimeStatus
    issues: VNextGenerationRuntimeIssue[]
  }
  document: {
    status: VNextGenerationRuntimeStatus
    graphIssueCount: number
    issues: VNextGenerationRuntimeIssue[]
  }
  keyData: VNextKeyDataDiagnostics | null
  exactLayout: {
    status: "not-run"
    reason: "readiness-only"
    finalTruth: "measured-pagination"
  }
  artifact: {
    status: "not-rendered"
    reason: "readiness-only"
    requestedKind: VNextGenerationOutputKind | null
  }
}

export type VNextGenerationReadinessResult =
  | {
      ok: true
      source: "vnext-generation-runtime"
      mode: "readiness-only"
      status: VNextGenerationRuntimeStatus
      request: VNextGenerationRequestMetadata
      template: VNextGenerationTemplateMetadata
      diagnostics: VNextGenerationReadinessDiagnostics
      artifact: null
      generatedDocument: null
      issues: VNextGenerationRuntimeIssue[]
    }
  | {
      ok: false
      source: "vnext-generation-runtime"
      mode: "readiness-only"
      status: "blocked"
      reason: VNextGenerationRuntimeFailureReason
      request: VNextGenerationRequestMetadata
      template: VNextGenerationTemplateMetadata
      diagnostics: VNextGenerationReadinessDiagnostics
      artifact: null
      generatedDocument: null
      issues: VNextGenerationRuntimeIssue[]
    }

const GenerationOutputSchema = z.object({
  kind: z.enum(["diagnostics", "preview", "pdf", "docx"]),
  measurementProfileId: z.string().min(1).optional(),
})

const GenerationRequestSchema = z.object({
  requestId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).optional(),
  template: z.object({
    package: z.unknown(),
  }),
  data: DataSnapshotSchema.optional(),
  output: GenerationOutputSchema.default({ kind: "diagnostics" }),
})

type RawGenerationRequest = z.infer<typeof GenerationRequestSchema>

function formatIssuePath(path: readonly unknown[]): string {
  if (path.length === 0) return ""

  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function requestIssue(issue: z.core.$ZodIssue): VNextGenerationRuntimeIssue {
  return {
    severity: "error",
    category: "request",
    code: issue.code,
    path: formatIssuePath(issue.path),
    message: issue.message,
  }
}

function packageIssue(issue: FlowDocPackageParseIssue): VNextGenerationRuntimeIssue {
  return {
    severity: "error",
    category: "package",
    code: issue.code,
    path: `template.package${issue.path === "" ? "" : `.${issue.path}`}`,
    message: issue.message,
  }
}

function keyDataIssue(issue: VNextKeyDataIssue): VNextGenerationRuntimeIssue {
  return {
    severity: issue.severity,
    category: "key-data",
    code: issue.code,
    path: issue.path,
    message: issue.message,
  }
}

function documentIssuesFromError(error: unknown): VNextGenerationRuntimeIssue[] {
  if (error instanceof DocumentAssertionError) {
    return error.issues.map((issue) => ({
      severity: "error",
      category: "document",
      code: "document-graph-invalid",
      path: issue.path,
      message: issue.message,
    }))
  }

  return [{
    severity: "error",
    category: "document",
    code: "document-graph-invalid",
    path: "template.package.document",
    message: error instanceof Error ? error.message : "document graph validation failed",
  }]
}

function statusFromIssues(issues: readonly VNextGenerationRuntimeIssue[]): VNextGenerationRuntimeStatus {
  if (issues.some((issue) => issue.severity === "error")) return "blocked"
  if (issues.some((issue) => issue.severity === "warning")) return "ready-with-warnings"
  return "ready"
}

function statusFromKeyData(status: VNextKeyDataDiagnosticsStatus): VNextGenerationRuntimeStatus {
  return status
}

function nullTemplateMetadata(): VNextGenerationTemplateMetadata {
  return {
    id: null,
    packageVersion: null,
    documentVersion: null,
    title: null,
    fieldCount: 0,
  }
}

function templateMetadata(pack: FlowDocPackageV2DocumentVNext): VNextGenerationTemplateMetadata {
  return {
    id: pack.id,
    packageVersion: pack.packageVersion,
    documentVersion: pack.document.version,
    title: pack.meta.title,
    fieldCount: Object.keys(pack.fields.fields).length,
  }
}

function requestMetadata(
  request: VNextGenerationRequest | null,
  raw: RawGenerationRequest | null,
  dataSource: VNextGenerationRequestMetadata["dataSource"] = "none",
): VNextGenerationRequestMetadata {
  const output = request?.output ?? raw?.output
  const requestId = request?.requestId ?? raw?.requestId
  const idempotencyKey = request?.idempotencyKey ?? raw?.idempotencyKey

  return {
    ...(requestId == null ? {} : { requestId }),
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    outputKind: output?.kind ?? null,
    ...(output?.measurementProfileId == null ? {} : { measurementProfileId: output.measurementProfileId }),
    dataSource,
  }
}

function emptyDiagnostics(
  requestedKind: VNextGenerationOutputKind | null,
  requestIssues: VNextGenerationRuntimeIssue[] = [],
  packageIssues: VNextGenerationRuntimeIssue[] = [],
  documentIssues: VNextGenerationRuntimeIssue[] = [],
): VNextGenerationReadinessDiagnostics {
  return {
    request: {
      status: statusFromIssues(requestIssues),
      issues: requestIssues,
    },
    package: {
      status: statusFromIssues(packageIssues),
      issues: packageIssues,
    },
    document: {
      status: statusFromIssues(documentIssues),
      graphIssueCount: documentIssues.length,
      issues: documentIssues,
    },
    keyData: null,
    exactLayout: {
      status: "not-run",
      reason: "readiness-only",
      finalTruth: "measured-pagination",
    },
    artifact: {
      status: "not-rendered",
      reason: "readiness-only",
      requestedKind,
    },
  }
}

function parseRequestShape(value: unknown): { ok: true; request: RawGenerationRequest } | {
  ok: false
  issues: VNextGenerationRuntimeIssue[]
} {
  const parsed = GenerationRequestSchema.safeParse(value)

  if (parsed.success) {
    return { ok: true, request: parsed.data }
  }

  return {
    ok: false,
    issues: parsed.error.issues.map(requestIssue),
  }
}

export function safeParseVNextGenerationRequest(value: unknown): VNextGenerationRequestParseResult {
  const raw = parseRequestShape(value)

  if (!raw.ok) {
    return {
      ok: false,
      reason: "invalid-request",
      issues: raw.issues,
    }
  }

  const parsedPackage = safeParseFlowDocPackageV2DocumentVNext(raw.request.template.package)
  if (!parsedPackage.ok) {
    return {
      ok: false,
      reason: parsedPackage.reason,
      issues: parsedPackage.issues.map(packageIssue),
    }
  }

  const pack = serializeFlowDocPackageV2DocumentVNext(parsedPackage.package)

  return {
    ok: true,
    request: {
      ...(raw.request.requestId == null ? {} : { requestId: raw.request.requestId }),
      ...(raw.request.idempotencyKey == null ? {} : { idempotencyKey: raw.request.idempotencyKey }),
      template: {
        kind: "inline-package",
        package: pack,
      },
      ...(raw.request.data == null ? {} : { data: raw.request.data }),
      output: raw.request.output,
    },
    issues: [],
  }
}

export function assessVNextGenerationReadiness(value: unknown): VNextGenerationReadinessResult {
  const raw = parseRequestShape(value)

  if (!raw.ok) {
    const diagnostics = emptyDiagnostics(null, raw.issues)
    return {
      ok: false,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "blocked",
      reason: "invalid-request",
      request: requestMetadata(null, null),
      template: nullTemplateMetadata(),
      diagnostics,
      artifact: null,
      generatedDocument: null,
      issues: raw.issues,
    }
  }

  const parsedPackage = safeParseFlowDocPackageV2DocumentVNext(raw.request.template.package)
  if (!parsedPackage.ok) {
    const issues = parsedPackage.issues.map(packageIssue)
    const diagnostics = emptyDiagnostics(raw.request.output.kind, [], issues)

    return {
      ok: false,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "blocked",
      reason: parsedPackage.reason,
      request: requestMetadata(null, raw.request),
      template: nullTemplateMetadata(),
      diagnostics,
      artifact: null,
      generatedDocument: null,
      issues,
    }
  }

  const pack = serializeFlowDocPackageV2DocumentVNext(parsedPackage.package)

  try {
    const graph = buildRelationshipGraph(pack.document)
    const data = raw.request.data ?? pack.data
    const dataSource: VNextGenerationRequestMetadata["dataSource"] =
      raw.request.data != null ? "request" : pack.data != null ? "package" : "none"
    const keyData = assessVNextKeyDataDiagnostics(pack.document, pack.fields, data)
    const keyDataIssues = keyData.issues.map(keyDataIssue)
    const status = statusFromKeyData(keyData.status)
    const diagnostics: VNextGenerationReadinessDiagnostics = {
      request: {
        status: "ready",
        issues: [],
      },
      package: {
        status: "ready",
        issues: [],
      },
      document: {
        status: "ready",
        graphIssueCount: graph.diagnostics.issues.length,
        issues: [],
      },
      keyData,
      exactLayout: {
        status: "not-run",
        reason: "readiness-only",
        finalTruth: "measured-pagination",
      },
      artifact: {
        status: "not-rendered",
        reason: "readiness-only",
        requestedKind: raw.request.output.kind,
      },
    }

    return {
      ok: true,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status,
      request: requestMetadata(null, raw.request, dataSource),
      template: templateMetadata(pack),
      diagnostics,
      artifact: null,
      generatedDocument: null,
      issues: keyDataIssues,
    }
  } catch (error) {
    const issues = documentIssuesFromError(error)
    const diagnostics = emptyDiagnostics(raw.request.output.kind, [], [], issues)

    return {
      ok: false,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "blocked",
      reason: "invalid-document",
      request: requestMetadata(null, raw.request),
      template: templateMetadata(pack),
      diagnostics,
      artifact: null,
      generatedDocument: null,
      issues,
    }
  }
}
