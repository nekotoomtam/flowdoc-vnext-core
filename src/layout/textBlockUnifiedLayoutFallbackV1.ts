import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootBuildInputV2,
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "./textBlockUnifiedLayoutRootV2.js"
import {
  createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1,
} from "./textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import type {
  VNextTextBlockCompleteFallbackWorkV1,
  VNextTextBlockExpectedTargetBindingV1,
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutBlockedStageV1,
  VNextTextBlockUnifiedLayoutCompleteFallbackResultV1,
  VNextTextBlockUnifiedLayoutFallbackModeV1,
  VNextTextBlockUnifiedLayoutFallbackReasonV1,
  VNextTextBlockUnifiedLayoutFallbackRequestInspectionV1,
  VNextTextBlockUnifiedLayoutFallbackRequestResultV1,
  VNextTextBlockUnifiedLayoutFallbackRequestV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockUnifiedLayoutStageUnitV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  previousVNextTextBlockStageSummaryBaseInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

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

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object") return true
  if (!Object.isFrozen(value)) return false
  try {
    return Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null
        && Object.hasOwn(descriptor, "value")
        && deeplyFrozen(descriptor.value)
    })
  } catch {
    return false
  }
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

function issue(
  code: VNextTextBlockUnifiedLayoutIssueV1["code"],
  stage: VNextTextBlockUnifiedLayoutIssueV1["stage"],
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return { code, severity: "error", stage, path, message }
}

const stages = new Set<VNextTextBlockUnifiedLayoutStageV1>([
  "change-gate",
  "evidence",
  "source-flow",
  "spatial-index",
  "structural-reuse-proof",
  "layout-reconvergence",
  "geometry",
  "scene",
  "delivery-plan",
  "atomic-acceptance",
])
const proofStages = new Set<VNextTextBlockUnifiedLayoutStageV1>([
  "source-flow",
  "spatial-index",
  "structural-reuse-proof",
  "layout-reconvergence",
  "geometry",
  "scene",
  "delivery-plan",
])
const stageUnits = new Set<VNextTextBlockUnifiedLayoutStageUnitV1>([
  "source-items",
  "flow-atoms",
  "flow-tree-nodes",
  "spatial-index-nodes",
  "spatial-query-bands",
  "selected-exact-subtree-nodes",
  "recomputed-lines",
  "proof-nodes",
  "reprojected-lines",
  "visited-fragments",
  "copied-scene-nodes",
  "replacement-chunks",
  "delivery-operations",
  "retain-cover-nodes",
])
const proofs = new Set([
  "source-binding",
  "flow-path-copy",
  "spatial-path-copy",
  "exact",
  "translated",
  "retain-cover",
])

function safeNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function validatedReason(
  value: unknown,
): VNextTextBlockUnifiedLayoutFallbackReasonV1 | null {
  const head = exactRecord(value, ["code", "policyFact"])
  if (
    head?.code === "allowlisted-whole-block-spatial-impact"
    && head.policyFact === "authored-box-width-or-inset"
  ) {
    return deepFreeze({
      code: head.code,
      policyFact: head.policyFact,
    })
  }
  const proof = exactRecord(value, ["code", "stage", "proof"])
  if (
    proof?.code === "bounded-reuse-proof-unavailable"
    && typeof proof.stage === "string"
    && proofStages.has(proof.stage as VNextTextBlockUnifiedLayoutStageV1)
    && typeof proof.proof === "string"
    && proofs.has(proof.proof)
  ) {
    return deepFreeze({
      code: proof.code,
      stage: proof.stage,
      proof: proof.proof,
    } as VNextTextBlockUnifiedLayoutFallbackReasonV1)
  }
  const limit = exactRecord(value, [
    "code",
    "stage",
    "unit",
    "effectiveLimit",
    "attemptedWork",
  ])
  if (
    limit?.code === "stage-unit-limit-exceeded"
    && typeof limit.stage === "string"
    && stages.has(limit.stage as VNextTextBlockUnifiedLayoutStageV1)
    && typeof limit.unit === "string"
    && stageUnits.has(limit.unit as VNextTextBlockUnifiedLayoutStageUnitV1)
    && safeNonNegativeInteger(limit.effectiveLimit)
    && safeNonNegativeInteger(limit.attemptedWork)
    && limit.attemptedWork > limit.effectiveLimit
  ) {
    return deepFreeze({
      code: limit.code,
      stage: limit.stage,
      unit: limit.unit,
      effectiveLimit: limit.effectiveLimit,
      attemptedWork: limit.attemptedWork,
    } as VNextTextBlockUnifiedLayoutFallbackReasonV1)
  }
  return null
}

function modeMatchesReason(
  mode: VNextTextBlockUnifiedLayoutFallbackModeV1,
  reason: VNextTextBlockUnifiedLayoutFallbackReasonV1,
  stage: VNextTextBlockUnifiedLayoutStageV1,
): boolean {
  if (mode === "planned-complete") {
    return reason.code === "allowlisted-whole-block-spatial-impact"
  }
  if (mode === "incremental-proof-failed") {
    return reason.code === "bounded-reuse-proof-unavailable"
      && reason.stage === stage
  }
  return reason.code === "stage-unit-limit-exceeded"
    && reason.stage === stage
}

function boundedCandidateWork(
  work: VNextTextBlockIncrementalCandidateWorkV1,
): boolean {
  return deeplyFrozen(work)
    && work.source === "vnext-text-block-incremental-candidate-work-v1"
    && work.contractVersion === 1
    && work.flow.completeTreeRebuildCount === 0
    && work.flow.completeSemanticPassCount === 0
    && work.flow.completeSuffixTraversalCount === 0
    && work.spatial.completeIndexRebuildCount === 0
    && work.spatial.completeIndexTraversalCount === 0
    && work.layout.completeSuffixTraversalCount === 0
    && work.completeNextInputTraversalCount === 0
    && work.completeNextInputComparisonCount === 0
    && work.completeSceneTraversalCount === 0
}

function requestFacts(
  request: VNextTextBlockUnifiedLayoutFallbackRequestV1,
): Omit<VNextTextBlockUnifiedLayoutFallbackRequestV1, "fingerprint"> {
  return {
    source: request.source,
    contractVersion: request.contractVersion,
    mode: request.mode,
    reason: request.reason,
    skippedOrFailedStage: request.skippedOrFailedStage,
    incrementalWorkAttempted: request.incrementalWorkAttempted,
    previousRootFingerprint: request.previousRootFingerprint,
    changeFingerprint: request.changeFingerprint,
    documentId: request.documentId,
    sectionId: request.sectionId,
    textBlockId: request.textBlockId,
    expectedTargetBinding: request.expectedTargetBinding,
    workPolicyFingerprint: request.workPolicyFingerprint,
    incrementalCandidateWork: request.incrementalCandidateWork,
  }
}

interface FallbackRecord {
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly expectedTargetBindingFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
}

const fallbackRecords = new WeakMap<
  VNextTextBlockUnifiedLayoutFallbackRequestV1,
  FallbackRecord
>()
const fallbackPolicies = new WeakMap<
  VNextTextBlockUnifiedLayoutFallbackRequestV1,
  WeakSet<VNextTextBlockUnifiedLayoutWorkPolicyV1>
>()
const completedFallbackRequests = new WeakSet<
  VNextTextBlockUnifiedLayoutFallbackRequestV1
>()

interface FallbackAttemptRecord {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
  readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
  readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
}

export interface VNextTextBlockUnifiedLayoutFallbackAttemptInternalV1 {
  readonly __fallbackAttemptOpaque: never
}

const fallbackAttempts = new WeakMap<
  VNextTextBlockUnifiedLayoutFallbackAttemptInternalV1,
  FallbackAttemptRecord
>()

function invalidFallbackAttempt(
  work: VNextTextBlockIncrementalCandidateWorkV1,
): VNextTextBlockUnifiedLayoutBlockedStageV1 {
  return Object.freeze({
    status: "blocked",
    stage: "change-gate",
    change: null,
    incrementalCandidateWork: work,
    issues: Object.freeze([issue(
      "fallback-request-authority-mismatch",
      "change-gate",
      "fallback",
      "fallback request creation requires one exact Core-produced attempt",
    )]),
  })
}

function limitReasonMatchesAttempt(
  root: VNextTextBlockUnifiedLayoutRootV2,
  policy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  reason: Extract<
    VNextTextBlockUnifiedLayoutFallbackReasonV1,
    { readonly code: "stage-unit-limit-exceeded" }
  >,
  work: VNextTextBlockIncrementalCandidateWorkV1,
): boolean {
  const matchingRows = work.stageWork.filter((item) =>
    item.stage === reason.stage
    && item.unit === reason.unit
    && item.count === reason.attemptedWork
  )
  if (matchingRows.length !== 1) return false
  const evaluation = evaluateVNextTextBlockStageWorkLimitInternalV1({
    policy,
    stage: reason.stage,
    unit: reason.unit,
    previousSummaryBase: previousVNextTextBlockStageSummaryBaseInternalV1({
      previousRoot: root,
      unit: reason.unit,
    }),
    // The active 5B-1 change contract has one exact bound change delta.
    exactValidatedChangeDelta: 1,
    attemptedWork: reason.attemptedWork,
  })
  return evaluation.status === "limit-exceeded"
    && evaluation.effectiveLimit === reason.effectiveLimit
    && evaluation.attemptedWork === reason.attemptedWork
}

export function mintVNextTextBlockUnifiedLayoutFallbackAttemptInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
    readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
    readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
    readonly incrementalCandidateWork:
      VNextTextBlockIncrementalCandidateWorkV1
  },
):
  | {
      readonly status: "minted"
      readonly attempt: VNextTextBlockUnifiedLayoutFallbackAttemptInternalV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
    }
  | VNextTextBlockUnifiedLayoutBlockedStageV1 {
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
  })
  if (bound.status !== "accepted") return bound
  const reason = validatedReason(input.reason)
  if (
    reason == null
    || !stages.has(input.skippedOrFailedStage)
    || !modeMatchesReason(input.mode, reason, input.skippedOrFailedStage)
    || !boundedCandidateWork(input.incrementalCandidateWork)
    || (reason.code === "stage-unit-limit-exceeded" && !limitReasonMatchesAttempt(
      input.previousRoot,
      input.workPolicy,
      reason,
      input.incrementalCandidateWork,
    ))
  ) {
    return invalidFallbackAttempt(bound.incrementalCandidateWork)
  }
  const attempt = deepFreeze({}) as unknown as
    VNextTextBlockUnifiedLayoutFallbackAttemptInternalV1
  fallbackAttempts.set(attempt, {
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
    mode: input.mode,
    reason,
    skippedOrFailedStage: input.skippedOrFailedStage,
    incrementalCandidateWork: input.incrementalCandidateWork,
    expectedTargetBinding: bound.validatedChange.expectedTargetBinding,
  })
  return Object.freeze({
    status: "minted" as const,
    attempt,
    incrementalCandidateWork: input.incrementalCandidateWork,
  })
}

export function createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1(
  input:
    | { readonly attempt: VNextTextBlockUnifiedLayoutFallbackAttemptInternalV1 }
    | {
        readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
        readonly change: VNextTextBlockUnifiedLayoutChangeV1
        readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
        readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
        readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
        readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
        readonly incrementalCandidateWork:
          VNextTextBlockIncrementalCandidateWorkV1
      },
): VNextTextBlockUnifiedLayoutFallbackRequestResultV1 {
  if (!("attempt" in input)) {
    return invalidFallbackAttempt(input.incrementalCandidateWork)
  }
  const record = fallbackAttempts.get(input.attempt)
  if (record == null) {
    return invalidFallbackAttempt(
      createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(),
    )
  }
  fallbackAttempts.delete(input.attempt)
  const facts = {
    source: "vnext-text-block-unified-layout-fallback-request-v1" as const,
    contractVersion: 1 as const,
    mode: record.mode,
    reason: record.reason,
    skippedOrFailedStage: record.skippedOrFailedStage,
    incrementalWorkAttempted: record.mode !== "planned-complete",
    previousRootFingerprint: record.previousRoot.fingerprint,
    changeFingerprint: fingerprint(record.change),
    documentId: record.previousRoot.documentId,
    sectionId: record.previousRoot.sectionId,
    textBlockId: record.previousRoot.textBlockId,
    expectedTargetBinding: record.expectedTargetBinding,
    workPolicyFingerprint: record.workPolicy.fingerprint,
    incrementalCandidateWork: record.incrementalCandidateWork,
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const request: VNextTextBlockUnifiedLayoutFallbackRequestV1 = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(canonicalFacts),
  })
  fallbackRecords.set(request, {
    fingerprint: request.fingerprint,
    canonicalFacts,
    expectedTargetBindingFingerprint:
      request.expectedTargetBinding.fingerprint,
    documentId: request.documentId,
    sectionId: request.sectionId,
    textBlockId: request.textBlockId,
  })
  const policies = new WeakSet<VNextTextBlockUnifiedLayoutWorkPolicyV1>()
  policies.add(record.workPolicy)
  fallbackPolicies.set(request, policies)
  return Object.freeze({
    status: "fallback-required",
    root: null,
    persistentScene: null,
    deliveryPlan: null,
    fallbackRequest: request,
    incrementalCandidateWork: record.incrementalCandidateWork,
    issues: Object.freeze([]) as readonly [],
  })
}

export function inspectVNextTextBlockUnifiedLayoutFallbackRequestInternalV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutFallbackRequestInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !fallbackRecords.has(
      value as VNextTextBlockUnifiedLayoutFallbackRequestV1,
    )
  ) {
    return {
      status: "invalid",
      code: "fallback-request-authority-mismatch",
      message: "fallback request is not the exact process-local request",
    }
  }
  const request = value as VNextTextBlockUnifiedLayoutFallbackRequestV1
  const record = fallbackRecords.get(request)!
  if (
    !deeplyFrozen(request)
    || request.fingerprint !== record.fingerprint
    || stringifyVNextCanonicalJson(requestFacts(request))
      !== record.canonicalFacts
  ) {
    return {
      status: "invalid",
      code: "fallback-request-authority-mismatch",
      message: "fallback request no longer matches its registered facts",
    }
  }
  return {
    status: "valid",
    mode: request.mode,
    skippedOrFailedStage: request.skippedOrFailedStage,
    previousRootFingerprint: request.previousRootFingerprint,
    changeFingerprint: request.changeFingerprint,
    fingerprint: request.fingerprint,
  }
}

function zeroCompleteFallbackWork():
VNextTextBlockCompleteFallbackWorkV1 {
  return Object.freeze({
    source: "vnext-text-block-complete-fallback-work-v1",
    contractVersion: 1,
    stageWork: Object.freeze([]),
    completeRootV2BuildCount: 0,
    completeSceneV2BuildCount: 0,
    completeDeliveryCount: 0,
  })
}

function completeFallbackWork(
  build: {
    readonly completeRootV2BuildCount: number
    readonly completeSourceItemVisitCount: number
    readonly completeFlowAtomVisitCount: number
    readonly completeSpatialEntryVisitCount: number
    readonly completeLineVisitCount: number
    readonly completeFragmentVisitCount: number
    readonly completeSceneNodeVisitCount: number
  },
): VNextTextBlockCompleteFallbackWorkV1 {
  return deepFreeze({
    source: "vnext-text-block-complete-fallback-work-v1" as const,
    contractVersion: 1 as const,
    stageWork: [
      {
        stage: "source-flow" as const,
        unit: "source-items" as const,
        count: build.completeSourceItemVisitCount,
      },
      {
        stage: "source-flow" as const,
        unit: "flow-atoms" as const,
        count: build.completeFlowAtomVisitCount,
      },
      {
        stage: "spatial-index" as const,
        unit: "spatial-index-nodes" as const,
        count: build.completeSpatialEntryVisitCount,
      },
      {
        stage: "layout-reconvergence" as const,
        unit: "recomputed-lines" as const,
        count: build.completeLineVisitCount,
      },
      {
        stage: "geometry" as const,
        unit: "visited-fragments" as const,
        count: build.completeFragmentVisitCount,
      },
      {
        stage: "scene" as const,
        unit: "copied-scene-nodes" as const,
        count: build.completeSceneNodeVisitCount,
      },
    ],
    completeRootV2BuildCount: build.completeRootV2BuildCount,
    completeSceneV2BuildCount:
      build.completeRootV2BuildCount === 0 ? 0 : 1,
    completeDeliveryCount: 0,
  })
}

function blockedComplete(
  work: VNextTextBlockCompleteFallbackWorkV1,
  item: VNextTextBlockUnifiedLayoutIssueV1,
): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1 {
  return Object.freeze({
    status: "blocked",
    root: null,
    persistentScene: null,
    deliveryPlan: null,
    completeFallbackWork: work,
    issues: Object.freeze([item]),
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  })
}

function sameTargetBinding(
  actual: VNextTextBlockExpectedTargetBindingV1,
  expected: VNextTextBlockExpectedTargetBindingV1,
): boolean {
  return actual.semanticFingerprint === expected.semanticFingerprint
    && actual.renderedContentFingerprint
      === expected.renderedContentFingerprint
    && actual.sourceFingerprint === expected.sourceFingerprint
    && actual.provenanceFingerprint === expected.provenanceFingerprint
    && actual.paintFingerprint === expected.paintFingerprint
    && actual.layoutDependencyFingerprint
      === expected.layoutDependencyFingerprint
    && actual.authoredBoxPlanFingerprint
      === expected.authoredBoxPlanFingerprint
    && actual.spatialEntrySetFingerprint
      === expected.spatialEntrySetFingerprint
    && actual.fingerprint === expected.fingerprint
}

let candidateObserver:
  | ((candidate: VNextTextBlockUnifiedLayoutRootV2) => void)
  | null = null

export function setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1(
  observer:
    | ((candidate: VNextTextBlockUnifiedLayoutRootV2) => void)
    | null,
): void {
  candidateObserver = observer
}

export function completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1(
  input: {
    readonly request: VNextTextBlockUnifiedLayoutFallbackRequestV1
    readonly completeMaterial: VNextTextBlockUnifiedLayoutRootBuildInputV2
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1 {
  const inspection =
    inspectVNextTextBlockUnifiedLayoutFallbackRequestInternalV1(
      input.request,
    )
  const record = fallbackRecords.get(input.request)
  if (
    inspection.status !== "valid"
    || record == null
    || completedFallbackRequests.has(input.request)
    || fallbackPolicies.get(input.request)?.has(input.workPolicy) !== true
    || input.request.workPolicyFingerprint !== input.workPolicy.fingerprint
    || input.request.expectedTargetBinding.fingerprint
      !== record?.expectedTargetBindingFingerprint
  ) {
    return blockedComplete(zeroCompleteFallbackWork(), issue(
      "fallback-request-authority-mismatch",
      "change-gate",
      "request",
      "complete fallback requires the exact registered request/policy tuple",
    ))
  }
  const prepared =
    prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
      input.completeMaterial,
      input.workPolicy,
      "complete-fallback",
    )
  const work = completeFallbackWork(prepared.completeBuildWork)
  if (prepared.status !== "prepared") {
    return blockedComplete(work, issue(
      "fallback-target-binding-failed",
      "atomic-acceptance",
      "completeMaterial",
      "complete fallback material could not prepare an independent Root V2",
    ))
  }
  candidateObserver?.(prepared.root)
  const actualTargetBinding =
    deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
      prepared.root,
    )
  if (
    prepared.root.documentId !== record.documentId
    || prepared.root.sectionId !== record.sectionId
    || prepared.root.textBlockId !== record.textBlockId
    || !sameTargetBinding(
      actualTargetBinding,
      input.request.expectedTargetBinding,
    )
  ) {
    return blockedComplete(work, issue(
      "fallback-target-binding-failed",
      "atomic-acceptance",
      "completeMaterial",
      "independent Root V2 does not match every expected target-binding field",
    ))
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      prepared.root,
    )
  if (registration.status !== "committed") {
    return blockedComplete(work, issue(
      "atomic-acceptance-failed",
      "atomic-acceptance",
      "root",
      registration.message,
    ))
  }
  completedFallbackRequests.add(input.request)
  return Object.freeze({
    status: "accepted-complete-fallback",
    root: prepared.root,
    persistentScene: prepared.persistentScene,
    deliveryPlan: null,
    completeFallbackWork: work,
    issues: Object.freeze([]) as readonly [],
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  })
}

export function inspectVNextTextBlockUnifiedLayoutFallbackRequestV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutFallbackRequestInspectionV1 {
  return inspectVNextTextBlockUnifiedLayoutFallbackRequestInternalV1(value)
}

export function completeVNextTextBlockUnifiedLayoutRootFallbackV1(input: {
  readonly request: VNextTextBlockUnifiedLayoutFallbackRequestV1
  readonly completeMaterial: VNextTextBlockUnifiedLayoutRootBuildInputV2
}): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1
export function completeVNextTextBlockUnifiedLayoutRootFallbackV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1
export function completeVNextTextBlockUnifiedLayoutRootFallbackV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1 {
  const exact = exactRecord(input, ["request", "completeMaterial"])
  return completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
    request: exact?.request as VNextTextBlockUnifiedLayoutFallbackRequestV1,
    completeMaterial:
      exact?.completeMaterial as VNextTextBlockUnifiedLayoutRootBuildInputV2,
    workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  })
}
