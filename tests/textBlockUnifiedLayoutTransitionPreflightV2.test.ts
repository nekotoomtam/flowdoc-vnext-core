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
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"

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
})
