import { createSpatialEntryV1 } from "./textBlockSpatialIndexInternalsV1.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { updateVNextTextBlockSpatialIndexRootKernelV1 } from "./textBlockSpatialIndexKernelV1.js"
import {
  createSpatialIndexFromRootV2,
  deepFreezeSpatialV2,
  deeplyFrozenSpatialV2,
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

const updates = new WeakMap<object, { previousIndex: VNextTextBlockSpatialIndexV2; nextIndex: VNextTextBlockSpatialIndexV2; canonicalFacts: string; fingerprint: string }>()
const issue = (code: VNextTextBlockSpatialIssueV2["code"], path: string, message: string, objectId?: string): VNextTextBlockSpatialIssueV2 => ({ code, severity: "error", path, message, ...(objectId == null ? {} : { objectId }) })
const blocked = (issues: readonly VNextTextBlockSpatialIssueV2[]): VNextTextBlockSpatialIndexUpdateResultV2 => ({ status: "blocked", update: null, nextIndex: null, issues })

type UpdateInput = {
  initialFlow: VNextTextBlockInitialFlowV1; evidence: VNextTextBlockFlowEvidenceV2; persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  previousIndex: VNextTextBlockSpatialIndexV2; expectedPreviousIndexFingerprint: string; objectId: string; geometryOwnerFingerprint: string
  nextGeometry: { xLayoutUnit: number; yLayoutUnit: number; widthLayoutUnit: number; heightLayoutUnit: number }
}
function exactRecord(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
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
  const outer = exactRecord(value, ["initialFlow", "evidence", "persistentFlowTree", "previousIndex", "expectedPreviousIndexFingerprint", "objectId", "geometryOwnerFingerprint", "nextGeometry"])
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
  const acceptedInput = envelope
  if (inspectVNextTextBlockSpatialIndexV2(acceptedInput.previousIndex).status !== "valid" || !hasSpatialIndexBindingV2({ ...acceptedInput, index: acceptedInput.previousIndex })) return blocked([issue("spatial-index-binding-mismatch", "previousIndex", "spatial V2 update requires the exact authority-bound prior index")])
  if (acceptedInput.expectedPreviousIndexFingerprint !== acceptedInput.previousIndex.fingerprint) return blocked([issue("spatial-index-stale", "expectedPreviousIndexFingerprint", "expected previous spatial index fingerprint is stale")])
  const entries = getSpatialIndexEntriesV2(acceptedInput.previousIndex)
  const previousEntry = entries?.get(acceptedInput.objectId)
  if (previousEntry == null) return blocked([issue("spatial-object-not-found", "objectId", `positioned object \"${acceptedInput.objectId}\" was not found`, acceptedInput.objectId)])
  if (acceptedInput.geometryOwnerFingerprint !== previousEntry.geometryOwnerFingerprint) return blocked([issue("spatial-owner-mismatch", "geometryOwnerFingerprint", "positioned object geometry owner fingerprint does not match", acceptedInput.objectId)])
  const created = createSpatialEntryV1({ value: { objectId: previousEntry.objectId, geometryOwnerFingerprint: previousEntry.geometryOwnerFingerprint, ...acceptedInput.nextGeometry, clearance: previousEntry.clearance, wrapPolicy: previousEntry.wrapPolicy }, contentRightLayoutUnit: acceptedInput.previousIndex.contentRightLayoutUnit, path: "nextGeometry" })
  if (created.status === "blocked") return blocked([issue(created.issue.code, created.issue.path, created.issue.message, created.issue.objectId)])
  if (created.entry.fingerprint === previousEntry.fingerprint) return blocked([issue("no-spatial-change", "nextGeometry", "spatial update must change positioned-object geometry", acceptedInput.objectId)])
  const kernel = updateVNextTextBlockSpatialIndexRootKernelV1({ root: acceptedInput.previousIndex.root, previousEntry, nextEntry: created.entry, materializeNode: materializeVNextTextBlockSpatialIndexNodeV2 })
  const authority = getVNextTextBlockV2LayoutAuthorityInternalV1(acceptedInput)
  if (authority == null || entries == null) return blocked([issue("layout-authority-mismatch", "persistentFlowTree", "spatial V2 update requires the retained V2 layout authority")])
  const nextEntries = new Map(entries)
  nextEntries.set(acceptedInput.objectId, created.entry)
  const nextIndex = createSpatialIndexFromRootV2({ initialFlow: acceptedInput.initialFlow, evidence: acceptedInput.evidence, persistentFlowTree: acceptedInput.persistentFlowTree, root: kernel.root, authority, entries: nextEntries })
  const work = { deleteVisitedNodeCount: kernel.deleteVisitedNodeCount, insertVisitedNodeCount: kernel.insertVisitedNodeCount, createdNodeCount: kernel.createdNodeCount, completeIndexRebuildCount: 0 as const }
  const facts = { source: "vnext-text-block-spatial-index-update-v2" as const, contractVersion: 2 as const, previousIndexFingerprint: acceptedInput.previousIndex.fingerprint, nextIndexFingerprint: nextIndex.fingerprint, geometryOwnerFingerprint: acceptedInput.geometryOwnerFingerprint, affectedBands: affectedBands({ topLayoutUnit: previousEntry.envelope.topLayoutUnit, bottomLayoutUnit: previousEntry.envelope.bottomLayoutUnit }, { topLayoutUnit: created.entry.envelope.topLayoutUnit, bottomLayoutUnit: created.entry.envelope.bottomLayoutUnit }), work, mayPublishLayout: false as const, productionBinding: false as const }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const update = deepFreezeSpatialV2({ ...facts, fingerprint: fingerprintV2(facts) })
  updates.set(update, { previousIndex: acceptedInput.previousIndex, nextIndex, canonicalFacts, fingerprint: update.fingerprint })
  return { status: "accepted", update, nextIndex, issues: [] }
}

export function inspectVNextTextBlockSpatialIndexUpdateV2(input: { update: unknown; previousIndex: VNextTextBlockSpatialIndexV2; nextIndex: VNextTextBlockSpatialIndexV2 }): { status: "valid"; fingerprint: string } | { status: "invalid"; code: "spatial-update-provenance-mismatch" | "spatial-update-binding-mismatch"; message: string } {
  const update = input.update
  if (update == null || typeof update !== "object" || !updates.has(update)) return { status: "invalid", code: "spatial-update-provenance-mismatch", message: "spatial V2 update is not the exact process-local Core object" }
  if (!deeplyFrozenSpatialV2(update)) return { status: "invalid", code: "spatial-update-binding-mismatch", message: "spatial V2 update must remain recursively frozen" }
  try {
    const accepted = update as { fingerprint: string; previousIndexFingerprint: string; nextIndexFingerprint: string }
    const stored = updates.get(update)!
    const { fingerprint, ...facts } = accepted
    const canonicalFacts = stringifyVNextCanonicalJson(facts)
    if (stored.previousIndex !== input.previousIndex || stored.nextIndex !== input.nextIndex || accepted.previousIndexFingerprint !== input.previousIndex.fingerprint || accepted.nextIndexFingerprint !== input.nextIndex.fingerprint || stored.fingerprint !== fingerprint || stored.canonicalFacts !== canonicalFacts || fingerprint !== fingerprintV2(facts)) return { status: "invalid", code: "spatial-update-binding-mismatch", message: "spatial V2 update does not match its exact index pair and canonical facts" }
    return { status: "valid", fingerprint }
  } catch { return { status: "invalid", code: "spatial-update-provenance-mismatch", message: "spatial V2 update is not canonically fingerprintable" } }
}
