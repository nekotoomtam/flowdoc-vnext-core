import type { VNextCreatorTextResolvedV1 } from "./contentV1.js"
import { VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1 as profile, type VNextCreatorPreviewGlyphFactV1, type VNextCreatorPreviewRawMeasurementProviderV1 } from "./engineV1.js"

export class CreatorPreviewLayoutFailureV1 extends Error {
  constructor(public readonly code: string, message: string) { super(message) }
}
function requireFact(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new CreatorPreviewLayoutFailureV1(code, message)
}
export interface CreatorPreviewClusterV1 {
  start: number; end: number; inlineIndex: number; advancePt: number; glyphs: VNextCreatorPreviewGlyphFactV1[]
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
export function prepareCreatorPreviewLinesV1(source: VNextCreatorTextResolvedV1, provider: VNextCreatorPreviewRawMeasurementProviderV1): CreatorPreviewClusterV1[][] {
  const text = source.text, boundaries = [source.prefix.length, source.prefix.length + source.value.length]
  const whole = shapeClusters(text, provider, -1, 0)
  const wholeBoundaries = new Set([0, text.length, ...whole.map(cluster => cluster.start)])
  for (const boundary of boundaries) {
    requireFact(wholeBoundaries.has(boundary) && !/^\p{M}/u.test(text.slice(boundary)), "unsupported-field-boundary", "Field boundary cannot safely separate shaping clusters")
  }
  const clusters = [source.prefix, source.value, source.suffix].flatMap((part, index) => shapeClusters(part, provider, index, index === 0 ? 0 : boundaries[index - 1]))
  const breaks = text.length ? provider.segment(text) : [0]
  requireFact(Array.isArray(breaks) && breaks[0] === 0 && breaks.at(-1) === text.length && breaks.every((offset, index) => Number.isSafeInteger(offset) && offset >= 0 && offset <= text.length && (index === 0 || offset > breaks[index - 1])), "invalid-line-breaks", "Paragraph break facts mismatch")
  const allowedBreaks = new Set(breaks), width = profile.pageWidthPt - 2 * profile.marginPt
  const lines: CreatorPreviewClusterV1[][] = []
  let start = 0
  while (start < clusters.length) {
    let end = start, lastBreak = start, advance = 0
    while (end < clusters.length && advance + clusters[end].advancePt <= width + 1e-9) {
      advance += clusters[end].advancePt; end++
      if (allowedBreaks.has(clusters[end - 1].end)) lastBreak = end
    }
    requireFact(end > start, "cluster-too-wide", "A shaping cluster exceeds the body width")
    // ICU4X whole-paragraph opportunities win. An overlong word can break only at a real cluster boundary.
    if (end < clusters.length && lastBreak > start) end = lastBreak
    // Re-shape at actual line ends: retaining paragraph-final kerning across a wrap is incorrect.
    let shapedLine: CreatorPreviewClusterV1[] = []
    while (end > start) {
      shapedLine = []
      let groupStart = start
      while (groupStart < end) {
        let groupEnd = groupStart + 1
        while (groupEnd < end && clusters[groupEnd].inlineIndex === clusters[groupStart].inlineIndex) groupEnd++
        const offset = clusters[groupStart].start, stop = clusters[groupEnd - 1].end
        shapedLine.push(...shapeClusters(text.slice(offset, stop), provider, clusters[groupStart].inlineIndex, offset))
        groupStart = groupEnd
      }
      if (shapedLine.reduce((sum, cluster) => sum + cluster.advancePt, 0) <= width + 1e-9) break
      end--
      let priorBreak = end - 1
      while (priorBreak >= start && !allowedBreaks.has(clusters[priorBreak].end)) priorBreak--
      if (priorBreak >= start) end = priorBreak + 1
    }
    requireFact(end > start, "cluster-too-wide", "A line-final shaping cluster exceeds the body width")
    lines.push(shapedLine); start = end
    const linesPerPage = Math.floor((profile.pageHeightPt - 2 * profile.marginPt) / profile.lineHeightPt)
    requireFact(lines.length <= linesPerPage * profile.maxPages, "page-limit", "Preview exceeds 100 pages")
  }
  return lines.length ? lines : [[]]
}
