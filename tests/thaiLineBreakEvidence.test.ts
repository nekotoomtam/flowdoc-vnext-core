import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextThaiLineBreakEvidencePlan,
  VNEXT_THAI_LINE_BREAK_EVIDENCE_MODE,
  VNEXT_THAI_LINE_BREAK_EVIDENCE_SOURCE,
  type VNextThaiCorpusInput,
  type VNextThaiLineBreakEvidenceManifest,
} from "../src/index.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function readCorpus(): VNextThaiCorpusInput {
  return readJson("fixtures/thai-measurement-corpus.v1.json")
}

function readManifest(): VNextThaiLineBreakEvidenceManifest {
  return readJson("fixtures/thai-line-break-evidence.v1.json")
}

describe("vNext Thai line-break evidence boundary", () => {
  it("validates a separate manifest of UTF-16 line-break opportunities", () => {
    const corpus = readCorpus()
    const plan = createVNextThaiLineBreakEvidencePlan({
      corpus,
      manifest: readManifest(),
    })

    expect(plan).toMatchObject({
      source: VNEXT_THAI_LINE_BREAK_EVIDENCE_SOURCE,
      mode: VNEXT_THAI_LINE_BREAK_EVIDENCE_MODE,
      status: "ready-for-wrap-evidence",
      manifestId: "thai-line-break-evidence-v1",
      policyRevision: "thai-line-break-evidence-policy-v1",
      corpusId: corpus.corpusId,
      evidenceContract: {
        corpusRemainsNeutral: true,
        primaryTruth: "icu4x",
        comparisonBaseline: "intl-segmenter",
        thaiOracleCandidatesAreTruth: false,
        offsetUnit: "utf16-code-unit",
      },
      executionContract: {
        executesSegmentation: false,
        importsIcu4x: false,
        importsIntlSegmenter: false,
        importsThaiOracles: false,
        computesLineBoxes: false,
        replacesPaginationMeasurer: false,
        mutatesCorpus: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
      warningIssues: [],
    })

    expect(plan.entries).toHaveLength(corpus.samples.length * 2)
    expect(plan.coverage.sampleIds).toEqual(corpus.samples.map((sample) => sample.sampleId).sort())
    expect(plan.coverage.primaryIcu4xSampleIds).toEqual(plan.coverage.sampleIds)
    expect(plan.coverage.intlComparisonSampleIds).toEqual(plan.coverage.sampleIds)
    expect(plan.coverage.candidateEngines).toEqual(["icu4x", "intl-segmenter"])
    expect(plan.coverage.breakKindCounts).toMatchObject({
      mandatory: corpus.samples.length * 2,
      word: expect.any(Number) as number,
      space: expect.any(Number) as number,
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("keeps observed evidence outside the neutral Thai corpus fixture", () => {
    const corpusText = readText("fixtures/thai-measurement-corpus.v1.json")
    const corpus = JSON.parse(corpusText) as VNextThaiCorpusInput & Record<string, unknown>

    expect(corpus).not.toHaveProperty("entries")
    expect(corpus).not.toHaveProperty("breaks")
    expect(corpus).not.toHaveProperty("lineBreakPolicy")
    corpus.samples.forEach((sample) => {
      expect(sample).not.toHaveProperty("breaks")
      expect(sample).not.toHaveProperty("lineBreakPolicy")
    })
    expect(readText("fixtures/thai-line-break-evidence.v1.json")).toContain("breaks")
  })

  it("blocks unknown samples and duplicate evidence ids", () => {
    const manifest = readManifest()
    const duplicate = manifest.entries[0]
    const plan = createVNextThaiLineBreakEvidencePlan({
      corpus: readCorpus(),
      manifest: {
        ...manifest,
        entries: [
          duplicate,
          {
            ...duplicate,
            sampleId: "missing-sample",
          },
        ],
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "duplicate-evidence-id",
        targetId: duplicate.evidenceId,
      }),
      expect.objectContaining({
        code: "unknown-sample-id",
        targetId: "missing-sample",
      }),
    ]))
  })

  it("blocks deterministic candidates without revisions and Intl primary truth", () => {
    const manifest = readManifest()
    const icuEntry = manifest.entries.find((entry) => entry.candidate.engine === "icu4x")
    const intlEntry = manifest.entries.find((entry) => entry.candidate.engine === "intl-segmenter")
    if (icuEntry == null || intlEntry == null) throw new Error("fixture must include ICU4X and Intl entries")

    const plan = createVNextThaiLineBreakEvidencePlan({
      corpus: readCorpus(),
      manifest: {
        ...manifest,
        entries: [{
          ...icuEntry,
          evidenceId: "bad-icu4x",
          candidate: {
            ...icuEntry.candidate,
            engineRevision: "",
            dataRevision: "",
          },
        }, {
          ...intlEntry,
          evidenceId: "bad-intl-primary",
          candidate: {
            ...intlEntry.candidate,
            role: "primary-deterministic",
          },
        }],
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-engine-revision", targetId: "bad-icu4x" }),
      expect.objectContaining({ code: "missing-data-revision", targetId: "bad-icu4x" }),
      expect.objectContaining({ code: "intl-marked-primary-truth", targetId: "bad-intl-primary" }),
      expect.objectContaining({ code: "intl-not-comparison-baseline", targetId: "bad-intl-primary" }),
    ]))
  })

  it("blocks invalid UTF-16 break offsets", () => {
    const manifest = readManifest()
    const entry = manifest.entries[0]
    const plan = createVNextThaiLineBreakEvidencePlan({
      corpus: readCorpus(),
      manifest: {
        ...manifest,
        entries: [{
          ...entry,
          breaks: [
            { offset: 6, kind: "word" },
            { offset: 6, kind: "word" },
            { offset: 999, kind: "mandatory" },
          ],
        }],
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "break-offset-not-ascending" }),
      expect.objectContaining({ code: "break-offset-out-of-bounds" }),
      expect.objectContaining({ code: "missing-final-break", targetId: entry.evidenceId }),
    ]))
  })

  it("keeps the line-break boundary dependency-clean and non-executing", () => {
    const source = readText("src/renderer/thaiLineBreakEvidence.ts")

    expect(source).toContain("createVNextThaiLineBreakEvidencePlan")
    expect(source).toContain("utf16-code-unit")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:icu4x|libthai|pythainlp|attacut|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:icu4x|libthai|pythainlp|attacut|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("measureVNextText")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the line-break evidence boundary in the phase trail", () => {
    const boundaryDoc = readText("docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 132 line-break evidence manifest boundary.")
    expect(boundaryDoc).toContain("fixtures/thai-line-break-evidence.v1.json")
    expect(boundaryDoc).toContain("UTF-16")
    expect(readme).toContain("Thai line-break evidence manifest boundary")
    expect(readme).toContain("docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md")
    expect(ledger).toContain("| 132 | ICU4X line-break evidence manifest boundary | done |")
    expect(roadmap).toContain("## Phase 132: ICU4X Line-Break Evidence Manifest Boundary")
  })
})
