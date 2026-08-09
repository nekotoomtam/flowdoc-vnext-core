import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStyleV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"

type Observer = (
  unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
) => void

export type VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1 =
  (canonicalFacts: string) => string

export interface VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1 {
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly canonicalFacts: string
  readonly refcount: number
}

export interface VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
  readonly styleFingerprint: string
  readonly bucket: readonly VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[]
  readonly totalRefcount: number
  readonly fingerprint: string
}

interface StyleNodeBaseInternalV1 {
  readonly height: number
  readonly styleKeyCount: number
  readonly exactStyleCount: number
  readonly totalRefcount: number
  readonly firstKey: readonly [string, string, string]
  readonly lastKey: readonly [string, string, string]
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceStyleRefcountLeafInternalV1
  extends StyleNodeBaseInternalV1 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[]
}

export interface VNextTextBlockUnifiedLayoutSourceStyleRefcountBranchInternalV1
  extends StyleNodeBaseInternalV1 {
  readonly nodeKind: "branch"
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
}

export type VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 =
  | VNextTextBlockUnifiedLayoutSourceStyleRefcountLeafInternalV1
  | VNextTextBlockUnifiedLayoutSourceStyleRefcountBranchInternalV1

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function canonicalVNextTextBlockUnifiedLayoutSourceStyleFactsInternalV1(
  style: VNextTextBlockUnifiedLayoutSourceStyleV1,
): string {
  return stringifyVNextCanonicalJson({
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    textColor: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
    authoredLocalStyle: style.authoredLocalStyle,
  })
}

function entryKey(
  entry: Pick<
    VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
    "measurementStyleKey" | "effectiveShapingStyleKey" | "styleFingerprint"
  >,
): readonly [string, string, string] {
  return Object.freeze([
    entry.measurementStyleKey,
    entry.effectiveShapingStyleKey,
    entry.styleFingerprint,
  ] as const)
}

function compareKeys(
  left: readonly [string, string, string],
  right: readonly [string, string, string],
  observe?: Observer,
): number {
  observe?.("source-style-entries")
  for (let index = 0; index < 3; index += 1) {
    const compared = left[index] === right[index]
      ? 0
      : left[index]! < right[index]! ? -1 : 1
    if (compared !== 0) return compared
  }
  return 0
}

function styleEntry(
  input: {
    readonly measurementStyleKey: string
    readonly effectiveShapingStyleKey: string
    readonly styleFingerprint: string
    readonly bucket: readonly VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[]
  },
): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  const bucket = Object.freeze([...input.bucket])
  const totalRefcount = bucket.reduce((sum, item) => sum + item.refcount, 0)
  if (!Number.isSafeInteger(totalRefcount) || totalRefcount < 1) {
    throw new RangeError("style refcount must be a positive safe integer")
  }
  const facts = {
    measurementStyleKey: input.measurementStyleKey,
    effectiveShapingStyleKey: input.effectiveShapingStyleKey,
    styleFingerprint: input.styleFingerprint,
    bucket: bucket.map((item) => ({
      canonicalFacts: item.canonicalFacts,
      refcount: item.refcount,
    })),
    totalRefcount,
  }
  return Object.freeze({ ...facts, bucket, fingerprint: fingerprint(facts) })
}

function leaf(
  entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountLeafInternalV1 {
  observe?.("source-style-nodes")
  const frozenEntries = Object.freeze([...entries])
  const facts = {
    nodeKind: "leaf" as const,
    height: 0 as const,
    styleKeyCount: frozenEntries.length,
    exactStyleCount: frozenEntries.reduce((sum, entry) => sum + entry.bucket.length, 0),
    totalRefcount: frozenEntries.reduce((sum, entry) => sum + entry.totalRefcount, 0),
    firstKey: entryKey(frozenEntries[0]!),
    lastKey: entryKey(frozenEntries[frozenEntries.length - 1]!),
    entries: frozenEntries.map((entry) => entry.fingerprint),
  }
  return Object.freeze({ ...facts, entries: frozenEntries, fingerprint: fingerprint(facts) })
}

function branch(
  children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[],
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountBranchInternalV1 {
  observe?.("source-style-nodes")
  const frozenChildren = Object.freeze([...children])
  const facts = {
    nodeKind: "branch" as const,
    height: frozenChildren[0]!.height + 1,
    styleKeyCount: frozenChildren.reduce((sum, child) => sum + child.styleKeyCount, 0),
    exactStyleCount: frozenChildren.reduce((sum, child) => sum + child.exactStyleCount, 0),
    totalRefcount: frozenChildren.reduce((sum, child) => sum + child.totalRefcount, 0),
    firstKey: frozenChildren[0]!.firstKey,
    lastKey: frozenChildren[frozenChildren.length - 1]!.lastKey,
    children: frozenChildren.map((child) => child.fingerprint),
  }
  if (
    !Number.isSafeInteger(facts.styleKeyCount)
    || !Number.isSafeInteger(facts.exactStyleCount)
    || !Number.isSafeInteger(facts.totalRefcount)
  ) throw new RangeError("style summaries must stay safe")
  return Object.freeze({ ...facts, children: frozenChildren, fingerprint: fingerprint(facts) })
}

function incrementBucket(
  entry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
  style: VNextTextBlockUnifiedLayoutSourceStyleV1,
  canonicalFacts: string,
  observe?: Observer,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  observe?.("source-style-buckets")
  const bucket: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
  let inserted = false
  for (const item of entry.bucket) {
    observe?.("source-style-entries")
    const compared = canonicalFacts === item.canonicalFacts
      ? 0
      : canonicalFacts < item.canonicalFacts ? -1 : 1
    if (compared === 0) {
      if (!Number.isSafeInteger(item.refcount + 1)) {
        throw new RangeError("style refcount overflow")
      }
      bucket.push(Object.freeze({ ...item, refcount: item.refcount + 1 }))
      inserted = true
    } else {
      if (!inserted && compared < 0) {
        bucket.push(Object.freeze({ style, canonicalFacts, refcount: 1 }))
        inserted = true
      }
      bucket.push(item)
    }
  }
  if (!inserted) bucket.push(Object.freeze({ style, canonicalFacts, refcount: 1 }))
  return styleEntry({ ...entry, bucket })
}

type InsertResult = readonly [
  VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
  VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null,
]

function insert(
  node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
  nextEntry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
  style: VNextTextBlockUnifiedLayoutSourceStyleV1,
  canonicalFacts: string,
  observe?: Observer,
): InsertResult {
  observe?.("source-style-nodes")
  const key = entryKey(nextEntry)
  if (node.nodeKind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
    let inserted = false
    for (const current of node.entries) {
      const compared = compareKeys(key, entryKey(current), observe)
      if (compared === 0) {
        entries.push(incrementBucket(current, style, canonicalFacts, observe))
        inserted = true
      } else {
        if (!inserted && compared < 0) {
          entries.push(nextEntry)
          inserted = true
        }
        entries.push(current)
      }
    }
    if (!inserted) entries.push(nextEntry)
    if (entries.length <= 8) return [leaf(entries, observe), null]
    return [leaf(entries.slice(0, 4), observe), leaf(entries.slice(4), observe)]
  }
  let childIndex = node.children.length - 1
  for (let index = 0; index < node.children.length; index += 1) {
    if (compareKeys(key, node.children[index]!.lastKey, observe) <= 0) {
      childIndex = index
      break
    }
  }
  const [left, right] = insert(
    node.children[childIndex]!,
    nextEntry,
    style,
    canonicalFacts,
    observe,
  )
  const children = [...node.children]
  children.splice(childIndex, 1, left, ...(right == null ? [] : [right]))
  if (children.length <= 8) return [branch(children, observe), null]
  return [branch(children.slice(0, 4), observe), branch(children.slice(4), observe)]
}

export function insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly fingerprintFactory?: VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1
  readonly observeBeforeOperation?: Observer
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null {
  input.observeBeforeOperation?.("source-style-entries")
  if (!Object.isFrozen(input.style)) return null
  const canonicalFacts = canonicalVNextTextBlockUnifiedLayoutSourceStyleFactsInternalV1(
    input.style,
  )
  const styleFingerprint = (input.fingerprintFactory ?? createVNextCompactFingerprint)(
    canonicalFacts,
  )
  input.observeBeforeOperation?.("source-style-buckets")
  const bucketItem = Object.freeze({
    style: input.style,
    canonicalFacts,
    refcount: 1,
  })
  const nextEntry = styleEntry({
    measurementStyleKey: input.style.measurementStyleKey,
    effectiveShapingStyleKey: input.style.effectiveShapingStyleKey,
    styleFingerprint,
    bucket: [bucketItem],
  })
  if (input.root == null) return leaf([nextEntry], input.observeBeforeOperation)
  const [left, right] = insert(
    input.root,
    nextEntry,
    input.style,
    canonicalFacts,
    input.observeBeforeOperation,
  )
  return right == null ? left : branch([left, right], input.observeBeforeOperation)
}

export function inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
  root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null,
) {
  const entries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
  const leafOccupancies: number[] = []
  const branchOccupancies: number[] = []
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
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
    styleKeyCount: root?.styleKeyCount ?? 0,
    exactStyleCount: root?.exactStyleCount ?? 0,
    totalRefcount: root?.totalRefcount ?? 0,
    height: root?.height ?? -1,
    entries: Object.freeze(entries),
    leafOccupancies: Object.freeze(leafOccupancies),
    branchOccupancies: Object.freeze(branchOccupancies),
  })
}
