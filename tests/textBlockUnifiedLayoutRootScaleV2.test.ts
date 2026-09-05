import { createUnifiedLayoutGeometryFixtureV2 } from "./helpers/textBlockUnifiedLayoutGeometryV2.js"
import { describe, expect, it } from "vitest"
import { inspectVNextTextBlockUnifiedLayoutRootV2, provideVNextTextBlockFlowRegionsV2 } from "../src/index.js"
import { createVNextTextBlockUnifiedLayoutRootV2 } from
  "../src/layout/textBlockUnifiedLayoutRootV2.js"
import type { VNextTextBlockSyntheticPositionedObjectInputV1 } from
  "../src/layout/textBlockSpatialIndexContractV1.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
  type RepeatedUnifiedLayoutRootSourceFixtureOptionsV1,
} from "./helpers/textBlockUnifiedLayoutSource.js"

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
  const result = createVNextTextBlockUnifiedLayoutRootV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  })
  if (result.status !== "accepted") throw new Error(`repeated unified root blocked: ${JSON.stringify(result.issues)}`)
  return { source, root: result.root, work: result.completeBuildWork }
}

function expectCompositionalWork(built: ReturnType<typeof buildRoot>): void {
  expect(inspectVNextTextBlockUnifiedLayoutRootV2(built.root)).toMatchObject({
    status: "valid", work: {topLevelDependencyCount:8,completeChildGraphTraversalCount:0,completeChildRehashCount:0,rootWrapperInspectionCount:1},
  })
  expect(built.work).toMatchObject({completeRootV2BuildCount:1,completeSceneProjectionCount:1,completeChildRehashCount:0})
  expect(built.work.completeLineVisitCount).toBe(built.root.lineTree.summary.lineCount)
  expect(built.work.completeFragmentVisitCount).toBe(built.root.lineTree.summary.fragmentCount)
  expect(built.root.persistentScene.payloadObservation.estimatedCanonicalPayloadByteCount).toBeGreaterThan(0)
}

describe("unified TextBlock layout root scale evidence V2", () => {
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
      expect(first.root.persistentScene.fingerprint, fixture.name).toBe(second.root.persistentScene.fingerprint)
      expect(first.root.fingerprint, fixture.name).toBe(second.root.fingerprint)
      expectCompositionalWork(first)
      expectCompositionalWork(second)
      return first.root
    })
    const [shortText, shortMixed, longText, longMixed] = built
    if (shortText == null || shortMixed == null || longText == null || longMixed == null) {
      throw new Error("scale roots missing")
    }
    expect(longText.persistentScene.summary.lineCount).toBeGreaterThan(shortText.persistentScene.summary.lineCount)
    expect(longMixed.persistentScene.summary.lineCount).toBeGreaterThan(shortMixed.persistentScene.summary.lineCount)
    expect(longText.persistentScene.payloadObservation.estimatedCanonicalPayloadByteCount)
      .toBeGreaterThan(shortText.persistentScene.payloadObservation.estimatedCanonicalPayloadByteCount)
    expect(longMixed.persistentScene.payloadObservation.estimatedCanonicalPayloadByteCount)
      .toBeGreaterThan(shortMixed.persistentScene.payloadObservation.estimatedCanonicalPayloadByteCount)
    expect(longMixed.persistentScene.summary.inlineImageFragmentCount)
      .toBeGreaterThan(longText.persistentScene.summary.inlineImageFragmentCount)
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
    expect(first.root.persistentScene.fingerprint).toBe(second.root.persistentScene.fingerprint)
    expect(first.root.fingerprint).toBe(second.root.fingerprint)
    expectCompositionalWork(first)
    expectCompositionalWork(second)
    const { geometryInput: root } = createUnifiedLayoutGeometryFixtureV2({
      inputAuthority:"core-synthetic-qa-only", initialFlow:first.source.initialFlow,
      evidence:first.source.evidence, spatialEntries:entries,
    })
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
    expect("durationMs" in first.work).toBe(false)
    expect("durationMs" in first.root.persistentScene.work).toBe(false)
    expect(JSON.stringify(root)).not.toContain("durationMs")
  }, 20_000)
})
