import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextTextBlockPersistentFlowTreeV2,
  createVNextTextBlockSpatialIndexUpdateV2,
  createVNextTextBlockSpatialIndexV2,
  inspectVNextTextBlockSpatialIndexUpdateV2,
  layoutVNextTextBlockAuthoredBoxGeometryV2,
  layoutVNextTextBlockSpatialWrappingV2,
  provideVNextTextBlockFlowRegionsV2,
} from "../src/index.js"
import {
  acceptedInlineImageSpatialFixture,
  acceptedInlineImageFlowTreeFixture,
} from "./helpers/textBlockInlineImageFlowV2.js"

const owner = `sha256:${"c".repeat(64)}`

function exclusion(input: {
  objectId: string
  xLayoutUnit: number
  yLayoutUnit?: number
  widthLayoutUnit?: number
  heightLayoutUnit?: number
  wrapPolicy?: "rectangular-exclusion" | "top-bottom-barrier" | "overlay"
}) {
  return {
    objectId: input.objectId,
    geometryOwnerFingerprint: owner,
    xLayoutUnit: input.xLayoutUnit,
    yLayoutUnit: input.yLayoutUnit ?? 0,
    widthLayoutUnit: input.widthLayoutUnit ?? 20_000_000,
    heightLayoutUnit: input.heightLayoutUnit ?? 10_000_000,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: input.wrapPolicy ?? "rectangular-exclusion",
  } as const
}

function sourceRangesAreMonotonic(result: Extract<ReturnType<typeof layoutVNextTextBlockSpatialWrappingV2>, { status: "accepted" }>) {
  const ranges = result.lines.flatMap((line) => line.sourceSegments)
  return ranges.every((range, index) => (
    index === 0
    || ranges[index - 1]!.renderEndOffset <= range.renderStartOffset
  ))
}

function intervalsAreSortedAndDisjoint(result: Extract<ReturnType<typeof layoutVNextTextBlockSpatialWrappingV2>, { status: "accepted" }>) {
  return result.lines.every((line) => line.availableIntervals.every((interval, index) => (
    index === 0
    || line.availableIntervals[index - 1]!.endLayoutUnit <= interval.startLayoutUnit
  )))
}

function everyImageFitsItsInterval(result: Extract<ReturnType<typeof layoutVNextTextBlockSpatialWrappingV2>, { status: "accepted" }>) {
  return result.lines.every((line) => line.fragments
    .filter((fragment) => fragment.kind === "inline-image")
    .every((image) => line.availableIntervals.some((interval) => (
      interval.startLayoutUnit <= image.xLayoutUnit
      && image.xLayoutUnit + image.widthLayoutUnit <= interval.endLayoutUnit
    ))))
}

function everyImageFitsItsLineBox(result: Extract<ReturnType<typeof layoutVNextTextBlockSpatialWrappingV2>, { status: "accepted" }>) {
  return result.lines.every((line) => line.fragments
    .filter((fragment) => fragment.kind === "inline-image")
    .every((image) => (
      line.yOffsetLayoutUnit <= image.yLayoutUnit
      && image.yLayoutUnit + image.heightLayoutUnit
        <= line.yOffsetLayoutUnit + line.heightLayoutUnit
    )))
}

function allValuesHaveClosedCapabilities(values: readonly unknown[]) {
  return values.every((value) => (
    value != null
    && typeof value === "object"
    && (value as { mayPublishLayout?: unknown }).mayPublishLayout === false
    && (value as { productionBinding?: unknown }).productionBinding === false
  ))
}

function evidenceInputFrom(evidence: Record<string, unknown>) {
  const {
    source: _source,
    contractVersion: _contractVersion,
    contracts: _contracts,
    mayPublishLayout: _mayPublishLayout,
    productionBinding: _productionBinding,
    fingerprint: _fingerprint,
    ...input
  } = evidence
  return input
}

function ownKeysContainNo(value: unknown, forbidden: readonly string[]): boolean {
  if (value == null || typeof value !== "object") return true
  const descriptors = Object.getOwnPropertyDescriptors(value)
  return Reflect.ownKeys(descriptors).every((key) => (
    typeof key === "string"
    && !forbidden.includes(key)
    && (!Object.hasOwn(descriptors[key]!, "value") || ownKeysContainNo(descriptors[key]!.value, forbidden))
  ))
}

describe("TextBlock inline-image geometry 4B hardening", () => {
  it("rejects a present undefined production-binding flag at every accepting V2 envelope", () => {
    const fixture = acceptedInlineImageSpatialFixture({ content: "image-only" })
    const evidenceInput = {
      initialFlow: fixture.initialFlow,
      evidenceInput: fixture.evidence.evidenceInput,
      bindProductionLayout: undefined,
    }
    const treeInput = {
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      bindProductionLayout: undefined,
    }
    const layoutInput = {
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
      bindProductionLayout: undefined,
    }
    const boxInput = {
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
      bindProductionLayout: undefined,
    }

    const evidence = acceptVNextTextBlockFlowEvidenceV2(evidenceInput)
    const tree = createVNextTextBlockPersistentFlowTreeV2(treeInput)
    const layout = layoutVNextTextBlockSpatialWrappingV2(layoutInput)
    const box = layoutVNextTextBlockAuthoredBoxGeometryV2(boxInput)

    expect(evidence).toMatchObject({ status: "blocked", evidence: null })
    expect(tree).toMatchObject({ status: "blocked", tree: null })
    expect(layout).toMatchObject({ status: "blocked", lines: null, summary: null })
    expect(box).toMatchObject({ status: "blocked", geometry: null, lines: null, summary: null })
  })

  it("blocks representative cloned and frozen authorities without partial output", () => {
    const fixture = acceptedInlineImageSpatialFixture({ content: "image-only" })
    const update = createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      objectId: "missing",
      geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 0, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })
    expect(update).toMatchObject({ status: "blocked", update: null, nextIndex: null })

    const tree = createVNextTextBlockPersistentFlowTreeV2({
      initialFlow: structuredClone(fixture.initialFlow), evidence: fixture.evidence,
    })
    const index = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: structuredClone(fixture.evidence),
      persistentFlowTree: fixture.tree,
      entries: [],
    })
    const region = provideVNextTextBlockFlowRegionsV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: structuredClone(fixture.spatialIndex),
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    const layout = layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: fixture.initialFlow,
      evidence: Object.freeze({ ...fixture.evidence }),
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    const box = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: structuredClone(fixture.tree),
      spatialIndex: fixture.spatialIndex,
    })

    expect(tree).toMatchObject({ status: "blocked", tree: null })
    expect(index).toMatchObject({ status: "blocked", index: null })
    expect(region).toMatchObject({ status: "blocked", intervals: null, work: null })
    expect(layout).toMatchObject({ status: "blocked", lines: null, summary: null, work: null })
    expect(box).toMatchObject({ status: "blocked", geometry: null, lines: null, summary: null })
  })

  it("covers every V2 boundary with cloned, frozen, changed, and production-bound authority", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({ content: "image-only" })
    const built = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow,
      evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      entries: [exclusion({ objectId: "move", xLayoutUnit: 20_000_000 })],
    })
    if (built.status !== "accepted") throw new Error("authority index blocked")
    const update = createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree,
      previousIndex: built.index, expectedPreviousIndexFingerprint: built.index.fingerprint,
      objectId: "move", geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 20_000_000, yLayoutUnit: 20_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })
    if (update.status !== "accepted") throw new Error("authority update blocked")
    const changedEvidence = acceptVNextTextBlockFlowEvidenceV2({
      initialFlow: fixture.initialFlow,
      evidenceInput: { ...evidenceInputFrom(fixture.evidence as unknown as Record<string, unknown>), layoutId: "changed-layout-id" } as never,
    })
    if (changedEvidence.status !== "accepted") throw new Error("changed layout evidence blocked")
    const changedTree = createVNextTextBlockPersistentFlowTreeV2({ initialFlow: fixture.initialFlow, evidence: changedEvidence.evidence })
    if (changedTree.status !== "accepted") throw new Error("changed layout tree blocked")

    const evidenceClone = acceptVNextTextBlockFlowEvidenceV2({
      initialFlow: structuredClone(fixture.initialFlow),
      evidenceInput: evidenceInputFrom(fixture.evidence as unknown as Record<string, unknown>) as never,
    })
    const treeClone = createVNextTextBlockPersistentFlowTreeV2({ initialFlow: fixture.initialFlow, evidence: structuredClone(fixture.evidence) })
    const indexClone = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: structuredClone(fixture.tree), entries: [] })
    const updateClone = inspectVNextTextBlockSpatialIndexUpdateV2({ update: structuredClone(update.update), previousIndex: built.index, nextIndex: update.nextIndex })
    const providerClone = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: structuredClone(built.index), band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    const frozenEvidence = layoutVNextTextBlockSpatialWrappingV2({ initialFlow: fixture.initialFlow, evidence: Object.freeze({ ...fixture.evidence }), persistentFlowTree: fixture.tree, spatialIndex: built.index, startYLayoutUnit: 0 })
    const changedLayout = layoutVNextTextBlockSpatialWrappingV2({ initialFlow: fixture.initialFlow, evidence: changedEvidence.evidence, persistentFlowTree: changedTree.tree, spatialIndex: built.index, startYLayoutUnit: 0 })
    const boxClone = layoutVNextTextBlockAuthoredBoxGeometryV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: structuredClone(built.index) })
    const production = [
      acceptVNextTextBlockFlowEvidenceV2({ initialFlow: fixture.initialFlow, evidenceInput: evidenceInputFrom(fixture.evidence as unknown as Record<string, unknown>) as never, bindProductionLayout: true }),
      createVNextTextBlockPersistentFlowTreeV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, bindProductionLayout: true }),
      layoutVNextTextBlockSpatialWrappingV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: built.index, startYLayoutUnit: 0, bindProductionLayout: true }),
      layoutVNextTextBlockAuthoredBoxGeometryV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: built.index, bindProductionLayout: true }),
    ]

    expect(evidenceClone).toMatchObject({ status: "blocked", evidence: null })
    expect(treeClone).toMatchObject({ status: "blocked", tree: null })
    expect(indexClone).toMatchObject({ status: "blocked", index: null })
    expect(updateClone).toMatchObject({ status: "invalid" })
    expect(providerClone).toMatchObject({ status: "blocked", intervals: null, work: null })
    expect(frozenEvidence).toMatchObject({ status: "blocked", lines: null, summary: null, work: null })
    expect(changedLayout).toMatchObject({ status: "blocked", lines: null, summary: null, work: null })
    expect(boxClone).toMatchObject({ status: "blocked", geometry: null, lines: null, summary: null })
    for (const result of production) expect(result).toMatchObject({ status: "blocked" })
  })

  it.each([
    ["initial-flow fingerprint", { width: { value: 11, unit: "pt" as const } }],
    ["layout id", { content: "text-image-text" as const }],
    ["frame width", { width: { value: 11, unit: "pt" as const } }],
    ["frame height", { height: { value: 13, unit: "pt" as const } }],
    ["vertical alignment", { verticalAlign: "baseline" as const }],
    ["asset id", { assetId: "asset-other" }],
    ["fit", { fit: "cover" as const }],
    ["crop", { crop: { x: 0, y: 0, width: 0.5, height: 1 } }],
  ])("blocks changed %s from crossing a retained spatial index", (_name, options) => {
    const original = acceptedInlineImageSpatialFixture({ content: "image-only" })
    const changed = acceptedInlineImageFlowTreeFixture({ content: "image-only", ...options })
    const result = layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: changed.initialFlow,
      evidence: changed.evidence,
      persistentFlowTree: changed.tree,
      spatialIndex: original.spatialIndex,
      startYLayoutUnit: 0,
    })
    expect(result).toMatchObject({ status: "blocked", lines: null, summary: null, work: null })
  })

  it("preserves deterministic spatial image properties across a fixed corpus", () => {
    const corpus = [
      { options: { content: "image-only" as const }, entries: [] },
      { options: { content: "text-image-text" as const }, entries: [exclusion({ objectId: "left", xLayoutUnit: 0 })] },
      { options: { content: "thai-image-latin" as const, mixedTextSizes: true }, entries: [exclusion({ objectId: "middle", xLayoutUnit: 30_000_000 })] },
      { options: { content: "image-only" as const, verticalAlign: "middle" as const }, entries: [exclusion({ objectId: "right", xLayoutUnit: 70_000_000 })] },
    ]
    for (const row of corpus) {
      const fixture = acceptedInlineImageFlowTreeFixture(row.options)
      const built = createVNextTextBlockSpatialIndexV2({
        inputAuthority: "core-synthetic-qa-only",
        initialFlow: fixture.initialFlow,
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        entries: row.entries,
      })
      if (built.status !== "accepted") throw new Error("fixed corpus index blocked")
      const input = {
        initialFlow: fixture.initialFlow,
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: built.index,
        startYLayoutUnit: 0,
      }
      const first = layoutVNextTextBlockSpatialWrappingV2(input)
      const repeated = layoutVNextTextBlockSpatialWrappingV2(input)
      if (first.status !== "accepted" || repeated.status !== "accepted") throw new Error("fixed corpus layout blocked")
      expect(repeated).toEqual(first)
      expect(sourceRangesAreMonotonic(first)).toBe(true)
      expect(intervalsAreSortedAndDisjoint(first)).toBe(true)
      expect(everyImageFitsItsInterval(first)).toBe(true)
      expect(everyImageFitsItsLineBox(first)).toBe(true)
    }
  })

  it("keeps exact-fit, one-unit overflow, odd-middle, unsafe-y, and invalid-band boundaries closed", () => {
    const exact = acceptedInlineImageSpatialFixture({ content: "image-only", width: { value: 90, unit: "pt" } })
    const exactLayout = layoutVNextTextBlockSpatialWrappingV2({ initialFlow: exact.initialFlow, evidence: exact.evidence, persistentFlowTree: exact.tree, spatialIndex: exact.spatialIndex, startYLayoutUnit: 0 })
    expect(exactLayout).toMatchObject({ status: "accepted", lines: [{ intervalPlacements: [{ xStartLayoutUnit: 0, xEndLayoutUnit: 90_000_000 }] }] })

    const oneUnitTooWide = acceptedInlineImageSpatialFixture({ content: "image-only", width: { value: 90.000001, unit: "pt" } })
    expect(layoutVNextTextBlockSpatialWrappingV2({ initialFlow: oneUnitTooWide.initialFlow, evidence: oneUnitTooWide.evidence, persistentFlowTree: oneUnitTooWide.tree, spatialIndex: oneUnitTooWide.spatialIndex, startYLayoutUnit: 0 })).toMatchObject({ status: "blocked", lines: null, issues: [{ code: "unbreakable-flow-item-overflow" }] })

    const oddMiddle = acceptedInlineImageSpatialFixture({ content: "image-only", verticalAlign: "middle", height: { value: 13.000001, unit: "pt" } })
    expect(layoutVNextTextBlockSpatialWrappingV2({ initialFlow: oddMiddle.initialFlow, evidence: oddMiddle.evidence, persistentFlowTree: oddMiddle.tree, spatialIndex: oddMiddle.spatialIndex, startYLayoutUnit: 0 })).toMatchObject({ status: "accepted", lines: [{ heightLayoutUnit: 14_000_000, fragments: [{ yLayoutUnit: 499_999, heightLayoutUnit: 13_000_001 }] }] })

    const ordinary = acceptedInlineImageSpatialFixture({ content: "image-only" })
    expect(layoutVNextTextBlockSpatialWrappingV2({ initialFlow: ordinary.initialFlow, evidence: ordinary.evidence, persistentFlowTree: ordinary.tree, spatialIndex: ordinary.spatialIndex, startYLayoutUnit: Number.MAX_SAFE_INTEGER - 10_000_000 })).toMatchObject({ status: "blocked", lines: null, summary: null, work: null, issues: [{ code: "unsafe-layout-arithmetic" }] })
    expect(provideVNextTextBlockFlowRegionsV2({ initialFlow: ordinary.initialFlow, evidence: ordinary.evidence, persistentFlowTree: ordinary.tree, spatialIndex: ordinary.spatialIndex, band: { topLayoutUnit: 10, bottomLayoutUnit: 10 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })).toMatchObject({ status: "blocked", intervals: null, work: null, issues: [{ code: "invalid-line-band" }] })
    expect(provideVNextTextBlockFlowRegionsV2({ initialFlow: ordinary.initialFlow, evidence: ordinary.evidence, persistentFlowTree: ordinary.tree, spatialIndex: ordinary.spatialIndex, band: { topLayoutUnit: 11, bottomLayoutUnit: 10 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })).toMatchObject({ status: "blocked", intervals: null, work: null, issues: [{ code: "invalid-line-band" }] })
  })

  it("retains bounded spatial work and an overlay-only zero-query path", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({ content: "image-only" })
    const populated = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: Array.from({ length: 128 }, (_value, index) => exclusion({
        objectId: `entry-${index}`,
        xLayoutUnit: index % 2 === 0 ? 0 : 70_000_000,
        yLayoutUnit: index * 20_000_000,
      })),
    })
    if (populated.status !== "accepted") throw new Error("populated index blocked")
    const narrowBandRegion = provideVNextTextBlockFlowRegionsV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: populated.index,
      band: { topLayoutUnit: 2_000_000_000, bottomLayoutUnit: 2_010_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    if (narrowBandRegion.status !== "accepted") throw new Error("narrow band blocked")
    expect(narrowBandRegion.work.visitedSpatialNodeCount).toBeLessThan(populated.index.summary.nodeCount)

    const overlay = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: [exclusion({ objectId: "overlay", xLayoutUnit: 20_000_000, wrapPolicy: "overlay" })],
    })
    if (overlay.status !== "accepted") throw new Error("overlay index blocked")
    const overlayOnlyRegion = provideVNextTextBlockFlowRegionsV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: overlay.index,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    if (overlayOnlyRegion.status !== "accepted") throw new Error("overlay region blocked")
    expect(overlayOnlyRegion.work.spatialIndexQueryCount).toBe(0)
  })

  it("reports a middle-exclusion move without changing upstream flow values", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({ content: "image-only" })
    const before = createVNextTextBlockSpatialIndexV2({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      entries: [
        exclusion({ objectId: "left", xLayoutUnit: 0 }),
        exclusion({ objectId: "middle", xLayoutUnit: 30_000_000 }),
      ],
    })
    if (before.status !== "accepted") throw new Error("before index blocked")
    const flowSnapshot = structuredClone(fixture.initialFlow)
    const evidenceSnapshot = structuredClone(fixture.evidence)
    const moved = createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      previousIndex: before.index,
      expectedPreviousIndexFingerprint: before.index.fingerprint,
      objectId: "middle",
      geometryOwnerFingerprint: owner,
      nextGeometry: { xLayoutUnit: 30_000_000, yLayoutUnit: 20_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 },
    })
    if (moved.status !== "accepted") throw new Error("middle move blocked")
    const beforeLine = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: before.index, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    const afterLine = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: moved.nextIndex, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    expect(beforeLine).toMatchObject({ status: "accepted", intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 30_000_000 }, { startLayoutUnit: 50_000_000, endLayoutUnit: 90_000_000 }] })
    expect(afterLine).toMatchObject({ status: "accepted", intervals: [{ startLayoutUnit: 20_000_000, endLayoutUnit: 90_000_000 }] })
    expect(moved.update.affectedBands).toEqual([
      { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 },
      { topLayoutUnit: 20_000_000, bottomLayoutUnit: 30_000_000 },
    ])
    expect(moved.update).not.toHaveProperty("lineReuseCount")
    expect(moved.update).not.toHaveProperty("reconvergenceCount")
    expect(fixture.initialFlow).toEqual(flowSnapshot)
    expect(fixture.evidence).toEqual(evidenceSnapshot)
    expect(inspectVNextTextBlockSpatialIndexUpdateV2({ update: moved.update, previousIndex: before.index, nextIndex: moved.nextIndex })).toEqual({ status: "valid", fingerprint: moved.update.fingerprint })
  })

  it("composes isolated move, horizontal resize, and tall-image envelope requery facts", () => {
    const fixture = acceptedInlineImageFlowTreeFixture({ content: "image-only", height: { value: 30, unit: "pt" } })
    const evidence = fixture.evidence
    const tree = fixture.tree
    const middle = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, entries: [exclusion({ objectId: "middle", xLayoutUnit: 30_000_000 })] })
    if (middle.status !== "accepted") throw new Error("middle index blocked")
    const moved = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, previousIndex: middle.index, expectedPreviousIndexFingerprint: middle.index.fingerprint, objectId: "middle", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 30_000_000, yLayoutUnit: 20_000_000, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 } })
    if (moved.status !== "accepted") throw new Error("middle update blocked")
    const fullWidth = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, spatialIndex: moved.nextIndex, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    expect(fullWidth).toMatchObject({ status: "accepted", intervals: [{ startLayoutUnit: 0, endLayoutUnit: 90_000_000 }] })
    expect(moved.update.affectedBands).toEqual([{ topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, { topLayoutUnit: 20_000_000, bottomLayoutUnit: 30_000_000 }])

    const left = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, entries: [exclusion({ objectId: "left", xLayoutUnit: 0 })] })
    if (left.status !== "accepted") throw new Error("left index blocked")
    const widened = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, previousIndex: left.index, expectedPreviousIndexFingerprint: left.index.fingerprint, objectId: "left", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 0, yLayoutUnit: 0, widthLayoutUnit: 30_000_000, heightLayoutUnit: 10_000_000 } })
    if (widened.status !== "accepted") throw new Error("left resize blocked")
    const shifted = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, spatialIndex: widened.nextIndex, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    expect(shifted).toMatchObject({ status: "accepted", intervals: [{ startLayoutUnit: 30_000_000, endLayoutUnit: 90_000_000 }] })
    expect(widened.update.affectedBands).toEqual([{ topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }])

    const tall = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, entries: [exclusion({ objectId: "envelope", xLayoutUnit: 0, yLayoutUnit: 30_000_000, widthLayoutUnit: 90_000_000, heightLayoutUnit: 5_000_000 })] })
    if (tall.status !== "accepted") throw new Error("tall index blocked")
    const envelope = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, previousIndex: tall.index, expectedPreviousIndexFingerprint: tall.index.fingerprint, objectId: "envelope", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 0, yLayoutUnit: 20_000_000, widthLayoutUnit: 90_000_000, heightLayoutUnit: 5_000_000 } })
    if (envelope.status !== "accepted") throw new Error("envelope update blocked")
    const tallLayout = layoutVNextTextBlockSpatialWrappingV2({ initialFlow: fixture.initialFlow, evidence, persistentFlowTree: tree, spatialIndex: envelope.nextIndex, startYLayoutUnit: 0 })
    expect(tallLayout).toMatchObject({ status: "accepted", lines: [{ yOffsetLayoutUnit: 25_000_000 }], work: { lineBandRequeryCount: 2 } })
    expect(envelope.update.affectedBands).toEqual([{ topLayoutUnit: 20_000_000, bottomLayoutUnit: 25_000_000 }, { topLayoutUnit: 30_000_000, bottomLayoutUnit: 35_000_000 }])
    expect(fixture.evidence).toBe(evidence)
    expect(fixture.tree).toBe(tree)
    for (const item of [moved.update, widened.update, envelope.update]) {
      expect(Object.hasOwn(item, "lineReuseCount")).toBe(false)
      expect(Object.hasOwn(item, "reconvergenceCount")).toBe(false)
    }
  })

  it("exposes only closed non-production capabilities on every accepted composed result", () => {
    const fixture = acceptedInlineImageSpatialFixture({ content: "image-only" })
    const region = provideVNextTextBlockFlowRegionsV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: fixture.spatialIndex, band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 } })
    const layout = layoutVNextTextBlockSpatialWrappingV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: fixture.spatialIndex, startYLayoutUnit: 0 })
    const box = layoutVNextTextBlockAuthoredBoxGeometryV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: fixture.spatialIndex })
    const indexed = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [exclusion({ objectId: "update", xLayoutUnit: 0 })] })
    if (indexed.status !== "accepted") throw new Error("capability update index blocked")
    const update = createVNextTextBlockSpatialIndexUpdateV2({ initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, previousIndex: indexed.index, expectedPreviousIndexFingerprint: indexed.index.fingerprint, objectId: "update", geometryOwnerFingerprint: owner, nextGeometry: { xLayoutUnit: 10_000_000, yLayoutUnit: 0, widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000 } })
    if (region.status !== "accepted" || layout.status !== "accepted" || box.status !== "accepted" || update.status !== "accepted") throw new Error("capability fixture blocked")
    const results = [fixture.evidence, fixture.tree, fixture.spatialIndex, region, layout, box, update.update, update.nextIndex]
    expect(allValuesHaveClosedCapabilities(results)).toBe(true)
    expect(layout.contracts.stagedEditorApply).toBe(false)
    expect(box.contracts.fixedHeightPolicy).toBe(false)
    for (const result of results) {
      expect(ownKeysContainNo(result, [
        "imageBytes", "dom", "react", "http", "editor", "backend",
        "publication", "overflow", "columns", "table", "listDecoration", "emptyLineFabrication",
      ])).toBe(true)
    }
    expect(Object.hasOwn(layout.contracts, "stagedEditorApply")).toBe(true)
    expect(layout.contracts.stagedEditorApply).toBe(false)
    expect(Object.hasOwn(box.contracts, "fixedHeightPolicy")).toBe(true)
    expect(box.contracts.fixedHeightPolicy).toBe(false)
  })
})
