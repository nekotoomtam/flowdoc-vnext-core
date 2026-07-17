import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  finalizeVNextCompositionFragmentWindowV1,
  parseVNextCompositionFragmentWindowV1,
  type VNextCompositionFragmentWindowIssueV1,
  type VNextCompositionFragmentWindowResultV1,
  type VNextCompositionFragmentWindowV1,
} from "./fragmentWindowV1.js"
import {
  finalizeVNextDocumentCompositionDemandV1,
  parseVNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionDemandV1,
} from "./documentCompositionManifestV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE =
  "vnext-document-composition-spacing-bridge"
export const VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION = 1 as const

export type VNextDocumentCompositionSpacingDispositionV1 =
  | "no-gap"
  | "preserve-before-root"
  | "suppress-at-fresh-page"

export interface VNextDocumentCompositionSpacingBridgePlanV1 {
  source: typeof VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE
  contractVersion: typeof VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION
  kind: "document-composition-spacing-bridge-plan"
  pageTopPolicy: "suppress-before-first-fragment"
  gapBeforePt: number
  disposition: VNextDocumentCompositionSpacingDispositionV1
  appliedGapBeforePt: number
  suppressedGapBeforePt: number
  transitionDemand: VNextDocumentCompositionDemandV1
  familyDemand: VNextDocumentCompositionDemandV1
  fingerprint: string
}

export interface VNextDocumentCompositionSpacingBridgeIssueV1 {
  code: string
  severity: "error"
  path: string
  message: string
}

export type VNextDocumentCompositionSpacingBridgePlanResultV1 =
  | { status: "ready"; plan: VNextDocumentCompositionSpacingBridgePlanV1; issues: [] }
  | { status: "blocked"; plan: null; issues: VNextDocumentCompositionSpacingBridgeIssueV1[] }

function clone<T>(value: T): T {
  return structuredClone(value)
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(
  code: string,
  path: string,
  message: string,
): VNextDocumentCompositionSpacingBridgeIssueV1 {
  return { code, severity: "error", path, message }
}

function windowBlocked(
  issues: VNextDocumentCompositionSpacingBridgeIssueV1[],
): VNextCompositionFragmentWindowResultV1 {
  return { status: "blocked", window: null, issues }
}

function planFacts(input: {
  demand: VNextDocumentCompositionDemandV1
  gapBeforePt: number
}): Omit<VNextDocumentCompositionSpacingBridgePlanV1, "fingerprint"> {
  const gapBeforePt = roundPt(input.gapBeforePt)
  const freshPage = near(
    input.demand.capacity.firstPageAvailableHeightPt,
    input.demand.capacity.pageBodyHeightPt,
  )
  const disposition: VNextDocumentCompositionSpacingDispositionV1 = gapBeforePt === 0
    ? "no-gap"
    : freshPage ? "suppress-at-fresh-page" : "preserve-before-root"
  const appliedGapBeforePt = disposition === "preserve-before-root" ? gapBeforePt : 0
  const suppressedGapBeforePt = disposition === "suppress-at-fresh-page" ? gapBeforePt : 0
  const { fingerprint: _demandFingerprint, ...demandFacts } = input.demand
  const familyDemandResult = finalizeVNextDocumentCompositionDemandV1({
    ...demandFacts,
    capacity: {
      ...demandFacts.capacity,
      firstPageAvailableHeightPt: roundPt(Math.max(
        0,
        demandFacts.capacity.firstPageAvailableHeightPt - appliedGapBeforePt,
      )),
    },
  })
  if (familyDemandResult.status === "blocked") {
    throw new Error(`spacing bridge family demand blocked: ${familyDemandResult.issues[0]?.code}`)
  }
  return {
    source: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE,
    contractVersion: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION,
    kind: "document-composition-spacing-bridge-plan",
    pageTopPolicy: "suppress-before-first-fragment",
    gapBeforePt,
    disposition,
    appliedGapBeforePt,
    suppressedGapBeforePt,
    transitionDemand: clone(input.demand),
    familyDemand: familyDemandResult.demand,
  }
}

export function createVNextDocumentCompositionSpacingBridgePlanV1(input: {
  demand: unknown
  gapBeforePt: number
}): VNextDocumentCompositionSpacingBridgePlanResultV1 {
  const parsedDemand = parseVNextDocumentCompositionDemandV1(input.demand)
  const issues: VNextDocumentCompositionSpacingBridgeIssueV1[] = []
  if (parsedDemand.status === "blocked") issues.push(issue(
    "spacing-bridge-demand-invalid",
    "demand",
    parsedDemand.issues[0]?.message ?? "spacing bridge requires a valid transition demand",
  ))
  if (!Number.isFinite(input.gapBeforePt) || input.gapBeforePt < 0) issues.push(issue(
    "spacing-bridge-gap-invalid",
    "gapBeforePt",
    "gap before the root must be finite and nonnegative",
  ))
  if (issues.length > 0 || parsedDemand.status === "blocked") return { status: "blocked", plan: null, issues }
  const facts = planFacts({ demand: parsedDemand.demand, gapBeforePt: input.gapBeforePt })
  return {
    status: "ready",
    plan: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextDocumentCompositionSpacingBridgePlanV1(
  value: unknown,
): VNextDocumentCompositionSpacingBridgePlanResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked",
    plan: null,
    issues: [issue("spacing-bridge-plan-invalid", "", "spacing bridge plan must be an object")],
  }
  const candidate = value as Partial<VNextDocumentCompositionSpacingBridgePlanV1>
  const parsedDemand = parseVNextDocumentCompositionDemandV1(candidate.transitionDemand)
  if (parsedDemand.status === "blocked" || typeof candidate.gapBeforePt !== "number") return {
    status: "blocked",
    plan: null,
    issues: [issue(
      "spacing-bridge-plan-invalid",
      "transitionDemand",
      "spacing bridge plan must retain a valid transition demand and numeric gap",
    )],
  }
  const expected = createVNextDocumentCompositionSpacingBridgePlanV1({
    demand: parsedDemand.demand,
    gapBeforePt: candidate.gapBeforePt,
  })
  if (expected.status === "blocked") return expected
  if (!exact(candidate, expected.plan)) return {
    status: "blocked",
    plan: null,
    issues: [issue(
      "spacing-bridge-plan-drift",
      "",
      "spacing bridge plan differs from its deterministic demand and gap facts",
    )],
  }
  return { status: "ready", plan: expected.plan, issues: [] }
}

function familyWindowIssues(
  plan: VNextDocumentCompositionSpacingBridgePlanV1,
  window: VNextCompositionFragmentWindowV1,
): VNextDocumentCompositionSpacingBridgeIssueV1[] {
  const demand = plan.familyDemand
  const issues: VNextDocumentCompositionSpacingBridgeIssueV1[] = []
  if (window.documentId !== demand.documentId
    || window.sectionId !== demand.sectionId
    || window.zoneId !== demand.zoneId
    || window.sourceOrder !== demand.sourceOrder
    || window.rootNodeId !== demand.rootNodeId
    || window.rootNodeType !== demand.rootNodeType
    || window.family !== demand.family) issues.push(issue(
    "spacing-bridge-family-window-identity-mismatch",
    "familyWindow",
    "family window must match the spacing-adjusted demand identity",
  ))
  const stablePins = {
    documentStructure: window.ownerPins.documentStructure,
    resolvedProjection: window.ownerPins.resolvedProjection,
    familySource: window.ownerPins.familySource,
    measurement: window.ownerPins.measurement,
  }
  if (!exact(stablePins, demand.ownerPins)) issues.push(issue(
    "spacing-bridge-family-window-owner-mismatch",
    "familyWindow.ownerPins",
    "family window must retain the spacing-adjusted demand stable owners",
  ))
  if (!exact(window.capacity, demand.capacity)) issues.push(issue(
    "spacing-bridge-family-window-capacity-mismatch",
    "familyWindow.capacity",
    "family window must use the spacing-adjusted demand capacity and bounds",
  ))
  if (!exact(window.cursorBefore, demand.cursorBefore)) issues.push(issue(
    "spacing-bridge-family-window-cursor-mismatch",
    "familyWindow.cursorBefore",
    "family window must start at the spacing-adjusted demand cursor",
  ))
  return issues
}

function bridgePaginationFingerprint(
  plan: VNextDocumentCompositionSpacingBridgePlanV1,
  familyWindow: VNextCompositionFragmentWindowV1,
): string {
  return createVNextCompactFingerprint(JSON.stringify({
    source: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_SOURCE,
    contractVersion: VNEXT_DOCUMENT_COMPOSITION_SPACING_BRIDGE_V1_VERSION,
    planFingerprint: plan.fingerprint,
    familyWindowFingerprint: familyWindow.fingerprint,
  }))
}

export function bridgeVNextDocumentCompositionSpacingWindowV1(input: {
  plan: unknown
  familyWindow: unknown
}): VNextCompositionFragmentWindowResultV1 {
  const parsedPlan = parseVNextDocumentCompositionSpacingBridgePlanV1(input.plan)
  if (parsedPlan.status === "blocked") return windowBlocked(parsedPlan.issues)
  const parsedWindow = parseVNextCompositionFragmentWindowV1(input.familyWindow)
  if (parsedWindow.status === "blocked") return windowBlocked([issue(
    "spacing-bridge-family-window-invalid",
    "familyWindow",
    parsedWindow.issues[0]?.message ?? "spacing bridge requires a valid family window",
  )])
  const plan = parsedPlan.plan
  const familyWindow = parsedWindow.window
  const issues = familyWindowIssues(plan, familyWindow)
  if (issues.length > 0) return windowBlocked(issues)

  const base = {
    source: familyWindow.source,
    contractVersion: familyWindow.contractVersion,
    kind: familyWindow.kind,
    family: familyWindow.family,
    documentId: familyWindow.documentId,
    sectionId: familyWindow.sectionId,
    zoneId: familyWindow.zoneId,
    rootNodeId: familyWindow.rootNodeId,
    rootNodeType: familyWindow.rootNodeType,
    sourceOrder: familyWindow.sourceOrder,
    ownerPins: {
      ...familyWindow.ownerPins,
      pagination: bridgePaginationFingerprint(plan, familyWindow),
    },
    capacity: clone(plan.transitionDemand.capacity),
    cursorBefore: clone(familyWindow.cursorBefore),
    work: clone(familyWindow.work),
  }

  if (familyWindow.status === "blocked") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "blocked",
    cursorAfter: null,
    pages: null,
    issues: clone(familyWindow.issues),
  })
  if (familyWindow.status === "fresh-page-required") return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: "fresh-page-required",
    cursorAfter: clone(familyWindow.cursorAfter),
    pages: [],
    issues: [],
  })

  const pages = clone(familyWindow.pages)
  if (plan.appliedGapBeforePt > 0) {
    const firstPage = pages[0]
    if (firstPage == null
      || firstPage.flowEffect !== "place-content"
      || firstPage.fragments.length === 0) return windowBlocked([issue(
      "spacing-bridge-gap-owner-invalid",
      "familyWindow.pages[0]",
      "a preserved gap requires a first-page content fragment owned by the demanded root",
    )])
    firstPage.availableHeightPt = plan.transitionDemand.capacity.firstPageAvailableHeightPt
    firstPage.usedHeightPt = roundPt(firstPage.usedHeightPt + plan.appliedGapBeforePt)
    firstPage.fragments = firstPage.fragments.map((fragment) => ({
      ...fragment,
      blockOffsetPt: roundPt(fragment.blockOffsetPt + plan.appliedGapBeforePt),
    }))
  }
  return finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status: familyWindow.status,
    cursorAfter: clone(familyWindow.cursorAfter),
    pages,
    issues: [],
  })
}
