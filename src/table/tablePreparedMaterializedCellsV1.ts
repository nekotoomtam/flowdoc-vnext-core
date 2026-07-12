import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import type { VNextTableCellGeometryResultV1 } from "./tableCellGeometryV1.js"
import type { VNextTableTextFragmentEvidenceResultV1 } from "./tableTextFragmentEvidenceV1.js"
import {
  VNEXT_TABLE_PREPARED_CELL_SOURCE,
  VNEXT_TABLE_PREPARED_CELL_VERSION,
  type VNextTablePreparedCellIssueV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedMaterializedCellsResultV1,
  type VNextTablePreparedMaterializedRowV1,
} from "./tablePreparedCellContractV1.js"
import { createVNextTablePreparedCellFromContentV1 } from "./tablePreparedCellBuilderV1.js"

function issue(code: string, path: string, message: string, nodeId?: string): VNextTablePreparedCellIssueV1 {
  return { code, path, message, severity: "error", ...(nodeId == null ? {} : { nodeId }) }
}

function blocked(issues: VNextTablePreparedCellIssueV1[]): VNextTablePreparedMaterializedCellsResultV1 {
  return {
    source: VNEXT_TABLE_PREPARED_CELL_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_VERSION,
    status: "blocked",
    rows: null,
    issues,
  }
}

export function createVNextTablePreparedMaterializedCellsV1(input: {
  definition: VNextTableDefinitionV1
  materialization: VNextTableContentMaterializationResultV1
  geometry: VNextTableCellGeometryResultV1
  textEvidence: VNextTableTextFragmentEvidenceResultV1
}): VNextTablePreparedMaterializedCellsResultV1 {
  const issues: VNextTablePreparedCellIssueV1[] = []
  if (input.materialization.status !== "materialized") issues.push(issue(
    "content-not-materialized", "materialization.status", "Table content materialization must be ready",
  ))
  if (input.geometry.status !== "ready") issues.push(issue(
    "cell-geometry-not-ready", "geometry.status", "Table cell geometry must be ready",
  ))
  if (input.textEvidence.status !== "ready") issues.push(issue(
    "text-fragment-evidence-not-ready", "textEvidence.status", "Table text fragment evidence must be ready",
  ))
  if (issues.length > 0 || input.materialization.status !== "materialized"
    || input.geometry.status !== "ready" || input.textEvidence.status !== "ready") return blocked(issues)

  const materialization = input.materialization
  const geometry = input.geometry
  const textEvidence = input.textEvidence
  if (
    materialization.tableId !== input.definition.tableId
    || materialization.tableDefinitionId !== input.definition.tableDefinitionId
  ) issues.push(issue(
    "materialization-definition-mismatch", "materialization", "materialization must match the exact Table Definition",
  ))
  if (
    geometry.geometry.tableId !== input.definition.tableId
    || geometry.geometry.tableDefinitionId !== input.definition.tableDefinitionId
  ) issues.push(issue(
    "geometry-definition-mismatch", "geometry.geometry", "geometry must match the exact Table Definition",
  ))
  if (
    textEvidence.documentId !== materialization.documentId
    || textEvidence.instanceRevision !== materialization.instanceRevision
    || textEvidence.tableId !== materialization.tableId
    || textEvidence.tableDefinitionId !== materialization.tableDefinitionId
    || textEvidence.geometryFingerprint !== geometry.geometry.fingerprint
  ) issues.push(issue(
    "text-evidence-scope-mismatch",
    "textEvidence",
    "text evidence must match the exact materialization instance and geometry fingerprint",
  ))
  const imageBindingsByPlacementId = Object.fromEntries(materialization.bindings.images.map((binding) => [
    binding.resolvedPlacementId,
    { assetId: binding.assetId, assetOwner: binding.assetOwner },
  ]))
  if (issues.length > 0) return blocked(issues)

  let authoredReferenceRowsPending = 0
  let preparedCellCount = 0
  let visitedNodeCount = 0
  let textLineCandidateCount = 0
  let atomicCandidateCount = 0
  const rows: VNextTablePreparedMaterializedRowV1[] = []
  materialization.rows.forEach((row, rowIndex) => {
    if (row.kind === "authored-content-reference") {
      authoredReferenceRowsPending += 1
      return
    }
    const template = input.definition.rowTemplates[row.rowTemplateId]
    const templateGeometry = geometry.geometry.rowTemplates[row.rowTemplateId]
    if (template == null || templateGeometry == null) {
      issues.push(issue(
        "missing-row-template-preparation-input",
        `materialization.rows[${rowIndex}].rowTemplateId`,
        `row template "${row.rowTemplateId}" is missing from definition or geometry`,
      ))
      return
    }
    const preparedCells: VNextTablePreparedCellV1[] = []
    row.cells.forEach((cell, cellIndex) => {
      const cellGeometry = templateGeometry.cells.find((candidate) => candidate.sourceCellId === cell.sourceCellId)
      if (cellGeometry == null) {
        issues.push(issue(
          "missing-cell-geometry",
          `materialization.rows[${rowIndex}].cells[${cellIndex}].sourceCellId`,
          `cell geometry is missing for "${cell.sourceCellId}"`,
        ))
        return
      }
      const prepared = createVNextTablePreparedCellFromContentV1({
        sourceCellId: cell.sourceCellId,
        rowIdentity: { kind: "resolved-row", rowInstanceId: row.rowInstanceId },
        cellIdentity: { kind: "resolved-cell", cellInstanceId: cell.cellInstanceId },
        verticalAlign: cell.verticalAlign,
        childIds: cell.childIds,
        nodes: cell.nodes,
        geometry: cellGeometry,
        textSourcesByNodeId: textEvidence.fragmentSourcesByTextBlockId,
        imageBindingsByPlacementId,
        path: `materialization.rows[${rowIndex}].cells[${cellIndex}]`,
      })
      visitedNodeCount += prepared.work.visitedNodeCount
      textLineCandidateCount += prepared.work.textLineCandidateCount
      atomicCandidateCount += prepared.work.atomicCandidateCount
      if (prepared.status === "blocked") issues.push(...prepared.issues)
      else preparedCells.push(prepared.cell)
      preparedCellCount += 1
    })
    const maximumCellOuterHeightPt = preparedCells.reduce((maximum, cell) => Math.max(maximum, cell.outerHeightPt), 0)
    rows.push({
      kind: "prepared-materialized-row",
      rowIndex,
      rowInstanceId: row.rowInstanceId,
      rowSourceId: row.rowSourceId,
      rowTemplateId: row.rowTemplateId,
      itemKey: row.itemKey,
      breakPolicy: template.breakPolicy,
      minimumFirstFragmentHeightPt: template.minHeightPt ?? 0,
      cells: preparedCells,
      maximumCellOuterHeightPt,
      fingerprint: JSON.stringify([
        row.rowInstanceId,
        row.rowSourceId,
        row.rowTemplateId,
        row.itemKey,
        template.breakPolicy,
        template.minHeightPt ?? 0,
        ...preparedCells.map((cell) => cell.fingerprint),
      ]),
    })
  })
  if (issues.length > 0) return blocked(issues)

  return {
    source: VNEXT_TABLE_PREPARED_CELL_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_VERSION,
    status: "ready",
    documentId: materialization.documentId,
    instanceRevision: materialization.instanceRevision,
    tableId: materialization.tableId,
    tableDefinitionId: materialization.tableDefinitionId,
    geometryFingerprint: geometry.geometry.fingerprint,
    rows,
    authoredReferenceRowsPending,
    work: {
      inputRowCount: materialization.rows.length,
      preparedRowCount: rows.length,
      preparedCellCount,
      visitedNodeCount,
      textLineCandidateCount,
      atomicCandidateCount,
      candidateCount: textLineCandidateCount + atomicCandidateCount,
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
