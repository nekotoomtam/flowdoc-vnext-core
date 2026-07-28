import { createSpatialEntryV1 } from "./textBlockSpatialIndexInternalsV1.js"
import { updateVNextTextBlockSpatialIndexRootKernelV1 } from "./textBlockSpatialIndexKernelV1.js"
import {
  createSpatialIndexFromRootV2,
  deepFreezeSpatialV2,
  fingerprintV2,
  getSpatialIndexEntriesV2,
  hasSpatialIndexBindingV2,
  inspectVNextTextBlockSpatialIndexV2,
  materializeVNextTextBlockSpatialIndexNodeV2,
} from "./textBlockSpatialIndexV2.js"
import { getVNextTextBlockV2LayoutAuthorityInternalV1 } from "./textBlockLayoutAuthorityInternalsV1.js"
import type {
  VNextTextBlockSpatialBandV1,
  VNextTextBlockSpatialIndexUpdateResultV2,
  VNextTextBlockSpatialIndexV2,
  VNextTextBlockSpatialIssueV2,
} from "./textBlockSpatialIndexContractV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"

const updates = new WeakMap<object, { previousIndex: object; nextIndex: object }>()
const issue = (code: VNextTextBlockSpatialIssueV2["code"], path: string, message: string, objectId?: string): VNextTextBlockSpatialIssueV2 => ({ code, severity: "error", path, message, ...(objectId == null ? {} : { objectId }) })
const blocked = (issues: readonly VNextTextBlockSpatialIssueV2[]): VNextTextBlockSpatialIndexUpdateResultV2 => ({ status: "blocked", update: null, nextIndex: null, issues })

type UpdateInput = {
  initialFlow: VNextTextBlockInitialFlowV1; evidence: VNextTextBlockFlowEvidenceV2; persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  previousIndex: VNextTextBlockSpatialIndexV2; expectedPreviousIndexFingerprint: string; objectId: string
  nextGeometry: { xLayoutUnit: number; yLayoutUnit: number; widthLayoutUnit: number; heightLayoutUnit: number }
}
function exactRecord(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const actual = Reflect.ownKeys(value)
    if (actual.length !== keys.length || actual.some((key) => typeof key !== "string" || !keys.includes(key))) return null
    const copy = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      copy[key] = descriptor.value
    }
    return copy
  } catch { return null }
}
function exactUpdateInput(value: unknown): UpdateInput | null {
  const outer = exactRecord(value, ["initialFlow", "evidence", "persistentFlowTree", "previousIndex", "expectedPreviousIndexFingerprint", "objectId", "nextGeometry"])
  if (outer == null) return null
  const geometry = exactRecord(outer.nextGeometry, ["xLayoutUnit", "yLayoutUnit", "widthLayoutUnit", "heightLayoutUnit"])
  return geometry == null ? null : { ...outer, nextGeometry: geometry } as unknown as UpdateInput
}

function affectedBands(first: VNextTextBlockSpatialBandV1, second: VNextTextBlockSpatialBandV1): readonly VNextTextBlockSpatialBandV1[] {
  const [earlier, later] = [first, second].sort((left, right) => left.topLayoutUnit - right.topLayoutUnit || left.bottomLayoutUnit - right.bottomLayoutUnit)
  return later.topLayoutUnit <= earlier.bottomLayoutUnit
    ? [{ topLayoutUnit: earlier.topLayoutUnit, bottomLayoutUnit: Math.max(earlier.bottomLayoutUnit, later.bottomLayoutUnit) }]
    : [earlier, later]
}

export function createVNextTextBlockSpatialIndexUpdateV2(input: UpdateInput): VNextTextBlockSpatialIndexUpdateResultV2
export function createVNextTextBlockSpatialIndexUpdateV2(input: unknown): VNextTextBlockSpatialIndexUpdateResultV2
export function createVNextTextBlockSpatialIndexUpdateV2(input: unknown): VNextTextBlockSpatialIndexUpdateResultV2 {
  const envelope = exactUpdateInput(input)
  if (envelope == null) return blocked([issue("invalid-input", "input", "spatial V2 update requires an exact accessor-free data envelope")])
  input = envelope
  if (inspectVNextTextBlockSpatialIndexV2(input.previousIndex).status !== "valid" || !hasSpatialIndexBindingV2({ ...input, index: input.previousIndex })) return blocked([issue("spatial-index-binding-mismatch", "previousIndex", "spatial V2 update requires the exact authority-bound prior index")])
  if (input.expectedPreviousIndexFingerprint !== input.previousIndex.fingerprint) return blocked([issue("spatial-index-stale", "expectedPreviousIndexFingerprint", "expected previous spatial index fingerprint is stale")])
  const entries = getSpatialIndexEntriesV2(input.previousIndex)
  const previousEntry = entries?.get(input.objectId)
  if (previousEntry == null) return blocked([issue("spatial-object-not-found", "objectId", `positioned object \"${input.objectId}\" was not found`, input.objectId)])
  const created = createSpatialEntryV1({ value: { objectId: previousEntry.objectId, geometryOwnerFingerprint: previousEntry.geometryOwnerFingerprint, ...input.nextGeometry, clearance: previousEntry.clearance, wrapPolicy: previousEntry.wrapPolicy }, contentRightLayoutUnit: input.previousIndex.contentRightLayoutUnit, path: "nextGeometry" })
  if (created.status === "blocked") return blocked([issue(created.issue.code, created.issue.path, created.issue.message, created.issue.objectId)])
  if (created.entry.fingerprint === previousEntry.fingerprint) return blocked([issue("no-spatial-change", "nextGeometry", "spatial update must change positioned-object geometry", input.objectId)])
  const kernel = updateVNextTextBlockSpatialIndexRootKernelV1({ root: input.previousIndex.root, previousEntry, nextEntry: created.entry, materializeNode: materializeVNextTextBlockSpatialIndexNodeV2 })
  const authority = getVNextTextBlockV2LayoutAuthorityInternalV1(input)
  if (authority == null || entries == null) return blocked([issue("layout-authority-mismatch", "persistentFlowTree", "spatial V2 update requires the retained V2 layout authority")])
  const nextEntries = new Map(entries)
  nextEntries.set(input.objectId, created.entry)
  const nextIndex = createSpatialIndexFromRootV2({ initialFlow: input.initialFlow, evidence: input.evidence, persistentFlowTree: input.persistentFlowTree, root: kernel.root, authority, entries: nextEntries })
  const work = { deleteVisitedNodeCount: kernel.deleteVisitedNodeCount, insertVisitedNodeCount: kernel.insertVisitedNodeCount, createdNodeCount: kernel.createdNodeCount, completeIndexRebuildCount: 0 as const }
  const facts = { source: "vnext-text-block-spatial-index-update-v2" as const, contractVersion: 2 as const, previousIndexFingerprint: input.previousIndex.fingerprint, nextIndexFingerprint: nextIndex.fingerprint, affectedBands: affectedBands({ topLayoutUnit: previousEntry.envelope.topLayoutUnit, bottomLayoutUnit: previousEntry.envelope.bottomLayoutUnit }, { topLayoutUnit: created.entry.envelope.topLayoutUnit, bottomLayoutUnit: created.entry.envelope.bottomLayoutUnit }), work }
  const update = deepFreezeSpatialV2({ ...facts, fingerprint: fingerprintV2(facts) })
  updates.set(update, { previousIndex: input.previousIndex, nextIndex })
  return { status: "accepted", update, nextIndex, issues: [] }
}

export function inspectVNextTextBlockSpatialIndexUpdateV2(value: unknown): { status: "valid"; fingerprint: string } | { status: "invalid"; code: "spatial-update-provenance-mismatch" | "spatial-update-binding-mismatch"; message: string } {
  if (value == null || typeof value !== "object" || !updates.has(value)) return { status: "invalid", code: "spatial-update-provenance-mismatch", message: "spatial V2 update is not the exact process-local Core object" }
  if (!Object.isFrozen(value)) return { status: "invalid", code: "spatial-update-binding-mismatch", message: "spatial V2 update must remain frozen" }
  return { status: "valid", fingerprint: (value as { fingerprint: string }).fingerprint }
}
