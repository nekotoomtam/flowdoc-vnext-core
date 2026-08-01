import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceV1,
} from "./textBlockUnifiedLayoutEvidenceContractV1.js"
import {
  bindVNextTextBlockIncrementalFlowTreeToImagePaintSourceInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import {
  bindVNextTextBlockPersistentLayoutLineTreeToImagePaintSourceInternalV1,
  createVNextTextBlockLineDispositionCoverInternalV1,
} from "./textBlockPersistentLayoutLineTreeV1.js"
import type {
  VNextTextBlockLineDispositionCoverResultV1,
  VNextTextBlockLineDispositionCoverV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import {
  inspectVNextTextBlockSceneDeliveryPlanV2,
} from "./textBlockSceneDeliveryV2.js"
import {
  createVNextTextBlockReuseProofFailureAuthorityInternalV1,
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
  mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1,
} from "./textBlockUnifiedLayoutFallbackV1.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  prepareVNextTextBlockUnifiedLayoutRootIncrementalCandidateInternalV2,
} from "./textBlockUnifiedLayoutRootV2.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockExpectedTargetBindingV1,
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockUnifiedLayoutTransitionResultInspectionV1,
  VNextTextBlockUnifiedLayoutTransitionResultV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  consumeVNextTextBlockLimitExceededAuthorityRecordInternalV1,
  deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1,
  getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1,
  getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutImagePaintSceneTransitionInternalV1,
} from "./textBlockUnifiedLayoutTransitionSceneInternalsV1.js"
import {
  bindVNextTextBlockUnifiedSpatialStateToImagePaintSourceInternalV1,
} from "./textBlockUnifiedSpatialStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  previousVNextTextBlockStageSummaryBaseInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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

function exactPublicAttemptInput(value: unknown): {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly evidence?: VNextTextBlockTransitionEvidenceV1
} | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const keys = Reflect.ownKeys(value)
    if (
      !keys.includes("previousRoot")
      || !keys.includes("change")
      || keys.some((key) =>
        key !== "previousRoot" && key !== "change" && key !== "evidence"
      )
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        typeof key !== "string"
        || descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output as {
      readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
      readonly change: VNextTextBlockUnifiedLayoutChangeV1
      readonly evidence?: VNextTextBlockTransitionEvidenceV1
    }
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

interface ResultRecord {
  readonly resultStatus:
    | "accepted-no-op"
    | "accepted-incremental"
    | "fallback-required"
    | "blocked"
  readonly rootFingerprint: string | null
  readonly rootSemanticFingerprint: string | null
  readonly persistentSceneFingerprint: string | null
  readonly persistentScenePayloadObservationFingerprint: string | null
  readonly fallbackRequestFingerprint: string | null
}

const transitionResults = new WeakMap<object, ResultRecord>()

let coverCreationObserverForTest:
  | (() => void)
  | null = null

export function setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1(
  observer: (() => void) | null,
): void {
  coverCreationObserverForTest = observer
}

function registerResult<T extends VNextTextBlockUnifiedLayoutTransitionResultV1>(
  result: T,
): T {
  transitionResults.set(result, {
    resultStatus: result.status,
    rootFingerprint:
      result.status === "accepted-no-op"
      || result.status === "accepted-incremental"
        ? result.root.fingerprint
        : null,
    rootSemanticFingerprint:
      result.status === "accepted-no-op"
      || result.status === "accepted-incremental"
        ? result.root.semanticFingerprint
        : null,
    persistentSceneFingerprint:
      result.status === "accepted-no-op"
      || result.status === "accepted-incremental"
        ? result.persistentScene.fingerprint
        : null,
    persistentScenePayloadObservationFingerprint:
      result.status === "accepted-no-op"
      || result.status === "accepted-incremental"
        ? result.persistentScene.payloadObservation
          .payloadObservationFingerprint
        : null,
    fallbackRequestFingerprint: result.status === "fallback-required"
      ? result.fallbackRequest.fingerprint
      : null,
  })
  return result
}

function blockedResult(
  work: VNextTextBlockIncrementalCandidateWorkV1,
  issues: readonly VNextTextBlockUnifiedLayoutIssueV1[],
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
  return registerResult(Object.freeze({
    status: "blocked",
    root: null,
    persistentScene: null,
    deliveryPlan: null,
    fallbackRequest: null,
    incrementalCandidateWork: work,
    issues: Object.freeze([...issues]),
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  }))
}

interface AllExactStructuralReuseProof {
  readonly status: "accepted"
  readonly cover: VNextTextBlockLineDispositionCoverV1
  readonly visitedLineTreeNodeCount: number
  readonly selectedExactSubtreeNodeCount: number
  readonly completedCandidateWork:
    VNextTextBlockIncrementalCandidateWorkV1 | null
}

type AllExactStructuralReuseResult =
  | AllExactStructuralReuseProof
  | Extract<
      VNextTextBlockLineDispositionCoverResultV1,
      { readonly status: "limit-exceeded" | "invariant-blocked" }
    >
  | { readonly status: "blocked" }

function allExactStructuralReuseDispositions(
  root: VNextTextBlockUnifiedLayoutRootV2,
  context?: {
    readonly validatedChange: VNextTextBlockValidatedChangeV1
    readonly completedCandidateWork:
      VNextTextBlockIncrementalCandidateWorkV1
  },
): AllExactStructuralReuseResult {
  coverCreationObserverForTest?.()
  const lineCount = root.lineTree.summary.lineCount
  if (lineCount === 0) return { status: "blocked" }
  const result = createVNextTextBlockLineDispositionCoverInternalV1({
    previousTree: root.lineTree,
    nextTree: root.lineTree,
    segments: [{
      disposition: "E",
      previousRange: { start: 0, end: lineCount },
      nextRange: { start: 0, end: lineCount },
      constantYDeltaLayoutUnit: null,
    }],
  }, context)
  if (
    result.status === "limit-exceeded"
    || result.status === "invariant-blocked"
  ) return result
  if (
    result.status !== "accepted"
    || result.work.selectedSubtreeNodeCount
      !== result.cover.work.selectedSubtreeCount
  ) return { status: "blocked" }
  const visitedLineTreeNodeCount =
    result.work.visitedPreviousLineTreeNodeCount
    + result.work.visitedNextLineTreeNodeCount
  if (!Number.isSafeInteger(visitedLineTreeNodeCount)) {
    return { status: "blocked" }
  }
  return Object.freeze({
    status: "accepted" as const,
    cover: result.cover,
    visitedLineTreeNodeCount,
    selectedExactSubtreeNodeCount: result.work.selectedSubtreeNodeCount,
    completedCandidateWork: result.completedCandidateWork ?? null,
  })
}

function noOpWork(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  proof: AllExactStructuralReuseProof,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...base,
    structuralReuseProof: {
      visitedLineTreeNodeCount: proof.visitedLineTreeNodeCount,
      selectedExactSubtreeNodeCount: proof.selectedExactSubtreeNodeCount,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    },
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
      factualCounts: [
        ...(base.flow.visitedSourceItemCount === 0 ? [] : [{
        stage: "source-flow" as const,
        unit: "source-items" as const,
        count: base.flow.visitedSourceItemCount,
        }]),
        {
          stage: "structural-reuse-proof" as const,
          unit: "selected-exact-subtree-nodes" as const,
          count: proof.selectedExactSubtreeNodeCount,
        },
      ],
    }),
  })
}

function acceptedNoOp(
  root: VNextTextBlockUnifiedLayoutRootV2,
  dispositions: VNextTextBlockLineDispositionCoverV1,
  work: VNextTextBlockIncrementalCandidateWorkV1,
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
  return registerResult(Object.freeze({
    status: "accepted-no-op",
    root,
    persistentScene: root.persistentScene,
    deliveryPlan: null,
    dispositions,
    incrementalCandidateWork: work,
    issues: Object.freeze([]) as readonly [],
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  }))
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

function paintWork(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  input: {
    readonly dispositionCover: VNextTextBlockLineDispositionCoverV1
    readonly visitedLineTreeNodeCount: number
    readonly sceneLineTreeNodeCount: number
    readonly sceneTreeNodeCount: number
    readonly deliverySceneTreeNodeCount: number
    readonly copiedSceneNodeCount: number
    readonly replacementChunkCount: number
    readonly deliveryOperationCount: number
    readonly retainCoverNodeCount: number
    readonly estimatedCanonicalPayloadByteCount: number
    readonly payloadObservationFingerprint: string | null
    readonly copiedSourcePathNodeCount: number
    readonly visitedChangedSourceLeafItemCount: number
    readonly preserveOwnedSourceAndLineWork?: boolean
    readonly attemptedRegistrationCount?: number
    readonly committedRegistrationCount?: number
  },
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...base,
    flow: input.preserveOwnedSourceAndLineWork
      ? base.flow
      : {
          ...base.flow,
          copiedSourcePathNodeCount: input.copiedSourcePathNodeCount,
          visitedChangedSourceLeafItemCount:
            input.visitedChangedSourceLeafItemCount,
        },
    structuralReuseProof: input.preserveOwnedSourceAndLineWork
      ? base.structuralReuseProof
      : {
          visitedLineTreeNodeCount: input.visitedLineTreeNodeCount,
          selectedExactSubtreeNodeCount:
            input.dispositionCover.work.selectedSubtreeCount,
          lineTreeWrapperAllocationCount: 0,
          completeLineTreeTraversalCount: 0,
        },
    scene: {
      visitedLineTreeNodeCount: input.sceneLineTreeNodeCount,
      visitedSceneTreeNodeCount: input.sceneTreeNodeCount,
      copiedSceneNodeCount: input.copiedSceneNodeCount,
      replacementChunkCount: input.replacementChunkCount,
    },
    deliveryPlan: {
      visitedSceneTreeNodeCount: input.deliverySceneTreeNodeCount,
      deliveryOperationCount: input.deliveryOperationCount,
      retainCoverNodeCount: input.retainCoverNodeCount,
    },
    observations: {
      estimatedCanonicalPayloadByteCount:
        input.estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint: input.payloadObservationFingerprint,
    },
    atomicAcceptance: {
      attemptedRegistrationCount:
        input.attemptedRegistrationCount ?? 0,
      committedRegistrationCount:
        input.committedRegistrationCount ?? 0,
    },
    stageWork: input.preserveOwnedSourceAndLineWork
      ? base.stageWork.map((row) => {
          const count = (() => {
            switch (`${row.stage}/${row.unit}`) {
              case "scene/line-tree-lookup-nodes":
                return input.sceneLineTreeNodeCount
              case "scene/scene-tree-lookup-nodes":
                return input.sceneTreeNodeCount
              case "scene/copied-scene-nodes":
                return input.copiedSceneNodeCount
              case "scene/replacement-chunks":
                return input.replacementChunkCount
              case "delivery-plan/scene-tree-lookup-nodes":
                return input.deliverySceneTreeNodeCount
              case "delivery-plan/delivery-operations":
                return input.deliveryOperationCount
              case "delivery-plan/retain-cover-nodes":
                return input.retainCoverNodeCount
              default:
                return row.count
            }
          })()
          return count === row.count ? row : { ...row, count }
        })
      : composeVNextTextBlockStageWorkLedgerInternalV1({
          policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
          factualCounts: [
            {
              stage: "source-flow" as const,
              unit: "source-items" as const,
              count: base.flow.visitedSourceItemCount,
            },
            {
              stage: "structural-reuse-proof" as const,
              unit: "selected-exact-subtree-nodes" as const,
              count: input.dispositionCover.work.selectedSubtreeCount,
            },
            {
              stage: "scene" as const,
              unit: "copied-scene-nodes" as const,
              count: input.copiedSceneNodeCount,
            },
            {
              stage: "scene" as const,
              unit: "replacement-chunks" as const,
              count: input.replacementChunkCount,
            },
            {
              stage: "delivery-plan" as const,
              unit: "delivery-operations" as const,
              count: input.deliveryOperationCount,
            },
            {
              stage: "delivery-plan" as const,
              unit: "retain-cover-nodes" as const,
              count: input.retainCoverNodeCount,
            },
          ],
        }),
    rootWrapperAllocationCount: 1,
  })
}

type WorkLimitFailure =
  | {
      readonly kind: "limit-exceeded"
      readonly stage:
        VNextTextBlockUnifiedLayoutIssueV1["stage"]
      readonly unit:
        VNextTextBlockIncrementalCandidateWorkV1["stageWork"][number]["unit"]
      readonly effectiveLimit: number
      readonly attemptedWork: number
    }
  | {
      readonly kind: "invalid-policy" | "inactive-stage" | "prelock-stage"
      readonly stage:
        VNextTextBlockUnifiedLayoutIssueV1["stage"]
      readonly unit:
        VNextTextBlockIncrementalCandidateWorkV1["stageWork"][number]["unit"]
    }

function workLimitFailure(
  root: VNextTextBlockUnifiedLayoutRootV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  work: VNextTextBlockIncrementalCandidateWorkV1,
): WorkLimitFailure | null {
  for (const item of work.stageWork) {
    const row = workPolicy.stages.find((candidate) =>
      candidate.stage === item.stage && candidate.unit === item.unit
    )
    if (row == null) {
      return {
        kind: "invalid-policy",
        stage: item.stage,
        unit: item.unit,
      }
    }
    if (row.lockStatus === "inactive") {
      if (item.count > 0) {
        return {
          kind: "inactive-stage",
          stage: item.stage,
          unit: item.unit,
        }
      }
      continue
    }
    if (row.lockStatus === "prelock") {
      return {
        kind: "prelock-stage",
        stage: item.stage,
        unit: item.unit,
      }
    }
    const evaluation = evaluateVNextTextBlockStageWorkLimitInternalV1({
      policy: workPolicy,
      stage: item.stage,
      unit: item.unit,
      previousSummaryBase: previousVNextTextBlockStageSummaryBaseInternalV1({
        previousRoot: root,
        unit: item.unit,
      }),
      exactValidatedChangeDelta: 1,
      attemptedWork: item.count,
    })
    if (evaluation.status === "invalid") {
      return {
        kind: "invalid-policy",
        stage: item.stage,
        unit: item.unit,
      }
    }
    if (evaluation.status === "limit-exceeded") {
      return {
        kind: "limit-exceeded",
        stage: item.stage,
        unit: item.unit,
        effectiveLimit: evaluation.effectiveLimit,
        attemptedWork: evaluation.attemptedWork,
      }
    }
  }
  return null
}

export function auditVNextTextBlockUnifiedLayoutFinalStageWorkInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly completedCandidateWork:
      VNextTextBlockIncrementalCandidateWorkV1
  },
):
  | { readonly status: "valid" }
  | {
      readonly status: "invariant-blocked"
      readonly stage: VNextTextBlockUnifiedLayoutIssueV1["stage"]
      readonly unit:
        VNextTextBlockIncrementalCandidateWorkV1["stageWork"][number]["unit"]
      readonly attemptedWork: number
      readonly effectiveLimit: number
    } {
  const failure = workLimitFailure(
    input.previousRoot,
    input.workPolicy,
    input.completedCandidateWork,
  )
  if (failure == null) return Object.freeze({ status: "valid" as const })
  const attemptedWork = failure.kind === "limit-exceeded"
    ? failure.attemptedWork
    : input.completedCandidateWork.stageWork.find((row) =>
        row.stage === failure.stage && row.unit === failure.unit
      )?.count ?? 0
  return Object.freeze({
    status: "invariant-blocked" as const,
    stage: failure.stage,
    unit: failure.unit,
    attemptedWork,
    effectiveLimit: failure.kind === "limit-exceeded"
      ? failure.effectiveLimit
      : 0,
  })
}

function acceptedNoOpAfterWorkLimit(
  root: VNextTextBlockUnifiedLayoutRootV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  dispositions: VNextTextBlockLineDispositionCoverV1,
  work: VNextTextBlockIncrementalCandidateWorkV1,
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
  if (
    workPolicy
      === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
  ) {
    const audit = auditVNextTextBlockUnifiedLayoutFinalStageWorkInternalV1({
      previousRoot: root,
      workPolicy,
      completedCandidateWork: work,
    })
    return audit.status === "valid"
      ? acceptedNoOp(root, dispositions, work)
      : blockedResult(work, [issue(
          "previous-root-authority-mismatch",
          audit.stage,
          audit.unit,
          "V3 final work audit found operation work not stopped by its owner",
        )])
  }
  const failure = workLimitFailure(root, workPolicy, work)
  if (failure == null) return acceptedNoOp(root, dispositions, work)
  const code = failure.kind === "limit-exceeded"
    ? "deterministic-work-limit-exceeded"
    : failure.kind === "invalid-policy"
      ? "invalid-work-policy"
      : failure.kind === "prelock-stage"
        ? "prelock-work-policy-stage"
        : "inactive-work-policy-stage"
  return blockedResult(work, [issue(
    code,
    failure.stage,
    failure.unit,
    `work policy does not accept ${failure.stage}/${failure.unit}`,
  )])
}

export function attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly evidence?: VNextTextBlockTransitionEvidenceV1
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.workPolicy,
  })
  if (bound.status !== "accepted") {
    return blockedResult(
      bound.incrementalCandidateWork,
      bound.issues,
    )
  }
  if (
    bound.validatedChange.producerEvidence === "not-required"
    && input.evidence != null
  ) {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "evidence-not-required",
        "evidence",
        "evidence",
        "no-op and paint-only changes forbid producer evidence",
      )],
    )
  }
  if (input.change.kind === "authored-box-width-inset-change") {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "inactive-work-policy-stage",
        "geometry",
        "change.kind",
        "authored-box geometry policy remains inactive until Phase 5B-3",
      )],
    )
  }
  if (
    input.change.kind !== "no-op"
    && input.change.kind !== "image-paint-fact-change"
  ) {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "inactive-work-policy-stage",
        "source-flow",
        "change.kind",
        "the 5B-1 private foundation opens only no-op and image paint",
      )],
    )
  }
  const structuralReuseProof =
    allExactStructuralReuseDispositions(
      input.previousRoot,
      input.workPolicy
          === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
        ? {
            validatedChange: bound.validatedChange,
            completedCandidateWork: bound.incrementalCandidateWork,
          }
        : undefined,
    )
  if (structuralReuseProof.status === "limit-exceeded") {
    const exactLimit =
      consumeVNextTextBlockLimitExceededAuthorityRecordInternalV1(
        structuralReuseProof.evaluatorAuthority,
      )
    if (
      exactLimit == null
      || exactLimit.validatedChange !== bound.validatedChange
      || exactLimit.completedCandidateWork
        !== structuralReuseProof.completedCandidateWork
    ) {
      return blockedResult(
        structuralReuseProof.completedCandidateWork,
        [issue(
          "previous-root-authority-mismatch",
          "structural-reuse-proof",
          "evaluatorAuthority",
          "line-cover limit did not retain its exact evaluator authority",
        )],
      )
    }
    const attempt =
      mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1({
        validatedChange: bound.validatedChange,
        previousRoot: input.previousRoot,
        change: input.change,
        workPolicy: input.workPolicy,
        limit: {
          stage: exactLimit.stage,
          unit: exactLimit.unit,
          effectiveLimit: exactLimit.effectiveLimit,
          attemptedWork: exactLimit.attemptedWork,
        },
        incrementalCandidateWork: exactLimit.completedCandidateWork,
      })
    if (attempt.status !== "minted") {
      return blockedResult(attempt.incrementalCandidateWork, attempt.issues)
    }
    const fallback = createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
      attempt: attempt.attempt,
    })
    if (fallback.status !== "fallback-required") {
      return blockedResult(
        fallback.incrementalCandidateWork,
        fallback.issues,
      )
    }
    return registerResult(Object.freeze({
      ...fallback,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    }))
  }
  if (structuralReuseProof.status === "invariant-blocked") {
    return blockedResult(
      structuralReuseProof.completedCandidateWork,
      [issue(
        "previous-root-authority-mismatch",
        "structural-reuse-proof",
        "stageVisit",
        "line-cover owner rejected an invalid exact visit authority",
      )],
    )
  }
  if (structuralReuseProof.status === "blocked") {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "incremental-proof-unavailable",
        "structural-reuse-proof",
        "dispositions",
        "transition could not prove one canonical all-E line cover",
      )],
    )
  }
  if (input.change.kind === "no-op") {
    const completedWork = structuralReuseProof.completedCandidateWork
    return acceptedNoOpAfterWorkLimit(
      input.previousRoot,
      input.workPolicy,
      structuralReuseProof.cover,
      completedWork
        ?? noOpWork(bound.incrementalCandidateWork, structuralReuseProof),
    )
  }
  if (input.change.kind !== "image-paint-fact-change") {
    throw new Error("validated 5B-1 transition kind escaped closed dispatch")
  }
  const sourceItemAuthority =
    getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1(
      bound.validatedChange,
    )
  if (sourceItemAuthority == null) {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "change-target-mismatch",
        "source-flow",
        "change",
        "paint transition lost its exact bound source-item authority",
      )],
    )
  }
  const sourceBaseWork = structuralReuseProof.completedCandidateWork
    ?? bound.incrementalCandidateWork
  const sourceVisitGuard = input.workPolicy
      === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
    ? getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1(
        bound.validatedChange,
      )
    : null
  if (
    input.workPolicy
      === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
    && sourceVisitGuard == null
  ) {
    return blockedResult(sourceBaseWork, [issue(
      "previous-root-authority-mismatch",
      "source-flow",
      "stageVisitGuard",
      "V3 source transition lost its exact post-binding visit guard",
    )])
  }
  const source =
    createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
      previousSourceState: input.previousRoot.sourceState,
      sourceItemAuthority,
      inlineId: input.change.inlineId,
      expectedImageSourceFingerprint:
        input.change.expectedImageSourceFingerprint,
      expectedImageDependencyFingerprint:
        input.change.expectedImageDependencyFingerprint,
      nextFit: input.change.nextFit,
      nextCrop: input.change.nextCrop,
      ...(sourceVisitGuard == null ? {} : {
        validatedChange: bound.validatedChange,
        completedCandidateWork: sourceBaseWork,
        stageVisitGuard: sourceVisitGuard,
      }),
    })
  if (source.status === "invariant-blocked") {
    return blockedResult(
      source.completedCandidateWork ?? sourceBaseWork,
      [issue(
        "previous-root-authority-mismatch",
        "source-flow",
        "stageVisit",
        "source owner rejected an invalid exact visit authority",
      )],
    )
  }
  if (source.status === "blocked") {
    return blockedResult(
      sourceBaseWork,
      [issue(
        "change-target-mismatch",
        "source-flow",
        "change",
        source.issues[0].message,
      )],
    )
  }
  if (source.status === "unchanged") {
    const completedWork = source.completedCandidateWork
      ?? structuralReuseProof.completedCandidateWork
    return acceptedNoOpAfterWorkLimit(
      input.previousRoot,
      input.workPolicy,
      structuralReuseProof.cover,
      completedWork
        ?? noOpWork(bound.incrementalCandidateWork, structuralReuseProof),
    )
  }
  const sourceCompletedWork = source.completedCandidateWork
    ?? sourceBaseWork
  const aliasesAccepted =
    bindVNextTextBlockIncrementalFlowTreeToImagePaintSourceInternalV1({
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: source.sourceState,
      flowTree: input.previousRoot.flowTree,
    })
    && bindVNextTextBlockUnifiedSpatialStateToImagePaintSourceInternalV1({
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: source.sourceState,
      spatialState: input.previousRoot.spatialState,
    })
    && bindVNextTextBlockPersistentLayoutLineTreeToImagePaintSourceInternalV1({
      previousSourceState: input.previousRoot.sourceState,
      nextSourceState: source.sourceState,
      flowTree: input.previousRoot.flowTree,
      spatialState: input.previousRoot.spatialState,
      lineTree: input.previousRoot.lineTree,
    })
  if (!aliasesAccepted) {
    return blockedResult(
      sourceCompletedWork,
      [issue(
        "atomic-acceptance-failed",
        "source-flow",
        "sourceState",
        "paint source state could not bind exact reused layout dependencies",
      )],
    )
  }
  const scene =
    prepareVNextTextBlockUnifiedLayoutImagePaintSceneTransitionInternalV1({
      previousRoot: input.previousRoot,
      nextSourceState: source.sourceState,
      sourceItemAuthority: source.sourceItemAuthority,
      inlineId: input.change.inlineId,
    })
  if (scene.status !== "prepared") {
    const attemptedWork = paintWork(sourceCompletedWork, {
      dispositionCover: structuralReuseProof.cover,
      visitedLineTreeNodeCount:
        structuralReuseProof.visitedLineTreeNodeCount,
      sceneLineTreeNodeCount: scene.visitedLineTreeNodeCount,
      sceneTreeNodeCount: scene.visitedSceneTreeNodeCount,
      deliverySceneTreeNodeCount: scene.deliveryVisitedSceneTreeNodeCount,
      copiedSceneNodeCount: scene.copiedSceneNodeCount,
      replacementChunkCount: 0,
      deliveryOperationCount: 0,
      retainCoverNodeCount: 0,
      estimatedCanonicalPayloadByteCount: 0,
      payloadObservationFingerprint: null,
      copiedSourcePathNodeCount: source.copiedSourcePathNodeCount,
      visitedChangedSourceLeafItemCount:
        source.visitedChangedSourceLeafItemCount,
      preserveOwnedSourceAndLineWork:
        structuralReuseProof.completedCandidateWork != null,
    })
    if (scene.status === "blocked") {
      return blockedResult(
        attemptedWork,
        [issue(
          "atomic-acceptance-failed",
          "scene",
          "scene",
          scene.issues[0]?.message ?? "paint scene transition blocked",
        )],
      )
    }
    const proofAuthority =
      createVNextTextBlockReuseProofFailureAuthorityInternalV1({
        validatedChange: bound.validatedChange,
        deliveryProofFailureAuthority: scene.authority,
        incrementalCandidateWork: attemptedWork,
      })
    if (proofAuthority == null) {
      return blockedResult(attemptedWork, [issue(
        "fallback-request-authority-mismatch",
        "scene",
        "proofAuthority",
        "failed retain proof did not match its exact bound transition",
      )])
    }
    const fallback =
      createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
        attempt: proofAuthority,
      })
    if (fallback.status !== "fallback-required") {
      return blockedResult(
        fallback.incrementalCandidateWork,
        fallback.issues,
      )
    }
    return registerResult(Object.freeze({
      ...fallback,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    }))
  }
  const beforeRegistrationWork = paintWork(
    sourceCompletedWork,
    {
      dispositionCover: structuralReuseProof.cover,
      visitedLineTreeNodeCount:
        structuralReuseProof.visitedLineTreeNodeCount,
      sceneLineTreeNodeCount: scene.visitedLineTreeNodeCount,
      sceneTreeNodeCount: scene.visitedSceneTreeNodeCount,
      deliverySceneTreeNodeCount: scene.deliveryVisitedSceneTreeNodeCount,
      copiedSceneNodeCount: scene.copiedSceneNodeCount,
      replacementChunkCount: scene.replacementChunkCount,
      deliveryOperationCount: scene.deliveryPlan.operations.length,
      retainCoverNodeCount:
        scene.deliveryPlan.summary.retainedSubtreeCount,
      estimatedCanonicalPayloadByteCount:
        scene.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint:
        scene.deliveryPlan.observations.payloadObservationFingerprint,
      copiedSourcePathNodeCount: source.copiedSourcePathNodeCount,
      visitedChangedSourceLeafItemCount:
        source.visitedChangedSourceLeafItemCount,
      preserveOwnedSourceAndLineWork:
        structuralReuseProof.completedCandidateWork != null,
    },
  )
  const v3FinalAudit = input.workPolicy
    === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
    ? auditVNextTextBlockUnifiedLayoutFinalStageWorkInternalV1({
        previousRoot: input.previousRoot,
        workPolicy: input.workPolicy,
        completedCandidateWork: beforeRegistrationWork,
      })
    : null
  if (v3FinalAudit?.status === "invariant-blocked") {
    return blockedResult(beforeRegistrationWork, [issue(
      "previous-root-authority-mismatch",
      v3FinalAudit.stage,
      v3FinalAudit.unit,
      "V3 final work audit found operation work not stopped by its owner",
    )])
  }
  const limitFailure = v3FinalAudit == null
    ? workLimitFailure(
        input.previousRoot,
        input.workPolicy,
        beforeRegistrationWork,
      )
    : null
  if (limitFailure != null) {
    if (limitFailure.kind === "limit-exceeded") {
      const attempt =
        mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1({
          validatedChange: bound.validatedChange,
          previousRoot: input.previousRoot,
          change: input.change,
          workPolicy: input.workPolicy,
          limit: {
            stage: limitFailure.stage,
            unit: limitFailure.unit,
            effectiveLimit: limitFailure.effectiveLimit,
            attemptedWork: limitFailure.attemptedWork,
          },
          incrementalCandidateWork: beforeRegistrationWork,
        })
      if (attempt.status !== "minted") {
        return blockedResult(
          attempt.incrementalCandidateWork,
          attempt.issues,
        )
      }
      const fallback =
        createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
          attempt: attempt.attempt,
        })
      if (fallback.status !== "fallback-required") {
        return blockedResult(
          fallback.incrementalCandidateWork,
          fallback.issues,
        )
      }
      return registerResult(Object.freeze({
        ...fallback,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      }))
    }
    const code = limitFailure.kind === "invalid-policy"
      ? "invalid-work-policy"
      : limitFailure.kind === "prelock-stage"
        ? "prelock-work-policy-stage"
        : "inactive-work-policy-stage"
    return blockedResult(
      beforeRegistrationWork,
      [issue(
        code,
        limitFailure.stage,
        limitFailure.unit,
        `work policy does not open ${limitFailure.stage}/${limitFailure.unit}`,
      )],
    )
  }
  const transitionFingerprint = fingerprint({
    previousRootFingerprint: input.previousRoot.fingerprint,
    changeFingerprint: fingerprint(input.change),
    nextSourceStateFingerprint: source.sourceState.fingerprint,
    nextSceneFingerprint: scene.scene.fingerprint,
    deliveryPlanFingerprint: scene.deliveryPlan.fingerprint,
    dispositionsFingerprint: structuralReuseProof.cover.fingerprint,
  })
  const preparedRoot =
    prepareVNextTextBlockUnifiedLayoutRootIncrementalCandidateInternalV2({
      previousRoot: input.previousRoot,
      nextSourceState: source.sourceState,
      nextPersistentScene: scene.scene,
      workPolicy: input.workPolicy,
      transitionFingerprint,
    })
  if (preparedRoot.status !== "prepared") {
    return blockedResult(
      beforeRegistrationWork,
      preparedRoot.issues,
    )
  }
  const actualTargetBinding =
    deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
      preparedRoot.root,
    )
  if (!sameTargetBinding(
    actualTargetBinding,
    bound.validatedChange.expectedTargetBinding,
  )) {
    return blockedResult(
      beforeRegistrationWork,
      [issue(
        "change-target-mismatch",
        "atomic-acceptance",
        "expectedTargetBinding",
        "paint transition candidate does not match every target-binding field",
      )],
    )
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      preparedRoot.root,
    )
  if (registration.status !== "committed") {
    return blockedResult(
      beforeRegistrationWork,
      [issue(
        "atomic-acceptance-failed",
        "atomic-acceptance",
        "root",
        registration.message,
      )],
    )
  }
  const deliveryInspection = inspectVNextTextBlockSceneDeliveryPlanV2({
    previousScene: input.previousRoot.persistentScene,
    nextScene: scene.scene,
    plan: scene.deliveryPlan,
  })
  if (deliveryInspection.status !== "valid") {
    throw new Error(
      "registered paint transition failed post-commit delivery invariant",
    )
  }
  const work = paintWork(sourceCompletedWork, {
    dispositionCover: structuralReuseProof.cover,
    visitedLineTreeNodeCount: structuralReuseProof.visitedLineTreeNodeCount,
    sceneLineTreeNodeCount: scene.visitedLineTreeNodeCount,
    sceneTreeNodeCount: scene.visitedSceneTreeNodeCount,
    deliverySceneTreeNodeCount: scene.deliveryVisitedSceneTreeNodeCount,
    copiedSceneNodeCount: scene.copiedSceneNodeCount,
    replacementChunkCount: scene.replacementChunkCount,
    deliveryOperationCount: scene.deliveryPlan.operations.length,
    retainCoverNodeCount:
      scene.deliveryPlan.summary.retainedSubtreeCount,
    estimatedCanonicalPayloadByteCount:
      scene.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
    payloadObservationFingerprint:
      scene.deliveryPlan.observations.payloadObservationFingerprint,
    copiedSourcePathNodeCount: source.copiedSourcePathNodeCount,
    visitedChangedSourceLeafItemCount:
      source.visitedChangedSourceLeafItemCount,
    preserveOwnedSourceAndLineWork:
      structuralReuseProof.completedCandidateWork != null,
    attemptedRegistrationCount:
      registration.attemptedRegistrationCount,
    committedRegistrationCount:
      registration.committedRegistrationCount,
  })
  return registerResult(Object.freeze({
    status: "accepted-incremental",
    root: preparedRoot.root,
    persistentScene: scene.scene,
    deliveryPlan: scene.deliveryPlan,
    dispositions: structuralReuseProof.cover,
    incrementalCandidateWork: work,
    issues: Object.freeze([]) as readonly [],
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  }))
}

export function inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutTransitionResultInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !transitionResults.has(value)
  ) {
    return {
      status: "invalid",
      code: "atomic-acceptance-failed",
      message: "transition result is not the exact process-local result",
    }
  }
  const record = transitionResults.get(value)!
  return {
    status: "valid",
    resultStatus: record.resultStatus,
    rootFingerprint: record.rootFingerprint,
    rootSemanticFingerprint: record.rootSemanticFingerprint,
    persistentSceneFingerprint: record.persistentSceneFingerprint,
    persistentScenePayloadObservationFingerprint:
      record.persistentScenePayloadObservationFingerprint,
    fallbackRequestFingerprint: record.fallbackRequestFingerprint,
  }
}

export function attemptVNextTextBlockUnifiedLayoutRootTransitionV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly evidence?: VNextTextBlockTransitionEvidenceV1
}): VNextTextBlockUnifiedLayoutTransitionResultV1
export function attemptVNextTextBlockUnifiedLayoutRootTransitionV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutTransitionResultV1
export function attemptVNextTextBlockUnifiedLayoutRootTransitionV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
  const exact = exactPublicAttemptInput(input)
  return attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
    previousRoot: exact?.previousRoot as VNextTextBlockUnifiedLayoutRootV2,
    change: exact?.change as VNextTextBlockUnifiedLayoutChangeV1,
    ...(exact != null && Object.hasOwn(exact, "evidence")
      ? { evidence: exact.evidence }
      : {}),
    workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  })
}

export function inspectVNextTextBlockUnifiedLayoutTransitionResultV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutTransitionResultInspectionV1 {
  return inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1(value)
}
