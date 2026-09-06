import { beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import * as core from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"

const draft = () => JSON.parse(readFileSync(new URL("./fixtures/creator-preview/draft.json", import.meta.url), "utf8"))
const bytes = (path: string) => Uint8Array.from(readFileSync(path)).buffer
const assets = () => ({ measurementProfileId: "creator-sarabun-v1", wasmBytes: bytes("packages/text-engine-rust-wasm/pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm"), fontBytes: bytes("assets/fonts/Sarabun/Sarabun-Regular.ttf") })
let engine: any
async function initialize(input = assets()) {
  const module = await import("../packages/text-engine-rust-wasm/src/creatorTextPreviewRuntimeV1.js")
  return module.createFlowDocCreatorTextPreviewRuntimeV1(input)
}
function request(value = "คุณตูม", source = draft()): any {
  const simulation = { source: "flowdoc-creator-preview-values", contractVersion: 1, sessionId: "session:1", simulationRevision: 1, entries: [{ slotId: "slot:customer", entryId: "entry:1", values: [{ fieldId: "field:customer-name", value }] }] }
  return { draft: source, simulation,
    sourceIdentity: { definitionId: source.definition.id, draftId: source.draft.id, backendRevision: 4, sourceFingerprint: core.createVNextCompactFingerprint(stringifyVNextCanonicalJson(source)) },
    requestIdentity: { sessionId: "session:1", sourceGeneration: 1, simulationRevision: 1, requestId: "request:1" }, engineIdentity: engine.identity }
}
const layout = (input: unknown, adapter = engine): any => (core as any).createVNextCreatorTextPreviewLayoutV1(input, adapter)
describe("creator product text layout with pinned real WASM", () => {
  beforeAll(async () => { if (typeof (core as any).createVNextCreatorTextPreviewLayoutV1 === "function") engine = await initialize() })
  it("exports the affirmative product consumer", () => expect((core as any).createVNextCreatorTextPreviewLayoutV1).toBeTypeOf("function"))
  it.each(["คุณตูม", "Alice", "ภาษาไทย Latin กิ้", "", "   "])("paints real text and isolates the complete editable value %j", (value) => {
    const input = request(value), before = JSON.stringify(input), result = layout(input)
    expect(result.status).toBe("ready")
    expect(result.productionBinding).toBe(true)
    expect(result.occurrences).toHaveLength(1)
    const regions = result.occurrences[0].regions
    expect(regions[0].valueRange.startUtf16).toBe(0)
    expect(regions.at(-1).valueRange.endUtf16).toBe(value.length)
    expect(result.pages[0].paintCommands.filter((c: any) => c.inlineId === "inline:customer-name").length).toBe(value.length ? 1 : 0)
    if (!value) expect(regions).toMatchObject([{ kind: "empty", rectPt: { width: 0, height: 18 }, anchorPt: { height: 18 } }])
    else expect(regions[0].rectPt.width).toBeGreaterThan(0)
    expect(JSON.stringify(input)).toBe(before)
    expect(layout(input)).toEqual(result)
  })
  it("uses SHA-256 canonical source identity, shapes glyphs and puts the field after measured prefix advance", () => {
    const input = request("Alice"), result = layout(input)
    expect(input.sourceIdentity.sourceFingerprint).toBe("sha256:" + createHash("sha256").update(stringifyVNextCanonicalJson(input.draft)).digest("hex"))
    const prefix = result.pages[0].paintCommands[0], field = result.pages[0].paintCommands[1]
    expect(prefix.glyphs.every((g: any) => g.glyphId > 0)).toBe(true)
    expect(field.xPt).toBeCloseTo(36 + prefix.advancePt, 8)
    expect(result.occurrences[0].regions[0].rectPt.x).toBe(field.xPt)
    expect(result.occurrences[0].regions[0].rectPt.width).toBe(field.advancePt)
  })
  it("looks up real mixed/compound/Thai glyph IDs and paints at Core positions without reshaping", async () => {
    const outlines = await core.createVNextCreatorGlyphOutlineProviderV1({ fontBytes: assets().fontBytes,
      outlineBytes: bytes("packages/text-engine-rust-wasm/assets/creator-sarabun-outlines.v1.json") })
    const result = layout(request("AéÅ กิ้น้ำ "))
    expect(result.status).toBe("ready")
    const before = JSON.stringify(result)
    let visible = 0, empty = 0
    for (const command of result.pages[0].paintCommands) for (const glyph of command.glyphs) {
      const path = outlines.getGlyph(glyph.glyphId)
      const scale = command.fontSizePt / outlines.unitsPerEm
      expect(scale).toBe(0.012)
      if (!path.length) { empty++; continue }
      visible++
      const first = path[0]
      expect(first[0]).toBe("M")
      if (first[0] !== "M") throw Error("Expected move")
      const point = { x: glyph.xPt + first[1] * scale, y: glyph.yPt - first[2] * scale }
      expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true)
      expect((point.x - glyph.xPt) / scale).toBeCloseTo(first[1], 8)
      expect((glyph.yPt - point.y) / scale).toBeCloseTo(first[2], 8)
    }
    expect(visible).toBeGreaterThan(10); expect(empty).toBeGreaterThan(0)
    expect(JSON.stringify(result)).toBe(before)
  })
  it("wraps a long field over lines and pages, preserves all ranges and reflows the suffix", () => {
    const value = "ภาษาไทย Alice ".repeat(400)
    const result = layout(request(value)), short = layout(request("x"))
    expect(result.status).toBe("ready")
    expect(result.pages.length).toBeGreaterThan(1)
    const regions = result.occurrences[0].regions
    expect(regions[0].valueRange.startUtf16).toBe(0)
    expect(regions.at(-1).valueRange.endUtf16).toBe(value.length)
    for (let i = 1; i < regions.length; i++) expect(regions[i].valueRange.startUtf16).toBe(regions[i - 1].valueRange.endUtf16)
    const suffix = result.pages.flatMap((p: any) => p.paintCommands).find((c: any) => c.inlineId === "inline:suffix")
    expect(suffix.pageIndex).toBeGreaterThan(0)
    expect(short.pages[0].paintCommands.at(-1).pageIndex).toBe(0)
    for (const page of result.pages) for (const command of page.paintCommands) {
      expect(command.xPt + command.advancePt).toBeLessThanOrEqual(page.bodyPt.x + page.bodyPt.width + 1e-7)
    }
  })
  it("supports fully empty paragraph and rejects an inseparable combining boundary", () => {
    const source = draft(); source.content.patterns[0].blocks[0].inlines[0].text = ""; source.content.patterns[0].blocks[0].inlines[2].text = ""
    expect(layout(request("", source))).toMatchObject({ status: "ready", pages: [{ paintCommands: [] }], occurrences: [{ regions: [{ rectPt: { x: 36, y: 36, width: 0, height: 18 } }] }] })
    expect(layout(request("\u0301"))).toMatchObject({ status: "blocked", pages: null, occurrences: null })
  })
  it("shapes Thai marks identically when Latin text precedes them in the same field", () => {
    const thai = layout(request("น้ำกิ้")), mixed = layout(request("Aน้ำกิ้"))
    const glyphs = (result: any) => result.pages[0].paintCommands.find((c: any) => c.inlineId === "inline:customer-name").glyphs
    const thaiGlyphs = glyphs(thai), mixedGlyphs = glyphs(mixed).slice(1)
    expect(mixedGlyphs.map((g: any) => [g.glyphId, g.advancePt, g.yPt])).toEqual(thaiGlyphs.map((g: any) => [g.glyphId, g.advancePt, g.yPt]))
  })
  it("keeps empty anchors correct at a wrapped suffix and rejects non-LTR text", () => {
    const source = draft(); source.content.patterns[0].blocks[0].inlines[0].text = "A ".repeat(70)
    const result = layout(request("", source))
    expect(result.status).toBe("ready")
    const suffix = result.pages.flatMap((p: any) => p.paintCommands).find((c: any) => c.inlineId === "inline:suffix")
    const region = result.occurrences[0].regions[0]
    expect(region.rectPt.x).toBeCloseTo(suffix.xPt, 8)
    expect(region.lineIndex).toBe(suffix.lineIndex)
    expect(layout(request("ا")).status).toBe("blocked")
  })
  it("reshapes an emergency wrapped Latin word at its actual line ending", () => {
    const source = draft(); source.content.patterns[0].blocks[0].inlines[0].text = ""; source.content.patterns[0].blocks[0].inlines[2].text = ""
    const wrapped = layout(request("AV".repeat(100), source))
    expect(wrapped.status).toBe("ready")
    const first = wrapped.pages[0].paintCommands[0]
    const isolated = layout(request(first.text, source)).pages[0].paintCommands[0]
    expect(first.glyphs.map((g: any) => [g.glyphId, g.advancePt])).toEqual(isolated.glyphs.map((g: any) => [g.glyphId, g.advancePt]))
  })
  it.each(["source", "session", "simulation", "font", "wasm", "profile"])("rejects mismatched %s identity", (kind) => {
    const input = request()
    input.engineIdentity = { ...input.engineIdentity }
    if (kind === "source") input.sourceIdentity.sourceFingerprint = "sha256:" + "0".repeat(64)
    if (kind === "session") input.requestIdentity.sessionId = "wrong"
    if (kind === "simulation") input.requestIdentity.simulationRevision++
    if (kind === "font") input.engineIdentity.fontSha256 = "0".repeat(64)
    if (kind === "wasm") input.engineIdentity.wasmSha256 = "0".repeat(64)
    if (kind === "profile") input.engineIdentity.measurementProfileId = "wrong"
    expect(layout(input)).toMatchObject({ status: "blocked", pages: null, occurrences: null })
  })
  it("rejects a forged wire engine even with echoed valid identity", () => {
    expect(layout(request(), { ...engine })).toMatchObject({ status: "blocked", pages: null })
  })
  it("rejects tampered assets and owns copies before asynchronous initialization", async () => {
    for (const key of ["fontBytes", "wasmBytes"] as const) {
      const input = assets(); new Uint8Array(input[key])[0] ^= 1
      await expect(initialize(input)).rejects.toThrow(/digest/i)
    }
    const module = await import("../packages/text-engine-rust-wasm/src/creatorTextPreviewRuntimeV1.js")
    const input = assets(), pending = module.createFlowDocCreatorTextPreviewRuntimeV1(input)
    new Uint8Array(input.fontBytes).fill(0); new Uint8Array(input.wasmBytes).fill(0)
    const owned = await pending
    expect(layout(request(), owned).status).toBe("ready")
  })
})
