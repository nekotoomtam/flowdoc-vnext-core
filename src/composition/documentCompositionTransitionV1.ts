import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  parseVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentPageV1,
  type VNextCompositionFragmentWindowV1,
} from "./fragmentWindowV1.js"
import {
  finalizeVNextDocumentCompositionDemandV1,
  parseVNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionBodyItemV1,
  type VNextDocumentCompositionContractIssueV1,
  type VNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionSectionV1,
} from "./documentCompositionManifestV1.js"
import {
  finalizeVNextDocumentCompositionClosedPageV1,
  finalizeVNextDocumentCompositionOpenPageV1,
  type VNextDocumentCompositionClosedPageV1,
  type VNextDocumentCompositionOpenPageInputV1,
  type VNextDocumentCompositionOpenPageV1,
  type VNextDocumentCompositionPlacementV1,
} from "./documentCompositionPageV1.js"
import {
  finalizeVNextDocumentCompositionCursorV1,
  parseVNextDocumentCompositionStateV1,
  type VNextDocumentCompositionCursorInputV1,
  type VNextDocumentCompositionCursorV1,
} from "./documentCompositionCursorV1.js"

export const VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE = "vnext-document-composition-transition"
export const VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_VERSION = 1 as const

export interface VNextDocumentCompositionTransitionLimitsV1 {
  maximumClosedPageCount: number
  maximumPlacementCount: number
  maximumFamilyPageCount: number
  maximumFamilyFragmentCount: number
}

export interface VNextDocumentCompositionTransitionWorkV1 {
  windowCount: number
  familyPageCount: number
  closedPageCount: number
  placementCount: number
  bodyItemCompletionCount: number
  pageAdvanceCount: number
  cursorCommitCount: number
}

interface AcceptedTransitionBase {
  source: typeof VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE
  contractVersion: typeof VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_VERSION
  kind: "document-composition-transition"
  cursorBeforeFingerprint: string | null
  cursorAfter: VNextDocumentCompositionCursorV1
  openPageAfter: VNextDocumentCompositionOpenPageV1 | null
  closedPages: VNextDocumentCompositionClosedPageV1[]
  work: VNextDocumentCompositionTransitionWorkV1
  fingerprint: string
}

export type VNextDocumentCompositionTransitionResultV1 =
  | (AcceptedTransitionBase & {
      status: "partial"
      reason: "needs-family-window" | "output-limit"
      demand: VNextDocumentCompositionDemandV1 | null
      issues: []
    })
  | (AcceptedTransitionBase & {
      status: "complete"
      reason: "document-complete"
      demand: null
      issues: []
    })
  | {
      source: typeof VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE
      contractVersion: typeof VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_VERSION
      kind: "document-composition-transition"
      status: "blocked"
      reason: "invalid-input" | "window-rejected" | "unsupported-window-state" | "limit-exceeded"
      cursorBefore: VNextDocumentCompositionCursorV1 | null
      cursorAfter: null
      openPageAfter: null
      closedPages: null
      demand: null
      work: VNextDocumentCompositionTransitionWorkV1
      issues: VNextDocumentCompositionContractIssueV1[]
      fingerprint: string
    }

interface MutableState {
  manifest: VNextDocumentCompositionManifestV1
  cursor: VNextDocumentCompositionCursorV1
  openPage: VNextDocumentCompositionOpenPageV1 | null
  closedPrefix: VNextDocumentCompositionCursorV1["closedPrefix"]
  cumulativeWork: VNextDocumentCompositionCursorV1["cumulativeWork"]
  closedPages: VNextDocumentCompositionClosedPageV1[]
  work: VNextDocumentCompositionTransitionWorkV1
}

type CompleteFragmentWindow = VNextCompositionFragmentWindowV1 & {
  status: "complete"
  cursorAfter: VNextCompositionFamilyCursorRefV1
  pages: VNextCompositionFragmentPageV1[]
}

const zeroWork = (): VNextDocumentCompositionTransitionWorkV1 => ({
  windowCount: 0,
  familyPageCount: 0,
  closedPageCount: 0,
  placementCount: 0,
  bodyItemCompletionCount: 0,
  pageAdvanceCount: 0,
  cursorCommitCount: 0,
})

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function issue(code: string, path: string, message: string): VNextDocumentCompositionContractIssueV1 {
  return { code, severity: "error", path, message }
}

function validLimits(limits: VNextDocumentCompositionTransitionLimitsV1): boolean {
  return Number.isInteger(limits.maximumClosedPageCount) && limits.maximumClosedPageCount > 0
    && Number.isInteger(limits.maximumPlacementCount) && limits.maximumPlacementCount > 0
    && Number.isInteger(limits.maximumFamilyPageCount) && limits.maximumFamilyPageCount > 0
    && limits.maximumFamilyPageCount <= 10_000
    && Number.isInteger(limits.maximumFamilyFragmentCount) && limits.maximumFamilyFragmentCount > 0
    && limits.maximumFamilyFragmentCount <= 100_000
}

function resultFingerprint(value: object): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

function blocked(
  reason: Extract<VNextDocumentCompositionTransitionResultV1, { status: "blocked" }>["reason"],
  cursorBefore: VNextDocumentCompositionCursorV1 | null,
  issues: VNextDocumentCompositionContractIssueV1[],
): VNextDocumentCompositionTransitionResultV1 {
  const facts = {
    source: VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE as typeof VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE,
    contractVersion: VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_VERSION,
    kind: "document-composition-transition" as const,
    status: "blocked" as const,
    reason,
    cursorBefore: cursorBefore == null ? null : clone(cursorBefore),
    cursorAfter: null,
    openPageAfter: null,
    closedPages: null,
    demand: null,
    work: zeroWork(),
    issues: clone(issues),
  }
  return { ...facts, fingerprint: resultFingerprint(facts) }
}

function accepted(
  state: MutableState,
  reason: "needs-family-window" | "output-limit" | "document-complete",
  demand: VNextDocumentCompositionDemandV1 | null,
  cursorBeforeFingerprint: string | null,
): VNextDocumentCompositionTransitionResultV1 {
  const status = reason === "document-complete" ? "complete" as const : "partial" as const
  const facts = {
    source: VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_SOURCE,
    contractVersion: VNEXT_DOCUMENT_COMPOSITION_TRANSITION_V1_VERSION,
    kind: "document-composition-transition" as const,
    status,
    reason,
    cursorBeforeFingerprint,
    cursorAfter: clone(state.cursor),
    openPageAfter: state.openPage == null ? null : clone(state.openPage),
    closedPages: clone(state.closedPages),
    demand: demand == null ? null : clone(demand),
    work: clone(state.work),
    issues: [] as [],
  }
  return { ...facts, fingerprint: resultFingerprint(facts) } as VNextDocumentCompositionTransitionResultV1
}

function openPageFacts(page: VNextDocumentCompositionOpenPageV1): VNextDocumentCompositionOpenPageInputV1 {
  const { fingerprint: _fingerprint, ...facts } = page
  return clone(facts)
}

function makeOpenPage(
  manifest: VNextDocumentCompositionManifestV1,
  section: VNextDocumentCompositionSectionV1,
  pageIndex: number,
  sectionPageIndex: number,
  prefix: VNextDocumentCompositionCursorV1["closedPrefix"],
): VNextDocumentCompositionOpenPageV1 {
  const result = finalizeVNextDocumentCompositionOpenPageV1({
    source: "vnext-document-composition-open-page",
    contractVersion: 1,
    kind: "document-composition-open-page",
    documentId: manifest.documentId,
    manifestFingerprint: manifest.fingerprint,
    pageIndex,
    pageNumber: pageIndex + 1,
    sectionIndex: section.sectionIndex,
    sectionId: section.sectionId,
    sectionPageIndex,
    pageGeometry: section.pageGeometry,
    staticZones: section.staticZones,
    placements: [],
    usedHeightPt: 0,
    remainingHeightPt: section.pageGeometry.bodyHeightPt,
    intentionalBlank: false,
    previousClosedPagePrefixFingerprint: prefix.fingerprint,
    closedPageCountBefore: prefix.pageCount,
    closedPlacementCountBefore: prefix.placementCount,
    closedHeadingCountBefore: prefix.headingCount,
  })
  if (result.status === "blocked") throw new Error(`internal open-page construction failed: ${result.issues[0]?.code}`)
  return result.page
}

function buildCursor(state: MutableState, input: {
  sectionIndex: number
  bodyItemIndex: number
  activeRoot: VNextDocumentCompositionCursorInputV1["activeRoot"]
  openPage: VNextDocumentCompositionOpenPageV1 | null
  closedPrefix: VNextDocumentCompositionCursorInputV1["closedPrefix"]
  complete: boolean
  cumulativeWork: VNextDocumentCompositionCursorInputV1["cumulativeWork"]
}): VNextDocumentCompositionCursorV1 {
  const page = input.openPage
  const result = finalizeVNextDocumentCompositionCursorV1({
    source: "vnext-document-composition-cursor",
    contractVersion: 1,
    kind: "document-composition-cursor",
    documentId: state.manifest.documentId,
    manifestFingerprint: state.manifest.fingerprint,
    sectionIndex: input.sectionIndex,
    bodyItemIndex: input.bodyItemIndex,
    activeRoot: input.activeRoot,
    nextPageIndex: page == null ? input.closedPrefix.pageCount : page.pageIndex + 1,
    currentPage: page == null ? null : {
      pageIndex: page.pageIndex,
      sectionPageIndex: page.sectionPageIndex,
      usedHeightPt: page.usedHeightPt,
      remainingHeightPt: page.remainingHeightPt,
    },
    openPageFingerprint: page?.fingerprint ?? null,
    closedPrefix: input.closedPrefix,
    cumulativeWork: input.cumulativeWork,
    complete: input.complete,
  })
  if (result.status === "blocked") throw new Error(`internal cursor construction failed: ${result.issues[0]?.code}`)
  return result.cursor
}

function closePage(
  state: MutableState,
  reason: VNextDocumentCompositionClosedPageV1["closeReason"],
  limits: VNextDocumentCompositionTransitionLimitsV1,
  intentionalBlank = false,
): boolean {
  if (state.openPage == null || state.closedPages.length >= limits.maximumClosedPageCount) return false
  const facts = openPageFacts(state.openPage)
  const result = finalizeVNextDocumentCompositionClosedPageV1({
    ...facts,
    source: "vnext-document-composition-closed-page",
    kind: "document-composition-closed-page",
    intentionalBlank,
    closeReason: reason,
  })
  if (result.status === "blocked") throw new Error(`internal closed-page construction failed: ${result.issues[0]?.code}`)
  const page = result.page
  state.closedPages.push(page)
  state.work.closedPageCount += 1
  state.work.pageAdvanceCount += 1
  const headingCount = page.placements.reduce((count, placement) => count + (placement.heading == null ? 0 : 1), 0)
  const prefix = {
    fingerprint: page.closedPagePrefixFingerprint,
    pageCount: page.pageIndex + 1,
    placementCount: page.closedPlacementCountBefore + page.placements.length,
    headingCount: page.closedHeadingCountBefore + headingCount,
  }
  state.closedPrefix = prefix
  state.cumulativeWork = {
    ...state.cumulativeWork,
    pageAdvances: state.cumulativeWork.pageAdvances + 1,
  }
  state.openPage = null
  return true
}

function openSectionPage(state: MutableState, sectionIndex: number, sectionPageIndex: number): void {
  const section = state.manifest.sections[sectionIndex]
  if (section == null) throw new Error("internal section index out of range")
  state.openPage = makeOpenPage(
    state.manifest,
    section,
    state.closedPrefix.pageCount,
    sectionPageIndex,
    state.closedPrefix,
  )
  state.cursor = buildCursor(state, {
    sectionIndex,
    bodyItemIndex: state.cursor.bodyItemIndex,
    activeRoot: null,
    openPage: state.openPage,
    closedPrefix: state.closedPrefix,
    complete: false,
    cumulativeWork: state.cumulativeWork,
  })
}

function activateItem(state: MutableState, item: VNextDocumentCompositionBodyItemV1): void {
  state.cursor = buildCursor(state, {
    sectionIndex: item.sectionIndex,
    bodyItemIndex: item.itemIndex,
    activeRoot: {
      itemIndex: item.itemIndex,
      rootNodeId: item.rootNodeId,
      family: item.family,
      familyCursor: item.initialCursor,
    },
    openPage: state.openPage,
    closedPrefix: state.closedPrefix,
    complete: false,
    cumulativeWork: state.cumulativeWork,
  })
}

function createDemand(
  state: MutableState,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): VNextDocumentCompositionDemandV1 {
  const active = state.cursor.activeRoot
  const page = state.openPage
  const item = state.manifest.bodyItems[state.cursor.bodyItemIndex]
  if (active == null || page == null || item == null) throw new Error("internal demand state is incomplete")
  const remainingDocumentPages = state.manifest.limits.maximumDocumentPageCount - state.closedPrefix.pageCount
  const remainingDocumentPlacements = state.manifest.limits.maximumDocumentPlacementCount
    - state.cumulativeWork.placementsAccepted
  const result = finalizeVNextDocumentCompositionDemandV1({
    source: "vnext-document-composition-demand",
    contractVersion: 1,
    kind: "document-composition-demand",
    documentId: state.manifest.documentId,
    manifestFingerprint: state.manifest.fingerprint,
    itemIndex: item.itemIndex,
    sectionIndex: item.sectionIndex,
    sectionId: item.sectionId,
    zoneId: item.zoneId,
    sourceOrder: item.sourceOrder,
    rootNodeId: item.rootNodeId,
    rootNodeType: item.rootNodeType,
    family: item.family,
    ownerPins: item.ownerPins,
    cursorBefore: active.familyCursor,
    capacity: {
      pageBodyHeightPt: page.pageGeometry.bodyHeightPt,
      firstPageAvailableHeightPt: page.remainingHeightPt,
      maximumPageCount: Math.min(limits.maximumFamilyPageCount, remainingDocumentPages),
      maximumFragmentCount: Math.min(limits.maximumFamilyFragmentCount, Math.max(1, remainingDocumentPlacements)),
    },
  })
  if (result.status === "blocked") throw new Error(`internal demand construction failed: ${result.issues[0]?.code}`)
  return result.demand
}

function normalizeStructure(
  state: MutableState,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): "demand" | "complete" | "output-limit" {
  while (true) {
    const item = state.manifest.bodyItems[state.cursor.bodyItemIndex]
    if (item != null && item.sectionIndex === state.cursor.sectionIndex) {
      activateItem(state, item)
      return "demand"
    }
    if (state.cursor.sectionIndex >= state.manifest.sections.length) return "complete"
    const finalSection = state.cursor.sectionIndex === state.manifest.sections.length - 1
    if (item == null && finalSection) {
      if (!closePage(state, "document-complete", limits)) return "output-limit"
      state.cursor = buildCursor(state, {
        sectionIndex: state.manifest.sections.length,
        bodyItemIndex: state.manifest.bodyItems.length,
        activeRoot: null,
        openPage: null,
        closedPrefix: state.closedPrefix,
        complete: true,
        cumulativeWork: state.cumulativeWork,
      })
      return "complete"
    }
    if (!closePage(state, "section-boundary", limits)) return "output-limit"
    openSectionPage(state, state.cursor.sectionIndex + 1, 0)
  }
}

function validateWindow(
  state: MutableState,
  value: unknown,
  demand: VNextDocumentCompositionDemandV1,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): { window: VNextCompositionFragmentWindowV1; issues: [] } | { window: null; issues: VNextDocumentCompositionContractIssueV1[] } {
  const parsed = parseVNextCompositionFragmentWindowV1(value)
  if (parsed.status === "blocked") return { window: null, issues: parsed.issues }
  const window = parsed.window
  const issues: VNextDocumentCompositionContractIssueV1[] = []
  if (window.documentId !== demand.documentId
    || window.sectionId !== demand.sectionId
    || window.zoneId !== demand.zoneId
    || window.sourceOrder !== demand.sourceOrder
    || window.rootNodeId !== demand.rootNodeId
    || window.rootNodeType !== demand.rootNodeType
    || window.family !== demand.family) issues.push(issue(
    "composition-window-identity-mismatch",
    "window",
    "family window must match the exact demanded body item",
  ))
  const stablePins = {
    documentStructure: window.ownerPins.documentStructure,
    resolvedProjection: window.ownerPins.resolvedProjection,
    familySource: window.ownerPins.familySource,
    measurement: window.ownerPins.measurement,
  }
  if (!exact(stablePins, demand.ownerPins)) issues.push(issue(
    "composition-window-stable-owner-mismatch",
    "window.ownerPins",
    "family window must pin the exact demanded stable owners",
  ))
  if (!exact(window.cursorBefore, demand.cursorBefore)) issues.push(issue(
    "composition-window-cursor-mismatch",
    "window.cursorBefore",
    "family window must start at the exact demanded cursor",
  ))
  if (!near(window.capacity.pageBodyHeightPt, demand.capacity.pageBodyHeightPt)
    || !near(window.capacity.firstPageAvailableHeightPt, demand.capacity.firstPageAvailableHeightPt)
    || window.capacity.maximumPageCount !== demand.capacity.maximumPageCount
    || window.capacity.maximumFragmentCount !== demand.capacity.maximumFragmentCount) issues.push(issue(
    "composition-window-capacity-mismatch",
    "window.capacity",
    "family window must use the exact demanded capacity and bounds",
  ))
  const pageCount = window.pages?.length ?? 0
  const fragmentCount = window.pages?.reduce((count, page) => count + page.fragments.length, 0) ?? 0
  const remainingDocumentPlacements = state.manifest.limits.maximumDocumentPlacementCount
    - state.cumulativeWork.placementsAccepted
  if (pageCount > limits.maximumFamilyPageCount || fragmentCount > limits.maximumPlacementCount
    || fragmentCount > limits.maximumFamilyFragmentCount
    || fragmentCount > remainingDocumentPlacements) issues.push(issue(
    "composition-window-transition-limit-exceeded",
    "window.work",
    "family window work exceeds transition limits",
  ))
  if (window.status === "complete" && window.pages != null) {
    const forced = window.pages.some((page) => page.flowEffect === "force-page-advance")
    const requiredClosedPages = forced ? 1 : Math.max(0, window.pages.length - 1)
    if (requiredClosedPages > limits.maximumClosedPageCount) issues.push(issue(
      "composition-window-closed-page-limit-exceeded",
      "window.pages",
      "family window cannot commit atomically inside the closed-page output limit",
    ))
  }
  return issues.length > 0 ? { window: null, issues } : { window, issues: [] }
}

function projectContentWindow(
  state: MutableState,
  window: CompleteFragmentWindow,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): void {
  const item = state.manifest.bodyItems[state.cursor.bodyItemIndex]
  if (item == null || state.openPage == null) throw new Error("internal content projection state missing")
  window.pages.forEach((familyPage, pageIndex) => {
    if (state.openPage == null) throw new Error("internal open page missing")
    const pageBefore = state.openPage
    const baseOffset = pageBefore.usedHeightPt
    const placements: VNextDocumentCompositionPlacementV1[] = familyPage.fragments.map((fragment, fragmentIndex) => ({
      placementIndex: pageBefore.placements.length + fragmentIndex,
      itemIndex: item.itemIndex,
      sectionId: item.sectionId,
      zoneId: item.zoneId,
      sourceOrder: item.sourceOrder,
      rootNodeId: item.rootNodeId,
      rootNodeType: item.rootNodeType,
      family: item.family,
      fragmentId: fragment.fragmentId,
      fragmentIndex: fragment.fragmentIndex,
      sourceNodeId: fragment.sourceNodeId,
      blockOffsetPt: baseOffset + fragment.blockOffsetPt,
      blockExtentPt: fragment.blockExtentPt,
      continuation: fragment.continuation,
      familyEvidenceFingerprint: fragment.familyEvidenceFingerprint,
      familyWindowFingerprint: window.fingerprint,
      heading: fragment.heading,
    }))
    const pageFacts = openPageFacts(pageBefore)
    const nextOpen = finalizeVNextDocumentCompositionOpenPageV1({
      ...pageFacts,
      placements: [...pageFacts.placements, ...placements],
      usedHeightPt: baseOffset + familyPage.usedHeightPt,
      remainingHeightPt: familyPage.remainingHeightPt,
    })
    if (nextOpen.status === "blocked") throw new Error(`internal projected open page failed: ${nextOpen.issues[0]?.code}`)
    state.openPage = nextOpen.page
    state.work.familyPageCount += 1
    state.work.placementCount += placements.length
    if (pageIndex < window.pages.length - 1) {
      if (!closePage(state, "family-page-boundary", limits)) throw new Error("internal family page limit drift")
      openSectionPage(state, item.sectionIndex, pageBefore.sectionPageIndex + 1)
    }
  })
}

function projectForcePageWindow(
  state: MutableState,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): void {
  if (state.openPage == null) throw new Error("internal page-break open page missing")
  const sectionIndex = state.cursor.sectionIndex
  const sectionPageIndex = state.openPage.sectionPageIndex
  const intentionalBlank = state.openPage.placements.length === 0 && near(state.openPage.usedHeightPt, 0)
  if (!closePage(state, "page-break", limits, intentionalBlank)) throw new Error("internal page-break limit drift")
  openSectionPage(state, sectionIndex, sectionPageIndex + 1)
  state.work.familyPageCount += 1
}

function applyCompleteWindow(
  state: MutableState,
  window: CompleteFragmentWindow,
  limits: VNextDocumentCompositionTransitionLimitsV1,
): void {
  const forcePage = window.pages.length === 1 && window.pages[0].flowEffect === "force-page-advance"
  if (forcePage) projectForcePageWindow(state, limits)
  else projectContentWindow(state, window, limits)

  const nextItemIndex = state.cursor.bodyItemIndex + 1
  const cumulativeWork = {
    ...state.cumulativeWork,
    windowsAccepted: state.cumulativeWork.windowsAccepted + 1,
    familyPagesConsumed: state.cumulativeWork.familyPagesConsumed + window.pages.length,
    placementsAccepted: state.cumulativeWork.placementsAccepted + window.work.fragmentCount,
    bodyItemsCompleted: nextItemIndex,
    cursorCommits: state.cumulativeWork.cursorCommits + window.work.cursorCommitCount,
  }
  state.cumulativeWork = cumulativeWork
  state.work.windowCount = 1
  state.work.bodyItemCompletionCount = 1
  state.work.cursorCommitCount = window.work.cursorCommitCount
  state.cursor = buildCursor(state, {
    sectionIndex: state.cursor.sectionIndex,
    bodyItemIndex: nextItemIndex,
    activeRoot: null,
    openPage: state.openPage,
    closedPrefix: state.closedPrefix,
    complete: false,
    cumulativeWork,
  })
}

function initialMutableState(manifest: VNextDocumentCompositionManifestV1): MutableState {
  const emptyPrefix = { fingerprint: null, pageCount: 0, placementCount: 0, headingCount: 0 }
  const section = manifest.sections[0]
  const placeholderCursor = finalizeVNextDocumentCompositionCursorV1({
    source: "vnext-document-composition-cursor",
    contractVersion: 1,
    kind: "document-composition-cursor",
    documentId: manifest.documentId,
    manifestFingerprint: manifest.fingerprint,
    sectionIndex: 0,
    bodyItemIndex: 0,
    activeRoot: null,
    nextPageIndex: 1,
    currentPage: { pageIndex: 0, sectionPageIndex: 0, usedHeightPt: 0, remainingHeightPt: section.pageGeometry.bodyHeightPt },
    openPageFingerprint: createVNextCompactFingerprint("placeholder-open-page"),
    closedPrefix: emptyPrefix,
    cumulativeWork: {
      windowsAccepted: 0, familyPagesConsumed: 0, placementsAccepted: 0,
      bodyItemsCompleted: 0, pageAdvances: 0, cursorCommits: 0,
    },
    complete: false,
  })
  if (placeholderCursor.status === "blocked") throw new Error("internal initial cursor placeholder failed")
  const state: MutableState = {
    manifest,
    cursor: placeholderCursor.cursor,
    openPage: null,
    closedPrefix: emptyPrefix,
    cumulativeWork: placeholderCursor.cursor.cumulativeWork,
    closedPages: [],
    work: zeroWork(),
  }
  state.openPage = makeOpenPage(manifest, section, 0, 0, emptyPrefix)
  state.cursor = buildCursor(state, {
    sectionIndex: 0,
    bodyItemIndex: 0,
    activeRoot: null,
    openPage: state.openPage,
    closedPrefix: emptyPrefix,
    complete: false,
    cumulativeWork: state.cumulativeWork,
  })
  return state
}

export function initializeVNextDocumentCompositionV1(input: {
  manifest: unknown
  limits: VNextDocumentCompositionTransitionLimitsV1
}): VNextDocumentCompositionTransitionResultV1 {
  if (!validLimits(input.limits)) return blocked(
    "invalid-input",
    null,
    [issue("composition-transition-limits-invalid", "limits", "transition limits must be positive bounded integers")],
  )
  const manifestResult = parseVNextDocumentCompositionManifestV1(input.manifest)
  if (manifestResult.status === "blocked") return blocked("invalid-input", null, manifestResult.issues)
  const state = initialMutableState(manifestResult.manifest)
  const normalized = normalizeStructure(state, input.limits)
  if (normalized === "complete") return accepted(state, "document-complete", null, null)
  if (normalized === "output-limit") return accepted(state, "output-limit", null, null)
  return accepted(state, "needs-family-window", createDemand(state, input.limits), null)
}

export function advanceVNextDocumentCompositionV1(input: {
  manifest: unknown
  cursor: unknown
  openPage: unknown | null
  window: unknown | null
  limits: VNextDocumentCompositionTransitionLimitsV1
}): VNextDocumentCompositionTransitionResultV1 {
  if (!validLimits(input.limits)) return blocked(
    "invalid-input",
    null,
    [issue("composition-transition-limits-invalid", "limits", "transition limits must be positive bounded integers")],
  )
  const parsedState = parseVNextDocumentCompositionStateV1({
    manifest: input.manifest,
    cursor: input.cursor,
    openPage: input.openPage,
  })
  if (parsedState.status === "blocked") return blocked("invalid-input", null, parsedState.issues)
  const state: MutableState = {
    manifest: parsedState.manifest,
    cursor: parsedState.cursor,
    openPage: parsedState.openPage,
    closedPrefix: parsedState.cursor.closedPrefix,
    cumulativeWork: parsedState.cursor.cumulativeWork,
    closedPages: [],
    work: zeroWork(),
  }
  const cursorBefore = state.cursor
  if (cursorBefore.complete) return accepted(state, "document-complete", null, cursorBefore.fingerprint)

  if (state.cursor.activeRoot == null) {
    if (input.window != null) return blocked(
      "window-rejected",
      cursorBefore,
      [issue("composition-window-unexpected", "window", "window cannot be supplied without an active demanded root")],
    )
    const normalized = normalizeStructure(state, input.limits)
    if (normalized === "complete") return accepted(state, "document-complete", null, cursorBefore.fingerprint)
    if (normalized === "output-limit") return accepted(state, "output-limit", null, cursorBefore.fingerprint)
    return accepted(state, "needs-family-window", createDemand(state, input.limits), cursorBefore.fingerprint)
  }

  const demand = createDemand(state, input.limits)
  if (input.window == null) return accepted(state, "needs-family-window", demand, cursorBefore.fingerprint)
  const validated = validateWindow(state, input.window, demand, input.limits)
  if (validated.window == null) return blocked("window-rejected", cursorBefore, validated.issues)
  if (validated.window.status !== "complete") return blocked(
    "unsupported-window-state",
    cursorBefore,
    [issue(
      "composition-window-state-not-active",
      "window.status",
      `Phase 381 accepts complete windows only; received ${validated.window.status}`,
    )],
  )

  try {
    applyCompleteWindow(state, validated.window as CompleteFragmentWindow, input.limits)
    const normalized = normalizeStructure(state, input.limits)
    if (normalized === "complete") return accepted(state, "document-complete", null, cursorBefore.fingerprint)
    if (normalized === "output-limit") return accepted(state, "output-limit", null, cursorBefore.fingerprint)
    return accepted(state, "needs-family-window", createDemand(state, input.limits), cursorBefore.fingerprint)
  } catch (error) {
    return blocked(
      "limit-exceeded",
      cursorBefore,
      [issue("composition-transition-commit-failed", "", error instanceof Error ? error.message : "transition commit failed")],
    )
  }
}
