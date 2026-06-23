import type {
  VNextTextEngineAdapterEngineRef,
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterRequest,
} from "./textEngineAdapterSpi.js"

export const VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_SOURCE = "vnext-text-engine-evidence-acceptance"
export const VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_MODE = "text-engine-evidence-acceptance-boundary"

export type VNextTextEngineEvidenceAcceptanceStatus = "accepted" | "blocked"
export type VNextTextEngineEvidenceAcceptanceIssueSeverity = "blocking" | "warning"

export type VNextTextEngineEvidenceAcceptanceIssueCode =
  | "production-binding"
  | "missing-acceptance-id"
  | "missing-policy-revision"
  | "request-id-mismatch"
  | "measurement-profile-mismatch"
  | "output-shape-mismatch"
  | "engine-shaper-mismatch"
  | "engine-segmenter-mismatch"
  | "engine-revision-mismatch"
  | "nondeterministic-evidence-engine"
  | "core-executes-engine"
  | "mutates-pagination-draft"
  | "wrong-evidence-lane"
  | "missing-glyphs"
  | "missing-line-boxes"
  | "invalid-total-advance"
  | "invalid-line-height"
  | "glyph-index-not-contiguous"
  | "glyph-id-invalid"
  | "glyph-font-mismatch"
  | "glyph-advance-invalid"
  | "glyph-offset-invalid"
  | "glyph-cluster-range-invalid"
  | "glyph-cluster-range-out-of-bounds"
  | "line-index-not-contiguous"
  | "line-range-invalid"
  | "line-range-out-of-bounds"
  | "line-width-invalid"
  | "line-height-invalid"
  | "line-y-offset-invalid"
  | "line-glyph-range-invalid"
  | "line-glyph-range-out-of-bounds"
  | "line-glyph-coverage-incomplete"
  | "missing-wasm-digest"

export interface VNextTextEngineEvidenceAcceptancePolicy {
  evidenceLane: "glyph-facts-separate-from-pagination-draft"
  coreExecutesEngine: boolean
  mutatesPaginationDraft: boolean
}

export interface VNextTextEngineEvidenceAcceptanceInput {
  acceptanceId: string
  policyRevision: string
  bindProductionMeasurement?: boolean
  request: VNextTextEngineAdapterRequest
  evidence: VNextTextEngineAdapterEvidence
  expectedEngine: VNextTextEngineAdapterEngineRef
  acceptancePolicy: VNextTextEngineEvidenceAcceptancePolicy
}

export interface VNextTextEngineEvidenceAcceptanceIssue {
  severity: VNextTextEngineEvidenceAcceptanceIssueSeverity
  code: VNextTextEngineEvidenceAcceptanceIssueCode
  message: string
  targetId?: string
}

export interface VNextTextEngineEvidenceAcceptancePlan {
  source: typeof VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_SOURCE
  mode: typeof VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_MODE
  status: VNextTextEngineEvidenceAcceptanceStatus
  acceptanceId: string
  policyRevision: string
  requestId: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  acceptedEvidence: VNextTextEngineAdapterEvidence | null
  summary: {
    glyphCount: number
    lineBoxCount: number
    totalAdvancePt: number
    lineHeightPt: number
  }
  acceptanceContract: {
    consumes: "vnext-text-engine-adapter-evidence"
    evidenceLane: "glyph-facts-separate-from-pagination-draft"
    validatesGlyphFacts: true
    validatesLineBoxFacts: true
    validatesClusterRanges: true
    producesMeasurementDraft: false
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
  blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[]
  warningIssues: VNextTextEngineEvidenceAcceptanceIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextTextEngineEvidenceAcceptanceIssueSeverity,
  code: VNextTextEngineEvidenceAcceptanceIssueCode,
  message: string,
  targetId?: string,
): VNextTextEngineEvidenceAcceptanceIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function isNonNegativeFinite(value: number): boolean {
  return isFiniteNumber(value) && value >= 0
}

function isPositiveFinite(value: number): boolean {
  return isFiniteNumber(value) && value > 0
}

function cloneEngine(engine: VNextTextEngineAdapterEngineRef): VNextTextEngineAdapterEngineRef {
  return { ...engine }
}

function cloneGlyph(glyph: VNextTextEngineAdapterGlyphFact): VNextTextEngineAdapterGlyphFact {
  return { ...glyph }
}

function cloneLineBox(lineBox: VNextTextEngineAdapterLineBoxFact): VNextTextEngineAdapterLineBoxFact {
  return { ...lineBox }
}

function cloneEvidence(evidence: VNextTextEngineAdapterEvidence): VNextTextEngineAdapterEvidence {
  return {
    ...evidence,
    engine: cloneEngine(evidence.engine),
    glyphs: evidence.glyphs.map(cloneGlyph),
    lineBoxes: evidence.lineBoxes.map(cloneLineBox),
  }
}

function validateEngine(
  evidence: VNextTextEngineAdapterEvidence,
  expectedEngine: VNextTextEngineAdapterEngineRef,
  blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[],
  warningIssues: VNextTextEngineEvidenceAcceptanceIssue[],
): void {
  if (evidence.engine.shaper !== expectedEngine.shaper) {
    blockingIssues.push(issue("blocking", "engine-shaper-mismatch", "Evidence shaper must match the expected adapter shaper.", evidence.engine.shaper))
  }

  if (evidence.engine.segmenter !== expectedEngine.segmenter) {
    blockingIssues.push(issue("blocking", "engine-segmenter-mismatch", "Evidence segmenter must match the expected adapter segmenter.", evidence.engine.segmenter))
  }

  if (
    evidence.engine.shaperRevision !== expectedEngine.shaperRevision
    || evidence.engine.segmenterRevision !== expectedEngine.segmenterRevision
    || evidence.engine.segmenterDataRevision !== expectedEngine.segmenterDataRevision
  ) {
    blockingIssues.push(issue("blocking", "engine-revision-mismatch", "Evidence engine revisions must match the accepted profile identity."))
  }

  if (!evidence.engine.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-evidence-engine", "Evidence must come from a deterministic text engine."))
  }

  if (expectedEngine.wasmDigest != null && expectedEngine.wasmDigest.trim().length > 0) {
    if (evidence.engine.wasmDigest !== expectedEngine.wasmDigest) {
      blockingIssues.push(issue("blocking", "engine-revision-mismatch", "Evidence WASM digest must match the expected engine digest."))
    }
  } else if (evidence.engine.wasmDigest == null || evidence.engine.wasmDigest.trim().length === 0) {
    warningIssues.push(issue("warning", "missing-wasm-digest", "Evidence has no WASM digest yet; production measurement must pin it."))
  }
}

function validateGlyph(
  request: VNextTextEngineAdapterRequest,
  glyph: VNextTextEngineAdapterGlyphFact,
  expectedIndex: number,
  blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[],
): void {
  const targetId = `${request.requestId}:glyph:${expectedIndex}`

  if (glyph.glyphIndex !== expectedIndex) {
    blockingIssues.push(issue("blocking", "glyph-index-not-contiguous", "Glyph facts must use contiguous glyph indexes.", targetId))
  }

  if (!Number.isInteger(glyph.glyphId) || glyph.glyphId < 0) {
    blockingIssues.push(issue("blocking", "glyph-id-invalid", "Glyph ids must be non-negative integers.", targetId))
  }

  if (glyph.fontId !== request.fontId) {
    blockingIssues.push(issue("blocking", "glyph-font-mismatch", "Glyph facts must reference the request font id in this boundary.", targetId))
  }

  if (!isNonNegativeFinite(glyph.advancePt)) {
    blockingIssues.push(issue("blocking", "glyph-advance-invalid", "Glyph advances must be finite non-negative point values.", targetId))
  }

  if (!isFiniteNumber(glyph.offsetXPt) || !isFiniteNumber(glyph.offsetYPt)) {
    blockingIssues.push(issue("blocking", "glyph-offset-invalid", "Glyph offsets must be finite point values.", targetId))
  }

  if (
    !Number.isInteger(glyph.clusterStartOffset)
    || !Number.isInteger(glyph.clusterEndOffset)
    || glyph.clusterStartOffset < 0
    || glyph.clusterEndOffset <= glyph.clusterStartOffset
  ) {
    blockingIssues.push(issue("blocking", "glyph-cluster-range-invalid", "Glyph cluster ranges must be positive integer text ranges.", targetId))
    return
  }

  if (glyph.clusterEndOffset > request.text.length) {
    blockingIssues.push(issue("blocking", "glyph-cluster-range-out-of-bounds", "Glyph cluster ranges must stay inside request text.", targetId))
  }
}

function validateLineBox(
  request: VNextTextEngineAdapterRequest,
  lineBox: VNextTextEngineAdapterLineBoxFact,
  expectedIndex: number,
  glyphCount: number,
  blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[],
): void {
  const targetId = `${request.requestId}:line:${expectedIndex}`

  if (lineBox.lineIndex !== expectedIndex) {
    blockingIssues.push(issue("blocking", "line-index-not-contiguous", "Line box facts must use contiguous line indexes.", targetId))
  }

  if (
    !Number.isInteger(lineBox.startOffset)
    || !Number.isInteger(lineBox.endOffset)
    || lineBox.startOffset < 0
    || lineBox.endOffset <= lineBox.startOffset
  ) {
    blockingIssues.push(issue("blocking", "line-range-invalid", "Line box text ranges must be positive integer ranges.", targetId))
  } else if (lineBox.endOffset > request.text.length) {
    blockingIssues.push(issue("blocking", "line-range-out-of-bounds", "Line box ranges must stay inside request text.", targetId))
  }

  if (!isNonNegativeFinite(lineBox.widthPt)) {
    blockingIssues.push(issue("blocking", "line-width-invalid", "Line box widths must be finite non-negative point values.", targetId))
  }

  if (!isPositiveFinite(lineBox.heightPt)) {
    blockingIssues.push(issue("blocking", "line-height-invalid", "Line box heights must be positive point values.", targetId))
  }

  if (!isNonNegativeFinite(lineBox.yOffsetPt)) {
    blockingIssues.push(issue("blocking", "line-y-offset-invalid", "Line box y offsets must be finite non-negative point values.", targetId))
  }

  if (
    !Number.isInteger(lineBox.glyphStartIndex)
    || !Number.isInteger(lineBox.glyphEndIndex)
    || lineBox.glyphStartIndex < 0
    || lineBox.glyphEndIndex <= lineBox.glyphStartIndex
  ) {
    blockingIssues.push(issue("blocking", "line-glyph-range-invalid", "Line box glyph ranges must be positive integer ranges.", targetId))
  } else if (lineBox.glyphEndIndex > glyphCount) {
    blockingIssues.push(issue("blocking", "line-glyph-range-out-of-bounds", "Line box glyph ranges must stay inside accepted glyphs.", targetId))
  }
}

function validateLineGlyphCoverage(
  request: VNextTextEngineAdapterRequest,
  evidence: VNextTextEngineAdapterEvidence,
  blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[],
): void {
  if (evidence.glyphs.length === 0 || evidence.lineBoxes.length === 0) return

  const coverageCounts = Array.from({ length: evidence.glyphs.length }, () => 0)
  evidence.lineBoxes.forEach((lineBox) => {
    for (let index = lineBox.glyphStartIndex; index < lineBox.glyphEndIndex; index += 1) {
      if (index >= 0 && index < coverageCounts.length) {
        coverageCounts[index] += 1
      }
    }
  })

  if (coverageCounts.some((count) => count !== 1)) {
    blockingIssues.push(issue(
      "blocking",
      "line-glyph-coverage-incomplete",
      "Line boxes must cover every accepted glyph exactly once through their glyph ranges.",
      request.requestId,
    ))
  }
}

export function createVNextTextEngineEvidenceAcceptancePlan(
  input: VNextTextEngineEvidenceAcceptanceInput,
): VNextTextEngineEvidenceAcceptancePlan {
  const blockingIssues: VNextTextEngineEvidenceAcceptanceIssue[] = []
  const warningIssues: VNextTextEngineEvidenceAcceptanceIssue[] = []

  if (input.acceptanceId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-acceptance-id", "Text engine evidence acceptance plans require a stable acceptance id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Text engine evidence acceptance plans require a policy revision."))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Text engine evidence acceptance cannot bind production measurement in this phase."))
  }

  if (input.acceptancePolicy.coreExecutesEngine) {
    blockingIssues.push(issue("blocking", "core-executes-engine", "The core package must not execute text engines while accepting evidence."))
  }

  if (input.acceptancePolicy.mutatesPaginationDraft) {
    blockingIssues.push(issue("blocking", "mutates-pagination-draft", "Evidence acceptance must not mutate the pagination measurement draft."))
  }

  if (input.acceptancePolicy.evidenceLane !== "glyph-facts-separate-from-pagination-draft") {
    blockingIssues.push(issue("blocking", "wrong-evidence-lane", "Text engine evidence must stay on the glyph fact evidence lane."))
  }

  if (input.evidence.requestId !== input.request.requestId) {
    blockingIssues.push(issue("blocking", "request-id-mismatch", "Evidence request id must match the adapter request.", input.evidence.requestId))
  }

  if (input.evidence.measurementProfileId !== input.request.measurementProfileId) {
    blockingIssues.push(issue("blocking", "measurement-profile-mismatch", "Evidence measurement profile id must match the adapter request.", input.evidence.measurementProfileId))
  }

  if (input.evidence.outputShapeVersion !== input.request.outputShapeVersion) {
    blockingIssues.push(issue("blocking", "output-shape-mismatch", "Evidence output shape version must match the adapter request.", input.evidence.requestId))
  }

  validateEngine(input.evidence, input.expectedEngine, blockingIssues, warningIssues)

  if (input.evidence.glyphs.length === 0) {
    blockingIssues.push(issue("blocking", "missing-glyphs", "Accepted text engine evidence must include glyph facts.", input.evidence.requestId))
  }

  if (input.evidence.lineBoxes.length === 0) {
    blockingIssues.push(issue("blocking", "missing-line-boxes", "Accepted text engine evidence must include line box facts.", input.evidence.requestId))
  }

  if (!isPositiveFinite(input.evidence.totalAdvancePt)) {
    blockingIssues.push(issue("blocking", "invalid-total-advance", "Evidence total advance must be a positive point value.", input.evidence.requestId))
  }

  if (!isPositiveFinite(input.evidence.lineHeightPt)) {
    blockingIssues.push(issue("blocking", "invalid-line-height", "Evidence line height must be a positive point value.", input.evidence.requestId))
  }

  input.evidence.glyphs.forEach((glyph, index) => {
    validateGlyph(input.request, glyph, index, blockingIssues)
  })

  input.evidence.lineBoxes.forEach((lineBox, index) => {
    validateLineBox(input.request, lineBox, index, input.evidence.glyphs.length, blockingIssues)
  })

  validateLineGlyphCoverage(input.request, input.evidence, blockingIssues)

  const acceptedEvidence = blockingIssues.length === 0 ? cloneEvidence(input.evidence) : null

  return {
    source: VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_SOURCE,
    mode: VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_MODE,
    status: blockingIssues.length === 0 ? "accepted" : "blocked",
    acceptanceId: input.acceptanceId,
    policyRevision: input.policyRevision,
    requestId: input.request.requestId,
    measurementProfileId: input.request.measurementProfileId,
    outputShapeVersion: input.request.outputShapeVersion,
    acceptedEvidence,
    summary: {
      glyphCount: input.evidence.glyphs.length,
      lineBoxCount: input.evidence.lineBoxes.length,
      totalAdvancePt: input.evidence.totalAdvancePt,
      lineHeightPt: input.evidence.lineHeightPt,
    },
    acceptanceContract: {
      consumes: "vnext-text-engine-adapter-evidence",
      evidenceLane: "glyph-facts-separate-from-pagination-draft",
      validatesGlyphFacts: true,
      validatesLineBoxFacts: true,
      validatesClusterRanges: true,
      producesMeasurementDraft: false,
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
      "Run accepted evidence through the evidence-to-measurement draft handoff boundary.",
      "Keep glyph and cluster facts available for future caret and selection mapping.",
      "Pin WASM digest evidence before production measurement binding.",
    ],
  }
}
