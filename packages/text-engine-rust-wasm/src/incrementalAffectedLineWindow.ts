import type {
  VNextTextBlockMultiRunLineInputV1,
  VNextTextBlockResolvedShapingRunV1,
  VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import type { FlowDocTextEngineIncrementalEditRangePlanV1 } from "./incrementalEditRangePlanner.js"
import type { FlowDocTextEngineIncrementalRetainedSnapshotV1 } from "./incrementalRetainedSnapshot.js"

type PlannedRange = Extract<FlowDocTextEngineIncrementalEditRangePlanV1, { status: "range-planned" }>

export interface FlowDocTextEngineIncrementalAffectedLinePolicyV1 {
  stableLineCount: number
  maximumReflowLineCount: number
  maximumReflowUtf16Length: number
}

export type FlowDocTextEngineIncrementalAffectedLineWindowV1 =
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
      }
    }
  | {
      status: "fallback-required"
      code:
        | "line-input-invalid"
        | "line-prefix-mismatch"
        | "line-reconvergence-not-found"
        | "line-window-exceeded"
        | "line-oracle-mismatch"
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

function sameLine(left: VNextTextBlockMultiRunLineInputV1, right: VNextTextBlockMultiRunLineInputV1): boolean {
  return left.index === right.index
    && left.renderStartOffset === right.renderStartOffset
    && left.renderEndOffset === right.renderEndOffset
}

function validPolicy(policy: FlowDocTextEngineIncrementalAffectedLinePolicyV1): boolean {
  return Number.isSafeInteger(policy.stableLineCount)
    && policy.stableLineCount >= 1
    && Number.isSafeInteger(policy.maximumReflowLineCount)
    && policy.maximumReflowLineCount >= policy.stableLineCount
    && Number.isSafeInteger(policy.maximumReflowUtf16Length)
    && policy.maximumReflowUtf16Length >= 1
}

export function buildFlowDocTextEngineIncrementalAffectedLineWindowV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  nextOracleSnapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: PlannedRange
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: readonly number[]
  oracleLines: readonly VNextTextBlockMultiRunLineInputV1[]
  policy: FlowDocTextEngineIncrementalAffectedLinePolicyV1
}): FlowDocTextEngineIncrementalAffectedLineWindowV1 {
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
    || input.oracleLines[restartIndex]?.renderStartOffset !== restartOffset
    || input.nextOracleSnapshot.lines[restartIndex]?.renderStartOffset !== restartOffset
  ) return {
    status: "fallback-required",
    code: "line-input-invalid",
    message: "retained restart checkpoint is not an exact next break boundary",
  }

  const prefix = input.snapshot.lines.slice(0, restartIndex).map((line) => lineInput(line))
  if (prefix.some((line, index) => !sameLine(line, input.oracleLines[index]!))) return {
    status: "fallback-required",
    code: "line-prefix-mismatch",
    message: "a line before the retained restart checkpoint changed",
  }
  if (restartIndex > 0) {
    const previousPrefix = input.snapshot.lineCheckpoints[restartIndex - 1]!.prefixSemanticFingerprint
    const nextPrefix = input.nextOracleSnapshot.lineCheckpoints[restartIndex - 1]!.prefixSemanticFingerprint
    if (previousPrefix !== nextPrefix) return {
      status: "fallback-required",
      code: "line-prefix-mismatch",
      message: "the normalized semantic prefix checkpoint chain changed before the restart line",
    }
  }

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
    const oracleLine = input.oracleLines[nextLineIndex]
    if (oracleLine == null || !sameLine(line, oracleLine)) return {
      status: "fallback-required",
      code: "line-oracle-mismatch",
      message: "independently assembled line range differs from the complete layout oracle",
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
          const candidateNextLineIndex = restartIndex + candidateGeneratedIndex
          const previousCheckpoint = input.snapshot.lineCheckpoints[previousLineIndex]
          const nextCheckpoint = input.nextOracleSnapshot.lineCheckpoints[candidateNextLineIndex]
          const suffixLengthsMatch = input.snapshot.lines.length - previousLineIndex
            === input.nextOracleSnapshot.lines.length - candidateNextLineIndex
          if (
            stableRangesMatch
            && suffixLengthsMatch
            && previousCheckpoint != null
            && nextCheckpoint != null
            && previousCheckpoint.suffixSemanticFingerprint === nextCheckpoint.suffixSemanticFingerprint
          ) reconvergence = {
            generatedLineIndex: candidateGeneratedIndex,
            previousLineIndex,
            nextLineIndex: candidateNextLineIndex,
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
    message: "no exact stable suffix-semantic checkpoint reconvergence was found",
  }
  const affectedLines = generated.slice(0, reconvergence.generatedLineIndex)
  const reflowedNextUtf16Length = generated[reconvergence.generatedLineIndex]!.renderStartOffset - restartOffset
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
  if (
    lines.length !== input.oracleLines.length
    || lines.some((line, index) => !sameLine(line, input.oracleLines[index]!))
  ) return {
    status: "fallback-required",
    code: "line-oracle-mismatch",
    message: "retained prefix, assembled affected lines, and shifted suffix differ from the oracle line ranges",
  }
  const previousCheckpoint = input.snapshot.lineCheckpoints[reconvergence.previousLineIndex]!
  const nextCheckpoint = input.nextOracleSnapshot.lineCheckpoints[reconvergence.nextLineIndex]!
  if (previousCheckpoint.suffixSemanticFingerprint !== nextCheckpoint.suffixSemanticFingerprint) return {
    status: "fallback-required",
    code: "suffix-semantic-mismatch",
    message: "the retained and oracle suffix-semantic chains do not match",
  }
  return {
    status: "accepted",
    lines,
    affectedLines,
    checkpoint: {
      previousRestartLineIndex: restartIndex,
      nextRestartLineIndex: restartIndex,
      previousReconvergenceLineIndex: reconvergence.previousLineIndex,
      nextReconvergenceLineIndex: reconvergence.nextLineIndex,
      previousReconvergenceOffset: input.snapshot.lines[reconvergence.previousLineIndex]!.renderStartOffset,
      nextReconvergenceOffset: input.nextOracleSnapshot.lines[reconvergence.nextLineIndex]!.renderStartOffset,
      offsetDelta,
      stableLineCount: input.policy.stableLineCount,
      previousSuffixSemanticFingerprint: previousCheckpoint.suffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: nextCheckpoint.suffixSemanticFingerprint,
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
    },
  }
}
