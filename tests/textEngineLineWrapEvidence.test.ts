import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextTextEngineEvidenceAcceptancePlan,
  createVNextTextEngineMeasurementDraftHandoffPlan,
  type VNextTextEngineAdapterEngineRef,
  type VNextTextEngineAdapterEvidence,
  type VNextTextEngineAdapterRequiredFact,
  type VNextThaiLineBreakEvidenceEntry,
  type VNextThaiLineBreakEvidenceManifest,
} from "../src/index.js"
import {
  createFlowDocRustybuzzSmokeCorpusMappingPlan,
  createFlowDocTextEngineLineWrapEvidencePlan,
  FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_MODE,
  FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_SOURCE,
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

const REQUIRED_FACTS: VNextTextEngineAdapterRequiredFact[] = [
  "glyph-id",
  "glyph-advance",
  "glyph-offset",
  "cluster-map",
  "text-range",
  "line-box",
]

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

function readBreakManifest(): VNextThaiLineBreakEvidenceManifest {
  return readJson<VNextThaiLineBreakEvidenceManifest>("fixtures/thai-line-break-evidence.v1.json")
}

function engine(): VNextTextEngineAdapterEngineRef {
  return {
    shaper: "rustybuzz",
    shaperRevision: "rustybuzz-0.20.1",
    segmenter: "icu4x",
    segmenterRevision: "icu4x-line-break-planned-v1",
    segmenterDataRevision: "icu4x-data-planned-v1",
    deterministic: true,
  }
}

function createSmokeCorpusPlan() {
  const smokeFixture = readSmokeFixture()
  const rawManifest = readRawCorpusManifest()

  return createFlowDocRustybuzzSmokeCorpusMappingPlan({
    corpusId: "phase-133-rustybuzz-line-wrap-corpus",
    policyRevision: rawManifest.policyRevision,
    measurementProfileId: smokeFixture.measurementProfileId,
    cases: smokeFixture.cases.map((smokeCase) => ({
      ...smokeCase,
      requiredFacts: REQUIRED_FACTS,
    })),
    samples: readThaiCorpus().samples,
    rawOutputs: readRawOutputs(rawManifest),
    engine: engine(),
    requestDefaults: {
      availableWidthPt: 240,
    },
    fontSizePt: 12,
    lineHeightPt: 14.4,
  })
}

function breakEntryForSample(sampleId: string): VNextThaiLineBreakEvidenceEntry {
  const entry = readBreakManifest().entries.find((candidate) => (
    candidate.sampleId === sampleId
    && candidate.candidate.engine === "icu4x"
    && candidate.candidate.role === "primary-deterministic"
  ))
  if (entry == null) throw new Error(`missing ICU4X break evidence for ${sampleId}`)
  return entry
}

function acceptEvidence(
  requestId: string,
  request: ReturnType<typeof createSmokeCorpusPlan>["caseMappings"][number]["request"],
  evidence: VNextTextEngineAdapterEvidence,
) {
  return createVNextTextEngineEvidenceAcceptancePlan({
    acceptanceId: `phase-133-acceptance:${requestId}`,
    policyRevision: "phase-133-line-wrap-acceptance",
    request,
    evidence,
    expectedEngine: evidence.engine,
    acceptancePolicy: {
      evidenceLane: "glyph-facts-separate-from-pagination-draft",
      coreExecutesEngine: false,
      mutatesPaginationDraft: false,
    },
  })
}

describe("vNext text engine line wrap evidence boundary", () => {
  it("wraps existing rustybuzz smoke corpus evidence into accepted multi-line line boxes", () => {
    const corpusPlan = createSmokeCorpusPlan()
    const sampleIds = corpusPlan.caseMappings.map((caseMapping) => caseMapping.request.sampleId).sort()

    expect(sampleIds).toEqual([
      "mixed-report-title",
      "thai-combining-marks",
      "thai-currency-number",
      "thai-greeting-no-space",
    ])
    expect(corpusPlan.status).toBe("ready")

    corpusPlan.caseMappings.forEach((caseMapping) => {
      const glyphEvidence = caseMapping.mapping.evidence
      expect(glyphEvidence).not.toBeNull()

      const wrap = createFlowDocTextEngineLineWrapEvidencePlan({
        request: caseMapping.request,
        glyphEvidence: glyphEvidence!,
        breakEvidence: breakEntryForSample(caseMapping.request.sampleId),
        availableWidthPt: 24,
      })

      expect(wrap).toMatchObject({
        source: FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_SOURCE,
        mode: FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE_MODE,
        status: "ready",
        requestId: caseMapping.request.requestId,
        sampleId: caseMapping.request.sampleId,
        wrapContract: {
          consumesGlyphEvidence: "accepted-vnext-text-engine-adapter-evidence",
          consumesBreakEvidence: "thai-line-break-opportunity-evidence",
          produces: "vnext-text-engine-adapter-evidence",
          breakReasonLane: "line-wrap-summary-not-public-line-box-fact",
          lineBoxShape: "glyph-line-box-v1",
          offsetUnit: "utf16-code-unit",
          productionMeasurementReady: false,
        },
        executionContract: {
          importsIcu4x: false,
          importsRustybuzz: false,
          importsWasm: false,
          computesGlyphs: false,
          computesBreaks: false,
          replacesPaginationMeasurer: false,
          writesArtifacts: false,
        },
        blockingIssues: [],
      })
      expect(wrap.coverage.lineCount).toBeGreaterThan(1)
      expect(wrap.coverage.coveredGlyphCount).toBe(wrap.coverage.glyphCount)
      expect(wrap.lineSummaries.every((line) => line.endOffset > line.startOffset)).toBe(true)
      expect(wrap.lineSummaries.some((line) => line.breakReason === "available-width" || line.breakReason === "overflow-first-break")).toBe(true)
      expect(wrap.evidence?.lineBoxes[0]).not.toHaveProperty("breakReason")
      expect(wrap.evidence?.lineBoxes[0]).not.toHaveProperty("breakKind")

      const acceptance = acceptEvidence(caseMapping.caseId, caseMapping.request, wrap.evidence!)
      expect(acceptance.status).toBe("accepted")

      const handoff = createVNextTextEngineMeasurementDraftHandoffPlan({
        handoffId: `phase-133-handoff:${caseMapping.caseId}`,
        policyRevision: "phase-133-line-wrap-handoff",
        request: caseMapping.request,
        acceptance,
        handoffPolicy: {
          consumesAcceptedEvidenceOnly: true,
          coreExecutesEngine: false,
          mutatesEvidence: false,
          attachesGlyphFactsToDraft: false,
          replacesPaginationMeasurer: false,
        },
      })

      expect(handoff.status).toBe("ready")
      expect(handoff.draft?.lineBoxes).toHaveLength(wrap.coverage.lineCount)
      expect(handoff.draft).not.toHaveProperty("glyphs")
    })
  })

  it("keeps wide-width wrapping as a single final line", () => {
    const caseMapping = createSmokeCorpusPlan().caseMappings[0]
    const glyphEvidence = caseMapping.mapping.evidence
    expect(glyphEvidence).not.toBeNull()

    const wrap = createFlowDocTextEngineLineWrapEvidencePlan({
      request: caseMapping.request,
      glyphEvidence: glyphEvidence!,
      breakEvidence: breakEntryForSample(caseMapping.request.sampleId),
      availableWidthPt: 10_000,
    })

    expect(wrap.status).toBe("ready")
    expect(wrap.coverage).toMatchObject({
      lineCount: 1,
      overflowLineCount: 0,
      availableWidthPt: 10_000,
    })
    expect(wrap.lineSummaries[0]).toMatchObject({
      startOffset: 0,
      endOffset: caseMapping.request.text.length,
      glyphStartIndex: 0,
      glyphEndIndex: glyphEvidence!.glyphs.length,
      breakReason: "mandatory-break",
      overflowsAvailableWidth: false,
    })
  })

  it("blocks cluster-splitting break evidence and production binding", () => {
    const caseMapping = createSmokeCorpusPlan().caseMappings.find((mapping) => (
      mapping.request.sampleId === "thai-greeting-no-space"
    ))
    if (caseMapping == null || caseMapping.mapping.evidence == null) throw new Error("missing greeting case mapping")
    const breakEvidence = breakEntryForSample(caseMapping.request.sampleId)
    const wrap = createFlowDocTextEngineLineWrapEvidencePlan({
      request: caseMapping.request,
      glyphEvidence: caseMapping.mapping.evidence,
      breakEvidence: {
        ...breakEvidence,
        breaks: [
          { offset: 2, kind: "word" },
          ...breakEvidence.breaks,
        ],
      },
      availableWidthPt: 24,
      bindProductionMeasurement: true,
    })

    expect(wrap.status).toBe("blocked")
    expect(wrap.evidence).toBeNull()
    expect(wrap.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "break-splits-glyph-cluster" }),
    ]))
  })

  it("blocks overlapping line glyph coverage in the core evidence acceptance boundary", () => {
    const caseMapping = createSmokeCorpusPlan().caseMappings[0]
    const glyphEvidence = caseMapping.mapping.evidence
    expect(glyphEvidence).not.toBeNull()
    const wrap = createFlowDocTextEngineLineWrapEvidencePlan({
      request: caseMapping.request,
      glyphEvidence: glyphEvidence!,
      breakEvidence: breakEntryForSample(caseMapping.request.sampleId),
      availableWidthPt: 24,
    })
    expect(wrap.evidence).not.toBeNull()

    const overlappingEvidence: VNextTextEngineAdapterEvidence = {
      ...wrap.evidence!,
      lineBoxes: wrap.evidence!.lineBoxes.map((lineBox, index) => (
        index === 1
          ? { ...lineBox, glyphStartIndex: 0 }
          : lineBox
      )),
    }
    const acceptance = acceptEvidence("overlap", caseMapping.request, overlappingEvidence)

    expect(acceptance.status).toBe("blocked")
    expect(acceptance.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "line-glyph-coverage-incomplete",
        targetId: caseMapping.request.requestId,
      }),
    ]))
  })

  it("keeps the wrap boundary package-local and dependency-clean", () => {
    const source = readText("packages/text-engine-rust-wasm/src/lineWrapEvidence.ts")
    const packageIndex = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")

    expect(packageIndex).toContain('export * from "./lineWrapEvidence.js"')
    expect(source).toContain('from "@flowdoc/vnext-core"')
    expect(source).toContain("import type")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("paginateVNextDocument")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("FLOWDOC_TEXT_ENGINE_LINE_WRAP_EVIDENCE")
  })

  it("documents Phase 133 and the remaining production measurement gap", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 133 multi-line wrap evidence boundary.")
    expect(boundaryDoc).toContain("line-wrap summary")
    expect(boundaryDoc).toContain("VNextTextMeasurementDraft")
    expect(readme).toContain("Text engine line wrap evidence boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md")
    expect(ledger).toContain("| 133 | Multi-line wrap evidence boundary | done |")
    expect(roadmap).toContain("## Phase 133: Multi-Line Wrap Evidence Boundary")
  })
})
