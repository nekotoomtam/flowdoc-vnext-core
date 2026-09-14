import { z } from "zod"

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
  runId: string
  startOffset: number
  endOffset: number
  script: string
  direction: RunOwnedDirection
  language: string
  fontId: string
  features: readonly string[]
}

export interface RunOwnedAuthoredProperty {
  spanId: string
  language: string | null
  styleKey: string | null
}

export interface RunOwnedSeamSourceBinding {
  committedText: string
  authoredSpans: readonly { spanId: string; startOffset: number; endOffset: number }[]
}

export interface RunOwnedSeamRangeFact {
  factId: string
  startOffset: number
  endOffset: number
}

export type RunOwnedUnsafeBoundaryEvidence =
  | { status: "safe"; caretOffset: number }
  | { status: "unsafe"; reason: string }

export interface RunOwnedSeamCertificate {
  certificateId: string
  caretOffset: number
  leftSourceRange: { startOffset: number; endOffset: number }
  rightSourceRange: { startOffset: number; endOffset: number }
  work: readonly RunOwnedProofWork[]
  beforeFacts: RunOwnedSeamCertificate["edgeFacts"]
  edgeSummaries: {
    binding: RunOwnedProofBinding
    before: RunOwnedEdgeSummary
    after: RunOwnedEdgeSummary
  }
  outsideRangeValidity: {
    binding: RunOwnedProofBinding
    status: "preserved"
    ranges: readonly {
      startOffset: number; endOffset: number
      beforeDigest: string; afterDigest: string
      validity: "unchanged"
    }[]
  }
  sourceBinding: RunOwnedSeamSourceBinding
  providerId: string
  providerRevision: string
  paragraphContext: RunOwnedParagraphContext
  leftProviderRunId: string
  rightProviderRunId: string
  leftAuthoredProperties: readonly RunOwnedAuthoredProperty[]
  rightAuthoredProperties: readonly RunOwnedAuthoredProperty[]
  edgeFacts: {
    glyphFacts: readonly RunOwnedSeamRangeFact[]
    clusterFacts: readonly RunOwnedSeamRangeFact[]
    breakFacts: readonly RunOwnedSeamRangeFact[]
    unsafeBoundaryEvidence: RunOwnedUnsafeBoundaryEvidence
  }
}

export interface RunOwnedProofBinding {
  committedText: string
  authoredSpans: readonly RunOwnedAuthoredSpan[]
  paragraph: RunOwnedParagraphContext
  providerId: string
  providerRevision: string
  runs: readonly RunOwnedProviderRun[]
  graphemeSafeOffsets: readonly number[]
  caretOffset: number
}

export interface RunOwnedEdgeSummary {
  left: { glyphFactIds: readonly string[]; clusterFactIds: readonly string[]; breakFactIds: readonly string[]; safety: "safe" }
  right: RunOwnedEdgeSummary["left"]
}

export interface RunOwnedProofWork {
  operationId: string
  kind: "source" | "property" | "shaping" | "segmentation"
  phase: "before" | "after"
  timing: "immediate" | "deferred"
  ranges: readonly { startOffset: number; endOffset: number }[]
}

export interface RunOwnedWorkTotals {
  source: number; property: number; shaping: number; segmentation: number
}

export interface RunOwnedWorkAccounting extends RunOwnedWorkTotals {
  deferred: RunOwnedWorkTotals
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
  providerRunId: string
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
  authoredProperties: readonly RunOwnedAuthoredProperty[]
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
      sourceBinding: RunOwnedSeamSourceBinding
      providerId: string
      providerRevision: string
      paragraphContext: RunOwnedParagraphContext
      leftAnalysisKey: RunOwnedAnalysisKey
      rightAnalysisKey: RunOwnedAnalysisKey
      edgeFacts: RunOwnedSeamCertificate["edgeFacts"]
      beforeFacts: RunOwnedSeamCertificate["edgeFacts"]
      edgeSummaries: RunOwnedSeamCertificate["edgeSummaries"]
      outsideRangeValidity: RunOwnedSeamCertificate["outsideRangeValidity"]
      workAccounting: RunOwnedWorkAccounting
    }
  }
  | { status: "not-admissible"; reason: RunOwnedNotAdmissibleReason }

export interface RunOwnedSemanticOracleStage2Result {
  runs: readonly RunOwnedAnalysisRunDescriptor[]
  decision: RunOwnedBoundaryDecision
}

// Validate external runtime values before any derivation. Strict certificate
// objects also make legacy/ad-hoc budget counters inadmissible.
const identity = z.string().min(1).refine((value) => value.trim().length > 0)
const offset = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const rangeFields = { startOffset: offset, endOffset: offset }
const rangeSchema = z.object(rangeFields).strict()
const paragraphSchema = z.object({
  paragraphId: identity, baseDirection: z.enum(["ltr", "rtl"]),
  writingMode: z.enum(["horizontal-tb", "vertical-rl", "vertical-lr"]),
}).strict()
const authoredSchema = z.object({
  spanId: identity, ...rangeFields, text: z.string(), language: identity.optional(), styleKey: identity.optional(),
}).strict()
const runSchema = z.object({
  runId: identity, ...rangeFields, script: identity, direction: z.enum(["ltr", "rtl"]),
  language: identity, fontId: identity,
  features: z.array(z.string().regex(/^[A-Za-z0-9]{4}$/u)).refine((values) => new Set(values).size === values.length),
}).strict()
const bindingSchema = z.object({
  committedText: z.string(), authoredSpans: z.array(authoredSchema), paragraph: paragraphSchema,
  providerId: identity, providerRevision: identity, runs: z.array(runSchema),
  graphemeSafeOffsets: z.array(offset), caretOffset: offset,
}).strict()
const factSchema = z.object({ factId: identity, ...rangeFields }).strict()
const factsSchema = z.object({
  glyphFacts: z.array(factSchema), clusterFacts: z.array(factSchema), breakFacts: z.array(factSchema),
  unsafeBoundaryEvidence: z.discriminatedUnion("status", [
    z.object({ status: z.literal("safe"), caretOffset: offset }).strict(),
    z.object({ status: z.literal("unsafe"), reason: identity }).strict(),
  ]),
}).strict()
const edgeSchema = z.object({
  glyphFactIds: z.array(identity).min(1), clusterFactIds: z.array(identity).min(1),
  breakFactIds: z.array(identity).min(1), safety: z.literal("safe"),
}).strict()
const summarySchema = z.object({ left: edgeSchema, right: edgeSchema }).strict()
const propertySchema = z.object({ spanId: identity, language: identity.nullable(), styleKey: identity.nullable() }).strict()
const certificateSchema = z.object({
  certificateId: identity, caretOffset: offset, leftSourceRange: rangeSchema, rightSourceRange: rangeSchema,
  work: z.array(z.object({
    operationId: identity, kind: z.enum(["source", "property", "shaping", "segmentation"]),
    phase: z.enum(["before", "after"]), timing: z.enum(["immediate", "deferred"]),
    ranges: z.array(rangeSchema).min(1),
  }).strict()),
  sourceBinding: z.object({
    committedText: z.string(), authoredSpans: z.array(z.object({ spanId: identity, ...rangeFields }).strict()),
  }).strict(),
  providerId: identity, providerRevision: identity, paragraphContext: paragraphSchema,
  leftProviderRunId: identity, rightProviderRunId: identity,
  leftAuthoredProperties: z.array(propertySchema), rightAuthoredProperties: z.array(propertySchema),
  edgeFacts: factsSchema, beforeFacts: factsSchema,
  edgeSummaries: z.object({ binding: bindingSchema, before: summarySchema, after: summarySchema }).strict(),
  outsideRangeValidity: z.object({
    binding: bindingSchema, status: z.literal("preserved"),
    ranges: z.array(z.object({
      ...rangeFields, beforeDigest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
      afterDigest: z.string().regex(/^sha256:[a-f0-9]{64}$/u), validity: z.literal("unchanged"),
    }).strict()),
  }).strict(),
}).strict()
const inputSchema = z.object({
  committedText: z.string(), authoredSpans: z.array(authoredSchema), paragraph: paragraphSchema,
  caretOffset: z.number(), composition: z.enum(["committed", "active"]),
  provider: z.object({
    providerId: identity, providerRevision: identity, runs: z.array(runSchema),
    graphemeSafeOffsets: z.array(offset), seamCertificates: z.array(z.unknown()),
  }).strict(),
}).strict()

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
  const ids = new Set<string>()
  for (const span of input.authoredSpans) {
    if (!isValidRange(span, input.committedText.length)
      || ids.has(span.spanId)
      || span.startOffset === span.endOffset
      || span.startOffset !== expectedStart
      || input.committedText.slice(span.startOffset, span.endOffset) !== span.text) {
      return false
    }
    ids.add(span.spanId)
    expectedStart = span.endOffset
  }
  return expectedStart === input.committedText.length
}

function hasValidProviderRuns(input: RunOwnedSemanticOracleStage2Input): boolean {
  let expectedStart = 0
  const runIds = new Set<string>()
  for (const run of input.provider.runs) {
    if (!isValidRange(run, input.committedText.length)
      || run.startOffset === run.endOffset
      || run.startOffset !== expectedStart
      || !run.runId
      || runIds.has(run.runId)
      || !run.script
      || !run.language
      || !run.fontId) {
      return false
    }
    runIds.add(run.runId)
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

function authoredProperties(
  spans: readonly RunOwnedAuthoredSpan[],
  startOffset: number,
  endOffset: number,
): readonly RunOwnedAuthoredProperty[] {
  return spans
    .filter((span) => span.startOffset < endOffset && span.endOffset > startOffset)
    .map((span) => ({ spanId: span.spanId, language: span.language ?? null, styleKey: span.styleKey ?? null }))
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
    authoredProperties: authoredProperties(input.authoredSpans, startOffset, endOffset),
    analysisKey: {
      script: providerRun.script,
      direction: providerRun.direction,
      providerRunId: providerRun.runId,
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

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function exactPartition(
  ranges: readonly { startOffset: number; endOffset: number }[],
  startOffset: number, endOffset: number, text: string,
): boolean {
  let cursor = startOffset
  for (const range of ranges) {
    if (!isValidRange(range, text.length) || range.startOffset !== cursor
      || range.endOffset <= cursor || range.endOffset > endOffset
      || !isScalarSafe(text, range.startOffset) || !isScalarSafe(text, range.endOffset)) return false
    cursor = range.endOffset
  }
  return cursor === endOffset
}

function accountWork(certificate: RunOwnedSeamCertificate, input: RunOwnedSemanticOracleStage2Input): RunOwnedWorkAccounting | null {
  const totals: RunOwnedWorkAccounting = {
    source: 0, property: 0, shaping: 0, segmentation: 0,
    deferred: { source: 0, property: 0, shaping: 0, segmentation: 0 },
  }
  const ids = new Set<string>()
  const completed = new Set<string>()
  for (const work of certificate.work) {
    if (ids.has(work.operationId) || !exactPartition(work.ranges,
      certificate.leftSourceRange.startOffset, certificate.rightSourceRange.endOffset, input.committedText)) return null
    ids.add(work.operationId)
    const units = work.ranges.reduce((sum, range) => sum + range.endOffset - range.startOffset, 0)
    totals[work.kind] += units
    if (work.timing === "deferred") totals.deferred[work.kind] += units
    else completed.add(`${work.phase}:${work.kind}`)
  }
  // Both reference states need complete analysis. Deferred work is charged in
  // addition and cannot stand in for proof that has not yet been performed.
  for (const phase of ["before", "after"]) {
    for (const kind of ["source", "property", "shaping", "segmentation"]) {
      if (!completed.has(`${phase}:${kind}`)) return null
    }
  }
  return totals.source <= 512 && totals.property <= 512 && totals.shaping + totals.segmentation <= 1024
    ? totals : null
}

function proofBinding(input: RunOwnedSemanticOracleStage2Input): RunOwnedProofBinding {
  return {
    committedText: input.committedText, authoredSpans: input.authoredSpans, paragraph: input.paragraph,
    providerId: input.provider.providerId, providerRevision: input.provider.providerRevision,
    runs: input.provider.runs, graphemeSafeOffsets: input.provider.graphemeSafeOffsets, caretOffset: input.caretOffset,
  }
}

function summarizeEdges(facts: RunOwnedSeamCertificate["edgeFacts"], caret: number): RunOwnedEdgeSummary {
  const side = (left: boolean): RunOwnedEdgeSummary["left"] => {
    const ids = (items: readonly RunOwnedSeamRangeFact[]) => items
      .filter((fact) => left ? fact.startOffset < caret : fact.endOffset > caret).map((fact) => fact.factId)
    return { glyphFactIds: ids(facts.glyphFacts), clusterFactIds: ids(facts.clusterFacts), breakFactIds: ids(facts.breakFacts), safety: "safe" }
  }
  return { left: side(true), right: side(false) }
}

function validOutsideProof(certificate: RunOwnedSeamCertificate, input: RunOwnedSemanticOracleStage2Input): boolean {
  const proof = certificate.outsideRangeValidity
  if (!sameJson(proof.binding, proofBinding(input))) return false
  const expected = [
    { startOffset: 0, endOffset: certificate.leftSourceRange.startOffset },
    { startOffset: certificate.rightSourceRange.endOffset, endOffset: input.committedText.length },
  ].filter((range) => range.endOffset > range.startOffset)
  return proof.ranges.length === expected.length && proof.ranges.every((range, i) => (
    range.startOffset === expected[i]!.startOffset && range.endOffset === expected[i]!.endOffset
    && range.beforeDigest === range.afterDigest
  ))
}

function hasValidRangeFacts(
  facts: readonly RunOwnedSeamRangeFact[],
  certificate: RunOwnedSeamCertificate,
  text: string,
): boolean {
  const startOffset = certificate.leftSourceRange.startOffset
  const endOffset = certificate.rightSourceRange.endOffset
  return facts.length > 0 && new Set(facts.map((fact) => fact.factId)).size === facts.length
    && exactPartition(facts, startOffset, endOffset, text)
}

function isCertifiedSeam(
  certificate: RunOwnedSeamCertificate,
  input: RunOwnedSemanticOracleStage2Input,
  leftRun: RunOwnedAnalysisRunDescriptor,
  rightRun: RunOwnedAnalysisRunDescriptor,
): boolean {
  const { caretOffset, committedText, provider, paragraph, authoredSpans } = input
  const textLength = committedText.length
  return certificate.caretOffset === caretOffset
    && isValidRange(certificate.leftSourceRange, textLength)
    && isValidRange(certificate.rightSourceRange, textLength)
    && certificate.leftSourceRange.endOffset === caretOffset
    && certificate.rightSourceRange.startOffset === caretOffset
    && certificate.leftSourceRange.startOffset < caretOffset
    && certificate.rightSourceRange.endOffset > caretOffset
    && accountWork(certificate, input) !== null
    && sameJson(certificate.sourceBinding, {
      committedText,
      authoredSpans: authoredSpans.map(({ spanId, startOffset, endOffset }) => ({ spanId, startOffset, endOffset })),
    })
    && certificate.providerId === provider.providerId
    && certificate.providerRevision === provider.providerRevision
    && sameJson(certificate.paragraphContext, paragraph)
    && certificate.leftProviderRunId === leftRun.analysisKey.providerRunId
    && certificate.rightProviderRunId === rightRun.analysisKey.providerRunId
    && sameJson(certificate.leftAuthoredProperties, leftRun.authoredProperties)
    && sameJson(certificate.rightAuthoredProperties, rightRun.authoredProperties)
    && [certificate.beforeFacts, certificate.edgeFacts].every((facts) => (
      hasValidRangeFacts(facts.glyphFacts, certificate, committedText)
      && hasValidRangeFacts(facts.clusterFacts, certificate, committedText)
      && hasValidRangeFacts(facts.breakFacts, certificate, committedText)
      && facts.unsafeBoundaryEvidence.status === "safe"
      && facts.unsafeBoundaryEvidence.caretOffset === caretOffset
    ))
    && sameJson(certificate.edgeSummaries.binding, proofBinding(input))
    && sameJson(certificate.edgeSummaries.before, summarizeEdges(certificate.beforeFacts, caretOffset))
    && sameJson(certificate.edgeSummaries.after, summarizeEdges(certificate.edgeFacts, caretOffset))
    && validOutsideProof(certificate, input)
}

function cloneAnalysisKey(key: RunOwnedAnalysisKey): RunOwnedAnalysisKey {
  return { ...key, features: [...key.features] }
}

export function evaluateRunOwnedSemanticOracleStage2(
  input: RunOwnedSemanticOracleStage2Input,
): RunOwnedSemanticOracleStage2Result {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return notAdmissible(input, [], "invalid-provider-facts")
  // Parse certificates separately so malformed proofs become uncertified-seam.
  // Parsing also detaches all returned proof data from mutable caller objects.
  input = { ...parsed.data, provider: { ...parsed.data.provider, seamCertificates: [] } }
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

  const certifiedRuns = deriveRuns(input, input.caretOffset)
  const leftRun = [...certifiedRuns].reverse().find((run) => run.endOffset === input.caretOffset)
  const rightRun = certifiedRuns.find((run) => run.startOffset === input.caretOffset)
  if (!leftRun || !rightRun) {
    return notAdmissible(input, derivedRuns, "uncertified-seam")
  }
  // Do not hide unaccounted work in alternative certificates or silently skip a
  // malformed one. This reference request evaluates exactly one seam proof.
  if (parsed.data.provider.seamCertificates.length !== 1) return notAdmissible(input, derivedRuns, "uncertified-seam")
  const candidate = certificateSchema.safeParse(parsed.data.provider.seamCertificates[0])
  const certificate = candidate.success && isCertifiedSeam(candidate.data, input, leftRun, rightRun) ? candidate.data : null
  if (!certificate) {
    return notAdmissible(input, derivedRuns, "uncertified-seam")
  }

  return {
    runs: certifiedRuns,
    decision: {
      status: "certified",
      certificateId: certificate.certificateId,
      caretOffset: input.caretOffset,
      seamFacts: {
        beforeFacts: certificate.beforeFacts,
        edgeSummaries: certificate.edgeSummaries,
        outsideRangeValidity: certificate.outsideRangeValidity,
        workAccounting: accountWork(certificate, input)!,
        leftSourceRange: { ...certificate.leftSourceRange },
        rightSourceRange: { ...certificate.rightSourceRange },
        sourceBinding: {
          committedText: certificate.sourceBinding.committedText,
          authoredSpans: certificate.sourceBinding.authoredSpans.map((span) => ({ ...span })),
        },
        providerId: certificate.providerId,
        providerRevision: certificate.providerRevision,
        paragraphContext: { ...input.paragraph },
        leftAnalysisKey: cloneAnalysisKey(leftRun.analysisKey),
        rightAnalysisKey: cloneAnalysisKey(rightRun.analysisKey),
        edgeFacts: {
          glyphFacts: certificate.edgeFacts.glyphFacts.map((fact) => ({ ...fact })),
          clusterFacts: certificate.edgeFacts.clusterFacts.map((fact) => ({ ...fact })),
          breakFacts: certificate.edgeFacts.breakFacts.map((fact) => ({ ...fact })),
          unsafeBoundaryEvidence: { ...certificate.edgeFacts.unsafeBoundaryEvidence },
        },
      },
    },
  }
}
