import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceStyleV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"

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

class SourceStylePathCopyStopInternalV1 {
  readonly kind: "work-limit" | "invalid"
  readonly evaluatorAuthority: object | null

  constructor(kind: "work-limit" | "invalid", evaluatorAuthority: object | null = null) {
    this.kind = kind
    this.evaluatorAuthority = evaluatorAuthority
  }
}

function meteredStyleOperationInternalV1<T>(input: {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: "source-style-nodes" | "source-style-buckets" | "source-style-entries"
  readonly operation: () => T
}): T {
  const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
    meter: input.meter,
    unit: input.unit,
  })
  if (begun.status === "limit-exceeded") {
    throw new SourceStylePathCopyStopInternalV1("work-limit", begun.evaluatorAuthority)
  }
  if (begun.status !== "permitted") throw new SourceStylePathCopyStopInternalV1("invalid")
  const value = input.operation()
  if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit)) {
    throw new SourceStylePathCopyStopInternalV1("invalid")
  }
  return value
}

function compareStyleKeysMeteredInternalV1(
  left: readonly [string, string, string],
  right: readonly [string, string, string],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): number {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      for (let index = 0; index < 3; index += 1) {
        if (left[index] !== right[index]) return left[index]! < right[index]! ? -1 : 1
      }
      return 0
    },
  })
}

function styleEntryKeyMeteredInternalV1(
  entry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): readonly [string, string, string] {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => entryKey(entry),
  })
}

function styleNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
) {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
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

function styleLeafMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountLeafInternalV1 {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => leaf(entries),
  })
}

function styleBranchMeteredInternalV1(
  children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountBranchInternalV1 {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => branch(children),
  })
}

function nextStyleEntryMeteredInternalV1(input: {
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly canonicalFacts: string
  readonly styleFingerprint: string
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  const bucketItem = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-buckets",
    operation: () => Object.freeze({
      style: input.style,
      canonicalFacts: input.canonicalFacts,
      refcount: 1,
    }),
  })
  return meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-entries",
    operation: () => styleEntry({
      measurementStyleKey: input.style.measurementStyleKey,
      effectiveShapingStyleKey: input.style.effectiveShapingStyleKey,
      styleFingerprint: input.styleFingerprint,
      bucket: [bucketItem],
    }),
  })
}

type StyleAdjustResultInternalV1 = readonly [
  VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null,
  VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null,
]

function rebalanceStyleChildMeteredInternalV1(input: {
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
  readonly childIndex: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] {
  const children = [...input.children]
  const child = children[input.childIndex]
  if (child == null) return children
  const childPayload = styleNodePayloadMeteredInternalV1(child, input.meter)
  if (childPayload.occupancy >= 4) return children
  const left = children[input.childIndex - 1]
  const leftPayload = left == null
    ? null
    : styleNodePayloadMeteredInternalV1(left, input.meter)
  if (leftPayload != null && leftPayload.occupancy > 4) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      children.splice(input.childIndex - 1, 2,
        styleLeafMeteredInternalV1(payload.entries.slice(0, -1), input.meter),
        styleLeafMeteredInternalV1([
          payload.entries.at(-1)!,
          ...childPayload.entries,
        ], input.meter))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex - 1, 2,
        styleBranchMeteredInternalV1(payload.children.slice(0, -1), input.meter),
        styleBranchMeteredInternalV1([
          payload.children.at(-1)!,
          ...childPayload.children,
        ], input.meter))
    }
    return children
  }
  const right = children[input.childIndex + 1]
  const rightPayload = right == null
    ? null
    : styleNodePayloadMeteredInternalV1(right, input.meter)
  if (rightPayload != null && rightPayload.occupancy > 4) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      children.splice(input.childIndex, 2,
        styleLeafMeteredInternalV1([
          ...childPayload.entries,
          payload.entries[0]!,
        ], input.meter),
        styleLeafMeteredInternalV1(payload.entries.slice(1), input.meter))
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      children.splice(input.childIndex, 2,
        styleBranchMeteredInternalV1([
          ...childPayload.children,
          payload.children[0]!,
        ], input.meter),
        styleBranchMeteredInternalV1(payload.children.slice(1), input.meter))
    }
    return children
  }
  if (leftPayload != null) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? styleLeafMeteredInternalV1([
          ...payload.entries,
          ...childPayload.entries,
        ], input.meter)
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? styleBranchMeteredInternalV1([
            ...payload.children,
            ...childPayload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourceStylePathCopyStopInternalV1("invalid")
    children.splice(input.childIndex - 1, 2, merged)
    return children
  }
  if (rightPayload != null) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? styleLeafMeteredInternalV1([
          ...childPayload.entries,
          ...payload.entries,
        ], input.meter)
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? styleBranchMeteredInternalV1([
            ...childPayload.children,
            ...payload.children,
          ], input.meter)
        : null
    if (merged == null) throw new SourceStylePathCopyStopInternalV1("invalid")
    children.splice(input.childIndex, 2, merged)
    return children
  }
  return children
}

function adjustStyleNodeMeteredInternalV1(input: {
  readonly node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly canonicalFacts: string
  readonly styleFingerprint: string
  readonly delta: -1 | 1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly isRoot: boolean
}): StyleAdjustResultInternalV1 {
  const key = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-entries",
    operation: () => Object.freeze([
      input.style.measurementStyleKey,
      input.style.effectiveShapingStyleKey,
      input.styleFingerprint,
    ] as const),
  })
  if (input.node == null) {
    if (input.delta < 0) throw new SourceStylePathCopyStopInternalV1("invalid")
    const created = nextStyleEntryMeteredInternalV1(input)
    return [styleLeafMeteredInternalV1([created], input.meter), null]
  }
  const payload = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-nodes",
    operation: () => input.node!.nodeKind === "leaf"
      ? { kind: "leaf" as const, entries: input.node!.entries }
      : { kind: "branch" as const, children: input.node!.children },
  })
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
    let adjusted = false
    for (const current of payload.entries) {
      const compared = compareStyleKeysMeteredInternalV1(
        key,
        styleEntryKeyMeteredInternalV1(current, input.meter),
        input.meter,
      )
      if (compared === 0) {
        const bucketPayload = meteredStyleOperationInternalV1({
          meter: input.meter,
          unit: "source-style-buckets",
          operation: () => current.bucket,
        })
        const bucket: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
        let exactAdjusted = false
        let insertedCollisionItem = false
        const insertCollisionItem = (): void => {
          bucket.push(meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-buckets",
            operation: () => Object.freeze({
              style: input.style,
              canonicalFacts: input.canonicalFacts,
              refcount: 1,
            }),
          }))
          insertedCollisionItem = true
          adjusted = true
        }
        for (const item of bucketPayload) {
          const factsCompared = meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => item.canonicalFacts === input.canonicalFacts
              ? 0
              : item.canonicalFacts < input.canonicalFacts ? -1 : 1,
          })
          if (factsCompared !== 0) {
            if (
              input.delta > 0
              && !insertedCollisionItem
              && factsCompared > 0
            ) insertCollisionItem()
            bucket.push(item)
            continue
          }
          const nextRefcount = meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => item.refcount + input.delta,
          })
          if (!Number.isSafeInteger(nextRefcount) || nextRefcount < 0) {
            throw new SourceStylePathCopyStopInternalV1("invalid")
          }
          if (nextRefcount > 0) {
            bucket.push(meteredStyleOperationInternalV1({
              meter: input.meter,
              unit: "source-style-entries",
              operation: () => Object.freeze({ ...item, refcount: nextRefcount }),
            }))
          }
          exactAdjusted = true
          adjusted = true
        }
        if (!exactAdjusted && input.delta > 0) {
          if (!insertedCollisionItem) insertCollisionItem()
        }
        if (bucket.length > 0) {
          entries.push(meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => styleEntry({ ...current, bucket }),
          }))
        }
      } else {
        if (!adjusted && compared < 0 && input.delta > 0) {
          entries.push(nextStyleEntryMeteredInternalV1(input))
          adjusted = true
        }
        entries.push(current)
      }
    }
    if (!adjusted) {
      if (input.delta < 0) throw new SourceStylePathCopyStopInternalV1("invalid")
      entries.push(nextStyleEntryMeteredInternalV1(input))
    }
    if (entries.length === 0) return [null, null]
    if (entries.length <= 8) return [styleLeafMeteredInternalV1(entries, input.meter), null]
    return [
      styleLeafMeteredInternalV1(entries.slice(0, 4), input.meter),
      styleLeafMeteredInternalV1(entries.slice(4), input.meter),
    ]
  }
  let childIndex = payload.children.length - 1
  for (let index = 0; index < payload.children.length; index += 1) {
    const lastKey = meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-entries",
      operation: () => payload.children[index]!.lastKey,
    })
    if (compareStyleKeysMeteredInternalV1(
      key,
      lastKey,
      input.meter,
    ) <= 0) {
      childIndex = index
      break
    }
  }
  const [left, right] = adjustStyleNodeMeteredInternalV1({
    ...input,
    node: payload.children[childIndex]!,
    isRoot: false,
  })
  let children = [...payload.children]
  children.splice(childIndex, 1, ...(left == null ? [] : [left]), ...(right == null ? [] : [right]))
  if (left != null && right == null) {
    children = [...rebalanceStyleChildMeteredInternalV1({
      children,
      childIndex,
      meter: input.meter,
    })]
  }
  if (children.length === 0) return [null, null]
  if (input.isRoot && children.length === 1) return [children[0]!, null]
  if (children.length <= 8) return [styleBranchMeteredInternalV1(children, input.meter), null]
  return [
    styleBranchMeteredInternalV1(children.slice(0, 4), input.meter),
    styleBranchMeteredInternalV1(children.slice(4), input.meter),
  ]
}

function itemStyleInternalV1(
  item: VNextTextBlockUnifiedLayoutSourceItemV1,
): VNextTextBlockUnifiedLayoutSourceStyleV1 | null {
  return item.kind === "text"
      || item.kind === "resolved-field"
      || item.kind === "generated-page-number"
    ? item.style
    : null
}

interface PathCopyStyleInputInternalV1 {
  readonly root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly removedItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}

function pathCopyStyleInternalV1(
  input: PathCopyStyleInputInternalV1,
  fingerprintFactory: VNextTextBlockUnifiedLayoutSourceStyleFingerprintFactoryInternalV1,
):
  | {
      readonly status: "prepared"
      readonly root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
    }
  | { readonly status: "work-limit"; readonly evaluatorAuthority: object }
  | { readonly status: "blocked" } {
  try {
    let root = input.root
    const apply = (
      item: VNextTextBlockUnifiedLayoutSourceItemV1,
      delta: -1 | 1,
    ): void => {
      const style = itemStyleInternalV1(item)
      if (style == null) return
      const facts = meteredStyleOperationInternalV1({
        meter: input.workMeter,
        unit: "source-style-entries",
        operation: () => canonicalVNextTextBlockUnifiedLayoutSourceStyleFactsInternalV1(style),
      })
      const styleFingerprint = fingerprintFactory(facts)
      const [left, right] = adjustStyleNodeMeteredInternalV1({
        node: root,
        style,
        canonicalFacts: facts,
        styleFingerprint,
        delta,
        meter: input.workMeter,
        isRoot: true,
      })
      root = right == null
        ? left
        : styleBranchMeteredInternalV1([left!, right], input.workMeter)
    }
    for (const item of input.removedItems) apply(item, -1)
    for (const item of input.nextPhysicalItems) apply(item, 1)
    return Object.freeze({ status: "prepared" as const, root })
  } catch (error) {
    if (
      error instanceof SourceStylePathCopyStopInternalV1
      && error.kind === "work-limit"
      && error.evaluatorAuthority != null
    ) return Object.freeze({ status: "work-limit" as const, evaluatorAuthority: error.evaluatorAuthority })
    return Object.freeze({ status: "blocked" as const })
  }
}

export function pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1(
  input: PathCopyStyleInputInternalV1,
): ReturnType<typeof pathCopyStyleInternalV1> {
  return pathCopyStyleInternalV1(input, createVNextCompactFingerprint)
}

/** Test-only collision fixture; production path copy always uses compact fingerprints. */
export function pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsWithForcedFingerprintCollisionForTestInternalV1(
  input: PathCopyStyleInputInternalV1,
): ReturnType<typeof pathCopyStyleInternalV1> {
  return pathCopyStyleInternalV1(input, () => `sha256:${"0".repeat(64)}`)
}

export function resolveVNextTextBlockUnifiedLayoutSourceStyleFromRefcountRootInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}):
  | { readonly status: "resolved"; readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1 }
  | { readonly status: "unavailable" | "ambiguous"; readonly style: null } {
  const candidates: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
  const pairCompare = (key: readonly [string, string, string]): number => {
    if (key[0] !== input.measurementStyleKey) return key[0] < input.measurementStyleKey ? -1 : 1
    if (key[1] !== input.effectiveShapingStyleKey) return key[1] < input.effectiveShapingStyleKey ? -1 : 1
    return 0
  }
  const visit = (node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1): void => {
    if (node.nodeKind === "leaf") {
      for (const entry of node.entries) {
        if (
          entry.measurementStyleKey === input.measurementStyleKey
          && entry.effectiveShapingStyleKey === input.effectiveShapingStyleKey
        ) candidates.push(...entry.bucket)
      }
      return
    }
    for (const child of node.children) {
      if (pairCompare(child.firstKey) <= 0 && pairCompare(child.lastKey) >= 0) visit(child)
    }
  }
  if (input.root != null) visit(input.root)
  if (candidates.length === 0) return { status: "unavailable", style: null }
  const facts = candidates[0]!.canonicalFacts
  return candidates.every((candidate) => candidate.canonicalFacts === facts)
    ? { status: "resolved", style: candidates[0]!.style }
    : { status: "ambiguous", style: null }
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
