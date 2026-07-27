import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_UPDATE_SOURCE,
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_UPDATE_VERSION,
  type VNextTextBlockSpatialBandV1,
  type VNextTextBlockSpatialIndexIssueV1,
  type VNextTextBlockSpatialIndexUpdateInspectionV1,
  type VNextTextBlockSpatialIndexUpdateResultV1,
  type VNextTextBlockSpatialIndexUpdateV1,
  type VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  createSpatialEntryV1,
  createSpatialIndexFromRootV1,
  deepFreezeSpatialV1,
  deleteSpatialNodePathCopyV1,
  getSpatialIndexEntriesBindingV1,
  getSpatialIndexEntryBindingV1,
  hasSpatialIndexBindingV1,
  hasSpatialIndexProvenanceV1,
  insertSpatialNodePathCopyV1,
  spatialFingerprintV1,
  spatialIssueV1,
} from "./textBlockSpatialIndexInternalsV1.js"

const processLocalSpatialUpdatesV1 = new WeakMap<
  VNextTextBlockSpatialIndexUpdateV1,
  {
    previousIndex: VNextTextBlockSpatialIndexV1
    nextIndex: VNextTextBlockSpatialIndexV1
    previousIndexFingerprint: string
    nextIndexFingerprint: string
  }
>()

function blocked(
  issues: VNextTextBlockSpatialIndexIssueV1[],
): VNextTextBlockSpatialIndexUpdateResultV1 {
  return {
    status: "blocked",
    update: null,
    nextIndex: null,
    work: null,
    issues,
  }
}

function affectedBandsV1(
  first: VNextTextBlockSpatialBandV1,
  second: VNextTextBlockSpatialBandV1,
): readonly VNextTextBlockSpatialBandV1[] {
  const [earlier, later] = [first, second].sort((
    left,
    right,
  ) => left.topLayoutUnit - right.topLayoutUnit || left.bottomLayoutUnit - right.bottomLayoutUnit)
  if (later.topLayoutUnit <= earlier.bottomLayoutUnit) return [{
    topLayoutUnit: earlier.topLayoutUnit,
    bottomLayoutUnit: Math.max(earlier.bottomLayoutUnit, later.bottomLayoutUnit),
  }]
  return [earlier, later]
}

export function createVNextTextBlockSpatialIndexUpdateV1(input: {
  previousIndex: VNextTextBlockSpatialIndexV1
  expectedPreviousIndexFingerprint: string
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  objectId: string
  geometryOwnerFingerprint: string
  nextGeometry: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
}): VNextTextBlockSpatialIndexUpdateResultV1 {
  if (
    !hasSpatialIndexProvenanceV1(input.previousIndex)
    || !hasSpatialIndexBindingV1({
      index: input.previousIndex,
      persistentFlowTree: input.persistentFlowTree,
      request: input.request,
    })
  ) return blocked([
    spatialIssueV1(
      "spatial-index-stale",
      "previousIndex",
      "spatial update requires the exact index, persistent flow tree, and unchanged request",
    ),
  ])
  if (input.expectedPreviousIndexFingerprint !== input.previousIndex.fingerprint) {
    return blocked([
      spatialIssueV1(
        "spatial-index-stale",
        "expectedPreviousIndexFingerprint",
        "expected previous spatial index fingerprint is stale",
      ),
    ])
  }
  const previousEntry = getSpatialIndexEntryBindingV1(
    input.previousIndex,
    input.objectId,
  )
  if (previousEntry == null) return blocked([
    spatialIssueV1(
      "spatial-object-not-found",
      "objectId",
      `positioned object "${input.objectId}" was not found`,
      input.objectId,
    ),
  ])
  if (previousEntry.geometryOwnerFingerprint !== input.geometryOwnerFingerprint) {
    return blocked([
      spatialIssueV1(
        "spatial-owner-mismatch",
        "geometryOwnerFingerprint",
        "positioned object geometry owner fingerprint does not match",
        input.objectId,
      ),
    ])
  }
  const createdEntry = createSpatialEntryV1({
    value: {
      objectId: previousEntry.objectId,
      geometryOwnerFingerprint: previousEntry.geometryOwnerFingerprint,
      ...input.nextGeometry,
      clearance: previousEntry.clearance,
      wrapPolicy: previousEntry.wrapPolicy,
    },
    contentRightLayoutUnit: input.previousIndex.contentRightLayoutUnit,
    path: "nextGeometry",
  })
  if (createdEntry.status === "blocked") return blocked([createdEntry.issue])
  if (createdEntry.entry.fingerprint === previousEntry.fingerprint) return blocked([
    spatialIssueV1(
      "no-spatial-change",
      "nextGeometry",
      "spatial update must change the positioned object geometry",
      input.objectId,
    ),
  ])
  const entriesByObjectId = getSpatialIndexEntriesBindingV1(input.previousIndex)
  if (entriesByObjectId == null) return blocked([
    spatialIssueV1(
      "spatial-index-stale",
      "previousIndex",
      "spatial index entry binding is unavailable",
    ),
  ])
  const deleteWork = { visitedNodeCount: 0, createdNodeCount: 0 }
  const withoutPrevious = deleteSpatialNodePathCopyV1(
    input.previousIndex.root,
    previousEntry,
    deleteWork,
  )
  const insertWork = { visitedNodeCount: 0, createdNodeCount: 0 }
  const nextRoot = insertSpatialNodePathCopyV1(
    withoutPrevious,
    createdEntry.entry,
    insertWork,
  )
  const nextEntriesByObjectId = new Map(entriesByObjectId)
  nextEntriesByObjectId.set(input.objectId, createdEntry.entry)
  const nextIndex = createSpatialIndexFromRootV1({
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
    root: nextRoot,
    entriesByObjectId: nextEntriesByObjectId,
  })
  const work = {
    deleteVisitedNodeCount: deleteWork.visitedNodeCount,
    insertVisitedNodeCount: insertWork.visitedNodeCount,
    createdNodeCount: deleteWork.createdNodeCount + insertWork.createdNodeCount,
    completeIndexRebuildCount: 0 as const,
  }
  const facts = {
    source: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_UPDATE_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_UPDATE_VERSION,
    previousIndexFingerprint: input.previousIndex.fingerprint,
    nextIndex,
    objectId: input.objectId,
    previousEntryFingerprint: previousEntry.fingerprint,
    nextEntryFingerprint: createdEntry.entry.fingerprint,
    affectedBands: affectedBandsV1(
      {
        topLayoutUnit: previousEntry.envelope.topLayoutUnit,
        bottomLayoutUnit: previousEntry.envelope.bottomLayoutUnit,
      },
      {
        topLayoutUnit: createdEntry.entry.envelope.topLayoutUnit,
        bottomLayoutUnit: createdEntry.entry.envelope.bottomLayoutUnit,
      },
    ),
    work,
    contracts: {
      pathCopyUpdate: true as const,
      oldNewBandUnion: true as const,
      processLocalProofBinding: true as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  const update = deepFreezeSpatialV1({
    ...facts,
    fingerprint: spatialFingerprintV1(facts),
  })
  processLocalSpatialUpdatesV1.set(update, {
    previousIndex: input.previousIndex,
    nextIndex,
    previousIndexFingerprint: input.previousIndex.fingerprint,
    nextIndexFingerprint: nextIndex.fingerprint,
  })
  return deepFreezeSpatialV1({
    status: "accepted",
    update,
    nextIndex,
    work,
    issues: [],
  })
}

export function inspectVNextTextBlockSpatialIndexUpdateV1(input: {
  update: VNextTextBlockSpatialIndexUpdateV1
  previousIndex: VNextTextBlockSpatialIndexV1
  nextIndex: VNextTextBlockSpatialIndexV1
}): VNextTextBlockSpatialIndexUpdateInspectionV1 {
  const binding = processLocalSpatialUpdatesV1.get(input.update)
  if (binding == null) return {
    status: "invalid",
    code: "spatial-update-provenance-mismatch",
    message: "spatial update is not the exact process-local proof created by Core",
  }
  if (
    binding.previousIndex !== input.previousIndex
    || binding.nextIndex !== input.nextIndex
    || binding.previousIndexFingerprint !== input.previousIndex.fingerprint
    || binding.nextIndexFingerprint !== input.nextIndex.fingerprint
    || input.update.previousIndexFingerprint !== input.previousIndex.fingerprint
    || input.update.nextIndex !== input.nextIndex
  ) return {
    status: "invalid",
    code: "spatial-update-binding-mismatch",
    message: "spatial update is not bound to the supplied exact previous and next indexes",
  }
  return {
    status: "valid",
    fingerprint: input.update.fingerprint,
  }
}
