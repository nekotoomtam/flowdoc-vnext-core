import type {
  VNextThaiCorpusInput,
  VNextThaiCorpusSample,
} from "./thaiCorpusBoundary.js"

export const VNEXT_THAI_LINE_BREAK_EVIDENCE_SOURCE = "vnext-thai-line-break-evidence"
export const VNEXT_THAI_LINE_BREAK_EVIDENCE_MODE = "thai-line-break-evidence-manifest-boundary"

export type VNextThaiLineBreakEvidenceStatus = "ready-for-wrap-evidence" | "blocked"
export type VNextThaiLineBreakEvidenceIssueSeverity = "blocking" | "warning"
export type VNextThaiLineBreakCandidateEngine =
  | "icu4x"
  | "intl-segmenter"
  | "libthai"
  | "pythainlp"
  | "attacut"
  | "custom"
export type VNextThaiLineBreakCandidateRole =
  | "primary-deterministic"
  | "comparison-baseline"
  | "thai-oracle-candidate"
export type VNextThaiLineBreakKind =
  | "word"
  | "space"
  | "punctuation"
  | "mandatory"
  | "unknown"

export type VNextThaiLineBreakEvidenceIssueCode =
  | "missing-manifest-id"
  | "missing-policy-revision"
  | "corpus-id-mismatch"
  | "missing-entries"
  | "missing-evidence-id"
  | "duplicate-evidence-id"
  | "missing-sample-id"
  | "unknown-sample-id"
  | "entry-locale-not-thai"
  | "missing-candidate-id"
  | "missing-engine-revision"
  | "missing-data-revision"
  | "runtime-dependent-primary"
  | "intl-marked-primary-truth"
  | "intl-not-comparison-baseline"
  | "primary-engine-not-icu4x"
  | "missing-breaks"
  | "invalid-break-offset"
  | "break-offset-out-of-bounds"
  | "break-offset-not-ascending"
  | "missing-final-break"
  | "missing-icu4x-primary-entry"
  | "missing-intl-comparison-entry"

export interface VNextThaiLineBreakCandidateRef {
  candidateId: string
  engine: VNextThaiLineBreakCandidateEngine
  role: VNextThaiLineBreakCandidateRole
  runtimeDependent: boolean
  engineRevision: string
  dataRevision: string
  lineBreakPolicy: string
}

export interface VNextThaiLineBreakOpportunity {
  offset: number
  kind: VNextThaiLineBreakKind
}

export interface VNextThaiLineBreakEvidenceEntry {
  evidenceId: string
  sampleId: string
  locale: "th"
  candidate: VNextThaiLineBreakCandidateRef
  breaks: readonly VNextThaiLineBreakOpportunity[]
  warnings?: readonly string[]
}

export interface VNextThaiLineBreakEvidenceManifest {
  manifestId: string
  policyRevision: string
  corpusId: string
  entries: readonly VNextThaiLineBreakEvidenceEntry[]
}

export interface VNextThaiLineBreakEvidenceIssue {
  severity: VNextThaiLineBreakEvidenceIssueSeverity
  code: VNextThaiLineBreakEvidenceIssueCode
  message: string
  targetId?: string
}

export interface VNextThaiLineBreakEvidencePlan {
  source: typeof VNEXT_THAI_LINE_BREAK_EVIDENCE_SOURCE
  mode: typeof VNEXT_THAI_LINE_BREAK_EVIDENCE_MODE
  status: VNextThaiLineBreakEvidenceStatus
  manifestId: string
  policyRevision: string
  corpusId: string
  entries: VNextThaiLineBreakEvidenceEntry[]
  coverage: {
    entryCount: number
    sampleIds: string[]
    primaryIcu4xSampleIds: string[]
    intlComparisonSampleIds: string[]
    candidateEngines: VNextThaiLineBreakCandidateEngine[]
    breakKindCounts: Partial<Record<VNextThaiLineBreakKind, number>>
  }
  evidenceContract: {
    consumes: "thai-measurement-corpus-v1"
    produces: "thai-line-break-opportunity-evidence"
    corpusRemainsNeutral: true
    primaryTruth: "icu4x"
    comparisonBaseline: "intl-segmenter"
    thaiOracleCandidatesAreTruth: false
    offsetUnit: "utf16-code-unit"
  }
  executionContract: {
    executesSegmentation: false
    importsIcu4x: false
    importsIntlSegmenter: false
    importsThaiOracles: false
    computesLineBoxes: false
    replacesPaginationMeasurer: false
    mutatesCorpus: false
    writesArtifacts: false
  }
  blockingIssues: VNextThaiLineBreakEvidenceIssue[]
  warningIssues: VNextThaiLineBreakEvidenceIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextThaiLineBreakEvidenceIssueSeverity,
  code: VNextThaiLineBreakEvidenceIssueCode,
  message: string,
  targetId?: string,
): VNextThaiLineBreakEvidenceIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function unique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort()
}

function cloneCandidate(candidate: VNextThaiLineBreakCandidateRef): VNextThaiLineBreakCandidateRef {
  return { ...candidate }
}

function cloneBreakOpportunity(opportunity: VNextThaiLineBreakOpportunity): VNextThaiLineBreakOpportunity {
  return { ...opportunity }
}

function cloneEntry(entry: VNextThaiLineBreakEvidenceEntry): VNextThaiLineBreakEvidenceEntry {
  return {
    ...entry,
    candidate: cloneCandidate(entry.candidate),
    breaks: entry.breaks.map(cloneBreakOpportunity),
    ...(entry.warnings == null ? {} : { warnings: [...entry.warnings] }),
  }
}

function createBreakKindCounts(
  entries: readonly VNextThaiLineBreakEvidenceEntry[],
): Partial<Record<VNextThaiLineBreakKind, number>> {
  const counts: Partial<Record<VNextThaiLineBreakKind, number>> = {}
  entries.forEach((entry) => {
    entry.breaks.forEach((opportunity) => {
      counts[opportunity.kind] = (counts[opportunity.kind] ?? 0) + 1
    })
  })
  return counts
}

function validateCandidate(
  entry: VNextThaiLineBreakEvidenceEntry,
  blockingIssues: VNextThaiLineBreakEvidenceIssue[],
): void {
  const candidate = entry.candidate

  if (candidate.candidateId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-candidate-id", "Line-break evidence entries require a candidate id.", entry.evidenceId))
  }

  if (candidate.role === "primary-deterministic") {
    if (candidate.engine !== "icu4x") {
      blockingIssues.push(issue("blocking", "primary-engine-not-icu4x", "ICU4X is the only primary deterministic line-break candidate in this boundary.", entry.evidenceId))
    }

    if (candidate.runtimeDependent) {
      blockingIssues.push(issue("blocking", "runtime-dependent-primary", "Primary deterministic line-break evidence cannot be runtime-dependent.", entry.evidenceId))
    }

    if (candidate.engineRevision.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-engine-revision", "Deterministic line-break evidence must include an engine revision.", entry.evidenceId))
    }

    if (candidate.dataRevision.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-data-revision", "Deterministic line-break evidence must include a data revision.", entry.evidenceId))
    }
  }

  if (candidate.engine === "intl-segmenter") {
    if (candidate.role === "primary-deterministic") {
      blockingIssues.push(issue("blocking", "intl-marked-primary-truth", "Intl.Segmenter is runtime-dependent and cannot be primary line-break truth.", entry.evidenceId))
    }

    if (candidate.role !== "comparison-baseline") {
      blockingIssues.push(issue("blocking", "intl-not-comparison-baseline", "Intl.Segmenter entries must be marked as comparison baselines.", entry.evidenceId))
    }
  }
}

function validateBreaks(
  entry: VNextThaiLineBreakEvidenceEntry,
  sample: VNextThaiCorpusSample | undefined,
  blockingIssues: VNextThaiLineBreakEvidenceIssue[],
): void {
  if (entry.breaks.length === 0) {
    blockingIssues.push(issue("blocking", "missing-breaks", "Line-break evidence entries require at least one break opportunity.", entry.evidenceId))
    return
  }

  let previousOffset = 0

  entry.breaks.forEach((opportunity, index) => {
    const targetId = `${entry.evidenceId}:break:${index}`

    if (!Number.isInteger(opportunity.offset) || opportunity.offset <= 0) {
      blockingIssues.push(issue("blocking", "invalid-break-offset", "Line-break offsets must be positive UTF-16 code unit offsets.", targetId))
      return
    }

    if (opportunity.offset <= previousOffset) {
      blockingIssues.push(issue("blocking", "break-offset-not-ascending", "Line-break offsets must be strictly ascending.", targetId))
    }

    if (sample != null && opportunity.offset > sample.text.length) {
      blockingIssues.push(issue("blocking", "break-offset-out-of-bounds", "Line-break offsets must stay within the referenced sample text.", targetId))
    }

    previousOffset = opportunity.offset
  })

  const finalBreak = entry.breaks[entry.breaks.length - 1]
  if (sample != null && finalBreak?.offset !== sample.text.length) {
    blockingIssues.push(issue("blocking", "missing-final-break", "Line-break evidence must include the sample-end mandatory break.", entry.evidenceId))
  }
}

export function createVNextThaiLineBreakEvidencePlan(input: {
  corpus: VNextThaiCorpusInput
  manifest: VNextThaiLineBreakEvidenceManifest
}): VNextThaiLineBreakEvidencePlan {
  const entries = input.manifest.entries.map(cloneEntry)
  const samplesById = new Map(input.corpus.samples.map((sample) => [sample.sampleId, sample]))
  const blockingIssues: VNextThaiLineBreakEvidenceIssue[] = []
  const warningIssues: VNextThaiLineBreakEvidenceIssue[] = []
  const evidenceIds = new Set<string>()
  const duplicateEvidenceIds = new Set<string>()

  if (input.manifest.manifestId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-manifest-id", "Line-break evidence manifests require a stable manifest id."))
  }

  if (input.manifest.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Line-break evidence manifests require a policy revision."))
  }

  if (input.manifest.corpusId !== input.corpus.corpusId) {
    blockingIssues.push(issue("blocking", "corpus-id-mismatch", "Line-break evidence must reference the active Thai corpus id.", input.manifest.corpusId))
  }

  if (entries.length === 0) {
    blockingIssues.push(issue("blocking", "missing-entries", "Line-break evidence manifests require observed candidate entries."))
  }

  entries.forEach((entry) => {
    if (entry.evidenceId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-evidence-id", "Line-break evidence entries require stable evidence ids."))
      return
    }

    if (evidenceIds.has(entry.evidenceId)) duplicateEvidenceIds.add(entry.evidenceId)
    evidenceIds.add(entry.evidenceId)

    if (entry.sampleId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-sample-id", "Line-break evidence entries must reference corpus sample ids.", entry.evidenceId))
    }

    const sample = samplesById.get(entry.sampleId)
    if (sample == null) {
      blockingIssues.push(issue("blocking", "unknown-sample-id", "Line-break evidence entries must reference existing Thai corpus samples.", entry.sampleId))
    }

    if (entry.locale !== "th") {
      blockingIssues.push(issue("blocking", "entry-locale-not-thai", "Thai line-break evidence entries must use locale th.", entry.evidenceId))
    }

    validateCandidate(entry, blockingIssues)
    validateBreaks(entry, sample, blockingIssues)
  })

  duplicateEvidenceIds.forEach((evidenceId) => {
    blockingIssues.push(issue("blocking", "duplicate-evidence-id", "Line-break evidence ids must be unique.", evidenceId))
  })

  const primaryIcu4xSampleIds = unique(entries
    .filter((entry) => entry.candidate.engine === "icu4x" && entry.candidate.role === "primary-deterministic")
    .map((entry) => entry.sampleId))
  const intlComparisonSampleIds = unique(entries
    .filter((entry) => entry.candidate.engine === "intl-segmenter" && entry.candidate.role === "comparison-baseline")
    .map((entry) => entry.sampleId))

  if (primaryIcu4xSampleIds.length === 0) {
    blockingIssues.push(issue("blocking", "missing-icu4x-primary-entry", "Line-break evidence requires ICU4X primary deterministic entries."))
  }

  if (intlComparisonSampleIds.length === 0) {
    warningIssues.push(issue("warning", "missing-intl-comparison-entry", "Intl.Segmenter should remain available as a comparison baseline."))
  }

  return {
    source: VNEXT_THAI_LINE_BREAK_EVIDENCE_SOURCE,
    mode: VNEXT_THAI_LINE_BREAK_EVIDENCE_MODE,
    status: blockingIssues.length === 0 ? "ready-for-wrap-evidence" : "blocked",
    manifestId: input.manifest.manifestId,
    policyRevision: input.manifest.policyRevision,
    corpusId: input.manifest.corpusId,
    entries,
    coverage: {
      entryCount: entries.length,
      sampleIds: unique(entries.map((entry) => entry.sampleId)),
      primaryIcu4xSampleIds,
      intlComparisonSampleIds,
      candidateEngines: unique(entries.map((entry) => entry.candidate.engine)),
      breakKindCounts: createBreakKindCounts(entries),
    },
    evidenceContract: {
      consumes: "thai-measurement-corpus-v1",
      produces: "thai-line-break-opportunity-evidence",
      corpusRemainsNeutral: true,
      primaryTruth: "icu4x",
      comparisonBaseline: "intl-segmenter",
      thaiOracleCandidatesAreTruth: false,
      offsetUnit: "utf16-code-unit",
    },
    executionContract: {
      executesSegmentation: false,
      importsIcu4x: false,
      importsIntlSegmenter: false,
      importsThaiOracles: false,
      computesLineBoxes: false,
      replacesPaginationMeasurer: false,
      mutatesCorpus: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Use accepted line-break opportunities with rustybuzz glyph advances to produce multi-line wrap evidence.",
      "Keep break reasons on the wrapping evidence lane until the public adapter line-box shape is intentionally expanded.",
      "Replace seeded evidence with generated ICU4X/Intl/oracle observations only through this manifest boundary.",
    ],
  }
}
