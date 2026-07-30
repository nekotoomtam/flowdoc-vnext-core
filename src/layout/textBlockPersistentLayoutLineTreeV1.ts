import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  inspectVNextTextBlockAuthoredBoxGeometryV2,
} from "./textBlockAuthoredBoxGeometryV2.js"
import type {
  VNextTextBlockAuthoredBoxGeometryResultV2,
  VNextTextBlockAuthoredBoxLineV2,
} from "./textBlockAuthoredBoxGeometryContractV2.js"
import {
  hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1,
  inspectVNextTextBlockIncrementalFlowTreeInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import type {
  VNextTextBlockIncrementalFlowTreeV1,
} from "./textBlockIncrementalFlowTreeContractV1.js"
import type {
  VNextTextBlockMultiRunSourceSegmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_VERSION,
  type VNextTextBlockLineDispositionCoverInspectionV1,
  type VNextTextBlockLineDispositionCoverResultV1,
  type VNextTextBlockLineDispositionCoverV1,
  type VNextTextBlockLineDispositionIssueCodeV1,
  type VNextTextBlockLineDispositionIssueV1,
  type VNextTextBlockLineDispositionSegmentV1,
  type VNextTextBlockLineOrdinalRangeV1,
  type VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1,
  type VNextTextBlockPersistentLayoutContentLocalGeometryV1,
  type VNextTextBlockPersistentLayoutEmptyRootV1,
  type VNextTextBlockPersistentLayoutLineBranchV1,
  type VNextTextBlockPersistentLayoutLineFragmentInternalsV1,
  type VNextTextBlockPersistentLayoutLineInternalsV1,
  type VNextTextBlockPersistentLayoutLineLeafV1,
  type VNextTextBlockPersistentLayoutLineLookupResultV1,
  type VNextTextBlockPersistentLayoutLineNodeV1,
  type VNextTextBlockPersistentLayoutLineRootV1,
  type VNextTextBlockPersistentLayoutLineSummaryV1,
  type VNextTextBlockPersistentLayoutLineTreeBuildResultV1,
  type VNextTextBlockPersistentLayoutLineTreeInspectionV1,
  type VNextTextBlockPersistentLayoutLineTreeIssueCodeV1,
  type VNextTextBlockPersistentLayoutLineTreeIssueV1,
  type VNextTextBlockPersistentLayoutLineTreePolicyV1,
  type VNextTextBlockPersistentLayoutLineTreeV1,
  type VNextTextBlockPersistentLayoutLineV1,
  type VNextTextBlockPersistentLayoutSourceMappingV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import {
  inspectVNextTextBlockSpatialWrappingLayoutV2,
} from "./textBlockSpatialWrappingLayoutV2.js"
import type {
  VNextTextBlockSpatialFragmentV2,
  VNextTextBlockSpatialWrappedLineV2,
  VNextTextBlockSpatialWrappingLayoutResultV2,
} from "./textBlockSpatialWrappingLayoutContractV2.js"
import {
  hasVNextTextBlockUnifiedSpatialStatePreparedBindingInternalV1,
  verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1,
} from "./textBlockUnifiedSpatialStateV1.js"
import type {
  VNextTextBlockUnifiedSpatialStateV1,
} from "./textBlockUnifiedSpatialStateContractV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"

type AcceptedSpatialLayoutV2 = Extract<
  VNextTextBlockSpatialWrappingLayoutResultV2,
  { status: "accepted" }
>
type AcceptedAuthoredBoxGeometryV2 = Extract<
  VNextTextBlockAuthoredBoxGeometryResultV2,
  { status: "accepted" }
>

const policyFacts = {
  policyVersion: 1 as const,
  maximumBranchChildren: 8 as const,
  splitOverflowLeftCount: 4 as const,
  splitOverflowRightCount: 5 as const,
  underflowBorrowOrder: ["left", "right"] as const,
  underflowMergeOrder: ["left", "right"] as const,
  collapseUnaryRoot: true as const,
}

export const VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_POLICY_V1:
VNextTextBlockPersistentLayoutLineTreePolicyV1 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(policyFacts),
  ),
})

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
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
  fingerprint({ component, empty: true })

const emptySummary: VNextTextBlockPersistentLayoutLineSummaryV1 =
  deepFreeze({
    lineCount: 0,
    fragmentCount: 0,
    leafCount: 0,
    nodeCount: 1,
    sourceRange: { start: null, end: null },
    authoredTopLayoutUnit: null,
    authoredBottomLayoutUnit: null,
    lineInternalsFingerprint: emptyComponentFingerprint("line-internals"),
    sourceFingerprint: emptyComponentFingerprint("source"),
    provenanceFingerprint: emptyComponentFingerprint("provenance"),
    boundarySpatialContextFingerprint:
      emptyComponentFingerprint("boundary-spatial-context"),
    contentLocalGeometryFingerprint:
      emptyComponentFingerprint("content-local-geometry"),
    authoredBoxGeometryFingerprint:
      emptyComponentFingerprint("authored-box-geometry"),
    translatedGeometryFingerprint:
      emptyComponentFingerprint("translated-geometry"),
  })

export const VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_EMPTY_ROOT_V1:
VNextTextBlockPersistentLayoutEmptyRootV1 = deepFreeze({
  nodeKind: "empty",
  height: 0,
  summary: emptySummary,
  fingerprint: fingerprint({
    contractVersion: 1,
    nodeKind: "empty",
    summary: emptySummary,
  }),
})

const preparedTrees = new WeakMap<
  VNextTextBlockPersistentLayoutLineTreeV1,
  {
    readonly fingerprint: string
    readonly canonicalFacts: string
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
    readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  }
>()

const covers = new WeakMap<
  VNextTextBlockLineDispositionCoverV1,
  {
    readonly previousTree: VNextTextBlockPersistentLayoutLineTreeV1
    readonly nextTree: VNextTextBlockPersistentLayoutLineTreeV1
    readonly fingerprint: string
    readonly canonicalFacts: string
  }
>()
const registeredRootGraphTrees = new WeakSet<
VNextTextBlockPersistentLayoutLineTreeV1
>()

function treeIssue(
  code: VNextTextBlockPersistentLayoutLineTreeIssueCodeV1,
  message: string,
  lineOrdinal?: number,
): VNextTextBlockPersistentLayoutLineTreeIssueV1 {
  return {
    code,
    message,
    ...(lineOrdinal == null ? {} : { lineOrdinal }),
  }
}

function blockedTree(
  issue: VNextTextBlockPersistentLayoutLineTreeIssueV1,
): VNextTextBlockPersistentLayoutLineTreeBuildResultV1 {
  return Object.freeze({
    status: "blocked",
    lineTree: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([issue]),
  })
}

function dispositionIssue(
  code: VNextTextBlockLineDispositionIssueCodeV1,
  message: string,
): VNextTextBlockLineDispositionIssueV1 {
  return { code, message }
}

function blockedCover(
  code: VNextTextBlockLineDispositionIssueCodeV1,
  message: string,
): VNextTextBlockLineDispositionCoverResultV1 {
  return Object.freeze({
    status: "blocked",
    cover: null,
    issues: Object.freeze([dispositionIssue(code, message)]),
  })
}

function treeCanonicalFacts(
  tree: VNextTextBlockPersistentLayoutLineTreeV1,
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
    spatialContextFingerprint: tree.spatialContextFingerprint,
    authoredBoxPlanFingerprint: tree.authoredBoxPlanFingerprint,
    policy: tree.policy,
    root: tree.root,
    summary: tree.summary,
    work: tree.work,
    contracts: tree.contracts,
    mayPublishLayout: tree.mayPublishLayout,
    productionBinding: tree.productionBinding,
  }
}

function coverCanonicalFacts(
  cover: VNextTextBlockLineDispositionCoverV1,
): unknown {
  return {
    source: cover.source,
    contractVersion: cover.contractVersion,
    previousTreeFingerprint: cover.previousTreeFingerprint,
    nextTreeFingerprint: cover.nextTreeFingerprint,
    covers: cover.covers,
    counts: cover.counts,
    work: cover.work,
  }
}

function sourceMapping(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  segment: VNextTextBlockMultiRunSourceSegmentV1,
): VNextTextBlockPersistentLayoutSourceMappingV1 | null {
  const renderedLength = segment.renderEndOffset - segment.renderStartOffset
  if (
    !Number.isSafeInteger(renderedLength)
    || renderedLength <= 0
  ) return null
  const lookup = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
    sourceState,
    renderedUtf16Offset: segment.renderStartOffset,
  })
  if (lookup.status !== "found") return null
  const localStartRenderedUtf16 =
    segment.renderStartOffset - lookup.absoluteStartRenderedUtf16
  const localEndRenderedUtf16 =
    segment.renderEndOffset - lookup.absoluteStartRenderedUtf16
  if (
    lookup.item.inlineId !== segment.inlineId
    || localStartRenderedUtf16 < 0
    || localEndRenderedUtf16 <= localStartRenderedUtf16
    || localEndRenderedUtf16 > lookup.item.renderedUtf16Length
  ) return null
  const facts = {
    lineageId: lookup.item.lineageId,
    inlineId: lookup.item.inlineId,
    sourceKind: lookup.item.kind,
    localStartRenderedUtf16,
    localEndRenderedUtf16,
    sourceStartOffset: segment.sourceStartOffset,
    sourceEndOffset: segment.sourceEndOffset,
    renderedText: segment.renderedText,
    sourceFingerprint: lookup.item.sourceFingerprint,
    provenanceFingerprint: lookup.item.provenanceFingerprint,
    boundaryFingerprint: lookup.item.boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprint({
      contractVersion: 1,
      ...facts,
    }),
  }
}

function sourceMappings(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  segments: readonly VNextTextBlockMultiRunSourceSegmentV1[],
): readonly VNextTextBlockPersistentLayoutSourceMappingV1[] | null {
  const output: VNextTextBlockPersistentLayoutSourceMappingV1[] = []
  for (const segment of segments) {
    const mapped = sourceMapping(sourceState, segment)
    if (mapped == null) return null
    output.push(mapped)
  }
  return output
}

function fragmentSourceSpans(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  fragment: VNextTextBlockSpatialFragmentV2,
): readonly {
  readonly lineageId: string
  readonly localStartRenderedUtf16: number
  readonly localEndRenderedUtf16: number
}[] | null {
  const mappings = sourceMappings(sourceState, fragment.sourceSegments)
  return mappings?.map((mapping) => ({
    lineageId: mapping.lineageId,
    localStartRenderedUtf16: mapping.localStartRenderedUtf16,
    localEndRenderedUtf16: mapping.localEndRenderedUtf16,
  })) ?? null
}

function fragmentLineageId(
  fragmentKind: VNextTextBlockSpatialFragmentV2["kind"],
  sourceSpans: readonly {
    readonly lineageId: string
    readonly localStartRenderedUtf16: number
    readonly localEndRenderedUtf16: number
  }[],
): string {
  return fingerprint({
    kind: fragmentKind,
    mappings: sourceSpans,
  })
}

function lineInternalsFragment(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  fragment: VNextTextBlockSpatialFragmentV2,
): VNextTextBlockPersistentLayoutLineFragmentInternalsV1 | null {
  const sourceSpans = fragmentSourceSpans(sourceState, fragment)
  if (sourceSpans == null) return null
  const lineageId = fragmentLineageId(fragment.kind, sourceSpans)
  return fragment.kind === "text"
    ? {
        kind: "text",
        lineageId,
        sourceSpans,
        text: fragment.text,
        xLayoutUnit: fragment.xLayoutUnit,
        advanceLayoutUnit: fragment.advanceLayoutUnit,
        baselineShiftLayoutUnit: fragment.baselineShiftLayoutUnit,
        fontFaceId: fragment.fontFaceId,
        fontFamily: fragment.fontFamily,
        fontSha256: fragment.fontSha256,
        fontWeight: fragment.fontWeight,
        fontStyle: fragment.fontStyle,
        fontSizeLayoutUnit: fragment.fontSizeLayoutUnit,
        ascentLayoutUnit: fragment.ascentLayoutUnit,
        descentLayoutUnit: fragment.descentLayoutUnit,
        lineGapLayoutUnit: fragment.lineGapLayoutUnit,
      }
    : {
        kind: "inline-image",
        lineageId,
        sourceSpans,
        xLayoutUnit: fragment.xLayoutUnit,
        yLayoutUnit: fragment.yLayoutUnit,
        widthLayoutUnit: fragment.widthLayoutUnit,
        heightLayoutUnit: fragment.heightLayoutUnit,
        verticalAlign: fragment.verticalAlign,
        alignmentPolicyFingerprint: fragment.alignmentPolicyFingerprint,
      }
}

function lineInternals(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  line: VNextTextBlockSpatialWrappedLineV2,
  mappings: readonly VNextTextBlockPersistentLayoutSourceMappingV1[],
): VNextTextBlockPersistentLayoutLineInternalsV1 | null {
  const fragments: VNextTextBlockPersistentLayoutLineFragmentInternalsV1[] = []
  for (const fragment of line.fragments) {
    const projected = lineInternalsFragment(sourceState, fragment)
    if (projected == null) return null
    fragments.push(projected)
  }
  const facts = {
    lineageId: fingerprint({
      sourceRanges: mappings.map((mapping) => ({
        lineageId: mapping.lineageId,
        localStartRenderedUtf16: mapping.localStartRenderedUtf16,
        localEndRenderedUtf16: mapping.localEndRenderedUtf16,
        boundaryFingerprint: mapping.boundaryFingerprint,
      })),
      fragmentLineages: fragments.map((fragment) => fragment.lineageId),
    }),
    heightLayoutUnit: line.heightLayoutUnit,
    baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
    fragments,
  }
  return {
    ...facts,
    fingerprint: fingerprint({
      contractVersion: 1,
      ...facts,
    }),
  }
}

function contentLocalGeometry(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  line: VNextTextBlockSpatialWrappedLineV2,
): VNextTextBlockPersistentLayoutContentLocalGeometryV1 | null {
  const fragments: VNextTextBlockPersistentLayoutContentLocalGeometryV1[
    "fragments"
  ][number][] = []
  for (const fragment of line.fragments) {
    const sourceSpans = fragmentSourceSpans(sourceState, fragment)
    if (sourceSpans == null) return null
    const lineageId = fragmentLineageId(fragment.kind, sourceSpans)
    fragments.push(fragment.kind === "text"
      ? {
          kind: "text",
          lineageId,
          xLayoutUnit: fragment.xLayoutUnit,
          advanceLayoutUnit: fragment.advanceLayoutUnit,
        }
      : {
          kind: "inline-image",
          lineageId,
          xLayoutUnit: fragment.xLayoutUnit,
          yLayoutUnit: fragment.yLayoutUnit,
          widthLayoutUnit: fragment.widthLayoutUnit,
          heightLayoutUnit: fragment.heightLayoutUnit,
        })
  }
  const facts = {
    yOffsetLayoutUnit: line.yOffsetLayoutUnit,
    heightLayoutUnit: line.heightLayoutUnit,
    baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
    availableIntervals: line.availableIntervals.map((interval) => ({
      leftLayoutUnit: interval.startLayoutUnit,
      rightLayoutUnit: interval.endLayoutUnit,
    })),
    intervalPlacements: line.intervalPlacements.map((placement) => ({
      localStartRenderedUtf16:
        placement.renderStartOffset - line.renderStartOffset,
      localEndRenderedUtf16:
        placement.renderEndOffset - line.renderStartOffset,
      intervalOrdinal: placement.intervalIndex,
      leftLayoutUnit: placement.xStartLayoutUnit,
      rightLayoutUnit: placement.xEndLayoutUnit,
    })),
    fragments,
  }
  return {
    ...facts,
    fingerprint: fingerprint({
      contractVersion: 1,
      ...facts,
    }),
  }
}

function authoredBoxGeometry(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  spatialLine: VNextTextBlockSpatialWrappedLineV2,
  authoredLine: VNextTextBlockAuthoredBoxLineV2,
): VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1 | null {
  if (spatialLine.fragments.length !== authoredLine.fragments.length) return null
  const fragments: VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1[
    "fragments"
  ][number][] = []
  for (const fragment of authoredLine.fragments) {
    const sourceSpans = fragmentSourceSpans(sourceState, fragment)
    if (sourceSpans == null) return null
    const lineageId = fragmentLineageId(fragment.kind, sourceSpans)
    fragments.push(fragment.kind === "text"
      ? {
          kind: "text",
          lineageId,
          contentXLayoutUnit: fragment.contentXLayoutUnit,
          xLayoutUnit: fragment.xLayoutUnit,
          advanceLayoutUnit: fragment.advanceLayoutUnit,
        }
      : {
          kind: "inline-image",
          lineageId,
          contentXLayoutUnit: fragment.contentXLayoutUnit,
          contentYLayoutUnit: fragment.contentYLayoutUnit,
          xLayoutUnit: fragment.xLayoutUnit,
          yLayoutUnit: fragment.yLayoutUnit,
          widthLayoutUnit: fragment.widthLayoutUnit,
          heightLayoutUnit: fragment.heightLayoutUnit,
        })
  }
  const facts = {
    contentYOffsetLayoutUnit: authoredLine.contentYOffsetLayoutUnit,
    yOffsetLayoutUnit: authoredLine.yOffsetLayoutUnit,
    heightLayoutUnit: authoredLine.heightLayoutUnit,
    baselineOffsetLayoutUnit: authoredLine.baselineOffsetLayoutUnit,
    fragments,
  }
  return {
    ...facts,
    fingerprint: fingerprint({
      contractVersion: 1,
      ...facts,
    }),
  }
}

function translatedGeometryFingerprint(
  content: VNextTextBlockPersistentLayoutContentLocalGeometryV1,
  authored: VNextTextBlockPersistentLayoutAuthoredBoxGeometryV1,
): string {
  return fingerprint({
    content: {
      heightLayoutUnit: content.heightLayoutUnit,
      baselineOffsetLayoutUnit: content.baselineOffsetLayoutUnit,
      availableIntervals: content.availableIntervals,
      intervalPlacements: content.intervalPlacements,
      fragments: content.fragments.map((fragment) =>
        fragment.kind === "text"
          ? fragment
          : {
              ...fragment,
              yLayoutUnit:
                fragment.yLayoutUnit - content.yOffsetLayoutUnit,
            }),
    },
    authored: {
      contentYOffsetFromAuthoredLayoutUnit:
        authored.contentYOffsetLayoutUnit - authored.yOffsetLayoutUnit,
      heightLayoutUnit: authored.heightLayoutUnit,
      baselineOffsetLayoutUnit: authored.baselineOffsetLayoutUnit,
      fragments: authored.fragments.map((fragment) =>
        fragment.kind === "text"
          ? fragment
          : {
              ...fragment,
              contentYLayoutUnit:
                fragment.contentYLayoutUnit
                - authored.contentYOffsetLayoutUnit,
              yLayoutUnit:
                fragment.yLayoutUnit - authored.yOffsetLayoutUnit,
            }),
    },
  })
}

function createLine(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  spatialState: VNextTextBlockUnifiedSpatialStateV1,
  spatialLine: VNextTextBlockSpatialWrappedLineV2,
  authoredLine: VNextTextBlockAuthoredBoxLineV2,
  lineOrdinal: number,
): VNextTextBlockPersistentLayoutLineV1 | VNextTextBlockPersistentLayoutLineTreeIssueV1 {
  if (
    spatialLine.index !== lineOrdinal
    || authoredLine.index !== lineOrdinal
    || spatialLine.renderStartOffset !== authoredLine.renderStartOffset
    || spatialLine.renderEndOffset !== authoredLine.renderEndOffset
    || spatialLine.heightLayoutUnit !== authoredLine.heightLayoutUnit
    || spatialLine.baselineOffsetLayoutUnit
      !== authoredLine.baselineOffsetLayoutUnit
  ) {
    return treeIssue(
      "line-geometry-binding-mismatch",
      "spatial and authored line geometry do not describe the same logical line",
      lineOrdinal,
    )
  }
  const mappings = sourceMappings(sourceState, spatialLine.sourceSegments)
  if (mappings == null) {
    return treeIssue(
      "source-range-mismatch",
      "line source segments do not map to exact source-state lineage",
      lineOrdinal,
    )
  }
  const internals = lineInternals(sourceState, spatialLine, mappings)
  const content = contentLocalGeometry(sourceState, spatialLine)
  const authored = authoredBoxGeometry(
    sourceState,
    spatialLine,
    authoredLine,
  )
  if (internals == null || content == null || authored == null) {
    return treeIssue(
      "line-geometry-binding-mismatch",
      "line fragments do not preserve exact source lineage across projections",
      lineOrdinal,
    )
  }
  const sourceFingerprint = fingerprint({
    mappings: mappings.map((mapping) => mapping.sourceFingerprint),
  })
  const provenanceFingerprint = fingerprint({
    mappings: mappings.map((mapping) => mapping.provenanceFingerprint),
  })
  const boundarySpatialContextFingerprint = fingerprint({
    contentContextFingerprint: spatialState.contentContextFingerprint,
    mappingBoundaries: mappings.map(
      (mapping) => mapping.boundaryFingerprint,
    ),
    heightLayoutUnit: spatialLine.heightLayoutUnit,
    baselineOffsetLayoutUnit: spatialLine.baselineOffsetLayoutUnit,
    availableIntervals: content.availableIntervals,
    intervalPlacements: content.intervalPlacements,
  })
  const translated = translatedGeometryFingerprint(content, authored)
  const facts = {
    lineageId: internals.lineageId,
    lineInternals: internals,
    sourceMapping: mappings,
    sourceFingerprint,
    provenanceFingerprint,
    boundarySpatialContextFingerprint,
    contentLocalGeometry: content,
    authoredBoxGeometry: authored,
    translatedGeometryFingerprint: translated,
  }
  return {
    ...facts,
    fingerprint: fingerprint({
      contractVersion: 1,
      ...facts,
    }),
  }
}

function sourceRangeFromLine(
  line: VNextTextBlockPersistentLayoutLineV1,
): VNextTextBlockPersistentLayoutLineSummaryV1["sourceRange"] {
  const first = line.sourceMapping[0]
  const last = line.sourceMapping[line.sourceMapping.length - 1]
  return first == null || last == null
    ? { start: null, end: null }
    : {
        start: {
          lineageId: first.lineageId,
          localRenderedUtf16: first.localStartRenderedUtf16,
        },
        end: {
          lineageId: last.lineageId,
          localRenderedUtf16: last.localEndRenderedUtf16,
        },
      }
}

function leafFromLine(
  line: VNextTextBlockPersistentLayoutLineV1,
): VNextTextBlockPersistentLayoutLineLeafV1 {
  const summary: VNextTextBlockPersistentLayoutLineSummaryV1 = {
    lineCount: 1,
    fragmentCount: line.lineInternals.fragments.length,
    leafCount: 1,
    nodeCount: 1,
    sourceRange: sourceRangeFromLine(line),
    authoredTopLayoutUnit: line.authoredBoxGeometry.yOffsetLayoutUnit,
    authoredBottomLayoutUnit: safeAdd(
      line.authoredBoxGeometry.yOffsetLayoutUnit,
      line.authoredBoxGeometry.heightLayoutUnit,
    ),
    lineInternalsFingerprint: line.lineInternals.fingerprint,
    sourceFingerprint: line.sourceFingerprint,
    provenanceFingerprint: line.provenanceFingerprint,
    boundarySpatialContextFingerprint:
      line.boundarySpatialContextFingerprint,
    contentLocalGeometryFingerprint:
      line.contentLocalGeometry.fingerprint,
    authoredBoxGeometryFingerprint:
      line.authoredBoxGeometry.fingerprint,
    translatedGeometryFingerprint:
      line.translatedGeometryFingerprint,
  }
  return {
    nodeKind: "leaf",
    height: 0,
    line,
    summary,
    fingerprint: fingerprint({
      contractVersion: 1,
      nodeKind: "leaf",
      lineFingerprint: line.fingerprint,
      summary,
    }),
  }
}

function summaryFromChildren(
  children: readonly VNextTextBlockPersistentLayoutLineNodeV1[],
): VNextTextBlockPersistentLayoutLineSummaryV1 {
  let lineCount = 0
  let fragmentCount = 0
  let leafCount = 0
  let nodeCount = 1
  let authoredTopLayoutUnit: number | null = null
  let authoredBottomLayoutUnit: number | null = null
  for (const child of children) {
    lineCount = safeAdd(lineCount, child.summary.lineCount)
    fragmentCount = safeAdd(fragmentCount, child.summary.fragmentCount)
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
    fingerprint({ component: name, children: values })
  return {
    lineCount,
    fragmentCount,
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
    boundarySpatialContextFingerprint: component(
      "boundary-spatial-context",
      children.map(
        (child) => child.summary.boundarySpatialContextFingerprint,
      ),
    ),
    contentLocalGeometryFingerprint: component(
      "content-local-geometry",
      children.map(
        (child) => child.summary.contentLocalGeometryFingerprint,
      ),
    ),
    authoredBoxGeometryFingerprint: component(
      "authored-box-geometry",
      children.map(
        (child) => child.summary.authoredBoxGeometryFingerprint,
      ),
    ),
    translatedGeometryFingerprint: fingerprint({
      component: "translated-geometry",
      children: children.map((child) => ({
        fingerprint: child.summary.translatedGeometryFingerprint,
        topFromParentLayoutUnit:
          child.summary.authoredTopLayoutUnit == null
          || authoredTopLayoutUnit == null
            ? null
            : child.summary.authoredTopLayoutUnit - authoredTopLayoutUnit,
        bottomFromParentLayoutUnit:
          child.summary.authoredBottomLayoutUnit == null
          || authoredTopLayoutUnit == null
            ? null
            : child.summary.authoredBottomLayoutUnit
              - authoredTopLayoutUnit,
      })),
    }),
  }
}

function branchFromChildren(
  children: readonly VNextTextBlockPersistentLayoutLineNodeV1[],
): VNextTextBlockPersistentLayoutLineBranchV1 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]!.height)
  ) throw new Error("invalid branch")
  const summary = summaryFromChildren(children)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children,
    summary,
    fingerprint: fingerprint({
      contractVersion: 1,
      nodeKind: "branch",
      height: children[0]!.height + 1,
      childFingerprints: children.map((child) => child.fingerprint),
      summary,
    }),
  }
}

function canonicalGroupSizes(count: number): readonly number[] {
  if (count <= 0) return []
  if (count <= 8) return [count]
  const fullGroups = Math.floor(count / 8)
  const remainder = count % 8
  const sizes = Array.from({ length: fullGroups }, () => 8)
  if (remainder === 1) {
    sizes[sizes.length - 1] = 4
    sizes.push(5)
  } else if (remainder > 1) {
    sizes.push(remainder)
  }
  return sizes
}

function rootFromLeaves(
  leaves: readonly VNextTextBlockPersistentLayoutLineLeafV1[],
): VNextTextBlockPersistentLayoutLineRootV1 {
  if (leaves.length === 0) {
    return VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_EMPTY_ROOT_V1
  }
  let level: readonly VNextTextBlockPersistentLayoutLineNodeV1[] = leaves
  while (level.length > 1) {
    const next: VNextTextBlockPersistentLayoutLineBranchV1[] = []
    let cursor = 0
    for (const size of canonicalGroupSizes(level.length)) {
      next.push(branchFromChildren(level.slice(cursor, cursor + size)))
      cursor += size
    }
    level = next
  }
  return level[0]!
}

function exactBuildInput(value: unknown): {
  readonly sourceState: unknown
  readonly flowTree: unknown
  readonly spatialState: unknown
  readonly spatialLayout: unknown
  readonly authoredBoxGeometry: unknown
} | null {
  const record = exactRecord(value, [
    "sourceState",
    "flowTree",
    "spatialState",
    "spatialLayout",
    "authoredBoxGeometry",
  ])
  return record == null
    ? null
    : {
        sourceState: record.sourceState,
        flowTree: record.flowTree,
        spatialState: record.spatialState,
        spatialLayout: record.spatialLayout,
        authoredBoxGeometry: record.authoredBoxGeometry,
      }
}

function dependenciesMatch(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly spatialLayout: AcceptedSpatialLayoutV2
  readonly authoredBoxGeometry: AcceptedAuthoredBoxGeometryV2
}): boolean {
  const {
    sourceState,
    flowTree,
    spatialState,
    spatialLayout,
    authoredBoxGeometry,
  } = input
  return hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
    sourceState,
    flowTree,
  )
    && hasVNextTextBlockUnifiedSpatialStatePreparedBindingInternalV1(
      sourceState,
      spatialState,
    )
    && sourceState.documentId === flowTree.documentId
    && sourceState.documentId === spatialState.documentId
    && sourceState.documentId === spatialLayout.documentId
    && sourceState.documentId === authoredBoxGeometry.documentId
    && sourceState.sectionId === flowTree.sectionId
    && sourceState.sectionId === spatialState.sectionId
    && sourceState.sectionId === spatialLayout.sectionId
    && sourceState.sectionId === authoredBoxGeometry.sectionId
    && sourceState.textBlockId === flowTree.textBlockId
    && sourceState.textBlockId === spatialState.textBlockId
    && sourceState.textBlockId === spatialLayout.textBlockId
    && sourceState.textBlockId === authoredBoxGeometry.textBlockId
    && sourceState.instanceRevision === flowTree.instanceRevision
    && sourceState.instanceRevision === spatialState.instanceRevision
    && sourceState.instanceRevision === spatialLayout.instanceRevision
    && sourceState.instanceRevision === authoredBoxGeometry.instanceRevision
    && sourceState.producerRequirements.layoutId === flowTree.layoutId
    && sourceState.producerRequirements.layoutId === spatialLayout.layoutId
    && sourceState.producerRequirements.layoutId === authoredBoxGeometry.layoutId
    && sourceState.initialFlowFingerprint
      === spatialLayout.initialFlowFingerprint
    && sourceState.initialFlowFingerprint
      === authoredBoxGeometry.initialFlowFingerprint
    && sourceState.flowEvidenceFingerprint
      === spatialLayout.flowEvidenceFingerprint
    && sourceState.flowEvidenceFingerprint
      === authoredBoxGeometry.flowEvidenceFingerprint
    && flowTree.sourceStateLayoutDependencyFingerprint
      === sourceState.summary.layoutDependencyFingerprint
    && spatialState.contentRightLayoutUnit
      === sourceState.producerRequirements.availableWidthLayoutUnit
    && authoredBoxGeometry.contentSpatialLayoutFingerprint
      === spatialLayout.fingerprint
    && authoredBoxGeometry.authoredBoxPlanFingerprint
      === sourceState.authoredBoxPlan.fingerprint
}

export function createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
    readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
    readonly spatialLayout: AcceptedSpatialLayoutV2
    readonly authoredBoxGeometry: AcceptedAuthoredBoxGeometryV2
  },
): VNextTextBlockPersistentLayoutLineTreeBuildResultV1
export function createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1(
  input: unknown,
): VNextTextBlockPersistentLayoutLineTreeBuildResultV1
export function createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1(
  input: unknown,
): VNextTextBlockPersistentLayoutLineTreeBuildResultV1 {
  const exact = exactBuildInput(input)
  if (exact == null) {
    return blockedTree(treeIssue(
      "invalid-input",
      "line tree requires an exact accessor-free dependency envelope",
    ))
  }
  const sourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      exact.sourceState,
    )
  if (sourceInspection.status !== "prepared-unregistered") {
    return blockedTree(treeIssue(
      "source-state-authority-mismatch",
      sourceInspection.message,
    ))
  }
  const flowInspection =
    inspectVNextTextBlockIncrementalFlowTreeInternalV1(exact.flowTree)
  if (flowInspection.status !== "prepared-unregistered") {
    return blockedTree(treeIssue(
      "flow-tree-authority-mismatch",
      flowInspection.message,
    ))
  }
  const spatialInspection =
    verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      exact.spatialState,
    )
  if (spatialInspection.status !== "valid-candidate") {
    return blockedTree(treeIssue(
      "spatial-state-authority-mismatch",
      spatialInspection.message,
    ))
  }
  const layoutInspection =
    inspectVNextTextBlockSpatialWrappingLayoutV2(exact.spatialLayout)
  if (layoutInspection.status !== "valid") {
    return blockedTree(treeIssue(
      "spatial-layout-authority-mismatch",
      layoutInspection.message,
    ))
  }
  const authoredInspection =
    inspectVNextTextBlockAuthoredBoxGeometryV2(exact.authoredBoxGeometry)
  if (authoredInspection.status !== "valid") {
    return blockedTree(treeIssue(
      "authored-box-geometry-authority-mismatch",
      authoredInspection.message,
    ))
  }

  const sourceState =
    exact.sourceState as VNextTextBlockUnifiedLayoutSourceStateV1
  const flowTree = exact.flowTree as VNextTextBlockIncrementalFlowTreeV1
  const spatialState =
    exact.spatialState as VNextTextBlockUnifiedSpatialStateV1
  const spatialLayout = exact.spatialLayout as AcceptedSpatialLayoutV2
  const authoredGeometry =
    exact.authoredBoxGeometry as AcceptedAuthoredBoxGeometryV2
  if (!dependenciesMatch({
    sourceState,
    flowTree,
    spatialState,
    spatialLayout,
    authoredBoxGeometry: authoredGeometry,
  })) {
    return blockedTree(treeIssue(
      "dependency-binding-mismatch",
      "line-tree dependencies do not belong to one exact layout revision",
    ))
  }
  if (
    spatialLayout.lines.length !== authoredGeometry.lines.length
    || spatialLayout.summary.lineCount !== authoredGeometry.summary.lineCount
  ) {
    return blockedTree(treeIssue(
      "line-geometry-count-mismatch",
      "spatial and authored geometry line counts differ",
    ))
  }
  try {
    const leaves: VNextTextBlockPersistentLayoutLineLeafV1[] = []
    for (
      let lineOrdinal = 0;
      lineOrdinal < spatialLayout.lines.length;
      lineOrdinal += 1
    ) {
      const line = createLine(
        sourceState,
        spatialState,
        spatialLayout.lines[lineOrdinal]!,
        authoredGeometry.lines[lineOrdinal]!,
        lineOrdinal,
      )
      if (!Object.hasOwn(line, "fingerprint")) {
        return blockedTree(
          line as VNextTextBlockPersistentLayoutLineTreeIssueV1,
        )
      }
      leaves.push(leafFromLine(
        line as VNextTextBlockPersistentLayoutLineV1,
      ))
    }
    const root = rootFromLeaves(leaves)
    const work = {
      completeBuildCount: 1 as const,
      visitedLineCount: leaves.length,
      createdLeafCount: leaves.length,
      createdNodeCount: root.summary.nodeCount,
      reusedLeafCount: 0 as const,
      reusedNodeCount: 0 as const,
      completeSuffixTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_SOURCE,
      contractVersion:
        VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_V1_VERSION,
      documentId: sourceState.documentId,
      sectionId: sourceState.sectionId,
      textBlockId: sourceState.textBlockId,
      instanceRevision: sourceState.instanceRevision,
      layoutId: flowTree.layoutId,
      layoutContextFingerprint: flowTree.layoutContextFingerprint,
      spatialContextFingerprint: fingerprint({
        contentContextFingerprint: spatialState.contentContextFingerprint,
        layoutUnitPolicyFingerprint:
          spatialState.layoutUnitPolicyFingerprint,
      }),
      authoredBoxPlanFingerprint: sourceState.authoredBoxPlan.fingerprint,
      policy: VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_LINE_TREE_POLICY_V1,
      root,
      summary: root.summary,
      work,
      contracts: {
        oneLogicalLinePerLeaf: true as const,
        paintFactsExcluded: true as const,
        absoluteLineOrdinalsExcluded: true as const,
        absoluteRenderedOffsetsExcluded: true as const,
        canonicalMaximalDispositionCover: true as const,
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
    const canonicalFacts = stringifyVNextCanonicalJson(treeCanonicalFacts({
      ...withoutFingerprint,
      fingerprint: "",
    }))
    const lineTree = Object.freeze({
      ...withoutFingerprint,
      fingerprint: createVNextCompactFingerprint(canonicalFacts),
    })
    preparedTrees.set(lineTree, {
      fingerprint: lineTree.fingerprint,
      canonicalFacts,
      sourceState,
      flowTree,
      spatialState,
    })
    return Object.freeze({
      status: "prepared",
      lineTree,
      work: lineTree.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blockedTree(treeIssue(
      "unsafe-line-summary",
      "line tree exceeded safe geometry, topology, or summary arithmetic",
    ))
  }
}

export function verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
  value: unknown,
): VNextTextBlockPersistentLayoutLineTreeInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !preparedTrees.has(value as VNextTextBlockPersistentLayoutLineTreeV1)
  ) {
    return {
      status: "invalid",
      code: "line-tree-authority-mismatch",
      message: "line tree is not the exact process-local prepared candidate",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "line-tree-not-deeply-frozen",
      message: "prepared line tree must remain recursively frozen",
    }
  }
  try {
    const tree = value as VNextTextBlockPersistentLayoutLineTreeV1
    const stored = preparedTrees.get(tree)!
    const canonicalFacts = stringifyVNextCanonicalJson(
      treeCanonicalFacts(tree),
    )
    if (
      stored.canonicalFacts !== canonicalFacts
      || stored.fingerprint !== tree.fingerprint
      || tree.fingerprint !== createVNextCompactFingerprint(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "line-tree-canonical-facts-mismatch",
        message: "prepared line tree no longer matches canonical facts",
      }
    }
    return {
      status: "valid-candidate",
      fingerprint: tree.fingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "line-tree-canonical-facts-mismatch",
      message: "prepared line tree is not canonically inspectable",
    }
  }
}

export function hasVNextTextBlockPersistentLayoutLineTreePreparedBindingInternalV1(
  sourceState: unknown,
  lineTree: unknown,
): lineTree is VNextTextBlockPersistentLayoutLineTreeV1 {
  if (
    sourceState == null
    || typeof sourceState !== "object"
    || lineTree == null
    || typeof lineTree !== "object"
  ) return false
  const candidate =
    lineTree as VNextTextBlockPersistentLayoutLineTreeV1
  return verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
    candidate,
  ).status === "valid-candidate"
    && preparedTrees.get(candidate)?.sourceState === sourceState
}

export function hasVNextTextBlockPersistentLayoutLineTreePreparedRootDependenciesInternalV2(
  input: {
    readonly sourceState: unknown
    readonly flowTree: unknown
    readonly spatialState: unknown
    readonly lineTree: unknown
  },
): input is {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
} {
  if (
    input.lineTree == null
    || typeof input.lineTree !== "object"
  ) return false
  const binding = preparedTrees.get(
    input.lineTree as VNextTextBlockPersistentLayoutLineTreeV1,
  )
  return binding != null
    && binding.sourceState === input.sourceState
    && binding.flowTree === input.flowTree
    && binding.spatialState === input.spatialState
}

export function registerPreparedVNextTextBlockPersistentLayoutLineTreeRootGraphChildInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  },
): boolean {
  if (input.phase === "preflight") {
    return !registeredRootGraphTrees.has(input.lineTree)
      && verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
        input.lineTree,
      ).status === "valid-candidate"
      && authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
        token: input.token,
        phase: input.phase,
        childKind: "line-tree",
        child: input.lineTree,
      })
  }
  if (
    !authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
      token: input.token,
      phase: input.phase,
      childKind: "line-tree",
      child: input.lineTree,
    })
  ) return false
  registeredRootGraphTrees.add(input.lineTree)
  return true
}

export function hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2(
  value: unknown,
): value is VNextTextBlockPersistentLayoutLineTreeV1 {
  return value != null
    && typeof value === "object"
    && registeredRootGraphTrees.has(
      value as VNextTextBlockPersistentLayoutLineTreeV1,
    )
}

export function inspectVNextTextBlockPersistentLayoutLineTreeV1(
  value: unknown,
):
  | { readonly status: "valid"; readonly fingerprint: string }
  | {
      readonly status: "invalid"
      readonly code: "line-tree-authority-mismatch"
      readonly message: string
    } {
  if (
    !hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2(
      value,
    )
  ) {
    return {
      status: "invalid",
      code: "line-tree-authority-mismatch",
      message: "line tree is not an exact committed Root V2 child",
    }
  }
  const candidate =
    verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(value)
  return candidate.status === "valid-candidate"
    ? { status: "valid", fingerprint: candidate.fingerprint }
    : {
        status: "invalid",
        code: "line-tree-authority-mismatch",
        message: candidate.message,
      }
}

export function lookupVNextTextBlockPersistentLayoutLineInternalV1(input: {
  readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly lineOrdinal: number
}): VNextTextBlockPersistentLayoutLineLookupResultV1 {
  const inspection =
    verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      input.lineTree,
    )
  if (inspection.status !== "valid-candidate") {
    return {
      status: "blocked",
      lineOrdinal: null,
      leaf: null,
      work: null,
      issues: [treeIssue("invalid-line-topology", inspection.message)],
    }
  }
  if (
    !Number.isSafeInteger(input.lineOrdinal)
    || input.lineOrdinal < 0
    || input.lineOrdinal >= input.lineTree.summary.lineCount
  ) {
    return {
      status: "not-found",
      lineOrdinal: null,
      leaf: null,
      work: {
        visitedNodeCount: 0,
        completeTreeTraversalCount: 0,
      },
    }
  }
  let relativeOrdinal = input.lineOrdinal
  let node = input.lineTree.root
  let visitedNodeCount = 1
  while (node.nodeKind === "branch") {
    let selected: VNextTextBlockPersistentLayoutLineNodeV1 | null = null
    for (const child of node.children) {
      if (relativeOrdinal < child.summary.lineCount) {
        selected = child
        break
      }
      relativeOrdinal -= child.summary.lineCount
    }
    if (selected == null) break
    node = selected
    visitedNodeCount += 1
  }
  return node.nodeKind === "leaf"
    ? {
        status: "found",
        lineOrdinal: input.lineOrdinal,
        leaf: node,
        work: {
          visitedNodeCount,
          completeTreeTraversalCount: 0,
        },
      }
    : {
        status: "not-found",
        lineOrdinal: null,
        leaf: null,
        work: {
          visitedNodeCount,
          completeTreeTraversalCount: 0,
        },
      }
}

interface SelectedNode {
  readonly node: VNextTextBlockPersistentLayoutLineNodeV1
  readonly start: number
  readonly end: number
}

function selectMaximalNodes(
  root: VNextTextBlockPersistentLayoutLineRootV1,
  range: VNextTextBlockLineOrdinalRangeV1,
): readonly SelectedNode[] {
  if (root.nodeKind === "empty") return []
  const selected: SelectedNode[] = []
  const visit = (
    node: VNextTextBlockPersistentLayoutLineNodeV1,
    start: number,
  ): void => {
    const end = start + node.summary.lineCount
    if (end <= range.start || start >= range.end) return
    if (range.start <= start && end <= range.end) {
      selected.push({ node, start, end })
      return
    }
    if (node.nodeKind === "leaf") {
      throw new Error("partial leaf selection")
    }
    let childStart = start
    for (const child of node.children) {
      visit(child, childStart)
      childStart += child.summary.lineCount
    }
  }
  visit(root, 0)
  return selected
}

function summaryForSelected(
  selected: readonly SelectedNode[],
): VNextTextBlockPersistentLayoutLineSummaryV1 {
  if (selected.length === 1) return selected[0]!.node.summary
  return summaryFromChildren(selected.map((item) => item.node))
}

function validRange(
  range: VNextTextBlockLineOrdinalRangeV1,
  limit: number,
): boolean {
  return Number.isSafeInteger(range.start)
    && Number.isSafeInteger(range.end)
    && range.start >= 0
    && range.end > range.start
    && range.end <= limit
}

function exactSegments(value: unknown): readonly VNextTextBlockLineDispositionSegmentV1[] | null {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    return null
  }
  const output: VNextTextBlockLineDispositionSegmentV1[] = []
  for (const item of value) {
    const record = exactRecord(item, [
      "disposition",
      "previousRange",
      "nextRange",
      "constantYDeltaLayoutUnit",
    ])
    if (
      record == null
      || !["E", "T", "R", "N"].includes(String(record.disposition))
    ) return null
    const nextRange = exactRecord(record.nextRange, ["start", "end"])
    const previousRange = record.previousRange == null
      ? null
      : exactRecord(record.previousRange, ["start", "end"])
    if (nextRange == null || (record.previousRange != null && previousRange == null)) {
      return null
    }
    output.push({
      disposition: record.disposition as VNextTextBlockLineDispositionSegmentV1[
        "disposition"
      ],
      previousRange: previousRange as unknown as
        VNextTextBlockLineOrdinalRangeV1 | null,
      nextRange: nextRange as unknown as VNextTextBlockLineOrdinalRangeV1,
      constantYDeltaLayoutUnit:
        record.constantYDeltaLayoutUnit as number | null,
    })
  }
  return output
}

function exactCoverInput(value: unknown): {
  readonly previousTree: unknown
  readonly nextTree: unknown
  readonly segments: readonly VNextTextBlockLineDispositionSegmentV1[]
} | null {
  const record = exactRecord(value, [
    "previousTree",
    "nextTree",
    "segments",
  ])
  if (record == null) return null
  const segments = exactSegments(record.segments)
  return segments == null
    ? null
    : {
        previousTree: record.previousTree,
        nextTree: record.nextTree,
        segments,
      }
}

function adjacentSegmentsAreNonmaximal(
  left: VNextTextBlockLineDispositionSegmentV1,
  right: VNextTextBlockLineDispositionSegmentV1,
): boolean {
  if (
    left.disposition !== right.disposition
    || left.constantYDeltaLayoutUnit !== right.constantYDeltaLayoutUnit
    || left.nextRange.end !== right.nextRange.start
  ) return false
  if (left.previousRange == null || right.previousRange == null) {
    return left.previousRange == null && right.previousRange == null
  }
  return left.previousRange.end === right.previousRange.start
}

function sameSelectedIdentity(
  previous: readonly SelectedNode[],
  next: readonly SelectedNode[],
): boolean {
  return previous.length === next.length
    && previous.every((item, index) => item.node === next[index]?.node)
}

export function createVNextTextBlockLineDispositionCoverInternalV1(input: {
  readonly previousTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly nextTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly segments: readonly VNextTextBlockLineDispositionSegmentV1[]
}): VNextTextBlockLineDispositionCoverResultV1
export function createVNextTextBlockLineDispositionCoverInternalV1(
  input: unknown,
): VNextTextBlockLineDispositionCoverResultV1
export function createVNextTextBlockLineDispositionCoverInternalV1(
  input: unknown,
): VNextTextBlockLineDispositionCoverResultV1 {
  const exact = exactCoverInput(input)
  if (exact == null) {
    return blockedCover(
      "invalid-input",
      "disposition cover requires exact accessor-free trees and segments",
    )
  }
  const previousInspection =
    verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      exact.previousTree,
    )
  const nextInspection =
    verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      exact.nextTree,
    )
  if (
    previousInspection.status !== "valid-candidate"
    || nextInspection.status !== "valid-candidate"
  ) {
    return blockedCover(
      "line-tree-authority-mismatch",
      "disposition cover requires exact process-local line-tree candidates",
    )
  }
  const previousTree =
    exact.previousTree as VNextTextBlockPersistentLayoutLineTreeV1
  const nextTree =
    exact.nextTree as VNextTextBlockPersistentLayoutLineTreeV1
  const counts = { E: 0, T: 0, R: 0, N: 0 }
  const coverRows: VNextTextBlockLineDispositionCoverV1["covers"][number][] =
    []
  let nextCursor = 0
  let previousCursor = 0
  let consumedPrevious = 0
  let selectedSubtreeCount = 0
  try {
    for (let index = 0; index < exact.segments.length; index += 1) {
      const segment = exact.segments[index]!
      if (!validRange(segment.nextRange, nextTree.summary.lineCount)) {
        return blockedCover(
          "line-disposition-next-nonexhaustive",
          "next ranges must be non-empty safe ranges inside the next tree",
        )
      }
      if (segment.nextRange.start < nextCursor) {
        return blockedCover(
          "line-disposition-next-overlap",
          "next disposition ranges overlap or are reordered",
        )
      }
      if (segment.nextRange.start > nextCursor) {
        return blockedCover(
          "line-disposition-next-gap",
          "next disposition ranges contain an uncovered gap",
        )
      }
      if (
        index > 0
        && adjacentSegmentsAreNonmaximal(exact.segments[index - 1]!, segment)
      ) {
        return blockedCover(
          "line-disposition-nonmaximal-segments",
          "adjacent equivalent dispositions must be represented maximally",
        )
      }
      const requiresPrevious = segment.disposition !== "N"
      if (
        requiresPrevious !== (segment.previousRange != null)
        || (
          segment.previousRange != null
          && !validRange(
            segment.previousRange,
            previousTree.summary.lineCount,
          )
        )
      ) {
        return blockedCover(
          "line-disposition-range-mismatch",
          "E/T/R require a valid previous range and N forbids one",
        )
      }
      if (segment.previousRange != null) {
        if (segment.previousRange.start < previousCursor) {
          return blockedCover(
            "line-disposition-previous-overlap",
            "previous ranges overlap or are reordered",
          )
        }
        previousCursor = segment.previousRange.end
        consumedPrevious = safeAdd(
          consumedPrevious,
          segment.previousRange.end - segment.previousRange.start,
        )
      }
      const nextLength = segment.nextRange.end - segment.nextRange.start
      counts[segment.disposition] = safeAdd(
        counts[segment.disposition],
        nextLength,
      )
      const nextSelected = selectMaximalNodes(
        nextTree.root,
        segment.nextRange,
      )
      selectedSubtreeCount = safeAdd(
        selectedSubtreeCount,
        nextSelected.length,
      )
      if (segment.disposition === "E" || segment.disposition === "T") {
        const previousRange = segment.previousRange!
        if (
          previousRange.end - previousRange.start !== nextLength
        ) {
          return blockedCover(
            "line-disposition-range-mismatch",
            "E/T ranges must preserve a one-to-one logical-line count",
          )
        }
        const previousSelected = selectMaximalNodes(
          previousTree.root,
          previousRange,
        )
        const previousSummary = summaryForSelected(previousSelected)
        const nextSummary = summaryForSelected(nextSelected)
        if (
          previousSummary.sourceFingerprint
          !== nextSummary.sourceFingerprint
        ) {
          return blockedCover(
            "line-disposition-source-mismatch",
            "E/T cannot cross source-fact drift",
          )
        }
        if (
          previousSummary.provenanceFingerprint
          !== nextSummary.provenanceFingerprint
        ) {
          return blockedCover(
            "line-disposition-provenance-mismatch",
            "E/T cannot cross provenance drift",
          )
        }
        if (
          previousSummary.boundarySpatialContextFingerprint
          !== nextSummary.boundarySpatialContextFingerprint
        ) {
          return blockedCover(
            "line-disposition-boundary-mismatch",
            "E/T require compatible break and spatial-boundary semantics",
          )
        }
        if (
          previousSummary.lineInternalsFingerprint
          !== nextSummary.lineInternalsFingerprint
        ) {
          return blockedCover(
            "line-disposition-internals-mismatch",
            "E/T require identical immutable line internals",
          )
        }
        if (segment.disposition === "E") {
          if (segment.constantYDeltaLayoutUnit !== null) {
            return blockedCover(
              "line-disposition-invalid-translation",
              "E must not declare a translation delta",
            )
          }
          if (
            previousSummary.contentLocalGeometryFingerprint
              !== nextSummary.contentLocalGeometryFingerprint
            || previousSummary.authoredBoxGeometryFingerprint
              !== nextSummary.authoredBoxGeometryFingerprint
          ) {
            return blockedCover(
              "line-disposition-geometry-mismatch",
              "E requires identical content-local and authored geometry",
            )
          }
          if (!sameSelectedIdentity(previousSelected, nextSelected)) {
            return blockedCover(
              "line-disposition-not-exact-reuse",
              "E requires exact retained process-local subtree identity",
            )
          }
        } else {
          const delta = segment.constantYDeltaLayoutUnit
          if (!Number.isSafeInteger(delta)) {
            return blockedCover(
              "line-disposition-invalid-translation",
              "T requires one safe-integer constant y delta",
            )
          }
          if (
            previousSummary.translatedGeometryFingerprint
              !== nextSummary.translatedGeometryFingerprint
            || previousSummary.authoredTopLayoutUnit == null
            || nextSummary.authoredTopLayoutUnit == null
            || nextSummary.authoredTopLayoutUnit
              - previousSummary.authoredTopLayoutUnit !== delta
            || previousSummary.authoredBottomLayoutUnit == null
            || nextSummary.authoredBottomLayoutUnit == null
            || nextSummary.authoredBottomLayoutUnit
              - previousSummary.authoredBottomLayoutUnit !== delta
          ) {
            return blockedCover(
              "line-disposition-geometry-mismatch",
              "T requires strict constant-delta translated geometry",
            )
          }
        }
      } else if (segment.constantYDeltaLayoutUnit !== null) {
        return blockedCover(
          "line-disposition-invalid-translation",
          "only T may declare a translation delta",
        )
      }
      coverRows.push({
        disposition: segment.disposition,
        previousRange: segment.previousRange,
        nextRange: segment.nextRange,
        constantYDeltaLayoutUnit: segment.constantYDeltaLayoutUnit,
        subtreeFingerprints: nextSelected.map(
          (selected) => selected.node.fingerprint,
        ),
      })
      nextCursor = segment.nextRange.end
    }
    if (nextCursor !== nextTree.summary.lineCount) {
      return blockedCover(
        "line-disposition-next-nonexhaustive",
        "disposition segments do not exhaust the next line tree",
      )
    }
    const removed = previousTree.summary.lineCount - consumedPrevious
    if (removed < 0) {
      return blockedCover(
        "line-disposition-count-overflow",
        "previous disposition count exceeds the previous line tree",
      )
    }
    const facts = {
      source: "vnext-text-block-line-disposition-cover-v1" as const,
      contractVersion: 1 as const,
      previousTreeFingerprint: previousTree.fingerprint,
      nextTreeFingerprint: nextTree.fingerprint,
      covers: coverRows,
      counts: {
        ...counts,
        removed,
      },
      work: {
        visitedSegmentCount: exact.segments.length,
        selectedSubtreeCount,
        enumeratedLineCount: 0 as const,
      },
    }
    const withoutFingerprint = deepFreeze(facts)
    const canonicalFacts = stringifyVNextCanonicalJson(
      coverCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      }),
    )
    const cover = Object.freeze({
      ...withoutFingerprint,
      fingerprint: createVNextCompactFingerprint(canonicalFacts),
    })
    covers.set(cover, {
      previousTree,
      nextTree,
      fingerprint: cover.fingerprint,
      canonicalFacts,
    })
    return Object.freeze({
      status: "accepted",
      cover,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blockedCover(
      "line-disposition-count-overflow",
      "disposition cover exceeded safe range or summary arithmetic",
    )
  }
}

export function inspectVNextTextBlockLineDispositionCoverInternalV1(input: {
  readonly previousTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly nextTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly cover: VNextTextBlockLineDispositionCoverV1
}): VNextTextBlockLineDispositionCoverInspectionV1 {
  const record = exactRecord(input, [
    "previousTree",
    "nextTree",
    "cover",
  ])
  if (
    record == null
    || record.cover == null
    || typeof record.cover !== "object"
    || !covers.has(record.cover as VNextTextBlockLineDispositionCoverV1)
  ) {
    return {
      status: "invalid",
      code: "line-disposition-cover-authority-mismatch",
      message: "cover is not the exact process-local canonical result",
    }
  }
  const cover = record.cover as VNextTextBlockLineDispositionCoverV1
  const binding = covers.get(cover)!
  if (
    binding.previousTree !== record.previousTree
    || binding.nextTree !== record.nextTree
  ) {
    return {
      status: "invalid",
      code: "line-disposition-cover-binding-mismatch",
      message: "cover is bound to different exact line trees",
    }
  }
  if (!deeplyFrozen(cover)) {
    return {
      status: "invalid",
      code: "line-disposition-cover-not-deeply-frozen",
      message: "canonical disposition cover must remain recursively frozen",
    }
  }
  try {
    const canonicalFacts = stringifyVNextCanonicalJson(
      coverCanonicalFacts(cover),
    )
    if (
      binding.canonicalFacts !== canonicalFacts
      || binding.fingerprint !== cover.fingerprint
      || cover.fingerprint !== createVNextCompactFingerprint(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "line-disposition-cover-canonical-facts-mismatch",
        message: "canonical disposition cover no longer matches its facts",
      }
    }
    return { status: "valid", fingerprint: cover.fingerprint }
  } catch {
    return {
      status: "invalid",
      code: "line-disposition-cover-canonical-facts-mismatch",
      message: "canonical disposition cover is not canonically inspectable",
    }
  }
}
