import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createApproximateVNextTextMeasurer,
  createVNextRendererBackedTextMeasurer,
  createVNextRendererTextMeasurementProfilePlan,
  createVNextTextEngineEvidenceAcceptancePlan,
  createVNextTextEngineMeasurementDraftHandoffPlan,
  measureVNextText,
  type VNextRendererTextMeasurementProfile,
  type VNextTextEngineAdapterRequiredFact,
} from "../src/index.js"
import {
  createFlowDocRustybuzzSmokeCorpusMappingPlan,
  createFlowDocTextEngineRendererBackedDriftReport,
  createFlowDocTextEngineRendererBackedProviderBridge,
  FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_MODE,
  FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE,
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

function readBreakEntry(sampleId: string) {
  const manifest = readJson<{
    entries: Array<Parameters<typeof createFlowDocTextEngineRendererBackedProviderBridge>[0]["evidenceSources"][number]["breakEvidence"]>
  }>("fixtures/thai-line-break-evidence.v1.json")
  const entry = manifest.entries.find((candidate) => (
    candidate.sampleId === sampleId
    && candidate.candidate.engine === "icu4x"
    && candidate.candidate.role === "primary-deterministic"
  ))
  if (entry == null) throw new Error(`missing break entry for ${sampleId}`)
  return entry
}

function createSmokeCorpusPlan() {
  const smokeFixture = readSmokeFixture()
  const rawManifest = readRawCorpusManifest()

  return createFlowDocRustybuzzSmokeCorpusMappingPlan({
    corpusId: "phase-135-renderer-backed-provider-corpus",
    policyRevision: rawManifest.policyRevision,
    measurementProfileId: smokeFixture.measurementProfileId,
    cases: smokeFixture.cases.map((smokeCase) => ({
      ...smokeCase,
      requiredFacts: REQUIRED_FACTS,
    })),
    samples: readThaiCorpus().samples,
    rawOutputs: readRawOutputs(rawManifest),
    engine: {
      shaper: "rustybuzz",
      shaperRevision: "rustybuzz-0.20.1",
      segmenter: "icu4x",
      segmenterRevision: "icu4x-line-break-planned-v1",
      segmenterDataRevision: "icu4x-data-planned-v1",
      deterministic: true,
    },
    requestDefaults: {
      availableWidthPt: 240,
    },
    fontSizePt: 12,
    lineHeightPt: 14.4,
  })
}

function readyProfile(profileId = readSmokeFixture().measurementProfileId): VNextRendererTextMeasurementProfile {
  return {
    profileId,
    availability: "ready",
    engine: "custom",
    revision: "phase-135-provider-v1",
    units: "pt",
    deterministic: true,
    capabilities: {
      lineBoxes: true,
      styleKey: true,
      availableWidth: true,
    },
  }
}

const CORE_BOUNDARY = {
  createRendererTextMeasurementProfilePlan: createVNextRendererTextMeasurementProfilePlan,
  createTextEngineEvidenceAcceptancePlan: createVNextTextEngineEvidenceAcceptancePlan,
  createTextEngineMeasurementDraftHandoffPlan: createVNextTextEngineMeasurementDraftHandoffPlan,
}

function firstEvidenceSource() {
  const caseMapping = createSmokeCorpusPlan().caseMappings[0]
  if (caseMapping.mapping.evidence == null) throw new Error("missing mapped glyph evidence")

  return {
    request: caseMapping.request,
    glyphEvidence: caseMapping.mapping.evidence,
    breakEvidence: readBreakEntry(caseMapping.request.sampleId),
  }
}

describe("vNext renderer-backed text engine provider bridge", () => {
  it("routes measurement through wrap evidence, acceptance, handoff, and the core renderer-backed measurer", () => {
    const source = firstEvidenceSource()
    const bridge = createFlowDocTextEngineRendererBackedProviderBridge({
      providerId: "phase-135-renderer-backed-provider",
      policyRevision: "phase-135-renderer-backed-provider-policy-v1",
      rendererProfile: readyProfile(source.request.measurementProfileId),
      evidenceSources: [source],
      core: CORE_BOUNDARY,
    })

    expect(bridge.plan).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_MODE,
      status: "ready",
      measurementProfileId: source.request.measurementProfileId,
      providerContract: {
        consumes: "vnext-renderer-text-measurement-request",
        evidenceFlow: "wrap-accept-handoff",
        wrapsWithCoreRendererBackedMeasurer: true,
        defaultPaginationMeasurementUnchanged: true,
        productionMeasurementReady: false,
      },
      executionContract: {
        usesInjectedCorePublicBoundary: true,
        importsRendererLibraries: false,
        importsWasm: false,
        executesRenderer: false,
        executesIcu4x: false,
        mutatesPaginationCache: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
    })

    const measurer = createVNextRendererBackedTextMeasurer(readyProfile(source.request.measurementProfileId), bridge.provider)
    const measurementInput = {
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "text-block",
      text: source.request.text,
      availableWidthPt: 24,
      styleKey: source.request.styleKey,
      measurementProfileId: source.request.measurementProfileId,
    }
    const measured = measureVNextText(measurementInput, measurer)

    expect(measured.measurementProfileId).toBe(source.request.measurementProfileId)
    expect(measured.lines.length).toBeGreaterThan(1)
    expect(measured.lineBoxes).toHaveLength(measured.lines.length)
    expect(measured.lineBoxes[0].startOffset).toBe(0)
    expect(measured.lineBoxes[measured.lineBoxes.length - 1]?.endOffset).toBe(source.request.text.length)
  })

  it("keeps approximate measurement as an explicit comparison and reports drift", () => {
    const source = firstEvidenceSource()
    const bridge = createFlowDocTextEngineRendererBackedProviderBridge({
      providerId: "phase-135-renderer-backed-provider",
      policyRevision: "phase-135-renderer-backed-provider-policy-v1",
      rendererProfile: readyProfile(source.request.measurementProfileId),
      evidenceSources: [source],
      core: CORE_BOUNDARY,
    })
    const measurementInput = {
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "text-block",
      text: source.request.text,
      availableWidthPt: 24,
      styleKey: source.request.styleKey,
      measurementProfileId: source.request.measurementProfileId,
    }
    const rendererBacked = measureVNextText(
      measurementInput,
      createVNextRendererBackedTextMeasurer(readyProfile(source.request.measurementProfileId), bridge.provider),
    )
    const approximate = measureVNextText(
      measurementInput,
      createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
    )
    const report = createFlowDocTextEngineRendererBackedDriftReport({
      measurementInput,
      approximateDraft: approximate,
      rendererBackedDraft: rendererBacked,
      tolerance: {
        widthPt: 0,
        heightPt: 0,
        lineCount: 0,
      },
    })

    expect(report).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE,
      mode: "renderer-backed-measurement-drift-report",
      measurementProfileId: source.request.measurementProfileId,
      approximateDraft: {
        lineCount: approximate.lineBoxes.length,
        widthPt: approximate.widthPt,
        heightPt: approximate.heightPt,
      },
      rendererBackedDraft: {
        lineCount: rendererBacked.lineBoxes.length,
        widthPt: rendererBacked.widthPt,
        heightPt: rendererBacked.heightPt,
      },
      tolerance: {
        widthPt: 0,
        heightPt: 0,
        lineCount: 0,
      },
    })
    expect(report.textHash).toBe(rendererBacked.textHash)
    expect(report.status).toBe(report.drift.widthPt === 0 && report.drift.heightPt === 0 && report.drift.lineCount === 0 ? "accepted" : "rejected")
  })

  it("lets the core renderer-backed measurer block wrong measurementProfileId", () => {
    const source = firstEvidenceSource()
    const bridge = createFlowDocTextEngineRendererBackedProviderBridge({
      providerId: "phase-135-renderer-backed-provider",
      policyRevision: "phase-135-renderer-backed-provider-policy-v1",
      rendererProfile: readyProfile(source.request.measurementProfileId),
      evidenceSources: [source],
      core: CORE_BOUNDARY,
    })
    const measurer = createVNextRendererBackedTextMeasurer(readyProfile(source.request.measurementProfileId), bridge.provider)

    expect(() => measureVNextText({
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "text-block",
      text: source.request.text,
      availableWidthPt: 24,
      styleKey: source.request.styleKey,
      measurementProfileId: "other-profile",
    }, measurer)).toThrow("must match")
  })

  it("blocks missing line-box support through the existing renderer profile plan", () => {
    const source = firstEvidenceSource()
    const bridge = createFlowDocTextEngineRendererBackedProviderBridge({
      providerId: "phase-135-renderer-backed-provider",
      policyRevision: "phase-135-renderer-backed-provider-policy-v1",
      rendererProfile: {
        ...readyProfile(source.request.measurementProfileId),
        capabilities: {
          lineBoxes: false,
          styleKey: true,
          availableWidth: true,
        },
      },
      evidenceSources: [source],
      core: CORE_BOUNDARY,
    })

    expect(bridge.plan.status).toBe("blocked")
    expect(bridge.plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "renderer-profile-blocked",
        targetId: "line-boxes-not-supported",
      }),
    ]))
    expect(() => bridge.provider.measure({
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "text-block",
      text: source.request.text,
      availableWidthPt: 24,
      styleKey: source.request.styleKey,
      measurementProfileId: source.request.measurementProfileId,
      cacheKey: "cache",
      textHash: "hash",
      rendererEngine: "custom",
      profileRevision: "phase-135-provider-v1",
    })).toThrow("provider bridge is blocked")
  })

  it("keeps the provider external and default text measurement unchanged", () => {
    const source = readText("packages/text-engine-rust-wasm/src/rendererBackedProvider.ts")
    const packageIndex = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")
    const textMeasurement = readText("src/pagination/textMeasurement.ts")

    expect(packageIndex).toContain('export * from "./rendererBackedProvider.js"')
    expect(source).toContain('from "@flowdoc/vnext-core"')
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:pdfkit|pdf-lib|jspdf|docx|canvas|puppeteer|playwright|wasm-bindgen|icu4x)["']/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("new Intl.Segmenter")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER")
    expect(textMeasurement).toContain("createApproximateVNextTextMeasurer")
    expect(textMeasurement).not.toContain("rendererBackedProvider")
  })

  it("documents Phase 135 and the remaining production binding gap", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 135 renderer-backed text measurement provider bridge boundary.")
    expect(boundaryDoc).toContain("createVNextRendererBackedTextMeasurer")
    expect(boundaryDoc).toContain("drift")
    expect(readme).toContain("Text engine renderer-backed provider bridge")
    expect(readme).toContain("docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md")
    expect(ledger).toContain("| 135 | Renderer-backed text measurement provider bridge | done |")
    expect(roadmap).toContain("## Phase 135: Renderer-Backed Text Measurement Provider Bridge")
  })
})
