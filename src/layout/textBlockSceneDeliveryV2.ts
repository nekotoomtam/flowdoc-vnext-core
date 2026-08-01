import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  hasVNextTextBlockPersistentScenePreparedCandidateInternalV2,
  hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2,
} from "./textBlockPersistentSceneV2.js"
import type {
  VNextTextBlockPersistentSceneChunkV2,
  VNextTextBlockPersistentSceneNodeV2,
  VNextTextBlockPersistentSceneRootV2,
  VNextTextBlockPersistentSceneSummaryV2,
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import {
  VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE,
  VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION,
  type VNextTextBlockCompleteSceneDeliveryInspectionV2,
  type VNextTextBlockCompleteSceneDeliveryV2,
  type VNextTextBlockCompleteSceneDeliveryResultV2,
  type VNextTextBlockSceneDeliveryOperationDraftV2,
  type VNextTextBlockSceneDeliveryOperationV2,
  type VNextTextBlockSceneDeliveryPlanBuildResultV2,
  type VNextTextBlockSceneDeliveryPlanBuildWorkV2,
  type VNextTextBlockSceneDeliveryPlanCandidateInputV2,
  type VNextTextBlockSceneDeliveryPlanInspectionV2,
  type VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  type VNextTextBlockSceneDeliveryPlanIssueV2,
  type VNextTextBlockSceneDeliveryPlanV2,
  type VNextTextBlockSceneDeliveryRangeV2,
  type VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2,
} from "./textBlockSceneDeliveryContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  evaluateNextVNextTextBlockStageVisitInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

type DeliveryVisitUnitInternalV2 =
  | "scene-tree-lookup-nodes"
  | "delivery-operations"
  | "retain-cover-nodes"

type DeliveryVisitPhaseInternalV2 = "construction" | "verification"

export interface VNextTextBlockSceneDeliveryVisitContextInternalV2 {
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}

let deliveryOperationObserverForTest:
  | ((observation: {
      readonly phase: DeliveryVisitPhaseInternalV2
      readonly unit: DeliveryVisitUnitInternalV2
      readonly completedWork: number
    }) => void)
  | null = null

export function setVNextTextBlockSceneDeliveryOperationObserverForTestInternalV2(
  observer: typeof deliveryOperationObserverForTest,
): void {
  deliveryOperationObserverForTest = observer
}

function withDeliveryVisitWorkInternalV2(input: {
  readonly base: VNextTextBlockIncrementalCandidateWorkV1
  readonly unit: DeliveryVisitUnitInternalV2
  readonly count: number
}): VNextTextBlockIncrementalCandidateWorkV1 {
  const key = input.unit === "scene-tree-lookup-nodes"
    ? "visitedSceneTreeNodeCount"
    : input.unit === "delivery-operations"
      ? "deliveryOperationCount"
      : "retainCoverNodeCount"
  return deepFreeze({
    ...input.base,
    deliveryPlan: { ...input.base.deliveryPlan, [key]: input.count },
    stageWork: input.base.stageWork.map((row) =>
      row.stage === "delivery-plan" && row.unit === input.unit
        ? { ...row, count: input.count }
        : row
    ),
  })
}

function safeAdd(left: number, right: number): number {
  const result = left + right
  if (!Number.isSafeInteger(result)) throw new Error("unsafe integer")
  return result
}

let planVerificationObserverForTest: (() => void) | null = null

export function setVNextTextBlockSceneDeliveryPlanVerificationObserverForTestInternalV2(
  observer: (() => void) | null,
): void {
  planVerificationObserverForTest = observer
}

function utf8ByteCount(value: unknown): number {
  return new TextEncoder().encode(
    stringifyVNextCanonicalJson(value),
  ).byteLength
}

function exactRecord(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const actual = Reflect.ownKeys(value)
    if (
      actual.length !== keys.length
      || actual.some((key) => typeof key !== "string" || !keys.includes(key))
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output
  } catch {
    return null
  }
}

function exactArray(value: unknown): readonly unknown[] | null {
  try {
    if (
      !Array.isArray(value)
      || Object.getPrototypeOf(value) !== Array.prototype
    ) return null
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (
      length == null
      || !Object.hasOwn(length, "value")
      || !Number.isSafeInteger(length.value)
      || length.value < 0
      || Reflect.ownKeys(value).length !== length.value + 1
    ) return null
    const output: unknown[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output.push(descriptor.value)
    }
    return output
  } catch {
    return null
  }
}

interface DeliveryParseState {
  readonly seen: WeakSet<object>
}

function deliveryRecord(
  state: DeliveryParseState,
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> | null {
  void state
  return exactRecord(value, keys)
}

function deliveryArray(
  state: DeliveryParseState,
  value: unknown,
): readonly unknown[] | null {
  void state
  return exactArray(value)
}

function safeInteger(
  value: unknown,
  minimum = Number.MIN_SAFE_INTEGER,
): value is number {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= minimum
}

function deliveryDataField(value: unknown, key: string): unknown {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return (prototype === Object.prototype || prototype === null)
      && Object.getOwnPropertySymbols(value).length === 0
      && descriptor != null
      && Object.hasOwn(descriptor, "value")
      && descriptor.enumerable === true
      ? descriptor.value
      : null
  } catch {
    return null
  }
}

function parseDeliverySpan(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, [
    "lineageId", "localStartRenderedUtf16", "localEndRenderedUtf16",
  ])
  return record == null
    || typeof record.lineageId !== "string"
    || !safeInteger(record.localStartRenderedUtf16, 0)
    || !safeInteger(record.localEndRenderedUtf16, 0)
    || record.localEndRenderedUtf16 < record.localStartRenderedUtf16
    ? null
    : { ...record }
}

function parseDeliverySpans(
  state: DeliveryParseState,
  value: unknown,
): readonly Record<string, unknown>[] | null {
  const values = deliveryArray(state, value)
  if (values == null) return null
  const spans: Record<string, unknown>[] = []
  for (const item of values) {
    const span = parseDeliverySpan(state, item)
    if (span == null) return null
    spans.push(span)
  }
  return spans
}

function parseDeliverySourceMapping(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, [
    "lineageId", "inlineId", "sourceKind", "localStartRenderedUtf16",
    "localEndRenderedUtf16", "sourceStartOffset", "sourceEndOffset",
    "renderedText", "sourceFingerprint", "provenanceFingerprint",
    "boundaryFingerprint", "fingerprint",
  ])
  const sourceKinds = new Set([
    "text", "resolved-field", "generated-page-number", "hard-break",
    "inline-image",
  ])
  return record == null
    || typeof record.lineageId !== "string"
    || typeof record.inlineId !== "string"
    || typeof record.sourceKind !== "string"
    || !sourceKinds.has(record.sourceKind)
    || !safeInteger(record.localStartRenderedUtf16, 0)
    || !safeInteger(record.localEndRenderedUtf16, 0)
    || !safeInteger(record.sourceStartOffset, 0)
    || !safeInteger(record.sourceEndOffset, 0)
    || record.localEndRenderedUtf16 < record.localStartRenderedUtf16
    || record.sourceEndOffset < record.sourceStartOffset
    || typeof record.renderedText !== "string"
    || typeof record.sourceFingerprint !== "string"
    || typeof record.provenanceFingerprint !== "string"
    || typeof record.boundaryFingerprint !== "string"
    || typeof record.fingerprint !== "string"
    ? null
    : { ...record }
}

function parseDeliveryUnit(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, ["value", "unit"])
  return record == null
    || typeof record.value !== "number"
    || !Number.isFinite(record.value)
    || record.value <= 0
    || (record.unit !== "pt" && record.unit !== "mm")
    ? null
    : { ...record }
}

function parseDeliveryAuthoredFrame(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, ["width", "height", "fit", "crop"])
    ?? deliveryRecord(state, value, ["width", "height", "fit"])
  if (record == null || (record.fit !== "contain" && record.fit !== "cover")) {
    return null
  }
  const width = parseDeliveryUnit(state, record.width)
  const height = parseDeliveryUnit(state, record.height)
  if (width == null || height == null) return null
  if (!Object.hasOwn(record, "crop") || record.crop === undefined) {
    return { width, height, fit: record.fit }
  }
  const crop = deliveryRecord(state, record.crop, ["x", "y", "width", "height"])
  if (
    crop == null
    || ![crop.x, crop.y, crop.width, crop.height].every(
      (item) => typeof item === "number" && Number.isFinite(item),
    )
    || (crop.x as number) < 0
    || (crop.y as number) < 0
    || (crop.width as number) <= 0
    || (crop.height as number) <= 0
    || (crop.x as number) + (crop.width as number) > 1
    || (crop.y as number) + (crop.height as number) > 1
  ) return null
  return { width, height, fit: record.fit, crop: { ...crop } }
}

function parseDeliveryLineInternalFragment(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const kind = deliveryDataField(value, "kind")
  const keys = kind === "text"
    ? ["kind", "lineageId", "sourceSpans", "text", "xLayoutUnit", "advanceLayoutUnit", "baselineShiftLayoutUnit", "fontFaceId", "fontFamily", "fontSha256", "fontWeight", "fontStyle", "fontSizeLayoutUnit", "ascentLayoutUnit", "descentLayoutUnit", "lineGapLayoutUnit"]
    : kind === "inline-image"
      ? ["kind", "lineageId", "sourceSpans", "xLayoutUnit", "yLayoutUnit", "widthLayoutUnit", "heightLayoutUnit", "verticalAlign", "alignmentPolicyFingerprint"]
      : null
  const record = keys == null ? null : deliveryRecord(state, value, keys)
  const spans = record == null ? null : parseDeliverySpans(state, record.sourceSpans)
  if (record == null || spans == null || typeof record.lineageId !== "string") return null
  if (record.kind === "text") {
    const numberKeys = ["xLayoutUnit", "advanceLayoutUnit", "baselineShiftLayoutUnit", "fontWeight", "fontSizeLayoutUnit", "ascentLayoutUnit", "descentLayoutUnit", "lineGapLayoutUnit"] as const
    return numberKeys.every((key) => safeInteger(record[key]))
      && record.baselineShiftLayoutUnit === 0
      && typeof record.text === "string"
      && typeof record.fontFaceId === "string"
      && typeof record.fontFamily === "string"
      && typeof record.fontSha256 === "string"
      && (record.fontStyle === "normal" || record.fontStyle === "italic")
      ? { ...record, sourceSpans: spans }
      : null
  }
  return safeInteger(record.xLayoutUnit)
    && safeInteger(record.yLayoutUnit)
    && safeInteger(record.widthLayoutUnit)
    && safeInteger(record.heightLayoutUnit)
    && (record.verticalAlign === "baseline" || record.verticalAlign === "middle" || record.verticalAlign === "text-bottom")
    && typeof record.alignmentPolicyFingerprint === "string"
    ? { ...record, sourceSpans: spans }
    : null
}

function parseDeliveryLineInternals(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, ["lineageId", "heightLayoutUnit", "baselineOffsetLayoutUnit", "fragments", "fingerprint"])
  const values = record == null ? null : deliveryArray(state, record.fragments)
  if (
    record == null || values == null || typeof record.lineageId !== "string"
    || !safeInteger(record.heightLayoutUnit) || !safeInteger(record.baselineOffsetLayoutUnit)
    || typeof record.fingerprint !== "string"
  ) return null
  const fragments: Record<string, unknown>[] = []
  for (const item of values) {
    const fragment = parseDeliveryLineInternalFragment(state, item)
    if (fragment == null) return null
    fragments.push(fragment)
  }
  return { ...record, fragments }
}

function parseDeliveryGeometry(
  state: DeliveryParseState,
  value: unknown,
  authored: boolean,
): Record<string, unknown> | null {
  const keys = authored
    ? ["contentYOffsetLayoutUnit", "yOffsetLayoutUnit", "heightLayoutUnit", "baselineOffsetLayoutUnit", "fragments", "fingerprint"]
    : ["yOffsetLayoutUnit", "heightLayoutUnit", "baselineOffsetLayoutUnit", "availableIntervals", "intervalPlacements", "fragments", "fingerprint"]
  const record = deliveryRecord(state, value, keys)
  if (record == null || typeof record.fingerprint !== "string") return null
  const numericKeys = authored
    ? ["contentYOffsetLayoutUnit", "yOffsetLayoutUnit", "heightLayoutUnit", "baselineOffsetLayoutUnit"]
    : ["yOffsetLayoutUnit", "heightLayoutUnit", "baselineOffsetLayoutUnit"]
  if (!numericKeys.every((key) => safeInteger(record[key]))) return null
  const fragmentsValue = deliveryArray(state, record.fragments)
  if (fragmentsValue == null) return null
  const fragments: Record<string, unknown>[] = []
  for (const value of fragmentsValue) {
    const kind = deliveryDataField(value, "kind")
    const fragmentKeys = kind === "text"
      ? (authored ? ["kind", "lineageId", "contentXLayoutUnit", "xLayoutUnit", "advanceLayoutUnit"] : ["kind", "lineageId", "xLayoutUnit", "advanceLayoutUnit"])
      : kind === "inline-image"
        ? (authored ? ["kind", "lineageId", "contentXLayoutUnit", "contentYLayoutUnit", "xLayoutUnit", "yLayoutUnit", "widthLayoutUnit", "heightLayoutUnit"] : ["kind", "lineageId", "xLayoutUnit", "yLayoutUnit", "widthLayoutUnit", "heightLayoutUnit"])
        : null
    const fragment = fragmentKeys == null ? null : deliveryRecord(state, value, fragmentKeys)
    if (fragment == null || typeof fragment.lineageId !== "string") return null
    if (!Object.keys(fragment).filter((key) => key.endsWith("LayoutUnit")).every((key) => safeInteger(fragment[key]))) return null
    fragments.push({ ...fragment })
  }
  if (authored) return { ...record, fragments }
  const intervals = deliveryArray(state, record.availableIntervals)
  const placements = deliveryArray(state, record.intervalPlacements)
  if (intervals == null || placements == null) return null
  const copiedIntervals: Record<string, unknown>[] = []
  for (const value of intervals) {
    const interval = deliveryRecord(state, value, ["leftLayoutUnit", "rightLayoutUnit"])
    if (interval == null || !safeInteger(interval.leftLayoutUnit) || !safeInteger(interval.rightLayoutUnit) || interval.rightLayoutUnit < interval.leftLayoutUnit) return null
    copiedIntervals.push({ ...interval })
  }
  const copiedPlacements: Record<string, unknown>[] = []
  for (const value of placements) {
    const placement = deliveryRecord(state, value, ["localStartRenderedUtf16", "localEndRenderedUtf16", "intervalOrdinal", "leftLayoutUnit", "rightLayoutUnit"])
    if (placement == null || ![placement.localStartRenderedUtf16, placement.localEndRenderedUtf16, placement.intervalOrdinal, placement.leftLayoutUnit, placement.rightLayoutUnit].every((item) => safeInteger(item)) || (placement.localEndRenderedUtf16 as number) < (placement.localStartRenderedUtf16 as number) || (placement.rightLayoutUnit as number) < (placement.leftLayoutUnit as number)) return null
    copiedPlacements.push({ ...placement })
  }
  return { ...record, availableIntervals: copiedIntervals, intervalPlacements: copiedPlacements, fragments }
}

function parseDeliverySceneFragment(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const kind = deliveryDataField(value, "kind")
  const keys = kind === "text"
    ? ["kind", "lineageId", "sourceSpans", "paintRuns", "paintFingerprint", "fingerprint"]
    : kind === "inline-image"
      ? ["kind", "lineageId", "sourceSpans", "assetId", "authoredFrame", "paintFingerprint", "fingerprint"]
      : null
  const record = keys == null ? null : deliveryRecord(state, value, keys)
  const spans = record == null ? null : parseDeliverySpans(state, record.sourceSpans)
  if (record == null || spans == null || typeof record.lineageId !== "string" || typeof record.paintFingerprint !== "string" || typeof record.fingerprint !== "string") return null
  if (record.kind === "inline-image") {
    const authoredFrame = parseDeliveryAuthoredFrame(state, record.authoredFrame)
    return typeof record.assetId !== "string" || authoredFrame == null
      ? null
      : { ...record, sourceSpans: spans, authoredFrame }
  }
  const values = deliveryArray(state, record.paintRuns)
  if (values == null) return null
  const paintRuns: Record<string, unknown>[] = []
  for (const value of values) {
    const run = deliveryRecord(state, value, ["sourceSpan", "textColor", "textDecoration", "strikethrough", "authoredTextColor", "paintFingerprint"])
    const span = run == null ? null : parseDeliverySpan(state, run.sourceSpan)
    if (run == null || span == null || typeof run.textColor !== "string" || (run.textDecoration !== "none" && run.textDecoration !== "underline") || typeof run.strikethrough !== "boolean" || (run.authoredTextColor !== null && typeof run.authoredTextColor !== "string") || typeof run.paintFingerprint !== "string") return null
    paintRuns.push({ ...run, sourceSpan: span })
  }
  return { ...record, sourceSpans: spans, paintRuns }
}

function parseDeliveryChunk(
  state: DeliveryParseState,
  value: unknown,
): VNextTextBlockPersistentSceneChunkV2 | null {
  if (value == null || typeof value !== "object" || state.seen.has(value)) {
    return null
  }
  state.seen.add(value)
  const record = deliveryRecord(state, value, ["lineLineageId", "sourceMapping", "lineInternals", "contentLocalGeometry", "authoredBoxGeometry", "fragments", "lineInternalsFingerprint", "sourceFingerprint", "provenanceFingerprint", "paintFingerprint", "boundarySpatialContextFingerprint", "fingerprint"])
  if (record == null || typeof record.lineLineageId !== "string" || ![record.lineInternalsFingerprint, record.sourceFingerprint, record.provenanceFingerprint, record.paintFingerprint, record.boundarySpatialContextFingerprint, record.fingerprint].every((item) => typeof item === "string")) return null
  const mappingValues = deliveryArray(state, record.sourceMapping)
  const fragmentValues = deliveryArray(state, record.fragments)
  const lineInternals = parseDeliveryLineInternals(state, record.lineInternals)
  const contentLocalGeometry = parseDeliveryGeometry(state, record.contentLocalGeometry, false)
  const authoredBoxGeometry = parseDeliveryGeometry(state, record.authoredBoxGeometry, true)
  if (mappingValues == null || fragmentValues == null || lineInternals == null || contentLocalGeometry == null || authoredBoxGeometry == null) return null
  const sourceMapping: Record<string, unknown>[] = []
  for (const item of mappingValues) {
    const mapping = parseDeliverySourceMapping(state, item)
    if (mapping == null) return null
    sourceMapping.push(mapping)
  }
  const fragments: Record<string, unknown>[] = []
  for (const item of fragmentValues) {
    const fragment = parseDeliverySceneFragment(state, item)
    if (fragment == null) return null
    fragments.push(fragment)
  }
  return { ...record, sourceMapping, lineInternals, contentLocalGeometry, authoredBoxGeometry, fragments } as unknown as VNextTextBlockPersistentSceneChunkV2
}

function parseDeliverySourcePoint(
  state: DeliveryParseState,
  value: unknown,
): Record<string, unknown> | null {
  const record = deliveryRecord(state, value, ["lineageId", "localRenderedUtf16"])
  return record == null
    || typeof record.lineageId !== "string"
    || !safeInteger(record.localRenderedUtf16, 0)
    ? null
    : { ...record }
}

function parseDeliverySummary(
  state: DeliveryParseState,
  value: unknown,
): VNextTextBlockPersistentSceneSummaryV2 | null {
  const record = deliveryRecord(state, value, ["chunkCount", "lineCount", "textFragmentCount", "inlineImageFragmentCount", "leafCount", "nodeCount", "sourceRange", "authoredTopLayoutUnit", "authoredBottomLayoutUnit", "lineInternalsFingerprint", "sourceFingerprint", "provenanceFingerprint", "paintFingerprint", "boundarySpatialContextFingerprint"])
  if (
    record == null
    || ![record.chunkCount, record.lineCount, record.textFragmentCount, record.inlineImageFragmentCount, record.leafCount, record.nodeCount].every((item) => safeInteger(item, 0))
    || ![record.lineInternalsFingerprint, record.sourceFingerprint, record.provenanceFingerprint, record.paintFingerprint, record.boundarySpatialContextFingerprint].every((item) => typeof item === "string")
    || (record.authoredTopLayoutUnit !== null && !safeInteger(record.authoredTopLayoutUnit))
    || (record.authoredBottomLayoutUnit !== null && !safeInteger(record.authoredBottomLayoutUnit))
    || (record.authoredTopLayoutUnit !== null && record.authoredBottomLayoutUnit !== null && record.authoredBottomLayoutUnit < record.authoredTopLayoutUnit)
  ) return null
  const range = deliveryRecord(state, record.sourceRange, ["start", "end"])
  if (range == null) return null
  const start = range.start === null ? null : parseDeliverySourcePoint(state, range.start)
  const end = range.end === null ? null : parseDeliverySourcePoint(state, range.end)
  if ((range.start !== null && start == null) || (range.end !== null && end == null)) return null
  return {
    ...record,
    sourceRange: { start, end },
  } as unknown as VNextTextBlockPersistentSceneSummaryV2
}

function deliveryIssue(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
): VNextTextBlockSceneDeliveryPlanIssueV2 {
  return { code, message }
}

function blockedPlan(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
  work: VNextTextBlockSceneDeliveryPlanBuildWorkV2 = ZERO_PLAN_BUILD_WORK,
  proofUnavailableAuthority:
    VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2 | null =
      null,
): VNextTextBlockSceneDeliveryPlanBuildResultV2 {
  return Object.freeze({
    status: "blocked",
    plan: null,
    work,
    proofUnavailableAuthority,
    issues: Object.freeze([deliveryIssue(code, message)]),
  })
}

export interface VNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2 {
  readonly previousScene: VNextTextBlockPersistentSceneV2
  readonly nextScene: VNextTextBlockPersistentSceneV2
  readonly work: VNextTextBlockSceneDeliveryPlanBuildWorkV2
}

const retainProofFailureRecords = new WeakMap<
  VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2,
  VNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2
>()

export function getVNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2(
  authority: unknown,
): VNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2 | null {
  return authority != null && typeof authority === "object"
    ? retainProofFailureRecords.get(
      authority as VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2,
    ) ?? null
    : null
}

export function consumeVNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2(
  authority: VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2,
): VNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2 | null {
  const record = retainProofFailureRecords.get(authority) ?? null
  if (record != null) retainProofFailureRecords.delete(authority)
  return record
}

const ZERO_PLAN_BUILD_WORK = Object.freeze({
  constructionSceneTreeVisitCount: 0,
  verificationSceneTreeVisitCount: 0,
  deliveryOperationCount: 0,
  retainCoverNodeCount: 0,
})

function invalidInspection(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
  visitedSceneTreeNodeCount = 0,
): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  return { status: "invalid", code, message, visitedSceneTreeNodeCount }
}

function planCanonicalFacts(plan: VNextTextBlockSceneDeliveryPlanV2): unknown {
  return {
    source: plan.source,
    contractVersion: plan.contractVersion,
    status: plan.status,
    previousSceneFingerprint: plan.previousSceneFingerprint,
    nextSceneFingerprint: plan.nextSceneFingerprint,
    previousPayloadObservationFingerprint:
      plan.previousPayloadObservationFingerprint,
    nextPayloadObservationFingerprint: plan.nextPayloadObservationFingerprint,
    previousTreePolicyFingerprint: plan.previousTreePolicyFingerprint,
    nextTreePolicyFingerprint: plan.nextTreePolicyFingerprint,
    previousChunkCount: plan.previousChunkCount,
    nextChunkCount: plan.nextChunkCount,
    operations: plan.operations,
    summary: plan.summary,
    observations: plan.observations,
    work: plan.work,
  }
}

function validRange(
  range: VNextTextBlockSceneDeliveryRangeV2,
  limit: number,
): boolean {
  return Number.isSafeInteger(range.start)
    && Number.isSafeInteger(range.end)
    && range.start >= 0
    && range.end >= range.start
    && range.end <= limit
}

function rangeLength(range: VNextTextBlockSceneDeliveryRangeV2): number {
  return range.end - range.start
}

interface SelectedSceneNode {
  readonly node: VNextTextBlockPersistentSceneNodeV2
  readonly path: readonly number[]
  readonly start: number
  readonly end: number
}

interface SelectedSceneNodesResult {
  readonly selected: readonly SelectedSceneNode[]
  readonly visitedNodeCount: number
  readonly completed: boolean
}

function selectMaximalNodes(
  root: VNextTextBlockPersistentSceneRootV2,
  range: VNextTextBlockSceneDeliveryRangeV2,
  beforeNodeVisit?: () => boolean,
  beforeNodeSelection?: () => boolean,
): SelectedSceneNodesResult {
  if (range.start === range.end || root.nodeKind === "empty") {
    return Object.freeze({
      selected: Object.freeze([]),
      visitedNodeCount: 0,
      completed: true,
    })
  }
  const selected: SelectedSceneNode[] = []
  let visitedNodeCount = 0
  const visit = (
    node: VNextTextBlockPersistentSceneNodeV2,
    start: number,
    path: readonly number[],
  ): boolean => {
    if (beforeNodeVisit?.() === false) return false
    visitedNodeCount = safeAdd(visitedNodeCount, 1)
    const end = start + node.summary.chunkCount
    if (end <= range.start || start >= range.end) return true
    if (range.start <= start && end <= range.end) {
      if (beforeNodeSelection?.() === false) return false
      selected.push({ node, path, start, end })
      return true
    }
    if (node.nodeKind === "leaf") {
      throw new Error("partial scene leaf")
    }
    let childStart = start
    for (
      let childIndex = 0;
      childIndex < node.children.length;
      childIndex += 1
    ) {
      const child = node.children[childIndex]!
      if (!visit(child, childStart, [...path, childIndex])) return false
      childStart += child.summary.chunkCount
    }
    return true
  }
  const completed = visit(root, 0, [])
  return Object.freeze({
    selected: Object.freeze(selected),
    visitedNodeCount,
    completed,
  })
}

function chunksFromSelected(
  selected: readonly SelectedSceneNode[],
  beforeNodeVisit?: () => boolean,
): {
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly visitedNodeCount: number
  readonly completed: boolean
} {
  const chunks: VNextTextBlockPersistentSceneChunkV2[] = []
  let visitedNodeCount = 0
  const visit = (node: VNextTextBlockPersistentSceneNodeV2): boolean => {
    if (beforeNodeVisit?.() === false) return false
    visitedNodeCount += 1
    if (node.nodeKind === "leaf") {
      chunks.push(node.chunk)
      return true
    }
    for (const child of node.children) {
      if (!visit(child)) return false
    }
    return true
  }
  for (const item of selected) {
    if (!visit(item.node)) {
      return { chunks, visitedNodeCount, completed: false }
    }
  }
  return { chunks, visitedNodeCount, completed: true }
}

function sameSelectedNodeIdentity(
  previous: readonly SelectedSceneNode[],
  next: readonly SelectedSceneNode[],
): boolean {
  return previous.length === next.length
    && previous.every((item, index) => item.node === next[index]?.node)
}

function exactRange(value: unknown): VNextTextBlockSceneDeliveryRangeV2 | null {
  const record = exactRecord(value, ["start", "end"])
  return record == null
    || !safeInteger(record.start, 0)
    || !safeInteger(record.end, 0)
    || record.end < record.start
    ? null
    : { start: record.start, end: record.end }
}

function exactDraftOperations(
  value: unknown,
): readonly VNextTextBlockSceneDeliveryOperationDraftV2[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: VNextTextBlockSceneDeliveryOperationDraftV2[] = []
  for (const item of values) {
    const record = exactRecord(item, [
      "kind",
      "previousRange",
      "nextRange",
    ])
    const previousRange = record == null
      ? null
      : exactRange(record.previousRange)
    const nextRange = record == null ? null : exactRange(record.nextRange)
    if (
      record == null
      || (
        record.kind !== "retain-range"
        && record.kind !== "splice-range"
      )
      || previousRange == null
      || nextRange == null
    ) return null
    output.push({
      kind: record.kind,
      previousRange,
      nextRange,
    })
  }
  return output
}

function exactBuilderInput(value: unknown): {
  readonly previousScene: unknown
  readonly nextScene: unknown
  readonly operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[]
} | null {
  const record = exactRecord(value, [
    "previousScene",
    "nextScene",
    "operations",
  ])
  if (record == null) return null
  const operations = exactDraftOperations(record.operations)
  return operations == null
    ? null
    : {
        previousScene: record.previousScene,
        nextScene: record.nextScene,
        operations,
      }
}

function validateDraftCoverage(
  operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[],
  previousCount: number,
  nextCount: number,
): VNextTextBlockSceneDeliveryPlanIssueV2 | null {
  let previousCursor = 0
  let nextCursor = 0
  for (const operation of operations) {
    if (
      !validRange(operation.previousRange, previousCount)
      || !validRange(operation.nextRange, nextCount)
    ) {
      return deliveryIssue(
        "invalid-input",
        "delivery operation contains an unsafe or out-of-domain range",
      )
    }
    if (
      operation.previousRange.start < previousCursor
      || operation.nextRange.start < nextCursor
    ) {
      return deliveryIssue(
        "delivery-plan-range-overlap",
        "delivery ranges overlap or move backwards",
      )
    }
    if (
      operation.previousRange.start > previousCursor
      || operation.nextRange.start > nextCursor
    ) {
      return deliveryIssue(
        "delivery-plan-range-gap",
        "delivery ranges contain an uncovered gap",
      )
    }
    const previousLength = rangeLength(operation.previousRange)
    const nextLength = rangeLength(operation.nextRange)
    if (previousLength === 0 && nextLength === 0) {
      return deliveryIssue(
        "delivery-plan-empty-operation",
        "delivery operation may not have two empty ranges",
      )
    }
    if (
      operation.kind === "retain-range"
      && (
        previousLength === 0
        || previousLength !== nextLength
      )
    ) {
      return deliveryIssue(
        "delivery-plan-retain-length-mismatch",
        "retain operation requires equal non-empty ranges",
      )
    }
    previousCursor = operation.previousRange.end
    nextCursor = operation.nextRange.end
  }
  return previousCursor === previousCount && nextCursor === nextCount
    ? null
    : deliveryIssue(
        "delivery-plan-range-nonexhaustive",
        "delivery operations do not exhaust both immutable domains",
      )
}

function normalizeDrafts(
  operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[],
): readonly VNextTextBlockSceneDeliveryOperationDraftV2[] {
  const normalized: VNextTextBlockSceneDeliveryOperationDraftV2[] = []
  for (const operation of operations) {
    const previous = normalized[normalized.length - 1]
    if (
      previous != null
      && previous.kind === operation.kind
      && previous.previousRange.end === operation.previousRange.start
      && previous.nextRange.end === operation.nextRange.start
    ) {
      normalized[normalized.length - 1] = {
        kind: operation.kind,
        previousRange: {
          start: previous.previousRange.start,
          end: operation.previousRange.end,
        },
        nextRange: {
          start: previous.nextRange.start,
          end: operation.nextRange.end,
        },
      }
    } else {
      normalized.push(operation)
    }
  }
  return normalized
}

function replacementPayloadEstimate(
  chunks: readonly VNextTextBlockPersistentSceneChunkV2[],
): number {
  let total = 0
  for (const chunk of chunks) {
    total = safeAdd(total, utf8ByteCount({
      payloadPolicyVersion: 1,
      chunk,
    }))
  }
  return total
}

function operationPayloadObservationFingerprint(
  operation: VNextTextBlockSceneDeliveryOperationV2,
): string {
  return fingerprint(operation.kind === "retain-range"
    ? {
        kind: operation.kind,
        retainedSubtreePayloadObservationFingerprints:
          operation.retainedSubtrees.map((retained) =>
            retained.payloadObservationFingerprint
          ),
      }
    : {
        kind: operation.kind,
        replacementChunkFingerprints: operation.replacementChunks.map(
          (chunk) => chunk.fingerprint,
        ),
        estimatedCanonicalPayloadByteCount:
          replacementPayloadEstimate(operation.replacementChunks),
      })
}

function planPayloadObservationFingerprint(input: {
  readonly previousSceneFingerprint: string
  readonly nextSceneFingerprint: string
  readonly previousPayloadObservationFingerprint: string
  readonly nextPayloadObservationFingerprint: string
  readonly estimatedCanonicalPayloadByteCount: number
  readonly operations: readonly VNextTextBlockSceneDeliveryOperationV2[]
}): string {
  return fingerprint({
    previousSceneFingerprint: input.previousSceneFingerprint,
    nextSceneFingerprint: input.nextSceneFingerprint,
    previousPayloadObservationFingerprint:
      input.previousPayloadObservationFingerprint,
    nextPayloadObservationFingerprint:
      input.nextPayloadObservationFingerprint,
    estimatedCanonicalPayloadByteCount:
      input.estimatedCanonicalPayloadByteCount,
    operationPayloadObservationFingerprints: input.operations.map(
      operationPayloadObservationFingerprint,
    ),
  })
}

export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: VNextTextBlockSceneDeliveryPlanCandidateInputV2,
  context?: VNextTextBlockSceneDeliveryVisitContextInternalV2,
): VNextTextBlockSceneDeliveryPlanBuildResultV2
export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
  context?: VNextTextBlockSceneDeliveryVisitContextInternalV2,
): VNextTextBlockSceneDeliveryPlanBuildResultV2
export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
  context?: VNextTextBlockSceneDeliveryVisitContextInternalV2,
): VNextTextBlockSceneDeliveryPlanBuildResultV2 {
  let constructionSceneTreeVisitCount = 0
  let verificationSceneTreeVisitCount = 0
  let deliveryOperationCount = 0
  let retainCoverNodeCount = 0
  let completedCandidateWork = context?.completedCandidateWork ?? null
  let visitFailure:
    | Exclude<
        ReturnType<typeof evaluateNextVNextTextBlockStageVisitInternalV1>,
        { readonly status: "accepted" }
      >
    | null = null
  const currentWork = (): VNextTextBlockSceneDeliveryPlanBuildWorkV2 =>
    Object.freeze({
      constructionSceneTreeVisitCount,
      verificationSceneTreeVisitCount,
      deliveryOperationCount,
      retainCoverNodeCount,
    })
  const block = (
    code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
    message: string,
  ): VNextTextBlockSceneDeliveryPlanBuildResultV2 => {
    const result = blockedPlan(code, message, currentWork())
    return completedCandidateWork == null
      ? result
      : Object.freeze({ ...result, completedCandidateWork })
  }
  const beforeVisit = (
    phase: DeliveryVisitPhaseInternalV2,
    unit: DeliveryVisitUnitInternalV2,
    commit: () => void,
  ): boolean => {
    if (context == null) {
      if (unit === "scene-tree-lookup-nodes") commit()
      return true
    }
    if (completedCandidateWork == null) return false
    const completedWork = unit === "scene-tree-lookup-nodes"
      ? completedCandidateWork.deliveryPlan.visitedSceneTreeNodeCount
      : unit === "delivery-operations"
        ? completedCandidateWork.deliveryPlan.deliveryOperationCount
        : completedCandidateWork.deliveryPlan.retainCoverNodeCount
    const evaluation = evaluateNextVNextTextBlockStageVisitInternalV1({
      validatedChange: context.validatedChange,
      stage: "delivery-plan",
      unit,
      completedWork,
      completedCandidateWork,
    })
    if (evaluation.status !== "accepted") {
      visitFailure = evaluation
      return false
    }
    commit()
    completedCandidateWork = withDeliveryVisitWorkInternalV2({
      base: completedCandidateWork,
      unit,
      count: evaluation.attemptedWork,
    })
    deliveryOperationObserverForTest?.({
      phase,
      unit,
      completedWork: evaluation.attemptedWork,
    })
    return true
  }
  const visitResult = (): VNextTextBlockSceneDeliveryPlanBuildResultV2 => {
    if (visitFailure == null || completedCandidateWork == null) {
      throw new Error("delivery visit failure lost exact evaluator work")
    }
    return Object.freeze({
      status: visitFailure.status,
      plan: null,
      work: currentWork(),
      proofUnavailableAuthority: null,
      attemptedWork: visitFailure.attemptedWork,
      effectiveLimit: visitFailure.effectiveLimit,
      ...(visitFailure.status === "limit-exceeded"
        ? { evaluatorAuthority: visitFailure.evaluatorAuthority }
        : {}),
      completedCandidateWork,
      issues: Object.freeze([]) as readonly [],
    })
  }
  const exact = exactBuilderInput(input)
  if (
    exact == null
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.previousScene,
    )
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.nextScene,
    )
  ) {
    return block(
      "invalid-input",
      "plan construction requires exact prepared scenes and operation drafts",
    )
  }
  const previousScene = exact.previousScene
  const nextScene = exact.nextScene
  const coverageIssue = validateDraftCoverage(
    exact.operations,
    previousScene.root.summary.chunkCount,
    nextScene.root.summary.chunkCount,
  )
  if (coverageIssue != null) {
    return block(coverageIssue.code, coverageIssue.message)
  }
  try {
    const operations: VNextTextBlockSceneDeliveryOperationV2[] = []
    for (const draft of normalizeDrafts(exact.operations)) {
      if (!beforeVisit(
        "construction",
        "delivery-operations",
        () => { deliveryOperationCount = safeAdd(deliveryOperationCount, 1) },
      )) return visitResult()
      if (draft.kind === "retain-range") {
        const previousSelected = selectMaximalNodes(
          previousScene.root,
          draft.previousRange,
          () => beforeVisit(
            "construction",
            "scene-tree-lookup-nodes",
            () => {
              constructionSceneTreeVisitCount = safeAdd(
                constructionSceneTreeVisitCount,
                1,
              )
            },
          ),
          () => beforeVisit(
            "construction",
            "retain-cover-nodes",
            () => { retainCoverNodeCount = safeAdd(retainCoverNodeCount, 1) },
          ),
        )
        if (!previousSelected.completed) return visitResult()
        const nextSelected = selectMaximalNodes(
          nextScene.root,
          draft.nextRange,
          () => beforeVisit(
            "construction",
            "scene-tree-lookup-nodes",
            () => {
              constructionSceneTreeVisitCount = safeAdd(
                constructionSceneTreeVisitCount,
                1,
              )
            },
          ),
        )
        if (!nextSelected.completed) return visitResult()
        if (!sameSelectedNodeIdentity(
          previousSelected.selected,
          nextSelected.selected,
        )) {
          const work = currentWork()
          const proofUnavailableAuthority = Object.freeze({}) as unknown as
            VNextTextBlockSceneDeliveryRetainProofFailureAuthorityInternalV2
          retainProofFailureRecords.set(proofUnavailableAuthority, {
            previousScene,
            nextScene,
            work,
          })
          const blocked = blockedPlan(
            "delivery-plan-retain-payload-mismatch",
            "retain range does not name exact shared scene subtrees",
            work,
            proofUnavailableAuthority,
          )
          return completedCandidateWork == null
            ? blocked
            : Object.freeze({ ...blocked, completedCandidateWork })
        }
        operations.push({
          kind: "retain-range",
          previousRange: draft.previousRange,
          nextRange: draft.nextRange,
          retainedSubtrees: previousSelected.selected.map((selected) => ({
            previousPath: selected.path,
            fingerprint: selected.node.fingerprint,
            payloadObservationFingerprint:
              selected.node.payloadObservation.payloadObservationFingerprint,
            chunkCount: selected.node.summary.chunkCount,
          })),
        })
        if (context == null) {
          deliveryOperationCount = safeAdd(deliveryOperationCount, 1)
          retainCoverNodeCount = safeAdd(
            retainCoverNodeCount,
            previousSelected.selected.length,
          )
        }
      } else {
        const selected = selectMaximalNodes(
          nextScene.root,
          draft.nextRange,
          () => beforeVisit(
            "construction",
            "scene-tree-lookup-nodes",
            () => {
              constructionSceneTreeVisitCount = safeAdd(
                constructionSceneTreeVisitCount,
                1,
              )
            },
          ),
        )
        if (!selected.completed) return visitResult()
        const replacement = chunksFromSelected(
          selected.selected,
          () => beforeVisit(
            "construction",
            "scene-tree-lookup-nodes",
            () => {
              constructionSceneTreeVisitCount = safeAdd(
                constructionSceneTreeVisitCount,
                1,
              )
            },
          ),
        )
        if (!replacement.completed) return visitResult()
        operations.push({
          kind: "splice-range",
          previousRange: draft.previousRange,
          nextRange: draft.nextRange,
          replacementChunks: replacement.chunks,
        })
        if (context == null) {
          deliveryOperationCount = safeAdd(deliveryOperationCount, 1)
        }
      }
    }
    let retainOperationCount = 0
    let spliceOperationCount = 0
    let retainedSubtreeCount = 0
    let replacementChunkCount = 0
    let estimatedCanonicalPayloadByteCount = 0
    for (const operation of operations) {
      if (operation.kind === "retain-range") {
        retainOperationCount += 1
        retainedSubtreeCount = safeAdd(
          retainedSubtreeCount,
          operation.retainedSubtrees.length,
        )
      } else {
        spliceOperationCount += 1
        replacementChunkCount = safeAdd(
          replacementChunkCount,
          operation.replacementChunks.length,
        )
        estimatedCanonicalPayloadByteCount = safeAdd(
          estimatedCanonicalPayloadByteCount,
          replacementPayloadEstimate(operation.replacementChunks),
        )
      }
    }
    const summary = {
      retainOperationCount,
      spliceOperationCount,
      retainedSubtreeCount,
      replacementChunkCount,
    }
    const observations = {
      estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint: planPayloadObservationFingerprint({
        previousSceneFingerprint: previousScene.fingerprint,
        nextSceneFingerprint: nextScene.fingerprint,
        previousPayloadObservationFingerprint:
          previousScene.payloadObservation.payloadObservationFingerprint,
        nextPayloadObservationFingerprint:
          nextScene.payloadObservation.payloadObservationFingerprint,
        estimatedCanonicalPayloadByteCount,
        operations,
      }),
    }
    const work = {
      visitedOperationCount: operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      completePreviousSceneTraversalCount: 0 as const,
      completeNextSceneTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION,
      status: "accepted" as const,
      previousSceneFingerprint: previousScene.fingerprint,
      nextSceneFingerprint: nextScene.fingerprint,
      previousPayloadObservationFingerprint:
        previousScene.payloadObservation.payloadObservationFingerprint,
      nextPayloadObservationFingerprint:
        nextScene.payloadObservation.payloadObservationFingerprint,
      previousTreePolicyFingerprint: previousScene.policy.fingerprint,
      nextTreePolicyFingerprint: nextScene.policy.fingerprint,
      previousChunkCount: previousScene.root.summary.chunkCount,
      nextChunkCount: nextScene.root.summary.chunkCount,
      operations,
      summary,
      observations,
      work,
    }
    const withoutFingerprint = deepFreeze(facts)
    const plan = Object.freeze({
      ...withoutFingerprint,
      fingerprint: fingerprint(planCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      })),
    })
    const inspection =
      verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene,
        nextScene,
        plan,
      }, {
        beforeSceneNodeVisit: () => beforeVisit(
          "verification",
          "scene-tree-lookup-nodes",
          () => {
            verificationSceneTreeVisitCount = safeAdd(
              verificationSceneTreeVisitCount,
              1,
            )
          },
        ),
      })
    if (visitFailure != null) return visitResult()
    if (inspection.status !== "valid") {
      return block(inspection.code, inspection.message)
    }
    return Object.freeze({
      status: "prepared",
      plan,
      work: currentWork(),
      ...(completedCandidateWork == null ? {} : { completedCandidateWork }),
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return block(
      "delivery-plan-unsafe-count",
      "delivery plan exceeded safe range, payload, or work arithmetic",
    )
  }
}

function exactPath(value: unknown): readonly number[] | null {
  const values = exactArray(value)
  if (
    values == null
    || values.some(
      (item) => !Number.isSafeInteger(item) || (item as number) < 0,
    )
  ) return null
  return values as readonly number[]
}

function exactRetainedSubtrees(value: unknown): readonly {
  readonly previousPath: readonly number[]
  readonly fingerprint: string
  readonly payloadObservationFingerprint: string
  readonly chunkCount: number
}[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: {
    readonly previousPath: readonly number[]
    readonly fingerprint: string
    readonly payloadObservationFingerprint: string
    readonly chunkCount: number
  }[] = []
  for (const item of values) {
    const record = exactRecord(item, [
      "previousPath",
      "fingerprint",
      "payloadObservationFingerprint",
      "chunkCount",
    ])
    const previousPath = record == null ? null : exactPath(record.previousPath)
    if (
      record == null
      || previousPath == null
      || typeof record.fingerprint !== "string"
      || typeof record.payloadObservationFingerprint !== "string"
      || !safeInteger(record.chunkCount)
    ) return null
    output.push({
      previousPath,
      fingerprint: record.fingerprint,
      payloadObservationFingerprint: record.payloadObservationFingerprint,
      chunkCount: record.chunkCount,
    })
  }
  return output
}

function exactPlanOperations(
  value: unknown,
  state: DeliveryParseState,
  preserveReplacementIdentity: boolean,
): readonly VNextTextBlockSceneDeliveryOperationV2[] | null {
  const values = deliveryArray(state, value)
  if (values == null) return null
  const output: VNextTextBlockSceneDeliveryOperationV2[] = []
  for (const item of values) {
    if (item == null || typeof item !== "object") return null
    const kind = Object.getOwnPropertyDescriptor(item, "kind")
    if (
      kind == null
      || !Object.hasOwn(kind, "value")
      || kind.enumerable !== true
    ) return null
    if (kind.value === "retain-range") {
      const record = exactRecord(item, [
        "kind",
        "previousRange",
        "nextRange",
        "retainedSubtrees",
      ])
      const previousRange = record == null
        ? null
        : exactRange(record.previousRange)
      const nextRange = record == null ? null : exactRange(record.nextRange)
      const retainedSubtrees = record == null
        ? null
        : exactRetainedSubtrees(record.retainedSubtrees)
      if (
        previousRange == null
        || nextRange == null
        || retainedSubtrees == null
      ) return null
      output.push({
        kind: "retain-range",
        previousRange,
        nextRange,
        retainedSubtrees,
      })
    } else if (kind.value === "splice-range") {
      const record = exactRecord(item, [
        "kind",
        "previousRange",
        "nextRange",
        "replacementChunks",
      ])
      const previousRange = record == null
        ? null
        : exactRange(record.previousRange)
      const nextRange = record == null ? null : exactRange(record.nextRange)
      const replacementValues = record == null
        ? null
        : deliveryArray(state, record.replacementChunks)
      if (
        previousRange == null
        || nextRange == null
        || replacementValues == null
      ) return null
      const replacementChunks: VNextTextBlockPersistentSceneChunkV2[] = []
      for (const value of replacementValues) {
        const chunk = parseDeliveryChunk(state, value)
        if (chunk == null) return null
        replacementChunks.push(preserveReplacementIdentity
          ? value as VNextTextBlockPersistentSceneChunkV2
          : chunk)
      }
      output.push({
        kind: "splice-range",
        previousRange,
        nextRange,
        replacementChunks,
      })
    } else {
      return null
    }
  }
  return output
}

function exactPlan(
  value: unknown,
  preserveReplacementIdentity = false,
): VNextTextBlockSceneDeliveryPlanV2 | null {
  const record = exactRecord(value, [
    "source",
    "contractVersion",
    "status",
    "previousSceneFingerprint",
    "nextSceneFingerprint",
    "previousPayloadObservationFingerprint",
    "nextPayloadObservationFingerprint",
    "previousTreePolicyFingerprint",
    "nextTreePolicyFingerprint",
    "previousChunkCount",
    "nextChunkCount",
    "operations",
    "summary",
    "observations",
    "work",
    "fingerprint",
  ])
  if (record == null) return null
  const state: DeliveryParseState = { seen: new WeakSet<object>() }
  const operations = exactPlanOperations(
    record.operations,
    state,
    preserveReplacementIdentity,
  )
  const summary = exactRecord(record.summary, [
    "retainOperationCount",
    "spliceOperationCount",
    "retainedSubtreeCount",
    "replacementChunkCount",
  ])
  const observations = exactRecord(record.observations, [
    "estimatedCanonicalPayloadByteCount",
    "payloadObservationFingerprint",
  ])
  const work = exactRecord(record.work, [
    "visitedOperationCount",
    "visitedRetainCoverNodeCount",
    "visitedReplacementChunkCount",
    "completePreviousSceneTraversalCount",
    "completeNextSceneTraversalCount",
  ])
  if (
    operations == null
    || summary == null
    || observations == null
    || work == null
    || typeof record.previousSceneFingerprint !== "string"
    || typeof record.nextSceneFingerprint !== "string"
    || typeof record.previousPayloadObservationFingerprint !== "string"
    || typeof record.nextPayloadObservationFingerprint !== "string"
    || typeof record.previousTreePolicyFingerprint !== "string"
    || typeof record.nextTreePolicyFingerprint !== "string"
    || !safeInteger(record.previousChunkCount)
    || !safeInteger(record.nextChunkCount)
    || typeof record.fingerprint !== "string"
    || ![summary.retainOperationCount, summary.spliceOperationCount, summary.retainedSubtreeCount, summary.replacementChunkCount, observations.estimatedCanonicalPayloadByteCount, work.visitedOperationCount, work.visitedRetainCoverNodeCount, work.visitedReplacementChunkCount].every((item) => safeInteger(item))
    || work.completePreviousSceneTraversalCount !== 0
    || work.completeNextSceneTraversalCount !== 0
    || typeof observations.payloadObservationFingerprint !== "string"
  ) return null
  return {
    source: record.source as VNextTextBlockSceneDeliveryPlanV2["source"],
    contractVersion:
      record.contractVersion as VNextTextBlockSceneDeliveryPlanV2[
        "contractVersion"
      ],
    status: record.status as "accepted",
    previousSceneFingerprint: record.previousSceneFingerprint,
    nextSceneFingerprint: record.nextSceneFingerprint,
    previousPayloadObservationFingerprint:
      record.previousPayloadObservationFingerprint,
    nextPayloadObservationFingerprint: record.nextPayloadObservationFingerprint,
    previousTreePolicyFingerprint: record.previousTreePolicyFingerprint,
    nextTreePolicyFingerprint: record.nextTreePolicyFingerprint,
    previousChunkCount: record.previousChunkCount,
    nextChunkCount: record.nextChunkCount,
    operations,
    summary: summary as unknown as VNextTextBlockSceneDeliveryPlanV2[
      "summary"
    ],
    observations: observations as unknown as VNextTextBlockSceneDeliveryPlanV2[
      "observations"
    ],
    work: work as unknown as VNextTextBlockSceneDeliveryPlanV2["work"],
    fingerprint: record.fingerprint,
  }
}

function exactVerifierInput(value: unknown): {
  readonly previousScene: unknown
  readonly nextScene: unknown
  readonly plan: unknown
} | null {
  const record = exactRecord(value, [
    "previousScene",
    "nextScene",
    "plan",
  ])
  return record == null
    ? null
    : {
        previousScene: record.previousScene,
        nextScene: record.nextScene,
        plan: record.plan,
      }
}

function retainedCoverMatches(
  actual: VNextTextBlockSceneDeliveryOperationV2 & {
    readonly kind: "retain-range"
  },
  expected: readonly SelectedSceneNode[],
): boolean {
  return actual.retainedSubtrees.length === expected.length
    && actual.retainedSubtrees.every((retained, index) => {
      const selected = expected[index]
      return selected != null
        && retained.fingerprint === selected.node.fingerprint
        && retained.payloadObservationFingerprint
          === selected.node.payloadObservation.payloadObservationFingerprint
        && retained.chunkCount === selected.node.summary.chunkCount
        && retained.previousPath.length === selected.path.length
        && retained.previousPath.every(
          (part, pathIndex) => part === selected.path[pathIndex],
        )
    })
}

function exactSummaryEquals(
  left: unknown,
  right: unknown,
): boolean {
  return stringifyVNextCanonicalJson(left)
    === stringifyVNextCanonicalJson(right)
}

export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: {
    readonly previousScene: VNextTextBlockPersistentSceneV2
    readonly nextScene: VNextTextBlockPersistentSceneV2
    readonly plan: unknown
  },
  options?: { readonly beforeSceneNodeVisit?: () => boolean },
): VNextTextBlockSceneDeliveryPlanInspectionV2
export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
  options?: { readonly beforeSceneNodeVisit?: () => boolean },
): VNextTextBlockSceneDeliveryPlanInspectionV2
export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
  options?: { readonly beforeSceneNodeVisit?: () => boolean },
): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  planVerificationObserverForTest?.()
  return verifyDeliveryPlanV2(input, true, options)
}

function verifyDeliveryPlanV2(
  input: unknown,
  requireExactReplacementIdentity: boolean,
  options?: { readonly beforeSceneNodeVisit?: () => boolean },
): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  let visitedSceneTreeNodeCount = 0
  const invalidAfterTraversal = (
    code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
    message: string,
  ): VNextTextBlockSceneDeliveryPlanInspectionV2 =>
    invalidInspection(code, message, visitedSceneTreeNodeCount)
  const exact = exactVerifierInput(input)
  if (
    exact == null
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.previousScene,
    )
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.nextScene,
    )
  ) {
    return invalidInspection(
      "delivery-scene-authority-mismatch",
      "candidate verification requires exact prepared scenes",
    )
  }
  const plan = exactPlan(exact.plan, requireExactReplacementIdentity)
  if (plan == null) {
    return invalidInspection(
      "invalid-input",
      "delivery plan is not an exact accessor-free V2 data shape",
    )
  }
  const previousScene = exact.previousScene
  const nextScene = exact.nextScene
  if (
    plan.source !== VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE
    || plan.contractVersion
      !== VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION
    || plan.status !== "accepted"
  ) {
    return invalidInspection(
      "delivery-plan-source-mismatch",
      "delivery plan source/version/status is unsupported",
    )
  }
  if (
    plan.previousSceneFingerprint !== previousScene.fingerprint
    || plan.nextSceneFingerprint !== nextScene.fingerprint
    || plan.previousChunkCount !== previousScene.root.summary.chunkCount
    || plan.nextChunkCount !== nextScene.root.summary.chunkCount
  ) {
    return invalidInspection(
      "delivery-plan-scene-binding-mismatch",
      "delivery plan does not bind the exact scene domains",
    )
  }
  if (
    plan.previousTreePolicyFingerprint !== previousScene.policy.fingerprint
    || plan.nextTreePolicyFingerprint !== nextScene.policy.fingerprint
  ) {
    return invalidInspection(
      "delivery-plan-scene-binding-mismatch",
      "delivery plan does not bind the exact scene tree policies",
    )
  }
  if (
    plan.previousPayloadObservationFingerprint
      !== previousScene.payloadObservation.payloadObservationFingerprint
    || plan.nextPayloadObservationFingerprint
      !== nextScene.payloadObservation.payloadObservationFingerprint
  ) {
    return invalidInspection(
      "delivery-plan-scene-binding-mismatch",
      "delivery plan does not bind the exact scene payload observations",
    )
  }
  let previousCursor = 0
  let nextCursor = 0
  let retainOperationCount = 0
  let spliceOperationCount = 0
  let retainedSubtreeCount = 0
  let replacementChunkCount = 0
  let estimatedCanonicalPayloadByteCount = 0
  try {
    for (let index = 0; index < plan.operations.length; index += 1) {
      const operation = plan.operations[index]!
      if (
        !validRange(operation.previousRange, plan.previousChunkCount)
        || !validRange(operation.nextRange, plan.nextChunkCount)
      ) {
        return invalidAfterTraversal(
          "invalid-input",
          "delivery plan contains an unsafe or out-of-domain range",
        )
      }
      if (
        operation.previousRange.start < previousCursor
        || operation.nextRange.start < nextCursor
      ) {
        return invalidAfterTraversal(
          "delivery-plan-range-overlap",
          "delivery plan ranges overlap or move backwards",
        )
      }
      if (
        operation.previousRange.start > previousCursor
        || operation.nextRange.start > nextCursor
      ) {
        return invalidAfterTraversal(
          "delivery-plan-range-gap",
          "delivery plan ranges contain a gap",
        )
      }
      if (
        index > 0
        && plan.operations[index - 1]!.kind === operation.kind
      ) {
        return invalidAfterTraversal(
          "delivery-plan-nonmaximal-operation",
          "adjacent delivery operations of one kind must be merged",
        )
      }
      const previousLength = rangeLength(operation.previousRange)
      const nextLength = rangeLength(operation.nextRange)
      if (previousLength === 0 && nextLength === 0) {
        return invalidAfterTraversal(
          "delivery-plan-empty-operation",
          "delivery operation may not have two empty ranges",
        )
      }
      if (operation.kind === "retain-range") {
        retainOperationCount += 1
        if (previousLength === 0 || previousLength !== nextLength) {
          return invalidAfterTraversal(
            "delivery-plan-retain-length-mismatch",
            "retain operation requires equal non-empty ranges",
          )
        }
        const previousSelected = selectMaximalNodes(
          previousScene.root,
          operation.previousRange,
          options?.beforeSceneNodeVisit,
        )
        visitedSceneTreeNodeCount = safeAdd(
          visitedSceneTreeNodeCount,
          previousSelected.visitedNodeCount,
        )
        if (!previousSelected.completed) {
          return invalidAfterTraversal(
            "delivery-plan-unsafe-count",
            "delivery verification scene visit was rejected",
          )
        }
        const nextSelected = selectMaximalNodes(
          nextScene.root,
          operation.nextRange,
          options?.beforeSceneNodeVisit,
        )
        visitedSceneTreeNodeCount = safeAdd(
          visitedSceneTreeNodeCount,
          nextSelected.visitedNodeCount,
        )
        if (!nextSelected.completed) {
          return invalidAfterTraversal(
            "delivery-plan-unsafe-count",
            "delivery verification scene visit was rejected",
          )
        }
        if (!sameSelectedNodeIdentity(
          previousSelected.selected,
          nextSelected.selected,
        )) {
          return invalidAfterTraversal(
            "delivery-plan-retain-payload-mismatch",
            "retain operation does not map exact shared subtrees",
          )
        }
        if (!retainedCoverMatches(operation, previousSelected.selected)) {
          return invalidAfterTraversal(
            "delivery-plan-retain-cover-mismatch",
            "retain operation is not the greedy maximal-subtree cover",
          )
        }
        retainedSubtreeCount = safeAdd(
          retainedSubtreeCount,
          operation.retainedSubtrees.length,
        )
      } else {
        spliceOperationCount += 1
        const selected = selectMaximalNodes(
          nextScene.root,
          operation.nextRange,
          options?.beforeSceneNodeVisit,
        )
        visitedSceneTreeNodeCount = safeAdd(
          visitedSceneTreeNodeCount,
          selected.visitedNodeCount,
        )
        if (!selected.completed) {
          return invalidAfterTraversal(
            "delivery-plan-unsafe-count",
            "delivery verification scene visit was rejected",
          )
        }
        const selectedChunks = chunksFromSelected(
          selected.selected,
          options?.beforeSceneNodeVisit,
        )
        visitedSceneTreeNodeCount = safeAdd(
          visitedSceneTreeNodeCount,
          selectedChunks.visitedNodeCount,
        )
        if (!selectedChunks.completed) {
          return invalidAfterTraversal(
            "delivery-plan-unsafe-count",
            "delivery verification scene visit was rejected",
          )
        }
        const expected = selectedChunks.chunks
        if (
          expected.length !== operation.replacementChunks.length
          || expected.some(
            (chunk, chunkIndex) =>
              requireExactReplacementIdentity
                ? chunk !== operation.replacementChunks[chunkIndex]
                : !exactSummaryEquals(
                    chunk,
                    operation.replacementChunks[chunkIndex],
                  ),
          )
        ) {
          return invalidAfterTraversal(
            "delivery-plan-replacement-mismatch",
            "splice replacement chunks are not canonical next-range data",
          )
        }
        replacementChunkCount = safeAdd(
          replacementChunkCount,
          operation.replacementChunks.length,
        )
        estimatedCanonicalPayloadByteCount = safeAdd(
          estimatedCanonicalPayloadByteCount,
          replacementPayloadEstimate(operation.replacementChunks),
        )
      }
      previousCursor = operation.previousRange.end
      nextCursor = operation.nextRange.end
    }
    if (
      previousCursor !== plan.previousChunkCount
      || nextCursor !== plan.nextChunkCount
    ) {
      return invalidAfterTraversal(
        "delivery-plan-range-nonexhaustive",
        "delivery plan does not exhaust both scene domains",
      )
    }
    const expectedSummary = {
      retainOperationCount,
      spliceOperationCount,
      retainedSubtreeCount,
      replacementChunkCount,
    }
    if (!exactSummaryEquals(plan.summary, expectedSummary)) {
      return invalidAfterTraversal(
        "delivery-plan-summary-mismatch",
        "delivery summary does not match canonical operations",
      )
    }
    const expectedObservations = {
      estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint: planPayloadObservationFingerprint({
        previousSceneFingerprint: previousScene.fingerprint,
        nextSceneFingerprint: nextScene.fingerprint,
        previousPayloadObservationFingerprint:
          previousScene.payloadObservation.payloadObservationFingerprint,
        nextPayloadObservationFingerprint:
          nextScene.payloadObservation.payloadObservationFingerprint,
        estimatedCanonicalPayloadByteCount,
        operations: plan.operations,
      }),
    }
    if (!exactSummaryEquals(plan.observations, expectedObservations)) {
      return invalidAfterTraversal(
        "delivery-plan-observations-mismatch",
        "delivery observations do not match canonical operations",
      )
    }
    const expectedWork = {
      visitedOperationCount: plan.operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    }
    if (!exactSummaryEquals(plan.work, expectedWork)) {
      return invalidAfterTraversal(
        "delivery-plan-work-mismatch",
        "delivery inspection work does not match bounded operations",
      )
    }
    const expectedFingerprint = fingerprint(planCanonicalFacts(plan))
    if (plan.fingerprint !== expectedFingerprint) {
      return invalidAfterTraversal(
        "delivery-plan-fingerprint-mismatch",
        "delivery plan fingerprint does not match canonical facts",
      )
    }
    return {
      status: "valid",
      fingerprint: plan.fingerprint,
      payloadObservationFingerprint:
        plan.observations.payloadObservationFingerprint,
      previousCoverageCount: previousCursor,
      nextCoverageCount: nextCursor,
      visitedOperationCount: plan.operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      visitedSceneTreeNodeCount,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    }
  } catch {
    return invalidAfterTraversal(
      "delivery-plan-unsafe-count",
      "delivery verification exceeded safe bounded arithmetic",
    )
  }
}

export function inspectVNextTextBlockSceneDeliveryPlanV2(input: {
  readonly previousScene: VNextTextBlockPersistentSceneV2
  readonly nextScene: VNextTextBlockPersistentSceneV2
  readonly plan: unknown
}): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  const exact = exactVerifierInput(input)
  if (
    exact == null
    || !hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
      exact.previousScene,
    )
    || !hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
      exact.nextScene,
    )
  ) {
    return invalidInspection(
      "delivery-scene-authority-mismatch",
      "public delivery inspection requires exact registered Scene V2 roots",
    )
  }
  return verifyDeliveryPlanV2(input, false)
}

function completeDeliveryIssue(
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return {
    code: "atomic-acceptance-failed",
    severity: "error",
    stage: "scene",
    path,
    message,
  }
}

function blockedCompleteDelivery(
  item: VNextTextBlockUnifiedLayoutIssueV1,
): VNextTextBlockCompleteSceneDeliveryResultV2 {
  return Object.freeze({
    status: "blocked",
    delivery: null,
    issues: Object.freeze([item]),
  })
}

function collectCompleteDeliveryChunks(
  root: VNextTextBlockPersistentSceneRootV2,
): {
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly visitedSceneNodeCount: number
} {
  const chunks: VNextTextBlockPersistentSceneChunkV2[] = []
  let visitedSceneNodeCount = 0
  const visit = (node: VNextTextBlockPersistentSceneRootV2): void => {
    visitedSceneNodeCount += 1
    if (node.nodeKind === "empty") return
    if (node.nodeKind === "leaf") {
      chunks.push(node.chunk)
      return
    }
    for (const child of node.children) visit(child)
  }
  visit(root)
  return { chunks, visitedSceneNodeCount }
}

export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
  },
): VNextTextBlockCompleteSceneDeliveryResultV2
export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2
export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2 {
  const exact = exactRecord(input, ["root"])
  if (
    exact == null
    || inspectVNextTextBlockUnifiedLayoutRootV2(exact.root).status
      !== "valid"
  ) {
    return blockedCompleteDelivery(completeDeliveryIssue(
      "input",
      "complete delivery requires one exact registered Root/Scene V2 pair",
    ))
  }
  try {
    const root = exact.root as VNextTextBlockUnifiedLayoutRootV2
    const scene = root.persistentScene
    const emitted = collectCompleteDeliveryChunks(scene.root)
    const work = {
      completeDeliveryCount: 1 as const,
      visitedSceneNodeCount: emitted.visitedSceneNodeCount,
      emittedChunkCount: emitted.chunks.length,
    }
    const facts = {
      source: "vnext-text-block-complete-scene-delivery-v2" as const,
      contractVersion: 2 as const,
      rootFingerprint: root.fingerprint,
      rootSemanticFingerprint: root.semanticFingerprint,
      persistentSceneFingerprint: scene.fingerprint,
      persistentScenePayloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
      chunks: emitted.chunks,
      summary: scene.summary,
      observations: scene.payloadObservation,
      work,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const delivery = deepFreeze({
      ...facts,
      fingerprint: fingerprint(facts),
    })
    return Object.freeze({
      status: "accepted",
      delivery,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blockedCompleteDelivery(completeDeliveryIssue(
      "persistentScene",
      "complete delivery exceeded safe traversal or canonical arithmetic",
    ))
  }
}

export function createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2(
  input: { readonly root: VNextTextBlockUnifiedLayoutRootV2 },
): VNextTextBlockCompleteSceneDeliveryResultV2
export function createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2
export function createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2 {
  const exact = exactRecord(input, ["root"])
  return prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2({
    root: exact?.root as VNextTextBlockUnifiedLayoutRootV2,
  })
}

function invalidCompleteDeliveryInspection(
  code: Extract<
    VNextTextBlockCompleteSceneDeliveryInspectionV2,
    { status: "invalid" }
  >["code"],
  message: string,
): VNextTextBlockCompleteSceneDeliveryInspectionV2 {
  return { status: "invalid", code, message }
}

function completeDeliveryEmptyComponentFingerprint(
  component: string,
): string {
  return fingerprint({ component, empty: true })
}

function completeDeliveryEmptySemanticSummary():
  VNextTextBlockPersistentSceneSummaryV2 {
  return {
    chunkCount: 0,
    lineCount: 0,
    textFragmentCount: 0,
    inlineImageFragmentCount: 0,
    leafCount: 0,
    nodeCount: 1,
    sourceRange: { start: null, end: null },
    authoredTopLayoutUnit: null,
    authoredBottomLayoutUnit: null,
    lineInternalsFingerprint:
      completeDeliveryEmptyComponentFingerprint("line-internals"),
    sourceFingerprint:
      completeDeliveryEmptyComponentFingerprint("source"),
    provenanceFingerprint:
      completeDeliveryEmptyComponentFingerprint("provenance"),
    paintFingerprint:
      completeDeliveryEmptyComponentFingerprint("paint"),
    boundarySpatialContextFingerprint:
      completeDeliveryEmptyComponentFingerprint(
        "boundary-spatial-context",
      ),
  }
}

function completeDeliveryLeafSemanticSummary(
  chunk: VNextTextBlockPersistentSceneChunkV2,
): VNextTextBlockPersistentSceneSummaryV2 {
  let textFragmentCount = 0
  let inlineImageFragmentCount = 0
  for (const fragment of chunk.fragments) {
    if (fragment.kind === "text") textFragmentCount += 1
    else inlineImageFragmentCount += 1
  }
  const first = chunk.sourceMapping[0]
  const last = chunk.sourceMapping[chunk.sourceMapping.length - 1]
  const authoredTopLayoutUnit =
    chunk.authoredBoxGeometry.yOffsetLayoutUnit
  return {
    chunkCount: 1,
    lineCount: 1,
    textFragmentCount,
    inlineImageFragmentCount,
    leafCount: 1,
    nodeCount: 1,
    sourceRange: first == null || last == null
      ? { start: null, end: null }
      : {
          start: {
            lineageId: first.lineageId,
            localRenderedUtf16: first.localStartRenderedUtf16,
          },
          end: {
            lineageId: last.lineageId,
            localRenderedUtf16: last.localEndRenderedUtf16,
          },
        },
    authoredTopLayoutUnit,
    authoredBottomLayoutUnit: safeAdd(
      authoredTopLayoutUnit,
      chunk.authoredBoxGeometry.heightLayoutUnit,
    ),
    lineInternalsFingerprint: chunk.lineInternalsFingerprint,
    sourceFingerprint: chunk.sourceFingerprint,
    provenanceFingerprint: chunk.provenanceFingerprint,
    paintFingerprint: chunk.paintFingerprint,
    boundarySpatialContextFingerprint:
      chunk.boundarySpatialContextFingerprint,
  }
}

function completeDeliveryBranchSemanticSummary(
  children: readonly VNextTextBlockPersistentSceneSummaryV2[],
): VNextTextBlockPersistentSceneSummaryV2 {
  let chunkCount = 0
  let lineCount = 0
  let textFragmentCount = 0
  let inlineImageFragmentCount = 0
  let leafCount = 0
  let nodeCount = 1
  let authoredTopLayoutUnit: number | null = null
  let authoredBottomLayoutUnit: number | null = null
  for (const child of children) {
    chunkCount = safeAdd(chunkCount, child.chunkCount)
    lineCount = safeAdd(lineCount, child.lineCount)
    textFragmentCount = safeAdd(
      textFragmentCount,
      child.textFragmentCount,
    )
    inlineImageFragmentCount = safeAdd(
      inlineImageFragmentCount,
      child.inlineImageFragmentCount,
    )
    leafCount = safeAdd(leafCount, child.leafCount)
    nodeCount = safeAdd(nodeCount, child.nodeCount)
    if (child.authoredTopLayoutUnit != null) {
      authoredTopLayoutUnit = authoredTopLayoutUnit == null
        ? child.authoredTopLayoutUnit
        : Math.min(
            authoredTopLayoutUnit,
            child.authoredTopLayoutUnit,
          )
    }
    if (child.authoredBottomLayoutUnit != null) {
      authoredBottomLayoutUnit = authoredBottomLayoutUnit == null
        ? child.authoredBottomLayoutUnit
        : Math.max(
            authoredBottomLayoutUnit,
            child.authoredBottomLayoutUnit,
          )
    }
  }
  const first = children[0]
  const last = children[children.length - 1]
  const component = (
    name: string,
    values: readonly string[],
  ): string => fingerprint({ component: name, children: values })
  return {
    chunkCount,
    lineCount,
    textFragmentCount,
    inlineImageFragmentCount,
    leafCount,
    nodeCount,
    sourceRange: {
      start: first?.sourceRange.start ?? null,
      end: last?.sourceRange.end ?? null,
    },
    authoredTopLayoutUnit,
    authoredBottomLayoutUnit,
    lineInternalsFingerprint: component(
      "line-internals",
      children.map((child) => child.lineInternalsFingerprint),
    ),
    sourceFingerprint: component(
      "source",
      children.map((child) => child.sourceFingerprint),
    ),
    provenanceFingerprint: component(
      "provenance",
      children.map((child) => child.provenanceFingerprint),
    ),
    paintFingerprint: component(
      "paint",
      children.map((child) => child.paintFingerprint),
    ),
    boundarySpatialContextFingerprint: component(
      "boundary-spatial-context",
      children.map(
        (child) => child.boundarySpatialContextFingerprint,
      ),
    ),
  }
}

function completeDeliveryCanonicalGroupSizes(
  count: number,
): readonly number[] {
  if (count <= 0) return []
  if (count <= 8) return [count]
  const fullGroups = Math.floor(count / 8)
  const remainder = count % 8
  const sizes = Array.from({ length: fullGroups }, () => 8)
  if (remainder === 1) {
    sizes[sizes.length - 1] = 4
    sizes.push(5)
  } else if (remainder > 1) {
    sizes.push(remainder)
  }
  return sizes
}

function completeDeliverySemanticSummaryFromChunks(
  chunks: readonly VNextTextBlockPersistentSceneChunkV2[],
): VNextTextBlockPersistentSceneSummaryV2 {
  if (chunks.length === 0) {
    return completeDeliveryEmptySemanticSummary()
  }
  let level: readonly VNextTextBlockPersistentSceneSummaryV2[] =
    chunks.map(completeDeliveryLeafSemanticSummary)
  while (level.length > 1) {
    const next: VNextTextBlockPersistentSceneSummaryV2[] = []
    let cursor = 0
    for (const size of completeDeliveryCanonicalGroupSizes(level.length)) {
      next.push(completeDeliveryBranchSemanticSummary(
        level.slice(cursor, cursor + size),
      ))
      cursor += size
    }
    level = next
  }
  return level[0]!
}

function completeDeliveryChunkIssue(
  delivery: VNextTextBlockCompleteSceneDeliveryV2,
): string | null {
  try {
    let estimatedCanonicalPayloadByteCount = 0
    for (const chunk of delivery.chunks) {
      const record = exactRecord(chunk, [
        "lineLineageId",
        "sourceMapping",
        "lineInternals",
        "contentLocalGeometry",
        "authoredBoxGeometry",
        "fragments",
        "lineInternalsFingerprint",
        "sourceFingerprint",
        "provenanceFingerprint",
        "paintFingerprint",
        "boundarySpatialContextFingerprint",
        "fingerprint",
      ])
      const fragments = exactArray(record?.fragments)
      const mappings = exactArray(record?.sourceMapping)
      if (
        record == null
        || fragments == null
        || mappings == null
        || typeof record.lineLineageId !== "string"
        || typeof record.lineInternalsFingerprint !== "string"
        || typeof record.sourceFingerprint !== "string"
        || typeof record.provenanceFingerprint !== "string"
        || typeof record.paintFingerprint !== "string"
        || typeof record.boundarySpatialContextFingerprint !== "string"
        || typeof record.fingerprint !== "string"
        || (
          record.lineInternals as { readonly fingerprint?: unknown }
        )?.fingerprint !== record.lineInternalsFingerprint
      ) return "chunk-shape"
      for (const fragment of fragments) {
        const kind = fragment != null && typeof fragment === "object"
          ? Object.getOwnPropertyDescriptor(fragment, "kind")?.value
          : null
        const keys = kind === "text"
          ? [
              "kind",
              "lineageId",
              "sourceSpans",
              "paintRuns",
              "paintFingerprint",
              "fingerprint",
            ]
          : [
              "kind",
              "lineageId",
              "sourceSpans",
              "assetId",
              "authoredFrame",
              "paintFingerprint",
              "fingerprint",
            ]
        const fragmentRecord = exactRecord(fragment, keys)
        if (
          fragmentRecord == null
          || (kind !== "text" && kind !== "inline-image")
          || typeof fragmentRecord.fingerprint !== "string"
        ) return "fragment-shape"
        const { fingerprint: fragmentFingerprint, ...fragmentFacts } =
          fragmentRecord
        if (fragmentFingerprint !== fingerprint({
          contractVersion: 2,
          ...fragmentFacts,
        })) return "fragment-fingerprint"
      }
      const { fingerprint: chunkFingerprint, ...chunkFacts } = record
      if (chunkFingerprint !== fingerprint({
        contractVersion: 2,
        ...chunkFacts,
      })) return "chunk-fingerprint"
      estimatedCanonicalPayloadByteCount = safeAdd(
        estimatedCanonicalPayloadByteCount,
        utf8ByteCount({ payloadPolicyVersion: 1, chunk }),
      )
      const geometry = record.authoredBoxGeometry as {
        readonly yOffsetLayoutUnit?: unknown
        readonly heightLayoutUnit?: unknown
      }
      if (
        !Number.isSafeInteger(geometry.yOffsetLayoutUnit)
        || !Number.isSafeInteger(geometry.heightLayoutUnit)
        || (geometry.heightLayoutUnit as number) < 0
      ) return "authored-geometry"
      safeAdd(
        geometry.yOffsetLayoutUnit as number,
        geometry.heightLayoutUnit as number,
      )
    }
    estimatedCanonicalPayloadByteCount = safeAdd(
      estimatedCanonicalPayloadByteCount,
      utf8ByteCount({
        payloadPolicyVersion: 1,
        source: "vnext-text-block-persistent-scene-v2",
        contractVersion: 2,
      }),
    )
    const summary = exactRecord(delivery.summary, [
      "chunkCount",
      "lineCount",
      "textFragmentCount",
      "inlineImageFragmentCount",
      "leafCount",
      "nodeCount",
      "sourceRange",
      "authoredTopLayoutUnit",
      "authoredBottomLayoutUnit",
      "lineInternalsFingerprint",
      "sourceFingerprint",
      "provenanceFingerprint",
      "paintFingerprint",
      "boundarySpatialContextFingerprint",
    ])
    if (summary == null) return "summary-shape"
    const expectedSummary =
      completeDeliverySemanticSummaryFromChunks(delivery.chunks)
    if (!exactSummaryEquals(summary, expectedSummary)) {
      return "summary-semantic-mismatch"
    }
    if (
      delivery.work.visitedSceneNodeCount
        !== expectedSummary.nodeCount
    ) {
      return "work-visited-scene-node-count"
    }
    if (
      delivery.observations.estimatedCanonicalPayloadByteCount
        !== estimatedCanonicalPayloadByteCount
    ) return `observation-payload-bytes(${String(
      delivery.observations.estimatedCanonicalPayloadByteCount,
    )}/${String(estimatedCanonicalPayloadByteCount)})`
    return null
  } catch {
    return "unsafe-canonical-data"
  }
}

export function inspectVNextTextBlockCompleteSceneDeliveryV2(
  value: unknown,
): VNextTextBlockCompleteSceneDeliveryInspectionV2 {
  const record = exactRecord(value, [
    "source",
    "contractVersion",
    "rootFingerprint",
    "rootSemanticFingerprint",
    "persistentSceneFingerprint",
    "persistentScenePayloadObservationFingerprint",
    "chunks",
    "summary",
    "observations",
    "work",
    "stagedEditorApply",
    "mayPublishLayout",
    "productionBinding",
    "fingerprint",
  ])
  const state: DeliveryParseState = { seen: new WeakSet<object>() }
  const chunkValues = deliveryArray(state, record?.chunks)
  const chunks: VNextTextBlockPersistentSceneChunkV2[] = []
  if (chunkValues != null) {
    for (const chunkValue of chunkValues) {
      const chunk = parseDeliveryChunk(state, chunkValue)
      if (chunk == null) {
        return invalidCompleteDeliveryInspection(
          "complete-delivery-data-mismatch",
          "complete delivery is not one exact canonical renderer-data record",
        )
      }
      chunks.push(chunk)
    }
  }
  const summary = parseDeliverySummary(state, record?.summary)
  const observations = exactRecord(record?.observations, [
    "estimatedCanonicalPayloadByteCount",
    "payloadObservationFingerprint",
  ])
  const work = exactRecord(record?.work, [
    "completeDeliveryCount",
    "visitedSceneNodeCount",
    "emittedChunkCount",
  ])
  if (
    record == null
    || chunkValues == null
    || summary == null
    || observations == null
    || work == null
    || record.source !== "vnext-text-block-complete-scene-delivery-v2"
    || record.contractVersion !== 2
    || typeof record.rootFingerprint !== "string"
    || typeof record.rootSemanticFingerprint !== "string"
    || typeof record.persistentSceneFingerprint !== "string"
    || typeof record.persistentScenePayloadObservationFingerprint !== "string"
    || typeof record.fingerprint !== "string"
    || record.stagedEditorApply !== false
    || record.mayPublishLayout !== false
    || record.productionBinding !== false
    || work.completeDeliveryCount !== 1
    || !Number.isSafeInteger(work.visitedSceneNodeCount)
    || (work.visitedSceneNodeCount as number) < 0
    || !Number.isSafeInteger(work.emittedChunkCount)
    || (work.emittedChunkCount as number) < 0
    || work.emittedChunkCount !== chunks.length
    || !Number.isSafeInteger(
      observations.estimatedCanonicalPayloadByteCount,
    )
    || (observations.estimatedCanonicalPayloadByteCount as number) < 0
    || typeof observations.payloadObservationFingerprint !== "string"
    || record.persistentScenePayloadObservationFingerprint
      !== observations.payloadObservationFingerprint
  ) {
    return invalidCompleteDeliveryInspection(
      "complete-delivery-data-mismatch",
      "complete delivery is not one exact canonical renderer-data record",
    )
  }
  try {
    const delivery = {
      ...record,
      chunks,
      summary,
      observations,
      work,
    } as unknown as VNextTextBlockCompleteSceneDeliveryV2
    const chunkIssue = completeDeliveryChunkIssue(delivery)
    if (chunkIssue != null) {
      return invalidCompleteDeliveryInspection(
        "complete-delivery-data-mismatch",
        `complete delivery chunks or summary are not canonical renderer data: ${chunkIssue}`,
      )
    }
    const facts = {
      source: delivery.source,
      contractVersion: delivery.contractVersion,
      rootFingerprint: delivery.rootFingerprint,
      rootSemanticFingerprint: delivery.rootSemanticFingerprint,
      persistentSceneFingerprint: delivery.persistentSceneFingerprint,
      persistentScenePayloadObservationFingerprint:
        delivery.persistentScenePayloadObservationFingerprint,
      chunks: delivery.chunks,
      summary: delivery.summary,
      observations: delivery.observations,
      work: delivery.work,
      stagedEditorApply: delivery.stagedEditorApply,
      mayPublishLayout: delivery.mayPublishLayout,
      productionBinding: delivery.productionBinding,
    }
    if (delivery.fingerprint !== fingerprint(facts)) {
      return invalidCompleteDeliveryInspection(
        "complete-delivery-fingerprint-mismatch",
        "complete delivery fingerprint does not match canonical renderer data",
      )
    }
    return {
      status: "valid",
      fingerprint: delivery.fingerprint,
      rootFingerprint: delivery.rootFingerprint,
      rootSemanticFingerprint: delivery.rootSemanticFingerprint,
      persistentSceneFingerprint: delivery.persistentSceneFingerprint,
      persistentScenePayloadObservationFingerprint:
        delivery.persistentScenePayloadObservationFingerprint,
      emittedChunkCount: delivery.work.emittedChunkCount,
      estimatedCanonicalPayloadByteCount:
        delivery.observations.estimatedCanonicalPayloadByteCount,
    }
  } catch {
    return invalidCompleteDeliveryInspection(
      "complete-delivery-unsafe-count",
      "complete delivery could not be canonically inspected",
    )
  }
}
