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
  type VNextTextBlockFlowIntervalV1,
  type VNextTextBlockFlowRegionResultV1,
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
  type VNextTextBlockSpatialWrappingWorkV1,
} from "./textBlockSpatialWrappingLayoutContractV1.js"

interface ProjectedClusterV1 {
  run: VNextTextBlockAcceptedShapingRunV1
  renderStartOffset: number
  renderEndOffset: number
  advanceLayoutUnit: number
}

interface ProjectedGroupV1 {
  renderStartOffset: number
  renderEndOffset: number
  clusters: readonly ProjectedClusterV1[]
  advanceLayoutUnit: number
  mandatoryBreak: boolean
}

interface ParagraphMetricsV1 {
  ascentLayoutUnit: number
  descentLayoutUnit: number
}

interface PlacedClusterV1 extends ProjectedClusterV1 {
  intervalIndex: number
  xLayoutUnit: number
}

interface TentativePlacementV1 {
  status: "placed" | "overflow"
  nextGroupIndex: number
  placedClusters: PlacedClusterV1[]
  intervalPlacements: VNextTextBlockSpatialIntervalPlacementV1[]
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
  groups: ProjectedGroupV1[]
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
  const coverage = [
    ...clusters.map((cluster) => ({
      start: cluster.renderStartOffset,
      end: cluster.renderEndOffset,
    })),
    ...hardBreaks.map((hardBreak) => ({
      start: hardBreak.renderStartOffset,
      end: hardBreak.renderEndOffset,
    })),
  ].sort((left, right) => left.start - right.start || left.end - right.end)
  let expectedOffset = 0
  for (const item of coverage) {
    if (item.start !== expectedOffset || item.end <= item.start) return {
      status: "blocked",
      message: "retained shaping clusters and hard breaks must cover text without gaps",
    }
    expectedOffset = item.end
  }
  if (expectedOffset !== textLength) return {
    status: "blocked",
    message: "retained shaping clusters and hard breaks do not cover rendered text",
  }
  const groups: ProjectedGroupV1[] = []
  for (let index = 0; index < input.request.breakOffsets.length - 1; index += 1) {
    const renderStartOffset = input.request.breakOffsets[index]!
    const renderEndOffset = input.request.breakOffsets[index + 1]!
    if (
      !Number.isSafeInteger(renderStartOffset)
      || !Number.isSafeInteger(renderEndOffset)
      || renderEndOffset <= renderStartOffset
    ) return {
      status: "blocked",
      message: "retained break offsets must be strictly increasing safe integers",
    }
    const groupClusters = clusters.filter((cluster) => (
      cluster.renderStartOffset >= renderStartOffset
      && cluster.renderEndOffset <= renderEndOffset
    ))
    if (clusters.some((cluster) => (
      cluster.renderStartOffset < renderEndOffset
      && cluster.renderEndOffset > renderStartOffset
      && (
        cluster.renderStartOffset < renderStartOffset
        || cluster.renderEndOffset > renderEndOffset
      )
    ))) return {
      status: "blocked",
      message: "retained break boundary splits a shaping cluster",
    }
    const advanceLayoutUnit = safeVNextTextBlockMultiRunSumV1(
      groupClusters.map((cluster) => cluster.advanceLayoutUnit),
    )
    if (advanceLayoutUnit == null) return {
      status: "blocked",
      message: "break-safe group advance exceeds safe layout arithmetic",
    }
    groups.push({
      renderStartOffset,
      renderEndOffset,
      clusters: groupClusters,
      advanceLayoutUnit,
      mandatoryBreak: hardBreaks.some(
        (hardBreak) => hardBreak.renderEndOffset === renderEndOffset,
      ),
    })
  }
  return {
    status: "accepted",
    acceptedRuns: derived.value,
    groups,
    paragraphMetrics,
  }
}

function placeGroups(input: {
  groups: readonly ProjectedGroupV1[]
  startGroupIndex: number
  intervals: readonly VNextTextBlockFlowIntervalV1[]
}): TentativePlacementV1 {
  const placedClusters: PlacedClusterV1[] = []
  const intervalPlacements: VNextTextBlockSpatialIntervalPlacementV1[] = []
  let intervalIndex = 0
  let cursor = input.intervals[0]?.startLayoutUnit ?? 0
  let groupIndex = input.startGroupIndex
  while (groupIndex < input.groups.length) {
    const group = input.groups[groupIndex]!
    let selectedIntervalIndex: number | null = null
    let selectedX = 0
    for (
      let candidateIndex = intervalIndex;
      candidateIndex < input.intervals.length;
      candidateIndex += 1
    ) {
      const interval = input.intervals[candidateIndex]!
      const candidateX = candidateIndex === intervalIndex
        ? Math.max(cursor, interval.startLayoutUnit)
        : interval.startLayoutUnit
      const groupEnd = safeVNextTextBlockMultiRunSumV1([
        candidateX,
        group.advanceLayoutUnit,
      ])
      if (groupEnd != null && groupEnd <= interval.endLayoutUnit) {
        selectedIntervalIndex = candidateIndex
        selectedX = candidateX
        break
      }
    }
    if (selectedIntervalIndex == null) {
      return {
        status: placedClusters.length > 0 || groupIndex > input.startGroupIndex
          ? "placed"
          : "overflow",
        nextGroupIndex: groupIndex,
        placedClusters,
        intervalPlacements,
      }
    }
    intervalIndex = selectedIntervalIndex
    const groupEnd = selectedX + group.advanceLayoutUnit
    let clusterX = selectedX
    for (const cluster of group.clusters) {
      placedClusters.push({
        ...cluster,
        intervalIndex,
        xLayoutUnit: clusterX,
      })
      clusterX += cluster.advanceLayoutUnit
    }
    const previousPlacement = intervalPlacements.at(-1)
    if (
      previousPlacement?.intervalIndex === intervalIndex
      && previousPlacement.renderEndOffset === group.renderStartOffset
      && previousPlacement.xEndLayoutUnit === selectedX
    ) {
      previousPlacement.renderEndOffset = group.renderEndOffset
      previousPlacement.xEndLayoutUnit = groupEnd
    } else {
      intervalPlacements.push({
        intervalIndex,
        renderStartOffset: group.renderStartOffset,
        renderEndOffset: group.renderEndOffset,
        xStartLayoutUnit: selectedX,
        xEndLayoutUnit: groupEnd,
      })
    }
    cursor = groupEnd
    groupIndex += 1
    if (group.mandatoryBreak) break
  }
  return {
    status: "placed",
    nextGroupIndex: groupIndex,
    placedClusters,
    intervalPlacements,
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
  const ascentLayoutUnit = Math.max(
    ...metricSource.map((item) => item.ascentLayoutUnit),
  )
  const descentLayoutUnit = Math.max(
    ...metricSource.map((item) => item.descentLayoutUnit),
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

function accountRegionWork(
  work: VNextTextBlockSpatialWrappingWorkV1,
  region: Extract<VNextTextBlockFlowRegionResultV1, { status: "accepted" }>,
): void {
  if (region.work.fastPath === "no-flow-affecting-entry") {
    work.flowRegionFastPathCount += 1
  }
  work.spatialIndexQueryCount += region.work.spatialIndexQueryCount
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
  const lines: VNextTextBlockSpatialWrappedLineV1[] = []
  const work: VNextTextBlockSpatialWrappingWorkV1 = {
    flowRegionFastPathCount: 0,
    spatialIndexQueryCount: 0,
    verticalAdvanceCount: 0,
    lineBandRequeryCount: 0,
  }
  let groupIndex = 0
  let yLayoutUnit = input.startYLayoutUnit
  while (groupIndex < projection.groups.length) {
    const lineIndex = lines.length
    const lineStartGroupIndex = groupIndex
    let candidateHeight = baseBandHeight
    let lineAccepted = false
    let stabilizationCount = 0
    while (!lineAccepted) {
      const bandBottom = safeVNextTextBlockMultiRunSumV1([
        yLayoutUnit,
        candidateHeight,
      ])
      if (bandBottom == null) return blocked([
        issue(
          "unsafe-layout-arithmetic",
          "band",
          "line band exceeds safe layout arithmetic",
          lineIndex,
        ),
      ])
      const region = provideVNextTextBlockFlowRegionsV1({
        spatialIndex: input.spatialIndex,
        persistentFlowTree: input.persistentFlowTree,
        request: input.request,
        band: {
          topLayoutUnit: yLayoutUnit,
          bottomLayoutUnit: bandBottom,
        },
        contentInsets: {
          leftLayoutUnit: 0,
          rightLayoutUnit: 0,
        },
      })
      if (region.status !== "accepted") return blocked([
        issue(
          region.issues[0]?.code === "no-vertical-progress"
            ? "no-vertical-progress"
            : "spatial-index-binding-mismatch",
          "flowRegion",
          region.issues[0]?.message ?? "flow region provider blocked spatial wrapping",
          lineIndex,
        ),
      ])
      accountRegionWork(work, region)
      if (region.intervals.length === 0) {
        if (
          region.nextYLayoutUnit == null
          || region.nextYLayoutUnit <= yLayoutUnit
        ) return blocked([
          issue(
            "no-vertical-progress",
            "flowRegion.nextYLayoutUnit",
            "zero-space flow region must provide a strictly advancing y event",
            lineIndex,
          ),
        ])
        yLayoutUnit = region.nextYLayoutUnit
        work.verticalAdvanceCount += 1
        candidateHeight = baseBandHeight
        stabilizationCount = 0
        continue
      }
      const placement = placeGroups({
        groups: projection.groups,
        startGroupIndex: lineStartGroupIndex,
        intervals: region.intervals,
      })
      if (placement.status === "overflow") return blocked([
        issue(
          "unbreakable-flow-item-overflow",
          `groups[${lineStartGroupIndex}]`,
          "unbreakable flow item cannot fit any available interval",
          lineIndex,
        ),
      ])
      const fragments = createFragments({
        request: input.request,
        lineIndex,
        placedClusters: placement.placedClusters,
      })
      const metrics = lineMetrics({
        request: input.request,
        paragraphMetrics: projection.paragraphMetrics,
        fragments,
        minimumHeightLayoutUnit: candidateHeight,
      })
      if (metrics == null) return blocked([
        issue(
          "unsafe-layout-arithmetic",
          `lines[${lineIndex}]`,
          "line metrics exceed safe layout arithmetic",
          lineIndex,
        ),
      ])
      if (metrics.heightLayoutUnit > candidateHeight) {
        candidateHeight = metrics.heightLayoutUnit
        work.lineBandRequeryCount += 1
        stabilizationCount += 1
        if (
          stabilizationCount
          > input.spatialIndex.summary.flowAffectingEntryCount + 1
        ) return blocked([
          issue(
            "line-band-did-not-stabilize",
            `lines[${lineIndex}]`,
            "line band exceeded its finite spatial stabilization proof",
            lineIndex,
          ),
        ])
        continue
      }
      const renderStartOffset = projection.groups[lineStartGroupIndex]!.renderStartOffset
      const renderEndOffset = projection.groups[placement.nextGroupIndex - 1]!.renderEndOffset
      const lineFacts = {
        index: lineIndex,
        renderStartOffset,
        renderEndOffset,
        yOffsetLayoutUnit: yLayoutUnit,
        heightLayoutUnit: metrics.heightLayoutUnit,
        baselineOffsetLayoutUnit: metrics.baselineOffsetLayoutUnit,
        availableIntervals: region.intervals,
        intervalPlacements: placement.intervalPlacements,
        fragments,
        sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
          input.request.measurement.runs,
          renderStartOffset,
          renderEndOffset,
        ),
        regionFingerprint: region.fingerprint,
      }
      lines.push(deepFreezeSpatialV1({
        ...lineFacts,
        fingerprint: spatialFingerprintV1(lineFacts),
      }))
      groupIndex = placement.nextGroupIndex
      const nextY = safeVNextTextBlockMultiRunSumV1([
        yLayoutUnit,
        metrics.heightLayoutUnit,
      ])
      if (nextY == null) return blocked([
        issue(
          "unsafe-layout-arithmetic",
          `lines[${lineIndex}].heightLayoutUnit`,
          "line stack exceeds safe layout arithmetic",
          lineIndex,
        ),
      ])
      yLayoutUnit = nextY
      lineAccepted = true
    }
  }
  const heightLayoutUnit = yLayoutUnit - input.startYLayoutUnit
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
    work,
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
