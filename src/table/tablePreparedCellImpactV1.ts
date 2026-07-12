export const VNEXT_TABLE_PREPARED_CELL_IMPACT_VERSION = 1 as const
export const VNEXT_TABLE_PREPARED_CELL_IMPACT_SOURCE = "vnext-table-prepared-cell-impact"

export type VNextTablePreparedCellChangeKindV1 =
  | "item-value"
  | "document-value"
  | "source-content"
  | "cell-span"
  | "table-width"
  | "cell-insets"
  | "text-style"
  | "measurement-profile"
  | "image-frame"
  | "minimum-row-height"
  | "row-order"

export interface VNextTablePreparedCellAffectedRowV1 {
  rowKey: string
  sourceCellIds: string[]
}

export interface VNextTablePreparedCellImpactIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextTablePreparedCellImpactResultV1 =
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_IMPACT_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_IMPACT_VERSION
      status: "ready"
      tableId: string
      changeKind: VNextTablePreparedCellChangeKindV1
      scope: "table" | "rows" | "row-order-tail"
      affectedRows: VNextTablePreparedCellAffectedRowV1[]
      earliestAffectedRowIndex: number | null
      invalidationLanes: Array<"measurement" | "preparation" | "pagination" | "render">
      retainedFacts: {
        authoredIdentity: true
        resolvedIdentity: boolean
        preparedFingerprint: boolean
        measurementEvidence: boolean
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_IMPACT_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_IMPACT_VERSION
      status: "blocked"
      issues: VNextTablePreparedCellImpactIssueV1[]
    }

function issue(code: string, path: string, message: string): VNextTablePreparedCellImpactIssueV1 {
  return { code, path, message, severity: "error" }
}

export function createVNextTablePreparedCellImpactV1(input: {
  tableId: string
  changeKind: VNextTablePreparedCellChangeKindV1
  affectedRows?: readonly VNextTablePreparedCellAffectedRowV1[]
  earliestAffectedRowIndex?: number
}): VNextTablePreparedCellImpactResultV1 {
  const issues: VNextTablePreparedCellImpactIssueV1[] = []
  if (input.tableId.trim().length === 0) issues.push(issue(
    "missing-table-id", "tableId", "table id must not be blank",
  ))
  const rows = (input.affectedRows ?? []).map((row) => ({
    rowKey: row.rowKey,
    sourceCellIds: [...row.sourceCellIds],
  }))
  const rowKeys = new Set<string>()
  rows.forEach((row, rowIndex) => {
    if (row.rowKey.trim().length === 0) issues.push(issue(
      "missing-row-key", `affectedRows[${rowIndex}].rowKey`, "affected row key must not be blank",
    ))
    if (rowKeys.has(row.rowKey)) issues.push(issue(
      "duplicate-affected-row", `affectedRows[${rowIndex}].rowKey`, `affected row "${row.rowKey}" occurs more than once`,
    ))
    rowKeys.add(row.rowKey)
    const cellIds = new Set<string>()
    row.sourceCellIds.forEach((cellId, cellIndex) => {
      if (cellId.trim().length === 0) issues.push(issue(
        "missing-source-cell-id", `affectedRows[${rowIndex}].sourceCellIds[${cellIndex}]`, "source cell id must not be blank",
      ))
      if (cellIds.has(cellId)) issues.push(issue(
        "duplicate-affected-cell", `affectedRows[${rowIndex}].sourceCellIds[${cellIndex}]`,
        `source cell "${cellId}" occurs more than once in row "${row.rowKey}"`,
      ))
      cellIds.add(cellId)
    })
  })
  const tableWide = input.changeKind === "cell-span"
    || input.changeKind === "table-width"
    || input.changeKind === "cell-insets"
    || input.changeKind === "measurement-profile"
  const rowOrder = input.changeKind === "row-order"
  if (!tableWide && !rowOrder && rows.length === 0) issues.push(issue(
    "missing-affected-rows", "affectedRows", `${input.changeKind} change requires explicit affected row facts`,
  ))
  if (rowOrder && (!Number.isInteger(input.earliestAffectedRowIndex) || (input.earliestAffectedRowIndex ?? -1) < 0)) {
    issues.push(issue(
      "missing-earliest-affected-row", "earliestAffectedRowIndex",
      "row-order change requires a non-negative earliest affected row index",
    ))
  }
  if (!rowOrder && input.earliestAffectedRowIndex != null) issues.push(issue(
    "unexpected-earliest-affected-row", "earliestAffectedRowIndex",
    "earliest affected row index is reserved for row-order changes",
  ))
  if (issues.length > 0) return {
    source: VNEXT_TABLE_PREPARED_CELL_IMPACT_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_IMPACT_VERSION,
    status: "blocked",
    issues,
  }

  const paginationOnly = input.changeKind === "minimum-row-height" || rowOrder
  const invalidationLanes: Array<"measurement" | "preparation" | "pagination" | "render"> = paginationOnly
    ? ["pagination", "render"]
    : ["measurement", "preparation", "pagination", "render"]
  return {
    source: VNEXT_TABLE_PREPARED_CELL_IMPACT_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_IMPACT_VERSION,
    status: "ready",
    tableId: input.tableId,
    changeKind: input.changeKind,
    scope: rowOrder ? "row-order-tail" : tableWide ? "table" : "rows",
    affectedRows: rows,
    earliestAffectedRowIndex: rowOrder ? input.earliestAffectedRowIndex ?? null : null,
    invalidationLanes,
    retainedFacts: {
      authoredIdentity: true,
      resolvedIdentity: true,
      preparedFingerprint: paginationOnly,
      measurementEvidence: paginationOnly,
    },
    issues: [],
  }
}
