import { createVNextCompactFingerprint } from "@flowdoc/vnext-core"
import {
  buildFlowDocTextEngineIncrementalAffectedLineWindowV1,
  type FlowDocTextEngineIncrementalAffectedLinePolicyV1,
} from "./incrementalAffectedLineWindow.js"
import {
  planFlowDocTextEngineIncrementalEditRangeV1,
  type FlowDocTextEngineIncrementalEditRangePlanV1,
} from "./incrementalEditRangePlanner.js"
import {
  executeFlowDocTextEngineIncrementalRangeFactsV1,
  spliceFlowDocTextEngineIncrementalFactsV1,
  type FlowDocTextEngineIncrementalRangeExecutionRuntimeV1,
  type FlowDocTextEngineIncrementalRangeFactPolicyV1,
} from "./incrementalRangeFactSplice.js"
import {
  createFlowDocTextEngineIncrementalRetainedSnapshotV1,
  type FlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  type FlowDocTextEngineIncrementalRetainedSnapshotV1,
} from "./incrementalRetainedSnapshot.js"
import type { FlowDocTextEngineMultiRunLayoutResultV1 } from "./multiRunLayoutContract.js"

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_SOURCE =
  "flowdoc-text-engine-incremental-range-execution-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_VERSION = 1 as const

export interface FlowDocTextEngineIncrementalRangeExecutionPolicyV1 {
  rangeFacts: FlowDocTextEngineIncrementalRangeFactPolicyV1
  affectedLines: FlowDocTextEngineIncrementalAffectedLinePolicyV1
}

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1 = {
  rangeFacts: {
    maximumSegmentationContextUtf16Length: 512,
    requiredStableSegmentationExpansionCount: 2,
  },
  affectedLines: {
    stableLineCount: 2,
    maximumReflowLineCount: 32,
    maximumReflowUtf16Length: 2_048,
  },
} as const satisfies FlowDocTextEngineIncrementalRangeExecutionPolicyV1

export type FlowDocTextEngineIncrementalRangeExecutionFallbackCodeV1 =
  | "invalid-range-plan"
  | "invalid-full-layout-oracle"
  | "range-runtime-failure"
  | "range-shape-mismatch"
  | "range-shape-unsafe"
  | "segmentation-fallback"
  | "segmentation-oracle-mismatch"
  | "cluster-splice-invalid"
  | "cluster-splice-oracle-mismatch"
  | "break-splice-invalid"
  | "break-splice-oracle-mismatch"
  | "line-input-invalid"
  | "line-prefix-mismatch"
  | "line-reconvergence-not-found"
  | "line-window-exceeded"
  | "line-oracle-mismatch"
  | "suffix-semantic-mismatch"

type AcceptedLayout = Extract<FlowDocTextEngineMultiRunLayoutResultV1, { status: "accepted" }>
type PlannedRange = Extract<FlowDocTextEngineIncrementalEditRangePlanV1, { status: "range-planned" }>

interface BaseFactsV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_VERSION
  textBlockId: string
  previousInstanceRevision: number
  nextInstanceRevision: number
  retainedSnapshotFingerprint: string
  rangePlanFingerprint: string
  rangeRuntimeIdentityFingerprint: string
  fullLayoutOracleFingerprint: string | null
  policy: FlowDocTextEngineIncrementalRangeExecutionPolicyV1
  contracts: {
    execution: "contextual-range-plus-retained-fact-splice-qa"
    fullShapeAndSegmentationOracleRequired: true
    completeCoreLayoutOracleRequired: true
    incrementalCoreAcceptance: false
    positionedFragmentAssembly: false
    mayPublishLayout: false
    timingAffectsFingerprint: false
    rendererMayMeasureText: false
    productionBinding: false
  }
}

export type FlowDocTextEngineIncrementalRangeExecutionV1 =
  | (BaseFactsV1 & {
      status: "qa-window-proved"
      fallback: null
      rangeEvidence: {
        shapeRangeStartUtf16: number
        shapeRangeEndUtf16: number
        shapeContextStartUtf16: number
        shapeContextEndUtf16: number
        glyphCount: number
        unsafeToBreakGlyphCount: number
        shapeComparedFactCount: number
        segmentationTargetStartUtf16: number
        segmentationTargetEndUtf16: number
        segmentationAttemptCount: number
        segmentationStableExpansionCount: number
        rangeBreakCount: number
        segmentationComparedFactCount: number
        fingerprint: string
      }
      splice: {
        shapingRuns: AcceptedLayout["request"]["shapingRuns"]
        breakOffsets: number[]
        work: {
          retainedPrefixClusterCount: number
          insertedRangeClusterCount: number
          retainedSuffixClusterCount: number
          shiftedShapingRunCount: number
          retainedBreakCount: number
          insertedRangeBreakCount: number
        }
        fingerprint: string
      }
      affectedWindow: {
        lines: AcceptedLayout["request"]["lines"]
        affectedLines: AcceptedLayout["request"]["lines"]
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
        fingerprint: string
      }
      oracleParity: {
        shapingRunsExact: true
        breakOffsetsExact: true
        lineRangesExact: true
        suffixSemanticChainExact: true
      }
      fingerprint: string
    })
  | (BaseFactsV1 & {
      status: "fallback-required"
      fallback: {
        code: FlowDocTextEngineIncrementalRangeExecutionFallbackCodeV1
        message: string
      }
      rangeEvidence: null
      splice: null
      affectedWindow: null
      oracleParity: null
      fingerprint: string
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function fingerprint<T>(facts: T): string {
  return createVNextCompactFingerprint(JSON.stringify(facts))
}

function compatibleOracle(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: PlannedRange
  oracle: AcceptedLayout
}): boolean {
  const { snapshot, plan, oracle } = input
  return oracle.layoutId === snapshot.layoutId
    && oracle.textBlockId === snapshot.textBlockId
    && oracle.measurementProfileId === snapshot.measurementProfileId
    && oracle.instanceRevision === plan.nextInstanceRevision
    && oracle.request.layoutUnitPolicyFingerprint === snapshot.layoutContext.layoutUnitPolicyFingerprint
    && oracle.request.availableWidthLayoutUnit === snapshot.layoutContext.availableWidthLayoutUnit
    && oracle.request.declaredLineHeightLayoutUnit === snapshot.layoutContext.declaredLineHeightLayoutUnit
    && sameJson(oracle.request.paragraphStyle, snapshot.layoutContext.paragraphStyle)
    && sameJson(oracle.request.fontFaces, snapshot.fontFaces)
    && fingerprint(oracle.request.measurement) === plan.nextMeasurementFingerprint
}

export function executeFlowDocTextEngineIncrementalRangePlanV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: FlowDocTextEngineIncrementalEditRangePlanV1
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
  runtime: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1
  nextOracle: AcceptedLayout
  policy?: FlowDocTextEngineIncrementalRangeExecutionPolicyV1
}): FlowDocTextEngineIncrementalRangeExecutionV1 {
  const policy = clone(input.policy ?? FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1)
  const base: BaseFactsV1 = {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_VERSION,
    textBlockId: input.snapshot.textBlockId,
    previousInstanceRevision: input.snapshot.instanceRevision,
    nextInstanceRevision: input.plan.nextInstanceRevision,
    retainedSnapshotFingerprint: input.snapshot.fingerprint,
    rangePlanFingerprint: input.plan.fingerprint,
    rangeRuntimeIdentityFingerprint: input.rangeRuntimeIdentity.fingerprint,
    fullLayoutOracleFingerprint: input.nextOracle.fingerprint,
    policy,
    contracts: {
      execution: "contextual-range-plus-retained-fact-splice-qa",
      fullShapeAndSegmentationOracleRequired: true,
      completeCoreLayoutOracleRequired: true,
      incrementalCoreAcceptance: false,
      positionedFragmentAssembly: false,
      mayPublishLayout: false,
      timingAffectsFingerprint: false,
      rendererMayMeasureText: false,
      productionBinding: false,
    },
  }
  const fallback = (
    code: FlowDocTextEngineIncrementalRangeExecutionFallbackCodeV1,
    message: string,
  ): FlowDocTextEngineIncrementalRangeExecutionV1 => {
    const facts = {
      ...base,
      status: "fallback-required" as const,
      fallback: { code, message },
      rangeEvidence: null,
      splice: null,
      affectedWindow: null,
      oracleParity: null,
    }
    return { ...facts, fingerprint: fingerprint(facts) }
  }

  if (input.plan.status !== "range-planned") return fallback(
    "invalid-range-plan",
    "range execution requires one accepted edit-range plan",
  )
  const expectedPlan = planFlowDocTextEngineIncrementalEditRangeV1({
    snapshot: input.snapshot,
    rangeRuntimeIdentity: input.rangeRuntimeIdentity,
    nextMeasurement: input.nextOracle.request.measurement,
    edit: input.plan.edit,
    policy: input.plan.policy,
  })
  if (expectedPlan.status !== "range-planned" || !sameJson(expectedPlan, input.plan)) return fallback(
    "invalid-range-plan",
    "range plan does not exactly reproduce from the immutable snapshot and next measurement",
  )
  if (!compatibleOracle({ snapshot: input.snapshot, plan: input.plan, oracle: input.nextOracle })) {
    return fallback(
      "invalid-full-layout-oracle",
      "complete next layout oracle does not match the retained layout context and planned revision",
    )
  }

  const rangeFacts = executeFlowDocTextEngineIncrementalRangeFactsV1({
    snapshot: input.snapshot,
    plan: input.plan,
    nextMeasurement: input.nextOracle.request.measurement,
    runtime: input.runtime,
    policy: policy.rangeFacts,
  })
  if (rangeFacts.status !== "accepted") return fallback(rangeFacts.code, rangeFacts.message)
  const spliceFacts = spliceFlowDocTextEngineIncrementalFactsV1({
    snapshot: input.snapshot,
    plan: input.plan,
    nextMeasurement: input.nextOracle.request.measurement,
    rangeClusters: rangeFacts.rangeClusters,
    rangeBreakOffsets: rangeFacts.boundedSegmentation.facts.targetBreakUtf16Offsets,
  })
  if (spliceFacts.status !== "accepted") return fallback(spliceFacts.code, spliceFacts.message)
  if (!sameJson(spliceFacts.shapingRuns, input.nextOracle.request.shapingRuns)) return fallback(
    "cluster-splice-oracle-mismatch",
    "spliced shaping runs and clusters differ from the complete layout oracle request",
  )
  if (!sameJson(spliceFacts.breakOffsets, input.nextOracle.request.breakOffsets)) return fallback(
    "break-splice-oracle-mismatch",
    "spliced break offsets differ from the complete layout oracle request",
  )

  let nextOracleSnapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  try {
    nextOracleSnapshot = createFlowDocTextEngineIncrementalRetainedSnapshotV1({
      accepted: input.nextOracle,
      rangeRuntimeIdentity: input.rangeRuntimeIdentity,
    })
  } catch (error) {
    return fallback(
      "invalid-full-layout-oracle",
      error instanceof Error ? error.message : "next oracle snapshot creation failed",
    )
  }
  const affectedWindow = buildFlowDocTextEngineIncrementalAffectedLineWindowV1({
    snapshot: input.snapshot,
    nextOracleSnapshot,
    plan: input.plan,
    nextMeasurement: input.nextOracle.request.measurement,
    shapingRuns: spliceFacts.shapingRuns,
    breakOffsets: spliceFacts.breakOffsets,
    oracleLines: input.nextOracle.request.lines,
    policy: policy.affectedLines,
  })
  if (affectedWindow.status !== "accepted") return fallback(affectedWindow.code, affectedWindow.message)

  const rangeEvidenceFacts = {
    shapeRangeStartUtf16: rangeFacts.rangeShape.rangeStartUtf16,
    shapeRangeEndUtf16: rangeFacts.rangeShape.rangeEndUtf16,
    shapeContextStartUtf16: rangeFacts.rangeShape.contextStartUtf16,
    shapeContextEndUtf16: rangeFacts.rangeShape.contextEndUtf16,
    glyphCount: rangeFacts.rangeShape.summary.glyphCount,
    unsafeToBreakGlyphCount: rangeFacts.rangeShape.summary.unsafeToBreakGlyphCount,
    shapeComparedFactCount: rangeFacts.proof.shapeComparedFactCount,
    segmentationTargetStartUtf16: rangeFacts.boundedSegmentation.facts.targetStartUtf16,
    segmentationTargetEndUtf16: rangeFacts.boundedSegmentation.facts.targetEndUtf16,
    segmentationAttemptCount: rangeFacts.boundedSegmentation.attempts.length,
    segmentationStableExpansionCount: rangeFacts.boundedSegmentation.stableExpansionCount,
    rangeBreakCount: rangeFacts.boundedSegmentation.facts.targetBreakUtf16Offsets.length,
    segmentationComparedFactCount: rangeFacts.proof.segmentationComparedFactCount,
  }
  const rangeEvidence = { ...rangeEvidenceFacts, fingerprint: fingerprint(rangeEvidenceFacts) }
  const spliceCore = {
    shapingRuns: clone(spliceFacts.shapingRuns),
    breakOffsets: [...spliceFacts.breakOffsets],
    work: clone(spliceFacts.work),
  }
  const splice = { ...spliceCore, fingerprint: fingerprint(spliceCore) }
  const affectedWindowCore = {
    lines: clone(affectedWindow.lines),
    affectedLines: clone(affectedWindow.affectedLines),
    checkpoint: clone(affectedWindow.checkpoint),
    work: clone(affectedWindow.work),
  }
  const outputWindow = { ...affectedWindowCore, fingerprint: fingerprint(affectedWindowCore) }
  const facts = {
    ...base,
    status: "qa-window-proved" as const,
    fallback: null,
    rangeEvidence,
    splice,
    affectedWindow: outputWindow,
    oracleParity: {
      shapingRunsExact: true as const,
      breakOffsetsExact: true as const,
      lineRangesExact: true as const,
      suffixSemanticChainExact: true as const,
    },
  }
  return { ...facts, fingerprint: fingerprint(facts) }
}
