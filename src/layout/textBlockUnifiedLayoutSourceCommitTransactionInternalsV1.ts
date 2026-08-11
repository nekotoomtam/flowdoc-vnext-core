import type {
  VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"

export interface VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1 {
  readonly __detachedSourceCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1 {
  readonly __sourceStageCommitTicketOpaque: never
}

export type VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 =
  VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1

export interface VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1 {
  readonly __candidateWorkPublicationPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1 {
  readonly __sourceSidecarCommitPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1 {
  readonly __sourceCandidateCommitPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1 {
  readonly __sourceStagePublicationPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1 {
  readonly __candidateWorkPublicationPlanSealAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1 {
  readonly __sourceSidecarCommitPlanSealAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1 {
  readonly __sourceCandidateCommitPlanSealAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1 {
  readonly __sourceStagePublicationPlanSealAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
  extends VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1 {
  readonly __candidateWorkApplyRecordOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
  extends VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1 {
  readonly __sourceSidecarApplyRecordOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
  extends VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1 {
  readonly __sourceCandidateApplyRecordOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
  extends VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1 {
  readonly __sourceStageApplyRecordOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1 {
  readonly __candidateWorkCommitStepOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1 {
  readonly __sourceSidecarCommitStepOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1 {
  readonly __sourceCandidateCommitStepOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1 {
  readonly __sourceStageCommitStepOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1 {
  readonly __sourceCommitFinishStepOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1 {
  readonly __candidateWorkStepConsumerAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1 {
  readonly __sourceSidecarStepConsumerAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1 {
  readonly __sourceCandidateStepConsumerAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1 {
  readonly __sourceStageStepConsumerAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1 {
  readonly __candidateWorkPlanAbandonmentAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1 {
  readonly __sourceSidecarPlanAbandonmentAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1 {
  readonly __sourceCandidatePlanAbandonmentAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1 {
  readonly __sourceStagePlanAbandonmentAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1 {
  readonly candidateWork: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
  }> | null
  readonly sidecar: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1
  }> | null
  readonly source: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1
  }> | null
  readonly stage: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1
  }> | null
}

export type VNextTextBlockUnifiedLayoutSourceCommitMintResultInternalV1 =
  | Readonly<{
      status: "sealed"
      ticket: VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1
    }>
  | Readonly<{
      status: "aborted"
      abort: VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1
    }>

export type VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1 =
  | "after-detached-minting-state"
  | "after-candidate-work-precondition-index"
  | "after-sidecar-precondition-index"
  | "after-candidate-work-meter-index"
  | "after-sidecar-candidate-index"
  | "after-source-candidate-index"
  | "after-access-reservation-index"
  | "before-live-write"

interface DetachedRecordInternalV1 {
  phase: "preparing-detached" | "minting"
  candidateWorkPlanAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1 | null
  sidecarPlanAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1 | null
  sourcePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1 | null
  stagePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1 | null
  candidateWorkPlanSealAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1 | null
  sidecarPlanSealAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1 | null
  sourcePlanSealAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1 | null
  stagePlanSealAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1 | null
  candidateWorkApplyRecord:
    VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1 | null
  sidecarApplyRecord:
    VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1 | null
  sourceApplyRecord:
    VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1 | null
  stageApplyRecord:
    VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1 | null
  candidateWorkStepConsumerAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1 | null
  sidecarStepConsumerAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1 | null
  sourceStepConsumerAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1 | null
  stageStepConsumerAuthority:
    VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1 | null
  readonly candidateWorkAbandonmentAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
  readonly sidecarAbandonmentAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1
  readonly sourceAbandonmentAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1
  readonly stageAbandonmentAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1
  abortBundle: VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1
  abortedMintResult: Extract<
    VNextTextBlockUnifiedLayoutSourceCommitMintResultInternalV1,
    { readonly status: "aborted" }
  >
  sealedMintResult: Extract<
    VNextTextBlockUnifiedLayoutSourceCommitMintResultInternalV1,
    { readonly status: "sealed" }
  >
}

interface LiveRecordInternalV1 {
  phase: "sealed" | "committing" | "consumed"
  readonly candidateWorkStep:
    VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1
  readonly sidecarStep:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1
  readonly sourceStep:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1
  readonly stageStep:
    VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1
  readonly finishStep:
    VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1
  readonly bundle: Readonly<{
    candidateWork: VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
    sidecar: VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
    source: VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
    stage: VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
  }>
  readonly candidateWorkPlanAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  readonly sidecarPlanAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  readonly sourcePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
  readonly stagePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
  readonly candidateWorkPublicationPreconditionAuthority:
    VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
  readonly sidecarRegistrationPreconditionAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  readonly candidateWorkMeter:
    VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly nextSidecarCandidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly sourcePathCopyCandidateAuthority:
    VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
}

interface SourceCommitFinishStepRecordInternalV1 {
  readonly ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
  readonly liveRecord: LiveRecordInternalV1
}

interface CandidateWorkCommitStepRecordInternalV1 {
  readonly consumerAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1
  readonly applyRecord: VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
  readonly nextStep: VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1
}

interface SourceSidecarCommitStepRecordInternalV1 {
  readonly consumerAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1
  readonly applyRecord: VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
  readonly nextStep: VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1
}

interface SourceCandidateCommitStepRecordInternalV1 {
  readonly consumerAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1
  readonly applyRecord: VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
  readonly nextStep: VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1
}

interface SourceStageCommitStepRecordInternalV1 {
  readonly consumerAuthority:
    VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1
  readonly applyRecord: VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
  readonly finishStep: VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1
}

const detachedRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  DetachedRecordInternalV1
>()
const liveRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  LiveRecordInternalV1
>()
const consumedTickets = new WeakSet<object>()
const candidateWorkCommitStepRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
  CandidateWorkCommitStepRecordInternalV1
>()
const sourceSidecarCommitStepRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  SourceSidecarCommitStepRecordInternalV1
>()
const sourceCandidateCommitStepRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
  SourceCandidateCommitStepRecordInternalV1
>()
const sourceStageCommitStepRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  SourceStageCommitStepRecordInternalV1
>()
const sourceCommitFinishStepRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
  SourceCommitFinishStepRecordInternalV1
>()
const candidateWorkPreconditionOwners = new WeakMap<object, object>()
const sidecarPreconditionOwners = new WeakMap<object, object>()
const activeCandidateWorkMeters = new WeakSet<object>()
const activeSidecarCandidates = new WeakSet<object>()
const activeSourceCandidates = new WeakSet<object>()
const activeAccessReservations = new WeakSet<object>()
const consumedCandidateWorkPreconditions = new WeakSet<object>()
const consumedSidecarPreconditions = new WeakSet<object>()
const abandonedPlans = new WeakSet<object>()
const consumedPlans = new WeakSet<object>()
const candidateWorkPlanAbandonments = new WeakMap<
  VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
>()
const sidecarPlanAbandonments = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
>()
const sourcePlanAbandonments = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
>()
const stagePlanAbandonments = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
>()
let mintFaultPointForTest:
  VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1 | null =
    null
const planBindings = new WeakMap<
  object,
  Readonly<{
    ticket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    slot: keyof Pick<
      DetachedRecordInternalV1,
      | "candidateWorkPlanAuthority"
      | "sidecarPlanAuthority"
      | "sourcePlanAuthority"
      | "stagePlanAuthority"
    >
  }>
>()
const applyRecordBindings = new WeakMap<
  object,
  Readonly<{
    ticket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    slot: "candidateWork" | "sidecar" | "source" | "stage"
  }>
>()

function frozenIdentity<T>(): T {
  return Object.freeze({}) as T
}

class MintFaultForTestInternalV1 extends Error {}

function failMintForTestInternalV1(
  point: VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1,
): void {
  if (mintFaultPointForTest === point) {
    throw new MintFaultForTestInternalV1(point)
  }
}

function rollbackMintInternalV1(input: Readonly<{
  installedMask: number
  candidateWorkPublicationPreconditionAuthority:
    VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
  sidecarRegistrationPreconditionAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  nextSidecarCandidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  sourcePathCopyCandidateAuthority:
    VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  candidateWorkStep: VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1
  sidecarStep: VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1
  sourceStep: VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1
  stageStep: VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1
  finishStep: VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1
}>): void {
  if ((input.installedMask & (1 << 7)) !== 0) {
    candidateWorkCommitStepRecords.delete(input.candidateWorkStep)
    sourceSidecarCommitStepRecords.delete(input.sidecarStep)
    sourceCandidateCommitStepRecords.delete(input.sourceStep)
    sourceStageCommitStepRecords.delete(input.stageStep)
    sourceCommitFinishStepRecords.delete(input.finishStep)
  }
  if ((input.installedMask & (1 << 6)) !== 0) {
    activeAccessReservations.delete(
      input.sidecarRegistrationPreconditionAuthority,
    )
  }
  if ((input.installedMask & (1 << 5)) !== 0) {
    activeSourceCandidates.delete(input.sourcePathCopyCandidateAuthority)
  }
  if ((input.installedMask & (1 << 4)) !== 0) {
    activeSidecarCandidates.delete(input.nextSidecarCandidateAuthority)
  }
  if ((input.installedMask & (1 << 3)) !== 0) {
    activeCandidateWorkMeters.delete(input.candidateWorkMeter)
  }
  if ((input.installedMask & (1 << 2)) !== 0) {
    sidecarPreconditionOwners.delete(
      input.sidecarRegistrationPreconditionAuthority,
    )
  }
  if ((input.installedMask & (1 << 1)) !== 0) {
    candidateWorkPreconditionOwners.delete(
      input.candidateWorkPublicationPreconditionAuthority,
    )
  }
}

function abandonDetachedInternalV1(
  ticket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  record: DetachedRecordInternalV1,
): VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1 {
  if (record.candidateWorkPlanAuthority !== null) {
    if (record.candidateWorkApplyRecord !== null) {
      applyRecordBindings.delete(record.candidateWorkApplyRecord)
    }
    candidateWorkPlanAbandonments.set(
      record.candidateWorkAbandonmentAuthority,
      record.candidateWorkPlanAuthority,
    )
    planBindings.delete(record.candidateWorkPlanAuthority)
    abandonedPlans.add(record.candidateWorkPlanAuthority)
  }
  if (record.sidecarPlanAuthority !== null) {
    if (record.sidecarApplyRecord !== null) {
      applyRecordBindings.delete(record.sidecarApplyRecord)
    }
    sidecarPlanAbandonments.set(
      record.sidecarAbandonmentAuthority,
      record.sidecarPlanAuthority,
    )
    planBindings.delete(record.sidecarPlanAuthority)
    abandonedPlans.add(record.sidecarPlanAuthority)
  }
  if (record.sourcePlanAuthority !== null) {
    if (record.sourceApplyRecord !== null) {
      applyRecordBindings.delete(record.sourceApplyRecord)
    }
    sourcePlanAbandonments.set(
      record.sourceAbandonmentAuthority,
      record.sourcePlanAuthority,
    )
    planBindings.delete(record.sourcePlanAuthority)
    abandonedPlans.add(record.sourcePlanAuthority)
  }
  if (record.stagePlanAuthority !== null) {
    if (record.stageApplyRecord !== null) {
      applyRecordBindings.delete(record.stageApplyRecord)
    }
    stagePlanAbandonments.set(
      record.stageAbandonmentAuthority,
      record.stagePlanAuthority,
    )
    planBindings.delete(record.stagePlanAuthority)
    abandonedPlans.add(record.stagePlanAuthority)
  }
  detachedRecords.delete(ticket)
  return record.abortBundle
}

export function createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
): VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1 {
  const ticket =
    frozenIdentity<VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1>()
  const candidateWorkAbandonmentAuthority =
    frozenIdentity<VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1>()
  const sidecarAbandonmentAuthority =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1>()
  const sourceAbandonmentAuthority =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1>()
  const stageAbandonmentAuthority =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1>()
  const abortBundle = Object.freeze({
    candidateWork: null,
    sidecar: null,
    source: null,
    stage: null,
  }) as VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1
  const sealedMintResult = Object.freeze({
    status: "sealed" as const,
    ticket: ticket as unknown as
      VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1,
  })
  detachedRecords.set(ticket, {
    phase: "preparing-detached",
    candidateWorkPlanAuthority: null,
    sidecarPlanAuthority: null,
    sourcePlanAuthority: null,
    stagePlanAuthority: null,
    candidateWorkPlanSealAuthority: null,
    sidecarPlanSealAuthority: null,
    sourcePlanSealAuthority: null,
    stagePlanSealAuthority: null,
    candidateWorkApplyRecord: null,
    sidecarApplyRecord: null,
    sourceApplyRecord: null,
    stageApplyRecord: null,
    candidateWorkStepConsumerAuthority: null,
    sidecarStepConsumerAuthority: null,
    sourceStepConsumerAuthority: null,
    stageStepConsumerAuthority: null,
    candidateWorkAbandonmentAuthority,
    sidecarAbandonmentAuthority,
    sourceAbandonmentAuthority,
    stageAbandonmentAuthority,
    abortBundle,
    abortedMintResult: Object.freeze({
      status: "aborted" as const,
      abort: abortBundle,
    }),
    sealedMintResult,
  })
  return ticket
}

export function abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  ticket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1 | null {
  const record = detachedRecords.get(ticket)
  if (
    record == null
    || (record.phase !== "preparing-detached" && record.phase !== "minting")
  ) return null
  return abandonDetachedInternalV1(ticket, record)
}

export function consumeVNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (
    candidateWorkPlanAbandonments.get(input.abandonmentAuthority)
      !== input.planAuthority
  ) {
    throw new Error("CandidateWork plan abandonment invariant violated")
  }
  candidateWorkPlanAbandonments.delete(input.abandonmentAuthority)
}

export function consumeVNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (
    sidecarPlanAbandonments.get(input.abandonmentAuthority)
      !== input.planAuthority
  ) {
    throw new Error("Source sidecar plan abandonment invariant violated")
  }
  sidecarPlanAbandonments.delete(input.abandonmentAuthority)
}

export function consumeVNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (
    sourcePlanAbandonments.get(input.abandonmentAuthority)
      !== input.planAuthority
  ) {
    throw new Error("Source candidate plan abandonment invariant violated")
  }
  sourcePlanAbandonments.delete(input.abandonmentAuthority)
}

export function consumeVNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (
    stagePlanAbandonments.get(input.abandonmentAuthority)
      !== input.planAuthority
  ) {
    throw new Error("Source stage plan abandonment invariant violated")
  }
  stagePlanAbandonments.delete(input.abandonmentAuthority)
}

export function attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
    applyRecord: VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1
  }>,
): boolean {
  const record = detachedRecords.get(input.detachedTicket)
  if (
    record?.phase !== "preparing-detached"
    || record.candidateWorkPlanAuthority !== null
    || planBindings.has(input.planAuthority)
    || abandonedPlans.has(input.planAuthority)
    || consumedPlans.has(input.planAuthority)
  ) return false
  const sealAuthority = input.sealAuthority
  const applyRecord = input.applyRecord
  const abortBundle = Object.freeze({
    ...record.abortBundle,
    candidateWork: Object.freeze({
      planAuthority: input.planAuthority,
      abandonmentAuthority: record.candidateWorkAbandonmentAuthority,
    }),
  })
  const abortedMintResult = Object.freeze({
    status: "aborted" as const,
    abort: abortBundle,
  })
  record.candidateWorkPlanAuthority = input.planAuthority
  record.candidateWorkPlanSealAuthority = sealAuthority
  record.candidateWorkApplyRecord = applyRecord
  record.candidateWorkStepConsumerAuthority = input.consumerAuthority
  record.abortBundle = abortBundle
  record.abortedMintResult = abortedMintResult
  planBindings.set(input.planAuthority, {
    ticket: input.detachedTicket,
    slot: "candidateWorkPlanAuthority",
  })
  applyRecordBindings.set(applyRecord, {
    ticket: input.detachedTicket,
    slot: "candidateWork",
  })
  return true
}

export function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
    applyRecord: VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1
  }>,
): boolean {
  const record = detachedRecords.get(input.detachedTicket)
  if (
    record?.phase !== "preparing-detached"
    || record.sidecarPlanAuthority !== null
    || planBindings.has(input.planAuthority)
    || abandonedPlans.has(input.planAuthority)
    || consumedPlans.has(input.planAuthority)
  ) return false
  const sealAuthority = input.sealAuthority
  const applyRecord = input.applyRecord
  const abortBundle = Object.freeze({
    ...record.abortBundle,
    sidecar: Object.freeze({
      planAuthority: input.planAuthority,
      abandonmentAuthority: record.sidecarAbandonmentAuthority,
    }),
  })
  const abortedMintResult = Object.freeze({
    status: "aborted" as const,
    abort: abortBundle,
  })
  record.sidecarPlanAuthority = input.planAuthority
  record.sidecarPlanSealAuthority = sealAuthority
  record.sidecarApplyRecord = applyRecord
  record.sidecarStepConsumerAuthority = input.consumerAuthority
  record.abortBundle = abortBundle
  record.abortedMintResult = abortedMintResult
  planBindings.set(input.planAuthority, {
    ticket: input.detachedTicket,
    slot: "sidecarPlanAuthority",
  })
  applyRecordBindings.set(applyRecord, {
    ticket: input.detachedTicket,
    slot: "sidecar",
  })
  return true
}

export function matchesVNextTextBlockUnifiedLayoutDetachedSourceCommitSidecarPlanInternalV1(
  input: Readonly<{
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly sidecarPlanAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  }>,
): boolean {
  const record = detachedRecords.get(input.detachedTicket)
  const binding = planBindings.get(input.sidecarPlanAuthority)
  return record?.phase === "preparing-detached"
    && record.sidecarPlanAuthority === input.sidecarPlanAuthority
    && binding?.ticket === input.detachedTicket
    && binding.slot === "sidecarPlanAuthority"
}

export function attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1
    applyRecord: VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1
  }>,
): boolean {
  const record = detachedRecords.get(input.detachedTicket)
  if (
    record?.phase !== "preparing-detached"
    || record.sourcePlanAuthority !== null
    || planBindings.has(input.planAuthority)
    || abandonedPlans.has(input.planAuthority)
    || consumedPlans.has(input.planAuthority)
  ) return false
  const sealAuthority = input.sealAuthority
  const applyRecord = input.applyRecord
  const abortBundle = Object.freeze({
    ...record.abortBundle,
    source: Object.freeze({
      planAuthority: input.planAuthority,
      abandonmentAuthority: record.sourceAbandonmentAuthority,
    }),
  })
  const abortedMintResult = Object.freeze({
    status: "aborted" as const,
    abort: abortBundle,
  })
  record.sourcePlanAuthority = input.planAuthority
  record.sourcePlanSealAuthority = sealAuthority
  record.sourceApplyRecord = applyRecord
  record.sourceStepConsumerAuthority = input.consumerAuthority
  record.abortBundle = abortBundle
  record.abortedMintResult = abortedMintResult
  planBindings.set(input.planAuthority, {
    ticket: input.detachedTicket,
    slot: "sourcePlanAuthority",
  })
  applyRecordBindings.set(applyRecord, {
    ticket: input.detachedTicket,
    slot: "source",
  })
  return true
}

export function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
    applyRecord: VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1
  }>,
): boolean {
  const record = detachedRecords.get(input.detachedTicket)
  if (
    record?.phase !== "preparing-detached"
    || record.stagePlanAuthority !== null
    || planBindings.has(input.planAuthority)
    || abandonedPlans.has(input.planAuthority)
    || consumedPlans.has(input.planAuthority)
  ) return false
  const sealAuthority = input.sealAuthority
  const applyRecord = input.applyRecord
  const abortBundle = Object.freeze({
    ...record.abortBundle,
    stage: Object.freeze({
      planAuthority: input.planAuthority,
      abandonmentAuthority: record.stageAbandonmentAuthority,
    }),
  })
  const abortedMintResult = Object.freeze({
    status: "aborted" as const,
    abort: abortBundle,
  })
  record.stagePlanAuthority = input.planAuthority
  record.stagePlanSealAuthority = sealAuthority
  record.stageApplyRecord = applyRecord
  record.stageStepConsumerAuthority = input.consumerAuthority
  record.abortBundle = abortBundle
  record.abortedMintResult = abortedMintResult
  planBindings.set(input.planAuthority, {
    ticket: input.detachedTicket,
    slot: "stagePlanAuthority",
  })
  applyRecordBindings.set(applyRecord, {
    ticket: input.detachedTicket,
    slot: "stage",
  })
  return true
}

export function mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    candidateWorkPlanAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    sidecarPlanAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    sourcePlanAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    stagePlanAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    candidateWorkPlanSealAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
    sidecarPlanSealAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
    sourcePlanSealAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1
    stagePlanSealAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1
    candidateWorkPublicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    sidecarRegistrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutSourceCommitMintResultInternalV1 | null {
  const record = detachedRecords.get(input.detachedTicket)
  if (record?.phase !== "preparing-detached") return null
  if (
    record.candidateWorkPlanAuthority !== input.candidateWorkPlanAuthority
    || record.sidecarPlanAuthority !== input.sidecarPlanAuthority
    || record.sourcePlanAuthority !== input.sourcePlanAuthority
    || record.stagePlanAuthority !== input.stagePlanAuthority
    || record.candidateWorkPlanSealAuthority
      !== input.candidateWorkPlanSealAuthority
    || record.sidecarPlanSealAuthority !== input.sidecarPlanSealAuthority
    || record.sourcePlanSealAuthority !== input.sourcePlanSealAuthority
    || record.stagePlanSealAuthority !== input.stagePlanSealAuthority
    || candidateWorkPreconditionOwners.has(
      input.candidateWorkPublicationPreconditionAuthority,
    )
    || sidecarPreconditionOwners.has(
      input.sidecarRegistrationPreconditionAuthority,
    )
    || consumedCandidateWorkPreconditions.has(
      input.candidateWorkPublicationPreconditionAuthority,
    )
    || consumedSidecarPreconditions.has(
      input.sidecarRegistrationPreconditionAuthority,
    )
    || activeCandidateWorkMeters.has(input.candidateWorkMeter)
    || activeSidecarCandidates.has(input.nextSidecarCandidateAuthority)
    || activeSourceCandidates.has(input.sourcePathCopyCandidateAuthority)
    || activeAccessReservations.has(
      input.sidecarRegistrationPreconditionAuthority,
    )
  ) {
    const abortedMintResult = record.abortedMintResult
    abandonDetachedInternalV1(input.detachedTicket, record)
    return abortedMintResult
  }

  if (
    record.candidateWorkPlanSealAuthority === null
    || record.sidecarPlanSealAuthority === null
    || record.sourcePlanSealAuthority === null
    || record.stagePlanSealAuthority === null
    || record.candidateWorkApplyRecord === null
    || record.sidecarApplyRecord === null
    || record.sourceApplyRecord === null
    || record.stageApplyRecord === null
    || record.candidateWorkStepConsumerAuthority === null
    || record.sidecarStepConsumerAuthority === null
    || record.sourceStepConsumerAuthority === null
    || record.stageStepConsumerAuthority === null
  ) {
    const abortedMintResult = record.abortedMintResult
    abandonDetachedInternalV1(input.detachedTicket, record)
    return abortedMintResult
  }
  const bundle = Object.freeze({
    candidateWork: record.candidateWorkApplyRecord,
    sidecar: record.sidecarApplyRecord,
    source: record.sourceApplyRecord,
    stage: record.stageApplyRecord,
  })
  const ticket = input.detachedTicket as unknown as
    VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
  const candidateWorkStep =
    frozenIdentity<VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1>()
  const sidecarStep =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1>()
  const sourceStep =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1>()
  const stageStep =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1>()
  const finishStep =
    frozenIdentity<VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1>()
  const liveRecord: LiveRecordInternalV1 = {
    phase: "sealed",
    candidateWorkStep,
    sidecarStep,
    sourceStep,
    stageStep,
    finishStep,
    bundle,
    candidateWorkPlanAuthority: input.candidateWorkPlanAuthority,
    sidecarPlanAuthority: input.sidecarPlanAuthority,
    sourcePlanAuthority: input.sourcePlanAuthority,
    stagePlanAuthority: input.stagePlanAuthority,
    candidateWorkPublicationPreconditionAuthority:
      input.candidateWorkPublicationPreconditionAuthority,
    sidecarRegistrationPreconditionAuthority:
      input.sidecarRegistrationPreconditionAuthority,
    candidateWorkMeter: input.candidateWorkMeter,
    nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
  }
  const candidateWorkStepRecord = Object.freeze({
    consumerAuthority: record.candidateWorkStepConsumerAuthority,
    applyRecord: record.candidateWorkApplyRecord,
    nextStep: sidecarStep,
  })
  const sidecarStepRecord = Object.freeze({
    consumerAuthority: record.sidecarStepConsumerAuthority,
    applyRecord: record.sidecarApplyRecord,
    nextStep: sourceStep,
  })
  const sourceStepRecord = Object.freeze({
    consumerAuthority: record.sourceStepConsumerAuthority,
    applyRecord: record.sourceApplyRecord,
    nextStep: stageStep,
  })
  const stageStepRecord = Object.freeze({
    consumerAuthority: record.stageStepConsumerAuthority,
    applyRecord: record.stageApplyRecord,
    finishStep,
  })
  const finishStepRecord = Object.freeze({ ticket, liveRecord })
  let installedMask = 0
  try {
    record.phase = "minting"
    installedMask |= 1 << 0
    failMintForTestInternalV1("after-detached-minting-state")
    candidateWorkPreconditionOwners.set(
      input.candidateWorkPublicationPreconditionAuthority,
      input.detachedTicket,
    )
    installedMask |= 1 << 1
    failMintForTestInternalV1("after-candidate-work-precondition-index")
    sidecarPreconditionOwners.set(
      input.sidecarRegistrationPreconditionAuthority,
      input.detachedTicket,
    )
    installedMask |= 1 << 2
    failMintForTestInternalV1("after-sidecar-precondition-index")
    activeCandidateWorkMeters.add(input.candidateWorkMeter)
    installedMask |= 1 << 3
    failMintForTestInternalV1("after-candidate-work-meter-index")
    activeSidecarCandidates.add(input.nextSidecarCandidateAuthority)
    installedMask |= 1 << 4
    failMintForTestInternalV1("after-sidecar-candidate-index")
    activeSourceCandidates.add(input.sourcePathCopyCandidateAuthority)
    installedMask |= 1 << 5
    failMintForTestInternalV1("after-source-candidate-index")
    activeAccessReservations.add(
      input.sidecarRegistrationPreconditionAuthority,
    )
    installedMask |= 1 << 6
    failMintForTestInternalV1("after-access-reservation-index")
    candidateWorkCommitStepRecords.set(
      candidateWorkStep,
      candidateWorkStepRecord,
    )
    sourceSidecarCommitStepRecords.set(sidecarStep, sidecarStepRecord)
    sourceCandidateCommitStepRecords.set(sourceStep, sourceStepRecord)
    sourceStageCommitStepRecords.set(stageStep, stageStepRecord)
    sourceCommitFinishStepRecords.set(finishStep, finishStepRecord)
    installedMask |= 1 << 7
    failMintForTestInternalV1("before-live-write")

    liveRecords.set(ticket, liveRecord)
    detachedRecords.delete(input.detachedTicket)
    return record.sealedMintResult
  } catch (error) {
    rollbackMintInternalV1({
      installedMask,
      candidateWorkPublicationPreconditionAuthority:
        input.candidateWorkPublicationPreconditionAuthority,
      sidecarRegistrationPreconditionAuthority:
        input.sidecarRegistrationPreconditionAuthority,
      candidateWorkMeter: input.candidateWorkMeter,
      nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
      sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
      candidateWorkStep,
      sidecarStep,
      sourceStep,
      stageStep,
      finishStep,
    })
    const abortedMintResult = record.abortedMintResult
    abandonDetachedInternalV1(input.detachedTicket, record)
    if (error instanceof MintFaultForTestInternalV1) return abortedMintResult
    throw error
  }
}

export function setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
  point:
    VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1 | null,
): void {
  if (point !== null && mintFaultPointForTest !== null) {
    throw new Error("Source commit mint fault configuration invariant violated")
  }
  mintFaultPointForTest = point
}

export function isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): boolean {
  return activeCandidateWorkMeters.has(meter)
}

export function isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
): boolean {
  return activeSidecarCandidates.has(authority)
}

export function isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(
  authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
): boolean {
  return activeSourceCandidates.has(authority)
}

export function isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
): boolean {
  return activeAccessReservations.has(authority)
}

export function beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1 {
  const record = liveRecords.get(ticket)
  const candidateStepRecord = record == null
    ? null
    : candidateWorkCommitStepRecords.get(record.candidateWorkStep)
  const sidecarStepRecord = record == null
    ? null
    : sourceSidecarCommitStepRecords.get(record.sidecarStep)
  const sourceStepRecord = record == null
    ? null
    : sourceCandidateCommitStepRecords.get(record.sourceStep)
  const stageStepRecord = record == null
    ? null
    : sourceStageCommitStepRecords.get(record.stageStep)
  const finishStepRecord = record == null
    ? null
    : sourceCommitFinishStepRecords.get(record.finishStep)
  const detachedTicket = ticket as unknown as
    VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
  if (
    record?.phase !== "sealed"
    || candidateStepRecord?.applyRecord !== record.bundle.candidateWork
    || candidateStepRecord.nextStep !== record.sidecarStep
    || sidecarStepRecord?.applyRecord !== record.bundle.sidecar
    || sidecarStepRecord.nextStep !== record.sourceStep
    || sourceStepRecord?.applyRecord !== record.bundle.source
    || sourceStepRecord.nextStep !== record.stageStep
    || stageStepRecord?.applyRecord !== record.bundle.stage
    || stageStepRecord.finishStep !== record.finishStep
    || finishStepRecord?.ticket !== ticket
    || finishStepRecord.liveRecord !== record
    || planBindings.get(record.candidateWorkPlanAuthority)?.slot
      !== "candidateWorkPlanAuthority"
    || planBindings.get(record.candidateWorkPlanAuthority)?.ticket !== detachedTicket
    || planBindings.get(record.sidecarPlanAuthority)?.slot
      !== "sidecarPlanAuthority"
    || planBindings.get(record.sidecarPlanAuthority)?.ticket !== detachedTicket
    || planBindings.get(record.sourcePlanAuthority)?.slot !== "sourcePlanAuthority"
    || planBindings.get(record.sourcePlanAuthority)?.ticket !== detachedTicket
    || planBindings.get(record.stagePlanAuthority)?.slot !== "stagePlanAuthority"
    || planBindings.get(record.stagePlanAuthority)?.ticket !== detachedTicket
    || applyRecordBindings.get(record.bundle.candidateWork)?.slot !== "candidateWork"
    || applyRecordBindings.get(record.bundle.candidateWork)?.ticket !== detachedTicket
    || applyRecordBindings.get(record.bundle.sidecar)?.slot !== "sidecar"
    || applyRecordBindings.get(record.bundle.sidecar)?.ticket !== detachedTicket
    || applyRecordBindings.get(record.bundle.source)?.slot !== "source"
    || applyRecordBindings.get(record.bundle.source)?.ticket !== detachedTicket
    || applyRecordBindings.get(record.bundle.stage)?.slot !== "stage"
    || applyRecordBindings.get(record.bundle.stage)?.ticket !== detachedTicket
    || candidateWorkPreconditionOwners.get(
      record.candidateWorkPublicationPreconditionAuthority,
    ) !== ticket
    || sidecarPreconditionOwners.get(
      record.sidecarRegistrationPreconditionAuthority,
    ) !== ticket
    || !activeCandidateWorkMeters.has(record.candidateWorkMeter)
    || !activeSidecarCandidates.has(record.nextSidecarCandidateAuthority)
    || !activeSourceCandidates.has(record.sourcePathCopyCandidateAuthority)
    || !activeAccessReservations.has(
      record.sidecarRegistrationPreconditionAuthority,
    )
  ) {
    throw new Error("Source commit ticket invariant violated")
  }
  record.phase = "committing"
  return record.candidateWorkStep
}

export function consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1(
  input: Readonly<{
    step: VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1
  }>,
): Readonly<{
  applyRecord: VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
  nextStep: VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1
}> {
  const record = candidateWorkCommitStepRecords.get(input.step)
  if (record?.consumerAuthority !== input.consumerAuthority) {
    throw new Error("CandidateWork commit step invariant violated")
  }
  candidateWorkCommitStepRecords.delete(input.step)
  return record
}

export function consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1(
  input: Readonly<{
    step: VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1
  }>,
): Readonly<{
  applyRecord: VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
  nextStep: VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1
}> {
  const record = sourceSidecarCommitStepRecords.get(input.step)
  if (record?.consumerAuthority !== input.consumerAuthority) {
    throw new Error("Source sidecar commit step invariant violated")
  }
  sourceSidecarCommitStepRecords.delete(input.step)
  return record
}

export function consumeVNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1(
  input: Readonly<{
    step: VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1
  }>,
): Readonly<{
  applyRecord: VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
  nextStep: VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1
}> {
  const record = sourceCandidateCommitStepRecords.get(input.step)
  if (record?.consumerAuthority !== input.consumerAuthority) {
    throw new Error("Source candidate commit step invariant violated")
  }
  sourceCandidateCommitStepRecords.delete(input.step)
  return record
}

export function consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1(
  input: Readonly<{
    step: VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1
    consumerAuthority:
      VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1
  }>,
): Readonly<{
  applyRecord: VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1
  finishStep: VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1
}> {
  const record = sourceStageCommitStepRecords.get(input.step)
  if (record?.consumerAuthority !== input.consumerAuthority) {
    throw new Error("Source stage commit step invariant violated")
  }
  sourceStageCommitStepRecords.delete(input.step)
  return record
}

export function inspectVNextTextBlockUnifiedLayoutSourceStageApplyRecordForTestInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1 | null {
  return liveRecords.get(ticket)?.bundle.stage ?? null
}

export function finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  finishStep: VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
): void {
  const finish = sourceCommitFinishStepRecords.get(finishStep)
  if (finish == null) {
    throw new Error("Source commit finish invariant violated")
  }
  const ticket = finish.ticket
  const record = finish.liveRecord
  if (
    record.phase !== "committing"
    || liveRecords.get(ticket) !== record
  ) {
    throw new Error("Source commit finish invariant violated")
  }
  sourceCommitFinishStepRecords.delete(finishStep)
  candidateWorkPreconditionOwners.delete(
    record.candidateWorkPublicationPreconditionAuthority,
  )
  sidecarPreconditionOwners.delete(
    record.sidecarRegistrationPreconditionAuthority,
  )
  activeCandidateWorkMeters.delete(record.candidateWorkMeter)
  activeSidecarCandidates.delete(record.nextSidecarCandidateAuthority)
  activeSourceCandidates.delete(record.sourcePathCopyCandidateAuthority)
  activeAccessReservations.delete(
    record.sidecarRegistrationPreconditionAuthority,
  )
  consumedCandidateWorkPreconditions.add(
    record.candidateWorkPublicationPreconditionAuthority,
  )
  consumedSidecarPreconditions.add(
    record.sidecarRegistrationPreconditionAuthority,
  )
  planBindings.delete(record.candidateWorkPlanAuthority)
  consumedPlans.add(record.candidateWorkPlanAuthority)
  planBindings.delete(record.sidecarPlanAuthority)
  consumedPlans.add(record.sidecarPlanAuthority)
  planBindings.delete(record.sourcePlanAuthority)
  consumedPlans.add(record.sourcePlanAuthority)
  planBindings.delete(record.stagePlanAuthority)
  consumedPlans.add(record.stagePlanAuthority)
  applyRecordBindings.delete(record.bundle.candidateWork)
  applyRecordBindings.delete(record.bundle.sidecar)
  applyRecordBindings.delete(record.bundle.source)
  applyRecordBindings.delete(record.bundle.stage)
  record.phase = "consumed"
  liveRecords.delete(ticket)
  consumedTickets.add(ticket)
}

export function isVNextTextBlockUnifiedLayoutSourceCommitPlanActivelyBoundForTestInternalV1(
  planAuthority: object,
): boolean {
  return isVNextTextBlockUnifiedLayoutSourceCommitPlanActivelyBoundInternalV1(
    planAuthority,
  )
}

export function isVNextTextBlockUnifiedLayoutSourceCommitPlanActivelyBoundInternalV1(
  planAuthority: object,
): boolean {
  return planBindings.has(planAuthority)
}

export function inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
  identity: unknown,
): Readonly<{
  phase:
    | "absent"
    | "preparing-detached"
    | "minting"
    | "sealed"
    | "committing"
    | "consumed"
  readonly attachedPlanCount: number
  readonly activeProtectionCount: number
}> {
  if (typeof identity !== "object" || identity === null) {
    return Object.freeze({
      phase: "absent",
      attachedPlanCount: 0,
      activeProtectionCount: 0,
    })
  }
  if (consumedTickets.has(identity)) {
    return Object.freeze({
      phase: "consumed",
      attachedPlanCount: 0,
      activeProtectionCount: 0,
    })
  }
  const live = liveRecords.get(
    identity as VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  )
  if (live != null) {
    return Object.freeze({
      phase: live.phase,
      attachedPlanCount: 4,
      activeProtectionCount: 4,
    })
  }
  const detached = detachedRecords.get(
    identity as VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  )
  if (detached != null) {
    return Object.freeze({
      phase: detached.phase,
      attachedPlanCount: [
        detached.candidateWorkPlanAuthority,
        detached.sidecarPlanAuthority,
        detached.sourcePlanAuthority,
        detached.stagePlanAuthority,
      ].filter((value) => value !== null).length,
      activeProtectionCount: 0,
    })
  }
  return Object.freeze({
    phase: "absent",
    attachedPlanCount: 0,
    activeProtectionCount: 0,
  })
}
