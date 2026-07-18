import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextPdfMeasuredDrawContractResultV1 } from "../renderer/pdfMeasuredDrawContractV1.js"
import {
  createVNextPdfExportHandoffV1,
  createVNextPdfExportReceiptV1,
  type VNextPdfExportReceiptV1,
  type VNextPdfExportRequestV1,
  type VNextPdfExportSourceIdentityV1,
} from "./pdfExportHandoffV1.js"

export const VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_SOURCE = "vnext-pdf-export-production-baseline" as const
export const VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_VERSION = 1 as const

export const VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1 = {
  maxAttempts: 5,
  executionDeadlineMs: 15 * 60 * 1000,
  pageCount: 1_000,
  paintCommandCount: 1_000_000,
  glyphCount: 10_000_000,
  fontAssetCount: 64,
  imageAssetCount: 1_000,
  singleImagePixelCount: 100_000_000,
  totalImagePixelCount: 1_000_000_000,
  outputByteLength: 1_000_000_000,
} as const

export interface VNextPdfExportProductionPolicyV1 {
  policyId: string
  maxAttempts: number
  executionDeadlineMs: number
  resources: {
    maxPageCount: number
    maxPaintCommandCount: number
    maxGlyphCount: number
    maxFontAssetCount: number
    maxImageAssetCount: number
    maxSingleImagePixelCount: number
    maxTotalImagePixelCount: number
    maxOutputByteLength: number
  }
}

export type VNextPdfExportProductionBindingRequirementV1 =
  | "backend-idempotency-binding"
  | "deadline-enforcement"
  | "cooperative-cancellation"
  | "worker-lifecycle-binding"
  | "durable-byte-storage"
  | "atomic-manifest-job-projection"
  | "observability-sink"
  | "authorization-and-tenancy"
  | "production-renderer-profile-promotion"
  | "runtime-profile-qualification"

export type VNextPdfExportProductionStopReasonV1 =
  | "completed"
  | "cancelled-before-handoff"
  | "cancelled-before-render"
  | "cancelled-before-persist"
  | "deadline-exceeded"
  | "resource-limit-exceeded"
  | "source-revision-drift"
  | "idempotency-conflict"
  | "renderer-blocked"
  | "storage-failed"
  | "shutdown-drain-complete"
  | "shutdown-forced"

export interface VNextPdfExportProductionBaselineIssueV1 {
  severity: "error"
  code: string
  path: string
  message: string
}

export interface VNextPdfExportProductionBaselineV1 {
  source: typeof VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_SOURCE
  contractVersion: typeof VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_VERSION
  kind: "pdf-export-production-baseline"
  baselineId: string
  policy: VNextPdfExportProductionPolicyV1
  exportIdentity: {
    exportRequestId: string
    artifactId: string
    requestFingerprint: string
    handoffFingerprint: string
    receiptFingerprint: string
    sourceContractFingerprint: string
    sourceContractContentFingerprint: string
  }
  idempotency: {
    payloadFingerprint: string
    backendKeyRequired: true
    scope: "source-revision-request-contract-and-policy"
    duplicateInFlight: "return-existing-operation"
    duplicateTerminal: "return-existing-receipt"
    conflictingPayload: "reject"
    stageKeysDerivedByBackend: true
  }
  lifecycle: {
    maxAttempts: number
    executionDeadlineMs: number
    cancellationCheckpoints: readonly ["before-handoff", "before-render", "before-persist"]
    midRenderCancellationRequired: true
    drainPolicy: "reject-new-then-finish-or-cancel-in-flight"
    automaticLoop: false
    stopReasons: readonly VNextPdfExportProductionStopReasonV1[]
  }
  resources: {
    actual: {
      pageCount: number
      paintCommandCount: number
      glyphCount: number
      fontAssetCount: number
      imageAssetCount: number
      maxSingleImagePixelCount: number
      totalImagePixelCount: number
      outputByteLength: number
    }
    limits: VNextPdfExportProductionPolicyV1["resources"]
    allWithinLimits: true
    postRenderByteLimitRequired: true
  }
  storage: {
    projectionTargets: readonly ["artifact-manifest", "artifact-job"]
    commitOrder: readonly [
      "write-content-addressed-bytes",
      "verify-byte-length-and-sha256",
      "compare-and-swap-artifact-manifest",
      "compare-and-swap-artifact-job",
    ]
    metadataBeforeBytes: false
    readAfterWriteIntegrityRequired: true
    orphanCleanupPolicyRequired: true
    writesExecuted: false
  }
  observability: {
    requiredEvents: readonly string[]
    requiredDimensions: readonly string[]
    sourceTextAllowed: false
    pdfBytesAllowed: false
    sinkBound: false
  }
  activation: {
    status: "blocked"
    requiredBindings: readonly VNextPdfExportProductionBindingRequirementV1[]
    satisfiedBindings: readonly []
    productionBinding: false
  }
  contracts: {
    baselineOnly: true
    revalidatesPhaseTReceipt: true
    backendOwnsRuntimePolicy: true
    workerExecution: false
    deadlineExecution: false
    cancellationExecution: false
    storageWrites: false
    manifestOrJobMutation: false
    observabilityWrites: false
    backendRoute: false
    productionBinding: false
  }
  baselineFingerprint: string
}

export type VNextPdfExportProductionBaselineResultV1 =
  | { status: "accepted"; baseline: VNextPdfExportProductionBaselineV1; issues: [] }
  | { status: "blocked"; baseline: null; issues: VNextPdfExportProductionBaselineIssueV1[] }

export const VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_SOURCE =
  "vnext-pdf-export-production-admission" as const
export const VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_VERSION = 1 as const
export const VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_SOURCE =
  "vnext-pdf-export-production-render-completion" as const
export const VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_VERSION = 1 as const

export type VNextPdfExportProductionMeasuredResourceFactsV1 = Omit<
  VNextPdfExportProductionBaselineV1["resources"]["actual"],
  "outputByteLength"
>

export interface VNextPdfExportProductionAdmissionV1 {
  source: typeof VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_SOURCE
  contractVersion: typeof VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_VERSION
  kind: "pdf-export-production-admission"
  admissionId: string
  policy: VNextPdfExportProductionPolicyV1
  exportIdentity: {
    exportRequestId: string
    artifactId: string
    requestFingerprint: string
    handoffFingerprint: string
    sourceIdentity: VNextPdfExportSourceIdentityV1
    sourceContractFingerprint: string
    sourceContractContentFingerprint: string
    rendererProfileId: string
    measurementProfileId: string
  }
  idempotency: VNextPdfExportProductionBaselineV1["idempotency"]
  lifecycle: VNextPdfExportProductionBaselineV1["lifecycle"]
  resources: {
    measured: VNextPdfExportProductionMeasuredResourceFactsV1
    limits: VNextPdfExportProductionPolicyV1["resources"]
    measuredWithinLimits: true
    outputByteLength: "pending-render"
    postRenderByteLimitRequired: true
  }
  activation: VNextPdfExportProductionBaselineV1["activation"]
  contracts: {
    preRenderAdmission: true
    exactSourceRevalidated: true
    exactMeasuredContractRevalidated: true
    idempotencyPayloadDerived: true
    outputByteLimitDeferred: true
    rendererExecution: false
    deadlineExecution: false
    cancellationExecution: false
    storageWrites: false
    manifestOrJobMutation: false
    observabilityWrites: false
    backendRoute: false
    productionBinding: false
  }
  admissionFingerprint: string
}

export type VNextPdfExportProductionAdmissionResultV1 =
  | { status: "admitted"; admission: VNextPdfExportProductionAdmissionV1; issues: [] }
  | { status: "blocked"; admission: null; issues: VNextPdfExportProductionBaselineIssueV1[] }

export interface VNextPdfExportProductionRenderCompletionV1 {
  source: typeof VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_SOURCE
  contractVersion: typeof VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_VERSION
  kind: "pdf-export-production-render-completion"
  completionId: string
  admissionId: string
  admissionFingerprint: string
  idempotencyPayloadFingerprint: string
  exportIdentity: {
    exportRequestId: string
    artifactId: string
    requestFingerprint: string
    handoffFingerprint: string
    receiptFingerprint: string
    sourceContractFingerprint: string
    sourceContractContentFingerprint: string
    rendererProfileId: string
    measurementProfileId: string
  }
  artifact: {
    artifactId: string
    format: "pdf"
    mediaType: "application/pdf"
    pageCount: number
    byteLength: number
    sha256: string
    storageStatus: "not-stored"
    storageKey: null
  }
  resources: {
    actual: VNextPdfExportProductionBaselineV1["resources"]["actual"]
    limits: VNextPdfExportProductionPolicyV1["resources"]
    allWithinLimits: true
  }
  storage: VNextPdfExportProductionBaselineV1["storage"] & {
    nextAction: "persist-content-addressed-bytes"
  }
  activation: VNextPdfExportProductionBaselineV1["activation"]
  contracts: {
    postRenderValidation: true
    exactAdmissionRevalidated: true
    exactReceiptRevalidated: true
    readyForPersistence: true
    carriesBytes: false
    byteContentVerified: false
    workerExecution: false
    storageWrites: false
    manifestOrJobMutation: false
    observabilityWrites: false
    backendRoute: false
    productionBinding: false
  }
  completionFingerprint: string
}

export type VNextPdfExportProductionRenderCompletionResultV1 =
  | {
      status: "ready-for-persistence"
      completion: VNextPdfExportProductionRenderCompletionV1
      issues: []
    }
  | { status: "blocked"; completion: null; issues: VNextPdfExportProductionBaselineIssueV1[] }

const CANCELLATION_CHECKPOINTS = ["before-handoff", "before-render", "before-persist"] as const
const STORAGE_TARGETS = ["artifact-manifest", "artifact-job"] as const
const STORAGE_COMMIT_ORDER = [
  "write-content-addressed-bytes",
  "verify-byte-length-and-sha256",
  "compare-and-swap-artifact-manifest",
  "compare-and-swap-artifact-job",
] as const
const STOP_REASONS: readonly VNextPdfExportProductionStopReasonV1[] = [
  "completed",
  "cancelled-before-handoff",
  "cancelled-before-render",
  "cancelled-before-persist",
  "deadline-exceeded",
  "resource-limit-exceeded",
  "source-revision-drift",
  "idempotency-conflict",
  "renderer-blocked",
  "storage-failed",
  "shutdown-drain-complete",
  "shutdown-forced",
]
const REQUIRED_BINDINGS: readonly VNextPdfExportProductionBindingRequirementV1[] = [
  "backend-idempotency-binding",
  "deadline-enforcement",
  "cooperative-cancellation",
  "worker-lifecycle-binding",
  "durable-byte-storage",
  "atomic-manifest-job-projection",
  "observability-sink",
  "authorization-and-tenancy",
  "production-renderer-profile-promotion",
  "runtime-profile-qualification",
]
const REQUIRED_EVENTS = [
  "pdf-export.accepted",
  "pdf-export.deduplicated",
  "pdf-export.render-started",
  "pdf-export.render-completed",
  "pdf-export.persist-started",
  "pdf-export.persist-completed",
  "pdf-export.cancelled",
  "pdf-export.deadline-exceeded",
  "pdf-export.resource-rejected",
  "pdf-export.failed",
] as const
const REQUIRED_DIMENSIONS = [
  "exportRequestId",
  "artifactId",
  "documentId",
  "documentRevision",
  "requestFingerprint",
  "sourceContractFingerprint",
  "rendererProfileId",
  "measurementProfileId",
  "attempt",
  "stopReason",
  "pageCount",
  "byteLength",
  "durationMs",
] as const

function issue(code: string, path: string, message: string): VNextPdfExportProductionBaselineIssueV1 {
  return { severity: "error", code, path, message }
}

function boundedInteger(
  value: unknown,
  minimum: number,
  maximum: number,
  path: string,
  issues: VNextPdfExportProductionBaselineIssueV1[],
): value is number {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum) return true
  issues.push(issue("production-policy-limit-invalid", path, `${path} must be an integer from ${minimum} through ${maximum}`))
  return false
}

function validatePolicy(
  policy: VNextPdfExportProductionPolicyV1,
  issues: VNextPdfExportProductionBaselineIssueV1[],
): void {
  if (typeof policy.policyId !== "string" || policy.policyId.trim().length === 0 || policy.policyId.length > 512) {
    issues.push(issue("production-policy-id-invalid", "policy.policyId", "policyId must be nonblank and at most 512 characters"))
  }
  boundedInteger(policy.maxAttempts, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.maxAttempts, "policy.maxAttempts", issues)
  boundedInteger(
    policy.executionDeadlineMs,
    1_000,
    VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.executionDeadlineMs,
    "policy.executionDeadlineMs",
    issues,
  )
  boundedInteger(policy.resources.maxPageCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.pageCount, "policy.resources.maxPageCount", issues)
  boundedInteger(policy.resources.maxPaintCommandCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.paintCommandCount, "policy.resources.maxPaintCommandCount", issues)
  boundedInteger(policy.resources.maxGlyphCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.glyphCount, "policy.resources.maxGlyphCount", issues)
  boundedInteger(policy.resources.maxFontAssetCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.fontAssetCount, "policy.resources.maxFontAssetCount", issues)
  boundedInteger(policy.resources.maxImageAssetCount, 0, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.imageAssetCount, "policy.resources.maxImageAssetCount", issues)
  boundedInteger(policy.resources.maxSingleImagePixelCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.singleImagePixelCount, "policy.resources.maxSingleImagePixelCount", issues)
  boundedInteger(policy.resources.maxTotalImagePixelCount, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.totalImagePixelCount, "policy.resources.maxTotalImagePixelCount", issues)
  boundedInteger(policy.resources.maxOutputByteLength, 1, VNEXT_PDF_EXPORT_PRODUCTION_ABSOLUTE_LIMITS_V1.outputByteLength, "policy.resources.maxOutputByteLength", issues)
}

function idempotencyPayloadFingerprint(
  request: VNextPdfExportRequestV1,
  policy: VNextPdfExportProductionPolicyV1,
): string {
  return createVNextCompactFingerprint(JSON.stringify({
    source: VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_SOURCE,
    scope: "source-revision-request-contract-and-policy",
    exportRequestId: request.exportRequestId,
    artifactId: request.artifactId,
    requestFingerprint: request.requestFingerprint,
    sourceIdentity: request.expectedSource,
    sourceContractFingerprint: request.measuredDrawContract.fingerprint,
    sourceContractContentFingerprint: request.measuredDrawContract.contentFingerprint,
    policy,
  }))
}

function idempotencyFacts(
  request: VNextPdfExportRequestV1,
  policy: VNextPdfExportProductionPolicyV1,
): VNextPdfExportProductionBaselineV1["idempotency"] {
  return {
    payloadFingerprint: idempotencyPayloadFingerprint(request, policy),
    backendKeyRequired: true,
    scope: "source-revision-request-contract-and-policy",
    duplicateInFlight: "return-existing-operation",
    duplicateTerminal: "return-existing-receipt",
    conflictingPayload: "reject",
    stageKeysDerivedByBackend: true,
  }
}

function lifecycleFacts(
  policy: VNextPdfExportProductionPolicyV1,
): VNextPdfExportProductionBaselineV1["lifecycle"] {
  return {
    maxAttempts: policy.maxAttempts,
    executionDeadlineMs: policy.executionDeadlineMs,
    cancellationCheckpoints: [...CANCELLATION_CHECKPOINTS],
    midRenderCancellationRequired: true,
    drainPolicy: "reject-new-then-finish-or-cancel-in-flight",
    automaticLoop: false,
    stopReasons: [...STOP_REASONS],
  }
}

function activationFacts(): VNextPdfExportProductionBaselineV1["activation"] {
  return {
    status: "blocked",
    requiredBindings: [...REQUIRED_BINDINGS],
    satisfiedBindings: [],
    productionBinding: false,
  }
}

function storageFacts(): VNextPdfExportProductionBaselineV1["storage"] {
  return {
    projectionTargets: [...STORAGE_TARGETS],
    commitOrder: [...STORAGE_COMMIT_ORDER],
    metadataBeforeBytes: false,
    readAfterWriteIntegrityRequired: true,
    orphanCleanupPolicyRequired: true,
    writesExecuted: false,
  }
}

function sameReceipt(left: VNextPdfExportReceiptV1, right: VNextPdfExportReceiptV1): boolean {
  return left.source === right.source
    && left.contractVersion === right.contractVersion
    && left.kind === right.kind
    && left.status === right.status
    && left.exportRequestId === right.exportRequestId
    && left.requestFingerprint === right.requestFingerprint
    && left.handoffFingerprint === right.handoffFingerprint
    && left.sourceIdentity.documentId === right.sourceIdentity.documentId
    && left.sourceIdentity.documentRevision === right.sourceIdentity.documentRevision
    && left.sourceIdentity.documentFingerprint === right.sourceIdentity.documentFingerprint
    && left.sourceIdentity.sourcePackageId === right.sourceIdentity.sourcePackageId
    && left.sourceIdentity.sessionId === right.sourceIdentity.sessionId
    && left.artifact.artifactId === right.artifact.artifactId
    && left.artifact.format === right.artifact.format
    && left.artifact.mediaType === right.artifact.mediaType
    && left.artifact.byteLength === right.artifact.byteLength
    && left.artifact.sha256 === right.artifact.sha256
    && left.artifact.pageCount === right.artifact.pageCount
    && left.artifact.storageStatus === right.artifact.storageStatus
    && left.artifact.storageKey === right.artifact.storageKey
    && left.rendererProfileId === right.rendererProfileId
    && left.measurementProfileId === right.measurementProfileId
    && left.sourceContractFingerprint === right.sourceContractFingerprint
    && left.sourceContractContentFingerprint === right.sourceContractContentFingerprint
    && left.contracts.mayRelayout === right.contracts.mayRelayout
    && left.contracts.carriesBytes === right.contracts.carriesBytes
    && left.contracts.storageWrites === right.contracts.storageWrites
    && left.contracts.artifactManifestProjection === right.contracts.artifactManifestProjection
    && left.contracts.productionBinding === right.contracts.productionBinding
    && left.receiptFingerprint === right.receiptFingerprint
}

function revalidateReceipt(input: {
  request: VNextPdfExportRequestV1
  currentSource?: VNextPdfExportSourceIdentityV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
  receipt: VNextPdfExportReceiptV1
}, issues: VNextPdfExportProductionBaselineIssueV1[]) {
  const handoff = createVNextPdfExportHandoffV1({
    request: input.request,
    currentSource: input.currentSource ?? input.request.expectedSource,
    measuredDrawContract: input.measuredDrawContract,
  })
  if (handoff.status !== "ready") {
    handoff.issues.forEach((item, index) => issues.push(issue(
      "phase-t-handoff-invalid",
      `handoff.issues[${index}].${item.path}`,
      `${item.code}: ${item.message}`,
    )))
    return null
  }
  const accepted = createVNextPdfExportReceiptV1({
    handoff,
    renderEvidence: {
      status: "rendered",
      artifactId: input.receipt.artifact.artifactId,
      format: input.receipt.artifact.format,
      mediaType: input.receipt.artifact.mediaType,
      byteLength: input.receipt.artifact.byteLength,
      sha256: input.receipt.artifact.sha256,
      pageCount: input.receipt.artifact.pageCount,
      rendererProfileId: input.receipt.rendererProfileId,
      measurementProfileId: input.receipt.measurementProfileId,
      sourceContractFingerprint: input.receipt.sourceContractFingerprint,
      sourceContractContentFingerprint: input.receipt.sourceContractContentFingerprint,
    },
  })
  if (accepted.status !== "accepted") {
    accepted.issues.forEach((item, index) => issues.push(issue(
      "phase-t-receipt-invalid",
      `receipt.issues[${index}].${item.path}`,
      `${item.code}: ${item.message}`,
    )))
    return null
  }
  if (!sameReceipt(accepted.receipt, input.receipt)) {
    issues.push(issue("phase-t-receipt-content-mismatch", "receipt", "receipt content drifted after Phase T acceptance"))
    return null
  }
  return { handoff, receipt: accepted.receipt }
}

function resourceFacts(contract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>) {
  const glyphCount = contract.pages.reduce((pageTotal, page) => pageTotal + page.commands.reduce(
    (commandTotal, command) => commandTotal + (command.kind === "glyph-run" ? command.glyphs.length : 0),
    0,
  ), 0)
  const imagePixels = contract.imageAssets.map((asset) => asset.pixelWidth * asset.pixelHeight)
  return {
    pageCount: contract.pages.length,
    paintCommandCount: contract.summary.paintCommandCount,
    glyphCount,
    fontAssetCount: contract.fontAssets.length,
    imageAssetCount: contract.imageAssets.length,
    maxSingleImagePixelCount: imagePixels.reduce((maximum, value) => Math.max(maximum, value), 0),
    totalImagePixelCount: imagePixels.reduce((total, value) => total + value, 0),
  }
}

function validateResourceComparison(
  name: string,
  path: string,
  value: number,
  limit: number,
  issues: VNextPdfExportProductionBaselineIssueV1[],
): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    issues.push(issue("production-resource-fact-invalid", path, `${name} must be a nonnegative safe integer`))
  } else if (value > limit) {
    issues.push(issue("production-resource-limit-exceeded", path, `${name} ${value} exceeds limit ${limit}`))
  }
}

function validateMeasuredResourceFacts(
  actual: ReturnType<typeof resourceFacts>,
  limits: VNextPdfExportProductionPolicyV1["resources"],
  issues: VNextPdfExportProductionBaselineIssueV1[],
): void {
  const comparisons = [
    ["page-count", "resources.actual.pageCount", actual.pageCount, limits.maxPageCount],
    ["paint-command-count", "resources.actual.paintCommandCount", actual.paintCommandCount, limits.maxPaintCommandCount],
    ["glyph-count", "resources.actual.glyphCount", actual.glyphCount, limits.maxGlyphCount],
    ["font-asset-count", "resources.actual.fontAssetCount", actual.fontAssetCount, limits.maxFontAssetCount],
    ["image-asset-count", "resources.actual.imageAssetCount", actual.imageAssetCount, limits.maxImageAssetCount],
    ["single-image-pixel-count", "resources.actual.maxSingleImagePixelCount", actual.maxSingleImagePixelCount, limits.maxSingleImagePixelCount],
    ["total-image-pixel-count", "resources.actual.totalImagePixelCount", actual.totalImagePixelCount, limits.maxTotalImagePixelCount],
  ] as const
  comparisons.forEach(([name, path, value, limit]) => {
    validateResourceComparison(name, path, value, limit, issues)
  })
}

function validateResourceFacts(
  actual: ReturnType<typeof resourceFacts> & { outputByteLength: number },
  limits: VNextPdfExportProductionPolicyV1["resources"],
  issues: VNextPdfExportProductionBaselineIssueV1[],
): void {
  validateMeasuredResourceFacts(actual, limits, issues)
  validateResourceComparison(
    "output-byte-length",
    "resources.actual.outputByteLength",
    actual.outputByteLength,
    limits.maxOutputByteLength,
    issues,
  )
}

export function createVNextPdfExportProductionAdmissionV1(input: {
  admissionId: string
  request: VNextPdfExportRequestV1
  currentSource: VNextPdfExportSourceIdentityV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
  policy: VNextPdfExportProductionPolicyV1
}): VNextPdfExportProductionAdmissionResultV1 {
  const issues: VNextPdfExportProductionBaselineIssueV1[] = []
  if (typeof input.admissionId !== "string"
    || input.admissionId.trim().length === 0
    || input.admissionId.length > 512) {
    issues.push(issue(
      "production-admission-id-invalid",
      "admissionId",
      "admissionId must be nonblank and at most 512 characters",
    ))
  }
  validatePolicy(input.policy, issues)
  const handoff = createVNextPdfExportHandoffV1({
    request: input.request,
    currentSource: input.currentSource,
    measuredDrawContract: input.measuredDrawContract,
  })
  if (handoff.status !== "ready") {
    handoff.issues.forEach((item, index) => issues.push(issue(
      "phase-t-handoff-invalid",
      `handoff.issues[${index}].${item.path}`,
      `${item.code}: ${item.message}`,
    )))
  }
  if (input.measuredDrawContract.status !== "consumable") {
    issues.push(issue(
      "measured-contract-blocked",
      "measuredDrawContract",
      "production admission requires a consumable measured contract",
    ))
  }
  const measured = input.measuredDrawContract.status === "consumable"
    ? resourceFacts(input.measuredDrawContract)
    : null
  if (measured != null) validateMeasuredResourceFacts(measured, input.policy.resources, issues)
  if (issues.length > 0 || handoff.status !== "ready" || measured == null) {
    return { status: "blocked", admission: null, issues }
  }

  const facts = {
    source: VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_PRODUCTION_ADMISSION_V1_VERSION,
    kind: "pdf-export-production-admission" as const,
    admissionId: input.admissionId,
    policy: structuredClone(input.policy),
    exportIdentity: {
      exportRequestId: input.request.exportRequestId,
      artifactId: input.request.artifactId,
      requestFingerprint: input.request.requestFingerprint,
      handoffFingerprint: handoff.handoffFingerprint,
      sourceIdentity: structuredClone(input.currentSource),
      sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
      sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
      rendererProfileId: input.request.measuredDrawContract.rendererProfileId,
      measurementProfileId: input.request.measuredDrawContract.measurementProfileId,
    },
    idempotency: idempotencyFacts(input.request, input.policy),
    lifecycle: lifecycleFacts(input.policy),
    resources: {
      measured: structuredClone(measured),
      limits: structuredClone(input.policy.resources),
      measuredWithinLimits: true as const,
      outputByteLength: "pending-render" as const,
      postRenderByteLimitRequired: true as const,
    },
    activation: activationFacts(),
    contracts: {
      preRenderAdmission: true as const,
      exactSourceRevalidated: true as const,
      exactMeasuredContractRevalidated: true as const,
      idempotencyPayloadDerived: true as const,
      outputByteLimitDeferred: true as const,
      rendererExecution: false as const,
      deadlineExecution: false as const,
      cancellationExecution: false as const,
      storageWrites: false as const,
      manifestOrJobMutation: false as const,
      observabilityWrites: false as const,
      backendRoute: false as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "admitted",
    admission: {
      ...facts,
      admissionFingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    },
    issues: [],
  }
}

export function createVNextPdfExportProductionRenderCompletionV1(input: {
  completionId: string
  admission: VNextPdfExportProductionAdmissionV1
  request: VNextPdfExportRequestV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
  receipt: VNextPdfExportReceiptV1
}): VNextPdfExportProductionRenderCompletionResultV1 {
  const issues: VNextPdfExportProductionBaselineIssueV1[] = []
  if (typeof input.completionId !== "string"
    || input.completionId.trim().length === 0
    || input.completionId.length > 512) {
    issues.push(issue(
      "production-completion-id-invalid",
      "completionId",
      "completionId must be nonblank and at most 512 characters",
    ))
  }
  const rebuiltAdmission = createVNextPdfExportProductionAdmissionV1({
    admissionId: input.admission.admissionId,
    request: input.request,
    currentSource: input.admission.exportIdentity.sourceIdentity,
    measuredDrawContract: input.measuredDrawContract,
    policy: input.admission.policy,
  })
  if (rebuiltAdmission.status !== "admitted") {
    rebuiltAdmission.issues.forEach((item, index) => issues.push(issue(
      "production-admission-revalidation-blocked",
      `admission.issues[${index}].${item.path}`,
      `${item.code}: ${item.message}`,
    )))
    return { status: "blocked", completion: null, issues }
  }
  if (JSON.stringify(rebuiltAdmission.admission) !== JSON.stringify(input.admission)) {
    issues.push(issue(
      "production-admission-content-mismatch",
      "admission",
      "production admission content drifted after pre-render acceptance",
    ))
  }
  if (issues.length > 0) return { status: "blocked", completion: null, issues }

  const phaseT = revalidateReceipt({
    request: input.request,
    currentSource: input.admission.exportIdentity.sourceIdentity,
    measuredDrawContract: input.measuredDrawContract,
    receipt: input.receipt,
  }, issues)
  if (phaseT == null) return { status: "blocked", completion: null, issues }
  if (phaseT.handoff.handoffFingerprint !== input.admission.exportIdentity.handoffFingerprint) {
    issues.push(issue(
      "production-admission-handoff-mismatch",
      "admission.exportIdentity.handoffFingerprint",
      "render receipt belongs to a different production admission handoff",
    ))
  }
  if (input.measuredDrawContract.status !== "consumable") {
    issues.push(issue(
      "measured-contract-blocked",
      "measuredDrawContract",
      "production render completion requires a consumable measured contract",
    ))
    return { status: "blocked", completion: null, issues }
  }
  const actual = {
    ...resourceFacts(input.measuredDrawContract),
    outputByteLength: phaseT.receipt.artifact.byteLength,
  }
  validateResourceFacts(actual, input.admission.policy.resources, issues)
  if (issues.length > 0) return { status: "blocked", completion: null, issues }

  const facts = {
    source: VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_PRODUCTION_RENDER_COMPLETION_V1_VERSION,
    kind: "pdf-export-production-render-completion" as const,
    completionId: input.completionId,
    admissionId: input.admission.admissionId,
    admissionFingerprint: input.admission.admissionFingerprint,
    idempotencyPayloadFingerprint: input.admission.idempotency.payloadFingerprint,
    exportIdentity: {
      exportRequestId: input.request.exportRequestId,
      artifactId: input.request.artifactId,
      requestFingerprint: input.request.requestFingerprint,
      handoffFingerprint: phaseT.handoff.handoffFingerprint,
      receiptFingerprint: phaseT.receipt.receiptFingerprint,
      sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
      sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
      rendererProfileId: input.request.measuredDrawContract.rendererProfileId,
      measurementProfileId: input.request.measuredDrawContract.measurementProfileId,
    },
    artifact: structuredClone(phaseT.receipt.artifact),
    resources: {
      actual,
      limits: structuredClone(input.admission.policy.resources),
      allWithinLimits: true as const,
    },
    storage: {
      ...storageFacts(),
      nextAction: "persist-content-addressed-bytes" as const,
    },
    activation: activationFacts(),
    contracts: {
      postRenderValidation: true as const,
      exactAdmissionRevalidated: true as const,
      exactReceiptRevalidated: true as const,
      readyForPersistence: true as const,
      carriesBytes: false as const,
      byteContentVerified: false as const,
      workerExecution: false as const,
      storageWrites: false as const,
      manifestOrJobMutation: false as const,
      observabilityWrites: false as const,
      backendRoute: false as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "ready-for-persistence",
    completion: {
      ...facts,
      completionFingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    },
    issues: [],
  }
}

export function createVNextPdfExportProductionBaselineV1(input: {
  baselineId: string
  request: VNextPdfExportRequestV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
  receipt: VNextPdfExportReceiptV1
  policy: VNextPdfExportProductionPolicyV1
}): VNextPdfExportProductionBaselineResultV1 {
  const issues: VNextPdfExportProductionBaselineIssueV1[] = []
  if (typeof input.baselineId !== "string" || input.baselineId.trim().length === 0 || input.baselineId.length > 512) {
    issues.push(issue("production-baseline-id-invalid", "baselineId", "baselineId must be nonblank and at most 512 characters"))
  }
  validatePolicy(input.policy, issues)
  const phaseT = revalidateReceipt(input, issues)
  if (input.measuredDrawContract.status !== "consumable") {
    issues.push(issue("measured-contract-blocked", "measuredDrawContract", "production baseline requires a consumable measured contract"))
  }
  if (phaseT == null || input.measuredDrawContract.status !== "consumable") {
    return { status: "blocked", baseline: null, issues }
  }

  const actual = {
    ...resourceFacts(input.measuredDrawContract),
    outputByteLength: phaseT.receipt.artifact.byteLength,
  }
  validateResourceFacts(actual, input.policy.resources, issues)
  if (issues.length > 0) return { status: "blocked", baseline: null, issues }

  const idempotencyFacts = {
    source: VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_SOURCE,
    scope: "source-revision-request-contract-and-policy",
    exportRequestId: input.request.exportRequestId,
    artifactId: input.request.artifactId,
    requestFingerprint: input.request.requestFingerprint,
    sourceIdentity: input.request.expectedSource,
    sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
    sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
    policy: input.policy,
  }
  const facts = {
    source: VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_PRODUCTION_BASELINE_V1_VERSION,
    kind: "pdf-export-production-baseline" as const,
    baselineId: input.baselineId,
    policy: structuredClone(input.policy),
    exportIdentity: {
      exportRequestId: input.request.exportRequestId,
      artifactId: input.request.artifactId,
      requestFingerprint: input.request.requestFingerprint,
      handoffFingerprint: phaseT.handoff.handoffFingerprint,
      receiptFingerprint: phaseT.receipt.receiptFingerprint,
      sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
      sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
    },
    idempotency: {
      payloadFingerprint: createVNextCompactFingerprint(JSON.stringify(idempotencyFacts)),
      backendKeyRequired: true as const,
      scope: "source-revision-request-contract-and-policy" as const,
      duplicateInFlight: "return-existing-operation" as const,
      duplicateTerminal: "return-existing-receipt" as const,
      conflictingPayload: "reject" as const,
      stageKeysDerivedByBackend: true as const,
    },
    lifecycle: {
      maxAttempts: input.policy.maxAttempts,
      executionDeadlineMs: input.policy.executionDeadlineMs,
      cancellationCheckpoints: [...CANCELLATION_CHECKPOINTS] as typeof CANCELLATION_CHECKPOINTS,
      midRenderCancellationRequired: true as const,
      drainPolicy: "reject-new-then-finish-or-cancel-in-flight" as const,
      automaticLoop: false as const,
      stopReasons: [...STOP_REASONS],
    },
    resources: {
      actual,
      limits: structuredClone(input.policy.resources),
      allWithinLimits: true as const,
      postRenderByteLimitRequired: true as const,
    },
    storage: {
      projectionTargets: [...STORAGE_TARGETS] as typeof STORAGE_TARGETS,
      commitOrder: [...STORAGE_COMMIT_ORDER] as typeof STORAGE_COMMIT_ORDER,
      metadataBeforeBytes: false as const,
      readAfterWriteIntegrityRequired: true as const,
      orphanCleanupPolicyRequired: true as const,
      writesExecuted: false as const,
    },
    observability: {
      requiredEvents: [...REQUIRED_EVENTS],
      requiredDimensions: [...REQUIRED_DIMENSIONS],
      sourceTextAllowed: false as const,
      pdfBytesAllowed: false as const,
      sinkBound: false as const,
    },
    activation: {
      status: "blocked" as const,
      requiredBindings: [...REQUIRED_BINDINGS],
      satisfiedBindings: [] as const,
      productionBinding: false as const,
    },
    contracts: {
      baselineOnly: true as const,
      revalidatesPhaseTReceipt: true as const,
      backendOwnsRuntimePolicy: true as const,
      workerExecution: false as const,
      deadlineExecution: false as const,
      cancellationExecution: false as const,
      storageWrites: false as const,
      manifestOrJobMutation: false as const,
      observabilityWrites: false as const,
      backendRoute: false as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "accepted",
    baseline: {
      ...facts,
      baselineFingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    },
    issues: [],
  }
}
