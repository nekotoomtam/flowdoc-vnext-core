import { describe, expect, it, vi } from "vitest"
import {
  inspectVNextTextBlockIncrementalFlowTreeInternalV1,
  inspectVNextTextBlockIncrementalFlowTreeV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  inspectVNextTextBlockPersistentLayoutLineTreeV1,
  verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  inspectVNextTextBlockPersistentSceneV2,
  verifyVNextTextBlockPersistentSceneCandidateInternalV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
  inspectVNextTextBlockUnifiedLayoutRootV2,
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
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
  ROOT_V2_TEST_WORK_POLICY,
  acceptedUnifiedLayoutRootFixtureV2,
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

describe("Phase 5B independent unified Root V2", () => {
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
      persistentSceneFingerprint: accepted.root.persistentScene.fingerprint,
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
