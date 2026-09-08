import type { VNextCreatorTextResolvedV1 } from "./contentV1.js"
import { VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1 as profile, type VNextCreatorPreviewGlyphFactV1, type VNextCreatorPreviewRawMeasurementProviderV1 } from "./engineV1.js"

export class CreatorPreviewLayoutFailureV1 extends Error {
  constructor(public readonly code: string, message: string) { super(message) }
}
function requireFact(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new CreatorPreviewLayoutFailureV1(code, message)
}
export interface CreatorPreviewClusterV1 {
  start: number; end: number; inlineIndex: number; advancePt: number; glyphs: VNextCreatorPreviewGlyphFactV1[]; explicitBreak?: true
}
function shapeClusters(text: string, provider: VNextCreatorPreviewRawMeasurementProviderV1, inlineIndex: number, offset: number): CreatorPreviewClusterV1[] {
  if (!text.length) return []
  const facts = provider.shape(text)
  requireFact(facts.text === text && facts.unitsPerEm === 1000 && facts.ascentFontUnit === 1068 && facts.descentFontUnit === -232, "measurement-facts-mismatch", "Measured source or font metrics mismatch")
  requireFact(Array.isArray(facts.glyphs) && facts.glyphs.length > 0, "measurement-facts-mismatch", "Nonempty text requires glyph facts")
  const scalarBoundaries = new Set<number>(); let cursor = 0
  for (const scalar of text) { scalarBoundaries.add(cursor); cursor += scalar.length }
  const clusters: CreatorPreviewClusterV1[] = []
  for (const glyph of facts.glyphs) {
    requireFact([glyph.glyphId, glyph.clusterUtf16, glyph.xAdvance, glyph.yAdvance, glyph.xOffset, glyph.yOffset].every(Number.isSafeInteger)
      && glyph.glyphId > 0 && glyph.xAdvance >= 0 && glyph.yAdvance === 0 && scalarBoundaries.has(glyph.clusterUtf16), "unsupported-shaping", "Invalid glyph or unsupported direction")
    let cluster = clusters.at(-1)
    requireFact(!cluster || glyph.clusterUtf16 + offset >= cluster.start, "unsupported-shaping", "Only monotonic LTR clusters are supported")
    if (!cluster || glyph.clusterUtf16 + offset !== cluster.start) {
      if (cluster) cluster.end = glyph.clusterUtf16 + offset
      cluster = { start: glyph.clusterUtf16 + offset, end: offset + text.length, inlineIndex, advancePt: 0, glyphs: [] }
      clusters.push(cluster)
    }
    cluster.advancePt += glyph.xAdvance * profile.fontSizePt / 1000
    cluster.glyphs.push({ ...glyph })
  }
  requireFact(clusters[0].start === offset, "unsupported-shaping", "Shaping did not cover the entire text")
  return clusters
}
function prepareSoftWrappedLinesV1(parts: { text: string; inlineIndex: number }[], provider: VNextCreatorPreviewRawMeasurementProviderV1, paragraphOffset: number): CreatorPreviewClusterV1[][] {
  const text = parts.map(part => part.text).join("")
  const boundaries: number[] = []
  let boundary = paragraphOffset
  for (const part of parts.slice(0, -1)) { boundary += part.text.length; boundaries.push(boundary) }
  const whole = shapeClusters(text, provider, -1, paragraphOffset)
  const wholeBoundaries = new Set([paragraphOffset, paragraphOffset + text.length, ...whole.map(cluster => cluster.start)])
  for (const boundary of boundaries) {
    requireFact(wholeBoundaries.has(boundary) && !/^\p{M}/u.test(text.slice(boundary - paragraphOffset)), "unsupported-field-boundary", "Field boundary cannot safely separate shaping clusters")
  }
  let partOffset = paragraphOffset
  const clusters = parts.flatMap(part => {
    const shaped = shapeClusters(part.text, provider, part.inlineIndex, partOffset)
    partOffset += part.text.length
    return shaped
  })
  const breaks = text.length ? provider.segment(text) : [0]
  requireFact(Array.isArray(breaks) && breaks[0] === 0 && breaks.at(-1) === text.length && breaks.every((offset, index) => Number.isSafeInteger(offset) && offset >= 0 && offset <= text.length && (index === 0 || offset > breaks[index - 1])), "invalid-line-breaks", "Paragraph break facts mismatch")
  const width = profile.pageWidthPt - 2 * profile.marginPt
  // Measure every candidate with its actual line ends and existing inline isolation.
  const shapeRange = (start: number, end: number): CreatorPreviewClusterV1[] => {
    const shaped: CreatorPreviewClusterV1[] = []
    let groupStart = start
    while (groupStart < end) {
      let groupEnd = groupStart + 1
      while (groupEnd < end && clusters[groupEnd].inlineIndex === clusters[groupStart].inlineIndex) groupEnd++
      const offset = clusters[groupStart].start, stop = clusters[groupEnd - 1].end
      shaped.push(...shapeClusters(text.slice(offset - paragraphOffset, stop - paragraphOffset), provider, clusters[groupStart].inlineIndex, offset))
      groupStart = groupEnd
    }
    return shaped
  }
  const fits = (line: CreatorPreviewClusterV1[]) => line.reduce((sum, cluster) => sum + cluster.advancePt, 0) <= width + 1e-9
  const lines: CreatorPreviewClusterV1[][] = []
  const linesPerPage = Math.floor((profile.pageHeightPt - 2 * profile.marginPt) / profile.lineHeightPt)
  let start = 0
  while (start < clusters.length) {
    let end = start, advance = 0
    while (end < clusters.length && advance + clusters[end].advancePt <= width + 1e-9) {
      advance += clusters[end].advancePt; end++
    }
    // Paragraph advances are an estimate: line-final kerning can shrink or grow it.
    let shapedLine = shapeRange(start, end)
    while (end > start && !fits(shapedLine)) shapedLine = shapeRange(start, --end)
    while (end < clusters.length) {
      const next = shapeRange(start, end + 1)
      if (!fits(next)) break
      shapedLine = next; end++
    }
    // B policy: use every measured fit through a shaping-cluster boundary.
    // ICU facts remain validated above, but do not force an ordinary-word break.
    requireFact(end > start, "cluster-too-wide", "A line-final shaping cluster exceeds the body width")
    lines.push(shapedLine); start = end
    requireFact(lines.length <= linesPerPage * profile.maxPages, "page-limit", "Preview exceeds 100 pages")
  }
  return lines.length ? lines : [[]]
}

export function prepareCreatorPreviewLinesV1(source: VNextCreatorTextResolvedV1, provider: VNextCreatorPreviewRawMeasurementProviderV1): CreatorPreviewClusterV1[][] {
  if (!source.value.includes("\n")) return prepareSoftWrappedLinesV1([
    { text: source.prefix, inlineIndex: 0 }, { text: source.value, inlineIndex: 1 }, { text: source.suffix, inlineIndex: 2 },
  ], provider, 0)

  const values = source.value.split("\n"), lines: CreatorPreviewClusterV1[][] = []
  const linesPerPage = Math.floor((profile.pageHeightPt - 2 * profile.marginPt) / profile.lineHeightPt)
  let paragraphOffset = 0
  for (let index = 0; index < values.length; index++) {
    requireFact(!/^\p{M}/u.test(values[index]), "unsupported-field-boundary", "Field boundary cannot safely separate shaping clusters")
    const parts = [
      ...(index === 0 ? [{ text: source.prefix, inlineIndex: 0 }] : []),
      { text: values[index], inlineIndex: 1 },
      ...(index === values.length - 1 ? [{ text: source.suffix, inlineIndex: 2 }] : []),
    ]
    const segmentLines = prepareSoftWrappedLinesV1(parts, provider, paragraphOffset)
    lines.push(...segmentLines)
    requireFact(lines.length <= linesPerPage * profile.maxPages, "page-limit", "Preview exceeds 100 pages")
    paragraphOffset += parts.reduce((sum, part) => sum + part.text.length, 0)
    if (index < values.length - 1) {
      lines.at(-1)!.push({ start: paragraphOffset, end: paragraphOffset + 1, inlineIndex: 1, advancePt: 0, glyphs: [], explicitBreak: true })
      paragraphOffset++
    }
  }
  return lines
}
