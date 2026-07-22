import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import { sameVNextCanonicalJson, stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockMultiRunIncrementalEditV1,
  VNextTextBlockMultiRunIncrementalWindowProofV1,
} from "./textBlockMultiRunIncrementalContractV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  type VNextTextBlockPersistentFlowItemKindV1,
  type VNextTextBlockPersistentFlowItemV1,
  type VNextTextBlockPersistentFlowLeafV1,
  type VNextTextBlockPersistentFlowNodeV1,
  type VNextTextBlockPersistentFlowTreeV1,
  type VNextTextBlockPersistentFlowUpdateIssueCodeV1,
  type VNextTextBlockPersistentFlowUpdateResultV1,
  type VNextTextBlockPersistentFlowUpdateV1,
} from "./textBlockPersistentFlowContractV1.js"
import {
  compactPersistentFlowFactsV1,
  createVNextTextBlockPersistentFlowBranchInternalV1,
  createVNextTextBlockPersistentFlowLayoutContextFingerprintInternalV1,
  createVNextTextBlockPersistentFlowLeafInternalV1,
  createVNextTextBlockPersistentFlowTreeFromRootInternalV1,
  deepFreezePersistentFlowV1,
  deeplyFrozenPersistentFlowV1,
  getVNextTextBlockPersistentFlowSuffixProofInternalV1,
  hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1,
  hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1,
  partitionPersistentFlowValuesV1,
  projectVNextTextBlockPersistentFlowItemsForRangeV1,
  sliceVNextTextBlockPersistentFlowItemInternalV1,
} from "./textBlockPersistentFlowTreeInternalsV1.js"

const UPDATE_SOURCE = "vnext-text-block-persistent-flow-update-v1" as const
const processLocalPersistentFlowUpdatesV1 = new WeakSet<object>()

type UpdateBindingV1 = {
  previousTree: VNextTextBlockPersistentFlowTreeV1
  previousRequest: VNextTextBlockMultiRunLayoutRequestV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
  previousRequestFingerprint: string
  nextRequestFingerprint: string
  editFingerprint: string
  windowFingerprint: string
}

const processLocalPersistentFlowUpdateBindingsV1 = new WeakMap<
  VNextTextBlockPersistentFlowUpdateV1,
  UpdateBindingV1
>()

type UpdateInputV1 = {
  previousTree: VNextTextBlockPersistentFlowTreeV1
  previousRequest: VNextTextBlockMultiRunLayoutRequestV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
}

function blocked(
  code: VNextTextBlockPersistentFlowUpdateIssueCodeV1,
  message: string,
): VNextTextBlockPersistentFlowUpdateResultV1 {
  return { status: "blocked", update: null, nextTree: null, work: null, issues: [{ code, message }] }
}

function canonicalFingerprint(value: unknown): string {
  return compactPersistentFlowFactsV1(value)
}

function validSafeOffset(text: string, value: number): boolean {
  return Number.isSafeInteger(value)
    && value >= 0
    && value <= text.length
    && isVNextSafeUtf16TextOffset(text, value)
}

function sameLayoutContext(
  previousRequest: VNextTextBlockMultiRunLayoutRequestV1,
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1,
): boolean {
  return createVNextTextBlockPersistentFlowLayoutContextFingerprintInternalV1(previousRequest)
      === createVNextTextBlockPersistentFlowLayoutContextFingerprintInternalV1(nextRequest)
    && previousRequest.measurement.availableWidthPt === nextRequest.measurement.availableWidthPt
    && previousRequest.measurement.styleKey === nextRequest.measurement.styleKey
}

function sourceTopologyForRange(
  request: VNextTextBlockMultiRunLayoutRequestV1,
  startUtf16: number,
  endUtf16: number,
): unknown[] {
  return request.measurement.runs.flatMap((run) => {
    const start = Math.max(startUtf16, run.renderStartOffset)
    const end = Math.min(endUtf16, run.renderEndOffset)
    if (end <= start) return []
    return [{
      startUtf16: start - startUtf16,
      endUtf16: end - startUtf16,
      kind: run.kind,
      inlineId: run.inlineId,
      ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
      ...(run.generatedOwnerFingerprint == null ? {} : { generatedOwnerFingerprint: run.generatedOwnerFingerprint }),
      ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
      ...(run.localStyle == null ? {} : { localStyle: run.localStyle }),
      renderedText: request.measurement.renderedText.slice(start, end),
    }]
  })
}

function shapingTopologyForRange(
  request: VNextTextBlockMultiRunLayoutRequestV1,
  startUtf16: number,
  endUtf16: number,
): unknown[] | null {
  const clusters: unknown[] = []
  for (const shapingRun of request.shapingRuns) {
    for (const cluster of shapingRun.clusters) {
      if (cluster.renderEndOffset <= startUtf16 || cluster.renderStartOffset >= endUtf16) continue
      if (cluster.renderStartOffset < startUtf16 || cluster.renderEndOffset > endUtf16) return null
      clusters.push({
        startUtf16: cluster.renderStartOffset - startUtf16,
        endUtf16: cluster.renderEndOffset - startUtf16,
        advanceLayoutUnit: cluster.advanceLayoutUnit,
        styleKey: shapingRun.styleKey,
        fontFaceId: shapingRun.fontFaceId,
        fontSizeLayoutUnit: shapingRun.fontSizeLayoutUnit,
        textColor: shapingRun.textColor,
        direction: shapingRun.direction,
        baselineShiftLayoutUnit: shapingRun.baselineShiftLayoutUnit,
        features: shapingRun.features,
      })
    }
  }
  return clusters
}

function validateSourceTopology(input: UpdateInputV1): boolean {
  const previousText = input.previousRequest.measurement.renderedText
  const nextText = input.nextRequest.measurement.renderedText
  const edit = input.edit
  const prefixMatches = sameVNextCanonicalJson(
    sourceTopologyForRange(input.previousRequest, 0, edit.previousStartOffset),
    sourceTopologyForRange(input.nextRequest, 0, edit.previousStartOffset),
  )
  const suffixMatches = sameVNextCanonicalJson(
    sourceTopologyForRange(input.previousRequest, edit.previousEndOffset, previousText.length),
    sourceTopologyForRange(input.nextRequest, edit.nextEndOffset, nextText.length),
  )
  return prefixMatches && suffixMatches
}

function validateReusableShapingTopology(input: UpdateInputV1, ranges: {
  previousStart: number
  previousEnd: number
  nextStart: number
  nextEnd: number
}): boolean {
  const previousText = input.previousRequest.measurement.renderedText
  const nextText = input.nextRequest.measurement.renderedText
  const previousPrefix = shapingTopologyForRange(input.previousRequest, 0, ranges.previousStart)
  const nextPrefix = shapingTopologyForRange(input.nextRequest, 0, ranges.nextStart)
  const previousSuffix = shapingTopologyForRange(input.previousRequest, ranges.previousEnd, previousText.length)
  const nextSuffix = shapingTopologyForRange(input.nextRequest, ranges.nextEnd, nextText.length)
  return previousPrefix != null
    && nextPrefix != null
    && previousSuffix != null
    && nextSuffix != null
    && sameVNextCanonicalJson(previousPrefix, nextPrefix)
    && sameVNextCanonicalJson(previousSuffix, nextSuffix)
}

function sameLineRange(
  left: { index: number; renderStartOffset: number; renderEndOffset: number },
  right: { index: number; renderStartOffset: number; renderEndOffset: number },
): boolean {
  return left.index === right.index
    && left.renderStartOffset === right.renderStartOffset
    && left.renderEndOffset === right.renderEndOffset
}

function validLineTopology(request: VNextTextBlockMultiRunLayoutRequestV1): boolean {
  if (request.lines.length === 0) return false
  const boundaries = new Set<number>([0, request.measurement.renderedText.length])
  request.shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    boundaries.add(cluster.renderStartOffset)
    boundaries.add(cluster.renderEndOffset)
  }))
  request.measurement.runs.filter((run) => run.kind === "hard-break").forEach((run) => {
    boundaries.add(run.renderStartOffset)
    boundaries.add(run.renderEndOffset)
  })
  let cursor = 0
  for (let index = 0; index < request.lines.length; index += 1) {
    const line = request.lines[index]!
    if (
      line.index !== index
      || line.renderStartOffset !== cursor
      || line.renderEndOffset <= line.renderStartOffset
      || line.renderEndOffset > request.measurement.renderedText.length
      || !boundaries.has(line.renderStartOffset)
      || !boundaries.has(line.renderEndOffset)
    ) return false
    cursor = line.renderEndOffset
  }
  return cursor === request.measurement.renderedText.length
}

function validateWindow(input: UpdateInputV1): {
  status: "valid"
  previousStart: number
  previousEnd: number
  nextStart: number
  nextEnd: number
} | { status: "invalid" } {
  const { window } = input
  const previousLines = input.previousRequest.lines
  const nextLines = input.nextRequest.lines
  if (!validLineTopology(input.previousRequest) || !validLineTopology(input.nextRequest)) {
    return { status: "invalid" }
  }
  const indices = [
    window.previousRestartLineIndex,
    window.nextRestartLineIndex,
    window.previousReconvergenceLineIndex,
    window.nextReconvergenceLineIndex,
    window.stableLineCount,
    window.previousReconvergenceOffset,
    window.nextReconvergenceOffset,
    window.offsetDelta,
  ]
  if (
    indices.some((value) => !Number.isSafeInteger(value))
    || window.stableLineCount < 1
    || window.previousRestartLineIndex < 0
    || window.nextRestartLineIndex < 0
    || window.previousRestartLineIndex !== window.nextRestartLineIndex
    || window.previousReconvergenceLineIndex <= window.previousRestartLineIndex
    || window.nextReconvergenceLineIndex <= window.nextRestartLineIndex
    || window.previousReconvergenceLineIndex >= previousLines.length
    || window.nextReconvergenceLineIndex >= nextLines.length
  ) return { status: "invalid" }
  const previousStart = previousLines[window.previousRestartLineIndex]!.renderStartOffset
  const nextStart = nextLines[window.nextRestartLineIndex]!.renderStartOffset
  const previousEnd = previousLines[window.previousReconvergenceLineIndex]!.renderStartOffset
  const nextEnd = nextLines[window.nextReconvergenceLineIndex]!.renderStartOffset
  const offsetDelta = input.edit.nextEndOffset - input.edit.previousEndOffset
  const expectedSuffixProof = getVNextTextBlockPersistentFlowSuffixProofInternalV1(
    input.previousTree,
    window.previousReconvergenceLineIndex,
  )
  if (
    previousStart !== nextStart
    || previousEnd <= previousStart
    || nextEnd <= nextStart
    || previousEnd !== window.previousReconvergenceOffset
    || nextEnd !== window.nextReconvergenceOffset
    || window.offsetDelta !== offsetDelta
    || nextEnd - previousEnd !== offsetDelta
    || previousLines.length - window.previousReconvergenceLineIndex
      !== nextLines.length - window.nextReconvergenceLineIndex
    || previousLines.length - window.previousReconvergenceLineIndex < window.stableLineCount
    || window.previousSuffixSemanticFingerprint !== window.nextSuffixSemanticFingerprint
    || window.previousSuffixSemanticRangeFingerprint !== window.nextSuffixSemanticRangeFingerprint
    || expectedSuffixProof == null
    || window.previousSuffixSemanticFingerprint !== expectedSuffixProof.semanticFingerprint
    || window.previousSuffixSemanticRangeFingerprint !== expectedSuffixProof.semanticRangeFingerprint
    || !/^sha256:[a-f0-9]{64}$/u.test(window.previousSuffixSemanticFingerprint)
    || !/^sha256:[a-f0-9]{64}$/u.test(window.previousSuffixSemanticRangeFingerprint)
  ) return { status: "invalid" }
  const prefixMatches = previousLines.slice(0, window.previousRestartLineIndex).every((line, index) => (
    sameLineRange(line, nextLines[index]!)
  ))
  const lineIndexDelta = window.nextReconvergenceLineIndex - window.previousReconvergenceLineIndex
  const suffixMatches = previousLines.slice(window.previousReconvergenceLineIndex).every((line, index) => {
    const nextLine = nextLines[window.nextReconvergenceLineIndex + index]
    return nextLine != null
      && nextLine.index === line.index + lineIndexDelta
      && nextLine.renderStartOffset === line.renderStartOffset + offsetDelta
      && nextLine.renderEndOffset === line.renderEndOffset + offsetDelta
  })
  return prefixMatches && suffixMatches
    ? { status: "valid", previousStart, previousEnd, nextStart, nextEnd }
    : { status: "invalid" }
}

type LeafRangeV1 = {
  leaf: VNextTextBlockPersistentFlowLeafV1
  leafIndex: number
  startUtf16: number
  endUtf16: number
}

function collectLeafRanges(root: VNextTextBlockPersistentFlowNodeV1): LeafRangeV1[] {
  const leaves: LeafRangeV1[] = []
  let cursor = 0
  const visit = (node: VNextTextBlockPersistentFlowNodeV1): void => {
    if (node.nodeKind === "leaf") {
      const startUtf16 = cursor
      cursor += node.summary.renderedUtf16Length
      leaves.push({ leaf: node, leafIndex: leaves.length, startUtf16, endUtf16: cursor })
      return
    }
    node.children.forEach(visit)
  }
  visit(root)
  return leaves
}

function replaceLeafRange(input: {
  node: VNextTextBlockPersistentFlowNodeV1
  subtreeStartLeaf: number
  replaceStartLeaf: number
  replaceEndLeafExclusive: number
  replacementLeaves: readonly VNextTextBlockPersistentFlowLeafV1[]
  inserted: { value: boolean }
}): VNextTextBlockPersistentFlowNodeV1[] {
  const subtreeEndLeaf = input.subtreeStartLeaf + input.node.summary.leafCount
  if (subtreeEndLeaf <= input.replaceStartLeaf || input.subtreeStartLeaf >= input.replaceEndLeafExclusive) {
    return [input.node]
  }
  if (input.node.nodeKind === "leaf") {
    if (input.inserted.value) return []
    input.inserted.value = true
    return [...input.replacementLeaves]
  }
  const children: VNextTextBlockPersistentFlowNodeV1[] = []
  let childStart = input.subtreeStartLeaf
  for (const child of input.node.children) {
    children.push(...replaceLeafRange({
      ...input,
      node: child,
      subtreeStartLeaf: childStart,
    }))
    childStart += child.summary.leafCount
  }
  return partitionPersistentFlowValuesV1(
    children,
    VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren,
  ).map(createVNextTextBlockPersistentFlowBranchInternalV1)
}

function normalizeRoot(nodes: readonly VNextTextBlockPersistentFlowNodeV1[]): VNextTextBlockPersistentFlowNodeV1 {
  if (nodes.length === 0) throw new RangeError("persistent flow update cannot create an empty tree")
  let level = [...nodes]
  while (level.length > 1) {
    level = partitionPersistentFlowValuesV1(
      level,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren,
    ).map(createVNextTextBlockPersistentFlowBranchInternalV1)
  }
  let root = level[0]!
  while (root.nodeKind === "branch" && root.children.length === 1) root = root.children[0]!
  return root
}

function collectNodes(root: VNextTextBlockPersistentFlowNodeV1): VNextTextBlockPersistentFlowNodeV1[] {
  const nodes: VNextTextBlockPersistentFlowNodeV1[] = []
  const visit = (node: VNextTextBlockPersistentFlowNodeV1): void => {
    nodes.push(node)
    if (node.nodeKind === "branch") node.children.forEach(visit)
  }
  visit(root)
  return nodes
}

function validTreeStructure(root: VNextTextBlockPersistentFlowNodeV1): boolean {
  const visit = (node: VNextTextBlockPersistentFlowNodeV1): { valid: boolean; leafDepths: Set<number>; nodeCount: number } => {
    const summaryValues = Object.entries(node.summary)
      .filter(([key]) => key !== "semanticFingerprint")
      .map(([, value]) => value)
    if (summaryValues.some((value) => !Number.isSafeInteger(value) || (value as number) < 0)) {
      return { valid: false, leafDepths: new Set(), nodeCount: 0 }
    }
    if (node.nodeKind === "leaf") return {
      valid: node.height === 0
        && node.items.length > 0
        && node.items.length <= VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems
        && node.summary.leafCount === 1
        && node.summary.nodeCount === 1,
      leafDepths: new Set([0]),
      nodeCount: 1,
    }
    if (
      node.children.length === 0
      || node.children.length > VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren
      || node.children.some((child) => child.height !== node.height - 1)
    ) return { valid: false, leafDepths: new Set(), nodeCount: 0 }
    const children = node.children.map(visit)
    const depths = new Set(children.flatMap((child) => [...child.leafDepths].map((depth) => depth + 1)))
    const nodeCount = 1 + children.reduce((total, child) => total + child.nodeCount, 0)
    return {
      valid: children.every((child) => child.valid)
        && depths.size === 1
        && node.summary.nodeCount === nodeCount,
      leafDepths: depths,
      nodeCount,
    }
  }
  return visit(root).valid
}

function countsAfterReplacement(input: {
  previous: VNextTextBlockPersistentFlowTreeV1["itemsByKind"]
  removedLeaves: readonly LeafRangeV1[]
  replacementItems: readonly VNextTextBlockPersistentFlowItemV1[]
}): Record<VNextTextBlockPersistentFlowItemKindV1, number> | null {
  const counts = { ...input.previous }
  input.removedLeaves.forEach(({ leaf }) => leaf.items.forEach((item) => { counts[item.kind] -= 1 }))
  input.replacementItems.forEach((item) => { counts[item.kind] += 1 })
  return Object.values(counts).every((value) => Number.isSafeInteger(value) && value >= 0)
    ? counts
    : null
}

function fingerprintUpdate(update: Omit<VNextTextBlockPersistentFlowUpdateV1, "fingerprint">): string {
  return canonicalFingerprint(update)
}

export function createVNextTextBlockPersistentFlowUpdateV1(
  input: UpdateInputV1,
): VNextTextBlockPersistentFlowUpdateResultV1 {
  if (
    !hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(input.previousTree)
    || !hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(input.previousTree, input.previousRequest)
    || !deeplyFrozenPersistentFlowV1(input.previousTree)
  ) return blocked(
    "tree-provenance-mismatch",
    "update requires the exact immutable previous tree and request objects created by Core",
  )
  if (
    input.previousTree.layoutContextFingerprint
      !== createVNextTextBlockPersistentFlowLayoutContextFingerprintInternalV1(input.previousRequest)
    || !sameLayoutContext(input.previousRequest, input.nextRequest)
    || input.nextRequest.bindProductionLayout === true
  ) return blocked("layout-context-mismatch", "the retained and next layout contexts differ")
  if (
    input.previousTree.instanceRevision !== input.previousRequest.measurement.instanceRevision
    || input.nextRequest.measurement.instanceRevision <= input.previousRequest.measurement.instanceRevision
  ) return blocked("invalid-revision", "the next measurement revision must strictly advance the retained revision")

  const previousText = input.previousRequest.measurement.renderedText
  const nextText = input.nextRequest.measurement.renderedText
  const edit = input.edit
  if (
    !validSafeOffset(previousText, edit.previousStartOffset)
    || !validSafeOffset(previousText, edit.previousEndOffset)
    || !validSafeOffset(nextText, edit.previousStartOffset)
    || !validSafeOffset(nextText, edit.nextEndOffset)
    || edit.previousEndOffset < edit.previousStartOffset
    || edit.nextEndOffset < edit.previousStartOffset
    || previousText.slice(0, edit.previousStartOffset) !== nextText.slice(0, edit.previousStartOffset)
    || previousText.slice(edit.previousEndOffset) !== nextText.slice(edit.nextEndOffset)
  ) return blocked("invalid-edit", "the edit does not exactly reconstruct the next rendered text")
  if (!validateSourceTopology(input)) return blocked(
    "source-topology-mismatch",
    "source-run ownership or style changed outside the edited source range",
  )
  const validatedWindow = validateWindow(input)
  if (validatedWindow.status === "invalid") return blocked(
    "invalid-window",
    "the restart and reconvergence proof is inconsistent with the retained and next requests",
  )
  if (
    input.previousTree.summary.renderedUtf16Length !== previousText.length
    || !validSafeOffset(previousText, validatedWindow.previousStart)
    || !validSafeOffset(previousText, validatedWindow.previousEnd)
    || !validSafeOffset(nextText, validatedWindow.nextStart)
    || !validSafeOffset(nextText, validatedWindow.nextEnd)
  ) return blocked("unsafe-tree-summary", "the retained tree summary or rendered range is unsafe")
  if (!validateReusableShapingTopology(input, validatedWindow)) return blocked(
    "source-topology-mismatch",
    "shaping dependencies changed in a structurally reused prefix or suffix",
  )

  const projected = projectVNextTextBlockPersistentFlowItemsForRangeV1({
    request: input.nextRequest,
    renderStartOffset: validatedWindow.nextStart,
    renderEndOffset: validatedWindow.nextEnd,
  })
  if (projected.status === "blocked") return blocked("range-projection-failed", projected.message)

  try {
    const leaves = collectLeafRanges(input.previousTree.root)
    const affectedLeaves = leaves.filter((leaf) => (
      leaf.endUtf16 > validatedWindow.previousStart
      && leaf.startUtf16 < validatedWindow.previousEnd
    ))
    if (affectedLeaves.length === 0) return blocked(
      "unsafe-tree-summary",
      "the previous rendered range does not intersect a retained leaf",
    )
    const firstAffected = affectedLeaves[0]!
    const lastAffected = affectedLeaves.at(-1)!
    const prefixItems: VNextTextBlockPersistentFlowItemV1[] = []
    const suffixItems: VNextTextBlockPersistentFlowItemV1[] = []
    let retainedCursor = firstAffected.startUtf16
    for (const leaf of affectedLeaves) {
      for (const item of leaf.leaf.items) {
        const itemEnd = retainedCursor + item.renderedText.length
        if (retainedCursor < validatedWindow.previousStart) {
          const end = Math.min(itemEnd, validatedWindow.previousStart)
          if (end > retainedCursor) prefixItems.push(sliceVNextTextBlockPersistentFlowItemInternalV1({
            item,
            startUtf16: 0,
            endUtf16: end - retainedCursor,
          }))
        }
        if (itemEnd > validatedWindow.previousEnd) {
          const start = Math.max(retainedCursor, validatedWindow.previousEnd)
          if (itemEnd > start) suffixItems.push(sliceVNextTextBlockPersistentFlowItemInternalV1({
            item,
            startUtf16: start - retainedCursor,
            endUtf16: item.renderedText.length,
          }))
        }
        retainedCursor = itemEnd
      }
    }
    const replacementItems = [...prefixItems, ...projected.items, ...suffixItems]
    const replacementLeaves = partitionPersistentFlowValuesV1(
      replacementItems,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems,
    ).map(createVNextTextBlockPersistentFlowLeafInternalV1)
    const roots = replaceLeafRange({
      node: input.previousTree.root,
      subtreeStartLeaf: 0,
      replaceStartLeaf: firstAffected.leafIndex,
      replaceEndLeafExclusive: lastAffected.leafIndex + 1,
      replacementLeaves,
      inserted: { value: false },
    })
    const root = normalizeRoot(roots)
    if (!validTreeStructure(root) || root.summary.renderedUtf16Length !== nextText.length) return blocked(
      "unsafe-tree-summary",
      "the path-copied tree is unbalanced, unsafe, or does not cover the next rendered text",
    )
    const nextItemsByKind = countsAfterReplacement({
      previous: input.previousTree.itemsByKind,
      removedLeaves: affectedLeaves,
      replacementItems,
    })
    if (nextItemsByKind == null) return blocked("unsafe-tree-summary", "updated item counts are unsafe")
    const nextSemanticSuffixFingerprints = Array.from<string | undefined>({
      length: input.nextRequest.lines.length,
    })
    const nextSemanticRangeSuffixFingerprints = Array.from<string | undefined>({
      length: input.nextRequest.lines.length,
    })
    for (
      let nextLineIndex = input.window.nextReconvergenceLineIndex;
      nextLineIndex < input.nextRequest.lines.length;
      nextLineIndex += 1
    ) {
      const previousLineIndex = input.window.previousReconvergenceLineIndex
        + nextLineIndex - input.window.nextReconvergenceLineIndex
      const proof = getVNextTextBlockPersistentFlowSuffixProofInternalV1(
        input.previousTree,
        previousLineIndex,
      )
      if (proof == null) return blocked("invalid-window", "the retained suffix proof is incomplete")
      nextSemanticSuffixFingerprints[nextLineIndex] = proof.semanticFingerprint
      nextSemanticRangeSuffixFingerprints[nextLineIndex] = proof.semanticRangeFingerprint
    }
    const nextTree = createVNextTextBlockPersistentFlowTreeFromRootInternalV1({
      request: input.nextRequest,
      root,
      itemsByKind: nextItemsByKind,
      suffixProof: {
        semanticSuffixFingerprints: nextSemanticSuffixFingerprints,
        semanticRangeSuffixFingerprints: nextSemanticRangeSuffixFingerprints,
      },
    })
    const previousNodes = collectNodes(input.previousTree.root)
    const previousNodeSet = new Set(previousNodes)
    const nextNodes = collectNodes(nextTree.root)
    const reusedNodeCount = nextNodes.filter((node) => previousNodeSet.has(node)).length
    const createdNodes = nextNodes.filter((node) => !previousNodeSet.has(node))
    const createdNodeCanonicalByteCount = new TextEncoder().encode(
      stringifyVNextCanonicalJson(createdNodes),
    ).byteLength
    const work = {
      previousNodeCount: previousNodes.length,
      nextNodeCount: nextNodes.length,
      reusedNodeCount,
      createdNodeCount: createdNodes.length,
      createdNodeCanonicalByteCount,
      replacedLeafCount: affectedLeaves.length,
      replacedPreviousRenderedUtf16Length: validatedWindow.previousEnd - validatedWindow.previousStart,
      projectedNextRenderedUtf16Length: validatedWindow.nextEnd - validatedWindow.nextStart,
      completeTreeRebuildCount: 0 as const,
      completeSemanticPassCount: 0 as const,
    }
    const facts = {
      source: UPDATE_SOURCE,
      contractVersion: 1 as const,
      previousTreeFingerprint: input.previousTree.fingerprint,
      nextTree,
      previousRange: {
        startUtf16: validatedWindow.previousStart,
        endUtf16: validatedWindow.previousEnd,
      },
      nextRange: {
        startUtf16: validatedWindow.nextStart,
        endUtf16: validatedWindow.nextEnd,
      },
      work,
      contracts: {
        pathCopyUpdate: true as const,
        prefixSuffixStructuralSharing: true as const,
        offsetIndependentSuffixReuse: true as const,
        processLocalProofBinding: true as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
    }
    const update = deepFreezePersistentFlowV1({ ...facts, fingerprint: fingerprintUpdate(facts) })
    processLocalPersistentFlowUpdatesV1.add(update)
    processLocalPersistentFlowUpdateBindingsV1.set(update, {
      ...input,
      previousRequestFingerprint: canonicalFingerprint(input.previousRequest),
      nextRequestFingerprint: canonicalFingerprint(input.nextRequest),
      editFingerprint: canonicalFingerprint(input.edit),
      windowFingerprint: canonicalFingerprint(input.window),
    })
    return { status: "accepted", update, nextTree, work, issues: [] }
  } catch {
    return blocked(
      "range-projection-failed",
      "the rendered range could not be split and path-copied at safe cluster boundaries",
    )
  }
}

export function inspectVNextTextBlockPersistentFlowUpdateV1(input: {
  update: VNextTextBlockPersistentFlowUpdateV1
  previousTree: VNextTextBlockPersistentFlowTreeV1
  previousRequest: VNextTextBlockMultiRunLayoutRequestV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
}): { status: "valid" } | {
  status: "invalid"
  code: "update-provenance-mismatch" | "update-fingerprint-mismatch"
  message: string
} {
  const binding = processLocalPersistentFlowUpdateBindingsV1.get(input.update)
  if (
    !processLocalPersistentFlowUpdatesV1.has(input.update)
    || binding == null
    || binding.previousTree !== input.previousTree
    || binding.previousRequest !== input.previousRequest
    || binding.nextRequest !== input.nextRequest
    || binding.edit !== input.edit
    || binding.window !== input.window
    || input.update.nextTree == null
  ) return {
    status: "invalid",
    code: "update-provenance-mismatch",
    message: "update is not bound to these exact process-local proof inputs",
  }
  if (
    !deeplyFrozenPersistentFlowV1(input.update)
    || !hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(input.update.nextTree, input.nextRequest)
    || binding.previousRequestFingerprint !== canonicalFingerprint(input.previousRequest)
    || binding.nextRequestFingerprint !== canonicalFingerprint(input.nextRequest)
    || binding.editFingerprint !== canonicalFingerprint(input.edit)
    || binding.windowFingerprint !== canonicalFingerprint(input.window)
  ) return {
    status: "invalid",
    code: "update-provenance-mismatch",
    message: "an exact update proof input was cloned or changed after creation",
  }
  const { fingerprint, ...facts } = input.update
  if (fingerprint !== fingerprintUpdate(facts)) return {
    status: "invalid",
    code: "update-fingerprint-mismatch",
    message: "the registered update fingerprint no longer matches its immutable facts",
  }
  return { status: "valid" }
}
