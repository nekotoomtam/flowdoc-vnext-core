import { describe, expect, it } from "vitest"
import {
  getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2,
  getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2,
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
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
  acceptedRepeatedUnifiedLayoutRootFixture5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  admit5B2RootFixture,
  admitted5B2AuthorityRootFixture,
  admitted5B2PlanARootFixture,
  unrestrictedSourceCoveragePermits5B2,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import {
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1,
  getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
  setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  resolveVNextTextBlockSupportedStyleOverlayInternalV1,
  forceVNextTextBlockRegisteredSourceStyleCollisionForTestInternalV1,
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
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
import type { VNextTextBlockUnifiedLayoutRootBuildInputV2 } from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import type { TextRunStyleV4Target } from "../src/schema/documentV4Foundation.js"
import type {
  VNextTextBlockTransitionProducerResponseV1,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV1.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"

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

function create5B2Root(
  buildInput: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
) {
  const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    buildInput,
    workPolicy,
  )
  if (result.status !== "accepted") return result
  try {
    admit5B2RootFixture(result.root)
  } catch (error) {
    if (
      !(error instanceof Error)
      || (
        error.message !== "5B-2 Root admission blocked"
        && error.message
          !== "5B-2 Root admission requires an empty Spatial index"
      )
    ) throw error
  }
  return result
}

function textRoot(text: string) {
  const built = create5B2Root(
    unifiedLayoutRootBuildInputFixtureV2({ content: "text-only", text }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
  const built = create5B2Root(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
      text,
      textClusterRanges,
    }),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
  )
  if (built.status !== "accepted") throw new Error("clustered root missing")
  return built.root
}

function repeatedTextRoot(lineCount: number, includeImages = false) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages,
  })
  const built = create5B2Root({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2)
  if (built.status !== "accepted") throw new Error("repeated text root missing")
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
  startRenderedUtf16 = 0,
  endRenderedUtf16?: number,
) {
  const item = coveredItems(root)[0]?.item
  if (item?.kind !== "text") throw new Error("text item missing")
  return frozen({
    ...changeBase(root),
    kind: "supported-style-change" as const,
    range: {
      startRenderedUtf16,
      endRenderedUtf16: endRenderedUtf16 ?? item.renderedUtf16Length,
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
    ...unrestrictedSourceCoveragePermits5B2(),
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
  it("binds the exact public change through Source replacement preparation", () => {
    const { root } = admitted5B2PlanARootFixture({ text: "ABCD" })
    admit5B2RootFixture(root)
    const change = styleChange(root, { textColor: "FF0000" })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change,
      workPolicy: root.workPolicy,
    })
    expect(result.status, JSON.stringify(result)).toBe("not-required")
    if (result.status !== "not-required") return
    const registered = getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
      preflight: result.preflight,
      previousRoot: root,
    })
    if (registered?.sourceReplacement == null) {
      throw new Error("Source replacement authority missing")
    }
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState: root.sourceState,
      replacement: registered.sourceReplacement,
      beforeVisit: () => true,
    })
    expect(prepared.status).toBe("prepared")
    if (prepared.status !== "prepared") return
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      prepared.pathCopyCandidateAuthority,
    )?.change).toBe(change)
  })

  it("meters the Core-owned request and material rows while producer rows remain zero", () => {
    const workPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})
    const previousRoot = admitted5B2AuthorityRootFixture({ policy: workPolicy })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy,
    })

    expect(
      result.status,
      JSON.stringify(result.completedCandidateWork),
    ).toBe("required")
    if (result.status !== "required") return
    const evidenceRows = new Map(result.completedCandidateWork.stageWork
      .filter((row) => row.stage === "evidence")
      .map((row) => [row.unit, row.count]))
    expect(evidenceRows.get("evidence-request-descriptors")).toBe(
      result.completedCandidateWork.evidence.visitedRequestLookupNodeCount,
    )
    expect(evidenceRows.get("evidence-request-descriptors")).toBeGreaterThan(0)
    expect(evidenceRows.get("evidence-context-atoms")).toBe(
      result.completedCandidateWork.evidence.materializedContextAtomCount,
    )
    expect(evidenceRows.get("evidence-material-descriptors")).toBeGreaterThan(0)
    for (const unit of [
      "evidence-producer-descriptors",
      "evidence-runtime-invocations",
      "evidence-runtime-input-scalars",
      "evidence-glyphs",
      "evidence-clusters",
      "evidence-breaks",
      "evidence-guards",
      "evidence-proof-facts",
      "evidence-response-facts",
      "evidence-acceptance-descriptors",
      "evidence-acceptance-comparisons",
      "evidence-acceptance-registrations",
    ] as const) {
      expect(evidenceRows.get(unit), unit).toBe(0)
    }
    expect(result.sourceMaterial.producerWorkCeilings).toEqual({
      maximumVisitedEvidenceNodeCount: 73_728,
      maximumRequestedAtomCount:
        result.sourceMaterial.previous.atoms.length
        + result.sourceMaterial.next.atoms.length,
      maximumRequestedClusterCount:
        result.completedCandidateWork.evidence.requestedClusterCount,
    })
  })

  it("attributes a zero-limit authority request attempt without completing its ledger row", () => {
    const workPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-request-descriptors": 0,
      })
    const previousRoot = admitted5B2AuthorityRootFixture({ policy: workPolicy })
    const change = insertionAt(previousRoot, 0, "X")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy,
    })

    expect(result.status).toBe("fallback-required")
    if (result.status !== "fallback-required") return
    expect(result.completedCandidateWork.stageWork.find((row) =>
      row.stage === "evidence" && row.unit === "evidence-request-descriptors"
    )?.count).toBe(0)
    expect(result.completedCandidateWork.evidence.visitedRequestLookupNodeCount).toBe(0)
    expect(getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2(
      result.evaluatorOrProofAuthority,
    )).toMatchObject({
      previousRoot,
      change,
      workPolicy,
      unit: "evidence-request-descriptors",
      attemptedWork: 1,
      completedWork: 0,
      effectiveLimit: 0,
    })
  })

  it("stops at each Core material-descriptor boundary before emitting the next material envelope", () => {
    for (const row of [
      { limit: 0, completed: 0, status: "fallback-required" },
      { limit: 1, completed: 1, status: "fallback-required" },
      { limit: 2, completed: 2, status: "fallback-required" },
      { limit: 3, completed: 3, status: "required" },
    ] as const) {
      const workPolicy =
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          "evidence-material-descriptors": row.limit,
        })
      const previousRoot = admitted5B2AuthorityRootFixture({ policy: workPolicy })
      const change = insertionAt(previousRoot, 0, "X")
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change,
        workPolicy,
      })

      expect(result.status, `limit ${row.limit}`).toBe(row.status)
      expect(result.completedCandidateWork.stageWork.find((candidate) =>
        candidate.stage === "evidence"
        && candidate.unit === "evidence-material-descriptors"
      )?.count, `completed at limit ${row.limit}`).toBe(row.completed)
      if (result.status === "fallback-required") {
        expect(getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2(
          result.evaluatorOrProofAuthority,
        ), `terminal at limit ${row.limit}`).toMatchObject({
          previousRoot,
          change,
          workPolicy,
          unit: "evidence-material-descriptors",
          attemptedWork: row.limit + 1,
          completedWork: row.limit,
          effectiveLimit: row.limit,
        })
      } else if (result.status === "required") {
        expect(result.request.source).toBe(
          "vnext-text-block-transition-evidence-request-v2",
        )
        expect(result.sourceMaterial.source).toBe(
          "vnext-text-block-transition-producer-source-material-v2",
        )
      }
    }
  })

  it("attributes an authority-policy structural fallback to the request descriptor lane", () => {
    const workPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})
    const previousRoot = admitted5B2AuthorityRootFixture({ policy: workPolicy })
    const change = insertionAt(previousRoot, 0, "\n")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy,
    })

    expect(result).toMatchObject({
      status: "fallback-required",
      reason: "unsupported-structural-change",
    })
    if (result.status !== "fallback-required") return
    expect(getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2(
      result.evaluatorOrProofAuthority,
    )).toMatchObject({
      previousRoot,
      change,
      workPolicy,
      unit: "evidence-request-descriptors",
      attemptedWork: 0,
      completedWork: 0,
      effectiveLimit: 0,
    })
  })

  it("classifies an equal-rendered field provenance change after bounded facts", () => {
    const previousRoot = create5B2Root(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    )
    if (previousRoot.status !== "accepted") throw new Error("field root missing")
    const covered = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: previousRoot.root.sourceState,
      range: { startRenderedUtf16: 0, endRenderedUtf16: 1 },
      ...unrestrictedSourceCoveragePermits5B2(),
    })
    const field = covered.status === "accepted" ? covered.fragments[0]?.item : null
    if (field?.kind !== "resolved-field") throw new Error("field fixture missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: previousRoot.root,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    expect(result).toMatchObject({ status: "fallback-required", reason: "unadmitted-root" })
    if (result.status !== "not-required") return
    expect(result.preflight).not.toHaveProperty("expectedTargetBinding")
    expect(result.preflight).not.toHaveProperty("nextSourceSummary")
    expect(result.preflight.boundedDelta).toMatchObject({
      renderedContentEqual: true,
      semanticIdentityChanged: true,
      paintEqual: true,
      layoutEqual: true,
    })
  })

  it("keeps a true no-op evidence-free after exact change binding", () => {
    const previousRoot = textRoot("A")
    const result =
      prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: noOpUnifiedLayoutChange5b(previousRoot),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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

  it.each([
    { name: "true no-op", change: noOpUnifiedLayoutChange5b },
    {
      name: "paint-only bounded change",
      change: (root: VNextTextBlockUnifiedLayoutRootV2) =>
        styleChange(root, { textColor: "FF0000" }, 1, 3),
    },
  ])("rolls back $name preflight ownership when candidate registration fails", ({
    change: createChange,
  }) => {
    const { root: previousRoot, composition } = admitted5B2PlanARootFixture({
      text: "ABCD",
    })
    admit5B2RootFixture(previousRoot)
    const change = createChange(previousRoot)
    let producingPreflight: object | null = null
    let candidateWork: VNextTextBlockIncrementalCandidateWorkV1 | null = null
    setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
      (input) => {
        producingPreflight = input.producingStageAuthority
        candidateWork = input.candidateWork
        return false
      },
    )
    try {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change,
        workPolicy: previousRoot.workPolicy,
      })

      expect(result).toMatchObject({
        status: "blocked",
        issues: [expect.objectContaining({
          code: "evidence-authority-mismatch",
        })],
      })
      expect(producingPreflight).not.toBeNull()
      expect(candidateWork).not.toBeNull()
      if (producingPreflight == null || candidateWork == null) return
      expect(getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
        preflight: producingPreflight,
        previousRoot,
      })).toBeNull()
      expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
        previousRoot,
        change,
        composition,
        candidateWork,
      })).toBeNull()
    } finally {
      setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
        null,
      )
    }
  })

  it("requests registered-source material for an ordinary text insertion", () => {
    const built = create5B2Root(unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
    }), VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2)
    if (built.status !== "accepted") throw new Error("calibration root missing")
    const previousRoot = built.root
    const result =
      prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: textInsertion(previousRoot),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    const built = create5B2Root(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    )
    if (built.status !== "accepted") throw new Error("field root missing")
    const previousRoot = built.root
    const field = coveredItems(previousRoot)[0]?.item
    if (field?.kind !== "resolved-field") throw new Error("field item missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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

    expect(result.status).toBe("fallback-required")
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    const exactMaterialAtomCount = result.sourceMaterial.previous.atoms.length
      + result.sourceMaterial.next.atoms.length
    expect(exactMaterialAtomCount).toBe(3)
    expect(result.completedCandidateWork.evidence).toMatchObject({
      visitedRequestLookupNodeCount: 3,
      materializedContextAtomCount: exactMaterialAtomCount,
      requestedAtomCount: exactMaterialAtomCount,
      visitedEvidenceNodeCount: 0,
    })
    expect(result.sourceMaterial.producerWorkCeilings.maximumVisitedEvidenceNodeCount)
      .toBe(73_728)
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
    const built = create5B2Root(
      unifiedLayoutRootBuildInputFixtureV2({ content: "field-image-page-break" }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    )
    if (built.status !== "accepted") throw new Error("passive boundary root missing")
    const styleItem = coveredItems(built.root).find((fragment) =>
      fragment.item.kind === "resolved-field"
    )?.item
    if (styleItem?.kind !== "resolved-field") throw new Error("passive style missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: built.root,
      change: insertionWithStyle(built.root, at, "X", styleItem.style),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })

    expect(result.status).toBe("fallback-required")
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
  ])("rejects inserted ordinary structural sentinel $special before Evidence", ({ special }) => {
    const previousRoot = textRoot("AB")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 1, special),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })

    expect(result).toMatchObject({ status: "fallback-required", reason: "unsupported-structural-change" })
    expect(result.completedCandidateWork.evidence.requestCount).toBe(0)
  })

  it("resolves an existing local style and applies one overlay across adjacent multi-style text", () => {
    const built = create5B2Root(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "adjacent-text",
        mixedTextSizes: true,
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "style-authority-ambiguous" })],
    })
  })

  it("propagates the exact style registry through image paint without changing V3 identity", () => {
    const built = create5B2Root(
      unifiedLayoutRootBuildInputFixtureV2({
        content: "text-image-text",
        fit: "contain",
      }),
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    expect(insertion.status).toBe("fallback-required")
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
      ...unrestrictedSourceCoveragePermits5B2({
        beforeVisit: (unit) => {
          if (unit !== "source-coverage-nodes") return true
          sourceVisits += 1
          if (sourceVisits > expectedSourceVisits) {
            throw new Error("non-intersecting Source suffix read")
          }
          return true
        },
      }),
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
    { unit: "evidence-request-descriptors", limit: 1, status: "fallback-required", completed: 1 },
    { unit: "evidence-request-descriptors", limit: 2, status: "fallback-required", completed: 2 },
    { unit: "evidence-request-descriptors", limit: 3, status: "required", completed: 3 },
    { unit: "evidence-request-descriptors", limit: 4, status: "required", completed: 3 },
    { unit: "evidence-context-atoms", limit: 2, status: "fallback-required", completed: 2 },
    { unit: "evidence-context-atoms", limit: 3, status: "required", completed: 3 },
    { unit: "evidence-context-atoms", limit: 4, status: "required", completed: 3 },
  ] as const)("stops $unit at exact threshold edge $limit", (row) => {
    const workPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        [row.unit]: row.limit,
      })
    const previousRoot = admitted5B2AuthorityRootFixture({
      policy: workPolicy,
      text: "ABCD",
    })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy,
    })
    expect(result.status).toBe(row.status)
    expect(result.completedCandidateWork.stageWork.find((candidate) =>
      candidate.stage === "evidence" && candidate.unit === row.unit
    )?.count).toBe(row.completed)
    const aggregate = row.unit === "evidence-request-descriptors"
      ? result.completedCandidateWork.evidence.visitedRequestLookupNodeCount
      : result.completedCandidateWork.evidence.materializedContextAtomCount
    expect(aggregate).toBe(row.completed)
    if (result.status === "fallback-required") {
      expect(getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2(
        result.evaluatorOrProofAuthority,
      )).toMatchObject({
        previousRoot,
        workPolicy,
        unit: row.unit,
        completedWork: row.completed,
        attemptedWork: row.completed + 1,
        effectiveLimit: row.limit,
      })
    }
  })

  it("binds the registered V2 tuple to exact preflight/material/Root/change/policy identities", () => {
    const previousRoot = textRoot("ABCD")
    const change = insertionAt(previousRoot, 0, "X")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })
    if (result.status !== "required") throw new Error("exact tuple missing")
    const exact = {
      preflight: result.preflight,
      request: result.request,
      sourceMaterial: result.sourceMaterial,
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
        status: "blocked",
      },
      {
        previousRoot: exactOwnDataClone(first),
        change,
        workPolicy: first.workPolicy,
        code: "previous-root-authority-mismatch",
        status: "blocked",
      },
      {
        previousRoot: first,
        change,
        workPolicy: exactOwnDataClone(first.workPolicy),
        code: "invalid-work-policy",
        status: "blocked",
      },
    ]
    for (const row of rows) {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(
        row as Parameters<typeof prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2>[0],
      )
      expect(result.status).toBe(row.status)
      if (row.status === "blocked") {
        expect(result).toMatchObject({ issues: [expect.objectContaining({ code: row.code })] })
      } else {
        expect(result).toMatchObject({ reason: "unadmitted-root", issues: [] })
      }
    }
  })

  it("rejects forced-fingerprint-collision tuple forgeries by identity", () => {
    const previousRoot = textRoot("ABCD")
    const change = insertionAt(previousRoot, 0, "X")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })
    const v2 = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    const workPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-context-atoms": 2,
      })
    const previousRoot = admitted5B2AuthorityRootFixture({
      policy: workPolicy,
      text: "ABCD",
    })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy,
    })

    expect(result.status).toBe("fallback-required")
    if (result.status !== "fallback-required") return
    expect(result.completedCandidateWork.evidence.materializedContextAtomCount)
      .toBe(2)
    expect(getVNextTextBlockTransitionPreflightFailureAuthorityRecordInternalV2(
        result.evaluatorOrProofAuthority,
      )).toMatchObject({
        previousRoot,
        change: expect.any(Object),
        workPolicy,
        unit: "evidence-context-atoms",
        completedWork: 2,
        attemptedWork: 3,
        effectiveLimit: 2,
      })
  })

  it("classifies an exact paint-only style overlay without producer evidence", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, { textColor: "FF0000" }, 1, 3),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    if (result.status !== "not-required") return
    expect(result.preflight).not.toHaveProperty("expectedTargetBinding")
    expect(result.preflight.boundedDelta).toMatchObject({
      renderedContentEqual: true,
      semanticIdentityChanged: true,
      paintEqual: false,
      layoutEqual: true,
    })
    expect(result.preflight.boundedDelta.previous.map((span) => span.renderedText))
      .toEqual(["BC"])
    expect(result.preflight.boundedDelta.next.map((span) => span.renderedText))
      .toEqual(["BC"])
  })

  it("classifies equal-metric style identity as semantic-only", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, {}, 1, 3),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
    if (result.status !== "not-required") return
    expect(result.preflight).not.toHaveProperty("expectedTargetBinding")
    expect(result.preflight.boundedDelta).toMatchObject({
      renderedContentEqual: true,
      semanticIdentityChanged: true,
      paintEqual: true,
      layoutEqual: true,
    })
    expect(result.preflight.boundedDelta.previous.map((span) => span.renderedText))
      .toEqual(["BC"])
    expect(result.preflight.boundedDelta.next.map((span) => span.renderedText))
      .toEqual(["BC"])
  })

  it("requires producer evidence for a metric style overlay", () => {
    const previousRoot = textRoot("ABCD")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: styleChange(previousRoot, {
        fontSize: { value: 24, unit: "pt" },
      }),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
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
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-change-range" })],
    })
  })

  it.each([
    { name: "paint-only", nextStyle: { textColor: "FF0000" } },
    { name: "semantic-only", nextStyle: {} },
  ] as const)("keeps $name classification independent of producer material ceilings", ({
    nextStyle,
  }) => {
    const previousRoot = textRoot("ABCD")
    setVNextTextBlockPostBindingLimitOverrideForTestInternalV1({
      stage: "evidence",
      unit: "evidence-context-atoms",
      effectiveLimit: 0,
    })
    try {
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot,
        change: styleChange(previousRoot, nextStyle),
        workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
      })

      expect(result.status).toBe("not-required")
      if (result.status !== "not-required") return
      expect(result.request).toBeNull()
      expect(result.sourceMaterial).toBeNull()
      expect(result.completedCandidateWork.evidence).toMatchObject({
        requestCount: 0,
        materializedContextAtomCount: 0,
        requestedAtomCount: 0,
        requestedClusterCount: 0,
      })
    } finally {
      setVNextTextBlockPostBindingLimitOverrideForTestInternalV1(null)
    }
  })

  it.each([
    { name: "one leaf", lineCount: 1, itemPosition: "start" },
    { name: "middle branch", lineCount: 4, itemPosition: "middle" },
    { name: "two-level branch", lineCount: 32, itemPosition: "end" },
  ] as const)("classifies bounded replacement facts without predicting $name topology", ({
    lineCount,
    itemPosition,
  }) => {
    const previousRoot = repeatedTextRoot(lineCount)
    const textFragments = coveredItems(previousRoot).filter((fragment) =>
      fragment.item.kind === "text")
    const itemIndex = itemPosition === "start"
      ? 0
      : itemPosition === "middle"
        ? Math.floor(textFragments.length / 2)
        : textFragments.length - 1
    const fragment = textFragments[itemIndex]
    if (fragment?.item.kind !== "text") throw new Error("text item missing")
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: replacement(
        previousRoot,
        fragment.itemAbsoluteStartRenderedUtf16,
        fragment.itemAbsoluteEndRenderedUtf16,
        "MNOPQRSTUVWX",
      ),
      workPolicy: previousRoot.workPolicy,
    })

    expect(result.status).toBe("required")
    if (result.status !== "required") return
    expect(result.preflight).not.toHaveProperty("expectedTargetBinding")
    expect(result.preflight).not.toHaveProperty("nextSourceSummary")
    expect(result.preflight.boundedDelta).toMatchObject({
      renderedContentEqual: false,
      layoutEqual: false,
    })
    expect(result.preflight.boundedDelta.previous.map((span) => span.renderedText))
      .toEqual([fragment.item.renderedText])
    expect(result.preflight.boundedDelta.next.map((span) => span.renderedText))
      .toEqual(["MNOPQRSTUVWX"])
  })

  it("does not run Source packing for a ten-entry local insertion or a replacement above sixteen", () => {
    const fullLeafRoot = repeatedTextRoot(37, false)
    const sourceRoot = fullLeafRoot.sourceState.root
    if (sourceRoot.nodeKind !== "branch") throw new Error("branch root missing")
    const firstBranch = sourceRoot.children[0]
    const fullLeaf = firstBranch?.nodeKind === "branch"
      ? firstBranch.children.find((child) =>
          child.nodeKind === "leaf" && child.items.length === 8)
      : null
    if (fullLeaf?.nodeKind !== "leaf") throw new Error("full leaf missing")
    const firstText = fullLeaf.items.find((item) =>
      item.kind === "text" && item.renderedUtf16Length > 1)
    if (firstText?.kind !== "text") throw new Error("splittable text missing")
    const firstFragment = coveredItems(fullLeafRoot).find((fragment) =>
      fragment.item === firstText)
    if (firstFragment == null) throw new Error("text fragment missing")

    const tenEntryCase = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: fullLeafRoot,
      change: insertionAt(
        fullLeafRoot,
        firstFragment.itemAbsoluteStartRenderedUtf16 + 1,
        "X",
      ),
      workPolicy: fullLeafRoot.workPolicy,
    })
    expect(tenEntryCase.status).toBe("required")
    if (tenEntryCase.status === "required") {
      expect(tenEntryCase.preflight).not.toHaveProperty("expectedTargetBinding")
      expect(tenEntryCase.preflight.boundedDelta.previous).toEqual([])
      expect(tenEntryCase.preflight.boundedDelta.next.map((span) => span.renderedText))
        .toEqual(["X"])
    }

    const longRoot = textRoot("ABCD")
    const longReplacement = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: longRoot,
      change: replacement(longRoot, 1, 3, "x".repeat(17)),
      workPolicy: longRoot.workPolicy,
    })
    expect(longReplacement.status).toBe("required")
    if (longReplacement.status === "required") {
      expect(longReplacement.preflight).not.toHaveProperty("expectedTargetBinding")
      expect(longReplacement.preflight.boundedDelta.next.map((span) => span.renderedText))
        .toEqual(["x".repeat(17)])
    }
  })

  it("retains exact completed visits and zero requests on post-visit blocked exits", () => {
    const previousRoot = textRoot("ABCD")
    const deleteAll = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: deletion(previousRoot, 0, 4),
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })
    expect(deleteAll.status).toBe("blocked")
    expect(deleteAll.completedCandidateWork.evidence).toMatchObject({
      requestCount: 0,
      visitedRequestLookupNodeCount: 1,
      materializedContextAtomCount: 0,
      requestedAtomCount: 0,
      requestedClusterCount: 0,
    })

    const unavailableStyle = frozen({
      ...insertionAt(previousRoot, 0, "X"),
      measurementStyleKey: "missing-measurement",
      effectiveShapingStyleKey: "missing-shaping",
    })
    const unavailable = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: unavailableStyle,
      workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_CALIBRATION_TEST_ONLY_INTERNAL_V2,
    })
    expect(unavailable.status).toBe("blocked")
    expect(unavailable.completedCandidateWork.evidence).toMatchObject({
      requestCount: 0,
      visitedRequestLookupNodeCount: 2,
      materializedContextAtomCount: 0,
      requestedAtomCount: 0,
      requestedClusterCount: 0,
    })
  })

  it("counts an actual registered request exactly once and no pre-request fallback", () => {
    const acceptedPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})
    const previousRoot = admitted5B2AuthorityRootFixture({
      policy: acceptedPolicy,
      text: "ABCD",
    })
    const accepted = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot,
      change: insertionAt(previousRoot, 0, "X"),
      workPolicy: acceptedPolicy,
    })
    expect(accepted.status).toBe("required")
    expect(accepted.completedCandidateWork.evidence.requestCount).toBe(1)

    const fallbackPolicy =
      createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
        "evidence-context-atoms": 1,
      })
    const fallbackRoot = admitted5B2AuthorityRootFixture({
      policy: fallbackPolicy,
      text: "ABCD",
    })
    const fallback = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: fallbackRoot,
      change: insertionAt(fallbackRoot, 0, "Y"),
      workPolicy: fallbackPolicy,
    })
    expect(fallback.status).toBe("fallback-required")
    expect(fallback.completedCandidateWork.evidence).toMatchObject({
      requestCount: 0,
      materializedContextAtomCount: 1,
      requestedAtomCount: 0,
      requestedClusterCount: 0,
    })
  })
})
