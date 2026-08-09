import type { VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1,
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
  type VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  type VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  commitVNextTextBlockUnifiedLayoutSourceStageInternalV1,
  createVNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  createVNextTextBlockStructuralTargetAuthorityInternalV1,
  hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1,
  hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import {
  discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
} from "./textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import {
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1,
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
} from "./textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  evaluateNextVNextTextBlockStageVisitInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2,
} from "./textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2,
  type VNextTextBlockUnifiedLayoutChangePreflightV2,
  type VNextTextBlockUnifiedLayoutOwnedStageFailureV1,
} from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export type {
  VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"

export interface VNextTextBlockUnifiedLayoutSourceStageAcceptedV1 {
  readonly status: "accepted"
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly previousSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly existingLineageIds: readonly string[]
  readonly insertedLineageIds: readonly string[]
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  readonly sourceLayoutDeltaAuthority:
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null
  readonly sourceStageAuthority?:
    VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  readonly candidateWorkAuthority?:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export interface VNextTextBlockUnifiedLayoutSourceStageRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly sourceMaterial:
    VNextTextBlockTransitionProducerSourceMaterialV2 | null
  readonly boundedNextSourceItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly boundedNextSourceStartRenderedUtf16: number
}

const sourceStageRecords = new WeakMap<
  object,
  VNextTextBlockUnifiedLayoutSourceStageRecordInternalV1
>()

export function getVNextTextBlockUnifiedLayoutSourceStageRecordInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly sourceStage: unknown
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  },
): VNextTextBlockUnifiedLayoutSourceStageRecordInternalV1 | null {
  const record = input.sourceStage != null
      && typeof input.sourceStage === "object"
    ? sourceStageRecords.get(input.sourceStage as object)
    : null
  return record != null
      && record.previousRoot === input.previousRoot
      && record.evidence === input.evidence
    ? record
    : null
}

export {
  hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1,
  hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
  }
  return value
}

function issue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return Object.freeze({
    code: "incremental-proof-unavailable",
    severity: "error",
    stage: "source-flow",
    path: "sourceState",
    message,
  })
}

function updateSourceWork(input: {
  readonly work: VNextTextBlockIncrementalCandidateWorkV1
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly visitedLookupNodeCount: number
  readonly copiedPathNodeCount: number
  readonly visitedChangedLeafItemCount: number
}): VNextTextBlockIncrementalCandidateWorkV1 {
  const flow = Object.freeze({
    ...input.work.flow,
    visitedSourceLookupNodeCount: input.visitedLookupNodeCount,
    copiedSourcePathNodeCount: input.copiedPathNodeCount,
    visitedChangedSourceLeafItemCount: input.visitedChangedLeafItemCount,
  })
  const counts = new Map(
    input.work.stageWork.map((row) => [`${row.stage}/${row.unit}`, row.count]),
  )
  counts.set("source-flow/source-lookup-nodes", input.visitedLookupNodeCount)
  counts.set("source-flow/source-path-copy-nodes", input.copiedPathNodeCount)
  counts.set("source-flow/source-leaf-items", input.visitedChangedLeafItemCount)
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

function finalizeSourceStageAuthorities(input: {
  readonly candidateAuthority: unknown
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}): {
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  readonly sourceLayoutDeltaAuthority:
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null
} | null {
  const candidate =
    getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      input.candidateAuthority,
    )
  if (
    candidate == null
    || input.previousRoot.sourceState !== candidate.previousSourceState
    || input.preflight.previousRanges.changedSourceRange
      !== candidate.replacement.previousRange
    || input.preflight.replacementItems !== candidate.replacement.nextItems
    || input.completedCandidateWork.flow.visitedSourceLookupNodeCount
      !== candidate.visitedLookupNodeCount
    || input.completedCandidateWork.flow.copiedSourcePathNodeCount
      !== candidate.copiedPathNodeCount
    || input.completedCandidateWork.flow.visitedChangedSourceLeafItemCount
      !== candidate.visitedChangedLeafItemCount
  ) return null
  const structuralTargetAuthority =
    createVNextTextBlockStructuralTargetAuthorityInternalV1({
    previousSourceState: candidate.previousSourceState,
    nextSourceState: candidate.nextSourceState,
  })
  if (!input.preflight.boundedDelta.layoutEqual) {
    return Object.freeze({
      structuralTargetAuthority,
      sourceLayoutDeltaAuthority: null,
    })
  }
  const sourceLayoutDeltaAuthority =
    createVNextTextBlockSourceLayoutDeltaAuthorityInternalV1({
    structuralTargetAuthority,
  })
  if (sourceLayoutDeltaAuthority == null) return null
  return Object.freeze({
    structuralTargetAuthority,
    sourceLayoutDeltaAuthority,
  })
}

export function transitionVNextTextBlockUnifiedLayoutSourceInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1 {
  const record = getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
    preflight: input.preflight,
    previousRoot: input.previousRoot,
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
    return blocked(input.completedCandidateWork, "source stage requires exact registered preflight authority")
  }
  switch (input.preflight.effectClassification.effectClass) {
    case "true-no-op":
      return blocked(
        input.completedCandidateWork,
        "true no-op must not enter source transition",
      )
    case "semantic-only-change":
    case "paint-affecting-change":
    case "geometry-affecting-change":
      break
  }
  if (input.preflight.producerEvidence === "required") {
    if (
      record.request == null
      || record.sourceMaterial == null
      || input.evidence == null
      || !hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
        evidence: input.evidence,
        previousRoot: input.previousRoot,
        change: record.change,
        completedCandidateWork: input.completedCandidateWork,
        expectedRequest: record.request,
        expectedSourceMaterial: record.sourceMaterial,
      })
    ) return blocked(input.completedCandidateWork, "source stage requires exact accepted V2 evidence authority")
  } else if (
    input.evidence != null
    || input.completedCandidateWork !== record.completedCandidateWork
  ) {
    return blocked(input.completedCandidateWork, "evidence-free source stage requires exact preflight work authority")
  }

  const replacement = record.sourceReplacement
  if (
    replacement == null
    || replacement.previousRange
      !== input.preflight.previousRanges.changedSourceRange
    || replacement.nextItems !== input.preflight.replacementItems
  ) {
    return blocked(
      input.completedCandidateWork,
      "source stage requires exact preflight-owned replacement authority",
    )
  }

  const composition =
    resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      input.previousRoot,
    )
  if (composition != null) {
    const previousSidecars =
      resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
        sourceState: input.previousRoot.sourceState,
        composition,
      })
    const candidateWorkRecord =
      resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
        previousRoot: input.previousRoot,
        change: record.change,
        composition,
        candidateWork: input.completedCandidateWork,
      })
    if (previousSidecars == null || candidateWorkRecord == null) {
      return blocked(
        input.completedCandidateWork,
        "Plan A Source stage requires exact previous sidecars and candidate-work authority",
      )
    }
    const candidateWorkAuthority = candidateWorkRecord as unknown as
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
    const meter =
      openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1({
        previousRoot: input.previousRoot,
        change: record.change,
        composition,
        candidateWork: input.completedCandidateWork,
        candidateWorkAuthority,
      })
    if (meter == null) {
      return blocked(
        input.completedCandidateWork,
        "Plan A Source stage requires one fresh exact candidate-work meter",
      )
    }
    let failedEvaluator: object | null = null
    let meterInvariantFailed = false
    let pendingPermit: Parameters<
      typeof completeVNextTextBlockUnifiedLayout5B2OperationInternalV1
    >[0] | null = null
    const beforeVisit = (
      unit: "source-lookup-nodes" | "source-path-copy-nodes" | "source-leaf-items",
    ): boolean => {
      if (pendingPermit != null) {
        if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
          pendingPermit,
        )) {
          meterInvariantFailed = true
          return false
        }
        pendingPermit = null
      }
      const mapped = unit === "source-lookup-nodes"
        ? "source-tree-lookup-nodes" as const
        : unit === "source-path-copy-nodes"
          ? "source-tree-path-copy-nodes" as const
          : "source-leaf-slots" as const
      const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
        meter,
        unit: mapped,
      })
      if (begun.status === "limit-exceeded") {
        failedEvaluator = begun.evaluatorAuthority
        return false
      }
      if (begun.status !== "permitted") {
        meterInvariantFailed = true
        return false
      }
      pendingPermit = begun.permit
      return true
    }
    const sourceCandidate =
      prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
        previousSourceState: input.previousRoot.sourceState,
        replacement,
        beforeVisit,
      })
    if (
      sourceCandidate.status === "prepared"
      && pendingPermit != null
    ) {
      if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
        pendingPermit,
      )) meterInvariantFailed = true
      pendingPermit = null
    }
    const factualWork = () =>
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
        ?? input.completedCandidateWork
    if (sourceCandidate.status !== "prepared") {
      if (failedEvaluator != null && !meterInvariantFailed) {
        return freeze({
          status: "fallback-required" as const,
          evaluatorOrProofAuthority: failedEvaluator,
          completedCandidateWork: factualWork(),
          issues: freeze([]) as readonly [],
        })
      }
      return sourceCandidate.issues.length > 0
        ? freeze({
            status: "blocked" as const,
            completedCandidateWork: factualWork(),
            issues: sourceCandidate.issues,
          })
        : blocked(
            factualWork(),
            "Plan A Source path copy stopped without exact evaluator authority",
          )
    }
    if (meterInvariantFailed) {
      return blocked(
        factualWork(),
        "Plan A Source operation permit completion invariant failed",
      )
    }
    const sourceCandidateRecord =
      getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      )
    if (sourceCandidateRecord == null) {
      return blocked(factualWork(), "Plan A Source candidate authority was lost")
    }
    const sidecarCandidate =
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
        previousSourceState: input.previousRoot.sourceState,
        nextSourceState: sourceCandidate.sourceState,
        replacement,
        removedItems: sourceCandidateRecord.removedItems,
        nextPhysicalItems: sourceCandidateRecord.nextPhysicalItems,
        previousSidecars,
        workMeter: meter,
      })
    if (sidecarCandidate.status !== "prepared") {
      discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      )
      if (sidecarCandidate.status === "fallback-required") {
        return freeze({
          status: "fallback-required" as const,
          evaluatorOrProofAuthority:
            sidecarCandidate.evaluatorOrProofAuthority,
          completedCandidateWork: factualWork(),
          issues: freeze([]) as readonly [],
        })
      }
      return freeze({
        status: "blocked" as const,
        completedCandidateWork: factualWork(),
        issues: sidecarCandidate.issues,
      })
    }
    const nextCandidateWork = factualWork()
    const completedSourceEmissionCount =
      sourceCandidateRecord.nextPhysicalItems.length
    const producingStageAuthority = input.evidence ?? input.preflight
    const candidateWorkPublicationPrecondition =
      prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
        meter,
        nextCandidateWork,
        completedSourceEmissionCount,
        producingStageAuthority,
      })
    const sidecarRegistrationPrecondition =
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1({
        previousRoot: input.previousRoot,
        composition,
        previousSidecars,
        nextSourceState: sourceCandidate.sourceState,
        nextSidecars: sidecarCandidate.sidecars,
        candidateAuthority: sidecarCandidate.candidateAuthority,
        sourcePathCopyCandidateAuthority:
          sourceCandidate.pathCopyCandidateAuthority,
        workMeter: meter,
      })
    if (
      nextCandidateWork.flow.visitedSourceItemCount
        !== completedSourceEmissionCount
      || sidecarRegistrationPrecondition == null
      || candidateWorkPublicationPrecondition == null
    ) {
      discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
        sidecarCandidate.candidateAuthority,
      )
      discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      )
      return blocked(
        nextCandidateWork,
        "Plan A Source commit preconditions rejected the complete candidate tuple",
      )
    }
    const ticket = prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1({
      previousRoot: input.previousRoot,
      previousSourceState: input.previousRoot.sourceState,
      preflight: input.preflight,
      evidence: input.evidence,
      composition,
      packingPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
      previousSidecars,
      nextSourceState: sourceCandidate.sourceState,
      nextSidecars: sidecarCandidate.sidecars,
      candidateWorkMeter: meter,
      nextCandidateWork,
      nextSidecarCandidateAuthority: sidecarCandidate.candidateAuthority,
      sourcePathCopyCandidateAuthority:
        sourceCandidate.pathCopyCandidateAuthority,
      producingStageAuthority,
      completedSourceEmissionCount,
      candidateWorkPublicationPreconditionAuthority:
        candidateWorkPublicationPrecondition,
      sidecarRegistrationPreconditionAuthority:
        sidecarRegistrationPrecondition,
    })
    if (ticket == null) {
      discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
        sidecarCandidate.candidateAuthority,
      )
      discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      )
      return blocked(
        nextCandidateWork,
        "Plan A Source commit ticket rejected the exact candidate tuple",
      )
    }

    // No-fail synchronous commit tail. Any failure here is an internal
    // invariant violation, never a fallback result with partial publication.
    const nextCandidateWorkAuthority =
      publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
        meter,
        nextCandidateWork,
        producingStageAuthority: ticket,
      })
    if (nextCandidateWorkAuthority == null) {
      throw new Error("Source candidate-work commit invariant violated")
    }
    if (!registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousRoot: input.previousRoot,
      composition,
      previousSidecars,
      nextSourceState: sourceCandidate.sourceState,
      nextSidecars: sidecarCandidate.sidecars,
      candidateAuthority: sidecarCandidate.candidateAuthority,
      workMeter: meter,
      sourceStageCommitTicket: ticket,
    })) throw new Error("Source sidecar commit invariant violated")
    const committed =
      commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(ticket)
    if (!consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      sourceCandidate.pathCopyCandidateAuthority,
    )) throw new Error("Source path-copy candidate retirement invariant violated")
    const sourceStage = freeze({
      status: "accepted" as const,
      preflight: input.preflight,
      previousSourceRange: input.preflight.previousRanges.changedSourceRange,
      nextSourceRange: input.preflight.nextRanges.changedSourceRange,
      nextSourceState: sourceCandidate.sourceState,
      existingLineageIds: sourceCandidate.existingLineageIds,
      insertedLineageIds: sourceCandidate.insertedLineageIds,
      structuralTargetAuthority: committed.structuralTargetAuthority,
      sourceLayoutDeltaAuthority: committed.sourceLayoutDeltaAuthority,
      sourceStageAuthority: committed.sourceStageAuthority,
      candidateWorkAuthority: nextCandidateWorkAuthority,
      completedCandidateWork: nextCandidateWork,
      issues: freeze([]) as readonly [],
    })
    sourceStageRecords.set(sourceStage, Object.freeze({
      previousRoot: input.previousRoot,
      sourceStage,
      evidence: input.evidence,
      validatedChange: record.validatedChange,
      sourceMaterial: record.sourceMaterial,
      boundedNextSourceItems: sourceCandidateRecord.nextLeafItems,
      boundedNextSourceStartRenderedUtf16:
        sourceCandidateRecord.nextLeafStartRenderedUtf16,
    }))
    return sourceStage
  }

  let work = input.completedCandidateWork
  let visitedLookupNodeCount = 0
  let copiedPathNodeCount = 0
  let visitedChangedLeafItemCount = 0
  const failedEvaluation: {
    value: ReturnType<
      typeof evaluateNextVNextTextBlockStageVisitInternalV1
    > | null
  } = { value: null }
  const beforeVisit = (
    unit: "source-lookup-nodes" | "source-path-copy-nodes" | "source-leaf-items",
  ): boolean => {
    const completedWork = unit === "source-lookup-nodes"
      ? visitedLookupNodeCount
      : unit === "source-path-copy-nodes"
        ? copiedPathNodeCount
        : visitedChangedLeafItemCount
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
    if (unit === "source-lookup-nodes") {
      visitedLookupNodeCount = evaluation.attemptedWork
    } else if (unit === "source-path-copy-nodes") {
      copiedPathNodeCount = evaluation.attemptedWork
    } else {
      visitedChangedLeafItemCount = evaluation.attemptedWork
    }
    work = updateSourceWork({
      work,
      previousRoot: input.previousRoot,
      visitedLookupNodeCount,
      copiedPathNodeCount,
      visitedChangedLeafItemCount,
    })
    return true
  }
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: input.previousRoot.sourceState,
    replacement,
    beforeVisit,
  })
  if (prepared.status !== "prepared") {
    if (failedEvaluation.value?.status === "limit-exceeded") {
      return freeze({
        status: "fallback-required" as const,
        evaluatorOrProofAuthority: failedEvaluation.value.evaluatorAuthority,
        completedCandidateWork: work,
        issues: freeze([]) as readonly [],
      })
    }
    return prepared.issues.length > 0
      ? freeze({
          status: "blocked" as const,
          completedCandidateWork: work,
          issues: prepared.issues,
        })
      : blocked(work, "source path copy stopped without exact evaluator authority")
  }
  const authorities =
    finalizeSourceStageAuthorities({
      candidateAuthority: prepared.pathCopyCandidateAuthority,
      previousRoot: input.previousRoot,
      preflight: input.preflight,
      evidence: input.evidence,
      completedCandidateWork: work,
    })
  if (authorities == null) {
    return blocked(
      work,
      "source authorities require the exact completed transition tuple",
    )
  }
  const pathCopyRecord =
    getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      prepared.pathCopyCandidateAuthority,
    )
  if (pathCopyRecord == null) {
    return blocked(work, "source path-copy candidate authority was lost")
  }
  const sourceStage = freeze({
    status: "accepted" as const,
    preflight: input.preflight,
    previousSourceRange: input.preflight.previousRanges.changedSourceRange,
    nextSourceRange: input.preflight.nextRanges.changedSourceRange,
    nextSourceState: prepared.sourceState,
    existingLineageIds: prepared.existingLineageIds,
    insertedLineageIds: prepared.insertedLineageIds,
    structuralTargetAuthority: authorities.structuralTargetAuthority,
    sourceLayoutDeltaAuthority: authorities.sourceLayoutDeltaAuthority,
    completedCandidateWork: work,
    issues: freeze([]) as readonly [],
  })
  sourceStageRecords.set(sourceStage, Object.freeze({
    previousRoot: input.previousRoot,
    sourceStage,
    evidence: input.evidence,
    validatedChange: record.validatedChange,
    sourceMaterial: record.sourceMaterial,
    boundedNextSourceItems: pathCopyRecord.nextLeafItems,
    boundedNextSourceStartRenderedUtf16:
      pathCopyRecord.nextLeafStartRenderedUtf16,
  }))
  return sourceStage
}
