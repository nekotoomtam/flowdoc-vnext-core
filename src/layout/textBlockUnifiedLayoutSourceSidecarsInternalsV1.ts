import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1,
  VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1,
  type VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
} from "./textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.js"
import {
  insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
} from "./textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
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

interface CandidateRecordInternalV1 {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly completeReceipt: VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1
}

interface RegistrationInternalV1 extends CandidateRecordInternalV1 {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
}

const candidateRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
  CandidateRecordInternalV1
>()
const consumedCandidates = new WeakSet<
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
>()
const registrationsBySource = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  RegistrationInternalV1
>()

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
    || consumedCandidates.has(input.candidateAuthority)
    || input.root.sourceState !== candidate.sourceState
    || resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      input.root,
    ) !== input.composition
    || registrationsBySource.has(candidate.sourceState)
  ) return false
  const registration: RegistrationInternalV1 = Object.freeze({
    ...candidate,
    root: input.root,
    composition: input.composition,
  })
  registrationsBySource.set(candidate.sourceState, registration)
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
    || registration.root.sourceState !== input.sourceState
    || resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      registration.root,
    ) !== input.composition
  ) return null
  return registration.sidecars
}
