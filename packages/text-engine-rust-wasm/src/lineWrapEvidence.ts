import type {
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterRequest,
  VNextThaiLineBreakEvidenceEntry,
  VNextThaiLineBreakKind,
} from "@flowdoc/vnext-core"

export const FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_SOURCE = "flowdoc-text-engine-line-wrap-evidence"
export const FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_MODE = "glyph-advance-line-break-wrap-boundary"

export type FlowDocTextEngineLineWrapEvidenceStatus = "ready" | "blocked"
export type FlowDocTextEngineLineWrapEvidenceIssueSeverity = "blocking" | "warning"
export type FlowDocTextEngineLineWrapBreakReason =
  | "available-width"
  | "mandatory-break"
  | "overflow-first-break"

export type FlowDocTextEngineLineWrapEvidenceIssueCode =
  | "production-binding"
  | "invalid-available-width"
  | "request-id-mismatch"
  | "measurement-profile-mismatch"
  | "output-shape-mismatch"
  | "sample-id-mismatch"
  | "text-mismatch"
  | "missing-glyphs"
  | "missing-break-opportunities"
  | "invalid-break-offset"
  | "break-offset-not-ascending"
  | "break-offset-out-of-bounds"
  | "break-splits-glyph-cluster"
  | "missing-final-break"
  | "line-glyph-range-invalid"
  | "line-overflows-available-width"

export interface FlowDocTextEngineLineWrapEvidenceInput {
  request: VNextTextEngineAdapterRequest
  glyphEvidence: VNextTextEngineAdapterEvidence
  breakEvidence: VNextThaiLineBreakEvidenceEntry
  availableWidthPt?: number
  bindProductionMeasurement?: boolean
}

export interface FlowDocTextEngineLineWrapLineSummary {
  lineIndex: number
  startOffset: number
  endOffset: number
  glyphStartIndex: number
  glyphEndIndex: number
  widthPt: number
  breakOffset: number
  breakKind: VNextThaiLineBreakKind
  breakReason: FlowDocTextEngineLineWrapBreakReason
  overflowsAvailableWidth: boolean
}

export interface FlowDocTextEngineLineWrapEvidenceIssue {
  severity: FlowDocTextEngineLineWrapEvidenceIssueSeverity
  code: FlowDocTextEngineLineWrapEvidenceIssueCode
  message: string
  targetId?: string
}

export interface FlowDocTextEngineLineWrapEvidencePlan {
  source: typeof FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_MODE
  status: FlowDocTextEngineLineWrapEvidenceStatus
  requestId: string
  sampleId: string
  evidence: VNextTextEngineAdapterEvidence | null
  lineSummaries: FlowDocTextEngineLineWrapLineSummary[]
  wrapContract: {
    consumesGlyphEvidence: "accepted-vnext-text-engine-adapter-evidence"
    consumesBreakEvidence: "thai-line-break-opportunity-evidence"
    produces: "vnext-text-engine-adapter-evidence"
    breakReasonLane: "line-wrap-summary-not-public-line-box-fact"
    lineBoxShape: "glyph-line-box-v1"
    offsetUnit: "utf16-code-unit"
    productionMeasurementReady: false
  }
  executionContract: {
    importsIcu4x: false
    importsRustybuzz: false
    importsWasm: false
    computesGlyphs: false
    computesBreaks: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
  }
  coverage: {
    lineCount: number
    glyphCount: number
    coveredGlyphCount: number
    overflowLineCount: number
    availableWidthPt: number
  }
  blockingIssues: FlowDocTextEngineLineWrapEvidenceIssue[]
  warningIssues: FlowDocTextEngineLineWrapEvidenceIssue[]
  nextSteps: string[]
}

interface BreakCandidate {
  offset: number
  kind: VNextThaiLineBreakKind
}

interface LineCandidate {
  breakCandidate: BreakCandidate
  glyphEndIndex: number
  widthPt: number
}

function issue(
  severity: FlowDocTextEngineLineWrapEvidenceIssueSeverity,
  code: FlowDocTextEngineLineWrapEvidenceIssueCode,
  message: string,
  targetId?: string,
): FlowDocTextEngineLineWrapEvidenceIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function roundPt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function cloneGlyph(glyph: VNextTextEngineAdapterGlyphFact): VNextTextEngineAdapterGlyphFact {
  return { ...glyph }
}

function cloneLineBox(lineBox: VNextTextEngineAdapterLineBoxFact): VNextTextEngineAdapterLineBoxFact {
  return { ...lineBox }
}

function normalizeBreaks(
  request: VNextTextEngineAdapterRequest,
  breakEvidence: VNextThaiLineBreakEvidenceEntry,
  glyphs: readonly VNextTextEngineAdapterGlyphFact[],
  blockingIssues: FlowDocTextEngineLineWrapEvidenceIssue[],
): BreakCandidate[] {
  const breaks = breakEvidence.breaks.map((opportunity) => ({
    offset: opportunity.offset,
    kind: opportunity.kind,
  }))
  let previousOffset = 0

  if (breaks.length === 0) {
    blockingIssues.push(issue("blocking", "missing-break-opportunities", "Line wrapping requires break opportunities.", request.requestId))
    return breaks
  }

  breaks.forEach((candidate, index) => {
    const targetId = `${breakEvidence.evidenceId}:break:${index}`

    if (!Number.isInteger(candidate.offset) || candidate.offset <= 0) {
      blockingIssues.push(issue("blocking", "invalid-break-offset", "Break offsets must be positive UTF-16 code unit offsets.", targetId))
      return
    }

    if (candidate.offset <= previousOffset) {
      blockingIssues.push(issue("blocking", "break-offset-not-ascending", "Break offsets must be strictly ascending.", targetId))
    }

    if (candidate.offset > request.text.length) {
      blockingIssues.push(issue("blocking", "break-offset-out-of-bounds", "Break offsets must stay inside request text.", targetId))
    }

    if (candidate.offset < request.text.length && glyphs.some((glyph) => (
      glyph.clusterStartOffset < candidate.offset && candidate.offset < glyph.clusterEndOffset
    ))) {
      blockingIssues.push(issue("blocking", "break-splits-glyph-cluster", "Break offsets must not split glyph cluster ranges.", targetId))
    }

    previousOffset = candidate.offset
  })

  if (breaks[breaks.length - 1]?.offset !== request.text.length) {
    blockingIssues.push(issue("blocking", "missing-final-break", "Line wrapping requires a final break at the end of the sample.", breakEvidence.evidenceId))
  }

  return breaks
}

function glyphBoundaryForOffset(
  glyphs: readonly VNextTextEngineAdapterGlyphFact[],
  offset: number,
): number {
  if (offset <= 0) return 0

  const boundary = glyphs.findIndex((glyph) => glyph.clusterStartOffset >= offset)
  return boundary === -1 ? glyphs.length : boundary
}

function measureCandidate(
  glyphs: readonly VNextTextEngineAdapterGlyphFact[],
  glyphStartIndex: number,
  breakCandidate: BreakCandidate,
): LineCandidate {
  const glyphEndIndex = glyphBoundaryForOffset(glyphs, breakCandidate.offset)
  const widthPt = roundPt(glyphs.slice(glyphStartIndex, glyphEndIndex).reduce((total, glyph) => total + glyph.advancePt, 0))

  return {
    breakCandidate,
    glyphEndIndex,
    widthPt,
  }
}

function chooseLineCandidate(
  glyphs: readonly VNextTextEngineAdapterGlyphFact[],
  breaks: readonly BreakCandidate[],
  startOffset: number,
  glyphStartIndex: number,
  availableWidthPt: number,
): LineCandidate {
  const candidates = breaks.filter((candidate) => candidate.offset > startOffset)
  let chosen = measureCandidate(glyphs, glyphStartIndex, candidates[0] ?? {
    offset: startOffset,
    kind: "mandatory",
  })

  for (const candidate of candidates) {
    const measured = measureCandidate(glyphs, glyphStartIndex, candidate)

    if (measured.widthPt <= availableWidthPt) {
      chosen = measured
      if (candidate.kind === "mandatory") break
      continue
    }

    if (chosen.breakCandidate.offset === candidate.offset) {
      chosen = measured
    }
    break
  }

  return chosen
}

function createLineBoxes(
  request: VNextTextEngineAdapterRequest,
  glyphEvidence: VNextTextEngineAdapterEvidence,
  breaks: readonly BreakCandidate[],
  availableWidthPt: number,
  warningIssues: FlowDocTextEngineLineWrapEvidenceIssue[],
): {
  lineBoxes: VNextTextEngineAdapterLineBoxFact[]
  summaries: FlowDocTextEngineLineWrapLineSummary[]
} {
  const glyphs = glyphEvidence.glyphs
  const lineBoxes: VNextTextEngineAdapterLineBoxFact[] = []
  const summaries: FlowDocTextEngineLineWrapLineSummary[] = []
  let startOffset = 0
  let glyphStartIndex = 0

  while (startOffset < request.text.length) {
    const chosen = chooseLineCandidate(glyphs, breaks, startOffset, glyphStartIndex, availableWidthPt)
    const lineIndex = lineBoxes.length
    const overflowsAvailableWidth = chosen.widthPt > availableWidthPt
    const isFinalBreak = chosen.breakCandidate.offset === request.text.length
    const breakReason: FlowDocTextEngineLineWrapBreakReason = overflowsAvailableWidth
      ? "overflow-first-break"
      : isFinalBreak || chosen.breakCandidate.kind === "mandatory"
        ? "mandatory-break"
        : "available-width"

    if (overflowsAvailableWidth) {
      warningIssues.push(issue(
        "warning",
        "line-overflows-available-width",
        "The first available break opportunity overflows the requested width.",
        `${request.requestId}:line:${lineIndex}`,
      ))
    }

    lineBoxes.push({
      lineIndex,
      startOffset,
      endOffset: chosen.breakCandidate.offset,
      widthPt: chosen.widthPt,
      heightPt: glyphEvidence.lineHeightPt,
      yOffsetPt: roundPt(lineIndex * glyphEvidence.lineHeightPt),
      glyphStartIndex,
      glyphEndIndex: chosen.glyphEndIndex,
    })

    summaries.push({
      lineIndex,
      startOffset,
      endOffset: chosen.breakCandidate.offset,
      glyphStartIndex,
      glyphEndIndex: chosen.glyphEndIndex,
      widthPt: chosen.widthPt,
      breakOffset: chosen.breakCandidate.offset,
      breakKind: chosen.breakCandidate.kind,
      breakReason,
      overflowsAvailableWidth,
    })

    startOffset = chosen.breakCandidate.offset
    glyphStartIndex = chosen.glyphEndIndex
  }

  return { lineBoxes, summaries }
}

function validateInput(
  input: FlowDocTextEngineLineWrapEvidenceInput,
  availableWidthPt: number,
  blockingIssues: FlowDocTextEngineLineWrapEvidenceIssue[],
): void {
  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Line wrap evidence cannot bind production measurement."))
  }

  if (!isPositiveFinite(availableWidthPt)) {
    blockingIssues.push(issue("blocking", "invalid-available-width", "Line wrap evidence requires a positive available width."))
  }

  if (input.glyphEvidence.requestId !== input.request.requestId) {
    blockingIssues.push(issue("blocking", "request-id-mismatch", "Glyph evidence must match the adapter request id.", input.glyphEvidence.requestId))
  }

  if (input.glyphEvidence.measurementProfileId !== input.request.measurementProfileId) {
    blockingIssues.push(issue("blocking", "measurement-profile-mismatch", "Glyph evidence must match the adapter request measurement profile.", input.glyphEvidence.measurementProfileId))
  }

  if (input.glyphEvidence.outputShapeVersion !== input.request.outputShapeVersion) {
    blockingIssues.push(issue("blocking", "output-shape-mismatch", "Glyph evidence must match the adapter request output shape.", input.glyphEvidence.outputShapeVersion))
  }

  if (input.breakEvidence.sampleId !== input.request.sampleId) {
    blockingIssues.push(issue("blocking", "sample-id-mismatch", "Break evidence must reference the adapter request sample.", input.breakEvidence.sampleId))
  }

  if (input.glyphEvidence.glyphs.length === 0) {
    blockingIssues.push(issue("blocking", "missing-glyphs", "Line wrap evidence requires accepted glyph facts.", input.request.requestId))
  }
}

function validateLineGlyphRanges(
  request: VNextTextEngineAdapterRequest,
  lineBoxes: readonly VNextTextEngineAdapterLineBoxFact[],
  glyphCount: number,
  blockingIssues: FlowDocTextEngineLineWrapEvidenceIssue[],
): void {
  lineBoxes.forEach((lineBox, index) => {
    const expectedStart = index === 0 ? 0 : lineBoxes[index - 1]?.glyphEndIndex
    if (
      expectedStart == null
      || lineBox.glyphStartIndex !== expectedStart
      || lineBox.glyphEndIndex <= lineBox.glyphStartIndex
      || (index === lineBoxes.length - 1 && lineBox.glyphEndIndex !== glyphCount)
    ) {
      blockingIssues.push(issue("blocking", "line-glyph-range-invalid", "Wrapped line glyph ranges must cover every glyph exactly once.", `${request.requestId}:line:${index}`))
    }
  })
}

export function createFlowDocTextEngineLineWrapEvidencePlan(
  input: FlowDocTextEngineLineWrapEvidenceInput,
): FlowDocTextEngineLineWrapEvidencePlan {
  const availableWidthPt = input.availableWidthPt ?? input.request.availableWidthPt
  const blockingIssues: FlowDocTextEngineLineWrapEvidenceIssue[] = []
  const warningIssues: FlowDocTextEngineLineWrapEvidenceIssue[] = []

  validateInput(input, availableWidthPt, blockingIssues)

  const glyphs = input.glyphEvidence.glyphs.map(cloneGlyph)
  const breaks = normalizeBreaks(input.request, input.breakEvidence, glyphs, blockingIssues)
  const wrapped = blockingIssues.length === 0
    ? createLineBoxes(input.request, input.glyphEvidence, breaks, availableWidthPt, warningIssues)
    : { lineBoxes: [], summaries: [] }

  validateLineGlyphRanges(input.request, wrapped.lineBoxes, glyphs.length, blockingIssues)

  const lineBoxes = wrapped.lineBoxes.map(cloneLineBox)
  const evidence = blockingIssues.length === 0
    ? {
      ...input.glyphEvidence,
      glyphs,
      lineBoxes,
      totalAdvancePt: roundPt(glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)),
      lineHeightPt: input.glyphEvidence.lineHeightPt,
    }
    : null

  return {
    source: FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    requestId: input.request.requestId,
    sampleId: input.request.sampleId,
    evidence,
    lineSummaries: wrapped.summaries.map((summary) => ({ ...summary })),
    wrapContract: {
      consumesGlyphEvidence: "accepted-vnext-text-engine-adapter-evidence",
      consumesBreakEvidence: "thai-line-break-opportunity-evidence",
      produces: "vnext-text-engine-adapter-evidence",
      breakReasonLane: "line-wrap-summary-not-public-line-box-fact",
      lineBoxShape: "glyph-line-box-v1",
      offsetUnit: "utf16-code-unit",
      productionMeasurementReady: false,
    },
    executionContract: {
      importsIcu4x: false,
      importsRustybuzz: false,
      importsWasm: false,
      computesGlyphs: false,
      computesBreaks: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
    },
    coverage: {
      lineCount: wrapped.lineBoxes.length,
      glyphCount: glyphs.length,
      coveredGlyphCount: wrapped.lineBoxes.reduce((total, lineBox) => total + lineBox.glyphEndIndex - lineBox.glyphStartIndex, 0),
      overflowLineCount: wrapped.summaries.filter((summary) => summary.overflowsAvailableWidth).length,
      availableWidthPt,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Run accepted multi-line evidence through the core evidence acceptance and measurement draft handoff boundaries.",
      "Keep break reason metadata in the wrap summary until the public adapter line-box contract is intentionally expanded.",
      "Compare this evidence across native and WASM runtimes after digest pinning is available.",
    ],
  }
}
