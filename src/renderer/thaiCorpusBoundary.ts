export const VNEXT_THAI_CORPUS_SOURCE = "vnext-thai-corpus"
export const VNEXT_THAI_CORPUS_MODE = "thai-corpus-oracle-boundary"

export type VNextThaiCorpusStatus = "ready-for-oracle-comparison" | "blocked"
export type VNextThaiCorpusIssueSeverity = "blocking" | "warning"
export type VNextThaiCorpusSegmenterEngine = "icu4x" | "intl-segmenter" | "custom"
export type VNextThaiCorpusOracleEngine = "libthai" | "pythainlp" | "attacut" | "custom"
export type VNextThaiCorpusOracleStatus = "planned" | "available" | "blocked"

export type VNextThaiCorpusCategory =
  | "thai"
  | "thai-no-space"
  | "combining-mark"
  | "grapheme"
  | "caret"
  | "latin"
  | "digit"
  | "punctuation"
  | "space"
  | "mixed-script"

export type VNextThaiCorpusIssueCode =
  | "missing-corpus-id"
  | "missing-policy-revision"
  | "missing-primary-segmenter"
  | "primary-segmenter-runtime-dependent"
  | "missing-intl-comparison"
  | "missing-thai-oracle"
  | "missing-samples"
  | "missing-sample-id"
  | "duplicate-sample-id"
  | "missing-sample-text"
  | "sample-locale-not-thai"
  | "missing-category-coverage"

export interface VNextThaiCorpusSegmenterRef {
  segmenterId: string
  engine: VNextThaiCorpusSegmenterEngine
  runtimeDependent: boolean
}

export interface VNextThaiCorpusOracleRef {
  oracleId: string
  engine: VNextThaiCorpusOracleEngine
  status: VNextThaiCorpusOracleStatus
}

export interface VNextThaiCorpusSample {
  sampleId: string
  text: string
  locale: "th"
  categories: readonly VNextThaiCorpusCategory[]
  notes?: string
}

export interface VNextThaiCorpusInput {
  corpusId: string
  policyRevision: string
  primarySegmenter: VNextThaiCorpusSegmenterRef
  comparisonSegmenters: readonly VNextThaiCorpusSegmenterRef[]
  oracleCandidates: readonly VNextThaiCorpusOracleRef[]
  samples: readonly VNextThaiCorpusSample[]
}

export interface VNextThaiCorpusIssue {
  severity: VNextThaiCorpusIssueSeverity
  code: VNextThaiCorpusIssueCode
  message: string
  targetId?: string
}

export interface VNextThaiCorpusPlan {
  source: typeof VNEXT_THAI_CORPUS_SOURCE
  mode: typeof VNEXT_THAI_CORPUS_MODE
  status: VNextThaiCorpusStatus
  corpusId: string
  policyRevision: string
  primarySegmenter: VNextThaiCorpusSegmenterRef
  comparisonSegmenters: VNextThaiCorpusSegmenterRef[]
  oracleCandidates: VNextThaiCorpusOracleRef[]
  samples: VNextThaiCorpusSample[]
  coverage: {
    sampleCount: number
    categories: Record<VNextThaiCorpusCategory, number>
    requiredCategories: VNextThaiCorpusCategory[]
  }
  oracleContract: {
    primaryTruth: "icu4x"
    comparisonBaseline: "intl-segmenter"
    thaiOracleRequiredBeforeProduction: true
    storesExpectedBreaksInFixture: false
  }
  executionContract: {
    executesSegmentation: false
    importsSegmenters: false
    importsThaiOracles: false
    mutatesCorpus: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
  }
  blockingIssues: VNextThaiCorpusIssue[]
  warningIssues: VNextThaiCorpusIssue[]
}

const REQUIRED_CATEGORIES: VNextThaiCorpusCategory[] = [
  "thai",
  "thai-no-space",
  "combining-mark",
  "latin",
  "digit",
  "punctuation",
  "mixed-script",
]

function issue(
  severity: VNextThaiCorpusIssueSeverity,
  code: VNextThaiCorpusIssueCode,
  message: string,
  targetId?: string,
): VNextThaiCorpusIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneSegmenter(segmenter: VNextThaiCorpusSegmenterRef): VNextThaiCorpusSegmenterRef {
  return { ...segmenter }
}

function cloneOracle(oracle: VNextThaiCorpusOracleRef): VNextThaiCorpusOracleRef {
  return { ...oracle }
}

function cloneSample(sample: VNextThaiCorpusSample): VNextThaiCorpusSample {
  return {
    ...sample,
    categories: [...sample.categories],
  }
}

function createCoverage(samples: readonly VNextThaiCorpusSample[]): Record<VNextThaiCorpusCategory, number> {
  const coverage = Object.fromEntries(REQUIRED_CATEGORIES.map((category) => [category, 0])) as Record<VNextThaiCorpusCategory, number>
  samples.forEach((sample) => {
    sample.categories.forEach((category) => {
      coverage[category] = (coverage[category] ?? 0) + 1
    })
  })
  return coverage
}

export function createVNextThaiCorpusPlan(input: VNextThaiCorpusInput): VNextThaiCorpusPlan {
  const comparisonSegmenters = input.comparisonSegmenters.map(cloneSegmenter)
  const oracleCandidates = input.oracleCandidates.map(cloneOracle)
  const samples = input.samples.map(cloneSample)
  const coverage = createCoverage(samples)
  const blockingIssues: VNextThaiCorpusIssue[] = []
  const warningIssues: VNextThaiCorpusIssue[] = []
  const sampleIds = new Set<string>()
  const duplicateSampleIds = new Set<string>()

  if (input.corpusId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-corpus-id", "Thai corpus plans must have a stable corpus id."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Thai corpus plans must have a policy revision."))
  }

  if (input.primarySegmenter.segmenterId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-primary-segmenter", "Thai corpus plans require a primary segmenter."))
  }

  if (input.primarySegmenter.runtimeDependent) {
    blockingIssues.push(issue(
      "blocking",
      "primary-segmenter-runtime-dependent",
      "Runtime-dependent segmenters may be comparisons but not primary corpus truth.",
      input.primarySegmenter.segmenterId,
    ))
  }

  if (!comparisonSegmenters.some((segmenter) => segmenter.engine === "intl-segmenter")) {
    warningIssues.push(issue("warning", "missing-intl-comparison", "Intl.Segmenter should remain a comparison baseline for browser behavior."))
  }

  if (!oracleCandidates.some((oracle) => oracle.status !== "blocked")) {
    blockingIssues.push(issue("blocking", "missing-thai-oracle", "At least one Thai oracle candidate must be planned or available."))
  }

  if (samples.length === 0) {
    blockingIssues.push(issue("blocking", "missing-samples", "Thai corpus plans require sample text."))
  }

  samples.forEach((sample) => {
    if (sample.sampleId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-sample-id", "Thai corpus samples must have stable ids."))
      return
    }

    if (sampleIds.has(sample.sampleId)) duplicateSampleIds.add(sample.sampleId)
    sampleIds.add(sample.sampleId)

    if (sample.text.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-sample-text", "Thai corpus samples must include text.", sample.sampleId))
    }

    if (sample.locale !== "th") {
      blockingIssues.push(issue("blocking", "sample-locale-not-thai", "Thai corpus samples must use locale th.", sample.sampleId))
    }
  })

  duplicateSampleIds.forEach((sampleId) => {
    blockingIssues.push(issue("blocking", "duplicate-sample-id", "Thai corpus sample ids must be unique.", sampleId))
  })

  REQUIRED_CATEGORIES.forEach((category) => {
    if ((coverage[category] ?? 0) === 0) {
      blockingIssues.push(issue("blocking", "missing-category-coverage", "Thai corpus is missing required category coverage.", category))
    }
  })

  return {
    source: VNEXT_THAI_CORPUS_SOURCE,
    mode: VNEXT_THAI_CORPUS_MODE,
    status: blockingIssues.length === 0 ? "ready-for-oracle-comparison" : "blocked",
    corpusId: input.corpusId,
    policyRevision: input.policyRevision,
    primarySegmenter: cloneSegmenter(input.primarySegmenter),
    comparisonSegmenters,
    oracleCandidates,
    samples,
    coverage: {
      sampleCount: samples.length,
      categories: coverage,
      requiredCategories: [...REQUIRED_CATEGORIES],
    },
    oracleContract: {
      primaryTruth: "icu4x",
      comparisonBaseline: "intl-segmenter",
      thaiOracleRequiredBeforeProduction: true,
      storesExpectedBreaksInFixture: false,
    },
    executionContract: {
      executesSegmentation: false,
      importsSegmenters: false,
      importsThaiOracles: false,
      mutatesCorpus: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
  }
}
