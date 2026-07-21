import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextTextBlockMultiRunSourceSegmentsV1,
  deriveVNextTextBlockMultiRunAcceptedRunsV1,
  safeVNextTextBlockMultiRunSumV1,
} from "./textBlockMultiRunDerivationV1.js"
import type {
  VNextTextBlockMultiRunIncrementalAcceptanceV1,
  VNextTextBlockMultiRunIncrementalSnapshotV1,
} from "./textBlockMultiRunIncrementalContractV1.js"
import { inspectVNextTextBlockMultiRunIncrementalSnapshotV1 } from "./textBlockMultiRunIncrementalSnapshotV1.js"
import {
  VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE,
  VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockAcceptedShapingRunV1,
  VNextTextBlockMultiRunLayoutFactsV1,
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockPositionedFragmentV1,
  VNextTextBlockPositionedLineV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import {
  createVNextTextBlockMultiRunSemanticLineFingerprintV1,
} from "./textBlockMultiRunSemanticV1.js"

export type VNextTextBlockMultiRunIncrementalMaterializationV1 =
  | {
      status: "materialized-for-qa"
      layout: Extract<VNextTextBlockMultiRunLayoutResultV1, { status: "accepted" }>
      contracts: {
        assembledFromIncrementalComposition: true
        completeCoreLayoutOracleStillRequired: true
        mayPublishLayout: false
        productionBinding: false
      }
      fingerprint: string
    }
  | {
      status: "blocked"
      layout: null
      message: string
      fingerprint: string
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

function validAcceptanceFingerprint(
  acceptance: Extract<VNextTextBlockMultiRunIncrementalAcceptanceV1, { status: "window-accepted" }>,
): boolean {
  const { fingerprint, ...facts } = acceptance
  return fingerprint === compact(facts)
}

function layoutFacts(request: VNextTextBlockMultiRunLayoutRequestV1): VNextTextBlockMultiRunLayoutFactsV1 {
  return {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION,
    layoutId: request.layoutId,
    textBlockId: request.measurement.textBlockId,
    instanceRevision: request.measurement.instanceRevision,
    measurementProfileId: request.measurement.measurementProfileId,
    layoutUnitPolicyFingerprint: request.layoutUnitPolicyFingerprint,
    contracts: {
      consumes: "vnext-text-block-v4-measurement",
      geometryUnit: "micro-point-integer",
      lineBreaks: "external-evidence-core-validated",
      fragmentPositioning: "core-derived-from-cluster-advances",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      coreLoadsFontBytes: false,
      coreExecutesShaping: false,
      artifactBytes: false,
      productionBinding: false,
    },
  }
}

function matchingRun(
  runs: readonly VNextTextBlockAcceptedShapingRunV1[],
  fragment: VNextTextBlockPositionedFragmentV1,
  renderStartOffset: number,
  renderEndOffset: number,
): VNextTextBlockAcceptedShapingRunV1 | null {
  const matches = runs.filter((run) => (
    run.renderStartOffset <= renderStartOffset
    && run.renderEndOffset >= renderEndOffset
    && run.styleKey === fragment.styleKey
    && run.fontFaceId === fragment.fontFaceId
    && run.fontFamily === fragment.fontFamily
    && run.fontSha256 === fragment.fontSha256
    && run.fontWeight === fragment.fontWeight
    && run.fontStyle === fragment.fontStyle
    && run.fontSizeLayoutUnit === fragment.fontSizeLayoutUnit
    && run.textColor === fragment.textColor
    && run.ascentLayoutUnit === fragment.ascentLayoutUnit
    && run.descentLayoutUnit === fragment.descentLayoutUnit
    && run.lineGapLayoutUnit === fragment.lineGapLayoutUnit
  ))
  return matches.length === 1 ? matches[0]! : null
}

function rebindLine(input: {
  previousLine: VNextTextBlockPositionedLineV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  acceptedRuns: readonly VNextTextBlockAcceptedShapingRunV1[]
  lineIndexDelta: number
  offsetDelta: number
  yOffsetDeltaLayoutUnit: number
}): VNextTextBlockPositionedLineV1 | null {
  const index = input.previousLine.index + input.lineIndexDelta
  const renderStartOffset = input.previousLine.renderStartOffset + input.offsetDelta
  const renderEndOffset = input.previousLine.renderEndOffset + input.offsetDelta
  const fragments: VNextTextBlockPositionedFragmentV1[] = []
  for (const previousFragment of input.previousLine.fragments) {
    const fragmentStart = previousFragment.renderStartOffset + input.offsetDelta
    const fragmentEnd = previousFragment.renderEndOffset + input.offsetDelta
    const run = matchingRun(input.acceptedRuns, previousFragment, fragmentStart, fragmentEnd)
    if (run == null) return null
    const clusters = run.clusters.filter((cluster) => (
      cluster.renderStartOffset >= fragmentStart && cluster.renderEndOffset <= fragmentEnd
    ))
    const advanceLayoutUnit = safeVNextTextBlockMultiRunSumV1(
      clusters.map((cluster) => cluster.advanceLayoutUnit),
    )
    if (
      advanceLayoutUnit !== previousFragment.advanceLayoutUnit
      || clusters[0]?.renderStartOffset !== fragmentStart
      || clusters.at(-1)?.renderEndOffset !== fragmentEnd
    ) return null
    const fragmentFacts = {
      fragmentId: `${input.nextRequest.layoutId}:line-${index}:run-${run.shapingRunId}:${fragmentStart}-${fragmentEnd}`,
      shapingRunId: run.shapingRunId,
      renderStartOffset: fragmentStart,
      renderEndOffset: fragmentEnd,
      text: input.nextRequest.measurement.renderedText.slice(fragmentStart, fragmentEnd),
      xLayoutUnit: previousFragment.xLayoutUnit,
      advanceLayoutUnit,
      baselineShiftLayoutUnit: 0 as const,
      styleKey: run.styleKey,
      fontFaceId: run.fontFaceId,
      fontFamily: run.fontFamily,
      fontSha256: run.fontSha256,
      fontWeight: run.fontWeight,
      fontStyle: run.fontStyle,
      fontSizeLayoutUnit: run.fontSizeLayoutUnit,
      textColor: run.textColor,
      ascentLayoutUnit: run.ascentLayoutUnit,
      descentLayoutUnit: run.descentLayoutUnit,
      lineGapLayoutUnit: run.lineGapLayoutUnit,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        input.nextRequest.measurement.runs,
        fragmentStart,
        fragmentEnd,
      ),
    }
    fragments.push({ ...fragmentFacts, fingerprint: compact(fragmentFacts) })
  }
  const lineFacts = {
    index,
    renderStartOffset,
    renderEndOffset,
    text: input.nextRequest.measurement.renderedText.slice(renderStartOffset, renderEndOffset),
    yOffsetLayoutUnit: input.previousLine.yOffsetLayoutUnit + input.yOffsetDeltaLayoutUnit,
    widthLayoutUnit: input.previousLine.widthLayoutUnit,
    naturalAscentLayoutUnit: input.previousLine.naturalAscentLayoutUnit,
    naturalDescentLayoutUnit: input.previousLine.naturalDescentLayoutUnit,
    naturalHeightLayoutUnit: input.previousLine.naturalHeightLayoutUnit,
    leadingBeforeLayoutUnit: input.previousLine.leadingBeforeLayoutUnit,
    leadingAfterLayoutUnit: input.previousLine.leadingAfterLayoutUnit,
    heightLayoutUnit: input.previousLine.heightLayoutUnit,
    baselineOffsetLayoutUnit: input.previousLine.baselineOffsetLayoutUnit,
    fragments,
    sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
      input.nextRequest.measurement.runs,
      renderStartOffset,
      renderEndOffset,
    ),
  }
  const line = { ...lineFacts, fingerprint: compact(lineFacts) }
  return createVNextTextBlockMultiRunSemanticLineFingerprintV1(line)
    === createVNextTextBlockMultiRunSemanticLineFingerprintV1(input.previousLine)
    ? line
    : null
}

export function materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1(input: {
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  acceptance: VNextTextBlockMultiRunIncrementalAcceptanceV1
}): VNextTextBlockMultiRunIncrementalMaterializationV1 {
  const blocked = (message: string): VNextTextBlockMultiRunIncrementalMaterializationV1 => {
    const facts = { status: "blocked" as const, layout: null, message }
    return { ...facts, fingerprint: compact(facts) }
  }
  if (input.acceptance.status !== "window-accepted") return blocked(
    "QA materialization requires one accepted incremental composition",
  )
  if (inspectVNextTextBlockMultiRunIncrementalSnapshotV1(input.snapshot).status !== "valid") return blocked(
    "QA materialization requires the original process-local snapshot",
  )
  if (
    !validAcceptanceFingerprint(input.acceptance)
    || input.acceptance.snapshotFingerprint !== input.snapshot.fingerprint
    || input.acceptance.layoutId !== input.nextRequest.layoutId
    || input.acceptance.textBlockId !== input.nextRequest.measurement.textBlockId
    || input.acceptance.nextInstanceRevision !== input.nextRequest.measurement.instanceRevision
  ) return blocked("incremental composition identity or fingerprint does not match the next request")

  const acceptedRuns = deriveVNextTextBlockMultiRunAcceptedRunsV1(input.nextRequest)
  if (acceptedRuns.status !== "accepted") return blocked(acceptedRuns.message)
  const references = input.acceptance.references
  const prefix = input.snapshot.layout.lines
    .slice(references.prefix.previousStartLineIndex, references.prefix.previousEndLineIndexExclusive)
    .map((previousLine) => rebindLine({
      previousLine,
      nextRequest: input.nextRequest,
      acceptedRuns: acceptedRuns.value,
      lineIndexDelta: references.prefix.lineIndexDelta,
      offsetDelta: references.prefix.offsetDelta,
      yOffsetDeltaLayoutUnit: references.prefix.yOffsetDeltaLayoutUnit,
    }))
  const suffix = input.snapshot.layout.lines
    .slice(references.suffix.previousStartLineIndex, references.suffix.previousEndLineIndexExclusive)
    .map((previousLine) => rebindLine({
      previousLine,
      nextRequest: input.nextRequest,
      acceptedRuns: acceptedRuns.value,
      lineIndexDelta: references.suffix.lineIndexDelta,
      offsetDelta: references.suffix.offsetDelta,
      yOffsetDeltaLayoutUnit: references.suffix.yOffsetDeltaLayoutUnit,
    }))
  if (prefix.some((line) => line == null) || suffix.some((line) => line == null)) return blocked(
    "a semantic prefix or suffix line could not regenerate revision-specific physical identities",
  )
  const lines = [
    ...prefix as VNextTextBlockPositionedLineV1[],
    ...clone(references.affected.lines),
    ...suffix as VNextTextBlockPositionedLineV1[],
  ]
  if (
    lines.length !== input.nextRequest.lines.length
    || lines.some((line, index) => (
      line.index !== index
      || line.renderStartOffset !== input.nextRequest.lines[index]!.renderStartOffset
      || line.renderEndOffset !== input.nextRequest.lines[index]!.renderEndOffset
    ))
  ) return blocked("composed physical lines do not cover the complete next line request")

  const base = layoutFacts(input.nextRequest)
  const canonicalFontFaces = clone(input.nextRequest.fontFaces)
    .sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId))
  const layoutFingerprint = compact({
    ...base,
    availableWidthLayoutUnit: input.nextRequest.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: input.nextRequest.declaredLineHeightLayoutUnit,
    paragraphStyle: input.nextRequest.paragraphStyle,
    fontFaces: canonicalFontFaces,
    shapingRuns: acceptedRuns.value,
    breakOffsets: input.nextRequest.breakOffsets,
    lines,
  })
  const lastLine = lines.at(-1)!
  const heightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    lastLine.yOffsetLayoutUnit,
    lastLine.heightLayoutUnit,
  ])
  if (heightLayoutUnit == null) return blocked("composed layout height exceeds the safe integer range")
  const layout = {
    ...base,
    status: "accepted" as const,
    fontFaces: canonicalFontFaces,
    shapingRuns: acceptedRuns.value,
    lines,
    fingerprint: layoutFingerprint,
    issues: [] as [],
    summary: {
      shapingRunCount: acceptedRuns.value.length,
      clusterCount: acceptedRuns.value.reduce((sum, run) => sum + run.clusters.length, 0),
      lineCount: lines.length,
      fragmentCount: lines.reduce((sum, line) => sum + line.fragments.length, 0),
      sourceSegmentCount: lines.reduce((sum, line) => sum + line.sourceSegments.length, 0),
      widthLayoutUnit: lines.reduce((maximum, line) => Math.max(maximum, line.widthLayoutUnit), 0),
      heightLayoutUnit,
    },
  }
  const facts = {
    status: "materialized-for-qa" as const,
    layout,
    contracts: {
      assembledFromIncrementalComposition: true as const,
      completeCoreLayoutOracleStillRequired: true as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  return { ...facts, fingerprint: compact(facts) }
}
