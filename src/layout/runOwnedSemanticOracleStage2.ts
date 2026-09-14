/**
 * Temporary Stage 2 proof helper. It is intentionally not exported from the
 * package entrypoint and never owns mutable document or layout state.
 */
export type RunOwnedDirection = "ltr" | "rtl"

export interface RunOwnedParagraphContext {
  paragraphId: string
  baseDirection: RunOwnedDirection
  writingMode: "horizontal-tb" | "vertical-rl" | "vertical-lr"
}

export interface RunOwnedAuthoredSpan {
  spanId: string
  startOffset: number
  endOffset: number
  text: string
  language?: string
  styleKey?: string
}

export interface RunOwnedProviderRun {
  startOffset: number
  endOffset: number
  script: string
  direction: RunOwnedDirection
  language: string
  fontId: string
  features: readonly string[]
}

export interface RunOwnedSeamCertificate {
  certificateId: string
  caretOffset: number
  leftSourceRange: { startOffset: number; endOffset: number }
  rightSourceRange: { startOffset: number; endOffset: number }
  sourceFactUnits: number
  propertyFactUnits: number
  shapingAndSegmentationUnits: number
  edgeFacts: {
    glyphFacts: readonly string[]
    clusterFacts: readonly string[]
    breakFacts: readonly string[]
    unsafeBoundaryFacts: readonly string[]
  }
}

export interface RunOwnedProviderFacts {
  providerId: string
  providerRevision: string
  runs: readonly RunOwnedProviderRun[]
  graphemeSafeOffsets: readonly number[]
  seamCertificates: readonly RunOwnedSeamCertificate[]
}

export interface RunOwnedSemanticOracleStage2Input {
  committedText: string
  authoredSpans: readonly RunOwnedAuthoredSpan[]
  paragraph: RunOwnedParagraphContext
  caretOffset: number
  composition: "committed" | "active"
  provider: RunOwnedProviderFacts
}

export interface RunOwnedAnalysisKey {
  script: string
  direction: RunOwnedDirection
  paragraphBaseDirection: RunOwnedDirection
  writingMode: RunOwnedParagraphContext["writingMode"]
  language: string
  fontId: string
  features: readonly string[]
  providerId: string
  providerRevision: string
}

export interface RunOwnedAnalysisRunDescriptor {
  runId: string
  startOffset: number
  endOffset: number
  text: string
  authoredSpanIds: readonly string[]
  analysisKey: RunOwnedAnalysisKey
}

export type RunOwnedNotAdmissibleReason =
  | "composition-active"
  | "invalid-caret"
  | "unsafe-surrogate-pair"
  | "uncertified-boundary"
  | "uncertified-seam"
  | "invalid-provider-facts"

export type RunOwnedBoundaryDecision =
  | {
    status: "certified"
    certificateId: string
    caretOffset: number
    seamFacts: {
      leftSourceRange: { startOffset: number; endOffset: number }
      rightSourceRange: { startOffset: number; endOffset: number }
      paragraphContext: RunOwnedParagraphContext
      leftAnalysisKey: RunOwnedAnalysisKey
      rightAnalysisKey: RunOwnedAnalysisKey
      edgeFacts: RunOwnedSeamCertificate["edgeFacts"]
    }
  }
  | { status: "not-admissible"; reason: RunOwnedNotAdmissibleReason }

export interface RunOwnedSemanticOracleStage2Result {
  runs: readonly RunOwnedAnalysisRunDescriptor[]
  decision: RunOwnedBoundaryDecision
}

function notAdmissible(
  input: RunOwnedSemanticOracleStage2Input,
  runs: readonly RunOwnedAnalysisRunDescriptor[],
  reason: RunOwnedNotAdmissibleReason,
): RunOwnedSemanticOracleStage2Result {
  return { runs, decision: { status: "not-admissible", reason } }
}

function isValidRange(range: { startOffset: number; endOffset: number }, textLength: number): boolean {
  return Number.isInteger(range.startOffset)
    && Number.isInteger(range.endOffset)
    && range.startOffset >= 0
    && range.endOffset >= range.startOffset
    && range.endOffset <= textLength
}

function isScalarSafe(text: string, caretOffset: number): boolean {
  if (caretOffset <= 0 || caretOffset >= text.length) return true
  const left = text.charCodeAt(caretOffset - 1)
  const right = text.charCodeAt(caretOffset)
  return !(left >= 0xd800 && left <= 0xdbff && right >= 0xdc00 && right <= 0xdfff)
}

function hasValidAuthoredSpans(input: RunOwnedSemanticOracleStage2Input): boolean {
  let expectedStart = 0
  for (const span of input.authoredSpans) {
    if (!isValidRange(span, input.committedText.length)
      || span.startOffset !== expectedStart
      || input.committedText.slice(span.startOffset, span.endOffset) !== span.text) {
      return false
    }
    expectedStart = span.endOffset
  }
  return expectedStart === input.committedText.length
}

function hasValidProviderRuns(input: RunOwnedSemanticOracleStage2Input): boolean {
  let expectedStart = 0
  for (const run of input.provider.runs) {
    if (!isValidRange(run, input.committedText.length)
      || run.startOffset === run.endOffset
      || run.startOffset !== expectedStart
      || !run.script
      || !run.language
      || !run.fontId) {
      return false
    }
    expectedStart = run.endOffset
  }
  return expectedStart === input.committedText.length
}

function authoredSpanIds(
  spans: readonly RunOwnedAuthoredSpan[],
  startOffset: number,
  endOffset: number,
): readonly string[] {
  return spans
    .filter((span) => span.startOffset < endOffset && span.endOffset > startOffset)
    .map((span) => span.spanId)
}

function descriptor(
  input: RunOwnedSemanticOracleStage2Input,
  providerRun: RunOwnedProviderRun,
  index: number,
  startOffset: number,
  endOffset: number,
): RunOwnedAnalysisRunDescriptor {
  return {
    runId: `provider-run-${index}:${startOffset}-${endOffset}`,
    startOffset,
    endOffset,
    text: input.committedText.slice(startOffset, endOffset),
    authoredSpanIds: authoredSpanIds(input.authoredSpans, startOffset, endOffset),
    analysisKey: {
      script: providerRun.script,
      direction: providerRun.direction,
      paragraphBaseDirection: input.paragraph.baseDirection,
      writingMode: input.paragraph.writingMode,
      language: providerRun.language,
      fontId: providerRun.fontId,
      features: [...providerRun.features],
      providerId: input.provider.providerId,
      providerRevision: input.provider.providerRevision,
    },
  }
}

function deriveRuns(input: RunOwnedSemanticOracleStage2Input, splitAt?: number): readonly RunOwnedAnalysisRunDescriptor[] {
  return input.provider.runs.flatMap((providerRun, index) => {
    if (splitAt !== undefined && providerRun.startOffset < splitAt && splitAt < providerRun.endOffset) {
      return [
        descriptor(input, providerRun, index, providerRun.startOffset, splitAt),
        descriptor(input, providerRun, index, splitAt, providerRun.endOffset),
      ]
    }
    return [descriptor(input, providerRun, index, providerRun.startOffset, providerRun.endOffset)]
  })
}

function isCertifiedSeam(certificate: RunOwnedSeamCertificate, caretOffset: number, textLength: number): boolean {
  return certificate.caretOffset === caretOffset
    && isValidRange(certificate.leftSourceRange, textLength)
    && isValidRange(certificate.rightSourceRange, textLength)
    && certificate.leftSourceRange.endOffset === caretOffset
    && certificate.rightSourceRange.startOffset === caretOffset
    && certificate.sourceFactUnits >= 0
    && certificate.sourceFactUnits <= 512
    && certificate.propertyFactUnits >= 0
    && certificate.propertyFactUnits <= 512
    && certificate.shapingAndSegmentationUnits >= 0
    && certificate.shapingAndSegmentationUnits <= 1024
    && certificate.edgeFacts.glyphFacts.length > 0
    && certificate.edgeFacts.clusterFacts.length > 0
    && certificate.edgeFacts.breakFacts.length > 0
    && certificate.edgeFacts.unsafeBoundaryFacts.length > 0
}

function cloneAnalysisKey(key: RunOwnedAnalysisKey): RunOwnedAnalysisKey {
  return { ...key, features: [...key.features] }
}

export function evaluateRunOwnedSemanticOracleStage2(
  input: RunOwnedSemanticOracleStage2Input,
): RunOwnedSemanticOracleStage2Result {
  if (!hasValidAuthoredSpans(input) || !hasValidProviderRuns(input)) {
    return notAdmissible(input, [], "invalid-provider-facts")
  }

  const derivedRuns = deriveRuns(input)
  if (input.composition === "active") {
    return notAdmissible(input, derivedRuns, "composition-active")
  }
  if (!Number.isInteger(input.caretOffset) || input.caretOffset < 0 || input.caretOffset > input.committedText.length) {
    return notAdmissible(input, derivedRuns, "invalid-caret")
  }
  if (!isScalarSafe(input.committedText, input.caretOffset)) {
    return notAdmissible(input, derivedRuns, "unsafe-surrogate-pair")
  }
  if (!input.provider.graphemeSafeOffsets.includes(input.caretOffset)) {
    return notAdmissible(input, derivedRuns, "uncertified-boundary")
  }

  const certificate = input.provider.seamCertificates.find((candidate) => (
    isCertifiedSeam(candidate, input.caretOffset, input.committedText.length)
  ))
  if (!certificate) {
    return notAdmissible(input, derivedRuns, "uncertified-seam")
  }

  const certifiedRuns = deriveRuns(input, input.caretOffset)
  const leftRun = [...certifiedRuns].reverse().find((run) => run.endOffset === input.caretOffset)
  const rightRun = certifiedRuns.find((run) => run.startOffset === input.caretOffset)
  if (!leftRun || !rightRun) {
    return notAdmissible(input, derivedRuns, "uncertified-seam")
  }

  return {
    runs: certifiedRuns,
    decision: {
      status: "certified",
      certificateId: certificate.certificateId,
      caretOffset: input.caretOffset,
      seamFacts: {
        leftSourceRange: { ...certificate.leftSourceRange },
        rightSourceRange: { ...certificate.rightSourceRange },
        paragraphContext: { ...input.paragraph },
        leftAnalysisKey: cloneAnalysisKey(leftRun.analysisKey),
        rightAnalysisKey: cloneAnalysisKey(rightRun.analysisKey),
        edgeFacts: {
          glyphFacts: [...certificate.edgeFacts.glyphFacts],
          clusterFacts: [...certificate.edgeFacts.clusterFacts],
          breakFacts: [...certificate.edgeFacts.breakFacts],
          unsafeBoundaryFacts: [...certificate.edgeFacts.unsafeBoundaryFacts],
        },
      },
    },
  }
}
