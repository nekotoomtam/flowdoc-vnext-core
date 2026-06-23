import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextTextMeasurementEngineSpikePlan,
  VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE,
  VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE,
  type VNextTextMeasurementEngineSpikeInput,
} from "../src/index.js"

function readySpikeInput(overrides: Partial<VNextTextMeasurementEngineSpikeInput> = {}): VNextTextMeasurementEngineSpikeInput {
  return {
    spikeId: "thai-text-measurement-v1",
    policyRevision: "policy-v1",
    fontAssets: [{
      fontId: "sarabun-regular",
      family: "Sarabun",
      style: "normal",
      weight: 400,
      format: "ttf",
      source: "workspace",
      available: true,
      license: "OFL-1.1",
      hash: "sha256-sarabun-regular",
    }, {
      fontId: "noto-sans-thai-regular",
      family: "Noto Sans Thai",
      style: "normal",
      weight: 400,
      format: "ttf",
      source: "workspace",
      available: true,
      license: "OFL-1.1",
      hash: "sha256-noto-sans-thai-regular",
    }],
    shapers: [{
      shaperId: "harfbuzzjs-wasm",
      engine: "harfbuzz",
      role: "primary-candidate",
      availability: "available",
      revision: "hbjs-0.10.1",
      deterministic: true,
      supportsGlyphAdvances: true,
      supportsGlyphClusters: true,
      supportsComplexText: true,
      packageBoundary: "external-adapter",
      notes: ["shape runs before line width accumulation"],
    }],
    lineBreakers: [{
      lineBreakerId: "icu4x-segmenter",
      engine: "icu4x",
      role: "primary-candidate",
      availability: "available",
      revision: "icu4x-2",
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
    ...overrides,
  }
}

describe("vNext text measurement engine spike boundary", () => {
  it("plans a HarfBuzz plus ICU4X measurement spike without binding production pagination", () => {
    const plan = createVNextTextMeasurementEngineSpikePlan(readySpikeInput())

    expect(plan).toMatchObject({
      source: VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE,
      mode: VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE,
      status: "ready-for-spike",
      summary: {
        fontAssetCount: 2,
        availableFontAssetCount: 2,
        primaryShaperId: "harfbuzzjs-wasm",
        primaryLineBreakerId: "icu4x-segmenter",
        comparisonLineBreakerIds: ["intl-segmenter"],
        thaiOracleIds: ["libthai-reference"],
      },
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
      blockingIssues: [],
    })
    expect(plan.profileCandidate).toMatchObject({
      identityStatus: "stable",
      ingredients: {
        policyRevision: "policy-v1",
        fontAssetIds: ["sarabun-regular", "noto-sans-thai-regular"],
        fontAssetHashes: ["sha256-sarabun-regular", "sha256-noto-sans-thai-regular"],
        shaper: {
          shaperId: "harfbuzzjs-wasm",
          engine: "harfbuzz",
          revision: "hbjs-0.10.1",
        },
        lineBreaker: {
          lineBreakerId: "icu4x-segmenter",
          engine: "icu4x",
          revision: "icu4x-2",
        },
      },
    })
    expect(plan.profileCandidate.profileId).toContain("shape-harfbuzz-harfbuzzjs-wasm-hbjs-0-10-1")
    expect(plan.profileCandidate.profileId).toContain("break-icu4x-icu4x-segmenter-icu4x-2")
    expect(plan.decisionMatrix).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: "line-breaker:intl-segmenter",
        role: "comparison-baseline",
        status: "watch",
        reasons: expect.arrayContaining(["runtime dependent"]),
      }),
      expect.objectContaining({
        target: "line-breaker:libthai-reference",
        role: "thai-oracle",
        status: "watch",
      }),
    ]))
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks runtime-dependent Intl.Segmenter as the primary line-break truth", () => {
    const base = readySpikeInput()
    const plan = createVNextTextMeasurementEngineSpikePlan({
      ...base,
      lineBreakers: base.lineBreakers.map((candidate) => {
        if (candidate.lineBreakerId === "icu4x-segmenter") {
          return { ...candidate, role: "comparison-baseline" }
        }
        if (candidate.lineBreakerId === "intl-segmenter") {
          return { ...candidate, role: "primary-candidate" }
        }
        return candidate
      }),
    })

    expect(plan.status).toBe("blocked")
    expect(plan.profileCandidate.identityStatus).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "nondeterministic-primary-line-breaker",
      "primary-line-breaker-runtime-dependent",
    ])
    expect(plan.blockingIssues.every((issue) => issue.targetId === "intl-segmenter")).toBe(true)
  })

  it("keeps the spike from replacing production pagination measurement", () => {
    const plan = createVNextTextMeasurementEngineSpikePlan(readySpikeInput({
      bindProductionPagination: true,
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual([expect.objectContaining({
      code: "production-pagination-binding",
      severity: "blocking",
    })])
    expect(plan.executionContract.replacesPaginationMeasurer).toBe(false)
  })

  it("requires available font assets and marks unhashed fonts as spike-only identity", () => {
    const missingFonts = createVNextTextMeasurementEngineSpikePlan(readySpikeInput({
      fontAssets: [],
    }))
    const unhashed = createVNextTextMeasurementEngineSpikePlan(readySpikeInput({
      fontAssets: [{
        fontId: "sarabun-regular",
        family: "Sarabun",
        style: "normal",
        weight: 400,
        format: "ttf",
        source: "external-reference",
        available: true,
        license: "OFL-1.1",
      }],
    }))

    expect(missingFonts.status).toBe("blocked")
    expect(missingFonts.blockingIssues).toEqual([expect.objectContaining({
      code: "missing-font-assets",
    })])
    expect(unhashed.status).toBe("ready-for-spike")
    expect(unhashed.profileCandidate.identityStatus).toBe("spike-only")
    expect(unhashed.warningIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "font-asset-missing-hash",
        targetId: "sarabun-regular",
      }),
    ]))
  })

  it("keeps the engine spike boundary independent from concrete engines, files, renderers, and layout", () => {
    const sourceUrl = new URL("../src/renderer/textMeasurementEngineSpike.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("createVNextTextMeasurementEngineSpikePlan")
    expect(source).toContain("harfbuzz")
    expect(source).toContain("intl-segmenter")
    expect(source).toContain("icu4x")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:harfbuzzjs|icu_segmenter|libthai|pythainlp|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:harfbuzzjs|icu_segmenter|libthai|pythainlp|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|officegen|pizzip|mammoth/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("measureVNextText")
  })

  it("documents the engine spike boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/TEXT_MEASUREMENT_ENGINE_SPIKE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 100 spike boundary.")
    expect(boundaryDoc).toContain("HarfBuzz")
    expect(boundaryDoc).toContain("ICU4X")
    expect(boundaryDoc).toContain("Intl.Segmenter")
    expect(boundaryDoc).toContain("Thai oracle")
    expect(readme).toContain("Text measurement engine spike boundary")
    expect(readme).toContain("docs/TEXT_MEASUREMENT_ENGINE_SPIKE_BOUNDARY.md")
    expect(ledger).toContain("| 100 | Text measurement engine spike boundary | done |")
    expect(roadmap).toContain("## Phase 100: Text Measurement Engine Spike Boundary")
  })
})
