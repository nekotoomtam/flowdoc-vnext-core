import {
  scaleVNextFontMetricToLayoutUnitV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockShapingClusterV1,
  type VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import type { FlowDocTextEngineIncrementalEditRangePlanV1 } from "./incrementalEditRangePlanner.js"
import type { FlowDocTextEngineIncrementalRetainedSnapshotV1 } from "./incrementalRetainedSnapshot.js"
import type {
  FlowDocTextEngineMr1SegmentationFactsV1,
  FlowDocTextEngineMr1ShapeFactsV1,
} from "./runtimeMr1.js"
import {
  compareFlowDocTextEngineMr1RangeSegmentationToFullOracleV1,
  compareFlowDocTextEngineMr1RangeShapeToFullOracleV1,
  createFlowDocTextEngineMr1BoundedSegmentationV1,
  type FlowDocTextEngineMr1BoundedSegmentationV1,
  type FlowDocTextEngineMr1RangeSegmentationFactsV1,
  type FlowDocTextEngineMr1RangeShapeFactsV1,
} from "./runtimeMr1Range.js"

type PlannedRange = Extract<FlowDocTextEngineIncrementalEditRangePlanV1, { status: "range-planned" }>
type StableBoundedSegmentation = Omit<
  FlowDocTextEngineMr1BoundedSegmentationV1,
  "status" | "reasonCode"
> & {
  status: "bounded-stable"
  reasonCode: null
}

export interface FlowDocTextEngineIncrementalRangeExecutionRuntimeV1 {
  shapeFull(input: { text: string; fontFaceId: string }): FlowDocTextEngineMr1ShapeFactsV1
  segmentFull(text: string): FlowDocTextEngineMr1SegmentationFactsV1
  shapeRange(input: {
    text: string
    fontFaceId: string
    rangeStartUtf16: number
    rangeEndUtf16: number
    contextStartUtf16: number
    contextEndUtf16: number
  }): FlowDocTextEngineMr1RangeShapeFactsV1
  segmentRange(input: {
    text: string
    targetStartUtf16: number
    targetEndUtf16: number
    contextStartUtf16: number
    contextEndUtf16: number
  }): FlowDocTextEngineMr1RangeSegmentationFactsV1
}

export interface FlowDocTextEngineIncrementalRangeFactPolicyV1 {
  maximumSegmentationContextUtf16Length: number
  requiredStableSegmentationExpansionCount: number
}

export type FlowDocTextEngineIncrementalRangeFactFailureCodeV1 =
  | "range-runtime-failure"
  | "range-shape-mismatch"
  | "range-shape-unsafe"
  | "segmentation-fallback"
  | "segmentation-oracle-mismatch"
  | "cluster-splice-invalid"
  | "break-splice-invalid"

export type FlowDocTextEngineIncrementalRangeFactExecutionV1 =
  | {
      status: "accepted"
      rangeShape: FlowDocTextEngineMr1RangeShapeFactsV1
      boundedSegmentation: StableBoundedSegmentation
      rangeClusters: VNextTextBlockShapingClusterV1[]
      proof: {
        shapeComparedFactCount: number
        segmentationComparedFactCount: number
      }
    }
  | {
      status: "fallback-required"
      code: FlowDocTextEngineIncrementalRangeFactFailureCodeV1
      message: string
    }

export type FlowDocTextEngineIncrementalFactSpliceV1 =
  | {
      status: "accepted"
      shapingRuns: VNextTextBlockResolvedShapingRunV1[]
      breakOffsets: number[]
      work: {
        retainedPrefixClusterCount: number
        insertedRangeClusterCount: number
        retainedSuffixClusterCount: number
        shiftedShapingRunCount: number
        retainedBreakCount: number
        insertedRangeBreakCount: number
      }
    }
  | {
      status: "fallback-required"
      code: "cluster-splice-invalid" | "break-splice-invalid"
      message: string
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function utf16ByByte(text: string): Map<number, number> {
  const result = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    byteOffset += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16Offset += scalar.length
    result.set(byteOffset, utf16Offset)
  }
  return result
}

function createRangeClusters(input: {
  shape: FlowDocTextEngineMr1RangeShapeFactsV1
  globalRunStartUtf16: number
  fontSizeLayoutUnit: number
}): VNextTextBlockShapingClusterV1[] | null {
  const offsets = utf16ByByte(input.shape.fullText)
  const advanceByCluster = new Map<number, number>()
  for (const glyph of input.shape.glyphs) {
    const advance = (advanceByCluster.get(glyph.cluster) ?? 0) + glyph.xAdvance
    if (!Number.isSafeInteger(advance) || advance < 0) return null
    advanceByCluster.set(glyph.cluster, advance)
  }
  const starts = [...advanceByCluster.keys()].sort((left, right) => left - right)
  if (starts.length === 0 || starts[0] !== input.shape.rangeStartByte) return null
  const clusters: VNextTextBlockShapingClusterV1[] = []
  for (let index = 0; index < starts.length; index += 1) {
    const startByte = starts[index]!
    const endByte = starts[index + 1] ?? input.shape.rangeEndByte
    const localStart = offsets.get(startByte)
    const localEnd = offsets.get(endByte)
    const advanceFontUnit = advanceByCluster.get(startByte)
    if (
      localStart == null
      || localEnd == null
      || localEnd <= localStart
      || advanceFontUnit == null
    ) return null
    const scaled = scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: advanceFontUnit,
      fontSizeLayoutUnit: input.fontSizeLayoutUnit,
      unitsPerEm: input.shape.unitsPerEm,
    })
    if (scaled.status !== "accepted" || scaled.layoutUnit < 0) return null
    clusters.push({
      index,
      renderStartOffset: input.globalRunStartUtf16 + localStart,
      renderEndOffset: input.globalRunStartUtf16 + localEnd,
      advanceLayoutUnit: scaled.layoutUnit,
    })
  }
  return clusters
}

export function executeFlowDocTextEngineIncrementalRangeFactsV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: PlannedRange
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  runtime: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1
  policy: FlowDocTextEngineIncrementalRangeFactPolicyV1
}): FlowDocTextEngineIncrementalRangeFactExecutionV1 {
  const runStart = input.plan.affectedShapingRun.nextRenderStartOffset
  const runEnd = input.plan.affectedShapingRun.nextRenderEndOffset
  const runText = input.nextMeasurement.renderedText.slice(runStart, runEnd)
  const shapeRange = input.plan.engineRange.nextShaping
  const segmentationRange = input.plan.engineRange.nextSegmentation
  const face = input.snapshot.fontFaces.find((item) => (
    item.fontFaceId === input.plan.affectedShapingRun.fontFaceId
  ))
  if (face == null) return {
    status: "fallback-required",
    code: "range-shape-mismatch",
    message: "the affected retained font face is unavailable",
  }

  let rangeShape: FlowDocTextEngineMr1RangeShapeFactsV1
  let fullShape: FlowDocTextEngineMr1ShapeFactsV1
  let fullSegmentation: FlowDocTextEngineMr1SegmentationFactsV1
  let boundedSegmentation: FlowDocTextEngineMr1BoundedSegmentationV1
  try {
    rangeShape = input.runtime.shapeRange({
      text: runText,
      fontFaceId: face.fontFaceId,
      rangeStartUtf16: shapeRange.runLocalStartUtf16,
      rangeEndUtf16: shapeRange.runLocalEndUtf16,
      contextStartUtf16: shapeRange.contextRunLocalStartUtf16,
      contextEndUtf16: shapeRange.contextRunLocalEndUtf16,
    })
    fullShape = input.runtime.shapeFull({ text: runText, fontFaceId: face.fontFaceId })
    boundedSegmentation = createFlowDocTextEngineMr1BoundedSegmentationV1({
      text: input.nextMeasurement.renderedText,
      targetStartUtf16: segmentationRange.targetStartUtf16,
      targetEndUtf16: segmentationRange.targetEndUtf16,
      initialContextUtf16: input.plan.policy.initialSegmentationContextUtf16Length,
      maxContextUtf16: input.policy.maximumSegmentationContextUtf16Length,
      requiredStableExpansionCount: input.policy.requiredStableSegmentationExpansionCount,
      runtime: input.runtime,
    })
    fullSegmentation = input.runtime.segmentFull(input.nextMeasurement.renderedText)
  } catch (error) {
    return {
      status: "fallback-required",
      code: "range-runtime-failure",
      message: error instanceof Error ? error.message : "contextual range runtime failed",
    }
  }

  if (
    rangeShape.fullText !== runText
    || rangeShape.fontFaceId !== face.fontFaceId
    || rangeShape.rangeStartUtf16 !== shapeRange.runLocalStartUtf16
    || rangeShape.rangeEndUtf16 !== shapeRange.runLocalEndUtf16
    || rangeShape.contextStartUtf16 !== shapeRange.contextRunLocalStartUtf16
    || rangeShape.contextEndUtf16 !== shapeRange.contextRunLocalEndUtf16
    || rangeShape.unitsPerEm !== face.unitsPerEm
    || rangeShape.ascentFontUnit !== face.ascentFontUnit
    || rangeShape.descentFontUnit !== face.descentFontUnit
    || rangeShape.lineGapFontUnit !== face.lineGapFontUnit
    || rangeShape.summary.missingGlyphCount > 0
  ) return {
    status: "fallback-required",
    code: "range-shape-mismatch",
    message: "range shape text, offsets, pinned metrics, or glyph coverage differ from the plan",
  }
  const shapeProof = compareFlowDocTextEngineMr1RangeShapeToFullOracleV1({
    range: rangeShape,
    full: fullShape,
  })
  if (shapeProof.status !== "exact") return {
    status: "fallback-required",
    code: shapeProof.reasonCode === "unsafe-cluster-boundary"
      ? "range-shape-unsafe"
      : "range-shape-mismatch",
    message: `contextual range shape did not match the full oracle: ${shapeProof.reasonCode}`,
  }
  if (boundedSegmentation.status !== "bounded-stable") return {
    status: "fallback-required",
    code: "segmentation-fallback",
    message: `bounded segmentation did not stabilize: ${boundedSegmentation.reasonCode}`,
  }
  const stableSegmentation = boundedSegmentation as StableBoundedSegmentation
  const segmentationProof = compareFlowDocTextEngineMr1RangeSegmentationToFullOracleV1({
    range: stableSegmentation.facts,
    full: fullSegmentation,
  })
  if (segmentationProof.status !== "exact") return {
    status: "fallback-required",
    code: "segmentation-oracle-mismatch",
    message: `bounded segmentation did not match the full oracle: ${segmentationProof.reasonCode}`,
  }
  const rangeClusters = createRangeClusters({
    shape: rangeShape,
    globalRunStartUtf16: runStart,
    fontSizeLayoutUnit: input.plan.affectedShapingRun.fontSizeLayoutUnit,
  })
  if (rangeClusters == null) return {
    status: "fallback-required",
    code: "range-shape-mismatch",
    message: "range glyph facts cannot be converted to ordered safe LayoutUnit clusters",
  }
  if (
    rangeClusters[0]?.renderStartOffset !== shapeRange.globalStartUtf16
    || rangeClusters.at(-1)?.renderEndOffset !== shapeRange.globalEndUtf16
  ) return {
    status: "fallback-required",
    code: "range-shape-unsafe",
    message: "range clusters do not cover the exact planned global boundaries",
  }
  return {
    status: "accepted",
    rangeShape,
    boundedSegmentation: stableSegmentation,
    rangeClusters,
    proof: {
      shapeComparedFactCount: shapeProof.comparedFactCount,
      segmentationComparedFactCount: segmentationProof.comparedFactCount,
    },
  }
}

function resolvedRun(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  runIndex: number
  renderStartOffset: number
  renderEndOffset: number
  clusters: VNextTextBlockShapingClusterV1[]
}): VNextTextBlockResolvedShapingRunV1 {
  const retained = input.snapshot.shapingRuns[input.runIndex]!
  return {
    shapingRunId: `${input.snapshot.layoutId}:shaping-run-${input.runIndex}:${input.renderStartOffset}-${input.renderEndOffset}`,
    renderStartOffset: input.renderStartOffset,
    renderEndOffset: input.renderEndOffset,
    text: input.nextMeasurement.renderedText.slice(input.renderStartOffset, input.renderEndOffset),
    styleKey: retained.styleKey,
    fontFaceId: retained.fontFaceId,
    fontSizeLayoutUnit: retained.fontSizeLayoutUnit,
    textColor: retained.textColor,
    direction: retained.direction,
    baselineShiftLayoutUnit: retained.baselineShiftLayoutUnit,
    features: clone(retained.features),
    clusters: input.clusters.map((cluster, index) => ({ ...clone(cluster), index })),
  }
}

function continuousRun(run: VNextTextBlockResolvedShapingRunV1): boolean {
  return run.clusters.length > 0
    && run.clusters[0]!.renderStartOffset === run.renderStartOffset
    && run.clusters.at(-1)!.renderEndOffset === run.renderEndOffset
    && run.clusters.every((cluster, index, all) => (
      cluster.index === index
      && cluster.renderEndOffset > cluster.renderStartOffset
      && Number.isSafeInteger(cluster.advanceLayoutUnit)
      && cluster.advanceLayoutUnit >= 0
      && (index === 0 || all[index - 1]!.renderEndOffset === cluster.renderStartOffset)
    ))
}

export function spliceFlowDocTextEngineIncrementalFactsV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: PlannedRange
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  rangeClusters: readonly VNextTextBlockShapingClusterV1[]
  rangeBreakOffsets: readonly number[]
}): FlowDocTextEngineIncrementalFactSpliceV1 {
  const affectedIndex = input.plan.affectedShapingRun.shapingRunIndex
  const previousRange = input.plan.engineRange.previous
  const nextRange = input.plan.engineRange.nextShaping
  const offsetDelta = input.plan.edit.nextEndOffset - input.plan.edit.previousEndOffset
  let retainedPrefixClusterCount = 0
  let retainedSuffixClusterCount = 0
  let shiftedShapingRunCount = 0
  const shapingRuns: VNextTextBlockResolvedShapingRunV1[] = []

  for (let index = 0; index < input.snapshot.shapingRuns.length; index += 1) {
    const retained = input.snapshot.shapingRuns[index]!
    if (index === affectedIndex) {
      if (retained.clusters.some((cluster) => (
        cluster.renderStartOffset < previousRange.globalStartUtf16
          && cluster.renderEndOffset > previousRange.globalStartUtf16
      )) || retained.clusters.some((cluster) => (
        cluster.renderStartOffset < previousRange.globalEndUtf16
          && cluster.renderEndOffset > previousRange.globalEndUtf16
      ))) return {
        status: "fallback-required",
        code: "cluster-splice-invalid",
        message: "the retained splice boundary crosses an accepted cluster",
      }
      const prefix = retained.clusters.filter((cluster) => (
        cluster.renderEndOffset <= previousRange.globalStartUtf16
      )).map(clone)
      const suffix = retained.clusters.filter((cluster) => (
        cluster.renderStartOffset >= previousRange.globalEndUtf16
      )).map((cluster) => ({
        ...clone(cluster),
        renderStartOffset: cluster.renderStartOffset + offsetDelta,
        renderEndOffset: cluster.renderEndOffset + offsetDelta,
      }))
      retainedPrefixClusterCount += prefix.length
      retainedSuffixClusterCount += suffix.length
      const run = resolvedRun({
        snapshot: input.snapshot,
        nextMeasurement: input.nextMeasurement,
        runIndex: index,
        renderStartOffset: input.plan.affectedShapingRun.nextRenderStartOffset,
        renderEndOffset: input.plan.affectedShapingRun.nextRenderEndOffset,
        clusters: [...prefix, ...input.rangeClusters.map(clone), ...suffix],
      })
      if (!continuousRun(run)) return {
        status: "fallback-required",
        code: "cluster-splice-invalid",
        message: "retained prefix, new range, and shifted suffix clusters do not form one continuous run",
      }
      shapingRuns.push(run)
      continue
    }
    const shift = index > affectedIndex ? offsetDelta : 0
    if (shift !== 0) shiftedShapingRunCount += 1
    const run = resolvedRun({
      snapshot: input.snapshot,
      nextMeasurement: input.nextMeasurement,
      runIndex: index,
      renderStartOffset: retained.renderStartOffset + shift,
      renderEndOffset: retained.renderEndOffset + shift,
      clusters: retained.clusters.map((cluster) => ({
        ...clone(cluster),
        renderStartOffset: cluster.renderStartOffset + shift,
        renderEndOffset: cluster.renderEndOffset + shift,
      })),
    })
    if (!continuousRun(run)) return {
      status: "fallback-required",
      code: "cluster-splice-invalid",
      message: "an unchanged shaping run did not retain continuous shifted cluster coverage",
    }
    shapingRuns.push(run)
  }

  const clusterBoundaries = new Set<number>([0, input.nextMeasurement.renderedText.length])
  shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  }))
  const retainedPrefixBreaks = input.snapshot.breakOffsets.filter((offset) => (
    offset < previousRange.globalStartUtf16
  ))
  const retainedSuffixBreaks = input.snapshot.breakOffsets.filter((offset) => (
    offset > previousRange.globalEndUtf16
  )).map((offset) => offset + offsetDelta)
  const mandatoryBreaks = input.nextMeasurement.runs
    .filter((run) => run.kind === "hard-break")
    .map((run) => run.renderEndOffset)
  const breakOffsets = [...new Set([
    ...retainedPrefixBreaks,
    ...input.rangeBreakOffsets,
    ...retainedSuffixBreaks,
    ...mandatoryBreaks,
    0,
    input.nextMeasurement.renderedText.length,
  ])].filter((offset) => clusterBoundaries.has(offset)).sort((left, right) => left - right)
  if (
    breakOffsets.length < 2
    || breakOffsets[0] !== 0
    || breakOffsets.at(-1) !== input.nextMeasurement.renderedText.length
    || !breakOffsets.every((offset, index, all) => index === 0 || offset > all[index - 1]!)
    || mandatoryBreaks.some((offset) => !breakOffsets.includes(offset))
  ) return {
    status: "fallback-required",
    code: "break-splice-invalid",
    message: "retained and range break facts do not form exact ordered cluster-safe coverage",
  }

  const actualRetainedBreaks = breakOffsets.filter((offset) => (
    retainedPrefixBreaks.includes(offset) || retainedSuffixBreaks.includes(offset)
  )).length
  return {
    status: "accepted",
    shapingRuns,
    breakOffsets,
    work: {
      retainedPrefixClusterCount,
      insertedRangeClusterCount: input.rangeClusters.length,
      retainedSuffixClusterCount,
      shiftedShapingRunCount,
      retainedBreakCount: actualRetainedBreaks,
      insertedRangeBreakCount: input.rangeBreakOffsets.filter((offset) => breakOffsets.includes(offset)).length,
    },
  }
}
