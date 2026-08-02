import { describe, expect, it } from "vitest"
import {
  inspectVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  ROOT_V2_TEST_WORK_POLICY,
  acceptedUnifiedLayoutRootFixtureV2,
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import { createVNextTextBlockUnifiedLayoutRootCompleteInternalV2 } from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
  acceptedRepeatedUnifiedLayoutRootFixture5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1,
  getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
  setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  forceVNextTextBlockRegisteredSourceStyleCollisionForTestInternalV1,
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  visitVNextTextBlockTransitionFlowCoverageInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import type { VNextTextBlockUnifiedLayoutSourceItemV1 } from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import type { TextRunStyleV4Target } from "../src/schema/documentV4Foundation.js"
import type {
  VNextTextBlockTransitionProducerResponseV1,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV1.js"

function frozen<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) {
        frozen(descriptor.value)
      }
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function textInsertion(
  root: ReturnType<typeof acceptedUnifiedLayoutRootFixtureV2>["root"],
) {
  const item = root.sourceState.root.nodeKind === "leaf"
    ? root.sourceState.root.items.find((candidate) => candidate.kind === "text")
    : null
  if (item == null || item.kind !== "text") throw new Error("text fixture missing")
  return frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-insertion" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    atRenderedUtf16: 0,
    insertedText: "X",
    insertedSource: {
      lineageId: "preflight-v2-insert",
      sourceFingerprint: "preflight-v2-source",
      provenanceFingerprint: "preflight-v2-provenance",
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function contains(
  outer: { startRenderedUtf16: number; endRenderedUtf16: number },
  inner: { startRenderedUtf16: number; endRenderedUtf16: number },
) {
  return outer.startRenderedUtf16 <= inner.startRenderedUtf16
    && outer.endRenderedUtf16 >= inner.endRenderedUtf16
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function textRoot(text: string) {
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({ content: "text-only", text }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  )
  if (built.status !== "accepted") throw new Error("text root missing")
  return built.root
}

function clusteredTextRoot(
  text: string,
  textClusterRanges: readonly {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }[],
) {
  const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
      text,
      textClusterRanges,
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  )
  if (built.status !== "accepted") throw new Error("clustered root missing")
  return built.root
}

function insertionAt(
  root: VNextTextBlockUnifiedLayoutRootV2,
  atRenderedUtf16: number,
  insertedText: string,
) {
  const item = coveredItems(root)[0]?.item
  if (item?.kind !== "text") throw new Error("text item missing")
  return frozen({
    ...changeBase(root),
    kind: "text-insertion" as const,
    atRenderedUtf16,
    insertedText,
    insertedSource: {
      lineageId: `insert-${atRenderedUtf16}-${insertedText.length}`,
      sourceFingerprint: `source-${atRenderedUtf16}-${insertedText.length}`,
      provenanceFingerprint: `provenance-${atRenderedUtf16}-${insertedText.length}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function insertionWithStyle(
  root: VNextTextBlockUnifiedLayoutRootV2,
  atRenderedUtf16: number,
  insertedText: string,
  style: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>["style"],
) {
  return frozen({
    ...changeBase(root),
    kind: "text-insertion" as const,
    atRenderedUtf16,
    insertedText,
    insertedSource: {
      lineageId: `insert-${atRenderedUtf16}-${insertedText.length}`,
      sourceFingerprint: `source-${atRenderedUtf16}-${insertedText.length}`,
      provenanceFingerprint: `provenance-${atRenderedUtf16}-${insertedText.length}`,
    },
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
  })
}

function deletion(
  root: VNextTextBlockUnifiedLayoutRootV2,
  startRenderedUtf16: number,
  endRenderedUtf16: number,
) {
  const item = coveredItems(root, startRenderedUtf16, endRenderedUtf16)[0]?.item
  if (item == null) throw new Error("deletion item missing")
  return frozen({
    ...changeBase(root),
    kind: "text-deletion" as const,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
  })
}

function replacement(
  root: VNextTextBlockUnifiedLayoutRootV2,
  startRenderedUtf16: number,
  endRenderedUtf16: number,
  insertedText: string,
) {
  const item = coveredItems(root, startRenderedUtf16, endRenderedUtf16)[0]?.item
  if (item?.kind !== "text") throw new Error("replacement text item missing")
  return frozen({
    ...changeBase(root),
    kind: "text-replacement" as const,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
    insertedText,
    insertedSource: {
      lineageId: `replace-${startRenderedUtf16}-${endRenderedUtf16}`,
      sourceFingerprint: `replace-source-${startRenderedUtf16}-${endRenderedUtf16}`,
      provenanceFingerprint: `replace-provenance-${startRenderedUtf16}-${endRenderedUtf16}`,
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function materialText(
  result: Extract<
    ReturnType<typeof prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2>,
    { status: "required" }
  >,
  lane: "previous" | "next",
) {
  return result.sourceMaterial[lane].atoms.map((atom) => atom.renderedText).join("")
}

function exactOwnDataClone<T extends object>(value: T): T {
  const clone = structuredClone(value)
  return frozen(clone) as T
}

function styleChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  nextStyle: TextRunStyleV4Target,
) {
  const item = coveredItems(root)[0]?.item
  if (item?.kind !== "text") throw new Error("text item missing")
  return frozen({
    ...changeBase(root),
    kind: "supported-style-change" as const,
    range: {
      startRenderedUtf16: 0,
      endRenderedUtf16: item.renderedUtf16Length,
    },
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: fingerprint(nextStyle),
    nextStyleProvenanceFingerprint: fingerprint({
      owner: "next-style",
      nextStyle,
    }),
  })
}

function coveredItems(
  root: VNextTextBlockUnifiedLayoutRootV2,
  startRenderedUtf16 = 0,
  endRenderedUtf16 = root.sourceState.summary.renderedUtf16Length,
) {
  const result = visitVNextTextBlockTransitionSourceCoverageInternalV1({
    sourceState: root.sourceState,
    range: { startRenderedUtf16, endRenderedUtf16 },
    beforeVisitNode: () => true,
    beforeEmitItem: () => true,
  })
  if (result.status !== "accepted") throw new Error("source coverage missing")
  return result.fragments
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

function expectedCanonicalInsertedTextItem(input: {
  readonly renderedText: string
  readonly inlineId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly style: Extract<VNextTextBlockUnifiedLayoutSourceItemV1, { kind: "text" }>["style"]
}): VNextTextBlockUnifiedLayoutSourceItemV1 {
  const semanticFingerprint = fingerprint({ kind: "text", inlineId: input.inlineId })
  const contentFingerprint = fingerprint({
    renderedText: input.renderedText,
    renderedUtf16Length: input.renderedText.length,
  })
  const paintFingerprint = fingerprint({
    textColor: input.style.textColor,
    textDecoration: input.style.textDecoration,
    strikethrough: input.style.strikethrough,
    authoredTextColor: input.style.authoredLocalStyle?.textColor ?? null,
  })
  const layoutDependencyFingerprint = fingerprint({
    fontFamilyKey: input.style.fontFamilyKey,
    fontFaceId: input.style.fontFaceId,
    fontSizeLayoutUnit: input.style.fontSizeLayoutUnit,
    fontWeight: input.style.fontWeight,
    fontStyle: input.style.fontStyle,
  })
  const boundaryFingerprint = fingerprint({
    kind: "text-bearing",
    inlineId: input.inlineId,
  })
  const facts = {
    lineageId: input.inlineId,
    inlineId: input.inlineId,
    renderedText: input.renderedText,
    renderedUtf16Length: input.renderedText.length,
    semanticFingerprint,
    contentFingerprint,
    sourceFingerprint: input.sourceFingerprint,
    provenanceFingerprint: input.provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint,
    boundaryFingerprint,
    kind: "text" as const,
    style: input.style,
  }
  return {
    ...facts,
    fingerprint: fingerprint({ contractVersion: 1, ...facts }),
  }
}

describe("Text-block unified transition preflight V2", () => {
  it("classifies an equal-rendered field provenance change after bounded facts", () => {
    const previousRoot = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    if (previousRoot.status !== "accepted") throw new Error("field root missing")
    const covered = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: previousRoot.root.sourceState,
      range: { startRenderedUtf16: 0, endRenderedUtf16: 1 },
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    const field = covered.status === "accepted" ? covered.fragments[0]?.item : null
    if (field?.kind !== "resolved-field") throw new Error("field fixture missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: previousRoot.root,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      change: frozen({
        source: "vnext-text-block-unified-layout-change-v1" as const,
        contractVersion: 1 as const,
        kind: "resolved-field-rendered-value-change" as const,
        documentId: previousRoot.root.documentId,
        sectionId: previousRoot.root.sectionId,
        textBlockId: previousRoot.root.textBlockId,
        expectedPreviousRootFingerprint: previousRoot.root.fingerprint,
        expectedPreviousSourceFingerprint: previousRoot.root.sourceState.fingerprint,
        inlineId: field.inlineId,
        fieldKey: field.fieldKey,
        expectedPreviousRenderedValueFingerprint: field.contentFingerprint,
        nextRenderedText: field.renderedText,
        nextSource: {
          lineageId: field.lineageId,
          sourceFingerprint: field.sourceFingerprint,
          provenanceFingerprint: `${field.provenanceFingerprint}-next`,
        },
      }),
    })
    expect(result).toMatchObject({
      status: "not-required",
      request: null,
      sourceMaterial: null,
      preflight: {
        producerEvidence: "not-required",
        effectClassification: {
          effectClass: "semantic-only-change",
          semanticIdentityChanged: true,
        },
      },
    })
  })

  it("keeps a true no-op evidence-free after exact change binding", () => {
    const previousRoot = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-only",
    }).root
    const result =
      prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: noOpUnifiedLayoutChange5b(previousRoot),
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      })

    expect(result).toMatchObject({
      status: "not-required",
      request: null,
      sourceMaterial: null,
      preflight: {
        producerEvidence: "not-required",
        effectClassification: {
          effectClass: "true-no-op",
          semanticIdentityChanged: false,
        },
      },
    })
  })

  it("requests registered-source material for an ordinary text insertion", () => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
    }), VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1)
    if (built.status !== "accepted") throw new Error("calibration root missing")
    const previousRoot = built.root
    const result =
      prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: textInsertion(previousRoot),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })

    expect(result).toMatchObject({
      status: "required",
      preflight: {
        producerEvidence: "required",
        effectClassification: { effectClass: "geometry-affecting-change" },
      },
    })
    if (result.status !== "required") return
    for (const lane of [result.preflight.previousRanges, result.preflight.nextRanges]) {
      expect(contains(lane.evidenceTargetRange, lane.changedSourceRange)).toBe(true)
      expect(contains(lane.shapeVerificationRange, lane.evidenceTargetRange)).toBe(true)
      expect(contains(lane.coverageRange, lane.shapeVerificationRange)).toBe(true)
    }
    expect(result.sourceMaterial.next.atoms).toContainEqual(expect.objectContaining({
      kind: "text",
      renderedText: "X",
      resolvedStyle: expect.objectContaining({
        measurementStyleKey: "paragraph-body",
      }),
    }))
  })

  it("preserves exact prefix and suffix material around a middle text replacement", () => {
    const previousRoot = textRoot("ABCD")
    const item = coveredItems(previousRoot)[0]?.item
    if (item?.kind !== "text") throw new Error("text item missing")
    const insertedSource = {
      lineageId: "replacement-x",
      sourceFingerprint: "replacement-source",
      provenanceFingerprint: "replacement-provenance",
    }
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      change: frozen({
        ...changeBase(previousRoot),
        kind: "text-replacement" as const,
        removedRange: { startRenderedUtf16: 1, endRenderedUtf16: 3 },
        expectedRemovedContentFingerprint: item.contentFingerprint,
        expectedRemovedSourceFingerprint: item.sourceFingerprint,
        expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
        insertedText: "xy",
        insertedSource,
        measurementStyleKey: item.style.measurementStyleKey,
        effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
      }),
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.sourceMaterial.next.atoms.map((atom) => atom.renderedText))
      .toEqual(["A", "xy", "D"])
    expect(result.preflight.replacementItems).toEqual([
      expectedCanonicalInsertedTextItem({
        renderedText: "xy",
        inlineId: insertedSource.lineageId,
        sourceFingerprint: insertedSource.sourceFingerprint,
        provenanceFingerprint: insertedSource.provenanceFingerprint,
        style: item.style,
      }),
    ])
  })

  it("emits the exact next resolved-field atom with retained style and new provenance", () => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    if (built.status !== "accepted") throw new Error("field root missing")
    const previousRoot = built.root
    const field = coveredItems(previousRoot)[0]?.item
    if (field?.kind !== "resolved-field") throw new Error("field item missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      change: frozen({
        ...changeBase(previousRoot),
        kind: "resolved-field-rendered-value-change" as const,
        inlineId: field.inlineId,
        fieldKey: field.fieldKey,
        expectedPreviousRenderedValueFingerprint: field.contentFingerprint,
        nextRenderedText: "Q",
        nextSource: {
          lineageId: field.lineageId,
          sourceFingerprint: "field-source-next",
          provenanceFingerprint: "field-provenance-next",
        },
      }),
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.preflight.replacementItems).toHaveLength(1)
    expect(result.preflight.replacementItems[0]).toMatchObject({
      kind: "resolved-field",
      fieldKey: field.fieldKey,
      inlineId: field.inlineId,
      renderedText: "Q",
      sourceFingerprint: "field-source-next",
      provenanceFingerprint: "field-provenance-next",
      style: field.style,
    })
    expect(result.sourceMaterial.next.atoms).toContainEqual(expect.objectContaining({
      kind: "resolved-field",
      fieldKey: field.fieldKey,
      renderedText: "Q",
      sourceFingerprint: "field-source-next",
      provenanceFingerprint: "field-provenance-next",
      resolvedStyle: expect.objectContaining({
        effectiveShapingStyleKey: field.style.effectiveShapingStyleKey,
      }),
    }))
  })

  it("splits style material without deleting selected text", () => {
    const previousRoot = textRoot("ABCD")
    const item = coveredItems(previousRoot)[0]?.item
    if (item?.kind !== "text") throw new Error("text item missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      change: frozen({
        ...changeBase(previousRoot),
        kind: "supported-style-change" as const,
        range: { startRenderedUtf16: 1, endRenderedUtf16: 3 },
        expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
        expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
        nextStyle: { fontSize: { value: 24, unit: "pt" } },
        nextStyleFingerprint: fingerprint({ fontSize: { value: 24, unit: "pt" } }),
        nextStyleProvenanceFingerprint: fingerprint({ owner: "style-24pt" }),
      }),
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.sourceMaterial.next.atoms.map((atom) => atom.renderedText))
      .toEqual(["A", "BC", "D"])
    expect(result.sourceMaterial.next.atoms[1]).toMatchObject({
      kind: "text",
      renderedText: "BC",
      resolvedStyle: expect.objectContaining({ fontSizeLayoutUnit: 24_000_000 }),
    })
  })

  it("blocks an insertion that splits a UTF-16 surrogate pair", () => {
    const previousRoot = textRoot("A😀B")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 2, "X"),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-change-range" })],
    })
  })

  it.each([
    {
      name: "ffi ligature",
      text: "ffiZ",
      clusters: [
        { startRenderedUtf16: 0, endRenderedUtf16: 3 },
        { startRenderedUtf16: 3, endRenderedUtf16: 4 },
      ],
      expectedEnd: 3,
    },
    {
      name: "Thai combining sequence",
      text: "ก้่Z",
      clusters: [
        { startRenderedUtf16: 0, endRenderedUtf16: 3 },
        { startRenderedUtf16: 3, endRenderedUtf16: 4 },
      ],
      expectedEnd: 3,
    },
  ])("expands previous shape verification across a complete $name atom", ({
    text,
    clusters,
    expectedEnd,
  }) => {
    const previousRoot = clusteredTextRoot(text, clusters)
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.preflight.previousRanges.shapeVerificationRange)
      .toEqual({ startRenderedUtf16: 0, endRenderedUtf16: expectedEnd })
  })

  it("accounts for every Source/Flow visit and previous/next material atom", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    const exactMaterialAtomCount = result.sourceMaterial.previous.atoms.length
      + result.sourceMaterial.next.atoms.length
    expect(exactMaterialAtomCount).toBe(3)
    expect(result.completedCandidateWork.evidence).toMatchObject({
      visitedRequestLookupNodeCount: 2,
      materializedContextAtomCount: exactMaterialAtomCount,
      requestedAtomCount: exactMaterialAtomCount,
      visitedEvidenceNodeCount: 0,
    })
    expect(result.sourceMaterial.producerWorkCeilings.maximumVisitedEvidenceNodeCount)
      .toBe(8_192)
  })

  it.each([
    { at: 0, expectedKinds: ["resolved-field"] },
    { at: 1, expectedKinds: ["resolved-field", "inline-image-boundary"] },
    { at: 2, expectedKinds: ["inline-image-boundary", "generated-page-number"] },
    { at: 3, expectedKinds: ["generated-page-number", "hard-break"] },
    { at: 4, expectedKinds: ["hard-break"] },
  ] as const)("retains passive boundary facts around insertion at $at", ({
    at,
    expectedKinds,
  }) => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    if (built.status !== "accepted") throw new Error("passive boundary root missing")
    const styleItem = coveredItems(built.root).find((fragment) =>
      fragment.item.kind === "resolved-field"
    )?.item
    if (styleItem?.kind !== "resolved-field") throw new Error("passive style missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: built.root,
      change: insertionWithStyle(built.root, at, "X", styleItem.style),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    const kinds = new Set([
      ...result.sourceMaterial.previous.atoms.map((atom) => atom.kind),
      ...result.sourceMaterial.next.atoms.map((atom) => atom.kind),
    ])
    for (const expectedKind of expectedKinds) expect(kinds.has(expectedKind)).toBe(true)
    for (const atom of result.sourceMaterial.next.atoms) {
      if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") {
        expect(atom).toHaveProperty("boundaryFingerprint")
        expect(atom).not.toHaveProperty("resolvedStyle")
        expect(atom).not.toHaveProperty("assetId")
        expect(atom).not.toHaveProperty("paintFingerprint")
      }
      if (atom.kind === "generated-page-number") {
        expect(atom).toHaveProperty("generatedOwnerFingerprint")
        expect(atom).toHaveProperty("resolvedStyle")
      }
    }
  })

  it.each([
    { special: "\n" },
    { special: "\uFFFC" },
  ])("keeps inserted ordinary text carrying $special as a text atom", ({ special }) => {
    const previousRoot = textRoot("AB")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 1, special),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.sourceMaterial.next.atoms).toContainEqual(
      expect.objectContaining({ kind: "text", renderedText: special }),
    )
    expect(result.sourceMaterial.next.atoms).not.toContainEqual(
      expect.objectContaining({ kind: "hard-break" }),
    )
    expect(result.sourceMaterial.next.atoms).not.toContainEqual(
      expect.objectContaining({ kind: "inline-image-boundary" }),
    )
  })

  it("resolves an existing local style and applies one overlay across adjacent multi-style text", () => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "adjacent-text",
        mixedTextSizes: true,
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    if (built.status !== "accepted") throw new Error("multi-style root missing")
    const items = coveredItems(built.root).map((fragment) => fragment.item)
    const first = items[0]
    const second = items[1]
    if (first?.kind !== "text" || second?.kind !== "text") {
      throw new Error("multi-style text items missing")
    }
    expect(first.style.effectiveShapingStyleKey)
      .not.toBe(second.style.effectiveShapingStyleKey)

    const existingStyle = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: built.root,
      change: insertionWithStyle(built.root, 2, "X", second.style),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    expect(existingStyle.status).toBe("required")
    if (existingStyle.status === "required") {
      expect(existingStyle.sourceMaterial.next.atoms).toContainEqual(
        expect.objectContaining({
          kind: "text",
          renderedText: "X",
          resolvedStyle: expect.objectContaining({
            measurementStyleKey: second.style.measurementStyleKey,
            effectiveShapingStyleKey: second.style.effectiveShapingStyleKey,
            fontFaceId: second.style.fontFaceId,
            fontSizeLayoutUnit: second.style.fontSizeLayoutUnit,
          }),
        }),
      )
    }

    const overlay = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: built.root,
      change: frozen({
        ...changeBase(built.root),
        kind: "supported-style-change" as const,
        range: { startRenderedUtf16: 0, endRenderedUtf16: 2 },
        expectedPreviousStyleFingerprint: first.layoutDependencyFingerprint,
        expectedPreviousStyleProvenanceFingerprint: first.provenanceFingerprint,
        nextStyle: { textColor: "FF0000" },
        nextStyleFingerprint: fingerprint({ textColor: "FF0000" }),
        nextStyleProvenanceFingerprint: "multi-style-red",
      }),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    expect(overlay.status).toBe("not-required")
    if (overlay.status === "not-required") {
      expect(overlay.preflight.replacementItems).toHaveLength(2)
      expect(overlay.preflight.replacementItems.every((item) =>
        item.kind === "text" && item.style.textColor === "FF0000"
      )).toBe(true)
    }
  })

  it("blocks unavailable and forced-ambiguous registered style lookup", () => {
    const unavailableRoot = textRoot("ABCD")
    const unavailable = frozen({
      ...insertionAt(unavailableRoot, 0, "X"),
      measurementStyleKey: "unknown-measurement-style",
      effectiveShapingStyleKey: "unknown-shaping-style",
    })
    expect(prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: unavailableRoot,
      change: unavailable,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsupported-change-value" })],
    })

    const ambiguousRoot = textRoot("ABCD")
    expect(forceVNextTextBlockRegisteredSourceStyleCollisionForTestInternalV1(
      ambiguousRoot.sourceState,
    )).toBe(true)
    expect(prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: ambiguousRoot,
      change: insertionAt(ambiguousRoot, 0, "X"),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "style-authority-ambiguous" })],
    })
  })

  it("propagates the exact style registry through image paint without changing V3 identity", () => {
    const built = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "text-image-text",
        fit: "contain",
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    )
    if (built.status !== "accepted") throw new Error("paint root missing")
    const previous = built.root
    const painted = attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1({
      previousRoot: previous,
      change: imagePaintUnifiedLayoutChange5b(previous, {
        inlineId: "image-1",
        fit: "cover",
        crop: null,
      }),
      workPolicy: previous.workPolicy,
    })
    expect(painted.status).toBe("accepted-incremental")
    if (painted.status !== "accepted-incremental") return
    expect(painted.root.workPolicy).toBe(previous.workPolicy)
    expect(painted.root.workPolicy.fingerprint).toBe(previous.workPolicy.fingerprint)
    const insertion = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: painted.root,
      change: insertionAt(painted.root, 0, "X"),
      workPolicy: painted.root.workPolicy,
    })
    expect(insertion.status).toBe("required")
    if (insertion.status === "required") {
      expect(insertion.sourceMaterial.next.atoms).toContainEqual(
        expect.objectContaining({ kind: "text", renderedText: "X" }),
      )
      expect(insertion.completedCandidateWork.completeNextInputTraversalCount).toBe(0)
      expect(insertion.completedCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
    }
  })

  it("never visits a non-intersecting Source or Flow suffix subtree", () => {
    const root = acceptedRepeatedUnifiedLayoutRootFixture5b(32).root
    let sourceVisits = 0
    let flowVisits = 0
    const expectedSourceVisits = root.sourceState.root.height + 1
    const expectedFlowVisits = root.flowTree.root.height + 1
    const source = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: root.sourceState,
      range: { startRenderedUtf16: 0, endRenderedUtf16: 1 },
      beforeVisitNode: () => {
        sourceVisits += 1
        if (sourceVisits > expectedSourceVisits) {
          throw new Error("non-intersecting Source suffix read")
        }
        return true
      },
      beforeEmitItem: () => true,
    })
    const flow = visitVNextTextBlockTransitionFlowCoverageInternalV1({
      flowTree: root.flowTree,
      range: { startRenderedUtf16: 0, endRenderedUtf16: 1 },
      beforeVisitNode: () => {
        flowVisits += 1
        if (flowVisits > expectedFlowVisits) {
          throw new Error("non-intersecting Flow suffix read")
        }
        return true
      },
      beforeEmitAtom: () => true,
    })

    expect(source).toMatchObject({
      status: "accepted",
      visitedNodeCount: expectedSourceVisits,
      emittedItemCount: 1,
      completeTreeTraversalCount: 0,
    })
    expect(flow).toMatchObject({
      status: "accepted",
      visitedNodeCount: expectedFlowVisits,
      emittedAtomCount: 1,
      completeTreeTraversalCount: 0,
    })
    expect(sourceVisits).toBe(expectedSourceVisits)
    expect(flowVisits).toBe(expectedFlowVisits)
  })

  it.each([
    { unit: "evidence-request-lookup-nodes", limit: 1, status: "fallback-required", completed: 1 },
    { unit: "evidence-request-lookup-nodes", limit: 2, status: "required", completed: 2 },
    { unit: "evidence-request-lookup-nodes", limit: 3, status: "required", completed: 2 },
    { unit: "evidence-context-atoms", limit: 2, status: "fallback-required", completed: 2 },
    { unit: "evidence-context-atoms", limit: 3, status: "required", completed: 3 },
    { unit: "evidence-context-atoms", limit: 4, status: "required", completed: 3 },
  ] as const)("stops $unit at exact threshold edge $limit", (row) => {
    const previousRoot = textRoot("ABCD")
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "evidence",
      unit: row.unit,
      effectiveLimit: row.limit,
    })
    try {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: insertionAt(previousRoot, 0, "X"),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })
      expect(result.status).toBe(row.status)
      const actual = row.unit === "evidence-request-lookup-nodes"
        ? result.completedCandidateWork.evidence.visitedRequestLookupNodeCount
        : result.completedCandidateWork.evidence.materializedContextAtomCount
      expect(actual).toBe(row.completed)
      if (result.status === "fallback-required") {
        expect(getVNextTextBlockLimitExceededAuthorityRecordInternalV1(
          result.evaluatorOrProofAuthority,
        )).toMatchObject({
          previousRoot,
          stage: "evidence",
          unit: row.unit,
          completedWork: row.completed,
          effectiveLimit: row.limit,
        })
      }
    } finally {
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
    }
  })

  it("binds the registered V2 tuple to exact preflight/material/Root/change/policy identities", () => {
    const previousRoot = textRoot("ABCD")
    const change = insertionAt(previousRoot, 0, "X")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    if (result.status !== "required") throw new Error("exact tuple missing")
    const exact = {
      preflight: result.preflight,
      request: result.request,
      sourceMaterial: result.sourceMaterial,
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    }
    expect(inspectVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(exact))
      .toMatchObject({ status: "valid" })

    const otherRoot = textRoot("ABCD")
    const otherChange = insertionAt(previousRoot, 0, "Y")
    const attacks = [
      { ...exact, preflight: exactOwnDataClone(result.preflight) },
      { ...exact, request: exactOwnDataClone(result.request) },
      { ...exact, sourceMaterial: exactOwnDataClone(result.sourceMaterial) },
      { ...exact, previousRoot: otherRoot },
      { ...exact, change: otherChange },
      { ...exact, workPolicy: exactOwnDataClone(exact.workPolicy) },
    ]
    for (const attack of attacks) {
      expect(inspectVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(
        attack as typeof exact,
      )).toMatchObject({ status: "invalid", code: "evidence-authority-mismatch" })
    }
  })

  it("rejects malformed range and object-shape attacks before any V2 authority is produced", () => {
    const previousRoot = textRoot("ABCD")
    const base = insertionAt(previousRoot, 0, "X")
    const accessor = { ...base } as Record<string, unknown>
    Object.defineProperty(accessor, "insertedText", { get: () => "X", enumerable: true })
    const withSymbol = { ...base, [Symbol("attack")]: true }
    const withPrototype = Object.assign(Object.create({ inherited: true }), base)
    const withUnknown = { ...base, unknownField: true }
    const unsafeInteger = { ...base, atRenderedUtf16: Number.MAX_SAFE_INTEGER + 1 }
    const nonNestedRange = {
      ...replacement(previousRoot, 1, 3, "X"),
      removedRange: { startRenderedUtf16: 3, endRenderedUtf16: 1 },
    }
    const duplicateRange = {
      ...replacement(previousRoot, 1, 3, "X"),
      range: { startRenderedUtf16: 1, endRenderedUtf16: 3 },
    }
    for (const attack of [
      accessor,
      withSymbol,
      withPrototype,
      withUnknown,
      unsafeInteger,
      nonNestedRange,
      duplicateRange,
    ]) {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: attack as typeof base,
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })
      expect(result.status).toBe("blocked")
      expect(result.completedCandidateWork.evidence.requestCount).toBe(0)
    }
  })

  it("rejects cross-Root, cloned Root, and cloned policy attacks", () => {
    const first = textRoot("ABCD")
    const second = textRoot("WXYZ")
    const change = insertionAt(first, 0, "X")
    const rows = [
      {
        previousRoot: second,
        change,
        workPolicy: second.workPolicy,
        code: "stale-previous-root",
      },
      {
        previousRoot: exactOwnDataClone(first),
        change,
        workPolicy: first.workPolicy,
        code: "previous-root-authority-mismatch",
      },
      {
        previousRoot: first,
        change,
        workPolicy: exactOwnDataClone(first.workPolicy),
        code: "invalid-work-policy",
      },
    ]
    for (const row of rows) {
      expect(prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(
        row as Parameters<typeof prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2>[0],
      )).toMatchObject({
        status: "blocked",
        issues: [expect.objectContaining({ code: row.code })],
      })
    }
  })

  it("rejects forced-fingerprint-collision tuple forgeries by identity", () => {
    const previousRoot = textRoot("ABCD")
    const change = insertionAt(previousRoot, 0, "X")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    if (result.status !== "required") throw new Error("collision tuple missing")
    const forgedRequest = frozen({
      ...structuredClone(result.request),
      previous: {
        ...structuredClone(result.request.previous),
        changedSourceRange: { startRenderedUtf16: 0, endRenderedUtf16: 4 },
      },
      fingerprint: result.request.fingerprint,
    })
    expect(forgedRequest.fingerprint).toBe(result.request.fingerprint)
    expect(inspectVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      preflight: result.preflight,
      request: forgedRequest,
      sourceMaterial: result.sourceMaterial,
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toMatchObject({ status: "invalid", code: "evidence-authority-mismatch" })
  })

  it("keeps V1 contract tags and the locked V3 policy identity unchanged", () => {
    const v1ResponseSource:
      VNextTextBlockTransitionProducerResponseV1["source"] =
        "vnext-text-block-transition-producer-response-v1"
    const v1ResponseVersion:
      VNextTextBlockTransitionProducerResponseV1["contractVersion"] = 1
    const previousRoot = textRoot("ABCD")
    const change = insertionAt(previousRoot, 0, "X")
    const v1 = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    const v2 = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })
    expect(v1.status).toBe("required")
    expect(v2.status).toBe("required")
    expect(v1ResponseSource).toBe("vnext-text-block-transition-producer-response-v1")
    expect(v1ResponseVersion).toBe(1)
    if (v1.status === "required") {
      expect(v1.request).toMatchObject({
        source: "vnext-text-block-transition-evidence-request-v1",
        contractVersion: 1,
      })
    }
    if (v2.status === "required") {
      expect(v2.request).toMatchObject({
        source: "vnext-text-block-transition-evidence-request-v2",
        contractVersion: 2,
      })
      expect(v2.sourceMaterial).toMatchObject({
        source: "vnext-text-block-transition-producer-source-material-v2",
        contractVersion: 2,
      })
    }
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3).toMatchObject({
      policyId: "5b-1-v3",
      fingerprint: "sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982",
    })
  })

  it("uses next verification Unicode scalars as the conservative cluster ceiling", () => {
    const previousRoot = textRoot("A")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "😀"),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.preflight.nextRanges.shapeVerificationRange)
      .toEqual({ startRenderedUtf16: 0, endRenderedUtf16: 3 })
    expect(result.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount)
      .toBe(2)
    expect(result.completedCandidateWork.evidence.requestedClusterCount).toBe(2)
  })

  it("stops before an over-limit material atom and returns its registered evaluator authority", () => {
    const previousRoot = textRoot("ABCD")
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "evidence",
      unit: "evidence-context-atoms",
      effectiveLimit: 2,
    })
    try {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: insertionAt(previousRoot, 0, "X"),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })

      expect(result.status).toBe("fallback-required")
      if (result.status !== "fallback-required") return
      expect(result.completedCandidateWork.evidence.materializedContextAtomCount)
        .toBe(2)
      expect(getVNextTextBlockLimitExceededAuthorityRecordInternalV1(
        result.evaluatorOrProofAuthority,
      )).toMatchObject({
        previousRoot,
        originalChange: expect.any(Object),
        workPolicy:
          VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
        stage: "evidence",
        unit: "evidence-context-atoms",
        completedWork: 2,
        attemptedWork: 3,
        effectiveLimit: 2,
      })
    } finally {
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
    }
  })

  it("classifies an exact paint-only style overlay without producer evidence", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, { textColor: "FF0000" }),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result).toMatchObject({
      status: "not-required",
      request: null,
      sourceMaterial: null,
      preflight: {
        producerEvidence: "not-required",
        effectClassification: {
          effectClass: "paint-affecting-change",
          semanticIdentityChanged: true,
        },
      },
    })
  })

  it("classifies equal-metric style identity as semantic-only", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, {}),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result).toMatchObject({
      status: "not-required",
      request: null,
      sourceMaterial: null,
      preflight: {
        producerEvidence: "not-required",
        effectClassification: {
          effectClass: "semantic-only-change",
          semanticIdentityChanged: true,
        },
      },
    })
  })

  it("requires producer evidence for a metric style overlay", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, {
        fontSize: { value: 24, unit: "pt" },
      }),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result).toMatchObject({
      status: "required",
      preflight: {
        producerEvidence: "required",
        effectClassification: {
          effectClass: "geometry-affecting-change",
        },
      },
    })
  })

  it.each([
    { name: "start insertion", change: "insert", start: 0, end: 0, text: "X", next: "XABCD" },
    { name: "middle insertion", change: "insert", start: 2, end: 2, text: "X", next: "ABXCD" },
    { name: "end insertion", change: "insert", start: 4, end: 4, text: "X", next: "ABCDX" },
    { name: "start deletion", change: "delete", start: 0, end: 1, text: "", next: "BCD" },
    { name: "middle deletion", change: "delete", start: 1, end: 3, text: "", next: "AD" },
    { name: "end deletion", change: "delete", start: 3, end: 4, text: "", next: "ABC" },
    { name: "start replacement", change: "replace", start: 0, end: 1, text: "xy", next: "xyBCD" },
    { name: "middle replacement", change: "replace", start: 1, end: 3, text: "xy", next: "AxyD" },
    { name: "end replacement", change: "replace", start: 3, end: 4, text: "xy", next: "ABCxy" },
  ] as const)("builds nested exact lanes for $name", (row) => {
    const previousRoot = textRoot("ABCD")
    const change = row.change === "insert"
      ? insertionAt(previousRoot, row.start, row.text)
      : row.change === "delete"
        ? deletion(previousRoot, row.start, row.end)
        : replacement(previousRoot, row.start, row.end, row.text)
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    for (const lane of [result.preflight.previousRanges, result.preflight.nextRanges]) {
      expect(contains(lane.evidenceTargetRange, lane.changedSourceRange)).toBe(true)
      expect(contains(lane.shapeVerificationRange, lane.evidenceTargetRange)).toBe(true)
      expect(contains(lane.coverageRange, lane.shapeVerificationRange)).toBe(true)
    }
    expect(materialText(result, "previous")).toBe(
      "ABCD".slice(
        result.preflight.previousRanges.coverageRange.startRenderedUtf16,
        result.preflight.previousRanges.coverageRange.endRenderedUtf16,
      ),
    )
    expect(materialText(result, "next")).toBe(
      row.next.slice(
        result.preflight.nextRanges.coverageRange.startRenderedUtf16,
        result.preflight.nextRanges.coverageRange.endRenderedUtf16,
      ),
    )
    if (row.change === "delete") {
      expect(result.preflight.nextRanges.changedSourceRange).toEqual({
        startRenderedUtf16: row.start,
        endRenderedUtf16: row.start,
      })
      expect(
        result.preflight.nextRanges.evidenceTargetRange.endRenderedUtf16,
      ).toBeGreaterThan(
        result.preflight.nextRanges.evidenceTargetRange.startRenderedUtf16,
      )
    }
  })

  it("blocks deletion of the complete source topology", () => {
    const previousRoot = textRoot("ABCD")
    expect(prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: deletion(previousRoot, 0, 4),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsupported-change-value" })],
    })
  })

  it.each([
    {
      name: "fi ligature",
      text: "fiZ",
      clusters: [
        { startRenderedUtf16: 0, endRenderedUtf16: 2 },
        { startRenderedUtf16: 2, endRenderedUtf16: 3 },
      ],
      expectedEnd: 2,
    },
    {
      name: "ffi ligature",
      text: "ffiZ",
      clusters: [
        { startRenderedUtf16: 0, endRenderedUtf16: 3 },
        { startRenderedUtf16: 3, endRenderedUtf16: 4 },
      ],
      expectedEnd: 3,
    },
    {
      name: "Thai combining sequence",
      text: "ก้่Z",
      clusters: [
        { startRenderedUtf16: 0, endRenderedUtf16: 3 },
        { startRenderedUtf16: 3, endRenderedUtf16: 4 },
      ],
      expectedEnd: 3,
    },
  ])("keeps $name cluster atoms indivisible for deletion and replacement", ({
    text,
    clusters,
    expectedEnd,
  }) => {
    const previousRoot = clusteredTextRoot(text, clusters)
    for (const change of [
      deletion(previousRoot, 0, 1),
      replacement(previousRoot, 0, 1, "X"),
    ]) {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change,
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
      })
      expect(result.status).toBe("required")
      if (result.status !== "required") continue
      expect(result.preflight.previousRanges.shapeVerificationRange)
        .toEqual(expect.objectContaining({ endRenderedUtf16: expectedEnd }))
    }
  })

  it.each([
    { kind: "delete", start: 1, end: 2 },
    { kind: "delete", start: 2, end: 3 },
    { kind: "replace", start: 1, end: 2 },
    { kind: "replace", start: 2, end: 3 },
  ] as const)("blocks $kind splitting a surrogate pair at $start..$end", (row) => {
    const previousRoot = textRoot("A😀B")
    const change = row.kind === "delete"
      ? deletion(previousRoot, row.start, row.end)
      : replacement(previousRoot, row.start, row.end, "X")
    expect(prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-change-range" })],
    })
  })
})
