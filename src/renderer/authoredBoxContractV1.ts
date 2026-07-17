import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { AuthoredNodeV4Target } from "../schema/documentV4Target.js"
import type { UnitValueV4Target } from "../schema/documentV4Foundation.js"

export const VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE = "vnext-authored-box-contract" as const
export const VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION = 1 as const

export type VNextAuthoredBoxOwnerTypeV1 = "text-block" | "column" | "table-cell"
export type VNextAuthoredBoxEdgeV1 = "top" | "right" | "bottom" | "left"
export type VNextAuthoredBoxBorderStyleV1 = "none" | "solid" | "dashed" | "dotted"

type AuthoredBoxOwner =
  | Extract<AuthoredNodeV4Target, { type: "text-block" }>
  | Extract<AuthoredNodeV4Target, { type: "column" }>
  | Extract<AuthoredNodeV4Target, { type: "table-cell" }>
type AuthoredBoxStyle = NonNullable<AuthoredBoxOwner["props"]["box"]>
type AuthoredBoxBorderSide = NonNullable<
  NonNullable<AuthoredBoxStyle["border"]>[VNextAuthoredBoxEdgeV1]
>

export interface VNextAuthoredBoxInsetsV1 {
  top: number
  right: number
  bottom: number
  left: number
}

export interface VNextAuthoredBoxBorderSideV1 {
  style: VNextAuthoredBoxBorderStyleV1
  widthPt: number
  color: string
}

export interface VNextAuthoredBoxBorderV1 {
  top: VNextAuthoredBoxBorderSideV1
  right: VNextAuthoredBoxBorderSideV1
  bottom: VNextAuthoredBoxBorderSideV1
  left: VNextAuthoredBoxBorderSideV1
}

export interface VNextAuthoredBoxPlanV1 {
  source: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE
  contractVersion: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION
  kind: "authored-box-plan"
  ownerNodeId: string
  ownerNodeType: VNextAuthoredBoxOwnerTypeV1
  hasAuthoredBox: boolean
  fillColor: string | null
  paddingPt: VNextAuthoredBoxInsetsV1
  border: VNextAuthoredBoxBorderV1
  outerWidthPt: number
  contentInsetPt: VNextAuthoredBoxInsetsV1
  contentWidthPt: number
  pageSplitPolicy: "open-continuation-edges"
  styleFingerprint: string
  fingerprint: string
}

export interface VNextAuthoredBoxIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  ownerNodeId?: string
  placementId?: string
  pageIndex?: number
}

export type VNextAuthoredBoxPlanResultV1 =
  | {
      status: "ready"
      plan: VNextAuthoredBoxPlanV1
      issues: []
    }
  | {
      status: "blocked"
      plan: null
      issues: VNextAuthoredBoxIssueV1[]
    }

export interface VNextAuthoredBoxBoundsV1 {
  xPt: number
  yPt: number
  widthPt: number
  heightPt: number
}

export interface VNextAuthoredBoxPlacementV1 {
  placementId: string
  pageIndex: number
  pageNumber: number
  containerBounds: VNextAuthoredBoxBoundsV1
  blockOffsetPt: number
  blockExtentPt: number
  startsBox: boolean
  endsBox: boolean
}

export interface VNextAuthoredBoxFillIntentV1 {
  intentId: string
  kind: "fill-rect"
  bounds: VNextAuthoredBoxBoundsV1
  color: string
  opacity: 1
}

export interface VNextAuthoredBoxBorderIntentV1 {
  intentId: string
  kind: "stroke-line"
  edge: VNextAuthoredBoxEdgeV1
  bounds: VNextAuthoredBoxBoundsV1
  color: string
  opacity: 1
  widthPt: number
  style: Exclude<VNextAuthoredBoxBorderStyleV1, "none">
}

export type VNextAuthoredBoxPaintIntentV1 =
  | VNextAuthoredBoxFillIntentV1
  | VNextAuthoredBoxBorderIntentV1

export interface VNextAuthoredBoxFragmentV1 {
  fragmentId: string
  boxId: string
  pageIndex: number
  pageNumber: number
  continuesFromPreviousPage: boolean
  continuesOnNextPage: boolean
  sourcePlacementIds: string[]
  bounds: VNextAuthoredBoxBoundsV1
  contentXPt: number
  contentWidthPt: number
  paintIntents: VNextAuthoredBoxPaintIntentV1[]
  fingerprint: string
}

export type VNextAuthoredBoxProjectionResultV1 =
  | {
      source: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE
      contractVersion: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION
      status: "consumable"
      boxId: string
      planFingerprint: string
      fragments: VNextAuthoredBoxFragmentV1[]
      summary: {
        placementCount: number
        pageCount: number
        fragmentCount: number
        fillIntentCount: number
        borderIntentCount: number
      }
      fingerprint: string
      issues: []
    }
  | {
      source: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE
      contractVersion: typeof VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION
      status: "blocked"
      boxId: string
      planFingerprint: string | null
      fragments: null
      summary: null
      fingerprint: null
      issues: VNextAuthoredBoxIssueV1[]
    }

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.001
}

function sameBounds(left: VNextAuthoredBoxBoundsV1, right: VNextAuthoredBoxBoundsV1): boolean {
  return near(left.xPt, right.xPt)
    && near(left.yPt, right.yPt)
    && near(left.widthPt, right.widthPt)
    && near(left.heightPt, right.heightPt)
}

function issue(
  code: string,
  path: string,
  message: string,
  facts: Pick<VNextAuthoredBoxIssueV1, "ownerNodeId" | "placementId" | "pageIndex"> = {},
): VNextAuthoredBoxIssueV1 {
  return { code, path, message, severity: "error", ...facts }
}

function isBoxOwner(node: AuthoredNodeV4Target): node is AuthoredBoxOwner {
  return node.type === "text-block" || node.type === "column" || node.type === "table-cell"
}

function unitToPt(
  value: UnitValueV4Target,
  path: string,
  issues: VNextAuthoredBoxIssueV1[],
  ownerNodeId: string,
): number {
  if (!Number.isFinite(value.value) || value.value < 0 || (value.unit !== "pt" && value.unit !== "mm")) {
    issues.push(issue(
      "authored-box-unit-invalid",
      path,
      "authored box units must be finite, nonnegative, and use pt or mm",
      { ownerNodeId },
    ))
    return 0
  }
  return roundPt(value.unit === "pt" ? value.value : (value.value * 72) / 25.4)
}

function emptyBorderSide(): VNextAuthoredBoxBorderSideV1 {
  return { style: "none", widthPt: 0, color: "000000" }
}

function borderSide(
  value: AuthoredBoxBorderSide | undefined,
  path: string,
  issues: VNextAuthoredBoxIssueV1[],
  ownerNodeId: string,
): VNextAuthoredBoxBorderSideV1 {
  if (value == null) return emptyBorderSide()
  const side = value as {
    style: VNextAuthoredBoxBorderStyleV1
    width: UnitValueV4Target
    color: string
  }
  const widthPt = unitToPt(side.width, `${path}.width`, issues, ownerNodeId)
  if (side.style === "none" && widthPt !== 0) issues.push(issue(
    "authored-box-none-border-width-nonzero",
    `${path}.width`,
    "a none border must have zero width",
    { ownerNodeId },
  ))
  if (side.style !== "none" && widthPt <= 0) issues.push(issue(
    "authored-box-visible-border-width-nonpositive",
    `${path}.width`,
    "a visible border must have positive width",
    { ownerNodeId },
  ))
  if (side.style === "none") return emptyBorderSide()
  return { style: side.style, widthPt, color: side.color.toUpperCase() }
}

function blockedPlan(issues: VNextAuthoredBoxIssueV1[]): VNextAuthoredBoxPlanResultV1 {
  return { status: "blocked", plan: null, issues }
}

export function createVNextAuthoredBoxPlanV1(input: {
  ownerNode: AuthoredNodeV4Target
  availableWidthPt: number
}): VNextAuthoredBoxPlanResultV1 {
  const issues: VNextAuthoredBoxIssueV1[] = []
  const ownerNodeId = input.ownerNode.id
  if (!isBoxOwner(input.ownerNode)) issues.push(issue(
    "authored-box-owner-unsupported",
    "ownerNode.type",
    "authored box v1 supports text-block, column, and table-cell owners",
    { ownerNodeId },
  ))
  if (!Number.isFinite(input.availableWidthPt) || input.availableWidthPt <= 0) issues.push(issue(
    "authored-box-available-width-invalid",
    "availableWidthPt",
    "authored box available width must be positive and finite",
    { ownerNodeId },
  ))
  if (issues.length > 0 || !isBoxOwner(input.ownerNode)) return blockedPlan(issues)

  const authored = input.ownerNode.props.box
  const padding = authored?.padding
  const paddingPt: VNextAuthoredBoxInsetsV1 = padding == null
    ? { top: 0, right: 0, bottom: 0, left: 0 }
    : {
        top: unitToPt(padding.top, "ownerNode.props.box.padding.top", issues, ownerNodeId),
        right: unitToPt(padding.right, "ownerNode.props.box.padding.right", issues, ownerNodeId),
        bottom: unitToPt(padding.bottom, "ownerNode.props.box.padding.bottom", issues, ownerNodeId),
        left: unitToPt(padding.left, "ownerNode.props.box.padding.left", issues, ownerNodeId),
      }
  const border: VNextAuthoredBoxBorderV1 = {
    top: borderSide(authored?.border?.top, "ownerNode.props.box.border.top", issues, ownerNodeId),
    right: borderSide(authored?.border?.right, "ownerNode.props.box.border.right", issues, ownerNodeId),
    bottom: borderSide(authored?.border?.bottom, "ownerNode.props.box.border.bottom", issues, ownerNodeId),
    left: borderSide(authored?.border?.left, "ownerNode.props.box.border.left", issues, ownerNodeId),
  }
  const contentInsetPt = {
    top: roundPt(paddingPt.top + border.top.widthPt),
    right: roundPt(paddingPt.right + border.right.widthPt),
    bottom: roundPt(paddingPt.bottom + border.bottom.widthPt),
    left: roundPt(paddingPt.left + border.left.widthPt),
  }
  const outerWidthPt = roundPt(input.availableWidthPt)
  const contentWidthPt = roundPt(outerWidthPt - contentInsetPt.left - contentInsetPt.right)
  if (contentWidthPt <= 0) issues.push(issue(
    "authored-box-content-width-nonpositive",
    "availableWidthPt",
    "authored box horizontal padding and borders must leave positive content width",
    { ownerNodeId },
  ))
  if (issues.length > 0) return blockedPlan(issues)

  const styleFacts = {
    fillColor: authored?.fill?.toUpperCase() ?? null,
    paddingPt,
    border,
    contentInsetPt,
    pageSplitPolicy: "open-continuation-edges" as const,
  }
  const planFacts = {
    source: VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE,
    contractVersion: VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION,
    kind: "authored-box-plan" as const,
    ownerNodeId,
    ownerNodeType: input.ownerNode.type,
    hasAuthoredBox: authored != null,
    ...styleFacts,
    outerWidthPt,
    contentWidthPt,
    styleFingerprint: createVNextCompactFingerprint(JSON.stringify(styleFacts)),
  }
  return {
    status: "ready",
    plan: {
      ...planFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(planFacts)),
    },
    issues: [],
  }
}

function validBounds(bounds: VNextAuthoredBoxBoundsV1): boolean {
  return Number.isFinite(bounds.xPt)
    && bounds.xPt >= 0
    && Number.isFinite(bounds.yPt)
    && bounds.yPt >= 0
    && Number.isFinite(bounds.widthPt)
    && bounds.widthPt > 0
    && Number.isFinite(bounds.heightPt)
    && bounds.heightPt > 0
}

function blockedProjection(
  boxId: string,
  planFingerprint: string | null,
  issues: VNextAuthoredBoxIssueV1[],
): VNextAuthoredBoxProjectionResultV1 {
  return {
    source: VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE,
    contractVersion: VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION,
    status: "blocked",
    boxId,
    planFingerprint,
    fragments: null,
    summary: null,
    fingerprint: null,
    issues,
  }
}

function borderLineBounds(
  bounds: VNextAuthoredBoxBoundsV1,
  edge: VNextAuthoredBoxEdgeV1,
  activeBorder: Partial<Record<VNextAuthoredBoxEdgeV1, VNextAuthoredBoxBorderSideV1>>,
): VNextAuthoredBoxBoundsV1 | null {
  const topHalf = (activeBorder.top?.widthPt ?? 0) / 2
  const rightHalf = (activeBorder.right?.widthPt ?? 0) / 2
  const bottomHalf = (activeBorder.bottom?.widthPt ?? 0) / 2
  const leftHalf = (activeBorder.left?.widthPt ?? 0) / 2
  if (edge === "top") return {
    xPt: roundPt(bounds.xPt + leftHalf),
    yPt: roundPt(bounds.yPt + topHalf),
    widthPt: roundPt(bounds.widthPt - leftHalf - rightHalf),
    heightPt: 0,
  }
  if (edge === "right") return {
    xPt: roundPt(bounds.xPt + bounds.widthPt - rightHalf),
    yPt: roundPt(bounds.yPt + topHalf),
    widthPt: 0,
    heightPt: roundPt(bounds.heightPt - topHalf - bottomHalf),
  }
  if (edge === "bottom") return {
    xPt: roundPt(bounds.xPt + leftHalf),
    yPt: roundPt(bounds.yPt + bounds.heightPt - bottomHalf),
    widthPt: roundPt(bounds.widthPt - leftHalf - rightHalf),
    heightPt: 0,
  }
  return {
    xPt: roundPt(bounds.xPt + leftHalf),
    yPt: roundPt(bounds.yPt + topHalf),
    widthPt: 0,
    heightPt: roundPt(bounds.heightPt - topHalf - bottomHalf),
  }
}

function paintIntents(
  boxId: string,
  fragmentId: string,
  bounds: VNextAuthoredBoxBoundsV1,
  plan: VNextAuthoredBoxPlanV1,
  continuesFromPreviousPage: boolean,
  continuesOnNextPage: boolean,
  issues: VNextAuthoredBoxIssueV1[],
  pageIndex: number,
): VNextAuthoredBoxPaintIntentV1[] {
  const intents: VNextAuthoredBoxPaintIntentV1[] = []
  if (plan.fillColor != null) intents.push({
    intentId: `${fragmentId}:fill`,
    kind: "fill-rect",
    bounds,
    color: plan.fillColor,
    opacity: 1,
  })
  const activeEdges: VNextAuthoredBoxEdgeV1[] = [
    ...(continuesFromPreviousPage ? [] : ["top" as const]),
    "right",
    ...(continuesOnNextPage ? [] : ["bottom" as const]),
    "left",
  ]
  const activeBorder = Object.fromEntries(activeEdges
    .filter((edge) => plan.border[edge].style !== "none")
    .map((edge) => [edge, plan.border[edge]])) as Partial<
      Record<VNextAuthoredBoxEdgeV1, VNextAuthoredBoxBorderSideV1>
    >
  activeEdges.forEach((edge) => {
    const side = plan.border[edge]
    if (side.style === "none") return
    const lineBounds = borderLineBounds(bounds, edge, activeBorder)
    const positiveLength = lineBounds != null && (
      (lineBounds.widthPt > 0 && lineBounds.heightPt === 0)
      || (lineBounds.widthPt === 0 && lineBounds.heightPt > 0)
    )
    if (!positiveLength || lineBounds == null) {
      issues.push(issue(
        "authored-box-border-length-nonpositive",
        `fragments.${fragmentId}.border.${edge}`,
        `box "${boxId}" has no positive ${edge} border length inside the fragment`,
        { ownerNodeId: plan.ownerNodeId, pageIndex },
      ))
      return
    }
    intents.push({
      intentId: `${fragmentId}:border:${edge}`,
      kind: "stroke-line",
      edge,
      bounds: lineBounds,
      color: side.color,
      opacity: 1,
      widthPt: side.widthPt,
      style: side.style,
    })
  })
  return intents
}

export function projectVNextAuthoredBoxFragmentsV1(input: {
  boxId: string
  plan: VNextAuthoredBoxPlanV1
  placements: readonly VNextAuthoredBoxPlacementV1[]
}): VNextAuthoredBoxProjectionResultV1 {
  const issues: VNextAuthoredBoxIssueV1[] = []
  const boxId = input.boxId
  if (boxId.trim().length === 0) issues.push(issue(
    "authored-box-id-missing",
    "boxId",
    "authored box projection requires a nonblank box id",
  ))
  if (input.plan.source !== VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE
    || input.plan.contractVersion !== VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION) issues.push(issue(
    "authored-box-plan-unsupported",
    "plan",
    "authored box projection requires a v1 authored-box plan",
    { ownerNodeId: input.plan.ownerNodeId },
  ))
  if (!input.plan.hasAuthoredBox) issues.push(issue(
    "authored-box-style-missing",
    "plan.hasAuthoredBox",
    "fragment projection requires an authored box style",
    { ownerNodeId: input.plan.ownerNodeId },
  ))
  if (input.placements.length === 0) issues.push(issue(
    "authored-box-placement-missing",
    "placements",
    "authored box projection requires at least one placement",
    { ownerNodeId: input.plan.ownerNodeId },
  ))

  const placementIds = new Set<string>()
  input.placements.forEach((placement, placementIndex) => {
    const path = `placements[${placementIndex}]`
    if (placement.placementId.trim().length === 0) issues.push(issue(
      "authored-box-placement-id-missing", `${path}.placementId`, "placement id must be nonblank",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex: placement.pageIndex },
    ))
    if (placementIds.has(placement.placementId)) issues.push(issue(
      "authored-box-placement-id-duplicate", `${path}.placementId`, "placement ids must be unique",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId, pageIndex: placement.pageIndex },
    ))
    placementIds.add(placement.placementId)
    if (!Number.isInteger(placement.pageIndex) || placement.pageIndex < 0
      || !Number.isInteger(placement.pageNumber) || placement.pageNumber <= 0) issues.push(issue(
      "authored-box-placement-page-invalid", path, "placement page index and number must be valid integers",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId },
    ))
    if (!validBounds(placement.containerBounds)) issues.push(issue(
      "authored-box-container-bounds-invalid", `${path}.containerBounds`, "container bounds must be positive and finite",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId, pageIndex: placement.pageIndex },
    ))
    if (!Number.isFinite(placement.blockOffsetPt) || placement.blockOffsetPt < 0
      || !Number.isFinite(placement.blockExtentPt) || placement.blockExtentPt <= 0) issues.push(issue(
      "authored-box-placement-extent-invalid", path, "placement offset must be nonnegative and extent must be positive",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId, pageIndex: placement.pageIndex },
    ))
    if (validBounds(placement.containerBounds)
      && placement.blockOffsetPt + placement.blockExtentPt > placement.containerBounds.heightPt + 0.001) issues.push(issue(
      "authored-box-placement-out-of-container", path, "placement extent must stay inside its container",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId, pageIndex: placement.pageIndex },
    ))
    if (validBounds(placement.containerBounds)
      && !near(placement.containerBounds.widthPt, input.plan.outerWidthPt)) issues.push(issue(
      "authored-box-container-width-mismatch", `${path}.containerBounds.widthPt`, "container width must match the box plan outer width",
      { ownerNodeId: input.plan.ownerNodeId, placementId: placement.placementId, pageIndex: placement.pageIndex },
    ))
  })
  if (issues.length > 0) return blockedProjection(boxId, input.plan.fingerprint, issues)

  const placements = [...input.placements].sort((left, right) => (
    left.pageIndex - right.pageIndex
    || left.blockOffsetPt - right.blockOffsetPt
    || left.placementId.localeCompare(right.placementId)
  ))
  const starts = placements.filter((placement) => placement.startsBox)
  const ends = placements.filter((placement) => placement.endsBox)
  if (starts.length !== 1 || starts[0] !== placements[0]) issues.push(issue(
    "authored-box-start-boundary-invalid",
    "placements",
    "exactly the first ordered placement must start the box",
    { ownerNodeId: input.plan.ownerNodeId },
  ))
  if (ends.length !== 1 || ends[0] !== placements[placements.length - 1]) issues.push(issue(
    "authored-box-end-boundary-invalid",
    "placements",
    "exactly the last ordered placement must end the box",
    { ownerNodeId: input.plan.ownerNodeId },
  ))
  const pageIndexes = [...new Set(placements.map((placement) => placement.pageIndex))]
  const pageNumbers = pageIndexes.map((pageIndex) => (
    placements.find((placement) => placement.pageIndex === pageIndex)?.pageNumber as number
  ))
  pageIndexes.forEach((pageIndex, index) => {
    if (index > 0 && pageIndex !== pageIndexes[index - 1] + 1) issues.push(issue(
      "authored-box-page-gap",
      "placements",
      "authored box fragments must occupy consecutive page indexes",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex },
    ))
    if (index > 0 && pageNumbers[index] !== pageNumbers[index - 1] + 1) issues.push(issue(
      "authored-box-page-number-gap",
      "placements",
      "authored box fragments must occupy consecutive page numbers",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex },
    ))
  })
  if (issues.length > 0) return blockedProjection(boxId, input.plan.fingerprint, issues)

  const fragments: VNextAuthoredBoxFragmentV1[] = []
  pageIndexes.forEach((pageIndex, fragmentIndex) => {
    const pagePlacements = placements.filter((placement) => placement.pageIndex === pageIndex)
    const container = pagePlacements[0].containerBounds
    if (pagePlacements.some((placement) => !sameBounds(placement.containerBounds, container))) {
      issues.push(issue(
        "authored-box-page-container-mismatch",
        `fragments[${fragmentIndex}].containerBounds`,
        "placements on one box page must share exact container bounds",
        { ownerNodeId: input.plan.ownerNodeId, pageIndex },
      ))
      return
    }
    const pageNumber = pagePlacements[0].pageNumber
    if (pagePlacements.some((placement) => placement.pageNumber !== pageNumber)) {
      issues.push(issue(
        "authored-box-page-number-mismatch",
        `fragments[${fragmentIndex}].pageNumber`,
        "placements on one box page must share the same page number",
        { ownerNodeId: input.plan.ownerNodeId, pageIndex },
      ))
      return
    }
    const startsBox = pagePlacements.some((placement) => placement.startsBox)
    const endsBox = pagePlacements.some((placement) => placement.endsBox)
    const textTopPt = Math.min(...pagePlacements.map((placement) => (
      container.yPt + placement.blockOffsetPt
    )))
    const textBottomPt = Math.max(...pagePlacements.map((placement) => (
      container.yPt + placement.blockOffsetPt + placement.blockExtentPt
    )))
    const topPt = startsBox ? textTopPt - input.plan.contentInsetPt.top : container.yPt
    const bottomPt = endsBox
      ? textBottomPt + input.plan.contentInsetPt.bottom
      : container.yPt + container.heightPt
    if (topPt < container.yPt - 0.001) issues.push(issue(
      "authored-box-leading-reserve-insufficient",
      `fragments[${fragmentIndex}].bounds.yPt`,
      "layout placement does not reserve authored top padding and border width",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex },
    ))
    if (bottomPt > container.yPt + container.heightPt + 0.001) issues.push(issue(
      "authored-box-trailing-reserve-insufficient",
      `fragments[${fragmentIndex}].bounds.heightPt`,
      "layout placement does not reserve authored bottom padding and border width",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex },
    ))
    const bounds = {
      xPt: roundPt(container.xPt),
      yPt: roundPt(topPt),
      widthPt: roundPt(container.widthPt),
      heightPt: roundPt(bottomPt - topPt),
    }
    if (!validBounds(bounds)) issues.push(issue(
      "authored-box-fragment-bounds-invalid",
      `fragments[${fragmentIndex}].bounds`,
      "projected authored box fragment must have positive finite bounds",
      { ownerNodeId: input.plan.ownerNodeId, pageIndex },
    ))
    if (issues.length > 0) return

    const fragmentId = `${boxId}:page-${pageNumber}`
    const continuesFromPreviousPage = fragmentIndex > 0
    const continuesOnNextPage = fragmentIndex < pageIndexes.length - 1
    const intents = paintIntents(
      boxId,
      fragmentId,
      bounds,
      input.plan,
      continuesFromPreviousPage,
      continuesOnNextPage,
      issues,
      pageIndex,
    )
    const fragmentFacts = {
      fragmentId,
      boxId,
      pageIndex,
      pageNumber,
      continuesFromPreviousPage,
      continuesOnNextPage,
      sourcePlacementIds: pagePlacements.map((placement) => placement.placementId),
      bounds,
      contentXPt: roundPt(bounds.xPt + input.plan.contentInsetPt.left),
      contentWidthPt: input.plan.contentWidthPt,
      paintIntents: intents,
    }
    fragments.push({
      ...fragmentFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(fragmentFacts)),
    })
  })
  if (issues.length > 0) return blockedProjection(boxId, input.plan.fingerprint, issues)

  const summary = {
    placementCount: placements.length,
    pageCount: pageIndexes.length,
    fragmentCount: fragments.length,
    fillIntentCount: fragments.reduce(
      (sum, fragment) => sum + fragment.paintIntents.filter((intent) => intent.kind === "fill-rect").length,
      0,
    ),
    borderIntentCount: fragments.reduce(
      (sum, fragment) => sum + fragment.paintIntents.filter((intent) => intent.kind === "stroke-line").length,
      0,
    ),
  }
  const projectionFacts = {
    source: VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE,
    contractVersion: VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION,
    status: "consumable" as const,
    boxId,
    planFingerprint: input.plan.fingerprint,
    fragments,
    summary,
  }
  return {
    ...projectionFacts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(projectionFacts)),
    issues: [],
  }
}
