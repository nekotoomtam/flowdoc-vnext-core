export const VNEXT_TEXT_ENGINE_ADAPTER_SPI_SOURCE = "vnext-text-engine-adapter-spi"
export const VNEXT_TEXT_ENGINE_ADAPTER_SPI_MODE = "text-engine-adapter-glyph-fact-boundary"

export type VNextTextEngineAdapterSpiStatus = "ready-for-adapter-implementation" | "blocked"
export type VNextTextEngineAdapterSpiIssueSeverity = "blocking" | "warning"
export type VNextTextEngineAdapterPlacement =
  | "external-adapter-package"
  | "optional-core-adapter"
  | "core-direct-dependency"
  | "blocked"
export type VNextTextEngineAdapterProfileStatus = "stable" | "blocked"
export type VNextTextEngineAdapterRuntimeTarget = "node" | "browser" | "worker"
export type VNextTextEngineAdapterOutputShapeVersion = "glyph-line-box-v1"
export type VNextTextEngineAdapterRequiredFact =
  | "glyph-id"
  | "glyph-advance"
  | "glyph-offset"
  | "cluster-map"
  | "text-range"
  | "line-box"

export type VNextTextEngineAdapterSpiIssueCode =
  | "production-binding"
  | "missing-spi-id"
  | "missing-policy-revision"
  | "missing-adapter-package-name"
  | "missing-measurement-profile-id"
  | "measurement-profile-not-stable"
  | "adapter-placement-blocked"
  | "core-imports-engine"
  | "core-imports-wasm"
  | "core-reads-font-files"
  | "core-executes-shaping"
  | "core-executes-segmentation"
  | "adapter-does-not-own-shaping"
  | "adapter-does-not-return-glyph-facts"
  | "adapter-does-not-return-line-boxes"
  | "adapter-cannot-derive-measurement-draft"
  | "missing-runtime-target"
  | "missing-shaper-revision"
  | "missing-segmenter-revision"
  | "missing-segmenter-data-revision"
  | "nondeterministic-engine"
  | "missing-available-fonts"
  | "missing-samples"
  | "missing-smoke-cases"
  | "missing-case-id"
  | "duplicate-case-id"
  | "missing-style-key"
  | "unknown-font-asset"
  | "unknown-corpus-sample"
  | "missing-sample-text"
  | "output-shape-mismatch"
  | "invalid-request-width"
  | "missing-glyph-id-fact"
  | "missing-advance-fact"
  | "missing-offset-fact"
  | "missing-cluster-map-fact"
  | "missing-text-range-fact"
  | "missing-line-box-fact"
  | "missing-wasm-digest"

export interface VNextTextEngineAdapterEngineRef {
  shaper: "rustybuzz" | "harfbuzz" | "custom"
  shaperRevision: string
  segmenter: "icu4x" | "intl-segmenter" | "custom"
  segmenterRevision: string
  segmenterDataRevision: string
  deterministic: boolean
  wasmDigest?: string
}

export interface VNextTextEngineAdapterExecutionPolicy {
  coreImportsEngine: boolean
  coreImportsWasm: boolean
  coreReadsFontFiles: boolean
  coreExecutesShaping: boolean
  coreExecutesSegmentation: boolean
  adapterOwnsShaping: boolean
  adapterReturnsGlyphFacts: boolean
  adapterReturnsLineBoxes: boolean
  adapterCanDeriveMeasurementDraft: boolean
}

export interface VNextTextEngineAdapterSampleRef {
  sampleId: string
  text: string
  locale: "th"
}

export interface VNextTextEngineAdapterSmokeCaseRef {
  caseId: string
  sampleId: string
  fontId: string
  styleKey: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  requiredFacts: readonly VNextTextEngineAdapterRequiredFact[]
}

export interface VNextTextEngineAdapterSpiInput {
  spiId: string
  policyRevision: string
  adapterPackageName: string
  placement: VNextTextEngineAdapterPlacement
  bindProductionMeasurement?: boolean
  measurementProfileId: string
  measurementProfileStatus: VNextTextEngineAdapterProfileStatus
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  runtimeTargets: readonly VNextTextEngineAdapterRuntimeTarget[]
  availableFontAssetIds: readonly string[]
  samples: readonly VNextTextEngineAdapterSampleRef[]
  smokeCases: readonly VNextTextEngineAdapterSmokeCaseRef[]
  requestDefaults: {
    availableWidthPt: number
  }
  engine: VNextTextEngineAdapterEngineRef
  executionPolicy: VNextTextEngineAdapterExecutionPolicy
}

export interface VNextTextEngineAdapterRequest {
  requestId: string
  smokeCaseId: string
  sampleId: string
  measurementProfileId: string
  text: string
  locale: "th"
  fontId: string
  styleKey: string
  availableWidthPt: number
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  requestedFacts: VNextTextEngineAdapterRequiredFact[]
}

export interface VNextTextEngineAdapterGlyphFact {
  glyphIndex: number
  glyphId: number
  fontId: string
  advancePt: number
  offsetXPt: number
  offsetYPt: number
  clusterStartOffset: number
  clusterEndOffset: number
}

export interface VNextTextEngineAdapterLineBoxFact {
  lineIndex: number
  startOffset: number
  endOffset: number
  widthPt: number
  heightPt: number
  yOffsetPt: number
  glyphStartIndex: number
  glyphEndIndex: number
}

export interface VNextTextEngineAdapterEvidence {
  requestId: string
  measurementProfileId: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  engine: VNextTextEngineAdapterEngineRef
  glyphs: readonly VNextTextEngineAdapterGlyphFact[]
  lineBoxes: readonly VNextTextEngineAdapterLineBoxFact[]
  totalAdvancePt: number
  lineHeightPt: number
}

export interface VNextTextEngineAdapterSpiIssue {
  severity: VNextTextEngineAdapterSpiIssueSeverity
  code: VNextTextEngineAdapterSpiIssueCode
  message: string
  targetId?: string
}

export interface VNextTextEngineAdapterSpiPlan {
  source: typeof VNEXT_TEXT_ENGINE_ADAPTER_SPI_SOURCE
  mode: typeof VNEXT_TEXT_ENGINE_ADAPTER_SPI_MODE
  status: VNextTextEngineAdapterSpiStatus
  spiId: string
  policyRevision: string
  adapterPackageName: string
  placement: "external-adapter-package" | "optional-core-adapter"
  measurementProfileId: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  runtimeTargets: VNextTextEngineAdapterRuntimeTarget[]
  engine: {
    shaper: VNextTextEngineAdapterEngineRef["shaper"]
    shaperRevision: string
    segmenter: VNextTextEngineAdapterEngineRef["segmenter"]
    segmenterRevision: string
    segmenterDataRevision: string
    deterministic: boolean
    wasmDigest: string | null
  }
  requests: VNextTextEngineAdapterRequest[]
  coverage: {
    requestCount: number
    sampleIds: string[]
    fontAssetIds: string[]
    styleKeys: string[]
    requestedFacts: Record<VNextTextEngineAdapterRequiredFact, number>
  }
  adapterContract: {
    consumes: "vnext-text-engine-adapter-request"
    produces: "vnext-text-engine-adapter-evidence"
    evidenceLane: "glyph-facts-separate-from-pagination-draft"
    measurementDraftHandoff: "derive-line-draft-from-accepted-evidence"
    mutatesVNextTextMeasurementDraft: false
    coreConsumesGlyphFactsDirectly: false
  }
  evidenceContract: {
    resultMustReferenceRequestId: true
    glyphFactsRequired: true
    lineBoxFactsRequired: true
    clusterMapRequired: true
    units: "pt"
  }
  executionContract: {
    importsEngine: false
    importsWasm: false
    readsFontFiles: false
    executesShaping: false
    executesSegmentation: false
    mutatesPaginationDraft: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
  }
  blockingIssues: VNextTextEngineAdapterSpiIssue[]
  warningIssues: VNextTextEngineAdapterSpiIssue[]
  nextSteps: string[]
}

const REQUIRED_FACTS: VNextTextEngineAdapterRequiredFact[] = [
  "glyph-id",
  "glyph-advance",
  "glyph-offset",
  "cluster-map",
  "text-range",
  "line-box",
]

function issue(
  severity: VNextTextEngineAdapterSpiIssueSeverity,
  code: VNextTextEngineAdapterSpiIssueCode,
  message: string,
  targetId?: string,
): VNextTextEngineAdapterSpiIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function cloneEngine(engine: VNextTextEngineAdapterEngineRef): VNextTextEngineAdapterEngineRef {
  return { ...engine }
}

function cloneExecutionPolicy(policy: VNextTextEngineAdapterExecutionPolicy): VNextTextEngineAdapterExecutionPolicy {
  return { ...policy }
}

function createFactCoverage(
  requests: readonly VNextTextEngineAdapterRequest[],
): Record<VNextTextEngineAdapterRequiredFact, number> {
  const coverage = Object.fromEntries(REQUIRED_FACTS.map((fact) => [fact, 0])) as Record<
    VNextTextEngineAdapterRequiredFact,
    number
  >

  requests.forEach((request) => {
    request.requestedFacts.forEach((fact) => {
      coverage[fact] = (coverage[fact] ?? 0) + 1
    })
  })

  return coverage
}

function hasFact(
  smokeCase: VNextTextEngineAdapterSmokeCaseRef,
  fact: VNextTextEngineAdapterRequiredFact,
): boolean {
  return smokeCase.requiredFacts.includes(fact)
}

function pushMissingFactIssue(
  issues: VNextTextEngineAdapterSpiIssue[],
  smokeCase: VNextTextEngineAdapterSmokeCaseRef,
  fact: VNextTextEngineAdapterRequiredFact,
  code: VNextTextEngineAdapterSpiIssueCode,
  message: string,
): void {
  if (!hasFact(smokeCase, fact)) {
    issues.push(issue("blocking", code, message, smokeCase.caseId))
  }
}

function createRequestId(smokeCase: VNextTextEngineAdapterSmokeCaseRef): string {
  return [
    "text-engine-request",
    smokeCase.caseId || "missing-case-id",
    smokeCase.sampleId || "missing-sample-id",
    smokeCase.fontId || "missing-font-id",
    smokeCase.styleKey || "missing-style-key",
  ].join(":")
}

function createRequests(
  input: VNextTextEngineAdapterSpiInput,
): VNextTextEngineAdapterRequest[] {
  const samplesById = new Map(input.samples.map((sample) => [sample.sampleId, sample]))

  return input.smokeCases.map((smokeCase) => {
    const sample = samplesById.get(smokeCase.sampleId)

    return {
      requestId: createRequestId(smokeCase),
      smokeCaseId: smokeCase.caseId,
      sampleId: smokeCase.sampleId,
      measurementProfileId: input.measurementProfileId,
      text: sample?.text ?? "",
      locale: "th",
      fontId: smokeCase.fontId,
      styleKey: smokeCase.styleKey,
      availableWidthPt: input.requestDefaults.availableWidthPt,
      outputShapeVersion: smokeCase.outputShapeVersion,
      requestedFacts: [...smokeCase.requiredFacts],
    }
  })
}

export function createVNextTextEngineAdapterSpiPlan(
  input: VNextTextEngineAdapterSpiInput,
): VNextTextEngineAdapterSpiPlan {
  const engine = cloneEngine(input.engine)
  const executionPolicy = cloneExecutionPolicy(input.executionPolicy)
  const availableFontAssetIds = new Set(input.availableFontAssetIds)
  const samplesById = new Map(input.samples.map((sample) => [sample.sampleId, sample]))
  const requests = createRequests(input)
  const blockingIssues: VNextTextEngineAdapterSpiIssue[] = []
  const warningIssues: VNextTextEngineAdapterSpiIssue[] = []
  const caseIds = new Set<string>()
  const duplicateCaseIds = new Set<string>()

  if (input.spiId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-spi-id", "Text engine adapter SPI plans require a stable SPI id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Text engine adapter SPI plans require a policy revision."))
  }

  if (input.adapterPackageName.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-adapter-package-name", "Text engine adapter SPI plans require an adapter package name."))
  }

  if (input.measurementProfileId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-measurement-profile-id", "Text engine adapter SPI plans must reference a measurement profile id."))
  }

  if (input.measurementProfileStatus !== "stable") {
    blockingIssues.push(issue(
      "blocking",
      "measurement-profile-not-stable",
      "Text engine adapter SPI plans require a stable measurement profile before implementation.",
      input.measurementProfileId,
    ))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-binding",
      "Text engine adapter SPI plans cannot bind production measurement in this phase.",
    ))
  }

  if (input.placement === "blocked" || input.placement === "core-direct-dependency") {
    blockingIssues.push(issue(
      "blocking",
      "adapter-placement-blocked",
      "Text engine adapter implementation must stay outside direct core dependency placement.",
      input.adapterPackageName,
    ))
  }

  if (executionPolicy.coreImportsEngine) {
    blockingIssues.push(issue("blocking", "core-imports-engine", "The core package must not import text engine packages.", input.adapterPackageName))
  }

  if (executionPolicy.coreImportsWasm) {
    blockingIssues.push(issue("blocking", "core-imports-wasm", "The core package must not import WASM modules.", input.adapterPackageName))
  }

  if (executionPolicy.coreReadsFontFiles) {
    blockingIssues.push(issue("blocking", "core-reads-font-files", "The core package must not read font files for shaping.", input.adapterPackageName))
  }

  if (executionPolicy.coreExecutesShaping) {
    blockingIssues.push(issue("blocking", "core-executes-shaping", "The core package must not execute shaping.", input.adapterPackageName))
  }

  if (executionPolicy.coreExecutesSegmentation) {
    blockingIssues.push(issue("blocking", "core-executes-segmentation", "The core package must not execute segmentation.", input.adapterPackageName))
  }

  if (!executionPolicy.adapterOwnsShaping) {
    blockingIssues.push(issue("blocking", "adapter-does-not-own-shaping", "The external adapter must own shaping execution.", input.adapterPackageName))
  }

  if (!executionPolicy.adapterReturnsGlyphFacts) {
    blockingIssues.push(issue("blocking", "adapter-does-not-return-glyph-facts", "The external adapter must return glyph fact evidence.", input.adapterPackageName))
  }

  if (!executionPolicy.adapterReturnsLineBoxes) {
    blockingIssues.push(issue("blocking", "adapter-does-not-return-line-boxes", "The external adapter must return line box evidence.", input.adapterPackageName))
  }

  if (!executionPolicy.adapterCanDeriveMeasurementDraft) {
    blockingIssues.push(issue("blocking", "adapter-cannot-derive-measurement-draft", "The external adapter must be able to derive pagination-facing line drafts from accepted evidence.", input.adapterPackageName))
  }

  if (input.runtimeTargets.length === 0) {
    blockingIssues.push(issue("blocking", "missing-runtime-target", "Text engine adapter SPI plans require at least one runtime target."))
  }

  if (engine.shaperRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-shaper-revision", "Text engine adapter SPI plans require a shaper revision.", engine.shaper))
  }

  if (engine.segmenterRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-revision", "Text engine adapter SPI plans require a segmenter revision.", engine.segmenter))
  }

  if (engine.segmenterDataRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-data-revision", "Text engine adapter SPI plans require a segmenter data revision.", engine.segmenter))
  }

  if (!engine.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-engine", "Text engine adapter SPI plans require deterministic engine output."))
  }

  if (engine.wasmDigest == null || engine.wasmDigest.trim().length === 0) {
    warningIssues.push(issue("warning", "missing-wasm-digest", "A WASM digest can remain pending for the SPI boundary but must be pinned before production measurement."))
  }

  if (input.availableFontAssetIds.length === 0) {
    blockingIssues.push(issue("blocking", "missing-available-fonts", "Text engine adapter SPI plans require copied font asset ids."))
  }

  if (input.samples.length === 0) {
    blockingIssues.push(issue("blocking", "missing-samples", "Text engine adapter SPI plans require corpus samples."))
  }

  if (input.smokeCases.length === 0) {
    blockingIssues.push(issue("blocking", "missing-smoke-cases", "Text engine adapter SPI plans require smoke cases."))
  }

  if (input.requestDefaults.availableWidthPt <= 0) {
    blockingIssues.push(issue("blocking", "invalid-request-width", "Text engine adapter requests require a positive available width."))
  }

  input.smokeCases.forEach((smokeCase) => {
    if (smokeCase.caseId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-case-id", "Text engine adapter smoke cases require stable ids."))
      return
    }

    if (caseIds.has(smokeCase.caseId)) duplicateCaseIds.add(smokeCase.caseId)
    caseIds.add(smokeCase.caseId)

    if (smokeCase.styleKey.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-style-key", "Text engine adapter smoke cases must record style keys.", smokeCase.caseId))
    }

    if (!availableFontAssetIds.has(smokeCase.fontId)) {
      blockingIssues.push(issue("blocking", "unknown-font-asset", "Text engine adapter smoke cases must reference copied font assets.", smokeCase.fontId))
    }

    const sample = samplesById.get(smokeCase.sampleId)
    if (sample == null) {
      blockingIssues.push(issue("blocking", "unknown-corpus-sample", "Text engine adapter smoke cases must reference corpus samples.", smokeCase.sampleId))
    } else if (sample.text.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-sample-text", "Text engine adapter corpus samples must include text.", smokeCase.sampleId))
    }

    if (smokeCase.outputShapeVersion !== input.outputShapeVersion) {
      blockingIssues.push(issue("blocking", "output-shape-mismatch", "Text engine adapter smoke cases must match the declared output shape version.", smokeCase.caseId))
    }

    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-id", "missing-glyph-id-fact", "Text engine adapter requests must require glyph ids.")
    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-advance", "missing-advance-fact", "Text engine adapter requests must require glyph advances.")
    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-offset", "missing-offset-fact", "Text engine adapter requests must require glyph offsets.")
    pushMissingFactIssue(blockingIssues, smokeCase, "cluster-map", "missing-cluster-map-fact", "Text engine adapter requests must require cluster maps.")
    pushMissingFactIssue(blockingIssues, smokeCase, "text-range", "missing-text-range-fact", "Text engine adapter requests must require text ranges.")
    pushMissingFactIssue(blockingIssues, smokeCase, "line-box", "missing-line-box-fact", "Text engine adapter requests must require line boxes.")
  })

  duplicateCaseIds.forEach((caseId) => {
    blockingIssues.push(issue("blocking", "duplicate-case-id", "Text engine adapter smoke case ids must be unique.", caseId))
  })

  return {
    source: VNEXT_TEXT_ENGINE_ADAPTER_SPI_SOURCE,
    mode: VNEXT_TEXT_ENGINE_ADAPTER_SPI_MODE,
    status: blockingIssues.length === 0 ? "ready-for-adapter-implementation" : "blocked",
    spiId: input.spiId,
    policyRevision: input.policyRevision,
    adapterPackageName: input.adapterPackageName,
    placement: input.placement === "optional-core-adapter" ? "optional-core-adapter" : "external-adapter-package",
    measurementProfileId: input.measurementProfileId,
    outputShapeVersion: input.outputShapeVersion,
    runtimeTargets: [...input.runtimeTargets],
    engine: {
      shaper: engine.shaper,
      shaperRevision: engine.shaperRevision,
      segmenter: engine.segmenter,
      segmenterRevision: engine.segmenterRevision,
      segmenterDataRevision: engine.segmenterDataRevision,
      deterministic: engine.deterministic,
      wasmDigest: engine.wasmDigest ?? null,
    },
    requests,
    coverage: {
      requestCount: requests.length,
      sampleIds: unique(requests.map((request) => request.sampleId)),
      fontAssetIds: unique(requests.map((request) => request.fontId)),
      styleKeys: unique(requests.map((request) => request.styleKey)),
      requestedFacts: createFactCoverage(requests),
    },
    adapterContract: {
      consumes: "vnext-text-engine-adapter-request",
      produces: "vnext-text-engine-adapter-evidence",
      evidenceLane: "glyph-facts-separate-from-pagination-draft",
      measurementDraftHandoff: "derive-line-draft-from-accepted-evidence",
      mutatesVNextTextMeasurementDraft: false,
      coreConsumesGlyphFactsDirectly: false,
    },
    evidenceContract: {
      resultMustReferenceRequestId: true,
      glyphFactsRequired: true,
      lineBoxFactsRequired: true,
      clusterMapRequired: true,
      units: "pt",
    },
    executionContract: {
      importsEngine: false,
      importsWasm: false,
      readsFontFiles: false,
      executesShaping: false,
      executesSegmentation: false,
      mutatesPaginationDraft: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Create the external text engine adapter package that implements this request/evidence SPI.",
      "Run Phase 107 smoke cases in the adapter and record actual glyph, cluster, advance, offset, and line box evidence.",
      "Add an adapter-owned mapper from accepted evidence to the pagination-facing text measurement draft.",
      "Keep caret and selection consumers on the evidence lane until their cluster-map contract is explicit.",
    ],
  }
}
