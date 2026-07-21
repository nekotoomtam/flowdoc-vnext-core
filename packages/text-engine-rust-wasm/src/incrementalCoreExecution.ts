import {
  acceptVNextTextBlockMultiRunIncrementalWindowV1,
  createVNextCompactFingerprint,
  materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1,
  type VNextTextBlockMultiRunIncrementalAcceptanceV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import {
  assembleFlowDocTextEngineIncrementalAffectedLinesV1,
  type FlowDocTextEngineIncrementalAffectedLineAssemblyV1,
} from "./incrementalAffectedLineAssembly.js"
import type { FlowDocTextEngineIncrementalAffectedLinePolicyV1 } from "./incrementalAffectedLineWindow.js"
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
  getFlowDocTextEngineIncrementalCoreSnapshotV1,
  type FlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  type FlowDocTextEngineIncrementalRetainedSnapshotV1,
} from "./incrementalRetainedSnapshot.js"
import type { FlowDocTextEngineMultiRunLayoutResultV1 } from "./multiRunLayoutContract.js"

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_SOURCE =
  "flowdoc-text-engine-incremental-core-execution-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_VERSION = 1 as const

export interface FlowDocTextEngineIncrementalCoreExecutionPolicyV1 {
  rangeFacts: FlowDocTextEngineIncrementalRangeFactPolicyV1
  affectedLines: FlowDocTextEngineIncrementalAffectedLinePolicyV1
}

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_POLICY_V1 = {
  rangeFacts: {
    maximumSegmentationContextUtf16Length: 512,
    requiredStableSegmentationExpansionCount: 2,
  },
  affectedLines: {
    stableLineCount: 2,
    maximumReflowLineCount: 32,
    maximumReflowUtf16Length: 2_048,
  },
} as const satisfies FlowDocTextEngineIncrementalCoreExecutionPolicyV1

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_SOURCE =
  "flowdoc-text-engine-incremental-core-profile-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_VERSION = 1 as const

export type FlowDocTextEngineIncrementalCoreProfilePhaseV1 =
  | "plan-and-snapshot-validation"
  | "range-engine-facts"
  | "cluster-and-break-splice"
  | "affected-line-assembly"
  | "core-incremental-acceptance"
  | "optional-full-oracle-qa"
  | "result-and-fingerprint"

export interface FlowDocTextEngineIncrementalCoreProfileClockV1 {
  now(): number
}

type AcceptedAdapterLayout = Extract<FlowDocTextEngineMultiRunLayoutResultV1, { status: "accepted" }>
type AcceptedCoreComposition = Extract<
  VNextTextBlockMultiRunIncrementalAcceptanceV1,
  { status: "window-accepted" }
>

export type FlowDocTextEngineIncrementalCoreExecutionFallbackCodeV1 =
  | "invalid-range-plan"
  | "incremental-core-snapshot-unavailable"
  | "range-runtime-failure"
  | "range-shape-mismatch"
  | "range-shape-unsafe"
  | "segmentation-fallback"
  | "segmentation-oracle-mismatch"
  | "cluster-splice-invalid"
  | "break-splice-invalid"
  | "line-input-invalid"
  | "line-prefix-mismatch"
  | "line-reconvergence-not-found"
  | "line-window-exceeded"
  | "suffix-semantic-mismatch"
  | "incremental-core-acceptance-failed"
  | "invalid-optional-full-layout-oracle"
  | "qa-materialization-failed"
  | "qa-layout-mismatch"

interface BaseFactsV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_VERSION
  textBlockId: string
  previousInstanceRevision: number
  nextInstanceRevision: number
  retainedSnapshotFingerprint: string
  rangePlanFingerprint: string
  rangeRuntimeIdentityFingerprint: string
  fullLayoutOracleFingerprint: string | null
  policy: FlowDocTextEngineIncrementalCoreExecutionPolicyV1
  contracts: {
    execution: "contextual-range-plus-core-incremental-composition-qa"
    fullShapeAndSegmentationOracleRequired: true
    completeCoreLayoutOracleRequired: false
    completeCoreLayoutOracleOptionalForQa: true
    incrementalCoreAcceptance: true
    affectedPositionedFragmentAssembly: true
    completeLayoutMaterialization: "optional-qa-only"
    mayPublishLayout: false
    timingAffectsFingerprint: false
    rendererMayMeasureText: false
    productionBinding: false
  }
}

export type FlowDocTextEngineIncrementalCoreExecutionV1 =
  | (BaseFactsV1 & {
      status: "incremental-core-accepted"
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
      request: VNextTextBlockMultiRunLayoutRequestV1
      splice: {
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
      affectedWindow: Extract<FlowDocTextEngineIncrementalAffectedLineAssemblyV1, { status: "accepted" }>
      coreAcceptance: AcceptedCoreComposition
      optionalQaOracle: null | {
        requestExact: true
        layoutExact: true
        oracleAdapterFingerprint: string
        oracleCoreLayoutFingerprint: string
        materializedCoreLayoutFingerprint: string
        fingerprint: string
      }
      work: {
        completeCoreLayoutOracleUsed: boolean
        positionedAffectedLineCount: number
        reusedLineCount: number
      }
      fingerprint: string
    })
  | (BaseFactsV1 & {
      status: "fallback-required"
      fallback: {
        code: FlowDocTextEngineIncrementalCoreExecutionFallbackCodeV1
        message: string
      }
      rangeEvidence: null
      request: null
      splice: null
      affectedWindow: null
      coreAcceptance: null
      optionalQaOracle: null
      work: null
      fingerprint: string
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

export interface FlowDocTextEngineIncrementalCoreExecutionInputV1 {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  plan: FlowDocTextEngineIncrementalEditRangePlanV1
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
  runtime: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1
  nextMeasurement: VNextTextBlockV4MeasurementRequest
  optionalFullLayoutOracle?: AcceptedAdapterLayout
  policy?: FlowDocTextEngineIncrementalCoreExecutionPolicyV1
}

interface ProfileRecorderV1 {
  complete(phase: FlowDocTextEngineIncrementalCoreProfilePhaseV1): void
}

function executeFlowDocTextEngineIncrementalCorePlanInternalV1(
  input: FlowDocTextEngineIncrementalCoreExecutionInputV1,
  profile: ProfileRecorderV1 | null,
): FlowDocTextEngineIncrementalCoreExecutionV1 {
  const policy = clone(input.policy ?? FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_POLICY_V1)
  const base: BaseFactsV1 = {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_VERSION,
    textBlockId: input.snapshot.textBlockId,
    previousInstanceRevision: input.snapshot.instanceRevision,
    nextInstanceRevision: input.plan.nextInstanceRevision,
    retainedSnapshotFingerprint: input.snapshot.fingerprint,
    rangePlanFingerprint: input.plan.fingerprint,
    rangeRuntimeIdentityFingerprint: input.rangeRuntimeIdentity.fingerprint,
    fullLayoutOracleFingerprint: input.optionalFullLayoutOracle?.fingerprint ?? null,
    policy,
    contracts: {
      execution: "contextual-range-plus-core-incremental-composition-qa",
      fullShapeAndSegmentationOracleRequired: true,
      completeCoreLayoutOracleRequired: false,
      completeCoreLayoutOracleOptionalForQa: true,
      incrementalCoreAcceptance: true,
      affectedPositionedFragmentAssembly: true,
      completeLayoutMaterialization: "optional-qa-only",
      mayPublishLayout: false,
      timingAffectsFingerprint: false,
      rendererMayMeasureText: false,
      productionBinding: false,
    },
  }
  const fallback = (
    code: FlowDocTextEngineIncrementalCoreExecutionFallbackCodeV1,
    message: string,
  ): FlowDocTextEngineIncrementalCoreExecutionV1 => {
    const facts = {
      ...base,
      status: "fallback-required" as const,
      fallback: { code, message },
      rangeEvidence: null,
      request: null,
      splice: null,
      affectedWindow: null,
      coreAcceptance: null,
      optionalQaOracle: null,
      work: null,
    }
    return { ...facts, fingerprint: fingerprint(facts) }
  }

  if (input.plan.status !== "range-planned") return fallback(
    "invalid-range-plan",
    "incremental Core execution requires one accepted edit-range plan",
  )
  const expectedPlan = planFlowDocTextEngineIncrementalEditRangeV1({
    snapshot: input.snapshot,
    rangeRuntimeIdentity: input.rangeRuntimeIdentity,
    nextMeasurement: input.nextMeasurement,
    edit: input.plan.edit,
    policy: input.plan.policy,
  })
  if (expectedPlan.status !== "range-planned" || !sameJson(expectedPlan, input.plan)) return fallback(
    "invalid-range-plan",
    "range plan does not exactly reproduce from the immutable snapshot and next measurement",
  )
  const incrementalCoreSnapshot = getFlowDocTextEngineIncrementalCoreSnapshotV1(input.snapshot)
  if (incrementalCoreSnapshot == null) return fallback(
    "incremental-core-snapshot-unavailable",
    "the retained adapter snapshot has no matching process-local Core snapshot",
  )
  profile?.complete("plan-and-snapshot-validation")

  const rangeFacts = executeFlowDocTextEngineIncrementalRangeFactsV1({
    snapshot: input.snapshot,
    plan: input.plan,
    nextMeasurement: input.nextMeasurement,
    runtime: input.runtime,
    policy: policy.rangeFacts,
  })
  if (rangeFacts.status !== "accepted") return fallback(rangeFacts.code, rangeFacts.message)
  profile?.complete("range-engine-facts")
  const spliceFacts = spliceFlowDocTextEngineIncrementalFactsV1({
    snapshot: input.snapshot,
    plan: input.plan,
    nextMeasurement: input.nextMeasurement,
    rangeClusters: rangeFacts.rangeClusters,
    rangeBreakOffsets: rangeFacts.boundedSegmentation.facts.targetBreakUtf16Offsets,
  })
  if (spliceFacts.status !== "accepted") return fallback(spliceFacts.code, spliceFacts.message)
  profile?.complete("cluster-and-break-splice")
  const affectedWindow = assembleFlowDocTextEngineIncrementalAffectedLinesV1({
    snapshot: input.snapshot,
    plan: input.plan,
    nextMeasurement: input.nextMeasurement,
    shapingRuns: spliceFacts.shapingRuns,
    breakOffsets: spliceFacts.breakOffsets,
    policy: policy.affectedLines,
  })
  if (affectedWindow.status !== "accepted") return fallback(affectedWindow.code, affectedWindow.message)
  profile?.complete("affected-line-assembly")

  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    layoutId: input.snapshot.layoutId,
    measurement: clone(input.nextMeasurement),
    layoutUnitPolicyFingerprint: input.snapshot.layoutContext.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: input.snapshot.layoutContext.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: input.snapshot.layoutContext.declaredLineHeightLayoutUnit,
    paragraphStyle: clone(input.snapshot.layoutContext.paragraphStyle),
    fontFaces: clone(input.snapshot.fontFaces),
    shapingRuns: clone(spliceFacts.shapingRuns),
    breakOffsets: [...spliceFacts.breakOffsets],
    lines: clone(affectedWindow.lines),
  }
  const coreAcceptance = acceptVNextTextBlockMultiRunIncrementalWindowV1({
    snapshot: incrementalCoreSnapshot,
    nextRequest: request,
    edit: input.plan.edit,
    window: affectedWindow.checkpoint,
  })
  if (coreAcceptance.status !== "window-accepted") return fallback(
    "incremental-core-acceptance-failed",
    `${coreAcceptance.fallback.code}: ${coreAcceptance.fallback.message}`,
  )
  profile?.complete("core-incremental-acceptance")

  let optionalQaOracle: Extract<
    FlowDocTextEngineIncrementalCoreExecutionV1,
    { status: "incremental-core-accepted" }
  >["optionalQaOracle"] = null
  if (input.optionalFullLayoutOracle != null) {
    const oracle = input.optionalFullLayoutOracle
    if (
      oracle.layoutId !== input.snapshot.layoutId
      || oracle.textBlockId !== input.snapshot.textBlockId
      || oracle.instanceRevision !== input.plan.nextInstanceRevision
      || !sameJson(oracle.request, request)
    ) return fallback(
      "invalid-optional-full-layout-oracle",
      "the optional complete oracle request differs from the independently assembled Core request",
    )
    const materialized = materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1({
      snapshot: incrementalCoreSnapshot,
      nextRequest: request,
      acceptance: coreAcceptance,
    })
    if (materialized.status !== "materialized-for-qa") return fallback(
      "qa-materialization-failed",
      materialized.message,
    )
    if (!sameJson(materialized.layout, oracle.layout)) return fallback(
      "qa-layout-mismatch",
      "the incrementally materialized Core layout differs from the optional complete oracle",
    )
    const qaFacts = {
      requestExact: true as const,
      layoutExact: true as const,
      oracleAdapterFingerprint: oracle.fingerprint,
      oracleCoreLayoutFingerprint: oracle.layout.fingerprint,
      materializedCoreLayoutFingerprint: materialized.layout.fingerprint,
    }
    optionalQaOracle = { ...qaFacts, fingerprint: fingerprint(qaFacts) }
  }
  profile?.complete("optional-full-oracle-qa")

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
  const spliceCore = { work: clone(spliceFacts.work) }
  const splice = { ...spliceCore, fingerprint: fingerprint(spliceCore) }
  const facts = {
    ...base,
    status: "incremental-core-accepted" as const,
    fallback: null,
    rangeEvidence,
    request,
    splice,
    affectedWindow: clone(affectedWindow),
    coreAcceptance,
    optionalQaOracle,
    work: {
      completeCoreLayoutOracleUsed: input.optionalFullLayoutOracle != null,
      positionedAffectedLineCount: coreAcceptance.work.positionedAffectedLineCount,
      reusedLineCount: coreAcceptance.work.reusedPrefixLineCount
        + coreAcceptance.work.reusedSuffixLineCount,
    },
  }
  const result = { ...facts, fingerprint: fingerprint(facts) }
  profile?.complete("result-and-fingerprint")
  return result
}

export function executeFlowDocTextEngineIncrementalCorePlanV1(
  input: FlowDocTextEngineIncrementalCoreExecutionInputV1,
): FlowDocTextEngineIncrementalCoreExecutionV1 {
  return executeFlowDocTextEngineIncrementalCorePlanInternalV1(input, null)
}

export interface FlowDocTextEngineIncrementalCoreProfileV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_VERSION
  result: FlowDocTextEngineIncrementalCoreExecutionV1
  completedPhases: FlowDocTextEngineIncrementalCoreProfilePhaseV1[]
  phaseDurationMs: Record<FlowDocTextEngineIncrementalCoreProfilePhaseV1, number | null>
  totalDurationMs: number
  contracts: {
    timingIsDiagnosticOnly: true
    timingAffectsDeterministicFingerprint: false
    numericBudgetAccepted: false
    completeCoreLayoutOracleOptional: true
    productionBinding: false
  }
}

export function profileFlowDocTextEngineIncrementalCorePlanV1(
  input: FlowDocTextEngineIncrementalCoreExecutionInputV1,
  clock: FlowDocTextEngineIncrementalCoreProfileClockV1,
): FlowDocTextEngineIncrementalCoreProfileV1 {
  const phases: FlowDocTextEngineIncrementalCoreProfilePhaseV1[] = [
    "plan-and-snapshot-validation",
    "range-engine-facts",
    "cluster-and-break-splice",
    "affected-line-assembly",
    "core-incremental-acceptance",
    "optional-full-oracle-qa",
    "result-and-fingerprint",
  ]
  const phaseDurationMs = Object.fromEntries(phases.map((phase) => [phase, null])) as
    Record<FlowDocTextEngineIncrementalCoreProfilePhaseV1, number | null>
  const completedPhases: FlowDocTextEngineIncrementalCoreProfilePhaseV1[] = []
  const startedAt = clock.now()
  let phaseStartedAt = startedAt
  const result = executeFlowDocTextEngineIncrementalCorePlanInternalV1(input, {
    complete(phase) {
      const completedAt = clock.now()
      phaseDurationMs[phase] = Math.max(0, completedAt - phaseStartedAt)
      completedPhases.push(phase)
      phaseStartedAt = completedAt
    },
  })
  const completedAt = clock.now()
  return {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_PROFILE_VERSION,
    result,
    completedPhases,
    phaseDurationMs,
    totalDurationMs: Math.max(0, completedAt - startedAt),
    contracts: {
      timingIsDiagnosticOnly: true,
      timingAffectsDeterministicFingerprint: false,
      numericBudgetAccepted: false,
      completeCoreLayoutOracleOptional: true,
      productionBinding: false,
    },
  }
}
