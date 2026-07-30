import { describe, expect, it } from "vitest"
import { provideVNextTextBlockFlowRegionsV2 } from "../src/index.js"
import { createVNextTextBlockUnifiedLayoutRootV1 } from
  "../src/layout/textBlockUnifiedLayoutRootV1.js"
import type { VNextTextBlockSyntheticPositionedObjectInputV1 } from
  "../src/layout/textBlockSpatialIndexContractV1.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
  type RepeatedUnifiedLayoutRootSourceFixtureOptionsV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"

const geometryOwnerFingerprint = `sha256:${"8".repeat(64)}`

function spatialPruningEntries(): VNextTextBlockSyntheticPositionedObjectInputV1[] {
  return Array.from({ length: 128 }, (_value, index) => ({
    objectId: `future-exclusion-${index}`,
    geometryOwnerFingerprint,
    xLayoutUnit: 0,
    yLayoutUnit: 5_000_000_000 + (index * 20_000_000),
    widthLayoutUnit: 10_000_000,
    heightLayoutUnit: 10_000_000,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: "rectangular-exclusion" as const,
  }))
}

function buildRoot(options: RepeatedUnifiedLayoutRootSourceFixtureOptionsV1) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1(options)
  const result = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  })
  if (result.status !== "accepted") throw new Error(`repeated unified root blocked: ${JSON.stringify(result.issues)}`)
  return { source, root: result.root }
}

function expectCompositionalWork(root: ReturnType<typeof buildRoot>["root"]): void {
  expect(root.work).toEqual({
    topLevelDependencyCount: 8,
    completeChildGraphTraversalCount: 0,
    completeChildRehashCount: 0,
    rootWrapperAllocationCount: 1,
  })
  expect(root.scene.work).toEqual({
    visitedLineCount: root.scene.summary.lineCount,
    visitedFragmentCount: root.scene.summary.textFragmentCount
      + root.scene.summary.inlineImageFragmentCount,
    emittedChunkCount: root.scene.summary.lineCount,
    estimatedPayloadByteCount: expect.any(Number),
    completeSceneProjectionCount: 1,
  })
  expect(root.scene.work.estimatedPayloadByteCount).toBeGreaterThan(0)
}

describe("unified TextBlock layout root scale evidence v1", () => {
  it("retains deterministic semantic, scene, and root fingerprints across small and long sources", () => {
    const fixtures = [
      { name: "short text", lineCount: 1, includeImages: false },
      { name: "short mixed", lineCount: 1, includeImages: true },
      { name: "long text", lineCount: 32, includeImages: false },
      { name: "long mixed", lineCount: 32, includeImages: true },
    ] as const
    const built = fixtures.map((fixture) => {
      const first = buildRoot(fixture)
      const second = buildRoot(fixture)
      expect(first.source.initialFlow).not.toBe(second.source.initialFlow)
      expect(first.source.evidence).not.toBe(second.source.evidence)
      expect(first.source.initialFlow.fingerprint).toBe(second.source.initialFlow.fingerprint)
      expect(first.source.evidence.fingerprint).toBe(second.source.evidence.fingerprint)
      expect(first.root.scene.fingerprint, fixture.name).toBe(second.root.scene.fingerprint)
      expect(first.root.fingerprint, fixture.name).toBe(second.root.fingerprint)
      expectCompositionalWork(first.root)
      expectCompositionalWork(second.root)
      return first.root
    })
    const [shortText, shortMixed, longText, longMixed] = built
    if (shortText == null || shortMixed == null || longText == null || longMixed == null) {
      throw new Error("scale roots missing")
    }
    expect(longText.scene.summary.lineCount).toBeGreaterThan(shortText.scene.summary.lineCount)
    expect(longMixed.scene.summary.lineCount).toBeGreaterThan(shortMixed.scene.summary.lineCount)
    expect(longText.scene.work.visitedLineCount).toBeGreaterThan(shortText.scene.work.visitedLineCount)
    expect(longMixed.scene.work.visitedFragmentCount).toBeGreaterThan(shortMixed.scene.work.visitedFragmentCount)
    expect(longText.scene.work.estimatedPayloadByteCount)
      .toBeGreaterThan(shortText.scene.work.estimatedPayloadByteCount)
    expect(longMixed.scene.work.estimatedPayloadByteCount)
      .toBeGreaterThan(shortMixed.scene.work.estimatedPayloadByteCount)
    expect(longMixed.scene.summary.inlineImageFragmentCount)
      .toBeGreaterThan(longText.scene.summary.inlineImageFragmentCount)
  }, 20_000)

  it("keeps wrapper work constant while a real spatial query prunes a large retained treap", () => {
    const entries = spatialPruningEntries()
    const start = performance.now()
    const first = buildRoot({ lineCount: 32, includeImages: true, spatialEntries: entries })
    const durationMs = performance.now() - start
    const second = buildRoot({
      lineCount: 32,
      includeImages: true,
      spatialEntries: spatialPruningEntries(),
    })
    expect(Number.isFinite(durationMs)).toBe(true)
    expect(first.source.initialFlow).not.toBe(second.source.initialFlow)
    expect(first.source.evidence).not.toBe(second.source.evidence)
    expect(first.source.initialFlow.fingerprint).toBe(second.source.initialFlow.fingerprint)
    expect(first.source.evidence.fingerprint).toBe(second.source.evidence.fingerprint)
    expect(first.root.scene.fingerprint).toBe(second.root.scene.fingerprint)
    expect(first.root.fingerprint).toBe(second.root.fingerprint)
    expectCompositionalWork(first.root)
    expectCompositionalWork(second.root)
    const { root } = first
    expect(root.spatialIndex.summary.entryCount).toBe(entries.length)
    const region = provideVNextTextBlockFlowRegionsV2({
      initialFlow: root.initialFlow,
      evidence: root.evidence,
      persistentFlowTree: root.persistentFlowTree,
      spatialIndex: root.spatialIndex,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 14_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    if (region.status !== "accepted") throw new Error(`pruning query blocked: ${JSON.stringify(region.issues)}`)
    expect(region.work).toMatchObject({
      fastPath: "none",
      spatialIndexQueryCount: 1,
      matchedSpatialEntryCount: 0,
    })
    expect(region.work.visitedSpatialNodeCount).toBeGreaterThan(0)
    expect(region.work.visitedSpatialNodeCount).toBeLessThan(entries.length)
    expect("durationMs" in root.work).toBe(false)
    expect("durationMs" in root.scene.work).toBe(false)
    expect(JSON.stringify(root)).not.toContain("durationMs")
  }, 20_000)
})
