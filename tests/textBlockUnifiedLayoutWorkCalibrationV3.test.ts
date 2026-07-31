import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  deriveVNextTextBlockWorkPolicyCalibrationInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
  type VNextTextBlockWorkCalibrationObservationInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
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
    inactiveRows: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.stages
      .filter((row) => row.lockStatus === "inactive")
      .map((row) => ({ stage: row.stage, unit: row.unit })),
    candidatePolicyId:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.policyId,
    candidatePolicyFingerprint:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.fingerprint,
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

  it("freezes a private 21-row candidate while V2 remains active", () => {
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.policyId)
      .toBe("5b-1-v3")
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.stages)
      .toHaveLength(21)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.stages.filter(
      (row) => row.lockStatus === "locked",
    )).toHaveLength(13)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.stages.filter(
      (row) => row.lockStatus === "inactive",
    )).toHaveLength(8)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL.stages.filter(
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
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.policyId).toBe("5b-1-v2")

    const previous = repeatedRoot(1)
    const rejected = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: noOpUnifiedLayoutChange5b(previous.root),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
    })
    expect(rejected).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-work-policy" }],
    })
  })

  it("proves minus-one/equal/plus-one for every derived locked row", () => {
    for (const row of calibration.lockedRows) {
      for (const [offset, status] of [[-1, "within-limit"], [0, "within-limit"], [1, "limit-exceeded"]] as const) {
        expect(evaluateVNextTextBlockStageWorkLimitInternalV1({
          policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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

  it("prints canonical evidence only under the task-specific report switch", () => {
    if (process.env.FLOWDOC_5B1_V3_CALIBRATION_REPORT === "1") {
      console.log("FLOWDOC_5B1_V3_CALIBRATION", JSON.stringify({
        observations,
        calibration,
        candidate: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
