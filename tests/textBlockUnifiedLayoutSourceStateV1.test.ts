import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import * as sourceStateInternals from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import * as transitionEvidenceInternals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  type TextRunStyleV4Target,
  type VNextTextBlockFlowEvidenceInputV2,
  type VNextTextBlockFlowEvidenceV2,
  type VNextTextBlockResolvedShapingRunV1,
} from "../src/index.js"
import {
  createVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowV1,
} from "../src/layout/textBlockInitialFlowInputV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1,
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
  createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1,
  deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1,
  hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
  setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"
import { listImageGeometryBuildInputFixture } from "./helpers/textBlockInitialFlowV1.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutSource.js"
import {
  imagePaintUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  unrestrictedSourceCoveragePermits5B2,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

function shapingRun(
  atom: Extract<VNextTextBlockInitialFlowV1["atoms"][number], {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>,
  index: number,
): VNextTextBlockResolvedShapingRunV1 {
  return {
    shapingRunId: `source-state-style-${index}-${atom.inlineId}`,
    renderStartOffset: atom.renderStartOffset,
    renderEndOffset: atom.renderEndOffset,
    text: atom.renderedText,
    styleKey: atom.resolvedGeometryStyle.effectiveShapingStyleKey,
    fontFaceId: atom.resolvedGeometryStyle.fontFaceId,
    fontSizeLayoutUnit: atom.resolvedGeometryStyle.fontSizeLayoutUnit,
    textColor: atom.resolvedGeometryStyle.textColor,
    direction: "ltr",
    baselineShiftLayoutUnit: 0,
    features: [],
    clusters: [...atom.renderedText].map((text, clusterIndex) => {
      const prefix = [...atom.renderedText].slice(0, clusterIndex).join("")
      const start = atom.renderStartOffset + prefix.length
      return {
        index: clusterIndex,
        renderStartOffset: start,
        renderEndOffset: start + text.length,
        advanceLayoutUnit: 6_000_000,
      }
    }),
  }
}

function acceptedStyledFixture(
  localStyle: TextRunStyleV4Target,
): {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
} {
  const input = listImageGeometryBuildInputFixture()
  const textInline = input.textBlock.children[0]
  const textRun = input.measurement.runs[0]
  if (textInline?.type !== "text" || textRun?.kind !== "text") {
    throw new Error("styled fixture text source missing")
  }
  const initial = createVNextTextBlockInitialFlowV1({
    ...input,
    textBlock: {
      ...input.textBlock,
      role: { role: "paragraph" },
      children: [
        { ...textInline, style: localStyle },
        ...input.textBlock.children.slice(1),
      ],
    },
    measurement: {
      ...input.measurement,
      runs: [
        { ...textRun, localStyle },
        ...input.measurement.runs.slice(1),
      ],
    },
  })
  if (initial.status !== "classified") {
    throw new Error(`styled Initial Flow blocked: ${JSON.stringify(initial.issues)}`)
  }
  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: initial.flow.fingerprint,
    layoutId: "phase-5b-source-style-fixture",
    measurement: initial.flow.measurement,
    layoutUnitPolicyFingerprint: initial.flow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: initial.flow.declaredLineHeightLayoutUnit,
    paragraphStyle: initial.flow.paragraphStyle,
    fontFaces: initial.flow.fontFaces.map(({ fontFamilyKey: _key, ...face }) => ({
      ...face,
    })),
    shapingRuns: initial.flow.atoms.flatMap((atom, index) => (
      atom.kind === "text"
      || atom.kind === "resolved-field"
      || atom.kind === "generated-page-number"
        ? [shapingRun(atom, index)]
        : []
    )),
    breakOffsets: [0, 1, 2],
  }
  const evidence = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput,
  })
  if (evidence.status !== "accepted") {
    throw new Error(`styled evidence blocked: ${JSON.stringify(evidence.issues)}`)
  }
  return { initialFlow: initial.flow, evidence: evidence.evidence }
}

function sourceState(
  fixture: {
    initialFlow: VNextTextBlockInitialFlowV1
    evidence: VNextTextBlockFlowEvidenceV2
  },
) {
  const result = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(fixture)
  if (result.status !== "prepared") {
    throw new Error(`source state blocked: ${JSON.stringify(result.issues)}`)
  }
  return result
}

function preparedSourceEnvelopeFacts(value: unknown): unknown {
  const inspect = (sourceStateInternals as unknown as {
    readonly inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1?:
      (sourceState: unknown) => unknown
  }).inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1
  return inspect?.(value) ?? null
}

function v3SourceTransitionFixture() {
  const previous = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-image-text-break",
      fit: "contain",
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  )
  if (previous.status !== "accepted") throw new Error("V3 Root blocked")
  const change = imagePaintUnifiedLayoutChange5b(previous.root, {
    fit: "cover",
    crop: { x: 0, y: 0, width: 0.5, height: 1 },
  })
  if (change.kind !== "image-paint-fact-change") {
    throw new Error("V3 source fixture did not create image paint")
  }
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: previous.root,
    change,
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  })
  if (bound.status !== "accepted") throw new Error("V3 change did not bind")
  const sourceItemAuthority =
    getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1(
      bound.validatedChange,
    )
  const getGuard = (transitionEvidenceInternals as unknown as {
    readonly getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1?:
      (validatedChange: unknown) => unknown
  }).getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1
  const guard = getGuard?.(bound.validatedChange) ?? null
  if (sourceItemAuthority == null) throw new Error("source item authority missing")
  return {
    previousRoot: previous.root,
    change,
    bound,
    sourceItemAuthority,
    guard,
  }
}

function postBindingSourceTestBoundaries() {
  const evidence = transitionEvidenceInternals as unknown as {
    readonly setVNextTextBlockPostBindingLimitOverrideForTestInternalV1?:
      (value: unknown) => void
  }
  const source = sourceStateInternals as unknown as {
    readonly setVNextTextBlockPostBindingSourceOperationObserverForTestInternalV1?:
      (observer: ((value: unknown) => void) | null) => void
  }
  return {
    setLimit:
      evidence.setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
    setObserver:
      source.setVNextTextBlockPostBindingSourceOperationObserverForTestInternalV1,
  }
}

describe("Phase 5B transition-native source state", () => {
  it("rejects legacy boolean Source coverage callbacks without observing them", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
    }))
    let legacyCallbackCount = 0
    const visitCoverage = sourceStateInternals
      .visitVNextTextBlockTransitionSourceCoverageInternalV1 as unknown as (
        input: object,
      ) => {
        readonly status: string
        readonly fragments: unknown
        readonly visitedNodeCount: number
        readonly emittedItemCount: number
        readonly completeTreeTraversalCount: number
      }
    const result = visitCoverage({
      sourceState: built.sourceState,
      range: {
        startRenderedUtf16: 0,
        endRenderedUtf16: built.sourceState.summary.renderedUtf16Length,
      },
      beforeVisitNode: () => {
        legacyCallbackCount += 1
        return true
      },
      beforeEmitItem: () => {
        legacyCallbackCount += 1
        return true
      },
    })

    expect(result).toEqual({
      status: "blocked",
      fragments: null,
      visitedNodeCount: 0,
      emittedItemCount: 0,
      completeTreeTraversalCount: 0,
    })
    expect(legacyCallbackCount).toBe(0)
  })

  it("stops before charging or observing a trailing item slot", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "text-image-text-break",
    }))
    if (built.sourceState.root.nodeKind !== "leaf") {
      throw new Error("hostile coverage fixture must be one leaf")
    }
    const firstItem = built.sourceState.root.items[0]
    expect(firstItem).toBeDefined()
    expect(built.sourceState.root.items.length).toBeGreaterThan(1)
    if (firstItem == null) return
    let itemPermitCount = 0
    const result = sourceStateInternals
      .visitVNextTextBlockTransitionSourceCoverageInternalV1({
        sourceState: built.sourceState,
        range: {
          startRenderedUtf16: 0,
          endRenderedUtf16: firstItem.renderedUtf16Length,
        },
        ...unrestrictedSourceCoveragePermits5B2({
          beforeVisit: (unit) => {
            if (unit !== "source-coverage-items") return true
            itemPermitCount += 1
            if (itemPermitCount > 1) {
              throw new Error("trailing Source item permit observed")
            }
            return true
          },
        }),
      })

    expect(result).toMatchObject({
      status: "accepted",
      emittedItemCount: 1,
      completeTreeTraversalCount: 0,
    })
    if (result.status !== "accepted") return
    expect(result.fragments.map((fragment) => fragment.item)).toEqual([firstItem])
    expect(itemPermitCount).toBe(1)
  })

  it("recomposes canonical text, image, and hard-break paint facts exactly", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "text-image-text-break",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    }))
    const items = built.sourceState.root.nodeKind === "leaf"
      ? built.sourceState.root.items
      : built.sourceState.root.children.flatMap((child) =>
          child.nodeKind === "leaf" ? child.items : [])
    const factory = createVNextCompactFingerprint

    for (const item of items) {
      if (item.kind === "hard-break") {
        expect(
          sourceStateInternals
            .canonicalVNextTextBlockHardBreakPaintFactsInternalV1(factory),
        ).toEqual({
          facts: { paint: "none" },
          fingerprint: item.paintFingerprint,
        })
      } else if (item.kind === "inline-image") {
        expect(
          sourceStateInternals
            .canonicalVNextTextBlockImagePaintFactsInternalV1({
              assetId: item.assetId,
              authoredFrame: item.authoredFrame,
            }, factory),
        ).toEqual({
          facts: {
            assetId: item.assetId,
            fit: item.authoredFrame.fit,
            crop: item.authoredFrame.crop ?? null,
          },
          fingerprint: item.paintFingerprint,
        })
      } else {
        expect(
          sourceStateInternals
            .canonicalVNextTextBlockTextPaintFactsInternalV1({
              textColor: item.style.textColor,
              textDecoration: item.style.textDecoration,
              strikethrough: item.style.strikethrough,
              authoredTextColor:
                item.style.authoredLocalStyle?.textColor ?? null,
            }, factory),
        ).toEqual({
          facts: {
            textColor: item.style.textColor,
            textDecoration: item.style.textDecoration,
            strikethrough: item.style.strikethrough,
            authoredTextColor:
              item.style.authoredLocalStyle?.textColor ?? null,
          },
          fingerprint: item.paintFingerprint,
        })
      }
    }

    const collision =
      createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1(
        acceptedInlineImageEvidenceFixture({ content: "image-only" }),
      )
    if (collision.status !== "prepared") throw new Error("collision source blocked")
    if (collision.sourceState.root.nodeKind !== "leaf") {
      throw new Error("collision source root not leaf")
    }
    const collisionImage = collision.sourceState.root.items[0]
    if (collisionImage?.kind !== "inline-image") {
      throw new Error("collision image missing")
    }
    expect(
      sourceStateInternals.canonicalVNextTextBlockImagePaintFactsInternalV1({
        assetId: collisionImage.assetId,
        authoredFrame: collisionImage.authoredFrame,
      }, () => collisionImage.paintFingerprint).fingerprint,
    ).toBe(collisionImage.paintFingerprint)
  })

  it("retains exact prepared source height outside canonical identity", () => {
    const leaf = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
    }))
    const repeatedSource = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 65,
      includeImages: true,
    })
    const multiHeight = sourceState({
      initialFlow: repeatedSource.initialFlow,
      evidence: repeatedSource.evidence,
    })
    const leafStateBefore = JSON.stringify(leaf.sourceState)
    const multiStateBefore = JSON.stringify(multiHeight.sourceState)
    const leafStateKeys = Reflect.ownKeys(leaf.sourceState)
    const leafRootFingerprint = leaf.sourceState.root.fingerprint
    const multiRootFingerprint = multiHeight.sourceState.root.fingerprint

    const leafFacts = preparedSourceEnvelopeFacts(leaf.sourceState)
    const multiFacts = preparedSourceEnvelopeFacts(multiHeight.sourceState)

    expect(leafFacts).toEqual({
      sourceItemCount: 1,
      treeHeight: 1,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })
    expect(multiFacts).toEqual({
      sourceItemCount: multiHeight.sourceState.summary.itemCount,
      treeHeight: 3,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })
    expect(Object.isFrozen(leafFacts)).toBe(true)
    expect(Object.isFrozen(multiFacts)).toBe(true)
    expect(JSON.stringify(leaf.sourceState)).toBe(leafStateBefore)
    expect(JSON.stringify(multiHeight.sourceState)).toBe(multiStateBefore)
    expect(Reflect.ownKeys(leaf.sourceState)).toEqual(leafStateKeys)
    expect(leaf.sourceState.root.fingerprint).toBe(leafRootFingerprint)
    expect(multiHeight.sourceState.root.fingerprint).toBe(multiRootFingerprint)
    expect(Object.hasOwn(leaf.sourceState, "treeHeight")).toBe(false)
    expect(Object.hasOwn(leaf.sourceState.summary, "treeHeight")).toBe(false)
  })

  it("rejects detached height and retains exact height through paint path-copy", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "contain",
    }))
    const detached = structuredClone(built.sourceState) as unknown as {
      readonly root: { height: number }
    }
    detached.root.height = 99
    expect(preparedSourceEnvelopeFacts(detached)).toBeNull()

    const item =
      deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
        sourceState: built.sourceState,
        inlineId: "image-1",
        expectedImageSourceFingerprint:
          built.sourceState.root.nodeKind === "leaf"
            ? built.sourceState.root.items[0]!.sourceFingerprint
            : "unreachable",
        expectedImageDependencyFingerprint:
          built.sourceState.root.nodeKind === "leaf"
            ? built.sourceState.root.items[0]!.layoutDependencyFingerprint
            : "unreachable",
        nextFit: "cover",
        nextCrop: { x: 0, y: 0, width: 0.5, height: 1 },
      })
    if (item.status !== "accepted") {
      throw new Error("prepared-height paint fixture blocked")
    }
    const successor =
      createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
        previousSourceState: built.sourceState,
        sourceItemAuthority: item.sourceItemAuthority,
        inlineId: "image-1",
        expectedImageSourceFingerprint:
          built.sourceState.root.nodeKind === "leaf"
            ? built.sourceState.root.items[0]!.sourceFingerprint
            : "unreachable",
        expectedImageDependencyFingerprint:
          built.sourceState.root.nodeKind === "leaf"
            ? built.sourceState.root.items[0]!.layoutDependencyFingerprint
            : "unreachable",
        nextFit: "cover",
        nextCrop: { x: 0, y: 0, width: 0.5, height: 1 },
      })
    if (successor.status !== "prepared") {
      throw new Error("prepared-height paint successor blocked")
    }
    expect(preparedSourceEnvelopeFacts(successor.sourceState)).toEqual({
      sourceItemCount: 1,
      treeHeight: 1,
      maximumLeafOccupancy: 8,
      deliberateItemResolutionCount: 1,
    })
    expect(preparedSourceEnvelopeFacts(structuredClone(successor.sourceState)))
      .toBeNull()
  })

  it("changes paint authority without changing layout-only flow authority", () => {
    const contain = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "contain",
    }))
    const cover = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    }))
    const red = sourceState(acceptedStyledFixture({ textColor: "FF0000" }))
    const blue = sourceState(acceptedStyledFixture({ textColor: "0000FF" }))

    expect(cover.sourceState.fingerprint).not.toBe(contain.sourceState.fingerprint)
    expect(cover.sourceState.summary.paintFingerprint)
      .not.toBe(contain.sourceState.summary.paintFingerprint)
    expect(cover.sourceState.summary.semanticFingerprint)
      .toBe(contain.sourceState.summary.semanticFingerprint)
    expect(blue.sourceState.fingerprint).not.toBe(red.sourceState.fingerprint)
    expect(blue.sourceState.summary.paintFingerprint)
      .not.toBe(red.sourceState.summary.paintFingerprint)

    const containFlow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: contain.sourceState,
      evidence: acceptedInlineImageEvidenceFixture({
        content: "image-only",
        fit: "contain",
      }).evidence,
    })
    expect(containFlow.status).toBe("blocked")

    const containFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "contain",
    })
    const coverFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const containBound = sourceState(containFixture)
    const coverBound = sourceState(coverFixture)
    const containTree = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: containBound.sourceState,
      evidence: containFixture.evidence,
    })
    const coverTree = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: coverBound.sourceState,
      evidence: coverFixture.evidence,
    })
    expect(containTree.status).toBe("prepared")
    expect(coverTree.status).toBe("prepared")
    if (containTree.status !== "prepared" || coverTree.status !== "prepared") {
      throw new Error("paint-only flow trees blocked")
    }
    expect(coverTree.flowTree.fingerprint).toBe(containTree.flowTree.fingerprint)

    const redFixture = acceptedStyledFixture({ textColor: "FF0000" })
    const blueFixture = acceptedStyledFixture({ textColor: "0000FF" })
    const redState = sourceState(redFixture)
    const blueState = sourceState(blueFixture)
    const redFlow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: redState.sourceState,
      evidence: redFixture.evidence,
    })
    const blueFlow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: blueState.sourceState,
      evidence: blueFixture.evidence,
    })
    expect(redFlow.status).toBe("prepared")
    expect(blueFlow.status).toBe("prepared")
    if (redFlow.status !== "prepared" || blueFlow.status !== "prepared") {
      throw new Error("text-color flow trees blocked")
    }
    expect(blueFlow.flowTree.fingerprint).toBe(redFlow.flowTree.fingerprint)
  })

  it("stores offset-independent source items and performs summary-guided lookup", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "text-image-text-break",
    }))
    const state = built.sourceState
    const found = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
      sourceState: state,
      renderedUtf16Offset: 1,
    })

    expect(found).toMatchObject({
      status: "found",
      absoluteStartRenderedUtf16: 1,
      absoluteEndRenderedUtf16: 2,
      item: {
        kind: "inline-image",
        inlineId: "image-1",
        renderedUtf16Length: 1,
      },
      work: {
        completeTreeTraversalCount: 0,
      },
    })
    expect(found.status === "found" && found.work.visitedNodeCount)
      .toBeLessThanOrEqual(state.root.height + 1)
    if (state.root.nodeKind !== "leaf") throw new Error("small source root not leaf")
    for (const item of state.root.items) {
      expect(item).not.toHaveProperty("renderStartOffset")
      expect(item).not.toHaveProperty("renderEndOffset")
    }
    expect(state).not.toHaveProperty("evidence")
    expect(state.producerRequirements).not.toHaveProperty("shapingRuns")
    expect(state.producerRequirements).not.toHaveProperty("breakOffsets")
  })

  it("keeps current-tree inline lookup constant across 32 paint successors", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "text-image-text",
      fit: "contain",
    }))
    const image =
      lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
        sourceState: built.sourceState,
        inlineId: "image-1",
      })
    if (image.status !== "found" || image.item.kind !== "inline-image") {
      throw new Error("source history fixture image missing")
    }
    let current = built.sourceState
    let firstSuccessor = built.sourceState
    for (let revision = 0; revision < 32; revision += 1) {
      const crop = revision % 2 === 0
        ? { x: 0, y: 0, width: 0.5, height: 1 }
        : { x: 0.2, y: 0.1, width: 0.6, height: 0.8 }
      const derived =
        deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
          sourceState: current,
          inlineId: image.item.inlineId,
          expectedImageSourceFingerprint: image.item.sourceFingerprint,
          expectedImageDependencyFingerprint:
            image.item.layoutDependencyFingerprint,
          nextFit: "cover",
          nextCrop: crop,
        })
      if (derived.status !== "accepted") {
        throw new Error("source history summary blocked")
      }
      const previous = current
      const next =
        createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
          previousSourceState: previous,
          sourceItemAuthority: derived.sourceItemAuthority,
          inlineId: image.item.inlineId,
          expectedImageSourceFingerprint: image.item.sourceFingerprint,
          expectedImageDependencyFingerprint:
            image.item.layoutDependencyFingerprint,
          nextFit: "cover",
          nextCrop: crop,
        })
      if (next.status !== "prepared") {
        throw new Error("source history transition blocked")
      }
      expect(
        hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1(
          previous,
          next.sourceState,
        ),
      ).toBe(true)
      expect(
        hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1(
          next.sourceState,
          previous,
        ),
      ).toBe(false)
      current = next.sourceState
      if (revision === 0) firstSuccessor = current
    }

    const probeCounts = (
      sourceStateToProbe: typeof current,
    ): readonly number[] => {
      const observations: number[] = []
      setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
        (observation) => observations.push(observation.indexProbeCount),
      )
      try {
        expect(
          lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
            sourceState: sourceStateToProbe,
            inlineId: "text-a",
          }),
        ).toMatchObject({
          status: "found",
          item: { inlineId: "text-a", kind: "text" },
        })
      } finally {
        setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
          null,
        )
      }
      return observations
    }
    expect(probeCounts(firstSuccessor)).toEqual([1])
    expect(probeCounts(current)).toEqual([1])
  })

  it("checks V3 leaf reads and path copies before each source operation", () => {
    const boundaries = postBindingSourceTestBoundaries()
    expect(boundaries.setLimit).toBeTypeOf("function")
    expect(boundaries.setObserver).toBeTypeOf("function")
    if (boundaries.setLimit == null || boundaries.setObserver == null) return
    const createGuardedSourceTransition = (
      createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1
    ) as unknown as (input: unknown) => unknown
    const run = (fixture: ReturnType<typeof v3SourceTransitionFixture>) =>
      createGuardedSourceTransition({
          previousSourceState: fixture.previousRoot.sourceState,
          sourceItemAuthority: fixture.sourceItemAuthority,
          inlineId: fixture.change.inlineId,
          expectedImageSourceFingerprint:
            fixture.change.expectedImageSourceFingerprint,
          expectedImageDependencyFingerprint:
            fixture.change.expectedImageDependencyFingerprint,
          nextFit: fixture.change.nextFit,
          nextCrop: fixture.change.nextCrop,
          validatedChange: fixture.bound.validatedChange,
          completedCandidateWork:
            fixture.bound.incrementalCandidateWork,
          stageVisitGuard: fixture.guard,
        })

    const normalEvents: unknown[] = []
    boundaries.setObserver((value) => normalEvents.push(value))
    try {
      const normal = v3SourceTransitionFixture()
      expect(normal.guard).not.toBeNull()
      expect(run(normal)).toMatchObject({
        status: "prepared",
        copiedSourcePathNodeCount: 1,
        visitedChangedSourceLeafItemCount: 4,
        completedCandidateWork: {
          flow: {
            copiedSourcePathNodeCount: 1,
            visitedChangedSourceLeafItemCount: 4,
          },
        },
      })
      expect(normalEvents).toEqual([
        { unit: "source-leaf-items", completedWork: 1 },
        { unit: "source-leaf-items", completedWork: 2 },
        { unit: "source-leaf-items", completedWork: 3 },
        { unit: "source-leaf-items", completedWork: 4 },
        { unit: "source-path-copy-nodes", completedWork: 1 },
      ])
    } finally {
      boundaries.setObserver(null)
    }

    for (const row of [
      {
        unit: "source-leaf-items" as const,
        expectedEvents: [] as readonly unknown[],
        expectedWork: {
          copiedSourcePathNodeCount: 0,
          visitedChangedSourceLeafItemCount: 0,
        },
      },
      {
        unit: "source-path-copy-nodes" as const,
        expectedEvents: [
          { unit: "source-leaf-items", completedWork: 1 },
          { unit: "source-leaf-items", completedWork: 2 },
          { unit: "source-leaf-items", completedWork: 3 },
          { unit: "source-leaf-items", completedWork: 4 },
        ],
        expectedWork: {
          copiedSourcePathNodeCount: 0,
          visitedChangedSourceLeafItemCount: 4,
        },
      },
    ]) {
      const events: unknown[] = []
      boundaries.setLimit({
        stage: "source-flow",
        unit: row.unit,
        effectiveLimit: 0,
      })
      boundaries.setObserver((value) => events.push(value))
      try {
        const fixture = v3SourceTransitionFixture()
        const result = run(fixture)
        expect(result).toMatchObject({
          status: "invariant-blocked",
          sourceState: null,
          ...row.expectedWork,
          completedCandidateWork: { flow: row.expectedWork },
        })
        expect(result).not.toHaveProperty("evaluatorAuthority")
        expect(events).toEqual(row.expectedEvents)
      } finally {
        boundaries.setLimit(null)
        boundaries.setObserver(null)
      }
    }
  })

  it("reports exact image lookup, path-copy, and changed-leaf work", () => {
    const built = sourceState(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "contain",
    }))
    const item = lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
      sourceState: built.sourceState,
      inlineId: "image-1",
    })
    if (item.status !== "found" || item.item.kind !== "inline-image") {
      throw new Error("source work fixture image missing")
    }
    const changed =
      deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
        sourceState: built.sourceState,
        inlineId: item.item.inlineId,
        expectedImageSourceFingerprint: item.item.sourceFingerprint,
        expectedImageDependencyFingerprint:
          item.item.layoutDependencyFingerprint,
        nextFit: "cover",
        nextCrop: { x: 0, y: 0, width: 0.5, height: 1 },
      })
    expect(changed).toMatchObject({
      status: "accepted",
      visitedSourceLookupNodeCount: 1,
      visitedSourceItemCount: 1,
    })
    if (changed.status !== "accepted") return
    const copied =
      createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
        previousSourceState: built.sourceState,
        sourceItemAuthority: changed.sourceItemAuthority,
        inlineId: item.item.inlineId,
        expectedImageSourceFingerprint: item.item.sourceFingerprint,
        expectedImageDependencyFingerprint:
          item.item.layoutDependencyFingerprint,
        nextFit: "cover",
        nextCrop: { x: 0, y: 0, width: 0.5, height: 1 },
      })
    expect(copied).toMatchObject({
      status: "prepared",
      copiedSourcePathNodeCount: 1,
      visitedChangedSourceLeafItemCount: 1,
      createdNodeCount: 1,
    })

    const unchanged =
      deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
        sourceState: built.sourceState,
        inlineId: item.item.inlineId,
        expectedImageSourceFingerprint: item.item.sourceFingerprint,
        expectedImageDependencyFingerprint:
          item.item.layoutDependencyFingerprint,
        nextFit: "contain",
        nextCrop: null,
      })
    if (unchanged.status !== "accepted") {
      throw new Error("source semantic no-op summary blocked")
    }
    expect(createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
      previousSourceState: built.sourceState,
      sourceItemAuthority: unchanged.sourceItemAuthority,
      inlineId: item.item.inlineId,
      expectedImageSourceFingerprint: item.item.sourceFingerprint,
      expectedImageDependencyFingerprint:
        item.item.layoutDependencyFingerprint,
      nextFit: "contain",
      nextCrop: null,
    })).toMatchObject({
      status: "unchanged",
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
      createdNodeCount: 0,
    })

    const rows = [
      { lineCount: 1, lookupNodes: 1, firstLeafItems: 3, lastLeafItems: 3 },
      { lineCount: 8, lookupNodes: 2, firstLeafItems: 8, lastLeafItems: 8 },
      { lineCount: 9, lookupNodes: 2, firstLeafItems: 8, lastLeafItems: 3 },
      { lineCount: 64, lookupNodes: 3, firstLeafItems: 8, lastLeafItems: 8 },
      { lineCount: 65, lookupNodes: 3, firstLeafItems: 8, lastLeafItems: 3 },
      { lineCount: 128, lookupNodes: 3, firstLeafItems: 8, lastLeafItems: 8 },
    ] as const
    for (const row of rows) {
      const repeatedSource = repeatedUnifiedLayoutRootSourceFixtureV1({
        lineCount: row.lineCount,
        includeImages: true,
      })
      const repeated = sourceState({
        initialFlow: repeatedSource.initialFlow,
        evidence: repeatedSource.evidence,
      })
      const targets = new Map([
        [0, row.firstLeafItems],
        [Math.floor(row.lineCount / 2), row.lineCount === 1 ? 3 : 8],
        [row.lineCount - 1, row.lastLeafItems],
      ])
      for (const [lineIndex, leafItems] of targets) {
        const target =
          lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
            sourceState: repeated.sourceState,
            inlineId: `repeat-image-${lineIndex}`,
          })
        if (target.status !== "found" || target.item.kind !== "inline-image") {
          throw new Error(`repeated source image ${lineIndex} missing`)
        }
        const summary =
          deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
            sourceState: repeated.sourceState,
            inlineId: target.item.inlineId,
            expectedImageSourceFingerprint: target.item.sourceFingerprint,
            expectedImageDependencyFingerprint:
              target.item.layoutDependencyFingerprint,
            nextFit: "cover",
            nextCrop: { x: 0.1, y: 0.2, width: 0.6, height: 0.7 },
          })
        expect(summary).toMatchObject({
          status: "accepted",
          visitedSourceLookupNodeCount: row.lookupNodes,
          visitedSourceItemCount: 1,
        })
        if (summary.status !== "accepted") continue
        expect(createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
          previousSourceState: repeated.sourceState,
          sourceItemAuthority: summary.sourceItemAuthority,
          inlineId: target.item.inlineId,
          expectedImageSourceFingerprint: target.item.sourceFingerprint,
          expectedImageDependencyFingerprint:
            target.item.layoutDependencyFingerprint,
          nextFit: "cover",
          nextCrop: { x: 0.1, y: 0.2, width: 0.6, height: 0.7 },
        })).toMatchObject({
          status: "prepared",
          copiedSourcePathNodeCount: row.lookupNodes,
          visitedChangedSourceLeafItemCount: leafItems,
        })
      }
    }
  }, 20_000)

  it("reports complete creation work but no accepted authority before graph commit", () => {
    const fixture = acceptedInlineImageEvidenceFixture({
      content: "text-image-text-break",
    })
    const result = sourceState(fixture)

    expect(result.work).toMatchObject({
      completeBuildCount: 1,
      visitedInitialFlowAtomCount: 4,
      createdItemCount: 4,
      reusedItemCount: 0,
      reusedNodeCount: 0,
      completeSuffixTraversalCount: 0,
    })
    expect(Object.isFrozen(result.sourceState)).toBe(true)
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      result.sourceState,
    )).toMatchObject({
      status: "prepared-unregistered",
      fingerprint: result.sourceState.fingerprint,
    })
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      structuredClone(result.sourceState),
    )).toMatchObject({
      status: "invalid",
      code: "source-state-authority-mismatch",
    })
  })

  it("blocks hostile, cloned, mismatched, and mutable dependencies without a candidate", () => {
    const fixture = acceptedInlineImageEvidenceFixture()
    const accessor = {}
    Object.defineProperty(accessor, "initialFlow", {
      enumerable: true,
      get() {
        throw new Error("must not read")
      },
    })
    Object.defineProperty(accessor, "evidence", {
      enumerable: true,
      value: fixture.evidence,
    })
    const proxy = new Proxy({}, {
      getPrototypeOf() {
        throw new Error("hostile")
      },
    })
    const callUnknown = (
      createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1
    ) as (value: unknown) => unknown

    for (const result of [
      callUnknown(accessor),
      callUnknown(proxy),
      createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
        initialFlow: structuredClone(fixture.initialFlow),
        evidence: fixture.evidence,
      }),
      createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
        initialFlow: fixture.initialFlow,
        evidence: structuredClone(fixture.evidence),
      }),
    ]) {
      expect(result).toMatchObject({ status: "blocked", sourceState: null })
    }
  })

  it("keeps exact prepared identity distinct under a forced digest collision", () => {
    const leftFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "contain",
    })
    const rightFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      fit: "cover",
    })
    const left = createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1(
      leftFixture,
    )
    const right = createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1(
      rightFixture,
    )
    expect(left.status).toBe("prepared")
    expect(right.status).toBe("prepared")
    if (left.status !== "prepared" || right.status !== "prepared") {
      throw new Error("forced-collision source state blocked")
    }

    expect(left.sourceState.fingerprint).toBe(right.sourceState.fingerprint)
    expect(left.sourceState).not.toBe(right.sourceState)
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      left.sourceState,
    ).status).toBe("prepared-unregistered")
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      right.sourceState,
    ).status).toBe("prepared-unregistered")
  })
})
