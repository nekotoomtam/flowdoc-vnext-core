import { afterEach, describe, expect, it, vi } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { VNextAuthoredBoxPlanV1 } from "../src/renderer/authoredBoxContractV1.js"
import type { InlineImageV4Target } from "../src/schema/documentV4ImageTarget.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import {
  createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1,
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import {
  deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import type {
  VNextTextBlockStageWorkCountV1,
  VNextTextBlockExpectedTargetBindingV1,
  VNextTextBlockUnifiedLayoutStageUnitV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  effectiveStageLimitV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL,
  type VNextTextBlockStageLimitV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.freeze(value)
}

const changeBase = {
  source: "vnext-text-block-unified-layout-change-v1",
  contractVersion: 1,
  documentId: "document-1",
  sectionId: "section-1",
  textBlockId: "text-block-1",
  expectedPreviousRootFingerprint: "root-fingerprint",
  expectedPreviousSourceFingerprint: "source-fingerprint",
} as const

const insertedSource = {
  lineageId: "lineage-inserted",
  sourceFingerprint: "source-inserted",
  provenanceFingerprint: "provenance-inserted",
} as const

function targetBinding(
  overrides: Partial<VNextTextBlockExpectedTargetBindingV1> = {},
): VNextTextBlockExpectedTargetBindingV1 {
  return deepFreeze({
    semanticFingerprint: "semantic-previous",
    renderedContentFingerprint: "content-previous",
    sourceFingerprint: "source-previous",
    provenanceFingerprint: "provenance-previous",
    paintFingerprint: "paint-previous",
    layoutDependencyFingerprint: "layout-previous",
    authoredBoxPlanFingerprint: "authored-box-previous",
    spatialEntrySetFingerprint: "spatial-previous",
    fingerprint: "target-binding-previous",
    ...overrides,
  })
}

const inlineImage = {
  id: "inline-image-1",
  type: "inline-image",
  source: {
    kind: "asset-ref",
    assetId: "asset-1",
  },
  accessibility: {
    kind: "described",
    altText: "Chart",
  },
  frame: {
    width: { value: 24, unit: "pt" },
    height: { value: 18, unit: "pt" },
    fit: "contain",
  },
  verticalAlign: "baseline",
} as const satisfies InlineImageV4Target

const authoredBoxPlan = {
  source: "vnext-authored-box-contract",
  contractVersion: 1,
  kind: "authored-box-plan",
  ownerNodeId: "text-block-1",
  ownerNodeType: "text-block",
  hasAuthoredBox: true,
  fillColor: null,
  paddingPt: { top: 1, right: 2, bottom: 3, left: 4 },
  border: {
    top: { style: "none", widthPt: 0, color: "000000" },
    right: { style: "none", widthPt: 0, color: "000000" },
    bottom: { style: "none", widthPt: 0, color: "000000" },
    left: { style: "none", widthPt: 0, color: "000000" },
  },
  outerWidthPt: 120,
  contentInsetPt: { top: 1, right: 2, bottom: 3, left: 4 },
  contentWidthPt: 114,
  pageSplitPolicy: "open-continuation-edges",
  styleFingerprint: "box-style-fingerprint",
  fingerprint: "box-plan-next-fingerprint",
} as const satisfies VNextAuthoredBoxPlanV1

const exclusionEntry = {
  objectId: "shape-1",
  geometryOwnerFingerprint: "geometry-owner-1",
  xLayoutUnit: 10,
  yLayoutUnit: 20,
  widthLayoutUnit: 30,
  heightLayoutUnit: 40,
  clearance: {
    topLayoutUnit: 1,
    rightLayoutUnit: 2,
    bottomLayoutUnit: 3,
    leftLayoutUnit: 4,
  },
  wrapPolicy: "rectangular-exclusion",
} as const

const compileCheckedChanges = [
  {
    ...changeBase,
    kind: "no-op",
  },
  {
    ...changeBase,
    kind: "text-insertion",
    atRenderedUtf16: 3,
    insertedText: "ก",
    insertedSource,
    measurementStyleKey: "measurement-style-1",
    effectiveShapingStyleKey: "shaping-style-1",
  },
  {
    ...changeBase,
    kind: "text-deletion",
    removedRange: { startRenderedUtf16: 2, endRenderedUtf16: 5 },
    expectedRemovedContentFingerprint: "removed-content-1",
    expectedRemovedSourceFingerprint: "removed-source-1",
    expectedRemovedProvenanceFingerprint: "removed-provenance-1",
  },
  {
    ...changeBase,
    kind: "text-replacement",
    removedRange: { startRenderedUtf16: 2, endRenderedUtf16: 5 },
    expectedRemovedContentFingerprint: "removed-content-1",
    expectedRemovedSourceFingerprint: "removed-source-1",
    expectedRemovedProvenanceFingerprint: "removed-provenance-1",
    insertedText: "ใหม่",
    insertedSource,
    measurementStyleKey: "measurement-style-1",
    effectiveShapingStyleKey: "shaping-style-1",
  },
  {
    ...changeBase,
    kind: "resolved-field-rendered-value-change",
    inlineId: "field-inline-1",
    fieldKey: "customer-name",
    expectedPreviousRenderedValueFingerprint: "field-value-previous",
    nextRenderedText: "FlowDoc",
    nextSource: insertedSource,
  },
  {
    ...changeBase,
    kind: "supported-style-change",
    range: { startRenderedUtf16: 1, endRenderedUtf16: 4 },
    expectedPreviousStyleFingerprint: "style-previous",
    expectedPreviousStyleProvenanceFingerprint: "style-provenance-previous",
    nextStyle: { fontWeight: "bold", textColor: "112233" },
    nextStyleFingerprint: "style-next",
    nextStyleProvenanceFingerprint: "style-provenance-next",
  },
  {
    ...changeBase,
    kind: "inline-image-insertion",
    atRenderedUtf16: 4,
    inlineImage,
    resolvedAssetId: "asset-1",
    insertedSource,
  },
  {
    ...changeBase,
    kind: "inline-image-deletion",
    inlineId: "inline-image-1",
    expectedRenderedUtf16: 4,
    expectedImageSourceFingerprint: "image-source-previous",
    expectedImageDependencyFingerprint: "image-dependency-previous",
  },
  {
    ...changeBase,
    kind: "inline-image-movement",
    inlineId: "inline-image-1",
    fromRenderedUtf16: 4,
    toRenderedUtf16AfterRemoval: 9,
    expectedImageSourceFingerprint: "image-source-previous",
    expectedImageDependencyFingerprint: "image-dependency-previous",
  },
  {
    ...changeBase,
    kind: "image-frame-resize",
    inlineId: "inline-image-1",
    expectedImageSourceFingerprint: "image-source-previous",
    expectedImageDependencyFingerprint: "image-dependency-previous",
    nextWidth: { value: 30, unit: "pt" },
    nextHeight: { value: 20, unit: "pt" },
  },
  {
    ...changeBase,
    kind: "image-vertical-alignment-change",
    inlineId: "inline-image-1",
    expectedImageSourceFingerprint: "image-source-previous",
    expectedImageDependencyFingerprint: "image-dependency-previous",
    nextVerticalAlign: "middle",
  },
  {
    ...changeBase,
    kind: "image-paint-fact-change",
    inlineId: "inline-image-1",
    expectedImageSourceFingerprint: "image-source-previous",
    expectedImageDependencyFingerprint: "image-dependency-previous",
    nextFit: "cover",
    nextCrop: { x: 0.1, y: 0.2, width: 0.7, height: 0.6 },
  },
  {
    ...changeBase,
    kind: "exclusion-insertion",
    entry: exclusionEntry,
  },
  {
    ...changeBase,
    kind: "exclusion-deletion",
    objectId: "shape-1",
    expectedGeometryOwnerFingerprint: "geometry-owner-1",
    expectedEntryFingerprint: "entry-previous",
  },
  {
    ...changeBase,
    kind: "exclusion-movement",
    objectId: "shape-1",
    expectedGeometryOwnerFingerprint: "geometry-owner-1",
    expectedEntryFingerprint: "entry-previous",
    nextXLayoutUnit: 50,
    nextYLayoutUnit: 60,
  },
  {
    ...changeBase,
    kind: "exclusion-resize",
    objectId: "shape-1",
    expectedGeometryOwnerFingerprint: "geometry-owner-1",
    expectedEntryFingerprint: "entry-previous",
    nextWidthLayoutUnit: 70,
    nextHeightLayoutUnit: 80,
  },
  {
    ...changeBase,
    kind: "authored-box-width-inset-change",
    expectedAuthoredBoxPlanFingerprint: "box-plan-previous",
    nextAuthoredBoxPlan: authoredBoxPlan,
  },
] as const satisfies readonly VNextTextBlockUnifiedLayoutChangeV1[]

function frozenChanges(): readonly VNextTextBlockUnifiedLayoutChangeV1[] {
  return compileCheckedChanges.map((change) => deepFreeze(structuredClone(change)))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Phase 5B closed transition contracts", () => {
  it("derives the closed Core effect-class matrix from frozen target bindings", () => {
    const previousTargetBinding = targetBinding()
    const rows = [
      {
        label: "every target-binding fact equal",
        expectedTargetBinding: targetBinding(),
        requiresGeometryRecomputation: false,
        effectClass: "true-no-op",
        semanticIdentityChanged: false,
      },
      {
        label: "source and provenance change without visual facts",
        expectedTargetBinding: targetBinding({
          sourceFingerprint: "source-next",
          provenanceFingerprint: "provenance-next",
          fingerprint: "target-binding-semantic",
        }),
        requiresGeometryRecomputation: false,
        effectClass: "semantic-only-change",
        semanticIdentityChanged: true,
      },
      {
        label: "paint changes with geometry facts equal",
        expectedTargetBinding: targetBinding({
          paintFingerprint: "paint-next",
          fingerprint: "target-binding-paint",
        }),
        requiresGeometryRecomputation: false,
        effectClass: "paint-affecting-change",
        semanticIdentityChanged: false,
      },
      {
        label: "layout dependency changes",
        expectedTargetBinding: targetBinding({
          layoutDependencyFingerprint: "layout-next",
          fingerprint: "target-binding-geometry",
        }),
        requiresGeometryRecomputation: true,
        effectClass: "geometry-affecting-change",
        semanticIdentityChanged: false,
      },
    ] as const

    const classifications = rows.map((row) => (
      deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1({
        previousTargetBinding,
        expectedTargetBinding: row.expectedTargetBinding,
        requiresGeometryRecomputation: row.requiresGeometryRecomputation,
      })
    ))
    expect(classifications.map((classification) => classification.effectClass))
      .toEqual(rows.map((row) => row.effectClass))
    expect(classifications.map((classification) => classification.semanticIdentityChanged))
      .toEqual(rows.map((row) => row.semanticIdentityChanged))

    for (const row of [
      targetBinding({
        semanticFingerprint: "semantic-next",
        paintFingerprint: "paint-next",
        fingerprint: "target-binding-semantic-paint",
      }),
      targetBinding({
        sourceFingerprint: "source-next",
        layoutDependencyFingerprint: "layout-next",
        fingerprint: "target-binding-semantic-geometry",
      }),
    ]) {
      const classification =
        deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1({
          previousTargetBinding,
          expectedTargetBinding: row,
          requiresGeometryRecomputation: false,
        })
      expect(classification).toMatchObject({
        semanticIdentityChanged: true,
      })
    }
    expect(deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1({
      previousTargetBinding,
      expectedTargetBinding: targetBinding({
        semanticFingerprint: "semantic-next",
        paintFingerprint: "paint-next",
        fingerprint: "target-binding-semantic-paint",
      }),
      requiresGeometryRecomputation: false,
    }).effectClass).toBe("paint-affecting-change")
    expect(deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1({
      previousTargetBinding,
      expectedTargetBinding: targetBinding({
        sourceFingerprint: "source-next",
        layoutDependencyFingerprint: "layout-next",
        fingerprint: "target-binding-semantic-geometry",
      }),
      requiresGeometryRecomputation: false,
    }).effectClass).toBe("geometry-affecting-change")
  })

  it("calibrates structural reuse separately from payload observation", () => {
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID)
      .toBe("5b-1-v2")
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.stages)
      .toContainEqual(expect.objectContaining({
        stage: "structural-reuse-proof",
        unit: "selected-exact-subtree-nodes",
        lockStatus: "locked",
        smallBlockFloor: 1,
        absoluteStageLimit: 4,
        relativeNumerator: 1,
        relativeDenominator: 1,
      }))
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.stages.some(
      (row) => String(row.unit) === "estimated-canonical-payload-bytes",
    )).toBe(false)
    const candidate =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
    const { fingerprint: _fingerprint, ...candidateFacts } = candidate
    expect(candidate.policyId).toBe("5b-1-v3")
    expect(candidate.stages).toHaveLength(21)
    expect(candidate.fingerprint).toBe(createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(candidateFacts),
    ))

    const empty = createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
    expect(empty.structuralReuseProof).toEqual({
      visitedLineTreeNodeCount: 0,
      selectedExactSubtreeNodeCount: 0,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    })
    expect(empty.flow).toMatchObject({
      visitedSourceLookupNodeCount: 0,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
    })
    expect(empty.scene).toEqual({
      visitedLineTreeNodeCount: 0,
      visitedSceneTreeNodeCount: 0,
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
    })
    expect(empty.deliveryPlan).toEqual({
      visitedSceneTreeNodeCount: 0,
      deliveryOperationCount: 0,
      retainCoverNodeCount: 0,
    })
    expect(empty.observations.payloadObservationFingerprint).toBeNull()
    expect(empty.stageWork).toHaveLength(14)
    expect(empty.stageWork.every((row) => row.count === 0)).toBe(true)
    expect(empty.stageWork.map(({ stage, unit }) => ({ stage, unit })))
      .toEqual(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.stages.map(
        ({ stage, unit }) => ({ stage, unit }),
      ))
    expect(empty.stageWork.some(
      (row) => String(row.unit) === "estimated-canonical-payload-bytes",
    )).toBe(false)

    expect([3, 4, 5].map((attemptedWork) => (
      evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
        stage: "structural-reuse-proof",
        unit: "selected-exact-subtree-nodes",
        previousSummaryBase: 128,
        exactValidatedChangeDelta: 1,
        attemptedWork,
      }).status
    ))).toEqual(["within-limit", "within-limit", "limit-exceeded"])
  })

  it("composes one canonical factual row for every provisional V3 policy row", () => {
    const orderedPairs = [
      ["source-flow", "source-items"],
      ["source-flow", "source-lookup-nodes"],
      ["source-flow", "source-path-copy-nodes"],
      ["source-flow", "source-leaf-items"],
      ["source-flow", "flow-atoms"],
      ["source-flow", "flow-tree-nodes"],
      ["spatial-index", "spatial-index-nodes"],
      ["spatial-index", "spatial-query-bands"],
      ["structural-reuse-proof", "selected-exact-subtree-nodes"],
      ["structural-reuse-proof", "line-tree-lookup-nodes"],
      ["layout-reconvergence", "recomputed-lines"],
      ["layout-reconvergence", "proof-nodes"],
      ["geometry", "reprojected-lines"],
      ["geometry", "visited-fragments"],
      ["scene", "line-tree-lookup-nodes"],
      ["scene", "scene-tree-lookup-nodes"],
      ["scene", "copied-scene-nodes"],
      ["scene", "replacement-chunks"],
      ["delivery-plan", "scene-tree-lookup-nodes"],
      ["delivery-plan", "delivery-operations"],
      ["delivery-plan", "retain-cover-nodes"],
    ] as const satisfies readonly (readonly [
      VNextTextBlockUnifiedLayoutStageV1,
      VNextTextBlockUnifiedLayoutStageUnitV1,
    ])[]
    const lockedPairs = new Set([
      "source-flow/source-items",
      "source-flow/source-lookup-nodes",
      "source-flow/source-path-copy-nodes",
      "source-flow/source-leaf-items",
      "structural-reuse-proof/selected-exact-subtree-nodes",
      "structural-reuse-proof/line-tree-lookup-nodes",
      "scene/line-tree-lookup-nodes",
      "scene/scene-tree-lookup-nodes",
      "scene/copied-scene-nodes",
      "scene/replacement-chunks",
      "delivery-plan/scene-tree-lookup-nodes",
      "delivery-plan/delivery-operations",
      "delivery-plan/retain-cover-nodes",
    ])
    const stages = orderedPairs.map(([stage, unit]) => Object.freeze({
      stage,
      unit,
      lockStatus: lockedPairs.has(`${stage}/${unit}`) ? "locked" : "inactive",
      smallBlockFloor: 1,
      absoluteStageLimit: 1,
      relativeNumerator: 1,
      relativeDenominator: 1,
      checkpointOwner: stage === "source-flow"
        && (unit === "flow-atoms" || unit === "flow-tree-nodes")
        ? "5B-2"
        : stage === "spatial-index" || stage === "geometry"
          ? "5B-3"
          : "5B-1",
      fingerprint: `fixture:${stage}/${unit}`,
    } satisfies VNextTextBlockStageLimitV1))
    const policy = Object.freeze({
      source: "vnext-text-block-unified-layout-work-policy-v1",
      contractVersion: 1,
      policyId: "5b-1-v3-test",
      checkpoint: "5B-1",
      stages: Object.freeze(stages),
      fingerprint: "fixture:policy",
    } satisfies VNextTextBlockUnifiedLayoutWorkPolicyV1)
    const factualCounts = Object.freeze([
      { stage: "source-flow", unit: "source-items", count: 1 },
      {
        stage: "structural-reuse-proof",
        unit: "line-tree-lookup-nodes",
        count: 7,
      },
      { stage: "scene", unit: "replacement-chunks", count: 1 },
    ] as const satisfies readonly VNextTextBlockStageWorkCountV1[])

    const ledger = composeVNextTextBlockStageWorkLedgerInternalV1({
      policy,
      factualCounts,
    })

    expect(ledger.map(({ stage, unit }) => [stage, unit])).toEqual(orderedPairs)
    expect(ledger.map(({ count }) => count)).toEqual([
      1, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    ])
    expect(Object.isFrozen(ledger)).toBe(true)
    expect(ledger.every(Object.isFrozen)).toBe(true)
  })

  it("rejects noncanonical factual work instead of repairing authority", () => {
    const policy = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2
    const compose = (factualCounts: readonly VNextTextBlockStageWorkCountV1[]) =>
      composeVNextTextBlockStageWorkLedgerInternalV1({ policy, factualCounts })

    expect(() => compose([
      { stage: "scene", unit: "copied-scene-nodes", count: 1 },
      { stage: "source-flow", unit: "source-items", count: 1 },
    ])).toThrow("policy order")
    expect(() => compose([
      { stage: "source-flow", unit: "source-items", count: 1 },
      { stage: "source-flow", unit: "source-items", count: 1 },
    ])).toThrow("duplicate")
    expect(() => compose([
      { stage: "source-flow", unit: "flow-atoms", count: 1 },
    ])).toThrow("inactive")
    expect(() => compose([
      { stage: "source-flow", unit: "source-items", count: -1 },
    ])).toThrow("nonnegative safe integer")
    expect(() => compose([{
      stage: "source-flow",
      unit: "unknown-unit",
      count: 1,
    } as unknown as VNextTextBlockStageWorkCountV1])).toThrow("unknown")
  })

  it("accepts every exact frozen V1 change and keeps eligibility closed", () => {
    const results = frozenChanges().map((change) => (
      validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(change)
    ))

    expect(results.map((result) => result.status)).toEqual(Array(17).fill("accepted"))
    expect(results.map((result) => result.status === "accepted" ? result.change.kind : null))
      .toEqual(compileCheckedChanges.map((change) => change.kind))
    expect(results.map((result) => result.status === "accepted" ? result.eligibility : null))
      .toEqual([
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "required",
        "permitted",
      ])
    expect(results.every((result) => (
      result.status !== "accepted"
      || (result.stage === "change-gate"
        && result.incrementalCandidateWork.changeGateVisitedFieldCount > 0
        && result.incrementalCandidateWork.completeNextInputTraversalCount === 0
        && result.incrementalCandidateWork.completeNextInputComparisonCount === 0)
    ))).toBe(true)
  })

  it("blocks unknown, hostile, mutable, ambiguous, and caller-authoritative fields", () => {
    const noOp = compileCheckedChanges[0]
    const insertion = compileCheckedChanges[1]
    let accessorReadCount = 0
    const accessor = {
      ...noOp,
      get effectClassification() {
        accessorReadCount += 1
        throw new Error("must not read accessor")
      },
    }
    Object.freeze(accessor)

    const symbolChange = { ...noOp }
    Object.defineProperty(symbolChange, Symbol("hidden"), {
      value: true,
      enumerable: true,
    })
    deepFreeze(symbolChange)

    const proxy = new Proxy(deepFreeze({ ...noOp }), {
      getPrototypeOf() {
        throw new Error("proxy trap")
      },
    })

    const customPrototype = Object.assign(Object.create({ inherited: true }), noOp)
    deepFreeze(customPrototype)

    const mutableInsertedSource = {
      ...insertion,
      insertedSource: { ...insertion.insertedSource },
    }
    Object.freeze(mutableInsertedSource)

    const rows: readonly {
      readonly label: string
      readonly value: unknown
      readonly expectedCode: string
      readonly expectedPath: string
    }[] = [
      {
        label: "unknown version",
        value: deepFreeze({ ...noOp, contractVersion: 2 }),
        expectedCode: "unsupported-change-version",
        expectedPath: "contractVersion",
      },
      {
        label: "unknown kind",
        value: deepFreeze({ ...noOp, kind: "future-structure-change" }),
        expectedCode: "unsupported-change-kind",
        expectedPath: "kind",
      },
      {
        label: "unknown field",
        value: deepFreeze({ ...noOp, extra: true }),
        expectedCode: "unknown-change-field",
        expectedPath: "extra",
      },
      {
        label: "symbol",
        value: symbolChange,
        expectedCode: "invalid-change-data",
        expectedPath: "change",
      },
      {
        label: "accessor",
        value: accessor,
        expectedCode: "invalid-change-data",
        expectedPath: "change",
      },
      {
        label: "proxy",
        value: proxy,
        expectedCode: "invalid-change-data",
        expectedPath: "change",
      },
      {
        label: "custom prototype",
        value: customPrototype,
        expectedCode: "invalid-change-data",
        expectedPath: "change",
      },
      {
        label: "mutable nested record",
        value: mutableInsertedSource,
        expectedCode: "change-not-deeply-frozen",
        expectedPath: "insertedSource",
      },
      {
        label: "blank identity",
        value: deepFreeze({ ...noOp, documentId: "  " }),
        expectedCode: "blank-change-identity",
        expectedPath: "documentId",
      },
      {
        label: "blank fingerprint",
        value: deepFreeze({ ...noOp, expectedPreviousRootFingerprint: "" }),
        expectedCode: "blank-change-identity",
        expectedPath: "expectedPreviousRootFingerprint",
      },
      {
        label: "empty deletion range",
        value: deepFreeze({
          ...compileCheckedChanges[2],
          removedRange: { startRenderedUtf16: 2, endRenderedUtf16: 2 },
        }),
        expectedCode: "invalid-change-range",
        expectedPath: "removedRange",
      },
      {
        label: "unsafe insertion coordinate",
        value: deepFreeze({ ...insertion, atRenderedUtf16: Number.MAX_SAFE_INTEGER + 1 }),
        expectedCode: "invalid-change-range",
        expectedPath: "atRenderedUtf16",
      },
      ...([
        "dirtyRange",
        "affectedLines",
        "fallbackMode",
        "workPolicy",
        "effectClassification",
        "effectClass",
        "semanticIdentityChanged",
      ] as const).map((field) => ({
        label: `caller field ${field}`,
        value: deepFreeze({ ...noOp, [field]: {} }),
        expectedCode: "caller-authority-forbidden",
        expectedPath: field,
      })),
    ]

    for (const row of rows) {
      const result = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(row.value)
      expect(result, row.label).toMatchObject({
        status: "blocked",
        stage: "change-gate",
        change: null,
        issues: [{
          code: row.expectedCode,
          path: row.expectedPath,
        }],
        incrementalCandidateWork: {
          completeNextInputTraversalCount: 0,
          completeNextInputComparisonCount: 0,
        },
      })
    }
    expect(accessorReadCount).toBe(0)
  })

  it("sorts independent change issues canonically by path, code, then message", () => {
    const result = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(deepFreeze({
      ...compileCheckedChanges[2],
      documentId: "",
      sectionId: " ",
      expectedPreviousRootFingerprint: "",
      removedRange: {
        startRenderedUtf16: -1,
        endRenderedUtf16: Number.MAX_SAFE_INTEGER + 1,
      },
    }))

    expect(result.status).toBe("blocked")
    if (result.status !== "blocked") throw new Error("expected blocked change")
    expect(result.issues.map((item) => `${item.path}|${item.code}|${item.message}`))
      .toEqual([...result.issues]
        .sort((left, right) => (
          left.path.localeCompare(right.path)
          || left.code.localeCompare(right.code)
          || left.message.localeCompare(right.message)
        ))
        .map((item) => `${item.path}|${item.code}|${item.message}`))
  })

  it("computes deterministic safe stage limits without consulting clocks", () => {
    vi.spyOn(performance, "now").mockImplementation(() => {
      throw new Error("performance.now is forbidden")
    })
    vi.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("Date.now is forbidden")
    })
    vi.spyOn(process, "hrtime").mockImplementation(() => {
      throw new Error("process.hrtime is forbidden")
    })

    expect(effectiveStageLimitV1({
      smallBlockFloor: 32,
      absoluteStageLimit: 256,
      relativeStageLimit: 31,
    })).toBe(32)
    expect(effectiveStageLimitV1({
      smallBlockFloor: 32,
      absoluteStageLimit: 256,
      relativeStageLimit: 400,
    })).toBe(256)
    expect(effectiveStageLimitV1({
      smallBlockFloor: Number.MAX_SAFE_INTEGER,
      absoluteStageLimit: Number.MAX_SAFE_INTEGER,
      relativeStageLimit: Number.MAX_SAFE_INTEGER,
    })).toBe(Number.MAX_SAFE_INTEGER)

    for (const invalid of [
      {
        smallBlockFloor: Number.MAX_SAFE_INTEGER + 1,
        absoluteStageLimit: Number.MAX_SAFE_INTEGER,
        relativeStageLimit: Number.MAX_SAFE_INTEGER,
      },
      {
        smallBlockFloor: 0,
        absoluteStageLimit: Number.POSITIVE_INFINITY,
        relativeStageLimit: 1,
      },
      {
        smallBlockFloor: -1,
        absoluteStageLimit: 1,
        relativeStageLimit: 1,
      },
    ]) {
      expect(() => effectiveStageLimitV1(invalid)).toThrow(RangeError)
    }

    const accepted = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
      frozenChanges()[0],
    )
    expect(accepted.status).toBe("accepted")
  })
})
