import type { VNextResolvedDocumentV1 } from "../resolution/resolvedDocument.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import type { VNextTableCellGeometryResultV1 } from "./tableCellGeometryV1.js"
import type { VNextTableTextFragmentEvidenceResultV1 } from "./tableTextFragmentEvidenceV1.js"
import { findVNextTableAuthoredRowDescriptorsV1 } from "./tableAuthoredTextMeasurementPreparationV1.js"
import { createVNextTablePreparedCellFromContentV1 } from "./tablePreparedCellBuilderV1.js"
import {
  VNEXT_TABLE_PREPARED_CELL_SOURCE,
  VNEXT_TABLE_PREPARED_CELL_VERSION,
  type VNextTablePreparedAuthoredCellsResultV1,
  type VNextTablePreparedAuthoredRowV1,
  type VNextTablePreparedCellIssueV1,
  type VNextTablePreparedCellV1,
} from "./tablePreparedCellContractV1.js"

function issue(code: string, path: string, message: string, nodeId?: string): VNextTablePreparedCellIssueV1 {
  return { code, path, message, severity: "error", ...(nodeId == null ? {} : { nodeId }) }
}

function blocked(issues: VNextTablePreparedCellIssueV1[]): VNextTablePreparedAuthoredCellsResultV1 {
  return {
    source: VNEXT_TABLE_PREPARED_CELL_SOURCE,
    contractVersion: VNEXT_TABLE_PREPARED_CELL_VERSION,
    status: "blocked",
    rows: null,
    issues,
  }
}

export function createVNextTablePreparedAuthoredCellsV1(input: {
  definition: VNextTableDefinitionV1
  materialization: VNextTableContentMaterializationResultV1
  geometry: VNextTableCellGeometryResultV1
  resolvedDocument: VNextResolvedDocumentV1
  textEvidence: VNextTableTextFragmentEvidenceResultV1
}): VNextTablePreparedAuthoredCellsResultV1 {
  const issues: VNextTablePreparedCellIssueV1[] = []
  if (input.materialization.status !== "materialized") issues.push(issue(
    "content-not-materialized", "materialization.status", "Table content materialization must be ready",
  ))
  if (input.geometry.status !== "ready") issues.push(issue(
    "cell-geometry-not-ready", "geometry.status", "Table cell geometry must be ready",
  ))
  if (input.textEvidence.status !== "ready") issues.push(issue(
    "text-fragment-evidence-not-ready", "textEvidence.status", "authored Table text evidence must be ready",
  ))
  if (issues.length > 0 || input.materialization.status !== "materialized"
    || input.geometry.status !== "ready" || input.textEvidence.status !== "ready") return blocked(issues)
  const materialization = input.materialization
  const geometry = input.geometry
  const textEvidence = input.textEvidence
  if (
    input.resolvedDocument.instanceId !== materialization.documentId
    || input.resolvedDocument.instanceRevision !== materialization.instanceRevision
    || textEvidence.documentId !== materialization.documentId
    || textEvidence.instanceRevision !== materialization.instanceRevision
    || textEvidence.tableId !== materialization.tableId
    || textEvidence.tableDefinitionId !== materialization.tableDefinitionId
    || textEvidence.geometryFingerprint !== geometry.geometry.fingerprint
  ) issues.push(issue(
    "authored-preparation-scope-mismatch",
    "resolvedDocument",
    "authored document, text evidence, materialization, and geometry must share exact scope",
  ))
  const sections = input.resolvedDocument.document.document.sections.filter(
    (section) => section.nodes[input.definition.tableId]?.type === "table",
  )
  if (sections.length !== 1) issues.push(issue(
    "table-section-not-unique", "definition.tableId", "resolved document must contain the Table in exactly one section",
  ))
  if (issues.length > 0 || sections.length !== 1) return blocked(issues)
  const section = sections[0]
  const imageBindingsByPlacementId = Object.fromEntries(input.resolvedDocument.bindings.images.map((binding) => [
    binding.placementId,
    { assetId: binding.assetId, assetOwner: binding.assetOwner },
  ]))

  let preparedCellCount = 0
  let visitedNodeCount = 0
  let textLineCandidateCount = 0
  let atomicCandidateCount = 0
  const rows: VNextTablePreparedAuthoredRowV1[] = []
  materialization.rows.forEach((row, rowIndex) => {
    if (row.kind !== "authored-content-reference") return
    const descriptors = findVNextTableAuthoredRowDescriptorsV1(input.definition, row.sourceRowId)
    if (descriptors.length !== 1) {
      issues.push(issue(
        "authored-row-source-ambiguous",
        `materialization.rows[${rowIndex}].sourceRowId`,
        `authored row "${row.sourceRowId}" must map to exactly one row source`,
      ))
      return
    }
    const descriptor = descriptors[0]
    const template = input.definition.rowTemplates[descriptor.rowTemplateId]
    const templateGeometry = geometry.geometry.rowTemplates[descriptor.rowTemplateId]
    const sourceRow = section.nodes[row.sourceRowId]
    if (template == null || templateGeometry == null || sourceRow?.type !== "table-row") {
      issues.push(issue(
        "authored-row-preparation-input-missing",
        `materialization.rows[${rowIndex}]`,
        `authored row "${row.sourceRowId}" is missing definition, geometry, or source graph input`,
      ))
      return
    }
    const cells: VNextTablePreparedCellV1[] = []
    row.cells.forEach((cell, cellIndex) => {
      const sourceCell = section.nodes[cell.sourceCellId]
      const cellGeometry = templateGeometry.cells.find((candidate) => candidate.sourceCellId === cell.sourceCellId)
      if (sourceCell?.type !== "table-cell" || cellGeometry == null || !sourceRow.cellIds.includes(cell.sourceCellId)) {
        issues.push(issue(
          "authored-cell-preparation-mismatch",
          `materialization.rows[${rowIndex}].cells[${cellIndex}]`,
          `authored cell "${cell.sourceCellId}" is missing from source graph or geometry`,
        ))
        return
      }
      const prepared = createVNextTablePreparedCellFromContentV1({
        sourceCellId: cell.sourceCellId,
        rowIdentity: { kind: "authored-row", sourceRowId: row.sourceRowId },
        cellIdentity: { kind: "authored-cell", sourceCellId: cell.sourceCellId },
        childIds: cell.childIds,
        nodes: section.nodes,
        geometry: cellGeometry,
        textSourcesByNodeId: textEvidence.fragmentSourcesByTextBlockId,
        imageBindingsByPlacementId,
        path: `materialization.rows[${rowIndex}].cells[${cellIndex}]`,
      })
      preparedCellCount += 1
      visitedNodeCount += prepared.work.visitedNodeCount
      textLineCandidateCount += prepared.work.textLineCandidateCount
      atomicCandidateCount += prepared.work.atomicCandidateCount
      if (prepared.status === "blocked") issues.push(...prepared.issues)
      else cells.push(prepared.cell)
    })
    const maximumCellOuterHeightPt = cells.reduce((maximum, cell) => Math.max(maximum, cell.outerHeightPt), 0)
    rows.push({
      kind: "prepared-authored-row",
      rowIndex,
      sourceRowId: row.sourceRowId,
      rowSourceId: descriptor.rowSourceId,
      rowTemplateId: descriptor.rowTemplateId,
      role: descriptor.role,
      breakPolicy: template.breakPolicy,
      minimumFirstFragmentHeightPt: template.minHeightPt ?? 0,
      cells,
      maximumCellOuterHeightPt,
      fingerprint: JSON.stringify([
        row.sourceRowId,
        descriptor.rowSourceId,
        descriptor.rowTemplateId,
        descriptor.role,
        template.breakPolicy,
        template.minHeightPt ?? 0,
        ...cells.map((cell) => cell.fingerprint),
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
