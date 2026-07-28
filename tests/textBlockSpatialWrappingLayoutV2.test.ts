import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockSpatialIndexV1,
  createVNextTextBlockSpatialIndexV2,
  inspectVNextTextBlockSpatialWrappingLayoutV2,
  layoutVNextTextBlockSpatialWrappingV1,
  layoutVNextTextBlockSpatialWrappingV2,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../src/index.js"
import {
  acceptedInlineImageFlowTreeFixture,
  acceptedInlineImageSpatialFixture,
  type InlineImageFlowFixtureOptions,
} from "./helpers/textBlockInlineImageFlowV2.js"

const geometryOwnerFingerprint = `sha256:${"9".repeat(64)}`

function spatialEntry(input: {
  objectId: string
  leftLayoutUnit: number
  rightLayoutUnit: number
  topLayoutUnit?: number
  bottomLayoutUnit?: number
  wrapPolicy?: "rectangular-exclusion" | "top-bottom-barrier" | "overlay"
}): VNextTextBlockSyntheticPositionedObjectInputV1 {
  const topLayoutUnit = input.topLayoutUnit ?? 0
  const bottomLayoutUnit = input.bottomLayoutUnit ?? 20_000_000
  return {
    objectId: input.objectId,
    geometryOwnerFingerprint,
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

function layoutV2(
  options: InlineImageFlowFixtureOptions,
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[] = [],
) {
  const fixture = acceptedInlineImageFlowTreeFixture(options)
  const spatial = createVNextTextBlockSpatialIndexV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    entries,
  })
  if (spatial.status !== "accepted") throw new Error("V2 spatial fixture blocked")
  return {
    ...fixture,
    spatialIndex: spatial.index,
    result: layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: spatial.index,
      startYLayoutUnit: 0,
    }),
  }
}

function v1Request(
  fixture: ReturnType<typeof acceptedInlineImageFlowTreeFixture>,
): VNextTextBlockMultiRunLayoutRequestV1 {
  return {
    layoutId: fixture.evidence.layoutId,
    measurement: fixture.evidence.measurement,
    layoutUnitPolicyFingerprint: fixture.evidence.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: fixture.evidence.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: fixture.evidence.declaredLineHeightLayoutUnit,
    paragraphStyle: fixture.evidence.paragraphStyle,
    fontFaces: fixture.evidence.fontFaces,
    shapingRuns: fixture.evidence.shapingRuns,
    breakOffsets: fixture.evidence.breakOffsets,
    lines: fixture.evidence.breakOffsets.slice(0, -1).map((renderStartOffset, index) => ({
      index,
      renderStartOffset,
      renderEndOffset: fixture.evidence.breakOffsets[index + 1]!,
    })),
  }
}

function normalizedGeometry(result: {
  lines: readonly {
    index: number
    renderStartOffset: number
    renderEndOffset: number
    yOffsetLayoutUnit: number
    heightLayoutUnit: number
    baselineOffsetLayoutUnit: number
    availableIntervals: readonly unknown[]
    intervalPlacements: readonly unknown[]
    sourceSegments: readonly unknown[]
    fragments: readonly object[]
  }[]
}) {
  return result.lines.map((line) => ({
    index: line.index,
    renderStartOffset: line.renderStartOffset,
    renderEndOffset: line.renderEndOffset,
    yOffsetLayoutUnit: line.yOffsetLayoutUnit,
    heightLayoutUnit: line.heightLayoutUnit,
    baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
    availableIntervals: line.availableIntervals,
    intervalPlacements: line.intervalPlacements,
    sourceSegments: line.sourceSegments,
    fragments: line.fragments.map((fragment) => {
      const { kind: _kind, fingerprint: _fingerprint, ...facts } = {
        ...fragment,
      } as Record<string, unknown>
      return facts
    }),
  }))
}

describe("TextBlock spatial wrapping layout V2", () => {
  it.each([
    ["baseline", 12_000_000, 0, 14_400_000],
    ["middle", 10_600_000, 1_000_000, 14_000_000],
    ["text-bottom", 10_600_000, 1_000_000, 14_000_000],
  ] as const)("places an image-only %s fragment with exact baseline geometry", (
    verticalAlign,
    baselineOffsetLayoutUnit,
    yLayoutUnit,
    lineHeightLayoutUnit,
  ) => {
    const { result } = layoutV2({ content: "image-only", verticalAlign })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("V2 image layout blocked")
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: 0,
      renderEndOffset: 1,
      yOffsetLayoutUnit: 0,
      heightLayoutUnit: lineHeightLayoutUnit,
      baselineOffsetLayoutUnit,
      availableIntervals: [{ startLayoutUnit: 0, endLayoutUnit: 90_000_000 }],
      intervalPlacements: [{
        intervalIndex: 0,
        renderStartOffset: 0,
        renderEndOffset: 1,
        xStartLayoutUnit: 0,
        xEndLayoutUnit: 10_000_000,
      }],
      fragments: [{
        kind: "inline-image",
        inlineId: "image-1",
        assetId: "asset-1",
        renderStartOffset: 0,
        renderEndOffset: 1,
        xLayoutUnit: 0,
        yLayoutUnit,
        widthLayoutUnit: 10_000_000,
        heightLayoutUnit: 12_000_000,
        verticalAlign,
      }],
    })
    expect(result.summary).toMatchObject({
      lineCount: 1,
      textFragmentCount: 0,
      inlineImageFragmentCount: 1,
      intervalPlacementCount: 1,
      heightLayoutUnit: lineHeightLayoutUnit,
    })
    expect(result.work).toMatchObject({ spatialIndexQueryCount: 0 })
    expect(inspectVNextTextBlockSpatialWrappingLayoutV2(result))
      .toEqual({ status: "valid", fingerprint: result.fingerprint })
  })

  it("preserves exact V1 text-only geometry after normalization", () => {
    const v2 = layoutV2({ content: "text-only" })
    expect(v2.result.status).toBe("accepted")
    if (v2.result.status !== "accepted") throw new Error("V2 text layout blocked")
    const request = v1Request(v2)
    const accepted = acceptVNextTextBlockMultiRunLayoutV1(request)
    if (accepted.status !== "accepted") throw new Error("V1 accepted layout blocked")
    const persistent = createVNextTextBlockPersistentFlowTreeV1({
      request,
      acceptedLayout: accepted,
    })
    if (persistent.status !== "accepted") throw new Error("V1 tree blocked")
    const spatial = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: persistent.tree,
      request,
      entries: [],
    })
    if (spatial.status !== "accepted") throw new Error("V1 index blocked")
    const v1 = layoutVNextTextBlockSpatialWrappingV1({
      persistentFlowTree: persistent.tree,
      request,
      spatialIndex: spatial.index,
      startYLayoutUnit: 0,
    })
    if (v1.status !== "accepted") throw new Error("V1 layout blocked")
    expect(normalizedGeometry(v2.result)).toEqual(normalizedGeometry(v1))
  })

  it.each([
    ["text-image-text", ["text", "inline-image", "text"], [0, 6_000_000, 16_000_000]],
    ["adjacent-images", ["inline-image", "inline-image"], [0, 10_000_000]],
    ["text-image-text-break", ["text", "inline-image", "text"], [0, 6_000_000, 16_000_000]],
    ["field-image-page-break", ["text", "inline-image", "text"], [0, 6_000_000, 16_000_000]],
  ] as const)("places %s atoms in exact source order without image coalescing", (
    content,
    kinds,
    xCoordinates,
  ) => {
    const { result } = layoutV2({ content })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("mixed V2 layout blocked")
    expect(result.lines[0]?.fragments.map((fragment) => fragment.kind)).toEqual(kinds)
    expect(result.lines[0]?.fragments.map((fragment) => fragment.xLayoutUnit)).toEqual(xCoordinates)
    expect(result.lines[0]?.renderStartOffset).toBe(0)
    expect(result.lines[0]?.renderEndOffset).toBe(
      content.endsWith("-break") ? 4 : content === "adjacent-images" ? 2 : 3,
    )
  })

  it("retains Thai/Latin source coverage and lets larger text expand the image line", () => {
    const { result } = layoutV2({
      content: "thai-image-latin",
      mixedTextSizes: true,
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("Thai/Latin V2 layout blocked")
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: 0,
      renderEndOffset: 3,
      heightLayoutUnit: 24_000_000,
      fragments: [
        { kind: "text", text: "ก", renderStartOffset: 0, renderEndOffset: 1 },
        { kind: "inline-image", renderStartOffset: 1, renderEndOffset: 2 },
        { kind: "text", text: "Z", renderStartOffset: 2, renderEndOffset: 3 },
      ],
    })
    expect(result.work.lineBandRequeryCount).toBe(1)
  })

  it("coalesces adjacent text clusters while retaining both exact source segments", () => {
    const { result } = layoutV2({
      content: "adjacent-text",
      breakOffsets: [0, 2],
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("adjacent text layout blocked")
    expect(result.lines[0]).toMatchObject({
      renderStartOffset: 0,
      renderEndOffset: 2,
      fragments: [{
        kind: "text",
        text: "fi",
        renderStartOffset: 0,
        renderEndOffset: 2,
        advanceLayoutUnit: 6_000_000,
        sourceSegments: [
          { inlineId: "text-f", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "f" },
          { inlineId: "text-i", kind: "text", renderStartOffset: 1, renderEndOffset: 2, renderedText: "i" },
        ],
      }],
      sourceSegments: [
        { inlineId: "text-f", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "f" },
        { inlineId: "text-i", kind: "text", renderStartOffset: 1, renderEndOffset: 2, renderedText: "i" },
      ],
    })
  })

  it("retains exact field, image, page-number, and hard-break source segments", () => {
    const { result } = layoutV2({ content: "field-image-page-break" })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("field/image/page layout blocked")
    expect(result.lines[0]?.sourceSegments).toEqual([
      {
        inlineId: "field-b", kind: "resolved-field", fieldKey: "customer.initial",
        styleKey: "paragraph-body", renderStartOffset: 0, renderEndOffset: 1,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "B",
      },
      {
        inlineId: "image-1", kind: "inline-image",
        renderStartOffset: 1, renderEndOffset: 2,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "\uFFFC",
      },
      {
        inlineId: "page-c", kind: "generated-page-number",
        generatedOwnerFingerprint: `sha256:${"b".repeat(64)}`,
        styleKey: "paragraph-body", renderStartOffset: 2, renderEndOffset: 3,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "3",
      },
      {
        inlineId: "break-1", kind: "hard-break",
        renderStartOffset: 3, renderEndOffset: 4,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "\n",
      },
    ])
    expect(result.lines[0]?.fragments.map((fragment) => fragment.sourceSegments)).toEqual([
      [{
        inlineId: "field-b", kind: "resolved-field", fieldKey: "customer.initial",
        styleKey: "paragraph-body", renderStartOffset: 0, renderEndOffset: 1,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "B",
      }],
      [{
        inlineId: "image-1", kind: "inline-image",
        renderStartOffset: 1, renderEndOffset: 2,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "\uFFFC",
      }],
      [{
        inlineId: "page-c", kind: "generated-page-number",
        generatedOwnerFingerprint: `sha256:${"b".repeat(64)}`,
        styleKey: "paragraph-body", renderStartOffset: 2, renderEndOffset: 3,
        sourceStartOffset: 0, sourceEndOffset: 1, renderedText: "3",
      }],
    ])
  })

  it.each([
    [
      "left",
      [spatialEntry({ objectId: "left", leftLayoutUnit: 0, rightLayoutUnit: 20_000_000 })],
      { xLayoutUnit: 20_000_000, intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 90_000_000 }] },
    ],
    [
      "right",
      [spatialEntry({ objectId: "right", leftLayoutUnit: 70_000_000, rightLayoutUnit: 90_000_000 })],
      { xLayoutUnit: 0, intervals: [{ startLayoutUnit: 0, endLayoutUnit: 70_000_000 }] },
    ],
    [
      "middle",
      [spatialEntry({ objectId: "middle", leftLayoutUnit: 30_000_000, rightLayoutUnit: 50_000_000 })],
      { xLayoutUnit: 50_000_000, intervals: [{ startLayoutUnit: 0, endLayoutUnit: 30_000_000 }, { startLayoutUnit: 50_000_000, endLayoutUnit: 90_000_000 }] },
    ],
    [
      "multiple",
      [
        spatialEntry({ objectId: "left", leftLayoutUnit: 0, rightLayoutUnit: 20_000_000 }),
        spatialEntry({ objectId: "middle", leftLayoutUnit: 40_000_000, rightLayoutUnit: 60_000_000 }),
      ],
      { xLayoutUnit: 20_000_000, intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 40_000_000 }, { startLayoutUnit: 60_000_000, endLayoutUnit: 90_000_000 }] },
    ],
  ] as const)("places an image against %s exclusions", (_name, entries, expected) => {
    const options: InlineImageFlowFixtureOptions = {
      content: "image-only",
      ...(_name === "middle" ? { width: { value: 40, unit: "pt" } as const } : {}),
    }
    const { result } = layoutV2(options, entries)
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("excluded V2 layout blocked")
    expect(result.lines[0]?.availableIntervals).toEqual(expected.intervals)
    expect(result.lines[0]?.fragments[0]).toMatchObject({
      kind: "inline-image",
      xLayoutUnit: expected.xLayoutUnit,
    })
  })

  it("advances past barriers, keeps overlays neutral, and preserves the zero-query path", () => {
    const barrier = layoutV2({ content: "image-only" }, [spatialEntry({
      objectId: "barrier",
      leftLayoutUnit: 0,
      rightLayoutUnit: 90_000_000,
      bottomLayoutUnit: 20_000_000,
      wrapPolicy: "top-bottom-barrier",
    })])
    expect(barrier.result).toMatchObject({
      status: "accepted",
      lines: [{ yOffsetLayoutUnit: 20_000_000 }],
      work: { verticalAdvanceCount: 1 },
    })
    const overlay = layoutV2({ content: "image-only" }, [spatialEntry({
      objectId: "overlay",
      leftLayoutUnit: 0,
      rightLayoutUnit: 90_000_000,
      wrapPolicy: "overlay",
    })])
    expect(overlay.result).toMatchObject({
      status: "accepted",
      lines: [{ availableIntervals: [{ startLayoutUnit: 0, endLayoutUnit: 90_000_000 }] }],
      work: {
        flowRegionFastPathCount: 1,
        spatialIndexQueryCount: 0,
        verticalAdvanceCount: 0,
      },
    })
  })

  it.each([1, 20_000_000])(
    "turns an accepted full blocking envelope into a strictly advancing event at %i",
    (bottomLayoutUnit) => {
      const { result } = layoutV2({ content: "image-only" }, [spatialEntry({
        objectId: `full-${bottomLayoutUnit}`,
        leftLayoutUnit: 0,
        rightLayoutUnit: 90_000_000,
        bottomLayoutUnit,
      })])
      expect(result.status).toBe("accepted")
      if (result.status !== "accepted") throw new Error("full blocking layout blocked")
      expect(result.lines[0]?.yOffsetLayoutUnit).toBe(bottomLayoutUnit)
      expect(result.lines[0]!.yOffsetLayoutUnit).toBeGreaterThan(0)
      expect(result.work.verticalAdvanceCount).toBe(1)
    },
  )

  it("re-queries an image-expanded band and discovers a later full-width exclusion", () => {
    const { result } = layoutV2({
      content: "image-only",
      verticalAlign: "baseline",
      height: { value: 30, unit: "pt" },
    }, [spatialEntry({
      objectId: "late-exclusion",
      leftLayoutUnit: 0,
      rightLayoutUnit: 90_000_000,
      topLayoutUnit: 20_000_000,
      bottomLayoutUnit: 25_000_000,
    })])
    expect(result).toMatchObject({
      status: "accepted",
      lines: [{ yOffsetLayoutUnit: 25_000_000 }],
      work: {
        lineBandRequeryCount: 2,
        verticalAdvanceCount: 1,
      },
    })
  })

  it("accepts an exact-fit image and blocks an oversized image without resizing", () => {
    const exact = layoutV2({
      content: "image-only",
      width: { value: 90, unit: "pt" },
    })
    expect(exact.result).toMatchObject({
      status: "accepted",
      lines: [{ fragments: [{ widthLayoutUnit: 90_000_000, xLayoutUnit: 0 }] }],
    })
    const oversized = layoutV2({
      content: "image-only",
      width: { value: 91, unit: "pt" },
    })
    expect(oversized.result).toMatchObject({
      status: "blocked",
      lines: null,
      summary: null,
      work: null,
      fingerprint: null,
      issues: [{ code: "unbreakable-flow-item-overflow" }],
    })
  })

  it("fails closed for cloned authority objects, production binding, and unsafe start y", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({ content: "image-only" })
    const spatial = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: [],
    })
    if (spatial.status !== "accepted") throw new Error("V2 spatial fixture blocked")
    const call = (overrides: Record<string, unknown> = {}) =>
      layoutVNextTextBlockSpatialWrappingV2({
        initialFlow: fixture.initialFlow,
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: spatial.index,
        startYLayoutUnit: 0,
        ...overrides,
      })
    const rejected = [
      call({ initialFlow: structuredClone(fixture.initialFlow) }),
      call({ evidence: structuredClone(fixture.evidence) }),
      call({ persistentFlowTree: structuredClone(fixture.tree) }),
      call({ spatialIndex: structuredClone(spatial.index) }),
      call({ bindProductionLayout: true }),
      call({ startYLayoutUnit: Number.MAX_SAFE_INTEGER + 1 }),
    ]
    expect(rejected.map((result) => ({
      status: result.status,
      lines: result.lines,
      code: result.issues[0]?.code,
    }))).toEqual([
      { status: "blocked", lines: null, code: "layout-authority-mismatch" },
      { status: "blocked", lines: null, code: "layout-authority-mismatch" },
      { status: "blocked", lines: null, code: "layout-authority-mismatch" },
      { status: "blocked", lines: null, code: "spatial-index-binding-mismatch" },
      { status: "blocked", lines: null, code: "production-binding-forbidden" },
      { status: "blocked", lines: null, code: "unsafe-layout-arithmetic" },
    ])
  })

  it.each([
    ["vertical alignment", { verticalAlign: "baseline" as const }],
    ["asset", { assetId: "asset-changed" }],
    ["fit", { fit: "cover" as const }],
    ["crop", { crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } }],
    ["frame", { width: { value: 11, unit: "pt" as const } }],
  ] as const)("rejects changed %s geometry against a stale index", (_name, change) => {
    const original = acceptedInlineImageFlowTreeFixture({ content: "image-only" })
    const changed = acceptedInlineImageFlowTreeFixture({ content: "image-only", ...change })
    const spatial = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: original.initialFlow,
      evidence: original.evidence,
      persistentFlowTree: original.tree,
      entries: [],
    })
    if (spatial.status !== "accepted") throw new Error("V2 spatial fixture blocked")
    expect(layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: changed.initialFlow,
      evidence: changed.evidence,
      persistentFlowTree: changed.tree,
      spatialIndex: spatial.index,
      startYLayoutUnit: 0,
    })).toMatchObject({
      status: "blocked",
      lines: null,
      issues: [{ code: "spatial-index-binding-mismatch" }],
    })
  })

  it("rejects cloned and refingerprinted layout results", () => {
    const { result } = layoutV2({ content: "image-only" })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("V2 image layout blocked")
    const clone = structuredClone(result)
    expect(inspectVNextTextBlockSpatialWrappingLayoutV2(clone)).toMatchObject({
      status: "invalid",
      code: "spatial-layout-provenance-mismatch",
    })
    const altered = structuredClone(result)
    altered.lines[0]!.fragments[0]!.xLayoutUnit = 1
    expect(inspectVNextTextBlockSpatialWrappingLayoutV2(altered)).toMatchObject({
      status: "invalid",
      code: "spatial-layout-provenance-mismatch",
    })
    expect(() => {
      const fragment = result.lines[0]!.fragments[0]!
      ;(fragment as { xLayoutUnit: number }).xLayoutUnit = 1
    }).toThrow(TypeError)
    expect(inspectVNextTextBlockSpatialWrappingLayoutV2(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
  })

  it("rejects a present undefined production-binding flag without emitting lines", () => {
    const fixture = acceptedInlineImageSpatialFixture({ content: "image-only" })
    expect(layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
      bindProductionLayout: undefined,
    })).toMatchObject({ status: "blocked", lines: null, summary: null, work: null, issues: [{ code: "invalid-input" }] })
  })
})
