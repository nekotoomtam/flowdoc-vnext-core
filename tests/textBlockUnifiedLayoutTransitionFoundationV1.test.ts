import { describe, expect, it } from "vitest"
import {
  inspectVNextTextBlockPersistentSceneV2,
  recursivelyFreezeVNextTextBlockPersistentSceneForTestInternalV2,
  setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  setVNextTextBlockPersistentLayoutLineTreeFullInspectionObserverForTestInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  setVNextTextBlockSceneDeliveryPlanVerificationObserverForTestInternalV2,
} from "../src/layout/textBlockSceneDeliveryV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
  inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1,
  setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
  setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  acceptedRepeatedUnifiedLayoutRootFixture5b,
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import type {
  InlineImageFlowFixtureOptions,
} from "./helpers/textBlockInlineImageFlowV2.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
  ROOT_V2_TEST_WORK_POLICY,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

describe("Phase 5B-1 no-op and paint-only transition foundation", () => {
  it("propagates factual source work into an accepted transition", () => {
    const previous = acceptedRepeatedUnifiedLayoutRootFixture5b(8)
    const result = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: imagePaintUnifiedLayoutChange5b(previous.root, {
        fit: "cover",
        crop: { x: 0.1, y: 0.2, width: 0.6, height: 0.7 },
        inlineId: "repeat-image-4",
      }),
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })
    expect(result.status).toBe("accepted-incremental")
    expect(result.incrementalCandidateWork.flow).toMatchObject({
      visitedSourceItemCount: 1,
      visitedSourceLookupNodeCount: 2,
      copiedSourcePathNodeCount: 2,
      visitedChangedSourceLeafItemCount: 8,
    })
    expect(result.incrementalCandidateWork.stageWork).toHaveLength(14)
    expect(result.incrementalCandidateWork.stageWork.some((work) =>
      work.unit === "source-lookup-nodes"
      || work.unit === "source-path-copy-nodes"
      || work.unit === "source-leaf-items"
    )).toBe(false)
  })

  it("reports lookup-only work for an image-paint semantic no-op", () => {
    const previous = acceptedRepeatedUnifiedLayoutRootFixture5b(8)
    const result = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous.root,
      change: imagePaintUnifiedLayoutChange5b(previous.root, {
        fit: "contain",
        crop: null,
        inlineId: "repeat-image-4",
      }),
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })

    expect(result.status).toBe("accepted-no-op")
    expect(result.incrementalCandidateWork.flow).toMatchObject({
      visitedSourceItemCount: 1,
      visitedSourceLookupNodeCount: 2,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
    })
  })

  it("blocks inactive text transition after Core classifies its geometry effect", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({ fit: "contain" })
    const textChange = Object.freeze({
      source: "vnext-text-block-unified-layout-change-v1" as const,
      contractVersion: 1 as const,
      documentId: previous.root.documentId,
      sectionId: previous.root.sectionId,
      textBlockId: previous.root.textBlockId,
      expectedPreviousRootFingerprint: previous.root.fingerprint,
      expectedPreviousSourceFingerprint: previous.root.sourceState.fingerprint,
      kind: "text-insertion" as const,
      atRenderedUtf16: 0,
      insertedText: "x",
      insertedSource: Object.freeze({
        lineageId: "lineage-next",
        sourceFingerprint: "source-next",
        provenanceFingerprint: "provenance-next",
      }),
      measurementStyleKey: "measurement-style-next",
      effectiveShapingStyleKey: "shaping-style-next",
    })
    const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previous.root,
      change: textChange,
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })
    expect(bound.status, JSON.stringify(bound.issues)).toBe("accepted")
    if (bound.status !== "accepted") return
    expect(bound.validatedChange.effectClassification).toMatchObject({
      effectClass: "geometry-affecting-change",
      semanticIdentityChanged: true,
    })
    let coverCreationCount = 0
    setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1(
      () => {
        coverCreationCount += 1
      },
    )
    const result = (() => {
      try {
        return attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: textChange,
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
      } finally {
        setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1(
          null,
        )
      }
    })()
    expect(result.status, JSON.stringify(result.issues)).toBe("blocked")
    if (result.status !== "blocked") return
    expect(result.issues).toEqual([expect.objectContaining({
      code: "inactive-work-policy-stage",
      stage: "source-flow",
      path: "change.kind",
    })])
    expect(result.incrementalCandidateWork).toMatchObject({
      evidence: { requestCount: 0 },
      flow: {
        visitedSourceItemCount: 0,
        visitedFlowAtomCount: 0,
        createdFlowTreeNodeCount: 0,
      },
      layout: { recomputedLineCount: 0 },
      geometry: { reprojectedLineCount: 0 },
      scene: { replacementChunkCount: 0 },
      atomicAcceptance: { attemptedRegistrationCount: 0 },
    })
    expect(result.incrementalCandidateWork.stageWork).toHaveLength(14)
    expect(result.incrementalCandidateWork.stageWork.every(
      (row) => row.count === 0,
    )).toBe(true)
    expect(coverCreationCount).toBe(0)
  })

  it("does not invoke full retained-tree inspection, rehash, or recursive Scene freeze on no-op and paint hot paths", () => {
    const noOpPrevious = acceptedUnifiedLayoutRootFixtureV2()
    const paintPrevious = acceptedUnifiedLayoutRootFixtureV2({
      fit: "contain",
    })
    const lineTreeEvents: string[] = []
    const sceneEvents: string[] = []
    setVNextTextBlockPersistentLayoutLineTreeFullInspectionObserverForTestInternalV1(
      (event) => lineTreeEvents.push(event),
    )
    setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2(
      (event) => {
        if (event.kind !== "historical-node-set-probe") {
          sceneEvents.push(event.kind)
        }
      },
    )
    try {
      recursivelyFreezeVNextTextBlockPersistentSceneForTestInternalV2(
        paintPrevious.persistentScene,
      )
      expect(sceneEvents).toContain("retained-graph-recursive-freeze")
      sceneEvents.length = 0
      const noOp =
        attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: noOpPrevious.root,
          change: noOpUnifiedLayoutChange5b(noOpPrevious.root),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
      expect(noOp.status, JSON.stringify(noOp.issues))
        .toBe("accepted-no-op")

      const paint =
        attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: paintPrevious.root,
          change: imagePaintUnifiedLayoutChange5b(paintPrevious.root, {
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
      expect(paint.status, JSON.stringify(paint.issues))
        .toBe("accepted-incremental")
    } finally {
      setVNextTextBlockPersistentLayoutLineTreeFullInspectionObserverForTestInternalV1(
        null,
      )
      setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2(null)
    }
    expect(lineTreeEvents).toEqual([])
    expect(sceneEvents).toEqual([])
  })

  it("returns the exact previous Root and Scene for a true no-op", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const result =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: previous.root,
        change: noOpUnifiedLayoutChange5b(previous.root),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-no-op")
    if (result.status !== "accepted-no-op") {
      throw new Error(`no-op blocked: ${JSON.stringify(result.issues)}`)
    }
    expect(result.root).toBe(previous.root)
    expect(result.persistentScene).toBe(previous.root.persistentScene)
    expect(result.deliveryPlan).toBeNull()
    expect(result.dispositions).toMatchObject({
      previousTreeFingerprint: previous.root.lineTree.fingerprint,
      nextTreeFingerprint: previous.root.lineTree.fingerprint,
      counts: {
        E: previous.root.lineTree.summary.lineCount,
        T: 0,
        R: 0,
        N: 0,
        removed: 0,
      },
      work: { enumeratedLineCount: 0 },
    })
    expect(result.incrementalCandidateWork).toMatchObject({
      evidence: { requestCount: 0 },
      flow: {
        visitedSourceItemCount: 0,
        createdFlowTreeNodeCount: 0,
        completeTreeRebuildCount: 0,
        completeSuffixTraversalCount: 0,
      },
      layout: {
        recomputedLineCount: 0,
        completeSuffixTraversalCount: 0,
      },
      geometry: {
        reprojectedLineCount: 0,
        visitedFragmentCount: 0,
      },
      scene: {
        copiedSceneNodeCount: 0,
        replacementChunkCount: 0,
      },
      deliveryPlan: {
        deliveryOperationCount: 0,
        retainCoverNodeCount: 0,
      },
      atomicAcceptance: {
        attemptedRegistrationCount: 0,
        committedRegistrationCount: 0,
      },
      rootWrapperAllocationCount: 0,
      completeNextInputTraversalCount: 0,
      completeNextInputComparisonCount: 0,
      completeSceneTraversalCount: 0,
    })
    expect(result.incrementalCandidateWork.structuralReuseProof).toEqual({
      visitedLineTreeNodeCount: 2,
      selectedExactSubtreeNodeCount: 1,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    })
    expect(result.incrementalCandidateWork.observations).toEqual({
      estimatedCanonicalPayloadByteCount: 0,
      payloadObservationFingerprint: null,
    })
    expect(result.incrementalCandidateWork.layout).toMatchObject({
      recomputedLineCount: 0,
      proofNodeCount: 0,
      completeSuffixTraversalCount: 0,
    })
    expect(result.incrementalCandidateWork.stageWork.filter(
      (row) => row.stage === "layout-reconvergence",
    ).every((row) => row.count === 0)).toBe(true)
    expect(inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1(
      result,
    )).toEqual({
      status: "valid",
      resultStatus: "accepted-no-op",
      rootFingerprint: previous.root.fingerprint,
      rootSemanticFingerprint: previous.root.semanticFingerprint,
      persistentSceneFingerprint: previous.persistentScene.fingerprint,
      persistentScenePayloadObservationFingerprint:
        previous.persistentScene.payloadObservation
          .payloadObservationFingerprint,
      fallbackRequestFingerprint: null,
    })
  })

  it("blocks authored-box changes at the inactive 5B-3 geometry stage without child work", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    let coverCreationCount = 0
    setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1(
      () => {
        coverCreationCount += 1
      },
    )
    const authoredBox = (() => {
      try {
        return attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: Object.freeze({
            source: "vnext-text-block-unified-layout-change-v1" as const,
            contractVersion: 1 as const,
            documentId: previous.root.documentId,
            sectionId: previous.root.sectionId,
            textBlockId: previous.root.textBlockId,
            expectedPreviousRootFingerprint: previous.root.fingerprint,
            expectedPreviousSourceFingerprint:
              previous.root.sourceState.fingerprint,
            kind: "authored-box-width-inset-change" as const,
            expectedAuthoredBoxPlanFingerprint:
              previous.root.sourceState.authoredBoxPlan.fingerprint,
            nextAuthoredBoxPlan:
              previous.root.sourceState.authoredBoxPlan,
          }),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
      } finally {
        setVNextTextBlockUnifiedLayoutTransitionCoverCreationObserverForTestInternalV1(
          null,
        )
      }
    })()
    expect(authoredBox.status).toBe("blocked")
    if (authoredBox.status !== "blocked") return
    expect(inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1(
      authoredBox,
    )).toMatchObject({
      status: "valid",
      resultStatus: "blocked",
      rootFingerprint: null,
      rootSemanticFingerprint: null,
      persistentSceneFingerprint: null,
      persistentScenePayloadObservationFingerprint: null,
      fallbackRequestFingerprint: null,
    })
    expect(authoredBox.root).toBeNull()
    expect(authoredBox.persistentScene).toBeNull()
    expect(authoredBox.deliveryPlan).toBeNull()
    expect(authoredBox.fallbackRequest).toBeNull()
    expect(authoredBox.issues).toEqual([expect.objectContaining({
      code: "inactive-work-policy-stage",
      stage: "geometry",
      path: "change.kind",
    })])
    expect(authoredBox.incrementalCandidateWork.stageWork).toHaveLength(14)
    expect(authoredBox.incrementalCandidateWork.stageWork.every(
      (row) => row.count === 0,
    )).toBe(true)
    expect(authoredBox.incrementalCandidateWork.structuralReuseProof)
      .toMatchObject({ selectedExactSubtreeNodeCount: 0 })
    expect(authoredBox.incrementalCandidateWork.scene).toEqual({
      visitedLineTreeNodeCount: 0,
      visitedSceneTreeNodeCount: 0,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
    })
    expect(authoredBox.incrementalCandidateWork.deliveryPlan).toEqual({
      visitedSceneTreeNodeCount: 0,
      deliveryOperationCount: 0,
      retainCoverNodeCount: 0,
    })
    expect(coverCreationCount).toBe(0)
  })

  it("reports null Root/Scene identities for blocked results", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const clonedRoot = structuredClone(previous.root)
    const blocked =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: clonedRoot,
        change: noOpUnifiedLayoutChange5b(clonedRoot),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    expect(blocked.status).toBe("blocked")
    expect(inspectVNextTextBlockUnifiedLayoutTransitionResultInternalV1(
      blocked,
    )).toMatchObject({
      status: "valid",
      resultStatus: "blocked",
      rootFingerprint: null,
      rootSemanticFingerprint: null,
      persistentSceneFingerprint: null,
      persistentScenePayloadObservationFingerprint: null,
    })
  })

  it("collapses an unchanged image paint request to exact no-op identity", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({
      fit: "contain",
    })
    const result =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: previous.root,
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "contain",
          crop: null,
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-no-op")
    if (result.status !== "accepted-no-op") return
    expect(result.root).toBe(previous.root)
    expect(result.persistentScene).toBe(previous.persistentScene)
    expect(result.incrementalCandidateWork.rootWrapperAllocationCount)
      .toBe(0)
    expect(result.incrementalCandidateWork.scene.replacementChunkCount)
      .toBe(0)
    expect(result.incrementalCandidateWork.flow.visitedSourceItemCount)
      .toBe(1)
    expect(result.incrementalCandidateWork.stageWork).toContainEqual({
      stage: "source-flow",
      unit: "source-items",
      count: 1,
    })
  })

  const transitions: readonly {
    readonly label: string
    readonly previous: InlineImageFlowFixtureOptions
    readonly next: InlineImageFlowFixtureOptions
    readonly change: {
      readonly fit: "contain" | "cover"
      readonly crop:
        | { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
        | null
    }
  }[] = [
    {
      label: "contain to cover with crop",
      previous: { fit: "contain" },
      next: {
        fit: "cover",
        crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
      },
      change: {
        fit: "cover",
        crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
      },
    },
    {
      label: "crop change",
      previous: {
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      },
      next: {
        fit: "cover",
        crop: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
      },
      change: {
        fit: "cover",
        crop: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
      },
    },
    {
      label: "crop removal",
      previous: {
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      },
      next: { fit: "cover" },
      change: { fit: "cover", crop: null },
    },
  ]

  for (const row of transitions) {
    it(`path-copies only source and scene for ${row.label}`, () => {
      const previous = acceptedUnifiedLayoutRootFixtureV2(row.previous)
      const independent = acceptedUnifiedLayoutRootFixtureV2(row.next)
      const result =
        attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: imagePaintUnifiedLayoutChange5b(
            previous.root,
            row.change,
          ),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })

      expect(result.status, JSON.stringify(result.issues))
        .toBe("accepted-incremental")
      if (result.status !== "accepted-incremental") {
        throw new Error(
          `${row.label} blocked: ${JSON.stringify(result.issues)}`,
        )
      }
      expect(result.root).not.toBe(previous.root)
      expect(result.root.sourceState).not.toBe(previous.root.sourceState)
      expect(result.root.flowTree).toBe(previous.root.flowTree)
      expect(result.root.spatialState).toBe(previous.root.spatialState)
      expect(result.root.flowRegionProviderAuthority)
        .toBe(previous.root.flowRegionProviderAuthority)
      expect(result.root.lineTree).toBe(previous.root.lineTree)
      expect(result.root.authoredBoxSummary)
        .toBe(previous.root.authoredBoxSummary)
      expect(result.persistentScene)
        .not.toBe(previous.root.persistentScene)
      expect(result.root.fingerprint).not.toBe(previous.root.fingerprint)
      expect(result.root.sourceState.fingerprint)
        .not.toBe(previous.root.sourceState.fingerprint)
      expect(result.persistentScene.fingerprint)
        .not.toBe(previous.root.persistentScene.fingerprint)

      expect(result.dispositions.counts).toEqual({
        E: previous.root.lineTree.summary.lineCount,
        T: 0,
        R: 0,
        N: 0,
        removed: 0,
      })
      expect(result.dispositions.covers).toHaveLength(1)
      expect(result.dispositions.covers[0]).toMatchObject({
        disposition: "E",
        previousRange: {
          start: 0,
          end: previous.root.lineTree.summary.lineCount,
        },
        nextRange: {
          start: 0,
          end: previous.root.lineTree.summary.lineCount,
        },
        constantYDeltaLayoutUnit: null,
      })
      expect(result.incrementalCandidateWork).toMatchObject({
        evidence: { requestCount: 0 },
        flow: {
          visitedSourceItemCount: 1,
          visitedFlowAtomCount: 0,
          createdFlowTreeNodeCount: 0,
          completeTreeRebuildCount: 0,
          completeSemanticPassCount: 0,
          completeSuffixTraversalCount: 0,
        },
        spatial: {
          completeIndexRebuildCount: 0,
          completeIndexTraversalCount: 0,
        },
        layout: {
          recomputedLineCount: 0,
          completeSuffixTraversalCount: 0,
        },
        geometry: {
          reprojectedLineCount: 0,
          visitedFragmentCount: 0,
        },
        scene: {
          replacementChunkCount: 1,
        },
        deliveryPlan: {
          deliveryOperationCount: result.deliveryPlan.operations.length,
          retainCoverNodeCount:
            result.deliveryPlan.summary.retainedSubtreeCount,
        },
        atomicAcceptance: {
          attemptedRegistrationCount: 3,
          committedRegistrationCount: 3,
        },
        rootWrapperAllocationCount: 1,
        completeNextInputTraversalCount: 0,
        completeNextInputComparisonCount: 0,
        completeSceneTraversalCount: 0,
      })
      expect(result.incrementalCandidateWork.structuralReuseProof).toEqual({
        visitedLineTreeNodeCount: 2,
        selectedExactSubtreeNodeCount: 1,
        lineTreeWrapperAllocationCount: 0,
        completeLineTreeTraversalCount: 0,
      })
      expect(result.incrementalCandidateWork.layout).toMatchObject({
        recomputedLineCount: 0,
        proofNodeCount: 0,
        completeSuffixTraversalCount: 0,
      })
      expect(result.incrementalCandidateWork.stageWork.filter(
        (row) => row.stage === "layout-reconvergence",
      ).every((row) => row.count === 0)).toBe(true)
      expect(result.deliveryPlan.summary).toMatchObject({
        spliceOperationCount: 1,
        replacementChunkCount: 1,
      })
      expect(result.incrementalCandidateWork.observations).toEqual({
        estimatedCanonicalPayloadByteCount:
          result.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
        payloadObservationFingerprint:
          result.deliveryPlan.observations.payloadObservationFingerprint,
      })
      expect(result.incrementalCandidateWork.stageWork).not.toContainEqual(
        expect.objectContaining({
          unit: "estimated-canonical-payload-bytes",
        }),
      )
      expect(result.deliveryPlan.operations.some(
        (operation) => operation.kind === "splice-range",
      )).toBe(true)

      expect(result.root.sourceState.root)
        .toEqual(independent.root.sourceState.root)
      expect(result.root.sourceState.summary)
        .toEqual(independent.root.sourceState.summary)
      expect(result.persistentScene.root)
        .toEqual(independent.persistentScene.root)
      expect(result.persistentScene.summary)
        .toEqual(independent.persistentScene.summary)
      expect(deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
        result.root,
      )).toEqual(
        deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
          independent.root,
        ),
      )
      expect(inspectVNextTextBlockUnifiedLayoutRootV2(result.root).status)
        .toBe("valid")
      expect(inspectVNextTextBlockPersistentSceneV2(
        result.persistentScene,
      ).status).toBe("valid")
      expect(inspectVNextTextBlockUnifiedLayoutRootV2(
        previous.root,
      ).status).toBe("valid")
    })
  }

  it("visits only the changed image when its line also maps an unchanged hard break", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-image-text-break",
      fit: "contain",
    })
    const independent = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-image-text-break",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const result =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: previous.root,
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-incremental")
    if (result.status !== "accepted-incremental") return
    expect(result.incrementalCandidateWork.flow.visitedSourceItemCount)
      .toBe(1)
    expect(result.persistentScene.work.visitedSourceItemCount).toBe(1)
    expect(result.persistentScene.root).toEqual(
      independent.persistentScene.root,
    )
  })

  it("copies bounded source and scene paths while retaining untouched 9-line subtrees", () => {
    const previous = acceptedRepeatedUnifiedLayoutRootFixture5b(9)
    const result =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: previous.root,
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(result.status, JSON.stringify(result.issues))
      .toBe("accepted-incremental")
    if (result.status !== "accepted-incremental") return
    expect(result.root.sourceState.work).toMatchObject({
      constructionKind: "image-paint-path-copy",
      completeBuildCount: 0,
      createdItemCount: 1,
      createdLeafCount: 1,
      completeSuffixTraversalCount: 0,
    })
    expect(result.root.sourceState.work.createdNodeCount)
      .toBeGreaterThan(1)
    expect(result.persistentScene.work).toMatchObject({
      completeSceneProjectionCount: 0,
      visitedLineCount: 1,
      emittedChunkCount: 1,
      createdLeafCount: 1,
      incrementalCopiedNodeCount: 2,
      completeLineTreeTraversalCount: 0,
      completeSceneTraversalCount: 0,
    })
    expect(result.persistentScene.summary).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(result.persistentScene.payloadObservation
      .estimatedCanonicalPayloadByteCount).toBeGreaterThan(0)
    expect(result.persistentScene.root).toHaveProperty("payloadObservation")
    expect(result.deliveryPlan.summary).toMatchObject({
      retainOperationCount: 1,
      spliceOperationCount: 1,
      replacementChunkCount: 1,
    })
    expect(result.deliveryPlan.summary.retainedSubtreeCount)
      .toBeGreaterThan(0)
    expect(result.deliveryPlan.observations.estimatedCanonicalPayloadByteCount)
      .toBeGreaterThan(0)
    expect(result.incrementalCandidateWork.observations).toEqual({
      estimatedCanonicalPayloadByteCount:
        result.deliveryPlan.observations.estimatedCanonicalPayloadByteCount,
      payloadObservationFingerprint:
        result.deliveryPlan.observations.payloadObservationFingerprint,
    })
    expect(result.incrementalCandidateWork.layout.recomputedLineCount)
      .toBe(0)
    expect(result.incrementalCandidateWork.geometry.reprojectedLineCount)
      .toBe(0)
    expect(result.incrementalCandidateWork.completeSceneTraversalCount)
      .toBe(0)
  })

  it("runs the delivery builder verification gate exactly once", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({ fit: "contain" })
    let verificationCount = 0
    setVNextTextBlockSceneDeliveryPlanVerificationObserverForTestInternalV2(
      () => {
        verificationCount += 1
      },
    )
    try {
      const result =
        attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: imagePaintUnifiedLayoutChange5b(previous.root, {
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
      expect(result.status, JSON.stringify(result.issues))
        .toBe("accepted-incremental")
    } finally {
      setVNextTextBlockSceneDeliveryPlanVerificationObserverForTestInternalV2(
        null,
      )
    }
    expect(verificationCount).toBe(1)
  })

  it("supports consecutive paint transitions without reaching for complete material", () => {
    const initial = acceptedUnifiedLayoutRootFixtureV2({
      fit: "contain",
    })
    const first =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: initial.root,
        change: imagePaintUnifiedLayoutChange5b(initial.root, {
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    if (first.status !== "accepted-incremental") {
      throw new Error(`first paint blocked: ${JSON.stringify(first.issues)}`)
    }
    const second =
      attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
        previousRoot: first.root,
        change: imagePaintUnifiedLayoutChange5b(first.root, {
          fit: "cover",
          crop: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    const independent = acceptedUnifiedLayoutRootFixtureV2({
      fit: "cover",
      crop: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
    })

    expect(second.status, JSON.stringify(second.issues))
      .toBe("accepted-incremental")
    if (second.status !== "accepted-incremental") return
    expect(second.root.flowTree).toBe(initial.root.flowTree)
    expect(second.root.spatialState).toBe(initial.root.spatialState)
    expect(second.root.lineTree).toBe(initial.root.lineTree)
    expect(second.root.sourceState.root)
      .toEqual(independent.root.sourceState.root)
    expect(second.persistentScene.root)
      .toEqual(independent.persistentScene.root)
    expect(second.incrementalCandidateWork.completeNextInputTraversalCount)
      .toBe(0)
    expect(second.incrementalCandidateWork.completeSceneTraversalCount)
      .toBe(0)
  })

  it("keeps source and Scene authority probes bounded across 32 sequential paint transitions", () => {
    const initial = acceptedUnifiedLayoutRootFixtureV2({
      fit: "contain",
    })
    let previousRoot = initial.root
    const perTransitionMaximumIndexProbeCount: number[] = []
    const perTransitionIndexLookupCount: number[] = []
    const perTransitionHistoricalSceneProbeCount: number[] = []
    let lastCrop = {
      x: 0,
      y: 0,
      width: 0.5,
      height: 1,
    }

    for (let revision = 0; revision < 32; revision += 1) {
      const indexProbeCounts: number[] = []
      const historicalSceneProbeCounts: number[] = []
      setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
        (observation) => {
          indexProbeCounts.push(observation.indexProbeCount)
        },
      )
      setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2(
        (event) => {
          if (event.kind === "historical-node-set-probe") {
            historicalSceneProbeCounts.push(event.probeCount)
          }
        },
      )
      lastCrop = revision % 2 === 0
        ? { x: 0, y: 0, width: 0.5, height: 1 }
        : { x: 0.2, y: 0.1, width: 0.6, height: 0.8 }
      const result = (() => {
        try {
          return attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
            previousRoot,
            change: imagePaintUnifiedLayoutChange5b(previousRoot, {
              fit: "cover",
              crop: lastCrop,
            }),
            workPolicy: ROOT_V2_TEST_WORK_POLICY,
          })
        } finally {
          setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockPersistentSceneHotPathObserverForTestInternalV2(null)
        }
      })()
      expect(result.status, JSON.stringify(result.issues))
        .toBe("accepted-incremental")
      if (result.status !== "accepted-incremental") return
      previousRoot = result.root
      perTransitionMaximumIndexProbeCount.push(
        Math.max(0, ...indexProbeCounts),
      )
      perTransitionIndexLookupCount.push(indexProbeCounts.length)
      perTransitionHistoricalSceneProbeCount.push(
        historicalSceneProbeCounts.reduce(
          (sum, probeCount) => sum + probeCount,
          0,
        ),
      )
      expect(result.incrementalCandidateWork.completeNextInputTraversalCount)
        .toBe(0)
      expect(result.incrementalCandidateWork.completeSceneTraversalCount)
        .toBe(0)
    }

    const independent = acceptedUnifiedLayoutRootFixtureV2({
      fit: "cover",
      crop: lastCrop,
    })
    expect(previousRoot.sourceState.root)
      .toEqual(independent.root.sourceState.root)
    expect(previousRoot.persistentScene.root)
      .toEqual(independent.root.persistentScene.root)
    expect(new Set(perTransitionMaximumIndexProbeCount)).toEqual(new Set([1]))
    expect(perTransitionIndexLookupCount)
      .toEqual(Array.from({ length: 32 }, () => 1))
    expect(perTransitionHistoricalSceneProbeCount)
      .toEqual(Array.from({ length: 32 }, () => 0))
  })

  it("retains the exact line tree for first, middle, and last image paint", () => {
    for (const row of [
      {
        lineCount: 3,
        selectedOrdinals: [0, 1, 2],
        sceneLookupNodeCount: 2,
        deliverySceneVisitCounts: [26, 42, 26],
      },
      {
        lineCount: 9,
        selectedOrdinals: [0, 4, 8],
        sceneLookupNodeCount: 3,
        deliverySceneVisitCounts: [44, 62, 50],
      },
    ]) {
      const previous = acceptedRepeatedUnifiedLayoutRootFixture5b(row.lineCount)
      const inlineIds: string[] = []
      for (
        let offset = 0;
        offset < previous.root.sourceState.summary.renderedUtf16Length;
        offset += 1
      ) {
        const lookup = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
          sourceState: previous.root.sourceState,
          renderedUtf16Offset: offset,
        })
        if (
          lookup.status === "found"
          && lookup.item.kind === "inline-image"
          && !inlineIds.includes(lookup.item.inlineId)
        ) {
          inlineIds.push(lookup.item.inlineId)
        }
      }
      expect(inlineIds).toHaveLength(row.lineCount)

      for (const [index, ordinal] of row.selectedOrdinals.entries()) {
        const inlineId = inlineIds[ordinal]
        const paint = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
          previousRoot: previous.root,
          change: imagePaintUnifiedLayoutChange5b(previous.root, {
            inlineId,
            fit: "cover",
            crop: { x: 0, y: 0, width: 0.5, height: 1 },
          }),
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        })
        expect(paint.status, JSON.stringify(paint.issues))
          .toBe("accepted-incremental")
        if (paint.status !== "accepted-incremental") continue
        expect(paint.root.lineTree).toBe(previous.root.lineTree)
        expect(paint.incrementalCandidateWork.structuralReuseProof).toEqual({
          visitedLineTreeNodeCount: 2,
          selectedExactSubtreeNodeCount: 1,
          lineTreeWrapperAllocationCount: 0,
          completeLineTreeTraversalCount: 0,
        })
        expect(paint.incrementalCandidateWork.scene).toMatchObject({
          visitedLineTreeNodeCount: row.sceneLookupNodeCount,
          visitedSceneTreeNodeCount: row.sceneLookupNodeCount,
        })
        expect(paint.incrementalCandidateWork.deliveryPlan).toMatchObject({
          visitedSceneTreeNodeCount: row.deliverySceneVisitCounts[index],
        })
        expect(paint.incrementalCandidateWork.layout).toMatchObject({
          recomputedLineCount: 0,
          proofNodeCount: 0,
          completeSuffixTraversalCount: 0,
        })
        expect(paint.incrementalCandidateWork.stageWork.filter(
          (stageRow) => stageRow.stage === "layout-reconvergence",
        ).every((stageRow) => stageRow.count === 0)).toBe(true)
      }
    }
  }, 60_000)
})
