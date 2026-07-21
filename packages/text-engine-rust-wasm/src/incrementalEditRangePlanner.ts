import {
  createVNextCompactFingerprint,
  isVNextSafeUtf16TextOffset,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextBlockV4MeasurementRun,
} from "@flowdoc/vnext-core"
import type { FlowDocTextEngineIncrementalEditV1 } from "./incrementalReflowAnalysis.js"
import {
  inspectFlowDocTextEngineIncrementalRetainedSnapshotV1,
  type FlowDocTextEngineIncrementalLineCheckpointV1,
  type FlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  type FlowDocTextEngineIncrementalRetainedSnapshotV1,
} from "./incrementalRetainedSnapshot.js"

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_SOURCE =
  "flowdoc-text-engine-incremental-edit-range-plan-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_VERSION = 1 as const

export interface FlowDocTextEngineIncrementalEditRangePolicyV1 {
  restartLineLookbehindCount: number
  breakBoundaryPaddingCount: number
  shapeContextUtf16Length: number
  initialSegmentationContextUtf16Length: number
  maximumInitialRangeUtf16Length: number
}

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_POLICY_V1 = {
  restartLineLookbehindCount: 1,
  breakBoundaryPaddingCount: 1,
  shapeContextUtf16Length: 32,
  initialSegmentationContextUtf16Length: 32,
  maximumInitialRangeUtf16Length: 512,
} as const satisfies FlowDocTextEngineIncrementalEditRangePolicyV1

export type FlowDocTextEngineIncrementalEditRangeFallbackCodeV1 =
  | "invalid-snapshot"
  | "runtime-identity-mismatch"
  | "invalid-next-measurement"
  | "incompatible-measurement-context"
  | "invalid-edit"
  | "edit-does-not-reconstruct-next-text"
  | "hard-break-edited"
  | "source-run-topology-changed"
  | "multiple-source-runs-affected"
  | "edited-run-kind-unsupported"
  | "shaping-run-boundary-ambiguous"
  | "safe-break-boundary-not-found"
  | "initial-range-exceeded"

interface PlanFactsV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_VERSION
  textBlockId: string
  previousInstanceRevision: number
  nextInstanceRevision: number
  retainedSnapshotFingerprint: string
  rangeRuntimeIdentityFingerprint: string
  nextMeasurementFingerprint: string
  edit: FlowDocTextEngineIncrementalEditV1
  policy: FlowDocTextEngineIncrementalEditRangePolicyV1
  contracts: {
    execution: "retained-facts-range-plan-only"
    engineExecution: false
    lineAssembly: false
    coreAcceptance: false
    mayPublishLayout: false
    fullFallbackRequiredOnAmbiguity: true
    timingAffectsFingerprint: false
    rendererMayMeasureText: false
    productionBinding: false
  }
}

export type FlowDocTextEngineIncrementalEditRangePlanV1 =
  | (PlanFactsV1 & {
      status: "range-planned"
      fallback: null
      affectedSourceRun: {
        sourceRunIndex: number
        inlineId: string
        kind: "text"
        previousRenderStartOffset: number
        previousRenderEndOffset: number
        nextRenderStartOffset: number
        nextRenderEndOffset: number
      }
      affectedShapingRun: {
        shapingRunIndex: number
        shapingRunId: string
        styleKey: string
        fontFaceId: string
        fontSizeLayoutUnit: number
        textColor: string
        previousRenderStartOffset: number
        previousRenderEndOffset: number
        nextRenderStartOffset: number
        nextRenderEndOffset: number
        retainedFingerprint: string
      }
      restart: {
        affectedPreviousLineIndex: number
        previousRestartLineIndex: number
        previousRestartOffset: number
        projectedNextRestartOffset: number
        checkpoint: FlowDocTextEngineIncrementalLineCheckpointV1
      }
      engineRange: {
        previous: {
          globalStartUtf16: number
          globalEndUtf16: number
          runLocalStartUtf16: number
          runLocalEndUtf16: number
        }
        nextShaping: {
          globalStartUtf16: number
          globalEndUtf16: number
          runLocalStartUtf16: number
          runLocalEndUtf16: number
          contextGlobalStartUtf16: number
          contextGlobalEndUtf16: number
          contextRunLocalStartUtf16: number
          contextRunLocalEndUtf16: number
        }
        nextSegmentation: {
          targetStartUtf16: number
          targetEndUtf16: number
          initialContextStartUtf16: number
          initialContextEndUtf16: number
        }
      }
      work: {
        sourceRunComparisonCount: number
        shapingRunSearchCount: number
        safeBreakCandidateCount: number
        previousRangeUtf16Length: number
        nextRangeUtf16Length: number
        retainedPrefixClusterCount: number
        retainedSuffixClusterCount: number
      }
      fingerprint: string
    })
  | (PlanFactsV1 & {
      status: "fallback-required"
      fallback: {
        code: FlowDocTextEngineIncrementalEditRangeFallbackCodeV1
        message: string
      }
      affectedSourceRun: null
      affectedShapingRun: null
      restart: null
      engineRange: null
      work: {
        sourceRunComparisonCount: number
        shapingRunSearchCount: number
        safeBreakCandidateCount: number
      }
      fingerprint: string
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function nonBlank(value: string): boolean {
  return value.trim().length > 0
}

function validPolicy(policy: FlowDocTextEngineIncrementalEditRangePolicyV1): boolean {
  return Number.isSafeInteger(policy.restartLineLookbehindCount)
    && policy.restartLineLookbehindCount >= 0
    && policy.restartLineLookbehindCount <= 8
    && Number.isSafeInteger(policy.breakBoundaryPaddingCount)
    && policy.breakBoundaryPaddingCount >= 0
    && policy.breakBoundaryPaddingCount <= 8
    && Number.isSafeInteger(policy.shapeContextUtf16Length)
    && policy.shapeContextUtf16Length >= 1
    && Number.isSafeInteger(policy.initialSegmentationContextUtf16Length)
    && policy.initialSegmentationContextUtf16Length >= 1
    && Number.isSafeInteger(policy.maximumInitialRangeUtf16Length)
    && policy.maximumInitialRangeUtf16Length >= 1
}

function validMeasurement(measurement: VNextTextBlockV4MeasurementRequest): boolean {
  if (
    !nonBlank(measurement.documentId)
    || !Number.isSafeInteger(measurement.instanceRevision)
    || measurement.instanceRevision < 0
    || !nonBlank(measurement.sectionId)
    || !nonBlank(measurement.textBlockId)
    || !Number.isFinite(measurement.availableWidthPt)
    || measurement.availableWidthPt <= 0
    || !nonBlank(measurement.measurementProfileId)
    || !nonBlank(measurement.styleKey)
    || measurement.renderedText.length === 0
    || measurement.runs.length === 0
  ) return false
  let expectedStartOffset = 0
  for (const run of measurement.runs) {
    if (
      !nonBlank(run.inlineId)
      || !Number.isSafeInteger(run.renderStartOffset)
      || !Number.isSafeInteger(run.renderEndOffset)
      || run.renderStartOffset !== expectedStartOffset
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > measurement.renderedText.length
      || !isVNextSafeUtf16TextOffset(measurement.renderedText, run.renderStartOffset)
      || !isVNextSafeUtf16TextOffset(measurement.renderedText, run.renderEndOffset)
      || run.renderedText !== measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      || (run.kind === "hard-break" && !/^(?:\r\n|\r|\n)$/u.test(run.renderedText))
      || (run.kind === "resolved-field" && !nonBlank(run.fieldKey ?? ""))
    ) return false
    expectedStartOffset = run.renderEndOffset
  }
  return expectedStartOffset === measurement.renderedText.length
}

function sameRunTopology(
  previous: VNextTextBlockV4MeasurementRun,
  next: VNextTextBlockV4MeasurementRun,
): boolean {
  return previous.inlineId === next.inlineId
    && previous.kind === next.kind
    && previous.fieldKey === next.fieldKey
    && previous.styleKey === next.styleKey
    && sameJson(previous.localStyle ?? null, next.localStyle ?? null)
}

function lineForOffset(
  lines: readonly FlowDocTextEngineIncrementalRetainedSnapshotV1["lines"][number][],
  offset: number,
): number {
  const containing = lines.findIndex((line) => offset >= line.renderStartOffset && offset < line.renderEndOffset)
  if (containing >= 0) return containing
  const following = lines.findIndex((line) => line.renderStartOffset >= offset)
  return following >= 0 ? following : Math.max(0, lines.length - 1)
}

function expandStartToSafeBoundary(text: string, offset: number): number {
  return isVNextSafeUtf16TextOffset(text, offset) ? offset : offset - 1
}

function expandEndToSafeBoundary(text: string, offset: number): number {
  return isVNextSafeUtf16TextOffset(text, offset) ? offset : offset + 1
}

function totalClusterCount(snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1): number {
  return snapshot.shapingRuns.reduce((sum, run) => sum + run.clusters.length, 0)
}

export function planFlowDocTextEngineIncrementalEditRangeV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  edit: FlowDocTextEngineIncrementalEditV1
  policy?: FlowDocTextEngineIncrementalEditRangePolicyV1
}): FlowDocTextEngineIncrementalEditRangePlanV1 {
  const policy = clone(input.policy ?? FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_POLICY_V1)
  const edit = clone(input.edit)
  const nextMeasurement = clone(input.nextMeasurement)
  const base: PlanFactsV1 = {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_PLAN_VERSION,
    textBlockId: input.snapshot.textBlockId,
    previousInstanceRevision: input.snapshot.instanceRevision,
    nextInstanceRevision: nextMeasurement.instanceRevision,
    retainedSnapshotFingerprint: input.snapshot.fingerprint,
    rangeRuntimeIdentityFingerprint: input.rangeRuntimeIdentity.fingerprint,
    nextMeasurementFingerprint: createVNextCompactFingerprint(JSON.stringify(nextMeasurement)),
    edit,
    policy,
    contracts: {
      execution: "retained-facts-range-plan-only",
      engineExecution: false,
      lineAssembly: false,
      coreAcceptance: false,
      mayPublishLayout: false,
      fullFallbackRequiredOnAmbiguity: true,
      timingAffectsFingerprint: false,
      rendererMayMeasureText: false,
      productionBinding: false,
    },
  }
  let sourceRunComparisonCount = 0
  let shapingRunSearchCount = 0
  let safeBreakCandidateCount = 0
  const fallback = (
    code: FlowDocTextEngineIncrementalEditRangeFallbackCodeV1,
    message: string,
  ): FlowDocTextEngineIncrementalEditRangePlanV1 => {
    const facts = {
      ...base,
      status: "fallback-required" as const,
      fallback: { code, message },
      affectedSourceRun: null,
      affectedShapingRun: null,
      restart: null,
      engineRange: null,
      work: { sourceRunComparisonCount, shapingRunSearchCount, safeBreakCandidateCount },
    }
    return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
  }

  const snapshotInspection = inspectFlowDocTextEngineIncrementalRetainedSnapshotV1({
    snapshot: input.snapshot,
    rangeRuntimeIdentity: input.rangeRuntimeIdentity,
  })
  if (snapshotInspection.status === "invalid") return fallback(
    snapshotInspection.code === "runtime-identity-mismatch" ? "runtime-identity-mismatch" : "invalid-snapshot",
    snapshotInspection.message,
  )
  if (!validPolicy(policy) || !validMeasurement(nextMeasurement)) return fallback(
    "invalid-next-measurement",
    "next measurement or incremental range policy is invalid",
  )

  const previousMeasurement = input.snapshot.measurement
  if (
    nextMeasurement.documentId !== previousMeasurement.documentId
    || nextMeasurement.sectionId !== previousMeasurement.sectionId
    || nextMeasurement.textBlockId !== previousMeasurement.textBlockId
    || nextMeasurement.measurementProfileId !== previousMeasurement.measurementProfileId
    || nextMeasurement.availableWidthPt !== previousMeasurement.availableWidthPt
    || nextMeasurement.styleKey !== previousMeasurement.styleKey
    || nextMeasurement.instanceRevision <= previousMeasurement.instanceRevision
  ) return fallback(
    "incompatible-measurement-context",
    "document, TextBlock, width, style, profile, and increasing revision must remain compatible",
  )

  const previousText = previousMeasurement.renderedText
  const nextText = nextMeasurement.renderedText
  const validEdit = Number.isSafeInteger(edit.previousStartOffset)
    && Number.isSafeInteger(edit.previousEndOffset)
    && Number.isSafeInteger(edit.nextEndOffset)
    && edit.previousStartOffset >= 0
    && edit.previousEndOffset >= edit.previousStartOffset
    && edit.previousEndOffset <= previousText.length
    && edit.nextEndOffset >= edit.previousStartOffset
    && edit.nextEndOffset <= nextText.length
    && isVNextSafeUtf16TextOffset(previousText, edit.previousStartOffset)
    && isVNextSafeUtf16TextOffset(previousText, edit.previousEndOffset)
    && isVNextSafeUtf16TextOffset(nextText, edit.previousStartOffset)
    && isVNextSafeUtf16TextOffset(nextText, edit.nextEndOffset)
    && !(edit.previousStartOffset === edit.previousEndOffset && edit.nextEndOffset === edit.previousStartOffset)
  if (!validEdit) return fallback("invalid-edit", "edit offsets must describe one non-empty UTF-16-safe replacement")

  const insertedText = nextText.slice(edit.previousStartOffset, edit.nextEndOffset)
  const removedText = previousText.slice(edit.previousStartOffset, edit.previousEndOffset)
  const reconstructed = previousText.slice(0, edit.previousStartOffset)
    + insertedText
    + previousText.slice(edit.previousEndOffset)
  if (reconstructed !== nextText) return fallback(
    "edit-does-not-reconstruct-next-text",
    "the declared replacement does not exactly reconstruct the next measurement text",
  )
  if (/\r|\n/u.test(insertedText) || /\r|\n/u.test(removedText)) return fallback(
    "hard-break-edited",
    "MR1-K does not incrementally insert, remove, or replace hard breaks",
  )

  if (previousMeasurement.runs.length !== nextMeasurement.runs.length) return fallback(
    "source-run-topology-changed",
    "source run count changed",
  )
  for (let index = 0; index < previousMeasurement.runs.length; index += 1) {
    sourceRunComparisonCount += 1
    if (!sameRunTopology(previousMeasurement.runs[index]!, nextMeasurement.runs[index]!)) return fallback(
      "source-run-topology-changed",
      "source run identity, kind, field, or style topology changed",
    )
  }

  const changedRunIndexes = previousMeasurement.runs.flatMap((previousRun, index) => (
    previousRun.renderedText === nextMeasurement.runs[index]!.renderedText ? [] : [index]
  ))
  if (changedRunIndexes.length !== 1) return fallback(
    "multiple-source-runs-affected",
    "the first planner requires exactly one changed source run",
  )
  const sourceRunIndex = changedRunIndexes[0]!
  const previousSourceRun = previousMeasurement.runs[sourceRunIndex]!
  const nextSourceRun = nextMeasurement.runs[sourceRunIndex]!
  if (previousSourceRun.kind !== "text" || nextSourceRun.kind !== "text") return fallback(
    "edited-run-kind-unsupported",
    "MR1-K edits text runs only; resolved fields and other run kinds are retained facts",
  )
  const offsetDelta = edit.nextEndOffset - edit.previousEndOffset
  const localStart = edit.previousStartOffset - previousSourceRun.renderStartOffset
  const localEnd = edit.previousEndOffset - previousSourceRun.renderStartOffset
  if (
    edit.previousStartOffset < previousSourceRun.renderStartOffset
    || edit.previousEndOffset > previousSourceRun.renderEndOffset
    || edit.previousStartOffset < nextSourceRun.renderStartOffset
    || edit.nextEndOffset > nextSourceRun.renderEndOffset
    || previousSourceRun.renderStartOffset !== nextSourceRun.renderStartOffset
    || previousSourceRun.renderEndOffset + offsetDelta !== nextSourceRun.renderEndOffset
    || previousSourceRun.renderedText.slice(0, localStart)
      + insertedText
      + previousSourceRun.renderedText.slice(localEnd) !== nextSourceRun.renderedText
  ) return fallback(
    "multiple-source-runs-affected",
    "the replacement does not stay inside exactly one stable text run",
  )
  for (let index = 0; index < previousMeasurement.runs.length; index += 1) {
    if (index === sourceRunIndex) continue
    const previousRun = previousMeasurement.runs[index]!
    const nextRun = nextMeasurement.runs[index]!
    const expectedShift = index > sourceRunIndex ? offsetDelta : 0
    if (
      nextRun.renderStartOffset !== previousRun.renderStartOffset + expectedShift
      || nextRun.renderEndOffset !== previousRun.renderEndOffset + expectedShift
      || nextRun.renderedText !== previousRun.renderedText
    ) return fallback(
      "multiple-source-runs-affected",
      "an unchanged source run does not retain its text and projected offsets",
    )
  }

  const shapingCandidates = input.snapshot.shapingRuns.flatMap((run, shapingRunIndex) => {
    shapingRunSearchCount += 1
    return previousSourceRun.renderStartOffset >= run.renderStartOffset
      && previousSourceRun.renderEndOffset <= run.renderEndOffset
      && edit.previousStartOffset >= run.renderStartOffset
      && edit.previousEndOffset <= run.renderEndOffset
      ? [{ run, shapingRunIndex }]
      : []
  })
  if (shapingCandidates.length !== 1) return fallback(
    "shaping-run-boundary-ambiguous",
    "the edited source run does not map to exactly one retained shaping run",
  )
  const { run: shapingRun, shapingRunIndex } = shapingCandidates[0]!
  const nextShapingRunStart = shapingRun.renderStartOffset
  const nextShapingRunEnd = shapingRun.renderEndOffset + offsetDelta
  if (nextShapingRunEnd <= nextShapingRunStart) return fallback(
    "shaping-run-boundary-ambiguous",
    "the edit removes the complete affected shaping run",
  )

  const safeBreaks = [...new Set([
    shapingRun.renderStartOffset,
    ...input.snapshot.breakOffsets.filter((offset) => (
      offset >= shapingRun.renderStartOffset && offset <= shapingRun.renderEndOffset
    )),
    shapingRun.renderEndOffset,
  ])].sort((left, right) => left - right)
  safeBreakCandidateCount = safeBreaks.length
  let leftIndex = -1
  let rightIndex = -1
  safeBreaks.forEach((offset, index) => {
    if (offset <= edit.previousStartOffset) leftIndex = index
    if (rightIndex < 0 && offset >= edit.previousEndOffset) rightIndex = index
  })
  if (leftIndex < 0 || rightIndex < 0) return fallback(
    "safe-break-boundary-not-found",
    "no retained line-break and cluster-safe range contains the edit",
  )
  leftIndex = Math.max(0, leftIndex - policy.breakBoundaryPaddingCount)
  rightIndex = Math.min(safeBreaks.length - 1, rightIndex + policy.breakBoundaryPaddingCount)
  if (rightIndex <= leftIndex) {
    if (rightIndex < safeBreaks.length - 1) rightIndex += 1
    else if (leftIndex > 0) leftIndex -= 1
  }
  const previousRangeStart = safeBreaks[leftIndex]!
  const previousRangeEnd = safeBreaks[rightIndex]!
  if (previousRangeEnd <= previousRangeStart) return fallback(
    "safe-break-boundary-not-found",
    "retained safe boundaries do not produce one non-empty shaping range",
  )
  const nextRangeStart = previousRangeStart
  const nextRangeEnd = previousRangeEnd + offsetDelta
  if (
    nextRangeStart < nextShapingRunStart
    || nextRangeEnd > nextShapingRunEnd
    || nextRangeEnd <= nextRangeStart
    || !isVNextSafeUtf16TextOffset(nextText, nextRangeStart)
    || !isVNextSafeUtf16TextOffset(nextText, nextRangeEnd)
  ) return fallback(
    "safe-break-boundary-not-found",
    "the projected next shaping range is not one safe non-empty scalar range",
  )
  const previousRangeLength = previousRangeEnd - previousRangeStart
  const nextRangeLength = nextRangeEnd - nextRangeStart
  if (
    previousRangeLength > policy.maximumInitialRangeUtf16Length
    || nextRangeLength > policy.maximumInitialRangeUtf16Length
  ) return fallback(
    "initial-range-exceeded",
    "the initial token/break-aligned shaping range exceeds the configured bound",
  )

  const shapeContextStart = expandStartToSafeBoundary(
    nextText,
    Math.max(nextShapingRunStart, nextRangeStart - policy.shapeContextUtf16Length),
  )
  const shapeContextEnd = expandEndToSafeBoundary(
    nextText,
    Math.min(nextShapingRunEnd, nextRangeEnd + policy.shapeContextUtf16Length),
  )
  const segmentationContextStart = expandStartToSafeBoundary(
    nextText,
    Math.max(0, nextRangeStart - policy.initialSegmentationContextUtf16Length),
  )
  const segmentationContextEnd = expandEndToSafeBoundary(
    nextText,
    Math.min(nextText.length, nextRangeEnd + policy.initialSegmentationContextUtf16Length),
  )
  const affectedPreviousLineIndex = lineForOffset(input.snapshot.lines, edit.previousStartOffset)
  const previousRestartLineIndex = Math.max(
    0,
    affectedPreviousLineIndex - policy.restartLineLookbehindCount,
  )
  const checkpoint = clone(input.snapshot.lineCheckpoints[previousRestartLineIndex]!)
  const previousRestartOffset = checkpoint.renderStartOffset
  const allClusters = input.snapshot.shapingRuns.flatMap((item) => item.clusters).sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
  ))
  const retainedPrefixClusterCount = allClusters.filter((cluster) => (
    cluster.renderEndOffset <= previousRangeStart
  )).length
  const retainedSuffixClusterCount = totalClusterCount(input.snapshot) - allClusters.filter((cluster) => (
    cluster.renderStartOffset < previousRangeEnd
  )).length
  const facts = {
    ...base,
    status: "range-planned" as const,
    fallback: null,
    affectedSourceRun: {
      sourceRunIndex,
      inlineId: previousSourceRun.inlineId,
      kind: "text" as const,
      previousRenderStartOffset: previousSourceRun.renderStartOffset,
      previousRenderEndOffset: previousSourceRun.renderEndOffset,
      nextRenderStartOffset: nextSourceRun.renderStartOffset,
      nextRenderEndOffset: nextSourceRun.renderEndOffset,
    },
    affectedShapingRun: {
      shapingRunIndex,
      shapingRunId: shapingRun.shapingRunId,
      styleKey: shapingRun.styleKey,
      fontFaceId: shapingRun.fontFaceId,
      fontSizeLayoutUnit: shapingRun.fontSizeLayoutUnit,
      textColor: shapingRun.textColor,
      previousRenderStartOffset: shapingRun.renderStartOffset,
      previousRenderEndOffset: shapingRun.renderEndOffset,
      nextRenderStartOffset: nextShapingRunStart,
      nextRenderEndOffset: nextShapingRunEnd,
      retainedFingerprint: shapingRun.fingerprint,
    },
    restart: {
      affectedPreviousLineIndex,
      previousRestartLineIndex,
      previousRestartOffset,
      projectedNextRestartOffset: previousRestartOffset,
      checkpoint,
    },
    engineRange: {
      previous: {
        globalStartUtf16: previousRangeStart,
        globalEndUtf16: previousRangeEnd,
        runLocalStartUtf16: previousRangeStart - shapingRun.renderStartOffset,
        runLocalEndUtf16: previousRangeEnd - shapingRun.renderStartOffset,
      },
      nextShaping: {
        globalStartUtf16: nextRangeStart,
        globalEndUtf16: nextRangeEnd,
        runLocalStartUtf16: nextRangeStart - nextShapingRunStart,
        runLocalEndUtf16: nextRangeEnd - nextShapingRunStart,
        contextGlobalStartUtf16: shapeContextStart,
        contextGlobalEndUtf16: shapeContextEnd,
        contextRunLocalStartUtf16: shapeContextStart - nextShapingRunStart,
        contextRunLocalEndUtf16: shapeContextEnd - nextShapingRunStart,
      },
      nextSegmentation: {
        targetStartUtf16: nextRangeStart,
        targetEndUtf16: nextRangeEnd,
        initialContextStartUtf16: segmentationContextStart,
        initialContextEndUtf16: segmentationContextEnd,
      },
    },
    work: {
      sourceRunComparisonCount,
      shapingRunSearchCount,
      safeBreakCandidateCount,
      previousRangeUtf16Length: previousRangeLength,
      nextRangeUtf16Length: nextRangeLength,
      retainedPrefixClusterCount,
      retainedSuffixClusterCount,
    },
  }
  return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
}
