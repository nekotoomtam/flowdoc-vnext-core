import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  convertVNextPositiveUnitValueToLayoutUnitV1,
  scaleVNextFontMetricToLayoutUnitV1,
} from "./layoutUnitPolicyV1.js"
import { hasVNextTextBlockFlowEvidenceBindingInternalV2 } from "./textBlockFlowEvidenceV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import { VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1 } from "./textBlockInlineImageLineBoxV1.js"
import { registerVNextTextBlockV2LayoutAuthorityInternalV1 } from "./textBlockLayoutAuthorityInternalsV1.js"
import { VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1 } from "./textBlockPersistentFlowContractV1.js"
import type {
  VNextTextBlockPersistentFlowAtomV2,
  VNextTextBlockPersistentFlowBranchV2,
  VNextTextBlockPersistentFlowBuildIssueCodeV2,
  VNextTextBlockPersistentFlowBuildResultV2,
  VNextTextBlockPersistentFlowLeafV2,
  VNextTextBlockPersistentFlowNodeV2,
  VNextTextBlockPersistentFlowSummaryV2,
  VNextTextBlockPersistentFlowTreeV2,
} from "./textBlockPersistentFlowContractV2.js"
import {
  buildVNextTextBlockPersistentRopeRootKernelV1,
  collectVNextTextBlockPersistentRopeNodesKernelV1,
  partitionVNextTextBlockPersistentValuesKernelV1,
} from "./textBlockPersistentRopeKernelV1.js"

const processLocalTrees = new WeakMap<VNextTextBlockPersistentFlowTreeV2, {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
}>()

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  return value != null
    && typeof value === "object"
    && Object.isFrozen(value)
    && Object.values(value).every((item) => (
      item == null || typeof item !== "object" || deeplyFrozen(item)
    ))
}

function blocked(
  code: VNextTextBlockPersistentFlowBuildIssueCodeV2,
  message: string,
): VNextTextBlockPersistentFlowBuildResultV2 {
  return { status: "blocked", tree: null, issues: [{ code, message }] }
}

function exactInput(value: unknown): {
  initialFlow: unknown
  evidence: unknown
  bindProductionLayout?: unknown
} | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return null
  const keys = Reflect.ownKeys(value)
  if (keys.some((key) => typeof key !== "string") || keys.some((key) => (
    key !== "initialFlow" && key !== "evidence" && key !== "bindProductionLayout"
  ))) return null
  const descriptors = Object.fromEntries(keys.map((key) => [key, Object.getOwnPropertyDescriptor(value, key)]))
  if (
    descriptors.initialFlow == null
    || descriptors.evidence == null
    || Object.values(descriptors).some((descriptor) => (
      descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true
    ))
  ) return null
  return {
    initialFlow: descriptors.initialFlow.value,
    evidence: descriptors.evidence.value,
    ...(descriptors.bindProductionLayout == null
      ? {}
      : { bindProductionLayout: descriptors.bindProductionLayout.value }),
  }
}

function summaryFromAtoms(atoms: readonly VNextTextBlockPersistentFlowAtomV2[]): VNextTextBlockPersistentFlowSummaryV2 {
  const counts = { "text-cluster": 0, "hard-break": 0, "inline-image": 0 }
  let renderedUtf16Length = 0
  for (const atom of atoms) {
    counts[atom.kind] += 1
    renderedUtf16Length += atom.renderedText.length
    if (!Number.isSafeInteger(renderedUtf16Length)) throw new RangeError("unsafe persistent flow length")
  }
  return {
    renderedUtf16Length,
    atomCount: atoms.length,
    leafCount: 1,
    nodeCount: 1,
    textClusterCount: counts["text-cluster"],
    hardBreakCount: counts["hard-break"],
    inlineImageCount: counts["inline-image"],
    semanticFingerprint: fingerprint({
      atoms: atoms.map((atom) => atom.fingerprint),
    }),
  }
}

function summaryFromChildren(children: readonly VNextTextBlockPersistentFlowNodeV2[]): VNextTextBlockPersistentFlowSummaryV2 {
  const result = {
    renderedUtf16Length: 0,
    atomCount: 0,
    leafCount: 0,
    nodeCount: 1,
    textClusterCount: 0,
    hardBreakCount: 0,
    inlineImageCount: 0,
  }
  for (const child of children) {
    result.renderedUtf16Length += child.summary.renderedUtf16Length
    result.atomCount += child.summary.atomCount
    result.leafCount += child.summary.leafCount
    result.nodeCount += child.summary.nodeCount
    result.textClusterCount += child.summary.textClusterCount
    result.hardBreakCount += child.summary.hardBreakCount
    result.inlineImageCount += child.summary.inlineImageCount
  }
  if (Object.values(result).some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError("unsafe persistent flow summary")
  }
  return {
    ...result,
    semanticFingerprint: fingerprint({
      children: children.map((child) => child.summary.semanticFingerprint),
    }),
  }
}

function leaf(atoms: readonly VNextTextBlockPersistentFlowAtomV2[]): VNextTextBlockPersistentFlowLeafV2 {
  const summary = summaryFromAtoms(atoms)
  return {
    nodeKind: "leaf",
    height: 0,
    atoms: [...atoms],
    summary,
    fingerprint: fingerprint({ contractVersion: 2, nodeKind: "leaf", atomFingerprints: atoms.map((atom) => atom.fingerprint), summary }),
  }
}

function branch(children: readonly VNextTextBlockPersistentFlowNodeV2[]): VNextTextBlockPersistentFlowBranchV2 {
  if (children.length === 0 || children.some((child) => child.height !== children[0]!.height)) {
    throw new RangeError("persistent flow branch requires equal-height children")
  }
  const summary = summaryFromChildren(children)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children: [...children],
    summary,
    fingerprint: fingerprint({ contractVersion: 2, nodeKind: "branch", childFingerprints: children.map((child) => child.fingerprint), summary }),
  }
}

function textAtom(input: {
  source: Extract<VNextTextBlockInitialFlowAtomV1, { kind: "text" | "resolved-field" | "generated-page-number" }>
  shapingRun: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]
  cluster: VNextTextBlockFlowEvidenceV2["shapingRuns"][number]["clusters"][number]
  face: VNextTextBlockFlowEvidenceV2["fontFaces"][number]
}): VNextTextBlockPersistentFlowAtomV2 | null {
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
  if (ascent.status !== "accepted" || descent.status !== "accepted" || lineGap.status !== "accepted") return null
  const facts = {
    kind: "text-cluster" as const,
    inlineId: input.source.inlineId,
    sourceKind: input.source.kind,
    ...(input.source.kind === "resolved-field" ? { fieldKey: input.source.fieldKey } : {}),
    ...(input.source.kind === "generated-page-number" ? { generatedOwnerFingerprint: input.source.generatedOwnerFingerprint } : {}),
    renderStartOffset: input.cluster.renderStartOffset,
    renderEndOffset: input.cluster.renderEndOffset,
    renderedText: input.shapingRun.text.slice(
      input.cluster.renderStartOffset - input.shapingRun.renderStartOffset,
      input.cluster.renderEndOffset - input.shapingRun.renderStartOffset,
    ),
    shapingRunId: input.shapingRun.shapingRunId,
    styleKey: input.shapingRun.styleKey,
    fontFaceId: input.shapingRun.fontFaceId,
    fontSizeLayoutUnit: input.shapingRun.fontSizeLayoutUnit,
    textColor: input.shapingRun.textColor,
    advanceLayoutUnit: input.cluster.advanceLayoutUnit,
    ascentLayoutUnit: ascent.layoutUnit,
    descentLayoutUnit: descent.layoutUnit === 0 ? 0 : -descent.layoutUnit,
    lineGapLayoutUnit: lineGap.layoutUnit,
  }
  const dependencyFingerprint = fingerprint({
    inlineId: facts.inlineId,
    sourceKind: facts.sourceKind,
    styleKey: facts.styleKey,
    fontFaceId: facts.fontFaceId,
    fontSizeLayoutUnit: facts.fontSizeLayoutUnit,
    textColor: facts.textColor,
  })
  return { ...facts, dependencyFingerprint, fingerprint: fingerprint({ contractVersion: 2, ...facts, dependencyFingerprint }) }
}

function imageAtom(source: Extract<VNextTextBlockInitialFlowAtomV1, { kind: "inline-image" }>): VNextTextBlockPersistentFlowAtomV2 | null {
  if (source.assetId == null) return null
  const width = convertVNextPositiveUnitValueToLayoutUnitV1(source.frame.width, "inline-image.frame.width")
  const height = convertVNextPositiveUnitValueToLayoutUnitV1(source.frame.height, "inline-image.frame.height")
  if (width.status !== "accepted" || height.status !== "accepted") return null
  const facts = {
    kind: "inline-image" as const,
    inlineId: source.inlineId,
    assetId: source.assetId,
    renderStartOffset: source.renderStartOffset,
    renderEndOffset: source.renderEndOffset,
    renderedText: "\uFFFC" as const,
    widthLayoutUnit: width.layoutUnit,
    heightLayoutUnit: height.layoutUnit,
    authoredFrame: source.frame,
    verticalAlign: source.verticalAlign,
    alignmentPolicyFingerprint: VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
  }
  const dependencyFingerprint = fingerprint({
    inlineId: facts.inlineId,
    assetId: facts.assetId,
    authoredFrame: facts.authoredFrame,
    verticalAlign: facts.verticalAlign,
    alignmentPolicyFingerprint: facts.alignmentPolicyFingerprint,
  })
  return { ...facts, dependencyFingerprint, fingerprint: fingerprint({ contractVersion: 2, ...facts, dependencyFingerprint }) }
}

function atomsFromEvidence(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
}): { atoms: VNextTextBlockPersistentFlowAtomV2[]; counts: VNextTextBlockPersistentFlowTreeV2["itemsByKind"] } | VNextTextBlockPersistentFlowBuildResultV2 {
  const atoms: VNextTextBlockPersistentFlowAtomV2[] = []
  const counts = { "text-cluster": 0, "hard-break": 0, "inline-image": 0 }
  const faces = new Map(input.evidence.fontFaces.map((face) => [face.fontFaceId, face]))
  let shapingRunIndex = 0
  for (const source of input.initialFlow.atoms) {
    if (source.kind === "inline-image") {
      const atom = imageAtom(source)
      if (atom == null) return blocked(
        source.assetId == null ? "unresolved-inline-image" : "unsafe-layout-arithmetic",
        source.assetId == null
          ? "persistent V2 flow requires a resolved inline image asset"
          : "persistent V2 flow requires safe positive inline image dimensions",
      )
      atoms.push(atom)
      counts[atom.kind] += 1
      continue
    }
    if (source.kind === "hard-break") {
      if (source.renderedText !== "\n" && source.renderedText !== "\r" && source.renderedText !== "\r\n") {
        return blocked("invalid-source-topology", "hard-break atoms require a canonical newline source slot")
      }
      const facts = {
        kind: "hard-break" as const,
        inlineId: source.inlineId,
        renderStartOffset: source.renderStartOffset,
        renderEndOffset: source.renderEndOffset,
        renderedText: source.renderedText,
      }
      atoms.push({ ...facts, fingerprint: fingerprint({ contractVersion: 2, ...facts }) })
      counts["hard-break"] += 1
      continue
    }
    while (
      shapingRunIndex < input.evidence.shapingRuns.length
      && input.evidence.shapingRuns[shapingRunIndex]!.renderEndOffset <= source.renderStartOffset
    ) shapingRunIndex += 1
    while (
      shapingRunIndex < input.evidence.shapingRuns.length
      && input.evidence.shapingRuns[shapingRunIndex]!.renderStartOffset < source.renderEndOffset
    ) {
      const shapingRun = input.evidence.shapingRuns[shapingRunIndex]!
      if (
        shapingRun.renderStartOffset < source.renderStartOffset
        || shapingRun.renderEndOffset > source.renderEndOffset
      ) return blocked("invalid-source-topology", "shaping runs must not cross a text source atom boundary")
      const face = faces.get(shapingRun.fontFaceId)
      if (face == null) return blocked("invalid-source-topology", "shaping run font face is not retained by evidence")
      for (const cluster of shapingRun.clusters) {
        if (
          cluster.renderStartOffset < source.renderStartOffset
          || cluster.renderEndOffset > source.renderEndOffset
        ) return blocked("invalid-source-topology", "shaping clusters must remain within one text source atom")
        const atom = textAtom({ source, shapingRun, cluster, face })
        if (atom == null) return blocked("unsafe-layout-arithmetic", "font metrics exceed safe layout-unit arithmetic")
        atoms.push(atom)
        counts["text-cluster"] += 1
      }
      shapingRunIndex += 1
    }
  }
  if (shapingRunIndex !== input.evidence.shapingRuns.length) {
    return blocked("invalid-source-topology", "evidence shaping runs exceed the Initial Flow text source slots")
  }
  return { atoms, counts }
}

export function createVNextTextBlockPersistentFlowTreeV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  bindProductionLayout?: boolean
}): VNextTextBlockPersistentFlowBuildResultV2
export function createVNextTextBlockPersistentFlowTreeV2(input: unknown): VNextTextBlockPersistentFlowBuildResultV2
export function createVNextTextBlockPersistentFlowTreeV2(input: unknown): VNextTextBlockPersistentFlowBuildResultV2 {
  const envelope = exactInput(input)
  if (envelope == null || (envelope.bindProductionLayout != null && typeof envelope.bindProductionLayout !== "boolean")) {
    return blocked("invalid-input", "persistent V2 flow requires an exact accessor-free data envelope")
  }
  if (envelope.bindProductionLayout === true) return blocked(
    "production-binding-forbidden",
    "persistent V2 flow cannot bind production layout",
  )
  const initialInspection = inspectVNextTextBlockInitialFlowV1(envelope.initialFlow)
  if (initialInspection.status !== "valid") return blocked(
    "initial-flow-provenance-mismatch",
    initialInspection.message,
  )
  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const evidence = envelope.evidence as VNextTextBlockFlowEvidenceV2
  if (!hasVNextTextBlockFlowEvidenceBindingInternalV2(evidence, initialFlow)) return blocked(
    "flow-evidence-provenance-mismatch",
    "persistent V2 flow requires exact evidence registered against this exact Initial Flow",
  )
  if (evidence.initialFlowFingerprint !== initialFlow.fingerprint) return blocked(
    "flow-evidence-binding-mismatch",
    "persistent V2 flow evidence must retain the exact Initial Flow fingerprint",
  )
  const projected = atomsFromEvidence({ initialFlow, evidence })
  if ("status" in projected) return projected
  try {
    const leaves = partitionVNextTextBlockPersistentValuesKernelV1(
      projected.atoms,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems,
    ).map(leaf)
    if (leaves.length === 0) return blocked("invalid-source-topology", "persistent V2 flow requires at least one atom")
    const root = buildVNextTextBlockPersistentRopeRootKernelV1<VNextTextBlockPersistentFlowNodeV2>({
      leaves,
      maximumBranchChildren: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren,
      createBranch: branch,
    })
    const facts = {
      source: "vnext-text-block-persistent-flow-tree-v2" as const,
      contractVersion: 2 as const,
      documentId: initialFlow.documentId,
      sectionId: initialFlow.sectionId,
      textBlockId: initialFlow.textBlockId,
      instanceRevision: initialFlow.instanceRevision,
      layoutId: evidence.layoutId,
      layoutContextFingerprint: fingerprint({
        layoutId: evidence.layoutId,
        layoutUnitPolicyFingerprint: evidence.layoutUnitPolicyFingerprint,
        availableWidthLayoutUnit: evidence.availableWidthLayoutUnit,
        declaredLineHeightLayoutUnit: evidence.declaredLineHeightLayoutUnit,
        paragraphStyle: evidence.paragraphStyle,
        fontFaces: evidence.fontFaces,
      }),
      initialFlowFingerprint: initialFlow.fingerprint,
      flowEvidenceFingerprint: evidence.fingerprint,
      policy: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
      root,
      summary: root.summary,
      itemsByKind: { ...projected.counts },
      contracts: {
        closedFlowAtomUnion: true as const,
        balancedLeafDepth: true as const,
        sharedPersistentRopeKernel: true as const,
        processLocalImmutableTree: true as const,
        suffixReuseClaim: false as const,
        reconvergenceClaim: false as const,
        stagedEditorApply: false as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
    }
    const tree = deepFreeze({
      ...facts,
      fingerprint: fingerprint({
        source: facts.source,
        contractVersion: facts.contractVersion,
        documentId: facts.documentId,
        sectionId: facts.sectionId,
        textBlockId: facts.textBlockId,
        instanceRevision: facts.instanceRevision,
        layoutId: facts.layoutId,
        layoutContextFingerprint: facts.layoutContextFingerprint,
        initialFlowFingerprint: facts.initialFlowFingerprint,
        flowEvidenceFingerprint: facts.flowEvidenceFingerprint,
        policyFingerprint: facts.policy.fingerprint,
        rootFingerprint: facts.root.fingerprint,
        summary: facts.summary,
        itemsByKind: facts.itemsByKind,
        contracts: facts.contracts,
      }),
    })
    registerVNextTextBlockV2LayoutAuthorityInternalV1({ initialFlow, evidence, persistentFlowTree: tree })
    processLocalTrees.set(tree, { initialFlow, evidence })
    return { status: "accepted", tree, issues: [] }
  } catch {
    return blocked("unsafe-layout-arithmetic", "persistent V2 flow tree exceeds safe layout arithmetic")
  }
}

export function inspectVNextTextBlockPersistentFlowTreeV2(tree: unknown):
  | { status: "valid"; fingerprint: string }
  | { status: "invalid"; code: "tree-provenance-mismatch" | "tree-not-deeply-frozen"; message: string } {
  if (tree == null || typeof tree !== "object" || !processLocalTrees.has(tree as VNextTextBlockPersistentFlowTreeV2)) {
    return { status: "invalid", code: "tree-provenance-mismatch", message: "tree is not the exact process-local V2 Core object" }
  }
  if (!deeplyFrozen(tree)) return { status: "invalid", code: "tree-not-deeply-frozen", message: "registered V2 persistent tree must remain recursively frozen" }
  return { status: "valid", fingerprint: (tree as VNextTextBlockPersistentFlowTreeV2).fingerprint }
}

export function collectVNextTextBlockPersistentFlowNodesForQaV2(
  tree: VNextTextBlockPersistentFlowTreeV2,
): readonly VNextTextBlockPersistentFlowNodeV2[] {
  return collectVNextTextBlockPersistentRopeNodesKernelV1({
    root: tree.root,
    children: (node) => node.nodeKind === "branch" ? node.children : [],
  })
}
