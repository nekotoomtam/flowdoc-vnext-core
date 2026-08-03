import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutChangeV1, VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockBoundedSourceDeltaFactsInternalV2,
  VNextTextBlockBoundedSourceDeltaSpanInternalV2,
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerLaneMaterialV2,
  VNextTextBlockTransitionProducerLaneRangesV2,
  VNextTextBlockTransitionProducerResolvedStyleV2,
  VNextTextBlockTransitionProducerSourceAtomV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  evaluateNextVNextTextBlockStageVisitInternalV1,
  getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  resolveVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1,
} from "./textBlockUnifiedLayoutTrivialAdmissionInternalsV1.js"
import {
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "./textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import {
  createVNextTextBlockTransitionReplacementSourceItemInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
  resolveVNextTextBlockRegisteredSourceStyleInternalV1,
  resolveVNextTextBlockSupportedStyleOverlayInternalV1,
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
  visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1,
  type VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  visitVNextTextBlockTransitionFlowCoverageInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceStyleV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockValidatedChangeV1,
  VNextTextBlockUnifiedLayoutEffectClassificationV1,
  VNextTextBlockUnifiedLayoutEligibilityV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export interface VNextTextBlockUnifiedLayoutChangePreflightV2 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: VNextTextBlockUnifiedLayoutEligibilityV1
  readonly boundedDelta: VNextTextBlockBoundedSourceDeltaFactsInternalV2
  readonly effectClassification: VNextTextBlockUnifiedLayoutEffectClassificationV1
  readonly producerEvidence: "required" | "not-required"
  readonly previousRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly replacementItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutOwnedStageFailureV1 =
  | { readonly status: "fallback-required"; readonly reason?: "unadmitted-root" | "unsupported-structural-change"; readonly evaluatorOrProofAuthority: object; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "blocked"; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[] }

export type VNextTextBlockTransitionPreflightResultV2 =
  | { readonly status: "required"; readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2; readonly request: VNextTextBlockTransitionEvidenceRequestV2; readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "not-required"; readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2; readonly request: null; readonly sourceMaterial: null; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1

interface RegisteredPreflightTupleInternalV2 {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2 | null
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2 | null
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly sourceReplacement:
    VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1 | null
}

const preflights = new WeakMap<object, RegisteredPreflightTupleInternalV2>()
interface RegisteredEvidenceMaterialTupleInternalV2 {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
}
const evidenceMaterialByRoot = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  WeakMap<
    VNextTextBlockUnifiedLayoutChangeV1,
    WeakMap<
      VNextTextBlockUnifiedLayoutWorkPolicyV1,
      RegisteredEvidenceMaterialTupleInternalV2
    >
  >
>()
const failureAuthorities = new WeakMap<object, {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly unit: "evidence-request-lookup-nodes" | "evidence-context-atoms" | "evidence-response-nodes"
  readonly effectiveLimit: number
}>()

export function inspectVNextTextBlockTransitionPreflightFailureAuthorityInternalV2(
  value: unknown,
): boolean {
  return value != null
    && typeof value === "object"
    && (
      failureAuthorities.has(value as object)
      || getVNextTextBlockLimitExceededAuthorityRecordInternalV1(value) != null
    )
}

/** Task-2 exact tuple assertion; it exposes no iterable registry or factory. */
export function inspectVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(
  input: {
    readonly preflight: unknown
    readonly request: unknown
    readonly sourceMaterial: unknown
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
):
  | { readonly status: "valid" }
  | {
      readonly status: "invalid"
      readonly code: "evidence-authority-mismatch"
      readonly message: string
    } {
  const record = input.preflight != null && typeof input.preflight === "object"
    ? preflights.get(input.preflight as object)
    : null
  return record != null
      && record.request === input.request
      && record.sourceMaterial === input.sourceMaterial
      && record.previousRoot === input.previousRoot
      && record.change === input.change
      && record.workPolicy === input.workPolicy
    ? { status: "valid" }
    : {
        status: "invalid",
        code: "evidence-authority-mismatch",
        message: "preflight is not the exact registered Task-2 tuple",
      }
}

function registerPreflightTuple(input: {
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly request: VNextTextBlockTransitionEvidenceRequestV2 | null
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2 | null
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly sourceReplacement:
    VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1 | null
}): void {
  preflights.set(input.preflight, Object.freeze({
    request: input.request,
    sourceMaterial: input.sourceMaterial,
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
    validatedChange: input.validatedChange,
    completedCandidateWork: input.completedCandidateWork,
    sourceReplacement: input.sourceReplacement,
  }))
}

function exactEvidenceMaterialTuple(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly create: () => RegisteredEvidenceMaterialTupleInternalV2
}): RegisteredEvidenceMaterialTupleInternalV2 {
  let byChange = evidenceMaterialByRoot.get(input.previousRoot)
  if (byChange == null) {
    byChange = new WeakMap()
    evidenceMaterialByRoot.set(input.previousRoot, byChange)
  }
  let byPolicy = byChange.get(input.change)
  if (byPolicy == null) {
    byPolicy = new WeakMap()
    byChange.set(input.change, byPolicy)
  }
  const registered = byPolicy.get(input.workPolicy)
  if (registered != null) return registered
  const created = Object.freeze(input.create())
  byPolicy.set(input.workPolicy, created)
  return created
}

export function getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2(input: {
  readonly preflight: unknown
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
}): RegisteredPreflightTupleInternalV2 | null {
  const record = input.preflight != null && typeof input.preflight === "object"
    ? preflights.get(input.preflight as object)
    : null
  return record != null
      && record.previousRoot === input.previousRoot
      && record.change === (input.preflight as VNextTextBlockUnifiedLayoutChangePreflightV2).change
      && record.workPolicy === input.previousRoot.workPolicy
    ? record
    : null
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function issue(code: VNextTextBlockUnifiedLayoutIssueV1["code"], path: string, message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return { code, severity: "error", stage: "evidence", path, message }
}

function emptyRanges(): VNextTextBlockTransitionProducerLaneRangesV2 {
  const zero = freeze({ startRenderedUtf16: 0, endRenderedUtf16: 0 })
  return freeze({ changedSourceRange: zero, evidenceTargetRange: zero, shapeVerificationRange: zero, coverageRange: zero })
}

function clamp(value: number, length: number): number { return Math.max(0, Math.min(value, length)) }
function range(startRenderedUtf16: number, endRenderedUtf16: number): VNextTextBlockSourceRangeV1 { return freeze({ startRenderedUtf16, endRenderedUtf16 }) }

function laneRanges(changed: VNextTextBlockSourceRangeV1, length: number): VNextTextBlockTransitionProducerLaneRangesV2 {
  const start = clamp(changed.startRenderedUtf16, length)
  const end = clamp(changed.endRenderedUtf16, length)
  // A zero-width deletion still receives one adjacent context code unit when available.
  const evidenceStart = start === end ? Math.max(0, start - 1) : start
  const evidenceEnd = start === end ? Math.min(length, end + 1) : end
  const evidence = range(evidenceStart, evidenceEnd)
  const shape = range(Math.max(0, evidenceStart - 1), Math.min(length, evidenceEnd + 1))
  const coverage = range(Math.max(0, shape.startRenderedUtf16 - 1), Math.min(length, shape.endRenderedUtf16 + 1))
  return freeze({ changedSourceRange: range(start, end), evidenceTargetRange: evidence, shapeVerificationRange: shape, coverageRange: coverage })
}

function sourceRangeForChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
  beforeVisitNode: () => boolean,
): { readonly status: "accepted"; readonly range: VNextTextBlockSourceRangeV1 }
  | { readonly status: "not-found" | "limit-exceeded"; readonly range: null } {
  if (change.kind === "text-insertion") {
    return {
      status: "accepted",
      range: range(change.atRenderedUtf16, change.atRenderedUtf16),
    }
  }
  if (change.kind === "text-deletion" || change.kind === "text-replacement") return { status: "accepted", range: change.removedRange }
  if (change.kind === "supported-style-change") return { status: "accepted", range: change.range }
  if (change.kind === "resolved-field-rendered-value-change") {
    const lookup = visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1({
      sourceState: root.sourceState,
      inlineId: change.inlineId,
      beforeVisitNode,
    })
    if (
      lookup.status !== "found"
      || lookup.item.kind !== "resolved-field"
      || lookup.item.fieldKey !== change.fieldKey
    ) return { status: lookup.status === "limit-exceeded" ? "limit-exceeded" : "not-found", range: null }
    return {
      status: "accepted",
      range: range(
        lookup.absoluteStartRenderedUtf16,
        lookup.absoluteEndRenderedUtf16,
      ),
    }
  }
  return { status: "not-found", range: null }
}

function declaredReplacementRenderedUtf16Length(
  change: VNextTextBlockUnifiedLayoutChangeV1,
  sourceRange: VNextTextBlockSourceRangeV1,
): number {
  switch (change.kind) {
    case "text-insertion":
    case "text-replacement":
      return change.insertedText.length
    case "text-deletion":
      return 0
    case "resolved-field-rendered-value-change":
      return change.nextRenderedText.length
    case "supported-style-change":
      return sourceRange.endRenderedUtf16 - sourceRange.startRenderedUtf16
    default:
      return 0
  }
}

function sourceCoverageForBothLanes(input: {
  readonly previousCoverage: VNextTextBlockSourceRangeV1
  readonly nextCoverage: VNextTextBlockSourceRangeV1
  readonly changedPreviousRange: VNextTextBlockSourceRangeV1
  readonly replacementRenderedUtf16Length: number
  readonly delta: number
  readonly previousLength: number
}): VNextTextBlockSourceRangeV1 {
  const replacementEnd = input.changedPreviousRange.startRenderedUtf16
    + input.replacementRenderedUtf16Length
  const mapStart = (offset: number): number => {
    if (offset <= input.changedPreviousRange.startRenderedUtf16) return offset
    if (offset >= replacementEnd) return offset - input.delta
    return input.changedPreviousRange.startRenderedUtf16
  }
  const mapEnd = (offset: number): number => {
    if (offset <= input.changedPreviousRange.startRenderedUtf16) return offset
    if (offset >= replacementEnd) return offset - input.delta
    return input.changedPreviousRange.endRenderedUtf16
  }
  return range(
    clamp(Math.min(
      input.previousCoverage.startRenderedUtf16,
      mapStart(input.nextCoverage.startRenderedUtf16),
    ), input.previousLength),
    clamp(Math.max(
      input.previousCoverage.endRenderedUtf16,
      mapEnd(input.nextCoverage.endRenderedUtf16),
    ), input.previousLength),
  )
}

function styleV2(style: VNextTextBlockUnifiedLayoutSourceStyleV1, paragraphStyleKey: string): VNextTextBlockTransitionProducerResolvedStyleV2 {
  const facts = {
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
    paragraphStyleKey,
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    textColor: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
  }
  return freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function atomFromItem(
  item: VNextTextBlockUnifiedLayoutSourceItemV1,
  itemAbsoluteStart: number,
  selectedAbsoluteStart: number,
  selectedAbsoluteEnd: number,
  outputAbsoluteStart: number,
  laneStart: number,
  paragraphStyleKey: string,
): VNextTextBlockTransitionProducerSourceAtomV2 {
  const renderedText = item.renderedText.slice(
    selectedAbsoluteStart - itemAbsoluteStart,
    selectedAbsoluteEnd - itemAbsoluteStart,
  )
  const base = {
    relativeStartRenderedUtf16: outputAbsoluteStart - laneStart,
    relativeEndRenderedUtf16:
      outputAbsoluteStart + renderedText.length - laneStart,
    renderedText,
    inlineId: item.inlineId,
    sourceFingerprint: item.sourceFingerprint,
    provenanceFingerprint: item.provenanceFingerprint,
  }
  const variant = item.kind === "text" ? { kind: "text" as const, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
    : item.kind === "resolved-field" ? { kind: "resolved-field" as const, fieldKey: item.fieldKey, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
      : item.kind === "generated-page-number" ? { kind: "generated-page-number" as const, generatedOwnerFingerprint: item.generatedOwnerFingerprint, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
        : item.kind === "hard-break" ? { kind: "hard-break" as const, boundaryFingerprint: item.boundaryFingerprint }
          : { kind: "inline-image-boundary" as const, boundaryFingerprint: item.boundaryFingerprint }
  return freeze({ ...base, ...variant, fingerprint: fingerprint({ ...base, ...variant }) }) as VNextTextBlockTransitionProducerSourceAtomV2
}

function meteredWork(base: VNextTextBlockIncrementalCandidateWorkV1, policy: VNextTextBlockUnifiedLayoutWorkPolicyV1, lookup: number, atoms: number): VNextTextBlockIncrementalCandidateWorkV1 {
  return freeze({
    ...base,
    evidence: { ...base.evidence, visitedRequestLookupNodeCount: lookup, materializedContextAtomCount: atoms },
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({ policy, factualCounts: [
      { stage: "evidence", unit: "evidence-request-lookup-nodes", count: lookup },
      { stage: "evidence", unit: "evidence-context-atoms", count: atoms },
    ] }),
  })
}

function registeredRequestWork(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  requestedAtoms: number,
  requestedClusters: number,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return freeze({
    ...base,
    evidence: {
      ...base.evidence,
      requestCount: 1,
      requestedAtomCount: requestedAtoms,
      requestedClusterCount: requestedClusters,
    },
  })
}

function evaluatedLimit(policy: VNextTextBlockUnifiedLayoutWorkPolicyV1, root: VNextTextBlockUnifiedLayoutRootV2, unit: "evidence-request-lookup-nodes" | "evidence-context-atoms" | "evidence-response-nodes", attempted: number) {
  return evaluateVNextTextBlockStageWorkLimitInternalV1({ policy, stage: "evidence", unit, previousSummaryBase: root.sourceState.summary.itemCount, exactValidatedChangeDelta: 1, attemptedWork: attempted })
}

interface PreflightWorkMeterInternalV2 {
  visitedNodeCount: number
  materializedAtomCount: number
  failedUnit: "evidence-request-lookup-nodes" | "evidence-context-atoms" | null
  failedEffectiveLimit: number
  failureAuthority: object | null
  completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly beforeVisitNode: () => boolean
  readonly beforeMaterialAtom: () => boolean
}

function workMeter(
  policy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  validatedChange: Parameters<
    typeof evaluateNextVNextTextBlockStageVisitInternalV1
  >[0]["validatedChange"],
  baseWork: VNextTextBlockIncrementalCandidateWorkV1,
): PreflightWorkMeterInternalV2 {
  const before = (
    meter: PreflightWorkMeterInternalV2,
    unit: "evidence-request-lookup-nodes" | "evidence-context-atoms",
  ): boolean => {
    const completedWork = unit === "evidence-request-lookup-nodes"
      ? meter.visitedNodeCount
      : meter.materializedAtomCount
    const evaluation = evaluateNextVNextTextBlockStageVisitInternalV1({
      validatedChange,
      stage: "evidence",
      unit,
      completedWork,
      completedCandidateWork: meter.completedCandidateWork,
    })
    if (evaluation.status !== "accepted") {
      meter.failedUnit = unit
      meter.failedEffectiveLimit = evaluation.effectiveLimit
      meter.failureAuthority = evaluation.status === "limit-exceeded"
        ? evaluation.evaluatorAuthority
        : null
      return false
    }
    if (unit === "evidence-request-lookup-nodes") {
      meter.visitedNodeCount = evaluation.attemptedWork
    } else {
      meter.materializedAtomCount = evaluation.attemptedWork
    }
    meter.completedCandidateWork = meteredWork(
      meter.completedCandidateWork,
      policy,
      meter.visitedNodeCount,
      meter.materializedAtomCount,
    )
    return true
  }
  const meter: PreflightWorkMeterInternalV2 = {
    visitedNodeCount: 0,
    materializedAtomCount: 0,
    failedUnit: null,
    failedEffectiveLimit: 0,
    failureAuthority: null,
    completedCandidateWork: baseWork,
    beforeVisitNode: () => before(
      meter,
      "evidence-request-lookup-nodes",
    ),
    beforeMaterialAtom: () => before(meter, "evidence-context-atoms"),
  }
  return meter
}

function fallback(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly unit: "evidence-request-lookup-nodes" | "evidence-context-atoms" | "evidence-response-nodes"
  readonly effectiveLimit: number
  readonly work: VNextTextBlockIncrementalCandidateWorkV1
  readonly evaluatorOrProofAuthority?: object | null
  readonly reason?: "unadmitted-root" | "unsupported-structural-change"
}): VNextTextBlockUnifiedLayoutOwnedStageFailureV1 {
  const evaluatorOrProofAuthority = input.evaluatorOrProofAuthority
    ?? freeze({})
  if (input.evaluatorOrProofAuthority == null) {
    failureAuthorities.set(evaluatorOrProofAuthority, {
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: input.unit,
      effectiveLimit: input.effectiveLimit,
    })
  }
  return freeze({
    status: "fallback-required" as const,
    ...(input.reason == null ? {} : { reason: input.reason }),
    evaluatorOrProofAuthority,
    completedCandidateWork: input.work,
    issues: freeze([]),
  })
}

function expandShapeToFlowAtoms(
  ranges: VNextTextBlockTransitionProducerLaneRangesV2,
  fragments: readonly {
    readonly atomAbsoluteStartRenderedUtf16: number
    readonly atomAbsoluteEndRenderedUtf16: number
  }[],
  length: number,
): VNextTextBlockTransitionProducerLaneRangesV2 {
  let start = ranges.shapeVerificationRange.startRenderedUtf16
  let end = ranges.shapeVerificationRange.endRenderedUtf16
  for (const fragment of fragments) {
    start = Math.min(start, fragment.atomAbsoluteStartRenderedUtf16)
    end = Math.max(end, fragment.atomAbsoluteEndRenderedUtf16)
  }
  const shapeVerificationRange = range(clamp(start, length), clamp(end, length))
  const coverageRange = range(
    Math.min(ranges.coverageRange.startRenderedUtf16, shapeVerificationRange.startRenderedUtf16),
    Math.max(ranges.coverageRange.endRenderedUtf16, shapeVerificationRange.endRenderedUtf16),
  )
  return freeze({ ...ranges, shapeVerificationRange, coverageRange })
}

function mapPreviousRangeToNext(
  previous: VNextTextBlockSourceRangeV1,
  changed: VNextTextBlockSourceRangeV1,
  delta: number,
  nextLength: number,
): VNextTextBlockSourceRangeV1 {
  const mapStart = previous.startRenderedUtf16 <= changed.startRenderedUtf16
    ? previous.startRenderedUtf16
    : previous.startRenderedUtf16 >= changed.endRenderedUtf16
      ? previous.startRenderedUtf16 + delta
      : changed.startRenderedUtf16
  const mapEnd = previous.endRenderedUtf16 <= changed.startRenderedUtf16
    ? previous.endRenderedUtf16
    : previous.endRenderedUtf16 >= changed.endRenderedUtf16
      ? previous.endRenderedUtf16 + delta
      : changed.startRenderedUtf16
  return range(clamp(mapStart, nextLength), clamp(mapEnd, nextLength))
}

function deriveNextLaneRanges(
  changed: VNextTextBlockSourceRangeV1,
  nextLength: number,
  previousRanges: VNextTextBlockTransitionProducerLaneRangesV2,
  previousChanged: VNextTextBlockSourceRangeV1,
  delta: number,
): VNextTextBlockTransitionProducerLaneRangesV2 {
  const initial = laneRanges(changed, nextLength)
  const mappedShape = mapPreviousRangeToNext(
    previousRanges.shapeVerificationRange,
    previousChanged,
    delta,
    nextLength,
  )
  const shapeVerificationRange = range(
    Math.min(initial.shapeVerificationRange.startRenderedUtf16, mappedShape.startRenderedUtf16),
    Math.max(initial.shapeVerificationRange.endRenderedUtf16, mappedShape.endRenderedUtf16),
  )
  const mappedCoverage = mapPreviousRangeToNext(
    previousRanges.coverageRange,
    previousChanged,
    delta,
    nextLength,
  )
  const coverageRange = range(
    Math.min(initial.coverageRange.startRenderedUtf16, mappedCoverage.startRenderedUtf16, shapeVerificationRange.startRenderedUtf16),
    Math.max(initial.coverageRange.endRenderedUtf16, mappedCoverage.endRenderedUtf16, shapeVerificationRange.endRenderedUtf16),
  )
  return freeze({ ...initial, shapeVerificationRange, coverageRange })
}

function safeSourceBoundary(
  fragments: readonly {
    readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
    readonly itemAbsoluteStartRenderedUtf16: number
    readonly itemAbsoluteEndRenderedUtf16: number
  }[],
  offset: number,
): boolean {
  const fragment = fragments.find((candidate) =>
    offset > candidate.itemAbsoluteStartRenderedUtf16
    && offset < candidate.itemAbsoluteEndRenderedUtf16
  )
  if (fragment == null) return true
  if (fragment.item.kind !== "text") return false
  const localOffset = offset - fragment.itemAbsoluteStartRenderedUtf16
  const before = fragment.item.renderedText.charCodeAt(localOffset - 1)
  const after = fragment.item.renderedText.charCodeAt(localOffset)
  return !(before >= 0xD800 && before <= 0xDBFF
    && after >= 0xDC00 && after <= 0xDFFF)
}

function scalarCountInRange(
  atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[],
  coverageStart: number,
  target: VNextTextBlockSourceRangeV1,
): number {
  let count = 0
  for (const atom of atoms) {
    const atomStart = coverageStart + atom.relativeStartRenderedUtf16
    const atomEnd = coverageStart + atom.relativeEndRenderedUtf16
    const start = Math.max(atomStart, target.startRenderedUtf16)
    const end = Math.min(atomEnd, target.endRenderedUtf16)
    if (end <= start) continue
    count += [...atom.renderedText.slice(start - atomStart, end - atomStart)].length
  }
  return count
}

interface BoundedDeltaComparableInternalV2 {
  readonly span: VNextTextBlockBoundedSourceDeltaSpanInternalV2
  readonly semanticFacts: unknown
  readonly paintFacts: unknown
  readonly layoutFacts: unknown
}

function boundedDeltaComparable(
  item: VNextTextBlockUnifiedLayoutSourceItemV1,
  renderedText: string,
): BoundedDeltaComparableInternalV2 {
  const kind = item.kind === "inline-image"
    ? "inline-image-boundary" as const
    : item.kind
  const span = freeze({
    kind,
    renderedText,
    renderedUtf16Length: renderedText.length,
    logicalInlineId: item.inlineId,
    semanticFingerprint: item.semanticFingerprint,
    sourceFingerprint: item.sourceFingerprint,
    provenanceFingerprint: item.provenanceFingerprint,
    paintFingerprint: item.paintFingerprint,
    layoutDependencyFingerprint: item.layoutDependencyFingerprint,
    boundaryFingerprint: item.boundaryFingerprint,
  })
  const variantSemanticFacts = item.kind === "resolved-field"
    ? { fieldKey: item.fieldKey }
    : item.kind === "generated-page-number"
      ? { generatedOwnerFingerprint: item.generatedOwnerFingerprint }
      : item.kind === "inline-image"
        ? { assetId: item.assetId }
        : {}
  const style = item.kind === "text"
    || item.kind === "resolved-field"
    || item.kind === "generated-page-number"
    ? item.style
    : null
  const paintFacts = style == null
    ? item.kind === "inline-image"
      ? {
          kind,
          assetId: item.assetId,
          authoredFrame: item.authoredFrame,
        }
      : { kind }
    : {
        kind,
        textColor: style.textColor,
        textDecoration: style.textDecoration,
        strikethrough: style.strikethrough,
        authoredTextColor: style.authoredLocalStyle?.textColor ?? null,
      }
  const layoutFacts = style == null
    ? item.kind === "inline-image"
      ? {
          kind,
          authoredFrame: item.authoredFrame,
          verticalAlign: item.verticalAlign,
        }
      : {
          kind,
          mandatoryBreak: item.kind === "hard-break",
        }
    : {
        kind,
        fontFamilyKey: style.fontFamilyKey,
        fontFaceId: style.fontFaceId,
        fontSizeLayoutUnit: style.fontSizeLayoutUnit,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
      }
  return {
    span,
    semanticFacts: {
      kind,
      lineageId: item.lineageId,
      logicalInlineId: item.inlineId,
      sourceFingerprint: item.sourceFingerprint,
      provenanceFingerprint: item.provenanceFingerprint,
      ...variantSemanticFacts,
    },
    paintFacts,
    layoutFacts,
  }
}

function equalBoundedFacts(
  previous: readonly BoundedDeltaComparableInternalV2[],
  next: readonly BoundedDeltaComparableInternalV2[],
  select: (value: BoundedDeltaComparableInternalV2) => unknown,
): boolean {
  if (previous.length !== next.length) return false
  return previous.every((value, index) =>
    stringifyVNextCanonicalJson(select(value))
      === stringifyVNextCanonicalJson(select(next[index]!)))
}

function boundedDeltaFacts(
  previous: readonly BoundedDeltaComparableInternalV2[],
  next: readonly BoundedDeltaComparableInternalV2[],
): VNextTextBlockBoundedSourceDeltaFactsInternalV2 {
  const previousSpans = freeze(previous.map((value) => value.span))
  const nextSpans = freeze(next.map((value) => value.span))
  const renderedContentEqual = previousSpans.map((span) => span.renderedText).join("")
    === nextSpans.map((span) => span.renderedText).join("")
  const semanticIdentityChanged = !equalBoundedFacts(
    previous,
    next,
    (value) => value.semanticFacts,
  )
  const paintEqual = equalBoundedFacts(
    previous,
    next,
    (value) => value.paintFacts,
  )
  const layoutEqual = renderedContentEqual && equalBoundedFacts(
    previous,
    next,
    (value) => value.layoutFacts,
  )
  const facts = {
    previous: previousSpans,
    next: nextSpans,
    renderedContentEqual,
    semanticIdentityChanged,
    paintEqual,
    layoutEqual,
  }
  return freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function compatibilityBoundedDeltaFacts(
  classification: VNextTextBlockUnifiedLayoutEffectClassificationV1,
): VNextTextBlockBoundedSourceDeltaFactsInternalV2 {
  const effectClass = classification.effectClass
  const facts = {
    previous: freeze([]) as readonly VNextTextBlockBoundedSourceDeltaSpanInternalV2[],
    next: freeze([]) as readonly VNextTextBlockBoundedSourceDeltaSpanInternalV2[],
    renderedContentEqual: effectClass !== "geometry-affecting-change",
    semanticIdentityChanged: classification.semanticIdentityChanged,
    paintEqual: effectClass !== "paint-affecting-change",
    layoutEqual: effectClass !== "geometry-affecting-change",
  }
  return freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function effectClassificationFromBoundedDelta(
  boundedDelta: VNextTextBlockBoundedSourceDeltaFactsInternalV2,
): VNextTextBlockUnifiedLayoutEffectClassificationV1 {
  const effectClass = !boundedDelta.renderedContentEqual || !boundedDelta.layoutEqual
    ? "geometry-affecting-change" as const
    : !boundedDelta.paintEqual
      ? "paint-affecting-change" as const
      : boundedDelta.semanticIdentityChanged
        ? "semantic-only-change" as const
        : "true-no-op" as const
  const facts = {
    effectClass,
    semanticIdentityChanged: boundedDelta.semanticIdentityChanged,
  }
  return freeze({
    ...facts,
    fingerprint: fingerprint({
      ...facts,
      boundedDeltaFingerprint: boundedDelta.fingerprint,
    }),
  })
}

/** Private Core transition owner seam. It never accepts producer output or builds a next tree. */
export function prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockTransitionPreflightResultV2 {
  const shaped = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
    input.change,
  )
  if (shaped.status !== "accepted") {
    return freeze({
      status: "blocked" as const,
      completedCandidateWork: shaped.incrementalCandidateWork,
      issues: shaped.issues,
    })
  }
  const admission = resolveVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1({
    root: input.previousRoot,
    workPolicy: input.workPolicy,
  })
  if (admission == null) return fallback({
    previousRoot: input.previousRoot,
    change: shaped.change,
    workPolicy: input.workPolicy,
    unit: "evidence-request-lookup-nodes",
    effectiveLimit: 0,
    work: shaped.incrementalCandidateWork,
    reason: "unadmitted-root",
  })
  const ordinaryText = shaped.change.kind === "text-insertion"
    || shaped.change.kind === "text-replacement"
    ? shaped.change.insertedText
    : null
  if (ordinaryText != null && /[\r\n\u2028\u2029\ufffc]/u.test(ordinaryText)) {
    return fallback({
      previousRoot: input.previousRoot,
      change: shaped.change,
      workPolicy: input.workPolicy,
      unit: "evidence-request-lookup-nodes",
      effectiveLimit: 0,
      work: shaped.incrementalCandidateWork,
      reason: "unsupported-structural-change",
    })
  }
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1(input)
  if (bound.status !== "accepted") return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: bound.issues })
  const { validatedChange } = bound
  const requiresBoundedTextFacts = [
    "text-insertion",
    "text-deletion",
    "text-replacement",
    "resolved-field-rendered-value-change",
    "supported-style-change",
  ].includes(validatedChange.change.kind)
  if (!requiresBoundedTextFacts) {
    const ranges = emptyRanges()
    const boundedDelta = compatibilityBoundedDeltaFacts(
      validatedChange.effectClassification,
    )
    const preflight = freeze({ change: validatedChange.change, eligibility: validatedChange.eligibility, boundedDelta, effectClassification: validatedChange.effectClassification, producerEvidence: validatedChange.producerEvidence, previousRanges: ranges, nextRanges: ranges, replacementItems: freeze([]), fingerprint: fingerprint({ changeFingerprint: validatedChange.fingerprint, ranges, boundedDelta, effectClassification: validatedChange.effectClassification }) })
    registerPreflightTuple({
      preflight,
      request: null,
      sourceMaterial: null,
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      validatedChange,
      completedCandidateWork: bound.incrementalCandidateWork,
      sourceReplacement: null,
    })
    return freeze({ status: "not-required" as const, preflight, request: null, sourceMaterial: null, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([]) })
  }
  const meter = workMeter(
    input.workPolicy,
    validatedChange,
    bound.incrementalCandidateWork,
  )
  const sourceLookup = sourceRangeForChange(
    input.previousRoot,
    validatedChange.change,
    meter.beforeVisitNode,
  )
  const previousLength = input.previousRoot.sourceState.summary.renderedUtf16Length
  if (sourceLookup.status === "limit-exceeded") {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: "evidence-request-lookup-nodes",
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
    })
  }
  const sourceRange = sourceLookup.range
  if (sourceRange == null || sourceRange.startRenderedUtf16 < 0 || sourceRange.endRenderedUtf16 < sourceRange.startRenderedUtf16 || sourceRange.endRenderedUtf16 > previousLength) {
    return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("invalid-change-range", "change", "preflight requires one safe bounded source range")]) })
  }
  const initialPreviousRanges = laneRanges(sourceRange, previousLength)
  const initialFlowCoverage = visitVNextTextBlockTransitionFlowCoverageInternalV1({
    flowTree: input.previousRoot.flowTree,
    range: initialPreviousRanges.shapeVerificationRange,
    beforeVisitNode: meter.beforeVisitNode,
    beforeEmitAtom: () => true,
  })
  if (initialFlowCoverage.status !== "accepted") {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: meter.failedUnit ?? "evidence-request-lookup-nodes",
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
    })
  }
  const previousRanges = expandShapeToFlowAtoms(
    initialPreviousRanges,
    initialFlowCoverage.fragments,
    previousLength,
  )
  const declaredReplacementLength = declaredReplacementRenderedUtf16Length(
    validatedChange.change,
    sourceRange,
  )
  const nextLength = previousLength
    - (sourceRange.endRenderedUtf16 - sourceRange.startRenderedUtf16)
    + declaredReplacementLength
  if (!Number.isSafeInteger(nextLength) || nextLength < 1) return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "preflight cannot produce an empty source topology")]) })
  const nextChanged = range(
    sourceRange.startRenderedUtf16,
    sourceRange.startRenderedUtf16 + declaredReplacementLength,
  )
  const delta = declaredReplacementLength
    - (sourceRange.endRenderedUtf16 - sourceRange.startRenderedUtf16)
  const nextRanges = deriveNextLaneRanges(
    nextChanged,
    nextLength,
    previousRanges,
    sourceRange,
    delta,
  )
  const sourceCoverageRange = sourceCoverageForBothLanes({
    previousCoverage: previousRanges.coverageRange,
    nextCoverage: nextRanges.coverageRange,
    changedPreviousRange: sourceRange,
    replacementRenderedUtf16Length: declaredReplacementLength,
    delta,
    previousLength,
  })
  const sourceCoverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
    sourceState: input.previousRoot.sourceState,
    range: sourceCoverageRange,
    beforeVisitNode: meter.beforeVisitNode,
    beforeEmitItem: () => true,
  })
  if (sourceCoverage.status !== "accepted") {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: meter.failedUnit ?? "evidence-request-lookup-nodes",
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
    })
  }
  if (sourceCoverage.fragments.some((fragment) => (
    (fragment.item.kind === "hard-break" || fragment.item.kind === "inline-image")
      && sourceRange.startRenderedUtf16 < fragment.itemAbsoluteEndRenderedUtf16
      && sourceRange.endRenderedUtf16 > fragment.itemAbsoluteStartRenderedUtf16
  ))) {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: meter.failedUnit ?? "evidence-request-lookup-nodes",
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
      reason: "unsupported-structural-change",
    })
  }
  if (
    !safeSourceBoundary(sourceCoverage.fragments, sourceRange.startRenderedUtf16)
    || !safeSourceBoundary(sourceCoverage.fragments, sourceRange.endRenderedUtf16)
  ) {
    return freeze({
      status: "blocked" as const,
      completedCandidateWork: meteredWork(
        meter.completedCandidateWork,
        input.workPolicy,
        meter.visitedNodeCount,
        meter.materializedAtomCount,
      ),
      issues: freeze([issue(
        "invalid-change-range",
        "change",
        "change range must use safe UTF-16 and atomic Source boundaries",
      )]),
    })
  }
  let replacementItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[] = freeze([])
  if (validatedChange.change.kind === "text-insertion" || validatedChange.change.kind === "text-replacement") {
    const resolved = resolveVNextTextBlockRegisteredSourceStyleInternalV1({ sourceState: input.previousRoot.sourceState, measurementStyleKey: validatedChange.change.measurementStyleKey, effectiveShapingStyleKey: validatedChange.change.effectiveShapingStyleKey })
    if (resolved.status !== "resolved") return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue(resolved.status === "ambiguous" ? "style-authority-ambiguous" : "unsupported-change-value", "change", "inserted text must use one exact registered Source State style")]) })
    const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: input.previousRoot.sourceState,
      kind: "text",
      renderedText: validatedChange.change.insertedText,
      lineageId: validatedChange.change.insertedSource.lineageId,
      inlineId: validatedChange.change.insertedSource.lineageId,
      sourceFingerprint: validatedChange.change.insertedSource.sourceFingerprint,
      provenanceFingerprint:
        validatedChange.change.insertedSource.provenanceFingerprint,
      style: resolved.style,
    })
    if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "inserted text could not produce canonical Source facts")]) })
    replacementItems = freeze([item])
  } else if (validatedChange.change.kind === "resolved-field-rendered-value-change") {
    const fieldChange = validatedChange.change
    const previousField = sourceCoverage.fragments.find((fragment) =>
          fragment.item.kind === "resolved-field"
          && fragment.item.inlineId === fieldChange.inlineId
          && fragment.item.fieldKey === fieldChange.fieldKey
        )?.item
    if (previousField?.kind !== "resolved-field") return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("change-target-mismatch", "change", "resolved field change requires the exact previous field item")]) })
    const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: input.previousRoot.sourceState,
      kind: "resolved-field",
      fieldKey: previousField.fieldKey,
      renderedText: fieldChange.nextRenderedText,
      lineageId: fieldChange.nextSource.lineageId,
      inlineId: previousField.inlineId,
      sourceFingerprint: fieldChange.nextSource.sourceFingerprint,
      provenanceFingerprint:
        fieldChange.nextSource.provenanceFingerprint,
      style: previousField.style,
    })
    if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "resolved field change could not produce canonical Source facts")]) })
    replacementItems = freeze([item])
  } else if (validatedChange.change.kind === "supported-style-change") {
    const styleFragments = sourceCoverage.fragments.filter((fragment) =>
      fragment.selectedAbsoluteStartRenderedUtf16 < sourceRange.endRenderedUtf16
      && fragment.selectedAbsoluteEndRenderedUtf16 > sourceRange.startRenderedUtf16
    )
    if (styleFragments.length === 0) {
      return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("change-target-mismatch", "change", "style change requires bounded text Source facts")]) })
    }
    const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
    for (const fragment of styleFragments) {
      if (fragment.item.kind !== "text") {
        return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "supported style changes may cover only text Source items")]) })
      }
      const resolved = resolveVNextTextBlockSupportedStyleOverlayInternalV1({
        sourceState: input.previousRoot.sourceState,
        baseStyle: fragment.item.style,
        nextStyle: validatedChange.change.nextStyle,
      })
      if (resolved.status !== "resolved") {
        return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue(resolved.status === "ambiguous" ? "style-authority-ambiguous" : "unsupported-change-value", "change", "style overlay must resolve against exact Source style and font authority")]) })
      }
      const renderedText = fragment.item.renderedText.slice(
        Math.max(
          fragment.selectedAbsoluteStartRenderedUtf16,
          sourceRange.startRenderedUtf16,
        )
          - fragment.itemAbsoluteStartRenderedUtf16,
        Math.min(
          fragment.selectedAbsoluteEndRenderedUtf16,
          sourceRange.endRenderedUtf16,
        )
          - fragment.itemAbsoluteStartRenderedUtf16,
      )
      const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: input.previousRoot.sourceState,
        kind: "text",
        renderedText,
        lineageId: fragment.item.lineageId,
        inlineId: fragment.item.inlineId,
        sourceFingerprint: null,
        provenanceFingerprint:
          validatedChange.change.nextStyleProvenanceFingerprint,
        style: resolved.style,
      })
      if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "style overlay could not produce canonical Source facts")]) })
      items.push(item)
    }
    replacementItems = freeze(items)
  }
  const replacementLength = replacementItems.reduce(
    (sum, item) => sum + item.renderedUtf16Length,
    0,
  )
  if (replacementLength !== declaredReplacementLength) {
    return freeze({ status: "blocked" as const, completedCandidateWork: meter.completedCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "canonical replacement length differs from the exact declared replacement")]) })
  }
  const previousDelta = sourceCoverage.fragments.flatMap((fragment) => {
    const selectedStart = Math.max(
      fragment.itemAbsoluteStartRenderedUtf16,
      fragment.selectedAbsoluteStartRenderedUtf16,
      sourceRange.startRenderedUtf16,
    )
    const selectedEnd = Math.min(
      fragment.itemAbsoluteEndRenderedUtf16,
      fragment.selectedAbsoluteEndRenderedUtf16,
      sourceRange.endRenderedUtf16,
    )
    if (selectedEnd <= selectedStart) return []
    return [boundedDeltaComparable(
      fragment.item,
      fragment.item.renderedText.slice(
        selectedStart - fragment.itemAbsoluteStartRenderedUtf16,
        selectedEnd - fragment.itemAbsoluteStartRenderedUtf16,
      ),
    )]
  })
  const nextDelta = replacementItems.map((item) =>
    boundedDeltaComparable(item, item.renderedText))
  const boundedDelta = boundedDeltaFacts(previousDelta, nextDelta)
  const effectClassification = effectClassificationFromBoundedDelta(boundedDelta)
  const producerEvidence = effectClassification.effectClass
      === "geometry-affecting-change"
    ? "required" as const
    : "not-required" as const
  const preflight = freeze({ change: validatedChange.change, eligibility: validatedChange.eligibility, boundedDelta, effectClassification, producerEvidence, previousRanges, nextRanges, replacementItems, fingerprint: fingerprint({ changeFingerprint: validatedChange.fingerprint, previousRanges, nextRanges, boundedDelta, effectClassification, producerEvidence }) })
  const sourceReplacementFacts = {
    previousRange: previousRanges.changedSourceRange,
    nextItemFingerprints: replacementItems.map((item) => item.fingerprint),
    previousDeltaFingerprint: boundedDelta.fingerprint,
    preflightFingerprint: preflight.fingerprint,
  }
  const sourceReplacement = freeze({
    previousRange: previousRanges.changedSourceRange,
    nextItems: replacementItems,
    expectedPreviousContentFingerprint: fingerprint(
      previousDelta.map((value) => value.span.renderedText),
    ),
    expectedPreviousSourceFingerprint: fingerprint(
      previousDelta.map((value) => value.span.sourceFingerprint),
    ),
    expectedPreviousProvenanceFingerprint: fingerprint(
      previousDelta.map((value) => value.span.provenanceFingerprint),
    ),
    fingerprint: fingerprint(sourceReplacementFacts),
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: input.previousRoot.sourceState,
    replacement: sourceReplacement,
  })) {
    return freeze({
      status: "blocked" as const,
      completedCandidateWork: meter.completedCandidateWork,
      issues: freeze([issue(
        "evidence-authority-mismatch",
        "sourceState",
        "preflight could not register exact Source replacement authority",
      )]),
    })
  }
  if (producerEvidence === "not-required") {
    registerPreflightTuple({
      preflight,
      request: null,
      sourceMaterial: null,
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      validatedChange,
      completedCandidateWork: meter.completedCandidateWork,
      sourceReplacement,
    })
    return freeze({
      status: "not-required" as const,
      preflight,
      request: null,
      sourceMaterial: null,
      completedCandidateWork: meter.completedCandidateWork,
      issues: freeze([]),
    })
  }
  const paragraphStyleKey = input.previousRoot.sourceState.producerRequirements.paragraphStyle.styleKey
  const previousAtoms: VNextTextBlockTransitionProducerSourceAtomV2[] = []
  for (const fragment of sourceCoverage.fragments) {
    const selectedStart = Math.max(
      fragment.selectedAbsoluteStartRenderedUtf16,
      previousRanges.coverageRange.startRenderedUtf16,
    )
    const selectedEnd = Math.min(
      fragment.selectedAbsoluteEndRenderedUtf16,
      previousRanges.coverageRange.endRenderedUtf16,
    )
    if (selectedEnd <= selectedStart) continue
    if (!meter.beforeMaterialAtom()) break
    previousAtoms.push(atomFromItem(fragment.item, fragment.itemAbsoluteStartRenderedUtf16, selectedStart, selectedEnd, selectedStart, previousRanges.coverageRange.startRenderedUtf16, paragraphStyleKey))
  }
  if (meter.failedUnit != null) {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: meter.failedUnit,
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
    })
  }
  const lane = (ranges: VNextTextBlockTransitionProducerLaneRangesV2, atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[]): VNextTextBlockTransitionProducerLaneMaterialV2 => freeze({ ranges, atoms: freeze([...atoms]), fingerprint: fingerprint({ ranges, atoms }) })
  const previous = lane(previousRanges, previousAtoms)
  const nextAtoms: VNextTextBlockTransitionProducerSourceAtomV2[] = []
  const append = (inputAtom: {
    readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
    readonly itemAbsoluteStart: number
    readonly selectedAbsoluteStart: number
    readonly selectedAbsoluteEnd: number
    readonly outputAbsoluteStart: number
  }): void => {
    if (meter.failedUnit != null) return
    const outputAbsoluteEnd = inputAtom.outputAbsoluteStart
      + inputAtom.selectedAbsoluteEnd - inputAtom.selectedAbsoluteStart
    const clippedOutputStart = Math.max(
      inputAtom.outputAbsoluteStart,
      nextRanges.coverageRange.startRenderedUtf16,
    )
    const clippedOutputEnd = Math.min(
      outputAbsoluteEnd,
      nextRanges.coverageRange.endRenderedUtf16,
    )
    if (clippedOutputEnd <= clippedOutputStart) return
    const sourceClip = clippedOutputStart - inputAtom.outputAbsoluteStart
    if (!meter.beforeMaterialAtom()) return
    nextAtoms.push(atomFromItem(
      inputAtom.item,
      inputAtom.itemAbsoluteStart,
      inputAtom.selectedAbsoluteStart + sourceClip,
      inputAtom.selectedAbsoluteStart + sourceClip
        + clippedOutputEnd - clippedOutputStart,
      clippedOutputStart,
      nextRanges.coverageRange.startRenderedUtf16,
      paragraphStyleKey,
    ))
  }
  let emittedReplacement = false
  const emitReplacement = (): void => {
    if (emittedReplacement) return
    emittedReplacement = true
    let outputStart = sourceRange.startRenderedUtf16
    for (const item of replacementItems) {
      append({
        item,
        itemAbsoluteStart: 0,
        selectedAbsoluteStart: 0,
        selectedAbsoluteEnd: item.renderedUtf16Length,
        outputAbsoluteStart: outputStart,
      })
      outputStart += item.renderedUtf16Length
    }
  }
  for (const fragment of sourceCoverage.fragments) {
    const start = fragment.selectedAbsoluteStartRenderedUtf16
    const end = fragment.selectedAbsoluteEndRenderedUtf16
    if (end <= sourceRange.startRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: end, outputAbsoluteStart: start })
      continue
    }
    if (start >= sourceRange.endRenderedUtf16) {
      emitReplacement()
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: end, outputAbsoluteStart: start + delta })
      continue
    }
    if (start < sourceRange.startRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: sourceRange.startRenderedUtf16, outputAbsoluteStart: start })
    }
    emitReplacement()
    if (end > sourceRange.endRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: sourceRange.endRenderedUtf16, selectedAbsoluteEnd: end, outputAbsoluteStart: sourceRange.endRenderedUtf16 + delta })
    }
  }
  emitReplacement()
  if (meter.failedUnit != null) {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: meter.failedUnit,
      effectiveLimit: meter.failedEffectiveLimit,
      work: meter.completedCandidateWork,
      evaluatorOrProofAuthority: meter.failureAuthority,
    })
  }
  nextAtoms.sort((left, right) =>
    left.relativeStartRenderedUtf16 - right.relativeStartRenderedUtf16
  )
  const next = lane(nextRanges, nextAtoms)
  const requestedAtomCount = previous.atoms.length + next.atoms.length
  const requestedClusterCount = scalarCountInRange(
    next.atoms,
    nextRanges.coverageRange.startRenderedUtf16,
    nextRanges.shapeVerificationRange,
  )
  const responseLimit = evaluatedLimit(input.workPolicy, input.previousRoot, "evidence-response-nodes", 0)
  if (responseLimit.status !== "within-limit") {
    return fallback({
      previousRoot: input.previousRoot,
      change: input.change,
      workPolicy: input.workPolicy,
      unit: "evidence-response-nodes",
      effectiveLimit: responseLimit.effectiveLimit ?? 0,
      work: meter.completedCandidateWork,
    })
  }
  const nextSegmentationContextRanges = stringifyVNextCanonicalJson(nextRanges.shapeVerificationRange) === stringifyVNextCanonicalJson(nextRanges.coverageRange)
    ? freeze([nextRanges.shapeVerificationRange])
    : freeze([nextRanges.shapeVerificationRange, nextRanges.coverageRange])
  const requestFacts = { source: "vnext-text-block-transition-evidence-request-v2" as const, contractVersion: 2 as const, previousRootFingerprint: input.previousRoot.fingerprint, changeFingerprint: validatedChange.fingerprint, documentId: input.previousRoot.documentId, sectionId: input.previousRoot.sectionId, textBlockId: input.previousRoot.textBlockId, previous: previousRanges, next: nextRanges, nextSegmentationContextRanges, requiredStableSegmentationExpansionCount: nextSegmentationContextRanges.length, fontStyleUnitDependencyFingerprint: input.previousRoot.sourceState.producerRequirements.fontStyleUnitDependencyFingerprint, producerRuntimeRequirementFingerprint: input.previousRoot.sourceState.producerRequirements.producerRuntimeRequirementFingerprint, layoutUnitPolicyFingerprint: input.previousRoot.sourceState.producerRequirements.layoutUnitPolicyFingerprint, workPolicyFingerprint: input.workPolicy.fingerprint }
  const evidenceMaterial = exactEvidenceMaterialTuple({
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
    create: () => {
      const request = freeze({
        ...requestFacts,
        fingerprint: fingerprint(requestFacts),
      })
      const materialFacts = { source: "vnext-text-block-transition-producer-source-material-v2" as const, contractVersion: 2 as const, requestFingerprint: request.fingerprint, previous, next, paragraphStyleKey, fontFaces: input.previousRoot.sourceState.producerRequirements.fontFaces, layoutUnitPolicyFingerprint: input.previousRoot.sourceState.producerRequirements.layoutUnitPolicyFingerprint, sourceTopologyFingerprint: input.previousRoot.sourceState.summary.sourceFingerprint, producerWorkCeilings: { maximumVisitedEvidenceNodeCount: responseLimit.effectiveLimit, maximumRequestedAtomCount: requestedAtomCount, maximumRequestedClusterCount: requestedClusterCount } }
      const sourceMaterial = freeze({
        ...materialFacts,
        fingerprint: fingerprint(materialFacts),
      })
      return { request, sourceMaterial }
    },
  })
  const { request, sourceMaterial } = evidenceMaterial
  const work = registeredRequestWork(
    meter.completedCandidateWork,
    requestedAtomCount,
    requestedClusterCount,
  )
  registerPreflightTuple({
    preflight,
    request,
    sourceMaterial,
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
    validatedChange,
    completedCandidateWork: work,
    sourceReplacement,
  })
  return freeze({ status: "required" as const, preflight, request, sourceMaterial, completedCandidateWork: work, issues: freeze([]) })
}
