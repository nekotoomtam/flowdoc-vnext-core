import { describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import {
  createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2,
  createFlowDocTextEngineUnifiedIncrementalEvidenceV2,
} from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2,
  acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2,
  acceptVNextTextBlockUnifiedLayoutProducerFailureV2,
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
  hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import * as transitionEvidenceV2Internals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import { noOpUnifiedLayoutChange5b } from "./helpers/textBlockUnifiedIncremental5b.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  admitted5B2RootFixture,
  authorizedProducerTerminalFixture5B2 as authorizedFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.js"

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

function exactFixture() {
  const actualFontFaces = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
    .filter((face) => face.fontFaceId === "sarabun-regular")
    .map(({ fontAssetPath: _path, ...face }) => ({ ...face }))
  const root = admitted5B2RootFixture({
    content: "text-only",
    text: "flowdoc evidence",
    fontFaces: actualFontFaces,
  })
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("evidence root fixture blocked")
  const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text")
  if (item?.kind !== "text") throw new Error("evidence text fixture missing")
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-insertion" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    atRenderedUtf16: "flowdoc evidence".length,
    insertedText: "X",
    insertedSource: { lineageId: "accept-v2", sourceFingerprint: "accept-source-v2", provenanceFingerprint: "accept-provenance-v2" },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`evidence request fixture was ${bundle.status}`)
  const runtimeIdentity = createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime: "node-native-mr1-range",
    engineBuildFingerprint: "engine-node-v2",
    fontBackendFingerprint: "font-backend-node-v2",
    unitPolicyFingerprint: bundle.request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint: bundle.request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint: bundle.request.producerRuntimeRequirementFingerprint,
  })
  const produced = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
    request: bundle.request,
    sourceMaterial: bundle.sourceMaterial,
    runtime: {
      identity: runtimeIdentity,
      shapeRange(input) {
        const face = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.find((candidate) => candidate.fontFaceId === input.fontFaceId)
        if (face == null) throw new Error("font unavailable")
        return runFlowDocTextEngineNodeMr1RangeShapeV1({ text: input.text, fontId: face.fontFaceId, fontAssetPath: face.fontAssetPath, fontSha256: face.fontSha256, rangeStartUtf16: input.rangeStartUtf16, rangeEndUtf16: input.rangeEndUtf16, contextStartUtf16: input.contextStartUtf16, contextEndUtf16: input.contextEndUtf16 })
      },
      segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1,
    },
  })
  if (produced.status !== "accepted") throw new Error(`producer fixture blocked: ${produced.failure.code}`)
  return { previousRoot: root, change, request: bundle.request, sourceMaterial: bundle.sourceMaterial, producerRuntimeIdentity: runtimeIdentity, response: produced.response }
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.response,
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
  })

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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.response,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: stale.previousRoot,
        change: stale.change,
        request: stale.request,
        sourceMaterial: stale.sourceMaterial,
        producerInvocationAuthority: stale.producerInvocationAuthority,
        producerRuntimeIdentity: stale.producerRuntimeIdentity,
        responseOrFailure: stale.result.response,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: hostileObject("root", observed) as never,
        change: hostileObject("change", observed) as never,
        request,
        sourceMaterial,
        producerInvocationAuthority: authority,
        producerRuntimeIdentity: hostileObject("runtime", observed) as never,
        responseOrFailure: hostileObject("response", observed),
      })

    expect(result).toMatchObject({ status: "blocked", evidence: null })
    expect(observed).toEqual([])
  })

  it("authorized acceptance rejects replay and runtime mismatch before observing the response", () => {
    const replay = authorizedFixture({ insertedText: "Replay" })
    expect(replay.result.status).toBe("accepted")
    if (replay.result.status !== "accepted") return
    const first = acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: replay.previousRoot,
      change: replay.change,
      request: replay.request,
      sourceMaterial: replay.sourceMaterial,
      producerInvocationAuthority: replay.producerInvocationAuthority,
      producerRuntimeIdentity: replay.producerRuntimeIdentity,
      responseOrFailure: replay.result.response,
    })
    expect(first.status).toBe("accepted")
    const replayObserved: string[] = []
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: hostileObject("root", replayObserved) as never,
      change: hostileObject("change", replayObserved) as never,
      request: replay.request,
      sourceMaterial: replay.sourceMaterial,
      producerInvocationAuthority: replay.producerInvocationAuthority,
      producerRuntimeIdentity: hostileObject("runtime", replayObserved) as never,
      responseOrFailure: hostileObject("response", replayObserved),
    })).toMatchObject({ status: "blocked", evidence: null })
    expect(replayObserved).toEqual([])

    const mismatch = authorizedFixture({ insertedText: "RuntimeMismatch" })
    expect(mismatch.result.status).toBe("accepted")
    if (mismatch.result.status !== "accepted") return
    const other = authorizedFixture({ insertedText: "OtherRuntime" })
    const mismatchObserved: string[] = []
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: mismatch.previousRoot,
      change: mismatch.change,
      request: mismatch.request,
      sourceMaterial: mismatch.sourceMaterial,
      producerInvocationAuthority: mismatch.producerInvocationAuthority,
      producerRuntimeIdentity: other.producerRuntimeIdentity,
      responseOrFailure: hostileObject("response", mismatchObserved),
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
    const raw = createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: lookalike,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      responseOrFailure: raw.response,
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
    const result = acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: fixture.producerInvocationAuthority,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      responseOrFailure: collision,
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
    const responseOrFailure = unit === "evidence-acceptance-descriptors"
      ? hostileObject("response", observed)
      : fixture.result.response
    const result = acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: fixture.producerInvocationAuthority,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      responseOrFailure,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: hostileObject("registration-denied-response", []),
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.failure,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: baseline.previousRoot,
        change: baseline.change,
        request: baseline.request,
        sourceMaterial: baseline.sourceMaterial,
        producerInvocationAuthority: baseline.producerInvocationAuthority,
        producerRuntimeIdentity: baseline.producerRuntimeIdentity,
        responseOrFailure: baseline.result.response,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: below.previousRoot,
        change: below.change,
        request: below.request,
        sourceMaterial: below.sourceMaterial,
        producerInvocationAuthority: below.producerInvocationAuthority,
        producerRuntimeIdentity: below.producerRuntimeIdentity,
        responseOrFailure: below.result.response,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: at.previousRoot,
        change: at.change,
        request: at.request,
        sourceMaterial: at.sourceMaterial,
        producerInvocationAuthority: at.producerInvocationAuthority,
        producerRuntimeIdentity: at.producerRuntimeIdentity,
        responseOrFailure: at.result.response,
      })
    expect(atAcceptance.status).toBe("accepted")
    expect(workCount(atAcceptance.completedCandidateWork, unit)).toBe(exactCompleted)
  })

  it("charges each semantic element and stops at a hand-derived low limit before a late invalid offset", () => {
    const comparisonLimitBeforeLateOffset = 80
    const fixture = authorizedFixture({
      insertedText: "LateOffset",
      limits: {
        "evidence-acceptance-comparisons": comparisonLimitBeforeLateOffset,
      },
    })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return
    const response = structuredClone(fixture.result.response)
    const secondProof = response.segmentationBoundaryProofs[1]
    if (secondProof == null) throw new Error("late-offset fixture requires two proofs")
    const invalidSecondProof = rehash({
      ...secondProof,
      targetBreakOffsets: [0, 0],
    })
    const lateInvalid = rehash({
      ...response,
      segmentationBoundaryProofs: [
        response.segmentationBoundaryProofs[0]!,
        invalidSecondProof,
      ],
      runtimeIdentity: fixture.producerRuntimeIdentity,
    })

    const result =
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: lateInvalid,
      })

    expect(result).toMatchObject({
      status: "fallback-required",
      evidence: null,
      evaluatorOrProofAuthority: expect.any(Object),
      issues: [],
    })
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-comparisons",
    )).toBe(comparisonLimitBeforeLateOffset)
    expect(workCount(
      result.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(1)
  })

  it("vertical authority zero-limit producer failure preserves attempted/completed facts and mints candidate-free work-limit fallback", () => {
    const fixture = authorizedFixture({
      insertedText: "Zero",
      limits: { "evidence-producer-descriptors": 0 },
    })
    expect(fixture.result).toMatchObject({
      status: "not-invoked",
      response: null,
      failure: null,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.failure,
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

  it("blocks a late producer-blocked terminal before acceptance fallback and retains its exact producer rows", () => {
    const fixture = authorizedFixture({
      insertedText: "LateProducerBlocked",
      limits: {
        "evidence-response-facts": 0,
        "evidence-acceptance-descriptors": 0,
      },
    })
    expect(fixture.result).toMatchObject({
      status: "not-invoked",
      response: null,
      failure: null,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.failure,
      })

    expect(accepted).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
      completedCandidateWork: {
        evidence: {
          consumedAtomCount: fixture.sourceMaterial.next.atoms.length,
          consumedClusterCount: exactClusterCount,
        },
      },
    })
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-descriptors",
    )).toBe(0)
    expect(workCount(
      accepted.completedCandidateWork,
      "evidence-acceptance-registrations",
    )).toBe(0)
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
      status: "not-invoked",
      response: null,
      failure: null,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.failure,
      })

    expect(accepted).toMatchObject({
      status: "blocked",
      evaluatorOrProofAuthority: null,
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
    )).toBe(0)
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.failure,
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
    const accepted = acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
      previousRoot: ceiling.previousRoot,
      change: ceiling.change,
      request: ceiling.request,
      sourceMaterial: ceiling.sourceMaterial,
      producerInvocationAuthority: ceiling.producerInvocationAuthority,
      producerRuntimeIdentity: ceiling.producerRuntimeIdentity,
      responseOrFailure: ceiling.result.failure,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
      previousRoot: exactNonCeiling.previousRoot,
      change: exactNonCeiling.change,
      request: exactNonCeiling.request,
      sourceMaterial: exactNonCeiling.sourceMaterial,
      producerInvocationAuthority: exactNonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: exactNonCeiling.producerRuntimeIdentity,
      responseOrFailure: exactNonCeiling.result.failure,
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
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
      previousRoot: hostileObject("failure-replay-root", replayObserved) as never,
      change: hostileObject("failure-replay-change", replayObserved) as never,
      request: exactNonCeiling.request,
      sourceMaterial: exactNonCeiling.sourceMaterial,
      producerInvocationAuthority: exactNonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: hostileObject(
        "failure-replay-runtime",
        replayObserved,
      ) as never,
      responseOrFailure: hostileObject("failure-replay-payload", replayObserved),
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
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
      previousRoot: nonCeiling.previousRoot,
      change: nonCeiling.change,
      request: nonCeiling.request,
      sourceMaterial: nonCeiling.sourceMaterial,
      producerInvocationAuthority: nonCeiling.producerInvocationAuthority,
      producerRuntimeIdentity: nonCeiling.producerRuntimeIdentity,
      responseOrFailure: forged,
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
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
      previousRoot: hostileObject("root", observed) as never,
      change: hostileObject("change", observed) as never,
      request: hostileObject("request", observed) as never,
      sourceMaterial: hostileObject("material", observed) as never,
      producerInvocationAuthority: Object.freeze({
        ...fixture.producerInvocationAuthority,
      }),
      producerRuntimeIdentity: hostileObject("runtime", observed) as never,
      responseOrFailure: failureAccessor,
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
      acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: mutatedFailure,
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

describe("Core transition evidence V2 acceptance", () => {
  it("projects not-required preflight rows without leaking preflight or material", () => {
    const root = admitted5B2RootFixture({ content: "text-only" })
    expect(createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change: noOpUnifiedLayoutChange5b(root) })).toMatchObject({
      status: "not-required",
      request: null,
      sourceMaterial: null,
      evaluatorOrProofAuthority: null,
      issues: [],
    })
  })

  it("accepts only the exact registered request/material/runtime tuple", () => {
    const exact = exactFixture()
    const accepted = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(exact)
    expect(accepted).toMatchObject({ status: "accepted", issues: [] })
    if (accepted.status !== "accepted") return
    expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
      evidence: accepted.evidence,
      previousRoot: exact.previousRoot,
      change: exact.change,
      completedCandidateWork: accepted.completedCandidateWork,
      expectedRequest: exact.request,
      expectedSourceMaterial: exact.sourceMaterial,
    })).toBe(true)
    const equalDigestClone = structuredClone(accepted.evidence)
    expect(equalDigestClone.fingerprint).toBe(accepted.evidence.fingerprint)
    expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
      evidence: equalDigestClone,
      previousRoot: exact.previousRoot,
      change: exact.change,
      completedCandidateWork: accepted.completedCandidateWork,
      expectedRequest: exact.request,
      expectedSourceMaterial: exact.sourceMaterial,
    })).toBe(false)
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, sourceMaterial: structuredClone(exact.sourceMaterial) })).toMatchObject({ status: "blocked", evidence: null })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, producerRuntimeIdentity: structuredClone(exact.producerRuntimeIdentity) })).toMatchObject({ status: "blocked", evidence: null })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, request: structuredClone(exact.request) })).toMatchObject({ status: "blocked", evidence: null })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, change: structuredClone(exact.change) })).toMatchObject({ status: "blocked", evidence: null })
    const crossRuntimeIdentity = createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
      runtime: "node-native-mr1-range",
      engineBuildFingerprint: "engine-node-v2-cross-runtime",
      fontBackendFingerprint: "font-backend-node-v2-cross-runtime",
      unitPolicyFingerprint: exact.request.layoutUnitPolicyFingerprint,
      fontStyleUnitDependencyFingerprint: exact.request.fontStyleUnitDependencyFingerprint,
      producerRuntimeRequirementFingerprint: exact.request.producerRuntimeRequirementFingerprint,
    })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      ...exact,
      producerRuntimeIdentity: crossRuntimeIdentity,
    })).toMatchObject({ status: "blocked", evidence: null })
  })

  it("blocks response tampering, unknown fields, symbols, prototypes, and accessors", () => {
    const exact = exactFixture()
    const cloneResponse = () => ({ ...structuredClone(exact.response), runtimeIdentity: exact.producerRuntimeIdentity })
    const tampered = { ...cloneResponse(), sourceTopologyFingerprint: "collision-forced-same-shape" }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: tampered })).toMatchObject({ status: "blocked", evidence: null })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: { ...exact.response, callerDirtyRange: [0, 1] } })).toMatchObject({ status: "blocked", evidence: null })
    const symbol = { ...exact.response, [Symbol("hidden")]: true }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: symbol })).toMatchObject({ status: "blocked", evidence: null })
    const prototype = Object.assign(Object.create({ inherited: true }), exact.response)
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: prototype })).toMatchObject({ status: "blocked", evidence: null })
    let getterCalls = 0
    const accessor = { ...exact.response }
    Object.defineProperty(accessor, "fingerprint", { enumerable: true, get() { getterCalls += 1; return exact.response.fingerprint } })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: accessor })).toMatchObject({ status: "blocked", evidence: null })
    expect(getterCalls).toBe(0)

    const wrongText = cloneResponse()
    wrongText.shapingRuns[0]!.text = "tampered"
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongText) })).toMatchObject({ status: "blocked", evidence: null })
    const wrongCluster = cloneResponse()
    wrongCluster.shapingRuns[0]!.clusters[0]!.renderEndOffset += 1
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongCluster) })).toMatchObject({ status: "blocked", evidence: null })
    const wrongBoundary = {
      ...cloneResponse(),
      shapingBoundaryProofs: [
        rehash({ ...structuredClone(exact.response.shapingBoundaryProofs[0]!), rightBoundary: "safe-first-right-guard-glyph" as const }),
      ],
    }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongBoundary) })).toMatchObject({ status: "blocked", evidence: null })
    const glyphVisitResponse = cloneResponse()
    const wrongGlyphVisitCount = {
      ...glyphVisitResponse,
      shapingBoundaryProofs: [
        rehash({ ...glyphVisitResponse.shapingBoundaryProofs[0]!, inspectedGlyphCount: glyphVisitResponse.shapingBoundaryProofs[0]!.inspectedGlyphCount + 1 }),
        ...glyphVisitResponse.shapingBoundaryProofs.slice(1),
      ],
    }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongGlyphVisitCount) })).toMatchObject({ status: "blocked", evidence: null })
    const segmentationVisitResponse = cloneResponse()
    const wrongSegmentationVisitCount = {
      ...segmentationVisitResponse,
      segmentationBoundaryProofs: [
        rehash({ ...segmentationVisitResponse.segmentationBoundaryProofs[0]!, inspectedOffsetCount: segmentationVisitResponse.segmentationBoundaryProofs[0]!.inspectedOffsetCount + 1 }),
        ...segmentationVisitResponse.segmentationBoundaryProofs.slice(1),
      ],
    }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongSegmentationVisitCount) })).toMatchObject({ status: "blocked", evidence: null })
    const wrongWork = { ...cloneResponse(), work: { ...structuredClone(exact.response.work), consumedAtomCount: 0 } }
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(wrongWork) })).toMatchObject({ status: "blocked", evidence: null })
    const unsafeInteger = cloneResponse()
    unsafeInteger.shapingRuns[0]!.clusters[0]!.advanceLayoutUnit = Number.MAX_SAFE_INTEGER + 1
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: rehash(unsafeInteger) })).toMatchObject({ status: "blocked", evidence: null })
    expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({ ...exact, response: { ...exact.response, fingerprint: "forced-collision" } })).toMatchObject({ status: "blocked", evidence: null })
  })

  it("charges Core acceptance slots before observation and retains factual stopped work", () => {
    const exact = exactFixture()
    const observed: string[] = []
    const hostileRuns = Array.from(
      { length: 9_000 },
      () => structuredClone(exact.response.shapingRuns[0]!),
    )
    const hostileArray = new Proxy(hostileRuns, {
      getOwnPropertyDescriptor(target, property) {
        if (property === "8999") observed.push("shapingRuns[8999]")
        return Reflect.getOwnPropertyDescriptor(target, property)
      },
    })
    const hostile = rehash({
      ...structuredClone(exact.response),
      runtimeIdentity: exact.producerRuntimeIdentity,
      shapingRuns: hostileArray,
    })
    observed.length = 0

    const result = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
      ...exact,
      response: hostile,
    })

    expect(result).toMatchObject({
      status: "fallback-required",
      evidence: null,
      evaluatorOrProofAuthority: expect.any(Object),
      completedCandidateWork: {
        evidence: { visitedEvidenceNodeCount: 8_192 },
      },
      issues: [],
    })
    expect(observed).toEqual([])
  })

  it("accepts an exact factual producer failure and rejects its clone tuple", () => {
    const exact = exactFixture()
    const failedWork = { ...exact.response.work, consumedAtomCount: 0, consumedClusterCount: 0, visitedEvidenceNodeCount: 0 }
    const producerFailureResult = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: exact.request,
      sourceMaterial: exact.sourceMaterial,
      runtime: {
        identity: exact.producerRuntimeIdentity,
        shapeRange() { throw new Error("font unavailable") },
        segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1,
      },
    })
    expect(failedWork.completeNextInputTraversalCount).toBe(0)
    expect(producerFailureResult.status).toBe("blocked")
    if (producerFailureResult.status !== "blocked") return
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({ ...exact, failure: producerFailureResult.failure })).toMatchObject({ status: "fallback-required", evaluatorOrProofAuthority: expect.any(Object), issues: [] })
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({ ...exact, request: structuredClone(exact.request), failure: producerFailureResult.failure })).toMatchObject({ status: "blocked", evaluatorOrProofAuthority: null })
    const forgedCeiling = rehash({
      ...structuredClone(producerFailureResult.failure),
      runtimeIdentity: exact.producerRuntimeIdentity,
      code: "work-ceiling-before-visit" as const,
      completedWork: { ...producerFailureResult.failure.completedWork, consumedAtomCount: 0, consumedClusterCount: 0, visitedEvidenceNodeCount: 0 },
    })
    expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2({ ...exact, failure: forgedCeiling })).toMatchObject({ status: "blocked", evaluatorOrProofAuthority: null })
  })

  it("keeps internal factories and preflight helpers off the public Core seam", async () => {
    const publicCore = await import("../src/index.js")
    expect(Object.keys(publicCore)).not.toEqual(expect.arrayContaining([
      "prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2",
      "resolveVNextTextBlockRegisteredSourceStyleInternalV1",
      "createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2",
    ]))
  })
})
