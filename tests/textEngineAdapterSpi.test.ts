import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextTextEngineAdapterSpiPlan,
  VNEXT_TEXT_ENGINE_ADAPTER_SPI_MODE,
  VNEXT_TEXT_ENGINE_ADAPTER_SPI_SOURCE,
  type VNextMeasurementProfileIdentityInput,
  type VNextRustybuzzShapingSmokeInput,
  type VNextTextEngineAdapterSpiInput,
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

interface ThaiCorpusFixture {
  samples: Array<{
    sampleId: string
    text: string
    locale: "th"
  }>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function readManifest(): FontAssetManifest {
  return readJson<FontAssetManifest>("assets/fonts/font-assets.v1.json")
}

function readCorpus(): ThaiCorpusFixture {
  return readJson<ThaiCorpusFixture>("fixtures/thai-measurement-corpus.v1.json")
}

function readSmokeFixture(): VNextRustybuzzShapingSmokeInput {
  return readJson<VNextRustybuzzShapingSmokeInput>("fixtures/rustybuzz-shaping-smoke.v1.json")
}

function profileInput(): VNextMeasurementProfileIdentityInput {
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
  }
}

function spiInput(overrides: Partial<VNextTextEngineAdapterSpiInput> = {}): VNextTextEngineAdapterSpiInput {
  const manifest = readManifest()
  const profile = createVNextMeasurementProfileIdentityPlan(profileInput())
  const smokeFixture = readSmokeFixture()

  return {
    spiId: "text-engine-adapter-spi-v1",
    policyRevision: "text-engine-adapter-spi-policy-v1",
    adapterPackageName: "@flowdoc/text-engine-rust-wasm",
    placement: "external-adapter-package",
    measurementProfileId: profile.measurementProfileId,
    measurementProfileStatus: profile.status,
    outputShapeVersion: "glyph-line-box-v1",
    runtimeTargets: ["node", "browser", "worker"],
    availableFontAssetIds: manifest.fontAssets.map((asset) => asset.fontId),
    samples: readCorpus().samples,
    smokeCases: smokeFixture.cases,
    requestDefaults: {
      availableWidthPt: 240,
    },
    engine: {
      shaper: "rustybuzz",
      shaperRevision: "rustybuzz-planned",
      segmenter: "icu4x",
      segmenterRevision: "icu4x-planned",
      segmenterDataRevision: "icu4x-data-planned",
      deterministic: true,
    },
    executionPolicy: {
      coreImportsEngine: false,
      coreImportsWasm: false,
      coreReadsFontFiles: false,
      coreExecutesShaping: false,
      coreExecutesSegmentation: false,
      adapterOwnsShaping: true,
      adapterReturnsGlyphFacts: true,
      adapterReturnsLineBoxes: true,
      adapterCanDeriveMeasurementDraft: true,
    },
    ...overrides,
  }
}

describe("vNext text engine adapter SPI boundary", () => {
  it("maps Phase 107 shaping smoke cases into adapter requests without executing an engine", () => {
    const plan = createVNextTextEngineAdapterSpiPlan(spiInput())

    expect(plan).toMatchObject({
      source: VNEXT_TEXT_ENGINE_ADAPTER_SPI_SOURCE,
      mode: VNEXT_TEXT_ENGINE_ADAPTER_SPI_MODE,
      status: "ready-for-adapter-implementation",
      spiId: "text-engine-adapter-spi-v1",
      policyRevision: "text-engine-adapter-spi-policy-v1",
      adapterPackageName: "@flowdoc/text-engine-rust-wasm",
      placement: "external-adapter-package",
      outputShapeVersion: "glyph-line-box-v1",
      runtimeTargets: ["node", "browser", "worker"],
      engine: {
        shaper: "rustybuzz",
        shaperRevision: "rustybuzz-planned",
        segmenter: "icu4x",
        segmenterRevision: "icu4x-planned",
        segmenterDataRevision: "icu4x-data-planned",
        deterministic: true,
        wasmDigest: null,
      },
      adapterContract: {
        consumes: "vnext-text-engine-adapter-request",
        produces: "vnext-text-engine-adapter-evidence",
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        measurementDraftHandoff: "derive-line-draft-from-accepted-evidence",
        mutatesVNextTextMeasurementDraft: false,
        coreConsumesGlyphFactsDirectly: false,
      },
      evidenceContract: {
        resultMustReferenceRequestId: true,
        glyphFactsRequired: true,
        lineBoxFactsRequired: true,
        clusterMapRequired: true,
        units: "pt",
      },
      executionContract: {
        importsEngine: false,
        importsWasm: false,
        readsFontFiles: false,
        executesShaping: false,
        executesSegmentation: false,
        mutatesPaginationDraft: false,
        replacesPaginationMeasurer: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
    })
    expect(plan.warningIssues).toEqual([expect.objectContaining({
      code: "missing-wasm-digest",
      severity: "warning",
    })])
    expect(plan.measurementProfileId).toContain("measurement-profile-v1:thai-rustybuzz-icu4x-v1")
    expect(plan.requests[0]).toMatchObject({
      requestId: "text-engine-request:shape-thai-greeting-sarabun-regular:thai-greeting-no-space:sarabun-regular:paragraph",
      smokeCaseId: "shape-thai-greeting-sarabun-regular",
      sampleId: "thai-greeting-no-space",
      text: "สวัสดีครับตูม",
      locale: "th",
      fontId: "sarabun-regular",
      styleKey: "paragraph",
      availableWidthPt: 240,
      outputShapeVersion: "glyph-line-box-v1",
      requestedFacts: ["glyph-id", "glyph-advance", "glyph-offset", "cluster-map", "text-range", "line-box"],
    })
    expect(plan.coverage).toMatchObject({
      requestCount: 4,
      fontAssetIds: ["noto-sans-thai-regular", "sarabun-bold", "sarabun-regular"],
      sampleIds: ["mixed-report-title", "thai-combining-marks", "thai-currency-number", "thai-greeting-no-space"],
      styleKeys: ["heading-xl", "paragraph"],
      requestedFacts: {
        "glyph-id": 4,
        "glyph-advance": 4,
        "glyph-offset": 4,
        "cluster-map": 4,
        "text-range": 4,
        "line-box": 4,
      },
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks production binding and any core-owned engine execution", () => {
    const plan = createVNextTextEngineAdapterSpiPlan(spiInput({
      bindProductionMeasurement: true,
      placement: "core-direct-dependency",
      measurementProfileStatus: "blocked",
      executionPolicy: {
        coreImportsEngine: true,
        coreImportsWasm: true,
        coreReadsFontFiles: true,
        coreExecutesShaping: true,
        coreExecutesSegmentation: true,
        adapterOwnsShaping: false,
        adapterReturnsGlyphFacts: false,
        adapterReturnsLineBoxes: false,
        adapterCanDeriveMeasurementDraft: false,
      },
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "measurement-profile-not-stable" }),
      expect.objectContaining({ code: "adapter-placement-blocked" }),
      expect.objectContaining({ code: "core-imports-engine" }),
      expect.objectContaining({ code: "core-imports-wasm" }),
      expect.objectContaining({ code: "core-reads-font-files" }),
      expect.objectContaining({ code: "core-executes-shaping" }),
      expect.objectContaining({ code: "core-executes-segmentation" }),
      expect.objectContaining({ code: "adapter-does-not-own-shaping" }),
      expect.objectContaining({ code: "adapter-does-not-return-glyph-facts" }),
      expect.objectContaining({ code: "adapter-does-not-return-line-boxes" }),
      expect.objectContaining({ code: "adapter-cannot-derive-measurement-draft" }),
    ]))
  })

  it("blocks unknown references, missing facts, bad width, and nondeterministic engine output", () => {
    const base = spiInput()
    const plan = createVNextTextEngineAdapterSpiPlan({
      ...base,
      requestDefaults: {
        availableWidthPt: 0,
      },
      engine: {
        ...base.engine,
        shaperRevision: "",
        segmenterRevision: "",
        segmenterDataRevision: "",
        deterministic: false,
      },
      smokeCases: [{
        ...base.smokeCases[0],
        caseId: "broken-adapter-request",
        sampleId: "unknown-sample",
        fontId: "unknown-font",
        requiredFacts: ["glyph-id", "glyph-advance"],
      }],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-request-width" }),
      expect.objectContaining({ code: "missing-shaper-revision", targetId: "rustybuzz" }),
      expect.objectContaining({ code: "missing-segmenter-revision", targetId: "icu4x" }),
      expect.objectContaining({ code: "missing-segmenter-data-revision", targetId: "icu4x" }),
      expect.objectContaining({ code: "nondeterministic-engine" }),
      expect.objectContaining({ code: "unknown-font-asset", targetId: "unknown-font" }),
      expect.objectContaining({ code: "unknown-corpus-sample", targetId: "unknown-sample" }),
      expect.objectContaining({ code: "missing-offset-fact", targetId: "broken-adapter-request" }),
      expect.objectContaining({ code: "missing-cluster-map-fact", targetId: "broken-adapter-request" }),
      expect.objectContaining({ code: "missing-text-range-fact", targetId: "broken-adapter-request" }),
      expect.objectContaining({ code: "missing-line-box-fact", targetId: "broken-adapter-request" }),
    ]))
  })

  it("keeps text engine SPI evidence separate from the pagination measurement draft", () => {
    const plan = createVNextTextEngineAdapterSpiPlan(spiInput())

    expect(plan.adapterContract.evidenceLane).toBe("glyph-facts-separate-from-pagination-draft")
    expect(plan.adapterContract.measurementDraftHandoff).toBe("derive-line-draft-from-accepted-evidence")
    expect(plan.adapterContract.mutatesVNextTextMeasurementDraft).toBe(false)
    expect(plan.executionContract.mutatesPaginationDraft).toBe(false)
  })

  it("keeps the text engine SPI boundary independent from concrete engine execution", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/textEngineAdapterSpi.ts"), "utf8")

    expect(source).toContain("createVNextTextEngineAdapterSpiPlan")
    expect(source).toContain("glyph-facts-separate-from-pagination-draft")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("shapeText")
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toMatch(/from\s+["']\.\.\/pagination\/textMeasurement\.js["']/)
  })

  it("documents the text engine adapter SPI boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/TEXT_ENGINE_ADAPTER_SPI_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 108 adapter SPI boundary.")
    expect(boundaryDoc).toContain("glyph-facts-separate-from-pagination-draft")
    expect(boundaryDoc).toContain("src/renderer/textEngineAdapterSpi.ts")
    expect(readme).toContain("Text engine adapter SPI boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_ADAPTER_SPI_BOUNDARY.md")
    expect(ledger).toContain("| 108 | Text engine adapter SPI boundary | done |")
    expect(roadmap).toContain("## Phase 108: Text Engine Adapter SPI Boundary")
  })
})
