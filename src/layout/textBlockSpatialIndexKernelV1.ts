import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockSpatialIndexEntryV1,
  VNextTextBlockSpatialIndexNodeV1,
  VNextTextBlockSpatialIndexSummaryV1,
} from "./textBlockSpatialIndexContractV1.js"

function spatialKernelFingerprintV1(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function deepFreezeSpatialKernelV1<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  if (Object.isFrozen(value)) return value
  Object.values(value).forEach((child) => deepFreezeSpatialKernelV1(child))
  return Object.freeze(value)
}

function compareOrdinalStringsV1(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function compareSpatialEntriesV1(
  left: VNextTextBlockSpatialIndexEntryV1,
  right: VNextTextBlockSpatialIndexEntryV1,
): number {
  return left.envelope.topLayoutUnit - right.envelope.topLayoutUnit
    || left.envelope.bottomLayoutUnit - right.envelope.bottomLayoutUnit
    || compareOrdinalStringsV1(left.objectId, right.objectId)
}

export function sortVNextTextBlockSpatialIndexEntriesKernelV1(
  entries: VNextTextBlockSpatialIndexEntryV1[],
): void {
  entries.sort(compareSpatialEntriesV1)
}

function comparePriorityV1(
  left: VNextTextBlockSpatialIndexEntryV1,
  right: VNextTextBlockSpatialIndexEntryV1,
): number {
  return compareOrdinalStringsV1(left.fingerprint, right.fingerprint)
    || compareSpatialEntriesV1(left, right)
}

const EMPTY_SUMMARY: VNextTextBlockSpatialIndexSummaryV1 = Object.freeze({
  entryCount: 0,
  nodeCount: 0,
  maximumBottomLayoutUnit: 0,
  flowAffectingEntryCount: 0,
  barrierEntryCount: 0,
  overlayEntryCount: 0,
})

export function spatialIndexSummaryForRootKernelV1(
  root: VNextTextBlockSpatialIndexNodeV1 | null,
): VNextTextBlockSpatialIndexSummaryV1 {
  return root?.summary ?? EMPTY_SUMMARY
}

function createSpatialNodeV1(input: {
  entry: VNextTextBlockSpatialIndexEntryV1
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
}): VNextTextBlockSpatialIndexNodeV1 {
  const children = [input.left, input.right].filter(
    (item): item is VNextTextBlockSpatialIndexNodeV1 => item != null,
  )
  const summary = {
    entryCount: 1 + children.reduce((sum, item) => sum + item.summary.entryCount, 0),
    nodeCount: 1 + children.reduce((sum, item) => sum + item.summary.nodeCount, 0),
    maximumBottomLayoutUnit: Math.max(
      input.entry.envelope.bottomLayoutUnit,
      ...children.map((item) => item.summary.maximumBottomLayoutUnit),
    ),
    flowAffectingEntryCount:
      (input.entry.wrapPolicy === "overlay" ? 0 : 1)
      + children.reduce((sum, item) => sum + item.summary.flowAffectingEntryCount, 0),
    barrierEntryCount:
      (input.entry.wrapPolicy === "top-bottom-barrier" ? 1 : 0)
      + children.reduce((sum, item) => sum + item.summary.barrierEntryCount, 0),
    overlayEntryCount:
      (input.entry.wrapPolicy === "overlay" ? 1 : 0)
      + children.reduce((sum, item) => sum + item.summary.overlayEntryCount, 0),
  }
  const facts = {
    entry: input.entry,
    priorityFingerprint: input.entry.fingerprint,
    leftFingerprint: input.left?.fingerprint ?? null,
    rightFingerprint: input.right?.fingerprint ?? null,
    summary,
  }
  return deepFreezeSpatialKernelV1({
    entry: input.entry,
    priorityFingerprint: input.entry.fingerprint,
    left: input.left,
    right: input.right,
    summary,
    fingerprint: spatialKernelFingerprintV1(facts),
  })
}

function rotateRight(node: VNextTextBlockSpatialIndexNodeV1): VNextTextBlockSpatialIndexNodeV1 {
  const nextRoot = node.left
  if (nextRoot == null) return node
  const nextRight = createSpatialNodeV1({
    entry: node.entry,
    left: nextRoot.right,
    right: node.right,
  })
  return createSpatialNodeV1({
    entry: nextRoot.entry,
    left: nextRoot.left,
    right: nextRight,
  })
}

function rotateLeft(node: VNextTextBlockSpatialIndexNodeV1): VNextTextBlockSpatialIndexNodeV1 {
  const nextRoot = node.right
  if (nextRoot == null) return node
  const nextLeft = createSpatialNodeV1({
    entry: node.entry,
    left: node.left,
    right: nextRoot.left,
  })
  return createSpatialNodeV1({
    entry: nextRoot.entry,
    left: nextLeft,
    right: nextRoot.right,
  })
}

function insertSpatialNodeV1(
  root: VNextTextBlockSpatialIndexNodeV1 | null,
  entry: VNextTextBlockSpatialIndexEntryV1,
): VNextTextBlockSpatialIndexNodeV1 {
  if (root == null) return createSpatialNodeV1({ entry, left: null, right: null })
  const comparison = compareSpatialEntriesV1(entry, root.entry)
  if (comparison < 0) {
    let node = createSpatialNodeV1({
      entry: root.entry,
      left: insertSpatialNodeV1(root.left, entry),
      right: root.right,
    })
    if (node.left != null && comparePriorityV1(node.left.entry, node.entry) < 0) {
      node = rotateRight(node)
    }
    return node
  }
  let node = createSpatialNodeV1({
    entry: root.entry,
    left: root.left,
    right: insertSpatialNodeV1(root.right, entry),
  })
  if (node.right != null && comparePriorityV1(node.right.entry, node.entry) < 0) {
    node = rotateLeft(node)
  }
  return node
}

export function buildVNextTextBlockSpatialIndexRootKernelV1(
  entries: readonly VNextTextBlockSpatialIndexEntryV1[],
): VNextTextBlockSpatialIndexNodeV1 | null {
  return entries.reduce<VNextTextBlockSpatialIndexNodeV1 | null>(
    (current, entry) => insertSpatialNodeV1(current, entry),
    null,
  )
}

export function queryVNextTextBlockSpatialIndexKernelV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  topLayoutUnit: number
  bottomLayoutUnit: number
}): {
  entries: readonly VNextTextBlockSpatialIndexEntryV1[]
  visitedNodeCount: number
} {
  const entries: VNextTextBlockSpatialIndexEntryV1[] = []
  let visitedNodeCount = 0
  const visit = (node: VNextTextBlockSpatialIndexNodeV1 | null): void => {
    if (node == null) return
    visitedNodeCount += 1
    if (
      node.left != null
      && node.left.summary.maximumBottomLayoutUnit > input.topLayoutUnit
    ) visit(node.left)
    if (
      node.entry.envelope.topLayoutUnit < input.bottomLayoutUnit
      && node.entry.envelope.bottomLayoutUnit > input.topLayoutUnit
    ) entries.push(node.entry)
    if (node.entry.envelope.topLayoutUnit < input.bottomLayoutUnit) {
      visit(node.right)
    }
  }
  visit(input.root)
  return { entries, visitedNodeCount }
}

interface SpatialPathCopyWorkV1 {
  visitedNodeCount: number
  createdNodeCount: number
}

function createTrackedSpatialNodeV1(
  input: Parameters<typeof createSpatialNodeV1>[0],
  work: SpatialPathCopyWorkV1,
): VNextTextBlockSpatialIndexNodeV1 {
  work.createdNodeCount += 1
  return createSpatialNodeV1(input)
}

function mergeSpatialNodesV1(
  left: VNextTextBlockSpatialIndexNodeV1 | null,
  right: VNextTextBlockSpatialIndexNodeV1 | null,
  work: SpatialPathCopyWorkV1,
): VNextTextBlockSpatialIndexNodeV1 | null {
  if (left == null) return right
  if (right == null) return left
  work.visitedNodeCount += 1
  if (comparePriorityV1(left.entry, right.entry) < 0) {
    return createTrackedSpatialNodeV1({
      entry: left.entry,
      left: left.left,
      right: mergeSpatialNodesV1(left.right, right, work),
    }, work)
  }
  return createTrackedSpatialNodeV1({
    entry: right.entry,
    left: mergeSpatialNodesV1(left, right.left, work),
    right: right.right,
  }, work)
}

function deleteSpatialNodePathCopyV1(
  root: VNextTextBlockSpatialIndexNodeV1 | null,
  entry: VNextTextBlockSpatialIndexEntryV1,
  work: SpatialPathCopyWorkV1,
): VNextTextBlockSpatialIndexNodeV1 | null {
  if (root == null) return null
  work.visitedNodeCount += 1
  const comparison = compareSpatialEntriesV1(entry, root.entry)
  if (comparison < 0) return createTrackedSpatialNodeV1({
    entry: root.entry,
    left: deleteSpatialNodePathCopyV1(root.left, entry, work),
    right: root.right,
  }, work)
  if (comparison > 0) return createTrackedSpatialNodeV1({
    entry: root.entry,
    left: root.left,
    right: deleteSpatialNodePathCopyV1(root.right, entry, work),
  }, work)
  return mergeSpatialNodesV1(root.left, root.right, work)
}

function insertSpatialNodePathCopyV1(
  root: VNextTextBlockSpatialIndexNodeV1 | null,
  entry: VNextTextBlockSpatialIndexEntryV1,
  work: SpatialPathCopyWorkV1,
): VNextTextBlockSpatialIndexNodeV1 {
  if (root == null) {
    return createTrackedSpatialNodeV1({ entry, left: null, right: null }, work)
  }
  work.visitedNodeCount += 1
  const comparison = compareSpatialEntriesV1(entry, root.entry)
  if (comparison < 0) {
    let node = createTrackedSpatialNodeV1({
      entry: root.entry,
      left: insertSpatialNodePathCopyV1(root.left, entry, work),
      right: root.right,
    }, work)
    if (node.left != null && comparePriorityV1(node.left.entry, node.entry) < 0) {
      work.createdNodeCount += 2
      node = rotateRight(node)
    }
    return node
  }
  let node = createTrackedSpatialNodeV1({
    entry: root.entry,
    left: root.left,
    right: insertSpatialNodePathCopyV1(root.right, entry, work),
  }, work)
  if (node.right != null && comparePriorityV1(node.right.entry, node.entry) < 0) {
    work.createdNodeCount += 2
    node = rotateLeft(node)
  }
  return node
}

export function updateVNextTextBlockSpatialIndexRootKernelV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  previousEntry: VNextTextBlockSpatialIndexEntryV1 | null
  nextEntry: VNextTextBlockSpatialIndexEntryV1 | null
}): {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  visitedNodeCount: number
  createdNodeCount: number
  deleteVisitedNodeCount: number
  insertVisitedNodeCount: number
} {
  const deleteWork: SpatialPathCopyWorkV1 = { visitedNodeCount: 0, createdNodeCount: 0 }
  const withoutPrevious = input.previousEntry == null
    ? input.root
    : deleteSpatialNodePathCopyV1(input.root, input.previousEntry, deleteWork)
  const insertWork: SpatialPathCopyWorkV1 = { visitedNodeCount: 0, createdNodeCount: 0 }
  const root = input.nextEntry == null
    ? withoutPrevious
    : insertSpatialNodePathCopyV1(withoutPrevious, input.nextEntry, insertWork)
  return {
    root,
    visitedNodeCount: deleteWork.visitedNodeCount + insertWork.visitedNodeCount,
    createdNodeCount: deleteWork.createdNodeCount + insertWork.createdNodeCount,
    deleteVisitedNodeCount: deleteWork.visitedNodeCount,
    insertVisitedNodeCount: insertWork.visitedNodeCount,
  }
}
