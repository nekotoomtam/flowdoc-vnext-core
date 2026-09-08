import type { VNextCreatorPreviewSourceIdentityV1, VNextCreatorPreviewRequestIdentityV1, VNextCreatorPreviewRectPtV1 } from "./layoutV1.js"
import type { VNextCreatorPreviewEngineIdentityV1 } from "./engineV1.js"
import type { VNextCreatorPreviewValueAddressV1 } from "./contentV1.js"
export type CreatorEditReadonlyV1<T> = T extends object ? { readonly [K in keyof T]: CreatorEditReadonlyV1<T[K]> } : T
export interface VNextCreatorTextEditBindingV1 {
  sourceIdentity: VNextCreatorPreviewSourceIdentityV1
  requestIdentity: VNextCreatorPreviewRequestIdentityV1
  engineIdentity: VNextCreatorPreviewEngineIdentityV1
  layoutFingerprint: string
}
export type VNextCreatorTextAddressV1 =
  | { kind: "authored-inline"; sectionId: string; placementId: string; patternId: string; patternDraftId: string; blockId: string; inlineId: string }
  | { kind: "field-value"; occurrenceId: string; inlineId: string; valueAddress: VNextCreatorPreviewValueAddressV1 }
export interface VNextCreatorTextPositionV1 {
  address: VNextCreatorTextAddressV1; offsetUtf16: number; affinity: "upstream" | "downstream"
}
export interface CreatorTextCaretDataV1 extends VNextCreatorTextPositionV1 {
  paragraphOffsetUtf16: number; pageIndex: number; lineIndex: number; xPt: number; yPt: number; heightPt: number
}
export type VNextCreatorTextCaretV1 = CreatorEditReadonlyV1<CreatorTextCaretDataV1>
export interface CreatorTextSpanDataV1 {
  address: VNextCreatorTextAddressV1; startUtf16: number; endUtf16: number
  paragraphStartUtf16: number; paragraphEndUtf16: number; pageIndex: number; lineIndex: number; rectPt: VNextCreatorPreviewRectPtV1
}
export interface CreatorTextGeometryDataV1 {
  boundaryPolicy: "shaping-cluster-edges/1" | "shaping-cluster-and-explicit-break-edges/1"
  selectionPolicy: "logical-cluster-advances/1"
  hitPolicy: "same-page-nearest-line-then-stop/1"
  tieOrder: "line-paragraph-inline-downstream-first/1"
  binding: VNextCreatorTextEditBindingV1
  stops: CreatorTextCaretDataV1[]
  spans: CreatorTextSpanDataV1[]
  pages: { pageIndex: number; widthPt: number; heightPt: number }[]
}
export type VNextCreatorTextEditGeometryV1 = CreatorEditReadonlyV1<CreatorTextGeometryDataV1>
export interface VNextCreatorTextHitPointV1 { pageIndex: number; xPt: number; yPt: number }
export interface VNextCreatorTextHitResultV1 {
  readonly primary: VNextCreatorTextCaretV1
  readonly candidates: readonly VNextCreatorTextCaretV1[]
  readonly ambiguous: boolean
  readonly outsidePage: boolean
  readonly outsideContent: boolean
}
export interface VNextCreatorTextSelectionInputV1 { anchor: VNextCreatorTextPositionV1; focus: VNextCreatorTextPositionV1 }
export interface CreatorTextSelectionDataV1 {
  anchor: CreatorTextCaretDataV1; focus: CreatorTextCaretDataV1; direction: "forward" | "backward" | "none"
  rectangles: { pageIndex: number; lineIndex: number; rectPt: VNextCreatorPreviewRectPtV1; sourceRanges: { address: VNextCreatorTextAddressV1; startUtf16: number; endUtf16: number }[] }[]
}
export type VNextCreatorTextSelectionV1 = CreatorEditReadonlyV1<CreatorTextSelectionDataV1>
