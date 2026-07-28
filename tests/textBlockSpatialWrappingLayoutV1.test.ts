import { readFileSync } from "node:fs"
import * as ts from "typescript"
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  collectVNextTextBlockSpatialIndexNodesForQaV1,
  createVNextCompactFingerprint,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockSpatialIndexUpdateV1,
  createVNextTextBlockSpatialIndexV1,
  inspectVNextTextBlockSpatialWrappingLayoutV1,
  layoutVNextTextBlockSpatialWrappingV1,
  provideVNextTextBlockFlowRegionsV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockSpatialWrapPolicyV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { legacyTextOnlyLayoutRequestFixture } from "./helpers/textBlockInitialFlowV1.js"
import { SPATIAL_GEOMETRY_OWNER_FINGERPRINT } from "./helpers/textBlockSpatialWrappingV1.js"

function parseSource(source: string): ts.SourceFile {
  return ts.createSourceFile("spatial-wrapper.ts", source, ts.ScriptTarget.Latest, true)
}

function functionCalls(source: string, functionName: string): readonly string[] {
  const names: string[] = []
  const visit = (node: ts.Node): void => {
    if (
      ts.isFunctionDeclaration(node)
      && node.name?.text === functionName
      && node.body != null
    ) {
      const collect = (child: ts.Node): void => {
        if (ts.isCallExpression(child) && ts.isIdentifier(child.expression)) {
          names.push(child.expression.text)
        }
        ts.forEachChild(child, collect)
      }
      collect(node.body)
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(parseSource(source))
  return names
}

function wrappingOwnerViolations(source: string): readonly string[] {
  const violations: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isWhileStatement(node)) violations.push("wrapper-owned while loop")
    if (
      ts.isVoidExpression(node)
      && (
        node.expression.getText().includes("createVNextTextBlockBreakGroupsKernelV1")
        || node.expression.getText().includes("runVNextTextBlockSpatialWrappingKernelV1")
      )
    ) violations.push("void-only kernel reference")
    ts.forEachChild(node, visit)
  }
  visit(parseSource(source))
  return violations
}

function layoutFixture(
  request: VNextTextBlockMultiRunLayoutRequestV1,
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[],
) {
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("spatial layout fixture blocked")
  const persistent = createVNextTextBlockPersistentFlowTreeV1({
    request,
    acceptedLayout,
  })
  if (persistent.status !== "accepted") throw new Error("spatial layout tree blocked")
  const spatial = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: persistent.tree,
    request,
    entries,
  })
  if (spatial.status !== "accepted") throw new Error("spatial layout index blocked")
  return {
    request,
    acceptedLayout,
    tree: persistent.tree,
    spatialIndex: spatial.index,
  }
}

function oneHundredUnitRequest(): VNextTextBlockMultiRunLayoutRequestV1 {
  const request = legacyTextOnlyLayoutRequestFixture()
  request.availableWidthLayoutUnit = 100_000_000
  request.measurement.availableWidthPt = 100
  return request
}

function spatialEntry(input: {
  objectId: string
  leftLayoutUnit: number
  topLayoutUnit?: number
  rightLayoutUnit: number
  bottomLayoutUnit?: number
  wrapPolicy?: VNextTextBlockSpatialWrapPolicyV1
}): VNextTextBlockSyntheticPositionedObjectInputV1 {
  const topLayoutUnit = input.topLayoutUnit ?? 0
  const bottomLayoutUnit = input.bottomLayoutUnit ?? 20_000_000
  return {
    objectId: input.objectId,
    geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
    xLayoutUnit: input.leftLayoutUnit,
    yLayoutUnit: topLayoutUnit,
    widthLayoutUnit: input.rightLayoutUnit - input.leftLayoutUnit,
    heightLayoutUnit: bottomLayoutUnit - topLayoutUnit,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: input.wrapPolicy ?? "rectangular-exclusion",
  }
}

describe("TextBlock spatial wrapping layout v1", () => {
  it("delegates break grouping and line stabilization to the shared internal kernel", () => {
    const v1Source = readFileSync(new URL("../src/layout/textBlockSpatialWrappingLayoutV1.ts", import.meta.url), "utf8")
    const kernelSource = readFileSync(new URL("../src/layout/textBlockSpatialWrappingKernelV1.ts", import.meta.url), "utf8")
    const wrapperCalls = functionCalls(v1Source, "layoutVNextTextBlockSpatialWrappingV1")
    expect(wrapperCalls).toContain("runVNextTextBlockSpatialWrappingKernelV1")
    expect(functionCalls(v1Source, "projectGroups")).toContain("createVNextTextBlockBreakGroupsKernelV1")
    expect(functionCalls(kernelSource, "runVNextTextBlockSpatialWrappingKernelV1")).toContain("placeVNextTextBlockBreakGroupsKernelV1")
    expect(kernelSource).toContain("lineBandRequeryCount")
    expect(wrappingOwnerViolations(v1Source)).toEqual([])

    const renamedDuplicate = `
      function projectGroups() { return createVNextTextBlockBreakGroupsKernelV1({}) }
      function layoutVNextTextBlockSpatialWrappingV1() {
        runVNextTextBlockSpatialWrappingKernelV1({})
        let cursor = 0
        while (cursor < retainedGroups.length) cursor += 1
      }
    `
    const voidOnly = `
      function projectGroups() { void createVNextTextBlockBreakGroupsKernelV1 }
      function layoutVNextTextBlockSpatialWrappingV1() {
        void runVNextTextBlockSpatialWrappingKernelV1
      }
    `
    expect(wrappingOwnerViolations(renamedDuplicate)).toContain("wrapper-owned while loop")
    expect(functionCalls(voidOnly, "projectGroups")).not.toContain("createVNextTextBlockBreakGroupsKernelV1")
    expect(wrappingOwnerViolations(voidOnly)).toContain("void-only kernel reference")
  })
  it("preserves accepted one-line geometry and uses the no-exclusion fast path", () => {
    const fixture = layoutFixture(legacyTextOnlyLayoutRequestFixture(), [])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("spatial layout blocked")
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: fixture.acceptedLayout.lines[0]?.renderStartOffset,
      renderEndOffset: fixture.acceptedLayout.lines[0]?.renderEndOffset,
      yOffsetLayoutUnit: fixture.acceptedLayout.lines[0]?.yOffsetLayoutUnit,
      heightLayoutUnit: fixture.acceptedLayout.lines[0]?.heightLayoutUnit,
      baselineOffsetLayoutUnit: fixture.acceptedLayout.lines[0]?.baselineOffsetLayoutUnit,
      fragments: fixture.acceptedLayout.lines[0]?.fragments,
      sourceSegments: fixture.acceptedLayout.lines[0]?.sourceSegments,
    })
    expect(result.work).toMatchObject({
      flowRegionFastPathCount: result.lines.length,
      spatialIndexQueryCount: 0,
      verticalAdvanceCount: 0,
      lineBandRequeryCount: 0,
    })
    expect(result).toMatchObject({
      contracts: {
        multiIntervalRectangularWrapping: true,
        topBottomBarrierAdvancement: true,
        overlayRemovesFlowSpace: false,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(inspectVNextTextBlockSpatialWrappingLayoutV1(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.lines[0])).toBe(true)
  })

  it("places whole break-safe groups across both sides of a middle exclusion", () => {
    const request = oneHundredUnitRequest()
    request.shapingRuns[0]!.clusters = request.shapingRuns[0]!.clusters.map(
      (cluster) => ({ ...cluster, advanceLayoutUnit: 30_000_000 }),
    )
    request.breakOffsets = [0, 1, 2, 3]
    const fixture = layoutFixture(request, [{
      objectId: "middle-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 40_000_000,
      yLayoutUnit: 0,
      widthLayoutUnit: 20_000_000,
      heightLayoutUnit: 100_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 0,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "rectangular-exclusion",
    }])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("middle spatial layout blocked")
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: 0,
      renderEndOffset: 2,
      availableIntervals: [
        { startLayoutUnit: 0, endLayoutUnit: 40_000_000 },
        { startLayoutUnit: 60_000_000, endLayoutUnit: 100_000_000 },
      ],
    })
    expect(new Set(
      result.lines[0]!.intervalPlacements.map((item) => item.intervalIndex),
    )).toEqual(new Set([0, 1]))
    expect(result.lines[0]!.intervalPlacements).toEqual([
      {
        intervalIndex: 0,
        renderStartOffset: 0,
        renderEndOffset: 1,
        xStartLayoutUnit: 0,
        xEndLayoutUnit: 30_000_000,
      },
      {
        intervalIndex: 1,
        renderStartOffset: 1,
        renderEndOffset: 2,
        xStartLayoutUnit: 60_000_000,
        xEndLayoutUnit: 90_000_000,
      },
    ])
    expect(result.lines.flatMap((line) => line.fragments).map((fragment) => (
      [fragment.renderStartOffset, fragment.renderEndOffset]
    ))).toEqual([[0, 1], [1, 2], [2, 3]])
    expect(result.work.spatialIndexQueryCount).toBe(result.lines.length)
  })

  it.each([
    {
      name: "left exclusion",
      entry: spatialEntry({
        objectId: "left",
        leftLayoutUnit: 0,
        rightLayoutUnit: 20_000_000,
      }),
      expectedIntervals: [
        { startLayoutUnit: 20_000_000, endLayoutUnit: 100_000_000 },
      ],
      expectedX: 20_000_000,
      expectedY: 0,
      expectedQueries: 1,
      expectedFastPaths: 0,
      expectedAdvances: 0,
    },
    {
      name: "right exclusion",
      entry: spatialEntry({
        objectId: "right",
        leftLayoutUnit: 80_000_000,
        rightLayoutUnit: 100_000_000,
      }),
      expectedIntervals: [
        { startLayoutUnit: 0, endLayoutUnit: 80_000_000 },
      ],
      expectedX: 0,
      expectedY: 0,
      expectedQueries: 1,
      expectedFastPaths: 0,
      expectedAdvances: 0,
    },
    {
      name: "top-bottom barrier",
      entry: spatialEntry({
        objectId: "barrier",
        leftLayoutUnit: 20_000_000,
        rightLayoutUnit: 80_000_000,
        wrapPolicy: "top-bottom-barrier",
      }),
      expectedIntervals: [
        { startLayoutUnit: 0, endLayoutUnit: 100_000_000 },
      ],
      expectedX: 0,
      expectedY: 20_000_000,
      expectedQueries: 2,
      expectedFastPaths: 0,
      expectedAdvances: 1,
    },
    {
      name: "full-width exclusion",
      entry: spatialEntry({
        objectId: "full",
        leftLayoutUnit: 0,
        rightLayoutUnit: 100_000_000,
      }),
      expectedIntervals: [
        { startLayoutUnit: 0, endLayoutUnit: 100_000_000 },
      ],
      expectedX: 0,
      expectedY: 20_000_000,
      expectedQueries: 2,
      expectedFastPaths: 0,
      expectedAdvances: 1,
    },
    {
      name: "overlay",
      entry: spatialEntry({
        objectId: "overlay",
        leftLayoutUnit: 20_000_000,
        rightLayoutUnit: 80_000_000,
        wrapPolicy: "overlay",
      }),
      expectedIntervals: [
        { startLayoutUnit: 0, endLayoutUnit: 100_000_000 },
      ],
      expectedX: 0,
      expectedY: 0,
      expectedQueries: 0,
      expectedFastPaths: 1,
      expectedAdvances: 0,
    },
  ])("handles $name without splitting source clusters", ({
    entry,
    expectedIntervals,
    expectedX,
    expectedY,
    expectedQueries,
    expectedFastPaths,
    expectedAdvances,
  }) => {
    const fixture = layoutFixture(oneHundredUnitRequest(), [entry])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("spatial behavior blocked")
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: 0,
      renderEndOffset: 3,
      yOffsetLayoutUnit: expectedY,
      availableIntervals: expectedIntervals,
      fragments: [{ xLayoutUnit: expectedX }],
    })
    expect(result.lines.flatMap((line) => line.fragments).map((fragment) => ({
      start: fragment.renderStartOffset,
      end: fragment.renderEndOffset,
    }))).toEqual([{ start: 0, end: 3 }])
    expect(result.work).toMatchObject({
      spatialIndexQueryCount: expectedQueries,
      flowRegionFastPathCount: expectedFastPaths,
      verticalAdvanceCount: expectedAdvances,
    })
  })

  it("closes a line at a zero-paint mandatory hard break", () => {
    const request = oneHundredUnitRequest()
    const measurementRun = request.measurement.runs[0]!
    const shapingRun = request.shapingRuns[0]!
    request.measurement.renderedText = "A\nB"
    request.measurement.runs = [
      {
        ...measurementRun,
        inlineId: "text-a",
        renderStartOffset: 0,
        renderEndOffset: 1,
        renderedText: "A",
      },
      {
        inlineId: "hard-break",
        kind: "hard-break",
        renderStartOffset: 1,
        renderEndOffset: 2,
        renderedText: "\n",
      },
      {
        ...measurementRun,
        inlineId: "text-b",
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "B",
      },
    ]
    request.shapingRuns = [
      {
        ...shapingRun,
        shapingRunId: "shape-a",
        renderStartOffset: 0,
        renderEndOffset: 1,
        text: "A",
        clusters: [{
          index: 0,
          renderStartOffset: 0,
          renderEndOffset: 1,
          advanceLayoutUnit: 6_000_000,
        }],
      },
      {
        ...shapingRun,
        shapingRunId: "shape-b",
        renderStartOffset: 2,
        renderEndOffset: 3,
        text: "B",
        clusters: [{
          index: 0,
          renderStartOffset: 2,
          renderEndOffset: 3,
          advanceLayoutUnit: 6_000_000,
        }],
      },
    ]
    request.breakOffsets = [0, 1, 2, 3]
    request.lines = [
      { index: 0, renderStartOffset: 0, renderEndOffset: 2 },
      { index: 1, renderStartOffset: 2, renderEndOffset: 3 },
    ]
    const fixture = layoutFixture(request, [])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("hard-break spatial layout blocked")
    expect(result.lines.map((line) => [
      line.renderStartOffset,
      line.renderEndOffset,
    ])).toEqual([[0, 2], [2, 3]])
    expect(result.lines[0]!.fragments.map((fragment) => fragment.text)).toEqual(["A"])
    expect(result.lines[0]!.sourceSegments.map((segment) => segment.kind)).toEqual([
      "text",
      "hard-break",
    ])
  })

  it("re-queries an expanded tall line band before accepting spatial geometry", () => {
    const request = oneHundredUnitRequest()
    request.shapingRuns[0]!.fontSizeLayoutUnit = 40_000_000
    const fixture = layoutFixture(request, [spatialEntry({
      objectId: "lower-left",
      leftLayoutUnit: 0,
      topLayoutUnit: 20_000_000,
      rightLayoutUnit: 20_000_000,
      bottomLayoutUnit: 60_000_000,
    })])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("tall spatial layout blocked")
    expect(result.lines[0]).toMatchObject({
      heightLayoutUnit: 40_000_000,
      availableIntervals: [
        { startLayoutUnit: 20_000_000, endLayoutUnit: 100_000_000 },
      ],
      fragments: [{ xLayoutUnit: 20_000_000 }],
    })
    expect(result.work).toMatchObject({
      spatialIndexQueryCount: 2,
      lineBandRequeryCount: 1,
    })
  })

  it("keeps the candidate line height monotonic when re-query moves a tall group", () => {
    const request = oneHundredUnitRequest()
    const sourceRun = request.shapingRuns[0]!
    request.shapingRuns = [
      {
        ...sourceRun,
        shapingRunId: "shape-small",
        renderStartOffset: 0,
        renderEndOffset: 1,
        text: "A",
        clusters: [{
          index: 0,
          renderStartOffset: 0,
          renderEndOffset: 1,
          advanceLayoutUnit: 10_000_000,
        }],
      },
      {
        ...sourceRun,
        shapingRunId: "shape-tall",
        renderStartOffset: 1,
        renderEndOffset: 3,
        text: "BC",
        fontSizeLayoutUnit: 40_000_000,
        clusters: [
          {
            index: 0,
            renderStartOffset: 1,
            renderEndOffset: 2,
            advanceLayoutUnit: 35_000_000,
          },
          {
            index: 1,
            renderStartOffset: 2,
            renderEndOffset: 3,
            advanceLayoutUnit: 35_000_000,
          },
        ],
      },
    ]
    request.breakOffsets = [0, 1, 3]
    const fixture = layoutFixture(request, [spatialEntry({
      objectId: "middle-event",
      leftLayoutUnit: 40_000_000,
      topLayoutUnit: 20_000_000,
      rightLayoutUnit: 60_000_000,
      bottomLayoutUnit: 40_000_000,
    })])
    const result = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("monotonic spatial layout blocked")
    expect(result.lines.map((line) => ({
      range: [line.renderStartOffset, line.renderEndOffset],
      y: line.yOffsetLayoutUnit,
      height: line.heightLayoutUnit,
    }))).toEqual([
      { range: [0, 1], y: 0, height: 40_000_000 },
      { range: [1, 3], y: 40_000_000, height: 40_000_000 },
    ])
  })

  it("fails closed for foreign identity, production binding, unsafe y, overflow, and cloned output", () => {
    const fixture = layoutFixture(oneHundredUnitRequest(), [])
    const changedRevisionRequest = structuredClone(fixture.request)
    changedRevisionRequest.measurement.instanceRevision += 1
    const changedContextTree = structuredClone(fixture.tree)
    changedContextTree.layoutContextFingerprint = `sha256:${"c".repeat(64)}`
    const call = (
      overrides: Partial<Parameters<typeof layoutVNextTextBlockSpatialWrappingV1>[0]> = {},
    ) => layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
      ...overrides,
    })
    const rejected = [
      call({ persistentFlowTree: structuredClone(fixture.tree) }),
      call({ request: structuredClone(fixture.request) }),
      call({ spatialIndex: structuredClone(fixture.spatialIndex) }),
      call({ request: changedRevisionRequest }),
      call({ persistentFlowTree: changedContextTree }),
      call({ bindProductionLayout: true }),
      call({ startYLayoutUnit: -1 }),
      call({ startYLayoutUnit: Number.MAX_SAFE_INTEGER + 1 }),
    ]
    expect(rejected.map((result) => (
      result.status === "blocked" ? result.issues[0]?.code : "accepted"
    ))).toEqual([
      "flow-tree-provenance-mismatch",
      "flow-tree-request-binding-mismatch",
      "spatial-index-binding-mismatch",
      "flow-tree-request-binding-mismatch",
      "flow-tree-provenance-mismatch",
      "production-binding-forbidden",
      "invalid-start-y",
      "invalid-start-y",
    ])

    const overflowRequest = oneHundredUnitRequest()
    overflowRequest.shapingRuns[0]!.clusters = (
      overflowRequest.shapingRuns[0]!.clusters.map(
        (cluster) => ({ ...cluster, advanceLayoutUnit: 30_000_000 }),
      )
    )
    const overflowFixture = layoutFixture(overflowRequest, [spatialEntry({
      objectId: "middle",
      leftLayoutUnit: 40_000_000,
      rightLayoutUnit: 60_000_000,
      bottomLayoutUnit: 100_000_000,
    })])
    const advancedOverflow = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: overflowFixture.tree,
      request: overflowFixture.request,
      spatialIndex: overflowFixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(advancedOverflow).toMatchObject({
      status: "accepted",
      lines: [{
        renderStartOffset: 0,
        renderEndOffset: 3,
        yOffsetLayoutUnit: 100_000_000,
      }],
      work: {
        verticalAdvanceCount: 1,
      },
    })

    const accepted = call()
    expect(accepted.status).toBe("accepted")
    if (accepted.status !== "accepted") throw new Error("spatial layout blocked")
    expect(inspectVNextTextBlockSpatialWrappingLayoutV1(
      structuredClone(accepted),
    )).toMatchObject({
      status: "invalid",
      code: "spatial-layout-provenance-mismatch",
    })
    const altered = structuredClone(accepted)
    const alteredFragment = altered.lines[0]?.fragments[0]
    if (alteredFragment == null) throw new Error("spatial layout fragment missing")
    alteredFragment.xLayoutUnit += 1
    const {
      fingerprint: _discardedFragmentFingerprint,
      ...alteredFragmentFacts
    } = alteredFragment
    alteredFragment.fingerprint = createVNextCompactFingerprint(
      JSON.stringify(alteredFragmentFacts),
    )
    const alteredLine = altered.lines[0]!
    const {
      fingerprint: _discardedLineFingerprint,
      ...alteredLineFacts
    } = alteredLine
    alteredLine.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredLineFacts),
    )
    const {
      fingerprint: _discardedLayoutFingerprint,
      ...alteredLayoutFacts
    } = altered
    altered.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredLayoutFacts),
    )
    expect(inspectVNextTextBlockSpatialWrappingLayoutV1(altered)).toMatchObject({
      status: "invalid",
      code: "spatial-layout-provenance-mismatch",
    })
  })

  it("composes a path-copied move into exact before/after spatial layouts", () => {
    const request = oneHundredUnitRequest()
    request.shapingRuns[0]!.clusters = request.shapingRuns[0]!.clusters.map(
      (cluster) => ({ ...cluster, advanceLayoutUnit: 30_000_000 }),
    )
    request.breakOffsets = [0, 1, 2, 3]
    const fixture = layoutFixture(request, [spatialEntry({
      objectId: "moving-middle",
      leftLayoutUnit: 40_000_000,
      rightLayoutUnit: 60_000_000,
      bottomLayoutUnit: 20_000_000,
    })])
    const moved = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "moving-middle",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 40_000_000,
        yLayoutUnit: 40_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })
    expect(moved.status).toBe("accepted")
    if (moved.status !== "accepted") throw new Error("composed move blocked")
    const previousLayout = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    const nextLayout = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: moved.nextIndex,
      startYLayoutUnit: 0,
    })
    expect(previousLayout.status).toBe("accepted")
    expect(nextLayout.status).toBe("accepted")
    if (previousLayout.status !== "accepted" || nextLayout.status !== "accepted") {
      throw new Error("composed spatial layout blocked")
    }
    expect(previousLayout.lines[0]!.availableIntervals).toEqual([
      { startLayoutUnit: 0, endLayoutUnit: 40_000_000 },
      { startLayoutUnit: 60_000_000, endLayoutUnit: 100_000_000 },
    ])
    expect(nextLayout.lines[0]!.availableIntervals).toEqual([
      { startLayoutUnit: 0, endLayoutUnit: 100_000_000 },
    ])
    expect(moved.update.affectedBands).toEqual([
      { topLayoutUnit: 0, bottomLayoutUnit: 20_000_000 },
      { topLayoutUnit: 40_000_000, bottomLayoutUnit: 60_000_000 },
    ])
    expect(previousLayout.mayPublishLayout).toBe(false)
    expect(nextLayout.mayPublishLayout).toBe(false)
    expect(previousLayout.productionBinding).toBe(false)
    expect(nextLayout.productionBinding).toBe(false)
    expect("reusedSpatialLineCount" in previousLayout.work).toBe(false)
    expect("reusedSpatialLineCount" in nextLayout.work).toBe(false)
  })

  it("composes a resize through provider and layout without replacing the flow tree", () => {
    const fixture = layoutFixture(oneHundredUnitRequest(), [
      spatialEntry({
        objectId: "resizing-left",
        leftLayoutUnit: 0,
        rightLayoutUnit: 20_000_000,
        bottomLayoutUnit: 20_000_000,
      }),
      spatialEntry({
        objectId: "untouched-middle",
        leftLayoutUnit: 40_000_000,
        topLayoutUnit: 30_000_000,
        rightLayoutUnit: 60_000_000,
        bottomLayoutUnit: 50_000_000,
      }),
      spatialEntry({
        objectId: "untouched-barrier",
        leftLayoutUnit: 10_000_000,
        topLayoutUnit: 60_000_000,
        rightLayoutUnit: 90_000_000,
        bottomLayoutUnit: 80_000_000,
        wrapPolicy: "top-bottom-barrier",
      }),
      spatialEntry({
        objectId: "untouched-overlay",
        leftLayoutUnit: 80_000_000,
        topLayoutUnit: 90_000_000,
        rightLayoutUnit: 90_000_000,
        bottomLayoutUnit: 110_000_000,
        wrapPolicy: "overlay",
      }),
    ])
    const persistentFlowTree = fixture.tree
    const persistentFlowTreeFingerprint = fixture.tree.fingerprint
    const resized = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "resizing-left",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 40_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })
    expect(resized.status).toBe("accepted")
    if (resized.status !== "accepted") throw new Error("composed resize blocked")
    const previousRegion = provideVNextTextBlockFlowRegionsV1({
      spatialIndex: fixture.spatialIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    const nextRegion = provideVNextTextBlockFlowRegionsV1({
      spatialIndex: resized.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    expect(previousRegion).toMatchObject({
      status: "accepted",
      intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 100_000_000 }],
    })
    expect(nextRegion).toMatchObject({
      status: "accepted",
      intervals: [{ startLayoutUnit: 40_000_000, endLayoutUnit: 100_000_000 }],
    })
    const previousLayout = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    const nextLayout = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: resized.nextIndex,
      startYLayoutUnit: 0,
    })
    expect(previousLayout).toMatchObject({
      status: "accepted",
      lines: [{ fragments: [{ xLayoutUnit: 20_000_000 }] }],
    })
    expect(nextLayout).toMatchObject({
      status: "accepted",
      lines: [{ fragments: [{ xLayoutUnit: 40_000_000 }] }],
    })
    expect(resized.update.affectedBands).toEqual([
      { topLayoutUnit: 0, bottomLayoutUnit: 20_000_000 },
    ])
    const previousNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(
      fixture.spatialIndex,
    )
    const nextNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(
      resized.nextIndex,
    )
    expect(nextNodes.some((node) => previousNodes.includes(node))).toBe(true)
    expect(resized.nextIndex.persistentFlowTreeFingerprint).toBe(
      persistentFlowTreeFingerprint,
    )
    expect(fixture.tree).toBe(persistentFlowTree)
  })
})
