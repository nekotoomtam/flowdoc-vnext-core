import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  sortVNextTextBlockSpatialIndexEntriesKernelV1,
  type VNextTextBlockSpatialIndexNodeMaterializerKernelV1,
} from "./textBlockSpatialIndexKernelV1.js"
import {
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"
import {
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_SOURCE,
  VNEXT_TEXT_BLOCK_SPATIAL_INDEX_VERSION,
  VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY,
  type VNextTextBlockSpatialIndexEntryV1,
  type VNextTextBlockSpatialIndexIssueCodeV1,
  type VNextTextBlockSpatialIndexIssueV1,
  type VNextTextBlockSpatialIndexNodeV1,
  type VNextTextBlockSpatialIndexSummaryV1,
  type VNextTextBlockSpatialIndexV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  bindVNextTextBlockSpatialIndexAuthorityInternalV1,
  getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1,
  hasVNextTextBlockSpatialIndexAuthorityInternalV1,
} from "./textBlockLayoutAuthorityInternalsV1.js"
import { hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1 } from "./textBlockPersistentFlowTreeInternalsV1.js"

const CompactFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)
const NonBlankStringSchema = z.string().refine((value) => value.trim().length > 0)
const ClearanceSchema = z.object({
  topLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  rightLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  bottomLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  leftLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
}).strict()
const EntrySchema = z.object({
  objectId: NonBlankStringSchema,
  geometryOwnerFingerprint: CompactFingerprintSchema,
  xLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  yLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  widthLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  heightLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  clearance: ClearanceSchema,
  wrapPolicy: z.enum(["rectangular-exclusion", "top-bottom-barrier", "overlay"]),
}).strict()

const processLocalSpatialIndexesV1 = new WeakSet<object>()
const processLocalSpatialIndexBindingsV1 = new WeakMap<
  VNextTextBlockSpatialIndexV1,
  {
    persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
    request: VNextTextBlockMultiRunLayoutRequestV1
    requestFingerprint: string
    authority: NonNullable<ReturnType<
      typeof getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1
    >>
    entriesByObjectId: ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1>
  }
>()

export function spatialFingerprintV1(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function spatialIssueV1(
  code: VNextTextBlockSpatialIndexIssueCodeV1,
  path: string,
  message: string,
  objectId?: string,
): VNextTextBlockSpatialIndexIssueV1 {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(objectId == null ? {} : { objectId }),
  }
}

export function deepFreezeSpatialV1<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  if (Object.isFrozen(value)) return value
  Object.values(value).forEach((child) => deepFreezeSpatialV1(child))
  return Object.freeze(value)
}

export function deeplyFrozenSpatialV1(value: unknown): boolean {
  if (value == null || typeof value !== "object" || !Object.isFrozen(value)) return false
  return Object.values(value).every((child) => (
    child == null || typeof child !== "object" || deeplyFrozenSpatialV1(child)
  ))
}

function safeSum(...values: number[]): number | null {
  let total = 0
  for (const value of values) {
    if (!Number.isSafeInteger(value)) return null
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

export function createSpatialEntryV1(input: {
  value: unknown
  contentRightLayoutUnit: number
  path: string
}): { status: "accepted"; entry: VNextTextBlockSpatialIndexEntryV1 } | {
  status: "blocked"
  issue: VNextTextBlockSpatialIndexIssueV1
} {
  if (
    input.value != null
    && typeof input.value === "object"
    && "wrapPolicy" in input.value
    && input.value.wrapPolicy !== "rectangular-exclusion"
    && input.value.wrapPolicy !== "top-bottom-barrier"
    && input.value.wrapPolicy !== "overlay"
  ) return {
    status: "blocked",
    issue: spatialIssueV1(
      "unsupported-wrap-policy",
      `${input.path}.wrapPolicy`,
      "spatial wrap policy is not supported by the synthetic Core boundary",
    ),
  }
  const parsed = EntrySchema.safeParse(input.value)
  if (!parsed.success) return {
    status: "blocked",
    issue: spatialIssueV1(
      "invalid-spatial-entry",
      input.path,
      parsed.error.issues.map((item) => item.message).join("; "),
    ),
  }
  const value = parsed.data
  const right = safeSum(
    value.xLayoutUnit,
    value.widthLayoutUnit,
    value.clearance.rightLayoutUnit,
  )
  const bottom = safeSum(
    value.yLayoutUnit,
    value.heightLayoutUnit,
    value.clearance.bottomLayoutUnit,
  )
  if (right == null || bottom == null) return {
    status: "blocked",
    issue: spatialIssueV1(
      "unsafe-spatial-arithmetic",
      input.path,
      "positioned object clearance envelope exceeds safe integer arithmetic",
      value.objectId,
    ),
  }
  const left = value.xLayoutUnit - value.clearance.leftLayoutUnit
  const top = value.yLayoutUnit - value.clearance.topLayoutUnit
  if (
    !Number.isSafeInteger(left)
    || !Number.isSafeInteger(top)
    || left < 0
    || top < 0
    || right > input.contentRightLayoutUnit
  ) return {
    status: "blocked",
    issue: spatialIssueV1(
      "spatial-boundary-violation",
      input.path,
      "positioned object clearance envelope must remain inside horizontal bounds with a non-negative local top",
      value.objectId,
    ),
  }
  const facts = {
    ...value,
    clearance: { ...value.clearance },
    envelope: {
      leftLayoutUnit: left,
      topLayoutUnit: top,
      rightLayoutUnit: right,
      bottomLayoutUnit: bottom,
    },
  }
  return {
    status: "accepted",
    entry: deepFreezeSpatialV1({
      ...facts,
      fingerprint: spatialFingerprintV1(facts),
    }),
  }
}

const EMPTY_SUMMARY: VNextTextBlockSpatialIndexSummaryV1 = Object.freeze({
  entryCount: 0,
  nodeCount: 0,
  maximumBottomLayoutUnit: 0,
  flowAffectingEntryCount: 0,
  barrierEntryCount: 0,
  overlayEntryCount: 0,
})

export const materializeVNextTextBlockSpatialIndexNodeV1:
  VNextTextBlockSpatialIndexNodeMaterializerKernelV1 = (input) => {
  const facts = {
    entry: input.entry,
    priorityFingerprint: input.entry.fingerprint,
    leftFingerprint: input.left?.fingerprint ?? null,
    rightFingerprint: input.right?.fingerprint ?? null,
    summary: input.summary,
  }
  return deepFreezeSpatialV1({
    entry: input.entry,
    priorityFingerprint: input.entry.fingerprint,
    left: input.left,
    right: input.right,
    summary: input.summary,
    fingerprint: spatialFingerprintV1(facts),
  })
}

export function registerSpatialIndexV1(input: {
  index: VNextTextBlockSpatialIndexV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  authority: NonNullable<ReturnType<
    typeof getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1
  >>
  entriesByObjectId: ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1>
}): void {
  processLocalSpatialIndexesV1.add(input.index)
  bindVNextTextBlockSpatialIndexAuthorityInternalV1(input.index, input.authority)
  processLocalSpatialIndexBindingsV1.set(input.index, {
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
    requestFingerprint: spatialFingerprintV1(input.request),
    authority: input.authority,
    entriesByObjectId: input.entriesByObjectId,
  })
}

export function hasSpatialIndexProvenanceV1(value: object): boolean {
  return processLocalSpatialIndexesV1.has(value)
}

export function hasSpatialIndexBindingV1(input: {
  index: VNextTextBlockSpatialIndexV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
}): boolean {
  const binding = processLocalSpatialIndexBindingsV1.get(input.index)
  if (
    binding?.persistentFlowTree !== input.persistentFlowTree
    || binding.request !== input.request
    || binding.requestFingerprint !== spatialFingerprintV1(input.request)
    || !hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(
      input.persistentFlowTree,
      input.request,
    )
  ) return false
  const authority = getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1({
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
  })
  return authority != null
    && binding.authority === authority
    && hasVNextTextBlockSpatialIndexAuthorityInternalV1(input.index, authority)
}

export function getSpatialIndexEntryBindingV1(
  index: VNextTextBlockSpatialIndexV1,
  objectId: string,
): VNextTextBlockSpatialIndexEntryV1 | null {
  return processLocalSpatialIndexBindingsV1.get(index)?.entriesByObjectId.get(objectId) ?? null
}

export function getSpatialIndexEntriesBindingV1(
  index: VNextTextBlockSpatialIndexV1,
): ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1> | null {
  return processLocalSpatialIndexBindingsV1.get(index)?.entriesByObjectId ?? null
}

export function createSpatialIndexFromRootV1(input: {
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  root: VNextTextBlockSpatialIndexNodeV1 | null
  authority: NonNullable<ReturnType<
    typeof getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1
  >>
  entriesByObjectId: ReadonlyMap<string, VNextTextBlockSpatialIndexEntryV1>
}): VNextTextBlockSpatialIndexV1 {
  const root = input.root
  const summary = root?.summary ?? EMPTY_SUMMARY
  const facts = {
    source: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_SPATIAL_INDEX_VERSION,
    inputAuthority: VNEXT_TEXT_BLOCK_SPATIAL_INPUT_AUTHORITY,
    documentId: input.persistentFlowTree.documentId,
    sectionId: input.persistentFlowTree.sectionId,
    textBlockId: input.persistentFlowTree.textBlockId,
    instanceRevision: input.persistentFlowTree.instanceRevision,
    layoutContextFingerprint: input.persistentFlowTree.layoutContextFingerprint,
    persistentFlowTreeFingerprint: input.persistentFlowTree.fingerprint,
    contentLeftLayoutUnit: 0 as const,
    contentRightLayoutUnit: input.request.availableWidthLayoutUnit,
    root,
    summary,
    contracts: {
      canonicalPositionedObjectSchema: false as const,
      authoredPositionedObjectBinding: false as const,
      processLocalImmutableIndex: true as const,
      subtreeMaximumBottomQuery: true as const,
      coreOwnedFingerprints: true as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  const index = deepFreezeSpatialV1({
    ...facts,
    fingerprint: spatialFingerprintV1(facts),
  })
  registerSpatialIndexV1({
    index,
    persistentFlowTree: input.persistentFlowTree,
    request: input.request,
    authority: input.authority,
    entriesByObjectId: input.entriesByObjectId,
  })
  return index
}

export function parseSpatialEntriesV1(input: {
  values: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  contentRightLayoutUnit: number
}): { entries: VNextTextBlockSpatialIndexEntryV1[]; issues: VNextTextBlockSpatialIndexIssueV1[] } {
  const entries: VNextTextBlockSpatialIndexEntryV1[] = []
  const issues: VNextTextBlockSpatialIndexIssueV1[] = []
  const ids = new Set<string>()
  input.values.forEach((value, index) => {
    const result = createSpatialEntryV1({
      value,
      contentRightLayoutUnit: input.contentRightLayoutUnit,
      path: `entries[${index}]`,
    })
    if (result.status === "blocked") {
      issues.push(result.issue)
      return
    }
    if (ids.has(result.entry.objectId)) {
      issues.push(spatialIssueV1(
        "duplicate-object-id",
        `entries[${index}].objectId`,
        `positioned object id "${result.entry.objectId}" is duplicated`,
        result.entry.objectId,
      ))
      return
    }
    ids.add(result.entry.objectId)
    entries.push(result.entry)
  })
  sortVNextTextBlockSpatialIndexEntriesKernelV1(entries)
  return { entries, issues }
}
