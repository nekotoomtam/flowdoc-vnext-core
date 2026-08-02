import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
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
import type { VNextTextBlockTransitionProducerResponseV2 } from "../src/layout/textBlockUnifiedLayoutEvidenceContractV2.js"
import { unifiedLayoutRootBuildInputFixtureV2 } from "./helpers/textBlockUnifiedLayoutRootV2.js"
import { createVNextTextBlockUnifiedLayoutRootCompleteInternalV2 } from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import { VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1 } from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { InlineImageFlowFixtureOptions } from "./helpers/textBlockInlineImageFlowV2.js"

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
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({ ...options, fontFaces: actualFontFaces }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  )
  if (built.status !== "accepted") throw new Error("producer root fixture blocked")
  return built.root
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
  const root = fixtureRoot({ content: "field-image-page-break" })
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

function comparable(value: VNextTextBlockTransitionProducerResponseV2) {
  return {
    nextEvidenceTargetRange: value.nextEvidenceTargetRange,
    shapingRuns: value.shapingRuns.map((run) => ({ ...run, shapingRunId: "normalized" })),
    breakOffsets: value.breakOffsets,
    shapingBoundaryProofs: value.shapingBoundaryProofs,
    sourceTopologyFingerprint: value.sourceTopologyFingerprint,
    work: value.work,
    contracts: value.contracts,
  }
}

function rehash<T extends object>(value: T): T & { fingerprint: string } {
  const facts = { ...value } as Record<string, unknown>
  delete facts.fingerprint
  return frozen({ ...value, fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson(facts)) }) as T & { fingerprint: string }
}

let wasm: FlowDocTextEngineMr1RangeWorkerRuntimeV1

describe("unified incremental producer evidence V2", () => {
  beforeAll(async () => {
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
  }, 30_000)

  it.each([
    { label: "Latin ligature adjacency", text: "office affinity", at: 2, inserted: "X" },
    { label: "Thai shaping", text: "สวัสดีครับตูม", at: 4, inserted: "ใหม่" },
    { label: "zero-width end insertion", text: "flowdoc", at: 7, inserted: "!" },
  ])("produces equal bounded Node/WASM facts for $label", ({ text, at, inserted }) => {
    const { bundle } = bundleFor(text, at, inserted)
    const node = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      runtime: nodeRuntime(bundle),
    })
    const wasmResult = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      runtime: { identity: identity(bundle, "browser-worker-wasm-mr1-range"), shapeRange: wasm.shapeRange, segmentRange: wasm.segmentRange },
    })
    expect(node.status, node.status === "blocked" ? node.failure.code : "").toBe("accepted")
    expect(wasmResult.status, wasmResult.status === "blocked" ? wasmResult.failure.code : "").toBe("accepted")
    if (node.status !== "accepted" || wasmResult.status !== "accepted") return
    expect(node.response.nextEvidenceTargetRange).toEqual(bundle.request.next.evidenceTargetRange)
    expect(comparable(node.response)).toEqual(comparable(wasmResult.response))
    expect(node.response.work.completeNextInputTraversalCount).toBe(0)
    expect(node.response.work.completeNextInputComparisonCount).toBe(0)
  }, 30_000)

  it("keeps deletion and replacement evidence bounded and Node/WASM-equal", () => {
    const fixtures = [
      deletionBundleFor("office deletion", 3, 5),
      replacementBundleFor("ภาษาไทยทดสอบ", 4, 7, "ใหม่"),
    ]
    for (const { bundle } of fixtures) {
      const node = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) })
      const wasmResult = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: { identity: identity(bundle, "browser-worker-wasm-mr1-range"), shapeRange: wasm.shapeRange, segmentRange: wasm.segmentRange } })
      expect(node.status, node.status === "blocked" ? node.failure.code : "").toBe("accepted")
      expect(wasmResult.status, wasmResult.status === "blocked" ? wasmResult.failure.code : "").toBe("accepted")
      if (node.status !== "accepted" || wasmResult.status !== "accepted") continue
      expect(comparable(node.response)).toEqual(comparable(wasmResult.response))
      expect(node.response.nextEvidenceTargetRange).toEqual(bundle.request.next.evidenceTargetRange)
    }
  }, 30_000)

  it("preserves parity across metric-style, multi-style, image, hard-break, field, and generated-page adjacency", () => {
    const fixtures = [
      metricStyleBundleFor("metric style", 2, 5),
      resolvedFieldBundleFor(),
      insertionBundleForRoot(fixtureRoot({ content: "adjacent-text", breakOffsets: [0, 2] }), 1, "X"),
      insertionBundleForRoot(fixtureRoot({ content: "adjacent-text", mixedTextSizes: true }), 1, "X"),
      insertionBundleForRoot(fixtureRoot({ content: "text-image-text-break" }), 2, "X"),
      insertionBundleForRoot(fixtureRoot({ content: "field-image-page-break" }), 2, "X"),
    ]
    for (const { bundle } of fixtures) {
      const node = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) })
      const wasmResult = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: { identity: identity(bundle, "browser-worker-wasm-mr1-range"), shapeRange: wasm.shapeRange, segmentRange: wasm.segmentRange } })
      expect(node.status, node.status === "blocked" ? node.failure.code : "").toBe("accepted")
      expect(wasmResult.status, wasmResult.status === "blocked" ? wasmResult.failure.code : "").toBe("accepted")
      if (node.status !== "accepted" || wasmResult.status !== "accepted") continue
      expect(comparable(node.response)).toEqual(comparable(wasmResult.response))
      expect(node.response.nextEvidenceTargetRange).toEqual(bundle.request.next.evidenceTargetRange)
    }
  }, 30_000)

  it("coalesces exact same-style Source atoms before proving shaping boundaries", () => {
    const { bundle } = insertionBundleForRoot(fixtureRoot({ content: "adjacent-text", breakOffsets: [0, 2] }), 1, "X")
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    expect(result.response.shapingBoundaryProofs).toHaveLength(1)
    expect(result.response.shapingBoundaryProofs[0]).toMatchObject({
      leftBoundary: "safe-first-target-glyph",
      rightBoundary: "safe-first-right-guard-glyph",
    })
    expect(result.response.shapingBoundaryProofs[0]!.verificationRange.startRenderedUtf16).toBeLessThan(bundle.request.next.evidenceTargetRange.startRenderedUtf16)
    expect(result.response.shapingBoundaryProofs[0]!.verificationRange.endRenderedUtf16).toBeGreaterThan(bundle.request.next.evidenceTargetRange.endRenderedUtf16)
  })

  it("accounts every bounded runtime glyph and segmentation-offset node it inspects", () => {
    const { bundle } = bundleFor("office affinity", 2, "X")
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return

    const inspectedGlyphCount = result.response.shapingBoundaryProofs.reduce((sum, proof) => sum + proof.inspectedGlyphCount, 0)
    const inspectedSegmentationOffsetCount = result.response.segmentationBoundaryProofs.reduce((sum, proof) => sum + proof.inspectedOffsetCount, 0)
    expect(result.response.segmentationBoundaryProofs).toHaveLength(bundle.request.nextSegmentationContextRanges.length)
    for (const proof of result.response.segmentationBoundaryProofs) {
      expect(proof.inspectedOffsetCount).toBe(2 * proof.contextBreakCount + 2 * proof.targetBreakOffsets.length)
    }
    expect(result.response.work.visitedEvidenceNodeCount).toBe(
      bundle.sourceMaterial.next.atoms.length
      + result.response.shapingBoundaryProofs.length
      + result.response.segmentationBoundaryProofs.length
      + inspectedGlyphCount
      + inspectedSegmentationOffsetCount
      + result.response.breakOffsets.length,
    )
  })

  it("fails when two bounded segmentation expansions do not reconfirm equal target breaks", () => {
    const { bundle } = bundleFor("stable segmentation", 7, "X")
    expect(bundle.request.nextSegmentationContextRanges).toHaveLength(2)
    const base = nodeRuntime(bundle)
    let attempt = 0
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      runtime: { ...base, segmentRange(input) {
        const facts = base.segmentRange(input)
        attempt += 1
        if (attempt === 1) return facts
        const candidate = [facts.targetStartUtf16, facts.targetEndUtf16].find((offset) => !facts.targetBreakUtf16Offsets.includes(offset))
        if (candidate == null) return { ...facts, targetBreakByteOffsets: [], targetBreakUtf16Offsets: [], summary: { ...facts.summary, targetBreakCount: 0 } }
        const contextPairs = facts.contextBreakUtf16Offsets.map((offset, index) => ({ utf16: offset, byte: facts.contextBreakByteOffsets[index]! }))
        if (!contextPairs.some((pair) => pair.utf16 === candidate)) contextPairs.push({ utf16: candidate, byte: candidate })
        contextPairs.sort((left, right) => left.utf16 - right.utf16)
        return {
          ...facts,
          contextBreakByteOffsets: contextPairs.map((pair) => pair.byte),
          contextBreakUtf16Offsets: contextPairs.map((pair) => pair.utf16),
          targetBreakByteOffsets: [candidate],
          targetBreakUtf16Offsets: [candidate],
          summary: { ...facts.summary, contextBreakCount: contextPairs.length, targetBreakCount: 1 },
        }
      } },
    })
    expect(result).toMatchObject({ status: "blocked", failure: { code: "segmentation-not-stable" } })
    expect(attempt).toBe(2)
  })

  it("fails closed with factual producer codes and never widens to full-runtime calls", () => {
    const { bundle } = bundleFor("office affinity", 2, "X")
    const base = nodeRuntime(bundle)
    const run = (runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2, sourceMaterial = bundle.sourceMaterial) => createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial, runtime })

    const missing = run({ ...base, shapeRange(input) {
      const facts = base.shapeRange(input)
      return { ...facts, glyphs: facts.glyphs.map((glyph, index) => index === 0 ? { ...glyph, glyphId: 0 } : glyph), summary: { ...facts.summary, missingGlyphCount: 1 } }
    } })
    expect(missing).toMatchObject({ status: "blocked", failure: { code: "missing-glyph" } })

    const mismatch = run({ ...base, shapeRange(input) {
      const facts = base.shapeRange(input)
      return { ...facts, unitsPerEm: facts.unitsPerEm + 1 }
    } })
    expect(mismatch).toMatchObject({ status: "blocked", failure: { code: "pinned-font-mismatch" } })

    const unsafeBoundary = run({ ...base, shapeRange(input) {
      const facts = base.shapeRange(input)
      return { ...facts, glyphs: facts.glyphs.map((glyph) => ({ ...glyph, unsafeToBreak: true })) }
    } })
    expect(unsafeBoundary).toMatchObject({ status: "blocked", failure: { code: "unsafe-shaping-boundary" } })

    const unsafeArithmetic = run({ ...base, shapeRange(input) {
      const facts = base.shapeRange(input)
      return { ...facts, glyphs: facts.glyphs.map((glyph, index) => index === 0 ? { ...glyph, xAdvance: Number.MAX_SAFE_INTEGER } : glyph) }
    } })
    expect(unsafeArithmetic).toMatchObject({ status: "blocked", failure: { code: "unsafe-runtime-arithmetic" } })

    const segmentation = run({ ...base, segmentRange() { throw new Error("bounded segmentation unavailable") } })
    expect(segmentation).toMatchObject({ status: "blocked", failure: { code: "segmentation-not-stable" } })

    let runtimeGetterCalls = 0
    const shapeAccessor = run({ ...base, shapeRange(input) {
      const facts = { ...base.shapeRange(input) }
      Object.defineProperty(facts, "glyphs", { enumerable: true, get() { runtimeGetterCalls += 1; return [] } })
      return facts
    } })
    expect(shapeAccessor).toMatchObject({ status: "blocked", failure: { code: "unsafe-runtime-arithmetic" } })
    expect(runtimeGetterCalls).toBe(0)
    const segmentAccessor = run({ ...base, segmentRange(input) {
      const facts = { ...base.segmentRange(input) }
      Object.defineProperty(facts, "targetBreakUtf16Offsets", { enumerable: true, get() { runtimeGetterCalls += 1; return [] } })
      return facts
    } })
    expect(segmentAccessor).toMatchObject({ status: "blocked", failure: { code: "segmentation-not-stable" } })
    expect(runtimeGetterCalls).toBe(0)

    expect(run({ ...base, shapeRange() { throw new Error("pinned font unavailable") } })).toMatchObject({ status: "blocked", failure: { code: "pinned-font-unavailable" } })

    const zeroCeiling = rehash({ ...bundle.sourceMaterial, producerWorkCeilings: { ...bundle.sourceMaterial.producerWorkCeilings, maximumVisitedEvidenceNodeCount: 0 } })
    const overLimit = run(base, zeroCeiling)
    expect(overLimit).toMatchObject({ status: "blocked", failure: { code: "work-ceiling-before-visit", completedWork: { visitedEvidenceNodeCount: 0 } } })
  })

  it("rejects request-scoped material with caller-shaped complete-input fields", () => {
    const { bundle } = bundleFor("bounded material", 7, "X")
    const invalid = { ...bundle.sourceMaterial, completeNextCanonicalInput: "forbidden" }
    expect(createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: invalid as typeof bundle.sourceMaterial, runtime: nodeRuntime(bundle) })).toMatchObject({ status: "blocked", failure: { code: "invalid-request-scoped-material" } })
    let getterCalls = 0
    const accessor = structuredClone(bundle.sourceMaterial)
    Object.defineProperty(accessor.next.atoms[0]!, "renderedText", { enumerable: true, get() { getterCalls += 1; return "forbidden" } })
    expect(createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: accessor, runtime: nodeRuntime(bundle) })).toMatchObject({ status: "blocked", failure: { code: "invalid-request-scoped-material" } })
    expect(getterCalls).toBe(0)
    const outer = { sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) } as Record<string, unknown>
    Object.defineProperty(outer, "request", { enumerable: true, get() { getterCalls += 1; return bundle.request } })
    expect(createFlowDocTextEngineUnifiedIncrementalEvidenceV2(outer)).toMatchObject({ status: "blocked", failure: { code: "invalid-request-scoped-material" } })
    expect(getterCalls).toBe(0)
  })

  it("honors threshold-minus-one, threshold, and threshold-plus-one without wall-clock policy", () => {
    const { bundle } = bundleFor("threshold evidence", 9, "X")
    const baseline = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: bundle.sourceMaterial, runtime: nodeRuntime(bundle) })
    expect(baseline.status).toBe("accepted")
    if (baseline.status !== "accepted") return
    const threshold = baseline.response.work.visitedEvidenceNodeCount
    const materialAt = (maximumVisitedEvidenceNodeCount: number) => rehash({
      ...bundle.sourceMaterial,
      producerWorkCeilings: { ...bundle.sourceMaterial.producerWorkCeilings, maximumVisitedEvidenceNodeCount },
    })
    const below = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: materialAt(threshold - 1), runtime: nodeRuntime(bundle) })
    const at = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: materialAt(threshold), runtime: nodeRuntime(bundle) })
    const above = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({ request: bundle.request, sourceMaterial: materialAt(threshold + 1), runtime: nodeRuntime(bundle) })
    expect(below).toMatchObject({ status: "blocked", failure: { code: "work-ceiling-before-visit", completedWork: { visitedEvidenceNodeCount: threshold - 1 } } })
    expect(at.status).toBe("accepted")
    expect(above.status).toBe("accepted")
  })
})
