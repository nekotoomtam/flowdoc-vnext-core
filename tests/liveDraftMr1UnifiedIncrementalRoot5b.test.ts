import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import {
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutFallbackV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  evaluateNextVNextTextBlockStageVisitInternalV1,
  setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
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
  readonly capabilityStatus: string
  readonly transitionExecuted: boolean
  readonly expectedPath: string
  readonly counters: {
    readonly sourceItems: number
    readonly selectedExactSubtreeNodes: number
    readonly copiedSceneNodes: number
    readonly replacementChunks: number
    readonly deliveryOperations: number
    readonly retainCoverNodes: number
  }
  readonly observations: {
    readonly estimatedCanonicalPayloadByteCount: number
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
  readonly manifestVersion: number
  readonly checkpoint: string
  readonly runtimeContractVersions: {
    readonly rootV2: number
    readonly persistentSceneV2: number
    readonly transitionV1: number
    readonly sceneDeliveryV2: number
  }
  readonly fixtureCalibrationRevision: number
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
    readonly activationStatus: string
    readonly calibrationFile: string
    readonly calibrationFileSha256: string
    readonly formulaVersion: string
    readonly calibration: {
      readonly clockOrDurationFieldCount: number
    }
    readonly lockedStageLimits: readonly ManifestStageLimit[]
    readonly inactiveUnits: readonly string[]
    readonly inactiveUnitExceptions: readonly string[]
  }
  readonly fixtures: readonly ManifestCounterRow[]
  readonly thresholdRows: readonly ManifestThreshold[]
  readonly capabilities: Record<string, boolean>
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

const explicitlyPrivatePublicNames = [
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1",
  "VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2",
  "createVNextTextBlockPersistentSceneCompleteInternalV2",
  "createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2",
  "createVNextTextBlockIncrementalFlowTreeWithForcedCollisionForTestInternalV1",
  "createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1",
  "createVNextTextBlockSceneDeliveryPlanCandidateInternalV2",
  "verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2",
  "deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1",
  "createVNextTextBlockUnifiedLayoutRootCompleteInternalV2",
  "prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2",
  "setVNextTextBlockUnifiedLayoutCompleteKernelObserverForTestInternalV2",
  "attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1",
  "evaluateVNextTextBlockStageWorkLimitInternalV1",
  "registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2",
  "setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1",
  "createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2",
] as const

function privatePublicExportNames(names: readonly string[]): readonly string[] {
  const explicitlyPrivate = new Set<string>(explicitlyPrivatePublicNames)
  return names.filter((name) =>
    explicitlyPrivate.has(name) || /Internal|ForTest/u.test(name)
  )
}

function manifestPayloadLocationViolations(
  value: Manifest5b1,
): readonly string[] {
  const violations: string[] = []
  const allowedKey = "estimatedCanonicalPayloadByteCount"
  for (const [index, fixture] of value.fixtures.entries()) {
    const entries = Object.entries(fixture.observations)
    if (
      entries.length !== 1
      || entries[0]?.[0] !== allowedKey
      || !Number.isSafeInteger(entries[0][1])
      || (entries[0][1] as number) < 0
    ) {
      violations.push(`fixtures[${index}].observations`)
    }
  }

  const withoutFixtureObservations = structuredClone(value) as unknown as {
    readonly fixtures: Array<Record<string, unknown>>
    readonly invariants: Record<string, unknown>
    readonly ownershipMap: Record<string, unknown>
  }
  for (const fixture of withoutFixtureObservations.fixtures) {
    delete fixture.observations
  }
  delete withoutFixtureObservations.invariants
    .payloadSizeMaySelectExecutionPath
  delete withoutFixtureObservations.ownershipMap.payloadSizing
  if (/payload/iu.test(JSON.stringify(withoutFixtureObservations))) {
    violations.push("outside-fixture-observations")
  }
  return violations
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
    expect(publicCore).not.toHaveProperty(
      "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2",
    )
    expect(publicCore).toHaveProperty(
      "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3",
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    )
    expect(publicCore.VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID)
      .toBe("5b-1-v3")
    for (const privateName of explicitlyPrivatePublicNames) {
      expect(publicCore).not.toHaveProperty(privateName)
    }
    expect(privatePublicExportNames(Object.keys(publicCore))).toEqual([])
    expect(publicCore).not.toHaveProperty("createVNextTextBlockUnifiedLayoutRootV1")
    expect(publicCore).not.toHaveProperty("inspectVNextTextBlockUnifiedLayoutRootV1")
  })

  it("rejects unlisted Internal and ForTest public export mutations", () => {
    const mutations = [
      "registerPreparedOtherRootGraphInternalV2",
      "createOtherCollisionForTestV2",
    ]
    expect(privatePublicExportNames([
      ...Object.keys(publicCore),
      ...mutations,
    ])).toEqual(mutations)
  })

  it("uses the locked policy internally and preserves false capabilities", () => {
    const result = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    expect(result.status, JSON.stringify(result.issues)).toBe("accepted")
    if (result.status !== "accepted") return
    expect(result.root.workPolicy)
      .toBe(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3)
    expect(result.root.workPolicy.policyId).toBe("5b-1-v3")
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

  it("locks runtime/calibration versions and capability-honest fixture rows", () => {
    expect(manifest).toMatchObject({
      manifestVersion: 1,
      runtimeContractVersions: {
        rootV2: 2,
        persistentSceneV2: 2,
        transitionV1: 1,
        sceneDeliveryV2: 2,
      },
      fixtureCalibrationRevision: 3,
      policy: {
        policyId: "5b-1-v3",
        fingerprint:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint,
        activationStatus: "active-public",
        formulaVersion: "5b-1-v3-calibration-v1",
      },
    })
    const calibrationBytes = readFileSync(new URL(
      `../fixtures/${manifest.policy.calibrationFile}`,
      import.meta.url,
    ))
    expect(createHash("sha256").update(calibrationBytes).digest("hex"))
      .toBe(manifest.policy.calibrationFileSha256)
    expect(manifest.policy.lockedStageLimits).toHaveLength(13)
    expect(manifest.policy.lockedStageLimits.map((row) => ({
      stage: row.stage,
      unit: row.unit,
      smallBlockFloor: row.smallBlockFloor,
      absoluteStageLimit: row.absoluteStageLimit,
      relativeNumerator: row.relativeNumerator,
      relativeDenominator: row.relativeDenominator,
    }))).toEqual(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages
      .filter((row) => row.lockStatus === "locked")
      .map((row) => ({
        stage: row.stage,
        unit: row.unit,
        smallBlockFloor: row.smallBlockFloor,
        absoluteStageLimit: row.absoluteStageLimit,
        relativeNumerator: row.relativeNumerator,
        relativeDenominator: row.relativeDenominator,
      })))
    expect(manifestPayloadLocationViolations(manifest)).toEqual([])
    expect(manifest.thresholdRows).toContainEqual({
      stage: "structural-reuse-proof",
      unit: "selected-exact-subtree-nodes",
      previousSummaryBase: 128,
      exactValidatedChangeDelta: 1,
      effectiveLimit: 4,
      limitMinusOne: 3,
      limit: 4,
      limitPlusOne: 5,
    })
    expect(Object.fromEntries(manifest.fixtures.map((fixture) => [
      fixture.fixtureId,
      {
        capabilityStatus: fixture.capabilityStatus,
        transitionExecuted: fixture.transitionExecuted,
      },
    ]))).toEqual({
      "5b1-empty-structural": {
        capabilityStatus: "structural-calibration",
        transitionExecuted: false,
      },
      "5b1-1-line-first": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-8-line-middle": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-32-line-last": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-33-line-middle": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-128-line-first": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-image-paint-first": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-image-paint-middle": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-image-paint-last": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-128-line-no-op": {
        capabilityStatus: "active",
        transitionExecuted: true,
      },
      "5b1-128-line-exclusion": {
        capabilityStatus: "inactive-reference",
        transitionExecuted: false,
      },
    })
    expect(manifest.capabilities).toEqual({
      trueNoOpIncrementalTransition: true,
      imagePaintIncrementalTransition: true,
      emptyBlockIncrementalTransition: false,
      exclusionIncrementalTransition: false,
      textStyleIncrementalTransition: false,
      semanticOnlyIncrementalTransition: false,
      authoredBoxIncrementalTransition: false,
      fixedHeightOverflowPolicy: false,
      alternateRegisteredTreeHistoryNormalization: false,
      workerSessionProtocol: false,
      editorApply: false,
      backendPersistence: false,
      productionActivation: false,
      // Historical 5B-1 manifest only; current export absence is checked above.
      rootV1SceneV1Retirement: false,
    })
    expect(manifest.invariants).toMatchObject({
      payloadSizeMaySelectExecutionPath: false,
      completeOracleOnProductionHotPath: false,
      lifetimeProofLimitedToObjectGraphRetention: true,
    })
    expect(manifest.ownershipMap).toMatchObject({
      structuralReuseProof: "Core",
      textLayoutReconvergence: "inactive",
      payloadSizing: "observational-only",
      lifetimeProof: "object-graph-retention-only",
      completeOracle: "QA-only",
      rootV1SceneV1: "frozen-compatibility-and-QA-reference",
    })
    for (const fixture of manifest.fixtures) {
      expect(Object.keys(fixture.observations), fixture.fixtureId).toEqual([
        "estimatedCanonicalPayloadByteCount",
      ])
      expect(
        Number.isSafeInteger(
          fixture.observations.estimatedCanonicalPayloadByteCount,
        ),
        fixture.fixtureId,
      ).toBe(true)
      expect(
        fixture.observations.estimatedCanonicalPayloadByteCount,
        fixture.fixtureId,
      ).toBeGreaterThanOrEqual(0)
      if (!fixture.transitionExecuted) {
        expect(
          fixture.observations.estimatedCanonicalPayloadByteCount,
          fixture.fixtureId,
        ).toBe(0)
      }
    }
  })

  it("rejects payload facts outside exact fixture observations", () => {
    const topLevel = structuredClone(manifest) as Manifest5b1 & {
      estimatedCanonicalPayloadByteCount: number
    }
    topLevel.estimatedCanonicalPayloadByteCount = 1

    const policy = structuredClone(manifest) as Manifest5b1 & {
      policy: Manifest5b1["policy"] & {
        payloadObservationFingerprint: string
      }
    }
    policy.policy.payloadObservationFingerprint = `sha256:${"0".repeat(64)}`

    const counter = structuredClone(manifest)
    ;(counter.fixtures[0]!.counters as unknown as Record<string, unknown>)
      .estimatedCanonicalPayloadByteCount = 1

    const extraObservation = structuredClone(manifest)
    ;(extraObservation.fixtures[0]!.observations as unknown as
      Record<string, unknown>).payloadObservationFingerprint =
        `sha256:${"0".repeat(64)}`

    for (const [mutated, expectedViolation] of [
      [topLevel, "outside-fixture-observations"],
      [policy, "outside-fixture-observations"],
      [counter, "outside-fixture-observations"],
      [extraObservation, "fixtures[0].observations"],
    ] as const) {
      expect(manifestPayloadLocationViolations(mutated))
        .toContain(expectedViolation)
    }
  })

  it("keeps fixture calibration revision outside Root and Scene identity", () => {
    const before = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    expect(before.status, JSON.stringify(before.issues)).toBe("accepted")
    if (before.status !== "accepted") return

    const recalibratedManifest = structuredClone(manifest)
    ;(recalibratedManifest as { fixtureCalibrationRevision: number })
      .fixtureCalibrationRevision = 3
    expect(recalibratedManifest.fixtureCalibrationRevision).toBe(3)

    const after = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(),
    )
    expect(after.status, JSON.stringify(after.issues)).toBe("accepted")
    if (after.status !== "accepted") return
    expect(after.root.semanticFingerprint)
      .toBe(before.root.semanticFingerprint)
    expect(after.root.fingerprint).toBe(before.root.fingerprint)
    expect(before.root).not.toHaveProperty("fixtureCalibrationRevision")
    expect(before.persistentScene)
      .not.toHaveProperty("fixtureCalibrationRevision")
    expect(JSON.stringify({
      root: before.root,
      scene: before.persistentScene,
    })).not.toContain("fixtureCalibrationRevision")
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

  it("matches incremental, complete-fallback, and complete-oracle renderer facts with separate ledgers", () => {
    const previous = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "text-image-text-break",
        fit: "contain",
      }),
    )
    if (previous.status !== "accepted") throw new Error("previous Root blocked")
    const change = imagePaintUnifiedLayoutChange5b(previous.root, {
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const incremental =
      publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
        previousRoot: previous.root,
        change,
      })
    if (incremental.status !== "accepted-incremental") {
      throw new Error(`incremental blocked: ${JSON.stringify(incremental.issues)}`)
    }

    const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previous.root,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })
    if (bound.status !== "accepted") throw new Error("fallback bind blocked")
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "structural-reuse-proof",
      unit: "line-tree-lookup-nodes",
      effectiveLimit: 0,
    })
    let evaluated: ReturnType<
      typeof evaluateNextVNextTextBlockStageVisitInternalV1
    >
    try {
      evaluated = evaluateNextVNextTextBlockStageVisitInternalV1({
        validatedChange: bound.validatedChange,
        stage: "structural-reuse-proof",
        unit: "line-tree-lookup-nodes",
        completedWork: 0,
        completedCandidateWork: bound.incrementalCandidateWork,
      })
    } finally {
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
    }
    if (evaluated.status !== "limit-exceeded") {
      throw new Error("fallback evaluator authority missing")
    }
    const request = createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
      attempt: evaluated.evaluatorAuthority,
    })
    if (request.status !== "fallback-required") {
      throw new Error("fallback request blocked")
    }
    const nextOptions = {
      content: "text-image-text-break" as const,
      fit: "cover" as const,
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    }
    const fallback = publicCore.completeVNextTextBlockUnifiedLayoutRootFallbackV1({
      request: request.fallbackRequest,
      completeMaterial: unifiedLayoutRootBuildInputFixtureV2(nextOptions),
    })
    if (fallback.status !== "accepted-complete-fallback") {
      throw new Error(`complete fallback blocked: ${JSON.stringify(fallback.issues)}`)
    }
    const oracle = publicCore.createVNextTextBlockUnifiedLayoutRootV2(
      unifiedLayoutRootBuildInputFixtureV2(nextOptions),
    )
    if (oracle.status !== "accepted") throw new Error("complete oracle blocked")

    const rendererFacts = (root: typeof previous.root) => {
      const delivery =
        publicCore.createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2({
          root,
        })
      if (delivery.status !== "accepted") throw new Error("renderer delivery blocked")
      return {
        normalized: {
          chunks: delivery.delivery.chunks,
          summary: delivery.delivery.summary,
        },
        completeDeliveryWork: delivery.delivery.work,
      }
    }
    const incrementalRenderer = rendererFacts(incremental.root)
    const fallbackRenderer = rendererFacts(fallback.root)
    const oracleRenderer = rendererFacts(oracle.root)
    expect(incrementalRenderer.normalized).toEqual(oracleRenderer.normalized)
    expect(fallbackRenderer.normalized).toEqual(oracleRenderer.normalized)
    expect(incremental.root.fingerprint).not.toBe(fallback.root.fingerprint)
    expect(fallback.root.fingerprint).not.toBe(oracle.root.fingerprint)

    const ledgers = {
      incrementalCandidateWork: incremental.incrementalCandidateWork,
      completeFallbackWork: fallback.completeFallbackWork,
      completeOracleWork: {
        root: oracle.completeBuildWork,
        delivery: oracleRenderer.completeDeliveryWork,
      },
    }
    expect(Object.keys(ledgers)).toEqual([
      "incrementalCandidateWork",
      "completeFallbackWork",
      "completeOracleWork",
    ])
    expect(ledgers.incrementalCandidateWork.completeNextInputTraversalCount)
      .toBe(0)
    expect(ledgers.completeFallbackWork).toMatchObject({
      completeRootV2BuildCount: 1,
      completeSceneV2BuildCount: 1,
      completeDeliveryCount: 0,
    })
    expect(ledgers.completeOracleWork.delivery.completeDeliveryCount).toBe(1)

    const noOp = publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
      previousRoot: previous.root,
      change: noOpUnifiedLayoutChange5b(previous.root),
    })
    if (noOp.status !== "accepted-no-op") throw new Error("no-op blocked")
    expect(rendererFacts(noOp.root).normalized)
      .toEqual(rendererFacts(previous.root).normalized)
  }, 120_000)

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
        policyId: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.policyId,
        fingerprint:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint,
        calibration: { clockOrDurationFieldCount: 0 },
      },
    })
    expect(JSON.stringify(manifest)).not.toMatch(
      /elapsed|durationMs|performance\.now|Date\.now/u,
    )

    expect(manifest.policy.lockedStageLimits).toEqual(
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages
        .filter((row) => row.lockStatus === "locked")
        .map((row) => ({
          stage: row.stage,
          unit: row.unit,
          smallBlockFloor: row.smallBlockFloor,
          absoluteStageLimit: row.absoluteStageLimit,
          relativeNumerator: row.relativeNumerator,
          relativeDenominator: row.relativeDenominator,
        })),
    )

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
    const observedPayloadBytes = new Map<string, number>()
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
      observedPayloadBytes.set(
        `${row.lineCount}:${row.changeFamily}`,
        result.incrementalCandidateWork.observations
          .estimatedCanonicalPayloadByteCount,
      )
    }
    for (const row of manifest.fixtures) {
      if (row.expectedPath !== "accepted-incremental") continue
      expect(
        observed.get(`${row.lineCount}:${row.changeFamily}`),
        row.fixtureId,
      ).toEqual(row.counters)
      expect.soft(
        row.observations,
        `${row.fixtureId} payload observation`,
      ).toEqual({
        estimatedCanonicalPayloadByteCount:
          observedPayloadBytes.get(`${row.lineCount}:${row.changeFamily}`),
      })
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
      expect.soft(noOpFixture.observations).toEqual({
        estimatedCanonicalPayloadByteCount:
          noOp.incrementalCandidateWork.observations
            .estimatedCanonicalPayloadByteCount,
      })
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
          policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
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

  it("blocks fabricated fallback reasons with an empty incremental-work ledger", () => {
    const previousResult =
      publicCore.createVNextTextBlockUnifiedLayoutRootV2(
        unifiedLayoutRootBuildInputFixtureV2(),
      )
    if (previousResult.status !== "accepted") throw new Error("Root blocked")
    const fabricated =
      createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
        attempt: Object.freeze({
          previousRoot: previousResult.root,
          change: noOpUnifiedLayoutChange5b(previousResult.root),
          workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
          reason: {
            code: "stage-unit-limit-exceeded",
            stage: "source-flow",
            unit: "source-items",
            effectiveLimit: 4,
            attemptedWork: 5,
          },
        }),
      })
    expect(fabricated).toMatchObject({
      status: "blocked",
      issues: [{ code: "fallback-request-authority-mismatch" }],
    })
    const fallback = createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
      attempt: Object.freeze({}) as never,
    })
    expect(fallback.status).toBe("blocked")
    expect(reaches(fabricated, previousResult.root)).toBe(false)
    expect(reaches(fallback, previousResult.root)).toBe(false)
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
