import { describe, expect, it } from "vitest"
import {
  collectVNextTextBlockSpatialIndexNodesForQaV1,
  createVNextCompactFingerprint,
  createVNextTextBlockSpatialIndexUpdateV1,
  createVNextTextBlockSpatialIndexV1,
  inspectVNextTextBlockSpatialIndexUpdateV1,
  queryVNextTextBlockSpatialIndexV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  acceptedSpatialWrappingFixture,
  SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
} from "./helpers/textBlockSpatialWrappingV1.js"

function movableSpatialIndexFixture() {
  const fixture = acceptedSpatialWrappingFixture()
  const entries = fixture.entries.map((entry) => (
    entry.objectId === "left-exclusion"
      ? { ...entry, yLayoutUnit: 10_000_000 }
      : entry
  ))
  const built = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    entries,
  })
  if (built.status !== "accepted") throw new Error("movable spatial fixture blocked")
  return {
    ...fixture,
    index: built.index,
  }
}

describe("TextBlock spatial index update v1", () => {
  it("path-copies a move, reuses untouched nodes, and reports disjoint old/new bands", () => {
    const fixture = movableSpatialIndexFixture()
    const result = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.index,
      expectedPreviousIndexFingerprint: fixture.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 50_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("spatial move blocked")
    expect(result.update).toMatchObject({
      previousIndexFingerprint: fixture.index.fingerprint,
      objectId: "left-exclusion",
      affectedBands: [
        { topLayoutUnit: 10_000_000, bottomLayoutUnit: 30_000_000 },
        { topLayoutUnit: 50_000_000, bottomLayoutUnit: 70_000_000 },
      ],
      work: {
        completeIndexRebuildCount: 0,
      },
      contracts: {
        pathCopyUpdate: true,
        oldNewBandUnion: true,
        processLocalProofBinding: true,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(result.nextIndex).toBe(result.update.nextIndex)
    expect(result.nextIndex).not.toBe(fixture.index)
    expect(Object.isFrozen(result.update)).toBe(true)
    expect(Object.isFrozen(result.nextIndex)).toBe(true)

    const previousNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(fixture.index)
    const nextNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(result.nextIndex)
    expect(nextNodes.some((node) => previousNodes.includes(node))).toBe(true)
    const previousEntries = new Map(previousNodes.map((node) => [node.entry.objectId, node.entry]))
    const nextEntries = new Map(nextNodes.map((node) => [node.entry.objectId, node.entry]))
    for (const objectId of ["middle-exclusion", "barrier", "overlay"]) {
      expect(nextEntries.get(objectId)).toBe(previousEntries.get(objectId))
    }

    const oldBand = queryVNextTextBlockSpatialIndexV1({
      index: result.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 10_000_000, bottomLayoutUnit: 11_000_000 },
    })
    const newBand = queryVNextTextBlockSpatialIndexV1({
      index: result.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 50_000_000, bottomLayoutUnit: 51_000_000 },
    })
    expect(oldBand.status === "accepted"
      ? oldBand.entries.map((entry) => entry.objectId)
      : null).not.toContain("left-exclusion")
    expect(newBand.status === "accepted"
      ? newBand.entries.map((entry) => entry.objectId)
      : null).toContain("left-exclusion")
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: result.update,
      previousIndex: fixture.index,
      nextIndex: result.nextIndex,
    })).toEqual({
      status: "valid",
      fingerprint: result.update.fingerprint,
    })
  })

  it("merges overlapping resize bands and rejects stale, foreign, or no-op updates", () => {
    const fixture = movableSpatialIndexFixture()
    const update = (
      overrides: Partial<Parameters<typeof createVNextTextBlockSpatialIndexUpdateV1>[0]> = {},
    ) => createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.index,
      expectedPreviousIndexFingerprint: fixture.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 10_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
      ...overrides,
    })
    const moved = update({
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 50_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })
    expect(moved.status).toBe("accepted")
    if (moved.status !== "accepted") throw new Error("spatial move blocked")
    const resized = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: moved.nextIndex,
      expectedPreviousIndexFingerprint: moved.nextIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 55_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 30_000_000,
      },
    })
    expect(resized.status).toBe("accepted")
    if (resized.status !== "accepted") throw new Error("spatial resize blocked")
    expect(resized.update.affectedBands).toEqual([
      { topLayoutUnit: 50_000_000, bottomLayoutUnit: 85_000_000 },
    ])
    const resizedBand = queryVNextTextBlockSpatialIndexV1({
      index: resized.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 84_000_000, bottomLayoutUnit: 85_000_000 },
    })
    expect(resizedBand.status === "accepted"
      ? resizedBand.entries.map((entry) => entry.objectId)
      : null).toContain("left-exclusion")

    const rejected = [
      update(),
      update({ expectedPreviousIndexFingerprint: `sha256:${"0".repeat(64)}` }),
      update({ geometryOwnerFingerprint: `sha256:${"b".repeat(64)}` }),
      update({ objectId: "missing-object" }),
      update({ previousIndex: structuredClone(fixture.index) }),
      update({ persistentFlowTree: structuredClone(fixture.tree) }),
      update({ request: structuredClone(fixture.request) }),
      update({
        nextGeometry: {
          xLayoutUnit: fixture.request.availableWidthLayoutUnit - 1,
          yLayoutUnit: 10_000_000,
          widthLayoutUnit: 2,
          heightLayoutUnit: 20_000_000,
        },
      }),
    ]
    expect(rejected.map((result) => (
      result.status === "blocked" ? result.issues[0]?.code : "accepted"
    ))).toEqual([
      "no-spatial-change",
      "spatial-index-stale",
      "spatial-owner-mismatch",
      "spatial-object-not-found",
      "spatial-index-stale",
      "spatial-index-stale",
      "spatial-index-stale",
      "spatial-boundary-violation",
    ])

    const extraGeometry = update({
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 20_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
        unexpected: true,
      } as Parameters<typeof createVNextTextBlockSpatialIndexUpdateV1>[0]["nextGeometry"],
    })
    expect(extraGeometry).toMatchObject({
      status: "blocked",
      update: null,
      nextIndex: null,
      work: null,
      issues: [{ code: "invalid-spatial-entry" }],
    })
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: structuredClone(moved.update),
      previousIndex: fixture.index,
      nextIndex: moved.nextIndex,
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-provenance-mismatch",
    })
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: moved.update,
      previousIndex: fixture.index,
      nextIndex: structuredClone(moved.nextIndex),
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-binding-mismatch",
    })
    const alteredUpdate = structuredClone(moved.update)
    alteredUpdate.affectedBands = [{
      topLayoutUnit: 0,
      bottomLayoutUnit: 1,
    }]
    const { fingerprint: _discardedFingerprint, ...alteredFacts } = alteredUpdate
    alteredUpdate.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredFacts),
    )
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: alteredUpdate,
      previousIndex: fixture.index,
      nextIndex: moved.nextIndex,
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-provenance-mismatch",
    })
  })
})
