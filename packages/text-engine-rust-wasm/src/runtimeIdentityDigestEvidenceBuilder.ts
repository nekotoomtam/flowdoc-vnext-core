import {
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME,
  type FlowDocTextEngineRuntimeFontAssetIdentity,
  type FlowDocTextEngineRuntimeIdentityManifest,
} from "./runtimeIdentity.js"

export const FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_SOURCE =
  "flowdoc-text-engine-runtime-identity-digest-evidence-builder"
export const FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_MODE =
  "package-local-json-safe-digest-handoff"

export type FlowDocTextEngineRuntimeIdentityDigestStatus =
  | "pinned"
  | "pending"
  | "missing"
  | "stale"

export type FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderStatus = "ready" | "blocked"
export type FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueSeverity = "blocking" | "warning"

export type FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueCode =
  | "raw-evidence-in-root"
  | "missing-matrix-id"
  | "missing-corpus-id"
  | "missing-policy-revision"
  | "missing-runtime-identity-pointer"
  | "unexpected-adapter-package-name"
  | "measurement-profile-mismatch"
  | "output-shape-mismatch"
  | "digest-pending"
  | "digest-missing"
  | "digest-stale"

export interface FlowDocTextEngineRuntimeIdentityDigestEvidenceRetentionPointer {
  owner: "@flowdoc/text-engine-rust-wasm"
  pointer: string | null
  includedInRoot: false
}

export interface FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderInput {
  matrixId: string
  corpusId: string
  policyRevision: string
  expectedMeasurementProfileId: string
  expectedOutputShapeVersion: FlowDocTextEngineRuntimeIdentityManifest["outputShapeVersion"]
  runtimeIdentityManifest: FlowDocTextEngineRuntimeIdentityManifest
  runtimeIdentityPointer: string | null
  wasmArtifactPointer: string | null
  rawEvidenceIncluded?: boolean
}

export interface FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue {
  severity: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueSeverity
  code: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueCode
  message: string
  targetId?: string
}

export interface FlowDocTextEngineRuntimeIdentityDigestRootSummary {
  summaryId: "text-engine-runtime-identity-digest-root-summary-v1"
  matrixId: string
  corpusId: string
  policyRevision: string
  runtimeIdentityPolicyRevision: string
  measurementProfileId: string
  outputShapeVersion: FlowDocTextEngineRuntimeIdentityManifest["outputShapeVersion"]
  runtimeIdentityManifestId: string
  adapterPackageName: string
  digestStatus: FlowDocTextEngineRuntimeIdentityDigestStatus
  rawEvidenceIncluded: false
  evidenceOwner: "@flowdoc/text-engine-rust-wasm"
  rootSummaryOwner: "@flowdoc/vnext-core-docs"
  runtime: {
    rustybuzzRevision: string
    icu4xRevision: string
    icu4xDataRevision: string
  }
  wasmArtifact: {
    digestStatus: FlowDocTextEngineRuntimeIdentityDigestStatus
    sha256: string | null
  }
  fontAssetHashes: FlowDocTextEngineRuntimeFontAssetIdentity[]
  retention: {
    rawRuntimeIdentityEvidence: FlowDocTextEngineRuntimeIdentityDigestEvidenceRetentionPointer
    wasmArtifactEvidence: FlowDocTextEngineRuntimeIdentityDigestEvidenceRetentionPointer
  }
  blockedUntilLater: {
    nativeEvidence: true
    wasmEvidence: true
    paritySummaries: true
    rendererBackedDriftSummaries: true
    numericDriftThresholds: true
    acceptedSummaryManifest: true
  }
}

export interface FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_MODE
  status: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderStatus
  digestStatus: FlowDocTextEngineRuntimeIdentityDigestStatus
  digestStatusPolicy: {
    pinned: string
    pending: string
    missing: string
    stale: string
  }
  rootSummary: FlowDocTextEngineRuntimeIdentityDigestRootSummary
  executionContract: {
    importsWasm: false
    loadsWasm: false
    executesRustybuzz: false
    executesIcu4x: false
    executesNativeShaping: false
    comparesRuntimeOutput: false
    bindsProductionMeasurement: false
    mutatesPagination: false
    writesArtifacts: false
  }
  blockingIssues: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue[]
  warningIssues: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue[]
  nextSteps: string[]
}

function issue(
  severity: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueSeverity,
  code: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssueCode,
  message: string,
  targetId?: string,
): FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneFontAsset(asset: FlowDocTextEngineRuntimeFontAssetIdentity): FlowDocTextEngineRuntimeFontAssetIdentity {
  return { ...asset }
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function isBlank(value: string | null): boolean {
  return value == null || value.trim().length === 0
}

function hasIdentityMismatch(input: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderInput): boolean {
  return input.runtimeIdentityManifest.measurementProfileId !== input.expectedMeasurementProfileId
    || input.runtimeIdentityManifest.outputShapeVersion !== input.expectedOutputShapeVersion
}

function resolveDigestStatus(
  input: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderInput,
): FlowDocTextEngineRuntimeIdentityDigestStatus {
  const digest = input.runtimeIdentityManifest.runtime.wasmArtifact.sha256

  if (hasIdentityMismatch(input)) {
    return "stale"
  }

  if (input.runtimeIdentityManifest.runtime.wasmArtifact.digestStatus === "pending") {
    return isBlank(digest) ? "pending" : "stale"
  }

  if (digest == null || digest.trim().length === 0 || !isSha256(digest)) {
    return "missing"
  }

  return "pinned"
}

function createRetentionPointer(
  pointer: string | null,
): FlowDocTextEngineRuntimeIdentityDigestEvidenceRetentionPointer {
  return {
    owner: "@flowdoc/text-engine-rust-wasm",
    pointer,
    includedInRoot: false,
  }
}

export function createFlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan(
  input: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderInput,
): FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderPlan {
  const blockingIssues: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue[] = []
  const warningIssues: FlowDocTextEngineRuntimeIdentityDigestEvidenceBuilderIssue[] = []

  if (input.rawEvidenceIncluded === true) {
    blockingIssues.push(issue("blocking", "raw-evidence-in-root", "Digest builder handoff cannot include raw evidence in root summaries."))
  }

  if (input.matrixId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-matrix-id", "Digest builder handoff requires a matrix id."))
  }

  if (input.corpusId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-corpus-id", "Digest builder handoff requires a corpus id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Digest builder handoff requires a measurement evidence policy revision."))
  }

  if (isBlank(input.runtimeIdentityPointer)) {
    blockingIssues.push(issue("blocking", "missing-runtime-identity-pointer", "Digest builder handoff requires a package-local runtime identity retention pointer."))
  }

  if (input.runtimeIdentityManifest.adapterPackageName !== FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME) {
    blockingIssues.push(issue(
      "blocking",
      "unexpected-adapter-package-name",
      "Digest evidence builder must stay in the external text-engine package.",
      input.runtimeIdentityManifest.adapterPackageName,
    ))
  }

  if (input.runtimeIdentityManifest.measurementProfileId !== input.expectedMeasurementProfileId) {
    warningIssues.push(issue("warning", "measurement-profile-mismatch", "Digest summary is stale for the requested measurement profile."))
  }

  if (input.runtimeIdentityManifest.outputShapeVersion !== input.expectedOutputShapeVersion) {
    warningIssues.push(issue("warning", "output-shape-mismatch", "Digest summary is stale for the requested output shape."))
  }

  const digestStatus = resolveDigestStatus(input)

  if (digestStatus === "pending") {
    warningIssues.push(issue("warning", "digest-pending", "WASM artifact digest remains pending."))
  } else if (digestStatus === "missing") {
    blockingIssues.push(issue("blocking", "digest-missing", "WASM artifact digest is missing or invalid for a pinned claim."))
  } else if (digestStatus === "stale") {
    blockingIssues.push(issue("blocking", "digest-stale", "Runtime identity digest summary is stale for the requested profile or output shape."))
  }

  return {
    source: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_MODE,
    status: blockingIssues.length > 0 ? "blocked" : "ready",
    digestStatus,
    digestStatusPolicy: {
      pinned: "WASM artifact digest is a lowercase sha256 and runtime identity matches the requested matrix/profile/output shape.",
      pending: "Runtime identity is present but the WASM artifact digest is not pinned yet.",
      missing: "A pinned digest claim is missing a valid sha256 artifact digest.",
      stale: "Runtime identity, measurement profile, output shape, or digest declaration no longer matches the requested evidence context.",
    },
    rootSummary: {
      summaryId: "text-engine-runtime-identity-digest-root-summary-v1",
      matrixId: input.matrixId,
      corpusId: input.corpusId,
      policyRevision: input.policyRevision,
      runtimeIdentityPolicyRevision: input.runtimeIdentityManifest.policyRevision,
      measurementProfileId: input.runtimeIdentityManifest.measurementProfileId,
      outputShapeVersion: input.runtimeIdentityManifest.outputShapeVersion,
      runtimeIdentityManifestId: input.runtimeIdentityManifest.manifestId,
      adapterPackageName: input.runtimeIdentityManifest.adapterPackageName,
      digestStatus,
      rawEvidenceIncluded: false,
      evidenceOwner: "@flowdoc/text-engine-rust-wasm",
      rootSummaryOwner: "@flowdoc/vnext-core-docs",
      runtime: {
        rustybuzzRevision: input.runtimeIdentityManifest.runtime.rustybuzzRevision,
        icu4xRevision: input.runtimeIdentityManifest.runtime.icu4xRevision,
        icu4xDataRevision: input.runtimeIdentityManifest.runtime.icu4xDataRevision,
      },
      wasmArtifact: {
        digestStatus,
        sha256: input.runtimeIdentityManifest.runtime.wasmArtifact.sha256,
      },
      fontAssetHashes: input.runtimeIdentityManifest.fontAssets.map(cloneFontAsset),
      retention: {
        rawRuntimeIdentityEvidence: createRetentionPointer(input.runtimeIdentityPointer),
        wasmArtifactEvidence: createRetentionPointer(input.wasmArtifactPointer),
      },
      blockedUntilLater: {
        nativeEvidence: true,
        wasmEvidence: true,
        paritySummaries: true,
        rendererBackedDriftSummaries: true,
        numericDriftThresholds: true,
        acceptedSummaryManifest: true,
      },
    },
    executionContract: {
      importsWasm: false,
      loadsWasm: false,
      executesRustybuzz: false,
      executesIcu4x: false,
      executesNativeShaping: false,
      comparesRuntimeOutput: false,
      bindsProductionMeasurement: false,
      mutatesPagination: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Populate or pin the package-local WASM artifact digest in a later external evidence phase.",
      "Keep native evidence, WASM evidence, parity summaries, renderer drift, thresholds, and accepted manifests blocked until their dedicated phases.",
      "Hand root docs/tests only the JSON-safe rootSummary object and retention pointer shape.",
    ],
  }
}
