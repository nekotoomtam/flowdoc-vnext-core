import { describe, expect, it } from "vitest"
import * as lineTreeInternals from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import * as transitionEvidenceInternals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
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
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
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
import {
  imagePaintUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

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

function repeatedTree(lineCount: number) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages: false,
  })
  const accepted = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: [],
  })
  if (accepted.status !== "accepted") throw new Error("repeated root blocked")
  return lineTreeFromAcceptedRoot(accepted, [])
}

function v3LineCoverFixture() {
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
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: previous.root,
    change,
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  })
  if (bound.status !== "accepted") throw new Error("V3 change did not bind")
  return { previousRoot: previous.root, bound }
}

function lineVisitTestBoundaries() {
  const evidence = transitionEvidenceInternals as unknown as {
    readonly setVNextTextBlockPostBindingLimitOverrideForTestInternalV1?:
      (value: unknown) => void
  }
  const lines = lineTreeInternals as unknown as {
    readonly setVNextTextBlockLineCoverOperationObserverForTestInternalV1?:
      (observer: ((value: unknown) => void) | null) => void
  }
  return {
    setLimit:
      evidence.setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
    setObserver:
      lines.setVNextTextBlockLineCoverOperationObserverForTestInternalV1,
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

    const built = repeatedTree(9)
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

  it("checks V3 line lookup and selected-subtree work before each operation", () => {
    const boundaries = lineVisitTestBoundaries()
    expect(boundaries.setLimit).toBeTypeOf("function")
    expect(boundaries.setObserver).toBeTypeOf("function")
    if (boundaries.setLimit == null || boundaries.setObserver == null) return
    const createBounded =
      createVNextTextBlockLineDispositionCoverInternalV1 as unknown as (
        input: unknown,
        context: unknown,
      ) => unknown
    for (const row of [
      {
        unit: "line-tree-lookup-nodes" as const,
        limits: [
          { effectiveLimit: 3, status: "accepted" },
          { effectiveLimit: 2, status: "accepted" },
          { effectiveLimit: 1, status: "limit-exceeded" },
        ],
        rejectedEvents: [
          { unit: "line-tree-lookup-nodes", completedWork: 1 },
          { unit: "selected-exact-subtree-nodes", completedWork: 1 },
        ],
        rejectedWork: {
          visitedPreviousLineTreeNodeCount: 0,
          visitedNextLineTreeNodeCount: 1,
          selectedSubtreeNodeCount: 1,
        },
      },
      {
        unit: "selected-exact-subtree-nodes" as const,
        limits: [
          { effectiveLimit: 2, status: "accepted" },
          { effectiveLimit: 1, status: "accepted" },
          { effectiveLimit: 0, status: "limit-exceeded" },
        ],
        rejectedEvents: [
          { unit: "line-tree-lookup-nodes", completedWork: 1 },
        ],
        rejectedWork: {
          visitedPreviousLineTreeNodeCount: 0,
          visitedNextLineTreeNodeCount: 1,
          selectedSubtreeNodeCount: 0,
        },
      },
    ]) {
      for (const threshold of row.limits) {
        const fixture = v3LineCoverFixture()
        const lineCount = fixture.previousRoot.lineTree.summary.lineCount
        const events: unknown[] = []
        boundaries.setLimit({
          stage: "structural-reuse-proof",
          unit: row.unit,
          effectiveLimit: threshold.effectiveLimit,
        })
        boundaries.setObserver((value) => events.push(value))
        try {
          const result = createBounded({
            previousTree: fixture.previousRoot.lineTree,
            nextTree: fixture.previousRoot.lineTree,
            segments: [noOpSegment(lineCount)],
          }, {
            validatedChange: fixture.bound.validatedChange,
            completedCandidateWork:
              fixture.bound.incrementalCandidateWork,
          })
          expect(result).toMatchObject({ status: threshold.status })
          if (threshold.status === "accepted") {
            expect(result).toMatchObject({
              work: {
                visitedPreviousLineTreeNodeCount: 1,
                visitedNextLineTreeNodeCount: 1,
                selectedSubtreeNodeCount: 1,
              },
              completedCandidateWork: {
                structuralReuseProof: {
                  visitedLineTreeNodeCount: 2,
                  selectedExactSubtreeNodeCount: 1,
                },
              },
            })
            expect(events).toEqual([
              { unit: "line-tree-lookup-nodes", completedWork: 1 },
              { unit: "selected-exact-subtree-nodes", completedWork: 1 },
              { unit: "line-tree-lookup-nodes", completedWork: 2 },
            ])
          } else {
            expect(result).toMatchObject({
              status: "limit-exceeded",
              cover: null,
              work: row.rejectedWork,
              attemptedWork: threshold.effectiveLimit + 1,
              effectiveLimit: threshold.effectiveLimit,
              completedCandidateWork: {
                structuralReuseProof: {
                  visitedLineTreeNodeCount:
                    row.rejectedWork.visitedPreviousLineTreeNodeCount
                    + row.rejectedWork.visitedNextLineTreeNodeCount,
                  selectedExactSubtreeNodeCount:
                    row.rejectedWork.selectedSubtreeNodeCount,
                },
              },
            })
            expect(result).toHaveProperty("evaluatorAuthority")
            expect(events).toEqual(row.rejectedEvents)
          }
        } finally {
          boundaries.setLimit(null)
          boundaries.setObserver(null)
        }
      }
    }
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
    expect(result.work).toEqual({
      visitedPreviousLineTreeNodeCount: 1,
      visitedNextLineTreeNodeCount: 1,
      selectedSubtreeNodeCount: 1,
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

  it("reports exact maximal-cover visits separately from selected subtrees", () => {
    const built = repeatedTree(9)
    const result = createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: built.tree,
      nextTree: built.tree,
      segments: [
        {
          disposition: "E",
          previousRange: { start: 0, end: 4 },
          nextRange: { start: 0, end: 4 },
          constantYDeltaLayoutUnit: null,
        },
        {
          disposition: "R",
          previousRange: { start: 4, end: 9 },
          nextRange: { start: 4, end: 9 },
          constantYDeltaLayoutUnit: null,
        },
      ],
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    expect(result.cover.covers.map((row) => ({
      disposition: row.disposition,
      subtreeCount: row.subtreeFingerprints.length,
    }))).toEqual([
      { disposition: "E", subtreeCount: 1 },
      { disposition: "R", subtreeCount: 1 },
    ])
    expect(result.work).toEqual({
      visitedPreviousLineTreeNodeCount: 3,
      visitedNextLineTreeNodeCount: 6,
      selectedSubtreeNodeCount: 2,
    })
  })

  it.each([
    {
      lineCount: 8,
      exactStart: 0,
      expected: { previous: 9, next: 18, selected: 8 },
    },
    {
      lineCount: 8,
      exactStart: 4,
      expected: { previous: 9, next: 27, selected: 8 },
    },
    {
      lineCount: 8,
      exactStart: 7,
      expected: { previous: 9, next: 18, selected: 8 },
    },
    {
      lineCount: 9,
      exactStart: 0,
      expected: { previous: 7, next: 14, selected: 5 },
    },
    {
      lineCount: 9,
      exactStart: 4,
      expected: { previous: 8, next: 19, selected: 6 },
    },
    {
      lineCount: 9,
      exactStart: 8,
      expected: { previous: 8, next: 16, selected: 6 },
    },
  ])(
    "counts canonical first/middle/last visits for $lineCount lines at $exactStart",
    ({ lineCount, exactStart, expected }) => {
      const built = repeatedTree(lineCount)
      const exactEnd = exactStart + 1
      const segments: VNextTextBlockLineDispositionSegmentV1[] = []
      if (exactStart > 0) {
        segments.push({
          disposition: "R",
          previousRange: { start: 0, end: exactStart },
          nextRange: { start: 0, end: exactStart },
          constantYDeltaLayoutUnit: null,
        })
      }
      segments.push({
        disposition: "E",
        previousRange: { start: exactStart, end: exactEnd },
        nextRange: { start: exactStart, end: exactEnd },
        constantYDeltaLayoutUnit: null,
      })
      if (exactEnd < lineCount) {
        segments.push({
          disposition: "R",
          previousRange: { start: exactEnd, end: lineCount },
          nextRange: { start: exactEnd, end: lineCount },
          constantYDeltaLayoutUnit: null,
        })
      }

      const result = createVNextTextBlockLineDispositionCoverInternalV1({
        previousTree: built.tree,
        nextTree: built.tree,
        segments,
      })
      expect(result.status).toBe("accepted")
      if (result.status !== "accepted") return
      expect(result.cover.counts).toEqual({
        E: 1,
        T: 0,
        R: lineCount - 1,
        N: 0,
        removed: 0,
      })
      expect(result.work).toEqual({
        visitedPreviousLineTreeNodeCount: expected.previous,
        visitedNextLineTreeNodeCount: expected.next,
        selectedSubtreeNodeCount: expected.selected,
      })
      expect(result.cover.work.selectedSubtreeCount).toBe(expected.selected)
    },
  )

  it("keeps E/T/R/N mutually exclusive and exhaustive", () => {
    const built = repeatedTree(4)
    const result = createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: built.tree,
      nextTree: built.tree,
      segments: [
        {
          disposition: "E",
          previousRange: { start: 0, end: 1 },
          nextRange: { start: 0, end: 1 },
          constantYDeltaLayoutUnit: null,
        },
        {
          disposition: "T",
          previousRange: { start: 1, end: 2 },
          nextRange: { start: 1, end: 2 },
          constantYDeltaLayoutUnit: 0,
        },
        {
          disposition: "R",
          previousRange: { start: 2, end: 3 },
          nextRange: { start: 2, end: 3 },
          constantYDeltaLayoutUnit: null,
        },
        {
          disposition: "N",
          previousRange: null,
          nextRange: { start: 3, end: 4 },
          constantYDeltaLayoutUnit: null,
        },
      ],
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    expect(result.cover.counts).toEqual({
      E: 1,
      T: 1,
      R: 1,
      N: 1,
      removed: 1,
    })
    expect(result.cover.covers.map((row) => row.disposition)).toEqual([
      "E",
      "T",
      "R",
      "N",
    ])
  })

  it("preserves factual traversal work when exact subtree identity blocks", () => {
    const previous = repeatedTree(9)
    const next = repeatedTree(9)
    const result = createVNextTextBlockLineDispositionCoverInternalV1({
      previousTree: previous.tree,
      nextTree: next.tree,
      segments: [noOpSegment(9)],
    })

    expect(result.status).toBe("blocked")
    expect(result.issues[0]?.code).toBe("line-disposition-not-exact-reuse")
    expect(result.work).toEqual({
      visitedPreviousLineTreeNodeCount: 1,
      visitedNextLineTreeNodeCount: 1,
      selectedSubtreeNodeCount: 1,
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
