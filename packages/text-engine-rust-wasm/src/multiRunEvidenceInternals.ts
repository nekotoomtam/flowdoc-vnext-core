import {
  convertVNextPointToLayoutUnitV1,
  createVNextTextBlockEffectiveShapingStyleIdentityV1,
  isVNextSafeUtf16TextOffset,
  scaleVNextFontMetricToLayoutUnitV1,
  type VNextTextBlockMultiRunFontFaceV1,
  type VNextTextBlockMultiRunParagraphStyleV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockV4MeasurementRun,
} from "@flowdoc/vnext-core"
import type {
  FlowDocTextEngineMultiRunFontFaceV1,
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunLayoutIssueCodeV1,
  FlowDocTextEngineMultiRunLayoutIssueV1,
  FlowDocTextEngineMultiRunRuntimeV1,
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

export type FlowDocTextEnginePreparedEvidenceInternalResult =
  | {
      status: "accepted"
      paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
      usedFontFaces: readonly VNextTextBlockMultiRunFontFaceV1[]
      shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
      breakOffsets: readonly number[]
      mandatoryBreakOffsets: readonly number[]
      sourceRunCount: number
      textBearingRunCount: number
      hardBreakCount: number
      inlineImageCount: number
      runtimeShapeCallCount: number
      runtimeSegmentationCallCount: 1
      issues: []
    }
  | {
      status: "blocked"
      paragraphStyle: null
      usedFontFaces: null
      shapingRuns: null
      breakOffsets: null
      mandatoryBreakOffsets: null
      sourceRunCount: number
      textBearingRunCount: number
      hardBreakCount: number
      inlineImageCount: number
      runtimeShapeCallCount: number
      runtimeSegmentationCallCount: 0 | 1
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
    }

interface FlowDocTextEngineMultiRunEvidencePreparationInputInternal {
  layout: FlowDocTextEngineMultiRunLayoutInputV1
  runtime: FlowDocTextEngineMultiRunRuntimeV1
  capability: "text-only-v1" | "inline-image-v2"
}

interface FlowDocTextEngineMultiRunEvidencePreparationProfileInternal {
  complete(
    phase: "input-and-style-resolution" | "shaping" | "segmentation",
  ): void
}

interface FlowDocTextEngineSourceRunFactsInternal {
  sourceRunCount: number
  textBearingRunCount: number
  hardBreakCount: number
  inlineImageCount: number
  mandatoryBreakOffsets: number[]
}

export function cloneFlowDocTextEngineEvidenceValueInternal<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createFlowDocTextEngineMultiRunIssueInternal(
  code: FlowDocTextEngineMultiRunLayoutIssueCodeV1,
  path: string,
  message: string,
  details: Pick<
    FlowDocTextEngineMultiRunLayoutIssueV1,
    "inlineId" | "fontFaceId" | "shapingRunId"
  > = {},
): FlowDocTextEngineMultiRunLayoutIssueV1 {
  return { code, severity: "error", path, message, ...details }
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

function fontKey(
  fontFamilyKey: string,
  weight: "normal" | "bold",
  style: "normal" | "italic",
): string {
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
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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
    issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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

function blocked(
  sourceFacts: FlowDocTextEngineSourceRunFactsInternal,
  issues: FlowDocTextEngineMultiRunLayoutIssueV1[],
  runtimeShapeCallCount: number,
  runtimeSegmentationCallCount: 0 | 1,
): FlowDocTextEnginePreparedEvidenceInternalResult {
  return {
    status: "blocked",
    paragraphStyle: null,
    usedFontFaces: null,
    shapingRuns: null,
    breakOffsets: null,
    mandatoryBreakOffsets: null,
    sourceRunCount: sourceFacts.sourceRunCount,
    textBearingRunCount: sourceFacts.textBearingRunCount,
    hardBreakCount: sourceFacts.hardBreakCount,
    inlineImageCount: sourceFacts.inlineImageCount,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
    issues,
  }
}

export function prepareFlowDocTextEngineMultiRunEvidenceInternal(
  input: FlowDocTextEngineMultiRunEvidencePreparationInputInternal,
): FlowDocTextEnginePreparedEvidenceInternalResult
export function prepareFlowDocTextEngineMultiRunEvidenceInternal(
  input: FlowDocTextEngineMultiRunEvidencePreparationInputInternal & {
    profile: FlowDocTextEngineMultiRunEvidencePreparationProfileInternal
  },
): FlowDocTextEnginePreparedEvidenceInternalResult
export function prepareFlowDocTextEngineMultiRunEvidenceInternal(
  input: FlowDocTextEngineMultiRunEvidencePreparationInputInternal & {
    profile?: FlowDocTextEngineMultiRunEvidencePreparationProfileInternal
  },
): FlowDocTextEnginePreparedEvidenceInternalResult {
  const { layout, runtime } = input
  const issues: FlowDocTextEngineMultiRunLayoutIssueV1[] = []
  const faceById = new Map<string, FlowDocTextEngineMultiRunFontFaceV1>()
  const faceByStyle = new Map<string, FlowDocTextEngineMultiRunFontFaceV1>()
  let runtimeShapeCallCount = 0
  let runtimeSegmentationCallCount: 0 | 1 = 0
  const sourceFacts: FlowDocTextEngineSourceRunFactsInternal = {
    sourceRunCount: 0,
    textBearingRunCount: 0,
    hardBreakCount: 0,
    inlineImageCount: 0,
    mandatoryBreakOffsets: [],
  }

  if (layout.bindProductionLayout === true) issues.push(
    createFlowDocTextEngineMultiRunIssueInternal(
      "production-binding-forbidden",
      "bindProductionLayout",
      "MR1 external multi-run preparation cannot bind production layout",
    ),
  )
  if (
    !nonBlank(layout.layoutId)
    || layout.measurement.renderedText.length === 0
    || !Number.isSafeInteger(layout.declaredLineHeightLayoutUnit)
    || layout.declaredLineHeightLayoutUnit <= 0
  ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
    "invalid-layout-input",
    "input",
    "layout identity, non-empty text, and a positive safe declared line height are required",
  ))
  if (containsUnsupportedBidiText(layout.measurement.renderedText)) issues.push(
    createFlowDocTextEngineMultiRunIssueInternal(
      "direction-unsupported",
      "measurement.renderedText",
      "MR1 v1 accepts only bounded LTR Thai/Latin text and blocks RTL/Bidi input",
    ),
  )
  if (
    !nonBlank(layout.paragraphStyle.styleKey)
    || layout.paragraphStyle.styleKey !== layout.measurement.styleKey
    || !nonBlank(layout.paragraphStyle.runStyle.fontFamilyKey)
    || !Number.isFinite(layout.paragraphStyle.runStyle.fontSize.value)
    || layout.paragraphStyle.runStyle.fontSize.value <= 0
    || !color(layout.paragraphStyle.runStyle.textColor)
    || !["normal", "bold"].includes(layout.paragraphStyle.runStyle.fontWeight)
    || !["normal", "italic"].includes(layout.paragraphStyle.runStyle.fontStyle)
    || layout.paragraphStyle.runStyle.textDecoration !== "none"
    || layout.paragraphStyle.runStyle.strikethrough !== false
  ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
    "invalid-paragraph-style",
    "paragraphStyle",
    "MR1 requires a complete paragraph run style matching the measurement style key",
  ))

  layout.fontFaces.forEach((face, index) => {
    const path = `fontFaces[${index}]`
    const key = fontKey(
      face.fontFamilyKey,
      face.weight === 700 ? "bold" : "normal",
      face.style,
    )
    if (faceById.has(face.fontFaceId) || faceByStyle.has(key)) issues.push(
      createFlowDocTextEngineMultiRunIssueInternal(
        "duplicate-font-face",
        path,
        "font face ids and family/weight/style mappings must be unique",
        { fontFaceId: face.fontFaceId },
      ),
    )
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
    ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
      "invalid-font-face",
      path,
      "MR1 font faces require pinned assets, supported style mapping, and normalized raw metrics",
      { fontFaceId: face.fontFaceId },
    ))
    faceById.set(face.fontFaceId, face)
    faceByStyle.set(key, face)
  })
  if (issues.length > 0) return blocked(
    sourceFacts,
    issues,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
  )

  const paragraphSize = unitToLayoutUnit(
    layout.paragraphStyle.runStyle.fontSize,
    "paragraphStyle.runStyle.fontSize",
  )
  if (paragraphSize.status !== "accepted") issues.push(
    createFlowDocTextEngineMultiRunIssueInternal(
      "font-size-conversion-blocked",
      "paragraphStyle.runStyle.fontSize",
      "paragraph font size cannot be represented by LayoutUnitPolicyV1",
    ),
  )
  const paragraphFace = faceByStyle.get(fontKey(
    layout.paragraphStyle.runStyle.fontFamilyKey,
    layout.paragraphStyle.runStyle.fontWeight,
    layout.paragraphStyle.runStyle.fontStyle,
  ))
  if (paragraphFace == null) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
    "font-face-unavailable",
    "paragraphStyle.runStyle",
    "paragraph style does not resolve to a pinned font face",
  ))
  if (
    issues.length > 0
    || paragraphSize.status !== "accepted"
    || paragraphFace == null
  ) return blocked(sourceFacts, issues, runtimeShapeCallCount, runtimeSegmentationCallCount)

  const effectiveRuns: EffectiveRun[] = []
  const atomBoundaries = new Set<number>([0, layout.measurement.renderedText.length])
  let expectedRenderOffset = 0
  layout.measurement.runs.forEach((sourceRun, index) => {
    const path = `measurement.runs[${index}]`
    sourceFacts.sourceRunCount += 1
    if (
      !nonBlank(sourceRun.inlineId)
      || !Number.isSafeInteger(sourceRun.renderStartOffset)
      || !Number.isSafeInteger(sourceRun.renderEndOffset)
      || sourceRun.renderStartOffset !== expectedRenderOffset
      || sourceRun.renderEndOffset <= sourceRun.renderStartOffset
      || sourceRun.renderEndOffset > layout.measurement.renderedText.length
      || !isVNextSafeUtf16TextOffset(
        layout.measurement.renderedText,
        sourceRun.renderStartOffset,
      )
      || !isVNextSafeUtf16TextOffset(
        layout.measurement.renderedText,
        sourceRun.renderEndOffset,
      )
      || sourceRun.renderedText !== layout.measurement.renderedText.slice(
        sourceRun.renderStartOffset,
        sourceRun.renderEndOffset,
      )
    ) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "invalid-layout-input",
        path,
        "measurement runs must retain ordered gap-free safe ranges and exact rendered slices",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    expectedRenderOffset = sourceRun.renderEndOffset
    switch (sourceRun.kind) {
      case "text":
        sourceFacts.textBearingRunCount += 1
        if (/[\uFFFC\r\n]/u.test(sourceRun.renderedText)) issues.push(
          createFlowDocTextEngineMultiRunIssueInternal(
            "invalid-layout-input",
            path,
            "text source runs cannot contain inline-image placeholders or hard breaks",
            { inlineId: sourceRun.inlineId },
          ),
        )
        break
      case "resolved-field":
        sourceFacts.textBearingRunCount += 1
        if (
          !nonBlank(sourceRun.fieldKey ?? "")
          || /[\uFFFC\r\n]/u.test(sourceRun.renderedText)
        ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
          "invalid-layout-input",
          path,
          "resolved-field runs require a field key and text-only rendered content",
          { inlineId: sourceRun.inlineId },
        ))
        break
      case "generated-page-number":
        sourceFacts.textBearingRunCount += 1
        if (
          !/^sha256:[a-f0-9]{64}$/u.test(sourceRun.generatedOwnerFingerprint ?? "")
          || /[\uFFFC\r\n]/u.test(sourceRun.renderedText)
        ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
          "invalid-layout-input",
          path,
          "generated page-number runs require a compact owner fingerprint and text-only content",
          { inlineId: sourceRun.inlineId },
        ))
        break
      case "hard-break": {
        sourceFacts.hardBreakCount += 1
        if (
          sourceRun.renderedText !== "\n"
          || sourceRun.renderEndOffset !== sourceRun.renderStartOffset + 1
        ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
          "invalid-layout-input",
          path,
          "hard-break runs must occupy exactly one newline UTF-16 slot",
          { inlineId: sourceRun.inlineId },
        ))
        atomBoundaries.add(sourceRun.renderStartOffset)
        atomBoundaries.add(sourceRun.renderEndOffset)
        sourceFacts.mandatoryBreakOffsets.push(sourceRun.renderEndOffset)
        return
      }
      case "inline-image": {
        sourceFacts.inlineImageCount += 1
        if (
          sourceRun.renderedText !== "\uFFFC"
          || sourceRun.renderEndOffset !== sourceRun.renderStartOffset + 1
          || sourceRun.frame == null
          || (sourceRun.assetId !== null && !nonBlank(sourceRun.assetId ?? ""))
        ) issues.push(createFlowDocTextEngineMultiRunIssueInternal(
          "invalid-layout-input",
          path,
          "inline-image runs require one U+FFFC slot, resolved asset facts, and a frame",
          { inlineId: sourceRun.inlineId },
        ))
        atomBoundaries.add(sourceRun.renderStartOffset)
        atomBoundaries.add(sourceRun.renderEndOffset)
        if (input.capability === "text-only-v1") issues.push(
          createFlowDocTextEngineMultiRunIssueInternal(
            "inline-image-unsupported",
            path,
            "MR1 external itemization does not shape inline images",
            { inlineId: sourceRun.inlineId },
          ),
        )
        return
      }
      default:
        issues.push(createFlowDocTextEngineMultiRunIssueInternal(
          "invalid-layout-input",
          path,
          "measurement source-run kind is not supported by the closed producer switch",
          { inlineId: sourceRun.inlineId },
        ))
        return
    }

    const local = sourceRun.kind === "text" ? sourceRun.localStyle : undefined
    const textDecoration = local?.textDecoration
      ?? layout.paragraphStyle.runStyle.textDecoration
    const strikethrough = local?.strikethrough
      ?? layout.paragraphStyle.runStyle.strikethrough
    if (textDecoration !== "none" || strikethrough !== false) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "decoration-unsupported",
        path,
        "MR1 v1 does not emit underline or strikethrough paint facts",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const fontSize = unitToLayoutUnit(
      local?.fontSize ?? layout.paragraphStyle.runStyle.fontSize,
      `${path}.localStyle.fontSize`,
    )
    if (fontSize.status !== "accepted") {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "font-size-conversion-blocked",
        `${path}.localStyle.fontSize`,
        "effective Text Run font size cannot be represented by LayoutUnitPolicyV1",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const fontFamilyKey = local?.fontFamilyKey
      ?? layout.paragraphStyle.runStyle.fontFamilyKey
    const fontWeight = local?.fontWeight
      ?? layout.paragraphStyle.runStyle.fontWeight
    const fontStyle = local?.fontStyle
      ?? layout.paragraphStyle.runStyle.fontStyle
    const textColor = local?.textColor
      ?? layout.paragraphStyle.runStyle.textColor
    const face = faceByStyle.get(fontKey(fontFamilyKey, fontWeight, fontStyle))
    if (face == null) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "font-face-unavailable",
        path,
        "effective Text Run style does not resolve to a pinned font face",
        { inlineId: sourceRun.inlineId },
      ))
      return
    }
    const styleFacts = {
      paragraphStyleKey: layout.paragraphStyle.styleKey,
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
      styleKey: createVNextTextBlockEffectiveShapingStyleIdentityV1(styleFacts),
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
      previous.sourceRuns.push(cloneFlowDocTextEngineEvidenceValueInternal(sourceRun))
    } else effectiveRuns.push({
      renderStartOffset: sourceRun.renderStartOffset,
      renderEndOffset: sourceRun.renderEndOffset,
      text: sourceRun.renderedText,
      style,
      sourceRuns: [cloneFlowDocTextEngineEvidenceValueInternal(sourceRun)],
    })
  })
  if (expectedRenderOffset !== layout.measurement.renderedText.length) issues.push(
    createFlowDocTextEngineMultiRunIssueInternal(
      "invalid-layout-input",
      "measurement.runs",
      "measurement runs must cover the complete rendered TextBlock string",
    ),
  )
  if (issues.length > 0) return blocked(
    sourceFacts,
    issues,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
  )
  input.profile?.complete("input-and-style-resolution")

  const shapingRuns: VNextTextBlockResolvedShapingRunV1[] = []
  effectiveRuns.forEach((run, index) => {
    const shapingRunId =
      `${layout.layoutId}:shaping-run-${index}:${run.renderStartOffset}-${run.renderEndOffset}`
    let shape: FlowDocTextEngineMr1ShapeFactsV1
    try {
      runtimeShapeCallCount += 1
      shape = runtime.shape({
        text: run.text,
        fontFace: cloneFlowDocTextEngineEvidenceValueInternal(run.style.fontFace),
      })
    } catch (error) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "runtime-shape-blocked",
        `shapingRuns[${index}]`,
        error instanceof Error ? error.message : "runtime shaping failed",
        { shapingRunId, fontFaceId: run.style.fontFace.fontFaceId },
      ))
      return
    }
    if (shape.text !== run.text || shape.fontFaceId !== run.style.fontFace.fontFaceId) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
        "runtime-font-metrics-mismatch",
        `shapingRuns[${index}]`,
        "runtime font metrics must exactly match the digest-pinned font face facts",
        { shapingRunId, fontFaceId: face.fontFaceId },
      ))
      return
    }
    if (shape.summary.missingGlyphCount > 0) {
      issues.push(createFlowDocTextEngineMultiRunIssueInternal(
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
  if (issues.length > 0) return blocked(
    sourceFacts,
    issues,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
  )
  input.profile?.complete("shaping")

  let segmentation
  try {
    runtimeSegmentationCallCount = 1
    segmentation = runtime.segment(layout.measurement.renderedText)
  } catch (error) {
    issues.push(createFlowDocTextEngineMultiRunIssueInternal(
      "runtime-segmentation-blocked",
      "measurement.renderedText",
      error instanceof Error ? error.message : "runtime segmentation failed",
    ))
    return blocked(sourceFacts, issues, runtimeShapeCallCount, runtimeSegmentationCallCount)
  }
  if (segmentation.text !== layout.measurement.renderedText) issues.push(
    createFlowDocTextEngineMultiRunIssueInternal(
      "break-opportunity-mismatch",
      "measurement.renderedText",
      "runtime segmentation text must match the measurement request",
    ),
  )

  const clusterBoundaries = new Set<number>(atomBoundaries)
  shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    clusterBoundaries.add(cluster.renderStartOffset)
    clusterBoundaries.add(cluster.renderEndOffset)
  }))
  const mandatoryBreakOffsets = sourceFacts.mandatoryBreakOffsets
  const segmentedBreakSet = new Set(segmentation.breakUtf16Offsets)
  mandatoryBreakOffsets.forEach((offset) => {
    if (!segmentedBreakSet.has(offset)) issues.push(
      createFlowDocTextEngineMultiRunIssueInternal(
        "break-opportunity-mismatch",
        "measurement.runs",
        `runtime segmentation omitted mandatory hard-break offset ${offset}`,
      ),
    )
  })
  if (issues.length > 0) return blocked(
    sourceFacts,
    issues,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
  )
  input.profile?.complete("segmentation")

  const breakOffsets = [...new Set([
    ...segmentation.breakUtf16Offsets.filter((offset) => (
      clusterBoundaries.has(offset)
      && isVNextSafeUtf16TextOffset(layout.measurement.renderedText, offset)
    )),
    ...mandatoryBreakOffsets,
    0,
    layout.measurement.renderedText.length,
  ])].sort((left, right) => left - right)
  if (breakOffsets.length < 2) return blocked(sourceFacts, [
    createFlowDocTextEngineMultiRunIssueInternal(
      "break-opportunity-mismatch",
      "breakOffsets",
      "MR1 requires at least start and terminal break opportunities",
    ),
  ], runtimeShapeCallCount, runtimeSegmentationCallCount)

  const usedFaceIds = new Set<string>([
    paragraphFace.fontFaceId,
    ...shapingRuns.map((run) => run.fontFaceId),
  ])
  const usedFontFaces = layout.fontFaces
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
    .sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId))
  return {
    status: "accepted",
    paragraphStyle: {
      styleKey: layout.paragraphStyle.styleKey,
      fontFaceId: paragraphFace.fontFaceId,
      fontSizeLayoutUnit: paragraphSize.layoutUnit,
      textColor: layout.paragraphStyle.runStyle.textColor,
    },
    usedFontFaces,
    shapingRuns,
    breakOffsets,
    mandatoryBreakOffsets: [...sourceFacts.mandatoryBreakOffsets],
    sourceRunCount: sourceFacts.sourceRunCount,
    textBearingRunCount: sourceFacts.textBearingRunCount,
    hardBreakCount: sourceFacts.hardBreakCount,
    inlineImageCount: sourceFacts.inlineImageCount,
    runtimeShapeCallCount,
    runtimeSegmentationCallCount,
    issues: [],
  }
}
