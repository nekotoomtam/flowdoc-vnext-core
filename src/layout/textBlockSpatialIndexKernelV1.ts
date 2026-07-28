import type {
  VNextTextBlockSpatialIndexEntryV1,
  VNextTextBlockSpatialIndexNodeV1,
  VNextTextBlockSpatialIndexSummaryV1,
} from "./textBlockSpatialIndexContractV1.js"

// This factory is intentionally supplied by each wrapper: the kernel owns the
// persistent-tree algorithm and summary calculation, while V1 owns node
// fingerprinting and freezing policy. It is internal because this module is not
// exported through the Core barrel.
export type VNextTextBlockSpatialIndexNodeMaterializerKernelV1 = (input: {
  entry: VNextTextBlockSpatialIndexEntryV1
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexSummaryV1
}) => VNextTextBlockSpatialIndexNodeV1

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

function summarizeSpatialNodeV1(input: {
  entry: VNextTextBlockSpatialIndexEntryV1
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
}): VNextTextBlockSpatialIndexSummaryV1 {
  const children = [input.left, input.right].filter(
    (item): item is VNextTextBlockSpatialIndexNodeV1 => item != null,
  )
  return {
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
}

function createSpatialNodeV1(input: {
  entry: VNextTextBlockSpatialIndexEntryV1
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
}): VNextTextBlockSpatialIndexNodeV1 {
  return input.materializeNode({
    entry: input.entry,
    left: input.left,
    right: input.right,
    summary: summarizeSpatialNodeV1(input),
  })
}

function rotateRight(input: {
  node: VNextTextBlockSpatialIndexNodeV1
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
}): VNextTextBlockSpatialIndexNodeV1 {
  const nextRoot = input.node.left
  if (nextRoot == null) return input.node
  const nextRight = createSpatialNodeV1({
    entry: input.node.entry,
    left: nextRoot.right,
    right: input.node.right,
    materializeNode: input.materializeNode,
  })
  return createSpatialNodeV1({
    entry: nextRoot.entry,
    left: nextRoot.left,
    right: nextRight,
    materializeNode: input.materializeNode,
  })
}

function rotateLeft(input: {
  node: VNextTextBlockSpatialIndexNodeV1
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
}): VNextTextBlockSpatialIndexNodeV1 {
  const nextRoot = input.node.right
  if (nextRoot == null) return input.node
  const nextLeft = createSpatialNodeV1({
    entry: input.node.entry,
    left: input.node.left,
    right: nextRoot.left,
    materializeNode: input.materializeNode,
  })
  return createSpatialNodeV1({
    entry: nextRoot.entry,
    left: nextLeft,
    right: nextRoot.right,
    materializeNode: input.materializeNode,
  })
}

function insertSpatialNodeV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  entry: VNextTextBlockSpatialIndexEntryV1
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
}): VNextTextBlockSpatialIndexNodeV1 {
  if (input.root == null) return createSpatialNodeV1({
    entry: input.entry,
    left: null,
    right: null,
    materializeNode: input.materializeNode,
  })
  const comparison = compareSpatialEntriesV1(input.entry, input.root.entry)
  if (comparison < 0) {
    let node = createSpatialNodeV1({
      entry: input.root.entry,
      left: insertSpatialNodeV1({
        root: input.root.left,
        entry: input.entry,
        materializeNode: input.materializeNode,
      }),
      right: input.root.right,
      materializeNode: input.materializeNode,
    })
    if (node.left != null && comparePriorityV1(node.left.entry, node.entry) < 0) {
      node = rotateRight({ node, materializeNode: input.materializeNode })
    }
    return node
  }
  let node = createSpatialNodeV1({
    entry: input.root.entry,
    left: input.root.left,
    right: insertSpatialNodeV1({
      root: input.root.right,
      entry: input.entry,
      materializeNode: input.materializeNode,
    }),
    materializeNode: input.materializeNode,
  })
  if (node.right != null && comparePriorityV1(node.right.entry, node.entry) < 0) {
    node = rotateLeft({ node, materializeNode: input.materializeNode })
  }
  return node
}

export function buildVNextTextBlockSpatialIndexRootKernelV1(
  entries: readonly VNextTextBlockSpatialIndexEntryV1[],
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1,
): VNextTextBlockSpatialIndexNodeV1 | null {
  return entries.reduce<VNextTextBlockSpatialIndexNodeV1 | null>(
    (root, entry) => insertSpatialNodeV1({ root, entry, materializeNode }),
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
    if (node.entry.envelope.topLayoutUnit < input.bottomLayoutUnit) visit(node.right)
  }
  visit(input.root)
  return { entries, visitedNodeCount }
}

interface SpatialPathCopyWorkV1 {
  visitedNodeCount: number
  createdNodeCount: number
}

function createTrackedSpatialNodeV1(input: {
  entry: VNextTextBlockSpatialIndexEntryV1
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
  work: SpatialPathCopyWorkV1
}): VNextTextBlockSpatialIndexNodeV1 {
  input.work.createdNodeCount += 1
  return createSpatialNodeV1(input)
}

function mergeSpatialNodesV1(input: {
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
  work: SpatialPathCopyWorkV1
}): VNextTextBlockSpatialIndexNodeV1 | null {
  if (input.left == null) return input.right
  if (input.right == null) return input.left
  input.work.visitedNodeCount += 1
  if (comparePriorityV1(input.left.entry, input.right.entry) < 0) {
    return createTrackedSpatialNodeV1({
      entry: input.left.entry,
      left: input.left.left,
      right: mergeSpatialNodesV1({
        left: input.left.right,
        right: input.right,
        materializeNode: input.materializeNode,
        work: input.work,
      }),
      materializeNode: input.materializeNode,
      work: input.work,
    })
  }
  return createTrackedSpatialNodeV1({
    entry: input.right.entry,
    left: mergeSpatialNodesV1({
      left: input.left,
      right: input.right.left,
      materializeNode: input.materializeNode,
      work: input.work,
    }),
    right: input.right.right,
    materializeNode: input.materializeNode,
    work: input.work,
  })
}

function deleteSpatialNodePathCopyV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  entry: VNextTextBlockSpatialIndexEntryV1
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
  work: SpatialPathCopyWorkV1
}): VNextTextBlockSpatialIndexNodeV1 | null {
  if (input.root == null) return null
  input.work.visitedNodeCount += 1
  const comparison = compareSpatialEntriesV1(input.entry, input.root.entry)
  if (comparison < 0) return createTrackedSpatialNodeV1({
    entry: input.root.entry,
    left: deleteSpatialNodePathCopyV1({
      root: input.root.left,
      entry: input.entry,
      materializeNode: input.materializeNode,
      work: input.work,
    }),
    right: input.root.right,
    materializeNode: input.materializeNode,
    work: input.work,
  })
  if (comparison > 0) return createTrackedSpatialNodeV1({
    entry: input.root.entry,
    left: input.root.left,
    right: deleteSpatialNodePathCopyV1({
      root: input.root.right,
      entry: input.entry,
      materializeNode: input.materializeNode,
      work: input.work,
    }),
    materializeNode: input.materializeNode,
    work: input.work,
  })
  return mergeSpatialNodesV1({
    left: input.root.left,
    right: input.root.right,
    materializeNode: input.materializeNode,
    work: input.work,
  })
}

function insertSpatialNodePathCopyV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  entry: VNextTextBlockSpatialIndexEntryV1
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
  work: SpatialPathCopyWorkV1
}): VNextTextBlockSpatialIndexNodeV1 {
  if (input.root == null) return createTrackedSpatialNodeV1({
    entry: input.entry,
    left: null,
    right: null,
    materializeNode: input.materializeNode,
    work: input.work,
  })
  input.work.visitedNodeCount += 1
  const comparison = compareSpatialEntriesV1(input.entry, input.root.entry)
  if (comparison < 0) {
    let node = createTrackedSpatialNodeV1({
      entry: input.root.entry,
      left: insertSpatialNodePathCopyV1({
        root: input.root.left,
        entry: input.entry,
        materializeNode: input.materializeNode,
        work: input.work,
      }),
      right: input.root.right,
      materializeNode: input.materializeNode,
      work: input.work,
    })
    if (node.left != null && comparePriorityV1(node.left.entry, node.entry) < 0) {
      input.work.createdNodeCount += 2
      node = rotateRight({ node, materializeNode: input.materializeNode })
    }
    return node
  }
  let node = createTrackedSpatialNodeV1({
    entry: input.root.entry,
    left: input.root.left,
    right: insertSpatialNodePathCopyV1({
      root: input.root.right,
      entry: input.entry,
      materializeNode: input.materializeNode,
      work: input.work,
    }),
    materializeNode: input.materializeNode,
    work: input.work,
  })
  if (node.right != null && comparePriorityV1(node.right.entry, node.entry) < 0) {
    input.work.createdNodeCount += 2
    node = rotateLeft({ node, materializeNode: input.materializeNode })
  }
  return node
}

export function updateVNextTextBlockSpatialIndexRootKernelV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  previousEntry: VNextTextBlockSpatialIndexEntryV1 | null
  nextEntry: VNextTextBlockSpatialIndexEntryV1 | null
  materializeNode: VNextTextBlockSpatialIndexNodeMaterializerKernelV1
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
    : deleteSpatialNodePathCopyV1({
        root: input.root,
        entry: input.previousEntry,
        materializeNode: input.materializeNode,
        work: deleteWork,
      })
  const insertWork: SpatialPathCopyWorkV1 = { visitedNodeCount: 0, createdNodeCount: 0 }
  const root = input.nextEntry == null
    ? withoutPrevious
    : insertSpatialNodePathCopyV1({
        root: withoutPrevious,
        entry: input.nextEntry,
        materializeNode: input.materializeNode,
        work: insertWork,
      })
  return {
    root,
    visitedNodeCount: deleteWork.visitedNodeCount + insertWork.visitedNodeCount,
    createdNodeCount: deleteWork.createdNodeCount + insertWork.createdNodeCount,
    deleteVisitedNodeCount: deleteWork.visitedNodeCount,
    insertVisitedNodeCount: insertWork.visitedNodeCount,
  }
}
