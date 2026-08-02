import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
  createVNextTextBlockIncrementalFlowTreeWithForcedCollisionForTestInternalV1,
  inspectVNextTextBlockIncrementalFlowTreeInternalV1,
  lookupVNextTextBlockIncrementalFlowAtomInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import type {
  VNextTextBlockFlowEvidenceV2,
} from "../src/layout/textBlockFlowEvidenceContractV2.js"
import type {
  VNextTextBlockInitialFlowV1,
} from "../src/layout/textBlockInitialFlowInputV1.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"
import { repeatedUnifiedLayoutRootSourceFixtureV1 } from "./helpers/textBlockUnifiedLayoutRootV1.js"

function completePair(fixture: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
}) {
  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
    {
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
    },
  )
  if (source.status !== "prepared") {
    throw new Error(`source state blocked: ${JSON.stringify(source.issues)}`)
  }
  const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
    sourceState: source.sourceState,
    evidence: fixture.evidence,
  })
  if (flow.status !== "prepared") {
    throw new Error(`flow tree blocked: ${JSON.stringify(flow.issues)}`)
  }
  return { source, flow }
}

function leafItemCounts(
  node: ReturnType<typeof completePair>["flow"]["flowTree"]["root"],
): number[] {
  if (node.nodeKind === "leaf") return [node.atoms.length]
  return node.children.flatMap(leafItemCounts)
}

describe("Phase 5B layout-only incremental flow tree", () => {
  it("changes for font-size and image outer-size dependencies", () => {
    const normalText = completePair(acceptedInlineImageEvidenceFixture({
      content: "thai-image-latin",
      mixedTextSizes: false,
    }))
    const largeText = completePair(acceptedInlineImageEvidenceFixture({
      content: "thai-image-latin",
      mixedTextSizes: true,
    }))
    const narrowImage = completePair(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      width: { value: 10, unit: "pt" },
    }))
    const wideImage = completePair(acceptedInlineImageEvidenceFixture({
      content: "image-only",
      width: { value: 20, unit: "pt" },
    }))

    expect(largeText.flow.flowTree.fingerprint)
      .not.toBe(normalText.flow.flowTree.fingerprint)
    expect(wideImage.flow.flowTree.fingerprint)
      .not.toBe(narrowImage.flow.flowTree.fingerprint)
    expect(largeText.flow.flowTree.summary.lineInternalsDependencyFingerprint)
      .not.toBe(normalText.flow.flowTree.summary.lineInternalsDependencyFingerprint)
    expect(wideImage.flow.flowTree.summary.lineInternalsDependencyFingerprint)
      .not.toBe(narrowImage.flow.flowTree.summary.lineInternalsDependencyFingerprint)
  })

  it("uses local atom coordinates and summary-guided rendered-offset lookup", () => {
    const built = completePair(acceptedInlineImageEvidenceFixture({
      content: "text-image-text-break",
    }))
    const tree = built.flow.flowTree
    const found = lookupVNextTextBlockIncrementalFlowAtomInternalV1({
      flowTree: tree,
      renderedUtf16Offset: 2,
    })

    expect(found).toMatchObject({
      status: "found",
      absoluteStartRenderedUtf16: 2,
      absoluteEndRenderedUtf16: 3,
      atom: {
        kind: "text-cluster",
        inlineId: "text-b",
        localStartRenderedUtf16: 0,
        localEndRenderedUtf16: 1,
      },
      work: {
        completeTreeTraversalCount: 0,
      },
    })
    expect(found.status === "found" && found.work.visitedNodeCount)
      .toBeLessThanOrEqual(tree.root.height + 1)
    if (tree.root.nodeKind !== "leaf") throw new Error("small flow root not leaf")
    for (const atom of tree.root.atoms) {
      expect(atom).not.toHaveProperty("renderStartOffset")
      expect(atom).not.toHaveProperty("renderEndOffset")
      expect(atom).not.toHaveProperty("textColor")
      if (atom.kind === "inline-image") {
        expect(atom).not.toHaveProperty("fit")
        expect(atom).not.toHaveProperty("crop")
        expect(atom).not.toHaveProperty("authoredFrame")
      }
    }
  })

  it("packs complete leaves and branches with the canonical trailing-nine rule", () => {
    const fixture = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 5,
      includeImages: false,
    })
    const built = completePair(fixture)
    const tree = built.flow.flowTree

    expect(tree.summary.atomCount).toBe(65)
    expect(leafItemCounts(tree.root)).toEqual([8, 8, 8, 8, 8, 8, 8, 4, 5])
    expect(tree.root.nodeKind).toBe("branch")
    if (tree.root.nodeKind !== "branch") throw new Error("large flow root not branch")
    expect(tree.root.height).toBe(2)
    expect(tree.root.children.map((child) => (
      child.nodeKind === "branch" ? child.children.length : 0
    ))).toEqual([4, 5])
    expect(built.flow.work).toMatchObject({
      completeBuildCount: 1,
      visitedSourceItemCount: 10,
      createdAtomCount: 65,
      createdLeafCount: 9,
      createdNodeCount: 12,
      reusedAtomCount: 0,
      reusedNodeCount: 0,
      completeTreeRebuildCount: 1,
      completeSuffixTraversalCount: 0,
    })
  })

  it("keeps one exact complete cluster across adjacent Source items", () => {
    const built = completePair(acceptedInlineImageEvidenceFixture({
      content: "adjacent-text",
      breakOffsets: [0, 2],
    }))
    const root = built.flow.flowTree.root
    if (root.nodeKind !== "leaf") throw new Error("adjacent Flow root missing")
    expect(root.atoms).toHaveLength(1)
    expect(root.atoms[0]).toMatchObject({
      kind: "text-cluster",
      renderedText: "fi",
      renderedUtf16Length: 2,
      localStartRenderedUtf16: 0,
      localEndRenderedUtf16: 2,
      advanceLayoutUnit: 6_000_000,
    })
    expect(root.atoms[0]!.lineageId).toMatch(/^composite-cluster:/)
  })

  it("rejects foreign source/evidence bindings and stays unregistered", () => {
    const fixture = acceptedInlineImageEvidenceFixture()
    const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
      fixture,
    )
    if (source.status !== "prepared") throw new Error("source state blocked")

    const foreignSource = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: structuredClone(source.sourceState),
      evidence: fixture.evidence,
    })
    const foreignEvidence = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: source.sourceState,
      evidence: structuredClone(fixture.evidence),
    })
    expect(foreignSource).toMatchObject({ status: "blocked", flowTree: null })
    expect(foreignEvidence).toMatchObject({ status: "blocked", flowTree: null })

    const built = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: source.sourceState,
      evidence: fixture.evidence,
    })
    expect(built.status).toBe("prepared")
    if (built.status !== "prepared") throw new Error("flow tree blocked")
    expect(Object.isFrozen(built.flowTree)).toBe(true)
    expect(inspectVNextTextBlockIncrementalFlowTreeInternalV1(
      built.flowTree,
    )).toMatchObject({
      status: "prepared-unregistered",
      fingerprint: built.flowTree.fingerprint,
    })
    expect(inspectVNextTextBlockIncrementalFlowTreeInternalV1(
      structuredClone(built.flowTree),
    )).toMatchObject({
      status: "invalid",
      code: "flow-tree-authority-mismatch",
    })
  })

  it("keeps exact prepared candidates distinct under forced digest collision", () => {
    const leftFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      width: { value: 10, unit: "pt" },
    })
    const rightFixture = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      width: { value: 20, unit: "pt" },
    })
    const leftSource =
      createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(leftFixture)
    const rightSource =
      createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(rightFixture)
    if (leftSource.status !== "prepared" || rightSource.status !== "prepared") {
      throw new Error("collision source state blocked")
    }
    const left =
      createVNextTextBlockIncrementalFlowTreeWithForcedCollisionForTestInternalV1({
        sourceState: leftSource.sourceState,
        evidence: leftFixture.evidence,
      })
    const right =
      createVNextTextBlockIncrementalFlowTreeWithForcedCollisionForTestInternalV1({
        sourceState: rightSource.sourceState,
        evidence: rightFixture.evidence,
      })
    expect(left.status).toBe("prepared")
    expect(right.status).toBe("prepared")
    if (left.status !== "prepared" || right.status !== "prepared") {
      throw new Error("forced-collision flow tree blocked")
    }

    expect(left.flowTree.fingerprint).toBe(right.flowTree.fingerprint)
    expect(left.flowTree).not.toBe(right.flowTree)
    expect(inspectVNextTextBlockIncrementalFlowTreeInternalV1(
      left.flowTree,
    ).status).toBe("prepared-unregistered")
    expect(inspectVNextTextBlockIncrementalFlowTreeInternalV1(
      right.flowTree,
    ).status).toBe("prepared-unregistered")
  })
})
