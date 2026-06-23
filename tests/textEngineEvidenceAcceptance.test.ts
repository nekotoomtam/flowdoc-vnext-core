import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  createVNextTextEngineAdapterSpiPlan,
  createVNextTextEngineEvidenceAcceptancePlan,
  VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_MODE,
  VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_SOURCE,
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
      endOffset: request.text.length,
      widthPt: glyphs.length * 6,
      heightPt: 14,
      yOffsetPt: 0,
      glyphStartIndex: 0,
      glyphEndIndex: glyphs.length,
    }],
    totalAdvancePt: glyphs.length * 6,
    lineHeightPt: 14,
  }
}

describe("vNext text engine evidence acceptance boundary", () => {
  it("accepts adapter glyph evidence without producing a pagination draft", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const plan = createVNextTextEngineEvidenceAcceptancePlan({
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

    expect(plan).toMatchObject({
      source: VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_SOURCE,
      mode: VNEXT_TEXT_ENGINE_EVIDENCE_ACCEPTANCE_MODE,
      status: "accepted",
      acceptanceId: "text-engine-evidence-acceptance-v1",
      policyRevision: "text-engine-evidence-policy-v1",
      requestId: request.requestId,
      measurementProfileId: request.measurementProfileId,
      outputShapeVersion: "glyph-line-box-v1",
      summary: {
        glyphCount: request.text.length,
        lineBoxCount: 1,
        totalAdvancePt: request.text.length * 6,
        lineHeightPt: 14,
      },
      acceptanceContract: {
        consumes: "vnext-text-engine-adapter-evidence",
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        validatesGlyphFacts: true,
        validatesLineBoxFacts: true,
        validatesClusterRanges: true,
        producesMeasurementDraft: false,
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
    expect(plan.acceptedEvidence).toEqual(evidence)
    expect(plan.warningIssues).toEqual([expect.objectContaining({
      code: "missing-wasm-digest",
      severity: "warning",
    })])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks request, profile, shape, and engine mismatches", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const plan = createVNextTextEngineEvidenceAcceptancePlan({
      acceptanceId: "text-engine-evidence-acceptance-v1",
      policyRevision: "text-engine-evidence-policy-v1",
      bindProductionMeasurement: true,
      request,
      evidence: {
        ...evidence,
        requestId: "other-request",
        measurementProfileId: "other-profile",
        outputShapeVersion: "glyph-line-box-v1",
        engine: {
          ...evidence.engine,
          shaperRevision: "rustybuzz-other",
          deterministic: false,
        },
      },
      expectedEngine: evidence.engine,
      acceptancePolicy: {
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        coreExecutesEngine: true,
        mutatesPaginationDraft: true,
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.acceptedEvidence).toBeNull()
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "core-executes-engine" }),
      expect.objectContaining({ code: "mutates-pagination-draft" }),
      expect.objectContaining({ code: "request-id-mismatch", targetId: "other-request" }),
      expect.objectContaining({ code: "measurement-profile-mismatch", targetId: "other-profile" }),
      expect.objectContaining({ code: "engine-revision-mismatch" }),
      expect.objectContaining({ code: "nondeterministic-evidence-engine" }),
    ]))
  })

  it("blocks malformed glyph and line box facts", () => {
    const request = firstRequest()
    const evidence = evidenceForRequest(request)
    const plan = createVNextTextEngineEvidenceAcceptancePlan({
      acceptanceId: "text-engine-evidence-acceptance-v1",
      policyRevision: "text-engine-evidence-policy-v1",
      request,
      evidence: {
        ...evidence,
        glyphs: [{
          ...evidence.glyphs[0],
          glyphIndex: 4,
          glyphId: -1,
          fontId: "wrong-font",
          advancePt: -1,
          offsetXPt: Number.NaN,
          clusterStartOffset: -1,
          clusterEndOffset: 0,
        }],
        lineBoxes: [{
          ...evidence.lineBoxes[0],
          lineIndex: 2,
          startOffset: 4,
          endOffset: 2,
          widthPt: -1,
          heightPt: 0,
          yOffsetPt: -1,
          glyphStartIndex: 0,
          glyphEndIndex: 5,
        }],
        totalAdvancePt: 0,
        lineHeightPt: 0,
      },
      expectedEngine: evidence.engine,
      acceptancePolicy: {
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        coreExecutesEngine: false,
        mutatesPaginationDraft: false,
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-total-advance" }),
      expect.objectContaining({ code: "invalid-line-height" }),
      expect.objectContaining({ code: "glyph-index-not-contiguous" }),
      expect.objectContaining({ code: "glyph-id-invalid" }),
      expect.objectContaining({ code: "glyph-font-mismatch" }),
      expect.objectContaining({ code: "glyph-advance-invalid" }),
      expect.objectContaining({ code: "glyph-offset-invalid" }),
      expect.objectContaining({ code: "glyph-cluster-range-invalid" }),
      expect.objectContaining({ code: "line-index-not-contiguous" }),
      expect.objectContaining({ code: "line-range-invalid" }),
      expect.objectContaining({ code: "line-width-invalid" }),
      expect.objectContaining({ code: "line-height-invalid" }),
      expect.objectContaining({ code: "line-y-offset-invalid" }),
      expect.objectContaining({ code: "line-glyph-range-out-of-bounds" }),
    ]))
  })

  it("keeps the acceptance boundary independent from engine execution and pagination draft creation", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/textEngineEvidenceAcceptance.ts"), "utf8")

    expect(source).toContain("createVNextTextEngineEvidenceAcceptancePlan")
    expect(source).toContain("producesMeasurementDraft: false")
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

  it("documents the evidence acceptance boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/TEXT_ENGINE_EVIDENCE_ACCEPTANCE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 109 evidence acceptance boundary.")
    expect(boundaryDoc).toContain("src/renderer/textEngineEvidenceAcceptance.ts")
    expect(boundaryDoc).toContain("producesMeasurementDraft: false")
    expect(readme).toContain("Text engine evidence acceptance boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_EVIDENCE_ACCEPTANCE_BOUNDARY.md")
    expect(ledger).toContain("| 109 | Text engine evidence acceptance boundary | done |")
    expect(roadmap).toContain("## Phase 109: Text Engine Evidence Acceptance Boundary")
  })
})
