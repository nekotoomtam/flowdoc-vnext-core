import type { VNextTextBlockSpatialIndexEntryV1 } from "./textBlockSpatialIndexContractV1.js"

export interface VNextTextBlockFlowIntervalKernelV1 {
  startLayoutUnit: number
  endLayoutUnit: number
}

export interface VNextTextBlockFlowRegionWorkKernelV1 {
  fastPath: "no-flow-affecting-entry" | "none"
  spatialIndexQueryCount: 0 | 1
  visitedSpatialNodeCount: number
  matchedSpatialEntryCount: number
  rectangularSubtractionCount: number
}

export type VNextTextBlockFlowRegionKernelFailureV1 =
  | "invalid-returned-intervals"
  | "no-vertical-progress"

export type VNextTextBlockFlowRegionKernelResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalKernelV1[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: VNextTextBlockFlowRegionWorkKernelV1
      failure: null
    }
  | {
      status: "blocked"
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      failure: VNextTextBlockFlowRegionKernelFailureV1
    }

function subtractRectangles(input: {
  entries: readonly VNextTextBlockSpatialIndexEntryV1[]
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
}): {
  intervals: VNextTextBlockFlowIntervalKernelV1[]
  subtractionCount: number
} {
  const exclusions = input.entries
    .filter((entry) => entry.wrapPolicy === "rectangular-exclusion")
    .map((entry) => ({
      startLayoutUnit: Math.max(input.contentStartLayoutUnit, entry.envelope.leftLayoutUnit),
      endLayoutUnit: Math.min(input.contentEndLayoutUnit, entry.envelope.rightLayoutUnit),
    }))
    .filter((interval) => interval.startLayoutUnit < interval.endLayoutUnit)
    .sort((left, right) => left.startLayoutUnit - right.startLayoutUnit
      || left.endLayoutUnit - right.endLayoutUnit)
  const merged: VNextTextBlockFlowIntervalKernelV1[] = []
  for (const exclusion of exclusions) {
    const previous = merged.at(-1)
    if (previous == null || exclusion.startLayoutUnit > previous.endLayoutUnit) {
      merged.push({ ...exclusion })
    } else {
      previous.endLayoutUnit = Math.max(previous.endLayoutUnit, exclusion.endLayoutUnit)
    }
  }
  const intervals: VNextTextBlockFlowIntervalKernelV1[] = []
  let cursor = input.contentStartLayoutUnit
  for (const exclusion of merged) {
    if (cursor < exclusion.startLayoutUnit) {
      intervals.push({ startLayoutUnit: cursor, endLayoutUnit: exclusion.startLayoutUnit })
    }
    cursor = Math.max(cursor, exclusion.endLayoutUnit)
  }
  if (cursor < input.contentEndLayoutUnit) {
    intervals.push({ startLayoutUnit: cursor, endLayoutUnit: input.contentEndLayoutUnit })
  }
  return { intervals, subtractionCount: merged.length }
}

function validIntervals(input: {
  intervals: readonly VNextTextBlockFlowIntervalKernelV1[]
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
}): boolean {
  return input.intervals.every((interval, index) => (
    Number.isSafeInteger(interval.startLayoutUnit)
    && Number.isSafeInteger(interval.endLayoutUnit)
    && interval.startLayoutUnit >= input.contentStartLayoutUnit
    && interval.endLayoutUnit <= input.contentEndLayoutUnit
    && interval.startLayoutUnit < interval.endLayoutUnit
    && (index === 0 || input.intervals[index - 1]!.endLayoutUnit <= interval.startLayoutUnit)
  ))
}

export function computeVNextTextBlockFlowRegionKernelV1(input: {
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
  bandTopLayoutUnit: number
  bandBottomLayoutUnit: number
  flowAffectingEntryCount: number
  query(): {
    entries: readonly VNextTextBlockSpatialIndexEntryV1[]
    visitedNodeCount: number
  }
}): VNextTextBlockFlowRegionKernelResultV1 {
  if (input.flowAffectingEntryCount === 0) return {
    status: "accepted",
    intervals: [{
      startLayoutUnit: input.contentStartLayoutUnit,
      endLayoutUnit: input.contentEndLayoutUnit,
    }],
    intersectingEntryFingerprints: [],
    nextYLayoutUnit: null,
    work: {
      fastPath: "no-flow-affecting-entry",
      spatialIndexQueryCount: 0,
      visitedSpatialNodeCount: 0,
      matchedSpatialEntryCount: 0,
      rectangularSubtractionCount: 0,
    },
    failure: null,
  }
  const queried = input.query()
  const relevantFlowAffectingEntries = queried.entries
    .filter((entry) => entry.wrapPolicy !== "overlay")
    .filter((entry) => (
      entry.wrapPolicy === "top-bottom-barrier"
      || (
        entry.envelope.leftLayoutUnit < input.contentEndLayoutUnit
        && entry.envelope.rightLayoutUnit > input.contentStartLayoutUnit
      )
    ))
  const hasBarrier = relevantFlowAffectingEntries.some(
    (entry) => entry.wrapPolicy === "top-bottom-barrier",
  )
  const subtracted = hasBarrier
    ? { intervals: [], subtractionCount: 0 }
    : subtractRectangles({
        entries: relevantFlowAffectingEntries,
        contentStartLayoutUnit: input.contentStartLayoutUnit,
        contentEndLayoutUnit: input.contentEndLayoutUnit,
      })
  if (!validIntervals({
    intervals: subtracted.intervals,
    contentStartLayoutUnit: input.contentStartLayoutUnit,
    contentEndLayoutUnit: input.contentEndLayoutUnit,
  })) return {
    status: "blocked",
    intervals: null,
    intersectingEntryFingerprints: null,
    nextYLayoutUnit: null,
    work: null,
    failure: "invalid-returned-intervals",
  }
  const nextYLayoutUnit = relevantFlowAffectingEntries.reduce<number | null>(
    (minimum, entry) => {
      const bottom = entry.envelope.bottomLayoutUnit
      if (bottom <= input.bandTopLayoutUnit) return minimum
      return minimum == null || bottom < minimum ? bottom : minimum
    },
    null,
  )
  if (subtracted.intervals.length === 0 && nextYLayoutUnit == null) return {
    status: "blocked",
    intervals: null,
    intersectingEntryFingerprints: null,
    nextYLayoutUnit: null,
    work: null,
    failure: "no-vertical-progress",
  }
  return {
    status: "accepted",
    intervals: subtracted.intervals,
    intersectingEntryFingerprints: relevantFlowAffectingEntries.map((entry) => entry.fingerprint),
    nextYLayoutUnit,
    work: {
      fastPath: "none",
      spatialIndexQueryCount: 1,
      visitedSpatialNodeCount: queried.visitedNodeCount,
      matchedSpatialEntryCount: queried.entries.length,
      rectangularSubtractionCount: subtracted.subtractionCount,
    },
    failure: null,
  }
}
