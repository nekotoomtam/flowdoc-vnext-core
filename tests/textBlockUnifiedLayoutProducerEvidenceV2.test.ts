import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it, vi } from "vitest"
import {
  createFlowDocTextEngineUnifiedIncrementalEvidenceV2,
  type FlowDocUnifiedIncrementalEvidenceRuntimeV2,
} from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import {
  createFlowDocTextEngineMr1RangeWorkerRuntimeV1,
  type FlowDocTextEngineMr1RangeWorkerRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/workerMr1Range.js"
import { FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256 } from "../packages/text-engine-rust-wasm/src/runtimeMr1Range.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.js"
import {
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import type {
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
  VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  VNextTextBlockTransitionProducerResponseV2,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV2.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { InlineImageFlowFixtureOptions } from "./helpers/textBlockInlineImageFlowV2.js"
import {
  admitted5B2HardBreakRootFixture,
  admitted5B2RootFixture,
  authorizedEvidenceRequestBundle5B2,
  recordProducerInvocationAuthority5B2,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

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

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer
}

function fixtureRoot(options: InlineImageFlowFixtureOptions) {
  const actualFontFaces = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
    .filter((face) => face.fontFaceId === "sarabun-regular")
    .map(({ fontAssetPath: _path, ...face }) => ({ ...face }))
  return admitted5B2RootFixture({ ...options, fontFaces: actualFontFaces })
}

function textRoot(text: string) {
  return fixtureRoot({ content: "text-only", text })
}

function bundleFor(text: string, atRenderedUtf16: number, insertedText: string) {
  return insertionBundleForRoot(textRoot(text), atRenderedUtf16, insertedText)
}

function insertionBundleForRoot(root: ReturnType<typeof textRoot>, atRenderedUtf16: number, insertedText: string) {
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("producer fixture requires one source leaf")
  const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text" || candidate.kind === "resolved-field" || candidate.kind === "generated-page-number")
  if (item == null) throw new Error("producer fixture requires shaping style")
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-insertion" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    atRenderedUtf16,
    insertedText,
    insertedSource: {
      lineageId: `evidence-v2-${atRenderedUtf16}`,
      sourceFingerprint: `evidence-v2-source-${atRenderedUtf16}`,
      provenanceFingerprint: `evidence-v2-provenance-${atRenderedUtf16}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`producer fixture was ${bundle.status}`)
  return { root, change, bundle }
}

function replacementBundleFor(text: string, startRenderedUtf16: number, endRenderedUtf16: number, insertedText: string) {
  const root = textRoot(text)
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("replacement fixture requires one leaf")
  const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text")
  if (item?.kind !== "text") throw new Error("replacement fixture requires text")
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-replacement" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
    insertedText,
    insertedSource: { lineageId: `replace-${startRenderedUtf16}`, sourceFingerprint: `replace-source-${startRenderedUtf16}`, provenanceFingerprint: `replace-provenance-${startRenderedUtf16}` },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`replacement fixture was ${bundle.status}`)
  return { root, change, bundle }
}

function deletionBundleFor(text: string, startRenderedUtf16: number, endRenderedUtf16: number) {
  const root = textRoot(text)
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("deletion fixture requires one leaf")
  const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text")
  if (item?.kind !== "text") throw new Error("deletion fixture requires text")
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-deletion" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`deletion fixture was ${bundle.status}`)
  return { root, change, bundle }
}

function metricStyleBundleFor(text: string, startRenderedUtf16: number, endRenderedUtf16: number) {
  const root = textRoot(text)
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("style fixture requires one leaf")
  const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text")
  if (item?.kind !== "text") throw new Error("style fixture requires text")
  const nextStyle = { fontSize: { value: 13, unit: "pt" as const } }
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "supported-style-change" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    range: { startRenderedUtf16, endRenderedUtf16 },
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson(nextStyle)),
    nextStyleProvenanceFingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson({ owner: "next-style", nextStyle })),
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`style fixture was ${bundle.status}`)
  return { root, change, bundle }
}

function resolvedFieldBundleFor() {
  const root = admitted5B2HardBreakRootFixture()
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("field fixture requires one leaf")
  const field = root.sourceState.root.items.find((candidate) => candidate.kind === "resolved-field")
  if (field?.kind !== "resolved-field") throw new Error("field fixture missing")
  const change = frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "resolved-field-rendered-value-change" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    inlineId: field.inlineId,
    fieldKey: field.fieldKey,
    expectedPreviousRenderedValueFingerprint: field.contentFingerprint,
    nextRenderedText: "QQ",
    nextSource: { lineageId: field.lineageId, sourceFingerprint: "field-source-evidence-v2", provenanceFingerprint: "field-provenance-evidence-v2" },
  })
  const bundle = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (bundle.status !== "required") throw new Error(`field fixture was ${bundle.status}`)
  return { root, change, bundle }
}

function identity(
  bundle: ReturnType<typeof bundleFor>["bundle"],
  runtime: "node-native-mr1-range" | "browser-worker-wasm-mr1-range",
) {
  return createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime,
    engineBuildFingerprint: `engine-${runtime}`,
    fontBackendFingerprint: `font-backend-${runtime}`,
    unitPolicyFingerprint: bundle.request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint: bundle.request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint: bundle.request.producerRuntimeRequirementFingerprint,
  })
}

function identityForRequest(
  request: VNextTextBlockTransitionEvidenceRequestV2,
  runtime: "node-native-mr1-range" | "browser-worker-wasm-mr1-range",
) {
  return createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime,
    engineBuildFingerprint: `engine-${runtime}`,
    fontBackendFingerprint: `font-backend-${runtime}`,
    unitPolicyFingerprint: request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint: request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint: request.producerRuntimeRequirementFingerprint,
  })
}

function nodeRuntime(bundle: ReturnType<typeof bundleFor>["bundle"]): FlowDocUnifiedIncrementalEvidenceRuntimeV2 {
  return {
    identity: identity(bundle, "node-native-mr1-range"),
    shapeRange(input) {
      const face = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.find((candidate) => candidate.fontFaceId === input.fontFaceId)
      if (face == null) throw new Error("font face unavailable")
      return runFlowDocTextEngineNodeMr1RangeShapeV1({
        text: input.text,
        fontId: face.fontFaceId,
        fontAssetPath: face.fontAssetPath,
        fontSha256: face.fontSha256,
        rangeStartUtf16: input.rangeStartUtf16,
        rangeEndUtf16: input.rangeEndUtf16,
        contextStartUtf16: input.contextStartUtf16,
        contextEndUtf16: input.contextEndUtf16,
      })
    },
    segmentRange: runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  }
}

function nodeRuntimeForRequest(
  request: VNextTextBlockTransitionEvidenceRequestV2,
  executionEvents: string[] = [],
): FlowDocUnifiedIncrementalEvidenceRuntimeV2 {
  return {
    identity: identityForRequest(request, "node-native-mr1-range"),
    shapeRange(input) {
      executionEvents.push("runtime:shape-range")
      const face = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.find((candidate) => candidate.fontFaceId === input.fontFaceId)
      if (face == null) throw new Error("font face unavailable")
      return runFlowDocTextEngineNodeMr1RangeShapeV1({
        text: input.text,
        fontId: face.fontFaceId,
        fontAssetPath: face.fontAssetPath,
        fontSha256: face.fontSha256,
        rangeStartUtf16: input.rangeStartUtf16,
        rangeEndUtf16: input.rangeEndUtf16,
        contextStartUtf16: input.contextStartUtf16,
        contextEndUtf16: input.contextEndUtf16,
      })
    },
    segmentRange(input) {
      executionEvents.push("runtime:segment-range")
      return runFlowDocTextEngineNodeMr1RangeSegmentationV1(input)
    },
  }
}

function comparable(value: VNextTextBlockTransitionProducerResponseV2) {
  const {
    runtimeIdentity: _runtimeIdentity,
    fingerprint: _fingerprint,
    ...runtimeIndependentFacts
  } = value
  return runtimeIndependentFacts
}

function rehash<T extends object>(value: T): T & { fingerprint: string } {
  const facts = { ...value } as Record<string, unknown>
  delete facts.fingerprint
  return frozen({ ...value, fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson(facts)) }) as T & { fingerprint: string }
}

let wasm: FlowDocTextEngineMr1RangeWorkerRuntimeV1

async function initializeWasmRuntime() {
  const wasmPath = resolve(process.cwd(), "packages/text-engine-rust-wasm/pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range_bg.wasm")
  wasm = await createFlowDocTextEngineMr1RangeWorkerRuntimeV1({
    measurementProfileId: "measurement-profile-unified-evidence-v2",
    wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
    wasmBytes: arrayBuffer(readFileSync(wasmPath)),
    fonts: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => ({
      face: structuredClone(face),
      bytes: arrayBuffer(readFileSync(resolve(process.cwd(), face.fontAssetPath))),
    })),
  })
}

describe("authorized producer execution and factual work V2", () => {
  beforeAll(async () => {
    await initializeWasmRuntime()
  }, 30_000)

  const notInvoked = {
    status: "not-invoked",
    response: null,
    failure: null,
    issues: ["missing-or-mismatched-invocation-authority"],
  } as const

  function hostilePayload(label: string, observed: string[]): object {
    return new Proxy(Object.create(null) as object, {
      get(_target, key) {
        observed.push(`${label}:get:${String(key)}`)
        throw new Error(`${label} get must not run`)
      },
      getOwnPropertyDescriptor(_target, key) {
        observed.push(`${label}:descriptor:${String(key)}`)
        throw new Error(`${label} descriptor must not run`)
      },
      getPrototypeOf() {
        observed.push(`${label}:prototype`)
        throw new Error(`${label} prototype must not run`)
      },
      ownKeys() {
        observed.push(`${label}:ownKeys`)
        throw new Error(`${label} ownKeys must not run`)
      },
    })
  }

  function successfulLookalike(): VNextTextBlockTransitionProducerInvocationAuthorityV2 {
    const completed = new Map<VNextTextBlockTransitionProducerOwnedWorkUnitV2, number>()
    return Object.freeze({
      source: "vnext-text-block-transition-producer-invocation-authority-v2" as const,
      contractVersion: 2 as const,
      begin() {
        return { status: "started" as const }
      },
      charge(unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2) {
        const completedWork = (completed.get(unit) ?? 0) + 1
        completed.set(unit, completedWork)
        return {
          status: "charged" as const,
          unit,
          completedWork,
          effectiveLimit: 8_192,
        }
      },
      bindRuntimeIdentity() {
        return { status: "bound" as const }
      },
      close() {
        return {
          status: "closed" as const,
          visitedEvidenceNodeCount: [...completed.values()].reduce(
            (sum, count) => sum + count,
            0,
          ),
        }
      },
    })
  }

  function successfulChargeEvents(
    events: ReturnType<typeof recordProducerInvocationAuthority5B2>["events"],
    unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  ) {
    return events.filter((event) =>
      event.control === "charge"
      && event.unit === unit
      && event.status === "charged"
    )
  }

  function controlAuthority(
    overrides: Partial<VNextTextBlockTransitionProducerInvocationAuthorityV2>,
  ): VNextTextBlockTransitionProducerInvocationAuthorityV2 {
    return Object.freeze({ ...successfulLookalike(), ...overrides })
  }

  function unsortedExactRightGuardRuntime(
    request: VNextTextBlockTransitionEvidenceRequestV2,
  ): FlowDocUnifiedIncrementalEvidenceRuntimeV2 {
    const base = nodeRuntimeForRequest(request)
    const targetEndLocal = request.next.evidenceTargetRange.endRenderedUtf16
      - request.next.coverageRange.startRenderedUtf16
    return {
      ...base,
      shapeRange(input) {
        const facts = base.shapeRange(input)
        const exact = facts.glyphs.find((glyph) => glyph.cluster === targetEndLocal)
        if (exact == null) throw new Error("unsorted guard fixture requires exact glyph")
        const later = facts.glyphs.find((glyph) => glyph.cluster > targetEndLocal)
        if (later == null) throw new Error("unsorted guard fixture requires a later glyph")
        const exactUnsafe = { ...exact, unsafeToBreak: true }
        const laterSafe = { ...later, unsafeToBreak: false }
        const glyphs = [
          laterSafe,
          ...facts.glyphs.filter((glyph) => glyph !== exact && glyph !== later),
          exactUnsafe,
        ]
        return {
          ...facts,
          glyphs,
          summary: {
            ...facts.summary,
            glyphCount: glyphs.length,
            unsafeToBreakGlyphCount: glyphs.filter((glyph) => glyph.unsafeToBreak).length,
          },
        }
      },
    }
  }

  it("rejects hostile exact-result shapes from begin, charge, bind, and close without invoking result getters", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const runtime = nodeRuntimeForRequest(bundle.request)
    let resultGetterCalls = 0
    let closeProxyOwnKeysCalls = 0
    const accessorResult = (status: string) => {
      const result = Object.create(null) as Record<string, unknown>
      Object.defineProperty(result, "status", {
        enumerable: true,
        get() {
          resultGetterCalls += 1
          return status
        },
      })
      return result
    }
    const invoke = (authority: VNextTextBlockTransitionProducerInvocationAuthorityV2) =>
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        authority,
        bundle.request,
        bundle.sourceMaterial,
        runtime,
      )

    const begin = invoke(controlAuthority({
      begin() {
        return accessorResult("started") as { readonly status: "started" }
      },
    }))
    const charge = invoke(controlAuthority({
      charge(unit) {
        return Object.assign(accessorResult("charged"), {
          unit,
          completedWork: 1,
          effectiveLimit: 8_192,
        }) as never
      },
    }))
    const bind = invoke(controlAuthority({
      bindRuntimeIdentity() {
        return accessorResult("bound") as { readonly status: "bound" }
      },
    }))
    const closeResult = new Proxy({
      status: "closed" as const,
      visitedEvidenceNodeCount: 0,
    }, {
      ownKeys() {
        closeProxyOwnKeysCalls += 1
        throw new Error("close result proxy must be rejected")
      },
    })
    const close = invoke(controlAuthority({
      charge(unit) {
        return {
          status: "limit-exceeded" as const,
          unit,
          attemptedWork: 1,
          completedWork: 0,
          effectiveLimit: 0,
        }
      },
      close() {
        return closeResult
      },
    }))

    for (const result of [begin, charge, bind, close]) {
      expect(result).toEqual(notInvoked)
    }
    expect(resultGetterCalls).toBe(0)
    expect(closeProxyOwnKeysCalls).toBe(1)
  })

  it.each([
    { label: "rejected", bind: () => ({ status: "rejected" as const }) },
    { label: "throwing", bind: () => { throw new Error("bind failed") } },
    { label: "malformed", bind: () => ({ status: "bound" as const, extra: true }) },
  ])("binds the minimum runtime identity before observing hostile request/material when bind is $label", ({ bind }) => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const baseRuntime = nodeRuntimeForRequest(bundle.request)
    const observed: string[] = []
    const authority = controlAuthority({ bindRuntimeIdentity: bind as never })
    const runtime = {
      identity: baseRuntime.identity,
      shapeRange: baseRuntime.shapeRange,
      segmentRange: baseRuntime.segmentRange,
    }
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      authority,
      hostilePayload("bind:request", observed) as VNextTextBlockTransitionEvidenceRequestV2,
      hostilePayload("bind:material", observed) as never,
      runtime,
    )

    expect(result).toEqual(notInvoked)
    expect(observed).toEqual([])
  })

  it("returns one constant not-invoked result for missing, malformed, copied, stale, or cross-tuple authority without payload observation", () => {
    const copiedBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "C" })
    const copied = Object.freeze({ ...copiedBundle.producerInvocationAuthority })
    const staleBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "S" })
    expect(staleBundle.producerInvocationAuthority.begin(
      staleBundle.request,
      staleBundle.sourceMaterial,
    )).toEqual({ status: "started" })
    const crossBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "T" })
    let authorityGetterCalls = 0
    const accessorAuthority = Object.create(null) as Record<string, unknown>
    Object.defineProperty(accessorAuthority, "begin", {
      enumerable: true,
      get() {
        authorityGetterCalls += 1
        throw new Error("authority getter must not run")
      },
    })
    let envelopeGetterCalls = 0
    const hostileEnvelope = Object.create(null) as Record<string, unknown>
    Object.defineProperty(hostileEnvelope, "request", {
      enumerable: true,
      get() {
        envelopeGetterCalls += 1
        throw new Error("one-argument envelope getter must not run")
      },
    })
    Object.defineProperty(hostileEnvelope, "runtime", {
      enumerable: true,
      get() {
        envelopeGetterCalls += 1
        throw new Error("one-argument runtime getter must not run")
      },
    })
    const oneArgumentResult = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      hostileEnvelope,
    )
    expect(oneArgumentResult).toEqual(notInvoked)
    expect(envelopeGetterCalls).toBe(0)
    const cases: readonly { readonly label: string; readonly authority: unknown }[] = [
      { label: "missing", authority: null },
      { label: "malformed", authority: Object.freeze({}) },
      { label: "accessor", authority: accessorAuthority },
      { label: "copied receiver", authority: copied },
      { label: "stale", authority: staleBundle.producerInvocationAuthority },
      { label: "cross tuple", authority: crossBundle.producerInvocationAuthority },
    ]
    let firstResult: unknown = null
    for (const row of cases) {
      const observed: string[] = []
      const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        row.authority as VNextTextBlockTransitionProducerInvocationAuthorityV2,
        hostilePayload(`${row.label}:request`, observed) as VNextTextBlockTransitionEvidenceRequestV2,
        hostilePayload(`${row.label}:material`, observed) as never,
        hostilePayload(`${row.label}:runtime`, observed) as FlowDocUnifiedIncrementalEvidenceRuntimeV2,
      )
      expect(result, row.label).toEqual(notInvoked)
      expect(observed, row.label).toEqual([])
      if (firstResult == null) firstResult = result
      else expect(result, row.label).toBe(firstResult)
    }
    expect(authorityGetterCalls).toBe(0)
    expect(Object.isFrozen(firstResult)).toBe(true)
    expect(Object.isFrozen((firstResult as typeof notInvoked).issues)).toBe(true)
    expect(oneArgumentResult).toBe(firstResult)
  })

  it("keeps a caller-authored successful control lookalike outside Core authority records", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "L" })
    const runtime = nodeRuntimeForRequest(bundle.request)
    const lookalike = successfulLookalike()
    const structurallyAuthorized =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        lookalike,
        bundle.request,
        bundle.sourceMaterial,
        runtime,
      )

    expect(structurallyAuthorized.status).toBe("accepted")
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      lookalike,
    )).toBeNull()
  }, 30_000)

  it("stops an exact zero descriptor authority before the first payload observation and retains attempted one completed zero", () => {
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-producer-descriptors": 0,
      })
    const bundle = authorizedEvidenceRequestBundle5B2({ policy, insertedText: "Z" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const runtime = nodeRuntimeForRequest(bundle.request)
    const watched = new Set<object>([
      bundle.request,
      bundle.sourceMaterial,
      runtime,
    ])
    const observed: string[] = []
    const originalOwnKeys = Reflect.ownKeys
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
    const originalGetPrototypeOf = Object.getPrototypeOf
    const originalGetOwnPropertySymbols = Object.getOwnPropertySymbols
    const ownKeys = vi.spyOn(Reflect, "ownKeys").mockImplementation((target) => {
      if (watched.has(target)) observed.push("ownKeys")
      return originalOwnKeys(target)
    })
    const descriptor = vi.spyOn(Object, "getOwnPropertyDescriptor")
      .mockImplementation((target, key) => {
        if (watched.has(target)) observed.push(`descriptor:${String(key)}`)
        return originalGetOwnPropertyDescriptor(target, key)
      })
    const prototype = vi.spyOn(Object, "getPrototypeOf").mockImplementation((target) => {
      if (watched.has(target)) observed.push("prototype")
      return originalGetPrototypeOf(target)
    })
    const symbols = vi.spyOn(Object, "getOwnPropertySymbols").mockImplementation((target) => {
      if (watched.has(target)) observed.push("symbols")
      return originalGetOwnPropertySymbols(target)
    })
    try {
      const result =
        createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
          recorded.authority,
          bundle.request,
          bundle.sourceMaterial,
          runtime,
        )
      expect(result).toEqual({
        status: "work-limit",
        response: null,
        failure: null,
        issues: [],
      })
    } finally {
      ownKeys.mockRestore()
      descriptor.mockRestore()
      prototype.mockRestore()
      symbols.mockRestore()
    }

    expect(observed).toEqual([])
    expect(recorded.events).toEqual([
      { control: "begin", status: "started" },
      {
        control: "charge",
        status: "limit-exceeded",
        unit: "evidence-producer-descriptors",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
      {
        control: "close",
        outcome: "producer-blocked",
        status: "closed",
        visitedEvidenceNodeCount: 0,
      },
    ])
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      bundle.producerInvocationAuthority,
    )).toMatchObject({
      state: "producer-blocked",
      firstFailedEvaluation: {
        unit: "evidence-producer-descriptors",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
      visitedEvidenceNodeCount: 0,
    })
  })

  it("does not recursively enumerate untouched frozen Root dependencies while retaining the request tuple", () => {
    const root = textRoot("ABCD")
    if (root.sourceState.root.nodeKind !== "leaf") {
      throw new Error("retained-graph fixture requires one Source leaf")
    }
    const item = root.sourceState.root.items.find((candidate) => candidate.kind === "text")
    if (item?.kind !== "text") throw new Error("retained-graph fixture requires text")
    const change = frozen({
      source: "vnext-text-block-unified-layout-change-v1" as const,
      contractVersion: 1 as const,
      kind: "text-insertion" as const,
      documentId: root.documentId,
      sectionId: root.sectionId,
      textBlockId: root.textBlockId,
      expectedPreviousRootFingerprint: root.fingerprint,
      expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
      atRenderedUtf16: 1,
      insertedText: "X",
      insertedSource: {
        lineageId: "retained-graph-insert",
        sourceFingerprint: "retained-graph-source",
        provenanceFingerprint: "retained-graph-provenance",
      },
      measurementStyleKey: item.style.measurementStyleKey,
      effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
    })
    const watched = new Map<object, string>([
      [root.sourceState, "Source"],
      [root.sourceState.root, "Source root"],
      [root.lineTree, "line tree"],
      [root.lineTree.root, "line-tree root"],
      [root.persistentScene, "Scene"],
      [root.persistentScene.root, "Scene root"],
    ])
    const observed: string[] = []
    const originalOwnKeys = Reflect.ownKeys
    const ownKeys = vi.spyOn(Reflect, "ownKeys").mockImplementation((target) => {
      const label = watched.get(target)
      if (label != null) observed.push(label)
      return originalOwnKeys(target)
    })
    let result: ReturnType<
      typeof createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2
    >
    try {
      result = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
        previousRoot: root,
        change,
      })
    } finally {
      ownKeys.mockRestore()
    }

    expect(result.status).toBe("required")
    expect(observed).toEqual([])
  })

  it("stops every producer-owned row at its first denied operation before later observation or emission", () => {
    const rows = [
      { unit: "evidence-producer-descriptors", runtimeCalls: 0, outcome: "producer-blocked", status: "work-limit" },
      { unit: "evidence-runtime-input-scalars", runtimeCalls: 0, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-runtime-invocations", runtimeCalls: 0, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-glyphs", runtimeCalls: 1, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-clusters", runtimeCalls: 1, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-guards", runtimeCalls: 1, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-proof-facts", runtimeCalls: 1, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-breaks", runtimeCalls: 2, outcome: "producer-failure", status: "blocked" },
      { unit: "evidence-response-facts", runtimeCalls: 3, outcome: "producer-blocked", status: "work-limit" },
    ] as const

    for (const row of rows) {
      const policy =
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          [row.unit]: 0,
        })
      const bundle = authorizedEvidenceRequestBundle5B2({
        policy,
        insertedText: "X",
      })
      const runtimeEvents: string[] = []
      const recorded = recordProducerInvocationAuthority5B2(
        bundle.producerInvocationAuthority,
        runtimeEvents,
      )
      const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        recorded.authority,
        bundle.request,
        bundle.sourceMaterial,
        nodeRuntimeForRequest(bundle.request, runtimeEvents),
      )

      expect(result.status, row.unit).toBe(row.status)
      expect(runtimeEvents.filter((event) => event.startsWith("runtime:")), row.unit)
        .toHaveLength(row.runtimeCalls)
      expect(successfulChargeEvents(recorded.events, row.unit), row.unit)
        .toHaveLength(0)
      expect(recorded.events).toContainEqual({
        control: "charge",
        status: "limit-exceeded",
        unit: row.unit,
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      })
      expect(recorded.events.at(-1), row.unit).toMatchObject({
        control: "close",
        outcome: row.outcome,
        status: "closed",
      })
      expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
        bundle.producerInvocationAuthority,
      ), row.unit).toMatchObject({
        terminalOutcome: row.outcome,
        firstFailedEvaluation: {
          unit: row.unit,
          attemptedWork: 1,
          completedWork: 0,
          effectiveLimit: 0,
        },
      })
    }
  }, 30_000)

  it("stops repeated runtime and proof rows at later owner boundaries before the next operation", () => {
    const rows = [
      { unit: "evidence-runtime-input-scalars", limit: 19, attempted: 20, runtimeCalls: 1 },
      { unit: "evidence-runtime-invocations", limit: 1, attempted: 2, runtimeCalls: 1 },
      { unit: "evidence-proof-facts", limit: 1, attempted: 2, runtimeCalls: 2 },
    ] as const

    for (const row of rows) {
      const policy =
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          [row.unit]: row.limit,
        })
      const bundle = authorizedEvidenceRequestBundle5B2({
        policy,
        insertedText: "X",
      })
      const runtimeEvents: string[] = []
      const recorded = recordProducerInvocationAuthority5B2(
        bundle.producerInvocationAuthority,
        runtimeEvents,
      )
      const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        recorded.authority,
        bundle.request,
        bundle.sourceMaterial,
        nodeRuntimeForRequest(bundle.request, runtimeEvents),
      )

      expect(result.status, row.unit).toBe("blocked")
      expect(runtimeEvents.filter((event) => event.startsWith("runtime:")), row.unit)
        .toHaveLength(row.runtimeCalls)
      expect(successfulChargeEvents(recorded.events, row.unit), row.unit)
        .toHaveLength(row.limit)
      expect(recorded.events).toContainEqual({
        control: "charge",
        status: "limit-exceeded",
        unit: row.unit,
        attemptedWork: row.attempted,
        completedWork: row.limit,
        effectiveLimit: row.limit,
      })
    }
  }, 30_000)

  it("emits no detached failure when its charged producer failure cannot emit response facts", () => {
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-runtime-invocations": 0,
        "evidence-response-facts": 0,
      })
    const bundle = authorizedEvidenceRequestBundle5B2({
      policy,
      insertedText: "X",
    })
    const runtimeEvents: string[] = []
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
      runtimeEvents,
    )
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      recorded.authority,
      bundle.request,
      bundle.sourceMaterial,
      nodeRuntimeForRequest(bundle.request, runtimeEvents),
    )

    expect(result).toEqual({
      status: "work-limit",
      response: null,
      failure: null,
      issues: [],
    })
    expect(runtimeEvents.filter((event) => event.startsWith("runtime:")))
      .toEqual([])
    expect(successfulChargeEvents(recorded.events, "evidence-response-facts"))
      .toHaveLength(0)
    expect(recorded.events.at(-1)).toMatchObject({
      control: "close",
      outcome: "producer-blocked",
      status: "closed",
    })
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      bundle.producerInvocationAuthority,
    )).toMatchObject({
      terminalOutcome: "producer-blocked",
      firstFailedEvaluation: {
        unit: "evidence-runtime-invocations",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
    })
  })

  it("stops before observing the first hard-break emission when the break row is denied", () => {
    const policy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-breaks": 0,
      })
    const root = admitted5B2HardBreakRootFixture(policy)
    const { bundle } = insertionBundleForRoot(root, 3, "X")
    expect(bundle.sourceMaterial.next.atoms.some((atom) => atom.kind === "hard-break"))
      .toBe(true)
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      recorded.authority,
      bundle.request,
      bundle.sourceMaterial,
      nodeRuntimeForRequest(bundle.request),
    )

    expect(result).toMatchObject({
      status: "blocked",
      response: null,
      failure: { code: "work-ceiling-before-visit" },
    })
    expect(successfulChargeEvents(recorded.events, "evidence-breaks"))
      .toHaveLength(0)
    expect(recorded.events).toContainEqual({
      control: "charge",
      status: "limit-exceeded",
      unit: "evidence-breaks",
      attemptedWork: 1,
      completedWork: 0,
      effectiveLimit: 0,
    })
  })

  it("charges Unicode scalar slots and the invocation immediately before each runtime call", () => {
    const executionEvents: string[] = []
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
      executionEvents,
    )
    const result =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        recorded.authority,
        bundle.request,
        bundle.sourceMaterial,
        nodeRuntimeForRequest(bundle.request, executionEvents),
      )

    expect(result.status).toBe("accepted")
    const calls = executionEvents
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => event.startsWith("runtime:"))
    expect(calls.map(({ event }) => event)).toEqual([
      "runtime:shape-range",
      "runtime:segment-range",
      "runtime:segment-range",
    ])
    const expectedScalarCharges = [19, 4, 4]
    for (let callIndex = 0; callIndex < calls.length; callIndex += 1) {
      const call = calls[callIndex]!
      expect(executionEvents[call.index - 1]).toBe(
        "authority:charge:evidence-runtime-invocations:charged",
      )
      let scalarCharges = 0
      for (let index = call.index - 2;
        executionEvents[index]
          === "authority:charge:evidence-runtime-input-scalars:charged";
        index -= 1) scalarCharges += 1
      expect(scalarCharges, call.event).toBe(expectedScalarCharges[callIndex])
    }
  })

  it("counts astral runtime inputs by Unicode scalar rather than UTF-16 code unit", () => {
    const executionEvents: string[] = []
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "😀😀" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
      executionEvents,
    )
    createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      recorded.authority,
      bundle.request,
      bundle.sourceMaterial,
      nodeRuntimeForRequest(bundle.request, executionEvents),
    )

    const callIndex = executionEvents.indexOf("runtime:shape-range")
    expect(callIndex).toBeGreaterThan(0)
    expect(executionEvents[callIndex - 1]).toBe(
      "authority:charge:evidence-runtime-invocations:charged",
    )
    let scalarCharges = 0
    for (let index = callIndex - 2;
      executionEvents[index]
        === "authority:charge:evidence-runtime-input-scalars:charged";
      index -= 1) scalarCharges += 1
    expect(scalarCharges).toBe(20)
  })

  it("charges distinct semantic units for returned facts and uses the Core close aggregate", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const result =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        recorded.authority,
        bundle.request,
        bundle.sourceMaterial,
        nodeRuntimeForRequest(bundle.request),
      )

    expect(
      result.status,
      result.status === "blocked" ? result.failure.code : "",
    ).toBe("accepted")
    if (result.status !== "accepted") return
    const chargedUnits = new Set(recorded.events.flatMap((event) =>
      event.control === "charge" && event.status === "charged"
        ? [event.unit]
        : []
    ))
    expect(chargedUnits).toEqual(new Set<VNextTextBlockTransitionProducerOwnedWorkUnitV2>([
      "evidence-producer-descriptors",
      "evidence-runtime-invocations",
      "evidence-runtime-input-scalars",
      "evidence-glyphs",
      "evidence-clusters",
      "evidence-breaks",
      "evidence-guards",
      "evidence-proof-facts",
      "evidence-response-facts",
    ]))
    expect(successfulChargeEvents(recorded.events, "evidence-glyphs")).toHaveLength(
      result.response.shapingBoundaryProofs.reduce(
        (sum, proof) => sum + proof.inspectedGlyphCount,
        0,
      ),
    )
    expect(successfulChargeEvents(recorded.events, "evidence-clusters")).toHaveLength(
      result.response.shapingRuns.reduce(
        (sum, run) => sum + run.clusters.length,
        0,
      ),
    )
    expect(successfulChargeEvents(recorded.events, "evidence-guards")).toHaveLength(
      result.response.shapingBoundaryProofs.reduce(
        (sum, proof) => sum + proof.guardGlyphCount,
        0,
      ),
    )
    expect(successfulChargeEvents(recorded.events, "evidence-proof-facts")).toHaveLength(
      result.response.shapingBoundaryProofs.length
        + result.response.segmentationBoundaryProofs.length,
    )
    expect(successfulChargeEvents(recorded.events, "evidence-response-facts"))
      .toHaveLength(14)
    expect(successfulChargeEvents(recorded.events, "evidence-breaks"))
      .toHaveLength(11)
    const close = recorded.events.at(-1)
    expect(close).toMatchObject({
      control: "close",
      outcome: "producer-response",
      status: "closed",
      visitedEvidenceNodeCount: result.response.work.visitedEvidenceNodeCount,
    })
    expect(result.response.work.completeNextInputTraversalCount).toBe(0)
    expect(result.response.work.completeNextInputComparisonCount).toBe(0)
  })

  it("uses the unsafe exact-boundary glyph even when a safe later guard is returned first", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const authorized =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        bundle.producerInvocationAuthority,
        bundle.request,
        bundle.sourceMaterial,
        unsortedExactRightGuardRuntime(bundle.request),
      )

    expect(authorized).toMatchObject({
      status: "blocked",
      failure: { code: "unsafe-shaping-boundary" },
    })
  })

  it("retains the next attempted cluster without clamping or fabricating completed clusters", () => {
    const below = authorizedEvidenceRequestBundle5B2({
      policy:
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          "evidence-clusters": 0,
        }),
      insertedText: "K",
    })
    const belowRecorded = recordProducerInvocationAuthority5B2(
      below.producerInvocationAuthority,
    )
    const belowResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        belowRecorded.authority,
        below.request,
        below.sourceMaterial,
        nodeRuntimeForRequest(below.request),
      )

    expect(belowResult).toMatchObject({
      status: "blocked",
      failure: {
        code: "work-ceiling-before-visit",
        completedWork: { consumedClusterCount: 0 },
      },
    })
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      below.producerInvocationAuthority,
    )).toMatchObject({
      state: "producer-failure",
      firstFailedEvaluation: {
        unit: "evidence-clusters",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
    })
    expect(belowRecorded.events).toContainEqual({
      control: "charge",
      status: "limit-exceeded",
      unit: "evidence-clusters",
      attemptedWork: 1,
      completedWork: 0,
      effectiveLimit: 0,
    })

    const at = authorizedEvidenceRequestBundle5B2({
      policy:
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          "evidence-clusters": 1,
        }),
      insertedText: "K",
    })
    const atResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        at.producerInvocationAuthority,
        at.request,
        at.sourceMaterial,
        nodeRuntimeForRequest(at.request),
      )
    expect(atResult.status).toBe("accepted")
  })

  it("retains completed producer facts when a charged runtime glyph is malformed", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "M" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const base = nodeRuntimeForRequest(bundle.request)
    const result =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        recorded.authority,
        bundle.request,
        bundle.sourceMaterial,
        {
          ...base,
          shapeRange(input) {
            const facts = base.shapeRange(input)
            return {
              ...facts,
              glyphs: facts.glyphs.map((glyph, index) =>
                index === 0
                  ? { ...glyph, xAdvance: Number.MAX_SAFE_INTEGER }
                  : glyph
              ),
            }
          },
        },
      )

    expect(result).toMatchObject({
      status: "blocked",
      failure: {
        code: "unsafe-runtime-arithmetic",
        completedWork: {
          consumedAtomCount: bundle.sourceMaterial.next.atoms.length,
          consumedClusterCount: 0,
        },
      },
    })
    if (result.status !== "blocked") return
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-invocations"))
      .toHaveLength(1)
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-input-scalars").length)
      .toBeGreaterThan(0)
    expect(successfulChargeEvents(recorded.events, "evidence-glyphs").length)
      .toBeGreaterThan(0)
    expect(recorded.events.at(-1)).toMatchObject({
      control: "close",
      outcome: "producer-failure",
      status: "closed",
      visitedEvidenceNodeCount: result.failure.completedWork.visitedEvidenceNodeCount,
    })
  })

  it("retains exact charged facts and producer-failure terminal state when shape runtime throws", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const base = nodeRuntimeForRequest(bundle.request)
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      recorded.authority,
      bundle.request,
      bundle.sourceMaterial,
      {
        ...base,
        shapeRange() {
          throw new Error("shape runtime unavailable")
        },
      },
    )

    expect(result).toMatchObject({
      status: "blocked",
      failure: {
        code: "pinned-font-unavailable",
        completedWork: {
          consumedAtomCount: bundle.sourceMaterial.next.atoms.length,
          consumedClusterCount: 0,
        },
      },
    })
    if (result.status !== "blocked") return
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-input-scalars"))
      .toHaveLength(19)
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-invocations"))
      .toHaveLength(1)
    expect(successfulChargeEvents(recorded.events, "evidence-glyphs"))
      .toHaveLength(0)
    expect(successfulChargeEvents(recorded.events, "evidence-response-facts"))
      .toHaveLength(9)
    expect(recorded.events.at(-1)).toMatchObject({
      control: "close",
      outcome: "producer-failure",
      status: "closed",
      visitedEvidenceNodeCount: result.failure.completedWork.visitedEvidenceNodeCount,
    })
  })

  it("retains completed shape facts and producer-failure terminal state when segment runtime throws", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
    )
    const base = nodeRuntimeForRequest(bundle.request)
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
      recorded.authority,
      bundle.request,
      bundle.sourceMaterial,
      {
        ...base,
        segmentRange() {
          throw new Error("segment runtime unavailable")
        },
      },
    )

    expect(result).toMatchObject({
      status: "blocked",
      failure: {
        code: "segmentation-not-stable",
        completedWork: {
          consumedAtomCount: bundle.sourceMaterial.next.atoms.length,
          consumedClusterCount: 1,
        },
      },
    })
    if (result.status !== "blocked") return
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-input-scalars"))
      .toHaveLength(23)
    expect(successfulChargeEvents(recorded.events, "evidence-runtime-invocations"))
      .toHaveLength(2)
    expect(successfulChargeEvents(recorded.events, "evidence-glyphs"))
      .toHaveLength(3)
    expect(successfulChargeEvents(recorded.events, "evidence-guards"))
      .toHaveLength(2)
    expect(successfulChargeEvents(recorded.events, "evidence-clusters"))
      .toHaveLength(1)
    expect(successfulChargeEvents(recorded.events, "evidence-proof-facts"))
      .toHaveLength(1)
    expect(successfulChargeEvents(recorded.events, "evidence-response-facts"))
      .toHaveLength(9)
    expect(recorded.events.at(-1)).toMatchObject({
      control: "close",
      outcome: "producer-failure",
      status: "closed",
      visitedEvidenceNodeCount: result.failure.completedWork.visitedEvidenceNodeCount,
    })
  })

  it("keeps authorized Node and WASM detached responses equal with zero complete-next counters", () => {
    const nodeBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const wasmBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const nodeResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        nodeBundle.producerInvocationAuthority,
        nodeBundle.request,
        nodeBundle.sourceMaterial,
        nodeRuntimeForRequest(nodeBundle.request),
      )
    const wasmResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
        wasmBundle.producerInvocationAuthority,
        wasmBundle.request,
        wasmBundle.sourceMaterial,
        {
          identity: identityForRequest(
            wasmBundle.request,
            "browser-worker-wasm-mr1-range",
          ),
          shapeRange: wasm.shapeRange,
          segmentRange: wasm.segmentRange,
        },
      )

    expect(
      nodeResult.status,
      nodeResult.status === "blocked" ? nodeResult.failure.code : "",
    ).toBe("accepted")
    expect(
      wasmResult.status,
      wasmResult.status === "blocked" ? wasmResult.failure.code : "",
    ).toBe("accepted")
    if (nodeResult.status !== "accepted" || wasmResult.status !== "accepted") return
    expect(comparable(nodeResult.response)).toEqual(comparable(wasmResult.response))
    const firstProof = wasmResult.response.segmentationBoundaryProofs[0]!
    const divergentResponse = {
      ...wasmResult.response,
      segmentationBoundaryProofs: [{
        ...firstProof,
        contextBreakCount: firstProof.contextBreakCount + 1,
      }, ...wasmResult.response.segmentationBoundaryProofs.slice(1)],
    }
    expect(comparable(nodeResult.response)).not.toEqual(
      comparable(divergentResponse),
    )
    expect(nodeResult.response.work).toMatchObject({
      completeNextInputTraversalCount: 0,
      completeNextInputComparisonCount: 0,
    })
  }, 30_000)
})
