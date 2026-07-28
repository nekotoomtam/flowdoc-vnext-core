import type { VNextAuthoredBoxPlanV1 } from "../renderer/authoredBoxContractV1.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import { safeVNextTextBlockMultiRunSumV1 } from "./textBlockMultiRunDerivationV1.js"
import type {
  VNextTextBlockAuthoredBoxGeometryIssueV1,
  VNextTextBlockAuthoredBoxInsetsLayoutUnitV1,
  VNextTextBlockAuthoredBoxIntervalPlacementV1,
  VNextTextBlockAuthoredBoxIntervalV1,
} from "./textBlockAuthoredBoxGeometryContractV1.js"
import type { VNextTextBlockMultiRunSourceSegmentV1 } from "./textBlockMultiRunLayoutContractV1.js"
import { spatialFingerprintV1 } from "./textBlockSpatialIndexInternalsV1.js"

export type VNextTextBlockAuthoredBoxKernelConversionResultV1 =
  | {
      status: "accepted"
      outerWidthLayoutUnit: number
      contentInsetsLayoutUnit: VNextTextBlockAuthoredBoxInsetsLayoutUnitV1
      contentOriginXLayoutUnit: number
      contentOriginYLayoutUnit: number
      contentWidthLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      outerWidthLayoutUnit: null
      contentInsetsLayoutUnit: null
      contentOriginXLayoutUnit: null
      contentOriginYLayoutUnit: null
      contentWidthLayoutUnit: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }

export type VNextTextBlockAuthoredBoxAutoHeightKernelResultV1 =
  | {
      status: "accepted"
      contentExtentBottomLayoutUnit: number
      outerHeightLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      contentExtentBottomLayoutUnit: null
      outerHeightLayoutUnit: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }

function issue(
  code: VNextTextBlockAuthoredBoxGeometryIssueV1["code"],
  path: string,
  message: string,
): VNextTextBlockAuthoredBoxGeometryIssueV1 {
  return { code, severity: "error", path, message }
}

export function convertVNextTextBlockAuthoredBoxKernelV1(input: {
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  contentWidthLayoutUnit: number
}): VNextTextBlockAuthoredBoxKernelConversionResultV1 {
  const plan = input.authoredBoxPlan
  const outer = convertVNextPointToLayoutUnitV1(
    plan.outerWidthPt,
    "initialFlow.authoredBoxPlan.outerWidthPt",
  )
  const width = convertVNextPointToLayoutUnitV1(
    plan.contentWidthPt,
    "initialFlow.authoredBoxPlan.contentWidthPt",
  )
  const top = convertVNextPointToLayoutUnitV1(plan.contentInsetPt.top, "initialFlow.authoredBoxPlan.contentInsetPt.top")
  const right = convertVNextPointToLayoutUnitV1(plan.contentInsetPt.right, "initialFlow.authoredBoxPlan.contentInsetPt.right")
  const bottom = convertVNextPointToLayoutUnitV1(plan.contentInsetPt.bottom, "initialFlow.authoredBoxPlan.contentInsetPt.bottom")
  const left = convertVNextPointToLayoutUnitV1(plan.contentInsetPt.left, "initialFlow.authoredBoxPlan.contentInsetPt.left")
  if (
    outer.status !== "accepted" || width.status !== "accepted"
    || top.status !== "accepted" || right.status !== "accepted"
    || bottom.status !== "accepted" || left.status !== "accepted"
    || outer.layoutUnit < 0 || width.layoutUnit < 0
    || top.layoutUnit < 0 || right.layoutUnit < 0
    || bottom.layoutUnit < 0 || left.layoutUnit < 0
  ) return {
    status: "blocked",
    outerWidthLayoutUnit: null,
    contentInsetsLayoutUnit: null,
    contentOriginXLayoutUnit: null,
    contentOriginYLayoutUnit: null,
    contentWidthLayoutUnit: null,
    issues: [issue("invalid-authored-box-geometry", "initialFlow.authoredBoxPlan", "authored box points must convert to non-negative safe layout units")],
  }
  const contentInsetsLayoutUnit = {
    top: top.layoutUnit,
    right: right.layoutUnit,
    bottom: bottom.layoutUnit,
    left: left.layoutUnit,
  }
  const composedOuterWidth = safeVNextTextBlockMultiRunSumV1([
    contentInsetsLayoutUnit.left,
    width.layoutUnit,
    contentInsetsLayoutUnit.right,
  ])
  if (composedOuterWidth == null) return {
    status: "blocked",
    outerWidthLayoutUnit: null,
    contentInsetsLayoutUnit: null,
    contentOriginXLayoutUnit: null,
    contentOriginYLayoutUnit: null,
    contentWidthLayoutUnit: null,
    issues: [issue("unsafe-layout-arithmetic", "initialFlow.authoredBoxPlan.outerWidthPt", "authored box width exceeds safe layout arithmetic")],
  }
  if (
    width.layoutUnit !== input.contentWidthLayoutUnit
    || composedOuterWidth !== outer.layoutUnit
  ) return {
    status: "blocked",
    outerWidthLayoutUnit: null,
    contentInsetsLayoutUnit: null,
    contentOriginXLayoutUnit: null,
    contentOriginYLayoutUnit: null,
    contentWidthLayoutUnit: null,
    issues: [issue("authored-box-width-mismatch", "initialFlow.authoredBoxPlan", "authored content width and horizontal insets must equal the request and outer width")],
  }
  return {
    status: "accepted",
    outerWidthLayoutUnit: outer.layoutUnit,
    contentInsetsLayoutUnit,
    contentOriginXLayoutUnit: contentInsetsLayoutUnit.left,
    contentOriginYLayoutUnit: contentInsetsLayoutUnit.top,
    contentWidthLayoutUnit: width.layoutUnit,
    issues: [],
  }
}

export function projectVNextTextBlockAuthoredBoxLinesKernelV1<TLine, TOutput>(input: {
  lines: readonly TLine[]
  contentOriginXLayoutUnit: number
  contentOriginYLayoutUnit: number
  projectLine(line: TLine, origin: { xLayoutUnit: number; yLayoutUnit: number }): TOutput
}): readonly TOutput[] {
  const origin = {
    xLayoutUnit: input.contentOriginXLayoutUnit,
    yLayoutUnit: input.contentOriginYLayoutUnit,
  }
  return input.lines.map((line) => input.projectLine(line, origin))
}

export type VNextTextBlockAuthoredBoxProjectionFragmentKernelInputV1<
  TTextRetained extends object,
  TImageRetained extends object,
> =
  | {
      kind: "text"
      contentXLayoutUnit: number
      contentFragmentFingerprint: string
      retained: TTextRetained
    }
  | {
      kind: "inline-image"
      contentXLayoutUnit: number
      contentYLayoutUnit: number
      contentFragmentFingerprint: string
      retained: TImageRetained
    }

export type VNextTextBlockAuthoredBoxProjectionFragmentKernelOutputV1<
  TTextRetained extends object,
  TImageRetained extends object,
> =
  | (TTextRetained & {
      contentXLayoutUnit: number
      xLayoutUnit: number
      contentFragmentFingerprint: string
      fingerprint: string
    })
  | (TImageRetained & {
      contentXLayoutUnit: number
      contentYLayoutUnit: number
      xLayoutUnit: number
      yLayoutUnit: number
      contentFragmentFingerprint: string
      fingerprint: string
    })

export interface VNextTextBlockAuthoredBoxProjectionLineKernelInputV1<
  TTextRetained extends object,
  TImageRetained extends object,
> {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly { startLayoutUnit: number; endLayoutUnit: number }[]
  intervalPlacements: readonly {
    intervalIndex: number
    renderStartOffset: number
    renderEndOffset: number
    xStartLayoutUnit: number
    xEndLayoutUnit: number
  }[]
  fragments: readonly VNextTextBlockAuthoredBoxProjectionFragmentKernelInputV1<
    TTextRetained,
    TImageRetained
  >[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
}

export interface VNextTextBlockAuthoredBoxProjectionLineKernelOutputV1<
  TTextRetained extends object,
  TImageRetained extends object,
> {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockAuthoredBoxIntervalV1[]
  intervalPlacements: readonly VNextTextBlockAuthoredBoxIntervalPlacementV1[]
  fragments: readonly VNextTextBlockAuthoredBoxProjectionFragmentKernelOutputV1<
    TTextRetained,
    TImageRetained
  >[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxProjectionKernelResultV1<
  TTextRetained extends object,
  TImageRetained extends object,
> =
  | {
      status: "accepted"
      lines: readonly VNextTextBlockAuthoredBoxProjectionLineKernelOutputV1<
        TTextRetained,
        TImageRetained
      >[]
      issues: []
    }
  | {
      status: "blocked"
      lines: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }

function safeAdd(
  left: number,
  right: number,
  path: string,
): number | VNextTextBlockAuthoredBoxGeometryIssueV1 {
  const value = left + right
  return Number.isSafeInteger(value)
    ? value
    : issue("unsafe-layout-arithmetic", path, "authored box coordinate exceeds safe layout arithmetic")
}

export function projectVNextTextBlockAuthoredBoxGeometryKernelV1<
  TTextRetained extends object,
  TImageRetained extends object,
>(input: {
  lines: readonly VNextTextBlockAuthoredBoxProjectionLineKernelInputV1<
    TTextRetained,
    TImageRetained
  >[]
  contentOriginXLayoutUnit: number
  contentOriginYLayoutUnit: number
}): VNextTextBlockAuthoredBoxProjectionKernelResultV1<
  TTextRetained,
  TImageRetained
> {
  const lines: VNextTextBlockAuthoredBoxProjectionLineKernelOutputV1<
    TTextRetained,
    TImageRetained
  >[] = []
  for (const line of input.lines) {
    const availableIntervals: VNextTextBlockAuthoredBoxIntervalV1[] = []
    for (const [index, interval] of line.availableIntervals.entries()) {
      const startLayoutUnit = safeAdd(interval.startLayoutUnit, input.contentOriginXLayoutUnit, `lines[${line.index}].availableIntervals[${index}].startLayoutUnit`)
      const endLayoutUnit = safeAdd(interval.endLayoutUnit, input.contentOriginXLayoutUnit, `lines[${line.index}].availableIntervals[${index}].endLayoutUnit`)
      if (typeof startLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [startLayoutUnit] }
      if (typeof endLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [endLayoutUnit] }
      const facts = {
        contentStartLayoutUnit: interval.startLayoutUnit,
        contentEndLayoutUnit: interval.endLayoutUnit,
        startLayoutUnit,
        endLayoutUnit,
        contentLineFingerprint: line.contentLineFingerprint,
      }
      availableIntervals.push({ ...facts, fingerprint: spatialFingerprintV1(facts) })
    }
    const intervalPlacements: VNextTextBlockAuthoredBoxIntervalPlacementV1[] = []
    for (const [index, placement] of line.intervalPlacements.entries()) {
      const xStartLayoutUnit = safeAdd(placement.xStartLayoutUnit, input.contentOriginXLayoutUnit, `lines[${line.index}].intervalPlacements[${index}].xStartLayoutUnit`)
      const xEndLayoutUnit = safeAdd(placement.xEndLayoutUnit, input.contentOriginXLayoutUnit, `lines[${line.index}].intervalPlacements[${index}].xEndLayoutUnit`)
      if (typeof xStartLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [xStartLayoutUnit] }
      if (typeof xEndLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [xEndLayoutUnit] }
      const facts = {
        intervalIndex: placement.intervalIndex,
        renderStartOffset: placement.renderStartOffset,
        renderEndOffset: placement.renderEndOffset,
        contentXStartLayoutUnit: placement.xStartLayoutUnit,
        contentXEndLayoutUnit: placement.xEndLayoutUnit,
        xStartLayoutUnit,
        xEndLayoutUnit,
        contentLineFingerprint: line.contentLineFingerprint,
      }
      intervalPlacements.push({ ...facts, fingerprint: spatialFingerprintV1(facts) })
    }
    const fragments: VNextTextBlockAuthoredBoxProjectionFragmentKernelOutputV1<
      TTextRetained,
      TImageRetained
    >[] = []
    for (const [index, fragment] of line.fragments.entries()) {
      const xLayoutUnit = safeAdd(fragment.contentXLayoutUnit, input.contentOriginXLayoutUnit, `lines[${line.index}].fragments[${index}].xLayoutUnit`)
      if (typeof xLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [xLayoutUnit] }
      if (fragment.kind === "text") {
        const facts = {
          ...fragment.retained,
          contentXLayoutUnit: fragment.contentXLayoutUnit,
          xLayoutUnit,
          contentFragmentFingerprint: fragment.contentFragmentFingerprint,
        }
        fragments.push({ ...facts, fingerprint: spatialFingerprintV1(facts) })
        continue
      }
      const yLayoutUnit = safeAdd(fragment.contentYLayoutUnit, input.contentOriginYLayoutUnit, `lines[${line.index}].fragments[${index}].yLayoutUnit`)
      if (typeof yLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [yLayoutUnit] }
      const facts = {
        ...fragment.retained,
        contentXLayoutUnit: fragment.contentXLayoutUnit,
        contentYLayoutUnit: fragment.contentYLayoutUnit,
        xLayoutUnit,
        yLayoutUnit,
        contentFragmentFingerprint: fragment.contentFragmentFingerprint,
      }
      fragments.push({ ...facts, fingerprint: spatialFingerprintV1(facts) })
    }
    const yOffsetLayoutUnit = safeAdd(line.contentYOffsetLayoutUnit, input.contentOriginYLayoutUnit, `lines[${line.index}].yOffsetLayoutUnit`)
    if (typeof yOffsetLayoutUnit !== "number") return { status: "blocked", lines: null, issues: [yOffsetLayoutUnit] }
    const facts = {
      index: line.index,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      contentYOffsetLayoutUnit: line.contentYOffsetLayoutUnit,
      yOffsetLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
      availableIntervals,
      intervalPlacements,
      fragments,
      sourceSegments: line.sourceSegments,
      contentRegionFingerprint: line.contentRegionFingerprint,
      contentLineFingerprint: line.contentLineFingerprint,
    }
    lines.push({ ...facts, fingerprint: spatialFingerprintV1(facts) })
  }
  return { status: "accepted", lines, issues: [] }
}

export function deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1(input: {
  topInsetLayoutUnit: number
  bottomInsetLayoutUnit: number
  contentFlowHeightLayoutUnit: number
  spatialMaximumBottomLayoutUnit: number
}): VNextTextBlockAuthoredBoxAutoHeightKernelResultV1 {
  if (
    !Number.isSafeInteger(input.topInsetLayoutUnit)
    || !Number.isSafeInteger(input.bottomInsetLayoutUnit)
    || !Number.isSafeInteger(input.contentFlowHeightLayoutUnit)
    || !Number.isSafeInteger(input.spatialMaximumBottomLayoutUnit)
  ) return {
    status: "blocked",
    contentExtentBottomLayoutUnit: null,
    outerHeightLayoutUnit: null,
    issues: [issue("unsafe-layout-arithmetic", "geometry.outerHeightLayoutUnit", "authored box height exceeds safe layout arithmetic")],
  }
  const contentExtentBottomLayoutUnit = Math.max(
    input.contentFlowHeightLayoutUnit,
    input.spatialMaximumBottomLayoutUnit,
  )
  const outerHeightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    input.topInsetLayoutUnit,
    contentExtentBottomLayoutUnit,
    input.bottomInsetLayoutUnit,
  ])
  if (outerHeightLayoutUnit == null) return {
    status: "blocked",
    contentExtentBottomLayoutUnit: null,
    outerHeightLayoutUnit: null,
    issues: [issue("unsafe-layout-arithmetic", "geometry.outerHeightLayoutUnit", "authored box height exceeds safe layout arithmetic")],
  }
  return { status: "accepted", contentExtentBottomLayoutUnit, outerHeightLayoutUnit, issues: [] }
}
