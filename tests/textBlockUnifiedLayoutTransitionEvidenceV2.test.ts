import { describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import { createFlowDocTextEngineUnifiedIncrementalEvidenceV2 } from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutProducerFailureV2,
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
  hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import { noOpUnifiedLayoutChange5b } from "./helpers/textBlockUnifiedIncremental5b.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { admitted5B2RootFixture } from "./helpers/textBlockUnifiedIncremental5b2.js"

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
