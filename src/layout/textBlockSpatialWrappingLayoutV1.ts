import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { scaleVNextFontMetricToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import {
  createVNextTextBlockMultiRunSourceSegmentsV1,
  deriveVNextTextBlockMultiRunAcceptedRunsV1,
  safeVNextTextBlockMultiRunSumV1,
} from "./textBlockMultiRunDerivationV1.js"
import type {
  VNextTextBlockAcceptedShapingRunV1,
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockPositionedFragmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"
import { inspectVNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowTreeV1.js"
import { hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1 } from "./textBlockPersistentFlowTreeInternalsV1.js"
import {
  inspectVNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexV1.js"
import type {
  VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  deeplyFrozenSpatialV1,
  deepFreezeSpatialV1,
  hasSpatialIndexBindingV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import {
  provideVNextTextBlockFlowRegionsV1,
} from "./textBlockFlowRegionProviderV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_SOURCE,
  VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_VERSION,
  type VNextTextBlockSpatialIntervalPlacementV1,
  type VNextTextBlockSpatialWrappedLineV1,
  type VNextTextBlockSpatialWrappingIssueCodeV1,
  type VNextTextBlockSpatialWrappingIssueV1,
  type VNextTextBlockSpatialWrappingLayoutInspectionV1,
  type VNextTextBlockSpatialWrappingLayoutResultV1,
} from "./textBlockSpatialWrappingLayoutContractV1.js"
import {
  createVNextTextBlockBreakGroupsKernelV1,
  runVNextTextBlockSpatialWrappingKernelV1,
  type VNextTextBlockBreakGroupKernelV1,
  type VNextTextBlockCandidatePlacementKernelV1,
} from "./textBlockSpatialWrappingKernelV1.js"

interface ProjectedClusterV1 {
  run: VNextTextBlockAcceptedShapingRunV1
  renderStartOffset: number
  renderEndOffset: number
  advanceLayoutUnit: number
}

interface ParagraphMetricsV1 {
  ascentLayoutUnit: number
  descentLayoutUnit: number
}

interface PlacedClusterV1 extends ProjectedClusterV1 {
  intervalIndex: number
  xLayoutUnit: number
}

const processLocalSpatialLayoutsV1 = new WeakSet<object>()

function issue(
  code: VNextTextBlockSpatialWrappingIssueCodeV1,
  path: string,
  message: string,
  lineIndex?: number,
): VNextTextBlockSpatialWrappingIssueV1 {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(lineIndex == null ? {} : { lineIndex }),
  }
}

function blocked(
  issues: VNextTextBlockSpatialWrappingIssueV1[],
): VNextTextBlockSpatialWrappingLayoutResultV1 {
  return {
    status: "blocked",
    lines: null,
    summary: null,
    work: null,
    mayPublishLayout: false,
    productionBinding: false,
    fingerprint: null,
    issues,
  }
}

function projectGroups(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  tree: VNextTextBlockPersistentFlowTreeV1
}): {
  status: "accepted"
  acceptedRuns: VNextTextBlockAcceptedShapingRunV1[]
  clusters: ProjectedClusterV1[]
  groups: readonly VNextTextBlockBreakGroupKernelV1[]
  paragraphMetrics: ParagraphMetricsV1
} | {
  status: "blocked"
  message: string
} {
  const textLength = input.request.measurement.renderedText.length
  if (
    input.tree.summary.renderedUtf16Length !== textLength
    || input.request.breakOffsets[0] !== 0
    || input.request.breakOffsets.at(-1) !== textLength
  ) return {
    status: "blocked",
    message: "persistent flow summary and retained break coverage must match rendered text",
  }
  const derived = deriveVNextTextBlockMultiRunAcceptedRunsV1(input.request)
  if (derived.status !== "accepted") return {
    status: "blocked",
    message: derived.message,
  }
  const paragraphFace = input.request.fontFaces.find(
    (face) => face.fontFaceId === input.request.paragraphStyle.fontFaceId,
  )
  if (paragraphFace == null) return {
    status: "blocked",
    message: "paragraph font face is unavailable",
  }
  const paragraphAscent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: paragraphFace.ascentFontUnit,
    fontSizeLayoutUnit: input.request.paragraphStyle.fontSizeLayoutUnit,
    unitsPerEm: paragraphFace.unitsPerEm,
  })
  const paragraphDescent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: paragraphFace.descentFontUnit,
    fontSizeLayoutUnit: input.request.paragraphStyle.fontSizeLayoutUnit,
    unitsPerEm: paragraphFace.unitsPerEm,
  })
  if (
    paragraphAscent.status !== "accepted"
    || paragraphDescent.status !== "accepted"
  ) return {
    status: "blocked",
    message: "paragraph metrics exceed safe layout arithmetic",
  }
  const paragraphMetrics = {
    ascentLayoutUnit: paragraphAscent.layoutUnit,
    descentLayoutUnit: paragraphDescent.layoutUnit === 0
      ? 0
      : -paragraphDescent.layoutUnit,
  }
  const clusters = derived.value.flatMap((run) => run.clusters.map((cluster) => ({
    run,
    renderStartOffset: cluster.renderStartOffset,
    renderEndOffset: cluster.renderEndOffset,
    advanceLayoutUnit: cluster.advanceLayoutUnit,
  }))).sort((
    left,
    right,
  ) => left.renderStartOffset - right.renderStartOffset
    || left.renderEndOffset - right.renderEndOffset)
  const hardBreaks = input.request.measurement.runs
    .filter((run) => run.kind === "hard-break")
    .map((run) => ({
      renderStartOffset: run.renderStartOffset,
      renderEndOffset: run.renderEndOffset,
    }))
  const atoms = [
    ...clusters.map((cluster, payloadIndex) => ({
      kind: "text-cluster" as const,
      renderStartOffset: cluster.renderStartOffset,
      renderEndOffset: cluster.renderEndOffset,
      advanceLayoutUnit: cluster.advanceLayoutUnit,
      payloadIndex,
    })),
    ...hardBreaks.map((hardBreak, payloadIndex) => ({
      kind: "hard-break" as const,
      renderStartOffset: hardBreak.renderStartOffset,
      renderEndOffset: hardBreak.renderEndOffset,
      advanceLayoutUnit: 0 as const,
      payloadIndex,
    })),
  ].sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
    || left.renderEndOffset - right.renderEndOffset
  ))
  const groups = createVNextTextBlockBreakGroupsKernelV1({
    atoms,
    breakOffsets: input.request.breakOffsets,
    renderedUtf16Length: textLength,
  })
  if (groups.status !== "accepted") return {
    status: "blocked",
    message: groups.issues[0]?.message ?? "placement atom projection is invalid",
  }
  return {
    status: "accepted",
    acceptedRuns: derived.value,
    clusters,
    groups: groups.groups,
    paragraphMetrics,
  }
}

function createFragments(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  lineIndex: number
  placedClusters: readonly PlacedClusterV1[]
}): VNextTextBlockPositionedFragmentV1[] {
  const groups: Array<{
    run: VNextTextBlockAcceptedShapingRunV1
    intervalIndex: number
    renderStartOffset: number
    renderEndOffset: number
    xLayoutUnit: number
    advanceLayoutUnit: number
  }> = []
  for (const cluster of input.placedClusters) {
    const previous = groups.at(-1)
    if (
      previous?.run === cluster.run
      && previous.intervalIndex === cluster.intervalIndex
      && previous.renderEndOffset === cluster.renderStartOffset
      && previous.xLayoutUnit + previous.advanceLayoutUnit === cluster.xLayoutUnit
    ) {
      previous.renderEndOffset = cluster.renderEndOffset
      previous.advanceLayoutUnit += cluster.advanceLayoutUnit
    } else {
      groups.push({
        run: cluster.run,
        intervalIndex: cluster.intervalIndex,
        renderStartOffset: cluster.renderStartOffset,
        renderEndOffset: cluster.renderEndOffset,
        xLayoutUnit: cluster.xLayoutUnit,
        advanceLayoutUnit: cluster.advanceLayoutUnit,
      })
    }
  }
  return groups.map((group) => {
    const facts = {
      fragmentId: `${input.request.layoutId}:line-${input.lineIndex}:run-${group.run.shapingRunId}:${group.renderStartOffset}-${group.renderEndOffset}`,
      shapingRunId: group.run.shapingRunId,
      renderStartOffset: group.renderStartOffset,
      renderEndOffset: group.renderEndOffset,
      text: input.request.measurement.renderedText.slice(
        group.renderStartOffset,
        group.renderEndOffset,
      ),
      xLayoutUnit: group.xLayoutUnit,
      advanceLayoutUnit: group.advanceLayoutUnit,
      baselineShiftLayoutUnit: 0 as const,
      styleKey: group.run.styleKey,
      fontFaceId: group.run.fontFaceId,
      fontFamily: group.run.fontFamily,
      fontSha256: group.run.fontSha256,
      fontWeight: group.run.fontWeight,
      fontStyle: group.run.fontStyle,
      fontSizeLayoutUnit: group.run.fontSizeLayoutUnit,
      textColor: group.run.textColor,
      ascentLayoutUnit: group.run.ascentLayoutUnit,
      descentLayoutUnit: group.run.descentLayoutUnit,
      lineGapLayoutUnit: group.run.lineGapLayoutUnit,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        input.request.measurement.runs,
        group.renderStartOffset,
        group.renderEndOffset,
      ),
    }
    return {
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    }
  })
}

interface V1LineMetricPayload {
  renderStartOffset: number
  renderEndOffset: number
  fragments: readonly VNextTextBlockPositionedFragmentV1[]
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
}

function createV1LineMetricPayload(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  projection: Extract<ReturnType<typeof projectGroups>, { status: "accepted" }>
  candidate: VNextTextBlockCandidatePlacementKernelV1
}): V1LineMetricPayload | null {
  const firstAtom = input.candidate.placedAtoms[0]?.atom
  const lastAtom = input.candidate.placedAtoms.at(-1)?.atom
  if (firstAtom == null || lastAtom == null) return null
  const placedClusters: PlacedClusterV1[] = []
  const intervalPlacements: VNextTextBlockSpatialIntervalPlacementV1[] = []
  for (const placedAtom of input.candidate.placedAtoms) {
    const previousPlacement = intervalPlacements.at(-1)
    if (
      previousPlacement?.intervalIndex === placedAtom.intervalIndex
      && previousPlacement.renderEndOffset === placedAtom.atom.renderStartOffset
      && previousPlacement.xEndLayoutUnit === placedAtom.xStartLayoutUnit
    ) {
      previousPlacement.renderEndOffset = placedAtom.atom.renderEndOffset
      previousPlacement.xEndLayoutUnit = placedAtom.xEndLayoutUnit
    } else {
      intervalPlacements.push({
        intervalIndex: placedAtom.intervalIndex,
        renderStartOffset: placedAtom.atom.renderStartOffset,
        renderEndOffset: placedAtom.atom.renderEndOffset,
        xStartLayoutUnit: placedAtom.xStartLayoutUnit,
        xEndLayoutUnit: placedAtom.xEndLayoutUnit,
      })
    }
    if (placedAtom.atom.kind !== "text-cluster") continue
    const cluster = input.projection.clusters[placedAtom.atom.payloadIndex]
    if (
      cluster == null
      || cluster.renderStartOffset !== placedAtom.atom.renderStartOffset
      || cluster.renderEndOffset !== placedAtom.atom.renderEndOffset
      || cluster.advanceLayoutUnit !== placedAtom.atom.advanceLayoutUnit
    ) return null
    placedClusters.push({
      ...cluster,
      intervalIndex: placedAtom.intervalIndex,
      xLayoutUnit: placedAtom.xStartLayoutUnit,
    })
  }
  return {
    renderStartOffset: firstAtom.renderStartOffset,
    renderEndOffset: lastAtom.renderEndOffset,
    fragments: createFragments({
      request: input.request,
      lineIndex: input.candidate.lineIndex,
      placedClusters,
    }),
    intervalPlacements,
  }
}

function lineMetrics(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  paragraphMetrics: ParagraphMetricsV1
  fragments: readonly VNextTextBlockPositionedFragmentV1[]
  minimumHeightLayoutUnit: number
}): {
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
} | null {
  const metricSource = input.fragments.length === 0
    ? [input.paragraphMetrics]
    : input.fragments
  const ascentLayoutUnit = metricSource.reduce(
    (maximum, item) => Math.max(maximum, item.ascentLayoutUnit),
    0,
  )
  const descentLayoutUnit = metricSource.reduce(
    (maximum, item) => Math.max(maximum, item.descentLayoutUnit),
    0,
  )
  const naturalHeightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    ascentLayoutUnit,
    descentLayoutUnit,
  ])
  if (naturalHeightLayoutUnit == null) return null
  const heightLayoutUnit = Math.max(
    input.request.declaredLineHeightLayoutUnit,
    naturalHeightLayoutUnit,
    input.minimumHeightLayoutUnit,
  )
  const leadingBeforeLayoutUnit = Math.floor(
    (heightLayoutUnit - naturalHeightLayoutUnit) / 2,
  )
  const baselineOffsetLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    leadingBeforeLayoutUnit,
    ascentLayoutUnit,
  ])
  return baselineOffsetLayoutUnit == null
    ? null
    : { heightLayoutUnit, baselineOffsetLayoutUnit }
}

export function layoutVNextTextBlockSpatialWrappingV1(input: {
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  spatialIndex: VNextTextBlockSpatialIndexV1
  startYLayoutUnit: number
  bindProductionLayout?: boolean
}): VNextTextBlockSpatialWrappingLayoutResultV1 {
  if (
    input.bindProductionLayout === true
    || input.request.bindProductionLayout === true
  ) return blocked([
    issue(
      "production-binding-forbidden",
      "bindProductionLayout",
      "spatial wrapping cannot bind production layout",
    ),
  ])
  const treeInspection = inspectVNextTextBlockPersistentFlowTreeV1(
    input.persistentFlowTree,
  )
  if (treeInspection.status !== "valid") return blocked([
    issue(
      "flow-tree-provenance-mismatch",
      "persistentFlowTree",
      treeInspection.message,
    ),
  ])
  if (!hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(
    input.persistentFlowTree,
    input.request,
  )) return blocked([
    issue(
      "flow-tree-request-binding-mismatch",
      "request",
      "spatial wrapping requires the exact unchanged request bound to the persistent flow tree",
    ),
  ])
  const indexInspection = inspectVNextTextBlockSpatialIndexV1(input.spatialIndex)
  if (
    indexInspection.status !== "valid"
    || !hasSpatialIndexBindingV1({
      index: input.spatialIndex,
      persistentFlowTree: input.persistentFlowTree,
      request: input.request,
    })
  ) return blocked([
    issue(
      "spatial-index-binding-mismatch",
      "spatialIndex",
      "spatial wrapping requires the exact index bound to the persistent flow tree and request",
    ),
  ])
  if (
    !Number.isSafeInteger(input.startYLayoutUnit)
    || input.startYLayoutUnit < 0
  ) return blocked([
    issue(
      "invalid-start-y",
      "startYLayoutUnit",
      "spatial wrapping start y must be a non-negative safe layout unit",
    ),
  ])
  const projection = projectGroups({
    request: input.request,
    tree: input.persistentFlowTree,
  })
  if (projection.status !== "accepted") return blocked([
    issue(
      "invalid-flow-tree-projection",
      "request",
      projection.message,
    ),
  ])
  const paragraphNaturalHeightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    projection.paragraphMetrics.ascentLayoutUnit,
    projection.paragraphMetrics.descentLayoutUnit,
  ])
  if (paragraphNaturalHeightLayoutUnit == null) return blocked([
    issue(
      "unsafe-layout-arithmetic",
      "request.paragraphStyle",
      "paragraph metrics exceed safe layout arithmetic",
    ),
  ])
  const baseBandHeight = Math.max(
    input.request.declaredLineHeightLayoutUnit,
    paragraphNaturalHeightLayoutUnit,
  )
  const kernel = runVNextTextBlockSpatialWrappingKernelV1({
    groups: projection.groups,
    startYLayoutUnit: input.startYLayoutUnit,
    baseBandHeightLayoutUnit: baseBandHeight,
    maximumBandRequeryCount:
      input.spatialIndex.summary.flowAffectingEntryCount + 1,
    provideRegion: (band) => {
      const region = provideVNextTextBlockFlowRegionsV1({
        spatialIndex: input.spatialIndex,
        persistentFlowTree: input.persistentFlowTree,
        request: input.request,
        band,
        contentInsets: {
          leftLayoutUnit: 0,
          rightLayoutUnit: 0,
        },
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
      const payload = createV1LineMetricPayload({
        request: input.request,
        projection,
        candidate,
      })
      if (payload == null) return {
        status: "blocked" as const,
        heightLayoutUnit: null,
        baselineOffsetLayoutUnit: null,
        payload: null,
        issues: [{
          code: "invalid-flow-tree-projection",
          message: "kernel placement does not match retained V1 cluster payloads",
        }],
      }
      const metrics = lineMetrics({
        request: input.request,
        paragraphMetrics: projection.paragraphMetrics,
        fragments: payload.fragments,
        minimumHeightLayoutUnit: candidate.candidateBandHeightLayoutUnit,
      })
      if (metrics == null) return {
        status: "blocked" as const,
        heightLayoutUnit: null,
        baselineOffsetLayoutUnit: null,
        payload: null,
        issues: [{
          code: "unsafe-layout-arithmetic",
          message: "line metrics exceed safe layout arithmetic",
        }],
      }
      return {
        status: "accepted" as const,
        ...metrics,
        payload,
        issues: [] as [],
      }
    },
  })
  if (kernel.status !== "accepted") {
    const kernelIssue = kernel.issues[0]
    const code: VNextTextBlockSpatialWrappingIssueCodeV1 = (
      kernelIssue?.code === "unbreakable-flow-item-overflow"
      || kernelIssue?.code === "no-vertical-progress"
      || kernelIssue?.code === "line-band-did-not-stabilize"
      || kernelIssue?.code === "unsafe-layout-arithmetic"
    )
      ? kernelIssue.code
      : kernelIssue?.code === "invalid-flow-tree-projection"
        ? "invalid-flow-tree-projection"
        : "spatial-index-binding-mismatch"
    return blocked([issue(
      code,
      "spatialWrappingKernel",
      kernelIssue?.message ?? "spatial wrapping kernel blocked",
      kernelIssue?.lineIndex,
    )])
  }
  const lines: VNextTextBlockSpatialWrappedLineV1[] = kernel.lines.map((line) => {
    const payload = line.metricPayload as V1LineMetricPayload
    const lineFacts = {
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
        input.request.measurement.runs,
        payload.renderStartOffset,
        payload.renderEndOffset,
      ),
      regionFingerprint: line.regionFingerprint,
    }
    return deepFreezeSpatialV1({
      ...lineFacts,
      fingerprint: spatialFingerprintV1(lineFacts),
    })
  })
  const lastLine = lines.at(-1)
  const endYLayoutUnit = lastLine == null
    ? input.startYLayoutUnit
    : safeVNextTextBlockMultiRunSumV1([
        lastLine.yOffsetLayoutUnit,
        lastLine.heightLayoutUnit,
      ])
  if (endYLayoutUnit == null) return blocked([
    issue(
      "unsafe-layout-arithmetic",
      "summary.heightLayoutUnit",
      "spatial layout height exceeds safe arithmetic",
    ),
  ])
  const heightLayoutUnit = endYLayoutUnit - input.startYLayoutUnit
  if (!Number.isSafeInteger(heightLayoutUnit)) return blocked([
    issue(
      "unsafe-layout-arithmetic",
      "summary.heightLayoutUnit",
      "spatial layout height exceeds safe arithmetic",
    ),
  ])
  const facts = {
    status: "accepted" as const,
    source: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_VERSION,
    documentId: input.persistentFlowTree.documentId,
    sectionId: input.persistentFlowTree.sectionId,
    textBlockId: input.persistentFlowTree.textBlockId,
    instanceRevision: input.persistentFlowTree.instanceRevision,
    layoutContextFingerprint: input.persistentFlowTree.layoutContextFingerprint,
    persistentFlowTreeFingerprint: input.persistentFlowTree.fingerprint,
    spatialIndexFingerprint: input.spatialIndex.fingerprint,
    lines,
    summary: {
      lineCount: lines.length,
      fragmentCount: lines.reduce((count, line) => count + line.fragments.length, 0),
      intervalPlacementCount: lines.reduce(
        (count, line) => count + line.intervalPlacements.length,
        0,
      ),
      heightLayoutUnit,
    },
    work: kernel.work,
    contracts: {
      multiIntervalRectangularWrapping: true as const,
      topBottomBarrierAdvancement: true as const,
      overlayRemovesFlowSpace: false as const,
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
  const result = deepFreezeSpatialV1({
    ...facts,
    fingerprint: spatialFingerprintV1(facts),
  })
  processLocalSpatialLayoutsV1.add(result)
  return result
}

export function inspectVNextTextBlockSpatialWrappingLayoutV1(
  result: unknown,
): VNextTextBlockSpatialWrappingLayoutInspectionV1 {
  if (
    result == null
    || typeof result !== "object"
    || !processLocalSpatialLayoutsV1.has(result)
  ) return {
    status: "invalid",
    code: "spatial-layout-provenance-mismatch",
    message: "spatial layout is not the exact process-local result created by Core",
  }
  if (!deeplyFrozenSpatialV1(result)) return {
    status: "invalid",
    code: "spatial-layout-not-deeply-frozen",
    message: "registered spatial layout must remain recursively frozen",
  }
  return {
    status: "valid",
    fingerprint: (result as Extract<
      VNextTextBlockSpatialWrappingLayoutResultV1,
      { status: "accepted" }
    >).fingerprint,
  }
}
