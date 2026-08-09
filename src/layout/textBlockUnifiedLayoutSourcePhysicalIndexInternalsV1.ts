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
  const value = input.operation()
  if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit)) {
    throw new SourcePhysicalPathCopyStopInternalV1("invalid")
  }
  return value
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
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-comparisons",
    operation: () => identityKey(entry),
  })
}

function identityNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
) {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => node.nodeKind === "leaf"
      ? {
          kind: "leaf" as const,
          entries: node.entries,
          occupancy: node.entries.length,
        }
      : {
          kind: "branch" as const,
          children: node.children,
          occupancy: node.children.length,
        },
  })
}

function orderNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
) {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => node.nodeKind === "leaf"
      ? {
          kind: "leaf" as const,
          entries: node.entries,
          occupancy: node.entries.length,
        }
      : {
          kind: "branch" as const,
          children: node.children,
          occupancy: node.children.length,
        },
  })
}

function identityLeafMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceIdentityIndexLeafInternalV1 {
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => identityLeaf(entries),
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
  return meteredPhysicalOperationInternalV1({
    meter,
    unit: "source-index-nodes",
    operation: () => orderLeaf(entries),
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

function lookupIdentityEntriesMeteredInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly inlineId: string
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] {
  const output: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  ): void => {
    const payload = meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-nodes",
      operation: () => node.nodeKind === "leaf"
        ? { kind: "leaf" as const, entries: node.entries }
        : { kind: "branch" as const, children: node.children },
    })
    if (payload.kind === "leaf") {
      for (const entry of payload.entries) {
        const matches = meteredPhysicalOperationInternalV1({
          meter: input.meter,
          unit: "source-index-comparisons",
          operation: () => entry.item.inlineId === input.inlineId,
        })
        if (matches) output.push(entry)
      }
      return
    }
    for (const child of payload.children) {
      const intersects = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => child.firstKey.inlineId <= input.inlineId
          && child.lastKey.inlineId >= input.inlineId,
      })
      if (intersects) visit(child)
    }
  }
  if (input.root != null) visit(input.root)
  return Object.freeze(output)
}

function predecessorOrderEntryMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  readonly positionKey: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null {
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node.entries }
      : { kind: "branch" as const, children: input.node.children },
  })
  if (payload.kind === "leaf") {
    for (let index = payload.entries.length - 1; index >= 0; index -= 1) {
      const entry = payload.entries[index]!
      if (meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => entry.positionKey < input.positionKey,
      })) return entry
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
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node.entries }
      : { kind: "branch" as const, children: input.node.children },
  })
  if (payload.kind === "leaf") {
    for (const entry of payload.entries) {
      if (meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => entry.positionKey > input.positionKey,
      })) return entry
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
      children.splice(input.childIndex - 1, 2,
        identityLeafMeteredInternalV1(payload.entries.slice(0, -1), input.meter),
        identityLeafMeteredInternalV1([
          payload.entries.at(-1)!,
          ...childPayload.entries,
        ], input.meter))
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
      children.splice(input.childIndex, 2,
        identityLeafMeteredInternalV1([
          ...childPayload.entries,
          payload.entries[0]!,
        ], input.meter),
        identityLeafMeteredInternalV1(payload.entries.slice(1), input.meter))
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
      ? identityLeafMeteredInternalV1([
          ...payload.entries,
          ...childPayload.entries,
        ], input.meter)
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
      ? identityLeafMeteredInternalV1([
          ...childPayload.entries,
          ...payload.entries,
        ], input.meter)
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
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node.entries }
      : { kind: "branch" as const, children: input.node.children },
  })
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let removed = false
    for (const current of payload.entries) {
      const equal = compareIdentityKeysMeteredInternalV1(
        identityKeyMeteredInternalV1(current, input.meter),
        key,
        input.meter,
      ) === 0 && current === input.entry
      if (equal) removed = true
      else entries.push(current)
    }
    if (!removed) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    return entries.length === 0 ? null : identityLeafMeteredInternalV1(entries, input.meter)
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
      children.splice(input.childIndex - 1, 2,
        orderLeafMeteredInternalV1(payload.entries.slice(0, -1), input.meter),
        orderLeafMeteredInternalV1([
          payload.entries.at(-1)!,
          ...childPayload.entries,
        ], input.meter))
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
      children.splice(input.childIndex, 2,
        orderLeafMeteredInternalV1([
          ...childPayload.entries,
          payload.entries[0]!,
        ], input.meter),
        orderLeafMeteredInternalV1(payload.entries.slice(1), input.meter))
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
      ? orderLeafMeteredInternalV1([
          ...payload.entries,
          ...childPayload.entries,
        ], input.meter)
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
      ? orderLeafMeteredInternalV1([
          ...childPayload.entries,
          ...payload.entries,
        ], input.meter)
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
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node.entries }
      : { kind: "branch" as const, children: input.node.children },
  })
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let removed = false
    for (const current of payload.entries) {
      const equal = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => current.positionKey === input.entry.positionKey
          && current === input.entry,
      })
      if (equal) removed = true
      else entries.push(current)
    }
    if (!removed) throw new SourcePhysicalPathCopyStopInternalV1("invalid")
    return entries.length === 0 ? null : orderLeafMeteredInternalV1(entries, input.meter)
  }
  let childIndex = -1
  for (let index = 0; index < payload.children.length; index += 1) {
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => input.entry.positionKey <= payload.children[index]!.lastPositionKey,
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
  if (input.node == null) return [identityLeafMeteredInternalV1([input.entry], input.meter), null]
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node!.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node!.entries }
      : { kind: "branch" as const, children: input.node!.children },
  })
  const key = identityKeyMeteredInternalV1(input.entry, input.meter)
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let inserted = false
    for (const current of payload.entries) {
      if (!inserted && compareIdentityKeysMeteredInternalV1(
        key,
        identityKeyMeteredInternalV1(current, input.meter),
        input.meter,
      ) < 0) {
        entries.push(input.entry)
        inserted = true
      }
      entries.push(current)
    }
    if (!inserted) entries.push(input.entry)
    if (entries.length <= 8) return [identityLeafMeteredInternalV1(entries, input.meter), null]
    return [
      identityLeafMeteredInternalV1(entries.slice(0, 4), input.meter),
      identityLeafMeteredInternalV1(entries.slice(4), input.meter),
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
  if (input.node == null) return [orderLeafMeteredInternalV1([input.entry], input.meter), null]
  const payload = meteredPhysicalOperationInternalV1({
    meter: input.meter,
    unit: "source-index-nodes",
    operation: () => input.node!.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node!.entries }
      : { kind: "branch" as const, children: input.node!.children },
  })
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    let inserted = false
    for (const current of payload.entries) {
      const before = meteredPhysicalOperationInternalV1({
        meter: input.meter,
        unit: "source-index-comparisons",
        operation: () => input.entry.positionKey < current.positionKey,
      })
      if (!inserted && before) {
        entries.push(input.entry)
        inserted = true
      }
      entries.push(current)
    }
    if (!inserted) entries.push(input.entry)
    if (entries.length <= 8) return [orderLeafMeteredInternalV1(entries, input.meter), null]
    return [
      orderLeafMeteredInternalV1(entries.slice(0, 4), input.meter),
      orderLeafMeteredInternalV1(entries.slice(4), input.meter),
    ]
  }
  let childIndex = payload.children.length - 1
  for (let index = 0; index < payload.children.length; index += 1) {
    if (meteredPhysicalOperationInternalV1({
      meter: input.meter,
      unit: "source-index-comparisons",
      operation: () => input.entry.positionKey <= payload.children[index]!.lastPositionKey,
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
        const entry = meteredPhysicalOperationInternalV1({
          meter: input.meter,
          unit: "source-index-entries",
          operation: () => payload.entries[index]!,
        })
        const entryFacts = meteredPhysicalOperationInternalV1({
          meter: input.meter,
          unit: "source-index-comparisons",
          operation: () => ({
            renderedUtf16Length: entry.renderedUtf16Length,
            positionKey: entry.positionKey,
          }),
        })
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
            successor: entry,
          })
        }
        if (relation === "inside") {
          return Object.freeze({ status: "invalid" as const })
        }
        prefix += entryFacts.renderedUtf16Length
        predecessor = entry
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
        inheritedPredecessor = summary.lastEntry
        continue
      }
      const nextChild = payload.children[index + 1] ?? null
      inheritedSuccessor = nextChild == null
        ? inheritedSuccessor
        : meteredPhysicalOperationInternalV1({
            meter: input.meter,
            unit: "source-index-comparisons",
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
    const removedEntries: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
    for (const item of input.removedItems) {
      const candidates = lookupIdentityEntriesMeteredInternalV1({
        root: input.identityRoot,
        inlineId: item.inlineId,
        meter: input.workMeter,
      })
      const matches: VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1[] = []
      for (const entry of candidates) {
        if (meteredPhysicalOperationInternalV1({
          meter: input.workMeter,
          unit: "source-index-comparisons",
          operation: () => entry.item === item,
        })) matches.push(entry)
      }
      if (matches.length !== 1) return Object.freeze({ status: "blocked" as const })
      removedEntries.push(matches[0]!)
    }
    let predecessor:
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
    let successor:
      VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 | null
    let allocationLeft: number | null
    let allocationRight: number | null
    if (removedEntries.length === 0) {
      if (
        input.nextPhysicalItems.length === 0
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
          : meteredPhysicalOperationInternalV1({
              meter: input.workMeter,
              unit: "source-index-comparisons",
              operation: () => predecessor!.positionKey,
            })
        : input.forcedPositionIntervalForTest.left
      allocationRight = input.forcedPositionIntervalForTest == null
        ? successor == null
          ? null
          : meteredPhysicalOperationInternalV1({
              meter: input.workMeter,
              unit: "source-index-comparisons",
              operation: () => successor!.positionKey,
            })
        : input.forcedPositionIntervalForTest.right
    } else {
      const initialPositionKey = meteredPhysicalOperationInternalV1({
        meter: input.workMeter,
        unit: "source-index-comparisons",
        operation: () => removedEntries[0]!.positionKey,
      })
      let minimumPositionKey = initialPositionKey
      let maximumPositionKey = initialPositionKey
      for (const entry of removedEntries.slice(1)) {
        const values = meteredPhysicalOperationInternalV1({
          meter: input.workMeter,
          unit: "source-index-comparisons",
          operation: () => ({
            minimum: Math.min(minimumPositionKey, entry.positionKey),
            maximum: Math.max(maximumPositionKey, entry.positionKey),
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
          : meteredPhysicalOperationInternalV1({
              meter: input.workMeter,
              unit: "source-index-comparisons",
              operation: () => predecessor!.positionKey,
            })
        : input.forcedPositionIntervalForTest.left
      allocationRight = input.forcedPositionIntervalForTest == null
        ? successor == null
          ? null
          : meteredPhysicalOperationInternalV1({
              meter: input.workMeter,
              unit: "source-index-comparisons",
              operation: () => successor!.positionKey,
            })
        : input.forcedPositionIntervalForTest.right
    }
    const allocation = allocatePositionKeysDetailedInternalV1({
      left: allocationLeft,
      right: allocationRight,
      count: input.nextPhysicalItems.length,
      workMeter: input.workMeter,
    })
    if (allocation.status === "key-space-exhausted") {
      return Object.freeze({
        status: "key-space-exhausted" as const,
        left: allocationLeft,
        right: allocationRight,
        leftNeighbor: predecessor,
        rightNeighbor: successor,
        requestedCount: input.nextPhysicalItems.length,
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
    for (const entry of removedEntries) {
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
    for (let index = 0; index < input.nextPhysicalItems.length; index += 1) {
      const item = input.nextPhysicalItems[index]!
      const entry = meteredPhysicalOperationInternalV1({
        meter: input.workMeter,
        unit: "source-index-entries",
        operation: () => Object.freeze({
          item,
          positionKey: allocation.keys[index]!,
          renderedUtf16Length: item.renderedUtf16Length,
        }),
      })
      const conflicts = lookupIdentityEntriesMeteredInternalV1({
        root: identityRoot,
        inlineId: item.inlineId,
        meter: input.workMeter,
      })
      let atomicConflict = false
      for (const value of conflicts) {
        if (meteredPhysicalOperationInternalV1({
          meter: input.workMeter,
          unit: "source-index-comparisons",
          operation: () => value.item.kind !== "text",
        })) {
          atomicConflict = true
          break
        }
      }
      if (
        conflicts.length > 0
        && (item.kind !== "text" || atomicConflict)
      ) return Object.freeze({ status: "blocked" as const })
      const identityInserted = insertIdentityEntryMeteredInternalV1({
        node: identityRoot,
        entry,
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
        entry,
        meter: input.workMeter,
      })
      orderRoot = orderInserted[1] == null
        ? orderInserted[0]
        : orderBranchMeteredInternalV1(
            [orderInserted[0], orderInserted[1]],
            input.workMeter,
          )
    }
    return Object.freeze({ status: "prepared" as const, identityRoot, orderRoot })
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
