import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockIncrementalFlowCandidateInternalV1,
  bindVNextTextBlockIncrementalFlowExactAliasInternalV1,
  prepareVNextTextBlockIncrementalFlowRangePathCopyInternalV1,
  prepareVNextTextBlockIncrementalFlowReplacementAtomsInternalV1,
  type VNextTextBlockFlowBindingAuthorityInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import type { VNextTextBlockIncrementalFlowTreeV1 } from "./textBlockIncrementalFlowTreeContractV1.js"
import type { VNextTextBlockUnifiedLayoutSourceStateV1 } from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type { VNextTextBlockTransitionEvidenceV2 } from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockLayoutSeedRegionV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import { evaluateNextVNextTextBlockStageVisitInternalV1 } from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import type { VNextTextBlockUnifiedLayoutOwnedStageFailureV1 } from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  getVNextTextBlockUnifiedLayoutSourceStageRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageAcceptedV1,
} from "./textBlockUnifiedLayoutTransitionSourceInternalsV1.js"
import { composeVNextTextBlockStageWorkLedgerInternalV1 } from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export interface VNextTextBlockUnifiedLayoutFlowStageAcceptedV1 {
  readonly status: "accepted"
  readonly preflight:
    VNextTextBlockUnifiedLayoutSourceStageAcceptedV1["preflight"]
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly flowBindingAuthority:
    VNextTextBlockFlowBindingAuthorityInternalV1
  readonly seedRegion: VNextTextBlockLayoutSeedRegionV1
  readonly existingLineageIds: readonly string[]
  readonly insertedLineageIds: readonly string[]
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
  }
  return value
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function issue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return Object.freeze({
    code: "incremental-proof-unavailable",
    severity: "error",
    stage: "source-flow",
    path: "flowTree",
    message,
  })
}

function updateFlowWork(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly work: VNextTextBlockIncrementalCandidateWorkV1
  readonly visitedFlowAtomCount: number
  readonly visitedFlowTreeNodeCount: number
  readonly reusedFlowTreeNodeCount: number
  readonly createdFlowTreeNodeCount: number
}): VNextTextBlockIncrementalCandidateWorkV1 {
  const flow = Object.freeze({
    ...input.work.flow,
    visitedFlowAtomCount: input.visitedFlowAtomCount,
    visitedFlowTreeNodeCount: input.visitedFlowTreeNodeCount,
    reusedFlowTreeNodeCount: input.reusedFlowTreeNodeCount,
    createdFlowTreeNodeCount: input.createdFlowTreeNodeCount,
  })
  const counts = new Map(
    input.work.stageWork.map((row) => [`${row.stage}/${row.unit}`, row.count]),
  )
  counts.set("source-flow/flow-atoms", input.visitedFlowAtomCount)
  counts.set("source-flow/flow-tree-nodes", input.visitedFlowTreeNodeCount)
  return freeze({
    ...input.work,
    flow,
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
      policy: input.previousRoot.workPolicy,
      factualCounts: input.previousRoot.workPolicy.stages.map((row) => ({
        stage: row.stage,
        unit: row.unit,
        count: counts.get(`${row.stage}/${row.unit}`) ?? 0,
      })),
    }),
  })
}

function seedRegion(
  sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedV1,
): VNextTextBlockLayoutSeedRegionV1 {
  const facts = {
    previousSourceRange: sourceStage.previousSourceRange,
    nextSourceRange: sourceStage.nextSourceRange,
    previousSpatialBand: null,
    nextSpatialBand: null,
    mandatorySpatialUnion: null,
  }
  return freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function previousReplacementRangeForNextEvidenceTarget(input: {
  readonly previousChangedRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
  readonly nextChangedRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
  readonly nextEvidenceTargetRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
}): {
  readonly startRenderedUtf16: number
  readonly endRenderedUtf16: number
} | null {
  const previousChangedLength = input.previousChangedRange.endRenderedUtf16
    - input.previousChangedRange.startRenderedUtf16
  const nextChangedLength = input.nextChangedRange.endRenderedUtf16
    - input.nextChangedRange.startRenderedUtf16
  const delta = nextChangedLength - previousChangedLength
  const start = input.nextEvidenceTargetRange.startRenderedUtf16
    < input.nextChangedRange.startRenderedUtf16
    ? input.nextEvidenceTargetRange.startRenderedUtf16
    : input.previousChangedRange.startRenderedUtf16
  const end = input.nextEvidenceTargetRange.endRenderedUtf16
    > input.nextChangedRange.endRenderedUtf16
    ? input.nextEvidenceTargetRange.endRenderedUtf16 - delta
    : input.previousChangedRange.endRenderedUtf16
  return Number.isSafeInteger(start)
      && Number.isSafeInteger(end)
      && start >= 0
      && end >= start
    ? Object.freeze({ startRenderedUtf16: start, endRenderedUtf16: end })
    : null
}

export function transitionVNextTextBlockUnifiedLayoutFlowInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
}):
  | VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1 {
  const record = getVNextTextBlockUnifiedLayoutSourceStageRecordInternalV1({
    previousRoot: input.previousRoot,
    sourceStage: input.sourceStage,
    evidence: input.evidence,
  })
  const blocked = (
    work: VNextTextBlockIncrementalCandidateWorkV1,
    message: string,
  ): VNextTextBlockUnifiedLayoutOwnedStageFailureV1 => freeze({
    status: "blocked" as const,
    completedCandidateWork: work,
    issues: freeze([issue(message)]),
  })
  if (record == null) {
    return blocked(
      input.sourceStage.completedCandidateWork,
      "Flow stage requires exact registered Source-stage authority",
    )
  }
  const effect = input.sourceStage.preflight.effectClassification.effectClass
  if (effect === "true-no-op") {
    return blocked(
      input.sourceStage.completedCandidateWork,
      "true no-op must not enter Flow transition",
    )
  }
  let work = input.sourceStage.completedCandidateWork
  let nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  let flowBindingAuthority: VNextTextBlockFlowBindingAuthorityInternalV1 | null
  if (effect === "semantic-only-change" || effect === "paint-affecting-change") {
    if (input.evidence != null || input.sourceStage.sourceLayoutDeltaAuthority == null) {
      return blocked(work, "Flow alias requires exact evidence-free layout delta authority")
    }
    flowBindingAuthority = bindVNextTextBlockIncrementalFlowExactAliasInternalV1({
      previousFlowTree: input.previousRoot.flowTree,
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: input.sourceStage.nextSourceState,
      sourceLayoutDeltaAuthority: input.sourceStage.sourceLayoutDeltaAuthority,
    })
    if (flowBindingAuthority == null) {
      return blocked(work, "Flow alias proof rejected the exact Source transition")
    }
    nextFlowTree = input.previousRoot.flowTree
  } else {
    if (input.evidence == null || input.sourceStage.sourceLayoutDeltaAuthority != null) {
      return blocked(work, "geometry Flow path copy requires exact V2 evidence only")
    }
    let visitedFlowAtomCount = work.flow.visitedFlowAtomCount
    let visitedFlowTreeNodeCount = work.flow.visitedFlowTreeNodeCount
    let reusedFlowTreeNodeCount = work.flow.reusedFlowTreeNodeCount
    let createdFlowTreeNodeCount = work.flow.createdFlowTreeNodeCount
    const failedEvaluation: {
      value: ReturnType<typeof evaluateNextVNextTextBlockStageVisitInternalV1> | null
    } = { value: null }
    const beforeVisit = (
      unit: "flow-atoms" | "flow-tree-nodes",
    ): boolean => {
      const completedWork = unit === "flow-atoms"
        ? visitedFlowAtomCount
        : visitedFlowTreeNodeCount
      const evaluation = evaluateNextVNextTextBlockStageVisitInternalV1({
        validatedChange: record.validatedChange,
        stage: "source-flow",
        unit,
        completedWork,
        completedCandidateWork: work,
      })
      if (evaluation.status !== "accepted") {
        failedEvaluation.value = evaluation
        return false
      }
      if (unit === "flow-atoms") {
        visitedFlowAtomCount = evaluation.attemptedWork
      } else {
        visitedFlowTreeNodeCount = evaluation.attemptedWork
      }
      work = updateFlowWork({
        previousRoot: input.previousRoot,
        work,
        visitedFlowAtomCount,
        visitedFlowTreeNodeCount,
        reusedFlowTreeNodeCount,
        createdFlowTreeNodeCount,
      })
      return true
    }
    const evidenceTarget =
      input.sourceStage.preflight.nextRanges.evidenceTargetRange
    if (
      input.evidence.nextEvidenceTargetRange.startRenderedUtf16
        !== evidenceTarget.startRenderedUtf16
      || input.evidence.nextEvidenceTargetRange.endRenderedUtf16
        !== evidenceTarget.endRenderedUtf16
    ) return blocked(work, "Flow evidence target drifted from exact preflight")
    const replacementTarget = evidenceTarget
    const previousReplacementTarget =
      previousReplacementRangeForNextEvidenceTarget({
        previousChangedRange:
          input.sourceStage.preflight.previousRanges.changedSourceRange,
        nextChangedRange:
          input.sourceStage.preflight.nextRanges.changedSourceRange,
        nextEvidenceTargetRange: replacementTarget,
      })
    if (previousReplacementTarget == null) {
      return blocked(work, "Flow evidence target cannot map to previous Source")
    }
    const projected = prepareVNextTextBlockIncrementalFlowReplacementAtomsInternalV1({
      nextSourceState: input.sourceStage.nextSourceState,
      boundedSourceItems: record.boundedNextSourceItems,
      boundedSourceStartRenderedUtf16:
        record.boundedNextSourceStartRenderedUtf16,
      targetRange: replacementTarget,
      evidence: input.evidence,
      beforeVisit: () => beforeVisit("flow-atoms"),
    })
    if (projected.status !== "prepared") {
      if (failedEvaluation.value?.status === "limit-exceeded") {
        return freeze({
          status: "fallback-required" as const,
          evaluatorOrProofAuthority: failedEvaluation.value.evaluatorAuthority,
          completedCandidateWork: work,
          issues: freeze([]) as readonly [],
        })
      }
      return projected.issues.length > 0
        ? freeze({ status: "blocked" as const, completedCandidateWork: work, issues: projected.issues })
        : blocked(work, "Flow projection stopped without exact evaluator authority")
    }
    const copied = prepareVNextTextBlockIncrementalFlowRangePathCopyInternalV1({
      previousFlowTree: input.previousRoot.flowTree,
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: input.sourceStage.nextSourceState,
      replacementAtoms: projected.atoms,
      previousRange: previousReplacementTarget,
      nextRange: replacementTarget,
      beforeVisit,
    })
    if (copied.status !== "prepared") {
      createdFlowTreeNodeCount = copied.createdFlowTreeNodeCount
      work = updateFlowWork({
        previousRoot: input.previousRoot,
        work,
        visitedFlowAtomCount,
        visitedFlowTreeNodeCount,
        reusedFlowTreeNodeCount,
        createdFlowTreeNodeCount,
      })
      if (failedEvaluation.value?.status === "limit-exceeded") {
        return freeze({
          status: "fallback-required" as const,
          evaluatorOrProofAuthority: failedEvaluation.value.evaluatorAuthority,
          completedCandidateWork: work,
          issues: freeze([]) as readonly [],
        })
      }
      return copied.issues.length > 0
        ? freeze({ status: "blocked" as const, completedCandidateWork: work, issues: copied.issues })
        : blocked(work, "Flow path copy stopped without exact evaluator authority")
    }
    reusedFlowTreeNodeCount = copied.reusedFlowTreeNodeCount
    createdFlowTreeNodeCount = copied.createdFlowTreeNodeCount
    work = updateFlowWork({
      previousRoot: input.previousRoot,
      work,
      visitedFlowAtomCount,
      visitedFlowTreeNodeCount,
      reusedFlowTreeNodeCount,
      createdFlowTreeNodeCount,
    })
    nextFlowTree = copied.flowTree
    flowBindingAuthority = bindVNextTextBlockIncrementalFlowCandidateInternalV1({
      previousFlowTree: input.previousRoot.flowTree,
      nextFlowTree,
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: input.sourceStage.nextSourceState,
      structuralTargetAuthority: input.sourceStage.structuralTargetAuthority,
    })
    if (flowBindingAuthority == null) {
      return blocked(work, "Flow candidate could not bind exact structural authority")
    }
  }
  return freeze({
    status: "accepted" as const,
    preflight: input.sourceStage.preflight,
    nextSourceState: input.sourceStage.nextSourceState,
    nextFlowTree,
    flowBindingAuthority,
    seedRegion: seedRegion(input.sourceStage),
    existingLineageIds: input.sourceStage.existingLineageIds,
    insertedLineageIds: input.sourceStage.insertedLineageIds,
    completedCandidateWork: work,
    issues: freeze([]) as readonly [],
  })
}
