import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerChargeResultV2,
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
  VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  VNextTextBlockTransitionProducerRuntimeIdentityV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2,
} from "./textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1,
  type VNextTextBlockStageWorkLimitEvaluationV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

type AuthorityStateV2 =
  | "created"
  | "started"
  | "runtime-bound"
  | "producer-response"
  | "producer-failure"
  | "producer-blocked"
  | "acceptance-consumed"

type ProducerTerminalOutcomeV2 =
  | "producer-response"
  | "producer-failure"
  | "producer-blocked"

interface AuthorityFailedEvaluationV2 {
  readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
  readonly attemptedWork: number
  readonly completedWork: number
  readonly effectiveLimit: number
}

export interface AuthorityRecordSnapshotV2 {
  readonly state: AuthorityStateV2
  readonly terminalOutcome: ProducerTerminalOutcomeV2 | null
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2 | null
  readonly completedWork: readonly {
    readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
    readonly completedWork: number
    readonly effectiveLimit: number
  }[]
  readonly firstFailedEvaluation: AuthorityFailedEvaluationV2 | null
  readonly visitedEvidenceNodeCount: number
}

interface AuthorityRecordV2 {
  state: AuthorityStateV2
  terminalOutcome: ProducerTerminalOutcomeV2 | null
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly runtimeRequirements: {
    readonly unitPolicyFingerprint: string
    readonly fontStyleUnitDependencyFingerprint: string
    readonly producerRuntimeRequirementFingerprint: string
  }
  readonly evaluators: ReadonlyMap<
    VNextTextBlockTransitionProducerOwnedWorkUnitV2,
    (attemptedWork: number) => VNextTextBlockStageWorkLimitEvaluationV1
  >
  readonly completedWork: Map<VNextTextBlockTransitionProducerOwnedWorkUnitV2, number>
  firstFailedEvaluation: AuthorityFailedEvaluationV2 | null
  runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2 | null
}

const producerUnits = Object.freeze(
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
    .filter((row) => row.owner === "producer")
    .map((row) => row.unit as VNextTextBlockTransitionProducerOwnedWorkUnitV2),
)
const producerUnitSet = new Set<VNextTextBlockTransitionProducerOwnedWorkUnitV2>(
  producerUnits,
)
const records = new WeakMap<object, AuthorityRecordV2>()
const registeredRuntimeIdentities = new WeakSet<object>()

function freeze<T>(value: T): Readonly<T> {
  return Object.freeze(value)
}

function visitedEvidenceNodeCount(record: AuthorityRecordV2): number {
  let count = 0
  for (const unit of producerUnits) count += record.completedWork.get(unit) ?? 0
  return count
}

function snapshot(record: AuthorityRecordV2): Readonly<AuthorityRecordSnapshotV2> {
  const completedWork = producerUnits.flatMap((unit) => {
    const count = record.completedWork.get(unit) ?? 0
    if (count === 0) return []
    const evaluation = record.evaluators.get(unit)?.(count)
    return evaluation == null || evaluation.effectiveLimit == null
      ? []
      : [freeze({ unit, completedWork: count, effectiveLimit: evaluation.effectiveLimit })]
  })
  return freeze({
    state: record.state,
    terminalOutcome: record.terminalOutcome,
    previousRoot: record.previousRoot,
    change: record.change,
    request: record.request,
    sourceMaterial: record.sourceMaterial,
    workPolicy: record.workPolicy,
    runtimeIdentity: record.runtimeIdentity,
    completedWork: freeze(completedWork),
    firstFailedEvaluation: record.firstFailedEvaluation,
    visitedEvidenceNodeCount: visitedEvidenceNodeCount(record),
  })
}

export function registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
  identity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
): void {
  if (
    identity == null
    || typeof identity !== "object"
    || !Object.isFrozen(identity)
    || identity.source !== "vnext-text-block-transition-producer-runtime-v2"
    || identity.contractVersion !== 2
  ) {
    throw new TypeError("producer runtime identity must be the exact frozen V2 identity")
  }
  registeredRuntimeIdentities.add(identity)
}

export function hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
  identity: unknown,
): identity is VNextTextBlockTransitionProducerRuntimeIdentityV2 {
  return identity != null
    && typeof identity === "object"
    && registeredRuntimeIdentities.has(identity as object)
}

export function deriveVNextTextBlockTransitionProducerAggregateWorkCeilingInternalV2(
  input: {
    readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly previousSummaryBase: number
  },
): number | null {
  if (
    !isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(input.policy)
    || !Number.isSafeInteger(input.previousSummaryBase)
    || input.previousSummaryBase < 0
  ) return null
  let aggregate = 0
  for (const unit of producerUnits) {
    const evaluation = evaluateVNextTextBlockStageWorkLimitInternalV1({
      policy: input.policy,
      stage: "evidence",
      unit,
      previousSummaryBase: input.previousSummaryBase,
      exactValidatedChangeDelta: 1,
      attemptedWork: 0,
    })
    if (evaluation.status !== "within-limit") return null
    aggregate += evaluation.effectiveLimit
    if (!Number.isSafeInteger(aggregate)) return null
  }
  return aggregate
}

export function createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly request: VNextTextBlockTransitionEvidenceRequestV2
    readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockTransitionProducerInvocationAuthorityV2 {
  if (
    input.previousRoot.workPolicy !== input.workPolicy
    || input.request.previousRootFingerprint !== input.previousRoot.fingerprint
    || input.request.workPolicyFingerprint !== input.workPolicy.fingerprint
    || input.sourceMaterial.requestFingerprint !== input.request.fingerprint
    || input.sourceMaterial.layoutUnitPolicyFingerprint
      !== input.request.layoutUnitPolicyFingerprint
    || !isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(input.workPolicy)
  ) throw new TypeError("producer invocation authority tuple is invalid")

  const previousSummaryBase = input.previousRoot.sourceState.summary.itemCount
  const evaluators = new Map<
    VNextTextBlockTransitionProducerOwnedWorkUnitV2,
    (attemptedWork: number) => VNextTextBlockStageWorkLimitEvaluationV1
  >()
  for (const unit of producerUnits) {
    evaluators.set(unit, (attemptedWork) =>
      evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy: input.workPolicy,
        stage: "evidence",
        unit,
        previousSummaryBase,
        exactValidatedChangeDelta: 1,
        attemptedWork,
      }))
  }

  const authority: VNextTextBlockTransitionProducerInvocationAuthorityV2 = {
    source: "vnext-text-block-transition-producer-invocation-authority-v2",
    contractVersion: 2,
    begin: function begin(request, sourceMaterial) {
      const record = records.get(this)
      if (
        record == null
        || record.state !== "created"
        || record.request !== request
        || record.sourceMaterial !== sourceMaterial
      ) return freeze({ status: "rejected" as const })
      record.state = "started"
      return freeze({ status: "started" as const })
    },
    charge: function charge(unit): VNextTextBlockTransitionProducerChargeResultV2 {
      const record = records.get(this)
      if (
        record == null
        || (record.state !== "started" && record.state !== "runtime-bound")
        || !producerUnitSet.has(unit)
        || (record.state === "started" && unit !== "evidence-producer-descriptors")
      ) return freeze({ status: "invalid-state" as const, unit })
      const completedWork = record.completedWork.get(unit) ?? 0
      const attemptedWork = completedWork + 1
      const evaluation = record.evaluators.get(unit)?.(attemptedWork)
      if (evaluation?.status !== "within-limit") {
        const effectiveLimit = evaluation?.effectiveLimit ?? 0
        const failed = freeze({
          unit,
          attemptedWork,
          completedWork,
          effectiveLimit,
        })
        if (record.firstFailedEvaluation == null) {
          record.firstFailedEvaluation = failed
        }
        return freeze({ status: "limit-exceeded" as const, ...failed })
      }
      record.completedWork.set(unit, attemptedWork)
      return freeze({
        status: "charged" as const,
        unit,
        completedWork: attemptedWork,
        effectiveLimit: evaluation.effectiveLimit,
      })
    },
    bindRuntimeIdentity: function bindRuntimeIdentity(identity) {
      const record = records.get(this)
      if (
        record == null
        || record.state !== "started"
        || (record.completedWork.get("evidence-producer-descriptors") ?? 0) === 0
        || !hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(identity)
        || identity.unitPolicyFingerprint
          !== record.runtimeRequirements.unitPolicyFingerprint
        || identity.fontStyleUnitDependencyFingerprint
          !== record.runtimeRequirements.fontStyleUnitDependencyFingerprint
        || identity.producerRuntimeRequirementFingerprint
          !== record.runtimeRequirements.producerRuntimeRequirementFingerprint
      ) return freeze({ status: "rejected" as const })
      record.runtimeIdentity = identity
      record.state = "runtime-bound"
      return freeze({ status: "bound" as const })
    },
    close: function close(outcome) {
      const record = records.get(this)
      if (
        record == null
        || (record.state !== "started" && record.state !== "runtime-bound")
        || (outcome !== "producer-blocked" && record.state !== "runtime-bound")
      ) {
        return freeze({
          status: "rejected" as const,
          visitedEvidenceNodeCount: record == null
            ? 0
            : visitedEvidenceNodeCount(record),
        })
      }
      record.state = outcome
      record.terminalOutcome = outcome
      return freeze({
        status: "closed" as const,
        visitedEvidenceNodeCount: visitedEvidenceNodeCount(record),
      })
    },
  }
  records.set(authority, {
    state: "created",
    terminalOutcome: null,
    previousRoot: input.previousRoot,
    change: input.change,
    request: input.request,
    sourceMaterial: input.sourceMaterial,
    workPolicy: input.workPolicy,
    runtimeRequirements: freeze({
      unitPolicyFingerprint: input.request.layoutUnitPolicyFingerprint,
      fontStyleUnitDependencyFingerprint:
        input.request.fontStyleUnitDependencyFingerprint,
      producerRuntimeRequirementFingerprint:
        input.request.producerRuntimeRequirementFingerprint,
    }),
    evaluators,
    completedWork: new Map(),
    firstFailedEvaluation: null,
    runtimeIdentity: null,
  })
  return Object.freeze(authority)
}

export function inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
  authority: unknown,
): Readonly<AuthorityRecordSnapshotV2> | null {
  const record = authority != null && typeof authority === "object"
    ? records.get(authority as object)
    : null
  return record == null ? null : snapshot(record)
}

export function consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
  input: {
    readonly authority: unknown
    readonly request: object
    readonly sourceMaterial: object
    readonly expectedTerminal: ProducerTerminalOutcomeV2
  },
):
  | { readonly status: "consumed"; readonly snapshot: Readonly<AuthorityRecordSnapshotV2> }
  | { readonly status: "rejected" } {
  const record = input.authority != null && typeof input.authority === "object"
    ? records.get(input.authority as object)
    : null
  if (
    record == null
    || record.state !== input.expectedTerminal
    || record.terminalOutcome !== input.expectedTerminal
    || record.request !== input.request
    || record.sourceMaterial !== input.sourceMaterial
  ) return freeze({ status: "rejected" as const })
  record.state = "acceptance-consumed"
  return freeze({ status: "consumed" as const, snapshot: snapshot(record) })
}
