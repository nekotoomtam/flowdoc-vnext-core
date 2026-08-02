import { describe, expect, it } from "vitest"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  ROOT_V2_TEST_WORK_POLICY,
  acceptedUnifiedLayoutRootFixtureV2,
  unifiedLayoutRootBuildInputFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import { createVNextTextBlockUnifiedLayoutRootCompleteInternalV2 } from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import { VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1 } from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
  setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import type { VNextTextBlockUnifiedLayoutSourceItemV1 } from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"

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
        nextStyle: { textColor: "FF0000" },
        nextStyleFingerprint: fingerprint({ textColor: "FF0000" }),
        nextStyleProvenanceFingerprint: fingerprint({ owner: "style-red" }),
      }),
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.sourceMaterial.next.atoms.map((atom) => atom.renderedText))
      .toEqual(["A", "BC", "D"])
    expect(result.sourceMaterial.next.atoms[1]).toMatchObject({
      kind: "text",
      renderedText: "BC",
      resolvedStyle: expect.objectContaining({ textColor: "FF0000" }),
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
})
