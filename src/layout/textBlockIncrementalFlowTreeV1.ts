import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  convertVNextPositiveUnitValueToLayoutUnitV1,
  scaleVNextFontMetricToLayoutUnitV1,
} from "./layoutUnitPolicyV1.js"
import {
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type {
  VNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceContractV2.js"
import {
  VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1,
} from "./textBlockInlineImageLineBoxV1.js"
import {
  VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_VERSION,
  type VNextTextBlockIncrementalFlowAtomV1,
  type VNextTextBlockIncrementalFlowBranchV1,
  type VNextTextBlockIncrementalFlowLeafV1,
  type VNextTextBlockIncrementalFlowLookupResultV1,
  type VNextTextBlockIncrementalFlowNodeV1,
  type VNextTextBlockIncrementalFlowSummaryV1,
  type VNextTextBlockIncrementalFlowTreeBuildResultV1,
  type VNextTextBlockIncrementalFlowTreeInspectionV1,
  type VNextTextBlockIncrementalFlowTreeIssueCodeV1,
  type VNextTextBlockIncrementalFlowTreePolicyV1,
  type VNextTextBlockIncrementalFlowTreeV1,
} from "./textBlockIncrementalFlowTreeContractV1.js"
import {
  authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1,
  hasVNextTextBlockUnifiedLayoutSourceStatePreparedBindingInternalV1,
  inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1,
  hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import type {
  VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type { VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"

type FingerprintFactory = (canonicalFacts: string) => string

const FORCED_COLLISION_FINGERPRINT =
  `sha256:${"0".repeat(64)}` as const

const policyFacts = {
  policyVersion: 1 as const,
  maximumLeafItems: 8 as const,
  maximumBranchChildren: 8 as const,
  splitOverflowLeftCount: 4 as const,
  splitOverflowRightCount: 5 as const,
  underflowBorrowOrder: ["left", "right"] as const,
  underflowMergeOrder: ["left", "right"] as const,
}

export const VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_POLICY_V1:
VNextTextBlockIncrementalFlowTreePolicyV1 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(policyFacts),
  ),
})

const preparedTrees = new WeakMap<
VNextTextBlockIncrementalFlowTreeV1,
{
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly fingerprintFactory: FingerprintFactory
}
>()
const treesBySourceState = new WeakMap<
VNextTextBlockUnifiedLayoutSourceStateV1,
WeakSet<VNextTextBlockIncrementalFlowTreeV1>
>()
const treesByEvidence = new WeakMap<
VNextTextBlockFlowEvidenceV2,
WeakSet<VNextTextBlockIncrementalFlowTreeV1>
>()
const registeredRootGraphTrees = new WeakSet<
VNextTextBlockIncrementalFlowTreeV1
>()

export interface VNextTextBlockFlowBindingAuthorityInternalV1 {
  readonly __flowBindingAuthorityOpaque: never
}

const flowBindingAuthorities = new WeakMap<object, {
  readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}>()

const replacementAtomAuthorities = new WeakMap<
  readonly VNextTextBlockIncrementalFlowAtomV1[],
  {
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly targetRange: VNextTextBlockSourceRangeV1
    readonly renderedUtf16Length: number
  }
>()

let flowPathCopyOperationObserverForTest:
  | ((event: {
      readonly operation: "visit-atom" | "visit-node" | "create-node"
      readonly value: object | null
    }) => void)
  | null = null

let flowTreeInspectionObserverForTest: (() => void) | null = null
let flowRecursiveFreezeObserverForTest: ((value: object) => void) | null = null
let flowProjectionPayloadObserverForTest: (() => void) | null = null

export function setVNextTextBlockFlowPathCopyOperationObserverForTestInternalV1(
  observer: typeof flowPathCopyOperationObserverForTest,
): void {
  flowPathCopyOperationObserverForTest = observer
}

export function setVNextTextBlockFlowTreeInspectionObserverForTestInternalV1(
  observer: (() => void) | null,
): void {
  flowTreeInspectionObserverForTest = observer
}

export function setVNextTextBlockFlowRecursiveFreezeObserverForTestInternalV1(
  observer: ((value: object) => void) | null,
): void {
  flowRecursiveFreezeObserverForTest = observer
}

export function setVNextTextBlockFlowProjectionPayloadObserverForTestInternalV1(
  observer: (() => void) | null,
): void {
  flowProjectionPayloadObserverForTest = observer
}

export type VNextTextBlockIncrementalFlowRangePathCopyResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
      readonly visitedFlowAtomCount: number
      readonly visitedFlowTreeNodeCount: number
      readonly reusedFlowTreeNodeCount: number
      readonly createdFlowTreeNodeCount: number
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly flowTree: null
      readonly visitedFlowAtomCount: number
      readonly visitedFlowTreeNodeCount: number
      readonly createdFlowTreeNodeCount: number
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export interface VNextTextBlockTransitionFlowCoverageFragmentInternalV1 {
  readonly atom: VNextTextBlockIncrementalFlowAtomV1
  readonly atomAbsoluteStartRenderedUtf16: number
  readonly atomAbsoluteEndRenderedUtf16: number
}

export type VNextTextBlockTransitionFlowCoverageResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly fragments: readonly VNextTextBlockTransitionFlowCoverageFragmentInternalV1[]
      readonly visitedNodeCount: number
      readonly emittedAtomCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly fragments: null
      readonly visitedNodeCount: number
      readonly emittedAtomCount: number
      readonly completeTreeTraversalCount: 0
    }

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
  flowRecursiveFreezeObserverForTest?.(value as object)
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

function exactInput(value: unknown): {
  readonly sourceState: unknown
  readonly evidence: unknown
} | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const keys = Reflect.ownKeys(value)
    if (
      keys.length !== 2
      || !keys.includes("sourceState")
      || !keys.includes("evidence")
    ) return null
    const sourceState = Object.getOwnPropertyDescriptor(value, "sourceState")
    const evidence = Object.getOwnPropertyDescriptor(value, "evidence")
    if (
      sourceState == null
      || evidence == null
      || !Object.hasOwn(sourceState, "value")
      || !Object.hasOwn(evidence, "value")
      || sourceState.enumerable !== true
      || evidence.enumerable !== true
    ) return null
    return {
      sourceState: sourceState.value,
      evidence: evidence.value,
    }
  } catch {
    return null
  }
}

function blocked(
  code: VNextTextBlockIncrementalFlowTreeIssueCodeV1,
  message: string,
): VNextTextBlockIncrementalFlowTreeBuildResultV1 {
  return Object.freeze({
    status: "blocked",
    flowTree: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([{ code, message }]),
  })
}

function safeAdd(left: number, right: number): number {
  const value = left + right
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("incremental flow summary exceeded safe arithmetic")
  }
  return value
}

function canonicalGroups<T>(
  values: readonly T[],
  maximumValues: number,
): readonly (readonly T[])[] {
  if (maximumValues !== 8) {
    throw new RangeError("incremental flow packing requires the locked eight-way policy")
  }
  const groups: T[][] = []
  let cursor = 0
  while (cursor < values.length) {
    const remaining = values.length - cursor
    if (remaining <= maximumValues) {
      groups.push(values.slice(cursor))
      break
    }
    if (remaining === maximumValues + 1) {
      groups.push(values.slice(cursor, cursor + 4))
      groups.push(values.slice(cursor + 4))
      break
    }
    groups.push(values.slice(cursor, cursor + maximumValues))
    cursor += maximumValues
  }
  return groups
}

function collectSourceItems(
  root: VNextTextBlockUnifiedLayoutSourceNodeV1,
): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] {
  const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  const visit = (node: VNextTextBlockUnifiedLayoutSourceNodeV1): void => {
    if (node.nodeKind === "leaf") {
      items.push(...node.items)
      return
    }
    node.children.forEach(visit)
  }
  visit(root)
  return items
}

interface TextFlowSourceFacts {
  readonly kind:
    | "text"
    | "resolved-field"
    | "generated-page-number"
    | "composite"
  readonly lineageId: string
  readonly inlineId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly boundaryFingerprint: string
}

interface TextFlowSourceSpan {
  readonly source: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>
  readonly absoluteStart: number
  readonly absoluteEnd: number
}

function textFlowSourceFacts(input: {
  readonly spans: readonly TextFlowSourceSpan[]
  readonly clusterStart: number
  readonly clusterEnd: number
  readonly factory: FingerprintFactory
}): {
  readonly source: TextFlowSourceFacts
  readonly sourceAbsoluteStart: number
} | null {
  const selected = input.spans
  if (selected.length === 0) return null
  let cursor = input.clusterStart
  const segments = selected.map((span) => {
    const start = Math.max(span.absoluteStart, input.clusterStart)
    const end = Math.min(span.absoluteEnd, input.clusterEnd)
    if (start !== cursor || end <= start) return null
    cursor = end
    return {
      kind: span.source.kind,
      lineageId: span.source.lineageId,
      inlineId: span.source.inlineId,
      sourceFingerprint: span.source.sourceFingerprint,
      provenanceFingerprint: span.source.provenanceFingerprint,
      boundaryFingerprint: span.source.boundaryFingerprint,
      localStartRenderedUtf16: start - span.absoluteStart,
      localEndRenderedUtf16: end - span.absoluteStart,
    }
  })
  if (cursor !== input.clusterEnd || segments.some((segment) => segment == null)) {
    return null
  }
  if (selected.length === 1) {
    return {
      source: selected[0]!.source,
      sourceAbsoluteStart: selected[0]!.absoluteStart,
    }
  }
  const exactSegments = segments as readonly Exclude<
    (typeof segments)[number],
    null
  >[]
  const compositeFingerprint = fingerprintWith(input.factory, {
    contractVersion: 1,
    kind: "composite-text-cluster-source",
    segments: exactSegments,
  })
  const commonKind = selected.every(
    (span) => span.source.kind === selected[0]!.source.kind,
  )
    ? selected[0]!.source.kind
    : "composite" as const
  const commonInlineId = selected.every(
    (span) => span.source.inlineId === selected[0]!.source.inlineId,
  )
    ? selected[0]!.source.inlineId
    : `composite-inline:${compositeFingerprint}`
  return {
    source: {
      kind: commonKind,
      lineageId: `composite-cluster:${compositeFingerprint}`,
      inlineId: commonInlineId,
      sourceFingerprint: fingerprintWith(input.factory, {
        kind: "composite-cluster-source",
        segments: exactSegments.map((segment) => segment.sourceFingerprint),
      }),
      provenanceFingerprint: fingerprintWith(input.factory, {
        kind: "composite-cluster-provenance",
        segments: exactSegments.map((segment) => segment.provenanceFingerprint),
      }),
      boundaryFingerprint: fingerprintWith(input.factory, {
        kind: "composite-cluster-boundary",
        segments: exactSegments.map((segment) => segment.boundaryFingerprint),
      }),
    },
    sourceAbsoluteStart: input.clusterStart,
  }
}

function textAtom(input: {
  readonly source: TextFlowSourceFacts
  readonly sourceAbsoluteStart: number
  readonly shapingRun: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]
  readonly cluster: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]["clusters"][number]
  readonly face: VNextTextBlockFlowEvidenceV2["fontFaces"][number]
  readonly advanceLayoutUnit: number
  readonly segmentStart: number
  readonly segmentEnd: number
  readonly factory: FingerprintFactory
}): VNextTextBlockIncrementalFlowAtomV1 | null {
  const ascent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: input.face.ascentFontUnit,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    unitsPerEm: input.face.unitsPerEm,
  })
  const descent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: input.face.descentFontUnit,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    unitsPerEm: input.face.unitsPerEm,
  })
  const lineGap = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: input.face.lineGapFontUnit,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    unitsPerEm: input.face.unitsPerEm,
  })
  if (
    ascent.status !== "accepted"
    || descent.status !== "accepted"
    || lineGap.status !== "accepted"
  ) return null
  const localStartRenderedUtf16 =
    input.segmentStart - input.sourceAbsoluteStart
  const localEndRenderedUtf16 =
    input.segmentEnd - input.sourceAbsoluteStart
  const renderedText = input.shapingRun.text.slice(
    input.segmentStart - input.shapingRun.renderStartOffset,
    input.segmentEnd - input.shapingRun.renderStartOffset,
  )
  const lineInternalsDependencyFingerprint = fingerprintWith(input.factory, {
    kind: "text-cluster",
    renderedText,
    fontFaceId: input.shapingRun.fontFaceId,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    advanceLayoutUnit: input.advanceLayoutUnit,
    ascentLayoutUnit: ascent.layoutUnit,
    descentLayoutUnit: descent.layoutUnit === 0 ? 0 : -descent.layoutUnit,
    lineGapLayoutUnit: lineGap.layoutUnit,
    baselineShiftLayoutUnit: input.shapingRun.baselineShiftLayoutUnit,
    features: input.shapingRun.features,
  })
  const facts = {
    lineageId:
      `${input.source.lineageId}:cluster:${localStartRenderedUtf16}:${localEndRenderedUtf16}`,
    inlineId: input.source.inlineId,
    kind: "text-cluster" as const,
    sourceKind: input.source.kind,
    renderedText,
    renderedUtf16Length: renderedText.length,
    localStartRenderedUtf16,
    localEndRenderedUtf16,
    fontFaceId: input.shapingRun.fontFaceId,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    advanceLayoutUnit: input.advanceLayoutUnit,
    ascentLayoutUnit: ascent.layoutUnit,
    descentLayoutUnit: descent.layoutUnit === 0 ? 0 : -descent.layoutUnit,
    lineGapLayoutUnit: lineGap.layoutUnit,
    baselineShiftLayoutUnit: input.shapingRun.baselineShiftLayoutUnit,
    features: [...input.shapingRun.features],
    sourceFingerprint: input.source.sourceFingerprint,
    provenanceFingerprint: input.source.provenanceFingerprint,
    lineInternalsDependencyFingerprint,
    boundaryFingerprint: input.source.boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(input.factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function hardBreakAtom(
  source: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, {
    kind: "hard-break"
  }>,
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowAtomV1 {
  const lineInternalsDependencyFingerprint = fingerprintWith(factory, {
    kind: "hard-break",
    renderedText: source.renderedText,
  })
  const facts = {
    lineageId: source.lineageId,
    inlineId: source.inlineId,
    kind: "hard-break" as const,
    renderedText: source.renderedText,
    renderedUtf16Length: source.renderedUtf16Length,
    sourceFingerprint: source.sourceFingerprint,
    provenanceFingerprint: source.provenanceFingerprint,
    lineInternalsDependencyFingerprint,
    boundaryFingerprint: source.boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function imageAtom(
  source: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, {
    kind: "inline-image"
  }>,
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowAtomV1 | null {
  const width = convertVNextPositiveUnitValueToLayoutUnitV1(
    source.authoredFrame.width,
    "sourceState.inlineImage.width",
  )
  const height = convertVNextPositiveUnitValueToLayoutUnitV1(
    source.authoredFrame.height,
    "sourceState.inlineImage.height",
  )
  if (width.status !== "accepted" || height.status !== "accepted") return null
  const lineInternalsDependencyFingerprint = fingerprintWith(factory, {
    kind: "inline-image",
    widthLayoutUnit: width.layoutUnit,
    heightLayoutUnit: height.layoutUnit,
    verticalAlign: source.verticalAlign,
    alignmentPolicyFingerprint:
      VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
  })
  const facts = {
    lineageId: source.lineageId,
    inlineId: source.inlineId,
    kind: "inline-image" as const,
    renderedText: "\uFFFC" as const,
    renderedUtf16Length: 1,
    assetId: source.assetId,
    widthLayoutUnit: width.layoutUnit,
    heightLayoutUnit: height.layoutUnit,
    verticalAlign: source.verticalAlign,
    alignmentPolicyFingerprint:
      VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
    sourceFingerprint: source.sourceFingerprint,
    provenanceFingerprint: source.provenanceFingerprint,
    lineInternalsDependencyFingerprint,
    boundaryFingerprint: source.boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function atomsFromSourceAndEvidence(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly evidence: VNextTextBlockFlowEvidenceV2
  readonly factory: FingerprintFactory
}): {
  readonly atoms: readonly VNextTextBlockIncrementalFlowAtomV1[]
  readonly sourceItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly visitedEvidenceClusterCount: number
} | null {
  const sourceItems = collectSourceItems(input.sourceState.root)
  const faces = new Map(
    input.evidence.fontFaces.map((face) => [face.fontFaceId, face]),
  )
  const atoms: VNextTextBlockIncrementalFlowAtomV1[] = []
  const sourceSpans: Array<{
    readonly source: VNextTextBlockUnifiedLayoutSourceItemV1
    readonly absoluteStart: number
    readonly absoluteEnd: number
  }> = []
  let absoluteStart = 0
  for (const source of sourceItems) {
    const absoluteEnd = safeAdd(absoluteStart, source.renderedUtf16Length)
    sourceSpans.push({ source, absoluteStart, absoluteEnd })
    absoluteStart = absoluteEnd
  }
  if (absoluteStart !== input.sourceState.summary.renderedUtf16Length) {
    return null
  }
  const textSpans = sourceSpans.filter((span): span is TextFlowSourceSpan => (
    span.source.kind === "text"
    || span.source.kind === "resolved-field"
    || span.source.kind === "generated-page-number"
  ))
  let visitedEvidenceClusterCount = 0
  let cursor = 0
  while (cursor < absoluteStart) {
    const sourceSpan = sourceSpans.find((span) => (
      span.absoluteStart <= cursor && span.absoluteEnd > cursor
    ))
    if (sourceSpan == null) return null
    const source = sourceSpan.source
    if (source.kind === "hard-break") {
      if (cursor !== sourceSpan.absoluteStart) return null
      atoms.push(hardBreakAtom(source, input.factory))
      cursor = sourceSpan.absoluteEnd
      continue
    }
    if (source.kind === "inline-image") {
      if (cursor !== sourceSpan.absoluteStart) return null
      const atom = imageAtom(source, input.factory)
      if (atom == null) return null
      atoms.push(atom)
      cursor = sourceSpan.absoluteEnd
      continue
    }
    let selectedRun: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]
      | null = null
    let selectedCluster: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]["clusters"][number]
      | null = null
    for (const shapingRun of input.evidence.shapingRuns) {
      const cluster = shapingRun.clusters.find(
        (candidate) => candidate.renderStartOffset === cursor,
      )
      if (cluster != null) {
        selectedRun = shapingRun
        selectedCluster = cluster
        break
      }
    }
    if (selectedRun == null || selectedCluster == null) return null
    const face = faces.get(selectedRun.fontFaceId)
    const sourceFacts = textFlowSourceFacts({
      spans: textSpans.filter((span) => (
        span.absoluteStart < selectedCluster.renderEndOffset
        && span.absoluteEnd > selectedCluster.renderStartOffset
      )),
      clusterStart: selectedCluster.renderStartOffset,
      clusterEnd: selectedCluster.renderEndOffset,
      factory: input.factory,
    })
    if (face == null || sourceFacts == null) return null
    const atom = textAtom({
      source: sourceFacts.source,
      sourceAbsoluteStart: sourceFacts.sourceAbsoluteStart,
      shapingRun: selectedRun,
      cluster: selectedCluster,
      face,
      advanceLayoutUnit: selectedCluster.advanceLayoutUnit,
      segmentStart: selectedCluster.renderStartOffset,
      segmentEnd: selectedCluster.renderEndOffset,
      factory: input.factory,
    })
    if (atom == null) return null
    atoms.push(atom)
    visitedEvidenceClusterCount += 1
    cursor = selectedCluster.renderEndOffset
  }
  return { atoms, sourceItems, visitedEvidenceClusterCount }
}

function summaryFromAtoms(
  atoms: readonly VNextTextBlockIncrementalFlowAtomV1[],
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowSummaryV1 {
  let renderedUtf16Length = 0
  let textClusterCount = 0
  let hardBreakCount = 0
  let inlineImageCount = 0
  for (const atom of atoms) {
    renderedUtf16Length = safeAdd(
      renderedUtf16Length,
      atom.renderedUtf16Length,
    )
    if (atom.kind === "text-cluster") textClusterCount += 1
    else if (atom.kind === "hard-break") hardBreakCount += 1
    else inlineImageCount += 1
  }
  return {
    renderedUtf16Length,
    atomCount: atoms.length,
    leafCount: 1,
    nodeCount: 1,
    textClusterCount,
    hardBreakCount,
    inlineImageCount,
    lineInternalsDependencyFingerprint: fingerprintWith(factory, {
      atoms: atoms.map(
        (atom) => atom.lineInternalsDependencyFingerprint,
      ),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      atoms: atoms.map((atom) => atom.boundaryFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      atoms: atoms.map((atom) => atom.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      atoms: atoms.map((atom) => atom.provenanceFingerprint),
    }),
  }
}

function summaryFromChildren(
  children: readonly VNextTextBlockIncrementalFlowNodeV1[],
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowSummaryV1 {
  const counts = {
    renderedUtf16Length: 0,
    atomCount: 0,
    leafCount: 0,
    nodeCount: 1,
    textClusterCount: 0,
    hardBreakCount: 0,
    inlineImageCount: 0,
  }
  for (const child of children) {
    counts.renderedUtf16Length = safeAdd(
      counts.renderedUtf16Length,
      child.summary.renderedUtf16Length,
    )
    counts.atomCount = safeAdd(counts.atomCount, child.summary.atomCount)
    counts.leafCount = safeAdd(counts.leafCount, child.summary.leafCount)
    counts.nodeCount = safeAdd(counts.nodeCount, child.summary.nodeCount)
    counts.textClusterCount = safeAdd(
      counts.textClusterCount,
      child.summary.textClusterCount,
    )
    counts.hardBreakCount = safeAdd(
      counts.hardBreakCount,
      child.summary.hardBreakCount,
    )
    counts.inlineImageCount = safeAdd(
      counts.inlineImageCount,
      child.summary.inlineImageCount,
    )
  }
  return {
    ...counts,
    lineInternalsDependencyFingerprint: fingerprintWith(factory, {
      children: children.map(
        (child) => child.summary.lineInternalsDependencyFingerprint,
      ),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.boundaryFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.provenanceFingerprint),
    }),
  }
}

function leaf(
  atoms: readonly VNextTextBlockIncrementalFlowAtomV1[],
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowLeafV1 {
  if (atoms.length < 1 || atoms.length > 8) {
    throw new RangeError("incremental flow leaf requires one to eight atoms")
  }
  const summary = summaryFromAtoms(atoms, factory)
  return {
    nodeKind: "leaf",
    height: 0,
    atoms: [...atoms],
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      nodeKind: "leaf",
      atomFingerprints: atoms.map((atom) => atom.fingerprint),
      summary,
    }),
  }
}

function branch(
  children: readonly VNextTextBlockIncrementalFlowNodeV1[],
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowBranchV1 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]?.height)
  ) {
    throw new RangeError("incremental flow branch requires two to eight equal-height children")
  }
  const summary = summaryFromChildren(children, factory)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children: [...children],
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      nodeKind: "branch",
      childFingerprints: children.map((child) => child.fingerprint),
      summary,
    }),
  }
}

function buildRoot(
  atoms: readonly VNextTextBlockIncrementalFlowAtomV1[],
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowNodeV1 {
  let level: readonly VNextTextBlockIncrementalFlowNodeV1[] =
    canonicalGroups(atoms, 8).map((group) => leaf(group, factory))
  if (level.length === 0) {
    throw new RangeError("incremental flow tree requires at least one atom")
  }
  while (level.length > 1) {
    level = canonicalGroups(level, 8).map((group) => branch(group, factory))
  }
  return level[0]!
}

function treeCanonicalFacts(
  tree: VNextTextBlockIncrementalFlowTreeV1,
): unknown {
  return {
    source: tree.source,
    contractVersion: tree.contractVersion,
    documentId: tree.documentId,
    sectionId: tree.sectionId,
    textBlockId: tree.textBlockId,
    instanceRevision: tree.instanceRevision,
    layoutId: tree.layoutId,
    layoutContextFingerprint: tree.layoutContextFingerprint,
    sourceStateLayoutDependencyFingerprint:
      tree.sourceStateLayoutDependencyFingerprint,
    producerRuntimeRequirementFingerprint:
      tree.producerRuntimeRequirementFingerprint,
    policyFingerprint: tree.policy.fingerprint,
    rootFingerprint: tree.root.fingerprint,
    summary: tree.summary,
    work: tree.work,
    contracts: tree.contracts,
    mayPublishLayout: tree.mayPublishLayout,
    productionBinding: tree.productionBinding,
  }
}

function buildComplete(
  input: unknown,
  factory: FingerprintFactory,
): VNextTextBlockIncrementalFlowTreeBuildResultV1 {
  const envelope = exactInput(input)
  if (envelope == null) {
    return blocked(
      "invalid-input",
      "incremental flow construction requires an exact accessor-free two-field envelope",
    )
  }
  const sourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      envelope.sourceState,
    )
  if (sourceInspection.status !== "prepared-unregistered") {
    return blocked("source-state-authority-mismatch", sourceInspection.message)
  }
  const evidenceInspection = inspectVNextTextBlockFlowEvidenceV2(
    envelope.evidence,
  )
  if (evidenceInspection.status !== "valid") {
    return blocked("flow-evidence-authority-mismatch", evidenceInspection.message)
  }
  if (!hasVNextTextBlockUnifiedLayoutSourceStatePreparedBindingInternalV1(
    envelope.sourceState,
    envelope.evidence,
  )) {
    return blocked(
      "source-evidence-binding-mismatch",
      "incremental flow requires the exact evidence used to prepare this source state",
    )
  }

  const sourceState =
    envelope.sourceState as VNextTextBlockUnifiedLayoutSourceStateV1
  const evidence = envelope.evidence as VNextTextBlockFlowEvidenceV2
  try {
    const projected = atomsFromSourceAndEvidence({
      sourceState,
      evidence,
      factory,
    })
    if (projected == null || projected.atoms.length === 0) {
      return blocked(
        "invalid-source-topology",
        "source items and evidence must form one complete safe layout-only atom stream",
      )
    }
    const root = buildRoot(projected.atoms, factory)
    const layoutContextFingerprint = fingerprintWith(factory, {
      layoutId: sourceState.producerRequirements.layoutId,
      layoutUnitPolicyFingerprint:
        sourceState.producerRequirements.layoutUnitPolicyFingerprint,
      availableWidthLayoutUnit:
        sourceState.producerRequirements.availableWidthLayoutUnit,
      declaredLineHeightLayoutUnit:
        sourceState.producerRequirements.declaredLineHeightLayoutUnit,
      paragraphFontFamilyKey:
        sourceState.producerRequirements.paragraphFontFamilyKey,
      paragraphStyle: sourceState.producerRequirements.paragraphStyle,
      fontFaces: sourceState.producerRequirements.fontFaces,
    })
    const work = {
      completeBuildCount: 1 as const,
      visitedSourceItemCount: projected.sourceItems.length,
      visitedEvidenceShapingRunCount: evidence.shapingRuns.length,
      visitedEvidenceClusterCount: projected.visitedEvidenceClusterCount,
      createdAtomCount: projected.atoms.length,
      createdLeafCount: root.summary.leafCount,
      createdNodeCount: root.summary.nodeCount,
      reusedAtomCount: 0 as const,
      reusedNodeCount: 0 as const,
      completeTreeRebuildCount: 1 as const,
      completeSuffixTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_V1_VERSION,
      documentId: sourceState.documentId,
      sectionId: sourceState.sectionId,
      textBlockId: sourceState.textBlockId,
      instanceRevision: sourceState.instanceRevision,
      layoutId: sourceState.producerRequirements.layoutId,
      layoutContextFingerprint,
      sourceStateLayoutDependencyFingerprint:
        sourceState.summary.layoutDependencyFingerprint,
      producerRuntimeRequirementFingerprint:
        sourceState.producerRequirements.producerRuntimeRequirementFingerprint,
      policy: VNEXT_TEXT_BLOCK_INCREMENTAL_FLOW_TREE_POLICY_V1,
      root,
      summary: root.summary,
      work,
      contracts: {
        layoutAffectingAtomsOnly: true as const,
        paintFactsExcluded: true as const,
        offsetIndependentAtoms: true as const,
        summaryGuidedRenderedOffsetLookup: true as const,
        canonicalLocalPacking: true as const,
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
    const canonicalFacts = stringifyVNextCanonicalJson(
      treeCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      }),
    )
    const flowTree = Object.freeze({
      ...withoutFingerprint,
      fingerprint: factory(canonicalFacts),
    })
    preparedTrees.set(flowTree, {
      fingerprint: flowTree.fingerprint,
      canonicalFacts,
      fingerprintFactory: factory,
    })
    const sourceTrees = treesBySourceState.get(sourceState) ?? new WeakSet()
    sourceTrees.add(flowTree)
    treesBySourceState.set(sourceState, sourceTrees)
    const evidenceTrees = treesByEvidence.get(evidence) ?? new WeakSet()
    evidenceTrees.add(flowTree)
    treesByEvidence.set(evidence, evidenceTrees)
    return Object.freeze({
      status: "prepared",
      flowTree,
      work: flowTree.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blocked(
      "unsafe-layout-arithmetic",
      "incremental flow construction exceeded safe layout or summary arithmetic",
    )
  }
}

export function createVNextTextBlockIncrementalFlowTreeCompleteInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockIncrementalFlowTreeBuildResultV1
export function createVNextTextBlockIncrementalFlowTreeCompleteInternalV1(
  input: unknown,
): VNextTextBlockIncrementalFlowTreeBuildResultV1
export function createVNextTextBlockIncrementalFlowTreeCompleteInternalV1(
  input: unknown,
): VNextTextBlockIncrementalFlowTreeBuildResultV1 {
  return buildComplete(input, defaultFingerprint)
}

export function createVNextTextBlockIncrementalFlowTreeWithForcedCollisionForTestInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockIncrementalFlowTreeBuildResultV1 {
  return buildComplete(input, forcedCollisionFingerprint)
}

export function inspectVNextTextBlockIncrementalFlowTreeInternalV1(
  value: unknown,
): VNextTextBlockIncrementalFlowTreeInspectionV1 {
  flowTreeInspectionObserverForTest?.()
  if (
    value == null
    || typeof value !== "object"
    || !preparedTrees.has(value as VNextTextBlockIncrementalFlowTreeV1)
  ) {
    return {
      status: "invalid",
      code: "flow-tree-authority-mismatch",
      message: "flow tree is not the exact process-local prepared candidate",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "flow-tree-not-deeply-frozen",
      message: "prepared flow tree must remain recursively frozen",
    }
  }
  try {
    const flowTree = value as VNextTextBlockIncrementalFlowTreeV1
    const stored = preparedTrees.get(flowTree)!
    const canonicalFacts = stringifyVNextCanonicalJson(
      treeCanonicalFacts(flowTree),
    )
    if (
      canonicalFacts !== stored.canonicalFacts
      || flowTree.fingerprint !== stored.fingerprint
      || flowTree.fingerprint !== stored.fingerprintFactory(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "flow-tree-canonical-facts-mismatch",
        message: "prepared flow tree no longer matches its canonical facts",
      }
    }
    return {
      status: "prepared-unregistered",
      fingerprint: flowTree.fingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "flow-tree-canonical-facts-mismatch",
      message: "prepared flow tree is not canonically inspectable",
    }
  }
}

export function hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
  sourceState: unknown,
  flowTree: unknown,
): flowTree is VNextTextBlockIncrementalFlowTreeV1 {
  return sourceState != null
    && typeof sourceState === "object"
    && flowTree != null
    && typeof flowTree === "object"
    && preparedTrees.has(
      flowTree as VNextTextBlockIncrementalFlowTreeV1,
    )
    && treesBySourceState.get(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    )?.has(
      flowTree as VNextTextBlockIncrementalFlowTreeV1,
    ) === true
}

export function bindVNextTextBlockIncrementalFlowTreeToImagePaintSourceInternalV1(
  input: {
    readonly previousSourceState:
      VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState:
      VNextTextBlockUnifiedLayoutSourceStateV1
    readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  },
): boolean {
  if (
    !hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1(
      input.previousSourceState,
      input.nextSourceState,
    )
    || !hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
      input.previousSourceState,
      input.flowTree,
    )
  ) return false
  const bound = treesBySourceState.get(input.nextSourceState)
    ?? new WeakSet<VNextTextBlockIncrementalFlowTreeV1>()
  bound.add(input.flowTree)
  treesBySourceState.set(input.nextSourceState, bound)
  return true
}

export function registerPreparedVNextTextBlockIncrementalFlowTreeRootGraphChildInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  },
): boolean {
  if (input.phase === "preflight") {
    return !registeredRootGraphTrees.has(input.flowTree)
      && inspectVNextTextBlockIncrementalFlowTreeInternalV1(
        input.flowTree,
      ).status === "prepared-unregistered"
      && authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
        token: input.token,
        phase: input.phase,
        childKind: "flow-tree",
        child: input.flowTree,
      })
  }
  if (
    !authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
      token: input.token,
      phase: input.phase,
      childKind: "flow-tree",
      child: input.flowTree,
    })
  ) return false
  registeredRootGraphTrees.add(input.flowTree)
  return true
}

export function hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2(
  value: unknown,
): value is VNextTextBlockIncrementalFlowTreeV1 {
  return value != null
    && typeof value === "object"
    && registeredRootGraphTrees.has(
      value as VNextTextBlockIncrementalFlowTreeV1,
    )
}

export function inspectVNextTextBlockIncrementalFlowTreeV1(
  value: unknown,
):
  | { readonly status: "valid"; readonly fingerprint: string }
  | {
      readonly status: "invalid"
      readonly code: "flow-tree-authority-mismatch"
      readonly message: string
    } {
  if (
    !hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2(
      value,
    )
  ) {
    return {
      status: "invalid",
      code: "flow-tree-authority-mismatch",
      message: "flow tree is not an exact committed Root V2 child",
    }
  }
  const candidate = inspectVNextTextBlockIncrementalFlowTreeInternalV1(value)
  return candidate.status === "prepared-unregistered"
    ? { status: "valid", fingerprint: candidate.fingerprint }
    : {
        status: "invalid",
        code: "flow-tree-authority-mismatch",
        message: candidate.message,
      }
}

export function lookupVNextTextBlockIncrementalFlowAtomInternalV1(input: {
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly renderedUtf16Offset: number
}): VNextTextBlockIncrementalFlowLookupResultV1 {
  const inspection = inspectVNextTextBlockIncrementalFlowTreeInternalV1(
    input.flowTree,
  )
  if (inspection.status !== "prepared-unregistered") {
    return {
      status: "blocked",
      atom: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: null,
      issues: [{
        code: "source-state-authority-mismatch",
        message: inspection.message,
      }],
    }
  }
  if (
    !Number.isSafeInteger(input.renderedUtf16Offset)
    || input.renderedUtf16Offset < 0
    || input.renderedUtf16Offset >= input.flowTree.summary.renderedUtf16Length
  ) {
    return {
      status: "not-found",
      atom: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: {
        visitedNodeCount: 0,
        completeTreeTraversalCount: 0,
      },
    }
  }

  let node = input.flowTree.root
  let relativeOffset = input.renderedUtf16Offset
  let absoluteBase = 0
  let visitedNodeCount = 1
  while (node.nodeKind === "branch") {
    let selected: VNextTextBlockIncrementalFlowNodeV1 | null = null
    for (const child of node.children) {
      if (relativeOffset < child.summary.renderedUtf16Length) {
        selected = child
        break
      }
      relativeOffset -= child.summary.renderedUtf16Length
      absoluteBase += child.summary.renderedUtf16Length
    }
    if (selected == null) break
    node = selected
    visitedNodeCount += 1
  }
  if (node.nodeKind === "leaf") {
    for (const atom of node.atoms) {
      if (relativeOffset < atom.renderedUtf16Length) {
        return {
          status: "found",
          atom,
          absoluteStartRenderedUtf16: absoluteBase,
          absoluteEndRenderedUtf16:
            absoluteBase + atom.renderedUtf16Length,
          work: {
            visitedNodeCount,
            completeTreeTraversalCount: 0,
          },
        }
      }
      relativeOffset -= atom.renderedUtf16Length
      absoluteBase += atom.renderedUtf16Length
    }
  }
  return {
    status: "not-found",
    atom: null,
    absoluteStartRenderedUtf16: null,
    absoluteEndRenderedUtf16: null,
    work: {
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    },
  }
}

export function visitVNextTextBlockTransitionFlowCoverageInternalV1(input: {
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly range: VNextTextBlockSourceRangeV1
  readonly beforeVisitNode: () => boolean
  readonly beforeEmitAtom: () => boolean
}): VNextTextBlockTransitionFlowCoverageResultInternalV1 {
  if (
    inspectVNextTextBlockIncrementalFlowTreeInternalV1(input.flowTree)
      .status !== "prepared-unregistered"
    || !Number.isSafeInteger(input.range.startRenderedUtf16)
    || !Number.isSafeInteger(input.range.endRenderedUtf16)
    || input.range.startRenderedUtf16 < 0
    || input.range.endRenderedUtf16 < input.range.startRenderedUtf16
    || input.range.endRenderedUtf16 > input.flowTree.summary.renderedUtf16Length
  ) return { status: "blocked", fragments: null, visitedNodeCount: 0, emittedAtomCount: 0, completeTreeTraversalCount: 0 }
  const fragments: VNextTextBlockTransitionFlowCoverageFragmentInternalV1[] = []
  let visitedNodeCount = 0
  let emittedAtomCount = 0
  let stopped = false
  const visit = (node: VNextTextBlockIncrementalFlowNodeV1, start: number): void => {
    if (stopped || input.range.endRenderedUtf16 <= start || input.range.startRenderedUtf16 >= start + node.summary.renderedUtf16Length) return
    if (!input.beforeVisitNode()) { stopped = true; return }
    visitedNodeCount += 1
    if (node.nodeKind === "branch") {
      let childStart = start
      for (const child of node.children) {
        if (childStart >= input.range.endRenderedUtf16) return
        visit(child, childStart)
        childStart += child.summary.renderedUtf16Length
        if (stopped) return
      }
      return
    }
    let atomStart = start
    for (const atom of node.atoms) {
      const atomEnd = atomStart + atom.renderedUtf16Length
      if (input.range.startRenderedUtf16 < atomEnd && input.range.endRenderedUtf16 > atomStart) {
        if (!input.beforeEmitAtom()) { stopped = true; return }
        emittedAtomCount += 1
        fragments.push(Object.freeze({ atom, atomAbsoluteStartRenderedUtf16: atomStart, atomAbsoluteEndRenderedUtf16: atomEnd }))
      }
      atomStart = atomEnd
    }
  }
  visit(input.flowTree.root, 0)
  return stopped
    ? { status: "limit-exceeded", fragments: null, visitedNodeCount, emittedAtomCount, completeTreeTraversalCount: 0 }
    : { status: "accepted", fragments: Object.freeze(fragments), visitedNodeCount, emittedAtomCount, completeTreeTraversalCount: 0 }
}

function flowTransitionIssue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return Object.freeze({
    code: "incremental-proof-unavailable",
    severity: "error",
    stage: "source-flow",
    path: "flowTree",
    message,
  })
}

export type VNextTextBlockIncrementalFlowReplacementAtomsResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly atoms: readonly VNextTextBlockIncrementalFlowAtomV1[]
      readonly visitedFlowAtomCount: number
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly atoms: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export function prepareVNextTextBlockIncrementalFlowReplacementAtomsInternalV1(
  input: {
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly boundedSourceItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly boundedSourceStartRenderedUtf16: number
    readonly targetRange: VNextTextBlockSourceRangeV1
    readonly evidence: VNextTextBlockTransitionEvidenceV2
    readonly beforeVisit: () => boolean
  },
): VNextTextBlockIncrementalFlowReplacementAtomsResultInternalV1 {
  if (
    inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
      input.nextSourceState,
    ) == null
    || !Number.isSafeInteger(input.boundedSourceStartRenderedUtf16)
    || input.boundedSourceStartRenderedUtf16 < 0
    || !Number.isSafeInteger(input.targetRange.startRenderedUtf16)
    || !Number.isSafeInteger(input.targetRange.endRenderedUtf16)
    || input.targetRange.endRenderedUtf16
      < input.targetRange.startRenderedUtf16
  ) {
    return Object.freeze({
      status: "blocked" as const,
      atoms: null,
      issues: Object.freeze([flowTransitionIssue(
        "Flow projection requires exact bounded Source authority",
      )]),
    })
  }
  const factory = defaultFingerprint
  let faces: Map<
    string,
    VNextTextBlockUnifiedLayoutSourceStateV1["producerRequirements"]["fontFaces"][number]
  > | null = null
  const atoms: VNextTextBlockIncrementalFlowAtomV1[] = []
  let visitedFlowAtomCount = 0
  const beforeCreateAtom = (): boolean => {
    if (!input.beforeVisit()) return false
    visitedFlowAtomCount += 1
    return true
  }
  let sourceIndex = 0
  let sourceAbsoluteStart = input.boundedSourceStartRenderedUtf16
  let shapingRunIndex = 0
  let shapingClusterIndex = 0
  let projectedCursor = input.targetRange.startRenderedUtf16
  while (projectedCursor < input.targetRange.endRenderedUtf16) {
    if (!beforeCreateAtom()) {
      return Object.freeze({
        status: "limit-exceeded" as const,
        atoms: null,
        issues: Object.freeze([]),
      })
    }
    flowProjectionPayloadObserverForTest?.()
    let source = input.boundedSourceItems[sourceIndex]
    let sourceAbsoluteEnd = source == null
      ? sourceAbsoluteStart
      : safeAdd(sourceAbsoluteStart, source.renderedUtf16Length)
    while (source != null && sourceAbsoluteEnd <= projectedCursor) {
      sourceIndex += 1
      sourceAbsoluteStart = sourceAbsoluteEnd
      source = input.boundedSourceItems[sourceIndex]
      sourceAbsoluteEnd = source == null
        ? sourceAbsoluteStart
        : safeAdd(sourceAbsoluteStart, source.renderedUtf16Length)
    }
    if (
      source == null
      || sourceAbsoluteStart > projectedCursor
      || sourceAbsoluteEnd <= projectedCursor
    ) {
      return Object.freeze({
        status: "blocked" as const,
        atoms: null,
        issues: Object.freeze([flowTransitionIssue(
          "bounded Source items leave a Flow projection gap",
        )]),
      })
    }
    if (source.kind === "hard-break" || source.kind === "inline-image") {
      if (
        projectedCursor !== sourceAbsoluteStart
        || sourceAbsoluteEnd > input.targetRange.endRenderedUtf16
      ) {
        return Object.freeze({
          status: "blocked" as const,
          atoms: null,
          issues: Object.freeze([flowTransitionIssue(
            "non-text Flow projection must remain atomic",
          )]),
        })
      }
      const atom = source.kind === "hard-break"
        ? hardBreakAtom(source, factory)
        : imageAtom(source, factory)
      if (atom == null) {
        return Object.freeze({
          status: "blocked" as const,
          atoms: null,
          issues: Object.freeze([flowTransitionIssue(
            "non-text Flow projection has unsafe geometry",
          )]),
        })
      }
      atoms.push(deepFreeze(atom))
      projectedCursor = sourceAbsoluteEnd
      continue
    }
    let selectedRun: VNextTextBlockTransitionEvidenceV2["shapingRuns"][number]
      | null = null
    let selectedCluster: VNextTextBlockTransitionEvidenceV2["shapingRuns"][number]["clusters"][number]
      | null = null
    while (shapingRunIndex < input.evidence.shapingRuns.length) {
      flowProjectionPayloadObserverForTest?.()
      const shapingRun = input.evidence.shapingRuns[shapingRunIndex]
      if (shapingRun == null) break
      while (
        shapingClusterIndex < shapingRun.clusters.length
        && shapingRun.clusters[shapingClusterIndex]!.renderEndOffset
          <= projectedCursor
      ) shapingClusterIndex += 1
      if (shapingClusterIndex < shapingRun.clusters.length) {
        selectedRun = shapingRun
        selectedCluster = shapingRun.clusters[shapingClusterIndex] ?? null
        break
      }
      shapingRunIndex += 1
      shapingClusterIndex = 0
    }
    if (
      selectedRun == null
      || selectedCluster == null
      || selectedCluster.renderStartOffset !== projectedCursor
      || selectedCluster.renderEndOffset > input.targetRange.endRenderedUtf16
    ) {
      return Object.freeze({
        status: "blocked" as const,
        atoms: null,
        issues: Object.freeze([flowTransitionIssue(
          "Flow evidence cluster coverage is not exact and ordered",
        )]),
      })
    }
    if (faces == null) {
      flowProjectionPayloadObserverForTest?.()
      faces = new Map(
        input.nextSourceState.producerRequirements.fontFaces.map(
          (face) => [face.fontFaceId, face],
        ),
      )
    }
    const face = faces.get(selectedRun.fontFaceId)
    const textSpans: TextFlowSourceSpan[] = []
    let spanIndex = sourceIndex
    let spanAbsoluteStart = sourceAbsoluteStart
    let coveredSourceEnd = selectedCluster.renderStartOffset
    while (coveredSourceEnd < selectedCluster.renderEndOffset) {
      const spanSource = input.boundedSourceItems[spanIndex]
      if (
        spanSource == null
        || (
          spanSource.kind !== "text"
          && spanSource.kind !== "resolved-field"
          && spanSource.kind !== "generated-page-number"
        )
      ) break
      const spanAbsoluteEnd = safeAdd(
        spanAbsoluteStart,
        spanSource.renderedUtf16Length,
      )
      const selectedStart = Math.max(
        spanAbsoluteStart,
        selectedCluster.renderStartOffset,
      )
      const selectedEnd = Math.min(
        spanAbsoluteEnd,
        selectedCluster.renderEndOffset,
      )
      if (selectedStart !== coveredSourceEnd || selectedEnd <= selectedStart) {
        break
      }
      textSpans.push({
        source: spanSource,
        absoluteStart: spanAbsoluteStart,
        absoluteEnd: spanAbsoluteEnd,
      })
      coveredSourceEnd = selectedEnd
      if (spanAbsoluteEnd <= selectedCluster.renderEndOffset) {
        spanIndex += 1
        spanAbsoluteStart = spanAbsoluteEnd
      }
    }
    const sourceFacts = textFlowSourceFacts({
      spans: textSpans,
      clusterStart: selectedCluster.renderStartOffset,
      clusterEnd: selectedCluster.renderEndOffset,
      factory,
    })
    if (
      face == null
      || coveredSourceEnd !== selectedCluster.renderEndOffset
      || sourceFacts == null
    ) {
      return Object.freeze({
        status: "blocked" as const,
        atoms: null,
        issues: Object.freeze([flowTransitionIssue(
          "Flow evidence cluster lacks exact Source or font authority",
        )]),
      })
    }
    const atom = textAtom({
      source: sourceFacts.source,
      sourceAbsoluteStart: sourceFacts.sourceAbsoluteStart,
      shapingRun: selectedRun,
      cluster: selectedCluster,
      face,
      advanceLayoutUnit: selectedCluster.advanceLayoutUnit,
      segmentStart: selectedCluster.renderStartOffset,
      segmentEnd: selectedCluster.renderEndOffset,
      factory,
    })
    if (atom == null) {
      return Object.freeze({
        status: "blocked" as const,
        atoms: null,
        issues: Object.freeze([flowTransitionIssue(
          "Flow evidence could not form an exact canonical atom",
        )]),
      })
    }
    atoms.push(deepFreeze(atom))
    projectedCursor = selectedCluster.renderEndOffset
    shapingClusterIndex += 1
    sourceIndex = spanIndex
    sourceAbsoluteStart = spanAbsoluteStart
  }
  if (projectedCursor !== input.targetRange.endRenderedUtf16) {
    return Object.freeze({
      status: "blocked" as const,
      atoms: null,
      issues: Object.freeze([flowTransitionIssue(
        "bounded Flow projection does not cover the exact target range",
      )]),
    })
  }
  const preparedAtoms = Object.freeze(atoms)
  replacementAtomAuthorities.set(preparedAtoms, Object.freeze({
    nextSourceState: input.nextSourceState,
    targetRange: input.targetRange,
    renderedUtf16Length:
      input.targetRange.endRenderedUtf16
      - input.targetRange.startRenderedUtf16,
  }))
  return Object.freeze({
    status: "prepared" as const,
    atoms: preparedAtoms,
    visitedFlowAtomCount,
    issues: Object.freeze([]) as readonly [],
  })
}

export function prepareVNextTextBlockIncrementalFlowRangePathCopyInternalV1(
  input: {
    readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly replacementAtoms: readonly VNextTextBlockIncrementalFlowAtomV1[]
    readonly previousRange: VNextTextBlockSourceRangeV1
    readonly nextRange: VNextTextBlockSourceRangeV1
    readonly beforeVisit: (
      unit: "flow-atoms" | "flow-tree-nodes",
    ) => boolean
  },
): VNextTextBlockIncrementalFlowRangePathCopyResultInternalV1 {
  const stored = preparedTrees.get(input.previousFlowTree)
  let visitedFlowAtomCount = 0
  let visitedFlowTreeNodeCount = 0
  let createdFlowTreeNodeCount = 0
  let createdFlowLeafCount = 0
  const blockedResult = (message: string) => Object.freeze({
    status: "blocked" as const,
    flowTree: null,
    visitedFlowAtomCount,
    visitedFlowTreeNodeCount,
    createdFlowTreeNodeCount,
    issues: Object.freeze([flowTransitionIssue(message)]),
  })
  const limitResult = () => Object.freeze({
    status: "limit-exceeded" as const,
    flowTree: null,
    visitedFlowAtomCount,
    visitedFlowTreeNodeCount,
    createdFlowTreeNodeCount,
    issues: Object.freeze([]) as readonly [],
  })
  const replacementAuthority = replacementAtomAuthorities.get(
    input.replacementAtoms,
  )
  const replacementRenderedUtf16Length =
    replacementAuthority?.renderedUtf16Length ?? -1
  const removedRenderedUtf16Length = input.previousRange.endRenderedUtf16
    - input.previousRange.startRenderedUtf16
  let expectedNextRenderedUtf16Length: number
  try {
    expectedNextRenderedUtf16Length = safeAdd(
      input.previousFlowTree.summary.renderedUtf16Length
        - removedRenderedUtf16Length,
      replacementRenderedUtf16Length,
    )
  } catch {
    return blockedResult("Flow path-copy target length is unsafe")
  }
  if (
    stored == null
    || replacementAuthority == null
    || replacementAuthority.nextSourceState !== input.nextSourceState
    || replacementAuthority.targetRange.startRenderedUtf16
      !== input.nextRange.startRenderedUtf16
    || replacementAuthority.targetRange.endRenderedUtf16
      !== input.nextRange.endRenderedUtf16
    || !hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
      input.previousSourceState,
      input.previousFlowTree,
    )
    || inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
      input.nextSourceState,
    ) == null
    || input.previousFlowTree.layoutContextFingerprint
      !== fingerprintWith(stored.fingerprintFactory, {
        layoutId: input.nextSourceState.producerRequirements.layoutId,
        layoutUnitPolicyFingerprint:
          input.nextSourceState.producerRequirements.layoutUnitPolicyFingerprint,
        availableWidthLayoutUnit:
          input.nextSourceState.producerRequirements.availableWidthLayoutUnit,
        declaredLineHeightLayoutUnit:
          input.nextSourceState.producerRequirements.declaredLineHeightLayoutUnit,
        paragraphFontFamilyKey:
          input.nextSourceState.producerRequirements.paragraphFontFamilyKey,
        paragraphStyle:
          input.nextSourceState.producerRequirements.paragraphStyle,
        fontFaces: input.nextSourceState.producerRequirements.fontFaces,
      })
    || input.previousRange.startRenderedUtf16 < 0
    || input.previousRange.endRenderedUtf16
      < input.previousRange.startRenderedUtf16
    || input.previousRange.endRenderedUtf16
      > input.previousFlowTree.summary.renderedUtf16Length
    || input.previousFlowTree.summary.renderedUtf16Length
      !== input.previousSourceState.summary.renderedUtf16Length
    || input.nextRange.startRenderedUtf16 < 0
    || input.nextRange.endRenderedUtf16 < input.nextRange.startRenderedUtf16
    || input.nextRange.startRenderedUtf16
      !== input.previousRange.startRenderedUtf16
    || input.nextRange.endRenderedUtf16
      > input.nextSourceState.summary.renderedUtf16Length
    || replacementRenderedUtf16Length !== input.nextRange.endRenderedUtf16
      - input.nextRange.startRenderedUtf16
    || expectedNextRenderedUtf16Length
      !== input.nextSourceState.summary.renderedUtf16Length
  ) return blockedResult("Flow path copy requires exact compatible authority")

  let limitExceeded = false
  let structuralIssue: string | null = null
  const createdNodes = new WeakSet<object>()
  const originalAtoms = new WeakSet<object>()
  const reusedAtoms = new Set<VNextTextBlockIncrementalFlowAtomV1>()
  const reusedRoots = new Set<VNextTextBlockIncrementalFlowNodeV1>()

  const visitAtom = (
    value: VNextTextBlockIncrementalFlowAtomV1 | null = null,
  ): boolean => {
    if (!input.beforeVisit("flow-atoms")) {
      limitExceeded = true
      return false
    }
    visitedFlowAtomCount += 1
    flowPathCopyOperationObserverForTest?.({
      operation: "visit-atom",
      value,
    })
    return true
  }
  const visitNode = (
    value: VNextTextBlockIncrementalFlowNodeV1 | null = null,
    operation: "visit-node" | "create-node" = "visit-node",
  ): boolean => {
    if (!input.beforeVisit("flow-tree-nodes")) {
      limitExceeded = true
      return false
    }
    visitedFlowTreeNodeCount += 1
    flowPathCopyOperationObserverForTest?.({ operation, value })
    return true
  }
  const retain = (node: VNextTextBlockIncrementalFlowNodeV1): void => {
    if (!createdNodes.has(node)) reusedRoots.add(node)
  }
  const open = (node: VNextTextBlockIncrementalFlowNodeV1): void => {
    reusedRoots.delete(node)
  }
  const createLeaf = (
    atoms: readonly VNextTextBlockIncrementalFlowAtomV1[],
  ): VNextTextBlockIncrementalFlowLeafV1 | null => {
    if (!visitNode(null, "create-node")) return null
    const value = leaf(atoms, stored.fingerprintFactory)
    deepFreeze(value.summary)
    Object.freeze(value.atoms)
    Object.freeze(value)
    createdNodes.add(value)
    createdFlowTreeNodeCount += 1
    createdFlowLeafCount += 1
    return value
  }
  const createBranch = (
    children: readonly VNextTextBlockIncrementalFlowNodeV1[],
  ): VNextTextBlockIncrementalFlowBranchV1 | null => {
    if (!visitNode(null, "create-node")) return null
    const value = branch(children, stored.fingerprintFactory)
    deepFreeze(value.summary)
    Object.freeze(value.children)
    Object.freeze(value)
    createdNodes.add(value)
    createdFlowTreeNodeCount += 1
    for (const child of children) retain(child)
    return value
  }
  const packAtoms = (
    atoms: readonly VNextTextBlockIncrementalFlowAtomV1[],
  ): readonly VNextTextBlockIncrementalFlowLeafV1[] | null => {
    const result: VNextTextBlockIncrementalFlowLeafV1[] = []
    for (const group of canonicalGroups(atoms, 8)) {
      const value = createLeaf(group)
      if (value == null) return null
      result.push(value)
    }
    return result
  }
  const packChildren = (
    children: readonly VNextTextBlockIncrementalFlowNodeV1[],
  ): readonly VNextTextBlockIncrementalFlowBranchV1[] | null => {
    const result: VNextTextBlockIncrementalFlowBranchV1[] = []
    for (const group of canonicalGroups(children, 8)) {
      const value = createBranch(group)
      if (value == null) return null
      result.push(value)
    }
    return result
  }

  function concatParts(
    left: VNextTextBlockIncrementalFlowNodeV1,
    right: VNextTextBlockIncrementalFlowNodeV1,
  ): readonly VNextTextBlockIncrementalFlowNodeV1[] | null {
    if (left.height === right.height) {
      if (left.nodeKind === "leaf" && right.nodeKind === "leaf") {
        const totalAtomCount = left.atoms.length + right.atoms.length
        const canonicalAtomGroupSizes = canonicalGroups(
          new Array<null>(totalAtomCount).fill(null),
          8,
        ).map((group) => group.length)
        if (
          totalAtomCount > 8
          && (
            !createdNodes.has(left)
            || !createdNodes.has(right)
            || (
              canonicalAtomGroupSizes.length === 2
              && canonicalAtomGroupSizes[0] === left.atoms.length
              && canonicalAtomGroupSizes[1] === right.atoms.length
            )
          )
        ) {
          retain(left)
          retain(right)
          return [left, right]
        }
        open(left)
        open(right)
        const atoms: VNextTextBlockIncrementalFlowAtomV1[] = []
        for (const [owner, atom] of [
          ...left.atoms.map((atom) => [left, atom] as const),
          ...right.atoms.map((atom) => [right, atom] as const),
        ]) {
          if (!visitAtom(atom)) return null
          atoms.push(atom)
          if (!createdNodes.has(owner)) originalAtoms.add(atom)
          if (originalAtoms.has(atom)) reusedAtoms.add(atom)
        }
        return packAtoms(atoms)
      }
      if (left.nodeKind !== "branch" || right.nodeKind !== "branch") {
        structuralIssue = "Flow concat encountered inconsistent node heights"
        return null
      }
      const totalChildCount = left.children.length + right.children.length
      const canonicalChildGroupSizes = canonicalGroups(
        new Array<null>(totalChildCount).fill(null),
        8,
      ).map((group) => group.length)
      if (
        totalChildCount > 8
        && (
          !createdNodes.has(left)
          || !createdNodes.has(right)
          || (
            canonicalChildGroupSizes.length === 2
            && canonicalChildGroupSizes[0] === left.children.length
            && canonicalChildGroupSizes[1] === right.children.length
          )
        )
      ) {
        retain(left)
        retain(right)
        return [left, right]
      }
      if (!visitNode(left) || !visitNode(right)) return null
      open(left)
      open(right)
      return packChildren([...left.children, ...right.children])
    }
    if (left.height > right.height) {
      if (left.nodeKind !== "branch" || !visitNode(left)) {
        if (!limitExceeded) structuralIssue = "Flow concat left height is invalid"
        return null
      }
      open(left)
      const boundary = left.children.at(-1)
      if (boundary == null) {
        structuralIssue = "Flow concat left boundary is missing"
        return null
      }
      const joined = concatParts(boundary, right)
      if (joined == null) return null
      return packChildren([...left.children.slice(0, -1), ...joined])
    }
    if (right.nodeKind !== "branch" || !visitNode(right)) {
      if (!limitExceeded) structuralIssue = "Flow concat right height is invalid"
      return null
    }
    open(right)
    const boundary = right.children[0]
    if (boundary == null) {
      structuralIssue = "Flow concat right boundary is missing"
      return null
    }
    const joined = concatParts(left, boundary)
    if (joined == null) return null
    return packChildren([...joined, ...right.children.slice(1)])
  }

  function rootFromParts(
    parts: readonly VNextTextBlockIncrementalFlowNodeV1[],
  ): VNextTextBlockIncrementalFlowNodeV1 | null {
    if (parts.length === 0) return null
    if (parts.length === 1) {
      const only = parts[0]!
      retain(only)
      return only
    }
    let level = parts
    while (level.length > 1) {
      const next = packChildren(level)
      if (next == null) return null
      level = next
    }
    return level[0] ?? null
  }

  function concatRoots(
    left: VNextTextBlockIncrementalFlowNodeV1 | null,
    right: VNextTextBlockIncrementalFlowNodeV1 | null,
  ): VNextTextBlockIncrementalFlowNodeV1 | null {
    if (left == null) {
      if (right != null) retain(right)
      return right
    }
    if (right == null) {
      retain(left)
      return left
    }
    const parts = concatParts(left, right)
    return parts == null ? null : rootFromParts(parts)
  }

  function sequenceRoot(
    nodes: readonly VNextTextBlockIncrementalFlowNodeV1[],
  ): VNextTextBlockIncrementalFlowNodeV1 | null {
    let result: VNextTextBlockIncrementalFlowNodeV1 | null = null
    for (const node of nodes) result = concatRoots(result, node)
    return result
  }

  function splitNode(
    node: VNextTextBlockIncrementalFlowNodeV1,
    offset: number,
  ): {
    readonly left: VNextTextBlockIncrementalFlowNodeV1 | null
    readonly right: VNextTextBlockIncrementalFlowNodeV1 | null
  } | null {
    if (offset === 0) return { left: null, right: node }
    if (offset === node.summary.renderedUtf16Length) {
      return { left: node, right: null }
    }
    if (
      offset < 0
      || offset > node.summary.renderedUtf16Length
      || !visitNode(node)
    ) {
      if (!limitExceeded) structuralIssue = "Flow split offset is outside its node"
      return null
    }
    open(node)
    if (node.nodeKind === "leaf") {
      const atoms: VNextTextBlockIncrementalFlowAtomV1[] = []
      let cursor = 0
      let splitIndex = -1
      for (let index = 0; index < node.atoms.length; index += 1) {
        if (!visitAtom()) return null
        const atom = node.atoms[index]
        if (atom == null) {
          structuralIssue = "Flow leaf summary is inconsistent"
          return null
        }
        flowPathCopyOperationObserverForTest?.({
          operation: "visit-atom",
          value: atom,
        })
        originalAtoms.add(atom)
        atoms.push(atom)
        cursor = safeAdd(cursor, atom.renderedUtf16Length)
        if (splitIndex < 0 && cursor === offset) splitIndex = index + 1
        if (splitIndex < 0 && cursor > offset) {
          structuralIssue = "Flow replacement range must use exact atom boundaries"
          return null
        }
      }
      if (splitIndex < 0) {
        structuralIssue = "Flow leaf does not cover the exact split offset"
        return null
      }
      const leftAtoms = atoms.slice(0, splitIndex)
      const rightAtoms = atoms.slice(splitIndex)
      for (const atom of atoms) reusedAtoms.add(atom)
      const leftLeaves = packAtoms(leftAtoms)
      const rightLeaves = packAtoms(rightAtoms)
      if (leftLeaves == null || rightLeaves == null) return null
      return {
        left: rootFromParts(leftLeaves),
        right: rootFromParts(rightLeaves),
      }
    }
    let cursor = 0
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index]!
      const end = safeAdd(cursor, child.summary.renderedUtf16Length)
      if (offset === cursor) {
        return {
          left: sequenceRoot(node.children.slice(0, index)),
          right: sequenceRoot(node.children.slice(index)),
        }
      }
      if (offset < end) {
        const split = splitNode(child, offset - cursor)
        if (split == null) return null
        const left = sequenceRoot([
          ...node.children.slice(0, index),
          ...(split.left == null ? [] : [split.left]),
        ])
        const right = sequenceRoot([
          ...(split.right == null ? [] : [split.right]),
          ...node.children.slice(index + 1),
        ])
        return { left, right }
      }
      cursor = end
    }
    structuralIssue = "Flow branch does not cover the exact split offset"
    return null
  }

  const firstSplit = splitNode(
    input.previousFlowTree.root,
    input.previousRange.startRenderedUtf16,
  )
  if (firstSplit == null) {
    return limitExceeded
      ? limitResult()
      : blockedResult(structuralIssue ?? "Flow start split was unavailable")
  }
  const removedLength = input.previousRange.endRenderedUtf16
    - input.previousRange.startRenderedUtf16
  const secondSplit = firstSplit.right == null
    ? removedLength === 0 ? { left: null, right: null } : null
    : splitNode(firstSplit.right, removedLength)
  if (secondSplit == null) {
    return limitExceeded
      ? limitResult()
      : blockedResult(structuralIssue ?? "Flow end split was unavailable")
  }
  let replacementRoot: VNextTextBlockIncrementalFlowNodeV1 | null = null
  if (input.replacementAtoms.length > 0) {
    const replacementAtoms: VNextTextBlockIncrementalFlowAtomV1[] = []
    for (const atom of input.replacementAtoms) {
      if (!visitAtom(atom)) return limitResult()
      replacementAtoms.push(atom)
    }
    const replacementLeaves = packAtoms(replacementAtoms)
    if (replacementLeaves == null) return limitResult()
    replacementRoot = rootFromParts(replacementLeaves)
  }
  const withReplacement = concatRoots(firstSplit.left, replacementRoot)
  const nextRoot = concatRoots(withReplacement, secondSplit.right)
  if (limitExceeded) return limitResult()
  if (structuralIssue != null) return blockedResult(structuralIssue)
  if (nextRoot == null) return blockedResult("Flow path copy produced no root")
  if (
    nextRoot.summary.renderedUtf16Length
      !== expectedNextRenderedUtf16Length
  ) return blockedResult("Flow path copy produced a mismatched target length")
  const reusedFlowTreeNodeCount = [...reusedRoots].reduce(
    (total, reused) => safeAdd(total, reused.summary.nodeCount),
    0,
  )
  const reusedAtomCount = safeAdd(
    [...reusedRoots].reduce(
      (total, reused) => safeAdd(total, reused.summary.atomCount),
      0,
    ),
    reusedAtoms.size,
  )
  const work = deepFreeze({
    completeBuildCount: 0 as const,
    visitedSourceItemCount: 0 as const,
    visitedEvidenceShapingRunCount: 0 as const,
    visitedEvidenceClusterCount: 0 as const,
    createdAtomCount: input.replacementAtoms.length,
    createdLeafCount: createdFlowLeafCount,
    createdNodeCount: createdFlowTreeNodeCount,
    reusedAtomCount,
    reusedNodeCount: reusedFlowTreeNodeCount,
    completeTreeRebuildCount: 0 as const,
    completeSuffixTraversalCount: 0 as const,
  })
  const facts = {
    source: input.previousFlowTree.source,
    contractVersion: input.previousFlowTree.contractVersion,
    documentId: input.previousFlowTree.documentId,
    sectionId: input.previousFlowTree.sectionId,
    textBlockId: input.previousFlowTree.textBlockId,
    instanceRevision: input.previousFlowTree.instanceRevision,
    layoutId: input.previousFlowTree.layoutId,
    layoutContextFingerprint: input.previousFlowTree.layoutContextFingerprint,
    sourceStateLayoutDependencyFingerprint:
      input.nextSourceState.summary.layoutDependencyFingerprint,
    producerRuntimeRequirementFingerprint:
      input.previousFlowTree.producerRuntimeRequirementFingerprint,
    policy: input.previousFlowTree.policy,
    root: nextRoot,
    summary: nextRoot.summary,
    work,
    contracts: input.previousFlowTree.contracts,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const canonicalFacts = stringifyVNextCanonicalJson(treeCanonicalFacts({
    ...facts,
    fingerprint: "",
  }))
  const flowTree = Object.freeze({
    ...facts,
    fingerprint: stored.fingerprintFactory(canonicalFacts),
  })
  preparedTrees.set(flowTree, {
    fingerprint: flowTree.fingerprint,
    canonicalFacts,
    fingerprintFactory: stored.fingerprintFactory,
  })
  const bound = treesBySourceState.get(input.nextSourceState) ?? new WeakSet()
  bound.add(flowTree)
  treesBySourceState.set(input.nextSourceState, bound)
  return Object.freeze({
    status: "prepared" as const,
    flowTree,
    visitedFlowAtomCount,
    visitedFlowTreeNodeCount,
    reusedFlowTreeNodeCount,
    createdFlowTreeNodeCount,
    issues: Object.freeze([]) as readonly [],
  })
}

function flowBindingAuthority(input: {
  readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}): VNextTextBlockFlowBindingAuthorityInternalV1 {
  const authority = Object.freeze(
    {},
  ) as VNextTextBlockFlowBindingAuthorityInternalV1
  flowBindingAuthorities.set(authority, Object.freeze(input))
  return authority
}

export function bindVNextTextBlockIncrementalFlowExactAliasInternalV1(input: {
  readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sourceLayoutDeltaAuthority:
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1
}): VNextTextBlockFlowBindingAuthorityInternalV1 | null {
  if (
    !hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
      input.previousSourceState,
      input.previousFlowTree,
    )
    || !hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1({
      authority: input.sourceLayoutDeltaAuthority,
      previousSourceState: input.previousSourceState,
      nextSourceState: input.nextSourceState,
    })
  ) return null
  const bound = treesBySourceState.get(input.nextSourceState) ?? new WeakSet()
  bound.add(input.previousFlowTree)
  treesBySourceState.set(input.nextSourceState, bound)
  return flowBindingAuthority({
    previousFlowTree: input.previousFlowTree,
    nextFlowTree: input.previousFlowTree,
    previousSourceState: input.previousSourceState,
    nextSourceState: input.nextSourceState,
  })
}

export function bindVNextTextBlockIncrementalFlowCandidateInternalV1(input: {
  readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}): VNextTextBlockFlowBindingAuthorityInternalV1 | null {
  return hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
    input.nextSourceState,
    input.nextFlowTree,
  )
    && hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1({
      authority: input.structuralTargetAuthority,
      previousSourceState: input.previousSourceState,
      nextSourceState: input.nextSourceState,
    })
    ? flowBindingAuthority(input)
    : null
}
