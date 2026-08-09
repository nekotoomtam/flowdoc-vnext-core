import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutChangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type { VNextTextBlockResolvedShapingRunV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceAcceptanceResultV2,
  VNextTextBlockTransitionEvidenceRequestResultV2,
  VNextTextBlockTransitionEvidenceV2,
  VNextTextBlockTransitionProducerFailureAcceptanceResultV2,
  VNextTextBlockTransitionProducerFailureV2,
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
  VNextTextBlockTransitionProducerResponseV2,
  VNextTextBlockTransitionProducerRuntimeIdentityV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerWorkV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
  consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
  hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  type AuthorityRecordSnapshotV2,
} from "./textBlockUnifiedLayoutProducerInvocationAuthorityV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  type VNextTextBlockStageWorkLimitEvaluationV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"
import { createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1 } from "./textBlockUnifiedLayoutTransitionChangeInternalsV1.js"

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function freeze<T>(value: T): T {
  if (
    value != null
    && typeof value === "object"
    && !Object.isFrozen(value)
  ) {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    Object.freeze(value)
  }
  return value
}

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return false
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    if (Object.getOwnPropertySymbols(value).length !== 0) return false
    const actual = Reflect.ownKeys(value)
    if (actual.length !== keys.length || actual.some((key) => typeof key !== "string" || !keys.includes(key))) return false
    return keys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true
    })
  } catch {
    return false
  }
}

interface AcceptanceMeterV2 {
  count: number
  failureEvaluation: VNextTextBlockStageWorkLimitEvaluationV1 | null
  readonly beforeObservation: () => boolean
}

type AcceptanceSnapshotV2 =
  | { readonly status: "accepted"; readonly value: unknown }
  | { readonly status: "invalid" | "ceiling" }

function snapshotAcceptanceDataBeforeObservation(
  value: unknown,
  meter: AcceptanceMeterV2,
  preserveExact: ReadonlySet<object>,
  seen = new Set<object>(),
): AcceptanceSnapshotV2 {
  if (
    value == null
    || typeof value === "string"
    || typeof value === "boolean"
    || typeof value === "number"
  ) {
    return typeof value === "number" && !Number.isSafeInteger(value)
      ? { status: "invalid" }
      : { status: "accepted", value }
  }
  if (typeof value !== "object" || seen.has(value)) return { status: "invalid" }
  if (preserveExact.has(value)) return { status: "accepted", value }
  seen.add(value)
  try {
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const prototype = Object.getPrototypeOf(value)
    if (!meter.beforeObservation()) return { status: "ceiling" }
    if (Object.getOwnPropertySymbols(value).length !== 0) return { status: "invalid" }
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const keys = Reflect.ownKeys(value)
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype) return { status: "invalid" }
      if (!meter.beforeObservation()) return { status: "ceiling" }
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
      if (
        lengthDescriptor == null
        || !Object.hasOwn(lengthDescriptor, "value")
        || !Number.isSafeInteger(lengthDescriptor.value)
        || lengthDescriptor.value < 0
        || keys.length !== lengthDescriptor.value + 1
      ) return { status: "invalid" }
      const output: unknown[] = []
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        if (!meter.beforeObservation()) return { status: "ceiling" }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
        if (
          descriptor == null
          || !Object.hasOwn(descriptor, "value")
          || descriptor.enumerable !== true
        ) return { status: "invalid" }
        const child = snapshotAcceptanceDataBeforeObservation(
          descriptor.value,
          meter,
          preserveExact,
          seen,
        )
        if (child.status !== "accepted") return child
        output.push(child.value)
      }
      return { status: "accepted", value: output }
    }
    if (prototype !== Object.prototype && prototype !== null) {
      return { status: "invalid" }
    }
    const output: Record<string, unknown> = {}
    for (const key of keys) {
      if (typeof key !== "string") return { status: "invalid" }
      if (!meter.beforeObservation()) return { status: "ceiling" }
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return { status: "invalid" }
      const child = snapshotAcceptanceDataBeforeObservation(
        descriptor.value,
        meter,
        preserveExact,
        seen,
      )
      if (child.status !== "accepted") return child
      output[key] = child.value
    }
    return { status: "accepted", value: output }
  } catch {
    return { status: "invalid" }
  } finally {
    seen.delete(value)
  }
}

function issue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return {
    code: "evidence-authority-mismatch",
    severity: "error",
    stage: "evidence",
    path: "evidence",
    message,
  }
}

interface RequestTupleV2 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}

const requests = new WeakMap<object, RequestTupleV2>()
const evidenceRecords = new WeakMap<object, RequestTupleV2>()
const evidenceCompletedWorkRecords = new WeakMap<object, VNextTextBlockIncrementalCandidateWorkV1>()

interface AuthorizedFallbackAuthorityRecordInternalV2 {
  readonly terminal: Readonly<AuthorityRecordSnapshotV2>
  readonly failureKind:
    | "acceptance-work-limit"
    | "producer-work-limit"
    | "producer-proof-failed"
  readonly producerFailureCode:
    VNextTextBlockTransitionProducerFailureV2["code"] | null
  readonly producerWork: VNextTextBlockTransitionProducerWorkV2
  readonly acceptanceFailedEvaluation: Readonly<{
    readonly unit: AuthorizedAcceptanceUnitV2
    readonly attemptedWork: number
    readonly completedWork: number
    readonly effectiveLimit: number | null
  }> | null
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}

const authorizedFallbackAuthorityRecords = new WeakMap<
  object,
  Readonly<AuthorizedFallbackAuthorityRecordInternalV2>
>()

export function getVNextTextBlockUnifiedLayoutAuthorizedFallbackAuthorityRecordInternalV2(
  value: unknown,
): Readonly<AuthorizedFallbackAuthorityRecordInternalV2> | null {
  return value != null && typeof value === "object"
    ? authorizedFallbackAuthorityRecords.get(value as object) ?? null
    : null
}

export function createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
  input: Omit<VNextTextBlockTransitionProducerRuntimeIdentityV2, "source" | "contractVersion" | "fingerprint">,
): VNextTextBlockTransitionProducerRuntimeIdentityV2 {
  if (
    !["node-native-mr1-range", "browser-worker-wasm-mr1-range"].includes(input.runtime)
    || [input.engineBuildFingerprint, input.fontBackendFingerprint, input.unitPolicyFingerprint, input.fontStyleUnitDependencyFingerprint, input.producerRuntimeRequirementFingerprint].some((value) => typeof value !== "string" || value.length === 0)
  ) throw new TypeError("producer runtime identity facts are invalid")
  const facts = {
    source: "vnext-text-block-transition-producer-runtime-v2" as const,
    contractVersion: 2 as const,
    ...input,
  }
  const identity = freeze({ ...facts, fingerprint: fingerprint(facts) })
  registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(identity)
  return identity
}

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
}): VNextTextBlockTransitionEvidenceRequestResultV2 {
  const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.previousRoot.workPolicy,
  })
  if (result.status === "required") {
    const workPolicy = input.previousRoot.workPolicy
    requests.set(result.request, freeze({
      previousRoot: input.previousRoot,
      change: input.change,
      request: result.request,
      sourceMaterial: result.sourceMaterial,
      completedCandidateWork: result.completedCandidateWork,
    }))
    const producerInvocationAuthority =
      createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
        previousRoot: input.previousRoot,
        change: input.change,
        request: result.request,
        sourceMaterial: result.sourceMaterial,
        workPolicy,
      })
    return freeze({ status: "required" as const, request: result.request, sourceMaterial: result.sourceMaterial, producerInvocationAuthority, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  }
  if (result.status === "not-required") return freeze({ status: "not-required" as const, request: null, sourceMaterial: null, producerInvocationAuthority: null, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  if (result.status === "fallback-required") return freeze({ status: "fallback-required" as const, request: null, sourceMaterial: null, producerInvocationAuthority: null, evaluatorOrProofAuthority: result.evaluatorOrProofAuthority, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  return freeze({ status: "blocked" as const, request: null, sourceMaterial: null, producerInvocationAuthority: null, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: result.issues })
}

const CONTRACTS = freeze({
  producerSelectsDirtyRange: false as const,
  producerSelectsLinesOrBands: false as const,
  producerSelectsReconvergenceOrReuse: false as const,
  producerSelectsFallback: false as const,
  stagedEditorApply: false as const,
  mayPublishLayout: false as const,
  productionBinding: false as const,
})

function workIsValid(work: unknown, material: VNextTextBlockTransitionProducerSourceMaterialV2): work is VNextTextBlockTransitionProducerWorkV2 {
  if (!exactKeys(work, ["requestedAtomCount", "requestedClusterCount", "consumedAtomCount", "consumedClusterCount", "unusedCoverageRenderedUtf16Length", "visitedEvidenceNodeCount", "completeNextInputTraversalCount", "completeNextInputComparisonCount"])) return false
  return work.requestedAtomCount === material.producerWorkCeilings.maximumRequestedAtomCount
    && work.requestedClusterCount === material.producerWorkCeilings.maximumRequestedClusterCount
    && Number.isSafeInteger(work.consumedAtomCount) && (work.consumedAtomCount as number) >= 0 && (work.consumedAtomCount as number) <= work.requestedAtomCount
    && Number.isSafeInteger(work.consumedClusterCount) && (work.consumedClusterCount as number) >= 0 && (work.consumedClusterCount as number) <= work.requestedClusterCount
    && Number.isSafeInteger(work.unusedCoverageRenderedUtf16Length) && (work.unusedCoverageRenderedUtf16Length as number) >= 0
    && Number.isSafeInteger(work.visitedEvidenceNodeCount) && (work.visitedEvidenceNodeCount as number) >= 0 && (work.visitedEvidenceNodeCount as number) <= material.producerWorkCeilings.maximumVisitedEvidenceNodeCount
    && work.completeNextInputTraversalCount === 0
    && work.completeNextInputComparisonCount === 0
}

interface PublicAuthorizedAcceptanceInputV2 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerInvocationAuthority:
    VNextTextBlockTransitionProducerInvocationAuthorityV2
  readonly producerRuntimeIdentity:
    VNextTextBlockTransitionProducerRuntimeIdentityV2
}

function deferredAuthorizedAcceptanceInput(
  input: PublicAuthorizedAcceptanceInputV2,
  payload: () => unknown,
): AuthorizedAcceptanceInputV2 {
  return {
    previousRoot: input.previousRoot,
    change: input.change,
    request: input.request,
    sourceMaterial: input.sourceMaterial,
    producerInvocationAuthority: input.producerInvocationAuthority,
    producerRuntimeIdentity: input.producerRuntimeIdentity,
    get responseOrFailure() {
      return payload()
    },
  }
}

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(
  input: PublicAuthorizedAcceptanceInputV2 & { readonly response: unknown },
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  return acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2(
    deferredAuthorizedAcceptanceInput(input, () => input.response),
  )
}

export function acceptVNextTextBlockUnifiedLayoutProducerFailureV2(
  input: PublicAuthorizedAcceptanceInputV2 & { readonly failure: unknown },
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  return acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2(
    deferredAuthorizedAcceptanceInput(input, () => input.failure),
  )
}

export function hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2(input: {
  readonly evidence: unknown
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly expectedRequest: VNextTextBlockTransitionEvidenceRequestV2
  readonly expectedSourceMaterial:
    VNextTextBlockTransitionProducerSourceMaterialV2
}): input is typeof input & { readonly evidence: VNextTextBlockTransitionEvidenceV2 } {
  const tuple = input.evidence != null && typeof input.evidence === "object"
    ? evidenceRecords.get(input.evidence as object)
    : null
  return tuple != null
    && tuple.previousRoot === input.previousRoot
    && tuple.change === input.change
    && tuple.request === input.expectedRequest
    && tuple.sourceMaterial === input.expectedSourceMaterial
    && evidenceCompletedWorkRecords.get(input.evidence as object) === input.completedCandidateWork
}

type AuthorizedAcceptanceUnitV2 =
  | "evidence-acceptance-descriptors"
  | "evidence-acceptance-comparisons"
  | "evidence-acceptance-registrations"

interface AuthorizedAcceptanceMeterV2 {
  readonly counts: Record<AuthorizedAcceptanceUnitV2, number>
  failure: {
    readonly status: "limit-exceeded" | "invalid"
    readonly unit: AuthorizedAcceptanceUnitV2
    readonly attemptedWork: number
    readonly completedWork: number
    readonly effectiveLimit: number | null
  } | null
  readonly before: (
    unit: AuthorizedAcceptanceUnitV2,
  ) => "charged" | "limit-exceeded" | "invalid"
}

interface AuthorizedAcceptanceInputV2 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerInvocationAuthority:
    VNextTextBlockTransitionProducerInvocationAuthorityV2
  readonly producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly responseOrFailure: unknown
}

type AuthorizedResponseValidationV2 =
  | {
      readonly status: "accepted"
      readonly response: VNextTextBlockTransitionProducerResponseV2
    }
  | { readonly status: "invalid"; readonly message: string }
  | { readonly status: "ceiling" }
  | { readonly status: "meter-invalid" }

type AuthorizedFailureValidationV2 =
  | {
      readonly status: "accepted"
      readonly failure: VNextTextBlockTransitionProducerFailureV2 | null
      readonly work: VNextTextBlockTransitionProducerWorkV2
    }
  | { readonly status: "invalid"; readonly message: string }
  | { readonly status: "ceiling" }
  | { readonly status: "meter-invalid" }

function createAuthorizedAcceptanceMeter(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): AuthorizedAcceptanceMeterV2 {
  const counts: Record<AuthorizedAcceptanceUnitV2, number> = {
    "evidence-acceptance-descriptors": 0,
    "evidence-acceptance-comparisons": 0,
    "evidence-acceptance-registrations": 0,
  }
  const meter: AuthorizedAcceptanceMeterV2 = {
    counts,
    failure: null,
    before(unit) {
      const completedWork = counts[unit]
      const evaluation = evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy: terminal.workPolicy,
        stage: "evidence",
        unit,
        previousSummaryBase: terminal.previousRoot.sourceState.summary.itemCount,
        exactValidatedChangeDelta: 1,
        attemptedWork: completedWork + 1,
      })
      if (evaluation.status !== "within-limit") {
        meter.failure = {
          status: evaluation.status === "limit-exceeded"
            ? "limit-exceeded"
            : "invalid",
          unit,
          attemptedWork: evaluation.attemptedWork,
          completedWork,
          effectiveLimit: evaluation.effectiveLimit,
        }
        return meter.failure.status
      }
      counts[unit] = evaluation.attemptedWork
      return "charged"
    },
  }
  return meter
}

function producerCompletedCount(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  unit: string,
): number {
  return terminal.completedWork.find((row) => row.unit === unit)?.completedWork ?? 0
}

function zeroAuthorizedProducerWork(
  tuple: RequestTupleV2,
): VNextTextBlockTransitionProducerWorkV2 {
  return {
    requestedAtomCount: tuple.completedCandidateWork.evidence.requestedAtomCount,
    requestedClusterCount: tuple.completedCandidateWork.evidence.requestedClusterCount,
    consumedAtomCount: 0,
    consumedClusterCount: 0,
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: 0,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
  }
}

function trustedFailureProducerWork(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): VNextTextBlockTransitionProducerWorkV2 {
  const producerRan = terminal.terminalOutcome !== "producer-blocked"
    || (
      terminal.firstFailedEvaluation != null
      && terminal.firstFailedEvaluation.unit !== "evidence-producer-descriptors"
    )
    || terminal.completedWork.some((row) =>
      row.unit !== "evidence-producer-descriptors" && row.completedWork > 0
    )
  return freeze({
    requestedAtomCount:
      terminal.sourceMaterial.producerWorkCeilings.maximumRequestedAtomCount,
    requestedClusterCount:
      terminal.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount,
    consumedAtomCount: producerRan
      ? terminal.sourceMaterial.next.atoms.length
      : 0,
    consumedClusterCount: producerCompletedCount(terminal, "evidence-clusters"),
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: terminal.visitedEvidenceNodeCount,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
  })
}

function isExactProducerWorkLimitBlockedTerminal(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): boolean {
  const failed = terminal.firstFailedEvaluation
  if (
    terminal.terminalOutcome !== "producer-blocked"
    || failed == null
    || failed.attemptedWork !== failed.completedWork + 1
    || failed.effectiveLimit !== failed.completedWork
    || producerCompletedCount(terminal, failed.unit) !== failed.completedWork
    || terminal.completedWork.some((row) =>
      !Number.isSafeInteger(row.completedWork) || row.completedWork <= 0
    )
    || terminal.visitedEvidenceNodeCount !== terminal.completedWork.reduce(
      (sum, row) => sum + row.completedWork,
      0,
    )
  ) return false
  if (terminal.runtimeIdentity == null) {
    return failed.unit === "evidence-producer-descriptors"
      && failed.completedWork === 0
      && terminal.completedWork.length === 0
      && terminal.visitedEvidenceNodeCount === 0
  }
  return hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
    terminal.runtimeIdentity,
  )
}

function trustedResponseProducerWork(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): VNextTextBlockTransitionProducerWorkV2 | null {
  if (terminal.terminalOutcome !== "producer-response") return null
  return freeze({
    requestedAtomCount:
      terminal.sourceMaterial.producerWorkCeilings.maximumRequestedAtomCount,
    requestedClusterCount:
      terminal.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount,
    consumedAtomCount: terminal.sourceMaterial.next.atoms.length,
    consumedClusterCount: producerCompletedCount(terminal, "evidence-clusters"),
    // Exact Core requests require every segmentation context before success;
    // their final context is the full coverage range (or the sole shape range
    // when those ranges are equal), so a producer-response has no unused
    // coverage. Keeping this as a terminal invariant avoids doing unmetered
    // Source/style/range work while preserving exact fallback facts.
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: terminal.visitedEvidenceNodeCount,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
  })
}

function trustedTerminalProducerWork(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): VNextTextBlockTransitionProducerWorkV2 | null {
  return terminal.terminalOutcome === "producer-response"
    ? trustedResponseProducerWork(terminal)
    : trustedFailureProducerWork(terminal)
}

function authorizedCompletedWork(
  tuple: RequestTupleV2,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  producerWork: VNextTextBlockTransitionProducerWorkV2,
  meter: AuthorizedAcceptanceMeterV2,
): VNextTextBlockIncrementalCandidateWorkV1 {
  const base = tuple.completedCandidateWork
  const overrides = new Map<string, number>()
  for (const row of terminal.completedWork) overrides.set(row.unit, row.completedWork)
  for (const [unit, count] of Object.entries(meter.counts)) overrides.set(unit, count)
  const producerVisitedEvidenceNodeCount = terminal.completedWork.reduce(
    (sum, row) => sum + row.completedWork,
    0,
  )
  const acceptanceVisitedEvidenceNodeCount = Object.values(meter.counts).reduce(
    (sum, count) => sum + count,
    0,
  )
  return freeze({
    ...base,
    evidence: {
      ...base.evidence,
      consumedAtomCount: producerWork.consumedAtomCount,
      consumedClusterCount: producerWork.consumedClusterCount,
      unusedCoverageRenderedUtf16Length:
        producerWork.unusedCoverageRenderedUtf16Length,
      visitedEvidenceNodeCount:
        producerVisitedEvidenceNodeCount + acceptanceVisitedEvidenceNodeCount,
    },
    stageWork: base.stageWork.map((row) => freeze({
      ...row,
      count: overrides.get(row.unit) ?? row.count,
    })),
  })
}

function exactAuthorizedTuple(
  terminal: Readonly<AuthorityRecordSnapshotV2>,
): RequestTupleV2 | null {
  const tuple = requests.get(terminal.request)
  return tuple != null
      && tuple.previousRoot === terminal.previousRoot
      && tuple.change === terminal.change
      && tuple.request === terminal.request
      && tuple.sourceMaterial === terminal.sourceMaterial
    ? tuple
    : null
}

function authorizedEvidenceBlocked(
  tuple: RequestTupleV2 | null,
  terminal: Readonly<AuthorityRecordSnapshotV2> | null,
  meter: AuthorizedAcceptanceMeterV2 | null,
  message: string,
  producerWork: VNextTextBlockTransitionProducerWorkV2 | null = null,
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  return freeze({
    status: "blocked" as const,
    evidence: null,
    completedCandidateWork: tuple == null || terminal == null || meter == null
      ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
      : authorizedCompletedWork(
          tuple,
          terminal,
          producerWork ?? trustedTerminalProducerWork(terminal)
            ?? zeroAuthorizedProducerWork(tuple),
          meter,
        ),
    issues: freeze([issue(message)]),
  })
}

function authorizedFailureBlocked(
  tuple: RequestTupleV2 | null,
  terminal: Readonly<AuthorityRecordSnapshotV2> | null,
  meter: AuthorizedAcceptanceMeterV2 | null,
  message: string,
  producerWork: VNextTextBlockTransitionProducerWorkV2 | null = null,
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  return freeze({
    status: "blocked" as const,
    evaluatorOrProofAuthority: null,
    completedCandidateWork: tuple == null || terminal == null || meter == null
      ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
      : authorizedCompletedWork(
          tuple,
          terminal,
          producerWork ?? trustedTerminalProducerWork(terminal)
            ?? zeroAuthorizedProducerWork(tuple),
          meter,
        ),
    issues: freeze([issue(message)]),
  })
}

function registerAuthorizedFallbackAuthority(input: {
  readonly tuple: RequestTupleV2
  readonly terminal: Readonly<AuthorityRecordSnapshotV2>
  readonly meter: AuthorizedAcceptanceMeterV2
  readonly failureKind: AuthorizedFallbackAuthorityRecordInternalV2["failureKind"]
  readonly producerFailureCode:
    AuthorizedFallbackAuthorityRecordInternalV2["producerFailureCode"]
  readonly producerWork: VNextTextBlockTransitionProducerWorkV2
}):
  | {
      readonly status: "registered"
      readonly authority: object
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "registration-denied"
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    } {
  const registration = input.meter.before("evidence-acceptance-registrations")
  const completedCandidateWork = authorizedCompletedWork(
    input.tuple,
    input.terminal,
    input.producerWork,
    input.meter,
  )
  if (registration !== "charged") {
    return freeze({ status: "registration-denied" as const, completedCandidateWork })
  }
  const authority = freeze({})
  const acceptanceFailedEvaluation = input.meter.failure == null
    ? null
    : freeze({ ...input.meter.failure })
  const record = freeze({
    terminal: input.terminal,
    failureKind: input.failureKind,
    producerFailureCode: input.producerFailureCode,
    producerWork: freeze({ ...input.producerWork }),
    acceptanceFailedEvaluation,
    completedCandidateWork,
  })
  authorizedFallbackAuthorityRecords.set(authority, record)
  return freeze({ status: "registered" as const, authority, completedCandidateWork })
}

function authorizedEvidenceLimitFallback(
  tuple: RequestTupleV2,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  meter: AuthorizedAcceptanceMeterV2,
  producerWork: VNextTextBlockTransitionProducerWorkV2,
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const registration = registerAuthorizedFallbackAuthority({
    tuple,
    terminal,
    meter,
    failureKind: "acceptance-work-limit",
    producerFailureCode: null,
    producerWork,
  })
  if (registration.status !== "registered") {
    return authorizedEvidenceBlocked(
      tuple,
      terminal,
      meter,
      "fallback registration work limit was exceeded",
      producerWork,
    )
  }
  return freeze({
    status: "fallback-required" as const,
    evidence: null,
    evaluatorOrProofAuthority: registration.authority,
    completedCandidateWork: registration.completedCandidateWork,
    issues: freeze([]),
  })
}

function authorizedFailureLimitFallback(
  tuple: RequestTupleV2,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  meter: AuthorizedAcceptanceMeterV2,
  producerWork: VNextTextBlockTransitionProducerWorkV2,
  failureKind:
    | "acceptance-work-limit"
    | "producer-work-limit"
    | "producer-proof-failed",
  producerFailureCode: VNextTextBlockTransitionProducerFailureV2["code"] | null,
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  const registration = registerAuthorizedFallbackAuthority({
    tuple,
    terminal,
    meter,
    failureKind,
    producerFailureCode,
    producerWork,
  })
  if (registration.status !== "registered") {
    return authorizedFailureBlocked(
      tuple,
      terminal,
      meter,
      "fallback registration work limit was exceeded",
      producerWork,
    )
  }
  return freeze({
    status: "fallback-required" as const,
    evaluatorOrProofAuthority: registration.authority,
    completedCandidateWork: registration.completedCandidateWork,
    issues: freeze([]),
  })
}

function snapshotAuthorizedAcceptancePayload(
  value: unknown,
  meter: AuthorizedAcceptanceMeterV2,
  preserveExact: ReadonlySet<object>,
): AcceptanceSnapshotV2 {
  const descriptorMeter: AcceptanceMeterV2 = {
    count: 0,
    failureEvaluation: null,
    beforeObservation: () =>
      meter.before("evidence-acceptance-descriptors") === "charged",
  }
  return snapshotAcceptanceDataBeforeObservation(
    value,
    descriptorMeter,
    preserveExact,
  )
}

function authorizedComparison(
  meter: AuthorizedAcceptanceMeterV2,
  comparison: () => boolean,
): "match" | "mismatch" | "ceiling" | "meter-invalid" {
  const charge = meter.before("evidence-acceptance-comparisons")
  if (charge !== "charged") {
    return charge === "limit-exceeded" ? "ceiling" : "meter-invalid"
  }
  try {
    return comparison() ? "match" : "mismatch"
  } catch {
    return "mismatch"
  }
}

type AuthorizedSemanticOperationV2<T> =
  | { readonly status: "accepted"; readonly value: T }
  | { readonly status: "ceiling" | "meter-invalid" | "invalid" }

function authorizedSemanticOperation<T>(
  meter: AuthorizedAcceptanceMeterV2,
  operation: () => T,
): AuthorizedSemanticOperationV2<T> {
  const charge = meter.before("evidence-acceptance-comparisons")
  if (charge !== "charged") {
    return { status: charge === "limit-exceeded" ? "ceiling" : "meter-invalid" }
  }
  try {
    return { status: "accepted", value: operation() }
  } catch {
    return { status: "invalid" }
  }
}

function authorizedSemanticStatus<T>(
  operation: AuthorizedSemanticOperationV2<T>,
  message: string,
): Exclude<AuthorizedResponseValidationV2, { readonly status: "accepted" }> | null {
  if (operation.status === "accepted") return null
  if (operation.status === "invalid") return { status: "invalid", message }
  return { status: operation.status }
}

function authorizedExactKeys(
  meter: AuthorizedAcceptanceMeterV2,
  value: unknown,
  keys: readonly string[],
): "match" | "mismatch" | "ceiling" | "meter-invalid" {
  let checked = authorizedComparison(
    meter,
    () => value != null && typeof value === "object" && !Array.isArray(value),
  )
  if (checked !== "match") return checked
  checked = authorizedComparison(
    meter,
    () => {
      const prototype = Object.getPrototypeOf(value)
      return prototype === Object.prototype || prototype === null
    },
  )
  if (checked !== "match") return checked
  checked = authorizedComparison(
    meter,
    () => Object.getOwnPropertySymbols(value).length === 0,
  )
  if (checked !== "match") return checked
  const actualOperation = authorizedSemanticOperation(
    meter,
    () => Reflect.ownKeys(value as object),
  )
  if (actualOperation.status !== "accepted") {
    return actualOperation.status === "invalid"
      ? "mismatch"
      : actualOperation.status
  }
  const actual = actualOperation.value
  checked = authorizedComparison(meter, () => actual.length === keys.length)
  if (checked !== "match") return checked
  for (let index = 0; index < actual.length; index += 1) {
    const key = actual[index]
    checked = authorizedComparison(
      meter,
      () => typeof key === "string" && keys.includes(key),
    )
    if (checked !== "match") return checked
    const descriptorOperation = authorizedSemanticOperation(
      meter,
      () => Object.getOwnPropertyDescriptor(value as object, key),
    )
    if (descriptorOperation.status !== "accepted") {
      return descriptorOperation.status === "invalid"
        ? "mismatch"
        : descriptorOperation.status
    }
    const descriptor = descriptorOperation.value
    checked = authorizedComparison(
      meter,
      () => descriptor != null
        && Object.hasOwn(descriptor, "value")
        && descriptor.enumerable === true,
    )
    if (checked !== "match") return checked
  }
  return "match"
}

function chargeAuthorizedSemanticTree(
  meter: AuthorizedAcceptanceMeterV2,
  value: unknown,
  preserveExact: ReadonlySet<object> = new Set<object>(),
): "match" | "mismatch" | "ceiling" | "meter-invalid" {
  const charged = authorizedSemanticOperation(meter, () => value)
  if (charged.status !== "accepted") {
    return charged.status === "invalid" ? "mismatch" : charged.status
  }
  if (value == null || typeof value !== "object") return "match"
  if (preserveExact.has(value)) return "match"
  const keysOperation = authorizedSemanticOperation(
    meter,
    () => Reflect.ownKeys(value),
  )
  if (keysOperation.status !== "accepted") {
    return keysOperation.status === "invalid" ? "mismatch" : keysOperation.status
  }
  for (const key of keysOperation.value) {
    const descriptorOperation = authorizedSemanticOperation(
      meter,
      () => Object.getOwnPropertyDescriptor(value, key),
    )
    if (descriptorOperation.status !== "accepted") {
      return descriptorOperation.status === "invalid"
        ? "mismatch"
        : descriptorOperation.status
    }
    const descriptor = descriptorOperation.value
    if (descriptor == null || !Object.hasOwn(descriptor, "value")) return "mismatch"
    const child = chargeAuthorizedSemanticTree(
      meter,
      descriptor.value,
      preserveExact,
    )
    if (child !== "match") return child
  }
  return "match"
}

function authorizedCanonicalEqual(
  meter: AuthorizedAcceptanceMeterV2,
  left: unknown,
  right: unknown,
  preserveExact: ReadonlySet<object> = new Set<object>(),
): "match" | "mismatch" | "ceiling" | "meter-invalid" {
  const leftCharged = chargeAuthorizedSemanticTree(meter, left, preserveExact)
  if (leftCharged !== "match") return leftCharged
  const rightCharged = chargeAuthorizedSemanticTree(meter, right, preserveExact)
  if (rightCharged !== "match") return rightCharged
  return authorizedComparison(
    meter,
    () => stringifyVNextCanonicalJson(left) === stringifyVNextCanonicalJson(right),
  )
}

function coveredUtf16LengthAuthorized(
  meter: AuthorizedAcceptanceMeterV2,
  ranges: readonly { startRenderedUtf16: number; endRenderedUtf16: number }[],
): AuthorizedSemanticOperationV2<number> {
  const ordered: Array<{
    startRenderedUtf16: number
    endRenderedUtf16: number
  }> = []
  for (let index = 0; index < ranges.length; index += 1) {
    const rangeOperation = authorizedSemanticOperation(meter, () => ranges[index]!)
    if (rangeOperation.status !== "accepted") return rangeOperation
    const nonEmptyOperation = authorizedSemanticOperation(
      meter,
      () => rangeOperation.value.endRenderedUtf16
        > rangeOperation.value.startRenderedUtf16,
    )
    if (nonEmptyOperation.status !== "accepted") return nonEmptyOperation
    if (!nonEmptyOperation.value) continue
    const appendOperation = authorizedSemanticOperation(
      meter,
      () => ordered.push({ ...rangeOperation.value }),
    )
    if (appendOperation.status !== "accepted") return appendOperation
  }
  for (let index = 1; index < ordered.length; index += 1) {
    const currentOperation = authorizedSemanticOperation(meter, () => ordered[index]!)
    if (currentOperation.status !== "accepted") return currentOperation
    let position = index
    while (position > 0) {
      const previousOperation = authorizedSemanticOperation(
        meter,
        () => ordered[position - 1]!,
      )
      if (previousOperation.status !== "accepted") return previousOperation
      const compareOperation = authorizedSemanticOperation(meter, () =>
        previousOperation.value.startRenderedUtf16
          > currentOperation.value.startRenderedUtf16
        || (
          previousOperation.value.startRenderedUtf16
            === currentOperation.value.startRenderedUtf16
          && previousOperation.value.endRenderedUtf16
            > currentOperation.value.endRenderedUtf16
        ))
      if (compareOperation.status !== "accepted") return compareOperation
      if (!compareOperation.value) break
      const moveOperation = authorizedSemanticOperation(
        meter,
        () => { ordered[position] = previousOperation.value },
      )
      if (moveOperation.status !== "accepted") return moveOperation
      position -= 1
    }
    const insertOperation = authorizedSemanticOperation(
      meter,
      () => { ordered[position] = currentOperation.value },
    )
    if (insertOperation.status !== "accepted") return insertOperation
  }
  let total = 0
  let start = -1
  let end = -1
  for (let index = 0; index < ordered.length; index += 1) {
    const rangeOperation = authorizedSemanticOperation(meter, () => ordered[index]!)
    if (rangeOperation.status !== "accepted") return rangeOperation
    const range = rangeOperation.value
    if (start < 0) {
      const initializeOperation = authorizedSemanticOperation(meter, () => {
        start = range.startRenderedUtf16
        end = range.endRenderedUtf16
      })
      if (initializeOperation.status !== "accepted") return initializeOperation
      continue
    }
    const disjointOperation = authorizedSemanticOperation(
      meter,
      () => range.startRenderedUtf16 > end,
    )
    if (disjointOperation.status !== "accepted") return disjointOperation
    if (disjointOperation.value) {
      const accumulateOperation = authorizedSemanticOperation(meter, () => {
        total += end - start
        start = range.startRenderedUtf16
        end = range.endRenderedUtf16
      })
      if (accumulateOperation.status !== "accepted") return accumulateOperation
    } else {
      const extendOperation = authorizedSemanticOperation(
        meter,
        () => { end = Math.max(end, range.endRenderedUtf16) },
      )
      if (extendOperation.status !== "accepted") return extendOperation
    }
  }
  return authorizedSemanticOperation(
    meter,
    () => start < 0 ? 0 : total + end - start,
  )
}

function runAuthorizedComparisons(
  meter: AuthorizedAcceptanceMeterV2,
  comparisons: readonly (() => boolean)[],
): "match" | "mismatch" | "ceiling" | "meter-invalid" {
  for (const comparison of comparisons) {
    const result = authorizedComparison(meter, comparison)
    if (result !== "match") return result
  }
  return "match"
}

function responseValidationResult(
  result: "match" | "mismatch" | "ceiling" | "meter-invalid",
  message: string,
): Exclude<AuthorizedResponseValidationV2, { readonly status: "accepted" }> | null {
  if (result === "match") return null
  if (result === "mismatch") return { status: "invalid", message }
  return { status: result }
}

function validateAuthorizedResponse(
  response: unknown,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
  meter: AuthorizedAcceptanceMeterV2,
): AuthorizedResponseValidationV2 {
  const snapshot = snapshotAuthorizedAcceptancePayload(
    response,
    meter,
    new Set<object>([runtimeIdentity]),
  )
  if (snapshot.status === "ceiling") {
    return meter.failure?.status === "limit-exceeded"
      ? { status: "ceiling" }
      : { status: "meter-invalid" }
  }
  if (snapshot.status !== "accepted") {
    return { status: "invalid", message: "producer response is not exact descriptor-safe data" }
  }
  const value = snapshot.value
  const responseKeys = [
    "source", "contractVersion", "requestFingerprint", "sourceMaterialFingerprint",
    "runtimeIdentity", "nextEvidenceTargetRange", "shapingRuns", "breakOffsets",
    "shapingBoundaryProofs", "segmentationBoundaryProofs",
    "sourceTopologyFingerprint", "work", "contracts", "fingerprint",
  ]
  let compared = responseValidationResult(
    authorizedExactKeys(meter, value, responseKeys),
    "producer response is not exact descriptor-safe data",
  )
  if (compared != null) return compared
  const typed = value as unknown as VNextTextBlockTransitionProducerResponseV2
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.source === "vnext-text-block-transition-producer-response-v2",
      () => typed.contractVersion === 2,
      () => typed.requestFingerprint === terminal.request.fingerprint,
      () => typed.sourceMaterialFingerprint === terminal.sourceMaterial.fingerprint,
      () => typed.runtimeIdentity === runtimeIdentity,
      () => typed.sourceTopologyFingerprint
        === terminal.sourceMaterial.sourceTopologyFingerprint,
    ]),
    "producer response facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    authorizedCanonicalEqual(
      meter,
      typed.nextEvidenceTargetRange,
      terminal.request.next.evidenceTargetRange,
    ),
    "producer response facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    authorizedCanonicalEqual(meter, typed.contracts, CONTRACTS),
    "producer response facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    chargeAuthorizedSemanticTree(meter, typed.work),
    "producer response work is not exact data",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => workIsValid(typed.work, terminal.sourceMaterial),
      () => typed.work.visitedEvidenceNodeCount
        === terminal.visitedEvidenceNodeCount,
      () => Array.isArray(typed.shapingRuns),
      () => Array.isArray(typed.breakOffsets),
      () => Array.isArray(typed.shapingBoundaryProofs),
      () => Array.isArray(typed.segmentationBoundaryProofs),
    ]),
    "producer response facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  const facts = { ...typed } as Record<string, unknown>
  delete facts.fingerprint
  compared = responseValidationResult(
    chargeAuthorizedSemanticTree(
      meter,
      facts,
      new Set<object>([runtimeIdentity]),
    ),
    "producer response fingerprint facts are not exact data",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    authorizedComparison(meter, () => typed.fingerprint === fingerprint(facts)),
    "producer response facts do not match the exact terminal authority",
  )
  if (compared != null) return compared

  const targetStart = typed.nextEvidenceTargetRange.startRenderedUtf16
  const targetEnd = typed.nextEvidenceTargetRange.endRenderedUtf16
  const runs = typed.shapingRuns as readonly VNextTextBlockResolvedShapingRunV1[]
  type StyledAtom = Extract<
    (typeof terminal.sourceMaterial.next.atoms)[number],
    { readonly resolvedStyle: unknown }
  >
  type ResolvedStyle = StyledAtom["resolvedStyle"]
  const coverageStart = terminal.request.next.coverageRange.startRenderedUtf16
  let coverageText = ""
  for (
    let atomIndex = 0;
    atomIndex < terminal.sourceMaterial.next.atoms.length;
    atomIndex += 1
  ) {
    const atomOperation = authorizedSemanticOperation(
      meter,
      () => terminal.sourceMaterial.next.atoms[atomIndex]!,
    )
    if (atomOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        atomOperation,
        "Source atom traversal is invalid",
      )!
    }
    const appendOperation = authorizedSemanticOperation(
      meter,
      () => coverageText + atomOperation.value.renderedText,
    )
    if (appendOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        appendOperation,
        "Source atom text composition is invalid",
      )!
    }
    coverageText = appendOperation.value
  }
  const partitions: Array<{
    start: number
    end: number
    style: ResolvedStyle
    atomFingerprints: string[]
  }> = []
  for (
    let atomIndex = 0;
    atomIndex < terminal.sourceMaterial.next.atoms.length;
    atomIndex += 1
  ) {
    const atomOperation = authorizedSemanticOperation(
      meter,
      () => terminal.sourceMaterial.next.atoms[atomIndex]!,
    )
    if (atomOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        atomOperation,
        "Source atom partition traversal is invalid",
      )!
    }
    const atom = atomOperation.value
    const excludedOperation = authorizedSemanticOperation(
      meter,
      () => atom.kind === "hard-break" || atom.kind === "inline-image-boundary",
    )
    if (excludedOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        excludedOperation,
        "Source atom partition classification is invalid",
      )!
    }
    if (excludedOperation.value) continue
    const styledAtom = atom as StyledAtom
    const rangeOperation = authorizedSemanticOperation(meter, () => ({
      start: coverageStart + styledAtom.relativeStartRenderedUtf16,
      end: coverageStart + styledAtom.relativeEndRenderedUtf16,
    }))
    if (rangeOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        rangeOperation,
        "Source atom partition range is invalid",
      )!
    }
    const { start, end } = rangeOperation.value
    const previousOperation = authorizedSemanticOperation(
      meter,
      () => partitions.at(-1),
    )
    if (previousOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        previousOperation,
        "Source partition lookup is invalid",
      )!
    }
    const previous = previousOperation.value
    let extendsPrevious = false
    if (previous != null) {
      compared = responseValidationResult(
        authorizedComparison(meter, () => previous.end === start),
        "Source partition continuity is invalid",
      )
      if (compared?.status === "ceiling" || compared?.status === "meter-invalid") {
        return compared
      }
      if (compared == null) {
        const styleComparison = authorizedCanonicalEqual(
          meter,
          previous.style,
          styledAtom.resolvedStyle,
        )
        if (styleComparison === "ceiling" || styleComparison === "meter-invalid") {
          return { status: styleComparison }
        }
        extendsPrevious = styleComparison === "match"
      }
    }
    const constructionOperation = authorizedSemanticOperation(meter, () => {
      if (previous != null && extendsPrevious) {
        previous.end = end
        previous.atomFingerprints.push(styledAtom.fingerprint)
        return
      }
      partitions.push({
        start,
        end,
        style: styledAtom.resolvedStyle,
        atomFingerprints: [styledAtom.fingerprint],
      })
    })
    if (constructionOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        constructionOperation,
        "Source partition construction is invalid",
      )!
    }
  }
  const expected: Array<{
    partition: (typeof partitions)[number]
    start: number
    end: number
  }> = []
  for (let partitionIndex = 0; partitionIndex < partitions.length; partitionIndex += 1) {
    const partitionOperation = authorizedSemanticOperation(
      meter,
      () => partitions[partitionIndex]!,
    )
    if (partitionOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        partitionOperation,
        "Source partition traversal is invalid",
      )!
    }
    const partition = partitionOperation.value
    const clipOperation = authorizedSemanticOperation(meter, () => ({
      start: Math.max(partition.start, targetStart),
      end: Math.min(partition.end, targetEnd),
    }))
    if (clipOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        clipOperation,
        "Source partition clipping is invalid",
      )!
    }
    compared = responseValidationResult(
      authorizedComparison(
        meter,
        () => clipOperation.value.end > clipOperation.value.start,
      ),
      "Source partition clipping is empty",
    )
    if (compared?.status === "ceiling" || compared?.status === "meter-invalid") {
      return compared
    }
    if (compared == null) {
      const appendOperation = authorizedSemanticOperation(
        meter,
        () => expected.push({ partition, ...clipOperation.value }),
      )
      if (appendOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          appendOperation,
          "Source partition projection is invalid",
        )!
      }
    }
  }
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => runs.length === expected.length,
      () => typed.shapingBoundaryProofs.length === expected.length,
    ]),
    "shaping partitions do not match exact bounded Source styles",
  )
  if (compared != null) return compared

  let consumedClusterCount = 0
  for (let runIndex = 0; runIndex < runs.length; runIndex += 1) {
    const runOperation = authorizedSemanticOperation(meter, () => runs[runIndex]!)
    if (runOperation.status !== "accepted") {
      return authorizedSemanticStatus(runOperation, "shaping run traversal is invalid")!
    }
    const rowOperation = authorizedSemanticOperation(
      meter,
      () => expected[runIndex]!,
    )
    if (rowOperation.status !== "accepted") {
      return authorizedSemanticStatus(rowOperation, "Source partition traversal is invalid")!
    }
    const run = runOperation.value
    const row = rowOperation.value
    compared = responseValidationResult(
      authorizedExactKeys(meter, run, [
        "shapingRunId", "renderStartOffset", "renderEndOffset", "text",
        "styleKey", "fontFaceId", "fontSizeLayoutUnit", "textColor",
        "direction", "baselineShiftLayoutUnit", "features", "clusters",
      ]),
      "shaping run facts differ from exact bounded Source material",
    )
    if (compared != null) return compared
    const shapingRunIdFacts = {
      request: terminal.request.fingerprint,
      atoms: row.partition.atomFingerprints,
      runStart: row.start,
      runEnd: row.end,
    }
    compared = responseValidationResult(
      chargeAuthorizedSemanticTree(meter, shapingRunIdFacts),
      "shaping run identity facts are invalid",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => run.shapingRunId === fingerprint(shapingRunIdFacts),
        () => run.renderStartOffset === row.start,
        () => run.renderEndOffset === row.end,
        () => run.text === coverageText.slice(
          row.start - coverageStart,
          row.end - coverageStart,
        ),
        () => run.styleKey === row.partition.style.measurementStyleKey,
        () => run.fontFaceId === row.partition.style.fontFaceId,
        () => run.fontSizeLayoutUnit === row.partition.style.fontSizeLayoutUnit,
        () => run.textColor === row.partition.style.textColor,
        () => run.direction === "ltr",
        () => run.baselineShiftLayoutUnit === 0,
        () => Array.isArray(run.features),
        () => run.features.length === 0,
        () => Array.isArray(run.clusters),
        () => run.clusters.length > 0,
      ]),
      "shaping run facts differ from exact bounded Source material",
    )
    if (compared != null) return compared
    let clusterEnd = run.renderStartOffset
    for (let clusterIndex = 0; clusterIndex < run.clusters.length; clusterIndex += 1) {
      const clusterOperation = authorizedSemanticOperation(
        meter,
        () => run.clusters[clusterIndex]!,
      )
      if (clusterOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          clusterOperation,
          "shaping cluster traversal is invalid",
        )!
      }
      const cluster = clusterOperation.value
      compared = responseValidationResult(
        authorizedExactKeys(meter, cluster, [
          "index", "renderStartOffset", "renderEndOffset", "advanceLayoutUnit",
        ]),
        "shaping cluster facts are invalid",
      )
      if (compared != null) return compared
      compared = responseValidationResult(
        runAuthorizedComparisons(meter, [
          () => cluster.index === clusterIndex,
          () => cluster.renderStartOffset === clusterEnd,
          () => cluster.renderEndOffset > cluster.renderStartOffset,
          () => cluster.renderEndOffset <= run.renderEndOffset,
          () => Number.isSafeInteger(cluster.advanceLayoutUnit),
          () => cluster.advanceLayoutUnit >= 0,
        ]),
        "shaping cluster facts are invalid",
      )
      if (compared != null) return compared
      clusterEnd = cluster.renderEndOffset
    }
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => clusterEnd === run.renderEndOffset,
      ]),
      "shaping clusters do not cover the exact run",
    )
    if (compared != null) return compared
    const consumedClusterOperation = authorizedSemanticOperation(
      meter,
      () => consumedClusterCount + run.clusters.length,
    )
    if (consumedClusterOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        consumedClusterOperation,
        "consumed cluster aggregation is invalid",
      )!
    }
    consumedClusterCount = consumedClusterOperation.value
    const proofOperation = authorizedSemanticOperation(
      meter,
      () => typed.shapingBoundaryProofs[runIndex]!,
    )
    if (proofOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        proofOperation,
        "shaping proof traversal is invalid",
      )!
    }
    const proof = proofOperation.value
    const expectedVerificationOperation = authorizedSemanticOperation(meter, () => ({
      startRenderedUtf16: Math.max(
        row.partition.start,
        terminal.request.next.shapeVerificationRange.startRenderedUtf16,
      ),
      endRenderedUtf16: Math.min(
        row.partition.end,
        terminal.request.next.shapeVerificationRange.endRenderedUtf16,
      ),
    }))
    if (expectedVerificationOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        expectedVerificationOperation,
        "shaping verification range construction is invalid",
      )!
    }
    const expectedVerification = expectedVerificationOperation.value
    const expectedLeftOperation = authorizedSemanticOperation(
      meter,
      () => row.start === row.partition.start || row.start === coverageStart
        ? "exact-style-or-block-start" as const
        : "safe-first-target-glyph" as const,
    )
    if (expectedLeftOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        expectedLeftOperation,
        "left shaping boundary construction is invalid",
      )!
    }
    const expectedLeft = expectedLeftOperation.value
    const expectedRightOperation = authorizedSemanticOperation(
      meter,
      () => row.end === row.partition.end
        || row.end === coverageStart + coverageText.length
        ? "exact-style-or-block-end" as const
        : "safe-first-right-guard-glyph" as const,
    )
    if (expectedRightOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        expectedRightOperation,
        "right shaping boundary construction is invalid",
      )!
    }
    const expectedRight = expectedRightOperation.value
    compared = responseValidationResult(
      authorizedExactKeys(meter, proof, [
        "targetRange", "verificationRange", "leftBoundary", "rightBoundary",
        "guardGlyphCount", "inspectedGlyphCount", "fingerprint",
      ]),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedExactKeys(meter, proof.targetRange, [
        "startRenderedUtf16", "endRenderedUtf16",
      ]),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedExactKeys(meter, proof.verificationRange, [
        "startRenderedUtf16", "endRenderedUtf16",
      ]),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedCanonicalEqual(meter, proof.targetRange, {
        startRenderedUtf16: row.start,
        endRenderedUtf16: row.end,
      }),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedCanonicalEqual(meter, proof.verificationRange, expectedVerification),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => proof.leftBoundary === expectedLeft,
        () => proof.rightBoundary === expectedRight,
        () => Number.isSafeInteger(proof.guardGlyphCount),
        () => proof.guardGlyphCount >= 0,
        () => Number.isSafeInteger(proof.inspectedGlyphCount),
        () => proof.inspectedGlyphCount
          >= run.clusters.length + proof.guardGlyphCount,
      ]),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
    if (expectedRight === "safe-first-right-guard-glyph") {
      compared = responseValidationResult(
        authorizedComparison(meter, () => proof.guardGlyphCount >= 1),
        "shaping boundary proof differs from the exact partition",
      )
    }
    if (compared != null) return compared
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    compared = responseValidationResult(
      chargeAuthorizedSemanticTree(meter, proofFacts),
      "shaping boundary proof fingerprint facts are invalid",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedComparison(meter, () => proof.fingerprint === fingerprint(proofFacts)),
      "shaping boundary proof differs from the exact partition",
    )
    if (compared != null) return compared
  }

  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.segmentationBoundaryProofs.length
        === terminal.request.nextSegmentationContextRanges.length,
    ]),
    "segmentation proofs do not cover the exact requested contexts",
  )
  if (compared != null) return compared
  let stableTargetBreaks: readonly number[] | null = null
  for (
    let proofIndex = 0;
    proofIndex < typed.segmentationBoundaryProofs.length;
    proofIndex += 1
  ) {
    const proofOperation = authorizedSemanticOperation(
      meter,
      () => typed.segmentationBoundaryProofs[proofIndex]!,
    )
    if (proofOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        proofOperation,
        "segmentation proof traversal is invalid",
      )!
    }
    const contextOperation = authorizedSemanticOperation(
      meter,
      () => terminal.request.nextSegmentationContextRanges[proofIndex]!,
    )
    if (contextOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        contextOperation,
        "segmentation context traversal is invalid",
      )!
    }
    const proof = proofOperation.value
    const expectedContext = contextOperation.value
    const previousBreaks = stableTargetBreaks
    compared = responseValidationResult(
      authorizedExactKeys(meter, proof, [
        "contextRange", "contextBreakCount", "targetBreakOffsets",
        "inspectedOffsetCount", "fingerprint",
      ]),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedExactKeys(meter, proof.contextRange, [
        "startRenderedUtf16", "endRenderedUtf16",
      ]),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedCanonicalEqual(meter, proof.contextRange, expectedContext),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => Array.isArray(proof.targetBreakOffsets),
        () => Number.isSafeInteger(proof.contextBreakCount),
        () => proof.contextBreakCount >= proof.targetBreakOffsets.length,
      ]),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    for (
      let offsetIndex = 0;
      offsetIndex < proof.targetBreakOffsets.length;
      offsetIndex += 1
    ) {
      const offsetOperation = authorizedSemanticOperation(
        meter,
        () => proof.targetBreakOffsets[offsetIndex]!,
      )
      if (offsetOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          offsetOperation,
          "segmentation offset traversal is invalid",
        )!
      }
      const offset = offsetOperation.value
      compared = responseValidationResult(
        runAuthorizedComparisons(meter, [
          () => Number.isSafeInteger(offset),
          () => offset >= targetStart,
          () => offset <= targetEnd,
        ]),
        "segmentation proof differs from the exact bounded attempt",
      )
      if (compared != null) return compared
      if (offsetIndex > 0) {
        const previousOffsetOperation = authorizedSemanticOperation(
          meter,
          () => proof.targetBreakOffsets[offsetIndex - 1]!,
        )
        if (previousOffsetOperation.status !== "accepted") {
          return authorizedSemanticStatus(
            previousOffsetOperation,
            "previous segmentation offset traversal is invalid",
          )!
        }
        compared = responseValidationResult(
          authorizedComparison(
            meter,
            () => offset > previousOffsetOperation.value,
          ),
          "segmentation proof differs from the exact bounded attempt",
        )
        if (compared != null) return compared
      }
    }
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => Number.isSafeInteger(proof.inspectedOffsetCount),
        () => proof.inspectedOffsetCount
          === 2 * proof.contextBreakCount + 2 * proof.targetBreakOffsets.length,
      ]),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    compared = responseValidationResult(
      chargeAuthorizedSemanticTree(meter, proofFacts),
      "segmentation proof fingerprint facts are invalid",
    )
    if (compared != null) return compared
    compared = responseValidationResult(
      authorizedComparison(meter, () => proof.fingerprint === fingerprint(proofFacts)),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    if (previousBreaks != null) {
      compared = responseValidationResult(
        authorizedCanonicalEqual(
          meter,
          proof.targetBreakOffsets,
          previousBreaks,
        ),
        "segmentation proof differs from the exact bounded attempt",
      )
      if (compared != null) return compared
    }
    const stableAssignment = authorizedSemanticOperation(
      meter,
      () => proof.targetBreakOffsets,
    )
    if (stableAssignment.status !== "accepted") {
      return authorizedSemanticStatus(
        stableAssignment,
        "stable segmentation assignment is invalid",
      )!
    }
    stableTargetBreaks = stableAssignment.value
  }
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.segmentationBoundaryProofs.length
        >= terminal.request.requiredStableSegmentationExpansionCount,
      () => stableTargetBreaks != null,
    ]),
    "segmentation proofs or break offsets are invalid",
  )
  if (compared != null) return compared
  if (stableTargetBreaks == null) {
    return { status: "invalid", message: "segmentation proof is missing" }
  }
  for (let offsetIndex = 0; offsetIndex < typed.breakOffsets.length; offsetIndex += 1) {
    const offsetOperation = authorizedSemanticOperation(
      meter,
      () => typed.breakOffsets[offsetIndex]!,
    )
    if (offsetOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        offsetOperation,
        "break offset traversal is invalid",
      )!
    }
    const offset = offsetOperation.value
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => Number.isSafeInteger(offset),
        () => offset >= targetStart,
        () => offset <= targetEnd,
      ]),
      "segmentation proofs or break offsets are invalid",
    )
    if (compared != null) return compared
    if (offsetIndex > 0) {
      const previousOffsetOperation = authorizedSemanticOperation(
        meter,
        () => typed.breakOffsets[offsetIndex - 1]!,
      )
      if (previousOffsetOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          previousOffsetOperation,
          "previous break offset traversal is invalid",
        )!
      }
      compared = responseValidationResult(
        authorizedComparison(meter, () => offset > previousOffsetOperation.value),
        "segmentation proofs or break offsets are invalid",
      )
      if (compared != null) return compared
    }
  }
  const hardBreaks: number[] = []
  for (
    let atomIndex = 0;
    atomIndex < terminal.sourceMaterial.next.atoms.length;
    atomIndex += 1
  ) {
    const atomOperation = authorizedSemanticOperation(
      meter,
      () => terminal.sourceMaterial.next.atoms[atomIndex]!,
    )
    if (atomOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        atomOperation,
        "hard-break Source atom traversal is invalid",
      )!
    }
    const hardBreakOperation = authorizedSemanticOperation(
      meter,
      () => atomOperation.value.kind === "hard-break",
    )
    if (hardBreakOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        hardBreakOperation,
        "hard-break Source atom filtering is invalid",
      )!
    }
    if (!hardBreakOperation.value) continue
    const offsetOperation = authorizedSemanticOperation(
      meter,
      () => coverageStart + atomOperation.value.relativeEndRenderedUtf16,
    )
    if (offsetOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        offsetOperation,
        "hard-break offset construction is invalid",
      )!
    }
    const lowerBoundOperation = authorizedSemanticOperation(
      meter,
      () => offsetOperation.value >= targetStart,
    )
    if (lowerBoundOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        lowerBoundOperation,
        "hard-break lower-bound filtering is invalid",
      )!
    }
    if (!lowerBoundOperation.value) continue
    const upperBoundOperation = authorizedSemanticOperation(
      meter,
      () => offsetOperation.value <= targetEnd,
    )
    if (upperBoundOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        upperBoundOperation,
        "hard-break upper-bound filtering is invalid",
      )!
    }
    if (!upperBoundOperation.value) continue
    const appendOperation = authorizedSemanticOperation(
      meter,
      () => hardBreaks.push(offsetOperation.value),
    )
    if (appendOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        appendOperation,
        "hard-break collection is invalid",
      )!
    }
  }
  const expectedBreakOffsets: number[] = []
  const seenBreakOffsets = new Set<number>()
  const breakSources = [stableTargetBreaks, hardBreaks] as const
  for (let sourceIndex = 0; sourceIndex < breakSources.length; sourceIndex += 1) {
    const sourceOperation = authorizedSemanticOperation(
      meter,
      () => breakSources[sourceIndex],
    )
    if (sourceOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        sourceOperation,
        "break-offset source traversal is invalid",
      )!
    }
    const source = sourceOperation.value
    for (let offsetIndex = 0; offsetIndex < source.length; offsetIndex += 1) {
      const offsetOperation = authorizedSemanticOperation(
        meter,
        () => source[offsetIndex]!,
      )
      if (offsetOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          offsetOperation,
          "break-offset set traversal is invalid",
        )!
      }
      const presentOperation = authorizedSemanticOperation(
        meter,
        () => seenBreakOffsets.has(offsetOperation.value),
      )
      if (presentOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          presentOperation,
          "break-offset set lookup is invalid",
        )!
      }
      if (presentOperation.value) continue
      const addOperation = authorizedSemanticOperation(meter, () => {
        seenBreakOffsets.add(offsetOperation.value)
        expectedBreakOffsets.push(offsetOperation.value)
      })
      if (addOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          addOperation,
          "break-offset set insertion is invalid",
        )!
      }
    }
  }
  for (let index = 1; index < expectedBreakOffsets.length; index += 1) {
    const currentOperation = authorizedSemanticOperation(
      meter,
      () => expectedBreakOffsets[index]!,
    )
    if (currentOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        currentOperation,
        "break-offset sort traversal is invalid",
      )!
    }
    let position = index
    while (position > 0) {
      const previousOperation = authorizedSemanticOperation(
        meter,
        () => expectedBreakOffsets[position - 1]!,
      )
      if (previousOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          previousOperation,
          "break-offset sort comparison traversal is invalid",
        )!
      }
      const orderedOperation = authorizedSemanticOperation(
        meter,
        () => previousOperation.value <= currentOperation.value,
      )
      if (orderedOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          orderedOperation,
          "break-offset sorting is invalid",
        )!
      }
      if (orderedOperation.value) break
      const moveOperation = authorizedSemanticOperation(
        meter,
        () => { expectedBreakOffsets[position] = previousOperation.value },
      )
      if (moveOperation.status !== "accepted") {
        return authorizedSemanticStatus(
          moveOperation,
          "break-offset sorting is invalid",
        )!
      }
      position -= 1
    }
    const insertOperation = authorizedSemanticOperation(
      meter,
      () => { expectedBreakOffsets[position] = currentOperation.value },
    )
    if (insertOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        insertOperation,
        "break-offset sorting is invalid",
      )!
    }
  }
  const coverageRanges: Array<{
    startRenderedUtf16: number
    endRenderedUtf16: number
  }> = []
  for (
    let proofIndex = 0;
    proofIndex < typed.shapingBoundaryProofs.length;
    proofIndex += 1
  ) {
    const rangeOperation = authorizedSemanticOperation(
      meter,
      () => typed.shapingBoundaryProofs[proofIndex]!.verificationRange,
    )
    if (rangeOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        rangeOperation,
        "shaping coverage traversal is invalid",
      )!
    }
    const appendOperation = authorizedSemanticOperation(
      meter,
      () => coverageRanges.push(rangeOperation.value),
    )
    if (appendOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        appendOperation,
        "shaping coverage collection is invalid",
      )!
    }
  }
  for (
    let contextIndex = 0;
    contextIndex < terminal.request.nextSegmentationContextRanges.length;
    contextIndex += 1
  ) {
    const rangeOperation = authorizedSemanticOperation(
      meter,
      () => terminal.request.nextSegmentationContextRanges[contextIndex]!,
    )
    if (rangeOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        rangeOperation,
        "segmentation coverage traversal is invalid",
      )!
    }
    const appendOperation = authorizedSemanticOperation(
      meter,
      () => coverageRanges.push(rangeOperation.value),
    )
    if (appendOperation.status !== "accepted") {
      return authorizedSemanticStatus(
        appendOperation,
        "segmentation coverage collection is invalid",
      )!
    }
  }
  const coverageOperation = coveredUtf16LengthAuthorized(meter, coverageRanges)
  if (coverageOperation.status !== "accepted") {
    return authorizedSemanticStatus(
      coverageOperation,
      "coverage union is invalid",
    )!
  }
  const exactUnusedCoverageOperation = authorizedSemanticOperation(
    meter,
    () => terminal.request.next.coverageRange.endRenderedUtf16
      - terminal.request.next.coverageRange.startRenderedUtf16
      - coverageOperation.value,
  )
  if (exactUnusedCoverageOperation.status !== "accepted") {
    return authorizedSemanticStatus(
      exactUnusedCoverageOperation,
      "unused coverage calculation is invalid",
    )!
  }
  const exactUnusedCoverage = exactUnusedCoverageOperation.value
  compared = responseValidationResult(
    authorizedCanonicalEqual(meter, typed.breakOffsets, expectedBreakOffsets),
    "producer work does not match exact response/material facts",
  )
  if (compared != null) return compared
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.work.consumedAtomCount
        === terminal.sourceMaterial.next.atoms.length,
      () => typed.work.consumedClusterCount === consumedClusterCount,
      () => typed.work.unusedCoverageRenderedUtf16Length === exactUnusedCoverage,
    ]),
    "producer work does not match exact response/material facts",
  )
  return compared ?? { status: "accepted", response: typed }
}

function failureValidationResult(
  result: "match" | "mismatch" | "ceiling" | "meter-invalid",
  message: string,
): Exclude<AuthorizedFailureValidationV2, { readonly status: "accepted" }> | null {
  if (result === "match") return null
  if (result === "mismatch") return { status: "invalid", message }
  return { status: result }
}

function validateAuthorizedFailure(
  value: unknown,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
  meter: AuthorizedAcceptanceMeterV2,
): AuthorizedFailureValidationV2 {
  const trustedWork = trustedFailureProducerWork(terminal)
  if (terminal.terminalOutcome === "producer-blocked") {
    const compared = failureValidationResult(
      runAuthorizedComparisons(meter, [
        () => value == null,
        () => isExactProducerWorkLimitBlockedTerminal(terminal),
      ]),
      "producer-blocked terminal is not an exact producer work-limit ceiling",
    )
    return compared ?? { status: "accepted", failure: null, work: trustedWork }
  }
  const snapshot = snapshotAuthorizedAcceptancePayload(
    value,
    meter,
    new Set<object>([runtimeIdentity]),
  )
  if (snapshot.status === "ceiling") {
    return meter.failure?.status === "limit-exceeded"
      ? { status: "ceiling" }
      : { status: "meter-invalid" }
  }
  if (snapshot.status !== "accepted") {
    return { status: "invalid", message: "producer failure is not exact descriptor-safe data" }
  }
  const failure = snapshot.value
  let compared = failureValidationResult(
    authorizedExactKeys(meter, failure, [
      "source", "contractVersion", "requestFingerprint",
      "sourceMaterialFingerprint", "runtimeIdentity", "code", "completedWork",
      "contracts", "fingerprint",
    ]),
    "producer failure is not exact descriptor-safe data",
  )
  if (compared != null) return compared
  const typed = failure as unknown as VNextTextBlockTransitionProducerFailureV2
  const codes = [
    "invalid-request-scoped-material", "pinned-font-unavailable",
    "pinned-font-mismatch", "unsafe-shaping-boundary", "segmentation-not-stable",
    "missing-glyph", "unsafe-runtime-arithmetic", "work-ceiling-before-visit",
  ]
  compared = failureValidationResult(
    authorizedExactKeys(meter, typed.completedWork, [
      "requestedAtomCount", "requestedClusterCount", "consumedAtomCount",
      "consumedClusterCount", "unusedCoverageRenderedUtf16Length",
      "visitedEvidenceNodeCount", "completeNextInputTraversalCount",
      "completeNextInputComparisonCount",
    ]),
    "producer failure work is not exact data",
  )
  if (compared != null) return compared
  compared = failureValidationResult(
    chargeAuthorizedSemanticTree(meter, typed.completedWork),
    "producer failure work is not exact data",
  )
  if (compared != null) return compared
  compared = failureValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.source === "vnext-text-block-transition-producer-failure-v2",
      () => typed.contractVersion === 2,
      () => typed.requestFingerprint === terminal.request.fingerprint,
      () => typed.sourceMaterialFingerprint === terminal.sourceMaterial.fingerprint,
      () => typed.runtimeIdentity === runtimeIdentity,
      () => codes.includes(typed.code),
      () => workIsValid(typed.completedWork, terminal.sourceMaterial),
      () => typed.completedWork.requestedAtomCount
        === trustedWork.requestedAtomCount,
      () => typed.completedWork.requestedClusterCount
        === trustedWork.requestedClusterCount,
      () => typed.completedWork.consumedAtomCount
        === trustedWork.consumedAtomCount,
      () => typed.completedWork.consumedClusterCount
        === trustedWork.consumedClusterCount,
      () => typed.completedWork.unusedCoverageRenderedUtf16Length
        === trustedWork.unusedCoverageRenderedUtf16Length,
      () => typed.completedWork.visitedEvidenceNodeCount
        === trustedWork.visitedEvidenceNodeCount,
      () => typed.completedWork.completeNextInputTraversalCount
        === trustedWork.completeNextInputTraversalCount,
      () => typed.completedWork.completeNextInputComparisonCount
        === trustedWork.completeNextInputComparisonCount,
      () => typed.code !== "invalid-request-scoped-material",
    ]),
    "producer failure facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  compared = failureValidationResult(
    authorizedCanonicalEqual(meter, typed.contracts, CONTRACTS),
    "producer failure facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  const failureFacts = { ...typed } as Record<string, unknown>
  delete failureFacts.fingerprint
  compared = failureValidationResult(
    chargeAuthorizedSemanticTree(
      meter,
      failureFacts,
      new Set<object>([runtimeIdentity]),
    ),
    "producer failure fingerprint facts are not exact data",
  )
  if (compared != null) return compared
  compared = failureValidationResult(
    authorizedComparison(
      meter,
      () => typed.fingerprint === fingerprint(failureFacts),
    ),
    "producer failure facts do not match the exact terminal authority",
  )
  if (compared != null) return compared
  const failed = terminal.firstFailedEvaluation
  if (typed.code === "work-ceiling-before-visit") {
    compared = failureValidationResult(
      runAuthorizedComparisons(meter, [
        () => failed != null,
        () => failed?.attemptedWork === (failed?.completedWork ?? -2) + 1,
        () => failed?.effectiveLimit === failed?.completedWork,
        () => failed == null
          || producerCompletedCount(terminal, failed.unit) === failed.completedWork,
      ]),
      "work-limit failure does not match the exact failed terminal evaluation",
    )
  } else {
    compared = failureValidationResult(
      runAuthorizedComparisons(meter, [
        () => failed == null,
        () => typed.completedWork.consumedAtomCount
          === terminal.sourceMaterial.next.atoms.length,
      ]),
      "non-ceiling failure cannot impersonate a work-limit terminal",
    )
  }
  return compared ?? { status: "accepted", failure: typed, work: trustedWork }
}

function consumeAuthorizedProducerTerminal(
  input: AuthorizedAcceptanceInputV2,
  expected:
    | "producer-response"
    | "producer-failure-or-blocked",
): Readonly<AuthorityRecordSnapshotV2> | null {
  if (expected === "producer-response") {
    const consumed =
      consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
        authority: input.producerInvocationAuthority,
        request: input.request,
        sourceMaterial: input.sourceMaterial,
        expectedTerminal: "producer-response",
      })
    return consumed.status === "consumed" ? consumed.snapshot : null
  }
  const failure =
    consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
      authority: input.producerInvocationAuthority,
      request: input.request,
      sourceMaterial: input.sourceMaterial,
      expectedTerminal: "producer-failure",
    })
  if (failure.status === "consumed") return failure.snapshot
  const blocked =
    consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
      authority: input.producerInvocationAuthority,
      request: input.request,
      sourceMaterial: input.sourceMaterial,
      expectedTerminal: "producer-blocked",
    })
  return blocked.status === "consumed" ? blocked.snapshot : null
}

function exactAuthorizedAcceptanceContext(
  input: AuthorizedAcceptanceInputV2,
  expected: "producer-response" | "producer-failure-or-blocked",
):
  | {
      readonly status: "accepted"
      readonly terminal: Readonly<AuthorityRecordSnapshotV2>
      readonly tuple: RequestTupleV2
      readonly meter: AuthorizedAcceptanceMeterV2
    }
  | {
      readonly status: "rejected"
      readonly terminal: Readonly<AuthorityRecordSnapshotV2> | null
      readonly tuple: RequestTupleV2 | null
      readonly meter: AuthorizedAcceptanceMeterV2 | null
      readonly message: string
    }
  | {
      readonly status: "ceiling" | "meter-invalid"
      readonly terminal: Readonly<AuthorityRecordSnapshotV2>
      readonly tuple: RequestTupleV2
      readonly meter: AuthorizedAcceptanceMeterV2
    } {
  const terminal = consumeAuthorizedProducerTerminal(input, expected)
  if (terminal == null) {
    return {
      status: "rejected",
      terminal: null,
      tuple: null,
      meter: null,
      message: "producer invocation authority is not the exact terminal Core record",
    }
  }
  const meter = createAuthorizedAcceptanceMeter(terminal)
  const descriptorCharge = meter.before("evidence-acceptance-descriptors")
  const tuple = exactAuthorizedTuple(terminal)
  if (tuple == null) {
    return {
      status: "rejected",
      terminal,
      tuple: null,
      meter,
      message: "consumed producer authority has no exact Core request tuple",
    }
  }
  if (descriptorCharge !== "charged") {
    return {
      status: descriptorCharge === "limit-exceeded" ? "ceiling" : "meter-invalid",
      terminal,
      tuple,
      meter,
    }
  }
  if (
    terminal.previousRoot !== input.previousRoot
    || terminal.change !== input.change
    || terminal.request !== input.request
    || terminal.sourceMaterial !== input.sourceMaterial
  ) {
    return {
      status: "rejected",
      terminal,
      tuple,
      meter,
      message: "acceptance tuple differs from the consumed terminal authority",
    }
  }
  if (terminal.runtimeIdentity != null) {
    if (terminal.runtimeIdentity !== input.producerRuntimeIdentity) {
      return {
        status: "rejected",
        terminal,
        tuple,
        meter,
        message: "producer runtime differs from the consumed terminal authority",
      }
    }
  } else if (
    !hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
      input.producerRuntimeIdentity,
    )
    || input.producerRuntimeIdentity.unitPolicyFingerprint
      !== terminal.request.layoutUnitPolicyFingerprint
    || input.producerRuntimeIdentity.fontStyleUnitDependencyFingerprint
      !== terminal.request.fontStyleUnitDependencyFingerprint
    || input.producerRuntimeIdentity.producerRuntimeRequirementFingerprint
      !== terminal.request.producerRuntimeRequirementFingerprint
  ) {
    return {
      status: "rejected",
      terminal,
      tuple,
      meter,
      message: "producer runtime cannot accompany the pre-bind terminal authority",
    }
  }
  return { status: "accepted", terminal, tuple, meter }
}

export function acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2(
  input: AuthorizedAcceptanceInputV2,
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const context = exactAuthorizedAcceptanceContext(input, "producer-response")
  if (context.status === "rejected") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      context.message,
    )
  }
  if (context.status === "ceiling") {
    const producerWork = trustedResponseProducerWork(context.terminal)
    if (producerWork == null) {
      return authorizedEvidenceBlocked(
        context.tuple,
        context.terminal,
        context.meter,
        "consumed response terminal has no exact producer work facts",
      )
    }
    return authorizedEvidenceLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      producerWork,
    )
  }
  if (context.status === "meter-invalid") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "acceptance descriptor policy is unavailable",
    )
  }
  const validation = validateAuthorizedResponse(
    input.responseOrFailure,
    context.terminal,
    input.producerRuntimeIdentity,
    context.meter,
  )
  if (validation.status === "ceiling") {
    const producerWork = trustedResponseProducerWork(context.terminal)
    if (producerWork == null) {
      return authorizedEvidenceBlocked(
        context.tuple,
        context.terminal,
        context.meter,
        "consumed response terminal has no exact producer work facts",
      )
    }
    return authorizedEvidenceLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      producerWork,
    )
  }
  if (validation.status === "meter-invalid") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "acceptance comparison policy is unavailable",
    )
  }
  if (validation.status === "invalid") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      validation.message,
      trustedResponseProducerWork(context.terminal),
    )
  }
  const registration = context.meter.before("evidence-acceptance-registrations")
  if (registration === "limit-exceeded") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "Evidence registration work limit was exceeded",
      validation.response.work,
    )
  }
  if (registration !== "charged") {
    return authorizedEvidenceBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "Evidence registration policy is unavailable",
    )
  }
  const evidenceFacts = {
    source: "vnext-text-block-transition-evidence-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: context.terminal.request.fingerprint,
    sourceMaterialFingerprint: context.terminal.sourceMaterial.fingerprint,
    previousRootFingerprint: context.terminal.previousRoot.fingerprint,
    changeFingerprint: context.terminal.request.changeFingerprint,
    runtimeIdentityFingerprint: input.producerRuntimeIdentity.fingerprint,
    nextEvidenceTargetRange: validation.response.nextEvidenceTargetRange,
    shapingRuns: validation.response.shapingRuns,
    breakOffsets: validation.response.breakOffsets,
    shapingBoundaryProofs: validation.response.shapingBoundaryProofs,
    segmentationBoundaryProofs: validation.response.segmentationBoundaryProofs,
    sourceTopologyFingerprint: validation.response.sourceTopologyFingerprint,
    work: validation.response.work,
  }
  const evidence: VNextTextBlockTransitionEvidenceV2 = freeze({
    ...evidenceFacts,
    fingerprint: fingerprint(evidenceFacts),
  })
  const acceptedWork = authorizedCompletedWork(
    context.tuple,
    context.terminal,
    validation.response.work,
    context.meter,
  )
  evidenceRecords.set(evidence, context.tuple)
  evidenceCompletedWorkRecords.set(evidence, acceptedWork)
  return freeze({
    status: "accepted" as const,
    evidence,
    completedCandidateWork: acceptedWork,
    issues: freeze([]),
  })
}

export function acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2(
  input: AuthorizedAcceptanceInputV2,
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  const context = exactAuthorizedAcceptanceContext(
    input,
    "producer-failure-or-blocked",
  )
  if (context.status === "rejected") {
    return authorizedFailureBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      context.message,
    )
  }
  if (context.status === "ceiling") {
    if (
      context.terminal.terminalOutcome === "producer-blocked"
      && !isExactProducerWorkLimitBlockedTerminal(context.terminal)
    ) {
      return authorizedFailureBlocked(
        context.tuple,
        context.terminal,
        context.meter,
        "producer-blocked terminal is not an exact producer work-limit ceiling",
        trustedFailureProducerWork(context.terminal),
      )
    }
    return authorizedFailureLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      trustedFailureProducerWork(context.terminal),
      context.terminal.terminalOutcome === "producer-blocked"
        ? "producer-work-limit"
        : "acceptance-work-limit",
      context.terminal.terminalOutcome === "producer-blocked"
        ? "work-ceiling-before-visit"
        : null,
    )
  }
  if (context.status === "meter-invalid") {
    return authorizedFailureBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "failure acceptance descriptor policy is unavailable",
    )
  }
  const validation = validateAuthorizedFailure(
    input.responseOrFailure,
    context.terminal,
    input.producerRuntimeIdentity,
    context.meter,
  )
  if (validation.status === "ceiling") {
    if (
      context.terminal.terminalOutcome === "producer-blocked"
      && !isExactProducerWorkLimitBlockedTerminal(context.terminal)
    ) {
      return authorizedFailureBlocked(
        context.tuple,
        context.terminal,
        context.meter,
        "producer-blocked terminal is not an exact producer work-limit ceiling",
        trustedFailureProducerWork(context.terminal),
      )
    }
    return authorizedFailureLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      trustedFailureProducerWork(context.terminal),
      context.terminal.terminalOutcome === "producer-blocked"
        ? "producer-work-limit"
        : "acceptance-work-limit",
      context.terminal.terminalOutcome === "producer-blocked"
        ? "work-ceiling-before-visit"
        : null,
    )
  }
  if (validation.status === "meter-invalid") {
    return authorizedFailureBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "failure acceptance comparison policy is unavailable",
    )
  }
  if (validation.status === "invalid") {
    return authorizedFailureBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      validation.message,
      trustedFailureProducerWork(context.terminal),
    )
  }
  return authorizedFailureLimitFallback(
    context.tuple,
    context.terminal,
    context.meter,
    validation.work,
    validation.failure?.code === "work-ceiling-before-visit"
      || context.terminal.terminalOutcome === "producer-blocked"
      ? "producer-work-limit"
      : "producer-proof-failed",
    validation.failure?.code ?? "work-ceiling-before-visit",
  )
}
