import { VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1 } from "./engineV1.js"

export const VNEXT_CREATOR_GLYPH_OUTLINE_SHA256_V1 = "8a5e7be2038f8fe54e5b1163425be14f05bb55c4b74aa88c8821c0914364b75d"
export type VNextCreatorGlyphOutlineCommandV1 =
  | readonly ["M" | "L", number, number]
  | readonly ["Q", number, number, number, number]
  | readonly ["C", number, number, number, number, number, number]
  | readonly ["Z"]
export interface VNextCreatorGlyphOutlineProviderV1 {
  readonly identity: Readonly<{ layoutProfile: "creator-text-preview/1"; fontSha256: string; outlineSha256: string }>
  readonly unitsPerEm: number
  readonly glyphCount: number
  /** Font units, y up. Empty array is legitimate no-ink; invalid IDs throw. */
  getGlyph(glyphId: number): readonly VNextCreatorGlyphOutlineCommandV1[]
}
async function digest(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), value => value.toString(16).padStart(2, "0")).join("")
}
function validateAsset(value: any): readonly (readonly VNextCreatorGlyphOutlineCommandV1[])[] {
  if (!value || Object.keys(value).sort().join() !== "contractVersion,fontSha256,glyphs,layoutProfile,source,unitsPerEm"
    || value.source !== "flowdoc-creator-glyph-outlines" || value.contractVersion !== 1
    || value.layoutProfile !== "creator-text-preview/1" || value.fontSha256 !== VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1
    || value.unitsPerEm !== 1000 || !Array.isArray(value.glyphs) || value.glyphs.length !== 777) throw new Error("Invalid creator outline schema")
  const arity: Record<string, number> = { M: 3, L: 3, Q: 5, C: 7, Z: 1 }
  for (const glyph of value.glyphs) {
    if (!Array.isArray(glyph)) throw new Error("Invalid creator outline glyph")
    let open = false
    for (const command of glyph) {
      if (!Array.isArray(command) || !Object.hasOwn(arity, command[0]) || command.length !== arity[command[0]]
        || !command.slice(1).every((n: unknown) => typeof n === "number" && Number.isFinite(n))) throw new Error("Invalid creator outline command")
      if (command[0] === "M") { if (open) throw new Error("Unclosed creator outline"); open = true }
      else { if (!open) throw new Error("Unopened creator outline"); if (command[0] === "Z") open = false }
      Object.freeze(command)
    }
    if (open) throw new Error("Truncated creator outline")
    Object.freeze(glyph)
  }
  return Object.freeze(value.glyphs)
}
/** Admission for the single pinned Sarabun corpus, not an arbitrary-font parser.
 * The trusted offline generator and independent reference checks bind these paths
 * to the verified font. A caller-supplied manifest or identity cannot override pins.
 * Paint at each Core glyph's (xPt,yPt) with scale(fontSizePt/unitsPerEm, -scale).
 * No shaping, layout, canvas, DOM, or persistence occurs here.
 */
export async function createVNextCreatorGlyphOutlineProviderV1(input: {
  fontBytes: ArrayBuffer; outlineBytes: ArrayBuffer
}): Promise<VNextCreatorGlyphOutlineProviderV1> {
  if (!(input?.fontBytes instanceof ArrayBuffer)) throw new Error("Invalid creator font bytes")
  if (!(input?.outlineBytes instanceof ArrayBuffer) || input.outlineBytes.byteLength !== 413287) throw new Error("Invalid creator outline bytes")
  const fontBytes = new Uint8Array(input.fontBytes.slice(0)), outlineBytes = new Uint8Array(input.outlineBytes.slice(0))
  if (await digest(fontBytes) !== VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1) throw new Error("Creator font digest mismatch")
  if (await digest(outlineBytes) !== VNEXT_CREATOR_GLYPH_OUTLINE_SHA256_V1) throw new Error("Creator outline digest mismatch")
  const glyphs = validateAsset(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(outlineBytes)))
  return Object.freeze({
    identity: Object.freeze({ layoutProfile: "creator-text-preview/1" as const, fontSha256: VNEXT_CREATOR_PREVIEW_FONT_SHA256_V1, outlineSha256: VNEXT_CREATOR_GLYPH_OUTLINE_SHA256_V1 }),
    unitsPerEm: 1000, glyphCount: glyphs.length,
    getGlyph(glyphId: number) {
      if (!Number.isInteger(glyphId) || glyphId < 0 || glyphId >= glyphs.length) throw new Error("Invalid creator glyph ID")
      return glyphs[glyphId]
    },
  })
}
