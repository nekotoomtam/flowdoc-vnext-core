export const VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE = "vnext-text-measurement-engine-spike"
export const VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE = "text-measurement-engine-spike-boundary"

export type VNextTextMeasurementEngineSpikeStatus = "ready-for-spike" | "blocked"
export type VNextTextMeasurementSpikeAvailability = "available" | "planned" | "blocked"
export type VNextTextMeasurementSpikeRole = "primary-candidate" | "comparison-baseline" | "thai-oracle" | "rejected"
export type VNextTextMeasurementSpikeDecisionStatus = "accepted" | "watch" | "blocked"
export type VNextTextMeasurementSpikeProfileIdentityStatus = "stable" | "spike-only" | "blocked"
export type VNextTextMeasurementSpikePackageBoundary = "external-adapter" | "optional-core-adapter" | "blocked"
export type VNextTextMeasurementSpikeIssueSeverity = "blocking" | "warning"

export type VNextTextMeasurementSpikeFontSource = "workspace" | "external-reference" | "future-registry"
export type VNextTextMeasurementSpikeFontFormat = "ttf" | "otf" | "woff2" | "unknown"
export type VNextTextMeasurementSpikeFontStyle = "normal" | "italic"

export type VNextTextMeasurementShaperKind =
  | "harfbuzz"
  | "browser-canvas"
  | "renderer-native"
  | "custom"

export type VNextTextMeasurementLineBreakerKind =
  | "icu4x"
  | "intl-segmenter"
  | "uax14"
  | "libunibreak"
  | "libthai"
  | "pythainlp"
  | "attacut"
  | "custom"

export type VNextTextMeasurementSpikeIssueCode =
  | "production-pagination-binding"
  | "missing-font-assets"
  | "font-asset-unavailable"
  | "font-asset-missing-hash"
  | "missing-primary-shaper"
  | "primary-shaper-unavailable"
  | "nondeterministic-primary-shaper"
  | "primary-shaper-missing-glyph-advances"
  | "primary-shaper-missing-clusters"
  | "primary-shaper-missing-complex-text"
  | "missing-primary-line-breaker"
  | "primary-line-breaker-unavailable"
  | "nondeterministic-primary-line-breaker"
  | "primary-line-breaker-runtime-dependent"
  | "primary-line-breaker-missing-thai"
  | "primary-line-breaker-missing-uax14"
  | "missing-thai-oracle"

export interface VNextTextMeasurementSpikeFontAsset {
  fontId: string
  family: string
  style: VNextTextMeasurementSpikeFontStyle
  weight: number
  format: VNextTextMeasurementSpikeFontFormat
  source: VNextTextMeasurementSpikeFontSource
  available: boolean
  license?: string
  revision?: string
  hash?: string
}

export interface VNextTextMeasurementSpikeShaperCandidate {
  shaperId: string
  engine: VNextTextMeasurementShaperKind
  role: VNextTextMeasurementSpikeRole
  availability: VNextTextMeasurementSpikeAvailability
  revision?: string
  deterministic: boolean
  supportsGlyphAdvances: boolean
  supportsGlyphClusters: boolean
  supportsComplexText: boolean
  packageBoundary: VNextTextMeasurementSpikePackageBoundary
  notes?: readonly string[]
}

export interface VNextTextMeasurementSpikeLineBreakerCandidate {
  lineBreakerId: string
  engine: VNextTextMeasurementLineBreakerKind
  role: VNextTextMeasurementSpikeRole
  availability: VNextTextMeasurementSpikeAvailability
  revision?: string
  deterministic: boolean
  runtimeDependent: boolean
  supportsThai: boolean
  followsUnicodeLineBreaking: boolean
  packageBoundary: VNextTextMeasurementSpikePackageBoundary
  notes?: readonly string[]
}

export interface VNextTextMeasurementEngineSpikeInput {
  spikeId: string
  policyRevision: string
  bindProductionPagination?: boolean
  fontAssets: readonly VNextTextMeasurementSpikeFontAsset[]
  shapers: readonly VNextTextMeasurementSpikeShaperCandidate[]
  lineBreakers: readonly VNextTextMeasurementSpikeLineBreakerCandidate[]
}

export interface VNextTextMeasurementSpikeIssue {
  severity: VNextTextMeasurementSpikeIssueSeverity
  code: VNextTextMeasurementSpikeIssueCode
  message: string
  targetId?: string
}

export interface VNextTextMeasurementSpikeDecisionRow {
  target: string
  role: string
  status: VNextTextMeasurementSpikeDecisionStatus
  reasons: string[]
}

export interface VNextTextMeasurementSpikeProfileCandidate {
  profileId: string
  identityStatus: VNextTextMeasurementSpikeProfileIdentityStatus
  ingredients: {
    policyRevision: string
    fontAssetIds: string[]
    fontAssetHashes: string[]
    shaper: {
      shaperId: string | null
      engine: VNextTextMeasurementShaperKind | null
      revision: string | null
    }
    lineBreaker: {
      lineBreakerId: string | null
      engine: VNextTextMeasurementLineBreakerKind | null
      revision: string | null
    }
  }
}

export interface VNextTextMeasurementEngineSpikePlan {
  source: typeof VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE
  mode: typeof VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE
  status: VNextTextMeasurementEngineSpikeStatus
  spikeId: string
  policyRevision: string
  summary: {
    fontAssetCount: number
    availableFontAssetCount: number
    primaryShaperId: string | null
    primaryLineBreakerId: string | null
    comparisonLineBreakerIds: string[]
    thaiOracleIds: string[]
  }
  candidates: {
    fontAssets: VNextTextMeasurementSpikeFontAsset[]
    shapers: VNextTextMeasurementSpikeShaperCandidate[]
    lineBreakers: VNextTextMeasurementSpikeLineBreakerCandidate[]
  }
  profileCandidate: VNextTextMeasurementSpikeProfileCandidate
  decisionMatrix: VNextTextMeasurementSpikeDecisionRow[]
  executionContract: {
    importsConcreteEngines: false
    installsDependencies: false
    readsFontFiles: false
    executesRenderer: false
    mayRelayoutDocument: false
    mutatesDocument: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
    usesLegacyRuntime: false
  }
  blockingIssues: VNextTextMeasurementSpikeIssue[]
  warningIssues: VNextTextMeasurementSpikeIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextTextMeasurementSpikeIssueSeverity,
  code: VNextTextMeasurementSpikeIssueCode,
  message: string,
  targetId?: string,
): VNextTextMeasurementSpikeIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneFontAsset(asset: VNextTextMeasurementSpikeFontAsset): VNextTextMeasurementSpikeFontAsset {
  return { ...asset }
}

function cloneShaper(candidate: VNextTextMeasurementSpikeShaperCandidate): VNextTextMeasurementSpikeShaperCandidate {
  return {
    ...candidate,
    notes: candidate.notes == null ? undefined : [...candidate.notes],
  }
}

function cloneLineBreaker(
  candidate: VNextTextMeasurementSpikeLineBreakerCandidate,
): VNextTextMeasurementSpikeLineBreakerCandidate {
  return {
    ...candidate,
    notes: candidate.notes == null ? undefined : [...candidate.notes],
  }
}

function normalizeToken(value: string | undefined): string {
  const token = (value ?? "unset").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return token.length === 0 ? "unset" : token
}

function revisionToken(value: string | undefined): string {
  return value == null || value.trim().length === 0 ? "rev-unset" : normalizeToken(value)
}

function fontIdentityToken(asset: VNextTextMeasurementSpikeFontAsset): string {
  const revision = asset.hash ?? asset.revision ?? "unversioned"
  return `${normalizeToken(asset.fontId)}-${normalizeToken(revision)}`
}

function createProfileCandidate(
  input: VNextTextMeasurementEngineSpikeInput,
  availableFonts: readonly VNextTextMeasurementSpikeFontAsset[],
  primaryShaper: VNextTextMeasurementSpikeShaperCandidate | undefined,
  primaryLineBreaker: VNextTextMeasurementSpikeLineBreakerCandidate | undefined,
  blockingIssues: readonly VNextTextMeasurementSpikeIssue[],
  warningIssues: readonly VNextTextMeasurementSpikeIssue[],
): VNextTextMeasurementSpikeProfileCandidate {
  const fontTokens = availableFonts.map(fontIdentityToken).sort()
  const shaperToken = primaryShaper == null
    ? "shape-unset"
    : `shape-${normalizeToken(primaryShaper.engine)}-${normalizeToken(primaryShaper.shaperId)}-${revisionToken(primaryShaper.revision)}`
  const lineBreakerToken = primaryLineBreaker == null
    ? "break-unset"
    : `break-${normalizeToken(primaryLineBreaker.engine)}-${normalizeToken(primaryLineBreaker.lineBreakerId)}-${revisionToken(primaryLineBreaker.revision)}`
  const profileId = [
    "text-measurement-spike",
    normalizeToken(input.spikeId),
    normalizeToken(input.policyRevision),
    `fonts-${fontTokens.length === 0 ? "unset" : fontTokens.join("+")}`,
    shaperToken,
    lineBreakerToken,
  ].join(":")
  const hasIdentityWarnings = warningIssues.some((item) => item.code === "font-asset-missing-hash")
    || primaryShaper?.revision == null
    || primaryLineBreaker?.revision == null

  return {
    profileId,
    identityStatus: blockingIssues.length > 0 ? "blocked" : hasIdentityWarnings ? "spike-only" : "stable",
    ingredients: {
      policyRevision: input.policyRevision,
      fontAssetIds: availableFonts.map((asset) => asset.fontId),
      fontAssetHashes: availableFonts.map((asset) => asset.hash ?? ""),
      shaper: {
        shaperId: primaryShaper?.shaperId ?? null,
        engine: primaryShaper?.engine ?? null,
        revision: primaryShaper?.revision ?? null,
      },
      lineBreaker: {
        lineBreakerId: primaryLineBreaker?.lineBreakerId ?? null,
        engine: primaryLineBreaker?.engine ?? null,
        revision: primaryLineBreaker?.revision ?? null,
      },
    },
  }
}

function decisionStatusForAvailability(
  availability: VNextTextMeasurementSpikeAvailability,
  role: VNextTextMeasurementSpikeRole,
): VNextTextMeasurementSpikeDecisionStatus {
  if (availability === "blocked" || role === "rejected") return "blocked"
  return role === "primary-candidate" && availability === "available" ? "accepted" : "watch"
}

function buildDecisionMatrix(
  fonts: readonly VNextTextMeasurementSpikeFontAsset[],
  shapers: readonly VNextTextMeasurementSpikeShaperCandidate[],
  lineBreakers: readonly VNextTextMeasurementSpikeLineBreakerCandidate[],
): VNextTextMeasurementSpikeDecisionRow[] {
  return [
    ...fonts.map((asset) => ({
      target: `font:${asset.fontId}`,
      role: "font-asset",
      status: asset.available ? "accepted" as const : "watch" as const,
      reasons: [
        `${asset.family} ${asset.weight} ${asset.style}`,
        `${asset.format} from ${asset.source}`,
        asset.hash == null ? "hash not recorded yet" : "hash recorded",
      ],
    })),
    ...shapers.map((candidate) => ({
      target: `shaper:${candidate.shaperId}`,
      role: candidate.role,
      status: decisionStatusForAvailability(candidate.availability, candidate.role),
      reasons: [
        candidate.engine,
        candidate.deterministic ? "deterministic" : "nondeterministic",
        candidate.supportsComplexText ? "complex text supported" : "complex text not proven",
        candidate.packageBoundary,
      ],
    })),
    ...lineBreakers.map((candidate) => ({
      target: `line-breaker:${candidate.lineBreakerId}`,
      role: candidate.role,
      status: decisionStatusForAvailability(candidate.availability, candidate.role),
      reasons: [
        candidate.engine,
        candidate.deterministic ? "deterministic" : "nondeterministic",
        candidate.runtimeDependent ? "runtime dependent" : "runtime pinned",
        candidate.supportsThai ? "Thai supported" : "Thai support not proven",
        candidate.followsUnicodeLineBreaking ? "UAX #14 aligned" : "UAX #14 not proven",
      ],
    })),
  ]
}

export function createVNextTextMeasurementEngineSpikePlan(
  input: VNextTextMeasurementEngineSpikeInput,
): VNextTextMeasurementEngineSpikePlan {
  const fontAssets = input.fontAssets.map(cloneFontAsset)
  const shapers = input.shapers.map(cloneShaper)
  const lineBreakers = input.lineBreakers.map(cloneLineBreaker)
  const availableFonts = fontAssets.filter((asset) => asset.available)
  const primaryShaper = shapers.find((candidate) => candidate.role === "primary-candidate")
  const primaryLineBreaker = lineBreakers.find((candidate) => candidate.role === "primary-candidate")
  const thaiOracles = lineBreakers.filter((candidate) => candidate.role === "thai-oracle")

  const blockingIssues: VNextTextMeasurementSpikeIssue[] = []
  const warningIssues: VNextTextMeasurementSpikeIssue[] = []

  if (input.bindProductionPagination === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-pagination-binding",
      "The text measurement engine spike cannot replace production pagination measurement.",
    ))
  }

  if (availableFonts.length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-font-assets",
      "At least one available font asset is required before a shaping measurement spike can run.",
    ))
  }

  fontAssets
    .filter((asset) => !asset.available)
    .forEach((asset) => {
      warningIssues.push(issue(
        "warning",
        "font-asset-unavailable",
        "Font asset is registered for comparison but is not available to the spike yet.",
        asset.fontId,
      ))
    })

  availableFonts
    .filter((asset) => asset.hash == null || asset.hash.trim().length === 0)
    .forEach((asset) => {
      warningIssues.push(issue(
        "warning",
        "font-asset-missing-hash",
        "Available font assets should record a stable hash before measurement cache identity is trusted beyond the spike.",
        asset.fontId,
      ))
    })

  if (primaryShaper == null) {
    blockingIssues.push(issue(
      "blocking",
      "missing-primary-shaper",
      "A primary shaping candidate is required before comparing renderer-backed text measurement.",
    ))
  } else {
    if (primaryShaper.availability !== "available") {
      blockingIssues.push(issue(
        "blocking",
        "primary-shaper-unavailable",
        "The primary shaping candidate must be available for the spike.",
        primaryShaper.shaperId,
      ))
    }
    if (!primaryShaper.deterministic) {
      blockingIssues.push(issue(
        "blocking",
        "nondeterministic-primary-shaper",
        "The primary shaping candidate must be deterministic so pagination drift can be attributed.",
        primaryShaper.shaperId,
      ))
    }
    if (!primaryShaper.supportsGlyphAdvances) {
      blockingIssues.push(issue(
        "blocking",
        "primary-shaper-missing-glyph-advances",
        "The primary shaping candidate must expose glyph advances for line width accumulation.",
        primaryShaper.shaperId,
      ))
    }
    if (!primaryShaper.supportsGlyphClusters) {
      blockingIssues.push(issue(
        "blocking",
        "primary-shaper-missing-clusters",
        "The primary shaping candidate must expose glyph clusters for offset-to-line-box mapping.",
        primaryShaper.shaperId,
      ))
    }
    if (!primaryShaper.supportsComplexText) {
      blockingIssues.push(issue(
        "blocking",
        "primary-shaper-missing-complex-text",
        "The primary shaping candidate must support complex text before Thai measurement can be trusted.",
        primaryShaper.shaperId,
      ))
    }
  }

  if (primaryLineBreaker == null) {
    blockingIssues.push(issue(
      "blocking",
      "missing-primary-line-breaker",
      "A primary line-break candidate is required before comparing renderer-backed text measurement.",
    ))
  } else {
    if (primaryLineBreaker.availability !== "available") {
      blockingIssues.push(issue(
        "blocking",
        "primary-line-breaker-unavailable",
        "The primary line-break candidate must be available for the spike.",
        primaryLineBreaker.lineBreakerId,
      ))
    }
    if (!primaryLineBreaker.deterministic) {
      blockingIssues.push(issue(
        "blocking",
        "nondeterministic-primary-line-breaker",
        "The primary line-break candidate must be deterministic across Node/browser runs.",
        primaryLineBreaker.lineBreakerId,
      ))
    }
    if (primaryLineBreaker.runtimeDependent) {
      blockingIssues.push(issue(
        "blocking",
        "primary-line-breaker-runtime-dependent",
        "Runtime-dependent line breaking may be used as a baseline, but not as the primary spike truth.",
        primaryLineBreaker.lineBreakerId,
      ))
    }
    if (!primaryLineBreaker.supportsThai) {
      blockingIssues.push(issue(
        "blocking",
        "primary-line-breaker-missing-thai",
        "The primary line-break candidate must explicitly support Thai text.",
        primaryLineBreaker.lineBreakerId,
      ))
    }
    if (!primaryLineBreaker.followsUnicodeLineBreaking) {
      blockingIssues.push(issue(
        "blocking",
        "primary-line-breaker-missing-uax14",
        "The primary line-break candidate must align with Unicode line breaking policy.",
        primaryLineBreaker.lineBreakerId,
      ))
    }
  }

  if (thaiOracles.length === 0) {
    warningIssues.push(issue(
      "warning",
      "missing-thai-oracle",
      "Add a Thai-specific oracle or comparison candidate before judging Thai line-break quality.",
    ))
  }

  const profileCandidate = createProfileCandidate(
    input,
    availableFonts,
    primaryShaper,
    primaryLineBreaker,
    blockingIssues,
    warningIssues,
  )

  return {
    source: VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE,
    mode: VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE,
    status: blockingIssues.length === 0 ? "ready-for-spike" : "blocked",
    spikeId: input.spikeId,
    policyRevision: input.policyRevision,
    summary: {
      fontAssetCount: fontAssets.length,
      availableFontAssetCount: availableFonts.length,
      primaryShaperId: primaryShaper?.shaperId ?? null,
      primaryLineBreakerId: primaryLineBreaker?.lineBreakerId ?? null,
      comparisonLineBreakerIds: lineBreakers
        .filter((candidate) => candidate.role === "comparison-baseline")
        .map((candidate) => candidate.lineBreakerId),
      thaiOracleIds: thaiOracles.map((candidate) => candidate.lineBreakerId),
    },
    candidates: {
      fontAssets,
      shapers,
      lineBreakers,
    },
    profileCandidate,
    decisionMatrix: buildDecisionMatrix(fontAssets, shapers, lineBreakers),
    executionContract: {
      importsConcreteEngines: false,
      installsDependencies: false,
      readsFontFiles: false,
      executesRenderer: false,
      mayRelayoutDocument: false,
      mutatesDocument: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
      usesLegacyRuntime: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Register Sarabun and Noto Sans Thai font assets with license and hash facts.",
      "Run a HarfBuzz shaping smoke over Thai, Latin, digits, punctuation, and mixed-style samples.",
      "Compare ICU4X, Intl.Segmenter, and Thai-specific oracle breakpoints on the same samples.",
      "Report drift against createApproximateVNextTextMeasurer(...) before replacing any production measurement path.",
      "Promote only a pinned, deterministic profile through createVNextRendererBackedTextMeasurer(...).",
    ],
  }
}
