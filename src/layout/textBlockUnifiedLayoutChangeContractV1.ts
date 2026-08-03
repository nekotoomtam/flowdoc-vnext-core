import type { VNextAuthoredBoxPlanV1 } from "../renderer/authoredBoxContractV1.js"
import type {
  ImageFrameV4Target,
  InlineImageV4Target,
} from "../schema/documentV4ImageTarget.js"
import type { TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type {
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_SOURCE =
  "vnext-text-block-unified-layout-change-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_VERSION = 1 as const

export type VNextTextBlockUnifiedLayoutChangeKindV1 =
  | "no-op"
  | "text-insertion"
  | "text-deletion"
  | "text-replacement"
  | "resolved-field-rendered-value-change"
  | "supported-style-change"
  | "inline-image-insertion"
  | "inline-image-deletion"
  | "inline-image-movement"
  | "image-frame-resize"
  | "image-vertical-alignment-change"
  | "image-paint-fact-change"
  | "exclusion-insertion"
  | "exclusion-deletion"
  | "exclusion-movement"
  | "exclusion-resize"
  | "authored-box-width-inset-change"

/** Closed 5B-2 preflight classification; V1 remains frozen for Attempt V1. */
export type VNextTextBlockUnifiedLayoutEffectClassV2 =
  | "true-no-op"
  | "semantic-only"
  | "paint-only"
  | "equal-metric"
  | "metric-affecting"

export interface VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_SOURCE
  readonly contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_VERSION
  readonly kind: VNextTextBlockUnifiedLayoutChangeKindV1
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly expectedPreviousRootFingerprint: string
  readonly expectedPreviousSourceFingerprint: string
}

export interface VNextTextBlockSourceRangeV1 {
  readonly startRenderedUtf16: number
  readonly endRenderedUtf16: number
}

export interface VNextTextBlockSourceIdentityV1 {
  readonly lineageId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
}

export interface VNextTextBlockNoOpChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "no-op"
}

export interface VNextTextBlockTextInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-insertion"
  readonly atRenderedUtf16: number
  readonly insertedText: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}

export interface VNextTextBlockTextDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-deletion"
  readonly removedRange: VNextTextBlockSourceRangeV1
  readonly expectedRemovedContentFingerprint: string
  readonly expectedRemovedSourceFingerprint: string
  readonly expectedRemovedProvenanceFingerprint: string
}

export interface VNextTextBlockTextReplacementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-replacement"
  readonly removedRange: VNextTextBlockSourceRangeV1
  readonly expectedRemovedContentFingerprint: string
  readonly expectedRemovedSourceFingerprint: string
  readonly expectedRemovedProvenanceFingerprint: string
  readonly insertedText: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}

export interface VNextTextBlockResolvedFieldValueChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "resolved-field-rendered-value-change"
  readonly inlineId: string
  readonly fieldKey: string
  readonly expectedPreviousRenderedValueFingerprint: string
  readonly nextRenderedText: string
  readonly nextSource: VNextTextBlockSourceIdentityV1
}

export interface VNextTextBlockSupportedStyleChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "supported-style-change"
  readonly range: VNextTextBlockSourceRangeV1
  readonly expectedPreviousStyleFingerprint: string
  readonly expectedPreviousStyleProvenanceFingerprint: string
  readonly nextStyle: TextRunStyleV4Target
  readonly nextStyleFingerprint: string
  readonly nextStyleProvenanceFingerprint: string
}

export interface VNextTextBlockInlineImageInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-insertion"
  readonly atRenderedUtf16: number
  readonly inlineImage: InlineImageV4Target
  readonly resolvedAssetId: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
}

export interface VNextTextBlockInlineImageDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-deletion"
  readonly inlineId: string
  readonly expectedRenderedUtf16: number
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
}

export interface VNextTextBlockInlineImageMovementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-movement"
  readonly inlineId: string
  readonly fromRenderedUtf16: number
  readonly toRenderedUtf16AfterRemoval: number
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
}

export interface VNextTextBlockImageFrameResizeChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-frame-resize"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextWidth: ImageFrameV4Target["width"]
  readonly nextHeight: ImageFrameV4Target["height"]
}

export interface VNextTextBlockImageVerticalAlignmentChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-vertical-alignment-change"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextVerticalAlign: InlineImageV4Target["verticalAlign"]
}

export interface VNextTextBlockImagePaintFactChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-paint-fact-change"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextFit: ImageFrameV4Target["fit"]
  readonly nextCrop: NonNullable<ImageFrameV4Target["crop"]> | null
}

export interface VNextTextBlockExclusionInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-insertion"
  readonly entry: VNextTextBlockSyntheticPositionedObjectInputV1
}

export interface VNextTextBlockExclusionDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-deletion"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
}

export interface VNextTextBlockExclusionMovementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-movement"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
  readonly nextXLayoutUnit: number
  readonly nextYLayoutUnit: number
}

export interface VNextTextBlockExclusionResizeChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-resize"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
  readonly nextWidthLayoutUnit: number
  readonly nextHeightLayoutUnit: number
}

export interface VNextTextBlockAuthoredBoxWidthInsetChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "authored-box-width-inset-change"
  readonly expectedAuthoredBoxPlanFingerprint: string
  readonly nextAuthoredBoxPlan: VNextAuthoredBoxPlanV1
}

export type VNextTextBlockUnifiedLayoutChangeV1 =
  | VNextTextBlockNoOpChangeV1
  | VNextTextBlockTextInsertionChangeV1
  | VNextTextBlockTextDeletionChangeV1
  | VNextTextBlockTextReplacementChangeV1
  | VNextTextBlockResolvedFieldValueChangeV1
  | VNextTextBlockSupportedStyleChangeV1
  | VNextTextBlockInlineImageInsertionChangeV1
  | VNextTextBlockInlineImageDeletionChangeV1
  | VNextTextBlockInlineImageMovementChangeV1
  | VNextTextBlockImageFrameResizeChangeV1
  | VNextTextBlockImageVerticalAlignmentChangeV1
  | VNextTextBlockImagePaintFactChangeV1
  | VNextTextBlockExclusionInsertionChangeV1
  | VNextTextBlockExclusionDeletionChangeV1
  | VNextTextBlockExclusionMovementChangeV1
  | VNextTextBlockExclusionResizeChangeV1
  | VNextTextBlockAuthoredBoxWidthInsetChangeV1
