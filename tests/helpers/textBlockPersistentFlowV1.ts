import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextTextBlockMultiRunIncrementalSnapshotV1,
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

function linearLines(length: number, inserted: boolean) {
  return Array.from({ length: 50 }, (_, index) => {
    if (!inserted || index < 24) return {
      index,
      renderStartOffset: index * 100,
      renderEndOffset: Math.min((index + 1) * 100, length),
    }
    if (index === 24) return { index, renderStartOffset: 2_400, renderEndOffset: 2_501 }
    return {
      index,
      renderStartOffset: index * 100 + 1,
      renderEndOffset: Math.min((index + 1) * 100 + 1, length),
    }
  })
}

function linearRequest(instanceRevision: number, text: string, inserted: boolean) {
  const base = legacyTextOnlyLayoutRequestFixture()
  const fontFace = base.fontFaces[0]!
  const styleKey = base.shapingRuns[0]!.styleKey
  return {
    layoutId: "persistent-flow-linear-layout",
    measurement: {
      documentId: "persistent-flow-document",
      instanceRevision,
      sectionId: "section-main",
      textBlockId: "persistent-flow-block",
      availableWidthPt: 200,
      measurementProfileId: "persistent-flow-profile",
      styleKey: base.measurement.styleKey,
      renderedText: text,
      runs: [{
        inlineId: "long-text",
        kind: "text" as const,
        renderStartOffset: 0,
        renderEndOffset: text.length,
        renderedText: text,
        styleKey: base.measurement.styleKey,
      }],
    },
    layoutUnitPolicyFingerprint: base.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 200_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: { ...base.paragraphStyle, fontFaceId: fontFace.fontFaceId },
    fontFaces: [structuredClone(fontFace)],
    shapingRuns: [{
      shapingRunId: `persistent-flow-shape-${instanceRevision}`,
      renderStartOffset: 0,
      renderEndOffset: text.length,
      text,
      styleKey,
      fontFaceId: fontFace.fontFaceId,
      fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
      textColor: base.paragraphStyle.textColor,
      direction: "ltr" as const,
      baselineShiftLayoutUnit: 0 as const,
      features: [] as string[],
      clusters: Array.from(text, (_, index) => ({
        index,
        renderStartOffset: index,
        renderEndOffset: index + 1,
        advanceLayoutUnit: 1_000_000,
      })),
    }],
    breakOffsets: Array.from({ length: text.length + 1 }, (_, index) => index),
    lines: linearLines(text.length, inserted),
  } satisfies VNextTextBlockMultiRunLayoutRequestV1
}

export function persistentFlowEditFixture() {
  const previousText = "a".repeat(5_000)
  const nextText = `${previousText.slice(0, 2_450)}X${previousText.slice(2_450)}`
  const previousRequest = linearRequest(70, previousText, false)
  const nextRequest = linearRequest(71, nextText, true)
  const previousLayout = acceptVNextTextBlockMultiRunLayoutV1(previousRequest)
  const nextLayout = acceptVNextTextBlockMultiRunLayoutV1(nextRequest)
  if (previousLayout.status !== "accepted" || nextLayout.status !== "accepted") {
    throw new Error("persistent flow linear fixture did not layout")
  }
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: previousRequest,
    acceptedLayout: previousLayout,
  })
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[26]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[26]!
  return {
    previousRequest,
    previousLayout,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: 2_450,
      previousEndOffset: 2_450,
      nextEndOffset: 2_451,
    },
    window: {
      previousRestartLineIndex: 23,
      nextRestartLineIndex: 23,
      previousReconvergenceLineIndex: 26,
      nextReconvergenceLineIndex: 26,
      previousReconvergenceOffset: 2_600,
      nextReconvergenceOffset: 2_601,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}

export function persistentFlowChainedEditFixture() {
  const first = persistentFlowEditFixture()
  const previousText = first.nextRequest.measurement.renderedText
  const nextText = `${previousText.slice(0, 2_350)}Y${previousText.slice(2_350)}`
  const nextRequest = structuredClone(first.nextRequest)
  nextRequest.measurement.instanceRevision = 72
  nextRequest.measurement.renderedText = nextText
  const measurementRun = nextRequest.measurement.runs[0]!
  measurementRun.renderEndOffset = nextText.length
  measurementRun.renderedText = nextText
  const shapingRun = nextRequest.shapingRuns[0]!
  shapingRun.shapingRunId = "persistent-flow-shape-72"
  shapingRun.renderEndOffset = nextText.length
  shapingRun.text = nextText
  shapingRun.clusters = Array.from(nextText, (_, index) => ({
    index,
    renderStartOffset: index,
    renderEndOffset: index + 1,
    advanceLayoutUnit: 1_000_000,
  }))
  nextRequest.breakOffsets = Array.from({ length: nextText.length + 1 }, (_, index) => index)
  nextRequest.lines = first.nextRequest.lines.map((line) => {
    if (line.index < 23) return { ...line }
    if (line.index === 23) return { ...line, renderEndOffset: line.renderEndOffset + 1 }
    return {
      ...line,
      renderStartOffset: line.renderStartOffset + 1,
      renderEndOffset: line.renderEndOffset + 1,
    }
  })
  const nextLayout = acceptVNextTextBlockMultiRunLayoutV1(nextRequest)
  if (nextLayout.status !== "accepted") throw new Error("persistent flow chained fixture did not layout")
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: first.nextRequest,
    acceptedLayout: first.nextLayout,
  })
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[25]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[25]!
  return {
    first,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: 2_350,
      previousEndOffset: 2_350,
      nextEndOffset: 2_351,
    },
    window: {
      previousRestartLineIndex: 22,
      nextRestartLineIndex: 22,
      previousReconvergenceLineIndex: 25,
      nextReconvergenceLineIndex: 25,
      previousReconvergenceOffset: 2_501,
      nextReconvergenceOffset: 2_502,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}
