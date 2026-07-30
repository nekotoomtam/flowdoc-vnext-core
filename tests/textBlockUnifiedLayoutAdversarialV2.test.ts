import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
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

function policyLimitedAt(
  unit: VNextTextBlockUnifiedLayoutWorkPolicyV1["stages"][number]["unit"],
): VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  const stages = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1.stages
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
    policyId: "5b-1-v1",
    checkpoint: "5B-1" as const,
    stages: Object.freeze(stages),
  }
  return Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

describe("Phase 5B-1 Root V2 adversarial gate", () => {
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
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
      } as never),
    ).toMatchObject({ status: "blocked" })
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
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
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
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
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

  it("returns exact deterministic fallback reasons before atomic registration", () => {
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
          policy,
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
        status: "fallback-required",
        root: null,
        persistentScene: null,
        deliveryPlan: null,
        fallbackRequest: {
          mode: "deterministic-work-limit-exceeded",
          reason: {
            code: "stage-unit-limit-exceeded",
            stage: target.stage,
            unit: target.unit,
            effectiveLimit: 0,
          },
        },
        incrementalCandidateWork: {
          atomicAcceptance: {
            attemptedRegistrationCount: 0,
            committedRegistrationCount: 0,
          },
        },
      })
    }

    const drifted = deepFreeze({
      ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
      stages:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1.stages.map(
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
