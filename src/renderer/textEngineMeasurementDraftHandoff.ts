import type {
  VNextTextMeasurementDraft,
  VNextTextMeasurementLineBox,
} from "../pagination/textMeasurement.js"
import type {
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterRequest,
} from "./textEngineAdapterSpi.js"
import type {
  VNextTextEngineEvidenceAcceptancePlan,
} from "./textEngineEvidenceAcceptance.js"

export const VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_SOURCE = "vnext-text-engine-measurement-draft-handoff"
export const VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_MODE = "text-engine-evidence-to-measurement-draft-boundary"

export type VNextTextEngineMeasurementDraftHandoffStatus = "ready" | "blocked"
export type VNextTextEngineMeasurementDraftHandoffIssueSeverity = "blocking" | "warning"

export type VNextTextEngineMeasurementDraftHandoffIssueCode =
  | "production-binding"
  | "missing-handoff-id"
  | "missing-policy-revision"
  | "acceptance-not-accepted"
  | "missing-accepted-evidence"
  | "request-id-mismatch"
  | "measurement-profile-mismatch"
  | "output-shape-mismatch"
  | "core-executes-engine"
  | "mutates-evidence"
  | "attaches-glyph-facts-to-draft"
  | "replaces-pagination-measurer"
  | "missing-line-boxes"
  | "line-range-invalid"
  | "line-range-out-of-bounds"
  | "line-metrics-invalid"
  | "draft-dimensions-invalid"

export interface VNextTextEngineMeasurementDraftHandoffPolicy {
  consumesAcceptedEvidenceOnly: boolean
  coreExecutesEngine: boolean
  mutatesEvidence: boolean
  attachesGlyphFactsToDraft: boolean
  replacesPaginationMeasurer: boolean
}

export interface VNextTextEngineMeasurementDraftHandoffInput {
  handoffId: string
  policyRevision: string
  bindProductionMeasurement?: boolean
  request: VNextTextEngineAdapterRequest
  acceptance: VNextTextEngineEvidenceAcceptancePlan
  handoffPolicy: VNextTextEngineMeasurementDraftHandoffPolicy
}

export interface VNextTextEngineMeasurementDraftHandoffIssue {
  severity: VNextTextEngineMeasurementDraftHandoffIssueSeverity
  code: VNextTextEngineMeasurementDraftHandoffIssueCode
  message: string
  targetId?: string
}

export interface VNextTextEngineMeasurementDraftHandoffPlan {
  source: typeof VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_SOURCE
  mode: typeof VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_MODE
  status: VNextTextEngineMeasurementDraftHandoffStatus
  handoffId: string
  policyRevision: string
  requestId: string
  measurementProfileId: string
  draft: VNextTextMeasurementDraft | null
  summary: {
    lineCount: number
    widthPt: number
    heightPt: number
    lineHeightPt: number
  }
  handoffContract: {
    consumes: "accepted-text-engine-evidence"
    produces: "vnext-text-measurement-draft"
    evidenceLane: "glyph-facts-separate-from-pagination-draft"
    derivesLineTextFromRequestText: true
    dropsGlyphFactsFromDraft: true
    preservesEvidenceForCaretConsumers: true
  }
  executionContract: {
    importsEngine: false
    importsWasm: false
    readsFontFiles: false
    executesShaping: false
    executesSegmentation: false
    mutatesEvidence: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
  }
  blockingIssues: VNextTextEngineMeasurementDraftHandoffIssue[]
  warningIssues: VNextTextEngineMeasurementDraftHandoffIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextTextEngineMeasurementDraftHandoffIssueSeverity,
  code: VNextTextEngineMeasurementDraftHandoffIssueCode,
  message: string,
  targetId?: string,
): VNextTextEngineMeasurementDraftHandoffIssue {
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

function cloneLineBox(lineBox: VNextTextMeasurementLineBox): VNextTextMeasurementLineBox {
  return { ...lineBox }
}

function lineText(request: VNextTextEngineAdapterRequest, lineBox: VNextTextEngineAdapterLineBoxFact): string {
  return request.text.slice(lineBox.startOffset, lineBox.endOffset)
}

function toMeasurementLineBox(
  request: VNextTextEngineAdapterRequest,
  lineBox: VNextTextEngineAdapterLineBoxFact,
): VNextTextMeasurementLineBox {
  return {
    index: lineBox.lineIndex,
    text: lineText(request, lineBox),
    startOffset: lineBox.startOffset,
    endOffset: lineBox.endOffset,
    widthPt: lineBox.widthPt,
    heightPt: lineBox.heightPt,
    yOffsetPt: lineBox.yOffsetPt,
  }
}

function createDraft(
  request: VNextTextEngineAdapterRequest,
  evidence: VNextTextEngineAdapterEvidence,
): VNextTextMeasurementDraft {
  const lineBoxes = evidence.lineBoxes.map((lineBox) => toMeasurementLineBox(request, lineBox))
  const widthPt = lineBoxes.reduce((max, lineBox) => Math.max(max, lineBox.widthPt), 0)
  const heightPt = lineBoxes.reduce((max, lineBox) => Math.max(max, lineBox.yOffsetPt + lineBox.heightPt), 0)

  return {
    lines: lineBoxes.map((lineBox) => lineBox.text),
    lineBoxes: lineBoxes.map(cloneLineBox),
    lineHeightPt: evidence.lineHeightPt,
    widthPt,
    heightPt,
  }
}

function validateLineBoxForDraft(
  request: VNextTextEngineAdapterRequest,
  lineBox: VNextTextEngineAdapterLineBoxFact,
  blockingIssues: VNextTextEngineMeasurementDraftHandoffIssue[],
): void {
  const targetId = `${request.requestId}:line:${lineBox.lineIndex}`

  if (
    !Number.isInteger(lineBox.startOffset)
    || !Number.isInteger(lineBox.endOffset)
    || lineBox.startOffset < 0
    || lineBox.endOffset <= lineBox.startOffset
  ) {
    blockingIssues.push(issue("blocking", "line-range-invalid", "Accepted evidence line ranges must be positive integer ranges.", targetId))
  } else if (lineBox.endOffset > request.text.length) {
    blockingIssues.push(issue("blocking", "line-range-out-of-bounds", "Accepted evidence line ranges must stay inside request text.", targetId))
  }

  if (!isNonNegativeFinite(lineBox.widthPt) || !isPositiveFinite(lineBox.heightPt) || !isNonNegativeFinite(lineBox.yOffsetPt)) {
    blockingIssues.push(issue("blocking", "line-metrics-invalid", "Accepted evidence line metrics must be finite point values.", targetId))
  }
}

function validateDraftDimensions(
  draft: VNextTextMeasurementDraft,
  blockingIssues: VNextTextEngineMeasurementDraftHandoffIssue[],
  requestId: string,
): void {
  if (!isNonNegativeFinite(draft.widthPt) || !isPositiveFinite(draft.heightPt) || !isPositiveFinite(draft.lineHeightPt)) {
    blockingIssues.push(issue("blocking", "draft-dimensions-invalid", "Derived text measurement draft dimensions must be finite point values.", requestId))
  }
}

export function createVNextTextEngineMeasurementDraftHandoffPlan(
  input: VNextTextEngineMeasurementDraftHandoffInput,
): VNextTextEngineMeasurementDraftHandoffPlan {
  const blockingIssues: VNextTextEngineMeasurementDraftHandoffIssue[] = []
  const warningIssues: VNextTextEngineMeasurementDraftHandoffIssue[] = []
  const evidence = input.acceptance.acceptedEvidence

  if (input.handoffId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-handoff-id", "Text engine measurement draft handoff plans require a stable handoff id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Text engine measurement draft handoff plans require a policy revision."))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Text engine measurement draft handoff cannot bind production measurement in this phase."))
  }

  if (input.acceptance.status !== "accepted") {
    blockingIssues.push(issue("blocking", "acceptance-not-accepted", "Measurement draft handoff requires accepted text engine evidence.", input.acceptance.requestId))
  }

  if (evidence == null) {
    blockingIssues.push(issue("blocking", "missing-accepted-evidence", "Measurement draft handoff requires accepted evidence payload.", input.acceptance.requestId))
  }

  if (input.handoffPolicy.coreExecutesEngine) {
    blockingIssues.push(issue("blocking", "core-executes-engine", "Measurement draft handoff must not execute a text engine."))
  }

  if (input.handoffPolicy.mutatesEvidence) {
    blockingIssues.push(issue("blocking", "mutates-evidence", "Measurement draft handoff must not mutate accepted evidence."))
  }

  if (input.handoffPolicy.attachesGlyphFactsToDraft) {
    blockingIssues.push(issue("blocking", "attaches-glyph-facts-to-draft", "Glyph facts must remain on the evidence lane, not inside VNextTextMeasurementDraft."))
  }

  if (input.handoffPolicy.replacesPaginationMeasurer) {
    blockingIssues.push(issue("blocking", "replaces-pagination-measurer", "Measurement draft handoff cannot replace pagination measurement in this phase."))
  }

  if (evidence != null) {
    if (evidence.requestId !== input.request.requestId) {
      blockingIssues.push(issue("blocking", "request-id-mismatch", "Accepted evidence must match the handoff request id.", evidence.requestId))
    }

    if (evidence.measurementProfileId !== input.request.measurementProfileId) {
      blockingIssues.push(issue("blocking", "measurement-profile-mismatch", "Accepted evidence profile id must match the handoff request.", evidence.measurementProfileId))
    }

    if (evidence.outputShapeVersion !== input.request.outputShapeVersion) {
      blockingIssues.push(issue("blocking", "output-shape-mismatch", "Accepted evidence output shape must match the handoff request.", evidence.requestId))
    }

    if (evidence.lineBoxes.length === 0) {
      blockingIssues.push(issue("blocking", "missing-line-boxes", "Measurement draft handoff requires accepted line box facts.", evidence.requestId))
    }

    evidence.lineBoxes.forEach((lineBox) => {
      validateLineBoxForDraft(input.request, lineBox, blockingIssues)
    })
  }

  const draft = evidence != null && blockingIssues.length === 0 ? createDraft(input.request, evidence) : null
  if (draft != null) {
    validateDraftDimensions(draft, blockingIssues, input.request.requestId)
  }

  const finalDraft = blockingIssues.length === 0 && draft != null
    ? {
        ...draft,
        lines: [...draft.lines],
        lineBoxes: draft.lineBoxes?.map(cloneLineBox),
      }
    : null

  return {
    source: VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_SOURCE,
    mode: VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    handoffId: input.handoffId,
    policyRevision: input.policyRevision,
    requestId: input.request.requestId,
    measurementProfileId: input.request.measurementProfileId,
    draft: finalDraft,
    summary: {
      lineCount: finalDraft?.lines.length ?? 0,
      widthPt: finalDraft?.widthPt ?? 0,
      heightPt: finalDraft?.heightPt ?? 0,
      lineHeightPt: finalDraft?.lineHeightPt ?? 0,
    },
    handoffContract: {
      consumes: "accepted-text-engine-evidence",
      produces: "vnext-text-measurement-draft",
      evidenceLane: "glyph-facts-separate-from-pagination-draft",
      derivesLineTextFromRequestText: true,
      dropsGlyphFactsFromDraft: true,
      preservesEvidenceForCaretConsumers: true,
    },
    executionContract: {
      importsEngine: false,
      importsWasm: false,
      readsFontFiles: false,
      executesShaping: false,
      executesSegmentation: false,
      mutatesEvidence: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Wrap the handoff behind a renderer-backed text measurement provider after the external adapter exists.",
      "Keep accepted glyph evidence available for future caret and selection consumers.",
      "Compare derived drafts against existing approximate measurement before production binding.",
    ],
  }
}
