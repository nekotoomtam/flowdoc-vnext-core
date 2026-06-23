export const VNEXT_ARTIFACT_MANIFEST_SOURCE = "vnext-artifact-manifest"
export const VNEXT_ARTIFACT_MANIFEST_MODE = "artifact-storage-record-boundary"
export const VNEXT_ARTIFACT_MANIFEST_VERSION = 1
export const VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_CODE_LENGTH = 80
export const VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_MESSAGE_LENGTH = 240

export type VNextArtifactManifestStatus =
  | "planned"
  | "rendering"
  | "rendered"
  | "failed"
  | "expired"
  | "deleted"

export type VNextArtifactManifestFormat =
  | "pdf"
  | "docx"
  | "preview"
  | "diagnostics"
  | "custom"

export interface VNextArtifactManifestErrorSummary {
  code: string
  message: string
  retryable: boolean
}

export interface VNextArtifactManifestRecord {
  manifestVersion: typeof VNEXT_ARTIFACT_MANIFEST_VERSION
  artifactId: string
  sourcePackageId: string | null
  sessionId: string | null
  jobId: string | null
  rendererProfileId: string
  measurementProfileId: string
  format: VNextArtifactManifestFormat
  mediaType: string
  byteLength: number | null
  sha256: string | null
  storageKey: string | null
  storageStatus: "not-written"
  createdAt: string
  status: VNextArtifactManifestStatus
  error: VNextArtifactManifestErrorSummary | null
}

export interface VNextArtifactManifestIssue {
  severity: "error"
  code: string
  path: string
  message: string
}

export interface VNextArtifactManifestPlan {
  source: typeof VNEXT_ARTIFACT_MANIFEST_SOURCE
  mode: typeof VNEXT_ARTIFACT_MANIFEST_MODE
  status: "ready" | "blocked"
  record: VNextArtifactManifestRecord | null
  issues: VNextArtifactManifestIssue[]
  contracts: {
    jsonSerializable: true
    fileWrites: false
    storageWrites: false
    databaseWrites: false
    rendererExecution: false
    backendRoute: false
  }
}

const ARTIFACT_STATUSES = new Set<VNextArtifactManifestStatus>([
  "planned",
  "rendering",
  "rendered",
  "failed",
  "expired",
  "deleted",
])

const ARTIFACT_FORMATS = new Set<VNextArtifactManifestFormat>([
  "pdf",
  "docx",
  "preview",
  "diagnostics",
  "custom",
])

const REQUIRED_FIELDS = [
  "artifactId",
  "sourcePackageId",
  "sessionId",
  "jobId",
  "rendererProfileId",
  "measurementProfileId",
  "format",
  "mediaType",
  "byteLength",
  "sha256",
  "storageKey",
  "createdAt",
  "status",
  "error",
] as const

const HEX_SHA256 = /^[a-f0-9]{64}$/

function basePlan(
  status: VNextArtifactManifestPlan["status"],
  record: VNextArtifactManifestRecord | null,
  issues: VNextArtifactManifestIssue[],
): VNextArtifactManifestPlan {
  return {
    source: VNEXT_ARTIFACT_MANIFEST_SOURCE,
    mode: VNEXT_ARTIFACT_MANIFEST_MODE,
    status,
    record,
    issues,
    contracts: {
      jsonSerializable: true,
      fileWrites: false,
      storageWrites: false,
      databaseWrites: false,
      rendererExecution: false,
      backendRoute: false,
    },
  }
}

function issue(code: string, path: string, message: string): VNextArtifactManifestIssue {
  return {
    severity: "error",
    code,
    path,
    message,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function hasOwn(input: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key)
}

function nonEmptyString(
  input: Record<string, unknown>,
  key: string,
  issues: VNextArtifactManifestIssue[],
): string | null {
  const value = input[key]
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue("invalid-string", key, `${key} must be a non-empty string`))
  return null
}

function nullableString(
  input: Record<string, unknown>,
  key: string,
  issues: VNextArtifactManifestIssue[],
): string | null {
  const value = input[key]
  if (value === null) return null
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue("invalid-nullable-string", key, `${key} must be null or a non-empty string`))
  return null
}

function nullableByteLength(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): number | null {
  const value = input.byteLength
  if (value === null) return null
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value

  issues.push(issue("invalid-byte-length", "byteLength", "byteLength must be null or a non-negative integer"))
  return null
}

function nullableSha256(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): string | null {
  const value = input.sha256
  if (value === null) return null
  if (typeof value === "string" && HEX_SHA256.test(value)) return value

  issues.push(issue("invalid-sha256", "sha256", "sha256 must be null or a 64 character lowercase hex digest"))
  return null
}

function artifactStatus(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): VNextArtifactManifestStatus | null {
  const value = input.status
  if (typeof value === "string" && ARTIFACT_STATUSES.has(value as VNextArtifactManifestStatus)) {
    return value as VNextArtifactManifestStatus
  }

  issues.push(issue("invalid-status", "status", "status must be planned, rendering, rendered, failed, expired, or deleted"))
  return null
}

function artifactFormat(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): VNextArtifactManifestFormat | null {
  const value = input.format
  if (typeof value === "string" && ARTIFACT_FORMATS.has(value as VNextArtifactManifestFormat)) {
    return value as VNextArtifactManifestFormat
  }

  issues.push(issue("invalid-format", "format", "format must be pdf, docx, preview, diagnostics, or custom"))
  return null
}

function validCreatedAt(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): string | null {
  const value = input.createdAt
  if (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value))) {
    return value
  }

  issues.push(issue("invalid-created-at", "createdAt", "createdAt must be a parseable ISO date string"))
  return null
}

function errorSummary(
  input: Record<string, unknown>,
  issues: VNextArtifactManifestIssue[],
): VNextArtifactManifestErrorSummary | null {
  const value = input.error
  if (value === null) return null

  if (!isPlainObject(value)) {
    issues.push(issue("invalid-error-summary", "error", "error must be null or a bounded error summary"))
    return null
  }

  const code = value.code
  const message = value.message
  const retryable = value.retryable
  if (typeof code !== "string" || code.trim().length === 0) {
    issues.push(issue("invalid-error-code", "error.code", "error.code must be a non-empty string"))
  } else if (code.length > VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_CODE_LENGTH) {
    issues.push(issue("error-code-too-long", "error.code", `error.code must be ${VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_CODE_LENGTH} characters or fewer`))
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    issues.push(issue("invalid-error-message", "error.message", "error.message must be a non-empty string"))
  } else if (message.length > VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_MESSAGE_LENGTH) {
    issues.push(issue("error-message-too-long", "error.message", `error.message must be ${VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_MESSAGE_LENGTH} characters or fewer`))
  }

  if (retryable != null && typeof retryable !== "boolean") {
    issues.push(issue("invalid-error-retryable", "error.retryable", "error.retryable must be a boolean when provided"))
  }

  if (typeof code !== "string" || typeof message !== "string") return null
  if (code.trim().length === 0 || message.trim().length === 0) return null
  if (code.length > VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_CODE_LENGTH) return null
  if (message.length > VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_MESSAGE_LENGTH) return null
  if (retryable != null && typeof retryable !== "boolean") return null

  return {
    code,
    message,
    retryable: retryable ?? false,
  }
}

function validateLifecycle(
  record: VNextArtifactManifestRecord,
  issues: VNextArtifactManifestIssue[],
): void {
  if (record.sourcePackageId == null && record.sessionId == null) {
    issues.push(issue("missing-source-identity", "sourcePackageId", "sourcePackageId or sessionId must be provided"))
  }

  if (record.status === "planned" || record.status === "rendering") {
    if (record.byteLength != null) {
      issues.push(issue("unexpected-byte-length", "byteLength", `${record.status} artifacts must keep byteLength null`))
    }
    if (record.sha256 != null) {
      issues.push(issue("unexpected-sha256", "sha256", `${record.status} artifacts must keep sha256 null`))
    }
    if (record.error != null) {
      issues.push(issue("unexpected-error", "error", `${record.status} artifacts must keep error null`))
    }
  }

  if (record.status === "rendered") {
    if (record.byteLength == null || record.byteLength <= 0) {
      issues.push(issue("missing-rendered-byte-length", "byteLength", "rendered artifacts require a positive byteLength"))
    }
    if (record.sha256 == null) {
      issues.push(issue("missing-rendered-sha256", "sha256", "rendered artifacts require a sha256 digest"))
    }
    if (record.storageKey == null) {
      issues.push(issue("missing-rendered-storage-key", "storageKey", "rendered artifacts require a storageKey record"))
    }
    if (record.error != null) {
      issues.push(issue("unexpected-rendered-error", "error", "rendered artifacts must keep error null"))
    }
  }

  if (record.status === "failed") {
    if (record.error == null) {
      issues.push(issue("missing-failed-error", "error", "failed artifacts require a bounded error summary"))
    }
    if (record.byteLength != null) {
      issues.push(issue("unexpected-failed-byte-length", "byteLength", "failed artifacts must keep byteLength null"))
    }
    if (record.sha256 != null) {
      issues.push(issue("unexpected-failed-sha256", "sha256", "failed artifacts must keep sha256 null"))
    }
  }

  if ((record.status === "expired" || record.status === "deleted") && record.storageKey == null) {
    issues.push(issue("missing-terminal-storage-key", "storageKey", `${record.status} artifacts require the storageKey being retired`))
  }
}

export function createVNextArtifactManifestPlan(input: unknown): VNextArtifactManifestPlan {
  if (!isPlainObject(input)) {
    return basePlan("blocked", null, [
      issue("invalid-record", "record", "artifact manifest input must be an object"),
    ])
  }

  const issues: VNextArtifactManifestIssue[] = []
  for (const field of REQUIRED_FIELDS) {
    if (!hasOwn(input, field)) {
      issues.push(issue("missing-field", field, `${field} must be present; use null when the value is intentionally absent`))
    }
  }

  const artifactId = nonEmptyString(input, "artifactId", issues)
  const sourcePackageId = nullableString(input, "sourcePackageId", issues)
  const sessionId = nullableString(input, "sessionId", issues)
  const jobId = nullableString(input, "jobId", issues)
  const rendererProfileId = nonEmptyString(input, "rendererProfileId", issues)
  const measurementProfileId = nonEmptyString(input, "measurementProfileId", issues)
  const format = artifactFormat(input, issues)
  const mediaType = nonEmptyString(input, "mediaType", issues)
  const byteLength = nullableByteLength(input, issues)
  const sha256 = nullableSha256(input, issues)
  const storageKey = nullableString(input, "storageKey", issues)
  const createdAt = validCreatedAt(input, issues)
  const status = artifactStatus(input, issues)
  const error = errorSummary(input, issues)

  if (
    artifactId == null ||
    rendererProfileId == null ||
    measurementProfileId == null ||
    format == null ||
    mediaType == null ||
    createdAt == null ||
    status == null
  ) {
    return basePlan("blocked", null, issues)
  }

  const record: VNextArtifactManifestRecord = {
    manifestVersion: VNEXT_ARTIFACT_MANIFEST_VERSION,
    artifactId,
    sourcePackageId,
    sessionId,
    jobId,
    rendererProfileId,
    measurementProfileId,
    format,
    mediaType,
    byteLength,
    sha256,
    storageKey,
    storageStatus: "not-written",
    createdAt,
    status,
    error,
  }

  validateLifecycle(record, issues)

  if (issues.length > 0) return basePlan("blocked", null, issues)

  return basePlan("ready", record, [])
}
