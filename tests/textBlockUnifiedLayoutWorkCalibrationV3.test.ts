import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import * as workPolicyInternals from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2,
  deriveVNextTextBlockWorkPolicyCalibrationInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  type VNextTextBlockWorkCalibrationObservationInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2,
} from "../src/layout/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.js"
import type {
  VNextTextBlockStageWorkCountV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"
import {
  acceptedRepeatedUnifiedLayoutRootFixture5b,
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  ROOT_V2_TEST_WORK_POLICY,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"

const lockedRows = [
  ["source-flow", "source-items"],
  ["source-flow", "source-lookup-nodes"],
  ["source-flow", "source-path-copy-nodes"],
  ["source-flow", "source-leaf-items"],
  ["structural-reuse-proof", "selected-exact-subtree-nodes"],
  ["structural-reuse-proof", "line-tree-lookup-nodes"],
  ["scene", "line-tree-lookup-nodes"],
  ["scene", "copied-scene-nodes"],
  ["scene", "replacement-chunks"],
  ["scene", "scene-tree-lookup-nodes"],
  ["delivery-plan", "delivery-operations"],
  ["delivery-plan", "retain-cover-nodes"],
  ["delivery-plan", "scene-tree-lookup-nodes"],
] as const

const expectedFixtureIds = [
  "5b1-v3-empty-structural",
  "5b1-v3-1-first",
  "5b1-v3-8-first",
  "5b1-v3-8-middle",
  "5b1-v3-8-last",
  "5b1-v3-9-middle",
  "5b1-v3-64-first",
  "5b1-v3-65-middle",
  "5b1-v3-128-last",
  "5b1-v3-128-no-op",
  "5b1-v3-128-exclusion-inactive",
] as const

const rootsByLineCount = new Map<
  number,
  ReturnType<typeof acceptedRepeatedUnifiedLayoutRootFixture5b>
>()

function repeatedRoot(lineCount: number) {
  const existing = rootsByLineCount.get(lineCount)
  if (existing != null) return existing
  const created = acceptedRepeatedUnifiedLayoutRootFixture5b(lineCount)
  rootsByLineCount.set(lineCount, created)
  return created
}

function facts(
  result: Extract<
    ReturnType<typeof attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1>,
    { status: "accepted-incremental" | "accepted-no-op" }
  >,
): readonly VNextTextBlockStageWorkCountV1[] {
  const work = result.incrementalCandidateWork
  return [
    { stage: "source-flow", unit: "source-items", count: work.flow.visitedSourceItemCount },
    { stage: "source-flow", unit: "source-lookup-nodes", count: work.flow.visitedSourceLookupNodeCount },
    { stage: "source-flow", unit: "source-path-copy-nodes", count: work.flow.copiedSourcePathNodeCount },
    { stage: "source-flow", unit: "source-leaf-items", count: work.flow.visitedChangedSourceLeafItemCount },
    { stage: "structural-reuse-proof", unit: "selected-exact-subtree-nodes", count: work.structuralReuseProof.selectedExactSubtreeNodeCount },
    { stage: "structural-reuse-proof", unit: "line-tree-lookup-nodes", count: work.structuralReuseProof.visitedLineTreeNodeCount },
    { stage: "scene", unit: "line-tree-lookup-nodes", count: work.scene.visitedLineTreeNodeCount },
    { stage: "scene", unit: "copied-scene-nodes", count: work.scene.copiedSceneNodeCount },
    { stage: "scene", unit: "replacement-chunks", count: work.scene.replacementChunkCount },
    { stage: "scene", unit: "scene-tree-lookup-nodes", count: work.scene.visitedSceneTreeNodeCount },
    { stage: "delivery-plan", unit: "delivery-operations", count: work.deliveryPlan.deliveryOperationCount },
    { stage: "delivery-plan", unit: "retain-cover-nodes", count: work.deliveryPlan.retainCoverNodeCount },
    { stage: "delivery-plan", unit: "scene-tree-lookup-nodes", count: work.deliveryPlan.visitedSceneTreeNodeCount },
  ]
}

function observation(input: {
  readonly fixtureId: string
  readonly lineCount: number
  readonly ordinal?: number
  readonly kind?: "paint" | "no-op" | "structural-calibration" | "inactive-reference"
}): VNextTextBlockWorkCalibrationObservationInternalV1 {
  const kind = input.kind ?? "paint"
  if (kind === "structural-calibration" || kind === "inactive-reference") {
    return {
      fixtureId: input.fixtureId,
      capabilityStatus: kind,
      transitionExecuted: false,
      previousSourceItemCount: kind === "structural-calibration" ? 0 : 384,
      previousLineCount: input.lineCount,
      previousChunkCount: input.lineCount,
      factualCounts: lockedRows.map(([stage, unit]) => ({ stage, unit, count: 0 })),
    }
  }
  const previous = repeatedRoot(input.lineCount)
  const result = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
    previousRoot: previous.root,
    change: kind === "no-op"
      ? noOpUnifiedLayoutChange5b(previous.root)
      : imagePaintUnifiedLayoutChange5b(previous.root, {
          inlineId: `repeat-image-${input.ordinal ?? 0}`,
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
    workPolicy: ROOT_V2_TEST_WORK_POLICY,
  })
  expect(["accepted-incremental", "accepted-no-op"]).toContain(result.status)
  if (result.status !== "accepted-incremental" && result.status !== "accepted-no-op") {
    throw new Error(`calibration transition blocked: ${JSON.stringify(result.issues)}`)
  }
  return {
    fixtureId: input.fixtureId,
    capabilityStatus: "active",
    transitionExecuted: true,
    previousSourceItemCount: previous.root.sourceState.summary.itemCount,
    previousLineCount: previous.root.lineTree.summary.lineCount,
    previousChunkCount: previous.root.persistentScene.summary.chunkCount,
    factualCounts: facts(result),
  }
}

function collect(): readonly VNextTextBlockWorkCalibrationObservationInternalV1[] {
  return [
    observation({ fixtureId: expectedFixtureIds[0], lineCount: 0, kind: "structural-calibration" }),
    observation({ fixtureId: expectedFixtureIds[1], lineCount: 1, ordinal: 0 }),
    observation({ fixtureId: expectedFixtureIds[2], lineCount: 8, ordinal: 0 }),
    observation({ fixtureId: expectedFixtureIds[3], lineCount: 8, ordinal: 4 }),
    observation({ fixtureId: expectedFixtureIds[4], lineCount: 8, ordinal: 7 }),
    observation({ fixtureId: expectedFixtureIds[5], lineCount: 9, ordinal: 4 }),
    observation({ fixtureId: expectedFixtureIds[6], lineCount: 64, ordinal: 0 }),
    observation({ fixtureId: expectedFixtureIds[7], lineCount: 65, ordinal: 32 }),
    observation({ fixtureId: expectedFixtureIds[8], lineCount: 128, ordinal: 127 }),
    observation({ fixtureId: expectedFixtureIds[9], lineCount: 128, kind: "no-op" }),
    observation({ fixtureId: expectedFixtureIds[10], lineCount: 128, kind: "inactive-reference" }),
  ]
}

function sourceEnvelopeEvaluation(input: unknown): unknown {
  const evaluate = (workPolicyInternals as unknown as {
    readonly evaluateVNextTextBlockSourceWorkEnvelopeInternalV1?:
      (value: unknown) => unknown
  }).evaluateVNextTextBlockSourceWorkEnvelopeInternalV1
  return evaluate?.(input) ?? null
}

describe("Phase 5B-1 private V3 factual work calibration", () => {
  const observations = collect()
  const calibration = deriveVNextTextBlockWorkPolicyCalibrationInternalV1(observations)
  const checkedInEvidence = {
    source: "flowdoc-live-draft-unified-incremental-root-5b-work-calibration",
    calibrationRevision: 3,
    formulaVersion: calibration.formulaVersion,
    fixtureIds: calibration.fixtureIds,
    observations: observations.map((item) => ({
      fixtureId: item.fixtureId,
      capabilityStatus: item.capabilityStatus,
      transitionExecuted: item.transitionExecuted,
      previousSummaryBases: [
        item.previousSourceItemCount,
        item.previousLineCount,
        item.previousChunkCount,
      ],
      factualCounts: item.factualCounts.map((fact) => fact.count),
    })),
    lockedRows: calibration.lockedRows.map((row) => ({
      stage: row.stage,
      unit: row.unit,
      smallBlockFloor: row.smallBlockFloor,
      absoluteStageLimit: row.absoluteStageLimit,
      relativeNumerator: row.relativeNumerator,
      relativeDenominator: row.relativeDenominator,
      maximumObservedWork: row.maximumObservedWork,
      maximumSmallBlockObservedWork: row.maximumSmallBlockObservedWork,
      thresholdPreviousSummaryBase: row.thresholdPreviousSummaryBase,
      effectiveLimit: row.effectiveLimit,
      limitMinusOne: row.limitMinusOne,
      limit: row.limit,
      limitPlusOne: row.limitPlusOne,
    })),
    inactiveRows: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages
      .filter((row) => row.lockStatus === "inactive")
      .map((row) => ({ stage: row.stage, unit: row.unit })),
    candidatePolicyId:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.policyId,
    candidatePolicyFingerprint:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint,
  }

  it("derives 13 finite locked rows from the closed fixture matrix", () => {
    expect(calibration.fixtureIds).toEqual(expectedFixtureIds)
    expect(calibration.formulaVersion).toBe("5b-1-v3-calibration-v1")
    expect(calibration.lockedRows).toHaveLength(13)
    expect(calibration.lockedRows.map((row) => [row.stage, row.unit]))
      .toEqual(lockedRows)
    expect(calibration.lockedRows.every((row) => [
      row.smallBlockFloor,
      row.absoluteStageLimit,
      row.relativeNumerator,
    ].every((value) => Number.isSafeInteger(value) && value > 0))).toBe(true)
  })

  it("activates the reviewed 21-row V3 policy without changing calibration", () => {
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.policyId)
      .toBe("5b-1-v3")
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages)
      .toHaveLength(21)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages.filter(
      (row) => row.lockStatus === "locked",
    )).toHaveLength(13)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages.filter(
      (row) => row.lockStatus === "inactive",
    )).toHaveLength(8)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages.filter(
      (row) => row.lockStatus === "locked",
    ).map((row) => ({
      stage: row.stage,
      unit: row.unit,
      smallBlockFloor: row.smallBlockFloor,
      absoluteStageLimit: row.absoluteStageLimit,
      relativeNumerator: row.relativeNumerator,
    }))).toEqual(calibration.lockedRows.map((row) => ({
      stage: row.stage,
      unit: row.unit,
      smallBlockFloor: row.smallBlockFloor,
      absoluteStageLimit: row.absoluteStageLimit,
      relativeNumerator: row.relativeNumerator,
    })))
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.policyId).toBe("5b-1-v3")
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint).toBe(
      "sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982",
    )

    const previous = repeatedRoot(1)
    const accepted = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: noOpUnifiedLayoutChange5b(previous.root),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })
    expect(accepted.status).toBe("accepted-no-op")
  })

  it("keeps the 5B2 evidence calibration policy internal and finitely bounded", () => {
    const policy =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2
    expect(policy.stages).toHaveLength(36)
    expect(policy.stages.filter((row) =>
      row.stage === "spatial-index" && row.lockStatus === "inactive"
    )).toHaveLength(2)
    const evidenceRows = policy.stages.filter((row) => row.stage === "evidence")
    expect(evidenceRows.map((row) => row.unit)).toEqual(
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
        .map((row) => row.unit),
    )
    expect(evidenceRows).toHaveLength(15)
    expect(evidenceRows.every((row) =>
      row.lockStatus === "locked"
      && row.smallBlockFloor === 8_192
      && row.absoluteStageLimit === 8_192
      && row.relativeNumerator === 0
      && row.relativeDenominator === 1
    )).toBe(true)
  })

  it("proves minus-one/equal/plus-one for every derived locked row", () => {
    for (const row of calibration.lockedRows) {
      for (const [offset, status] of [[-1, "within-limit"], [0, "within-limit"], [1, "limit-exceeded"]] as const) {
        expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
          policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
          stage: row.stage,
          unit: row.unit,
          previousSummaryBase: row.thresholdPreviousSummaryBase,
          exactValidatedChangeDelta: 1,
          attemptedWork: row.effectiveLimit + offset,
        }).status).toBe(status)
      }
    }
    expect(JSON.stringify(calibration)).not.toMatch(/clock|duration|payloadByte/i)
  })

  it("aggregates exact V3 Source, Line, Scene, and Delivery owner work", () => {
    const source = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 9,
      includeImages: true,
    })
    const previous = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: source.initialFlow,
      evidence: source.evidence,
      spatialEntries: source.spatialEntries,
    }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3)
    if (previous.status !== "accepted") throw new Error("V3 Root blocked")
    const result = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: imagePaintUnifiedLayoutChange5b(previous.root, {
        inlineId: "repeat-image-4",
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      }),
      workPolicy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })
    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-incremental")
    if (result.status !== "accepted-incremental") return
    expect(result.incrementalCandidateWork.stageWork).toHaveLength(21)
    for (const fact of facts(result)) {
      expect(result.incrementalCandidateWork.stageWork.find((row) =>
        row.stage === fact.stage && row.unit === fact.unit
      )).toEqual(fact)
    }
    expect(result.incrementalCandidateWork).toMatchObject({
      structuralReuseProof: {
        visitedLineTreeNodeCount: expect.any(Number),
        selectedExactSubtreeNodeCount: expect.any(Number),
      },
      scene: {
        visitedLineTreeNodeCount: expect.any(Number),
        visitedSceneTreeNodeCount: expect.any(Number),
        copiedSceneNodeCount: expect.any(Number),
        replacementChunkCount: 1,
      },
      deliveryPlan: {
        visitedSceneTreeNodeCount: expect.any(Number),
        deliveryOperationCount: 3,
        retainCoverNodeCount: expect.any(Number),
      },
      rootWrapperAllocationCount: 1,
    })
  }, 30_000)

  it("evaluates empty, leaf, and maximum-height V3 source envelopes", () => {
    const policy =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3
    expect(sourceEnvelopeEvaluation({
      policy,
      sourceItemCount: 0,
      treeHeight: 0,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })).toEqual({
      status: "accepted",
      effectiveLimits: [
        { unit: "source-items", attemptedWork: 1, effectiveLimit: 1 },
        { unit: "source-lookup-nodes", attemptedWork: 0, effectiveLimit: 2 },
        { unit: "source-path-copy-nodes", attemptedWork: 0, effectiveLimit: 2 },
        { unit: "source-leaf-items", attemptedWork: 8, effectiveLimit: 8 },
      ],
    })
    expect(sourceEnvelopeEvaluation({
      policy,
      sourceItemCount: 1,
      treeHeight: 1,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })).toMatchObject({ status: "accepted" })
    expect(sourceEnvelopeEvaluation({
      policy,
      sourceItemCount: 15,
      treeHeight: 16,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })).toMatchObject({ status: "accepted" })
    expect(sourceEnvelopeEvaluation({
      policy,
      sourceItemCount: 16,
      treeHeight: 17,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })).toEqual({
      status: "rejected",
      unit: "source-lookup-nodes",
      attemptedWork: 17,
      effectiveLimit: 16,
    })
  })

  it("fails closed on source fact thresholds and foreign policy authority", () => {
    const policy =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3
    const sourceFacts = {
      policy,
      sourceItemCount: 0,
      treeHeight: 0,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    }
    expect(sourceEnvelopeEvaluation({
      ...sourceFacts,
      deliberateItemResolutionCount: 2,
    })).toEqual({
      status: "rejected",
      unit: "source-items",
      attemptedWork: 2,
      effectiveLimit: 1,
    })
    expect(sourceEnvelopeEvaluation({
      ...sourceFacts,
      maximumLeafOccupancy: 9,
    })).toEqual({
      status: "rejected",
      unit: "source-leaf-items",
      attemptedWork: 9,
      effectiveLimit: 8,
    })
    expect(sourceEnvelopeEvaluation({
      ...sourceFacts,
      policy: structuredClone(policy),
    })).toEqual({ status: "invalid-policy" })
    for (const unsafe of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(sourceEnvelopeEvaluation({
        ...sourceFacts,
        treeHeight: unsafe,
      })).toEqual({ status: "invalid-policy" })
    }

    const pathRow = policy.stages.find((row) =>
      row.stage === "source-flow" && row.unit === "source-path-copy-nodes"
    )
    if (pathRow == null) throw new Error("V3 source path-copy row missing")
    for (const [attemptedWork, status] of [
      [1, "within-limit"],
      [2, "within-limit"],
      [3, "limit-exceeded"],
    ] as const) {
      expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy,
        stage: pathRow.stage,
        unit: pathRow.unit,
        previousSummaryBase: 0,
        exactValidatedChangeDelta: 1,
        attemptedWork,
      })).toEqual({ status, effectiveLimit: 2, attemptedWork })
    }
  })

  it("prints canonical evidence only under the task-specific report switch", () => {
    if (process.env.FLOWDOC_5B1_V3_CALIBRATION_REPORT === "1") {
      console.log("FLOWDOC_5B1_V3_CALIBRATION", JSON.stringify({
        observations,
        calibration,
        candidate: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
      }))
    }
    expect(true).toBe(true)
  })

  it("matches the checked-in calibration evidence byte for byte", () => {
    const expected = `${JSON.stringify(checkedInEvidence, null, 2)}\n`
    const actual = readFileSync(new URL(
      "../fixtures/live-draft-unified-incremental-root-5b-work-calibration.v3.json",
      import.meta.url,
    ), "utf8")
    expect(actual).toBe(expected)
  })
})

describe("Phase 5B-2A authority evidence calibration", () => {
  it("derives every evidence threshold from the reviewed owner registry", () => {
    const registry =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
    const policy =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2

    expect(policy.stages).toHaveLength(
      registry.length + VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages.length,
    )
    for (const row of registry) {
      const calibration =
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          [row.unit]: 3,
        })
      const evaluate = (attemptedWork: number) =>
        evaluateVNextTextBlockStageWorkLimitInternalV1({
          policy: calibration,
          stage: row.stage,
          unit: row.unit,
          previousSummaryBase: 99,
          exactValidatedChangeDelta: 1,
          attemptedWork,
        })

      expect(evaluate(2).status).toBe("within-limit")
      expect(evaluate(3).status).toBe("within-limit")
      expect(evaluate(4)).toMatchObject({
        status: "limit-exceeded",
        attemptedWork: 4,
        effectiveLimit: 3,
      })
    }
  })

  it("recognizes only factory-registered calibration policies", () => {
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})

    expect(isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(policy)).toBe(true)
    expect(isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(
      structuredClone(policy),
    )).toBe(false)
  })

  it("rejects unknown, negative, and unsafe evidence limits", () => {
    expect(() =>
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "unknown-evidence-unit": 1,
      } as never)
    ).toThrow(TypeError)
    expect(() =>
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-glyphs": -1,
      })
    ).toThrow(RangeError)
    expect(() =>
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-glyphs": Number.MAX_SAFE_INTEGER + 1,
      })
    ).toThrow(RangeError)
  })

  it("captures a changing own accessor once before calibration construction", () => {
    let readCount = 0
    const limits = {} as {
      readonly "evidence-glyphs"?: number
    }
    Object.defineProperty(limits, "evidence-glyphs", {
      enumerable: true,
      get: () => {
        readCount += 1
        return readCount === 1 ? 3 : -1
      },
    })

    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(
        limits,
      )
    const glyphs = policy.stages.find((row) =>
      row.stage === "evidence" && row.unit === "evidence-glyphs"
    )

    expect(readCount).toBe(1)
    expect(glyphs).toMatchObject({
      smallBlockFloor: 3,
      absoluteStageLimit: 3,
      relativeNumerator: 0,
      relativeDenominator: 1,
    })
  })

  it("ignores inherited evidence limits and retains the default", () => {
    const limits = Object.create({ "evidence-glyphs": 3 }) as Record<
      string,
      number
    >
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(
        limits,
      )
    const glyphs = policy.stages.find((row) =>
      row.stage === "evidence" && row.unit === "evidence-glyphs"
    )

    expect(glyphs).toMatchObject({
      smallBlockFloor: 8_192,
      absoluteStageLimit: 8_192,
    })
  })

  it("enforces an exact zero limit without changing unspecified defaults", () => {
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-glyphs": 0,
      })
    const evaluate = (unit: "evidence-glyphs" | "evidence-breaks", attemptedWork: number) =>
      evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy,
        stage: "evidence",
        unit,
        previousSummaryBase: 99,
        exactValidatedChangeDelta: 1,
        attemptedWork,
      })

    expect(evaluate("evidence-glyphs", 0)).toMatchObject({
      status: "within-limit",
      effectiveLimit: 0,
    })
    expect(evaluate("evidence-glyphs", 1)).toMatchObject({
      status: "limit-exceeded",
      effectiveLimit: 0,
    })
    expect(evaluate("evidence-breaks", 8_192)).toMatchObject({
      status: "within-limit",
      effectiveLimit: 8_192,
    })
  })
})
