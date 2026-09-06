import { fingerprintVNextCreatorPreviewV1 } from "./contentV1.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { freezeCreatorEditV1, requireCreatorEditLayoutV1 } from "./textEditAdmissionV1.js"
import { buildCreatorEditFactsV1 } from "./textEditFactsV1.js"
import type { VNextCreatorTextEditBindingV1, VNextCreatorTextEditGeometryV1, VNextCreatorTextPositionV1, VNextCreatorTextCaretV1, VNextCreatorTextHitPointV1, VNextCreatorTextHitResultV1, VNextCreatorTextSelectionInputV1, VNextCreatorTextSelectionV1, CreatorTextSelectionDataV1 } from "./textEditGeometryContractV1.js"
export type { VNextCreatorTextEditBindingV1, VNextCreatorTextEditGeometryV1, VNextCreatorTextPositionV1, VNextCreatorTextAddressV1, VNextCreatorTextCaretV1, VNextCreatorTextHitPointV1, VNextCreatorTextHitResultV1, VNextCreatorTextSelectionInputV1, VNextCreatorTextSelectionV1 } from "./textEditGeometryContractV1.js"

const admitted = new WeakSet<object>()
function requireBinding(actual: unknown, expected: unknown) {
  let matches = false
  try { matches = fingerprintVNextCreatorPreviewV1(actual) === fingerprintVNextCreatorPreviewV1(expected) } catch { /* fail closed */ }
  if (!matches) throw new Error("Creator geometry binding mismatch")
}
function requireGeometry(geometry: VNextCreatorTextEditGeometryV1, expected: VNextCreatorTextEditBindingV1) {
  if (!geometry || !admitted.has(geometry)) throw new Error("Creator geometry is not admitted in this runtime")
  requireBinding(geometry.binding, expected)
}
/** Experimental shaping-cluster edges, NOT complete Thai/user-grapheme stops.
 * Only authentic same-runtime Creator ready results are admitted; copied/wire
 * results must be recreated by Core. No shaping or mutation occurs in queries.
 * Authored prefix/suffix facts do not map a Build field label or grant edit rights.
 */
export function createVNextCreatorTextEditGeometryV1(result: unknown, expectedBinding: VNextCreatorTextEditBindingV1): VNextCreatorTextEditGeometryV1 {
  const record = requireCreatorEditLayoutV1(result)
  const { sourceIdentity, requestIdentity, engineIdentity, layoutFingerprint } = record.result
  const binding = { sourceIdentity, requestIdentity, engineIdentity, layoutFingerprint }
  requireBinding(binding, expectedBinding)
  const geometry = freezeCreatorEditV1(buildCreatorEditFactsV1(record, binding))
  admitted.add(geometry)
  return geometry
}
/** An interior-cluster offset is unsupported: never snapped or interpolated. */
export function getVNextCreatorTextCaretV1(geometry: VNextCreatorTextEditGeometryV1, expectedBinding: VNextCreatorTextEditBindingV1, position: VNextCreatorTextPositionV1): VNextCreatorTextCaretV1 {
  requireGeometry(geometry, expectedBinding)
  if (!position || Object.keys(position).sort().join() !== "address,affinity,offsetUtf16" || !Number.isSafeInteger(position.offsetUtf16)
    || (position.affinity !== "upstream" && position.affinity !== "downstream")) throw new Error("Unsupported Creator caret position")
  let address: string
  try { address = stringifyVNextCanonicalJson(position.address) } catch { throw new Error("Unsupported Creator caret address") }
  const caret = geometry.stops.find(stop => stop.offsetUtf16 === position.offsetUtf16 && stop.affinity === position.affinity && stringifyVNextCanonicalJson(stop.address) === address)
  if (!caret) throw new Error("Unsupported Creator source offset or address")
  return caret
}
/** Existing page + any finite point: clamp to nearest content line then stop.
 * Invalid page/nonfinite point rejects. Distances tie within 1e-9pt; all tied
 * sources/affinities remain candidates in declared stable order, first is primary.
 */
export function hitTestVNextCreatorTextV1(geometry: VNextCreatorTextEditGeometryV1, expectedBinding: VNextCreatorTextEditBindingV1, point: VNextCreatorTextHitPointV1): VNextCreatorTextHitResultV1 {
  requireGeometry(geometry, expectedBinding)
  if (!point || Object.keys(point).sort().join() !== "pageIndex,xPt,yPt" || !Number.isInteger(point.pageIndex) || !Number.isFinite(point.xPt) || !Number.isFinite(point.yPt)) throw new Error("Invalid Creator hit point")
  const page = geometry.pages.find(page => page.pageIndex === point.pageIndex)
  if (!page) throw new Error("Invalid Creator hit page")
  // Clamp outside-page values before distance arithmetic so extreme finite
  // coordinates do not erase meaningful point differences through cancellation.
  const x = Math.min(page.widthPt, Math.max(0, point.xPt)), y = Math.min(page.heightPt, Math.max(0, point.yPt))
  const stops = geometry.stops.filter(stop => stop.pageIndex === point.pageIndex)
  const vertical = (stop: VNextCreatorTextCaretV1) => Math.max(stop.yPt - y, y - stop.yPt - stop.heightPt, 0)
  const nearestY = Math.min(...stops.map(vertical)), lines = stops.filter(stop => Math.abs(vertical(stop) - nearestY) <= 1e-9)
  const nearestX = Math.min(...lines.map(stop => Math.abs(stop.xPt - x)))
  const candidates = lines.filter(stop => Math.abs(Math.abs(stop.xPt - x) - nearestX) <= 1e-9)
  const lineIds = new Set(stops.map(stop => stop.lineIndex))
  const inside = [...lineIds].some(lineIndex => {
    const line = stops.filter(stop => stop.lineIndex === lineIndex)
    return vertical(line[0]) === 0 && point.xPt >= Math.min(...line.map(stop => stop.xPt)) && point.xPt <= Math.max(...line.map(stop => stop.xPt))
  })
  return freezeCreatorEditV1({ primary: candidates[0], candidates, ambiguous: candidates.length > 1,
    outsidePage: point.xPt < 0 || point.yPt < 0 || point.xPt > page.widthPt || point.yPt > page.heightPt, outsideContent: !inside })
}
/** Logical advances of entire selected clusters, including zero-advance spans;
 * rectangles are not glyph ink bounds. Coincident/empty logical ranges have no
 * selection fill; their distinct anchor/focus source addresses remain returned.
 */
export function selectVNextCreatorTextV1(geometry: VNextCreatorTextEditGeometryV1, expectedBinding: VNextCreatorTextEditBindingV1, selection: VNextCreatorTextSelectionInputV1): VNextCreatorTextSelectionV1 {
  requireGeometry(geometry, expectedBinding)
  if (!selection || Object.keys(selection).sort().join() !== "anchor,focus") throw new Error("Invalid Creator selection")
  const anchor = getVNextCreatorTextCaretV1(geometry, expectedBinding, selection.anchor), focus = getVNextCreatorTextCaretV1(geometry, expectedBinding, selection.focus)
  const low = Math.min(anchor.paragraphOffsetUtf16, focus.paragraphOffsetUtf16), high = Math.max(anchor.paragraphOffsetUtf16, focus.paragraphOffsetUtf16)
  const rectangles: CreatorTextSelectionDataV1["rectangles"] = []
  for (const span of geometry.spans) if (span.paragraphStartUtf16 >= low && span.paragraphEndUtf16 <= high && low < high) {
    let rectangle = rectangles.at(-1)
    if (!rectangle || rectangle.lineIndex !== span.lineIndex) {
      rectangle = { pageIndex: span.pageIndex, lineIndex: span.lineIndex, rectPt: { ...span.rectPt }, sourceRanges: [] }; rectangles.push(rectangle)
    } else rectangle.rectPt.width = span.rectPt.x + span.rectPt.width - rectangle.rectPt.x
    rectangle.sourceRanges.push({ address: structuredClone(span.address), startUtf16: span.startUtf16, endUtf16: span.endUtf16 })
  }
  return freezeCreatorEditV1({ anchor, focus, direction: anchor.paragraphOffsetUtf16 < focus.paragraphOffsetUtf16 ? "forward" : anchor.paragraphOffsetUtf16 > focus.paragraphOffsetUtf16 ? "backward" : "none", rectangles })
}
