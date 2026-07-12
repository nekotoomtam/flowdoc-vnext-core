import { z } from "zod"
import type { VNextTablePreparedCellCandidateV1 } from "./tablePreparedCellContractV1.js"

export const VNEXT_TABLE_CELL_PAGINATION_VERSION = 1 as const
export const VNEXT_TABLE_CELL_PAGINATION_SOURCE = "vnext-table-cell-pagination"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableCellCursorIdentityV1Schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("resolved-cell"), cellInstanceId: NonBlankIdSchema }).strict(),
  z.object({ kind: z.literal("authored-cell"), sourceCellId: NonBlankIdSchema }).strict(),
])

export const VNextTableCellCursorV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CELL_PAGINATION_VERSION),
  kind: z.literal("table-cell-cursor"),
  sourceCellId: NonBlankIdSchema,
  cellIdentity: VNextTableCellCursorIdentityV1Schema,
  candidateIndex: z.number().int().nonnegative(),
  complete: z.boolean(),
}).strict()

export type VNextTableCellCursorIdentityV1 = z.infer<typeof VNextTableCellCursorIdentityV1Schema>
export type VNextTableCellCursorV1 = z.infer<typeof VNextTableCellCursorV1Schema>

export interface VNextTableCellCandidatePlacementV1 {
  candidate: VNextTablePreparedCellCandidateV1
  yOffsetPt: number
}

export interface VNextTableCellPaginationIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  sourceCellId: string
  candidateId?: string
}

export type VNextTableCellPlanResultV1 =
  | {
      source: typeof VNEXT_TABLE_CELL_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_CELL_PAGINATION_VERSION
      status: "planned"
      sourceCellId: string
      cursorBefore: VNextTableCellCursorV1
      cursorAfter: VNextTableCellCursorV1
      placements: VNextTableCellCandidatePlacementV1[]
      usedHeightPt: number
      remainingHeightPt: number
      complete: boolean
      progressed: boolean
      needsFreshPage: boolean
      continuationReason: "complete" | "page-full" | "fresh-page-required" | "already-complete"
      work: { checkpointLookupCount: number; consumedCandidateCount: number }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_CELL_PAGINATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_CELL_PAGINATION_VERSION
      status: "blocked"
      sourceCellId: string
      cursorBefore: VNextTableCellCursorV1
      cursorAfter: null
      placements: null
      issues: VNextTableCellPaginationIssueV1[]
    }
