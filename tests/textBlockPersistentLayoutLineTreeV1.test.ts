import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  createVNextTextBlockLineDispositionCoverInternalV1,
  createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1,
  inspectVNextTextBlockLineDispositionCoverInternalV1,
  lookupVNextTextBlockPersistentLayoutLineInternalV1,
  verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1,
  VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_EMPTY_ROOT_V1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import type {
  VNextTextBlockLineDispositionSegmentV1,
} from "../src/layout/textBlockPersistentLayoutLineContractV1.js"
import type {
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../src/layout/textBlockSpatialIndexContractV1.js"
import type {
  InlineImageFlowFixtureOptions,
} from "./helpers/textBlockInlineImageFlowV2.js"
import {
  acceptedUnifiedLayoutRootFixtureV1,
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"

const owner = `sha256:${"a".repeat(64)}`

function exclusion(
  objectId: string,
  xLayoutUnit: number,
  yLayoutUnit: number,
): VNextTextBlockSyntheticPositionedObjectInputV1 {
  return {
    objectId,
    geometryOwnerFingerprint: owner,
    xLayoutUnit,
    yLayoutUnit,
    widthLayoutUnit: 20_000_000,
    heightLayoutUnit: 10_000_000,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: "rectangular-exclusion",
  }
}

function lineTreeFromAcceptedRoot(
  accepted: ReturnType<typeof acceptedUnifiedLayoutRootFixtureV1>,
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[],
) {
  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
    initialFlow: accepted.root.initialFlow,
    evidence: accepted.root.evidence,
  })
  if (source.status !== "prepared") throw new Error("source state blocked")
  const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
    sourceState: source.sourceState,
    evidence: accepted.root.evidence,
  })
  if (flow.status !== "prepared") throw new Error("flow tree blocked")
  const spatial = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
    sourceState: source.sourceState,
    entries,
  })
  if (spatial.status !== "prepared") throw new Error("spatial state blocked")
  const lines = createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
    sourceState: source.sourceState,
    flowTree: flow.flowTree,
    spatialState: spatial.spatialState,
    spatialLayout: accepted.root.spatialLayout,
    authoredBoxGeometry: accepted.root.authoredBoxGeometry,
  })
  if (lines.status !== "prepared") {
    throw new Error(`line tree blocked: ${JSON.stringify(lines.issues)}`)
  }
  return {
    accepted,
    source: source.sourceState,
    flow: flow.flowTree,
    spatial: spatial.spatialState,
    tree: lines.lineTree,
    work: lines.work,
  }
}

function completeTree(
  options: InlineImageFlowFixtureOptions = {},
) {
  return lineTreeFromAcceptedRoot(
    acceptedUnifiedLayoutRootFixtureV1(options),
    options.entries ?? [],
  )
}

function noOpSegment(lineCount: number): VNextTextBlockLineDispositionSegmentV1 {
  return {
    disposition: "E",
    previousRange: { start: 0, end: lineCount },
    nextRange: { start: 0, end: lineCount },
    constantYDeltaLayoutUnit: null,
  }
}

describe("Phase 5B persistent layout line tree", () => {
  it("projects one leaf per complete line with separated immutable facts", () => {
    const built = completeTree({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    const tree = built.tree

    expect(tree.summary.lineCount)
      .toBe(built.accepted.root.authoredBoxGeometry.summary.lineCount)
    expect(tree.summary.fragmentCount).toBe(
      built.accepted.root.authoredBoxGeometry.summary.textFragmentCount
      + built.accepted.root.authoredBoxGeometry.summary.inlineImageFragmentCount,
    )
    expect(tree.summary.leafCount).toBe(tree.summary.lineCount)
    expect(tree.contracts).toMatchObject({
      oneLogicalLinePerLeaf: true,
      paintFactsExcluded: true,
      preparedGraphCandidate: true,
      registeredAuthority: false,
    })
    const first = lookupVNextTextBlockPersistentLayoutLineInternalV1({
      lineTree: tree,
      lineOrdinal: 0,
    })
    expect(first).toMatchObject({
      status: "found",
      lineOrdinal: 0,
      leaf: {
        nodeKind: "leaf",
        line: {
          lineInternals: expect.any(Object),
          sourceMapping: expect.any(Object),
          contentLocalGeometry: expect.any(Object),
          authoredBoxGeometry: expect.any(Object),
        },
      },
      work: { completeTreeTraversalCount: 0 },
    })
    if (first.status !== "found") throw new Error("first line missing")
    expect(first.leaf.line).not.toHaveProperty("index")
    expect(first.leaf.line).not.toHaveProperty("renderStartOffset")
    expect(first.leaf.line).not.toHaveProperty("renderEndOffset")
    expect(JSON.stringify(first.leaf.line.lineInternals)).not.toContain("textColor")
    expect(JSON.stringify(first.leaf.line.lineInternals)).not.toContain("\"fit\"")
    expect(JSON.stringify(first.leaf.line.lineInternals)).not.toContain("\"crop\"")
  })

  it("keeps the complete line fingerprint equal across image paint-only changes", () => {
    const contain = completeTree({
      content: "image-only",
      fit: "contain",
    })
    const cover = completeTree({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })

    expect(contain.source.fingerprint).not.toBe(cover.source.fingerprint)
    expect(contain.tree.fingerprint).toBe(cover.tree.fingerprint)
    expect(contain.tree.summary.lineInternalsFingerprint)
      .toBe(cover.tree.summary.lineInternalsFingerprint)
    expect(contain.tree).not.toBe(cover.tree)
  })

  it("uses the contract-specific empty sentinel and canonical eight-way levels", () => {
    expect(VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_EMPTY_ROOT_V1).toMatchObject({
      nodeKind: "empty",
      height: 0,
      summary: {
        lineCount: 0,
        fragmentCount: 0,
        leafCount: 0,
        nodeCount: 1,
      },
    })
    expect(Object.isFrozen(
      VNEXT_TEXT_BLOCK_PERSISTENT_LAYOUT_EMPTY_ROOT_V1,
    )).toBe(true)

    const source = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 9,
      includeImages: false,
    })
    const accepted = createVNextTextBlockUnifiedLayoutRootV1({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: source.initialFlow,
      evidence: source.evidence,
      spatialEntries: [],
    })
    if (accepted.status !== "accepted") throw new Error("repeated root blocked")
    const built = lineTreeFromAcceptedRoot(accepted, [])
    expect(built.tree.summary.lineCount).toBe(9)
    expect(built.tree.root.nodeKind).toBe("branch")
    if (built.tree.root.nodeKind !== "branch") throw new Error("line root not branch")
    expect(built.tree.root.children).toHaveLength(2)
    expect(built.tree.root.children.map((child) => child.summary.lineCount))
      .toEqual([4, 5])
    expect(built.work).toMatchObject({
      completeBuildCount: 1,
      visitedLineCount: 9,
      createdLeafCount: 9,
      createdNodeCount: 12,
      reusedLeafCount: 0,
      reusedNodeCount: 0,
      completeSuffixTraversalCount: 0,
    })
  })

  it("creates one maximal root cover for a true no-op", () => {
    const built = completeTree({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    const lineCount = built.tree.summary.lineCount
    const result = createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: built.tree,
      nextTree: built.tree,
      segments: [noOpSegment(lineCount)],
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("no-op cover blocked")

    expect(result.cover.covers).toEqual([{
      disposition: "E",
      previousRange: { start: 0, end: lineCount },
      nextRange: { start: 0, end: lineCount },
      constantYDeltaLayoutUnit: null,
      subtreeFingerprints: [built.tree.root.fingerprint],
    }])
    expect(result.cover.counts).toEqual({
      E: lineCount,
      T: 0,
      R: 0,
      N: 0,
      removed: 0,
    })
    expect(result.cover.work).toMatchObject({
      visitedSegmentCount: 1,
      selectedSubtreeCount: 1,
      enumeratedLineCount: 0,
    })
    expect(inspectVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: built.tree,
      nextTree: built.tree,
      cover: result.cover,
    })).toEqual({
      status: "valid",
      fingerprint: result.cover.fingerprint,
    })
  })

  it("blocks overlap, gaps, non-maximal splits, and non-exhaustive coverage", () => {
    const built = completeTree({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    const lineCount = built.tree.summary.lineCount
    expect(lineCount).toBeGreaterThan(1)
    const invalid: readonly (readonly VNextTextBlockLineDispositionSegmentV1[])[] = [
      [{
        ...noOpSegment(lineCount),
        nextRange: { start: 1, end: lineCount },
      }],
      [
        {
          disposition: "E",
          previousRange: { start: 0, end: 1 },
          nextRange: { start: 0, end: 1 },
          constantYDeltaLayoutUnit: null,
        },
        {
          disposition: "R",
          previousRange: { start: 0, end: lineCount },
          nextRange: { start: 0, end: lineCount },
          constantYDeltaLayoutUnit: null,
        },
      ],
      [
        {
          disposition: "E",
          previousRange: { start: 0, end: 1 },
          nextRange: { start: 0, end: 1 },
          constantYDeltaLayoutUnit: null,
        },
        {
          disposition: "E",
          previousRange: { start: 1, end: lineCount },
          nextRange: { start: 1, end: lineCount },
          constantYDeltaLayoutUnit: null,
        },
      ],
      [],
    ]
    for (const segments of invalid) {
      expect(createVNextTextBlockLineDispositionCoverInternalV1({
        previousTree: built.tree,
        nextTree: built.tree,
        segments,
      })).toMatchObject({
        status: "blocked",
        cover: null,
      })
    }
  })

  it("blocks false E/T claims across source, provenance, or spatial-boundary drift", () => {
    const text = completeTree({ content: "text-only" })
    const image = completeTree({ content: "image-only" })
    expect(text.tree.summary.lineCount).toBe(image.tree.summary.lineCount)
    const lineCount = text.tree.summary.lineCount
    expect(createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: text.tree,
      nextTree: image.tree,
      segments: [noOpSegment(lineCount)],
    })).toMatchObject({
      status: "blocked",
      cover: null,
      issues: [{ code: "line-disposition-source-mismatch" }],
    })

    const otherDocument = completeTree({
      content: "text-only",
      documentId: "document-other",
    })
    expect(createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: text.tree,
      nextTree: otherDocument.tree,
      segments: [noOpSegment(lineCount)],
    })).toMatchObject({
      status: "blocked",
      cover: null,
      issues: [{ code: "line-disposition-provenance-mismatch" }],
    })

    const baseline = completeTree({ content: "text-image-text" })
    const entry = exclusion("middle", 40_000_000, 0)
    const wrapped = completeTree({
      content: "text-image-text",
      entries: [entry],
    })
    expect(baseline.tree.summary.lineCount).toBe(wrapped.tree.summary.lineCount)
    expect(createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: baseline.tree,
      nextTree: wrapped.tree,
      segments: [{
        disposition: "T",
        previousRange: { start: 0, end: baseline.tree.summary.lineCount },
        nextRange: { start: 0, end: wrapped.tree.summary.lineCount },
        constantYDeltaLayoutUnit: 0,
      }],
    })).toMatchObject({
      status: "blocked",
      cover: null,
      issues: [{ code: "line-disposition-boundary-mismatch" }],
    })
  })

  it("rejects foreign dependencies and returns only an unregistered candidate", () => {
    const accepted = acceptedUnifiedLayoutRootFixtureV1()
    const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
      initialFlow: accepted.root.initialFlow,
      evidence: accepted.root.evidence,
    })
    if (source.status !== "prepared") throw new Error("source state blocked")
    const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: source.sourceState,
      evidence: accepted.root.evidence,
    })
    const spatial = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
      sourceState: source.sourceState,
      entries: [],
    })
    if (flow.status !== "prepared" || spatial.status !== "prepared") {
      throw new Error("line dependency blocked")
    }
    const exact = createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
      sourceState: source.sourceState,
      flowTree: flow.flowTree,
      spatialState: spatial.spatialState,
      spatialLayout: accepted.root.spatialLayout,
      authoredBoxGeometry: accepted.root.authoredBoxGeometry,
    })
    expect(exact.status).toBe("prepared")
    if (exact.status !== "prepared") throw new Error("line tree blocked")
    expect(verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      exact.lineTree,
    )).toMatchObject({
      status: "valid-candidate",
      registeredAuthority: false,
    })
    expect(verifyVNextTextBlockPersistentLayoutLineTreeCandidateInternalV1(
      structuredClone(exact.lineTree),
    )).toMatchObject({
      status: "invalid",
      code: "line-tree-authority-mismatch",
    })
    expect(createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
      sourceState: source.sourceState,
      flowTree: flow.flowTree,
      spatialState: spatial.spatialState,
      spatialLayout: structuredClone(accepted.root.spatialLayout),
      authoredBoxGeometry: accepted.root.authoredBoxGeometry,
    })).toMatchObject({
      status: "blocked",
      lineTree: null,
    })
  })
})
