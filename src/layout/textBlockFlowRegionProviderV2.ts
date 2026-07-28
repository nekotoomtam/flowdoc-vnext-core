import { computeVNextTextBlockFlowRegionKernelV1, type VNextTextBlockFlowRegionKernelFailureV1 } from "./textBlockFlowRegionKernelV1.js"
import {
  deepFreezeSpatialV2,
  fingerprintV2,
  hasSpatialIndexBindingV2,
  inspectVNextTextBlockSpatialIndexV2,
  queryVNextTextBlockSpatialIndexV2,
} from "./textBlockSpatialIndexV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import type { VNextTextBlockSpatialBandV1, VNextTextBlockFlowRegionResultV2, VNextTextBlockSpatialIndexV2, VNextTextBlockSpatialIssueV2 } from "./textBlockSpatialIndexContractV2.js"

const results = new WeakSet<object>()
const issue = (code: VNextTextBlockSpatialIssueV2["code"], path: string, message: string): VNextTextBlockSpatialIssueV2 => ({ code, severity: "error", path, message })
const blocked = (issues: readonly VNextTextBlockSpatialIssueV2[]): VNextTextBlockFlowRegionResultV2 => ({ status: "blocked", source: "vnext-text-block-flow-region-v2", contractVersion: 2, intervals: null, intersectingEntryFingerprints: null, nextYLayoutUnit: null, work: null, mayPublishLayout: false, productionBinding: false, fingerprint: null, issues })
function failureIssue(failure: VNextTextBlockFlowRegionKernelFailureV1): VNextTextBlockSpatialIssueV2 { return failure === "no-vertical-progress" ? issue("no-vertical-progress", "nextYLayoutUnit", "blocked flow regions require a strictly advancing vertical event") : issue("invalid-returned-intervals", "intervals", "flow region intervals are invalid") }
type ProviderInput = { initialFlow: VNextTextBlockInitialFlowV1; evidence: VNextTextBlockFlowEvidenceV2; persistentFlowTree: VNextTextBlockPersistentFlowTreeV2; spatialIndex: VNextTextBlockSpatialIndexV2; band: VNextTextBlockSpatialBandV1; contentInsets: { leftLayoutUnit: number; rightLayoutUnit: number } }
function exactRecord(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null
  try {
    const actual = Reflect.ownKeys(value)
    if (actual.length !== keys.length || actual.some((key) => typeof key !== "string" || !keys.includes(key))) return null
    const copy = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      copy[key] = descriptor.value
    }
    return copy
  } catch { return null }
}
function exactProviderInput(value: unknown): ProviderInput | null {
  const outer = exactRecord(value, ["initialFlow", "evidence", "persistentFlowTree", "spatialIndex", "band", "contentInsets"])
  if (outer == null) return null
  const band = exactRecord(outer.band, ["topLayoutUnit", "bottomLayoutUnit"])
  const contentInsets = exactRecord(outer.contentInsets, ["leftLayoutUnit", "rightLayoutUnit"])
  return band == null || contentInsets == null ? null : { ...outer, band, contentInsets } as unknown as ProviderInput
}

export function provideVNextTextBlockFlowRegionsV2(input: ProviderInput): VNextTextBlockFlowRegionResultV2
export function provideVNextTextBlockFlowRegionsV2(input: unknown): VNextTextBlockFlowRegionResultV2
export function provideVNextTextBlockFlowRegionsV2(input: unknown): VNextTextBlockFlowRegionResultV2 {
  const envelope = exactProviderInput(input)
  if (envelope == null) return blocked([issue("invalid-input", "input", "flow region V2 provider requires an exact accessor-free data envelope")])
  input = envelope
  if (inspectVNextTextBlockSpatialIndexV2(input.spatialIndex).status !== "valid") return blocked([issue("spatial-index-provenance-mismatch", "spatialIndex", "flow region provider requires a process-local V2 index")])
  if (!hasSpatialIndexBindingV2({ initialFlow: input.initialFlow, evidence: input.evidence, persistentFlowTree: input.persistentFlowTree, index: input.spatialIndex })) return blocked([issue("spatial-index-binding-mismatch", "spatialIndex", "flow region provider requires the exact V2 authority-bound index")])
  if (!Number.isSafeInteger(input.band.topLayoutUnit) || !Number.isSafeInteger(input.band.bottomLayoutUnit) || input.band.topLayoutUnit < 0 || input.band.bottomLayoutUnit <= input.band.topLayoutUnit) return blocked([issue("invalid-line-band", "band", "flow region provider requires a non-negative safe half-open line band")])
  if (!Number.isSafeInteger(input.contentInsets.leftLayoutUnit) || !Number.isSafeInteger(input.contentInsets.rightLayoutUnit)) return blocked([issue("unsafe-region-arithmetic", "contentInsets", "content insets must use safe integer layout units")])
  if (input.contentInsets.leftLayoutUnit < 0 || input.contentInsets.rightLayoutUnit < 0) return blocked([issue("invalid-content-insets", "contentInsets", "content insets must be non-negative")])
  const start = input.spatialIndex.contentLeftLayoutUnit + input.contentInsets.leftLayoutUnit
  const end = input.spatialIndex.contentRightLayoutUnit - input.contentInsets.rightLayoutUnit
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return blocked([issue("unsafe-region-arithmetic", "contentInsets", "inset-adjusted bounds exceed safe arithmetic")])
  if (start >= end) return blocked([issue("invalid-content-insets", "contentInsets", "content insets must leave a positive-width interval")])
  const kernel = computeVNextTextBlockFlowRegionKernelV1({ contentStartLayoutUnit: start, contentEndLayoutUnit: end, bandTopLayoutUnit: input.band.topLayoutUnit, bandBottomLayoutUnit: input.band.bottomLayoutUnit, flowAffectingEntryCount: input.spatialIndex.summary.flowAffectingEntryCount, query: () => queryVNextTextBlockSpatialIndexV2(input.spatialIndex, input.band) })
  if (kernel.status === "blocked") return blocked([failureIssue(kernel.failure)])
  const facts = { status: "accepted" as const, source: "vnext-text-block-flow-region-v2" as const, contractVersion: 2 as const, spatialIndexFingerprint: input.spatialIndex.fingerprint, band: { ...input.band }, contentInsets: { ...input.contentInsets }, intervals: kernel.intervals.map((item) => ({ ...item })), intersectingEntryFingerprints: [...kernel.intersectingEntryFingerprints], nextYLayoutUnit: kernel.nextYLayoutUnit, work: { ...kernel.work }, mayPublishLayout: false as const, productionBinding: false as const, issues: [] as [] }
  const result = deepFreezeSpatialV2({ ...facts, fingerprint: fingerprintV2(facts) })
  results.add(result)
  return result
}

export function inspectVNextTextBlockFlowRegionResultV2(value: unknown): { status: "valid"; fingerprint: string } | { status: "invalid"; code: "flow-region-provenance-mismatch" | "flow-region-not-deeply-frozen"; message: string } {
  if (value == null || typeof value !== "object" || !results.has(value)) return { status: "invalid", code: "flow-region-provenance-mismatch", message: "flow region V2 result is not the exact process-local Core object" }
  if (!Object.isFrozen(value)) return { status: "invalid", code: "flow-region-not-deeply-frozen", message: "flow region V2 result must remain frozen" }
  return { status: "valid", fingerprint: (value as { fingerprint: string }).fingerprint }
}
