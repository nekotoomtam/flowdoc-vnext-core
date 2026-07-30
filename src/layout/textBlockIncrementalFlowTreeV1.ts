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
  hasVNextTextBlockUnifiedLayoutSourceStatePreparedBindingInternalV1,
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

function splitClusterAdvance(input: {
  readonly advanceLayoutUnit: number
  readonly clusterStartOffset: number
  readonly clusterEndOffset: number
  readonly segmentStartOffset: number
  readonly segmentEndOffset: number
}): number | null {
  const totalLength = input.clusterEndOffset - input.clusterStartOffset
  const segmentLength = input.segmentEndOffset - input.segmentStartOffset
  const relativeStart = input.segmentStartOffset - input.clusterStartOffset
  if (totalLength <= 0 || segmentLength <= 0 || relativeStart < 0) return null
  const wholeUnitAdvance = Math.floor(input.advanceLayoutUnit / totalLength)
  const remainder = input.advanceLayoutUnit % totalLength
  const value = wholeUnitAdvance * segmentLength
    + Math.max(0, Math.min(remainder - relativeStart, segmentLength))
  return Number.isSafeInteger(value) ? value : null
}

function textAtom(input: {
  readonly source: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>
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
  let absoluteStart = 0
  let visitedEvidenceClusterCount = 0
  for (const source of sourceItems) {
    const absoluteEnd = safeAdd(absoluteStart, source.renderedUtf16Length)
    if (source.kind === "hard-break") {
      atoms.push(hardBreakAtom(source, input.factory))
      absoluteStart = absoluteEnd
      continue
    }
    if (source.kind === "inline-image") {
      const atom = imageAtom(source, input.factory)
      if (atom == null) return null
      atoms.push(atom)
      absoluteStart = absoluteEnd
      continue
    }

    const shapingRuns = input.evidence.shapingRuns.filter((run) => (
      run.renderStartOffset < absoluteEnd
      && run.renderEndOffset > absoluteStart
    ))
    let sourceCursor = absoluteStart
    for (const shapingRun of shapingRuns) {
      if (shapingRun.renderStartOffset > sourceCursor) return null
      const face = faces.get(shapingRun.fontFaceId)
      if (face == null) return null
      for (const cluster of shapingRun.clusters) {
        visitedEvidenceClusterCount += 1
        const segmentStart = Math.max(
          cluster.renderStartOffset,
          absoluteStart,
        )
        const segmentEnd = Math.min(cluster.renderEndOffset, absoluteEnd)
        if (segmentEnd <= segmentStart) continue
        if (segmentStart !== sourceCursor) return null
        const advanceLayoutUnit = splitClusterAdvance({
          advanceLayoutUnit: cluster.advanceLayoutUnit,
          clusterStartOffset: cluster.renderStartOffset,
          clusterEndOffset: cluster.renderEndOffset,
          segmentStartOffset: segmentStart,
          segmentEndOffset: segmentEnd,
        })
        if (advanceLayoutUnit == null) return null
        const atom = textAtom({
          source,
          sourceAbsoluteStart: absoluteStart,
          shapingRun,
          cluster,
          face,
          advanceLayoutUnit,
          segmentStart,
          segmentEnd,
          factory: input.factory,
        })
        if (atom == null) return null
        atoms.push(atom)
        sourceCursor = segmentEnd
      }
    }
    if (sourceCursor !== absoluteEnd) return null
    absoluteStart = absoluteEnd
  }
  if (absoluteStart !== input.sourceState.summary.renderedUtf16Length) {
    return null
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
