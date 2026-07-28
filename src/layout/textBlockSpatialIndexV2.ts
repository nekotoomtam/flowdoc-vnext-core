import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { hasVNextTextBlockFlowEvidenceBindingInternalV2, inspectVNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceV2.js"
import { inspectVNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import {
  getVNextTextBlockV2LayoutAuthorityInternalV1,
} from "./textBlockLayoutAuthorityInternalsV1.js"
import { inspectVNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowTreeV2.js"
import {
  buildVNextTextBlockSpatialIndexRootKernelV1,
  queryVNextTextBlockSpatialIndexKernelV1,
  type VNextTextBlockSpatialIndexNodeMaterializerKernelV1,
} from "./textBlockSpatialIndexKernelV1.js"
import { parseSpatialEntriesV1 } from "./textBlockSpatialIndexInternalsV1.js"
import type { VNextTextBlockSpatialIndexEntryV1, VNextTextBlockSpatialIndexNodeV1 } from "./textBlockSpatialIndexContractV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_SOURCE,
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_VERSION,
  type VNextTextBlockSpatialIndexBuildInputV2,
  type VNextTextBlockSpatialIndexBuildResultV2,
  type VNextTextBlockSpatialIndexInspectionV2,
  type VNextTextBlockSpatialIndexV2,
  type VNextTextBlockSpatialIssueV2,
} from "./textBlockSpatialIndexContractV2.js"

type Authority = NonNullable<ReturnType<typeof getVNextTextBlockV2LayoutAuthorityInternalV1>>
type BoundIndex = { initialFlow: object; evidence: object; tree: object; authority: Authority; entries: ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1>; canonicalFacts: string; fingerprint: string }

const indexes = new WeakSet<object>()
const bindings = new WeakMap<VNextTextBlockSpatialIndexV2, BoundIndex>()

export function fingerprintV2(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function deepFreezeSpatialV2<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreezeSpatialV2(child)
  return Object.freeze(value)
}

export function deeplyFrozenSpatialV2(value: unknown): boolean {
  return value != null && typeof value === "object" && Object.isFrozen(value)
    && Object.values(value).every((child) => child == null || typeof child !== "object" || deeplyFrozenSpatialV2(child))
}

function issue(code: VNextTextBlockSpatialIssueV2["code"], path: string, message: string, objectId?: string): VNextTextBlockSpatialIssueV2 {
  return { code, severity: "error", path, message, ...(objectId == null ? {} : { objectId }) }
}

export function blockedIndexV2(issues: readonly VNextTextBlockSpatialIssueV2[]): VNextTextBlockSpatialIndexBuildResultV2 {
  return { status: "blocked", index: null, issues }
}

function exactBuildInput(value: unknown): VNextTextBlockSpatialIndexBuildInputV2 | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const keys = Reflect.ownKeys(value)
    const expected = ["inputAuthority", "initialFlow", "evidence", "persistentFlowTree", "entries"]
    if (keys.length !== expected.length || keys.some((key) => typeof key !== "string" || !expected.includes(key))) return null
    const copy = Object.create(null) as Record<string, unknown>
    for (const key of expected) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      copy[key] = descriptor.value
    }
    const entries = snapshotEntries(copy.entries)
    return entries == null ? null : { ...copy, entries } as unknown as VNextTextBlockSpatialIndexBuildInputV2
  } catch { return null }
}

function exactDataRecord(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const actual = Reflect.ownKeys(value)
    if (actual.length !== keys.length || actual.some((key) => typeof key !== "string" || !keys.includes(key))) return null
    const result = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      result[key] = descriptor.value
    }
    return result
  } catch { return null }
}

function snapshotEntries(value: unknown): VNextTextBlockSpatialIndexBuildInputV2["entries"] | null {
  if (!Array.isArray(value)) return null
  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return null
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (length == null || !Object.hasOwn(length, "value") || !Number.isSafeInteger(length.value) || length.value < 0) return null
    if (Reflect.ownKeys(value).length !== length.value + 1) return null
    const entries: unknown[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      const entry = exactDataRecord(descriptor.value, ["objectId", "geometryOwnerFingerprint", "xLayoutUnit", "yLayoutUnit", "widthLayoutUnit", "heightLayoutUnit", "clearance", "wrapPolicy"])
      const clearance = entry == null ? null : exactDataRecord(entry.clearance, ["topLayoutUnit", "rightLayoutUnit", "bottomLayoutUnit", "leftLayoutUnit"])
      if (entry == null || clearance == null) return null
      entries.push({ ...entry, clearance })
    }
    return entries as VNextTextBlockSpatialIndexBuildInputV2["entries"]
  } catch { return null }
}

function resolveAuthority(input: Omit<VNextTextBlockSpatialIndexBuildInputV2, "inputAuthority" | "entries">): Authority | null {
  if (inspectVNextTextBlockInitialFlowV1(input.initialFlow).status !== "valid") return null
  if (inspectVNextTextBlockFlowEvidenceV2(input.evidence).status !== "valid") return null
  if (inspectVNextTextBlockPersistentFlowTreeV2(input.persistentFlowTree).status !== "valid") return null
  if (!hasVNextTextBlockFlowEvidenceBindingInternalV2(input.evidence, input.initialFlow)) return null
  if (
    input.evidence.initialFlowFingerprint !== input.initialFlow.fingerprint
    || input.persistentFlowTree.initialFlowFingerprint !== input.initialFlow.fingerprint
    || input.persistentFlowTree.flowEvidenceFingerprint !== input.evidence.fingerprint
  ) return null
  return getVNextTextBlockV2LayoutAuthorityInternalV1(input)
}

export const materializeVNextTextBlockSpatialIndexNodeV2: VNextTextBlockSpatialIndexNodeMaterializerKernelV1 = (input) => {
  const facts = { entry: input.entry, priorityFingerprint: input.entry.fingerprint, leftFingerprint: input.left?.fingerprint ?? null, rightFingerprint: input.right?.fingerprint ?? null, summary: input.summary }
  return deepFreezeSpatialV2({ ...input, priorityFingerprint: input.entry.fingerprint, fingerprint: fingerprintV2(facts) })
}

export function createSpatialIndexFromRootV2(input: Omit<VNextTextBlockSpatialIndexBuildInputV2, "inputAuthority" | "entries"> & {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  authority: Authority
  entries: ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1>
}): VNextTextBlockSpatialIndexV2 {
  const summary = input.root?.summary ?? { entryCount: 0, nodeCount: 0, maximumBottomLayoutUnit: 0, flowAffectingEntryCount: 0, barrierEntryCount: 0, overlayEntryCount: 0 }
  const facts = {
    source: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_VERSION,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: input.persistentFlowTree.documentId, sectionId: input.persistentFlowTree.sectionId,
    textBlockId: input.persistentFlowTree.textBlockId, instanceRevision: input.persistentFlowTree.instanceRevision,
    layoutId: input.persistentFlowTree.layoutId, layoutContextFingerprint: input.persistentFlowTree.layoutContextFingerprint,
    initialFlowFingerprint: input.initialFlow.fingerprint, flowEvidenceFingerprint: input.evidence.fingerprint,
    persistentFlowTreeFingerprint: input.persistentFlowTree.fingerprint,
    contentLeftLayoutUnit: 0 as const, contentRightLayoutUnit: input.evidence.availableWidthLayoutUnit,
    root: input.root, summary,
    contracts: { canonicalPositionedObjectSchema: false as const, authoredPositionedObjectBinding: false as const, sharedPersistentTreap: true as const, processLocalImmutableIndex: true as const, mayPublishLayout: false as const, productionBinding: false as const },
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const index = deepFreezeSpatialV2({ ...facts, fingerprint: createVNextCompactFingerprint(canonicalFacts) })
  indexes.add(index)
  bindings.set(index, { initialFlow: input.initialFlow, evidence: input.evidence, tree: input.persistentFlowTree, authority: input.authority, entries: new Map(input.entries), canonicalFacts, fingerprint: index.fingerprint })
  return index
}

export function createVNextTextBlockSpatialIndexV2(input: VNextTextBlockSpatialIndexBuildInputV2): VNextTextBlockSpatialIndexBuildResultV2
export function createVNextTextBlockSpatialIndexV2(input: unknown): VNextTextBlockSpatialIndexBuildResultV2
export function createVNextTextBlockSpatialIndexV2(input: unknown): VNextTextBlockSpatialIndexBuildResultV2 {
  const envelope = exactBuildInput(input)
  if (envelope == null) return blockedIndexV2([issue("invalid-input", "input", "spatial V2 index requires an exact accessor-free data envelope")])
  if (envelope.inputAuthority !== "core-synthetic-qa-only") return blockedIndexV2([issue("input-authority-mismatch", "inputAuthority", "spatial V2 index accepts strict Core synthetic QA inputs only")])
  const authority = resolveAuthority(envelope)
  if (authority == null) return blockedIndexV2([issue("layout-authority-mismatch", "initialFlow", "spatial V2 index requires the exact process-local Initial Flow, evidence, tree, and layout authority")])
  const parsed = parseSpatialEntriesV1({ values: envelope.entries, contentRightLayoutUnit: envelope.evidence.availableWidthLayoutUnit })
  if (parsed.issues.length > 0) return blockedIndexV2(parsed.issues.map((item) => issue(item.code, item.path, item.message, item.objectId)))
  return { status: "accepted", index: createSpatialIndexFromRootV2({ ...envelope, root: buildVNextTextBlockSpatialIndexRootKernelV1(parsed.entries, materializeVNextTextBlockSpatialIndexNodeV2), authority, entries: new Map(parsed.entries.map((entry) => [entry.objectId, entry])) }), issues: [] }
}

export function inspectVNextTextBlockSpatialIndexV2(index: unknown): VNextTextBlockSpatialIndexInspectionV2 {
  if (index == null || typeof index !== "object" || !indexes.has(index)) return { status: "invalid", code: "spatial-index-provenance-mismatch", message: "spatial V2 index is not the exact process-local Core object" }
  if (!deeplyFrozenSpatialV2(index)) return { status: "invalid", code: "spatial-index-not-deeply-frozen", message: "registered spatial V2 index must remain recursively frozen" }
  try {
    const accepted = index as VNextTextBlockSpatialIndexV2
    const binding = bindings.get(accepted)
    const { fingerprint, ...facts } = accepted
    const canonicalFacts = stringifyVNextCanonicalJson(facts)
    if (binding == null || fingerprint !== createVNextCompactFingerprint(canonicalFacts) || binding.fingerprint !== fingerprint || binding.canonicalFacts !== canonicalFacts) return { status: "invalid", code: "spatial-index-provenance-mismatch", message: "registered spatial V2 index no longer matches canonical Core facts" }
    return { status: "valid", fingerprint }
  } catch { return { status: "invalid", code: "spatial-index-provenance-mismatch", message: "registered spatial V2 index is not canonically fingerprintable" } }
}

export function hasSpatialIndexBindingV2(input: Omit<VNextTextBlockSpatialIndexBuildInputV2, "inputAuthority" | "entries"> & { index: VNextTextBlockSpatialIndexV2 }): boolean {
  const binding = bindings.get(input.index)
  const authority = resolveAuthority(input)
  return inspectVNextTextBlockSpatialIndexV2(input.index).status === "valid" && binding != null && authority != null && binding.initialFlow === input.initialFlow && binding.evidence === input.evidence && binding.tree === input.persistentFlowTree && binding.authority === authority
}

export function getSpatialIndexEntriesV2(index: VNextTextBlockSpatialIndexV2): ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1> | null {
  const entries = bindings.get(index)?.entries
  return entries == null ? null : new Map(entries)
}

export function queryVNextTextBlockSpatialIndexV2(index: VNextTextBlockSpatialIndexV2, band: { topLayoutUnit: number; bottomLayoutUnit: number }) {
  return queryVNextTextBlockSpatialIndexKernelV1({ root: index.root, topLayoutUnit: band.topLayoutUnit, bottomLayoutUnit: band.bottomLayoutUnit })
}
