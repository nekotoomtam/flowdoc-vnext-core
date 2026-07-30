import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionProducerResponseV1,
  VNextTextBlockTransitionProducerRuntimeIdentityV1,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV1.js"
import {
  inspectVNextTextBlockIncrementalFlowTreeV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  inspectVNextTextBlockPersistentLayoutLineTreeV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  inspectVNextTextBlockPersistentSceneV2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1,
  createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
  inspectVNextTextBlockUnifiedLayoutFallbackRequestInternalV1,
  setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutFallbackV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV1,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1,
  deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1,
  inspectVNextTextBlockUnifiedLayoutTransitionEvidenceInternalV1,
  inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  inspectVNextTextBlockUnifiedSpatialStateV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
  ROOT_V2_TEST_WORK_POLICY,
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

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function changeBase(root: VNextTextBlockUnifiedLayoutRootV2) {
  return {
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
  }
}

function noOpChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutChangeV1 {
  return deepFreeze({
    ...changeBase(root),
    kind: "no-op" as const,
  })
}

function textInsertionChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutChangeV1 {
  return deepFreeze({
    ...changeBase(root),
    kind: "text-insertion" as const,
    atRenderedUtf16: 1,
    insertedText: "B",
    insertedSource: {
      lineageId: "lineage-inserted",
      sourceFingerprint: "source-inserted",
      provenanceFingerprint: "provenance-inserted",
    },
    measurementStyleKey: "measurement-style-1",
    effectiveShapingStyleKey: "shaping-style-1",
  })
}

function imagePaintChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const lookup = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
    sourceState: root.sourceState,
    renderedUtf16Offset: 1,
  })
  if (lookup.status !== "found" || lookup.item.kind !== "inline-image") {
    throw new Error("image fixture source item missing")
  }
  return deepFreeze({
    ...changeBase(root),
    kind: "image-paint-fact-change" as const,
    inlineId: lookup.item.inlineId,
    expectedImageSourceFingerprint: lookup.item.sourceFingerprint,
    expectedImageDependencyFingerprint:
      lookup.item.layoutDependencyFingerprint,
    nextFit: "cover" as const,
    nextCrop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
  })
}

function resolvedFieldChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const lookup = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
    sourceState: root.sourceState,
    renderedUtf16Offset: 0,
  })
  if (lookup.status !== "found" || lookup.item.kind !== "resolved-field") {
    throw new Error("resolved-field fixture source item missing")
  }
  return deepFreeze({
    ...changeBase(root),
    kind: "resolved-field-rendered-value-change" as const,
    inlineId: lookup.item.inlineId,
    fieldKey: lookup.item.fieldKey,
    expectedPreviousRenderedValueFingerprint:
      lookup.item.contentFingerprint,
    nextRenderedText: "FlowDoc",
    nextSource: {
      lineageId: lookup.item.lineageId,
      sourceFingerprint: "field-source-next",
      provenanceFingerprint: "field-provenance-next",
    },
  })
}

const fallbackReason = deepFreeze({
  code: "stage-unit-limit-exceeded" as const,
  stage: "source-flow" as const,
  unit: "source-items" as const,
  effectiveLimit: 1,
  attemptedWork: 2,
})

function makeFallback(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
) {
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: root,
    change,
    workPolicy: ROOT_V2_TEST_WORK_POLICY,
  })
  if (bound.status !== "accepted") {
    throw new Error(`change binding blocked: ${JSON.stringify(bound.issues)}`)
  }
  return createVNextTextBlockUnifiedLayoutFallbackRequestInternalV1({
    previousRoot: root,
    change,
    workPolicy: ROOT_V2_TEST_WORK_POLICY,
    mode: "deterministic-work-limit-exceeded",
    reason: fallbackReason,
    skippedOrFailedStage: "source-flow",
    incrementalCandidateWork: bound.incrementalCandidateWork,
  })
}

const runtimeFacts = {
  runtime: "node-native-mr1-range" as const,
  engineBuildFingerprint: "engine-build-1",
  fontBackendFingerprint: "font-backend-1",
}

function producerResponse(
  request: Extract<
    ReturnType<
      typeof createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1
    >,
    { status: "required" }
  >["request"],
  runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV1,
  overrides: Partial<VNextTextBlockTransitionProducerResponseV1> = {},
): VNextTextBlockTransitionProducerResponseV1 {
  const facts = {
    source: "vnext-text-block-transition-producer-response-v1" as const,
    contractVersion: 1 as const,
    requestFingerprint: request.fingerprint,
    runtimeIdentity,
    previousCoverage: request.previousSourceRange,
    nextCoverage: request.nextSourceRange,
    shapingRuns: deepFreeze([{
      shapingRunId: "bounded-shaping-run-1",
      renderStartOffset: request.nextSourceRange.startRenderedUtf16,
      renderEndOffset: request.nextSourceRange.endRenderedUtf16,
      text: "B",
      styleKey: "shaping-style-1",
      fontFaceId: "font-face-1",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "000000",
      direction: "ltr" as const,
      baselineShiftLayoutUnit: 0 as const,
      features: [],
      clusters: [{
        index: 0,
        renderStartOffset: request.nextSourceRange.startRenderedUtf16,
        renderEndOffset: request.nextSourceRange.endRenderedUtf16,
        advanceLayoutUnit: 6_000_000,
      }],
    }]),
    breakOffsets: Object.freeze([
      request.nextSourceRange.startRenderedUtf16,
      request.nextSourceRange.endRenderedUtf16,
    ]),
    sourceTopologyFingerprint: "bounded-source-topology-1",
    work: {
      requestedAtomCount: 1,
      requestedClusterCount: 2,
      consumedAtomCount: 1,
      consumedClusterCount: 2,
      unusedCoverageRenderedUtf16Length: 0,
      visitedEvidenceNodeCount: 1,
      completeNextInputTraversalCount: 0 as const,
      completeNextInputComparisonCount: 0 as const,
    },
    contracts: {
      producerSelectsDirtyRange: false as const,
      producerSelectsLinesOrBands: false as const,
      producerSelectsReconvergenceOrReuse: false as const,
      producerSelectsFallback: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
    ...overrides,
  }
  return deepFreeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

describe("Phase 5B deferred Root V2 fallback protocol", () => {
  it("returns a scalar-only request, then accepts independently supplied complete material", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const change = noOpChange(previous.root)
    const attempt = makeFallback(previous.root, change)

    expect(attempt).toMatchObject({
      status: "fallback-required",
      root: null,
      persistentScene: null,
      deliveryPlan: null,
      incrementalCandidateWork: {
        completeNextInputTraversalCount: 0,
        completeNextInputComparisonCount: 0,
        completeSceneTraversalCount: 0,
      },
    })
    if (attempt.status !== "fallback-required") {
      throw new Error("expected fallback request")
    }
    expect(attempt).not.toHaveProperty("completeMaterial")
    expect(attempt.fallbackRequest).not.toHaveProperty("candidateTree")
    expect(attempt.fallbackRequest).not.toHaveProperty("candidateRoot")
    expect(inspectVNextTextBlockUnifiedLayoutFallbackRequestInternalV1(
      attempt.fallbackRequest,
    )).toMatchObject({ status: "valid" })

    const completed =
      completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
        request: attempt.fallbackRequest,
        completeMaterial: unifiedLayoutRootBuildInputFixtureV2(),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(completed).toMatchObject({
      status: "accepted-complete-fallback",
      deliveryPlan: null,
      completeFallbackWork: {
        completeRootV2BuildCount: 1,
        completeSceneV2BuildCount: 1,
        completeDeliveryCount: 0,
      },
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    if (completed.status !== "accepted-complete-fallback") {
      throw new Error(`complete fallback blocked: ${JSON.stringify(completed.issues)}`)
    }
    expect(completed.root.constructionKind).toBe("complete-fallback")
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(completed.root).status)
      .toBe("valid")
    expect(completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
      request: attempt.fallbackRequest,
      completeMaterial: unifiedLayoutRootBuildInputFixtureV2(),
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "fallback-request-authority-mismatch" }],
    })
  })

  it("matches every target-binding field for a paint-only fallback", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const change = imagePaintChange(previous.root)
    const attempt = makeFallback(previous.root, change)
    if (attempt.status !== "fallback-required") {
      throw new Error("expected paint fallback request")
    }

    const completed =
      completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
        request: attempt.fallbackRequest,
        completeMaterial: unifiedLayoutRootBuildInputFixtureV2({
          fit: "cover",
          crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(completed.status).toBe("accepted-complete-fallback")
    if (completed.status !== "accepted-complete-fallback") return
    expect(deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
      completed.root,
    )).toEqual(attempt.fallbackRequest.expectedTargetBinding)
  })

  it("discards an independently prepared target mismatch without registering any graph node", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const attempt = makeFallback(
      previous.root,
      imagePaintChange(previous.root),
    )
    if (attempt.status !== "fallback-required") {
      throw new Error("expected paint fallback request")
    }
    let observed: VNextTextBlockUnifiedLayoutRootV2 | null = null
    setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1(
      (candidate) => {
        observed = candidate
        expect(Reflect.set(candidate, "fingerprint", "poisoned")).toBe(false)
      },
    )
    const completed =
      completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
        request: attempt.fallbackRequest,
        completeMaterial: unifiedLayoutRootBuildInputFixtureV2({
          fit: "contain",
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1(
      null,
    )

    expect(completed).toMatchObject({
      status: "blocked",
      root: null,
      persistentScene: null,
      issues: [{ code: "fallback-target-binding-failed" }],
    })
    expect(observed).not.toBeNull()
    if (observed == null) return
    const candidate = observed as VNextTextBlockUnifiedLayoutRootV2
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(candidate).status)
      .toBe("invalid")
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateV1(
      candidate.sourceState,
    ).status).toBe("invalid")
    expect(inspectVNextTextBlockIncrementalFlowTreeV1(
      candidate.flowTree,
    ).status).toBe("invalid")
    expect(inspectVNextTextBlockUnifiedSpatialStateV1(
      candidate.spatialState,
    ).status).toBe("invalid")
    expect(inspectVNextTextBlockPersistentLayoutLineTreeV1(
      candidate.lineTree,
    ).status).toBe("invalid")
    expect(inspectVNextTextBlockPersistentSceneV2(
      candidate.persistentScene,
    ).status).toBe("invalid")

    const recovered =
      completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
        request: attempt.fallbackRequest,
        completeMaterial: unifiedLayoutRootBuildInputFixtureV2({
          fit: "cover",
          crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
        }),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    const independent = acceptedUnifiedLayoutRootFixtureV2({
      fit: "cover",
      crop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
    })
    expect(recovered.status).toBe("accepted-complete-fallback")
    if (recovered.status !== "accepted-complete-fallback") return
    expect(deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
      recovered.root,
    )).toEqual(
      deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
        independent.root,
      ),
    )
    expect(recovered.persistentScene.fingerprint)
      .toBe(independent.persistentScene.fingerprint)
  })

  it("blocks cloned requests and cloned policies closed", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2()
    const attempt = makeFallback(previous.root, noOpChange(previous.root))
    if (attempt.status !== "fallback-required") {
      throw new Error("expected fallback request")
    }
    const clonedRequest = structuredClone(attempt.fallbackRequest)
    const clonedPolicy = structuredClone(ROOT_V2_TEST_WORK_POLICY)

    expect(completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
      request: clonedRequest,
      completeMaterial: unifiedLayoutRootBuildInputFixtureV2(),
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "fallback-request-authority-mismatch" }],
    })
    expect(completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
      request: attempt.fallbackRequest,
      completeMaterial: unifiedLayoutRootBuildInputFixtureV2(),
      workPolicy: clonedPolicy,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "fallback-request-authority-mismatch" }],
    })
  })
})

describe("Phase 5B bounded transition evidence authority", () => {
  it("creates evidence only for producer-dependent change families", () => {
    const textRoot = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-only",
    }).root
    const imageRoot = acceptedUnifiedLayoutRootFixtureV2().root
    const fieldRoot = acceptedUnifiedLayoutRootFixtureV2({
      content: "field-image-page-break",
    }).root
    const insertion =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot: textRoot,
        change: textInsertionChange(textRoot),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    expect(insertion).toMatchObject({
      status: "required",
      incrementalCandidateWork: {
        completeNextInputTraversalCount: 0,
        completeNextInputComparisonCount: 0,
        flow: { completeSuffixTraversalCount: 0 },
        layout: { completeSuffixTraversalCount: 0 },
      },
    })
    expect(
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot: fieldRoot,
        change: resolvedFieldChange(fieldRoot),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      }),
    ).toMatchObject({
      status: "required",
      request: {
        previousSourceRange: {
          startRenderedUtf16: 0,
          endRenderedUtf16: 1,
        },
        nextSourceRange: {
          startRenderedUtf16: 0,
          endRenderedUtf16: 7,
        },
      },
      incrementalCandidateWork: {
        completeNextInputTraversalCount: 0,
        flow: { completeSuffixTraversalCount: 0 },
      },
    })

    for (const change of [
      noOpChange(imageRoot),
      imagePaintChange(imageRoot),
      deepFreeze({
        ...changeBase(imageRoot),
        kind: "image-frame-resize" as const,
        inlineId: "image-1",
        expectedImageSourceFingerprint: "source",
        expectedImageDependencyFingerprint: "dependency",
        nextWidth: { value: 30, unit: "pt" as const },
        nextHeight: { value: 20, unit: "pt" as const },
      }),
      deepFreeze({
        ...changeBase(imageRoot),
        kind: "exclusion-insertion" as const,
        entry: {
          objectId: "shape-1",
          geometryOwnerFingerprint: "geometry-owner-1",
          xLayoutUnit: 10,
          yLayoutUnit: 20,
          widthLayoutUnit: 30,
          heightLayoutUnit: 40,
          clearance: {
            topLayoutUnit: 0,
            rightLayoutUnit: 0,
            bottomLayoutUnit: 0,
            leftLayoutUnit: 0,
          },
          wrapPolicy: "rectangular-exclusion" as const,
        },
      }),
    ] satisfies readonly VNextTextBlockUnifiedLayoutChangeV1[]) {
      expect(
        createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
          previousRoot: imageRoot,
          change,
          workPolicy: ROOT_V2_TEST_WORK_POLICY,
        }).status,
      ).toBe("not-required")
    }
  })

  it("binds request authority to the exact Root/change tuple and Root-owned policy", () => {
    const first = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-only",
    }).root
    const second = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-only",
      documentId: "document-2",
    }).root
    const change = textInsertionChange(first)
    const result =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot: first,
        change,
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    if (result.status !== "required") {
      throw new Error("expected evidence request")
    }

    expect(inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      request: result.request,
      previousRoot: first,
      change,
    }).status).toBe("valid")
    expect(inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      request: structuredClone(result.request),
      previousRoot: first,
      change,
    }).status).toBe("invalid")
    expect(inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      request: result.request,
      previousRoot: second,
      change,
    }).status).toBe("invalid")
    expect(inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      request: result.request,
      previousRoot: first,
      change: textInsertionChange(first),
    }).status).toBe("invalid")
    expect(
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot: first,
        change,
        workPolicy: structuredClone(ROOT_V2_TEST_WORK_POLICY),
      }),
    ).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-work-policy" }],
    })
  })

  it("accepts exact bounded evidence and blocks widened, nested-extra, wrong-runtime, and digest-colliding responses", () => {
    const root = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-only",
    }).root
    const change = textInsertionChange(root)
    const requestResult =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
        previousRoot: root,
        change,
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })
    if (requestResult.status !== "required") {
      throw new Error("expected evidence request")
    }
    const runtime =
      createVNextTextBlockTransitionProducerRuntimeIdentityInternalV1(
        {
          ...runtimeFacts,
          unitPolicyFingerprint:
            requestResult.request.layoutUnitPolicyFingerprint,
          fontStyleUnitDependencyFingerprint:
            requestResult.request.fontStyleUnitDependencyFingerprint,
          producerRuntimeRequirementFingerprint:
            requestResult.request.producerRuntimeRequirementFingerprint,
        },
      )
    const exact = producerResponse(requestResult.request, runtime)
    const accepted =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1({
        request: requestResult.request,
        previousRoot: root,
        change,
        producerRuntimeIdentity: runtime,
        response: exact,
      })
    expect(accepted.status).toBe("accepted")
    if (accepted.status === "accepted") {
      expect(inspectVNextTextBlockUnifiedLayoutTransitionEvidenceInternalV1(
        accepted.evidence,
      )).toMatchObject({
        status: "valid",
        requestFingerprint: requestResult.request.fingerprint,
      })
    }

    const widened = producerResponse(requestResult.request, runtime, {
      previousCoverage: {
        startRenderedUtf16: 0,
        endRenderedUtf16: 1,
      },
    })
    const nestedExtra = producerResponse(requestResult.request, runtime, {
      work: {
        ...exact.work,
        callerSelectedDirtyRangeCount: 1,
      } as VNextTextBlockTransitionProducerResponseV1["work"],
    })
    const collisionFacts = {
      ...exact,
      nextCoverage: {
        startRenderedUtf16:
          requestResult.request.nextSourceRange.startRenderedUtf16,
        endRenderedUtf16:
          requestResult.request.nextSourceRange.endRenderedUtf16 - 1,
      },
    }
    const digestCollision = deepFreeze({
      ...collisionFacts,
      fingerprint: exact.fingerprint,
    })
    const unregisteredRuntime = deepFreeze(structuredClone(runtime))
    const wrongRegisteredRuntime =
      createVNextTextBlockTransitionProducerRuntimeIdentityInternalV1({
        ...runtimeFacts,
        unitPolicyFingerprint:
          requestResult.request.layoutUnitPolicyFingerprint,
        fontStyleUnitDependencyFingerprint:
          requestResult.request.fontStyleUnitDependencyFingerprint,
        producerRuntimeRequirementFingerprint: "wrong-runtime-requirement",
      })

    for (const row of [
      {
        response: widened,
        producerRuntimeIdentity: runtime,
      },
      {
        response: nestedExtra,
        producerRuntimeIdentity: runtime,
      },
      {
        response: digestCollision,
        producerRuntimeIdentity: runtime,
      },
      {
        response: producerResponse(
          requestResult.request,
          unregisteredRuntime,
        ),
        producerRuntimeIdentity: unregisteredRuntime,
      },
      {
        response: producerResponse(
          requestResult.request,
          wrongRegisteredRuntime,
        ),
        producerRuntimeIdentity: wrongRegisteredRuntime,
      },
    ]) {
      expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1({
        request: requestResult.request,
        previousRoot: root,
        change,
        producerRuntimeIdentity: row.producerRuntimeIdentity,
        response: row.response,
      })).toMatchObject({
        status: "blocked",
        evidence: null,
      })
    }
  })
})
