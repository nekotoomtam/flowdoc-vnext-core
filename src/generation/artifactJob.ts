import {
  createVNextArtifactManifestPlan,
  VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_CODE_LENGTH,
  VNEXT_ARTIFACT_MANIFEST_MAX_ERROR_MESSAGE_LENGTH,
  type VNextArtifactManifestErrorSummary,
  type VNextArtifactManifestFormat,
  type VNextArtifactManifestIssue,
  type VNextArtifactManifestRecord,
} from "./artifactManifest.js"

export const VNEXT_ARTIFACT_JOB_SOURCE = "vnext-artifact-job"
export const VNEXT_ARTIFACT_JOB_MODE = "durable-layout-artifact-job-boundary"

export type VNextArtifactJobStatus =
  | "queued"
  | "layout-running"
  | "layout-complete"
  | "rendering"
  | "rendered"
  | "failed"
  | "cancelled"

export type VNextArtifactJobAction =
  | "start-layout"
  | "record-layout-progress"
  | "complete-layout"
  | "start-rendering"
  | "complete-render"
  | "fail"
  | "cancel"
  | "retry"

export interface VNextArtifactJobCursor {
  layoutJobOffset: number
  completedSourceItemIds: string[]
}

export interface VNextArtifactJobProgress {
  stage: "queued" | "layout" | "rendering" | "complete" | "failed" | "cancelled"
  completedStepCount: number
  totalStepCount: number | null
  percent: number
}

export interface VNextArtifactJobRecord {
  source: typeof VNEXT_ARTIFACT_JOB_SOURCE
  mode: typeof VNEXT_ARTIFACT_JOB_MODE
  jobId: string
  status: VNextArtifactJobStatus
  input: {
    sourcePackageId: string | null
    sessionId: string | null
  }
  profiles: {
    layoutProfileId: string
    measurementProfileId: string
    rendererProfileId: string
  }
  artifact: {
    artifactId: string
    format: VNextArtifactManifestFormat
    mediaType: string
  }
  cursor: VNextArtifactJobCursor
  progress: VNextArtifactJobProgress
  cancellation: {
    requested: boolean
    reason: string | null
    cancelledAt: string | null
  }
  retry: {
    retryCount: number
    maxRetryCount: number
  }
  artifactManifest: VNextArtifactManifestRecord | null
  error: VNextArtifactManifestErrorSummary | null
  createdAt: string
  updatedAt: string
  execution: {
    worker: false
    layout: false
    renderer: false
    storageWrites: false
  }
}

export interface VNextArtifactJobCreateInput {
  jobId: string
  artifactId: string
  sourcePackageId?: string | null
  sessionId?: string | null
  layoutProfileId: string
  measurementProfileId: string
  rendererProfileId: string
  format: VNextArtifactManifestFormat
  mediaType: string
  createdAt: string
  maxRetryCount?: number
}

export type VNextArtifactJobCommand =
  | { action: "start-layout"; updatedAt: string }
  | {
      action: "record-layout-progress"
      updatedAt: string
      cursor: Partial<VNextArtifactJobCursor>
      completedStepCount: number
      totalStepCount: number
    }
  | {
      action: "complete-layout"
      updatedAt: string
      cursor?: Partial<VNextArtifactJobCursor>
      completedStepCount?: number
      totalStepCount?: number
    }
  | { action: "start-rendering"; updatedAt: string }
  | { action: "complete-render"; updatedAt: string; artifactManifest: unknown }
  | { action: "fail"; updatedAt: string; error: unknown }
  | { action: "cancel"; updatedAt: string; reason: string }
  | { action: "retry"; updatedAt: string }

export interface VNextArtifactJobIssue {
  severity: "blocking"
  code: string
  path: string
  message: string
}

export interface VNextArtifactJobCreatePlan {
  source: typeof VNEXT_ARTIFACT_JOB_SOURCE
  mode: typeof VNEXT_ARTIFACT_JOB_MODE
  status: "ready" | "blocked"
  job: VNextArtifactJobRecord | null
  issues: VNextArtifactJobIssue[]
  contracts: VNextArtifactJobContracts
}

export interface VNextArtifactJobTransitionPlan {
  source: typeof VNEXT_ARTIFACT_JOB_SOURCE
  mode: typeof VNEXT_ARTIFACT_JOB_MODE
  status: "advanced" | "blocked"
  action: VNextArtifactJobAction
  previousStatus: VNextArtifactJobStatus
  nextStatus: VNextArtifactJobStatus
  job: VNextArtifactJobRecord
  issues: VNextArtifactJobIssue[]
  contracts: VNextArtifactJobContracts
}

export interface VNextArtifactJobContracts {
  durableRecordOnly: true
  workerExecution: false
  layoutExecution: false
  rendererExecution: false
  storageWrites: false
  queueWrites: false
  backendRoute: false
}

const DEFAULT_MAX_RETRY_COUNT = 3

const ALLOWED_TRANSITIONS: Record<VNextArtifactJobAction, VNextArtifactJobStatus[]> = {
  "start-layout": ["queued"],
  "record-layout-progress": ["layout-running"],
  "complete-layout": ["layout-running"],
  "start-rendering": ["layout-complete"],
  "complete-render": ["rendering"],
  fail: ["queued", "layout-running", "layout-complete", "rendering"],
  cancel: ["queued", "layout-running", "layout-complete", "rendering"],
  retry: ["failed"],
}

function contracts(): VNextArtifactJobContracts {
  return {
    durableRecordOnly: true,
    workerExecution: false,
    layoutExecution: false,
    rendererExecution: false,
    storageWrites: false,
    queueWrites: false,
    backendRoute: false,
  }
}

function issue(code: string, path: string, message: string): VNextArtifactJobIssue {
  return {
    severity: "blocking",
    code,
    path,
    message,
  }
}

function mapManifestIssues(
  manifestIssues: readonly VNextArtifactManifestIssue[],
  pathPrefix: string,
): VNextArtifactJobIssue[] {
  return manifestIssues.map((manifestIssue) => issue(
    manifestIssue.code,
    `${pathPrefix}.${manifestIssue.path}`,
    manifestIssue.message,
  ))
}

function nonEmptyString(value: unknown, path: string, issues: VNextArtifactJobIssue[]): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue("invalid-string", path, `${path} must be a non-empty string`))
  return null
}

function nullableString(value: unknown, path: string, issues: VNextArtifactJobIssue[]): string | null {
  if (value == null) return null
  if (typeof value === "string" && value.trim().length > 0) return value

  issues.push(issue("invalid-nullable-string", path, `${path} must be null or a non-empty string`))
  return null
}

function parseDateString(value: unknown, path: string, issues: VNextArtifactJobIssue[]): string | null {
  if (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value))) return value

  issues.push(issue("invalid-date", path, `${path} must be a parseable ISO date string`))
  return null
}

function nonNegativeInteger(value: unknown, path: string, issues: VNextArtifactJobIssue[]): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value

  issues.push(issue("invalid-integer", path, `${path} must be a non-negative integer`))
  return null
}

function boundedPercent(completedStepCount: number, totalStepCount: number | null): number {
  if (totalStepCount == null || totalStepCount <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((completedStepCount / totalStepCount) * 100)))
}

function progress(
  stage: VNextArtifactJobProgress["stage"],
  completedStepCount: number,
  totalStepCount: number | null,
): VNextArtifactJobProgress {
  return {
    stage,
    completedStepCount,
    totalStepCount,
    percent: stage === "complete" ? 100 : boundedPercent(completedStepCount, totalStepCount),
  }
}

function cursorFromPartial(
  current: VNextArtifactJobCursor,
  cursor: Partial<VNextArtifactJobCursor> | undefined,
  issues: VNextArtifactJobIssue[],
): VNextArtifactJobCursor | null {
  if (cursor == null) return current

  const layoutJobOffset = cursor.layoutJobOffset == null
    ? current.layoutJobOffset
    : nonNegativeInteger(cursor.layoutJobOffset, "cursor.layoutJobOffset", issues)
  const completedSourceItemIds = cursor.completedSourceItemIds == null
    ? current.completedSourceItemIds
    : cursor.completedSourceItemIds

  if (!Array.isArray(completedSourceItemIds) || !completedSourceItemIds.every((value) => typeof value === "string" && value.length > 0)) {
    issues.push(issue("invalid-cursor-completed-items", "cursor.completedSourceItemIds", "completedSourceItemIds must be non-empty string ids"))
    return null
  }
  if (layoutJobOffset == null) return null

  return {
    layoutJobOffset,
    completedSourceItemIds: [...completedSourceItemIds],
  }
}

function parseErrorSummary(value: unknown, issues: VNextArtifactJobIssue[]): VNextArtifactManifestErrorSummary | null {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    issues.push(issue("invalid-error", "error", "error must be a bounded error summary"))
    return null
  }

  const raw = value as Record<string, unknown>
  const code = raw.code
  const message = raw.message
  const retryable = raw.retryable
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

function manifestForJob(
  job: Pick<VNextArtifactJobRecord, "artifact" | "artifactManifest" | "createdAt" | "input" | "jobId" | "profiles">,
  status: VNextArtifactManifestRecord["status"],
  errorSummary: VNextArtifactManifestErrorSummary | null = null,
): { manifest: VNextArtifactManifestRecord | null; issues: VNextArtifactJobIssue[] } {
  const previous = job.artifactManifest
  const plan = createVNextArtifactManifestPlan({
    artifactId: job.artifact.artifactId,
    sourcePackageId: job.input.sourcePackageId,
    sessionId: job.input.sessionId,
    jobId: job.jobId,
    rendererProfileId: job.profiles.rendererProfileId,
    measurementProfileId: job.profiles.measurementProfileId,
    format: job.artifact.format,
    mediaType: job.artifact.mediaType,
    byteLength: null,
    sha256: null,
    storageKey: previous?.storageKey ?? null,
    createdAt: previous?.createdAt ?? job.createdAt,
    status,
    error: errorSummary,
  })

  if (plan.record != null) return { manifest: plan.record, issues: [] }
  return { manifest: null, issues: mapManifestIssues(plan.issues, "artifactManifest") }
}

function validateRenderedManifest(
  job: VNextArtifactJobRecord,
  value: unknown,
): { manifest: VNextArtifactManifestRecord | null; issues: VNextArtifactJobIssue[] } {
  const plan = createVNextArtifactManifestPlan(value)
  const issues = mapManifestIssues(plan.issues, "artifactManifest")
  const manifest = plan.record

  if (manifest == null) return { manifest: null, issues }
  if (manifest.status !== "rendered") {
    issues.push(issue("artifact-not-rendered", "artifactManifest.status", "complete-render requires a rendered artifact manifest"))
  }
  if (manifest.artifactId !== job.artifact.artifactId) {
    issues.push(issue("artifact-id-mismatch", "artifactManifest.artifactId", "artifact manifest id must match the job artifactId"))
  }
  if (manifest.rendererProfileId !== job.profiles.rendererProfileId) {
    issues.push(issue("renderer-profile-mismatch", "artifactManifest.rendererProfileId", "artifact manifest rendererProfileId must match the job"))
  }
  if (manifest.measurementProfileId !== job.profiles.measurementProfileId) {
    issues.push(issue("measurement-profile-mismatch", "artifactManifest.measurementProfileId", "artifact manifest measurementProfileId must match the job"))
  }
  if (manifest.format !== job.artifact.format || manifest.mediaType !== job.artifact.mediaType) {
    issues.push(issue("artifact-format-mismatch", "artifactManifest.format", "artifact manifest format and mediaType must match the job"))
  }

  return {
    manifest: issues.length === 0 ? manifest : null,
    issues,
  }
}

function createPlan(status: VNextArtifactJobCreatePlan["status"], job: VNextArtifactJobRecord | null, issues: VNextArtifactJobIssue[]): VNextArtifactJobCreatePlan {
  return {
    source: VNEXT_ARTIFACT_JOB_SOURCE,
    mode: VNEXT_ARTIFACT_JOB_MODE,
    status,
    job,
    issues,
    contracts: contracts(),
  }
}

function transitionPlan(
  status: VNextArtifactJobTransitionPlan["status"],
  action: VNextArtifactJobAction,
  previousStatus: VNextArtifactJobStatus,
  nextStatus: VNextArtifactJobStatus,
  job: VNextArtifactJobRecord,
  issues: VNextArtifactJobIssue[],
): VNextArtifactJobTransitionPlan {
  return {
    source: VNEXT_ARTIFACT_JOB_SOURCE,
    mode: VNEXT_ARTIFACT_JOB_MODE,
    status,
    action,
    previousStatus,
    nextStatus,
    job,
    issues,
    contracts: contracts(),
  }
}

export function createVNextArtifactJobPlan(input: VNextArtifactJobCreateInput): VNextArtifactJobCreatePlan {
  const issues: VNextArtifactJobIssue[] = []
  const jobId = nonEmptyString(input.jobId, "jobId", issues)
  const artifactId = nonEmptyString(input.artifactId, "artifactId", issues)
  const sourcePackageId = nullableString(input.sourcePackageId, "sourcePackageId", issues)
  const sessionId = nullableString(input.sessionId, "sessionId", issues)
  const layoutProfileId = nonEmptyString(input.layoutProfileId, "layoutProfileId", issues)
  const measurementProfileId = nonEmptyString(input.measurementProfileId, "measurementProfileId", issues)
  const rendererProfileId = nonEmptyString(input.rendererProfileId, "rendererProfileId", issues)
  const mediaType = nonEmptyString(input.mediaType, "mediaType", issues)
  const createdAt = parseDateString(input.createdAt, "createdAt", issues)
  const maxRetryCount = input.maxRetryCount == null
    ? DEFAULT_MAX_RETRY_COUNT
    : nonNegativeInteger(input.maxRetryCount, "maxRetryCount", issues)

  if (sourcePackageId == null && sessionId == null) {
    issues.push(issue("missing-source-identity", "sourcePackageId", "sourcePackageId or sessionId must be provided"))
  }

  if (
    jobId == null ||
    artifactId == null ||
    layoutProfileId == null ||
    measurementProfileId == null ||
    rendererProfileId == null ||
    mediaType == null ||
    createdAt == null ||
    maxRetryCount == null
  ) {
    return createPlan("blocked", null, issues)
  }

  const manifest = manifestForJob({
    artifact: {
      artifactId,
      format: input.format,
      mediaType,
    },
    artifactManifest: null,
    createdAt,
    input: {
      sourcePackageId,
      sessionId,
    },
    jobId,
    profiles: {
      layoutProfileId,
      measurementProfileId,
      rendererProfileId,
    },
  }, "planned")

  issues.push(...manifest.issues)
  if (manifest.manifest == null || issues.length > 0) return createPlan("blocked", null, issues)

  const job: VNextArtifactJobRecord = {
    source: VNEXT_ARTIFACT_JOB_SOURCE,
    mode: VNEXT_ARTIFACT_JOB_MODE,
    jobId,
    status: "queued",
    input: {
      sourcePackageId,
      sessionId,
    },
    profiles: {
      layoutProfileId,
      measurementProfileId,
      rendererProfileId,
    },
    artifact: {
      artifactId,
      format: input.format,
      mediaType,
    },
    cursor: {
      layoutJobOffset: 0,
      completedSourceItemIds: [],
    },
    progress: progress("queued", 0, null),
    cancellation: {
      requested: false,
      reason: null,
      cancelledAt: null,
    },
    retry: {
      retryCount: 0,
      maxRetryCount,
    },
    artifactManifest: manifest.manifest,
    error: null,
    createdAt,
    updatedAt: createdAt,
    execution: {
      worker: false,
      layout: false,
      renderer: false,
      storageWrites: false,
    },
  }

  return createPlan("ready", job, [])
}

export function advanceVNextArtifactJob(
  job: VNextArtifactJobRecord,
  command: VNextArtifactJobCommand,
): VNextArtifactJobTransitionPlan {
  const issues: VNextArtifactJobIssue[] = []
  const previousStatus = job.status
  const updatedAt = parseDateString(command.updatedAt, "updatedAt", issues)
  const allowedFrom = ALLOWED_TRANSITIONS[command.action]

  if (!allowedFrom.includes(job.status)) {
    issues.push(issue("invalid-transition", "status", `${command.action} cannot run from ${job.status}`))
  }

  if (updatedAt == null || issues.length > 0) {
    return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
  }

  if (command.action === "start-layout") {
    return transitionPlan("advanced", command.action, previousStatus, "layout-running", {
      ...job,
      status: "layout-running",
      progress: progress("layout", job.progress.completedStepCount, job.progress.totalStepCount),
      updatedAt,
    }, [])
  }

  if (command.action === "record-layout-progress") {
    const cursor = cursorFromPartial(job.cursor, command.cursor, issues)
    const completedStepCount = nonNegativeInteger(command.completedStepCount, "completedStepCount", issues)
    const totalStepCount = nonNegativeInteger(command.totalStepCount, "totalStepCount", issues)
    if (cursor == null || completedStepCount == null || totalStepCount == null || completedStepCount > totalStepCount) {
      if (completedStepCount != null && totalStepCount != null && completedStepCount > totalStepCount) {
        issues.push(issue("progress-over-total", "completedStepCount", "completedStepCount cannot exceed totalStepCount"))
      }
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "layout-running", {
      ...job,
      status: "layout-running",
      cursor,
      progress: progress("layout", completedStepCount, totalStepCount),
      updatedAt,
    }, [])
  }

  if (command.action === "complete-layout") {
    const cursor = cursorFromPartial(job.cursor, command.cursor, issues)
    const totalStepCount = command.totalStepCount == null
      ? job.progress.totalStepCount ?? job.progress.completedStepCount
      : nonNegativeInteger(command.totalStepCount, "totalStepCount", issues)
    const completedStepCount = command.completedStepCount == null
      ? totalStepCount
      : nonNegativeInteger(command.completedStepCount, "completedStepCount", issues)
    if (cursor == null || totalStepCount == null || completedStepCount == null || completedStepCount !== totalStepCount) {
      if (completedStepCount != null && totalStepCount != null && completedStepCount !== totalStepCount) {
        issues.push(issue("incomplete-layout-progress", "completedStepCount", "complete-layout requires completedStepCount to equal totalStepCount"))
      }
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "layout-complete", {
      ...job,
      status: "layout-complete",
      cursor,
      progress: progress("layout", completedStepCount, totalStepCount),
      updatedAt,
    }, [])
  }

  if (command.action === "start-rendering") {
    const manifest = manifestForJob(job, "rendering")
    issues.push(...manifest.issues)
    if (manifest.manifest == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "rendering", {
      ...job,
      status: "rendering",
      progress: progress("rendering", 0, null),
      artifactManifest: manifest.manifest,
      updatedAt,
    }, [])
  }

  if (command.action === "complete-render") {
    const rendered = validateRenderedManifest(job, command.artifactManifest)
    issues.push(...rendered.issues)
    if (rendered.manifest == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "rendered", {
      ...job,
      status: "rendered",
      progress: progress("complete", 1, 1),
      artifactManifest: rendered.manifest,
      updatedAt,
    }, [])
  }

  if (command.action === "fail") {
    const errorSummary = parseErrorSummary(command.error, issues)
    if (errorSummary == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    const manifest = manifestForJob(job, "failed", errorSummary)
    issues.push(...manifest.issues)
    if (manifest.manifest == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "failed", {
      ...job,
      status: "failed",
      progress: progress("failed", job.progress.completedStepCount, job.progress.totalStepCount),
      artifactManifest: manifest.manifest,
      error: errorSummary,
      updatedAt,
    }, [])
  }

  if (command.action === "cancel") {
    const reason = nonEmptyString(command.reason, "reason", issues)
    if (reason == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "cancelled", {
      ...job,
      status: "cancelled",
      progress: progress("cancelled", job.progress.completedStepCount, job.progress.totalStepCount),
      cancellation: {
        requested: true,
        reason,
        cancelledAt: updatedAt,
      },
      updatedAt,
    }, [])
  }

  if (command.action === "retry") {
    if (job.retry.retryCount >= job.retry.maxRetryCount) {
      issues.push(issue("retry-limit-exceeded", "retry.retryCount", "retryCount cannot exceed maxRetryCount"))
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    const manifest = manifestForJob(job, "planned")
    issues.push(...manifest.issues)
    if (manifest.manifest == null || issues.length > 0) {
      return transitionPlan("blocked", command.action, previousStatus, previousStatus, job, issues)
    }

    return transitionPlan("advanced", command.action, previousStatus, "queued", {
      ...job,
      status: "queued",
      cursor: {
        layoutJobOffset: 0,
        completedSourceItemIds: [],
      },
      progress: progress("queued", 0, null),
      cancellation: {
        requested: false,
        reason: null,
        cancelledAt: null,
      },
      retry: {
        ...job.retry,
        retryCount: job.retry.retryCount + 1,
      },
      artifactManifest: manifest.manifest,
      error: null,
      updatedAt,
    }, [])
  }

  const unreachable: never = command
  return unreachable
}
