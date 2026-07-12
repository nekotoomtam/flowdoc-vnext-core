import { z } from "zod"
import type { VNextTextBlockV4MeasurementSourcePoint } from "../pagination/textBlockV4Measurement.js"
import type { VNextTablePaginationResultV1 } from "./tablePaginationContractV1.js"

export const VNEXT_TABLE_RENDERER_VERSION = 1 as const
export const VNEXT_TABLE_RENDERER_SOURCE = "vnext-table-renderer-consumption"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const FiniteNumberSchema = z.number().finite()
const NonNegativeFiniteNumberSchema = FiniteNumberSchema.nonnegative()
const ColorSchema = z.string().regex(/^[0-9A-Fa-f]{6}$/)

export const VNextTableRendererPageOriginV1Schema = z.object({
  pageIndex: z.number().int().nonnegative(),
  xPt: FiniteNumberSchema,
  yPt: FiniteNumberSchema,
}).strict()

export const VNextTableRendererBorderStyleV1Schema = z.object({
  style: z.enum(["none", "solid", "dashed", "dotted"]),
  widthPt: NonNegativeFiniteNumberSchema,
  color: ColorSchema,
}).strict().superRefine((value, ctx) => {
  if (value.style === "none" && value.widthPt !== 0) ctx.addIssue({
    code: "custom", path: ["widthPt"], message: "none border style requires zero width",
  })
  if (value.style !== "none" && value.widthPt <= 0) ctx.addIssue({
    code: "custom", path: ["widthPt"], message: "visible border style requires positive width",
  })
})

export const VNextTableRendererStyleProfileV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_RENDERER_VERSION),
  kind: z.literal("table-render-style-profile"),
  profileId: NonBlankIdSchema,
  outerBorder: VNextTableRendererBorderStyleV1Schema,
  internalRowBorder: VNextTableRendererBorderStyleV1Schema,
  internalColumnBorder: VNextTableRendererBorderStyleV1Schema,
  defaultCellBackground: ColorSchema.nullable(),
  rowBackgrounds: z.object({
    header: ColorSchema.nullable(),
    body: ColorSchema.nullable(),
    footer: ColorSchema.nullable(),
    "empty-state": ColorSchema.nullable(),
    "repeated-header": ColorSchema.nullable(),
  }).strict(),
  textColorFallback: ColorSchema,
  missingMediaPolicy: z.enum(["block", "draw-placeholder"]),
}).strict()

export type VNextTableRendererPageOriginV1 = z.infer<typeof VNextTableRendererPageOriginV1Schema>
export type VNextTableRendererBorderStyleV1 = z.infer<typeof VNextTableRendererBorderStyleV1Schema>
export type VNextTableRendererStyleProfileV1 = z.infer<typeof VNextTableRendererStyleProfileV1Schema>

export interface VNextTableRendererProjectionRequestV1 {
  contractVersion: typeof VNEXT_TABLE_RENDERER_VERSION
  kind: "table-renderer-projection-request"
  sectionId: string
  zoneId: string
  expectedPaginationFingerprint: string
  pagination: VNextTablePaginationResultV1
  pageOrigins: unknown
  styleProfile: unknown
}

export interface VNextTableRenderBoundsV1 {
  xPt: number
  yPt: number
  widthPt: number
  heightPt: number
}

interface VNextTableRenderCommandBaseV1 {
  id: string
  pageIndex: number
  sectionId: string
  zoneId: string
  tableId: string
  bounds: VNextTableRenderBoundsV1
}

export interface VNextTableRenderPageCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "page"
  bodyHeightPt: number
  availableHeightPt: number
}

export interface VNextTableRenderSegmentCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "table-segment"
  parentId: string
  styleProfileId: string
  continuesFromPreviousPage: boolean
  continuesOnNextPage: boolean
}

export interface VNextTableRenderCellBackgroundCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "cell-background"
  parentId: string
  rowFragmentId: string
  sourceCellId: string
  color: string
}

export interface VNextTableRenderRowCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "row-fragment"
  parentId: string
  rowFragmentId: string
  rowIndex: number
  rowFragmentIndex: number
  rowKey: string
  rowKind: "authored" | "materialized"
  rowRole: "header" | "body" | "footer" | "empty-state"
  repeatedHeader: boolean
  complete: boolean
}

export interface VNextTableRenderCellCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "cell-fragment"
  parentId: string
  rowFragmentId: string
  sourceCellId: string
  cellIndex: number
  contentUsedHeightPt: number
  contentOffsetYPt: number
  verticalAlign: "top" | "middle" | "bottom"
  complete: boolean
}

interface VNextTableRenderCandidateCommandBaseV1 extends VNextTableRenderCommandBaseV1 {
  parentId: string
  rowFragmentId: string
  sourceCellId: string
  candidateId: string
  nodeId: string
  candidateIndex: number
}

export interface VNextTableRenderTextLineCommandV1 extends VNextTableRenderCandidateCommandBaseV1 {
  kind: "text-line"
  text: string
  color: string
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
}

export interface VNextTableRenderImageCommandV1 extends VNextTableRenderCandidateCommandBaseV1 {
  kind: "image"
  assetId: string | null
  assetOwner: "published-static-media" | "instance-media" | "none"
  align: "left" | "center" | "right"
  placeholder: boolean
}

export interface VNextTableRenderDividerCommandV1 extends VNextTableRenderCandidateCommandBaseV1 {
  kind: "divider"
  color: string
  thicknessPt: number
}

export interface VNextTableRenderSpacerCommandV1 extends VNextTableRenderCandidateCommandBaseV1 {
  kind: "spacer"
}

export interface VNextTableRenderBorderCommandV1 extends VNextTableRenderCommandBaseV1 {
  kind: "border"
  parentId: string
  ownerKind: "table-segment" | "cell-fragment" | "row-fragment"
  semanticRole: "outer" | "internal-column" | "internal-row" | "continuation"
  edge: "top" | "right" | "bottom" | "left"
  style: VNextTableRendererBorderStyleV1
}

export type VNextTableRenderCommandV1 =
  | VNextTableRenderPageCommandV1
  | VNextTableRenderSegmentCommandV1
  | VNextTableRenderCellBackgroundCommandV1
  | VNextTableRenderRowCommandV1
  | VNextTableRenderCellCommandV1
  | VNextTableRenderTextLineCommandV1
  | VNextTableRenderImageCommandV1
  | VNextTableRenderDividerCommandV1
  | VNextTableRenderSpacerCommandV1
  | VNextTableRenderBorderCommandV1

export interface VNextTableRendererIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  pageIndex?: number
  rowFragmentId?: string
  sourceCellId?: string
  candidateId?: string
}

export type VNextTableRendererProjectionResultV1 =
  | {
      source: typeof VNEXT_TABLE_RENDERER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_VERSION
      status: "consumable"
      tableId: string
      sectionId: string
      zoneId: string
      styleProfileId: string
      paginationFingerprint: string
      commands: VNextTableRenderCommandV1[]
      fingerprint: string
      summary: {
        pageCount: number
        segmentCount: number
        rowFragmentCount: number
        cellFragmentCount: number
        candidateCount: number
        borderCount: number
        commandCount: number
      }
      work: {
        pageVisitCount: number
        rowVisitCount: number
        cellVisitCount: number
        candidateVisitCount: number
        borderEmitCount: number
      }
      contracts: {
        authoredDocumentInput: false
        measurementExecution: false
        paginationExecution: false
        relayout: false
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_RENDERER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_VERSION
      status: "blocked"
      tableId: string
      commands: null
      issues: VNextTableRendererIssueV1[]
    }
