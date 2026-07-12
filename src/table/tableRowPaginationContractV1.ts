import { z } from "zod"
import { VNextTableCellCursorV1Schema, type VNextTableCellCandidatePlacementV1 } from "./tableCellPaginationContractV1.js"

export const VNEXT_TABLE_ROW_PAGINATION_VERSION = 1 as const
export const VNEXT_TABLE_ROW_PAGINATION_SOURCE = "vnext-table-row-pagination"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableRowCursorIdentityV1Schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("resolved-row"), rowInstanceId: NonBlankIdSchema }).strict(),
  z.object({ kind: z.literal("authored-row"), sourceRowId: NonBlankIdSchema }).strict(),
])

export const VNextTableRowCursorV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_ROW_PAGINATION_VERSION),
  kind: z.literal("table-row-cursor"),
  rowIndex: z.number().int().nonnegative(),
  rowIdentity: VNextTableRowCursorIdentityV1Schema,
  fragmentIndex: z.number().int().nonnegative(),
  complete: z.boolean(),
  cells: z.array(VNextTableCellCursorV1Schema).min(1),
}).strict()

export type VNextTableRowCursorIdentityV1 = z.infer<typeof VNextTableRowCursorIdentityV1Schema>
export type VNextTableRowCursorV1 = z.infer<typeof VNextTableRowCursorV1Schema>

export interface VNextTableRowCellFragmentPlanV1 {
  sourceCellId: string
  cellIndex: number
  xOffsetPt: number
  outerWidthPt: number
  usedHeightPt: number
  complete: boolean
  placements: VNextTableCellCandidatePlacementV1[]
}

export interface VNextTableRowPaginationIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  rowIndex: number
  sourceCellId?: string
}

export type VNextTableRowPlanResultV1 =
  | {
      source: typeof VNEXT_TABLE_ROW_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_ROW_PAGINATION_VERSION
      status: "planned"
      rowIndex: number
      cursorBefore: VNextTableRowCursorV1
      cursorAfter: VNextTableRowCursorV1
      cells: VNextTableRowCellFragmentPlanV1[]
      usedHeightPt: number
      remainingHeightPt: number
      complete: boolean
      progressed: boolean
      needsFreshPage: boolean
      continuationReason:
        | "complete"
        | "page-full"
        | "keep-move-whole"
        | "minimum-height-move"
        | "fresh-page-required"
        | "already-complete"
      work: {
        cellPlanCount: number
        checkpointLookupCount: number
        consumedCandidateCount: number
      }
      contracts: { cellCursorCommit: "atomic"; measurementExecution: false }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_ROW_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_ROW_PAGINATION_VERSION
      status: "blocked"
      rowIndex: number
      cursorBefore: VNextTableRowCursorV1
      cursorAfter: null
      cells: null
      issues: VNextTableRowPaginationIssueV1[]
    }
