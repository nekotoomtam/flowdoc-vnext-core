import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextLayoutUnitPolicyV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockV4MeasurementRequest,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function clusters(
  text: string,
  startOffset: number,
  advances: number[],
): VNextTextBlockResolvedShapingRunV1["clusters"] {
  expect(advances).toHaveLength(text.length)
  return [...text].map((_, index) => ({
    index,
    renderStartOffset: startOffset + index,
    renderEndOffset: startOffset + index + 1,
    advanceLayoutUnit: advances[index]!,
  }))
}

function measurementFixture(): VNextTextBlockV4MeasurementRequest {
  return {
    documentId: "document-mr1",
    instanceRevision: 7,
    sectionId: "section-main",
    textBlockId: "text-block-mixed",
    availableWidthPt: 100,
    measurementProfileId: "measurement-profile-mr1",
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

function requestFixture(): VNextTextBlockMultiRunLayoutRequestV1 {
  const measurement = measurementFixture()
  return {
    layoutId: "layout-mixed-line-001",
    measurement,
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: 100_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: {
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
    },
    fontFaces: [
      {
        fontFaceId: "sarabun-regular",
        fontFamily: "Sarabun",
        fontSha256: "a".repeat(64),
        weight: 400,
        style: "normal",
        unitsPerEm: 1_000,
        ascentFontUnit: 800,
        descentFontUnit: -200,
        lineGapFontUnit: 100,
      },
      {
        fontFaceId: "sarabun-bold",
        fontFamily: "Sarabun",
        fontSha256: "b".repeat(64),
        weight: 700,
        style: "normal",
        unitsPerEm: 1_000,
        ascentFontUnit: 800,
        descentFontUnit: -200,
        lineGapFontUnit: 100,
      },
    ],
    shapingRuns: [
      {
        shapingRunId: "run-regular-a",
        renderStartOffset: 0,
        renderEndOffset: 1,
        text: "A",
        styleKey: "paragraph-body:regular-10",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 10_000_000,
        textColor: "202020",
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: clusters("A", 0, [5_000_000]),
      },
      {
        shapingRunId: "run-bold-b",
        renderStartOffset: 1,
        renderEndOffset: 2,
        text: "B",
        styleKey: "paragraph-body:bold-24",
        fontFaceId: "sarabun-bold",
        fontSizeLayoutUnit: 24_000_000,
        textColor: "202020",
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: clusters("B", 1, [14_400_000]),
      },
      {
        shapingRunId: "run-field-c",
        renderStartOffset: 2,
        renderEndOffset: 3,
        text: "C",
        styleKey: "paragraph-body",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 12_000_000,
        textColor: "202020",
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: clusters("C", 2, [6_000_000]),
      },
    ],
    breakOffsets: [0, 3],
    lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }],
  }
}

function accepted(input: VNextTextBlockMultiRunLayoutRequestV1) {
  const result = acceptVNextTextBlockMultiRunLayoutV1(input)
  if (result.status !== "accepted") {
    throw new Error(result.issues.map((item) => `${item.code}: ${item.message}`).join("\n"))
  }
  return result
}

describe("text-block multi-run layout v1", () => {
  it("positions mixed font sizes on one shared baseline using exact integer metrics", () => {
    const input = requestFixture()
    const before = JSON.stringify(input)
    const result = accepted(input)

    expect(result).toMatchObject({
      source: "vnext-text-block-multi-run-layout-v1",
      contractVersion: 1,
      status: "accepted",
      contracts: {
        geometryUnit: "micro-point-integer",
        lineBreaks: "external-evidence-core-validated",
        fragmentPositioning: "core-derived-from-cluster-advances",
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        coreLoadsFontBytes: false,
        coreExecutesShaping: false,
        productionBinding: false,
      },
      summary: {
        shapingRunCount: 3,
        clusterCount: 3,
        lineCount: 1,
        fragmentCount: 3,
        sourceSegmentCount: 3,
        widthLayoutUnit: 25_400_000,
        heightLayoutUnit: 24_000_000,
      },
    })
    expect(result.lines[0]).toMatchObject({
      widthLayoutUnit: 25_400_000,
      naturalAscentLayoutUnit: 19_200_000,
      naturalDescentLayoutUnit: 4_800_000,
      naturalHeightLayoutUnit: 24_000_000,
      leadingBeforeLayoutUnit: 0,
      leadingAfterLayoutUnit: 0,
      heightLayoutUnit: 24_000_000,
      baselineOffsetLayoutUnit: 19_200_000,
    })
    expect(result.lines[0]!.fragments.map((fragment) => ({
      text: fragment.text,
      x: fragment.xLayoutUnit,
      advance: fragment.advanceLayoutUnit,
      size: fragment.fontSizeLayoutUnit,
      ascent: fragment.ascentLayoutUnit,
      descent: fragment.descentLayoutUnit,
    }))).toEqual([
      { text: "A", x: 0, advance: 5_000_000, size: 10_000_000, ascent: 8_000_000, descent: 2_000_000 },
      { text: "B", x: 5_000_000, advance: 14_400_000, size: 24_000_000, ascent: 19_200_000, descent: 4_800_000 },
      { text: "C", x: 19_400_000, advance: 6_000_000, size: 12_000_000, ascent: 9_600_000, descent: 2_400_000 },
    ])
    expect(result.lines[0]!.fragments[2]!.sourceSegments[0]).toMatchObject({
      inlineId: "field-c",
      kind: "resolved-field",
      fieldKey: "customer.initial",
      renderedText: "C",
    })
    expect(result.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(input)).toBe(before)
    expect(acceptVNextTextBlockMultiRunLayoutV1(clone(input))).toEqual(result)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("allows one compatible shaping run to retain text and resolved-field source segments", () => {
    const input = requestFixture()
    input.measurement.renderedText = "AB"
    input.measurement.runs = [
      {
        inlineId: "source-text",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
        styleKey: "paragraph-body",
      },
      {
        inlineId: "source-field",
        kind: "resolved-field",
        fieldKey: "customer.initial",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "B",
        styleKey: "paragraph-body",
      },
    ]
    input.shapingRuns = [{
      shapingRunId: "coalesced-compatible-run",
      renderStartOffset: 0,
      renderEndOffset: 2,
      text: "AB",
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: clusters("AB", 0, [6_000_000, 6_000_000]),
    }]
    input.breakOffsets = [0, 2]
    input.lines = [{ index: 0, renderStartOffset: 0, renderEndOffset: 2 }]

    const result = accepted(input)
    expect(result.lines[0]!.fragments).toHaveLength(1)
    expect(result.lines[0]!.fragments[0]!.sourceSegments.map((segment) => [
      segment.inlineId,
      segment.kind,
      segment.renderStartOffset,
      segment.renderEndOffset,
    ])).toEqual([
      ["source-text", "text", 0, 1],
      ["source-field", "resolved-field", 1, 2],
    ])
  })

  it("splits one shaping run into positioned line fragments only at cluster boundaries", () => {
    const input = requestFixture()
    input.measurement.renderedText = "AB"
    input.measurement.runs = [{
      inlineId: "source-ab",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: 2,
      renderedText: "AB",
      styleKey: "paragraph-body",
    }]
    input.shapingRuns = [{
      shapingRunId: "run-across-lines",
      renderStartOffset: 0,
      renderEndOffset: 2,
      text: "AB",
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: clusters("AB", 0, [5_000_000, 6_000_000]),
    }]
    input.breakOffsets = [0, 1, 2]
    input.lines = [
      { index: 0, renderStartOffset: 0, renderEndOffset: 1 },
      { index: 1, renderStartOffset: 1, renderEndOffset: 2 },
    ]

    const result = accepted(input)
    expect(result.lines.map((line) => ({
      text: line.text,
      y: line.yOffsetLayoutUnit,
      width: line.widthLayoutUnit,
      fragmentText: line.fragments[0]?.text,
      fragmentX: line.fragments[0]?.xLayoutUnit,
    }))).toEqual([
      { text: "A", y: 0, width: 5_000_000, fragmentText: "A", fragmentX: 0 },
      { text: "B", y: 14_000_000, width: 6_000_000, fragmentText: "B", fragmentX: 0 },
    ])
  })

  it("enforces hard breaks without emitting a paint fragment for the break text", () => {
    const input = requestFixture()
    input.measurement.renderedText = "A\nB"
    input.measurement.runs = [
      { inlineId: "a", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "A" },
      { inlineId: "break", kind: "hard-break", renderStartOffset: 1, renderEndOffset: 2, renderedText: "\n" },
      { inlineId: "b", kind: "text", renderStartOffset: 2, renderEndOffset: 3, renderedText: "B" },
    ]
    input.shapingRuns = [
      {
        shapingRunId: "run-a",
        renderStartOffset: 0,
        renderEndOffset: 1,
        text: "A",
        styleKey: "paragraph-body",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 12_000_000,
        textColor: "202020",
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: clusters("A", 0, [6_000_000]),
      },
      {
        shapingRunId: "run-b",
        renderStartOffset: 2,
        renderEndOffset: 3,
        text: "B",
        styleKey: "paragraph-body",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 12_000_000,
        textColor: "202020",
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: clusters("B", 2, [6_000_000]),
      },
    ]
    input.breakOffsets = [0, 2, 3]
    input.lines = [
      { index: 0, renderStartOffset: 0, renderEndOffset: 2 },
      { index: 1, renderStartOffset: 2, renderEndOffset: 3 },
    ]

    const result = accepted(input)
    expect(result.lines.map((line) => line.fragments.map((fragment) => fragment.text))).toEqual([["A"], ["B"]])
    expect(result.lines[0]!.sourceSegments.map((segment) => segment.kind)).toEqual(["text", "hard-break"])

    input.lines = [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }]
    const crossed = acceptVNextTextBlockMultiRunLayoutV1(input)
    expect(crossed).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "mandatory-break-crossed" })]),
    })
  })

  it("fails closed on policy, cluster, coverage, width, image, and production boundary violations", () => {
    const policyMismatch = requestFixture()
    policyMismatch.layoutUnitPolicyFingerprint = "sha256:" + "0".repeat(64)
    expect(acceptVNextTextBlockMultiRunLayoutV1(policyMismatch)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "layout-unit-policy-mismatch" })]),
    })

    const clusterSplit = requestFixture()
    clusterSplit.measurement.renderedText = "AB"
    clusterSplit.measurement.runs = [{
      inlineId: "ab",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: 2,
      renderedText: "AB",
    }]
    clusterSplit.shapingRuns = [{
      shapingRunId: "ligature-ab",
      renderStartOffset: 0,
      renderEndOffset: 2,
      text: "AB",
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: [{ index: 0, renderStartOffset: 0, renderEndOffset: 2, advanceLayoutUnit: 10_000_000 }],
    }]
    clusterSplit.breakOffsets = [0, 1, 2]
    clusterSplit.lines = [
      { index: 0, renderStartOffset: 0, renderEndOffset: 1 },
      { index: 1, renderStartOffset: 1, renderEndOffset: 2 },
    ]
    expect(acceptVNextTextBlockMultiRunLayoutV1(clusterSplit)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "line-boundary-inside-cluster" })]),
    })

    const coverageGap = requestFixture()
    coverageGap.shapingRuns = coverageGap.shapingRuns.slice(0, 2)
    expect(acceptVNextTextBlockMultiRunLayoutV1(coverageGap)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "shaping-coverage-mismatch" })]),
    })

    const overflow = requestFixture()
    overflow.measurement.availableWidthPt = 20
    overflow.availableWidthLayoutUnit = 20_000_000
    expect(acceptVNextTextBlockMultiRunLayoutV1(overflow)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "line-width-overflow" })]),
    })

    const image = requestFixture()
    image.measurement.renderedText = "\uFFFC"
    image.measurement.runs = [{
      inlineId: "inline-image",
      kind: "inline-image",
      renderStartOffset: 0,
      renderEndOffset: 1,
      renderedText: "\uFFFC",
    }]
    image.shapingRuns = []
    image.breakOffsets = [0, 1]
    image.lines = [{ index: 0, renderStartOffset: 0, renderEndOffset: 1 }]
    expect(acceptVNextTextBlockMultiRunLayoutV1(image)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-image-unsupported" })]),
    })

    const production = requestFixture()
    production.bindProductionLayout = true
    expect(acceptVNextTextBlockMultiRunLayoutV1(production)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "production-binding-forbidden" })]),
    })
  })

  it("keeps Core independent from shaping engines, DOM, renderers, and font byte loading", () => {
    const contractSource = readFileSync(
      resolve(process.cwd(), "src/layout/textBlockMultiRunLayoutContractV1.ts"),
      "utf8",
    )
    const acceptanceSource = readFileSync(
      resolve(process.cwd(), "src/layout/textBlockMultiRunLayoutV1.ts"),
      "utf8",
    )
    const source = `${contractSource}\n${acceptanceSource}`
    const doc = readFileSync(
      resolve(process.cwd(), "docs/LIVE_DRAFT_MR1_MULTI_RUN_LAYOUT_CONTRACT.md"),
      "utf8",
    )
    const handoff = readFileSync(
      resolve(process.cwd(), "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"),
      "utf8",
    )

    expect(source).toContain("external-evidence-core-validated")
    expect(source).toContain("coreExecutesShaping: false")
    expect(source).not.toMatch(/node:fs|node:http|node:https|fetch\(/u)
    expect(source).not.toMatch(/canvas|pdfkit|jspdf|pdf-lib|fontkit/u)
    expect(source).not.toMatch(/rustybuzz|harfbuzz|icu4x|wasm-bindgen/u)
    expect(source).not.toMatch(/document\.createElement|window\.|localStorage|indexedDB/u)
    expect(source).not.toMatch(/readFile|writeFile|fontBytes/u)
    expect(doc).toContain("10 pt Regular, 24 pt Bold, and a 12 pt")
    expect(doc).toContain("does not yet prove")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Core Multi-Run Layout Contract")
  })
})
