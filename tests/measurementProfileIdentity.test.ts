import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE,
  VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE,
  type VNextMeasurementProfileIdentityInput,
} from "../src/index.js"

interface FontAssetManifest {
  fontAssets: Array<{
    fontId: string
    family: string
    style: "normal" | "italic"
    weight: number
    sha256: string
  }>
  styleMappings: Array<{
    styleKey: string
    primaryFontId: string
    fallbackFontIds: string[]
  }>
}

function readManifest(): FontAssetManifest {
  return JSON.parse(readFileSync(resolve(process.cwd(), "assets/fonts/font-assets.v1.json"), "utf8")) as FontAssetManifest
}

function profileInput(overrides: Partial<VNextMeasurementProfileIdentityInput> = {}): VNextMeasurementProfileIdentityInput {
  const manifest = readManifest()

  return {
    profileKey: "thai-rustybuzz-icu4x-v1",
    policyRevision: "measurement-policy-v1",
    fontAssets: manifest.fontAssets.map((asset) => ({
      fontId: asset.fontId,
      family: asset.family,
      style: asset.style,
      weight: asset.weight,
      sha256: asset.sha256,
    })),
    styleMappings: manifest.styleMappings,
    shaper: {
      shaperId: "rustybuzz-wasm",
      engine: "rustybuzz",
      revision: "rustybuzz-planned",
      deterministic: true,
      packageBoundary: "external-adapter",
      features: {
        kerning: true,
        ligatures: true,
        complexText: true,
        clusterMapping: true,
      },
    },
    segmenter: {
      segmenterId: "icu4x-segmenter",
      engine: "icu4x",
      revision: "icu4x-planned",
      dataRevision: "icu4x-data-planned",
      deterministic: true,
      runtimeDependent: false,
      packageBoundary: "external-adapter",
      lineBreakPolicy: "icu4x-uax14-thai-v1",
    },
    fallbackPolicy: "explicit-font-list-v1",
    outputShapeVersion: "glyph-line-box-v1",
    ...overrides,
  }
}

describe("vNext measurement profile identity contract", () => {
  it("builds a stable measurementProfileId from copied font hashes and pinned text engines", () => {
    const plan = createVNextMeasurementProfileIdentityPlan(profileInput())

    expect(plan).toMatchObject({
      source: VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE,
      mode: VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE,
      status: "stable",
      profileKey: "thai-rustybuzz-icu4x-v1",
      cacheIdentityVersion: "measurement-profile-v1",
      summary: {
        fontAssetCount: 6,
        styleMappingCount: 3,
        shaperId: "rustybuzz-wasm",
        segmenterId: "icu4x-segmenter",
        lineBreakPolicy: "icu4x-uax14-thai-v1",
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
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.measurementProfileId).toContain("measurement-profile-v1:thai-rustybuzz-icu4x-v1")
    expect(plan.measurementProfileId).toContain("shape-rustybuzz-rustybuzz-wasm-rustybuzz-planned-kern-liga-complex-clusters")
    expect(plan.measurementProfileId).toContain("segment-icu4x-icu4x-segmenter-icu4x-planned-icu4x-data-planned-icu4x-uax14-thai-v1")
    expect(plan.identityParts).toEqual(expect.arrayContaining([
      expect.stringContaining("font-sarabun-regular-400-normal-b8150084e25734e6"),
      expect.stringContaining("style-paragraph-sarabun-regular-noto-sans-thai-regular"),
    ]))
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("changes identity when font hash, shaper revision, or segmenter data revision changes", () => {
    const base = createVNextMeasurementProfileIdentityPlan(profileInput())
    const fontChanged = createVNextMeasurementProfileIdentityPlan(profileInput({
      fontAssets: profileInput().fontAssets.map((asset) => (
        asset.fontId === "sarabun-regular"
          ? { ...asset, sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
          : asset
      )),
    }))
    const shaperChanged = createVNextMeasurementProfileIdentityPlan(profileInput({
      shaper: {
        ...profileInput().shaper,
        revision: "rustybuzz-next",
      },
    }))
    const dataChanged = createVNextMeasurementProfileIdentityPlan(profileInput({
      segmenter: {
        ...profileInput().segmenter,
        dataRevision: "icu4x-data-next",
      },
    }))

    expect(fontChanged.measurementProfileId).not.toBe(base.measurementProfileId)
    expect(shaperChanged.measurementProfileId).not.toBe(base.measurementProfileId)
    expect(dataChanged.measurementProfileId).not.toBe(base.measurementProfileId)
  })

  it("blocks runtime-dependent Intl.Segmenter as primary profile truth", () => {
    const plan = createVNextMeasurementProfileIdentityPlan(profileInput({
      segmenter: {
        segmenterId: "intl-segmenter",
        engine: "intl-segmenter",
        revision: "runtime-icu",
        dataRevision: "runtime-icu",
        deterministic: false,
        runtimeDependent: true,
        packageBoundary: "external-adapter",
        lineBreakPolicy: "custom",
      },
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "nondeterministic-segmenter",
      "runtime-dependent-segmenter",
    ])
  })

  it("blocks missing hashes, broken style mappings, and production binding", () => {
    const input = profileInput()
    const plan = createVNextMeasurementProfileIdentityPlan({
      ...input,
      bindProductionMeasurement: true,
      fontAssets: [{
        ...input.fontAssets[0],
        sha256: "",
      }],
      styleMappings: [{
        styleKey: "paragraph",
        primaryFontId: "missing-font",
      }],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "production-binding",
      "missing-font-hash",
      "style-mapping-missing-font",
    ])
  })

  it("keeps the identity contract independent from concrete engines and font IO", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/measurementProfileIdentity.ts"), "utf8")

    expect(source).toContain("createVNextMeasurementProfileIdentityPlan")
    expect(source).toContain("measurementProfileId")
    expect(source).not.toMatch(/node:fs|node:crypto|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|icu4x|harfbuzzjs|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|icu4x|harfbuzzjs|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("createHash")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("measureVNextText")
  })

  it("documents the measurement profile identity contract in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 104 contract boundary.")
    expect(boundaryDoc).toContain("measurementProfileId")
    expect(boundaryDoc).toContain("rustybuzz")
    expect(boundaryDoc).toContain("ICU4X")
    expect(readme).toContain("Measurement profile identity contract")
    expect(readme).toContain("docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md")
    expect(ledger).toContain("| 104 | Measurement profile identity contract | done |")
    expect(roadmap).toContain("## Phase 104: Measurement Profile Identity Contract")
  })
})
