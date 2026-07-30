import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  convertVNextPositiveUnitValueToLayoutUnitV1,
} from "./layoutUnitPolicyV1.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION,
  type VNextTextBlockUnifiedLayoutSourceBranchV1,
  type VNextTextBlockUnifiedLayoutSourceItemV1,
  type VNextTextBlockUnifiedLayoutSourceLeafV1,
  type VNextTextBlockUnifiedLayoutSourceLookupResultV1,
  type VNextTextBlockUnifiedLayoutSourceNodeV1,
  type VNextTextBlockUnifiedLayoutSourceStateBuildResultV1,
  type VNextTextBlockUnifiedLayoutSourceStateInspectionV1,
  type VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1,
  type VNextTextBlockUnifiedLayoutSourceStatePolicyV1,
  type VNextTextBlockUnifiedLayoutSourceStateV1,
  type VNextTextBlockUnifiedLayoutSourceStyleV1,
  type VNextTextBlockUnifiedLayoutSourceSummaryV1,
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

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1:
VNextTextBlockUnifiedLayoutSourceStatePolicyV1 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(policyFacts),
  ),
})

const preparedStates = new WeakMap<
VNextTextBlockUnifiedLayoutSourceStateV1,
{
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly fingerprintFactory: FingerprintFactory
}
>()
const statesByEvidence = new WeakMap<
VNextTextBlockFlowEvidenceV2,
WeakSet<VNextTextBlockUnifiedLayoutSourceStateV1>
>()
const statesByInitialFlow = new WeakMap<
VNextTextBlockInitialFlowV1,
WeakSet<VNextTextBlockUnifiedLayoutSourceStateV1>
>()

function fingerprintWith(
  factory: FingerprintFactory,
  value: unknown,
): string {
  return factory(stringifyVNextCanonicalJson(value))
}

function defaultFingerprint(canonicalFacts: string): string {
  return createVNextCompactFingerprint(canonicalFacts)
}

function forcedCollisionFingerprint(_canonicalFacts: string): string {
  return FORCED_COLLISION_FINGERPRINT
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
  readonly initialFlow: unknown
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
      || !keys.includes("initialFlow")
      || !keys.includes("evidence")
    ) return null
    const initialFlow = Object.getOwnPropertyDescriptor(value, "initialFlow")
    const evidence = Object.getOwnPropertyDescriptor(value, "evidence")
    if (
      initialFlow == null
      || evidence == null
      || !Object.hasOwn(initialFlow, "value")
      || !Object.hasOwn(evidence, "value")
      || initialFlow.enumerable !== true
      || evidence.enumerable !== true
    ) return null
    return {
      initialFlow: initialFlow.value,
      evidence: evidence.value,
    }
  } catch {
    return null
  }
}

function blocked(
  code: VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1,
  message: string,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return Object.freeze({
    status: "blocked",
    sourceState: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([{ code, message }]),
  })
}

function safeAdd(left: number, right: number): number {
  const value = left + right
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("source-state summary exceeded safe integer arithmetic")
  }
  return value
}

function canonicalGroups<T>(
  values: readonly T[],
  maximumValues: number,
): readonly (readonly T[])[] {
  if (
    !Number.isSafeInteger(maximumValues)
    || maximumValues !== 8
  ) {
    throw new RangeError("source-state packing requires the locked eight-way policy")
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

function styleFromAtom(
  atom: Extract<VNextTextBlockInitialFlowAtomV1, {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>,
): VNextTextBlockUnifiedLayoutSourceStyleV1 {
  const style = atom.resolvedGeometryStyle
  return {
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    textColor: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
    authoredLocalStyle: atom.kind === "text" && atom.localStyle != null
      ? structuredClone(atom.localStyle)
      : null,
  }
}

function textSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "text" | "resolved-field" | "generated-page-number"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 {
  const { initialFlow, atom } = input
  const style = styleFromAtom(atom)
  const semanticFacts = {
    kind: atom.kind,
    inlineId: atom.inlineId,
    ...(atom.kind === "resolved-field" ? { fieldKey: atom.fieldKey } : {}),
    ...(atom.kind === "generated-page-number"
      ? { generatedOwnerFingerprint: atom.generatedOwnerFingerprint }
      : {}),
  }
  const contentFacts = {
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
  }
  const sourceFacts = {
    ...semanticFacts,
    authoredLocalStyleWithoutPaint: style.authoredLocalStyle == null
      ? null
      : {
          fontSize: style.authoredLocalStyle.fontSize ?? null,
          fontFamilyKey: style.authoredLocalStyle.fontFamilyKey ?? null,
          fontWeight: style.authoredLocalStyle.fontWeight ?? null,
          fontStyle: style.authoredLocalStyle.fontStyle ?? null,
        },
  }
  const provenanceFacts = {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
    sourceKind: atom.kind,
  }
  const paintFacts = {
    textColor: style.textColor,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
    authoredTextColor: style.authoredLocalStyle?.textColor ?? null,
  }
  const layoutDependencyFacts = {
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
  }
  const common = {
    lineageId: `${atom.kind}:${atom.inlineId}`,
    inlineId: atom.inlineId,
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
    semanticFingerprint: fingerprintWith(factory, semanticFacts),
    contentFingerprint: fingerprintWith(factory, contentFacts),
    sourceFingerprint: fingerprintWith(factory, sourceFacts),
    provenanceFingerprint: fingerprintWith(factory, provenanceFacts),
    paintFingerprint: fingerprintWith(factory, paintFacts),
    layoutDependencyFingerprint: fingerprintWith(
      factory,
      layoutDependencyFacts,
    ),
    boundaryFingerprint: fingerprintWith(factory, {
      kind: "text-bearing",
      inlineId: atom.inlineId,
    }),
  }
  const variant = atom.kind === "resolved-field"
    ? { kind: atom.kind, fieldKey: atom.fieldKey, style }
    : atom.kind === "generated-page-number"
      ? {
          kind: atom.kind,
          generatedOwnerFingerprint: atom.generatedOwnerFingerprint,
          style,
        }
      : { kind: atom.kind, style }
  return {
    ...common,
    ...variant,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...common,
      ...variant,
    }),
  }
}

function hardBreakSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "hard-break"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  const { atom, initialFlow } = input
  if (
    atom.renderedText !== "\n"
    && atom.renderedText !== "\r"
    && atom.renderedText !== "\r\n"
  ) return null
  const semanticFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
  })
  const contentFingerprint = fingerprintWith(factory, {
    renderedText: atom.renderedText,
  })
  const sourceFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
  })
  const provenanceFingerprint = fingerprintWith(factory, {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
  })
  const paintFingerprint = fingerprintWith(factory, {
    paint: "none",
  })
  const layoutDependencyFingerprint = fingerprintWith(factory, {
    mandatoryBreak: true,
  })
  const boundaryFingerprint = fingerprintWith(factory, {
    kind: "hard-break",
    renderedUtf16Length: atom.renderedText.length,
  })
  const facts = {
    lineageId: `hard-break:${atom.inlineId}`,
    inlineId: atom.inlineId,
    kind: "hard-break" as const,
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
    semanticFingerprint,
    contentFingerprint,
    sourceFingerprint,
    provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint,
    boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function imageSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "inline-image"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  const { atom, initialFlow } = input
  if (atom.assetId == null || atom.renderedText !== "\uFFFC") return null
  const width = convertVNextPositiveUnitValueToLayoutUnitV1(
    atom.frame.width,
    "inlineImage.frame.width",
  )
  const height = convertVNextPositiveUnitValueToLayoutUnitV1(
    atom.frame.height,
    "inlineImage.frame.height",
  )
  if (width.status !== "accepted" || height.status !== "accepted") return null
  const semanticFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
    assetId: atom.assetId,
  })
  const contentFingerprint = fingerprintWith(factory, {
    renderedText: "\uFFFC",
  })
  const sourceFingerprint = fingerprintWith(factory, {
    inlineId: atom.inlineId,
    assetId: atom.assetId,
  })
  const provenanceFingerprint = fingerprintWith(factory, {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
  })
  const paintFingerprint = fingerprintWith(factory, {
    assetId: atom.assetId,
    fit: atom.frame.fit,
    crop: atom.frame.crop ?? null,
  })
  const layoutDependencyFingerprint = fingerprintWith(factory, {
    widthLayoutUnit: width.layoutUnit,
    heightLayoutUnit: height.layoutUnit,
    verticalAlign: atom.verticalAlign,
  })
  const boundaryFingerprint = fingerprintWith(factory, {
    kind: "inline-image-boundary",
    renderedUtf16Length: 1,
  })
  const facts = {
    lineageId: `inline-image:${atom.inlineId}`,
    inlineId: atom.inlineId,
    kind: "inline-image" as const,
    renderedText: "\uFFFC" as const,
    renderedUtf16Length: 1,
    assetId: atom.assetId,
    authoredFrame: structuredClone(atom.frame),
    verticalAlign: atom.verticalAlign,
    semanticFingerprint,
    contentFingerprint,
    sourceFingerprint,
    provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint,
    boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function sourceItems(
  initialFlow: VNextTextBlockInitialFlowV1,
  factory: FingerprintFactory,
): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] | null {
  const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  for (const atom of initialFlow.atoms) {
    const item = atom.kind === "hard-break"
      ? hardBreakSourceItem({ initialFlow, atom }, factory)
      : atom.kind === "inline-image"
        ? imageSourceItem({ initialFlow, atom }, factory)
        : textSourceItem({ initialFlow, atom }, factory)
    if (item == null) return null
    items.push(item)
  }
  return items
}

function summaryFromItems(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceSummaryV1 {
  let renderedUtf16Length = 0
  let textBearingItemCount = 0
  let hardBreakItemCount = 0
  let inlineImageItemCount = 0
  for (const item of items) {
    renderedUtf16Length = safeAdd(
      renderedUtf16Length,
      item.renderedUtf16Length,
    )
    if (item.kind === "hard-break") hardBreakItemCount += 1
    else if (item.kind === "inline-image") inlineImageItemCount += 1
    else textBearingItemCount += 1
  }
  return {
    renderedUtf16Length,
    itemCount: items.length,
    leafCount: 1,
    nodeCount: 1,
    textBearingItemCount,
    hardBreakItemCount,
    inlineImageItemCount,
    semanticFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.semanticFingerprint),
    }),
    contentFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.contentFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.provenanceFingerprint),
    }),
    paintFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.paintFingerprint),
    }),
    layoutDependencyFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.layoutDependencyFingerprint),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.boundaryFingerprint),
    }),
  }
}

function summaryFromChildren(
  children: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceSummaryV1 {
  const counts = {
    renderedUtf16Length: 0,
    itemCount: 0,
    leafCount: 0,
    nodeCount: 1,
    textBearingItemCount: 0,
    hardBreakItemCount: 0,
    inlineImageItemCount: 0,
  }
  for (const child of children) {
    counts.renderedUtf16Length = safeAdd(
      counts.renderedUtf16Length,
      child.summary.renderedUtf16Length,
    )
    counts.itemCount = safeAdd(counts.itemCount, child.summary.itemCount)
    counts.leafCount = safeAdd(counts.leafCount, child.summary.leafCount)
    counts.nodeCount = safeAdd(counts.nodeCount, child.summary.nodeCount)
    counts.textBearingItemCount = safeAdd(
      counts.textBearingItemCount,
      child.summary.textBearingItemCount,
    )
    counts.hardBreakItemCount = safeAdd(
      counts.hardBreakItemCount,
      child.summary.hardBreakItemCount,
    )
    counts.inlineImageItemCount = safeAdd(
      counts.inlineImageItemCount,
      child.summary.inlineImageItemCount,
    )
  }
  return {
    ...counts,
    semanticFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.semanticFingerprint),
    }),
    contentFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.contentFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.provenanceFingerprint),
    }),
    paintFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.paintFingerprint),
    }),
    layoutDependencyFingerprint: fingerprintWith(factory, {
      children: children.map(
        (child) => child.summary.layoutDependencyFingerprint,
      ),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.boundaryFingerprint),
    }),
  }
}

function leaf(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceLeafV1 {
  if (items.length < 1 || items.length > 8) {
    throw new RangeError("source-state leaf requires one to eight items")
  }
  const summary = summaryFromItems(items, factory)
  return {
    nodeKind: "leaf",
    height: 0,
    items: [...items],
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      nodeKind: "leaf",
      itemFingerprints: items.map((item) => item.fingerprint),
      summary,
    }),
  }
}

function branch(
  children: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceBranchV1 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]?.height)
  ) {
    throw new RangeError("source-state branch requires two to eight equal-height children")
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
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceNodeV1 {
  let level: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[] =
    canonicalGroups(items, 8).map((group) => leaf(group, factory))
  if (level.length === 0) {
    throw new RangeError("source-state requires at least one source item")
  }
  while (level.length > 1) {
    level = canonicalGroups(level, 8).map((group) => branch(group, factory))
  }
  return level[0]!
}

function stateCanonicalFacts(
  state: VNextTextBlockUnifiedLayoutSourceStateV1,
): unknown {
  return {
    source: state.source,
    contractVersion: state.contractVersion,
    documentId: state.documentId,
    sectionId: state.sectionId,
    textBlockId: state.textBlockId,
    instanceRevision: state.instanceRevision,
    initialFlowFingerprint: state.initialFlowFingerprint,
    flowEvidenceFingerprint: state.flowEvidenceFingerprint,
    authoredBoxPlanFingerprint: state.authoredBoxPlan.fingerprint,
    producerRequirements: state.producerRequirements,
    policyFingerprint: state.policy.fingerprint,
    rootFingerprint: state.root.fingerprint,
    summary: state.summary,
    work: state.work,
    contracts: state.contracts,
    mayPublishLayout: state.mayPublishLayout,
    productionBinding: state.productionBinding,
  }
}

function buildComplete(
  input: unknown,
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  const envelope = exactInput(input)
  if (envelope == null) {
    return blocked(
      "invalid-input",
      "source-state construction requires an exact accessor-free two-field envelope",
    )
  }
  const initialInspection = inspectVNextTextBlockInitialFlowV1(
    envelope.initialFlow,
  )
  if (initialInspection.status !== "valid") {
    return blocked("initial-flow-authority-mismatch", initialInspection.message)
  }
  const evidenceInspection = inspectVNextTextBlockFlowEvidenceV2(
    envelope.evidence,
  )
  if (evidenceInspection.status !== "valid") {
    return blocked("flow-evidence-authority-mismatch", evidenceInspection.message)
  }
  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const evidence = envelope.evidence as VNextTextBlockFlowEvidenceV2
  if (!hasVNextTextBlockFlowEvidenceBindingInternalV2(evidence, initialFlow)) {
    return blocked(
      "flow-evidence-binding-mismatch",
      "source-state construction requires evidence registered to the exact Initial Flow",
    )
  }
  if (evidence.initialFlowFingerprint !== initialFlow.fingerprint) {
    return blocked(
      "flow-evidence-binding-mismatch",
      "source-state evidence does not retain the exact Initial Flow fingerprint",
    )
  }

  try {
    const items = sourceItems(initialFlow, factory)
    if (items == null || items.length === 0) {
      return blocked(
        items == null ? "unresolved-inline-image" : "invalid-source-topology",
        items == null
          ? "source state requires resolved, safe inline-image source facts"
          : "source state requires at least one source item",
      )
    }
    const root = buildRoot(items, factory)
    const producerRequirementFacts = {
      layoutId: evidence.layoutId,
      layoutUnitPolicyFingerprint: evidence.layoutUnitPolicyFingerprint,
      availableWidthLayoutUnit: evidence.availableWidthLayoutUnit,
      declaredLineHeightLayoutUnit: evidence.declaredLineHeightLayoutUnit,
      paragraphFontFamilyKey: initialFlow.paragraphFontFamilyKey,
      paragraphStyle: structuredClone(evidence.paragraphStyle),
      fontFaces: structuredClone(initialFlow.fontFaces),
    }
    const producerRequirements = {
      ...producerRequirementFacts,
      fontStyleUnitDependencyFingerprint: fingerprintWith(factory, {
        layoutUnitPolicyFingerprint:
          producerRequirementFacts.layoutUnitPolicyFingerprint,
        declaredLineHeightLayoutUnit:
          producerRequirementFacts.declaredLineHeightLayoutUnit,
        paragraphFontFamilyKey:
          producerRequirementFacts.paragraphFontFamilyKey,
        paragraphStyle: producerRequirementFacts.paragraphStyle,
        fontFaces: producerRequirementFacts.fontFaces,
      }),
      producerRuntimeRequirementFingerprint: fingerprintWith(factory, {
        source: evidence.source,
        contractVersion: evidence.contractVersion,
        layoutId: evidence.layoutId,
        fontFaces: producerRequirementFacts.fontFaces.map((face) => ({
          fontFaceId: face.fontFaceId,
          fontSha256: face.fontSha256,
          weight: face.weight,
          style: face.style,
        })),
        layoutUnitPolicyFingerprint:
          producerRequirementFacts.layoutUnitPolicyFingerprint,
      }),
    }
    const work = {
      completeBuildCount: 1 as const,
      visitedInitialFlowAtomCount: initialFlow.atoms.length,
      createdItemCount: items.length,
      createdLeafCount: root.summary.leafCount,
      createdNodeCount: root.summary.nodeCount,
      reusedItemCount: 0 as const,
      reusedNodeCount: 0 as const,
      completeSuffixTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE,
      contractVersion:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION,
      documentId: initialFlow.documentId,
      sectionId: initialFlow.sectionId,
      textBlockId: initialFlow.textBlockId,
      instanceRevision: initialFlow.instanceRevision,
      initialFlowFingerprint: initialFlow.fingerprint,
      flowEvidenceFingerprint: evidence.fingerprint,
      authoredBoxPlan: initialFlow.authoredBoxPlan,
      producerRequirements,
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
      root,
      summary: root.summary,
      work,
      contracts: {
        offsetIndependentItems: true as const,
        sourceAndPaintSeparatedFromLayoutFlow: true as const,
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
      stateCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      }),
    )
    const sourceState = Object.freeze({
      ...withoutFingerprint,
      fingerprint: factory(canonicalFacts),
    })
    preparedStates.set(sourceState, {
      fingerprint: sourceState.fingerprint,
      canonicalFacts,
      fingerprintFactory: factory,
    })
    const evidenceStates = statesByEvidence.get(evidence) ?? new WeakSet()
    evidenceStates.add(sourceState)
    statesByEvidence.set(evidence, evidenceStates)
    const initialStates = statesByInitialFlow.get(initialFlow) ?? new WeakSet()
    initialStates.add(sourceState)
    statesByInitialFlow.set(initialFlow, initialStates)
    return Object.freeze({
      status: "prepared",
      sourceState,
      work: sourceState.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blocked(
      "unsafe-source-summary",
      "source-state construction exceeded safe canonical or summary arithmetic",
    )
  }
}

export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1
export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1
export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return buildComplete(input, defaultFingerprint)
}

export function createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return buildComplete(input, forcedCollisionFingerprint)
}

export function hasVNextTextBlockUnifiedLayoutSourceStatePreparedBindingInternalV1(
  sourceState: unknown,
  evidence: unknown,
): sourceState is VNextTextBlockUnifiedLayoutSourceStateV1 {
  return sourceState != null
    && typeof sourceState === "object"
    && evidence != null
    && typeof evidence === "object"
    && preparedStates.has(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    )
    && statesByEvidence.get(
      evidence as VNextTextBlockFlowEvidenceV2,
    )?.has(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    ) === true
}

export function inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutSourceStateInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !preparedStates.has(
      value as VNextTextBlockUnifiedLayoutSourceStateV1,
    )
  ) {
    return {
      status: "invalid",
      code: "source-state-authority-mismatch",
      message: "source state is not the exact process-local prepared candidate",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "source-state-not-deeply-frozen",
      message: "prepared source state must remain recursively frozen",
    }
  }
  try {
    const sourceState = value as VNextTextBlockUnifiedLayoutSourceStateV1
    const stored = preparedStates.get(sourceState)!
    const canonicalFacts = stringifyVNextCanonicalJson(
      stateCanonicalFacts(sourceState),
    )
    if (
      canonicalFacts !== stored.canonicalFacts
      || sourceState.fingerprint !== stored.fingerprint
      || sourceState.fingerprint !== stored.fingerprintFactory(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "source-state-canonical-facts-mismatch",
        message: "prepared source state no longer matches its canonical facts",
      }
    }
    return {
      status: "prepared-unregistered",
      fingerprint: sourceState.fingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "source-state-canonical-facts-mismatch",
      message: "prepared source state is not canonically inspectable",
    }
  }
}

export function lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly renderedUtf16Offset: number
}): VNextTextBlockUnifiedLayoutSourceLookupResultV1 {
  const inspection = inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
    input.sourceState,
  )
  if (inspection.status !== "prepared-unregistered") {
    return {
      status: "blocked",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: null,
      issues: [{
        code: "initial-flow-authority-mismatch",
        message: inspection.message,
      }],
    }
  }
  if (
    !Number.isSafeInteger(input.renderedUtf16Offset)
    || input.renderedUtf16Offset < 0
    || input.renderedUtf16Offset >= input.sourceState.summary.renderedUtf16Length
  ) {
    return {
      status: "not-found",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: {
        visitedNodeCount: 0,
        completeTreeTraversalCount: 0,
      },
    }
  }

  let node = input.sourceState.root
  let relativeOffset = input.renderedUtf16Offset
  let absoluteBase = 0
  let visitedNodeCount = 1
  while (node.nodeKind === "branch") {
    let selected: VNextTextBlockUnifiedLayoutSourceNodeV1 | null = null
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
    for (const item of node.items) {
      if (relativeOffset < item.renderedUtf16Length) {
        return {
          status: "found",
          item,
          absoluteStartRenderedUtf16: absoluteBase,
          absoluteEndRenderedUtf16:
            absoluteBase + item.renderedUtf16Length,
          work: {
            visitedNodeCount,
            completeTreeTraversalCount: 0,
          },
        }
      }
      relativeOffset -= item.renderedUtf16Length
      absoluteBase += item.renderedUtf16Length
    }
  }
  return {
    status: "not-found",
    item: null,
    absoluteStartRenderedUtf16: null,
    absoluteEndRenderedUtf16: null,
    work: {
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    },
  }
}
