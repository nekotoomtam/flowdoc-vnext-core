import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type {
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedLineV1,
} from "./textBlockMultiRunLayoutContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizedSourceSegments(
  lineStart: number,
  segments: readonly VNextTextBlockMultiRunSourceSegmentV1[],
) {
  return segments.map((segment) => ({
    inlineId: segment.inlineId,
    kind: segment.kind,
    ...(segment.fieldKey == null ? {} : { fieldKey: segment.fieldKey }),
    ...(segment.styleKey == null ? {} : { styleKey: segment.styleKey }),
    ...(segment.localStyle == null ? {} : { localStyle: clone(segment.localStyle) }),
    renderStartOffset: segment.renderStartOffset - lineStart,
    renderEndOffset: segment.renderEndOffset - lineStart,
    renderedText: segment.renderedText,
  }))
}

export function createVNextTextBlockMultiRunSemanticLineFactsV1(
  line: VNextTextBlockPositionedLineV1,
) {
  return {
    text: line.text,
    renderLength: line.renderEndOffset - line.renderStartOffset,
    widthLayoutUnit: line.widthLayoutUnit,
    naturalAscentLayoutUnit: line.naturalAscentLayoutUnit,
    naturalDescentLayoutUnit: line.naturalDescentLayoutUnit,
    naturalHeightLayoutUnit: line.naturalHeightLayoutUnit,
    leadingBeforeLayoutUnit: line.leadingBeforeLayoutUnit,
    leadingAfterLayoutUnit: line.leadingAfterLayoutUnit,
    heightLayoutUnit: line.heightLayoutUnit,
    baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
    fragments: line.fragments.map((fragment) => ({
      renderStartOffset: fragment.renderStartOffset - line.renderStartOffset,
      renderEndOffset: fragment.renderEndOffset - line.renderStartOffset,
      text: fragment.text,
      xLayoutUnit: fragment.xLayoutUnit,
      advanceLayoutUnit: fragment.advanceLayoutUnit,
      baselineShiftLayoutUnit: fragment.baselineShiftLayoutUnit,
      styleKey: fragment.styleKey,
      fontFaceId: fragment.fontFaceId,
      fontFamily: fragment.fontFamily,
      fontSha256: fragment.fontSha256,
      fontWeight: fragment.fontWeight,
      fontStyle: fragment.fontStyle,
      fontSizeLayoutUnit: fragment.fontSizeLayoutUnit,
      textColor: fragment.textColor,
      ascentLayoutUnit: fragment.ascentLayoutUnit,
      descentLayoutUnit: fragment.descentLayoutUnit,
      lineGapLayoutUnit: fragment.lineGapLayoutUnit,
      sourceSegments: normalizedSourceSegments(line.renderStartOffset, fragment.sourceSegments),
    })),
    sourceSegments: normalizedSourceSegments(line.renderStartOffset, line.sourceSegments),
  }
}

export function createVNextTextBlockMultiRunSemanticLineFingerprintV1(
  line: VNextTextBlockPositionedLineV1,
): string {
  return createVNextCompactFingerprint(JSON.stringify(createVNextTextBlockMultiRunSemanticLineFactsV1(line)))
}
