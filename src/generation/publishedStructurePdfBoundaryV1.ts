import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  sameVNextPublishedStructureVersionRefV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"
import {
  VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE,
  type VNextPublishedStructureGenerationRuntimeReadyV1,
  type VNextPublishedStructureGenerationRuntimeResultV1,
} from "./publishedStructureGenerationRuntimeV1.js"

export const VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE = (
  "vnext-published-structure-pdf-boundary"
) as const
export const VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION = 1 as const

const SHA256 = /^sha256:[a-f0-9]{64}$/u

export interface VNextPublishedStructurePdfBoundarySourceOwnerV1 {
  sourcePackageId: string | null
  sessionId: string | null
}

export interface VNextPublishedStructurePdfBoundaryPublishedStructureV1 {
  structureVersion: VNextPublishedStructureVersionRefV1
  structureFingerprint: string
}

export interface VNextPublishedStructurePdfBoundaryExportV1 {
  exportRequestId: string
  artifactId: string
  requestedAt: string
}

export interface VNextPublishedStructurePdfBoundaryProfilesV1 {
  materializationProfileId: string
  resolutionProfileId: string
  measurementProfileId: string
  paginationProfileId: string
  rendererProfileId: string
}

export interface VNextPublishedStructurePdfBoundaryPlanCreateInputV1 {
  generationRuntime: VNextPublishedStructureGenerationRuntimeResultV1
  publishedStructure: VNextPublishedStructurePdfBoundaryPublishedStructureV1
  pdfExport: VNextPublishedStructurePdfBoundaryExportV1
  sourceOwner: VNextPublishedStructurePdfBoundarySourceOwnerV1
  profiles: VNextPublishedStructurePdfBoundaryProfilesV1
}

export interface VNextPublishedStructurePdfBoundaryIssueV1 {
  severity: "error"
  code:
    | "generation-runtime-blocked"
    | "generation-runtime-fingerprint-invalid"
    | "published-structure-fingerprint-invalid"
    | "published-structure-version-mismatch"
    | "export-request-id-invalid"
    | "artifact-id-invalid"
    | "requested-at-invalid"
    | "source-owner-invalid"
    | "source-owner-missing"
    | "profile-id-invalid"
  path: string
  message: string
}

export type VNextPublishedStructurePdfBoundaryStageStatusV1 =
  | "accepted"
  | "required-not-run"
  | "blocked-until-measured-draw-contract"
  | "blocked-until-pdf-export-request"
  | "external-not-run"
  | "backend-not-run"

export interface VNextPublishedStructurePdfBoundaryPlanV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION
  kind: "published-structure-pdf-boundary-plan"
  status: "ready" | "ready-with-warnings"
  output: {
    format: "pdf"
    mediaType: "application/pdf"
  }
  pdfExport: VNextPublishedStructurePdfBoundaryExportV1
  sourceOwner: VNextPublishedStructurePdfBoundarySourceOwnerV1
  profiles: VNextPublishedStructurePdfBoundaryProfilesV1
  generation: {
    runtimeSource: typeof VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE
    runtimeStatus: VNextPublishedStructureGenerationRuntimeReadyV1["status"]
    runtimeReceiptFingerprint: string
    inputPlanFingerprint: string
    canonicalInputFingerprint: string
    canonicalContentFingerprint: string
    lane: VNextPublishedStructureGenerationRuntimeReadyV1["lane"]
    mappingProfile: VNextPublishedStructureGenerationRuntimeReadyV1["mappingProfile"]
    diagnosticsFingerprint: string
    warningCount: number
  }
  instance: VNextDocumentInstanceIdentityV1
  publishedStructure: VNextPublishedStructurePdfBoundaryPublishedStructureV1
  materializationInput: {
    dataSnapshotId: string
    collectionSnapshotIds: string[]
    mediaSnapshotId: string
    canonicalInputFingerprint: string
    canonicalContentFingerprint: string
  }
  stages: {
    generationRuntime: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "accepted">
    materialization: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "required-not-run">
    resolution: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "required-not-run">
    measurement: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "required-not-run">
    pagination: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "required-not-run">
    pdfMeasuredDrawContract: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "required-not-run">
    pdfExportRequest: Extract<
      VNextPublishedStructurePdfBoundaryStageStatusV1,
      "blocked-until-measured-draw-contract"
    >
    pdfExportHandoff: Extract<
      VNextPublishedStructurePdfBoundaryStageStatusV1,
      "blocked-until-pdf-export-request"
    >
    rendererExecution: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "external-not-run">
    artifactPersistence: Extract<VNextPublishedStructurePdfBoundaryStageStatusV1, "backend-not-run">
  }
  prerequisites: {
    materialization: {
      consumesCanonicalSnapshots: true
      consumesPublishedStructure: true
      mayUseBrowserState: false
    }
    pdfExportRequest: {
      requiresSourceDocumentFingerprint: true
      requiresConsumableMeasuredDrawContract: true
    }
    pdfExportHandoff: {
      consumes: "vnext-pdf-measured-draw-contract-v1"
      sourceRevisionPinned: true
      sourceFingerprintPinned: true
      measuredContractContentPinned: true
    }
  }
  ownership: {
    core: string[]
    backend: string[]
    renderer: string[]
    editor: string[]
  }
  contracts: {
    contentFreePlan: true
    rawPayloadRetained: false
    businessValuesRetained: false
    consumesPublishedStructureRuntimeReceipt: true
    requiresPdfMeasuredDrawContractBeforeHandoff: true
    layoutFactsAcceptedFromCaller: false
    rendererFactsAcceptedFromCaller: false
    backendOwnsApiKeysAndStorage: true
    rendererOwnsPdfBytes: true
    productionBinding: false
  }
  execution: {
    materialization: false
    resolution: false
    measurement: false
    pagination: false
    pdfMeasuredDrawContract: false
    pdfExportRequestCreated: false
    pdfExportHandoffCreated: false
    rendererExecution: false
    pdfBytesProduced: false
    storageWrites: false
    backendRoute: false
    workerOrQueue: false
    apiKeyExposure: false
    productionBinding: false
  }
  summary: {
    scalarValueCount: number
    collectionSnapshotCount: number
    collectionItemCount: number
    mediaAssetCount: number
    warningCount: number
    stageCount: 10
  }
  planFingerprint: string
}

export type VNextPublishedStructurePdfBoundaryPlanResultV1 =
  | {
      source: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE
      contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION
      kind: "published-structure-pdf-boundary-plan-result"
      status: "ready" | "ready-with-warnings"
      plan: VNextPublishedStructurePdfBoundaryPlanV1
      issues: []
    }
  | {
      source: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE
      contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION
      kind: "published-structure-pdf-boundary-plan-result"
      status: "blocked"
      plan: null
      issues: VNextPublishedStructurePdfBoundaryIssueV1[]
    }

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]),
  )
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(canonicalValue(value)))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: VNextPublishedStructurePdfBoundaryIssueV1["code"],
  path: string,
  message: string,
): VNextPublishedStructurePdfBoundaryIssueV1 {
  return { severity: "error", code, path, message }
}

function nonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function validDate(value: unknown): value is string {
  return nonBlank(value) && !Number.isNaN(Date.parse(value))
}

function validateNullableOwner(
  value: string | null,
  path: string,
  issues: VNextPublishedStructurePdfBoundaryIssueV1[],
): string | null {
  if (value == null) return null
  if (nonBlank(value)) return value
  issues.push(issue("source-owner-invalid", path, `${path} must be null or nonblank`))
  return null
}

function validateProfileId(
  value: string,
  path: string,
  issues: VNextPublishedStructurePdfBoundaryIssueV1[],
): void {
  if (!nonBlank(value)) issues.push(issue("profile-id-invalid", path, `${path} must be nonblank`))
}

function baseResult(
  status: "blocked",
  plan: null,
  issues: VNextPublishedStructurePdfBoundaryIssueV1[],
): VNextPublishedStructurePdfBoundaryPlanResultV1
function baseResult(
  status: "ready" | "ready-with-warnings",
  plan: VNextPublishedStructurePdfBoundaryPlanV1,
  issues: [],
): VNextPublishedStructurePdfBoundaryPlanResultV1
function baseResult(
  status: "ready" | "ready-with-warnings" | "blocked",
  plan: VNextPublishedStructurePdfBoundaryPlanV1 | null,
  issues: VNextPublishedStructurePdfBoundaryIssueV1[],
): VNextPublishedStructurePdfBoundaryPlanResultV1 {
  return {
    source: VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION,
    kind: "published-structure-pdf-boundary-plan-result",
    status,
    plan,
    issues,
  } as VNextPublishedStructurePdfBoundaryPlanResultV1
}

function ownership(): VNextPublishedStructurePdfBoundaryPlanV1["ownership"] {
  return {
    core: [
      "published-structure-generation-runtime-validation",
      "document-instance-materialization-contract",
      "scoped-document-resolution-contract",
      "measurement-request-contract",
      "pagination-contract",
      "pdf-measured-draw-contract",
      "pdf-export-handoff-contract",
    ],
    backend: [
      "api-key-gateway",
      "transport",
      "revision-gate",
      "durable-artifact-job",
      "artifact-manifest-storage",
      "artifact-byte-storage",
    ],
    renderer: [
      "font-byte-loading",
      "image-byte-loading",
      "pdf-byte-rendering",
    ],
    editor: [
      "browser-ui-state",
      "data-input-surface",
      "export-trigger-surface",
    ],
  }
}

function contracts(): VNextPublishedStructurePdfBoundaryPlanV1["contracts"] {
  return {
    contentFreePlan: true,
    rawPayloadRetained: false,
    businessValuesRetained: false,
    consumesPublishedStructureRuntimeReceipt: true,
    requiresPdfMeasuredDrawContractBeforeHandoff: true,
    layoutFactsAcceptedFromCaller: false,
    rendererFactsAcceptedFromCaller: false,
    backendOwnsApiKeysAndStorage: true,
    rendererOwnsPdfBytes: true,
    productionBinding: false,
  }
}

function execution(): VNextPublishedStructurePdfBoundaryPlanV1["execution"] {
  return {
    materialization: false,
    resolution: false,
    measurement: false,
    pagination: false,
    pdfMeasuredDrawContract: false,
    pdfExportRequestCreated: false,
    pdfExportHandoffCreated: false,
    rendererExecution: false,
    pdfBytesProduced: false,
    storageWrites: false,
    backendRoute: false,
    workerOrQueue: false,
    apiKeyExposure: false,
    productionBinding: false,
  }
}

function stages(): VNextPublishedStructurePdfBoundaryPlanV1["stages"] {
  return {
    generationRuntime: "accepted",
    materialization: "required-not-run",
    resolution: "required-not-run",
    measurement: "required-not-run",
    pagination: "required-not-run",
    pdfMeasuredDrawContract: "required-not-run",
    pdfExportRequest: "blocked-until-measured-draw-contract",
    pdfExportHandoff: "blocked-until-pdf-export-request",
    rendererExecution: "external-not-run",
    artifactPersistence: "backend-not-run",
  }
}

function prerequisites(): VNextPublishedStructurePdfBoundaryPlanV1["prerequisites"] {
  return {
    materialization: {
      consumesCanonicalSnapshots: true,
      consumesPublishedStructure: true,
      mayUseBrowserState: false,
    },
    pdfExportRequest: {
      requiresSourceDocumentFingerprint: true,
      requiresConsumableMeasuredDrawContract: true,
    },
    pdfExportHandoff: {
      consumes: "vnext-pdf-measured-draw-contract-v1",
      sourceRevisionPinned: true,
      sourceFingerprintPinned: true,
      measuredContractContentPinned: true,
    },
  }
}

function validateReadyRuntimePins(
  runtime: VNextPublishedStructureGenerationRuntimeReadyV1,
  publishedStructure: VNextPublishedStructurePdfBoundaryPublishedStructureV1,
  issues: VNextPublishedStructurePdfBoundaryIssueV1[],
): void {
  if (!SHA256.test(runtime.receiptFingerprint)) issues.push(issue(
    "generation-runtime-fingerprint-invalid",
    "generationRuntime.receiptFingerprint",
    "generation runtime receipt must be a sha256 fingerprint",
  ))
  if (!SHA256.test(runtime.planFingerprint)) issues.push(issue(
    "generation-runtime-fingerprint-invalid",
    "generationRuntime.planFingerprint",
    "generation runtime plan must be a sha256 fingerprint",
  ))
  if (!SHA256.test(runtime.canonicalInputFingerprint)) issues.push(issue(
    "generation-runtime-fingerprint-invalid",
    "generationRuntime.canonicalInputFingerprint",
    "generation runtime canonical input must be a sha256 fingerprint",
  ))
  if (!SHA256.test(runtime.canonicalContentFingerprint)) issues.push(issue(
    "generation-runtime-fingerprint-invalid",
    "generationRuntime.canonicalContentFingerprint",
    "generation runtime canonical content must be a sha256 fingerprint",
  ))
  if (!SHA256.test(publishedStructure.structureFingerprint)) issues.push(issue(
    "published-structure-fingerprint-invalid",
    "publishedStructure.structureFingerprint",
    "published structure must be pinned by a sha256 fingerprint",
  ))
  if (!sameVNextPublishedStructureVersionRefV1(
    publishedStructure.structureVersion,
    runtime.canonicalInput.dataSnapshot.instance.structureVersion,
  )) issues.push(issue(
    "published-structure-version-mismatch",
    "publishedStructure.structureVersion",
    "published structure must match the accepted generation runtime instance",
  ))
}

export function createVNextPublishedStructurePdfBoundaryPlanV1(
  input: VNextPublishedStructurePdfBoundaryPlanCreateInputV1,
): VNextPublishedStructurePdfBoundaryPlanResultV1 {
  const issues: VNextPublishedStructurePdfBoundaryIssueV1[] = []

  if (input.generationRuntime.status === "blocked") {
    issues.push(issue(
      "generation-runtime-blocked",
      "generationRuntime",
      `generation runtime blocked before PDF planning with ${input.generationRuntime.diagnostics.summary.errorCount} error(s)`,
    ))
  }

  const sourcePackageId = validateNullableOwner(
    input.sourceOwner.sourcePackageId,
    "sourceOwner.sourcePackageId",
    issues,
  )
  const sessionId = validateNullableOwner(input.sourceOwner.sessionId, "sourceOwner.sessionId", issues)
  if (sourcePackageId == null && sessionId == null) {
    issues.push(issue(
      "source-owner-missing",
      "sourceOwner",
      "sourcePackageId or sessionId must identify the downstream source owner",
    ))
  }

  if (!nonBlank(input.pdfExport.exportRequestId)) {
    issues.push(issue("export-request-id-invalid", "pdfExport.exportRequestId", "exportRequestId must be nonblank"))
  }
  if (!nonBlank(input.pdfExport.artifactId)) {
    issues.push(issue("artifact-id-invalid", "pdfExport.artifactId", "artifactId must be nonblank"))
  }
  if (!validDate(input.pdfExport.requestedAt)) {
    issues.push(issue("requested-at-invalid", "pdfExport.requestedAt", "requestedAt must be a parseable date"))
  }

  validateProfileId(input.profiles.materializationProfileId, "profiles.materializationProfileId", issues)
  validateProfileId(input.profiles.resolutionProfileId, "profiles.resolutionProfileId", issues)
  validateProfileId(input.profiles.measurementProfileId, "profiles.measurementProfileId", issues)
  validateProfileId(input.profiles.paginationProfileId, "profiles.paginationProfileId", issues)
  validateProfileId(input.profiles.rendererProfileId, "profiles.rendererProfileId", issues)

  if (input.generationRuntime.status !== "blocked") {
    validateReadyRuntimePins(input.generationRuntime, input.publishedStructure, issues)
  }

  if (issues.length > 0 || input.generationRuntime.status === "blocked") {
    return baseResult("blocked", null, issues)
  }

  const runtime = input.generationRuntime
  const planStatus = runtime.status
  const unsigned: Omit<VNextPublishedStructurePdfBoundaryPlanV1, "planFingerprint"> = {
    source: VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_PDF_BOUNDARY_V1_VERSION,
    kind: "published-structure-pdf-boundary-plan",
    status: planStatus,
    output: { format: "pdf", mediaType: "application/pdf" },
    pdfExport: clone(input.pdfExport),
    sourceOwner: { sourcePackageId, sessionId },
    profiles: clone(input.profiles),
    generation: {
      runtimeSource: VNEXT_PUBLISHED_STRUCTURE_GENERATION_RUNTIME_SOURCE,
      runtimeStatus: runtime.status,
      runtimeReceiptFingerprint: runtime.receiptFingerprint,
      inputPlanFingerprint: runtime.planFingerprint,
      canonicalInputFingerprint: runtime.canonicalInputFingerprint,
      canonicalContentFingerprint: runtime.canonicalContentFingerprint,
      lane: runtime.lane,
      mappingProfile: clone(runtime.mappingProfile),
      diagnosticsFingerprint: runtime.diagnostics.diagnosticsFingerprint,
      warningCount: runtime.diagnostics.summary.warningCount,
    },
    instance: clone(runtime.canonicalInput.dataSnapshot.instance),
    publishedStructure: clone(input.publishedStructure),
    materializationInput: {
      dataSnapshotId: runtime.canonicalInput.dataSnapshot.dataSnapshotId,
      collectionSnapshotIds: runtime.canonicalInput.collectionSnapshots
        .map((snapshot) => snapshot.collectionSnapshotId)
        .sort((left, right) => left.localeCompare(right)),
      mediaSnapshotId: runtime.canonicalInput.mediaSnapshot.mediaSnapshotId,
      canonicalInputFingerprint: runtime.canonicalInputFingerprint,
      canonicalContentFingerprint: runtime.canonicalContentFingerprint,
    },
    stages: stages(),
    prerequisites: prerequisites(),
    ownership: ownership(),
    contracts: contracts(),
    execution: execution(),
    summary: {
      scalarValueCount: runtime.diagnostics.summary.scalarValueCount,
      collectionSnapshotCount: runtime.diagnostics.summary.collectionSnapshotCount,
      collectionItemCount: runtime.diagnostics.summary.collectionItemCount,
      mediaAssetCount: runtime.diagnostics.summary.mediaAssetCount,
      warningCount: runtime.diagnostics.summary.warningCount,
      stageCount: 10,
    },
  }

  return baseResult(planStatus, { ...unsigned, planFingerprint: fingerprint(unsigned) }, [])
}
