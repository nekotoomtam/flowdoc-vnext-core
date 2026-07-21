import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import type { VNextTextBlockV4MeasurementRequest } from "../pagination/textBlockV4Measurement.js"
import type {
  VNextTextBlockMultiRunLineInputV1,
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedLineV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1 =
  createVNextCompactFingerprint("text-block-multi-run-range-prefix:start:v1")
export const VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_SUFFIX_END_V1 =
  createVNextCompactFingerprint("text-block-multi-run-range-suffix:end:v1")

export interface VNextTextBlockMultiRunSemanticRangeLineCheckpointsV1 {
  lineFingerprints: string[]
  prefixFingerprints: string[]
  suffixFingerprints: string[]
}

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
    ...(segment.generatedOwnerFingerprint == null ? {} : {
      generatedOwnerFingerprint: segment.generatedOwnerFingerprint,
    }),
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
      ...(run.generatedOwnerFingerprint == null ? {} : {
        generatedOwnerFingerprint: run.generatedOwnerFingerprint,
      }),
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

export function createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  lines: readonly VNextTextBlockMultiRunLineInputV1[]
}): VNextTextBlockMultiRunSemanticRangeLineCheckpointsV1 | null {
  if (input.lines.length === 0) return null
  const clusters = input.shapingRuns.flatMap((run) => run.clusters.map((cluster) => ({
    ...cluster,
    styleKey: run.styleKey,
    fontFaceId: run.fontFaceId,
    fontSizeLayoutUnit: run.fontSizeLayoutUnit,
    textColor: run.textColor,
    direction: run.direction,
    baselineShiftLayoutUnit: run.baselineShiftLayoutUnit,
    features: [...run.features],
  }))).sort((left, right) => left.renderStartOffset - right.renderStartOffset)
  const lineFingerprints: string[] = []
  let expectedLineStart = 0
  let clusterCursor = 0
  let sourceRunCursor = 0

  for (let lineIndex = 0; lineIndex < input.lines.length; lineIndex += 1) {
    const line = input.lines[lineIndex]!
    if (
      line.index !== lineIndex
      || line.renderStartOffset !== expectedLineStart
      || line.renderEndOffset <= line.renderStartOffset
      || line.renderEndOffset > input.measurement.renderedText.length
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, line.renderStartOffset)
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, line.renderEndOffset)
    ) return null

    const lineClusters: Array<{
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
    while (clusterCursor < clusters.length && clusters[clusterCursor]!.renderStartOffset < line.renderEndOffset) {
      const cluster = clusters[clusterCursor]!
      if (
        cluster.renderStartOffset < line.renderStartOffset
        || cluster.renderEndOffset > line.renderEndOffset
        || cluster.renderEndOffset <= cluster.renderStartOffset
      ) return null
      lineClusters.push({
        renderStartOffset: cluster.renderStartOffset - line.renderStartOffset,
        renderEndOffset: cluster.renderEndOffset - line.renderStartOffset,
        text: input.measurement.renderedText.slice(cluster.renderStartOffset, cluster.renderEndOffset),
        advanceLayoutUnit: cluster.advanceLayoutUnit,
        styleKey: cluster.styleKey,
        fontFaceId: cluster.fontFaceId,
        fontSizeLayoutUnit: cluster.fontSizeLayoutUnit,
        textColor: cluster.textColor,
        direction: cluster.direction,
        baselineShiftLayoutUnit: cluster.baselineShiftLayoutUnit,
        features: [...cluster.features],
      })
      clusterCursor += 1
    }

    while (
      sourceRunCursor < input.measurement.runs.length
      && input.measurement.runs[sourceRunCursor]!.renderEndOffset <= line.renderStartOffset
    ) sourceRunCursor += 1
    const sourceSegments: ReturnType<typeof normalizedSourceSegments> = []
    for (let runIndex = sourceRunCursor; runIndex < input.measurement.runs.length; runIndex += 1) {
      const run = input.measurement.runs[runIndex]!
      if (run.renderStartOffset >= line.renderEndOffset) break
      const renderStartOffset = Math.max(line.renderStartOffset, run.renderStartOffset)
      const renderEndOffset = Math.min(line.renderEndOffset, run.renderEndOffset)
      if (renderEndOffset <= renderStartOffset) continue
      const sourceStartOffset = renderStartOffset - run.renderStartOffset
      const sourceEndOffset = renderEndOffset - run.renderStartOffset
      sourceSegments.push({
        inlineId: run.inlineId,
        kind: run.kind,
        ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
        ...(run.generatedOwnerFingerprint == null ? {} : {
          generatedOwnerFingerprint: run.generatedOwnerFingerprint,
        }),
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
        ...(run.localStyle == null ? {} : { localStyle: clone(run.localStyle) }),
        renderStartOffset: renderStartOffset - line.renderStartOffset,
        renderEndOffset: renderEndOffset - line.renderStartOffset,
        renderedText: run.renderedText.slice(sourceStartOffset, sourceEndOffset),
      })
    }

    const facts = {
      text: input.measurement.renderedText.slice(line.renderStartOffset, line.renderEndOffset),
      renderLength: line.renderEndOffset - line.renderStartOffset,
      clusters: lineClusters,
      sourceSegments,
    }
    lineFingerprints.push(createVNextCompactFingerprint(JSON.stringify(facts)))
    expectedLineStart = line.renderEndOffset
  }
  if (
    expectedLineStart !== input.measurement.renderedText.length
    || clusterCursor !== clusters.length
  ) return null

  const prefixFingerprints: string[] = []
  let prefix = VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1
  lineFingerprints.forEach((lineFingerprint) => {
    prefix = createVNextCompactFingerprint(JSON.stringify({ prefix, lineFingerprint }))
    prefixFingerprints.push(prefix)
  })
  const suffixFingerprints = Array.from<string>({ length: lineFingerprints.length })
  let suffix = VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_SUFFIX_END_V1
  for (let index = lineFingerprints.length - 1; index >= 0; index -= 1) {
    suffix = createVNextCompactFingerprint(JSON.stringify({
      lineFingerprint: lineFingerprints[index],
      suffix,
    }))
    suffixFingerprints[index] = suffix
  }
  return { lineFingerprints, prefixFingerprints, suffixFingerprints }
}
