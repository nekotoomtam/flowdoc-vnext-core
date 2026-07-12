import { z } from "zod"
import {
  VNextPublishedStructureVersionRefV1Schema,
  VNextStructureDefinitionDraftRefV1Schema,
} from "../lifecycle/structureIdentity.js"

export const VNEXT_TABLE_DEFINITION_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableDefinitionOwnerV1Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("structure-draft"),
    ref: VNextStructureDefinitionDraftRefV1Schema,
  }).strict(),
  z.object({
    kind: z.literal("published-structure-version"),
    ref: VNextPublishedStructureVersionRefV1Schema,
  }).strict(),
])

export const VNextTableRowRoleV1Schema = z.enum(["header", "body", "footer", "empty-state"])
export const VNextTableRowBreakPolicyV1Schema = z.enum(["allow", "prefer-keep", "strict-keep"])
export const VNextTableHeaderPolicyV1Schema = z.enum(["no-repeat", "repeat-leading-headers"])

export const VNextTableColumnDefinitionV1Schema = z.object({
  columnId: NonBlankIdSchema,
  widthShare: z.number().finite().positive().max(100),
}).strict()

export const VNextTableCellPlacementV1Schema = z.object({
  cellId: NonBlankIdSchema,
  columnStart: z.number().int().nonnegative(),
  colSpan: z.number().int().positive(),
  rowSpan: z.number().int().positive().default(1),
}).strict()

export const VNextTableRowTemplateV1Schema = z.object({
  rowTemplateId: NonBlankIdSchema,
  sourceRowId: NonBlankIdSchema,
  breakPolicy: VNextTableRowBreakPolicyV1Schema,
  minHeightPt: z.number().finite().nonnegative().optional(),
  cells: z.array(VNextTableCellPlacementV1Schema).min(1),
}).strict()

export const VNextTableEmptyPolicyV1Schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("header-only") }).strict(),
  z.object({
    kind: z.literal("empty-row"),
    rowTemplateId: NonBlankIdSchema,
  }).strict(),
  z.object({ kind: z.literal("hide-table") }).strict(),
])

export const VNextTableRowSourceV1Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("static-row"),
    rowSourceId: NonBlankIdSchema,
    rowTemplateId: NonBlankIdSchema,
    role: VNextTableRowRoleV1Schema,
  }).strict(),
  z.object({
    kind: z.literal("collection-rows"),
    rowSourceId: NonBlankIdSchema,
    collectionFieldKey: NonBlankIdSchema,
    rowTemplateId: NonBlankIdSchema,
    role: z.literal("body"),
    emptyPolicy: VNextTableEmptyPolicyV1Schema,
  }).strict(),
])

export const VNextTableDefinitionV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_DEFINITION_CONTRACT_VERSION),
  kind: z.literal("table-definition"),
  tableDefinitionId: NonBlankIdSchema,
  owner: VNextTableDefinitionOwnerV1Schema,
  tableId: NonBlankIdSchema,
  headerPolicy: VNextTableHeaderPolicyV1Schema,
  columns: z.array(VNextTableColumnDefinitionV1Schema).min(1),
  rowSources: z.array(VNextTableRowSourceV1Schema).min(1),
  rowTemplates: z.record(NonBlankIdSchema, VNextTableRowTemplateV1Schema),
}).strict().superRefine((definition, ctx) => {
  const columnIds = new Set<string>()
  definition.columns.forEach((column, index) => {
    if (columnIds.has(column.columnId)) ctx.addIssue({
      code: "custom",
      path: ["columns", index, "columnId"],
      message: `duplicate table column id "${column.columnId}"`,
    })
    columnIds.add(column.columnId)
  })
  const widthTotal = definition.columns.reduce((total, column) => total + column.widthShare, 0)
  if (Math.abs(widthTotal - 100) > 0.000001) ctx.addIssue({
    code: "custom",
    path: ["columns"],
    message: `table column width shares must total 100; got ${widthTotal}`,
  })

  Object.entries(definition.rowTemplates).forEach(([key, template]) => {
    const templatePath = ["rowTemplates", key] as PropertyKey[]
    if (key !== template.rowTemplateId) ctx.addIssue({
      code: "custom",
      path: [...templatePath, "rowTemplateId"],
      message: "row template record key must equal rowTemplateId",
    })

    const cellIds = new Set<string>()
    let expectedStart = 0
    template.cells.forEach((cell, cellIndex) => {
      const cellPath = [...templatePath, "cells", cellIndex]
      if (cellIds.has(cell.cellId)) ctx.addIssue({
        code: "custom",
        path: [...cellPath, "cellId"],
        message: `duplicate cell id "${cell.cellId}" in row template`,
      })
      cellIds.add(cell.cellId)

      if (cell.rowSpan !== 1) ctx.addIssue({
        code: "custom",
        path: [...cellPath, "rowSpan"],
        message: "table definition v1 reserves rowSpan but accepts only 1",
      })
      if (cell.columnStart < expectedStart) ctx.addIssue({
        code: "custom",
        path: [...cellPath, "columnStart"],
        message: `cell overlaps occupied columns before ${expectedStart}`,
      })
      if (cell.columnStart > expectedStart) ctx.addIssue({
        code: "custom",
        path: [...cellPath, "columnStart"],
        message: `cell leaves an occupancy gap before column ${cell.columnStart}`,
      })
      expectedStart = Math.max(expectedStart, cell.columnStart + cell.colSpan)
    })
    if (expectedStart !== definition.columns.length) ctx.addIssue({
      code: "custom",
      path: [...templatePath, "cells"],
      message: `row occupancy must end at column count ${definition.columns.length}; got ${expectedStart}`,
    })
  })

  const sourceIds = new Set<string>()
  const staticRows = new Set<string>()
  let foundNonHeader = false
  let leadingHeaderCount = 0
  definition.rowSources.forEach((source, index) => {
    const sourcePath = ["rowSources", index] as PropertyKey[]
    if (sourceIds.has(source.rowSourceId)) ctx.addIssue({
      code: "custom",
      path: [...sourcePath, "rowSourceId"],
      message: `duplicate row source id "${source.rowSourceId}"`,
    })
    sourceIds.add(source.rowSourceId)

    if (definition.rowTemplates[source.rowTemplateId] == null) ctx.addIssue({
      code: "custom",
      path: [...sourcePath, "rowTemplateId"],
      message: `row source references missing template "${source.rowTemplateId}"`,
    })

    if (source.kind === "static-row") {
      const template = definition.rowTemplates[source.rowTemplateId]
      if (template != null && staticRows.has(template.sourceRowId)) ctx.addIssue({
        code: "custom",
        path: [...sourcePath, "rowTemplateId"],
        message: `authored row "${template.sourceRowId}" is used by more than one static row source`,
      })
      if (template != null) staticRows.add(template.sourceRowId)
    } else if (source.emptyPolicy.kind === "empty-row") {
      if (definition.rowTemplates[source.emptyPolicy.rowTemplateId] == null) ctx.addIssue({
        code: "custom",
        path: [...sourcePath, "emptyPolicy", "rowTemplateId"],
        message: `empty policy references missing template "${source.emptyPolicy.rowTemplateId}"`,
      })
      if (source.emptyPolicy.rowTemplateId === source.rowTemplateId) ctx.addIssue({
        code: "custom",
        path: [...sourcePath, "emptyPolicy", "rowTemplateId"],
        message: "empty-state row template must differ from the collection body row template",
      })
    }

    if (source.kind === "static-row" && source.role === "header") {
      if (foundNonHeader) ctx.addIssue({
        code: "custom",
        path: [...sourcePath, "role"],
        message: "header row sources must be a leading contiguous group",
      })
      leadingHeaderCount += 1
    } else {
      foundNonHeader = true
    }
  })

  if (definition.headerPolicy === "repeat-leading-headers" && leadingHeaderCount === 0) ctx.addIssue({
    code: "custom",
    path: ["headerPolicy"],
    message: "repeat-leading-headers requires at least one leading header row source",
  })
})

export type VNextTableDefinitionOwnerV1 = z.infer<typeof VNextTableDefinitionOwnerV1Schema>
export type VNextTableRowRoleV1 = z.infer<typeof VNextTableRowRoleV1Schema>
export type VNextTableRowBreakPolicyV1 = z.infer<typeof VNextTableRowBreakPolicyV1Schema>
export type VNextTableColumnDefinitionV1 = z.infer<typeof VNextTableColumnDefinitionV1Schema>
export type VNextTableCellPlacementV1 = z.infer<typeof VNextTableCellPlacementV1Schema>
export type VNextTableRowTemplateV1 = z.infer<typeof VNextTableRowTemplateV1Schema>
export type VNextTableEmptyPolicyV1 = z.infer<typeof VNextTableEmptyPolicyV1Schema>
export type VNextTableRowSourceV1 = z.infer<typeof VNextTableRowSourceV1Schema>
export type VNextTableDefinitionV1 = z.infer<typeof VNextTableDefinitionV1Schema>

export interface VNextTableDefinitionIssue {
  code: string
  message: string
  path: string
  severity: "error"
}

export type VNextTableDefinitionParseResult =
  | { ok: true; definition: VNextTableDefinitionV1; issues: [] }
  | { ok: false; reason: "invalid-table-definition"; issues: VNextTableDefinitionIssue[] }

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

export function safeParseVNextTableDefinitionV1(value: unknown): VNextTableDefinitionParseResult {
  const result = VNextTableDefinitionV1Schema.safeParse(value)
  if (!result.success) return {
    ok: false,
    reason: "invalid-table-definition",
    issues: result.error.issues.map((item) => ({
      code: item.code,
      message: item.message,
      path: formatIssuePath(item.path),
      severity: "error",
    })),
  }
  return { ok: true, definition: result.data, issues: [] }
}

export function tableRowBreakPolicyFromAuthoredAllowBreakV1(
  allowBreak: boolean | undefined,
): VNextTableRowBreakPolicyV1 {
  if (allowBreak === true) return "allow"
  if (allowBreak === false) return "strict-keep"
  return "prefer-keep"
}
