import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import * as sourceStateInternals from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import * as transitionEvidenceInternals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1,
  getVNextTextBlockValidatedChangeAuthorityRecordInternalV1,
  hasCanonicalVNextTextBlockStageWorkInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutFallbackV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutStageUnitV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
  ROOT_V2_TEST_WORK_POLICY,
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

function v3Root(
  options: Parameters<typeof unifiedLayoutRootBuildInputFixtureV2>[0] = {
    content: "text-image-text-break",
    fit: "contain",
  },
) {
  const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2(options),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  )
  if (result.status !== "accepted") throw new Error("V3 Root fixture blocked")
  return result.root
}

function calibrationRoot() {
  const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
      fit: "contain",
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  )
  if (result.status !== "accepted") {
    throw new Error("5B2 calibration Root fixture blocked")
  }
  return result.root
}

function preBindingTestBoundaries() {
  const evidence = transitionEvidenceInternals as unknown as {
    readonly setVNextTextBlockChangeBindingAttemptObserverForTestInternalV1?:
      (observer: ((value: unknown) => void) | null) => void
    readonly setVNextTextBlockPreBindingLimitOverrideForNextAttemptForTestInternalV1?:
      (value: unknown) => void
    readonly evaluateNextVNextTextBlockPreBindingVisitInternalV1?:
      (value: unknown) => unknown
  }
  const source = sourceStateInternals as unknown as {
    readonly setVNextTextBlockPreBindingSourceReadObserverForTestInternalV1?:
      (observer: ((value: unknown) => void) | null) => void
  }
  return {
    setAttemptObserver:
      evidence.setVNextTextBlockChangeBindingAttemptObserverForTestInternalV1,
    setNextLimit:
      evidence.setVNextTextBlockPreBindingLimitOverrideForNextAttemptForTestInternalV1,
    evaluateVisit:
      evidence.evaluateNextVNextTextBlockPreBindingVisitInternalV1,
    setReadObserver:
      source.setVNextTextBlockPreBindingSourceReadObserverForTestInternalV1,
  }
}

function postBindingTestBoundaries() {
  const evidence = transitionEvidenceInternals as unknown as {
    readonly evaluateNextVNextTextBlockStageVisitInternalV1?:
      (value: unknown) => unknown
    readonly getVNextTextBlockLimitExceededAuthorityRecordInternalV1?:
      (value: unknown) => unknown
    readonly consumeVNextTextBlockLimitExceededAuthorityRecordInternalV1?:
      (value: unknown) => unknown
  }
  return {
    evaluate: evidence.evaluateNextVNextTextBlockStageVisitInternalV1,
    getRecord:
      evidence.getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
    consume:
      evidence.consumeVNextTextBlockLimitExceededAuthorityRecordInternalV1,
  }
}

function deepFreezeTestValue<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreezeTestValue(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function v3BoundImagePaint() {
  const previousRoot = v3Root()
  const change = imagePaintUnifiedLayoutChange5b(previousRoot, {
    fit: "cover",
    crop: { x: 0, y: 0, width: 0.5, height: 1 },
  })
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot,
    change,
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  })
  if (bound.status !== "accepted") throw new Error("V3 change did not bind")
  return { previousRoot, change, bound }
}

describe("Phase 5B-2 evidence work ownership", () => {
  it("validates evidence-stage candidate work against its exact authority policy", () => {
    const previousRoot = v3Root()
    const v3NoOp = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot,
      change: noOpUnifiedLayoutChange5b(previousRoot),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })
    expect(v3NoOp.status).toBe("accepted-no-op")
    if (v3NoOp.status !== "accepted-no-op") return

    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages)
      .toHaveLength(21)
    expect(v3NoOp.incrementalCandidateWork.evidence).toMatchObject({
      visitedRequestLookupNodeCount: 0,
      materializedContextAtomCount: 0,
      visitedEvidenceNodeCount: 0,
    })
    expect(hasCanonicalVNextTextBlockStageWorkInternalV1({
      work: v3NoOp.incrementalCandidateWork,
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })).toBe(true)

    const calibrationPreviousRoot = calibrationRoot()
    expect(calibrationPreviousRoot.workPolicy).toBe(
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    const calibrationWork = deepFreezeTestValue({
      ...v3NoOp.incrementalCandidateWork,
      stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
        policy:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
        factualCounts: v3NoOp.incrementalCandidateWork.stageWork,
      }),
    })
    expect(hasCanonicalVNextTextBlockStageWorkInternalV1({
      work: calibrationWork,
      policy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toBe(true)
    expect(hasCanonicalVNextTextBlockStageWorkInternalV1({
      work: calibrationWork,
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
    })).toBe(false)
  })

  it("owns each request lookup and context atom before producer evidence", () => {
    const previousRoot = calibrationRoot()
    const change = Object.freeze({
      source: "vnext-text-block-unified-layout-change-v1" as const,
      contractVersion: 1 as const,
      documentId: previousRoot.documentId,
      sectionId: previousRoot.sectionId,
      textBlockId: previousRoot.textBlockId,
      expectedPreviousRootFingerprint: previousRoot.fingerprint,
      expectedPreviousSourceFingerprint: previousRoot.sourceState.fingerprint,
      kind: "text-insertion" as const,
      atRenderedUtf16: 0,
      insertedText: "x",
      insertedSource: Object.freeze({
        lineageId: "5b2-lineage-next",
        sourceFingerprint: "5b2-source-next",
        provenanceFingerprint: "5b2-provenance-next",
      }),
      measurementStyleKey: "5b2-measurement-style-next",
      effectiveShapingStyleKey: "5b2-shaping-style-next",
    })
    const result =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot,
        change,
        workPolicy:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })
    expect(result.status, JSON.stringify(result.issues)).toBe("required")
    if (result.status !== "required") return
    expect(result.incrementalCandidateWork.evidence).toMatchObject({
      requestCount: 1,
      visitedRequestLookupNodeCount: 1,
      materializedContextAtomCount: 1,
      visitedEvidenceNodeCount: 0,
    })
    expect(hasCanonicalVNextTextBlockStageWorkInternalV1({
      work: result.incrementalCandidateWork,
      policy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toBe(true)
  })

  it("keeps calibration policy selection outside public bootstrap and attempt", () => {
    const rootInput = unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
      fit: "contain",
    })
    expect(publicCore).not.toHaveProperty(
      "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1",
    )
    expect(publicCore.createVNextTextBlockUnifiedLayoutRootV2({
      ...rootInput,
      workPolicy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    } as never).status).toBe("blocked")

    const previousRoot = v3Root()
    expect(publicCore.attemptVNextTextBlockUnifiedLayoutRootTransitionV1({
      previousRoot,
      change: noOpUnifiedLayoutChange5b(previousRoot),
      workPolicy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    } as never).status).toBe("blocked")
  })
})

function workWithStageCount(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  stage: VNextTextBlockUnifiedLayoutStageV1,
  unit: VNextTextBlockUnifiedLayoutStageUnitV1,
  count: number,
): VNextTextBlockIncrementalCandidateWorkV1 {
  const work = structuredClone(base) as unknown as {
    flow: Record<string, number>
    scene: Record<string, number>
    stageWork: { stage: string; unit: string; count: number }[]
  }
  const detailKey = `${stage}/${unit}`
  const details: Record<string, readonly [Record<string, number>, string]> = {
    "source-flow/source-items": [work.flow, "visitedSourceItemCount"],
    "source-flow/source-lookup-nodes": [
      work.flow,
      "visitedSourceLookupNodeCount",
    ],
    "source-flow/source-path-copy-nodes": [
      work.flow,
      "copiedSourcePathNodeCount",
    ],
    "source-flow/source-leaf-items": [
      work.flow,
      "visitedChangedSourceLeafItemCount",
    ],
    "scene/copied-scene-nodes": [work.scene, "copiedSceneNodeCount"],
  }
  const detail = details[detailKey]
  if (detail == null) throw new Error(`unsupported test detail ${detailKey}`)
  detail[0][detail[1]] = count
  const row = work.stageWork.find((candidate) =>
    candidate.stage === stage && candidate.unit === unit
  )
  if (row == null) throw new Error(`missing test work row ${detailKey}`)
  row.count = count
  return deepFreezeTestValue(
    work,
  ) as unknown as VNextTextBlockIncrementalCandidateWorkV1
}

const CANONICAL_V3_STAGE_ROWS = [
  "source-flow/source-items",
  "source-flow/source-lookup-nodes",
  "source-flow/source-path-copy-nodes",
  "source-flow/source-leaf-items",
  "source-flow/flow-atoms",
  "source-flow/flow-tree-nodes",
  "spatial-index/spatial-index-nodes",
  "spatial-index/spatial-query-bands",
  "structural-reuse-proof/selected-exact-subtree-nodes",
  "structural-reuse-proof/line-tree-lookup-nodes",
  "layout-reconvergence/recomputed-lines",
  "layout-reconvergence/proof-nodes",
  "geometry/reprojected-lines",
  "geometry/visited-fragments",
  "scene/line-tree-lookup-nodes",
  "scene/copied-scene-nodes",
  "scene/replacement-chunks",
  "scene/scene-tree-lookup-nodes",
  "delivery-plan/delivery-operations",
  "delivery-plan/retain-cover-nodes",
  "delivery-plan/scene-tree-lookup-nodes",
] as const

describe("Phase 5B-1 Core-derived transition evidence", () => {
  it("binds the active first, middle, and last image positions once under V3", () => {
    const boundaries = preBindingTestBoundaries()
    expect(boundaries.setAttemptObserver).toBeTypeOf("function")
    expect(boundaries.setReadObserver).toBeTypeOf("function")
    if (
      boundaries.setAttemptObserver == null
      || boundaries.setReadObserver == null
    ) return
    for (const fixture of [
      { content: "image-only" as const, inlineId: "image-1" },
      { content: "text-image-text" as const, inlineId: "image-1" },
      { content: "adjacent-images" as const, inlineId: "image-2" },
    ]) {
      const attempts: unknown[] = []
      const reads: unknown[] = []
      boundaries.setAttemptObserver((value) => attempts.push(value))
      boundaries.setReadObserver((value) => reads.push(value))
      try {
        const previousRoot = v3Root({
          content: fixture.content,
          fit: "contain",
        })
        const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
          previousRoot,
          change: imagePaintUnifiedLayoutChange5b(previousRoot, {
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
            inlineId: fixture.inlineId,
          }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
        })
        expect(bound.status, fixture.content).toBe("accepted")
        expect(reads, fixture.content).toEqual([
          { unit: "source-lookup-nodes", completedWork: 1 },
          { unit: "source-items", completedWork: 1 },
        ])
        expect(attempts.map((value) =>
          (value as { event?: unknown }).event
        ), fixture.content).toEqual(["created", "consumed"])
      } finally {
        boundaries.setAttemptObserver(null)
        boundaries.setReadObserver(null)
      }
    }
  })

  it("consumes one exact V3 binding attempt into validated-change authority", () => {
    const boundaries = preBindingTestBoundaries()
    expect(boundaries.setAttemptObserver).toBeTypeOf("function")
    expect(boundaries.evaluateVisit).toBeTypeOf("function")
    expect(boundaries.setReadObserver).toBeTypeOf("function")
    if (
      boundaries.setAttemptObserver == null
      || boundaries.evaluateVisit == null
      || boundaries.setReadObserver == null
    ) return
    const attempts: unknown[] = []
    const reads: unknown[] = []
    boundaries.setAttemptObserver((value) => attempts.push(value))
    boundaries.setReadObserver((value) => reads.push(value))
    try {
      const previousRoot = v3Root()
      const change = imagePaintUnifiedLayoutChange5b(previousRoot, {
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      })
      const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
        previousRoot,
        change,
        workPolicy:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
      })
      expect(bound.status).toBe("accepted")
      if (bound.status !== "accepted") return
      expect(bound.incrementalCandidateWork.flow).toMatchObject({
        visitedSourceLookupNodeCount: 1,
        visitedSourceItemCount: 1,
      })
      expect(reads).toEqual([
        { unit: "source-lookup-nodes", completedWork: 1 },
        { unit: "source-items", completedWork: 1 },
      ])
      expect(attempts).toEqual([
        expect.objectContaining({ event: "created" }),
        expect.objectContaining({ event: "consumed" }),
      ])
      expect((attempts[0] as { authority?: unknown }).authority)
        .toBe((attempts[1] as { authority?: unknown }).authority)
      const consumedAuthority =
        (attempts[0] as { authority?: unknown }).authority
      expect(getVNextTextBlockValidatedChangeAuthorityRecordInternalV1(
        consumedAuthority as never,
      )).toBeNull()
      expect(boundaries.evaluateVisit({
        attemptAuthority: consumedAuthority,
        unit: "source-lookup-nodes",
        completedWork: 1,
      })).toMatchObject({ status: "invariant-blocked" })
      expect(boundaries.evaluateVisit({
        attemptAuthority: structuredClone(consumedAuthority),
        unit: "source-lookup-nodes",
        completedWork: 0,
      })).toMatchObject({ status: "invariant-blocked" })
      expect(createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
        attempt: consumedAuthority as never,
      })).toMatchObject({
        status: "blocked",
        issues: [{ code: "fallback-request-authority-mismatch" }],
      })

      const countBeforeInvalidRoot = attempts.length
      expect(bindVNextTextBlockUnifiedLayoutChangeInternalV1({
        previousRoot: structuredClone(previousRoot),
        change,
        workPolicy:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
      })).toMatchObject({
        status: "blocked",
        issues: [{ code: "previous-root-authority-mismatch" }],
      })
      expect(attempts).toHaveLength(countBeforeInvalidRoot)

      for (const invalid of [
        {
          previousRoot,
          change: Object.freeze({ ...change, textBlockId: "wrong-block" }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
        },
        {
          previousRoot,
          change: Object.freeze({
            ...change,
            expectedPreviousRootFingerprint: `sha256:${"0".repeat(64)}`,
          }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
        },
        {
          previousRoot,
          change,
          workPolicy: structuredClone(ROOT_V2_TEST_WORK_POLICY),
        },
      ]) {
        expect(bindVNextTextBlockUnifiedLayoutChangeInternalV1(
          invalid,
        ).status).toBe("blocked")
        expect(attempts).toHaveLength(countBeforeInvalidRoot)
      }
    } finally {
      boundaries.setAttemptObserver(null)
      boundaries.setReadObserver(null)
    }
  })

  it("checks V3 source budgets before node and item reads", () => {
    const boundaries = preBindingTestBoundaries()
    expect(boundaries.setAttemptObserver).toBeTypeOf("function")
    expect(boundaries.setNextLimit).toBeTypeOf("function")
    expect(boundaries.setReadObserver).toBeTypeOf("function")
    if (
      boundaries.setAttemptObserver == null
      || boundaries.setNextLimit == null
      || boundaries.setReadObserver == null
    ) return

    for (const row of [
      {
        unit: "source-lookup-nodes" as const,
        effectiveLimit: 0,
        expectedReads: [],
      },
      {
        unit: "source-items" as const,
        effectiveLimit: 0,
        expectedReads: [
          { unit: "source-lookup-nodes", completedWork: 1 },
        ],
      },
    ]) {
      const attempts: unknown[] = []
      const reads: unknown[] = []
      boundaries.setAttemptObserver((value) => attempts.push(value))
      boundaries.setReadObserver((value) => reads.push(value))
      boundaries.setNextLimit({
        unit: row.unit,
        effectiveLimit: row.effectiveLimit,
      })
      try {
        const previousRoot = v3Root()
        const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
          previousRoot,
          change: imagePaintUnifiedLayoutChange5b(previousRoot, {
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
        })
        expect(bound).toMatchObject({
          status: "blocked",
          stage: "source-flow",
          incrementalCandidateWork: {
            flow: {
              visitedSourceLookupNodeCount:
                row.unit === "source-lookup-nodes" ? 0 : 1,
              visitedSourceItemCount: 0,
            },
          },
          issues: [{
            code: "previous-root-authority-mismatch",
            stage: "source-flow",
          }],
        })
        expect(reads).toEqual(row.expectedReads)
        expect(attempts.map((value) =>
          (value as { event?: unknown }).event
        )).toEqual(["created", "invariant-blocked", "consumed"])
        const authority = (attempts[0] as { authority?: unknown }).authority
        expect(createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
          attempt: authority as never,
        })).toMatchObject({
          status: "blocked",
          issues: [{ code: "fallback-request-authority-mismatch" }],
        })
      } finally {
        boundaries.setNextLimit(null)
        boundaries.setAttemptObserver(null)
        boundaries.setReadObserver(null)
      }
    }

    for (const effectiveLimit of [2, 1]) {
      const reads: unknown[] = []
      boundaries.setReadObserver((value) => reads.push(value))
      boundaries.setNextLimit({
        unit: "source-lookup-nodes",
        effectiveLimit,
      })
      try {
        const previousRoot = v3Root()
        expect(bindVNextTextBlockUnifiedLayoutChangeInternalV1({
          previousRoot,
          change: imagePaintUnifiedLayoutChange5b(previousRoot, {
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
        }).status).toBe("accepted")
        expect(reads).toContainEqual({
          unit: "source-lookup-nodes",
          completedWork: 1,
        })
      } finally {
        boundaries.setNextLimit(null)
        boundaries.setReadObserver(null)
      }
    }
  })

  it("owns exact V3 post-binding thresholds and one-shot limit authority", () => {
    const boundary = postBindingTestBoundaries()
    expect(boundary.evaluate).toBeTypeOf("function")
    expect(boundary.getRecord).toBeTypeOf("function")
    expect(boundary.consume).toBeTypeOf("function")
    if (
      boundary.evaluate == null
      || boundary.getRecord == null
      || boundary.consume == null
    ) return
    const { previousRoot, change, bound } = v3BoundImagePaint()
    const within = workWithStageCount(
      bound.incrementalCandidateWork,
      "scene",
      "copied-scene-nodes",
      1,
    )
    expect(boundary.evaluate({
      validatedChange: bound.validatedChange,
      stage: "scene",
      unit: "copied-scene-nodes",
      completedWork: 1,
      completedCandidateWork: within,
    })).toEqual({ status: "accepted", attemptedWork: 2 })
    expect(boundary.evaluate({
      validatedChange: bound.validatedChange,
      stage: "scene",
      unit: "copied-scene-nodes",
      completedWork: 1,
      completedCandidateWork: within,
    })).toMatchObject({ status: "invariant-blocked" })

    const atLimit = workWithStageCount(
      bound.incrementalCandidateWork,
      "scene",
      "copied-scene-nodes",
      2,
    )
    const exceeded = boundary.evaluate({
      validatedChange: bound.validatedChange,
      stage: "scene",
      unit: "copied-scene-nodes",
      completedWork: 2,
      completedCandidateWork: atLimit,
    }) as {
      readonly status?: unknown
      readonly attemptedWork?: unknown
      readonly effectiveLimit?: unknown
      readonly evaluatorAuthority?: unknown
    }
    expect(exceeded).toMatchObject({
      status: "limit-exceeded",
      attemptedWork: 3,
      effectiveLimit: 2,
    })
    expect(exceeded.evaluatorAuthority).not.toBeNull()
    const record = boundary.getRecord(exceeded.evaluatorAuthority) as {
      readonly previousRoot?: unknown
      readonly originalChange?: unknown
      readonly workPolicy?: unknown
      readonly validatedChange?: unknown
      readonly stage?: unknown
      readonly unit?: unknown
      readonly completedWork?: unknown
      readonly attemptedWork?: unknown
      readonly effectiveLimit?: unknown
      readonly completedCandidateWork?: unknown
      readonly canonicalStageWork?: readonly {
        readonly stage: string
        readonly unit: string
      }[]
    } | null
    expect(record).toMatchObject({
      previousRoot,
      originalChange: change,
      workPolicy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
      validatedChange: bound.validatedChange,
      stage: "scene",
      unit: "copied-scene-nodes",
      completedWork: 2,
      attemptedWork: 3,
      effectiveLimit: 2,
      completedCandidateWork: atLimit,
    })
    expect(record?.previousRoot).toBe(previousRoot)
    expect(record?.originalChange).toBe(change)
    expect(record?.validatedChange).toBe(bound.validatedChange)
    expect(record?.completedCandidateWork).toBe(atLimit)
    expect(record?.canonicalStageWork?.map((row) =>
      `${row.stage}/${row.unit}`
    )).toEqual(CANONICAL_V3_STAGE_ROWS)
    expect(record?.canonicalStageWork).toHaveLength(21)
    expect(boundary.getRecord(structuredClone(
      exceeded.evaluatorAuthority,
    ))).toBeNull()
    expect(createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
      attempt: exceeded.evaluatorAuthority as never,
    })).toMatchObject({
      status: "fallback-required",
      fallbackRequest: {
        mode: "deterministic-work-limit-exceeded",
        reason: {
          code: "stage-unit-limit-exceeded",
          stage: "scene",
          unit: "copied-scene-nodes",
          effectiveLimit: 2,
          attemptedWork: 3,
        },
      },
      incrementalCandidateWork: atLimit,
    })
    expect(boundary.consume(exceeded.evaluatorAuthority)).toBeNull()
    expect(boundary.getRecord(exceeded.evaluatorAuthority)).toBeNull()
  })

  it("rejects modified post-binding detail, ledger, and authority context", () => {
    const boundary = postBindingTestBoundaries()
    expect(boundary.evaluate).toBeTypeOf("function")
    expect(boundary.getRecord).toBeTypeOf("function")
    expect(boundary.consume).toBeTypeOf("function")
    if (
      boundary.evaluate == null
      || boundary.getRecord == null
      || boundary.consume == null
    ) return
    const { bound } = v3BoundImagePaint()
    const atLimit = workWithStageCount(
      bound.incrementalCandidateWork,
      "scene",
      "copied-scene-nodes",
      2,
    )
    const mismatchedLedger = structuredClone(atLimit) as unknown as {
      stageWork: { stage: string; unit: string; count: number }[]
    }
    const copiedRow = mismatchedLedger.stageWork.find((row) =>
      row.stage === "scene" && row.unit === "copied-scene-nodes"
    )
    if (copiedRow == null) throw new Error("copied Scene row missing")
    copiedRow.count = 1
    deepFreezeTestValue(mismatchedLedger)
    const reorderedLedger = structuredClone(atLimit) as unknown as {
      stageWork: { stage: string; unit: string; count: number }[]
    }
    const first = reorderedLedger.stageWork[0]!
    reorderedLedger.stageWork[0] = reorderedLedger.stageWork[1]!
    reorderedLedger.stageWork[1] = first
    deepFreezeTestValue(reorderedLedger)
    for (const invalid of [
      {
        validatedChange: structuredClone(bound.validatedChange),
        stage: "scene",
        unit: "copied-scene-nodes",
        completedWork: 2,
        completedCandidateWork: atLimit,
      },
      {
        validatedChange: bound.validatedChange,
        stage: "scene",
        unit: "copied-scene-nodes",
        completedWork: 1,
        completedCandidateWork: atLimit,
      },
      {
        validatedChange: bound.validatedChange,
        stage: "scene",
        unit: "replacement-chunks",
        completedWork: 2,
        completedCandidateWork: atLimit,
      },
      {
        validatedChange: bound.validatedChange,
        stage: "scene",
        unit: "copied-scene-nodes",
        completedWork: 2,
        completedCandidateWork: mismatchedLedger,
      },
      {
        validatedChange: bound.validatedChange,
        stage: "scene",
        unit: "copied-scene-nodes",
        completedWork: 2,
        completedCandidateWork: reorderedLedger,
      },
      {
        validatedChange: bound.validatedChange,
        stage: "scene",
        unit: "copied-scene-nodes",
        completedWork: 2,
        completedCandidateWork: structuredClone(atLimit),
      },
    ]) {
      expect(boundary.evaluate(invalid)).toMatchObject({
        status: "invariant-blocked",
      })
    }
    expect(boundary.getRecord(Object.freeze({}))).toBeNull()
    expect(boundary.consume(Object.freeze({}))).toBeNull()
  })

  it("keeps all exhausted V3 source rows invariant-only", () => {
    const boundary = postBindingTestBoundaries()
    expect(boundary.evaluate).toBeTypeOf("function")
    if (boundary.evaluate == null) return
    const { bound } = v3BoundImagePaint()
    for (const row of [
      { unit: "source-items" as const, completedWork: 4 },
      { unit: "source-lookup-nodes" as const, completedWork: 5 },
      { unit: "source-path-copy-nodes" as const, completedWork: 5 },
      { unit: "source-leaf-items" as const, completedWork: 8 },
    ]) {
      const completedCandidateWork = workWithStageCount(
        bound.incrementalCandidateWork,
        "source-flow",
        row.unit,
        row.completedWork,
      )
      const result = boundary.evaluate({
        validatedChange: bound.validatedChange,
        stage: "source-flow",
        unit: row.unit,
        completedWork: row.completedWork,
        completedCandidateWork,
      })
      expect(result, row.unit).toEqual({
        status: "invariant-blocked",
        attemptedWork: row.completedWork + 1,
        effectiveLimit: row.completedWork,
      })
      expect(result).not.toHaveProperty("evaluatorAuthority")
    }
  })

  it("registers authority only for the exact validated-change object", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({ fit: "contain" })
    const change = noOpUnifiedLayoutChange5b(previous.root)
    const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previous.root,
      change,
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })

    expect(bound.status).toBe("accepted")
    if (bound.status !== "accepted") return
    const record =
      getVNextTextBlockValidatedChangeAuthorityRecordInternalV1(
        bound.validatedChange,
      )
    expect(record).toMatchObject({
      previousRoot: previous.root,
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
      originalChange: change,
      validatedChange: bound.validatedChange,
      expectedTargetBinding: bound.validatedChange.expectedTargetBinding,
      bindingWork: bound.incrementalCandidateWork,
    })
    expect(record?.previousRoot).toBe(previous.root)
    expect(record?.workPolicy).toBe(ROOT_V2_TEST_WORK_POLICY)
    expect(record?.originalChange).toBe(change)
    expect(record?.validatedChange).toBe(bound.validatedChange)
    expect(record?.expectedTargetBinding)
      .toBe(bound.validatedChange.expectedTargetBinding)
    expect(record?.bindingWork).toBe(bound.incrementalCandidateWork)

    const cloned = structuredClone(bound.validatedChange)
    expect(getVNextTextBlockValidatedChangeAuthorityRecordInternalV1(cloned))
      .toBeNull()
    expect(getVNextTextBlockValidatedChangeAuthorityRecordInternalV1({
      ...bound.validatedChange,
    }))
      .toBeNull()
  })

  it("binds frozen effects and fingerprints them into exact validated changes", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({ fit: "contain" })
    const rows = [
      {
        label: "bound no-op",
        change: noOpUnifiedLayoutChange5b(previous.root),
        effectClass: "true-no-op",
        semanticIdentityChanged: false,
      },
      {
        label: "unchanged image fit and crop",
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "contain",
          crop: null,
        }),
        effectClass: "true-no-op",
        semanticIdentityChanged: false,
      },
      {
        label: "changed image fit and crop",
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        effectClass: "paint-affecting-change",
        semanticIdentityChanged: false,
      },
    ] as const

    const bound = rows.map((row) => ({
      row,
      result: bindVNextTextBlockUnifiedLayoutChangeInternalV1({
        previousRoot: previous.root,
        change: row.change,
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      }),
    }))
    for (const { row, result } of bound) {
      expect(result.status, `${row.label}: ${JSON.stringify(result.issues)}`)
        .toBe("accepted")
      if (result.status !== "accepted") continue
      expect(result.validatedChange.effectClassification).toMatchObject({
        effectClass: row.effectClass,
        semanticIdentityChanged: row.semanticIdentityChanged,
      })
      expect(Object.isFrozen(result.validatedChange.effectClassification))
        .toBe(true)
      expect(result.validatedChange.effectClassification.fingerprint.length)
        .toBeGreaterThan(0)
      const shaped = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
        row.change,
      )
      expect(shaped.status).toBe("accepted")
      if (shaped.status !== "accepted") continue
      const classification = result.validatedChange.effectClassification
      const fingerprintWithoutClassification = createVNextCompactFingerprint(
        stringifyVNextCanonicalJson({
          changeFingerprint: shaped.fingerprint,
          eligibility: result.validatedChange.eligibility,
          producerEvidence: result.validatedChange.producerEvidence,
          expectedTargetBinding: result.validatedChange.expectedTargetBinding,
        }),
      )
      const fingerprintWithClassification = createVNextCompactFingerprint(
        stringifyVNextCanonicalJson({
          changeFingerprint: shaped.fingerprint,
          eligibility: result.validatedChange.eligibility,
          producerEvidence: result.validatedChange.producerEvidence,
          expectedTargetBinding: result.validatedChange.expectedTargetBinding,
          effectClassification: classification,
        }),
      )
      expect(result.validatedChange.fingerprint).toBe(
        fingerprintWithClassification,
      )
      expect(result.validatedChange.fingerprint).not.toBe(
        fingerprintWithoutClassification,
      )
    }
    expect(new Set(bound.map(({ result }) => (
      result.status === "accepted"
        ? result.validatedChange.effectClassification.fingerprint
        : null
    ))).size).toBe(2)
    const repeatedNoOp = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previous.root,
      change: rows[0].change,
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })
    expect(repeatedNoOp.status).toBe("accepted")
    if (
      repeatedNoOp.status !== "accepted"
      || bound[0].result.status !== "accepted"
    ) return
    expect(repeatedNoOp.validatedChange.effectClassification)
      .toEqual(bound[0].result.validatedChange.effectClassification)
    expect(repeatedNoOp.validatedChange.fingerprint)
      .toBe(bound[0].result.validatedChange.fingerprint)
  })
})
