import { describe, expect, it } from "vitest"
import * as sourceStateInternals from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import * as transitionEvidenceInternals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  getVNextTextBlockValidatedChangeAuthorityRecordInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutFallbackV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
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
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
  )
  if (result.status !== "accepted") throw new Error("V3 Root fixture blocked")
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
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
        },
        {
          previousRoot,
          change: Object.freeze({
            ...change,
            expectedPreviousRootFingerprint: `sha256:${"0".repeat(64)}`,
          }),
          workPolicy:
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
        },
        {
          previousRoot,
          change,
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
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
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
            VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
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
