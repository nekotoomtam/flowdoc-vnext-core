import { z } from "zod"
import { VNextTableDefinitionV1Schema } from "./tableDefinitionV1.js"

export const VNEXT_TABLE_CELL_GEOMETRY_VERSION = 1 as const
export const VNEXT_TABLE_CELL_GEOMETRY_SOURCE = "vnext-table-cell-geometry"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableCellInsetsPtV1Schema = z.object({
  top: z.number().finite().nonnegative(),
  right: z.number().finite().nonnegative(),
  bottom: z.number().finite().nonnegative(),
  left: z.number().finite().nonnegative(),
}).strict()

export const VNextTableCellLayoutProfileV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CELL_GEOMETRY_VERSION),
  kind: z.literal("table-cell-layout-profile"),
  layoutProfileId: NonBlankIdSchema,
  defaultInsetsPt: VNextTableCellInsetsPtV1Schema,
  insetsByRowTemplate: z.record(
    NonBlankIdSchema,
    z.record(NonBlankIdSchema, VNextTableCellInsetsPtV1Schema),
  ).default({}),
}).strict()

export const VNextTableCellGeometryRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CELL_GEOMETRY_VERSION),
  kind: z.literal("table-cell-geometry-request"),
  definition: VNextTableDefinitionV1Schema,
  tableContentWidthPt: z.number().finite().positive(),
  layoutProfile: VNextTableCellLayoutProfileV1Schema,
}).strict()

export type VNextTableCellInsetsPtV1 = z.infer<typeof VNextTableCellInsetsPtV1Schema>
export type VNextTableCellLayoutProfileV1 = z.infer<typeof VNextTableCellLayoutProfileV1Schema>
export type VNextTableCellGeometryRequestV1 = z.infer<typeof VNextTableCellGeometryRequestV1Schema>

export interface VNextTableColumnGeometryV1 {
  columnId: string
  columnIndex: number
  widthShare: number
  xOffsetPt: number
  widthPt: number
}

export interface VNextTableCellGeometryV1 {
  sourceCellId: string
  columnStart: number
  colSpan: number
  rowSpan: 1
  xOffsetPt: number
  outerWidthPt: number
  insetsPt: VNextTableCellInsetsPtV1
  contentWidthPt: number
  fingerprint: string
}

export interface VNextTableCellGeometryIssue {
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextTableCellGeometryResultV1 =
  | {
      source: typeof VNEXT_TABLE_CELL_GEOMETRY_SOURCE
      contractVersion: typeof VNEXT_TABLE_CELL_GEOMETRY_VERSION
      status: "ready"
      geometry: {
        tableDefinitionId: string
        tableId: string
        layoutProfileId: string
        tableContentWidthPt: number
        columns: VNextTableColumnGeometryV1[]
        rowTemplates: Record<string, { rowTemplateId: string; cells: VNextTableCellGeometryV1[] }>
        fingerprint: string
      }
      work: { columnCount: number; rowTemplateCount: number; cellCount: number }
      execution: { measurement: "not-run"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_CELL_GEOMETRY_SOURCE
      contractVersion: typeof VNEXT_TABLE_CELL_GEOMETRY_VERSION
      status: "blocked"
      geometry: null
      issues: VNextTableCellGeometryIssue[]
    }

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(code: string, path: string, message: string): VNextTableCellGeometryIssue {
  return { code, path, message, severity: "error" }
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function blocked(issues: VNextTableCellGeometryIssue[]): VNextTableCellGeometryResultV1 {
  return {
    source: VNEXT_TABLE_CELL_GEOMETRY_SOURCE,
    contractVersion: VNEXT_TABLE_CELL_GEOMETRY_VERSION,
    status: "blocked",
    geometry: null,
    issues,
  }
}

export function createVNextTableCellGeometryV1(value: unknown): VNextTableCellGeometryResultV1 {
  const parsed = VNextTableCellGeometryRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => issue(
    item.code,
    formatIssuePath(item.path),
    item.message,
  )))
  const request = parsed.data
  const issues: VNextTableCellGeometryIssue[] = []

  Object.entries(request.layoutProfile.insetsByRowTemplate).forEach(([rowTemplateId, cells]) => {
    const template = request.definition.rowTemplates[rowTemplateId]
    if (template == null) {
      issues.push(issue(
        "unknown-inset-row-template",
        `layoutProfile.insetsByRowTemplate.${rowTemplateId}`,
        `inset overrides reference unknown row template "${rowTemplateId}"`,
      ))
      return
    }
    const knownCells = new Set(template.cells.map((cell) => cell.cellId))
    Object.keys(cells).forEach((cellId) => {
      if (!knownCells.has(cellId)) issues.push(issue(
        "unknown-inset-cell",
        `layoutProfile.insetsByRowTemplate.${rowTemplateId}.${cellId}`,
        `inset override references cell "${cellId}" outside row template "${rowTemplateId}"`,
      ))
    })
  })
  if (issues.length > 0) return blocked(issues)

  const columns: VNextTableColumnGeometryV1[] = []
  let xOffsetPt = 0
  request.definition.columns.forEach((column, columnIndex) => {
    const widthPt = columnIndex === request.definition.columns.length - 1
      ? roundPt(request.tableContentWidthPt - xOffsetPt)
      : roundPt(request.tableContentWidthPt * (column.widthShare / 100))
    columns.push({
      columnId: column.columnId,
      columnIndex,
      widthShare: column.widthShare,
      xOffsetPt: roundPt(xOffsetPt),
      widthPt,
    })
    xOffsetPt = roundPt(xOffsetPt + widthPt)
  })

  let cellCount = 0
  const rowTemplates: Record<string, { rowTemplateId: string; cells: VNextTableCellGeometryV1[] }> = {}
  Object.entries(request.definition.rowTemplates).forEach(([rowTemplateId, template]) => {
    const cells = template.cells.map((placement, cellIndex): VNextTableCellGeometryV1 => {
      const firstColumn = columns[placement.columnStart]
      const lastColumn = columns[placement.columnStart + placement.colSpan - 1]
      const outerWidthPt = roundPt(lastColumn.xOffsetPt + lastColumn.widthPt - firstColumn.xOffsetPt)
      const insetsPt = request.layoutProfile.insetsByRowTemplate[rowTemplateId]?.[placement.cellId]
        ?? request.layoutProfile.defaultInsetsPt
      const contentWidthPt = roundPt(outerWidthPt - insetsPt.left - insetsPt.right)
      if (contentWidthPt <= 0) issues.push(issue(
        "non-positive-cell-content-width",
        `definition.rowTemplates.${rowTemplateId}.cells[${cellIndex}]`,
        `cell "${placement.cellId}" insets leave content width ${contentWidthPt}`,
      ))
      cellCount += 1
      return {
        sourceCellId: placement.cellId,
        columnStart: placement.columnStart,
        colSpan: placement.colSpan,
        rowSpan: 1,
        xOffsetPt: firstColumn.xOffsetPt,
        outerWidthPt,
        insetsPt: { ...insetsPt },
        contentWidthPt,
        fingerprint: JSON.stringify([
          request.definition.tableDefinitionId,
          rowTemplateId,
          placement.cellId,
          placement.columnStart,
          placement.colSpan,
          outerWidthPt,
          insetsPt.top,
          insetsPt.right,
          insetsPt.bottom,
          insetsPt.left,
          contentWidthPt,
          request.layoutProfile.layoutProfileId,
        ]),
      }
    })
    rowTemplates[rowTemplateId] = { rowTemplateId, cells }
  })
  if (issues.length > 0) return blocked(issues)

  const fingerprint = JSON.stringify([
    request.definition.tableDefinitionId,
    request.definition.tableId,
    request.layoutProfile.layoutProfileId,
    roundPt(request.tableContentWidthPt),
    ...columns.flatMap((column) => [column.columnId, column.xOffsetPt, column.widthPt]),
    ...Object.values(rowTemplates).flatMap((template) => template.cells.map((cell) => cell.fingerprint)),
  ])
  return {
    source: VNEXT_TABLE_CELL_GEOMETRY_SOURCE,
    contractVersion: VNEXT_TABLE_CELL_GEOMETRY_VERSION,
    status: "ready",
    geometry: {
      tableDefinitionId: request.definition.tableDefinitionId,
      tableId: request.definition.tableId,
      layoutProfileId: request.layoutProfile.layoutProfileId,
      tableContentWidthPt: roundPt(request.tableContentWidthPt),
      columns,
      rowTemplates,
      fingerprint,
    },
    work: {
      columnCount: columns.length,
      rowTemplateCount: Object.keys(rowTemplates).length,
      cellCount,
    },
    execution: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
