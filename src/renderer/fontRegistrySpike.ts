import type {
  VNextTextMeasurementSpikeFontAsset,
  VNextTextMeasurementSpikeFontFormat,
  VNextTextMeasurementSpikeFontStyle,
} from "./textMeasurementEngineSpike.js"

export const VNEXT_FONT_REGISTRY_SPIKE_SOURCE = "vnext-font-registry-spike"
export const VNEXT_FONT_REGISTRY_SPIKE_MODE = "font-registry-spike-boundary"

export type VNextFontRegistrySpikeStatus = "ready-for-measurement-spike" | "blocked"
export type VNextFontRegistrySpikeIdentityStatus = "stable" | "spike-only" | "blocked"
export type VNextFontRegistrySpikeIssueSeverity = "blocking" | "warning"

export type VNextFontRegistrySpikeAssetAvailability = "available" | "planned" | "blocked"
export type VNextFontRegistrySpikeAssetRole = "primary-thai" | "fallback-thai" | "style-variant" | "comparison"
export type VNextFontRegistrySpikeSourceKind = "legacy-reference" | "workspace-public-font" | "external-reference" | "future-registry"
export type VNextFontRegistrySpikeTargetKind = "workspace-public-font" | "package-font-asset" | "not-selected"
export type VNextFontRegistrySpikeHashAlgorithm = "sha256" | "unknown"

export type VNextFontRegistrySpikeIssueCode =
  | "production-measurement-binding"
  | "missing-registry-id"
  | "missing-policy-revision"
  | "missing-font-id"
  | "duplicate-font-id"
  | "missing-font-family"
  | "unsupported-font-format"
  | "invalid-font-weight"
  | "available-font-without-vnext-target"
  | "legacy-path-as-target"
  | "legacy-source-reference"
  | "missing-font-license"
  | "unverified-font-license"
  | "missing-font-hash"
  | "non-sha256-font-hash"
  | "missing-primary-thai-font"
  | "primary-thai-font-missing-thai-script"
  | "missing-style-mapping"
  | "style-mapping-missing-font"
  | "required-style-mapping-unavailable"

export interface VNextFontRegistrySpikeSourceRef {
  kind: VNextFontRegistrySpikeSourceKind
  reference: string
  canonical: boolean
}

export interface VNextFontRegistrySpikeTargetRef {
  kind: VNextFontRegistrySpikeTargetKind
  path?: string
}

export interface VNextFontRegistrySpikeLicenseFact {
  id: string
  verified: boolean
  source?: string
}

export interface VNextFontRegistrySpikeHashFact {
  algorithm: VNextFontRegistrySpikeHashAlgorithm
  value: string
}

export interface VNextFontRegistrySpikeAsset {
  fontId: string
  family: string
  style: VNextTextMeasurementSpikeFontStyle
  weight: number
  format: VNextTextMeasurementSpikeFontFormat
  role: VNextFontRegistrySpikeAssetRole
  availability: VNextFontRegistrySpikeAssetAvailability
  source: VNextFontRegistrySpikeSourceRef
  target: VNextFontRegistrySpikeTargetRef
  license?: VNextFontRegistrySpikeLicenseFact
  hash?: VNextFontRegistrySpikeHashFact
  revision?: string
  supportedScripts?: readonly string[]
}

export interface VNextFontRegistrySpikeStyleMapping {
  styleKey: string
  primaryFontId: string
  fallbackFontIds?: readonly string[]
  required?: boolean
}

export interface VNextFontRegistrySpikeInput {
  registryId: string
  policyRevision: string
  bindProductionMeasurement?: boolean
  assets: readonly VNextFontRegistrySpikeAsset[]
  styleMappings: readonly VNextFontRegistrySpikeStyleMapping[]
}

export interface VNextFontRegistrySpikeIssue {
  severity: VNextFontRegistrySpikeIssueSeverity
  code: VNextFontRegistrySpikeIssueCode
  message: string
  targetId?: string
}

export interface VNextFontRegistrySpikeProfileCandidate {
  fontSetId: string
  identityStatus: VNextFontRegistrySpikeIdentityStatus
  fontAssetIds: string[]
  fontAssetHashes: string[]
  styleKeys: string[]
}

export interface VNextFontRegistrySpikePlan {
  source: typeof VNEXT_FONT_REGISTRY_SPIKE_SOURCE
  mode: typeof VNEXT_FONT_REGISTRY_SPIKE_MODE
  status: VNextFontRegistrySpikeStatus
  registryId: string
  policyRevision: string
  summary: {
    assetCount: number
    availableAssetCount: number
    primaryThaiFontIds: string[]
    styleMappingCount: number
    requiredStyleMappingCount: number
  }
  assets: VNextFontRegistrySpikeAsset[]
  styleMappings: VNextFontRegistrySpikeStyleMapping[]
  measurementFontAssets: VNextTextMeasurementSpikeFontAsset[]
  profileCandidate: VNextFontRegistrySpikeProfileCandidate
  executionContract: {
    readsFontFiles: false
    copiesFontFiles: false
    computesHashes: false
    installsDependencies: false
    importsConcreteFontParsers: false
    mutatesPackageSchema: false
    replacesPaginationMeasurer: false
    writesArtifacts: false
    usesLegacyRuntime: false
  }
  blockingIssues: VNextFontRegistrySpikeIssue[]
  warningIssues: VNextFontRegistrySpikeIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextFontRegistrySpikeIssueSeverity,
  code: VNextFontRegistrySpikeIssueCode,
  message: string,
  targetId?: string,
): VNextFontRegistrySpikeIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneAsset(asset: VNextFontRegistrySpikeAsset): VNextFontRegistrySpikeAsset {
  return {
    ...asset,
    source: { ...asset.source },
    target: { ...asset.target },
    license: asset.license == null ? undefined : { ...asset.license },
    hash: asset.hash == null ? undefined : { ...asset.hash },
    supportedScripts: asset.supportedScripts == null ? undefined : [...asset.supportedScripts],
  }
}

function cloneMapping(mapping: VNextFontRegistrySpikeStyleMapping): VNextFontRegistrySpikeStyleMapping {
  return {
    ...mapping,
    fallbackFontIds: mapping.fallbackFontIds == null ? undefined : [...mapping.fallbackFontIds],
  }
}

function normalizeToken(value: string | undefined): string {
  const token = (value ?? "unset").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return token.length === 0 ? "unset" : token
}

function normalizeHash(hash: VNextFontRegistrySpikeHashFact | undefined): string {
  if (hash == null || hash.value.trim().length === 0) return ""
  const value = hash.value.trim()
  return value.startsWith(`${hash.algorithm}-`) ? value : `${hash.algorithm}-${value}`
}

function hasLegacyPath(path: string | undefined): boolean {
  if (path == null) return false
  return /(^|[\\/])\.\.([\\/]|$)/.test(path) || /FlowDocEditor/i.test(path)
}

function isSupportedFormat(format: VNextTextMeasurementSpikeFontFormat): boolean {
  return format === "ttf" || format === "otf" || format === "woff2"
}

function isValidWeight(weight: number): boolean {
  return Number.isInteger(weight) && weight >= 1 && weight <= 1000
}

function supportsThai(asset: VNextFontRegistrySpikeAsset): boolean {
  return asset.supportedScripts?.some((script) => script.trim().toLowerCase() === "thai") ?? false
}

function createProfileCandidate(
  input: VNextFontRegistrySpikeInput,
  availableAssets: readonly VNextFontRegistrySpikeAsset[],
  styleMappings: readonly VNextFontRegistrySpikeStyleMapping[],
  blockingIssues: readonly VNextFontRegistrySpikeIssue[],
  _warningIssues: readonly VNextFontRegistrySpikeIssue[],
): VNextFontRegistrySpikeProfileCandidate {
  const fontAssetTokens = availableAssets
    .map((asset) => `${normalizeToken(asset.fontId)}-${normalizeToken(normalizeHash(asset.hash) || asset.revision)}`)
    .sort()
  const fontSetId = [
    "font-registry-spike",
    normalizeToken(input.registryId),
    normalizeToken(input.policyRevision),
    `fonts-${fontAssetTokens.length === 0 ? "unset" : fontAssetTokens.join("+")}`,
  ].join(":")

  return {
    fontSetId,
    identityStatus: blockingIssues.length > 0 ? "blocked" : "stable",
    fontAssetIds: availableAssets.map((asset) => asset.fontId),
    fontAssetHashes: availableAssets.map((asset) => normalizeHash(asset.hash)),
    styleKeys: styleMappings.map((mapping) => mapping.styleKey),
  }
}

function toMeasurementFontAsset(asset: VNextFontRegistrySpikeAsset): VNextTextMeasurementSpikeFontAsset {
  return {
    fontId: asset.fontId,
    family: asset.family,
    style: asset.style,
    weight: asset.weight,
    format: asset.format,
    source: "future-registry",
    available: asset.availability === "available",
    license: asset.license?.id,
    revision: asset.revision ?? (normalizeHash(asset.hash) || undefined),
    hash: normalizeHash(asset.hash) || undefined,
  }
}

export function createVNextFontRegistrySpikePlan(input: VNextFontRegistrySpikeInput): VNextFontRegistrySpikePlan {
  const assets = input.assets.map(cloneAsset)
  const styleMappings = input.styleMappings.map(cloneMapping)
  const blockingIssues: VNextFontRegistrySpikeIssue[] = []
  const warningIssues: VNextFontRegistrySpikeIssue[] = []
  const byFontId = new Map<string, VNextFontRegistrySpikeAsset>()
  const duplicateFontIds = new Set<string>()

  if (input.registryId.trim().length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-registry-id",
      "Font registry spike plans must have a stable registry id.",
    ))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-policy-revision",
      "Font registry spike plans must record the policy revision used for profile identity.",
    ))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue(
      "blocking",
      "production-measurement-binding",
      "The font registry spike cannot bind fonts into production measurement or pagination.",
    ))
  }

  assets.forEach((asset) => {
    const fontId = asset.fontId.trim()
    if (fontId.length === 0) {
      blockingIssues.push(issue(
        "blocking",
        "missing-font-id",
        "Each font registry asset must have a stable font id.",
      ))
      return
    }

    if (byFontId.has(fontId)) duplicateFontIds.add(fontId)
    byFontId.set(fontId, asset)
  })

  duplicateFontIds.forEach((fontId) => {
    blockingIssues.push(issue(
      "blocking",
      "duplicate-font-id",
      "Font registry asset ids must be unique.",
      fontId,
    ))
  })

  assets.forEach((asset) => {
    if (asset.fontId.trim().length === 0) return

    if (asset.family.trim().length === 0) {
      blockingIssues.push(issue(
        "blocking",
        "missing-font-family",
        "Font registry assets must record a font family.",
        asset.fontId,
      ))
    }

    if (!isSupportedFormat(asset.format)) {
      blockingIssues.push(issue(
        "blocking",
        "unsupported-font-format",
        "Font registry spike assets must use ttf, otf, or woff2 before measurement.",
        asset.fontId,
      ))
    }

    if (!isValidWeight(asset.weight)) {
      blockingIssues.push(issue(
        "blocking",
        "invalid-font-weight",
        "Font registry asset weight must be an integer from 1 to 1000.",
        asset.fontId,
      ))
    }

    if (asset.source.kind === "legacy-reference") {
      warningIssues.push(issue(
        "warning",
        "legacy-source-reference",
        "Legacy font folders may seed this registry, but they are reference evidence only.",
        asset.fontId,
      ))
    }

    if (hasLegacyPath(asset.target.path)) {
      blockingIssues.push(issue(
        "blocking",
        "legacy-path-as-target",
        "Font registry targets must not point at legacy FlowDocEditor paths or parent directories.",
        asset.fontId,
      ))
    }

    if (asset.availability === "available") {
      if (
        (asset.target.kind !== "workspace-public-font" && asset.target.kind !== "package-font-asset")
        || asset.target.path == null
        || asset.target.path.trim().length === 0
      ) {
        blockingIssues.push(issue(
          "blocking",
          "available-font-without-vnext-target",
          "Available font registry assets must have a vNext-owned package or workspace font target path.",
          asset.fontId,
        ))
      }

      if (asset.license == null || asset.license.id.trim().length === 0) {
        blockingIssues.push(issue(
          "blocking",
          "missing-font-license",
          "Available font registry assets must record a license id before measurement use.",
          asset.fontId,
        ))
      } else if (!asset.license.verified) {
        blockingIssues.push(issue(
          "blocking",
          "unverified-font-license",
          "Available font registry asset licenses must be verified before measurement use.",
          asset.fontId,
        ))
      }

      if (asset.hash == null || asset.hash.value.trim().length === 0) {
        blockingIssues.push(issue(
          "blocking",
          "missing-font-hash",
          "Available font registry assets must record a stable hash before profile identity is trusted.",
          asset.fontId,
        ))
      } else if (asset.hash.algorithm !== "sha256") {
        blockingIssues.push(issue(
          "blocking",
          "non-sha256-font-hash",
          "Font registry assets must use sha256 hashes for measurement profile identity.",
          asset.fontId,
        ))
      }
    }

    if (asset.role === "primary-thai" && !supportsThai(asset)) {
      blockingIssues.push(issue(
        "blocking",
        "primary-thai-font-missing-thai-script",
        "Primary Thai font assets must explicitly declare Thai script support.",
        asset.fontId,
      ))
    }
  })

  const availableAssets = assets.filter((asset) => asset.availability === "available")
  const primaryThaiFonts = availableAssets.filter((asset) => asset.role === "primary-thai")
  if (primaryThaiFonts.length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-primary-thai-font",
      "At least one available primary Thai font is required before Thai measurement can run.",
    ))
  }

  if (styleMappings.length === 0) {
    warningIssues.push(issue(
      "warning",
      "missing-style-mapping",
      "Add styleKey-to-font mappings before using the registry for measured pagination samples.",
    ))
  }

  styleMappings.forEach((mapping) => {
    const fontIds = [mapping.primaryFontId, ...(mapping.fallbackFontIds ?? [])]
    fontIds.forEach((fontId) => {
      const asset = byFontId.get(fontId)
      if (asset == null) {
        blockingIssues.push(issue(
          "blocking",
          "style-mapping-missing-font",
          "Style mappings must reference registered font ids.",
          `${mapping.styleKey}:${fontId}`,
        ))
        return
      }

      if ((mapping.required ?? false) && asset.availability !== "available") {
        blockingIssues.push(issue(
          "blocking",
          "required-style-mapping-unavailable",
          "Required style mappings must point only at available font assets.",
          `${mapping.styleKey}:${fontId}`,
        ))
      }
    })
  })

  const profileCandidate = createProfileCandidate(input, availableAssets, styleMappings, blockingIssues, warningIssues)

  return {
    source: VNEXT_FONT_REGISTRY_SPIKE_SOURCE,
    mode: VNEXT_FONT_REGISTRY_SPIKE_MODE,
    status: blockingIssues.length === 0 ? "ready-for-measurement-spike" : "blocked",
    registryId: input.registryId,
    policyRevision: input.policyRevision,
    summary: {
      assetCount: assets.length,
      availableAssetCount: availableAssets.length,
      primaryThaiFontIds: primaryThaiFonts.map((asset) => asset.fontId),
      styleMappingCount: styleMappings.length,
      requiredStyleMappingCount: styleMappings.filter((mapping) => mapping.required === true).length,
    },
    assets,
    styleMappings,
    measurementFontAssets: availableAssets.map(toMeasurementFontAsset),
    profileCandidate,
    executionContract: {
      readsFontFiles: false,
      copiesFontFiles: false,
      computesHashes: false,
      installsDependencies: false,
      importsConcreteFontParsers: false,
      mutatesPackageSchema: false,
      replacesPaginationMeasurer: false,
      writesArtifacts: false,
      usesLegacyRuntime: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Copy selected font files into the vNext-owned font asset location through a separate file-operation phase.",
      "Compute sha256 hashes from copied vNext-owned font files and update registry facts.",
      "Feed measurementFontAssets into the text measurement engine spike plan.",
      "Run rustybuzz shaping smoke tests against the registered Thai font set.",
    ],
  }
}
