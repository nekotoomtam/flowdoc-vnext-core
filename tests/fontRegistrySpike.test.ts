import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextFontRegistrySpikePlan,
  createVNextTextMeasurementEngineSpikePlan,
  VNEXT_FONT_REGISTRY_SPIKE_MODE,
  VNEXT_FONT_REGISTRY_SPIKE_SOURCE,
  type VNextFontRegistrySpikeInput,
} from "../src/index.js"

function fontRegistryInput(overrides: Partial<VNextFontRegistrySpikeInput> = {}): VNextFontRegistrySpikeInput {
  return {
    registryId: "thai-core-fonts-v1",
    policyRevision: "font-policy-v1",
    assets: [{
      fontId: "sarabun-regular",
      family: "Sarabun",
      style: "normal",
      weight: 400,
      format: "ttf",
      role: "primary-thai",
      availability: "available",
      source: {
        kind: "legacy-reference",
        reference: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
        canonical: false,
      },
      target: {
        kind: "workspace-public-font",
        path: "public/fonts/Sarabun/Sarabun-Regular.ttf",
      },
      license: {
        id: "OFL-1.1",
        verified: true,
        source: "OFL.txt",
      },
      hash: {
        algorithm: "sha256",
        value: "sarabun-regular-hash",
      },
      supportedScripts: ["Latin", "Thai"],
    }, {
      fontId: "sarabun-bold",
      family: "Sarabun",
      style: "normal",
      weight: 700,
      format: "ttf",
      role: "style-variant",
      availability: "available",
      source: {
        kind: "legacy-reference",
        reference: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Bold.ttf",
        canonical: false,
      },
      target: {
        kind: "workspace-public-font",
        path: "public/fonts/Sarabun/Sarabun-Bold.ttf",
      },
      license: {
        id: "OFL-1.1",
        verified: true,
      },
      hash: {
        algorithm: "sha256",
        value: "sarabun-bold-hash",
      },
      supportedScripts: ["Latin", "Thai"],
    }, {
      fontId: "noto-sans-thai-regular",
      family: "Noto Sans Thai",
      style: "normal",
      weight: 400,
      format: "ttf",
      role: "fallback-thai",
      availability: "available",
      source: {
        kind: "legacy-reference",
        reference: "FlowDocEditor/public/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
        canonical: false,
      },
      target: {
        kind: "workspace-public-font",
        path: "public/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
      },
      license: {
        id: "OFL-1.1",
        verified: true,
      },
      hash: {
        algorithm: "sha256",
        value: "noto-sans-thai-regular-hash",
      },
      supportedScripts: ["Thai"],
    }],
    styleMappings: [{
      styleKey: "paragraph",
      primaryFontId: "sarabun-regular",
      fallbackFontIds: ["noto-sans-thai-regular"],
      required: true,
    }, {
      styleKey: "heading-xl",
      primaryFontId: "sarabun-bold",
      fallbackFontIds: ["noto-sans-thai-regular"],
      required: true,
    }],
    ...overrides,
  }
}

describe("vNext font registry spike boundary", () => {
  it("registers Thai font facts for a later measurement engine spike without reading font files", () => {
    const plan = createVNextFontRegistrySpikePlan(fontRegistryInput())

    expect(plan).toMatchObject({
      source: VNEXT_FONT_REGISTRY_SPIKE_SOURCE,
      mode: VNEXT_FONT_REGISTRY_SPIKE_MODE,
      status: "ready-for-measurement-spike",
      summary: {
        assetCount: 3,
        availableAssetCount: 3,
        primaryThaiFontIds: ["sarabun-regular"],
        styleMappingCount: 2,
        requiredStyleMappingCount: 2,
      },
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
      blockingIssues: [],
    })
    expect(plan.warningIssues.map((issue) => issue.code)).toEqual([
      "legacy-source-reference",
      "legacy-source-reference",
      "legacy-source-reference",
    ])
    expect(plan.profileCandidate).toMatchObject({
      identityStatus: "stable",
      fontAssetIds: ["sarabun-regular", "sarabun-bold", "noto-sans-thai-regular"],
      fontAssetHashes: [
        "sha256-sarabun-regular-hash",
        "sha256-sarabun-bold-hash",
        "sha256-noto-sans-thai-regular-hash",
      ],
      styleKeys: ["paragraph", "heading-xl"],
    })
    expect(plan.measurementFontAssets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fontId: "sarabun-regular",
        family: "Sarabun",
        source: "future-registry",
        available: true,
        license: "OFL-1.1",
        hash: "sha256-sarabun-regular-hash",
      }),
    ]))
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("feeds registered font facts into the text measurement engine spike plan", () => {
    const fontPlan = createVNextFontRegistrySpikePlan(fontRegistryInput())
    const enginePlan = createVNextTextMeasurementEngineSpikePlan({
      spikeId: "thai-text-measurement-v1",
      policyRevision: "policy-v1",
      fontAssets: fontPlan.measurementFontAssets,
      shapers: [{
        shaperId: "rustybuzz-wasm",
        engine: "harfbuzz",
        role: "primary-candidate",
        availability: "available",
        revision: "rustybuzz-0.20.1",
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
        revision: "icu4x-2.2.0",
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
        lineBreakerId: "libthai-reference",
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

    expect(enginePlan.status).toBe("ready-for-spike")
    expect(enginePlan.profileCandidate.ingredients.fontAssetIds).toEqual([
      "sarabun-regular",
      "sarabun-bold",
      "noto-sans-thai-regular",
    ])
    expect(enginePlan.profileCandidate.profileId).toContain("shape-harfbuzz-rustybuzz-wasm-rustybuzz-0-20-1")
  })

  it("blocks available assets that still target legacy paths or lack license and hash facts", () => {
    const input = fontRegistryInput({
      assets: [{
        ...fontRegistryInput().assets[0],
        target: {
          kind: "workspace-public-font",
          path: "C:/Users/nekot/Documents/GitHub/FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
        },
        license: undefined,
        hash: undefined,
      }],
      styleMappings: [{
        styleKey: "paragraph",
        primaryFontId: "sarabun-regular",
        required: true,
      }],
    })
    const plan = createVNextFontRegistrySpikePlan(input)

    expect(plan.status).toBe("blocked")
    expect(plan.profileCandidate.identityStatus).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "legacy-path-as-target",
      "missing-font-license",
      "missing-font-hash",
    ])
  })

  it("blocks required style mappings that point at missing or unavailable fonts", () => {
    const input = fontRegistryInput({
      assets: [{
        ...fontRegistryInput().assets[0],
        availability: "planned",
      }],
      styleMappings: [{
        styleKey: "paragraph",
        primaryFontId: "sarabun-regular",
        fallbackFontIds: ["missing-font"],
        required: true,
      }],
    })
    const plan = createVNextFontRegistrySpikePlan(input)

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "missing-primary-thai-font",
      }),
      expect.objectContaining({
        code: "required-style-mapping-unavailable",
        targetId: "paragraph:sarabun-regular",
      }),
      expect.objectContaining({
        code: "style-mapping-missing-font",
        targetId: "paragraph:missing-font",
      }),
    ]))
  })

  it("keeps the font registry spike boundary independent from concrete font IO and layout", () => {
    const sourceUrl = new URL("../src/renderer/fontRegistrySpike.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("createVNextFontRegistrySpikePlan")
    expect(source).toContain("measurementFontAssets")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:fontkit|opentype\.js|ttf-parser|harfbuzzjs|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:fontkit|opentype\.js|ttf-parser|harfbuzzjs|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|officegen|pizzip|mammoth/)
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("writeFile")
    expect(source).not.toContain("createHash")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("measureVNextText")
  })

  it("documents the font registry spike boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/FONT_REGISTRY_SPIKE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 101 spike boundary.")
    expect(boundaryDoc).toContain("Sarabun")
    expect(boundaryDoc).toContain("Noto Sans Thai")
    expect(boundaryDoc).toContain("license")
    expect(boundaryDoc).toContain("hash")
    expect(readme).toContain("Font registry spike boundary")
    expect(readme).toContain("docs/FONT_REGISTRY_SPIKE_BOUNDARY.md")
    expect(ledger).toContain("| 101 | Font registry spike boundary | done |")
    expect(roadmap).toContain("## Phase 101: Font Registry Spike Boundary")
  })
})
