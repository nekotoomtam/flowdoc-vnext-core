import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextAuthoredBoxPlanV1,
  createVNextTextBlockInitialFlowV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockSpatialIndexV1,
  inspectVNextTextBlockAuthoredBoxGeometryV1,
  layoutVNextTextBlockAuthoredBoxGeometryV1,
} from "../src/index.js"
import { acceptedAuthoredBoxGeometryFixture } from
  "./helpers/textBlockAuthoredBoxGeometryV1.js"
import { SPATIAL_GEOMETRY_OWNER_FINGERPRINT } from
  "./helpers/textBlockSpatialWrappingV1.js"
import {
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
} from "./helpers/textBlockInitialFlowV1.js"

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
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })
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
    expect(result.lines.map((line) => ({
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      fragments: line.fragments.map((fragment) => ({
        renderStartOffset: fragment.renderStartOffset,
        renderEndOffset: fragment.renderEndOffset,
        xLayoutUnit: fragment.xLayoutUnit,
        advanceLayoutUnit: fragment.advanceLayoutUnit,
      })),
      sourceSegments: line.sourceSegments,
    }))).toEqual(fixture.acceptedLayout.lines.map((line) => ({
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      fragments: line.fragments.map((fragment) => ({
        renderStartOffset: fragment.renderStartOffset,
        renderEndOffset: fragment.renderEndOffset,
        xLayoutUnit: fragment.xLayoutUnit,
        advanceLayoutUnit: fragment.advanceLayoutUnit,
      })),
      sourceSegments: line.sourceSegments,
    })))
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
})
