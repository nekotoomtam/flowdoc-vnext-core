import { beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import * as core from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { createFlowDocCreatorTextPreviewRuntimeV1 } from "../packages/text-engine-rust-wasm/src/creatorTextPreviewRuntimeV1.js"
const api = core as any
const bytes = (path: string) => Uint8Array.from(readFileSync(path)).buffer
let engine: any
function fixture(value = "กิ้ Aé", prefix = "Dear ", suffix = ", welcome.") {
  const draft = JSON.parse(readFileSync("tests/fixtures/creator-preview/draft.json", "utf8"))
  const inlines = draft.content.patterns[0].blocks[0].inlines
  inlines[0].text = prefix; inlines[2].text = suffix
  const simulation = { source: "flowdoc-creator-preview-values", contractVersion: 1, sessionId: "s", simulationRevision: 1, entries: [{ slotId: "slot:customer", entryId: "e", values: [{ fieldId: "field:customer-name", value }] }] }
  const input = { draft, simulation, sourceIdentity: { definitionId: draft.definition.id, draftId: draft.draft.id, backendRevision: 1, sourceFingerprint: core.createVNextCompactFingerprint(stringifyVNextCanonicalJson(draft)) }, requestIdentity: { sessionId: "s", sourceGeneration: 1, simulationRevision: 1, requestId: "r" }, engineIdentity: engine.identity }
  const layout = core.createVNextCreatorTextPreviewLayoutV1(input, engine) as any
  const binding = { sourceIdentity: layout.sourceIdentity, requestIdentity: layout.requestIdentity, engineIdentity: layout.engineIdentity, layoutFingerprint: layout.layoutFingerprint }
  return { input, layout, binding }
}
const create = (f: ReturnType<typeof fixture>) => api.createVNextCreatorTextEditGeometryV1(f.layout, f.binding)
const position = (stop: any) => ({ address: stop.address, offsetUtf16: stop.offsetUtf16, affinity: stop.affinity })
describe("Creator shaping-cluster-boundary text edit experiment", () => {
  beforeAll(async () => { engine = await createFlowDocCreatorTextPreviewRuntimeV1({ measurementProfileId: "creator", fontBytes: bytes("assets/fonts/Sarabun/Sarabun-Regular.ttf"), wasmBytes: bytes("packages/text-engine-rust-wasm/pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm") }) })
  it("exports the additive geometry and query contracts", () => {
    for (const name of ["createVNextCreatorTextEditGeometryV1", "getVNextCreatorTextCaretV1", "hitTestVNextCreatorTextV1", "selectVNextCreatorTextV1"]) expect(api[name]).toBeTypeOf("function")
  })
  it("uses real Thai shaping-cluster edges, not scalar or line-break interpolation", () => {
    const f = fixture("กิ้A", "", ""), g = create(f)
    expect(g.boundaryPolicy).toBe("shaping-cluster-edges/1")
    const field = g.stops.filter((s: any) => s.address.kind === "field-value")
    expect([...new Set(field.map((s: any) => s.offsetUtf16))]).toEqual([0, 3, 4])
    for (const offsetUtf16 of [1, 2]) expect(() => api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(field[0]), offsetUtf16 })).toThrow(/unsupported/i)
    const paint = f.layout.pages[0].paintCommands[0]
    const advance = paint.glyphs.filter((x: any) => x.clusterUtf16 === 0).reduce((n: number, x: any) => n + x.advancePt, 0)
    expect(field.find((s: any) => s.offsetUtf16 === 3).xPt).toBeCloseTo(paint.xPt + advance, 9)
  })
  it("adds truthful explicit-break geometry at the exact LF source range", () => {
    const f = fixture("A\nB", "", ""), g = create(f)
    expect(f.layout.status).toBe("ready")
    expect(g.boundaryPolicy).toBe("shaping-cluster-and-explicit-break-edges/1")
    const field = g.stops.filter((stop: any) => stop.address.kind === "field-value")
    expect([...new Set(field.map((stop: any) => stop.offsetUtf16))]).toEqual([0, 1, 2, 3])
    const before = field.find((stop: any) => stop.offsetUtf16 === 1 && stop.affinity === "downstream")
    const after = field.find((stop: any) => stop.offsetUtf16 === 2 && stop.affinity === "downstream")
    expect(before).toMatchObject({ pageIndex: 0, lineIndex: 0 })
    expect(after).toMatchObject({ pageIndex: 0, lineIndex: 1, xPt: 36 })
    const breakSpan = g.spans.find((span: any) => span.startUtf16 === 1 && span.endUtf16 === 2)
    expect(breakSpan).toMatchObject({ paragraphStartUtf16: 1, paragraphEndUtf16: 2, lineIndex: 0, rectPt: { width: 0, height: 18 } })
    const selection = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(before), focus: position(after) })
    expect(selection.rectangles).toEqual([expect.objectContaining({ lineIndex: 0, rectPt: expect.objectContaining({ width: 0 }), sourceRanges: [expect.objectContaining({ startUtf16: 1, endUtf16: 2 })] })])
    const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: 36, yPt: after.yPt + 9 })
    expect(hit.candidates.some((stop: any) => stop.offsetUtf16 === 2)).toBe(true)
    const legalOffsets = [...new Set(field.map((stop: any) => stop.offsetUtf16))].sort((a: any, b: any) => a - b)
    expect([legalOffsets[legalOffsets.indexOf(2) - 1], 2]).toEqual([1, 2])
    expect([1, legalOffsets[legalOffsets.indexOf(1) + 1]]).toEqual([1, 2])
    expect(f.input.simulation.entries[0].values[0].value.slice(1, 2)).toBe("\n")
  })
  it.each([
    ["\nA", 0, 1],
    ["A\n", 0, 1],
    ["A\n\nB", 0, 2],
  ])("keeps complete geometry and empty authored edges for %j", (value, prefixLine, suffixLine) => {
    const f = fixture(value, "", ""), g = create(f)
    const field = g.stops.filter((stop: any) => stop.address.kind === "field-value")
    const legalOffsets = [...new Set(field.map((stop: any) => stop.offsetUtf16))].sort((a: any, b: any) => a - b)
    for (let offset = 0, line = 0; offset < value.length; offset++) if (value[offset] === "\n") {
      for (const [edge, expectedLine] of [[offset, line], [offset + 1, line + 1]] as const) {
        const stops = field.filter((stop: any) => stop.offsetUtf16 === edge)
        expect(new Set(stops.map((stop: any) => stop.affinity))).toEqual(new Set(["upstream", "downstream"]))
        expect(stops.every((stop: any) => stop.lineIndex === expectedLine && stop.pageIndex === 0)).toBe(true)
        const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: stops[0].xPt, yPt: stops[0].yPt + 9 })
        expect(hit.candidates.some((stop: any) => stop.address.kind === "field-value" && stop.offsetUtf16 === edge)).toBe(true)
      }
      const before = field.find((stop: any) => stop.offsetUtf16 === offset && stop.affinity === "downstream")
      const after = field.find((stop: any) => stop.offsetUtf16 === offset + 1 && stop.affinity === "downstream")
      const selection = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(before), focus: position(after) })
      expect(selection.rectangles.flatMap((rectangle: any) => rectangle.sourceRanges)).toContainEqual(expect.objectContaining({ startUtf16: offset, endUtf16: offset + 1 }))
      expect([legalOffsets[legalOffsets.indexOf(offset + 1) - 1], offset + 1]).toEqual([offset, offset + 1])
      expect([offset, legalOffsets[legalOffsets.indexOf(offset) + 1]]).toEqual([offset, offset + 1])
      line++
    }
    const prefix = g.stops.filter((stop: any) => stop.address.kind === "authored-inline" && stop.address.inlineId === "inline:prefix")
    const suffix = g.stops.filter((stop: any) => stop.address.kind === "authored-inline" && stop.address.inlineId === "inline:suffix")
    expect(prefix.every((stop: any) => stop.lineIndex === prefixLine && stop.pageIndex === 0 && stop.offsetUtf16 === 0)).toBe(true)
    expect(suffix.every((stop: any) => stop.lineIndex === suffixLine && stop.pageIndex === 0 && stop.offsetUtf16 === 0)).toBe(true)
  })
  it("keeps both affinities, hit candidates and empty suffix geometry after a trailing LF crosses pages", () => {
    const value = "A\n".repeat(42), f = fixture(value, "", ""), g = create(f)
    const field = g.stops.filter((stop: any) => stop.address.kind === "field-value")
    const before = field.filter((stop: any) => stop.offsetUtf16 === value.length - 1)
    const after = field.filter((stop: any) => stop.offsetUtf16 === value.length)
    expect(new Set(before.map((stop: any) => stop.affinity))).toEqual(new Set(["upstream", "downstream"]))
    expect(before.every((stop: any) => stop.pageIndex === 0 && stop.lineIndex === 41)).toBe(true)
    expect(new Set(after.map((stop: any) => stop.affinity))).toEqual(new Set(["upstream", "downstream"]))
    expect(after.every((stop: any) => stop.pageIndex === 1 && stop.lineIndex === 42 && stop.xPt === 36 && stop.yPt === 36)).toBe(true)
    const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 1, xPt: 36, yPt: 45 })
    expect(hit.candidates.some((stop: any) => stop.address.kind === "field-value" && stop.offsetUtf16 === value.length)).toBe(true)
    const suffix = g.stops.filter((stop: any) => stop.address.kind === "authored-inline" && stop.address.inlineId === "inline:suffix")
    expect(suffix.every((stop: any) => stop.pageIndex === 1 && stop.lineIndex === 42 && stop.xPt === 36 && stop.yPt === 36)).toBe(true)
    const selection = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(before.find((stop: any) => stop.affinity === "downstream")), focus: position(after.find((stop: any) => stop.affinity === "downstream")) })
    expect(selection.rectangles.flatMap((rectangle: any) => rectangle.sourceRanges)).toContainEqual(expect.objectContaining({ startUtf16: value.length - 1, endUtf16: value.length }))
  })
  it("retains authored and value addresses and discloses coincident candidates", () => {
    const f = fixture("", "A", "B"), g = create(f)
    const empty = g.stops.find((s: any) => s.address.kind === "field-value")
    expect(empty.offsetUtf16).toBe(0)
    expect(empty.xPt).toBe(f.layout.occurrences[0].regions[0].anchorPt.x)
    const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: empty.xPt, yPt: empty.yPt + 9 })
    expect(hit.ambiguous).toBe(true)
    expect(new Set(hit.candidates.map((s: any) => s.address.kind)).size).toBe(2)
    expect(hit.candidates.some((s: any) => s.address.inlineId === "inline:prefix" && s.offsetUtf16 === 1)).toBe(true)
    expect(hit.candidates.some((s: any) => s.address.inlineId === "inline:suffix" && s.offsetUtf16 === 0)).toBe(true)
    expect(hit).toEqual(api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: empty.xPt, yPt: empty.yPt + 9 }))
  })
  it("round trips unique positions and preserves all ties", () => {
    const f = fixture("ABCDE", "", ""), g = create(f)
    for (const stop of g.stops) {
      expect(api.getVNextCreatorTextCaretV1(g, f.binding, position(stop))).toEqual(stop)
      const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: stop.pageIndex, xPt: stop.xPt, yPt: stop.yPt + 9 })
      expect(hit.candidates).toContainEqual(stop)
    }
    const suffix = g.stops.find((s: any) => s.address.inlineId === "inline:suffix")
    const paint = f.layout.pages[0].paintCommands[0]
    expect(suffix.xPt).toBeCloseTo(paint.xPt + paint.advancePt, 9)
  })
  it("keeps zero-advance clusters and fully empty source addresses distinct", () => {
    const f = fixture("\u200b", "", ""), g = create(f)
    const span = g.spans.find((s: any) => s.address.kind === "field-value")
    expect(span.rectPt.width).toBe(0)
    const endpoints = g.stops.filter((s: any) => s.address.kind === "field-value" && s.affinity === "downstream")
    const selection = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(endpoints[0]), focus: position(endpoints[1]) })
    expect(selection.rectangles).toHaveLength(1); expect(selection.rectangles[0].rectPt.width).toBe(0)
    const empty = fixture("", "", ""), emptyGeometry = create(empty)
    expect(new Set(emptyGeometry.stops.map((s: any) => s.address.inlineId)).size).toBe(3)
    expect(emptyGeometry.stops.every((s: any) => s.xPt === 36 && s.yPt === 36)).toBe(true)
  })
  it("selects exact partial logical advances and reports midpoint ties in stable order", () => {
    const f = fixture("ABC", "", ""), g = create(f)
    const field = g.stops.filter((s: any) => s.address.kind === "field-value" && s.affinity === "downstream")
    const selected = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(field[1]), focus: position(field[2]) })
    expect(selected.rectangles).toHaveLength(1)
    expect(selected.rectangles[0].rectPt.x).toBe(field[1].xPt)
    expect(selected.rectangles[0].rectPt.width).toBeCloseTo(field[2].xPt - field[1].xPt, 9)
    const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: (field[1].xPt + field[2].xPt) / 2, yPt: field[1].yPt + 9 })
    expect([...new Set(hit.candidates.map((s: any) => s.offsetUtf16))]).toEqual([1, 2])
    expect(hit.primary.offsetUtf16).toBe(1); expect(hit.primary.affinity).toBe("downstream")
    const margin = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: 1, yPt: 1 })
    expect(margin.outsidePage).toBe(false); expect(margin.outsideContent).toBe(true)
  })
  it.each(["ภาษาไทย Alice ".repeat(550), "AV".repeat(3500)])("keeps upstream/downstream affinity at wraps and page crossings %#", (value) => {
    const f = fixture(value, "", ""), g = create(f)
    expect(f.layout.pages.length).toBeGreaterThan(1)
    const crossing = g.stops.find((s: any) => s.affinity === "downstream" && s.pageIndex === 1)
    const up = api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(crossing), affinity: "upstream" })
    expect(up.pageIndex).toBe(0); expect(up.paragraphOffsetUtf16).toBe(crossing.paragraphOffsetUtf16)
    const wrapped = g.stops.find((s: any) => s.affinity === "downstream" && s.lineIndex === 1)
    expect(api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(wrapped), affinity: "upstream" }).lineIndex).toBe(0)
    const first = g.stops.find((s: any) => s.address.kind === "field-value" && s.offsetUtf16 === 0)
    const last = g.stops.filter((s: any) => s.address.kind === "field-value").at(-1)
    const selected = api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(first), focus: position(last) })
    for (const rectangle of selected.rectangles) {
      const paint = f.layout.pages[rectangle.pageIndex].paintCommands.filter((c: any) => c.lineIndex === rectangle.lineIndex)
      expect(rectangle.rectPt.x).toBeCloseTo(paint[0].xPt, 8)
      expect(rectangle.rectPt.width).toBeCloseTo(paint.reduce((n: number, c: any) => n + c.advancePt, 0), 8)
      expect(rectangle.rectPt.height).toBe(18)
    }
    expect(api.selectVNextCreatorTextV1(g, f.binding, { anchor: position(last), focus: position(first) }).rectangles).toEqual(selected.rectangles)
  })
  it("keeps an empty field on the filled neighboring-text line", () => {
    const f = fixture("", "A ".repeat(50), "WWWWWWWWWWWWWWWW"), g = create(f)
    const prefix = f.layout.pages[0].paintCommands.filter((c: any) => c.inlineId === "inline:prefix").at(-1)
    const suffix = f.layout.pages[0].paintCommands.find((c: any) => c.inlineId === "inline:suffix")
    expect(suffix.lineIndex).toBe(prefix.lineIndex)
    const field = g.stops.find((s: any) => s.address.kind === "field-value")
    expect(api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(field), affinity: "upstream" }).lineIndex).toBe(prefix.lineIndex)
    const downstream = api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(field), affinity: "downstream" })
    expect(downstream.lineIndex).toBe(prefix.lineIndex)
    expect(downstream.xPt).toBe(f.layout.occurrences[0].regions[0].anchorPt.x)
  })
  it("keeps empty-field affinities distinct when the following cluster cannot fit", () => {
    const f = fixture("", "W".repeat(52), "W"), g = create(f)
    const prefix = f.layout.pages[0].paintCommands.find((c: any) => c.inlineId === "inline:prefix")
    const suffix = f.layout.pages[0].paintCommands.find((c: any) => c.inlineId === "inline:suffix")
    expect(suffix.lineIndex).toBeGreaterThan(prefix.lineIndex)
    const field = g.stops.find((s: any) => s.address.kind === "field-value")
    const upstream = api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(field), affinity: "upstream" })
    const downstream = api.getVNextCreatorTextCaretV1(g, f.binding, { ...position(field), affinity: "downstream" })
    expect(upstream.lineIndex).toBe(prefix.lineIndex)
    expect(downstream.lineIndex).toBe(suffix.lineIndex)
    expect(downstream.xPt).toBe(f.layout.occurrences[0].regions[0].anchorPt.x)
  })
  it("clamps finite outside points on an existing page and rejects invalid queries", () => {
    const f = fixture(), g = create(f)
    const hit = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: -100, yPt: -100 })
    expect(hit.outsidePage).toBe(true); expect(hit.outsideContent).toBe(true)
    expect(hit.primary.paragraphOffsetUtf16).toBe(0)
    const farRight = api.hitTestVNextCreatorTextV1(g, f.binding, { pageIndex: 0, xPt: Number.MAX_VALUE, yPt: 36 })
    expect(farRight.primary.paragraphOffsetUtf16).toBe(f.input.draft.content.patterns[0].blocks[0].inlines[0].text.length + "กิ้ Aé".length + ", welcome.".length)
    for (const query of [{ pageIndex: -1, xPt: 0, yPt: 0 }, { pageIndex: 99, xPt: 0, yPt: 0 }, { pageIndex: 0, xPt: NaN, yPt: 0 }]) expect(() => api.hitTestVNextCreatorTextV1(g, f.binding, query)).toThrow()
  })
  it("rejects forged/copied/blocked/mutated layouts and stale bindings on every query", () => {
    const f = fixture(), g = create(f), stop = g.stops[0]
    for (const result of [{ ...f.layout }, structuredClone(f.layout), { status: "blocked" }]) expect(() => api.createVNextCreatorTextEditGeometryV1(result, f.binding)).toThrow(/admitted/i)
    for (const key of ["sourceIdentity", "requestIdentity", "engineIdentity", "layoutFingerprint"]) {
      const wrong = { ...f.binding, [key]: "stale" }
      expect(() => api.createVNextCreatorTextEditGeometryV1(f.layout, wrong)).toThrow(/binding/i)
      expect(() => api.getVNextCreatorTextCaretV1(g, wrong, position(stop))).toThrow(/binding/i)
      expect(() => api.hitTestVNextCreatorTextV1(g, wrong, { pageIndex: 0, xPt: 0, yPt: 0 })).toThrow(/binding/i)
      expect(() => api.selectVNextCreatorTextV1(g, wrong, { anchor: position(stop), focus: position(stop) })).toThrow(/binding/i)
    }
    expect(() => api.getVNextCreatorTextCaretV1({ ...g }, f.binding, position(stop))).toThrow(/admitted/i)
    const newer = fixture("changed")
    expect(() => api.getVNextCreatorTextCaretV1(g, newer.binding, position(stop))).toThrow(/binding/i)
    const blocked = fixture("ا")
    expect(blocked.layout.status).toBe("blocked")
    expect(() => create(blocked)).toThrow(/admitted/i)
    f.layout.pages[0].paintCommands[0].glyphs[0].advancePt++
    expect(() => create(f)).toThrow(/mutated/i)
    expect(api.getVNextCreatorTextCaretV1(g, f.binding, position(stop))).toEqual(stop)
  })
  it("owns immutable geometry and never changes input text or layout", () => {
    const f = fixture(), before = JSON.stringify(f), g = create(f)
    expect(Object.isFrozen(g)).toBe(true); expect(Object.isFrozen(g.stops[0].address)).toBe(true)
    expect(() => { g.stops[0].xPt = 0 }).toThrow()
    const p = position(g.stops[0]); api.selectVNextCreatorTextV1(g, f.binding, { anchor: p, focus: p })
    expect(JSON.stringify(f)).toBe(before)
  })
})
