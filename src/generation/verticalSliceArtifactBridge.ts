import type {
  VNextArtifactJobRecord,
} from "./artifactJob.js"
import type { VNextArtifactManifestRecord } from "./artifactManifest.js"
import type {
  VNextVerticalSliceRcArtifactSummary,
  VNextVerticalSliceRcDigestStatus,
} from "./verticalSliceRc.js"

export const VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_SOURCE = "vnext-vertical-slice-artifact-bridge"
export const VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_MODE = "rc-artifact-summary-bridge"

export type VNextVerticalSliceArtifactBridgeStatus = "ready" | "failed" | "blocked"
export type VNextVerticalSliceArtifactBridgeIssueSeverity = "warning" | "blocking"

export interface VNextVerticalSlicePdfSpikeManifestSummary {
  status: "rendered" | "blocked"
  artifactId: string
  format: "pdf"
  mediaType: string | null
  byteLength: number | null
  sha256: string | null
  rendererProfileId: string
  measurementProfileId: string
  storageStatus: "not-stored" | string
  localOnly: boolean
}

export interface VNextVerticalSliceArtifactBridgeInput {
  artifactId: string
  rendererProfileId: string
  measurementProfileId: string
  pdfSpikeManifest: VNextVerticalSlicePdfSpikeManifestSummary
  artifactManifest: VNextArtifactManifestRecord | null
  artifactJob: VNextArtifactJobRecord | null
}

export interface VNextVerticalSliceArtifactBridgeIssue {
  severity: VNextVerticalSliceArtifactBridgeIssueSeverity
  code: string
  path: string
  message: string
}

export interface VNextVerticalSliceArtifactBridgeResult {
  source: typeof VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_SOURCE
  mode: typeof VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_MODE
  status: VNextVerticalSliceArtifactBridgeStatus
  summary: VNextVerticalSliceRcArtifactSummary
  jobStatus: VNextArtifactJobRecord["status"] | "missing"
  issues: readonly VNextVerticalSliceArtifactBridgeIssue[]
  contracts: {
    summaryOnly: true
    coreImportsPdfSpike: false
    fileWrites: false
    storageWrites: false
    backendRoute: false
    rendererExecution: false
    docxOutput: false
    productionFidelity: false
    packageSchemaChange: false
  }
}

export function createVNextVerticalSliceArtifactBridgeSummary(
  input: VNextVerticalSliceArtifactBridgeInput,
): VNextVerticalSliceArtifactBridgeResult {
  const issues: VNextVerticalSliceArtifactBridgeIssue[] = []
  const manifest = input.artifactManifest
  const job = input.artifactJob

  requireNonEmpty(input.artifactId, "artifactId", issues)
  requireNonEmpty(input.rendererProfileId, "rendererProfileId", issues)
  requireNonEmpty(input.measurementProfileId, "measurementProfileId", issues)
  validateSpike(input, issues)
  validateManifest(input, issues)
  validateJob(input, issues)

  const digestStatus: VNextVerticalSliceRcDigestStatus = input.pdfSpikeManifest.sha256 == null ? "missing" : "present"
  const hasBlocking = issues.some((item) => item.severity === "blocking")
  const isFailed = input.pdfSpikeManifest.status === "blocked" || manifest?.status === "failed" || job?.status === "failed"
  const status: VNextVerticalSliceArtifactBridgeStatus = hasBlocking ? "blocked" : isFailed ? "failed" : "ready"

  return {
    source: VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_SOURCE,
    mode: VNEXT_VERTICAL_SLICE_ARTIFACT_BRIDGE_MODE,
    status,
    summary: {
      status: status === "ready" ? "rendered" : status,
      artifactId: input.artifactId,
      format: input.pdfSpikeManifest.format,
      mediaType: input.pdfSpikeManifest.mediaType,
      byteLength: input.pdfSpikeManifest.byteLength,
      sha256: input.pdfSpikeManifest.sha256,
      digestStatus,
      storageStatus: input.pdfSpikeManifest.storageStatus,
      spikeGrade: true,
    },
    jobStatus: job?.status ?? "missing",
    issues,
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
  }
}

function validateSpike(
  input: VNextVerticalSliceArtifactBridgeInput,
  issues: VNextVerticalSliceArtifactBridgeIssue[],
): void {
  const spike = input.pdfSpikeManifest
  if (spike.artifactId !== input.artifactId) {
    issues.push(issue("blocking", "spike-artifact-id-mismatch", "pdfSpikeManifest.artifactId", "PDF spike artifactId must match the bridge artifactId"))
  }
  if (spike.rendererProfileId !== input.rendererProfileId) {
    issues.push(issue("blocking", "spike-renderer-profile-mismatch", "pdfSpikeManifest.rendererProfileId", "PDF spike rendererProfileId must match the bridge rendererProfileId"))
  }
  if (spike.measurementProfileId !== input.measurementProfileId) {
    issues.push(issue("blocking", "spike-measurement-profile-mismatch", "pdfSpikeManifest.measurementProfileId", "PDF spike measurementProfileId must match the bridge measurementProfileId"))
  }
  if (spike.status === "rendered") {
    if (spike.byteLength == null || spike.byteLength <= 0) {
      issues.push(issue("blocking", "missing-byte-length", "pdfSpikeManifest.byteLength", "rendered PDF spike output requires positive byteLength"))
    }
    if (spike.sha256 == null || spike.sha256.trim().length === 0) {
      issues.push(issue("blocking", "missing-sha256", "pdfSpikeManifest.sha256", "rendered PDF spike output requires sha256"))
    }
    if (spike.mediaType !== "application/pdf") {
      issues.push(issue("blocking", "invalid-media-type", "pdfSpikeManifest.mediaType", "RC PDF artifact bridge requires application/pdf mediaType"))
    }
  }
  if (spike.storageStatus !== "not-stored") {
    issues.push(issue("blocking", "unexpected-spike-storage-status", "pdfSpikeManifest.storageStatus", "PDF spike summary must remain not-stored before storage simulation"))
  }
  if (!spike.localOnly) {
    issues.push(issue("warning", "spike-not-local-only", "pdfSpikeManifest.localOnly", "PDF spike artifact should remain local-only evidence"))
  }
}

function validateManifest(
  input: VNextVerticalSliceArtifactBridgeInput,
  issues: VNextVerticalSliceArtifactBridgeIssue[],
): void {
  const manifest = input.artifactManifest
  if (manifest == null) {
    issues.push(issue("blocking", "missing-artifact-manifest", "artifactManifest", "artifact manifest record is required"))
    return
  }
  if (manifest.artifactId !== input.artifactId) {
    issues.push(issue("blocking", "manifest-artifact-id-mismatch", "artifactManifest.artifactId", "artifact manifest id must match the bridge artifactId"))
  }
  if (manifest.rendererProfileId !== input.rendererProfileId) {
    issues.push(issue("blocking", "manifest-renderer-profile-mismatch", "artifactManifest.rendererProfileId", "artifact manifest rendererProfileId must match the bridge rendererProfileId"))
  }
  if (manifest.measurementProfileId !== input.measurementProfileId) {
    issues.push(issue("blocking", "manifest-measurement-profile-mismatch", "artifactManifest.measurementProfileId", "artifact manifest measurementProfileId must match the bridge measurementProfileId"))
  }
  if (manifest.storageStatus !== "not-written") {
    issues.push(issue("blocking", "unexpected-manifest-storage-status", "artifactManifest.storageStatus", "artifact manifest must remain not-written before storage simulation"))
  }
  if (manifest.status === "rendered" && input.pdfSpikeManifest.status === "rendered") {
    if (manifest.byteLength !== input.pdfSpikeManifest.byteLength) {
      issues.push(issue("blocking", "manifest-byte-length-mismatch", "artifactManifest.byteLength", "artifact manifest byteLength must match PDF spike output"))
    }
    if (manifest.sha256 !== input.pdfSpikeManifest.sha256) {
      issues.push(issue("blocking", "manifest-sha256-mismatch", "artifactManifest.sha256", "artifact manifest sha256 must match PDF spike output"))
    }
  }
}

function validateJob(
  input: VNextVerticalSliceArtifactBridgeInput,
  issues: VNextVerticalSliceArtifactBridgeIssue[],
): void {
  const job = input.artifactJob
  if (job == null) {
    issues.push(issue("blocking", "missing-artifact-job", "artifactJob", "artifact job record is required"))
    return
  }
  if (job.artifact.artifactId !== input.artifactId) {
    issues.push(issue("blocking", "job-artifact-id-mismatch", "artifactJob.artifact.artifactId", "artifact job id must match the bridge artifactId"))
  }
  if (job.profiles.rendererProfileId !== input.rendererProfileId) {
    issues.push(issue("blocking", "job-renderer-profile-mismatch", "artifactJob.profiles.rendererProfileId", "artifact job rendererProfileId must match the bridge rendererProfileId"))
  }
  if (job.profiles.measurementProfileId !== input.measurementProfileId) {
    issues.push(issue("blocking", "job-measurement-profile-mismatch", "artifactJob.profiles.measurementProfileId", "artifact job measurementProfileId must match the bridge measurementProfileId"))
  }
  if (job.status !== "rendered" && job.status !== "failed") {
    issues.push(issue("warning", "job-not-terminal", "artifactJob.status", "artifact job is not terminal yet"))
  }
}

function requireNonEmpty(
  value: string,
  path: string,
  issues: VNextVerticalSliceArtifactBridgeIssue[],
): void {
  if (value.trim().length === 0) {
    issues.push(issue("blocking", "missing-string", path, `${path} is required`))
  }
}

function issue(
  severity: VNextVerticalSliceArtifactBridgeIssueSeverity,
  code: string,
  path: string,
  message: string,
): VNextVerticalSliceArtifactBridgeIssue {
  return { severity, code, path, message }
}
