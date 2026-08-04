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
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
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

function safeDataTree(value: unknown, seen = new Set<object>()): boolean {
  if (value == null || typeof value === "string" || typeof value === "boolean") return true
  if (typeof value === "number") return Number.isSafeInteger(value)
  if (typeof value !== "object" || seen.has(value)) return false
  seen.add(value)
  try {
    try {
      const prototype = Object.getPrototypeOf(value)
      if (Array.isArray(value)) {
        if (prototype !== Array.prototype || Object.getOwnPropertySymbols(value).length !== 0) return false
        const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
        if (lengthDescriptor == null || !Object.hasOwn(lengthDescriptor, "value") || !Number.isSafeInteger(lengthDescriptor.value)) return false
        if (Reflect.ownKeys(value).length !== lengthDescriptor.value + 1) return false
        for (let index = 0; index < lengthDescriptor.value; index += 1) {
          const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
          if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
        }
        return true
      }
      if (prototype !== Object.prototype && prototype !== null) return false
      if (Object.getOwnPropertySymbols(value).length !== 0) return false
      for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== "string") return false
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
      }
      return true
    } finally {
      seen.delete(value)
    }
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

function createAcceptanceMeter(
  evaluator: (attemptedWork: number) => VNextTextBlockStageWorkLimitEvaluationV1,
): AcceptanceMeterV2 {
  const meter: AcceptanceMeterV2 = {
    count: 0,
    failureEvaluation: null,
    beforeObservation() {
      const evaluation = evaluator(meter.count + 1)
      if (evaluation.status !== "within-limit") {
        meter.failureEvaluation = evaluation
        return false
      }
      meter.count = evaluation.attemptedWork
      return true
    },
  }
  return meter
}

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
const acceptanceEvaluators = new WeakMap<
  object,
  (attemptedWork: number) => VNextTextBlockStageWorkLimitEvaluationV1
>()
const evidenceRecords = new WeakMap<object, RequestTupleV2>()
const evidenceCompletedWorkRecords = new WeakMap<object, VNextTextBlockIncrementalCandidateWorkV1>()
const failureAuthorities = new WeakMap<object, RequestTupleV2>()

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
    const previousSummaryBase = input.previousRoot.sourceState.summary.itemCount
    const workPolicy = input.previousRoot.workPolicy
    acceptanceEvaluators.set(result.request, (attemptedWork) =>
      evaluateVNextTextBlockStageWorkLimitInternalV1({
        policy: workPolicy,
        stage: "evidence",
        unit: "evidence-response-nodes",
        previousSummaryBase,
        exactValidatedChangeDelta: 1,
        attemptedWork,
      }))
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

function tupleFor(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockUnifiedLayoutChangeV1
  request: VNextTextBlockTransitionEvidenceRequestV2
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
}): RequestTupleV2 | null {
  const tuple = requests.get(input.request)
  return tuple != null
      && tuple.previousRoot === input.previousRoot
      && tuple.change === input.change
      && tuple.sourceMaterial === input.sourceMaterial
      && hasRegisteredVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
        input.producerRuntimeIdentity,
      )
      && input.producerRuntimeIdentity.fontStyleUnitDependencyFingerprint === input.request.fontStyleUnitDependencyFingerprint
      && input.producerRuntimeIdentity.producerRuntimeRequirementFingerprint === input.request.producerRuntimeRequirementFingerprint
      && input.producerRuntimeIdentity.unitPolicyFingerprint === input.request.layoutUnitPolicyFingerprint
    ? tuple
    : null
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

function coveredUtf16Length(ranges: readonly { startRenderedUtf16: number; endRenderedUtf16: number }[]): number {
  const ordered = ranges.filter((range) => range.endRenderedUtf16 > range.startRenderedUtf16).map((range) => ({ ...range })).sort((left, right) => left.startRenderedUtf16 - right.startRenderedUtf16 || left.endRenderedUtf16 - right.endRenderedUtf16)
  let total = 0
  let start = -1
  let end = -1
  for (const range of ordered) {
    if (start < 0) { start = range.startRenderedUtf16; end = range.endRenderedUtf16; continue }
    if (range.startRenderedUtf16 > end) { total += end - start; start = range.startRenderedUtf16; end = range.endRenderedUtf16 }
    else end = Math.max(end, range.endRenderedUtf16)
  }
  return start < 0 ? 0 : total + end - start
}

/* Task 5 removes this compatibility-only count when the public raw path delegates. */
function legacyPublicDescriptorObservationCount(value: unknown): number {
  if (value == null || typeof value !== "object") return 0
  if (Array.isArray(value)) {
    return 4 + value.length + value.reduce<number>(
      (sum, item) => sum + legacyPublicDescriptorObservationCount(item),
      0,
    )
  }
  const values = Object.values(value as Record<string, unknown>)
  return 3 + values.length + values.reduce<number>(
    (sum, item) => sum + legacyPublicDescriptorObservationCount(item),
    0,
  )
}

function completedWork(
  tuple: RequestTupleV2,
  work: VNextTextBlockTransitionProducerWorkV2,
  acceptedResponseNodeCount: number,
): VNextTextBlockIncrementalCandidateWorkV1 {
  const base = tuple.completedCandidateWork
  return freeze({
    ...base,
    evidence: {
      ...base.evidence,
      consumedAtomCount: work.consumedAtomCount,
      consumedClusterCount: work.consumedClusterCount,
      unusedCoverageRenderedUtf16Length: work.unusedCoverageRenderedUtf16Length,
      visitedEvidenceNodeCount: acceptedResponseNodeCount,
    },
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
      policy: tuple.previousRoot.workPolicy,
      factualCounts: [
        { stage: "evidence", unit: "evidence-request-lookup-nodes", count: base.evidence.visitedRequestLookupNodeCount },
        { stage: "evidence", unit: "evidence-context-atoms", count: base.evidence.materializedContextAtomCount },
        { stage: "evidence", unit: "evidence-response-nodes", count: acceptedResponseNodeCount },
      ],
    }),
  })
}

function blocked(
  tuple: RequestTupleV2 | null,
  message: string,
  acceptedResponseNodeCount = 0,
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const completedCandidateWork = tuple == null
    ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
    : completedWork(
        tuple,
        {
          requestedAtomCount: tuple.completedCandidateWork.evidence.requestedAtomCount,
          requestedClusterCount: tuple.completedCandidateWork.evidence.requestedClusterCount,
          consumedAtomCount: 0,
          consumedClusterCount: 0,
          unusedCoverageRenderedUtf16Length: 0,
          visitedEvidenceNodeCount: 0,
          completeNextInputTraversalCount: 0,
          completeNextInputComparisonCount: 0,
        },
        acceptedResponseNodeCount,
      )
  return freeze({
    status: "blocked" as const,
    evidence: null,
    completedCandidateWork,
    issues: freeze([issue(message)]),
  })
}

function acceptanceLimitFallback(
  tuple: RequestTupleV2,
  acceptedResponseNodeCount: number,
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const evaluatorOrProofAuthority = freeze({})
  failureAuthorities.set(evaluatorOrProofAuthority, tuple)
  return freeze({
    status: "fallback-required" as const,
    evidence: null,
    evaluatorOrProofAuthority,
    completedCandidateWork: completedWork(
      tuple,
      {
        requestedAtomCount: tuple.completedCandidateWork.evidence.requestedAtomCount,
        requestedClusterCount: tuple.completedCandidateWork.evidence.requestedClusterCount,
        consumedAtomCount: 0,
        consumedClusterCount: 0,
        unusedCoverageRenderedUtf16Length: 0,
        visitedEvidenceNodeCount: 0,
        completeNextInputTraversalCount: 0,
        completeNextInputComparisonCount: 0,
      },
      acceptedResponseNodeCount,
    ),
    issues: freeze([]),
  })
}

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly response: unknown
}): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const evaluator = acceptanceEvaluators.get(input.request)
  if (evaluator == null) {
    return blocked(null, "evidence tuple is not the exact registered request")
  }
  const meter = createAcceptanceMeter(evaluator)
  if (!meter.beforeObservation()) {
    const registered = requests.get(input.request)
    return registered == null
      ? blocked(null, "evidence tuple is not the exact registered request")
      : acceptanceLimitFallback(registered, meter.count)
  }
  const tuple = tupleFor(input)
  if (tuple == null) {
    return blocked(null, "evidence tuple is not the exact registered request")
  }
  const block = (message: string) => blocked(tuple, message, meter.count)
  const requestSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.request,
    meter,
    new Set<object>(),
  )
  if (requestSnapshot.status === "ceiling") {
    return acceptanceLimitFallback(tuple, meter.count)
  }
  if (requestSnapshot.status !== "accepted") {
    return block("registered evidence request is not descriptor-safe data")
  }
  const materialSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.sourceMaterial,
    meter,
    new Set<object>(),
  )
  if (materialSnapshot.status === "ceiling") {
    return acceptanceLimitFallback(tuple, meter.count)
  }
  if (materialSnapshot.status !== "accepted") {
    return block("registered evidence material is not descriptor-safe data")
  }
  const responseSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.response,
    meter,
    new Set<object>([input.producerRuntimeIdentity]),
  )
  if (responseSnapshot.status === "ceiling") {
    return acceptanceLimitFallback(tuple, meter.count)
  }
  if (responseSnapshot.status !== "accepted") {
    return block("producer response is not exact descriptor-safe data")
  }
  const response = responseSnapshot.value
  const responseKeys = ["source", "contractVersion", "requestFingerprint", "sourceMaterialFingerprint", "runtimeIdentity", "nextEvidenceTargetRange", "shapingRuns", "breakOffsets", "shapingBoundaryProofs", "segmentationBoundaryProofs", "sourceTopologyFingerprint", "work", "contracts", "fingerprint"]
  if (!exactKeys(response, responseKeys) || !safeDataTree(response)) return block("producer response is not exact descriptor-safe data")
  const typed = response as unknown as VNextTextBlockTransitionProducerResponseV2
  if (
    typed.source !== "vnext-text-block-transition-producer-response-v2"
    || typed.contractVersion !== 2
    || typed.requestFingerprint !== input.request.fingerprint
    || typed.sourceMaterialFingerprint !== input.sourceMaterial.fingerprint
    || typed.runtimeIdentity !== input.producerRuntimeIdentity
    || typed.sourceTopologyFingerprint !== input.sourceMaterial.sourceTopologyFingerprint
    || stringifyVNextCanonicalJson(typed.nextEvidenceTargetRange) !== stringifyVNextCanonicalJson(input.request.next.evidenceTargetRange)
    || stringifyVNextCanonicalJson(typed.contracts) !== stringifyVNextCanonicalJson(CONTRACTS)
    || !workIsValid(typed.work, input.sourceMaterial)
  ) return block("producer response facts do not match the exact request tuple")
  const responseFacts = { ...typed } as Record<string, unknown>
  delete responseFacts.fingerprint
  if (typed.fingerprint !== fingerprint(responseFacts)) return block("producer response fingerprint mismatch")
  const targetStart = typed.nextEvidenceTargetRange.startRenderedUtf16
  const targetEnd = typed.nextEvidenceTargetRange.endRenderedUtf16
  if (!Array.isArray(typed.shapingRuns) || !Array.isArray(typed.breakOffsets) || !Array.isArray(typed.shapingBoundaryProofs) || !Array.isArray(typed.segmentationBoundaryProofs)) return block("producer response arrays are invalid")
  const runs = typed.shapingRuns as readonly VNextTextBlockResolvedShapingRunV1[]
  type StyledAtom = Extract<(typeof input.sourceMaterial.next.atoms)[number], { readonly resolvedStyle: unknown }>
  type ResolvedStyle = StyledAtom["resolvedStyle"]
  const coverageStart = input.request.next.coverageRange.startRenderedUtf16
  const coverageText = input.sourceMaterial.next.atoms.map((atom) => atom.renderedText).join("")
  const partitions: Array<{ start: number; end: number; style: ResolvedStyle; atomFingerprints: string[] }> = []
  for (const atom of input.sourceMaterial.next.atoms) {
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") continue
    const start = coverageStart + atom.relativeStartRenderedUtf16
    const end = coverageStart + atom.relativeEndRenderedUtf16
    const previous = partitions.at(-1)
    if (previous != null && previous.end === start && stringifyVNextCanonicalJson(previous.style) === stringifyVNextCanonicalJson(atom.resolvedStyle)) {
      previous.end = end
      previous.atomFingerprints.push(atom.fingerprint)
    } else {
      partitions.push({ start, end, style: atom.resolvedStyle, atomFingerprints: [atom.fingerprint] })
    }
  }
  const expected = partitions.flatMap((partition) => {
    const start = Math.max(partition.start, targetStart)
    const end = Math.min(partition.end, targetEnd)
    return end <= start ? [] : [{ partition, start, end }]
  })
  if (runs.length !== expected.length || typed.shapingBoundaryProofs.length !== expected.length) return block("shaping partitions do not match exact bounded Source styles")
  let consumedClusterCount = 0
  for (let runIndex = 0; runIndex < runs.length; runIndex += 1) {
    const run = runs[runIndex]!
    const row = expected[runIndex]!
    if (!exactKeys(run, ["shapingRunId", "renderStartOffset", "renderEndOffset", "text", "styleKey", "fontFaceId", "fontSizeLayoutUnit", "textColor", "direction", "baselineShiftLayoutUnit", "features", "clusters"])) return block("shaping run contains non-canonical fields")
    if (
      run.shapingRunId !== fingerprint({ request: input.request.fingerprint, atoms: row.partition.atomFingerprints, runStart: row.start, runEnd: row.end })
      || run.renderStartOffset !== row.start
      || run.renderEndOffset !== row.end
      || run.text !== coverageText.slice(row.start - coverageStart, row.end - coverageStart)
      || run.styleKey !== row.partition.style.measurementStyleKey
      || run.fontFaceId !== row.partition.style.fontFaceId
      || run.fontSizeLayoutUnit !== row.partition.style.fontSizeLayoutUnit
      || run.textColor !== row.partition.style.textColor
      || run.direction !== "ltr"
      || run.baselineShiftLayoutUnit !== 0
      || !Array.isArray(run.features)
      || run.features.length !== 0
      || !Array.isArray(run.clusters)
      || run.clusters.length === 0
    ) return block("shaping run facts differ from exact bounded Source material")
    let clusterEnd = run.renderStartOffset
    for (let clusterIndex = 0; clusterIndex < run.clusters.length; clusterIndex += 1) {
      const cluster = run.clusters[clusterIndex]!
      if (!exactKeys(cluster, ["index", "renderStartOffset", "renderEndOffset", "advanceLayoutUnit"]) || cluster.index !== clusterIndex || cluster.renderStartOffset !== clusterEnd || cluster.renderEndOffset <= cluster.renderStartOffset || cluster.renderEndOffset > run.renderEndOffset || !Number.isSafeInteger(cluster.advanceLayoutUnit) || cluster.advanceLayoutUnit < 0) return block("shaping cluster facts are invalid")
      clusterEnd = cluster.renderEndOffset
    }
    if (clusterEnd !== run.renderEndOffset) return block("shaping clusters do not cover the exact run")
    consumedClusterCount += run.clusters.length
    const proof = typed.shapingBoundaryProofs[runIndex]!
    if (!exactKeys(proof, ["targetRange", "verificationRange", "leftBoundary", "rightBoundary", "guardGlyphCount", "inspectedGlyphCount", "fingerprint"]) || !exactKeys(proof.targetRange, ["startRenderedUtf16", "endRenderedUtf16"]) || !exactKeys(proof.verificationRange, ["startRenderedUtf16", "endRenderedUtf16"])) return block("shaping boundary proof is not canonical")
    const expectedVerification = {
      startRenderedUtf16: Math.max(row.partition.start, input.request.next.shapeVerificationRange.startRenderedUtf16),
      endRenderedUtf16: Math.min(row.partition.end, input.request.next.shapeVerificationRange.endRenderedUtf16),
    }
    const expectedLeft = row.start === row.partition.start || row.start === coverageStart ? "exact-style-or-block-start" : "safe-first-target-glyph"
    const expectedRight = row.end === row.partition.end || row.end === coverageStart + coverageText.length ? "exact-style-or-block-end" : "safe-first-right-guard-glyph"
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    if (stringifyVNextCanonicalJson(proof.targetRange) !== stringifyVNextCanonicalJson({ startRenderedUtf16: row.start, endRenderedUtf16: row.end }) || stringifyVNextCanonicalJson(proof.verificationRange) !== stringifyVNextCanonicalJson(expectedVerification) || proof.leftBoundary !== expectedLeft || proof.rightBoundary !== expectedRight || typeof proof.guardGlyphCount !== "number" || !Number.isSafeInteger(proof.guardGlyphCount) || proof.guardGlyphCount < 0 || typeof proof.inspectedGlyphCount !== "number" || !Number.isSafeInteger(proof.inspectedGlyphCount) || proof.inspectedGlyphCount < run.clusters.length + proof.guardGlyphCount || (expectedRight === "safe-first-right-guard-glyph" && proof.guardGlyphCount < 1) || proof.fingerprint !== fingerprint(proofFacts)) return block("shaping boundary proof differs from the exact partition")
  }
  if (typed.segmentationBoundaryProofs.length !== input.request.nextSegmentationContextRanges.length) return block("segmentation proofs do not cover the exact requested contexts")
  let stableTargetBreaks: readonly number[] | null = null
  for (let proofIndex = 0; proofIndex < typed.segmentationBoundaryProofs.length; proofIndex += 1) {
    const proof = typed.segmentationBoundaryProofs[proofIndex]!
    const expectedContext = input.request.nextSegmentationContextRanges[proofIndex]!
    if (!exactKeys(proof, ["contextRange", "contextBreakCount", "targetBreakOffsets", "inspectedOffsetCount", "fingerprint"]) || !exactKeys(proof.contextRange, ["startRenderedUtf16", "endRenderedUtf16"]) || !Array.isArray(proof.targetBreakOffsets)) return block("segmentation boundary proof is not canonical")
    const contextBreakCount = proof.contextBreakCount
    const targetBreakOffsets = proof.targetBreakOffsets
    const inspectedOffsetCount = proof.inspectedOffsetCount
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    if (
      stringifyVNextCanonicalJson(proof.contextRange) !== stringifyVNextCanonicalJson(expectedContext)
      || typeof contextBreakCount !== "number"
      || !Number.isSafeInteger(contextBreakCount)
      || contextBreakCount < targetBreakOffsets.length
      || targetBreakOffsets.some((offset, index) => !Number.isSafeInteger(offset) || offset < targetStart || offset > targetEnd || (index > 0 && offset <= targetBreakOffsets[index - 1]!))
      || typeof inspectedOffsetCount !== "number"
      || inspectedOffsetCount !== 2 * contextBreakCount + 2 * targetBreakOffsets.length
      || proof.fingerprint !== fingerprint(proofFacts)
    ) return block("segmentation boundary proof differs from the exact bounded attempt")
    if (stableTargetBreaks != null && stringifyVNextCanonicalJson(proof.targetBreakOffsets) !== stringifyVNextCanonicalJson(stableTargetBreaks)) return block("segmentation proofs do not establish stable target breaks")
    stableTargetBreaks = targetBreakOffsets
  }
  if (typed.segmentationBoundaryProofs.length < input.request.requiredStableSegmentationExpansionCount || stableTargetBreaks == null) return block("segmentation proofs do not reach the required stable expansion count")
  if (typed.breakOffsets.some((offset, index) => !Number.isSafeInteger(offset) || offset < targetStart || offset > targetEnd || (index > 0 && offset <= typed.breakOffsets[index - 1]!))) return block("break offsets are invalid")
  const hardBreaks = input.sourceMaterial.next.atoms
    .filter((atom) => atom.kind === "hard-break")
    .map((atom) => coverageStart + atom.relativeEndRenderedUtf16)
    .filter((offset) => offset >= targetStart && offset <= targetEnd)
  const expectedBreakOffsets = [...new Set([...stableTargetBreaks, ...hardBreaks])].sort((left, right) => left - right)
  if (stringifyVNextCanonicalJson(typed.breakOffsets) !== stringifyVNextCanonicalJson(expectedBreakOffsets)) return block("break offsets differ from exact stable segmentation facts")
  const exactUnusedCoverage = input.request.next.coverageRange.endRenderedUtf16 - input.request.next.coverageRange.startRenderedUtf16 - coveredUtf16Length([
    ...typed.shapingBoundaryProofs.map((proof) => proof.verificationRange),
    ...input.request.nextSegmentationContextRanges,
  ])
  const legacyPublicProducerInputDescriptorCount = 12
    + legacyPublicDescriptorObservationCount(input.request)
    + legacyPublicDescriptorObservationCount(input.sourceMaterial)
    + legacyPublicDescriptorObservationCount(input.producerRuntimeIdentity)
  const legacyPublicVisitedEvidenceNodeCount = legacyPublicProducerInputDescriptorCount
    + input.sourceMaterial.next.atoms.length
    + runs.length
    + input.request.nextSegmentationContextRanges.length
    + typed.shapingBoundaryProofs.reduce(
      (sum, proof) => sum + 37 + 12 * proof.inspectedGlyphCount,
      0,
    )
    + typed.segmentationBoundaryProofs.reduce(
      (sum, proof) => sum + 44 + proof.inspectedOffsetCount,
      0,
    )
    + typed.breakOffsets.length
  if (typed.work.consumedAtomCount !== input.sourceMaterial.next.atoms.length || typed.work.consumedClusterCount !== consumedClusterCount || typed.work.unusedCoverageRenderedUtf16Length !== exactUnusedCoverage || typed.work.visitedEvidenceNodeCount !== legacyPublicVisitedEvidenceNodeCount) return block("producer work does not match exact response/material facts")
  const evidenceFacts = {
    source: "vnext-text-block-transition-evidence-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: input.request.fingerprint,
    sourceMaterialFingerprint: input.sourceMaterial.fingerprint,
    previousRootFingerprint: input.previousRoot.fingerprint,
    changeFingerprint: input.request.changeFingerprint,
    runtimeIdentityFingerprint: input.producerRuntimeIdentity.fingerprint,
    nextEvidenceTargetRange: typed.nextEvidenceTargetRange,
    shapingRuns: typed.shapingRuns,
    breakOffsets: typed.breakOffsets,
    shapingBoundaryProofs: typed.shapingBoundaryProofs,
    segmentationBoundaryProofs: typed.segmentationBoundaryProofs,
    sourceTopologyFingerprint: typed.sourceTopologyFingerprint,
    work: typed.work,
  }
  const evidence: VNextTextBlockTransitionEvidenceV2 = freeze({ ...evidenceFacts, fingerprint: fingerprint(evidenceFacts) })
  const acceptedWork = completedWork(tuple, typed.work, meter.count)
  evidenceRecords.set(evidence, tuple)
  evidenceCompletedWorkRecords.set(evidence, acceptedWork)
  return freeze({ status: "accepted" as const, evidence, completedCandidateWork: acceptedWork, issues: freeze([]) })
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

export function acceptVNextTextBlockUnifiedLayoutProducerFailureV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly failure: unknown
}): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  const evaluator = acceptanceEvaluators.get(input.request)
  if (evaluator == null) {
    return freeze({
      status: "blocked" as const,
      evaluatorOrProofAuthority: null,
      completedCandidateWork:
        createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(),
      issues: freeze([issue("producer failure tuple is not registered")]),
    })
  }
  const meter = createAcceptanceMeter(evaluator)
  if (!meter.beforeObservation()) {
    return freeze({
      status: "blocked" as const,
      evaluatorOrProofAuthority: null,
      completedCandidateWork:
        createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(),
      issues: freeze([issue("producer failure acceptance work is unavailable")]),
    })
  }
  const tuple = tupleFor(input)
  const zeroProducerWork: VNextTextBlockTransitionProducerWorkV2 = {
    requestedAtomCount:
      tuple?.completedCandidateWork.evidence.requestedAtomCount ?? 0,
    requestedClusterCount:
      tuple?.completedCandidateWork.evidence.requestedClusterCount ?? 0,
    consumedAtomCount: 0,
    consumedClusterCount: 0,
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: 0,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
  }
  const blockedFailure = (message: string): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 => freeze({ status: "blocked" as const, evaluatorOrProofAuthority: null, completedCandidateWork: tuple == null ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1() : completedWork(tuple, zeroProducerWork, meter.count), issues: freeze([issue(message)]) })
  if (tuple == null) return blockedFailure("producer failure tuple is not registered")
  const requestSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.request,
    meter,
    new Set<object>(),
  )
  if (requestSnapshot.status !== "accepted") {
    return blockedFailure("producer failure acceptance work stopped before request inspection")
  }
  const materialSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.sourceMaterial,
    meter,
    new Set<object>(),
  )
  if (materialSnapshot.status !== "accepted") {
    return blockedFailure("producer failure acceptance work stopped before material inspection")
  }
  const failureSnapshot = snapshotAcceptanceDataBeforeObservation(
    input.failure,
    meter,
    new Set<object>([input.producerRuntimeIdentity]),
  )
  if (failureSnapshot.status !== "accepted") {
    return blockedFailure("producer failure is not exact descriptor-safe data")
  }
  const failure = failureSnapshot.value
  if (!exactKeys(failure, ["source", "contractVersion", "requestFingerprint", "sourceMaterialFingerprint", "runtimeIdentity", "code", "completedWork", "contracts", "fingerprint"]) || !safeDataTree(failure)) return blockedFailure("producer failure is not exact descriptor-safe data")
  const typed = failure as unknown as VNextTextBlockTransitionProducerFailureV2
  const codes = ["invalid-request-scoped-material", "pinned-font-unavailable", "pinned-font-mismatch", "unsafe-shaping-boundary", "segmentation-not-stable", "missing-glyph", "unsafe-runtime-arithmetic", "work-ceiling-before-visit"]
  const facts = { ...typed } as Record<string, unknown>
  delete facts.fingerprint
  if (typed.source !== "vnext-text-block-transition-producer-failure-v2" || typed.contractVersion !== 2 || typed.requestFingerprint !== input.request.fingerprint || typed.sourceMaterialFingerprint !== input.sourceMaterial.fingerprint || typed.runtimeIdentity !== input.producerRuntimeIdentity || !codes.includes(typed.code) || !workIsValid(typed.completedWork, input.sourceMaterial) || stringifyVNextCanonicalJson(typed.contracts) !== stringifyVNextCanonicalJson(CONTRACTS) || typed.fingerprint !== fingerprint(facts)) return blockedFailure("producer failure facts do not match the exact request tuple")
  if (typed.code === "invalid-request-scoped-material") return blockedFailure("exact registered material cannot factually produce invalid-material fallback authority")
  if (typed.code === "work-ceiling-before-visit") {
    const exhausted = typed.completedWork.visitedEvidenceNodeCount === input.sourceMaterial.producerWorkCeilings.maximumVisitedEvidenceNodeCount
      || typed.completedWork.consumedClusterCount === input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount
    if (!exhausted) return blockedFailure("work-ceiling failure did not exhaust an exact declared producer ceiling")
  } else if (typed.completedWork.consumedAtomCount !== input.sourceMaterial.next.atoms.length || typed.completedWork.visitedEvidenceNodeCount < input.sourceMaterial.next.atoms.length) {
    return blockedFailure("factual producer failure work does not reach the failure stage")
  }
  const authority = freeze({})
  failureAuthorities.set(authority, tuple)
  return freeze({ status: "fallback-required" as const, evaluatorOrProofAuthority: authority, completedCandidateWork: completedWork(tuple, typed.completedWork, meter.count), issues: freeze([]) })
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
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  return freeze({
    status: "blocked" as const,
    evidence: null,
    completedCandidateWork: tuple == null || terminal == null || meter == null
      ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
      : authorizedCompletedWork(
          tuple,
          terminal,
          zeroAuthorizedProducerWork(tuple),
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
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  return freeze({
    status: "blocked" as const,
    evaluatorOrProofAuthority: null,
    completedCandidateWork: tuple == null || terminal == null || meter == null
      ? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
      : authorizedCompletedWork(
          tuple,
          terminal,
          zeroAuthorizedProducerWork(tuple),
          meter,
        ),
    issues: freeze([issue(message)]),
  })
}

function registerAuthorizedFallbackAuthority(
  tuple: RequestTupleV2,
): object {
  const authority = freeze({})
  failureAuthorities.set(authority, tuple)
  return authority
}

function authorizedEvidenceLimitFallback(
  tuple: RequestTupleV2,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  meter: AuthorizedAcceptanceMeterV2,
  producerWork = zeroAuthorizedProducerWork(tuple),
): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  return freeze({
    status: "fallback-required" as const,
    evidence: null,
    evaluatorOrProofAuthority: registerAuthorizedFallbackAuthority(tuple),
    completedCandidateWork: authorizedCompletedWork(
      tuple,
      terminal,
      producerWork,
      meter,
    ),
    issues: freeze([]),
  })
}

function authorizedFailureLimitFallback(
  tuple: RequestTupleV2,
  terminal: Readonly<AuthorityRecordSnapshotV2>,
  meter: AuthorizedAcceptanceMeterV2,
  producerWork: VNextTextBlockTransitionProducerWorkV2,
): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  return freeze({
    status: "fallback-required" as const,
    evaluatorOrProofAuthority: registerAuthorizedFallbackAuthority(tuple),
    completedCandidateWork: authorizedCompletedWork(
      tuple,
      terminal,
      producerWork,
      meter,
    ),
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
    runAuthorizedComparisons(meter, [
      () => exactKeys(value, responseKeys),
      () => safeDataTree(value),
    ]),
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
      () => stringifyVNextCanonicalJson(typed.nextEvidenceTargetRange)
        === stringifyVNextCanonicalJson(terminal.request.next.evidenceTargetRange),
      () => stringifyVNextCanonicalJson(typed.contracts)
        === stringifyVNextCanonicalJson(CONTRACTS),
      () => workIsValid(typed.work, terminal.sourceMaterial),
      () => typed.work.visitedEvidenceNodeCount
        === terminal.visitedEvidenceNodeCount,
      () => {
        const facts = { ...typed } as Record<string, unknown>
        delete facts.fingerprint
        return typed.fingerprint === fingerprint(facts)
      },
      () => Array.isArray(typed.shapingRuns),
      () => Array.isArray(typed.breakOffsets),
      () => Array.isArray(typed.shapingBoundaryProofs),
      () => Array.isArray(typed.segmentationBoundaryProofs),
    ]),
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
  const coverageText = terminal.sourceMaterial.next.atoms
    .map((atom) => atom.renderedText)
    .join("")
  const partitions: Array<{
    start: number
    end: number
    style: ResolvedStyle
    atomFingerprints: string[]
  }> = []
  for (const atom of terminal.sourceMaterial.next.atoms) {
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") continue
    const start = coverageStart + atom.relativeStartRenderedUtf16
    const end = coverageStart + atom.relativeEndRenderedUtf16
    const previous = partitions.at(-1)
    if (
      previous != null
      && previous.end === start
      && stringifyVNextCanonicalJson(previous.style)
        === stringifyVNextCanonicalJson(atom.resolvedStyle)
    ) {
      previous.end = end
      previous.atomFingerprints.push(atom.fingerprint)
    } else {
      partitions.push({
        start,
        end,
        style: atom.resolvedStyle,
        atomFingerprints: [atom.fingerprint],
      })
    }
  }
  const expected = partitions.flatMap((partition) => {
    const start = Math.max(partition.start, targetStart)
    const end = Math.min(partition.end, targetEnd)
    return end <= start ? [] : [{ partition, start, end }]
  })
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
    const run = runs[runIndex]!
    const row = expected[runIndex]!
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => exactKeys(run, [
          "shapingRunId", "renderStartOffset", "renderEndOffset", "text",
          "styleKey", "fontFaceId", "fontSizeLayoutUnit", "textColor",
          "direction", "baselineShiftLayoutUnit", "features", "clusters",
        ]),
        () => run.shapingRunId === fingerprint({
          request: terminal.request.fingerprint,
          atoms: row.partition.atomFingerprints,
          runStart: row.start,
          runEnd: row.end,
        }),
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
        () => Array.isArray(run.features) && run.features.length === 0,
        () => Array.isArray(run.clusters) && run.clusters.length > 0,
      ]),
      "shaping run facts differ from exact bounded Source material",
    )
    if (compared != null) return compared
    let clusterEnd = run.renderStartOffset
    for (let clusterIndex = 0; clusterIndex < run.clusters.length; clusterIndex += 1) {
      const cluster = run.clusters[clusterIndex]!
      compared = responseValidationResult(
        runAuthorizedComparisons(meter, [
          () => exactKeys(cluster, [
            "index", "renderStartOffset", "renderEndOffset", "advanceLayoutUnit",
          ]),
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
    consumedClusterCount += run.clusters.length
    const proof = typed.shapingBoundaryProofs[runIndex]!
    const expectedVerification = {
      startRenderedUtf16: Math.max(
        row.partition.start,
        terminal.request.next.shapeVerificationRange.startRenderedUtf16,
      ),
      endRenderedUtf16: Math.min(
        row.partition.end,
        terminal.request.next.shapeVerificationRange.endRenderedUtf16,
      ),
    }
    const expectedLeft = row.start === row.partition.start || row.start === coverageStart
      ? "exact-style-or-block-start"
      : "safe-first-target-glyph"
    const expectedRight = row.end === row.partition.end
      || row.end === coverageStart + coverageText.length
      ? "exact-style-or-block-end"
      : "safe-first-right-guard-glyph"
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => exactKeys(proof, [
          "targetRange", "verificationRange", "leftBoundary", "rightBoundary",
          "guardGlyphCount", "inspectedGlyphCount", "fingerprint",
        ]),
        () => exactKeys(proof.targetRange, [
          "startRenderedUtf16", "endRenderedUtf16",
        ]),
        () => exactKeys(proof.verificationRange, [
          "startRenderedUtf16", "endRenderedUtf16",
        ]),
        () => stringifyVNextCanonicalJson(proof.targetRange)
          === stringifyVNextCanonicalJson({
            startRenderedUtf16: row.start,
            endRenderedUtf16: row.end,
          }),
        () => stringifyVNextCanonicalJson(proof.verificationRange)
          === stringifyVNextCanonicalJson(expectedVerification),
        () => proof.leftBoundary === expectedLeft,
        () => proof.rightBoundary === expectedRight,
        () => Number.isSafeInteger(proof.guardGlyphCount) && proof.guardGlyphCount >= 0,
        () => Number.isSafeInteger(proof.inspectedGlyphCount)
          && proof.inspectedGlyphCount >= run.clusters.length + proof.guardGlyphCount,
        () => expectedRight !== "safe-first-right-guard-glyph"
          || proof.guardGlyphCount >= 1,
        () => {
          const facts = { ...proof } as Record<string, unknown>
          delete facts.fingerprint
          return proof.fingerprint === fingerprint(facts)
        },
      ]),
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
    const proof = typed.segmentationBoundaryProofs[proofIndex]!
    const expectedContext = terminal.request.nextSegmentationContextRanges[proofIndex]!
    const previousBreaks = stableTargetBreaks
    compared = responseValidationResult(
      runAuthorizedComparisons(meter, [
        () => exactKeys(proof, [
          "contextRange", "contextBreakCount", "targetBreakOffsets",
          "inspectedOffsetCount", "fingerprint",
        ]),
        () => exactKeys(proof.contextRange, [
          "startRenderedUtf16", "endRenderedUtf16",
        ]),
        () => Array.isArray(proof.targetBreakOffsets),
        () => stringifyVNextCanonicalJson(proof.contextRange)
          === stringifyVNextCanonicalJson(expectedContext),
        () => Number.isSafeInteger(proof.contextBreakCount)
          && proof.contextBreakCount >= proof.targetBreakOffsets.length,
        () => proof.targetBreakOffsets.every((offset, index) =>
          Number.isSafeInteger(offset)
          && offset >= targetStart
          && offset <= targetEnd
          && (index === 0 || offset > proof.targetBreakOffsets[index - 1]!)
        ),
        () => Number.isSafeInteger(proof.inspectedOffsetCount)
          && proof.inspectedOffsetCount
            === 2 * proof.contextBreakCount + 2 * proof.targetBreakOffsets.length,
        () => {
          const facts = { ...proof } as Record<string, unknown>
          delete facts.fingerprint
          return proof.fingerprint === fingerprint(facts)
        },
        () => previousBreaks == null
          || stringifyVNextCanonicalJson(proof.targetBreakOffsets)
            === stringifyVNextCanonicalJson(previousBreaks),
      ]),
      "segmentation proof differs from the exact bounded attempt",
    )
    if (compared != null) return compared
    stableTargetBreaks = proof.targetBreakOffsets
  }
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => typed.segmentationBoundaryProofs.length
        >= terminal.request.requiredStableSegmentationExpansionCount,
      () => stableTargetBreaks != null,
      () => typed.breakOffsets.every((offset, index) =>
        Number.isSafeInteger(offset)
        && offset >= targetStart
        && offset <= targetEnd
        && (index === 0 || offset > typed.breakOffsets[index - 1]!)
      ),
    ]),
    "segmentation proofs or break offsets are invalid",
  )
  if (compared != null) return compared
  if (stableTargetBreaks == null) {
    return { status: "invalid", message: "segmentation proof is missing" }
  }
  const hardBreaks = terminal.sourceMaterial.next.atoms
    .filter((atom) => atom.kind === "hard-break")
    .map((atom) => coverageStart + atom.relativeEndRenderedUtf16)
    .filter((offset) => offset >= targetStart && offset <= targetEnd)
  const expectedBreakOffsets = [...new Set([...stableTargetBreaks, ...hardBreaks])]
    .sort((left, right) => left - right)
  const exactUnusedCoverage =
    terminal.request.next.coverageRange.endRenderedUtf16
    - terminal.request.next.coverageRange.startRenderedUtf16
    - coveredUtf16Length([
      ...typed.shapingBoundaryProofs.map((proof) => proof.verificationRange),
      ...terminal.request.nextSegmentationContextRanges,
    ])
  compared = responseValidationResult(
    runAuthorizedComparisons(meter, [
      () => stringifyVNextCanonicalJson(typed.breakOffsets)
        === stringifyVNextCanonicalJson(expectedBreakOffsets),
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
  tuple: RequestTupleV2,
  meter: AuthorizedAcceptanceMeterV2,
): AuthorizedFailureValidationV2 {
  const zeroWork = zeroAuthorizedProducerWork(tuple)
  if (terminal.terminalOutcome === "producer-blocked") {
    const failed = terminal.firstFailedEvaluation
    const compared = failureValidationResult(
      runAuthorizedComparisons(meter, [
        () => value == null,
        () => terminal.runtimeIdentity == null,
        () => terminal.visitedEvidenceNodeCount === 0,
        () => failed != null,
        () => failed?.unit === "evidence-producer-descriptors",
        () => failed?.attemptedWork === 1,
        () => failed?.completedWork === 0,
        () => failed?.effectiveLimit === 0,
      ]),
      "producer-blocked terminal is not the exact zero-descriptor ceiling",
    )
    return compared ?? { status: "accepted", failure: null, work: zeroWork }
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
    runAuthorizedComparisons(meter, [
      () => exactKeys(failure, [
        "source", "contractVersion", "requestFingerprint",
        "sourceMaterialFingerprint", "runtimeIdentity", "code", "completedWork",
        "contracts", "fingerprint",
      ]),
      () => safeDataTree(failure),
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
    runAuthorizedComparisons(meter, [
      () => typed.source === "vnext-text-block-transition-producer-failure-v2",
      () => typed.contractVersion === 2,
      () => typed.requestFingerprint === terminal.request.fingerprint,
      () => typed.sourceMaterialFingerprint === terminal.sourceMaterial.fingerprint,
      () => typed.runtimeIdentity === runtimeIdentity,
      () => codes.includes(typed.code),
      () => workIsValid(typed.completedWork, terminal.sourceMaterial),
      () => typed.completedWork.visitedEvidenceNodeCount
        === terminal.visitedEvidenceNodeCount,
      () => stringifyVNextCanonicalJson(typed.contracts)
        === stringifyVNextCanonicalJson(CONTRACTS),
      () => {
        const facts = { ...typed } as Record<string, unknown>
        delete facts.fingerprint
        return typed.fingerprint === fingerprint(facts)
      },
      () => typed.code !== "invalid-request-scoped-material",
    ]),
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
  return compared ?? { status: "accepted", failure: typed, work: typed.completedWork }
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
  const tuple = exactAuthorizedTuple(terminal)
  const meter = createAuthorizedAcceptanceMeter(terminal)
  const descriptorCharge = meter.before("evidence-acceptance-descriptors")
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
    return authorizedEvidenceLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
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
    return authorizedEvidenceLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
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
    )
  }
  const registration = context.meter.before("evidence-acceptance-registrations")
  if (registration === "limit-exceeded") {
    return authorizedEvidenceLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
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
    return authorizedFailureLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      zeroAuthorizedProducerWork(context.tuple),
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
    context.tuple,
    context.meter,
  )
  if (validation.status === "ceiling") {
    return authorizedFailureLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      zeroAuthorizedProducerWork(context.tuple),
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
    )
  }
  const registration = context.meter.before("evidence-acceptance-registrations")
  if (registration === "limit-exceeded") {
    return authorizedFailureLimitFallback(
      context.tuple,
      context.terminal,
      context.meter,
      validation.work,
    )
  }
  if (registration !== "charged") {
    return authorizedFailureBlocked(
      context.tuple,
      context.terminal,
      context.meter,
      "fallback registration policy is unavailable",
    )
  }
  return authorizedFailureLimitFallback(
    context.tuple,
    context.terminal,
    context.meter,
    validation.work,
  )
}
