import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"
import {
  convertVNextPointToLayoutUnitV1,
  createVNextLayoutUnitPolicyV1,
  scaleVNextFontMetricToLayoutUnitV1,
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"
import {
  VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE,
  VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockAcceptedShapingRunV1,
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutFactsV1,
  VNextTextBlockMultiRunLayoutIssueCodeV1,
  VNextTextBlockMultiRunLayoutIssueV1,
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
  VNextTextBlockPositionedLineV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

interface ScaledMetrics {
  ascentLayoutUnit: number
  descentLayoutUnit: number
  lineGapLayoutUnit: number
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonBlank(value: string): boolean {
  return value.trim().length > 0
}

function sha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function color(value: string): boolean {
  return /^[0-9A-Fa-f]{6}$/u.test(value)
}

function issue(
  code: VNextTextBlockMultiRunLayoutIssueCodeV1,
  path: string,
  message: string,
  details: Pick<VNextTextBlockMultiRunLayoutIssueV1, "shapingRunId" | "lineIndex"> = {},
): VNextTextBlockMultiRunLayoutIssueV1 {
  return { code, severity: "error", path, message, ...details }
}

function facts(input: VNextTextBlockMultiRunLayoutRequestV1): VNextTextBlockMultiRunLayoutFactsV1 {
  return {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_LAYOUT_V1_VERSION,
    layoutId: input.layoutId,
    textBlockId: input.measurement.textBlockId,
    instanceRevision: input.measurement.instanceRevision,
    measurementProfileId: input.measurement.measurementProfileId,
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
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

function blocked(
  base: VNextTextBlockMultiRunLayoutFactsV1,
  issues: VNextTextBlockMultiRunLayoutIssueV1[],
): VNextTextBlockMultiRunLayoutResultV1 {
  return {
    ...base,
    status: "blocked",
    fontFaces: null,
    shapingRuns: null,
    lines: null,
    fingerprint: null,
    issues,
    summary: null,
  }
}

function validateMeasurement(
  measurement: VNextTextBlockV4MeasurementRequest,
): VNextTextBlockMultiRunLayoutIssueV1[] {
  const issues: VNextTextBlockMultiRunLayoutIssueV1[] = []
  if (
    !nonBlank(measurement.documentId)
    || !Number.isSafeInteger(measurement.instanceRevision)
    || measurement.instanceRevision < 0
    || !nonBlank(measurement.sectionId)
    || !nonBlank(measurement.textBlockId)
    || !Number.isFinite(measurement.availableWidthPt)
    || measurement.availableWidthPt <= 0
    || !nonBlank(measurement.measurementProfileId)
    || !nonBlank(measurement.styleKey)
  ) issues.push(issue(
    "invalid-measurement-request",
    "measurement",
    "measurement identity, revision, width, profile, and style facts must be valid",
  ))
  if (measurement.renderedText.length === 0) issues.push(issue(
    "empty-text-unsupported",
    "measurement.renderedText",
    "MR1 v1 requires non-empty rendered text; empty-block metrics remain a later slice",
  ))
  if (measurement.runs.length === 0) issues.push(issue(
    "invalid-measurement-request",
    "measurement.runs",
    "measurement runs must cover the rendered text",
  ))

  let expectedStartOffset = 0
  measurement.runs.forEach((run, index) => {
    const path = `measurement.runs[${index}]`
    if (
      !nonBlank(run.inlineId)
      || !Number.isSafeInteger(run.renderStartOffset)
      || !Number.isSafeInteger(run.renderEndOffset)
      || run.renderStartOffset !== expectedStartOffset
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > measurement.renderedText.length
      || run.renderedText !== measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
    ) issues.push(issue(
      "invalid-measurement-request",
      path,
      "measurement runs must retain ordered, gap-free ranges and exact rendered text",
    ))
    if (run.kind === "inline-image") issues.push(issue(
      "inline-image-unsupported",
      path,
      "MR1 v1 does not position inline images inside text lines",
    ))
    if (run.kind === "hard-break" && !/^(?:\r\n|\r|\n)$/u.test(run.renderedText)) issues.push(issue(
      "invalid-measurement-request",
      `${path}.renderedText`,
      "hard-break runs must contain one CR, LF, or CRLF sequence",
    ))
    if (run.kind === "resolved-field" && (run.fieldKey == null || !nonBlank(run.fieldKey))) issues.push(issue(
      "invalid-measurement-request",
      `${path}.fieldKey`,
      "resolved-field runs must retain a non-blank field key",
    ))
    expectedStartOffset = run.renderEndOffset
  })
  if (expectedStartOffset !== measurement.renderedText.length) issues.push(issue(
    "invalid-measurement-request",
    "measurement.runs",
    "measurement runs must cover the complete rendered text",
  ))
  return issues
}

function validateFontFaces(
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[],
): { issues: VNextTextBlockMultiRunLayoutIssueV1[]; byId: Map<string, VNextTextBlockMultiRunFontFaceV1> } {
  const issues: VNextTextBlockMultiRunLayoutIssueV1[] = []
  const byId = new Map<string, VNextTextBlockMultiRunFontFaceV1>()
  if (fontFaces.length === 0) issues.push(issue(
    "invalid-font-face",
    "fontFaces",
    "at least one pinned font face is required",
  ))
  fontFaces.forEach((face, index) => {
    const path = `fontFaces[${index}]`
    if (byId.has(face.fontFaceId)) issues.push(issue(
      "duplicate-font-face",
      `${path}.fontFaceId`,
      `font face id \"${face.fontFaceId}\" is duplicated`,
    ))
    if (
      !nonBlank(face.fontFaceId)
      || !nonBlank(face.fontFamily)
      || !sha256(face.fontSha256)
      || !Number.isSafeInteger(face.weight)
      || face.weight < 100
      || face.weight > 900
      || (face.style !== "normal" && face.style !== "italic")
      || !Number.isSafeInteger(face.unitsPerEm)
      || face.unitsPerEm <= 0
      || !Number.isSafeInteger(face.ascentFontUnit)
      || face.ascentFontUnit <= 0
      || !Number.isSafeInteger(face.descentFontUnit)
      || face.descentFontUnit > 0
      || !Number.isSafeInteger(face.lineGapFontUnit)
      || face.lineGapFontUnit < 0
    ) issues.push(issue(
      "invalid-font-face",
      path,
      "font faces require stable ids/digests and normalized integer metrics",
    ))
    byId.set(face.fontFaceId, face)
  })
  return { issues, byId }
}

function scaledMetrics(
  face: VNextTextBlockMultiRunFontFaceV1,
  fontSizeLayoutUnit: number,
): ScaledMetrics | null {
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

function paintableIntervals(measurement: VNextTextBlockV4MeasurementRequest): Array<{ start: number; end: number }> {
  const intervals: Array<{ start: number; end: number }> = []
  measurement.runs.forEach((run) => {
    if (run.kind === "hard-break" || run.kind === "inline-image" || run.renderEndOffset === run.renderStartOffset) return
    const previous = intervals.at(-1)
    if (previous != null && previous.end === run.renderStartOffset) previous.end = run.renderEndOffset
    else intervals.push({ start: run.renderStartOffset, end: run.renderEndOffset })
  })
  return intervals
}

function validateShapingCoverage(
  measurement: VNextTextBlockV4MeasurementRequest,
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[],
): VNextTextBlockMultiRunLayoutIssueV1[] {
  const issues: VNextTextBlockMultiRunLayoutIssueV1[] = []
  const intervals = paintableIntervals(measurement)
  let shapingIndex = 0
  intervals.forEach((interval, intervalIndex) => {
    let cursor = interval.start
    while (shapingIndex < shapingRuns.length && shapingRuns[shapingIndex]!.renderStartOffset < interval.end) {
      const run = shapingRuns[shapingIndex]!
      if (run.renderStartOffset !== cursor || run.renderEndOffset > interval.end || run.renderEndOffset <= run.renderStartOffset) {
        issues.push(issue(
          "shaping-coverage-mismatch",
          `shapingRuns[${shapingIndex}]`,
          `shaping runs must partition paintable interval ${intervalIndex} without gaps or overlap`,
          { shapingRunId: run.shapingRunId },
        ))
        break
      }
      cursor = run.renderEndOffset
      shapingIndex += 1
    }
    if (cursor !== interval.end) issues.push(issue(
      "shaping-coverage-mismatch",
      "shapingRuns",
      `shaping runs do not completely cover paintable range ${interval.start}-${interval.end}`,
    ))
  })
  if (shapingIndex !== shapingRuns.length) issues.push(issue(
    "shaping-coverage-mismatch",
    "shapingRuns",
    "shaping runs contain ranges outside paintable measurement text",
  ))
  return issues
}

function sourceSegmentsForRange(
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

function safeSum(values: readonly number[]): number | null {
  let total = 0
  for (const value of values) {
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

export function acceptVNextTextBlockMultiRunLayoutV1(
  input: VNextTextBlockMultiRunLayoutRequestV1,
): VNextTextBlockMultiRunLayoutResultV1 {
  const base = facts(input)
  const issues = validateMeasurement(input.measurement)
  const policy = createVNextLayoutUnitPolicyV1()

  if (input.bindProductionLayout === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionLayout",
    "MR1 v1 cannot bind production layout",
  ))
  if (!nonBlank(input.layoutId)) issues.push(issue(
    "invalid-layout-id",
    "layoutId",
    "layout id must not be blank",
  ))
  if (input.layoutUnitPolicyFingerprint !== policy.fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch",
    "layoutUnitPolicyFingerprint",
    "layout input must pin the accepted LayoutUnitPolicyV1 fingerprint",
  ))
  const width = convertVNextPointToLayoutUnitV1(input.measurement.availableWidthPt, "measurement.availableWidthPt")
  if (
    width.status !== "accepted"
    || !VNextPositiveLayoutUnitV1Schema.safeParse(input.availableWidthLayoutUnit).success
    || width.layoutUnit !== input.availableWidthLayoutUnit
  ) issues.push(issue(
    "available-width-mismatch",
    "availableWidthLayoutUnit",
    "integer available width must exactly match the measurement point width",
  ))
  if (!VNextPositiveLayoutUnitV1Schema.safeParse(input.declaredLineHeightLayoutUnit).success) issues.push(issue(
    "invalid-line-height",
    "declaredLineHeightLayoutUnit",
    "declared line height must be a positive safe layout integer",
  ))

  const faceValidation = validateFontFaces(input.fontFaces)
  issues.push(...faceValidation.issues)
  const paragraphFace = faceValidation.byId.get(input.paragraphStyle.fontFaceId)
  if (
    !nonBlank(input.paragraphStyle.styleKey)
    || paragraphFace == null
    || !VNextPositiveLayoutUnitV1Schema.safeParse(input.paragraphStyle.fontSizeLayoutUnit).success
    || !color(input.paragraphStyle.textColor)
    || (paragraphFace != null && scaledMetrics(paragraphFace, input.paragraphStyle.fontSizeLayoutUnit) == null)
  ) issues.push(issue(
    "invalid-paragraph-style",
    "paragraphStyle",
    "paragraph style must resolve to a pinned face, positive size, color, and safe metrics",
  ))

  const shapingIds = new Set<string>()
  let shapingRangesValid = true
  input.shapingRuns.forEach((run, runIndex) => {
    const path = `shapingRuns[${runIndex}]`
    const face = faceValidation.byId.get(run.fontFaceId)
    if (shapingIds.has(run.shapingRunId)) issues.push(issue(
      "duplicate-shaping-run",
      `${path}.shapingRunId`,
      `shaping run id \"${run.shapingRunId}\" is duplicated`,
      { shapingRunId: run.shapingRunId },
    ))
    shapingIds.add(run.shapingRunId)
    const rangesValid = Number.isSafeInteger(run.renderStartOffset)
      && Number.isSafeInteger(run.renderEndOffset)
      && run.renderStartOffset >= 0
      && run.renderEndOffset > run.renderStartOffset
      && run.renderEndOffset <= input.measurement.renderedText.length
      && isVNextSafeUtf16TextOffset(input.measurement.renderedText, run.renderStartOffset)
      && isVNextSafeUtf16TextOffset(input.measurement.renderedText, run.renderEndOffset)
    shapingRangesValid &&= rangesValid
    if (
      !nonBlank(run.shapingRunId)
      || !rangesValid
      || run.text !== input.measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      || /[\r\n]/u.test(run.text)
      || !nonBlank(run.styleKey)
      || face == null
      || !VNextPositiveLayoutUnitV1Schema.safeParse(run.fontSizeLayoutUnit).success
      || !color(run.textColor)
      || run.direction !== "ltr"
      || run.baselineShiftLayoutUnit !== 0
      || run.features.some((feature) => !nonBlank(feature))
      || run.features.some((feature, index, features) => index > 0 && feature <= features[index - 1]!)
      || (face != null && scaledMetrics(face, run.fontSizeLayoutUnit) == null)
    ) issues.push(issue(
      "invalid-shaping-run",
      path,
      "shaping runs require exact safe text ranges, resolved style/font facts, sorted features, and zero baseline shift",
      { shapingRunId: run.shapingRunId },
    ))

    if (run.clusters.length === 0) issues.push(issue(
      "invalid-cluster",
      `${path}.clusters`,
      "non-empty shaping runs require cluster advances",
      { shapingRunId: run.shapingRunId },
    ))
    let expectedClusterStart = run.renderStartOffset
    run.clusters.forEach((cluster, clusterIndex) => {
      const clusterPath = `${path}.clusters[${clusterIndex}]`
      if (
        cluster.index !== clusterIndex
        || !Number.isSafeInteger(cluster.renderStartOffset)
        || !Number.isSafeInteger(cluster.renderEndOffset)
        || cluster.renderStartOffset !== expectedClusterStart
        || cluster.renderEndOffset <= cluster.renderStartOffset
        || cluster.renderEndOffset > run.renderEndOffset
        || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, cluster.renderStartOffset)
        || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, cluster.renderEndOffset)
        || !VNextNonNegativeLayoutUnitV1Schema.safeParse(cluster.advanceLayoutUnit).success
      ) issues.push(issue(
        "invalid-cluster",
        clusterPath,
        "clusters must cover each shaping run with safe ordered ranges and non-negative integer advances",
        { shapingRunId: run.shapingRunId },
      ))
      expectedClusterStart = cluster.renderEndOffset
    })
    if (expectedClusterStart !== run.renderEndOffset) issues.push(issue(
      "invalid-cluster",
      `${path}.clusters`,
      "clusters must cover the complete shaping run",
      { shapingRunId: run.shapingRunId },
    ))
  })
  if (shapingRangesValid) issues.push(...validateShapingCoverage(input.measurement, input.shapingRuns))

  const mandatoryBreakOffsets = input.measurement.runs
    .filter((run) => run.kind === "hard-break")
    .map((run) => run.renderEndOffset)
  const breakSet = new Set<number>()
  let previousBreakOffset = -1
  input.breakOffsets.forEach((offset, index) => {
    if (
      !Number.isSafeInteger(offset)
      || offset < 0
      || offset > input.measurement.renderedText.length
      || offset <= previousBreakOffset
      || !isVNextSafeUtf16TextOffset(input.measurement.renderedText, offset)
    ) issues.push(issue(
      "invalid-break-offsets",
      `breakOffsets[${index}]`,
      "break offsets must be strictly increasing safe UTF-16 boundaries",
    ))
    breakSet.add(offset)
    previousBreakOffset = offset
  })
  if (
    input.breakOffsets[0] !== 0
    || input.breakOffsets.at(-1) !== input.measurement.renderedText.length
    || mandatoryBreakOffsets.some((offset) => !breakSet.has(offset))
  ) issues.push(issue(
    "invalid-break-offsets",
    "breakOffsets",
    "break offsets must include start, end, and every mandatory hard-break boundary",
  ))

  const clusterBoundaries = new Set<number>([0, input.measurement.renderedText.length])
  input.shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  }))
  input.measurement.runs.filter((run) => run.kind === "hard-break").forEach((run) => {
    clusterBoundaries.add(run.renderStartOffset)
    clusterBoundaries.add(run.renderEndOffset)
  })

  if (input.lines.length === 0) issues.push(issue(
    "line-coverage-mismatch",
    "lines",
    "MR1 layout requires at least one complete line",
  ))
  let expectedLineStart = 0
  input.lines.forEach((line, lineIndex) => {
    const path = `lines[${lineIndex}]`
    const validRange = line.index === lineIndex
      && Number.isSafeInteger(line.renderStartOffset)
      && Number.isSafeInteger(line.renderEndOffset)
      && line.renderStartOffset === expectedLineStart
      && line.renderEndOffset > line.renderStartOffset
      && line.renderEndOffset <= input.measurement.renderedText.length
      && breakSet.has(line.renderStartOffset)
      && breakSet.has(line.renderEndOffset)
    if (!validRange) issues.push(issue(
      "invalid-line-range",
      path,
      "lines must use contiguous indexed ranges selected from accepted break offsets",
      { lineIndex },
    ))
    if (!clusterBoundaries.has(line.renderStartOffset) || !clusterBoundaries.has(line.renderEndOffset)) issues.push(issue(
      "line-boundary-inside-cluster",
      path,
      "line boundaries must not split a shaping cluster",
      { lineIndex },
    ))
    const nextMandatory = mandatoryBreakOffsets.find((offset) => offset > line.renderStartOffset)
    if (nextMandatory != null && nextMandatory < line.renderEndOffset) issues.push(issue(
      "mandatory-break-crossed",
      path,
      `line crosses mandatory break offset ${nextMandatory}`,
      { lineIndex },
    ))
    expectedLineStart = line.renderEndOffset
  })
  if (expectedLineStart !== input.measurement.renderedText.length) issues.push(issue(
    "line-coverage-mismatch",
    "lines",
    "lines must cover the complete rendered text",
  ))

  if (issues.length > 0 || paragraphFace == null) return blocked(base, issues)

  const acceptedRuns: VNextTextBlockAcceptedShapingRunV1[] = []
  input.shapingRuns.forEach((run) => {
    const face = faceValidation.byId.get(run.fontFaceId)!
    const metrics = scaledMetrics(face, run.fontSizeLayoutUnit)!
    const advanceLayoutUnit = safeSum(run.clusters.map((cluster) => cluster.advanceLayoutUnit))
    if (advanceLayoutUnit == null) {
      issues.push(issue(
        "unsafe-layout-arithmetic",
        `shapingRuns.${run.shapingRunId}.clusters`,
        "shaping-run cluster advances exceed the safe integer range",
        { shapingRunId: run.shapingRunId },
      ))
      return
    }
    const runFacts = {
      ...clone(run),
      fontFamily: face.fontFamily,
      fontSha256: face.fontSha256,
      fontWeight: face.weight,
      fontStyle: face.style,
      ...metrics,
      advanceLayoutUnit,
    }
    acceptedRuns.push({
      ...runFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(runFacts)),
    })
  })
  if (issues.length > 0) return blocked(base, issues)

  const paragraphMetrics = scaledMetrics(paragraphFace, input.paragraphStyle.fontSizeLayoutUnit)!
  const lines: VNextTextBlockPositionedLineV1[] = []
  let yOffsetLayoutUnit = 0
  input.lines.forEach((lineInput, lineIndex) => {
    let xLayoutUnit = 0
    const fragments: VNextTextBlockPositionedFragmentV1[] = []
    acceptedRuns.forEach((run) => {
      const renderStartOffset = Math.max(lineInput.renderStartOffset, run.renderStartOffset)
      const renderEndOffset = Math.min(lineInput.renderEndOffset, run.renderEndOffset)
      if (renderEndOffset <= renderStartOffset) return
      const clusters = run.clusters.filter((cluster) => (
        cluster.renderStartOffset >= renderStartOffset && cluster.renderEndOffset <= renderEndOffset
      ))
      const advanceLayoutUnit = safeSum(clusters.map((cluster) => cluster.advanceLayoutUnit))
      if (
        advanceLayoutUnit == null
        || clusters[0]?.renderStartOffset !== renderStartOffset
        || clusters.at(-1)?.renderEndOffset !== renderEndOffset
      ) {
        issues.push(issue(
          "unsafe-layout-arithmetic",
          `lines[${lineIndex}]`,
          "line fragment could not retain complete safe cluster advances",
          { shapingRunId: run.shapingRunId, lineIndex },
        ))
        return
      }
      const fragmentFacts = {
        fragmentId: `${input.layoutId}:line-${lineIndex}:run-${run.shapingRunId}:${renderStartOffset}-${renderEndOffset}`,
        shapingRunId: run.shapingRunId,
        renderStartOffset,
        renderEndOffset,
        text: input.measurement.renderedText.slice(renderStartOffset, renderEndOffset),
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
        sourceSegments: sourceSegmentsForRange(input.measurement.runs, renderStartOffset, renderEndOffset),
      }
      fragments.push({
        ...fragmentFacts,
        fingerprint: createVNextCompactFingerprint(JSON.stringify(fragmentFacts)),
      })
      const nextX = safeSum([xLayoutUnit, advanceLayoutUnit])
      if (nextX == null) issues.push(issue(
        "unsafe-layout-arithmetic",
        `lines[${lineIndex}].fragments`,
        "line fragment positions exceed the safe integer range",
        { lineIndex },
      ))
      else xLayoutUnit = nextX
    })

    const metricSource = fragments.length === 0 ? [paragraphMetrics] : fragments
    const naturalAscentLayoutUnit = Math.max(...metricSource.map((item) => item.ascentLayoutUnit))
    const naturalDescentLayoutUnit = Math.max(...metricSource.map((item) => item.descentLayoutUnit))
    const naturalHeightLayoutUnit = safeSum([naturalAscentLayoutUnit, naturalDescentLayoutUnit])
    if (naturalHeightLayoutUnit == null) {
      issues.push(issue(
        "unsafe-layout-arithmetic",
        `lines[${lineIndex}]`,
        "line metrics exceed the safe integer range",
        { lineIndex },
      ))
      return
    }
    const heightLayoutUnit = Math.max(input.declaredLineHeightLayoutUnit, naturalHeightLayoutUnit)
    const leadingLayoutUnit = heightLayoutUnit - naturalHeightLayoutUnit
    const leadingBeforeLayoutUnit = Math.floor(leadingLayoutUnit / 2)
    const leadingAfterLayoutUnit = leadingLayoutUnit - leadingBeforeLayoutUnit
    const baselineOffsetLayoutUnit = safeSum([leadingBeforeLayoutUnit, naturalAscentLayoutUnit])
    if (baselineOffsetLayoutUnit == null) {
      issues.push(issue(
        "unsafe-layout-arithmetic",
        `lines[${lineIndex}].baselineOffsetLayoutUnit`,
        "line baseline exceeds the safe integer range",
        { lineIndex },
      ))
      return
    }
    if (xLayoutUnit > input.availableWidthLayoutUnit) issues.push(issue(
      "line-width-overflow",
      `lines[${lineIndex}]`,
      "MR1 v1 does not accept line width beyond the available width",
      { lineIndex },
    ))
    const lineFacts = {
      index: lineIndex,
      renderStartOffset: lineInput.renderStartOffset,
      renderEndOffset: lineInput.renderEndOffset,
      text: input.measurement.renderedText.slice(lineInput.renderStartOffset, lineInput.renderEndOffset),
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
      sourceSegments: sourceSegmentsForRange(
        input.measurement.runs,
        lineInput.renderStartOffset,
        lineInput.renderEndOffset,
      ),
    }
    lines.push({
      ...lineFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(lineFacts)),
    })
    const nextY = safeSum([yOffsetLayoutUnit, heightLayoutUnit])
    if (nextY == null) issues.push(issue(
      "unsafe-layout-arithmetic",
      `lines[${lineIndex}].yOffsetLayoutUnit`,
      "line stack exceeds the safe integer range",
      { lineIndex },
    ))
    else yOffsetLayoutUnit = nextY
  })
  if (issues.length > 0) return blocked(base, issues)

  const canonicalFontFaces = clone(input.fontFaces).sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId))
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    ...base,
    availableWidthLayoutUnit: input.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: input.declaredLineHeightLayoutUnit,
    paragraphStyle: input.paragraphStyle,
    fontFaces: canonicalFontFaces,
    shapingRuns: acceptedRuns,
    breakOffsets: input.breakOffsets,
    lines,
  }))
  return {
    ...base,
    status: "accepted",
    fontFaces: canonicalFontFaces,
    shapingRuns: acceptedRuns,
    lines,
    fingerprint,
    issues: [],
    summary: {
      shapingRunCount: acceptedRuns.length,
      clusterCount: acceptedRuns.reduce((sum, run) => sum + run.clusters.length, 0),
      lineCount: lines.length,
      fragmentCount: lines.reduce((sum, line) => sum + line.fragments.length, 0),
      sourceSegmentCount: lines.reduce((sum, line) => sum + line.sourceSegments.length, 0),
      widthLayoutUnit: lines.reduce((maximum, line) => Math.max(maximum, line.widthLayoutUnit), 0),
      heightLayoutUnit: yOffsetLayoutUnit,
    },
  }
}
