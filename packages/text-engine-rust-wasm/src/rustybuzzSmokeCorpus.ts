import type {
  VNextTextEngineAdapterEngineRef,
  VNextTextEngineAdapterOutputShapeVersion,
  VNextTextEngineAdapterRequest,
  VNextTextEngineAdapterRequiredFact,
} from "@flowdoc/vnext-core"
import {
  createFlowDocRustybuzzRawEvidenceMappingPlan,
  type FlowDocRustybuzzRawEvidenceMappingPlan,
  type FlowDocRustybuzzRawSmokeOutput,
} from "./rustybuzzRawMapping.js"

export const FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_SOURCE = "flowdoc-rustybuzz-smoke-corpus-mapping"
export const FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_MODE = "rustybuzz-smoke-corpus-coverage-boundary"

export type FlowDocRustybuzzSmokeCorpusStatus = "ready" | "blocked"
export type FlowDocRustybuzzSmokeCorpusIssueSeverity = "blocking" | "warning"

export type FlowDocRustybuzzSmokeCorpusIssueCode =
  | "production-binding"
  | "missing-corpus-id"
  | "missing-policy-revision"
  | "missing-measurement-profile-id"
  | "missing-case"
  | "duplicate-case"
  | "missing-sample"
  | "missing-raw-output"
  | "duplicate-raw-output"
  | "case-output-shape-mismatch"
  | "mapping-blocked"
  | "missing-wasm-digest"

export interface FlowDocRustybuzzSmokeCorpusCaseInput {
  caseId: string
  sampleId: string
  fontId: string
  styleKey: string
  outputShapeVersion: VNextTextEngineAdapterOutputShapeVersion
  requiredFacts: readonly VNextTextEngineAdapterRequiredFact[]
}

export interface FlowDocRustybuzzSmokeCorpusSampleInput {
  sampleId: string
  text: string
  locale: "th"
}

export interface FlowDocRustybuzzSmokeCorpusRawOutputInput {
  caseId: string
  rawOutput: FlowDocRustybuzzRawSmokeOutput
}

export interface FlowDocRustybuzzSmokeCorpusMappingInput {
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  cases: readonly FlowDocRustybuzzSmokeCorpusCaseInput[]
  samples: readonly FlowDocRustybuzzSmokeCorpusSampleInput[]
  rawOutputs: readonly FlowDocRustybuzzSmokeCorpusRawOutputInput[]
  engine: VNextTextEngineAdapterEngineRef
  requestDefaults: {
    availableWidthPt: number
  }
  fontSizePt?: number
  lineHeightPt?: number
  bindProductionMeasurement?: boolean
}

export interface FlowDocRustybuzzSmokeCorpusIssue {
  severity: FlowDocRustybuzzSmokeCorpusIssueSeverity
  code: FlowDocRustybuzzSmokeCorpusIssueCode
  message: string
  targetId?: string
}

export interface FlowDocRustybuzzSmokeCorpusCaseMapping {
  caseId: string
  request: VNextTextEngineAdapterRequest
  mapping: FlowDocRustybuzzRawEvidenceMappingPlan
}

export interface FlowDocRustybuzzSmokeCorpusMappingPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_MODE
  status: FlowDocRustybuzzSmokeCorpusStatus
  corpusId: string
  policyRevision: string
  measurementProfileId: string
  caseMappings: FlowDocRustybuzzSmokeCorpusCaseMapping[]
  corpusContract: {
    consumes: "phase-107-smoke-cases-plus-raw-rustybuzz-fixtures"
    produces: "mapped-adapter-evidence-per-smoke-case"
    mappingBoundary: "phase-114-raw-cluster-mapping"
    requiresEverySmokeCaseFixture: true
    productionMeasurementReady: false
  }
  coverage: {
    caseCount: number
    mappedCaseCount: number
    rawOutputCount: number
    glyphCount: number
    zeroAdvanceGlyphCount: number
    repeatedClusterCaseCount: number
    sampleIds: string[]
    fontIds: string[]
    styleKeys: string[]
  }
  blockingIssues: FlowDocRustybuzzSmokeCorpusIssue[]
  warningIssues: FlowDocRustybuzzSmokeCorpusIssue[]
  nextSteps: string[]
}

function issue(
  severity: FlowDocRustybuzzSmokeCorpusIssueSeverity,
  code: FlowDocRustybuzzSmokeCorpusIssueCode,
  message: string,
  targetId?: string,
): FlowDocRustybuzzSmokeCorpusIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function createRequestId(smokeCase: FlowDocRustybuzzSmokeCorpusCaseInput): string {
  return [
    "text-engine-request",
    smokeCase.caseId || "missing-case-id",
    smokeCase.sampleId || "missing-sample-id",
    smokeCase.fontId || "missing-font-id",
    smokeCase.styleKey || "missing-style-key",
  ].join(":")
}

function createRequest(
  input: FlowDocRustybuzzSmokeCorpusMappingInput,
  smokeCase: FlowDocRustybuzzSmokeCorpusCaseInput,
  sample: FlowDocRustybuzzSmokeCorpusSampleInput,
): VNextTextEngineAdapterRequest {
  return {
    requestId: createRequestId(smokeCase),
    smokeCaseId: smokeCase.caseId,
    sampleId: smokeCase.sampleId,
    measurementProfileId: input.measurementProfileId,
    text: sample.text,
    locale: sample.locale,
    fontId: smokeCase.fontId,
    styleKey: smokeCase.styleKey,
    availableWidthPt: input.requestDefaults.availableWidthPt,
    outputShapeVersion: smokeCase.outputShapeVersion,
    requestedFacts: [...smokeCase.requiredFacts],
  }
}

function indexRawOutputs(
  rawOutputs: readonly FlowDocRustybuzzSmokeCorpusRawOutputInput[],
  blockingIssues: FlowDocRustybuzzSmokeCorpusIssue[],
): Map<string, FlowDocRustybuzzRawSmokeOutput> {
  const rawOutputsByCase = new Map<string, FlowDocRustybuzzRawSmokeOutput>()

  rawOutputs.forEach((rawOutput) => {
    if (rawOutputsByCase.has(rawOutput.caseId)) {
      blockingIssues.push(issue("blocking", "duplicate-raw-output", "Raw rustybuzz smoke fixtures must be unique per case.", rawOutput.caseId))
      return
    }

    rawOutputsByCase.set(rawOutput.caseId, rawOutput.rawOutput)
  })

  return rawOutputsByCase
}

export function createFlowDocRustybuzzSmokeCorpusMappingPlan(
  input: FlowDocRustybuzzSmokeCorpusMappingInput,
): FlowDocRustybuzzSmokeCorpusMappingPlan {
  const blockingIssues: FlowDocRustybuzzSmokeCorpusIssue[] = []
  const warningIssues: FlowDocRustybuzzSmokeCorpusIssue[] = []
  const samplesById = new Map(input.samples.map((sample) => [sample.sampleId, sample]))
  const rawOutputsByCase = indexRawOutputs(input.rawOutputs, blockingIssues)
  const caseIds = new Set<string>()
  const duplicateCaseIds = new Set<string>()
  const caseMappings: FlowDocRustybuzzSmokeCorpusCaseMapping[] = []

  if (input.corpusId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-corpus-id", "Rustybuzz smoke corpus mapping requires a stable corpus id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Rustybuzz smoke corpus mapping requires a policy revision."))
  }

  if (input.measurementProfileId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-measurement-profile-id", "Rustybuzz smoke corpus mapping requires a measurement profile id."))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Rustybuzz smoke corpus mapping cannot bind production measurement."))
  }

  if (input.cases.length === 0) {
    blockingIssues.push(issue("blocking", "missing-case", "Rustybuzz smoke corpus mapping requires at least one smoke case."))
  }

  input.cases.forEach((smokeCase) => {
    if (caseIds.has(smokeCase.caseId)) duplicateCaseIds.add(smokeCase.caseId)
    caseIds.add(smokeCase.caseId)

    if (smokeCase.outputShapeVersion !== "glyph-line-box-v1") {
      blockingIssues.push(issue("blocking", "case-output-shape-mismatch", "Rustybuzz smoke corpus only maps glyph-line-box-v1 cases.", smokeCase.caseId))
    }

    const sample = samplesById.get(smokeCase.sampleId)
    if (sample == null) {
      blockingIssues.push(issue("blocking", "missing-sample", "Every rustybuzz smoke case must have a corpus sample.", smokeCase.sampleId))
      return
    }

    const rawOutput = rawOutputsByCase.get(smokeCase.caseId)
    if (rawOutput == null) {
      blockingIssues.push(issue("blocking", "missing-raw-output", "Every rustybuzz smoke case must have a raw output fixture.", smokeCase.caseId))
      return
    }

    const request = createRequest(input, smokeCase, sample)
    const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
      request,
      rawOutput,
      engine: input.engine,
      fontSizePt: input.fontSizePt,
      lineHeightPt: input.lineHeightPt,
      bindProductionMeasurement: input.bindProductionMeasurement,
    })

    mapping.warningIssues.forEach((mappingIssue) => {
      warningIssues.push(issue("warning", mappingIssue.code === "missing-wasm-digest" ? "missing-wasm-digest" : "mapping-blocked", mappingIssue.message, smokeCase.caseId))
    })

    if (mapping.status === "blocked") {
      blockingIssues.push(issue("blocking", "mapping-blocked", "Raw rustybuzz mapping blocked this smoke case.", smokeCase.caseId))
    }

    caseMappings.push({
      caseId: smokeCase.caseId,
      request,
      mapping,
    })
  })

  duplicateCaseIds.forEach((caseId) => {
    blockingIssues.push(issue("blocking", "duplicate-case", "Rustybuzz smoke corpus case ids must be unique.", caseId))
  })

  const mappedCaseMappings = caseMappings.filter((caseMapping) => caseMapping.mapping.status === "ready")
  const status = blockingIssues.length === 0 && mappedCaseMappings.length === input.cases.length ? "ready" : "blocked"

  return {
    source: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_MODE,
    status,
    corpusId: input.corpusId,
    policyRevision: input.policyRevision,
    measurementProfileId: input.measurementProfileId,
    caseMappings,
    corpusContract: {
      consumes: "phase-107-smoke-cases-plus-raw-rustybuzz-fixtures",
      produces: "mapped-adapter-evidence-per-smoke-case",
      mappingBoundary: "phase-114-raw-cluster-mapping",
      requiresEverySmokeCaseFixture: true,
      productionMeasurementReady: false,
    },
    coverage: {
      caseCount: input.cases.length,
      mappedCaseCount: mappedCaseMappings.length,
      rawOutputCount: input.rawOutputs.length,
      glyphCount: mappedCaseMappings.reduce((total, caseMapping) => total + caseMapping.mapping.summary.glyphCount, 0),
      zeroAdvanceGlyphCount: mappedCaseMappings.reduce((total, caseMapping) => total + caseMapping.mapping.summary.zeroAdvanceGlyphCount, 0),
      repeatedClusterCaseCount: mappedCaseMappings.filter((caseMapping) => caseMapping.mapping.summary.repeatedClusterGlyphCount > 0).length,
      sampleIds: unique(mappedCaseMappings.map((caseMapping) => caseMapping.request.sampleId)),
      fontIds: unique(mappedCaseMappings.map((caseMapping) => caseMapping.request.fontId)),
      styleKeys: unique(mappedCaseMappings.map((caseMapping) => caseMapping.request.styleKey)),
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Run the same corpus harness from the future WASM loader and compare native/WASM mapped evidence.",
      "Add ICU4X line break opportunities so corpus cases can move beyond single-line smoke boxes.",
      "Only consider production measurement binding after corpus coverage, WASM digest, and line breaking are all stable.",
    ],
  }
}
