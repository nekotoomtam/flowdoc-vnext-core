import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextTextEngineAdapterSpiPlan,
  createVNextTextEngineEvidenceAcceptancePlan,
  createVNextTextEngineMeasurementDraftHandoffPlan,
  type VNextMeasurementProfileIdentityInput,
  type VNextRustybuzzShapingSmokeInput,
  type VNextTextEngineAdapterSpiInput,
} from "../src/index.js"
import {
  createFlowDocTextEngineRustWasmMockAdapterPlan,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_MODE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_SOURCE,
} from "../packages/text-engine-rust-wasm/src/index.js"

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

function spiInput(): VNextTextEngineAdapterSpiInput {
  const manifest = readManifest()
  const profile = createVNextMeasurementProfileIdentityPlan(profileInput())
  const smokeFixture = readSmokeFixture()

  return {
    spiId: "text-engine-adapter-spi-v1",
    policyRevision: "text-engine-adapter-spi-policy-v1",
    adapterPackageName: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
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
  }
}

describe("vNext text engine adapter package scaffold", () => {
  it("runs Phase 108 requests through the external mock adapter and back into acceptance plus handoff", () => {
    const spiPlan = createVNextTextEngineAdapterSpiPlan(spiInput())
    const adapterPlan = createFlowDocTextEngineRustWasmMockAdapterPlan({
      adapterPackageName: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
      engine: {
        shaper: "rustybuzz",
        shaperRevision: "rustybuzz-planned",
        segmenter: "icu4x",
        segmenterRevision: "icu4x-planned",
        segmenterDataRevision: "icu4x-data-planned",
        deterministic: true,
      },
      requests: spiPlan.requests,
    })
    const request = spiPlan.requests[0]
    const evidence = adapterPlan.evidence[0]
    const acceptance = createVNextTextEngineEvidenceAcceptancePlan({
      acceptanceId: "phase-112-mock-evidence-acceptance",
      policyRevision: "phase-112-mock-evidence-policy",
      request,
      evidence,
      expectedEngine: evidence.engine,
      acceptancePolicy: {
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        coreExecutesEngine: false,
        mutatesPaginationDraft: false,
      },
    })
    const handoff = createVNextTextEngineMeasurementDraftHandoffPlan({
      handoffId: "phase-112-mock-evidence-handoff",
      policyRevision: "phase-112-mock-handoff-policy",
      request,
      acceptance,
      handoffPolicy: {
        consumesAcceptedEvidenceOnly: true,
        coreExecutesEngine: false,
        mutatesEvidence: false,
        attachesGlyphFactsToDraft: false,
        replacesPaginationMeasurer: false,
      },
    })

    expect(adapterPlan).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_MODE,
      status: "ready",
      adapterPackageName: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
      corePackageName: "@flowdoc/vnext-core",
      adapterContract: {
        consumes: "vnext-text-engine-adapter-request",
        produces: "vnext-text-engine-adapter-evidence",
        implementation: "mock-evidence-only",
        importsCoreAsPublicPackage: true,
        coreImportsAdapterBack: false,
        productionMeasurementReady: false,
      },
      executionContract: {
        importsRustybuzz: false,
        importsHarfbuzz: false,
        importsIcu4x: false,
        importsWasm: false,
        readsFontFiles: false,
        executesRealShaping: false,
        executesRealSegmentation: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
    })
    expect(adapterPlan.warningIssues).toEqual([expect.objectContaining({
      code: "missing-wasm-digest",
      severity: "warning",
    })])
    expect(adapterPlan.evidence).toHaveLength(spiPlan.requests.length)
    expect(evidence).toMatchObject({
      requestId: request.requestId,
      measurementProfileId: request.measurementProfileId,
      outputShapeVersion: "glyph-line-box-v1",
      totalAdvancePt: request.text.length * 6,
      lineHeightPt: 14,
    })
    expect(evidence.glyphs).toHaveLength(request.text.length)
    expect(evidence.lineBoxes.length).toBeGreaterThan(0)
    expect(acceptance.status).toBe("accepted")
    expect(handoff.status).toBe("ready")
    expect(handoff.draft?.lines.join("")).toBe(request.text)
    expect(handoff.draft).not.toHaveProperty("glyphs")
  })

  it("blocks production binding and invalid mock adapter inputs", () => {
    const request = createVNextTextEngineAdapterSpiPlan(spiInput()).requests[0]
    const adapterPlan = createFlowDocTextEngineRustWasmMockAdapterPlan({
      adapterPackageName: "wrong-package",
      bindProductionMeasurement: true,
      engine: {
        shaper: "rustybuzz",
        shaperRevision: "",
        segmenter: "icu4x",
        segmenterRevision: "",
        segmenterDataRevision: "",
        deterministic: false,
      },
      requests: [{
        ...request,
        requestId: "",
        text: "",
        measurementProfileId: "",
      }],
    })

    expect(adapterPlan.status).toBe("blocked")
    expect(adapterPlan.evidence).toEqual([])
    expect(adapterPlan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "unexpected-adapter-package-name", targetId: "wrong-package" }),
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "missing-shaper-revision", targetId: "rustybuzz" }),
      expect.objectContaining({ code: "missing-segmenter-revision", targetId: "icu4x" }),
      expect.objectContaining({ code: "missing-segmenter-data-revision", targetId: "icu4x" }),
      expect.objectContaining({ code: "nondeterministic-engine" }),
      expect.objectContaining({ code: "missing-request-id" }),
      expect.objectContaining({ code: "missing-request-text" }),
      expect.objectContaining({ code: "missing-measurement-profile-id" }),
    ]))
  })

  it("keeps the external adapter package separate from core source", () => {
    const adapterSource = readFileSync(resolve(process.cwd(), "packages/text-engine-rust-wasm/src/index.ts"), "utf8")
    const coreIndex = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8")
    const packageJson = readJson<{ name: string; dependencies: Record<string, string> }>("packages/text-engine-rust-wasm/package.json")

    expect(packageJson.name).toBe(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(packageJson.dependencies["@flowdoc/vnext-core"]).toBe("file:../..")
    expect(adapterSource).toContain('from "@flowdoc/vnext-core"')
    expect(adapterSource).toContain("import type")
    expect(adapterSource).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
    expect(adapterSource).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(adapterSource).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(adapterSource).not.toContain("WebAssembly")
    expect(adapterSource).not.toContain("readFile")
    expect(adapterSource).not.toContain("shapeText")
    expect(adapterSource).not.toContain("new Intl.Segmenter")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
  })

  it("documents the external adapter package scaffold in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/TEXT_ENGINE_ADAPTER_PACKAGE_SCAFFOLD.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const packageReadme = readText("packages/text-engine-rust-wasm/README.md")

    expect(boundaryDoc).toContain("Status: Phase 112 package scaffold.")
    expect(boundaryDoc).toContain("packages/text-engine-rust-wasm")
    expect(boundaryDoc).toContain("mock evidence")
    expect(packageReadme).toContain("Status: Numeric drift threshold policy package.")
    expect(packageReadme).toContain("TypeScript mapper")
    expect(packageReadme).toContain("production measurement binding blocked")
    expect(readme).toContain("Text engine adapter package scaffold")
    expect(readme).toContain("docs/TEXT_ENGINE_ADAPTER_PACKAGE_SCAFFOLD.md")
    expect(ledger).toContain("| 112 | Text engine adapter package scaffold | done |")
    expect(roadmap).toContain("## Phase 112: Text Engine Adapter Package Scaffold")
  })
})
