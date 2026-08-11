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

let sourceStylePayloadObserverForTestInternalV1:
  | ((unit: "source-style-nodes" | "source-style-buckets" | "source-style-entries") => void)
  | null = null

type SourceStyleLocalArrayKindForTestInternalV1 =
  | "style-leaf-entries"
  | "style-leaf-copied-entries"
  | "style-singleton-bucket-items"
  | "style-entry-bucket-items"
  | "style-created-entry-array"
  | "style-adjusted-entries"
  | "style-rebalance-entry-parts"
  | "style-rebalance-part-entries"
  | "style-rebalance-copied-entries"

export interface VNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewRegistrationForTestInternalV1 {
  readonly authority: object
  readonly createReadView: (input: Readonly<{
    readonly kind: SourceStyleLocalArrayKindForTestInternalV1
    readonly raw: readonly object[]
  }>) => readonly object[]
}

let sourceStyleLocalArrayReadViewRegistrationForTest:
  VNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewRegistrationForTestInternalV1
  | null = null

export function registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
  registration:
    VNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewRegistrationForTestInternalV1,
): boolean {
  if (
    registration.authority == null
    || typeof registration.authority !== "object"
    || sourceStyleLocalArrayReadViewRegistrationForTest != null
  ) return false
  sourceStyleLocalArrayReadViewRegistrationForTest = registration
  return true
}

export function removeVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
  registration:
    VNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewRegistrationForTestInternalV1,
): boolean {
  if (sourceStyleLocalArrayReadViewRegistrationForTest !== registration) return false
  sourceStyleLocalArrayReadViewRegistrationForTest = null
  return true
}

function sourceStyleLocalArrayReadViewInternalV1<T extends readonly object[]>(
  kind: SourceStyleLocalArrayKindForTestInternalV1,
  raw: T,
): T {
  const registration = sourceStyleLocalArrayReadViewRegistrationForTest
  return registration == null
    ? raw
    : registration.createReadView(Object.freeze({ kind, raw })) as T
}

export function setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1(
  observer: typeof sourceStylePayloadObserverForTestInternalV1,
): void {
  sourceStylePayloadObserverForTestInternalV1 = observer
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
  sourceStylePayloadObserverForTestInternalV1?.(input.unit)
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

function styleEntryFactsAtMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): {
  readonly entry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1
  readonly key: readonly [string, string, string]
} {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      const entry = entries[index]
      if (entry == null) throw new SourceStylePathCopyStopInternalV1("invalid")
      return {
        entry,
        key: Object.freeze([
          entry.measurementStyleKey,
          entry.effectiveShapingStyleKey,
          entry.styleFingerprint,
        ] as const),
      }
    },
  })
}

function styleBucketItemFactsAtMeteredInternalV1(
  bucket: readonly VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): {
  readonly item: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly canonicalFacts: string
  readonly refcount: number
} {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      const item = bucket[index]
      if (item == null) throw new SourceStylePathCopyStopInternalV1("invalid")
      return {
        item,
        style: item.style,
        canonicalFacts: item.canonicalFacts,
        refcount: item.refcount,
      }
    },
  })
}

function styleNodePayloadMeteredInternalV1(
  node: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
):
  | {
      readonly kind: "leaf"
      readonly entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[]
      readonly occupancy: number
    }
  | {
      readonly kind: "branch"
      readonly children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
      readonly occupancy: number
    } {
  const kindPayload = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => node.nodeKind === "leaf"
      ? { kind: "leaf" as const, node }
      : { kind: "branch" as const, node },
  })
  if (kindPayload.kind === "leaf") {
    return meteredStyleOperationInternalV1({
      meter,
      unit: "source-style-entries",
      operation: () => ({
        kind: "leaf" as const,
        entries: kindPayload.node.entries,
        occupancy: kindPayload.node.entries.length,
      }),
    })
  }
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
      operation: () => ({
      kind: "branch" as const,
      children: kindPayload.node.children,
      occupancy: kindPayload.node.children.length,
    }),
  })
}

function styleEntryAtMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      const entry = entries[index]
      if (entry == null) throw new SourceStylePathCopyStopInternalV1("invalid")
      return entry
    },
  })
}

function copyStyleEntriesMeteredInternalV1(input: {
  readonly entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[]
  readonly start: number
  readonly end: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly localOutputKind?:
    | "style-leaf-copied-entries"
    | "style-rebalance-copied-entries"
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] {
  const copied: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
  const copiedOutput = input.localOutputKind == null
    ? copied
    : sourceStyleLocalArrayReadViewInternalV1(input.localOutputKind, copied)
  for (let index = input.start; index < input.end; index += 1) {
    meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-entries",
      operation: () => {
        const entry = input.entries[index]
        if (entry == null) throw new SourceStylePathCopyStopInternalV1("invalid")
        copiedOutput.push(entry)
      },
    })
  }
  return copied
}

type StyleEntryPartInternalV1 = Readonly<{
  readonly entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[]
  readonly start: number
  readonly end: number
}>

function createStyleEntryPartsMeteredInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  createParts: () => readonly StyleEntryPartInternalV1[],
): readonly StyleEntryPartInternalV1[] {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      const parts: StyleEntryPartInternalV1[] = []
      const partsOutput = sourceStyleLocalArrayReadViewInternalV1(
        "style-rebalance-entry-parts",
        parts,
      )
      for (const part of createParts()) {
        partsOutput.push(Object.freeze({
          entries: part.entries,
          start: part.start,
          end: part.end,
        }))
      }
      return parts
    },
  })
}

function pushStyleEntryMeteredInternalV1(
  entries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  entry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): void {
  meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => { entries.push(entry) },
  })
}

function styleChildAtMeteredInternalV1(
  children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => {
      const child = children[index]
      if (child == null) throw new SourceStylePathCopyStopInternalV1("invalid")
      return child
    },
  })
}

function copyStyleChildrenMeteredInternalV1(input: {
  readonly children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
  readonly start: number
  readonly end: number
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] {
  const copied: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] = []
  for (let index = input.start; index < input.end; index += 1) {
    meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-nodes",
      operation: () => {
        const child = input.children[index]
        if (child == null) throw new SourceStylePathCopyStopInternalV1("invalid")
        copied.push(child)
      },
    })
  }
  return copied
}

function pushStyleChildMeteredInternalV1(
  children: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[],
  child: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): void {
  meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => { children.push(child) },
  })
}

function combineStyleEntriesMeteredInternalV1(
  parts: readonly {
    readonly entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[]
    readonly start: number
    readonly end: number
  }[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] {
  const combined: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
  const partsReadView = sourceStyleLocalArrayReadViewInternalV1(
    "style-rebalance-entry-parts",
    parts,
  )
  const partCount = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => partsReadView.length,
  })
  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const part = meteredStyleOperationInternalV1({
      meter,
      unit: "source-style-entries",
      operation: () => {
        const value = partsReadView[partIndex]
        if (value == null) throw new SourceStylePathCopyStopInternalV1("invalid")
        return {
          entries: value.entries,
          start: value.start,
          end: value.end,
        }
      },
    })
    const partEntriesReadView = sourceStyleLocalArrayReadViewInternalV1(
      "style-rebalance-part-entries",
      part.entries,
    )
    const copied = copyStyleEntriesMeteredInternalV1({
      entries: partEntriesReadView,
      start: part.start,
      end: part.end,
      meter,
      localOutputKind: "style-rebalance-copied-entries",
    })
    const copiedReadView = sourceStyleLocalArrayReadViewInternalV1(
      "style-rebalance-copied-entries",
      copied,
    )
    meteredStyleOperationInternalV1({
      meter,
      unit: "source-style-entries",
      operation: () => { combined.push(...copiedReadView) },
    })
  }
  return combined
}

function combineStyleChildrenMeteredInternalV1(
  parts: readonly {
    readonly children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
    readonly start: number
    readonly end: number
  }[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] {
  const combined: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] = []
  for (const part of parts) {
    const copied = copyStyleChildrenMeteredInternalV1({ ...part, meter })
    meteredStyleOperationInternalV1({
      meter,
      unit: "source-style-nodes",
      operation: () => { combined.push(...copied) },
    })
  }
  return combined
}

function replaceStyleChildrenMeteredInternalV1(input: {
  readonly children: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
  readonly start: number
  readonly deleteCount: number
  readonly replacements: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[]
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}): void {
  meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-nodes",
    operation: () => {
      input.children.splice(input.start, input.deleteCount, ...input.replacements)
    },
  })
}

function styleBucketPayloadMeteredInternalV1(
  entry: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): {
  readonly bucket: readonly VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[]
  readonly occupancy: number
} {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-buckets",
    operation: () => ({ bucket: entry.bucket, occupancy: entry.bucket.length }),
  })
}

function pushStyleBucketItemMeteredInternalV1(
  bucket: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[],
  item: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): void {
  meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => { bucket.push(item) },
  })
}

function styleEntryMeteredInternalV1(input: {
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
  readonly styleFingerprint: string
  readonly bucket: readonly VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[]
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly localBucketKind?:
    | "style-singleton-bucket-items"
    | "style-entry-bucket-items"
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1 {
  const bucketReadView = sourceStyleLocalArrayReadViewInternalV1(
    input.localBucketKind ?? "style-entry-bucket-items",
    input.bucket,
  )
  const bucketOccupancy = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-buckets",
    operation: () => bucketReadView.length,
  })
  const bucket: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
  const itemFacts: { readonly canonicalFacts: string; readonly refcount: number }[] = []
  let totalRefcount = 0
  for (let index = 0; index < bucketOccupancy; index += 1) {
    meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-entries",
      operation: () => {
        const item = bucketReadView[index]
        if (item == null) throw new SourceStylePathCopyStopInternalV1("invalid")
        bucket.push(item)
        itemFacts.push({ canonicalFacts: item.canonicalFacts, refcount: item.refcount })
        totalRefcount += item.refcount
      },
    })
  }
  if (!Number.isSafeInteger(totalRefcount) || totalRefcount < 1) {
    throw new SourceStylePathCopyStopInternalV1("invalid")
  }
  const frozenBucket = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-buckets",
    operation: () => Object.freeze(bucket),
  })
  return meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-entries",
    operation: () => {
      const facts = {
        measurementStyleKey: input.measurementStyleKey,
        effectiveShapingStyleKey: input.effectiveShapingStyleKey,
        styleFingerprint: input.styleFingerprint,
        bucket: itemFacts,
        totalRefcount,
      }
      return Object.freeze({
        ...facts,
        bucket: frozenBucket,
        fingerprint: fingerprint(facts),
      })
    },
  })
}

function styleLeafMeteredInternalV1(
  entries: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  localEntriesKind:
    | "style-leaf-entries"
    | "style-created-entry-array"
    | "style-adjusted-entries" = "style-leaf-entries",
): VNextTextBlockUnifiedLayoutSourceStyleRefcountLeafInternalV1 {
  const entriesReadView = sourceStyleLocalArrayReadViewInternalV1(
    localEntriesKind,
    entries,
  )
  const occupancy = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => entriesReadView.length,
  })
  if (occupancy < 1) throw new SourceStylePathCopyStopInternalV1("invalid")
  const copiedEntries = copyStyleEntriesMeteredInternalV1({
    entries: entriesReadView,
    start: 0,
    end: occupancy,
    meter,
    localOutputKind: "style-leaf-copied-entries",
  })
  const frozenEntriesReadView = sourceStyleLocalArrayReadViewInternalV1(
    "style-leaf-copied-entries",
    copiedEntries,
  )
  const frozenEntries = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      Object.freeze(frozenEntriesReadView)
      return copiedEntries
    },
  })
  let exactStyleCount = 0
  let totalRefcount = 0
  const entryFingerprints: string[] = []
  for (let index = 0; index < occupancy; index += 1) {
    const entry = styleEntryAtMeteredInternalV1(frozenEntriesReadView, index, meter)
    exactStyleCount += styleBucketPayloadMeteredInternalV1(entry, meter).occupancy
    meteredStyleOperationInternalV1({
      meter,
      unit: "source-style-entries",
      operation: () => {
        totalRefcount += entry.totalRefcount
        entryFingerprints.push(entry.fingerprint)
      },
    })
  }
  const firstEntry = styleEntryAtMeteredInternalV1(
    frozenEntriesReadView,
    0,
    meter,
  )
  const lastEntry = styleEntryAtMeteredInternalV1(
    frozenEntriesReadView,
    occupancy - 1,
    meter,
  )
  const firstKey = styleEntryKeyMeteredInternalV1(firstEntry, meter)
  const lastKey = styleEntryKeyMeteredInternalV1(
    lastEntry,
    meter,
  )
  const facts = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => ({
      nodeKind: "leaf" as const,
      height: 0 as const,
      styleKeyCount: occupancy,
      exactStyleCount,
      totalRefcount,
      firstKey,
      lastKey,
      entries: entryFingerprints,
    }),
  })
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => Object.freeze({
      ...facts,
      entries: frozenEntries,
      fingerprint: fingerprint(facts),
    }),
  })
}

function styleBranchMeteredInternalV1(
  children: readonly VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleRefcountBranchInternalV1 {
  const occupancy = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => children.length,
  })
  if (occupancy < 1) throw new SourceStylePathCopyStopInternalV1("invalid")
  const frozenChildren = Object.freeze(copyStyleChildrenMeteredInternalV1({
    children,
    start: 0,
    end: occupancy,
    meter,
  }))
  const firstChild = styleChildAtMeteredInternalV1(frozenChildren, 0, meter)
  const lastChild = styleChildAtMeteredInternalV1(frozenChildren, occupancy - 1, meter)
  const nodeFacts = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => {
      let styleKeyCount = 0
      let exactStyleCount = 0
      const childFingerprints: string[] = []
      for (let index = 0; index < occupancy; index += 1) {
        const child = frozenChildren[index]!
        styleKeyCount += child.styleKeyCount
        exactStyleCount += child.exactStyleCount
        childFingerprints.push(child.fingerprint)
      }
      return {
        height: firstChild.height + 1,
        styleKeyCount,
        exactStyleCount,
        childFingerprints,
      }
    },
  })
  const entryFacts = meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      let totalRefcount = 0
      for (let index = 0; index < occupancy; index += 1) {
        totalRefcount += frozenChildren[index]!.totalRefcount
      }
      return {
        totalRefcount,
        firstKey: firstChild.firstKey,
        lastKey: lastChild.lastKey,
      }
    },
  })
  if (
    !Number.isSafeInteger(nodeFacts.styleKeyCount)
    || !Number.isSafeInteger(nodeFacts.exactStyleCount)
    || !Number.isSafeInteger(entryFacts.totalRefcount)
  ) throw new SourceStylePathCopyStopInternalV1("invalid")
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-nodes",
    operation: () => {
      const facts = {
        nodeKind: "branch" as const,
        height: nodeFacts.height,
        styleKeyCount: nodeFacts.styleKeyCount,
        exactStyleCount: nodeFacts.exactStyleCount,
        totalRefcount: entryFacts.totalRefcount,
        firstKey: entryFacts.firstKey,
        lastKey: entryFacts.lastKey,
        children: nodeFacts.childFingerprints,
      }
      return Object.freeze({
        ...facts,
        children: frozenChildren,
        fingerprint: fingerprint(facts),
      })
    },
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
    unit: "source-style-entries",
    operation: () => Object.freeze({
      style: input.style,
      canonicalFacts: input.canonicalFacts,
      refcount: 1,
    }),
  })
  const bucketItems: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
  const bucketItemsReadView = sourceStyleLocalArrayReadViewInternalV1(
    "style-singleton-bucket-items",
    bucketItems,
  )
  meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-entries",
    operation: () => { bucketItemsReadView[0] = bucketItem },
  })
  const bucket = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-buckets",
    operation: () => {
      Reflect.preventExtensions(bucketItemsReadView)
      Object.freeze(bucketItems)
      return bucketItems
    },
  })
  const key = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-entries",
    operation: () => ({
      measurementStyleKey: input.style.measurementStyleKey,
      effectiveShapingStyleKey: input.style.effectiveShapingStyleKey,
    }),
  })
  return styleEntryMeteredInternalV1({
    ...key,
    styleFingerprint: input.styleFingerprint,
    bucket,
    meter: input.meter,
    localBucketKind: "style-singleton-bucket-items",
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
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] {
  const childCount = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-nodes",
    operation: () => input.children.length,
  })
  const children = copyStyleChildrenMeteredInternalV1({
    children: input.children,
    start: 0,
    end: childCount,
    meter: input.meter,
  })
  if (input.childIndex < 0 || input.childIndex >= childCount) return children
  const child = styleChildAtMeteredInternalV1(children, input.childIndex, input.meter)
  const childPayload = styleNodePayloadMeteredInternalV1(child, input.meter)
  if (childPayload.occupancy >= 4) return children
  const left = input.childIndex < 1
    ? null
    : styleChildAtMeteredInternalV1(children, input.childIndex - 1, input.meter)
  const leftPayload = left == null
    ? null
    : styleNodePayloadMeteredInternalV1(left, input.meter)
  if (leftPayload != null && leftPayload.occupancy > 4) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      replaceStyleChildrenMeteredInternalV1({
        children,
        start: input.childIndex - 1,
        deleteCount: 2,
        replacements: [
          styleLeafMeteredInternalV1(copyStyleEntriesMeteredInternalV1({
            entries: payload.entries,
            start: 0,
            end: payload.occupancy - 1,
            meter: input.meter,
          }), input.meter),
          styleLeafMeteredInternalV1(combineStyleEntriesMeteredInternalV1(
            createStyleEntryPartsMeteredInternalV1(input.meter, () => [
              {
                entries: payload.entries,
                start: payload.occupancy - 1,
                end: payload.occupancy,
              },
              {
                entries: childPayload.entries,
                start: 0,
                end: childPayload.occupancy,
              },
            ]),
            input.meter,
          ), input.meter),
        ],
        meter: input.meter,
      })
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      replaceStyleChildrenMeteredInternalV1({
        children,
        start: input.childIndex - 1,
        deleteCount: 2,
        replacements: [
          styleBranchMeteredInternalV1(copyStyleChildrenMeteredInternalV1({
            children: payload.children,
            start: 0,
            end: payload.occupancy - 1,
            meter: input.meter,
          }), input.meter),
          styleBranchMeteredInternalV1(combineStyleChildrenMeteredInternalV1([
            {
              children: payload.children,
              start: payload.occupancy - 1,
              end: payload.occupancy,
            },
            {
              children: childPayload.children,
              start: 0,
              end: childPayload.occupancy,
            },
          ], input.meter), input.meter),
        ],
        meter: input.meter,
      })
    }
    return children
  }
  const right = input.childIndex + 1 >= childCount
    ? null
    : styleChildAtMeteredInternalV1(children, input.childIndex + 1, input.meter)
  const rightPayload = right == null
    ? null
    : styleNodePayloadMeteredInternalV1(right, input.meter)
  if (rightPayload != null && rightPayload.occupancy > 4) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    if (payload.kind === "leaf" && childPayload.kind === "leaf") {
      replaceStyleChildrenMeteredInternalV1({
        children,
        start: input.childIndex,
        deleteCount: 2,
        replacements: [
          styleLeafMeteredInternalV1(combineStyleEntriesMeteredInternalV1(
            createStyleEntryPartsMeteredInternalV1(input.meter, () => [
              {
                entries: childPayload.entries,
                start: 0,
                end: childPayload.occupancy,
              },
              { entries: payload.entries, start: 0, end: 1 },
            ]),
            input.meter,
          ), input.meter),
          styleLeafMeteredInternalV1(copyStyleEntriesMeteredInternalV1({
            entries: payload.entries,
            start: 1,
            end: payload.occupancy,
            meter: input.meter,
          }), input.meter),
        ],
        meter: input.meter,
      })
    } else if (payload.kind === "branch" && childPayload.kind === "branch") {
      replaceStyleChildrenMeteredInternalV1({
        children,
        start: input.childIndex,
        deleteCount: 2,
        replacements: [
          styleBranchMeteredInternalV1(combineStyleChildrenMeteredInternalV1([
            {
              children: childPayload.children,
              start: 0,
              end: childPayload.occupancy,
            },
            { children: payload.children, start: 0, end: 1 },
          ], input.meter), input.meter),
          styleBranchMeteredInternalV1(copyStyleChildrenMeteredInternalV1({
            children: payload.children,
            start: 1,
            end: payload.occupancy,
            meter: input.meter,
          }), input.meter),
        ],
        meter: input.meter,
      })
    }
    return children
  }
  if (leftPayload != null) {
    const payload = leftPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? styleLeafMeteredInternalV1(combineStyleEntriesMeteredInternalV1(
          createStyleEntryPartsMeteredInternalV1(input.meter, () => [
            { entries: payload.entries, start: 0, end: payload.occupancy },
            { entries: childPayload.entries, start: 0, end: childPayload.occupancy },
          ]),
          input.meter,
        ), input.meter)
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? styleBranchMeteredInternalV1(combineStyleChildrenMeteredInternalV1([
            { children: payload.children, start: 0, end: payload.occupancy },
            {
              children: childPayload.children,
              start: 0,
              end: childPayload.occupancy,
            },
          ], input.meter), input.meter)
        : null
    if (merged == null) throw new SourceStylePathCopyStopInternalV1("invalid")
    replaceStyleChildrenMeteredInternalV1({
      children,
      start: input.childIndex - 1,
      deleteCount: 2,
      replacements: [merged],
      meter: input.meter,
    })
    return children
  }
  if (rightPayload != null) {
    const payload = rightPayload
    if (payload.kind !== childPayload.kind) {
      throw new SourceStylePathCopyStopInternalV1("invalid")
    }
    const merged = payload.kind === "leaf" && childPayload.kind === "leaf"
      ? styleLeafMeteredInternalV1(combineStyleEntriesMeteredInternalV1(
          createStyleEntryPartsMeteredInternalV1(input.meter, () => [
            { entries: childPayload.entries, start: 0, end: childPayload.occupancy },
            { entries: payload.entries, start: 0, end: payload.occupancy },
          ]),
          input.meter,
        ), input.meter)
      : payload.kind === "branch" && childPayload.kind === "branch"
        ? styleBranchMeteredInternalV1(combineStyleChildrenMeteredInternalV1([
            {
              children: childPayload.children,
              start: 0,
              end: childPayload.occupancy,
            },
            { children: payload.children, start: 0, end: payload.occupancy },
          ], input.meter), input.meter)
        : null
    if (merged == null) throw new SourceStylePathCopyStopInternalV1("invalid")
    replaceStyleChildrenMeteredInternalV1({
      children,
      start: input.childIndex,
      deleteCount: 2,
      replacements: [merged],
      meter: input.meter,
    })
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
    const createdEntries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
    const createdEntriesReadView = sourceStyleLocalArrayReadViewInternalV1(
      "style-created-entry-array",
      createdEntries,
    )
    pushStyleEntryMeteredInternalV1(createdEntriesReadView, created, input.meter)
    return [styleLeafMeteredInternalV1(
      createdEntries,
      input.meter,
      "style-created-entry-array",
    ), null]
  }
  const payload = styleNodePayloadMeteredInternalV1(input.node, input.meter)
  if (payload.kind === "leaf") {
    const entries: VNextTextBlockUnifiedLayoutSourceStyleRefcountEntryInternalV1[] = []
    let adjusted = false
    for (let entryIndex = 0; entryIndex < payload.occupancy; entryIndex += 1) {
      const currentFacts = styleEntryFactsAtMeteredInternalV1(
        payload.entries,
        entryIndex,
        input.meter,
      )
      const current = currentFacts.entry
      const compared = compareStyleKeysMeteredInternalV1(
        key,
        currentFacts.key,
        input.meter,
      )
      if (compared === 0) {
        const bucketPayload = styleBucketPayloadMeteredInternalV1(current, input.meter)
        const bucket: VNextTextBlockUnifiedLayoutSourceStyleBucketItemInternalV1[] = []
        let exactAdjusted = false
        let insertedCollisionItem = false
        const insertCollisionItem = (): void => {
          meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => {
              const item = Object.freeze({
                style: input.style,
                canonicalFacts: input.canonicalFacts,
                refcount: 1,
              })
              bucket.push(item)
            },
          })
          insertedCollisionItem = true
          adjusted = true
        }
        for (let bucketIndex = 0; bucketIndex < bucketPayload.occupancy; bucketIndex += 1) {
          const itemFacts = styleBucketItemFactsAtMeteredInternalV1(
            bucketPayload.bucket,
            bucketIndex,
            input.meter,
          )
          const factsCompared = meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => itemFacts.canonicalFacts === input.canonicalFacts
              ? 0
              : itemFacts.canonicalFacts < input.canonicalFacts ? -1 : 1,
          })
          if (factsCompared !== 0) {
            if (
              input.delta > 0
              && !insertedCollisionItem
              && factsCompared > 0
            ) insertCollisionItem()
            pushStyleBucketItemMeteredInternalV1(bucket, itemFacts.item, input.meter)
            continue
          }
          const nextRefcount = meteredStyleOperationInternalV1({
            meter: input.meter,
            unit: "source-style-entries",
            operation: () => itemFacts.refcount + input.delta,
          })
          if (!Number.isSafeInteger(nextRefcount) || nextRefcount < 0) {
            throw new SourceStylePathCopyStopInternalV1("invalid")
          }
          if (nextRefcount > 0) {
            const nextItem = meteredStyleOperationInternalV1({
              meter: input.meter,
              unit: "source-style-entries",
              operation: () => Object.freeze({
                style: itemFacts.style,
                canonicalFacts: itemFacts.canonicalFacts,
                refcount: nextRefcount,
              }),
            })
            pushStyleBucketItemMeteredInternalV1(bucket, nextItem, input.meter)
          }
          exactAdjusted = true
          adjusted = true
        }
        if (!exactAdjusted && input.delta > 0) {
          if (!insertedCollisionItem) insertCollisionItem()
        }
        const bucketOccupancy = meteredStyleOperationInternalV1({
          meter: input.meter,
          unit: "source-style-buckets",
          operation: () => bucket.length,
        })
        if (bucketOccupancy > 0) {
          const nextEntry = styleEntryMeteredInternalV1({
            measurementStyleKey: currentFacts.key[0],
            effectiveShapingStyleKey: currentFacts.key[1],
            styleFingerprint: currentFacts.key[2],
            bucket,
            meter: input.meter,
          })
          pushStyleEntryMeteredInternalV1(entries, nextEntry, input.meter)
        }
      } else {
        if (!adjusted && compared < 0 && input.delta > 0) {
          pushStyleEntryMeteredInternalV1(
            entries,
            nextStyleEntryMeteredInternalV1(input),
            input.meter,
          )
          adjusted = true
        }
        meteredStyleOperationInternalV1({
          meter: input.meter,
          unit: "source-style-entries",
          operation: () => { entries.push(current) },
        })
      }
    }
    if (!adjusted) {
      if (input.delta < 0) throw new SourceStylePathCopyStopInternalV1("invalid")
      pushStyleEntryMeteredInternalV1(
        entries,
        nextStyleEntryMeteredInternalV1(input),
        input.meter,
      )
    }
    const entryCount = meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-entries",
      operation: () => entries.length,
    })
    if (entryCount === 0) return [null, null]
    if (entryCount <= 8) return [styleLeafMeteredInternalV1(
      entries,
      input.meter,
      "style-adjusted-entries",
    ), null]
    const entriesReadView = sourceStyleLocalArrayReadViewInternalV1(
      "style-adjusted-entries",
      entries,
    )
    return [
      styleLeafMeteredInternalV1(copyStyleEntriesMeteredInternalV1({
        entries: entriesReadView,
        start: 0,
        end: 4,
        meter: input.meter,
      }), input.meter),
      styleLeafMeteredInternalV1(copyStyleEntriesMeteredInternalV1({
        entries: entriesReadView,
        start: 4,
        end: entryCount,
        meter: input.meter,
      }), input.meter),
    ]
  }
  let childIndex = payload.occupancy - 1
  for (let index = 0; index < payload.occupancy; index += 1) {
    const child = styleChildAtMeteredInternalV1(payload.children, index, input.meter)
    const lastKey = meteredStyleOperationInternalV1({
      meter: input.meter,
      unit: "source-style-entries",
      operation: () => child.lastKey,
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
    node: styleChildAtMeteredInternalV1(payload.children, childIndex, input.meter),
    isRoot: false,
  })
  let children = copyStyleChildrenMeteredInternalV1({
    children: payload.children,
    start: 0,
    end: payload.occupancy,
    meter: input.meter,
  })
  const replacements: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] = []
  if (left != null) pushStyleChildMeteredInternalV1(replacements, left, input.meter)
  if (right != null) pushStyleChildMeteredInternalV1(replacements, right, input.meter)
  replaceStyleChildrenMeteredInternalV1({
    children,
    start: childIndex,
    deleteCount: 1,
    replacements,
    meter: input.meter,
  })
  if (left != null && right == null) {
    children = rebalanceStyleChildMeteredInternalV1({
      children,
      childIndex,
      meter: input.meter,
    })
  }
  const childCount = meteredStyleOperationInternalV1({
    meter: input.meter,
    unit: "source-style-nodes",
    operation: () => children.length,
  })
  if (childCount === 0) return [null, null]
  if (input.isRoot && childCount === 1) {
    return [styleChildAtMeteredInternalV1(children, 0, input.meter), null]
  }
  if (childCount <= 8) return [styleBranchMeteredInternalV1(children, input.meter), null]
  return [
    styleBranchMeteredInternalV1(copyStyleChildrenMeteredInternalV1({
      children,
      start: 0,
      end: 4,
      meter: input.meter,
    }), input.meter),
    styleBranchMeteredInternalV1(copyStyleChildrenMeteredInternalV1({
      children,
      start: 4,
      end: childCount,
      meter: input.meter,
    }), input.meter),
  ]
}

function styleInputItemCountMeteredInternalV1(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): number {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => items.length,
  })
}

function styleInputItemStyleAtMeteredInternalV1(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  index: number,
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockUnifiedLayoutSourceStyleV1 | null {
  return meteredStyleOperationInternalV1({
    meter,
    unit: "source-style-entries",
    operation: () => {
      const item = items[index]
      if (item == null) throw new SourceStylePathCopyStopInternalV1("invalid")
      return item.kind === "text"
          || item.kind === "resolved-field"
          || item.kind === "generated-page-number"
        ? item.style
        : null
    },
  })
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
      items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
      index: number,
      delta: -1 | 1,
    ): void => {
      const style = styleInputItemStyleAtMeteredInternalV1(items, index, input.workMeter)
      if (style == null) return
      const facts = meteredStyleOperationInternalV1({
        meter: input.workMeter,
        unit: "source-style-entries",
        operation: () => canonicalVNextTextBlockUnifiedLayoutSourceStyleFactsInternalV1(style),
      })
      const styleFingerprint = meteredStyleOperationInternalV1({
        meter: input.workMeter,
        unit: "source-style-entries",
        operation: () => fingerprintFactory(facts),
      })
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
        : (() => {
            if (left == null) throw new SourceStylePathCopyStopInternalV1("invalid")
            const children: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1[] = []
            pushStyleChildMeteredInternalV1(children, left, input.workMeter)
            pushStyleChildMeteredInternalV1(children, right, input.workMeter)
            return styleBranchMeteredInternalV1(children, input.workMeter)
          })()
    }
    const removedCount = styleInputItemCountMeteredInternalV1(
      input.removedItems,
      input.workMeter,
    )
    for (let index = 0; index < removedCount; index += 1) {
      apply(input.removedItems, index, -1)
    }
    const nextCount = styleInputItemCountMeteredInternalV1(
      input.nextPhysicalItems,
      input.workMeter,
    )
    for (let index = 0; index < nextCount; index += 1) {
      apply(input.nextPhysicalItems, index, 1)
    }
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
