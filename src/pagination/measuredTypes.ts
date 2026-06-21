import type { AuthoredNode, ZoneRole } from "../schema/document.js"
import type { NodeId, SectionId } from "../graph/relationshipGraph.js"
import type {
  VNextPageBox,
  VNextPaginationPlan,
  VNextPaginationSplitPolicy,
} from "./paginationPlan.js"
import type {
  VNextTextMeasurementCache,
  VNextTextMeasurer,
} from "./textMeasurement.js"

export type FieldValue = string | number | boolean | null

export interface VNextMeasuredPaginationOptions {
  textMeasurer?: VNextTextMeasurer
  measurementCache?: VNextTextMeasurementCache
  measurementProfileId?: string
  data?: Record<string, FieldValue>
}

export interface VNextMeasuredPaginationWarning {
  code:
    | "forced-overflow"
    | "missing-source-item"
    | "static-zone-overflow"
    | "page-break-in-static-zone-ignored"
    | "page-break-in-columns-ignored"
    | "page-break-in-table-cell-ignored"
    | "toc-page-resolution-pending"
    | "table-row-forced-overflow"
  sectionId: SectionId
  nodeId: NodeId
  pageIndex?: number
  message: string
}

export type VNextMeasuredFragmentKind =
  | "text"
  | "block"
  | "generated"
  | "forced-break"
  | "container"

export interface VNextMeasuredFragment {
  id: string
  sourceItemId: string
  sectionId: SectionId
  zoneId: NodeId
  zoneRole: ZoneRole
  nodeId: NodeId
  nodeType: AuthoredNode["type"]
  kind: VNextMeasuredFragmentKind
  pageIndex: number
  pageNumber: number
  xPt: number
  yPt: number
  widthPt: number
  heightPt: number
  sourceOrder: number
  splitPolicy: VNextPaginationSplitPolicy
  text?: string
  lineStart?: number
  lineEnd?: number
  continuesFromPreviousPage?: boolean
  continuesOnNextPage?: boolean
  metadata?: Record<string, string | number | boolean | null>
}

export type VNextMeasuredFragmentExtra = Partial<Pick<
  VNextMeasuredFragment,
  "text" | "lineStart" | "lineEnd" | "continuesFromPreviousPage" | "continuesOnNextPage" | "metadata"
>>

export interface VNextMeasuredFragmentGeometry {
  xPt: number
  yPt: number
  widthPt: number
  heightPt: number
}

export interface VNextMeasuredPage {
  pageIndex: number
  sectionId: SectionId
  sectionPageIndex: number
  pageNumber: number
  pageBox: VNextPageBox
  fragments: VNextMeasuredFragment[]
  bodyFragmentIds: string[]
  headerFooterFragmentIds: string[]
}

export interface VNextMeasuredPagination {
  documentId: string
  source: "vnext-pagination-plan"
  status: "measured-skeleton"
  measurementStatus: "measured"
  paginationPlan: VNextPaginationPlan
  pages: VNextMeasuredPage[]
  pageCount: number
  warnings: VNextMeasuredPaginationWarning[]
}
