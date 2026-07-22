import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  collectVNextTextBlockPersistentFlowNodesForQaV1,
  createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1,
  createVNextTextBlockMultiRunIncrementalSnapshotV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockPersistentFlowUpdateV1,
  inspectVNextTextBlockPersistentFlowUpdateV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockPersistentFlowNodeV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  persistentFlowArbitraryChainedEditFixtures,
  persistentFlowEditFixture,
  persistentFlowMultiLevelEditFixture,
} from "./helpers/textBlockPersistentFlowV1.js"

const encoder = new TextEncoder()

function shallowCreatedNodeFacts(node: VNextTextBlockPersistentFlowNodeV1): unknown {
  return node.nodeKind === "leaf"
    ? {
        nodeKind: node.nodeKind,
        height: node.height,
        summary: node.summary,
        fingerprint: node.fingerprint,
        items: node.items,
      }
    : {
        nodeKind: node.nodeKind,
        height: node.height,
        summary: node.summary,
        fingerprint: node.fingerprint,
        childFingerprints: node.children.map((child) => child.fingerprint),
      }
}

function replaceTextAt(text: string, start: number, end: number, value: string): string {
  return `${text.slice(0, start)}${value}${text.slice(end)}`
}

function splitMeasurementRun(
  request: VNextTextBlockMultiRunLayoutRequestV1,
  start: number,
  end: number,
): void {
  const source = request.measurement.runs[0]!
  request.measurement.runs = [
    {
      ...source,
      inlineId: "long-text-prefix",
      renderStartOffset: 0,
      renderEndOffset: start,
      renderedText: request.measurement.renderedText.slice(0, start),
    },
    {
      ...source,
      inlineId: "long-text-edit",
      renderStartOffset: start,
      renderEndOffset: end,
      renderedText: request.measurement.renderedText.slice(start, end),
    },
    {
      ...source,
      inlineId: "long-text-suffix",
      renderStartOffset: end,
      renderEndOffset: request.measurement.renderedText.length,
      renderedText: request.measurement.renderedText.slice(end),
    },
  ]
}

function projectionValidationFixture() {
  const fixture = persistentFlowEditFixture()
  const previousRequest = structuredClone(fixture.previousRequest)
  const nextRequest = structuredClone(fixture.nextRequest)
  const previousRange = {
    startUtf16: fixture.window.previousReconvergenceOffset - 300,
    endUtf16: fixture.window.previousReconvergenceOffset,
  }
  const nextRange = {
    startUtf16: fixture.window.nextReconvergenceOffset - 301,
    endUtf16: fixture.window.nextReconvergenceOffset,
  }
  splitMeasurementRun(previousRequest, previousRange.startUtf16, previousRange.endUtf16)
  splitMeasurementRun(nextRequest, nextRange.startUtf16, nextRange.endUtf16)
  const previousLayout = acceptVNextTextBlockMultiRunLayoutV1(previousRequest)
  if (previousLayout.status !== "accepted") throw new Error("projection validation fixture blocked")
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: previousRequest,
    acceptedLayout: previousLayout,
  })
  const reconvergenceLineIndex = fixture.window.previousReconvergenceLineIndex
  const suffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[reconvergenceLineIndex]!
  const suffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[reconvergenceLineIndex]!
  return {
    snapshot,
    nextRequest,
    edit: {
      previousStartOffset: previousRange.startUtf16,
      previousEndOffset: previousRange.endUtf16,
      nextEndOffset: nextRange.endUtf16,
    },
    window: {
      ...fixture.window,
      previousSuffixSemanticFingerprint: suffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: suffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint: suffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: suffixSemanticRangeFingerprint,
    },
    nextRange,
  }
}

describe("TextBlock persistent flow update v1", () => {
  it("path-copies the affected range and reuses untouched nodes", () => {
    const fixture = persistentFlowEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial tree blocked")
    const update = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })
    if (update.status !== "accepted") throw new Error(update.issues[0]?.message)

    const previousNodes = new Set(collectVNextTextBlockPersistentFlowNodesForQaV1(initial.tree))
    const nextNodes = collectVNextTextBlockPersistentFlowNodesForQaV1(update.nextTree)
    expect(nextNodes.filter((node) => previousNodes.has(node)).length).toBe(update.work.reusedNodeCount)
    expect(update.work).toMatchObject({
      completeTreeRebuildCount: 0,
      completeSemanticPassCount: 0,
      replacedPreviousRenderedUtf16Length: expect.any(Number),
      projectedNextRenderedUtf16Length: expect.any(Number),
      reusedNodeCount: expect.any(Number),
      createdNodeCount: expect.any(Number),
      createdNodeCanonicalByteCount: expect.any(Number),
    })
    expect(update.work.reusedNodeCount).toBeGreaterThan(0)
    expect(update.nextTree.summary.renderedUtf16Length).toBe(
      fixture.nextRequest.measurement.renderedText.length,
    )
    expect(inspectVNextTextBlockPersistentFlowUpdateV1({
      update: update.update,
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })).toEqual({ status: "valid" })
    expect(inspectVNextTextBlockPersistentFlowUpdateV1({
      update: structuredClone(update.update),
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })).toMatchObject({ status: "invalid", code: "update-provenance-mismatch" })
    expect(inspectVNextTextBlockPersistentFlowUpdateV1({
      update: update.update,
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: structuredClone(fixture.nextRequest),
      edit: fixture.edit,
      window: fixture.window,
    })).toMatchObject({ status: "invalid", code: "update-provenance-mismatch" })
  }, 30_000)

  it("uses bounded multi-level path lookup and counts shallow created nodes exactly once", () => {
    const fixture = persistentFlowMultiLevelEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("multi-level initial tree blocked")
    expect(initial.tree.root.height).toBeGreaterThan(1)
    expect(initial.tree.summary.leafCount).toBeGreaterThan(8)

    const update = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })
    if (update.status !== "accepted") throw new Error(update.issues[0]?.message)

    const previousNodes = collectVNextTextBlockPersistentFlowNodesForQaV1(initial.tree)
    const previousNodeSet = new Set(previousNodes)
    const nextNodes = collectVNextTextBlockPersistentFlowNodesForQaV1(update.nextTree)
    const reusedNodes = nextNodes.filter((node) => previousNodeSet.has(node))
    const createdNodes = nextNodes.filter((node) => !previousNodeSet.has(node))
    const shallowCreatedBytes = createdNodes.reduce((total, node) => (
      total + encoder.encode(stringifyVNextCanonicalJson(shallowCreatedNodeFacts(node))).byteLength
    ), 0)
    const recursivelySerializedBytes = encoder.encode(
      stringifyVNextCanonicalJson(createdNodes),
    ).byteLength

    expect(update.nextTree.root.height).toBe(initial.tree.root.height)
    expect(update.nextTree.summary.leafCount).toBe(initial.tree.summary.leafCount + 1)
    expect(update.work.replacedLeafCount).toBe(1)
    expect(update.work).toMatchObject({
      previousNodeCount: previousNodes.length,
      nextNodeCount: nextNodes.length,
      reusedNodeCount: reusedNodes.length,
      createdNodeCount: createdNodes.length,
      createdNodeCanonicalByteCount: shallowCreatedBytes,
    })
    expect(update.work.reusedNodeCount + update.work.createdNodeCount).toBe(update.work.nextNodeCount)
    expect(update.work.rangeLookupVisitedNodeCount).toBeLessThan(update.work.previousNodeCount)
    expect(update.work.pathCopyVisitedNodeCount).toBeLessThan(update.work.previousNodeCount)
    expect(update.work.createdNodeCanonicalByteCount).toBeLessThan(recursivelySerializedBytes)
    expect(reusedNodes.length).toBeGreaterThan(0)
    if (initial.tree.root.nodeKind !== "branch" || update.nextTree.root.nodeKind !== "branch") {
      throw new Error("multi-level fixture requires branch roots")
    }
    expect(update.nextTree.root.children.some((child) => (
      initial.tree.root.nodeKind === "branch" && initial.tree.root.children.includes(child)
    ))).toBe(true)
  })

  it("rejects cloned provenance, stale revisions, context drift, and suffix-style drift", () => {
    const fixture = persistentFlowEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial tree blocked")
    const invoke = (
      nextRequest = fixture.nextRequest,
      previousTree = initial.tree,
      window = fixture.window,
    ) =>
      createVNextTextBlockPersistentFlowUpdateV1({
        previousTree,
        previousRequest: fixture.previousRequest,
        nextRequest,
        edit: fixture.edit,
        window,
      })
    expect(invoke(fixture.nextRequest, structuredClone(initial.tree))).toMatchObject({
      status: "blocked",
      issues: [{ code: "tree-provenance-mismatch" }],
    })
    expect(invoke({
      ...fixture.nextRequest,
      measurement: { ...fixture.nextRequest.measurement, instanceRevision: 70 },
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-revision" }] })
    expect(invoke({
      ...fixture.nextRequest,
      availableWidthLayoutUnit: fixture.nextRequest.availableWidthLayoutUnit + 1,
    })).toMatchObject({ status: "blocked", issues: [{ code: "layout-context-mismatch" }] })
    expect(invoke({
      ...fixture.nextRequest,
      measurement: {
        ...fixture.nextRequest.measurement,
        runs: fixture.nextRequest.measurement.runs.map((run) => ({
          ...run,
          styleKey: "drifted-suffix-style",
        })),
      },
    })).toMatchObject({ status: "blocked", issues: [{ code: "source-topology-mismatch" }] })
    const changedSuffixFingerprint = `sha256:${"e".repeat(64)}`
    expect(invoke(fixture.nextRequest, initial.tree, {
      ...fixture.window,
      previousSuffixSemanticFingerprint: changedSuffixFingerprint,
      nextSuffixSemanticFingerprint: changedSuffixFingerprint,
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-window" }] })
    expect(invoke({
      ...fixture.nextRequest,
      lines: fixture.nextRequest.lines.map((line) => line.index === 24
        ? { ...line, renderEndOffset: line.renderEndOffset - 1 }
        : line),
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-window" }] })

    const tamperedFixture = persistentFlowEditFixture()
    const tamperedInitial = createVNextTextBlockPersistentFlowTreeV1({
      request: tamperedFixture.previousRequest,
      acceptedLayout: tamperedFixture.previousLayout,
    })
    if (tamperedInitial.status !== "accepted") throw new Error("tamper tree blocked")
    tamperedFixture.previousRequest.measurement.renderedText =
      `b${tamperedFixture.previousRequest.measurement.renderedText.slice(1)}`
    expect(createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: tamperedInitial.tree,
      previousRequest: tamperedFixture.previousRequest,
      nextRequest: tamperedFixture.nextRequest,
      edit: tamperedFixture.edit,
      window: tamperedFixture.window,
    })).toMatchObject({ status: "blocked", issues: [{ code: "tree-provenance-mismatch" }] })
  }, 30_000)

  it("returns a structured proof fallback when an exact bound edit becomes noncanonical", () => {
    const fixture = persistentFlowEditFixture()
    const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    const edit = { ...fixture.edit }
    const window = { ...fixture.window }
    const update = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: snapshot.persistentFlowTree,
      previousRequest: snapshot.request,
      nextRequest: fixture.nextRequest,
      edit,
      window,
    })
    if (update.status !== "accepted") throw new Error(update.issues[0]?.message)

    edit.previousStartOffset = Number.NaN
    let proof: ReturnType<
      typeof createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1
    > | undefined
    expect(() => {
      proof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
        snapshot,
        nextRequest: fixture.nextRequest,
        edit,
        window,
        persistentFlowUpdate: update.update,
      })
    }).not.toThrow()
    expect(proof).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
  })

  it("accepts chained checkpoints far before restart and after reconvergence", () => {
    const fixtures = persistentFlowArbitraryChainedEditFixtures()
    const fixture = fixtures.first
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial chained tree blocked")
    const first = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })
    if (first.status !== "accepted") throw new Error(first.issues[0]?.message)

    for (const [position, chained] of [
      ["far-before", fixtures.farBeforeFirstRestart],
      ["after", fixtures.afterFirstReconvergence],
    ] as const) {
      const second = createVNextTextBlockPersistentFlowUpdateV1({
        previousTree: first.nextTree,
        previousRequest: fixture.nextRequest,
        nextRequest: chained.nextRequest,
        edit: chained.edit,
        window: chained.window,
      })
      if (second.status !== "accepted") throw new Error(`${position}: ${second.issues[0]?.message}`)
      expect(second.work).toMatchObject({
        completeTreeRebuildCount: 0,
        completeSemanticPassCount: 0,
        reusedNodeCount: expect.any(Number),
      })
      expect(second.work.reusedNodeCount).toBeGreaterThan(0)
      if (position === "far-before") {
        expect(second.work.previousSuffixCheckpointFoldLineCount).toBeGreaterThan(0)
      } else {
        expect(second.work.previousSuffixCheckpointFoldLineCount).toBe(0)
      }
      expect(inspectVNextTextBlockPersistentFlowUpdateV1({
        update: second.update,
        previousTree: first.nextTree,
        previousRequest: fixture.nextRequest,
        nextRequest: chained.nextRequest,
        edit: chained.edit,
        window: chained.window,
      })).toEqual({ status: "valid" })
    }

    const tampered = `sha256:${"f".repeat(64)}`
    expect(createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: first.nextTree,
      previousRequest: fixture.nextRequest,
      nextRequest: fixtures.farBeforeFirstRestart.nextRequest,
      edit: fixtures.farBeforeFirstRestart.edit,
      window: {
        ...fixtures.farBeforeFirstRestart.window,
        previousSuffixSemanticFingerprint: tampered,
        nextSuffixSemanticFingerprint: tampered,
      },
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-window" }] })
    expect(createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: structuredClone(first.nextTree),
      previousRequest: fixture.nextRequest,
      nextRequest: fixtures.afterFirstReconvergence.nextRequest,
      edit: fixtures.afterFirstReconvergence.edit,
      window: fixtures.afterFirstReconvergence.window,
    })).toMatchObject({ status: "blocked", issues: [{ code: "tree-provenance-mismatch" }] })
  }, 30_000)

  it("fails closed on malformed projected atoms, UTF-16 clusters, and canonical advances", () => {
    const base = projectionValidationFixture()
    const invoke = (
      mutate: (fixture: Pick<ReturnType<typeof projectionValidationFixture>, "nextRequest" | "nextRange">) => void,
    ) => {
      const fixture = {
        nextRequest: structuredClone(base.nextRequest),
        nextRange: base.nextRange,
      }
      mutate(fixture)
      let result: ReturnType<typeof createVNextTextBlockPersistentFlowUpdateV1> | undefined
      expect(() => {
        result = createVNextTextBlockPersistentFlowUpdateV1({
          previousTree: base.snapshot.persistentFlowTree,
          previousRequest: base.snapshot.request,
          nextRequest: fixture.nextRequest,
          edit: base.edit,
          window: base.window,
        })
      }).not.toThrow()
      expect(result).toMatchObject({
        status: "blocked",
        issues: [{ code: "range-projection-failed" }],
      })
    }

    invoke(({ nextRequest }) => {
      const run = nextRequest.measurement.runs[1]! as VNextTextBlockMultiRunLayoutRequestV1["measurement"]["runs"][number]
      run.kind = "resolved-field"
      delete run.fieldKey
    })
    invoke(({ nextRequest }) => {
      const run = nextRequest.measurement.runs[1]! as VNextTextBlockMultiRunLayoutRequestV1["measurement"]["runs"][number]
      run.kind = "generated-page-number"
      run.generatedOwnerFingerprint = "not-a-compact-fingerprint"
    })
    invoke(({ nextRequest }) => {
      const run = nextRequest.measurement.runs[1]! as VNextTextBlockMultiRunLayoutRequestV1["measurement"]["runs"][number]
      run.kind = "hard-break"
    })
    invoke(({ nextRequest }) => {
      const run = nextRequest.measurement.runs[1]! as VNextTextBlockMultiRunLayoutRequestV1["measurement"]["runs"][number]
      run.kind = "inline-image"
    })
    invoke(({ nextRequest }) => {
      nextRequest.measurement.runs[1]!.renderStartOffset += 1
    })
    invoke(({ nextRequest }) => {
      nextRequest.measurement.runs[1]!.renderedText = "source-drift"
    })
    invoke(({ nextRequest, nextRange }) => {
      nextRequest.shapingRuns[0]!.clusters[nextRange.startUtf16 + 10]!.renderStartOffset -= 1
    })
    invoke(({ nextRequest, nextRange }) => {
      nextRequest.shapingRuns[0]!.clusters[nextRange.startUtf16 + 10]!.renderEndOffset += 1
    })
    invoke(({ nextRequest, nextRange }) => {
      const emojiStart = nextRange.startUtf16 + 150
      nextRequest.measurement.renderedText = replaceTextAt(
        nextRequest.measurement.renderedText,
        emojiStart,
        emojiStart + 2,
        "😀",
      )
      nextRequest.measurement.runs.forEach((run) => {
        run.renderedText = nextRequest.measurement.renderedText.slice(
          run.renderStartOffset,
          run.renderEndOffset,
        )
      })
      nextRequest.shapingRuns[0]!.text = nextRequest.measurement.renderedText
      nextRequest.breakOffsets = nextRequest.breakOffsets.filter((offset) => offset !== emojiStart + 1)
    })
    invoke(({ nextRequest, nextRange }) => {
      nextRequest.shapingRuns[0]!.clusters[nextRange.startUtf16 + 10]!.advanceLayoutUnit = Number.NaN
    })
  })

  it("keeps the public update boundary structured for cyclic and noncanonical values", () => {
    const cases: Array<(request: VNextTextBlockMultiRunLayoutRequestV1) => void> = [
      (request) => { request.availableWidthLayoutUnit = Number.NaN },
      (request) => {
        const paragraph = request.paragraphStyle as typeof request.paragraphStyle & { cycle?: unknown }
        paragraph.cycle = paragraph
      },
      (request) => {
        const run = request.shapingRuns[0]! as typeof request.shapingRuns[number] & { unsupported?: unknown }
        run.unsupported = 1n
      },
    ]
    const fixture = persistentFlowEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("noncanonical boundary tree blocked")
    for (const mutate of cases) {
      const nextRequest = structuredClone(fixture.nextRequest)
      mutate(nextRequest)
      let result: ReturnType<typeof createVNextTextBlockPersistentFlowUpdateV1> | undefined
      expect(() => {
        result = createVNextTextBlockPersistentFlowUpdateV1({
          previousTree: initial.tree,
          previousRequest: fixture.previousRequest,
          nextRequest,
          edit: fixture.edit,
          window: fixture.window,
        })
      }).not.toThrow()
      expect(result).toMatchObject({
        status: "blocked",
        issues: [{ code: "invalid-next-request" }],
      })
    }
  })

  it("binds semantic proof evidence to distinct registered updates and result trees", () => {
    const fixture = persistentFlowEditFixture()
    const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    const alternateRequest = structuredClone(fixture.nextRequest)
    const changedOffset = fixture.edit.previousStartOffset
    alternateRequest.measurement.renderedText = replaceTextAt(
      alternateRequest.measurement.renderedText,
      changedOffset,
      changedOffset + 1,
      "Z",
    )
    alternateRequest.measurement.runs[0]!.renderedText = alternateRequest.measurement.renderedText
    alternateRequest.shapingRuns[0]!.text = alternateRequest.measurement.renderedText

    const requests = [fixture.nextRequest, alternateRequest]
    const evidence = requests.map((nextRequest) => {
      const edit = { ...fixture.edit }
      const window = { ...fixture.window }
      const update = createVNextTextBlockPersistentFlowUpdateV1({
        previousTree: snapshot.persistentFlowTree,
        previousRequest: snapshot.request,
        nextRequest,
        edit,
        window,
      })
      if (update.status !== "accepted") throw new Error(update.issues[0]?.message)
      const proof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
        snapshot,
        nextRequest,
        edit,
        window,
        persistentFlowUpdate: update.update,
      })
      if (proof.status !== "checkpoint-accepted") throw new Error(proof.message)
      expect(proof).toMatchObject({
        persistentFlowUpdateFingerprint: update.update.fingerprint,
        resultingPersistentFlowTreeFingerprint: update.nextTree.fingerprint,
      })
      return { update, proof }
    })

    expect(evidence[0]!.update.update.fingerprint).not.toBe(evidence[1]!.update.update.fingerprint)
    expect(evidence[0]!.update.nextTree.fingerprint).not.toBe(evidence[1]!.update.nextTree.fingerprint)
    expect(evidence[0]!.proof.fingerprint).not.toBe(evidence[1]!.proof.fingerprint)
  })
})
