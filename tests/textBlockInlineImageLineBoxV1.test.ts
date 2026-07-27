import { describe, expect, it } from "vitest"
import {
  combineVNextTextBlockFlowLineMetricsV2,
  resolveVNextTextBlockInlineImageLineMetricsV1,
  VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1,
} from "../src/index.js"

describe("inline-image line-box policy", () => {
  it.each([
    ["baseline", -12_000_000, 0],
    ["text-bottom", -10_000_000, 2_000_000],
    ["middle", -9_000_000, 3_000_000],
  ] as const)("resolves %s against paragraph metrics", (verticalAlign, top, bottom) => {
    expect(resolveVNextTextBlockInlineImageLineMetricsV1({
      verticalAlign,
      frameHeightLayoutUnit: 12_000_000,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
    })).toMatchObject({
      status: "accepted",
      topFromBaselineLayoutUnit: top,
      bottomFromBaselineLayoutUnit: bottom,
    })
  })

  it("floors odd middle alignment toward negative infinity", () => {
    expect(resolveVNextTextBlockInlineImageLineMetricsV1({
      verticalAlign: "middle",
      frameHeightLayoutUnit: 11_000_001,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
    })).toMatchObject({
      status: "accepted",
      topFromBaselineLayoutUnit: -8_500_001,
      bottomFromBaselineLayoutUnit: 2_500_000,
    })
  })

  it("combines paragraph, text, and image extents deterministically", () => {
    expect(combineVNextTextBlockFlowLineMetricsV2({
      lineYLayoutUnit: 5_000_000,
      declaredLineHeightLayoutUnit: 20_000_000,
      candidateBandHeightLayoutUnit: 14_000_000,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
      textExtents: [{ topFromBaselineLayoutUnit: -8_000_000, bottomFromBaselineLayoutUnit: 2_000_000 }],
      imageExtents: [{ topFromBaselineLayoutUnit: -12_000_000, bottomFromBaselineLayoutUnit: 0 }],
    })).toEqual({
      status: "accepted",
      contentTopFromBaselineLayoutUnit: -12_000_000,
      contentBottomFromBaselineLayoutUnit: 2_000_000,
      naturalHeightLayoutUnit: 14_000_000,
      heightLayoutUnit: 20_000_000,
      leadingBeforeLayoutUnit: 3_000_000,
      leadingAfterLayoutUnit: 3_000_000,
      baselineOffsetLayoutUnit: 15_000_000,
      baselineYLayoutUnit: 20_000_000,
      issues: [],
    })
    expect(VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint)
      .toMatch(/^sha256:[a-f0-9]{64}$/u)
  })
})
