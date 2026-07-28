import {
  acceptVNextTextBlockMultiRunLayoutV1,
  convertVNextPointToLayoutUnitV1,
  createVNextCompactFingerprint,
  createVNextLayoutUnitPolicyV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
} from "@flowdoc/vnext-core"
import {
  cloneFlowDocTextEngineEvidenceValueInternal as clone,
  createFlowDocTextEngineMultiRunIssueInternal as issue,
  prepareFlowDocTextEngineMultiRunEvidenceInternal,
} from "./multiRunEvidenceInternals.js"
import {
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_SOURCE,
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_VERSION,
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_PROFILE_SOURCE,
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_PROFILE_VERSION,
  type FlowDocTextEngineMultiRunLayoutInputV1,
  type FlowDocTextEngineMultiRunLayoutIssueV1,
  type FlowDocTextEngineMultiRunLayoutProfileV1,
  type FlowDocTextEngineMultiRunLayoutResultV1,
  type FlowDocTextEngineMultiRunProfileClockV1,
  type FlowDocTextEngineMultiRunProfilePhaseV1,
  type FlowDocTextEngineMultiRunRuntimeV1,
} from "./multiRunLayoutContract.js"

function facts(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
) {
  return {
    source: FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_VERSION,
    layoutId: input.layoutId,
    textBlockId: input.measurement.textBlockId,
    instanceRevision: input.measurement.instanceRevision,
    measurementProfileId: input.measurement.measurementProfileId,
    runtimeKind: runtime.runtimeKind,
    productionBinding: false as const,
  }
}

function blocked(
  base: ReturnType<typeof facts>,
  issues: FlowDocTextEngineMultiRunLayoutIssueV1[],
): FlowDocTextEngineMultiRunLayoutResultV1 {
  return {
    ...base,
    status: "blocked",
    request: null,
    layout: null,
    issues,
    fingerprint: null,
    summary: null,
  }
}

interface FlowDocTextEngineMultiRunProfileRecorderV1 {
  complete(phase: FlowDocTextEngineMultiRunProfilePhaseV1): void
}

function createFlowDocTextEngineMultiRunLayoutInternalV1(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
  profile: FlowDocTextEngineMultiRunProfileRecorderV1 | null,
): FlowDocTextEngineMultiRunLayoutResultV1 {
  const base = facts(input, runtime)
  const prepared = prepareFlowDocTextEngineMultiRunEvidenceInternal({
    layout: input,
    runtime,
    capability: "text-only-v1",
    ...(profile == null ? {} : { profile }),
  })
  if (prepared.status !== "accepted") return blocked(base, prepared.issues)

  const width = convertVNextPointToLayoutUnitV1(
    input.measurement.availableWidthPt,
    "measurement.availableWidthPt",
  )
  if (width.status !== "accepted" || width.layoutUnit <= 0) return blocked(base, [
    issue(
      "invalid-layout-input",
      "measurement.availableWidthPt",
      "measurement width cannot be represented by LayoutUnitPolicyV1",
    ),
  ])
  const allClusters = prepared.shapingRuns
    .flatMap((run) => run.clusters)
    .sort((left, right) => left.renderStartOffset - right.renderStartOffset)
  const cumulativeAtBreak = prepared.breakOffsets.map((offset) => {
    let total = 0
    for (const cluster of allClusters) {
      if (cluster.renderEndOffset > offset) break
      total += cluster.advanceLayoutUnit
      if (!Number.isSafeInteger(total)) return null
    }
    return total
  })
  if (cumulativeAtBreak.some((value) => value == null)) return blocked(base, [
    issue(
      "unsafe-cluster-advance",
      "breakOffsets",
      "cumulative line advances exceed the safe layout integer range",
    ),
  ])

  const mandatoryBreakSet = new Set(prepared.mandatoryBreakOffsets)
  const lines: VNextTextBlockMultiRunLayoutRequestV1["lines"] = []
  let startBreakIndex = 0
  while (startBreakIndex < prepared.breakOffsets.length - 1) {
    let endBreakIndex = startBreakIndex + 1
    let foundFittingBreak = false
    for (
      let candidateIndex = startBreakIndex + 1;
      candidateIndex < prepared.breakOffsets.length;
      candidateIndex += 1
    ) {
      const candidateWidth =
        cumulativeAtBreak[candidateIndex]! - cumulativeAtBreak[startBreakIndex]!
      if (candidateWidth <= width.layoutUnit) {
        endBreakIndex = candidateIndex
        foundFittingBreak = true
        if (mandatoryBreakSet.has(prepared.breakOffsets[candidateIndex]!)) break
        continue
      }
      if (!foundFittingBreak) endBreakIndex = candidateIndex
      break
    }
    lines.push({
      index: lines.length,
      renderStartOffset: prepared.breakOffsets[startBreakIndex]!,
      renderEndOffset: prepared.breakOffsets[endBreakIndex]!,
    })
    startBreakIndex = endBreakIndex
  }
  profile?.complete("line-breaking")

  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    layoutId: input.layoutId,
    measurement: clone(input.measurement),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: width.layoutUnit,
    declaredLineHeightLayoutUnit: input.declaredLineHeightLayoutUnit,
    paragraphStyle: clone(prepared.paragraphStyle),
    fontFaces: prepared.usedFontFaces.map((face) => clone(face)),
    shapingRuns: prepared.shapingRuns.map((run) => clone(run)),
    breakOffsets: [...prepared.breakOffsets],
    lines,
  }
  const layout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (layout.status !== "accepted") return blocked(base, layout.issues.map((item) => issue(
    "core-layout-blocked",
    item.path,
    `${item.code}: ${item.message}`,
    {
      ...(item.shapingRunId == null ? {} : { shapingRunId: item.shapingRunId }),
    },
  )))
  profile?.complete("core-acceptance-and-fingerprint")

  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    ...base,
    request,
    coreLayoutFingerprint: layout.fingerprint,
  }))
  profile?.complete("adapter-fingerprint")
  return {
    ...base,
    status: "accepted",
    request,
    layout,
    issues: [],
    fingerprint,
    summary: {
      sourceRunCount: prepared.sourceRunCount,
      effectiveRunCount: prepared.runtimeShapeCallCount,
      shapingRunCount: prepared.shapingRuns.length,
      clusterCount: prepared.shapingRuns.reduce(
        (sum, run) => sum + run.clusters.length,
        0,
      ),
      lineCount: lines.length,
      fontFaceCount: request.fontFaces.length,
      runtimeShapeCallCount: prepared.runtimeShapeCallCount,
      runtimeSegmentationCallCount: prepared.runtimeSegmentationCallCount,
    },
  }
}

export function createFlowDocTextEngineMultiRunLayoutV1(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineMultiRunLayoutResultV1 {
  return createFlowDocTextEngineMultiRunLayoutInternalV1(input, runtime, null)
}

export function profileFlowDocTextEngineMultiRunLayoutV1(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
  clock: FlowDocTextEngineMultiRunProfileClockV1,
): FlowDocTextEngineMultiRunLayoutProfileV1 {
  const phases: FlowDocTextEngineMultiRunProfilePhaseV1[] = [
    "input-and-style-resolution",
    "shaping",
    "segmentation",
    "line-breaking",
    "core-acceptance-and-fingerprint",
    "adapter-fingerprint",
  ]
  const phaseDurationMs = Object.fromEntries(phases.map((phase) => [phase, null])) as
    Record<FlowDocTextEngineMultiRunProfilePhaseV1, number | null>
  const completedPhases: FlowDocTextEngineMultiRunProfilePhaseV1[] = []
  const startedAt = clock.now()
  let phaseStartedAt = startedAt
  const result = createFlowDocTextEngineMultiRunLayoutInternalV1(input, runtime, {
    complete(phase) {
      const completedAt = clock.now()
      phaseDurationMs[phase] = Math.max(0, completedAt - phaseStartedAt)
      completedPhases.push(phase)
      phaseStartedAt = completedAt
    },
  })
  const completedAt = clock.now()
  return {
    source: FLOWDOC_TEXT_ENGINE_MULTI_RUN_PROFILE_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_MULTI_RUN_PROFILE_VERSION,
    productionBinding: false,
    result,
    completedPhases,
    phaseDurationMs,
    totalDurationMs: Math.max(0, completedAt - startedAt),
    work: {
      renderedUtf16Length: input.measurement.renderedText.length,
      sourceRunCount: input.measurement.runs.length,
      effectiveRunCount: result.summary?.effectiveRunCount ?? null,
      shapingRunCount: result.summary?.shapingRunCount ?? null,
      clusterCount: result.summary?.clusterCount ?? null,
      breakOpportunityCount: result.request?.breakOffsets.length ?? null,
      lineCount: result.summary?.lineCount ?? null,
    },
    contracts: {
      timingIsDiagnosticOnly: true,
      timingAffectsLayoutFingerprint: false,
      fullLayoutOracle: true,
      productionBinding: false,
    },
  }
}
