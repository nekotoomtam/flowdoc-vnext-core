import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1,
  verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1,
} from "./textBlockPersistentLayoutLineTreeV1.js"
import type {
  VNextTextBlockPersistentLayoutLineLeafV1,
  VNextTextBlockPersistentLayoutLineNodeV1,
  VNextTextBlockPersistentLayoutLineRootV1,
  VNextTextBlockPersistentLayoutLineTreeV1,
  VNextTextBlockPersistentLayoutLocalSourceSpanV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION,
  type VNextTextBlockPersistentSceneBranchV2,
  type VNextTextBlockPersistentSceneBuildResultV2,
  type VNextTextBlockPersistentSceneCandidateInspectionV2,
  type VNextTextBlockPersistentSceneChunkLookupResultV2,
  type VNextTextBlockPersistentSceneChunkV2,
  type VNextTextBlockPersistentSceneCompleteBuildInputV2,
  type VNextTextBlockPersistentSceneEmptyRootV2,
  type VNextTextBlockPersistentSceneFragmentV2,
  type VNextTextBlockPersistentSceneIncrementalFragmentInspectionV2,
  type VNextTextBlockPersistentSceneInspectionV2,
  type VNextTextBlockPersistentSceneIssueCodeV2,
  type VNextTextBlockPersistentSceneIssueV2,
  type VNextTextBlockPersistentSceneLeafV2,
  type VNextTextBlockPersistentSceneNodeV2,
  type VNextTextBlockPersistentScenePayloadPolicyV2,
  type VNextTextBlockPersistentScenePolicyV2,
  type VNextTextBlockPersistentSceneRootV2,
  type VNextTextBlockPersistentSceneSiblingReferenceV2,
  type VNextTextBlockPersistentSceneSummaryV2,
  type VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"

type FingerprintFactory = (canonicalFacts: string) => string

const FORCED_COLLISION_FINGERPRINT =
  `sha256:${"0".repeat(64)}` as const

const policyFacts = {
  policyVersion: 1 as const,
  maximumBranchChildren: 8 as const,
  splitOverflowLeftCount: 4 as const,
  splitOverflowRightCount: 5 as const,
  underflowBorrowOrder: ["left", "right"] as const,
  underflowMergeOrder: ["left", "right"] as const,
  collapseUnaryRoot: true as const,
}

export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2:
VNextTextBlockPersistentScenePolicyV2 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(policyFacts),
  ),
})

const payloadPolicyFacts = {
  payloadPolicyVersion: 1 as const,
  canonicalEncoding: "utf8-canonical-json" as const,
}

export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2:
VNextTextBlockPersistentScenePayloadPolicyV2 = Object.freeze({
  ...payloadPolicyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(payloadPolicyFacts),
  ),
})

function defaultFingerprint(canonicalFacts: string): string {
  return createVNextCompactFingerprint(canonicalFacts)
}

function forcedCollisionFingerprint(_canonicalFacts: string): string {
  return FORCED_COLLISION_FINGERPRINT
}

function fingerprintWith(
  factory: FingerprintFactory,
  value: unknown,
): string {
  return factory(stringifyVNextCanonicalJson(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object") return true
  if (!Object.isFrozen(value)) return false
  try {
    return Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null
        && Object.hasOwn(descriptor, "value")
        && deeplyFrozen(descriptor.value)
    })
  } catch {
    return false
  }
}

function safeAdd(left: number, right: number): number {
  const result = left + right
  if (!Number.isSafeInteger(result)) throw new Error("unsafe integer")
  return result
}

function utf8ByteCount(value: unknown): number {
  return new TextEncoder().encode(
    stringifyVNextCanonicalJson(value),
  ).byteLength
}

function exactRecord(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const actual = Reflect.ownKeys(value)
    if (
      actual.length !== keys.length
      || actual.some((key) => typeof key !== "string" || !keys.includes(key))
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output
  } catch {
    return null
  }
}

const emptyComponentFingerprint = (component: string): string =>
  createVNextCompactFingerprint(stringifyVNextCanonicalJson({
    component,
    empty: true,
  }))

const emptySummary: VNextTextBlockPersistentSceneSummaryV2 = deepFreeze({
  chunkCount: 0,
  lineCount: 0,
  textFragmentCount: 0,
  inlineImageFragmentCount: 0,
  leafCount: 0,
  nodeCount: 1,
  sourceRange: { start: null, end: null },
  authoredTopLayoutUnit: null,
  authoredBottomLayoutUnit: null,
  estimatedCanonicalPayloadByteCount: 0,
  lineInternalsFingerprint: emptyComponentFingerprint("line-internals"),
  sourceFingerprint: emptyComponentFingerprint("source"),
  provenanceFingerprint: emptyComponentFingerprint("provenance"),
  paintFingerprint: emptyComponentFingerprint("paint"),
  boundarySpatialContextFingerprint:
    emptyComponentFingerprint("boundary-spatial-context"),
})

export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2:
VNextTextBlockPersistentSceneEmptyRootV2 = deepFreeze({
  nodeKind: "empty",
  height: 0,
  summary: emptySummary,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({
      contractVersion: 2,
      nodeKind: "empty",
      summary: emptySummary,
    }),
  ),
})

interface PreparedSceneRecord {
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly fingerprintFactory: FingerprintFactory
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nodes: WeakSet<object>
}

const preparedScenes = new WeakMap<
  VNextTextBlockPersistentSceneV2,
  PreparedSceneRecord
>()

const registeredScenes = new WeakMap<
  VNextTextBlockPersistentSceneV2,
  {
    readonly fingerprint: string
    readonly canonicalFacts: string
  }
>()

function issue(
  code: VNextTextBlockPersistentSceneIssueCodeV2,
  message: string,
  chunkOrdinal?: number,
): VNextTextBlockPersistentSceneIssueV2 {
  return {
    code,
    message,
    ...(chunkOrdinal == null ? {} : { chunkOrdinal }),
  }
}

function blocked(
  item: VNextTextBlockPersistentSceneIssueV2,
): VNextTextBlockPersistentSceneBuildResultV2 {
  return Object.freeze({
    status: "blocked",
    scene: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([item]),
  })
}

function sceneCanonicalFacts(scene: VNextTextBlockPersistentSceneV2): unknown {
  return {
    source: scene.source,
    contractVersion: scene.contractVersion,
    documentId: scene.documentId,
    sectionId: scene.sectionId,
    textBlockId: scene.textBlockId,
    instanceRevision: scene.instanceRevision,
    layoutId: scene.layoutId,
    lineTreeFingerprint: scene.lineTreeFingerprint,
    sourceStateSourceFingerprint: scene.sourceStateSourceFingerprint,
    sourceStateProvenanceFingerprint:
      scene.sourceStateProvenanceFingerprint,
    sourceStatePaintFingerprint: scene.sourceStatePaintFingerprint,
    policy: scene.policy,
    payloadPolicy: scene.payloadPolicy,
    root: scene.root,
    summary: scene.summary,
    work: scene.work,
    contracts: scene.contracts,
    mayPublishLayout: scene.mayPublishLayout,
    productionBinding: scene.productionBinding,
  }
}

function exactBuildInput(value: unknown): {
  readonly lineTree: unknown
  readonly sourceState: unknown
} | null {
  const record = exactRecord(value, ["lineTree", "sourceState"])
  return record == null
    ? null
    : {
        lineTree: record.lineTree,
        sourceState: record.sourceState,
      }
}

function collectSourceItems(
  root: VNextTextBlockUnifiedLayoutSourceNodeV1,
): {
  readonly itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >
  readonly visitedNodeCount: number
  readonly visitedItemCount: number
} | null {
  const itemsByLineage = new Map<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >()
  let visitedNodeCount = 0
  let visitedItemCount = 0
  const visit = (node: VNextTextBlockUnifiedLayoutSourceNodeV1): boolean => {
    visitedNodeCount += 1
    if (node.nodeKind === "leaf") {
      for (const item of node.items) {
        if (itemsByLineage.has(item.lineageId)) return false
        itemsByLineage.set(item.lineageId, item)
        visitedItemCount += 1
      }
      return true
    }
    return node.children.every(visit)
  }
  return visit(root)
    ? { itemsByLineage, visitedNodeCount, visitedItemCount }
    : null
}

function itemsForSpans(
  spans: readonly VNextTextBlockPersistentLayoutLocalSourceSpanV1[],
  itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >,
): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] | null {
  const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  for (const span of spans) {
    const item = itemsByLineage.get(span.lineageId)
    if (
      item == null
      || !Number.isSafeInteger(span.localStartRenderedUtf16)
      || !Number.isSafeInteger(span.localEndRenderedUtf16)
      || span.localStartRenderedUtf16 < 0
      || span.localEndRenderedUtf16 <= span.localStartRenderedUtf16
      || span.localEndRenderedUtf16 > item.renderedUtf16Length
    ) return null
    items.push(item)
  }
  return items
}

function sceneFragment(
  fragment:
    VNextTextBlockPersistentLayoutLineLeafV1["line"]["lineInternals"][
      "fragments"
    ][number],
  itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >,
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneFragmentV2 | null {
  const items = itemsForSpans(fragment.sourceSpans, itemsByLineage)
  if (items == null) return null
  if (fragment.kind === "text") {
    const paintRuns = items.map((item, index) => {
      if (
        item.kind === "hard-break"
        || item.kind === "inline-image"
      ) return null
      return {
        sourceSpan: fragment.sourceSpans[index]!,
        textColor: item.style.textColor,
        textDecoration: item.style.textDecoration,
        strikethrough: item.style.strikethrough,
        authoredTextColor:
          item.style.authoredLocalStyle?.textColor ?? null,
        paintFingerprint: item.paintFingerprint,
      }
    })
    if (paintRuns.some((paint) => paint == null)) return null
    const exactPaintRuns = paintRuns as Exclude<
      (typeof paintRuns)[number],
      null
    >[]
    const facts = {
      kind: "text" as const,
      lineageId: fragment.lineageId,
      sourceSpans: fragment.sourceSpans,
      paintRuns: exactPaintRuns,
      paintFingerprint: fingerprintWith(factory, {
        paintRuns: exactPaintRuns.map((paint) => paint.paintFingerprint),
      }),
    }
    return {
      ...facts,
      fingerprint: fingerprintWith(factory, {
        contractVersion: 2,
        ...facts,
      }),
    }
  }
  if (items.length !== 1 || items[0]?.kind !== "inline-image") return null
  const item = items[0]
  const facts = {
    kind: "inline-image" as const,
    lineageId: fragment.lineageId,
    sourceSpans: fragment.sourceSpans,
    assetId: item.assetId,
    authoredFrame: structuredClone(item.authoredFrame),
    paintFingerprint: item.paintFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 2,
      ...facts,
    }),
  }
}

function chunkFromLineLeaf(
  leaf: VNextTextBlockPersistentLayoutLineLeafV1,
  itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >,
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneChunkV2 | null {
  const fragments: VNextTextBlockPersistentSceneFragmentV2[] = []
  for (const fragment of leaf.line.lineInternals.fragments) {
    const projected = sceneFragment(fragment, itemsByLineage, factory)
    if (projected == null) return null
    fragments.push(projected)
  }
  const mappedItems = leaf.line.sourceMapping.map(
    (mapping) => itemsByLineage.get(mapping.lineageId),
  )
  if (
    mappedItems.some((item) => item == null)
    || mappedItems.some((item, index) =>
      item!.sourceFingerprint
        !== leaf.line.sourceMapping[index]!.sourceFingerprint
      || item!.provenanceFingerprint
        !== leaf.line.sourceMapping[index]!.provenanceFingerprint
    )
  ) return null
  const paintFingerprint = fingerprintWith(factory, {
    sourcePaint: mappedItems.map((item) => item!.paintFingerprint),
    fragmentPaint: fragments.map((fragment) => fragment.paintFingerprint),
  })
  const facts = {
    lineLineageId: leaf.line.lineageId,
    sourceMapping: leaf.line.sourceMapping,
    lineInternals: leaf.line.lineInternals,
    contentLocalGeometry: leaf.line.contentLocalGeometry,
    authoredBoxGeometry: leaf.line.authoredBoxGeometry,
    fragments,
    lineInternalsFingerprint:
      leaf.line.lineInternals.fingerprint,
    sourceFingerprint: leaf.line.sourceFingerprint,
    provenanceFingerprint: leaf.line.provenanceFingerprint,
    paintFingerprint,
    boundarySpatialContextFingerprint:
      leaf.line.boundarySpatialContextFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 2,
      ...facts,
    }),
  }
}

function leafFromChunk(
  lineLeaf: VNextTextBlockPersistentLayoutLineLeafV1,
  chunk: VNextTextBlockPersistentSceneChunkV2,
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneLeafV2 {
  let textFragmentCount = 0
  let inlineImageFragmentCount = 0
  for (const fragment of chunk.fragments) {
    if (fragment.kind === "text") textFragmentCount += 1
    else inlineImageFragmentCount += 1
  }
  const summary: VNextTextBlockPersistentSceneSummaryV2 = {
    chunkCount: 1,
    lineCount: 1,
    textFragmentCount,
    inlineImageFragmentCount,
    leafCount: 1,
    nodeCount: 1,
    sourceRange: lineLeaf.summary.sourceRange,
    authoredTopLayoutUnit: lineLeaf.summary.authoredTopLayoutUnit,
    authoredBottomLayoutUnit: lineLeaf.summary.authoredBottomLayoutUnit,
    estimatedCanonicalPayloadByteCount: utf8ByteCount({
      payloadPolicyVersion: 1,
      chunk,
    }),
    lineInternalsFingerprint: chunk.lineInternalsFingerprint,
    sourceFingerprint: chunk.sourceFingerprint,
    provenanceFingerprint: chunk.provenanceFingerprint,
    paintFingerprint: chunk.paintFingerprint,
    boundarySpatialContextFingerprint:
      chunk.boundarySpatialContextFingerprint,
  }
  return {
    nodeKind: "leaf",
    height: 0,
    chunk,
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 2,
      nodeKind: "leaf",
      chunkFingerprint: chunk.fingerprint,
      summary,
    }),
  }
}

function summaryFromChildren(
  children: readonly VNextTextBlockPersistentSceneNodeV2[],
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneSummaryV2 {
  let chunkCount = 0
  let lineCount = 0
  let textFragmentCount = 0
  let inlineImageFragmentCount = 0
  let leafCount = 0
  let nodeCount = 1
  let estimatedCanonicalPayloadByteCount = 0
  let authoredTopLayoutUnit: number | null = null
  let authoredBottomLayoutUnit: number | null = null
  for (const child of children) {
    chunkCount = safeAdd(chunkCount, child.summary.chunkCount)
    lineCount = safeAdd(lineCount, child.summary.lineCount)
    textFragmentCount = safeAdd(
      textFragmentCount,
      child.summary.textFragmentCount,
    )
    inlineImageFragmentCount = safeAdd(
      inlineImageFragmentCount,
      child.summary.inlineImageFragmentCount,
    )
    leafCount = safeAdd(leafCount, child.summary.leafCount)
    nodeCount = safeAdd(nodeCount, child.summary.nodeCount)
    estimatedCanonicalPayloadByteCount = safeAdd(
      estimatedCanonicalPayloadByteCount,
      child.summary.estimatedCanonicalPayloadByteCount,
    )
    const top = child.summary.authoredTopLayoutUnit
    const bottom = child.summary.authoredBottomLayoutUnit
    if (top != null) {
      authoredTopLayoutUnit = authoredTopLayoutUnit == null
        ? top
        : Math.min(authoredTopLayoutUnit, top)
    }
    if (bottom != null) {
      authoredBottomLayoutUnit = authoredBottomLayoutUnit == null
        ? bottom
        : Math.max(authoredBottomLayoutUnit, bottom)
    }
  }
  const first = children[0]
  const last = children[children.length - 1]
  const component = (name: string, values: readonly string[]): string =>
    fingerprintWith(factory, { component: name, children: values })
  return {
    chunkCount,
    lineCount,
    textFragmentCount,
    inlineImageFragmentCount,
    leafCount,
    nodeCount,
    sourceRange: {
      start: first?.summary.sourceRange.start ?? null,
      end: last?.summary.sourceRange.end ?? null,
    },
    authoredTopLayoutUnit,
    authoredBottomLayoutUnit,
    estimatedCanonicalPayloadByteCount,
    lineInternalsFingerprint: component(
      "line-internals",
      children.map((child) => child.summary.lineInternalsFingerprint),
    ),
    sourceFingerprint: component(
      "source",
      children.map((child) => child.summary.sourceFingerprint),
    ),
    provenanceFingerprint: component(
      "provenance",
      children.map((child) => child.summary.provenanceFingerprint),
    ),
    paintFingerprint: component(
      "paint",
      children.map((child) => child.summary.paintFingerprint),
    ),
    boundarySpatialContextFingerprint: component(
      "boundary-spatial-context",
      children.map(
        (child) => child.summary.boundarySpatialContextFingerprint,
      ),
    ),
  }
}

function branchFromChildren(
  children: readonly VNextTextBlockPersistentSceneNodeV2[],
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneBranchV2 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]!.height)
  ) throw new Error("invalid scene branch")
  const summary = summaryFromChildren(children, factory)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children,
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 2,
      nodeKind: "branch",
      height: children[0]!.height + 1,
      childFingerprints: children.map((child) => child.fingerprint),
      summary,
    }),
  }
}

function projectRoot(
  lineRoot: VNextTextBlockPersistentLayoutLineRootV1,
  itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >,
  factory: FingerprintFactory,
  nodes: WeakSet<object>,
  chunkOrdinal: { value: number },
): VNextTextBlockPersistentSceneRootV2 | VNextTextBlockPersistentSceneIssueV2 {
  if (lineRoot.nodeKind === "empty") {
    nodes.add(VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2)
    return VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2
  }
  if (lineRoot.nodeKind === "leaf") {
    const ordinal = chunkOrdinal.value
    chunkOrdinal.value += 1
    const chunk = chunkFromLineLeaf(lineRoot, itemsByLineage, factory)
    if (chunk == null) {
      return issue(
        "scene-fragment-lineage-mismatch",
        "line fragment source spans do not map to exact source paint facts",
        ordinal,
      )
    }
    const leaf = leafFromChunk(lineRoot, chunk, factory)
    nodes.add(leaf)
    return leaf
  }
  const children: VNextTextBlockPersistentSceneNodeV2[] = []
  for (const child of lineRoot.children) {
    const projected = projectRoot(
      child,
      itemsByLineage,
      factory,
      nodes,
      chunkOrdinal,
    )
    if (Object.hasOwn(projected, "code")) {
      return projected as VNextTextBlockPersistentSceneIssueV2
    }
    children.push(projected as VNextTextBlockPersistentSceneNodeV2)
  }
  const branch = branchFromChildren(children, factory)
  nodes.add(branch)
  return branch
}

function buildComplete(
  input: unknown,
  factory: FingerprintFactory,
): VNextTextBlockPersistentSceneBuildResultV2 {
  const exact = exactBuildInput(input)
  if (exact == null) {
    return blocked(issue(
      "invalid-input",
      "Persistent Scene V2 requires an exact accessor-free line/source envelope",
    ))
  }
  const lineInspection =
    verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      exact.lineTree,
    )
  if (lineInspection.status !== "valid-candidate") {
    return blocked(issue(
      "line-tree-authority-mismatch",
      lineInspection.message,
    ))
  }
  const sourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      exact.sourceState,
    )
  if (sourceInspection.status !== "prepared-unregistered") {
    return blocked(issue(
      "source-state-authority-mismatch",
      sourceInspection.message,
    ))
  }
  const lineTree =
    exact.lineTree as VNextTextBlockPersistentLayoutLineTreeV1
  const sourceState =
    exact.sourceState as VNextTextBlockUnifiedLayoutSourceStateV1
  if (
    !hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1(
      sourceState,
      lineTree,
    )
  ) {
    return blocked(issue(
      "scene-dependency-binding-mismatch",
      "line tree and source state are not one exact prepared dependency record",
    ))
  }
  const collected = collectSourceItems(sourceState.root)
  if (collected == null) {
    return blocked(issue(
      "scene-source-lineage-mismatch",
      "source state contains duplicate scene lineage",
    ))
  }
  try {
    const nodes = new WeakSet<object>()
    const chunkOrdinal = { value: 0 }
    const projected = projectRoot(
      lineTree.root,
      collected.itemsByLineage,
      factory,
      nodes,
      chunkOrdinal,
    )
    if (Object.hasOwn(projected, "code")) {
      return blocked(projected as VNextTextBlockPersistentSceneIssueV2)
    }
    const root = projected as VNextTextBlockPersistentSceneRootV2
    if (chunkOrdinal.value !== lineTree.summary.lineCount) {
      return blocked(issue(
        "scene-invalid-topology",
        "scene projection did not preserve one chunk per logical line",
      ))
    }
    const headerByteCount = utf8ByteCount({
      payloadPolicyVersion: 1,
      source: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION,
    })
    const totalEstimatedPayloadByteCount = safeAdd(
      headerByteCount,
      root.summary.estimatedCanonicalPayloadByteCount,
    )
    const summary: VNextTextBlockPersistentSceneSummaryV2 = {
      ...root.summary,
      estimatedCanonicalPayloadByteCount:
        totalEstimatedPayloadByteCount,
    }
    const work = {
      completeSceneProjectionCount: 1 as const,
      visitedLineCount: lineTree.summary.lineCount,
      visitedFragmentCount: safeAdd(
        root.summary.textFragmentCount,
        root.summary.inlineImageFragmentCount,
      ),
      visitedSourceItemCount: collected.visitedItemCount,
      emittedChunkCount: root.summary.chunkCount,
      createdLeafCount: root.summary.leafCount,
      createdNodeCount: root.summary.nodeCount,
      reusedChunkCount: 0 as const,
      reusedSceneNodeCount: 0 as const,
      incrementalCopiedNodeCount: 0 as const,
      completeLineTreeTraversalCount: 1 as const,
      completeSceneTraversalCount: 0 as const,
      estimatedCanonicalPayloadByteCount:
        totalEstimatedPayloadByteCount,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION,
      documentId: lineTree.documentId,
      sectionId: lineTree.sectionId,
      textBlockId: lineTree.textBlockId,
      instanceRevision: lineTree.instanceRevision,
      layoutId: lineTree.layoutId,
      lineTreeFingerprint: lineTree.fingerprint,
      sourceStateSourceFingerprint:
        sourceState.summary.sourceFingerprint,
      sourceStateProvenanceFingerprint:
        sourceState.summary.provenanceFingerprint,
      sourceStatePaintFingerprint:
        sourceState.summary.paintFingerprint,
      policy: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2,
      payloadPolicy:
        VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2,
      root,
      summary,
      work,
      contracts: {
        rendererConsumptionOnly: true as const,
        oneTextBlockOnly: true as const,
        oneRendererChunkPerLeaf: true as const,
        stableLocalSourceCoordinates: true as const,
        absoluteChunkOrdinalsExcluded: true as const,
        absoluteLineOrdinalsExcluded: true as const,
        absoluteRenderedOffsetsExcluded: true as const,
        structuredCloneSafe: true as const,
        genericSequence: false as const,
        documentGraph: false as const,
        scheduler: false as const,
        history: false as const,
        assetStore: false as const,
        randomAccessMutation: false as const,
        preparedGraphCandidate: true as const,
        registeredAuthority: false as const,
        stagedEditorApply: false as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const withoutFingerprint = deepFreeze(facts)
    const canonicalFacts = stringifyVNextCanonicalJson(sceneCanonicalFacts({
      ...withoutFingerprint,
      fingerprint: "",
    }))
    const scene = Object.freeze({
      ...withoutFingerprint,
      fingerprint: factory(canonicalFacts),
    })
    preparedScenes.set(scene, {
      fingerprint: scene.fingerprint,
      canonicalFacts,
      fingerprintFactory: factory,
      lineTree,
      sourceState,
      nodes,
    })
    return Object.freeze({
      status: "prepared",
      scene,
      work: scene.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blocked(issue(
      "scene-unsafe-summary",
      "scene projection exceeded safe topology, payload, or summary arithmetic",
    ))
  }
}

export function createVNextTextBlockPersistentSceneCompleteInternalV2(
  input: VNextTextBlockPersistentSceneCompleteBuildInputV2,
): VNextTextBlockPersistentSceneBuildResultV2
export function createVNextTextBlockPersistentSceneCompleteInternalV2(
  input: unknown,
): VNextTextBlockPersistentSceneBuildResultV2
export function createVNextTextBlockPersistentSceneCompleteInternalV2(
  input: unknown,
): VNextTextBlockPersistentSceneBuildResultV2 {
  return buildComplete(input, defaultFingerprint)
}

export function createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2(
  input: VNextTextBlockPersistentSceneCompleteBuildInputV2,
): VNextTextBlockPersistentSceneBuildResultV2 {
  return buildComplete(input, forcedCollisionFingerprint)
}

export function verifyVNextTextBlockPersistentSceneCandidateInternalV2(
  value: unknown,
): VNextTextBlockPersistentSceneCandidateInspectionV2 {
  if (
    value == null
    || typeof value !== "object"
    || !preparedScenes.has(value as VNextTextBlockPersistentSceneV2)
  ) {
    return {
      status: "invalid",
      code: "scene-candidate-authority-mismatch",
      message: "scene is not the exact process-local prepared candidate",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "scene-candidate-not-deeply-frozen",
      message: "prepared scene candidate must remain recursively frozen",
    }
  }
  try {
    const scene = value as VNextTextBlockPersistentSceneV2
    const record = preparedScenes.get(scene)!
    if (
      !hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1(
        record.sourceState,
        record.lineTree,
      )
    ) {
      return {
        status: "invalid",
        code: "scene-candidate-dependency-mismatch",
        message: "prepared scene dependencies no longer form one exact record",
      }
    }
    const canonicalFacts = stringifyVNextCanonicalJson(
      sceneCanonicalFacts(scene),
    )
    if (
      record.canonicalFacts !== canonicalFacts
      || record.fingerprint !== scene.fingerprint
      || scene.fingerprint !== record.fingerprintFactory(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "scene-candidate-canonical-facts-mismatch",
        message: "prepared scene no longer matches canonical facts",
      }
    }
    return {
      status: "valid-candidate",
      fingerprint: scene.fingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "scene-candidate-canonical-facts-mismatch",
      message: "prepared scene is not canonically inspectable",
    }
  }
}

export function inspectVNextTextBlockPersistentSceneV2(
  value: unknown,
): VNextTextBlockPersistentSceneInspectionV2 {
  if (
    value == null
    || typeof value !== "object"
    || !registeredScenes.has(value as VNextTextBlockPersistentSceneV2)
  ) {
    return {
      status: "invalid",
      code: "scene-authority-mismatch",
      message: "scene is not an exact process-local committed Root V2 child",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "scene-not-deeply-frozen",
      message: "registered scene must remain recursively frozen",
    }
  }
  try {
    const scene = value as VNextTextBlockPersistentSceneV2
    const record = registeredScenes.get(scene)!
    const canonicalFacts = stringifyVNextCanonicalJson(
      sceneCanonicalFacts(scene),
    )
    if (
      record.canonicalFacts !== canonicalFacts
      || record.fingerprint !== scene.fingerprint
    ) {
      return {
        status: "invalid",
        code: "scene-canonical-facts-mismatch",
        message: "registered scene no longer matches committed canonical facts",
      }
    }
    return { status: "valid", fingerprint: scene.fingerprint }
  } catch {
    return {
      status: "invalid",
      code: "scene-canonical-facts-mismatch",
      message: "registered scene is not canonically inspectable",
    }
  }
}

export function lookupVNextTextBlockPersistentSceneChunkInternalV2(input: {
  readonly scene: VNextTextBlockPersistentSceneV2
  readonly chunkOrdinal: number
}): VNextTextBlockPersistentSceneChunkLookupResultV2 {
  if (
    input.scene == null
    || typeof input.scene !== "object"
    || !preparedScenes.has(input.scene)
  ) {
    return {
      status: "blocked",
      chunkOrdinal: null,
      leaf: null,
      work: null,
      issues: [issue(
        "scene-invalid-topology",
        "scene lookup requires the exact process-local prepared candidate",
      )],
    }
  }
  if (
    !Number.isSafeInteger(input.chunkOrdinal)
    || input.chunkOrdinal < 0
    || input.chunkOrdinal >= input.scene.root.summary.chunkCount
  ) {
    return {
      status: "not-found",
      chunkOrdinal: null,
      leaf: null,
      work: {
        visitedNodeCount: 0,
        completeSceneTraversalCount: 0,
      },
    }
  }
  let relativeOrdinal = input.chunkOrdinal
  let node = input.scene.root
  let visitedNodeCount = 1
  while (node.nodeKind === "branch") {
    let selected: VNextTextBlockPersistentSceneNodeV2 | null = null
    for (const child of node.children) {
      if (relativeOrdinal < child.summary.chunkCount) {
        selected = child
        break
      }
      relativeOrdinal -= child.summary.chunkCount
    }
    if (selected == null) break
    node = selected
    visitedNodeCount += 1
  }
  return node.nodeKind === "leaf"
    ? {
        status: "found",
        chunkOrdinal: input.chunkOrdinal,
        leaf: node,
        work: {
          visitedNodeCount,
          completeSceneTraversalCount: 0,
        },
      }
    : {
        status: "not-found",
        chunkOrdinal: null,
        leaf: null,
        work: {
          visitedNodeCount,
          completeSceneTraversalCount: 0,
        },
      }
}

function exactArray(value: unknown): readonly unknown[] | null {
  try {
    if (
      !Array.isArray(value)
      || Object.getPrototypeOf(value) !== Array.prototype
    ) return null
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (
      length == null
      || !Object.hasOwn(length, "value")
      || !Number.isSafeInteger(length.value)
      || length.value < 0
      || Reflect.ownKeys(value).length !== length.value + 1
    ) return null
    const output: unknown[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output.push(descriptor.value)
    }
    return output
  } catch {
    return null
  }
}

function siblingReferences(
  value: unknown,
): readonly VNextTextBlockPersistentSceneSiblingReferenceV2[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: VNextTextBlockPersistentSceneSiblingReferenceV2[] = []
  for (const item of values) {
    const record = exactRecord(item, ["node", "fingerprint", "summary"])
    if (record == null || typeof record.fingerprint !== "string") return null
    output.push({
      node: record.node as VNextTextBlockPersistentSceneRootV2,
      fingerprint: record.fingerprint,
      summary: record.summary as VNextTextBlockPersistentSceneSummaryV2,
    })
  }
  return output
}

export function inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2(
  input: unknown,
): VNextTextBlockPersistentSceneIncrementalFragmentInspectionV2 {
  const record = exactRecord(input, [
    "scene",
    "copiedPathNodes",
    "replacementNodes",
    "siblingReferences",
    "completePreviousSceneTraversal",
    "completeNextSceneTraversal",
  ])
  if (record == null) {
    return {
      status: "invalid",
      code: "scene-incremental-fragment-invalid",
      message: "incremental scene inspection requires an exact bounded fragment",
    }
  }
  if (
    record.completePreviousSceneTraversal !== false
    || record.completeNextSceneTraversal !== false
  ) {
    return {
      status: "invalid",
      code: "scene-complete-traversal-forbidden",
      message: "incremental inspection forbids complete previous/next scene traversal",
    }
  }
  const copiedPathNodes = exactArray(record.copiedPathNodes)
  const replacementNodes = exactArray(record.replacementNodes)
  const siblings = siblingReferences(record.siblingReferences)
  if (
    copiedPathNodes == null
    || replacementNodes == null
    || siblings == null
    || record.scene == null
    || typeof record.scene !== "object"
    || !preparedScenes.has(
      record.scene as VNextTextBlockPersistentSceneV2,
    )
  ) {
    return {
      status: "invalid",
      code: "scene-incremental-fragment-invalid",
      message: "incremental scene fragment or candidate is invalid",
    }
  }
  const scene = record.scene as VNextTextBlockPersistentSceneV2
  const prepared = preparedScenes.get(scene)!
  if (
    [...copiedPathNodes, ...replacementNodes].some(
      (node) =>
        node == null
        || typeof node !== "object"
        || !prepared.nodes.has(node),
    )
  ) {
    return {
      status: "invalid",
      code: "scene-incremental-node-authority-mismatch",
      message: "incremental path/replacement node is not exact scene-local data",
    }
  }
  if (siblings.some((reference) =>
    reference.node == null
    || typeof reference.node !== "object"
    || !prepared.nodes.has(reference.node)
    || reference.node.fingerprint !== reference.fingerprint
    || reference.node.summary !== reference.summary
  )) {
    return {
      status: "invalid",
      code: "scene-incremental-sibling-reference-mismatch",
      message: "incremental sibling summary/fingerprint reference is not exact",
    }
  }
  return {
    status: "valid-fragment",
    work: {
      inspectedCopiedPathNodeCount: copiedPathNodes.length,
      inspectedReplacementNodeCount: replacementNodes.length,
      inspectedSiblingReferenceCount: siblings.length,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    },
  }
}
