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
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
  type VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  type VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  createVNextTextBlockStructuralTargetAuthorityInternalV1,
  hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1,
  hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
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
