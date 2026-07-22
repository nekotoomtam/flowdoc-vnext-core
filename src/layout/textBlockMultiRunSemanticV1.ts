import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"
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

export type VNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1 =
  | {
      status: "accepted"
      lineStartIndex: number
      lineEndIndexExclusive: number
      lineFingerprints: string[]
      work: {
        lineFingerprintCount: number
        visitedShapingRunCount: number
        visitedClusterCount: number
        visitedSourceRunCount: number
        completeSemanticPassCount: 0
      }
    }
  | {
      status: "blocked"
      code: "invalid-line-window" | "invalid-line-range" | "invalid-cluster-range" | "invalid-source-range"
      message: string
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizedSemanticCluster(
  measurement: VNextTextBlockV4MeasurementRequest,
  run: VNextTextBlockResolvedShapingRunV1,
  cluster: VNextTextBlockResolvedShapingRunV1["clusters"][number],
  rangeStart: number,
) {
  return {
    renderStartOffset: cluster.renderStartOffset - rangeStart,
    renderEndOffset: cluster.renderEndOffset - rangeStart,
    text: measurement.renderedText.slice(cluster.renderStartOffset, cluster.renderEndOffset),
    advanceLayoutUnit: cluster.advanceLayoutUnit,
    styleKey: run.styleKey,
    fontFaceId: run.fontFaceId,
    fontSizeLayoutUnit: run.fontSizeLayoutUnit,
    textColor: run.textColor,
    direction: run.direction,
    baselineShiftLayoutUnit: run.baselineShiftLayoutUnit,
    features: [...run.features],
  }
}

function normalizedSemanticSourceSegment(
  run: VNextTextBlockV4MeasurementRun,
  rangeStart: number,
  renderStartOffset: number,
  renderEndOffset: number,
) {
  const sourceStartOffset = renderStartOffset - run.renderStartOffset
  const sourceEndOffset = renderEndOffset - run.renderStartOffset
  return {
    inlineId: run.inlineId,
    kind: run.kind,
    ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
    ...(run.generatedOwnerFingerprint == null ? {} : {
      generatedOwnerFingerprint: run.generatedOwnerFingerprint,
    }),
    ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
    ...(run.localStyle == null ? {} : { localStyle: clone(run.localStyle) }),
    renderStartOffset: renderStartOffset - rangeStart,
    renderEndOffset: renderEndOffset - rangeStart,
    renderedText: run.renderedText.slice(sourceStartOffset, sourceEndOffset),
  }
}

function lowerBoundByEnd<T extends { renderEndOffset: number }>(
  values: readonly T[],
  offset: number,
): number {
  let low = 0
  let high = values.length
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2)
    if (values[middle]!.renderEndOffset <= offset) low = middle + 1
    else high = middle
  }
  return low
}

function createSemanticRangeFactsFromBoundedInputs(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  sourceRuns: readonly VNextTextBlockV4MeasurementRun[]
  renderStartOffset: number
  renderEndOffset: number
}):
  | { status: "accepted"; facts: ReturnType<typeof createVNextTextBlockMultiRunSemanticRangeFactsV1> & {} }
  | { status: "blocked"; code: "invalid-cluster-range" | "invalid-source-range" } {
  const clusters: ReturnType<typeof normalizedSemanticCluster>[] = []
  let previousClusterEnd = -1
  for (const run of input.shapingRuns) {
    for (const cluster of run.clusters) {
      if (
        !Number.isSafeInteger(cluster.renderStartOffset)
        || !Number.isSafeInteger(cluster.renderEndOffset)
        || cluster.renderStartOffset < input.renderStartOffset
        || cluster.renderEndOffset > input.renderEndOffset
        || cluster.renderEndOffset <= cluster.renderStartOffset
        || cluster.renderStartOffset < run.renderStartOffset
        || cluster.renderEndOffset > run.renderEndOffset
        || cluster.renderStartOffset < previousClusterEnd
        || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, cluster.renderStartOffset)
        || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, cluster.renderEndOffset)
      ) return { status: "blocked", code: "invalid-cluster-range" }
      clusters.push(normalizedSemanticCluster(
        input.measurement,
        run,
        cluster,
        input.renderStartOffset,
      ))
      previousClusterEnd = cluster.renderEndOffset
    }
  }

  const sourceSegments: ReturnType<typeof normalizedSemanticSourceSegment>[] = []
  const paintableIntervals: Array<{ start: number; end: number }> = []
  let expectedSourceStart = input.renderStartOffset
  for (const run of input.sourceRuns) {
    if (
      !Number.isSafeInteger(run.renderStartOffset)
      || !Number.isSafeInteger(run.renderEndOffset)
      || run.renderStartOffset < 0
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > input.measurement.renderedText.length
      || run.renderedText !== input.measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, run.renderStartOffset)
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, run.renderEndOffset)
    ) return { status: "blocked", code: "invalid-source-range" }
    const renderStartOffset = Math.max(input.renderStartOffset, run.renderStartOffset)
    const renderEndOffset = Math.min(input.renderEndOffset, run.renderEndOffset)
    if (renderEndOffset <= renderStartOffset) continue
    if (renderStartOffset !== expectedSourceStart) {
      return { status: "blocked", code: "invalid-source-range" }
    }
    sourceSegments.push(normalizedSemanticSourceSegment(
      run,
      input.renderStartOffset,
      renderStartOffset,
      renderEndOffset,
    ))
    if (run.kind !== "hard-break" && run.kind !== "inline-image") {
      const start = renderStartOffset - input.renderStartOffset
      const end = renderEndOffset - input.renderStartOffset
      const previous = paintableIntervals.at(-1)
      if (previous != null && previous.end === start) previous.end = end
      else paintableIntervals.push({ start, end })
    }
    expectedSourceStart = renderEndOffset
  }
  if (expectedSourceStart !== input.renderEndOffset) {
    return { status: "blocked", code: "invalid-source-range" }
  }

  let clusterIndex = 0
  for (const interval of paintableIntervals) {
    let expectedClusterStart = interval.start
    while (clusterIndex < clusters.length && clusters[clusterIndex]!.renderStartOffset < interval.end) {
      const cluster = clusters[clusterIndex]!
      if (
        cluster.renderStartOffset !== expectedClusterStart
        || cluster.renderEndOffset > interval.end
      ) return { status: "blocked", code: "invalid-cluster-range" }
      expectedClusterStart = cluster.renderEndOffset
      clusterIndex += 1
    }
    if (expectedClusterStart !== interval.end) {
      return { status: "blocked", code: "invalid-cluster-range" }
    }
  }
  if (clusterIndex !== clusters.length) {
    return { status: "blocked", code: "invalid-cluster-range" }
  }

  return {
    status: "accepted",
    facts: {
      text: input.measurement.renderedText.slice(input.renderStartOffset, input.renderEndOffset),
      renderLength: input.renderEndOffset - input.renderStartOffset,
      clusters,
      sourceSegments,
    },
  }
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
      clusters.push(normalizedSemanticCluster(
        input.measurement,
        run,
        cluster,
        input.renderStartOffset,
      ))
    }
  }
  const sourceSegments = input.measurement.runs.flatMap((run) => {
    const renderStartOffset = Math.max(input.renderStartOffset, run.renderStartOffset)
    const renderEndOffset = Math.min(input.renderEndOffset, run.renderEndOffset)
    if (renderEndOffset <= renderStartOffset) return []
    return [normalizedSemanticSourceSegment(
      run,
      input.renderStartOffset,
      renderStartOffset,
      renderEndOffset,
    )]
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
  const clusters = input.shapingRuns.flatMap((run) => run.clusters.map((cluster) => ({ run, cluster })))
    .sort((left, right) => left.cluster.renderStartOffset - right.cluster.renderStartOffset)
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
    while (
      clusterCursor < clusters.length
      && clusters[clusterCursor]!.cluster.renderStartOffset < line.renderEndOffset
    ) {
      const { run, cluster } = clusters[clusterCursor]!
      if (
        cluster.renderStartOffset < line.renderStartOffset
        || cluster.renderEndOffset > line.renderEndOffset
        || cluster.renderEndOffset <= cluster.renderStartOffset
      ) return null
      lineClusters.push(normalizedSemanticCluster(
        input.measurement,
        run,
        cluster,
        line.renderStartOffset,
      ))
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
      sourceSegments.push(normalizedSemanticSourceSegment(
        run,
        line.renderStartOffset,
        renderStartOffset,
        renderEndOffset,
      ))
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

export function createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  lines: readonly VNextTextBlockMultiRunLineInputV1[]
  lineStartIndex: number
  lineEndIndexExclusive: number
}): VNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1 {
  if (
    !Number.isSafeInteger(input.lineStartIndex)
    || !Number.isSafeInteger(input.lineEndIndexExclusive)
    || input.lineStartIndex < 0
    || input.lineEndIndexExclusive <= input.lineStartIndex
    || input.lineEndIndexExclusive > input.lines.length
  ) return {
    status: "blocked",
    code: "invalid-line-window",
    message: "line window is outside request lines",
  }

  const selected = input.lines.slice(input.lineStartIndex, input.lineEndIndexExclusive)
  const first = selected[0]!
  const last = selected.at(-1)!
  let expectedStart = first.renderStartOffset
  for (let offset = 0; offset < selected.length; offset += 1) {
    const line = selected[offset]!
    if (
      line.index !== input.lineStartIndex + offset
      || !Number.isSafeInteger(line.renderStartOffset)
      || !Number.isSafeInteger(line.renderEndOffset)
      || line.renderStartOffset !== expectedStart
      || line.renderEndOffset <= line.renderStartOffset
      || line.renderEndOffset > input.measurement.renderedText.length
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, line.renderStartOffset)
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, line.renderEndOffset)
    ) return {
      status: "blocked",
      code: "invalid-line-range",
      message: "selected lines are not contiguous safe rendered ranges",
    }
    expectedStart = line.renderEndOffset
  }
  const previousLineEnd = input.lineStartIndex === 0
    ? 0
    : input.lines[input.lineStartIndex - 1]!.renderEndOffset
  const nextLineStart = input.lineEndIndexExclusive === input.lines.length
    ? input.measurement.renderedText.length
    : input.lines[input.lineEndIndexExclusive]!.renderStartOffset
  if (first.renderStartOffset !== previousLineEnd || last.renderEndOffset !== nextLineStart) return {
    status: "blocked",
    code: "invalid-line-range",
    message: "selected lines do not join their request neighbors",
  }

  const shapingStart = lowerBoundByEnd(input.shapingRuns, first.renderStartOffset)
  let shapingEnd = shapingStart
  while (
    shapingEnd < input.shapingRuns.length
    && input.shapingRuns[shapingEnd]!.renderStartOffset < last.renderEndOffset
  ) shapingEnd += 1
  const shapingRuns = input.shapingRuns.slice(shapingStart, shapingEnd)

  const sourceStart = lowerBoundByEnd(input.measurement.runs, first.renderStartOffset)
  let sourceEnd = sourceStart
  while (
    sourceEnd < input.measurement.runs.length
    && input.measurement.runs[sourceEnd]!.renderStartOffset < last.renderEndOffset
  ) sourceEnd += 1
  const sourceRuns = input.measurement.runs.slice(sourceStart, sourceEnd)

  let shapingRunCursor = 0
  let shapingClusterCursor = 0
  let sourceRunCursor = 0
  let visitedClusterCount = 0
  const lineFingerprints: string[] = []
  for (const line of selected) {
    const lineShapingRuns: VNextTextBlockResolvedShapingRunV1[] = []
    while (shapingRunCursor < shapingRuns.length) {
      const run = shapingRuns[shapingRunCursor]!
      while (
        shapingClusterCursor < run.clusters.length
        && run.clusters[shapingClusterCursor]!.renderEndOffset <= line.renderStartOffset
      ) shapingClusterCursor += 1
      if (shapingClusterCursor >= run.clusters.length) {
        shapingRunCursor += 1
        shapingClusterCursor = 0
        continue
      }
      if (run.clusters[shapingClusterCursor]!.renderStartOffset >= line.renderEndOffset) break
      const lineClusters: VNextTextBlockResolvedShapingRunV1["clusters"] = []
      while (
        shapingClusterCursor < run.clusters.length
        && run.clusters[shapingClusterCursor]!.renderStartOffset < line.renderEndOffset
      ) {
        lineClusters.push(run.clusters[shapingClusterCursor]!)
        shapingClusterCursor += 1
      }
      lineShapingRuns.push({ ...run, clusters: lineClusters })
      visitedClusterCount += lineClusters.length
      if (shapingClusterCursor >= run.clusters.length) {
        shapingRunCursor += 1
        shapingClusterCursor = 0
        continue
      }
      break
    }

    while (
      sourceRunCursor < sourceRuns.length
      && sourceRuns[sourceRunCursor]!.renderEndOffset <= line.renderStartOffset
    ) sourceRunCursor += 1
    const lineSourceRuns: VNextTextBlockV4MeasurementRun[] = []
    for (let runIndex = sourceRunCursor; runIndex < sourceRuns.length; runIndex += 1) {
      const run = sourceRuns[runIndex]!
      if (run.renderStartOffset >= line.renderEndOffset) break
      lineSourceRuns.push(run)
    }

    const facts = createSemanticRangeFactsFromBoundedInputs({
      measurement: input.measurement,
      shapingRuns: lineShapingRuns,
      sourceRuns: lineSourceRuns,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
    })
    if (facts.status === "blocked") return {
      status: "blocked",
      code: facts.code,
      message: facts.code === "invalid-cluster-range"
        ? "selected line contains a crossing or malformed shaping cluster"
        : "selected line does not retain exact ordered source coverage",
    }
    lineFingerprints.push(createVNextCompactFingerprint(JSON.stringify(facts.facts)))
  }

  return {
    status: "accepted",
    lineStartIndex: input.lineStartIndex,
    lineEndIndexExclusive: input.lineEndIndexExclusive,
    lineFingerprints,
    work: {
      lineFingerprintCount: lineFingerprints.length,
      visitedShapingRunCount: shapingRuns.length,
      visitedClusterCount,
      visitedSourceRunCount: sourceRuns.length,
      completeSemanticPassCount: 0,
    },
  }
}
