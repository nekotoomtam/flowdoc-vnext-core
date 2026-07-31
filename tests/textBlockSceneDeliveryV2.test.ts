import { describe, expect, it, vi } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  createVNextTextBlockPersistentSceneCompleteInternalV2,
  lookupVNextTextBlockPersistentSceneChunkInternalV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import type {
  VNextTextBlockPersistentSceneNodeV2,
  VNextTextBlockPersistentSceneRootV2,
  VNextTextBlockPersistentSceneV2,
} from "../src/layout/textBlockPersistentSceneContractV2.js"
import {
  createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2,
  createVNextTextBlockSceneDeliveryPlanCandidateInternalV2,
  getVNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2,
  inspectVNextTextBlockCompleteSceneDeliveryV2,
  inspectVNextTextBlockSceneDeliveryPlanV2,
  verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2,
} from "../src/layout/textBlockSceneDeliveryV2.js"
import type {
  VNextTextBlockCompleteSceneDeliveryV2,
  VNextTextBlockSceneDeliveryPlanV2,
} from "../src/layout/textBlockSceneDeliveryContractV2.js"
import {
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV1,
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import type {
  InlineImageFlowFixtureOptions,
} from "./helpers/textBlockInlineImageFlowV2.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

vi.mock("../src/layout/textBlockPersistentSceneV2.js", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../src/layout/textBlockPersistentSceneV2.js")
  >()
  return {
    ...actual,
    inspectVNextTextBlockPersistentSceneV2: () => {
      throw new Error("delivery inspection must not traverse a complete Scene")
    },
  }
})

type DeepMutable<T> =
  T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> }
      : T

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

function refingerprintCompleteDelivery(
  delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>,
): void {
  const { fingerprint: _previousFingerprint, ...facts } = delivery
  delivery.fingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(facts),
  )
}

function sceneInputsFromAccepted(
  accepted: ReturnType<typeof acceptedUnifiedLayoutRootFixtureV1>,
  entries: InlineImageFlowFixtureOptions["entries"] = [],
) {
  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
    initialFlow: accepted.root.initialFlow,
    evidence: accepted.root.evidence,
  })
  if (source.status !== "prepared") throw new Error("source blocked")
  const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
    sourceState: source.sourceState,
    evidence: accepted.root.evidence,
  })
  if (flow.status !== "prepared") throw new Error("flow blocked")
  const spatial = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
    sourceState: source.sourceState,
    entries: entries ?? [],
  })
  if (spatial.status !== "prepared") throw new Error("spatial blocked")
  const lines = createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
    sourceState: source.sourceState,
    flowTree: flow.flowTree,
    spatialState: spatial.spatialState,
    spatialLayout: accepted.root.spatialLayout,
    authoredBoxGeometry: accepted.root.authoredBoxGeometry,
  })
  if (lines.status !== "prepared") throw new Error("lines blocked")
  const scene = createVNextTextBlockPersistentSceneCompleteInternalV2({
    lineTree: lines.lineTree,
    sourceState: source.sourceState,
  })
  if (scene.status !== "prepared") throw new Error("scene blocked")
  return scene.scene
}

function completeScene(options: InlineImageFlowFixtureOptions = {}) {
  return sceneInputsFromAccepted(
    acceptedUnifiedLayoutRootFixtureV1(options),
    options.entries,
  )
}

function repeatedScene(lineCount: number) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages: true,
  })
  const accepted = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: [],
  })
  if (accepted.status !== "accepted") throw new Error("root blocked")
  return sceneInputsFromAccepted(accepted)
}

function retainOnly(scene: ReturnType<typeof completeScene>) {
  const result = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
    previousScene: scene,
    nextScene: scene,
    operations: [{
      kind: "retain-range",
      previousRange: { start: 0, end: scene.summary.chunkCount },
      nextRange: { start: 0, end: scene.summary.chunkCount },
    }],
  })
  if (result.status !== "prepared") {
    throw new Error(`delivery plan blocked: ${JSON.stringify(result.issues)}`)
  }
  return result.plan
}

function retainRange(
  scene: VNextTextBlockPersistentSceneV2,
  range: { readonly start: number; readonly end: number },
) {
  const operations = [
    ...(range.start === 0
      ? []
      : [{
          kind: "splice-range" as const,
          previousRange: { start: 0, end: range.start },
          nextRange: { start: 0, end: range.start },
        }]),
    {
      kind: "retain-range" as const,
      previousRange: range,
      nextRange: range,
    },
    ...(range.end === scene.summary.chunkCount
      ? []
      : [{
          kind: "splice-range" as const,
          previousRange: {
            start: range.end,
            end: scene.summary.chunkCount,
          },
          nextRange: {
            start: range.end,
            end: scene.summary.chunkCount,
          },
        }]),
  ]
  const result = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
    previousScene: scene,
    nextScene: scene,
    operations,
  })
  if (result.status !== "prepared") {
    throw new Error(`delivery plan blocked: ${JSON.stringify(result.issues)}`)
  }
  const retain = result.plan.operations.find(
    (operation) => operation.kind === "retain-range",
  )
  if (retain?.kind !== "retain-range") throw new Error("retain missing")
  return { plan: result.plan, retain, work: result.work }
}

function nodeRangeAtPath(
  root: VNextTextBlockPersistentSceneRootV2,
  path: readonly number[],
): {
  readonly node: VNextTextBlockPersistentSceneNodeV2
  readonly start: number
  readonly end: number
  readonly parentStart: number | null
  readonly parentEnd: number | null
} {
  if (root.nodeKind === "empty") throw new Error("empty root has no path")
  let node: VNextTextBlockPersistentSceneNodeV2 = root
  let start = 0
  let parentStart: number | null = null
  let parentEnd: number | null = null
  for (const childIndex of path) {
    if (node.nodeKind !== "branch") throw new Error("path left branch")
    parentStart = start
    parentEnd = start + node.summary.chunkCount
    for (let index = 0; index < childIndex; index += 1) {
      start += node.children[index]!.summary.chunkCount
    }
    node = node.children[childIndex]!
  }
  return {
    node,
    start,
    end: start + node.summary.chunkCount,
    parentStart,
    parentEnd,
  }
}

function expectHighestContainedCover(
  scene: VNextTextBlockPersistentSceneV2,
  range: { readonly start: number; readonly end: number },
  retained: Extract<
    VNextTextBlockSceneDeliveryPlanV2["operations"][number],
    { readonly kind: "retain-range" }
  >["retainedSubtrees"],
): void {
  for (const item of retained) {
    const selected = nodeRangeAtPath(scene.root, item.previousPath)
    expect(selected.start).toBeGreaterThanOrEqual(range.start)
    expect(selected.end).toBeLessThanOrEqual(range.end)
    expect(item.fingerprint).toBe(selected.node.fingerprint)
    expect(item.payloadObservationFingerprint).toBe(
      selected.node.payloadObservation.payloadObservationFingerprint,
    )
    expect(item.chunkCount).toBe(selected.node.summary.chunkCount)
    if (selected.parentStart != null && selected.parentEnd != null) {
      expect(
        range.start <= selected.parentStart
          && selected.parentEnd <= range.end,
      ).toBe(false)
    }
  }
}

describe("Phase 5B canonical Scene V2 delivery", () => {
  it("issues opaque proof authority only when exact retain identity cannot be established", () => {
    const previousScene = completeScene()
    const nextScene = completeScene()
    const failed = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene,
      nextScene,
      operations: [{
        kind: "retain-range",
        previousRange: {
          start: 0,
          end: previousScene.summary.chunkCount,
        },
        nextRange: { start: 0, end: nextScene.summary.chunkCount },
      }],
    })

    expect(failed).toMatchObject({
      status: "blocked",
      proofUnavailableAuthority: {},
      issues: [{ code: "delivery-plan-retain-payload-mismatch" }],
    })
    if (
      failed.status !== "blocked"
      || failed.proofUnavailableAuthority == null
    ) return
    const record =
      getVNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2(
        failed.proofUnavailableAuthority,
      )
    expect(record?.previousScene).toBe(previousScene)
    expect(record?.nextScene).toBe(nextScene)
    expect(record?.work).toBe(failed.work)
    expect(
      getVNextTextBlockSceneDeliveryRetainProofFailureRecordInternalV2(
        structuredClone(failed.proofUnavailableAuthority),
      ),
    ).toBeNull()

    const malformed = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene,
      nextScene,
      operations: [],
    })
    expect(malformed).toMatchObject({
      status: "blocked",
      proofUnavailableAuthority: null,
      issues: [{ code: "delivery-plan-range-nonexhaustive" }],
    })
  })

  it("selects the literal highest-node cover in stored order at 8/9/17/33 chunks", () => {
    const rows = [
      {
        chunkCount: 8,
        range: { start: 1, end: 7 },
        previousPaths: [[1], [2], [3], [4], [5], [6]],
        sceneTreeVisitCount: 38,
      },
      {
        chunkCount: 9,
        range: { start: 1, end: 8 },
        previousPaths: [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
        ],
        sceneTreeVisitCount: 41,
      },
      {
        chunkCount: 17,
        range: { start: 2, end: 15 },
        previousPaths: [
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [0, 7],
          [1],
          [2, 0],
          [2, 1],
          [2, 2],
        ],
        sceneTreeVisitCount: 59,
      },
      {
        chunkCount: 33,
        range: { start: 3, end: 30 },
        previousPaths: [
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [0, 7],
          [1],
          [2],
          [3],
          [4, 0],
          [4, 1],
        ],
        sceneTreeVisitCount: 69,
      },
    ] as const

    for (const row of rows) {
      const scene = repeatedScene(row.chunkCount)
      expect(scene.policy).toMatchObject({
        policyVersion: 1,
        maximumBranchChildren: 8,
        splitOverflowLeftCount: 4,
        splitOverflowRightCount: 5,
        underflowBorrowOrder: ["left", "right"],
        underflowMergeOrder: ["left", "right"],
        collapseUnaryRoot: true,
      })
      const { plan, retain, work } = retainRange(scene, row.range)
      expect(work).toEqual({
        constructionSceneTreeVisitCount: row.sceneTreeVisitCount,
        verificationSceneTreeVisitCount: row.sceneTreeVisitCount,
        deliveryOperationCount: 3,
        retainCoverNodeCount: row.previousPaths.length,
      })
      expect(retain.retainedSubtrees.map((item) => item.previousPath))
        .toEqual(row.previousPaths)
      expectHighestContainedCover(scene, row.range, retain.retainedSubtrees)
      expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene: scene,
        nextScene: scene,
        plan,
      })).toMatchObject({
        status: "valid",
        completePreviousSceneTraversalCount: 0,
        completeNextSceneTraversalCount: 0,
      })
    }
  }, 60_000)

  it("builds one greedy root retain without complete scene traversal", () => {
    const scene = repeatedScene(9)
    const built = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      operations: [{
        kind: "retain-range",
        previousRange: { start: 0, end: 9 },
        nextRange: { start: 0, end: 9 },
      }],
    })
    expect(built.status).toBe("prepared")
    if (built.status !== "prepared") return
    const plan = built.plan

    expect(built.work).toEqual({
      constructionSceneTreeVisitCount: 2,
      verificationSceneTreeVisitCount: 2,
      deliveryOperationCount: 1,
      retainCoverNodeCount: 1,
    })

    expect(plan.operations).toEqual([{
      kind: "retain-range",
      previousRange: { start: 0, end: 9 },
      nextRange: { start: 0, end: 9 },
      retainedSubtrees: [{
        previousPath: [],
        fingerprint: scene.root.fingerprint,
        payloadObservationFingerprint:
          scene.root.payloadObservation.payloadObservationFingerprint,
        chunkCount: 9,
      }],
    }])
    expect(plan.summary).toMatchObject({
      retainOperationCount: 1,
      spliceOperationCount: 0,
      retainedSubtreeCount: 1,
      replacementChunkCount: 0,
    })
    expect(plan.summary).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(plan.work).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(plan.observations).toEqual({
      estimatedCanonicalPayloadByteCount: 0,
      payloadObservationFingerprint: expect.any(String),
    })
    expect(plan).toMatchObject({
      previousSceneFingerprint: scene.fingerprint,
      nextSceneFingerprint: scene.fingerprint,
      previousPayloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
      nextPayloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
      previousTreePolicyFingerprint: scene.policy.fingerprint,
      nextTreePolicyFingerprint: scene.policy.fingerprint,
    })
    expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      plan,
    })).toMatchObject({
      status: "valid",
      payloadObservationFingerprint:
        plan.observations.payloadObservationFingerprint,
      previousCoverageCount: 9,
      nextCoverageCount: 9,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    })
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: scene,
      nextScene: scene,
      plan,
    })).toMatchObject({
      status: "invalid",
      code: "delivery-scene-authority-mismatch",
    })
  })

  it("uses registered Scene authority without complete canonical inspection", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2()
    const plan = retainOnly(accepted.persistentScene)

    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: accepted.persistentScene,
      nextScene: accepted.persistentScene,
      plan,
    })).toMatchObject({
      status: "valid",
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    })
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: structuredClone(accepted.persistentScene),
      nextScene: accepted.persistentScene,
      plan,
    })).toMatchObject({
      status: "invalid",
      code: "delivery-scene-authority-mismatch",
    })

    const foreign = repeatedScene(9)
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: foreign,
      nextScene: foreign,
      plan: retainOnly(foreign),
    })).toMatchObject({
      status: "invalid",
      code: "delivery-scene-authority-mismatch",
    })
  })

  it("rejects nested accessor-backed retain, splice, and complete delivery data without reading getters", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2()
    const scene = accepted.persistentScene
    const retainPlan = structuredClone(retainOnly(scene)) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const retain = retainPlan.operations[0]
    if (retain?.kind !== "retain-range") throw new Error("retain missing")
    const retainedPath = retain.retainedSubtrees[0]!.previousPath as number[]
    const retainedPathValue = retainedPath[0]
    let retainGetterReads = 0
    Object.defineProperty(retainedPath, "0", {
      configurable: true,
      enumerable: true,
      get: () => {
        retainGetterReads += 1
        return retainedPathValue
      },
    })
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: scene,
      nextScene: scene,
      plan: retainPlan,
    })).toMatchObject({ status: "invalid", code: "invalid-input" })
    expect(retainGetterReads).toBe(0)

    const splice = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      operations: [{
        kind: "splice-range",
        previousRange: { start: 0, end: scene.summary.chunkCount },
        nextRange: { start: 0, end: scene.summary.chunkCount },
      }],
    })
    if (splice.status !== "prepared") throw new Error("splice plan blocked")
    const splicePlan = structuredClone(splice.plan) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const spliceOperation = splicePlan.operations[0]
    if (spliceOperation?.kind !== "splice-range") {
      throw new Error("splice missing")
    }
    const sourceSpan = spliceOperation.replacementChunks[0]!
      .lineInternals.fragments[0]!.sourceSpans[0]!
    const sourceSpanValue = sourceSpan.localStartRenderedUtf16
    let spliceGetterReads = 0
    Object.defineProperty(sourceSpan, "localStartRenderedUtf16", {
      configurable: true,
      enumerable: true,
      get: () => {
        spliceGetterReads += 1
        return sourceSpanValue
      },
    })
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: scene,
      nextScene: scene,
      plan: splicePlan,
    })).toMatchObject({ status: "invalid", code: "invalid-input" })
    expect(spliceGetterReads).toBe(0)

    const complete = createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
      root: accepted.root,
    })
    if (complete.status !== "accepted") {
      throw new Error("complete delivery blocked")
    }
    const forgedComplete = structuredClone(complete.delivery) as
      DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>
    const completeSpan = forgedComplete.chunks[0]!
      .lineInternals.fragments[0]!.sourceSpans[0]!
    const completeSpanValue = completeSpan.localStartRenderedUtf16
    let completeGetterReads = 0
    Object.defineProperty(completeSpan, "localStartRenderedUtf16", {
      configurable: true,
      enumerable: true,
      get: () => {
        completeGetterReads += 1
        return completeSpanValue
      },
    })
    expect(inspectVNextTextBlockCompleteSceneDeliveryV2(forgedComplete))
      .toMatchObject({
        status: "invalid",
        code: "complete-delivery-data-mismatch",
      })
    expect(completeGetterReads).toBe(0)

    const completeNestedAccessors = [
      (delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>) => ({
        target: delivery.chunks[0]!.sourceMapping[0] as unknown as Record<string, unknown>,
        key: "sourceStartOffset",
      }),
      (delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>) => ({
        target: delivery.chunks[0]!.contentLocalGeometry.fragments[0] as unknown as Record<string, unknown>,
        key: "xLayoutUnit",
      }),
      (delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>) => ({
        target: delivery.chunks[0]!.authoredBoxGeometry.fragments[0] as unknown as Record<string, unknown>,
        key: "xLayoutUnit",
      }),
      (delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>) => {
        const text = delivery.chunks[0]!.fragments.find(
          (fragment) => fragment.kind === "text",
        )
        if (text?.kind !== "text") throw new Error("text paint run missing")
        return { target: text.paintRuns[0] as unknown as Record<string, unknown>, key: "textColor" }
      },
      (delivery: DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>) => {
        const image = delivery.chunks[0]!.fragments.find(
          (fragment) => fragment.kind === "inline-image",
        )
        if (image?.kind !== "inline-image") throw new Error("image frame missing")
        return { target: image.authoredFrame.width as unknown as Record<string, unknown>, key: "value" }
      },
    ]
    for (const select of completeNestedAccessors) {
      const forged = structuredClone(complete.delivery) as
        DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>
      const { target, key } = select(forged)
      const descriptor = Object.getOwnPropertyDescriptor(target, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value")) {
        throw new Error("nested delivery value missing")
      }
      let getterReads = 0
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        get: () => {
          getterReads += 1
          return descriptor.value
        },
      })
      expect(inspectVNextTextBlockCompleteSceneDeliveryV2(forged))
        .toMatchObject({
          status: "invalid",
          code: "complete-delivery-data-mismatch",
        })
      expect(getterReads).toBe(0)
    }
  })

  it("normalizes adjacent insert/delete drafts into one replacement", () => {
    const scene = repeatedScene(9)
    const result = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      operations: [
        {
          kind: "splice-range",
          previousRange: { start: 0, end: 0 },
          nextRange: { start: 0, end: 1 },
        },
        {
          kind: "splice-range",
          previousRange: { start: 0, end: 1 },
          nextRange: { start: 1, end: 1 },
        },
        {
          kind: "retain-range",
          previousRange: { start: 1, end: 9 },
          nextRange: { start: 1, end: 9 },
        },
      ],
    })
    if (result.status !== "prepared") throw new Error("normalized plan blocked")

    expect(result.plan.operations).toHaveLength(2)
    expect(result.plan.operations[0]).toMatchObject({
      kind: "splice-range",
      previousRange: { start: 0, end: 1 },
      nextRange: { start: 0, end: 1 },
      replacementChunks: [expect.any(Object)],
    })
    expect(result.plan.operations[1]).toMatchObject({
      kind: "retain-range",
      previousRange: { start: 1, end: 9 },
      nextRange: { start: 1, end: 9 },
    })
    expect(result.plan.summary).toMatchObject({
      retainOperationCount: 1,
      spliceOperationCount: 1,
      replacementChunkCount: 1,
    })
    expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      plan: result.plan,
    })).toMatchObject({ status: "valid" })
  })

  it("delivers paint replacement chunks and no retained payload", () => {
    const previousScene = completeScene({
      content: "image-only",
      fit: "contain",
    })
    const nextScene = completeScene({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const result = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene,
      nextScene,
      operations: [{
        kind: "splice-range",
        previousRange: { start: 0, end: 1 },
        nextRange: { start: 0, end: 1 },
      }],
    })
    if (result.status !== "prepared") throw new Error("paint plan blocked")
    const operation = result.plan.operations[0]
    expect(operation).toMatchObject({
      kind: "splice-range",
      previousRange: { start: 0, end: 1 },
      nextRange: { start: 0, end: 1 },
      replacementChunks: [expect.any(Object)],
    })
    if (operation?.kind !== "splice-range") {
      throw new Error("paint splice missing")
    }
    const nextChunk = lookupVNextTextBlockPersistentSceneChunkInternalV2({
      scene: nextScene,
      chunkOrdinal: 0,
    })
    if (nextChunk.status !== "found") throw new Error("next chunk missing")
    expect(operation.replacementChunks[0]).toBe(nextChunk.leaf.chunk)
    expect(result.plan.summary).toMatchObject({
      retainOperationCount: 0,
      spliceOperationCount: 1,
      retainedSubtreeCount: 0,
      replacementChunkCount: 1,
    })
    expect(result.plan.summary).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(result.plan.work).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(result.plan.observations.estimatedCanonicalPayloadByteCount)
      .toBe(
        nextChunk.leaf.payloadObservation.estimatedCanonicalPayloadByteCount,
      )
    expect(result.plan.observations.estimatedCanonicalPayloadByteCount)
      .toBeGreaterThan(0)
  })

  it("blocks gaps, overlaps, alternate covers, and noncanonical operations", () => {
    const scene = repeatedScene(9)
    const canonical = retainOnly(scene)
    const rows: unknown[] = []

    const gap = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    gap.operations[0]!.nextRange.start = 1
    rows.push(gap)

    const overlap = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    overlap.operations = [
      {
        ...overlap.operations[0]!,
        previousRange: { start: 0, end: 5 },
        nextRange: { start: 0, end: 5 },
      },
      {
        ...overlap.operations[0]!,
        previousRange: { start: 4, end: 9 },
        nextRange: { start: 4, end: 9 },
      },
    ]
    rows.push(overlap)

    const alternateCover = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const retain = alternateCover.operations[0]!
    if (retain.kind !== "retain-range" || scene.root.nodeKind !== "branch") {
      throw new Error("retain fixture topology missing")
    }
    retain.retainedSubtrees = scene.root.children.map((child, index) => ({
      previousPath: [index],
      fingerprint: child.fingerprint,
      payloadObservationFingerprint:
        child.payloadObservation.payloadObservationFingerprint,
      chunkCount: child.summary.chunkCount,
    }))
    rows.push(alternateCover)

    const unmerged = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    if (scene.root.nodeKind !== "branch") throw new Error("branch missing")
    unmerged.operations = [
      {
        kind: "retain-range",
        previousRange: { start: 0, end: 4 },
        nextRange: { start: 0, end: 4 },
        retainedSubtrees: [{
          previousPath: [0],
          fingerprint: scene.root.children[0]!.fingerprint,
          payloadObservationFingerprint:
            scene.root.children[0]!.payloadObservation
              .payloadObservationFingerprint,
          chunkCount: 4,
        }],
      },
      {
        kind: "retain-range",
        previousRange: { start: 4, end: 9 },
        nextRange: { start: 4, end: 9 },
        retainedSubtrees: [{
          previousPath: [1],
          fingerprint: scene.root.children[1]!.fingerprint,
          payloadObservationFingerprint:
            scene.root.children[1]!.payloadObservation
              .payloadObservationFingerprint,
          chunkCount: 5,
        }],
      },
    ]
    rows.push(unmerged)

    const wrongFingerprint = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    if (wrongFingerprint.operations[0]!.kind !== "retain-range") {
      throw new Error("retain missing")
    }
    wrongFingerprint.operations[0]!.retainedSubtrees[0]!.fingerprint =
      `sha256:${"f".repeat(64)}`
    rows.push(wrongFingerprint)

    const wrongPayloadObservation = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    if (wrongPayloadObservation.operations[0]!.kind !== "retain-range") {
      throw new Error("retain missing")
    }
    wrongPayloadObservation.operations[0]!.retainedSubtrees[0]!
      .payloadObservationFingerprint = `sha256:${"d".repeat(64)}`
    expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      plan: wrongPayloadObservation,
    })).toMatchObject({
      status: "invalid",
      code: "delivery-plan-retain-cover-mismatch",
    })

    const wrongSummary = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    wrongSummary.summary.retainedSubtreeCount += 1
    rows.push(wrongSummary)

    const wrongPlanFingerprint = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    wrongPlanFingerprint.fingerprint = `sha256:${"e".repeat(64)}`
    rows.push(wrongPlanFingerprint)

    for (const plan of rows) {
      expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene: scene,
        nextScene: scene,
        plan,
      })).toMatchObject({ status: "invalid" })
    }
  })

  it("rejects reordered, nonmaximal, cloned, foreign, policy-drifted, and observation-drifted retain authority", () => {
    const scene = repeatedScene(17)
    const { plan: canonical } = retainRange(scene, { start: 2, end: 15 })
    const canonicalRetain = canonical.operations.find(
      (operation) => operation.kind === "retain-range",
    )
    if (
      canonicalRetain?.kind !== "retain-range"
      || scene.root.nodeKind !== "branch"
      || scene.root.children[1]?.nodeKind !== "branch"
    ) throw new Error("retain authority fixture topology missing")

    const reversed = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const reversedRetain = reversed.operations.find(
      (operation) => operation.kind === "retain-range",
    )
    if (reversedRetain?.kind !== "retain-range") throw new Error("retain missing")
    reversedRetain.retainedSubtrees.reverse()

    const leafDecomposition = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const decomposedRetain = leafDecomposition.operations.find(
      (operation) => operation.kind === "retain-range",
    )
    if (decomposedRetain?.kind !== "retain-range") {
      throw new Error("retain missing")
    }
    const fullyContainedParent = scene.root.children[1]
    const parentIndex = decomposedRetain.retainedSubtrees.findIndex(
      (item) => item.previousPath.length === 1 && item.previousPath[0] === 1,
    )
    if (parentIndex < 0) throw new Error("maximal parent missing")
    decomposedRetain.retainedSubtrees.splice(
      parentIndex,
      1,
      ...fullyContainedParent.children.map((child, index) => ({
        previousPath: [1, index],
        fingerprint: child.fingerprint,
        payloadObservationFingerprint:
          child.payloadObservation.payloadObservationFingerprint,
        chunkCount: child.summary.chunkCount,
      })),
    )

    const observationDrift = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    const observationRetain = observationDrift.operations.find(
      (operation) => operation.kind === "retain-range",
    )
    if (observationRetain?.kind !== "retain-range") {
      throw new Error("retain missing")
    }
    const exactObservationRetain = canonical.operations.find(
      (operation) => operation.kind === "retain-range",
    )
    if (exactObservationRetain?.kind !== "retain-range") {
      throw new Error("exact retain missing")
    }
    observationRetain.retainedSubtrees[0]!
      .payloadObservationFingerprint = `sha256:${"d".repeat(64)}`
    expect(observationRetain.retainedSubtrees[0]!.fingerprint).toBe(
      exactObservationRetain.retainedSubtrees[0]!.fingerprint,
    )
    expect(
      observationRetain.retainedSubtrees[0]!
        .payloadObservationFingerprint,
    ).not.toBe(
      exactObservationRetain.retainedSubtrees[0]!
        .payloadObservationFingerprint,
    )

    const policyDrift = structuredClone(canonical) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    policyDrift.previousTreePolicyFingerprint = `sha256:${"e".repeat(64)}`

    for (const forged of [
      reversed,
      leafDecomposition,
      observationDrift,
    ]) {
      for (let index = 0; index < forged.operations.length; index += 1) {
        const operation = forged.operations[index]
        const exactOperation = canonical.operations[index]
        if (
          operation?.kind === "splice-range"
          && exactOperation?.kind === "splice-range"
        ) {
          operation.replacementChunks = [
            ...exactOperation.replacementChunks,
          ] as DeepMutable<typeof operation.replacementChunks>
        }
      }
    }

    for (const [forged, code] of [
      [reversed, "delivery-plan-retain-cover-mismatch"],
      [leafDecomposition, "delivery-plan-retain-cover-mismatch"],
      [observationDrift, "delivery-plan-retain-cover-mismatch"],
      [policyDrift, "delivery-plan-scene-binding-mismatch"],
    ] as const) {
      expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene: scene,
        nextScene: scene,
        plan: forged,
      })).toMatchObject({ status: "invalid", code })
    }

    const registeredForClone = acceptedUnifiedLayoutRootFixtureV2()
    const exactRegisteredPlan = retainOnly(
      registeredForClone.persistentScene,
    )
    const clonedScene = deepFreeze(structuredClone(
      registeredForClone.persistentScene,
    ))
    expect(clonedScene.fingerprint)
      .toBe(registeredForClone.persistentScene.fingerprint)
    expect(clonedScene.root)
      .not.toBe(registeredForClone.persistentScene.root)
    expect(Object.isFrozen(clonedScene)).toBe(true)
    expect(Object.isFrozen(clonedScene.root)).toBe(true)
    expect(inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: registeredForClone.persistentScene,
      nextScene: clonedScene,
      plan: exactRegisteredPlan,
    })).toMatchObject({
      status: "invalid",
      code: "delivery-scene-authority-mismatch",
    })

    const independentlyPrepared = repeatedScene(17)
    expect(independentlyPrepared.root).not.toBe(scene.root)
    expect(independentlyPrepared.fingerprint).toBe(scene.fingerprint)
    const blockedRetain =
      createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: independentlyPrepared,
      operations: [{
        kind: "retain-range",
        previousRange: { start: 0, end: 17 },
        nextRange: { start: 0, end: 17 },
      }],
    })
    expect(blockedRetain).toMatchObject({
      status: "blocked",
      issues: [{ code: "delivery-plan-retain-payload-mismatch" }],
      work: {
        constructionSceneTreeVisitCount: 2,
        verificationSceneTreeVisitCount: 0,
        deliveryOperationCount: 0,
        retainCoverNodeCount: 0,
      },
    })

    const firstRegistered = acceptedUnifiedLayoutRootFixtureV2()
    const secondRegistered = acceptedUnifiedLayoutRootFixtureV2()
    expect(secondRegistered.persistentScene.root)
      .not.toBe(firstRegistered.persistentScene.root)
    expect(secondRegistered.persistentScene.fingerprint)
      .toBe(firstRegistered.persistentScene.fingerprint)
    for (
      let ordinal = 0;
      ordinal < firstRegistered.persistentScene.summary.chunkCount;
      ordinal += 1
    ) {
      const firstChunk = lookupVNextTextBlockPersistentSceneChunkInternalV2({
        scene: firstRegistered.persistentScene,
        chunkOrdinal: ordinal,
      })
      const secondChunk = lookupVNextTextBlockPersistentSceneChunkInternalV2({
        scene: secondRegistered.persistentScene,
        chunkOrdinal: ordinal,
      })
      if (
        firstChunk.status !== "found"
        || secondChunk.status !== "found"
      ) throw new Error("registered renderer chunk missing")
      expect(secondChunk.leaf.chunk).toEqual(firstChunk.leaf.chunk)
      expect(secondChunk.leaf.chunk).not.toBe(firstChunk.leaf.chunk)
    }
    expect(createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: firstRegistered.persistentScene,
      nextScene: secondRegistered.persistentScene,
      operations: [{
        kind: "retain-range",
        previousRange: {
          start: 0,
          end: firstRegistered.persistentScene.summary.chunkCount,
        },
        nextRange: {
          start: 0,
          end: secondRegistered.persistentScene.summary.chunkCount,
        },
      }],
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "delivery-plan-retain-payload-mismatch" }],
    })

  }, 60_000)

  it("blocks wrong replacement identity/count and reordered scripts", () => {
    const scene = repeatedScene(9)
    const result = createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: scene,
      nextScene: scene,
      operations: [
        {
          kind: "splice-range",
          previousRange: { start: 0, end: 1 },
          nextRange: { start: 0, end: 1 },
        },
        {
          kind: "retain-range",
          previousRange: { start: 1, end: 9 },
          nextRange: { start: 1, end: 9 },
        },
      ],
    })
    if (result.status !== "prepared") throw new Error("base plan blocked")
    const wrongCount = structuredClone(result.plan) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    if (wrongCount.operations[0]!.kind !== "splice-range") {
      throw new Error("splice missing")
    }
    wrongCount.operations[0]!.replacementChunks = []
    const wrongIdentity = structuredClone(result.plan) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    if (wrongIdentity.operations[0]!.kind !== "splice-range") {
      throw new Error("splice missing")
    }
    wrongIdentity.operations[0]!.replacementChunks = [
      structuredClone(wrongIdentity.operations[0]!.replacementChunks[0]!),
    ]
    const reordered = structuredClone(result.plan) as
      DeepMutable<VNextTextBlockSceneDeliveryPlanV2>
    reordered.operations.reverse()

    for (const plan of [wrongCount, wrongIdentity, reordered]) {
      expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene: scene,
        nextScene: scene,
        plan,
      })).toMatchObject({ status: "invalid" })
    }
  })

  it("binds complete delivery to exact Root and Scene semantic/observation identities", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2()
    const scene = accepted.persistentScene
    const result = createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
      root: accepted.root,
    })
    if (result.status !== "accepted") {
      throw new Error(`complete delivery blocked: ${JSON.stringify(result.issues)}`)
    }

    expect(result.delivery).toMatchObject({
      source: "vnext-text-block-complete-scene-delivery-v2",
      contractVersion: 2,
      rootFingerprint: accepted.root.fingerprint,
      rootSemanticFingerprint: accepted.root.semanticFingerprint,
      persistentSceneFingerprint: scene.fingerprint,
      persistentScenePayloadObservationFingerprint:
        scene.payloadObservation.payloadObservationFingerprint,
      summary: scene.summary,
      observations: scene.payloadObservation,
      work: {
        completeDeliveryCount: 1,
        emittedChunkCount: scene.summary.chunkCount,
      },
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(result.delivery.work).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(
      result.delivery.observations.estimatedCanonicalPayloadByteCount,
    ).toBe(scene.payloadObservation.estimatedCanonicalPayloadByteCount)
    expect(structuredClone(result.delivery)).toEqual(result.delivery)
    expect(result.delivery.chunks).toHaveLength(scene.summary.chunkCount)
    for (let index = 0; index < result.delivery.chunks.length; index += 1) {
      const found = lookupVNextTextBlockPersistentSceneChunkInternalV2({
        scene,
        chunkOrdinal: index,
      })
      if (found.status !== "found") throw new Error("chunk missing")
      expect(result.delivery.chunks[index]).toBe(found.leaf.chunk)
    }
    expect(inspectVNextTextBlockCompleteSceneDeliveryV2(result.delivery))
      .toMatchObject({
        status: "valid",
        rootFingerprint: accepted.root.fingerprint,
        rootSemanticFingerprint: accepted.root.semanticFingerprint,
        persistentSceneFingerprint: scene.fingerprint,
        persistentScenePayloadObservationFingerprint:
          scene.payloadObservation.payloadObservationFingerprint,
        estimatedCanonicalPayloadByteCount:
          scene.payloadObservation.estimatedCanonicalPayloadByteCount,
      })
    const wrongTraversalWork = structuredClone(result.delivery) as
      DeepMutable<typeof result.delivery>
    wrongTraversalWork.work.visitedSceneNodeCount = 0
    expect(inspectVNextTextBlockCompleteSceneDeliveryV2(
      wrongTraversalWork,
    )).toMatchObject({
      status: "invalid",
      code: "complete-delivery-data-mismatch",
    })

    const wrongSourceRange = structuredClone(result.delivery) as
      DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>
    if (wrongSourceRange.summary.sourceRange.start == null) {
      throw new Error("complete delivery source range missing")
    }
    wrongSourceRange.summary.sourceRange.start.localRenderedUtf16 += 1

    const wrongSourceFingerprint = structuredClone(result.delivery) as
      DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>
    wrongSourceFingerprint.summary.sourceFingerprint =
      `sha256:${"a".repeat(64)}`

    const wrongPaintFingerprint = structuredClone(result.delivery) as
      DeepMutable<VNextTextBlockCompleteSceneDeliveryV2>
    wrongPaintFingerprint.summary.paintFingerprint =
      `sha256:${"b".repeat(64)}`

    for (const forged of [
      wrongSourceRange,
      wrongSourceFingerprint,
      wrongPaintFingerprint,
    ]) {
      refingerprintCompleteDelivery(forged)
      expect(inspectVNextTextBlockCompleteSceneDeliveryV2(forged))
        .toMatchObject({
          status: "invalid",
          code: "complete-delivery-data-mismatch",
        })
    }
    expect(createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
      root: structuredClone(accepted.root),
    })).toMatchObject({
      status: "blocked",
      delivery: null,
    })
  })
})
