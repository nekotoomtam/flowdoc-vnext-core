import type { FlowDocTextEngineLiveDraftNormalizedResultV1 } from "./runtimeCommon.js"

export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_LAYOUT_VERSION =
  "flowdoc-text-engine-live-draft-layout-xr2-v1" as const

export interface FlowDocTextEngineLiveDraftLayoutInputV1 {
  measurement: FlowDocTextEngineLiveDraftNormalizedResultV1
  availableWidthPt: number
  fontSizePt: number
  lineHeightPt: number
}

export interface FlowDocTextEngineLiveDraftMeasurementV1 {
  lines: string[]
  lineHeightPt: number
  widthPt: number
  heightPt: number
  lineBoxes: Array<{
    index: number
    text: string
    startOffset: number
    endOffset: number
    widthPt: number
    heightPt: number
    yOffsetPt: number
  }>
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function roundPt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function createUtf8ByteToUtf16OffsetMap(text: string): Map<number, number> {
  const offsets = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    byteOffset += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16Offset += scalar.length
    offsets.set(byteOffset, utf16Offset)
  }
  return offsets
}

/**
 * Converts pinned Rustybuzz/ICU4X facts into the synchronous draft consumed by
 * Core's injected renderer-backed measurer. This adapter remains outside Core.
 */
export function createFlowDocTextEngineLiveDraftMeasurementV1(
  input: FlowDocTextEngineLiveDraftLayoutInputV1,
): FlowDocTextEngineLiveDraftMeasurementV1 {
  const { measurement } = input
  requireFact(Number.isFinite(input.availableWidthPt) && input.availableWidthPt > 0, "available width must be positive")
  requireFact(Number.isFinite(input.fontSizePt) && input.fontSizePt > 0, "font size must be positive")
  requireFact(Number.isFinite(input.lineHeightPt) && input.lineHeightPt > 0, "line height must be positive")
  requireFact(measurement.text.length > 0, "XR-2 one-block measurement requires non-empty text")
  requireFact(measurement.unitsPerEm > 0, "font units per em must be positive")
  requireFact(measurement.breakUtf16Offsets[0] === 0, "line breaks must start at zero")
  requireFact(
    measurement.breakUtf16Offsets.at(-1) === measurement.text.length,
    "line breaks must terminate at the UTF-16 text length",
  )

  const utf16OffsetByUtf8Byte = createUtf8ByteToUtf16OffsetMap(measurement.text)
  const advanceByClusterOffset = new Map<number, number>()
  measurement.glyphs.forEach((glyph) => {
    const clusterOffset = utf16OffsetByUtf8Byte.get(glyph.cluster)
    requireFact(clusterOffset != null, "glyph cluster is not on a UTF-8 scalar boundary or exceeds the text")
    const advancePt = glyph.xAdvance * input.fontSizePt / measurement.unitsPerEm
    advanceByClusterOffset.set(clusterOffset, (advanceByClusterOffset.get(clusterOffset) ?? 0) + advancePt)
  })
  const clusterAdvances = [...advanceByClusterOffset.entries()].sort((left, right) => left[0] - right[0])
  const breaks = measurement.breakUtf16Offsets.filter((offset, index, offsets) => (
    index === 0 || offset > offsets[index - 1]!
  ))
  requireFact(breaks.length === measurement.breakUtf16Offsets.length, "line breaks must be strictly ascending")

  let clusterIndex = 0
  let cumulativeAdvancePt = 0
  const cumulativeAdvanceAtBreak = breaks.map((offset) => {
    while (clusterIndex < clusterAdvances.length && clusterAdvances[clusterIndex]![0] < offset) {
      cumulativeAdvancePt += clusterAdvances[clusterIndex]![1]
      clusterIndex += 1
    }
    return roundPt(cumulativeAdvancePt)
  })

  const lineBoxes: FlowDocTextEngineLiveDraftMeasurementV1["lineBoxes"] = []
  let startBreakIndex = 0
  while (startBreakIndex < breaks.length - 1) {
    let endBreakIndex = startBreakIndex + 1
    let widthPt = roundPt(cumulativeAdvanceAtBreak[endBreakIndex]! - cumulativeAdvanceAtBreak[startBreakIndex]!)
    for (let candidateIndex = startBreakIndex + 1; candidateIndex < breaks.length; candidateIndex += 1) {
      const candidateWidthPt = roundPt(
        cumulativeAdvanceAtBreak[candidateIndex]! - cumulativeAdvanceAtBreak[startBreakIndex]!,
      )
      if (candidateWidthPt <= input.availableWidthPt) {
        endBreakIndex = candidateIndex
        widthPt = candidateWidthPt
        continue
      }
      if (endBreakIndex === candidateIndex) widthPt = candidateWidthPt
      break
    }
    const startOffset = breaks[startBreakIndex]!
    const endOffset = breaks[endBreakIndex]!
    const index = lineBoxes.length
    lineBoxes.push({
      index,
      text: measurement.text.slice(startOffset, endOffset),
      startOffset,
      endOffset,
      widthPt,
      heightPt: input.lineHeightPt,
      yOffsetPt: roundPt(index * input.lineHeightPt),
    })
    startBreakIndex = endBreakIndex
  }

  const lines = lineBoxes.map((line) => line.text)
  return {
    lines,
    lineBoxes,
    lineHeightPt: input.lineHeightPt,
    widthPt: roundPt(lineBoxes.reduce((maximum, line) => Math.max(maximum, line.widthPt), 0)),
    heightPt: roundPt(lineBoxes.length * input.lineHeightPt),
  }
}
