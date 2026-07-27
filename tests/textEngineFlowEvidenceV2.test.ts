import { describe, expect, it } from "vitest"
import type { VNextTextBlockV4MeasurementRequest } from "../src/index.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from
  "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import { createFlowDocTextEngineFlowEvidenceV2 } from
  "../packages/text-engine-rust-wasm/src/multiRunFlowEvidenceV2.js"
import type { FlowDocTextEngineFlowEvidenceInputV2 } from
  "../packages/text-engine-rust-wasm/src/multiRunFlowEvidenceContractV2.js"
import type { FlowDocTextEngineMultiRunRuntimeV1 } from
  "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function measurementFixture(renderedText = "A\uFFFCB"): VNextTextBlockV4MeasurementRequest {
  return {
    documentId: "document-flow-evidence-v2",
    instanceRevision: 21,
    sectionId: "section-main",
    textBlockId: "text-block-image-flow",
    availableWidthPt: 100,
    measurementProfileId: "measurement-profile-flow-evidence-v2",
    styleKey: "paragraph-body",
    renderedText,
    runs: renderedText === "\uFFFC"
      ? [{
          inlineId: "image-only",
          kind: "inline-image",
          renderStartOffset: 0,
          renderEndOffset: 1,
          renderedText: "\uFFFC",
          assetId: "asset-image",
          frame: {
            width: { value: 10, unit: "pt" },
            height: { value: 12, unit: "pt" },
            fit: "contain",
          },
        }]
      : [
          {
            inlineId: "text-a",
            kind: "text",
            renderStartOffset: 0,
            renderEndOffset: 1,
            renderedText: "A",
            styleKey: "paragraph-body",
          },
          {
            inlineId: "image-middle",
            kind: "inline-image",
            renderStartOffset: 1,
            renderEndOffset: 2,
            renderedText: "\uFFFC",
            assetId: "asset-image",
            frame: {
              width: { value: 10, unit: "pt" },
              height: { value: 12, unit: "pt" },
              fit: "contain",
            },
          },
          {
            inlineId: "text-b",
            kind: "text",
            renderStartOffset: 2,
            renderEndOffset: 3,
            renderedText: "B",
            styleKey: "paragraph-body",
          },
        ],
  }
}

function inputFixture(renderedText?: string): FlowDocTextEngineFlowEvidenceInputV2 {
  return {
    initialFlowFingerprint: `sha256:${"a".repeat(64)}`,
    layoutId: "flow-evidence-layout-v2",
    measurement: measurementFixture(renderedText),
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

function fakeRuntime(record?: {
  shapedTexts: string[]
  segmentedTexts: string[]
}): FlowDocTextEngineMultiRunRuntimeV1 {
  return {
    runtimeKind: "test-mr1",
    shape({ text, fontFace }) {
      record?.shapedTexts.push(text)
      let byteOffset = 0
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-shape-facts-v1",
        text,
        fontFaceId: fontFace.fontFaceId,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        unitsPerEm: fontFace.unitsPerEm,
        ascentFontUnit: fontFace.ascentFontUnit,
        descentFontUnit: fontFace.descentFontUnit,
        lineGapFontUnit: fontFace.lineGapFontUnit,
        glyphs: [...text].map((scalar, index) => {
          const cluster = byteOffset
          byteOffset += new TextEncoder().encode(scalar).length
          return {
            index,
            glyphId: 10 + index,
            cluster,
            xAdvance: 500,
            yAdvance: 0,
            xOffset: 0,
            yOffset: 0,
          }
        }),
        summary: {
          glyphCount: [...text].length,
          missingGlyphCount: 0,
          totalAdvanceFontUnits: [...text].length * 500,
        },
      }
    },
    segment(text) {
      record?.segmentedTexts.push(text)
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-segmentation-facts-v1",
        text,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        breakByteOffsets: [0, new TextEncoder().encode(text).length],
        breakUtf16Offsets: [0, text.length],
        summary: { breakCount: 2 },
      }
    },
  }
}

function createUnknownEvidence(
  input: unknown,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
) {
  return (
    createFlowDocTextEngineFlowEvidenceV2 as (
      input: unknown,
      runtime: FlowDocTextEngineMultiRunRuntimeV1,
    ) => ReturnType<typeof createFlowDocTextEngineFlowEvidenceV2>
  )(input, runtime)
}

function expectBlockedBeforeRuntime(input: unknown) {
  const calls = { shapedTexts: [] as string[], segmentedTexts: [] as string[] }
  let result: ReturnType<typeof createFlowDocTextEngineFlowEvidenceV2> | undefined
  expect(() => {
    result = createUnknownEvidence(input, fakeRuntime(calls))
  }).not.toThrow()
  expect(result).toMatchObject({
    status: "blocked",
    evidenceInput: null,
    summary: null,
    fingerprint: null,
  })
  expect(result?.issues).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "invalid-layout-input" }),
  ]))
  expect(calls).toEqual({ shapedTexts: [], segmentedTexts: [] })
}

describe("Flow Evidence V2 producer", () => {
  it("retains image slots while shaping only surrounding text", () => {
    const input = inputFixture()
    const calls = { shapedTexts: [] as string[], segmentedTexts: [] as string[] }
    const result = createFlowDocTextEngineFlowEvidenceV2(input, fakeRuntime(calls))

    expect(result).toMatchObject({
      status: "accepted",
      summary: {
        sourceRunCount: 3,
        textBearingRunCount: 2,
        inlineImageCount: 1,
        shapingRunCount: 2,
        runtimeShapeCallCount: 2,
        runtimeSegmentationCallCount: 1,
      },
    })
    if (result.status !== "accepted") throw new Error("V2 evidence blocked")
    expect(result.evidenceInput.measurement.renderedText).toBe("A\uFFFCB")
    expect(result.evidenceInput.shapingRuns.map((run) => run.text)).toEqual(["A", "B"])
    expect(result.evidenceInput.shapingRuns.every(
      (run) => run.renderEndOffset <= 1 || run.renderStartOffset >= 2,
    )).toBe(true)
    expect(result.evidenceInput).not.toHaveProperty("lines")
    expect(calls).toEqual({
      shapedTexts: ["A", "B"],
      segmentedTexts: ["A\uFFFCB"],
    })
  })

  it("segments an image-only block once without creating shaping runs", () => {
    const calls = { shapedTexts: [] as string[], segmentedTexts: [] as string[] }
    const result = createFlowDocTextEngineFlowEvidenceV2(
      inputFixture("\uFFFC"),
      fakeRuntime(calls),
    )

    expect(result).toMatchObject({
      status: "accepted",
      summary: {
        sourceRunCount: 1,
        textBearingRunCount: 0,
        inlineImageCount: 1,
        shapingRunCount: 0,
        runtimeShapeCallCount: 0,
        runtimeSegmentationCallCount: 1,
      },
    })
    if (result.status !== "accepted") throw new Error("image-only evidence blocked")
    expect(result.evidenceInput.shapingRuns).toEqual([])
    expect(result.evidenceInput.breakOffsets[0]).toBe(0)
    expect(result.evidenceInput.breakOffsets.at(-1)).toBe(
      result.evidenceInput.measurement.renderedText.length,
    )
    expect(calls).toEqual({
      shapedTexts: [],
      segmentedTexts: ["\uFFFC"],
    })
  })

  it("blocks production binding before runtime evidence is requested", () => {
    const input = inputFixture()
    input.bindProductionLayout = true
    const calls = { shapedTexts: [] as string[], segmentedTexts: [] as string[] }
    const result = createFlowDocTextEngineFlowEvidenceV2(input, fakeRuntime(calls))

    expect(result).toMatchObject({
      status: "blocked",
      productionBinding: false,
      evidenceInput: null,
      fingerprint: null,
      issues: [expect.objectContaining({ code: "production-binding-forbidden" })],
    })
    expect(calls).toEqual({ shapedTexts: [], segmentedTexts: [] })
  })

  it.each([
    ["root", (input: FlowDocTextEngineFlowEvidenceInputV2) => Object.assign(input, {
      lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }],
    })],
    ["measurement", (input: FlowDocTextEngineFlowEvidenceInputV2) => Object.assign(
      input.measurement,
      { lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }] },
    )],
    ["source run", (input: FlowDocTextEngineFlowEvidenceInputV2) => Object.assign(
      input.measurement.runs[0]!,
      { lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 1 }] },
    )],
    ["font face", (input: FlowDocTextEngineFlowEvidenceInputV2) => Object.assign(
      input.fontFaces[0]!,
      { lines: [] },
    )],
  ] as const)("rejects producer-selected lines on the %s exact-object boundary", (_name, mutate) => {
    const input = inputFixture()
    mutate(input)
    expectBlockedBeforeRuntime(input)
  })

  it.each([
    ["root measurement", (input: FlowDocTextEngineFlowEvidenceInputV2, read: () => void) => {
      Object.defineProperty(input, "measurement", {
        enumerable: true,
        configurable: true,
        get: () => {
          read()
          return measurementFixture()
        },
      })
    }],
    ["nested rendered text", (input: FlowDocTextEngineFlowEvidenceInputV2, read: () => void) => {
      Object.defineProperty(input.measurement.runs[0]!, "renderedText", {
        enumerable: true,
        configurable: true,
        get: () => {
          read()
          return "A"
        },
      })
    }],
    ["nested font path", (input: FlowDocTextEngineFlowEvidenceInputV2, read: () => void) => {
      Object.defineProperty(input.fontFaces[0]!, "fontAssetPath", {
        enumerable: true,
        configurable: true,
        get: () => {
          read()
          return "assets/fonts/Sarabun-Regular.ttf"
        },
      })
    }],
  ] as const)("rejects a %s accessor without reading it or calling runtime", (_name, mutate) => {
    const input = inputFixture()
    let accessorReadCount = 0
    mutate(input, () => { accessorReadCount += 1 })

    expectBlockedBeforeRuntime(input)
    expect(accessorReadCount).toBe(0)
  })

  it.each([
    ["null", null],
    ["array", []],
    ["empty object", {}],
    ["custom prototype", Object.create({})],
  ])("returns a closed blocked result for a malformed %s root", (_name, input) => {
    expectBlockedBeforeRuntime(input)
  })

  it.each([
    ["invalid Initial Flow fingerprint", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.initialFlowFingerprint = "not-a-fingerprint"
    }],
    ["non-positive width", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.availableWidthPt = 0
    }],
    ["unsafe width", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.availableWidthPt = Number.MAX_VALUE
    }],
  ] as const)("blocks %s before shaping or segmentation", (_name, mutate) => {
    const input = inputFixture()
    mutate(input)
    expectBlockedBeforeRuntime(input)
  })

  it.each([
    ["unknown kind", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[1]!.kind = "future-inline" as "inline-image"
    }],
    ["coverage gap", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[1]!.renderStartOffset = 2
    }],
    ["coverage overlap", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[2]!.renderStartOffset = 1
    }],
    ["rendered slice mismatch", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[0]!.renderedText = "Z"
    }],
    ["non-image U+FFFC", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[1] = {
        inlineId: "invalid-text-image",
        kind: "text",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "\uFFFC",
        styleKey: "paragraph-body",
      }
    }],
    ["invalid image slot text", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.renderedText = "AXB"
      input.measurement.runs[1]!.renderedText = "X"
    }],
    ["missing image frame", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      delete input.measurement.runs[1]!.frame
    }],
    ["missing resolved-field key", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[0]!.kind = "resolved-field"
      delete input.measurement.runs[0]!.fieldKey
    }],
    ["invalid generated owner", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.runs[0]!.kind = "generated-page-number"
      input.measurement.runs[0]!.generatedOwnerFingerprint = "invalid"
    }],
    ["invalid hard-break text", (input: FlowDocTextEngineFlowEvidenceInputV2) => {
      input.measurement.renderedText = "A B"
      input.measurement.runs[1] = {
        inlineId: "invalid-break",
        kind: "hard-break",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: " ",
      }
    }],
  ] as const)("rejects malformed source-run evidence: %s", (_name, mutate) => {
    const input = inputFixture()
    mutate(input)
    expectBlockedBeforeRuntime(input)
  })
})
