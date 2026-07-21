import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextLayoutUnitPolicyV1,
  projectVNextTextBlockMultiRunDisplayListV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockMultiRunLayoutResultV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function requestFixture(): VNextTextBlockMultiRunLayoutRequestV1 {
  return {
    layoutId: "layout-mixed-line-001",
    measurement: {
      documentId: "document-mr1",
      instanceRevision: 7,
      sectionId: "section-main",
      textBlockId: "text-block-mixed",
      availableWidthPt: 100,
      measurementProfileId: "measurement-profile-mr1",
      styleKey: "paragraph-body",
      renderedText: "ABC",
      runs: [{
        inlineId: "regular-a",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
        styleKey: "paragraph-body",
        localStyle: { fontSize: { value: 10, unit: "pt" } },
      }, {
        inlineId: "bold-b",
        kind: "text",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "B",
        styleKey: "paragraph-body",
        localStyle: { fontSize: { value: 24, unit: "pt" }, fontWeight: "bold" },
      }, {
        inlineId: "field-c",
        kind: "resolved-field",
        fieldKey: "customer.initial",
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "C",
        styleKey: "paragraph-body",
      }],
    },
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: 100_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: {
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
    },
    fontFaces: [{
      fontFaceId: "sarabun-regular",
      fontFamily: "Sarabun",
      fontSha256: "a".repeat(64),
      weight: 400,
      style: "normal",
      unitsPerEm: 1_000,
      ascentFontUnit: 800,
      descentFontUnit: -200,
      lineGapFontUnit: 100,
    }, {
      fontFaceId: "sarabun-bold",
      fontFamily: "Sarabun",
      fontSha256: "b".repeat(64),
      weight: 700,
      style: "normal",
      unitsPerEm: 1_000,
      ascentFontUnit: 800,
      descentFontUnit: -200,
      lineGapFontUnit: 100,
    }],
    shapingRuns: [{
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
      clusters: [{ index: 0, renderStartOffset: 0, renderEndOffset: 1, advanceLayoutUnit: 5_000_000 }],
    }, {
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
      clusters: [{ index: 0, renderStartOffset: 1, renderEndOffset: 2, advanceLayoutUnit: 14_400_000 }],
    }, {
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
      clusters: [{ index: 0, renderStartOffset: 2, renderEndOffset: 3, advanceLayoutUnit: 6_000_000 }],
    }],
    breakOffsets: [0, 3],
    lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }],
  }
}

function acceptedLayout(): Extract<VNextTextBlockMultiRunLayoutResultV1, { status: "accepted" }> {
  const result = acceptVNextTextBlockMultiRunLayoutV1(requestFixture())
  if (result.status !== "accepted") throw new Error("multi-run layout fixture blocked")
  return result
}

function project(overrides: Partial<Parameters<typeof projectVNextTextBlockMultiRunDisplayListV1>[0]> = {}) {
  return projectVNextTextBlockMultiRunDisplayListV1({
    projectionId: "mr1-fragment-display-list-001",
    layout: acceptedLayout(),
    origin: { xLayoutUnit: 72_000_000, yLayoutUnit: 100_000_000 },
    ...overrides,
  })
}

describe("text-block multi-run fragment display-list v1", () => {
  it("projects each accepted Text Run fragment onto one shared baseline without relayout", () => {
    const layout = acceptedLayout()
    const before = JSON.stringify(layout)
    const first = project({ layout })
    const second = project({ layout })

    expect(first.status).toBe("ready")
    if (first.status !== "ready" || second.status !== "ready") throw new Error("display list blocked")
    expect(first).toEqual(second)
    expect(first.summary).toEqual({
      lineCount: 1,
      commandCount: 3,
      nonBlankCommandCount: 3,
      widthLayoutUnit: 25_400_000,
      heightLayoutUnit: 24_000_000,
    })
    expect(first.contracts).toEqual({
      consumes: "vnext-text-block-multi-run-layout-v1",
      geometryUnit: "micro-point-integer",
      positionsAndBaselines: "core-accepted-positioned-fragments",
      rendererConversion: "divide-once-at-paint-boundary",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      glyphRasterization: "renderer-owned",
      artifactBytes: false,
      productionBinding: false,
    })
    expect(first.lines[0]).toMatchObject({
      bounds: {
        xLayoutUnit: 72_000_000,
        yLayoutUnit: 100_000_000,
        widthLayoutUnit: 25_400_000,
        heightLayoutUnit: 24_000_000,
      },
      baselineYLayoutUnit: 119_200_000,
      commandIds: layout.lines[0]!.fragments.map((fragment) => `paint:${fragment.fragmentId}`),
    })
    expect(first.commands.map((command) => ({
      text: command.text,
      x: command.baselineXLayoutUnit,
      y: command.baselineYLayoutUnit,
      metricY: command.metricBounds.yLayoutUnit,
      metricHeight: command.metricBounds.heightLayoutUnit,
      size: command.style.fontSizeLayoutUnit,
      weight: command.style.fontWeight,
      face: command.style.fontFaceId,
    }))).toEqual([{
      text: "A", x: 72_000_000, y: 119_200_000, metricY: 111_200_000,
      metricHeight: 10_000_000, size: 10_000_000, weight: 400, face: "sarabun-regular",
    }, {
      text: "B", x: 77_000_000, y: 119_200_000, metricY: 100_000_000,
      metricHeight: 24_000_000, size: 24_000_000, weight: 700, face: "sarabun-bold",
    }, {
      text: "C", x: 91_400_000, y: 119_200_000, metricY: 109_600_000,
      metricHeight: 12_000_000, size: 12_000_000, weight: 400, face: "sarabun-regular",
    }])
    expect(first.commands[2]!.sourceSegments[0]).toMatchObject({
      kind: "resolved-field",
      fieldKey: "customer.initial",
      renderedText: "C",
    })
    expect(first.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(layout)).toBe(before)
  })

  it("fails closed on blocked layout, production binding, unsafe placement, and mutated accepted facts", () => {
    const blockedLayout = acceptVNextTextBlockMultiRunLayoutV1({
      ...requestFixture(),
      bindProductionLayout: true,
    })
    expect(project({ layout: blockedLayout, bindProductionRenderer: true })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "layout-not-accepted" }),
        expect.objectContaining({ code: "production-binding-forbidden" }),
      ]),
    })

    const unsafe = project({
      origin: { xLayoutUnit: Number.MAX_SAFE_INTEGER, yLayoutUnit: 0 },
    })
    expect(unsafe.status).toBe("blocked")
    expect(unsafe.issues.map((candidate) => candidate.code)).toContain("unsafe-layout-arithmetic")

    const mutated = clone(acceptedLayout())
    mutated.lines[0]!.fragments[1]!.xLayoutUnit += 1
    const rejectedMutation = project({ layout: mutated })
    expect(rejectedMutation.status).toBe("blocked")
    expect(rejectedMutation.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "invalid-fragment-geometry",
      "fingerprint-mismatch",
    ]))
  })

  it("retains an accepted hard-break-only line without inventing a paint command", () => {
    const request = requestFixture()
    request.measurement.renderedText = "\n"
    request.measurement.runs = [{
      inlineId: "hard-break-only",
      kind: "hard-break",
      renderStartOffset: 0,
      renderEndOffset: 1,
      renderedText: "\n",
    }]
    request.shapingRuns = []
    request.breakOffsets = [0, 1]
    request.lines = [{ index: 0, renderStartOffset: 0, renderEndOffset: 1 }]
    const layout = acceptVNextTextBlockMultiRunLayoutV1(request)
    expect(layout.status).toBe("accepted")

    const result = project({ layout })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error("hard-break display list blocked")
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]!.sourceSegments[0]).toMatchObject({ kind: "hard-break", renderedText: "\n" })
    expect(result.lines[0]!.commandIds).toEqual([])
    expect(result.commands).toEqual([])
    expect(result.summary).toMatchObject({ lineCount: 1, commandCount: 0, nonBlankCommandCount: 0 })
  })

  it("keeps the projector pure and independent from browser, engine, and concrete renderer APIs", () => {
    const source = readFileSync(
      new URL("../src/renderer/textBlockMultiRunDisplayListV1.ts", import.meta.url),
      "utf8",
    )
    const doc = readFileSync(
      new URL("../docs/LIVE_DRAFT_MR1_FRAGMENT_DISPLAY_LIST.md", import.meta.url),
      "utf8",
    )
    expect(source).not.toMatch(/document\.|window\.|measureText|fillText|fetch\(|rustybuzz|icu4x|WebAssembly/u)
    expect(source).toContain("rendererMayMeasureText: false")
    expect(source).toContain("rendererMayRelayout: false")
    expect(source).toContain("divide-once-at-paint-boundary")
    expect(doc).toContain("One command currently paints one accepted shaping-run fragment, not one glyph")
    expect(doc).toMatch(/does not\s+establish glyph-outline or pixel parity/u)
  })
})
