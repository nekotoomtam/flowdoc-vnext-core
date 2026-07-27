import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextLayoutUnitIssueV1 } from "./layoutUnitPolicyV1.js"

export const VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1 = Object.freeze({
  source: "vnext-text-block-inline-image-alignment-policy-v1" as const,
  policyVersion: 1 as const,
  coordinateDirection: "positive-y-down" as const,
  anchor: "paragraph-font-metrics" as const,
  middleRounding: "floor-toward-negative-infinity" as const,
  fingerprint: createVNextCompactFingerprint(JSON.stringify({
    source: "vnext-text-block-inline-image-alignment-policy-v1",
    policyVersion: 1,
    coordinateDirection: "positive-y-down",
    anchor: "paragraph-font-metrics",
    middleRounding: "floor-toward-negative-infinity",
  })),
})

export interface VNextTextBlockBaselineExtentV1 {
  topFromBaselineLayoutUnit: number
  bottomFromBaselineLayoutUnit: number
}

export type VNextTextBlockInlineImageLineMetricsResultV1 =
  | {
      status: "accepted"
      topFromBaselineLayoutUnit: number
      bottomFromBaselineLayoutUnit: number
      ascentLayoutUnit: number
      descentLayoutUnit: number
      alignmentPolicyFingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      topFromBaselineLayoutUnit: null
      bottomFromBaselineLayoutUnit: null
      ascentLayoutUnit: null
      descentLayoutUnit: null
      alignmentPolicyFingerprint: string
      issues: readonly VNextLayoutUnitIssueV1[]
    }

export type VNextTextBlockFlowLineMetricsResultV2 =
  | {
      status: "accepted"
      contentTopFromBaselineLayoutUnit: number
      contentBottomFromBaselineLayoutUnit: number
      naturalHeightLayoutUnit: number
      heightLayoutUnit: number
      leadingBeforeLayoutUnit: number
      leadingAfterLayoutUnit: number
      baselineOffsetLayoutUnit: number
      baselineYLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      contentTopFromBaselineLayoutUnit: null
      contentBottomFromBaselineLayoutUnit: null
      naturalHeightLayoutUnit: null
      heightLayoutUnit: null
      leadingBeforeLayoutUnit: null
      leadingAfterLayoutUnit: null
      baselineOffsetLayoutUnit: null
      baselineYLayoutUnit: null
      issues: readonly VNextLayoutUnitIssueV1[]
    }

type VNextTextBlockInlineImageLineMetricsInputV1 = {
  verticalAlign: "baseline" | "middle" | "text-bottom"
  frameHeightLayoutUnit: number
  paragraphAscentLayoutUnit: number
  paragraphDescentLayoutUnit: number
}

type VNextTextBlockFlowLineMetricsInputV2 = {
  lineYLayoutUnit: number
  declaredLineHeightLayoutUnit: number
  candidateBandHeightLayoutUnit: number
  paragraphAscentLayoutUnit: number
  paragraphDescentLayoutUnit: number
  textExtents: readonly VNextTextBlockBaselineExtentV1[]
  imageExtents: readonly VNextTextBlockBaselineExtentV1[]
}

function issue(path: string, message: string, code: VNextLayoutUnitIssueV1["code"] = "invalid-layout-unit"): VNextLayoutUnitIssueV1 {
  return { code, severity: "error", path, message }
}

function blockedImageMetrics(issueValue: VNextLayoutUnitIssueV1): VNextTextBlockInlineImageLineMetricsResultV1 {
  return {
    status: "blocked",
    topFromBaselineLayoutUnit: null,
    bottomFromBaselineLayoutUnit: null,
    ascentLayoutUnit: null,
    descentLayoutUnit: null,
    alignmentPolicyFingerprint: VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
    issues: [issueValue],
  }
}

function blockedFlowMetrics(issueValue: VNextLayoutUnitIssueV1): VNextTextBlockFlowLineMetricsResultV2 {
  return {
    status: "blocked",
    contentTopFromBaselineLayoutUnit: null,
    contentBottomFromBaselineLayoutUnit: null,
    naturalHeightLayoutUnit: null,
    heightLayoutUnit: null,
    leadingBeforeLayoutUnit: null,
    leadingAfterLayoutUnit: null,
    baselineOffsetLayoutUnit: null,
    baselineYLayoutUnit: null,
    issues: [issueValue],
  }
}

function safeAdd(left: number, right: number): number | null {
  const value = left + right
  return Number.isSafeInteger(value) ? value : null
}

function safeSubtract(left: number, right: number): number | null {
  const value = left - right
  return Number.isSafeInteger(value) ? value : null
}

function isNonNegativeSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0
}

function isPositiveSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0
}

export function resolveVNextTextBlockInlineImageLineMetricsV1(
  input: VNextTextBlockInlineImageLineMetricsInputV1,
): VNextTextBlockInlineImageLineMetricsResultV1 {
  if (
    !isPositiveSafeInteger(input.frameHeightLayoutUnit)
    || !isNonNegativeSafeInteger(input.paragraphAscentLayoutUnit)
    || !isNonNegativeSafeInteger(input.paragraphDescentLayoutUnit)
    || (input.verticalAlign !== "baseline"
      && input.verticalAlign !== "middle"
      && input.verticalAlign !== "text-bottom")
  ) return blockedImageMetrics(issue(
    "input",
    "inline image line metrics require safe positive frame height, non-negative paragraph metrics, and a supported alignment",
  ))

  let top: number | null
  if (input.verticalAlign === "baseline") {
    top = safeSubtract(0, input.frameHeightLayoutUnit)
  } else if (input.verticalAlign === "text-bottom") {
    top = safeSubtract(input.paragraphDescentLayoutUnit, input.frameHeightLayoutUnit)
  } else {
    const centered = safeSubtract(
      input.paragraphDescentLayoutUnit,
      input.paragraphAscentLayoutUnit,
    )
    const numerator = centered == null
      ? null
      : safeSubtract(centered, input.frameHeightLayoutUnit)
    top = numerator == null ? null : Math.floor(numerator / 2)
  }
  if (top == null || !Number.isSafeInteger(top)) return blockedImageMetrics(issue(
    "input",
    "inline image alignment exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  const bottom = input.verticalAlign === "text-bottom"
    ? input.paragraphDescentLayoutUnit
    : safeAdd(top, input.frameHeightLayoutUnit)
  if (bottom == null) return blockedImageMetrics(issue(
    "input",
    "inline image extent exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  const ascent = Math.max(0, -top)
  const descent = Math.max(0, bottom)
  if (!Number.isSafeInteger(ascent) || !Number.isSafeInteger(descent)) {
    return blockedImageMetrics(issue(
      "input",
      "inline image ascent and descent exceed safe layout arithmetic",
      "unsafe-layout-unit",
    ))
  }
  return {
    status: "accepted",
    topFromBaselineLayoutUnit: top,
    bottomFromBaselineLayoutUnit: bottom,
    ascentLayoutUnit: ascent,
    descentLayoutUnit: descent,
    alignmentPolicyFingerprint: VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
    issues: [],
  }
}

export function combineVNextTextBlockFlowLineMetricsV2(
  input: VNextTextBlockFlowLineMetricsInputV2,
): VNextTextBlockFlowLineMetricsResultV2 {
  if (
    !Number.isSafeInteger(input.lineYLayoutUnit)
    || !isPositiveSafeInteger(input.declaredLineHeightLayoutUnit)
    || !isPositiveSafeInteger(input.candidateBandHeightLayoutUnit)
    || !isNonNegativeSafeInteger(input.paragraphAscentLayoutUnit)
    || !isNonNegativeSafeInteger(input.paragraphDescentLayoutUnit)
  ) return blockedFlowMetrics(issue(
    "input",
    "flow line metrics require safe line coordinates and positive line-height candidates",
  ))
  const paragraphTop = safeSubtract(0, input.paragraphAscentLayoutUnit)
  if (paragraphTop == null) return blockedFlowMetrics(issue(
    "paragraphAscentLayoutUnit",
    "paragraph extent exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  let contentTop = paragraphTop
  let contentBottom = input.paragraphDescentLayoutUnit
  for (const extents of [input.textExtents, input.imageExtents]) {
    for (const extent of extents) {
      if (
        !Number.isSafeInteger(extent.topFromBaselineLayoutUnit)
        || !Number.isSafeInteger(extent.bottomFromBaselineLayoutUnit)
        || extent.topFromBaselineLayoutUnit > extent.bottomFromBaselineLayoutUnit
      ) return blockedFlowMetrics(issue(
        "extents",
        "line extents must be ordered safe layout integers",
      ))
      contentTop = Math.min(contentTop, extent.topFromBaselineLayoutUnit)
      contentBottom = Math.max(contentBottom, extent.bottomFromBaselineLayoutUnit)
    }
  }
  const naturalHeight = safeSubtract(contentBottom, contentTop)
  if (naturalHeight == null || naturalHeight < 0) return blockedFlowMetrics(issue(
    "extents",
    "line content height exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  const height = Math.max(
    input.declaredLineHeightLayoutUnit,
    input.candidateBandHeightLayoutUnit,
    naturalHeight,
  )
  const leading = safeSubtract(height, naturalHeight)
  if (leading == null || leading < 0) return blockedFlowMetrics(issue(
    "heightLayoutUnit",
    "line leading exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  const leadingBefore = Math.floor(leading / 2)
  const leadingAfter = safeSubtract(leading, leadingBefore)
  const baselineOffset = safeSubtract(leadingBefore, contentTop)
  if (leadingAfter == null || baselineOffset == null) return blockedFlowMetrics(issue(
    "baselineOffsetLayoutUnit",
    "line baseline exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  const baselineY = safeAdd(input.lineYLayoutUnit, baselineOffset)
  if (baselineY == null) return blockedFlowMetrics(issue(
    "baselineYLayoutUnit",
    "line baseline coordinate exceeds safe layout arithmetic",
    "unsafe-layout-unit",
  ))
  return {
    status: "accepted",
    contentTopFromBaselineLayoutUnit: contentTop,
    contentBottomFromBaselineLayoutUnit: contentBottom,
    naturalHeightLayoutUnit: naturalHeight,
    heightLayoutUnit: height,
    leadingBeforeLayoutUnit: leadingBefore,
    leadingAfterLayoutUnit: leadingAfter,
    baselineOffsetLayoutUnit: baselineOffset,
    baselineYLayoutUnit: baselineY,
    issues: [],
  }
}
