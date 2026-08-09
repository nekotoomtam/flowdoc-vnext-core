import { describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import { createFlowDocTextEngineUnifiedIncrementalEvidenceV2 } from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { TextRunStyleV4Target } from "../src/schema/documentV4Foundation.js"
import type { VNextTextBlockUnifiedLayoutChangeV1 } from "../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockIncrementalFlowAtomV1,
  VNextTextBlockIncrementalFlowNodeV1,
} from "../src/layout/textBlockIncrementalFlowTreeContractV1.js"
import {
  bindVNextTextBlockIncrementalFlowExactAliasInternalV1,
  setVNextTextBlockFlowPathCopyOperationObserverForTestInternalV1,
  setVNextTextBlockFlowProjectionPayloadObserverForTestInternalV1,
  setVNextTextBlockFlowRecursiveFreezeObserverForTestInternalV1,
  setVNextTextBlockFlowTreeInspectionObserverForTestInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import { createVNextTextBlockUnifiedLayoutRootCompleteInternalV2 } from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import { prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2 } from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import { transitionVNextTextBlockUnifiedLayoutSourceInternalV1 } from "../src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.js"
import { transitionVNextTextBlockUnifiedLayoutFlowInternalV1 } from "../src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.js"
import { setVNextTextBlockPostBindingLimitOverrideForTestInternalV1 } from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import { transitionVNextTextBlockUnifiedLayoutSourceAndFlowInternalV1 } from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import { VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1 } from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import { unifiedLayoutRootBuildInputFixtureV2 } from "./helpers/textBlockUnifiedLayoutRootV2.js"
import { repeatedUnifiedLayoutRootSourceFixtureV1 } from "./helpers/textBlockUnifiedLayoutRootV1.js"
import {
  admit5B2RootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

const ACTUAL_FONT_FACES = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
const CORE_FONT_FACES = ACTUAL_FONT_FACES.slice(0, 1).map(
  ({ fontAssetPath: _path, ...face }) => ({ ...face }),
)

function frozen<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) {
        frozen(descriptor.value)
      }
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function textRoot(text: string): VNextTextBlockUnifiedLayoutRootV2 {
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
      text,
      textClusterRanges: [...text].map((value, index, values) => {
        const startRenderedUtf16 = values.slice(0, index).join("").length
        return {
          startRenderedUtf16,
          endRenderedUtf16: startRenderedUtf16 + value.length,
        }
      }),
      fontFaces: CORE_FONT_FACES,
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  )
  if (built.status !== "accepted") throw new Error("root blocked")
  return admit5B2RootFixture(built.root)
}

function adjacentTextRoot(itemCount: number): VNextTextBlockUnifiedLayoutRootV2 {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount: itemCount,
    includeImages: false,
    includeBreaks: false,
    fontFaces: CORE_FONT_FACES,
  })
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1)
  if (built.status !== "accepted") throw new Error("adjacent root blocked")
  return admit5B2RootFixture(built.root)
}

function mixedBoundaryRoot(): VNextTextBlockUnifiedLayoutRootV2 {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount: 1,
    includeImages: false,
    includeBreaks: true,
    fontFaces: CORE_FONT_FACES,
  })
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1)
  if (built.status !== "accepted") throw new Error("mixed root blocked")
  return admit5B2RootFixture(built.root)
}

function sourceLeafOccupancies(
  node: VNextTextBlockUnifiedLayoutSourceNodeV1,
): readonly number[] {
  return node.nodeKind === "leaf"
    ? [node.items.length]
    : node.children.flatMap(sourceLeafOccupancies)
}

function sourceItems(
  node: VNextTextBlockUnifiedLayoutSourceNodeV1,
): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] {
  return node.nodeKind === "leaf"
    ? node.items
    : node.children.flatMap(sourceItems)
}

function flowAtoms(
  node: VNextTextBlockIncrementalFlowNodeV1,
): readonly VNextTextBlockIncrementalFlowAtomV1[] {
  return node.nodeKind === "leaf"
    ? node.atoms
    : node.children.flatMap(flowAtoms)
}

function flowLeaves(
  node: VNextTextBlockIncrementalFlowNodeV1,
): readonly Extract<VNextTextBlockIncrementalFlowNodeV1, { nodeKind: "leaf" }>[] {
  return node.nodeKind === "leaf"
    ? [node]
    : node.children.flatMap(flowLeaves)
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

function firstText(root: VNextTextBlockUnifiedLayoutRootV2) {
  const item = sourceItems(root.sourceState.root).find(
    (candidate) => candidate.kind === "text",
  )
  if (item?.kind !== "text") throw new Error("text missing")
  return item
}

function insertion(
  root: VNextTextBlockUnifiedLayoutRootV2,
  atRenderedUtf16: number,
  insertedText: string,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "text-insertion" as const,
    atRenderedUtf16,
    insertedText,
    insertedSource: {
      lineageId: `flow-insert-${atRenderedUtf16}`,
      sourceFingerprint: `flow-source-${atRenderedUtf16}`,
      provenanceFingerprint: `flow-provenance-${atRenderedUtf16}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function deletion(
  root: VNextTextBlockUnifiedLayoutRootV2,
  startRenderedUtf16: number,
  endRenderedUtf16: number,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "text-deletion" as const,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
  })
}

function styleChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  nextStyle: TextRunStyleV4Target,
  startRenderedUtf16 = 0,
  endRenderedUtf16 = root.sourceState.summary.renderedUtf16Length,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "supported-style-change" as const,
    range: { startRenderedUtf16, endRenderedUtf16 },
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: fingerprint(nextStyle),
    nextStyleProvenanceFingerprint: fingerprint({ owner: "task-5", nextStyle }),
  })
}

function acceptedEvidence(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
) {
  const request = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
    previousRoot: root,
    change,
  })
  if (request.status !== "required") throw new Error(`request was ${request.status}`)
  const identity = createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime: "node-native-mr1-range",
    engineBuildFingerprint: "task-5-node-engine",
    fontBackendFingerprint: "task-5-node-font-backend",
    unitPolicyFingerprint: request.request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint:
      request.request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint:
      request.request.producerRuntimeRequirementFingerprint,
  })
  const produced = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
    request.producerInvocationAuthority,
    request.request,
    request.sourceMaterial,
    {
      identity,
      shapeRange(input) {
        const face = ACTUAL_FONT_FACES.find(
          (candidate) => candidate.fontFaceId === input.fontFaceId,
        )
        if (face == null) throw new Error("font unavailable")
        return runFlowDocTextEngineNodeMr1RangeShapeV1({
          text: input.text,
          fontId: face.fontFaceId,
          fontAssetPath: face.fontAssetPath,
          fontSha256: face.fontSha256,
          rangeStartUtf16: input.rangeStartUtf16,
          rangeEndUtf16: input.rangeEndUtf16,
          contextStartUtf16: input.contextStartUtf16,
          contextEndUtf16: input.contextEndUtf16,
        })
      },
      segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1,
    },
  )
  if (produced.status !== "accepted") throw new Error("producer blocked")
  const accepted = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
    previousRoot: root,
    change,
    request: request.request,
    sourceMaterial: request.sourceMaterial,
    producerInvocationAuthority: request.producerInvocationAuthority,
    producerRuntimeIdentity: identity,
    response: produced.response,
  })
  if (accepted.status !== "accepted") throw new Error("evidence blocked")
  return accepted
}

function sourceStage(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
) {
  const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: root,
    change,
    workPolicy: root.workPolicy,
  })
  if (preflight.status !== "required" && preflight.status !== "not-required") {
    throw new Error(`preflight was ${preflight.status}`)
  }
  const accepted = preflight.status === "required"
    ? acceptedEvidence(root, change)
    : { evidence: null, completedCandidateWork: preflight.completedCandidateWork }
  const source = transitionVNextTextBlockUnifiedLayoutSourceInternalV1({
    previousRoot: root,
    preflight: preflight.preflight,
    evidence: accepted.evidence,
    completedCandidateWork: accepted.completedCandidateWork,
  })
  if (source.status !== "accepted") {
    throw new Error(`source was ${source.status}: ${JSON.stringify(source)}`)
  }
  return {
    source,
    evidence: accepted.evidence,
    preflight: preflight.preflight,
    completedCandidateWork: accepted.completedCandidateWork,
  }
}

describe("5B-2 evidence-to-Flow path copy", () => {
  it.each([
    { name: "semantic-only", nextStyle: {} },
    { name: "paint-only", nextStyle: { textColor: "FF0000" } },
  ] as const)("aliases the exact previous Flow Tree for $name changes", ({ nextStyle }) => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, styleChange(root, nextStyle, 1, 3))
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({
      status: "accepted",
      completedCandidateWork: {
        flow: {
          completeTreeRebuildCount: 0,
          completeSemanticPassCount: 0,
          completeSuffixTraversalCount: 0,
          createdFlowTreeNodeCount: 0,
        },
      },
    })
    if (result.status !== "accepted") return
    expect(result.nextSourceState).not.toBe(root.sourceState)
    expect(result.nextFlowTree).toBe(root.flowTree)
    expect(result.flowBindingAuthority).toEqual(expect.any(Object))
  })

  it.each([1, 8, 32, 33, 128, 2_048])(
    "keeps exact semantic-only Flow identity at %i Source characters",
    (characterCount) => {
      const root = textRoot("A".repeat(characterCount))
      const prepared = sourceStage(
        root,
        styleChange(root, {}, 0, Math.min(1, characterCount)),
      )
      const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: root,
        sourceStage: prepared.source,
        evidence: prepared.evidence,
      })
      expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
      if (result.status !== "accepted") return
      expect(result.nextFlowTree).toBe(root.flowTree)
      expect(result.completedCandidateWork.flow).toMatchObject({
        visitedFlowAtomCount: 0,
        visitedFlowTreeNodeCount: 0,
        createdFlowTreeNodeCount: 0,
        completeSuffixTraversalCount: 0,
      })
    },
    30_000,
  )

  it("uses process-local Flow authority without entering the QA inspector", () => {
    const aliasRoot = textRoot("ABCD")
    const aliasPrepared = sourceStage(
      aliasRoot,
      styleChange(aliasRoot, { textColor: "FF0000" }, 1, 3),
    )
    const metricRoot = textRoot("ABCDEFGH")
    const metricPrepared = sourceStage(
      metricRoot,
      insertion(metricRoot, 0, "X"),
    )
    setVNextTextBlockFlowTreeInspectionObserverForTestInternalV1(() => {
      throw new Error("QA Flow inspector entered the incremental hot path")
    })
    try {
      expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: aliasRoot,
        sourceStage: aliasPrepared.source,
        evidence: aliasPrepared.evidence,
      })).toMatchObject({ status: "accepted" })
      expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: metricRoot,
        sourceStage: metricPrepared.source,
        evidence: metricPrepared.evidence,
      })).toMatchObject({ status: "accepted" })
    } finally {
      setVNextTextBlockFlowTreeInspectionObserverForTestInternalV1(null)
    }
  }, 30_000)

  it.each([1, 8, 32, 33, 128, 2_048])(
    "keeps metric Flow path-copy work bounded at %i Source characters",
    (characterCount) => {
      const root = textRoot("A".repeat(characterCount))
      const prepared = sourceStage(root, insertion(root, 0, "X"))
      const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: root,
        sourceStage: prepared.source,
        evidence: prepared.evidence,
      })
      expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
      if (result.status !== "accepted") return
      expect(result.nextFlowTree).not.toBe(root.flowTree)
      expect(result.completedCandidateWork.flow).toMatchObject({
        completeTreeRebuildCount: 0,
        completeSemanticPassCount: 0,
        completeSuffixTraversalCount: 0,
      })
      expect(result.completedCandidateWork.flow.visitedFlowAtomCount)
        .toBeLessThanOrEqual(32)
      expect(result.completedCandidateWork.flow.visitedFlowTreeNodeCount)
        .toBeLessThanOrEqual(64)
    },
    60_000,
  )

  it.each([
    { name: "partial paint-only", nextStyle: { textColor: "FF0000" } },
    {
      name: "partial equal-metric",
      nextStyle: { fontSize: { value: 12, unit: "pt" as const } },
    },
  ])(
    "aliases Flow across an exact 8/2 Source regroup for $name style",
    ({ nextStyle }) => {
      const root = adjacentTextRoot(8)
      expect(sourceLeafOccupancies(root.sourceState.root)).toEqual([8])
      const prepared = sourceStage(root, styleChange(root, nextStyle, 1, 3))
      expect(sourceLeafOccupancies(prepared.source.nextSourceState.root))
        .toEqual([8, 2])
      const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: root,
        sourceStage: prepared.source,
        evidence: prepared.evidence,
      })
      expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
      if (result.status !== "accepted") return
      expect(result.nextFlowTree).toBe(root.flowTree)
      expect(result.completedCandidateWork.flow).toMatchObject({
        visitedFlowAtomCount: 0,
        visitedFlowTreeNodeCount: 0,
        createdFlowTreeNodeCount: 0,
      })
    },
    30_000,
  )

  it("path-copies metric Flow while Source regroups from 8 to 8/2", () => {
    const root = adjacentTextRoot(8)
    const prepared = sourceStage(
      root,
      styleChange(root, { fontSize: { value: 13, unit: "pt" } }, 1, 3),
    )
    expect(sourceLeafOccupancies(prepared.source.nextSourceState.root))
      .toEqual([8, 2])
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(result.nextFlowTree).not.toBe(root.flowTree)
    expect(flowLeaves(result.nextFlowTree.root).every(
      (leaf) => leaf.atoms.length <= 8,
    )).toBe(true)
    expect(result.completedCandidateWork.flow).toMatchObject({
      completeTreeRebuildCount: 0,
      completeSuffixTraversalCount: 0,
    })
  }, 30_000)

  it.each(["flow-atoms", "flow-tree-nodes"] as const)(
    "stops before the first %s visit and returns exact fallback authority",
    (unit) => {
      const root = textRoot("ABCD")
      const prepared = sourceStage(root, insertion(root, 0, "X"))
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
        stage: "source-flow",
        unit,
        effectiveLimit: 0,
      })
      try {
        const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
          previousRoot: root,
          sourceStage: prepared.source,
          evidence: prepared.evidence,
        })
        expect(result, JSON.stringify(result)).toMatchObject({
          status: "fallback-required",
          evaluatorOrProofAuthority: expect.any(Object),
          completedCandidateWork: {
            stageWork: expect.arrayContaining([{
              stage: "source-flow",
              unit,
              count: 0,
            }]),
          },
        })
      } finally {
        setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
      }
    },
    30_000,
  )

  it("does not read Source or evidence projection payload before atom limit zero", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, insertion(root, 0, "X"))
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "source-flow",
      unit: "flow-atoms",
      effectiveLimit: 0,
    })
    setVNextTextBlockFlowProjectionPayloadObserverForTestInternalV1(() => {
      throw new Error("Flow projection payload read before atom visit")
    })
    try {
      expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: root,
        sourceStage: prepared.source,
        evidence: prepared.evidence,
      })).toMatchObject({ status: "fallback-required" })
    } finally {
      setVNextTextBlockFlowProjectionPayloadObserverForTestInternalV1(null)
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
    }
  }, 30_000)

  it.each(["flow-atoms", "flow-tree-nodes"] as const)(
    "accepts the exact $unit threshold and rejects threshold minus one",
    (unit) => {
      const root = textRoot("ABCDEFGHIJKLMNOP")
      const run = (prepared: ReturnType<typeof sourceStage>) =>
        transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
        previousRoot: root,
        sourceStage: prepared.source,
        evidence: prepared.evidence,
      })
      const baseline = run(sourceStage(root, insertion(root, 4, "X")))
      expect(baseline, JSON.stringify(baseline)).toMatchObject({ status: "accepted" })
      if (baseline.status !== "accepted") return
      const exact = unit === "flow-atoms"
        ? baseline.completedCandidateWork.flow.visitedFlowAtomCount
        : baseline.completedCandidateWork.flow.visitedFlowTreeNodeCount
      expect(exact).toBeGreaterThan(0)
      for (const [offset, expectedStatus] of [
        [-1, "fallback-required"],
        [0, "accepted"],
        [1, "accepted"],
      ] as const) {
        const prepared = sourceStage(root, insertion(root, 4, "X"))
        setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
          stage: "source-flow",
          unit,
          effectiveLimit: exact + offset,
        })
        try {
          const thresholdResult = run(prepared)
          expect(
            thresholdResult,
            `${unit} threshold ${exact + offset}: ${JSON.stringify(thresholdResult)}`,
          ).toMatchObject({
            status: expectedStatus,
          })
        } finally {
          setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
        }
      }
    },
    60_000,
  )

  it.each([
    {
      unit: "flow-atoms" as const,
      effectiveLimit: 2,
      expectedAtoms: 2,
      expectedNodes: 1,
    },
    {
      unit: "flow-tree-nodes" as const,
      effectiveLimit: 1,
      expectedAtoms: 7,
      expectedNodes: 1,
    },
  ])(
    "records partial allocations before the $unit limit",
    ({ unit, effectiveLimit, expectedAtoms, expectedNodes }) => {
      const root = textRoot("ABCD")
      const prepared = sourceStage(root, insertion(root, 0, "X"))
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
        stage: "source-flow",
        unit,
        effectiveLimit,
      })
      try {
        const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
          previousRoot: root,
          sourceStage: prepared.source,
          evidence: prepared.evidence,
        })
        expect(result, JSON.stringify(result)).toMatchObject({
          status: "fallback-required",
          completedCandidateWork: {
            flow: {
              visitedFlowAtomCount: expectedAtoms,
              visitedFlowTreeNodeCount: expectedNodes,
              createdFlowTreeNodeCount: 1,
            },
          },
        })
      } finally {
        setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
      }
    },
    30_000,
  )

  it("path-copies metric Flow atoms without rebuilding the tree", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, insertion(root, 0, "X"))
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({
      status: "accepted",
      completedCandidateWork: {
        flow: {
          completeTreeRebuildCount: 0,
          completeSemanticPassCount: 0,
          completeSuffixTraversalCount: 0,
        },
      },
    })
    if (result.status !== "accepted") return
    expect(result.nextFlowTree).not.toBe(root.flowTree)
    expect(flowAtoms(result.nextFlowTree.root).map((atom) => atom.renderedText).join(""))
      .toBe("XABCD")
  }, 30_000)

  it("splits one full boundary leaf while retaining the exact suffix leaf", () => {
    const root = textRoot("ABCDEFGHIJKLMNOP")
    const previousAtoms = flowAtoms(root.flowTree.root)
    const previousLeaves = flowLeaves(root.flowTree.root)
    const prepared = sourceStage(root, insertion(root, 4, "X"))
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    const nextAtoms = flowAtoms(result.nextFlowTree.root)
    const nextLeaves = flowLeaves(result.nextFlowTree.root)
    expect(nextAtoms.map((atom) => atom.renderedText).join(""))
      .toBe("ABCDXEFGHIJKLMNOP")
    expect(nextAtoms[0]).toBe(previousAtoms[0])
    expect(nextAtoms.at(-1)).toBe(previousAtoms.at(-1))
    expect(nextLeaves.at(-1)).toBe(previousLeaves.at(-1))
    expect(nextLeaves.slice(0, 2).map((leaf) => leaf.atoms.length))
      .toEqual([4, 5])
  }, 30_000)

  it("path-copies a deletion across Flow leaves without walking the suffix", () => {
    const root = textRoot("ABCDEFGHIJKLMNOPQRST")
    const previousAtoms = flowAtoms(root.flowTree.root)
    const previousLeaves = flowLeaves(root.flowTree.root)
    const prepared = sourceStage(root, deletion(root, 7, 10))
    const forbiddenSuffixObjects = new Set<object>([
      previousLeaves.at(-1)!,
      ...previousLeaves.at(-1)!.atoms,
    ])
    setVNextTextBlockFlowPathCopyOperationObserverForTestInternalV1(
      ({ operation, value }) => {
        if (value != null && forbiddenSuffixObjects.has(value)) {
          throw new Error(`forbidden suffix ${operation}`)
        }
      },
    )
    setVNextTextBlockFlowRecursiveFreezeObserverForTestInternalV1((value) => {
      if (forbiddenSuffixObjects.has(value)) {
        throw new Error("forbidden suffix recursive freeze")
      }
    })
    const result = (() => {
      try {
        return transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
          previousRoot: root,
          sourceStage: prepared.source,
          evidence: prepared.evidence,
        })
      } finally {
        setVNextTextBlockFlowPathCopyOperationObserverForTestInternalV1(null)
        setVNextTextBlockFlowRecursiveFreezeObserverForTestInternalV1(null)
      }
    })()
    expect(result, JSON.stringify(result)).toMatchObject({
      status: "accepted",
      completedCandidateWork: {
        flow: {
          completeTreeRebuildCount: 0,
          completeSemanticPassCount: 0,
          completeSuffixTraversalCount: 0,
        },
      },
    })
    if (result.status !== "accepted") return
    const nextAtoms = flowAtoms(result.nextFlowTree.root)
    const nextLeaves = flowLeaves(result.nextFlowTree.root)
    expect(nextAtoms.map((atom) => atom.renderedText).join(""))
      .toBe("ABCDEFGKLMNOPQRST")
    expect(nextAtoms[0]).toBe(previousAtoms[0])
    expect(nextAtoms[6]).not.toBe(previousAtoms[6])
    expect(nextAtoms[7]).not.toBe(previousAtoms[10])
    expect(nextAtoms.at(-1)).toBe(previousAtoms.at(-1))
    expect(nextLeaves.at(-1)).toBe(previousLeaves.at(-1))
  }, 30_000)

  it("keeps one exact Thai cluster across retained physical Source fragments", () => {
    const root = textRoot("กX้")
    const prepared = sourceStage(root, deletion(root, 1, 2))
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    const nextAtoms = flowAtoms(result.nextFlowTree.root)
    expect(nextAtoms.map((atom) => atom.renderedText).join("")).toBe("ก้")
    expect(nextAtoms).toHaveLength(1)
    expect(nextAtoms[0]).toMatchObject({
      kind: "text-cluster",
      renderedUtf16Length: 2,
      localStartRenderedUtf16: 0,
      localEndRenderedUtf16: 2,
    })
    expect(nextAtoms[0]!.lineageId).toMatch(/^composite-cluster:/)
  }, 30_000)

  it("reprojects an exact hard-break boundary beside a text deletion", () => {
    const root = mixedBoundaryRoot()
    const items = sourceItems(root.sourceState.root)
    const hardBreakIndex = items.findIndex((item) => item.kind === "hard-break")
    const previousItem = items[hardBreakIndex - 1]
    if (
      hardBreakIndex < 1
      || previousItem == null
      || (
        previousItem.kind !== "text"
        && previousItem.kind !== "resolved-field"
        && previousItem.kind !== "generated-page-number"
      )
    ) throw new Error("text/hard-break adjacency missing")
    const hardBreakStart = items.slice(0, hardBreakIndex).reduce(
      (total, item) => total + item.renderedUtf16Length,
      0,
    )
    const change = frozen({
      ...changeBase(root),
      kind: "text-deletion" as const,
      removedRange: {
        startRenderedUtf16: hardBreakStart - 1,
        endRenderedUtf16: hardBreakStart,
      },
      expectedRemovedContentFingerprint: previousItem.contentFingerprint,
      expectedRemovedSourceFingerprint: previousItem.sourceFingerprint,
      expectedRemovedProvenanceFingerprint:
        previousItem.provenanceFingerprint,
    })
    const prepared = sourceStage(root, change)
    const result = transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: prepared.evidence,
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(flowAtoms(result.nextFlowTree.root).filter(
      (atom) => atom.kind === "hard-break",
    )).toHaveLength(1)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount)
      .toBe(0)
  }, 30_000)

  it("rejects a cloned Source-stage capability", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, styleChange(root, { textColor: "FF0000" }, 1, 3))
    expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: structuredClone(prepared.source),
      evidence: prepared.evidence,
    })).toMatchObject({ status: "blocked" })
  })

  it("rejects a forged layout-equal fingerprint without exact delta authority", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 3),
    )
    expect(bindVNextTextBlockIncrementalFlowExactAliasInternalV1({
      previousFlowTree: root.flowTree,
      previousSourceState: root.sourceState,
      nextSourceState: prepared.source.nextSourceState,
      sourceLayoutDeltaAuthority: Object.freeze({}) as never,
    })).toBeNull()
  })

  it("rejects evidence whose request coverage is cloned and drifted", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, insertion(root, 0, "X"))
    if (prepared.evidence == null) throw new Error("evidence missing")
    const drifted = frozen({
      ...structuredClone(prepared.evidence),
      nextEvidenceTargetRange: {
        startRenderedUtf16:
          prepared.evidence.nextEvidenceTargetRange.startRenderedUtf16,
        endRenderedUtf16:
          prepared.evidence.nextEvidenceTargetRange.endRenderedUtf16 + 1,
      },
    })
    expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: drifted,
    })).toMatchObject({ status: "blocked" })
  })

  it("rejects cloned evidence even when its coverage facts are equal", () => {
    const root = textRoot("ABCD")
    const prepared = sourceStage(root, insertion(root, 0, "X"))
    expect(transitionVNextTextBlockUnifiedLayoutFlowInternalV1({
      previousRoot: root,
      sourceStage: prepared.source,
      evidence: structuredClone(prepared.evidence),
    })).toMatchObject({ status: "blocked" })
  })

  it("sequences Source then Flow privately without preparing a Root", () => {
    const root = textRoot("ABCD")
    const change = insertion(root, 0, "X")
    const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change,
      workPolicy: root.workPolicy,
    })
    if (preflight.status !== "required") {
      throw new Error(`private preflight was ${preflight.status}`)
    }
    const accepted = acceptedEvidence(root, change)
    const result = transitionVNextTextBlockUnifiedLayoutSourceAndFlowInternalV1({
      previousRoot: root,
      preflight: preflight.preflight,
      evidence: accepted.evidence,
      completedCandidateWork: accepted.completedCandidateWork,
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    expect("root" in result).toBe(false)
  }, 30_000)
})
