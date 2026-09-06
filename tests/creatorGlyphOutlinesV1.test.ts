import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import * as core from "../src/index.js"

const create = (core as any).createVNextCreatorGlyphOutlineProviderV1
const bytes = (path: string) => Uint8Array.from(readFileSync(path)).buffer
const assetPath = "packages/text-engine-rust-wasm/assets/creator-sarabun-outlines.v1.json"
const input = () => ({ fontBytes: bytes("assets/fonts/Sarabun/Sarabun-Regular.ttf"), outlineBytes: bytes(assetPath) })
describe("verified creator glyph outline provider", () => {
  it("exports product outline admission", () => expect(create).toBeTypeOf("function"))
  it("admits the complete pinned corpus including legitimate empty glyphs", async () => {
    const provider = await create(input())
    const asset = JSON.parse(readFileSync(assetPath, "utf8"))
    expect(provider.identity.fontSha256).toBe(core.VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1)
    expect(provider.unitsPerEm).toBe(1000)
    expect(provider.glyphCount).toBe(asset.glyphs.length)
    for (let id = 0; id < provider.glyphCount; id++) expect(provider.getGlyph(id)).toEqual(asset.glyphs[id])
    expect(asset.glyphs.some((g: unknown[]) => g.length === 0)).toBe(true)
  })
  it.each([-1, 0.5, NaN, Infinity, 65535, "1", null])("fails closed for invalid glyph %j", async id => {
    const provider = await create(input())
    expect(() => provider.getGlyph(id)).toThrow(/glyph/i)
  })
  it("rejects wrong fonts and changed, truncated, malformed, or forged-identity assets", async () => {
    const source = input()
    const tampered = source.outlineBytes.slice(0); new Uint8Array(tampered)[100] ^= 1
    await expect(create({ ...source, outlineBytes: tampered })).rejects.toThrow(/digest/i)
    const asset = JSON.parse(new TextDecoder().decode(source.outlineBytes))
    const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).buffer
    for (const outlineBytes of [source.outlineBytes.slice(0, -1), encode({ ...asset, fontSha256: "0".repeat(64) }), encode({ ...asset, unitsPerEm: 0 }), encode({ ...asset, glyphs: [[['X', 1, 2]]] }), encode({ ...asset, glyphs: [] }), encode({ ...asset, glyphs: [[['M', null, 0]]] }), new TextEncoder().encode("{").buffer]) {
      await expect(create({ ...source, outlineBytes })).rejects.toThrow(/outline/i)
    }
    const fontBytes = source.fontBytes.slice(0); new Uint8Array(fontBytes)[0] ^= 1
    await expect(create({ ...source, fontBytes })).rejects.toThrow(/font/i)
  })
  it("ships both verified assets through adapter package exports", async () => {
    const pkg = JSON.parse(readFileSync("packages/text-engine-rust-wasm/package.json", "utf8"))
    const manifest = JSON.parse(readFileSync("packages/text-engine-rust-wasm/" + pkg.exports["./creator-glyph-outlines-manifest"], "utf8"))
    expect(readFileSync("packages/text-engine-rust-wasm/" + pkg.exports["./creator-glyph-outlines"]).byteLength).toBe(manifest.byteLength)
    expect(manifest.outlineSha256).toBe((core as any).VNEXT_CREATOR_GLYPH_OUTLINE_SHA256_V1)
    expect(manifest.fontSha256).toBe(core.VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1)
  })
  it("owns input before await and deeply freezes all returned commands", async () => {
    const source = input(), pending = create(source)
    new Uint8Array(source.fontBytes).fill(0); new Uint8Array(source.outlineBytes).fill(0)
    const provider = await pending
    const id = JSON.parse(readFileSync(assetPath, "utf8")).glyphs.findIndex((g: unknown[]) => g.length > 0)
    const glyph = provider.getGlyph(id), original = JSON.stringify(glyph)
    expect(() => { glyph[0][1] = 999 }).toThrow()
    expect(() => glyph.push(["Z"])).toThrow()
    expect(() => { provider.unitsPerEm = 1 }).toThrow()
    expect(JSON.stringify(provider.getGlyph(id))).toBe(original)
  })
})
