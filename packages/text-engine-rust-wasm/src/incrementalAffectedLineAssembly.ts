import {
  type VNextTextBlockMultiRunLineInputV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import type { FlowDocTextEngineIncrementalAffectedLinePolicyV1 } from "./incrementalAffectedLineWindow.js"
import type { FlowDocTextEngineIncrementalEditRangePlanV1 } from "./incrementalEditRangePlanner.js"
import type { FlowDocTextEngineIncrementalRetainedSnapshotV1 } from "./incrementalRetainedSnapshot.js"

type PlannedRange = Extract<FlowDocTextEngineIncrementalEditRangePlanV1, { status: "range-planned" }>

export type FlowDocTextEngineIncrementalAffectedLineAssemblyV1 =
  | {
      status: "accepted"
      lines: VNextTextBlockMultiRunLineInputV1[]
      affectedLines: VNextTextBlockMultiRunLineInputV1[]
      checkpoint: {
        previousRestartLineIndex: number
        nextRestartLineIndex: number
        previousReconvergenceLineIndex: number
        nextReconvergenceLineIndex: number
        previousReconvergenceOffset: number
        nextReconvergenceOffset: number
        offsetDelta: number
        stableLineCount: number
        previousSuffixSemanticFingerprint: string
        nextSuffixSemanticFingerprint: string
        previousSuffixSemanticRangeFingerprint: string
        nextSuffixSemanticRangeFingerprint: string
      }
      work: {
        reusedPrefixLineCount: number
        assembledAffectedLineCount: number
        generatedProofLineCount: number
        reusedSuffixLineCount: number
        reflowedNextUtf16Length: number
        breakCandidateCount: number
        clusterVisitCount: number
        reconvergenceCandidateCount: number
        semanticRangeComparisonCount: number
      }
    }
  | {
      status: "fallback-required"
      code:
        | "line-input-invalid"
        | "line-prefix-mismatch"
        | "line-reconvergence-not-found"
        | "line-window-exceeded"
        | "suffix-semantic-mismatch"
      message: string
    }

function lineInput(
  line: FlowDocTextEngineIncrementalRetainedSnapshotV1["lines"][number],
  index = line.index,
  offsetDelta = 0,
): VNextTextBlockMultiRunLineInputV1 {
  return {
    index,
    renderStartOffset: line.renderStartOffset + offsetDelta,
    renderEndOffset: line.renderEndOffset + offsetDelta,
  }
}

function validPolicy(policy: FlowDocTextEngineIncrementalAffectedLinePolicyV1): boolean {
  return Number.isSafeInteger(policy.stableLineCount)
    && policy.stableLineCount >= 1
    && Number.isSafeInteger(policy.maximumReflowLineCount)
    && policy.maximumReflowLineCount >= policy.stableLineCount
    && Number.isSafeInteger(policy.maximumReflowUtf16Length)
    && policy.maximumReflowUtf16Length >= 1
}

export function assembleFlowDocTextEngineIncrementalAffectedLinesV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: PlannedRange
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: readonly number[]
  policy: FlowDocTextEngineIncrementalAffectedLinePolicyV1
}): FlowDocTextEngineIncrementalAffectedLineAssemblyV1 {
  if (!validPolicy(input.policy)) return {
    status: "fallback-required",
    code: "line-input-invalid",
    message: "affected-line policy is invalid",
  }
  const restartIndex = input.plan.restart.previousRestartLineIndex
  const restartOffset = input.plan.restart.projectedNextRestartOffset
  const restartBreakIndex = input.breakOffsets.indexOf(restartOffset)
  if (
    restartIndex < 0
    || restartIndex >= input.snapshot.lines.length
    || restartBreakIndex < 0
    || input.snapshot.lines[restartIndex]?.renderStartOffset !== input.plan.restart.previousRestartOffset
    || input.plan.restart.previousRestartOffset !== restartOffset
  ) return {
    status: "fallback-required",
    code: "line-input-invalid",
    message: "retained restart checkpoint is not an exact unchanged next break boundary",
  }

  const semanticRangeComparisonCount = 0
  const prefix = input.snapshot.lines.slice(0, restartIndex).map((line) => lineInput(line))
  const clusters = input.shapingRuns.flatMap((run) => run.clusters).sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
  ))
  const cumulativeAtBreak: number[] = []
  let clusterIndex = 0
  let cumulative = 0
  let clusterVisitCount = 0
  for (const offset of input.breakOffsets) {
    while (clusterIndex < clusters.length && clusters[clusterIndex]!.renderEndOffset <= offset) {
      cumulative += clusters[clusterIndex]!.advanceLayoutUnit
      clusterVisitCount += 1
      if (!Number.isSafeInteger(cumulative)) return {
        status: "fallback-required",
        code: "line-input-invalid",
        message: "spliced cluster advances exceed the safe integer range",
      }
      clusterIndex += 1
    }
    if (clusters[clusterIndex] != null && clusters[clusterIndex]!.renderStartOffset < offset) return {
      status: "fallback-required",
      code: "line-input-invalid",
      message: "a spliced break boundary falls inside a cluster",
    }
    cumulativeAtBreak.push(cumulative)
  }

  const mandatoryBreakSet = new Set(input.nextMeasurement.runs
    .filter((run) => run.kind === "hard-break")
    .map((run) => run.renderEndOffset))
  const generated: VNextTextBlockMultiRunLineInputV1[] = []
  const offsetDelta = input.plan.edit.nextEndOffset - input.plan.edit.previousEndOffset
  let startBreakIndex = restartBreakIndex
  let reconvergence: {
    generatedLineIndex: number
    previousLineIndex: number
    nextLineIndex: number
  } | null = null
  let reconvergenceCandidateCount = 0

  while (startBreakIndex < input.breakOffsets.length - 1) {
    let endBreakIndex = startBreakIndex + 1
    let foundFittingBreak = false
    for (let candidateIndex = startBreakIndex + 1; candidateIndex < input.breakOffsets.length; candidateIndex += 1) {
      const candidateWidth = cumulativeAtBreak[candidateIndex]! - cumulativeAtBreak[startBreakIndex]!
      if (candidateWidth <= input.snapshot.layoutContext.availableWidthLayoutUnit) {
        endBreakIndex = candidateIndex
        foundFittingBreak = true
        if (mandatoryBreakSet.has(input.breakOffsets[candidateIndex]!)) break
        continue
      }
      if (!foundFittingBreak) endBreakIndex = candidateIndex
      break
    }
    const nextLineIndex = restartIndex + generated.length
    const line = {
      index: nextLineIndex,
      renderStartOffset: input.breakOffsets[startBreakIndex]!,
      renderEndOffset: input.breakOffsets[endBreakIndex]!,
    }
    generated.push(line)
    startBreakIndex = endBreakIndex

    if (generated.length >= input.policy.stableLineCount) {
      const candidateGeneratedIndex = generated.length - input.policy.stableLineCount
      const candidateLine = generated[candidateGeneratedIndex]!
      if (candidateLine.renderStartOffset >= input.plan.edit.nextEndOffset) {
        const previousStart = candidateLine.renderStartOffset - offsetDelta
        const previousLineIndex = input.snapshot.lines.findIndex((previousLine) => (
          previousLine.renderStartOffset === previousStart
        ))
        if (previousLineIndex >= 0) {
          reconvergenceCandidateCount += 1
          const stableRangesMatch = Array.from({ length: input.policy.stableLineCount }).every((_, stableIndex) => {
            const previousLine = input.snapshot.lines[previousLineIndex + stableIndex]
            const candidate = generated[candidateGeneratedIndex + stableIndex]
            return previousLine != null
              && candidate != null
              && candidate.renderStartOffset === previousLine.renderStartOffset + offsetDelta
              && candidate.renderEndOffset === previousLine.renderEndOffset + offsetDelta
          })
          const previousSuffixLength = input.snapshot.measurement.renderedText.length - previousStart
          const nextSuffixLength = input.nextMeasurement.renderedText.length - candidateLine.renderStartOffset
          if (
            stableRangesMatch
            && previousSuffixLength === nextSuffixLength
          ) reconvergence = {
            generatedLineIndex: candidateGeneratedIndex,
            previousLineIndex,
            nextLineIndex: restartIndex + candidateGeneratedIndex,
          }
        }
      }
    }
    if (reconvergence != null) break
    const possibleAffectedCount = Math.max(0, generated.length - input.policy.stableLineCount)
    const generatedEnd = generated.at(-1)!.renderEndOffset
    if (
      possibleAffectedCount > input.policy.maximumReflowLineCount
      || generatedEnd - restartOffset > input.policy.maximumReflowUtf16Length
    ) return {
      status: "fallback-required",
      code: "line-window-exceeded",
      message: "affected-line assembly exceeded the bounded line or UTF-16 window",
    }
  }

  if (reconvergence == null) return {
    status: "fallback-required",
    code: "line-reconvergence-not-found",
    message: "no exact stable semantic suffix reconvergence was found",
  }
  const affectedLines = generated.slice(0, reconvergence.generatedLineIndex)
  const nextReconvergenceOffset = generated[reconvergence.generatedLineIndex]!.renderStartOffset
  const reflowedNextUtf16Length = nextReconvergenceOffset - restartOffset
  if (
    affectedLines.length > input.policy.maximumReflowLineCount
    || reflowedNextUtf16Length > input.policy.maximumReflowUtf16Length
  ) return {
    status: "fallback-required",
    code: "line-window-exceeded",
    message: "the proved reconvergence point exceeds the bounded affected-line window",
  }
  const suffix = input.snapshot.lines.slice(reconvergence.previousLineIndex).map((line, index) => (
    lineInput(line, prefix.length + affectedLines.length + index, offsetDelta)
  ))
  const lines = [...prefix, ...affectedLines, ...suffix]
  const breakSet = new Set(input.breakOffsets)
  const clusterBoundaries = new Set<number>([0, input.nextMeasurement.renderedText.length])
  clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  })
  input.nextMeasurement.runs.filter((run) => run.kind === "hard-break").forEach((run) => {
    clusterBoundaries.add(run.renderStartOffset)
    clusterBoundaries.add(run.renderEndOffset)
  })
  let expectedStart = 0
  const invalidLine = lines.some((line, index) => {
    const invalid = line.index !== index
      || line.renderStartOffset !== expectedStart
      || line.renderEndOffset <= line.renderStartOffset
      || !breakSet.has(line.renderStartOffset)
      || !breakSet.has(line.renderEndOffset)
      || !clusterBoundaries.has(line.renderStartOffset)
      || !clusterBoundaries.has(line.renderEndOffset)
    expectedStart = line.renderEndOffset
    return invalid
  })
  if (invalidLine || expectedStart !== input.nextMeasurement.renderedText.length) return {
    status: "fallback-required",
    code: "line-input-invalid",
    message: "the composed prefix, affected window, and shifted suffix do not form complete safe lines",
  }
  const suffixFingerprint = input.snapshot.lineCheckpoints[
    reconvergence.previousLineIndex
  ]!.suffixSemanticFingerprint
  const suffixSemanticRangeFingerprint = input.snapshot.lineCheckpoints[
    reconvergence.previousLineIndex
  ]!.suffixSemanticRangeFingerprint
  return {
    status: "accepted",
    lines,
    affectedLines,
    checkpoint: {
      previousRestartLineIndex: restartIndex,
      nextRestartLineIndex: restartIndex,
      previousReconvergenceLineIndex: reconvergence.previousLineIndex,
      nextReconvergenceLineIndex: reconvergence.nextLineIndex,
      previousReconvergenceOffset: input.snapshot.lines[
        reconvergence.previousLineIndex
      ]!.renderStartOffset,
      nextReconvergenceOffset,
      offsetDelta,
      stableLineCount: input.policy.stableLineCount,
      previousSuffixSemanticFingerprint: suffixFingerprint,
      nextSuffixSemanticFingerprint: suffixFingerprint,
      previousSuffixSemanticRangeFingerprint: suffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: suffixSemanticRangeFingerprint,
    },
    work: {
      reusedPrefixLineCount: prefix.length,
      assembledAffectedLineCount: affectedLines.length,
      generatedProofLineCount: generated.length,
      reusedSuffixLineCount: suffix.length,
      reflowedNextUtf16Length,
      breakCandidateCount: input.breakOffsets.length - restartBreakIndex,
      clusterVisitCount,
      reconvergenceCandidateCount,
      semanticRangeComparisonCount,
    },
  }
}
