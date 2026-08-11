import type {
  VNextTextBlockSourceRangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
  VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1,
} from "./textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
  VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutPreparedSourceCandidateCommitPlanInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutChangePreflightV2,
} from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import type {
  VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1,
} from "./textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import type {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1,
  prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import {
  abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
} from "./textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import {
  abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1,
  applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1,
  discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStageApplyRecordForTestInternalV1,
  mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
  type VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 as VNextTextBlockUnifiedLayoutTransactionSourceStageCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"

const SOURCE_STAGE_STEP_CONSUMER_AUTHORITY_INTERNAL_V1 = Object.freeze({}) as
  VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1

export interface VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 {
  readonly __sourceStageAuthorityOpaque: never
}

export type VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 =
  VNextTextBlockUnifiedLayoutTransactionSourceStageCommitTicketInternalV1

export interface VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1 {
  readonly __sourceStageSidecarPreconditionAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutPreparedSourceStagePublicationPlanInternalV1 {
  readonly planAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
  readonly sealAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
  readonly plannedOutput: VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
}

export interface VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
  readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
}

export interface VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 {
  readonly status: "accepted"
  readonly authorityMode: "plan-a"
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
  readonly sourceStageAuthority:
    VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  readonly candidateWorkAuthority:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export interface VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly sourceMaterial:
    VNextTextBlockTransitionProducerSourceMaterialV2 | null
  readonly boundedNextSourceItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly boundedNextSourceStartRenderedUtf16: number
}

export type VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1 =
  | "after-candidate-work-owner-prepare"
  | "after-sidecar-owner-prepare"
  | "after-source-owner-prepare"
  | "after-stage-owner-prepare"

let sourceCommitPrepareFaultPointForTestInternalV1:
  VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1 | null =
    null

export function setVNextTextBlockUnifiedLayoutSourceCommitPrepareFaultForTestInternalV1(
  point:
    VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1 | null,
): void {
  if (
    point !== null
    && sourceCommitPrepareFaultPointForTestInternalV1 !== null
  ) {
    throw new Error("Source commit prepare fault configuration invariant violated")
  }
  sourceCommitPrepareFaultPointForTestInternalV1 = point
}

function hasSourceCommitPrepareFaultForTestInternalV1(
  point: VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1,
): boolean {
  return sourceCommitPrepareFaultPointForTestInternalV1 === point
}

const stageAuthorityRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1
>()
type SourceStagePublicationPlanRecordInternalV1 = Readonly<{
    readonly planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
    readonly stageAuthorityRecord:
      VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1
    readonly structuralTargetAuthority:
      VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
    readonly structuralTargetRecord: Readonly<{
      readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly sourceStageAuthority:
        VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
    }>
    readonly sourceLayoutDeltaAuthority:
      VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null
    readonly sourceLayoutDeltaRecord: Readonly<{
      readonly structuralTargetAuthority:
        VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
    }> | null
    readonly resultRecord:
      VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly sealAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
    readonly candidateWorkPlan:
      VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1
    readonly sidecarPlan:
      VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1
    readonly sourcePlan:
      VNextTextBlockUnifiedLayoutPreparedSourceCandidateCommitPlanInternalV1
  }>
const sourceStagePublicationPlanRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
  SourceStagePublicationPlanRecordInternalV1
>()
const sourceStagePlanAResultRecords = new WeakMap<
  object,
  VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1
>()
const structuralTargetAuthorities = new WeakMap<object, {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sourceStageAuthority: VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 | null
}>()
const sourceLayoutDeltaAuthorities = new WeakMap<object, {
  readonly structuralTargetAuthority: VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}>()

export function prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateWorkPlan:
      VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1
    readonly sidecarPlan:
      VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1
    readonly sourcePlan:
      VNextTextBlockUnifiedLayoutPreparedSourceCandidateCommitPlanInternalV1
    readonly producingStageAuthority:
      | VNextTextBlockUnifiedLayoutChangePreflightV2
      | VNextTextBlockTransitionEvidenceV2
    readonly validatedChange: VNextTextBlockValidatedChangeV1
    readonly sourceMaterial:
      VNextTextBlockTransitionProducerSourceMaterialV2 | null
    readonly boundedNextSourceItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly boundedNextSourceStartRenderedUtf16: number
    readonly previousSourceRange: VNextTextBlockSourceRangeV1
    readonly nextSourceRange: VNextTextBlockSourceRangeV1
    readonly existingLineageIds: readonly string[]
    readonly insertedLineageIds: readonly string[]
  }>,
): VNextTextBlockUnifiedLayoutPreparedSourceStagePublicationPlanInternalV1 | null {
  const nextSidecars = input.sidecarPlan.plannedOutput.nextSidecars
  const nextSourceState = input.sourcePlan.plannedOutput
  const candidateWorkAuthority = input.candidateWorkPlan.candidateWorkAuthority
  const completedCandidateWork = input.candidateWorkPlan.completedCandidateWork
  if (
    input.previousSidecars.sourceState !== input.previousSourceState
    || nextSidecars.sourceState !== nextSourceState
    || input.packingPolicy !== input.previousSourceState.policy
    || input.preflight.change == null
    || (input.evidence ?? input.preflight) !== input.producingStageAuthority
    || input.previousSourceRange
      !== input.preflight.previousRanges.changedSourceRange
    || input.nextSourceRange !== input.preflight.nextRanges.changedSourceRange
    || !Object.isFrozen(input.boundedNextSourceItems)
    || !Object.isFrozen(input.existingLineageIds)
    || !Object.isFrozen(input.insertedLineageIds)
    || !Number.isSafeInteger(input.boundedNextSourceStartRenderedUtf16)
    || input.boundedNextSourceStartRenderedUtf16 < 0
    || input.candidateWorkPlan.previousRoot !== input.previousRoot
    || input.candidateWorkPlan.change !== input.preflight.change
    || input.candidateWorkPlan.composition !== input.composition
    || input.candidateWorkPlan.producingInputAuthority
      !== input.producingStageAuthority
    || input.sidecarPlan.plannedOutput.registration.root !== input.previousRoot
    || input.sidecarPlan.plannedOutput.registration.composition
      !== input.composition
    || input.sidecarPlan.plannedOutput.registration.sidecars !== nextSidecars
    || input.sidecarPlan.plannedOutput.sourceAccessRecord
      !== input.sourcePlan.sourceAccessRecord
    || input.sourcePlan.sourcePathCopyCandidateAuthority == null
    || !matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
      detachedTicket: input.detachedTicket,
      planAuthority: input.candidateWorkPlan.planAuthority,
      sealAuthority: input.candidateWorkPlan.sealAuthority,
      plannedOutput: candidateWorkAuthority,
    })
    || !matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1({
      detachedTicket: input.detachedTicket,
      planAuthority: input.sidecarPlan.planAuthority,
      sealAuthority: input.sidecarPlan.sealAuthority,
      plannedOutput: input.sidecarPlan.plannedOutput,
    })
    || !matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1({
      detachedTicket: input.detachedTicket,
      planAuthority: input.sourcePlan.planAuthority,
      sealAuthority: input.sourcePlan.sealAuthority,
      plannedOutput: nextSourceState,
    })
  ) return null
  const sourceStageAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  const structuralTargetAuthority = Object.freeze({}) as
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  const sourceLayoutDeltaAuthority = input.preflight.boundedDelta.layoutEqual
    ? Object.freeze({}) as VNextTextBlockSourceLayoutDeltaAuthorityInternalV1
    : null
  const sourceLayoutDeltaRecord = sourceLayoutDeltaAuthority == null
    ? null
    : Object.freeze({ structuralTargetAuthority })
  const stageAuthorityRecord = Object.freeze({
    previousRoot: input.previousRoot,
    previousSourceState: input.previousSourceState,
    preflight: input.preflight,
    evidence: input.evidence,
    composition: input.composition,
    packingPolicy: input.packingPolicy,
    previousSidecars: input.previousSidecars,
    nextSourceState,
    nextSidecars,
    completedCandidateWork,
    candidateWorkAuthority,
  })
  const sourceStage = Object.freeze({
    status: "accepted" as const,
    authorityMode: "plan-a" as const,
    preflight: input.preflight,
    previousSourceRange: input.previousSourceRange,
    nextSourceRange: input.nextSourceRange,
    nextSourceState,
    existingLineageIds: input.existingLineageIds,
    insertedLineageIds: input.insertedLineageIds,
    structuralTargetAuthority,
    sourceLayoutDeltaAuthority,
    sourceStageAuthority,
    candidateWorkAuthority,
    completedCandidateWork,
    issues: Object.freeze([]) as readonly [],
  })
  const resultRecord = Object.freeze({
    previousRoot: input.previousRoot,
    sourceStage,
    evidence: input.evidence,
    validatedChange: input.validatedChange,
    sourceMaterial: input.sourceMaterial,
    boundedNextSourceItems: input.boundedNextSourceItems,
    boundedNextSourceStartRenderedUtf16:
      input.boundedNextSourceStartRenderedUtf16,
  })
  const planAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
  const sealAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
  const planRecord = Object.freeze({
    planAuthority,
    sourceStage,
    stageAuthorityRecord,
    structuralTargetAuthority,
    structuralTargetRecord: Object.freeze({
      previousSourceState: input.previousSourceState,
      nextSourceState,
      sourceStageAuthority,
    }),
    sourceLayoutDeltaAuthority,
    sourceLayoutDeltaRecord,
    resultRecord,
    detachedTicket: input.detachedTicket,
    sealAuthority,
    candidateWorkPlan: input.candidateWorkPlan,
    sidecarPlan: input.sidecarPlan,
    sourcePlan: input.sourcePlan,
  }) as SourceStagePublicationPlanRecordInternalV1
  const applyRecord = planRecord as unknown as
    VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
  const prepared = Object.freeze({
    planAuthority,
    sealAuthority,
    plannedOutput: sourceStage,
  })
  sourceStagePublicationPlanRecords.set(planAuthority, planRecord)
  if (!attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
    detachedTicket: input.detachedTicket,
    planAuthority,
    sealAuthority,
    applyRecord,
    consumerAuthority: SOURCE_STAGE_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
  })) {
    sourceStagePublicationPlanRecords.delete(planAuthority)
    return null
  }
  return prepared
}

export function matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
    plannedOutput: VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
    candidateWorkPlan:
      VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1
    sidecarPlan:
      VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1
    sourcePlan:
      VNextTextBlockUnifiedLayoutPreparedSourceCandidateCommitPlanInternalV1
  }>,
): boolean {
  const plan = sourceStagePublicationPlanRecords.get(input.planAuthority)
  return plan != null
    && plan.detachedTicket === input.detachedTicket
    && plan.sealAuthority === input.sealAuthority
    && plan.sourceStage === input.plannedOutput
    && plan.candidateWorkPlan === input.candidateWorkPlan
    && plan.sidecarPlan === input.sidecarPlan
    && plan.sourcePlan === input.sourcePlan
}

export function abandonVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (!sourceStagePublicationPlanRecords.has(input.planAuthority)) {
    throw new Error("Source stage publication plan abandonment invariant violated")
  }
  consumeVNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentInternalV1(input)
  sourceStagePublicationPlanRecords.delete(input.planAuthority)
}

export function applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  step: VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
): VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1 {
  const { applyRecord, finishStep } =
    consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1({
      step,
      consumerAuthority: SOURCE_STAGE_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
    })
  const plan = applyRecord as unknown as SourceStagePublicationPlanRecordInternalV1
  stageAuthorityRecords.set(
    plan.sourceStage.sourceStageAuthority,
    plan.stageAuthorityRecord,
  )
  structuralTargetAuthorities.set(
    plan.structuralTargetAuthority,
    plan.structuralTargetRecord,
  )
  if (plan.sourceLayoutDeltaAuthority != null) {
    sourceLayoutDeltaAuthorities.set(
      plan.sourceLayoutDeltaAuthority,
      plan.sourceLayoutDeltaRecord!,
    )
  }
  sourceStagePlanAResultRecords.set(plan.sourceStage, plan.resultRecord)
  sourceStagePublicationPlanRecords.delete(plan.planAuthority)
  return finishStep
}

export function inspectVNextTextBlockUnifiedLayoutSourceStagePublicationPlanForTestInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 | null {
  return sourceStagePublicationPlanRecords.get(planAuthority)?.sourceStage ?? null
}

export function resolveVNextTextBlockUnifiedLayoutSourceStagePlanAResultInternalV1(
  input: Readonly<{
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly sourceStage: unknown
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  }>,
): VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1 | null {
  const record = input.sourceStage != null && typeof input.sourceStage === "object"
    ? sourceStagePlanAResultRecords.get(input.sourceStage as object)
    : null
  return record != null
      && record.previousRoot === input.previousRoot
      && record.sourceStage === input.sourceStage
      && record.evidence === input.evidence
    ? record
    : null
}

export function prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
  input: Readonly<{
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly producingStageAuthority:
      | VNextTextBlockUnifiedLayoutChangePreflightV2
      | VNextTextBlockTransitionEvidenceV2
    readonly completedSourceEmissionCount: number
    readonly candidateWorkPublicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    readonly sidecarRegistrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    readonly validatedChange: VNextTextBlockValidatedChangeV1
    readonly sourceMaterial:
      VNextTextBlockTransitionProducerSourceMaterialV2 | null
    readonly boundedNextSourceItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly boundedNextSourceStartRenderedUtf16: number
    readonly existingLineageIds: readonly string[]
    readonly insertedLineageIds: readonly string[]
  }>,
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null {
  const detachedTicket =
    createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
  const cleanupPreparedCandidates = (): void => {
    discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
      input.nextSidecarCandidateAuthority,
    )
    discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      input.sourcePathCopyCandidateAuthority,
    )
  }
  const abandonPrepared = (inputPlans: Readonly<{
    candidateWork: ReturnType<
      typeof prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1
    >
    sidecar: ReturnType<
      typeof prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1
    >
    source: ReturnType<
      typeof prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1
    >
    stage: ReturnType<
      typeof prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1
    >
    abort?: VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1
  }>): void => {
    const abort = inputPlans.abort
      ?? abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
        detachedTicket,
      )
    if (abort == null) {
      throw new Error("Source commit detached abort invariant violated")
    }
    if (inputPlans.stage != null && abort.stage != null) {
      abandonVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
        planAuthority: inputPlans.stage.planAuthority,
        abandonmentAuthority: abort.stage.abandonmentAuthority,
      })
    }
    if (inputPlans.source != null && abort.source != null) {
      abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
        planAuthority: inputPlans.source.planAuthority,
        abandonmentAuthority: abort.source.abandonmentAuthority,
      })
    }
    if (inputPlans.sidecar != null && abort.sidecar != null) {
      abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
        planAuthority: inputPlans.sidecar.planAuthority,
        abandonmentAuthority: abort.sidecar.abandonmentAuthority,
      })
    }
    if (inputPlans.candidateWork != null && abort.candidateWork != null) {
      abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        planAuthority: inputPlans.candidateWork.planAuthority,
        abandonmentAuthority: abort.candidateWork.abandonmentAuthority,
      })
    }
  }
  const candidateWorkPrepared =
    prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
      detachedTicket,
      publicationPreconditionAuthority:
        input.candidateWorkPublicationPreconditionAuthority,
      candidateWorkMeter: input.candidateWorkMeter,
      nextCandidateWork: input.nextCandidateWork,
      completedSourceEmissionCount: input.completedSourceEmissionCount,
    })
  if (candidateWorkPrepared == null) {
    abandonPrepared({
      candidateWork: null,
      sidecar: null,
      source: null,
      stage: null,
    })
    return null
  }
  if (hasSourceCommitPrepareFaultForTestInternalV1(
    "after-candidate-work-owner-prepare",
  )) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: null,
      source: null,
      stage: null,
    })
    return null
  }
  const sidecarPlan =
    prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
      detachedTicket,
      registrationPreconditionAuthority:
        input.sidecarRegistrationPreconditionAuthority,
      previousSidecars: input.previousSidecars,
      nextSidecars: input.nextSidecars,
      candidateWorkMeter: input.candidateWorkMeter,
      nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
      sourcePathCopyCandidateAuthority:
        input.sourcePathCopyCandidateAuthority,
    })
  if (sidecarPlan == null) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: null,
      source: null,
      stage: null,
    })
    return null
  }
  if (hasSourceCommitPrepareFaultForTestInternalV1(
    "after-sidecar-owner-prepare",
  )) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: null,
      stage: null,
    })
    return null
  }
  const sourcePlan =
    prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
      detachedTicket,
      sourcePathCopyCandidateAuthority:
        input.sourcePathCopyCandidateAuthority,
      accessReservationAuthority:
        input.sidecarRegistrationPreconditionAuthority,
      nextSourceState: input.nextSourceState,
    })
  if (sourcePlan == null) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: null,
      stage: null,
    })
    return null
  }
  if (hasSourceCommitPrepareFaultForTestInternalV1(
    "after-source-owner-prepare",
  )) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: sourcePlan,
      stage: null,
    })
    return null
  }
  const stagePlan =
    prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
      detachedTicket,
      previousRoot: input.previousRoot,
      previousSourceState: input.previousSourceState,
      preflight: input.preflight,
      evidence: input.evidence,
      composition: input.composition,
      packingPolicy: input.packingPolicy,
      previousSidecars: input.previousSidecars,
      candidateWorkPlan: candidateWorkPrepared,
      sidecarPlan,
      sourcePlan,
      producingStageAuthority: input.producingStageAuthority,
      validatedChange: input.validatedChange,
      sourceMaterial: input.sourceMaterial,
      boundedNextSourceItems: input.boundedNextSourceItems,
      boundedNextSourceStartRenderedUtf16:
        input.boundedNextSourceStartRenderedUtf16,
      previousSourceRange: input.preflight.previousRanges.changedSourceRange,
      nextSourceRange: input.preflight.nextRanges.changedSourceRange,
      existingLineageIds: input.existingLineageIds,
      insertedLineageIds: input.insertedLineageIds,
    })
  if (stagePlan == null) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: sourcePlan,
      stage: null,
    })
    cleanupPreparedCandidates()
    return null
  }
  if (hasSourceCommitPrepareFaultForTestInternalV1(
    "after-stage-owner-prepare",
  )) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: sourcePlan,
      stage: stagePlan,
    })
    return null
  }
  const sourceStage = stagePlan.plannedOutput
  if (
    !matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
      detachedTicket,
      planAuthority: candidateWorkPrepared.planAuthority,
      sealAuthority: candidateWorkPrepared.sealAuthority,
      plannedOutput: candidateWorkPrepared.candidateWorkAuthority,
    })
    || !matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1({
      detachedTicket,
      planAuthority: sidecarPlan.planAuthority,
      sealAuthority: sidecarPlan.sealAuthority,
      plannedOutput: sidecarPlan.plannedOutput,
    })
    || !matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1({
      detachedTicket,
      planAuthority: sourcePlan.planAuthority,
      sealAuthority: sourcePlan.sealAuthority,
      plannedOutput: sourcePlan.plannedOutput,
    })
    || !matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1({
      detachedTicket,
      planAuthority: stagePlan.planAuthority,
      sealAuthority: stagePlan.sealAuthority,
      plannedOutput: sourceStage,
      candidateWorkPlan: candidateWorkPrepared,
      sidecarPlan,
      sourcePlan,
    })
  ) {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: sourcePlan,
      stage: stagePlan,
    })
    return null
  }
  const mintResult = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
    detachedTicket,
    candidateWorkPlanAuthority: candidateWorkPrepared.planAuthority,
    sidecarPlanAuthority: sidecarPlan.planAuthority,
    sourcePlanAuthority: sourcePlan.planAuthority,
    stagePlanAuthority: stagePlan.planAuthority,
    candidateWorkPlanSealAuthority: candidateWorkPrepared.sealAuthority,
    sidecarPlanSealAuthority: sidecarPlan.sealAuthority,
    sourcePlanSealAuthority: sourcePlan.sealAuthority,
    stagePlanSealAuthority: stagePlan.sealAuthority,
    candidateWorkPublicationPreconditionAuthority:
      input.candidateWorkPublicationPreconditionAuthority,
    sidecarRegistrationPreconditionAuthority:
      input.sidecarRegistrationPreconditionAuthority,
    candidateWorkMeter: input.candidateWorkMeter,
    nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
  })
  if (mintResult == null || mintResult.status === "aborted") {
    abandonPrepared({
      candidateWork: candidateWorkPrepared,
      sidecar: sidecarPlan,
      source: sourcePlan,
      stage: stagePlan,
      ...(mintResult?.status === "aborted"
        ? { abort: mintResult.abort }
        : {}),
    })
    return null
  }
  const ticket = mintResult.ticket
  return ticket
}

export function commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 {
  const sourceStage =
    inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
      ticket,
    )
  if (sourceStage == null) {
    throw new Error("Source stage commit return invariant violated")
  }
  const candidateWorkStep =
    beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
  const sidecarStep =
    applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
      candidateWorkStep,
    )
  const sourceStep =
    applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(sidecarStep)
  const stageStep =
    applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(sourceStep)
  const finishStep =
    applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(stageStep)
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(finishStep)
  return sourceStage
}

export function inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 | null {
  const applyRecord =
    inspectVNextTextBlockUnifiedLayoutSourceStageApplyRecordForTestInternalV1(
      ticket,
    )
  return applyRecord == null
    ? null
    : (applyRecord as unknown as SourceStagePublicationPlanRecordInternalV1)
      .sourceStage
}

export function resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1(
  input: {
    readonly authority: unknown
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  },
): VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1 | null {
  const record = input.authority != null && typeof input.authority === "object"
    ? stageAuthorityRecords.get(
      input.authority as VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1,
    )
    : null
  return record != null
      && record.previousRoot === input.previousRoot
      && record.nextSourceState === input.nextSourceState
      && record.completedCandidateWork === input.completedCandidateWork
    ? record
    : null
}

/** Frozen compatibility lane only; Plan A derives these from a full stage. */
export function createVNextTextBlockStructuralTargetAuthorityInternalV1(input: {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}): VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1 {
  const authority = Object.freeze({}) as
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  structuralTargetAuthorities.set(authority, Object.freeze({
    ...input,
    sourceStageAuthority: null,
  }))
  return authority
}

/** Frozen compatibility lane only; Plan A derives these from a full stage. */
export function createVNextTextBlockSourceLayoutDeltaAuthorityInternalV1(input: {
  readonly structuralTargetAuthority: VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}): VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null {
  if (!structuralTargetAuthorities.has(input.structuralTargetAuthority)) return null
  const authority = Object.freeze({}) as
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1
  sourceLayoutDeltaAuthorities.set(authority, Object.freeze(input))
  return authority
}

export function hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1(
  input: {
    readonly authority: unknown
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  },
): boolean {
  const layout = input.authority != null && typeof input.authority === "object"
    ? sourceLayoutDeltaAuthorities.get(input.authority as object)
    : null
  const structural = layout == null
    ? null
    : structuralTargetAuthorities.get(layout.structuralTargetAuthority)
  return structural != null
    && structural.previousSourceState === input.previousSourceState
    && structural.nextSourceState === input.nextSourceState
}

export function hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1(
  input: {
    readonly authority: unknown
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  },
): boolean {
  const structural = input.authority != null && typeof input.authority === "object"
    ? structuralTargetAuthorities.get(input.authority as object)
    : null
  return structural != null
    && structural.previousSourceState === input.previousSourceState
    && structural.nextSourceState === input.nextSourceState
}
