import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { scaleVNextFontMetricToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import {
  combineVNextTextBlockFlowLineMetricsV2,
  resolveVNextTextBlockInlineImageLineMetricsV1,
  VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1,
  type VNextTextBlockBaselineExtentV1,
} from "./textBlockInlineImageLineBoxV1.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import { inspectVNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import { createVNextTextBlockMultiRunSourceSegmentsV1 } from "./textBlockMultiRunDerivationV1.js"
import type {
  VNextTextBlockPersistentFlowAtomV2,
  VNextTextBlockPersistentFlowNodeV2,
  VNextTextBlockPersistentFlowTreeV2,
} from "./textBlockPersistentFlowContractV2.js"
import { inspectVNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowTreeV2.js"
import { provideVNextTextBlockFlowRegionsV2 } from "./textBlockFlowRegionProviderV2.js"
import type { VNextTextBlockSpatialIndexV2 } from "./textBlockSpatialIndexContractV2.js"
import {
  hasSpatialIndexBindingV2,
  inspectVNextTextBlockSpatialIndexV2,
} from "./textBlockSpatialIndexV2.js"
import type { VNextTextBlockSpatialIntervalPlacementV1 } from "./textBlockSpatialWrappingLayoutContractV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE,
  VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION,
  type VNextTextBlockSpatialFragmentV2,
  type VNextTextBlockSpatialInlineImageFragmentV2,
  type VNextTextBlockSpatialTextFragmentV2,
  type VNextTextBlockSpatialWrappedLineV2,
  type VNextTextBlockSpatialWrappingIssueCodeV2,
  type VNextTextBlockSpatialWrappingIssueV2,
  type VNextTextBlockSpatialWrappingLayoutInspectionV2,
  type VNextTextBlockSpatialWrappingLayoutResultV2,
} from "./textBlockSpatialWrappingLayoutContractV2.js"
import {
  createVNextTextBlockBreakGroupsKernelV1,
  runVNextTextBlockSpatialWrappingKernelV1,
  type VNextTextBlockCandidatePlacementKernelV1,
  type VNextTextBlockPlacedAtomKernelV1,
  type VNextTextBlockPlacementAtomKernelV1,
} from "./textBlockSpatialWrappingKernelV1.js"

interface V2LayoutInput {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  startYLayoutUnit: number
  bindProductionLayout?: boolean
}

interface ProjectedAtomV2 {
  atom: VNextTextBlockPersistentFlowAtomV2
  imageExtent: VNextTextBlockBaselineExtentV1 | null
}

interface LinePayloadV2 {
  renderStartOffset: number
  renderEndOffset: number
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
  fragments: readonly VNextTextBlockSpatialFragmentV2[]
}

const layouts = new WeakMap<object, { canonicalFacts: string; fingerprint: string }>()

function issue(
  code: VNextTextBlockSpatialWrappingIssueCodeV2,
  path: string,
  message: string,
  lineIndex?: number,
): VNextTextBlockSpatialWrappingIssueV2 {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(lineIndex == null ? {} : { lineIndex }),
  }
}

function blocked(
  issues: readonly VNextTextBlockSpatialWrappingIssueV2[],
): VNextTextBlockSpatialWrappingLayoutResultV2 {
  return {
    status: "blocked",
    source: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION,
    lines: null,
    summary: null,
    work: null,
    mayPublishLayout: false,
    productionBinding: false,
    fingerprint: null,
    issues,
  }
}

function exactInput(value: unknown): V2LayoutInput | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const keys = Reflect.ownKeys(value)
    const required = [
      "initialFlow",
      "evidence",
      "persistentFlowTree",
      "spatialIndex",
      "startYLayoutUnit",
    ]
    const allowed = [...required, "bindProductionLayout"]
    if (
      keys.length < required.length
      || keys.length > allowed.length
      || keys.some((key) => typeof key !== "string" || !allowed.includes(key))
      || required.some((key) => !keys.includes(key))
    ) return null
    const result = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      result[key] = descriptor.value
    }
    return result as unknown as V2LayoutInput
  } catch {
    return null
  }
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  return value != null
    && typeof value === "object"
    && Object.isFrozen(value)
    && Object.values(value).every((child) => (
      child == null || typeof child !== "object" || deeplyFrozen(child)
    ))
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function safeSum(values: readonly number[]): number | null {
  let total = 0
  for (const value of values) {
    if (!Number.isSafeInteger(value)) return null
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

function collectAtoms(node: VNextTextBlockPersistentFlowNodeV2): VNextTextBlockPersistentFlowAtomV2[] {
  if (node.nodeKind === "leaf") return [...node.atoms]
  return node.children.flatMap(collectAtoms)
}

function paragraphMetrics(input: V2LayoutInput): {
  ascentLayoutUnit: number
  descentLayoutUnit: number
} | null {
  const face = input.evidence.fontFaces.find(
    (item) => item.fontFaceId === input.evidence.paragraphStyle.fontFaceId,
  )
  if (face == null) return null
  const ascent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.ascentFontUnit,
    fontSizeLayoutUnit: input.evidence.paragraphStyle.fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  const descent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.descentFontUnit,
    fontSizeLayoutUnit: input.evidence.paragraphStyle.fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  if (ascent.status !== "accepted" || descent.status !== "accepted") return null
  const descentLayoutUnit = descent.layoutUnit === 0 ? 0 : -descent.layoutUnit
  if (
    !Number.isSafeInteger(ascent.layoutUnit)
    || ascent.layoutUnit < 0
    || !Number.isSafeInteger(descentLayoutUnit)
    || descentLayoutUnit < 0
  ) return null
  return { ascentLayoutUnit: ascent.layoutUnit, descentLayoutUnit }
}

function projectAtoms(input: {
  atoms: readonly VNextTextBlockPersistentFlowAtomV2[]
  paragraphAscentLayoutUnit: number
  paragraphDescentLayoutUnit: number
}): {
  projected: ProjectedAtomV2[]
  kernelAtoms: VNextTextBlockPlacementAtomKernelV1[]
} | null {
  const projected: ProjectedAtomV2[] = []
  const kernelAtoms: VNextTextBlockPlacementAtomKernelV1[] = []
  for (const atom of input.atoms) {
    let imageExtent: VNextTextBlockBaselineExtentV1 | null = null
    if (atom.kind === "inline-image") {
      const metrics = resolveVNextTextBlockInlineImageLineMetricsV1({
        verticalAlign: atom.verticalAlign,
        frameHeightLayoutUnit: atom.heightLayoutUnit,
        paragraphAscentLayoutUnit: input.paragraphAscentLayoutUnit,
        paragraphDescentLayoutUnit: input.paragraphDescentLayoutUnit,
      })
      if (
        metrics.status !== "accepted"
        || metrics.alignmentPolicyFingerprint !== atom.alignmentPolicyFingerprint
      ) return null
      imageExtent = {
        topFromBaselineLayoutUnit: metrics.topFromBaselineLayoutUnit,
        bottomFromBaselineLayoutUnit: metrics.bottomFromBaselineLayoutUnit,
      }
    }
    const payloadIndex = projected.length
    projected.push({ atom, imageExtent })
    if (atom.kind === "text-cluster") {
      kernelAtoms.push({
        kind: "text-cluster",
        renderStartOffset: atom.renderStartOffset,
        renderEndOffset: atom.renderEndOffset,
        advanceLayoutUnit: atom.advanceLayoutUnit,
        payloadIndex,
      })
    } else if (atom.kind === "inline-image") {
      kernelAtoms.push({
        kind: "inline-image",
        renderStartOffset: atom.renderStartOffset,
        renderEndOffset: atom.renderEndOffset,
        advanceLayoutUnit: atom.widthLayoutUnit,
        payloadIndex,
      })
    } else {
      kernelAtoms.push({
        kind: "hard-break",
        renderStartOffset: atom.renderStartOffset,
        renderEndOffset: atom.renderEndOffset,
        advanceLayoutUnit: 0,
        payloadIndex,
      })
    }
  }
  return { projected, kernelAtoms }
}

function intervalPlacements(
  placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[],
): VNextTextBlockSpatialIntervalPlacementV1[] {
  const result: VNextTextBlockSpatialIntervalPlacementV1[] = []
  for (const placed of placedAtoms) {
    const previous = result.at(-1)
    if (
      previous?.intervalIndex === placed.intervalIndex
      && previous.renderEndOffset === placed.atom.renderStartOffset
      && previous.xEndLayoutUnit === placed.xStartLayoutUnit
    ) {
      previous.renderEndOffset = placed.atom.renderEndOffset
      previous.xEndLayoutUnit = placed.xEndLayoutUnit
    } else {
      result.push({
        intervalIndex: placed.intervalIndex,
        renderStartOffset: placed.atom.renderStartOffset,
        renderEndOffset: placed.atom.renderEndOffset,
        xStartLayoutUnit: placed.xStartLayoutUnit,
        xEndLayoutUnit: placed.xEndLayoutUnit,
      })
    }
  }
  return result
}

function textFragments(input: {
  layoutId: string
  lineIndex: number
  evidence: VNextTextBlockFlowEvidenceV2
  placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
  projected: readonly ProjectedAtomV2[]
}): VNextTextBlockSpatialTextFragmentV2[] | null {
  const groups: Array<{
    atom: Extract<VNextTextBlockPersistentFlowAtomV2, { kind: "text-cluster" }>
    intervalIndex: number
    renderStartOffset: number
    renderEndOffset: number
    xLayoutUnit: number
    advanceLayoutUnit: number
  }> = []
  for (const placed of input.placedAtoms) {
    if (placed.atom.kind !== "text-cluster") continue
    const source = input.projected[placed.atom.payloadIndex]?.atom
    if (
      source?.kind !== "text-cluster"
      || source.renderStartOffset !== placed.atom.renderStartOffset
      || source.renderEndOffset !== placed.atom.renderEndOffset
    ) return null
    const previous = groups.at(-1)
    if (
      previous?.atom.shapingRunId === source.shapingRunId
      && previous.intervalIndex === placed.intervalIndex
      && previous.renderEndOffset === source.renderStartOffset
      && previous.xLayoutUnit + previous.advanceLayoutUnit === placed.xStartLayoutUnit
    ) {
      previous.renderEndOffset = source.renderEndOffset
      previous.advanceLayoutUnit += source.advanceLayoutUnit
    } else {
      groups.push({
        atom: source,
        intervalIndex: placed.intervalIndex,
        renderStartOffset: source.renderStartOffset,
        renderEndOffset: source.renderEndOffset,
        xLayoutUnit: placed.xStartLayoutUnit,
        advanceLayoutUnit: source.advanceLayoutUnit,
      })
    }
  }
  const faces = new Map(input.evidence.fontFaces.map((face) => [face.fontFaceId, face]))
  const fragments: VNextTextBlockSpatialTextFragmentV2[] = []
  for (const group of groups) {
    const face = faces.get(group.atom.fontFaceId)
    if (face == null) return null
    const facts = {
      kind: "text" as const,
      fragmentId: `${input.layoutId}:line-${input.lineIndex}:run-${group.atom.shapingRunId}:${group.renderStartOffset}-${group.renderEndOffset}`,
      shapingRunId: group.atom.shapingRunId,
      renderStartOffset: group.renderStartOffset,
      renderEndOffset: group.renderEndOffset,
      text: input.evidence.measurement.renderedText.slice(
        group.renderStartOffset,
        group.renderEndOffset,
      ),
      xLayoutUnit: group.xLayoutUnit,
      advanceLayoutUnit: group.advanceLayoutUnit,
      baselineShiftLayoutUnit: 0 as const,
      styleKey: group.atom.styleKey,
      fontFaceId: group.atom.fontFaceId,
      fontFamily: face.fontFamily,
      fontSha256: face.fontSha256,
      fontWeight: face.weight,
      fontStyle: face.style,
      fontSizeLayoutUnit: group.atom.fontSizeLayoutUnit,
      textColor: group.atom.textColor,
      ascentLayoutUnit: group.atom.ascentLayoutUnit,
      descentLayoutUnit: group.atom.descentLayoutUnit,
      lineGapLayoutUnit: group.atom.lineGapLayoutUnit,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        input.evidence.measurement.runs,
        group.renderStartOffset,
        group.renderEndOffset,
      ),
    }
    fragments.push({ ...facts, fingerprint: fingerprint(facts) })
  }
  return fragments
}

function imageFragments(input: {
  layoutId: string
  lineIndex: number
  lineYLayoutUnit: number
  baselineOffsetLayoutUnit: number
  evidence: VNextTextBlockFlowEvidenceV2
  placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
  projected: readonly ProjectedAtomV2[]
}): VNextTextBlockSpatialInlineImageFragmentV2[] | null {
  const result: VNextTextBlockSpatialInlineImageFragmentV2[] = []
  for (const placed of input.placedAtoms) {
    if (placed.atom.kind !== "inline-image") continue
    const projected = input.projected[placed.atom.payloadIndex]
    const source = projected?.atom
    if (
      source?.kind !== "inline-image"
      || projected.imageExtent == null
      || source.renderStartOffset !== placed.atom.renderStartOffset
      || source.renderEndOffset !== placed.atom.renderEndOffset
    ) return null
    const yLayoutUnit = safeSum([
      input.lineYLayoutUnit,
      input.baselineOffsetLayoutUnit,
      projected.imageExtent.topFromBaselineLayoutUnit,
    ])
    if (yLayoutUnit == null) return null
    const facts = {
      kind: "inline-image" as const,
      fragmentId: `${input.layoutId}:line-${input.lineIndex}:image-${source.inlineId}:${source.renderStartOffset}-${source.renderEndOffset}`,
      inlineId: source.inlineId,
      assetId: source.assetId,
      renderStartOffset: source.renderStartOffset,
      renderEndOffset: source.renderEndOffset,
      xLayoutUnit: placed.xStartLayoutUnit,
      yLayoutUnit,
      widthLayoutUnit: source.widthLayoutUnit,
      heightLayoutUnit: source.heightLayoutUnit,
      verticalAlign: source.verticalAlign,
      authoredFrame: source.authoredFrame,
      alignmentPolicyFingerprint: source.alignmentPolicyFingerprint,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        input.evidence.measurement.runs,
        source.renderStartOffset,
        source.renderEndOffset,
      ),
    }
    result.push({ ...facts, fingerprint: fingerprint(facts) })
  }
  return result
}

function orderedFragments(input: {
  text: readonly VNextTextBlockSpatialTextFragmentV2[]
  images: readonly VNextTextBlockSpatialInlineImageFragmentV2[]
}): VNextTextBlockSpatialFragmentV2[] {
  return [...input.text, ...input.images].sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
    || left.renderEndOffset - right.renderEndOffset
  ))
}

function linePayload(input: {
  layoutId: string
  evidence: VNextTextBlockFlowEvidenceV2
  projected: readonly ProjectedAtomV2[]
  candidate: VNextTextBlockCandidatePlacementKernelV1
  baselineOffsetLayoutUnit: number
}): LinePayloadV2 | null {
  const first = input.candidate.placedAtoms[0]?.atom
  const last = input.candidate.placedAtoms.at(-1)?.atom
  if (first == null || last == null) return null
  const text = textFragments({
    layoutId: input.layoutId,
    lineIndex: input.candidate.lineIndex,
    evidence: input.evidence,
    placedAtoms: input.candidate.placedAtoms,
    projected: input.projected,
  })
  const images = imageFragments({
    layoutId: input.layoutId,
    lineIndex: input.candidate.lineIndex,
    lineYLayoutUnit: input.candidate.lineYLayoutUnit,
    baselineOffsetLayoutUnit: input.baselineOffsetLayoutUnit,
    evidence: input.evidence,
    placedAtoms: input.candidate.placedAtoms,
    projected: input.projected,
  })
  if (text == null || images == null) return null
  return {
    renderStartOffset: first.renderStartOffset,
    renderEndOffset: last.renderEndOffset,
    intervalPlacements: intervalPlacements(input.candidate.placedAtoms),
    fragments: orderedFragments({ text, images }),
  }
}

function mapKernelIssue(code: string): VNextTextBlockSpatialWrappingIssueCodeV2 {
  if (
    code === "unsafe-layout-arithmetic"
    || code === "unbreakable-flow-item-overflow"
    || code === "no-vertical-progress"
    || code === "line-band-did-not-stabilize"
    || code === "invalid-flow-tree-projection"
  ) return code
  return "spatial-index-binding-mismatch"
}

export function layoutVNextTextBlockSpatialWrappingV2(
  input: V2LayoutInput,
): VNextTextBlockSpatialWrappingLayoutResultV2
export function layoutVNextTextBlockSpatialWrappingV2(
  input: unknown,
): VNextTextBlockSpatialWrappingLayoutResultV2
export function layoutVNextTextBlockSpatialWrappingV2(
  input: unknown,
): VNextTextBlockSpatialWrappingLayoutResultV2 {
  const envelope = exactInput(input)
  if (
    envelope == null
    || (
      Object.hasOwn(envelope, "bindProductionLayout")
      && typeof envelope.bindProductionLayout !== "boolean"
    )
  ) return blocked([issue(
    "invalid-input",
    "input",
    "V2 spatial wrapping requires an exact accessor-free data envelope",
  )])
  if (envelope.bindProductionLayout === true) return blocked([issue(
    "production-binding-forbidden",
    "bindProductionLayout",
    "V2 spatial wrapping cannot bind production layout",
  )])
  if (
    inspectVNextTextBlockInitialFlowV1(envelope.initialFlow).status !== "valid"
    || inspectVNextTextBlockFlowEvidenceV2(envelope.evidence).status !== "valid"
    || inspectVNextTextBlockPersistentFlowTreeV2(envelope.persistentFlowTree).status !== "valid"
    || !hasVNextTextBlockFlowEvidenceBindingInternalV2(
      envelope.evidence,
      envelope.initialFlow,
    )
    || envelope.evidence.initialFlowFingerprint !== envelope.initialFlow.fingerprint
    || envelope.persistentFlowTree.initialFlowFingerprint !== envelope.initialFlow.fingerprint
    || envelope.persistentFlowTree.flowEvidenceFingerprint !== envelope.evidence.fingerprint
  ) return blocked([issue(
    "layout-authority-mismatch",
    "initialFlow",
    "V2 spatial wrapping requires the exact Initial Flow, evidence, and tree authority",
  )])
  if (
    inspectVNextTextBlockSpatialIndexV2(envelope.spatialIndex).status !== "valid"
    || !hasSpatialIndexBindingV2({
      initialFlow: envelope.initialFlow,
      evidence: envelope.evidence,
      persistentFlowTree: envelope.persistentFlowTree,
      index: envelope.spatialIndex,
    })
  ) return blocked([issue(
    "spatial-index-binding-mismatch",
    "spatialIndex",
    "V2 spatial wrapping requires the exact authority-bound spatial index",
  )])
  if (
    !Number.isSafeInteger(envelope.startYLayoutUnit)
    || envelope.startYLayoutUnit < 0
  ) return blocked([issue(
    "unsafe-layout-arithmetic",
    "startYLayoutUnit",
    "V2 spatial wrapping start y must be a non-negative safe layout unit",
  )])
  const paragraph = paragraphMetrics(envelope)
  if (paragraph == null) return blocked([issue(
    "unsafe-layout-arithmetic",
    "evidence.paragraphStyle",
    "paragraph metrics exceed safe layout arithmetic",
  )])
  const atoms = collectAtoms(envelope.persistentFlowTree.root)
  const projection = projectAtoms({
    atoms,
    paragraphAscentLayoutUnit: paragraph.ascentLayoutUnit,
    paragraphDescentLayoutUnit: paragraph.descentLayoutUnit,
  })
  if (projection == null) return blocked([issue(
    "invalid-flow-tree-projection",
    "persistentFlowTree",
    "V2 flow atoms do not retain valid image alignment geometry",
  )])
  const groups = createVNextTextBlockBreakGroupsKernelV1({
    atoms: projection.kernelAtoms,
    breakOffsets: envelope.evidence.breakOffsets,
    renderedUtf16Length: envelope.persistentFlowTree.summary.renderedUtf16Length,
  })
  if (groups.status !== "accepted") return blocked([issue(
    groups.issues[0]?.code === "unsafe-layout-arithmetic"
      ? "unsafe-layout-arithmetic"
      : "invalid-flow-tree-projection",
    "evidence.breakOffsets",
    groups.issues[0]?.message ?? "V2 break-group projection blocked",
  )])
  const naturalParagraphHeight = safeSum([
    paragraph.ascentLayoutUnit,
    paragraph.descentLayoutUnit,
  ])
  if (naturalParagraphHeight == null) return blocked([issue(
    "unsafe-layout-arithmetic",
    "evidence.paragraphStyle",
    "paragraph line height exceeds safe layout arithmetic",
  )])
  const baseBandHeightLayoutUnit = Math.max(
    envelope.evidence.declaredLineHeightLayoutUnit,
    naturalParagraphHeight,
  )
  const maximumBandRequeryCount =
    envelope.spatialIndex.summary.flowAffectingEntryCount + 1
  const kernel = runVNextTextBlockSpatialWrappingKernelV1({
    groups: groups.groups,
    startYLayoutUnit: envelope.startYLayoutUnit,
    baseBandHeightLayoutUnit,
    maximumBandRequeryCount,
    provideRegion: (band) => {
      const region = provideVNextTextBlockFlowRegionsV2({
        initialFlow: envelope.initialFlow,
        evidence: envelope.evidence,
        persistentFlowTree: envelope.persistentFlowTree,
        spatialIndex: envelope.spatialIndex,
        band,
        contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
      })
      if (region.status !== "accepted") return {
        status: "blocked" as const,
        intervals: null,
        nextYLayoutUnit: null,
        regionFingerprint: null,
        work: null,
        issues: region.issues.map((item) => ({
          code: item.code,
          message: item.message,
        })),
      }
      return {
        status: "accepted" as const,
        intervals: region.intervals,
        nextYLayoutUnit: region.nextYLayoutUnit,
        regionFingerprint: region.fingerprint,
        work: region.work,
        issues: [] as [],
      }
    },
    measureCandidate: (candidate) => {
      const textExtents: VNextTextBlockBaselineExtentV1[] = []
      const imageExtents: VNextTextBlockBaselineExtentV1[] = []
      for (const placed of candidate.placedAtoms) {
        const projected = projection.projected[placed.atom.payloadIndex]
        if (projected == null) return {
          status: "blocked" as const,
          heightLayoutUnit: null,
          baselineOffsetLayoutUnit: null,
          payload: null,
          issues: [{
            code: "invalid-flow-tree-projection",
            message: "placed atom payload is not retained by V2 flow projection",
          }],
        }
        if (projected.atom.kind === "text-cluster") {
          textExtents.push({
            topFromBaselineLayoutUnit: -projected.atom.ascentLayoutUnit,
            bottomFromBaselineLayoutUnit: projected.atom.descentLayoutUnit,
          })
        } else if (projected.atom.kind === "inline-image" && projected.imageExtent != null) {
          imageExtents.push(projected.imageExtent)
        }
      }
      const metrics = combineVNextTextBlockFlowLineMetricsV2({
        lineYLayoutUnit: candidate.lineYLayoutUnit,
        declaredLineHeightLayoutUnit: envelope.evidence.declaredLineHeightLayoutUnit,
        candidateBandHeightLayoutUnit: candidate.candidateBandHeightLayoutUnit,
        paragraphAscentLayoutUnit: paragraph.ascentLayoutUnit,
        paragraphDescentLayoutUnit: paragraph.descentLayoutUnit,
        textExtents,
        imageExtents,
      })
      if (metrics.status !== "accepted") return {
        status: "blocked" as const,
        heightLayoutUnit: null,
        baselineOffsetLayoutUnit: null,
        payload: null,
        issues: metrics.issues.map((item) => ({
          code: "unsafe-layout-arithmetic",
          message: item.message,
        })),
      }
      const payload = linePayload({
        layoutId: envelope.evidence.layoutId,
        evidence: envelope.evidence,
        projected: projection.projected,
        candidate,
        baselineOffsetLayoutUnit: metrics.baselineOffsetLayoutUnit,
      })
      if (payload == null) return {
        status: "blocked" as const,
        heightLayoutUnit: null,
        baselineOffsetLayoutUnit: null,
        payload: null,
        issues: [{
          code: "invalid-flow-tree-projection",
          message: "V2 placed fragments do not match retained flow atoms",
        }],
      }
      return {
        status: "accepted" as const,
        heightLayoutUnit: metrics.heightLayoutUnit,
        baselineOffsetLayoutUnit: metrics.baselineOffsetLayoutUnit,
        payload,
        issues: [] as [],
      }
    },
  })
  if (kernel.status !== "accepted") {
    const first = kernel.issues[0]
    return blocked([issue(
      mapKernelIssue(first?.code ?? "spatial-index-binding-mismatch"),
      "spatialWrappingKernel",
      first?.message ?? "V2 spatial wrapping kernel blocked",
      first?.lineIndex,
    )])
  }
  const lines: VNextTextBlockSpatialWrappedLineV2[] = kernel.lines.map((line) => {
    const payload = line.metricPayload as LinePayloadV2
    const facts = {
      index: line.lineIndex,
      renderStartOffset: payload.renderStartOffset,
      renderEndOffset: payload.renderEndOffset,
      yOffsetLayoutUnit: line.lineYLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
      availableIntervals: line.intervals,
      intervalPlacements: payload.intervalPlacements,
      fragments: payload.fragments,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        envelope.evidence.measurement.runs,
        payload.renderStartOffset,
        payload.renderEndOffset,
      ),
      regionFingerprint: line.regionFingerprint,
    }
    return deepFreeze({ ...facts, fingerprint: fingerprint(facts) })
  })
  const lastLine = lines.at(-1)
  const endYLayoutUnit = lastLine == null
    ? envelope.startYLayoutUnit
    : safeSum([lastLine.yOffsetLayoutUnit, lastLine.heightLayoutUnit])
  if (endYLayoutUnit == null) return blocked([issue(
    "unsafe-layout-arithmetic",
    "summary.heightLayoutUnit",
    "V2 spatial layout height exceeds safe arithmetic",
  )])
  const heightLayoutUnit = endYLayoutUnit - envelope.startYLayoutUnit
  if (!Number.isSafeInteger(heightLayoutUnit)) return blocked([issue(
    "unsafe-layout-arithmetic",
    "summary.heightLayoutUnit",
    "V2 spatial layout height exceeds safe arithmetic",
  )])
  const facts = {
    status: "accepted" as const,
    source: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION,
    documentId: envelope.persistentFlowTree.documentId,
    sectionId: envelope.persistentFlowTree.sectionId,
    textBlockId: envelope.persistentFlowTree.textBlockId,
    instanceRevision: envelope.persistentFlowTree.instanceRevision,
    layoutId: envelope.persistentFlowTree.layoutId,
    initialFlowFingerprint: envelope.initialFlow.fingerprint,
    flowEvidenceFingerprint: envelope.evidence.fingerprint,
    persistentFlowTreeFingerprint: envelope.persistentFlowTree.fingerprint,
    spatialIndexFingerprint: envelope.spatialIndex.fingerprint,
    alignmentPolicyFingerprint:
      VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
    lines,
    summary: {
      lineCount: lines.length,
      textFragmentCount: lines.reduce(
        (count, line) => count + line.fragments.filter((item) => item.kind === "text").length,
        0,
      ),
      inlineImageFragmentCount: lines.reduce(
        (count, line) => count + line.fragments.filter((item) => item.kind === "inline-image").length,
        0,
      ),
      intervalPlacementCount: lines.reduce(
        (count, line) => count + line.intervalPlacements.length,
        0,
      ),
      heightLayoutUnit,
    },
    work: kernel.work,
    contracts: {
      sharedSpatialPlacementKernel: true as const,
      multiIntervalRectangularWrapping: true as const,
      topBottomBarrierAdvancement: true as const,
      overlayRemovesFlowSpace: false as const,
      coreOwnsInlineImageGeometry: true as const,
      rendererMayMeasureText: false as const,
      rendererMayRelayout: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
    mayPublishLayout: false as const,
    productionBinding: false as const,
    issues: [] as [],
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const result = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(canonicalFacts),
  })
  layouts.set(result, { canonicalFacts, fingerprint: result.fingerprint })
  return result
}

export function inspectVNextTextBlockSpatialWrappingLayoutV2(
  result: unknown,
): VNextTextBlockSpatialWrappingLayoutInspectionV2 {
  if (
    result == null
    || typeof result !== "object"
    || !layouts.has(result)
  ) return {
    status: "invalid",
    code: "spatial-layout-provenance-mismatch",
    message: "V2 spatial layout is not the exact process-local Core result",
  }
  if (!deeplyFrozen(result)) return {
    status: "invalid",
    code: "spatial-layout-not-deeply-frozen",
    message: "registered V2 spatial layout must remain recursively frozen",
  }
  try {
    const accepted = result as Extract<
      VNextTextBlockSpatialWrappingLayoutResultV2,
      { status: "accepted" }
    >
    const binding = layouts.get(accepted)
    const { fingerprint: resultFingerprint, ...facts } = accepted
    const canonicalFacts = stringifyVNextCanonicalJson(facts)
    if (
      binding == null
      || binding.canonicalFacts !== canonicalFacts
      || binding.fingerprint !== resultFingerprint
      || createVNextCompactFingerprint(canonicalFacts) !== resultFingerprint
    ) return {
      status: "invalid",
      code: "spatial-layout-fingerprint-mismatch",
      message: "registered V2 spatial layout no longer matches canonical Core facts",
    }
    return { status: "valid", fingerprint: resultFingerprint }
  } catch {
    return {
      status: "invalid",
      code: "spatial-layout-fingerprint-mismatch",
      message: "registered V2 spatial layout is not canonically fingerprintable",
    }
  }
}
