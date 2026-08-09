import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
  VNextTextBlockSourceRangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  ImageFrameV4Target,
} from "../schema/documentV4ImageTarget.js"
import type { TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import {
  convertVNextPositiveUnitValueToLayoutUnitV1,
} from "./layoutUnitPolicyV1.js"
import {
  createVNextTextBlockEffectiveShapingStyleIdentityV1,
} from "./textBlockEffectiveShapingStyleIdentityV1.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION,
  type VNextTextBlockUnifiedLayoutSourceBranchV1,
  type VNextTextBlockUnifiedLayoutSourceItemV1,
  type VNextTextBlockUnifiedLayoutSourceLeafV1,
  type VNextTextBlockUnifiedLayoutSourceLookupResultV1,
  type VNextTextBlockUnifiedLayoutSourceNodeV1,
  type VNextTextBlockUnifiedLayoutSourceStateBuildResultV1,
  type VNextTextBlockUnifiedLayoutSourceStateInspectionV1,
  type VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1,
  type VNextTextBlockUnifiedLayoutSourceStatePolicyV1,
  type VNextTextBlockUnifiedLayoutSourceStateV1,
  type VNextTextBlockUnifiedLayoutSourceStyleV1,
  type VNextTextBlockUnifiedLayoutSourceSummaryV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
} from "./textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateAbortProtectedInternalV1,
  isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateCommittedInternalV1,
} from "./textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"

type FingerprintFactory = (canonicalFacts: string) => string

const FORCED_COLLISION_FINGERPRINT =
  `sha256:${"0".repeat(64)}` as const

interface IndexedSourceItemRecord {
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly itemIndex: number
  readonly absoluteStartRenderedUtf16: number
  readonly leaf: VNextTextBlockUnifiedLayoutSourceLeafV1
  readonly ancestors: readonly {
    readonly branch: VNextTextBlockUnifiedLayoutSourceBranchV1
    readonly childIndex: number
  }[]
  readonly visitedSourceLookupNodeCount: number
}

interface SourceItemIndexEntryInternalV1 {
  readonly kind: VNextTextBlockUnifiedLayoutSourceItemV1["kind"]
  readonly itemOrdinal: number
  readonly absoluteStartRenderedUtf16: number
}

type SourceItemIndex =
  | {
      readonly indexKind: "complete"
      readonly entries: ReadonlyMap<
        string,
        readonly SourceItemIndexEntryInternalV1[]
      >
    }
  | {
      readonly indexKind: "range-delta"
      readonly previous: SourceItemIndex
      readonly removedItemOrdinalStart: number
      readonly removedItemOrdinalEnd: number
      readonly itemOrdinalDelta: number
      readonly previousLeafEndRenderedUtf16: number
      readonly renderedUtf16Delta: number
      readonly localEntries: ReadonlyMap<
        string,
        readonly SourceItemIndexEntryInternalV1[]
      >
    }

function sourceItemIndexEntriesInternalV1(
  index: SourceItemIndex,
  inlineId: string,
  beforeVisitLayer?: () => boolean,
  meterCompleteLayer = true,
): {
  readonly entries: readonly SourceItemIndexEntryInternalV1[]
  readonly visitedIndexLayerCount: number
  readonly limitExceeded: boolean
} {
  if (index.indexKind === "complete") {
    if (
      meterCompleteLayer
      && beforeVisitLayer != null
      && !beforeVisitLayer()
    ) {
      return {
        entries: Object.freeze([]),
        visitedIndexLayerCount: 0,
        limitExceeded: true,
      }
    }
    return {
      entries: index.entries.get(inlineId) ?? Object.freeze([]),
      visitedIndexLayerCount:
        beforeVisitLayer == null || !meterCompleteLayer ? 0 : 1,
      limitExceeded: false,
    }
  }
  if (beforeVisitLayer != null && !beforeVisitLayer()) {
    return {
      entries: Object.freeze([]),
      visitedIndexLayerCount: 0,
      limitExceeded: true,
    }
  }
  const inherited = sourceItemIndexEntriesInternalV1(
    index.previous,
    inlineId,
    beforeVisitLayer,
    meterCompleteLayer,
  )
  if (inherited.limitExceeded) {
    return {
      entries: Object.freeze([]),
      visitedIndexLayerCount: inherited.visitedIndexLayerCount + 1,
      limitExceeded: true,
    }
  }
  const transformed = inherited.entries.flatMap((entry) => {
    if (
      entry.itemOrdinal >= index.removedItemOrdinalStart
      && entry.itemOrdinal < index.removedItemOrdinalEnd
    ) return []
    return [{
      ...entry,
      itemOrdinal: entry.itemOrdinal >= index.removedItemOrdinalEnd
        ? entry.itemOrdinal + index.itemOrdinalDelta
        : entry.itemOrdinal,
      absoluteStartRenderedUtf16:
        entry.absoluteStartRenderedUtf16
          >= index.previousLeafEndRenderedUtf16
        ? entry.absoluteStartRenderedUtf16 + index.renderedUtf16Delta
        : entry.absoluteStartRenderedUtf16,
    }]
  })
  return {
    entries: Object.freeze([
      ...transformed,
      ...(index.localEntries.get(inlineId) ?? []),
    ].sort((left, right) => left.itemOrdinal - right.itemOrdinal)),
    visitedIndexLayerCount: inherited.visitedIndexLayerCount + 1,
    limitExceeded: false,
  }
}

export interface VNextTextBlockPreparedSourceEnvelopeFactsInternalV1 {
  readonly sourceItemCount: number
  readonly treeHeight: number
  readonly maximumLeafOccupancy: 8
  readonly deliberateItemResolutionCount: 1
}

const policyFacts = {
  policyVersion: 1 as const,
  maximumLeafItems: 8 as const,
  maximumBranchChildren: 8 as const,
  splitOverflowLeftCount: 4 as const,
  splitOverflowRightCount: 5 as const,
  underflowBorrowOrder: ["left", "right"] as const,
  underflowMergeOrder: ["left", "right"] as const,
}

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1:
VNextTextBlockUnifiedLayoutSourceStatePolicyV1 = Object.freeze({
  ...policyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(policyFacts),
  ),
})

const preparedStates = new WeakMap<
VNextTextBlockUnifiedLayoutSourceStateV1,
{
  readonly fingerprint: string
  readonly canonicalFacts: string
  readonly fingerprintFactory: FingerprintFactory
  readonly itemIndex: SourceItemIndex
  readonly sourceEnvelopeFacts:
    VNextTextBlockPreparedSourceEnvelopeFactsInternalV1
}
>()
let sourceEnvelopeFactsForNextCompleteBuildForTest:
  | VNextTextBlockPreparedSourceEnvelopeFactsInternalV1
  | null = null
const statesByEvidence = new WeakMap<
VNextTextBlockFlowEvidenceV2,
WeakSet<VNextTextBlockUnifiedLayoutSourceStateV1>
>()
const statesByInitialFlow = new WeakMap<
VNextTextBlockInitialFlowV1,
WeakSet<VNextTextBlockUnifiedLayoutSourceStateV1>
>()
const registeredRootGraphStates = new WeakSet<
VNextTextBlockUnifiedLayoutSourceStateV1
>()
const imagePaintNextStates = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  WeakSet<VNextTextBlockUnifiedLayoutSourceStateV1>
>()
const imagePaintSourceItemAuthorities = new WeakMap<
  object,
  {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly inlineId: string
    readonly item: Extract<
      VNextTextBlockUnifiedLayoutSourceItemV1,
      { readonly kind: "inline-image" }
    >
    readonly indexed: IndexedSourceItemRecord | null
  }
>()

export interface VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1 {
  readonly __incrementalStructuralTargetAuthorityOpaque: never
}

export interface VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 {
  readonly __sourceLayoutDeltaAuthorityOpaque: never
}

export interface VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1 {
  readonly __sourcePathCopyCandidateAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1 {
  readonly previousRange: VNextTextBlockSourceRangeV1
  readonly nextItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly expectedPreviousContentFingerprint: string
  readonly expectedPreviousSourceFingerprint: string
  readonly expectedPreviousProvenanceFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockSourceRangePathCopyResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly visitedLookupNodeCount: number
      readonly copiedPathNodeCount: number
      readonly visitedChangedLeafItemCount: number
      readonly existingLineageIds: readonly string[]
      readonly insertedLineageIds: readonly string[]
      readonly pathCopyCandidateAuthority:
        VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly sourceState: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export interface VNextTextBlockSourcePathCopyCandidateRecordInternalV1 {
  readonly pathCopyCandidateAuthority:
    VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly replacement:
    VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
  readonly change: VNextTextBlockUnifiedLayoutChangeV1 | null
  readonly nextLeafItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly removedItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextLeafStartRenderedUtf16: number
  readonly visitedLookupNodeCount: number
  readonly copiedPathNodeCount: number
  readonly visitedChangedLeafItemCount: number
}
const sourceRangePathCopyCandidateAuthorities = new WeakMap<
  object,
  VNextTextBlockSourcePathCopyCandidateRecordInternalV1
>()
const consumedSourcePathCopyCandidateAuthorities = new WeakSet<object>()
let sourcePathCopyCandidateObserverForTestInternalV1: (
  (authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1) => void
) | null = null

export function setVNextTextBlockUnifiedLayoutSourcePathCopyCandidateObserverForTestInternalV1(
  observer: typeof sourcePathCopyCandidateObserverForTestInternalV1,
): void {
  sourcePathCopyCandidateObserverForTestInternalV1 = observer
}
const sourceRangeReplacementAuthorities = new WeakMap<object, {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly change: VNextTextBlockUnifiedLayoutChangeV1 | null
}>()

export function registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1(
  input: {
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly replacement:
      VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
    readonly change?: VNextTextBlockUnifiedLayoutChangeV1
  },
): boolean {
  if (
    !preparedStates.has(input.previousSourceState)
    || !Object.isFrozen(input.replacement)
    || !Object.isFrozen(input.replacement.previousRange)
    || !Object.isFrozen(input.replacement.nextItems)
  ) return false
  const change = input.change ?? null
  const existing = sourceRangeReplacementAuthorities.get(input.replacement)
  if (existing != null) {
    return existing.previousSourceState === input.previousSourceState
      && existing.change === change
  }
  sourceRangeReplacementAuthorities.set(input.replacement, Object.freeze({
    previousSourceState: input.previousSourceState,
    change,
  }))
  return true
}

export function getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
  authority: unknown,
): VNextTextBlockSourcePathCopyCandidateRecordInternalV1 | null {
  return authority != null && typeof authority === "object"
    ? sourceRangePathCopyCandidateAuthorities.get(authority as object) ?? null
    : null
}

export function discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
  authority: unknown,
): boolean {
  if (
    authority == null
    || typeof authority !== "object"
  ) return false
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    authority,
  )
  const canonicalAuthority = record?.pathCopyCandidateAuthority
  if (
    record == null
    || canonicalAuthority == null
    || consumedSourcePathCopyCandidateAuthorities.has(canonicalAuthority)
    || isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateAbortProtectedInternalV1(
      canonicalAuthority,
    )
  ) return false
  sourceRangePathCopyCandidateAuthorities.delete(canonicalAuthority)
  sourceRangePathCopyCandidateAuthorities.delete(record.removedItems)
  sourceRangePathCopyCandidateAuthorities.delete(record.nextPhysicalItems)
  preparedStates.delete(record.nextSourceState)
  planASidecarStorageSourceStates.delete(record.nextSourceState)
  registeredStylesBySourceState.delete(record.nextSourceState)
  registeredPlanASourceSidecarAccessBySourceState.delete(record.nextSourceState)
  return true
}

export function consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
  authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
): boolean {
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    authority,
  )
  const canonicalAuthority = record?.pathCopyCandidateAuthority
  if (
    record == null
    || canonicalAuthority == null
    || consumedSourcePathCopyCandidateAuthorities.has(canonicalAuthority)
    || !isVNextTextBlockUnifiedLayoutSourceStageSourceCandidateCommittedInternalV1(
      canonicalAuthority,
    )
  ) return false
  sourceRangePathCopyCandidateAuthorities.delete(canonicalAuthority)
  sourceRangePathCopyCandidateAuthorities.delete(record.removedItems)
  sourceRangePathCopyCandidateAuthorities.delete(record.nextPhysicalItems)
  consumedSourcePathCopyCandidateAuthorities.add(canonicalAuthority)
  return true
}

interface RegisteredStyleSetInternalV1 {
  readonly entries: readonly {
    readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
    readonly referenceCount: number
  }[]
}

const registeredStylesBySourceState = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  RegisteredStyleSetInternalV1
>()

type RegisteredSourceStyleResolutionInternalV1 =
  | { readonly status: "resolved"; readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1 }
  | { readonly status: "unavailable" | "ambiguous"; readonly style: null }

interface RegisteredPlanASourceSidecarAccessInternalV1 {
  readonly resolveStyle: (input: {
    readonly measurementStyleKey: string
    readonly effectiveShapingStyleKey: string
  }) => RegisteredSourceStyleResolutionInternalV1
  readonly visitItemByInlineId: (input: {
    readonly inlineId: string
    readonly beforeVisitNode: () => boolean
  }) => VNextTextBlockTransitionSourceItemLookupResultInternalV1
  readonly checkInlineIdConflict: (input: {
    readonly inlineId: string
    readonly incomingKind: VNextTextBlockUnifiedLayoutSourceItemV1["kind"]
    readonly beforeVisitNode: () => boolean
  }) =>
    | { readonly status: "checked"; readonly conflict: boolean }
    | { readonly status: "limit-exceeded" }
}

const registeredPlanASourceSidecarAccessBySourceState = new WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  RegisteredPlanASourceSidecarAccessInternalV1
>()
const planASidecarStorageSourceStates = new WeakSet<
  VNextTextBlockUnifiedLayoutSourceStateV1
>()

export function canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
): boolean {
  return preparedStates.has(sourceState)
    && !registeredPlanASourceSidecarAccessBySourceState.has(sourceState)
}

export function registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly resolveStyle: RegisteredPlanASourceSidecarAccessInternalV1["resolveStyle"]
    readonly visitItemByInlineId: RegisteredPlanASourceSidecarAccessInternalV1["visitItemByInlineId"]
    readonly checkInlineIdConflict: RegisteredPlanASourceSidecarAccessInternalV1["checkInlineIdConflict"]
  },
): boolean {
  if (
    !canRegisterVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1(
      input.sourceState,
    )
    || typeof input.resolveStyle !== "function"
    || typeof input.visitItemByInlineId !== "function"
    || typeof input.checkInlineIdConflict !== "function"
  ) return false
  registeredPlanASourceSidecarAccessBySourceState.set(input.sourceState, Object.freeze({
    resolveStyle: input.resolveStyle,
    visitItemByInlineId: input.visitItemByInlineId,
    checkInlineIdConflict: input.checkInlineIdConflict,
  }))
  return true
}

function registeredStyleSetFromItems(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
): RegisteredStyleSetInternalV1 {
  const counts = new Map<VNextTextBlockUnifiedLayoutSourceStyleV1, number>()
  for (const item of items) {
    if (item.kind === "text" || item.kind === "resolved-field" || item.kind === "generated-page-number") {
      counts.set(item.style, (counts.get(item.style) ?? 0) + 1)
    }
  }
  return Object.freeze({
    entries: Object.freeze([...counts.entries()].map(([style, referenceCount]) =>
      Object.freeze({ style, referenceCount })
    )),
  })
}

function sameResolvedStyle(
  left: VNextTextBlockUnifiedLayoutSourceStyleV1,
  right: VNextTextBlockUnifiedLayoutSourceStyleV1,
): boolean {
  return left.measurementStyleKey === right.measurementStyleKey
    && left.effectiveShapingStyleKey === right.effectiveShapingStyleKey
    && left.fontFamilyKey === right.fontFamilyKey
    && left.fontFaceId === right.fontFaceId
    && left.fontSizeLayoutUnit === right.fontSizeLayoutUnit
    && left.textColor === right.textColor
    && left.fontWeight === right.fontWeight
    && left.fontStyle === right.fontStyle
    && left.textDecoration === right.textDecoration
    && left.strikethrough === right.strikethrough
    && stringifyVNextCanonicalJson(left.authoredLocalStyle)
      === stringifyVNextCanonicalJson(right.authoredLocalStyle)
}

export type VNextTextBlockTransitionReplacementSourceItemInputInternalV1 = {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly renderedText: string
  readonly lineageId: string
  readonly inlineId: string
  readonly sourceFingerprint: string | null
  readonly provenanceFingerprint: string
  readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1
} & (
  | { readonly kind: "text" }
  | { readonly kind: "resolved-field"; readonly fieldKey: string }
)

export function createVNextTextBlockTransitionReplacementSourceItemInternalV1(
  input: VNextTextBlockTransitionReplacementSourceItemInputInternalV1,
): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  const prepared = preparedStates.get(input.sourceState)
  if (
    prepared == null
    || input.renderedText.length === 0
    || !Number.isSafeInteger(input.renderedText.length)
    || input.lineageId.trim().length === 0
    || input.inlineId.trim().length === 0
    || input.provenanceFingerprint.trim().length === 0
  ) return null
  const semanticFacts = {
    kind: input.kind,
    inlineId: input.inlineId,
    ...(input.kind === "resolved-field" ? { fieldKey: input.fieldKey } : {}),
  }
  const contentFacts = {
    renderedText: input.renderedText,
    renderedUtf16Length: input.renderedText.length,
  }
  const sourceFingerprint = input.sourceFingerprint ?? fingerprintWith(
    prepared.fingerprintFactory,
    {
      ...semanticFacts,
      authoredLocalStyleWithoutPaint:
        input.style.authoredLocalStyle == null
          ? null
          : {
              fontSize: input.style.authoredLocalStyle.fontSize ?? null,
              fontFamilyKey:
                input.style.authoredLocalStyle.fontFamilyKey ?? null,
              fontWeight: input.style.authoredLocalStyle.fontWeight ?? null,
              fontStyle: input.style.authoredLocalStyle.fontStyle ?? null,
            },
    },
  )
  const paintFingerprint = canonicalVNextTextBlockTextPaintFactsInternalV1({
    textColor: input.style.textColor,
    textDecoration: input.style.textDecoration,
    strikethrough: input.style.strikethrough,
    authoredTextColor: input.style.authoredLocalStyle?.textColor ?? null,
  }, prepared.fingerprintFactory).fingerprint
  const common = {
    lineageId: input.lineageId,
    inlineId: input.inlineId,
    renderedText: input.renderedText,
    renderedUtf16Length: input.renderedText.length,
    semanticFingerprint: fingerprintWith(
      prepared.fingerprintFactory,
      semanticFacts,
    ),
    contentFingerprint: fingerprintWith(
      prepared.fingerprintFactory,
      contentFacts,
    ),
    sourceFingerprint,
    provenanceFingerprint: input.provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint: fingerprintWith(
      prepared.fingerprintFactory,
      {
        fontFamilyKey: input.style.fontFamilyKey,
        fontFaceId: input.style.fontFaceId,
        fontSizeLayoutUnit: input.style.fontSizeLayoutUnit,
        fontWeight: input.style.fontWeight,
        fontStyle: input.style.fontStyle,
      },
    ),
    boundaryFingerprint: fingerprintWith(prepared.fingerprintFactory, {
      kind: "text-bearing",
      inlineId: input.inlineId,
    }),
  }
  const variant = input.kind === "resolved-field"
    ? { kind: input.kind, fieldKey: input.fieldKey, style: input.style }
    : { kind: input.kind, style: input.style }
  return deepFreeze({
    ...common,
    ...variant,
    fingerprint: fingerprintWith(prepared.fingerprintFactory, {
      contractVersion: 1,
      ...common,
      ...variant,
    }),
  })
}

export function resolveVNextTextBlockSupportedStyleOverlayInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly baseStyle: VNextTextBlockUnifiedLayoutSourceStyleV1
  readonly nextStyle: TextRunStyleV4Target
}):
  | { readonly status: "resolved"; readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1 }
  | { readonly status: "unavailable" | "ambiguous"; readonly style: null } {
  if (!preparedStates.has(input.sourceState)) {
    return { status: "unavailable", style: null }
  }
  if (input.nextStyle.fontFamilyKey != null) {
    return { status: "unavailable", style: null }
  }
  const fontSize = input.nextStyle.fontSize == null
    ? { status: "accepted" as const, layoutUnit: input.baseStyle.fontSizeLayoutUnit }
    : convertVNextPositiveUnitValueToLayoutUnitV1(
        input.nextStyle.fontSize,
        "change.nextStyle.fontSize",
      )
  if (fontSize.status !== "accepted") {
    return { status: "unavailable", style: null }
  }
  const requestedWeight = input.nextStyle.fontWeight == null
    ? input.baseStyle.fontWeight
    : input.nextStyle.fontWeight === "bold" ? 700 : 400
  const requestedStyle = input.nextStyle.fontStyle
    ?? input.baseStyle.fontStyle
  const faces = input.sourceState.producerRequirements.fontFaces.filter(
    (face) => face.fontFamilyKey === input.baseStyle.fontFamilyKey
      && face.weight === requestedWeight
      && face.style === requestedStyle,
  )
  if (faces.length === 0) return { status: "unavailable", style: null }
  if (faces.length !== 1) return { status: "ambiguous", style: null }
  const face = faces[0]!
  const textColor = input.nextStyle.textColor ?? input.baseStyle.textColor
  const textDecoration = input.nextStyle.textDecoration
    ?? input.baseStyle.textDecoration
  const strikethrough = input.nextStyle.strikethrough
    ?? input.baseStyle.strikethrough
  const authoredLocalStyle = input.baseStyle.authoredLocalStyle == null
      && Reflect.ownKeys(input.nextStyle).length === 0
    ? null
    : {
        ...(input.baseStyle.authoredLocalStyle ?? {}),
        ...structuredClone(input.nextStyle),
      }
  const fontWeight = face.weight === 700 ? "bold" as const : "normal" as const
  const style = deepFreeze({
    measurementStyleKey: input.baseStyle.measurementStyleKey,
    effectiveShapingStyleKey:
      createVNextTextBlockEffectiveShapingStyleIdentityV1({
        paragraphStyleKey:
          input.sourceState.producerRequirements.paragraphStyle.styleKey,
        fontFamilyKey: input.baseStyle.fontFamilyKey,
        fontFaceId: face.fontFaceId,
        fontSizeLayoutUnit: fontSize.layoutUnit,
        textColor,
        fontWeight,
        fontStyle: face.style,
        textDecoration,
        strikethrough,
      }),
    fontFamilyKey: input.baseStyle.fontFamilyKey,
    fontFaceId: face.fontFaceId,
    fontSizeLayoutUnit: fontSize.layoutUnit,
    textColor,
    fontWeight: face.weight,
    fontStyle: face.style,
    textDecoration,
    strikethrough,
    authoredLocalStyle,
  })
  return { status: "resolved", style }
}

export interface VNextTextBlockTransitionSourceCoverageFragmentInternalV1 {
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly itemAbsoluteStartRenderedUtf16: number
  readonly itemAbsoluteEndRenderedUtf16: number
  readonly selectedAbsoluteStartRenderedUtf16: number
  readonly selectedAbsoluteEndRenderedUtf16: number
}

export type VNextTextBlockTransitionSourceCoverageResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly fragments: readonly VNextTextBlockTransitionSourceCoverageFragmentInternalV1[]
      readonly visitedNodeCount: number
      readonly emittedItemCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly fragments: null
      readonly visitedNodeCount: number
      readonly emittedItemCount: number
      readonly completeTreeTraversalCount: 0
    }

type AcceptedTransitionSourceCoverageInternalV1 = Extract<
  VNextTextBlockTransitionSourceCoverageResultInternalV1,
  { readonly status: "accepted" }
>

const transitionSourceCoverageAuthorities = new WeakMap<
  AcceptedTransitionSourceCoverageInternalV1,
  {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly range: {
      readonly startRenderedUtf16: number
      readonly endRenderedUtf16: number
    }
    readonly visitedNodes: ReadonlySet<VNextTextBlockUnifiedLayoutSourceNodeV1>
  }
>()

export type VNextTextBlockTransitionSourceItemLookupResultInternalV1 =
  | {
      readonly status: "found"
      readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
      readonly absoluteStartRenderedUtf16: number
      readonly absoluteEndRenderedUtf16: number
      readonly visitedNodeCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "not-found" | "limit-exceeded"
      readonly item: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly visitedNodeCount: number
      readonly completeTreeTraversalCount: 0
    }

export interface VNextTextBlockSourceIndexLookupObservationForTestV1 {
  readonly inlineId: string
  readonly indexProbeCount: number
  readonly found: boolean
}

let sourceIndexLookupObserverForTest:
  | ((observation: VNextTextBlockSourceIndexLookupObservationForTestV1) => void)
  | null = null
let sourceReplacementItemReadObserverForTest: (() => void) | null = null

export interface VNextTextBlockPreBindingSourceVisitGuardInternalV1 {
  readonly __preBindingSourceVisitGuardOpaque: never
}

export interface VNextTextBlockPostBindingSourceVisitGuardInternalV1 {
  readonly __postBindingSourceVisitGuardOpaque: never
}

type PostBindingSourceUnitInternalV1 =
  | "source-path-copy-nodes"
  | "source-leaf-items"

type PostBindingSourceVisitEvaluationInternalV1 =
  | { readonly status: "accepted"; readonly attemptedWork: number }
  | {
      readonly status: "limit-exceeded" | "invariant-blocked"
      readonly attemptedWork: number
      readonly effectiveLimit: number
      readonly evaluatorAuthority?: object
    }

interface PostBindingSourceVisitGuardRecordInternalV1 {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly evaluate: (
    unit: PostBindingSourceUnitInternalV1,
    completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1,
  ) => PostBindingSourceVisitEvaluationInternalV1
}

const postBindingSourceVisitGuards = new WeakMap<
  VNextTextBlockPostBindingSourceVisitGuardInternalV1,
  PostBindingSourceVisitGuardRecordInternalV1
>()

let postBindingSourceOperationObserverForTest:
  | ((observation: {
      readonly unit: PostBindingSourceUnitInternalV1
      readonly completedWork: number
    }) => void)
  | null = null

export function registerVNextTextBlockPostBindingSourceVisitGuardInternalV1(
  input: PostBindingSourceVisitGuardRecordInternalV1,
): VNextTextBlockPostBindingSourceVisitGuardInternalV1 {
  const guard = Object.freeze(
    {},
  ) as VNextTextBlockPostBindingSourceVisitGuardInternalV1
  postBindingSourceVisitGuards.set(guard, Object.freeze({ ...input }))
  return guard
}

export function setVNextTextBlockPostBindingSourceOperationObserverForTestInternalV1(
  observer: typeof postBindingSourceOperationObserverForTest,
): void {
  postBindingSourceOperationObserverForTest = observer
}

export type VNextTextBlockPreBindingSourceVisitEvaluationInternalV1 =
  | {
      readonly status: "accepted"
      readonly completedWork: number
    }
  | {
      readonly status: "invariant-blocked"
      readonly completedWork: number
      readonly attemptedWork: number
      readonly effectiveLimit: number
    }

interface PreBindingSourceVisitGuardRecordInternalV1 {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly evaluate: (
    unit: "source-lookup-nodes" | "source-items",
    completedWork: number,
  ) => VNextTextBlockPreBindingSourceVisitEvaluationInternalV1
}

const preBindingSourceVisitGuards = new WeakMap<
  VNextTextBlockPreBindingSourceVisitGuardInternalV1,
  PreBindingSourceVisitGuardRecordInternalV1
>()

let preBindingSourceReadObserverForTest:
  | ((observation: {
      readonly unit: "source-lookup-nodes" | "source-items"
      readonly completedWork: number
    }) => void)
  | null = null

export function registerVNextTextBlockPreBindingSourceVisitGuardInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly evaluate: PreBindingSourceVisitGuardRecordInternalV1["evaluate"]
  },
): VNextTextBlockPreBindingSourceVisitGuardInternalV1 {
  const guard = Object.freeze(
    {},
  ) as VNextTextBlockPreBindingSourceVisitGuardInternalV1
  preBindingSourceVisitGuards.set(guard, Object.freeze({ ...input }))
  return guard
}

export function consumeVNextTextBlockPreBindingSourceVisitGuardInternalV1(
  guard: VNextTextBlockPreBindingSourceVisitGuardInternalV1,
): boolean {
  return preBindingSourceVisitGuards.delete(guard)
}

export function setVNextTextBlockPreBindingSourceReadObserverForTestInternalV1(
  observer:
    | ((observation: {
        readonly unit: "source-lookup-nodes" | "source-items"
        readonly completedWork: number
      }) => void)
    | null,
): void {
  preBindingSourceReadObserverForTest = observer
}

export function setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
  observer:
    | ((observation: VNextTextBlockSourceIndexLookupObservationForTestV1) => void)
    | null,
): void {
  sourceIndexLookupObserverForTest = observer
}

export function setVNextTextBlockSourceReplacementItemReadObserverForTestInternalV1(
  observer: (() => void) | null,
): void {
  sourceReplacementItemReadObserverForTest = observer
}

export function setVNextTextBlockPreparedSourceEnvelopeFactsForNextCompleteBuildForTestInternalV1(
  facts: VNextTextBlockPreparedSourceEnvelopeFactsInternalV1 | null,
): void {
  sourceEnvelopeFactsForNextCompleteBuildForTest = facts == null
    ? null
    : Object.freeze({ ...facts })
}

function fingerprintWith(
  factory: FingerprintFactory,
  value: unknown,
): string {
  return factory(stringifyVNextCanonicalJson(value))
}

function defaultFingerprint(canonicalFacts: string): string {
  return createVNextCompactFingerprint(canonicalFacts)
}

export function canonicalVNextTextBlockTextPaintFactsInternalV1(
  input: {
    readonly textColor: string
    readonly textDecoration: "none" | "underline"
    readonly strikethrough: boolean
    readonly authoredTextColor: string | null
  },
  factory: FingerprintFactory,
): {
  readonly facts: typeof input
  readonly fingerprint: string
} {
  const facts = {
    textColor: input.textColor,
    textDecoration: input.textDecoration,
    strikethrough: input.strikethrough,
    authoredTextColor: input.authoredTextColor,
  }
  return {
    facts,
    fingerprint: fingerprintWith(factory, facts),
  }
}

export function canonicalVNextTextBlockImagePaintFactsInternalV1(
  input: {
    readonly assetId: string
    readonly authoredFrame: Pick<ImageFrameV4Target, "fit" | "crop">
  },
  factory: FingerprintFactory,
): {
  readonly facts: {
    readonly assetId: string
    readonly fit: ImageFrameV4Target["fit"]
    readonly crop: ImageFrameV4Target["crop"] | null
  }
  readonly fingerprint: string
} {
  const facts = {
    assetId: input.assetId,
    fit: input.authoredFrame.fit,
    crop: input.authoredFrame.crop ?? null,
  }
  return {
    facts,
    fingerprint: fingerprintWith(factory, facts),
  }
}

export function canonicalVNextTextBlockHardBreakPaintFactsInternalV1(
  factory: FingerprintFactory,
): {
  readonly facts: { readonly paint: "none" }
  readonly fingerprint: string
} {
  const facts = { paint: "none" as const }
  return {
    facts,
    fingerprint: fingerprintWith(factory, facts),
  }
}

function indexSourceItems(
  root: VNextTextBlockUnifiedLayoutSourceNodeV1,
): SourceItemIndex | null {
  const output = new Map<string, {
    readonly kind: VNextTextBlockUnifiedLayoutSourceItemV1["kind"]
    readonly itemOrdinal: number
    readonly absoluteStartRenderedUtf16: number
  }[]>()
  let itemOrdinal = 0
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceNodeV1,
    absoluteStartRenderedUtf16: number,
  ): boolean => {
    if (node.nodeKind === "leaf") {
      let itemStartRenderedUtf16 = absoluteStartRenderedUtf16
      for (let itemIndex = 0; itemIndex < node.items.length; itemIndex += 1) {
        const item = node.items[itemIndex]!
        const previous = output.get(item.inlineId) ?? []
        if (
          previous.length > 0
          && (
            item.kind !== "text"
            || previous.some((entry) => entry.kind !== "text")
          )
        ) return false
        output.set(item.inlineId, [...previous, {
          kind: item.kind,
          itemOrdinal,
          absoluteStartRenderedUtf16: itemStartRenderedUtf16,
        }])
        itemOrdinal += 1
        itemStartRenderedUtf16 += item.renderedUtf16Length
      }
      return true
    }
    let childStartRenderedUtf16 = absoluteStartRenderedUtf16
    for (
      let childIndex = 0;
      childIndex < node.children.length;
      childIndex += 1
    ) {
      const child = node.children[childIndex]!
      if (!visit(child, childStartRenderedUtf16)) return false
      childStartRenderedUtf16 += child.summary.renderedUtf16Length
    }
    return true
  }
  return visit(root, 0)
    ? { indexKind: "complete", entries: output }
    : null
}

function indexedSourceItem(
  index: SourceItemIndex,
  root: VNextTextBlockUnifiedLayoutSourceNodeV1,
  inlineId: string,
): IndexedSourceItemRecord | undefined {
  // Compatibility callers do not own a visit evaluator. Never let them walk
  // a persistent transition chain; exact guarded callers use the metered seam.
  if (index.indexKind !== "complete") return undefined
  const authority = sourceItemIndexEntriesInternalV1(index, inlineId)
  if (authority.entries.length !== 1) {
    sourceIndexLookupObserverForTest?.({
      inlineId,
      indexProbeCount: 1,
      found: false,
    })
    return undefined
  }
  const exactAuthority = authority.entries[0]!
  const ancestors: {
    readonly branch: VNextTextBlockUnifiedLayoutSourceBranchV1
    readonly childIndex: number
  }[] = []
  let relativeItemOrdinal = exactAuthority.itemOrdinal
  let node = root
  while (node.nodeKind === "branch") {
    let selected:
      | {
          readonly child: VNextTextBlockUnifiedLayoutSourceNodeV1
          readonly childIndex: number
        }
      | null = null
    for (
      let childIndex = 0;
      childIndex < node.children.length;
      childIndex += 1
    ) {
      const child = node.children[childIndex]!
      if (relativeItemOrdinal < child.summary.itemCount) {
        selected = { child, childIndex }
        break
      }
      relativeItemOrdinal -= child.summary.itemCount
    }
    if (selected == null) break
    ancestors.push({
      branch: node,
      childIndex: selected.childIndex,
    })
    node = selected.child
  }
  const item = node.nodeKind === "leaf"
    ? node.items[relativeItemOrdinal]
    : undefined
  const found = item != null && item.inlineId === inlineId
  sourceIndexLookupObserverForTest?.({
    inlineId,
    indexProbeCount: 1,
    found,
  })
  return !found || node.nodeKind !== "leaf"
    ? undefined
    : {
        item,
        itemIndex: relativeItemOrdinal,
        absoluteStartRenderedUtf16:
          exactAuthority.absoluteStartRenderedUtf16,
        leaf: node,
        ancestors,
        visitedSourceLookupNodeCount: ancestors.length + 1,
      }
}

type GuardedIndexedSourceItemResultInternalV1 =
  | {
      readonly status: "completed"
      readonly indexed: IndexedSourceItemRecord | undefined
      readonly completedSourceLookupNodeCount: number
      readonly completedSourceItemCount: number
    }
  | ({
      readonly status: "invariant-blocked"
      readonly unit: "source-lookup-nodes" | "source-items"
    } & Extract<
      VNextTextBlockPreBindingSourceVisitEvaluationInternalV1,
      { readonly status: "invariant-blocked" }
    > & {
      readonly completedSourceLookupNodeCount: number
      readonly completedSourceItemCount: number
    })

function evaluatePreBindingSourceReadInternalV1(input: {
  readonly guard: VNextTextBlockPreBindingSourceVisitGuardInternalV1
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly unit: "source-lookup-nodes" | "source-items"
  readonly completedWork: number
}): VNextTextBlockPreBindingSourceVisitEvaluationInternalV1 {
  const record = preBindingSourceVisitGuards.get(input.guard)
  if (record == null || record.sourceState !== input.sourceState) {
    return {
      status: "invariant-blocked",
      completedWork: input.completedWork,
      attemptedWork: input.completedWork + 1,
      effectiveLimit: input.completedWork,
    }
  }
  return record.evaluate(input.unit, input.completedWork)
}

function indexedSourceItemWithPreBindingGuardInternalV1(
  index: SourceItemIndex,
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
  inlineId: string,
  guard: VNextTextBlockPreBindingSourceVisitGuardInternalV1,
): GuardedIndexedSourceItemResultInternalV1 {
  let completedSourceLookupNodeCount = 0
  const indexFailure: {
    value: Extract<
      VNextTextBlockPreBindingSourceVisitEvaluationInternalV1,
      { readonly status: "invariant-blocked" }
    > | null
  } = { value: null }
  const authority = sourceItemIndexEntriesInternalV1(
    index,
    inlineId,
    () => {
      const evaluation = evaluatePreBindingSourceReadInternalV1({
        guard,
        sourceState,
        unit: "source-lookup-nodes",
        completedWork: completedSourceLookupNodeCount,
      })
      if (evaluation.status !== "accepted") {
        indexFailure.value = evaluation
        return false
      }
      completedSourceLookupNodeCount = evaluation.completedWork
      preBindingSourceReadObserverForTest?.({
        unit: "source-lookup-nodes",
        completedWork: completedSourceLookupNodeCount,
      })
      return true
    },
    // Frozen V3 calibrated tree nodes, not its O(1) complete-index probe.
    // Persistent range-delta layers remain metered; V2 callers meter both.
    false,
  )
  if (indexFailure.value != null) {
    return {
      ...indexFailure.value,
      unit: "source-lookup-nodes",
      completedSourceLookupNodeCount,
      completedSourceItemCount: 0,
    }
  }
  if (authority.entries.length !== 1) {
    sourceIndexLookupObserverForTest?.({
      inlineId,
      indexProbeCount: 1,
      found: false,
    })
    return {
      status: "completed",
      indexed: undefined,
      completedSourceLookupNodeCount,
      completedSourceItemCount: 0,
    }
  }
  const exactAuthority = authority.entries[0]!
  const ancestors: IndexedSourceItemRecord["ancestors"][number][] = []
  let relativeItemOrdinal = exactAuthority.itemOrdinal
  let node = sourceState.root
  while (true) {
    const lookupEvaluation = evaluatePreBindingSourceReadInternalV1({
      guard,
      sourceState,
      unit: "source-lookup-nodes",
      completedWork: completedSourceLookupNodeCount,
    })
    if (lookupEvaluation.status !== "accepted") {
      return {
        ...lookupEvaluation,
        unit: "source-lookup-nodes",
        completedSourceLookupNodeCount,
        completedSourceItemCount: 0,
      }
    }
    completedSourceLookupNodeCount = lookupEvaluation.completedWork
    preBindingSourceReadObserverForTest?.({
      unit: "source-lookup-nodes",
      completedWork: completedSourceLookupNodeCount,
    })
    if (node.nodeKind !== "branch") break
    let selected:
      | {
          readonly child: VNextTextBlockUnifiedLayoutSourceNodeV1
          readonly childIndex: number
        }
      | null = null
    for (
      let childIndex = 0;
      childIndex < node.children.length;
      childIndex += 1
    ) {
      const child = node.children[childIndex]!
      if (relativeItemOrdinal < child.summary.itemCount) {
        selected = { child, childIndex }
        break
      }
      relativeItemOrdinal -= child.summary.itemCount
    }
    if (selected == null) break
    ancestors.push({
      branch: node,
      childIndex: selected.childIndex,
    })
    node = selected.child
  }
  if (node.nodeKind !== "leaf") {
    sourceIndexLookupObserverForTest?.({
      inlineId,
      indexProbeCount: 1,
      found: false,
    })
    return {
      status: "completed",
      indexed: undefined,
      completedSourceLookupNodeCount,
      completedSourceItemCount: 0,
    }
  }
  const itemEvaluation = evaluatePreBindingSourceReadInternalV1({
    guard,
    sourceState,
    unit: "source-items",
    completedWork: 0,
  })
  if (itemEvaluation.status !== "accepted") {
    return {
      ...itemEvaluation,
      unit: "source-items",
      completedSourceLookupNodeCount,
      completedSourceItemCount: 0,
    }
  }
  preBindingSourceReadObserverForTest?.({
    unit: "source-items",
    completedWork: itemEvaluation.completedWork,
  })
  const item = node.items[relativeItemOrdinal]
  const found = item != null && item.inlineId === inlineId
  sourceIndexLookupObserverForTest?.({
    inlineId,
    indexProbeCount: 1,
    found,
  })
  return {
    status: "completed",
    indexed: !found
      ? undefined
      : {
          item,
          itemIndex: relativeItemOrdinal,
          absoluteStartRenderedUtf16:
            exactAuthority.absoluteStartRenderedUtf16,
          leaf: node,
          ancestors,
          visitedSourceLookupNodeCount: completedSourceLookupNodeCount,
        },
    completedSourceLookupNodeCount,
    completedSourceItemCount: itemEvaluation.completedWork,
  }
}

function forcedCollisionFingerprint(_canonicalFacts: string): string {
  return FORCED_COLLISION_FINGERPRINT
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function frozenSourceStateShell(value: unknown): boolean {
  if (value == null || typeof value !== "object") return false
  try {
    const state = value as VNextTextBlockUnifiedLayoutSourceStateV1
    return Object.isFrozen(state)
      && Object.isFrozen(state.root)
      && Object.isFrozen(state.summary)
      && Object.isFrozen(state.work)
      && Object.isFrozen(state.contracts)
  } catch {
    return false
  }
}

function exactInput(value: unknown): {
  readonly initialFlow: unknown
  readonly evidence: unknown
} | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const keys = Reflect.ownKeys(value)
    if (
      keys.length !== 2
      || !keys.includes("initialFlow")
      || !keys.includes("evidence")
    ) return null
    const initialFlow = Object.getOwnPropertyDescriptor(value, "initialFlow")
    const evidence = Object.getOwnPropertyDescriptor(value, "evidence")
    if (
      initialFlow == null
      || evidence == null
      || !Object.hasOwn(initialFlow, "value")
      || !Object.hasOwn(evidence, "value")
      || initialFlow.enumerable !== true
      || evidence.enumerable !== true
    ) return null
    return {
      initialFlow: initialFlow.value,
      evidence: evidence.value,
    }
  } catch {
    return null
  }
}

function blocked(
  code: VNextTextBlockUnifiedLayoutSourceStateIssueCodeV1,
  message: string,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return Object.freeze({
    status: "blocked",
    sourceState: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([{ code, message }]),
  })
}

function safeAdd(left: number, right: number): number {
  const value = left + right
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("source-state summary exceeded safe integer arithmetic")
  }
  return value
}

function canonicalGroups<T>(
  values: readonly T[],
  maximumValues: number,
): readonly (readonly T[])[] {
  if (
    !Number.isSafeInteger(maximumValues)
    || maximumValues !== 8
  ) {
    throw new RangeError("source-state packing requires the locked eight-way policy")
  }
  const groups: T[][] = []
  let cursor = 0
  while (cursor < values.length) {
    const remaining = values.length - cursor
    if (remaining <= maximumValues) {
      groups.push(values.slice(cursor))
      break
    }
    if (remaining === maximumValues + 1) {
      groups.push(values.slice(cursor, cursor + 4))
      groups.push(values.slice(cursor + 4))
      break
    }
    groups.push(values.slice(cursor, cursor + maximumValues))
    cursor += maximumValues
  }
  return groups
}

function styleFromAtom(
  atom: Extract<VNextTextBlockInitialFlowAtomV1, {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>,
): VNextTextBlockUnifiedLayoutSourceStyleV1 {
  const style = atom.resolvedGeometryStyle
  return {
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    textColor: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
    authoredLocalStyle: atom.kind === "text" && atom.localStyle != null
      ? structuredClone(atom.localStyle)
      : null,
  }
}

function textSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "text" | "resolved-field" | "generated-page-number"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 {
  const { initialFlow, atom } = input
  const style = styleFromAtom(atom)
  const semanticFacts = {
    kind: atom.kind,
    inlineId: atom.inlineId,
    ...(atom.kind === "resolved-field" ? { fieldKey: atom.fieldKey } : {}),
    ...(atom.kind === "generated-page-number"
      ? { generatedOwnerFingerprint: atom.generatedOwnerFingerprint }
      : {}),
  }
  const contentFacts = {
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
  }
  const sourceFacts = {
    ...semanticFacts,
    authoredLocalStyleWithoutPaint: style.authoredLocalStyle == null
      ? null
      : {
          fontSize: style.authoredLocalStyle.fontSize ?? null,
          fontFamilyKey: style.authoredLocalStyle.fontFamilyKey ?? null,
          fontWeight: style.authoredLocalStyle.fontWeight ?? null,
          fontStyle: style.authoredLocalStyle.fontStyle ?? null,
        },
  }
  const provenanceFacts = {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
    sourceKind: atom.kind,
  }
  const paint = canonicalVNextTextBlockTextPaintFactsInternalV1({
    textColor: style.textColor,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
    authoredTextColor: style.authoredLocalStyle?.textColor ?? null,
  }, factory)
  const layoutDependencyFacts = {
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
  }
  const common = {
    lineageId: `${atom.kind}:${atom.inlineId}`,
    inlineId: atom.inlineId,
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
    semanticFingerprint: fingerprintWith(factory, semanticFacts),
    contentFingerprint: fingerprintWith(factory, contentFacts),
    sourceFingerprint: fingerprintWith(factory, sourceFacts),
    provenanceFingerprint: fingerprintWith(factory, provenanceFacts),
    paintFingerprint: paint.fingerprint,
    layoutDependencyFingerprint: fingerprintWith(
      factory,
      layoutDependencyFacts,
    ),
    boundaryFingerprint: fingerprintWith(factory, {
      kind: "text-bearing",
      inlineId: atom.inlineId,
    }),
  }
  const variant = atom.kind === "resolved-field"
    ? { kind: atom.kind, fieldKey: atom.fieldKey, style }
    : atom.kind === "generated-page-number"
      ? {
          kind: atom.kind,
          generatedOwnerFingerprint: atom.generatedOwnerFingerprint,
          style,
        }
      : { kind: atom.kind, style }
  return {
    ...common,
    ...variant,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...common,
      ...variant,
    }),
  }
}

function hardBreakSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "hard-break"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  const { atom, initialFlow } = input
  if (
    atom.renderedText !== "\n"
    && atom.renderedText !== "\r"
    && atom.renderedText !== "\r\n"
  ) return null
  const semanticFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
  })
  const contentFingerprint = fingerprintWith(factory, {
    renderedText: atom.renderedText,
  })
  const sourceFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
  })
  const provenanceFingerprint = fingerprintWith(factory, {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
  })
  const paintFingerprint =
    canonicalVNextTextBlockHardBreakPaintFactsInternalV1(factory).fingerprint
  const layoutDependencyFingerprint = fingerprintWith(factory, {
    mandatoryBreak: true,
  })
  const boundaryFingerprint = fingerprintWith(factory, {
    kind: "hard-break",
    renderedUtf16Length: atom.renderedText.length,
  })
  const facts = {
    lineageId: `hard-break:${atom.inlineId}`,
    inlineId: atom.inlineId,
    kind: "hard-break" as const,
    renderedText: atom.renderedText,
    renderedUtf16Length: atom.renderedText.length,
    semanticFingerprint,
    contentFingerprint,
    sourceFingerprint,
    provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint,
    boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function imageSourceItem(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly atom: Extract<VNextTextBlockInitialFlowAtomV1, {
      kind: "inline-image"
    }>
  },
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  const { atom, initialFlow } = input
  if (atom.assetId == null || atom.renderedText !== "\uFFFC") return null
  const width = convertVNextPositiveUnitValueToLayoutUnitV1(
    atom.frame.width,
    "inlineImage.frame.width",
  )
  const height = convertVNextPositiveUnitValueToLayoutUnitV1(
    atom.frame.height,
    "inlineImage.frame.height",
  )
  if (width.status !== "accepted" || height.status !== "accepted") return null
  const semanticFingerprint = fingerprintWith(factory, {
    kind: atom.kind,
    inlineId: atom.inlineId,
    assetId: atom.assetId,
  })
  const contentFingerprint = fingerprintWith(factory, {
    renderedText: "\uFFFC",
  })
  const sourceFingerprint = fingerprintWith(factory, {
    inlineId: atom.inlineId,
    assetId: atom.assetId,
  })
  const provenanceFingerprint = fingerprintWith(factory, {
    documentId: initialFlow.documentId,
    sectionId: initialFlow.sectionId,
    textBlockId: initialFlow.textBlockId,
    inlineId: atom.inlineId,
  })
  const paintFingerprint = canonicalVNextTextBlockImagePaintFactsInternalV1({
    assetId: atom.assetId,
    authoredFrame: atom.frame,
  }, factory).fingerprint
  const layoutDependencyFingerprint = fingerprintWith(factory, {
    widthLayoutUnit: width.layoutUnit,
    heightLayoutUnit: height.layoutUnit,
    verticalAlign: atom.verticalAlign,
  })
  const boundaryFingerprint = fingerprintWith(factory, {
    kind: "inline-image-boundary",
    renderedUtf16Length: 1,
  })
  const facts = {
    lineageId: `inline-image:${atom.inlineId}`,
    inlineId: atom.inlineId,
    kind: "inline-image" as const,
    renderedText: "\uFFFC" as const,
    renderedUtf16Length: 1,
    assetId: atom.assetId,
    authoredFrame: structuredClone(atom.frame),
    verticalAlign: atom.verticalAlign,
    semanticFingerprint,
    contentFingerprint,
    sourceFingerprint,
    provenanceFingerprint,
    paintFingerprint,
    layoutDependencyFingerprint,
    boundaryFingerprint,
  }
  return {
    ...facts,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      ...facts,
    }),
  }
}

function sourceItems(
  initialFlow: VNextTextBlockInitialFlowV1,
  factory: FingerprintFactory,
): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] | null {
  const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  for (const atom of initialFlow.atoms) {
    const item = atom.kind === "hard-break"
      ? hardBreakSourceItem({ initialFlow, atom }, factory)
      : atom.kind === "inline-image"
        ? imageSourceItem({ initialFlow, atom }, factory)
        : textSourceItem({ initialFlow, atom }, factory)
    if (item == null) return null
    items.push(item)
  }
  return items
}

type SourceSummaryItemInternalV1 = Pick<
  VNextTextBlockUnifiedLayoutSourceItemV1,
  | "kind"
  | "renderedUtf16Length"
  | "semanticFingerprint"
  | "contentFingerprint"
  | "sourceFingerprint"
  | "provenanceFingerprint"
  | "paintFingerprint"
  | "layoutDependencyFingerprint"
  | "boundaryFingerprint"
>

function summaryFromItems(
  items: readonly SourceSummaryItemInternalV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceSummaryV1 {
  let renderedUtf16Length = 0
  let textBearingItemCount = 0
  let hardBreakItemCount = 0
  let inlineImageItemCount = 0
  for (const item of items) {
    renderedUtf16Length = safeAdd(
      renderedUtf16Length,
      item.renderedUtf16Length,
    )
    if (item.kind === "hard-break") hardBreakItemCount += 1
    else if (item.kind === "inline-image") inlineImageItemCount += 1
    else textBearingItemCount += 1
  }
  return {
    renderedUtf16Length,
    itemCount: items.length,
    leafCount: 1,
    nodeCount: 1,
    textBearingItemCount,
    hardBreakItemCount,
    inlineImageItemCount,
    semanticFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.semanticFingerprint),
    }),
    contentFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.contentFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.provenanceFingerprint),
    }),
    paintFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.paintFingerprint),
    }),
    layoutDependencyFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.layoutDependencyFingerprint),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      items: items.map((item) => item.boundaryFingerprint),
    }),
  }
}

function summaryFromChildren(
  children: readonly Pick<
    VNextTextBlockUnifiedLayoutSourceNodeV1,
    "summary"
  >[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceSummaryV1 {
  const counts = {
    renderedUtf16Length: 0,
    itemCount: 0,
    leafCount: 0,
    nodeCount: 1,
    textBearingItemCount: 0,
    hardBreakItemCount: 0,
    inlineImageItemCount: 0,
  }
  for (const child of children) {
    counts.renderedUtf16Length = safeAdd(
      counts.renderedUtf16Length,
      child.summary.renderedUtf16Length,
    )
    counts.itemCount = safeAdd(counts.itemCount, child.summary.itemCount)
    counts.leafCount = safeAdd(counts.leafCount, child.summary.leafCount)
    counts.nodeCount = safeAdd(counts.nodeCount, child.summary.nodeCount)
    counts.textBearingItemCount = safeAdd(
      counts.textBearingItemCount,
      child.summary.textBearingItemCount,
    )
    counts.hardBreakItemCount = safeAdd(
      counts.hardBreakItemCount,
      child.summary.hardBreakItemCount,
    )
    counts.inlineImageItemCount = safeAdd(
      counts.inlineImageItemCount,
      child.summary.inlineImageItemCount,
    )
  }
  return {
    ...counts,
    semanticFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.semanticFingerprint),
    }),
    contentFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.contentFingerprint),
    }),
    sourceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.sourceFingerprint),
    }),
    provenanceFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.provenanceFingerprint),
    }),
    paintFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.paintFingerprint),
    }),
    layoutDependencyFingerprint: fingerprintWith(factory, {
      children: children.map(
        (child) => child.summary.layoutDependencyFingerprint,
      ),
    }),
    boundaryFingerprint: fingerprintWith(factory, {
      children: children.map((child) => child.summary.boundaryFingerprint),
    }),
  }
}

function leaf(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceLeafV1 {
  if (items.length < 1 || items.length > 8) {
    throw new RangeError("source-state leaf requires one to eight items")
  }
  const summary = summaryFromItems(items, factory)
  return {
    nodeKind: "leaf",
    height: 0,
    items: [...items],
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      nodeKind: "leaf",
      itemFingerprints: items.map((item) => item.fingerprint),
      summary,
    }),
  }
}

function branch(
  children: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceBranchV1 {
  if (
    children.length < 2
    || children.length > 8
    || children.some((child) => child.height !== children[0]?.height)
  ) {
    throw new RangeError("source-state branch requires two to eight equal-height children")
  }
  const summary = summaryFromChildren(children, factory)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children: [...children],
    summary,
    fingerprint: fingerprintWith(factory, {
      contractVersion: 1,
      nodeKind: "branch",
      childFingerprints: children.map((child) => child.fingerprint),
      summary,
    }),
  }
}

function buildRoot(
  items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceNodeV1 {
  let level: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[] =
    canonicalGroups(items, 8).map((group) => leaf(group, factory))
  if (level.length === 0) {
    throw new RangeError("source-state requires at least one source item")
  }
  while (level.length > 1) {
    level = canonicalGroups(level, 8).map((group) => branch(group, factory))
  }
  return level[0]!
}

function stateCanonicalFacts(
  state: VNextTextBlockUnifiedLayoutSourceStateV1,
): unknown {
  return {
    source: state.source,
    contractVersion: state.contractVersion,
    documentId: state.documentId,
    sectionId: state.sectionId,
    textBlockId: state.textBlockId,
    instanceRevision: state.instanceRevision,
    initialFlowFingerprint: state.initialFlowFingerprint,
    flowEvidenceFingerprint: state.flowEvidenceFingerprint,
    authoredBoxPlanFingerprint: state.authoredBoxPlan.fingerprint,
    producerRequirements: state.producerRequirements,
    policyFingerprint: state.policy.fingerprint,
    rootFingerprint: state.root.fingerprint,
    summary: state.summary,
    work: state.work,
    contracts: state.contracts,
    mayPublishLayout: state.mayPublishLayout,
    productionBinding: state.productionBinding,
  }
}

function sourceFlowIssue(
  code: VNextTextBlockUnifiedLayoutIssueV1["code"],
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return Object.freeze({
    code,
    severity: "error",
    stage: "source-flow",
    path: "sourceState",
    message,
  })
}

function selectedRangeFingerprints(
  fragments: readonly VNextTextBlockTransitionSourceCoverageFragmentInternalV1[],
  range: VNextTextBlockSourceRangeV1,
  factory: FingerprintFactory,
): {
  readonly content: string
  readonly source: string
  readonly provenance: string
} {
  const selected = fragments.flatMap((fragment) => {
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
  return {
    content: fingerprintWith(
      factory,
      selected.map(({ renderedText }) => renderedText),
    ),
    source: fingerprintWith(
      factory,
      selected.map(({ sourceFingerprint }) => sourceFingerprint),
    ),
    provenance: fingerprintWith(
      factory,
      selected.map(({ provenanceFingerprint }) => provenanceFingerprint),
    ),
  }
}

function retainedTextFragmentInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly item: Extract<
    VNextTextBlockUnifiedLayoutSourceItemV1,
    { readonly kind: "text" }
  >
  readonly renderedText: string
}): VNextTextBlockUnifiedLayoutSourceItemV1 | null {
  return createVNextTextBlockTransitionReplacementSourceItemInternalV1({
    sourceState: input.sourceState,
    kind: "text",
    renderedText: input.renderedText,
    lineageId: input.item.lineageId,
    inlineId: input.item.inlineId,
    sourceFingerprint: input.item.sourceFingerprint,
    provenanceFingerprint: input.item.provenanceFingerprint,
    style: input.item.style,
  })
}

/**
 * Task-4 Source-owner seam. It performs one range replacement from exact
 * prepared Source authority and never registers the resulting Root graph.
 */
export function prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1(
  input: {
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly replacement:
      VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
    readonly beforeVisit: (unit:
      | "source-lookup-nodes"
      | "source-path-copy-nodes"
      | "source-leaf-items") => boolean
  },
): VNextTextBlockSourceRangePathCopyResultInternalV1 {
  const prepared = preparedStates.get(input.previousSourceState)
  const replacementAuthority = sourceRangeReplacementAuthorities.get(
    input.replacement,
  )
  const range = input.replacement.previousRange
  const blockedResult = (message: string):
    VNextTextBlockSourceRangePathCopyResultInternalV1 => Object.freeze({
      status: "blocked" as const,
      sourceState: null,
      issues: Object.freeze([
        sourceFlowIssue("incremental-proof-unavailable", message),
      ]),
    })
  const limitResult = ():
    VNextTextBlockSourceRangePathCopyResultInternalV1 => Object.freeze({
      status: "limit-exceeded" as const,
      sourceState: null,
      issues: Object.freeze([]),
    })
  if (
    prepared == null
    || replacementAuthority?.previousSourceState
      !== input.previousSourceState
    || !Number.isSafeInteger(range.startRenderedUtf16)
    || !Number.isSafeInteger(range.endRenderedUtf16)
    || range.startRenderedUtf16 < 0
    || range.endRenderedUtf16 < range.startRenderedUtf16
    || range.endRenderedUtf16
      > input.previousSourceState.summary.renderedUtf16Length
  ) return blockedResult("range path copy requires exact safe Source authority")

  let visitedLookupNodeCount = 0
  let copiedPathNodeCount = 0
  let visitedChangedLeafItemCount = 0
  const reserveSourceLeafItemVisit = (): boolean => {
    if (!input.beforeVisit("source-leaf-items")) return false
    visitedChangedLeafItemCount += 1
    return true
  }
  const lookupVisitedNodes = new WeakSet<
    VNextTextBlockUnifiedLayoutSourceNodeV1
  >()
  const ancestors: {
    readonly branch: VNextTextBlockUnifiedLayoutSourceBranchV1
    readonly childIndex: number
    endChildIndex: number
  }[] = []
  let node = input.previousSourceState.root
  let nodeStartRenderedUtf16 = 0
  let nodeStartItemOrdinal = 0
  while (true) {
    if (!input.beforeVisit("source-lookup-nodes")) return limitResult()
    visitedLookupNodeCount += 1
    lookupVisitedNodes.add(node)
    if (node.nodeKind === "leaf") break
    let selectedIndex = -1
    let childStart = nodeStartRenderedUtf16
    let childItemOrdinal = nodeStartItemOrdinal
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index]!
      const childEnd = childStart + child.summary.renderedUtf16Length
      const containsStart = range.startRenderedUtf16 < childEnd
        || (
          range.startRenderedUtf16 === childEnd
          && range.startRenderedUtf16
            === input.previousSourceState.summary.renderedUtf16Length
        )
      if (containsStart) {
        selectedIndex = index
        break
      }
      childStart = childEnd
      childItemOrdinal += child.summary.itemCount
    }
    if (selectedIndex < 0) return blockedResult("source range has no exact boundary leaf")
    const child = node.children[selectedIndex]!
    ancestors.push({
      branch: node,
      childIndex: selectedIndex,
      endChildIndex: selectedIndex,
    })
    node = child
    nodeStartRenderedUtf16 = childStart
    nodeStartItemOrdinal = childItemOrdinal
  }
  const affectedLeaves: VNextTextBlockUnifiedLayoutSourceLeafV1[] = [node]
  const affectedItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  const affectedNodes = new WeakSet<VNextTextBlockUnifiedLayoutSourceNodeV1>()
  const rebalancedDonorNodes = new WeakSet<
    VNextTextBlockUnifiedLayoutSourceNodeV1
  >()
  let affectedNodeCount = ancestors.length + 1
  let leafEndRenderedUtf16 = nodeStartRenderedUtf16
    + node.summary.renderedUtf16Length
  if (range.endRenderedUtf16 > leafEndRenderedUtf16) {
    affectedLeaves.length = 0
    affectedNodeCount = 0
    const collect = (
      current: VNextTextBlockUnifiedLayoutSourceNodeV1,
      currentStartRenderedUtf16: number,
    ): boolean => {
      const currentEndRenderedUtf16 = currentStartRenderedUtf16
        + current.summary.renderedUtf16Length
      if (
        currentEndRenderedUtf16 <= nodeStartRenderedUtf16
        || currentStartRenderedUtf16 >= range.endRenderedUtf16
      ) return true
      if (!lookupVisitedNodes.has(current)) {
        if (!input.beforeVisit("source-lookup-nodes")) return false
        visitedLookupNodeCount += 1
        lookupVisitedNodes.add(current)
      }
      affectedNodes.add(current)
      affectedNodeCount += 1
      if (current.nodeKind === "leaf") {
        affectedLeaves.push(current)
        leafEndRenderedUtf16 = currentEndRenderedUtf16
        return true
      }
      let childStart = currentStartRenderedUtf16
      for (const child of current.children) {
        if (!collect(child, childStart)) return false
        childStart += child.summary.renderedUtf16Length
      }
      return true
    }
    if (!collect(input.previousSourceState.root, 0)) return limitResult()
    if (
      affectedLeaves.length < 2
      || range.endRenderedUtf16 > leafEndRenderedUtf16
    ) return blockedResult("multi-leaf source range lacks exact bounded coverage")
  }

  // A node visit authorizes topology only. Authorize every bounded affected
  // item slot separately before reading the item object from the leaf.
  for (const affectedLeaf of affectedLeaves) {
    for (
      let itemIndex = 0;
      itemIndex < affectedLeaf.summary.itemCount;
      itemIndex += 1
    ) {
      if (!reserveSourceLeafItemVisit()) return limitResult()
      const item = affectedLeaf.items[itemIndex]
      if (item == null) {
        return blockedResult("affected Source leaf summary is inconsistent")
      }
      affectedItems.push(item)
    }
  }

  const fragments: VNextTextBlockTransitionSourceCoverageFragmentInternalV1[] = []
  let itemStart = nodeStartRenderedUtf16
  for (const item of affectedItems) {
    const itemEnd = itemStart + item.renderedUtf16Length
    const selectedStart = Math.max(itemStart, range.startRenderedUtf16)
    const selectedEnd = Math.min(itemEnd, range.endRenderedUtf16)
    if (selectedEnd > selectedStart) {
      fragments.push({
        item,
        itemAbsoluteStartRenderedUtf16: itemStart,
        itemAbsoluteEndRenderedUtf16: itemEnd,
        selectedAbsoluteStartRenderedUtf16: selectedStart,
        selectedAbsoluteEndRenderedUtf16: selectedEnd,
      })
    }
    itemStart = itemEnd
  }
  const previousFingerprints = selectedRangeFingerprints(
    fragments,
    range,
    prepared.fingerprintFactory,
  )
  if (
    previousFingerprints.content
      !== input.replacement.expectedPreviousContentFingerprint
    || previousFingerprints.source
      !== input.replacement.expectedPreviousSourceFingerprint
    || previousFingerprints.provenance
      !== input.replacement.expectedPreviousProvenanceFingerprint
  ) return blockedResult("source range fingerprints do not match exact preflight facts")

  const nextLeafItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  const removedItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  const createdItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  // Each accepted affected-item read also owns one eventual output-slot
  // composition. Only net-new output slots need an additional visit. This
  // keeps the work unit factual without charging the same bounded slot twice.
  let retainedAuthorizedItemSlotCount = affectedItems.length
  const reserveFinalItemSlot = (): boolean => {
    if (retainedAuthorizedItemSlotCount > 0) {
      retainedAuthorizedItemSlotCount -= 1
      return true
    }
    return reserveSourceLeafItemVisit()
  }
  let invalidReplacementItem = false
  const emitItem = (
    item: VNextTextBlockUnifiedLayoutSourceItemV1,
    created: boolean,
  ): boolean => {
    if (!reserveFinalItemSlot()) return false
    if (!Object.isFrozen(item)) {
      invalidReplacementItem = true
      return false
    }
    nextLeafItems.push(item)
    if (created) createdItems.push(item)
    return true
  }
  const emitItems = (
    items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
    created: boolean,
  ): boolean => {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (!reserveFinalItemSlot()) return false
      sourceReplacementItemReadObserverForTest?.()
      const item = items[itemIndex]
      if (item == null || !Object.isFrozen(item)) {
        invalidReplacementItem = true
        return false
      }
      nextLeafItems.push(item)
      if (created) createdItems.push(item)
    }
    return true
  }
  const emitFailure = (): VNextTextBlockSourceRangePathCopyResultInternalV1 =>
    invalidReplacementItem
      ? blockedResult("replacement items require exact frozen authority")
      : limitResult()
  let emittedReplacement = false
  itemStart = nodeStartRenderedUtf16
  for (const item of affectedItems) {
    const itemEnd = itemStart + item.renderedUtf16Length
    if (itemEnd <= range.startRenderedUtf16) {
      if (!emitItem(item, false)) return emitFailure()
      itemStart = itemEnd
      continue
    }
    if (itemStart >= range.endRenderedUtf16) {
      if (!emittedReplacement) {
        if (!emitItems(input.replacement.nextItems, true)) return emitFailure()
        emittedReplacement = true
      }
      if (!emitItem(item, false)) return emitFailure()
      itemStart = itemEnd
      continue
    }
    removedItems.push(item)
    if (range.startRenderedUtf16 > itemStart) {
      if (item.kind !== "text") {
        return blockedResult("atomic Source items cannot be split")
      }
      if (!reserveFinalItemSlot()) return emitFailure()
      const prefix = retainedTextFragmentInternalV1({
        sourceState: input.previousSourceState,
        item,
        renderedText: item.renderedText.slice(
          0,
          range.startRenderedUtf16 - itemStart,
        ),
      })
      if (prefix == null) return blockedResult("text prefix could not be retained")
      nextLeafItems.push(prefix)
      createdItems.push(prefix)
    }
    if (!emittedReplacement) {
      if (!emitItems(input.replacement.nextItems, true)) return emitFailure()
      emittedReplacement = true
    }
    if (range.endRenderedUtf16 < itemEnd) {
      if (item.kind !== "text") {
        return blockedResult("atomic Source items cannot be split")
      }
      if (!reserveFinalItemSlot()) return emitFailure()
      const suffix = retainedTextFragmentInternalV1({
        sourceState: input.previousSourceState,
        item,
        renderedText: item.renderedText.slice(
          range.endRenderedUtf16 - itemStart,
        ),
      })
      if (suffix == null) return blockedResult("text suffix could not be retained")
      nextLeafItems.push(suffix)
      createdItems.push(suffix)
    }
    itemStart = itemEnd
  }
  if (!emittedReplacement) {
    if (!emitItems(input.replacement.nextItems, true)) return emitFailure()
  }
  if (
    nextLeafItems.length === 0
    && affectedItems.length === input.previousSourceState.summary.itemCount
  ) {
    return blockedResult("empty complete Source remains outside active capability")
  }
  let replacementNodes: readonly VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
  const nextLeaves: VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
  for (const group of canonicalGroups(nextLeafItems, 8)) {
    if (!input.beforeVisit("source-path-copy-nodes")) return limitResult()
    copiedPathNodeCount += 1
    nextLeaves.push(deepFreeze(leaf(group, prepared.fingerprintFactory)))
  }
  replacementNodes = nextLeaves
  if (affectedLeaves.length > 1) {
    let emittedReplacement = false
    let recursiveRebuildBlocked = false
    const rewrite = (
      current: VNextTextBlockUnifiedLayoutSourceNodeV1,
    ): readonly VNextTextBlockUnifiedLayoutSourceNodeV1[] | null => {
      if (!affectedNodes.has(current)) return [current]
      if (current.nodeKind === "leaf") {
        if (!emittedReplacement) {
          emittedReplacement = true
          return nextLeaves
        }
        return []
      }
      const children: VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
      for (const child of current.children) {
        const rewritten = rewrite(child)
        if (rewritten == null) return null
        children.push(...rewritten)
      }
      if (children.length === 0) return []
      if (children.length === 1) return children
      while (children.some((child) => child.height !== children[0]!.height)) {
        const maximumHeight = Math.max(...children.map((child) => child.height))
        const underflowIndex = children.findIndex(
          (child) => child.height < maximumHeight,
        )
        const underflow = children[underflowIndex]
        if (
          underflow == null
          || underflow.height !== maximumHeight - 1
        ) {
          recursiveRebuildBlocked = true
          return null
        }
        const left = children[underflowIndex - 1]
        const right = children[underflowIndex + 1]
        let donor:
          | {
              readonly side: "left" | "right"
              readonly node: VNextTextBlockUnifiedLayoutSourceNodeV1
            }
          | null = null
        if (left != null) {
          if (!input.beforeVisit("source-lookup-nodes")) return null
          visitedLookupNodeCount += 1
          if (left.height === maximumHeight) {
            donor = { side: "left", node: left }
          }
        }
        if (donor == null && right != null) {
          if (!input.beforeVisit("source-lookup-nodes")) return null
          visitedLookupNodeCount += 1
          if (right.height === maximumHeight) {
            donor = { side: "right", node: right }
          }
        }
        if (donor == null) {
          recursiveRebuildBlocked = true
          return null
        }
        if (!rebalancedDonorNodes.has(donor.node)) {
          rebalancedDonorNodes.add(donor.node)
          affectedNodeCount += 1
        }
        if (donor.node.nodeKind !== "branch") {
          recursiveRebuildBlocked = true
          return null
        }
        const mayBorrow = donor.node.children.length > 2
        if (mayBorrow) {
          const donorChildren = donor.side === "left"
            ? donor.node.children.slice(0, -1)
            : donor.node.children.slice(1)
          const borrowed = donor.side === "left"
            ? donor.node.children.at(-1)!
            : donor.node.children[0]!
          const repairedChildren = donor.side === "left"
            ? [borrowed, underflow]
            : [underflow, borrowed]
          if (!input.beforeVisit("source-path-copy-nodes")) return null
          copiedPathNodeCount += 1
          const repairedDonor = deepFreeze(branch(
            donorChildren,
            prepared.fingerprintFactory,
          ))
          if (!input.beforeVisit("source-path-copy-nodes")) return null
          copiedPathNodeCount += 1
          const repairedUnderflow = deepFreeze(branch(
            repairedChildren,
            prepared.fingerprintFactory,
          ))
          if (donor.side === "left") {
            children.splice(
              underflowIndex - 1,
              2,
              repairedDonor,
              repairedUnderflow,
            )
          } else {
            children.splice(
              underflowIndex,
              2,
              repairedUnderflow,
              repairedDonor,
            )
          }
        } else {
          const mergedChildren = donor.side === "left"
            ? [...donor.node.children, underflow]
            : [underflow, ...donor.node.children]
          if (!input.beforeVisit("source-path-copy-nodes")) return null
          copiedPathNodeCount += 1
          const merged = deepFreeze(branch(
            mergedChildren,
            prepared.fingerprintFactory,
          ))
          children.splice(
            donor.side === "left" ? underflowIndex - 1 : underflowIndex,
            2,
            merged,
          )
        }
      }
      const output: VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
      for (const group of canonicalGroups(children, 8)) {
        if (group.length === 1) {
          output.push(group[0]!)
          continue
        }
        if (!input.beforeVisit("source-path-copy-nodes")) return null
        copiedPathNodeCount += 1
        output.push(deepFreeze(branch(group, prepared.fingerprintFactory)))
      }
      return output
    }
    const rewritten = rewrite(input.previousSourceState.root)
    if (rewritten == null) {
      return recursiveRebuildBlocked
        ? blockedResult("source branch underflow requires exact neighbor rebalance")
        : limitResult()
    }
    replacementNodes = rewritten
  } else {
    for (let ancestorIndex = ancestors.length - 1; ancestorIndex >= 0; ancestorIndex -= 1) {
      const ancestor = ancestors[ancestorIndex]!
      const children = [
        ...ancestor.branch.children.slice(0, ancestor.childIndex),
        ...replacementNodes,
        ...ancestor.branch.children.slice(ancestor.endChildIndex + 1),
      ]
      const nextLevel: VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
      for (const group of canonicalGroups(children, 8)) {
        if (group.length === 1) {
          nextLevel.push(group[0]!)
          continue
        }
        if (!input.beforeVisit("source-path-copy-nodes")) return limitResult()
        copiedPathNodeCount += 1
        nextLevel.push(deepFreeze(branch(group, prepared.fingerprintFactory)))
      }
      replacementNodes = nextLevel
    }
  }
  while (replacementNodes.length > 1) {
    const nextLevel: VNextTextBlockUnifiedLayoutSourceNodeV1[] = []
    for (const group of canonicalGroups(replacementNodes, 8)) {
      if (group.length === 1) {
        nextLevel.push(group[0]!)
        continue
      }
      if (!input.beforeVisit("source-path-copy-nodes")) return limitResult()
      copiedPathNodeCount += 1
      nextLevel.push(deepFreeze(branch(group, prepared.fingerprintFactory)))
    }
    replacementNodes = nextLevel
  }
  const nextRoot = replacementNodes[0]
  if (nextRoot == null) return blockedResult("source path copy produced no root")

  const removedInlineIds = new Set(removedItems.map((item) => item.inlineId))
  const registeredPlanASidecars =
    registeredPlanASourceSidecarAccessBySourceState.get(input.previousSourceState)
  const usesRegisteredPlanASidecars = registeredPlanASidecars != null
    || planASidecarStorageSourceStates.has(input.previousSourceState)
  const inheritedEntriesByCreatedInlineId = new Map<
    string,
    readonly SourceItemIndexEntryInternalV1[]
  >()
  const inheritedPlanAConflictByCreatedInlineId = new Map<string, boolean>()
  for (const item of createdItems) {
    if (
      removedInlineIds.has(item.inlineId)
      || inheritedEntriesByCreatedInlineId.has(item.inlineId)
      || inheritedPlanAConflictByCreatedInlineId.has(item.inlineId)
    ) continue
    if (registeredPlanASidecars != null) {
      const checked = registeredPlanASidecars.checkInlineIdConflict({
        inlineId: item.inlineId,
        incomingKind: item.kind,
        beforeVisitNode: () => {
          if (!input.beforeVisit("source-lookup-nodes")) return false
          visitedLookupNodeCount += 1
          return true
        },
      })
      if (checked.status === "limit-exceeded") return limitResult()
      inheritedPlanAConflictByCreatedInlineId.set(
        item.inlineId,
        checked.conflict,
      )
      continue
    }
    if (usesRegisteredPlanASidecars) {
      // A prepared-but-unpublished Plan A state has no registered next sidecar
      // yet. Its exact physical-index owner performs the uniqueness check.
      inheritedPlanAConflictByCreatedInlineId.set(item.inlineId, false)
      continue
    }
    sourceIndexLookupObserverForTest?.({
      inlineId: item.inlineId,
      indexProbeCount: 1,
      found: false,
    })
    const inheritedLookup = sourceItemIndexEntriesInternalV1(
      prepared.itemIndex,
      item.inlineId,
      () => {
        if (!input.beforeVisit("source-lookup-nodes")) return false
        visitedLookupNodeCount += 1
        return true
      },
    )
    if (inheritedLookup.limitExceeded) return limitResult()
    inheritedEntriesByCreatedInlineId.set(
      item.inlineId,
      inheritedLookup.entries,
    )
  }

  const createdNodeCount = copiedPathNodeCount
  const reusedNodeCount = Math.max(
    0,
    input.previousSourceState.summary.nodeCount
      - Math.min(input.previousSourceState.summary.nodeCount, affectedNodeCount),
  )
  const work = deepFreeze({
    constructionKind: "text-style-path-copy" as const,
    completeBuildCount: 0 as const,
    visitedInitialFlowAtomCount: 0 as const,
    visitedSummaryNodeCount: visitedLookupNodeCount,
    createdItemCount: createdItems.length,
    createdLeafCount: nextLeaves.length,
    createdNodeCount,
    reusedItemCount:
      input.previousSourceState.summary.itemCount - removedItems.length,
    reusedNodeCount,
    completeSuffixTraversalCount: 0 as const,
  })
  const facts = {
    source: input.previousSourceState.source,
    contractVersion: input.previousSourceState.contractVersion,
    documentId: input.previousSourceState.documentId,
    sectionId: input.previousSourceState.sectionId,
    textBlockId: input.previousSourceState.textBlockId,
    instanceRevision: input.previousSourceState.instanceRevision,
    initialFlowFingerprint: input.previousSourceState.initialFlowFingerprint,
    flowEvidenceFingerprint: input.previousSourceState.flowEvidenceFingerprint,
    authoredBoxPlan: input.previousSourceState.authoredBoxPlan,
    producerRequirements: input.previousSourceState.producerRequirements,
    policy: input.previousSourceState.policy,
    root: nextRoot,
    summary: nextRoot.summary,
    work,
    contracts: input.previousSourceState.contracts,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const canonicalFacts = stringifyVNextCanonicalJson(stateCanonicalFacts({
    ...facts,
    fingerprint: "",
  }))
  const sourceState = Object.freeze({
    ...facts,
    fingerprint: prepared.fingerprintFactory(canonicalFacts),
  })
  const removedItemOrdinalStart = nodeStartItemOrdinal
  const removedItemOrdinalEnd = nodeStartItemOrdinal + affectedItems.length
  const localEntries = new Map<
    string,
    SourceItemIndexEntryInternalV1[]
  >()
  let localStartRenderedUtf16 = nodeStartRenderedUtf16
  for (let index = 0; index < nextLeafItems.length; index += 1) {
    const item = nextLeafItems[index]!
    const inherited = inheritedEntriesByCreatedInlineId.get(item.inlineId)
      ?? Object.freeze([])
    if (inheritedPlanAConflictByCreatedInlineId.get(item.inlineId) === true) {
      return blockedResult("atomic Source inline authority must remain unique")
    }
    const inheritedOutsideReplacement = inherited.filter((entry) =>
        entry.itemOrdinal < removedItemOrdinalStart
        || entry.itemOrdinal >= removedItemOrdinalEnd
      )
    if (
      inheritedOutsideReplacement.length > 0
      && (
        item.kind !== "text"
        || inheritedOutsideReplacement.some((entry) => entry.kind !== "text")
      )
    ) return blockedResult("atomic Source inline authority must remain unique")
    const entries = localEntries.get(item.inlineId) ?? []
    if (
      entries.length > 0
      && (
        item.kind !== "text"
        || entries.some((entry) => entry.kind !== "text")
      )
    ) return blockedResult("atomic Source inline authority must remain unique")
    entries.push({
      kind: item.kind,
      itemOrdinal: nodeStartItemOrdinal + index,
      absoluteStartRenderedUtf16: localStartRenderedUtf16,
    })
    localEntries.set(item.inlineId, entries)
    localStartRenderedUtf16 += item.renderedUtf16Length
  }
  const itemIndex: SourceItemIndex = usesRegisteredPlanASidecars
    ? prepared.itemIndex
    : Object.freeze({
        indexKind: "range-delta" as const,
        previous: prepared.itemIndex,
        removedItemOrdinalStart,
        removedItemOrdinalEnd,
        itemOrdinalDelta: nextLeafItems.length - affectedItems.length,
        previousLeafEndRenderedUtf16: leafEndRenderedUtf16,
        renderedUtf16Delta:
          nextRoot.summary.renderedUtf16Length
          - input.previousSourceState.summary.renderedUtf16Length,
        localEntries,
      })
  preparedStates.set(sourceState, {
    fingerprint: sourceState.fingerprint,
    canonicalFacts,
    fingerprintFactory: prepared.fingerprintFactory,
    itemIndex,
    sourceEnvelopeFacts: prepared.sourceEnvelopeFacts,
  })
  if (usesRegisteredPlanASidecars) planASidecarStorageSourceStates.add(sourceState)

  if (!usesRegisteredPlanASidecars) {
    const previousStyles = registeredStylesBySourceState.get(
      input.previousSourceState,
    )
    if (previousStyles == null) return blockedResult("previous style authority is unavailable")
    const counts = new Map(
      previousStyles.entries.map((entry) => [entry.style, entry.referenceCount]),
    )
    const adjustStyle = (
      item: VNextTextBlockUnifiedLayoutSourceItemV1,
      delta: 1 | -1,
    ): boolean => {
      if (
        item.kind !== "text"
        && item.kind !== "resolved-field"
        && item.kind !== "generated-page-number"
      ) return true
      const next = (counts.get(item.style) ?? 0) + delta
      if (!Number.isSafeInteger(next) || next < 0) return false
      if (next === 0) counts.delete(item.style)
      else counts.set(item.style, next)
      return true
    }
    for (const item of removedItems) {
      if (!adjustStyle(item, -1)) return blockedResult("style references underflowed")
    }
    for (const item of createdItems) {
      if (!adjustStyle(item, 1)) return blockedResult("style references overflowed")
    }
    registeredStylesBySourceState.set(sourceState, Object.freeze({
      entries: Object.freeze([...counts.entries()].map(
        ([style, referenceCount]) => Object.freeze({ style, referenceCount }),
      )),
    }))
  }

  const pathCopyCandidateAuthority = Object.freeze(
    {},
  ) as VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  const removedItemsAuthority = Object.freeze([...removedItems])
  const nextPhysicalItemsAuthority = Object.freeze([...createdItems])
  const pathCopyCandidateRecord = Object.freeze({
    pathCopyCandidateAuthority,
    previousSourceState: input.previousSourceState,
    nextSourceState: sourceState,
    replacement: input.replacement,
    change: replacementAuthority.change,
    nextLeafItems: Object.freeze([...nextLeafItems]),
    removedItems: removedItemsAuthority,
    nextPhysicalItems: nextPhysicalItemsAuthority,
    nextLeafStartRenderedUtf16: nodeStartRenderedUtf16,
    visitedLookupNodeCount,
    copiedPathNodeCount,
    visitedChangedLeafItemCount,
  })
  sourceRangePathCopyCandidateAuthorities.set(
    pathCopyCandidateAuthority,
    pathCopyCandidateRecord,
  )
  sourceRangePathCopyCandidateAuthorities.set(
    removedItemsAuthority,
    pathCopyCandidateRecord,
  )
  sourceRangePathCopyCandidateAuthorities.set(
    nextPhysicalItemsAuthority,
    pathCopyCandidateRecord,
  )
  sourcePathCopyCandidateObserverForTestInternalV1?.(
    pathCopyCandidateAuthority,
  )
  const removedLineageIds = new Set(removedItems.map((item) => item.lineageId))
  const existingLineageIds = Object.freeze([
    ...new Set(createdItems
      .filter((item) => removedLineageIds.has(item.lineageId))
      .map((item) => item.lineageId)),
  ])
  const insertedLineageIds = Object.freeze([
    ...new Set(createdItems
      .filter((item) => !removedLineageIds.has(item.lineageId))
      .map((item) => item.lineageId)),
  ])
  return Object.freeze({
    status: "prepared" as const,
    sourceState,
    visitedLookupNodeCount,
    copiedPathNodeCount,
    visitedChangedLeafItemCount,
    existingLineageIds,
    insertedLineageIds,
    pathCopyCandidateAuthority,
    issues: Object.freeze([]) as readonly [],
  })
}

function buildComplete(
  input: unknown,
  factory: FingerprintFactory,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  const envelope = exactInput(input)
  if (envelope == null) {
    return blocked(
      "invalid-input",
      "source-state construction requires an exact accessor-free two-field envelope",
    )
  }
  const initialInspection = inspectVNextTextBlockInitialFlowV1(
    envelope.initialFlow,
  )
  if (initialInspection.status !== "valid") {
    return blocked("initial-flow-authority-mismatch", initialInspection.message)
  }
  const evidenceInspection = inspectVNextTextBlockFlowEvidenceV2(
    envelope.evidence,
  )
  if (evidenceInspection.status !== "valid") {
    return blocked("flow-evidence-authority-mismatch", evidenceInspection.message)
  }
  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const evidence = envelope.evidence as VNextTextBlockFlowEvidenceV2
  if (!hasVNextTextBlockFlowEvidenceBindingInternalV2(evidence, initialFlow)) {
    return blocked(
      "flow-evidence-binding-mismatch",
      "source-state construction requires evidence registered to the exact Initial Flow",
    )
  }
  if (evidence.initialFlowFingerprint !== initialFlow.fingerprint) {
    return blocked(
      "flow-evidence-binding-mismatch",
      "source-state evidence does not retain the exact Initial Flow fingerprint",
    )
  }

  try {
    const items = sourceItems(initialFlow, factory)
    if (items == null || items.length === 0) {
      return blocked(
        items == null ? "unresolved-inline-image" : "invalid-source-topology",
        items == null
          ? "source state requires resolved, safe inline-image source facts"
          : "source state requires at least one source item",
      )
    }
    const root = buildRoot(items, factory)
    const producerRequirementFacts = {
      layoutId: evidence.layoutId,
      layoutUnitPolicyFingerprint: evidence.layoutUnitPolicyFingerprint,
      availableWidthLayoutUnit: evidence.availableWidthLayoutUnit,
      declaredLineHeightLayoutUnit: evidence.declaredLineHeightLayoutUnit,
      paragraphFontFamilyKey: initialFlow.paragraphFontFamilyKey,
      paragraphStyle: structuredClone(evidence.paragraphStyle),
      fontFaces: structuredClone(initialFlow.fontFaces),
    }
    const producerRequirements = {
      ...producerRequirementFacts,
      fontStyleUnitDependencyFingerprint: fingerprintWith(factory, {
        layoutUnitPolicyFingerprint:
          producerRequirementFacts.layoutUnitPolicyFingerprint,
        declaredLineHeightLayoutUnit:
          producerRequirementFacts.declaredLineHeightLayoutUnit,
        paragraphFontFamilyKey:
          producerRequirementFacts.paragraphFontFamilyKey,
        paragraphStyle: producerRequirementFacts.paragraphStyle,
        fontFaces: producerRequirementFacts.fontFaces,
      }),
      producerRuntimeRequirementFingerprint: fingerprintWith(factory, {
        source: evidence.source,
        contractVersion: evidence.contractVersion,
        layoutId: evidence.layoutId,
        fontFaces: producerRequirementFacts.fontFaces.map((face) => ({
          fontFaceId: face.fontFaceId,
          fontSha256: face.fontSha256,
          weight: face.weight,
          style: face.style,
        })),
        layoutUnitPolicyFingerprint:
          producerRequirementFacts.layoutUnitPolicyFingerprint,
      }),
    }
    const work = {
      constructionKind: "complete" as const,
      completeBuildCount: 1 as const,
      visitedInitialFlowAtomCount: initialFlow.atoms.length,
      visitedSummaryNodeCount: 0 as const,
      createdItemCount: items.length,
      createdLeafCount: root.summary.leafCount,
      createdNodeCount: root.summary.nodeCount,
      reusedItemCount: 0 as const,
      reusedNodeCount: 0 as const,
      completeSuffixTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_SOURCE,
      contractVersion:
        VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_V1_VERSION,
      documentId: initialFlow.documentId,
      sectionId: initialFlow.sectionId,
      textBlockId: initialFlow.textBlockId,
      instanceRevision: initialFlow.instanceRevision,
      initialFlowFingerprint: initialFlow.fingerprint,
      flowEvidenceFingerprint: evidence.fingerprint,
      authoredBoxPlan: initialFlow.authoredBoxPlan,
      producerRequirements,
      policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
      root,
      summary: root.summary,
      work,
      contracts: {
        offsetIndependentItems: true as const,
        sourceAndPaintSeparatedFromLayoutFlow: true as const,
        summaryGuidedRenderedOffsetLookup: true as const,
        canonicalLocalPacking: true as const,
        preparedGraphCandidate: true as const,
        registeredAuthority: false as const,
        stagedEditorApply: false as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const withoutFingerprint = deepFreeze(facts)
    const canonicalFacts = stringifyVNextCanonicalJson(
      stateCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      }),
    )
    const sourceState = Object.freeze({
      ...withoutFingerprint,
      fingerprint: factory(canonicalFacts),
    })
    const itemIndex = indexSourceItems(sourceState.root)
    if (itemIndex == null) {
      return blocked(
        "invalid-source-topology",
        "source-state items require unique inline identities",
      )
    }
    const sourceEnvelopeFacts =
      sourceEnvelopeFactsForNextCompleteBuildForTest
      ?? Object.freeze({
        sourceItemCount: sourceState.summary.itemCount,
        treeHeight: sourceState.root.height + 1,
        maximumLeafOccupancy: 8 as const,
        deliberateItemResolutionCount: 1 as const,
      })
    sourceEnvelopeFactsForNextCompleteBuildForTest = null
    preparedStates.set(sourceState, {
      fingerprint: sourceState.fingerprint,
      canonicalFacts,
      fingerprintFactory: factory,
      itemIndex,
      sourceEnvelopeFacts,
    })
    registeredStylesBySourceState.set(
      sourceState,
      registeredStyleSetFromItems(items),
    )
    const evidenceStates = statesByEvidence.get(evidence) ?? new WeakSet()
    evidenceStates.add(sourceState)
    statesByEvidence.set(evidence, evidenceStates)
    const initialStates = statesByInitialFlow.get(initialFlow) ?? new WeakSet()
    initialStates.add(sourceState)
    statesByInitialFlow.set(initialFlow, initialStates)
    return Object.freeze({
      status: "prepared",
      sourceState,
      work: sourceState.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blocked(
      "unsafe-source-summary",
      "source-state construction exceeded safe canonical or summary arithmetic",
    )
  }
}

export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1
export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1
export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return buildComplete(input, defaultFingerprint)
}

export function createVNextTextBlockUnifiedLayoutSourceStateWithForcedCollisionForTestInternalV1(
  input: {
    readonly initialFlow: VNextTextBlockInitialFlowV1
    readonly evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1 {
  return buildComplete(input, forcedCollisionFingerprint)
}

export function inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
): VNextTextBlockPreparedSourceEnvelopeFactsInternalV1 | null {
  const prepared = preparedStates.get(sourceState)
  if (prepared == null) return null
  return prepared.sourceEnvelopeFacts
}

/** Test-only structural inspection of legacy storage retained beside Source State. */
export function inspectVNextTextBlockUnifiedLayoutSourceLegacyStorageForTestInternalV1(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
): {
  readonly rangeDeltaDepth: number
  readonly hasLegacyStyleRegistry: boolean
} | null {
  const prepared = preparedStates.get(sourceState)
  if (prepared == null) return null
  let rangeDeltaDepth = 0
  let itemIndex = prepared.itemIndex
  while (itemIndex.indexKind === "range-delta") {
    rangeDeltaDepth += 1
    itemIndex = itemIndex.previous
  }
  return Object.freeze({
    rangeDeltaDepth,
    hasLegacyStyleRegistry: registeredStylesBySourceState.has(sourceState),
  })
}

export function hasVNextTextBlockUnifiedLayoutSourceStatePreparedBindingInternalV1(
  sourceState: unknown,
  evidence: unknown,
): sourceState is VNextTextBlockUnifiedLayoutSourceStateV1 {
  return sourceState != null
    && typeof sourceState === "object"
    && evidence != null
    && typeof evidence === "object"
    && preparedStates.has(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    )
    && statesByEvidence.get(
      evidence as VNextTextBlockFlowEvidenceV2,
    )?.has(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    ) === true
}

export function inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutSourceStateInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !preparedStates.has(
      value as VNextTextBlockUnifiedLayoutSourceStateV1,
    )
  ) {
    return {
      status: "invalid",
      code: "source-state-authority-mismatch",
      message: "source state is not the exact process-local prepared candidate",
    }
  }
  if (!frozenSourceStateShell(value)) {
    return {
      status: "invalid",
      code: "source-state-not-deeply-frozen",
      message: "prepared source state must remain recursively frozen",
    }
  }
  try {
    const sourceState = value as VNextTextBlockUnifiedLayoutSourceStateV1
    const stored = preparedStates.get(sourceState)!
    const canonicalFacts = stringifyVNextCanonicalJson(
      stateCanonicalFacts(sourceState),
    )
    if (
      canonicalFacts !== stored.canonicalFacts
      || sourceState.fingerprint !== stored.fingerprint
      || sourceState.fingerprint !== stored.fingerprintFactory(canonicalFacts)
    ) {
      return {
        status: "invalid",
        code: "source-state-canonical-facts-mismatch",
        message: "prepared source state no longer matches its canonical facts",
      }
    }
    return {
      status: "prepared-unregistered",
      fingerprint: sourceState.fingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "source-state-canonical-facts-mismatch",
      message: "prepared source state is not canonically inspectable",
    }
  }
}

export function registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  },
): boolean {
  if (input.phase === "preflight") {
    return !registeredRootGraphStates.has(input.sourceState)
      && inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
        input.sourceState,
      ).status === "prepared-unregistered"
      && authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
        token: input.token,
        phase: input.phase,
        childKind: "source-state",
        child: input.sourceState,
      })
  }
  if (
    !authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
      token: input.token,
      phase: input.phase,
      childKind: "source-state",
      child: input.sourceState,
    })
  ) return false
  registeredRootGraphStates.add(input.sourceState)
  return true
}

export function hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2(
  value: unknown,
): value is VNextTextBlockUnifiedLayoutSourceStateV1 {
  return value != null
    && typeof value === "object"
    && registeredRootGraphStates.has(
      value as VNextTextBlockUnifiedLayoutSourceStateV1,
    )
}

export function inspectVNextTextBlockUnifiedLayoutSourceStateV1(
  value: unknown,
):
  | { readonly status: "valid"; readonly fingerprint: string }
  | {
      readonly status: "invalid"
      readonly code: "source-state-authority-mismatch"
      readonly message: string
    } {
  if (
    !hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2(
      value,
    )
  ) {
    return {
      status: "invalid",
      code: "source-state-authority-mismatch",
      message: "source state is not an exact committed Root V2 child",
    }
  }
  const candidate =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(value)
  return candidate.status === "prepared-unregistered"
    ? { status: "valid", fingerprint: candidate.fingerprint }
    : {
        status: "invalid",
        code: "source-state-authority-mismatch",
        message: candidate.message,
      }
}

function withPostBindingSourceWorkInternalV1(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  unit: PostBindingSourceUnitInternalV1,
  count: number,
): VNextTextBlockIncrementalCandidateWorkV1 {
  const flow = unit === "source-path-copy-nodes"
    ? { ...base.flow, copiedSourcePathNodeCount: count }
    : { ...base.flow, visitedChangedSourceLeafItemCount: count }
  return deepFreeze({
    ...base,
    flow,
    stageWork: base.stageWork.map((row) =>
      row.stage === "source-flow" && row.unit === unit
        ? { ...row, count }
        : row
    ),
  })
}

function takePostBindingSourceVisitGuardInternalV1(input: {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly validatedChange?: VNextTextBlockValidatedChangeV1
  readonly completedCandidateWork?: VNextTextBlockIncrementalCandidateWorkV1
  readonly stageVisitGuard?: VNextTextBlockPostBindingSourceVisitGuardInternalV1
}):
  | {
      readonly status: "unbounded-v2"
      readonly record: null
      readonly completedCandidateWork: null
    }
  | {
      readonly status: "accepted-v3"
      readonly record: PostBindingSourceVisitGuardRecordInternalV1
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | { readonly status: "invariant-blocked" } {
  const supplied = [
    input.validatedChange,
    input.completedCandidateWork,
    input.stageVisitGuard,
  ].filter((value) => value != null).length
  if (supplied === 0) {
    return {
      status: "unbounded-v2",
      record: null,
      completedCandidateWork: null,
    }
  }
  if (
    supplied !== 3
    || input.validatedChange == null
    || input.completedCandidateWork == null
    || input.stageVisitGuard == null
  ) return { status: "invariant-blocked" }
  const record = postBindingSourceVisitGuards.get(input.stageVisitGuard)
  if (
    record == null
    || record.sourceState !== input.previousSourceState
    || record.validatedChange !== input.validatedChange
  ) return { status: "invariant-blocked" }
  postBindingSourceVisitGuards.delete(input.stageVisitGuard)
  return {
    status: "accepted-v3",
    record,
    completedCandidateWork: input.completedCandidateWork,
  }
}

function evaluatePostBindingSourceOperationInternalV1(input: {
  readonly record: PostBindingSourceVisitGuardRecordInternalV1
  readonly unit: PostBindingSourceUnitInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | {
      readonly status: "accepted"
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "invariant-blocked"
      readonly attemptedWork: number
      readonly effectiveLimit: number
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    } {
  const evaluation = input.record.evaluate(
    input.unit,
    input.completedCandidateWork,
  )
  if (evaluation.status !== "accepted") {
    return {
      status: "invariant-blocked",
      attemptedWork: evaluation.attemptedWork,
      effectiveLimit: evaluation.effectiveLimit,
      completedCandidateWork: input.completedCandidateWork,
    }
  }
  const completedCandidateWork = withPostBindingSourceWorkInternalV1(
    input.completedCandidateWork,
    input.unit,
    evaluation.attemptedWork,
  )
  postBindingSourceOperationObserverForTest?.({
    unit: input.unit,
    completedWork: evaluation.attemptedWork,
  })
  return { status: "accepted", completedCandidateWork }
}

export function createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1(
  input: {
    readonly previousSourceState:
      VNextTextBlockUnifiedLayoutSourceStateV1
    readonly sourceItemAuthority: object
    readonly inlineId: string
    readonly expectedImageSourceFingerprint: string
    readonly expectedImageDependencyFingerprint: string
    readonly nextFit: ImageFrameV4Target["fit"]
    readonly nextCrop: NonNullable<ImageFrameV4Target["crop"]> | null
    readonly validatedChange?: VNextTextBlockValidatedChangeV1
    readonly completedCandidateWork?: VNextTextBlockIncrementalCandidateWorkV1
    readonly stageVisitGuard?:
      VNextTextBlockPostBindingSourceVisitGuardInternalV1
  },
):
  | {
      readonly status: "unchanged"
      readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly sourceItemAuthority: object
      readonly visitedSummaryNodeCount: number
      readonly copiedSourcePathNodeCount: 0
      readonly visitedChangedSourceLeafItemCount: 0
      readonly createdNodeCount: 0
      readonly reusedNodeCount: number
      readonly completeSuffixTraversalCount: 0
      readonly issues: readonly []
      readonly completedCandidateWork?: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "prepared"
      readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly sourceItemAuthority: object
      readonly visitedSummaryNodeCount: number
      readonly copiedSourcePathNodeCount: number
      readonly visitedChangedSourceLeafItemCount: number
      readonly createdNodeCount: number
      readonly reusedNodeCount: number
      readonly completeSuffixTraversalCount: 0
      readonly issues: readonly []
      readonly completedCandidateWork?: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "blocked"
      readonly sourceState: null
      readonly sourceItemAuthority: null
      readonly visitedSummaryNodeCount: 0
      readonly copiedSourcePathNodeCount: 0
      readonly visitedChangedSourceLeafItemCount: 0
      readonly createdNodeCount: 0
      readonly reusedNodeCount: 0
      readonly completeSuffixTraversalCount: 0
      readonly issues: readonly [{
        readonly code: "source-state-authority-mismatch"
        readonly message: string
      }]
    }
  | {
      readonly status: "invariant-blocked"
      readonly sourceState: null
      readonly sourceItemAuthority: null
      readonly visitedSummaryNodeCount: 0
      readonly copiedSourcePathNodeCount: number
      readonly visitedChangedSourceLeafItemCount: number
      readonly createdNodeCount: 0
      readonly reusedNodeCount: 0
      readonly completeSuffixTraversalCount: 0
      readonly completedCandidateWork?: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    } {
  const bounded = takePostBindingSourceVisitGuardInternalV1(input)
  if (bounded.status === "invariant-blocked") {
    return {
      status: "invariant-blocked",
      sourceState: null,
      sourceItemAuthority: null,
      visitedSummaryNodeCount: 0,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
      createdNodeCount: 0,
      reusedNodeCount: 0,
      completeSuffixTraversalCount: 0,
      issues: Object.freeze([]) as readonly [],
    }
  }
  const prepared = preparedStates.get(input.previousSourceState)
  const sourceItemAuthority =
    imagePaintSourceItemAuthorities.get(input.sourceItemAuthority)
  const indexed = sourceItemAuthority?.indexed ?? undefined
  if (
    prepared == null
    || sourceItemAuthority == null
    || sourceItemAuthority.sourceState !== input.previousSourceState
    || sourceItemAuthority.inlineId !== input.inlineId
    || indexed == null
    || indexed.item.kind !== "inline-image"
    || sourceItemAuthority.item !== indexed.item
    || indexed.item.sourceFingerprint
      !== input.expectedImageSourceFingerprint
    || indexed.item.layoutDependencyFingerprint
      !== input.expectedImageDependencyFingerprint
  ) {
    return {
      status: "blocked",
      sourceState: null,
      sourceItemAuthority: null,
      visitedSummaryNodeCount: 0,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
      createdNodeCount: 0,
      reusedNodeCount: 0,
      completeSuffixTraversalCount: 0,
      issues: [{
        code: "source-state-authority-mismatch",
        message: "image paint path copy requires exact registered source facts",
      }],
    }
  }
  const previousCrop = indexed.item.authoredFrame.crop ?? null
  if (
    indexed.item.authoredFrame.fit === input.nextFit
    && stringifyVNextCanonicalJson(previousCrop)
      === stringifyVNextCanonicalJson(input.nextCrop)
  ) {
    return {
      status: "unchanged",
      sourceState: input.previousSourceState,
      sourceItemAuthority: input.sourceItemAuthority,
      visitedSummaryNodeCount: indexed.ancestors.length + 1,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
      createdNodeCount: 0,
      reusedNodeCount: input.previousSourceState.summary.nodeCount,
      completeSuffixTraversalCount: 0,
      issues: Object.freeze([]) as readonly [],
      ...(bounded.completedCandidateWork == null ? {} : {
        completedCandidateWork: bounded.completedCandidateWork,
      }),
    }
  }
  try {
    const {
      crop: _previousCrop,
      ...frameWithoutCrop
    } = indexed.item.authoredFrame
    const authoredFrame: ImageFrameV4Target = {
      ...structuredClone(frameWithoutCrop),
      fit: input.nextFit,
      ...(input.nextCrop == null
        ? {}
        : { crop: structuredClone(input.nextCrop) }),
    }
    const {
      fingerprint: _previousItemFingerprint,
      paintFingerprint: _previousPaintFingerprint,
      authoredFrame: _previousAuthoredFrame,
      ...unchangedItemFacts
    } = indexed.item
    const itemFacts = {
      ...unchangedItemFacts,
      authoredFrame,
      paintFingerprint: canonicalVNextTextBlockImagePaintFactsInternalV1({
        assetId: indexed.item.assetId,
        authoredFrame,
      }, prepared.fingerprintFactory).fingerprint,
    }
    const nextItem: VNextTextBlockUnifiedLayoutSourceItemV1 = deepFreeze({
      ...itemFacts,
      fingerprint: fingerprintWith(prepared.fingerprintFactory, {
        contractVersion: 1,
        ...itemFacts,
      }),
    })
    let completedCandidateWork = bounded.completedCandidateWork
    const nextLeafItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
    let completedLeafItemCount = 0
    for (
      let itemIndex = 0;
      itemIndex < indexed.leaf.items.length;
      itemIndex += 1
    ) {
      if (bounded.status === "accepted-v3") {
        const evaluation = evaluatePostBindingSourceOperationInternalV1({
          record: bounded.record,
          unit: "source-leaf-items",
          completedCandidateWork: completedCandidateWork!,
        })
        if (evaluation.status !== "accepted") {
          return {
            status: "invariant-blocked",
            sourceState: null,
            sourceItemAuthority: null,
            visitedSummaryNodeCount: 0,
            copiedSourcePathNodeCount: 0,
            visitedChangedSourceLeafItemCount: completedLeafItemCount,
            createdNodeCount: 0,
            reusedNodeCount: 0,
            completeSuffixTraversalCount: 0,
            completedCandidateWork: evaluation.completedCandidateWork,
            issues: Object.freeze([]) as readonly [],
          }
        }
        completedCandidateWork = evaluation.completedCandidateWork
      }
      const item = indexed.leaf.items[itemIndex]!
      nextLeafItems.push(itemIndex === indexed.itemIndex ? nextItem : item)
      completedLeafItemCount += 1
    }
    if (bounded.status === "accepted-v3") {
      const evaluation = evaluatePostBindingSourceOperationInternalV1({
        record: bounded.record,
        unit: "source-path-copy-nodes",
        completedCandidateWork: completedCandidateWork!,
      })
      if (evaluation.status !== "accepted") {
        return {
          status: "invariant-blocked",
          sourceState: null,
          sourceItemAuthority: null,
          visitedSummaryNodeCount: 0,
          copiedSourcePathNodeCount: 0,
          visitedChangedSourceLeafItemCount: completedLeafItemCount,
          createdNodeCount: 0,
          reusedNodeCount: 0,
          completeSuffixTraversalCount: 0,
          completedCandidateWork: evaluation.completedCandidateWork,
          issues: Object.freeze([]) as readonly [],
        }
      }
      completedCandidateWork = evaluation.completedCandidateWork
    }
    const nextLeaf = deepFreeze(leaf(
      nextLeafItems,
      prepared.fingerprintFactory,
    ))
    let nextPathNode: VNextTextBlockUnifiedLayoutSourceNodeV1 = nextLeaf
    let completedPathCopyCount = 1
    for (
      let ancestorIndex = indexed.ancestors.length - 1;
      ancestorIndex >= 0;
      ancestorIndex -= 1
    ) {
      if (bounded.status === "accepted-v3") {
        const evaluation = evaluatePostBindingSourceOperationInternalV1({
          record: bounded.record,
          unit: "source-path-copy-nodes",
          completedCandidateWork: completedCandidateWork!,
        })
        if (evaluation.status !== "accepted") {
          return {
            status: "invariant-blocked",
            sourceState: null,
            sourceItemAuthority: null,
            visitedSummaryNodeCount: 0,
            copiedSourcePathNodeCount: completedPathCopyCount,
            visitedChangedSourceLeafItemCount: completedLeafItemCount,
            createdNodeCount: 0,
            reusedNodeCount: 0,
            completeSuffixTraversalCount: 0,
            completedCandidateWork: evaluation.completedCandidateWork,
            issues: Object.freeze([]) as readonly [],
          }
        }
        completedCandidateWork = evaluation.completedCandidateWork
      }
      const ancestor = indexed.ancestors[ancestorIndex]!
      const pendingCopied = branch(
        ancestor.branch.children.map((child, childIndex) =>
          childIndex === ancestor.childIndex ? nextPathNode : child
        ),
        prepared.fingerprintFactory,
      )
      deepFreeze(pendingCopied.summary)
      Object.freeze(pendingCopied.children)
      const copied = Object.freeze(pendingCopied)
      nextPathNode = copied
      completedPathCopyCount += 1
    }
    const createdNodeCount = indexed.ancestors.length + 1
    const work = {
      constructionKind: "image-paint-path-copy" as const,
      completeBuildCount: 0 as const,
      visitedInitialFlowAtomCount: 0 as const,
      visitedSummaryNodeCount: createdNodeCount,
      createdItemCount: 1 as const,
      createdLeafCount: 1 as const,
      createdNodeCount,
      reusedItemCount:
        input.previousSourceState.summary.itemCount - 1,
      reusedNodeCount:
        input.previousSourceState.summary.nodeCount - createdNodeCount,
      completeSuffixTraversalCount: 0 as const,
    }
    const facts = {
      source: input.previousSourceState.source,
      contractVersion: input.previousSourceState.contractVersion,
      documentId: input.previousSourceState.documentId,
      sectionId: input.previousSourceState.sectionId,
      textBlockId: input.previousSourceState.textBlockId,
      instanceRevision: input.previousSourceState.instanceRevision,
      initialFlowFingerprint:
        input.previousSourceState.initialFlowFingerprint,
      flowEvidenceFingerprint:
        input.previousSourceState.flowEvidenceFingerprint,
      authoredBoxPlan: input.previousSourceState.authoredBoxPlan,
      producerRequirements:
        input.previousSourceState.producerRequirements,
      policy: input.previousSourceState.policy,
      root: nextPathNode,
      summary: nextPathNode.summary,
      work: deepFreeze(work),
      contracts: input.previousSourceState.contracts,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const canonicalFacts = stringifyVNextCanonicalJson(
      stateCanonicalFacts({
        ...facts,
        fingerprint: "",
      }),
    )
    const sourceState = Object.freeze({
      ...facts,
      fingerprint: prepared.fingerprintFactory(canonicalFacts),
    })
    preparedStates.set(sourceState, {
      fingerprint: sourceState.fingerprint,
      canonicalFacts,
      fingerprintFactory: prepared.fingerprintFactory,
      itemIndex: prepared.itemIndex,
      sourceEnvelopeFacts: prepared.sourceEnvelopeFacts,
    })
    const previousStyles = registeredStylesBySourceState.get(
      input.previousSourceState,
    )
    if (previousStyles != null) {
      registeredStylesBySourceState.set(sourceState, previousStyles)
    }
    const nextStates =
      imagePaintNextStates.get(input.previousSourceState) ?? new WeakSet()
    nextStates.add(sourceState)
    imagePaintNextStates.set(input.previousSourceState, nextStates)
    const nextSourceItemAuthority = Object.freeze({})
    imagePaintSourceItemAuthorities.set(nextSourceItemAuthority, {
      sourceState,
      inlineId: nextItem.inlineId,
      item: nextItem as Extract<
        VNextTextBlockUnifiedLayoutSourceItemV1,
        { readonly kind: "inline-image" }
      >,
      indexed: null,
    })
    return Object.freeze({
      status: "prepared",
      sourceState,
      sourceItemAuthority: nextSourceItemAuthority,
      visitedSummaryNodeCount: createdNodeCount,
      copiedSourcePathNodeCount: createdNodeCount,
      visitedChangedSourceLeafItemCount: indexed.leaf.items.length,
      createdNodeCount,
      reusedNodeCount: work.reusedNodeCount,
      completeSuffixTraversalCount: 0 as const,
      issues: Object.freeze([]) as readonly [],
      ...(completedCandidateWork == null ? {} : { completedCandidateWork }),
    })
  } catch {
    return {
      status: "blocked",
      sourceState: null,
      sourceItemAuthority: null,
      visitedSummaryNodeCount: 0,
      copiedSourcePathNodeCount: 0,
      visitedChangedSourceLeafItemCount: 0,
      createdNodeCount: 0,
      reusedNodeCount: 0,
      completeSuffixTraversalCount: 0,
      issues: [{
        code: "source-state-authority-mismatch",
        message: "image paint path copy exceeded safe canonical arithmetic",
      }],
    }
  }
}

export function hasVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionBindingInternalV1(
  previousSourceState: unknown,
  nextSourceState: unknown,
): nextSourceState is VNextTextBlockUnifiedLayoutSourceStateV1 {
  return previousSourceState != null
    && typeof previousSourceState === "object"
    && nextSourceState != null
    && typeof nextSourceState === "object"
    && imagePaintNextStates.get(
      previousSourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    )?.has(
      nextSourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    ) === true
}

export function deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly inlineId: string
    readonly expectedImageSourceFingerprint: string
    readonly expectedImageDependencyFingerprint: string
    readonly nextFit: ImageFrameV4Target["fit"]
    readonly nextCrop: NonNullable<ImageFrameV4Target["crop"]> | null
    readonly preBindingGuard?:
      VNextTextBlockPreBindingSourceVisitGuardInternalV1
  },
):
  | {
      readonly status: "accepted"
      readonly paintFingerprint: string
      readonly sourceItemAuthority: object
      readonly visitedSummaryNodeCount: number
      readonly visitedSourceLookupNodeCount: number
      readonly visitedSourceItemCount: 1
      readonly completeSourceTraversalCount: 0
    }
  | {
      readonly status: "blocked"
      readonly paintFingerprint: null
      readonly sourceItemAuthority: null
      readonly visitedSummaryNodeCount: 0
      readonly visitedSourceLookupNodeCount: number
      readonly visitedSourceItemCount: number
      readonly completeSourceTraversalCount: 0
    }
  | {
      readonly status: "invariant-blocked"
      readonly paintFingerprint: null
      readonly sourceItemAuthority: null
      readonly visitedSummaryNodeCount: 0
      readonly visitedSourceLookupNodeCount: number
      readonly visitedSourceItemCount: number
      readonly completeSourceTraversalCount: 0
      readonly unit: "source-lookup-nodes" | "source-items"
      readonly completedWork: number
      readonly attemptedWork: number
      readonly effectiveLimit: number
    } {
  const prepared = preparedStates.get(input.sourceState)
  const guarded = prepared == null || input.preBindingGuard == null
    ? null
    : indexedSourceItemWithPreBindingGuardInternalV1(
        prepared.itemIndex,
        input.sourceState,
        input.inlineId,
        input.preBindingGuard,
      )
  if (guarded?.status === "invariant-blocked") {
    return {
      status: "invariant-blocked",
      paintFingerprint: null,
      sourceItemAuthority: null,
      visitedSummaryNodeCount: 0,
      visitedSourceLookupNodeCount:
        guarded.completedSourceLookupNodeCount,
      visitedSourceItemCount: guarded.completedSourceItemCount,
      completeSourceTraversalCount: 0,
      unit: guarded.unit,
      completedWork: guarded.completedWork,
      attemptedWork: guarded.attemptedWork,
      effectiveLimit: guarded.effectiveLimit,
    }
  }
  const indexed = guarded?.status === "completed"
    ? guarded.indexed
    : prepared == null
      ? undefined
      : indexedSourceItem(
          prepared.itemIndex,
          input.sourceState.root,
          input.inlineId,
        )
  if (
    prepared == null
    || indexed == null
    || indexed.item.kind !== "inline-image"
    || indexed.item.sourceFingerprint
      !== input.expectedImageSourceFingerprint
    || indexed.item.layoutDependencyFingerprint
      !== input.expectedImageDependencyFingerprint
  ) {
    const visitedSourceLookupNodeCount = guarded?.status === "completed"
      ? guarded.completedSourceLookupNodeCount
      : indexed == null
        ? 0
        : indexed.visitedSourceLookupNodeCount
    return {
      status: "blocked",
      paintFingerprint: null,
      sourceItemAuthority: null,
      visitedSummaryNodeCount: 0,
      visitedSourceLookupNodeCount,
      visitedSourceItemCount: guarded?.status === "completed"
        ? guarded.completedSourceItemCount
        : indexed == null ? 0 : 1,
      completeSourceTraversalCount: 0,
    }
  }
  const nextItemPaintFingerprint = fingerprintWith(
    prepared.fingerprintFactory,
    {
      assetId: indexed.item.assetId,
      fit: input.nextFit,
      crop: input.nextCrop,
    },
  )
  let pathPaintFingerprint = fingerprintWith(
    prepared.fingerprintFactory,
    {
      items: indexed.leaf.items.map((item, itemIndex) =>
        itemIndex === indexed.itemIndex
          ? nextItemPaintFingerprint
          : item.paintFingerprint
      ),
    },
  )
  for (
    let ancestorIndex = indexed.ancestors.length - 1;
    ancestorIndex >= 0;
    ancestorIndex -= 1
  ) {
    const ancestor = indexed.ancestors[ancestorIndex]!
    pathPaintFingerprint = fingerprintWith(
      prepared.fingerprintFactory,
      {
        children: ancestor.branch.children.map((child, childIndex) =>
          childIndex === ancestor.childIndex
            ? pathPaintFingerprint
            : child.summary.paintFingerprint
        ),
      },
    )
  }
  const sourceItemAuthority = Object.freeze({})
  imagePaintSourceItemAuthorities.set(sourceItemAuthority, {
    sourceState: input.sourceState,
    inlineId: indexed.item.inlineId,
    item: indexed.item,
    indexed,
  })
  return {
    status: "accepted",
    paintFingerprint: pathPaintFingerprint,
    sourceItemAuthority,
    visitedSummaryNodeCount: indexed.ancestors.length + 1,
    visitedSourceLookupNodeCount:
      indexed.visitedSourceLookupNodeCount,
    visitedSourceItemCount: 1,
    completeSourceTraversalCount: 0,
  }
}

export function resolveVNextTextBlockUnifiedLayoutImagePaintSourceItemAuthorityInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly inlineId: string
    readonly sourceItemAuthority: object
  },
): Extract<
  VNextTextBlockUnifiedLayoutSourceItemV1,
  { readonly kind: "inline-image" }
> | null {
  const authority =
    imagePaintSourceItemAuthorities.get(input.sourceItemAuthority)
  return authority != null
    && authority.sourceState === input.sourceState
    && authority.inlineId === input.inlineId
    ? authority.item
    : null
}

export function lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly inlineId: string
  },
):
  | {
      readonly status: "found"
      readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
      readonly absoluteStartRenderedUtf16: number
      readonly absoluteEndRenderedUtf16: number
      readonly visitedSummaryNodeCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "not-found"
      readonly item: null
      readonly absoluteStartRenderedUtf16: null
      readonly absoluteEndRenderedUtf16: null
      readonly visitedSummaryNodeCount: 0
      readonly completeTreeTraversalCount: 0
    } {
  const prepared = preparedStates.get(input.sourceState)
  const indexed = prepared == null
    ? undefined
    : indexedSourceItem(
        prepared.itemIndex,
        input.sourceState.root,
        input.inlineId,
      )
  if (prepared == null || indexed == null) {
    return {
      status: "not-found",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedSummaryNodeCount: 0,
      completeTreeTraversalCount: 0,
    }
  }
  return {
    status: "found",
    item: indexed.item,
    absoluteStartRenderedUtf16: indexed.absoluteStartRenderedUtf16,
    absoluteEndRenderedUtf16:
      indexed.absoluteStartRenderedUtf16
      + indexed.item.renderedUtf16Length,
    visitedSummaryNodeCount: indexed.ancestors.length + 1,
    completeTreeTraversalCount: 0,
  }
}

export function lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly renderedUtf16Offset: number
}): VNextTextBlockUnifiedLayoutSourceLookupResultV1 {
  const inspection = inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
    input.sourceState,
  )
  if (inspection.status !== "prepared-unregistered") {
    return {
      status: "blocked",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: null,
      issues: [{
        code: "initial-flow-authority-mismatch",
        message: inspection.message,
      }],
    }
  }
  if (
    !Number.isSafeInteger(input.renderedUtf16Offset)
    || input.renderedUtf16Offset < 0
    || input.renderedUtf16Offset >= input.sourceState.summary.renderedUtf16Length
  ) {
    return {
      status: "not-found",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      work: {
        visitedNodeCount: 0,
        completeTreeTraversalCount: 0,
      },
    }
  }

  let node = input.sourceState.root
  let relativeOffset = input.renderedUtf16Offset
  let absoluteBase = 0
  let visitedNodeCount = 1
  while (node.nodeKind === "branch") {
    let selected: VNextTextBlockUnifiedLayoutSourceNodeV1 | null = null
    for (const child of node.children) {
      if (relativeOffset < child.summary.renderedUtf16Length) {
        selected = child
        break
      }
      relativeOffset -= child.summary.renderedUtf16Length
      absoluteBase += child.summary.renderedUtf16Length
    }
    if (selected == null) break
    node = selected
    visitedNodeCount += 1
  }
  if (node.nodeKind === "leaf") {
    for (const item of node.items) {
      if (relativeOffset < item.renderedUtf16Length) {
        return {
          status: "found",
          item,
          absoluteStartRenderedUtf16: absoluteBase,
          absoluteEndRenderedUtf16:
            absoluteBase + item.renderedUtf16Length,
          work: {
            visitedNodeCount,
            completeTreeTraversalCount: 0,
          },
        }
      }
      relativeOffset -= item.renderedUtf16Length
      absoluteBase += item.renderedUtf16Length
    }
  }
  return {
    status: "not-found",
    item: null,
    absoluteStartRenderedUtf16: null,
    absoluteEndRenderedUtf16: null,
    work: {
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    },
  }
}

export function resolveVNextTextBlockRegisteredSourceStyleInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}):
  | { readonly status: "resolved"; readonly style: VNextTextBlockUnifiedLayoutSourceStyleV1 }
  | { readonly status: "unavailable" | "ambiguous"; readonly style: null } {
  const planASidecars = registeredPlanASourceSidecarAccessBySourceState.get(
    input.sourceState,
  )
  if (planASidecars != null) return planASidecars.resolveStyle(input)
  const registered = registeredStylesBySourceState.get(input.sourceState)
  if (registered == null) return { status: "unavailable", style: null }
  const candidates = registered.entries
    .map((entry) => entry.style)
    .filter((style) =>
      style.measurementStyleKey === input.measurementStyleKey
      && style.effectiveShapingStyleKey === input.effectiveShapingStyleKey
    )
  if (candidates.length === 0) return { status: "unavailable", style: null }
  const first = candidates[0]!
  return candidates.every((candidate) => sameResolvedStyle(first, candidate))
    ? { status: "resolved", style: first }
    : { status: "ambiguous", style: null }
}

/** Test-only exact-authority seam for exercising a supplied-key digest collision. */
export function forceVNextTextBlockRegisteredSourceStyleCollisionForTestInternalV1(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
): boolean {
  const registered = registeredStylesBySourceState.get(sourceState)
  const first = registered?.entries[0]
  if (registered == null || first == null) return false
  const collidingStyle = deepFreeze({
    ...first.style,
    textColor: first.style.textColor === "000000" ? "FFFFFF" : "000000",
    authoredLocalStyle: {
      ...(first.style.authoredLocalStyle ?? {}),
      textColor: first.style.textColor === "000000" ? "FFFFFF" : "000000",
    },
  })
  registeredStylesBySourceState.set(sourceState, Object.freeze({
    entries: Object.freeze([
      ...registered.entries,
      Object.freeze({ style: collidingStyle, referenceCount: 1 }),
    ]),
  }))
  return true
}

export function visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly inlineId: string
    readonly beforeVisitNode: () => boolean
  },
): VNextTextBlockTransitionSourceItemLookupResultInternalV1 {
  const planASidecars = registeredPlanASourceSidecarAccessBySourceState.get(
    input.sourceState,
  )
  if (planASidecars != null) return planASidecars.visitItemByInlineId(input)
  const prepared = preparedStates.get(input.sourceState)
  let visitedNodeCount = 0
  const authority = prepared == null
    ? null
    : sourceItemIndexEntriesInternalV1(
        prepared.itemIndex,
        input.inlineId,
        () => {
          if (!input.beforeVisitNode()) return false
          visitedNodeCount += 1
          return true
        },
      )
  if (authority?.limitExceeded === true) {
    return {
      status: "limit-exceeded",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    }
  }
  if (prepared == null || authority == null || authority.entries.length !== 1) {
    return {
      status: "not-found",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    }
  }
  const exactAuthority = authority.entries[0]!
  let node = input.sourceState.root
  let relativeItemOrdinal = exactAuthority.itemOrdinal
  while (true) {
    if (!input.beforeVisitNode()) {
      return {
        status: "limit-exceeded",
        item: null,
        absoluteStartRenderedUtf16: null,
        absoluteEndRenderedUtf16: null,
        visitedNodeCount,
        completeTreeTraversalCount: 0,
      }
    }
    visitedNodeCount += 1
    if (node.nodeKind === "leaf") break
    let selected: VNextTextBlockUnifiedLayoutSourceNodeV1 | null = null
    for (const child of node.children) {
      if (relativeItemOrdinal < child.summary.itemCount) {
        selected = child
        break
      }
      relativeItemOrdinal -= child.summary.itemCount
    }
    if (selected == null) {
      return {
        status: "not-found",
        item: null,
        absoluteStartRenderedUtf16: null,
        absoluteEndRenderedUtf16: null,
        visitedNodeCount,
        completeTreeTraversalCount: 0,
      }
    }
    node = selected
  }
  const item = node.items[relativeItemOrdinal]
  if (item == null || item.inlineId !== input.inlineId) {
    return {
      status: "not-found",
      item: null,
      absoluteStartRenderedUtf16: null,
      absoluteEndRenderedUtf16: null,
      visitedNodeCount,
      completeTreeTraversalCount: 0,
    }
  }
  return {
    status: "found",
    item,
    absoluteStartRenderedUtf16: exactAuthority.absoluteStartRenderedUtf16,
    absoluteEndRenderedUtf16:
      exactAuthority.absoluteStartRenderedUtf16 + item.renderedUtf16Length,
    visitedNodeCount,
    completeTreeTraversalCount: 0,
  }
}

export function visitVNextTextBlockTransitionSourceCoverageInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly range: { readonly startRenderedUtf16: number; readonly endRenderedUtf16: number }
  readonly beforeVisit: (
    unit: "source-coverage-nodes" | "source-coverage-items",
  ) => VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null
  readonly completeVisit: (
    permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
  ) => boolean
}): VNextTextBlockTransitionSourceCoverageResultInternalV1 {
  if (
    typeof input.beforeVisit !== "function"
    || typeof input.completeVisit !== "function"
    || inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(input.sourceState)
      .status !== "prepared-unregistered"
    || !Number.isSafeInteger(input.range.startRenderedUtf16)
    || !Number.isSafeInteger(input.range.endRenderedUtf16)
    || input.range.startRenderedUtf16 < 0
    || input.range.endRenderedUtf16 < input.range.startRenderedUtf16
    || input.range.endRenderedUtf16 > input.sourceState.summary.renderedUtf16Length
  ) return { status: "blocked", fragments: null, visitedNodeCount: 0, emittedItemCount: 0, completeTreeTraversalCount: 0 }
  const fragments: VNextTextBlockTransitionSourceCoverageFragmentInternalV1[] = []
  const visitedNodes = new Set<VNextTextBlockUnifiedLayoutSourceNodeV1>()
  let visitedNodeCount = 0
  let emittedItemCount = 0
  let stopped = false
  const visit = (
    node: VNextTextBlockUnifiedLayoutSourceNodeV1,
    start: number,
  ): number | null => {
    if (stopped || input.range.endRenderedUtf16 <= start) return null
    const nodePermit = input.beforeVisit("source-coverage-nodes")
    if (nodePermit == null) { stopped = true; return null }
    const nodeKind = node.nodeKind
    const nodeSummary = node.summary
    const children = nodeKind === "branch" ? node.children : null
    const items = nodeKind === "leaf" ? node.items : null
    if (!input.completeVisit(nodePermit)) { stopped = true; return null }
    if (input.range.startRenderedUtf16 >= start + nodeSummary.renderedUtf16Length) {
      return nodeSummary.renderedUtf16Length
    }
    visitedNodes.add(node)
    visitedNodeCount += 1
    if (nodeKind === "branch" && children != null) {
      let childStart = start
      for (const child of children) {
        if (childStart >= input.range.endRenderedUtf16) break
        const childLength = visit(child, childStart)
        if (stopped) return null
        if (childLength == null) break
        childStart += childLength
      }
      return nodeSummary.renderedUtf16Length
    }
    let itemStart = start
    if (items == null) { stopped = true; return null }
    for (let index = 0; index < items.length; index += 1) {
      if (itemStart >= input.range.endRenderedUtf16) break
      const itemPermit = input.beforeVisit("source-coverage-items")
      if (itemPermit == null) { stopped = true; return null }
      const item = items[index]
      if (!input.completeVisit(itemPermit)) { stopped = true; return null }
      if (item == null) { stopped = true; return null }
      const itemEnd = itemStart + item.renderedUtf16Length
      if (input.range.startRenderedUtf16 < itemEnd && input.range.endRenderedUtf16 > itemStart) {
        emittedItemCount += 1
        fragments.push(Object.freeze({
          item,
          itemAbsoluteStartRenderedUtf16: itemStart,
          itemAbsoluteEndRenderedUtf16: itemEnd,
          selectedAbsoluteStartRenderedUtf16: Math.max(itemStart, input.range.startRenderedUtf16),
          selectedAbsoluteEndRenderedUtf16: Math.min(itemEnd, input.range.endRenderedUtf16),
        }))
      }
      itemStart = itemEnd
    }
    return nodeSummary.renderedUtf16Length
  }
  visit(input.sourceState.root, 0)
  if (stopped) {
    return { status: "limit-exceeded", fragments: null, visitedNodeCount, emittedItemCount, completeTreeTraversalCount: 0 }
  }
  const result: AcceptedTransitionSourceCoverageInternalV1 = Object.freeze({
    status: "accepted",
    fragments: Object.freeze(fragments),
    visitedNodeCount,
    emittedItemCount,
    completeTreeTraversalCount: 0,
  })
  transitionSourceCoverageAuthorities.set(result, {
    sourceState: input.sourceState,
    range: Object.freeze({ ...input.range }),
    visitedNodes,
  })
  return result
}
