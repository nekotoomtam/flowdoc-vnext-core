import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextTextEngineAdapterSpiPlan,
  createVNextTextEngineEvidenceAcceptancePlan,
  createVNextTextEngineMeasurementDraftHandoffPlan,
  VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_MODE,
  VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_SOURCE,
  type VNextMeasurementProfileIdentityInput,
  type VNextRustybuzzShapingSmokeInput,
  type VNextTextEngineAdapterEvidence,
  type VNextTextEngineAdapterRequest,
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

function spiInput(): VNextTextEngineAdapterSpiInput {
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
  }
}

function firstRequest(): VNextTextEngineAdapterRequest {
  return createVNextTextEngineAdapterSpiPlan(spiInput()).requests[0]
}

function evidenceForRequest(request: VNextTextEngineAdapterRequest): VNextTextEngineAdapterEvidence {
  const glyphs = Array.from(request.text).map((char, index) => ({
    glyphIndex: index,
    glyphId: 1000 + char.charCodeAt(0),
    fontId: request.fontId,
    advancePt: 6,
    offsetXPt: 0,
    offsetYPt: 0,
    clusterStartOffset: index,
    clusterEndOffset: index + 1,
  }))
  const splitOffset = Math.max(1, Math.floor(request.text.length / 2))

  return {
    requestId: request.requestId,
    measurementProfileId: request.measurementProfileId,
    outputShapeVersion: request.outputShapeVersion,
    engine: {
      shaper: "rustybuzz",
      shaperRevision: "rustybuzz-planned",
      segmenter: "icu4x",
      segmenterRevision: "icu4x-planned",
      segmenterDataRevision: "icu4x-data-planned",
      deterministic: true,
    },
    glyphs,
    lineBoxes: [{
      lineIndex: 0,
      startOffset: 0,
      endOffset: splitOffset,
      widthPt: splitOffset * 6,
      heightPt: 14,
      yOffsetPt: 0,
      glyphStartIndex: 0,
      glyphEndIndex: splitOffset,
    }, {
      lineIndex: 1,
      startOffset: splitOffset,
      endOffset: request.text.length,
      widthPt: (request.text.length - splitOffset) * 6,
      heightPt: 14,
      yOffsetPt: 14,
      glyphStartIndex: splitOffset,
      glyphEndIndex: glyphs.length,
    }],
    totalAdvancePt: glyphs.length * 6,
    lineHeightPt: 14,
  }
}

function acceptedPlan(request: VNextTextEngineAdapterRequest, evidence: VNextTextEngineAdapterEvidence) {
  return createVNextTextEngineEvidenceAcceptancePlan({
    acceptanceId: "text-engine-evidence-acceptance-v1",
    policyRevision: "text-engine-evidence-policy-v1",
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

describe("vNext text engine measurement draft handoff boundary", () => {
  it("derives a pagination-facing draft from accepted evidence without carrying glyph facts", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const acceptance = acceptedPlan(request, evidence)
    const plan = createVNextTextEngineMeasurementDraftHandoffPlan({
      handoffId: "text-engine-measurement-draft-handoff-v1",
      policyRevision: "text-engine-handoff-policy-v1",
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

    expect(plan).toMatchObject({
      source: VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_SOURCE,
      mode: VNEXT_TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_MODE,
      status: "ready",
      handoffId: "text-engine-measurement-draft-handoff-v1",
      policyRevision: "text-engine-handoff-policy-v1",
      requestId: request.requestId,
      measurementProfileId: request.measurementProfileId,
      summary: {
        lineCount: 2,
        widthPt: Math.max(evidence.lineBoxes[0].widthPt, evidence.lineBoxes[1].widthPt),
        heightPt: 28,
        lineHeightPt: 14,
      },
      handoffContract: {
        consumes: "accepted-text-engine-evidence",
        produces: "vnext-text-measurement-draft",
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        derivesLineTextFromRequestText: true,
        dropsGlyphFactsFromDraft: true,
        preservesEvidenceForCaretConsumers: true,
      },
      executionContract: {
        importsEngine: false,
        importsWasm: false,
        readsFontFiles: false,
        executesShaping: false,
        executesSegmentation: false,
        mutatesEvidence: false,
        replacesPaginationMeasurer: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.draft).toMatchObject({
      lines: [
        request.text.slice(0, evidence.lineBoxes[0].endOffset),
        request.text.slice(evidence.lineBoxes[1].startOffset),
      ],
      lineHeightPt: 14,
      heightPt: 28,
    })
    expect(plan.draft?.lineBoxes).toHaveLength(2)
    expect(plan.draft).not.toHaveProperty("glyphs")
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks handoff when evidence is not accepted", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const blockedAcceptance = createVNextTextEngineEvidenceAcceptancePlan({
      acceptanceId: "text-engine-evidence-acceptance-v1",
      policyRevision: "text-engine-evidence-policy-v1",
      request,
      evidence: {
        ...evidence,
        requestId: "wrong-request",
      },
      expectedEngine: evidence.engine,
      acceptancePolicy: {
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        coreExecutesEngine: false,
        mutatesPaginationDraft: false,
      },
    })
    const plan = createVNextTextEngineMeasurementDraftHandoffPlan({
      handoffId: "text-engine-measurement-draft-handoff-v1",
      policyRevision: "text-engine-handoff-policy-v1",
      request,
      acceptance: blockedAcceptance,
      handoffPolicy: {
        consumesAcceptedEvidenceOnly: true,
        coreExecutesEngine: false,
        mutatesEvidence: false,
        attachesGlyphFactsToDraft: false,
        replacesPaginationMeasurer: false,
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.draft).toBeNull()
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "acceptance-not-accepted" }),
      expect.objectContaining({ code: "missing-accepted-evidence" }),
    ]))
  })

  it("blocks unsafe handoff policy and malformed line facts", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const acceptance = acceptedPlan(request, evidence)
    const plan = createVNextTextEngineMeasurementDraftHandoffPlan({
      handoffId: "text-engine-measurement-draft-handoff-v1",
      policyRevision: "text-engine-handoff-policy-v1",
      bindProductionMeasurement: true,
      request,
      acceptance: {
        ...acceptance,
        acceptedEvidence: {
          ...evidence,
          lineBoxes: [{
            ...evidence.lineBoxes[0],
            startOffset: 4,
            endOffset: 2,
            widthPt: -1,
            heightPt: 0,
            yOffsetPt: -1,
          }],
        },
      },
      handoffPolicy: {
        consumesAcceptedEvidenceOnly: true,
        coreExecutesEngine: true,
        mutatesEvidence: true,
        attachesGlyphFactsToDraft: true,
        replacesPaginationMeasurer: true,
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.draft).toBeNull()
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "core-executes-engine" }),
      expect.objectContaining({ code: "mutates-evidence" }),
      expect.objectContaining({ code: "attaches-glyph-facts-to-draft" }),
      expect.objectContaining({ code: "replaces-pagination-measurer" }),
      expect.objectContaining({ code: "line-range-invalid" }),
      expect.objectContaining({ code: "line-metrics-invalid" }),
    ]))
  })

  it("keeps the handoff independent from concrete engine execution", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/textEngineMeasurementDraftHandoff.ts"), "utf8")

    expect(source).toContain("createVNextTextEngineMeasurementDraftHandoffPlan")
    expect(source).toContain("VNextTextMeasurementDraft")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("shapeText")
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the measurement draft handoff boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 110 measurement draft handoff boundary.")
    expect(boundaryDoc).toContain("src/renderer/textEngineMeasurementDraftHandoff.ts")
    expect(boundaryDoc).toContain("dropsGlyphFactsFromDraft")
    expect(readme).toContain("Text engine measurement draft handoff boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_BOUNDARY.md")
    expect(ledger).toContain("| 110 | Text engine measurement draft handoff boundary | done |")
    expect(roadmap).toContain("## Phase 110: Text Engine Measurement Draft Handoff Boundary")
  })
})
