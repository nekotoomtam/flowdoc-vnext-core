import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"

export type VNextTextBlockSourcePositionKeyInternalV1 = number

export const VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1 =
  Object.freeze({
    version: 1 as const,
    initialStride: 4_294_967_296 as const,
    representation: "signed-safe-integer" as const,
    batchAllocation: "canonical-even-interior" as const,
  })

const EMPTY_POSITION_KEYS_INTERNAL_V1 = Object.freeze(
  [],
) as readonly []

type PositionKeyAllocationInternalV1 =
  | {
      readonly status: "allocated"
      readonly keys: readonly VNextTextBlockSourcePositionKeyInternalV1[]
    }
  | { readonly status: "key-space-exhausted"; readonly keys: readonly [] }
  | { readonly status: "invalid"; readonly keys: readonly [] }

function runMeteredPositionKeyOperationInternalV1<T>(input: {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: "source-index-entries" | "source-index-comparisons"
  readonly operation: () => T
}):
  | { readonly status: "completed"; readonly value: T }
  | { readonly status: "work-limit"; readonly evaluatorAuthority: object }
  | { readonly status: "invalid" } {
  const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
    meter: input.meter,
    unit: input.unit,
  })
  if (begun.status === "limit-exceeded") {
    return { status: "work-limit", evaluatorAuthority: begun.evaluatorAuthority }
  }
  if (begun.status !== "permitted") return { status: "invalid" }
  sourcePhysicalPayloadObserverForTestInternalV1?.(input.unit)
  const value = input.operation()
  return completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit)
    ? { status: "completed", value }
    : { status: "invalid" }
}

type PositionKeyAllocationDetailedInternalV1 = PositionKeyAllocationInternalV1
  | { readonly status: "work-limit"; readonly evaluatorAuthority: object }

function allocatePositionKeysDetailedInternalV1(input: {
  readonly left: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly right: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly count: number
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): PositionKeyAllocationDetailedInternalV1 {
  const workMeter = input?.workMeter
  if (
    workMeter == null
    || projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(workMeter)
      == null
  ) return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  const count = input.count
  if (!Number.isSafeInteger(count) || count < 0) {
    return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  if (count === 0) {
    return Object.freeze({ status: "allocated", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  const readLeft = runMeteredPositionKeyOperationInternalV1({
    meter: workMeter,
    unit: "source-index-comparisons",
    operation: () => input.left,
  })
  if (readLeft.status === "work-limit") return readLeft
  if (readLeft.status !== "completed") {
    return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  const readRight = runMeteredPositionKeyOperationInternalV1({
    meter: workMeter,
    unit: "source-index-comparisons",
    operation: () => input.right,
  })
  if (readRight.status === "work-limit") return readRight
  if (readRight.status !== "completed") {
    return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  const left = readLeft.value
  const right = readRight.value
  if (
    (left != null && !Number.isSafeInteger(left))
    || (right != null && !Number.isSafeInteger(right))
    || (left == null && right == null)
  ) return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })

  const stride = BigInt(VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1.initialStride)
  const extension = stride * BigInt(count + 1)
  const boundary = runMeteredPositionKeyOperationInternalV1({
    meter: workMeter,
    unit: "source-index-comparisons",
    operation: () => ({
      left: left == null ? BigInt(right!) - extension : BigInt(left),
      right: right == null ? BigInt(left!) + extension : BigInt(right),
    }),
  })
  if (boundary.status === "work-limit") return boundary
  if (boundary.status !== "completed") {
    return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  const leftBoundary = boundary.value.left
  const rightBoundary = boundary.value.right
  const minimum = BigInt(Number.MIN_SAFE_INTEGER)
  const maximum = BigInt(Number.MAX_SAFE_INTEGER)
  if (
    leftBoundary < minimum
    || leftBoundary > maximum
    || rightBoundary < minimum
    || rightBoundary > maximum
    || rightBoundary <= leftBoundary
  ) {
    return Object.freeze({
      status: "key-space-exhausted",
      keys: EMPTY_POSITION_KEYS_INTERNAL_V1 as readonly [],
    })
  }
  const capacity = runMeteredPositionKeyOperationInternalV1({
    meter: workMeter,
    unit: "source-index-comparisons",
    operation: () => rightBoundary - leftBoundary - 1n >= BigInt(count),
  })
  if (capacity.status === "work-limit") return capacity
  if (capacity.status !== "completed") {
    return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
  }
  if (!capacity.value) {
    return Object.freeze({
      status: "key-space-exhausted",
      keys: EMPTY_POSITION_KEYS_INTERNAL_V1 as readonly [],
    })
  }

  const keys: VNextTextBlockSourcePositionKeyInternalV1[] = []
  let previous = leftBoundary
  const distance = rightBoundary - leftBoundary
  for (let index = 0; index < count; index += 1) {
    const compared = runMeteredPositionKeyOperationInternalV1({
      meter: workMeter,
      unit: "source-index-comparisons",
      operation: () => {
        const candidate = leftBoundary
          + distance * BigInt(index + 1) / BigInt(count + 1)
        return {
          candidate,
          valid: candidate > leftBoundary
            && candidate < rightBoundary
            && candidate > previous
            && candidate >= minimum
            && candidate <= maximum,
        }
      },
    })
    if (compared.status === "work-limit") return compared
    if (compared.status !== "completed") {
      return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
    }
    if (!compared.value.valid) {
      return Object.freeze({
        status: "key-space-exhausted",
        keys: EMPTY_POSITION_KEYS_INTERNAL_V1 as readonly [],
      })
    }
    const emitted = runMeteredPositionKeyOperationInternalV1({
      meter: workMeter,
      unit: "source-index-entries",
      operation: () => Number(compared.value.candidate),
    })
    if (emitted.status === "work-limit") return emitted
    if (emitted.status !== "completed" || !Number.isSafeInteger(emitted.value)) {
      return Object.freeze({ status: "invalid", keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
    }
    keys.push(emitted.value)
    previous = compared.value.candidate
  }
  return Object.freeze({ status: "allocated", keys: Object.freeze(keys) })
}

export function allocateVNextTextBlockSourcePositionKeysInternalV1(input: {
  readonly left: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly right: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly count: number
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): PositionKeyAllocationInternalV1 {
  const result = allocatePositionKeysDetailedInternalV1(input)
  return result.status === "work-limit"
    ? Object.freeze({ status: "invalid" as const, keys: EMPTY_POSITION_KEYS_INTERNAL_V1 })
    : result
}

export interface VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 {
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly positionKey: VNextTextBlockSourcePositionKeyInternalV1
  readonly renderedUtf16Length: number
}

let resolveExactPhysicalEntryForSourceItemInternalV1: ((
  item: VNextTextBlockUnifiedLayoutSourceItemV1,
) => VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null) | null = null

/** One-time task-specific binding; exact pair storage remains private to Sidecars. */
export function bindVNextTextBlockUnifiedLayoutSourceExactPhysicalEntryResolverInternalV1(
  resolver: NonNullable<typeof resolveExactPhysicalEntryForSourceItemInternalV1>,
): boolean {
  if (
    resolveExactPhysicalEntryForSourceItemInternalV1 != null
    || typeof resolver !== "function"
  ) return false
  resolveExactPhysicalEntryForSourceItemInternalV1 = resolver
  return true
}

interface IdentityKeyInternalV1 {
  readonly inlineId: string
  readonly kindOrdinal: number
  readonly positionKey: number
}

interface IdentityNodeBaseInternalV1 {
  readonly height: number
  readonly entryCount: number
  readonly firstKey: IdentityKeyInternalV1
  readonly lastKey: IdentityKeyInternalV1
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1
  extends IdentityNodeBaseInternalV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
}

export interface VNextTextBlockUnifiedLayoutSourceIdentityIndexBranchInternalV1
  extends IdentityNodeBaseInternalV1 {
  readonly nodeKind: "branch"
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1[]
}

export type VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 =
  | VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1
  | VNextTextBlockUnifiedLayoutSourceIdentityIndexBranchInternalV1

interface OrderNodeBaseInternalV1 {
  readonly height: number
  readonly itemCount: number
  readonly renderedUtf16Length: number
  readonly firstPositionKey: number
  readonly lastPositionKey: number
  readonly firstEntry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly lastEntry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceOrderIndexLeafInternalV1
  extends OrderNodeBaseInternalV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
}

export interface VNextTextBlockUnifiedLayoutSourceOrderIndexBranchInternalV1
  extends OrderNodeBaseInternalV1 {
  readonly nodeKind: "branch"
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1[]
}

export type VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 =
  | VNextTextBlockUnifiedLayoutSourceOrderIndexLeafInternalV1
  | VNextTextBlockUnifiedLayoutSourceOrderIndexBranchInternalV1

type Observer = (
  unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
) => void

const KIND_ORDINAL = Object.freeze({
  text: 0,
  "resolved-field": 1,
  "generated-page-number": 2,
  "hard-break": 3,
  "inline-image": 4,
} as const)

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function identityKey(
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
): IdentityKeyInternalV1 {
  return Object.freeze({
    inlineId: entry.item.inlineId,
    kindOrdinal: KIND_ORDINAL[entry.item.kind],
    positionKey: entry.positionKey,
  })
}

function compareIdentityKeys(
  left: IdentityKeyInternalV1,
  right: IdentityKeyInternalV1,
  observe?: Observer,
): number {
  observe?.("source-index-comparisons")
  const inlineComparison = left.inlineId === right.inlineId
    ? 0
    : left.inlineId < right.inlineId ? -1 : 1
  if (inlineComparison !== 0) return inlineComparison
  if (left.kindOrdinal !== right.kindOrdinal) {
    return left.kindOrdinal - right.kindOrdinal
  }
  return left.positionKey - right.positionKey
}

function physicalFacts(
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
) {
  return {
    itemFingerprint: entry.item.fingerprint,
    positionKey: entry.positionKey,
    renderedUtf16Length: entry.renderedUtf16Length,
  }
}

function identityLeaf(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1 {
  observe?.("source-index-nodes")
  const frozenEntries = Object.freeze([...entries])
  const firstKey = identityKey(frozenEntries[0]!)
  const lastKey = identityKey(frozenEntries[frozenEntries.length - 1]!)
  const facts = {
    nodeKind: "leaf" as const,
    height: 0 as const,
    entryCount: frozenEntries.length,
    firstKey,
    lastKey,
    entries: frozenEntries.map(physicalFacts),
  }
  return Object.freeze({ ...facts, entries: frozenEntries, fingerprint: fingerprint(facts) })
}

function identityBranch(
  children: readonly VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceIdentityIndexBranchInternalV1 {
  observe?.("source-index-nodes")
  const frozenChildren = Object.freeze([...children])
  const facts = {
    nodeKind: "branch" as const,
    height: frozenChildren[0]!.height + 1,
    entryCount: frozenChildren.reduce((sum, child) => sum + child.entryCount, 0),
    firstKey: frozenChildren[0]!.firstKey,
    lastKey: frozenChildren[frozenChildren.length - 1]!.lastKey,
    children: frozenChildren.map((child) => child.fingerprint),
  }
  return Object.freeze({ ...facts, children: frozenChildren, fingerprint: fingerprint(facts) })
}

function orderLeaf(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceOrderIndexLeafInternalV1 {
  observe?.("source-index-nodes")
  const frozenEntries = Object.freeze([...entries])
  const facts = {
    nodeKind: "leaf" as const,
    height: 0 as const,
    itemCount: frozenEntries.length,
    renderedUtf16Length: frozenEntries.reduce(
      (sum, entry) => sum + entry.renderedUtf16Length,
      0,
    ),
    firstPositionKey: frozenEntries[0]!.positionKey,
    lastPositionKey: frozenEntries[frozenEntries.length - 1]!.positionKey,
    entries: frozenEntries.map(physicalFacts),
  }
  if (!Number.isSafeInteger(facts.renderedUtf16Length)) {
    throw new RangeError("Source order rendered length must stay safe")
  }
  return Object.freeze({
    ...facts,
    entries: frozenEntries,
    firstEntry: frozenEntries[0]!,
    lastEntry: frozenEntries[frozenEntries.length - 1]!,
    fingerprint: fingerprint(facts),
  })
}

function orderBranch(
  children: readonly VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceOrderIndexBranchInternalV1 {
  observe?.("source-index-nodes")
  const frozenChildren = Object.freeze([...children])
  const facts = {
    nodeKind: "branch" as const,
    height: frozenChildren[0]!.height + 1,
    itemCount: frozenChildren.reduce((sum, child) => sum + child.itemCount, 0),
    renderedUtf16Length: frozenChildren.reduce(
      (sum, child) => sum + child.renderedUtf16Length,
      0,
    ),
    firstPositionKey: frozenChildren[0]!.firstPositionKey,
    lastPositionKey: frozenChildren[frozenChildren.length - 1]!.lastPositionKey,
    children: frozenChildren.map((child) => child.fingerprint),
  }
  if (
    !Number.isSafeInteger(facts.itemCount)
    || !Number.isSafeInteger(facts.renderedUtf16Length)
  ) throw new RangeError("Source order summaries must stay safe")
  return Object.freeze({
    ...facts,
    children: frozenChildren,
    firstEntry: frozenChildren[0]!.firstEntry,
    lastEntry: frozenChildren[frozenChildren.length - 1]!.lastEntry,
    fingerprint: fingerprint(facts),
  })
}

type IdentityInsert = readonly [
  VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null,
]

function insertIdentity(
  node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
  observe?: Observer,
): IdentityInsert {
  observe?.("source-index-nodes")
  const key = identityKey(entry)
  if (node.nodeKind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let inserted = false
    for (const current of node.entries) {
      if (!inserted && compareIdentityKeys(key, identityKey(current), observe) < 0) {
        entries.push(entry)
        inserted = true
      }
      entries.push(current)
    }
    if (!inserted) entries.push(entry)
    if (entries.length <= 8) return [identityLeaf(entries, observe), null]
    return [
      identityLeaf(entries.slice(0, 4), observe),
      identityLeaf(entries.slice(4), observe),
    ]
  }
  let childIndex = node.children.length - 1
  for (let index = 0; index < node.children.length; index += 1) {
    if (compareIdentityKeys(key, node.children[index]!.lastKey, observe) <= 0) {
      childIndex = index
      break
    }
  }
  const [left, right] = insertIdentity(node.children[childIndex]!, entry, observe)
  const children = [...node.children]
  children.splice(childIndex, 1, left, ...(right == null ? [] : [right]))
  if (children.length <= 8) return [identityBranch(children, observe), null]
  return [
    identityBranch(children.slice(0, 4), observe),
    identityBranch(children.slice(4), observe),
  ]
}

type OrderInsert = readonly [
  VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null,
]

function appendOrder(
  node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
  observe?: Observer,
): OrderInsert {
  observe?.("source-index-nodes")
  observe?.("source-index-comparisons")
  if (entry.positionKey <= node.lastPositionKey) {
    throw new RangeError("complete Source order keys must be strictly monotonic")
  }
  if (node.nodeKind === "leaf") {
    const entries = [...node.entries, entry]
    if (entries.length <= 8) return [orderLeaf(entries, observe), null]
    return [orderLeaf(entries.slice(0, 4), observe), orderLeaf(entries.slice(4), observe)]
  }
  const lastIndex = node.children.length - 1
  const [left, right] = appendOrder(node.children[lastIndex]!, entry, observe)
  const children = [...node.children]
  children.splice(lastIndex, 1, left, ...(right == null ? [] : [right]))
  if (children.length <= 8) return [orderBranch(children, observe), null]
  return [orderBranch(children.slice(0, 4), observe), orderBranch(children.slice(4), observe)]
}

export function lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly inlineId: string
  readonly observeBeforeOperation?: Observer
}): readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] {
  const output: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  ): void => {
    input.observeBeforeOperation?.("source-index-nodes")
    if (node.nodeKind === "leaf") {
      for (const entry of node.entries) {
        input.observeBeforeOperation?.("source-index-comparisons")
        if (entry.item.inlineId === input.inlineId) output.push(entry)
      }
      return
    }
    for (const child of node.children) {
      input.observeBeforeOperation?.("source-index-comparisons")
      const afterFirst = child.firstKey.inlineId <= input.inlineId
      input.observeBeforeOperation?.("source-index-comparisons")
      if (
        afterFirst
        && child.lastKey.inlineId >= input.inlineId
      ) visit(child)
    }
  }
  if (input.root != null) visit(input.root)
  return Object.freeze(output)
}

function firstIdentityEntryAtOrAfterInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  readonly key: IdentityKeyInternalV1
  readonly observeBeforeOperation?: Observer
}): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null {
  let node = input.root
  while (true) {
    input.observeBeforeOperation?.("source-index-nodes")
    if (node.nodeKind === "leaf") {
      for (const candidate of node.entries) {
        if (
          compareIdentityKeys(
            identityKey(candidate),
            input.key,
            input.observeBeforeOperation,
          ) >= 0
        ) return candidate
      }
      return null
    }
    let next: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null = null
    for (const child of node.children) {
      if (compareIdentityKeys(child.lastKey, input.key, input.observeBeforeOperation) >= 0) {
        next = child
        break
      }
    }
    if (next == null) return null
    node = next
  }
}

export function insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1(input: {
  readonly identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly observeBeforeOperation?: Observer
}):
  | {
      readonly status: "inserted"
      readonly identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
      readonly orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
    }
  | { readonly status: "blocked" } {
  const { entry, observeBeforeOperation: observe } = input
  if (
    !Number.isSafeInteger(entry.positionKey)
    || !Number.isSafeInteger(entry.renderedUtf16Length)
    || entry.renderedUtf16Length < 0
    || entry.renderedUtf16Length !== entry.item.renderedUtf16Length
  ) return Object.freeze({ status: "blocked" })
  observe?.("source-index-entries")
  if (input.identityRoot != null) {
    const firstDisallowedKindOrdinal = entry.item.kind === "text" ? 1 : 0
    const conflict = firstIdentityEntryAtOrAfterInternalV1({
      root: input.identityRoot,
      key: Object.freeze({
        inlineId: entry.item.inlineId,
        kindOrdinal: firstDisallowedKindOrdinal,
        positionKey: Number.MIN_SAFE_INTEGER,
      }),
      observeBeforeOperation: observe,
    })
    if (conflict?.item.inlineId === entry.item.inlineId) {
      return Object.freeze({ status: "blocked" })
    }
  }
  try {
    let identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
    if (input.identityRoot == null) {
      identityRoot = identityLeaf([entry], observe)
    } else {
      const [left, right] = insertIdentity(input.identityRoot, entry, observe)
      identityRoot = right == null ? left : identityBranch([left, right], observe)
    }
    let orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
    if (input.orderRoot == null) {
      orderRoot = orderLeaf([entry], observe)
    } else {
      const [left, right] = appendOrder(input.orderRoot, entry, observe)
      orderRoot = right == null ? left : orderBranch([left, right], observe)
    }
    return Object.freeze({ status: "inserted", identityRoot, orderRoot })
  } catch {
    return Object.freeze({ status: "blocked" })
  }
}

class SourcePhysicalPathCopyStopInternalV1 {
  readonly kind: "work-limit" | "invalid"
  readonly evaluatorAuthority: object | null

  constructor(kind: "work-limit" | "invalid", evaluatorAuthority: object | null = null) {
    this.kind = kind
    this.evaluatorAuthority = evaluatorAuthority
  }
}

let sourcePhysicalPayloadObserverForTestInternalV1:
  | ((unit: "source-index-nodes" | "source-index-entries" | "source-index-comparisons") => void)
  | null = null

const sourcePhysicalEntryReadViewsForTest = new WeakMap<object, object>()

type SourcePhysicalLocalArrayKindForTestInternalV1 =
  | "combine-groups"
  | "combine-group"
  | "identity-leaf-entries"
  | "identity-leaf-snapshots"
  | "order-leaf-entries"
  | "order-leaf-snapshots"
  | "identity-insertion-entries"
  | "order-insertion-entries"
  | "identity-deletion-entries"
  | "order-deletion-entries"
  | "identity-singleton-entries"
  | "order-singleton-entries"
  | "coordinator-next-items"
  | "coordinator-original-removed-entries"
  | "coordinator-removed-entries"
  | "coordinator-new-entries"

export interface VNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewRegistrationForTestInternalV1 {
  readonly authority: object
  readonly createReadView: (input: Readonly<{
    readonly kind: SourcePhysicalLocalArrayKindForTestInternalV1
    readonly raw: readonly object[]
  }>) => readonly object[]
}

let sourcePhysicalLocalArrayReadViewRegistrationForTest:
  VNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewRegistrationForTestInternalV1
  | null = null

export function registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
  registration:
    VNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewRegistrationForTestInternalV1,
): boolean {
  if (
    registration.authority == null
    || typeof registration.authority !== "object"
    || sourcePhysicalLocalArrayReadViewRegistrationForTest != null
  ) return false
  sourcePhysicalLocalArrayReadViewRegistrationForTest = registration
  return true
}

export function removeVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
  registration:
    VNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewRegistrationForTestInternalV1,
): boolean {
  if (sourcePhysicalLocalArrayReadViewRegistrationForTest !== registration) return false
  sourcePhysicalLocalArrayReadViewRegistrationForTest = null
  return true
}

function sourcePhysicalLocalArrayReadViewInternalV1<
  T extends readonly object[],
>(kind: SourcePhysicalLocalArrayKindForTestInternalV1, raw: T): T {
  const registration = sourcePhysicalLocalArrayReadViewRegistrationForTest
  return registration == null
    ? raw
    : registration.createReadView(Object.freeze({ kind, raw })) as T
}

/** Test-only hostile read view; exact raw entry identity remains authoritative. */
export function registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
  input: {
    readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
    readonly readView: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  },
): boolean {
  if (input.entry === input.readView || sourcePhysicalEntryReadViewsForTest.has(input.entry)) {
    return false
  }
  sourcePhysicalEntryReadViewsForTest.set(input.entry, input.readView)
  return true
}

export function removeVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
  input: {
    readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
    readonly readView: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  },
): boolean {
  if (sourcePhysicalEntryReadViewsForTest.get(input.entry) !== input.readView) return false
  sourcePhysicalEntryReadViewsForTest.delete(input.entry)
  return true
}

function sourcePhysicalEntryReadViewInternalV1(
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 {
  return (sourcePhysicalEntryReadViewsForTest.get(entry) ?? entry) as
    VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
}

export function setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1(
  observer: typeof sourcePhysicalPayloadObserverForTestInternalV1,
): void {
  sourcePhysicalPayloadObserverForTestInternalV1 = observer
}

function meteredPhysicalOperationInternalV1<T>(input: {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: "source-index-nodes" | "source-index-entries" | "source-index-comparisons"
  readonly operation: () => T
}): T {
  const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
    meter: input.meter,
    unit: input.unit,
  })
  if (begun.status === "limit-exceeded") {
    throw new SourcePhysicalPathCopyStopInternalV1(
      "work-limit",
      begun.evaluatorAuthority,
    )
  }
  if (begun.status !== "permitted") {
    throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  }
  sourcePhysicalPayloadObserverForTestInternalV1?.(input.unit)
  const value = input.operation()
  if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit)) {
    throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  }
  return value
}

function sourcePhysicalLocalArrayLengthMeteredInternalV1(
  array: readonly object[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): number {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => array.length,
  })
}

function sourcePhysicalLocalArrayItemMeteredInternalV1<T extends object>(
  array: readonly T[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): T {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => {
      const value = array[index]
      if (value == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
      return value
    },
  })
}

function emitSourcePhysicalLocalArrayItemMeteredInternalV1<T extends object>(
  output: T[],
  value: T,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): void {
  meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => { output.push(value) },
  })
}

function compareIdentityKeysMeteredInternalV1(
  left: IdentityKeyInternalV1,
  right: IdentityKeyInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): number {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-comparisons",
    operation: () => {
      if (left.inlineId !== right.inlineId) return left.inlineId < right.inlineId ? -1 : 1
      if (left.kindOrdinal !== right.kindOrdinal) return left.kindOrdinal - right.kindOrdinal
      return left.positionKey - right.positionKey
    },
  })
}

function identityKeyMeteredInternalV1(
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): IdentityKeyInternalV1 {
  const facts = physicalEntryFactsMeteredInternalV1(entry, meter)
  return Object.freeze({
    inlineId: facts.inlineId,
    kindOrdinal: facts.kindOrdinal,
    positionKey: facts.positionKey,
  })
}

interface PhysicalEntryFactsMeteredInternalV1 {
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly inlineId: string
  readonly kind: VNextTextBlockUnifiedLayoutSourceItemV1["kind"]
  readonly kindOrdinal: number
  readonly itemFingerprint: string
  readonly positionKey: number
  readonly renderedUtf16Length: number
}

function physicalEntryFactsAtMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): {
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly positionKey: number
  readonly renderedUtf16Length: number
} & PhysicalEntryFactsMeteredInternalV1 {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => {
      const entry = entries[index]
      if (entry == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
      const entryReadView = sourcePhysicalEntryReadViewInternalV1(entry)
      const item = entryReadView.item
      return {
        entry,
        item,
        inlineId: item.inlineId,
        kind: item.kind,
        kindOrdinal: KIND_ORDINAL[item.kind],
        itemFingerprint: item.fingerprint,
        positionKey: entryReadView.positionKey,
        renderedUtf16Length: entryReadView.renderedUtf16Length,
      }
    },
  })
}

function physicalEntryFactsMeteredInternalV1(
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): PhysicalEntryFactsMeteredInternalV1 {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => {
      const entryReadView = sourcePhysicalEntryReadViewInternalV1(entry)
      const item = entryReadView.item
      return {
        entry,
        item,
        inlineId: item.inlineId,
        kind: item.kind,
        kindOrdinal: KIND_ORDINAL[item.kind],
        itemFingerprint: item.fingerprint,
        positionKey: entryReadView.positionKey,
        renderedUtf16Length: entryReadView.renderedUtf16Length,
      }
    },
  })
}

function emitPhysicalEntryMeteredInternalV1(
  output: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): void {
  meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-entries",
    operation: () => { output.push(entry) },
  })
}

function copyPhysicalEntriesMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  start: number,
  end: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] {
  const output: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  for (let index = start; index < end; index += 1) {
    emitPhysicalEntryMeteredInternalV1(
      output,
      physicalEntryFactsAtMeteredInternalV1(entries, index, meter).entry,
      meter,
    )
  }
  return output
}

function combinePhysicalEntriesMeteredInternalV1(
  groups: readonly (readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[])[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] {
  const output: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const groupsReadView = sourcePhysicalLocalArrayReadViewInternalV1(
    "combine-groups",
    groups,
  )
  const groupCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
    groupsReadView,
    meter,
  )
  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const group = sourcePhysicalLocalArrayItemMeteredInternalV1(
      groupsReadView,
      groupIndex,
      meter,
    )
    const groupReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "combine-group",
      group,
    )
    const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      groupReadView,
      meter,
    )
    for (let index = 0; index < entryCount; index += 1) {
      emitPhysicalEntryMeteredInternalV1(
        output,
        sourcePhysicalLocalArrayItemMeteredInternalV1(groupReadView, index, meter),
        meter,
      )
    }
  }
  return output
}

function identityNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
) {
  const nodePayload = meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => node.nodeKind === "leaf"
      ? { kind: "leaf" as const }
      : {
          kind: "branch" as const,
          children: node.children,
          occupancy: node.children.length,
        },
  })
  return nodePayload.kind === "branch"
    ? nodePayload
    : meteredPhysicalOperationInternalV1({
        meter,
        unit: "source-index-entries",
        operation: () => {
          const leaf = node as VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1
          return {
            kind: "leaf" as const,
            entries: leaf.entries,
            occupancy: leaf.entries.length,
          }
        },
      })
}

function orderNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
) {
  const nodePayload = meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => node.nodeKind === "leaf"
      ? { kind: "leaf" as const }
      : {
          kind: "branch" as const,
          children: node.children,
          occupancy: node.children.length,
        },
  })
  return nodePayload.kind === "branch"
    ? nodePayload
    : meteredPhysicalOperationInternalV1({
        meter,
        unit: "source-index-entries",
        operation: () => {
          const leaf = node as VNextTextBlockUnifiedLayoutSourceOrderIndexLeafInternalV1
          return {
            kind: "leaf" as const,
            entries: leaf.entries,
            occupancy: leaf.entries.length,
          }
        },
      })
}

function identityLeafMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1 {
  const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
    "identity-leaf-entries",
    entries,
  )
  const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
    entriesReadView,
    meter,
  )
  const snapshots: PhysicalEntryFactsMeteredInternalV1[] = []
  for (let index = 0; index < entryCount; index += 1) {
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      snapshots,
      physicalEntryFactsAtMeteredInternalV1(entriesReadView, index, meter),
      meter,
    )
  }
  const snapshotsReadView = sourcePhysicalLocalArrayReadViewInternalV1(
    "identity-leaf-snapshots",
    snapshots,
  )
  const snapshotCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
    snapshotsReadView,
    meter,
  )
  const frozenEntriesOutput: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const entryFactsOutput: Array<Readonly<{
    readonly itemFingerprint: string
    readonly positionKey: number
    readonly renderedUtf16Length: number
  }>> = []
  let firstKey: IdentityKeyInternalV1 | null = null
  let lastKey: IdentityKeyInternalV1 | null = null
  for (let index = 0; index < snapshotCount; index += 1) {
    const payload = meteredPhysicalOperationInternalV1({
      meter,
      unit: "source-index-entries",
      operation: () => {
        const facts = snapshotsReadView[index]
        if (facts == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
        return {
          entry: facts.entry,
          key: Object.freeze({
            inlineId: facts.inlineId,
            kindOrdinal: facts.kindOrdinal,
            positionKey: facts.positionKey,
          }),
          entryFacts: Object.freeze({
            itemFingerprint: facts.itemFingerprint,
            positionKey: facts.positionKey,
            renderedUtf16Length: facts.renderedUtf16Length,
          }),
        }
      },
    })
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      frozenEntriesOutput,
      payload.entry,
      meter,
    )
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      entryFactsOutput,
      payload.entryFacts,
      meter,
    )
    firstKey ??= payload.key
    lastKey = payload.key
  }
  if (firstKey == null || lastKey == null) {
    throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  }
  const frozenEntries = Object.freeze(frozenEntriesOutput)
  const entryFacts = Object.freeze(entryFactsOutput)
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => {
      const facts = {
        nodeKind: "leaf" as const,
        firstKey,
        lastKey,
        entryCount: snapshotCount,
        height: 0 as const,
        entries: entryFacts,
      }
      return Object.freeze({
        ...facts,
        entries: frozenEntries,
        fingerprint: fingerprint(facts),
      })
    },
  })
}

function identityBranchMeteredInternalV1(
  children: readonly VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceIdentityIndexBranchInternalV1 {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => identityBranch(children),
  })
}

function orderLeafMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceOrderIndexLeafInternalV1 {
  const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
    "order-leaf-entries",
    entries,
  )
  const itemCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
    entriesReadView,
    meter,
  )
  const snapshots: PhysicalEntryFactsMeteredInternalV1[] = []
  for (let index = 0; index < itemCount; index += 1) {
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      snapshots,
      physicalEntryFactsAtMeteredInternalV1(entriesReadView, index, meter),
      meter,
    )
  }
  const snapshotsReadView = sourcePhysicalLocalArrayReadViewInternalV1(
    "order-leaf-snapshots",
    snapshots,
  )
  const snapshotCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
    snapshotsReadView,
    meter,
  )
  const frozenEntriesOutput: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const entryFactsOutput: Array<Readonly<{
    readonly itemFingerprint: string
    readonly positionKey: number
    readonly renderedUtf16Length: number
  }>> = []
  let firstPositionKey: number | null = null
  let lastPositionKey: number | null = null
  let firstEntry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null = null
  let lastEntry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null = null
  let renderedUtf16Length = 0
  for (let index = 0; index < snapshotCount; index += 1) {
    const payload = meteredPhysicalOperationInternalV1({
      meter,
      unit: "source-index-entries",
      operation: () => {
        const facts = snapshotsReadView[index]
        if (facts == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
        return {
          entry: facts.entry,
          positionKey: facts.positionKey,
          renderedUtf16Length: facts.renderedUtf16Length,
          entryFacts: Object.freeze({
            itemFingerprint: facts.itemFingerprint,
            positionKey: facts.positionKey,
            renderedUtf16Length: facts.renderedUtf16Length,
          }),
        }
      },
    })
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      frozenEntriesOutput,
      payload.entry,
      meter,
    )
    emitSourcePhysicalLocalArrayItemMeteredInternalV1(
      entryFactsOutput,
      payload.entryFacts,
      meter,
    )
    firstPositionKey ??= payload.positionKey
    firstEntry ??= payload.entry
    lastPositionKey = payload.positionKey
    lastEntry = payload.entry
    renderedUtf16Length += payload.renderedUtf16Length
  }
  if (
    firstPositionKey == null
    || lastPositionKey == null
    || firstEntry == null
    || lastEntry == null
  ) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  const frozenEntries = Object.freeze(frozenEntriesOutput)
  const entryFacts = Object.freeze(entryFactsOutput)
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => {
      const facts = {
        nodeKind: "leaf" as const,
        itemCount: snapshotCount,
        renderedUtf16Length,
        height: 0 as const,
        firstPositionKey,
        lastPositionKey,
        entries: entryFacts,
      }
      return Object.freeze({
        ...facts,
        firstEntry,
        lastEntry,
        entries: frozenEntries,
        fingerprint: fingerprint(facts),
      })
    },
  })
}

function orderBranchMeteredInternalV1(
  children: readonly VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceOrderIndexBranchInternalV1 {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => orderBranch(children),
  })
}

function firstIdentityEntryAtOrAfterMeteredInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly key: IdentityKeyInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): PhysicalEntryFactsMeteredInternalV1 | null {
  if (input.root == null) return null
  let node = input.root
  while (true) {
    const payload = identityNodePayloadMeteredInternalV1(node, input.meter)
    if (payload.kind === "leaf") {
      for (let index = 0; index < payload.occupancy; index += 1) {
        const facts = physicalEntryFactsAtMeteredInternalV1(
          payload.entries,
          index,
          input.meter,
        )
        const relation = compareIdentityKeysMeteredInternalV1(
          Object.freeze({
            inlineId: facts.inlineId,
            kindOrdinal: facts.kindOrdinal,
            positionKey: facts.positionKey,
          }),
          input.key,
          input.meter,
        )
        if (relation >= 0) return facts
      }
      return null
    }
    let selected:
      VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null = null
    for (let index = 0; index < payload.occupancy; index += 1) {
      const child = payload.children[index]!
      const lastKey = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => child.lastKey,
      })
      if (compareIdentityKeysMeteredInternalV1(
        input.key,
        lastKey,
        input.meter,
      ) <= 0) {
        selected = child
        break
      }
    }
    if (selected == null) return null
    node = selected
  }
}

function lookupExactIdentityEntryMeteredInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null {
  const authority = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-entries",
    operation: () => {
      const entry = resolveExactPhysicalEntryForSourceItemInternalV1?.(
        input.item,
      ) ?? null
      return entry == null
        ? null
        : (() => {
            const item = entry.item
            return {
              entry,
              item,
              key: Object.freeze({
                inlineId: item.inlineId,
                kindOrdinal: KIND_ORDINAL[item.kind],
                positionKey: entry.positionKey,
              }),
            }
          })()
    },
  })
  if (authority == null) return null
  if (!meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-comparisons",
    operation: () => authority.item === input.item,
  })) return null

  let node = input.root
  while (true) {
    const payload = identityNodePayloadMeteredInternalV1(node, input.meter)
    if (payload.kind === "leaf") {
      for (let index = 0; index < payload.occupancy; index += 1) {
        const facts = physicalEntryFactsAtMeteredInternalV1(
          payload.entries,
          index,
          input.meter,
        )
        const relation = compareIdentityKeysMeteredInternalV1(
          Object.freeze({
            inlineId: facts.inlineId,
            kindOrdinal: facts.kindOrdinal,
            positionKey: facts.positionKey,
          }),
          authority.key,
          input.meter,
        )
        if (relation > 0) return null
        if (
          relation === 0
          && meteredPhysicalOperationInternalV1({
            meter: input.meter,
            unit: "source-index-comparisons",
            operation: () => facts.item === input.item
              && facts.entry === authority.entry,
          })
        ) return facts.entry
      }
      return null
    }
    let selected:
      VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null = null
    for (let index = 0; index < payload.occupancy; index += 1) {
      const child = payload.children[index]!
      const lastKey = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => child.lastKey,
      })
      if (compareIdentityKeysMeteredInternalV1(
        authority.key,
        lastKey,
        input.meter,
      ) <= 0) {
        selected = child
        break
      }
    }
    if (selected == null) return null
    node = selected
  }
}

function predecessorOrderEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  readonly positionKey: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null {
  const payload = orderNodePayloadMeteredInternalV1(input.node, input.meter)
  if (payload.kind === "leaf") {
    for (let index = payload.occupancy - 1; index >= 0; index -= 1) {
      const facts = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      )
      if (meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => facts.positionKey < input.positionKey,
      })) return facts.entry
    }
    return null
  }
  for (let index = payload.children.length - 1; index >= 0; index -= 1) {
    const child = payload.children[index]!
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => child.firstPositionKey < input.positionKey,
    })) {
      const found = predecessorOrderEntryMeteredInternalV1({
        node: child,
        positionKey: input.positionKey,
        meter: input.meter,
      })
      if (found != null) return found
    }
  }
  return null
}

function successorOrderEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  readonly positionKey: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null {
  const payload = orderNodePayloadMeteredInternalV1(input.node, input.meter)
  if (payload.kind === "leaf") {
    for (let index = 0; index < payload.occupancy; index += 1) {
      const facts = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      )
      if (meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => facts.positionKey > input.positionKey,
      })) return facts.entry
    }
    return null
  }
  for (const child of payload.children) {
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => child.lastPositionKey > input.positionKey,
    })) {
      const found = successorOrderEntryMeteredInternalV1({
        node: child,
        positionKey: input.positionKey,
        meter: input.meter,
      })
      if (found != null) return found
    }
  }
  return null
}

function rebalanceIdentityChildMeteredInternalV1(input: {
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1[]
  readonly childIndex: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1[] {
  const children = [...input.children]
  const child = children[input.childIndex]
  if (child == null) return children
  const childPayload = identityNodePayloadMeteredInternalV1(child, input.meter)
  if (childPayload.occupancy >= 4) return children
  const left = children[input.childIndex - 1]
  const leftPayload = left == null
    ? null
    : identityNodePayloadMeteredInternalV1(left, input.meter)
  if (leftPayload != null && leftPayload.occupancy > 4) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      const retainedLeft = copyPhysicalEntriesMeteredInternalV1(
        payload.entries, 0, payload.occupancy - 1, input.meter,
      )
      const borrowed = physicalEntryFactsAtMeteredInternalV1(
        payload.entries, payload.occupancy - 1, input.meter,
      ).entry
      const childEntries = copyPhysicalEntriesMeteredInternalV1(
        childPayload.entries, 0, childPayload.occupancy, input.meter,
      )
      children.splice(input.childIndex - 1, 2,
        identityLeafMeteredInternalV1(retainedLeft, input.meter),
        identityLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1(
            [[borrowed], childEntries], input.meter,
          ),
          input.meter,
        ))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex - 1, 2,
        identityBranchMeteredInternalV1(payload.children.slice(0, -1), input.meter),
        identityBranchMeteredInternalV1([
          payload.children.at(-1)!,
          ...childPayload.children,
        ], input.meter))
    }
    return children
  }
  const right = children[input.childIndex + 1]
  const rightPayload = right == null
    ? null
    : identityNodePayloadMeteredInternalV1(right, input.meter)
  if (rightPayload != null && rightPayload.occupancy > 4) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      const childEntries = copyPhysicalEntriesMeteredInternalV1(
        childPayload.entries, 0, childPayload.occupancy, input.meter,
      )
      const borrowed = physicalEntryFactsAtMeteredInternalV1(
        payload.entries, 0, input.meter,
      ).entry
      const retainedRight = copyPhysicalEntriesMeteredInternalV1(
        payload.entries, 1, payload.occupancy, input.meter,
      )
      children.splice(input.childIndex, 2,
        identityLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1(
            [childEntries, [borrowed]], input.meter,
          ),
          input.meter,
        ),
        identityLeafMeteredInternalV1(retainedRight, input.meter))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex, 2,
        identityBranchMeteredInternalV1([
          ...childPayload.children,
          payload.children[0]!,
        ], input.meter),
        identityBranchMeteredInternalV1(payload.children.slice(1), input.meter))
    }
    return children
  }
  if (leftPayload != null) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? identityLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1([
            copyPhysicalEntriesMeteredInternalV1(
              payload.entries, 0, payload.occupancy, input.meter,
            ),
            copyPhysicalEntriesMeteredInternalV1(
              childPayload.entries, 0, childPayload.occupancy, input.meter,
            ),
          ], input.meter),
          input.meter,
        )
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? identityBranchMeteredInternalV1([
            ...payload.children,
            ...childPayload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    children.splice(input.childIndex - 1, 2, merged)
    return children
  }
  if (rightPayload != null) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? identityLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1([
            copyPhysicalEntriesMeteredInternalV1(
              childPayload.entries, 0, childPayload.occupancy, input.meter,
            ),
            copyPhysicalEntriesMeteredInternalV1(
              payload.entries, 0, payload.occupancy, input.meter,
            ),
          ], input.meter),
          input.meter,
        )
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? identityBranchMeteredInternalV1([
            ...childPayload.children,
            ...payload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    children.splice(input.childIndex, 2, merged)
    return children
  }
  return children
}

function deleteIdentityEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly isRoot: boolean
}): VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null {
  const key = identityKeyMeteredInternalV1(input.entry, input.meter)
  const payload = identityNodePayloadMeteredInternalV1(input.node, input.meter)
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "identity-deletion-entries",
      entries,
    )
    let removed = false
    for (let index = 0; index < payload.occupancy; index += 1) {
      const current = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      ).entry
      const equal = compareIdentityKeysMeteredInternalV1(
        identityKeyMeteredInternalV1(current, input.meter),
        key,
        input.meter,
      ) === 0 && current === input.entry
      if (equal) removed = true
      else emitPhysicalEntryMeteredInternalV1(entriesReadView, current, input.meter)
    }
    if (!removed) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      entriesReadView,
      input.meter,
    )
    return entryCount === 0 ? null : identityLeafMeteredInternalV1(entries, input.meter)
  }
  let childIndex = -1
  for (let index = 0; index < payload.children.length; index += 1) {
    const lastKey = meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => payload.children[index]!.lastKey,
    })
    if (compareIdentityKeysMeteredInternalV1(
      key,
      lastKey,
      input.meter,
    ) <= 0) {
      childIndex = index
      break
    }
  }
  if (childIndex < 0) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  const nextChild = deleteIdentityEntryMeteredInternalV1({
    node: payload.children[childIndex]!,
    entry: input.entry,
    meter: input.meter,
    isRoot: false,
  })
  let children = [...payload.children]
  children.splice(childIndex, 1, ...(nextChild == null ? [] : [nextChild]))
  if (nextChild != null) {
    children = [...rebalanceIdentityChildMeteredInternalV1({
      children,
      childIndex,
      meter: input.meter,
    })]
  }
  if (children.length === 0) return null
  if (input.isRoot && children.length === 1) return children[0]!
  return identityBranchMeteredInternalV1(children, input.meter)
}

function rebalanceOrderChildMeteredInternalV1(input: {
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1[]
  readonly childIndex: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1[] {
  const children = [...input.children]
  const child = children[input.childIndex]
  if (child == null) return children
  const childPayload = orderNodePayloadMeteredInternalV1(child, input.meter)
  if (childPayload.occupancy >= 4) return children
  const left = children[input.childIndex - 1]
  const leftPayload = left == null
    ? null
    : orderNodePayloadMeteredInternalV1(left, input.meter)
  if (leftPayload != null && leftPayload.occupancy > 4) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      const retainedLeft = copyPhysicalEntriesMeteredInternalV1(
        payload.entries, 0, payload.occupancy - 1, input.meter,
      )
      const borrowed = physicalEntryFactsAtMeteredInternalV1(
        payload.entries, payload.occupancy - 1, input.meter,
      ).entry
      const childEntries = copyPhysicalEntriesMeteredInternalV1(
        childPayload.entries, 0, childPayload.occupancy, input.meter,
      )
      children.splice(input.childIndex - 1, 2,
        orderLeafMeteredInternalV1(retainedLeft, input.meter),
        orderLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1(
            [[borrowed], childEntries], input.meter,
          ),
          input.meter,
        ))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex - 1, 2,
        orderBranchMeteredInternalV1(payload.children.slice(0, -1), input.meter),
        orderBranchMeteredInternalV1([
          payload.children.at(-1)!,
          ...childPayload.children,
        ], input.meter))
    }
    return children
  }
  const right = children[input.childIndex + 1]
  const rightPayload = right == null
    ? null
    : orderNodePayloadMeteredInternalV1(right, input.meter)
  if (rightPayload != null && rightPayload.occupancy > 4) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      const childEntries = copyPhysicalEntriesMeteredInternalV1(
        childPayload.entries, 0, childPayload.occupancy, input.meter,
      )
      const borrowed = physicalEntryFactsAtMeteredInternalV1(
        payload.entries, 0, input.meter,
      ).entry
      const retainedRight = copyPhysicalEntriesMeteredInternalV1(
        payload.entries, 1, payload.occupancy, input.meter,
      )
      children.splice(input.childIndex, 2,
        orderLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1(
            [childEntries, [borrowed]], input.meter,
          ),
          input.meter,
        ),
        orderLeafMeteredInternalV1(retainedRight, input.meter))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex, 2,
        orderBranchMeteredInternalV1([
          ...childPayload.children,
          payload.children[0]!,
        ], input.meter),
        orderBranchMeteredInternalV1(payload.children.slice(1), input.meter))
    }
    return children
  }
  if (leftPayload != null) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? orderLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1([
            copyPhysicalEntriesMeteredInternalV1(
              payload.entries, 0, payload.occupancy, input.meter,
            ),
            copyPhysicalEntriesMeteredInternalV1(
              childPayload.entries, 0, childPayload.occupancy, input.meter,
            ),
          ], input.meter),
          input.meter,
        )
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? orderBranchMeteredInternalV1([
            ...payload.children,
            ...childPayload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    children.splice(input.childIndex - 1, 2, merged)
    return children
  }
  if (rightPayload != null) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? orderLeafMeteredInternalV1(
          combinePhysicalEntriesMeteredInternalV1([
            copyPhysicalEntriesMeteredInternalV1(
              childPayload.entries, 0, childPayload.occupancy, input.meter,
            ),
            copyPhysicalEntriesMeteredInternalV1(
              payload.entries, 0, payload.occupancy, input.meter,
            ),
          ], input.meter),
          input.meter,
        )
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? orderBranchMeteredInternalV1([
            ...childPayload.children,
            ...payload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    children.splice(input.childIndex, 2, merged)
    return children
  }
  return children
}

function deleteOrderEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly isRoot: boolean
}): VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null {
  const inputEntryFacts = physicalEntryFactsMeteredInternalV1(
    input.entry,
    input.meter,
  )
  const payload = orderNodePayloadMeteredInternalV1(input.node, input.meter)
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "order-deletion-entries",
      entries,
    )
    let removed = false
    for (let index = 0; index < payload.occupancy; index += 1) {
      const currentFacts = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      )
      const equal = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => currentFacts.positionKey === inputEntryFacts.positionKey
          && currentFacts.entry === input.entry,
      })
      if (equal) removed = true
      else emitPhysicalEntryMeteredInternalV1(
        entriesReadView,
        currentFacts.entry,
        input.meter,
      )
    }
    if (!removed) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      entriesReadView,
      input.meter,
    )
    return entryCount === 0 ? null : orderLeafMeteredInternalV1(entries, input.meter)
  }
  let childIndex = -1
  for (let index = 0; index < payload.children.length; index += 1) {
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => inputEntryFacts.positionKey
        <= payload.children[index]!.lastPositionKey,
    })) {
      childIndex = index
      break
    }
  }
  if (childIndex < 0) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  const nextChild = deleteOrderEntryMeteredInternalV1({
    node: payload.children[childIndex]!,
    entry: input.entry,
    meter: input.meter,
    isRoot: false,
  })
  let children = [...payload.children]
  children.splice(childIndex, 1, ...(nextChild == null ? [] : [nextChild]))
  if (nextChild != null) {
    children = [...rebalanceOrderChildMeteredInternalV1({
      children,
      childIndex,
      meter: input.meter,
    })]
  }
  if (children.length === 0) return null
  if (input.isRoot && children.length === 1) return children[0]!
  return orderBranchMeteredInternalV1(children, input.meter)
}

function insertIdentityEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly [
  VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null,
] {
  if (input.node == null) {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "identity-singleton-entries",
      entries,
    )
    emitPhysicalEntryMeteredInternalV1(entriesReadView, input.entry, input.meter)
    return [identityLeafMeteredInternalV1(entries, input.meter), null]
  }
  const payload = identityNodePayloadMeteredInternalV1(input.node, input.meter)
  const key = identityKeyMeteredInternalV1(input.entry, input.meter)
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let inserted = false
    for (let index = 0; index < payload.occupancy; index += 1) {
      const current = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      )
      if (!inserted && compareIdentityKeysMeteredInternalV1(
        key,
        Object.freeze({
          inlineId: current.inlineId,
          kindOrdinal: current.kindOrdinal,
          positionKey: current.positionKey,
        }),
        input.meter,
      ) < 0) {
        emitPhysicalEntryMeteredInternalV1(entries, input.entry, input.meter)
        inserted = true
      }
      emitPhysicalEntryMeteredInternalV1(entries, current.entry, input.meter)
    }
    if (!inserted) {
      emitPhysicalEntryMeteredInternalV1(entries, input.entry, input.meter)
    }
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "identity-insertion-entries",
      entries,
    )
    const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      entriesReadView,
      input.meter,
    )
    if (entryCount <= 8) {
      return [identityLeafMeteredInternalV1(entries, input.meter), null]
    }
    return [
      identityLeafMeteredInternalV1(
        copyPhysicalEntriesMeteredInternalV1(entriesReadView, 0, 4, input.meter),
        input.meter,
      ),
      identityLeafMeteredInternalV1(
        copyPhysicalEntriesMeteredInternalV1(
          entriesReadView, 4, entryCount, input.meter,
        ),
        input.meter,
      ),
    ]
  }
  let childIndex = payload.children.length - 1
  for (let index = 0; index < payload.children.length; index += 1) {
    const lastKey = meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => payload.children[index]!.lastKey,
    })
    if (compareIdentityKeysMeteredInternalV1(
      key,
      lastKey,
      input.meter,
    ) <= 0) {
      childIndex = index
      break
    }
  }
  const [left, right] = insertIdentityEntryMeteredInternalV1({
    node: payload.children[childIndex]!,
    entry: input.entry,
    meter: input.meter,
  })
  const children = [...payload.children]
  children.splice(childIndex, 1, left, ...(right == null ? [] : [right]))
  if (children.length <= 8) return [identityBranchMeteredInternalV1(children, input.meter), null]
  return [
    identityBranchMeteredInternalV1(children.slice(0, 4), input.meter),
    identityBranchMeteredInternalV1(children.slice(4), input.meter),
  ]
}

function insertOrderEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly [
  VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null,
] {
  if (input.node == null) {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "order-singleton-entries",
      entries,
    )
    emitPhysicalEntryMeteredInternalV1(entriesReadView, input.entry, input.meter)
    return [orderLeafMeteredInternalV1(entries, input.meter), null]
  }
  const payload = orderNodePayloadMeteredInternalV1(input.node, input.meter)
  const inputEntryFacts = physicalEntryFactsMeteredInternalV1(
    input.entry,
    input.meter,
  )
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let inserted = false
    for (let index = 0; index < payload.occupancy; index += 1) {
      const current = physicalEntryFactsAtMeteredInternalV1(
        payload.entries,
        index,
        input.meter,
      )
      const before = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => inputEntryFacts.positionKey < current.positionKey,
      })
      if (!inserted && before) {
        emitPhysicalEntryMeteredInternalV1(entries, input.entry, input.meter)
        inserted = true
      }
      emitPhysicalEntryMeteredInternalV1(entries, current.entry, input.meter)
    }
    if (!inserted) {
      emitPhysicalEntryMeteredInternalV1(entries, input.entry, input.meter)
    }
    const entriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "order-insertion-entries",
      entries,
    )
    const entryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      entriesReadView,
      input.meter,
    )
    if (entryCount <= 8) {
      return [orderLeafMeteredInternalV1(entries, input.meter), null]
    }
    return [
      orderLeafMeteredInternalV1(
        copyPhysicalEntriesMeteredInternalV1(entriesReadView, 0, 4, input.meter),
        input.meter,
      ),
      orderLeafMeteredInternalV1(
        copyPhysicalEntriesMeteredInternalV1(
          entriesReadView, 4, entryCount, input.meter,
        ),
        input.meter,
      ),
    ]
  }
  let childIndex = payload.children.length - 1
  for (let index = 0; index < payload.children.length; index += 1) {
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => inputEntryFacts.positionKey
        <= payload.children[index]!.lastPositionKey,
    })) {
      childIndex = index
      break
    }
  }
  const [left, right] = insertOrderEntryMeteredInternalV1({
    node: payload.children[childIndex]!,
    entry: input.entry,
    meter: input.meter,
  })
  const children = [...payload.children]
  children.splice(childIndex, 1, left, ...(right == null ? [] : [right]))
  if (children.length <= 8) return [orderBranchMeteredInternalV1(children, input.meter), null]
  return [
    orderBranchMeteredInternalV1(children.slice(0, 4), input.meter),
    orderBranchMeteredInternalV1(children.slice(4), input.meter),
  ]
}

function lookupOrderBoundaryMeteredInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  readonly boundaryRenderedUtf16: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}):
  | {
      readonly status: "found"
      readonly predecessor: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
      readonly successor: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
    }
  | { readonly status: "invalid" } {
  const rootLength = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-comparisons",
    operation: () => input.root.renderedUtf16Length,
  })
  const validBoundary = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-comparisons",
    operation: () => Number.isSafeInteger(input.boundaryRenderedUtf16)
      && input.boundaryRenderedUtf16 >= 0
      && input.boundaryRenderedUtf16 <= rootLength,
  })
  if (!validBoundary) return Object.freeze({ status: "invalid" as const })

  let node = input.root
  let localBoundary = input.boundaryRenderedUtf16
  let inheritedPredecessor:
    VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null = null
  let inheritedSuccessor:
    VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null = null
  while (true) {
    const payload = orderNodePayloadMeteredInternalV1(node, input.meter)
    if (payload.kind === "leaf") {
      let prefix = 0
      let predecessor = inheritedPredecessor
      for (let index = 0; index < payload.occupancy; index += 1) {
        const entryFacts = physicalEntryFactsAtMeteredInternalV1(
          payload.entries,
          index,
          input.meter,
        )
        const relation = meteredPhysicalOperationInternalV1({
          meter: input.meter,
          unit: "source-index-comparisons",
          operation: () => {
            const end = prefix + entryFacts.renderedUtf16Length
            return localBoundary === prefix
              ? "before" as const
              : localBoundary < end
                ? "inside" as const
                : "after" as const
          },
        })
        if (relation === "before") {
          return Object.freeze({
            status: "found" as const,
            predecessor,
            successor: entryFacts.entry,
          })
        }
        if (relation === "inside") {
          return Object.freeze({ status: "invalid" as const })
        }
        prefix += entryFacts.renderedUtf16Length
        predecessor = entryFacts.entry
      }
      return meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => localBoundary === prefix
          ? Object.freeze({
              status: "found" as const,
              predecessor,
              successor: inheritedSuccessor,
            })
          : Object.freeze({ status: "invalid" as const }),
      })
    }

    let prefix = 0
    let selected:
      VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null = null
    for (let index = 0; index < payload.occupancy; index += 1) {
      const child = payload.children[index]!
      const summary = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => ({
          renderedUtf16Length: child.renderedUtf16Length,
        }),
      })
      const boundaryEntries = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-entries",
        operation: () => ({
          firstEntry: child.firstEntry,
          lastEntry: child.lastEntry,
        }),
      })
      const contains = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => localBoundary <= prefix + summary.renderedUtf16Length,
      })
      if (!contains) {
        prefix += summary.renderedUtf16Length
        inheritedPredecessor = boundaryEntries.lastEntry
        continue
      }
      const nextChild = payload.children[index + 1] ?? null
      inheritedSuccessor = nextChild == null
        ? inheritedSuccessor
        : meteredPhysicalOperationInternalV1({
            meter: input.meter,
            unit: "source-index-entries",
            operation: () => nextChild.firstEntry,
          })
      localBoundary -= prefix
      selected = child
      break
    }
    if (selected == null) return Object.freeze({ status: "invalid" as const })
    node = selected
  }
}

export function pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1(input: {
  readonly identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly previousRenderedBoundary?: number
  readonly forcedPositionIntervalForTest?: Readonly<{
    readonly left: number | null
    readonly right: number | null
  }>
}):
  | {
      readonly status: "prepared"
      readonly identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
      readonly orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
      readonly newEntries:
        readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[]
    }
  | {
      readonly status: "key-space-exhausted"
      readonly left: number | null
      readonly right: number | null
      readonly leftNeighbor:
        VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
      readonly rightNeighbor:
        VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
      readonly requestedCount: number
    }
  | { readonly status: "work-limit"; readonly evaluatorAuthority: object }
  | { readonly status: "blocked" } {
  try {
    if (
      input.identityRoot == null
      || input.orderRoot == null
    ) return Object.freeze({ status: "blocked" as const })
    const removedPayload = meteredPhysicalOperationInternalV1({
      meter: input.workMeter,
      unit: "source-index-entries",
      operation: () => {
        const items = input.removedItems
        return { items, itemCount: items.length }
      },
    })
    const nextPhysicalPayload = meteredPhysicalOperationInternalV1({
      meter: input.workMeter,
      unit: "source-index-entries",
      operation: () => {
        const items = input.nextPhysicalItems
        return { items, itemCount: items.length }
      },
    })
    const nextItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
    const nextItemsReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "coordinator-next-items",
      nextItems,
    )
    const nextItemSet = new WeakSet<VNextTextBlockUnifiedLayoutSourceItemV1>()
    for (let index = 0; index < nextPhysicalPayload.itemCount; index += 1) {
      meteredPhysicalOperationInternalV1({
        meter: input.workMeter,
          unit: "source-index-entries",
          operation: () => {
            const item = nextPhysicalPayload.items[index]!
            nextItemsReadView.push(item)
            nextItemSet.add(item)
        },
      })
    }
    const originalRemovedEntries:
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const originalRemovedEntriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "coordinator-original-removed-entries",
      originalRemovedEntries,
    )
    const removedEntries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const removedEntriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "coordinator-removed-entries",
      removedEntries,
    )
    const retainedEntryByItem = new WeakMap<
      VNextTextBlockUnifiedLayoutSourceItemV1,
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
    >()
    for (let index = 0; index < removedPayload.itemCount; index += 1) {
      const item = meteredPhysicalOperationInternalV1({
        meter: input.workMeter,
        unit: "source-index-entries",
        operation: () => removedPayload.items[index]!,
      })
      const entry = lookupExactIdentityEntryMeteredInternalV1({
        root: input.identityRoot,
        item,
        meter: input.workMeter,
      })
      if (entry == null) return Object.freeze({ status: "blocked" as const })
      emitPhysicalEntryMeteredInternalV1(
        originalRemovedEntriesReadView,
        entry,
        input.workMeter,
      )
      if (nextItemSet.has(item)) retainedEntryByItem.set(item, entry)
      else emitPhysicalEntryMeteredInternalV1(
        removedEntriesReadView,
        entry,
        input.workMeter,
      )
    }
    const nextItemCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      nextItemsReadView,
      input.workMeter,
    )
    const removedEntryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      removedEntriesReadView,
      input.workMeter,
    )
    const originalRemovedEntryCount = sourcePhysicalLocalArrayLengthMeteredInternalV1(
      originalRemovedEntriesReadView,
      input.workMeter,
    )
    let firstNewItemIndex = -1
    let lastNewItemIndex = -1
    let newItemCount = 0
    for (let index = 0; index < nextItemCount; index += 1) {
      const item = sourcePhysicalLocalArrayItemMeteredInternalV1(
        nextItemsReadView,
        index,
        input.workMeter,
      )
      if (retainedEntryByItem.has(item)) continue
      if (firstNewItemIndex < 0) firstNewItemIndex = index
      lastNewItemIndex = index
      newItemCount += 1
    }
    let predecessor:
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
    let successor:
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
    let allocationLeft: number | null
    let allocationRight: number | null
    if (originalRemovedEntryCount === 0) {
      if (
        newItemCount === 0
        || input.previousRenderedBoundary == null
      ) return Object.freeze({ status: "blocked" as const })
      const boundary = lookupOrderBoundaryMeteredInternalV1({
        root: input.orderRoot,
        boundaryRenderedUtf16: input.previousRenderedBoundary,
        meter: input.workMeter,
      })
      if (boundary.status !== "found") {
        return Object.freeze({ status: "blocked" as const })
      }
      predecessor = boundary.predecessor
      successor = boundary.successor
      allocationLeft = input.forcedPositionIntervalForTest == null
        ? predecessor == null
          ? null
          : physicalEntryFactsMeteredInternalV1(
              predecessor,
              input.workMeter,
            ).positionKey
        : input.forcedPositionIntervalForTest.left
      allocationRight = input.forcedPositionIntervalForTest == null
        ? successor == null
          ? null
          : physicalEntryFactsMeteredInternalV1(
              successor,
              input.workMeter,
            ).positionKey
        : input.forcedPositionIntervalForTest.right
    } else {
      const initialPositionKey = physicalEntryFactsAtMeteredInternalV1(
        originalRemovedEntriesReadView,
        0,
        input.workMeter,
      ).positionKey
      let minimumPositionKey = initialPositionKey
      let maximumPositionKey = initialPositionKey
      for (let index = 1; index < originalRemovedEntryCount; index += 1) {
        const entryFacts = physicalEntryFactsAtMeteredInternalV1(
          originalRemovedEntriesReadView,
          index,
          input.workMeter,
        )
        const values = meteredPhysicalOperationInternalV1({
          meter: input.workMeter,
          unit: "source-index-comparisons",
          operation: () => ({
            minimum: Math.min(minimumPositionKey, entryFacts.positionKey),
            maximum: Math.max(maximumPositionKey, entryFacts.positionKey),
          }),
        })
        minimumPositionKey = values.minimum
        maximumPositionKey = values.maximum
      }
      predecessor = predecessorOrderEntryMeteredInternalV1({
        node: input.orderRoot,
        positionKey: minimumPositionKey,
        meter: input.workMeter,
      })
      successor = successorOrderEntryMeteredInternalV1({
        node: input.orderRoot,
        positionKey: maximumPositionKey,
        meter: input.workMeter,
      })
      allocationLeft = input.forcedPositionIntervalForTest == null
        ? predecessor == null
          ? successor == null ? minimumPositionKey : null
          : physicalEntryFactsMeteredInternalV1(
              predecessor,
              input.workMeter,
            ).positionKey
        : input.forcedPositionIntervalForTest.left
      allocationRight = input.forcedPositionIntervalForTest == null
        ? successor == null
          ? null
          : physicalEntryFactsMeteredInternalV1(
              successor,
              input.workMeter,
            ).positionKey
        : input.forcedPositionIntervalForTest.right
    }
    if (
      input.forcedPositionIntervalForTest == null
      && firstNewItemIndex >= 0
    ) {
      for (
        let index = firstNewItemIndex;
        index <= lastNewItemIndex;
        index += 1
      ) {
        const item = sourcePhysicalLocalArrayItemMeteredInternalV1(
          nextItemsReadView,
          index,
          input.workMeter,
        )
        if (retainedEntryByItem.has(item)) {
          return Object.freeze({ status: "blocked" as const })
        }
      }
      for (let index = firstNewItemIndex - 1; index >= 0; index -= 1) {
        const item = sourcePhysicalLocalArrayItemMeteredInternalV1(
          nextItemsReadView,
          index,
          input.workMeter,
        )
        const retained = retainedEntryByItem.get(item)
        if (retained == null) continue
        allocationLeft = physicalEntryFactsMeteredInternalV1(
          retained,
          input.workMeter,
        ).positionKey
        predecessor = retained
        break
      }
      for (
        let index = lastNewItemIndex + 1;
        index < nextItemCount;
        index += 1
      ) {
        const item = sourcePhysicalLocalArrayItemMeteredInternalV1(
          nextItemsReadView,
          index,
          input.workMeter,
        )
        const retained = retainedEntryByItem.get(item)
        if (retained == null) continue
        allocationRight = physicalEntryFactsMeteredInternalV1(
          retained,
          input.workMeter,
        ).positionKey
        successor = retained
        break
      }
    }
    const allocation = allocatePositionKeysDetailedInternalV1({
      left: allocationLeft,
      right: allocationRight,
      count: newItemCount,
      workMeter: input.workMeter,
    })
    if (allocation.status === "key-space-exhausted") {
      return Object.freeze({
        status: "key-space-exhausted" as const,
        left: allocationLeft,
        right: allocationRight,
        leftNeighbor: predecessor,
        rightNeighbor: successor,
        requestedCount: newItemCount,
      })
    }
    if (allocation.status === "work-limit") {
      return Object.freeze({
        status: "work-limit" as const,
        evaluatorAuthority: allocation.evaluatorAuthority,
      })
    }
    if (allocation.status !== "allocated") {
      return Object.freeze({ status: "blocked" as const })
    }
    let identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null =
      input.identityRoot
    let orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null =
      input.orderRoot
    const newEntries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    const newEntriesReadView = sourcePhysicalLocalArrayReadViewInternalV1(
      "coordinator-new-entries",
      newEntries,
    )
    for (let index = 0; index < removedEntryCount; index += 1) {
      const entry = sourcePhysicalLocalArrayItemMeteredInternalV1(
        removedEntriesReadView,
        index,
        input.workMeter,
      )
      if (identityRoot == null || orderRoot == null) {
        return Object.freeze({ status: "blocked" as const })
      }
      identityRoot = deleteIdentityEntryMeteredInternalV1({
        node: identityRoot,
        entry,
        meter: input.workMeter,
        isRoot: true,
      })
      orderRoot = deleteOrderEntryMeteredInternalV1({
        node: orderRoot,
        entry,
        meter: input.workMeter,
        isRoot: true,
      })
      if ((identityRoot == null) !== (orderRoot == null)) {
        return Object.freeze({ status: "blocked" as const })
      }
    }
    let newItemIndex = 0
    for (let index = 0; index < nextItemCount; index += 1) {
      const item = sourcePhysicalLocalArrayItemMeteredInternalV1(
        nextItemsReadView,
        index,
        input.workMeter,
      )
      if (retainedEntryByItem.has(item)) continue
      const created = meteredPhysicalOperationInternalV1({
        meter: input.workMeter,
        unit: "source-index-entries",
        operation: () => {
          const entry = Object.freeze({
            item,
            positionKey: allocation.keys[newItemIndex]!,
            renderedUtf16Length: item.renderedUtf16Length,
          })
          newEntriesReadView.push(entry)
          return {
            entry,
            item,
            inlineId: item.inlineId,
            kind: item.kind,
          }
        },
      })
      const conflict = firstIdentityEntryAtOrAfterMeteredInternalV1({
        root: identityRoot,
        key: Object.freeze({
          inlineId: created.inlineId,
          kindOrdinal: created.kind === "text" ? 1 : 0,
          positionKey: Number.MIN_SAFE_INTEGER,
        }),
        meter: input.workMeter,
      })
      const hasConflict = conflict != null
        && meteredPhysicalOperationInternalV1({
          meter: input.workMeter,
          unit: "source-index-comparisons",
          operation: () => conflict.inlineId === created.inlineId,
        })
      if (hasConflict) return Object.freeze({ status: "blocked" as const })
      const identityInserted = insertIdentityEntryMeteredInternalV1({
        node: identityRoot,
        entry: created.entry,
        meter: input.workMeter,
      })
      identityRoot = identityInserted[1] == null
        ? identityInserted[0]
        : identityBranchMeteredInternalV1(
            [identityInserted[0], identityInserted[1]],
            input.workMeter,
          )
      const orderInserted = insertOrderEntryMeteredInternalV1({
        node: orderRoot,
        entry: created.entry,
        meter: input.workMeter,
      })
      orderRoot = orderInserted[1] == null
        ? orderInserted[0]
        : orderBranchMeteredInternalV1(
            [orderInserted[0], orderInserted[1]],
            input.workMeter,
          )
      newItemIndex += 1
    }
    const frozenNewEntries = meteredPhysicalOperationInternalV1({
      meter: input.workMeter,
      unit: "source-index-entries",
      operation: () => {
        Object.freeze(newEntriesReadView)
        return newEntries
      },
    })
    return Object.freeze({
      status: "prepared" as const,
      identityRoot,
      orderRoot,
      newEntries: frozenNewEntries,
    })
  } catch (error) {
    if (
      error instanceof SourcePhysicalPathCopyStopInternalV1
      && error.kind === "work-limit"
      && error.evaluatorAuthority != null
    ) {
      return Object.freeze({
        status: "work-limit" as const,
        evaluatorAuthority: error.evaluatorAuthority,
      })
    }
    return Object.freeze({ status: "blocked" as const })
  }
}

/** Test-only collision fixture; production path copy never rewrites retained fingerprints. */
export function pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexWithForcedFingerprintCollisionForTestInternalV1(
  input: Parameters<
    typeof pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1
  >[0],
): ReturnType<
  typeof pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1
> {
  const forcedFingerprint = `sha256:${"0".repeat(64)}`
  const forceIdentity = (
    node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null,
  ): VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null =>
    node == null ? null : node.nodeKind === "leaf"
      ? Object.freeze({ ...node, fingerprint: forcedFingerprint })
      : Object.freeze({
          ...node,
          children: Object.freeze(node.children.map(forceIdentity).filter(
            (child): child is VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 =>
              child != null,
          )),
          fingerprint: forcedFingerprint,
        })
  const forceOrder = (
    node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null,
  ): VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null =>
    node == null ? null : node.nodeKind === "leaf"
      ? Object.freeze({ ...node, fingerprint: forcedFingerprint })
      : Object.freeze({
          ...node,
          children: Object.freeze(node.children.map(forceOrder).filter(
            (child): child is VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 =>
              child != null,
          )),
          fingerprint: forcedFingerprint,
        })
  return pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
    ...input,
    identityRoot: forceIdentity(input.identityRoot),
    orderRoot: forceOrder(input.orderRoot),
  })
}

export function lookupVNextTextBlockUnifiedLayoutSourcePhysicalRangeInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly entry: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1
  readonly observeBeforeOperation?: Observer
}):
  | {
      readonly status: "found"
      readonly startRenderedUtf16: number
      readonly endRenderedUtf16: number
    }
  | {
      readonly status: "not-found"
      readonly startRenderedUtf16: null
      readonly endRenderedUtf16: null
    } {
  let prefix = 0
  let node = input.root
  while (node != null) {
    input.observeBeforeOperation?.("source-index-nodes")
    if (node.nodeKind === "leaf") {
      for (const candidate of node.entries) {
        input.observeBeforeOperation?.("source-index-comparisons")
        if (candidate.positionKey === input.entry.positionKey) {
          return candidate === input.entry
            ? Object.freeze({
                status: "found" as const,
                startRenderedUtf16: prefix,
                endRenderedUtf16: prefix + candidate.renderedUtf16Length,
              })
            : Object.freeze({
                status: "not-found" as const,
                startRenderedUtf16: null,
                endRenderedUtf16: null,
              })
        }
        if (candidate.positionKey > input.entry.positionKey) break
        prefix += candidate.renderedUtf16Length
      }
      break
    }
    let selected: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null = null
    for (const child of node.children) {
      input.observeBeforeOperation?.("source-index-comparisons")
      if (input.entry.positionKey <= child.lastPositionKey) {
        selected = child
        break
      }
      prefix += child.renderedUtf16Length
    }
    node = selected
  }
  return Object.freeze({
    status: "not-found" as const,
    startRenderedUtf16: null,
    endRenderedUtf16: null,
  })
}

export function visitVNextTextBlockUnifiedLayoutSourcePhysicalItemByInlineIdInternalV1(
  input: {
    readonly identityRoot: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
    readonly orderRoot: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
    readonly inlineId: string
    readonly beforeVisitNode: () => boolean
  },
):
  | {
      readonly status: "found"
      readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
      readonly absoluteStartRenderedUtf16: number
      readonly absoluteEndRenderedUtf16: number
      readonly visitedNodeCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "not-found" | "limit-exceeded"
      readonly item: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly visitedNodeCount: number
      readonly completeTreeTraversalCount: 0
    } {
  let visitedNodeCount = 0
  let limitExceeded = false
  const beforeNode = (): boolean => {
    if (!input.beforeVisitNode()) {
      limitExceeded = true
      return false
    }
    visitedNodeCount += 1
    return true
  }
  const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const visitIdentity = (
    node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  ): void => {
    if (limitExceeded || !beforeNode()) return
    if (node.nodeKind === "leaf") {
      for (const entry of node.entries) {
        if (entry.item.inlineId === input.inlineId) entries.push(entry)
      }
      return
    }
    for (const child of node.children) {
      if (
        child.firstKey.inlineId <= input.inlineId
        && child.lastKey.inlineId >= input.inlineId
      ) visitIdentity(child)
      if (limitExceeded) return
    }
  }
  if (input.identityRoot != null) visitIdentity(input.identityRoot)
  if (limitExceeded) {
    return Object.freeze({
      status: "limit-exceeded" as const,
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedNodeCount,
      completeTreeTraversalCount: 0 as const,
    })
  }
  if (entries.length !== 1) {
    return Object.freeze({
      status: "not-found" as const,
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedNodeCount,
      completeTreeTraversalCount: 0 as const,
    })
  }
  const entry = entries[0]!
  let prefix = 0
  let node = input.orderRoot
  while (node != null) {
    if (!beforeNode()) break
    if (node.nodeKind === "leaf") {
      for (const candidate of node.entries) {
        if (candidate.positionKey === entry.positionKey) {
          if (candidate !== entry) break
          return Object.freeze({
            status: "found" as const,
            item: entry.item,
            absoluteStartRenderedUtf16: prefix,
            absoluteEndRenderedUtf16: prefix + entry.renderedUtf16Length,
            visitedNodeCount,
            completeTreeTraversalCount: 0 as const,
          })
        }
        if (candidate.positionKey > entry.positionKey) break
        prefix += candidate.renderedUtf16Length
      }
      node = null
      continue
    }
    let selected: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null = null
    for (const child of node.children) {
      if (entry.positionKey <= child.lastPositionKey) {
        selected = child
        break
      }
      prefix += child.renderedUtf16Length
    }
    node = selected
  }
  return Object.freeze({
    status: limitExceeded ? "limit-exceeded" as const : "not-found" as const,
    item: null,
    absoluteStartRenderedUtf16: null,
    absoluteEndRenderedUtf16: null,
    visitedNodeCount,
    completeTreeTraversalCount: 0 as const,
  })
}

function inspectIdentity(
  root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null,
) {
  const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const leafOccupancies: number[] = []
  const branchOccupancies: number[] = []
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  ): void => {
    if (node.nodeKind === "leaf") {
      leafOccupancies.push(node.entries.length)
      entries.push(...node.entries)
    } else {
      branchOccupancies.push(node.children.length)
      node.children.forEach(visit)
    }
  }
  if (root != null) visit(root)
  return Object.freeze({
    entryCount: entries.length,
    height: root?.height ?? -1,
    entries: Object.freeze(entries),
    leafOccupancies: Object.freeze(leafOccupancies),
    branchOccupancies: Object.freeze(branchOccupancies),
  })
}

export function inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1(
  root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null,
) {
  return inspectIdentity(root)
}

export function inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
  root: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null,
) {
  const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const leafOccupancies: number[] = []
  const branchOccupancies: number[] = []
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  ): void => {
    if (node.nodeKind === "leaf") {
      leafOccupancies.push(node.entries.length)
      entries.push(...node.entries)
    } else {
      branchOccupancies.push(node.children.length)
      node.children.forEach(visit)
    }
  }
  if (root != null) visit(root)
  return Object.freeze({
    entryCount: entries.length,
    height: root?.height ?? -1,
    renderedUtf16Length: root?.renderedUtf16Length ?? 0,
    entries: Object.freeze(entries),
    leafOccupancies: Object.freeze(leafOccupancies),
    branchOccupancies: Object.freeze(branchOccupancies),
  })
}
