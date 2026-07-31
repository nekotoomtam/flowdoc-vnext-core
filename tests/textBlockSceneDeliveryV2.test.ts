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
import {
  createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2,
  createVNextTextBlockSceneDeliveryPlanCandidateInternalV2,
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

describe("Phase 5B canonical Scene V2 delivery", () => {
  it("builds one greedy root retain without complete scene traversal", () => {
    const scene = repeatedScene(9)
    const plan = retainOnly(scene)

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
