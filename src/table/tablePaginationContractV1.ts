import { z } from "zod"
import { VNextTableRowCursorV1Schema, type VNextTableRowCellFragmentPlanV1 } from "./tableRowPaginationContractV1.js"

export const VNEXT_TABLE_PAGINATION_VERSION = 1 as const
export const VNEXT_TABLE_PAGINATION_SOURCE = "vnext-table-pagination"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTablePaginationCursorV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_PAGINATION_VERSION),
  kind: z.literal("table-pagination-cursor"),
  tableId: NonBlankIdSchema,
  rowIndex: z.number().int().nonnegative(),
  activeRow: VNextTableRowCursorV1Schema.nullable(),
  complete: z.boolean(),
}).strict()

export type VNextTablePaginationCursorV1 = z.infer<typeof VNextTablePaginationCursorV1Schema>

export interface VNextTablePageRowFragmentV1 {
  fragmentId: string
  rowIndex: number
  rowFragmentIndex: number
  rowKind: "authored" | "materialized"
  rowKey: string
  repeatedHeader: false
  yOffsetPt: number
  heightPt: number
  complete: boolean
  cells: VNextTableRowCellFragmentPlanV1[]
}

export interface VNextTablePageV1 {
  pageIndex: number
  bodyHeightPt: number
  availableHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  rows: VNextTablePageRowFragmentV1[]
}

export interface VNextTablePaginationIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  tableId: string
  rowIndex?: number
}

export type VNextTablePaginationResultV1 =
  | {
      source: typeof VNEXT_TABLE_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_PAGINATION_VERSION
      status: "paginated"
      tableId: string
      cursorBefore: VNextTablePaginationCursorV1
      cursorAfter: VNextTablePaginationCursorV1
      pages: VNextTablePageV1[]
      fingerprint: string
      summary: {
        pageCount: number
        rowFragmentCount: number
        completedRowCount: number
        splitRowCount: number
        maximumUsedPageHeightPt: number
      }
      work: {
        pageAttemptCount: number
        rowPlanCount: number
        cellPlanCount: number
        checkpointLookupCount: number
        consumedCandidateCount: number
        freshPageAdvanceCount: number
      }
      contracts: {
        measurementExecution: false
        preparedInputMutation: false
        rowCursorCommit: "atomic"
        repeatedHeaders: "not-run"
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_PAGINATION_VERSION
      status: "blocked"
      tableId: string
      cursorBefore: VNextTablePaginationCursorV1
      cursorAfter: null
      pages: null
      issues: VNextTablePaginationIssueV1[]
    }
