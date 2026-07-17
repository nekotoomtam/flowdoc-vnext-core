import { createHash } from "node:crypto"
import {
  advanceVNextDocumentCompositionV1,
  bridgeVNextDocumentCompositionSpacingWindowV1,
  createVNextAtomicBlockCompositionWindowV1,
  createVNextAtomicBlockV4CursorFingerprint,
  createVNextDocumentCompositionSpacingBridgePlanV1,
  createVNextTableCompositionWindowV1,
  createVNextTextFlowCompositionWindowV1,
  createVNextTextFlowV4CursorFingerprint,
  finalizeVNextDocumentCompositionV1,
  initializeVNextDocumentCompositionV1,
  paginateVNextAtomicBlockV4,
  paginateVNextTableFlowV4,
  paginateVNextTextFlowV4,
  parseVNextDocumentCompositionPagePlanV1,
  type VNextAtomicBlockV4PaginationCursor,
  type VNextCompositionFragmentWindowV1,
  type VNextDocumentCompositionClosedPageV1,
  type VNextDocumentCompositionCursorV1,
  type VNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionOpenPageV1,
  type VNextDocumentCompositionPagePlanV1,
  type VNextDocumentCompositionTransitionLimitsV1,
  type VNextDocumentCompositionTransitionWorkV1,
  type VNextDocumentV4HeadingPageMap,
  type VNextTableFlowV4PaginationCursor,
  type VNextTextFlowV4PaginationCursor,
} from "@flowdoc/vnext-core"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "./canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportFamilyPaginationInputV1,
  FlowDocCanonicalReportPaginationInputsBundleV1,
} from "./canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "./canonicalReportSectionReconciliation.js"

export const FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION = 1 as const
export const FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_ID =
  "ocr-benchmark-report-pagination-execution-v1" as const

const ACCEPTED_PAGINATION_INPUTS_FINGERPRINT =
  "1980d9fd60f684e49213348120c625b889bcad03c1dbab03e4860d347349f0f4"
const ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT =
  "984e95643d5db71ef32d9fc236c4d466b61d33b9d90bcdac2a217dcc71598028"
const ACCEPTED_SECTION_RECONCILIATION_FINGERPRINT =
  "b3b22197f8f5668cc5c2a9928f610d7f24e77a321bc899bcefdeff259d7e3ab2"
const TARGET_PAGE_COUNT = 12

export interface FlowDocCanonicalReportPaginationExecutionSourceV1 {
  paginationInputs: FlowDocCanonicalReportPaginationInputsBundleV1
  measuredComposition: FlowDocCanonicalReportMeasuredCompositionBundleV1
  sectionReconciliation: FlowDocCanonicalReportSectionReconciliationBundleV1
}

export interface FlowDocCanonicalReportPaginationExecutionLimitsV1 {
  maximumTransitionCount: number
  maximumTransitionsPerSlice: number
  coreTransition: VNextDocumentCompositionTransitionLimitsV1
}

export type FlowDocCanonicalReportActiveFamilyCursorV1 =
  | { family: "text-flow"; itemIndex: number; rootNodeId: string; cursor: VNextTextFlowV4PaginationCursor }
  | { family: "table-flow"; itemIndex: number; rootNodeId: string; cursor: VNextTableFlowV4PaginationCursor }
  | { family: "media-flow"; itemIndex: number; rootNodeId: string; cursor: VNextAtomicBlockV4PaginationCursor }

export interface FlowDocCanonicalReportPaginationExecutionCheckpointV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION
  kind: "canonical-report-pagination-execution-checkpoint"
  sourcePaginationInputsFingerprint: string
  transitionCount: number
  documentCursor: VNextDocumentCompositionCursorV1
  openPage: VNextDocumentCompositionOpenPageV1 | null
  demand: VNextDocumentCompositionDemandV1 | null
  activeFamilyCursor: FlowDocCanonicalReportActiveFamilyCursorV1 | null
  complete: boolean
  fingerprint: string
}

export interface FlowDocCanonicalReportFamilyPaginationTraceV1 {
  itemIndex: number
  rootNodeId: string
  family: "text-flow" | "table-flow" | "media-flow"
  transitionDemandFingerprint: string
  familyDemandFingerprint: string
  gapBeforePt: number
  spacingDisposition: "no-gap" | "preserve-before-root" | "suppress-at-fresh-page"
  appliedGapBeforePt: number
  suppressedGapBeforePt: number
  paginationStatus: "complete" | "partial" | "fresh-page-required"
  paginationFingerprint: string
  paginationPageCount: number
  paginationFragmentCount: number
  paginationWork: Record<string, number>
  repeatedHeaderFragmentCount: number
  familyCursorBeforeStateFingerprint: string
  familyCursorAfterStateFingerprint: string
  familyWindowFingerprint: string
  bridgedWindowFingerprint: string
}

export interface FlowDocCanonicalReportPaginationTransitionTraceV1 {
  transitionIndex: number
  kind: "family-window" | "structure-resume"
  familyExecution: FlowDocCanonicalReportFamilyPaginationTraceV1 | null
  transitionStatus: "partial" | "complete"
  transitionReason: "needs-family-window" | "output-limit" | "document-complete"
  closedPageIndexes: number[]
  cursorBeforeFingerprint: string
  cursorAfterFingerprint: string
  openPageAfterFingerprint: string | null
  transitionWork: VNextDocumentCompositionTransitionWorkV1
  traceFingerprint: string
}

export interface FlowDocCanonicalReportPaginationExecutionSliceV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION
  kind: "canonical-report-pagination-execution-slice"
  status: "partial" | "complete"
  reason: "slice-transition-limit" | "global-transition-limit" | "document-complete"
  checkpointBeforeFingerprint: string
  checkpointAfter: FlowDocCanonicalReportPaginationExecutionCheckpointV1
  closedPages: VNextDocumentCompositionClosedPageV1[]
  traces: FlowDocCanonicalReportPaginationTransitionTraceV1[]
  sliceFingerprint: string
}

export interface FlowDocCanonicalReportPaginationExecutionSliceReceiptV1 {
  sliceIndex: number
  transitionStartIndex: number
  transitionEndIndex: number
  checkpointBeforeFingerprint: string
  checkpointAfterFingerprint: string
  emittedPageIndexes: number[]
  traceFingerprints: string[]
  status: "partial" | "complete"
  reason: FlowDocCanonicalReportPaginationExecutionSliceV1["reason"]
  receiptFingerprint: string
}

export interface FlowDocCanonicalReportPaginationExecutionResultV1 {
  terminalCheckpoint: FlowDocCanonicalReportPaginationExecutionCheckpointV1
  pagePlan: VNextDocumentCompositionPagePlanV1
  headingPageMap: VNextDocumentV4HeadingPageMap
  traces: FlowDocCanonicalReportPaginationTransitionTraceV1[]
  sliceReceipts: FlowDocCanonicalReportPaginationExecutionSliceReceiptV1[]
}

export interface FlowDocCanonicalReportPaginationExecutionBundleV1 {
  contractVersion: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION
  kind: "canonical-report-pagination-execution-bundle"
  phaseId: "PDF-PILOT-08B-R2C-J"
  executionId: typeof FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_ID
  sourcePaginationInputsFingerprint: string
  sourceMeasuredCompositionFingerprint: string
  sourceSectionReconciliationFingerprint: string
  sourceCoreCompositionManifestFingerprint: string
  limits: FlowDocCanonicalReportPaginationExecutionLimitsV1
  terminalCheckpoint: FlowDocCanonicalReportPaginationExecutionCheckpointV1
  corePagePlan: VNextDocumentCompositionPagePlanV1
  headingPageMap: VNextDocumentV4HeadingPageMap
  transitionTraces: FlowDocCanonicalReportPaginationTransitionTraceV1[]
  sliceReceipts: FlowDocCanonicalReportPaginationExecutionSliceReceiptV1[]
  downstreamBlockers: Array<{
    code:
      | "actual-page-number-expansion-pending"
      | "static-zone-paint-plan-pending"
      | "pdf-rendering-not-run"
      | "visual-fidelity-validation-pending"
    blocks: "final-footer-paint" | "renderer-handoff" | "pdf-bytes" | "report-acceptance"
    message: string
  }>
  ownership: {
    paginationExecutionOwns: [
      "bounded-family-pagination",
      "spacing-aware-document-transition",
      "resumable-composition-checkpoints",
      "closed-page-chain",
      "authoritative-page-plan",
      "heading-page-map",
    ]
    paginationExecutionMustNotOwn: [
      "actual-page-number-expansion",
      "static-zone-paint-instances",
      "renderer-display-list",
      "pdf-bytes",
      "visual-fidelity-acceptance",
    ]
  }
  execution: {
    paginationInputs: "consumed"
    familyPagination: "executed-bounded"
    spacingBridge: "executed"
    documentCompositionTransition: "executed-bounded"
    documentCompositionFinalization: "executed"
    pageAssignment: "finalized"
    headingPageMap: "finalized"
    actualPageNumberExpansion: "not-run"
    staticZonePaintPlanning: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    targetPageCount: number
    actualPageCount: number
    targetComparison: "under-target" | "matches-target" | "over-target"
    bodyItemCount: number
    placedRootCount: number
    placementCount: number
    headingCount: number
    transitionCount: number
    familyWindowTransitionCount: number
    structureResumeTransitionCount: number
    textFlowTransitionCount: number
    tableFlowTransitionCount: number
    mediaFlowTransitionCount: number
    freshPageRequiredTransitionCount: number
    appliedSpacingCount: number
    appliedSpacingPt: number
    suppressedPageTopSpacingCount: number
    suppressedPageTopSpacingPt: number
    repeatedHeaderFragmentCount: number
    sliceCount: number
    paginationExecuted: true
    pageAssignmentExecuted: true
    actualPageNumberExpansionExecuted: false
    pdfRendered: false
  }
  bundleFingerprint: string
}

export interface FlowDocCanonicalReportPaginationExecutionIssueV1 {
  code: string
  severity: "error"
  path: string
  message: string
}

export type FlowDocCanonicalReportPaginationExecutionValidationV1 =
  | { status: "valid"; issues: []; summary: FlowDocCanonicalReportPaginationExecutionBundleV1["summary"] }
  | { status: "blocked"; issues: FlowDocCanonicalReportPaginationExecutionIssueV1[]; summary: null }

const DEFAULT_LIMITS: FlowDocCanonicalReportPaginationExecutionLimitsV1 = {
  maximumTransitionCount: 10_000,
  maximumTransitionsPerSlice: 16,
  coreTransition: {
    maximumClosedPageCount: 1,
    maximumPlacementCount: 1,
    maximumFamilyPageCount: 1,
    maximumFamilyFragmentCount: 1,
  },
}

const EXPECTED_OWNERSHIP: FlowDocCanonicalReportPaginationExecutionBundleV1["ownership"] = {
  paginationExecutionOwns: [
    "bounded-family-pagination",
    "spacing-aware-document-transition",
    "resumable-composition-checkpoints",
    "closed-page-chain",
    "authoritative-page-plan",
    "heading-page-map",
  ],
  paginationExecutionMustNotOwn: [
    "actual-page-number-expansion",
    "static-zone-paint-instances",
    "renderer-display-list",
    "pdf-bytes",
    "visual-fidelity-acceptance",
  ],
}

const EXPECTED_EXECUTION: FlowDocCanonicalReportPaginationExecutionBundleV1["execution"] = {
  paginationInputs: "consumed",
  familyPagination: "executed-bounded",
  spacingBridge: "executed",
  documentCompositionTransition: "executed-bounded",
  documentCompositionFinalization: "executed",
  pageAssignment: "finalized",
  headingPageMap: "finalized",
  actualPageNumberExpansion: "not-run",
  staticZonePaintPlanning: "not-run",
  pdfRendering: "not-run",
}

const EXPECTED_BLOCKERS: FlowDocCanonicalReportPaginationExecutionBundleV1["downstreamBlockers"] = [
  {
    code: "actual-page-number-expansion-pending",
    blocks: "final-footer-paint",
    message: "Page assignments are final, but generated footer instances have not expanded each actual page number.",
  },
  {
    code: "static-zone-paint-plan-pending",
    blocks: "renderer-handoff",
    message: "Closed pages retain static-zone evidence, but page-specific header and footer paint instances are not built.",
  },
  {
    code: "pdf-rendering-not-run",
    blocks: "pdf-bytes",
    message: "The authoritative Core page plan has not entered the PDF renderer.",
  },
  {
    code: "visual-fidelity-validation-pending",
    blocks: "report-acceptance",
    message: "No rendered PDF exists for region-aware visual comparison against the reference report.",
  },
]

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function compact(value: unknown): string {
  return `sha256:${sha256(JSON.stringify(value))}`
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function issue(code: string, path: string, message: string): FlowDocCanonicalReportPaginationExecutionIssueV1 {
  return { code, severity: "error", path, message }
}

function withoutFingerprint<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const output = clone(value) as T
  delete output[key]
  return output
}

function validLimits(value: unknown): value is FlowDocCanonicalReportPaginationExecutionLimitsV1 {
  if (!isRecord(value) || !isRecord(value.coreTransition)) return false
  const limits = value as unknown as FlowDocCanonicalReportPaginationExecutionLimitsV1
  return Number.isInteger(limits.maximumTransitionCount)
    && limits.maximumTransitionCount > 0
    && limits.maximumTransitionCount <= 100_000
    && Number.isInteger(limits.maximumTransitionsPerSlice)
    && limits.maximumTransitionsPerSlice > 0
    && limits.maximumTransitionsPerSlice <= 10_000
    && Object.values(limits.coreTransition).every((value) => Number.isInteger(value) && value > 0)
    && limits.coreTransition.maximumClosedPageCount === 1
    && limits.coreTransition.maximumPlacementCount === 1
    && limits.coreTransition.maximumFamilyPageCount === 1
    && limits.coreTransition.maximumFamilyFragmentCount === 1
}

function validateSources(input: FlowDocCanonicalReportPaginationExecutionSourceV1): string[] {
  const errors: string[] = []
  if (input.paginationInputs.bundleFingerprint !== ACCEPTED_PAGINATION_INPUTS_FINGERPRINT) {
    errors.push("R2C-I pagination-input fingerprint drifted")
  }
  if (input.measuredComposition.bundleFingerprint !== ACCEPTED_MEASURED_COMPOSITION_FINGERPRINT) {
    errors.push("R2C-F measured-composition fingerprint drifted")
  }
  if (input.sectionReconciliation.bundleFingerprint !== ACCEPTED_SECTION_RECONCILIATION_FINGERPRINT) {
    errors.push("R2C-H section-reconciliation fingerprint drifted")
  }
  if (input.paginationInputs.sourceMeasuredCompositionFingerprint !== input.measuredComposition.bundleFingerprint) {
    errors.push("R2C-I measured-composition source drifted")
  }
  if (input.paginationInputs.sourceSectionReconciliationFingerprint !== input.sectionReconciliation.bundleFingerprint) {
    errors.push("R2C-I section-reconciliation source drifted")
  }
  if (input.paginationInputs.coreCompositionManifest.bodyItems.length !== input.paginationInputs.familyPaginationInputs.length) {
    errors.push("R2C-I family input coverage drifted")
  }
  if (input.sectionReconciliation.spacingBridgeBindings.length !== input.paginationInputs.familyPaginationInputs.length) {
    errors.push("R2C-H spacing binding coverage drifted")
  }
  return errors
}

function familyInputAt(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  itemIndex: number,
): FlowDocCanonicalReportFamilyPaginationInputV1 {
  const input = source.paginationInputs.familyPaginationInputs[itemIndex]
  requireFact(input?.itemIndex === itemIndex, `family pagination input missing: ${itemIndex}`)
  return input
}

function initialActiveCursor(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  demand: VNextDocumentCompositionDemandV1,
): FlowDocCanonicalReportActiveFamilyCursorV1 {
  const input = familyInputAt(source, demand.itemIndex)
  requireFact(input.rootNodeId === demand.rootNodeId && input.family === demand.family, `demand family input drifted: ${demand.rootNodeId}`)
  if (input.family === "text-flow") return {
    family: input.family,
    itemIndex: input.itemIndex,
    rootNodeId: input.rootNodeId,
    cursor: clone(input.initialCursor),
  }
  if (input.family === "table-flow") return {
    family: input.family,
    itemIndex: input.itemIndex,
    rootNodeId: input.rootNodeId,
    cursor: clone(input.initialCursor),
  }
  return {
    family: input.family,
    itemIndex: input.itemIndex,
    rootNodeId: input.rootNodeId,
    cursor: clone(input.initialCursor),
  }
}

function activeCursorStateFingerprint(cursor: FlowDocCanonicalReportActiveFamilyCursorV1): string {
  if (cursor.family === "text-flow") return createVNextTextFlowV4CursorFingerprint(cursor.cursor)
  if (cursor.family === "table-flow") return cursor.cursor.fingerprint
  return createVNextAtomicBlockV4CursorFingerprint(cursor.cursor)
}

function assertActiveCursor(
  active: FlowDocCanonicalReportActiveFamilyCursorV1 | null,
  demand: VNextDocumentCompositionDemandV1,
): asserts active is FlowDocCanonicalReportActiveFamilyCursorV1 {
  requireFact(active != null, `active family cursor missing: ${demand.rootNodeId}`)
  requireFact(
    active.itemIndex === demand.itemIndex
      && active.rootNodeId === demand.rootNodeId
      && active.family === demand.family,
    `active family cursor identity drifted: ${demand.rootNodeId}`,
  )
  requireFact(
    activeCursorStateFingerprint(active) === demand.cursorBefore.stateFingerprint,
    `active family cursor state drifted: ${demand.rootNodeId}`,
  )
}

function checkpointFacts(input: Omit<
  FlowDocCanonicalReportPaginationExecutionCheckpointV1,
  "fingerprint"
>): Omit<FlowDocCanonicalReportPaginationExecutionCheckpointV1, "fingerprint"> {
  return clone(input)
}

function finalizeCheckpoint(input: Omit<
  FlowDocCanonicalReportPaginationExecutionCheckpointV1,
  "fingerprint"
>): FlowDocCanonicalReportPaginationExecutionCheckpointV1 {
  const facts = checkpointFacts(input)
  return { ...facts, fingerprint: compact(facts) }
}

export function hasValidFlowDocCanonicalReportPaginationExecutionCheckpointV1(
  checkpoint: FlowDocCanonicalReportPaginationExecutionCheckpointV1,
): boolean {
  try {
    return checkpoint.fingerprint === compact(withoutFingerprint(checkpoint, "fingerprint"))
      && checkpoint.complete === checkpoint.documentCursor.complete
      && (checkpoint.demand == null) === (checkpoint.activeFamilyCursor == null)
      && (!checkpoint.complete || checkpoint.demand == null)
  } catch {
    return false
  }
}

function checkpointFromTransition(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  transitionCount: number,
  result: Exclude<ReturnType<typeof advanceVNextDocumentCompositionV1>, { status: "blocked" }>,
  previousDemand: VNextDocumentCompositionDemandV1 | null,
  familyCursorAfter: FlowDocCanonicalReportActiveFamilyCursorV1 | null,
): FlowDocCanonicalReportPaginationExecutionCheckpointV1 {
  const demand = result.demand
  let activeFamilyCursor: FlowDocCanonicalReportActiveFamilyCursorV1 | null = null
  if (demand != null) {
    activeFamilyCursor = previousDemand?.itemIndex === demand.itemIndex && familyCursorAfter != null
      ? familyCursorAfter
      : initialActiveCursor(source, demand)
    assertActiveCursor(activeFamilyCursor, demand)
  }
  return finalizeCheckpoint({
    contractVersion: FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION,
    kind: "canonical-report-pagination-execution-checkpoint",
    sourcePaginationInputsFingerprint: source.paginationInputs.bundleFingerprint,
    transitionCount,
    documentCursor: clone(result.cursorAfter),
    openPage: clone(result.openPageAfter),
    demand: clone(demand),
    activeFamilyCursor: clone(activeFamilyCursor),
    complete: result.status === "complete",
  })
}

export function initializeFlowDocCanonicalReportPaginationExecutionV1(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  limits: FlowDocCanonicalReportPaginationExecutionLimitsV1 = DEFAULT_LIMITS,
): FlowDocCanonicalReportPaginationExecutionCheckpointV1 {
  const sourceErrors = validateSources(source)
  requireFact(sourceErrors.length === 0, sourceErrors.join("; "))
  requireFact(validLimits(limits), "R2C-J execution limits are invalid")
  const result = initializeVNextDocumentCompositionV1({
    manifest: source.paginationInputs.coreCompositionManifest,
    limits: limits.coreTransition,
  })
  requireFact(result.status !== "blocked", `R2C-J composition initialization blocked: ${result.issues[0]?.code}`)
  requireFact(result.closedPages.length === 0, "R2C-J canonical initialization unexpectedly emitted pages")
  const activeFamilyCursor = result.demand == null ? null : initialActiveCursor(source, result.demand)
  if (result.demand != null) assertActiveCursor(activeFamilyCursor, result.demand)
  return finalizeCheckpoint({
    contractVersion: FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION,
    kind: "canonical-report-pagination-execution-checkpoint",
    sourcePaginationInputsFingerprint: source.paginationInputs.bundleFingerprint,
    transitionCount: 0,
    documentCursor: clone(result.cursorAfter),
    openPage: clone(result.openPageAfter),
    demand: clone(result.demand),
    activeFamilyCursor: clone(activeFamilyCursor),
    complete: result.status === "complete",
  })
}

interface FamilyWindowExecution {
  familyCursorAfter: FlowDocCanonicalReportActiveFamilyCursorV1
  bridgedWindow: VNextCompositionFragmentWindowV1
  trace: FlowDocCanonicalReportFamilyPaginationTraceV1
}

function familyPaginationWork(value: object): Record<string, number> {
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => (
    typeof entry[1] === "number"
  )))
}

function executeFamilyWindow(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  demand: VNextDocumentCompositionDemandV1,
  active: FlowDocCanonicalReportActiveFamilyCursorV1,
): FamilyWindowExecution {
  assertActiveCursor(active, demand)
  const familyInput = familyInputAt(source, demand.itemIndex)
  const spacingBinding = source.sectionReconciliation.spacingBridgeBindings[demand.itemIndex]
  requireFact(
    spacingBinding?.itemIndex === demand.itemIndex && spacingBinding.rootNodeId === demand.rootNodeId,
    `spacing binding missing: ${demand.rootNodeId}`,
  )
  const spacing = createVNextDocumentCompositionSpacingBridgePlanV1({
    demand,
    gapBeforePt: spacingBinding.gapBeforePt,
  })
  requireFact(spacing.status === "ready", `spacing bridge plan blocked: ${spacing.issues[0]?.code}`)
  const familyDemand = spacing.plan.familyDemand
  const manifest = source.paginationInputs.coreCompositionManifest
  const item = manifest.bodyItems[demand.itemIndex]
  requireFact(item?.rootNodeId === demand.rootNodeId, `composition body item missing: ${demand.rootNodeId}`)
  const context = {
    documentId: familyDemand.documentId,
    sectionId: familyDemand.sectionId,
    zoneId: familyDemand.zoneId,
    sourceOrder: familyDemand.sourceOrder,
    documentStructureFingerprint: familyDemand.ownerPins.documentStructure,
    resolvedProjectionFingerprint: familyDemand.ownerPins.resolvedProjection,
    familySourceFingerprint: familyDemand.ownerPins.familySource,
  }

  let familyCursorAfter: FlowDocCanonicalReportActiveFamilyCursorV1
  let familyWindow: VNextCompositionFragmentWindowV1
  let paginationStatus: FlowDocCanonicalReportFamilyPaginationTraceV1["paginationStatus"]
  let paginationFingerprint: string
  let paginationPageCount: number
  let paginationFragmentCount: number
  let paginationWork: Record<string, number>
  let repeatedHeaderFragmentCount = 0

  if (familyInput.family === "text-flow") {
    requireFact(active.family === familyInput.family, `text cursor family drifted: ${demand.rootNodeId}`)
    const block = source.measuredComposition.documentBlocks[familyInput.source.documentBlockIndex]
    requireFact(
      block?.textBlockId === demand.rootNodeId && block.consumerId === familyInput.source.consumerId,
      `measured text source drifted: ${demand.rootNodeId}`,
    )
    const pagination = paginateVNextTextFlowV4({
      accepted: block.measured,
      pageBodyHeightPt: familyDemand.capacity.pageBodyHeightPt,
      firstPageAvailableHeightPt: familyDemand.capacity.firstPageAvailableHeightPt,
      maximumPageCount: familyDemand.capacity.maximumPageCount,
      maximumLineCount: familyInput.pagination.maximumLineCount,
      cursor: active.cursor,
    })
    requireFact(pagination.status !== "blocked", `text pagination blocked: ${pagination.issues[0]?.code}`)
    const window = createVNextTextFlowCompositionWindowV1({
      pagination,
      context: {
        ...context,
        maximumFragmentCount: familyDemand.capacity.maximumFragmentCount,
        ...(item.headingLevel == null ? {} : { headingLevel: item.headingLevel }),
      },
    })
    requireFact(window.status === "ready", `text composition window blocked: ${window.issues[0]?.code}`)
    familyCursorAfter = {
      family: familyInput.family,
      itemIndex: demand.itemIndex,
      rootNodeId: demand.rootNodeId,
      cursor: clone(pagination.cursorAfter),
    }
    familyWindow = window.window
    paginationStatus = pagination.status
    paginationFingerprint = pagination.fingerprint
    paginationPageCount = pagination.pages.length
    paginationFragmentCount = pagination.pages.length
    paginationWork = familyPaginationWork(pagination.work)
  } else if (familyInput.family === "table-flow") {
    requireFact(active.family === familyInput.family, `table cursor family drifted: ${demand.rootNodeId}`)
    const table = source.measuredComposition.preparedTables[familyInput.source.preparedTableIndex]
    requireFact(
      table?.tableId === demand.rootNodeId && table.projectionId === familyInput.source.projectionId,
      `prepared table source drifted: ${demand.rootNodeId}`,
    )
    const pagination = paginateVNextTableFlowV4({
      prepared: table.preparedRows,
      pageBodyHeightPt: familyDemand.capacity.pageBodyHeightPt,
      firstPageAvailableHeightPt: familyDemand.capacity.firstPageAvailableHeightPt,
      headerPolicy: familyInput.pagination.headerPolicy,
      maximumPageCount: familyDemand.capacity.maximumPageCount,
      maximumRowPlanCount: familyInput.pagination.maximumRowPlanCount,
      cursor: active.cursor,
    })
    requireFact(pagination.status !== "blocked", `table pagination blocked: ${pagination.issues[0]?.code}`)
    const window = createVNextTableCompositionWindowV1({ pagination, context })
    requireFact(window.status === "ready", `table composition window blocked: ${window.issues[0]?.code}`)
    familyCursorAfter = {
      family: familyInput.family,
      itemIndex: demand.itemIndex,
      rootNodeId: demand.rootNodeId,
      cursor: clone(pagination.cursorAfter),
    }
    familyWindow = window.window
    paginationStatus = pagination.status
    paginationFingerprint = pagination.fingerprint
    paginationPageCount = pagination.pages.length
    paginationFragmentCount = pagination.pages.length
    paginationWork = familyPaginationWork(pagination.work)
    repeatedHeaderFragmentCount = pagination.pages.reduce((count, page) => (
      count + page.work.repeatedHeaderFragmentCount
    ), 0)
  } else {
    requireFact(active.family === familyInput.family, `media cursor family drifted: ${demand.rootNodeId}`)
    const pagination = paginateVNextAtomicBlockV4({
      evidence: familyInput.evidence,
      pageBodyHeightPt: familyDemand.capacity.pageBodyHeightPt,
      firstPageAvailableHeightPt: familyDemand.capacity.firstPageAvailableHeightPt,
      cursor: active.cursor,
    })
    requireFact(pagination.status !== "blocked", `media pagination blocked: ${pagination.issues[0]?.code}`)
    const window = createVNextAtomicBlockCompositionWindowV1({ pagination, context })
    requireFact(window.status === "ready", `media composition window blocked: ${window.issues[0]?.code}`)
    familyCursorAfter = {
      family: familyInput.family,
      itemIndex: demand.itemIndex,
      rootNodeId: demand.rootNodeId,
      cursor: clone(pagination.cursorAfter),
    }
    familyWindow = window.window
    paginationStatus = pagination.status
    paginationFingerprint = pagination.fingerprint
    paginationPageCount = pagination.pages.length
    paginationFragmentCount = pagination.pages.reduce((count, page) => count + (page.fragment == null ? 0 : 1), 0)
    paginationWork = familyPaginationWork(pagination.work)
  }

  const bridged = bridgeVNextDocumentCompositionSpacingWindowV1({
    plan: spacing.plan,
    familyWindow,
  })
  requireFact(bridged.status === "ready", `spacing window bridge blocked: ${bridged.issues[0]?.code}`)
  const trace: FlowDocCanonicalReportFamilyPaginationTraceV1 = {
    itemIndex: demand.itemIndex,
    rootNodeId: demand.rootNodeId,
    family: familyInput.family,
    transitionDemandFingerprint: demand.fingerprint,
    familyDemandFingerprint: familyDemand.fingerprint,
    gapBeforePt: spacing.plan.gapBeforePt,
    spacingDisposition: spacing.plan.disposition,
    appliedGapBeforePt: spacing.plan.appliedGapBeforePt,
    suppressedGapBeforePt: spacing.plan.suppressedGapBeforePt,
    paginationStatus,
    paginationFingerprint,
    paginationPageCount,
    paginationFragmentCount,
    paginationWork,
    repeatedHeaderFragmentCount,
    familyCursorBeforeStateFingerprint: demand.cursorBefore.stateFingerprint,
    familyCursorAfterStateFingerprint: activeCursorStateFingerprint(familyCursorAfter),
    familyWindowFingerprint: familyWindow.fingerprint,
    bridgedWindowFingerprint: bridged.window.fingerprint,
  }
  return { familyCursorAfter, bridgedWindow: bridged.window, trace }
}

function finalizeTrace(input: Omit<FlowDocCanonicalReportPaginationTransitionTraceV1, "traceFingerprint">) {
  const facts = clone(input)
  return { ...facts, traceFingerprint: compact(facts) }
}

export function executeFlowDocCanonicalReportPaginationExecutionSliceV1(input: {
  source: FlowDocCanonicalReportPaginationExecutionSourceV1
  checkpoint: FlowDocCanonicalReportPaginationExecutionCheckpointV1
  limits?: FlowDocCanonicalReportPaginationExecutionLimitsV1
  maximumTransitionCount?: number
}): FlowDocCanonicalReportPaginationExecutionSliceV1 {
  const limits = input.limits ?? DEFAULT_LIMITS
  const maximumTransitionCount = input.maximumTransitionCount ?? limits.maximumTransitionsPerSlice
  const sourceErrors = validateSources(input.source)
  requireFact(sourceErrors.length === 0, sourceErrors.join("; "))
  requireFact(validLimits(limits), "R2C-J execution limits are invalid")
  requireFact(
    Number.isInteger(maximumTransitionCount)
      && maximumTransitionCount > 0
      && maximumTransitionCount <= limits.maximumTransitionsPerSlice,
    "R2C-J slice transition limit is invalid",
  )
  requireFact(
    hasValidFlowDocCanonicalReportPaginationExecutionCheckpointV1(input.checkpoint),
    "R2C-J checkpoint fingerprint or completion state is invalid",
  )
  requireFact(
    input.checkpoint.sourcePaginationInputsFingerprint === input.source.paginationInputs.bundleFingerprint,
    "R2C-J checkpoint source drifted",
  )

  const checkpointBefore = clone(input.checkpoint)
  let checkpoint = clone(input.checkpoint)
  const closedPages: VNextDocumentCompositionClosedPageV1[] = []
  const traces: FlowDocCanonicalReportPaginationTransitionTraceV1[] = []

  while (!checkpoint.complete && traces.length < maximumTransitionCount) {
    if (checkpoint.transitionCount >= limits.maximumTransitionCount) break
    const cursorBeforeFingerprint = checkpoint.documentCursor.fingerprint
    const demand = checkpoint.demand
    let window: VNextCompositionFragmentWindowV1 | null = null
    let familyExecution: FamilyWindowExecution | null = null
    if (demand != null) {
      assertActiveCursor(checkpoint.activeFamilyCursor, demand)
      familyExecution = executeFamilyWindow(input.source, demand, checkpoint.activeFamilyCursor)
      window = familyExecution.bridgedWindow
    } else {
      requireFact(checkpoint.activeFamilyCursor == null, "structure resume cannot retain an active family cursor")
    }
    const result = advanceVNextDocumentCompositionV1({
      manifest: input.source.paginationInputs.coreCompositionManifest,
      cursor: checkpoint.documentCursor,
      openPage: checkpoint.openPage,
      window,
      limits: limits.coreTransition,
    })
    requireFact(result.status !== "blocked", `composition transition blocked: ${result.issues[0]?.code}`)
    const transitionIndex = checkpoint.transitionCount + 1
    closedPages.push(...result.closedPages.map(clone))
    const trace = finalizeTrace({
      transitionIndex,
      kind: demand == null ? "structure-resume" : "family-window",
      familyExecution: familyExecution == null ? null : clone(familyExecution.trace),
      transitionStatus: result.status,
      transitionReason: result.reason,
      closedPageIndexes: result.closedPages.map((page) => page.pageIndex),
      cursorBeforeFingerprint,
      cursorAfterFingerprint: result.cursorAfter.fingerprint,
      openPageAfterFingerprint: result.openPageAfter?.fingerprint ?? null,
      transitionWork: clone(result.work),
    })
    traces.push(trace)
    checkpoint = checkpointFromTransition(
      input.source,
      transitionIndex,
      result,
      demand,
      familyExecution?.familyCursorAfter ?? null,
    )
  }

  const status = checkpoint.complete ? "complete" as const : "partial" as const
  const reason = checkpoint.complete
    ? "document-complete" as const
    : checkpoint.transitionCount >= limits.maximumTransitionCount
      ? "global-transition-limit" as const
      : "slice-transition-limit" as const
  const facts: Omit<FlowDocCanonicalReportPaginationExecutionSliceV1, "sliceFingerprint"> = {
    contractVersion: FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION,
    kind: "canonical-report-pagination-execution-slice",
    status,
    reason,
    checkpointBeforeFingerprint: checkpointBefore.fingerprint,
    checkpointAfter: checkpoint,
    closedPages,
    traces,
  }
  return { ...facts, sliceFingerprint: compact(facts) }
}

function sliceReceipt(
  sliceIndex: number,
  slice: FlowDocCanonicalReportPaginationExecutionSliceV1,
): FlowDocCanonicalReportPaginationExecutionSliceReceiptV1 {
  const facts = {
    sliceIndex,
    transitionStartIndex: slice.traces[0]?.transitionIndex ?? slice.checkpointAfter.transitionCount,
    transitionEndIndex: slice.traces.at(-1)?.transitionIndex ?? slice.checkpointAfter.transitionCount,
    checkpointBeforeFingerprint: slice.checkpointBeforeFingerprint,
    checkpointAfterFingerprint: slice.checkpointAfter.fingerprint,
    emittedPageIndexes: slice.closedPages.map((page) => page.pageIndex),
    traceFingerprints: slice.traces.map((trace) => trace.traceFingerprint),
    status: slice.status,
    reason: slice.reason,
  }
  return { ...facts, receiptFingerprint: compact(facts) }
}

export function executeFlowDocCanonicalReportPaginationV1(input: {
  source: FlowDocCanonicalReportPaginationExecutionSourceV1
  limits?: FlowDocCanonicalReportPaginationExecutionLimitsV1
}): FlowDocCanonicalReportPaginationExecutionResultV1 {
  const limits = clone(input.limits ?? DEFAULT_LIMITS)
  let checkpoint = initializeFlowDocCanonicalReportPaginationExecutionV1(input.source, limits)
  const closedPages: VNextDocumentCompositionClosedPageV1[] = []
  const traces: FlowDocCanonicalReportPaginationTransitionTraceV1[] = []
  const sliceReceipts: FlowDocCanonicalReportPaginationExecutionSliceReceiptV1[] = []
  while (!checkpoint.complete) {
    const beforeCount = checkpoint.transitionCount
    const slice = executeFlowDocCanonicalReportPaginationExecutionSliceV1({
      source: input.source,
      checkpoint,
      limits,
      maximumTransitionCount: limits.maximumTransitionsPerSlice,
    })
    requireFact(slice.traces.length > 0, `R2C-J execution made no progress: ${slice.reason}`)
    closedPages.push(...slice.closedPages.map(clone))
    traces.push(...slice.traces.map(clone))
    sliceReceipts.push(sliceReceipt(sliceReceipts.length, slice))
    checkpoint = slice.checkpointAfter
    requireFact(checkpoint.transitionCount > beforeCount, "R2C-J checkpoint did not advance")
    requireFact(slice.reason !== "global-transition-limit", "R2C-J global transition limit exhausted")
  }
  const finalization = finalizeVNextDocumentCompositionV1({
    manifest: input.source.paginationInputs.coreCompositionManifest,
    terminalCursor: checkpoint.documentCursor,
    closedPages,
  })
  requireFact(finalization.status === "ready", `R2C-J composition finalization blocked: ${finalization.issues[0]?.code}`)
  return {
    terminalCheckpoint: checkpoint,
    pagePlan: finalization.plan,
    headingPageMap: finalization.headingPageMap,
    traces,
    sliceReceipts,
  }
}

function targetComparison(actualPageCount: number): FlowDocCanonicalReportPaginationExecutionBundleV1["summary"]["targetComparison"] {
  return actualPageCount === TARGET_PAGE_COUNT
    ? "matches-target"
    : actualPageCount < TARGET_PAGE_COUNT ? "under-target" : "over-target"
}

function buildBundle(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  limits: FlowDocCanonicalReportPaginationExecutionLimitsV1,
): FlowDocCanonicalReportPaginationExecutionBundleV1 {
  const result = executeFlowDocCanonicalReportPaginationV1({ source, limits })
  const familyTraces = result.traces.flatMap((trace) => trace.familyExecution == null ? [] : [trace.familyExecution])
  const placedRootCount = new Set(result.pagePlan.pages.flatMap((page) => (
    page.placements.map((placement) => placement.itemIndex)
  ))).size
  const summary: FlowDocCanonicalReportPaginationExecutionBundleV1["summary"] = {
    targetPageCount: TARGET_PAGE_COUNT,
    actualPageCount: result.pagePlan.summary.pageCount,
    targetComparison: targetComparison(result.pagePlan.summary.pageCount),
    bodyItemCount: source.paginationInputs.coreCompositionManifest.bodyItems.length,
    placedRootCount,
    placementCount: result.pagePlan.summary.placementCount,
    headingCount: result.pagePlan.summary.headingCount,
    transitionCount: result.traces.length,
    familyWindowTransitionCount: familyTraces.length,
    structureResumeTransitionCount: result.traces.filter((trace) => trace.kind === "structure-resume").length,
    textFlowTransitionCount: familyTraces.filter((trace) => trace.family === "text-flow").length,
    tableFlowTransitionCount: familyTraces.filter((trace) => trace.family === "table-flow").length,
    mediaFlowTransitionCount: familyTraces.filter((trace) => trace.family === "media-flow").length,
    freshPageRequiredTransitionCount: familyTraces.filter((trace) => trace.paginationStatus === "fresh-page-required").length,
    appliedSpacingCount: familyTraces.filter((trace) => (
      trace.paginationStatus !== "fresh-page-required" && trace.appliedGapBeforePt > 0
    )).length,
    appliedSpacingPt: roundPt(familyTraces.reduce((total, trace) => (
      total + (trace.paginationStatus === "fresh-page-required" ? 0 : trace.appliedGapBeforePt)
    ), 0)),
    suppressedPageTopSpacingCount: familyTraces.filter((trace) => trace.suppressedGapBeforePt > 0).length,
    suppressedPageTopSpacingPt: roundPt(familyTraces.reduce((total, trace) => total + trace.suppressedGapBeforePt, 0)),
    repeatedHeaderFragmentCount: familyTraces.reduce((total, trace) => total + trace.repeatedHeaderFragmentCount, 0),
    sliceCount: result.sliceReceipts.length,
    paginationExecuted: true,
    pageAssignmentExecuted: true,
    actualPageNumberExpansionExecuted: false,
    pdfRendered: false,
  }
  requireFact(summary.placedRootCount === summary.bodyItemCount, "R2C-J did not place every body root")
  requireFact(result.terminalCheckpoint.transitionCount === summary.transitionCount, "R2C-J transition count drifted")
  const unsigned: Omit<FlowDocCanonicalReportPaginationExecutionBundleV1, "bundleFingerprint"> = {
    contractVersion: FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_VERSION,
    kind: "canonical-report-pagination-execution-bundle",
    phaseId: "PDF-PILOT-08B-R2C-J",
    executionId: FLOWDOC_CANONICAL_REPORT_PAGINATION_EXECUTION_ID,
    sourcePaginationInputsFingerprint: source.paginationInputs.bundleFingerprint,
    sourceMeasuredCompositionFingerprint: source.measuredComposition.bundleFingerprint,
    sourceSectionReconciliationFingerprint: source.sectionReconciliation.bundleFingerprint,
    sourceCoreCompositionManifestFingerprint: source.paginationInputs.coreCompositionManifest.fingerprint,
    limits: clone(limits),
    terminalCheckpoint: clone(result.terminalCheckpoint),
    corePagePlan: clone(result.pagePlan),
    headingPageMap: clone(result.headingPageMap),
    transitionTraces: clone(result.traces),
    sliceReceipts: clone(result.sliceReceipts),
    downstreamBlockers: clone(EXPECTED_BLOCKERS),
    ownership: clone(EXPECTED_OWNERSHIP),
    execution: clone(EXPECTED_EXECUTION),
    summary,
  }
  return { ...unsigned, bundleFingerprint: sha256(JSON.stringify(unsigned)) }
}

export function createFlowDocCanonicalReportPaginationExecutionBundleV1(
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
  limits: FlowDocCanonicalReportPaginationExecutionLimitsV1 = DEFAULT_LIMITS,
): FlowDocCanonicalReportPaginationExecutionBundleV1 {
  const sourceErrors = validateSources(source)
  requireFact(sourceErrors.length === 0, sourceErrors.join("; "))
  requireFact(validLimits(limits), "R2C-J execution limits are invalid")
  return buildBundle(source, limits)
}

export function validateFlowDocCanonicalReportPaginationExecutionBundleV1(
  value: unknown,
  source: FlowDocCanonicalReportPaginationExecutionSourceV1,
): FlowDocCanonicalReportPaginationExecutionValidationV1 {
  if (!isRecord(value)) return {
    status: "blocked",
    issues: [issue("invalid-bundle-shape", "", "bundle must be an object")],
    summary: null,
  }
  const bundle = value as unknown as FlowDocCanonicalReportPaginationExecutionBundleV1
  const issues: FlowDocCanonicalReportPaginationExecutionIssueV1[] = []
  validateSources(source).forEach((message) => issues.push(issue("invalid-source", "sources", message)))
  if (bundle.contractVersion !== 1) issues.push(issue("contract-version", "contractVersion", "contractVersion must be 1"))
  if (bundle.kind !== "canonical-report-pagination-execution-bundle") issues.push(issue("kind", "kind", "unexpected bundle kind"))
  if (bundle.phaseId !== "PDF-PILOT-08B-R2C-J") issues.push(issue("phase-id", "phaseId", "unexpected phase identity"))
  if (bundle.sourcePaginationInputsFingerprint !== source.paginationInputs.bundleFingerprint) issues.push(issue("source-pagination-inputs", "sourcePaginationInputsFingerprint", "R2C-I source differs"))
  if (bundle.sourceMeasuredCompositionFingerprint !== source.measuredComposition.bundleFingerprint) issues.push(issue("source-measured-composition", "sourceMeasuredCompositionFingerprint", "R2C-F source differs"))
  if (bundle.sourceSectionReconciliationFingerprint !== source.sectionReconciliation.bundleFingerprint) issues.push(issue("source-section-reconciliation", "sourceSectionReconciliationFingerprint", "R2C-H source differs"))
  if (!validLimits(bundle.limits)) issues.push(issue("execution-limits", "limits", "execution limits are invalid"))
  if (!hasValidFlowDocCanonicalReportPaginationExecutionCheckpointV1(bundle.terminalCheckpoint)) issues.push(issue("terminal-checkpoint", "terminalCheckpoint", "terminal checkpoint is invalid"))
  if (parseVNextDocumentCompositionPagePlanV1(bundle.corePagePlan).status !== "ready") issues.push(issue("core-page-plan", "corePagePlan", "Core page plan is invalid"))
  if (!exact(bundle.ownership, EXPECTED_OWNERSHIP)) issues.push(issue("ownership-boundary", "ownership", "pagination execution ownership drifted"))
  if (!exact(bundle.execution, EXPECTED_EXECUTION)) issues.push(issue("execution-boundary", "execution", "pagination execution boundary drifted"))
  if (!exact(bundle.downstreamBlockers, EXPECTED_BLOCKERS)) issues.push(issue("downstream-blockers", "downstreamBlockers", "pagination execution blockers drifted"))
  for (const forbidden of ["pageNumberInstances", "staticZonePaintInstances", "displayList", "pdfBytes"]) {
    if (forbidden in bundle) issues.push(issue("downstream-fact", forbidden, `pagination execution bundle must not contain ${forbidden}`))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  let expected: FlowDocCanonicalReportPaginationExecutionBundleV1
  try {
    expected = buildBundle(source, bundle.limits)
  } catch (error) {
    return {
      status: "blocked",
      issues: [issue("expected-bundle-build", "", error instanceof Error ? error.message : "expected bundle build failed")],
      summary: null,
    }
  }
  if (bundle.bundleFingerprint !== sha256(JSON.stringify(withoutFingerprint(bundle, "bundleFingerprint")))) {
    issues.push(issue("bundle-fingerprint", "bundleFingerprint", "bundle fingerprint does not match content"))
  }
  if (!exact(withoutFingerprint(bundle, "bundleFingerprint"), withoutFingerprint(expected, "bundleFingerprint"))) {
    issues.push(issue("canonical-bundle-drift", "", "pagination execution bundle differs from deterministic source execution"))
  }
  if (issues.length > 0) return { status: "blocked", issues, summary: null }
  return { status: "valid", issues: [], summary: bundle.summary }
}
