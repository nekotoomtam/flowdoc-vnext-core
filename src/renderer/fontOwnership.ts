export const VNEXT_FONT_OWNERSHIP_SOURCE = "vnext-font-ownership"
export const VNEXT_FONT_OWNERSHIP_MODE = "font-ownership-clearing-boundary"

export type VNextFontOwnershipStatus = "cleared" | "blocked"
export type VNextFontOwnershipIssueSeverity = "blocking" | "warning"
export type VNextFontOwnershipSourceKind = "legacy-reference" | "external-reference" | "workspace-reference"
export type VNextFontOwnershipTargetKind = "package-font-asset" | "browser-public-mirror"
export type VNextFontOwnershipCopyStatus = "planned"
export type VNextFontOwnershipHashAuthority = "vnext-target-copy" | "source-reference" | "browser-mirror"

export type VNextFontOwnershipIssueCode =
  | "missing-policy-id"
  | "missing-canonical-asset-root"
  | "canonical-root-is-public"
  | "canonical-root-is-legacy"
  | "canonical-root-is-absolute"
  | "missing-font-id"
  | "duplicate-font-id"
  | "missing-source-reference"
  | "source-reference-marked-canonical"
  | "missing-target-path"
  | "target-outside-canonical-root"
  | "target-is-legacy"
  | "target-has-parent-segment"
  | "target-kind-not-package-asset"
  | "hash-authority-not-target-copy"
  | "browser-mirror-as-identity-source"
  | "missing-required-asset"
  | "legacy-source-reference"

export interface VNextFontOwnershipSourceRef {
  kind: VNextFontOwnershipSourceKind
  path: string
  canonical: boolean
}

export interface VNextFontOwnershipTargetRef {
  kind: VNextFontOwnershipTargetKind
  path: string
}

export interface VNextFontOwnershipAsset {
  fontId: string
  required: boolean
  source: VNextFontOwnershipSourceRef
  target: VNextFontOwnershipTargetRef
}

export interface VNextFontOwnershipInput {
  policyId: string
  canonicalAssetRoot: string
  hashAuthority: VNextFontOwnershipHashAuthority
  browserMirrorRoot?: string
  assets: readonly VNextFontOwnershipAsset[]
}

export interface VNextFontOwnershipIssue {
  severity: VNextFontOwnershipIssueSeverity
  code: VNextFontOwnershipIssueCode
  message: string
  targetId?: string
}

export interface VNextFontOwnershipPlannedCopy {
  fontId: string
  status: VNextFontOwnershipCopyStatus
  sourceReferencePath: string
  targetPath: string
  hashMustBeComputedFrom: VNextFontOwnershipHashAuthority
}

export interface VNextFontOwnershipPlan {
  source: typeof VNEXT_FONT_OWNERSHIP_SOURCE
  mode: typeof VNEXT_FONT_OWNERSHIP_MODE
  status: VNextFontOwnershipStatus
  policyId: string
  canonicalOwner: {
    assetRoot: string
    targetKind: "package-font-asset"
    hashAuthority: "vnext-target-copy"
    publicMirrorIsIdentitySource: false
  }
  browserMirror: {
    root: string | null
    allowed: boolean
    identitySource: false
  }
  summary: {
    assetCount: number
    requiredAssetCount: number
    plannedCopyCount: number
    legacySourceReferenceCount: number
  }
  plannedCopies: VNextFontOwnershipPlannedCopy[]
  registryUpdatePolicy: {
    targetKindAfterCopy: "package-font-asset"
    requireVerifiedLicense: true
    requireSha256FromTargetCopy: true
    legacySourceMayRemainEvidence: true
  }
  executionContract: {
    readsFontFiles: false
    copiesFontFiles: false
    computesHashes: false
    mutatesPackageJson: false
    mutatesPackageSchema: false
    writesArtifacts: false
    usesLegacyRuntime: false
  }
  blockingIssues: VNextFontOwnershipIssue[]
  warningIssues: VNextFontOwnershipIssue[]
  nextSteps: string[]
}

function issue(
  severity: VNextFontOwnershipIssueSeverity,
  code: VNextFontOwnershipIssueCode,
  message: string,
  targetId?: string,
): VNextFontOwnershipIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function normalizePath(path: string): string {
  return path.trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/g, "")
}

function pathSegments(path: string): string[] {
  return normalizePath(path).split("/").filter((segment) => segment.length > 0)
}

function isAbsolutePath(path: string): boolean {
  return /^[a-zA-Z]:\//.test(normalizePath(path)) || normalizePath(path).startsWith("/")
}

function hasParentSegment(path: string): boolean {
  return pathSegments(path).some((segment) => segment === "..")
}

function isPublicRoot(path: string): boolean {
  const first = pathSegments(path)[0]?.toLowerCase()
  return first === "public"
}

function isLegacyPath(path: string): boolean {
  return /(^|\/)FlowDocEditor(\/|$)/i.test(normalizePath(path))
}

function isUnderRoot(path: string, root: string): boolean {
  const normalizedPath = normalizePath(path)
  const normalizedRoot = normalizePath(root)
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`)
}

function cloneAsset(asset: VNextFontOwnershipAsset): VNextFontOwnershipAsset {
  return {
    ...asset,
    source: { ...asset.source },
    target: { ...asset.target },
  }
}

export function createVNextFontOwnershipPlan(input: VNextFontOwnershipInput): VNextFontOwnershipPlan {
  const canonicalAssetRoot = normalizePath(input.canonicalAssetRoot)
  const browserMirrorRoot = input.browserMirrorRoot == null || input.browserMirrorRoot.trim().length === 0
    ? null
    : normalizePath(input.browserMirrorRoot)
  const assets = input.assets.map(cloneAsset)
  const blockingIssues: VNextFontOwnershipIssue[] = []
  const warningIssues: VNextFontOwnershipIssue[] = []
  const byFontId = new Map<string, VNextFontOwnershipAsset>()
  const duplicateFontIds = new Set<string>()

  if (input.policyId.trim().length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-policy-id",
      "Font ownership plans must have a stable policy id.",
    ))
  }

  if (canonicalAssetRoot.length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-canonical-asset-root",
      "Font ownership plans must select a vNext-owned canonical asset root.",
    ))
  } else {
    if (isPublicRoot(canonicalAssetRoot)) {
      blockingIssues.push(issue(
        "blocking",
        "canonical-root-is-public",
        "Browser public roots may mirror fonts, but they must not be the canonical measurement identity root.",
      ))
    }

    if (isLegacyPath(canonicalAssetRoot)) {
      blockingIssues.push(issue(
        "blocking",
        "canonical-root-is-legacy",
        "Canonical font asset roots must not point at the old FlowDocEditor repository.",
      ))
    }

    if (isAbsolutePath(canonicalAssetRoot)) {
      blockingIssues.push(issue(
        "blocking",
        "canonical-root-is-absolute",
        "Canonical font asset roots must be repo-relative paths.",
      ))
    }
  }

  if (input.hashAuthority !== "vnext-target-copy") {
    blockingIssues.push(issue(
      "blocking",
      "hash-authority-not-target-copy",
      "Measurement profile hashes must be computed from copied vNext-owned target files.",
    ))
  }

  if (browserMirrorRoot != null && input.hashAuthority === "browser-mirror") {
    blockingIssues.push(issue(
      "blocking",
      "browser-mirror-as-identity-source",
      "Browser public mirrors may serve fonts, but must not define measurement identity.",
    ))
  }

  assets.forEach((asset) => {
    const fontId = asset.fontId.trim()
    if (fontId.length === 0) {
      blockingIssues.push(issue(
        "blocking",
        "missing-font-id",
        "Every owned font asset must have a stable font id.",
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
      "Font ownership asset ids must be unique.",
      fontId,
    ))
  })

  assets.forEach((asset) => {
    if (asset.fontId.trim().length === 0) return

    const sourcePath = normalizePath(asset.source.path)
    const targetPath = normalizePath(asset.target.path)

    if (asset.required && sourcePath.length === 0) {
      blockingIssues.push(issue(
        "blocking",
        "missing-source-reference",
        "Required font assets must keep a source reference until the vNext copy is created.",
        asset.fontId,
      ))
    }

    if (asset.source.canonical) {
      blockingIssues.push(issue(
        "blocking",
        "source-reference-marked-canonical",
        "Source references are evidence only and must not be marked canonical.",
        asset.fontId,
      ))
    }

    if (asset.source.kind === "legacy-reference") {
      warningIssues.push(issue(
        "warning",
        "legacy-source-reference",
        "Legacy source references may seed the copy plan but cannot own measurement identity.",
        asset.fontId,
      ))
    }

    if (asset.required && targetPath.length === 0) {
      blockingIssues.push(issue(
        "blocking",
        "missing-target-path",
        "Required font assets must select a vNext-owned target path before copy.",
        asset.fontId,
      ))
    }

    if (asset.target.kind !== "package-font-asset") {
      blockingIssues.push(issue(
        "blocking",
        "target-kind-not-package-asset",
        "Canonical font targets must be package font assets; browser public paths are mirrors only.",
        asset.fontId,
      ))
    }

    if (targetPath.length > 0 && !isUnderRoot(targetPath, canonicalAssetRoot)) {
      blockingIssues.push(issue(
        "blocking",
        "target-outside-canonical-root",
        "Font target paths must stay under the selected canonical asset root.",
        asset.fontId,
      ))
    }

    if (isLegacyPath(targetPath)) {
      blockingIssues.push(issue(
        "blocking",
        "target-is-legacy",
        "Font target paths must not point at the old FlowDocEditor repository.",
        asset.fontId,
      ))
    }

    if (hasParentSegment(targetPath)) {
      blockingIssues.push(issue(
        "blocking",
        "target-has-parent-segment",
        "Font target paths must not contain parent-directory segments.",
        asset.fontId,
      ))
    }

    if (asset.required && !byFontId.has(asset.fontId)) {
      blockingIssues.push(issue(
        "blocking",
        "missing-required-asset",
        "Required font assets must be present in the ownership plan.",
        asset.fontId,
      ))
    }
  })

  const plannedCopies = assets
    .filter((asset) => asset.fontId.trim().length > 0 && asset.source.path.trim().length > 0 && asset.target.path.trim().length > 0)
    .map((asset) => ({
      fontId: asset.fontId,
      status: "planned" as const,
      sourceReferencePath: normalizePath(asset.source.path),
      targetPath: normalizePath(asset.target.path),
      hashMustBeComputedFrom: "vnext-target-copy" as const,
    }))

  return {
    source: VNEXT_FONT_OWNERSHIP_SOURCE,
    mode: VNEXT_FONT_OWNERSHIP_MODE,
    status: blockingIssues.length === 0 ? "cleared" : "blocked",
    policyId: input.policyId,
    canonicalOwner: {
      assetRoot: canonicalAssetRoot,
      targetKind: "package-font-asset",
      hashAuthority: "vnext-target-copy",
      publicMirrorIsIdentitySource: false,
    },
    browserMirror: {
      root: browserMirrorRoot,
      allowed: browserMirrorRoot != null,
      identitySource: false,
    },
    summary: {
      assetCount: assets.length,
      requiredAssetCount: assets.filter((asset) => asset.required).length,
      plannedCopyCount: plannedCopies.length,
      legacySourceReferenceCount: assets.filter((asset) => asset.source.kind === "legacy-reference").length,
    },
    plannedCopies,
    registryUpdatePolicy: {
      targetKindAfterCopy: "package-font-asset",
      requireVerifiedLicense: true,
      requireSha256FromTargetCopy: true,
      legacySourceMayRemainEvidence: true,
    },
    executionContract: {
      readsFontFiles: false,
      copiesFontFiles: false,
      computesHashes: false,
      mutatesPackageJson: false,
      mutatesPackageSchema: false,
      writesArtifacts: false,
      usesLegacyRuntime: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Copy selected font files from evidence paths into the canonical package asset root.",
      "Compute sha256 hashes from the copied vNext-owned target files.",
      "Update the font registry facts to use package-font-asset targets and target-copy hashes.",
      "Add package/distribution asset inclusion only after copied fonts exist.",
      "Create optional browser public mirrors from package assets without using mirror paths for measurement identity.",
    ],
  }
}
