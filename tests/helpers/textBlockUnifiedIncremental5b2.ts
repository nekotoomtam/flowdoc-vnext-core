import {
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1,
  registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1,
  type VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.js"
import {
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1,
  registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
  type VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1,
  type VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
} from "../../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
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
import type {
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
  VNextTextBlockTransitionProducerOwnedWorkUnitV2,
} from "../../src/layout/textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  runFlowDocTextEngineNodeMr1RangeSegmentationV1,
  runFlowDocTextEngineNodeMr1RangeShapeV1,
} from "../../packages/text-engine-rust-wasm/src/node.js"
import {
  createFlowDocTextEngineUnifiedIncrementalEvidenceV2,
} from "../../packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.js"
import type {
  VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"

export function unrestrictedSourceCoveragePermits5B2(input: {
  readonly beforeVisit?: (
    unit: "source-coverage-nodes" | "source-coverage-items",
  ) => boolean
} = {}) {
  const permits = new WeakSet<object>()
  return {
    beforeVisit: (
      unit: "source-coverage-nodes" | "source-coverage-items",
    ): VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null => {
      if (input.beforeVisit?.(unit) === false) return null
      const permit = Object.freeze({}) as
        VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1
      permits.add(permit)
      return permit
    },
    completeVisit: (
      permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
    ): boolean => permits.has(permit),
  }
}

export type ProducerInvocationAuthorityEvent5B2 =
  | {
      readonly control: "begin"
      readonly status: "started" | "rejected"
    }
  | {
      readonly control: "charge"
      readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2
      readonly status: "charged" | "limit-exceeded" | "invalid-state"
      readonly attemptedWork?: number
      readonly completedWork?: number
      readonly effectiveLimit?: number
    }
  | {
      readonly control: "bind-runtime"
      readonly status: "bound" | "rejected"
    }
  | {
      readonly control: "close"
      readonly outcome: "producer-response" | "producer-failure" | "producer-blocked"
      readonly status: "closed" | "rejected"
      readonly visitedEvidenceNodeCount: number
    }

export function recordProducerInvocationAuthority5B2(
  exactAuthority: VNextTextBlockTransitionProducerInvocationAuthorityV2,
  executionEvents: string[] = [],
): {
  readonly authority: VNextTextBlockTransitionProducerInvocationAuthorityV2
  readonly events: ProducerInvocationAuthorityEvent5B2[]
} {
  const events: ProducerInvocationAuthorityEvent5B2[] = []
  const authority: VNextTextBlockTransitionProducerInvocationAuthorityV2 = {
    source: "vnext-text-block-transition-producer-invocation-authority-v2",
    contractVersion: 2,
    begin(request, sourceMaterial) {
      const result = exactAuthority.begin(request, sourceMaterial)
      events.push({ control: "begin", status: result.status })
      executionEvents.push(`authority:begin:${result.status}`)
      return result
    },
    charge(unit) {
      const result = exactAuthority.charge(unit)
      events.push({ control: "charge", ...result })
      executionEvents.push(`authority:charge:${unit}:${result.status}`)
      return result
    },
    bindRuntimeIdentity(identity) {
      const result = exactAuthority.bindRuntimeIdentity(identity)
      events.push({ control: "bind-runtime", status: result.status })
      executionEvents.push(`authority:bind-runtime:${result.status}`)
      return result
    },
    close(outcome) {
      const result = exactAuthority.close(outcome)
      events.push({ control: "close", outcome, ...result })
      executionEvents.push(`authority:close:${outcome}:${result.status}`)
      return result
    },
  }
  return { authority: Object.freeze(authority), events }
}

export function admitted5B2RootFixture(input: Parameters<
  typeof unifiedLayoutRootBuildInputFixtureV2
>[0] = {}) {
  const root = registered5B2RootFixture(input)
  try {
    return admit5B2RootFixture(root)
  } catch (error) {
    if (
      error instanceof Error
      && (
        error.message === "5B-2 Root admission blocked"
        || error.message === "5B-2 Root admission requires an empty Spatial index"
      )
    ) return root
    throw error
  }
}

export function registered5B2RootFixture(input: Parameters<
  typeof unifiedLayoutRootBuildInputFixtureV2
>[0] = {}) {
  const prepared = prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
    unifiedLayoutRootBuildInputFixtureV2(input),
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2,
    "complete-bootstrap",
  )
  if (prepared.status !== "prepared") {
    throw new Error(`5B-2 Root fixture blocked: ${JSON.stringify(prepared.issues)}`)
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(prepared.root)
  if (registration.status !== "committed") {
    throw new Error(`5B-2 Root registration blocked: ${registration.message}`)
  }
  return prepared.root
}

export const FIVE_B2_TEST_POLICY =
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2

export function admitted5B2PlanARootFixture(input: {
  readonly sourceLimits?: Partial<
    VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1
  >
  readonly text?: string
} = {}): {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
} {
  const root = registered5B2RootFixture({
    content: "text-only",
    text: input.text ?? "ABCD",
  })
  const composition =
    createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
      publicWorkPolicy: FIVE_B2_TEST_POLICY,
      sourceLimits: {
        sourceItems: Number.MAX_SAFE_INTEGER,
        sourceTreeLookupNodes: Number.MAX_SAFE_INTEGER,
        sourceTreePathCopyNodes: Number.MAX_SAFE_INTEGER,
        sourceLeafSlots: Number.MAX_SAFE_INTEGER,
        sourceIndexNodes: Number.MAX_SAFE_INTEGER,
        sourceIndexEntries: Number.MAX_SAFE_INTEGER,
        sourceIndexComparisons: Number.MAX_SAFE_INTEGER,
        sourceStyleNodes: Number.MAX_SAFE_INTEGER,
        sourceStyleBuckets: Number.MAX_SAFE_INTEGER,
        sourceStyleEntries: Number.MAX_SAFE_INTEGER,
        ...input.sourceLimits,
      },
    })
  if (!registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
    root,
    composition,
  })) {
    throw new Error("5B-2 Plan A Root policy composition registration blocked")
  }
  return { root, composition }
}

export function admit5B2RootFixture(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutRootV2 {
  if (root.spatialState.summary.entryCount !== 0) {
    throw new Error("5B-2 Root admission requires an empty Spatial index")
  }
  markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1({
    root,
    source: root.sourceState,
    spatialState: root.spatialState,
    authoredBox: root.authoredBoxSummary,
    workPolicy: root.workPolicy,
    authoredBoxProfile: {
      heightPolicy: "auto-height",
      clippingPolicy: "none",
      overflowPolicy: "none",
    },
  })
  const admission = registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1({
    root,
    source: root.sourceState,
    spatialState: root.spatialState,
    authoredBox: root.authoredBoxSummary,
    workPolicy: root.workPolicy,
  })
  if (admission == null) throw new Error("5B-2 Root admission blocked")
  return root
}

function actualSarabunRegularFaces5B2() {
  return FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1
    .filter((face) => face.fontFaceId === "sarabun-regular")
    .map(({ fontAssetPath: _fontAssetPath, ...face }) => ({ ...face }))
}

export function admitted5B2AuthorityRootFixture(input: {
  readonly policy?: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly text?: string
} = {}) {
  const policy = input.policy
    ?? createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({})
  const prepared = prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
    unifiedLayoutRootBuildInputFixtureV2({
      content: "text-only",
      text: input.text ?? "ABCD",
      fontFaces: actualSarabunRegularFaces5B2(),
    }),
    policy,
    "complete-bootstrap",
  )
  if (prepared.status !== "prepared") {
    throw new Error(`5B-2 authority Root fixture blocked: ${JSON.stringify(prepared.issues)}`)
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(prepared.root)
  if (registration.status !== "committed") {
    throw new Error(`5B-2 authority Root registration blocked: ${registration.message}`)
  }
  const composition =
    createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
      publicWorkPolicy: policy,
      sourceLimits: {
        sourceItems: Number.MAX_SAFE_INTEGER,
        sourceTreeLookupNodes: Number.MAX_SAFE_INTEGER,
        sourceTreePathCopyNodes: Number.MAX_SAFE_INTEGER,
        sourceLeafSlots: Number.MAX_SAFE_INTEGER,
        sourceIndexNodes: Number.MAX_SAFE_INTEGER,
        sourceIndexEntries: Number.MAX_SAFE_INTEGER,
        sourceIndexComparisons: Number.MAX_SAFE_INTEGER,
        sourceStyleNodes: Number.MAX_SAFE_INTEGER,
        sourceStyleBuckets: Number.MAX_SAFE_INTEGER,
        sourceStyleEntries: Number.MAX_SAFE_INTEGER,
      },
    })
  if (!registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
    root: prepared.root,
    composition,
  })) {
    throw new Error("5B-2 authority Root composition registration blocked")
  }
  markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1({
    root: prepared.root,
    source: prepared.root.sourceState,
    spatialState: prepared.root.spatialState,
    authoredBox: prepared.root.authoredBoxSummary,
    workPolicy: policy,
    authoredBoxProfile: {
      heightPolicy: "auto-height",
      clippingPolicy: "none",
      overflowPolicy: "none",
    },
  })
  const admission = registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1({
    root: prepared.root,
    source: prepared.root.sourceState,
    spatialState: prepared.root.spatialState,
    authoredBox: prepared.root.authoredBoxSummary,
    workPolicy: policy,
  })
  if (admission == null) {
    throw new Error("5B-2 authority Root admission blocked")
  }
  return prepared.root
}

export function authorizedEvidenceRequestBundle5B2(input: {
  readonly policy?: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly insertedText?: string
} = {}) {
  const root = admitted5B2AuthorityRootFixture({ policy: input.policy })
  if (root.sourceState.root.nodeKind !== "leaf") {
    throw new Error("5B-2 authority fixture requires one Source leaf")
  }
  const textItem = root.sourceState.root.items.find((item) => item.kind === "text")
  if (textItem == null || textItem.kind !== "text") {
    throw new Error("5B-2 authority fixture requires one text Source item")
  }
  const change = Object.freeze({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-insertion" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    atRenderedUtf16: 0,
    insertedText: input.insertedText ?? "X",
    insertedSource: Object.freeze({
      lineageId: `authority-insert-${input.insertedText ?? "X"}`,
      sourceFingerprint: `authority-source-${input.insertedText ?? "X"}`,
      provenanceFingerprint: `authority-provenance-${input.insertedText ?? "X"}`,
    }),
    measurementStyleKey: textItem.style.measurementStyleKey,
    effectiveShapingStyleKey: textItem.style.effectiveShapingStyleKey,
  })
  const result = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
    previousRoot: root,
    change,
  })
  if (result.status !== "required") {
    throw new Error(`5B-2 authority request fixture ${result.status}: ${JSON.stringify({
      completedCandidateWork: result.completedCandidateWork,
      issues: result.issues,
    })}`)
  }
  return {
    root,
    change,
    request: result.request,
    sourceMaterial: result.sourceMaterial,
    producerInvocationAuthority: result.producerInvocationAuthority,
    result,
  }
}

export function authorizedProducerTerminalFixture5B2(input: {
  readonly insertedText?: string
  readonly producerInsertedText?: string
  readonly limits?: Parameters<
    typeof createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2
  >[0]
  readonly runtimeFailure?: "shape" | "segment"
  readonly extraProducerDescriptorCharge?: boolean
} = {}) {
  const fixtureLabel = input.insertedText ?? "X"
  const bundle = authorizedEvidenceRequestBundle5B2({
    insertedText: input.producerInsertedText ?? "X",
    policy: createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(
      input.limits ?? {},
    ),
  })
  const producerRuntimeIdentity =
    createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
      runtime: "node-native-mr1-range",
      engineBuildFingerprint: `engine-authorized-${fixtureLabel}`,
      fontBackendFingerprint: `font-authorized-${fixtureLabel}`,
      unitPolicyFingerprint: bundle.request.layoutUnitPolicyFingerprint,
      fontStyleUnitDependencyFingerprint:
        bundle.request.fontStyleUnitDependencyFingerprint,
      producerRuntimeRequirementFingerprint:
        bundle.request.producerRuntimeRequirementFingerprint,
    })
  const producerInvocationAuthority = input.extraProducerDescriptorCharge
    ? Object.freeze({
        source: bundle.producerInvocationAuthority.source,
        contractVersion: bundle.producerInvocationAuthority.contractVersion,
        begin: bundle.producerInvocationAuthority.begin.bind(
          bundle.producerInvocationAuthority,
        ),
        charge(unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2) {
          const charged = bundle.producerInvocationAuthority.charge(unit)
          if (unit === "evidence-producer-descriptors" && charged.status === "charged") {
            const extra = bundle.producerInvocationAuthority.charge(unit)
            if (extra.status !== "charged") return extra
          }
          return charged
        },
        bindRuntimeIdentity: bundle.producerInvocationAuthority.bindRuntimeIdentity.bind(
          bundle.producerInvocationAuthority,
        ),
        close: bundle.producerInvocationAuthority.close.bind(
          bundle.producerInvocationAuthority,
        ),
      })
    : bundle.producerInvocationAuthority
  const result = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
    producerInvocationAuthority,
    bundle.request,
    bundle.sourceMaterial,
    {
      identity: producerRuntimeIdentity,
      shapeRange(shapeInput) {
        if (input.runtimeFailure === "shape") throw new Error("shape unavailable")
        const face = FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.find(
          (candidate) => candidate.fontFaceId === shapeInput.fontFaceId,
        )
        if (face == null) throw new Error("font unavailable")
        return runFlowDocTextEngineNodeMr1RangeShapeV1({
          text: shapeInput.text,
          fontId: face.fontFaceId,
          fontAssetPath: face.fontAssetPath,
          fontSha256: face.fontSha256,
          rangeStartUtf16: shapeInput.rangeStartUtf16,
          rangeEndUtf16: shapeInput.rangeEndUtf16,
          contextStartUtf16: shapeInput.contextStartUtf16,
          contextEndUtf16: shapeInput.contextEndUtf16,
        })
      },
      segmentRange(segmentInput) {
        if (input.runtimeFailure === "segment") {
          throw new Error("segment unavailable")
        }
        return runFlowDocTextEngineNodeMr1RangeSegmentationV1(segmentInput)
      },
    },
  )
  return {
    previousRoot: bundle.root,
    change: bundle.change,
    request: bundle.request,
    sourceMaterial: bundle.sourceMaterial,
    producerInvocationAuthority: bundle.producerInvocationAuthority,
    producerRuntimeIdentity,
    result,
  }
}

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
}, policy: VNextTextBlockUnifiedLayoutWorkPolicyV1 = FIVE_B2_TEST_POLICY) {
  const fixture = acceptedCompleteText5B2SourceFixture(input)
  const prepared = prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
    fixture.buildInput,
    policy,
    "complete-bootstrap",
  )
  if (prepared.status !== "prepared") {
    throw new Error(`5B-2 complete-text Root blocked: ${JSON.stringify(prepared.issues)}`)
  }
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(prepared.root)
  if (registration.status !== "committed") {
    throw new Error(`5B-2 complete-text Root registration blocked: ${registration.message}`)
  }
  return { root: admit5B2RootFixture(prepared.root), textBlock: fixture.textBlock }
}

export function admitted5B2HardBreakRootFixture(
  policy: VNextTextBlockUnifiedLayoutWorkPolicyV1 = FIVE_B2_TEST_POLICY,
) {
  return accepted5B2RootFromCompleteText({
    outerWidthPt: 100,
    paddingPt: { top: 2, right: 5, bottom: 2, left: 5 },
  }, policy).root
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
