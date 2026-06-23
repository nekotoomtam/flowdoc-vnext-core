import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextThaiCorpusPlan,
  VNEXT_THAI_CORPUS_MODE,
  VNEXT_THAI_CORPUS_SOURCE,
  type VNextThaiCorpusInput,
} from "../src/index.js"

function readCorpus(): VNextThaiCorpusInput {
  return JSON.parse(readFileSync(resolve(process.cwd(), "fixtures/thai-measurement-corpus.v1.json"), "utf8")) as VNextThaiCorpusInput
}

describe("vNext Thai corpus and oracle boundary", () => {
  it("validates the Thai corpus fixture for later ICU4X/Intl/oracle comparison", () => {
    const plan = createVNextThaiCorpusPlan(readCorpus())

    expect(plan).toMatchObject({
      source: VNEXT_THAI_CORPUS_SOURCE,
      mode: VNEXT_THAI_CORPUS_MODE,
      status: "ready-for-oracle-comparison",
      corpusId: "thai-measurement-corpus-v1",
      policyRevision: "thai-corpus-policy-v1",
      primarySegmenter: {
        segmenterId: "icu4x-segmenter",
        engine: "icu4x",
        runtimeDependent: false,
      },
      oracleContract: {
        primaryTruth: "icu4x",
        comparisonBaseline: "intl-segmenter",
        thaiOracleRequiredBeforeProduction: true,
        storesExpectedBreaksInFixture: false,
      },
      executionContract: {
        executesSegmentation: false,
        importsSegmenters: false,
        importsThaiOracles: false,
        mutatesCorpus: false,
        replacesPaginationMeasurer: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.samples).toHaveLength(6)
    expect(plan.coverage.categories).toMatchObject({
      thai: 6,
      "thai-no-space": 2,
      "combining-mark": 1,
      latin: 2,
      digit: 3,
      punctuation: 2,
      "mixed-script": 2,
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks runtime-dependent primary segmenters and missing category coverage", () => {
    const corpus = readCorpus()
    const plan = createVNextThaiCorpusPlan({
      ...corpus,
      primarySegmenter: {
        segmenterId: "intl-segmenter",
        engine: "intl-segmenter",
        runtimeDependent: true,
      },
      samples: corpus.samples.filter((sample) => sample.sampleId === "thai-greeting-no-space"),
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "primary-segmenter-runtime-dependent",
        targetId: "intl-segmenter",
      }),
      expect.objectContaining({
        code: "missing-category-coverage",
        targetId: "combining-mark",
      }),
      expect.objectContaining({
        code: "missing-category-coverage",
        targetId: "latin",
      }),
      expect.objectContaining({
        code: "missing-category-coverage",
        targetId: "digit",
      }),
    ]))
  })

  it("keeps sample ids unique and Thai localized", () => {
    const corpus = readCorpus()
    const plan = createVNextThaiCorpusPlan({
      ...corpus,
      samples: [{
        ...corpus.samples[0],
      }, {
        ...corpus.samples[0],
        locale: "th",
      }],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "duplicate-sample-id",
        targetId: "thai-greeting-no-space",
      }),
    ]))
  })

  it("keeps the corpus boundary independent from segmenter/oracle execution", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/thaiCorpusBoundary.ts"), "utf8")

    expect(source).toContain("createVNextThaiCorpusPlan")
    expect(source).toContain("icu4x")
    expect(source).toContain("intl-segmenter")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:icu4x|libthai|pythainlp|attacut|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:icu4x|libthai|pythainlp|attacut|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("segment(")
    expect(source).not.toContain("measureVNextText")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the Thai corpus/oracle boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/THAI_CORPUS_ORACLE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 106 corpus boundary.")
    expect(boundaryDoc).toContain("fixtures/thai-measurement-corpus.v1.json")
    expect(boundaryDoc).toContain("ICU4X")
    expect(boundaryDoc).toContain("Intl.Segmenter")
    expect(readme).toContain("Thai corpus/oracle boundary")
    expect(readme).toContain("docs/THAI_CORPUS_ORACLE_BOUNDARY.md")
    expect(ledger).toContain("| 106 | Thai corpus/oracle boundary | done |")
    expect(roadmap).toContain("## Phase 106: Thai Corpus / Oracle Boundary")
  })
})
