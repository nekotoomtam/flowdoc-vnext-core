import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextTextEngineEvidenceAcceptancePlan,
  type VNextTextEngineAdapterEngineRef,
  type VNextTextEngineAdapterRequest,
  type VNextTextEngineAdapterRequiredFact,
} from "../src/index.js"
import {
  createFlowDocRustybuzzRawEvidenceMappingPlan,
  FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_MODE,
  FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_SOURCE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
  type FlowDocRustybuzzRawSmokeOutput,
} from "../packages/text-engine-rust-wasm/src/index.js"

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

function readRawSmoke(): FlowDocRustybuzzRawSmokeOutput {
  return readJson<FlowDocRustybuzzRawSmokeOutput>("packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.sarabun.v1.json")
}

function requestForRawSmoke(rawOutput: FlowDocRustybuzzRawSmokeOutput): VNextTextEngineAdapterRequest {
  return {
    requestId: "text-engine-request:shape-thai-greeting-sarabun-regular:thai-greeting-no-space:sarabun-regular:paragraph",
    smokeCaseId: "shape-thai-greeting-sarabun-regular",
    sampleId: "thai-greeting-no-space",
    measurementProfileId: "measurement-profile-v1:thai-rustybuzz-icu4x-v1",
    text: rawOutput.text,
    locale: "th",
    fontId: rawOutput.fontId,
    styleKey: "paragraph",
    availableWidthPt: 240,
    outputShapeVersion: "glyph-line-box-v1",
    requestedFacts: REQUIRED_FACTS,
  }
}

function engineForRawSmoke(rawOutput: FlowDocRustybuzzRawSmokeOutput): VNextTextEngineAdapterEngineRef {
  return {
    shaper: "rustybuzz",
    shaperRevision: rawOutput.shaperRevision,
    segmenter: "icu4x",
    segmenterRevision: "icu4x-planned",
    segmenterDataRevision: "icu4x-data-planned",
    deterministic: true,
  }
}

describe("vNext text engine rustybuzz raw mapping boundary", () => {
  it("maps raw rustybuzz byte clusters and font units into accepted adapter evidence", () => {
    const rawOutput = readRawSmoke()
    const request = requestForRawSmoke(rawOutput)
    const engine = engineForRawSmoke(rawOutput)
    const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
      request,
      rawOutput,
      engine,
      fontSizePt: 12,
      lineHeightPt: 14.4,
    })

    expect(mapping).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_MODE,
      status: "ready",
      requestId: request.requestId,
      rawSource: "flowdoc-rustybuzz-native-smoke",
      mappingContract: {
        consumes: "rustybuzz-native-smoke-json",
        produces: "vnext-text-engine-adapter-evidence",
        clusterInputUnit: "utf8-byte-offset",
        clusterOutputUnit: "utf16-code-unit-offset",
        advanceInputUnit: "font-unit",
        advanceOutputUnit: "pt",
        lineBreaking: "single-line-smoke-only",
        productionMeasurementReady: false,
      },
      scale: {
        fontSizePt: 12,
        lineHeightPt: 14.4,
        unitsPerEm: 1000,
        fontUnitToPt: 0.012,
      },
      summary: {
        glyphCount: 13,
        zeroAdvanceGlyphCount: 4,
        repeatedClusterGlyphCount: 4,
        totalAdvancePt: 62.604,
        textLengthUtf16: 13,
        textLengthUtf8Bytes: 39,
      },
      blockingIssues: [],
    })
    expect(mapping.warningIssues).toEqual([expect.objectContaining({
      code: "missing-wasm-digest",
      severity: "warning",
    })])

    const evidence = mapping.evidence
    expect(evidence).not.toBeNull()
    expect(evidence?.glyphs[0]).toMatchObject({
      glyphIndex: 0,
      glyphId: 481,
      advancePt: 6.96,
      clusterStartOffset: 0,
      clusterEndOffset: 1,
    })
    expect(evidence?.glyphs[1]).toMatchObject({
      glyphIndex: 1,
      glyphId: 478,
      advancePt: 6.144,
      clusterStartOffset: 1,
      clusterEndOffset: 3,
    })
    expect(evidence?.glyphs[2]).toMatchObject({
      glyphIndex: 2,
      glyphId: 733,
      advancePt: 0,
      offsetXPt: -0.12,
      clusterStartOffset: 1,
      clusterEndOffset: 3,
    })
    expect(evidence?.glyphs[10]).toMatchObject({
      clusterStartOffset: 10,
      clusterEndOffset: 12,
    })
    expect(evidence?.glyphs[11]).toMatchObject({
      glyphId: 769,
      advancePt: 0,
      clusterStartOffset: 10,
      clusterEndOffset: 12,
    })
    expect(evidence?.glyphs[12]).toMatchObject({
      clusterStartOffset: 12,
      clusterEndOffset: 13,
    })
    expect(evidence?.lineBoxes).toEqual([{
      lineIndex: 0,
      startOffset: 0,
      endOffset: request.text.length,
      widthPt: 62.604,
      heightPt: 14.4,
      yOffsetPt: 0,
      glyphStartIndex: 0,
      glyphEndIndex: 13,
    }])

    const acceptance = createVNextTextEngineEvidenceAcceptancePlan({
      acceptanceId: "phase-114-rustybuzz-raw-mapping-acceptance",
      policyRevision: "phase-114-rustybuzz-raw-mapping-policy",
      request,
      evidence: evidence!,
      expectedEngine: engine,
      acceptancePolicy: {
        evidenceLane: "glyph-facts-separate-from-pagination-draft",
        coreExecutesEngine: false,
        mutatesPaginationDraft: false,
      },
    })

    expect(acceptance.status).toBe("accepted")
    expect(acceptance.acceptedEvidence).toEqual(evidence)
  })

  it("blocks raw rustybuzz output that cannot safely map to request evidence", () => {
    const rawOutput = readRawSmoke()
    const request = requestForRawSmoke(rawOutput)
    const engine = {
      ...engineForRawSmoke(rawOutput),
      shaperRevision: "rustybuzz-other",
      deterministic: false,
    }
    const brokenRawOutput: FlowDocRustybuzzRawSmokeOutput = {
      ...rawOutput,
      fontId: "wrong-font",
      glyphCount: 999,
      glyphs: rawOutput.glyphs.map((glyph, index) => (
        index === 0 ? { ...glyph, cluster: 1 } : glyph
      )),
    }
    const mapping = createFlowDocRustybuzzRawEvidenceMappingPlan({
      request,
      rawOutput: brokenRawOutput,
      engine,
      bindProductionMeasurement: true,
    })

    expect(mapping.status).toBe("blocked")
    expect(mapping.evidence).toBeNull()
    expect(mapping.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "request-font-mismatch", targetId: "wrong-font" }),
      expect.objectContaining({ code: "shaper-revision-mismatch", targetId: rawOutput.shaperRevision }),
      expect.objectContaining({ code: "nondeterministic-engine" }),
      expect.objectContaining({ code: "glyph-count-mismatch" }),
      expect.objectContaining({ code: "cluster-not-utf8-boundary" }),
    ]))
  })

  it("keeps raw mapping package-local and out of core runtime imports", () => {
    const mapperSource = readText("packages/text-engine-rust-wasm/src/rustybuzzRawMapping.ts")
    const packageIndex = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")

    expect(packageIndex).toContain('export * from "./rustybuzzRawMapping.js"')
    expect(mapperSource).toContain('from "@flowdoc/vnext-core"')
    expect(mapperSource).toContain("import type")
    expect(mapperSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(mapperSource).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(mapperSource).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(mapperSource).not.toContain("WebAssembly")
    expect(mapperSource).not.toContain("paginateVNextDocument")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING")
  })

  it("documents Phase 114 and the remaining production binding gap", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_BOUNDARY.md")
    const packageReadme = readText("packages/text-engine-rust-wasm/README.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 114 rustybuzz raw mapping boundary.")
    expect(boundaryDoc).toContain("UTF-8 byte clusters")
    expect(boundaryDoc).toContain("UTF-16 text ranges")
    expect(boundaryDoc).toContain("single-line smoke")
    expect(packageReadme).toContain("Status: WASM toolchain Rust upgrade execution package.")
    expect(packageReadme).toContain("Phase 114 adds")
    expect(readme).toContain("Text engine rustybuzz raw mapping boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_BOUNDARY.md")
    expect(ledger).toContain("| 114 | Text engine rustybuzz raw mapping boundary | done |")
    expect(roadmap).toContain("## Phase 114: Text Engine Rustybuzz Raw Mapping Boundary")
  })
})
