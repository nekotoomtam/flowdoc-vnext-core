import {
  createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1,
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1,
  type VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./textBlockUnifiedLayoutRootV2.js"
import {
  acceptVNextTextBlockFlowEvidenceV2,
} from "../../src/layout/textBlockFlowEvidenceV2.js"
import type {
  VNextTextBlockFlowEvidenceInputV2,
} from "../../src/layout/textBlockFlowEvidenceContractV2.js"
import {
  createVNextTextBlockInitialFlowV1,
} from "../../src/layout/textBlockInitialFlowInputV1.js"
import {
  createVNextTextBlockInitialFlowParentRegionV1,
} from "../../src/layout/textBlockInitialFlowParentRegionV1.js"
import {
  createVNextAuthoredBoxPlanV1,
  type VNextAuthoredBoxPlanV1,
} from "../../src/renderer/authoredBoxContractV1.js"
import type {
  TextBlockNodeV4Target,
} from "../../src/schema/documentV4ImageTarget.js"
import {
  completeTextGeometryBuildInputFixture,
} from "./textBlockInitialFlowV1.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1,
} from "../../packages/text-engine-rust-wasm/src/mr1FontFaces.js"

export function admitted5B2RootFixture(input: Parameters<
  typeof unifiedLayoutRootBuildInputFixtureV2
>[0] = {}) {
  const result = createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1({
    buildInput: unifiedLayoutRootBuildInputFixtureV2(input),
    constructionKind: "complete-bootstrap",
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  })
  if (result.status !== "accepted") {
    throw new Error(`5B-2 Root fixture blocked: ${JSON.stringify(result.issues)}`)
  }
  return result.root
}

export const FIVE_B2_TEST_POLICY =
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1

function acceptedCompleteText5B2SourceFixture(input: {
  readonly outerWidthPt: number
  readonly paddingPt: {
    readonly top: number
    readonly right: number
    readonly bottom: number
    readonly left: number
  }
}) {
  const base = completeTextGeometryBuildInputFixture()
  const textBlock: TextBlockNodeV4Target = {
    ...base.textBlock,
    props: {
      ...base.textBlock.props,
      box: {
        padding: {
          top: { value: input.paddingPt.top, unit: "pt" },
          right: { value: input.paddingPt.right, unit: "pt" },
          bottom: { value: input.paddingPt.bottom, unit: "pt" },
          left: { value: input.paddingPt.left, unit: "pt" },
        },
      },
    },
  }
  const authoredBox = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: input.outerWidthPt,
  })
  if (authoredBox.status !== "ready") {
    throw new Error(`5B-2 authored-box fixture blocked: ${JSON.stringify(authoredBox.issues)}`)
  }
  const parentRegion = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: "body",
    ownerId: "body-zone",
    xLayoutUnit: 0,
    yLayoutUnit: 0,
    widthLayoutUnit: input.outerWidthPt * 1_000_000,
    availableHeightLayoutUnit: null,
  })
  if (parentRegion.status !== "accepted") {
    throw new Error(`5B-2 parent-region fixture blocked: ${JSON.stringify(parentRegion.issues)}`)
  }
  const initial = createVNextTextBlockInitialFlowV1({
    ...base,
    textBlock,
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
      .filter((face) => face.fontFaceId === "sarabun-regular")
      .map(({ fontAssetPath: _fontAssetPath, ...face }) => ({ ...face })),
    authoredBoxPlan: authoredBox.plan,
    parentRegion: parentRegion.region,
    measurement: {
      ...base.measurement,
      availableWidthPt: authoredBox.plan.contentWidthPt,
    },
  })
  if (initial.status !== "classified") {
    throw new Error(`5B-2 Initial Flow fixture blocked: ${JSON.stringify(initial.issues)}`)
  }
  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: initial.flow.fingerprint,
    layoutId: `5b2-complete-text-${input.outerWidthPt}`,
    measurement: initial.flow.measurement,
    layoutUnitPolicyFingerprint: initial.flow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: authoredBox.plan.contentWidthPt * 1_000_000,
    declaredLineHeightLayoutUnit: initial.flow.declaredLineHeightLayoutUnit,
    paragraphStyle: initial.flow.paragraphStyle,
    fontFaces: initial.flow.fontFaces.map(({
      fontFamilyKey: _fontFamilyKey,
      ...face
    }) => ({ ...face })),
    shapingRuns: initial.flow.atoms.flatMap((atom, index) => {
      if (
        atom.kind !== "text"
        && atom.kind !== "resolved-field"
        && atom.kind !== "generated-page-number"
      ) return []
      return [{
        shapingRunId: `5b2-shape-${index}-${atom.inlineId}`,
        renderStartOffset: atom.renderStartOffset,
        renderEndOffset: atom.renderEndOffset,
        text: atom.renderedText,
        styleKey: atom.resolvedGeometryStyle.effectiveShapingStyleKey,
        fontFaceId: atom.resolvedGeometryStyle.fontFaceId,
        fontSizeLayoutUnit: atom.resolvedGeometryStyle.fontSizeLayoutUnit,
        textColor: atom.resolvedGeometryStyle.textColor,
        direction: "ltr" as const,
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: [{
          index: 0,
          renderStartOffset: atom.renderStartOffset,
          renderEndOffset: atom.renderEndOffset,
          advanceLayoutUnit: 6_000_000,
        }],
      }]
    }),
    breakOffsets: [0, 1, 2, 3, 4],
  }
  const evidence = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput,
  })
  if (evidence.status !== "accepted") {
    throw new Error(`5B-2 Evidence fixture blocked: ${JSON.stringify(evidence.issues)}`)
  }
  return {
    buildInput: {
      inputAuthority: "core-synthetic-qa-only" as const,
      initialFlow: initial.flow,
      evidence: evidence.evidence,
      spatialEntries: [],
    },
    textBlock,
  }
}

function accepted5B2RootFromCompleteText(input: {
  readonly outerWidthPt: number
  readonly paddingPt: {
    readonly top: number
    readonly right: number
    readonly bottom: number
    readonly left: number
  }
}) {
  const fixture = acceptedCompleteText5B2SourceFixture(input)
  const result = createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1({
    buildInput: fixture.buildInput,
    constructionKind: "complete-bootstrap",
    workPolicy: FIVE_B2_TEST_POLICY,
  })
  if (result.status !== "accepted") {
    throw new Error(`5B-2 complete-text Root blocked: ${JSON.stringify(result.issues)}`)
  }
  return { root: result.root, textBlock: fixture.textBlock }
}

export function admitted5B2HardBreakRootFixture() {
  return accepted5B2RootFromCompleteText({
    outerWidthPt: 100,
    paddingPt: { top: 2, right: 5, bottom: 2, left: 5 },
  }).root
}

export function admitted5B2NondefaultAutoHeightRootFixture() {
  return accepted5B2RootFromCompleteText({
    outerWidthPt: 124,
    paddingPt: { top: 3, right: 7, bottom: 4, left: 9 },
  }).root
}

export function registered5B2RootWithAuthoredBoxProfileFixture(
  authoredBoxProfile:
    VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1,
) {
  const prepared =
    prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
      unifiedLayoutRootBuildInputFixtureV2({ content: "text-only" }),
      FIVE_B2_TEST_POLICY,
      "complete-bootstrap",
    )
  if (prepared.status !== "prepared") {
    throw new Error(`5B-2 profiled Root fixture blocked: ${JSON.stringify(prepared.issues)}`)
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(prepared.root)
  if (registration.status !== "committed") {
    throw new Error(`5B-2 profiled Root registration blocked: ${registration.message}`)
  }
  markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1({
    root: prepared.root,
    source: prepared.root.sourceState,
    spatialState: prepared.root.spatialState,
    authoredBox: prepared.root.authoredBoxSummary,
    workPolicy: FIVE_B2_TEST_POLICY,
    authoredBoxProfile,
  })
  return prepared.root
}

export function authoredBoxMutation5B2Fixture(): {
  readonly root: ReturnType<typeof admitted5B2NondefaultAutoHeightRootFixture>
  readonly nextAuthoredBoxPlan: VNextAuthoredBoxPlanV1
} {
  const fixture = accepted5B2RootFromCompleteText({
    outerWidthPt: 124,
    paddingPt: { top: 3, right: 7, bottom: 4, left: 9 },
  })
  const nextTextBlock: TextBlockNodeV4Target = {
    ...fixture.textBlock,
    props: {
      ...fixture.textBlock.props,
      box: {
        padding: {
          top: { value: 5, unit: "pt" },
          right: { value: 8, unit: "pt" },
          bottom: { value: 6, unit: "pt" },
          left: { value: 10, unit: "pt" },
        },
      },
    },
  }
  const next = createVNextAuthoredBoxPlanV1({
    ownerNode: nextTextBlock,
    availableWidthPt: 132,
  })
  if (next.status !== "ready") {
    throw new Error(`5B-2 authored-box mutation fixture blocked: ${JSON.stringify(next.issues)}`)
  }
  return { root: fixture.root, nextAuthoredBoxPlan: next.plan }
}
