import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import * as sourceStateInternals from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2,
  verifyVNextTextBlockPersistentSceneCandidateInternalV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import type {
  VNextTextBlockPersistentSceneV2,
} from "../src/layout/textBlockPersistentSceneContractV2.js"
import {
  createVNextTextBlockSceneDeliveryPlanCandidateInternalV2,
} from "../src/layout/textBlockSceneDeliveryV2.js"
import {
  composeVNextTextBlockUnifiedLayoutRootIdentityForTestInternalV2,
  prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2,
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

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

function reaches(source: unknown, target: object): boolean {
  const pending: unknown[] = [source]
  const seen = new Set<object>()
  while (pending.length > 0) {
    const value = pending.pop()
    if (value === target) return true
    if (value == null || typeof value !== "object" || seen.has(value)) {
      continue
    }
    seen.add(value)
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) {
        pending.push(descriptor.value)
      }
    }
  }
  return false
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function rootWithPreparedScene(
  root: VNextTextBlockUnifiedLayoutRootV2,
  persistentScene: VNextTextBlockPersistentSceneV2,
): VNextTextBlockUnifiedLayoutRootV2 {
  const dependencyFingerprints = Object.freeze({
    ...root.dependencyFingerprints,
    persistentScene: persistentScene.fingerprint,
  })
  const constructionFingerprint = fingerprint({
    constructionKind: root.constructionKind,
    initialFlowFingerprint: root.sourceState.initialFlowFingerprint,
    evidenceFingerprint: root.sourceState.flowEvidenceFingerprint,
    spatialEntrySetFingerprint: root.spatialState.entrySetFingerprint,
    dependencyFingerprints,
  })
  const basis = Object.freeze({
    ...root,
    persistentScene,
    dependencyFingerprints,
    constructionFingerprint,
  })
  const identity =
    composeVNextTextBlockUnifiedLayoutRootIdentityForTestInternalV2({
      root: basis,
      lineTreeFingerprint: basis.lineTree.fingerprint,
      lineTreeSemanticFingerprint: basis.lineTree.semanticFingerprint,
      persistentSceneFingerprint: persistentScene.fingerprint,
    })
  return Object.freeze({
    ...basis,
    ...identity,
  })
}

function policyLimitedAt(
  unit: VNextTextBlockUnifiedLayoutWorkPolicyV1["stages"][number]["unit"],
): VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  const stages = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.stages
    .map((row) => {
      if (row.unit !== unit) return row
      const {
        fingerprint: _fingerprint,
        ...base
      } = row
      const facts = {
        ...base,
        smallBlockFloor: 0,
        absoluteStageLimit: 0,
        relativeNumerator: 0,
      }
      return Object.freeze({
        ...facts,
        fingerprint: fingerprint(facts),
      })
    })
  const facts = {
    source: "vnext-text-block-unified-layout-work-policy-v1" as const,
    contractVersion: 1 as const,
    policyId: "5b-1-v2",
    checkpoint: "5B-1" as const,
    stages: Object.freeze(stages),
  }
  return Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

describe("Phase 5B-1 Root V2 adversarial gate", () => {
  it("does not treat visible Source Tree height as prepared envelope authority", () => {
    const result = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    if (result.status !== "accepted") throw new Error("Root V2 fixture blocked")
    const inspect = (sourceStateInternals as unknown as {
      readonly inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1?:
        (sourceState: unknown) => unknown
    }).inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1
    const detached = structuredClone(result.root.sourceState) as unknown as {
      readonly root: { height: number }
    }
    detached.root.height = result.root.sourceState.root.height

    expect(inspect?.(result.root.sourceState) ?? null).toMatchObject({
      sourceItemCount: result.root.sourceState.summary.itemCount,
      treeHeight: result.root.sourceState.root.height + 1,
    })
    expect(inspect?.(detached) ?? null).toBeNull()
    expect(
      "inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1" in publicCore,
    ).toBe(false)
  })

  it("blocks mutable, accessor, symbol, class, proxy, foreign, and production inputs", () => {
    const exact = unifiedLayoutRootBuildInputFixtureV2()
    let accessorReadCount = 0
    const accessor = Object.create(null) as Record<string, unknown>
    Object.defineProperty(accessor, "inputAuthority", {
      enumerable: true,
      get() {
        accessorReadCount += 1
        throw new Error("accessor must not execute")
      },
    })
    Object.defineProperty(accessor, "initialFlow", {
      enumerable: true,
      value: exact.initialFlow,
    })
    Object.defineProperty(accessor, "evidence", {
      enumerable: true,
      value: exact.evidence,
    })
    Object.defineProperty(accessor, "spatialEntries", {
      enumerable: true,
      value: exact.spatialEntries,
    })

    const symbol = { ...exact }
    Object.defineProperty(symbol, Symbol("caller-capability"), {
      enumerable: true,
      value: true,
    })
    const proxy = new Proxy({ ...exact }, {
      getPrototypeOf() {
        throw new Error("proxy prototype trap")
      },
    })
    class ForeignRootInput {
      readonly inputAuthority = exact.inputAuthority
      readonly initialFlow = exact.initialFlow
      readonly evidence = exact.evidence
      readonly spatialEntries = exact.spatialEntries
    }
    const rows: readonly unknown[] = [
      structuredClone(exact),
      accessor,
      symbol,
      proxy,
      new ForeignRootInput(),
      { ...exact, bindProductionLayout: true },
      { ...exact, stagedEditorApply: true },
      { ...exact, fixedHeight: { value: 100, unit: "pt" } },
    ]
    for (const value of rows) {
      expect(publicCore.createVNextTextBlockUnifiedLayoutRootV2(value as never))
        .toMatchObject({
          status: "blocked",
          root: null,
          persistentScene: null,
          deliveryPlan: null,
          issues: [expect.any(Object)],
        })
    }
    expect(accessorReadCount).toBe(0)
  })

  it("keeps exact authority under clone-equivalent and cross-bound fingerprints", () => {
    const first = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    const second = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2({ documentId: "document-foreign" }),
    )
    if (first.status !== "accepted" || second.status !== "accepted") {
      throw new Error("Root V2 fixture blocked")
    }
    const collisionClone = deepFreeze(structuredClone(first.root))
    expect(collisionClone.fingerprint).toBe(first.root.fingerprint)
    expect(collisionClone).not.toBe(first.root)
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutRootV2(collisionClone))
      .toMatchObject({
        status: "invalid",
        code: "root-authority-mismatch",
      })
    expect(publicCore.inspectVNextTextBlockPersistentSceneV2(
      deepFreeze(structuredClone(first.persistentScene)),
    )).toMatchObject({
      status: "invalid",
      code: "scene-authority-mismatch",
    })

    const crossBound =
      publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
        previousRoot: second.root,
        change: noOpUnifiedLayoutChange5b(first.root),
      })
    expect(crossBound).toMatchObject({
      status: "blocked",
      root: null,
      persistentScene: null,
      deliveryPlan: null,
    })
    expect(reaches(crossBound, first.root)).toBe(false)
    expect(reaches(crossBound, second.root)).toBe(false)

    const completeMaterial = unifiedLayoutRootBuildInputFixtureV2()
    expect(publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
      previousRoot: first.root,
      change: noOpUnifiedLayoutChange5b(first.root),
      completeMaterial,
    } as never)).toMatchObject({
      status: "blocked",
      root: null,
      persistentScene: null,
      deliveryPlan: null,
    })
    expect(
      publicCore.createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1({
        previousRoot: first.root,
        change: noOpUnifiedLayoutChange5b(first.root),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
      } as never),
    ).toMatchObject({ status: "blocked" })
  })

  it("rejects genuine forced Scene collisions across retain and Root authority", () => {
    const contain =
      prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
        unifiedLayoutRootBuildInputFixtureV2({
          content: "image-only",
          fit: "contain",
        }),
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
        "complete-bootstrap",
      )
    const cover =
      prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
        unifiedLayoutRootBuildInputFixtureV2({
          content: "image-only",
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
        "complete-bootstrap",
      )
    if (contain.status !== "prepared" || cover.status !== "prepared") {
      throw new Error("Root V2 collision dependencies blocked")
    }
    const containScene =
      createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2({
        lineTree: contain.root.lineTree,
        sourceState: contain.root.sourceState,
      })
    const coverScene =
      createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2({
        lineTree: cover.root.lineTree,
        sourceState: cover.root.sourceState,
      })
    if (
      containScene.status !== "prepared"
      || coverScene.status !== "prepared"
    ) throw new Error("forced-collision Scenes blocked")

    expect(contain.root.lineTree).not.toBe(cover.root.lineTree)
    expect(contain.root.lineTree.fingerprint)
      .toBe(cover.root.lineTree.fingerprint)
    expect(containScene.scene.sourceStatePaintFingerprint)
      .not.toBe(coverScene.scene.sourceStatePaintFingerprint)
    expect(containScene.scene.root).not.toEqual(coverScene.scene.root)
    expect(containScene.scene.fingerprint).toBe(coverScene.scene.fingerprint)
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      containScene.scene,
    )).toMatchObject({ status: "valid-candidate" })
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      coverScene.scene,
    )).toMatchObject({ status: "valid-candidate" })

    expect(createVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
      previousScene: containScene.scene,
      nextScene: coverScene.scene,
      operations: [{
        kind: "retain-range",
        previousRange: { start: 0, end: 1 },
        nextRange: { start: 0, end: 1 },
      }],
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "delivery-plan-retain-payload-mismatch" }],
    })

    const exactRoot = rootWithPreparedScene(
      contain.root,
      containScene.scene,
    )
    const foreignSceneRoot = rootWithPreparedScene(
      contain.root,
      coverScene.scene,
    )
    expect(exactRoot.persistentScene)
      .not.toBe(foreignSceneRoot.persistentScene)
    expect(exactRoot.semanticFingerprint)
      .toBe(foreignSceneRoot.semanticFingerprint)
    expect(exactRoot.fingerprint).toBe(foreignSceneRoot.fingerprint)
    expect(
      prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2(
        exactRoot,
      ),
    ).toBe(true)
    expect(
      prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2(
        foreignSceneRoot,
      ),
    ).toBe(false)
    expect(registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      foreignSceneRoot,
    )).toMatchObject({
      status: "blocked",
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
    })
    expect(registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      exactRoot,
    )).toMatchObject({
      status: "committed",
      attemptedRegistrationCount: 6,
      committedRegistrationCount: 6,
    })
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutRootV2(exactRoot))
      .toMatchObject({ status: "valid" })
  })

  it("rejects cloned results and forged delivery summaries and covers", () => {
    const previous = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    if (previous.status !== "accepted") throw new Error("Root V2 blocked")
    const result =
      publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
        previousRoot: previous.root,
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "cover",
          crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
        }),
      })
    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-incremental")
    if (result.status !== "accepted-incremental") return
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutTransitionResultV1(
      result,
    )).toMatchObject({ status: "valid" })
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutTransitionResultV1(
      structuredClone(result),
    )).toMatchObject({
      status: "invalid",
      code: "atomic-acceptance-failed",
    })

    const clone = structuredClone(result.deliveryPlan)
    expect(publicCore.inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: previous.persistentScene,
      nextScene: result.persistentScene,
      plan: clone,
    })).toMatchObject({ status: "valid" })
    const forgedSummary = {
      ...clone,
      summary: {
        ...clone.summary,
        retainedSubtreeCount: clone.summary.retainedSubtreeCount + 1,
      },
    }
    expect(publicCore.inspectVNextTextBlockSceneDeliveryPlanV2({
      previousScene: previous.persistentScene,
      nextScene: result.persistentScene,
      plan: forgedSummary,
    })).toMatchObject({ status: "invalid" })
    const retain = clone.operations.find((operation) =>
      operation.kind === "retain-range"
    )
    if (retain != null && retain.kind === "retain-range") {
      const forgedCover = {
        ...clone,
        operations: clone.operations.map((operation) =>
          operation === retain
            ? {
                ...operation,
                retainedSubtrees: operation.retainedSubtrees.slice(1),
              }
            : operation
        ),
      }
      expect(publicCore.inspectVNextTextBlockSceneDeliveryPlanV2({
        previousScene: previous.persistentScene,
        nextScene: result.persistentScene,
        plan: forgedCover,
      })).toMatchObject({ status: "invalid" })
    }

    const complete =
      publicCore.createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
        root: result.root,
      })
    if (complete.status !== "accepted") throw new Error("delivery blocked")
    const forgedComplete = {
      ...structuredClone(complete.delivery),
      work: {
        ...complete.delivery.work,
        emittedChunkCount: complete.delivery.work.emittedChunkCount + 1,
      },
    }
    expect(publicCore.inspectVNextTextBlockCompleteSceneDeliveryV2(
      forgedComplete,
    )).toMatchObject({
      status: "invalid",
      code: "complete-delivery-data-mismatch",
    })
  })

  it("blocks unsafe limit arithmetic and exposes no collision or registry hooks", () => {
    expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
      stage: "scene",
      unit: "copied-scene-nodes",
      previousSummaryBase: Number.MAX_SAFE_INTEGER,
      exactValidatedChangeDelta: 1,
      attemptedWork: 1,
    })).toMatchObject({
      status: "invalid",
      effectiveLimit: null,
    })
    expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
      stage: "scene",
      unit: "copied-scene-nodes",
      previousSummaryBase: 1,
      exactValidatedChangeDelta: 1,
      attemptedWork: Number.MAX_SAFE_INTEGER + 1,
    })).toMatchObject({
      status: "invalid",
      effectiveLimit: null,
    })
    for (const name of [
      "createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2",
      "setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1",
      "registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2",
      "collectVNextTextBlockUnifiedLayoutRootsForQaV2",
    ]) {
      expect(publicCore).not.toHaveProperty(name)
    }
  })

  it("rejects non-active policy variants before atomic registration", () => {
    const source = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 8,
      includeImages: true,
    })
    const material = {
      inputAuthority: "core-synthetic-qa-only" as const,
      initialFlow: source.initialFlow,
      evidence: source.evidence,
      spatialEntries: source.spatialEntries,
    }
    for (const target of [
      { stage: "source-flow", unit: "source-items" },
      { stage: "scene", unit: "copied-scene-nodes" },
      { stage: "scene", unit: "replacement-chunks" },
      { stage: "delivery-plan", unit: "delivery-operations" },
      { stage: "delivery-plan", unit: "retain-cover-nodes" },
    ] as const) {
      const policy = policyLimitedAt(target.unit)
      const previous =
        createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
          material,
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
        )
      if (previous.status !== "accepted") {
        throw new Error(`limited-policy root blocked: ${target.unit}`)
      }
      const result =
        attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: imagePaintUnifiedLayoutChange5b(previous.root, {
            inlineId: "repeat-image-3",
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy: policy,
        })
      expect(result, target.unit).toMatchObject({
        status: "blocked",
        root: null,
        persistentScene: null,
        deliveryPlan: null,
        fallbackRequest: null,
        incrementalCandidateWork: {
          atomicAcceptance: {
            attemptedRegistrationCount: 0,
            committedRegistrationCount: 0,
          },
        },
      })
    }

    const drifted = deepFreeze({
      ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
      stages:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.stages.map(
          (row, index) => index === 0
            ? { ...row, absoluteStageLimit: row.absoluteStageLimit + 1 }
            : row,
        ),
    })
    expect(createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      material,
      drifted,
    )).toMatchObject({
      status: "blocked",
      root: null,
      issues: [{ code: "invalid-work-policy" }],
    })
  }, 60_000)
})
