import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it, vi } from "vitest"
import {
  createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2,
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

  it("preserves parity across metric style, multiple styles, retained hard break, field, and generated-page adjacency", () => {
    const fixtures = [
      metricStyleBundleFor("metric style", 2, 5),
      resolvedFieldBundleFor(),
      insertionBundleForRoot(fixtureRoot({ content: "adjacent-text", breakOffsets: [0, 2] }), 1, "X"),
      insertionBundleForRoot(fixtureRoot({ content: "adjacent-text", mixedTextSizes: true }), 1, "X"),
      insertionBundleForRoot(admitted5B2HardBreakRootFixture(), 2, "X"),
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

  it("keeps retained mandatory hard-break material distinct from target opportunities", () => {
    const { bundle } = insertionBundleForRoot(
      admitted5B2HardBreakRootFixture(),
      3,
      "X",
    )
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      runtime: nodeRuntime(bundle),
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    const hardBreak = bundle.sourceMaterial.next.atoms.find(
      (atom) => atom.kind === "hard-break",
    )
    expect(hardBreak).toBeDefined()
    const mandatoryOffset = bundle.request.next.coverageRange.startRenderedUtf16
      + hardBreak!.relativeEndRenderedUtf16
    expect(mandatoryOffset).toBeGreaterThan(
      bundle.request.next.evidenceTargetRange.endRenderedUtf16,
    )
    expect(result.response.breakOffsets).toEqual([])
    expect(result.response.breakOffsets).not.toEqual(
      bundle.sourceMaterial.next.atoms.map(
        (atom) => bundle.request.next.coverageRange.startRenderedUtf16
          + atom.relativeEndRenderedUtf16,
      ),
    )
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
    const runtimeDispatchAndEmissionCount =
      bundle.sourceMaterial.next.atoms.length
      + result.response.shapingBoundaryProofs.length
      + result.response.segmentationBoundaryProofs.length
      + result.response.breakOffsets.length
    const runtimeResultDescriptorCount =
      result.response.shapingBoundaryProofs.reduce(
        (sum, proof) => sum + 37 + 12 * proof.inspectedGlyphCount,
        0,
      )
      + result.response.segmentationBoundaryProofs.reduce(
        (sum, proof) => sum + 44 + proof.inspectedOffsetCount,
        0,
      )
    expect(inspectedGlyphCount + inspectedSegmentationOffsetCount).toBe(8)
    expect(runtimeDispatchAndEmissionCount).toBe(6)
    expect(runtimeResultDescriptorCount).toBe(155)
    expect(result.response.work.visitedEvidenceNodeCount).toBe(498)
    expect(
      result.response.work.visitedEvidenceNodeCount
        - runtimeDispatchAndEmissionCount
        - runtimeResultDescriptorCount,
    ).toBe(337)
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

  it("charges a returned runtime descriptor before observing its shape payload", () => {
    const { bundle } = bundleFor("office affinity", 2, "X")
    const material = rehash({
      ...bundle.sourceMaterial,
      producerWorkCeilings: {
        ...bundle.sourceMaterial.producerWorkCeilings,
        maximumVisitedEvidenceNodeCount: 341,
      },
    })
    const base = nodeRuntime(bundle)
    const observed: string[] = []
    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: material,
      runtime: {
        ...base,
        shapeRange(input) {
          const facts = base.shapeRange(input)
          return new Proxy(facts, {
            ownKeys(target) {
              observed.push("shape-own-keys")
              return Reflect.ownKeys(target)
            },
          })
        },
      },
    })

    expect(result).toMatchObject({
      status: "blocked",
      response: null,
      failure: {
        code: "work-ceiling-before-visit",
        completedWork: { visitedEvidenceNodeCount: 341 },
      },
    })
    expect(observed).toEqual([])
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

  it("charges the producer response owner before the first request/material payload observation", () => {
    const { bundle } = bundleFor("bounded producer descriptors", 8, "X")
    const material = structuredClone(bundle.sourceMaterial) as unknown as {
      producerWorkCeilings: { maximumVisitedEvidenceNodeCount: number }
      fingerprint: string
      next: { atoms: object[] }
    }
    material.producerWorkCeilings.maximumVisitedEvidenceNodeCount = 0
    const materialFacts = { ...material } as Record<string, unknown>
    delete materialFacts.fingerprint
    material.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(materialFacts),
    )

    const observed: string[] = []
    const firstAtom = material.next.atoms[0]!
    material.next.atoms[0] = new Proxy(firstAtom, {
      ownKeys(target) {
        observed.push("next.atoms[0]")
        return Reflect.ownKeys(target)
      },
    })

    const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: material as unknown as typeof bundle.sourceMaterial,
      runtime: nodeRuntime(bundle),
    })

    expect(result).toMatchObject({
      status: "blocked",
      response: null,
      failure: {
        code: "work-ceiling-before-visit",
        completedWork: { visitedEvidenceNodeCount: 0 },
      },
    })
    expect(observed).toEqual([])
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
      const result = createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
  })

  it("keeps a caller-authored successful lookalike in the raw adapter lane without a Core authority record", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "L" })
    const runtime = nodeRuntimeForRequest(bundle.request)
    const raw = createFlowDocTextEngineUnifiedIncrementalEvidenceV2({
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      runtime,
    })
    const lookalike = successfulLookalike()
    const structurallyAuthorized =
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
        lookalike,
        bundle.request,
        bundle.sourceMaterial,
        runtime,
      )

    expect(raw.status).toBe("accepted")
    expect(structurallyAuthorized.status).toBe("accepted")
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      lookalike,
    )).toBeNull()
  })

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
        createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
          recorded.authority,
          bundle.request,
          bundle.sourceMaterial,
          runtime,
        )
      expect(result).toEqual(notInvoked)
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

  it("charges Unicode scalar slots and the invocation immediately before each runtime call", () => {
    const executionEvents: string[] = []
    const bundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const recorded = recordProducerInvocationAuthority5B2(
      bundle.producerInvocationAuthority,
      executionEvents,
    )
    const result =
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
    createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
    expect(successfulChargeEvents(recorded.events, "evidence-breaks").length)
      .toBeGreaterThanOrEqual(result.response.breakOffsets.length)
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
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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

  it("keeps authorized Node and WASM detached responses equal with zero complete-next counters", () => {
    const nodeBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const wasmBundle = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const nodeResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
        nodeBundle.producerInvocationAuthority,
        nodeBundle.request,
        nodeBundle.sourceMaterial,
        nodeRuntimeForRequest(nodeBundle.request),
      )
    const wasmResult =
      createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
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
    expect(nodeResult.response.work).toMatchObject({
      completeNextInputTraversalCount: 0,
      completeNextInputComparisonCount: 0,
    })
  }, 30_000)
})
