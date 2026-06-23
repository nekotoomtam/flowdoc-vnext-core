import type { VNextTextEngineAdapterOutputShapeVersion } from "@flowdoc/vnext-core"

export const FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_SOURCE = "flowdoc-text-engine-runtime-identity"
export const FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_MODE = "runtime-parity-digest-boundary"

export type FlowDocTextEngineRuntimeIdentityStatus = "identity-ready" | "parity-ready" | "blocked"
export type FlowDocTextEngineRuntimeIdentityIssueSeverity = "blocking" | "warning"
export type FlowDocTextEngineRuntimeTarget = "node-native" | "browser-wasm" | "worker-wasm"
export type FlowDocTextEngineRuntimeParityStatus = "identity-only" | "parity-ready"
export type FlowDocTextEngineRuntimeWasmDigestStatus = "pending" | "pinned"
export type FlowDocTextEngineRuntimeComparisonStatus = "not-run" | "matching" | "mismatch"
export type FlowDocTextEngineRuntimeComparedFact =
  | "glyph-id"
  | "glyph-advance"
  | "cluster-map"
  | "line-box"

export type FlowDocTextEngineRuntimeIdentityIssueCode =
  | "production-binding"
  | "missing-manifest-id"
  | "missing-policy-revision"
  | "missing-adapter-package-name"
  | "unexpected-adapter-package-name"
  | "missing-measurement-profile-id"
  | "unsupported-output-shape"
  | "missing-runtime-target"
  | "missing-node-native-target"
  | "missing-wasm-target"
  | "missing-rustybuzz-revision"
  | "missing-icu4x-revision"
  | "missing-icu4x-data-revision"
  | "missing-wasm-digest"
  | "invalid-wasm-digest"
  | "missing-font-assets"
  | "missing-font-id"
  | "invalid-font-hash"
  | "parity-ready-without-matching-comparison"
  | "missing-compared-fact"

export interface FlowDocTextEngineRuntimeWasmArtifactIdentity {
  digestStatus: FlowDocTextEngineRuntimeWasmDigestStatus
  sha256: string | null
}

export interface FlowDocTextEngineRuntimeIdentityRuntime {
  rustybuzzRevision: string
  icu4xRevision: string
  icu4xDataRevision: string
  wasmArtifact: FlowDocTextEngineRuntimeWasmArtifactIdentity
}

export interface FlowDocTextEngineRuntimeFontAssetIdentity {
  fontId: string
  sha256: string
}

export interface FlowDocTextEngineRuntimeParityComparison {
  status: FlowDocTextEngineRuntimeComparisonStatus
  nativeTarget: "node-native"
  wasmTargets: readonly Extract<FlowDocTextEngineRuntimeTarget, "browser-wasm" | "worker-wasm">[]
  comparedFacts: readonly FlowDocTextEngineRuntimeComparedFact[]
}

export interface FlowDocTextEngineRuntimeIdentityManifest {
  manifestId: string
  policyRevision: string
  adapterPackageName: string
  measurementProfileId: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  parityStatus: FlowDocTextEngineRuntimeParityStatus
  runtimeTargets: readonly FlowDocTextEngineRuntimeTarget[]
  runtime: FlowDocTextEngineRuntimeIdentityRuntime
  fontAssets: readonly FlowDocTextEngineRuntimeFontAssetIdentity[]
  parityComparison: FlowDocTextEngineRuntimeParityComparison
  warnings?: readonly string[]
}

export interface FlowDocTextEngineRuntimeIdentityIssue {
  severity: FlowDocTextEngineRuntimeIdentityIssueSeverity
  code: FlowDocTextEngineRuntimeIdentityIssueCode
  message: string
  targetId?: string
}

export interface FlowDocTextEngineRuntimeIdentityPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_MODE
  status: FlowDocTextEngineRuntimeIdentityStatus
  manifestId: string
  policyRevision: string
  adapterPackageName: string
  measurementProfileId: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  parityStatus: FlowDocTextEngineRuntimeParityStatus
  runtimeTargets: FlowDocTextEngineRuntimeTarget[]
  runtime: FlowDocTextEngineRuntimeIdentityRuntime
  fontAssets: FlowDocTextEngineRuntimeFontAssetIdentity[]
  parityComparison: FlowDocTextEngineRuntimeParityComparison
  identityContract: {
    pinsRustybuzzRevision: true
    pinsIcu4xRevision: true
    pinsIcu4xDataRevision: true
    pinsFontHashes: true
    pinsWasmDigestBeforeParityReady: true
    measurementProfileCarriesFontShaperSegmenterIdentity: true
    wasmDigestStaysRuntimeIdentityEvidence: true
  }
  executionContract: {
    importsWasm: false
    loadsWasm: false
    executesNativeShaping: false
    executesIcu4x: false
    comparesRuntimeOutput: false
    bindsProductionMeasurement: false
    writesArtifacts: false
  }
  blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[]
  warningIssues: FlowDocTextEngineRuntimeIdentityIssue[]
  nextSteps: string[]
}

export const FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME = "@flowdoc/text-engine-rust-wasm"

const REQUIRED_FACTS: FlowDocTextEngineRuntimeComparedFact[] = [
  "glyph-id",
  "glyph-advance",
  "cluster-map",
  "line-box",
]

function issue(
  severity: FlowDocTextEngineRuntimeIdentityIssueSeverity,
  code: FlowDocTextEngineRuntimeIdentityIssueCode,
  message: string,
  targetId?: string,
): FlowDocTextEngineRuntimeIdentityIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function unique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort()
}

function cloneRuntime(runtime: FlowDocTextEngineRuntimeIdentityRuntime): FlowDocTextEngineRuntimeIdentityRuntime {
  return {
    ...runtime,
    wasmArtifact: { ...runtime.wasmArtifact },
  }
}

function cloneFontAsset(asset: FlowDocTextEngineRuntimeFontAssetIdentity): FlowDocTextEngineRuntimeFontAssetIdentity {
  return { ...asset }
}

function cloneComparison(
  comparison: FlowDocTextEngineRuntimeParityComparison,
): FlowDocTextEngineRuntimeParityComparison {
  return {
    ...comparison,
    wasmTargets: [...comparison.wasmTargets],
    comparedFacts: [...comparison.comparedFacts],
  }
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function validateRuntime(
  manifest: FlowDocTextEngineRuntimeIdentityManifest,
  blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[],
  warningIssues: FlowDocTextEngineRuntimeIdentityIssue[],
): void {
  if (manifest.runtime.rustybuzzRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-rustybuzz-revision", "Runtime identity requires a rustybuzz revision."))
  }

  if (manifest.runtime.icu4xRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-icu4x-revision", "Runtime identity requires an ICU4X revision."))
  }

  if (manifest.runtime.icu4xDataRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-icu4x-data-revision", "Runtime identity requires an ICU4X data revision."))
  }

  const digest = manifest.runtime.wasmArtifact.sha256
  if (manifest.parityStatus === "parity-ready") {
    if (manifest.runtime.wasmArtifact.digestStatus !== "pinned" || digest == null || digest.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-wasm-digest", "Parity-ready runtime identity requires a pinned WASM digest."))
    }
  } else if (digest == null || digest.trim().length === 0) {
    warningIssues.push(issue("warning", "missing-wasm-digest", "WASM digest may remain pending until parity-ready is claimed."))
  }

  if (digest != null && digest.trim().length > 0 && !isSha256(digest)) {
    blockingIssues.push(issue("blocking", "invalid-wasm-digest", "WASM digest must be a lowercase sha256 hex string."))
  }
}

function validateTargets(
  manifest: FlowDocTextEngineRuntimeIdentityManifest,
  blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[],
): void {
  const runtimeTargets = new Set(manifest.runtimeTargets)

  if (manifest.runtimeTargets.length === 0) {
    blockingIssues.push(issue("blocking", "missing-runtime-target", "Runtime identity requires at least one runtime target."))
  }

  if (!runtimeTargets.has("node-native")) {
    blockingIssues.push(issue("blocking", "missing-node-native-target", "Runtime identity requires a node-native baseline target."))
  }

  if (!runtimeTargets.has("browser-wasm") && !runtimeTargets.has("worker-wasm")) {
    blockingIssues.push(issue("blocking", "missing-wasm-target", "Runtime identity requires a browser or worker WASM target."))
  }
}

function validateFonts(
  manifest: FlowDocTextEngineRuntimeIdentityManifest,
  blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[],
): void {
  if (manifest.fontAssets.length === 0) {
    blockingIssues.push(issue("blocking", "missing-font-assets", "Runtime identity requires copied font asset hashes."))
  }

  manifest.fontAssets.forEach((asset) => {
    if (asset.fontId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-font-id", "Runtime font asset identities require font ids."))
    }

    if (!isSha256(asset.sha256)) {
      blockingIssues.push(issue("blocking", "invalid-font-hash", "Runtime font asset identities require sha256 hashes.", asset.fontId))
    }
  })
}

function validateParityComparison(
  manifest: FlowDocTextEngineRuntimeIdentityManifest,
  blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[],
): void {
  REQUIRED_FACTS.forEach((fact) => {
    if (!manifest.parityComparison.comparedFacts.includes(fact)) {
      blockingIssues.push(issue("blocking", "missing-compared-fact", "Runtime parity comparisons must cover required text evidence facts.", fact))
    }
  })

  if (manifest.parityStatus === "parity-ready" && manifest.parityComparison.status !== "matching") {
    blockingIssues.push(issue("blocking", "parity-ready-without-matching-comparison", "Parity-ready runtime identity requires matching native/WASM comparison evidence."))
  }
}

export function createFlowDocTextEngineRuntimeIdentityPlan(input: {
  manifest: FlowDocTextEngineRuntimeIdentityManifest
  bindProductionMeasurement?: boolean
}): FlowDocTextEngineRuntimeIdentityPlan {
  const manifest = input.manifest
  const blockingIssues: FlowDocTextEngineRuntimeIdentityIssue[] = []
  const warningIssues: FlowDocTextEngineRuntimeIdentityIssue[] = []

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Runtime identity cannot bind production measurement."))
  }

  if (manifest.manifestId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-manifest-id", "Runtime identity manifests require a stable manifest id."))
  }

  if (manifest.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Runtime identity manifests require a policy revision."))
  }

  if (manifest.adapterPackageName.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-adapter-package-name", "Runtime identity manifests require an adapter package name."))
  } else if (manifest.adapterPackageName !== FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME) {
    blockingIssues.push(issue("blocking", "unexpected-adapter-package-name", "Runtime identity must stay in the external text engine adapter package.", manifest.adapterPackageName))
  }

  if (manifest.measurementProfileId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-measurement-profile-id", "Runtime identity manifests require a measurement profile id."))
  }

  if (manifest.outputShapeVersion !== "glyph-line-box-v1") {
    blockingIssues.push(issue("blocking", "unsupported-output-shape", "Runtime identity currently supports glyph-line-box-v1 output.", manifest.outputShapeVersion))
  }

  validateTargets(manifest, blockingIssues)
  validateRuntime(manifest, blockingIssues, warningIssues)
  validateFonts(manifest, blockingIssues)
  validateParityComparison(manifest, blockingIssues)

  return {
    source: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_MODE,
    status: blockingIssues.length > 0
      ? "blocked"
      : manifest.parityStatus === "parity-ready"
        ? "parity-ready"
        : "identity-ready",
    manifestId: manifest.manifestId,
    policyRevision: manifest.policyRevision,
    adapterPackageName: manifest.adapterPackageName,
    measurementProfileId: manifest.measurementProfileId,
    outputShapeVersion: manifest.outputShapeVersion,
    parityStatus: manifest.parityStatus,
    runtimeTargets: unique(manifest.runtimeTargets),
    runtime: cloneRuntime(manifest.runtime),
    fontAssets: manifest.fontAssets.map(cloneFontAsset),
    parityComparison: cloneComparison(manifest.parityComparison),
    identityContract: {
      pinsRustybuzzRevision: true,
      pinsIcu4xRevision: true,
      pinsIcu4xDataRevision: true,
      pinsFontHashes: true,
      pinsWasmDigestBeforeParityReady: true,
      measurementProfileCarriesFontShaperSegmenterIdentity: true,
      wasmDigestStaysRuntimeIdentityEvidence: true,
    },
    executionContract: {
      importsWasm: false,
      loadsWasm: false,
      executesNativeShaping: false,
      executesIcu4x: false,
      comparesRuntimeOutput: false,
      bindsProductionMeasurement: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Build and digest-pin the WASM artifact before claiming parity-ready runtime identity.",
      "Run native/WASM corpus comparison for glyph ids, advances, clusters, and line boxes.",
      "Keep production measurement disabled until parity and drift gates pass.",
    ],
  }
}
