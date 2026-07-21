import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"

export interface VNextTextBlockEffectiveShapingStyleIdentityInputV1 {
  paragraphStyleKey: string
  fontFamilyKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  textDecoration: "none" | "underline"
  strikethrough: boolean
}

/**
 * Produces the exact effective shaping-style key shared by Core Initial Flow
 * and the external MR1 text-engine producer. Callers remain responsible for
 * validating and authoritatively resolving every supplied fact first.
 */
export function createVNextTextBlockEffectiveShapingStyleIdentityV1(
  input: VNextTextBlockEffectiveShapingStyleIdentityInputV1,
): string {
  const facts: VNextTextBlockEffectiveShapingStyleIdentityInputV1 = {
    paragraphStyleKey: input.paragraphStyleKey,
    fontFamilyKey: input.fontFamilyKey,
    fontFaceId: input.fontFaceId,
    fontSizeLayoutUnit: input.fontSizeLayoutUnit,
    textColor: input.textColor,
    fontWeight: input.fontWeight,
    fontStyle: input.fontStyle,
    textDecoration: input.textDecoration,
    strikethrough: input.strikethrough,
  }
  return createVNextCompactFingerprint(JSON.stringify(facts))
}
