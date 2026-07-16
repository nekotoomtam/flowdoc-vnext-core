import { createHash } from "node:crypto"
import { readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextFontRegistrySpikePlan,
  createVNextTextMeasurementEngineSpikePlan,
  type VNextFontRegistrySpikeInput,
} from "../src/index.js"

interface FontAssetManifest {
  manifestVersion: number
  policyId: string
  assetRoot: string
  hashAlgorithm: "sha256"
  hashAuthority: "vnext-target-copy"
  productionMeasurementBinding: boolean
  licenseFiles: Array<{
    licenseId: string
    family: string
    path: string
    bytes: number
    sha256: string
  }>
  fontAssets: Array<{
    fontId: string
    family: string
    style: "normal" | "italic"
    weight: number
    format: "ttf"
    role: "primary-thai" | "fallback-thai" | "style-variant" | "comparison"
    supportedScripts: string[]
    sourceReference: {
      path: string
      canonical: boolean
    }
    target: {
      kind: "package-font-asset"
      path: string
    }
    license: {
      id: "OFL-1.1"
      verified: boolean
      path: string
    }
    bytes: number
    sha256: string
  }>
  candidateFontAssets: Array<{
    fontId: string
    family: string
    style: "normal" | "italic"
    weight: number
    format: "ttf"
    role: "primary-thai" | "fallback-thai" | "style-variant" | "comparison"
    supportedScripts: string[]
    sourceReference: {
      path: string
      canonical: boolean
    }
    target: {
      kind: "package-font-asset"
      path: string
    }
    license: {
      id: "OFL-1.1"
      verified: boolean
      path: string
    }
    bytes: number
    sha256: string
  }>
  styleMappings: Array<{
    styleKey: string
    primaryFontId: string
    fallbackFontIds: string[]
    required: boolean
  }>
}

function repoPath(relativePath: string): string {
  return resolve(process.cwd(), relativePath)
}

function readManifest(): FontAssetManifest {
  return JSON.parse(readFileSync(repoPath("assets/fonts/font-assets.v1.json"), "utf8")) as FontAssetManifest
}

function sha256File(relativePath: string): string {
  return createHash("sha256").update(readFileSync(repoPath(relativePath))).digest("hex")
}

function toRegistryInput(manifest: FontAssetManifest): VNextFontRegistrySpikeInput {
  return {
    registryId: manifest.policyId,
    policyRevision: "font-copy-hash-v1",
    assets: manifest.fontAssets.map((asset) => ({
      fontId: asset.fontId,
      family: asset.family,
      style: asset.style,
      weight: asset.weight,
      format: asset.format,
      role: asset.role,
      availability: "available",
      source: {
        kind: "legacy-reference",
        reference: asset.sourceReference.path,
        canonical: asset.sourceReference.canonical,
      },
      target: {
        kind: asset.target.kind,
        path: asset.target.path,
      },
      license: {
        id: asset.license.id,
        verified: asset.license.verified,
        source: asset.license.path,
      },
      hash: {
        algorithm: manifest.hashAlgorithm,
        value: asset.sha256,
      },
      supportedScripts: asset.supportedScripts,
    })),
    styleMappings: manifest.styleMappings,
  }
}

describe("vNext font asset copy and hash evidence", () => {
  it("records copied vNext-owned font assets with target-copy sha256 hashes", () => {
    const manifest = readManifest()

    expect(manifest).toMatchObject({
      manifestVersion: 1,
      policyId: "thai-font-assets-v1",
      assetRoot: "assets/fonts",
      hashAlgorithm: "sha256",
      hashAuthority: "vnext-target-copy",
      productionMeasurementBinding: false,
    })
    expect(manifest.fontAssets.map((asset) => asset.fontId)).toEqual([
      "sarabun-regular",
      "sarabun-bold",
      "sarabun-italic",
      "sarabun-bold-italic",
      "noto-sans-thai-regular",
      "noto-sans-thai-bold",
    ])
    manifest.fontAssets.forEach((asset) => {
      expect(asset.target.kind).toBe("package-font-asset")
      expect(asset.target.path.startsWith("assets/fonts/")).toBe(true)
      expect(asset.target.path).not.toContain("FlowDocEditor")
      expect(asset.sourceReference.canonical).toBe(false)
      expect(asset.license).toMatchObject({
        id: "OFL-1.1",
        verified: true,
      })
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(statSync(repoPath(asset.target.path)).size).toBe(asset.bytes)
      expect(sha256File(asset.target.path)).toBe(asset.sha256)
    })
  })

  it("registers hash-verified IBM Plex assets as inactive comparison candidates", () => {
    const manifest = readManifest()

    expect(manifest.candidateFontAssets.map((asset) => asset.fontId)).toEqual([
      "ibm-plex-sans-thai-regular",
      "ibm-plex-sans-thai-bold",
      "ibm-plex-sans-thai-light",
      "ibm-plex-sans-thai-thin",
    ])
    manifest.candidateFontAssets.forEach((asset) => {
      expect(asset.family).toBe("IBM Plex Sans Thai")
      expect(asset.target.kind).toBe("package-font-asset")
      expect(asset.target.path.startsWith("assets/fonts/IBM_Plex_Sans_Thai/")).toBe(true)
      expect(asset.sourceReference.canonical).toBe(false)
      expect(asset.license).toMatchObject({
        id: "OFL-1.1",
        verified: true,
        path: "assets/fonts/IBM_Plex_Sans_Thai/OFL.txt",
      })
      expect(asset.supportedScripts).toEqual(["Latin", "Thai"])
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(statSync(repoPath(asset.target.path)).size).toBe(asset.bytes)
      expect(sha256File(asset.target.path)).toBe(asset.sha256)
    })
    const mappedFontIds = manifest.styleMappings.flatMap((mapping) => [
      mapping.primaryFontId,
      ...mapping.fallbackFontIds,
    ])
    expect(manifest.candidateFontAssets.every((asset) => !mappedFontIds.includes(asset.fontId))).toBe(true)
  })

  it("records copied OFL license evidence with target-copy hashes", () => {
    const manifest = readManifest()

    expect(manifest.licenseFiles.map((license) => license.family)).toEqual([
      "Sarabun",
      "Noto Sans Thai",
      "IBM Plex Sans Thai",
    ])
    manifest.licenseFiles.forEach((license) => {
      const licenseText = readFileSync(repoPath(license.path), "utf8")

      expect(license.path.startsWith("assets/fonts/")).toBe(true)
      expect(license.licenseId).toBe("OFL-1.1")
      expect(statSync(repoPath(license.path)).size).toBe(license.bytes)
      expect(sha256File(license.path)).toBe(license.sha256)
      expect(licenseText).toContain("SIL OPEN FONT LICENSE Version 1.1")
    })
  })

  it("feeds copied font hashes into the registry and engine spike plans without production binding", () => {
    const manifest = readManifest()
    const registryPlan = createVNextFontRegistrySpikePlan(toRegistryInput(manifest))
    const enginePlan = createVNextTextMeasurementEngineSpikePlan({
      spikeId: "thai-text-measurement-v1",
      policyRevision: "font-copy-hash-v1",
      fontAssets: registryPlan.measurementFontAssets,
      shapers: [{
        shaperId: "rustybuzz-wasm",
        engine: "harfbuzz",
        role: "primary-candidate",
        availability: "available",
        revision: "rustybuzz-planned",
        deterministic: true,
        supportsGlyphAdvances: true,
        supportsGlyphClusters: true,
        supportsComplexText: true,
        packageBoundary: "external-adapter",
      }],
      lineBreakers: [{
        lineBreakerId: "icu4x-segmenter",
        engine: "icu4x",
        role: "primary-candidate",
        availability: "available",
        revision: "icu4x-planned",
        deterministic: true,
        runtimeDependent: false,
        supportsThai: true,
        followsUnicodeLineBreaking: true,
        packageBoundary: "external-adapter",
      }, {
        lineBreakerId: "intl-segmenter",
        engine: "intl-segmenter",
        role: "comparison-baseline",
        availability: "available",
        revision: "runtime-icu",
        deterministic: false,
        runtimeDependent: true,
        supportsThai: true,
        followsUnicodeLineBreaking: true,
        packageBoundary: "external-adapter",
      }, {
        lineBreakerId: "thai-oracle-reference",
        engine: "libthai",
        role: "thai-oracle",
        availability: "planned",
        revision: "oracle-planned",
        deterministic: true,
        runtimeDependent: false,
        supportsThai: true,
        followsUnicodeLineBreaking: false,
        packageBoundary: "external-adapter",
      }],
    })

    expect(registryPlan.status).toBe("ready-for-measurement-spike")
    expect(registryPlan.blockingIssues).toEqual([])
    expect(registryPlan.profileCandidate.fontAssetHashes).toEqual(manifest.fontAssets.map((asset) => `sha256-${asset.sha256}`))
    expect(enginePlan.status).toBe("ready-for-spike")
    expect(enginePlan.profileCandidate.ingredients.fontAssetHashes).toEqual(manifest.fontAssets.map((asset) => `sha256-${asset.sha256}`))
    expect(enginePlan.executionContract.replacesPaginationMeasurer).toBe(false)
  })

  it("keeps copied font assets in package distribution metadata", () => {
    const packageJson = JSON.parse(readFileSync(repoPath("package.json"), "utf8")) as { files: string[] }

    expect(packageJson.files).toContain("assets")
  })

  it("documents the font asset copy and hash evidence in the phase trail", () => {
    const readText = (path: string) => readFileSync(repoPath(path), "utf8")
    const boundaryDoc = readText("docs/FONT_ASSET_COPY_HASH_EVIDENCE.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 103 evidence boundary.")
    expect(boundaryDoc).toContain("assets/fonts/font-assets.v1.json")
    expect(boundaryDoc).toContain("sha256")
    expect(readme).toContain("Font asset copy/hash evidence")
    expect(readme).toContain("docs/FONT_ASSET_COPY_HASH_EVIDENCE.md")
    expect(ledger).toContain("| 103 | Font asset copy/hash evidence | done |")
    expect(roadmap).toContain("## Phase 103: Font Asset Copy / Hash Evidence")
  })
})
