import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockUnifiedLayoutSourceExactPhysicalEntryResolverInternalV1,
  insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1,
  visitVNextTextBlockUnifiedLayoutSourcePhysicalItemByInlineIdInternalV1,
  VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
  type VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
} from "./textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.js"
import {
  insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceStyleFromRefcountRootInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
} from "./textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.js"
import {
  canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
  discardVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1,
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1,
  registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
  releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1,
  reserveVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
  VNextTextBlockUnifiedLayoutSourceAccessRecordInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
  type VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1,
} from "./textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  captureVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1,
  matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1,
  matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  type VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import {
  attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1,
  type VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
} from "./textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"

const SOURCE_SIDECAR_STEP_CONSUMER_AUTHORITY_INTERNAL_V1 = Object.freeze({}) as
  VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1

export interface VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly positionPolicy:
    typeof VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1
  readonly identityRoot:
    VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly orderRoot:
    VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly styleRoot:
    VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1 {
  readonly __sourceSidecarCandidateAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1 {
  readonly planAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  readonly sealAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
  readonly plannedOutput:
    VNextTextBlockUnifiedLayoutPreparedSourceSidecarOutputInternalV1
  readonly candidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
}

export interface VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1 {
  readonly reservationAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  readonly candidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly records: readonly Readonly<{
    readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
    readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  }>[]
  readonly count: number
}

export interface VNextTextBlockUnifiedLayoutPreparedSourceSidecarOutputInternalV1 {
  readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly registration:
    VNextTextBlockUnifiedLayoutSourceSidecarRegistrationInternalV1
  readonly pairPublicationSet:
    VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1
  readonly sourceAccessRecord:
    VNextTextBlockUnifiedLayoutSourceAccessRecordInternalV1
}

export type VNextTextBlockUnifiedLayoutSourceSidecarCompleteIssueInternalV1 =
  | "source-position-key-space-exhausted"
  | "source-state-authority-mismatch"
  | "invalid-source-topology"
  | "duplicate-atomic-inline-id"
  | "unsafe-source-summary"

export interface VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1 {
  readonly constructionKind: "complete"
  readonly status: "prepared" | "blocked"
  readonly issue: VNextTextBlockUnifiedLayoutSourceSidecarCompleteIssueInternalV1 | null
  readonly declaredSourceItemCount: number
  readonly observedSourceItemCount: number
  readonly identityEntryCount: number
  readonly orderEntryCount: number
  readonly styleReferenceCount: number
  readonly operationCounts: Readonly<Record<
    VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    number
  >>
  readonly fingerprint: string
}

type PreparedResult = {
  readonly status: "prepared"
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly completeReceipt: VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1
  readonly candidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
}

type BlockedResult = {
  readonly status: "blocked"
  readonly sidecars: null
  readonly completeReceipt: VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1
}

interface CompleteCandidateRecordInternalV1 {
  readonly constructionKind: "complete"
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly completeReceipt: VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1
  readonly physicalEntries:
    readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
}

interface PathCopyCandidateRecordInternalV1 {
  readonly constructionKind: "path-copy"
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
  readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly newPhysicalEntries:
    readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
}

type CandidateRecordInternalV1 =
  | CompleteCandidateRecordInternalV1
  | PathCopyCandidateRecordInternalV1

export interface VNextTextBlockUnifiedLayoutSourceSidecarRegistrationInternalV1 {
  readonly constructionKind:
    | "complete"
    | "source-transaction"
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly sidecarCandidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1 | null
}
type RegistrationInternalV1 =
  VNextTextBlockUnifiedLayoutSourceSidecarRegistrationInternalV1

const candidateRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
  CandidateRecordInternalV1
>()
const consumedCandidates = new WeakSet<
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
>()
let pathCopyCandidateObserverForTestInternalV1: ((input: Readonly<{
  readonly authority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}>) => void) | null = null

export function setVNextTextBlockUnifiedLayoutSourceSidecarPathCopyCandidateObserverForTestInternalV1(
  observer: typeof pathCopyCandidateObserverForTestInternalV1,
): void {
  pathCopyCandidateObserverForTestInternalV1 = observer
}

export function discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
): boolean {
  if (
    consumedCandidates.has(authority)
    || isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
      authority,
    )
  ) return false
  const reservation = exactPhysicalPairReservationByCandidate.get(authority)
  if (reservation != null) {
    releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
      sourceState: reservation.sourceState,
      reservationAuthority: reservation.reservationAuthority,
    })
    releaseExactPhysicalEntryPairReservation(reservation)
  }
  return candidateRecords.delete(authority)
}

const registrationsBySource = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  RegistrationInternalV1
>()
const pathCopyRegistrationPreconditionRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
  Readonly<{
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      import("./textBlockUnifiedLayoutSourceStateV1.js")
        .VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  }>
>()
type SourceSidecarCommitPlanRecordInternalV1 = Readonly<{
    readonly planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    readonly registrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    readonly candidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly registration: RegistrationInternalV1
    readonly pairPublicationSet:
      VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly sealAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
    readonly sourceAccessRecord:
      VNextTextBlockUnifiedLayoutSourceAccessRecordInternalV1
    readonly plannedOutput:
      VNextTextBlockUnifiedLayoutPreparedSourceSidecarOutputInternalV1
  }>
const sidecarCommitPlanRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
  SourceSidecarCommitPlanRecordInternalV1
>()
const exactPhysicalEntryBySourceItem = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
>()
const reservedExactPhysicalEntryBySourceItem = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceItemV1,
  Readonly<{
    readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
    readonly reservationAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  }>
>()
interface ExactPhysicalPairReservationInternalV1 {
  readonly reservationAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  readonly candidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly entries:
    readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
  readonly publicationSet:
    VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1
}
const exactPhysicalPairReservationByCandidate = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
  ExactPhysicalPairReservationInternalV1
>()
const exactPhysicalPairReservationByAuthority = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
  ExactPhysicalPairReservationInternalV1
>()
if (!bindVNextTextBlockUnifiedLayoutSourceExactPhysicalEntryResolverInternalV1(
  (item) => exactPhysicalEntryBySourceItem.get(item) ?? null,
)) throw new Error("Source exact physical-entry resolver already bound")
const positionKeyExhaustionProofRecords = new WeakMap<object, Readonly<{
  readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
  readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly left: number | null
  readonly right: number | null
  readonly leftNeighbor:
    VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
  readonly rightNeighbor:
    VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
  readonly requestedCount: number
  readonly receiptSnapshotAuthority:
    VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1
}>>()

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function emptyCounts(): Record<
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
  number
> {
  return {
    "source-items": 0,
    "source-tree-lookup-nodes": 0,
    "source-tree-path-copy-nodes": 0,
    "source-leaf-slots": 0,
    "source-index-nodes": 0,
    "source-index-entries": 0,
    "source-index-comparisons": 0,
    "source-style-nodes": 0,
    "source-style-buckets": 0,
    "source-style-entries": 0,
  }
}

function receipt(input: {
  readonly status: "prepared" | "blocked"
  readonly issue: VNextTextBlockUnifiedLayoutSourceSidecarCompleteIssueInternalV1 | null
  readonly declaredSourceItemCount: number
  readonly observedSourceItemCount: number
  readonly identityEntryCount: number
  readonly orderEntryCount: number
  readonly styleReferenceCount: number
  readonly operationCounts: Record<
    VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    number
  >
}): VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1 {
  const operationCounts = Object.freeze({ ...input.operationCounts })
  const facts = {
    constructionKind: "complete" as const,
    status: input.status,
    issue: input.issue,
    declaredSourceItemCount: input.declaredSourceItemCount,
    observedSourceItemCount: input.observedSourceItemCount,
    identityEntryCount: input.identityEntryCount,
    orderEntryCount: input.orderEntryCount,
    styleReferenceCount: input.styleReferenceCount,
    operationCounts,
  }
  return Object.freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function completePositionKey(index: number, itemCount: number): number | null {
  const multiplier = 2n * BigInt(index) - (BigInt(itemCount) - 1n)
  const key = multiplier * 2_147_483_648n
  const value = Number(key)
  return Number.isSafeInteger(value) ? value : null
}

function endpointsAreSafe(itemCount: number): boolean {
  if (!Number.isSafeInteger(itemCount) || itemCount < 0) return false
  if (itemCount === 0) return true
  return completePositionKey(0, itemCount) != null
    && completePositionKey(itemCount - 1, itemCount) != null
}

function sourceItemsInCanonicalOrder(
  root: VNextTextBlockUnifiedLayoutSourceNodeV1,
  beforeNode: () => void,
  beforeItemSlot: () => void,
  beforeItem: () => void,
): Generator<VNextTextBlockUnifiedLayoutSourceItemV1> {
  function* visit(
    node: VNextTextBlockUnifiedLayoutSourceNodeV1,
  ): Generator<VNextTextBlockUnifiedLayoutSourceItemV1> {
    beforeNode()
    if (node.nodeKind === "leaf") {
      for (let index = 0; index < node.items.length; index += 1) {
        beforeItemSlot()
        beforeItem()
        const item = node.items[index]
        if (item == null) throw new RangeError("Source item slot missing")
        yield item
      }
      return
    }
    for (const child of node.children) yield* visit(child)
  }
  return visit(root)
}

function prepareComplete(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly observeBeforeOperation?: (
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    ) => void
  },
  styleFingerprintFactory?:
    VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1,
): PreparedResult | BlockedResult {
  const counts = emptyCounts()
  const declaredSourceItemCount = input.sourceState?.summary?.itemCount
  const declared = typeof declaredSourceItemCount === "number"
    ? declaredSourceItemCount
    : -1
  let observedSourceItemCount = 0
  let identityEntryCount = 0
  let orderEntryCount = 0
  let styleReferenceCount = 0
  const observe = (
    unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
  ): void => {
    const next = counts[unit] + 1
    if (!Number.isSafeInteger(next)) throw new RangeError("sidecar receipt overflow")
    counts[unit] = next
    input.observeBeforeOperation?.(unit)
  }
  const blocked = (
    issue: VNextTextBlockUnifiedLayoutSourceSidecarCompleteIssueInternalV1,
  ): BlockedResult => Object.freeze({
    status: "blocked" as const,
    sidecars: null,
    completeReceipt: receipt({
      status: "blocked",
      issue,
      declaredSourceItemCount: declared,
      observedSourceItemCount,
      identityEntryCount,
      orderEntryCount,
      styleReferenceCount,
      operationCounts: counts,
    }),
  })

  if (!endpointsAreSafe(declared)) {
    return blocked(
      Number.isSafeInteger(declared) && declared >= 0
        ? "source-position-key-space-exhausted"
        : "unsafe-source-summary",
    )
  }
  const sourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(input.sourceState)
  if (sourceInspection.status !== "prepared-unregistered") {
    return blocked("source-state-authority-mismatch")
  }

  let identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null = null
  let orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null = null
  let styleRoot: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null = null
  const physicalEntries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  try {
    const items = sourceItemsInCanonicalOrder(
      input.sourceState.root,
      () => { observe("source-tree-lookup-nodes") },
      () => { observe("source-leaf-slots") },
      () => {
        observe("source-items")
        observedSourceItemCount += 1
      },
    )
    let ordinal = 0
    for (const item of items) {
      observe("source-index-entries")
      const positionKey = completePositionKey(ordinal, declared)
      if (positionKey == null) return blocked("source-position-key-space-exhausted")
      const physicalEntry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 =
        Object.freeze({
          item,
          positionKey,
          renderedUtf16Length: item.renderedUtf16Length,
        })
      physicalEntries.push(physicalEntry)
      const inserted =
        insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1({
          identityRoot,
          orderRoot,
          entry: physicalEntry,
          observeBeforeOperation: observe,
        })
      if (inserted.status !== "inserted") {
        const duplicate = identityRoot != null
          && item.kind !== "text"
        return blocked(duplicate
          ? "duplicate-atomic-inline-id"
          : "invalid-source-topology")
      }
      identityRoot = inserted.identityRoot
      orderRoot = inserted.orderRoot
      identityEntryCount += 1
      orderEntryCount += 1
      if (
        item.kind === "text"
        || item.kind === "resolved-field"
        || item.kind === "generated-page-number"
      ) {
        observe("source-style-entries")
        const style = item.style
        styleRoot = insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1({
          root: styleRoot,
          style,
          fingerprintFactory: styleFingerprintFactory,
          observeBeforeOperation: observe,
        })
        if (styleRoot == null) return blocked("invalid-source-topology")
        styleReferenceCount += 1
      }
      ordinal += 1
    }
    if (
      ordinal !== declared
      || identityRoot?.entryCount !== declared
      || orderRoot?.itemCount !== declared
      || orderRoot?.renderedUtf16Length
        !== input.sourceState.summary.renderedUtf16Length
    ) return blocked("invalid-source-topology")
  } catch {
    return blocked("unsafe-source-summary")
  }

  const sidecarFacts = {
    sourceStateFingerprint: input.sourceState.fingerprint,
    positionPolicy: VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
    identityRootFingerprint: identityRoot?.fingerprint ?? null,
    orderRootFingerprint: orderRoot?.fingerprint ?? null,
    styleRootFingerprint: styleRoot?.fingerprint ?? null,
  }
  const sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 =
    Object.freeze({
      sourceState: input.sourceState,
      positionPolicy: VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
      identityRoot,
      orderRoot,
      styleRoot,
      fingerprint: fingerprint(sidecarFacts),
    })
  const completeReceipt = receipt({
    status: "prepared",
    issue: null,
    declaredSourceItemCount: declared,
    observedSourceItemCount,
    identityEntryCount,
    orderEntryCount,
    styleReferenceCount,
    operationCounts: counts,
  })
  const candidateAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  const exactPhysicalEntries = Object.freeze(physicalEntries)
  candidateRecords.set(candidateAuthority, Object.freeze({
    constructionKind: "complete" as const,
    sourceState: input.sourceState,
    sidecars,
    completeReceipt,
    physicalEntries: exactPhysicalEntries,
  }))
  return Object.freeze({
    status: "prepared" as const,
    sidecars,
    completeReceipt,
    candidateAuthority,
  })
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly observeBeforeOperation?: (
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    ) => void
  },
): PreparedResult | BlockedResult {
  return prepareComplete(input)
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly observeBeforeOperation?: (
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    ) => void
  },
): PreparedResult | BlockedResult {
  return prepareComplete(input, () => `sha256:${"0".repeat(64)}`)
}

function validateExactPhysicalEntryPairs(input: {
  readonly entries:
    readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
  readonly reservationAuthority?:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
}): readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] | null {
  const items = new Set<VNextTextBlockUnifiedLayoutSourceItemV1>()
  const exactEntries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  for (const entry of input.entries) {
    const item = entry.item
    const exact = exactPhysicalEntryBySourceItem.get(item)
    const reserved = reservedExactPhysicalEntryBySourceItem.get(item)
    if (
      !Object.isFrozen(entry)
      || !Object.isFrozen(item)
      || items.has(item)
      || entry.renderedUtf16Length !== item.renderedUtf16Length
      || (exact != null && exact !== entry)
      || (
        reserved != null
        && reserved.reservationAuthority !== input.reservationAuthority
      )
    ) return null
    items.add(item)
    exactEntries.push(entry)
  }
  return Object.freeze(exactEntries)
}

function reserveExactPhysicalEntryPairs(input: {
  readonly reservationAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  readonly candidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly entries:
    readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
}): boolean {
  if (
    exactPhysicalPairReservationByCandidate.has(input.candidateAuthority)
    || exactPhysicalPairReservationByAuthority.has(input.reservationAuthority)
  ) return false
  const entries = validateExactPhysicalEntryPairs({
    entries: input.entries,
    reservationAuthority: input.reservationAuthority,
  })
  if (entries == null) return false
  const pairs = Object.freeze(entries.map((entry) => Object.freeze({
    item: entry.item,
    entry,
  })))
  const publicationSet = Object.freeze({
    reservationAuthority: input.reservationAuthority,
    candidateAuthority: input.candidateAuthority,
    records: pairs,
    count: pairs.length,
  })
  const reservation: ExactPhysicalPairReservationInternalV1 = Object.freeze({
    reservationAuthority: input.reservationAuthority,
    candidateAuthority: input.candidateAuthority,
    sourceState: input.sourceState,
    entries,
    publicationSet,
  })
  for (const entry of entries) {
    if (exactPhysicalEntryBySourceItem.has(entry.item)) continue
    reservedExactPhysicalEntryBySourceItem.set(entry.item, Object.freeze({
      entry,
      reservationAuthority: input.reservationAuthority,
    }))
  }
  exactPhysicalPairReservationByCandidate.set(input.candidateAuthority, reservation)
  exactPhysicalPairReservationByAuthority.set(input.reservationAuthority, reservation)
  return true
}

function releaseExactPhysicalEntryPairReservation(
  reservation: ExactPhysicalPairReservationInternalV1,
): void {
  for (const entry of reservation.entries) {
    if (
      reservedExactPhysicalEntryBySourceItem.get(entry.item)
        ?.reservationAuthority === reservation.reservationAuthority
    ) reservedExactPhysicalEntryBySourceItem.delete(entry.item)
  }
  exactPhysicalPairReservationByCandidate.delete(reservation.candidateAuthority)
  exactPhysicalPairReservationByAuthority.delete(reservation.reservationAuthority)
}

function publishExactPhysicalEntryPairs(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
): void {
  for (const entry of entries) {
    exactPhysicalEntryBySourceItem.set(entry.item, entry)
    reservedExactPhysicalEntryBySourceItem.delete(entry.item)
  }
}

function commitPreparedExactPhysicalEntryPairPublication(
  publication: VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1,
): void {
  let pairIndex = 0
  while (pairIndex < publication.count) {
    const pair = publication.records[pairIndex]!
    exactPhysicalEntryBySourceItem.set(pair.item, pair.entry)
    reservedExactPhysicalEntryBySourceItem.delete(pair.item)
    pairIndex += 1
  }
  exactPhysicalPairReservationByCandidate.delete(
    publication.candidateAuthority,
  )
  exactPhysicalPairReservationByAuthority.delete(
    publication.reservationAuthority,
  )
}

function planASidecarAccessCallbacks(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
}): Omit<
  Parameters<
    typeof registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1
  >[0],
  "sourceState"
> {
  return {
    resolveStyle: (styleKeys) =>
      resolveVNextTextBlockUnifiedLayoutSourceStyleFromRefcountRootInternalV1({
        root: input.sidecars.styleRoot,
        ...styleKeys,
      }),
    visitItemByInlineId: (lookup) =>
      visitVNextTextBlockUnifiedLayoutSourcePhysicalItemByInlineIdInternalV1({
        identityRoot: input.sidecars.identityRoot,
        orderRoot: input.sidecars.orderRoot,
        ...lookup,
      }),
    checkInlineIdConflict: (lookup) => {
      const limitStop = Object.freeze({})
      try {
        const entries = lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
          root: input.sidecars.identityRoot,
          inlineId: lookup.inlineId,
          observeBeforeOperation(unit) {
            if (unit === "source-index-nodes" && !lookup.beforeVisitNode()) {
              throw limitStop
            }
          },
        })
        return Object.freeze({
          status: "checked" as const,
          conflict: entries.length > 0
            && (lookup.incomingKind !== "text"
              || entries.some((entry) => entry.item.kind !== "text")),
        })
      } catch (error) {
        if (error === limitStop) {
          return Object.freeze({ status: "limit-exceeded" as const })
        }
        throw error
      }
    },
  }
}

function registerPlanASidecarAccess(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
}): boolean {
  return registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
    sourceState: input.sourceState,
    ...planASidecarAccessCallbacks(input),
  })
}

export function registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  },
): boolean {
  const candidate = candidateRecords.get(input.candidateAuthority)
  if (
    candidate == null
    || candidate.constructionKind !== "complete"
    || consumedCandidates.has(input.candidateAuthority)
    || input.root.sourceState !== candidate.sourceState
    || resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      input.root,
    ) !== input.composition
    || registrationsBySource.has(candidate.sourceState)
    || !canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
      candidate.sourceState,
    )
  ) return false
  const exactEntries = validateExactPhysicalEntryPairs({
    entries: candidate.physicalEntries,
  })
  if (exactEntries == null) return false
  const registration: RegistrationInternalV1 = Object.freeze({
    constructionKind: "complete" as const,
    sourceState: candidate.sourceState,
    sidecars: candidate.sidecars,
    root: input.root,
    composition: input.composition,
    sidecarCandidateAuthority: input.candidateAuthority,
  })
  if (!registerPlanASidecarAccess({
    sourceState: candidate.sourceState,
    sidecars: candidate.sidecars,
  })) return false
  registrationsBySource.set(candidate.sourceState, registration)
  publishExactPhysicalEntryPairs(exactEntries)
  consumedCandidates.add(input.candidateAuthority)
  return true
}

/** Test-only exact complete-candidate activation; accepts no caller-supplied pairs. */
export function activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  },
): boolean {
  const candidate = candidateRecords.get(input.candidateAuthority)
  if (
    candidate?.constructionKind !== "complete"
    || candidate.sourceState !== input.sourceState
    || candidate.sidecars !== input.sidecars
    || consumedCandidates.has(input.candidateAuthority)
  ) return false
  const exactEntries = validateExactPhysicalEntryPairs({
    entries: candidate.physicalEntries,
  })
  if (exactEntries == null) return false
  publishExactPhysicalEntryPairs(exactEntries)
  consumedCandidates.add(input.candidateAuthority)
  return true
}

export function resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  },
): VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 | null {
  const registration = registrationsBySource.get(input.sourceState)
  if (
    registration == null
    || registration.sourceState !== input.sourceState
    || registration.composition !== input.composition
    || resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      registration.root,
    ) !== input.composition
    || (
      registration.constructionKind === "complete"
        ? registration.root.sourceState !== input.sourceState
        : false
    )
  ) return null
  return registration.sidecars
}

function incrementalIssue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return Object.freeze({
    code: "incremental-proof-unavailable",
    severity: "error",
    stage: "source-flow",
    path: "sourceState.sidecars",
    message,
  })
}

function preparePathCopyInternalV1(
  input: {
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
    readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  },
  forcedPositionIntervalForTest: Readonly<{
    readonly left: number | null
    readonly right: number | null
  }> | null,
):
  | {
      readonly status: "prepared"
      readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
      readonly candidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
      readonly issues: readonly []
    }
  | {
      readonly status: "fallback-required"
      readonly cause: "source-position-key-space-exhausted" | "work-limit"
      readonly evaluatorOrProofAuthority: object
      readonly sidecars: null
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly sidecars: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    } {
  const blocked = (message: string) => Object.freeze({
    status: "blocked" as const,
    sidecars: null,
    issues: Object.freeze([incrementalIssue(message)]),
  })
  const sourceCandidate =
    getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      input.removedItems,
    )
  const registration = registrationsBySource.get(input.previousSourceState)
  if (
    sourceCandidate == null
    || sourceCandidate.previousSourceState !== input.previousSourceState
    || sourceCandidate.nextSourceState !== input.nextSourceState
    || sourceCandidate.replacement !== input.replacement
    || sourceCandidate.removedItems !== input.removedItems
    || sourceCandidate.nextPhysicalItems !== input.nextPhysicalItems
    || getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      input.nextPhysicalItems,
    ) !== sourceCandidate
    || registration == null
    || registration.sidecars !== input.previousSidecars
    || input.previousSidecars.sourceState !== input.previousSourceState
    || sourceCandidate.change == null
    || !matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1({
      meter: input.workMeter,
      previousRoot: registration.root,
      change: sourceCandidate.change,
      composition: registration.composition,
    })
    || projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      input.workMeter,
    ) == null
  ) return blocked("Source sidecar path copy requires exact candidate authority")

  const physical = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
    identityRoot: input.previousSidecars.identityRoot,
    orderRoot: input.previousSidecars.orderRoot,
    removedItems: input.removedItems,
    nextPhysicalItems: input.nextPhysicalItems,
    workMeter: input.workMeter,
    previousRenderedBoundary:
      input.replacement.previousRange.startRenderedUtf16,
    ...(forcedPositionIntervalForTest == null ? {} : {
      forcedPositionIntervalForTest,
    }),
  })
  if (physical.status === "work-limit") {
    return Object.freeze({
      status: "fallback-required" as const,
      cause: "work-limit" as const,
      evaluatorOrProofAuthority: physical.evaluatorAuthority,
      sidecars: null,
      issues: Object.freeze([]) as readonly [],
    })
  }
  if (physical.status === "key-space-exhausted") {
    const receiptSnapshotAuthority =
      captureVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1(
        input.workMeter,
      )
    if (receiptSnapshotAuthority == null) {
      return blocked("Source position exhaustion receipt snapshot was unavailable")
    }
    const proof = Object.freeze({})
    positionKeyExhaustionProofRecords.set(proof, Object.freeze({
      previousSidecars: input.previousSidecars,
      replacement: input.replacement,
      removedItems: input.removedItems,
      nextPhysicalItems: input.nextPhysicalItems,
      workMeter: input.workMeter,
      left: physical.left,
      right: physical.right,
      leftNeighbor: physical.leftNeighbor,
      rightNeighbor: physical.rightNeighbor,
      requestedCount: physical.requestedCount,
      receiptSnapshotAuthority,
    }))
    return Object.freeze({
      status: "fallback-required" as const,
      cause: "source-position-key-space-exhausted" as const,
      evaluatorOrProofAuthority: proof,
      sidecars: null,
      issues: Object.freeze([]) as readonly [],
    })
  }
  if (physical.status !== "prepared") {
    return blocked("Source physical-index path copy was blocked")
  }
  const styles = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
    root: input.previousSidecars.styleRoot,
    removedItems: input.removedItems,
    nextPhysicalItems: input.nextPhysicalItems,
    workMeter: input.workMeter,
  })
  if (styles.status === "work-limit") {
    return Object.freeze({
      status: "fallback-required" as const,
      cause: "work-limit" as const,
      evaluatorOrProofAuthority: styles.evaluatorAuthority,
      sidecars: null,
      issues: Object.freeze([]) as readonly [],
    })
  }
  if (styles.status !== "prepared") {
    return blocked("Source style-refcount path copy was blocked")
  }
  const sidecarFacts = {
    sourceStateFingerprint: input.nextSourceState.fingerprint,
    positionPolicy: VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
    identityRootFingerprint: physical.identityRoot?.fingerprint ?? null,
    orderRootFingerprint: physical.orderRoot?.fingerprint ?? null,
    styleRootFingerprint: styles.root?.fingerprint ?? null,
  }
  const sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 = Object.freeze({
    sourceState: input.nextSourceState,
    positionPolicy: VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
    identityRoot: physical.identityRoot,
    orderRoot: physical.orderRoot,
    styleRoot: styles.root,
    fingerprint: fingerprint(sidecarFacts),
  })
  const candidateAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  candidateRecords.set(candidateAuthority, Object.freeze({
    constructionKind: "path-copy" as const,
    sourceState: input.nextSourceState,
    sidecars,
    previousSidecars: input.previousSidecars,
    replacement: input.replacement,
    removedItems: input.removedItems,
    nextPhysicalItems: input.nextPhysicalItems,
    workMeter: input.workMeter,
    newPhysicalEntries: physical.newEntries,
  }))
  pathCopyCandidateObserverForTestInternalV1?.(Object.freeze({
    authority: candidateAuthority,
    sourceState: input.nextSourceState,
    sidecars,
    workMeter: input.workMeter,
  }))
  return Object.freeze({
    status: "prepared" as const,
    sidecars,
    candidateAuthority,
    issues: Object.freeze([]) as readonly [],
  })
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(
  input: Parameters<typeof preparePathCopyInternalV1>[0],
): ReturnType<typeof preparePathCopyInternalV1> {
  return preparePathCopyInternalV1(input, null)
}

export function canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  },
): boolean {
  const candidate = candidateRecords.get(input.candidateAuthority)
  const previousRegistration = registrationsBySource.get(
    input.previousSidecars.sourceState,
  )
  const pairReservation = exactPhysicalPairReservationByCandidate.get(
    input.candidateAuthority,
  )
  return candidate != null
    && candidate.constructionKind === "path-copy"
    && !consumedCandidates.has(input.candidateAuthority)
    && candidate.sourceState === input.nextSourceState
    && candidate.sidecars === input.nextSidecars
    && candidate.previousSidecars === input.previousSidecars
    && candidate.workMeter === input.workMeter
    && previousRegistration != null
    && previousRegistration.sidecars === input.previousSidecars
    && previousRegistration.root === input.previousRoot
    && previousRegistration.composition === input.composition
    && resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      input.previousRoot,
    ) === input.composition
    && !registrationsBySource.has(input.nextSourceState)
    && (
      canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
        input.nextSourceState,
      )
      || (
        pairReservation?.sourceState === input.nextSourceState
        && matchesVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
          sourceState: input.nextSourceState,
          reservationAuthority: pairReservation.reservationAuthority,
        })
      )
    )
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1(
  input: Parameters<
    typeof canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1
  >[0] & Readonly<{
    readonly sourcePathCopyCandidateAuthority:
      import("./textBlockUnifiedLayoutSourceStateV1.js")
        .VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1 | null {
  const sidecarCandidate = candidateRecords.get(input.candidateAuthority)
  const sourceCandidate =
    getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      input.sourcePathCopyCandidateAuthority,
    )
  if (
    !canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(input)
    || sidecarCandidate?.constructionKind !== "path-copy"
    || sourceCandidate == null
    || sourceCandidate.nextSourceState !== input.nextSourceState
    || sourceCandidate.replacement !== sidecarCandidate.replacement
    || sourceCandidate.removedItems !== sidecarCandidate.removedItems
    || sourceCandidate.nextPhysicalItems !== sidecarCandidate.nextPhysicalItems
  ) return null
  const authority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  if (!reserveVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
    sourceState: input.nextSourceState,
    reservationAuthority: authority,
  })) return null
  if (!reserveExactPhysicalEntryPairs({
    reservationAuthority: authority,
    candidateAuthority: input.candidateAuthority,
    sourceState: input.nextSourceState,
    entries: sidecarCandidate.newPhysicalEntries,
  })) {
    releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
      sourceState: input.nextSourceState,
      reservationAuthority: authority,
    })
    return null
  }
  pathCopyRegistrationPreconditionRecords.set(authority, Object.freeze({
    previousRoot: input.previousRoot,
    composition: input.composition,
    previousSidecars: input.previousSidecars,
    nextSourceState: input.nextSourceState,
    nextSidecars: input.nextSidecars,
    candidateAuthority: input.candidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
    workMeter: input.workMeter,
  }))
  return authority
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    readonly detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    readonly registrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      import("./textBlockUnifiedLayoutSourceStateV1.js")
        .VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutPreparedSourceSidecarCommitPlanInternalV1 | null {
  const precondition = pathCopyRegistrationPreconditionRecords.get(
    input.registrationPreconditionAuthority,
  )
  const candidate = candidateRecords.get(input.nextSidecarCandidateAuthority)
  const sourceCandidate = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    input.sourcePathCopyCandidateAuthority,
  )
  const pairReservation = exactPhysicalPairReservationByAuthority.get(
    input.registrationPreconditionAuthority,
  )
  if (
    precondition == null
    || candidate?.constructionKind !== "path-copy"
    || sourceCandidate == null
    || pairReservation == null
    || precondition.previousSidecars !== input.previousSidecars
    || precondition.nextSidecars !== input.nextSidecars
    || precondition.workMeter !== input.candidateWorkMeter
    || precondition.candidateAuthority
      !== input.nextSidecarCandidateAuthority
    || precondition.sourcePathCopyCandidateAuthority
      !== input.sourcePathCopyCandidateAuthority
    || candidate.sourceState !== precondition.nextSourceState
    || candidate.sidecars !== input.nextSidecars
    || candidate.previousSidecars !== input.previousSidecars
    || candidate.workMeter !== input.candidateWorkMeter
    || sourceCandidate.nextSourceState !== precondition.nextSourceState
    || sourceCandidate.replacement !== candidate.replacement
    || sourceCandidate.removedItems !== candidate.removedItems
    || sourceCandidate.nextPhysicalItems !== candidate.nextPhysicalItems
    || pairReservation.candidateAuthority
      !== input.nextSidecarCandidateAuthority
    || pairReservation.sourceState !== precondition.nextSourceState
    || registrationsBySource.has(precondition.nextSourceState)
    || !matchesVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
      sourceState: precondition.nextSourceState,
      reservationAuthority: input.registrationPreconditionAuthority,
    })
  ) return null

  const planAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  const sealAuthority = Object.freeze({}) as
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
  const access = planASidecarAccessCallbacks({
    sourceState: precondition.nextSourceState,
    sidecars: input.nextSidecars,
  })
  const sourceAccessRecord =
    prepareVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1({
      planAuthority,
      sourceState: precondition.nextSourceState,
      reservationAuthority: input.registrationPreconditionAuthority,
      ...access,
    })
  if (sourceAccessRecord == null) return null
  const registration: RegistrationInternalV1 = Object.freeze({
    constructionKind: "source-transaction" as const,
    sourceState: precondition.nextSourceState,
    sidecars: input.nextSidecars,
    root: precondition.previousRoot,
    composition: precondition.composition,
    sidecarCandidateAuthority: null,
  })
  const plannedOutput = Object.freeze({
    nextSidecars: input.nextSidecars,
    registration,
    pairPublicationSet: pairReservation.publicationSet,
    sourceAccessRecord,
  })
  const planRecord = Object.freeze({
    planAuthority,
    registrationPreconditionAuthority:
      input.registrationPreconditionAuthority,
    candidateAuthority: input.nextSidecarCandidateAuthority,
    registration,
    pairPublicationSet: pairReservation.publicationSet,
    detachedTicket: input.detachedTicket,
    sealAuthority,
    sourceAccessRecord,
    plannedOutput,
  }) as SourceSidecarCommitPlanRecordInternalV1
  const applyRecord = planRecord as unknown as
    VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
  const prepared = Object.freeze({
    planAuthority,
    sealAuthority,
    plannedOutput,
    candidateAuthority: input.nextSidecarCandidateAuthority,
  })
  sidecarCommitPlanRecords.set(planAuthority, planRecord)
  if (!attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
    detachedTicket: input.detachedTicket,
    planAuthority,
    sealAuthority,
    applyRecord,
    consumerAuthority: SOURCE_SIDECAR_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
  })) {
    sidecarCommitPlanRecords.delete(planAuthority)
    discardVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1(
      planAuthority,
    )
    return null
  }
  return prepared
}

export function matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    sealAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1
    plannedOutput:
      VNextTextBlockUnifiedLayoutPreparedSourceSidecarOutputInternalV1
  }>,
): boolean {
  const plan = sidecarCommitPlanRecords.get(input.planAuthority)
  return plan != null
    && plan.detachedTicket === input.detachedTicket
    && plan.sealAuthority === input.sealAuthority
    && plan.plannedOutput === input.plannedOutput
}

export function abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    abandonmentAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1
  }>,
): void {
  if (!sidecarCommitPlanRecords.has(input.planAuthority)) {
    throw new Error("Source sidecar commit plan abandonment invariant violated")
  }
  consumeVNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentInternalV1(input)
  discardVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1(
    input.planAuthority,
  )
  sidecarCommitPlanRecords.delete(input.planAuthority)
}

export function applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  step: VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
): VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1 {
  const { applyRecord, nextStep } =
    consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1({
      step,
      consumerAuthority: SOURCE_SIDECAR_STEP_CONSUMER_AUTHORITY_INTERNAL_V1,
    })
  const plan = applyRecord as unknown as SourceSidecarCommitPlanRecordInternalV1
  registrationsBySource.set(plan.registration.sourceState, plan.registration)
  commitPreparedExactPhysicalEntryPairPublication(plan.pairPublicationSet)
  consumedCandidates.add(plan.candidateAuthority)
  candidateRecords.delete(plan.candidateAuthority)
  pathCopyRegistrationPreconditionRecords.delete(
    plan.registrationPreconditionAuthority,
  )
  sidecarCommitPlanRecords.delete(plan.planAuthority)
  return nextStep
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyWithForcedPositionIntervalForTestInternalV1(
  input: Parameters<typeof preparePathCopyInternalV1>[0],
  interval: Readonly<{ readonly left: number | null; readonly right: number | null }>,
): ReturnType<typeof preparePathCopyInternalV1> {
  return preparePathCopyInternalV1(input, Object.freeze({ ...interval }))
}

export function matchesVNextTextBlockUnifiedLayoutSourcePositionKeyExhaustionProofInternalV1(
  input: {
    readonly proofAuthority: object
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
    readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  },
): boolean {
  const proof = positionKeyExhaustionProofRecords.get(input.proofAuthority)
  const retainedItems = new WeakSet(input.removedItems)
  const requestedCount = input.nextPhysicalItems.reduce(
    (count, item) => count + (retainedItems.has(item) ? 0 : 1),
    0,
  )
  return proof != null
    && proof.previousSidecars === input.previousSidecars
    && proof.replacement === input.replacement
    && proof.removedItems === input.removedItems
    && proof.nextPhysicalItems === input.nextPhysicalItems
    && proof.workMeter === input.workMeter
    && proof.requestedCount === requestedCount
    && matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1({
      meter: input.workMeter,
      snapshotAuthority: proof.receiptSnapshotAuthority,
    })
}
