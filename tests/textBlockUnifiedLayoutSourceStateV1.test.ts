import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextTextBlockInitialFlowV1,
  type TextRunStyleV4Target,
  type VNextTextBlockFlowEvidenceInputV2,
  type VNextTextBlockFlowEvidenceV2,
  type VNextTextBlockInitialFlowV1,
  type VNextTextBlockResolvedShapingRunV1,
} from "../src/index.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
  createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"
import { listImageGeometryBuildInputFixture } from "./helpers/textBlockInitialFlowV1.js"

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

describe("Phase 5B transition-native source state", () => {
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
