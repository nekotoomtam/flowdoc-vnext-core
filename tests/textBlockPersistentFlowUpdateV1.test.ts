import { describe, expect, it } from "vitest"
import {
  collectVNextTextBlockPersistentFlowNodesForQaV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockPersistentFlowUpdateV1,
  inspectVNextTextBlockPersistentFlowUpdateV1,
} from "../src/index.js"
import {
  persistentFlowChainedEditFixture,
  persistentFlowEditFixture,
} from "./helpers/textBlockPersistentFlowV1.js"

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
  })

  it("accepts a chained earlier reconvergence from the exact derived tree", () => {
    const fixture = persistentFlowChainedEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.first.previousRequest,
      acceptedLayout: fixture.first.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial chained tree blocked")
    const first = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: initial.tree,
      previousRequest: fixture.first.previousRequest,
      nextRequest: fixture.first.nextRequest,
      edit: fixture.first.edit,
      window: fixture.first.window,
    })
    if (first.status !== "accepted") throw new Error(first.issues[0]?.message)

    const second = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: first.nextTree,
      previousRequest: fixture.first.nextRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })
    if (second.status !== "accepted") throw new Error(second.issues[0]?.message)
    expect(second.work).toMatchObject({
      completeTreeRebuildCount: 0,
      completeSemanticPassCount: 0,
      reusedNodeCount: expect.any(Number),
    })
    expect(second.work.reusedNodeCount).toBeGreaterThan(0)
    expect(inspectVNextTextBlockPersistentFlowUpdateV1({
      update: second.update,
      previousTree: first.nextTree,
      previousRequest: fixture.first.nextRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })).toEqual({ status: "valid" })

    const tampered = `sha256:${"f".repeat(64)}`
    expect(createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: first.nextTree,
      previousRequest: fixture.first.nextRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: {
        ...fixture.window,
        previousSuffixSemanticFingerprint: tampered,
        nextSuffixSemanticFingerprint: tampered,
      },
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-window" }] })
  })
})
