import { describe, expect, it, vi } from "vitest"
import * as rootV2Internals from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import * as sourceStateInternals from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  inspectVNextTextBlockIncrementalFlowTreeInternalV1,
  inspectVNextTextBlockIncrementalFlowTreeV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  composeVNextTextBlockPersistentLayoutLineTreeIdentityForTestInternalV1,
  inspectVNextTextBlockPersistentLayoutLineTreeV1,
  verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  composeVNextTextBlockPersistentSceneIdentityForTestInternalV2,
  inspectVNextTextBlockPersistentSceneV2,
  verifyVNextTextBlockPersistentSceneCandidateInternalV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2,
  canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2,
  composeVNextTextBlockUnifiedLayoutRootIdentityForTestInternalV2,
  deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2,
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
  inspectVNextTextBlockUnifiedLayoutRootV2,
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import * as rootV1Module from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import * as sceneV1Module from "../src/layout/textBlockUnifiedLayoutSceneV1.js"
import {
  inspectVNextTextBlockUnifiedSpatialStateV1,
  verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateV1,
  registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  ROOT_V2_TEST_WORK_POLICY,
  acceptedUnifiedLayoutRootFixtureV2,
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"

function rootSourceEnvelopeAuthority(value: unknown): unknown {
  const get = (rootV2Internals as unknown as {
    readonly getVNextTextBlockRootSourceEnvelopeAuthorityInternalV1?:
      (root: unknown) => unknown
  }).getVNextTextBlockRootSourceEnvelopeAuthorityInternalV1
  return get?.(value) ?? null
}

describe("Phase 5B independent unified Root V2", () => {
  it("atomically registers source envelope authority only for exact V3 roots", () => {
    const input = unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
    })
    const prepared =
      prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
        input,
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
        "complete-bootstrap",
      )
    expect(prepared.status).toBe("prepared")
    if (prepared.status !== "prepared") throw new Error("V3 candidate blocked")
    expect(rootSourceEnvelopeAuthority(prepared.root)).toBeNull()
    expect(registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      prepared.root,
    )).toMatchObject({ status: "committed" })
    const preparedAuthority = rootSourceEnvelopeAuthority(prepared.root)
    expect(preparedAuthority).not.toBeNull()
    expect(Object.isFrozen(preparedAuthority)).toBe(true)

    const accepted = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
    )
    expect(accepted.status).toBe("accepted")
    if (accepted.status !== "accepted") throw new Error("V3 Root blocked")
    expect(rootSourceEnvelopeAuthority(accepted.root)).not.toBeNull()
    expect(rootSourceEnvelopeAuthority(structuredClone(accepted.root))).toBeNull()
    expect(accepted.root).not.toHaveProperty("treeHeight")
    expect(accepted.root.sourceState).not.toHaveProperty("treeHeight")
    expect(accepted.root.sourceState.summary).not.toHaveProperty("treeHeight")

    const activeV2 = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      ROOT_V2_TEST_WORK_POLICY,
    )
    expect(activeV2.status).toBe("accepted")
    if (activeV2.status !== "accepted") throw new Error("V2 Root blocked")
    expect(rootSourceEnvelopeAuthority(activeV2.root)).toBeNull()
  })

  it("rejects a V3 source-envelope breach before downstream complete work", () => {
    const setNextFacts = (sourceStateInternals as unknown as {
      readonly setVNextTextBlockPreparedSourceEnvelopeFactsForNextCompleteBuildForTestInternalV1?:
        (facts: unknown) => void
    }).setVNextTextBlockPreparedSourceEnvelopeFactsForNextCompleteBuildForTestInternalV1
    const setObserver = (rootV2Internals as unknown as {
      readonly setVNextTextBlockUnifiedLayoutSourceEnvelopeObserverForTestInternalV1?:
        (observer: ((value: unknown) => void) | null) => void
    }).setVNextTextBlockUnifiedLayoutSourceEnvelopeObserverForTestInternalV1
    expect(setNextFacts).toBeTypeOf("function")
    expect(setObserver).toBeTypeOf("function")
    if (setNextFacts == null || setObserver == null) return

    const input = unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
    })
    const observations: unknown[] = []
    setObserver((value) => observations.push(value))
    try {
      setNextFacts({
        sourceItemCount: input.initialFlow.atoms.length,
        treeHeight: 17,
        maximumLeafOccupancy: 8,
        deliberateItemResolutionCount: 1,
      })
      const rejected =
        prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
          input,
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
          "complete-bootstrap",
        )
      expect(rejected).toMatchObject({
        status: "blocked",
        root: null,
        persistentScene: null,
        deliveryPlan: null,
        completeBuildWork: {
          completeSourceItemVisitCount: input.initialFlow.atoms.length,
          completeFlowAtomVisitCount: 0,
          completeLineVisitCount: 0,
          completeSceneNodeVisitCount: 0,
        },
        issues: [{
          code: "source-work-envelope-exceeded",
          stage: "source-flow",
        }],
      })

      const corrected =
        prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
          input,
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
          "complete-fallback",
        )
      expect(corrected.status).toBe("prepared")
      expect(observations).toEqual([
        expect.objectContaining({
          constructionKind: "complete-bootstrap",
          status: "rejected",
          treeHeight: 17,
        }),
        expect.objectContaining({
          constructionKind: "complete-fallback",
          status: "accepted",
          treeHeight: 1,
        }),
      ])
    } finally {
      setNextFacts(null)
      setObserver(null)
    }
  })

  it("atomically carries exact source envelope authority into a V3 paint root", () => {
    const previous = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "text-image-text-break",
        fit: "contain",
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
    )
    if (previous.status !== "accepted") throw new Error("V3 previous Root blocked")
    const previousAuthority = rootSourceEnvelopeAuthority(previous.root)
    expect(previousAuthority).not.toBeNull()

    const result = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: imagePaintUnifiedLayoutChange5b(previous.root, {
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      }),
      workPolicy:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
    })
    expect(result.status).toBe("accepted-incremental")
    if (result.status !== "accepted-incremental") return
    const nextAuthority = rootSourceEnvelopeAuthority(result.root)
    expect(nextAuthority).not.toBeNull()
    expect(nextAuthority).not.toBe(previousAuthority)
    expect(result.root.sourceState.summary.itemCount)
      .toBe(previous.root.sourceState.summary.itemCount)
    expect(result.root.sourceState.root.height)
      .toBe(previous.root.sourceState.root.height)
  })

  it("recomposes line-tree, Scene, and Root identity without leaking work into semantics", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2()
    const lineIdentity =
      composeVNextTextBlockPersistentLayoutLineTreeIdentityForTestInternalV1({
        lineTree: accepted.root.lineTree,
        work: Object.freeze({
          ...accepted.root.lineTree.work,
          visitedLineCount:
            accepted.root.lineTree.work.visitedLineCount + 1,
        }),
      })
    expect(lineIdentity.semanticFingerprint)
      .toBe(accepted.root.lineTree.semanticFingerprint)
    expect(lineIdentity.fingerprint)
      .not.toBe(accepted.root.lineTree.fingerprint)

    const sceneIdentity =
      composeVNextTextBlockPersistentSceneIdentityForTestInternalV2({
        scene: accepted.root.persistentScene,
        lineTreeFingerprint: lineIdentity.fingerprint,
        lineTreeSemanticFingerprint: lineIdentity.semanticFingerprint,
      })
    expect(sceneIdentity.fingerprint)
      .toBe(accepted.root.persistentScene.fingerprint)
    expect(sceneIdentity.lineTreeFingerprint)
      .toBe(lineIdentity.fingerprint)
    expect(sceneIdentity.lineTreeSemanticFingerprint)
      .toBe(lineIdentity.semanticFingerprint)

    const rootIdentity =
      composeVNextTextBlockUnifiedLayoutRootIdentityForTestInternalV2({
        root: accepted.root,
        lineTreeFingerprint: lineIdentity.fingerprint,
        lineTreeSemanticFingerprint: lineIdentity.semanticFingerprint,
        persistentSceneFingerprint: sceneIdentity.fingerprint,
      })
    expect(rootIdentity.semanticFingerprint)
      .toBe(accepted.root.semanticFingerprint)
    expect(rootIdentity.fingerprint).not.toBe(accepted.root.fingerprint)
    expect(rootIdentity.semanticDependencyFingerprints.lineTree)
      .toBe(lineIdentity.semanticFingerprint)
    expect(rootIdentity.dependencyFingerprints.lineTree)
      .toBe(lineIdentity.fingerprint)
  })

  it("keeps QA-only work-policy variation out of canonical semantic identity", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2()
    const alternate = structuredClone(accepted.root) as
      VNextTextBlockUnifiedLayoutRootV2
    const alternatePolicyFingerprint = `sha256:${"c".repeat(64)}`
    Object.assign(alternate, {
      workPolicy: Object.freeze({
        ...alternate.workPolicy,
        policyId: "qa-only-unregistered-policy-variation",
        fingerprint: alternatePolicyFingerprint,
      }),
      dependencyFingerprints: Object.freeze({
        ...alternate.dependencyFingerprints,
        workPolicy: alternatePolicyFingerprint,
      }),
    })

    expect(canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
      alternate,
    )).toBe(
      canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
        accepted.root,
      ),
    )
    expect(canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(alternate))
      .not.toBe(
        canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(
          accepted.root,
        ),
      )
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(alternate))
      .toMatchObject({
        status: "invalid",
        code: "root-authority-mismatch",
      })
  })

  it("accepts only the active V2 structural-reuse work policy", () => {
    const input = unifiedLayoutRootBuildInputFixtureV2()
    expect(createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      ROOT_V2_TEST_WORK_POLICY,
    ).status).toBe("accepted")
    expect(createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
    )).toMatchObject({
      status: "blocked",
      root: null,
      issues: [{ code: "invalid-work-policy" }],
    })
  })

  it("bootstraps without Root V1 or Scene V1 construction", () => {
    const rootV1Spy = vi.spyOn(
      rootV1Module,
      "createVNextTextBlockUnifiedLayoutRootV1",
    )
    const sceneV1Spy = vi.spyOn(
      sceneV1Module,
      "projectVNextTextBlockUnifiedLayoutSceneV1",
    )
    try {
      const input = unifiedLayoutRootBuildInputFixtureV2({
        content: "text-image-text-break",
        width: { value: 84, unit: "pt" },
      })
      const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
        input,
        ROOT_V2_TEST_WORK_POLICY,
      )
      expect(result.status).toBe("accepted")
      if (result.status !== "accepted") throw new Error("Root V2 blocked")

      expect(result.root.contractVersion).toBe(2)
      expect(result.root.persistentScene.contractVersion).toBe(2)
      expect(rootV1Spy).not.toHaveBeenCalled()
      expect(sceneV1Spy).not.toHaveBeenCalled()
      expect(result.completeBuildWork).toMatchObject({
        completeRootV2BuildCount: 1,
        completeSourceItemVisitCount:
          result.root.sourceState.summary.itemCount,
        completeFlowAtomVisitCount: result.root.flowTree.summary.atomCount,
        completeSpatialEntryVisitCount: 0,
        completeLineVisitCount: result.root.lineTree.summary.lineCount,
        completeFragmentVisitCount:
          result.root.lineTree.summary.fragmentCount,
        completeSceneNodeVisitCount:
          result.root.persistentScene.root.summary.nodeCount,
        completeSceneProjectionCount: 1,
        completeChildRehashCount: 0,
      })
      for (const forbidden of [
        "initialFlow",
        "evidence",
        "persistentFlowTree",
        "spatialIndex",
        "spatialLayout",
        "authoredBoxGeometry",
        "scene",
      ]) {
        expect(result.root).not.toHaveProperty(forbidden)
      }
      expect(inspectVNextTextBlockUnifiedLayoutRootV2(result.root))
        .toMatchObject({ status: "valid" })
    } finally {
      rootV1Spy.mockRestore()
      sceneV1Spy.mockRestore()
    }
  })

  it("keeps a prepared graph wholly unregistered until the atomic commit", () => {
    const input = unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text",
    })
    const prepared =
      prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
        input,
        ROOT_V2_TEST_WORK_POLICY,
        "complete-bootstrap",
      )
    if (prepared.status !== "prepared") throw new Error("candidate blocked")
    const root = prepared.root

    expect(inspectVNextTextBlockUnifiedLayoutRootV2(root))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(root.sourceState))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockIncrementalFlowTreeV1(root.flowTree))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockUnifiedSpatialStateV1(root.spatialState))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockPersistentLayoutLineTreeV1(root.lineTree))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockPersistentSceneV2(root.persistentScene))
      .toMatchObject({ status: "invalid" })

    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      root.sourceState,
    )).toMatchObject({ status: "prepared-unregistered" })
    expect(inspectVNextTextBlockIncrementalFlowTreeInternalV1(
      root.flowTree,
    )).toMatchObject({ status: "prepared-unregistered" })
    expect(verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      root.spatialState,
    )).toMatchObject({ status: "valid-candidate" })
    expect(verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      root.lineTree,
    )).toMatchObject({ status: "valid-candidate" })
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      root.persistentScene,
    )).toMatchObject({ status: "valid-candidate" })

    expect(
      registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2({
        token: Object.freeze({}),
        phase: "preflight",
        sourceState: root.sourceState,
      }),
    ).toBe(false)
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(root.sourceState))
      .toMatchObject({ status: "invalid" })

    expect(registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      structuredClone(root),
    )).toMatchObject({
      status: "blocked",
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
    })
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(root.sourceState))
      .toMatchObject({ status: "invalid" })
    expect(inspectVNextTextBlockPersistentSceneV2(root.persistentScene))
      .toMatchObject({ status: "invalid" })

    expect(registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(root))
      .toEqual({
        status: "committed",
        attemptedRegistrationCount: 6,
        committedRegistrationCount: 6,
      })
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(root))
      .toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(root.sourceState))
      .toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockIncrementalFlowTreeV1(root.flowTree))
      .toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockUnifiedSpatialStateV1(root.spatialState))
      .toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockPersistentLayoutLineTreeV1(root.lineTree))
      .toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockPersistentSceneV2(root.persistentScene))
      .toMatchObject({ status: "valid" })
  })

  it("inspects exactly eight top-level dependencies without child traversal", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(accepted.root)).toEqual({
      status: "valid",
      fingerprint: accepted.root.fingerprint,
      semanticFingerprint: accepted.root.semanticFingerprint,
      persistentSceneFingerprint: accepted.root.persistentScene.fingerprint,
      persistentScenePayloadObservationFingerprint:
        accepted.root.persistentScene.payloadObservation
          .payloadObservationFingerprint,
      constructionKind: "complete-bootstrap",
      work: {
        topLevelDependencyCount: 8,
        completeChildGraphTraversalCount: 0,
        completeChildRehashCount: 0,
        rootWrapperInspectionCount: 1,
      },
    })

    const rootClone = structuredClone(accepted.root)
    expect(rootClone).toEqual(accepted.root)
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(rootClone))
      .toMatchObject({
        status: "invalid",
        code: "root-authority-mismatch",
      })
    expect(inspectVNextTextBlockPersistentSceneV2(
      structuredClone(accepted.root.persistentScene),
    )).toMatchObject({
      status: "invalid",
      code: "scene-authority-mismatch",
    })
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(
      structuredClone(accepted.root.sourceState),
    )).toMatchObject({ status: "invalid" })
  })

  it("matches normalized Phase 5A layout and renderer facts", () => {
    const input = unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    const v2 = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      ROOT_V2_TEST_WORK_POLICY,
    )
    const v1 = rootV1Module.createVNextTextBlockUnifiedLayoutRootV1(input)
    if (v2.status !== "accepted" || v1.status !== "accepted") {
      throw new Error("parity roots blocked")
    }

    expect(v2.root.lineTree.summary.lineCount)
      .toBe(v1.root.authoredBoxGeometry.summary.lineCount)
    expect(v2.root.authoredBoxSummary.outerHeightLayoutUnit)
      .toBe(v1.root.authoredBoxGeometry.geometry.outerHeightLayoutUnit)
    expect(v2.root.authoredBoxSummary.outerWidthLayoutUnit)
      .toBe(v1.root.authoredBoxGeometry.geometry.outerWidthLayoutUnit)
    expect(v2.root.persistentScene.summary.textFragmentCount)
      .toBe(v1.root.authoredBoxGeometry.summary.textFragmentCount)
    expect(v2.root.persistentScene.summary.inlineImageFragmentCount)
      .toBe(v1.root.authoredBoxGeometry.summary.inlineImageFragmentCount)
  })

  it("blocks invalid material with a closed null result", () => {
    const input = unifiedLayoutRootBuildInputFixtureV2()
    let accessorReads = 0
    const accessorInput = Object.create(null)
    Object.defineProperty(accessorInput, "inputAuthority", {
      enumerable: true,
      value: "core-synthetic-qa-only",
    })
    Object.defineProperty(accessorInput, "initialFlow", {
      enumerable: true,
      get: () => {
        accessorReads += 1
        return input.initialFlow
      },
    })
    Object.defineProperty(accessorInput, "evidence", {
      enumerable: true,
      value: input.evidence,
    })
    Object.defineProperty(accessorInput, "spatialEntries", {
      enumerable: true,
      value: [],
    })

    const rows: readonly unknown[] = [
      accessorInput,
      { ...input, bindProductionLayout: true },
      { ...input, initialFlow: structuredClone(input.initialFlow) },
      { ...input, evidence: structuredClone(input.evidence) },
      { ...input, spatialEntries: [{}] },
      { ...input, fixedHeight: { value: 100, unit: "pt" } },
    ]
    for (const row of rows) {
      expect(createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
        row,
        ROOT_V2_TEST_WORK_POLICY,
      )).toMatchObject({
        status: "blocked",
        root: null,
        persistentScene: null,
        deliveryPlan: null,
        completeBuildWork: expect.any(Object),
        issues: [expect.any(Object)],
      })
    }
    expect(accessorReads).toBe(0)

    expect(createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      input,
      structuredClone(ROOT_V2_TEST_WORK_POLICY),
    )).toMatchObject({
      status: "blocked",
      root: null,
      persistentScene: null,
      deliveryPlan: null,
      issues: [{ code: "invalid-work-policy" }],
    })
  })

  it("keeps unresolved inline-image material behind the evidence gate", () => {
    expect(() => unifiedLayoutRootBuildInputFixtureV2({
      content: "image-only",
      assetId: null,
    })).toThrow("flow evidence fixture blocked")
  })
})
