import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1,
  type VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1,
} from "./textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

const SOURCE_LIMIT_KEYS = Object.freeze([
  "sourceItems",
  "sourceTreeLookupNodes",
  "sourceTreePathCopyNodes",
  "sourceLeafSlots",
  "sourceIndexNodes",
  "sourceIndexEntries",
  "sourceIndexComparisons",
  "sourceStyleNodes",
  "sourceStyleBuckets",
  "sourceStyleEntries",
] as const)

type SourceLimitKey = typeof SOURCE_LIMIT_KEYS[number]

const sourceLimitKeyByUnit = Object.freeze({
  "source-items": "sourceItems",
  "source-tree-lookup-nodes": "sourceTreeLookupNodes",
  "source-tree-path-copy-nodes": "sourceTreePathCopyNodes",
  "source-leaf-slots": "sourceLeafSlots",
  "source-index-nodes": "sourceIndexNodes",
  "source-index-entries": "sourceIndexEntries",
  "source-index-comparisons": "sourceIndexComparisons",
  "source-style-nodes": "sourceStyleNodes",
  "source-style-buckets": "sourceStyleBuckets",
  "source-style-entries": "sourceStyleEntries",
} as const satisfies Record<string, SourceLimitKey>)

const ownerSlices: readonly (readonly VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1[])[] = [
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1,
]

if (ownerSlices.some((slice) => !Object.isFrozen(slice))) {
  throw new Error("5B-2 policy composition requires frozen owner slices")
}

export interface VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1 {
  readonly sourceItems: number
  readonly sourceTreeLookupNodes: number
  readonly sourceTreePathCopyNodes: number
  readonly sourceLeafSlots: number
  readonly sourceIndexNodes: number
  readonly sourceIndexEntries: number
  readonly sourceIndexComparisons: number
  readonly sourceStyleNodes: number
  readonly sourceStyleBuckets: number
  readonly sourceStyleEntries: number
}

export type VNextTextBlockUnifiedLayout5B2PolicyRowExecutionInternalV1 =
  | { readonly kind: "accepted-foundation" }
  | { readonly kind: "test-active"; readonly limit: number }
  | {
      readonly kind: "inactive"
      readonly reason:
        | "reserved-until-plan-B-v1"
        | "reserved-until-plan-C-v1"
        | "reserved-until-plan-D-v1"
    }

export interface VNextTextBlockUnifiedLayout5B2PolicyRowInternalV1 {
  readonly ownerRow: VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1
  readonly execution: VNextTextBlockUnifiedLayout5B2PolicyRowExecutionInternalV1
}

export interface VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 {
  readonly source: "vnext-text-block-unified-layout-5b2-policy-composition-internal-v1"
  readonly contractVersion: 1
  readonly semanticContractVersion: 1
  readonly policyCompositionVersion: 1
  readonly fixtureCalibrationRevision: 0
  readonly publicWorkPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly rows: readonly VNextTextBlockUnifiedLayout5B2PolicyRowInternalV1[]
  readonly fingerprint: string
}

const exactCompositions = new WeakSet<
  VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
>()
const compositionsByRoot = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
>()
const rootsByComposition = new WeakMap<
  VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1,
  VNextTextBlockUnifiedLayoutRootV2
>()

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function captureOwnDataRecord(
  value: unknown,
  keys: readonly string[],
  label: string,
): Readonly<Record<string, unknown>> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`)
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must use a plain object prototype`)
  }
  const descriptors = Object.getOwnPropertyDescriptors(value)
  const ownKeys = Reflect.ownKeys(descriptors)
  if (
    ownKeys.length !== keys.length
    || ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))
  ) {
    throw new TypeError(`${label} must contain exactly the required own keys`)
  }
  const captured: Record<string, unknown> = {}
  for (const key of keys) {
    const descriptor = descriptors[key]
    if (descriptor == null || !("value" in descriptor)) {
      throw new TypeError(`${label}.${key} must be an own data property`)
    }
    captured[key] = descriptor.value
  }
  return Object.freeze(captured)
}

function captureSourceLimits(
  value: unknown,
): VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1 {
  const captured = captureOwnDataRecord(value, SOURCE_LIMIT_KEYS, "source limits")
  const limits: Record<SourceLimitKey, number> = {} as Record<SourceLimitKey, number>
  for (const key of SOURCE_LIMIT_KEYS) {
    const limit = captured[key]
    if (
      typeof limit !== "number"
      || !Number.isSafeInteger(limit)
      || limit < 0
    ) {
      throw new RangeError(`source limit ${key} must be a finite nonnegative safe integer`)
    }
    limits[key] = limit
  }
  return Object.freeze(limits) as VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1
}

function sourceLimitKey(
  unit: VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1["unit"],
): SourceLimitKey | null {
  if (!Object.hasOwn(sourceLimitKeyByUnit, unit)) return null
  return sourceLimitKeyByUnit[unit as keyof typeof sourceLimitKeyByUnit]
}

function rowExecution(
  ownerRow: VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1,
  sourceLimits: VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1,
): VNextTextBlockUnifiedLayout5B2PolicyRowExecutionInternalV1 {
  switch (ownerRow.activationPlan) {
    case "foundation":
      return Object.freeze({ kind: "accepted-foundation" })
    case "A": {
      const key = sourceLimitKey(ownerRow.unit)
      if (key == null) throw new TypeError(`Plan A row ${ownerRow.unit} has no source limit`)
      return Object.freeze({ kind: "test-active", limit: sourceLimits[key] })
    }
    case "B":
      return Object.freeze({ kind: "inactive", reason: "reserved-until-plan-B-v1" })
    case "C":
      return Object.freeze({ kind: "inactive", reason: "reserved-until-plan-C-v1" })
    case "D":
      return Object.freeze({ kind: "inactive", reason: "reserved-until-plan-D-v1" })
  }
}

export function createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1(
  input: {
    readonly publicWorkPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly sourceLimits: VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1
  },
): VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 {
  const capturedInput = captureOwnDataRecord(
    input,
    ["publicWorkPolicy", "sourceLimits"],
    "Plan A policy input",
  )
  const publicWorkPolicy = capturedInput.publicWorkPolicy
  if (!isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(publicWorkPolicy)) {
    throw new TypeError("Plan A policy requires an exact registered public work policy")
  }
  const sourceLimits = captureSourceLimits(capturedInput.sourceLimits)
  const rows = Object.freeze(ownerSlices.flatMap((slice) => slice.map(
    (ownerRow) => Object.freeze({
      ownerRow,
      execution: rowExecution(ownerRow, sourceLimits),
    }),
  )))
  const facts = {
    source: "vnext-text-block-unified-layout-5b2-policy-composition-internal-v1" as const,
    contractVersion: 1 as const,
    semanticContractVersion: 1 as const,
    policyCompositionVersion: 1 as const,
    fixtureCalibrationRevision: 0 as const,
    publicWorkPolicyFingerprint: publicWorkPolicy.fingerprint,
    rows: rows.map((row) => ({
      ownerRow: row.ownerRow,
      execution: row.execution,
    })),
  }
  const composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 = Object.freeze({
    source: facts.source,
    contractVersion: facts.contractVersion,
    semanticContractVersion: facts.semanticContractVersion,
    policyCompositionVersion: facts.policyCompositionVersion,
    fixtureCalibrationRevision: facts.fixtureCalibrationRevision,
    publicWorkPolicy,
    rows,
    fingerprint: fingerprint(facts),
  })
  exactCompositions.add(composition)
  return composition
}

export function registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
    readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  },
): boolean {
  if (
    input == null
    || typeof input !== "object"
    || input.root == null
    || input.composition == null
    || !exactCompositions.has(input.composition)
    || input.root.workPolicy !== input.composition.publicWorkPolicy
    || inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(input.root).status
      !== "valid"
    || compositionsByRoot.has(input.root)
    || rootsByComposition.has(input.composition)
  ) return false
  compositionsByRoot.set(input.root, input.composition)
  rootsByComposition.set(input.composition, input.root)
  return true
}

export function resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 | null {
  const composition = compositionsByRoot.get(root)
  if (
    composition == null
    || !exactCompositions.has(composition)
    || rootsByComposition.get(composition) !== root
    || root.workPolicy !== composition.publicWorkPolicy
    || inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(root).status
      !== "valid"
  ) return null
  return composition
}
