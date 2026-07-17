import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createFlowDocCanonicalReportLineBreakingBundleV1,
  createFlowDocCanonicalReportLineBreakingPlanV1,
  validateFlowDocCanonicalReportLineBreakingBundleV1,
  type FlowDocCanonicalReportLineBreakingBundleV1,
  type FlowDocCanonicalReportLineBreakingSourceInputV1,
  type FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
  type FlowDocCanonicalReportTypographyCalibrationManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportNativeShapingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT: FlowDocCanonicalReportLineBreakingSourceInputV1 = {
  nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json",
  ),
  typographyCalibration: readJson<FlowDocCanonicalReportTypographyCalibrationManifestV1>(
    "fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json",
  ),
}
const RAW = readJson<FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1>(
  "packages/pdf-renderer-pilot/fixtures/canonical-report-line-segmentation-raw.v1.json",
)
const BUNDLE = readJson<FlowDocCanonicalReportLineBreakingBundleV1>(
  "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json",
)

function validate(
  value: unknown,
  input: FlowDocCanonicalReportLineBreakingSourceInputV1 = INPUT,
  raw: FlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1 = RAW,
) {
  return validateFlowDocCanonicalReportLineBreakingBundleV1(value, input, raw)
}

describe("PDF-PILOT-08B-R2C-E canonical report line breaking", () => {
  it("pins the concrete native segmenter, calibrated line heights, and complete line-box evidence", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-E",
      sourceNativeShapingFingerprint: "d86f7f0eb9954cedcb8dd9bfc4b850feaf88ac61a406a1e11a8f5c9d186c093a",
      sourceTypographyCalibrationFingerprint: "9f3568dd46a1ff9c6a0e40cf8aed66135a63ae74436c92788788ad00726ba04f",
      sourceRawSegmentationFingerprint: "b934d7cec044266bc12ae208f9753b9e0f446effa5c9dac9698f136b8f632e94",
      planFingerprint: "351af50cbacbb2c1fdd0532399aebe4d836b9fba962336ad4c49db38be9b8a4b",
      bundleFingerprint: "2f4dee43082a5305d222d1e5a0eb5c7aec4a33fc1f98a9756ecbb2104282b13d",
      profileBinding: {
        status: "bound-native-line-breaking-only",
        sourceProfileSegmenterRevision: "icu4x-planned",
        nativeSegmenterRevision: "icu_segmenter-2.2.0",
        nativeSegmenterDataRevision: "icu_segmenter_data-2.2.0",
        lineBreakPolicy: "icu4x-auto-default-uax14-machine-identifier-delimiters-v1",
        productionBinding: false,
      },
      summary: {
        sourceConsumerCount: 794,
        measurementVariantCount: 421,
        emptyMeasurementVariantCount: 1,
        nativeSegmentExecutionCount: 364,
        deduplicatedSegmentExecutionCount: 56,
        lineHeightBindingCount: 6,
        measurementGlyphCount: 11996,
        coveredGlyphCount: 11996,
        breakOpportunityCount: 1903,
        tailoredBreakOpportunityCount: 226,
        lineCount: 457,
        multiLineMeasurementCount: 35,
        overflowLineCount: 0,
        maxLineCount: 3,
      },
    })
  }, 60_000)

  it("executes one concrete ICU4X segmentation per unique non-empty text", () => {
    expect(RAW.executions).toHaveLength(364)
    expect(new Set(RAW.executions.map((execution) => execution.rawOutput.text)).size).toBe(364)
    for (const execution of RAW.executions) {
      const raw = execution.rawOutput
      expect(raw).toMatchObject({
        source: "flowdoc-icu4x-native-line-segmenter",
        segmenterRevision: "icu_segmenter-2.2.0",
        dataRevision: "icu_segmenter_data-2.2.0",
      })
      expect(raw.textByteLength).toBe(Buffer.byteLength(raw.text, "utf8"))
      expect(raw.breakByteOffsets[0]).toBe(0)
      expect(raw.breakByteOffsets.at(-1)).toBe(raw.textByteLength)
      expect(raw.breakByteOffsets.every((offset, index, offsets) => (
        Number.isInteger(offset) && (index === 0 || offset > offsets[index - 1])
      ))).toBe(true)
    }
  })

  it("binds all six line heights to retained typography calibration evidence", () => {
    expect(BUNDLE.lineHeightBindings.map((binding) => ({
      styleKey: binding.styleKey,
      fontSizePt: binding.fontSizePt,
      lineHeightPt: binding.lineHeightPt,
      sourceFontSizePt: binding.sourceCalibration.sourceFontSizePt,
      method: binding.sourceCalibration.method,
    }))).toEqual([
      { styleKey: "report-title", fontSizePt: 24, lineHeightPt: 31, sourceFontSizePt: 25, method: "accepted-role-line-height-reuse" },
      { styleKey: "section-heading", fontSizePt: 16, lineHeightPt: 22, sourceFontSizePt: 16, method: "exact-font-size-role-match" },
      { styleKey: "report-body", fontSizePt: 10.5, lineHeightPt: 15, sourceFontSizePt: 10.5, method: "exact-font-size-role-match" },
      { styleKey: "report-caption", fontSizePt: 9, lineHeightPt: 12, sourceFontSizePt: 9, method: "exact-font-size-role-match" },
      { styleKey: "table-header", fontSizePt: 9.3, lineHeightPt: 12, sourceFontSizePt: 9.3, method: "exact-font-size-role-match" },
      { styleKey: "table-body", fontSizePt: 9.1, lineHeightPt: 11, sourceFontSizePt: 9.1, method: "exact-font-size-role-match" },
    ])
  })

  it("covers every shaped glyph exactly once with bounded contiguous line boxes", () => {
    for (const measurement of BUNDLE.measurements) {
      expect(measurement.lineBoxes).toHaveLength(measurement.summary.lineCount)
      expect(measurement.summary.coveredGlyphCount).toBe(measurement.summary.glyphCount)
      expect(measurement.summary.overflowLineCount).toBe(0)
      measurement.lineBoxes.forEach((line, index, lines) => {
        const previous = lines[index - 1]
        expect(line.lineIndex).toBe(index)
        expect(line.startOffset).toBe(previous?.endOffset ?? 0)
        expect(line.glyphStartIndex).toBe(previous?.glyphEndIndex ?? 0)
        expect(line.widthPt).toBeLessThanOrEqual(measurement.availableWidthPt + 0.000001)
        expect(line.heightPt).toBe(measurement.lineHeightPt)
        expect(line.yOffsetPt).toBe(index * measurement.lineHeightPt)
      })
      expect(measurement.lineBoxes.at(-1)?.endOffset).toBe(measurement.renderedText.length)
      expect(measurement.lineBoxes.at(-1)?.glyphEndIndex).toBe(measurement.summary.glyphCount)
      if (measurement.renderedText.length > 0) {
        expect(measurement.breakOpportunities.at(-1)).toEqual({
          offset: measurement.renderedText.length,
          kind: "mandatory",
        })
        expect(measurement.lineSummaries).toHaveLength(measurement.lineBoxes.length)
      }
    }
  })

  it("wraps Thai through ICU4X and long machine identifiers through explicit delimiter tailoring", () => {
    const title = BUNDLE.measurements.find((measurement) => measurement.styleKey === "report-title")
    expect(title).toMatchObject({
      renderedText: "รายงานเปรียบเทียบ OCR และการจัดโครงสร้างเอกสาร",
      availableWidthPt: 467.95,
      lineHeightPt: 31,
      summary: { lineCount: 2, overflowLineCount: 0, tailoredBreakOpportunityCount: 0 },
      lineBoxes: [
        { startOffset: 0, endOffset: 31, widthPt: 366.768 },
        { startOffset: 31, endOffset: 46, widthPt: 182.472 },
      ],
    })

    const identifier = BUNDLE.measurements.find((measurement) => (
      measurement.renderedText === "goods_shipment.detail.product_info.net_weight.weight"
      && measurement.availableWidthPt === 123.026
    ))
    expect(identifier).toMatchObject({
      summary: {
        lineCount: 3,
        overflowLineCount: 0,
        tailoredBreakOpportunityCount: 7,
      },
      lineBoxes: [
        { startOffset: 0, endOffset: 22, widthPt: 95.6865 },
        { startOffset: 22, endOffset: 46, widthPt: 102.6753 },
        { startOffset: 46, endOffset: 52, widthPt: 27.3819 },
      ],
    })
    expect(identifier?.breakOpportunities.slice(0, -1).every((item) => item.kind === "punctuation")).toBe(true)
  })

  it("retains one empty table cell as a real zero-width line without engine execution", () => {
    const empty = BUNDLE.measurements.filter((measurement) => measurement.summary.emptyTextPolicyApplied)
    expect(empty).toEqual([expect.objectContaining({
      renderedText: "",
      lineHeightPt: 11,
      segmentRequestId: null,
      breakOpportunities: [],
      lineBoxes: [{
        lineIndex: 0,
        startOffset: 0,
        endOffset: 0,
        widthPt: 0,
        heightPt: 11,
        yOffsetPt: 0,
        glyphStartIndex: 0,
        glyphEndIndex: 0,
      }],
      summary: expect.objectContaining({ glyphCount: 0, lineCount: 1 }),
    })])
  })

  it("rebuilds deterministically without mutating native or raw evidence", () => {
    const input = clone(INPUT)
    const raw = clone(RAW)
    const beforeInput = JSON.stringify(input)
    const beforeRaw = JSON.stringify(raw)
    expect(createFlowDocCanonicalReportLineBreakingPlanV1(input).planFingerprint).toBe(BUNDLE.planFingerprint)
    expect(createFlowDocCanonicalReportLineBreakingBundleV1(input, raw)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(beforeInput)
    expect(JSON.stringify(raw)).toBe(beforeRaw)
  }, 60_000)

  it("fails closed on source, raw evidence, execution, downstream, and fingerprint drift", () => {
    const sourceDrift = clone(INPUT)
    sourceDrift.nativeShaping.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const rawDrift = clone(RAW)
    rawDrift.executions[0].rawOutput.breakByteOffsets[1] += 1
    expect(validate(BUNDLE, INPUT, rawDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "expected-bundle-build" })],
    })

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).pagination = "executed"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })

    expect(validate({ ...clone(BUNDLE), pages: [] })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })

    const lineDrift = clone(BUNDLE)
    lineDrift.measurements[0].lineBoxes[0].widthPt += 1
    lineDrift.bundleFingerprint = "0".repeat(64)
    const lineResult = validate(lineDrift)
    expect(lineResult.status).toBe("blocked")
    if (lineResult.status !== "blocked") throw new Error("line-box drift must block")
    expect(lineResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))
    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 60_000)

  it("retains QA, package, and phase evidence while blocking vertical layout claims", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-line-breaking-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_LINE_BREAKING_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-E",
      status: "accepted-native-line-box-evidence-only",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      summary: BUNDLE.summary,
      executionGate: {
        status: "native-line-box-evidence-accepted-vertical-layout-blocked",
        nativeIcu4xSegmentationExecuted: true,
        lineHeightsBound: true,
        everyMeasurementGlyphCoveredExactlyOnce: true,
        lineBoxesCreated: true,
        productionBinding: false,
      },
      boundary: { nativeIcu4xSegmentation: "executed", lineBoxes: "created", pagination: "not-run" },
      nextPhase: "PDF-PILOT-08B-R2C-F line-box acceptance and vertical block/table composition readiness",
    })
    expect(qa.overflowMeasurements).toEqual([])
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-E native line-box evidence accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-E Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-E Native ICU4X Line Breaking")
    expect(readme).toContain("PDF canonical report native line breaking")
    expect(packageJson.scripts["build:report-line-breaking"]).toBe(
      "node scripts/build-canonical-report-line-breaking.mjs",
    )
  })
})
