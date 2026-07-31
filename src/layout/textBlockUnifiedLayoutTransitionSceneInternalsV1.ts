import type {
  VNextTextBlockSceneDeliveryOperationDraftV2,
  VNextTextBlockSceneDeliveryPlanV2,
} from "./textBlockSceneDeliveryContractV2.js"
import {
  createVNextTextBlockSceneDeliveryPlanCandidateInternalV2,
} from "./textBlockSceneDeliveryV2.js"
import type {
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import {
  createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2,
  inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2,
} from "./textBlockPersistentSceneV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"

export function prepareVNextTextBlockUnifiedLayoutImagePaintSceneTransitionInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly nextSourceState:
      VNextTextBlockUnifiedLayoutSourceStateV1
    readonly sourceItemAuthority: object
    readonly inlineId: string
  },
):
  | {
      readonly status: "prepared"
      readonly scene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: VNextTextBlockSceneDeliveryPlanV2
      readonly copiedSceneNodeCount: number
      readonly replacementChunkCount: 1
      readonly visitedSourceItemCount: number
      readonly visitedLineTreeNodeCount: number
      readonly visitedSceneTreeNodeCount: number
      readonly deliveryVisitedSceneTreeNodeCount: number
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly scene: null
      readonly deliveryPlan: null
      readonly copiedSceneNodeCount: 0
      readonly replacementChunkCount: 0
      readonly visitedSourceItemCount: number
      readonly visitedLineTreeNodeCount: number
      readonly visitedSceneTreeNodeCount: number
      readonly deliveryVisitedSceneTreeNodeCount: number
      readonly issues: readonly [{
        readonly code: "incremental-proof-unavailable"
        readonly message: string
      }]
    } {
  const scene =
    createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2({
      previousScene: input.previousRoot.persistentScene,
      nextSourceState: input.nextSourceState,
      lineTree: input.previousRoot.lineTree,
      sourceItemAuthority: input.sourceItemAuthority,
      inlineId: input.inlineId,
    })
  if (scene.status !== "prepared") {
    return {
      status: "blocked",
      scene: null,
      deliveryPlan: null,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
      visitedSourceItemCount: scene.work.visitedSourceItemCount,
      visitedLineTreeNodeCount: scene.work.visitedLineTreeNodeCount,
      visitedSceneTreeNodeCount: scene.work.visitedSceneTreeNodeCount,
      deliveryVisitedSceneTreeNodeCount: 0,
      issues: [{
        code: "incremental-proof-unavailable",
        message: scene.issues[0]?.message
          ?? "paint scene path copy failed",
      }],
    }
  }
  const fragment =
    inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
      scene: scene.scene,
      fragmentAuthority: scene.fragmentAuthority,
      completePreviousSceneTraversal: false,
      completeNextSceneTraversal: false,
    })
  if (fragment.status !== "valid-fragment") {
    return {
      status: "blocked",
      scene: null,
      deliveryPlan: null,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
      visitedSourceItemCount: scene.work.visitedSourceItemCount,
      visitedLineTreeNodeCount: scene.work.visitedLineTreeNodeCount,
      visitedSceneTreeNodeCount: scene.work.visitedSceneTreeNodeCount,
      deliveryVisitedSceneTreeNodeCount: 0,
      issues: [{
        code: "incremental-proof-unavailable",
        message: fragment.message,
      }],
    }
  }
  const chunkOrdinal = scene.affectedChunkOrdinals[0]
  const chunkCount = input.previousRoot.persistentScene.summary.chunkCount
  const operations: VNextTextBlockSceneDeliveryOperationDraftV2[] = []
  if (chunkOrdinal > 0) {
    operations.push({
      kind: "retain-range",
      previousRange: { start: 0, end: chunkOrdinal },
      nextRange: { start: 0, end: chunkOrdinal },
    })
  }
  operations.push({
    kind: "splice-range",
    previousRange: {
      start: chunkOrdinal,
      end: chunkOrdinal + 1,
    },
    nextRange: {
      start: chunkOrdinal,
      end: chunkOrdinal + 1,
    },
  })
  if (chunkOrdinal + 1 < chunkCount) {
    operations.push({
      kind: "retain-range",
      previousRange: { start: chunkOrdinal + 1, end: chunkCount },
      nextRange: { start: chunkOrdinal + 1, end: chunkCount },
    })
  }
  const delivery = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
    previousScene: input.previousRoot.persistentScene,
    nextScene: scene.scene,
    operations,
  })
  if (delivery.status !== "prepared") {
    return {
      status: "blocked",
      scene: null,
      deliveryPlan: null,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
      visitedSourceItemCount: scene.work.visitedSourceItemCount,
      visitedLineTreeNodeCount: scene.work.visitedLineTreeNodeCount,
      visitedSceneTreeNodeCount: scene.work.visitedSceneTreeNodeCount,
      deliveryVisitedSceneTreeNodeCount:
        delivery.work.constructionSceneTreeVisitCount
        + delivery.work.verificationSceneTreeVisitCount,
      issues: [{
        code: "incremental-proof-unavailable",
        message: delivery.issues[0]?.message
          ?? "paint scene delivery plan failed",
      }],
    }
  }
  return Object.freeze({
    status: "prepared",
    scene: scene.scene,
    deliveryPlan: delivery.plan,
    copiedSceneNodeCount: scene.work.incrementalCopiedNodeCount,
    replacementChunkCount: 1 as const,
    visitedSourceItemCount: scene.work.visitedSourceItemCount,
    visitedLineTreeNodeCount: scene.work.visitedLineTreeNodeCount,
    visitedSceneTreeNodeCount: scene.work.visitedSceneTreeNodeCount,
    deliveryVisitedSceneTreeNodeCount:
      delivery.work.constructionSceneTreeVisitCount
      + delivery.work.verificationSceneTreeVisitCount,
    issues: Object.freeze([]) as readonly [],
  })
}
