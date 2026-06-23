export const VNEXT_RUSTYBUZZ_SHAPING_SMOKE_SOURCE = "vnext-rustybuzz-shaping-smoke"
export const VNEXT_RUSTYBUZZ_SHAPING_SMOKE_MODE = "rustybuzz-shaping-smoke-boundary"

export type VNextRustybuzzShapingSmokeStatus = "ready-for-shaping-smoke" | "blocked"
export type VNextRustybuzzShapingSmokeIssueSeverity = "blocking" | "warning"
export type VNextRustybuzzShapingSmokeProfileStatus = "stable" | "blocked"
export type VNextRustybuzzShapingSmokePlacement =
  | "external-adapter-package"
  | "optional-core-adapter"
  | "core-direct-dependency"
  | "blocked"
export type VNextRustybuzzShapingSmokeOutputShapeVersion = "glyph-line-box-v1"
export type VNextRustybuzzShapingSmokeRequiredFact =
  | "glyph-id"
  | "glyph-advance"
  | "glyph-offset"
  | "cluster-map"
  | "text-range"
  | "line-box"

export type VNextRustybuzzShapingSmokeIssueCode =
  | "production-binding"
  | "missing-smoke-id"
  | "missing-policy-revision"
  | "missing-measurement-profile-id"
  | "measurement-profile-not-stable"
  | "adapter-placement-blocked"
  | "core-executes-shaping"
  | "core-reads-font-files"
  | "core-imports-wasm"
  | "missing-available-fonts"
  | "missing-available-samples"
  | "missing-cases"
  | "missing-case-id"
  | "duplicate-case-id"
  | "missing-style-key"
  | "unknown-font-asset"
  | "unknown-corpus-sample"
  | "output-shape-mismatch"
  | "missing-glyph-id-fact"
  | "missing-advance-fact"
  | "missing-offset-fact"
  | "missing-cluster-map-fact"
  | "missing-text-range-fact"
  | "missing-line-box-fact"
  | "cluster-mapping-not-expected"
  | "advance-width-not-expected"
  | "glyph-offsets-not-expected"

export interface VNextRustybuzzShapingSmokeAdapterDecision {
  decisionId: string
  placement: VNextRustybuzzShapingSmokePlacement
  executesShapingInCore: boolean
  readsFontFilesInCore: boolean
  importsWasmInCore: boolean
}

export interface VNextRustybuzzShapingSmokeCase {
  caseId: string
  sampleId: string
  fontId: string
  styleKey: string
  outputShapeVersion: VNextRustybuzzShapingSmokeOutputShapeVersion
  requiredFacts: readonly VNextRustybuzzShapingSmokeRequiredFact[]
  expectsClusterMapping: boolean
  expectsAdvanceWidth: boolean
  expectsGlyphOffsets: boolean
  notes?: string
}

export interface VNextRustybuzzShapingSmokeInput {
  smokeId: string
  policyRevision: string
  measurementProfileId: string
  measurementProfileStatus: VNextRustybuzzShapingSmokeProfileStatus
  outputShapeVersion: VNextRustybuzzShapingSmokeOutputShapeVersion
  bindProductionMeasurement?: boolean
  adapterDecision: VNextRustybuzzShapingSmokeAdapterDecision
  availableFontAssetIds: readonly string[]
  availableSampleIds: readonly string[]
  cases: readonly VNextRustybuzzShapingSmokeCase[]
}

export interface VNextRustybuzzShapingSmokeIssue {
  severity: VNextRustybuzzShapingSmokeIssueSeverity
  code: VNextRustybuzzShapingSmokeIssueCode
  message: string
  targetId?: string
}

export interface VNextRustybuzzShapingSmokePlan {
  source: typeof VNEXT_RUSTYBUZZ_SHAPING_SMOKE_SOURCE
  mode: typeof VNEXT_RUSTYBUZZ_SHAPING_SMOKE_MODE
  status: VNextRustybuzzShapingSmokeStatus
  smokeId: string
  policyRevision: string
  measurementProfileId: string
  measurementProfileStatus: VNextRustybuzzShapingSmokeProfileStatus
  outputShapeVersion: VNextRustybuzzShapingSmokeOutputShapeVersion
  adapterDecision: VNextRustybuzzShapingSmokeAdapterDecision
  cases: VNextRustybuzzShapingSmokeCase[]
  coverage: {
    caseCount: number
    sampleIds: string[]
    fontAssetIds: string[]
    styleKeys: string[]
    requiredFacts: Record<VNextRustybuzzShapingSmokeRequiredFact, number>
  }
  smokeContract: {
    usesMeasurementProfileIdentity: true
    usesCopiedFontAssets: true
    usesThaiCorpusSamples: true
    adapterRequiredBeforeExecution: true
    recordsActualGlyphFactsInThisPhase: false
  }
  executionContract: {
    importsRustybuzz: false
    importsWasm: false
    readsFontFiles: false
    executesShaping: false
    executesSegmentation: false
    replacesPaginationMeasurer: false
    mutatesDocument: false
    writesArtifacts: false
  }
  blockingIssues: VNextRustybuzzShapingSmokeIssue[]
  warningIssues: VNextRustybuzzShapingSmokeIssue[]
  nextSteps: string[]
}

const REQUIRED_FACTS: VNextRustybuzzShapingSmokeRequiredFact[] = [
  "glyph-id",
  "glyph-advance",
  "glyph-offset",
  "cluster-map",
  "text-range",
  "line-box",
]

function issue(
  severity: VNextRustybuzzShapingSmokeIssueSeverity,
  code: VNextRustybuzzShapingSmokeIssueCode,
  message: string,
  targetId?: string,
): VNextRustybuzzShapingSmokeIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneDecision(decision: VNextRustybuzzShapingSmokeAdapterDecision): VNextRustybuzzShapingSmokeAdapterDecision {
  return { ...decision }
}

function cloneCase(smokeCase: VNextRustybuzzShapingSmokeCase): VNextRustybuzzShapingSmokeCase {
  return {
    ...smokeCase,
    requiredFacts: [...smokeCase.requiredFacts],
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function createFactCoverage(
  cases: readonly VNextRustybuzzShapingSmokeCase[],
): Record<VNextRustybuzzShapingSmokeRequiredFact, number> {
  const coverage = Object.fromEntries(REQUIRED_FACTS.map((fact) => [fact, 0])) as Record<
    VNextRustybuzzShapingSmokeRequiredFact,
    number
  >

  cases.forEach((smokeCase) => {
    smokeCase.requiredFacts.forEach((fact) => {
      coverage[fact] = (coverage[fact] ?? 0) + 1
    })
  })

  return coverage
}

function hasFact(
  smokeCase: VNextRustybuzzShapingSmokeCase,
  fact: VNextRustybuzzShapingSmokeRequiredFact,
): boolean {
  return smokeCase.requiredFacts.includes(fact)
}

function pushMissingFactIssue(
  issues: VNextRustybuzzShapingSmokeIssue[],
  smokeCase: VNextRustybuzzShapingSmokeCase,
  fact: VNextRustybuzzShapingSmokeRequiredFact,
  code: VNextRustybuzzShapingSmokeIssueCode,
  message: string,
): void {
  if (!hasFact(smokeCase, fact)) {
    issues.push(issue("blocking", code, message, smokeCase.caseId))
  }
}

export function createVNextRustybuzzShapingSmokePlan(
  input: VNextRustybuzzShapingSmokeInput,
): VNextRustybuzzShapingSmokePlan {
  const cases = input.cases.map(cloneCase)
  const availableFontAssetIds = new Set(input.availableFontAssetIds)
  const availableSampleIds = new Set(input.availableSampleIds)
  const blockingIssues: VNextRustybuzzShapingSmokeIssue[] = []
  const warningIssues: VNextRustybuzzShapingSmokeIssue[] = []
  const caseIds = new Set<string>()
  const duplicateCaseIds = new Set<string>()

  if (input.smokeId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-smoke-id", "Rustybuzz shaping smoke plans require a stable smoke id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Rustybuzz shaping smoke plans require a policy revision."))
  }

  if (input.measurementProfileId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-measurement-profile-id", "Shaping smoke plans must be tied to a measurement profile id."))
  }

  if (input.measurementProfileStatus !== "stable") {
    blockingIssues.push(issue(
      "blocking",
      "measurement-profile-not-stable",
      "Shaping smoke plans require a stable measurement profile identity before execution.",
      input.measurementProfileId,
    ))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-binding",
      "Rustybuzz shaping smoke plans cannot bind production measurement in this phase.",
    ))
  }

  if (
    input.adapterDecision.placement === "blocked"
    || input.adapterDecision.placement === "core-direct-dependency"
  ) {
    blockingIssues.push(issue(
      "blocking",
      "adapter-placement-blocked",
      "Rustybuzz shaping smoke must run through the external adapter boundary, not direct core dependency placement.",
      input.adapterDecision.decisionId,
    ))
  }

  if (input.adapterDecision.executesShapingInCore) {
    blockingIssues.push(issue("blocking", "core-executes-shaping", "The core package must not execute rustybuzz shaping.", input.adapterDecision.decisionId))
  }

  if (input.adapterDecision.readsFontFilesInCore) {
    blockingIssues.push(issue("blocking", "core-reads-font-files", "The core package must not read font files for shaping smoke.", input.adapterDecision.decisionId))
  }

  if (input.adapterDecision.importsWasmInCore) {
    blockingIssues.push(issue("blocking", "core-imports-wasm", "The core package must not import WASM for shaping smoke.", input.adapterDecision.decisionId))
  }

  if (input.availableFontAssetIds.length === 0) {
    blockingIssues.push(issue("blocking", "missing-available-fonts", "Shaping smoke plans require known copied font asset ids."))
  }

  if (input.availableSampleIds.length === 0) {
    blockingIssues.push(issue("blocking", "missing-available-samples", "Shaping smoke plans require known Thai corpus sample ids."))
  }

  if (cases.length === 0) {
    blockingIssues.push(issue("blocking", "missing-cases", "At least one shaping smoke case is required."))
  }

  cases.forEach((smokeCase) => {
    if (smokeCase.caseId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-case-id", "Shaping smoke cases require stable ids."))
      return
    }

    if (caseIds.has(smokeCase.caseId)) duplicateCaseIds.add(smokeCase.caseId)
    caseIds.add(smokeCase.caseId)

    if (smokeCase.styleKey.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-style-key", "Shaping smoke cases must record the style key under test.", smokeCase.caseId))
    }

    if (!availableFontAssetIds.has(smokeCase.fontId)) {
      blockingIssues.push(issue("blocking", "unknown-font-asset", "Shaping smoke cases must reference copied font assets.", smokeCase.fontId))
    }

    if (!availableSampleIds.has(smokeCase.sampleId)) {
      blockingIssues.push(issue("blocking", "unknown-corpus-sample", "Shaping smoke cases must reference Thai corpus samples.", smokeCase.sampleId))
    }

    if (smokeCase.outputShapeVersion !== input.outputShapeVersion) {
      blockingIssues.push(issue("blocking", "output-shape-mismatch", "Shaping smoke cases must return the declared output shape version.", smokeCase.caseId))
    }

    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-id", "missing-glyph-id-fact", "Shaping smoke cases must require glyph ids.")
    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-advance", "missing-advance-fact", "Shaping smoke cases must require glyph advances.")
    pushMissingFactIssue(blockingIssues, smokeCase, "glyph-offset", "missing-offset-fact", "Shaping smoke cases must require glyph offsets.")
    pushMissingFactIssue(blockingIssues, smokeCase, "cluster-map", "missing-cluster-map-fact", "Shaping smoke cases must require cluster maps.")
    pushMissingFactIssue(blockingIssues, smokeCase, "text-range", "missing-text-range-fact", "Shaping smoke cases must require source text ranges.")
    pushMissingFactIssue(blockingIssues, smokeCase, "line-box", "missing-line-box-fact", "Shaping smoke cases must require line box facts.")

    if (!smokeCase.expectsClusterMapping) {
      blockingIssues.push(issue("blocking", "cluster-mapping-not-expected", "Shaping smoke cases must expect cluster mapping evidence.", smokeCase.caseId))
    }

    if (!smokeCase.expectsAdvanceWidth) {
      blockingIssues.push(issue("blocking", "advance-width-not-expected", "Shaping smoke cases must expect advance width evidence.", smokeCase.caseId))
    }

    if (!smokeCase.expectsGlyphOffsets) {
      blockingIssues.push(issue("blocking", "glyph-offsets-not-expected", "Shaping smoke cases must expect glyph offset evidence.", smokeCase.caseId))
    }
  })

  duplicateCaseIds.forEach((caseId) => {
    blockingIssues.push(issue("blocking", "duplicate-case-id", "Shaping smoke case ids must be unique.", caseId))
  })

  return {
    source: VNEXT_RUSTYBUZZ_SHAPING_SMOKE_SOURCE,
    mode: VNEXT_RUSTYBUZZ_SHAPING_SMOKE_MODE,
    status: blockingIssues.length === 0 ? "ready-for-shaping-smoke" : "blocked",
    smokeId: input.smokeId,
    policyRevision: input.policyRevision,
    measurementProfileId: input.measurementProfileId,
    measurementProfileStatus: input.measurementProfileStatus,
    outputShapeVersion: input.outputShapeVersion,
    adapterDecision: cloneDecision(input.adapterDecision),
    cases,
    coverage: {
      caseCount: cases.length,
      sampleIds: unique(cases.map((smokeCase) => smokeCase.sampleId)),
      fontAssetIds: unique(cases.map((smokeCase) => smokeCase.fontId)),
      styleKeys: unique(cases.map((smokeCase) => smokeCase.styleKey)),
      requiredFacts: createFactCoverage(cases),
    },
    smokeContract: {
      usesMeasurementProfileIdentity: true,
      usesCopiedFontAssets: true,
      usesThaiCorpusSamples: true,
      adapterRequiredBeforeExecution: true,
      recordsActualGlyphFactsInThisPhase: false,
    },
    executionContract: {
      importsRustybuzz: false,
      importsWasm: false,
      readsFontFiles: false,
      executesShaping: false,
      executesSegmentation: false,
      replacesPaginationMeasurer: false,
      mutatesDocument: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Run these cases inside the future Rust/WASM adapter package after rustybuzz and WASM artifacts are pinned.",
      "Record actual glyph ids, advances, offsets, cluster maps, and line boxes as adapter-owned smoke evidence.",
      "Compare shaped clusters against Thai corpus segmentation/oracle results before production measurement binding.",
      "Feed accepted shaping facts through the renderer-backed text measurement adapter without changing document schema.",
    ],
  }
}
