import { describe, expect, it, vi } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import {
  createFlowDocTextEngineUnifiedIncrementalEvidenceV2,
} from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutProducerFailureV2,
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import * as transitionEvidenceV2Internals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  authorizedEvidenceRequestBundle5B2,
  authorizedProducerTerminalFixture5B2 as authorizedFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.js"
import type {
  VNextTextBlockTransitionProducerResponseV2,
  VNextTextBlockTransitionProducerRuntimeIdentityV2,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"

function frozen<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) frozen(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function rehash<T extends object>(value: T): T & { fingerprint: string } {
  const facts = { ...value } as Record<string, unknown>
  delete facts.fingerprint
  return { ...value, fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson(facts)) } as T & { fingerprint: string }
}

function workCount(
  work: { readonly stageWork: readonly { readonly unit: string; readonly count: number }[] },
  unit: string,
) {
  return work.stageWork.find((row) => row.unit === unit)?.count ?? -1
}

type AuthorizedFallbackRecordTestV2 = {
  readonly terminal: {
    readonly state: string
    readonly terminalOutcome: string | null
    readonly request: unknown
    readonly sourceMaterial: unknown
    readonly runtimeIdentity: unknown
    readonly completedWork: readonly {
      readonly unit: string
      readonly completedWork: number
    }[]
    readonly firstFailedEvaluation: unknown
    readonly visitedEvidenceNodeCount: number
  }
  readonly failureKind:
    | "acceptance-work-limit"
    | "producer-work-limit"
    | "producer-proof-failed"
  readonly producerFailureCode: string | null
  readonly acceptanceFailedEvaluation: {
    readonly unit: string
    readonly attemptedWork: number
    readonly completedWork: number
    readonly effectiveLimit: number | null
  } | null
  readonly producerWork: {
    readonly requestedAtomCount: number
    readonly requestedClusterCount: number
    readonly consumedAtomCount: number
    readonly consumedClusterCount: number
    readonly unusedCoverageRenderedUtf16Length: number
    readonly visitedEvidenceNodeCount: number
    readonly completeNextInputTraversalCount: number
    readonly completeNextInputComparisonCount: number
  }
  readonly completedCandidateWork: unknown
}

function getAuthorizedFallbackRecord(
  authority: unknown,
): AuthorizedFallbackRecordTestV2 | null {
  const module = transitionEvidenceV2Internals as unknown as {
    readonly getVNextTextBlockUnifiedLayoutAuthorizedFallbackAuthorityRecordInternalV2:
      (value: unknown) => AuthorizedFallbackRecordTestV2 | null
  }
  return module
    .getVNextTextBlockUnifiedLayoutAuthorizedFallbackAuthorityRecordInternalV2(
      authority,
    )
}

function acceptanceWorkCount(
  work: { readonly stageWork: readonly { readonly unit: string; readonly count: number }[] },
) {
  return [
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
    "evidence-acceptance-registrations",
  ].reduce((sum, unit) => sum + workCount(work, unit), 0)
}

function expectExactProducerSemanticCounters(
  actual: {
    readonly evidence: {
      readonly requestedAtomCount: number
      readonly requestedClusterCount: number
      readonly consumedAtomCount: number
      readonly consumedClusterCount: number
      readonly unusedCoverageRenderedUtf16Length: number
      readonly visitedEvidenceNodeCount: number
    }
    readonly completeNextInputTraversalCount: number
    readonly completeNextInputComparisonCount: number
    readonly stageWork: readonly { readonly unit: string; readonly count: number }[]
  },
  expected: {
    readonly requestedAtomCount: number
    readonly requestedClusterCount: number
    readonly consumedAtomCount: number
    readonly consumedClusterCount: number
    readonly unusedCoverageRenderedUtf16Length: number
    readonly visitedEvidenceNodeCount: number
    readonly completeNextInputTraversalCount: number
    readonly completeNextInputComparisonCount: number
  },
) {
  expect(actual.evidence).toMatchObject({
    requestedAtomCount: expected.requestedAtomCount,
    requestedClusterCount: expected.requestedClusterCount,
    consumedAtomCount: expected.consumedAtomCount,
    consumedClusterCount: expected.consumedClusterCount,
    unusedCoverageRenderedUtf16Length:
      expected.unusedCoverageRenderedUtf16Length,
    visitedEvidenceNodeCount:
      expected.visitedEvidenceNodeCount + acceptanceWorkCount(actual),
  })
  expect(actual.completeNextInputTraversalCount)
    .toBe(expected.completeNextInputTraversalCount)
  expect(actual.completeNextInputComparisonCount)
    .toBe(expected.completeNextInputComparisonCount)
}

const LATE_OFFSET_FIXTURE_COMPARISON_LEDGER = Object.freeze({
  // Fixed response envelope: 14 exact keys, six authority checks, two
  // canonical fixed trees, the eight-field work tree, array/header checks,
  // and the exact response fingerprint tree/equality.
  responseExactKeyChecks: 47,
  responseAuthorityHeaderChecks: 6,
  targetRangeCanonicalChecks: 13,
  contractsTreeChecks: 33,
  producerWorkTreeChecks: 18,
  workAndResponseArrayChecks: 6,
  responseFingerprintTreeChecks: 198,
  responseFingerprintEquality: 1,

  // Fixed Source fixture: two text atoms merge into one style partition.
  sourceCoverageAtomReadsAndCompositions: 4,
  sourcePartitionAtomTraversalAndClassification: 4,
  sourcePartitionRangesAndPreviousLookups: 4,
  sourceFirstPartitionConstruction: 1,
  sourcePartitionContinuity: 1,
  sourceStyleCanonicalTreeAndEquality: 53,
  sourceSecondPartitionConstruction: 1,
  sourceProjectionTraversalClipNonemptyAndAppend: 4,

  // Fixed response: one shaping run, one cluster, and one boundary proof.
  shapingRunAndProofCardinality: 2,
  shapingRunAndSourceRowTraversal: 2,
  shapingRunExactKeyChecks: 41,
  shapingRunIdentityTreeChecks: 17,
  shapingRunScalarChecks: 14,
  clusterTraversalExactKeyAndScalarChecks: 24,
  clusterCoverageAggregationAndProofTraversal: 3,
  shapingBoundaryConstructions: 3,
  shapingProofExactKeyChecks: 26,
  shapingProofRangeExactKeyChecks: 22,
  shapingProofRangeCanonicalChecks: 26,
  shapingProofScalarAndRightGuardChecks: 7,
  shapingProofFingerprintTreeAndEquality: 25,

  // Fixed segmentation fixture: cardinality, the complete first proof, then
  // the second proof through its first offset. The next operation is traversal
  // of the targeted second offset.
  segmentationProofCardinality: 1,
  firstProofAndContextTraversal: 2,
  firstProofExactKeyChecks: 20,
  firstContextExactKeyChecks: 11,
  firstContextCanonicalChecks: 13,
  firstProofHeaderChecks: 3,
  firstOffsetTraversalAndScalarChecks: 4,
  firstInspectedOffsetChecks: 2,
  firstProofFingerprintTreeAndEquality: 21,
  firstStableAssignment: 1,
  secondProofAndContextTraversal: 2,
  secondProofExactKeyChecks: 20,
  secondContextExactKeyChecks: 11,
  secondContextCanonicalChecks: 13,
  secondProofHeaderChecks: 3,
  secondFirstOffsetTraversalAndScalarChecks: 4,
})

const LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY =
  LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.responseExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.responseAuthorityHeaderChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.targetRangeCanonicalChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.contractsTreeChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.producerWorkTreeChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.workAndResponseArrayChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.responseFingerprintTreeChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.responseFingerprintEquality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourceCoverageAtomReadsAndCompositions
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourcePartitionAtomTraversalAndClassification
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourcePartitionRangesAndPreviousLookups
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourceFirstPartitionConstruction
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourcePartitionContinuity
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourceStyleCanonicalTreeAndEquality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourceSecondPartitionConstruction
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.sourceProjectionTraversalClipNonemptyAndAppend
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingRunAndProofCardinality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingRunAndSourceRowTraversal
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingRunExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingRunIdentityTreeChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingRunScalarChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.clusterTraversalExactKeyAndScalarChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.clusterCoverageAggregationAndProofTraversal
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingBoundaryConstructions
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingProofExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingProofRangeExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingProofRangeCanonicalChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingProofScalarAndRightGuardChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.shapingProofFingerprintTreeAndEquality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.segmentationProofCardinality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstProofAndContextTraversal
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstProofExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstContextExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstContextCanonicalChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstProofHeaderChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstOffsetTraversalAndScalarChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstInspectedOffsetChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstProofFingerprintTreeAndEquality
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.firstStableAssignment
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondProofAndContextTraversal
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondProofExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondContextExactKeyChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondContextCanonicalChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondProofHeaderChecks
  + LATE_OFFSET_FIXTURE_COMPARISON_LEDGER.secondFirstOffsetTraversalAndScalarChecks

function hostileObject(label: string, observed: string[]): object {
  return new Proxy(Object.create(null) as object, {
    get(_target, property) {
      observed.push(`${label}:get:${String(property)}`)
      throw new Error(`${label} must not be read`)
    },
    getOwnPropertyDescriptor(_target, property) {
      observed.push(`${label}:descriptor:${String(property)}`)
      throw new Error(`${label} must not be inspected`)
    },
    getPrototypeOf() {
      observed.push(`${label}:prototype`)
      throw new Error(`${label} must not be inspected`)
    },
    ownKeys() {
      observed.push(`${label}:keys`)
      throw new Error(`${label} must not be inspected`)
    },
  })
}

describe("Core authorized acceptance and vertical authority boundary", () => {
  it("binds Evidence before installing accepted candidate authority", () => {
    const fixture = authorizedFixture({ insertedText: "binding-order" })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    let bindingVisibleDuringRegistration = false
    setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1((input) => {
      bindingVisibleDuringRegistration =
        hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
          evidence: input.producingStageAuthority,
          previousRoot: fixture.previousRoot,
          change: fixture.change,
          completedCandidateWork: input.candidateWork,
          expectedRequest: fixture.request,
          expectedSourceMaterial: fixture.sourceMaterial,
        })
      return true
    })
    try {
      const accepted = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        response: fixture.result.response,
      })
      expect(accepted.status).toBe("accepted")
      expect(bindingVisibleDuringRegistration).toBe(true)
    } finally {
      setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(null)
    }
  }, 30_000)

  it("rolls back Evidence and owner bindings when candidate registration fails", () => {
    const fixture = authorizedFixture({ insertedText: "registration-rollback" })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    let evidence: object | null = null
    let completedCandidateWork:
      Parameters<typeof hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2>[0]["completedCandidateWork"] | null = null
    let bindingVisibleDuringRegistration = false
    setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1((input) => {
      evidence = input.producingStageAuthority
      completedCandidateWork = input.candidateWork
      bindingVisibleDuringRegistration =
        hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
          evidence,
          previousRoot: fixture.previousRoot,
          change: fixture.change,
          completedCandidateWork,
          expectedRequest: fixture.request,
          expectedSourceMaterial: fixture.sourceMaterial,
        })
      return false
    })
    try {
      const accepted = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        response: fixture.result.response,
      })
      expect(accepted).toMatchObject({ status: "blocked" })
      expect(bindingVisibleDuringRegistration).toBe(true)
      expect(evidence).not.toBeNull()
      expect(completedCandidateWork).not.toBeNull()
      if (evidence == null || completedCandidateWork == null) return
      expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
        evidence,
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        completedCandidateWork,
        expectedRequest: fixture.request,
        expectedSourceMaterial: fixture.sourceMaterial,
      })).toBe(false)
      expect(transitionEvidenceV2Internals
        .getVNextTextBlockUnifiedLayoutAcceptedEvidenceCandidateOwnerRecordInternalV2(
          evidence,
        )).toBeNull()
      const composition =
        resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
          fixture.previousRoot,
        )
      expect(composition).not.toBeNull()
      if (composition == null) return
      expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        composition,
        candidateWork: completedCandidateWork,
      })).toBeNull()
    } finally {
      setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(null)
    }
  }, 30_000)

  it("authorized acceptance consumes the exact positive terminal and registers Evidence V2 from ledger-backed work", () => {
    const fixture = authorizedFixture({ insertedText: "P" })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    const producerSnapshot =
      inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        fixture.producerInvocationAuthority,
      )
    expect(producerSnapshot).toMatchObject({
      state: "producer-response",
      terminalOutcome: "producer-response",
      runtimeIdentity: fixture.producerRuntimeIdentity,
      firstFailedEvaluation: null,
    })

    const accepted =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        response: fixture.result.response,
      })

    expect(accepted).toMatchObject({ status: "accepted", issues: [] })
    if (accepted.status !== "accepted" || producerSnapshot == null) return
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      fixture.producerInvocationAuthority,
    )).toMatchObject({ state: "acceptance-consumed" })
    for (const row of producerSnapshot.completedWork) {
      expect(workCount(accepted.completedCandidateWork, row.unit)).toBe(
        row.completedWork,
      )
    }
    const producerWork = producerSnapshot.completedWork.reduce(
      (sum, row) => sum + row.completedWork,
      0,
    )
    const acceptanceWork = [
      "evidence-acceptance-descriptors",
      "evidence-acceptance-comparisons",
      "evidence-acceptance-registrations",
    ].reduce((sum, unit) => sum + workCount(accepted.completedCandidateWork, unit), 0)
    expect(accepted.completedCandidateWork.evidence.visitedEvidenceNodeCount)
      .toBe(producerWork + acceptanceWork)
    expect(accepted.completedCandidateWork.evidence.consumedClusterCount)
      .toBe(fixture.result.response.work.consumedClusterCount)
    expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
      evidence: accepted.evidence,
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      completedCandidateWork: accepted.completedCandidateWork,
      expectedRequest: fixture.request,
      expectedSourceMaterial: fixture.sourceMaterial,
    })).toBe(true)
    const composition =
      resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
        fixture.previousRoot,
      )
    expect(composition).not.toBeNull()
    if (composition == null) return
    const candidateAuthority =
      resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        composition,
        candidateWork: accepted.completedCandidateWork,
      })
    expect(candidateAuthority).toMatchObject({
      producingStageAuthority: accepted.evidence,
      receipts: expect.arrayContaining([
        expect.objectContaining({
          ownerRow: expect.objectContaining({
            unit: "evidence-acceptance-registrations",
          }),
          attemptedWork: 1,
          completedWork: 1,
        }),
      ]),
    })
  }, 30_000)

  it("authorized acceptance follows consumed authority rows instead of the legacy mirrored producer formula", () => {
    const fixture = authorizedFixture({
      insertedText: "LedgerOnly",
      extraProducerDescriptorCharge: true,
    })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    const terminal = inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      fixture.producerInvocationAuthority,
    )
    const descriptorWork = terminal?.completedWork.find(
      (row) => row.unit === "evidence-producer-descriptors",
    )?.completedWork
    expect(descriptorWork).toBeGreaterThan(1)
    expect(fixture.result.response.work.visitedEvidenceNodeCount)
      .toBe(terminal?.visitedEvidenceNodeCount)

    const accepted =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        response: fixture.result.response,
      })

    expect(accepted.status).toBe("accepted")
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-producer-descriptors",
    )).toBe(descriptorWork)
  })

  it.each([
    "authority-clone",
    "request-clone",
    "material-clone",
    "cross-tuple",
    "stale",
  ] as const)("authorized acceptance rejects %s before observing detached payloads", (kind) => {
    const exact = authorizedFixture({ insertedText: `R-${kind}` })
    expect(exact.result.status).toBe("accepted")
    if (exact.result.status !== "accepted") return
    const cross = kind === "cross-tuple"
      ? authorizedFixture({ insertedText: "R-cross-other" })
      : null
    const stale = kind === "stale"
      ? authorizedFixture({
          insertedText: "R-stale",
          limits: { "evidence-acceptance-descriptors": 0 },
        })
      : null
    if (stale != null && stale.result.status === "accepted") {
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: stale.previousRoot,
        change: stale.change,
        request: stale.request,
        sourceMaterial: stale.sourceMaterial,
        producerInvocationAuthority: stale.producerInvocationAuthority,
        producerRuntimeIdentity: stale.producerRuntimeIdentity,
        response: stale.result.response,
      })
    }
    const authority = kind === "authority-clone"
      ? Object.freeze({ ...exact.producerInvocationAuthority })
      : kind === "cross-tuple" && cross != null
        ? cross.producerInvocationAuthority
        : kind === "stale" && stale != null
          ? stale.producerInvocationAuthority
          : exact.producerInvocationAuthority
    const observed: string[] = []
    const request = kind === "authority-clone"
      ? hostileObject("request", observed) as never
      : kind === "request-clone"
        ? structuredClone(exact.request)
        : exact.request
    const sourceMaterial = kind === "authority-clone"
      ? hostileObject("material", observed) as never
      : kind === "material-clone"
        ? structuredClone(exact.sourceMaterial)
        : exact.sourceMaterial
    const result =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: hostileObject("root", observed) as never,
        change: hostileObject("change", observed) as never,
        request,
        sourceMaterial,
        producerInvocationAuthority: authority,
        producerRuntimeIdentity: hostileObject("runtime", observed) as never,
        response: hostileObject("response", observed),
      })

    expect(result).toMatchObject({ status: "blocked", evidence: null })
    expect(observed).toEqual([])
  })

  it("authorized acceptance rejects replay and runtime mismatch before observing the response", () => {
    const replay = authorizedFixture({ insertedText: "Replay" })
    expect(replay.result.status).toBe("accepted")
    if (replay.result.status !== "accepted") return
    const first = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: replay.previousRoot,
      change: replay.change,
      request: replay.request,
      sourceMaterial: replay.sourceMaterial,
      producerInvocationAuthority: replay.producerInvocationAuthority,
      producerRuntimeIdentity: replay.producerRuntimeIdentity,
      response: replay.result.response,
    })
    expect(first.status).toBe("accepted")
    const replayObserved: string[] = []
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: hostileObject("root", replayObserved) as never,
      change: hostileObject("change", replayObserved) as never,
      request: replay.request,
      sourceMaterial: replay.sourceMaterial,
      producerInvocationAuthority: replay.producerInvocationAuthority,
      producerRuntimeIdentity: hostileObject("runtime", replayObserved) as never,
      response: hostileObject("response", replayObserved),
    })).toMatchObject({ status: "blocked", evidence: null })
    expect(replayObserved).toEqual([])

    const mismatch = authorizedFixture({ insertedText: "RuntimeMismatch" })
    expect(mismatch.result.status).toBe("accepted")
    if (mismatch.result.status !== "accepted") return
    const other = authorizedFixture({ insertedText: "OtherRuntime" })
    const mismatchObserved: string[] = []
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: mismatch.previousRoot,
      change: mismatch.change,
      request: mismatch.request,
      sourceMaterial: mismatch.sourceMaterial,
      producerInvocationAuthority: mismatch.producerInvocationAuthority,
      producerRuntimeIdentity: other.producerRuntimeIdentity,
      response: hostileObject("response", mismatchObserved),
    })).toMatchObject({ status: "blocked", evidence: null })
    expect(mismatchObserved).toEqual([])
  })

  it("authorized acceptance rejects a caller-authored authority lookalike after raw adapter mechanics ran", () => {
    const fixture = authorizedFixture({ insertedText: "LookalikeBase" })
    const lookalike = Object.freeze({
      source: "vnext-text-block-transition-producer-invocation-authority-v2" as const,
      contractVersion: 2 as const,
      begin: () => ({ status: "started" as const }),
      charge: (unit: Parameters<typeof fixture.producerInvocationAuthority.charge>[0]) => ({
        status: "charged" as const,
        unit,
        completedWork: 1,
        effectiveLimit: 8_192,
      }),
      bindRuntimeIdentity: () => ({ status: "bound" as const }),
      close: () => ({ status: "closed" as const, visitedEvidenceNodeCount: 1 }),
    })
    const raw = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      lookalike,
      fixture.request,
      fixture.sourceMaterial,
      {
        identity: fixture.producerRuntimeIdentity,
        shapeRange(shapeInput) {
          const face = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.find(
            (candidate) => candidate.fontFaceId === shapeInput.fontFaceId,
          )
          if (face == null) throw new Error("font unavailable")
          return runFlowDocTextEngineNodeMr1RangeShapeV1({
            text: shapeInput.text,
            fontId: face.fontFaceId,
            fontAssetPath: face.fontAssetPath,
            fontSha256: face.fontSha256,
            rangeStartUtf16: shapeInput.rangeStartUtf16,
            rangeEndUtf16: shapeInput.rangeEndUtf16,
            contextStartUtf16: shapeInput.contextStartUtf16,
            contextEndUtf16: shapeInput.contextEndUtf16,
          })
        },
        segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1,
      },
    )
    expect(raw.status).toBe("accepted")
    if (raw.status !== "accepted") return
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      lookalike,
    )).toBeNull()
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: lookalike,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      response: raw.response,
    })).toMatchObject({ status: "blocked", evidence: null })
  })

  it("authorized acceptance rejects forced fingerprint collisions and retains exact producer plus acceptance work", () => {
    const fixture = authorizedFixture({ insertedText: "Collision" })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    const producerSnapshot =
      inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        fixture.producerInvocationAuthority,
      )
    const collision = {
      ...structuredClone(fixture.result.response),
      runtimeIdentity: fixture.producerRuntimeIdentity,
      sourceTopologyFingerprint: "forced-fingerprint-collision-shape",
      fingerprint: fixture.result.response.fingerprint,
    }
    const result = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: fixture.producerInvocationAuthority,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      response: collision,
    })

    expect(result).toMatchObject({ status: "blocked", evidence: null })
    if (producerSnapshot == null) return
    for (const row of producerSnapshot.completedWork) {
      expect(workCount(result.completedCandidateWork, row.unit)).toBe(row.completedWork)
    }
    expect(workCount(result.completedCandidateWork, "evidence-acceptance-descriptors"))
      .toBeGreaterThan(0)
    expectExactProducerSemanticCounters(
      result.completedCandidateWork,
      fixture.result.response.work,
    )
    expect(result.completedCandidateWork.completeNextInputTraversalCount).toBe(0)
    expect(result.completedCandidateWork.flow.completeTreeRebuildCount).toBe(0)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
    expect(result.completedCandidateWork.completeSceneTraversalCount).toBe(0)
  })

  it.each([
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
  ] as const)("authorized acceptance stops before a zero %s operation, registers once, and backs fallback by the exact terminal", (unit) => {
    const fixture = authorizedFixture({ insertedText: unit, limits: { [unit]: 0 } })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    const observed: string[] = []
    const response = unit === "evidence-acceptance-descriptors"
      ? hostileObject("response", observed)
      : fixture.result.response
    const result = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: fixture.producerInvocationAuthority,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      response,
    })

    expect(result).toMatchObject({
      status: "fallback-required",
      evidence: null,
      evaluatorOrProofAuthority: expect.any(Object),
      issues: [],
    })
    expect(workCount(result.completedCandidateWork, unit)).toBe(0)
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    expect(result.completedCandidateWork.completeNextInputTraversalCount).toBe(0)
    expect(result.completedCandidateWork.completeSceneTraversalCount).toBe(0)
    if (unit === "evidence-acceptance-descriptors") expect(observed).toEqual([])
    if (result.status !== "fallback-required") return
    const record = getAuthorizedFallbackRecord(result.evaluatorOrProofAuthority)
    expect(record).toMatchObject({
      terminal: {
        state: "acceptance-consumed",
        terminalOutcome: "producer-response",
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        runtimeIdentity: fixture.producerRuntimeIdentity,
      },
      failureKind: "acceptance-work-limit",
      producerFailureCode: null,
      acceptanceFailedEvaluation: {
        unit,
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
      producerWork: fixture.result.response.work,
      completedCandidateWork: result.completedCandidateWork,
    })
    expect(Object.isFrozen(record)).toBe(true)
    expect(Object.isFrozen(record?.terminal)).toBe(true)
    expect(Object.isFrozen(record?.producerWork)).toBe(true)
    expect(Object.isFrozen(record?.acceptanceFailedEvaluation)).toBe(true)
  })

  it("blocks a denied fallback registration without minting authority", () => {
    const fixture = authorizedFixture({
      insertedText: "RegistrationDenied",
      limits: {
        "evidence-acceptance-descriptors": 0,
        "evidence-acceptance-registrations": 0,
      },
    })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return

    const result =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        response: hostileObject("registration-denied-response", []),
      })

    expect(result).toMatchObject({ status: "blocked", evidence: null })
    expect("evaluatorOrProofAuthority" in result).toBe(false)
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(0)
  })

  it.each([
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
  ] as const)("failure acceptance stops at a zero %s ceiling, registers once, and retains exact producer facts", (unit) => {
    const fixture = authorizedFixture({
      insertedText: `Failure-${unit}`,
      runtimeFailure: "shape",
      limits: { [unit]: 0 },
    })
    expect(fixture.result.status).toBe("blocked")
    if (fixture.result.status !== "blocked") return
    const result =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: fixture.result.failure,
      })

    expect(result).toMatchObject({
      status: "fallback-required",
      evaluatorOrProofAuthority: expect.any(Object),
      issues: [],
    })
    expect(workCount(result.completedCandidateWork, unit)).toBe(0)
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    expectExactProducerSemanticCounters(
      result.completedCandidateWork,
      fixture.result.failure.completedWork,
    )
    if (result.status === "fallback-required") {
      const record = getAuthorizedFallbackRecord(
        result.evaluatorOrProofAuthority,
      )
      expect(record).toMatchObject({
        terminal: {
          state: "acceptance-consumed",
          terminalOutcome: "producer-failure",
          request: fixture.request,
          sourceMaterial: fixture.sourceMaterial,
          runtimeIdentity: fixture.producerRuntimeIdentity,
        },
        failureKind: "acceptance-work-limit",
        producerFailureCode: null,
        acceptanceFailedEvaluation: {
          unit,
          attemptedWork: 1,
          completedWork: 0,
          effectiveLimit: 0,
        },
        producerWork: fixture.result.failure.completedWork,
        completedCandidateWork: result.completedCandidateWork,
      })
      expect(Object.isFrozen(record)).toBe(true)
      expect(Object.isFrozen(record?.terminal)).toBe(true)
      expect(Object.isFrozen(record?.producerWork)).toBe(true)
      expect(Object.isFrozen(record?.acceptanceFailedEvaluation)).toBe(true)
    }
  })

  it.each([
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
    "evidence-acceptance-registrations",
  ] as const)("authorized acceptance preserves exact below/at threshold work for %s", (unit) => {
    const baseline = authorizedFixture({ insertedText: `Threshold-${unit}` })
    expect(baseline.result.status).toBe("accepted")
    if (baseline.result.status !== "accepted") return
    const acceptedBaseline =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: baseline.previousRoot,
        change: baseline.change,
        request: baseline.request,
        sourceMaterial: baseline.sourceMaterial,
        producerInvocationAuthority: baseline.producerInvocationAuthority,
        producerRuntimeIdentity: baseline.producerRuntimeIdentity,
        response: baseline.result.response,
      })
    expect(acceptedBaseline.status).toBe("accepted")
    const exactCompleted = workCount(acceptedBaseline.completedCandidateWork, unit)
    expect(exactCompleted).toBeGreaterThan(0)

    const below = authorizedFixture({
      insertedText: `Threshold-${unit}`,
      limits: { [unit]: exactCompleted - 1 },
    })
    expect(below.result.status).toBe("accepted")
    if (below.result.status !== "accepted") return
    const belowAcceptance =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: below.previousRoot,
        change: below.change,
        request: below.request,
        sourceMaterial: below.sourceMaterial,
        producerInvocationAuthority: below.producerInvocationAuthority,
        producerRuntimeIdentity: below.producerRuntimeIdentity,
        response: below.result.response,
      })
    expect(belowAcceptance).toMatchObject(unit === "evidence-acceptance-registrations"
      ? {
          status: "blocked",
          evidence: null,
          issues: expect.any(Array),
        }
      : {
          status: "fallback-required",
          evidence: null,
          issues: [],
        })
    expect(workCount(belowAcceptance.completedCandidateWork, unit))
      .toBe(exactCompleted - 1)

    const at = authorizedFixture({
      insertedText: `Threshold-${unit}`,
      limits: { [unit]: exactCompleted },
    })
    expect(at.result.status).toBe("accepted")
    if (at.result.status !== "accepted") return
    const atAcceptance =
      acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
        previousRoot: at.previousRoot,
        change: at.change,
        request: at.request,
        sourceMaterial: at.sourceMaterial,
        producerInvocationAuthority: at.producerInvocationAuthority,
        producerRuntimeIdentity: at.producerRuntimeIdentity,
        response: at.result.response,
      })
    expect(atAcceptance.status).toBe("accepted")
    expect(workCount(atAcceptance.completedCandidateWork, unit)).toBe(exactCompleted)
  })

  it("uses a high control to reach a late invalid offset and a hand-derived boundary to stop before observing it", () => {
    const duplicateLateOffsetResponse = (
      response: VNextTextBlockTransitionProducerResponseV2,
      runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
    ) => {
      const copy = structuredClone(response)
      const secondProof = copy.segmentationBoundaryProofs[1]
      if (secondProof == null) {
        throw new Error("late-offset fixture requires two proofs")
      }
      const duplicateOffset = secondProof.targetBreakOffsets[0]
      if (duplicateOffset == null) {
        throw new Error("late-offset fixture requires one valid target offset")
      }
      const invalidSecondProof = rehash({
        ...secondProof,
        targetBreakOffsets: [duplicateOffset, duplicateOffset],
      })
      return {
        duplicateOffset,
        response: rehash({
          ...copy,
          segmentationBoundaryProofs: [
            copy.segmentationBoundaryProofs[0]!,
            invalidSecondProof,
          ],
          runtimeIdentity,
        }),
      }
    }
    const acceptTrackingOffsetSafeIntegerChecks = (
      fixture: ReturnType<typeof authorizedFixture>,
      response: VNextTextBlockTransitionProducerResponseV2,
      trackedOffset: number,
    ) => {
      let semanticOffsetSafeIntegerCheckCount = 0
      const original = Number.isSafeInteger
      const spy = vi.spyOn(Number, "isSafeInteger").mockImplementation((value) => {
        if (value === trackedOffset) {
          const firstLayoutFrame = new Error().stack
            ?.split("\n")
            .find((line) =>
              line.includes("src/layout/") || line.includes("src\\layout\\")
            )
          if (firstLayoutFrame?.includes(
            "textBlockUnifiedLayoutTransitionEvidenceV2.ts",
          )) {
            semanticOffsetSafeIntegerCheckCount += 1
          }
        }
        return original(value)
      })
      try {
        return {
          result:
            acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
              previousRoot: fixture.previousRoot,
              change: fixture.change,
              request: fixture.request,
              sourceMaterial: fixture.sourceMaterial,
              producerInvocationAuthority: fixture.producerInvocationAuthority,
              producerRuntimeIdentity: fixture.producerRuntimeIdentity,
              response: response,
            }),
          semanticOffsetSafeIntegerCheckCount,
        }
      } finally {
        spy.mockRestore()
      }
    }

    const high = authorizedFixture({
      insertedText: "LateOffsetHighControl",
      limits: { "evidence-acceptance-comparisons": 8192 },
    })
    expect(high.result.status).toBe("accepted")
    if (high.result.status !== "accepted") return
    const highLateInvalidFixture = duplicateLateOffsetResponse(
      high.result.response,
      high.producerRuntimeIdentity,
    )
    const highLateInvalid = highLateInvalidFixture.response
    expect(highLateInvalid.segmentationBoundaryProofs[1]?.targetBreakOffsets)
      .toEqual([
        highLateInvalidFixture.duplicateOffset,
        highLateInvalidFixture.duplicateOffset,
      ])
    expect(LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY).toBe(737)

    const exactSafeInteger = Number.isSafeInteger
    const highObserved = acceptTrackingOffsetSafeIntegerChecks(
      high,
      highLateInvalid,
      highLateInvalidFixture.duplicateOffset,
    )
    expect(Number.isSafeInteger).toBe(exactSafeInteger)
    expect(highObserved.result).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [{
        message: "segmentation proof differs from the exact bounded attempt",
      }],
    })
    expect("evaluatorOrProofAuthority" in highObserved.result).toBe(false)
    expect(workCount(
      highObserved.result.completedCandidateWork,
      "evidence-acceptance-comparisons",
    )).toBe(LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY + 6)
    expect(workCount(
      highObserved.result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(0)
    expectExactProducerSemanticCounters(
      highObserved.result.completedCandidateWork,
      high.result.response.work,
    )

    const low = authorizedFixture({
      insertedText: "LateOffsetLowBoundary",
      limits: {
        "evidence-acceptance-comparisons":
          LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY,
      },
    })
    expect(low.result.status).toBe("accepted")
    if (low.result.status !== "accepted") return
    const lowLateInvalidFixture = duplicateLateOffsetResponse(
      low.result.response,
      low.producerRuntimeIdentity,
    )
    const lowLateInvalid = lowLateInvalidFixture.response
    expect(lowLateInvalidFixture.duplicateOffset)
      .toBe(highLateInvalidFixture.duplicateOffset)

    const lowObserved = acceptTrackingOffsetSafeIntegerChecks(
      low,
      lowLateInvalid,
      lowLateInvalidFixture.duplicateOffset,
    )
    expect(Number.isSafeInteger).toBe(exactSafeInteger)
    expect(lowObserved.result).toMatchObject({
      status: "fallback-required",
      evidence: null,
      evaluatorOrProofAuthority: expect.any(Object),
      issues: [],
    })
    expect(workCount(
      lowObserved.result.completedCandidateWork,
      "evidence-acceptance-comparisons",
    )).toBe(LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY)
    expect(workCount(
      lowObserved.result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    expect(highObserved.semanticOffsetSafeIntegerCheckCount)
      .toBe(lowObserved.semanticOffsetSafeIntegerCheckCount + 1)
    expectExactProducerSemanticCounters(
      lowObserved.result.completedCandidateWork,
      low.result.response.work,
    )
    if (lowObserved.result.status === "fallback-required") {
      const record = getAuthorizedFallbackRecord(
        lowObserved.result.evaluatorOrProofAuthority,
      )
      expect(record).toMatchObject({
        terminal: {
          state: "acceptance-consumed",
          terminalOutcome: "producer-response",
          request: low.request,
          sourceMaterial: low.sourceMaterial,
          runtimeIdentity: low.producerRuntimeIdentity,
        },
        failureKind: "acceptance-work-limit",
        producerFailureCode: null,
        producerWork: low.result.response.work,
        acceptanceFailedEvaluation: {
          unit: "evidence-acceptance-comparisons",
          attemptedWork: LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY + 1,
          completedWork: LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY,
          effectiveLimit: LATE_OFFSET_FIXTURE_COMPARISON_BOUNDARY,
        },
        completedCandidateWork: lowObserved.result.completedCandidateWork,
      })
    }
  }, 15_000)

  it("vertical authority zero-limit producer failure preserves attempted/completed facts and mints candidate-free work-limit fallback", () => {
    const fixture = authorizedFixture({
      insertedText: "Zero",
      limits: { "evidence-producer-descriptors": 0 },
    })
    expect(fixture.result).toMatchObject({
      status: "work-limit",
      response: null,
      failure: null,
      issues: [],
    })
    const terminal = inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      fixture.producerInvocationAuthority,
    )
    expect(terminal).toMatchObject({
      state: "producer-blocked",
      terminalOutcome: "producer-blocked",
      firstFailedEvaluation: {
        unit: "evidence-producer-descriptors",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
      visitedEvidenceNodeCount: 0,
    })

    const accepted =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: fixture.result.failure,
      })

    expect(accepted).toMatchObject({
      status: "fallback-required",
      evaluatorOrProofAuthority: expect.any(Object),
      completedCandidateWork: {
        evidence: {
          consumedAtomCount: 0,
          consumedClusterCount: 0,
        },
        completeNextInputTraversalCount: 0,
        completeSceneTraversalCount: 0,
      },
      issues: [],
    })
    expect(workCount(accepted.completedCandidateWork, "evidence-producer-descriptors"))
      .toBe(0)
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    if (accepted.status === "fallback-required") {
      expect(getAuthorizedFallbackRecord(
        accepted.evaluatorOrProofAuthority,
      )).toMatchObject({
        terminal: {
          state: "acceptance-consumed",
          terminalOutcome: "producer-blocked",
          firstFailedEvaluation: {
            unit: "evidence-producer-descriptors",
            attemptedWork: 1,
            completedWork: 0,
            effectiveLimit: 0,
          },
        },
        failureKind: "producer-work-limit",
        producerFailureCode: "work-ceiling-before-visit",
        producerWork: {
          requestedAtomCount: 3,
          requestedClusterCount: 3,
          consumedAtomCount: 0,
          consumedClusterCount: 0,
          unusedCoverageRenderedUtf16Length: 0,
          visitedEvidenceNodeCount: 0,
          completeNextInputTraversalCount: 0,
          completeNextInputComparisonCount: 0,
        },
        completedCandidateWork: accepted.completedCandidateWork,
      })
    }
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      fixture.producerInvocationAuthority,
    )).toMatchObject({
      state: "acceptance-consumed",
      firstFailedEvaluation: {
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
    })
  })

  it("accepts an exact late response-fact ceiling as a candidate-free producer work-limit fallback", () => {
    const fixture = authorizedFixture({
      insertedText: "LateProducerBlocked",
      limits: {
        "evidence-response-facts": 0,
        "evidence-acceptance-descriptors": 0,
      },
    })
    expect(fixture.result).toMatchObject({
      status: "work-limit",
      response: null,
      failure: null,
      issues: [],
    })
    const terminal =
      inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        fixture.producerInvocationAuthority,
      )
    expect(terminal).toMatchObject({
      state: "producer-blocked",
      terminalOutcome: "producer-blocked",
      firstFailedEvaluation: {
        unit: "evidence-response-facts",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
    })
    const exactClusterCount = terminal?.completedWork.find(
      (row) => row.unit === "evidence-clusters",
    )?.completedWork ?? 0
    expect(exactClusterCount).toBeGreaterThan(0)

    const accepted =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: fixture.result.failure,
      })

    expect(accepted).toMatchObject({
      status: "fallback-required",
      evaluatorOrProofAuthority: expect.any(Object),
      completedCandidateWork: {
        evidence: {
          consumedAtomCount: fixture.sourceMaterial.next.atoms.length,
          consumedClusterCount: exactClusterCount,
        },
      },
      issues: [],
    })
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-descriptors",
    )).toBe(0)
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    if (accepted.status === "fallback-required") {
      expect(getAuthorizedFallbackRecord(
        accepted.evaluatorOrProofAuthority,
      )).toMatchObject({
        terminal: {
          state: "acceptance-consumed",
          terminalOutcome: "producer-blocked",
          firstFailedEvaluation: {
            unit: "evidence-response-facts",
            attemptedWork: 1,
            completedWork: 0,
            effectiveLimit: 0,
          },
        },
        failureKind: "producer-work-limit",
        producerFailureCode: "work-ceiling-before-visit",
        producerWork: {
          consumedAtomCount: fixture.sourceMaterial.next.atoms.length,
          consumedClusterCount: exactClusterCount,
          visitedEvidenceNodeCount: terminal?.visitedEvidenceNodeCount,
          completeNextInputTraversalCount: 0,
          completeNextInputComparisonCount: 0,
        },
      })
    }
  })

  it("rejects an exact exceptional producer-blocked close that has no failed work evaluation", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({
      insertedText: "ExceptionalBlocked",
    })
    const runtimeIdentity =
      createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
        runtime: "node-native-mr1-range",
        engineBuildFingerprint: "engine-exceptional-blocked",
        fontBackendFingerprint: "font-exceptional-blocked",
        unitPolicyFingerprint: bundle.request.layoutUnitPolicyFingerprint,
        fontStyleUnitDependencyFingerprint:
          bundle.request.fontStyleUnitDependencyFingerprint,
        producerRuntimeRequirementFingerprint:
          bundle.request.producerRuntimeRequirementFingerprint,
      })
    expect(bundle.producerInvocationAuthority.begin(
      bundle.request,
      bundle.sourceMaterial,
    )).toEqual({ status: "started" })
    expect(bundle.producerInvocationAuthority.charge(
      "evidence-producer-descriptors",
    )).toMatchObject({
      status: "charged",
      unit: "evidence-producer-descriptors",
      completedWork: 1,
    })
    expect(bundle.producerInvocationAuthority.bindRuntimeIdentity(
      runtimeIdentity,
    )).toEqual({ status: "bound" })
    expect(bundle.producerInvocationAuthority.close("producer-blocked"))
      .toEqual({ status: "closed", visitedEvidenceNodeCount: 1 })

    const accepted = acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: bundle.root,
      change: bundle.change,
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      producerInvocationAuthority: bundle.producerInvocationAuthority,
      producerRuntimeIdentity: runtimeIdentity,
      failure: null,
    })

    expect(accepted).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
    })
  })

  it("retains consumed atoms when a late runtime-output descriptor ceiling becomes producer-blocked", () => {
    const calibration = authorizedFixture({ insertedText: "DescriptorCalibration" })
    expect(calibration.result.status).toBe("accepted")
    const calibrationTerminal =
      inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        calibration.producerInvocationAuthority,
      )
    const exactDescriptorCount = calibrationTerminal?.completedWork.find(
      (row) => row.unit === "evidence-producer-descriptors",
    )?.completedWork ?? 0
    expect(exactDescriptorCount).toBeGreaterThan(1)

    const fixture = authorizedFixture({
      insertedText: "LateDescriptorProducerBlocked",
      limits: {
        "evidence-producer-descriptors": exactDescriptorCount - 1,
        "evidence-response-facts": 0,
        "evidence-acceptance-descriptors": 0,
      },
    })
    expect(fixture.result).toMatchObject({
      status: "work-limit",
      response: null,
      failure: null,
      issues: [],
    })
    const terminal =
      inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        fixture.producerInvocationAuthority,
      )
    expect(terminal).toMatchObject({
      state: "producer-blocked",
      terminalOutcome: "producer-blocked",
      firstFailedEvaluation: {
        unit: "evidence-producer-descriptors",
        attemptedWork: exactDescriptorCount,
        completedWork: exactDescriptorCount - 1,
        effectiveLimit: exactDescriptorCount - 1,
      },
    })
    expect(terminal?.completedWork.some((row) =>
      row.unit !== "evidence-producer-descriptors" && row.completedWork > 0
    )).toBe(true)
    const exactClusterCount = terminal?.completedWork.find(
      (row) => row.unit === "evidence-clusters",
    )?.completedWork ?? 0

    const accepted =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: fixture.result.failure,
      })

    expect(accepted).toMatchObject({
      status: "fallback-required",
      evaluatorOrProofAuthority: expect.any(Object),
      completedCandidateWork: {
        evidence: {
          consumedAtomCount: fixture.sourceMaterial.next.atoms.length,
          consumedClusterCount: exactClusterCount,
        },
      },
    })
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
  })

  it("blocks exact producer failure when its fallback registration is denied", () => {
    const fixture = authorizedFixture({
      insertedText: "FailureRegistrationDenied",
      runtimeFailure: "shape",
      limits: { "evidence-acceptance-registrations": 0 },
    })
    expect(fixture.result.status).toBe("blocked")
    if (fixture.result.status !== "blocked") return

    const result =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: fixture.result.failure,
      })

    expect(result).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
    })
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(0)
    expectExactProducerSemanticCounters(
      result.completedCandidateWork,
      fixture.result.failure.completedWork,
    )
  })

  it("vertical authority exact denied-next cluster retains one emitted cluster and rejects a rehashed non-ceiling work-limit forgery", () => {
    const ceiling = authorizedFixture({
      insertedText: "ClusterCeiling",
      producerInsertedText: "AA",
      limits: { "evidence-clusters": 1 },
    })
    expect(ceiling.result).toMatchObject({
      status: "blocked",
      failure: {
        code: "work-ceiling-before-visit",
        completedWork: { consumedClusterCount: 1 },
      },
    })
    if (ceiling.result.status !== "blocked") return
    const accepted = acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: ceiling.previousRoot,
      change: ceiling.change,
      request: ceiling.request,
      sourceMaterial: ceiling.sourceMaterial,
      producerInvocationAuthority: ceiling.producerInvocationAuthority,
      producerRuntimeIdentity: ceiling.producerRuntimeIdentity,
      failure: ceiling.result.failure,
    })
    expect(accepted).toMatchObject({
      status: "fallback-required",
      completedCandidateWork: { evidence: { consumedClusterCount: 1 } },
      issues: [],
    })
    expectExactProducerSemanticCounters(
      accepted.completedCandidateWork,
      ceiling.result.failure.completedWork,
    )
    if (accepted.status === "fallback-required") {
      expect(getAuthorizedFallbackRecord(
        accepted.evaluatorOrProofAuthority,
      )).toMatchObject({
        failureKind: "producer-work-limit",
        producerFailureCode: "work-ceiling-before-visit",
        producerWork: ceiling.result.failure.completedWork,
        completedCandidateWork: accepted.completedCandidateWork,
      })
    }

    const exactNonCeiling = authorizedFixture({
      insertedText: "ExactNonCeiling",
      runtimeFailure: "shape",
    })
    expect(exactNonCeiling.result).toMatchObject({
      status: "blocked",
      failure: { code: "pinned-font-unavailable" },
    })
    if (exactNonCeiling.result.status !== "blocked") return
    const exactNonCeilingAcceptance =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: exactNonCeiling.previousRoot,
      change: exactNonCeiling.change,
      request: exactNonCeiling.request,
      sourceMaterial: exactNonCeiling.sourceMaterial,
      producerInvocationAuthority: exactNonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: exactNonCeiling.producerRuntimeIdentity,
      failure: exactNonCeiling.result.failure,
    })
    expect(exactNonCeilingAcceptance).toMatchObject({
      status: "fallback-required",
      evaluatorOrProofAuthority: expect.any(Object),
      issues: [],
    })
    expectExactProducerSemanticCounters(
      exactNonCeilingAcceptance.completedCandidateWork,
      exactNonCeiling.result.failure.completedWork,
    )
    expect(workCount(
      exactNonCeilingAcceptance.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
    if (exactNonCeilingAcceptance.status === "fallback-required") {
      expect(getAuthorizedFallbackRecord(
        exactNonCeilingAcceptance.evaluatorOrProofAuthority,
      )).toMatchObject({
        failureKind: "producer-proof-failed",
        producerFailureCode: "pinned-font-unavailable",
        producerWork: exactNonCeiling.result.failure.completedWork,
      })
    }
    const replayObserved: string[] = []
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: hostileObject("failure-replay-root", replayObserved) as never,
      change: hostileObject("failure-replay-change", replayObserved) as never,
      request: exactNonCeiling.request,
      sourceMaterial: exactNonCeiling.sourceMaterial,
      producerInvocationAuthority: exactNonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: hostileObject(
        "failure-replay-runtime",
        replayObserved,
      ) as never,
      failure: hostileObject("failure-replay-payload", replayObserved),
    })).toMatchObject({ status: "blocked", evaluatorOrProofAuthority: null })
    expect(replayObserved).toEqual([])

    const nonCeiling = authorizedFixture({
      insertedText: "ForgedNonCeiling",
      runtimeFailure: "shape",
    })
    expect(nonCeiling.result.status).toBe("blocked")
    if (nonCeiling.result.status !== "blocked") return
    const forged = rehash({
      ...structuredClone(nonCeiling.result.failure),
      runtimeIdentity: nonCeiling.producerRuntimeIdentity,
      code: "work-ceiling-before-visit" as const,
    })
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: nonCeiling.previousRoot,
      change: nonCeiling.change,
      request: nonCeiling.request,
      sourceMaterial: nonCeiling.sourceMaterial,
      producerInvocationAuthority: nonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: nonCeiling.producerRuntimeIdentity,
      failure: forged,
    })).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
      issues: [{
        message: "work-limit failure does not match the exact failed terminal evaluation",
      }],
    })
  })

  it("vertical authority rejects failure replay/lookalike before hostile payload access", () => {
    const fixture = authorizedFixture({
      insertedText: "FailureAuthorityReject",
      runtimeFailure: "shape",
    })
    expect(fixture.result.status).toBe("blocked")
    if (fixture.result.status !== "blocked") return
    const observed: string[] = []
    let accessorCalls = 0
    const failureAccessor = Object.create(null) as Record<string, unknown>
    Object.defineProperty(failureAccessor, "fingerprint", {
      enumerable: true,
      get() {
        accessorCalls += 1
        throw new Error("failure accessor must not run")
      },
    })
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
      previousRoot: hostileObject("root", observed) as never,
      change: hostileObject("change", observed) as never,
      request: hostileObject("request", observed) as never,
      sourceMaterial: hostileObject("material", observed) as never,
      producerInvocationAuthority: Object.freeze({
        ...fixture.producerInvocationAuthority,
      }),
      producerRuntimeIdentity: hostileObject("runtime", observed) as never,
      failure: failureAccessor,
    })).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
    })
    expect(observed).toEqual([])
    expect(accessorCalls).toBe(0)
  })

  it.each([
    ["requestedAtomCount", 2],
    ["requestedClusterCount", 2],
    ["consumedAtomCount", 1],
    ["consumedClusterCount", 1],
    ["unusedCoverageRenderedUtf16Length", 1],
    ["visitedEvidenceNodeCount", 334],
    ["completeNextInputTraversalCount", 1],
    ["completeNextInputComparisonCount", 1],
  ] as const)("rejects a rehashed failure mutation of exact semantic counter %s and retains trusted producer facts", (field, replacement) => {
    const fixture = authorizedFixture({
      insertedText: `FailureCounter-${field}`,
      runtimeFailure: "shape",
    })
    expect(fixture.result.status).toBe("blocked")
    if (fixture.result.status !== "blocked") return
    const mutatedWork = {
      ...structuredClone(fixture.result.failure.completedWork),
      [field]: replacement,
    }
    const mutatedFailure = rehash({
      ...structuredClone(fixture.result.failure),
      runtimeIdentity: fixture.producerRuntimeIdentity,
      completedWork: mutatedWork,
    })

    const result =
      acceptVNextTextBlockUnifiedLayoutProducerFailureV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        failure: mutatedFailure,
      })

    expect(result).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
    })
    expectExactProducerSemanticCounters(
      result.completedCandidateWork,
      fixture.result.failure.completedWork,
    )
  })
})
