import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import {
  getVNextTextBlockUnifiedLayoutAcceptedEvidenceCandidateOwnerRecordInternalV2,
} from "./textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2,
} from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
  type VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1,
} from "./textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1,
  type VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
  type VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  consumeVNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentInternalV1,
  consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
  attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
} from "./textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"

const CANDIDATE_WORK_STEP_CONSUMER_AUTHORITY_INTERNAL_V1 = Object.freeze({}) as
  VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1

export interface VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1 {
  readonly ownerRow: VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1
  readonly attemptedWork: number
  readonly completedWork: number
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 {
  readonly __candidateWorkAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 {
  readonly __workPermitOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 {
  readonly __candidateWorkMeterOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1 {
  readonly __receiptSnapshotAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1 {
  readonly __sourcePublicationPreconditionAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1 {
  readonly planAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  readonly candidateWorkAuthority:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly sealAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly producingInputAuthority: object
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly receipts: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[]
  readonly producingStageAuthority: object
}

interface MutableReceipt {
  readonly ownerRow: VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1
  attemptedWork: number
  completedWork: number
}

interface MeterRecord {
  readonly authority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly seed: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1
  readonly receipts: MutableReceipt[]
  readonly receiptsByUnit: Map<string, MutableReceipt>
  readonly openPermits: Set<VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1>
  revision: number
  projectedRevision: number
  projectedWork: VNextTextBlockIncrementalCandidateWorkV1 | null
  failed: boolean
  published: boolean
}

interface PermitRecord {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly receipt: MutableReceipt
  completed: boolean
}

const authorityRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1
>()
const authoritiesByCandidate = new WeakMap<
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
>()
const openedAuthorities = new WeakSet<
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
>()
const meterRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  MeterRecord
>()
const receiptSnapshotRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1,
  Readonly<{
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly revision: number
    readonly receipts: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[]
  }>
>()
const permitRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
  PermitRecord
>()
const sourcePublicationPreconditionRecords = new WeakMap<
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
  Readonly<{
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly completedSourceEmissionCount: number
    readonly producingStageAuthority: object
  }>
>()
type CandidateWorkPublicationPlanRecordInternalV1 = Readonly<{
    readonly planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    readonly publicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly authority:
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
    readonly authorityRecord:
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly sealAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
    readonly meterRecord: MeterRecord
  }>
const candidateWorkPublicationPlanRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
  CandidateWorkPublicationPlanRecordInternalV1
>()
let candidateRegistrationObserverForTestInternalV1: ((input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly producingStageAuthority: object
}) => boolean) | null = null

export function setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
  observer: ((input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly producingStageAuthority: object
  }) => boolean) | null,
): void {
  candidateRegistrationObserverForTestInternalV1 = observer
}

const evaluatorRecords = new WeakMap<object, Readonly<{
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1
  readonly attemptedWork: number
  readonly completedWork: number
  readonly effectiveLimit: number
}>>()

function exactComposition(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
}): boolean {
  return resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
    input.previousRoot,
  ) === input.composition
}

function receiptsEqual(
  left: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[],
  right: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[],
): boolean {
  return left.length === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1.length
    && right.length === left.length
    && left.every((receipt, index) => {
      const expected = right[index]
      return expected != null
        && receipt.ownerRow === expected.ownerRow
        && receipt.ownerRow
          === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1[index]
        && Number.isSafeInteger(receipt.attemptedWork)
        && Number.isSafeInteger(receipt.completedWork)
        && receipt.attemptedWork >= 0
        && receipt.completedWork >= 0
        && receipt.completedWork <= receipt.attemptedWork
        && receipt.attemptedWork === expected.attemptedWork
        && receipt.completedWork === expected.completedWork
    })
}

function cloneReceipts(
  receipts: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[],
): readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[] {
  return Object.freeze(receipts.map((receipt) => Object.freeze({
    ownerRow: receipt.ownerRow,
    attemptedWork: receipt.attemptedWork,
    completedWork: receipt.completedWork,
  })))
}

function producingOwnerRecord(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly producingStageAuthority: object
}): { readonly receipts: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[] } | null {
  const preflight = getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
    preflight: input.producingStageAuthority,
    previousRoot: input.previousRoot,
  })
  if (
    preflight != null
    && preflight.change === input.change
    && preflight.completedCandidateWork === input.candidateWork
    && preflight.foundationReceipts != null
    && preflight.request === null
    && preflight.sourceMaterial === null
  ) return { receipts: preflight.foundationReceipts }
  const evidence =
    getVNextTextBlockUnifiedLayoutAcceptedEvidenceCandidateOwnerRecordInternalV2(
      input.producingStageAuthority,
    )
  return evidence != null
      && evidence.previousRoot === input.previousRoot
      && evidence.change === input.change
      && evidence.completedCandidateWork === input.candidateWork
    ? { receipts: evidence.foundationReceipts }
    : null
}

export function registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly receipts: readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[]
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 | null {
  if (
    input == null
    || typeof input !== "object"
    || input.previousRoot == null
    || input.change == null
    || input.candidateWork == null
    || input.producingStageAuthority == null
    || typeof input.producingStageAuthority !== "object"
    || !exactComposition(input)
    || authoritiesByCandidate.has(input.candidateWork)
  ) return null
  const owner = producingOwnerRecord(input)
  if (owner == null || !receiptsEqual(input.receipts, owner.receipts)) return null
  if (candidateRegistrationObserverForTestInternalV1?.(input) === false) return null
  const receipts = cloneReceipts(owner.receipts)
  const record = Object.freeze({
    previousRoot: input.previousRoot,
    change: input.change,
    composition: input.composition,
    candidateWork: input.candidateWork,
    receipts,
    producingStageAuthority: input.producingStageAuthority,
  })
  const authority = record as unknown as
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  authorityRecords.set(authority, record)
  authoritiesByCandidate.set(input.candidateWork, authority)
  return authority
}

export function openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 | null {
  const record = authorityRecords.get(input.candidateWorkAuthority)
  if (
    record == null
    || record.previousRoot !== input.previousRoot
    || record.change !== input.change
    || record.composition !== input.composition
    || record.candidateWork !== input.candidateWork
    || !exactComposition(input)
    || openedAuthorities.has(input.candidateWorkAuthority)
  ) return null
  const receipts: MutableReceipt[] = record.receipts.map((receipt) => ({
    ownerRow: receipt.ownerRow,
    attemptedWork: receipt.attemptedWork,
    completedWork: receipt.completedWork,
  }))
  const meter = Object.freeze({}) as VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  meterRecords.set(meter, {
    authority: input.candidateWorkAuthority,
    seed: record,
    receipts,
    receiptsByUnit: new Map(receipts.map((receipt) => [receipt.ownerRow.unit, receipt])),
    openPermits: new Set(),
    revision: 0,
    projectedRevision: -1,
    projectedWork: null,
    failed: false,
    published: false,
  })
  openedAuthorities.add(input.candidateWorkAuthority)
  return meter
}

export function matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1(
  input: {
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  },
): boolean {
  const meter = meterRecords.get(input.meter)
  return meter != null
    && !meter.failed
    && !meter.published
    && meter.openPermits.size === 0
    && meter.seed.previousRoot === input.previousRoot
    && meter.seed.change === input.change
    && meter.seed.composition === input.composition
    && exactComposition(input)
}

export function captureVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1(
  meterAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1 | null {
  const meter = meterRecords.get(meterAuthority)
  if (
    meter == null
    || meter.failed
    || meter.published
    || meter.openPermits.size !== 0
  ) return null
  const snapshotAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1
  receiptSnapshotRecords.set(snapshotAuthority, Object.freeze({
    meter: meterAuthority,
    revision: meter.revision,
    receipts: cloneReceipts(meter.receipts),
  }))
  return snapshotAuthority
}

export function matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1(
  input: {
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly snapshotAuthority:
      VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1
  },
): boolean {
  const meter = meterRecords.get(input.meter)
  const snapshot = receiptSnapshotRecords.get(input.snapshotAuthority)
  return meter != null
    && snapshot != null
    && snapshot.meter === input.meter
    && !meter.failed
    && !meter.published
    && meter.openPermits.size === 0
    && meter.revision === snapshot.revision
    && receiptsEqual(meter.receipts, snapshot.receipts)
}

export function beginVNextTextBlockUnifiedLayout5B2OperationInternalV1(input: {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1
}):
  | { readonly status: "permitted"; readonly permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 }
  | { readonly status: "limit-exceeded"; readonly evaluatorAuthority: object }
  | { readonly status: "blocked" } {
  const meter = meterRecords.get(input.meter)
  if (meter == null || meter.failed || meter.published) return { status: "blocked" }
  const row = meter.seed.composition.rows.find((candidate) =>
    candidate.ownerRow.unit === input.unit)
  const receipt = meter.receiptsByUnit.get(input.unit)
  if (
    row == null
    || receipt == null
    || row.ownerRow !== receipt.ownerRow
    || row.ownerRow.stage !== "source"
    || row.execution.kind !== "test-active"
  ) return { status: "blocked" }
  receipt.attemptedWork += 1
  if (receipt.attemptedWork > row.execution.limit) {
    meter.failed = true
    const evaluatorAuthority = Object.freeze({})
    evaluatorRecords.set(evaluatorAuthority, Object.freeze({
      meter: input.meter,
      unit: input.unit,
      attemptedWork: receipt.attemptedWork,
      completedWork: receipt.completedWork,
      effectiveLimit: row.execution.limit,
    }))
    return { status: "limit-exceeded", evaluatorAuthority }
  }
  const permit = Object.freeze({}) as VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1
  permitRecords.set(permit, { meter: input.meter, receipt, completed: false })
  meter.openPermits.add(permit)
  return { status: "permitted", permit }
}

export function completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
  permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
): boolean {
  const record = permitRecords.get(permit)
  if (record == null || record.completed) return false
  const meter = meterRecords.get(record.meter)
  if (meter == null || !meter.openPermits.delete(permit)) return false
  record.completed = true
  record.receipt.completedWork += 1
  meter.revision += 1
  meter.projectedRevision = -1
  meter.projectedWork = null
  return true
}

const compatibilityUnits = Object.freeze({
  "source-items": "source-items",
  "source-tree-lookup-nodes": "source-lookup-nodes",
  "source-tree-path-copy-nodes": "source-path-copy-nodes",
  "source-leaf-slots": "source-leaf-items",
} as const)

export function projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockIncrementalCandidateWorkV1 | null {
  const record = meterRecords.get(meter)
  if (record == null || record.published) return null
  if (
    record.projectedWork != null
    && record.projectedRevision === record.revision
  ) return record.projectedWork
  const completed = (unit: string): number =>
    record.receiptsByUnit.get(unit)?.completedWork ?? 0
  const sourceItems = completed("source-items")
  const lookupNodes = completed("source-tree-lookup-nodes")
  const pathCopyNodes = completed("source-tree-path-copy-nodes")
  const leafSlots = completed("source-leaf-slots")
  const base = record.seed.candidateWork
  record.projectedWork = Object.freeze({
    ...base,
    flow: Object.freeze({
      ...base.flow,
      visitedSourceItemCount: sourceItems,
      visitedSourceLookupNodeCount: lookupNodes,
      copiedSourcePathNodeCount: pathCopyNodes,
      visitedChangedSourceLeafItemCount: leafSlots,
    }),
    stageWork: Object.freeze(base.stageWork.map((row) => {
      if (row.stage !== "source-flow") return row
      const entry = Object.entries(compatibilityUnits).find(([, legacy]) =>
        legacy === row.unit)
      return entry == null ? row : Object.freeze({
        ...row,
        count: completed(entry[0]),
      })
    })),
  })
  record.projectedRevision = record.revision
  return record.projectedWork
}

export function prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1(
  input: {
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly completedSourceEmissionCount: number
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1 | null {
  const meter = meterRecords.get(input.meter)
  const projected = meter == null
    ? null
    : projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      input.meter,
    )
  const sourceItems = meter?.receiptsByUnit.get("source-items")?.completedWork
    ?? -1
  if (
    meter == null
    || meter.failed
    || meter.published
    || meter.openPermits.size !== 0
    || projected == null
    || projected !== input.nextCandidateWork
    || !Number.isSafeInteger(input.completedSourceEmissionCount)
    || input.completedSourceEmissionCount < 0
    || sourceItems !== input.completedSourceEmissionCount
    || projected.flow.visitedSourceItemCount !== sourceItems
    || input.producingStageAuthority !== meter.seed.producingStageAuthority
    || authoritiesByCandidate.has(input.nextCandidateWork)
    || candidateRegistrationObserverForTestInternalV1?.({
      previousRoot: meter.seed.previousRoot,
      change: meter.seed.change,
      candidateWork: input.nextCandidateWork,
      producingStageAuthority: input.producingStageAuthority,
    }) === false
  ) return null
  const authority = Object.freeze({}) as
    VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
  sourcePublicationPreconditionRecords.set(authority, Object.freeze({
    meter: input.meter,
    nextCandidateWork: input.nextCandidateWork,
    completedSourceEmissionCount: input.completedSourceEmissionCount,
    producingStageAuthority: input.producingStageAuthority,
  }))
  return authority
}

export function prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    publicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    completedSourceEmissionCount: number
  }>,
): VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1 | null {
  const meter = meterRecords.get(input.candidateWorkMeter)
  const precondition = sourcePublicationPreconditionRecords.get(
    input.publicationPreconditionAuthority,
  )
  if (
    meter == null
    || precondition == null
    || meter.failed
    || meter.published
    || meter.openPermits.size !== 0
    || precondition.meter !== input.candidateWorkMeter
    || precondition.nextCandidateWork !== input.nextCandidateWork
    || precondition.completedSourceEmissionCount
      !== input.completedSourceEmissionCount
    || precondition.producingStageAuthority
      !== meter.seed.producingStageAuthority
    || !Number.isSafeInteger(input.completedSourceEmissionCount)
    || input.completedSourceEmissionCount < 0
    || authoritiesByCandidate.has(input.nextCandidateWork)
  ) return null
  const projected =
    projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      input.candidateWorkMeter,
    )
  const sourceItems =
    meter.receiptsByUnit.get("source-items")?.completedWork ?? -1
  if (
    projected == null
    || projected !== input.nextCandidateWork
    || sourceItems !== input.completedSourceEmissionCount
    || projected.flow.visitedSourceItemCount !== sourceItems
    || projected.flow.visitedSourceLookupNodeCount
      !== (meter.receiptsByUnit.get("source-tree-lookup-nodes")?.completedWork ?? 0)
    || projected.flow.copiedSourcePathNodeCount
      !== (meter.receiptsByUnit.get("source-tree-path-copy-nodes")?.completedWork ?? 0)
    || projected.flow.visitedChangedSourceLeafItemCount
      !== (meter.receiptsByUnit.get("source-leaf-slots")?.completedWork ?? 0)
    || candidateRegistrationObserverForTestInternalV1?.({
      previousRoot: meter.seed.previousRoot,
      change: meter.seed.change,
      candidateWork: input.nextCandidateWork,
      producingStageAuthority: input.detachedTicket,
    }) === false
  ) return null

  const authorityRecord = Object.freeze({
    previousRoot: meter.seed.previousRoot,
    change: meter.seed.change,
    composition: meter.seed.composition,
    candidateWork: input.nextCandidateWork,
    receipts: cloneReceipts(meter.receipts),
    producingStageAuthority: input.detachedTicket,
  })
  const authority = authorityRecord as unknown as
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  const planAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  const sealAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
  const planRecord = Object.freeze({
    planAuthority,
    publicationPreconditionAuthority: input.publicationPreconditionAuthority,
    meter: input.candidateWorkMeter,
    nextCandidateWork: input.nextCandidateWork,
    authority,
    authorityRecord,
    detachedTicket: input.detachedTicket,
    sealAuthority,
    meterRecord: meter,
  }) as CandidateWorkPublicationPlanRecordInternalV1
  const applyRecord = planRecord as unknown as
    VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
  const prepared = Object.freeze({
    planAuthority,
    candidateWorkAuthority: authority,
    sealAuthority,
    completedCandidateWork: input.nextCandidateWork,
    previousRoot: meter.seed.previousRoot,
    change: meter.seed.change,
    composition: meter.seed.composition,
    producingInputAuthority: meter.seed.producingStageAuthority,
  })
  candidateWorkPublicationPlanRecords.set(planAuthority, planRecord)
  if (!attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
    detachedTicket: input.detachedTicket,
    planAuthority,
    sealAuthority,
    applyRecord,
    consumerAuthority: CANDIDATE_WORK_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
  })) {
    candidateWorkPublicationPlanRecords.delete(planAuthority)
    return null
  }
  return prepared
}

export function matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1
    plannedOutput:
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  }>,
): boolean {
  const plan = candidateWorkPublicationPlanRecords.get(input.planAuthority)
  return plan != null
    && plan.detachedTicket === input.detachedTicket
    && plan.sealAuthority === input.sealAuthority
    && plan.authority === input.plannedOutput
}

export function abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (!candidateWorkPublicationPlanRecords.has(input.planAuthority)) {
    throw new Error("CandidateWork publication plan abandonment invariant violated")
  }
  consumeVNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentInternalV1(input)
  candidateWorkPublicationPlanRecords.delete(input.planAuthority)
}

export function applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  step: VNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
): VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1 {
  const { applyRecord, nextStep } =
    consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1({
      step,
      consumerAuthority: CANDIDATE_WORK_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
    })
  const plan = applyRecord as unknown as
    CandidateWorkPublicationPlanRecordInternalV1
  const meter = plan.meterRecord
  authorityRecords.set(plan.authority, plan.authorityRecord)
  authoritiesByCandidate.set(plan.nextCandidateWork, plan.authority)
  meter.published = true
  sourcePublicationPreconditionRecords.delete(
    plan.publicationPreconditionAuthority,
  )
  candidateWorkPublicationPlanRecords.delete(plan.planAuthority)
  return nextStep
}

export function hasVNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionRecordForTestInternalV1(
  authority:
    VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
): boolean {
  return sourcePublicationPreconditionRecords.has(authority)
}

export function publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1(
  input: {
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 | null {
  const meter = meterRecords.get(input.meter)
  if (
    meter == null
    || meter.failed
    || meter.published
    || meter.openPermits.size !== 0
  ) return null
  const projected = projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
    input.meter,
  )
  if (
    projected == null
    || input.nextCandidateWork !== projected
    || projected.flow.visitedSourceLookupNodeCount
      !== (meter.receiptsByUnit.get("source-tree-lookup-nodes")?.completedWork ?? 0)
    || projected.flow.copiedSourcePathNodeCount
      !== (meter.receiptsByUnit.get("source-tree-path-copy-nodes")?.completedWork ?? 0)
    || projected.flow.visitedChangedSourceLeafItemCount
      !== (meter.receiptsByUnit.get("source-leaf-slots")?.completedWork ?? 0)
  ) return null
  const sourceItems = meter.receiptsByUnit.get("source-items")?.completedWork ?? 0
  if (
    sourceItems !== 0
    || input.producingStageAuthority !== meter.seed.producingStageAuthority
  ) return null
  const receipts = cloneReceipts(meter.receipts)
  const record = Object.freeze({
    previousRoot: meter.seed.previousRoot,
    change: meter.seed.change,
    composition: meter.seed.composition,
    candidateWork: input.nextCandidateWork,
    receipts,
    producingStageAuthority: input.producingStageAuthority,
  })
  const authority = record as unknown as
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  authorityRecords.set(authority, record)
  authoritiesByCandidate.set(input.nextCandidateWork, authority)
  meter.published = true
  return authority
}

export function resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1 | null {
  const authority = authoritiesByCandidate.get(input.candidateWork)
  const record = authority == null ? null : authorityRecords.get(authority)
  return record != null
      && record.previousRoot === input.previousRoot
      && record.change === input.change
      && record.composition === input.composition
      && record.candidateWork === input.candidateWork
      && exactComposition(input)
    ? record
    : null
}

export function inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[] | null {
  const record = meterRecords.get(meter)
  return record == null ? null : cloneReceipts(record.receipts)
}
