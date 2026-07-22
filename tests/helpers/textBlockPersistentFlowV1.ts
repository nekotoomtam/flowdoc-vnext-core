import {
  acceptVNextTextBlockMultiRunLayoutV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
} from "../../src/index.js"
import {
  legacyTextOnlyLayoutRequestFixture,
  mixedTypographyLayoutRequestFixture,
} from "./textBlockInitialFlowV1.js"

export function acceptedPersistentFlowFixture() {
  const request = mixedTypographyLayoutRequestFixture()
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("persistent flow fixture did not layout")
  return { request, acceptedLayout }
}

export function acceptedPersistentAtomicFlowFixture() {
  const base = legacyTextOnlyLayoutRequestFixture()
  const fontFace = base.fontFaces[0]!
  const styleKey = base.shapingRuns[0]!.styleKey
  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    ...base,
    layoutId: "persistent-flow-atomic-layout",
    measurement: {
      ...base.measurement,
      renderedText: "A1\nB",
      runs: [
        { inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "A", styleKey: base.measurement.styleKey },
        { inlineId: "page-1", kind: "generated-page-number", generatedOwnerFingerprint: `sha256:${"d".repeat(64)}`, renderStartOffset: 1, renderEndOffset: 2, renderedText: "1", styleKey: base.measurement.styleKey },
        { inlineId: "break-1", kind: "hard-break", renderStartOffset: 2, renderEndOffset: 3, renderedText: "\n" },
        { inlineId: "field-b", kind: "resolved-field", fieldKey: "sample.b", renderStartOffset: 3, renderEndOffset: 4, renderedText: "B", styleKey: base.measurement.styleKey },
      ],
    },
    paragraphStyle: { ...base.paragraphStyle, fontFaceId: fontFace.fontFaceId },
    shapingRuns: [
      {
        shapingRunId: "shape-a-page",
        renderStartOffset: 0,
        renderEndOffset: 2,
        text: "A1",
        styleKey,
        fontFaceId: fontFace.fontFaceId,
        fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
        textColor: base.paragraphStyle.textColor,
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: [
          { index: 0, renderStartOffset: 0, renderEndOffset: 1, advanceLayoutUnit: 6_000_000 },
          { index: 1, renderStartOffset: 1, renderEndOffset: 2, advanceLayoutUnit: 6_000_000 },
        ],
      },
      {
        shapingRunId: "shape-field-b",
        renderStartOffset: 3,
        renderEndOffset: 4,
        text: "B",
        styleKey,
        fontFaceId: fontFace.fontFaceId,
        fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
        textColor: base.paragraphStyle.textColor,
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: [{ index: 0, renderStartOffset: 3, renderEndOffset: 4, advanceLayoutUnit: 6_000_000 }],
      },
    ],
    breakOffsets: [0, 3, 4],
    lines: [
      { index: 0, renderStartOffset: 0, renderEndOffset: 3 },
      { index: 1, renderStartOffset: 3, renderEndOffset: 4 },
    ],
  }
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("persistent atomic fixture did not layout")
  return { request, acceptedLayout }
}

export function clonePersistentFlowRequest(
  request: VNextTextBlockMultiRunLayoutRequestV1,
): VNextTextBlockMultiRunLayoutRequestV1 {
  return structuredClone(request)
}
