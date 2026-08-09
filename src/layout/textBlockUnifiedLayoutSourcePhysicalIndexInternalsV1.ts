import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"

export type VNextTextBlockSourcePositionKeyInternalV1 = number

export const VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1 =
  Object.freeze({
    version: 1 as const,
    initialStride: 4_294_967_296 as const,
    representation: "signed-safe-integer" as const,
    batchAllocation: "canonical-even-interior" as const,
  })

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
  return Object.freeze({ ...facts, entries: frozenEntries, fingerprint: fingerprint(facts) })
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
  return Object.freeze({ ...facts, children: frozenChildren, fingerprint: fingerprint(facts) })
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
  const sameInline = lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
    root: input.identityRoot,
    inlineId: entry.item.inlineId,
    observeBeforeOperation: observe,
  })
  if (
    sameInline.length > 0
    && (
      entry.item.kind !== "text"
      || sameInline.some((candidate) => candidate.item.kind !== "text")
    )
  ) return Object.freeze({ status: "blocked" })
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
