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

  it("blocks invalid safe integers and unsafe middle arithmetic", () => {
    for (const input of [
      {
        verticalAlign: "baseline" as const,
        frameHeightLayoutUnit: 1.5,
        paragraphAscentLayoutUnit: 8_000_000,
        paragraphDescentLayoutUnit: 2_000_000,
      },
      {
        verticalAlign: "middle" as const,
        frameHeightLayoutUnit: Number.MAX_SAFE_INTEGER,
        paragraphAscentLayoutUnit: Number.MAX_SAFE_INTEGER,
        paragraphDescentLayoutUnit: 0,
      },
    ]) {
      expect(resolveVNextTextBlockInlineImageLineMetricsV1(input)).toMatchObject({
        status: "blocked",
        topFromBaselineLayoutUnit: null,
        bottomFromBaselineLayoutUnit: null,
        ascentLayoutUnit: null,
        descentLayoutUnit: null,
        issues: [expect.objectContaining({ severity: "error" })],
      })
    }
    expect(combineVNextTextBlockFlowLineMetricsV2({
      lineYLayoutUnit: 0.5,
      declaredLineHeightLayoutUnit: 1,
      candidateBandHeightLayoutUnit: 1,
      paragraphAscentLayoutUnit: 0,
      paragraphDescentLayoutUnit: 0,
      textExtents: [],
      imageExtents: [],
    })).toMatchObject({
      status: "blocked",
      baselineYLayoutUnit: null,
      issues: [expect.objectContaining({ severity: "error" })],
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

  it("blocks malformed extents and natural-height overflow", () => {
    const base = {
      lineYLayoutUnit: 0,
      declaredLineHeightLayoutUnit: 1,
      candidateBandHeightLayoutUnit: 1,
      paragraphAscentLayoutUnit: 0,
      paragraphDescentLayoutUnit: 0,
      imageExtents: [],
    }
    for (const input of [
      {
        ...base,
        textExtents: [{ topFromBaselineLayoutUnit: 1, bottomFromBaselineLayoutUnit: 0 }],
      },
      {
        ...base,
        paragraphAscentLayoutUnit: Number.MAX_SAFE_INTEGER,
        paragraphDescentLayoutUnit: Number.MAX_SAFE_INTEGER,
        textExtents: [],
      },
    ]) {
      expect(combineVNextTextBlockFlowLineMetricsV2(input)).toMatchObject({
        status: "blocked",
        contentTopFromBaselineLayoutUnit: null,
        contentBottomFromBaselineLayoutUnit: null,
        naturalHeightLayoutUnit: null,
        heightLayoutUnit: null,
        baselineYLayoutUnit: null,
        issues: [expect.objectContaining({ severity: "error" })],
      })
    }
  })

  it("blocks an unsafe baseline coordinate", () => {
    expect(combineVNextTextBlockFlowLineMetricsV2({
      lineYLayoutUnit: 1,
      declaredLineHeightLayoutUnit: Number.MAX_SAFE_INTEGER,
      candidateBandHeightLayoutUnit: Number.MAX_SAFE_INTEGER,
      paragraphAscentLayoutUnit: Number.MAX_SAFE_INTEGER,
      paragraphDescentLayoutUnit: 0,
      textExtents: [],
      imageExtents: [],
    })).toMatchObject({
      status: "blocked",
      baselineYLayoutUnit: null,
      issues: [expect.objectContaining({ code: "unsafe-layout-unit" })],
    })
  })

  it("combines a large valid extent collection without throwing", () => {
    const textExtents = Array.from({ length: 200_000 }, () => ({
      topFromBaselineLayoutUnit: -4,
      bottomFromBaselineLayoutUnit: 6,
    }))
    expect(combineVNextTextBlockFlowLineMetricsV2({
      lineYLayoutUnit: 0,
      declaredLineHeightLayoutUnit: 10,
      candidateBandHeightLayoutUnit: 10,
      paragraphAscentLayoutUnit: 4,
      paragraphDescentLayoutUnit: 6,
      textExtents,
      imageExtents: [],
    })).toMatchObject({
      status: "accepted",
      contentTopFromBaselineLayoutUnit: -4,
      contentBottomFromBaselineLayoutUnit: 6,
      naturalHeightLayoutUnit: 10,
      heightLayoutUnit: 10,
      baselineYLayoutUnit: 4,
      issues: [],
    })
  })
})
