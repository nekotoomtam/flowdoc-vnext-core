import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"
import type {
  VNextTextBlockSpatialBandV1,
  VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import { computeVNextTextBlockFlowRegionKernelV1 } from "./textBlockFlowRegionKernelV1.js"
import {
  deeplyFrozenSpatialV1,
  deepFreezeSpatialV1,
  hasSpatialIndexBindingV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import {
  inspectVNextTextBlockSpatialIndexV1,
  queryVNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexV1.js"

export interface VNextTextBlockFlowIntervalV1 {
  startLayoutUnit: number
  endLayoutUnit: number
}

export type VNextTextBlockFlowRegionIssueCodeV1 =
  | "spatial-index-provenance-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-line-band"
  | "invalid-content-insets"
  | "unsafe-region-arithmetic"
  | "invalid-returned-intervals"
  | "no-vertical-progress"

export interface VNextTextBlockFlowRegionIssueV1 {
  code: VNextTextBlockFlowRegionIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export interface VNextTextBlockFlowRegionWorkV1 {
  fastPath: "no-flow-affecting-entry" | "none"
  spatialIndexQueryCount: 0 | 1
  visitedSpatialNodeCount: number
  matchedSpatialEntryCount: number
  rectangularSubtractionCount: number
}

export type VNextTextBlockFlowRegionResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: VNextTextBlockFlowRegionWorkV1
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockFlowRegionIssueV1[]
    }

export type VNextTextBlockFlowRegionInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "flow-region-provenance-mismatch" | "flow-region-not-deeply-frozen"
      message: string
    }

const processLocalFlowRegionResultsV1 = new WeakSet<object>()

function issue(
  code: VNextTextBlockFlowRegionIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockFlowRegionIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(
  issues: VNextTextBlockFlowRegionIssueV1[],
): VNextTextBlockFlowRegionResultV1 {
  return {
    status: "blocked",
    intervals: null,
    intersectingEntryFingerprints: null,
    nextYLayoutUnit: null,
    work: null,
    mayPublishLayout: false,
    productionBinding: false,
    fingerprint: null,
    issues,
  }
}

function accepted(input: {
  spatialIndexFingerprint: string
  band: VNextTextBlockSpatialBandV1
  contentInsets: { leftLayoutUnit: number; rightLayoutUnit: number }
  intervals: readonly VNextTextBlockFlowIntervalV1[]
  intersectingEntryFingerprints: readonly string[]
  nextYLayoutUnit: number | null
  work: VNextTextBlockFlowRegionWorkV1
}): VNextTextBlockFlowRegionResultV1 {
  const facts = {
    status: "accepted" as const,
    spatialIndexFingerprint: input.spatialIndexFingerprint,
    band: { ...input.band },
    contentInsets: { ...input.contentInsets },
    intervals: input.intervals.map((interval) => ({ ...interval })),
    intersectingEntryFingerprints: [...input.intersectingEntryFingerprints],
    nextYLayoutUnit: input.nextYLayoutUnit,
    work: { ...input.work },
    mayPublishLayout: false as const,
    productionBinding: false as const,
    issues: [] as [],
  }
  const result = deepFreezeSpatialV1({
    status: facts.status,
    intervals: facts.intervals,
    intersectingEntryFingerprints: facts.intersectingEntryFingerprints,
    nextYLayoutUnit: facts.nextYLayoutUnit,
    work: facts.work,
    mayPublishLayout: facts.mayPublishLayout,
    productionBinding: facts.productionBinding,
    fingerprint: spatialFingerprintV1(facts),
    issues: facts.issues,
  })
  processLocalFlowRegionResultsV1.add(result)
  return result
}

export function provideVNextTextBlockFlowRegionsV1(input: {
  spatialIndex: VNextTextBlockSpatialIndexV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  band: VNextTextBlockSpatialBandV1
  contentInsets: {
    leftLayoutUnit: number
    rightLayoutUnit: number
  }
}): VNextTextBlockFlowRegionResultV1 {
  const inspection = inspectVNextTextBlockSpatialIndexV1(input.spatialIndex)
  if (inspection.status !== "valid") return blocked([
    issue(
      "spatial-index-provenance-mismatch",
      "spatialIndex",
      inspection.message,
    ),
  ])
  if (!hasSpatialIndexBindingV1({
    index: input.spatialIndex,
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
  })) return blocked([
    issue(
      "spatial-index-binding-mismatch",
      "spatialIndex",
      "flow region provider requires the exact index, persistent flow tree, and unchanged request",
    ),
  ])
  if (
    !Number.isSafeInteger(input.band.topLayoutUnit)
    || !Number.isSafeInteger(input.band.bottomLayoutUnit)
    || input.band.topLayoutUnit < 0
    || input.band.bottomLayoutUnit <= input.band.topLayoutUnit
  ) return blocked([
    issue(
      "invalid-line-band",
      "band",
      "flow region provider requires a non-negative safe half-open line band",
    ),
  ])
  if (
    !Number.isSafeInteger(input.contentInsets.leftLayoutUnit)
    || !Number.isSafeInteger(input.contentInsets.rightLayoutUnit)
  ) return blocked([
    issue(
      "unsafe-region-arithmetic",
      "contentInsets",
      "content insets must use safe integer layout units",
    ),
  ])
  if (
    input.contentInsets.leftLayoutUnit < 0
    || input.contentInsets.rightLayoutUnit < 0
  ) return blocked([
    issue(
      "invalid-content-insets",
      "contentInsets",
      "content insets must be non-negative",
    ),
  ])
  const contentStartLayoutUnit = (
    input.spatialIndex.contentLeftLayoutUnit + input.contentInsets.leftLayoutUnit
  )
  const contentEndLayoutUnit = (
    input.spatialIndex.contentRightLayoutUnit - input.contentInsets.rightLayoutUnit
  )
  if (
    !Number.isSafeInteger(contentStartLayoutUnit)
    || !Number.isSafeInteger(contentEndLayoutUnit)
  ) return blocked([
    issue(
      "unsafe-region-arithmetic",
      "contentInsets",
      "inset-adjusted content bounds exceed safe integer arithmetic",
    ),
  ])
  if (contentStartLayoutUnit >= contentEndLayoutUnit) return blocked([
    issue(
      "invalid-content-insets",
      "contentInsets",
      "content insets must leave a positive-width content interval",
    ),
  ])
  let queryRejected = false
  const kernel = computeVNextTextBlockFlowRegionKernelV1({
    contentStartLayoutUnit,
    contentEndLayoutUnit,
    bandTopLayoutUnit: input.band.topLayoutUnit,
    bandBottomLayoutUnit: input.band.bottomLayoutUnit,
    flowAffectingEntryCount: input.spatialIndex.summary.flowAffectingEntryCount,
    query: () => {
      const queried = queryVNextTextBlockSpatialIndexV1({
        index: input.spatialIndex,
        persistentFlowTree: input.persistentFlowTree,
        request: input.request,
        band: input.band,
      })
      if (queried.status !== "accepted") {
        queryRejected = true
        return { entries: [], visitedNodeCount: 0 }
      }
      return {
        entries: queried.entries,
        visitedNodeCount: queried.work.visitedNodeCount,
      }
    },
  })
  if (queryRejected) return blocked([
    issue(
      "spatial-index-binding-mismatch",
      "spatialIndex",
      "spatial index query rejected the provider binding",
    ),
  ])
  if (kernel.status === "blocked") return blocked(kernel.issues)
  return accepted({
    spatialIndexFingerprint: input.spatialIndex.fingerprint,
    band: input.band,
    contentInsets: input.contentInsets,
    intervals: kernel.intervals,
    intersectingEntryFingerprints: kernel.intersectingEntryFingerprints,
    nextYLayoutUnit: kernel.nextYLayoutUnit,
    work: kernel.work,
  })
}

export function inspectVNextTextBlockFlowRegionResultV1(
  result: unknown,
): VNextTextBlockFlowRegionInspectionV1 {
  if (
    result == null
    || typeof result !== "object"
    || !processLocalFlowRegionResultsV1.has(result)
  ) return {
    status: "invalid",
    code: "flow-region-provenance-mismatch",
    message: "flow region result is not the exact process-local object created by Core",
  }
  if (!deeplyFrozenSpatialV1(result)) return {
    status: "invalid",
    code: "flow-region-not-deeply-frozen",
    message: "registered flow region result must remain recursively frozen",
  }
  return {
    status: "valid",
    fingerprint: (result as Extract<
      VNextTextBlockFlowRegionResultV1,
      { status: "accepted" }
    >).fingerprint,
  }
}
