import type { VNextAuthoredBoxPlanV1 } from "../renderer/authoredBoxContractV1.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import { safeVNextTextBlockMultiRunSumV1 } from "./textBlockMultiRunDerivationV1.js"
import type {
  VNextTextBlockAuthoredBoxGeometryIssueV1,
  VNextTextBlockAuthoredBoxInsetsLayoutUnitV1,
} from "./textBlockAuthoredBoxGeometryContractV1.js"

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
