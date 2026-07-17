import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportDisplayFormattingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDisplayFormatting.js"
import type { FlowDocCanonicalReportMeasurementRequestHandoffBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.js"
import {
  createFlowDocCanonicalReportNativeShapingBundleV1,
  createFlowDocCanonicalReportNativeShapingPlanV1,
  validateFlowDocCanonicalReportNativeShapingBundleV1,
  type FlowDocCanonicalReportNativeRawEvidenceBundleV1,
  type FlowDocCanonicalReportNativeShapingBundleV1,
  type FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"
import type { FlowDocCanonicalReportTemplateResolutionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT = {
  dataBundle: readJson<FlowDocCanonicalReportDataBundleV1>(
    "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json",
  ),
  templateBundle: readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
  ),
  formattingBundle: readJson<FlowDocCanonicalReportDisplayFormattingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json",
  ),
  measurementHandoff: readJson<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1>(
    "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json",
  ),
  projectionBundle: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
  ),
  fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
    "assets/fonts/font-assets.v1.json",
  ),
}
const RAW = readJson<FlowDocCanonicalReportNativeRawEvidenceBundleV1>(
  "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-raw.v1.json",
)
const BUNDLE = readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
  "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json",
)

function validate(
  value: unknown,
  raw: FlowDocCanonicalReportNativeRawEvidenceBundleV1 = RAW,
) {
  return validateFlowDocCanonicalReportNativeShapingBundleV1(value, INPUT, raw)
}

describe("PDF-PILOT-08B-R2C-D canonical report native shaping", () => {
  it("pins the accepted profile and complete native shaping evidence", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-D",
      sourceProjectionFingerprint: "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193",
      sourceRawEvidenceFingerprint: "8f8441754fd6fb4256bc37ffd30d21cdcf15f80e445bc9a9f05f751dc579548c",
      planFingerprint: "269d682d22288f26a951d942787a659fad1edfee90b8459340900414120cdadb",
      bundleFingerprint: "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8",
      profileBinding: {
        status: "bound-native-shaping-only",
        shaperEngine: "rustybuzz",
        profileShaperRevision: "0.20.1",
        nativeShaperRevision: "rustybuzz-0.20.1",
        revisionCompatibility: "matched-normalized",
        segmenterRevision: "icu4x-planned",
        productionBinding: false,
      },
      summary: {
        sourceBlockRequestCount: 794,
        sourceRunCount: 946,
        emptyRunCount: 1,
        nativeShapeRunCount: 945,
        localBoldOverrideRunCount: 2,
        uniqueMeasurementVariantCount: 421,
        uniqueShapeExecutionCount: 462,
        deduplicatedShapeRunCount: 483,
        styleBindingCount: 6,
        fontAssetCount: 2,
        glyphCount: 10893,
        missingGlyphCount: 0,
        zeroAdvanceGlyphCount: 452,
        repeatedClusterGlyphCount: 469,
        generatedInlineDeferredBlockCount: 12,
      },
    })
  }, 60_000)

  it("binds inline runs independently and preserves the empty cell without an engine call", () => {
    const executionById = new Map(BUNDLE.shapeExecutions.map((execution) => (
      [execution.shapeRequest.shapeRequestId, execution]
    )))
    const mixed = BUNDLE.consumers.find((consumer) => consumer.source.textBlockId === "cover-field-benchmark-id")
    expect(mixed?.runBindings).toHaveLength(2)
    expect(mixed?.runBindings.map((run) => ({
      inlineId: run.inlineId,
      fontId: run.shapeRequestId == null
        ? null
        : executionById.get(run.shapeRequestId)?.shapeRequest.fontId,
      range: [run.renderStartOffset, run.renderEndOffset],
      localBoldOverride: run.localBoldOverride,
    }))).toEqual([
      {
        inlineId: "cover-field-benchmark-id-label",
        fontId: "ibm-plex-sans-thai-regular",
        range: [0, 14],
        localBoldOverride: false,
      },
      {
        inlineId: "cover-field-benchmark-id-value",
        fontId: "ibm-plex-sans-thai-regular",
        range: [14, 39],
        localBoldOverride: false,
      },
    ])

    const empty = BUNDLE.consumers.find((consumer) => consumer.runBindings.some((run) => run.shapeRequestId == null))
    expect(empty).toMatchObject({
      source: {
        lane: "projected-table-materialized-text",
        projectionId: "mapping-comparison",
        sourceCellId: "table-mapping-fields-mapping-comparison-body-cell-expected-value-text",
        rowIndex: 9,
      },
      runBindings: [{ renderStartOffset: 0, renderEndOffset: 0, shapeRequestId: null }],
    })
    expect(BUNDLE.shapeExecutions.every((execution) => execution.shapeRequest.text.length > 0)).toBe(true)
  })

  it("maps real rustybuzz font-unit glyphs into bounded UTF-16 report evidence", () => {
    expect(RAW.executions).toHaveLength(462)
    expect(RAW.executions.every((execution) => (
      execution.rawOutput.source === "flowdoc-rustybuzz-native-smoke"
      && execution.rawOutput.shaperRevision === "rustybuzz-0.20.1"
      && execution.rawOutput.fontPath.startsWith("assets/fonts/IBM_Plex_Sans_Thai/")
      && !/^[A-Za-z]:[\\/]/u.test(execution.rawOutput.fontPath)
    ))).toBe(true)
    for (const execution of BUNDLE.shapeExecutions) {
      expect(execution.summary.missingGlyphCount, execution.shapeRequest.shapeRequestId).toBe(0)
      expect(execution.evidence.glyphs).toHaveLength(execution.summary.glyphCount)
      expect(execution.evidence.glyphs.every((glyph) => (
        glyph.fontId === execution.shapeRequest.fontId
        && glyph.clusterStartOffset >= 0
        && glyph.clusterEndOffset > glyph.clusterStartOffset
        && glyph.clusterEndOffset <= execution.shapeRequest.text.length
      ))).toBe(true)
      expect("lineBoxes" in execution.evidence).toBe(false)
    }
    const thai = BUNDLE.shapeExecutions.find((execution) => (
      execution.shapeRequest.text === "รายงานเปรียบเทียบ OCR และการจัดโครงสร้างเอกสาร"
    ))
    expect(thai).toMatchObject({
      shapeRequest: { fontId: "ibm-plex-sans-thai-bold", fontSizePt: 24 },
      summary: { glyphCount: 46, missingGlyphCount: 0, zeroAdvanceGlyphCount: 4, repeatedClusterGlyphCount: 4 },
    })
  })

  it("keeps consumer, measurement, and shaping cache identities complete and separate", () => {
    expect(new Set(BUNDLE.consumers.map((consumer) => consumer.consumerId)).size).toBe(794)
    expect(new Set(BUNDLE.measurementVariants.map((variant) => variant.measurementVariantId)).size).toBe(421)
    expect(new Set(BUNDLE.shapeExecutions.map((execution) => execution.shapeRequest.shapeRequestId)).size).toBe(462)
    const measurementIds = new Set(BUNDLE.measurementVariants.map((variant) => variant.measurementVariantId))
    const shapeIds = new Set(BUNDLE.shapeExecutions.map((execution) => execution.shapeRequest.shapeRequestId))
    expect(BUNDLE.consumers.every((consumer) => measurementIds.has(consumer.measurementVariantId))).toBe(true)
    expect(BUNDLE.consumers.flatMap((consumer) => consumer.runBindings).every((run) => (
      run.shapeRequestId == null || shapeIds.has(run.shapeRequestId)
    ))).toBe(true)
    expect(BUNDLE.measurementVariants.flatMap((variant) => variant.shapeRuns).every((run) => (
      run.shapeRequestId == null || shapeIds.has(run.shapeRequestId)
    ))).toBe(true)
  })

  it("rebuilds deterministically without mutating the accepted source chain or raw evidence", () => {
    const input = clone(INPUT)
    const raw = clone(RAW)
    const beforeInput = JSON.stringify(input)
    const beforeRaw = JSON.stringify(raw)
    const plan = createFlowDocCanonicalReportNativeShapingPlanV1(input)
    expect(plan.planFingerprint).toBe(BUNDLE.planFingerprint)
    expect(createFlowDocCanonicalReportNativeShapingBundleV1(input, raw)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(beforeInput)
    expect(JSON.stringify(raw)).toBe(beforeRaw)
  }, 90_000)

  it("fails closed on source, raw evidence, execution, downstream, and fingerprint drift", () => {
    const sourceDrift = clone(BUNDLE)
    sourceDrift.sourceProjectionFingerprint = "0".repeat(64)
    expect(validate(sourceDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "source-projection-fingerprint" })],
    })

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).lineBoxes = "created"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })

    expect(validate({ ...clone(BUNDLE), lineBoxes: [] })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })

    const rawDrift = clone(RAW)
    rawDrift.executions[0].rawOutput.glyphs[0].glyphId += 1
    expect(validate(BUNDLE, rawDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "expected-bundle-build" })],
    })

    const glyphDrift = clone(BUNDLE)
    glyphDrift.shapeExecutions[0].evidence.glyphs[0].glyphId += 1
    glyphDrift.bundleFingerprint = "0".repeat(64)
    const glyphResult = validate(glyphDrift)
    expect(glyphResult.status).toBe("blocked")
    if (glyphResult.status !== "blocked") throw new Error("glyph evidence drift must block")
    expect(glyphResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))
    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 120_000)

  it("retains QA, package, and phase evidence while blocking line-box claims", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_NATIVE_SHAPING_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-D",
      status: "accepted-native-shaping-only",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      summary: BUNDLE.summary,
      executionGate: {
        status: "native-glyph-evidence-accepted-line-breaking-blocked",
        nativeShapingExecuted: true,
        allFontsHashVerified: true,
        missingGlyphCount: 0,
        lineBreakingExecuted: false,
        lineBoxesCreated: false,
        productionBinding: false,
      },
      boundary: { nativeRustybuzzShaping: "executed", lineBoxes: "not-run", pagination: "not-run" },
      nextPhase: "PDF-PILOT-08B-R2C-E concrete ICU4X and line-height binding for line-break execution",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-D native shaping accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-D Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-D Native Rustybuzz Shaping Execution")
    expect(readme).toContain("PDF canonical report native shaping")
    expect(packageJson.scripts["build:report-native-shaping"]).toBe(
      "node scripts/build-canonical-report-native-shaping.mjs",
    )
  })
})
