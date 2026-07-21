import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextTextBlockV4MeasurementRequest } from "../pagination/textBlockV4Measurement.js"
import {
  createVNextTextBlockMultiRunSourceSegmentsV1,
  deriveVNextTextBlockMultiRunAcceptedRunsV1,
  positionVNextTextBlockMultiRunLineWindowV1,
  safeVNextTextBlockMultiRunSumV1,
} from "./textBlockMultiRunDerivationV1.js"
import {
  VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_ACCEPTANCE_SOURCE,
  VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION,
} from "./textBlockMultiRunIncrementalContractV1.js"
import type {
  VNextTextBlockMultiRunIncrementalAcceptanceV1,
  VNextTextBlockMultiRunIncrementalEditV1,
  VNextTextBlockMultiRunIncrementalFallbackCodeV1,
  VNextTextBlockMultiRunIncrementalSnapshotV1,
  VNextTextBlockMultiRunIncrementalWindowProofV1,
} from "./textBlockMultiRunIncrementalContractV1.js"
import type {
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import { inspectVNextTextBlockMultiRunIncrementalSnapshotV1 } from "./textBlockMultiRunIncrementalSnapshotV1.js"
import { createVNextTextBlockMultiRunSemanticLineFingerprintV1 } from "./textBlockMultiRunSemanticV1.js"

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

function validMeasurement(measurement: VNextTextBlockV4MeasurementRequest): boolean {
  if (
    measurement.renderedText.length === 0
    || measurement.runs.length === 0
    || !Number.isSafeInteger(measurement.instanceRevision)
    || measurement.instanceRevision < 0
  ) return false
  let cursor = 0
  for (const run of measurement.runs) {
    if (
      run.renderStartOffset !== cursor
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > measurement.renderedText.length
      || run.renderedText !== measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      || (run.kind === "hard-break" && !/^(?:\r\n|\r|\n)$/u.test(run.renderedText))
      || run.kind === "inline-image"
    ) return false
    cursor = run.renderEndOffset
  }
  return cursor === measurement.renderedText.length
}

function paintableIntervals(measurement: VNextTextBlockV4MeasurementRequest): Array<{ start: number; end: number }> {
  const intervals: Array<{ start: number; end: number }> = []
  measurement.runs.forEach((run) => {
    if (run.kind === "hard-break" || run.renderStartOffset === run.renderEndOffset) return
    const previous = intervals.at(-1)
    if (previous != null && previous.end === run.renderStartOffset) previous.end = run.renderEndOffset
    else intervals.push({ start: run.renderStartOffset, end: run.renderEndOffset })
  })
  return intervals
}

function validShapingFacts(request: VNextTextBlockMultiRunLayoutRequestV1): boolean {
  const faces = new Set(request.fontFaces.map((face) => face.fontFaceId))
  const ids = new Set<string>()
  for (const run of request.shapingRuns) {
    if (
      run.shapingRunId.trim().length === 0
      || ids.has(run.shapingRunId)
      || run.renderEndOffset <= run.renderStartOffset
      || run.text !== request.measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      || /[\r\n]/u.test(run.text)
      || !faces.has(run.fontFaceId)
      || !Number.isSafeInteger(run.fontSizeLayoutUnit)
      || run.fontSizeLayoutUnit <= 0
      || run.direction !== "ltr"
      || run.baselineShiftLayoutUnit !== 0
      || run.clusters.length === 0
    ) return false
    ids.add(run.shapingRunId)
    let clusterCursor = run.renderStartOffset
    for (let index = 0; index < run.clusters.length; index += 1) {
      const cluster = run.clusters[index]!
      if (
        cluster.index !== index
        || cluster.renderStartOffset !== clusterCursor
        || cluster.renderEndOffset <= cluster.renderStartOffset
        || cluster.renderEndOffset > run.renderEndOffset
        || !isVNextSafeUtf16TextOffset(request.measurement.renderedText, cluster.renderStartOffset)
        || !isVNextSafeUtf16TextOffset(request.measurement.renderedText, cluster.renderEndOffset)
        || !Number.isSafeInteger(cluster.advanceLayoutUnit)
        || cluster.advanceLayoutUnit < 0
      ) return false
      clusterCursor = cluster.renderEndOffset
    }
    if (
      clusterCursor !== run.renderEndOffset
      || safeVNextTextBlockMultiRunSumV1(run.clusters.map((cluster) => cluster.advanceLayoutUnit)) == null
    ) return false
  }
  const intervals = paintableIntervals(request.measurement)
  let runIndex = 0
  for (const interval of intervals) {
    let cursor = interval.start
    while (runIndex < request.shapingRuns.length && request.shapingRuns[runIndex]!.renderStartOffset < interval.end) {
      const run = request.shapingRuns[runIndex]!
      if (run.renderStartOffset !== cursor || run.renderEndOffset > interval.end) return false
      cursor = run.renderEndOffset
      runIndex += 1
    }
    if (cursor !== interval.end) return false
  }
  return runIndex === request.shapingRuns.length
}

function validBreaksAndLines(request: VNextTextBlockMultiRunLayoutRequestV1): boolean {
  if (
    request.breakOffsets[0] !== 0
    || request.breakOffsets.at(-1) !== request.measurement.renderedText.length
    || request.lines.length === 0
  ) return false
  let previousBreak = -1
  const breakSet = new Set<number>()
  for (const offset of request.breakOffsets) {
    if (
      !Number.isSafeInteger(offset)
      || offset <= previousBreak
      || !isVNextSafeUtf16TextOffset(request.measurement.renderedText, offset)
    ) return false
    breakSet.add(offset)
    previousBreak = offset
  }
  if (request.measurement.runs.some((run) => run.kind === "hard-break" && !breakSet.has(run.renderEndOffset))) {
    return false
  }
  const clusterBoundaries = new Set<number>([0, request.measurement.renderedText.length])
  request.shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  }))
  request.measurement.runs.filter((run) => run.kind === "hard-break").forEach((run) => {
    clusterBoundaries.add(run.renderStartOffset)
    clusterBoundaries.add(run.renderEndOffset)
  })
  let cursor = 0
  for (let index = 0; index < request.lines.length; index += 1) {
    const line = request.lines[index]!
    if (
      line.index !== index
      || line.renderStartOffset !== cursor
      || line.renderEndOffset <= line.renderStartOffset
      || !breakSet.has(line.renderStartOffset)
      || !breakSet.has(line.renderEndOffset)
      || !clusterBoundaries.has(line.renderStartOffset)
      || !clusterBoundaries.has(line.renderEndOffset)
    ) return false
    cursor = line.renderEndOffset
  }
  return cursor === request.measurement.renderedText.length
}

function normalizedClusterFacts(
  text: string,
  runs: readonly VNextTextBlockResolvedShapingRunV1[],
  startOffset: number,
  endOffset: number,
): unknown[] | null {
  const facts: unknown[] = []
  for (const run of runs) {
    for (const cluster of run.clusters) {
      if (cluster.renderEndOffset <= startOffset || cluster.renderStartOffset >= endOffset) continue
      if (cluster.renderStartOffset < startOffset || cluster.renderEndOffset > endOffset) return null
      facts.push({
        renderStartOffset: cluster.renderStartOffset - startOffset,
        renderEndOffset: cluster.renderEndOffset - startOffset,
        text: text.slice(cluster.renderStartOffset, cluster.renderEndOffset),
        advanceLayoutUnit: cluster.advanceLayoutUnit,
        styleKey: run.styleKey,
        fontFaceId: run.fontFaceId,
        fontSizeLayoutUnit: run.fontSizeLayoutUnit,
        textColor: run.textColor,
        direction: run.direction,
        baselineShiftLayoutUnit: run.baselineShiftLayoutUnit,
        features: run.features,
      })
    }
  }
  return facts
}

function normalizedSourceFacts(
  measurement: VNextTextBlockV4MeasurementRequest,
  startOffset: number,
  endOffset: number,
): unknown[] {
  return createVNextTextBlockMultiRunSourceSegmentsV1(measurement.runs, startOffset, endOffset)
    .map((segment) => ({
      inlineId: segment.inlineId,
      kind: segment.kind,
      ...(segment.fieldKey == null ? {} : { fieldKey: segment.fieldKey }),
      ...(segment.styleKey == null ? {} : { styleKey: segment.styleKey }),
      ...(segment.localStyle == null ? {} : { localStyle: segment.localStyle }),
      renderStartOffset: segment.renderStartOffset - startOffset,
      renderEndOffset: segment.renderEndOffset - startOffset,
      renderedText: segment.renderedText,
    }))
}

function semanticRangeMatches(input: {
  previous: VNextTextBlockMultiRunIncrementalSnapshotV1
  next: VNextTextBlockMultiRunLayoutRequestV1
  previousStart: number
  previousEnd: number
  nextStart: number
  nextEnd: number
}): boolean {
  const previousClusters = normalizedClusterFacts(
    input.previous.request.measurement.renderedText,
    input.previous.request.shapingRuns,
    input.previousStart,
    input.previousEnd,
  )
  const nextClusters = normalizedClusterFacts(
    input.next.measurement.renderedText,
    input.next.shapingRuns,
    input.nextStart,
    input.nextEnd,
  )
  return previousClusters != null
    && nextClusters != null
    && input.previous.request.measurement.renderedText.slice(input.previousStart, input.previousEnd)
      === input.next.measurement.renderedText.slice(input.nextStart, input.nextEnd)
    && sameJson(previousClusters, nextClusters)
    && sameJson(
      normalizedSourceFacts(input.previous.request.measurement, input.previousStart, input.previousEnd),
      normalizedSourceFacts(input.next.measurement, input.nextStart, input.nextEnd),
    )
}

function sameLineRange(
  left: { index: number; renderStartOffset: number; renderEndOffset: number },
  right: { index: number; renderStartOffset: number; renderEndOffset: number },
): boolean {
  return left.index === right.index
    && left.renderStartOffset === right.renderStartOffset
    && left.renderEndOffset === right.renderEndOffset
}

export function acceptVNextTextBlockMultiRunIncrementalWindowV1(input: {
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
}): VNextTextBlockMultiRunIncrementalAcceptanceV1 {
  const base = {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_ACCEPTANCE_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION,
    layoutId: input.nextRequest.layoutId,
    textBlockId: input.nextRequest.measurement.textBlockId,
    previousInstanceRevision: input.snapshot.request.measurement.instanceRevision,
    nextInstanceRevision: input.nextRequest.measurement.instanceRevision,
    snapshotFingerprint: input.snapshot.fingerprint,
    contracts: {
      coreAcceptsAffectedLineWindow: true,
      semanticIdentitySeparateFromPhysicalIds: true,
      physicalIdsAreRevisionSpecific: true,
      completeCoreLayoutOracleRequiredForQa: true,
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      mayPublishLayout: false,
      productionBinding: false,
    },
  } as const
  const fallback = (
    code: VNextTextBlockMultiRunIncrementalFallbackCodeV1,
    message: string,
  ): VNextTextBlockMultiRunIncrementalAcceptanceV1 => {
    const facts = {
      ...base,
      status: "fallback-required" as const,
      edit: null,
      references: null,
      work: null,
      fallback: { code, message },
    }
    return { ...facts, fingerprint: fingerprint(facts) }
  }

  const snapshotInspection = inspectVNextTextBlockMultiRunIncrementalSnapshotV1(input.snapshot)
  if (snapshotInspection.status !== "valid") return fallback(
    "snapshot-provenance-mismatch",
    snapshotInspection.message,
  )
  if (input.nextRequest.bindProductionLayout === true) return fallback(
    "production-binding-forbidden",
    "incremental window acceptance cannot bind a production layout",
  )
  const previousRequest = input.snapshot.request
  if (
    input.nextRequest.layoutId !== previousRequest.layoutId
    || input.nextRequest.measurement.documentId !== previousRequest.measurement.documentId
    || input.nextRequest.measurement.sectionId !== previousRequest.measurement.sectionId
    || input.nextRequest.measurement.textBlockId !== previousRequest.measurement.textBlockId
    || input.nextRequest.measurement.measurementProfileId !== previousRequest.measurement.measurementProfileId
    || input.nextRequest.measurement.availableWidthPt !== previousRequest.measurement.availableWidthPt
    || input.nextRequest.layoutUnitPolicyFingerprint !== previousRequest.layoutUnitPolicyFingerprint
    || input.nextRequest.availableWidthLayoutUnit !== previousRequest.availableWidthLayoutUnit
    || input.nextRequest.declaredLineHeightLayoutUnit !== previousRequest.declaredLineHeightLayoutUnit
    || !sameJson(input.nextRequest.paragraphStyle, previousRequest.paragraphStyle)
    || !sameJson(input.nextRequest.fontFaces, previousRequest.fontFaces)
  ) return fallback("layout-context-mismatch", "the retained and next layout contexts differ")
  if (input.nextRequest.measurement.instanceRevision <= previousRequest.measurement.instanceRevision) {
    return fallback("invalid-revision", "the next measurement revision must advance")
  }
  if (!validMeasurement(input.nextRequest.measurement)) return fallback(
    "invalid-next-measurement",
    "the next measurement is not a complete safe text measurement",
  )

  const edit = input.edit
  const previousText = previousRequest.measurement.renderedText
  const nextText = input.nextRequest.measurement.renderedText
  if (
    !Number.isSafeInteger(edit.previousStartOffset)
    || !Number.isSafeInteger(edit.previousEndOffset)
    || !Number.isSafeInteger(edit.nextEndOffset)
    || edit.previousStartOffset < 0
    || edit.previousEndOffset < edit.previousStartOffset
    || edit.previousEndOffset > previousText.length
    || edit.nextEndOffset < edit.previousStartOffset
    || edit.nextEndOffset > nextText.length
    || !isVNextSafeUtf16TextOffset(previousText, edit.previousStartOffset)
    || !isVNextSafeUtf16TextOffset(previousText, edit.previousEndOffset)
    || !isVNextSafeUtf16TextOffset(nextText, edit.previousStartOffset)
    || !isVNextSafeUtf16TextOffset(nextText, edit.nextEndOffset)
    || previousText.slice(0, edit.previousStartOffset) !== nextText.slice(0, edit.previousStartOffset)
    || previousText.slice(edit.previousEndOffset) !== nextText.slice(edit.nextEndOffset)
  ) return fallback("invalid-edit", "the edit does not exactly reconstruct the next rendered text")
  if (!validShapingFacts(input.nextRequest)) return fallback(
    "invalid-next-shaping-facts",
    "the next shaping facts are incomplete, unsafe, or do not cover the paintable text",
  )
  if (!validBreaksAndLines(input.nextRequest)) return fallback(
    "invalid-next-breaks-or-lines",
    "the next breaks and lines do not form one complete cluster-safe layout range",
  )

  const window = input.window
  const previousLines = input.snapshot.layout.lines
  const nextLines = input.nextRequest.lines
  const offsetDelta = edit.nextEndOffset - edit.previousEndOffset
  if (
    !Number.isSafeInteger(window.previousRestartLineIndex)
    || !Number.isSafeInteger(window.nextRestartLineIndex)
    || !Number.isSafeInteger(window.previousReconvergenceLineIndex)
    || !Number.isSafeInteger(window.nextReconvergenceLineIndex)
    || !Number.isSafeInteger(window.stableLineCount)
    || window.stableLineCount < 1
    || window.previousRestartLineIndex < 0
    || window.nextRestartLineIndex < 0
    || window.previousReconvergenceLineIndex < window.previousRestartLineIndex
    || window.nextReconvergenceLineIndex < window.nextRestartLineIndex
    || window.previousReconvergenceLineIndex >= previousLines.length
    || window.nextReconvergenceLineIndex >= nextLines.length
    || window.offsetDelta !== offsetDelta
    || previousLines[window.previousReconvergenceLineIndex]!.renderStartOffset
      !== window.previousReconvergenceOffset
    || nextLines[window.nextReconvergenceLineIndex]!.renderStartOffset
      !== window.nextReconvergenceOffset
    || window.nextReconvergenceOffset - window.previousReconvergenceOffset !== offsetDelta
    || previousLines.length - window.previousReconvergenceLineIndex
      !== nextLines.length - window.nextReconvergenceLineIndex
    || previousLines.length - window.previousReconvergenceLineIndex < window.stableLineCount
    || input.snapshot.suffixSemanticFingerprints[window.previousReconvergenceLineIndex]
      !== window.previousSuffixSemanticFingerprint
    || window.previousSuffixSemanticFingerprint !== window.nextSuffixSemanticFingerprint
  ) return fallback("invalid-window-proof", "the affected-line checkpoint proof is inconsistent")

  const previousRestartOffset = previousLines[window.previousRestartLineIndex]!.renderStartOffset
  const nextRestartOffset = nextLines[window.nextRestartLineIndex]!.renderStartOffset
  if (previousRestartOffset !== nextRestartOffset || window.previousRestartLineIndex !== window.nextRestartLineIndex) {
    return fallback("invalid-window-proof", "v1 requires an exact retained prefix restart line")
  }
  const prefixMatches = previousLines.slice(0, window.previousRestartLineIndex).every((line, index) => (
    sameLineRange(line, nextLines[index]!)
  ))
  if (
    !prefixMatches
    || !semanticRangeMatches({
      previous: input.snapshot,
      next: input.nextRequest,
      previousStart: 0,
      previousEnd: previousRestartOffset,
      nextStart: 0,
      nextEnd: nextRestartOffset,
    })
  ) return fallback("prefix-semantic-mismatch", "the retained prefix changed before the restart line")

  const lineIndexDelta = window.nextReconvergenceLineIndex - window.previousReconvergenceLineIndex
  const suffixMatches = previousLines.slice(window.previousReconvergenceLineIndex).every((line, index) => {
    const nextLine = nextLines[window.nextReconvergenceLineIndex + index]
    return nextLine != null
      && nextLine.index === line.index + lineIndexDelta
      && nextLine.renderStartOffset === line.renderStartOffset + offsetDelta
      && nextLine.renderEndOffset === line.renderEndOffset + offsetDelta
  })
  if (
    !suffixMatches
    || !semanticRangeMatches({
      previous: input.snapshot,
      next: input.nextRequest,
      previousStart: window.previousReconvergenceOffset,
      previousEnd: previousText.length,
      nextStart: window.nextReconvergenceOffset,
      nextEnd: nextText.length,
    })
  ) return fallback("suffix-semantic-mismatch", "the shifted suffix is not semantically reusable")

  const acceptedRuns = deriveVNextTextBlockMultiRunAcceptedRunsV1(input.nextRequest)
  if (acceptedRuns.status !== "accepted") return fallback(
    "affected-line-derivation-failed",
    acceptedRuns.message,
  )
  const affected = positionVNextTextBlockMultiRunLineWindowV1({
    request: input.nextRequest,
    acceptedRuns: acceptedRuns.value,
    lineStartIndex: window.nextRestartLineIndex,
    lineEndIndexExclusive: window.nextReconvergenceLineIndex,
    yOffsetLayoutUnit: previousLines[window.previousRestartLineIndex]!.yOffsetLayoutUnit,
  })
  if (affected.status !== "accepted") return fallback(
    "affected-line-derivation-failed",
    affected.message,
  )
  const previousReconvergenceY = previousLines[window.previousReconvergenceLineIndex]!.yOffsetLayoutUnit
  const yOffsetDeltaLayoutUnit = affected.value.endYOffsetLayoutUnit - previousReconvergenceY
  if (!Number.isSafeInteger(yOffsetDeltaLayoutUnit)) return fallback(
    "affected-line-derivation-failed",
    "the suffix y-offset transform exceeds the safe integer range",
  )

  const prefixSemanticFingerprint = window.previousRestartLineIndex === 0
    ? createVNextCompactFingerprint("text-block-multi-run-prefix-semantic:start:v1")
    : input.snapshot.prefixSemanticFingerprints[window.previousRestartLineIndex - 1]!
  const affectedSemanticFingerprint = fingerprint(affected.value.lines.map(
    createVNextTextBlockMultiRunSemanticLineFingerprintV1,
  ))
  const references = {
    prefix: {
      previousStartLineIndex: 0 as const,
      previousEndLineIndexExclusive: window.previousRestartLineIndex,
      nextStartLineIndex: 0 as const,
      nextEndLineIndexExclusive: window.nextRestartLineIndex,
      lineIndexDelta: 0 as const,
      offsetDelta: 0 as const,
      yOffsetDeltaLayoutUnit: 0 as const,
      semanticFingerprint: prefixSemanticFingerprint,
    },
    affected: {
      nextStartLineIndex: window.nextRestartLineIndex,
      nextEndLineIndexExclusive: window.nextReconvergenceLineIndex,
      lines: affected.value.lines,
      semanticFingerprint: affectedSemanticFingerprint,
    },
    suffix: {
      previousStartLineIndex: window.previousReconvergenceLineIndex,
      previousEndLineIndexExclusive: previousLines.length,
      nextStartLineIndex: window.nextReconvergenceLineIndex,
      nextEndLineIndexExclusive: nextLines.length,
      lineIndexDelta,
      offsetDelta,
      yOffsetDeltaLayoutUnit,
      semanticFingerprint: window.previousSuffixSemanticFingerprint,
    },
  }
  const facts = {
    ...base,
    status: "window-accepted" as const,
    edit: { ...edit },
    references,
    work: {
      reusedPrefixLineCount: references.prefix.previousEndLineIndexExclusive,
      positionedAffectedLineCount: references.affected.lines.length,
      reusedSuffixLineCount: references.suffix.previousEndLineIndexExclusive
        - references.suffix.previousStartLineIndex,
    },
    fallback: null,
  }
  return { ...facts, fingerprint: fingerprint(facts) }
}
