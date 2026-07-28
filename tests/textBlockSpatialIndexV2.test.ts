import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockSpatialIndexUpdateV2,
  createVNextTextBlockSpatialIndexV2,
  inspectVNextTextBlockSpatialIndexV2,
  inspectVNextTextBlockSpatialIndexUpdateV2,
  provideVNextTextBlockFlowRegionsV2,
} from "../src/index.js"
import * as core from "../src/index.js"
import { acceptedInlineImageFlowTreeFixture } from "./helpers/textBlockInlineImageFlowV2.js"

const owner = `sha256:${"a".repeat(64)}`
const entry = (objectId: string, xLayoutUnit: number, yLayoutUnit: number) => ({
  objectId,
  geometryOwnerFingerprint: owner,
  xLayoutUnit,
  yLayoutUnit,
  widthLayoutUnit: 20_000_000,
  heightLayoutUnit: 10_000_000,
  clearance: { topLayoutUnit: 0, rightLayoutUnit: 0, bottomLayoutUnit: 0, leftLayoutUnit: 0 },
  wrapPolicy: "rectangular-exclusion" as const,
})

describe("VNext TextBlock Spatial Index V2", () => {
  it("builds an immutable index only for the exact V2 authority tuple", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const built = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: [entry("middle", 40_000_000, 0)],
    })
    expect(built).toMatchObject({
      status: "accepted",
      index: {
        source: "vnext-text-block-spatial-index-v2",
        contractVersion: 2,
        persistentFlowTreeFingerprint: fixture.tree.fingerprint,
        flowEvidenceFingerprint: fixture.evidence.fingerprint,
        contracts: { sharedPersistentTreap: true, productionBinding: false },
      },
    })
    if (built.status !== "accepted") throw new Error("index blocked")
    expect(Object.isFrozen(built.index)).toBe(true)
    expect(inspectVNextTextBlockSpatialIndexV2(built.index)).toEqual({
      status: "valid", fingerprint: built.index.fingerprint,
    })
    expect(createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: structuredClone(fixture.initialFlow),
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: [],
    })).toMatchObject({ status: "blocked", index: null, issues: [{ code: "layout-authority-mismatch" }] })
    expect(createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: structuredClone(fixture.evidence), persistentFlowTree: fixture.tree, entries: [],
    })).toMatchObject({ status: "blocked", index: null, issues: [{ code: "layout-authority-mismatch" }] })
    expect(createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: structuredClone(fixture.tree), entries: [],
    })).toMatchObject({ status: "blocked", index: null, issues: [{ code: "layout-authority-mismatch" }] })
  })

  it("path-copies a move and reports the exact old/new affected-band union", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const built = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      entries: [entry("left", 0, 0), entry("move", 40_000_000, 10_000_000)],
    })
    if (built.status !== "accepted") throw new Error("index blocked")
    const updated = createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence,
      persistentFlowTree: fixture.tree, previousIndex: built.index,
      expectedPreviousIndexFingerprint: built.index.fingerprint, objectId: "move", geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 60_000_000, yLayoutUnit: 30_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })
    expect(updated).toMatchObject({ status: "accepted", update: {
      affectedBands: [{ topLayoutUnit: 10_000_000, bottomLayoutUnit: 20_000_000 }, { topLayoutUnit: 30_000_000, bottomLayoutUnit: 40_000_000 }],
      work: { completeIndexRebuildCount: 0 },
    } })
    if (updated.status !== "accepted") throw new Error("update blocked")
    expect(updated.nextIndex).not.toBe(built.index)
    expect(updated.update).toMatchObject({ geometryOwnerFingerprint: owner, mayPublishLayout: false, productionBinding: false })
    expect(inspectVNextTextBlockSpatialIndexUpdateV2({ update: updated.update, previousIndex: built.index, nextIndex: updated.nextIndex })).toEqual({ status: "valid", fingerprint: updated.update.fingerprint })
    expect(inspectVNextTextBlockSpatialIndexUpdateV2({ update: updated.update, previousIndex: updated.nextIndex, nextIndex: built.index })).toMatchObject({ status: "invalid", code: "spatial-update-binding-mismatch" })
    expect(createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      previousIndex: built.index, expectedPreviousIndexFingerprint: "sha256:stale", objectId: "move", geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 60_000_000, yLayoutUnit: 30_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })).toMatchObject({ status: "blocked", nextIndex: null, issues: [{ code: "spatial-index-stale" }] })
  })

  it("fails closed for non-array entries and rejects the wrong geometry owner", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    expect(() => createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: null as never,
    })).not.toThrow()
    expect(createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: null as never,
    })).toMatchObject({ status: "blocked", index: null, issues: [{ code: "invalid-input" }] })
    const built = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [entry("move", 0, 0)] })
    if (built.status !== "accepted") throw new Error("index blocked")
    expect(createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint,
      objectId: "move", geometryOwnerFingerprint: `sha256:${"c".repeat(64)}`,
      nextGeometry: { xLayoutUnit: 20_000_000, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })).toMatchObject({ status: "blocked", update: null, nextIndex: null, issues: [{ code: "spatial-owner-mismatch" }] })
  })

  it.each([
    ["symbol", Symbol("object-id")],
    ["throwing coercion", { toString: () => { throw new Error("coercion") }, valueOf: () => { throw new Error("coercion") } }],
  ])("blocks a %s object id without coercion or partial update", (_name, objectId) => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const built = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [entry("move", 0, 0)] })
    if (built.status !== "accepted") throw new Error("index blocked")
    expect(() => createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint,
      objectId: objectId as never, geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 20_000_000, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })).not.toThrow()
    expect(createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint,
      objectId: objectId as never, geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 20_000_000, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })).toMatchObject({ status: "blocked", update: null, nextIndex: null, issues: [{ code: "invalid-input" }] })
  })

  it("rejects a cloned index and changes provider intervals after move and resize", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const built = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [entry("object", 40_000_000, 0)] })
    if (built.status !== "accepted") throw new Error("index blocked")
    const region = (spatialIndex: typeof built.index) => provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    expect(region(structuredClone(built.index) as typeof built.index)).toMatchObject({ status: "blocked", intervals: null, issues: [{ code: "spatial-index-provenance-mismatch" }] })
    const baseline = region(built.index)
    if (baseline.status !== "accepted") throw new Error("baseline provider blocked")
    const moved = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint, objectId: "object", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 60_000_000, yLayoutUnit: 20_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 } })
    if (moved.status !== "accepted") throw new Error("move blocked")
    const movedRegion = region(moved.nextIndex)
    if (movedRegion.status !== "accepted") throw new Error("moved provider blocked")
    expect(movedRegion.intervals).toEqual([{ startLayoutUnit: 0, endLayoutUnit: 90_000_000 }])
    expect(movedRegion.intervals).not.toEqual(baseline.intervals)
    const resized = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint, objectId: "object", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 40_000_000, yLayoutUnit: 0, widthLayoutUnit: 30_000_000, heightLayoutUnit: 10_000_000 } })
    if (resized.status !== "accepted") throw new Error("resize blocked")
    const resizedRegion = region(resized.nextIndex)
    if (resizedRegion.status !== "accepted") throw new Error("resized provider blocked")
    expect(resizedRegion.intervals).toEqual([{ startLayoutUnit: 0, endLayoutUnit: 40_000_000 }, { startLayoutUnit: 70_000_000, endLayoutUnit: 90_000_000 }])
    expect(resizedRegion.intervals).not.toEqual(baseline.intervals)
    expect(createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint, objectId: "object", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: Number.MAX_SAFE_INTEGER, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 } })).toMatchObject({ status: "blocked", update: null, nextIndex: null, issues: [{ code: "unsafe-spatial-arithmetic" }] })
  })

  it("does not export privileged V2 construction or binding helpers", () => {
    for (const name of ["createSpatialIndexFromRootV2", "materializeVNextTextBlockSpatialIndexNodeV2", "getSpatialIndexEntriesV2", "queryVNextTextBlockSpatialIndexV2", "fingerprintV2", "deepFreezeSpatialV2"]) expect(core).not.toHaveProperty(name)
  })

  it("blocks class, accessor, and throwing-proxy envelopes without invoking accessors", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    class Envelope {
      inputAuthority = "core-synthetic-qa-only" as const
      initialFlow = fixture.initialFlow
      evidence = fixture.evidence
      persistentFlowTree = fixture.tree
      entries = []
    }
    let reads = 0
    const accessor = {
      inputAuthority: "core-synthetic-qa-only" as const,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [],
    }
    Object.defineProperty(accessor, "initialFlow", { enumerable: true, get: () => { reads += 1; return fixture.initialFlow } })
    const throwingProxy = new Proxy({}, { ownKeys: () => { throw new Error("trap") } })
    for (const value of [new Envelope(), accessor, throwingProxy]) expect(createVNextTextBlockSpatialIndexV2(value)).toMatchObject({ status: "blocked", index: null, issues: [{ code: "invalid-input" }] })
    expect(reads).toBe(0)
  })

  it.each([
    ["duplicate object id", [entry("duplicate", 0, 0), entry("duplicate", 20_000_000, 0)], "duplicate-object-id"],
    ["unsupported policy", [{ ...entry("policy", 0, 0), wrapPolicy: "diagonal" }], "unsupported-wrap-policy"],
    ["boundary overflow", [entry("outside", 80_000_000, 0)], "spatial-boundary-violation"],
  ])("blocks %s without allocating a partial index", (_name, entries, code) => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    expect(createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: entries as never,
    })).toMatchObject({ status: "blocked", index: null, issues: [{ code }] })
  })
})
