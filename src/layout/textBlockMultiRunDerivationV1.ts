import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextTextBlockV4MeasurementRun } from "../pagination/textBlockV4Measurement.js"
import { scaleVNextFontMetricToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import type {
  VNextTextBlockAcceptedShapingRunV1,
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
  VNextTextBlockPositionedLineV1,
} from "./textBlockMultiRunLayoutContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function safeVNextTextBlockMultiRunSumV1(values: readonly number[]): number | null {
  let total = 0
  for (const value of values) {
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

export function createVNextTextBlockMultiRunSourceSegmentsV1(
  runs: readonly VNextTextBlockV4MeasurementRun[],
  startOffset: number,
  endOffset: number,
): VNextTextBlockMultiRunSourceSegmentV1[] {
  return runs.flatMap((run) => {
    const renderStartOffset = Math.max(startOffset, run.renderStartOffset)
    const renderEndOffset = Math.min(endOffset, run.renderEndOffset)
    if (renderEndOffset <= renderStartOffset) return []
    const sourceStartOffset = renderStartOffset - run.renderStartOffset
    const sourceEndOffset = renderEndOffset - run.renderStartOffset
    return [{
      inlineId: run.inlineId,
      kind: run.kind,
      ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
      ...(run.generatedOwnerFingerprint == null ? {} : {
        generatedOwnerFingerprint: run.generatedOwnerFingerprint,
      }),
      ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
      ...(run.localStyle == null ? {} : { localStyle: clone(run.localStyle) }),
      renderStartOffset,
      renderEndOffset,
      sourceStartOffset,
      sourceEndOffset,
      renderedText: run.renderedText.slice(sourceStartOffset, sourceEndOffset),
    }]
  })
}

function metrics(
  face: VNextTextBlockMultiRunFontFaceV1,
  fontSizeLayoutUnit: number,
): Pick<
  VNextTextBlockAcceptedShapingRunV1,
  "ascentLayoutUnit" | "descentLayoutUnit" | "lineGapLayoutUnit"
> | null {
  const ascent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.ascentFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  const descent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.descentFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  const lineGap = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.lineGapFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  if (ascent.status !== "accepted" || descent.status !== "accepted" || lineGap.status !== "accepted") return null
  return {
    ascentLayoutUnit: ascent.layoutUnit,
    descentLayoutUnit: descent.layoutUnit === 0 ? 0 : -descent.layoutUnit,
    lineGapLayoutUnit: lineGap.layoutUnit,
  }
}

export type VNextTextBlockMultiRunDerivationV1<T> =
  | { status: "accepted"; value: T }
  | { status: "blocked"; message: string }

export function deriveVNextTextBlockMultiRunAcceptedRunsV1(
  request: VNextTextBlockMultiRunLayoutRequestV1,
): VNextTextBlockMultiRunDerivationV1<VNextTextBlockAcceptedShapingRunV1[]> {
  const faces = new Map(request.fontFaces.map((face) => [face.fontFaceId, face]))
  const acceptedRuns: VNextTextBlockAcceptedShapingRunV1[] = []
  for (const run of request.shapingRuns) {
    const face = faces.get(run.fontFaceId)
    const scaled = face == null ? null : metrics(face, run.fontSizeLayoutUnit)
    const advanceLayoutUnit = safeVNextTextBlockMultiRunSumV1(
      run.clusters.map((cluster) => cluster.advanceLayoutUnit),
    )
    if (face == null || scaled == null || advanceLayoutUnit == null) return {
      status: "blocked",
      message: `shaping run ${run.shapingRunId} cannot derive safe pinned-font facts`,
    }
    const facts = {
      ...clone(run),
      fontFamily: face.fontFamily,
      fontSha256: face.fontSha256,
      fontWeight: face.weight,
      fontStyle: face.style,
      ...scaled,
      advanceLayoutUnit,
    }
    acceptedRuns.push({
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    })
  }
  return { status: "accepted", value: acceptedRuns }
}

export function positionVNextTextBlockMultiRunLineWindowV1(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  acceptedRuns: readonly VNextTextBlockAcceptedShapingRunV1[]
  lineStartIndex: number
  lineEndIndexExclusive: number
  yOffsetLayoutUnit: number
}): VNextTextBlockMultiRunDerivationV1<{
  lines: VNextTextBlockPositionedLineV1[]
  endYOffsetLayoutUnit: number
}> {
  const paragraphFace = input.request.fontFaces.find(
    (face) => face.fontFaceId === input.request.paragraphStyle.fontFaceId,
  )
  const paragraphMetrics = paragraphFace == null
    ? null
    : metrics(paragraphFace, input.request.paragraphStyle.fontSizeLayoutUnit)
  if (paragraphMetrics == null) return {
    status: "blocked",
    message: "paragraph style cannot derive safe pinned-font metrics",
  }

  let yOffsetLayoutUnit = input.yOffsetLayoutUnit
  const lines: VNextTextBlockPositionedLineV1[] = []
  for (let lineIndex = input.lineStartIndex; lineIndex < input.lineEndIndexExclusive; lineIndex += 1) {
    const lineInput = input.request.lines[lineIndex]
    if (lineInput == null || lineInput.index !== lineIndex) return {
      status: "blocked",
      message: `line ${lineIndex} is missing or is not canonically indexed`,
    }
    let xLayoutUnit = 0
    const fragments: VNextTextBlockPositionedFragmentV1[] = []
    for (const run of input.acceptedRuns) {
      const renderStartOffset = Math.max(lineInput.renderStartOffset, run.renderStartOffset)
      const renderEndOffset = Math.min(lineInput.renderEndOffset, run.renderEndOffset)
      if (renderEndOffset <= renderStartOffset) continue
      const clusters = run.clusters.filter((cluster) => (
        cluster.renderStartOffset >= renderStartOffset && cluster.renderEndOffset <= renderEndOffset
      ))
      const advanceLayoutUnit = safeVNextTextBlockMultiRunSumV1(
        clusters.map((cluster) => cluster.advanceLayoutUnit),
      )
      if (
        advanceLayoutUnit == null
        || clusters[0]?.renderStartOffset !== renderStartOffset
        || clusters.at(-1)?.renderEndOffset !== renderEndOffset
      ) return {
        status: "blocked",
        message: `line ${lineIndex} does not retain complete safe cluster advances`,
      }
      const fragmentFacts = {
        fragmentId: `${input.request.layoutId}:line-${lineIndex}:run-${run.shapingRunId}:${renderStartOffset}-${renderEndOffset}`,
        shapingRunId: run.shapingRunId,
        renderStartOffset,
        renderEndOffset,
        text: input.request.measurement.renderedText.slice(renderStartOffset, renderEndOffset),
        xLayoutUnit,
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
          input.request.measurement.runs,
          renderStartOffset,
          renderEndOffset,
        ),
      }
      fragments.push({
        ...fragmentFacts,
        fingerprint: createVNextCompactFingerprint(JSON.stringify(fragmentFacts)),
      })
      const nextX = safeVNextTextBlockMultiRunSumV1([xLayoutUnit, advanceLayoutUnit])
      if (nextX == null) return {
        status: "blocked",
        message: `line ${lineIndex} fragment positions exceed the safe integer range`,
      }
      xLayoutUnit = nextX
    }

    const metricSource = fragments.length === 0 ? [paragraphMetrics] : fragments
    const naturalAscentLayoutUnit = Math.max(...metricSource.map((item) => item.ascentLayoutUnit))
    const naturalDescentLayoutUnit = Math.max(...metricSource.map((item) => item.descentLayoutUnit))
    const naturalHeightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
      naturalAscentLayoutUnit,
      naturalDescentLayoutUnit,
    ])
    if (naturalHeightLayoutUnit == null) return {
      status: "blocked",
      message: `line ${lineIndex} metrics exceed the safe integer range`,
    }
    const heightLayoutUnit = Math.max(input.request.declaredLineHeightLayoutUnit, naturalHeightLayoutUnit)
    const leadingLayoutUnit = heightLayoutUnit - naturalHeightLayoutUnit
    const leadingBeforeLayoutUnit = Math.floor(leadingLayoutUnit / 2)
    const leadingAfterLayoutUnit = leadingLayoutUnit - leadingBeforeLayoutUnit
    const baselineOffsetLayoutUnit = safeVNextTextBlockMultiRunSumV1([
      leadingBeforeLayoutUnit,
      naturalAscentLayoutUnit,
    ])
    if (baselineOffsetLayoutUnit == null) return {
      status: "blocked",
      message: `line ${lineIndex} baseline exceeds the safe integer range`,
    }
    if (xLayoutUnit > input.request.availableWidthLayoutUnit) return {
      status: "blocked",
      message: `line ${lineIndex} exceeds the available width`,
    }
    const lineFacts = {
      index: lineIndex,
      renderStartOffset: lineInput.renderStartOffset,
      renderEndOffset: lineInput.renderEndOffset,
      text: input.request.measurement.renderedText.slice(
        lineInput.renderStartOffset,
        lineInput.renderEndOffset,
      ),
      yOffsetLayoutUnit,
      widthLayoutUnit: xLayoutUnit,
      naturalAscentLayoutUnit,
      naturalDescentLayoutUnit,
      naturalHeightLayoutUnit,
      leadingBeforeLayoutUnit,
      leadingAfterLayoutUnit,
      heightLayoutUnit,
      baselineOffsetLayoutUnit,
      fragments,
      sourceSegments: createVNextTextBlockMultiRunSourceSegmentsV1(
        input.request.measurement.runs,
        lineInput.renderStartOffset,
        lineInput.renderEndOffset,
      ),
    }
    lines.push({
      ...lineFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(lineFacts)),
    })
    const nextY = safeVNextTextBlockMultiRunSumV1([yOffsetLayoutUnit, heightLayoutUnit])
    if (nextY == null) return {
      status: "blocked",
      message: `line ${lineIndex} stack exceeds the safe integer range`,
    }
    yOffsetLayoutUnit = nextY
  }
  return { status: "accepted", value: { lines, endYOffsetLayoutUnit: yOffsetLayoutUnit } }
}
