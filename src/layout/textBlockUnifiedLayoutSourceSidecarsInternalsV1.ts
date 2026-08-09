import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
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
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
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
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  captureVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1,
  matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  type VNextTextBlockUnifiedLayout5B2ReceiptSnapshotAuthorityInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  bindVNextTextBlockUnifiedLayoutSourceStageCommitSidecarsInternalV1,
  isVNextTextBlockUnifiedLayoutSourceStageSidecarCandidateAbortProtectedInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourceStageCommitSidecarCandidateInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"

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
}

type CandidateRecordInternalV1 =
  | CompleteCandidateRecordInternalV1
  | PathCopyCandidateRecordInternalV1

interface RegistrationInternalV1 {
  readonly constructionKind: "complete" | "source-checkpoint"
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly sourceStageCommitTicket:
    VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null
  readonly sidecarCandidateAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1 | null
}

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
    || isVNextTextBlockUnifiedLayoutSourceStageSidecarCandidateAbortProtectedInternalV1(
      authority,
    )
  ) return false
  return candidateRecords.delete(authority)
}

const registrationsBySource = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  RegistrationInternalV1
>()
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
  candidateRecords.set(candidateAuthority, Object.freeze({
    constructionKind: "complete" as const,
    sourceState: input.sourceState,
    sidecars,
    completeReceipt,
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

function registerPlanASidecarAccess(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
}): boolean {
  return registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
    sourceState: input.sourceState,
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
  ) return false
  const registration: RegistrationInternalV1 = Object.freeze({
    constructionKind: "complete" as const,
    sourceState: candidate.sourceState,
    sidecars: candidate.sidecars,
    root: input.root,
    composition: input.composition,
    sourceStageCommitTicket: null,
    sidecarCandidateAuthority: input.candidateAuthority,
  })
  registrationsBySource.set(candidate.sourceState, registration)
  const registeredAccess = registerPlanASidecarAccess({
    sourceState: candidate.sourceState,
    sidecars: candidate.sidecars,
  })
  if (!registeredAccess) {
    registrationsBySource.delete(candidate.sourceState)
    return false
  }
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
        : registration.sourceStageCommitTicket == null
          || registration.sidecarCandidateAuthority == null
          || !matchesVNextTextBlockUnifiedLayoutSourceStageCommitSidecarCandidateInternalV1({
            ticket: registration.sourceStageCommitTicket,
            previousRoot: registration.root,
            previousSidecars: candidateRecords.get(
              registration.sidecarCandidateAuthority,
            )?.constructionKind === "path-copy"
              ? (candidateRecords.get(
                  registration.sidecarCandidateAuthority,
                ) as PathCopyCandidateRecordInternalV1).previousSidecars
              : registration.sidecars,
            nextSourceState: registration.sourceState,
            nextSidecars: registration.sidecars,
            nextSidecarCandidateAuthority:
              registration.sidecarCandidateAuthority,
            committed: true,
          })
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

  const observedNextItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  for (let index = 0; index < input.nextPhysicalItems.length; index += 1) {
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter: input.workMeter,
      unit: "source-items",
    })
    if (begun.status === "limit-exceeded") {
      return Object.freeze({
        status: "fallback-required" as const,
        cause: "work-limit" as const,
        evaluatorOrProofAuthority: begun.evaluatorAuthority,
        sidecars: null,
        issues: Object.freeze([]) as readonly [],
      })
    }
    if (begun.status !== "permitted") {
      return blocked("Source item emission requires an exact open permit")
    }
    const item = input.nextPhysicalItems[index]
    if (
      item == null
      || !completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit)
    ) return blocked("Source physical item emission was incomplete")
    observedNextItems.push(item)
  }

  const physical = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
    identityRoot: input.previousSidecars.identityRoot,
    orderRoot: input.previousSidecars.orderRoot,
    removedItems: input.removedItems,
    nextPhysicalItems: Object.freeze(observedNextItems),
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
    nextPhysicalItems: observedNextItems,
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
    && canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
      input.nextSourceState,
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
  return registerVNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionInternalV1({
    authority,
    previousRoot: input.previousRoot,
    composition: input.composition,
    previousSidecars: input.previousSidecars,
    nextSourceState: input.nextSourceState,
    nextSidecars: input.nextSidecars,
    candidateAuthority: input.candidateAuthority,
    sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
    workMeter: input.workMeter,
  }) ? authority : null
}

export function registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly sourceStageCommitTicket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1
  },
): boolean {
  if (
    !canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(
      input,
    )
    || !matchesVNextTextBlockUnifiedLayoutSourceStageCommitSidecarCandidateInternalV1({
      ticket: input.sourceStageCommitTicket,
      previousRoot: input.previousRoot,
      previousSidecars: input.previousSidecars,
      nextSourceState: input.nextSourceState,
      nextSidecars: input.nextSidecars,
      nextSidecarCandidateAuthority: input.candidateAuthority,
      committed: false,
    })
  ) return false
  const registration: RegistrationInternalV1 = Object.freeze({
    constructionKind: "source-checkpoint" as const,
    sourceState: input.nextSourceState,
    sidecars: input.nextSidecars,
    root: input.previousRoot,
    composition: input.composition,
    sourceStageCommitTicket: input.sourceStageCommitTicket,
    sidecarCandidateAuthority: input.candidateAuthority,
  })
  registrationsBySource.set(input.nextSourceState, registration)
  if (!registerPlanASidecarAccess({
    sourceState: input.nextSourceState,
    sidecars: input.nextSidecars,
  })) {
    throw new Error("Source sidecar access commit invariant violated")
  }
  consumedCandidates.add(input.candidateAuthority)
  bindVNextTextBlockUnifiedLayoutSourceStageCommitSidecarsInternalV1(
    input.sourceStageCommitTicket,
  )
  return true
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
  return proof != null
    && proof.previousSidecars === input.previousSidecars
    && proof.replacement === input.replacement
    && proof.removedItems === input.removedItems
    && proof.nextPhysicalItems === input.nextPhysicalItems
    && proof.workMeter === input.workMeter
    && proof.requestedCount === input.nextPhysicalItems.length
    && matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterReceiptSnapshotInternalV1({
      meter: input.workMeter,
      snapshotAuthority: proof.receiptSnapshotAuthority,
    })
}
