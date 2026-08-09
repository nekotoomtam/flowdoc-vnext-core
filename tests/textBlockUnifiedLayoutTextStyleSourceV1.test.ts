import { describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../packages/text-engine-rust-wasm/src/node.js"
import { createFlowDocTextEngineUnifiedIncrementalEvidenceV2 } from "../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { TextRunStyleV4Target } from "../src/schema/documentV4Foundation.js"
import type { VNextTextBlockUnifiedLayoutChangeV1 } from "../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceNodeV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import { createVNextTextBlockUnifiedLayoutRootCompleteInternalV2 } from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  transitionVNextTextBlockUnifiedLayoutSourceInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.js"
import {
  setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  createVNextTextBlockTransitionReplacementSourceItemInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
  resolveVNextTextBlockRegisteredSourceStyleInternalV1,
  setVNextTextBlockSourceReplacementItemReadObserverForTestInternalV1,
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
  visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import {
  admit5B2RootFixture,
  admitted5B2HardBreakRootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

const ACTUAL_FONT_FACES = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
const CORE_FONT_FACES = ACTUAL_FONT_FACES.slice(0, 1).map(({ fontAssetPath: _path, ...face }) => ({ ...face }))

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

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function textRoot(text: string): VNextTextBlockUnifiedLayoutRootV2 {
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
      text,
      textClusterRanges: [...text].map((value, index, values) => {
        const startRenderedUtf16 = values.slice(0, index).join("").length
        return {
          startRenderedUtf16,
          endRenderedUtf16: startRenderedUtf16 + value.length,
        }
      }),
      fontFaces: CORE_FONT_FACES,
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
  )
  if (built.status !== "accepted") throw new Error(`text root blocked: ${JSON.stringify(built.issues)}`)
  return admit5B2RootFixture(built.root)
}

function repeatedRoot(lineCount: number): VNextTextBlockUnifiedLayoutRootV2 {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages: false,
    fontFaces: CORE_FONT_FACES,
  })
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2)
  if (built.status !== "accepted") throw new Error(`repeated root blocked: ${JSON.stringify(built.issues)}`)
  return admit5B2RootFixture(built.root)
}

function adjacentTextRoot(itemCount: number): VNextTextBlockUnifiedLayoutRootV2 {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount: itemCount,
    includeImages: false,
    includeBreaks: false,
    fontFaces: CORE_FONT_FACES,
  })
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2)
  if (built.status !== "accepted") throw new Error(`adjacent root blocked: ${JSON.stringify(built.issues)}`)
  return admit5B2RootFixture(built.root)
}

function sourceItems(node: VNextTextBlockUnifiedLayoutSourceNodeV1): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] {
  return node.nodeKind === "leaf" ? node.items : node.children.flatMap(sourceItems)
}

function sourceNodes(node: VNextTextBlockUnifiedLayoutSourceNodeV1): readonly VNextTextBlockUnifiedLayoutSourceNodeV1[] {
  return node.nodeKind === "leaf"
    ? [node]
    : [node, ...node.children.flatMap(sourceNodes)]
}

function exactReusedSourceNodeCount(
  previous: VNextTextBlockUnifiedLayoutSourceNodeV1,
  next: VNextTextBlockUnifiedLayoutSourceNodeV1,
): number {
  const nextNodes = new Set(sourceNodes(next))
  return sourceNodes(previous).filter((node) => nextNodes.has(node)).length
}

function leafOccupancies(node: VNextTextBlockUnifiedLayoutSourceNodeV1): readonly number[] {
  return node.nodeKind === "leaf" ? [node.items.length] : node.children.flatMap(leafOccupancies)
}

function lastLeaf(node: VNextTextBlockUnifiedLayoutSourceNodeV1) {
  let current = node
  while (current.nodeKind === "branch") current = current.children.at(-1)!
  return current
}

function renderedText(root: VNextTextBlockUnifiedLayoutRootV2): string {
  return sourceItems(root.sourceState.root).map((item) => item.renderedText).join("")
}

function changeBase(root: VNextTextBlockUnifiedLayoutRootV2) {
  return {
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
  }
}

function firstText(root: VNextTextBlockUnifiedLayoutRootV2) {
  const item = sourceItems(root.sourceState.root).find((candidate) => candidate.kind === "text")
  if (item?.kind !== "text") throw new Error("text item missing")
  return item
}

function insertion(root: VNextTextBlockUnifiedLayoutRootV2, atRenderedUtf16: number, insertedText: string): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "text-insertion" as const,
    atRenderedUtf16,
    insertedText,
    insertedSource: {
      lineageId: `source-insert-${atRenderedUtf16}-${insertedText}`,
      sourceFingerprint: `source-fingerprint-${atRenderedUtf16}-${insertedText}`,
      provenanceFingerprint: `source-provenance-${atRenderedUtf16}-${insertedText}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function deletion(root: VNextTextBlockUnifiedLayoutRootV2, startRenderedUtf16: number, endRenderedUtf16: number): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "text-deletion" as const,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
  })
}

function replacement(root: VNextTextBlockUnifiedLayoutRootV2, startRenderedUtf16: number, endRenderedUtf16: number, insertedText: string): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "text-replacement" as const,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
    insertedText,
    insertedSource: {
      lineageId: `source-replace-${startRenderedUtf16}-${endRenderedUtf16}`,
      sourceFingerprint: `replace-source-${startRenderedUtf16}-${endRenderedUtf16}`,
      provenanceFingerprint: `replace-provenance-${startRenderedUtf16}-${endRenderedUtf16}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function styleChange(root: VNextTextBlockUnifiedLayoutRootV2, nextStyle: TextRunStyleV4Target, startRenderedUtf16 = 0, endRenderedUtf16 = renderedText(root).length): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = firstText(root)
  return frozen({
    ...changeBase(root),
    kind: "supported-style-change" as const,
    range: { startRenderedUtf16, endRenderedUtf16 },
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: fingerprint(nextStyle),
    nextStyleProvenanceFingerprint: fingerprint({ owner: "task-4-style", nextStyle }),
  })
}

function fieldChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  nextRenderedText: string,
): VNextTextBlockUnifiedLayoutChangeV1 {
  const field = sourceItems(root.sourceState.root).find(
    (item) => item.kind === "resolved-field",
  )
  if (field?.kind !== "resolved-field") throw new Error("field item missing")
  return frozen({
    ...changeBase(root),
    kind: "resolved-field-rendered-value-change" as const,
    inlineId: field.inlineId,
    fieldKey: field.fieldKey,
    expectedPreviousRenderedValueFingerprint: field.contentFingerprint,
    nextRenderedText,
    nextSource: {
      lineageId: field.lineageId,
      sourceFingerprint: `${field.sourceFingerprint}-next`,
      provenanceFingerprint: `${field.provenanceFingerprint}-next`,
    },
  })
}

function acceptedEvidence(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
) {
  const requestResult = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({ previousRoot: root, change })
  if (requestResult.status === "not-required") return { evidence: null, completedCandidateWork: requestResult.completedCandidateWork }
  if (requestResult.status !== "required") throw new Error(`evidence request was ${requestResult.status}`)
  const identity = createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime: "node-native-mr1-range",
    engineBuildFingerprint: "task-4-node-engine",
    fontBackendFingerprint: "task-4-node-font-backend",
    unitPolicyFingerprint: requestResult.request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint: requestResult.request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint: requestResult.request.producerRuntimeRequirementFingerprint,
  })
  const produced = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
    requestResult.producerInvocationAuthority,
    requestResult.request,
    requestResult.sourceMaterial,
    {
      identity,
      shapeRange(input) {
        const face = ACTUAL_FONT_FACES.find((candidate) => candidate.fontFaceId === input.fontFaceId)
        if (face == null) throw new Error("font unavailable")
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
    },
  )
  if (produced.status !== "accepted") throw new Error(`producer evidence blocked: ${JSON.stringify(produced.failure)}`)
  const accepted = acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
    previousRoot: root,
    change,
    request: requestResult.request,
    sourceMaterial: requestResult.sourceMaterial,
    producerInvocationAuthority: requestResult.producerInvocationAuthority,
    producerRuntimeIdentity: identity,
    response: produced.response,
  })
  if (accepted.status !== "accepted") throw new Error(`Core evidence blocked: ${JSON.stringify(accepted.issues)}`)
  return { evidence: accepted.evidence, completedCandidateWork: accepted.completedCandidateWork }
}

function transition(root: VNextTextBlockUnifiedLayoutRootV2, change: VNextTextBlockUnifiedLayoutChangeV1) {
  const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({ previousRoot: root, change, workPolicy: root.workPolicy })
  if (preflight.status !== "required" && preflight.status !== "not-required") throw new Error(`preflight was ${preflight.status}`)
  const evidence = preflight.status === "required"
    ? acceptedEvidence(root, change)
    : { evidence: null, completedCandidateWork: preflight.completedCandidateWork }
  return {
    preflight,
    result: transitionVNextTextBlockUnifiedLayoutSourceInternalV1({
      previousRoot: root,
      preflight: preflight.preflight,
      evidence: evidence.evidence,
      completedCandidateWork: evidence.completedCandidateWork,
    }),
  }
}

function ownerReplacement(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutRootV2["sourceState"]
  readonly startRenderedUtf16: number
  readonly endRenderedUtf16: number
  readonly nextItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly beforeVisit?: (
    unit: "source-lookup-nodes" | "source-path-copy-nodes" | "source-leaf-items",
  ) => boolean
}) {
  const range = frozen({
    startRenderedUtf16: input.startRenderedUtf16,
    endRenderedUtf16: input.endRenderedUtf16,
  })
  const coverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
    sourceState: input.sourceState,
    range,
    beforeVisitNode: () => true,
    beforeEmitItem: () => true,
  })
  if (coverage.status !== "accepted") throw new Error("owner coverage blocked")
  const selected = coverage.fragments.flatMap((fragment) => {
    const start = Math.max(
      range.startRenderedUtf16,
      fragment.itemAbsoluteStartRenderedUtf16,
    )
    const end = Math.min(
      range.endRenderedUtf16,
      fragment.itemAbsoluteEndRenderedUtf16,
    )
    if (end <= start) return []
    return [{
      renderedText: fragment.item.renderedText.slice(
        start - fragment.itemAbsoluteStartRenderedUtf16,
        end - fragment.itemAbsoluteStartRenderedUtf16,
      ),
      sourceFingerprint: fragment.item.sourceFingerprint,
      provenanceFingerprint: fragment.item.provenanceFingerprint,
    }]
  })
  const replacement = frozen({
    previousRange: range,
    nextItems: frozen([...input.nextItems]),
    expectedPreviousContentFingerprint: fingerprint(
      selected.map((entry) => entry.renderedText),
    ),
    expectedPreviousSourceFingerprint: fingerprint(
      selected.map((entry) => entry.sourceFingerprint),
    ),
    expectedPreviousProvenanceFingerprint: fingerprint(
      selected.map((entry) => entry.provenanceFingerprint),
    ),
    fingerprint: fingerprint({
      range,
      nextItems: input.nextItems.map((item) => item.fingerprint),
    }),
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: input.sourceState,
    replacement,
  })) throw new Error("owner replacement registration blocked")
  return prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: input.sourceState,
    replacement,
    beforeVisit: input.beforeVisit ?? (() => true),
  })
}

function batchItems(
  sourceState: VNextTextBlockUnifiedLayoutRootV2["sourceState"],
  count: number,
) {
  const base = sourceItems(sourceState.root).find((item) => item.kind === "text")
  if (base?.kind !== "text") throw new Error("batch base text missing")
  return frozen(Array.from({ length: count }, (_, index) => {
    const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState,
      kind: "text",
      renderedText: "X",
      lineageId: `batch-lineage-${count}-${index}`,
      inlineId: `batch-inline-${count}-${index}`,
      sourceFingerprint: `batch-source-${count}-${index}`,
      provenanceFingerprint: `batch-provenance-${count}-${index}`,
      style: base.style,
    })
    if (item == null) throw new Error("batch item blocked")
    return item
  }))
}

describe("5B-2 text/style Source path copy", () => {
  it.each([
    { name: "Latin insertion at start", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => insertion(root, 0, "X"), expected: "XABCD" },
    { name: "Thai insertion in middle", text: "ภาษา", change: (root: VNextTextBlockUnifiedLayoutRootV2) => insertion(root, 2, "ไ"), expected: "ภาไษา" },
    { name: "Latin insertion at end", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => insertion(root, 4, "X"), expected: "ABCDX" },
    { name: "Latin deletion at start", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => deletion(root, 0, 1), expected: "BCD" },
    { name: "Thai deletion in middle", text: "ภาษา", change: (root: VNextTextBlockUnifiedLayoutRootV2) => deletion(root, 1, 3), expected: "ภา" },
    { name: "Latin deletion at end", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => deletion(root, 3, 4), expected: "ABC" },
    { name: "Latin replacement at start", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => replacement(root, 0, 1, "XY"), expected: "XYBCD" },
    { name: "Thai replacement in middle", text: "ภาษา", change: (root: VNextTextBlockUnifiedLayoutRootV2) => replacement(root, 1, 3, "X"), expected: "ภXา" },
    { name: "Latin replacement at end", text: "ABCD", change: (root: VNextTextBlockUnifiedLayoutRootV2) => replacement(root, 3, 4, "XY"), expected: "ABCXY" },
  ])("applies $name from exact preflight replacement facts", ({ text, change, expected }) => {
    const root = textRoot(text)
    const { preflight, result } = transition(root, change(root))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(result.preflight).toBe(preflight.preflight)
    expect(result.sourceLayoutDeltaAuthority).toBeNull()
    expect(sourceItems(result.nextSourceState.root).map((item) => item.renderedText).join("")).toBe(expected)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
    expect(result.completedCandidateWork.completeNextInputTraversalCount).toBe(0)
  }, 30_000)

  it.each([
    { name: "semantic-only", nextStyle: {}, expectedEffect: "semantic-only-change" },
    { name: "paint-only", nextStyle: { textColor: "FF0000" }, expectedEffect: "paint-affecting-change" },
  ] as const)("accepts $name style changes without producer evidence", ({ nextStyle, expectedEffect }) => {
    const root = textRoot("ABCD")
    const { preflight, result } = transition(root, styleChange(root, nextStyle, 1, 3))
    expect(preflight).toMatchObject({ status: "not-required", preflight: { effectClassification: { effectClass: expectedEffect } } })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(result.sourceLayoutDeltaAuthority).toEqual(expect.any(Object))
    expect(result.nextSourceState.summary.provenanceFingerprint).not.toBe(root.sourceState.summary.provenanceFingerprint)
    expect(result.completedCandidateWork.evidence.requestCount).toBe(0)
  })

  it("updates equal-rendered field provenance beside atomic boundaries", () => {
    const root = admitted5B2HardBreakRootFixture()
    const previousField = sourceItems(root.sourceState.root).find(
      (item) => item.kind === "resolved-field",
    )
    if (previousField?.kind !== "resolved-field") throw new Error("field missing")
    const { result } = transition(
      root,
      fieldChange(root, previousField.renderedText),
    )
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    const nextField = sourceItems(result.nextSourceState.root).find(
      (item) => item.kind === "resolved-field",
    )
    expect(nextField).toMatchObject({
      inlineId: previousField.inlineId,
      renderedText: previousField.renderedText,
    })
    expect(nextField?.provenanceFingerprint).not.toBe(
      previousField.provenanceFingerprint,
    )
  })

  it("retains an adjacent hard-break item by exact identity", () => {
    const root = repeatedRoot(1)
    const hardBreak = sourceItems(root.sourceState.root).find(
      (item) => item.kind === "hard-break",
    )
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 0, 12),
    )
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(sourceItems(result.nextSourceState.root)).toContain(hardBreak)
  })

  it("rebinds the exact next style registry without retaining an absent style", () => {
    const root = textRoot("ABCD")
    const previous = firstText(root)
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }),
    )
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    const next = sourceItems(result.nextSourceState.root)[0]
    if (next?.kind !== "text") throw new Error("next text missing")
    expect(resolveVNextTextBlockRegisteredSourceStyleInternalV1({
      sourceState: result.nextSourceState,
      measurementStyleKey: next.style.measurementStyleKey,
      effectiveShapingStyleKey: next.style.effectiveShapingStyleKey,
    })).toMatchObject({ status: "resolved", style: next.style })
    expect(resolveVNextTextBlockRegisteredSourceStyleInternalV1({
      sourceState: result.nextSourceState,
      measurementStyleKey: previous.style.measurementStyleKey,
      effectiveShapingStyleKey: previous.style.effectiveShapingStyleKey,
    })).toMatchObject({ status: "unavailable", style: null })
  })

  it("keeps retained text fragments as distinct objects with one logical inline id", () => {
    const root = textRoot("ABCD")
    const previousText = firstText(root)
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 3),
    )
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    const textItems = sourceItems(result.nextSourceState.root).filter((item) => item.kind === "text")
    expect(textItems.map((item) => item.renderedText)).toEqual(["A", "BC", "D"])
    expect(textItems[0]!.inlineId).toBe(previousText.inlineId)
    expect(textItems[2]!.inlineId).toBe(previousText.inlineId)
    expect(textItems[0]).not.toBe(textItems[2])
    const prefix = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: result.nextSourceState,
      range: { startRenderedUtf16: 0, endRenderedUtf16: 1 },
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    const suffix = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: result.nextSourceState,
      range: { startRenderedUtf16: 3, endRenderedUtf16: 4 },
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    expect(prefix.status).toBe("accepted")
    expect(suffix.status).toBe("accepted")
    if (prefix.status !== "accepted" || suffix.status !== "accepted") return
    expect(prefix.fragments[0]?.item).toBe(textItems[0])
    expect(suffix.fragments[0]?.item).toBe(textItems[2])
  })

  it("uses canonical local packing and retains exact unaffected suffix items", () => {
    const root = repeatedRoot(8)
    expect(leafOccupancies(root.sourceState.root)).toEqual([8, 8])
    const previousItems = sourceItems(root.sourceState.root)
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 2),
    )
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") return
    expect(leafOccupancies(result.nextSourceState.root)).toEqual([8, 2, 8])
    const nextItems = sourceItems(result.nextSourceState.root)
    for (const retained of previousItems.slice(1)) expect(nextItems).toContain(retained)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("copies one bounded multi-leaf style range without traversing the suffix", () => {
    const root = adjacentTextRoot(16)
    expect(leafOccupancies(root.sourceState.root)).toEqual([8, 8])
    const previousItems = sourceItems(root.sourceState.root)
    const start = 7 * 12
    const end = 9 * 12
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, start, end),
    )
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(leafOccupancies(result.nextSourceState.root)).toEqual([8, 8])
    const nextItems = sourceItems(result.nextSourceState.root)
    for (const retained of previousItems.slice(9)) expect(nextItems).toContain(retained)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("copies across adjacent leaf parents while retaining distant subtrees", () => {
    const root = adjacentTextRoot(72)
    expect(leafOccupancies(root.sourceState.root)).toEqual(Array(9).fill(8))
    const previousLastLeaf = lastLeaf(root.sourceState.root)
    const { result } = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 31 * 12, 33 * 12),
    )
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(leafOccupancies(result.nextSourceState.root)).toEqual(Array(9).fill(8))
    expect(lastLeaf(result.nextSourceState.root)).toBe(previousLastLeaf)
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("removes one full leaf and collapses a unary root onto the retained sibling", () => {
    const root = adjacentTextRoot(16)
    if (root.sourceState.root.nodeKind !== "branch") throw new Error("branch missing")
    const retainedLeaf = root.sourceState.root.children[1]!
    const { result } = transition(root, deletion(root, 0, 8 * 12))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(result.nextSourceState.root).toBe(retainedLeaf)
    expect(leafOccupancies(result.nextSourceState.root)).toEqual([8])
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("borrows from the right branch after a bounded non-root underflow", () => {
    const root = adjacentTextRoot(72)
    const previousLastLeaf = lastLeaf(root.sourceState.root)
    const { result } = transition(root, deletion(root, 0, 24 * 12))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(leafOccupancies(result.nextSourceState.root)).toEqual(Array(6).fill(8))
    expect(result.nextSourceState.root.height).toBe(2)
    expect(lastLeaf(result.nextSourceState.root)).toBe(previousLastLeaf)
    expect(result.nextSourceState.work.reusedNodeCount).toBe(
      exactReusedSourceNodeCount(root.sourceState.root, result.nextSourceState.root),
    )
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("prefers borrowing from the left branch for a trailing underflow", () => {
    const root = adjacentTextRoot(72)
    const previousFirstLeaf = (() => {
      let current = root.sourceState.root
      while (current.nodeKind === "branch") current = current.children[0]!
      return current
    })()
    const { result } = transition(root, deletion(root, 32 * 12, 64 * 12))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "accepted" })
    if (result.status !== "accepted") return
    expect(leafOccupancies(result.nextSourceState.root)).toEqual(Array(5).fill(8))
    expect(result.nextSourceState.root.height).toBe(2)
    let nextFirst = result.nextSourceState.root
    while (nextFirst.nodeKind === "branch") nextFirst = nextFirst.children[0]!
    expect(nextFirst).toBe(previousFirstLeaf)
    expect(result.nextSourceState.work.reusedNodeCount).toBe(
      exactReusedSourceNodeCount(root.sourceState.root, result.nextSourceState.root),
    )
    expect(result.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("merges right when the exact donor cannot lend a branch child", () => {
    const root = adjacentTextRoot(80)
    expect(leafOccupancies(root.sourceState.root)).toEqual(Array(10).fill(8))
    const previousLastLeaf = lastLeaf(root.sourceState.root)
    const result = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 56 * 12,
      nextItems: [],
    })
    expect(result, JSON.stringify(result)).toMatchObject({ status: "prepared" })
    if (result.status !== "prepared") return
    expect(leafOccupancies(result.sourceState.root)).toEqual(Array(3).fill(8))
    expect(result.sourceState.root.height).toBe(1)
    expect(lastLeaf(result.sourceState.root)).toBe(previousLastLeaf)
    expect(result.sourceState.work.reusedNodeCount).toBe(
      exactReusedSourceNodeCount(root.sourceState.root, result.sourceState.root),
    )
    expect(result.sourceState.work.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("merges left after the exact minimum donor is exhausted", () => {
    const root = adjacentTextRoot(128)
    const first = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 48 * 12,
      nextItems: [],
    })
    expect(first.status).toBe("prepared")
    if (first.status !== "prepared") return
    if (first.sourceState.root.nodeKind !== "branch") throw new Error("root missing")
    expect(first.sourceState.root.children.map((child) => child.summary.itemCount))
      .toEqual([16, 64])
    const retainedLastLeaf = lastLeaf(first.sourceState.root)
    const second = ownerReplacement({
      sourceState: first.sourceState,
      startRenderedUtf16: 16 * 12,
      endRenderedUtf16: 72 * 12,
      nextItems: [],
    })
    expect(second.status).toBe("prepared")
    if (second.status !== "prepared") return
    expect(leafOccupancies(second.sourceState.root)).toEqual([8, 8, 8])
    expect(second.sourceState.root.height).toBe(1)
    expect(lastLeaf(second.sourceState.root)).toBe(retainedLastLeaf)
    expect(second.sourceState.work.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it.each([
    { name: "first", itemIndex: 0, retainedChildIndex: 7 },
    { name: "middle", itemIndex: 32, retainedChildIndex: 0 },
    { name: "last", itemIndex: 56, retainedChildIndex: 0 },
  ])("expands the $name child of a full eight-child parent canonically", ({ itemIndex, retainedChildIndex }) => {
    const root = adjacentTextRoot(64)
    if (root.sourceState.root.nodeKind !== "branch") throw new Error("root missing")
    const retainedChild = root.sourceState.root.children[retainedChildIndex]!
    const result = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: itemIndex * 12,
      endRenderedUtf16: (itemIndex + 1) * 12,
      nextItems: batchItems(root.sourceState, 9),
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    expect(leafOccupancies(result.sourceState.root)).toEqual(Array(9).fill(8))
    expect(result.sourceState.root.height).toBe(2)
    expect(sourceNodes(result.sourceState.root)).toContain(retainedChild)
    expect(result.sourceState.work.completeSuffixTraversalCount).toBe(0)
  })

  it("propagates an exact ten-child overflow into the next parent level", () => {
    const root = adjacentTextRoot(80)
    if (root.sourceState.root.nodeKind !== "branch") throw new Error("root missing")
    const retainedLastParent = root.sourceState.root.children[1]!
    const result = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 12,
      nextItems: batchItems(root.sourceState, 17),
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    expect(leafOccupancies(result.sourceState.root)).toEqual(Array(12).fill(8))
    if (result.sourceState.root.nodeKind !== "branch") throw new Error("root missing")
    expect(result.sourceState.root.children.map((child) => child.summary.itemCount))
      .toEqual([64, 16, 16])
    expect(result.sourceState.root.children[2]).toBe(retainedLastParent)
    expect(result.sourceState.work.completeSuffixTraversalCount).toBe(0)
  }, 30_000)

  it("targets retained prefix and suffix physical fragments independently", () => {
    const root = textRoot("ABCD")
    const first = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 3),
    ).result
    if (first.status !== "accepted") throw new Error("transition blocked")
    const fragments = sourceItems(first.nextSourceState.root)
    expect(fragments.map((item) => item.renderedText)).toEqual(["A", "BC", "D"])
    expect(new Set(fragments.map((item) => item.inlineId)).size).toBe(1)
    const prefix = ownerReplacement({
      sourceState: first.nextSourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 1,
      nextItems: [fragments[0]!],
    })
    expect(prefix.status).toBe("prepared")
    if (prefix.status !== "prepared") return
    const suffixItems = sourceItems(prefix.sourceState.root)
    const suffix = ownerReplacement({
      sourceState: prefix.sourceState,
      startRenderedUtf16: 3,
      endRenderedUtf16: 4,
      nextItems: [suffixItems.at(-1)!],
    })
    expect(suffix.status).toBe("prepared")
    if (suffix.status !== "prepared") return
    expect(sourceItems(suffix.sourceState.root).map((item) => item.renderedText).join(""))
      .toBe("ABCD")
  })

  it.each([
    { count: 9, expected: [4, 5] },
    { count: 10, expected: [8, 2] },
    { count: 15, expected: [8, 7] },
    { count: 16, expected: [8, 8] },
    { count: 17, expected: [8, 4, 5] },
  ])("packs an atomic final batch of $count canonically", ({ count, expected }) => {
    const root = textRoot("ABCD")
    const result = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 4,
      nextItems: batchItems(root.sourceState, count),
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    expect(leafOccupancies(result.sourceState.root)).toEqual(expected)
  })

  it("meters delta-index layers before resolving a second Source replacement", () => {
    const root = textRoot("ABCD")
    const first = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 3),
    ).result
    if (first.status !== "accepted") throw new Error("first transition blocked")
    const firstItem = sourceItems(first.nextSourceState.root)[0]!
    const units: string[] = []
    const second = ownerReplacement({
      sourceState: first.nextSourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: firstItem.renderedUtf16Length,
      nextItems: batchItems(first.nextSourceState, 1),
      beforeVisit(unit) {
        units.push(unit)
        return true
      },
    })
    expect(second.status).toBe("prepared")
    if (second.status !== "prepared") return
    expect(second.visitedLookupNodeCount).toBe(3)
    expect(second.sourceState.work.visitedSummaryNodeCount).toBe(3)
    expect(units.filter((unit) => unit === "source-lookup-nodes")).toHaveLength(3)
  })

  it("checks a delta-index layer before retained atomic inline lookup", () => {
    const root = repeatedRoot(1)
    const hardBreak = sourceItems(root.sourceState.root).find(
      (item) => item.kind === "hard-break",
    )
    if (hardBreak == null) throw new Error("hard break missing")
    const first = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 0, 12),
    ).result
    if (first.status !== "accepted") throw new Error("first transition blocked")
    let attempts = 0
    const lookup = visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1({
      sourceState: first.nextSourceState,
      inlineId: hardBreak.inlineId,
      beforeVisitNode() {
        attempts += 1
        return false
      },
    })
    expect(lookup).toMatchObject({
      status: "limit-exceeded",
      visitedNodeCount: 0,
      completeTreeTraversalCount: 0,
    })
    expect(attempts).toBe(1)
  })

  it("checks the complete index base before resolving an inline identity", () => {
    const root = repeatedRoot(1)
    const item = sourceItems(root.sourceState.root)[0]!
    let attempts = 0
    const lookup = visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1({
      sourceState: root.sourceState,
      inlineId: item.inlineId,
      beforeVisitNode() {
        attempts += 1
        return false
      },
    })
    expect(lookup).toMatchObject({
      status: "limit-exceeded",
      visitedNodeCount: 0,
      completeTreeTraversalCount: 0,
    })
    expect(attempts).toBe(1)
  })

  it("does not let compatibility lookup walk a transition index chain", () => {
    const root = textRoot("ABCD")
    const first = transition(
      root,
      styleChange(root, { textColor: "FF0000" }, 1, 3),
    ).result
    if (first.status !== "accepted") throw new Error("transition blocked")
    const item = sourceItems(first.nextSourceState.root)[0]!
    expect(lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
      sourceState: first.nextSourceState,
      inlineId: item.inlineId,
    })).toMatchObject({
      status: "not-found",
      completeTreeTraversalCount: 0,
    })
  })

  it("rejects the first affected-item slot before reading replacement items", () => {
    const root = textRoot("ABCD")
    const previous = sourceItems(root.sourceState.root)[0]!
    const target = Object.freeze([previous])
    const guardedNextItems = new Proxy(target, {
      get(value, property, receiver) {
        if (property === "0") {
          throw new Error("replacement item was read before authorization")
        }
        return Reflect.get(value, property, receiver)
      },
    })
    const previousRange = frozen({
      startRenderedUtf16: 0,
      endRenderedUtf16: previous.renderedUtf16Length,
    })
    const replacement = frozen({
      previousRange,
      nextItems: guardedNextItems,
      expectedPreviousContentFingerprint: fingerprint([previous.renderedText]),
      expectedPreviousSourceFingerprint: fingerprint([previous.sourceFingerprint]),
      expectedPreviousProvenanceFingerprint: fingerprint([previous.provenanceFingerprint]),
      fingerprint: "guarded-replacement",
    })
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState: root.sourceState,
      replacement,
    })).toBe(true)
    let attemptedItemSlots = 0
    expect(prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState: root.sourceState,
      replacement,
      beforeVisit(unit) {
        if (unit !== "source-leaf-items") return true
        attemptedItemSlots += 1
        return false
      },
    })).toMatchObject({ status: "limit-exceeded", sourceState: null })
    expect(attemptedItemSlots).toBe(1)
  })

  it("stops the Source-stage wrapper before reading its exact replacement", () => {
    const root = adjacentTextRoot(64)
    const change = styleChange(
      root,
      { textColor: "FF0000" },
      0,
      40 * 12,
    )
    const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change,
      workPolicy: root.workPolicy,
    })
    if (preflight.status !== "not-required") {
      throw new Error(`preflight was ${preflight.status}`)
    }
    let replacementItemReadCount = 0
    setVNextTextBlockSourceReplacementItemReadObserverForTestInternalV1(
      () => { replacementItemReadCount += 1 },
    )
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "source-flow",
      unit: "source-leaf-items",
      effectiveLimit: 32,
    })
    try {
      const result = transitionVNextTextBlockUnifiedLayoutSourceInternalV1({
        previousRoot: root,
        preflight: preflight.preflight,
        evidence: null,
        completedCandidateWork: preflight.completedCandidateWork,
      })
      expect(result).toMatchObject({
        status: "blocked",
        completedCandidateWork: {
          flow: { visitedChangedSourceLeafItemCount: 32 },
        },
      })
      expect(replacementItemReadCount).toBe(0)
    } finally {
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
      setVNextTextBlockSourceReplacementItemReadObserverForTestInternalV1(null)
    }
  }, 30_000)

  it("rejects duplicate atomic inline identities inside one replacement", () => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "field-image-page-break",
        fontFaces: CORE_FONT_FACES,
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    )
    if (built.status !== "accepted") throw new Error("field root blocked")
    const field = sourceItems(built.root.sourceState.root).find(
      (item) => item.kind === "resolved-field",
    )
    if (field?.kind !== "resolved-field") throw new Error("field missing")
    const duplicates = ["X", "Y"].map((renderedText, index) => {
      const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: built.root.sourceState,
        kind: "resolved-field",
        fieldKey: field.fieldKey,
        renderedText,
        lineageId: `duplicate-field-${index}`,
        inlineId: field.inlineId,
        sourceFingerprint: `duplicate-field-source-${index}`,
        provenanceFingerprint: `duplicate-field-provenance-${index}`,
        style: field.style,
      })
      if (item == null) throw new Error("duplicate field item blocked early")
      return item
    })
    expect(ownerReplacement({
      sourceState: built.root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: field.renderedUtf16Length,
      nextItems: duplicates,
    })).toMatchObject({ status: "blocked" })
  })

  it("stops final batch composition at the exact source-leaf-items limit", () => {
    const root = textRoot("ABCD")
    let completedLeafSlots = 0
    const result = ownerReplacement({
      sourceState: root.sourceState,
      startRenderedUtf16: 0,
      endRenderedUtf16: 4,
      nextItems: batchItems(root.sourceState, 17),
      beforeVisit(unit) {
        if (unit !== "source-leaf-items") return true
        if (completedLeafSlots >= 8) return false
        completedLeafSlots += 1
        return true
      },
    })
    expect(result).toMatchObject({ status: "limit-exceeded", sourceState: null })
    expect(completedLeafSlots).toBe(8)
  })

  it("requires exact evidence material authority from the Task-2 preflight", () => {
    const root = textRoot("ABCD")
    const change = insertion(root, 0, "X")
    const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change,
      workPolicy: root.workPolicy,
    })
    if (preflight.status !== "required") throw new Error("preflight missing")
    const evidence = acceptedEvidence(root, change)
    if (evidence.evidence == null) throw new Error("evidence missing")
    expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
      evidence: evidence.evidence,
      previousRoot: root,
      change,
      completedCandidateWork: evidence.completedCandidateWork,
      expectedRequest: preflight.request,
      expectedSourceMaterial: preflight.sourceMaterial,
    })).toBe(true)
    expect(hasVNextTextBlockUnifiedLayoutTransitionEvidenceBindingInternalV2({
      evidence: evidence.evidence,
      previousRoot: root,
      change,
      completedCandidateWork: evidence.completedCandidateWork,
      expectedRequest: structuredClone(preflight.request),
      expectedSourceMaterial: structuredClone(preflight.sourceMaterial),
    })).toBe(false)
  })

  it("rejects cloned preflight and evidence authorities", () => {
    const root = textRoot("ABCD")
    const change = insertion(root, 0, "X")
    const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({ previousRoot: root, change, workPolicy: root.workPolicy })
    if (preflight.status !== "required") throw new Error(`preflight was ${preflight.status}`)
    const evidence = acceptedEvidence(root, change)
    if (evidence.evidence == null) throw new Error("evidence missing")
    expect(transitionVNextTextBlockUnifiedLayoutSourceInternalV1({
      previousRoot: root,
      preflight: structuredClone(preflight.preflight),
      evidence: evidence.evidence,
      completedCandidateWork: evidence.completedCandidateWork,
    })).toMatchObject({ status: "blocked" })
    expect(transitionVNextTextBlockUnifiedLayoutSourceInternalV1({
      previousRoot: root,
      preflight: preflight.preflight,
      evidence: structuredClone(evidence.evidence),
      completedCandidateWork: evidence.completedCandidateWork,
    })).toMatchObject({ status: "blocked" })
  })
})
