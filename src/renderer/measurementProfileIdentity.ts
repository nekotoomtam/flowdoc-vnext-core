export const VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE = "vnext-measurement-profile-identity"
export const VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE = "measurement-profile-identity-contract"

export type VNextMeasurementProfileIdentityStatus = "stable" | "blocked"
export type VNextMeasurementProfileIdentityIssueSeverity = "blocking" | "warning"
export type VNextMeasurementProfilePackageBoundary = "external-adapter" | "optional-core-adapter" | "blocked"

export type VNextMeasurementProfileLineBreakPolicy = "icu4x-uax14-thai-v1" | "custom"
export type VNextMeasurementProfileFallbackPolicy = "explicit-font-list-v1" | "blocked"
export type VNextMeasurementProfileOutputShapeVersion = "glyph-line-box-v1"

export type VNextMeasurementProfileIssueCode =
  | "production-binding"
  | "missing-profile-key"
  | "missing-policy-revision"
  | "missing-font-assets"
  | "missing-font-id"
  | "missing-font-hash"
  | "non-sha256-font-hash"
  | "missing-style-mapping"
  | "style-mapping-missing-font"
  | "missing-shaper-id"
  | "missing-shaper-revision"
  | "nondeterministic-shaper"
  | "shaper-boundary-blocked"
  | "missing-segmenter-id"
  | "missing-segmenter-revision"
  | "missing-segmenter-data-revision"
  | "nondeterministic-segmenter"
  | "runtime-dependent-segmenter"
  | "segmenter-boundary-blocked"
  | "unsupported-fallback-policy"
  | "missing-output-shape"

export interface VNextMeasurementProfileFontAssetIdentity {
  fontId: string
  family: string
  weight: number
  style: "normal" | "italic"
  sha256: string
}

export interface VNextMeasurementProfileStyleMappingIdentity {
  styleKey: string
  primaryFontId: string
  fallbackFontIds?: readonly string[]
}

export interface VNextMeasurementProfileShaperIdentity {
  shaperId: string
  engine: "rustybuzz" | "harfbuzz" | "custom"
  revision: string
  deterministic: boolean
  packageBoundary: VNextMeasurementProfilePackageBoundary
  features: {
    kerning: boolean
    ligatures: boolean
    complexText: boolean
    clusterMapping: boolean
  }
}

export interface VNextMeasurementProfileSegmenterIdentity {
  segmenterId: string
  engine: "icu4x" | "intl-segmenter" | "custom"
  revision: string
  dataRevision: string
  deterministic: boolean
  runtimeDependent: boolean
  packageBoundary: VNextMeasurementProfilePackageBoundary
  lineBreakPolicy: VNextMeasurementProfileLineBreakPolicy
}

export interface VNextMeasurementProfileIdentityInput {
  profileKey: string
  policyRevision: string
  bindProductionMeasurement?: boolean
  fontAssets: readonly VNextMeasurementProfileFontAssetIdentity[]
  styleMappings: readonly VNextMeasurementProfileStyleMappingIdentity[]
  shaper: VNextMeasurementProfileShaperIdentity
  segmenter: VNextMeasurementProfileSegmenterIdentity
  fallbackPolicy: VNextMeasurementProfileFallbackPolicy
  outputShapeVersion: VNextMeasurementProfileOutputShapeVersion
}

export interface VNextMeasurementProfileIdentityIssue {
  severity: VNextMeasurementProfileIdentityIssueSeverity
  code: VNextMeasurementProfileIssueCode
  message: string
  targetId?: string
}

export interface VNextMeasurementProfileIdentityPlan {
  source: typeof VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE
  mode: typeof VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE
  status: VNextMeasurementProfileIdentityStatus
  measurementProfileId: string
  profileKey: string
  cacheIdentityVersion: "measurement-profile-v1"
  ingredients: {
    policyRevision: string
    fontAssets: VNextMeasurementProfileFontAssetIdentity[]
    styleMappings: VNextMeasurementProfileStyleMappingIdentity[]
    shaper: VNextMeasurementProfileShaperIdentity
    segmenter: VNextMeasurementProfileSegmenterIdentity
    fallbackPolicy: VNextMeasurementProfileFallbackPolicy
    outputShapeVersion: VNextMeasurementProfileOutputShapeVersion
  }
  identityParts: string[]
  summary: {
    fontAssetCount: number
    styleMappingCount: number
    shaperId: string
    segmenterId: string
    lineBreakPolicy: VNextMeasurementProfileLineBreakPolicy
  }
  executionContract: {
    importsConcreteEngines: false
    readsFontFiles: false
    executesShaping: false
    executesSegmentation: false
    replacesPaginationMeasurer: false
    mutatesDocument: false
    writesArtifacts: false
  }
  blockingIssues: VNextMeasurementProfileIdentityIssue[]
  warningIssues: VNextMeasurementProfileIdentityIssue[]
}

function issue(
  severity: VNextMeasurementProfileIdentityIssueSeverity,
  code: VNextMeasurementProfileIssueCode,
  message: string,
  targetId?: string,
): VNextMeasurementProfileIdentityIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function normalizeToken(value: string | undefined): string {
  const token = (value ?? "unset").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return token.length === 0 ? "unset" : token
}

function normalizeHash(value: string): string {
  const trimmed = value.trim().toLowerCase()
  return trimmed.startsWith("sha256-") ? trimmed : `sha256-${trimmed}`
}

function hashSuffix(value: string): string {
  return normalizeHash(value).replace(/^sha256-/, "").slice(0, 16)
}

function cloneFontAsset(asset: VNextMeasurementProfileFontAssetIdentity): VNextMeasurementProfileFontAssetIdentity {
  return { ...asset, sha256: normalizeHash(asset.sha256) }
}

function cloneStyleMapping(mapping: VNextMeasurementProfileStyleMappingIdentity): VNextMeasurementProfileStyleMappingIdentity {
  return {
    ...mapping,
    fallbackFontIds: mapping.fallbackFontIds == null ? undefined : [...mapping.fallbackFontIds],
  }
}

function cloneShaper(shaper: VNextMeasurementProfileShaperIdentity): VNextMeasurementProfileShaperIdentity {
  return {
    ...shaper,
    features: { ...shaper.features },
  }
}

function cloneSegmenter(segmenter: VNextMeasurementProfileSegmenterIdentity): VNextMeasurementProfileSegmenterIdentity {
  return { ...segmenter }
}

function createIdentityParts(input: {
  profileKey: string
  policyRevision: string
  fontAssets: readonly VNextMeasurementProfileFontAssetIdentity[]
  styleMappings: readonly VNextMeasurementProfileStyleMappingIdentity[]
  shaper: VNextMeasurementProfileShaperIdentity
  segmenter: VNextMeasurementProfileSegmenterIdentity
  fallbackPolicy: VNextMeasurementProfileFallbackPolicy
  outputShapeVersion: VNextMeasurementProfileOutputShapeVersion
}): string[] {
  const fontParts = input.fontAssets
    .map((asset) => `font-${normalizeToken(asset.fontId)}-${asset.weight}-${asset.style}-${hashSuffix(asset.sha256)}`)
    .sort()
  const styleParts = input.styleMappings
    .map((mapping) => [
      "style",
      normalizeToken(mapping.styleKey),
      normalizeToken(mapping.primaryFontId),
      ...(mapping.fallbackFontIds ?? []).map(normalizeToken),
    ].join("-"))
    .sort()
  const shaperFeatures = [
    input.shaper.features.kerning ? "kern" : "no-kern",
    input.shaper.features.ligatures ? "liga" : "no-liga",
    input.shaper.features.complexText ? "complex" : "no-complex",
    input.shaper.features.clusterMapping ? "clusters" : "no-clusters",
  ].join("-")

  return [
    "measurement-profile-v1",
    normalizeToken(input.profileKey),
    normalizeToken(input.policyRevision),
    `fonts-${fontParts.join("+")}`,
    `styles-${styleParts.join("+")}`,
    `shape-${normalizeToken(input.shaper.engine)}-${normalizeToken(input.shaper.shaperId)}-${normalizeToken(input.shaper.revision)}-${shaperFeatures}`,
    `segment-${normalizeToken(input.segmenter.engine)}-${normalizeToken(input.segmenter.segmenterId)}-${normalizeToken(input.segmenter.revision)}-${normalizeToken(input.segmenter.dataRevision)}-${normalizeToken(input.segmenter.lineBreakPolicy)}`,
    `fallback-${normalizeToken(input.fallbackPolicy)}`,
    `output-${normalizeToken(input.outputShapeVersion)}`,
  ]
}

export function createVNextMeasurementProfileIdentityPlan(
  input: VNextMeasurementProfileIdentityInput,
): VNextMeasurementProfileIdentityPlan {
  const fontAssets = input.fontAssets.map(cloneFontAsset)
  const styleMappings = input.styleMappings.map(cloneStyleMapping)
  const shaper = cloneShaper(input.shaper)
  const segmenter = cloneSegmenter(input.segmenter)
  const blockingIssues: VNextMeasurementProfileIdentityIssue[] = []
  const warningIssues: VNextMeasurementProfileIdentityIssue[] = []
  const fontIds = new Set(fontAssets.map((asset) => asset.fontId))

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-binding",
      "Measurement profile identity may be planned before production measurement binding, but cannot bind production measurement in this phase.",
    ))
  }

  if (input.profileKey.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-profile-key", "Measurement profiles need a stable profile key."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Measurement profiles need a policy revision."))
  }

  if (fontAssets.length === 0) {
    blockingIssues.push(issue("blocking", "missing-font-assets", "Measurement profiles must include font assets."))
  }

  fontAssets.forEach((asset) => {
    if (asset.fontId.trim().length === 0) {
      blockingIssues.push(issue("blocking", "missing-font-id", "Font assets must have stable ids."))
    }

    const hash = asset.sha256.trim().toLowerCase()
    if (hash.length === 0 || hash === "sha256-") {
      blockingIssues.push(issue("blocking", "missing-font-hash", "Font assets must include target-copy sha256 hashes.", asset.fontId))
    } else if (!/^sha256-[a-f0-9]{64}$/.test(hash)) {
      blockingIssues.push(issue("blocking", "non-sha256-font-hash", "Font asset hashes must be sha256 hex strings.", asset.fontId))
    }
  })

  if (styleMappings.length === 0) {
    blockingIssues.push(issue("blocking", "missing-style-mapping", "Measurement profiles must include style-key font mappings."))
  }

  styleMappings.forEach((mapping) => {
    const mappingFontIds = [mapping.primaryFontId, ...(mapping.fallbackFontIds ?? [])]
    mappingFontIds.forEach((fontId) => {
      if (!fontIds.has(fontId)) {
        blockingIssues.push(issue(
          "blocking",
          "style-mapping-missing-font",
          "Style mappings must reference font ids included in the same measurement profile.",
          `${mapping.styleKey}:${fontId}`,
        ))
      }
    })
  })

  if (shaper.shaperId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-shaper-id", "Measurement profiles must include a shaper id."))
  }

  if (shaper.revision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-shaper-revision", "Measurement profiles must include a shaper revision.", shaper.shaperId))
  }

  if (!shaper.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-shaper", "Measurement profiles require deterministic shaping.", shaper.shaperId))
  }

  if (shaper.packageBoundary === "blocked") {
    blockingIssues.push(issue("blocking", "shaper-boundary-blocked", "The selected shaper package boundary is blocked.", shaper.shaperId))
  }

  if (segmenter.segmenterId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-id", "Measurement profiles must include a segmenter id."))
  }

  if (segmenter.revision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-revision", "Measurement profiles must include a segmenter revision.", segmenter.segmenterId))
  }

  if (segmenter.dataRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-data-revision", "Measurement profiles must include a segmenter data revision.", segmenter.segmenterId))
  }

  if (!segmenter.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-segmenter", "Measurement profiles require deterministic segmentation.", segmenter.segmenterId))
  }

  if (segmenter.runtimeDependent) {
    blockingIssues.push(issue("blocking", "runtime-dependent-segmenter", "Runtime-dependent segmenters cannot be primary measurement profile truth.", segmenter.segmenterId))
  }

  if (segmenter.packageBoundary === "blocked") {
    blockingIssues.push(issue("blocking", "segmenter-boundary-blocked", "The selected segmenter package boundary is blocked.", segmenter.segmenterId))
  }

  if (input.fallbackPolicy === "blocked") {
    blockingIssues.push(issue("blocking", "unsupported-fallback-policy", "Measurement profiles require an explicit supported fallback policy."))
  }

  if (input.outputShapeVersion.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-output-shape", "Measurement profiles require an output shape version."))
  }

  const identityParts = createIdentityParts({
    profileKey: input.profileKey,
    policyRevision: input.policyRevision,
    fontAssets,
    styleMappings,
    shaper,
    segmenter,
    fallbackPolicy: input.fallbackPolicy,
    outputShapeVersion: input.outputShapeVersion,
  })

  return {
    source: VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE,
    mode: VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE,
    status: blockingIssues.length === 0 ? "stable" : "blocked",
    measurementProfileId: identityParts.join(":"),
    profileKey: input.profileKey,
    cacheIdentityVersion: "measurement-profile-v1",
    ingredients: {
      policyRevision: input.policyRevision,
      fontAssets,
      styleMappings,
      shaper,
      segmenter,
      fallbackPolicy: input.fallbackPolicy,
      outputShapeVersion: input.outputShapeVersion,
    },
    identityParts,
    summary: {
      fontAssetCount: fontAssets.length,
      styleMappingCount: styleMappings.length,
      shaperId: shaper.shaperId,
      segmenterId: segmenter.segmenterId,
      lineBreakPolicy: segmenter.lineBreakPolicy,
    },
    executionContract: {
      importsConcreteEngines: false,
      readsFontFiles: false,
      executesShaping: false,
      executesSegmentation: false,
      replacesPaginationMeasurer: false,
      mutatesDocument: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
  }
}
