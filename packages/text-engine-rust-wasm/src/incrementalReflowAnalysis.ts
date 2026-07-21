import {
  createVNextCompactFingerprint,
  isVNextSafeUtf16TextOffset,
  type VNextTextBlockPositionedLineV1,
} from "@flowdoc/vnext-core"
import { createFlowDocTextEngineSemanticLineFingerprintV1 } from "./incrementalLineCheckpoint.js"
import type { FlowDocTextEngineMultiRunLayoutResultV1 } from "./multiRunLayoutContract.js"

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_SOURCE =
  "flowdoc-text-engine-incremental-reflow-analysis-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_VERSION = 1 as const

export interface FlowDocTextEngineIncrementalEditV1 {
  previousStartOffset: number
  previousEndOffset: number
  nextEndOffset: number
}

export interface FlowDocTextEngineIncrementalReflowPolicyV1 {
  stableLineCount: number
  maximumReflowLineCount: number
  maximumReflowUtf16Length: number
}

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_POLICY_V1 = {
  stableLineCount: 2,
  maximumReflowLineCount: 32,
  maximumReflowUtf16Length: 2_048,
} as const satisfies FlowDocTextEngineIncrementalReflowPolicyV1

export type FlowDocTextEngineIncrementalReflowFallbackCodeV1 =
  | "invalid-edit"
  | "edit-does-not-reconstruct-next-text"
  | "incompatible-layout-context"
  | "hard-break-edited"
  | "prefix-mismatch"
  | "reconvergence-not-found"
  | "reflow-window-exceeded"

interface FlowDocTextEngineIncrementalReflowFactsV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_VERSION
  textBlockId: string
  previousInstanceRevision: number
  nextInstanceRevision: number
  edit: FlowDocTextEngineIncrementalEditV1
  policy: FlowDocTextEngineIncrementalReflowPolicyV1
  contracts: {
    execution: "full-layout-oracle-analysis-only"
    fullLayoutOracleRequired: true
    mayPublishLayout: false
    timingAffectsFingerprint: false
    rendererMayMeasureText: false
    productionBinding: false
  }
}

export type FlowDocTextEngineIncrementalReflowAnalysisV1 =
  | (FlowDocTextEngineIncrementalReflowFactsV1 & {
      status: "window-proved"
      fallback: null
      checkpoint: {
        previousRestartLineIndex: number
        previousRestartOffset: number
        nextRestartLineIndex: number
        nextRestartOffset: number
        previousReconvergenceLineIndex: number
        previousReconvergenceOffset: number
        nextReconvergenceLineIndex: number
        nextReconvergenceOffset: number
        offsetDelta: number
        stableLineCount: number
        fingerprint: string
      }
      work: {
        previousLineCount: number
        nextLineCount: number
        reusedPrefixLineCount: number
        reflowedNextLineCount: number
        reusedSuffixLineCount: number
        reflowedNextUtf16Length: number
        reconvergenceCandidateCount: number
        semanticLineComparisonCount: number
        exactIntegerGeometry: true
      }
      fingerprint: string
    })
  | (FlowDocTextEngineIncrementalReflowFactsV1 & {
      status: "fallback-required"
      fallback: {
        code: FlowDocTextEngineIncrementalReflowFallbackCodeV1
        message: string
      }
      checkpoint: null
      work: {
        previousLineCount: number
        nextLineCount: number
        reconvergenceCandidateCount: number
        semanticLineComparisonCount: number
      }
      fingerprint: string
    })

type AcceptedLayout = Extract<FlowDocTextEngineMultiRunLayoutResultV1, { status: "accepted" }>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function validPolicy(policy: FlowDocTextEngineIncrementalReflowPolicyV1): boolean {
  return Number.isSafeInteger(policy.stableLineCount)
    && policy.stableLineCount >= 1
    && Number.isSafeInteger(policy.maximumReflowLineCount)
    && policy.maximumReflowLineCount >= policy.stableLineCount
    && Number.isSafeInteger(policy.maximumReflowUtf16Length)
    && policy.maximumReflowUtf16Length >= 1
}

function lineForOffset(lines: readonly VNextTextBlockPositionedLineV1[], offset: number): number {
  const containing = lines.findIndex((line) => offset >= line.renderStartOffset && offset < line.renderEndOffset)
  if (containing >= 0) return containing
  const following = lines.findIndex((line) => line.renderStartOffset >= offset)
  return following >= 0 ? following : Math.max(0, lines.length - 1)
}

function compatibleContext(previous: AcceptedLayout, next: AcceptedLayout): boolean {
  return previous.textBlockId === next.textBlockId
    && previous.measurementProfileId === next.measurementProfileId
    && previous.layoutId === next.layoutId
    && previous.request.availableWidthLayoutUnit === next.request.availableWidthLayoutUnit
    && previous.request.declaredLineHeightLayoutUnit === next.request.declaredLineHeightLayoutUnit
    && previous.request.layoutUnitPolicyFingerprint === next.request.layoutUnitPolicyFingerprint
    && JSON.stringify(previous.request.paragraphStyle) === JSON.stringify(next.request.paragraphStyle)
    && JSON.stringify(previous.request.fontFaces) === JSON.stringify(next.request.fontFaces)
}

export function analyzeFlowDocTextEngineIncrementalReflowV1(input: {
  previous: AcceptedLayout
  nextOracle: AcceptedLayout
  edit: FlowDocTextEngineIncrementalEditV1
  policy?: FlowDocTextEngineIncrementalReflowPolicyV1
}): FlowDocTextEngineIncrementalReflowAnalysisV1 {
  const policy = clone(input.policy ?? FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_POLICY_V1)
  const previousText = input.previous.request.measurement.renderedText
  const nextText = input.nextOracle.request.measurement.renderedText
  const edit = clone(input.edit)
  const base: FlowDocTextEngineIncrementalReflowFactsV1 = {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_REFLOW_ANALYSIS_VERSION,
    textBlockId: input.nextOracle.textBlockId,
    previousInstanceRevision: input.previous.instanceRevision,
    nextInstanceRevision: input.nextOracle.instanceRevision,
    edit,
    policy,
    contracts: {
      execution: "full-layout-oracle-analysis-only",
      fullLayoutOracleRequired: true,
      mayPublishLayout: false,
      timingAffectsFingerprint: false,
      rendererMayMeasureText: false,
      productionBinding: false,
    },
  }
  let reconvergenceCandidateCount = 0
  let semanticLineComparisonCount = 0
  const fallback = (
    code: FlowDocTextEngineIncrementalReflowFallbackCodeV1,
    message: string,
  ): FlowDocTextEngineIncrementalReflowAnalysisV1 => {
    const facts = {
      ...base,
      status: "fallback-required" as const,
      fallback: { code, message },
      checkpoint: null,
      work: {
        previousLineCount: input.previous.layout.lines.length,
        nextLineCount: input.nextOracle.layout.lines.length,
        reconvergenceCandidateCount,
        semanticLineComparisonCount,
      },
    }
    return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
  }

  const validEdit = validPolicy(policy)
    && Number.isSafeInteger(edit.previousStartOffset)
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
  if (!validEdit) return fallback("invalid-edit", "edit offsets or bounded reflow policy are invalid")

  const insertedText = nextText.slice(edit.previousStartOffset, edit.nextEndOffset)
  const reconstructed = previousText.slice(0, edit.previousStartOffset)
    + insertedText
    + previousText.slice(edit.previousEndOffset)
  if (reconstructed !== nextText) return fallback(
    "edit-does-not-reconstruct-next-text",
    "the declared single replacement does not exactly reconstruct the next oracle text",
  )
  if (/\r|\n/u.test(previousText.slice(edit.previousStartOffset, edit.previousEndOffset)) || /\r|\n/u.test(insertedText)) {
    return fallback("hard-break-edited", "the first checkpoint contract does not incrementally edit hard breaks")
  }
  if (!compatibleContext(input.previous, input.nextOracle)) return fallback(
    "incompatible-layout-context",
    "layout width, line height, fixed-point policy, paragraph style, or pinned font faces changed",
  )

  const previousLines = input.previous.layout.lines
  const nextLines = input.nextOracle.layout.lines
  const previousAffectedLine = lineForOffset(previousLines, edit.previousStartOffset)
  const nextAffectedLine = lineForOffset(nextLines, edit.previousStartOffset)
  const previousRestartLineIndex = Math.max(0, previousAffectedLine - 1)
  const nextRestartLineIndex = Math.max(0, nextAffectedLine - 1)
  const previousRestartOffset = previousLines[previousRestartLineIndex]!.renderStartOffset
  const nextRestartOffset = nextLines[nextRestartLineIndex]!.renderStartOffset
  if (
    previousRestartLineIndex !== nextRestartLineIndex
    || previousRestartOffset !== nextRestartOffset
  ) return fallback("prefix-mismatch", "the previous and next restart checkpoints do not share one exact prefix")
  const reusedPrefixLineCount = previousRestartLineIndex
  for (let index = 0; index < reusedPrefixLineCount; index += 1) {
    semanticLineComparisonCount += 1
    const previousLine = previousLines[index]!
    const nextLine = nextLines[index]!
    if (
      previousLine.renderStartOffset !== nextLine.renderStartOffset
      || previousLine.renderEndOffset !== nextLine.renderEndOffset
      || previousLine.yOffsetLayoutUnit !== nextLine.yOffsetLayoutUnit
      || createFlowDocTextEngineSemanticLineFingerprintV1(previousLine)
        !== createFlowDocTextEngineSemanticLineFingerprintV1(nextLine)
    ) return fallback("prefix-mismatch", "a line before the proposed restart checkpoint changed")
  }

  const offsetDelta = edit.nextEndOffset - edit.previousEndOffset
  const previousCandidateStart = previousLines.findIndex((line) => line.renderStartOffset >= edit.previousEndOffset)
  const nextCandidateStart = nextLines.findIndex((line) => line.renderStartOffset >= edit.nextEndOffset)
  let reconvergence: { previousLineIndex: number; nextLineIndex: number } | null = null
  if (previousCandidateStart >= 0 && nextCandidateStart >= 0) {
    for (let nextIndex = nextCandidateStart; nextIndex < nextLines.length; nextIndex += 1) {
      const nextLine = nextLines[nextIndex]!
      const previousOffset = nextLine.renderStartOffset - offsetDelta
      const previousIndex = previousLines.findIndex((line, index) => (
        index >= previousCandidateStart && line.renderStartOffset === previousOffset
      ))
      if (previousIndex < 0) continue
      reconvergenceCandidateCount += 1
      let stable = true
      for (let stableIndex = 0; stableIndex < policy.stableLineCount; stableIndex += 1) {
        const previousLine = previousLines[previousIndex + stableIndex]
        const candidateLine = nextLines[nextIndex + stableIndex]
        if (previousLine == null || candidateLine == null) {
          stable = false
          break
        }
        semanticLineComparisonCount += 1
        if (
          candidateLine.renderStartOffset !== previousLine.renderStartOffset + offsetDelta
          || candidateLine.renderEndOffset !== previousLine.renderEndOffset + offsetDelta
          || createFlowDocTextEngineSemanticLineFingerprintV1(previousLine)
            !== createFlowDocTextEngineSemanticLineFingerprintV1(candidateLine)
        ) {
          stable = false
          break
        }
      }
      if (!stable) continue
      const previousSuffixLength = previousLines.length - previousIndex
      const nextSuffixLength = nextLines.length - nextIndex
      if (previousSuffixLength !== nextSuffixLength) continue
      for (let suffixIndex = 0; suffixIndex < previousSuffixLength; suffixIndex += 1) {
        const previousLine = previousLines[previousIndex + suffixIndex]!
        const candidateLine = nextLines[nextIndex + suffixIndex]!
        semanticLineComparisonCount += 1
        if (
          candidateLine.renderStartOffset !== previousLine.renderStartOffset + offsetDelta
          || candidateLine.renderEndOffset !== previousLine.renderEndOffset + offsetDelta
          || createFlowDocTextEngineSemanticLineFingerprintV1(previousLine)
            !== createFlowDocTextEngineSemanticLineFingerprintV1(candidateLine)
        ) {
          stable = false
          break
        }
      }
      if (stable) {
        reconvergence = { previousLineIndex: previousIndex, nextLineIndex: nextIndex }
        break
      }
    }
  }
  if (reconvergence == null) return fallback(
    "reconvergence-not-found",
    "no two-line checkpoint with an oracle-identical remaining suffix was found",
  )

  const nextReconvergenceLine = nextLines[reconvergence.nextLineIndex]!
  const previousReconvergenceLine = previousLines[reconvergence.previousLineIndex]!
  const reflowedNextLineCount = reconvergence.nextLineIndex - nextRestartLineIndex
  const reflowedNextUtf16Length = nextReconvergenceLine.renderStartOffset - nextRestartOffset
  if (
    reflowedNextLineCount > policy.maximumReflowLineCount
    || reflowedNextUtf16Length > policy.maximumReflowUtf16Length
  ) return fallback(
    "reflow-window-exceeded",
    "the oracle reconverged only after the bounded line or UTF-16 window",
  )

  const checkpointFacts = {
    previousRestartLineIndex,
    previousRestartOffset,
    nextRestartLineIndex,
    nextRestartOffset,
    previousReconvergenceLineIndex: reconvergence.previousLineIndex,
    previousReconvergenceOffset: previousReconvergenceLine.renderStartOffset,
    nextReconvergenceLineIndex: reconvergence.nextLineIndex,
    nextReconvergenceOffset: nextReconvergenceLine.renderStartOffset,
    offsetDelta,
    stableLineCount: policy.stableLineCount,
  }
  const checkpoint = {
    ...checkpointFacts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(checkpointFacts)),
  }
  const facts = {
    ...base,
    status: "window-proved" as const,
    fallback: null,
    checkpoint,
    work: {
      previousLineCount: previousLines.length,
      nextLineCount: nextLines.length,
      reusedPrefixLineCount,
      reflowedNextLineCount,
      reusedSuffixLineCount: previousLines.length - reconvergence.previousLineIndex,
      reflowedNextUtf16Length,
      reconvergenceCandidateCount,
      semanticLineComparisonCount,
      exactIntegerGeometry: true as const,
    },
  }
  return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
}
