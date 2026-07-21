import { describe, expect, it } from "vitest"
import type { VNextTextBlockV4MeasurementRequest } from "../src/index.js"
import {
  createFlowDocTextEngineMultiRunLayoutV1,
  profileFlowDocTextEngineMultiRunLayoutV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayout.js"
import { analyzeFlowDocTextEngineIncrementalReflowV1 } from
  "../packages/text-engine-rust-wasm/src/incrementalReflowAnalysis.js"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function measurementFixture(): VNextTextBlockV4MeasurementRequest {
  return {
    documentId: "document-mr1-engine",
    instanceRevision: 11,
    sectionId: "section-main",
    textBlockId: "text-block-engine-mixed",
    availableWidthPt: 100,
    measurementProfileId: "measurement-profile-mr1-engine",
    styleKey: "paragraph-body",
    renderedText: "ABC",
    runs: [
      {
        inlineId: "regular-a",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
        styleKey: "paragraph-body",
        localStyle: { fontSize: { value: 10, unit: "pt" } },
      },
      {
        inlineId: "bold-b",
        kind: "text",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "B",
        styleKey: "paragraph-body",
        localStyle: { fontSize: { value: 24, unit: "pt" }, fontWeight: "bold" },
      },
      {
        inlineId: "field-c",
        kind: "resolved-field",
        fieldKey: "customer.initial",
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "C",
        styleKey: "paragraph-body",
      },
    ],
  }
}

function inputFixture(): FlowDocTextEngineMultiRunLayoutInputV1 {
  return {
    layoutId: "engine-layout-mixed-001",
    measurement: measurementFixture(),
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: {
      styleKey: "paragraph-body",
      runStyle: {
        fontFamilyKey: "sarabun",
        fontSize: { value: 12, unit: "pt" },
        textColor: "202020",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
    },
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => clone(face)),
  }
}

function fakeRuntime(options: {
  everyScalarBreak?: boolean
  metricsDelta?: number
  missingGlyph?: boolean
} = {}): FlowDocTextEngineMultiRunRuntimeV1 {
  return {
    runtimeKind: "test-mr1",
    shape({ text, fontFace }) {
      const bold = fontFace.weight === 700
      let byteOffset = 0
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-shape-facts-v1",
        text,
        fontFaceId: fontFace.fontFaceId,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        unitsPerEm: fontFace.unitsPerEm,
        ascentFontUnit: fontFace.ascentFontUnit + (options.metricsDelta ?? 0),
        descentFontUnit: fontFace.descentFontUnit,
        lineGapFontUnit: fontFace.lineGapFontUnit,
        glyphs: [...text].map((scalar, index) => {
          const cluster = byteOffset
          byteOffset += new TextEncoder().encode(scalar).length
          return {
            index,
            glyphId: options.missingGlyph === true && index === 0 ? 0 : 10 + index,
            cluster,
            xAdvance: bold ? 600 : 500,
            yAdvance: 0,
            xOffset: 0,
            yOffset: 0,
          }
        }),
        summary: {
          glyphCount: [...text].length,
          missingGlyphCount: options.missingGlyph === true ? 1 : 0,
          totalAdvanceFontUnits: [...text].length * (bold ? 600 : 500),
        },
      }
    },
    segment(text) {
      const breakUtf16Offsets = options.everyScalarBreak === true
        ? [0, ...[...text].map((_, index) => index + 1)]
        : [0, text.length]
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-segmentation-facts-v1",
        text,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        breakByteOffsets: [...breakUtf16Offsets],
        breakUtf16Offsets,
        summary: { breakCount: breakUtf16Offsets.length },
      }
    },
  }
}

describe("MR1 external multi-run layout adapter", () => {
  it("profiles diagnostic phases without changing deterministic layout output", () => {
    const input = inputFixture()
    let tick = 0
    const profiled = profileFlowDocTextEngineMultiRunLayoutV1(
      input,
      fakeRuntime(),
      { now: () => tick++ },
    )

    expect(profiled.result).toEqual(createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime()))
    expect(profiled.completedPhases).toEqual([
      "input-and-style-resolution",
      "shaping",
      "segmentation",
      "line-breaking",
      "core-acceptance-and-fingerprint",
      "adapter-fingerprint",
    ])
    expect(Object.values(profiled.phaseDurationMs)).toEqual([1, 1, 1, 1, 1, 1])
    expect(profiled.totalDurationMs).toBe(7)
    expect(profiled.work).toMatchObject({
      renderedUtf16Length: 3,
      sourceRunCount: 3,
      shapingRunCount: 3,
      clusterCount: 3,
      lineCount: 1,
    })
    expect(profiled.contracts).toEqual({
      timingIsDiagnosticOnly: true,
      timingAffectsLayoutFingerprint: false,
      fullLayoutOracle: true,
      productionBinding: false,
    })
  })

  it("resolves Text Run overrides, shapes three runs, and lets Core derive the real-font shared baseline", () => {
    const input = inputFixture()
    const before = JSON.stringify(input)
    const result = createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime())

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.summary).toEqual({
      sourceRunCount: 3,
      effectiveRunCount: 3,
      shapingRunCount: 3,
      clusterCount: 3,
      lineCount: 1,
      fontFaceCount: 2,
      runtimeShapeCallCount: 3,
      runtimeSegmentationCallCount: 1,
    })
    expect(result.request.shapingRuns.map((run) => ({
      text: run.text,
      face: run.fontFaceId,
      size: run.fontSizeLayoutUnit,
      advance: run.clusters[0]?.advanceLayoutUnit,
    }))).toEqual([
      { text: "A", face: "sarabun-regular", size: 10_000_000, advance: 5_000_000 },
      { text: "B", face: "sarabun-bold", size: 24_000_000, advance: 14_400_000 },
      { text: "C", face: "sarabun-regular", size: 12_000_000, advance: 6_000_000 },
    ])
    expect(result.layout.lines[0]).toMatchObject({
      widthLayoutUnit: 25_400_000,
      naturalAscentLayoutUnit: 25_632_000,
      naturalDescentLayoutUnit: 5_568_000,
      naturalHeightLayoutUnit: 31_200_000,
      baselineOffsetLayoutUnit: 25_632_000,
      heightLayoutUnit: 31_200_000,
    })
    expect(result.layout.lines[0]!.fragments.map((fragment) => fragment.xLayoutUnit)).toEqual([
      0,
      5_000_000,
      19_400_000,
    ])
    expect(result.layout.lines[0]!.fragments[2]!.sourceSegments[0]).toMatchObject({
      kind: "resolved-field",
      fieldKey: "customer.initial",
    })
    expect(result.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(input)).toBe(before)
    expect(createFlowDocTextEngineMultiRunLayoutV1(clone(input), fakeRuntime())).toEqual(result)
  })

  it("coalesces compatible Text and field sources before shaping", () => {
    const input = inputFixture()
    input.measurement.renderedText = "AB"
    input.measurement.runs = [
      {
        inlineId: "text-a",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
        styleKey: "paragraph-body",
      },
      {
        inlineId: "field-b",
        kind: "resolved-field",
        fieldKey: "customer.initial",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "B",
        styleKey: "paragraph-body",
      },
    ]

    const result = createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime())
    expect(result).toMatchObject({
      status: "accepted",
      summary: { sourceRunCount: 2, effectiveRunCount: 1, shapingRunCount: 1, runtimeShapeCallCount: 1 },
    })
    if (result.status !== "accepted") throw new Error("coalesced fixture blocked")
    expect(result.request.shapingRuns[0]).toMatchObject({ text: "AB", renderStartOffset: 0, renderEndOffset: 2 })
    expect(result.layout.lines[0]!.fragments[0]!.sourceSegments.map((segment) => segment.kind)).toEqual([
      "text",
      "resolved-field",
    ])
  })

  it("wraps at segmenter and cluster boundaries without losing mixed-run advances", () => {
    const input = inputFixture()
    input.measurement.availableWidthPt = 15
    const result = createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime({ everyScalarBreak: true }))

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("wrapped fixture blocked")
    expect(result.request.lines).toEqual([
      { index: 0, renderStartOffset: 0, renderEndOffset: 1 },
      { index: 1, renderStartOffset: 1, renderEndOffset: 2 },
      { index: 2, renderStartOffset: 2, renderEndOffset: 3 },
    ])
    expect(result.layout.lines.map((line) => line.widthLayoutUnit)).toEqual([5_000_000, 14_400_000, 6_000_000])
  })

  it("segments the complete block while shaping paintable runs around a mandatory hard break", () => {
    const input = inputFixture()
    input.measurement.renderedText = "A\nB"
    input.measurement.runs = [
      { inlineId: "a", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "A" },
      { inlineId: "break", kind: "hard-break", renderStartOffset: 1, renderEndOffset: 2, renderedText: "\n" },
      { inlineId: "b", kind: "text", renderStartOffset: 2, renderEndOffset: 3, renderedText: "B" },
    ]
    const result = createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime({ everyScalarBreak: true }))

    expect(result).toMatchObject({
      status: "accepted",
      summary: { sourceRunCount: 3, effectiveRunCount: 2, shapingRunCount: 2, lineCount: 2 },
    })
    if (result.status !== "accepted") throw new Error("hard-break fixture blocked")
    expect(result.request.lines).toEqual([
      { index: 0, renderStartOffset: 0, renderEndOffset: 2 },
      { index: 1, renderStartOffset: 2, renderEndOffset: 3 },
    ])
    expect(result.layout.lines.map((line) => line.fragments.map((fragment) => fragment.text))).toEqual([["A"], ["B"]])
  })

  it("fails closed on production, direction, style, face, metric, and missing-glyph violations", () => {
    const production = inputFixture()
    production.bindProductionLayout = true
    expect(createFlowDocTextEngineMultiRunLayoutV1(production, fakeRuntime())).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "production-binding-forbidden" })]),
    })

    const rtl = inputFixture()
    rtl.measurement.renderedText = "ا"
    rtl.measurement.runs = [{
      inlineId: "rtl",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: 1,
      renderedText: "ا",
    }]
    expect(createFlowDocTextEngineMultiRunLayoutV1(rtl, fakeRuntime())).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "direction-unsupported" })]),
    })

    const decorated = inputFixture()
    decorated.measurement.runs[0]!.localStyle = { textDecoration: "underline" }
    expect(createFlowDocTextEngineMultiRunLayoutV1(decorated, fakeRuntime())).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "decoration-unsupported" })]),
    })

    const missingFace = inputFixture()
    missingFace.fontFaces = missingFace.fontFaces.filter((face) => face.weight !== 700)
    expect(createFlowDocTextEngineMultiRunLayoutV1(missingFace, fakeRuntime())).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "font-face-unavailable" })]),
    })

    expect(createFlowDocTextEngineMultiRunLayoutV1(inputFixture(), fakeRuntime({ metricsDelta: 1 }))).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "runtime-font-metrics-mismatch" })]),
    })
    expect(createFlowDocTextEngineMultiRunLayoutV1(inputFixture(), fakeRuntime({ missingGlyph: true }))).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "runtime-missing-glyph" })]),
    })
  })

  it("proves a bounded restart and exact suffix reconvergence only against full-layout oracles", () => {
    const previousInput = inputFixture()
    const previousText = "ab".repeat(30)
    previousInput.measurement.renderedText = previousText
    previousInput.measurement.availableWidthPt = 12
    previousInput.measurement.runs = [{
      inlineId: "long-run",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: previousText.length,
      renderedText: previousText,
      styleKey: "paragraph-body",
    }]
    const nextInput = clone(previousInput)
    const editOffset = 12
    const insertedText = "ab"
    const nextText = previousText.slice(0, editOffset) + insertedText + previousText.slice(editOffset)
    nextInput.measurement.instanceRevision += 1
    nextInput.measurement.renderedText = nextText
    nextInput.measurement.runs[0]!.renderEndOffset = nextText.length
    nextInput.measurement.runs[0]!.renderedText = nextText
    const previous = createFlowDocTextEngineMultiRunLayoutV1(previousInput, fakeRuntime({ everyScalarBreak: true }))
    const nextOracle = createFlowDocTextEngineMultiRunLayoutV1(nextInput, fakeRuntime({ everyScalarBreak: true }))
    if (previous.status !== "accepted" || nextOracle.status !== "accepted") throw new Error("oracle fixture blocked")

    const analysis = analyzeFlowDocTextEngineIncrementalReflowV1({
      previous,
      nextOracle,
      edit: {
        previousStartOffset: editOffset,
        previousEndOffset: editOffset,
        nextEndOffset: editOffset + insertedText.length,
      },
    })

    expect(analysis).toMatchObject({
      status: "window-proved",
      contracts: {
        execution: "full-layout-oracle-analysis-only",
        fullLayoutOracleRequired: true,
        mayPublishLayout: false,
        productionBinding: false,
      },
      checkpoint: { offsetDelta: 2, stableLineCount: 2 },
      work: {
        exactIntegerGeometry: true,
        reusedPrefixLineCount: expect.any(Number),
        reflowedNextLineCount: expect.any(Number),
        reusedSuffixLineCount: expect.any(Number),
      },
    })
    if (analysis.status !== "window-proved") throw new Error(analysis.fallback.message)
    expect(analysis.work.reusedPrefixLineCount).toBeGreaterThan(0)
    expect(analysis.work.reusedSuffixLineCount).toBeGreaterThan(2)
    expect(analysis.work.reflowedNextUtf16Length).toBeLessThanOrEqual(2_048)
    expect(analyzeFlowDocTextEngineIncrementalReflowV1({
      previous,
      nextOracle,
      edit: analysis.edit,
    })).toEqual(analysis)
  })

  it("falls back for an edited hard break and for a window beyond policy", () => {
    const previousInput = inputFixture()
    previousInput.measurement.renderedText = "A\nB"
    previousInput.measurement.runs = [
      { inlineId: "a", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "A" },
      { inlineId: "break", kind: "hard-break", renderStartOffset: 1, renderEndOffset: 2, renderedText: "\n" },
      { inlineId: "b", kind: "text", renderStartOffset: 2, renderEndOffset: 3, renderedText: "B" },
    ]
    const nextInput = clone(previousInput)
    nextInput.measurement.instanceRevision += 1
    nextInput.measurement.renderedText = "A B"
    nextInput.measurement.runs = [{
      inlineId: "all",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: 3,
      renderedText: "A B",
    }]
    const previous = createFlowDocTextEngineMultiRunLayoutV1(previousInput, fakeRuntime({ everyScalarBreak: true }))
    const nextOracle = createFlowDocTextEngineMultiRunLayoutV1(nextInput, fakeRuntime({ everyScalarBreak: true }))
    if (previous.status !== "accepted" || nextOracle.status !== "accepted") throw new Error("fallback fixture blocked")
    expect(analyzeFlowDocTextEngineIncrementalReflowV1({
      previous,
      nextOracle,
      edit: { previousStartOffset: 1, previousEndOffset: 2, nextEndOffset: 2 },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "hard-break-edited" } })

    const longPreviousInput = inputFixture()
    const longPreviousText = "ab".repeat(30)
    longPreviousInput.measurement.renderedText = longPreviousText
    longPreviousInput.measurement.availableWidthPt = 12
    longPreviousInput.measurement.runs = [{
      inlineId: "long-run",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: longPreviousText.length,
      renderedText: longPreviousText,
    }]
    const longNextInput = clone(longPreviousInput)
    longNextInput.measurement.instanceRevision += 1
    longNextInput.measurement.renderedText = `ab${longPreviousText}`
    longNextInput.measurement.runs[0]!.renderEndOffset += 2
    longNextInput.measurement.runs[0]!.renderedText = longNextInput.measurement.renderedText
    const longPrevious = createFlowDocTextEngineMultiRunLayoutV1(longPreviousInput, fakeRuntime({ everyScalarBreak: true }))
    const longNext = createFlowDocTextEngineMultiRunLayoutV1(longNextInput, fakeRuntime({ everyScalarBreak: true }))
    if (longPrevious.status !== "accepted" || longNext.status !== "accepted") throw new Error("bounded fixture blocked")
    expect(analyzeFlowDocTextEngineIncrementalReflowV1({
      previous: longPrevious,
      nextOracle: longNext,
      edit: { previousStartOffset: 0, previousEndOffset: 0, nextEndOffset: 2 },
      policy: { stableLineCount: 2, maximumReflowLineCount: 32, maximumReflowUtf16Length: 1 },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "reflow-window-exceeded" } })
  })
})
