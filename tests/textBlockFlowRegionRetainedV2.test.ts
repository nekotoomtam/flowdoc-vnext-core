import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint, inspectVNextTextBlockFlowRegionResultV2, provideVNextTextBlockFlowRegionsV2, type VNextTextBlockSpatialWrapPolicyV1, type VNextTextBlockSyntheticPositionedObjectInputV1 } from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { acceptedAuthoredBoxGeometryFixture } from "./helpers/textBlockAuthoredBoxGeometryV2.js"
const SPATIAL_GEOMETRY_OWNER_FINGERPRINT = `sha256:${"a".repeat(64)}`
function entry(
  objectId: string,
  leftLayoutUnit: number,
  rightLayoutUnit: number,
  wrapPolicy: VNextTextBlockSpatialWrapPolicyV1 = "rectangular-exclusion",
): VNextTextBlockSyntheticPositionedObjectInputV1 {
  return {
    objectId,
    geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
    xLayoutUnit: leftLayoutUnit,
    yLayoutUnit: 0,
    widthLayoutUnit: rightLayoutUnit - leftLayoutUnit,
    heightLayoutUnit: 20_000_000,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy,
  }
}

function regionFixture(entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]) {
 const fixture = acceptedAuthoredBoxGeometryFixture({outerWidthPt: 100, paddingPt: {top:0,right:0,bottom:0,left:0}, entries})
 return {...fixture, index: fixture.spatialIndex}
}
function provide(entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]) {
 const fixture = regionFixture(entries)
 return {fixture, result: provideVNextTextBlockFlowRegionsV2({initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: fixture.index, band: {topLayoutUnit:0,bottomLayoutUnit:10000000},contentInsets:{leftLayoutUnit:0,rightLayoutUnit:0}})}
}
describe("retained flow-region obligations on V2", () => {
  it.each([
    {
      name: "left exclusion",
      entries: [entry("left", 0, 20_000_000)],
      intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 100_000_000 }],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 1,
    },
    {
      name: "right exclusion",
      entries: [entry("right", 80_000_000, 100_000_000)],
      intervals: [{ startLayoutUnit: 0, endLayoutUnit: 80_000_000 }],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 1,
    },
    {
      name: "middle exclusion",
      entries: [entry("middle", 40_000_000, 60_000_000)],
      intervals: [
        { startLayoutUnit: 0, endLayoutUnit: 40_000_000 },
        { startLayoutUnit: 60_000_000, endLayoutUnit: 100_000_000 },
      ],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 1,
    },
    {
      name: "two exclusions",
      entries: [
        entry("first", 20_000_000, 30_000_000),
        entry("second", 60_000_000, 70_000_000),
      ],
      intervals: [
        { startLayoutUnit: 0, endLayoutUnit: 20_000_000 },
        { startLayoutUnit: 30_000_000, endLayoutUnit: 60_000_000 },
        { startLayoutUnit: 70_000_000, endLayoutUnit: 100_000_000 },
      ],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 2,
    },
    {
      name: "top-bottom barrier",
      entries: [entry("barrier", 10_000_000, 90_000_000, "top-bottom-barrier")],
      intervals: [],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 0,
    },
    {
      name: "overlay",
      entries: [entry("overlay", 20_000_000, 80_000_000, "overlay")],
      intervals: [{ startLayoutUnit: 0, endLayoutUnit: 100_000_000 }],
      nextYLayoutUnit: null,
      subtractionCount: 0,
    },
    {
      name: "full-width exclusion",
      entries: [entry("full", 0, 100_000_000)],
      intervals: [],
      nextYLayoutUnit: 20_000_000,
      subtractionCount: 1,
    },
  ])("provides deterministic intervals for $name", ({
    entries,
    intervals,
    nextYLayoutUnit,
    subtractionCount,
  }) => {
    const first = provide(entries)
    const second = provideVNextTextBlockFlowRegionsV2({
      spatialIndex: first.fixture.index,
      persistentFlowTree: first.fixture.tree,
      initialFlow: first.fixture.initialFlow, evidence: first.fixture.evidence,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: {
        leftLayoutUnit: 0,
        rightLayoutUnit: 0,
      },
    })

    expect(first.result.status).toBe("accepted")
    if (first.result.status !== "accepted") throw new Error("flow region blocked")
    expect(first.result).toEqual(second)
    expect(first.result.intervals).toEqual(intervals)
    expect(first.result.nextYLayoutUnit).toBe(nextYLayoutUnit)
    expect(first.result.work.rectangularSubtractionCount).toBe(subtractionCount)
    expect(first.result).toMatchObject({
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(Object.isFrozen(first.result)).toBe(true)
    expect(Object.isFrozen(first.result.intervals)).toBe(true)
    expect(inspectVNextTextBlockFlowRegionResultV2(first.result)).toEqual({
      status: "valid",
      fingerprint: first.result.fingerprint,
    })
  })

  it("uses the zero-query fast path and rejects invalid identity, bands, insets, and proofs", () => {
    for (const entries of [
      [],
      [entry("overlay", 20_000_000, 80_000_000, "overlay")],
    ]) {
      const provided = provide(entries)
      expect(provided.result).toMatchObject({
        status: "accepted",
        intervals: [{ startLayoutUnit: 0, endLayoutUnit: 100_000_000 }],
        intersectingEntryFingerprints: [],
        nextYLayoutUnit: null,
        work: {
          fastPath: "no-flow-affecting-entry",
          spatialIndexQueryCount: 0,
          visitedSpatialNodeCount: 0,
          matchedSpatialEntryCount: 0,
          rectangularSubtractionCount: 0,
        },
      })
    }

    const fixture = regionFixture([entry("middle", 40_000_000, 60_000_000)])
    const call = (
      overrides: Record<string, unknown> = {},
    ) => provideVNextTextBlockFlowRegionsV2({
      spatialIndex: fixture.index,
      persistentFlowTree: fixture.tree,
      initialFlow: fixture.initialFlow, evidence: fixture.evidence,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: {
        leftLayoutUnit: 0,
        rightLayoutUnit: 0,
      },
      ...overrides,
    })
    const invalid = [
      call({ spatialIndex: structuredClone(fixture.index) }),
      call({ evidence: structuredClone(fixture.evidence) }),
      call({ band: { topLayoutUnit: -1, bottomLayoutUnit: 1 } }),
      call({ band: { topLayoutUnit: 1, bottomLayoutUnit: 1 } }),
      call({
        contentInsets: {
          leftLayoutUnit: 100_000_000,
          rightLayoutUnit: 0,
        },
      }),
      call({
        contentInsets: {
          leftLayoutUnit: -1,
          rightLayoutUnit: 0,
        },
      }),
      call({
        contentInsets: {
          leftLayoutUnit: 0,
          rightLayoutUnit: Number.MAX_SAFE_INTEGER + 1,
        },
      }),
    ]
    expect(invalid.map((result) => (
      result.status === "blocked" ? result.issues[0]?.code : "accepted"
    ))).toEqual([
      "spatial-index-provenance-mismatch",
      "spatial-index-binding-mismatch",
      "invalid-line-band",
      "invalid-line-band",
      "invalid-content-insets",
      "invalid-content-insets",
      "unsafe-region-arithmetic",
    ])

    const accepted = call()
    if (accepted.status !== "accepted") throw new Error("flow region blocked")
    const altered = structuredClone(accepted)
    altered.intervals = [{ startLayoutUnit: 0, endLayoutUnit: 1 }]
    const { fingerprint: _discardedFingerprint, ...alteredFacts } = altered
    altered.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredFacts),
    )
    expect(inspectVNextTextBlockFlowRegionResultV2(altered)).toMatchObject({
      status: "invalid",
      code: "flow-region-provenance-mismatch",
    })
  })
})
