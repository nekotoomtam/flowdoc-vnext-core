import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1,
  inspectVNextTextBlockPersistentLayoutLineTreeShallowAuthorityInternalV1,
  lookupVNextTextBlockPersistentLayoutLineInternalV1,
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
  type VNextTextBlockPersistentScenePayloadObservationV2,
  type VNextTextBlockPersistentScenePayloadPolicyV2,
  type VNextTextBlockPersistentScenePolicyV2,
  type VNextTextBlockPersistentSceneRootV2,
  type VNextTextBlockPersistentSceneSiblingReferenceV2,
  type VNextTextBlockPersistentSceneSummaryV2,
  type VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import {
  hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  resolveVNextTextBlockUnifiedLayoutImagePaintSourceItemAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"

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
  fieldAllowlistFingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({
      payloadFields: ["chunk"] as const,
    }),
  ),
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

type VNextTextBlockPersistentSceneHotPathEventForTestV2 =
  | {
      readonly kind:
        | "full-candidate-inspection"
        | "full-canonical-rehash"
        | "retained-graph-recursive-freeze"
      readonly probeCount: 1
    }
  | {
      readonly kind: "historical-node-set-probe"
      readonly probeCount: number
    }

let hotPathObserverForTest:
  | ((event: VNextTextBlockPersistentSceneHotPathEventForTestV2) => void)
  | null = null

const constructedSceneNodes = new WeakSet<object>()

export function setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2(
  observer:
    | ((event: VNextTextBlockPersistentSceneHotPathEventForTestV2) => void)
    | null,
): void {
  hotPathObserverForTest = observer
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  if (Object.isFrozen(value) && constructedSceneNodes.has(value)) {
    hotPathObserverForTest?.({
      kind: "retained-graph-recursive-freeze",
      probeCount: 1,
    })
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

export function recursivelyFreezeVNextTextBlockPersistentSceneForTestInternalV2(
  scene: VNextTextBlockPersistentSceneV2,
): void {
  deepFreeze(scene)
}

function frozenSceneShell(value: unknown): boolean {
  if (value == null || typeof value !== "object") return false
  try {
    const scene = value as VNextTextBlockPersistentSceneV2
    return Object.isFrozen(scene)
      && Object.isFrozen(scene.root)
      && Object.isFrozen(scene.summary)
      && Object.isFrozen(scene.payloadObservation)
      && Object.isFrozen(scene.work)
      && Object.isFrozen(scene.contracts)
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
  lineInternalsFingerprint: emptyComponentFingerprint("line-internals"),
  sourceFingerprint: emptyComponentFingerprint("source"),
  provenanceFingerprint: emptyComponentFingerprint("provenance"),
  paintFingerprint: emptyComponentFingerprint("paint"),
  boundarySpatialContextFingerprint:
    emptyComponentFingerprint("boundary-spatial-context"),
})

const emptySemanticFingerprint = createVNextCompactFingerprint(
  stringifyVNextCanonicalJson({
    contractVersion: 2,
    nodeKind: "empty",
    summary: emptySummary,
    scenePolicyFingerprint: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2
      .fingerprint,
  }),
)

function payloadObservation(
  semanticFingerprint: string,
  estimatedCanonicalPayloadByteCount: number,
  payloadPolicyFingerprint: string,
  childObservationFingerprints: readonly string[],
): VNextTextBlockPersistentScenePayloadObservationV2 {
  const facts = {
    semanticFingerprint,
    estimatedCanonicalPayloadByteCount,
    payloadPolicyFingerprint,
    childObservationFingerprints,
  }
  return deepFreeze({
    estimatedCanonicalPayloadByteCount,
    payloadObservationFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(facts),
    ),
  })
}

function emptyRoot(
  payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2,
): VNextTextBlockPersistentSceneEmptyRootV2 {
  const root = deepFreeze({
    nodeKind: "empty" as const,
    height: 0 as const,
    summary: emptySummary,
    payloadObservation: payloadObservation(
      emptySemanticFingerprint,
      0,
      payloadPolicy.fingerprint,
      [],
    ),
    fingerprint: emptySemanticFingerprint,
  })
  constructedSceneNodes.add(root)
  return root
}

export const VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2 = emptyRoot(
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2,
)

interface PreparedSceneRecord {
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly fingerprintFactory: FingerprintFactory
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly chunkOrdinalsByLineage:
    ReadonlyMap<string, readonly number[]>
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

interface IncrementalFragmentAuthorityRecordV2 {
  readonly scene: VNextTextBlockPersistentSceneV2
  readonly copiedPathNodes:
    readonly VNextTextBlockPersistentSceneNodeV2[]
  readonly replacementNodes:
    readonly VNextTextBlockPersistentSceneLeafV2[]
  readonly siblingReferences:
    readonly VNextTextBlockPersistentSceneSiblingReferenceV2[]
}

const incrementalFragmentAuthorities = new WeakMap<
  object,
  IncrementalFragmentAuthorityRecordV2
>()

const sourcePaintFingerprintsByChunk = new WeakMap<
  VNextTextBlockPersistentSceneChunkV2,
  readonly string[]
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

function sceneSemanticFacts(scene: VNextTextBlockPersistentSceneV2): unknown {
  return {
    source: scene.source,
    contractVersion: scene.contractVersion,
    documentId: scene.documentId,
    sectionId: scene.sectionId,
    textBlockId: scene.textBlockId,
    instanceRevision: scene.instanceRevision,
    layoutId: scene.layoutId,
    lineTreeSemanticFingerprint: scene.lineTreeSemanticFingerprint,
    sourceStateSourceFingerprint: scene.sourceStateSourceFingerprint,
    sourceStateProvenanceFingerprint:
      scene.sourceStateProvenanceFingerprint,
    sourceStatePaintFingerprint: scene.sourceStatePaintFingerprint,
    policy: scene.policy,
    rootFingerprint: scene.root.fingerprint,
    summary: scene.summary,
    contracts: scene.contracts,
    mayPublishLayout: scene.mayPublishLayout,
    productionBinding: scene.productionBinding,
  }
}

export function composeVNextTextBlockPersistentSceneIdentityForTestInternalV2(
  input: {
    readonly scene: VNextTextBlockPersistentSceneV2
    readonly lineTreeFingerprint: string
    readonly lineTreeSemanticFingerprint: string
  },
): {
  readonly lineTreeFingerprint: string
  readonly lineTreeSemanticFingerprint: string
  readonly fingerprint: string
} {
  const record = preparedScenes.get(input.scene)
  const fingerprintFactory = record?.fingerprintFactory ?? defaultFingerprint
  return Object.freeze({
    lineTreeFingerprint: input.lineTreeFingerprint,
    lineTreeSemanticFingerprint: input.lineTreeSemanticFingerprint,
    fingerprint: fingerprintFactory(stringifyVNextCanonicalJson(
      sceneSemanticFacts({
        ...input.scene,
        lineTreeFingerprint: input.lineTreeFingerprint,
        lineTreeSemanticFingerprint: input.lineTreeSemanticFingerprint,
      }),
    )),
  })
}

function exactBuildInput(value: unknown): {
  readonly lineTree: unknown
  readonly sourceState: unknown
  readonly payloadPolicy:
    VNextTextBlockPersistentScenePayloadPolicyV2 | null
} | null {
  const record = exactRecord(value, ["lineTree", "sourceState"])
    ?? exactRecord(value, ["lineTree", "sourceState", "payloadPolicy"])
  return record == null
    ? null
    : {
        lineTree: record.lineTree,
        sourceState: record.sourceState,
        payloadPolicy: record.payloadPolicy == null
          ? null
          : record.payloadPolicy as VNextTextBlockPersistentScenePayloadPolicyV2,
      }
}

function exactPayloadPolicy(
  value: unknown,
): VNextTextBlockPersistentScenePayloadPolicyV2 | null {
  const record = exactRecord(value, [
    "payloadPolicyVersion",
    "canonicalEncoding",
    "fieldAllowlistFingerprint",
    "fingerprint",
  ])
  if (
    record == null
    || record.payloadPolicyVersion !== 1
    || record.canonicalEncoding !== "utf8-canonical-json"
    || typeof record.fieldAllowlistFingerprint !== "string"
    || typeof record.fingerprint !== "string"
  ) return null
  const expectedFingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({
      payloadPolicyVersion: record.payloadPolicyVersion,
      canonicalEncoding: record.canonicalEncoding,
      fieldAllowlistFingerprint: record.fieldAllowlistFingerprint,
    }),
  )
  return record.fingerprint === expectedFingerprint
    ? record as unknown as VNextTextBlockPersistentScenePayloadPolicyV2
    : null
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
  const chunk = {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 2,
      ...facts,
    }),
  }
  sourcePaintFingerprintsByChunk.set(
    chunk,
    Object.freeze(mappedItems.map((item) => item!.paintFingerprint)),
  )
  return chunk
}

function imagePaintChunkFromPrevious(
  input: {
    readonly previousChunk: VNextTextBlockPersistentSceneChunkV2
    readonly changedItem:
      Extract<VNextTextBlockUnifiedLayoutSourceItemV1, { readonly kind: "inline-image" }>
    readonly factory: FingerprintFactory
  },
): VNextTextBlockPersistentSceneChunkV2 | null {
  const previousSourcePaint =
    sourcePaintFingerprintsByChunk.get(input.previousChunk)
  if (
    previousSourcePaint == null
    || previousSourcePaint.length !== input.previousChunk.sourceMapping.length
  ) return null

  const changedMappingIndexes: number[] = []
  input.previousChunk.sourceMapping.forEach((mapping, index) => {
    if (mapping.lineageId === input.changedItem.lineageId) {
      changedMappingIndexes.push(index)
    }
  })
  if (changedMappingIndexes.length !== 1) return null
  const changedMappingIndex = changedMappingIndexes[0]!
  const changedMapping = input.previousChunk.sourceMapping[changedMappingIndex]!
  if (
    changedMapping.inlineId !== input.changedItem.inlineId
    || changedMapping.sourceKind !== "inline-image"
    || changedMapping.sourceFingerprint !== input.changedItem.sourceFingerprint
    || changedMapping.provenanceFingerprint
      !== input.changedItem.provenanceFingerprint
  ) return null

  let changedFragmentCount = 0
  const fragments = input.previousChunk.fragments.map((fragment) => {
    if (
      fragment.kind !== "inline-image"
      || !fragment.sourceSpans.some(
        (span) => span.lineageId === input.changedItem.lineageId,
      )
    ) return fragment
    if (
      fragment.sourceSpans.length !== 1
      || fragment.sourceSpans[0]!.lineageId !== input.changedItem.lineageId
      || fragment.assetId !== input.changedItem.assetId
    ) throw new Error("image fragment escaped exact paint lineage")
    changedFragmentCount += 1
    const authoredFrame = deepFreeze(structuredClone(
      input.changedItem.authoredFrame,
    ))
    const facts = {
      kind: "inline-image" as const,
      lineageId: fragment.lineageId,
      sourceSpans: fragment.sourceSpans,
      assetId: input.changedItem.assetId,
      authoredFrame,
      paintFingerprint: input.changedItem.paintFingerprint,
    }
    return Object.freeze({
      ...facts,
      fingerprint: fingerprintWith(input.factory, {
        contractVersion: 2,
        ...facts,
      }),
    })
  })
  if (changedFragmentCount !== 1) return null

  const nextSourcePaint = [...previousSourcePaint]
  nextSourcePaint[changedMappingIndex] = input.changedItem.paintFingerprint
  const frozenSourcePaint = Object.freeze(nextSourcePaint)
  const frozenFragments = Object.freeze(fragments)
  const paintFingerprint = fingerprintWith(input.factory, {
    sourcePaint: frozenSourcePaint,
    fragmentPaint: frozenFragments.map(
      (fragment) => fragment.paintFingerprint,
    ),
  })
  const facts = {
    lineLineageId: input.previousChunk.lineLineageId,
    sourceMapping: input.previousChunk.sourceMapping,
    lineInternals: input.previousChunk.lineInternals,
    contentLocalGeometry: input.previousChunk.contentLocalGeometry,
    authoredBoxGeometry: input.previousChunk.authoredBoxGeometry,
    fragments: frozenFragments,
    lineInternalsFingerprint:
      input.previousChunk.lineInternalsFingerprint,
    sourceFingerprint: input.previousChunk.sourceFingerprint,
    provenanceFingerprint: input.previousChunk.provenanceFingerprint,
    paintFingerprint,
    boundarySpatialContextFingerprint:
      input.previousChunk.boundarySpatialContextFingerprint,
  }
  const chunk = Object.freeze({
    ...facts,
    fingerprint: fingerprintWith(input.factory, {
      contractVersion: 2,
      ...facts,
    }),
  })
  sourcePaintFingerprintsByChunk.set(chunk, frozenSourcePaint)
  return chunk
}

function leafFromChunk(
  lineLeaf: VNextTextBlockPersistentLayoutLineLeafV1,
  chunk: VNextTextBlockPersistentSceneChunkV2,
  factory: FingerprintFactory,
  payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2,
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
    lineInternalsFingerprint: chunk.lineInternalsFingerprint,
    sourceFingerprint: chunk.sourceFingerprint,
    provenanceFingerprint: chunk.provenanceFingerprint,
    paintFingerprint: chunk.paintFingerprint,
    boundarySpatialContextFingerprint:
      chunk.boundarySpatialContextFingerprint,
  }
  const fingerprint = fingerprintWith(factory, {
    contractVersion: 2,
    nodeKind: "leaf",
    chunkFingerprint: chunk.fingerprint,
    summary,
    scenePolicyFingerprint: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2
      .fingerprint,
  })
  const leaf: VNextTextBlockPersistentSceneLeafV2 = {
    nodeKind: "leaf",
    height: 0,
    chunk,
    summary,
    payloadObservation: payloadObservation(
      fingerprint,
      utf8ByteCount({ payloadPolicyVersion: 1, chunk }),
      payloadPolicy.fingerprint,
      [],
    ),
    fingerprint,
  }
  constructedSceneNodes.add(leaf)
  return leaf
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
  payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2,
): VNextTextBlockPersistentSceneBranchV2 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]!.height)
  ) throw new Error("invalid scene branch")
  const summary = summaryFromChildren(children, factory)
  const fingerprint = fingerprintWith(factory, {
    contractVersion: 2,
    nodeKind: "branch",
    height: children[0]!.height + 1,
    childFingerprints: children.map((child) => child.fingerprint),
    summary,
    scenePolicyFingerprint: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2
      .fingerprint,
  })
  const branch: VNextTextBlockPersistentSceneBranchV2 = {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children,
    summary,
    payloadObservation: payloadObservation(
      fingerprint,
      children.reduce(
        (total, child) => safeAdd(
          total,
          child.payloadObservation.estimatedCanonicalPayloadByteCount,
        ),
        0,
      ),
      payloadPolicy.fingerprint,
      children.map(
        (child) => child.payloadObservation.payloadObservationFingerprint,
      ),
    ),
    fingerprint,
  }
  constructedSceneNodes.add(branch)
  return branch
}

function projectRoot(
  lineRoot: VNextTextBlockPersistentLayoutLineRootV1,
  itemsByLineage: ReadonlyMap<
    string,
    VNextTextBlockUnifiedLayoutSourceItemV1
  >,
  factory: FingerprintFactory,
  payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2,
  chunkOrdinal: { value: number },
  chunkOrdinalsByLineage: Map<string, number[]>,
): VNextTextBlockPersistentSceneRootV2 | VNextTextBlockPersistentSceneIssueV2 {
  if (lineRoot.nodeKind === "empty") {
    const root = payloadPolicy === VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2
      ? VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2
      : emptyRoot(payloadPolicy)
    return root
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
    const leaf = leafFromChunk(lineRoot, chunk, factory, payloadPolicy)
    for (const mapping of chunk.sourceMapping) {
      const ordinals = chunkOrdinalsByLineage.get(mapping.lineageId) ?? []
      if (ordinals[ordinals.length - 1] !== ordinal) {
        ordinals.push(ordinal)
      }
      chunkOrdinalsByLineage.set(mapping.lineageId, ordinals)
    }
    return leaf
  }
  const children: VNextTextBlockPersistentSceneNodeV2[] = []
  for (const child of lineRoot.children) {
    const projected = projectRoot(
      child,
      itemsByLineage,
      factory,
      payloadPolicy,
      chunkOrdinal,
      chunkOrdinalsByLineage,
    )
    if (Object.hasOwn(projected, "code")) {
      return projected as VNextTextBlockPersistentSceneIssueV2
    }
    children.push(projected as VNextTextBlockPersistentSceneNodeV2)
  }
  const branch = branchFromChildren(children, factory, payloadPolicy)
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
  const payloadPolicy = exact.payloadPolicy == null
    ? VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2
    : exactPayloadPolicy(exact.payloadPolicy)
  if (payloadPolicy == null) {
    return blocked(issue(
      "invalid-input",
      "Persistent Scene V2 payload policy must be one exact canonical policy",
    ))
  }
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
    const chunkOrdinal = { value: 0 }
    const chunkOrdinalsByLineage = new Map<string, number[]>()
    const projected = projectRoot(
      lineTree.root,
      collected.itemsByLineage,
      factory,
      payloadPolicy,
      chunkOrdinal,
      chunkOrdinalsByLineage,
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
    const summary: VNextTextBlockPersistentSceneSummaryV2 = root.summary
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
      lineTreeSemanticFingerprint: lineTree.semanticFingerprint,
      sourceStateSourceFingerprint:
        sourceState.summary.sourceFingerprint,
      sourceStateProvenanceFingerprint:
        sourceState.summary.provenanceFingerprint,
      sourceStatePaintFingerprint:
        sourceState.summary.paintFingerprint,
      policy: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2,
      payloadPolicy,
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
    const semanticFacts = sceneSemanticFacts(facts as
      VNextTextBlockPersistentSceneV2)
    const canonicalFacts = stringifyVNextCanonicalJson(semanticFacts)
    const sceneFingerprint = factory(canonicalFacts)
    const scenePayloadObservation = payloadObservation(
      sceneFingerprint,
      safeAdd(
        headerByteCount,
        root.payloadObservation.estimatedCanonicalPayloadByteCount,
      ),
      payloadPolicy.fingerprint,
      [root.payloadObservation.payloadObservationFingerprint],
    )
    const scene = deepFreeze({
      ...facts,
      payloadObservation: scenePayloadObservation,
      fingerprint: sceneFingerprint,
    })
    preparedScenes.set(scene, {
      fingerprint: scene.fingerprint,
      canonicalFacts,
      fingerprintFactory: factory,
      lineTree,
      sourceState,
      chunkOrdinalsByLineage,
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

function replaceSceneLeafAtOrdinal(
  input: {
    readonly node: VNextTextBlockPersistentSceneNodeV2
    readonly relativeOrdinal: number
    readonly replacement: VNextTextBlockPersistentSceneLeafV2
    readonly factory: FingerprintFactory
    readonly payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2
    readonly copiedPathNodes:
      VNextTextBlockPersistentSceneNodeV2[]
    readonly siblingReferences:
      VNextTextBlockPersistentSceneSiblingReferenceV2[]
  },
): VNextTextBlockPersistentSceneNodeV2 {
  if (input.node.nodeKind === "leaf") {
    if (input.relativeOrdinal !== 0) {
      throw new RangeError("scene replacement ordinal escaped one leaf")
    }
    return input.replacement
  }
  let childStart = 0
  let selectedIndex = -1
  for (
    let childIndex = 0;
    childIndex < input.node.children.length;
    childIndex += 1
  ) {
    const child = input.node.children[childIndex]!
    const childEnd = childStart + child.summary.chunkCount
    if (input.relativeOrdinal < childEnd) {
      selectedIndex = childIndex
      break
    }
    childStart = childEnd
  }
  if (selectedIndex < 0) {
    throw new RangeError("scene replacement ordinal escaped root")
  }
  const children = input.node.children.map((child, childIndex) => {
    if (childIndex !== selectedIndex) {
      input.siblingReferences.push({
        node: child,
        fingerprint: child.fingerprint,
        payloadObservationFingerprint:
          child.payloadObservation.payloadObservationFingerprint,
        summary: child.summary,
      })
      return child
    }
    return replaceSceneLeafAtOrdinal({
      ...input,
      node: child,
      relativeOrdinal: input.relativeOrdinal - childStart,
    })
  })
  const pendingCopied = branchFromChildren(
    children,
    input.factory,
    input.payloadPolicy,
  )
  deepFreeze(pendingCopied.summary)
  Object.freeze(pendingCopied.children)
  const copied = Object.freeze(pendingCopied)
  input.copiedPathNodes.push(copied)
  return copied
}

export function createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2(
  input: {
    readonly previousScene: VNextTextBlockPersistentSceneV2
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
    readonly sourceItemAuthority: object
    readonly inlineId: string
  },
):
  | {
      readonly status: "prepared"
      readonly scene: VNextTextBlockPersistentSceneV2
      readonly affectedChunkOrdinals: readonly [number]
      readonly copiedPathNodes:
        readonly VNextTextBlockPersistentSceneNodeV2[]
      readonly replacementNodes:
        readonly [VNextTextBlockPersistentSceneLeafV2]
      readonly siblingReferences:
        readonly VNextTextBlockPersistentSceneSiblingReferenceV2[]
      readonly fragmentAuthority: object
      readonly work: VNextTextBlockPersistentSceneV2["work"]
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly scene: null
      readonly affectedChunkOrdinals: null
      readonly copiedPathNodes: null
      readonly replacementNodes: null
      readonly siblingReferences: null
      readonly fragmentAuthority: null
      readonly work: null
      readonly issues: readonly VNextTextBlockPersistentSceneIssueV2[]
    } {
  const previous = preparedScenes.get(input.previousScene)
  const nextSourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      input.nextSourceState,
    )
  if (
    previous == null
    || !registeredScenes.has(input.previousScene)
    || nextSourceInspection.status !== "prepared-unregistered"
    || previous.lineTree !== input.lineTree
    || !hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1(
      previous.sourceState,
      input.nextSourceState,
    )
    || !hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1(
      input.nextSourceState,
      input.lineTree,
    )
  ) {
    return {
      status: "blocked",
      scene: null,
      affectedChunkOrdinals: null,
      copiedPathNodes: null,
      replacementNodes: null,
      siblingReferences: null,
      fragmentAuthority: null,
      work: null,
      issues: [issue(
        "scene-dependency-binding-mismatch",
        "paint scene transition requires one exact previous Scene/source/line tuple",
      )],
    }
  }
  const changedItem =
    resolveVNextTextBlockUnifiedLayoutImagePaintSourceItemAuthorityInternalV1({
      sourceState: input.nextSourceState,
      inlineId: input.inlineId,
      sourceItemAuthority: input.sourceItemAuthority,
    })
  if (
    changedItem == null
  ) {
    return {
      status: "blocked",
      scene: null,
      affectedChunkOrdinals: null,
      copiedPathNodes: null,
      replacementNodes: null,
      siblingReferences: null,
      fragmentAuthority: null,
      work: null,
      issues: [issue(
        "scene-source-lineage-mismatch",
        "paint scene transition source item is not an exact image",
      )],
    }
  }
  const ordinals = previous.chunkOrdinalsByLineage.get(
    changedItem.lineageId,
  )
  if (ordinals?.length !== 1) {
    return {
      status: "blocked",
      scene: null,
      affectedChunkOrdinals: null,
      copiedPathNodes: null,
      replacementNodes: null,
      siblingReferences: null,
      fragmentAuthority: null,
      work: null,
      issues: [issue(
        "scene-invalid-topology",
        "one inline image must map to exactly one renderer chunk",
      )],
    }
  }
  const chunkOrdinal = ordinals[0]!
  const line = lookupVNextTextBlockPersistentLayoutLineInternalV1({
    lineTree: input.lineTree,
    lineOrdinal: chunkOrdinal,
  })
  if (line.status !== "found") {
    return {
      status: "blocked",
      scene: null,
      affectedChunkOrdinals: null,
      copiedPathNodes: null,
      replacementNodes: null,
      siblingReferences: null,
      fragmentAuthority: null,
      work: null,
      issues: [issue(
        "scene-invalid-topology",
        "paint scene transition could not resolve one exact line leaf",
      )],
    }
  }
  try {
    const previousChunk =
      lookupVNextTextBlockPersistentSceneChunkInternalV2({
        scene: input.previousScene,
        chunkOrdinal,
      })
    if (previousChunk.status !== "found") {
      throw new Error("paint chunk escaped exact previous Scene")
    }
    const chunk = imagePaintChunkFromPrevious({
      previousChunk: previousChunk.leaf.chunk,
      changedItem,
      factory: previous.fingerprintFactory,
    })
    if (chunk == null) {
      throw new Error("paint chunk projection failed")
    }
    const pendingReplacement = leafFromChunk(
      line.leaf,
      chunk,
      previous.fingerprintFactory,
      input.previousScene.payloadPolicy,
    )
    Object.freeze(pendingReplacement.summary)
    const replacement = Object.freeze(pendingReplacement)
    const copiedPathNodes: VNextTextBlockPersistentSceneNodeV2[] = []
    const siblingReferences:
      VNextTextBlockPersistentSceneSiblingReferenceV2[] = []
    if (input.previousScene.root.nodeKind === "empty") {
      throw new Error("non-empty image source cannot have an empty scene")
    }
    const root = replaceSceneLeafAtOrdinal({
      node: input.previousScene.root,
      relativeOrdinal: chunkOrdinal,
      replacement,
      factory: previous.fingerprintFactory,
      payloadPolicy: input.previousScene.payloadPolicy,
      copiedPathNodes,
      siblingReferences,
    })
    const headerByteCount = utf8ByteCount({
      payloadPolicyVersion: 1,
      source: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_V2_VERSION,
    })
    const summary: VNextTextBlockPersistentSceneSummaryV2 = root.summary
    const work = Object.freeze({
      completeSceneProjectionCount: 0 as const,
      visitedLineCount: 1,
      visitedFragmentCount: chunk.fragments.length,
      visitedSourceItemCount: 1,
      emittedChunkCount: 1,
      createdLeafCount: 1,
      createdNodeCount: copiedPathNodes.length + 1,
      reusedChunkCount: input.previousScene.summary.chunkCount - 1,
      reusedSceneNodeCount: siblingReferences.length,
      incrementalCopiedNodeCount: copiedPathNodes.length,
      completeLineTreeTraversalCount: 0 as const,
      completeSceneTraversalCount: 0 as const,
    })
    const facts = {
      source: input.previousScene.source,
      contractVersion: input.previousScene.contractVersion,
      documentId: input.previousScene.documentId,
      sectionId: input.previousScene.sectionId,
      textBlockId: input.previousScene.textBlockId,
      instanceRevision: input.previousScene.instanceRevision,
      layoutId: input.previousScene.layoutId,
      lineTreeFingerprint: input.lineTree.fingerprint,
      lineTreeSemanticFingerprint: input.lineTree.semanticFingerprint,
      sourceStateSourceFingerprint:
        input.nextSourceState.summary.sourceFingerprint,
      sourceStateProvenanceFingerprint:
        input.nextSourceState.summary.provenanceFingerprint,
      sourceStatePaintFingerprint:
        input.nextSourceState.summary.paintFingerprint,
      policy: input.previousScene.policy,
      payloadPolicy: input.previousScene.payloadPolicy,
      root,
      summary,
      work,
      contracts: input.previousScene.contracts,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const canonicalFacts = stringifyVNextCanonicalJson(sceneSemanticFacts(
      facts as VNextTextBlockPersistentSceneV2,
    ))
    const sceneFingerprint = previous.fingerprintFactory(canonicalFacts)
    const scene = Object.freeze({
      ...facts,
      payloadObservation: payloadObservation(
        sceneFingerprint,
        safeAdd(
          headerByteCount,
          root.payloadObservation.estimatedCanonicalPayloadByteCount,
        ),
        input.previousScene.payloadPolicy.fingerprint,
        [root.payloadObservation.payloadObservationFingerprint],
      ),
      fingerprint: sceneFingerprint,
    })
    const exactCopiedPathNodes = Object.freeze([...copiedPathNodes])
    const exactReplacementNodes = Object.freeze([replacement]) as
      readonly [VNextTextBlockPersistentSceneLeafV2]
    const exactSiblingReferences = Object.freeze(
      siblingReferences.map((reference) => Object.freeze(reference)),
    )
    const fragmentAuthority = Object.freeze({})
    incrementalFragmentAuthorities.set(fragmentAuthority, {
      scene,
      copiedPathNodes: exactCopiedPathNodes,
      replacementNodes: exactReplacementNodes,
      siblingReferences: exactSiblingReferences,
    })
    preparedScenes.set(scene, {
      fingerprint: scene.fingerprint,
      canonicalFacts,
      fingerprintFactory: previous.fingerprintFactory,
      lineTree: input.lineTree,
      sourceState: input.nextSourceState,
      chunkOrdinalsByLineage: previous.chunkOrdinalsByLineage,
    })
    const inspection =
      inspectVNextTextBlockPersistentSceneShallowAuthorityInternalV2(scene)
    if (inspection.status !== "valid-candidate") {
      preparedScenes.delete(scene)
      throw new Error(inspection.message)
    }
    return Object.freeze({
      status: "prepared",
      scene,
      affectedChunkOrdinals: Object.freeze([chunkOrdinal]) as
        readonly [number],
      copiedPathNodes: exactCopiedPathNodes,
      replacementNodes: exactReplacementNodes,
      siblingReferences: exactSiblingReferences,
      fragmentAuthority,
      work,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return {
      status: "blocked",
      scene: null,
      affectedChunkOrdinals: null,
      copiedPathNodes: null,
      replacementNodes: null,
      siblingReferences: null,
      fragmentAuthority: null,
      work: null,
      issues: [issue(
        "scene-unsafe-summary",
        "paint scene transition exceeded bounded path-copy invariants",
      )],
    }
  }
}

export function verifyVNextTextBlockPersistentSceneCandidateInternalV2(
  value: unknown,
): VNextTextBlockPersistentSceneCandidateInspectionV2 {
  hotPathObserverForTest?.({
    kind: "full-candidate-inspection",
    probeCount: 1,
  })
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
  if (!frozenSceneShell(value)) {
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
    hotPathObserverForTest?.({
      kind: "full-canonical-rehash",
      probeCount: 1,
    })
    const canonicalFacts = stringifyVNextCanonicalJson(
      sceneSemanticFacts(scene),
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
      payloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
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

export function inspectVNextTextBlockPersistentSceneShallowAuthorityInternalV2(
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
  const scene = value as VNextTextBlockPersistentSceneV2
  const record = preparedScenes.get(scene)!
  if (
    !frozenSceneShell(scene)
    || scene.fingerprint !== record.fingerprint
    || scene.lineTreeFingerprint !== record.lineTree.fingerprint
    || scene.lineTreeSemanticFingerprint
      !== record.lineTree.semanticFingerprint
  ) {
    return {
      status: "invalid",
      code: "scene-candidate-authority-mismatch",
      message: "prepared scene no longer matches exact shallow authority",
    }
  }
  return {
    status: "valid-candidate",
    fingerprint: record.fingerprint,
    payloadObservationFingerprint:
      scene.payloadObservation.payloadObservationFingerprint,
    registeredAuthority: false,
  }
}

export function hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
  value: unknown,
): value is VNextTextBlockPersistentSceneV2 {
  return value != null
    && typeof value === "object"
    && preparedScenes.has(value as VNextTextBlockPersistentSceneV2)
}

export function hasVNextTextBlockPersistentScenePreparedDependenciesInternalV2(
  input: {
    readonly lineTree: unknown
    readonly sourceState: unknown
    readonly scene: unknown
  },
): input is {
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly scene: VNextTextBlockPersistentSceneV2
} {
  if (input.scene == null || typeof input.scene !== "object") return false
  const prepared = preparedScenes.get(
    input.scene as VNextTextBlockPersistentSceneV2,
  )
  return prepared != null
    && prepared.lineTree === input.lineTree
    && prepared.sourceState === input.sourceState
}

export function registerPreparedVNextTextBlockPersistentSceneRootGraphChildInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly scene: VNextTextBlockPersistentSceneV2
  },
): boolean {
  if (input.phase === "preflight") {
    return !registeredScenes.has(input.scene)
      && inspectVNextTextBlockPersistentSceneShallowAuthorityInternalV2(
        input.scene,
      ).status === "valid-candidate"
      && authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
        token: input.token,
        phase: input.phase,
        childKind: "persistent-scene",
        child: input.scene,
      })
  }
  if (
    !authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
      token: input.token,
      phase: input.phase,
      childKind: "persistent-scene",
      child: input.scene,
    })
  ) return false
  const prepared = preparedScenes.get(input.scene)
  if (prepared == null) return false
  registeredScenes.set(input.scene, {
    fingerprint: input.scene.fingerprint,
    canonicalFacts: prepared.canonicalFacts,
  })
  return true
}

export function hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
  value: unknown,
): value is VNextTextBlockPersistentSceneV2 {
  return value != null
    && typeof value === "object"
    && registeredScenes.has(value as VNextTextBlockPersistentSceneV2)
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
  if (!frozenSceneShell(value)) {
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
      sceneSemanticFacts(scene),
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
    return {
      status: "valid",
      fingerprint: scene.fingerprint,
      payloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
    }
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

export function inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2(
  input: unknown,
): VNextTextBlockPersistentSceneIncrementalFragmentInspectionV2 {
  const record = exactRecord(input, [
    "scene",
    "fragmentAuthority",
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
  const authority = record.fragmentAuthority == null
    || typeof record.fragmentAuthority !== "object"
    ? null
    : incrementalFragmentAuthorities.get(record.fragmentAuthority)
  if (
    authority == null
    || record.scene == null
    || typeof record.scene !== "object"
    || authority.scene !== record.scene
    || !preparedScenes.has(authority.scene)
  ) {
    return {
      status: "invalid",
      code: "scene-incremental-fragment-invalid",
      message: "incremental scene fragment or candidate is invalid",
    }
  }
  return {
    status: "valid-fragment",
    work: {
      inspectedCopiedPathNodeCount: authority.copiedPathNodes.length,
      inspectedReplacementNodeCount: authority.replacementNodes.length,
      inspectedSiblingReferenceCount: authority.siblingReferences.length,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    },
  }
}
