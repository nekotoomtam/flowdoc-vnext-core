import {
  acceptVNextTextBlockMultiRunLayoutV1,
  convertVNextPointToLayoutUnitV1,
  createVNextCompactFingerprint,
  createVNextLayoutUnitPolicyV1,
  isVNextSafeUtf16TextOffset,
  scaleVNextFontMetricToLayoutUnitV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockV4MeasurementRun,
} from "@flowdoc/vnext-core"
import {
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_SOURCE,
  FLOWDOC_TEXT_ENGINE_MULTI_RUN_LAYOUT_VERSION,
  type FlowDocTextEngineMultiRunFontFaceV1,
  type FlowDocTextEngineMultiRunLayoutInputV1,
  type FlowDocTextEngineMultiRunLayoutIssueCodeV1,
  type FlowDocTextEngineMultiRunLayoutIssueV1,
  type FlowDocTextEngineMultiRunLayoutResultV1,
  type FlowDocTextEngineMultiRunRuntimeV1,
} from "./multiRunLayoutContract.js"
import type { FlowDocTextEngineMr1ShapeFactsV1 } from "./runtimeMr1.js"

interface EffectiveStyle {
  styleKey: string
  fontFamilyKey: string
  fontSizeLayoutUnit: number
  textColor: string
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  fontFace: FlowDocTextEngineMultiRunFontFaceV1
}

interface EffectiveRun {
  renderStartOffset: number
  renderEndOffset: number
  text: string
  style: EffectiveStyle
  sourceRuns: VNextTextBlockV4MeasurementRun[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonBlank(value: string): boolean {
  return value.trim().length > 0
}

function color(value: string): boolean {
  return /^[0-9A-Fa-f]{6}$/u.test(value)
}

function sha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function containsUnsupportedBidiText(value: string): boolean {
  return /[\u0590-\u08FF\u202A-\u202E\u2066-\u2069\uFB1D-\uFDFF\uFE70-\uFEFF]|[\u{10800}-\u{10FFF}\u{1E800}-\u{1EEFF}]/u.test(value)
}

function issue(
  code: FlowDocTextEngineMultiRunLayoutIssueCodeV1,
  path: string,
  message: string,
  details: Pick<FlowDocTextEngineMultiRunLayoutIssueV1, "inlineId" | "fontFaceId" | "shapingRunId"> = {},
): FlowDocTextEngineMultiRunLayoutIssueV1 {
  return { code, severity: "error", path, message, ...details }
}

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

function fontKey(fontFamilyKey: string, weight: "normal" | "bold", style: "normal" | "italic"): string {
  return `${fontFamilyKey}:${weight}:${style}`
}

function fontWeightNumber(weight: "normal" | "bold"): number {
  return weight === "bold" ? 700 : 400
}

function unitToLayoutUnit(
  unitValue: { value: number; unit: "pt" | "mm" },
  path: string,
): ReturnType<typeof convertVNextPointToLayoutUnitV1> {
  const point = unitValue.unit === "pt" ? unitValue.value : unitValue.value * 72 / 25.4
  return convertVNextPointToLayoutUnitV1(point, path)
}

function utf8ByteToUtf16Map(text: string): Map<number, number> {
  const map = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    byteOffset += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16Offset += scalar.length
    map.set(byteOffset, utf16Offset)
  }
  return map
}

function sameEffectiveStyle(left: EffectiveStyle, right: EffectiveStyle): boolean {
  return left.styleKey === right.styleKey
    && left.fontFamilyKey === right.fontFamilyKey
    && left.fontSizeLayoutUnit === right.fontSizeLayoutUnit
    && left.textColor === right.textColor
    && left.fontWeight === right.fontWeight
    && left.fontStyle === right.fontStyle
    && left.fontFace.fontFaceId === right.fontFace.fontFaceId
}

function createClusters(
  run: EffectiveRun,
  shape: FlowDocTextEngineMr1ShapeFactsV1,
  shapingRunId: string,
  issues: FlowDocTextEngineMultiRunLayoutIssueV1[],
): VNextTextBlockResolvedShapingRunV1["clusters"] | null {
  const utf16ByByte = utf8ByteToUtf16Map(run.text)
  const advanceByCluster = new Map<number, number>()
  shape.glyphs.forEach((glyph) => {
    const next = (advanceByCluster.get(glyph.cluster) ?? 0) + glyph.xAdvance
    if (!Number.isSafeInteger(next)) {
      issues.push(issue(
        "unsafe-cluster-advance",
        `shapingRuns.${shapingRunId}.glyphs`,
        "glyph advances exceed the safe font-unit integer range",
        { shapingRunId },
      ))
      return
    }
    advanceByCluster.set(glyph.cluster, next)
  })
  const starts = [...advanceByCluster.keys()].sort((left, right) => left - right)
  if (starts[0] !== 0) {
    issues.push(issue(
      "invalid-runtime-cluster",
      `shapingRuns.${shapingRunId}.clusters`,
      "LTR shaping clusters must begin at the first UTF-8 byte",
      { shapingRunId },
    ))
    return null
  }

  const clusters: VNextTextBlockResolvedShapingRunV1["clusters"] = []
  starts.forEach((startByte, index) => {
    const endByte = starts[index + 1] ?? shape.textByteLength
    const localStartOffset = utf16ByByte.get(startByte)
    const localEndOffset = utf16ByByte.get(endByte)
    const advanceFontUnit = advanceByCluster.get(startByte)
    if (
      localStartOffset == null
      || localEndOffset == null
      || localEndOffset <= localStartOffset
      || advanceFontUnit == null
      || advanceFontUnit < 0
    ) {
      issues.push(issue(
        "invalid-runtime-cluster",
        `shapingRuns.${shapingRunId}.clusters[${index}]`,
        "runtime clusters must retain ordered LTR UTF-16 ranges and non-negative advances",
        { shapingRunId },
      ))
      return
    }
    const scaled = scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: advanceFontUnit,
      fontSizeLayoutUnit: run.style.fontSizeLayoutUnit,
      unitsPerEm: shape.unitsPerEm,
    })
    if (scaled.status !== "accepted" || scaled.layoutUnit < 0) {
      issues.push(issue(
        "unsafe-cluster-advance",
        `shapingRuns.${shapingRunId}.clusters[${index}].advanceLayoutUnit`,
        "cluster advance cannot be represented by LayoutUnitPolicyV1",
        { shapingRunId },
      ))
      return
    }
    clusters.push({
      index,
      renderStartOffset: run.renderStartOffset + localStartOffset,
      renderEndOffset: run.renderStartOffset + localEndOffset,
      advanceLayoutUnit: scaled.layoutUnit,
    })
  })
  return issues.some((item) => item.shapingRunId === shapingRunId) ? null : clusters
}

function validateInput(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
): {
  issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
  faceById: Map<string, FlowDocTextEngineMultiRunFontFaceV1>
  faceByStyle: Map<string, FlowDocTextEngineMultiRunFontFaceV1>
} {
  const issues: FlowDocTextEngineMultiRunLayoutIssueV1[] = []
  const faceById = new Map<string, FlowDocTextEngineMultiRunFontFaceV1>()
  const faceByStyle = new Map<string, FlowDocTextEngineMultiRunFontFaceV1>()
  if (input.bindProductionLayout === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionLayout",
    "MR1 external multi-run preparation cannot bind production layout",
  ))
  if (
    !nonBlank(input.layoutId)
    || input.measurement.renderedText.length === 0
    || !Number.isSafeInteger(input.declaredLineHeightLayoutUnit)
    || input.declaredLineHeightLayoutUnit <= 0
  ) issues.push(issue(
    "invalid-layout-input",
    "input",
    "layout identity, non-empty text, and a positive safe declared line height are required",
  ))
  if (containsUnsupportedBidiText(input.measurement.renderedText)) issues.push(issue(
    "direction-unsupported",
    "measurement.renderedText",
    "MR1 v1 accepts only bounded LTR Thai/Latin text and blocks RTL/Bidi input",
  ))
  if (
    !nonBlank(input.paragraphStyle.styleKey)
    || input.paragraphStyle.styleKey !== input.measurement.styleKey
    || !nonBlank(input.paragraphStyle.runStyle.fontFamilyKey)
    || !Number.isFinite(input.paragraphStyle.runStyle.fontSize.value)
    || input.paragraphStyle.runStyle.fontSize.value <= 0
    || !color(input.paragraphStyle.runStyle.textColor)
    || !["normal", "bold"].includes(input.paragraphStyle.runStyle.fontWeight)
    || !["normal", "italic"].includes(input.paragraphStyle.runStyle.fontStyle)
    || input.paragraphStyle.runStyle.textDecoration !== "none"
    || input.paragraphStyle.runStyle.strikethrough !== false
  ) issues.push(issue(
    "invalid-paragraph-style",
    "paragraphStyle",
    "MR1 requires a complete paragraph run style matching the measurement style key",
  ))

  input.fontFaces.forEach((face, index) => {
    const path = `fontFaces[${index}]`
    const key = fontKey(
      face.fontFamilyKey,
      face.weight === 700 ? "bold" : "normal",
      face.style,
    )
    if (faceById.has(face.fontFaceId) || faceByStyle.has(key)) issues.push(issue(
      "duplicate-font-face",
      path,
      "font face ids and family/weight/style mappings must be unique",
      { fontFaceId: face.fontFaceId },
    ))
    if (
      !nonBlank(face.fontFaceId)
      || !nonBlank(face.fontFamilyKey)
      || !nonBlank(face.fontFamily)
      || !nonBlank(face.fontAssetPath)
      || !sha256(face.fontSha256)
      || ![400, 700].includes(face.weight)
      || !["normal", "italic"].includes(face.style)
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
      "MR1 font faces require pinned assets, supported style mapping, and normalized raw metrics",
      { fontFaceId: face.fontFaceId },
    ))
    faceById.set(face.fontFaceId, face)
    faceByStyle.set(key, face)
  })
  return { issues, faceById, faceByStyle }
}

export function createFlowDocTextEngineMultiRunLayoutV1(
  input: FlowDocTextEngineMultiRunLayoutInputV1,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineMultiRunLayoutResultV1 {
  const base = facts(input, runtime)
  const validation = validateInput(input)
  const issues = validation.issues
  if (issues.length > 0) return blocked(base, issues)

  const paragraphSize = unitToLayoutUnit(input.paragraphStyle.runStyle.fontSize, "paragraphStyle.runStyle.fontSize")
  if (paragraphSize.status !== "accepted") issues.push(issue(
    "font-size-conversion-blocked",
    "paragraphStyle.runStyle.fontSize",
    "paragraph font size cannot be represented by LayoutUnitPolicyV1",
  ))
  const paragraphFace = validation.faceByStyle.get(fontKey(
    input.paragraphStyle.runStyle.fontFamilyKey,
    input.paragraphStyle.runStyle.fontWeight,
    input.paragraphStyle.runStyle.fontStyle,
  ))
  if (paragraphFace == null) issues.push(issue(
    "font-face-unavailable",
    "paragraphStyle.runStyle",
    "paragraph style does not resolve to a pinned font face",
  ))
  if (issues.length > 0 || paragraphSize.status !== "accepted" || paragraphFace == null) return blocked(base, issues)

  const effectiveRuns: EffectiveRun[] = []
  input.measurement.runs.forEach((sourceRun, index) => {
    const path = `measurement.runs[${index}]`
    if (sourceRun.kind === "hard-break") return
    if (sourceRun.kind === "inline-image") {
      issues.push(issue(
        "inline-image-unsupported",
        path,
        "MR1 external itemization does not shape inline images",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const local = sourceRun.kind === "text" ? sourceRun.localStyle : undefined
    const textDecoration = local?.textDecoration ?? input.paragraphStyle.runStyle.textDecoration
    const strikethrough = local?.strikethrough ?? input.paragraphStyle.runStyle.strikethrough
    if (textDecoration !== "none" || strikethrough !== false) {
      issues.push(issue(
        "decoration-unsupported",
        path,
        "MR1 v1 does not emit underline or strikethrough paint facts",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const fontSize = unitToLayoutUnit(
      local?.fontSize ?? input.paragraphStyle.runStyle.fontSize,
      `${path}.localStyle.fontSize`,
    )
    if (fontSize.status !== "accepted") {
      issues.push(issue(
        "font-size-conversion-blocked",
        `${path}.localStyle.fontSize`,
        "effective Text Run font size cannot be represented by LayoutUnitPolicyV1",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const fontFamilyKey = local?.fontFamilyKey ?? input.paragraphStyle.runStyle.fontFamilyKey
    const fontWeight = local?.fontWeight ?? input.paragraphStyle.runStyle.fontWeight
    const fontStyle = local?.fontStyle ?? input.paragraphStyle.runStyle.fontStyle
    const textColor = local?.textColor ?? input.paragraphStyle.runStyle.textColor
    const face = validation.faceByStyle.get(fontKey(fontFamilyKey, fontWeight, fontStyle))
    if (face == null) {
      issues.push(issue(
        "font-face-unavailable",
        path,
        "effective Text Run style does not resolve to a pinned font face",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const styleFacts = {
      paragraphStyleKey: input.paragraphStyle.styleKey,
      fontFamilyKey,
      fontFaceId: face.fontFaceId,
      fontSizeLayoutUnit: fontSize.layoutUnit,
      textColor,
      fontWeight,
      fontStyle,
      textDecoration,
      strikethrough,
    }
    const style: EffectiveStyle = {
      styleKey: createVNextCompactFingerprint(JSON.stringify(styleFacts)),
      fontFamilyKey,
      fontSizeLayoutUnit: fontSize.layoutUnit,
      textColor,
      fontWeight,
      fontStyle,
      fontFace: face,
    }
    const previous = effectiveRuns.at(-1)
    if (
      previous != null
      && previous.renderEndOffset === sourceRun.renderStartOffset
      && sameEffectiveStyle(previous.style, style)
    ) {
      previous.renderEndOffset = sourceRun.renderEndOffset
      previous.text += sourceRun.renderedText
      previous.sourceRuns.push(clone(sourceRun))
    } else effectiveRuns.push({
      renderStartOffset: sourceRun.renderStartOffset,
      renderEndOffset: sourceRun.renderEndOffset,
      text: sourceRun.renderedText,
      style,
      sourceRuns: [clone(sourceRun)],
    })
  })
  if (issues.length > 0) return blocked(base, issues)

  const shapingRuns: VNextTextBlockResolvedShapingRunV1[] = []
  effectiveRuns.forEach((run, index) => {
    const shapingRunId = `${input.layoutId}:shaping-run-${index}:${run.renderStartOffset}-${run.renderEndOffset}`
    let shape: FlowDocTextEngineMr1ShapeFactsV1
    try {
      shape = runtime.shape({ text: run.text, fontFace: clone(run.style.fontFace) })
    } catch (error) {
      issues.push(issue(
        "runtime-shape-blocked",
        `shapingRuns[${index}]`,
        error instanceof Error ? error.message : "runtime shaping failed",
        { shapingRunId, fontFaceId: run.style.fontFace.fontFaceId },
      ))
      return
    }
    if (shape.text !== run.text || shape.fontFaceId !== run.style.fontFace.fontFaceId) {
      issues.push(issue(
        "runtime-font-mismatch",
        `shapingRuns[${index}]`,
        "runtime shape text and font face must match the effective run",
        { shapingRunId, fontFaceId: run.style.fontFace.fontFaceId },
      ))
      return
    }
    const face = run.style.fontFace
    if (
      shape.unitsPerEm !== face.unitsPerEm
      || shape.ascentFontUnit !== face.ascentFontUnit
      || shape.descentFontUnit !== face.descentFontUnit
      || shape.lineGapFontUnit !== face.lineGapFontUnit
    ) {
      issues.push(issue(
        "runtime-font-metrics-mismatch",
        `shapingRuns[${index}]`,
        "runtime font metrics must exactly match the digest-pinned font face facts",
        { shapingRunId, fontFaceId: face.fontFaceId },
      ))
      return
    }
    if (shape.summary.missingGlyphCount > 0) {
      issues.push(issue(
        "runtime-missing-glyph",
        `shapingRuns[${index}]`,
        "MR1 v1 blocks shaping results with missing glyphs",
        { shapingRunId, fontFaceId: face.fontFaceId },
      ))
      return
    }
    const clusters = createClusters(run, shape, shapingRunId, issues)
    if (clusters == null) return
    shapingRuns.push({
      shapingRunId,
      renderStartOffset: run.renderStartOffset,
      renderEndOffset: run.renderEndOffset,
      text: run.text,
      styleKey: run.style.styleKey,
      fontFaceId: face.fontFaceId,
      fontSizeLayoutUnit: run.style.fontSizeLayoutUnit,
      textColor: run.style.textColor,
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters,
    })
  })
  if (issues.length > 0) return blocked(base, issues)

  let segmentation
  try {
    segmentation = runtime.segment(input.measurement.renderedText)
  } catch (error) {
    issues.push(issue(
      "runtime-segmentation-blocked",
      "measurement.renderedText",
      error instanceof Error ? error.message : "runtime segmentation failed",
    ))
    return blocked(base, issues)
  }
  if (segmentation.text !== input.measurement.renderedText) issues.push(issue(
    "break-opportunity-mismatch",
    "measurement.renderedText",
    "runtime segmentation text must match the measurement request",
  ))

  const clusterBoundaries = new Set<number>([0, input.measurement.renderedText.length])
  shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  }))
  const mandatoryBreakOffsets = input.measurement.runs
    .filter((run) => run.kind === "hard-break")
    .map((run) => {
      clusterBoundaries.add(run.renderStartOffset)
      clusterBoundaries.add(run.renderEndOffset)
      return run.renderEndOffset
    })
  const segmentedBreakSet = new Set(segmentation.breakUtf16Offsets)
  mandatoryBreakOffsets.forEach((offset) => {
    if (!segmentedBreakSet.has(offset)) issues.push(issue(
      "break-opportunity-mismatch",
      "measurement.runs",
      `runtime segmentation omitted mandatory hard-break offset ${offset}`,
    ))
  })
  if (issues.length > 0) return blocked(base, issues)

  const breakOffsets = [...new Set([
    ...segmentation.breakUtf16Offsets.filter((offset) => (
      clusterBoundaries.has(offset)
      && isVNextSafeUtf16TextOffset(input.measurement.renderedText, offset)
    )),
    ...mandatoryBreakOffsets,
    0,
    input.measurement.renderedText.length,
  ])].sort((left, right) => left - right)
  if (breakOffsets.length < 2) return blocked(base, [issue(
    "break-opportunity-mismatch",
    "breakOffsets",
    "MR1 requires at least start and terminal break opportunities",
  )])

  const width = convertVNextPointToLayoutUnitV1(input.measurement.availableWidthPt, "measurement.availableWidthPt")
  if (width.status !== "accepted" || width.layoutUnit <= 0) return blocked(base, [issue(
    "invalid-layout-input",
    "measurement.availableWidthPt",
    "measurement width cannot be represented by LayoutUnitPolicyV1",
  )])
  const allClusters = shapingRuns.flatMap((run) => run.clusters).sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
  ))
  const cumulativeAtBreak = breakOffsets.map((offset) => {
    let total = 0
    for (const cluster of allClusters) {
      if (cluster.renderEndOffset > offset) break
      total += cluster.advanceLayoutUnit
      if (!Number.isSafeInteger(total)) return null
    }
    return total
  })
  if (cumulativeAtBreak.some((value) => value == null)) return blocked(base, [issue(
    "unsafe-cluster-advance",
    "breakOffsets",
    "cumulative line advances exceed the safe layout integer range",
  )])

  const mandatoryBreakSet = new Set(mandatoryBreakOffsets)
  const lines: VNextTextBlockMultiRunLayoutRequestV1["lines"] = []
  let startBreakIndex = 0
  while (startBreakIndex < breakOffsets.length - 1) {
    let endBreakIndex = startBreakIndex + 1
    let foundFittingBreak = false
    for (let candidateIndex = startBreakIndex + 1; candidateIndex < breakOffsets.length; candidateIndex += 1) {
      const candidateWidth = cumulativeAtBreak[candidateIndex]! - cumulativeAtBreak[startBreakIndex]!
      if (candidateWidth <= width.layoutUnit) {
        endBreakIndex = candidateIndex
        foundFittingBreak = true
        if (mandatoryBreakSet.has(breakOffsets[candidateIndex]!)) break
        continue
      }
      if (!foundFittingBreak) endBreakIndex = candidateIndex
      break
    }
    lines.push({
      index: lines.length,
      renderStartOffset: breakOffsets[startBreakIndex]!,
      renderEndOffset: breakOffsets[endBreakIndex]!,
    })
    startBreakIndex = endBreakIndex
  }

  const usedFaceIds = new Set<string>([
    paragraphFace.fontFaceId,
    ...shapingRuns.map((run) => run.fontFaceId),
  ])
  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    layoutId: input.layoutId,
    measurement: clone(input.measurement),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: width.layoutUnit,
    declaredLineHeightLayoutUnit: input.declaredLineHeightLayoutUnit,
    paragraphStyle: {
      styleKey: input.paragraphStyle.styleKey,
      fontFaceId: paragraphFace.fontFaceId,
      fontSizeLayoutUnit: paragraphSize.layoutUnit,
      textColor: input.paragraphStyle.runStyle.textColor,
    },
    fontFaces: input.fontFaces
      .filter((face) => usedFaceIds.has(face.fontFaceId))
      .map((face) => ({
        fontFaceId: face.fontFaceId,
        fontFamily: face.fontFamily,
        fontSha256: face.fontSha256,
        weight: face.weight,
        style: face.style,
        unitsPerEm: face.unitsPerEm,
        ascentFontUnit: face.ascentFontUnit,
        descentFontUnit: face.descentFontUnit,
        lineGapFontUnit: face.lineGapFontUnit,
      }))
      .sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId)),
    shapingRuns,
    breakOffsets,
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

  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    ...base,
    request,
    coreLayoutFingerprint: layout.fingerprint,
  }))
  return {
    ...base,
    status: "accepted",
    request,
    layout,
    issues: [],
    fingerprint,
    summary: {
      sourceRunCount: input.measurement.runs.length,
      effectiveRunCount: effectiveRuns.length,
      shapingRunCount: shapingRuns.length,
      clusterCount: shapingRuns.reduce((sum, run) => sum + run.clusters.length, 0),
      lineCount: lines.length,
      fontFaceCount: request.fontFaces.length,
      runtimeShapeCallCount: effectiveRuns.length,
      runtimeSegmentationCallCount: 1,
    },
  }
}
