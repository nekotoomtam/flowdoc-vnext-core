import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockSpatialIndexV2,
} from "../src/index.js"
import {
  queryVNextTextBlockSpatialIndexV2,
} from "../src/layout/textBlockSpatialIndexV2.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
  queryVNextTextBlockUnifiedSpatialStateInternalV1,
  verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import type {
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../src/layout/textBlockSpatialIndexContractV1.js"
import {
  acceptedInlineImageEvidenceFixture,
  acceptedInlineImageFlowTreeFixture,
} from "./helpers/textBlockInlineImageFlowV2.js"

const ownerA = `sha256:${"a".repeat(64)}`
const ownerB = `sha256:${"b".repeat(64)}`

function entry(
  objectId: string,
  xLayoutUnit: number,
  yLayoutUnit: number,
  geometryOwnerFingerprint = ownerA,
): VNextTextBlockSyntheticPositionedObjectInputV1 {
  return {
    objectId,
    geometryOwnerFingerprint,
    xLayoutUnit,
    yLayoutUnit,
    widthLayoutUnit: 10_000_000,
    heightLayoutUnit: 500_000,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: "rectangular-exclusion",
  }
}

function sourceState(options: Parameters<typeof acceptedInlineImageEvidenceFixture>[0] = {}) {
  const fixture = acceptedInlineImageEvidenceFixture(options)
  const built = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
    fixture,
  )
  if (built.status !== "prepared") {
    throw new Error(`source state blocked: ${JSON.stringify(built.issues)}`)
  }
  return { ...fixture, sourceState: built.sourceState }
}

function spatialState(
  source: VNextTextBlockUnifiedLayoutSourceStateV1,
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[],
) {
  const built = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
    sourceState: source,
    entries,
  })
  if (built.status !== "prepared") {
    throw new Error(`spatial state blocked: ${JSON.stringify(built.issues)}`)
  }
  return built.spatialState
}

describe("Phase 5B Root V2 spatial state", () => {
  it("keeps an exact empty candidate and zero-query fast path", () => {
    const source = sourceState({ content: "image-only" })
    const empty = spatialState(source.sourceState, [])
    const queried = queryVNextTextBlockUnifiedSpatialStateInternalV1({
      spatialState: empty,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 1_000_000 },
    })

    expect(empty).toMatchObject({
      source: "vnext-text-block-unified-spatial-state-v1",
      contractVersion: 1,
      root: null,
      summary: {
        entryCount: 0,
        nodeCount: 0,
      },
      contracts: {
        preparedGraphCandidate: true,
        registeredAuthority: false,
        productionBinding: false,
      },
    })
    expect(queried).toEqual({
      status: "accepted",
      entries: [],
      work: {
        visitedNodeCount: 0,
        matchedEntryCount: 0,
        completeIndexScanCount: 0,
      },
      issues: [],
    })
    expect(verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      empty,
    )).toMatchObject({
      status: "valid-candidate",
      fingerprint: empty.fingerprint,
      registeredAuthority: false,
    })
    expect(verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      structuredClone(empty),
    )).toMatchObject({
      status: "invalid",
      code: "spatial-state-authority-mismatch",
    })
  })

  it("reuses the same complete fingerprint across paint-only source changes", () => {
    const contain = sourceState({
      content: "image-only",
      fit: "contain",
    })
    const cover = sourceState({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const entries = [entry("shape-1", 20_000_000, 0)]
    const previous = spatialState(contain.sourceState, entries)
    const paintOnly = spatialState(cover.sourceState, entries)

    expect(contain.sourceState.fingerprint)
      .not.toBe(cover.sourceState.fingerprint)
    expect(paintOnly.fingerprint).toBe(previous.fingerprint)
    expect(paintOnly.entrySetFingerprint).toBe(previous.entrySetFingerprint)
    expect(paintOnly.entryRootFingerprint).toBe(previous.entryRootFingerprint)
    expect(paintOnly).not.toBe(previous)
  })

  it("prunes a narrow query over 128 entries without a complete scan", () => {
    const source = sourceState({ content: "text-image-text" })
    const entries = Array.from({ length: 128 }, (_value, index) => (
      entry(`shape-${String(index).padStart(3, "0")}`, 20_000_000, index * 1_000_000)
    ))
    const spatial = spatialState(source.sourceState, entries)
    const queried = queryVNextTextBlockUnifiedSpatialStateInternalV1({
      spatialState: spatial,
      band: {
        topLayoutUnit: 63_000_000,
        bottomLayoutUnit: 63_500_000,
      },
    })

    expect(spatial.summary).toMatchObject({
      entryCount: 128,
      nodeCount: 128,
    })
    expect(queried.status).toBe("accepted")
    if (queried.status !== "accepted") throw new Error("spatial query blocked")
    expect(queried.entries.map((item) => item.objectId)).toEqual(["shape-063"])
    expect(queried.work).toMatchObject({
      matchedEntryCount: 1,
      completeIndexScanCount: 0,
    })
    expect(queried.work.visitedNodeCount).toBeLessThan(128)
  })

  it("binds content context and geometry-owner facts without Initial Flow or evidence wrappers", () => {
    const source = sourceState()
    const ownerOne = spatialState(source.sourceState, [
      entry("shape", 20_000_000, 0, ownerA),
    ])
    const ownerTwo = spatialState(source.sourceState, [
      entry("shape", 20_000_000, 0, ownerB),
    ])

    expect(ownerOne.geometryOwnerFactsFingerprint)
      .not.toBe(ownerTwo.geometryOwnerFactsFingerprint)
    expect(ownerOne.fingerprint).not.toBe(ownerTwo.fingerprint)
    expect(ownerOne).not.toHaveProperty("initialFlow")
    expect(ownerOne).not.toHaveProperty("evidence")
    expect(ownerOne).not.toHaveProperty("persistentFlowTree")

    expect(createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
      sourceState: structuredClone(source.sourceState),
      entries: [],
    })).toMatchObject({
      status: "blocked",
      spatialState: null,
      issues: [{ code: "source-state-authority-mismatch" }],
    })
    expect(createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
      sourceState: source.sourceState,
      entries: [entry("outside", 85_000_000, 0)],
    })).toMatchObject({
      status: "blocked",
      spatialState: null,
      issues: [{ code: "spatial-boundary-violation" }],
    })
  })

  it("retains entry, treap, summary, and query parity with Spatial Index V2", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({
      content: "text-image-text",
    })
    const entries = [
      entry("left", 0, 0),
      entry("middle", 40_000_000, 0),
      {
        ...entry("overlay", 70_000_000, 2_000_000),
        wrapPolicy: "overlay" as const,
      },
    ]
    const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
    })
    if (source.status !== "prepared") throw new Error("source state blocked")
    const next = spatialState(source.sourceState, entries)
    const previous = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries,
    })
    if (previous.status !== "accepted") throw new Error("Spatial V2 blocked")
    const band = { topLayoutUnit: 0, bottomLayoutUnit: 3_000_000 }
    const previousQuery = queryVNextTextBlockSpatialIndexV2(
      previous.index,
      band,
    )
    const nextQuery = queryVNextTextBlockUnifiedSpatialStateInternalV1({
      spatialState: next,
      band,
    })
    if (nextQuery.status !== "accepted") throw new Error("next query blocked")

    expect(next.source).not.toBe(previous.index.source)
    expect(next.contractVersion).not.toBe(previous.index.contractVersion)
    expect(next.root?.fingerprint ?? null)
      .toBe(previous.index.root?.fingerprint ?? null)
    expect(next.summary).toEqual(previous.index.summary)
    expect(nextQuery.entries).toEqual(previousQuery.entries)
    expect(nextQuery.work.visitedNodeCount).toBe(previousQuery.visitedNodeCount)
  })

  it("blocks accessor, proxy, duplicate, and owner-shaped malformed input before a candidate", () => {
    const source = sourceState()
    let reads = 0
    const accessor = {
      entries: [],
    }
    Object.defineProperty(accessor, "sourceState", {
      enumerable: true,
      get() {
        reads += 1
        return source.sourceState
      },
    })
    const proxy = new Proxy({}, {
      ownKeys() {
        throw new Error("hostile")
      },
    })
    const callUnknown = (
      createVNextTextBlockUnifiedSpatialStateCompleteInternalV1
    ) as (input: unknown) => unknown

    for (const result of [
      callUnknown(accessor),
      callUnknown(proxy),
      createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
        sourceState: source.sourceState,
        entries: [
          entry("duplicate", 0, 0),
          entry("duplicate", 20_000_000, 0),
        ],
      }),
      createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
        sourceState: source.sourceState,
        entries: [{
          ...entry("bad-owner", 0, 0),
          geometryOwnerFingerprint: "not-a-fingerprint",
        }],
      }),
    ]) {
      expect(result).toMatchObject({ status: "blocked", spatialState: null })
    }
    expect(reads).toBe(0)
  })
})
