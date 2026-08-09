import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
} from "./textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
  VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
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

export interface VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 {
  readonly __sourceStageAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 {
  readonly __sourceStageCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1 {
  readonly __sourceStageSidecarPreconditionAuthorityOpaque: never
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

interface MutableCommitTicketRecord {
  readonly stageRecord: Omit<
    VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1,
    "candidateWorkAuthority"
  >
  readonly candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly nextSidecarCandidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly sourcePathCopyCandidateAuthority:
    VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  readonly producingStageAuthority: object
  readonly completedSourceEmissionCount: number
  readonly candidateWorkPublicationPreconditionAuthority: object
  readonly sidecarRegistrationPreconditionAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 | null
  sidecarsCommitted: boolean
  consumed: boolean
}

const stageAuthorityRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1,
  VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1
>()
const preparedStageRecords = new WeakSet<object>()
const commitTicketRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  MutableCommitTicketRecord
>()
const candidateWorkPreconditionRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
  Readonly<{
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly completedSourceEmissionCount: number
    readonly producingStageAuthority: object
  }>
>()
const sidecarPreconditionRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
  Readonly<{
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  }>
>()
const consumedCandidateWorkPreconditions = new WeakSet<object>()
const consumedSidecarPreconditions = new WeakSet<object>()
const reservedCandidateWorkMeters = new WeakSet<object>()
const reservedSidecarCandidates = new WeakSet<object>()
const reservedSourceCandidates = new WeakSet<object>()
const committedSourceCandidates = new WeakSet<object>()
let commitTicketObserverForTestInternalV1: ((input: Readonly<{
  readonly ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}>) => void) | null = null

export function setVNextTextBlockUnifiedLayoutSourceStageCommitTicketObserverForTestInternalV1(
  observer: typeof commitTicketObserverForTestInternalV1,
): void {
  commitTicketObserverForTestInternalV1 = observer
}

/** Exact task-specific registration called only by CandidateWorkAuthority. */
export function registerVNextTextBlockUnifiedLayoutSourceStageCandidateWorkPreconditionInternalV1(
  input: {
    readonly authority: VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly completedSourceEmissionCount: number
    readonly producingStageAuthority: object
  },
): boolean {
  if (
    input.authority == null
    || typeof input.authority !== "object"
    || candidateWorkPreconditionRecords.has(input.authority)
    || !Number.isSafeInteger(input.completedSourceEmissionCount)
    || input.completedSourceEmissionCount < 0
  ) return false
  candidateWorkPreconditionRecords.set(input.authority, Object.freeze({
    meter: input.meter,
    nextCandidateWork: input.nextCandidateWork,
    completedSourceEmissionCount: input.completedSourceEmissionCount,
    producingStageAuthority: input.producingStageAuthority,
  }))
  return true
}

/** Exact task-specific registration called only by SourceSidecars. */
export function registerVNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionInternalV1(
  input: {
    readonly authority: VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  },
): boolean {
  if (
    input.authority == null
    || typeof input.authority !== "object"
    || sidecarPreconditionRecords.has(input.authority)
  ) return false
  sidecarPreconditionRecords.set(input.authority, Object.freeze({
    previousRoot: input.previousRoot,
    composition: input.composition,
    previousSidecars: input.previousSidecars,
    nextSourceState: input.nextSourceState,
    nextSidecars: input.nextSidecars,
    candidateAuthority: input.candidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
    workMeter: input.workMeter,
  }))
  return true
}

export function isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateAbortProtectedInternalV1(
  authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
): boolean {
  return reservedSourceCandidates.has(authority)
    || committedSourceCandidates.has(authority)
}

export function isVNextTextBlockUnifiedLayoutSourceStageSidecarCandidateAbortProtectedInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
): boolean {
  return reservedSidecarCandidates.has(authority)
}

export function isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateCommittedInternalV1(
  authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
): boolean {
  return committedSourceCandidates.has(authority)
}
const structuralTargetAuthorities = new WeakMap<object, {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sourceStageAuthority: VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 | null
}>()
const sourceLayoutDeltaAuthorities = new WeakMap<object, {
  readonly structuralTargetAuthority: VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}>()

export function createVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1(
  input: VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 | null {
  if (!preparedStageRecords.delete(input)) return null
  const authority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  stageAuthorityRecords.set(authority, input)
  return authority
}

export function prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly nextSidecarCandidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly producingStageAuthority: object
    readonly completedSourceEmissionCount: number
    readonly candidateWorkPublicationPreconditionAuthority: object
    readonly sidecarRegistrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  },
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null {
  const candidateWorkPrecondition = candidateWorkPreconditionRecords.get(
    input.candidateWorkPublicationPreconditionAuthority as
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
  )
  const sidecarPrecondition = sidecarPreconditionRecords.get(
    input.sidecarRegistrationPreconditionAuthority,
  )
  if (
    input.previousSidecars.sourceState !== input.previousSourceState
    || input.nextSidecars.sourceState !== input.nextSourceState
    || input.packingPolicy !== input.previousSourceState.policy
    || input.preflight.change == null
    || (input.evidence ?? input.preflight) !== input.producingStageAuthority
    || !Number.isSafeInteger(input.completedSourceEmissionCount)
    || input.completedSourceEmissionCount < 0
    || input.producingStageAuthority == null
    || typeof input.producingStageAuthority !== "object"
    || input.candidateWorkPublicationPreconditionAuthority == null
    || typeof input.candidateWorkPublicationPreconditionAuthority !== "object"
    || candidateWorkPrecondition == null
    || candidateWorkPrecondition.meter !== input.candidateWorkMeter
    || candidateWorkPrecondition.nextCandidateWork !== input.nextCandidateWork
    || candidateWorkPrecondition.completedSourceEmissionCount
      !== input.completedSourceEmissionCount
    || candidateWorkPrecondition.producingStageAuthority
      !== input.producingStageAuthority
    || consumedCandidateWorkPreconditions.has(
      input.candidateWorkPublicationPreconditionAuthority,
    )
    || sidecarPrecondition == null
    || sidecarPrecondition.previousRoot !== input.previousRoot
    || sidecarPrecondition.composition !== input.composition
    || sidecarPrecondition.previousSidecars !== input.previousSidecars
    || sidecarPrecondition.nextSourceState !== input.nextSourceState
    || sidecarPrecondition.nextSidecars !== input.nextSidecars
    || sidecarPrecondition.candidateAuthority
      !== input.nextSidecarCandidateAuthority
    || sidecarPrecondition.sourcePathCopyCandidateAuthority
      !== input.sourcePathCopyCandidateAuthority
    || sidecarPrecondition.workMeter !== input.candidateWorkMeter
    || consumedSidecarPreconditions.has(
      input.sidecarRegistrationPreconditionAuthority,
    )
    || reservedCandidateWorkMeters.has(input.candidateWorkMeter)
    || reservedSidecarCandidates.has(input.nextSidecarCandidateAuthority)
    || reservedSourceCandidates.has(input.sourcePathCopyCandidateAuthority)
  ) return null
  const stageRecord = Object.freeze({
    previousRoot: input.previousRoot,
    previousSourceState: input.previousSourceState,
    preflight: input.preflight,
    evidence: input.evidence,
    composition: input.composition,
    packingPolicy: input.packingPolicy,
    previousSidecars: input.previousSidecars,
    nextSourceState: input.nextSourceState,
    nextSidecars: input.nextSidecars,
    completedCandidateWork: input.nextCandidateWork,
  })
  const ticket = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
  consumedCandidateWorkPreconditions.add(
    input.candidateWorkPublicationPreconditionAuthority,
  )
  consumedSidecarPreconditions.add(
    input.sidecarRegistrationPreconditionAuthority,
  )
  reservedCandidateWorkMeters.add(input.candidateWorkMeter)
  reservedSidecarCandidates.add(input.nextSidecarCandidateAuthority)
  reservedSourceCandidates.add(input.sourcePathCopyCandidateAuthority)
  commitTicketRecords.set(ticket, {
    stageRecord,
    candidateWorkMeter: input.candidateWorkMeter,
    nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
    producingStageAuthority: input.producingStageAuthority,
    completedSourceEmissionCount: input.completedSourceEmissionCount,
    candidateWorkPublicationPreconditionAuthority:
      input.candidateWorkPublicationPreconditionAuthority,
    sidecarRegistrationPreconditionAuthority:
      input.sidecarRegistrationPreconditionAuthority,
    candidateWorkAuthority: null,
    sidecarsCommitted: false,
    consumed: false,
  })
  commitTicketObserverForTestInternalV1?.(Object.freeze({
    ticket,
    meter: input.candidateWorkMeter,
    previousRoot: input.previousRoot,
    change: input.preflight.change,
    composition: input.composition,
    nextCandidateWork: input.nextCandidateWork,
  }))
  return ticket
}

/** Narrow runtime seam consumed by CandidateWorkAuthority. */
export function resolveVNextTextBlockUnifiedLayoutSourceStageCommitTicketForCandidateWorkInternalV1(
  input: {
    readonly ticket: unknown
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  },
): Readonly<{
  readonly completedSourceEmissionCount: number
  readonly candidateWorkPublicationPreconditionAuthority: object
}> | null {
  const ticket = input.ticket != null && typeof input.ticket === "object"
    ? commitTicketRecords.get(
      input.ticket as VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
    )
    : null
  return ticket != null
      && !ticket.consumed
      && ticket.candidateWorkAuthority == null
      && ticket.candidateWorkMeter === input.meter
      && ticket.stageRecord.previousRoot === input.previousRoot
      && ticket.stageRecord.preflight.change === input.change
      && ticket.stageRecord.composition === input.composition
      && ticket.stageRecord.completedCandidateWork === input.nextCandidateWork
    ? Object.freeze({
        completedSourceEmissionCount: ticket.completedSourceEmissionCount,
        candidateWorkPublicationPreconditionAuthority:
          ticket.candidateWorkPublicationPreconditionAuthority,
      })
    : null
}

export function bindVNextTextBlockUnifiedLayoutSourceStageCommitCandidateWorkInternalV1(
  input: {
    readonly ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
    readonly candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  },
): void {
  const ticket = commitTicketRecords.get(input.ticket)
  if (ticket == null || ticket.consumed || ticket.candidateWorkAuthority != null) {
    throw new Error("Source commit ticket candidate-work invariant violated")
  }
  ticket.candidateWorkAuthority = input.candidateWorkAuthority
}

export function matchesVNextTextBlockUnifiedLayoutSourceStageCommitSidecarCandidateInternalV1(
  input: {
    readonly ticket: unknown
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSidecarCandidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly committed: boolean
  },
): boolean {
  const ticket = input.ticket != null && typeof input.ticket === "object"
    ? commitTicketRecords.get(
      input.ticket as VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
    )
    : null
  return ticket != null
    && ticket.sidecarsCommitted === input.committed
    && ticket.stageRecord.previousRoot === input.previousRoot
    && ticket.stageRecord.previousSidecars === input.previousSidecars
    && ticket.stageRecord.nextSourceState === input.nextSourceState
    && ticket.stageRecord.nextSidecars === input.nextSidecars
    && ticket.nextSidecarCandidateAuthority === input.nextSidecarCandidateAuthority
}

export function bindVNextTextBlockUnifiedLayoutSourceStageCommitSidecarsInternalV1(
  ticketAuthority: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): void {
  const ticket = commitTicketRecords.get(ticketAuthority)
  if (ticket == null || ticket.consumed || ticket.sidecarsCommitted) {
    throw new Error("Source commit ticket sidecar invariant violated")
  }
  ticket.sidecarsCommitted = true
}

export function commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(
  ticketAuthority: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): Readonly<{
  readonly sourceStageAuthority: VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  readonly candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly structuralTargetAuthority: VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  readonly sourceLayoutDeltaAuthority: VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null
}> {
  const ticket = commitTicketRecords.get(ticketAuthority)
  if (
    ticket == null
    || ticket.consumed
    || ticket.candidateWorkAuthority == null
    || !ticket.sidecarsCommitted
  ) throw new Error("Source commit ticket was not fully prepared")
  const record = Object.freeze({
    ...ticket.stageRecord,
    candidateWorkAuthority: ticket.candidateWorkAuthority,
  })
  preparedStageRecords.add(record)
  const sourceStageAuthority =
    createVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1(record)
  if (sourceStageAuthority == null) {
    throw new Error("Source stage authority commit invariant violated")
  }
  const structuralTargetAuthority = Object.freeze({}) as
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  structuralTargetAuthorities.set(structuralTargetAuthority, Object.freeze({
    previousSourceState: record.previousSourceState,
    nextSourceState: record.nextSourceState,
    sourceStageAuthority,
  }))
  let sourceLayoutDeltaAuthority:
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null = null
  if (record.preflight.boundedDelta.layoutEqual) {
    sourceLayoutDeltaAuthority = Object.freeze({}) as
      VNextTextBlockSourceLayoutDeltaAuthorityInternalV1
    sourceLayoutDeltaAuthorities.set(sourceLayoutDeltaAuthority, Object.freeze({
      structuralTargetAuthority,
    }))
  }
  ticket.consumed = true
  committedSourceCandidates.add(ticket.sourcePathCopyCandidateAuthority)
  return Object.freeze({
    sourceStageAuthority,
    candidateWorkAuthority: ticket.candidateWorkAuthority,
    structuralTargetAuthority,
    sourceLayoutDeltaAuthority,
  })
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
