import type { VNextResolvedDocumentV1 } from "../resolution/resolvedDocument.js"
import { createVNextTextBlockV4MeasurementRequestFromResolvedNode } from "../pagination/textBlockV4Measurement.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import type { VNextTableCellGeometryResultV1 } from "./tableCellGeometryV1.js"
import {
  VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE,
  VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION,
  type VNextTableTextMeasurementPreparationIssueV1,
  type VNextTableTextMeasurementPreparationResultV1,
  type VNextTableTextMeasurementRequestContextV1,
} from "./tableTextMeasurementPreparationV1.js"

function issue(
  code: string,
  path: string,
  message: string,
  textBlockId?: string,
): VNextTableTextMeasurementPreparationIssueV1 {
  return { code, path, message, severity: "error", ...(textBlockId == null ? {} : { textBlockId }) }
}

function blocked(issues: VNextTableTextMeasurementPreparationIssueV1[]): VNextTableTextMeasurementPreparationResultV1 {
  return {
    source: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION,
    status: "blocked",
    requestsByTextBlockId: null,
    issues,
  }
}

export function findVNextTableAuthoredRowDescriptorsV1(definition: VNextTableDefinitionV1, sourceRowId: string) {
  const matches: Array<{
    rowSourceId: string
    rowTemplateId: string
    role: "header" | "body" | "footer" | "empty-state"
  }> = []
  definition.rowSources.forEach((source) => {
    if (source.kind === "static-row") {
      if (definition.rowTemplates[source.rowTemplateId]?.sourceRowId === sourceRowId) matches.push({
        rowSourceId: source.rowSourceId,
        rowTemplateId: source.rowTemplateId,
        role: source.role,
      })
      return
    }
    if (source.emptyPolicy.kind !== "empty-row") return
    const rowTemplateId = source.emptyPolicy.rowTemplateId
    if (definition.rowTemplates[rowTemplateId]?.sourceRowId === sourceRowId) matches.push({
      rowSourceId: source.rowSourceId,
      rowTemplateId,
      role: "empty-state",
    })
  })
  return matches
}

export function createVNextTableAuthoredTextMeasurementPreparationV1(input: {
  definition: VNextTableDefinitionV1
  materialization: VNextTableContentMaterializationResultV1
  geometry: VNextTableCellGeometryResultV1
  resolvedDocument: VNextResolvedDocumentV1
  measurementProfileId: string
}): VNextTableTextMeasurementPreparationResultV1 {
  const issues: VNextTableTextMeasurementPreparationIssueV1[] = []
  if (input.materialization.status !== "materialized") issues.push(issue(
    "content-not-materialized", "materialization.status", "Table content must be materialized before authored measurement preparation",
  ))
  if (input.geometry.status !== "ready") issues.push(issue(
    "cell-geometry-not-ready", "geometry.status", "Table cell geometry must be ready before authored measurement preparation",
  ))
  if (input.measurementProfileId.trim().length === 0) issues.push(issue(
    "missing-measurement-profile", "measurementProfileId", "measurement profile id must not be blank",
  ))
  if (issues.length > 0 || input.materialization.status !== "materialized" || input.geometry.status !== "ready") {
    return blocked(issues)
  }
  const materialization = input.materialization
  const geometry = input.geometry
  if (
    input.resolvedDocument.instanceId !== materialization.documentId
    || input.resolvedDocument.instanceRevision !== materialization.instanceRevision
    || input.resolvedDocument.document.document.id !== materialization.documentId
  ) issues.push(issue(
    "resolved-document-scope-mismatch",
    "resolvedDocument",
    "authored measurement must use the exact materialized document instance and revision",
  ))
  if (
    materialization.tableId !== input.definition.tableId
    || materialization.tableDefinitionId !== input.definition.tableDefinitionId
    || geometry.geometry.tableId !== input.definition.tableId
    || geometry.geometry.tableDefinitionId !== input.definition.tableDefinitionId
  ) issues.push(issue(
    "table-preparation-scope-mismatch",
    "definition",
    "definition, materialization, and geometry must target the same Table",
  ))
  if (
    input.definition.owner.kind === "published-structure-version"
    && input.resolvedDocument.structureVersionId !== input.definition.owner.ref.structureVersionId
  ) issues.push(issue(
    "resolved-document-structure-version-mismatch",
    "resolvedDocument.structureVersionId",
    "resolved document must use the Table Definition Published Structure Version",
  ))
  const sections = input.resolvedDocument.document.document.sections.filter(
    (section) => section.nodes[input.definition.tableId]?.type === "table",
  )
  if (sections.length !== 1) issues.push(issue(
    "table-section-not-unique", "definition.tableId", "resolved document must contain the Table in exactly one section",
  ))
  if (issues.length > 0 || sections.length !== 1) return blocked(issues)
  const section = sections[0]
  const textBindings = Object.fromEntries(input.resolvedDocument.bindings.fields.map((binding) => [
    binding.inlineId,
    { fieldKey: binding.fieldKey, value: binding.value },
  ]))
  const imageBindings = Object.fromEntries(input.resolvedDocument.bindings.images.map((binding) => [
    binding.placementId,
    { assetId: binding.assetId },
  ]))
  const styleByTextBlockId = new Map(input.resolvedDocument.bindings.styles.map((binding) => [
    binding.textBlockId,
    binding.styleKey,
  ]))

  const requestsByTextBlockId: Record<string, VNextTableTextMeasurementRequestContextV1> = {}
  let authoredReferenceRowCount = 0
  let cellCount = 0
  let visitedNodeCount = 0
  materialization.rows.forEach((row, rowIndex) => {
    if (row.kind !== "authored-content-reference") return
    authoredReferenceRowCount += 1
    const descriptors = findVNextTableAuthoredRowDescriptorsV1(input.definition, row.sourceRowId)
    if (descriptors.length !== 1) {
      issues.push(issue(
        "authored-row-source-ambiguous",
        `materialization.rows[${rowIndex}].sourceRowId`,
        `authored row "${row.sourceRowId}" must map to exactly one static or empty-state row source`,
      ))
      return
    }
    const descriptor = descriptors[0]
    const templateGeometry = geometry.geometry.rowTemplates[descriptor.rowTemplateId]
    if (templateGeometry == null) {
      issues.push(issue(
        "missing-row-template-geometry",
        `geometry.geometry.rowTemplates.${descriptor.rowTemplateId}`,
        `geometry is missing authored row template "${descriptor.rowTemplateId}"`,
      ))
      return
    }
    const sourceRow = section.nodes[row.sourceRowId]
    if (sourceRow?.type !== "table-row") {
      issues.push(issue(
        "authored-source-row-missing", `materialization.rows[${rowIndex}].sourceRowId`,
        `authored source row "${row.sourceRowId}" is missing`,
      ))
      return
    }
    row.cells.forEach((cell, cellIndex) => {
      cellCount += 1
      const sourceCell = section.nodes[cell.sourceCellId]
      const cellGeometry = templateGeometry.cells.find((candidate) => candidate.sourceCellId === cell.sourceCellId)
      if (sourceCell?.type !== "table-cell" || !sourceRow.cellIds.includes(cell.sourceCellId) || cellGeometry == null) {
        issues.push(issue(
          "authored-cell-preparation-mismatch",
          `materialization.rows[${rowIndex}].cells[${cellIndex}]`,
          `authored cell "${cell.sourceCellId}" is missing from its row or geometry`,
        ))
        return
      }
      if (JSON.stringify(sourceCell.childIds) !== JSON.stringify(cell.childIds)) issues.push(issue(
        "authored-cell-child-order-drift",
        `materialization.rows[${rowIndex}].cells[${cellIndex}].childIds`,
        `authored cell "${cell.sourceCellId}" child order drifted after materialization`,
      ))
      sourceCell.childIds.forEach((nodeId, nodeIndex) => {
        visitedNodeCount += 1
        const node = section.nodes[nodeId]
        if (node == null) issues.push(issue(
          "authored-cell-node-missing",
          `materialization.rows[${rowIndex}].cells[${cellIndex}].childIds[${nodeIndex}]`,
          `authored cell node "${nodeId}" is missing`,
        ))
        if (node?.type !== "text-block") return
        if (requestsByTextBlockId[node.id] != null) {
          issues.push(issue(
            "duplicate-authored-text-block", `resolvedDocument.document.${node.id}`,
            `authored text-block "${node.id}" occurs more than once`, node.id,
          ))
          return
        }
        const request = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
          documentId: input.resolvedDocument.instanceId,
          instanceRevision: input.resolvedDocument.instanceRevision,
          sectionId: section.id,
          textBlock: node,
          availableWidthPt: cellGeometry.contentWidthPt,
          measurementProfileId: input.measurementProfileId,
          styleKey: styleByTextBlockId.get(node.id) ?? "default",
          resolvedTextByInlineId: textBindings,
          resolvedImageByPlacementId: imageBindings,
        })
        if (request.status === "blocked") {
          issues.push(...request.issues.map((item) => issue(
            item.code,
            `materialization.rows[${rowIndex}].cells[${cellIndex}].${item.path}`,
            item.message,
            node.id,
          )))
          return
        }
        requestsByTextBlockId[node.id] = {
          rowIndex,
          rowIdentity: { kind: "authored-row", sourceRowId: row.sourceRowId },
          rowTemplateId: descriptor.rowTemplateId,
          sourceCellId: cell.sourceCellId,
          cellIdentity: { kind: "authored-cell", sourceCellId: cell.sourceCellId },
          textBlockId: node.id,
          request: request.request,
        }
      })
    })
  })
  if (issues.length > 0) return blocked(issues)
  return {
    source: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION,
    status: "ready",
    documentId: materialization.documentId,
    instanceRevision: materialization.instanceRevision,
    tableId: materialization.tableId,
    tableDefinitionId: materialization.tableDefinitionId,
    geometryFingerprint: geometry.geometry.fingerprint,
    measurementProfileId: input.measurementProfileId,
    requestsByTextBlockId,
    work: {
      rowCount: materialization.rows.length,
      materializedRowCount: 0,
      authoredReferenceRowCount,
      cellCount,
      visitedNodeCount,
      textMeasurementRequestCount: Object.keys(requestsByTextBlockId).length,
    },
    execution: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
