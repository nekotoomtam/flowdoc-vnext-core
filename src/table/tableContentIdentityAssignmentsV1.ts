import { z } from "zod"
import { VNextDerivedIdentityProvenanceV1Schema } from "../identity/identityStandardV1.js"

export const VNEXT_TABLE_CONTENT_IDENTITY_ASSIGNMENTS_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableContentNodeIdentityAssignmentV1Schema = z.object({
  sourceNodeId: NonBlankIdSchema,
  node: VNextDerivedIdentityProvenanceV1Schema,
  inlines: z.record(NonBlankIdSchema, VNextDerivedIdentityProvenanceV1Schema),
}).strict().superRefine((assignment, ctx) => {
  Object.entries(assignment.inlines).forEach(([sourceInlineId, provenance]) => {
    const provenanceSourceInlineId = provenance.origin.refs.sourceInlineId
    if (provenanceSourceInlineId != null && provenanceSourceInlineId !== sourceInlineId) ctx.addIssue({
      code: "custom",
      path: ["inlines", sourceInlineId, "origin", "refs", "sourceInlineId"],
      message: "inline assignment record key must equal provenance sourceInlineId",
    })
  })
})

export const VNextTableContentCellIdentityAssignmentV1Schema = z.object({
  sourceCellId: NonBlankIdSchema,
  nodes: z.record(NonBlankIdSchema, VNextTableContentNodeIdentityAssignmentV1Schema),
}).strict().superRefine((assignment, ctx) => {
  Object.entries(assignment.nodes).forEach(([sourceNodeId, node]) => {
    if (sourceNodeId !== node.sourceNodeId) ctx.addIssue({
      code: "custom",
      path: ["nodes", sourceNodeId, "sourceNodeId"],
      message: "node assignment record key must equal sourceNodeId",
    })
  })
})

export const VNextTableContentRowIdentityAssignmentV1Schema = z.object({
  rowInstanceId: NonBlankIdSchema,
  cells: z.record(NonBlankIdSchema, VNextTableContentCellIdentityAssignmentV1Schema),
}).strict().superRefine((assignment, ctx) => {
  Object.entries(assignment.cells).forEach(([sourceCellId, cell]) => {
    if (sourceCellId !== cell.sourceCellId) ctx.addIssue({
      code: "custom",
      path: ["cells", sourceCellId, "sourceCellId"],
      message: "cell assignment record key must equal sourceCellId",
    })
  })
})

export const VNextTableContentIdentityAssignmentsV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CONTENT_IDENTITY_ASSIGNMENTS_VERSION),
  kind: z.literal("table-content-identity-assignments"),
  rows: z.array(VNextTableContentRowIdentityAssignmentV1Schema),
}).strict().superRefine((assignments, ctx) => {
  const rowIds = new Set<string>()
  assignments.rows.forEach((row, index) => {
    if (rowIds.has(row.rowInstanceId)) ctx.addIssue({
      code: "custom",
      path: ["rows", index, "rowInstanceId"],
      message: `duplicate row content identity assignment "${row.rowInstanceId}"`,
    })
    rowIds.add(row.rowInstanceId)
  })
})

export type VNextTableContentNodeIdentityAssignmentV1 = z.infer<
  typeof VNextTableContentNodeIdentityAssignmentV1Schema
>
export type VNextTableContentCellIdentityAssignmentV1 = z.infer<
  typeof VNextTableContentCellIdentityAssignmentV1Schema
>
export type VNextTableContentRowIdentityAssignmentV1 = z.infer<
  typeof VNextTableContentRowIdentityAssignmentV1Schema
>
export type VNextTableContentIdentityAssignmentsV1 = z.infer<
  typeof VNextTableContentIdentityAssignmentsV1Schema
>
