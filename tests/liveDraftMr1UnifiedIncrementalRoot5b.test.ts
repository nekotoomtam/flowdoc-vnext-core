import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import {
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutFallbackV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  acceptedRepeatedUnifiedLayoutRootFixture5b,
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

interface ManifestCounterRow {
  readonly fixtureId: string
  readonly changeFamily: string
  readonly atomCount: number
  readonly lineCount: number
  readonly chunkCount: number
  readonly expectedPath: string
  readonly counters: {
    readonly sourceItems: number
    readonly selectedExactSubtreeNodes: number
    readonly copiedSceneNodes: number
    readonly replacementChunks: number
    readonly deliveryOperations: number
    readonly retainCoverNodes: number
  }
}

interface ManifestStageLimit {
  readonly stage: Parameters<
    typeof evaluateVNextTextBlockStageWorkLimitInternalV1
  >[0]["stage"]
  readonly unit: Parameters<
    typeof evaluateVNextTextBlockStageWorkLimitInternalV1
  >[0]["unit"]
  readonly smallBlockFloor: number
  readonly absoluteStageLimit: number
  readonly relativeNumerator: number
  readonly relativeDenominator: number
}

interface ManifestThreshold {
  readonly stage: ManifestStageLimit["stage"]
  readonly unit: ManifestStageLimit["unit"]
  readonly previousSummaryBase: number
  readonly exactValidatedChangeDelta: number
  readonly effectiveLimit: number
  readonly limitMinusOne: number
  readonly limit: number
  readonly limitPlusOne: number
}

interface Manifest5b1 {
  readonly checkpoint: string
  readonly scope: {
    readonly repository: string
    readonly processLocal: boolean
    readonly editor: boolean
    readonly backend: boolean
    readonly productionActivation: boolean
  }
  readonly policy: {
    readonly policyId: string
    readonly fingerprint: string
    readonly calibration: {
      readonly clockOrDurationFieldCount: number
    }
    readonly lockedStageLimits: readonly ManifestStageLimit[]
  }
  readonly fixtures: readonly ManifestCounterRow[]
  readonly thresholdRows: readonly ManifestThreshold[]
  readonly invariants: Record<string, boolean | number>
  readonly ownershipMap: Record<string, string>
}

const manifest = JSON.parse(readFileSync(
  new URL(
    "../fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json",
    import.meta.url,
  ),
  "utf8",
)) as Manifest5b1

function nextPowerOfTwo(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("calibration value must be a safe integer")
  }
  let output = 1
  while (output < value) output *= 2
  return output
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

function collectReachableObjects(source: object): ReadonlySet<object> {
  const pending: object[] = [source]
  const seen = new Set<object>()
  while (pending.length > 0) {
    const value = pending.pop()!
    if (seen.has(value)) continue
    seen.add(value)
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor != null
        && Object.hasOwn(descriptor, "value")
        && descriptor.value != null
        && typeof descriptor.value === "object"
      ) {
        pending.push(descriptor.value)
      }
    }
  }
  return seen
}

function observedCounters(
  result: Extract<
    ReturnType<
      typeof publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1
    >,
    { status: "accepted-incremental" }
  >,
) {
  return {
    sourceItems: result.incrementalCandidateWork.flow.visitedSourceItemCount,
    selectedExactSubtreeNodes:
      result.incrementalCandidateWork.structuralReuseProof
        .selectedExactSubtreeNodeCount,
    copiedSceneNodes:
      result.incrementalCandidateWork.scene.copiedSceneNodeCount,
    replacementChunks:
      result.incrementalCandidateWork.scene.replacementChunkCount,
    deliveryOperations:
      result.incrementalCandidateWork.deliveryPlan.deliveryOperationCount,
    retainCoverNodes:
      result.incrementalCandidateWork.deliveryPlan.retainCoverNodeCount,
  }
}

describe("Phase 5B-1 public foundation gate", () => {
  it("exports only the reviewed Root V2 orchestration surface", () => {
    for (const name of [
      "createVNextTextBlockUnifiedLayoutRootV2",
      "inspectVNextTextBlockUnifiedLayoutRootV2",
      "createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1",
      "inspectVNextTextBlockTransitionEvidenceRequestV1",
      "inspectVNextTextBlockTransitionEvidenceV1",
      "attemptVNextTextBlockUnifiedLayoutRootTransitionV1",
      "inspectVNextTextBlockUnifiedLayoutTransitionResultV1",
      "completeVNextTextBlockUnifiedLayoutRootFallbackV1",
      "inspectVNextTextBlockUnifiedLayoutFallbackRequestV1",
      "inspectVNextTextBlockPersistentSceneV2",
      "inspectVNextTextBlockSceneDeliveryPlanV2",
      "createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2",
      "inspectVNextTextBlockCompleteSceneDeliveryV2",
    ]) {
      expect(publicCore, name).toHaveProperty(name)
      expect(typeof publicCore[name as keyof typeof publicCore], name)
        .toBe("function")
    }
    for (const privateName of [
      "createVNextTextBlockUnifiedLayoutRootCompleteInternalV2",
      "attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1",
      "evaluateVNextTextBlockStageWorkLimitInternalV1",
      "registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2",
      "setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1",
    ]) {
      expect(publicCore).not.toHaveProperty(privateName)
    }
    expect(publicCore.createVNextTextBlockUnifiedLayoutRootV1)
      .toBeTypeOf("function")
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutRootV1)
      .toBeTypeOf("function")
  })

  it("uses the locked policy internally and preserves false capabilities", () => {
    const result = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    expect(result.status, JSON.stringify(result.issues)).toBe("accepted")
    if (result.status !== "accepted") return
    expect(result.root.workPolicy)
      .toBe(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2)
    expect(result.root.workPolicy.policyId).toBe("5b-1-v2")
    expect(result.root.contracts).toMatchObject({
      completeNextInputOnHotPath: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })

    const request =
      publicCore.createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1({
        previousRoot: result.root,
        change: noOpUnifiedLayoutChange5b(result.root),
      })
    expect(request.status).toBe("not-required")
  })

  it("validates clone-safe complete renderer data without granting Root authority", () => {
    const rootResult = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    if (rootResult.status !== "accepted") throw new Error("Root V2 blocked")
    const delivery =
      publicCore.createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
        root: rootResult.root,
      })
    expect(delivery.status, JSON.stringify(delivery.issues)).toBe("accepted")
    if (delivery.status !== "accepted") return
    const clone = structuredClone(delivery.delivery)
    const cloneInspection =
      publicCore.inspectVNextTextBlockCompleteSceneDeliveryV2(clone)
    expect(cloneInspection, JSON.stringify(cloneInspection))
      .toMatchObject({
        status: "valid",
        rootFingerprint: rootResult.root.fingerprint,
      })
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutRootV2(
      structuredClone(rootResult.root),
    )).toMatchObject({ status: "invalid", code: "root-authority-mismatch" })
    expect(publicCore.inspectVNextTextBlockPersistentSceneV2(
      structuredClone(rootResult.persistentScene),
    )).toMatchObject({ status: "invalid", code: "scene-authority-mismatch" })
  })

  it("matches the deterministic manifest counters and calibration formula", () => {
    expect(manifest).toMatchObject({
      checkpoint: "5B-1",
      scope: {
        repository: "flowdoc-vnext-core",
        processLocal: true,
        editor: false,
        backend: false,
        productionActivation: false,
      },
      policy: {
        policyId: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.policyId,
        fingerprint:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.fingerprint,
        calibration: { clockOrDurationFieldCount: 0 },
      },
    })
    expect(JSON.stringify(manifest)).not.toMatch(
      /elapsed|durationMs|performance\.now|Date\.now/u,
    )

    const unitCounter = {
      "source-items": "sourceItems",
      "selected-exact-subtree-nodes": "selectedExactSubtreeNodes",
      "copied-scene-nodes": "copiedSceneNodes",
      "replacement-chunks": "replacementChunks",
      "delivery-operations": "deliveryOperations",
      "retain-cover-nodes": "retainCoverNodes",
    } as const
    for (const row of manifest.policy.lockedStageLimits) {
      const counter = unitCounter[row.unit as keyof typeof unitCounter]
      expect(counter).toBeDefined()
      const observed = manifest.fixtures.map((fixture) =>
        fixture.counters[counter!]
      )
      const smallObserved = manifest.fixtures
        .filter((fixture) => fixture.lineCount <= 32)
        .map((fixture) => fixture.counters[counter!])
      expect(row.smallBlockFloor).toBe(nextPowerOfTwo(
        Math.max(...smallObserved),
      ))
      expect(row.absoluteStageLimit).toBe(nextPowerOfTwo(
        Math.max(...observed) * 4,
      ))
      const bases = manifest.fixtures.map((fixture) =>
        row.unit === "source-items"
          ? fixture.atomCount
          : fixture.chunkCount
      )
      expect(row.relativeNumerator).toBe(Math.max(
        1,
        ...observed.map((count, index) =>
          Math.ceil(count / Math.max(1, bases[index]!))
        ),
      ))
      expect(row.relativeDenominator).toBe(1)
    }

    const roots = new Map<number, ReturnType<
      typeof acceptedRepeatedUnifiedLayoutRootFixture5b
    >>()
    const root = (lineCount: number) => {
      const existing = roots.get(lineCount)
      if (existing != null) return existing
      const created = acceptedRepeatedUnifiedLayoutRootFixture5b(lineCount)
      roots.set(lineCount, created)
      return created
    }
    const observed = new Map<string, ReturnType<typeof observedCounters>>()
    for (const row of manifest.fixtures) {
      if (
        row.expectedPath !== "accepted-incremental"
        || observed.has(`${row.lineCount}:${row.changeFamily}`)
      ) continue
      const position = row.changeFamily.endsWith("first")
        ? 0
        : row.changeFamily.endsWith("last")
          ? row.lineCount - 1
          : Math.floor((row.lineCount - 1) / 2)
      const previous = root(row.lineCount)
      const result =
        publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
          previousRoot: previous.root,
          change: imagePaintUnifiedLayoutChange5b(previous.root, {
            inlineId: `repeat-image-${position}`,
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
        })
      expect(result.status, row.fixtureId).toBe("accepted-incremental")
      if (result.status !== "accepted-incremental") continue
      observed.set(
        `${row.lineCount}:${row.changeFamily}`,
        observedCounters(result),
      )
    }
    for (const row of manifest.fixtures) {
      if (row.expectedPath !== "accepted-incremental") continue
      expect(
        observed.get(`${row.lineCount}:${row.changeFamily}`),
        row.fixtureId,
      ).toEqual(row.counters)
    }
    const noOpFixture = manifest.fixtures.find((row) =>
      row.expectedPath === "accepted-no-op"
    )!
    const previous = root(noOpFixture.lineCount)
    const noOp = publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
      previousRoot: previous.root,
      change: noOpUnifiedLayoutChange5b(previous.root),
    })
    expect(noOp.status).toBe("accepted-no-op")
    if (noOp.status === "accepted-no-op") {
      expect({
        sourceItems: noOp.incrementalCandidateWork.flow.visitedSourceItemCount,
        selectedExactSubtreeNodes:
          noOp.incrementalCandidateWork.structuralReuseProof
            .selectedExactSubtreeNodeCount,
        copiedSceneNodes:
          noOp.incrementalCandidateWork.scene.copiedSceneNodeCount,
        replacementChunks:
          noOp.incrementalCandidateWork.scene.replacementChunkCount,
        deliveryOperations:
          noOp.incrementalCandidateWork.deliveryPlan.deliveryOperationCount,
        retainCoverNodes:
          noOp.incrementalCandidateWork.deliveryPlan.retainCoverNodeCount,
      }).toEqual(noOpFixture.counters)
    }
  }, 120_000)

  it("locks every calibrated threshold at minus-one, limit, and plus-one", () => {
    for (const row of manifest.thresholdRows) {
      for (const [attemptedWork, status] of [
        [row.limitMinusOne, "within-limit"],
        [row.limit, "within-limit"],
        [row.limitPlusOne, "limit-exceeded"],
      ] as const) {
        expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
          policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
          stage: row.stage,
          unit: row.unit,
          previousSummaryBase: row.previousSummaryBase,
          exactValidatedChangeDelta: row.exactValidatedChangeDelta,
          attemptedWork,
        }), `${row.stage}/${row.unit}/${attemptedWork}`).toMatchObject({
          status,
          effectiveLimit: row.effectiveLimit,
          attemptedWork,
        })
      }
    }
  })

  it("keeps fallback scalar-only and public completion policy-owned", () => {
    const previousResult =
      publicCore.createVNextTextBlockUnifiedLayoutRootV2(
        unifiedLayoutRootBuildInputFixtureV2(),
      )
    if (previousResult.status !== "accepted") throw new Error("Root blocked")
    const change = noOpUnifiedLayoutChange5b(previousResult.root)
    const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previousResult.root,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
    })
    if (bound.status !== "accepted") throw new Error("change binding blocked")
    const fallback =
      createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
        previousRoot: previousResult.root,
        change,
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
        mode: "deterministic-work-limit-exceeded",
        reason: {
          code: "stage-unit-limit-exceeded",
          stage: "source-flow",
          unit: "source-items",
          effectiveLimit: 4,
          attemptedWork: 5,
        },
        skippedOrFailedStage: "source-flow",
        incrementalCandidateWork: bound.incrementalCandidateWork,
      })
    if (fallback.status !== "fallback-required") {
      throw new Error("fallback request blocked")
    }
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutFallbackRequestV1(
      fallback.fallbackRequest,
    )).toMatchObject({ status: "valid" })
    expect(publicCore.inspectVNextTextBlockUnifiedLayoutFallbackRequestV1(
      structuredClone(fallback.fallbackRequest),
    )).toMatchObject({
      status: "invalid",
      code: "fallback-request-authority-mismatch",
    })
    expect(reaches(fallback, previousResult.root)).toBe(false)

    const completed =
      publicCore.completeVNextTextBlockUnifiedLayoutRootFallbackV1({
        request: fallback.fallbackRequest,
        completeMaterial: unifiedLayoutRootBuildInputFixtureV2(),
      })
    expect(completed.status, JSON.stringify(completed.issues))
      .toBe("accepted-complete-fallback")
  })

  it("passes deterministic wrapper and scene lifetime reachability gates", () => {
    const previous = acceptedRepeatedUnifiedLayoutRootFixture5b(9)
    const incremental =
      publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
        previousRoot: previous.root,
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          inlineId: "repeat-image-4",
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
      })
    if (incremental.status !== "accepted-incremental") {
      throw new Error(JSON.stringify(incremental.issues))
    }
    expect(incremental.root).not.toBe(previous.root)
    expect(incremental.persistentScene).not.toBe(previous.persistentScene)
    expect(reaches(incremental.root, previous.root)).toBe(false)
    expect(reaches(
      incremental.persistentScene,
      previous.persistentScene,
    )).toBe(false)
    const previousSceneObjects = collectReachableObjects(
      previous.persistentScene.root,
    )
    const nextSceneObjects = collectReachableObjects(
      incremental.persistentScene.root,
    )
    const retainedObjects = [...previousSceneObjects].filter((value) =>
      value !== previous.persistentScene.root
      && nextSceneObjects.has(value)
    )
    expect(retainedObjects.length).toBeGreaterThan(0)
    expect(retainedObjects.every((value) =>
      reaches(incremental.persistentScene.root, value)
    )).toBe(true)

    const noOp = publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
      previousRoot: previous.root,
      change: noOpUnifiedLayoutChange5b(previous.root),
    })
    expect(noOp.status).toBe("accepted-no-op")
    if (noOp.status === "accepted-no-op") {
      expect(noOp.root).toBe(previous.root)
      expect(noOp.persistentScene).toBe(previous.persistentScene)
    }
    expect(Object.keys(publicCore).filter((name) =>
      /UnifiedLayout.*(?:Registry|History|Collect|List)/u.test(name)
    )).toEqual([])
    expect(manifest.ownershipMap).toMatchObject({
      rootV2Authority: "Core",
      persistentSceneV2Authority: "Core",
      fallbackSelection: "Core",
      editorApply: "out-of-scope",
      backendPersistence: "out-of-scope",
    })
  })
})
