import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextCompactFingerprint,
  createVNextAuthoredBoxPlanV1,
  createVNextTextBlockInitialFlowV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockSpatialIndexV1,
  createVNextTextBlockSpatialIndexUpdateV1,
  inspectVNextTextBlockAuthoredBoxGeometryV1,
  layoutVNextTextBlockAuthoredBoxGeometryV1,
  layoutVNextTextBlockSpatialWrappingV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from
  "../src/fingerprint/canonicalJson.js"
import {
  acceptedAuthoredBoxGeometryFixture,
  unsupportedAuthoredBoxGeometryInitialFlowsFixture,
} from "./helpers/textBlockAuthoredBoxGeometryV1.js"
import { SPATIAL_GEOMETRY_OWNER_FINGERPRINT } from
  "./helpers/textBlockSpatialWrappingV1.js"
import {
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) {
    return value
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.freeze(value)
}

function narrowAuthoredBoxGeometryFixture() {
  const buildInput = legacyTextOnlyBuildInputFixture()
  const textBlock = {
    ...buildInput.textBlock,
    props: {
      ...buildInput.textBlock.props,
      box: {
        ...buildInput.textBlock.props.box,
        padding: {
          top: { value: 0, unit: "pt" as const },
          right: { value: 44, unit: "pt" as const },
          bottom: { value: 0, unit: "pt" as const },
          left: { value: 44, unit: "pt" as const },
        },
      },
    },
  }
  const authoredBox = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: 100,
  })
  if (authoredBox.status !== "ready") throw new Error("narrow box plan blocked")
  const measurement = {
    ...buildInput.measurement,
    availableWidthPt: authoredBox.plan.contentWidthPt,
  }
  const initial = createVNextTextBlockInitialFlowV1({
    ...buildInput,
    textBlock,
    measurement,
    authoredBoxPlan: authoredBox.plan,
  })
  if (initial.status !== "classified") throw new Error("narrow initial flow blocked")
  const request = legacyTextOnlyLayoutRequestFixture()
  request.measurement = measurement
  request.availableWidthLayoutUnit = 12_000_000
  request.breakOffsets = [0, 1, 2, 3]
  request.lines = [
    { index: 0, renderStartOffset: 0, renderEndOffset: 2 },
    { index: 1, renderStartOffset: 2, renderEndOffset: 3 },
  ]
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("narrow content layout blocked")
  const persistent = createVNextTextBlockPersistentFlowTreeV1({
    request,
    acceptedLayout,
  })
  if (persistent.status !== "accepted") throw new Error("narrow content tree blocked")
  const spatial = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: persistent.tree,
    request,
    entries: [],
  })
  if (spatial.status !== "accepted") throw new Error("narrow content index blocked")
  return {
    initialFlow: initial.flow,
    request,
    tree: persistent.tree,
    spatialIndex: spatial.index,
  }
}

describe("TextBlock authored box geometry v1", () => {
  it("accepts one exact Phase 4A identity chain and registers immutable output", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("Phase 4A fixture blocked")
    expect(result).toMatchObject({
      initialFlowFingerprint: fixture.initialFlow.fingerprint,
      authoredBoxPlanFingerprint: fixture.authoredBoxPlan.fingerprint,
      persistentFlowTreeFingerprint: fixture.tree.fingerprint,
      spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
      mayPublishLayout: false,
      productionBinding: false,
      contracts: {
        authoredBoxWidthApplied: true,
        contentLocalSpatialWrapping: true,
        boxLocalProjection: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(inspectVNextTextBlockAuthoredBoxGeometryV1(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.lines)).toBe(true)
  })

  it("preserves content geometry at zero inset and retains the Phase 3 fast path", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      paddingPt: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    const phase3 = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (phase3.status !== "accepted") throw new Error("Phase 3 oracle blocked")
    if (result.status !== "accepted") throw new Error("zero inset blocked")

    expect(result.geometry).toMatchObject({
      contentOriginXLayoutUnit: 0,
      contentOriginYLayoutUnit: 0,
      contentWidthLayoutUnit: 100_000_000,
      outerWidthLayoutUnit: 100_000_000,
      contentFlowHeightLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
      spatialMaximumBottomLayoutUnit: 0,
      contentExtentBottomLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
      outerHeightLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
    })
    expect(result.work).toMatchObject({
      spatialIndexQueryCount: 0,
      verticalAdvanceCount: 0,
      lineBandRequeryCount: 0,
    })
    const retainedContentLocalLines = result.lines.map((line) => {
      const {
        contentYOffsetLayoutUnit,
        yOffsetLayoutUnit: _boxYOffsetLayoutUnit,
        availableIntervals,
        intervalPlacements,
        fragments,
        contentRegionFingerprint,
        contentLineFingerprint,
        fingerprint: _boxLineFingerprint,
        ...retainedLine
      } = line
      return {
        ...retainedLine,
        yOffsetLayoutUnit: contentYOffsetLayoutUnit,
        availableIntervals: availableIntervals.map((interval) => ({
          startLayoutUnit: interval.contentStartLayoutUnit,
          endLayoutUnit: interval.contentEndLayoutUnit,
        })),
        intervalPlacements: intervalPlacements.map((placement) => {
          const {
            contentXStartLayoutUnit,
            contentXEndLayoutUnit,
            xStartLayoutUnit: _boxXStartLayoutUnit,
            xEndLayoutUnit: _boxXEndLayoutUnit,
            contentLineFingerprint: _contentLineFingerprint,
            fingerprint: _boxPlacementFingerprint,
            ...retainedPlacement
          } = placement
          return {
            ...retainedPlacement,
            xStartLayoutUnit: contentXStartLayoutUnit,
            xEndLayoutUnit: contentXEndLayoutUnit,
          }
        }),
        fragments: fragments.map((fragment) => {
          const {
            contentXLayoutUnit,
            xLayoutUnit: _boxXLayoutUnit,
            contentFragmentFingerprint,
            fingerprint: _boxFragmentFingerprint,
            ...retainedFragment
          } = fragment
          return {
            ...retainedFragment,
            xLayoutUnit: contentXLayoutUnit,
            fingerprint: contentFragmentFingerprint,
          }
        }),
        regionFingerprint: contentRegionFingerprint,
        fingerprint: contentLineFingerprint,
      }
    })
    expect({
      documentId: result.documentId,
      sectionId: result.sectionId,
      textBlockId: result.textBlockId,
      instanceRevision: result.instanceRevision,
      layoutContextFingerprint: result.layoutContextFingerprint,
      persistentFlowTreeFingerprint: result.persistentFlowTreeFingerprint,
      spatialIndexFingerprint: result.spatialIndexFingerprint,
      lines: retainedContentLocalLines,
      summary: {
        lineCount: result.summary.lineCount,
        fragmentCount: result.summary.fragmentCount,
        intervalPlacementCount: result.summary.intervalPlacementCount,
        heightLayoutUnit: result.geometry.contentFlowHeightLayoutUnit,
      },
      work: result.work,
      mayPublishLayout: result.mayPublishLayout,
      productionBinding: result.productionBinding,
      fingerprint: result.contentSpatialLayoutFingerprint,
    }).toEqual({
      documentId: phase3.documentId,
      sectionId: phase3.sectionId,
      textBlockId: phase3.textBlockId,
      instanceRevision: phase3.instanceRevision,
      layoutContextFingerprint: phase3.layoutContextFingerprint,
      persistentFlowTreeFingerprint: phase3.persistentFlowTreeFingerprint,
      spatialIndexFingerprint: phase3.spatialIndexFingerprint,
      lines: phase3.lines,
      summary: phase3.summary,
      work: phase3.work,
      mayPublishLayout: phase3.mayPublishLayout,
      productionBinding: phase3.productionBinding,
      fingerprint: phase3.fingerprint,
    })
  })

  it("applies authored content origin and vertical insets exactly once", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      paddingPt: { top: 2, right: 5, bottom: 3, left: 7 },
      borderWidthPt: { top: 1, right: 2, bottom: 2, left: 1 },
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("inset fixture blocked")

    expect(result.geometry).toMatchObject({
      outerWidthLayoutUnit: 100_000_000,
      contentInsetsLayoutUnit: {
        top: 3_000_000,
        right: 7_000_000,
        bottom: 5_000_000,
        left: 8_000_000,
      },
      contentOriginXLayoutUnit: 8_000_000,
      contentOriginYLayoutUnit: 3_000_000,
      contentWidthLayoutUnit: 85_000_000,
    })
    expect(result.lines[0]?.yOffsetLayoutUnit)
      .toBe(result.lines[0]!.contentYOffsetLayoutUnit + 3_000_000)
    expect(result.lines[0]?.fragments[0]?.xLayoutUnit)
      .toBe(result.lines[0]!.fragments[0]!.contentXLayoutUnit + 8_000_000)
    expect(result.geometry.outerHeightLayoutUnit).toBe(
      3_000_000
        + result.geometry.contentExtentBottomLayoutUnit
        + 5_000_000,
    )
    expect(result.lines.map((line) => line.sourceSegments))
      .toEqual(fixture.acceptedLayout.lines.map((line) => line.sourceSegments))
  })

  it("uses the exact authored content width for line wrapping", () => {
    const fixture = narrowAuthoredBoxGeometryFixture()
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("narrow box blocked")

    expect(result.geometry.contentWidthLayoutUnit).toBe(12_000_000)
    expect(result.lines.map((line) => [
      line.renderStartOffset,
      line.renderEndOffset,
    ])).toEqual([
      [0, 2],
      [2, 3],
    ])
    expect(result.lines.every((line) => (
      line.fragments.every((fragment) => (
        fragment.xLayoutUnit >= result.geometry.contentOriginXLayoutUnit
        && fragment.xLayoutUnit + fragment.advanceLayoutUnit
          <= result.geometry.contentOriginXLayoutUnit
            + result.geometry.contentWidthLayoutUnit
      ))
    ))).toBe(true)
  })

  it("includes retained spatial extent in auto-height without making overlay consume flow", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "overlay-below-flow",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 60_000_000,
        yLayoutUnit: 40_000_000,
        widthLayoutUnit: 10_000_000,
        heightLayoutUnit: 20_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 4_000_000,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "overlay",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("overlay fixture blocked")

    expect(result.work.spatialIndexQueryCount).toBe(0)
    expect(result.geometry.spatialMaximumBottomLayoutUnit).toBe(64_000_000)
    expect(result.geometry.contentExtentBottomLayoutUnit).toBe(64_000_000)
    expect(result.geometry.outerHeightLayoutUnit).toBe(68_000_000)
  })

  it("translates every multi-interval x fact once without changing render or source ranges", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "middle",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 8_000_000,
        yLayoutUnit: 0,
        widthLayoutUnit: 4_000_000,
        heightLayoutUnit: 20_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "rectangular-exclusion",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("middle exclusion blocked")
    const line = result.lines[0]
    if (line == null) throw new Error("middle exclusion line missing")

    const contentWidth = fixture.request.availableWidthLayoutUnit
    expect(line.availableIntervals.map((interval) => ({
      content: [
        interval.contentStartLayoutUnit,
        interval.contentEndLayoutUnit,
      ],
      box: [interval.startLayoutUnit, interval.endLayoutUnit],
    }))).toEqual([
      { content: [0, 8_000_000], box: [5_000_000, 13_000_000] },
      {
        content: [12_000_000, contentWidth],
        box: [17_000_000, 5_000_000 + contentWidth],
      },
    ])
    expect(line.intervalPlacements.every((placement) => (
      placement.xStartLayoutUnit - placement.contentXStartLayoutUnit
        === 5_000_000
      && placement.xEndLayoutUnit - placement.contentXEndLayoutUnit
        === 5_000_000
    ))).toBe(true)
    expect(line.fragments.every((fragment) => (
      fragment.xLayoutUnit - fragment.contentXLayoutUnit === 5_000_000
    ))).toBe(true)
    expect(result.lines.map((candidate) => ({
      renderRange: [
        candidate.renderStartOffset,
        candidate.renderEndOffset,
      ],
      fragmentRanges: candidate.fragments.map((fragment) => [
        fragment.renderStartOffset,
        fragment.renderEndOffset,
      ]),
      sourceSegments: candidate.sourceSegments,
    }))).toEqual([{
      renderRange: [0, 3],
      fragmentRanges: [[0, 3]],
      sourceSegments: [{
        inlineId: "text-abc",
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: 3,
        renderedText: "ABC",
        sourceStartOffset: 0,
        sourceEndOffset: 3,
        styleKey: "paragraph-body",
      }],
    }])
  })

  it("retains Phase 3 barrier advancement before applying the box-local y origin", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "top-barrier",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 90_000_000,
        heightLayoutUnit: 20_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "top-bottom-barrier",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("barrier fixture blocked")

    expect(result.lines[0]?.contentYOffsetLayoutUnit).toBe(20_000_000)
    expect(result.lines[0]?.yOffsetLayoutUnit).toBe(22_000_000)
    expect(result.work.verticalAdvanceCount).toBeGreaterThan(0)
  })

  it("composes a path-copied move without replacing the persistent flow tree", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "movable",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 15_000_000,
        heightLayoutUnit: 25_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "rectangular-exclusion",
      }],
    })
    const update = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "movable",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 20_000_000,
        yLayoutUnit: 30_000_000,
        widthLayoutUnit: 15_000_000,
        heightLayoutUnit: 25_000_000,
      },
    })
    expect(update.status).toBe("accepted")
    if (update.status !== "accepted") throw new Error("spatial update blocked")
    const before = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    const after = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: update.nextIndex,
    })
    if (before.status !== "accepted" || after.status !== "accepted") {
      throw new Error("move composition blocked")
    }

    expect(after.persistentFlowTreeFingerprint)
      .toBe(before.persistentFlowTreeFingerprint)
    expect(after.spatialIndexFingerprint)
      .not.toBe(before.spatialIndexFingerprint)
    expect(after.fingerprint).not.toBe(before.fingerprint)
    expect(update.work.completeIndexRebuildCount).toBe(0)
    expect(before.lines[0]?.availableIntervals.map((interval) => [
      interval.contentStartLayoutUnit,
      interval.contentEndLayoutUnit,
    ])).toEqual([[15_000_000, 90_000_000]])
    expect(after.lines[0]?.availableIntervals.map((interval) => [
      interval.contentStartLayoutUnit,
      interval.contentEndLayoutUnit,
    ])).toEqual([[0, 90_000_000]])
  })

  it("recomputes auto-height to the second-deepest retained entry after shrink", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [
        {
          objectId: "resizable-deepest",
          geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
          xLayoutUnit: 60_000_000,
          yLayoutUnit: 40_000_000,
          widthLayoutUnit: 10_000_000,
          heightLayoutUnit: 30_000_000,
          clearance: {
            topLayoutUnit: 0,
            rightLayoutUnit: 0,
            bottomLayoutUnit: 0,
            leftLayoutUnit: 0,
          },
          wrapPolicy: "overlay",
        },
        {
          objectId: "retained-second-deepest",
          geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
          xLayoutUnit: 60_000_000,
          yLayoutUnit: 35_000_000,
          widthLayoutUnit: 10_000_000,
          heightLayoutUnit: 20_000_000,
          clearance: {
            topLayoutUnit: 0,
            rightLayoutUnit: 0,
            bottomLayoutUnit: 0,
            leftLayoutUnit: 0,
          },
          wrapPolicy: "overlay",
        },
      ],
    })
    const update = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "resizable-deepest",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 60_000_000,
        yLayoutUnit: 40_000_000,
        widthLayoutUnit: 10_000_000,
        heightLayoutUnit: 5_000_000,
      },
    })
    expect(update.status).toBe("accepted")
    if (update.status !== "accepted") throw new Error("spatial resize blocked")
    const before = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    const after = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: update.nextIndex,
    })
    if (before.status !== "accepted" || after.status !== "accepted") {
      throw new Error("resize composition blocked")
    }

    expect(fixture.spatialIndex.summary.maximumBottomLayoutUnit).toBe(70_000_000)
    expect(update.nextIndex.summary.maximumBottomLayoutUnit).toBe(55_000_000)
    expect(before.geometry.spatialMaximumBottomLayoutUnit).toBe(70_000_000)
    expect(before.geometry.outerHeightLayoutUnit).toBe(74_000_000)
    expect(after.geometry.spatialMaximumBottomLayoutUnit).toBe(55_000_000)
    expect(after.geometry.contentExtentBottomLayoutUnit).toBe(55_000_000)
    expect(after.geometry.outerHeightLayoutUnit).toBe(59_000_000)
    expect(update.work.completeIndexRebuildCount).toBe(0)
  })

  it("blocks every unsupported Initial Flow capability without partial geometry", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()

    for (const initialFlow of unsupportedAuthoredBoxGeometryInitialFlowsFixture()) {
      expect(layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow,
        persistentFlowTree: fixture.tree,
        request: fixture.request,
        spatialIndex: fixture.spatialIndex,
      })).toMatchObject({
        status: "blocked",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
        mayPublishLayout: false,
        productionBinding: false,
        issues: [{ code: "initial-flow-capability-required" }],
      })
    }
  })

  it.each([
    ["unknown own key", (
      envelope: Record<PropertyKey, unknown>,
    ) => {
      envelope.unexpected = true
      return envelope
    }],
    ["symbol key", (
      envelope: Record<PropertyKey, unknown>,
    ) => {
      envelope[Symbol("unexpected")] = true
      return envelope
    }],
    ["non-enumerable extra", (
      envelope: Record<PropertyKey, unknown>,
    ) => {
      Object.defineProperty(envelope, "unexpected", { value: true })
      return envelope
    }],
    ["custom prototype", (
      envelope: Record<PropertyKey, unknown>,
    ) => Object.assign(
      Object.create(Object.create(Object.prototype)) as
        Record<PropertyKey, unknown>,
      envelope,
    )],
  ] as const)("rejects a strict root with an %s", (_name, alterEnvelope) => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const envelope: Record<PropertyKey, unknown> = {
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    }

    expect(layoutVNextTextBlockAuthoredBoxGeometryV1(
      alterEnvelope(envelope),
    )).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      issues: [{ code: "invalid-input", path: "input" }],
    })
  })

  it.each([
    "initialFlow",
    "persistentFlowTree",
    "request",
    "spatialIndex",
  ] as const)(
    "rejects a required root %s accessor without executing it",
    (accessorKey) => {
      const fixture = acceptedAuthoredBoxGeometryFixture()
      const envelope: Record<PropertyKey, unknown> = {
        initialFlow: fixture.initialFlow,
        persistentFlowTree: fixture.tree,
        request: fixture.request,
        spatialIndex: fixture.spatialIndex,
      }
      let accessorReadCount = 0
      Object.defineProperty(envelope, accessorKey, {
        enumerable: true,
        configurable: true,
        get: () => {
          accessorReadCount += 1
          return envelope
        },
      })

      expect(layoutVNextTextBlockAuthoredBoxGeometryV1(envelope))
        .toMatchObject({
          status: "blocked",
          geometry: null,
          lines: null,
          summary: null,
          work: null,
          fingerprint: null,
          issues: [{ code: "invalid-input", path: "input" }],
        })
      expect(accessorReadCount).toBe(0)
    },
  )

  it("blocks root and request production binding before stale identity checks", () => {
    const rootFixture = acceptedAuthoredBoxGeometryFixture()
    expect(layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: rootFixture.initialFlow,
      persistentFlowTree: rootFixture.tree,
      request: rootFixture.request,
      spatialIndex: rootFixture.spatialIndex,
      bindProductionLayout: true,
    })).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      mayPublishLayout: false,
      productionBinding: false,
      issues: [{ code: "production-binding-forbidden" }],
    })

    const requestFixture = acceptedAuthoredBoxGeometryFixture()
    requestFixture.request.bindProductionLayout = true
    expect(layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: requestFixture.initialFlow,
      persistentFlowTree: requestFixture.tree,
      request: requestFixture.request,
      spatialIndex: requestFixture.spatialIndex,
    })).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      mayPublishLayout: false,
      productionBinding: false,
      issues: [{ code: "production-binding-forbidden" }],
    })
  })

  it("rejects a nested production accessor without executing it", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    let accessorReadCount = 0
    Object.defineProperty(fixture.request, "bindProductionLayout", {
      enumerable: true,
      configurable: true,
      get: () => {
        accessorReadCount += 1
        return true
      },
    })

    expect(layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      issues: [{ code: "initial-flow-request-binding-mismatch" }],
    })
    expect(accessorReadCount).toBe(0)
  })

  it("rejects cloned Initial Flow, tree, foreign index, equal request clone, and width drift in order", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const foreignFixture = acceptedAuthoredBoxGeometryFixture()
    const clonedInitialFlow = deepFreeze(
      JSON.parse(JSON.stringify(fixture.initialFlow)),
    )
    const equalRequestClone = structuredClone(fixture.request)
    const widthDriftFixture = acceptedAuthoredBoxGeometryFixture()
    widthDriftFixture.request.availableWidthLayoutUnit -= 1
    const rejected = [
      layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow: clonedInitialFlow,
        persistentFlowTree: fixture.tree,
        request: fixture.request,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow: fixture.initialFlow,
        persistentFlowTree: structuredClone(fixture.tree),
        request: fixture.request,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow: fixture.initialFlow,
        persistentFlowTree: fixture.tree,
        request: fixture.request,
        spatialIndex: foreignFixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow: fixture.initialFlow,
        persistentFlowTree: fixture.tree,
        request: equalRequestClone,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV1({
        initialFlow: widthDriftFixture.initialFlow,
        persistentFlowTree: widthDriftFixture.tree,
        request: widthDriftFixture.request,
        spatialIndex: widthDriftFixture.spatialIndex,
      }),
    ]

    expect(rejected.map((result) => ({
      code: result.issues[0]?.code,
      geometry: result.geometry,
      lines: result.lines,
      summary: result.summary,
      work: result.work,
      fingerprint: result.fingerprint,
    }))).toEqual([
      {
        code: "initial-flow-request-binding-mismatch",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
      },
      {
        code: "flow-tree-request-binding-mismatch",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
      },
      {
        code: "spatial-index-binding-mismatch",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
      },
      {
        code: "flow-tree-request-binding-mismatch",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
      },
      {
        code: "initial-flow-request-binding-mismatch",
        geometry: null,
        lines: null,
        summary: null,
        work: null,
        fingerprint: null,
      },
    ])
  })

  it("maps an unchanged Phase 3 blocker to one code-bearing Phase 4A issue", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "near-maximum-blocker",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 90_000_000,
        heightLayoutUnit: Number.MAX_SAFE_INTEGER - 10_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "top-bottom-barrier",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      mayPublishLayout: false,
      productionBinding: false,
      issues: [{
        code: "spatial-layout-blocked",
        message: expect.stringContaining("unsafe-layout-arithmetic"),
      }],
    })
  })

  it("blocks translated y overflow after a valid near-maximum content-local line", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      paddingPt: { top: 20, right: 5, bottom: 0, left: 5 },
      entries: [{
        objectId: "near-maximum-valid-line",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 90_000_000,
        heightLayoutUnit: Number.MAX_SAFE_INTEGER - 18_000_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "top-bottom-barrier",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      mayPublishLayout: false,
      productionBinding: false,
      issues: [{
        code: "unsafe-layout-arithmetic",
        path: "lines[0].yOffsetLayoutUnit",
      }],
    })
  })

  it("blocks outer-height overflow from a valid near-maximum spatial bottom", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      entries: [{
        objectId: "near-maximum-overlay",
        geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
        xLayoutUnit: 0,
        yLayoutUnit: Number.MAX_SAFE_INTEGER - 1,
        widthLayoutUnit: 1,
        heightLayoutUnit: 1,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "overlay",
      }],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result).toMatchObject({
      status: "blocked",
      geometry: null,
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      mayPublishLayout: false,
      productionBinding: false,
      issues: [{
        code: "unsafe-layout-arithmetic",
        path: "geometry.outerHeightLayoutUnit",
      }],
    })
  })

  it("rejects cloned and publicly re-fingerprinted Phase 4A outputs", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const accepted = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    if (accepted.status !== "accepted") {
      throw new Error("tamper fixture blocked")
    }

    expect(inspectVNextTextBlockAuthoredBoxGeometryV1(
      structuredClone(accepted),
    )).toMatchObject({
      status: "invalid",
      code: "authored-box-geometry-provenance-mismatch",
    })

    const altered = structuredClone(accepted)
    const alteredLine = altered.lines[0]
    if (alteredLine == null) throw new Error("tamper line missing")
    alteredLine.yOffsetLayoutUnit += 1
    const {
      fingerprint: _discardedLineFingerprint,
      ...alteredLineFacts
    } = alteredLine
    alteredLine.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredLineFacts),
    )
    const {
      fingerprint: _discardedResultFingerprint,
      ...alteredResultFacts
    } = altered
    altered.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredResultFacts),
    )
    deepFreeze(altered)

    expect(inspectVNextTextBlockAuthoredBoxGeometryV1(altered))
      .toMatchObject({
        status: "invalid",
        code: "authored-box-geometry-provenance-mismatch",
      })
  })

  it("fingerprints fact-equivalent chains equally and includes authored top inset", () => {
    const firstFixture = acceptedAuthoredBoxGeometryFixture()
    const secondFixture = acceptedAuthoredBoxGeometryFixture()
    const changedTopFixture = acceptedAuthoredBoxGeometryFixture({
      paddingPt: { top: 3, right: 5, bottom: 2, left: 5 },
    })
    const layout = (
      fixture: ReturnType<typeof acceptedAuthoredBoxGeometryFixture>,
    ) => layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
    const first = layout(firstFixture)
    const second = layout(secondFixture)
    const changedTop = layout(changedTopFixture)
    if (
      first.status !== "accepted"
      || second.status !== "accepted"
      || changedTop.status !== "accepted"
    ) throw new Error("fingerprint fixture blocked")
    const ranges = (result: typeof first) => result.lines.map((line) => ({
      renderRange: [line.renderStartOffset, line.renderEndOffset],
      fragmentRanges: line.fragments.map((fragment) => [
        fragment.renderStartOffset,
        fragment.renderEndOffset,
      ]),
      sourceSegments: line.sourceSegments,
    }))

    expect(second.fingerprint).toBe(first.fingerprint)
    expect(changedTop.fingerprint).not.toBe(first.fingerprint)
    expect(ranges(changedTop)).toEqual(ranges(first))
    expect(changedTop.lines[0]!.yOffsetLayoutUnit
      - first.lines[0]!.yOffsetLayoutUnit).toBe(1_000_000)
  })
})
