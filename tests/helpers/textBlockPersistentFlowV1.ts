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

function linearLines(length: number, insertedLineIndex: number | null) {
  const originalLength = length - (insertedLineIndex == null ? 0 : 1)
  return Array.from({ length: Math.ceil(originalLength / 100) }, (_, index) => {
    if (insertedLineIndex == null || index < insertedLineIndex) return {
      index,
      renderStartOffset: index * 100,
      renderEndOffset: Math.min((index + 1) * 100, length),
    }
    if (index === insertedLineIndex) return {
      index,
      renderStartOffset: index * 100,
      renderEndOffset: Math.min((index + 1) * 100 + 1, length),
    }
    return {
      index,
      renderStartOffset: index * 100 + 1,
      renderEndOffset: Math.min((index + 1) * 100 + 1, length),
    }
  })
}

function linearRequest(
  instanceRevision: number,
  text: string,
  insertedLineIndex: number | null,
) {
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
    lines: linearLines(text.length, insertedLineIndex),
  } satisfies VNextTextBlockMultiRunLayoutRequestV1
}

function multiLevelItemRequest(
  instanceRevision: number,
  text: string,
  insertionOffset: number | null,
): VNextTextBlockMultiRunLayoutRequestV1 {
  const request: VNextTextBlockMultiRunLayoutRequestV1 = linearRequest(instanceRevision, text, null)
  const sourceLength = text.length - (insertionOffset == null ? 0 : 1)
  const baseShaping = request.shapingRuns[0]!
  request.measurement.runs = Array.from(text, (renderedText, index) => {
    const sourceIndex = insertionOffset == null || index < insertionOffset
      ? index
      : index === insertionOffset
        ? null
        : index - 1
    return {
      inlineId: sourceIndex == null ? "inserted-character" : `character-${sourceIndex}`,
      kind: "text" as const,
      renderStartOffset: index,
      renderEndOffset: index + 1,
      renderedText,
      styleKey: request.measurement.styleKey,
    }
  })
  request.shapingRuns = Array.from(text, (renderedText, index) => ({
    ...baseShaping,
    shapingRunId: `character-shape-${instanceRevision}-${index}`,
    renderStartOffset: index,
    renderEndOffset: index + 1,
    text: renderedText,
    clusters: [{
      index: 0,
      renderStartOffset: index,
      renderEndOffset: index + 1,
      advanceLayoutUnit: 1_000_000,
    }],
  }))
  request.lines = Array.from({ length: sourceLength }, (_, index) => {
    if (insertionOffset == null || index < insertionOffset) return {
      index,
      renderStartOffset: index,
      renderEndOffset: index + 1,
    }
    if (index === insertionOffset) return {
      index,
      renderStartOffset: index,
      renderEndOffset: index + 2,
    }
    return {
      index,
      renderStartOffset: index + 1,
      renderEndOffset: index + 2,
    }
  })
  return request
}

function persistentFlowInsertionFixture(input: {
  length: number
  insertionOffset: number
  previousRevision: number
}) {
  const previousText = "a".repeat(input.length)
  const nextText = `${previousText.slice(0, input.insertionOffset)}X${previousText.slice(input.insertionOffset)}`
  const insertionLineIndex = Math.floor(input.insertionOffset / 100)
  const previousRequest = linearRequest(input.previousRevision, previousText, null)
  const nextRequest = linearRequest(input.previousRevision + 1, nextText, insertionLineIndex)
  const previousLayout = acceptVNextTextBlockMultiRunLayoutV1(previousRequest)
  const nextLayout = acceptVNextTextBlockMultiRunLayoutV1(nextRequest)
  if (previousLayout.status !== "accepted" || nextLayout.status !== "accepted") {
    throw new Error("persistent flow linear fixture did not layout")
  }
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: previousRequest,
    acceptedLayout: previousLayout,
  })
  const restartLineIndex = insertionLineIndex - 1
  const reconvergenceLineIndex = insertionLineIndex + 2
  const previousReconvergenceOffset = previousRequest.lines[reconvergenceLineIndex]!.renderStartOffset
  const nextReconvergenceOffset = nextRequest.lines[reconvergenceLineIndex]!.renderStartOffset
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[reconvergenceLineIndex]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[reconvergenceLineIndex]!
  return {
    previousRequest,
    previousLayout,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: input.insertionOffset,
      previousEndOffset: input.insertionOffset,
      nextEndOffset: input.insertionOffset + 1,
    },
    window: {
      previousRestartLineIndex: restartLineIndex,
      nextRestartLineIndex: restartLineIndex,
      previousReconvergenceLineIndex: reconvergenceLineIndex,
      nextReconvergenceLineIndex: reconvergenceLineIndex,
      previousReconvergenceOffset,
      nextReconvergenceOffset,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}

export function persistentFlowEditFixture() {
  return persistentFlowInsertionFixture({
    length: 5_000,
    insertionOffset: 2_450,
    previousRevision: 70,
  })
}

export function persistentFlowMultiLevelEditFixture() {
  const previousText = "a".repeat(72)
  const insertionOffset = 38
  const nextText = `${previousText.slice(0, insertionOffset)}X${previousText.slice(insertionOffset)}`
  const previousRequest = multiLevelItemRequest(170, previousText, null)
  const nextRequest = multiLevelItemRequest(171, nextText, insertionOffset)
  const previousLayout = acceptVNextTextBlockMultiRunLayoutV1(previousRequest)
  const nextLayout = acceptVNextTextBlockMultiRunLayoutV1(nextRequest)
  if (previousLayout.status !== "accepted" || nextLayout.status !== "accepted") {
    throw new Error("persistent flow multi-level fixture did not layout")
  }
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: previousRequest,
    acceptedLayout: previousLayout,
  })
  const restartLineIndex = insertionOffset - 1
  const reconvergenceLineIndex = insertionOffset + 2
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[reconvergenceLineIndex]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[reconvergenceLineIndex]!
  return {
    previousRequest,
    previousLayout,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: insertionOffset,
      previousEndOffset: insertionOffset,
      nextEndOffset: insertionOffset + 1,
    },
    window: {
      previousRestartLineIndex: restartLineIndex,
      nextRestartLineIndex: restartLineIndex,
      previousReconvergenceLineIndex: reconvergenceLineIndex,
      nextReconvergenceLineIndex: reconvergenceLineIndex,
      previousReconvergenceOffset: previousRequest.lines[reconvergenceLineIndex]!.renderStartOffset,
      nextReconvergenceOffset: nextRequest.lines[reconvergenceLineIndex]!.renderStartOffset,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}

function chainedInsertionFixture(input: {
  first: ReturnType<typeof persistentFlowEditFixture>
  insertionOffset: number
  nextRevision: number
  label: string
}) {
  const { first } = input
  const previousText = first.nextRequest.measurement.renderedText
  const nextText = `${previousText.slice(0, input.insertionOffset)}Y${previousText.slice(input.insertionOffset)}`
  const nextRequest = structuredClone(first.nextRequest)
  nextRequest.measurement.instanceRevision = input.nextRevision
  nextRequest.measurement.renderedText = nextText
  const measurementRun = nextRequest.measurement.runs[0]!
  measurementRun.renderEndOffset = nextText.length
  measurementRun.renderedText = nextText
  const shapingRun = nextRequest.shapingRuns[0]!
  shapingRun.shapingRunId = `persistent-flow-shape-${input.nextRevision}-${input.label}`
  shapingRun.renderEndOffset = nextText.length
  shapingRun.text = nextText
  shapingRun.clusters = Array.from(nextText, (_, index) => ({
    index,
    renderStartOffset: index,
    renderEndOffset: index + 1,
    advanceLayoutUnit: 1_000_000,
  }))
  nextRequest.breakOffsets = Array.from({ length: nextText.length + 1 }, (_, index) => index)
  const editedLineIndex = first.nextRequest.lines.findIndex((line) => (
    line.renderStartOffset <= input.insertionOffset
    && input.insertionOffset < line.renderEndOffset
  ))
  if (editedLineIndex < 1 || editedLineIndex + 2 >= first.nextRequest.lines.length) {
    throw new Error("chained persistent flow fixture requires an interior edited line")
  }
  nextRequest.lines = first.nextRequest.lines.map((line) => {
    if (line.index < editedLineIndex) return { ...line }
    if (line.index === editedLineIndex) return { ...line, renderEndOffset: line.renderEndOffset + 1 }
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
  const restartLineIndex = editedLineIndex - 1
  const reconvergenceLineIndex = editedLineIndex + 2
  const previousReconvergenceOffset = first.nextRequest.lines[reconvergenceLineIndex]!.renderStartOffset
  const nextReconvergenceOffset = nextRequest.lines[reconvergenceLineIndex]!.renderStartOffset
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[reconvergenceLineIndex]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[reconvergenceLineIndex]!
  return {
    first,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: input.insertionOffset,
      previousEndOffset: input.insertionOffset,
      nextEndOffset: input.insertionOffset + 1,
    },
    window: {
      previousRestartLineIndex: restartLineIndex,
      nextRestartLineIndex: restartLineIndex,
      previousReconvergenceLineIndex: reconvergenceLineIndex,
      nextReconvergenceLineIndex: reconvergenceLineIndex,
      previousReconvergenceOffset,
      nextReconvergenceOffset,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}

export function persistentFlowArbitraryChainedEditFixtures() {
  const first = persistentFlowEditFixture()
  return {
    first,
    farBeforeFirstRestart: chainedInsertionFixture({
      first,
      insertionOffset: 350,
      nextRevision: 72,
      label: "before-restart",
    }),
    afterFirstReconvergence: chainedInsertionFixture({
      first,
      insertionOffset: 3_550,
      nextRevision: 73,
      label: "after-reconvergence",
    }),
  }
}
