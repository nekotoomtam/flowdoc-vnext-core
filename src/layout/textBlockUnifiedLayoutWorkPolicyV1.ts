import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockStageWorkCountV1,
  VNextTextBlockUnifiedLayoutStageUnitV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE =
  "vnext-text-block-unified-layout-work-policy-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION = 1 as const
const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1_ID =
  "5b-1-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID =
  "5b-1-v2" as const

export type VNextTextBlockWorkPolicyLockStatusV1 =
  | "inactive"
  | "prelock"
  | "locked"

export type VNextTextBlockWorkPolicyCheckpointOwnerV1 =
  | "5B-1"
  | "5B-2"
  | "5B-3"

export interface VNextTextBlockStageLimitV1 {
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
  readonly lockStatus: VNextTextBlockWorkPolicyLockStatusV1
  readonly smallBlockFloor: number
  readonly absoluteStageLimit: number
  readonly relativeNumerator: number
  readonly relativeDenominator: 1
  readonly checkpointOwner: VNextTextBlockWorkPolicyCheckpointOwnerV1
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION
  readonly policyId: string
  readonly checkpoint: VNextTextBlockWorkPolicyCheckpointOwnerV1
  readonly stages: readonly VNextTextBlockStageLimitV1[]
  readonly fingerprint: string
}

export function composeVNextTextBlockStageWorkLedgerInternalV1(input: {
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly factualCounts: readonly VNextTextBlockStageWorkCountV1[]
}): readonly VNextTextBlockStageWorkCountV1[] {
  const policyIndexes = new Map<string, number>()
  input.policy.stages.forEach((row, index) => {
    const key = `${row.stage}/${row.unit}`
    if (policyIndexes.has(key)) {
      throw new TypeError(`work policy contains duplicate row ${key}`)
    }
    policyIndexes.set(key, index)
  })

  const counts = new Map<string, number>()
  let previousIndex = -1
  for (const fact of input.factualCounts) {
    if (!Number.isSafeInteger(fact.count) || fact.count < 0) {
      throw new RangeError("factual work count must be a nonnegative safe integer")
    }
    const key = `${fact.stage}/${fact.unit}`
    const index = policyIndexes.get(key)
    if (index == null) {
      throw new TypeError(`factual work contains unknown policy row ${key}`)
    }
    if (counts.has(key)) {
      throw new TypeError(`factual work contains duplicate row ${key}`)
    }
    if (index <= previousIndex) {
      throw new TypeError("factual work rows must follow policy order")
    }
    const row = input.policy.stages[index]!
    if (row.lockStatus !== "locked" && fact.count !== 0) {
      throw new TypeError(`inactive policy row ${key} cannot report work`)
    }
    counts.set(key, fact.count)
    previousIndex = index
  }

  return Object.freeze(input.policy.stages.map((row) => Object.freeze({
    stage: row.stage,
    unit: row.unit,
    count: counts.get(`${row.stage}/${row.unit}`) ?? 0,
  })))
}

export function previousVNextTextBlockStageSummaryBaseInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
}): number {
  switch (input.unit) {
    case "source-items":
    case "source-lookup-nodes":
    case "source-path-copy-nodes":
    case "source-leaf-items":
    case "flow-atoms":
    case "flow-tree-nodes":
      return input.previousRoot.sourceState.summary.itemCount
    case "spatial-index-nodes":
    case "spatial-query-bands":
      return input.previousRoot.spatialState.summary.entryCount
    case "selected-exact-subtree-nodes":
    case "line-tree-lookup-nodes":
    case "recomputed-lines":
    case "proof-nodes":
    case "reprojected-lines":
    case "visited-fragments":
      return input.previousRoot.lineTree.summary.lineCount
    case "copied-scene-nodes":
    case "replacement-chunks":
    case "scene-tree-lookup-nodes":
    case "delivery-operations":
    case "retain-cover-nodes":
      return input.previousRoot.persistentScene.summary.chunkCount
  }
}

export interface VNextTextBlockFlowStageLimitsV1 {
  readonly sourceItems: VNextTextBlockStageLimitV1
  readonly flowAtoms: VNextTextBlockStageLimitV1
  readonly flowTreeNodes: VNextTextBlockStageLimitV1
}

export interface VNextTextBlockSpatialStageLimitsV1 {
  readonly spatialIndexNodes: VNextTextBlockStageLimitV1
  readonly spatialQueryBands: VNextTextBlockStageLimitV1
}

export interface VNextTextBlockLayoutStageLimitsV1 {
  readonly recomputedLines: VNextTextBlockStageLimitV1
  readonly proofNodes: VNextTextBlockStageLimitV1
}

export interface VNextTextBlockGeometryStageLimitsV1 {
  readonly reprojectedLines: VNextTextBlockStageLimitV1
  readonly visitedFragments: VNextTextBlockStageLimitV1
}

export function effectiveStageLimitV1(input: {
  readonly smallBlockFloor: number
  readonly absoluteStageLimit: number
  readonly relativeStageLimit: number
}): number {
  const values = [
    input.smallBlockFloor,
    input.absoluteStageLimit,
    input.relativeStageLimit,
  ]
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new RangeError("stage limits must be nonnegative safe integers")
  }
  return Math.max(
    input.smallBlockFloor,
    Math.min(input.absoluteStageLimit, input.relativeStageLimit),
  )
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function stageLimit(
  input: Omit<VNextTextBlockStageLimitV1, "fingerprint">,
): VNextTextBlockStageLimitV1 {
  return Object.freeze({
    ...input,
    fingerprint: fingerprint(input),
  })
}

const inactive = (
  stage: VNextTextBlockUnifiedLayoutStageV1,
  unit: VNextTextBlockUnifiedLayoutStageUnitV1,
  checkpointOwner: VNextTextBlockWorkPolicyCheckpointOwnerV1,
): VNextTextBlockStageLimitV1 => stageLimit({
  stage,
  unit,
  lockStatus: "inactive",
  smallBlockFloor: 0,
  absoluteStageLimit: 0,
  relativeNumerator: 0,
  relativeDenominator: 1,
  checkpointOwner,
})

const locked = (
  stage: VNextTextBlockUnifiedLayoutStageV1,
  unit: VNextTextBlockUnifiedLayoutStageUnitV1,
  smallBlockFloor: number,
  absoluteStageLimit: number,
  relativeNumerator: number,
): VNextTextBlockStageLimitV1 => stageLimit({
  stage,
  unit,
  lockStatus: "locked",
  smallBlockFloor,
  absoluteStageLimit,
  relativeNumerator,
  relativeDenominator: 1,
  checkpointOwner: "5B-1",
})

function legacyInactive(
  stage: VNextTextBlockUnifiedLayoutStageV1,
  unit: "estimated-canonical-payload-bytes",
  checkpointOwner: VNextTextBlockWorkPolicyCheckpointOwnerV1,
) {
  const facts = {
    stage,
    unit,
    lockStatus: "inactive" as const,
    smallBlockFloor: 0,
    absoluteStageLimit: 0,
    relativeNumerator: 0,
    relativeDenominator: 1 as const,
    checkpointOwner,
  }
  return Object.freeze({ ...facts, fingerprint: fingerprint(facts) })
}

/*
 * The constants below are the checked-in result of the 5B-1 fixture
 * calibration manifest. No elapsed-time value participates in the policy.
 * The retained V1 row is staged compatibility only; V2 keeps payload bytes
 * observational and outside execution work.
 */
const policy5b1V1Stages = Object.freeze([
  locked("source-flow", "source-items", 1, 4, 1),
  inactive("source-flow", "flow-atoms", "5B-2"),
  inactive("source-flow", "flow-tree-nodes", "5B-2"),
  inactive("spatial-index", "spatial-index-nodes", "5B-3"),
  inactive("spatial-index", "spatial-query-bands", "5B-3"),
  inactive("layout-reconvergence", "recomputed-lines", "5B-2"),
  inactive("layout-reconvergence", "proof-nodes", "5B-2"),
  inactive("geometry", "reprojected-lines", "5B-3"),
  inactive("geometry", "visited-fragments", "5B-3"),
  locked("scene", "copied-scene-nodes", 2, 16, 1),
  locked("scene", "replacement-chunks", 1, 4, 1),
  locked("delivery-plan", "delivery-operations", 4, 16, 1),
  locked("delivery-plan", "retain-cover-nodes", 16, 64, 1),
  legacyInactive(
    "delivery-plan",
    "estimated-canonical-payload-bytes",
    "5B-3",
  ),
])

const policy5b1V1Facts = {
  source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE,
  contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION,
  policyId: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1_ID,
  checkpoint: "5B-1" as const,
  stages: policy5b1V1Stages,
}

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1:
VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
  ...policy5b1V1Facts,
  fingerprint: fingerprint(policy5b1V1Facts),
}) as unknown as VNextTextBlockUnifiedLayoutWorkPolicyV1

const policy5b1V2Stages = Object.freeze([
  locked("source-flow", "source-items", 1, 4, 1),
  inactive("source-flow", "flow-atoms", "5B-2"),
  inactive("source-flow", "flow-tree-nodes", "5B-2"),
  inactive("spatial-index", "spatial-index-nodes", "5B-3"),
  inactive("spatial-index", "spatial-query-bands", "5B-3"),
  locked(
    "structural-reuse-proof",
    "selected-exact-subtree-nodes",
    1,
    4,
    1,
  ),
  inactive("layout-reconvergence", "recomputed-lines", "5B-2"),
  inactive("layout-reconvergence", "proof-nodes", "5B-2"),
  inactive("geometry", "reprojected-lines", "5B-3"),
  inactive("geometry", "visited-fragments", "5B-3"),
  locked("scene", "copied-scene-nodes", 2, 16, 1),
  locked("scene", "replacement-chunks", 1, 4, 1),
  locked("delivery-plan", "delivery-operations", 4, 16, 1),
  locked("delivery-plan", "retain-cover-nodes", 16, 64, 1),
] satisfies readonly VNextTextBlockStageLimitV1[])

const policy5b1V2Facts = {
  source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE,
  contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION,
  policyId: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID,
  checkpoint: "5B-1" as const,
  stages: policy5b1V2Stages,
}

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2:
VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
  ...policy5b1V2Facts,
  fingerprint: fingerprint(policy5b1V2Facts),
})

export type VNextTextBlockStageWorkLimitEvaluationV1 =
  | {
      readonly status: "within-limit"
      readonly effectiveLimit: number
      readonly attemptedWork: number
    }
  | {
      readonly status: "limit-exceeded"
      readonly effectiveLimit: number
      readonly attemptedWork: number
    }
  | {
      readonly status: "inactive"
      readonly effectiveLimit: 0
      readonly attemptedWork: number
    }
  | {
      readonly status: "invalid"
      readonly effectiveLimit: null
      readonly attemptedWork: number
    }

export function evaluateVNextTextBlockStageWorkLimitInternalV1(input: {
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
  readonly previousSummaryBase: number
  readonly exactValidatedChangeDelta: number
  readonly attemptedWork: number
}): VNextTextBlockStageWorkLimitEvaluationV1 {
  const row = input.policy.stages.find((candidate) =>
    candidate.stage === input.stage && candidate.unit === input.unit
  )
  if (
    row == null
    || [
      input.previousSummaryBase,
      input.exactValidatedChangeDelta,
      input.attemptedWork,
    ].some((value) => !Number.isSafeInteger(value) || value < 0)
    || !Number.isSafeInteger(row.smallBlockFloor)
    || !Number.isSafeInteger(row.absoluteStageLimit)
    || !Number.isSafeInteger(row.relativeNumerator)
    || row.relativeDenominator !== 1
    || row.smallBlockFloor < 0
    || row.absoluteStageLimit < 0
    || row.relativeNumerator < 0
  ) {
    return {
      status: "invalid",
      effectiveLimit: null,
      attemptedWork: input.attemptedWork,
    }
  }
  if (row.lockStatus !== "locked") {
    return {
      status: "inactive",
      effectiveLimit: 0,
      attemptedWork: input.attemptedWork,
    }
  }
  const product = input.previousSummaryBase * row.relativeNumerator
  if (!Number.isSafeInteger(product)) {
    return {
      status: "invalid",
      effectiveLimit: null,
      attemptedWork: input.attemptedWork,
    }
  }
  const relativeStageLimit =
    Math.ceil(product / row.relativeDenominator)
    + input.exactValidatedChangeDelta
  if (!Number.isSafeInteger(relativeStageLimit)) {
    return {
      status: "invalid",
      effectiveLimit: null,
      attemptedWork: input.attemptedWork,
    }
  }
  const effectiveLimit = effectiveStageLimitV1({
    smallBlockFloor: row.smallBlockFloor,
    absoluteStageLimit: row.absoluteStageLimit,
    relativeStageLimit,
  })
  return {
    status: input.attemptedWork <= effectiveLimit
      ? "within-limit"
      : "limit-exceeded",
    effectiveLimit,
    attemptedWork: input.attemptedWork,
  }
}
