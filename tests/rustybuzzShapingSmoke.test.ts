import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextRustybuzzShapingSmokePlan,
  VNEXT_RUSTYBUZZ_SHAPING_SMOKE_MODE,
  VNEXT_RUSTYBUZZ_SHAPING_SMOKE_SOURCE,
  type VNextMeasurementProfileIdentityInput,
  type VNextRustybuzzShapingSmokeInput,
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
  }>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function readManifest(): FontAssetManifest {
  return readJson<FontAssetManifest>("assets/fonts/font-assets.v1.json")
}

function readCorpusSampleIds(): string[] {
  return readJson<ThaiCorpusFixture>("fixtures/thai-measurement-corpus.v1.json").samples.map((sample) => sample.sampleId)
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

function smokeInput(overrides: Partial<VNextRustybuzzShapingSmokeInput> = {}): VNextRustybuzzShapingSmokeInput {
  const manifest = readManifest()
  const profile = createVNextMeasurementProfileIdentityPlan(profileInput())
  const fixture = readSmokeFixture()

  return {
    ...fixture,
    measurementProfileId: profile.measurementProfileId,
    measurementProfileStatus: profile.status,
    availableFontAssetIds: manifest.fontAssets.map((asset) => asset.fontId),
    availableSampleIds: readCorpusSampleIds(),
    ...overrides,
  }
}

describe("vNext rustybuzz shaping smoke boundary", () => {
  it("validates shaping smoke cases against copied fonts, corpus samples, and profile identity", () => {
    const plan = createVNextRustybuzzShapingSmokePlan(smokeInput())

    expect(plan).toMatchObject({
      source: VNEXT_RUSTYBUZZ_SHAPING_SMOKE_SOURCE,
      mode: VNEXT_RUSTYBUZZ_SHAPING_SMOKE_MODE,
      status: "ready-for-shaping-smoke",
      smokeId: "rustybuzz-shaping-smoke-v1",
      policyRevision: "shaping-smoke-policy-v1",
      measurementProfileStatus: "stable",
      outputShapeVersion: "glyph-line-box-v1",
      adapterDecision: {
        decisionId: "rustybuzz-icu4x-adapter-v1",
        placement: "external-adapter-package",
        executesShapingInCore: false,
        readsFontFilesInCore: false,
        importsWasmInCore: false,
      },
      smokeContract: {
        usesMeasurementProfileIdentity: true,
        usesCopiedFontAssets: true,
        usesThaiCorpusSamples: true,
        adapterRequiredBeforeExecution: true,
        recordsActualGlyphFactsInThisPhase: false,
      },
      executionContract: {
        importsRustybuzz: false,
        importsWasm: false,
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
    expect(plan.coverage).toMatchObject({
      caseCount: 4,
      fontAssetIds: ["noto-sans-thai-regular", "sarabun-bold", "sarabun-regular"],
      sampleIds: ["mixed-report-title", "thai-combining-marks", "thai-currency-number", "thai-greeting-no-space"],
      styleKeys: ["heading-xl", "paragraph"],
      requiredFacts: {
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

  it("blocks production binding, unstable profile identity, and direct core execution", () => {
    const plan = createVNextRustybuzzShapingSmokePlan(smokeInput({
      bindProductionMeasurement: true,
      measurementProfileStatus: "blocked",
      adapterDecision: {
        decisionId: "bad-core-shaper",
        placement: "core-direct-dependency",
        executesShapingInCore: true,
        readsFontFilesInCore: true,
        importsWasmInCore: true,
      },
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "measurement-profile-not-stable" }),
      expect.objectContaining({ code: "adapter-placement-blocked", targetId: "bad-core-shaper" }),
      expect.objectContaining({ code: "core-executes-shaping", targetId: "bad-core-shaper" }),
      expect.objectContaining({ code: "core-reads-font-files", targetId: "bad-core-shaper" }),
      expect.objectContaining({ code: "core-imports-wasm", targetId: "bad-core-shaper" }),
    ]))
  })

  it("blocks unknown references and incomplete shaping fact requirements", () => {
    const fixture = smokeInput()
    const plan = createVNextRustybuzzShapingSmokePlan({
      ...fixture,
      cases: [{
        ...fixture.cases[0],
        caseId: "broken-smoke",
        sampleId: "unknown-sample",
        fontId: "unknown-font",
        outputShapeVersion: "glyph-line-box-v1",
        requiredFacts: ["glyph-id", "glyph-advance"],
        expectsClusterMapping: false,
        expectsAdvanceWidth: false,
        expectsGlyphOffsets: false,
      }],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "unknown-font-asset", targetId: "unknown-font" }),
      expect.objectContaining({ code: "unknown-corpus-sample", targetId: "unknown-sample" }),
      expect.objectContaining({ code: "missing-offset-fact", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "missing-cluster-map-fact", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "missing-text-range-fact", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "missing-line-box-fact", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "cluster-mapping-not-expected", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "advance-width-not-expected", targetId: "broken-smoke" }),
      expect.objectContaining({ code: "glyph-offsets-not-expected", targetId: "broken-smoke" }),
    ]))
  })

  it("blocks duplicate smoke case ids", () => {
    const fixture = smokeInput()
    const plan = createVNextRustybuzzShapingSmokePlan({
      ...fixture,
      cases: [fixture.cases[0], fixture.cases[0]],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "duplicate-case-id",
        targetId: "shape-thai-greeting-sarabun-regular",
      }),
    ]))
  })

  it("keeps the shaping smoke boundary independent from engine execution", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/rustybuzzShapingSmoke.ts"), "utf8")

    expect(source).toContain("createVNextRustybuzzShapingSmokePlan")
    expect(source).toContain("rustybuzz")
    expect(source).toContain("glyph-line-box-v1")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("shapeText")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the rustybuzz shaping smoke boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/RUSTYBUZZ_SHAPING_SMOKE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 107 shaping smoke boundary.")
    expect(boundaryDoc).toContain("fixtures/rustybuzz-shaping-smoke.v1.json")
    expect(boundaryDoc).toContain("glyph ids")
    expect(boundaryDoc).toContain("cluster maps")
    expect(readme).toContain("Rustybuzz shaping smoke boundary")
    expect(readme).toContain("docs/RUSTYBUZZ_SHAPING_SMOKE_BOUNDARY.md")
    expect(ledger).toContain("| 107 | Rustybuzz shaping smoke boundary | done |")
    expect(roadmap).toContain("## Phase 107: Rustybuzz Shaping Smoke Boundary")
  })
})
