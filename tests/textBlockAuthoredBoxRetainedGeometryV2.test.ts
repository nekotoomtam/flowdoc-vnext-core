import { describe, expect, it } from "vitest"
import { createVNextTextBlockSpatialIndexV2, inspectVNextTextBlockAuthoredBoxGeometryV2, layoutVNextTextBlockAuthoredBoxGeometryV2 } from "../src/index.js"
import { acceptedAuthoredBoxGeometryFixture } from "./helpers/textBlockAuthoredBoxGeometryV2.js"
import { SPATIAL_GEOMETRY_OWNER_FINGERPRINT } from "./helpers/textBlockSpatialWrappingV1.js"

describe("retained authored box geometry obligations on V2", () => {
  it("applies authored content origin and vertical insets exactly once", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({
      paddingPt: { top: 2, right: 5, bottom: 3, left: 7 },
      borderWidthPt: { top: 1, right: 2, bottom: 2, left: 1 },
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
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
    expect(result.lines[0]?.sourceSegments).toMatchObject([{inlineId: "text-abc", renderedText: "ABC", renderStartOffset: 0, renderEndOffset: 3}])
  })

  it("uses the exact authored content width for line wrapping", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture({ paddingPt: { top: 0, right: 44, bottom: 0, left: 44 }, breakOffsets: [0, 1, 2, 3] })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
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
        && fragment.xLayoutUnit + (fragment.kind === "text" ? fragment.advanceLayoutUnit : fragment.widthLayoutUnit)
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
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("overlay fixture blocked")

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
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
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
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
      spatialIndex: fixture.spatialIndex,
    })
    if (result.status !== "accepted") throw new Error("barrier fixture blocked")

    expect(result.lines[0]?.contentYOffsetLayoutUnit).toBe(20_000_000)
    expect(result.lines[0]?.yOffsetLayoutUnit).toBe(22_000_000)
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
    const resizedIndex = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
      entries: [
        {
          objectId: "resizable-deepest",
          geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
          xLayoutUnit: 60_000_000,
          yLayoutUnit: 40_000_000,
          widthLayoutUnit: 10_000_000,
          heightLayoutUnit: 5_000_000,
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
    expect(resizedIndex.status).toBe("accepted")
    if (resizedIndex.status !== "accepted") throw new Error("spatial resize index blocked")
    const before = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
      spatialIndex: fixture.spatialIndex,
    })
    const after = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      evidence: fixture.evidence,
      spatialIndex: resizedIndex.index,
    })
    if (before.status !== "accepted" || after.status !== "accepted") {
      throw new Error("resize composition blocked")
    }

    expect(fixture.spatialIndex.summary.maximumBottomLayoutUnit).toBe(70_000_000)
    expect(resizedIndex.index.summary.maximumBottomLayoutUnit).toBe(55_000_000)
    expect(before.geometry.spatialMaximumBottomLayoutUnit).toBe(70_000_000)
    expect(before.geometry.outerHeightLayoutUnit).toBe(74_000_000)
    expect(after.geometry.spatialMaximumBottomLayoutUnit).toBe(55_000_000)
    expect(after.geometry.contentExtentBottomLayoutUnit).toBe(55_000_000)
    expect(after.geometry.outerHeightLayoutUnit).toBe(59_000_000)
  })

  it("retains deterministic fingerprints, inset sensitivity, and authority rejection order", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const call = (overrides: Record<string, unknown> = {}) => layoutVNextTextBlockAuthoredBoxGeometryV2({initialFlow:fixture.initialFlow,evidence:fixture.evidence,persistentFlowTree:fixture.tree,spatialIndex:fixture.spatialIndex,...overrides})
    const result = call()
    const other = acceptedAuthoredBoxGeometryFixture()
    const equivalent = layoutVNextTextBlockAuthoredBoxGeometryV2({initialFlow:other.initialFlow,evidence:other.evidence,persistentFlowTree:other.tree,spatialIndex:other.spatialIndex})
    expect(result).toEqual(equivalent)
    const inset = acceptedAuthoredBoxGeometryFixture({paddingPt:{top:3,right:5,bottom:2,left:5}})
    const changed = layoutVNextTextBlockAuthoredBoxGeometryV2({initialFlow:inset.initialFlow,evidence:inset.evidence,persistentFlowTree:inset.tree,spatialIndex:inset.spatialIndex})
    expect(changed.fingerprint).not.toBe(result.fingerprint)
    expect(Object.isFrozen(result)).toBe(true)
    expect(inspectVNextTextBlockAuthoredBoxGeometryV2(structuredClone(result))).toMatchObject({status:"invalid",code:"authored-box-geometry-provenance-mismatch"})
    const invalidTree = structuredClone(fixture.tree)
    const invalidIndex = structuredClone(fixture.spatialIndex)
    const rows=[call({bindProductionLayout:true,persistentFlowTree:invalidTree,spatialIndex:invalidIndex}),call({persistentFlowTree:invalidTree,spatialIndex:invalidIndex}),call({spatialIndex:invalidIndex})]
    expect(rows.map(row=>row.issues[0]?.code)).toEqual(["production-binding-forbidden","flow-tree-request-binding-mismatch","spatial-index-binding-mismatch"])
  })
})
