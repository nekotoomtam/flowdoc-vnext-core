import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextTextEngineEvidenceAcceptancePlan,
  type VNextTextEngineAdapterEngineRef,
  type VNextTextEngineAdapterRequiredFact,
} from "../src/index.js"
import {
  createFlowDocRustybuzzSmokeCorpusMappingPlan,
  FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_MODE,
  FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_SOURCE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
  type FlowDocRustybuzzRawSmokeOutput,
  type FlowDocRustybuzzSmokeCorpusCaseInput,
  type FlowDocRustybuzzSmokeCorpusRawOutputInput,
  type FlowDocRustybuzzSmokeCorpusSampleInput,
} from "../packages/text-engine-rust-wasm/src/index.js"

interface SmokeFixture {
  smokeId: string
  policyRevision: string
  measurementProfileId: string
  outputShapeVersion: "glyph-line-box-v1"
  cases: FlowDocRustybuzzSmokeCorpusCaseInput[]
}

interface ThaiCorpusFixture {
  samples: FlowDocRustybuzzSmokeCorpusSampleInput[]
}

interface RawCorpusFixtureManifest {
  manifestVersion: number
  policyRevision: string
  sourceSmokeId: string
  rawOutputShape: "rustybuzz-native-smoke-json"
  fixtures: Array<{
    caseId: string
    sampleId: string
    fontId: string
    path: string
  }>
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

function readSmokeFixture(): SmokeFixture {
  return readJson<SmokeFixture>("fixtures/rustybuzz-shaping-smoke.v1.json")
}

function readThaiCorpus(): ThaiCorpusFixture {
  return readJson<ThaiCorpusFixture>("fixtures/thai-measurement-corpus.v1.json")
}

function readRawCorpusManifest(): RawCorpusFixtureManifest {
  return readJson<RawCorpusFixtureManifest>("packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.corpus.v1.json")
}

function readRawOutputs(manifest: RawCorpusFixtureManifest): FlowDocRustybuzzSmokeCorpusRawOutputInput[] {
  return manifest.fixtures.map((fixture) => ({
    caseId: fixture.caseId,
    rawOutput: readJson<FlowDocRustybuzzRawSmokeOutput>(fixture.path),
  }))
}

function engine(): VNextTextEngineAdapterEngineRef {
  return {
    shaper: "rustybuzz",
    shaperRevision: "rustybuzz-0.20.1",
    segmenter: "icu4x",
    segmenterRevision: "icu4x-planned",
    segmenterDataRevision: "icu4x-data-planned",
    deterministic: true,
  }
}

describe("vNext text engine rustybuzz smoke corpus boundary", () => {
  it("maps every Phase 107 smoke case and passes evidence acceptance for each", () => {
    const smokeFixture = readSmokeFixture()
    const thaiCorpus = readThaiCorpus()
    const rawManifest = readRawCorpusManifest()
    const rawOutputs = readRawOutputs(rawManifest)
    const plan = createFlowDocRustybuzzSmokeCorpusMappingPlan({
      corpusId: "phase-115-rustybuzz-native-smoke-corpus",
      policyRevision: rawManifest.policyRevision,
      measurementProfileId: smokeFixture.measurementProfileId,
      cases: smokeFixture.cases,
      samples: thaiCorpus.samples,
      rawOutputs,
      engine: engine(),
      requestDefaults: {
        availableWidthPt: 240,
      },
      fontSizePt: 12,
      lineHeightPt: 14.4,
    })

    expect(rawManifest).toMatchObject({
      manifestVersion: 1,
      sourceSmokeId: smokeFixture.smokeId,
      rawOutputShape: "rustybuzz-native-smoke-json",
    })
    expect(plan).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_MODE,
      status: "ready",
      corpusId: "phase-115-rustybuzz-native-smoke-corpus",
      policyRevision: "rustybuzz-native-smoke-corpus-policy-v1",
      measurementProfileId: smokeFixture.measurementProfileId,
      corpusContract: {
        consumes: "phase-107-smoke-cases-plus-raw-rustybuzz-fixtures",
        produces: "mapped-adapter-evidence-per-smoke-case",
        mappingBoundary: "phase-114-raw-cluster-mapping",
        requiresEverySmokeCaseFixture: true,
        productionMeasurementReady: false,
      },
      coverage: {
        caseCount: 4,
        mappedCaseCount: 4,
        rawOutputCount: 4,
        glyphCount: 68,
        zeroAdvanceGlyphCount: 6,
        repeatedClusterCaseCount: 2,
        fontIds: ["noto-sans-thai-regular", "sarabun-bold", "sarabun-regular"],
        sampleIds: [
          "mixed-report-title",
          "thai-combining-marks",
          "thai-currency-number",
          "thai-greeting-no-space",
        ],
        styleKeys: ["heading-xl", "paragraph"],
      },
      blockingIssues: [],
    })
    expect(plan.warningIssues).toHaveLength(4)
    expect(plan.warningIssues.every((warning) => warning.code === "missing-wasm-digest")).toBe(true)

    const glyphCountByCase = Object.fromEntries(plan.caseMappings.map((caseMapping) => [
      caseMapping.caseId,
      caseMapping.mapping.summary.glyphCount,
    ]))
    expect(glyphCountByCase).toEqual({
      "shape-thai-greeting-sarabun-regular": 13,
      "shape-thai-combining-sarabun-regular": 18,
      "shape-mixed-heading-sarabun-bold": 20,
      "shape-thai-currency-noto-fallback": 17,
    })

    plan.caseMappings.forEach((caseMapping) => {
      expect(caseMapping.mapping.status).toBe("ready")
      expect(caseMapping.mapping.evidence).not.toBeNull()

      const acceptance = createVNextTextEngineEvidenceAcceptancePlan({
        acceptanceId: `phase-115-acceptance:${caseMapping.caseId}`,
        policyRevision: "phase-115-rustybuzz-smoke-corpus-acceptance",
        request: caseMapping.request,
        evidence: caseMapping.mapping.evidence!,
        expectedEngine: engine(),
        acceptancePolicy: {
          evidenceLane: "glyph-facts-separate-from-pagination-draft",
          coreExecutesEngine: false,
          mutatesPaginationDraft: false,
        },
      })

      expect(acceptance.status).toBe("accepted")
      expect(acceptance.acceptedEvidence).toEqual(caseMapping.mapping.evidence)
    })
  })

  it("blocks partial or duplicate raw smoke corpus coverage", () => {
    const smokeFixture = readSmokeFixture()
    const thaiCorpus = readThaiCorpus()
    const rawManifest = readRawCorpusManifest()
    const rawOutputs = readRawOutputs(rawManifest)
    const plan = createFlowDocRustybuzzSmokeCorpusMappingPlan({
      corpusId: "",
      policyRevision: "",
      measurementProfileId: "",
      cases: smokeFixture.cases,
      samples: thaiCorpus.samples,
      rawOutputs: [rawOutputs[0], rawOutputs[0]],
      engine: engine(),
      requestDefaults: {
        availableWidthPt: 240,
      },
      bindProductionMeasurement: true,
    })

    expect(plan.status).toBe("blocked")
    expect(plan.coverage).toMatchObject({
      caseCount: 4,
      mappedCaseCount: 0,
      rawOutputCount: 2,
    })
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-corpus-id" }),
      expect.objectContaining({ code: "missing-policy-revision" }),
      expect.objectContaining({ code: "missing-measurement-profile-id" }),
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "duplicate-raw-output", targetId: "shape-thai-greeting-sarabun-regular" }),
      expect.objectContaining({ code: "missing-raw-output", targetId: "shape-thai-combining-sarabun-regular" }),
      expect.objectContaining({ code: "missing-raw-output", targetId: "shape-mixed-heading-sarabun-bold" }),
      expect.objectContaining({ code: "missing-raw-output", targetId: "shape-thai-currency-noto-fallback" }),
      expect.objectContaining({ code: "mapping-blocked", targetId: "shape-thai-greeting-sarabun-regular" }),
    ]))
  })

  it("keeps the corpus harness package-local and out of core runtime imports", () => {
    const corpusSource = readText("packages/text-engine-rust-wasm/src/rustybuzzSmokeCorpus.ts")
    const packageIndex = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")

    expect(packageIndex).toContain('export * from "./rustybuzzSmokeCorpus.js"')
    expect(corpusSource).toContain('from "@flowdoc/vnext-core"')
    expect(corpusSource).toContain("import type")
    expect(corpusSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(corpusSource).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(corpusSource).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(corpusSource).not.toContain("WebAssembly")
    expect(corpusSource).not.toContain("paginateVNextDocument")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS")
  })

  it("documents Phase 115 and the remaining WASM and line break gaps", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md")
    const packageReadme = readText("packages/text-engine-rust-wasm/README.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 115 rustybuzz smoke corpus boundary.")
    expect(boundaryDoc).toContain("Phase 107 rustybuzz smoke case")
    expect(boundaryDoc).toContain("WASM parity")
    expect(boundaryDoc).toContain("ICU4X line break")
    expect(packageReadme).toContain("Status: WASM toolchain Rust upgrade execution package.")
    expect(readme).toContain("Text engine rustybuzz smoke corpus boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md")
    expect(ledger).toContain("| 115 | Text engine rustybuzz smoke corpus boundary | done |")
    expect(roadmap).toContain("## Phase 115: Text Engine Rustybuzz Smoke Corpus Boundary")
  })
})
