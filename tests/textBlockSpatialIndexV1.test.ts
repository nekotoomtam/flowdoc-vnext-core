import { describe, expect, it } from "vitest"
import {
  collectVNextTextBlockSpatialIndexNodesForQaV1,
  createVNextCompactFingerprint,
  createVNextTextBlockSpatialIndexV1,
  inspectVNextTextBlockSpatialIndexV1,
  queryVNextTextBlockSpatialIndexV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { acceptedSpatialWrappingFixture } from "./helpers/textBlockSpatialWrappingV1.js"

describe("TextBlock spatial index v1", () => {
  it("creates one deterministic immutable synthetic y-interval index", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const first = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries: fixture.entries,
    })
    const second = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries: [...fixture.entries].reverse(),
    })

    expect(first.status).toBe("accepted")
    expect(second.status).toBe("accepted")
    if (first.status !== "accepted" || second.status !== "accepted") {
      throw new Error("spatial index blocked")
    }
    expect(first.index).toEqual(second.index)
    expect(first.index).toMatchObject({
      inputAuthority: "core-synthetic-qa-only",
      documentId: fixture.tree.documentId,
      sectionId: fixture.tree.sectionId,
      textBlockId: fixture.tree.textBlockId,
      instanceRevision: fixture.tree.instanceRevision,
      layoutContextFingerprint: fixture.tree.layoutContextFingerprint,
      persistentFlowTreeFingerprint: fixture.tree.fingerprint,
      contentLeftLayoutUnit: 0,
      contentRightLayoutUnit: fixture.request.availableWidthLayoutUnit,
      summary: {
        entryCount: 4,
        nodeCount: 4,
        flowAffectingEntryCount: 3,
        barrierEntryCount: 1,
        overlayEntryCount: 1,
      },
      contracts: {
        canonicalPositionedObjectSchema: false,
        authoredPositionedObjectBinding: false,
        processLocalImmutableIndex: true,
        subtreeMaximumBottomQuery: true,
        coreOwnedFingerprints: true,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(inspectVNextTextBlockSpatialIndexV1(first.index)).toEqual({
      status: "valid",
      fingerprint: first.index.fingerprint,
    })
    expect(Object.isFrozen(first.index)).toBe(true)
    expect(
      collectVNextTextBlockSpatialIndexNodesForQaV1(first.index)
        .every((node) => Object.isFrozen(node)),
    ).toBe(true)
    expect(inspectVNextTextBlockSpatialIndexV1(
      structuredClone(first.index),
    )).toMatchObject({
      status: "invalid",
      code: "spatial-index-provenance-mismatch",
    })
  })

  it("fails closed for invalid synthetic entries, boundary violations, and identity mismatches", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const build = (
      entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[],
      overrides: Partial<Parameters<typeof createVNextTextBlockSpatialIndexV1>[0]> = {},
    ) => createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries,
      ...overrides,
    })
    const replaceFirst = (
      replacement: Record<string, unknown>,
    ): readonly VNextTextBlockSyntheticPositionedObjectInputV1[] => [
      {
        ...fixture.entries[0],
        ...replacement,
      } as VNextTextBlockSyntheticPositionedObjectInputV1,
      ...fixture.entries.slice(1),
    ]

    const duplicate = build([
      ...fixture.entries,
      {
        ...fixture.entries[0],
      },
    ])
    expect(duplicate).toMatchObject({
      status: "blocked",
      index: null,
      issues: [{ code: "duplicate-object-id", objectId: "left-exclusion" }],
    })

    const invalidCases: Array<{
      name: string
      entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
      code: string
    }> = [
      {
        name: "blank object id",
        entries: replaceFirst({ objectId: " " }),
        code: "invalid-spatial-entry",
      },
      {
        name: "malformed owner fingerprint",
        entries: replaceFirst({ geometryOwnerFingerprint: "not-a-fingerprint" }),
        code: "invalid-spatial-entry",
      },
      {
        name: "unknown wrap policy",
        entries: replaceFirst({ wrapPolicy: "float-around" }),
        code: "unsupported-wrap-policy",
      },
      {
        name: "non-safe integer",
        entries: replaceFirst({ xLayoutUnit: Number.MAX_SAFE_INTEGER + 1 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "zero width",
        entries: replaceFirst({ widthLayoutUnit: 0 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "zero height",
        entries: replaceFirst({ heightLayoutUnit: 0 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "left clearance overflow",
        entries: replaceFirst({
          xLayoutUnit: 0,
          clearance: {
            ...fixture.entries[0].clearance,
            leftLayoutUnit: 1,
          },
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "negative clearance-envelope top",
        entries: replaceFirst({
          yLayoutUnit: 0,
          clearance: {
            ...fixture.entries[0].clearance,
            topLayoutUnit: 1,
          },
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "safe integer addition overflow",
        entries: replaceFirst({
          xLayoutUnit: Number.MAX_SAFE_INTEGER,
          widthLayoutUnit: 1,
        }),
        code: "unsafe-spatial-arithmetic",
      },
      {
        name: "horizontal overflow",
        entries: replaceFirst({
          xLayoutUnit: fixture.request.availableWidthLayoutUnit - 1,
          widthLayoutUnit: 2,
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "extra object field",
        entries: replaceFirst({ unexpected: true }),
        code: "invalid-spatial-entry",
      },
    ]

    for (const invalidCase of invalidCases) {
      expect(build(invalidCase.entries), invalidCase.name).toMatchObject({
        status: "blocked",
        index: null,
        issues: [{ code: invalidCase.code }],
      })
    }

    expect(createVNextTextBlockSpatialIndexV1({
      inputAuthority: "canonical-positioned-objects" as "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries: fixture.entries,
    })).toMatchObject({
      status: "blocked",
      index: null,
      issues: [{ code: "input-authority-mismatch" }],
    })
    expect(build(fixture.entries, {
      persistentFlowTree: structuredClone(fixture.tree),
    })).toMatchObject({
      status: "blocked",
      index: null,
      issues: [{ code: "flow-tree-provenance-mismatch" }],
    })
    expect(build(fixture.entries, {
      request: structuredClone(fixture.request),
    })).toMatchObject({
      status: "blocked",
      index: null,
      issues: [{ code: "flow-tree-request-binding-mismatch" }],
    })
    expect(build(fixture.entries, {
      request: {
        ...structuredClone(fixture.request),
        bindProductionLayout: true,
      },
    })).toMatchObject({
      status: "blocked",
      index: null,
      issues: [{ code: "production-binding-forbidden" }],
    })
  })

  it("queries a narrow half-open y band with subtree max-bottom pruning", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const entries = Array.from(
      { length: 1_024 },
      (_, index): VNextTextBlockSyntheticPositionedObjectInputV1 => ({
        objectId: `entry-${index.toString().padStart(4, "0")}`,
        geometryOwnerFingerprint: fixture.entries[0].geometryOwnerFingerprint,
        xLayoutUnit: 0,
        yLayoutUnit: index * 1_000_000,
        widthLayoutUnit: 1_000_000,
        heightLayoutUnit: 500_000,
        clearance: {
          topLayoutUnit: 0,
          rightLayoutUnit: 0,
          bottomLayoutUnit: 0,
          leftLayoutUnit: 0,
        },
        wrapPolicy: "rectangular-exclusion",
      }),
    )
    const built = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries,
    })
    expect(built.status).toBe("accepted")
    if (built.status !== "accepted") throw new Error("large spatial index blocked")

    const result = queryVNextTextBlockSpatialIndexV1({
      index: built.index,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: {
        topLayoutUnit: 700_000_000,
        bottomLayoutUnit: 700_000_001,
      },
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("spatial query blocked")
    expect(result.entries.map((entry) => entry.objectId)).toEqual(["entry-0700"])
    expect(result.work).toMatchObject({
      matchedEntryCount: 1,
      completeIndexScanCount: 0,
    })
    expect(result.work.visitedNodeCount).toBeLessThan(built.index.summary.nodeCount)
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.entries)).toBe(true)

    const invalidBands = [
      { topLayoutUnit: -1, bottomLayoutUnit: 1 },
      { topLayoutUnit: 1, bottomLayoutUnit: 1 },
      { topLayoutUnit: 2, bottomLayoutUnit: 1 },
      { topLayoutUnit: 0.5, bottomLayoutUnit: 1 },
      { topLayoutUnit: 0, bottomLayoutUnit: Number.MAX_SAFE_INTEGER + 1 },
    ]
    for (const band of invalidBands) {
      expect(queryVNextTextBlockSpatialIndexV1({
        index: built.index,
        persistentFlowTree: fixture.tree,
        request: fixture.request,
        band,
      })).toMatchObject({
        status: "blocked",
        entries: null,
        work: null,
        issues: [{ code: "invalid-query-band" }],
      })
    }
    expect(queryVNextTextBlockSpatialIndexV1({
      index: structuredClone(built.index),
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 1 },
    })).toMatchObject({
      status: "blocked",
      entries: null,
      work: null,
      issues: [{ code: "spatial-index-provenance-mismatch" }],
    })
    expect(queryVNextTextBlockSpatialIndexV1({
      index: built.index,
      persistentFlowTree: fixture.tree,
      request: structuredClone(fixture.request),
      band: { topLayoutUnit: 0, bottomLayoutUnit: 1 },
    })).toMatchObject({
      status: "blocked",
      entries: null,
      work: null,
      issues: [{ code: "spatial-index-stale" }],
    })

    const alteredIndex = structuredClone(built.index)
    if (alteredIndex.root == null) throw new Error("large spatial index root missing")
    alteredIndex.root.entry.xLayoutUnit += 1
    alteredIndex.root.entry.envelope.leftLayoutUnit += 1
    alteredIndex.root.entry.envelope.rightLayoutUnit += 1
    const {
      fingerprint: _discardedEntryFingerprint,
      ...alteredEntryFacts
    } = alteredIndex.root.entry
    alteredIndex.root.entry.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredEntryFacts),
    )
    const {
      fingerprint: _discardedIndexFingerprint,
      ...alteredIndexFacts
    } = alteredIndex
    alteredIndex.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredIndexFacts),
    )
    expect(inspectVNextTextBlockSpatialIndexV1(alteredIndex)).toMatchObject({
      status: "invalid",
      code: "spatial-index-provenance-mismatch",
    })
  })

  it("orders distinct same-envelope ids by stable ordinal code units", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const ids = ["a-b", "ab", "é", "e\u0301"]
    const entries = ids.map(
      (objectId): VNextTextBlockSyntheticPositionedObjectInputV1 => ({
        ...fixture.entries[0],
        objectId,
        xLayoutUnit: 10_000_000,
        yLayoutUnit: 10_000_000,
        widthLayoutUnit: 10_000_000,
        heightLayoutUnit: 10_000_000,
      }),
    )
    const forward = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries,
    })
    const reverse = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries: [...entries].reverse(),
    })
    expect(forward.status).toBe("accepted")
    expect(reverse.status).toBe("accepted")
    if (forward.status !== "accepted" || reverse.status !== "accepted") {
      throw new Error("same-envelope id index blocked")
    }
    expect(forward.index).toEqual(reverse.index)
    const queried = queryVNextTextBlockSpatialIndexV1({
      index: forward.index,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 10_000_000, bottomLayoutUnit: 11_000_000 },
    })
    expect(queried.status).toBe("accepted")
    if (queried.status !== "accepted") throw new Error("same-envelope query blocked")
    expect(queried.entries.map((entry) => entry.objectId)).toEqual([
      "a-b",
      "ab",
      "e\u0301",
      "é",
    ])
  })
})
