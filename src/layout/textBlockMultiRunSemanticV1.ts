import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import type { VNextTextBlockV4MeasurementRequest } from "../pagination/textBlockV4Measurement.js"
import type {
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedLineV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizedSourceSegments(
  lineStart: number,
  segments: readonly VNextTextBlockMultiRunSourceSegmentV1[],
) {
  return segments.map((segment) => ({
    inlineId: segment.inlineId,
    kind: segment.kind,
    ...(segment.fieldKey == null ? {} : { fieldKey: segment.fieldKey }),
    ...(segment.styleKey == null ? {} : { styleKey: segment.styleKey }),
    ...(segment.localStyle == null ? {} : { localStyle: clone(segment.localStyle) }),
    renderStartOffset: segment.renderStartOffset - lineStart,
    renderEndOffset: segment.renderEndOffset - lineStart,
    renderedText: segment.renderedText,
  }))
}

export function createVNextTextBlockMultiRunSemanticLineFactsV1(
  line: VNextTextBlockPositionedLineV1,
) {
  return {
    text: line.text,
    renderLength: line.renderEndOffset - line.renderStartOffset,
    widthLayoutUnit: line.widthLayoutUnit,
    naturalAscentLayoutUnit: line.naturalAscentLayoutUnit,
    naturalDescentLayoutUnit: line.naturalDescentLayoutUnit,
    naturalHeightLayoutUnit: line.naturalHeightLayoutUnit,
    leadingBeforeLayoutUnit: line.leadingBeforeLayoutUnit,
    leadingAfterLayoutUnit: line.leadingAfterLayoutUnit,
    heightLayoutUnit: line.heightLayoutUnit,
    baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
    fragments: line.fragments.map((fragment) => ({
      renderStartOffset: fragment.renderStartOffset - line.renderStartOffset,
      renderEndOffset: fragment.renderEndOffset - line.renderStartOffset,
      text: fragment.text,
      xLayoutUnit: fragment.xLayoutUnit,
      advanceLayoutUnit: fragment.advanceLayoutUnit,
      baselineShiftLayoutUnit: fragment.baselineShiftLayoutUnit,
      styleKey: fragment.styleKey,
      fontFaceId: fragment.fontFaceId,
      fontFamily: fragment.fontFamily,
      fontSha256: fragment.fontSha256,
      fontWeight: fragment.fontWeight,
      fontStyle: fragment.fontStyle,
      fontSizeLayoutUnit: fragment.fontSizeLayoutUnit,
      textColor: fragment.textColor,
      ascentLayoutUnit: fragment.ascentLayoutUnit,
      descentLayoutUnit: fragment.descentLayoutUnit,
      lineGapLayoutUnit: fragment.lineGapLayoutUnit,
      sourceSegments: normalizedSourceSegments(line.renderStartOffset, fragment.sourceSegments),
    })),
    sourceSegments: normalizedSourceSegments(line.renderStartOffset, line.sourceSegments),
  }
}

export function createVNextTextBlockMultiRunSemanticLineFingerprintV1(
  line: VNextTextBlockPositionedLineV1,
): string {
  return createVNextCompactFingerprint(JSON.stringify(createVNextTextBlockMultiRunSemanticLineFactsV1(line)))
}

export function createVNextTextBlockMultiRunSemanticRangeFactsV1(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  renderStartOffset: number
  renderEndOffset: number
}) {
  if (
    !Number.isSafeInteger(input.renderStartOffset)
    || !Number.isSafeInteger(input.renderEndOffset)
    || input.renderStartOffset < 0
    || input.renderEndOffset < input.renderStartOffset
    || input.renderEndOffset > input.measurement.renderedText.length
    || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, input.renderStartOffset)
    || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, input.renderEndOffset)
  ) return null
  const clusters: Array<{
    renderStartOffset: number
    renderEndOffset: number
    text: string
    advanceLayoutUnit: number
    styleKey: string
    fontFaceId: string
    fontSizeLayoutUnit: number
    textColor: string
    direction: "ltr"
    baselineShiftLayoutUnit: 0
    features: string[]
  }> = []
  for (const run of input.shapingRuns) {
    for (const cluster of run.clusters) {
      if (
        cluster.renderEndOffset <= input.renderStartOffset
        || cluster.renderStartOffset >= input.renderEndOffset
      ) continue
      if (
        cluster.renderStartOffset < input.renderStartOffset
        || cluster.renderEndOffset > input.renderEndOffset
      ) return null
      clusters.push({
        renderStartOffset: cluster.renderStartOffset - input.renderStartOffset,
        renderEndOffset: cluster.renderEndOffset - input.renderStartOffset,
        text: input.measurement.renderedText.slice(
          cluster.renderStartOffset,
          cluster.renderEndOffset,
        ),
        advanceLayoutUnit: cluster.advanceLayoutUnit,
        styleKey: run.styleKey,
        fontFaceId: run.fontFaceId,
        fontSizeLayoutUnit: run.fontSizeLayoutUnit,
        textColor: run.textColor,
        direction: run.direction,
        baselineShiftLayoutUnit: run.baselineShiftLayoutUnit,
        features: [...run.features],
      })
    }
  }
  const sourceSegments = input.measurement.runs.flatMap((run) => {
    const renderStartOffset = Math.max(input.renderStartOffset, run.renderStartOffset)
    const renderEndOffset = Math.min(input.renderEndOffset, run.renderEndOffset)
    if (renderEndOffset <= renderStartOffset) return []
    const sourceStartOffset = renderStartOffset - run.renderStartOffset
    const sourceEndOffset = renderEndOffset - run.renderStartOffset
    return [{
      inlineId: run.inlineId,
      kind: run.kind,
      ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
      ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
      ...(run.localStyle == null ? {} : { localStyle: clone(run.localStyle) }),
      renderStartOffset: renderStartOffset - input.renderStartOffset,
      renderEndOffset: renderEndOffset - input.renderStartOffset,
      renderedText: run.renderedText.slice(sourceStartOffset, sourceEndOffset),
    }]
  })
  return {
    text: input.measurement.renderedText.slice(input.renderStartOffset, input.renderEndOffset),
    renderLength: input.renderEndOffset - input.renderStartOffset,
    clusters,
    sourceSegments,
  }
}

export function createVNextTextBlockMultiRunSemanticRangeFingerprintV1(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  renderStartOffset: number
  renderEndOffset: number
}): string | null {
  const facts = createVNextTextBlockMultiRunSemanticRangeFactsV1(input)
  return facts == null ? null : createVNextCompactFingerprint(JSON.stringify(facts))
}
