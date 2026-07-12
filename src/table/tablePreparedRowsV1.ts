import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import {
  VNEXT_TABLE_PREPARED_CELL_SOURCE,
  VNEXT_TABLE_PREPARED_CELL_VERSION,
  type VNextTablePreparedAuthoredCellsResultV1,
  type VNextTablePreparedCellIssueV1,
  type VNextTablePreparedMaterializedCellsResultV1,
  type VNextTablePreparedRowV1,
  type VNextTablePreparedRowsResultV1,
} from "./tablePreparedCellContractV1.js"

function issue(code: string, path: string, message: string): VNextTablePreparedCellIssueV1 {
  return { code, path, message, severity: "error" }
}

function blocked(issues: VNextTablePreparedCellIssueV1[]): VNextTablePreparedRowsResultV1 {
  return {
    source: VNEXT_TABLE_PREPARED_CELL_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_VERSION,
    status: "blocked",
    rows: null,
    issues,
  }
}

export function createVNextTablePreparedRowsV1(input: {
  materialization: VNextTableContentMaterializationResultV1
  materializedCells: VNextTablePreparedMaterializedCellsResultV1
  authoredCells: VNextTablePreparedAuthoredCellsResultV1
}): VNextTablePreparedRowsResultV1 {
  const issues: VNextTablePreparedCellIssueV1[] = []
  if (input.materialization.status !== "materialized") issues.push(issue(
    "content-not-materialized", "materialization.status", "Table content materialization must be ready",
  ))
  if (input.materializedCells.status !== "ready") issues.push(issue(
    "materialized-cells-not-ready", "materializedCells.status", "materialized Table cells must be prepared",
  ))
  if (input.authoredCells.status !== "ready") issues.push(issue(
    "authored-cells-not-ready", "authoredCells.status", "authored Table cells must be prepared",
  ))
  if (issues.length > 0 || input.materialization.status !== "materialized"
    || input.materializedCells.status !== "ready" || input.authoredCells.status !== "ready") return blocked(issues)
  const materialization = input.materialization
  const materializedCells = input.materializedCells
  const authoredCells = input.authoredCells
  const scopeFacts = [
    materializedCells.documentId === materialization.documentId,
    authoredCells.documentId === materialization.documentId,
    materializedCells.instanceRevision === materialization.instanceRevision,
    authoredCells.instanceRevision === materialization.instanceRevision,
    materializedCells.tableId === materialization.tableId,
    authoredCells.tableId === materialization.tableId,
    materializedCells.tableDefinitionId === materialization.tableDefinitionId,
    authoredCells.tableDefinitionId === materialization.tableDefinitionId,
    materializedCells.geometryFingerprint === authoredCells.geometryFingerprint,
  ]
  if (scopeFacts.some((fact) => !fact)) issues.push(issue(
    "prepared-row-scope-mismatch",
    "materializedCells",
    "authored and materialized prepared cells must share exact document, Table, revision, and geometry scope",
  ))
  const rowByIndex = new Map<number, VNextTablePreparedRowV1>()
  ;[...authoredCells.rows, ...materializedCells.rows].forEach((row) => {
    if (rowByIndex.has(row.rowIndex)) issues.push(issue(
      "duplicate-prepared-row-index", `rows[${row.rowIndex}]`, `prepared row index ${row.rowIndex} occurs more than once`,
    ))
    rowByIndex.set(row.rowIndex, row)
  })
  materialization.rows.forEach((sourceRow, rowIndex) => {
    const prepared = rowByIndex.get(rowIndex)
    if (prepared == null) {
      issues.push(issue("missing-prepared-row", `rows[${rowIndex}]`, `prepared row ${rowIndex} is missing`))
      return
    }
    if (
      (sourceRow.kind === "materialized-content" && prepared.kind !== "prepared-materialized-row")
      || (sourceRow.kind === "authored-content-reference" && prepared.kind !== "prepared-authored-row")
    ) issues.push(issue(
      "prepared-row-kind-mismatch", `rows[${rowIndex}]`, `prepared row ${rowIndex} does not match materialization row kind`,
    ))
  })
  if ([...rowByIndex.keys()].some((rowIndex) => rowIndex < 0 || rowIndex >= materialization.rows.length)) issues.push(issue(
    "unexpected-prepared-row", "rows", "prepared row set contains indexes outside the materialized row stream",
  ))
  if (issues.length > 0) return blocked(issues)
  const rows = [...rowByIndex.entries()].sort(([left], [right]) => left - right).map(([, row]) => row)
  const cellCount = rows.reduce((total, row) => total + row.cells.length, 0)
  const candidateCount = rows.reduce(
    (total, row) => total + row.cells.reduce((cellTotal, cell) => cellTotal + cell.candidates.length, 0),
    0,
  )
  return {
    source: VNEXT_TABLE_PREPARED_CELL_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_VERSION,
    status: "ready",
    documentId: materialization.documentId,
    instanceRevision: materialization.instanceRevision,
    tableId: materialization.tableId,
    tableDefinitionId: materialization.tableDefinitionId,
    geometryFingerprint: materializedCells.geometryFingerprint,
    rows,
    fingerprint: JSON.stringify([
      materialization.documentId,
      materialization.instanceRevision,
      materialization.tableId,
      materialization.tableDefinitionId,
      materializedCells.geometryFingerprint,
      ...rows.map((row) => row.fingerprint),
    ]),
    work: {
      rowCount: rows.length,
      authoredRowCount: authoredCells.rows.length,
      materializedRowCount: materializedCells.rows.length,
      cellCount,
      candidateCount,
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
