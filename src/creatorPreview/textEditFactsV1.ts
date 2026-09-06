import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { requireCreatorEditLayoutV1 } from "./textEditAdmissionV1.js"
import type { CreatorTextCaretDataV1, CreatorTextGeometryDataV1, VNextCreatorTextAddressV1, VNextCreatorTextEditBindingV1 } from "./textEditGeometryContractV1.js"

export function buildCreatorEditFactsV1(record: ReturnType<typeof requireCreatorEditLayoutV1>, binding: VNextCreatorTextEditBindingV1): CreatorTextGeometryDataV1 {
  const { result, source } = record
  const tuple = source.tuple
  const addresses: VNextCreatorTextAddressV1[] = source.inlineIds.map((inlineId, index) => index === 1
    ? { kind: "field-value", occurrenceId: source.occurrenceId, inlineId, valueAddress: source.valueAddress }
    : { kind: "authored-inline", sectionId: tuple.sectionId, placementId: tuple.placementId, patternId: tuple.patternId, patternDraftId: tuple.patternDraftId, blockId: tuple.blockId, inlineId })
  const offsets = [0, source.prefix.length, source.prefix.length + source.value.length]
  const texts = [source.prefix, source.value, source.suffix]
  const data: CreatorTextGeometryDataV1 = { boundaryPolicy: "shaping-cluster-edges/1", selectionPolicy: "logical-cluster-advances/1",
    hitPolicy: "same-page-nearest-line-then-stop/1", tieOrder: "line-paragraph-inline-downstream-first/1", binding, stops: [], spans: [],
    pages: result.pages.map(page => ({ pageIndex: page.index, widthPt: page.widthPt, heightPt: page.heightPt })) }
  function stop(index: number, offset: number, affinity: "upstream" | "downstream", pageIndex: number, lineIndex: number, xPt: number, yPt: number) {
    data.stops.push({ address: addresses[index], offsetUtf16: offset - offsets[index], paragraphOffsetUtf16: offset, affinity, pageIndex, lineIndex, xPt, yPt, heightPt: 18 })
  }
  for (const page of result.pages) for (const command of page.paintCommands) {
    const index = source.inlineIds.indexOf(command.inlineId), y = command.baselinePt - 14.016
    let cursor = 0, pen = command.xPt
    while (cursor < command.glyphs.length) {
      const start = command.glyphs[cursor].clusterUtf16, x = pen
      do { pen += command.glyphs[cursor++].advancePt } while (cursor < command.glyphs.length && command.glyphs[cursor].clusterUtf16 === start)
      const end = cursor < command.glyphs.length ? command.glyphs[cursor].clusterUtf16 : command.sourceRange.endUtf16
      stop(index, start, "downstream", page.index, command.lineIndex, x, y)
      stop(index, end, "upstream", page.index, command.lineIndex, pen, y)
      data.spans.push({ address: addresses[index], startUtf16: start - offsets[index], endUtf16: end - offsets[index], paragraphStartUtf16: start, paragraphEndUtf16: end,
        pageIndex: page.index, lineIndex: command.lineIndex, rectPt: { x, y, width: pen - x, height: 18 } })
    }
  }
  // Empty source addresses have their own identity even at coincident positions.
  const paintStops = data.stops.slice(), firstPaintStop = paintStops[0], lastPaintStop = paintStops.at(-1)
  for (let index = 0; index < texts.length; index++) if (!texts[index].length) {
    const edges = paintStops.filter(caret => caret.paragraphOffsetUtf16 === offsets[index])
    if (edges.length) {
      for (const affinity of ["upstream", "downstream"] as const) {
        const edge = edges.find(caret => caret.affinity === affinity)
        if (edge) stop(index, offsets[index], affinity, edge.pageIndex, edge.lineIndex, edge.xPt, edge.yPt)
      }
      continue
    }
    const anchor = index === 1 ? result.occurrences[0].regions[0] : undefined
    const neighbor = index === 0 ? firstPaintStop : lastPaintStop
    const location = anchor ? { pageIndex: anchor.pageIndex, lineIndex: anchor.lineIndex, xPt: anchor.anchorPt.x, yPt: anchor.anchorPt.y }
      : neighbor ?? { pageIndex: 0, lineIndex: 0, xPt: 36, yPt: 36 }
    stop(index, offsets[index], "downstream", location.pageIndex, location.lineIndex, location.xPt, location.yPt)
  }
  // At a non-wrap edge either affinity has identical geometry. At wraps retain
  // the actual upstream prior-line and downstream next-line coordinates.
  const bySource = new Map<string, CreatorTextCaretDataV1[]>()
  for (const caret of data.stops) {
    const key = stringifyVNextCanonicalJson([caret.address, caret.offsetUtf16])
    const entries = bySource.get(key) ?? []; entries.push(caret); bySource.set(key, entries)
  }
  for (const entries of bySource.values()) for (const affinity of ["upstream", "downstream"] as const) {
    if (!entries.some(caret => caret.affinity === affinity)) data.stops.push({ ...entries[0], affinity })
  }
  data.stops.sort((a, b) => a.lineIndex - b.lineIndex || a.paragraphOffsetUtf16 - b.paragraphOffsetUtf16
    || source.inlineIds.indexOf(a.address.inlineId) - source.inlineIds.indexOf(b.address.inlineId) || (a.affinity === b.affinity ? 0 : a.affinity === "downstream" ? -1 : 1))
  return data
}
