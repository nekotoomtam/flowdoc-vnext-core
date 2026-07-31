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
  VNextTextBlockLineDispositionCoverV1,
} from "./textBlockPersistentLayoutLineContractV1.js"
import {
  inspectVNextTextBlockSceneDeliveryPlanV2,
} from "./textBlockSceneDeliveryV2.js"
import {
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
  mintVNextTextBlockUnifiedLayoutFallbackAttemptInternalV1,
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
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1,
  getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1,
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
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
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

function allExactStructuralReuseDispositions(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockLineDispositionCoverV1 | null {
  coverCreationObserverForTest?.()
  const lineCount = root.lineTree.summary.lineCount
  if (lineCount === 0) return null
  const result = createVNextTextBlockLineDispositionCoverInternalV1({
    previousTree: root.lineTree,
    nextTree: root.lineTree,
    segments: [{
      disposition: "E",
      previousRange: { start: 0, end: lineCount },
      nextRange: { start: 0, end: lineCount },
      constantYDeltaLayoutUnit: null,
    }],
  })
  return result.status === "accepted" ? result.cover : null
}

function noOpWork(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  dispositions: VNextTextBlockLineDispositionCoverV1,
  visitedSourceItemCount = 0,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...base,
    flow: {
      ...base.flow,
      visitedSourceItemCount,
    },
    structuralReuseProof: {
      selectedExactSubtreeNodeCount: dispositions.work.selectedSubtreeCount,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    },
    stageWork: [
      ...(visitedSourceItemCount === 0 ? [] : [{
        stage: "source-flow" as const,
        unit: "source-items" as const,
        count: visitedSourceItemCount,
      }]),
      {
        stage: "structural-reuse-proof" as const,
        unit: "selected-exact-subtree-nodes" as const,
        count: dispositions.work.selectedSubtreeCount,
      },
    ],
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
    readonly copiedSceneNodeCount: number
    readonly replacementChunkCount: number
    readonly deliveryOperationCount: number
    readonly retainCoverNodeCount: number
    readonly estimatedCanonicalPayloadByteCount: number
    readonly payloadObservationFingerprint: string | null
    readonly visitedSourceItemCount?: number
    readonly attemptedRegistrationCount?: number
    readonly committedRegistrationCount?: number
  },
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...base,
    flow: {
      ...base.flow,
      visitedSourceItemCount: input.visitedSourceItemCount ?? 1,
    },
    structuralReuseProof: {
      selectedExactSubtreeNodeCount:
        input.dispositionCover.work.selectedSubtreeCount,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    },
    scene: {
      copiedSceneNodeCount: input.copiedSceneNodeCount,
      replacementChunkCount: input.replacementChunkCount,
    },
    deliveryPlan: {
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
    stageWork: [
      {
        stage: "source-flow" as const,
        unit: "source-items" as const,
        count: input.visitedSourceItemCount ?? 1,
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

function previousSummaryBase(
  root: VNextTextBlockUnifiedLayoutRootV2,
  unit: VNextTextBlockIncrementalCandidateWorkV1["stageWork"][number]["unit"],
): number {
  switch (unit) {
    case "source-items":
    case "flow-atoms":
    case "flow-tree-nodes":
      return root.sourceState.summary.itemCount
    case "spatial-index-nodes":
    case "spatial-query-bands":
      return root.spatialState.summary.entryCount
    case "selected-exact-subtree-nodes":
    case "recomputed-lines":
    case "proof-nodes":
    case "reprojected-lines":
    case "visited-fragments":
      return root.lineTree.summary.lineCount
    case "copied-scene-nodes":
    case "replacement-chunks":
    case "delivery-operations":
    case "retain-cover-nodes":
      return root.persistentScene.summary.chunkCount
  }
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
      previousSummaryBase: previousSummaryBase(root, item.unit),
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

function acceptedNoOpAfterWorkLimit(
  root: VNextTextBlockUnifiedLayoutRootV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  dispositions: VNextTextBlockLineDispositionCoverV1,
  work: VNextTextBlockIncrementalCandidateWorkV1,
): VNextTextBlockUnifiedLayoutTransitionResultV1 {
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
  const dispositions = allExactStructuralReuseDispositions(input.previousRoot)
  if (dispositions == null) {
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
    return acceptedNoOpAfterWorkLimit(
      input.previousRoot,
      input.workPolicy,
      dispositions,
      noOpWork(bound.incrementalCandidateWork, dispositions),
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
    })
  if (source.status === "blocked") {
    return blockedResult(
      bound.incrementalCandidateWork,
      [issue(
        "change-target-mismatch",
        "source-flow",
        "change",
        source.issues[0].message,
      )],
    )
  }
  if (source.status === "unchanged") {
    return acceptedNoOpAfterWorkLimit(
      input.previousRoot,
      input.workPolicy,
      dispositions,
      noOpWork(
        bound.incrementalCandidateWork,
        dispositions,
        1,
      ),
    )
  }
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
      bound.incrementalCandidateWork,
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
    const attemptedWork = paintWork(bound.incrementalCandidateWork, {
      dispositionCover: dispositions,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
      deliveryOperationCount: 0,
      retainCoverNodeCount: 0,
      estimatedCanonicalPayloadByteCount: 0,
      payloadObservationFingerprint: null,
    })
    const attempt = mintVNextTextBlockUnifiedLayoutFallbackAttemptInternalV1({
        previousRoot: input.previousRoot,
        change: input.change,
        workPolicy: input.workPolicy,
        mode: "incremental-proof-failed",
        reason: {
          code: "bounded-reuse-proof-unavailable",
          stage: "scene",
          proof: "retain-cover",
        },
        skippedOrFailedStage: "scene",
        incrementalCandidateWork: attemptedWork,
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
  const beforeRegistrationWork = paintWork(
    bound.incrementalCandidateWork,
    {
      dispositionCover: dispositions,
      copiedSceneNodeCount: scene.copiedSceneNodeCount,
      replacementChunkCount: scene.replacementChunkCount,
      deliveryOperationCount: scene.deliveryPlan.operations.length,
      retainCoverNodeCount:
        scene.deliveryPlan.summary.retainedSubtreeCount,
      estimatedCanonicalPayloadByteCount:
        scene.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint:
        scene.deliveryPlan.observations.payloadObservationFingerprint,
      visitedSourceItemCount: scene.visitedSourceItemCount,
    },
  )
  const limitFailure = workLimitFailure(
    input.previousRoot,
    input.workPolicy,
    beforeRegistrationWork,
  )
  if (limitFailure != null) {
    if (limitFailure.kind === "limit-exceeded") {
      const attempt =
        mintVNextTextBlockUnifiedLayoutFallbackAttemptInternalV1({
          previousRoot: input.previousRoot,
          change: input.change,
          workPolicy: input.workPolicy,
          mode: "deterministic-work-limit-exceeded",
          reason: {
            code: "stage-unit-limit-exceeded",
            stage: limitFailure.stage,
            unit: limitFailure.unit,
            effectiveLimit: limitFailure.effectiveLimit,
            attemptedWork: limitFailure.attemptedWork,
          },
          skippedOrFailedStage: limitFailure.stage,
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
    dispositionsFingerprint: dispositions.fingerprint,
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
  const work = paintWork(bound.incrementalCandidateWork, {
    dispositionCover: dispositions,
    copiedSceneNodeCount: scene.copiedSceneNodeCount,
    replacementChunkCount: scene.replacementChunkCount,
    deliveryOperationCount: scene.deliveryPlan.operations.length,
    retainCoverNodeCount:
      scene.deliveryPlan.summary.retainedSubtreeCount,
    estimatedCanonicalPayloadByteCount:
      scene.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
    payloadObservationFingerprint:
      scene.deliveryPlan.observations.payloadObservationFingerprint,
    visitedSourceItemCount: scene.visitedSourceItemCount,
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
    dispositions,
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
