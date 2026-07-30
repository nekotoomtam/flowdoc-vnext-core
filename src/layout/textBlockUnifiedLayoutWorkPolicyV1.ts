import type {
  VNextTextBlockUnifiedLayoutStageUnitV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE =
  "vnext-text-block-unified-layout-work-policy-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION = 1 as const

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
  readonly relativeStageLimit: number
  readonly checkpointOwner: VNextTextBlockWorkPolicyCheckpointOwnerV1
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION
  readonly checkpoint: VNextTextBlockWorkPolicyCheckpointOwnerV1
  readonly stages: readonly VNextTextBlockStageLimitV1[]
  readonly fingerprint: string
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
