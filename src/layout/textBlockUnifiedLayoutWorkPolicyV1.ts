import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2,
  type VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
} from "./textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.js"
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
  "5b-1-v3" as const

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

export interface VNextTextBlockWorkCalibrationObservationInternalV1 {
  readonly fixtureId: string
  readonly capabilityStatus:
    | "active"
    | "structural-calibration"
    | "inactive-reference"
  readonly transitionExecuted: boolean
  readonly previousSourceItemCount: number
  readonly previousLineCount: number
  readonly previousChunkCount: number
  readonly factualCounts: readonly VNextTextBlockStageWorkCountV1[]
}

export interface VNextTextBlockWorkPolicyCalibrationInternalV1 {
  readonly formulaVersion: "5b-1-v3-calibration-v1"
  readonly fixtureIds: readonly string[]
  readonly lockedRows: readonly (VNextTextBlockStageLimitV1 & {
    readonly maximumObservedWork: number
    readonly maximumSmallBlockObservedWork: number
    readonly thresholdPreviousSummaryBase: number
    readonly effectiveLimit: number
    readonly limitMinusOne: number
    readonly limit: number
    readonly limitPlusOne: number
  })[]
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
    case "evidence-request-lookup-nodes":
    case "evidence-context-atoms":
    case "evidence-response-nodes":
    case "evidence-request-descriptors":
    case "evidence-material-descriptors":
    case "evidence-producer-descriptors":
    case "evidence-runtime-invocations":
    case "evidence-runtime-input-scalars":
    case "evidence-glyphs":
    case "evidence-clusters":
    case "evidence-breaks":
    case "evidence-guards":
    case "evidence-proof-facts":
    case "evidence-response-facts":
    case "evidence-acceptance-descriptors":
    case "evidence-acceptance-comparisons":
    case "evidence-acceptance-registrations":
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

const v3LockedRowKeys = Object.freeze([
  ["source-flow", "source-items"],
  ["source-flow", "source-lookup-nodes"],
  ["source-flow", "source-path-copy-nodes"],
  ["source-flow", "source-leaf-items"],
  ["structural-reuse-proof", "selected-exact-subtree-nodes"],
  ["structural-reuse-proof", "line-tree-lookup-nodes"],
  ["scene", "line-tree-lookup-nodes"],
  ["scene", "copied-scene-nodes"],
  ["scene", "replacement-chunks"],
  ["scene", "scene-tree-lookup-nodes"],
  ["delivery-plan", "delivery-operations"],
  ["delivery-plan", "retain-cover-nodes"],
  ["delivery-plan", "scene-tree-lookup-nodes"],
] as const)

function nextPowerOfTwo(value: number): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError("calibration values must be positive safe integers")
  }
  let output = 1
  while (output < value) output *= 2
  if (!Number.isSafeInteger(output)) {
    throw new RangeError("calibration power-of-two exceeded safe range")
  }
  return output
}

function calibrationBase(
  observation: VNextTextBlockWorkCalibrationObservationInternalV1,
  unit: VNextTextBlockUnifiedLayoutStageUnitV1,
): number {
  switch (unit) {
    case "source-items":
    case "source-lookup-nodes":
    case "source-path-copy-nodes":
    case "source-leaf-items":
      return observation.previousSourceItemCount
    case "selected-exact-subtree-nodes":
    case "line-tree-lookup-nodes":
      return observation.previousLineCount
    case "copied-scene-nodes":
    case "replacement-chunks":
    case "scene-tree-lookup-nodes":
    case "delivery-operations":
    case "retain-cover-nodes":
      return observation.previousChunkCount
    default:
      throw new TypeError(`inactive unit ${unit} cannot be calibrated as locked`)
  }
}

export function deriveVNextTextBlockWorkPolicyCalibrationInternalV1(
  observations: readonly VNextTextBlockWorkCalibrationObservationInternalV1[],
): VNextTextBlockWorkPolicyCalibrationInternalV1 {
  if (observations.length === 0) throw new TypeError("calibration matrix is empty")
  const fixtureIds = new Set<string>()
  for (const observation of observations) {
    if (fixtureIds.has(observation.fixtureId)) {
      throw new TypeError(`duplicate calibration fixture ${observation.fixtureId}`)
    }
    fixtureIds.add(observation.fixtureId)
    if ([
      observation.previousSourceItemCount,
      observation.previousLineCount,
      observation.previousChunkCount,
    ].some((value) => !Number.isSafeInteger(value) || value < 0)) {
      throw new RangeError("calibration summary bases must be safe and nonnegative")
    }
    if (observation.factualCounts.length !== v3LockedRowKeys.length) {
      throw new TypeError("calibration fixture must contain all 13 locked rows")
    }
  }
  const rows = v3LockedRowKeys.map(([stage, unit], rowIndex) => {
    const samples = observations.map((observation) => {
      const fact = observation.factualCounts[rowIndex]
      if (
        fact?.stage !== stage
        || fact.unit !== unit
        || !Number.isSafeInteger(fact.count)
        || fact.count < 0
      ) throw new TypeError(`calibration row order mismatch at ${stage}/${unit}`)
      return {
        count: fact.count,
        base: calibrationBase(observation, unit),
        small: observation.previousLineCount <= 32,
      }
    })
    const maximumObservedWork = Math.max(...samples.map((sample) => sample.count))
    const maximumSmallBlockObservedWork = Math.max(
      ...samples.filter((sample) => sample.small).map((sample) => sample.count),
    )
    if (maximumObservedWork <= 0 || maximumSmallBlockObservedWork <= 0) {
      throw new RangeError(`locked calibration row ${stage}/${unit} lacks positive evidence`)
    }
    const smallBlockFloor = nextPowerOfTwo(maximumSmallBlockObservedWork)
    const absoluteStageLimit = nextPowerOfTwo(4 * maximumObservedWork)
    const relativeNumerator = Math.max(...samples.map((sample) =>
      Math.ceil(sample.count / Math.max(1, sample.base))
    ))
    const thresholdPreviousSummaryBase = Math.max(...samples.map((sample) => sample.base))
    const effectiveLimit = effectiveStageLimitV1({
      smallBlockFloor,
      absoluteStageLimit,
      relativeStageLimit: thresholdPreviousSummaryBase * relativeNumerator + 1,
    })
    return Object.freeze({
      ...locked(stage, unit, smallBlockFloor, absoluteStageLimit, relativeNumerator),
      maximumObservedWork,
      maximumSmallBlockObservedWork,
      thresholdPreviousSummaryBase,
      effectiveLimit,
      limitMinusOne: effectiveLimit - 1,
      limit: effectiveLimit,
      limitPlusOne: effectiveLimit + 1,
    })
  })
  return Object.freeze({
    formulaVersion: "5b-1-v3-calibration-v1" as const,
    fixtureIds: Object.freeze([...fixtureIds]),
    lockedRows: Object.freeze(rows),
  })
}

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
 * The retained V1 row is staged compatibility only; V3 keeps payload bytes
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

const frozenV3Locked = new Map([
  locked("source-flow", "source-items", 1, 4, 1),
  locked("source-flow", "source-lookup-nodes", 2, 16, 1),
  locked("source-flow", "source-path-copy-nodes", 2, 16, 1),
  locked("source-flow", "source-leaf-items", 8, 32, 1),
  locked("structural-reuse-proof", "selected-exact-subtree-nodes", 1, 4, 1),
  locked("structural-reuse-proof", "line-tree-lookup-nodes", 2, 8, 2),
  locked("scene", "line-tree-lookup-nodes", 4, 16, 1),
  locked("scene", "copied-scene-nodes", 2, 16, 1),
  locked("scene", "replacement-chunks", 1, 4, 1),
  locked("scene", "scene-tree-lookup-nodes", 4, 16, 1),
  locked("delivery-plan", "delivery-operations", 4, 16, 1),
  locked("delivery-plan", "retain-cover-nodes", 8, 64, 1),
  locked("delivery-plan", "scene-tree-lookup-nodes", 128, 512, 12),
].map((row) => [`${row.stage}/${row.unit}`, row]))
const v3Row = (
  stage: VNextTextBlockUnifiedLayoutStageV1,
  unit: VNextTextBlockUnifiedLayoutStageUnitV1,
  owner: VNextTextBlockWorkPolicyCheckpointOwnerV1 = "5B-1",
): VNextTextBlockStageLimitV1 =>
  frozenV3Locked.get(`${stage}/${unit}`)
    ?? inactive(stage, unit, owner)
const policy5b1V3Stages = Object.freeze([
  v3Row("source-flow", "source-items"),
  v3Row("source-flow", "source-lookup-nodes"),
  v3Row("source-flow", "source-path-copy-nodes"),
  v3Row("source-flow", "source-leaf-items"),
  v3Row("source-flow", "flow-atoms", "5B-2"),
  v3Row("source-flow", "flow-tree-nodes", "5B-2"),
  v3Row("spatial-index", "spatial-index-nodes", "5B-3"),
  v3Row("spatial-index", "spatial-query-bands", "5B-3"),
  v3Row("structural-reuse-proof", "selected-exact-subtree-nodes"),
  v3Row("structural-reuse-proof", "line-tree-lookup-nodes"),
  v3Row("layout-reconvergence", "recomputed-lines", "5B-2"),
  v3Row("layout-reconvergence", "proof-nodes", "5B-2"),
  v3Row("geometry", "reprojected-lines", "5B-3"),
  v3Row("geometry", "visited-fragments", "5B-3"),
  v3Row("scene", "line-tree-lookup-nodes"),
  v3Row("scene", "copied-scene-nodes"),
  v3Row("scene", "replacement-chunks"),
  v3Row("scene", "scene-tree-lookup-nodes"),
  v3Row("delivery-plan", "delivery-operations"),
  v3Row("delivery-plan", "retain-cover-nodes"),
  v3Row("delivery-plan", "scene-tree-lookup-nodes"),
])
const policy5b1V3Facts = {
  source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE,
  contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION,
  policyId: "5b-1-v3",
  checkpoint: "5B-1" as const,
  stages: policy5b1V3Stages,
}
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3:
VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
  ...policy5b1V3Facts,
  fingerprint: fingerprint(policy5b1V3Facts),
})

const exact5B2EvidenceCalibrationPolicies =
  new WeakSet<VNextTextBlockUnifiedLayoutWorkPolicyV1>()

function authorityEvidenceCalibrationStageLimit(
  unit: VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
  limit: number,
): VNextTextBlockStageLimitV1 {
  return stageLimit({
    stage: "evidence",
    unit,
    lockStatus: "locked",
    smallBlockFloor: limit,
    absoluteStageLimit: limit,
    relativeNumerator: 0,
    relativeDenominator: 1,
    checkpointOwner: "5B-2",
  })
}

export function createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(
  limits: Readonly<Partial<Record<
    VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
    number
  >>>,
): VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  if (limits == null || typeof limits !== "object" || Array.isArray(limits)) {
    throw new TypeError("evidence calibration limits must be an object")
  }
  const units = new Set<string>(
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
      .map((row) => row.unit),
  )
  const capturedLimits = new Map<
    VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
    number
  >()
  for (const [unit, limit] of Object.entries(limits)) {
    if (!units.has(unit)) {
      throw new TypeError(`unknown evidence calibration unit ${unit}`)
    }
    if (!Number.isSafeInteger(limit) || limit < 0) {
      throw new RangeError(`evidence calibration limit for ${unit} is invalid`)
    }
    capturedLimits.set(
      unit as VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
      limit,
    )
  }
  const stages = Object.freeze([
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
      .map((row) => authorityEvidenceCalibrationStageLimit(
        row.unit,
        capturedLimits.get(row.unit) ?? 8_192,
      )),
    ...policy5b1V3Stages,
  ])
  const facts = {
    source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION,
    policyId: "5b-2-authority-test-only",
    checkpoint: "5B-2" as const,
    stages,
  }
  const policy: VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
  exact5B2EvidenceCalibrationPolicies.add(policy)
  return policy
}

/** Internal authority calibration seam; never selected by public bootstrap or attempt. */
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2 =
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})

const calibrationSourceFlowLocked = (
  unit:
    | "source-items"
    | "source-lookup-nodes"
    | "source-path-copy-nodes"
    | "source-leaf-items"
    | "flow-atoms"
    | "flow-tree-nodes",
): VNextTextBlockStageLimitV1 => stageLimit({
  stage: "source-flow",
  unit,
  lockStatus: "locked",
  smallBlockFloor: 8_192,
  absoluteStageLimit: 32_768,
  relativeNumerator: 8,
  relativeDenominator: 1,
  checkpointOwner: "5B-2",
})

const policy5b2CalibrationTestOnlyStages = Object.freeze([
  ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
    .map((row) => authorityEvidenceCalibrationStageLimit(row.unit, 8_192)),
  ...policy5b1V3Stages.map((row) => {
    if (row.stage !== "source-flow") return row
    switch (row.unit) {
      case "source-items":
      case "source-lookup-nodes":
      case "source-path-copy-nodes":
      case "source-leaf-items":
      case "flow-atoms":
      case "flow-tree-nodes":
        return calibrationSourceFlowLocked(row.unit)
      default:
        return row
    }
  }),
])
const policy5b2CalibrationTestOnlyFacts = {
  source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_SOURCE,
  contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_V1_VERSION,
  policyId: "5b-2-calibration-test-only",
  checkpoint: "5B-2" as const,
  stages: policy5b2CalibrationTestOnlyStages,
}

/** Internal calibration seam; never selected by public bootstrap or attempt. */
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1:
VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
  ...policy5b2CalibrationTestOnlyFacts,
  fingerprint: fingerprint(policy5b2CalibrationTestOnlyFacts),
})

export function isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(
  value: unknown,
): value is VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  return value === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3
    || value
      === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1
    || (value != null
      && typeof value === "object"
      && exact5B2EvidenceCalibrationPolicies.has(
        value as VNextTextBlockUnifiedLayoutWorkPolicyV1,
      ))
}

export interface VNextTextBlockSourceEnvelopeLimitInternalV1 {
  readonly unit:
    | "source-items"
    | "source-lookup-nodes"
    | "source-path-copy-nodes"
    | "source-leaf-items"
  readonly attemptedWork: number
  readonly effectiveLimit: number
}

export type VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1 =
  | {
      readonly status: "accepted"
      readonly effectiveLimits:
        readonly VNextTextBlockSourceEnvelopeLimitInternalV1[]
    }
  | {
      readonly status: "rejected"
      readonly unit: VNextTextBlockSourceEnvelopeLimitInternalV1["unit"]
      readonly attemptedWork: number
      readonly effectiveLimit: number
    }
  | { readonly status: "invalid-policy" }

export function evaluateVNextTextBlockSourceWorkEnvelopeInternalV1(input: {
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly sourceItemCount: number
  readonly treeHeight: number
  readonly maximumLeafOccupancy: 8
  readonly deliberateItemResolutionCount: 1
}): VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1 {
  if (!isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(input.policy)) {
    return Object.freeze({ status: "invalid-policy" as const })
  }
  if ([
    input.sourceItemCount,
    input.treeHeight,
    input.maximumLeafOccupancy,
    input.deliberateItemResolutionCount,
  ].some((value) => !Number.isSafeInteger(value) || value < 0)) {
    return Object.freeze({ status: "invalid-policy" as const })
  }
  const attempts = [
    {
      unit: "source-items" as const,
      attemptedWork: input.deliberateItemResolutionCount,
    },
    {
      unit: "source-lookup-nodes" as const,
      attemptedWork: input.treeHeight,
    },
    {
      unit: "source-path-copy-nodes" as const,
      attemptedWork: input.treeHeight,
    },
    {
      unit: "source-leaf-items" as const,
      attemptedWork: input.maximumLeafOccupancy,
    },
  ]
  const effectiveLimits: VNextTextBlockSourceEnvelopeLimitInternalV1[] = []
  for (const attempt of attempts) {
    const evaluation = evaluateVNextTextBlockStageWorkLimitInternalV1({
      policy: input.policy,
      stage: "source-flow",
      unit: attempt.unit,
      previousSummaryBase: input.sourceItemCount,
      exactValidatedChangeDelta: 1,
      attemptedWork: attempt.attemptedWork,
    })
    if (
      evaluation.status === "invalid"
      || evaluation.status === "inactive"
    ) {
      return Object.freeze({ status: "invalid-policy" as const })
    }
    const limit = Object.freeze({
      ...attempt,
      effectiveLimit: evaluation.effectiveLimit,
    })
    if (evaluation.status === "limit-exceeded") {
      return Object.freeze({
        status: "rejected" as const,
        ...limit,
      })
    }
    effectiveLimits.push(limit)
  }
  if (input.treeHeight > 16) {
    return Object.freeze({
      status: "rejected" as const,
      unit: "source-lookup-nodes" as const,
      attemptedWork: input.treeHeight,
      effectiveLimit: 16,
    })
  }
  return Object.freeze({
    status: "accepted" as const,
    effectiveLimits: Object.freeze(effectiveLimits),
  })
}

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
