export const VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE = "vnext-rust-wasm-text-engine-boundary"
export const VNEXT_RUST_WASM_TEXT_ENGINE_MODE = "rust-wasm-text-engine-boundary-decision"

export type VNextRustWasmTextEngineStatus = "cleared-for-adapter-spike" | "blocked"
export type VNextRustWasmTextEngineIssueSeverity = "blocking" | "warning"
export type VNextRustWasmTextEnginePlacement =
  | "external-adapter-package"
  | "optional-core-adapter"
  | "core-direct-dependency"
  | "blocked"
export type VNextRustWasmTextEngineRuntimeTarget = "node" | "browser" | "worker"

export type VNextRustWasmTextEngineIssueCode =
  | "production-binding"
  | "missing-decision-id"
  | "blocked-placement"
  | "core-direct-dependency"
  | "core-imports-wasm"
  | "core-owns-wasm-build"
  | "adapter-does-not-provide-facts"
  | "missing-renderer-adapter-boundary"
  | "missing-shaper-revision"
  | "missing-segmenter-revision"
  | "missing-segmenter-data-revision"
  | "nondeterministic-engine"
  | "missing-runtime-target"
  | "network-runtime-required"
  | "missing-wasm-digest"

export interface VNextRustWasmTextEngineInput {
  decisionId: string
  placement: VNextRustWasmTextEnginePlacement
  bindProductionMeasurement?: boolean
  adapterPackageName: string
  runtimeTargets: readonly VNextRustWasmTextEngineRuntimeTarget[]
  engine: {
    shaper: "rustybuzz"
    shaperRevision: string
    segmenter: "icu4x"
    segmenterRevision: string
    segmenterDataRevision: string
    deterministic: boolean
    wasmDigest?: string
  }
  coreDependencyPolicy: {
    coreImportsWasm: boolean
    coreOwnsWasmBuild: boolean
    adapterProvidesMeasurementFacts: boolean
    adapterUsesRendererMeasurementBoundary: boolean
  }
  runtimePolicy: {
    requiresNetworkAtRuntime: boolean
    mayRunInWorker: boolean
    mayRunInBrowser: boolean
    mayRunInNode: boolean
  }
}

export interface VNextRustWasmTextEngineIssue {
  severity: VNextRustWasmTextEngineIssueSeverity
  code: VNextRustWasmTextEngineIssueCode
  message: string
  targetId?: string
}

export interface VNextRustWasmTextEnginePlan {
  source: typeof VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE
  mode: typeof VNEXT_RUST_WASM_TEXT_ENGINE_MODE
  status: VNextRustWasmTextEngineStatus
  decisionId: string
  selectedPlacement: "external-adapter-package" | "optional-core-adapter"
  adapter: {
    packageName: string
    provides: "vnext-renderer-text-measurement-facts"
    consumes: "measurement-profile-identity"
    mayReplaceCoreMeasurerDirectly: false
  }
  engine: {
    shaper: "rustybuzz"
    shaperRevision: string
    segmenter: "icu4x"
    segmenterRevision: string
    segmenterDataRevision: string
    deterministic: boolean
    wasmDigest: string | null
  }
  runtimeTargets: VNextRustWasmTextEngineRuntimeTarget[]
  coreContract: {
    coreImportsWasm: false
    coreOwnsWasmBuild: false
    adapterProvidesMeasurementFacts: true
    adapterUsesRendererMeasurementBoundary: true
  }
  runtimeContract: {
    requiresNetworkAtRuntime: false
    mayRunInWorker: boolean
    mayRunInBrowser: boolean
    mayRunInNode: boolean
  }
  executionContract: {
    installsDependencies: false
    buildsWasm: false
    importsRustPackages: false
    importsWasm: false
    executesShaping: false
    executesSegmentation: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
  }
  blockingIssues: VNextRustWasmTextEngineIssue[]
  warningIssues: VNextRustWasmTextEngineIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextRustWasmTextEngineIssueSeverity,
  code: VNextRustWasmTextEngineIssueCode,
  message: string,
  targetId?: string,
): VNextRustWasmTextEngineIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneTargets(targets: readonly VNextRustWasmTextEngineRuntimeTarget[]): VNextRustWasmTextEngineRuntimeTarget[] {
  return [...targets]
}

export function createVNextRustWasmTextEngineBoundaryPlan(
  input: VNextRustWasmTextEngineInput,
): VNextRustWasmTextEnginePlan {
  const blockingIssues: VNextRustWasmTextEngineIssue[] = []
  const warningIssues: VNextRustWasmTextEngineIssue[] = []

  if (input.decisionId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-decision-id", "Rust/WASM boundary decisions need a stable decision id."))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-binding",
      "Rust/WASM text engine boundary decisions cannot bind production measurement in this phase.",
    ))
  }

  if (input.placement === "blocked") {
    blockingIssues.push(issue("blocking", "blocked-placement", "Selected Rust/WASM text engine placement is blocked."))
  }

  if (input.placement === "core-direct-dependency") {
    blockingIssues.push(issue(
      "blocking",
      "core-direct-dependency",
      "The vNext core package must not directly depend on Rust/WASM text engine packages.",
    ))
  }

  if (input.coreDependencyPolicy.coreImportsWasm) {
    blockingIssues.push(issue("blocking", "core-imports-wasm", "The core package must not import WASM modules directly."))
  }

  if (input.coreDependencyPolicy.coreOwnsWasmBuild) {
    blockingIssues.push(issue("blocking", "core-owns-wasm-build", "The core package must not own Rust/WASM build execution."))
  }

  if (!input.coreDependencyPolicy.adapterProvidesMeasurementFacts) {
    blockingIssues.push(issue(
      "blocking",
      "adapter-does-not-provide-facts",
      "The Rust/WASM adapter must provide renderer text measurement facts back to core.",
    ))
  }

  if (!input.coreDependencyPolicy.adapterUsesRendererMeasurementBoundary) {
    blockingIssues.push(issue(
      "blocking",
      "missing-renderer-adapter-boundary",
      "The Rust/WASM adapter must feed the existing renderer-backed text measurement boundary.",
    ))
  }

  if (input.engine.shaperRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-shaper-revision", "rustybuzz revision must be pinned.", "rustybuzz"))
  }

  if (input.engine.segmenterRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-revision", "ICU4X revision must be pinned.", "icu4x"))
  }

  if (input.engine.segmenterDataRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-data-revision", "ICU4X data revision must be pinned.", "icu4x"))
  }

  if (!input.engine.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-engine", "Rust/WASM text engine spikes must be deterministic."))
  }

  if (input.runtimeTargets.length === 0) {
    blockingIssues.push(issue("blocking", "missing-runtime-target", "At least one runtime target must be declared."))
  }

  if (input.runtimePolicy.requiresNetworkAtRuntime) {
    blockingIssues.push(issue("blocking", "network-runtime-required", "Text measurement engines must not require network access at runtime."))
  }

  if (input.engine.wasmDigest == null || input.engine.wasmDigest.trim().length === 0) {
    warningIssues.push(issue(
      "warning",
      "missing-wasm-digest",
      "A WASM digest is not required for the boundary decision, but must be recorded before production measurement.",
    ))
  }

  return {
    source: VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE,
    mode: VNEXT_RUST_WASM_TEXT_ENGINE_MODE,
    status: blockingIssues.length === 0 ? "cleared-for-adapter-spike" : "blocked",
    decisionId: input.decisionId,
    selectedPlacement: input.placement === "optional-core-adapter" ? "optional-core-adapter" : "external-adapter-package",
    adapter: {
      packageName: input.adapterPackageName,
      provides: "vnext-renderer-text-measurement-facts",
      consumes: "measurement-profile-identity",
      mayReplaceCoreMeasurerDirectly: false,
    },
    engine: {
      shaper: input.engine.shaper,
      shaperRevision: input.engine.shaperRevision,
      segmenter: input.engine.segmenter,
      segmenterRevision: input.engine.segmenterRevision,
      segmenterDataRevision: input.engine.segmenterDataRevision,
      deterministic: input.engine.deterministic,
      wasmDigest: input.engine.wasmDigest ?? null,
    },
    runtimeTargets: cloneTargets(input.runtimeTargets),
    coreContract: {
      coreImportsWasm: false,
      coreOwnsWasmBuild: false,
      adapterProvidesMeasurementFacts: true,
      adapterUsesRendererMeasurementBoundary: true,
    },
    runtimeContract: {
      requiresNetworkAtRuntime: false,
      mayRunInWorker: input.runtimePolicy.mayRunInWorker,
      mayRunInBrowser: input.runtimePolicy.mayRunInBrowser,
      mayRunInNode: input.runtimePolicy.mayRunInNode,
    },
    executionContract: {
      installsDependencies: false,
      buildsWasm: false,
      importsRustPackages: false,
      importsWasm: false,
      executesShaping: false,
      executesSegmentation: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Create the Rust/WASM text engine adapter outside the core package boundary.",
      "Pin rustybuzz, ICU4X, ICU4X data, and WASM artifact digests before production measurement.",
      "Expose only renderer-backed text measurement facts to the core adapter.",
      "Run shaping and segmentation smoke tests before replacing any pagination measurement path.",
    ],
  }
}
