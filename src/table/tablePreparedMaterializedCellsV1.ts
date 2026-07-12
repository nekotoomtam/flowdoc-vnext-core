import type { UnitValueV4Target } from "../schema/documentV4Foundation.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import type { VNextTableCellGeometryResultV1 } from "./tableCellGeometryV1.js"
import type { VNextTableTextFragmentEvidenceResultV1 } from "./tableTextFragmentEvidenceV1.js"
import {
  VNEXT_TABLE_PREPARED_CELL_SOURCE,
  VNEXT_TABLE_PREPARED_CELL_VERSION,
  type VNextTablePreparedCellCandidateV1,
  type VNextTablePreparedCellChildRangeV1,
  type VNextTablePreparedCellIssueV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedMaterializedCellsResultV1,
  type VNextTablePreparedMaterializedRowV1,
} from "./tablePreparedCellContractV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: UnitValueV4Target): number {
  return roundPt(value.unit === "pt" ? value.value : (value.value * 72) / 25.4)
}

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
  const imageBindingByPlacement = new Map(materialization.bindings.images.map((binding) => [
    binding.resolvedPlacementId,
    binding,
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
      const candidates: VNextTablePreparedCellCandidateV1[] = []
      const children: VNextTablePreparedCellChildRangeV1[] = []
      cell.childIds.forEach((nodeId, nodeIndex) => {
        visitedNodeCount += 1
        const node = cell.nodes[nodeId]
        const childPath = `materialization.rows[${rowIndex}].cells[${cellIndex}].childIds[${nodeIndex}]`
        if (node == null) {
          issues.push(issue("materialized-cell-node-missing", childPath, `cell node "${nodeId}" is missing`, nodeId))
          return
        }
        const candidateStartIndex = candidates.length
        let childHeightPt = 0
        let kind: VNextTablePreparedCellChildRangeV1["kind"]
        let fingerprint: string
        if (node.type === "text-block") {
          const source = textEvidence.fragmentSourcesByTextBlockId[node.id]
          if (source == null) {
            issues.push(issue(
              "missing-text-fragment-source", childPath,
              `text-block "${node.id}" requires accepted Table text fragment evidence`, node.id,
            ))
            return
          }
          if (
            source.rowInstanceId !== row.rowInstanceId
            || source.cellInstanceId !== cell.cellInstanceId
            || source.sourceCellId !== cell.sourceCellId
            || source.availableWidthPt !== cellGeometry.contentWidthPt
          ) {
            issues.push(issue(
              "text-fragment-context-mismatch", childPath,
              `text fragment source for "${node.id}" does not match row, cell, or content width`, node.id,
            ))
            return
          }
          source.candidates.forEach((candidate) => candidates.push({
            ...clone(candidate),
            candidateIndex: candidates.length,
            atomic: false,
          }))
          textLineCandidateCount += source.candidates.length
          childHeightPt = source.totalHeightPt
          kind = "text-block-lines"
          fingerprint = source.fingerprint
        } else if (node.type === "image") {
          const widthPt = unitToPt(node.props.frame.width)
          const heightPt = unitToPt(node.props.frame.height)
          if (widthPt > cellGeometry.contentWidthPt) issues.push(issue(
            "image-frame-exceeds-cell-width", childPath,
            `image "${node.id}" width ${widthPt} exceeds cell content width ${cellGeometry.contentWidthPt}`, node.id,
          ))
          const binding = node.source.kind === "image-field-ref" ? imageBindingByPlacement.get(node.id) : undefined
          if (node.source.kind === "image-field-ref" && binding == null) issues.push(issue(
            "missing-block-image-binding", childPath,
            `image field placement "${node.id}" requires a resolved materialized binding`, node.id,
          ))
          const assetId = node.source.kind === "asset-ref" ? node.source.assetId : binding?.assetId ?? null
          const assetOwner = node.source.kind === "asset-ref" ? "published-static-media" as const : binding?.assetOwner ?? "none"
          candidates.push({
            candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
            kind: "image", atomic: true, widthPt, heightPt, assetId, assetOwner, breakAfter: true,
          })
          atomicCandidateCount += 1
          childHeightPt = heightPt
          kind = "image"
          fingerprint = [node.id, "image", widthPt, heightPt, assetId ?? "empty", assetOwner].join(":")
        } else if (node.type === "divider") {
          const marginBeforePt = unitToPt(node.props.marginBefore)
          const thicknessPt = unitToPt(node.props.thickness)
          const marginAfterPt = unitToPt(node.props.marginAfter)
          const heightPt = roundPt(marginBeforePt + thicknessPt + marginAfterPt)
          candidates.push({
            candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
            kind: "divider", atomic: true, heightPt, marginBeforePt, thicknessPt, marginAfterPt, breakAfter: true,
          })
          atomicCandidateCount += 1
          childHeightPt = heightPt
          kind = "divider"
          fingerprint = [node.id, "divider", marginBeforePt, thicknessPt, marginAfterPt].join(":")
        } else if (node.type === "spacer") {
          const heightPt = roundPt(node.props.height)
          candidates.push({
            candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
            kind: "spacer", atomic: true, heightPt, breakAfter: true,
          })
          atomicCandidateCount += 1
          childHeightPt = heightPt
          kind = "spacer"
          fingerprint = [node.id, "spacer", heightPt].join(":")
        } else {
          issues.push(issue(
            "unsupported-table-cell-child", childPath,
            `${node.type} "${node.id}" has no prepared Table fragment contract`, node.id,
          ))
          return
        }
        children.push({
          nodeId: node.id,
          kind,
          candidateStartIndex,
          candidateEndIndexExclusive: candidates.length,
          heightPt: childHeightPt,
          fingerprint,
        })
      })

      let contentHeightPt = 0
      const prefixHeightsPt = [0]
      candidates.forEach((candidate, candidateIndex) => {
        candidate.candidateIndex = candidateIndex
        contentHeightPt = roundPt(contentHeightPt + candidate.heightPt)
        prefixHeightsPt.push(contentHeightPt)
      })
      const outerHeightPt = roundPt(cellGeometry.insetsPt.top + contentHeightPt + cellGeometry.insetsPt.bottom)
      preparedCells.push({
        sourceCellId: cell.sourceCellId,
        cellInstanceId: cell.cellInstanceId,
        columnStart: cellGeometry.columnStart,
        colSpan: cellGeometry.colSpan,
        xOffsetPt: cellGeometry.xOffsetPt,
        outerWidthPt: cellGeometry.outerWidthPt,
        contentWidthPt: cellGeometry.contentWidthPt,
        insetsPt: clone(cellGeometry.insetsPt),
        children,
        candidates,
        prefixHeightsPt,
        contentHeightPt,
        outerHeightPt,
        completeWhenEmpty: candidates.length === 0,
        fingerprint: [
          row.rowInstanceId,
          cell.cellInstanceId,
          cellGeometry.fingerprint,
          ...children.map((child) => child.fingerprint),
          ...prefixHeightsPt,
        ].join(":"),
      })
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
      fingerprint: [
        row.rowInstanceId,
        row.rowSourceId,
        row.rowTemplateId,
        row.itemKey,
        template.breakPolicy,
        template.minHeightPt ?? 0,
        ...preparedCells.map((cell) => cell.fingerprint),
      ].join(":"),
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
